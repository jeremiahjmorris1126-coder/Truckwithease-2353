/**
 * DUTY CLOCK — the single source of truth for reading hos_logs.
 *
 * WHY THIS FILE EXISTS
 *   hos_logs rows are intervals: started_at, and ended_at which may be NULL.
 *   A NULL ended_at means one of two very different things:
 *     1. the driver is on that duty status right now, or
 *     2. the row was never closed and is stale garbage.
 *   Treating case 2 as case 1 — running a stale open row to "now" — is what
 *   produced impossible figures in this app (26,209 minutes of driving against
 *   a 660-minute limit). The guard used to live inside clockledger.ts only, so
 *   every other HOS reader still had the bug. It is now here, and every reader
 *   imports it.
 *
 * THE RULE
 *   An open interval is only run to the reference time if it started less than
 *   STALE_OPEN_HOURS ago. Older open intervals are EXCLUDED and COUNTED. They
 *   are never clamped to a made-up duration and never silently dropped.
 *
 * WHAT THIS FILE DOES NOT DO
 *   It does not predict, score, or grade. It measures intervals against
 *   49 CFR 395 property-carrying limits and reports what it could not use.
 */

import type { hosLogs } from "../database/schema";

export type HosRow = typeof hosLogs.$inferSelect;

/** An open hos_logs row older than this is unusable, not current. */
export const STALE_OPEN_HOURS = 24;

/** 49 CFR 395, property-carrying, in minutes. */
export const LIMITS = {
  driving: 11 * 60,
  onDutyWindow: 14 * 60,
  cycle: 60 * 60,
  cycleDays: 7,
  breakAfterDriving: 8 * 60,
  qualifyingBreak: 10 * 60,
} as const;

export const ON_CLOCK = new Set(["driving", "on_duty"]);
export const OFF_CLOCK = new Set(["off_duty", "sleeper"]);

export type IntervalVerdict =
  | { usable: true; startMs: number; endMs: number; open: boolean }
  | { usable: false; reason: "stale_open" | "zero_or_negative" | "starts_after_reference" };

/**
 * Decide how one hos_logs row may be used, as of `refMs`.
 * This is THE function. Nothing should read `row.endedAt` directly.
 */
export function readInterval(row: HosRow, refMs: number): IntervalVerdict {
  const startMs = +row.startedAt;
  if (startMs > refMs) return { usable: false, reason: "starts_after_reference" };

  let endMs: number;
  let open = false;
  if (row.endedAt) {
    endMs = Math.min(+row.endedAt, refMs);
  } else if (startMs >= refMs - STALE_OPEN_HOURS * 3_600_000) {
    endMs = refMs;
    open = true;
  } else {
    return { usable: false, reason: "stale_open" };
  }

  if (endMs <= startMs) return { usable: false, reason: "zero_or_negative" };
  return { usable: true, startMs, endMs, open };
}

export type UsableInterval = { status: string; startMs: number; endMs: number; open: boolean; rowId: string };

/** Usable intervals clipped to a window, plus an exclusion count per reason. */
export function usableIntervals(rows: HosRow[], windowStartMs: number, refMs: number) {
  const kept: UsableInterval[] = [];
  let excludedOpen = 0;
  let excludedOutOfWindow = 0;
  let excludedDegenerate = 0;

  for (const row of rows) {
    const v = readInterval(row, refMs);
    if (!v.usable) {
      if (v.reason === "stale_open") excludedOpen++;
      else excludedDegenerate++;
      continue;
    }
    if (v.endMs <= windowStartMs) {
      excludedOutOfWindow++;
      continue;
    }
    kept.push({
      status: row.status,
      startMs: Math.max(v.startMs, windowStartMs),
      endMs: v.endMs,
      open: v.open,
      rowId: row.id,
    });
  }
  kept.sort((a, b) => a.startMs - b.startMs);
  return { kept, excludedOpen, excludedOutOfWindow, excludedDegenerate };
}

export function minutesByStatus(intervals: { status: string; startMs: number; endMs: number }[]) {
  const m: Record<string, number> = { driving: 0, on_duty: 0, sleeper: 0, off_duty: 0 };
  for (const iv of intervals) m[iv.status] = (m[iv.status] ?? 0) + (iv.endMs - iv.startMs) / 60_000;
  for (const k of Object.keys(m)) m[k] = Math.round(m[k]);
  return m;
}

/**
 * Duration of one interval as of refMs, or null when the row is unusable.
 * Drop-in replacement for the `endedAt ? +endedAt : now` pattern.
 */
export function intervalMinutes(row: HosRow, refMs: number): number | null {
  const v = readInterval(row, refMs);
  return v.usable ? (v.endMs - v.startMs) / 60_000 : null;
}

export type ClockSnapshot = {
  atIso: string;
  atMs: number;
  dutyStatus: string | null;
  dutyStatusSinceIso: string | null;
  drivingUsedMin: number;
  drivingRemainingMin: number;
  windowUsedMin: number;
  windowRemainingMin: number;
  cycleUsedMin: number;
  cycleRemainingMin: number;
  breakDueMin: number | null;
  lastQualifyingBreakEndedIso: string | null;
  drivingRemainingHours: number;
  windowRemainingHours: number;
  cycleRemainingHours: number;
  atLimit: string[];
  intervalsUsed: number;
  intervalsExcludedStaleOpen: number;
  intervalsExcludedOutOfWindow: number;
  staleOpenHours: number;
  basis: string;
  measurementNote: string;
};

const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * The driver's duty clock AS OF an arbitrary moment — not just now.
 *
 * Reading the clock at a past timestamp is what makes a message stamp honest:
 * the numbers attached to a text sent at 14:32 are the numbers that were true
 * at 14:32, recomputed from the interval rows, not the numbers as of today.
 */
export function clockSnapshotAt(rows: HosRow[], atMs: number): ClockSnapshot {
  const cycleWindowStart = atMs - LIMITS.cycleDays * 86_400_000;
  const { kept, excludedOpen, excludedOutOfWindow } = usableIntervals(rows, cycleWindowStart, atMs);

  // 60-hr / 7-day cycle
  const cycleUsedMin = kept
    .filter((iv) => ON_CLOCK.has(iv.status))
    .reduce((s, iv) => s + (iv.endMs - iv.startMs) / 60_000, 0);

  // 11-hr driving and 14-hr window reset on a qualifying 10-hr off/sleeper break.
  let windowStartMs: number | null = null;
  let drivingMin = 0;
  let drivingSinceBreakMin = 0;
  let lastBreakEndMs: number | null = null;

  for (const iv of kept) {
    const mins = (iv.endMs - iv.startMs) / 60_000;
    if (OFF_CLOCK.has(iv.status)) {
      if (mins >= LIMITS.qualifyingBreak) {
        windowStartMs = null;
        drivingMin = 0;
        drivingSinceBreakMin = 0;
        lastBreakEndMs = iv.endMs;
      } else if (mins >= 30) {
        drivingSinceBreakMin = 0; // 30-minute break satisfied
      }
      continue;
    }
    if (windowStartMs === null) windowStartMs = iv.startMs;
    if (iv.status === "driving") {
      drivingMin += mins;
      drivingSinceBreakMin += mins;
    }
  }

  const windowUsedMin = windowStartMs === null ? 0 : (atMs - windowStartMs) / 60_000;
  const current = kept.length ? kept[kept.length - 1] : null;
  const dutyStatus = current && current.endMs >= atMs - 60_000 ? current.status : null;

  const drivingRemainingMin = Math.max(0, LIMITS.driving - drivingMin);
  const windowRemainingMin = Math.max(0, LIMITS.onDutyWindow - windowUsedMin);
  const cycleRemainingMin = Math.max(0, LIMITS.cycle - cycleUsedMin);

  const atLimit: string[] = [];
  if (drivingRemainingMin <= 0) atLimit.push("11-hour driving limit reached");
  if (windowRemainingMin <= 0) atLimit.push("14-hour on-duty window closed");
  if (cycleRemainingMin <= 0) atLimit.push("60-hour / 7-day cycle exhausted");
  if (drivingSinceBreakMin >= LIMITS.breakAfterDriving) atLimit.push("30-minute break is due");

  return {
    atIso: new Date(atMs).toISOString(),
    atMs,
    dutyStatus,
    dutyStatusSinceIso: current ? new Date(current.startMs).toISOString() : null,
    drivingUsedMin: Math.round(drivingMin),
    drivingRemainingMin: Math.round(drivingRemainingMin),
    windowUsedMin: Math.round(windowUsedMin),
    windowRemainingMin: Math.round(windowRemainingMin),
    cycleUsedMin: Math.round(cycleUsedMin),
    cycleRemainingMin: Math.round(cycleRemainingMin),
    breakDueMin:
      drivingSinceBreakMin >= LIMITS.breakAfterDriving
        ? 30
        : Math.round(Math.max(0, LIMITS.breakAfterDriving - drivingSinceBreakMin)),
    lastQualifyingBreakEndedIso: lastBreakEndMs ? new Date(lastBreakEndMs).toISOString() : null,
    drivingRemainingHours: r2(drivingRemainingMin / 60),
    windowRemainingHours: r2(windowRemainingMin / 60),
    cycleRemainingHours: r2(cycleRemainingMin / 60),
    atLimit,
    intervalsUsed: kept.length,
    intervalsExcludedStaleOpen: excludedOpen,
    intervalsExcludedOutOfWindow: excludedOutOfWindow,
    staleOpenHours: STALE_OPEN_HOURS,
    basis: "49 CFR 395 property-carrying: 11-hour driving, 14-hour window, 60-hour / 7-day cycle",
    measurementNote:
      excludedOpen > 0
        ? `${excludedOpen} hos_logs row(s) were open with a start older than ${STALE_OPEN_HOURS} hours and were excluded. Close them at /api/clock-ledger/open-intervals so the clock counts them.`
        : "Every interval in range was usable. Nothing was excluded.",
  };
}

export type OpenIntervalFinding = {
  rowId: string;
  driverId: string;
  status: string;
  startedAtIso: string;
  openForHours: number;
  stale: boolean;
  nextRowStartedAtIso: string | null;
  suggestedEndIso: string | null;
  suggestedEndSource: "next_interval_start" | "none";
  effectOnClock: string;
};

/**
 * Every open interval in a set of rows, with the repair each one needs.
 * The suggested close time is only ever another ROW's start — never invented.
 */
export function scanOpenIntervals(rows: HosRow[], refMs: number): OpenIntervalFinding[] {
  const byDriver = new Map<string, HosRow[]>();
  for (const r of rows) {
    const arr = byDriver.get(r.driverId) ?? [];
    arr.push(r);
    byDriver.set(r.driverId, arr);
  }

  const out: OpenIntervalFinding[] = [];
  for (const [driverId, list] of byDriver) {
    const sorted = [...list].sort((a, b) => +a.startedAt - +b.startedAt);
    for (let i = 0; i < sorted.length; i++) {
      const row = sorted[i];
      if (row.endedAt) continue;
      const startMs = +row.startedAt;
      const openForHours = r2((refMs - startMs) / 3_600_000);
      const stale = openForHours > STALE_OPEN_HOURS;
      const next = sorted.slice(i + 1).find((r) => +r.startedAt > startMs) ?? null;
      out.push({
        rowId: row.id,
        driverId,
        status: row.status,
        startedAtIso: new Date(startMs).toISOString(),
        openForHours,
        stale,
        nextRowStartedAtIso: next ? new Date(+next.startedAt).toISOString() : null,
        suggestedEndIso: next ? new Date(+next.startedAt).toISOString() : null,
        suggestedEndSource: next ? "next_interval_start" : "none",
        effectOnClock: stale
          ? "Excluded from every clock in the app until it is closed. Its minutes are counted nowhere."
          : "Counted as the driver's current duty status, running to now.",
      });
    }
  }
  return out.sort((a, b) => b.openForHours - a.openForHours);
}
