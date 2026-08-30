/**
 * THE SEALED LINE — message text sealed to the duty clock that existed when it was sent.
 *
 * WHAT IT DOES
 *   Every message on a fleet number is stamped with the driver's duty clock AS OF
 *   THE SECOND THAT MESSAGE EXISTED — recomputed from hos_logs intervals by
 *   lib/dutyclock.clockSnapshotAt(rows, message.createdAt), not the driver's
 *   numbers as of today — and then linked into an append-only sha256 chain:
 *     payloadHash = sha256(canonical measured fields + bodyHash)
 *     chainHash   = sha256(payloadHash + prevHash),  genesis prevHash = 64 zeros
 *   A dispatch conversation therefore replays line by line with clock proof
 *   attached to each line, so a detention or refusal dispute can be reconstructed.
 *
 * WHAT IS CLAIMED
 *   The seal is tamper-EVIDENT. Altering a stored measurement or the body text
 *   breaks the recomputed link, and GET /api/sealed-line/chain reports the break.
 *
 * WHAT IS NOT CLAIMED
 *   Not notarization. Not legal certification. Not a third-party timestamp
 *   authority. Not proof the underlying hos_logs rows were correct when captured
 *   — only that what was stored has not changed since it was sealed.
 */

import { createHash } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { LIMITS, clockSnapshotAt, type ClockSnapshot } from "./dutyclock";

export const GENESIS = "0".repeat(64);
export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const r2 = (n: number) => Math.round(n * 100) / 100;

/** Planning assumption, declared in every response that uses it. Never a measurement. */
export const ASSUMED_AVG_MPH = 55;

/** Last 10 digits — how a fleet number is matched to drivers.phone. */
export const digits10 = (raw: unknown) => {
  const d = typeof raw === "string" ? raw.replace(/\D/g, "") : "";
  return d.length >= 10 ? d.slice(-10) : "";
};

/** Canonical, order-stable hash of exactly the fields a sealed row stores. */
export function payloadHashFor(row: {
  messageId: string;
  direction: string;
  fromNumber: string;
  toNumber: string;
  bodyHash: string;
  occurredAtMs: number;
  driverId: string | null;
  dutyStatusAtMessage: string | null;
  drivingRemainingMin: number | null;
  windowRemainingMin: number | null;
  cycleRemainingMin: number | null;
}) {
  return sha256(
    JSON.stringify([
      row.messageId,
      row.direction,
      row.fromNumber,
      row.toNumber,
      row.bodyHash,
      row.occurredAtMs,
      row.driverId,
      row.dutyStatusAtMessage,
      row.drivingRemainingMin,
      row.windowRemainingMin,
      row.cycleRemainingMin,
    ]),
  );
}

export const linkHash = (payloadHash: string, prevHash: string) => sha256(payloadHash + prevHash);

/** Which driver, if any, is on either end of this message. */
export function resolveDriver(
  msg: typeof schema.smsMessages.$inferSelect,
  drivers: (typeof schema.drivers.$inferSelect)[],
) {
  const from = digits10(msg.fromNumber);
  const to = digits10(msg.toNumber);
  for (const d of drivers) {
    const p = digits10(d.phone);
    if (p && (p === from || p === to)) return d;
  }
  return null;
}

export type SealResult = {
  sealed: boolean;
  messageId: string;
  seq?: number;
  chainHash?: string;
  clockResolved?: boolean;
  reason?: string;
};

/**
 * Seal every sms_messages row that is not already sealed. Idempotent: a
 * messageId is never sealed twice, so calling this repeatedly cannot inflate
 * the chain. Rows are never updated or deleted; a correction is a new row.
 */
export async function sealPending(limit = 500): Promise<{
  scanned: number;
  sealed: SealResult[];
  alreadySealed: number;
  headHash: string;
  headSeq: number;
}> {
  const [messages, drivers, hosLogs, existing] = await Promise.all([
    db.select().from(schema.smsMessages).orderBy(asc(schema.smsMessages.createdAt)),
    db.select().from(schema.drivers),
    db.select().from(schema.hosLogs),
    db.select().from(schema.sealedMessages).orderBy(asc(schema.sealedMessages.seq)),
  ]);

  const done = new Set(existing.map((e) => e.messageId));
  let seq = existing.length ? existing[existing.length - 1].seq : 0;
  let head = existing.length ? existing[existing.length - 1].chainHash : GENESIS;

  const logsByDriver = new Map<string, (typeof schema.hosLogs.$inferSelect)[]>();
  for (const l of hosLogs) {
    const arr = logsByDriver.get(l.driverId) ?? [];
    arr.push(l);
    logsByDriver.set(l.driverId, arr);
  }

  const sealed: SealResult[] = [];
  let scanned = 0;

  for (const m of messages) {
    if (done.has(m.id)) continue;
    if (sealed.length >= limit) break;
    scanned++;

    const occurredAtMs = +m.createdAt;
    const bodyHash = sha256(m.body ?? "");
    const driver = resolveDriver(m, drivers);

    let snapshot: ClockSnapshot | null = null;
    let unresolvedReason: string | null = null;
    if (!driver) {
      unresolvedReason =
        "Neither end of this message matches a phone number on the drivers table, so no duty clock can be attached. The message is still sealed — the body and timestamp are protected, the clock fields are null.";
    } else {
      const rows = logsByDriver.get(driver.id) ?? [];
      if (rows.length === 0) {
        unresolvedReason = `Driver ${driver.id} has no hos_logs rows, so there is no duty clock to read at this timestamp.`;
      } else {
        snapshot = clockSnapshotAt(rows, occurredAtMs);
      }
    }

    const base = {
      messageId: m.id,
      direction: m.direction,
      fromNumber: m.fromNumber,
      toNumber: m.toNumber,
      bodyHash,
      occurredAtMs,
      driverId: driver?.id ?? null,
      dutyStatusAtMessage: snapshot?.dutyStatus ?? null,
      drivingRemainingMin: snapshot ? snapshot.drivingRemainingMin : null,
      windowRemainingMin: snapshot ? snapshot.windowRemainingMin : null,
      cycleRemainingMin: snapshot ? snapshot.cycleRemainingMin : null,
    };
    const payloadHash = payloadHashFor(base);
    seq += 1;
    const chainHash = linkHash(payloadHash, head);

    await db.insert(schema.sealedMessages).values({
      id: `slm_${seq.toString().padStart(6, "0")}_${payloadHash.slice(0, 8)}`,
      seq,
      messageId: m.id,
      conversationId: m.conversationId,
      direction: m.direction,
      fromNumber: m.fromNumber,
      toNumber: m.toNumber,
      bodyHash,
      bodyChars: (m.body ?? "").length,
      occurredAt: m.createdAt,
      driverId: driver?.id ?? null,
      driverName: driver?.name ?? null,
      dutyStatusAtMessage: base.dutyStatusAtMessage,
      drivingRemainingMin: base.drivingRemainingMin,
      windowRemainingMin: base.windowRemainingMin,
      cycleRemainingMin: base.cycleRemainingMin,
      atLimit: snapshot ? JSON.stringify(snapshot.atLimit) : null,
      clockSnapshotJson: snapshot ? JSON.stringify(snapshot) : null,
      clockResolved: snapshot !== null,
      clockUnresolvedReason: unresolvedReason,
      payloadHash,
      prevHash: head,
      chainHash,
      sealReason: "first_seal",
    });

    head = chainHash;
    sealed.push({ sealed: true, messageId: m.id, seq, chainHash, clockResolved: snapshot !== null });
  }

  return { scanned, sealed, alreadySealed: done.size, headHash: head, headSeq: seq };
}

/** Seal exactly one message id — used by the inbound webhook at arrival. */
export async function sealMessage(messageId: string): Promise<SealResult> {
  const [already] = await db
    .select()
    .from(schema.sealedMessages)
    .where(eq(schema.sealedMessages.messageId, messageId))
    .limit(1);
  if (already)
    return { sealed: false, messageId, seq: already.seq, chainHash: already.chainHash, reason: "already_sealed" };

  const [msg] = await db.select().from(schema.smsMessages).where(eq(schema.smsMessages.id, messageId)).limit(1);
  if (!msg) return { sealed: false, messageId, reason: "unknown_message" };

  const out = await sealPending();
  const mine = out.sealed.find((s) => s.messageId === messageId);
  return mine ?? { sealed: false, messageId, reason: "not_sealed_this_pass" };
}

/* ============================================================
 * THE ASK PARSER — a broker's text turned into a clock verdict.
 * ============================================================
 * Regex parsing of miles, deadlines and availability, then 49 CFR 395
 * arithmetic against the driver's remaining clock. No model, no score, no
 * confidence figure. The average speed used is declared as an assumption.
 */

export type ParsedAsk = {
  intent: "availability" | "miles_ask" | "deadline_ask" | "hours_ask" | "unparsed";
  miles: number | null;
  deadlineAtMs: number | null;
  hours: number | null;
  matchedOn: string[];
};

export function parseAsk(text: string, nowMs = Date.now()): ParsedAsk {
  const t = (text ?? "").toLowerCase();
  const matched: string[] = [];
  let miles: number | null = null;
  let hours: number | null = null;
  let deadlineAtMs: number | null = null;

  const mi = t.match(/(\d{2,4})\s*(?:more\s*)?(?:mi|mile|miles)\b/);
  if (mi) {
    miles = Number(mi[1]);
    matched.push(`miles from "${mi[0].trim()}"`);
  }

  const hr = t.match(/(\d{1,2}(?:\.\d)?)\s*(?:hr|hrs|hour|hours)\b/);
  if (hr) {
    hours = Number(hr[1]);
    matched.push(`hours from "${hr[0].trim()}"`);
  }

  // "by 6", "by 6pm", "by 18:00", "before 6:30 pm"
  const clock = t.match(/\b(?:by|before|at)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  if (clock) {
    let h = Number(clock[1]);
    const min = clock[2] ? Number(clock[2]) : 0;
    const mer = clock[3] ?? null;
    if (mer === "pm" && h < 12) h += 12;
    if (mer === "am" && h === 12) h = 0;
    if (h <= 23) {
      const d = new Date(nowMs);
      d.setSeconds(0, 0);
      d.setHours(h, min);
      // No meridiem and the hour already passed: the ask is about later today,
      // so read a bare "by 6" as the next occurrence, and say so.
      let ms = +d;
      if (ms <= nowMs) {
        if (!mer && h + 12 <= 23) {
          d.setHours(h + 12, min);
          ms = +d;
        }
        if (ms <= nowMs) ms += 86_400_000;
      }
      deadlineAtMs = ms;
      matched.push(`deadline from "${clock[0].trim()}" read as ${new Date(ms).toISOString()}`);
    }
  }

  const availability = /\b(can you|are you able|available|make it|pick up|pickup|deliver|be there|run it|take it)\b/.test(t);
  if (availability) matched.push("availability phrasing");

  let intent: ParsedAsk["intent"] = "unparsed";
  if (miles !== null) intent = "miles_ask";
  else if (deadlineAtMs !== null) intent = "deadline_ask";
  else if (hours !== null) intent = "hours_ask";
  else if (availability) intent = "availability";

  return { intent, miles, deadlineAtMs, hours, matchedOn: matched };
}

export type ClockVerdict = {
  verdict: "fits" | "does_not_fit" | "needs_break" | "needs_reset" | "unparsed" | "no_clock";
  reason: string;
  hoursNeeded: number | null;
  hoursAvailable: number | null;
  assumedMph: number;
  draftReply: string;
  parsed: ParsedAsk;
  snapshot: ClockSnapshot | null;
  assumptions: { key: string; value: number | string; statement: string }[];
};

/** 49 CFR 395 arithmetic: does this ask fit inside what the driver has left? */
export function verdictFor(
  text: string,
  snapshot: ClockSnapshot | null,
  nowMs = Date.now(),
): ClockVerdict {
  const parsed = parseAsk(text, nowMs);
  const assumptions = [
    {
      key: "ASSUMED_AVG_MPH",
      value: ASSUMED_AVG_MPH,
      statement:
        "Used only to convert a mileage ask into driving hours. It is a planning assumption, not a measurement of this driver.",
    },
    {
      key: "loading_detention_time",
      value: 0,
      statement: "Not included. No table in this database records loading, unloading or detention time.",
    },
  ];

  if (!snapshot)
    return {
      verdict: "no_clock",
      reason:
        "No duty clock could be read for this driver, so no legality answer is produced. A guess is worse than nothing here.",
      hoursNeeded: null,
      hoursAvailable: null,
      assumedMph: ASSUMED_AVG_MPH,
      draftReply: "",
      parsed,
      snapshot: null,
      assumptions,
    };

  const driveLeft = snapshot.drivingRemainingHours;
  const windowLeft = snapshot.windowRemainingHours;
  const cycleLeft = snapshot.cycleRemainingHours;
  const usable = Math.min(driveLeft, windowLeft, cycleLeft);
  const binding =
    usable === driveLeft ? "11-hour driving clock" : usable === windowLeft ? "14-hour on-duty window" : "60-hour cycle";

  let needed: number | null = null;
  if (parsed.miles !== null) needed = r2(parsed.miles / ASSUMED_AVG_MPH);
  else if (parsed.hours !== null) needed = parsed.hours;
  else if (parsed.deadlineAtMs !== null) needed = r2(Math.max(0, (parsed.deadlineAtMs - nowMs) / 3_600_000));

  const breakDue = snapshot.atLimit.some((s) => s.includes("30-minute break"));
  const reset = usable <= 0;

  const clock = `Driving left ${driveLeft} h, 14-hour window left ${windowLeft} h, cycle left ${cycleLeft} h.`;

  if (reset)
    return {
      verdict: "needs_reset",
      reason: `${binding} is exhausted (${clock}) — a 10-hour off-duty reset is required before any additional driving.`,
      hoursNeeded: needed,
      hoursAvailable: usable,
      assumedMph: ASSUMED_AVG_MPH,
      draftReply: `Can't take it right now. ${clock} My clock needs a 10-hour reset before I can move again. Give me a window after that and I'll run it.`,
      parsed,
      snapshot,
      assumptions,
    };

  if (needed === null)
    return {
      verdict: parsed.intent === "unparsed" ? "unparsed" : "fits",
      reason:
        parsed.intent === "unparsed"
          ? "No miles, hours or deadline could be parsed out of this text, so no arithmetic was performed. Nothing is asserted."
          : `Availability asked with no distance or deadline given. ${clock} The binding limit is the ${binding}.`,
      hoursNeeded: null,
      hoursAvailable: usable,
      assumedMph: ASSUMED_AVG_MPH,
      draftReply:
        parsed.intent === "unparsed"
          ? ""
          : `${clock} Send me the miles or the appointment time and I'll tell you straight whether it fits my clock.`,
      parsed,
      snapshot,
      assumptions,
    };

  const fits = needed <= usable;
  const needsBreak = breakDue || (parsed.miles !== null && needed > LIMITS.breakAfterDriving / 60);

  if (!fits)
    return {
      verdict: "does_not_fit",
      reason: `The ask needs ${needed} h and only ${usable} h is legal — the ${binding} binds. Short by ${r2(needed - usable)} h.`,
      hoursNeeded: needed,
      hoursAvailable: usable,
      assumedMph: ASSUMED_AVG_MPH,
      draftReply: `That doesn't fit legally. It needs about ${needed} h and I have ${usable} h before my ${binding} runs out. I can cover ${usable} h today and finish after a 10-hour break — say the word and I'll start.`,
      parsed,
      snapshot,
      assumptions,
    };

  if (needsBreak)
    return {
      verdict: "needs_break",
      reason: `The ask fits (${needed} h needed, ${usable} h legal) but a 30-minute break is required under 395.3(a)(3)(ii) — add it to the plan.`,
      hoursNeeded: needed,
      hoursAvailable: usable,
      assumedMph: ASSUMED_AVG_MPH,
      draftReply: `I can do it — about ${needed} h of drive time and I have ${usable} h legal. I owe a 30-minute break in there, so build that into the ETA.`,
      parsed,
      snapshot,
      assumptions,
    };

  return {
    verdict: "fits",
    reason: `The ask needs ${needed} h and ${usable} h is legal, bound by the ${binding}. It fits with ${r2(usable - needed)} h to spare.`,
    hoursNeeded: needed,
    hoursAvailable: usable,
    assumedMph: ASSUMED_AVG_MPH,
    draftReply: `Yes — that's about ${needed} h of drive time and I have ${usable} h legal, so it fits with ${r2(usable - needed)} h to spare. Confirm and I'm rolling.`,
    parsed,
    snapshot,
    assumptions,
  };
}

/* ============================================================
 * DRIVER  <->  FLEET NUMBER RESOLUTION
 * ============================================================
 * A seal only carries a duty clock when one end of the message matches a phone
 * number on the drivers table. That match is the whole difference between a
 * sealed body and a sealed body WITH clock proof, so the coverage gap is
 * measured and reported instead of being left to guesswork.
 */

export type PhoneNormalizeResult =
  | { ok: true; e164: string; last10: string; changed: boolean }
  | { ok: false; reason: string };

/**
 * US/NANP normalization to E.164. Deliberately narrow: 10 digits, or 11 digits
 * starting with 1. Anything else is refused rather than guessed at, because a
 * wrong number silently attaches one driver's clock to another driver's message.
 */
export function normalizePhone(raw: unknown): PhoneNormalizeResult {
  const input = typeof raw === "string" ? raw.trim() : "";
  if (!input) return { ok: false, reason: "empty" };
  const d = input.replace(/\D/g, "");
  let ten = "";
  if (d.length === 10) ten = d;
  else if (d.length === 11 && d.startsWith("1")) ten = d.slice(1);
  else
    return {
      ok: false,
      reason: `"${input}" has ${d.length} digits. Only a 10-digit US number, or 11 digits starting with 1, is accepted — the number is never guessed at.`,
    };
  if (ten.startsWith("0") || ten.startsWith("1"))
    return { ok: false, reason: `"${input}" is not a valid NANP number: the area code cannot start with 0 or 1.` };
  return { ok: true, e164: `+1${ten}`, last10: ten, changed: input !== `+1${ten}` };
}

export type CoverageRow = {
  driverId: string;
  driverName: string;
  phoneStored: string | null;
  phoneNormalized: string | null;
  phoneUsable: boolean;
  phoneProblem: string | null;
  hosLogRows: number;
  messagesMatched: number;
  clockReadable: boolean;
  blocks: string[];
};

export type UnmatchedNumber = {
  number: string;
  last10: string;
  messages: number;
  directionsSeen: string[];
  firstSeenIso: string | null;
  lastSeenIso: string | null;
};

/**
 * Measured, per-driver: is a duty clock attachable to this driver's messages at
 * all, and if not, exactly which of the two preconditions is missing.
 */
export async function phoneCoverage() {
  const [drivers, messages, hosLogs, sealed] = await Promise.all([
    db.select().from(schema.drivers),
    db.select().from(schema.smsMessages).orderBy(asc(schema.smsMessages.createdAt)),
    db.select().from(schema.hosLogs),
    db.select().from(schema.sealedMessages),
  ]);

  const logCount = new Map<string, number>();
  for (const l of hosLogs) logCount.set(l.driverId, (logCount.get(l.driverId) ?? 0) + 1);

  const byLast10 = new Map<string, string>(); // last10 -> driverId
  for (const d of drivers) {
    const p = digits10(d.phone);
    if (p) byLast10.set(p, d.id);
  }

  const msgCountByDriver = new Map<string, number>();
  const unmatched = new Map<string, UnmatchedNumber>();
  for (const m of messages) {
    const ends: Array<{ raw: string; last10: string }> = [
      { raw: m.fromNumber, last10: digits10(m.fromNumber) },
      { raw: m.toNumber, last10: digits10(m.toNumber) },
    ];
    let matchedDriver: string | null = null;
    for (const e of ends) {
      const hit = e.last10 ? byLast10.get(e.last10) : undefined;
      if (hit) matchedDriver = hit;
    }
    if (matchedDriver) {
      msgCountByDriver.set(matchedDriver, (msgCountByDriver.get(matchedDriver) ?? 0) + 1);
      continue;
    }
    for (const e of ends) {
      if (!e.last10) continue;
      const cur = unmatched.get(e.last10) ?? {
        number: e.raw,
        last10: e.last10,
        messages: 0,
        directionsSeen: [] as string[],
        firstSeenIso: null as string | null,
        lastSeenIso: null as string | null,
      };
      cur.messages += 1;
      if (!cur.directionsSeen.includes(m.direction)) cur.directionsSeen.push(m.direction);
      const iso = new Date(+m.createdAt).toISOString();
      cur.firstSeenIso = cur.firstSeenIso ?? iso;
      cur.lastSeenIso = iso;
      unmatched.set(e.last10, cur);
    }
  }

  const rows: CoverageRow[] = drivers.map((d) => {
    const norm = normalizePhone(d.phone);
    const logs = logCount.get(d.id) ?? 0;
    const blocks: string[] = [];
    if (!norm.ok) blocks.push(`No usable phone number on the driver record: ${norm.reason}`);
    if (logs === 0) blocks.push("Driver has 0 hos_logs rows, so there is no duty clock to read at any timestamp.");
    return {
      driverId: d.id,
      driverName: d.name,
      phoneStored: d.phone ?? null,
      phoneNormalized: norm.ok ? norm.e164 : null,
      phoneUsable: norm.ok,
      phoneProblem: norm.ok ? null : norm.reason,
      hosLogRows: logs,
      messagesMatched: msgCountByDriver.get(d.id) ?? 0,
      clockReadable: norm.ok && logs > 0,
      blocks,
    };
  });

  const sealedUnresolved = sealed.filter((s) => !s.clockResolved).length;
  return {
    drivers: rows.length,
    driversClockReadable: rows.filter((r) => r.clockReadable).length,
    driversWithoutUsablePhone: rows.filter((r) => !r.phoneUsable).length,
    driversWithoutHosLogs: rows.filter((r) => r.hosLogRows === 0).length,
    messages: messages.length,
    messagesMatchedToADriver: rows.reduce((a, r) => a + r.messagesMatched, 0),
    sealedRowsWithoutAClock: sealedUnresolved,
    rows,
    unmatchedNumbers: [...unmatched.values()].sort((a, b) => b.messages - a.messages),
    howMatchingWorks:
      "A message is matched to a driver when the last 10 digits of either end equal the last 10 digits of drivers.phone. Nothing else is used — no name matching, no fuzzy matching.",
    fix: "POST /api/sealed-line/link-driver { driverId, phone } writes a normalized +1XXXXXXXXXX to the driver record, then POST /api/sealed-line/reseal-unresolved appends clock-carrying seals for messages that can now resolve.",
    notClaimed: [
      "A phone match is an identity assumption, not proof of who physically held the phone.",
      "Linking a number does not alter any existing seal. Earlier clock-less seals stay in the chain exactly as they were written.",
    ],
  };
}

/** Write a normalized phone number onto a driver record. */
export async function linkDriverPhone(driverId: string, phone: unknown) {
  const [driver] = await db.select().from(schema.drivers).where(eq(schema.drivers.id, driverId)).limit(1);
  if (!driver) return { ok: false as const, reason: "unknown_driver", driverId };

  const norm = normalizePhone(phone);
  if (!norm.ok) return { ok: false as const, reason: "bad_phone", detail: norm.reason };

  const all = await db.select().from(schema.drivers);
  const clash = all.find((d) => d.id !== driverId && digits10(d.phone) === norm.last10);
  if (clash)
    return {
      ok: false as const,
      reason: "number_already_linked",
      detail: `${norm.e164} is already on driver ${clash.id} (${clash.name}). One number cannot resolve to two drivers — the clock stamp would be ambiguous.`,
    };

  const before = driver.phone ?? null;
  await db.update(schema.drivers).set({ phone: norm.e164 }).where(eq(schema.drivers.id, driverId));
  const logs = await db.select().from(schema.hosLogs).where(eq(schema.hosLogs.driverId, driverId));
  return {
    ok: true as const,
    driverId,
    driverName: driver.name,
    phoneBefore: before,
    phoneAfter: norm.e164,
    hosLogRows: logs.length,
    clockReadable: logs.length > 0,
    note:
      logs.length > 0
        ? "This driver's messages can now carry a duty clock. Existing clock-less seals are untouched; POST /reseal-unresolved appends new clock-carrying seals for them."
        : "The number is linked, but this driver has 0 hos_logs rows, so there is still no duty clock to read.",
  };
}

/**
 * APPEND-ONLY correction. For every sealed row that was written with a null clock
 * and whose message now resolves to a driver with hos_logs, append a NEW sealed
 * row carrying the clock recomputed AS OF THE ORIGINAL MESSAGE TIMESTAMP, linked
 * to the chain head and pointing back at the row it supersedes. Nothing is ever
 * updated or deleted: both rows remain verifiable forever.
 */
export async function resealResolvable(limit = 500) {
  const [sealed, messages, drivers, hosLogs] = await Promise.all([
    db.select().from(schema.sealedMessages).orderBy(asc(schema.sealedMessages.seq)),
    db.select().from(schema.smsMessages),
    db.select().from(schema.drivers),
    db.select().from(schema.hosLogs),
  ]);

  const msgById = new Map(messages.map((m) => [m.id, m]));
  const logsByDriver = new Map<string, (typeof schema.hosLogs.$inferSelect)[]>();
  for (const l of hosLogs) {
    const arr = logsByDriver.get(l.driverId) ?? [];
    arr.push(l);
    logsByDriver.set(l.driverId, arr);
  }

  const superseded = new Set(sealed.map((s) => s.supersedesSealedId).filter(Boolean) as string[]);
  let seq = sealed.length ? sealed[sealed.length - 1].seq : 0;
  let head = sealed.length ? sealed[sealed.length - 1].chainHash : GENESIS;

  const appended: Array<{
    supersedesSealedId: string;
    messageId: string;
    seq: number;
    chainHash: string;
    driverId: string;
    driverName: string;
    dutyStatusAtMessage: string | null;
    drivingRemainingMin: number | null;
    windowRemainingMin: number | null;
    cycleRemainingMin: number | null;
  }> = [];
  const skipped: Array<{ sealedId: string; messageId: string; reason: string }> = [];

  for (const row of sealed) {
    if (row.clockResolved) continue;
    if (superseded.has(row.id)) continue;
    if (appended.length >= limit) break;

    const msg = msgById.get(row.messageId);
    if (!msg) {
      skipped.push({ sealedId: row.id, messageId: row.messageId, reason: "the sms_messages row no longer exists" });
      continue;
    }
    const driver = resolveDriver(msg, drivers);
    if (!driver) {
      skipped.push({ sealedId: row.id, messageId: row.messageId, reason: "still no driver phone matches either end of this message" });
      continue;
    }
    const rows = logsByDriver.get(driver.id) ?? [];
    if (rows.length === 0) {
      skipped.push({ sealedId: row.id, messageId: row.messageId, reason: `driver ${driver.id} has 0 hos_logs rows, so there is no clock to read` });
      continue;
    }

    const occurredAtMs = +row.occurredAt;
    const snapshot = clockSnapshotAt(rows, occurredAtMs);
    const base = {
      messageId: row.messageId,
      direction: row.direction,
      fromNumber: row.fromNumber,
      toNumber: row.toNumber,
      bodyHash: row.bodyHash,
      occurredAtMs,
      driverId: driver.id,
      dutyStatusAtMessage: snapshot.dutyStatus,
      drivingRemainingMin: snapshot.drivingRemainingMin,
      windowRemainingMin: snapshot.windowRemainingMin,
      cycleRemainingMin: snapshot.cycleRemainingMin,
    };
    const payloadHash = payloadHashFor(base);
    seq += 1;
    const chainHash = linkHash(payloadHash, head);

    await db.insert(schema.sealedMessages).values({
      id: `slm_${seq.toString().padStart(6, "0")}_${payloadHash.slice(0, 8)}`,
      seq,
      messageId: row.messageId,
      conversationId: row.conversationId,
      direction: row.direction,
      fromNumber: row.fromNumber,
      toNumber: row.toNumber,
      bodyHash: row.bodyHash,
      bodyChars: row.bodyChars,
      occurredAt: row.occurredAt,
      driverId: driver.id,
      driverName: driver.name,
      dutyStatusAtMessage: base.dutyStatusAtMessage,
      drivingRemainingMin: base.drivingRemainingMin,
      windowRemainingMin: base.windowRemainingMin,
      cycleRemainingMin: base.cycleRemainingMin,
      atLimit: JSON.stringify(snapshot.atLimit),
      clockSnapshotJson: JSON.stringify(snapshot),
      clockResolved: true,
      clockUnresolvedReason: null,
      payloadHash,
      prevHash: head,
      chainHash,
      supersedesSealedId: row.id,
      sealReason: "clock_resolved_after_phone_link",
    });

    head = chainHash;
    appended.push({
      supersedesSealedId: row.id,
      messageId: row.messageId,
      seq,
      chainHash,
      driverId: driver.id,
      driverName: driver.name,
      dutyStatusAtMessage: base.dutyStatusAtMessage,
      drivingRemainingMin: base.drivingRemainingMin,
      windowRemainingMin: base.windowRemainingMin,
      cycleRemainingMin: base.cycleRemainingMin,
    });
  }

  return {
    candidatesScanned: sealed.filter((s) => !s.clockResolved && !superseded.has(s.id)).length,
    appended,
    skipped,
    headSeq: seq,
    headHash: head,
    appendOnly:
      "No existing seal was modified. Each correction is a new row carrying the clock recomputed as of the original message timestamp, with supersedes_sealed_id pointing at the earlier row.",
  };
}

/* ============================================================
 * AUTO-ANSWER FOR AN INBOUND LINE
 * ============================================================
 * Turns one inbound sms_messages row into a 49 CFR 395 verdict computed
 * against that driver's clock AS OF THE MOMENT THE MESSAGE ARRIVED, and
 * decides whether it is defensible to send that answer back automatically.
 *
 * The refusals matter more than the sends. Nothing is auto-sent when:
 *   - no driver on the thread matches a phone number, so there is no clock
 *   - the driver has no hos_logs rows
 *   - the text parses to nothing measurable (no miles, hours or deadline)
 *   - the text is a carrier opt-out keyword
 * Silence is the correct output in all four cases. A guessed legality answer
 * sent to a broker over a fleet number is worse than no answer.
 */

/** Carrier-mandated opt-out keywords. An opt-out is never answered with a bot reply. */
const OPT_OUT = new Set([
  "stop", "stopall", "unsubscribe", "cancel", "end", "quit", "revoke", "optout", "opt-out",
]);

export const isOptOut = (text: string) => OPT_OUT.has(text.trim().toLowerCase().replace(/[^a-z-]/g, ""));

export type InboundAnswer = {
  messageId: string;
  conversationId: string | null;
  driver: { id: string; name: string } | null;
  clockUnresolvedReason: string | null;
  verdict: ClockVerdict;
  /** Whether this ask is answerable at all — a clock was read AND something measurable parsed. */
  answerable: boolean;
  notAnswerableReason: string | null;
  atMessageMs: number;
};

/**
 * Build the verdict for an inbound message using the clock as it stood at that
 * message's own timestamp — not the clock as of now.
 */
export async function answerForInbound(messageId: string): Promise<InboundAnswer | null> {
  const [msg] = await db.select().from(schema.smsMessages).where(eq(schema.smsMessages.id, messageId)).limit(1);
  if (!msg) return null;

  const atMessageMs = msg.createdAt instanceof Date ? msg.createdAt.getTime() : Date.now();
  const drivers = await db.select().from(schema.drivers);

  // First precedence: one end of the message IS a driver's own phone number.
  let driver = resolveDriver(msg, drivers);
  let resolvedBy: "driver_phone" | "fleet_number_assignment" | null = driver ? "driver_phone" : null;

  // Second precedence: a broker texted a fleet number that is assigned to a
  // driver in fleet_phone_numbers. That assignment is an exact stored fact, not
  // a guess, so it is allowed to carry the clock. Nothing fuzzy is used.
  if (!driver) {
    const assignments = await db
      .select()
      .from(schema.fleetPhoneNumbers)
      .where(eq(schema.fleetPhoneNumbers.assignedToType, "driver"));
    const ends = [digits10(msg.fromNumber), digits10(msg.toNumber)];
    const hit = assignments.find((a) => a.assignedToId && ends.includes(digits10(a.phoneNumber)));
    if (hit) {
      driver = drivers.find((d) => d.id === hit.assignedToId) ?? null;
      if (driver) resolvedBy = "fleet_number_assignment";
    }
  }

  let snapshot: ClockSnapshot | null = null;
  let clockUnresolvedReason: string | null = null;
  if (!driver) {
    clockUnresolvedReason =
      "Neither end of this message matches a phone number on the drivers table, so no duty clock can be read for it.";
  } else {
    const logs = await db.select().from(schema.hosLogs).where(eq(schema.hosLogs.driverId, driver.id));
    if (!logs.length) clockUnresolvedReason = `Driver ${driver.id} has no hos_logs rows, so there is no duty clock to answer from.`;
    else snapshot = clockSnapshotAt(logs, atMessageMs);
  }

  const verdict = verdictFor(msg.body ?? "", snapshot, atMessageMs);

  let notAnswerableReason: string | null = null;
  if (isOptOut(msg.body ?? "")) notAnswerableReason = "The text is a carrier opt-out keyword. An opt-out is never answered automatically.";
  else if (!snapshot) notAnswerableReason = clockUnresolvedReason;
  else if (verdict.verdict === "unparsed" || !verdict.draftReply)
    notAnswerableReason =
      "No miles, hours or deadline could be parsed out of this text, so there is no arithmetic to answer with and nothing is asserted.";

  return {
    messageId,
    conversationId: msg.conversationId ?? null,
    driver: driver ? { id: driver.id, name: driver.name } : null,
    clockUnresolvedReason,
    verdict,
    answerable: notAnswerableReason === null,
    notAnswerableReason,
    atMessageMs,
  };
}
