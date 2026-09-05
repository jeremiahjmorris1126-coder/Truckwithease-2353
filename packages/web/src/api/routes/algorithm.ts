import { Hono } from "hono";
import { and, desc, eq, gte } from "drizzle-orm";
import { auth } from "../auth";
import { ensurePersonalizationSchema } from "../lib/personalization";
import { db } from "../database";
import * as schema from "../database/schema";
import { readInterval } from "../lib/dutyclock";

/**
 * Driver Algorithm — the per-driver learning layer the agents read.
 *
 * Jeremiah's ask: the agents should "gain the algorithm of the user" across driving
 * skill, customer frequency, loads and routes, and use it as strategy.
 *
 * THE RULE THIS FILE OBEYS
 * A pattern is only ever computed from rows the driver actually generated. Nothing is
 * modelled, predicted, smoothed or filled in. Every returned pattern carries the real
 * sampleCount it was built from and the plain-English basis naming the exact rows. When
 * the sample count is under MIN_SAMPLES the pattern is returned with value: null and
 * insufficient: true — the UI and the agents then say NOT ENOUGH DATA instead of guessing.
 *
 * WHAT IT CAN LEARN TODAY (real rows in the database right now)
 *   - driving  : 21 speeding_events, 142 dvir_inspections, 293 hos_logs
 * WHAT IT CANNOT LEARN YET (no rows exist, so no pattern is produced)
 *   - customer : loads.booked_by_driver_id is null on every row — no broker has been worked
 *   - load     : same reason — nothing has been accepted or declined
 *   - route    : 2 trips total — not a lane history
 *
 * That gap is why driver_signals exists. Nothing in the app recorded a decision, so the
 * algorithm had no history to compound from. POST /signal is the capture point; every
 * accept, decline, lane run and broker touch written there deepens the profile from that
 * moment forward. The engine gets better because the driver used it, not because we
 * invented a starting point for him.
 */

export const algorithm = new Hono();

type SessionUser = { id: string; email?: string | null };

async function currentUser(headers: Headers): Promise<SessionUser | null> {
  try {
    const session = await auth.api.getSession({ headers });
    return session?.user ? { id: session.user.id, email: session.user.email } : null;
  } catch {
    return null;
  }
}

async function ownProfile(userId: string) {
  await ensurePersonalizationSchema();
  const rows = await db.select().from(schema.userDriverProfiles).where(eq(schema.userDriverProfiles.userId, userId)).limit(1);
  return rows[0] ?? null;
}

async function mayReadDriver(headers: Headers, driverId: string) {
  const user = await currentUser(headers);
  if (!user) return false;
  const roleRows = await db.select().from(schema.userRoles).where(eq(schema.userRoles.userId, user.id)).limit(1);
  const role = roleRows[0]?.role ?? "driver";
  if (role === "admin" || role === "dispatch") return true;
  return (await ownProfile(user.id))?.driverId === driverId;
}

/** Below this many observations a pattern is not reported as a pattern. */
const MIN_SAMPLES = 5;
/** Rolling learning window. */
const WINDOW_DAYS = 90;

const rid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const DIMENSIONS = ["driving", "customer", "load", "route"] as const;
type Dimension = (typeof DIMENSIONS)[number];

/** Confidence is a function of sample size only. It is never a model's self-assessment. */
function confidenceFor(n: number): "none" | "low" | "medium" | "high" {
  if (n < MIN_SAMPLES) return "none";
  if (n < 20) return "low";
  if (n < 50) return "medium";
  return "high";
}

type Pattern = {
  label: string;
  value: string | null;
  numericValue: number | null;
  unit: string | null;
  sampleCount: number;
  confidence: string;
  insufficient: boolean;
  basis: string;
};

function pattern(
  label: string,
  sampleCount: number,
  basis: string,
  compute: () => { value: string | null; numericValue?: number | null; unit?: string | null },
): Pattern {
  const enough = sampleCount >= MIN_SAMPLES;
  const c = enough ? compute() : { value: null, numericValue: null, unit: null };
  return {
    label,
    value: enough ? c.value : null,
    numericValue: enough ? (c.numericValue ?? null) : null,
    unit: c.unit ?? null,
    sampleCount,
    confidence: confidenceFor(sampleCount),
    insufficient: !enough,
    basis,
  };
}

function topOf(counts: Map<string, number>): { key: string; n: number } | null {
  let best: { key: string; n: number } | null = null;
  for (const [key, n] of counts) if (!best || n > best.n) best = { key, n };
  return best;
}

const since = () => new Date(Date.now() - WINDOW_DAYS * 86400_000);

/* ------------------------------------------------------------------ status */

algorithm.get("/status", async (c) => {
  const [signals, loads, trips, speeding, dvir, hos] = await Promise.all([
    db.select().from(schema.driverSignals),
    db.select().from(schema.loads),
    db.select().from(schema.trips),
    db.select().from(schema.speedingEvents),
    db.select().from(schema.dvirInspections),
    db.select().from(schema.hosLogs),
  ]);
  const booked = loads.filter((l) => l.bookedByDriverId).length;

  return c.json({
    engine: "driver-algorithm",
    live: true,
    windowDays: WINDOW_DAYS,
    minSamples: MIN_SAMPLES,
    learnsFrom: {
      driver_signals: signals.length,
      speeding_events: speeding.length,
      dvir_inspections: dvir.length,
      hos_logs: hos.length,
      loads_booked_by_a_driver: booked,
      trips: trips.length,
    },
    canLearnNow: {
      driving: speeding.length + dvir.length + hos.length >= MIN_SAMPLES,
      customer: booked >= MIN_SAMPLES,
      load: booked >= MIN_SAMPLES,
      route: trips.length >= MIN_SAMPLES,
    },
    note:
      "Patterns are computed only from rows the driver generated. Dimensions with fewer than " +
      `${MIN_SAMPLES} observations return null and are reported as NOT ENOUGH DATA. Nothing is predicted.`,
  });
});

/* ------------------------------------------------------- signal capture */

algorithm.post("/signal", async (c) => {
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Body must be JSON." }, 400);
  }

  const driverId = String(body.driverId ?? "").trim();
  const dimension = String(body.dimension ?? "").trim() as Dimension;
  const kind = String(body.kind ?? "").trim();
  const source = String(body.source ?? "").trim();

  if (!driverId) return c.json({ error: "driverId is required." }, 400);
  if (!(await mayReadDriver(c.req.raw.headers, driverId))) return c.json({ error: "Not authorized to record a signal for this driver." }, 403);
  if (!DIMENSIONS.includes(dimension))
    return c.json({ error: `dimension must be one of: ${DIMENSIONS.join(", ")}` }, 400);
  if (!kind) return c.json({ error: "kind is required — name the observed event." }, 400);
  if (!source)
    return c.json({ error: "source is required — name what produced this observation." }, 400);

  const numericValue =
    body.numericValue == null || body.numericValue === "" ? null : Number(body.numericValue);
  if (numericValue != null && !Number.isFinite(numericValue))
    return c.json({ error: "numericValue must be a number." }, 400);

  const [row] = await db
    .insert(schema.driverSignals)
    .values({
      id: rid("sig"),
      driverId,
      dimension,
      kind,
      subject: body.subject == null ? null : String(body.subject),
      numericValue,
      unit: body.unit == null ? null : String(body.unit),
      source,
      meta: body.meta == null ? null : JSON.stringify(body.meta),
      occurredAt: body.occurredAt ? new Date(String(body.occurredAt)) : new Date(),
    })
    .returning();

  return c.json({ recorded: true, signal: row }, 201);
});

algorithm.get("/me", async (c) => {
  const user = await currentUser(c.req.raw.headers);
  if (!user) return c.json({ error: "Not signed in." }, 401);
  const profile = await ownProfile(user.id);
  if (!profile) return c.json({ linked: false, personalizationEnabled: false, driver: null });
  const driver = await buildProfile(profile.driverId);
  return c.json({ linked: true, personalizationEnabled: profile.personalizationEnabled, consentedAt: profile.consentedAt, driver });
});

/** Claim only the driver record carrying the signed-in email; users cannot choose another driver's history. */
algorithm.post("/me/claim", async (c) => {
  const user = await currentUser(c.req.raw.headers);
  if (!user?.email) return c.json({ error: "A signed-in account with an email address is required." }, 401);
  await ensurePersonalizationSchema();
  const matches = await db.select().from(schema.drivers).where(eq(schema.drivers.email, user.email)).limit(2);
  if (matches.length !== 1) return c.json({ error: "No unique driver record matches your sign-in email. Ask dispatch to set your driver email before claiming a profile." }, 409);
  const existing = await ownProfile(user.id);
  if (existing && existing.driverId !== matches[0].id) return c.json({ error: "This account is already linked to another driver profile." }, 409);
  const now = new Date();
  if (existing) await db.update(schema.userDriverProfiles).set({ updatedAt: now }).where(eq(schema.userDriverProfiles.userId, user.id));
  else await db.insert(schema.userDriverProfiles).values({ userId: user.id, driverId: matches[0].id, personalizationEnabled: false, updatedAt: now });
  return c.json({ linked: true, driver: { id: matches[0].id, name: matches[0].name, truckNumber: matches[0].truckNumber }, personalizationEnabled: false });
});

algorithm.post("/me/consent", async (c) => {
  const user = await currentUser(c.req.raw.headers);
  if (!user) return c.json({ error: "Not signed in." }, 401);
  const profile = await ownProfile(user.id);
  if (!profile) return c.json({ error: "Claim your driver profile before changing personalization." }, 409);
  const body = await c.req.json().catch(() => ({} as Record<string, unknown>));
  if (typeof body.enabled !== "boolean") return c.json({ error: "enabled must be true or false." }, 400);
  const now = new Date();
  await db.update(schema.userDriverProfiles).set({ personalizationEnabled: body.enabled, consentedAt: body.enabled ? now : null, updatedAt: now }).where(eq(schema.userDriverProfiles.userId, user.id));
  return c.json({ linked: true, personalizationEnabled: body.enabled, consentedAt: body.enabled ? now : null });
});

algorithm.get("/:driverId/signals", async (c) => {
  const driverId = c.req.param("driverId");
  if (!(await mayReadDriver(c.req.raw.headers, driverId))) return c.json({ error: "Not authorized to read this driver profile." }, 403);
  const limit = Math.min(Number(c.req.query("limit") ?? 50) || 50, 200);
  const rows = await db
    .select()
    .from(schema.driverSignals)
    .where(eq(schema.driverSignals.driverId, driverId))
    .orderBy(desc(schema.driverSignals.occurredAt))
    .limit(limit);
  return c.json({ driverId, count: rows.length, signals: rows });
});

/* --------------------------------------------------------- the profile */

async function buildProfile(driverId: string) {
  const cutoff = since();

  const [driver] = await db
    .select()
    .from(schema.drivers)
    .where(eq(schema.drivers.id, driverId));

  const [signals, speeding, dvirs, hosRows, allLoads, tripRows] = await Promise.all([
    db.select().from(schema.driverSignals).where(eq(schema.driverSignals.driverId, driverId)),
    db
      .select()
      .from(schema.speedingEvents)
      .where(
        and(
          eq(schema.speedingEvents.driverId, driverId),
          gte(schema.speedingEvents.occurredAt, cutoff),
        ),
      ),
    db
      .select()
      .from(schema.dvirInspections)
      .where(eq(schema.dvirInspections.driverId, driverId)),
    db
      .select()
      .from(schema.hosLogs)
      .where(and(eq(schema.hosLogs.driverId, driverId), gte(schema.hosLogs.startedAt, cutoff))),
    db.select().from(schema.loads),
    db.select().from(schema.trips).where(eq(schema.trips.driverId, driverId)),
  ]);

  const myLoads = allLoads.filter((l) => l.bookedByDriverId === driverId);
  const sig = (dim: Dimension, kind?: string) =>
    signals.filter((s) => s.dimension === dim && (!kind || s.kind === kind));

  /* -------------------------------------------------- DRIVING SKILL */

  const driving: Pattern[] = [];

  driving.push(
    pattern(
      "Speeding severity mix",
      speeding.length,
      `${speeding.length} speeding_events rows in the last ${WINDOW_DAYS} days.`,
      () => {
        const severe = speeding.filter((e) => e.severity === "severe").length;
        const moderate = speeding.filter((e) => e.severity === "moderate").length;
        const minor = speeding.filter((e) => e.severity === "minor").length;
        return {
          value: `${severe} severe · ${moderate} moderate · ${minor} minor`,
          numericValue: severe,
          unit: "events",
        };
      },
    ),
  );

  driving.push(
    pattern(
      "Average overage when speeding",
      speeding.length,
      "Mean of speeding_events.over_by — how far over the limit he actually goes, not how often.",
      () => {
        const avg = speeding.reduce((a, e) => a + (e.overBy || 0), 0) / speeding.length;
        return { value: `${avg.toFixed(1)} mph over`, numericValue: Number(avg.toFixed(1)), unit: "mph" };
      },
    ),
  );

  const roadCounts = new Map<string, number>();
  for (const e of speeding) if (e.roadName) roadCounts.set(e.roadName, (roadCounts.get(e.roadName) ?? 0) + 1);
  const repeatRoads = [...roadCounts.entries()].filter(([, n]) => n > 1);
  driving.push(
    pattern(
      "Roads he repeats the behaviour on",
      speeding.length,
      "Grouped speeding_events.road_name. A road appearing more than once is a habit, not an incident.",
      () => ({
        value: repeatRoads.length
          ? repeatRoads.sort((a, b) => b[1] - a[1]).map(([r, n]) => `${r} (${n}x)`).join(", ")
          : "No road repeats — events are scattered, not habitual",
        numericValue: repeatRoads.length,
        unit: "roads",
      }),
    ),
  );

  const hourCounts = new Map<string, number>();
  const drivingStints = hosRows.filter((h) => h.status === "driving");
  for (const h of drivingStints) {
    const hr = new Date(h.startedAt).getUTCHours();
    const band = hr < 6 ? "00:00–06:00" : hr < 12 ? "06:00–12:00" : hr < 18 ? "12:00–18:00" : "18:00–24:00";
    hourCounts.set(band, (hourCounts.get(band) ?? 0) + 1);
  }
  driving.push(
    pattern(
      "When he actually drives",
      drivingStints.length,
      `${drivingStints.length} hos_logs rows with status=driving, bucketed by start hour (UTC).`,
      () => {
        const top = topOf(hourCounts);
        return top
          ? {
              value: `${top.key} most often (${top.n} of ${drivingStints.length} stints)`,
              numericValue: Math.round((top.n / drivingStints.length) * 100),
              unit: "percent",
            }
          : { value: null };
      },
    ),
  );

  // Interval reading goes through lib/dutyclock so every surface in the app
  // obeys the same open/stale rule. Only completed stints are measured.
  const stintNow = Date.now();
  const stintLengths = drivingStints
    .map((h) => readInterval(h, stintNow))
    .filter((v) => v.usable && !v.open)
    .map((v) => ((v as Extract<typeof v, { usable: true }>).endMs - (v as Extract<typeof v, { usable: true }>).startMs) / 1000)
    .filter((s) => s > 0);
  driving.push(
    pattern(
      "Typical driving stint before a break",
      stintLengths.length,
      "Mean duration of completed hos_logs driving rows. Long stints are the fatigue signal worth coaching.",
      () => {
        const avg = stintLengths.reduce((a, b) => a + b, 0) / stintLengths.length;
        const h = Math.floor(avg / 3600);
        const m = Math.round((avg % 3600) / 60);
        return { value: `${h}h ${String(m).padStart(2, "0")}m`, numericValue: Math.round(avg), unit: "seconds" };
      },
    ),
  );

  const defectCounts = new Map<string, number>();
  let defectiveDvirs = 0;
  for (const d of dvirs) {
    const raw = (d as Record<string, unknown>).defects;
    if (!raw) continue;
    defectiveDvirs++;
    let list: unknown = raw;
    if (typeof raw === "string") {
      try {
        list = JSON.parse(raw);
      } catch {
        list = [raw];
      }
    }
    if (Array.isArray(list)) {
      for (const item of list) {
        const name = typeof item === "string" ? item : String((item as Record<string, unknown>)?.item ?? "");
        if (name) defectCounts.set(name, (defectCounts.get(name) ?? 0) + 1);
      }
    }
  }
  driving.push(
    pattern(
      "Defects he writes up repeatedly",
      dvirs.length,
      `${dvirs.length} dvir_inspections rows, ${defectiveDvirs} of them carrying a defect.`,
      () => {
        const top = topOf(defectCounts);
        return top
          ? { value: `${top.key} — written up ${top.n}x`, numericValue: top.n, unit: "writeups" }
          : { value: `No defect written up more than once — ${defectiveDvirs} of ${dvirs.length} inspections carried a defect`, numericValue: defectiveDvirs, unit: "inspections" };
      },
    ),
  );

  /* ------------------------------------------------ CUSTOMER FREQUENCY */

  const brokerCounts = new Map<string, number>();
  for (const l of myLoads) if (l.broker) brokerCounts.set(l.broker, (brokerCounts.get(l.broker) ?? 0) + 1);
  for (const s of sig("customer")) if (s.subject) brokerCounts.set(s.subject, (brokerCounts.get(s.subject) ?? 0) + 1);
  const customerSamples = myLoads.length + sig("customer").length;

  const customer: Pattern[] = [
    pattern(
      "Broker he works most",
      customerSamples,
      "Grouped broker on loads booked by this driver, plus recorded customer signals.",
      () => {
        const top = topOf(brokerCounts);
        return top
          ? { value: `${top.key} — ${top.n} of ${customerSamples} loads`, numericValue: top.n, unit: "loads" }
          : { value: null };
      },
    ),
    pattern(
      "Repeat rate with the same customer",
      customerSamples,
      "Share of this driver's loads that went to a broker he had already run for.",
      () => {
        const repeats = [...brokerCounts.values()].filter((n) => n > 1).reduce((a, n) => a + n, 0);
        const pct = Math.round((repeats / customerSamples) * 100);
        return { value: `${pct}% repeat business`, numericValue: pct, unit: "percent" };
      },
    ),
  ];

  /* -------------------------------------------------- LOAD SELECTION */

  const acceptedRpms = myLoads
    .filter((l) => (l.miles ?? 0) > 0 && (l.rate ?? 0) > 0)
    .map((l) => (l.rate as number) / (l.miles as number));
  const acceptSignals = sig("load", "load_accepted");
  const declineSignals = sig("load", "load_declined");
  for (const s of acceptSignals) if (s.numericValue != null && s.unit === "usd_per_mile") acceptedRpms.push(s.numericValue);

  const equipCounts = new Map<string, number>();
  for (const l of myLoads) if (l.equipment) equipCounts.set(l.equipment, (equipCounts.get(l.equipment) ?? 0) + 1);
  const loadSamples = myLoads.length + acceptSignals.length;

  const load: Pattern[] = [
    pattern(
      "Rate-per-mile floor he actually accepts",
      acceptedRpms.length,
      "Lowest rate ÷ miles across loads he took. This is revealed preference, not a target he stated.",
      () => {
        const min = Math.min(...acceptedRpms);
        const avg = acceptedRpms.reduce((a, b) => a + b, 0) / acceptedRpms.length;
        return {
          value: `Took as low as $${min.toFixed(2)}/mi · averages $${avg.toFixed(2)}/mi`,
          numericValue: Number(min.toFixed(2)),
          unit: "usd_per_mile",
        };
      },
    ),
    pattern(
      "Equipment he runs",
      loadSamples,
      "Grouped equipment across loads booked by this driver.",
      () => {
        const top = topOf(equipCounts);
        return top ? { value: `${top.key} — ${top.n} of ${loadSamples}`, numericValue: top.n, unit: "loads" } : { value: null };
      },
    ),
    pattern(
      "Accept vs decline ratio",
      acceptSignals.length + declineSignals.length,
      "Counted from recorded load_accepted and load_declined signals. Requires the board to record decisions.",
      () => {
        const total = acceptSignals.length + declineSignals.length;
        const pct = Math.round((acceptSignals.length / total) * 100);
        return { value: `Accepts ${pct}% of what he looks at`, numericValue: pct, unit: "percent" };
      },
    ),
  ];

  /* ---------------------------------------------------------- ROUTES */

  const laneCounts = new Map<string, number>();
  for (const l of myLoads) laneCounts.set(`${l.origin} → ${l.destination}`, (laneCounts.get(`${l.origin} → ${l.destination}`) ?? 0) + 1);
  for (const s of sig("route")) if (s.subject) laneCounts.set(s.subject, (laneCounts.get(s.subject) ?? 0) + 1);
  const routeSamples = myLoads.length + tripRows.length + sig("route").length;

  const lengths = myLoads.map((l) => l.miles ?? 0).filter((m) => m > 0);

  const route: Pattern[] = [
    pattern(
      "Lane he runs most",
      routeSamples,
      "Grouped origin → destination across booked loads, logged trips and recorded route signals.",
      () => {
        const top = topOf(laneCounts);
        return top ? { value: `${top.key} — ${top.n}x`, numericValue: top.n, unit: "runs" } : { value: null };
      },
    ),
    pattern(
      "Typical run length",
      lengths.length,
      "Mean of miles on booked loads. Separates a regional driver from a long-haul driver.",
      () => {
        const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        return { value: `${Math.round(avg)} mi average`, numericValue: Math.round(avg), unit: "miles" };
      },
    ),
  ];

  const groups: Record<Dimension, Pattern[]> = { driving, customer, load, route };

  const learned = Object.values(groups).flat().filter((p) => !p.insufficient).length;
  const total = Object.values(groups).flat().length;

  return {
    driverId,
    driver: driver ? { id: driver.id, name: driver.name, truckNumber: driver.truckNumber } : null,
    windowDays: WINDOW_DAYS,
    minSamples: MIN_SAMPLES,
    computedAt: new Date().toISOString(),
    patternsLearned: learned,
    patternsPossible: total,
    signalsRecorded: signals.length,
    dimensions: groups,
    note:
      "Every value above is computed from this driver's own rows. Any pattern under " +
      `${MIN_SAMPLES} observations is returned null with insufficient: true and must be shown as NOT ENOUGH DATA.`,
  };
}

algorithm.get("/:driverId", async (c) => {
  if (!(await mayReadDriver(c.req.raw.headers, c.req.param("driverId")))) return c.json({ error: "Not authorized to read this driver profile." }, 403);
  try {
    return c.json(await buildProfile(c.req.param("driverId")));
  } catch (e) {
    return c.json({ error: String(e instanceof Error ? e.message : e) }, 500);
  }
});

/** Personalization supplied to dispatch only after the driver opted in. It is advisory and never changes safety or HOS gates. */
export async function dispatchPersonalization(driverId: string) {
  await ensurePersonalizationSchema();
  const rows = await db.select().from(schema.userDriverProfiles).where(and(eq(schema.userDriverProfiles.driverId, driverId), eq(schema.userDriverProfiles.personalizationEnabled, true))).limit(1);
  if (!rows[0]) return { enabled: false, patternsLearned: 0, note: "No consented driver profile is available; dispatch ranking is unchanged." };
  const profile = await buildProfile(driverId);
  const learned = Object.values(profile.dimensions).flat().filter((p) => !p.insufficient).map((p) => ({ label: p.label, value: p.value, sampleCount: p.sampleCount, confidence: p.confidence }));
  return {
    enabled: true,
    patternsLearned: learned.length,
    observedPatterns: learned,
    note: learned.length ? "Observed driver patterns are shown as advisory context only. They never override HOS, route, or safety gates and do not change rank." : "The driver consented, but no pattern has enough observations yet; dispatch ranking is unchanged.",
  };
}

/* ------------------------------------- compact context for the agents */

/**
 * Exported so the agents can inject the profile server-side without an HTTP hop.
 * Returns plain text plus the counts, so a caller can tell "nothing learned yet"
 * apart from "learned nothing worth saying".
 */
export async function driverAlgorithmContext(driverId: string) {
  const p = await buildProfile(driverId);

  const lines: string[] = [];
  const unknown: string[] = [];

  for (const [dim, patterns] of Object.entries(p.dimensions)) {
    for (const pat of patterns as Pattern[]) {
      if (pat.insufficient) unknown.push(`${dim}/${pat.label} (only ${pat.sampleCount} observations)`);
      else lines.push(`- [${dim}] ${pat.label}: ${pat.value} (from ${pat.sampleCount} observations, ${pat.confidence} confidence)`);
    }
  }

  const text = [
    `DRIVER PROFILE — ${p.driver?.name ?? p.driverId}${p.driver?.truckNumber ? ` (${p.driver.truckNumber})` : ""}`,
    `Learned from this driver's own records over the last ${p.windowDays} days.`,
    "",
    lines.length ? "WHAT WE HAVE ACTUALLY OBSERVED:" : "WE HAVE NOT OBSERVED ENOUGH TO STATE ANY PATTERN YET.",
    ...lines,
    "",
    unknown.length ? "NOT ENOUGH DATA — DO NOT GUESS AT THESE, ASK HIM INSTEAD:" : "",
    ...unknown.map((u) => `- ${u}`),
    "",
    "RULES FOR USING THIS PROFILE:",
    "- Coach only against the observations listed above, quoting the observation count.",
    "- Never state a preference, habit or tendency that is not in the observed list.",
    "- For anything in the NOT ENOUGH DATA list, ask the driver directly rather than assuming.",
    "- Never present a pattern as a prediction of what he will do next.",
  ]
    .filter((l) => l !== "")
    .join("\n");

  return {
    driverId: p.driverId,
    patternsLearned: p.patternsLearned,
    patternsPossible: p.patternsPossible,
    observedCount: lines.length,
    unknownCount: unknown.length,
    context: text,
  };
}

algorithm.get("/:driverId/context", async (c) => {
  if (!(await mayReadDriver(c.req.raw.headers, c.req.param("driverId")))) return c.json({ error: "Not authorized to read this driver profile." }, 403);
  try {
    return c.json(await driverAlgorithmContext(c.req.param("driverId")));
  } catch (e) {
    return c.json({ error: String(e instanceof Error ? e.message : e) }, 500);
  }
});
