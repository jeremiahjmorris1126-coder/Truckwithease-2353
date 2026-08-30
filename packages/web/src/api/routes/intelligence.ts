import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { desc, eq, gte } from "drizzle-orm";
import { ensureSeed } from "../lib/seed";
import { computeClocks, hosViolations } from "./hos";

/**
 * FLEET INTELLIGENCE — the server behind the fatigue index and the surface index.
 *
 * Every number below is ordinary arithmetic on rows that exist in this database.
 * There is no model, no forecast and no published accuracy figure.
 *
 * WHAT THIS REPLACES
 *   The pasted Express backend preserved under docs/launch/ as the backend for
 *   these pages. It could not run here and would not have been honest if it had.
 *   Specifically removed:
 *     - express / cors / dotenv / pg (Postgres Pool) — this stack is Bun + Hono
 *       + Drizzle on Turso (SQLite). There is no Postgres.
 *     - aws-sdk, AWS.Polly, AWS.SageMaker, and s3.amazonaws.com media URLs —
 *       AWS is not used on this project. Storage is Tigris via presigned URLs.
 *     - POST /api/hos/predict built a "128D feature vector" where 124
 *       of the 128 dimensions were literally `Math.random()`, then returned
 *       `vectorDimensions: 128` as if a model had consumed them.
 *     - `prediction24h: fatigueScore + 5` — a forecast produced by adding five.
 *     - `confidence: 0.998` (captions), `confidence: 0.96` (translation),
 *       `confidence: 0.94` (sign language) — invented accuracy numbers. No
 *       accuracy figure is published anywhere in this platform unless the
 *       provider itself returned it.
 *     - INSERTs into sign_language_videos, haptic_alerts, fatigue_records,
 *       translations — four tables that do not exist in this schema.
 *     - `delivered: true` on a haptic send that never reached a device, and
 *       `latency: '2.3s'` typed as a string constant.
 *     - "7 sign languages" and "47 languages" — sign-language video is not
 *       built on this platform, by decision.
 *
 * WHAT IS ACTUALLY COMPUTED
 *   A fatigue INDEX (not a prediction) per driver, from up to five components,
 *   each of which is null when its source table has no rows for that driver.
 *   Weights are renormalized across whichever components have data. Fewer than
 *   MIN_COMPONENTS with data => index is null and insufficientData is true.
 *   A guessed safety number is worse than no number.
 */

const WINDOW_HOURS_TELEMETRY = 8;
const SPEEDING_WINDOW_DAYS = 7;
const MIN_TELEMETRY_SAMPLES = 5;
const MIN_COMPONENTS = 2;

/** 49 CFR 395 property-carrying limits, in minutes. Same source as routes/hos.ts. */
const DRIVING_LIMIT_MIN = 11 * 60;
const WINDOW_LIMIT_MIN = 14 * 60;

/**
 * Component weights for the fatigue index. These are product judgement, not a
 * validated clinical model, and the API says so in `basis`.
 */
export const FATIGUE_WEIGHTS = {
  drivingLoad: 35,
  windowLoad: 20,
  restRecency: 20,
  laneDeparture: 15,
  speeding: 10,
} as const;

type CompKey = keyof typeof FATIGUE_WEIGHTS;

type Component = {
  key: CompKey;
  label: string;
  weight: number;
  /** 0 = no fatigue signal, 1 = maximum signal. null = no data. */
  value: number | null;
  detail: string;
  source: string;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function levelFor(index: number) {
  if (index >= 70) return { level: "stop", label: "Stop driving", note: "Index is at or above 70. The clocks and the event rows both point the same way." };
  if (index >= 45) return { level: "elevated", label: "Elevated", note: "Index is between 45 and 70. Plan the next break rather than pushing the window." };
  return { level: "normal", label: "Normal", note: "Index is below 45 on the data available." };
}

type HosLog = typeof schema.hosLogs.$inferSelect;

/** Hours since the end of the last off-duty/sleeper block of 10 hours or more. */
function hoursSinceQualifyingRest(logs: HosLog[]): number | null {
  const now = Date.now();
  const rests = logs
    .filter((l) => (l.status === "off_duty" || l.status === "sleeper") && l.endedAt)
    .filter((l) => (+l.endedAt! - +l.startedAt) / 3_600_000 >= 10)
    .sort((a, b) => +b.endedAt! - +a.endedAt!);
  if (rests.length === 0) return null;
  return (now - +rests[0].endedAt!) / 3_600_000;
}

async function fatigueForDriver(driverId: string) {
  const now = Date.now();

  const logs = await db.select().from(schema.hosLogs)
    .where(eq(schema.hosLogs.driverId, driverId))
    .orderBy(desc(schema.hosLogs.startedAt));

  const telemetry = await db.select().from(schema.eldTelemetry)
    .where(eq(schema.eldTelemetry.driverId, driverId))
    .orderBy(desc(schema.eldTelemetry.recordedAt))
    .limit(500);
  const telWindow = telemetry.filter((t) => now - +t.recordedAt <= WINDOW_HOURS_TELEMETRY * 3_600_000);

  const speeding = await db.select().from(schema.speedingEvents)
    .where(eq(schema.speedingEvents.driverId, driverId))
    .orderBy(desc(schema.speedingEvents.occurredAt));
  const spWindow = speeding.filter((s) => now - +s.occurredAt <= SPEEDING_WINDOW_DAYS * 86_400_000);

  const clocks = logs.length > 0 ? computeClocks(logs) : null;
  const restHrs = hoursSinceQualifyingRest(logs);

  const components: Component[] = [];

  components.push({
    key: "drivingLoad",
    label: "Driving hours used against the 11-hour limit",
    weight: FATIGUE_WEIGHTS.drivingLoad,
    value: clocks ? clamp01(clocks.drivingUsed / DRIVING_LIMIT_MIN) : null,
    detail: clocks
      ? `${clocks.drivingUsed} of ${DRIVING_LIMIT_MIN} minutes used.`
      : "No hos_logs rows for this driver.",
    source: "hos_logs via computeClocks() in api/routes/hos.ts",
  });

  components.push({
    key: "windowLoad",
    label: "On-duty window used against the 14-hour window",
    weight: FATIGUE_WEIGHTS.windowLoad,
    value: clocks ? clamp01(clocks.onDutyWindowUsed / WINDOW_LIMIT_MIN) : null,
    detail: clocks
      ? `${clocks.onDutyWindowUsed} of ${WINDOW_LIMIT_MIN} minutes elapsed in the current window.`
      : "No hos_logs rows for this driver.",
    source: "hos_logs via computeClocks() in api/routes/hos.ts",
  });

  components.push({
    key: "restRecency",
    label: "Time since the last 10-hour-or-longer off-duty block",
    weight: FATIGUE_WEIGHTS.restRecency,
    // 0 at the moment rest ends, 1 at 14 hours since — the length of the window.
    value: restHrs === null ? null : clamp01(restHrs / 14),
    detail: restHrs === null
      ? "No completed off-duty or sleeper block of 10 hours or more is on file, so recency cannot be measured."
      : `${restHrs.toFixed(1)} hours since the last qualifying rest ended.`,
    source: "hos_logs (off_duty / sleeper rows with an end time)",
  });

  const laneRows = telWindow.length;
  const laneHits = telWindow.filter((t) => t.laneDeparture).length;
  const harshHits = telWindow.filter((t) => t.harshBrake || t.harshAccel).length;
  components.push({
    key: "laneDeparture",
    label: "Lane departures and harsh events in the last 8 hours of telemetry",
    weight: FATIGUE_WEIGHTS.laneDeparture,
    // 1 would be an event on every sample; 0.25 of samples is treated as the top of the scale.
    value: laneRows >= MIN_TELEMETRY_SAMPLES ? clamp01(((laneHits + harshHits) / laneRows) / 0.25) : null,
    detail: laneRows >= MIN_TELEMETRY_SAMPLES
      ? `${laneHits} lane departures and ${harshHits} harsh brake/accel events across ${laneRows} samples.`
      : `Only ${laneRows} telemetry samples in the last ${WINDOW_HOURS_TELEMETRY} hours. ${MIN_TELEMETRY_SAMPLES} are required before this component is scored.`,
    source: "eld_telemetry",
  });

  const severe = spWindow.filter((s) => s.severity === "severe").length;
  const moderate = spWindow.filter((s) => s.severity === "moderate").length;
  const minor = spWindow.filter((s) => s.severity === "minor").length;
  const spPoints = severe * 3 + moderate * 2 + minor * 1;
  components.push({
    key: "speeding",
    label: `Speeding events in the last ${SPEEDING_WINDOW_DAYS} days`,
    weight: FATIGUE_WEIGHTS.speeding,
    // 10 weighted points in the window is treated as the top of the scale.
    value: speeding.length === 0 ? null : clamp01(spPoints / 10),
    detail: speeding.length === 0
      ? "No speeding_events rows exist for this driver at all, so nothing is inferred either way."
      : `${severe} severe, ${moderate} moderate, ${minor} minor in the window (weighted ${spPoints}).`,
    source: "speeding_events",
  });

  const scored = components.filter((c) => c.value !== null);
  const totalWeight = scored.reduce((a, c) => a + c.weight, 0);
  const index = scored.length >= MIN_COMPONENTS && totalWeight > 0
    ? Math.round(scored.reduce((a, c) => a + c.value! * c.weight, 0) / totalWeight * 100)
    : null;

  return {
    driverId,
    index,
    insufficientData: index === null,
    ...(index === null
      ? { level: "unknown", levelLabel: "Not scored", levelNote: `Only ${scored.length} of ${components.length} components have data. ${MIN_COMPONENTS} are required.` }
      : { level: levelFor(index).level, levelLabel: levelFor(index).label, levelNote: levelFor(index).note }),
    componentsScored: scored.length,
    componentsTotal: components.length,
    weightApplied: totalWeight,
    components,
    clocks,
    hosViolations: clocks ? hosViolations(clocks) : [],
    counts: {
      hosLogs: logs.length,
      telemetryTotal: telemetry.length,
      telemetryInWindow: telWindow.length,
      speedingTotal: speeding.length,
      speedingInWindow: spWindow.length,
    },
    prediction: null,
    predictionNote:
      "This platform publishes no fatigue forecast. Predicting a driver's state hours ahead needs an outcome-labelled dataset this platform does not have. The index describes right now, from rows that exist.",
    confidence: null,
    confidenceNote:
      "No confidence or accuracy figure is published for this index. It is a weighted sum, not a model with a measured error rate.",
  };
}

export const intelligence = new Hono()
  .use("*", async (_c, next) => { await ensureSeed(); await next(); })

  /** What every intelligence surface in this app actually is. */
  .get("/", async (c) => {
    const started = Date.now();
    const [driverRows, hosRows, telRows, spRows, loadRows, bridgeRows, decisionRows] = await Promise.all([
      db.select().from(schema.drivers),
      db.select().from(schema.hosLogs),
      db.select().from(schema.eldTelemetry).limit(1000),
      db.select().from(schema.speedingEvents),
      db.select().from(schema.loads),
      db.select().from(schema.lowBridges).limit(1),
      db.select().from(schema.dispatchDecisions),
    ]);

    return c.json({
      surfaces: [
        {
          id: "hos-analytics",
          name: "HOS Analytics",
          pages: ["/hos-analytics", "/fatigue-analysis"],
          computes: "A fatigue index per driver from HOS clocks, rest recency, ELD telemetry events and speeding events.",
          endpoint: "/api/intelligence/fatigue",
          live: hosRows.length > 0,
        },
        {
          id: "dispatch-nexus",
          name: "Dispatch Nexus",
          pages: ["/dispatch-nexus", "/nexus"],
          computes: "Load-to-driver matching by revenue per remaining clock hour.",
          endpoint: "/api/dispatch-zero/status",
          live: loadRows.length > 0 && driverRows.length > 0,
        },
        {
          id: "routing-engine",
          name: "Routing Engine",
          pages: ["/routing-engine"],
          computes: "Truck routing legs and low-bridge clearance checks against FHWA NBI item 54B.",
          endpoint: "/api/routing/plan",
          live: bridgeRows.length > 0,
        },
        {
          id: "fleet-intelligence",
          name: "Fleet Intelligence",
          pages: ["/fleet-intelligence", "/industry-ai"],
          computes: "Fleet-wide roll-up of the same per-driver components. No industry benchmark is used, because none is licensed.",
          endpoint: "/api/intelligence/fatigue",
          live: driverRows.length > 0,
        },
        {
          id: "fleet-mind",
          name: "Fleet Mind",
          pages: ["/mind", "/unified"],
          computes: "Gemini-backed assistant over fleet context. It is a language model, not an inference engine over the fleet.",
          endpoint: "/api/gemini",
          live: Boolean(process.env.GEMINI_API_KEY),
        },
        {
          id: "driver-nerve",
          name: "Driver Nerve",
          pages: ["/nerve"],
          computes: "Signal fan-out to a driver: haptic patterns and duty alerts. Delivery is only confirmed when a device confirms it.",
          endpoint: "/api/haptic",
          live: true,
        },
        {
          id: "integration-hub",
          name: "Integration Hub",
          pages: ["/integration-hub"],
          computes: "Credential state for the 19 tracked providers. Boolean only — no key value ever leaves the server.",
          endpoint: "/api/integrations/status",
          live: true,
        },
      ],
      inputs: {
        drivers: driverRows.length,
        hosLogs: hosRows.length,
        eldTelemetry: telRows.length,
        speedingEvents: spRows.length,
        loads: loadRows.length,
        dispatchDecisions: decisionRows.length,
      },
      fatigue: {
        weights: FATIGUE_WEIGHTS,
        minComponents: MIN_COMPONENTS,
        minTelemetrySamples: MIN_TELEMETRY_SAMPLES,
        basis:
          "Component weights are product judgement informed by the 49 CFR 395 limits. They are not a validated clinical fatigue model and are not published as one.",
      },
      notClaimed: [
        "No machine-learning model, no training data, no inference engine — the index is a weighted sum.",
        "No fatigue prediction hours ahead.",
        "No accuracy or confidence percentage for any output.",
        "No sign-language video generation — that feature is not built.",
        "TruckWithEase is not an FMCSA-registered ELD and files nothing with any agency.",
      ],
      measuredMs: Date.now() - started,
      generatedAt: new Date().toISOString(),
    }, 200);
  })

  /** Fatigue index for every driver on file. */
  .get("/fatigue", async (c) => {
    const started = Date.now();
    const roster = await db.select().from(schema.drivers);
    const rows = await Promise.all(roster.map((d) => fatigueForDriver(d.id)));
    const merged = rows.map((r, i) => ({ ...r, name: roster[i].name, truckNumber: roster[i].truckNumber, status: roster[i].status }));
    const scored = merged.filter((r) => r.index !== null);
    return c.json({
      drivers: merged,
      counts: {
        total: merged.length,
        scored: scored.length,
        notScored: merged.length - scored.length,
        stop: scored.filter((r) => r.level === "stop").length,
        elevated: scored.filter((r) => r.level === "elevated").length,
        normal: scored.filter((r) => r.level === "normal").length,
      },
      fleetIndex: scored.length > 0 ? Math.round(scored.reduce((a, r) => a + r.index!, 0) / scored.length) : null,
      fleetIndexNote: scored.length === 0
        ? "No driver has enough data to be scored, so there is no fleet index."
        : `Mean of the ${scored.length} drivers that could be scored. Unscored drivers are excluded rather than counted as zero.`,
      weights: FATIGUE_WEIGHTS,
      measuredMs: Date.now() - started,
      generatedAt: new Date().toISOString(),
    }, 200);
  })

  .get("/fatigue/:driverId", async (c) => {
    const driverId = c.req.param("driverId");
    const [driver] = await db.select().from(schema.drivers).where(eq(schema.drivers.id, driverId));
    if (!driver) return c.json({ error: "driver_not_found", driverId }, 404);
    const started = Date.now();
    const result = await fatigueForDriver(driverId);
    return c.json({ ...result, name: driver.name, truckNumber: driver.truckNumber, status: driver.status, measuredMs: Date.now() - started }, 200);
  });
