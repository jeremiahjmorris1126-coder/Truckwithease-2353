import { Hono } from "hono";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { readInterval } from "../lib/dutyclock";

/**
 * Week In Review — a driver's real week, aggregated from rows that exist.
 *
 * The legacy page shipped a hardcoded WEEK_DATA object ("Ray Davis", 2,847
 * miles, 98/100 safety score, $847 deductions, a 31-day streak) and presented
 * it as the signed-in driver's week. All of it was invented, so it is gone.
 *
 * Every figure below is counted from trips / loads / hos_logs /
 * dvir_inspections / speeding_events / safety_scores. When a source has no
 * rows for the week, the field is null and carries a reason, so the UI renders
 * NOT TRACKED instead of a zero that reads like a clean week.
 */

const rid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** Monday 00:00 through Sunday 23:59:59 for the week containing `ref`. */
function weekBounds(ref: Date) {
  const d = new Date(ref);
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow, 0, 0, 0, 0);
  const end = new Date(start.getTime() + 7 * 86400_000 - 1);
  return { start, end };
}

type Metric<T> = { value: T | null; source: string; reason?: string };

function tracked<T>(value: T, source: string): Metric<T> {
  return { value, source };
}
function notTracked(source: string, reason: string): Metric<never> {
  return { value: null, source, reason };
}

export const weekReview = new Hono()
  /**
   * GET /api/week-review/:driverId?weekOf=YYYY-MM-DD
   * Real aggregates for that driver's week. Nothing is estimated.
   */
  .get("/:driverId", async (c) => {
    const driverId = c.req.param("driverId");
    const weekOf = c.req.query("weekOf");
    const ref = weekOf ? new Date(`${weekOf}T12:00:00`) : new Date();
    if (Number.isNaN(ref.getTime())) return c.json({ error: "weekOf must be YYYY-MM-DD" }, 400);
    const { start, end } = weekBounds(ref);

    const driver = (await db.select().from(schema.drivers).where(eq(schema.drivers.id, driverId)).limit(1))[0];
    if (!driver) {
      return c.json({ error: `No driver ${driverId}. Week In Review reports a real driver's rows only.` }, 404);
    }

    const [weekTrips, weekLoads, weekHos, weekDvir, weekSpeeding, latestScore] = await Promise.all([
      db
        .select()
        .from(schema.trips)
        .where(and(eq(schema.trips.driverId, driverId), gte(schema.trips.createdAt, start), lte(schema.trips.createdAt, end))),
      db
        .select()
        .from(schema.loads)
        .where(and(eq(schema.loads.bookedByDriverId, driverId), gte(schema.loads.createdAt, start), lte(schema.loads.createdAt, end))),
      db
        .select()
        .from(schema.hosLogs)
        .where(and(eq(schema.hosLogs.driverId, driverId), gte(schema.hosLogs.startedAt, start), lte(schema.hosLogs.startedAt, end))),
      db
        .select()
        .from(schema.dvirInspections)
        .where(and(eq(schema.dvirInspections.driverId, driverId), gte(schema.dvirInspections.createdAt, start), lte(schema.dvirInspections.createdAt, end))),
      db
        .select()
        .from(schema.speedingEvents)
        .where(and(eq(schema.speedingEvents.driverId, driverId), gte(schema.speedingEvents.occurredAt, start), lte(schema.speedingEvents.occurredAt, end))),
      db.select().from(schema.safetyScores).where(eq(schema.safetyScores.driverId, driverId)).orderBy(desc(schema.safetyScores.computedAt)).limit(1),
    ]);

    // Miles — trips are the only mileage source; loads carry planned miles, not driven miles.
    const tripMiles = weekTrips.reduce((s, t) => s + (t.miles ?? 0), 0);
    const miles: Metric<number> = weekTrips.length
      ? tracked(Math.round(tripMiles), "trips.miles")
      : notTracked("trips", "No trips logged for this driver this week — mileage is not tracked from any other source.");

    // Drive hours — closed driving segments only. Open segments are excluded, not guessed.
    const drivingSegs = weekHos.filter((h) => h.status === "driving");
    // One rule for reading an interval: lib/dutyclock.readInterval. Open rows
    // (in progress, or stale and abandoned) contribute no completed hours.
    const nowMs = Date.now();
    const closedIvs = drivingSegs
      .map((h) => readInterval(h, nowMs))
      .filter((v): v is Extract<typeof v, { usable: true }> => v.usable && !v.open);
    const closed = closedIvs;
    const driveMs = closedIvs.reduce((s, v) => s + (v.endMs - v.startMs), 0);
    const driveHours: Metric<number> = closed.length
      ? tracked(+(driveMs / 3_600_000).toFixed(1), "hos_logs (closed driving segments)")
      : notTracked("hos_logs", drivingSegs.length ? "Driving segments are still open — no completed hours to total." : "No HOS driving segments logged this week.");

    // Loads and revenue — only loads booked by this driver in this week.
    const loadsCount: Metric<number> = weekLoads.length
      ? tracked(weekLoads.length, "loads (booked_by_driver_id)")
      : notTracked("loads", "No loads booked to this driver this week.");
    const revenueRows = weekLoads.filter((l) => typeof l.rate === "number");
    const revenue: Metric<number> = revenueRows.length
      ? tracked(+revenueRows.reduce((s, l) => s + (l.rate ?? 0), 0).toFixed(2), "loads.rate")
      : notTracked("loads.rate", "No booked load this week carries a rate.");

    // Best load by rate per mile — computed, not chosen.
    const rpmRows = weekLoads
      .filter((l) => typeof l.rate === "number" && typeof l.miles === "number" && (l.miles ?? 0) > 0)
      .map((l) => ({ lane: `${l.origin} → ${l.destination}`, rate: l.rate!, miles: l.miles!, rpm: +(l.rate! / l.miles!).toFixed(2) }))
      .sort((a, b) => b.rpm - a.rpm);
    const bestLoad = rpmRows[0]
      ? { value: rpmRows[0], source: "loads.rate / loads.miles" }
      : notTracked("loads", "No booked load this week has both a rate and a mileage, so rate-per-mile cannot be computed.");

    // DVIR
    const dvirWithDefects = weekDvir.filter((d) => d.hasDefects).length;
    const dvir: Metric<{ submitted: number; withDefects: number; unsafe: number }> = weekDvir.length
      ? tracked({ submitted: weekDvir.length, withDefects: dvirWithDefects, unsafe: weekDvir.filter((d) => !d.safeToOperate).length }, "dvir_inspections")
      : notTracked("dvir_inspections", "No DVIR submitted this week — this is a compliance gap, not a clean week.");

    // Speeding
    const speeding: Metric<{ total: number; severe: number }> = tracked(
      { total: weekSpeeding.length, severe: weekSpeeding.filter((s) => s.severity === "severe").length },
      "speeding_events",
    );

    // Safety score — read from the safety engine, never recomputed here.
    const score = latestScore[0];
    const safety =
      score && !score.insufficientData && score.score !== null
        ? { value: { score: score.score, grade: score.grade, windowDays: score.windowDays, computedAt: score.computedAt }, source: "safety_scores" }
        : notTracked(
            "safety_scores",
            score ? score.note || "The safety engine has too little data to score this driver." : "No safety score has been computed for this driver yet.",
          );

    return c.json(
      {
        driver: { id: driver.id, name: driver.name ?? null },
        week: { start: start.toISOString(), end: end.toISOString(), weekEnding: end.toISOString().slice(0, 10) },
        metrics: { miles, driveHours, loads: loadsCount, revenue, bestLoad, dvir, speeding, safety },
        points: {
          value: typeof driver.points === "number" ? driver.points : null,
          source: "drivers.points (lifetime balance)",
          reason: typeof driver.points === "number" ? undefined : "No points balance on this driver record.",
          note: "This is the lifetime Rig Bucks balance. Points earned in a single week are not ledgered to the database yet, so no weekly delta is shown.",
        },
        notTracked: [
          "Week-over-week comparison — no historical weekly snapshot table exists yet.",
          "Tax deductions found and fuel savings — TRAXES does not write a weekly total to the database.",
          "Weigh station bypasses — no bypass table exists.",
          "Clean-day streak — requires a daily compliance evaluation job that is not running.",
        ],
        generatedAt: new Date().toISOString(),
      },
      200,
    );
  })

  /** POST /api/week-review/subscribe { email, driverId? } — real row, real table. */
  .post("/subscribe", async (c) => {
    const b = (await c.req.json().catch(() => ({}))) as { email?: string; driverId?: string; weekEnding?: string };
    const email = (b.email || "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return c.json({ error: "A valid email is required." }, 400);

    const row = {
      id: rid("wrs"),
      driverId: b.driverId ?? null,
      email,
      weekEnding: b.weekEnding ?? null,
      active: true,
    };
    await db.insert(schema.weekReviewSubscriptions).values(row);

    return c.json(
      {
        subscribed: true,
        id: row.id,
        email,
        delivery: {
          live: false,
          provider: null,
          note: "Your address is saved. Friday email delivery is not switched on yet — no sending domain is verified for TruckWithEase, so nothing is being mailed. You will not get a recap until that is live.",
        },
      },
      201,
    );
  })

  /** GET /api/week-review/subscribers — admin view of who opted in. */
  .get("/subscribers/list", async (c) => {
    const rows = await db.select().from(schema.weekReviewSubscriptions).orderBy(desc(schema.weekReviewSubscriptions.createdAt)).limit(500);
    return c.json({ subscribers: rows, count: rows.length }, 200);
  });

export default weekReview;
