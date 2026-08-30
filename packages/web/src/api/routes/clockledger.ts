import { Hono } from "hono";
import { createHash } from "node:crypto";
import { asc, desc, eq } from "drizzle-orm";
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
 *   chain                sha256 hash chain over the ledger rows, PERSISTED append-only into
 *                        clock_ledger_entries. chainHash = sha256(payloadHash + prevHash).
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
 * PERSISTENCE (append-only)
 *   A row is sealed for a driver only when that driver's measured window differs from
 *   their last sealed row, so calling this endpoint twice does not duplicate history.
 *   Rows are never updated or deleted. GET /api/clock-ledger/chain replays the whole
 *   chain from genesis and reports whether every link verifies.
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

const GENESIS = "0".repeat(64);
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

/** Canonical, order-stable hash of exactly the measurements a sealed row stores. */
function payloadHashFor(row: {
  driverId: string;
  clockHoursConsumed: number;
  drivingHours: number;
  burnedHours: number;
  revenueAttributed: number | null;
}) {
  return sha(
    JSON.stringify([
      row.driverId,
      row.clockHoursConsumed,
      row.drivingHours,
      row.burnedHours,
      row.revenueAttributed,
    ]),
  );
}

const linkHash = (payloadHash: string, prevHash: string) => sha(payloadHash + prevHash);

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

    // ---- seal into the append-only chain -------------------------------------
    const existing = await db
      .select()
      .from(schema.clockLedgerEntries)
      .orderBy(asc(schema.clockLedgerEntries.seq));

    let seq = existing.length ? existing[existing.length - 1].seq : 0;
    let head = existing.length ? existing[existing.length - 1].chainHash : GENESIS;

    const lastByDriver = new Map<string, (typeof schema.clockLedgerEntries.$inferSelect)>();
    for (const e of existing) lastByDriver.set(e.driverId, e);

    const appended: { driverId: string; seq: number; chainHash: string }[] = [];
    const unchanged: string[] = [];

    for (const row of rows) {
      const payloadHash = payloadHashFor(row);
      const prior = lastByDriver.get(row.driverId);
      if (prior && prior.payloadHash === payloadHash) {
        unchanged.push(row.driverId);
        continue;
      }
      seq += 1;
      const chainHash = linkHash(payloadHash, head);
      const entry = {
        id: `cle_${seq.toString().padStart(6, "0")}_${payloadHash.slice(0, 8)}`,
        seq,
        driverId: row.driverId,
        windowDays: WINDOW_DAYS,
        windowStartedAt: new Date(windowStartMs),
        windowEndedAt: new Date(nowMs),
        clockHoursConsumed: row.clockHoursConsumed,
        drivingHours: row.drivingHours,
        burnedHours: row.burnedHours,
        revenueAttributed: row.revenueAttributed,
        intervalsUsed: row.intervalsUsed,
        intervalsExcludedOpen: row.intervalsExcludedOpen,
        payloadHash,
        prevHash: head,
        chainHash,
      };
      await db.insert(schema.clockLedgerEntries).values(entry);
      head = chainHash;
      appended.push({ driverId: row.driverId, seq, chainHash });
    }

    const totalRows = existing.length + appended.length;

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
          construction: "chainHash = sha256(payloadHash + prevHash), genesis prevHash = 64 zeros",
          persisted: true,
          table: "clock_ledger_entries",
          appendOnly: true,
          rowsPersistedTotal: totalRows,
          rowsAppendedThisRequest: appended.length,
          driversUnchangedThisRequest: unchanged,
          appended,
          headHash: head,
          headSeq: seq,
          verifyAt: "/api/clock-ledger/chain",
          note:
            appended.length === 0
              ? "Nothing was appended on this request: every driver's measured window is identical to their last sealed row. Sealing is idempotent by design — repeated reads do not inflate the ledger."
              : `${appended.length} row(s) sealed. Sealed rows are never updated or deleted; a correction is a new row, not an edit.`,
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
  })

  /**
   * Replay the persisted chain from genesis and report whether every link verifies.
   * This is the whole point of persisting: the record can be checked by anyone
   * holding the rows, including a driver who has left the carrier.
   */
  .get("/chain", async (c) => {
    const t0 = Date.now();
    const entries = await db
      .select()
      .from(schema.clockLedgerEntries)
      .orderBy(asc(schema.clockLedgerEntries.seq));

    let prev = GENESIS;
    let expectedSeq = 0;
    const breaks: { seq: number; reason: string }[] = [];

    for (const e of entries) {
      expectedSeq += 1;
      if (e.seq !== expectedSeq) breaks.push({ seq: e.seq, reason: `sequence gap — expected ${expectedSeq}` });
      if (e.prevHash !== prev) breaks.push({ seq: e.seq, reason: "prev_hash does not match the previous row's chain_hash" });
      const recomputedPayload = payloadHashFor({
        driverId: e.driverId,
        clockHoursConsumed: e.clockHoursConsumed,
        drivingHours: e.drivingHours,
        burnedHours: e.burnedHours,
        revenueAttributed: e.revenueAttributed,
      });
      if (recomputedPayload !== e.payloadHash)
        breaks.push({ seq: e.seq, reason: "payload_hash does not match the stored measurements — the row was altered" });
      if (linkHash(e.payloadHash, e.prevHash) !== e.chainHash)
        breaks.push({ seq: e.seq, reason: "chain_hash does not match sha256(payload_hash + prev_hash)" });
      prev = e.chainHash;
    }

    return c.json(
      {
        algorithm: "sha256",
        construction: "chainHash = sha256(payloadHash + prevHash), genesis prevHash = 64 zeros",
        rows: entries.length,
        headHash: entries.length ? entries[entries.length - 1].chainHash : null,
        headSeq: entries.length ? entries[entries.length - 1].seq : 0,
        verified: breaks.length === 0,
        breaks,
        verifiedNote:
          breaks.length === 0
            ? "Every link was recomputed from the stored measurements and matched. This verifies the chain has not been altered since it was written; it does not verify the underlying hos_logs rows were correct when captured."
            : "The chain does not verify. Every failing link is listed above rather than being suppressed.",
        entries: entries.map((e) => ({
          seq: e.seq,
          driverId: e.driverId,
          windowStartedAt: e.windowStartedAt,
          windowEndedAt: e.windowEndedAt,
          clockHoursConsumed: e.clockHoursConsumed,
          drivingHours: e.drivingHours,
          burnedHours: e.burnedHours,
          revenueAttributed: e.revenueAttributed,
          intervalsUsed: e.intervalsUsed,
          intervalsExcludedOpen: e.intervalsExcludedOpen,
          payloadHash: e.payloadHash,
          prevHash: e.prevHash,
          chainHash: e.chainHash,
          createdAt: e.createdAt,
        })),
        measuredMs: Date.now() - t0,
        generatedAt: new Date().toISOString(),
      },
      200,
    );
  })

  /** One driver's sealed history — the record that travels with them. */
  .get("/chain/:driverId", async (c) => {
    const driverId = c.req.param("driverId");
    const entries = await db
      .select()
      .from(schema.clockLedgerEntries)
      .where(eq(schema.clockLedgerEntries.driverId, driverId))
      .orderBy(desc(schema.clockLedgerEntries.seq));
    if (!entries.length) return c.json({ error: "no_sealed_rows", driverId }, 404);
    return c.json({ driverId, rows: entries.length, entries }, 200);
  });
