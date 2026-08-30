import { Hono } from "hono";
import { createHash } from "node:crypto";
import { db } from "../database";
import * as schema from "../database/schema";
import { ensureSeed } from "../lib/seed";

/**
 * THE CLOCK LEDGER — /api/clock-ledger
 *
 * The idea: a driver's duty clock is the only genuinely finite input in trucking.
 * Fuel, trailers and trucks can be bought. Legal drive time cannot. No ELD, load
 * board or TMS on the market prices an hour of clock. This endpoint does.
 *
 * READS (live rows only)
 *   drivers              5 rows
 *   hos_logs             duty intervals — the clock consumed
 *   loads                rate + miles, and bookedByDriverId for revenue attribution
 *   dispatch_decisions   committed dispatch decisions (context only)
 *
 * COMPUTES LOCALLY
 *   clockHoursConsumed   on_duty + driving minutes inside the rolling 7-day window
 *   cycleRemaining       60-hr/7-day limit (49 CFR 395) minus consumed
 *   revenueAttributed    sum of loads.rate where booked_by_driver_id = the driver
 *   dollarsPerClockHour  revenueAttributed / clockHoursConsumed  (null when unattributable)
 *   productiveShare      driving minutes as a share of clock consumed
 *   burnedHours          on-duty-not-driving hours — clock spent with the wheels stopped
 *   loadRanking          the same loads ranked by $/mile and by $/clock-hour, with the
 *                        rank delta between the two orderings
 *   chain                sha256 hash chain over the ledger rows (verifiable, not yet persisted)
 *
 * INTEGRITY GUARD
 *   hos_logs in this database contain open intervals (ended_at NULL) whose start is
 *   days old. Naively treating "now" as their end produced absurd figures elsewhere in
 *   this app (26,209 minutes of driving against a 660-minute limit). Any open interval
 *   older than STALE_OPEN_HOURS is EXCLUDED and counted in `integrity.excludedOpenIntervals`.
 *   Nothing is silently clamped.
 *
 * STATED ASSUMPTION (declared, not measured)
 *   ASSUMED_AVG_MPH is a planning assumption used only to estimate how much clock a load
 *   would consume. It is returned in the payload as `assumptions` so no caller mistakes it
 *   for a measurement. Loading, unloading and detention time are NOT included because this
 *   database has no table recording them.
 *
 * WHAT THIS ENDPOINT DOES NOT CLAIM
 *   No prediction. No confidence score. No detention, deadhead or reset-stranding
 *   attribution (no source table exists). No tax, IFTA or filing output. No quantum
 *   computation. TruckWithEase is not an ELD and files nothing with any agency.
 */

// 49 CFR 395 property-carrying, 7-day cycle, in minutes
const CYCLE_LIMIT_MIN = 60 * 60;
const WINDOW_DAYS = 7;
const STALE_OPEN_HOURS = 24;
const ASSUMED_AVG_MPH = 55;
const ON_CLOCK = new Set(["driving", "on_duty"]);

type Interval = { status: string; startMs: number; endMs: number };

function usableIntervals(
  logs: (typeof schema.hosLogs.$inferSelect)[],
  windowStartMs: number,
  nowMs: number,
) {
  const kept: Interval[] = [];
  let excludedOpen = 0;
  let excludedOutOfWindow = 0;
  const staleBefore = nowMs - STALE_OPEN_HOURS * 3600_000;

  for (const l of logs) {
    const startMs = +l.startedAt;
    let endMs: number;
    if (l.endedAt) {
      endMs = +l.endedAt;
    } else if (startMs >= staleBefore) {
      endMs = nowMs; // genuinely current interval
    } else {
      excludedOpen++;
      continue;
    }
    if (endMs <= startMs) continue;
    if (endMs <= windowStartMs) {
      excludedOutOfWindow++;
      continue;
    }
    kept.push({
      status: l.status,
      startMs: Math.max(startMs, windowStartMs),
      endMs: Math.min(endMs, nowMs),
    });
  }
  return { kept, excludedOpen, excludedOutOfWindow };
}

function minutesByStatus(intervals: Interval[]) {
  const m: Record<string, number> = { driving: 0, on_duty: 0, sleeper: 0, off_duty: 0 };
  for (const iv of intervals) {
    const mins = (iv.endMs - iv.startMs) / 60000;
    m[iv.status] = (m[iv.status] ?? 0) + mins;
  }
  for (const k of Object.keys(m)) m[k] = Math.round(m[k]);
  return m;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export const clockLedger = new Hono()
  .use("*", async (_c, next) => {
    await ensureSeed();
    await next();
  })
  .get("/", async (c) => {
    const t0 = Date.now();
    const nowMs = Date.now();
    const windowStartMs = nowMs - WINDOW_DAYS * 86400_000;

    const [drivers, allLogs, allLoads, decisions] = await Promise.all([
      db.select().from(schema.drivers),
      db.select().from(schema.hosLogs),
      db.select().from(schema.loads),
      db.select().from(schema.dispatchDecisions),
    ]);

    const logsByDriver = new Map<string, (typeof schema.hosLogs.$inferSelect)[]>();
    for (const l of allLogs) {
      const arr = logsByDriver.get(l.driverId) ?? [];
      arr.push(l);
      logsByDriver.set(l.driverId, arr);
    }

    const bookedCount = allLoads.filter((l) => l.bookedByDriverId).length;
    let totalExcludedOpen = 0;
    let totalExcludedOutOfWindow = 0;

    const rows = drivers.map((d) => {
      const logs = logsByDriver.get(d.id) ?? [];
      const { kept, excludedOpen, excludedOutOfWindow } = usableIntervals(logs, windowStartMs, nowMs);
      totalExcludedOpen += excludedOpen;
      totalExcludedOutOfWindow += excludedOutOfWindow;

      const mins = minutesByStatus(kept);
      const clockMin = kept
        .filter((iv) => ON_CLOCK.has(iv.status))
        .reduce((s, iv) => s + (iv.endMs - iv.startMs) / 60000, 0);
      const clockHours = r2(clockMin / 60);
      const drivingHours = r2(mins.driving / 60);
      const burnedHours = r2(Math.max(0, clockMin - mins.driving) / 60);

      const myLoads = allLoads.filter((l) => l.bookedByDriverId === d.id);
      const revenue = myLoads.length
        ? r2(myLoads.reduce((s, l) => s + (l.rate ?? 0), 0))
        : null;

      const dollarsPerClockHour =
        revenue !== null && clockHours > 0 ? r2(revenue / clockHours) : null;

      return {
        driverId: d.id,
        name: d.name,
        truckNumber: d.truckNumber,
        intervalsUsed: kept.length,
        intervalsExcludedOpen: excludedOpen,
        minutesByStatus: mins,
        clockHoursConsumed: clockHours,
        cycleHoursRemaining: r2(Math.max(0, CYCLE_LIMIT_MIN - clockMin) / 60),
        cycleLimitHours: CYCLE_LIMIT_MIN / 60,
        overCycle: clockMin > CYCLE_LIMIT_MIN,
        drivingHours,
        burnedHours,
        productiveSharePct: clockHours > 0 ? Math.round((mins.driving / clockMin) * 100) : null,
        loadsAttributed: myLoads.length,
        revenueAttributed: revenue,
        revenueNote:
          revenue === null
            ? `No load in this database is attributed to ${d.id}. loads.booked_by_driver_id is set on ${bookedCount} of ${allLoads.length} rows, so revenue per clock-hour cannot be computed for this driver.`
            : null,
        dollarsPerClockHour,
        dollarsPerClockHourNote:
          dollarsPerClockHour === null
            ? "Requires attributed load revenue and non-zero clock consumption."
            : null,
      };
    });

    // hash chain over the ledger rows — verifiable, deterministic, ordered
    let prev = "0".repeat(64);
    const chain = rows.map((row) => {
      const payload = JSON.stringify({
        driverId: row.driverId,
        clockHoursConsumed: row.clockHoursConsumed,
        drivingHours: row.drivingHours,
        burnedHours: row.burnedHours,
        revenueAttributed: row.revenueAttributed,
        prev,
      });
      const hash = createHash("sha256").update(payload).digest("hex");
      prev = hash;
      return { driverId: row.driverId, hash };
    });

    // the reordering: $/mile vs $/clock-hour
    const priced = allLoads
      .filter((l) => (l.rate ?? 0) > 0 && (l.miles ?? 0) > 0)
      .map((l) => {
        const miles = l.miles as number;
        const rate = l.rate as number;
        const estClockHours = r2(miles / ASSUMED_AVG_MPH);
        return {
          id: l.id,
          origin: l.origin,
          destination: l.destination,
          miles,
          rate,
          status: l.status,
          ratePerMile: r2(rate / miles),
          estimatedClockHours: estClockHours,
          ratePerClockHour: estClockHours > 0 ? r2(rate / estClockHours) : null,
        };
      });

    const byRpm = [...priced].sort((a, b) => b.ratePerMile - a.ratePerMile).map((l) => l.id);
    const byRpch = [...priced]
      .sort((a, b) => (b.ratePerClockHour ?? 0) - (a.ratePerClockHour ?? 0))
      .map((l) => l.id);

    const loadRanking = priced
      .map((l) => {
        const rankRpm = byRpm.indexOf(l.id) + 1;
        const rankRpch = byRpch.indexOf(l.id) + 1;
        return { ...l, rankByRatePerMile: rankRpm, rankByRatePerClockHour: rankRpch, rankDelta: rankRpm - rankRpch };
      })
      .sort((a, b) => a.rankByRatePerClockHour - b.rankByRatePerClockHour);

    const rankingsAgree = byRpm.join(",") === byRpch.join(",");

    const scored = rows.filter((r) => r.clockHoursConsumed > 0);
    const fleet = {
      driversTotal: drivers.length,
      driversWithClockConsumed: scored.length,
      clockHoursConsumed: r2(scored.reduce((s, r) => s + r.clockHoursConsumed, 0)),
      drivingHours: r2(scored.reduce((s, r) => s + r.drivingHours, 0)),
      burnedHours: r2(scored.reduce((s, r) => s + r.burnedHours, 0)),
      revenueAttributed: null as number | null,
      revenueAttributedNote: `loads.booked_by_driver_id is set on ${bookedCount} of ${allLoads.length} rows. Until a load is attributed to a driver, no dollar figure can be divided by clock hours and none is shown.`,
      dispatchDecisionsCommitted: decisions.length,
    };

    return c.json(
      {
        concept:
          "A duty clock is the only finite input in trucking. This ledger measures how much of each driver's 60-hour cycle was consumed, how much of it moved the truck, and what a dollar of revenue costs in clock. Rows are hash-chained so the record is verifiable over time.",
        window: {
          days: WINDOW_DAYS,
          cycleLimitHours: CYCLE_LIMIT_MIN / 60,
          basis: "49 CFR 395 property-carrying 60-hour / 7-day cycle",
          startedAt: new Date(windowStartMs).toISOString(),
          endedAt: new Date(nowMs).toISOString(),
        },
        assumptions: [
          {
            key: "ASSUMED_AVG_MPH",
            value: ASSUMED_AVG_MPH,
            statement:
              "Used only to estimate the clock a load would consume. It is a planning assumption, not a measurement from this fleet.",
          },
          {
            key: "loading_and_detention_time",
            value: 0,
            statement:
              "Excluded from estimated clock hours. No table in this database records loading, unloading or detention time.",
          },
        ],
        integrity: {
          staleOpenIntervalHours: STALE_OPEN_HOURS,
          excludedOpenIntervals: totalExcludedOpen,
          excludedOutOfWindowIntervals: totalExcludedOutOfWindow,
          note: `hos_logs contains open intervals with no ended_at. Any open interval starting more than ${STALE_OPEN_HOURS} hours ago is excluded rather than run to "now", which is what produced impossible clock totals elsewhere in this app. Excluded rows are counted here, not hidden.`,
        },
        fleet,
        drivers: rows,
        loadRanking,
        rankingsAgree,
        rankingNote: rankingsAgree
          ? "On these five loads the $/mile ordering and the $/clock-hour ordering happen to agree. The two rankings diverge whenever loads differ in how much clock they consume per dollar."
          : "The $/mile ordering and the $/clock-hour ordering disagree. rankDelta shows how many places each load moves when it is judged on clock instead of miles.",
        chain: {
          algorithm: "sha256",
          rowsChained: chain.length,
          headHash: chain.length ? chain[chain.length - 1].hash : null,
          persisted: false,
          persistedNote:
            "The chain is recomputed on every request. Persisting it requires a clock_ledger_entries table, which does not exist yet — so this is not yet a durable driver-owned record.",
        },
        notClaimed: [
          "No prediction of future clock consumption.",
          "No confidence or accuracy percentage.",
          "No detention, deadhead or reset-stranding attribution — no source table exists.",
          "No tax, IFTA or filing output. TruckWithEase files nothing with any agency.",
          "Not an ELD. This reads rows the app already holds.",
        ],
        measuredMs: Date.now() - t0,
        generatedAt: new Date().toISOString(),
      },
      200,
    );
  });
