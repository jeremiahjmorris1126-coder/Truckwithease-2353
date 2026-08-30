import { Hono } from "hono";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { ensureSeed } from "../lib/seed";
import { clockSnapshotAt } from "../lib/dutyclock";
import {
  ASSUMED_AVG_MPH,
  GENESIS,
  linkDriverPhone,
  linkHash,
  payloadHashFor,
  phoneCoverage,
  resealResolvable,
  sealPending,
  sha256,
  verdictFor,
} from "../lib/sealedline";
import { twilioCreds } from "./twilio";

/**
 * THE SEALED LINE — /api/sealed-line
 *
 * A dispatch conversation, replayable line by line, with the driver's duty clock
 * as of the second each line existed, hash-chained so any later alteration shows.
 *
 * Plus the ask parser: a broker's text ("can you be there by 6?", "400 more
 * miles?") is turned into a legality verdict computed from 49 CFR 395 arithmetic
 * against that driver's remaining clock — with the average-speed assumption
 * declared in the response, never hidden inside the answer.
 *
 * CLAIMED: tamper-EVIDENT. Change a stored measurement or a body text and the
 * recomputed link breaks; /chain lists every break instead of suppressing it.
 * NOT CLAIMED: notarization, legal certification, third-party timestamping, or
 * proof the hos_logs rows were correct when captured.
 */

const rid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const digits10 = (raw: unknown) => {
  const d = typeof raw === "string" ? raw.replace(/\D/g, "") : "";
  return d.length >= 10 ? d.slice(-10) : "";
};

export const sealedLine = new Hono()
  .use("*", async (_c, next) => {
    await ensureSeed();
    await next();
  })

  /** Status: what is sealed, what is pending, and every blocker, stated plainly. */
  .get("/", async (c) => {
    const t0 = Date.now();
    const [messages, sealed, numbers, conversations, answers, drivers] = await Promise.all([
      db.select().from(schema.smsMessages),
      db.select().from(schema.sealedMessages).orderBy(asc(schema.sealedMessages.seq)),
      db.select().from(schema.fleetPhoneNumbers),
      db.select().from(schema.smsConversations).orderBy(desc(schema.smsConversations.lastMessageAt)).limit(50),
      db.select().from(schema.clockAnswers).orderBy(desc(schema.clockAnswers.createdAt)).limit(50),
      db.select().from(schema.drivers),
    ]);

    const sealedIds = new Set(sealed.map((s) => s.messageId));
    const driverPhones = new Set(drivers.map((d) => digits10(d.phone)).filter(Boolean));
    const creds = twilioCreds();

    const blockers: { key: string; blocked: boolean; detail: string }[] = [
      {
        key: "twilio_credentials",
        blocked: !creds,
        detail: creds
          ? "TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are present in .env. Whether Twilio accepts them is reported per request by /api/comms — sealing does not depend on Twilio at all."
          : "No Twilio credentials in .env. Numbers cannot be read and messages cannot be sent. Sealing still works on messages already in the database.",
      },
      {
        key: "a2p_10dlc_campaign",
        blocked: true,
        detail:
          "No approved A2P 10DLC campaign is attached to the Messaging Service, so US carriers may filter outbound traffic. Filing costs money and triggers vetting, so this app never files it automatically.",
      },
      {
        key: "driver_phone_coverage",
        blocked: driverPhones.size < drivers.length,
        detail: `${driverPhones.size} of ${drivers.length} drivers have a usable phone number. A message can only carry a duty clock when one end matches a driver's phone.`,
      },
    ];

    return c.json(
      {
        feature: "The Sealed Line",
        whatItIs:
          "Every message on a fleet number is stamped with the driver's duty clock as of the second that message existed — recomputed from hos_logs intervals, not today's numbers — and linked into an append-only sha256 chain. The conversation replays line by line with clock proof on each line.",
        claimed:
          "Tamper-evident. Altering a stored measurement or a message body breaks the recomputed link, and GET /api/sealed-line/chain reports the break.",
        notClaimed: [
          "Not notarization and not a legal certification.",
          "Not a third-party timestamp authority — the timestamps are this app's own records.",
          "Not proof the underlying hos_logs rows were correct when captured. It proves what was stored has not changed since sealing.",
          "No prediction, no score, no confidence percentage.",
          "TruckWithEase is not an ELD and files nothing with any agency.",
        ],
        counts: {
          messagesTotal: messages.length,
          sealed: sealed.length,
          unsealed: messages.filter((m) => !sealedIds.has(m.id)).length,
          sealedWithClock: sealed.filter((s) => s.clockResolved).length,
          sealedWithoutClock: sealed.filter((s) => !s.clockResolved).length,
          conversations: conversations.length,
          fleetNumbers: numbers.length,
          clockAnswers: answers.length,
        },
        chain: {
          algorithm: "sha256",
          construction: "chainHash = sha256(payloadHash + prevHash), genesis prevHash = 64 zeros",
          table: "sealed_messages",
          appendOnly: true,
          headSeq: sealed.length ? sealed[sealed.length - 1].seq : 0,
          headHash: sealed.length ? sealed[sealed.length - 1].chainHash : GENESIS,
          verifyAt: "/api/sealed-line/chain",
        },
        blockers,
        assumptions: [
          {
            key: "ASSUMED_AVG_MPH",
            value: ASSUMED_AVG_MPH,
            statement:
              "Used only to convert a mileage ask into driving hours in /answer. A planning assumption, not a measurement.",
          },
        ],
        endpoints: {
          seal: "POST /api/sealed-line/seal",
          chain: "GET /api/sealed-line/chain",
          thread: "GET /api/sealed-line/thread/:conversationId",
          answer: "POST /api/sealed-line/answer  { conversationId | driverId, text, send?: false }",
        },
        recentConversations: conversations.map((cv) => ({
          id: cv.id,
          fleetNumber: cv.fleetNumber,
          peerNumber: cv.peerNumber,
          peerName: cv.peerName,
          peerType: cv.peerType,
          messageCount: cv.messageCount,
          lastMessageAt: cv.lastMessageAt,
          lastMessagePreview: cv.lastMessagePreview,
          sealedInThread: sealed.filter((s) => s.conversationId === cv.id).length,
        })),
        measuredMs: Date.now() - t0,
        generatedAt: new Date().toISOString(),
      },
      200,
    );
  })

  /** Seal every unsealed message. Idempotent — a messageId is never sealed twice. */
  .post("/seal", async (c) => {
    const t0 = Date.now();
    const out = await sealPending();
    return c.json(
      {
        sealedThisRequest: out.sealed.length,
        alreadySealedBefore: out.alreadySealed,
        headSeq: out.headSeq,
        headHash: out.headHash,
        rows: out.sealed,
        idempotent:
          "Sealing keys on sms_messages.id. Calling this repeatedly cannot duplicate history or inflate the chain.",
        note:
          out.sealed.length === 0
            ? "Nothing to seal — every message in the database is already sealed."
            : `${out.sealed.length} message(s) sealed. ${out.sealed.filter((s) => s.clockResolved).length} carried a resolved duty clock; the rest are sealed with null clock fields and a stated reason rather than a fabricated clock.`,
        verifyAt: "/api/sealed-line/chain",
        measuredMs: Date.now() - t0,
      },
      200,
    );
  })

  /**
   * Driver <-> fleet number coverage. A seal only carries clock proof when one
   * end of the message matches drivers.phone, so the gap is measured here.
   */
  .get("/coverage", async (c) => {
    const t0 = Date.now();
    await ensureSeed();
    const cov = await phoneCoverage();
    return c.json({ ...cov, measuredMs: Date.now() - t0, generatedAt: new Date().toISOString() }, 200);
  })

  /** Write a normalized +1XXXXXXXXXX onto a driver record. */
  .post("/link-driver", async (c) => {
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const driverId = typeof body.driverId === "string" ? body.driverId.trim() : "";
    if (!driverId) return c.json({ error: "driverId is required" }, 400);

    const out = await linkDriverPhone(driverId, body.phone);
    if (!out.ok) {
      const status = out.reason === "unknown_driver" ? 404 : out.reason === "number_already_linked" ? 409 : 422;
      return c.json(out, status);
    }
    return c.json(
      {
        ...out,
        nextStep: "POST /api/sealed-line/reseal-unresolved appends clock-carrying seals for this driver's already-sealed messages. No existing seal is edited.",
      },
      200,
    );
  })

  /**
   * Append-only correction pass: messages sealed with a null clock that now
   * resolve to a driver get a NEW seal carrying the clock recomputed as of the
   * original message timestamp. Earlier rows are never touched.
   */
  .post("/reseal-unresolved", async (c) => {
    const t0 = Date.now();
    const out = await resealResolvable();
    return c.json(
      {
        appendedCount: out.appended.length,
        skippedCount: out.skipped.length,
        candidatesScanned: out.candidatesScanned,
        headSeq: out.headSeq,
        headHash: out.headHash,
        appended: out.appended,
        skipped: out.skipped,
        appendOnly: out.appendOnly,
        verifyAt: "/api/sealed-line/chain",
        measuredMs: Date.now() - t0,
      },
      200,
    );
  })

  /** Replay the chain from genesis and report every broken link. */
  .get("/chain", async (c) => {
    const t0 = Date.now();
    const entries = await db.select().from(schema.sealedMessages).orderBy(asc(schema.sealedMessages.seq));
    const messages = await db.select().from(schema.smsMessages);
    const bodyById = new Map(messages.map((m) => [m.id, m.body ?? ""] as const));

    let prev = GENESIS;
    let expectedSeq = 0;
    const breaks: { seq: number; messageId: string; reason: string }[] = [];

    for (const e of entries) {
      expectedSeq += 1;
      if (e.seq !== expectedSeq)
        breaks.push({ seq: e.seq, messageId: e.messageId, reason: `sequence gap — expected ${expectedSeq}` });
      if (e.prevHash !== prev)
        breaks.push({ seq: e.seq, messageId: e.messageId, reason: "prev_hash does not match the previous row's chain_hash" });

      const recomputed = payloadHashFor({
        messageId: e.messageId,
        direction: e.direction,
        fromNumber: e.fromNumber,
        toNumber: e.toNumber,
        bodyHash: e.bodyHash,
        occurredAtMs: +e.occurredAt,
        driverId: e.driverId,
        dutyStatusAtMessage: e.dutyStatusAtMessage,
        drivingRemainingMin: e.drivingRemainingMin,
        windowRemainingMin: e.windowRemainingMin,
        cycleRemainingMin: e.cycleRemainingMin,
      });
      if (recomputed !== e.payloadHash)
        breaks.push({
          seq: e.seq,
          messageId: e.messageId,
          reason: "payload_hash does not match the stored measurements — the sealed row was altered",
        });
      if (linkHash(e.payloadHash, e.prevHash) !== e.chainHash)
        breaks.push({ seq: e.seq, messageId: e.messageId, reason: "chain_hash does not match sha256(payload_hash + prev_hash)" });

      // The body itself is re-hashed against the live sms_messages row: this is
      // what catches someone editing the text of a message after the fact.
      const body = bodyById.get(e.messageId);
      if (body === undefined)
        breaks.push({ seq: e.seq, messageId: e.messageId, reason: "the sealed message row no longer exists in sms_messages" });
      else if (sha256(body) !== e.bodyHash)
        breaks.push({ seq: e.seq, messageId: e.messageId, reason: "the message body in sms_messages no longer hashes to the sealed body_hash — the text was changed after sealing" });

      prev = e.chainHash;
    }

    return c.json(
      {
        algorithm: "sha256",
        construction: "chainHash = sha256(payloadHash + prevHash), genesis prevHash = 64 zeros",
        rows: entries.length,
        headSeq: entries.length ? entries[entries.length - 1].seq : 0,
        headHash: entries.length ? entries[entries.length - 1].chainHash : null,
        verified: breaks.length === 0,
        breaks,
        bodyTextChecked: true,
        verifiedNote:
          breaks.length === 0
            ? "Every link was recomputed from the stored measurements AND the live message text, and all matched. This verifies nothing has been altered since sealing. It does not verify the hos_logs rows were correct when captured."
            : "The chain does not verify. Every failing link is listed above rather than being suppressed.",
        entries: entries.map((e) => ({
          seq: e.seq,
          messageId: e.messageId,
          conversationId: e.conversationId,
          direction: e.direction,
          fromNumber: e.fromNumber,
          toNumber: e.toNumber,
          bodyChars: e.bodyChars,
          bodyHash: e.bodyHash,
          occurredAt: e.occurredAt,
          driverId: e.driverId,
          driverName: e.driverName,
          dutyStatusAtMessage: e.dutyStatusAtMessage,
          drivingRemainingMin: e.drivingRemainingMin,
          windowRemainingMin: e.windowRemainingMin,
          cycleRemainingMin: e.cycleRemainingMin,
          atLimit: e.atLimit ? (JSON.parse(e.atLimit) as string[]) : [],
          clockResolved: e.clockResolved,
          clockUnresolvedReason: e.clockUnresolvedReason,
          payloadHash: e.payloadHash,
          prevHash: e.prevHash,
          chainHash: e.chainHash,
          sealedAt: e.sealedAt,
        })),
        measuredMs: Date.now() - t0,
        generatedAt: new Date().toISOString(),
      },
      200,
    );
  })

  /** The replay view: one thread, each line with the clock that existed then. */
  .get("/thread/:conversationId", async (c) => {
    const conversationId = c.req.param("conversationId");
    const [conv] = await db
      .select()
      .from(schema.smsConversations)
      .where(eq(schema.smsConversations.id, conversationId))
      .limit(1);
    if (!conv) return c.json({ error: "unknown_conversation", conversationId }, 404);

    const [messages, sealed, answers] = await Promise.all([
      db
        .select()
        .from(schema.smsMessages)
        .where(eq(schema.smsMessages.conversationId, conversationId))
        .orderBy(asc(schema.smsMessages.createdAt)),
      db
        .select()
        .from(schema.sealedMessages)
        .where(eq(schema.sealedMessages.conversationId, conversationId))
        .orderBy(asc(schema.sealedMessages.seq)),
      db
        .select()
        .from(schema.clockAnswers)
        .where(eq(schema.clockAnswers.conversationId, conversationId))
        .orderBy(asc(schema.clockAnswers.createdAt)),
    ]);

    const sealByMsg = new Map(sealed.map((s) => [s.messageId, s] as const));
    const answerByMsg = new Map(answers.filter((a) => a.sealedMessageId).map((a) => [a.sealedMessageId as string, a] as const));

    return c.json(
      {
        conversation: conv,
        lines: messages.map((m) => {
          const s = sealByMsg.get(m.id) ?? null;
          return {
            messageId: m.id,
            direction: m.direction,
            fromNumber: m.fromNumber,
            toNumber: m.toNumber,
            body: m.body,
            occurredAt: m.createdAt,
            twilioSid: m.twilioSid,
            twilioStatus: m.twilioStatus,
            errorCode: m.errorCode,
            errorMessage: m.errorMessage,
            sealed: s !== null,
            seal: s
              ? {
                  seq: s.seq,
                  chainHash: s.chainHash,
                  bodyHash: s.bodyHash,
                  clockResolved: s.clockResolved,
                  clockUnresolvedReason: s.clockUnresolvedReason,
                  driverId: s.driverId,
                  driverName: s.driverName,
                  dutyStatusAtMessage: s.dutyStatusAtMessage,
                  drivingRemainingMin: s.drivingRemainingMin,
                  windowRemainingMin: s.windowRemainingMin,
                  cycleRemainingMin: s.cycleRemainingMin,
                  atLimit: s.atLimit ? (JSON.parse(s.atLimit) as string[]) : [],
                  sealedAt: s.sealedAt,
                }
              : null,
            sealNote: s
              ? null
              : "This line is not sealed yet. POST /api/sealed-line/seal seals everything pending.",
            verdict: s ? (answerByMsg.get(s.id) ?? null) : null,
          };
        }),
        answers,
        note:
          "The clock numbers on each line were recomputed from that driver's hos_logs intervals as of that line's timestamp — not from today's clock.",
        generatedAt: new Date().toISOString(),
      },
      200,
    );
  })

  /**
   * THE ASK PARSER + VERDICT. Parses a broker's text and answers it from the
   * driver's real clock. Sends nothing unless send === true is passed explicitly.
   */
  .post("/answer", async (c) => {
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const text = typeof body.text === "string" ? body.text : "";
    if (!text.trim()) return c.json({ error: "text is required" }, 400);

    const conversationId = typeof body.conversationId === "string" ? body.conversationId : null;
    let driverId = typeof body.driverId === "string" ? body.driverId : null;

    const drivers = await db.select().from(schema.drivers);

    // Resolve the driver from the thread when only a conversation was given.
    let conv: typeof schema.smsConversations.$inferSelect | null = null;
    if (conversationId) {
      const [row] = await db
        .select()
        .from(schema.smsConversations)
        .where(eq(schema.smsConversations.id, conversationId))
        .limit(1);
      conv = row ?? null;
      if (!conv) return c.json({ error: "unknown_conversation", conversationId }, 404);
      if (!driverId) {
        const ends = [digits10(conv.fleetNumber), digits10(conv.peerNumber)];
        driverId = drivers.find((d) => ends.includes(digits10(d.phone)))?.id ?? null;
      }
    }
    if (!driverId && !conversationId) return c.json({ error: "conversationId or driverId is required" }, 400);

    const nowMs = Date.now();
    let snapshot = null as ReturnType<typeof clockSnapshotAt> | null;
    let unresolved: string | null = null;
    if (!driverId) {
      unresolved =
        "No driver on this thread matches a phone number in the drivers table, so no duty clock can be read and no legality answer is produced.";
    } else {
      const logs = await db.select().from(schema.hosLogs).where(eq(schema.hosLogs.driverId, driverId));
      if (!logs.length) unresolved = `Driver ${driverId} has no hos_logs rows, so there is no duty clock to answer from.`;
      else snapshot = clockSnapshotAt(logs, nowMs);
    }

    const v = verdictFor(text, snapshot, nowMs);
    const driver = drivers.find((d) => d.id === driverId) ?? null;

    const row = {
      id: rid("cans"),
      sealedMessageId: null as string | null,
      conversationId,
      driverId,
      askText: text,
      parsedMiles: v.parsed.miles,
      parsedDeadlineAt: v.parsed.deadlineAtMs ? new Date(v.parsed.deadlineAtMs) : null,
      parsedIntent: v.parsed.intent,
      verdict: v.verdict,
      verdictReason: v.reason,
      clockHoursNeeded: v.hoursNeeded,
      clockHoursAvailable: v.hoursAvailable,
      assumedMph: ASSUMED_AVG_MPH,
      draftReply: v.draftReply,
      replySentMessageId: null as string | null,
      replyTwilioSid: null as string | null,
      autoSent: false,
    };
    await db.insert(schema.clockAnswers).values(row);

    return c.json(
      {
        driver: driver ? { id: driver.id, name: driver.name, phone: driver.phone } : null,
        clockUnresolvedReason: unresolved,
        ask: { text, parsed: v.parsed },
        verdict: v.verdict,
        verdictReason: v.reason,
        clock: snapshot,
        hoursNeeded: v.hoursNeeded,
        hoursAvailable: v.hoursAvailable,
        assumptions: v.assumptions,
        draftReply: v.draftReply,
        sent: false,
        sendNote:
          "Nothing was sent. This endpoint drafts an answer and records it. Sending goes through POST /api/comms/messages so Twilio's own SID, status and errors are stored verbatim.",
        answerId: row.id,
        basis: "49 CFR 395 property-carrying: 11-hour driving, 14-hour window, 60-hour / 7-day cycle, 30-minute break after 8 hours of driving.",
        generatedAt: new Date().toISOString(),
      },
      200,
    );
  });

export default sealedLine;
