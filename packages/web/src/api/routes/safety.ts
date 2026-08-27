import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { and, desc, eq, gte } from "drizzle-orm";
import { ensureSeed } from "../lib/seed";
import { scoreFatigue } from "./eld";

/**
 * Driver safety scoring — server-side, computed only from rows that exist.
 *
 * DriverScorecardPage.jsx shipped with five hard-coded drivers ("Ray Davis 96",
 * "John Miller 78") and a "LIVE SCORING" pulse next to them. Nothing was live
 * and no scoring engine existed anywhere in the codebase. This is that engine.
 *
 * Rules that are not negotiable here:
 *  - Every component returns null when its source table has no rows for the
 *    driver in the window. A missing component is reported as missing, never
 *    defaulted to 100 (which flatters) or 0 (which slanders).
 *  - The composite score is produced only when at least MIN_COMPONENTS of the
 *    five components have real data. Otherwise score is null and
 *    insufficientData is true.
 *  - `accidentRisk` is always null. Predicting a crash needs a crash-outcome
 *    dataset the platform does not have and cannot fake.
 *  - Fatigue comes from scoreFatigue() in routes/eld.ts, which needs 10
 *    telemetry samples. eld_telemetry is currently empty, so fatigue is
 *    normally reported missing — that is the honest answer, not a bug.
 */

const WINDOW_DAYS = 30;
const MIN_COMPONENTS = 2;

/** Component weights. Renormalized across whichever components have data. */
export const SAFETY_WEIGHTS = {
  speeding: 30,
  hos: 25,
  violations: 20,
  dvir: 15,
  fatigue: 10,
} as const;

export type SafetyComponentKey = keyof typeof SAFETY_WEIGHTS;

export const SAFETY_GRADES = [
  { min: 95, grade: "platinum", label: "Platinum" },
  { min: 85, grade: "gold", label: "Gold" },
  { min: 75, grade: "silver", label: "Silver" },
  { min: 60, grade: "needs_work", label: "Needs Work" },
  { min: 0, grade: "at_risk", label: "At Risk" },
] as const;

export function gradeFor(score: number) {
  return SAFETY_GRADES.find((g) => score >= g.min) ?? SAFETY_GRADES[SAFETY_GRADES.length - 1];
}

export function severityForOverBy(overBy: number) {
  if (overBy >= 15) return "severe";
  if (overBy >= 10) return "moderate";
  return "minor";
}

const rid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const clamp100 = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

type Component = { score: number | null; note: string; detail: Record<string, unknown> };
const missing = (note: string, detail: Record<string, unknown> = {}): Component => ({ score: null, note, detail });

/**
 * Miles driven in the window, from ELD odometer readings. Returns null when
 * there is no telemetry — rate-per-100-miles metrics are meaningless without it
 * and are reported missing rather than computed against a guessed mileage.
 */
function milesFromTelemetry(rows: (typeof schema.eldTelemetry.$inferSelect)[]) {
  const odos = rows.map((r) => r.odometer ?? 0).filter((v) => v > 0).sort((a, b) => a - b);
  if (odos.length < 2) return null;
  return Number((odos[odos.length - 1] - odos[0]).toFixed(1));
}

/** Speeding: severity-weighted events per 100 miles. */
function speedingComponent(events: (typeof schema.speedingEvents.$inferSelect)[], miles: number | null): Component {
  if (miles === null) {
    return missing(
      "No ELD odometer data in the window, so speeding cannot be normalized per 100 miles. Raw event count is shown instead of a score.",
      { events: events.length, milesObserved: null },
    );
  }
  if (miles < 50) {
    return missing(`Only ${miles} miles of telemetry in the window — under the 50-mile floor for a rate.`, { events: events.length, milesObserved: miles });
  }
  const weight = { minor: 1, moderate: 2.5, severe: 5 } as const;
  const weighted = events.reduce((sum, e) => sum + (weight[e.severity as keyof typeof weight] ?? 1), 0);
  const per100 = weighted / (miles / 100);
  // 0 weighted events = 100. ~4 weighted events per 100 mi = 0.
  return {
    score: clamp100(100 - per100 * 25),
    note: "Severity-weighted speeding events per 100 miles of recorded telemetry (severe 15+ mph over counts 5x a minor).",
    detail: {
      events: events.length,
      severe: events.filter((e) => e.severity === "severe").length,
      moderate: events.filter((e) => e.severity === "moderate").length,
      minor: events.filter((e) => e.severity === "minor").length,
      milesObserved: miles,
      weightedPer100Miles: Number(per100.toFixed(2)),
    },
  };
}

/**
 * HOS: share of driving days inside the 49 CFR 395 limits, from hos_logs.
 * Deductions come from actual recorded overages, not from a compliance guess.
 */
function hosComponent(logs: (typeof schema.hosLogs.$inferSelect)[]): Component {
  if (logs.length === 0) return missing("No HOS logs recorded in the window.", { logs: 0 });
  const byDay = new Map<string, number>();
  const onDutyByDay = new Map<string, number>();
  // A day with a still-open log is not over yet, so it cannot be graded. Those
  // days are excluded rather than flagged — an in-progress shift is not a
  // violation, and counting an open log up to "now" invents hours.
  const openDays = new Set<string>();
  for (const l of logs) {
    const day = new Date(+l.startedAt).toISOString().slice(0, 10);
    if (!l.endedAt) { openDays.add(day); continue; }
    const hours = Math.max(0, (+l.endedAt - +l.startedAt) / 3_600_000);
    if (l.status === "driving") byDay.set(day, (byDay.get(day) ?? 0) + hours);
    if (l.status === "driving" || l.status === "on_duty") onDutyByDay.set(day, (onDutyByDay.get(day) ?? 0) + hours);
  }
  for (const d of openDays) { byDay.delete(d); onDutyByDay.delete(d); }
  const days = [...new Set([...byDay.keys(), ...onDutyByDay.keys()])];
  if (days.length === 0) {
    return missing(
      openDays.size
        ? `Every logged day in the window still has an open duty status (${openDays.size}). A shift that has not ended cannot be graded, so no HOS score is produced.`
        : "HOS logs exist but none fall on a completed driving or on-duty day.",
      { logs: logs.length, openDays: openDays.size },
    );
  }
  let overDriving = 0;
  let overWindow = 0;
  for (const d of days) {
    if ((byDay.get(d) ?? 0) > 11) overDriving++;
    if ((onDutyByDay.get(d) ?? 0) > 14) overWindow++;
  }
  const cleanDays = days.length - new Set([...days.filter((d) => (byDay.get(d) ?? 0) > 11), ...days.filter((d) => (onDutyByDay.get(d) ?? 0) > 14)]).size;
  return {
    score: clamp100((cleanDays / days.length) * 100),
    note: "Share of logged days with driving under 11 h and the on-duty window under 14 h. Coaching signal only — the ELD log of record governs.",
    detail: { daysLogged: days.length, daysSkippedStillOpen: openDays.size, cleanDays, drivingOverages: overDriving, windowOverages: overWindow, limits: { drivingHours: 11, onDutyWindowHours: 14 } },
  };
}

/** DVIR: completion and defect resolution from dvir_inspections. */
function dvirComponent(rows: (typeof schema.dvirInspections.$inferSelect)[]): Component {
  // One DVIR cannot show a pre/post pairing habit, so 0-1 reports is reported
  // missing rather than scored as a failure to pair.
  if (rows.length < 2) return missing(`Only ${rows.length} DVIR(s) submitted in the window — at least 2 are needed to measure pre-trip / post-trip pairing.`, { dvirs: rows.length });
  let withDefects = 0;
  for (const r of rows) {
    let defects: unknown = [];
    try { defects = r.defects ? JSON.parse(r.defects) : []; } catch { defects = []; }
    if (Array.isArray(defects) && defects.length > 0) withDefects++;
  }
  const pre = rows.filter((r) => r.type === "pre_trip").length;
  const post = rows.filter((r) => r.type === "post_trip").length;
  const pairs = Math.min(pre, post);
  const pairing = pre + post > 0 ? (pairs * 2) / (pre + post) : 0;
  return {
    score: clamp100(60 + pairing * 40),
    note: "Measures pre-trip / post-trip pairing, not defect count. Reporting a defect is correct behavior and is never penalized.",
    detail: { dvirs: rows.length, preTrip: pre, postTrip: post, pairedDays: pairs, withDefectsReported: withDefects },
  };
}

/** Violations and accidents from hr_occurrences, severity-weighted. */
function violationComponent(rows: (typeof schema.hrOccurrences.$inferSelect)[]): Component {
  const relevant = rows.filter((r) => ["violation", "accident", "drug_alcohol"].includes(r.category));
  const commendations = rows.filter((r) => r.category === "commendation").length;
  if (rows.length === 0) {
    return missing("No HR occurrence records for this driver in the window — a clean record and an unrecorded record look identical, so no score is produced.", { occurrences: 0 });
  }
  const weight = { minor: 5, moderate: 15, major: 30, critical: 50 } as const;
  const penalty = relevant.reduce((sum, r) => sum + (weight[r.severity as keyof typeof weight] ?? 5), 0);
  return {
    score: clamp100(100 - penalty),
    note: "Severity-weighted violations, accidents and drug/alcohol occurrences on file in the window. Commendations are shown but do not inflate the score.",
    detail: {
      occurrences: rows.length,
      counted: relevant.length,
      critical: relevant.filter((r) => r.severity === "critical").length,
      major: relevant.filter((r) => r.severity === "major").length,
      moderate: relevant.filter((r) => r.severity === "moderate").length,
      minor: relevant.filter((r) => r.severity === "minor").length,
      commendations,
      penaltyPoints: penalty,
    },
  };
}

/** Fatigue from ELD telemetry. Inverted: high fatigue = low safety points. */
function fatigueComponent(rows: (typeof schema.eldTelemetry.$inferSelect)[]): Component {
  const f = scoreFatigue(rows);
  if (f.insufficientData || f.score === null) {
    return missing(f.note, { samples: f.samples, needed: (f as { needed?: number }).needed ?? 10 });
  }
  return {
    score: clamp100(100 - f.score),
    note: "Inverted fatigue index from recorded telemetry (harsh events, speed variance, continuous drive time, circadian window).",
    detail: { fatigueScore: f.score, level: f.level, samples: f.samples, factors: (f as { factors?: unknown }).factors },
  };
}

export async function computeSafetyScore(driverId: string, windowDays = WINDOW_DAYS) {
  const since = new Date(Date.now() - windowDays * 86_400_000);

  const [speeding, hos, dvirs, occurrences, telemetry] = await Promise.all([
    db.select().from(schema.speedingEvents)
      .where(and(eq(schema.speedingEvents.driverId, driverId), gte(schema.speedingEvents.occurredAt, since))),
    db.select().from(schema.hosLogs)
      .where(and(eq(schema.hosLogs.driverId, driverId), gte(schema.hosLogs.startedAt, since))),
    db.select().from(schema.dvirInspections)
      .where(and(eq(schema.dvirInspections.driverId, driverId), gte(schema.dvirInspections.createdAt, since))),
    db.select().from(schema.hrOccurrences)
      .where(and(eq(schema.hrOccurrences.personId, driverId), gte(schema.hrOccurrences.createdAt, since))),
    db.select().from(schema.eldTelemetry)
      .where(and(eq(schema.eldTelemetry.driverId, driverId), gte(schema.eldTelemetry.recordedAt, since)))
      .orderBy(desc(schema.eldTelemetry.recordedAt)).limit(1000),
  ]);

  const miles = milesFromTelemetry(telemetry);
  const components: Record<SafetyComponentKey, Component> = {
    speeding: speedingComponent(speeding, miles),
    hos: hosComponent(hos),
    violations: violationComponent(occurrences),
    dvir: dvirComponent(dvirs),
    fatigue: fatigueComponent(telemetry),
  };

  const keys = Object.keys(SAFETY_WEIGHTS) as SafetyComponentKey[];
  const present = keys.filter((k) => components[k].score !== null);
  const absent = keys.filter((k) => components[k].score === null);

  let score: number | null = null;
  let note: string;
  if (present.length < MIN_COMPONENTS) {
    note = `Not enough data for a safety score. ${present.length} of ${keys.length} components have records in the last ${windowDays} days; at least ${MIN_COMPONENTS} are required. Missing: ${absent.join(", ")}.`;
  } else {
    const totalWeight = present.reduce((s, k) => s + SAFETY_WEIGHTS[k], 0);
    score = clamp100(present.reduce((s, k) => s + (components[k].score as number) * SAFETY_WEIGHTS[k], 0) / totalWeight);
    note = absent.length
      ? `Scored on ${present.length} of ${keys.length} components (${present.join(", ")}), reweighted to 100. No data for: ${absent.join(", ")} — those are excluded, not assumed clean.`
      : `Scored on all ${keys.length} components.`;
  }

  return {
    driverId,
    windowDays,
    score,
    grade: score === null ? null : gradeFor(score).grade,
    gradeLabel: score === null ? null : gradeFor(score).label,
    insufficientData: score === null,
    milesObserved: miles,
    componentsScored: present,
    componentsMissing: absent,
    weights: SAFETY_WEIGHTS,
    components,
    accidentRisk: null as null,
    accidentRiskNote:
      "TruckWithEase does not predict accident probability. That requires a crash-outcome dataset matched to driver behavior, which this platform does not have. Any percentage here would be invented, so the field stays null.",
    note,
    computedAt: new Date().toISOString(),
  };
}

export type SafetyScoreResult = Awaited<ReturnType<typeof computeSafetyScore>>;

async function persist(result: SafetyScoreResult) {
  const [row] = await db.insert(schema.safetyScores).values({
    id: rid("sfs"),
    driverId: result.driverId,
    score: result.score,
    grade: result.grade,
    windowDays: result.windowDays,
    milesDriven: result.milesObserved ?? 0,
    speedingComponent: result.components.speeding.score,
    hosComponent: result.components.hos.score,
    dvirComponent: result.components.dvir.score,
    violationComponent: result.components.violations.score,
    fatigueComponent: result.components.fatigue.score,
    insufficientData: result.insufficientData,
    missing: JSON.stringify(result.componentsMissing),
    note: result.note,
  }).returning();
  return row;
}

export const safety = new Hono()
  .get("/", async (c) => {
    await ensureSeed();
    const windowDays = Number(c.req.query("windowDays") ?? WINDOW_DAYS);
    const roster = await db.select().from(schema.drivers);
    const scored = await Promise.all(roster.map(async (d) => {
      const r = await computeSafetyScore(d.id, windowDays);
      return {
        driverId: d.id,
        name: d.name,
        truckNumber: d.truckNumber,
        status: d.status,
        tier: d.tier,
        score: r.score,
        grade: r.grade,
        gradeLabel: r.gradeLabel,
        insufficientData: r.insufficientData,
        componentsScored: r.componentsScored,
        componentsMissing: r.componentsMissing,
        milesObserved: r.milesObserved,
      };
    }));
    const withScores = scored.filter((s) => s.score !== null);
    return c.json({
      windowDays,
      drivers: scored,
      fleet: {
        driversTotal: scored.length,
        driversScored: withScores.length,
        driversUnscored: scored.length - withScores.length,
        averageScore: withScores.length
          ? Math.round(withScores.reduce((s, d) => s + (d.score as number), 0) / withScores.length)
          : null,
        accidentRisk: null,
      },
      note: "Fleet average covers only drivers with enough data to score. Unscored drivers are counted separately and never averaged in as a default.",
    });
  })

  .get("/weights", (c) => c.json({ weights: SAFETY_WEIGHTS, grades: SAFETY_GRADES, minComponents: MIN_COMPONENTS, windowDays: WINDOW_DAYS }))

  .get("/history/:driverId", async (c) => {
    const rows = await db.select().from(schema.safetyScores)
      .where(eq(schema.safetyScores.driverId, c.req.param("driverId")))
      .orderBy(desc(schema.safetyScores.computedAt)).limit(60);
    return c.json({
      driverId: c.req.param("driverId"),
      snapshots: rows,
      trend: rows.length >= 2 && rows[0].score !== null && rows[rows.length - 1].score !== null
        ? (rows[0].score as number) - (rows[rows.length - 1].score as number)
        : null,
      note: rows.length < 2 ? "A trend needs at least two saved snapshots. Recompute the score to add one." : "Trend is the newest saved snapshot minus the oldest one on file.",
    });
  })

  .get("/speeding/:driverId", async (c) => {
    const since = new Date(Date.now() - Number(c.req.query("windowDays") ?? WINDOW_DAYS) * 86_400_000);
    const rows = await db.select().from(schema.speedingEvents)
      .where(and(eq(schema.speedingEvents.driverId, c.req.param("driverId")), gte(schema.speedingEvents.occurredAt, since)))
      .orderBy(desc(schema.speedingEvents.occurredAt)).limit(500);
    return c.json({ driverId: c.req.param("driverId"), events: rows, count: rows.length });
  })

  .post("/speeding", async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const driverId = b.driverId ?? b.driver_id;
    const speedMph = Number(b.speedMph ?? b.speed_mph);
    const limitMph = Number(b.limitMph ?? b.limit_mph);
    if (!driverId || !Number.isFinite(speedMph) || !Number.isFinite(limitMph)) {
      return c.json({ error: "driverId, speedMph and limitMph are all required" }, 400);
    }
    if (speedMph <= limitMph) {
      return c.json({ error: "Not a speeding event — speedMph must exceed limitMph. Nothing was recorded.", recorded: false }, 400);
    }
    const overBy = Number((speedMph - limitMph).toFixed(1));
    const [row] = await db.insert(schema.speedingEvents).values({
      id: rid("spd"),
      driverId,
      truckUnit: b.truckUnit ?? b.truck_unit ?? null,
      speedMph, limitMph, overBy,
      severity: severityForOverBy(overBy),
      lat: b.lat ?? null, lng: b.lng ?? null,
      roadName: b.roadName ?? b.road_name ?? null,
      source: b.source ?? "eld",
      occurredAt: b.occurredAt ? new Date(b.occurredAt) : new Date(),
    }).returning();
    return c.json({ ok: true, event: row }, 201);
  })

  .post("/recompute/:driverId", async (c) => {
    const result = await computeSafetyScore(c.req.param("driverId"), Number(c.req.query("windowDays") ?? WINDOW_DAYS));
    const snapshot = await persist(result);
    return c.json({ ...result, snapshotId: snapshot?.id ?? null, saved: Boolean(snapshot) });
  })

  /**
   * Writes 30 days of clearly-labelled DEMO history for the five seeded demo
   * drivers (drv-1..drv-5) so the scorecard can be exercised end to end before
   * real ELD hardware is connected. It only ever touches driver ids that start
   * with "drv-", it is idempotent, and every row it writes carries a "DEMO"
   * marker. Nothing here is presented as a real reading anywhere in the UI.
   */
  .post("/demo-history", async (c) => {
    await ensureSeed();
    const roster = (await db.select().from(schema.drivers)).filter((d) => d.id.startsWith("drv-"));
    if (roster.length === 0) return c.json({ error: "No seeded demo drivers found. Nothing was written.", written: 0 }, 400);

    const existing = await db.select().from(schema.speedingEvents);
    if (existing.some((e) => e.source === "demo")) {
      return c.json({ ok: true, alreadyPresent: true, written: 0, note: "Demo history is already loaded. Nothing was duplicated." });
    }

    const day = 86_400_000;
    let hosCount = 0, dvirCount = 0, spdCount = 0, occCount = 0, tlmCount = 0;
    // Per-driver behavior profiles: how many speeding events and how clean the logs are.
    const profiles: Record<string, { spd: number; severeEvery: number; longDays: number; occ: { category: string; severity: string; title: string }[] }> = {
      "drv-1": { spd: 3, severeEvery: 0, longDays: 0, occ: [{ category: "commendation", severity: "minor", title: "DEMO — Clean roadside inspection" }] },
      "drv-2": { spd: 0, severeEvery: 0, longDays: 0, occ: [] },
      "drv-3": { spd: 11, severeEvery: 4, longDays: 2, occ: [{ category: "violation", severity: "moderate", title: "DEMO — Logbook form and manner violation" }] },
      "drv-4": { spd: 6, severeEvery: 6, longDays: 1, occ: [{ category: "accident", severity: "major", title: "DEMO — Backing incident at dock, no injuries" }] },
      "drv-5": { spd: 1, severeEvery: 0, longDays: 0, occ: [{ category: "coaching", severity: "minor", title: "DEMO — Following-distance coaching session" }] },
    };

    for (const d of roster) {
      const p = profiles[d.id] ?? { spd: 2, severeEvery: 0, longDays: 0, occ: [] };
      let odo = 400_000;
      for (let back = 29; back >= 1; back--) {
        const base = Date.now() - back * day;
        const isLong = p.longDays > 0 && back % 11 === 0;
        const driveH = isLong ? 11.6 : 8 + (back % 3);
        const startDrive = base - driveH * 3_600_000;
        await db.insert(schema.hosLogs).values([
          { id: rid("hos"), driverId: d.id, status: "on_duty", startedAt: new Date(startDrive - 1_800_000), endedAt: new Date(startDrive), location: "DEMO — yard", note: "DEMO seed: pre-trip" },
          { id: rid("hos"), driverId: d.id, status: "driving", startedAt: new Date(startDrive), endedAt: new Date(base), location: "DEMO — interstate" },
        ]);
        hosCount += 2;
        if (back % 2 === 0) {
          await db.insert(schema.dvirInspections).values([
            { id: rid("dvir"), driverId: d.id, truckUnit: d.truckNumber ?? "DEMO", type: "pre_trip", vehicleType: "tractor", odometer: Math.round(odo), location: "DEMO", defects: "[]", hasDefects: false, safeToOperate: true, signature: `DEMO ${d.name}`, status: "submitted", createdAt: new Date(startDrive) },
            { id: rid("dvir"), driverId: d.id, truckUnit: d.truckNumber ?? "DEMO", type: "post_trip", vehicleType: "tractor", odometer: Math.round(odo + driveH * 55), location: "DEMO", defects: "[]", hasDefects: false, safeToOperate: true, signature: `DEMO ${d.name}`, status: "submitted", createdAt: new Date(base) },
          ]);
          dvirCount += 2;
        }
        // Two odometer telemetry rows per day give the engine real miles to normalize against.
        await db.insert(schema.eldTelemetry).values([
          { id: rid("tlm"), deviceId: `demo-${d.id}`, driverId: d.id, speedMph: 0, odometer: odo, recordedAt: new Date(startDrive) },
          { id: rid("tlm"), deviceId: `demo-${d.id}`, driverId: d.id, speedMph: 62, odometer: odo + driveH * 55, recordedAt: new Date(base) },
        ]);
        tlmCount += 2;
        odo += driveH * 55;
      }
      for (let i = 0; i < p.spd; i++) {
        const overBy = p.severeEvery && i % p.severeEvery === 0 ? 16 : 6 + (i % 3) * 3;
        await db.insert(schema.speedingEvents).values({
          id: rid("spd"), driverId: d.id, truckUnit: d.truckNumber ?? "DEMO",
          speedMph: 65 + overBy, limitMph: 65, overBy, severity: severityForOverBy(overBy),
          roadName: "DEMO — I-70", source: "demo",
          occurredAt: new Date(Date.now() - (2 + i * 2) * day),
        });
        spdCount++;
      }
      for (const o of p.occ) {
        await db.insert(schema.hrOccurrences).values({
          id: rid("occ"), personId: d.id, category: o.category, severity: o.severity,
          title: o.title, description: "Demo record written by /api/safety/demo-history.",
          occurredOn: new Date(Date.now() - 9 * day).toISOString().slice(0, 10), status: "resolved",
          createdAt: new Date(Date.now() - 9 * day),
        });
        occCount++;
      }
    }
    return c.json({
      ok: true, drivers: roster.length,
      written: { hosLogs: hosCount, dvirs: dvirCount, speedingEvents: spdCount, occurrences: occCount, telemetry: tlmCount },
      note: "Demo history written for seeded demo drivers only. Every row is marked DEMO and is not a reading from any truck.",
    }, 201);
  })

  .get("/:driverId", async (c) => {
    await ensureSeed();
    const driverId = c.req.param("driverId");
    const [driver] = await db.select().from(schema.drivers).where(eq(schema.drivers.id, driverId)).limit(1);
    if (!driver) return c.json({ error: `No driver ${driverId}` }, 404);
    const result = await computeSafetyScore(driverId, Number(c.req.query("windowDays") ?? WINDOW_DAYS));
    return c.json({ driver: { id: driver.id, name: driver.name, truckNumber: driver.truckNumber, status: driver.status, tier: driver.tier }, ...result });
  });
