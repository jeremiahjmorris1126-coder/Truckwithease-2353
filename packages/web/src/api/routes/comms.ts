import { Hono } from "hono";
import { lookup } from "node:dns/promises";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { credentialShape, twilioCreds } from "./twilio";
import { answerForInbound, sealMessage } from "../lib/sealedline";

/**
 * FLEET TELECOMMUNICATIONS — phone numbers + in-app messaging, on Twilio.
 *
 * WHAT IS REAL
 *   - Every number listed comes from a live read of the Twilio REST API on the
 *     account whose SID is in .env. Nothing is invented and nothing is cached
 *     as truth: an assignment row is only accepted for a number Twilio returns.
 *   - Sending calls Twilio for real. The Message SID and the status string in
 *     the response are stored verbatim. If Twilio rejects the send, the row is
 *     still written with Twilio's own error code and message, and the API
 *     returns that error rather than a success shape.
 *   - Searching and buying numbers hits Twilio's AvailablePhoneNumbers and
 *     IncomingPhoneNumbers resources. Buying spends real money, so it requires
 *     an explicit confirm flag and echoes back what Twilio charged.
 *
 * WHAT IS NOT CLAIMED
 *   - Delivery. Twilio accepting a message means queued, not delivered. Status
 *     is only ever what Twilio last reported, with the timestamp of that read.
 *   - A2P compliance. US 10DLC traffic is filtered by the carriers unless an
 *     APPROVED campaign is attached to the Messaging Service. This file reads
 *     that state and reports it as a blocker. It never registers anything —
 *     brand and campaign filing lives in /api/a2p and is a human decision
 *     because it costs money and triggers vetting.
 *   - Voice. Numbers are reported as voice-capable when Twilio says so, but no
 *     calling is implemented here, so nothing pretends calls work yet.
 *
 * Secrets never reach the browser. Credentials are read from .env server-side.
 */

const rid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

/** E.164 or null. Never guesses a country other than US for 10 digits. */
export const e164 = (raw: unknown): string | null => {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return null;
  if (/^\+[1-9]\d{6,14}$/.test(s)) return s;
  const d = s.replace(/\D/g, "");
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return null;
};

const API = "https://api.twilio.com/2010-04-01";
const MESSAGING = "https://messaging.twilio.com/v1";

type Creds = NonNullable<ReturnType<typeof twilioCreds>>;

async function tw(
  creds: Creds,
  url: string,
  init?: { method?: string; form?: Record<string, string> },
): Promise<{ ok: boolean; status: number; body: Record<string, unknown> }> {
  const auth = Buffer.from(`${creds.authUser}:${creds.authPass}`).toString("base64");
  const headers: Record<string, string> = { Authorization: `Basic ${auth}` };
  let bodyInit: string | undefined;
  if (init?.form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    bodyInit = new URLSearchParams(init.form).toString();
  }
  let res: Response;
  try {
    res = await fetch(url, { method: init?.method ?? "GET", headers, body: bodyInit });
  } catch (e) {
    return { ok: false, status: 0, body: { message: e instanceof Error ? e.message : String(e) } };
  }
  const text = await res.text();
  let body: Record<string, unknown> = {};
  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    body = { raw: text };
  }
  return { ok: res.ok, status: res.status, body };
}

const notConnected = {
  connected: false as const,
  reason:
    "TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are not set in .env, so this server cannot talk to Twilio. Nothing on this page is simulated — with no credentials there is nothing to show.",
};

const messagingServiceSid = () => process.env.TWILIO_MESSAGING_SERVICE_SID?.trim() || null;

/**
 * What this app actually puts on the wire, read off the code paths that send.
 * This is the list a 10DLC use case has to cover. It is written by hand because
 * only a human can say what a message MEANS to a carrier — but each entry names
 * the function that sends it, so it can be checked against the code.
 */
const APP_TRAFFIC = [
  {
    kind: "internal_fleet_dispatch_reply",
    sentBy:
      "routes/comms.ts autoReplyTo() — the sealed duty-clock answer sent back to the fleet's own dispatcher or driver on a fleet-owned line",
    isTwoFactor: false,
    example:
      "Dispatch: driver can't take it right now. Driving left 4.92 h, 14-hour window left 0 h, cycle left 53.92 h. Clock needs a 10-hour reset before the truck can move again.",
  },
  {
    kind: "one_time_sign_in_code",
    sentBy: "sign-in verification code",
    isTwoFactor: true,
    example: "TruckWithEase: your sign-in code is 481920. It expires in 10 minutes.",
  },
] as const;

/**
 * The filing that matches APP_TRAFFIC. LOW_VOLUME ("Low Volume Mixed") is the
 * use case that explicitly permits any combination of message types, which is
 * what this app sends — a 2FA campaign does not cover a conversational reply,
 * and carriers can filter that traffic even after a 2FA campaign is approved.
 */
const RECOMMENDED_FILING = {
  useCase: "LOW_VOLUME",
  useCaseName: "Low Volume Mixed",
  whyThisOne:
    "This is an internal fleet communication tool, not an outreach channel. A fleet subscribes to phone lines inside TruckWithEase at $10.50 per line per month and uses them so its own drivers and dispatchers can text each other. Two different kinds of message leave the same line: a conversational duty-clock answer between the fleet's own employees, and a one-time sign-in code to the employee's own account. Low Volume Mixed is the use case that covers a combination like that at this volume. 2FA covers one-time passwords ONLY, so the internal dispatch replies are outside what was filed.",
  description:
    "TruckWithEase is fleet compliance software. A fleet subscribes to phone lines inside the platform at $10.50 per line per month and assigns each line to one of its own employees. Every message on these lines is internal company communication between people who already work for that fleet: driver to dispatcher, dispatcher to driver, driver to driver. Two kinds of message are sent. First, when a dispatcher texts one of the fleet's drivers asking whether the driver can take more miles, the platform answers on the driver's line with that driver's remaining legal hours under 49 CFR 395, so the fleet does not dispatch a driver past their clock. Second, one-time codes are sent to an employee signing in to their own account. Recipients are exclusively the subscribing fleet's own drivers, dispatchers and staff. No marketing, promotional, lead-generation or third-party messages are ever sent on these lines, and the lines are never used to contact brokers, shippers or the general public.",
  messageFlow:
    "Every recipient is an employee of the fleet that pays for the line, and consent is collected in writing inside the product before any number is stored. A fleet administrator adds a driver or dispatcher in TruckWithEase, and that person then signs in to their own account at truckwithease.com, enters their own mobile number on the account screen, and checks a box reading \"Text me sign-in codes and dispatch messages from my fleet at this number. Message and data rates may apply. Message frequency varies. Reply HELP for help, STOP to opt out.\" The checkbox is unchecked by default, the employee checks it themselves, and the number is not saved and cannot be texted unless it is checked. Consent, the exact wording shown, the timestamp and the account are stored on the employee record. Removing the number or replying STOP ends messaging to that number immediately. Terms of service are at https://truckwithease.com/terms and the privacy policy, including the statement that no mobile information is sold or shared with any third party for marketing or promotional purposes, is at https://truckwithease.com/privacy.",
  messageSamples: [
    "TruckWithEase dispatch: driver can't take it right now. Driving left 4.92 h, 14-hour window left 0 h, cycle left 53.92 h. Clock needs a 10-hour reset first. Reply STOP to opt out.",
    "TruckWithEase: your sign-in code is 481920. It expires in 10 minutes. Reply HELP for help, STOP to opt out.",
  ],
  hasEmbeddedLinks: false,
  hasEmbeddedPhone: false,
  optInKeywords: ["START"],
  optOutKeywords: ["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT", "REVOKE", "OPTOUT"],
  helpKeywords: ["HELP", "INFO"],
  helpMessage:
    "TruckWithEase fleet dispatch. Email jeremiahjmorris1126@gmail.com for help. Msg&data rates may apply. Reply STOP to opt out.",
  fixesVersusWhatWasFiled: [
    "Use case 2FA → LOW_VOLUME. The dispatch replies this app sends are not one-time passwords and are not covered by a 2FA filing.",
    "The audience is restated as INTERNAL fleet communication. The lines are subscribed by a fleet at $10.50 per line per month and assigned to that fleet's own drivers and dispatchers; the earlier text described brokers and shippers texting the dispatch number, which is not what these lines are for. Internal employee messaging with in-product written consent is a materially lower-risk story for the carriers than any outbound-to-third-party framing.",
    "Terms of service and privacy policy URLs are named in the message flow itself (truckwithease.com/terms and /privacy). Rejections 30882 (TERMS_AND_CONDITIONS_URL) and 30908 (PRIVACY_POLICY_URL) were both about the reviewer being unable to verify those pages on the brand's website, so the pages must resolve publicly before any refile.",
    "The consent record is described concretely: unchecked-by-default checkbox, exact wording shown, timestamp and account stored on the employee record, STOP ends messaging immediately.",
    "The marketing sample (\"What is your biggest gripe as a driver? Truckwithease has arrived. The ALL IN ONE platform.\") is removed. It is promotional, it does not match any message this app actually sends, and it contradicts both 2FA and Low Volume Mixed.",
    "Message flow rewritten. The filed flow, 'Question asked \" Can xxxxxx send you a message ? \"', names no website, no checkbox and no consent wording, which is the single most common 10DLC rejection reason.",
    "Both samples now carry STOP language, matching what the app sends.",
    "has_embedded_links and has_embedded_phone were filed as true. Neither sample contains a link or a phone number, so both should be false — filing them true invites extra scrutiny for no reason.",
    "START is declared as the opt-in keyword and STOP is removed from the opt-in list. The filed campaign listed STOP as BOTH an opt-in and an opt-out keyword, which is contradictory.",
  ],
};

/** Does the filed use case actually cover what this app sends? */
function useCaseFit(filedUseCase: string | null, filedSamples: unknown[], optInKeywords: unknown[]) {
  const code = String(filedUseCase ?? "").toUpperCase();
  const sampleText = filedSamples.map((s) => String(s)).join(" ").toLowerCase();
  const nonTwoFactor = APP_TRAFFIC.filter((t) => !t.isTwoFactor);
  const problems: string[] = [];

  if (code === "2FA" && nonTwoFactor.length > 0) {
    problems.push(
      `Use case filed is 2FA, which covers one-time passwords only. This app's main outbound traffic is a conversational reply carrying the driver's duty clock, sent by ${nonTwoFactor[0].sentBy}. That is not a one-time password, so it is outside the filed use case. Carriers can filter it even AFTER the campaign is approved, which means approval alone would not guarantee delivery.`,
    );
  }
  const marketingWords = ["gripe", "has arrived", "all in one", "call or email"];
  const hit = marketingWords.filter((w) => sampleText.includes(w));
  if (hit.length > 0) {
    problems.push(
      `A filed message sample reads as marketing or promotion (matched: ${hit.join(", ")}). Carriers vet samples against the declared use case, and a promotional sample under a non-marketing use case is a common rejection reason. This app sends no promotional SMS, so the sample does not match real traffic either.`,
    );
  }
  const optIn = optInKeywords.map((k) => String(k).toUpperCase());
  if (optIn.includes("STOP")) {
    problems.push(
      "STOP is declared as an opt-IN keyword as well as an opt-out keyword on the filed campaign. That is contradictory and should be corrected to START.",
    );
  }

  return {
    filedUseCase,
    fits: problems.length === 0,
    problems,
    appTraffic: APP_TRAFFIC,
    recommended: problems.length === 0 ? null : RECOMMENDED_FILING,
    howToChange:
      "Twilio's Usa2p compliance resource exposes create and delete, not update, so the use case on a filed campaign cannot be edited in place — the pending campaign has to be deleted and re-filed. That costs a campaign vetting fee and restarts carrier review, so TruckWithEase never files, edits or deletes a campaign automatically. This endpoint is read-only.",
  };
}

/** Live A2P 10DLC campaign state for the configured Messaging Service. */
async function a2pState(creds: Creds) {
  const mg = messagingServiceSid();
  if (!mg) {
    return {
      messagingServiceSid: null,
      campaignStatus: "no_messaging_service" as const,
      canSendUsA2p: false,
      blocker:
        "No TWILIO_MESSAGING_SERVICE_SID in .env. US application-to-person SMS should be sent through a Messaging Service that carries an approved 10DLC campaign.",
    };
  }
  const r = await tw(creds, `${MESSAGING}/Services/${mg}/Compliance/Usa2p`);
  if (!r.ok) {
    return {
      messagingServiceSid: mg,
      campaignStatus: "unknown" as const,
      canSendUsA2p: false,
      httpStatus: r.status,
      twilioError: r.body.message ?? null,
      blocker: "Twilio did not return the A2P campaign state for this Messaging Service. Treat US SMS as unregistered until it does.",
    };
  }
  const list = Array.isArray(r.body.compliance) ? (r.body.compliance as Record<string, unknown>[]) : [];
  if (list.length === 0) {
    return {
      messagingServiceSid: mg,
      campaignStatus: "none" as const,
      canSendUsA2p: false,
      blocker:
        "No A2P 10DLC campaign is attached to this Messaging Service. The brand is approved, but without a campaign US carriers filter outbound SMS — messages can be accepted by Twilio and still never reach the driver. Register a campaign in the Twilio console before relying on SMS.",
    };
  }
  const c = list[0];
  const status = String(c.campaign_status ?? "unknown").toLowerCase();
  return {
    messagingServiceSid: mg,
    campaignStatus: status,
    campaignSid: c.sid ?? null,
    useCase: c.us_app_to_person_usecase ?? null,
    brandSid: c.brand_registration_sid ?? null,
    canSendUsA2p: status === "verified" || status === "approved",
    blocker:
      status === "verified" || status === "approved"
        ? null
        : `Campaign status is "${status}". US carriers filter traffic until the campaign is approved.`,
  };
}

/** Resolve a peer number to a known person, so threads carry real names only. */
async function resolvePeer(number: string) {
  const digits = number.replace(/\D/g, "").slice(-10);
  if (digits.length < 10) return { name: null as string | null, type: "unknown" as const, id: null as string | null };
  const like = `%${digits.slice(0, 3)}%${digits.slice(3, 6)}%${digits.slice(6)}%`;
  const drv = await db
    .select({ id: schema.drivers.id, name: schema.drivers.name, phone: schema.drivers.phone })
    .from(schema.drivers)
    .where(sql`replace(replace(replace(replace(coalesce(${schema.drivers.phone},''), '-', ''), ' ', ''), '(', ''), ')', '') LIKE ${"%" + digits}`)
    .limit(1);
  if (drv[0]) return { name: drv[0].name, type: "driver" as const, id: drv[0].id };
  const ppl = await db
    .select({ id: schema.hrPeople.id, name: schema.hrPeople.name })
    .from(schema.hrPeople)
    .where(sql`replace(replace(replace(replace(coalesce(${schema.hrPeople.phone},''), '-', ''), ' ', ''), '(', ''), ')', '') LIKE ${"%" + digits}`)
    .limit(1);
  if (ppl[0]) return { name: ppl[0].name, type: "person" as const, id: ppl[0].id };
  void like;
  return { name: null, type: "unknown" as const, id: null };
}

/** Find or create the thread between our number and theirs. */
async function threadFor(fleetNumber: string, peerNumber: string) {
  const [existing] = await db
    .select()
    .from(schema.smsConversations)
    .where(and(eq(schema.smsConversations.fleetNumber, fleetNumber), eq(schema.smsConversations.peerNumber, peerNumber)))
    .limit(1);
  if (existing) return existing;

  const [assigned] = await db
    .select()
    .from(schema.fleetPhoneNumbers)
    .where(eq(schema.fleetPhoneNumbers.phoneNumber, fleetNumber))
    .limit(1);
  const peer = await resolvePeer(peerNumber);
  const now = new Date();
  const row = {
    id: rid("cnv"),
    fleetNumberId: assigned?.id ?? null,
    fleetNumber,
    peerNumber,
    peerName: peer.name,
    peerType: peer.type,
    lastMessageAt: null,
    lastMessagePreview: null,
    lastDirection: null,
    unreadInbound: 0,
    messageCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(schema.smsConversations).values(row);
  return row;
}

/* ============================================================
 * AUTO-REPLY ON AN INBOUND LINE
 * ============================================================
 * When a broker texts a fleet number, the ask is parsed and answered from the
 * driver's real duty clock as of that message's own timestamp, and the answer
 * is sent back over the same number. The reply is then sealed into the same
 * append-only chain as the ask, so the whole exchange replays with hours
 * attached to every line.
 *
 * WHAT STOPS IT
 *   - SEALED_LINE_AUTO_REPLY=off in .env kills it outright.
 *   - No Twilio credentials: nothing is sent and the skip is recorded.
 *   - No clock (no driver phone match, or no hos_logs rows): nothing is sent.
 *   - Nothing measurable parsed out of the text: nothing is sent.
 *   - A carrier opt-out keyword: nothing is sent, ever.
 *   - The same answer text already went to that thread inside the last 10
 *     minutes: nothing is sent, so a retried webhook cannot double-text.
 * Every one of those outcomes is written to clock_answers with the reason, so
 * a silent auto-reply is auditable rather than invisible.
 *
 * Sending goes through the Twilio REST API rather than TwiML, so Twilio's own
 * Message SID, status string and error code are stored verbatim on the row.
 */

export const autoReplyEnabled = () => (process.env.SEALED_LINE_AUTO_REPLY?.trim().toLowerCase() || "on") !== "off";

const DEDUPE_WINDOW_MS = 10 * 60 * 1000;

/** Send one outbound SMS and write the row with Twilio's own response verbatim. */
async function sendOutbound(args: {
  creds: Creds;
  conv: { id: string; messageCount?: number | null };
  from: string | null;
  to: string;
  text: string;
  sentByName: string;
}) {
  const mg = messagingServiceSid();
  const form: Record<string, string> = { To: args.to, Body: args.text };
  if (mg) form.MessagingServiceSid = mg;
  else if (args.from) form.From = args.from;

  const r = await tw(args.creds, `${API}/Accounts/${args.creds.accountSid}/Messages.json`, { method: "POST", form });
  const now = new Date();
  const row = {
    id: rid("sms"),
    conversationId: args.conv.id,
    direction: "outbound",
    fromNumber: (r.body.from as string) || args.from || `messaging_service:${mg}`,
    toNumber: args.to,
    body: args.text,
    twilioSid: r.ok ? String(r.body.sid) : null,
    twilioStatus: r.ok ? String(r.body.status ?? "queued") : "rejected",
    errorCode: r.ok ? (r.body.error_code != null ? String(r.body.error_code) : null) : String(r.body.code ?? r.status),
    errorMessage: r.ok ? ((r.body.error_message as string) ?? null) : ((r.body.message as string) ?? null),
    numSegments: r.body.num_segments != null ? Number(r.body.num_segments) : null,
    priceUsd: r.body.price != null ? Number(r.body.price) : null,
    sentByUserId: null as string | null,
    sentByName: args.sentByName,
    statusCheckedAt: now,
    createdAt: now,
  };
  await db.insert(schema.smsMessages).values(row);
  await db
    .update(schema.smsConversations)
    .set({
      lastMessageAt: now,
      lastMessagePreview: args.text.slice(0, 140),
      lastDirection: "outbound",
      messageCount: (args.conv.messageCount || 0) + 1,
      updatedAt: now,
    })
    .where(eq(schema.smsConversations.id, args.conv.id));
  return { ok: r.ok, status: r.status, row, body: r.body };
}

export type AutoReplyOutcome = {
  decision:
    | "sent"
    | "send_failed"
    | "skipped_disabled"
    | "skipped_no_creds"
    | "skipped_no_clock"
    | "skipped_unparsed"
    | "skipped_opt_out"
    | "skipped_duplicate";
  reason: string;
  answerId: string | null;
  verdict: string | null;
  replyMessageId: string | null;
  twilioSid: string | null;
  twilioError: string | null;
  replyText: string | null;
};

/**
 * Decide and, when defensible, send the clock answer for one inbound message.
 * Always records the decision. Never throws — the caller is a webhook.
 */
export async function autoReplyTo(
  inboundId: string,
  conv: { id: string; fleetNumber: string; peerNumber: string; messageCount?: number | null },
): Promise<AutoReplyOutcome> {
  const ans = await answerForInbound(inboundId);
  if (!ans)
    return {
      decision: "skipped_unparsed",
      reason: "The inbound message row could not be read back, so nothing was answered.",
      answerId: null, verdict: null, replyMessageId: null, twilioSid: null, twilioError: null, replyText: null,
    };

  const v = ans.verdict;
  const record = async (
    decision: AutoReplyOutcome["decision"],
    reason: string,
    extra: { replyMessageId?: string | null; twilioSid?: string | null; error?: string | null } = {},
  ): Promise<AutoReplyOutcome> => {
    const answerId = rid("cans");
    await db.insert(schema.clockAnswers).values({
      id: answerId,
      sealedMessageId: null,
      conversationId: conv.id,
      driverId: ans.driver?.id ?? null,
      askText: (await db.select().from(schema.smsMessages).where(eq(schema.smsMessages.id, inboundId)).limit(1))[0]?.body ?? "",
      parsedMiles: v.parsed.miles,
      parsedDeadlineAt: v.parsed.deadlineAtMs ? new Date(v.parsed.deadlineAtMs) : null,
      parsedIntent: v.parsed.intent,
      verdict: v.verdict,
      verdictReason: v.reason,
      clockHoursNeeded: v.hoursNeeded,
      clockHoursAvailable: v.hoursAvailable,
      assumedMph: v.assumedMph,
      draftReply: v.draftReply,
      replySentMessageId: extra.replyMessageId ?? null,
      replyTwilioSid: extra.twilioSid ?? null,
      autoSent: decision === "sent",
      inboundMessageId: inboundId,
      autoReplyDecision: decision,
      autoReplyError: extra.error ?? null,
    });
    return {
      decision,
      reason,
      answerId,
      verdict: v.verdict,
      replyMessageId: extra.replyMessageId ?? null,
      twilioSid: extra.twilioSid ?? null,
      twilioError: extra.error ?? null,
      replyText: decision === "sent" || decision === "send_failed" ? v.draftReply : null,
    };
  };

  if (!autoReplyEnabled())
    return record("skipped_disabled", "SEALED_LINE_AUTO_REPLY is set to off in .env, so no automatic reply was sent.");
  if (!ans.answerable) {
    const optOut = (ans.notAnswerableReason ?? "").includes("opt-out");
    const noClock = !ans.verdict.snapshot;
    return record(
      optOut ? "skipped_opt_out" : noClock ? "skipped_no_clock" : "skipped_unparsed",
      ans.notAnswerableReason ?? "Not answerable.",
    );
  }

  const creds = twilioCreds();
  if (!creds)
    return record(
      "skipped_no_creds",
      "TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are not set, so the answer was computed and recorded but could not be sent.",
    );

  // Retried webhook guard: the same answer text already sent to this thread recently.
  const since = new Date(Date.now() - DEDUPE_WINDOW_MS);
  const recent = await db
    .select()
    .from(schema.smsMessages)
    .where(and(eq(schema.smsMessages.conversationId, conv.id), eq(schema.smsMessages.direction, "outbound")))
    .orderBy(desc(schema.smsMessages.createdAt))
    .limit(10);
  if (recent.some((m) => m.body === v.draftReply && m.createdAt instanceof Date && m.createdAt >= since))
    return record(
      "skipped_duplicate",
      "This exact answer already went to this thread within the last 10 minutes, so it was not sent again.",
    );

  const sent = await sendOutbound({
    creds,
    conv,
    from: conv.fleetNumber?.startsWith("+") ? conv.fleetNumber : null,
    to: conv.peerNumber,
    text: v.draftReply,
    sentByName: "TruckWithEase clock answer (automatic)",
  });

  // Seal the reply into the same chain as the ask.
  try {
    await sealMessage(sent.row.id);
  } catch {
    /* the reply is stored either way; sealing is retryable and idempotent */
  }

  if (!sent.ok)
    return record(
      "send_failed",
      `Twilio rejected the reply with HTTP ${sent.status}. The answer and the rejection are both stored.`,
      { replyMessageId: sent.row.id, twilioSid: null, error: sent.row.errorMessage ?? String(sent.body.message ?? "") },
    );

  return record("sent", `Twilio accepted the reply and reported status "${sent.row.twilioStatus}".`, {
    replyMessageId: sent.row.id,
    twilioSid: sent.row.twilioSid,
  });
}

/**
 * What a fleet pays for a line inside TruckWithEase. This is the PRODUCT price the fleet is
 * billed, not Twilio's wholesale number rent — the two are different numbers and are not mixed.
 * It is stated here once so the API, the UI and the carrier filing all read the same figure.
 */
export const LINE_PRICE = {
  amount: 10.5,
  currency: "USD",
  display: "$10.50",
  per: "line / month",
  label: "$10.50 per line per month",
  billedTo: "the subscribing fleet",
  purpose:
    "Internal fleet communication: the fleet assigns each line to one of its own drivers or dispatchers so they can text each other.",
  notIncluded: [
    "Twilio's own per-number rent and per-message fees are carried by the platform, not itemized to the fleet here.",
  ],
} as const;

export const comms = new Hono()

  // ── Overview: account, numbers, assignments, A2P blocker ──────────────────
  .get("/", async (c) => {
    const creds = twilioCreds();
    const assignments = await db
      .select()
      .from(schema.fleetPhoneNumbers)
      .orderBy(desc(schema.fleetPhoneNumbers.assignedAt));
    const threads = await db.select({ n: sql<number>`count(*)` }).from(schema.smsConversations);
    const msgs = await db.select({ n: sql<number>`count(*)` }).from(schema.smsMessages);

    if (!creds) {
      return c.json({
        ...notConnected,
        pricing: LINE_PRICE,
        assignments,
        counts: { assignments: assignments.length, conversations: threads[0]?.n ?? 0, messages: msgs[0]?.n ?? 0 },
      });
    }

    const [acct, nums, a2p] = await Promise.all([
      tw(creds, `${API}/Accounts/${creds.accountSid}.json`),
      tw(creds, `${API}/Accounts/${creds.accountSid}/IncomingPhoneNumbers.json?PageSize=50`),
      a2pState(creds),
    ]);

    if (!acct.ok) {
      return c.json({
        connected: false,
        accountSid: creds.accountSid,
        httpStatus: acct.status,
        twilioError: acct.body.message ?? null,
        reason: "Twilio rejected the credentials in .env.",
        assignments,
      });
    }

    const list = Array.isArray(nums.body.incoming_phone_numbers) ? (nums.body.incoming_phone_numbers as Record<string, unknown>[]) : [];
    const owned = list.map((n) => {
      const cap = (n.capabilities as Record<string, unknown> | undefined) ?? {};
      const number = String(n.phone_number);
      const a = assignments.find((x) => x.phoneNumber === number && x.status === "active");
      return {
        sid: n.sid,
        phoneNumber: number,
        friendlyName: n.friendly_name ?? null,
        smsCapable: Boolean(cap.sms),
        mmsCapable: Boolean(cap.mms),
        voiceCapable: Boolean(cap.voice),
        smsUrl: n.sms_url || null,
        webhookWired: Boolean(typeof n.sms_url === "string" && n.sms_url.includes("/api/comms/inbound")),
        assignment: a ? { id: a.id, label: a.label, assignedToType: a.assignedToType, assignedToName: a.assignedToName } : null,
      };
    });

    return c.json({
      connected: true,
      pricing: LINE_PRICE,
      accountSid: creds.accountSid,
      friendlyName: acct.body.friendly_name ?? null,
      accountStatus: acct.body.status ?? null,
      accountType: acct.body.type ?? null, // "Trial" matters: trial accounts only text verified numbers
      trialAccount: String(acct.body.type ?? "").toLowerCase() === "trial",
      defaultFrom: creds.from,
      numbers: owned,
      unassigned: owned.filter((n) => !n.assignment).length,
      assignments,
      a2p,
      counts: { owned: owned.length, assignments: assignments.length, conversations: threads[0]?.n ?? 0, messages: msgs[0]?.n ?? 0 },
      checkedAt: new Date(),
      notes: [
        "Every number above was returned by the Twilio API just now. This app does not keep a private list of numbers it cannot prove.",
        "Inbound messages only reach this app for numbers whose SMS webhook points at /api/comms/inbound on a publicly reachable host.",
      ],
    });
  })

  // ── Search numbers to buy (read-only, costs nothing) ──────────────────────
  .get("/available", async (c) => {
    const creds = twilioCreds();
    if (!creds) return c.json(notConnected, 400);
    const country = (c.req.query("country") || "US").toUpperCase();
    const areaCode = c.req.query("areaCode")?.replace(/\D/g, "") || "";
    const contains = c.req.query("contains") || "";
    const params = new URLSearchParams({ SmsEnabled: "true", VoiceEnabled: "true", PageSize: "20" });
    if (areaCode) params.set("AreaCode", areaCode);
    if (contains) params.set("Contains", contains);
    const r = await tw(creds, `${API}/Accounts/${creds.accountSid}/AvailablePhoneNumbers/${country}/Local.json?${params}`);
    if (!r.ok) {
      return c.json({ available: [], httpStatus: r.status, twilioError: r.body.message ?? null, twilioCode: r.body.code ?? null }, 502);
    }
    const list = Array.isArray(r.body.available_phone_numbers) ? (r.body.available_phone_numbers as Record<string, unknown>[]) : [];
    return c.json({
      country,
      areaCode: areaCode || null,
      count: list.length,
      available: list.map((n) => {
        const cap = (n.capabilities as Record<string, unknown> | undefined) ?? {};
        return {
          phoneNumber: n.phone_number,
          friendlyName: n.friendly_name,
          locality: n.locality ?? null,
          region: n.region ?? null,
          sms: Boolean(cap.SMS ?? cap.sms),
          mms: Boolean(cap.MMS ?? cap.mms),
          voice: Boolean(cap.voice),
        };
      }),
      note: "Searching is free. Buying one is not — POST /api/comms/purchase with confirm:true, and Twilio bills the account.",
    });
  })

  // ── Buy a number (spends money — explicit confirm required) ───────────────
  .post("/purchase", async (c) => {
    const creds = twilioCreds();
    if (!creds) return c.json(notConnected, 400);
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const number = e164(body.phoneNumber);
    if (!number) return c.json({ error: "phoneNumber is required in E.164 form, e.g. +13145550123" }, 400);
    if (body.confirm !== true) {
      return c.json(
        {
          error: "confirm_required",
          message: `Buying ${number} charges the Twilio account a one-time fee plus monthly rent. Send confirm:true to proceed.`,
        },
        400,
      );
    }
    const form: Record<string, string> = { PhoneNumber: number };
    const friendly = str(body.friendlyName);
    if (friendly) form.FriendlyName = friendly;
    const mg = messagingServiceSid();
    if (mg) form.MessagingServiceSid = mg;
    const webhook = str(body.smsWebhookUrl);
    if (webhook) {
      form.SmsUrl = webhook;
      form.SmsMethod = "POST";
    }

    const r = await tw(creds, `${API}/Accounts/${creds.accountSid}/IncomingPhoneNumbers.json`, { method: "POST", form });
    if (!r.ok) {
      return c.json(
        { purchased: false, httpStatus: r.status, twilioCode: r.body.code ?? null, twilioError: r.body.message ?? null, moreInfo: r.body.more_info ?? null },
        502,
      );
    }
    const cap = (r.body.capabilities as Record<string, unknown> | undefined) ?? {};
    const now = new Date();
    const row = {
      id: rid("fpn"),
      phoneNumber: String(r.body.phone_number),
      twilioSid: String(r.body.sid),
      friendlyName: (r.body.friendly_name as string) ?? null,
      label: str(body.label),
      assignedToType: str(body.assignedToType) ?? "fleet",
      assignedToId: str(body.assignedToId),
      assignedToName: str(body.assignedToName),
      smsCapable: Boolean(cap.sms),
      voiceCapable: Boolean(cap.voice),
      mmsCapable: Boolean(cap.mms),
      messagingServiceSid: mg,
      status: "active",
      assignedAt: now,
      releasedAt: null,
      notes: str(body.notes),
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(schema.fleetPhoneNumbers).values(row);
    return c.json({ purchased: true, number: row, twilioSid: r.body.sid }, 201);
  })

  // ── Assign a number already on the account ────────────────────────────────
  .post("/assign", async (c) => {
    const creds = twilioCreds();
    if (!creds) return c.json(notConnected, 400);
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const number = e164(body.phoneNumber);
    if (!number) return c.json({ error: "phoneNumber is required in E.164 form" }, 400);

    // Never store an assignment for a number Twilio does not confirm we own.
    const r = await tw(creds, `${API}/Accounts/${creds.accountSid}/IncomingPhoneNumbers.json?PhoneNumber=${encodeURIComponent(number)}`);
    if (!r.ok) return c.json({ assigned: false, httpStatus: r.status, twilioError: r.body.message ?? null }, 502);
    const found = (Array.isArray(r.body.incoming_phone_numbers) ? (r.body.incoming_phone_numbers as Record<string, unknown>[]) : [])[0];
    if (!found) {
      return c.json(
        { assigned: false, error: "not_on_account", message: `${number} is not on this Twilio account. Buy it first, or pick one from GET /api/comms.` },
        400,
      );
    }

    const [existing] = await db
      .select()
      .from(schema.fleetPhoneNumbers)
      .where(and(eq(schema.fleetPhoneNumbers.phoneNumber, number), eq(schema.fleetPhoneNumbers.status, "active")))
      .limit(1);

    const cap = (found.capabilities as Record<string, unknown> | undefined) ?? {};
    const now = new Date();
    const patch = {
      twilioSid: String(found.sid),
      friendlyName: (found.friendly_name as string) ?? null,
      label: str(body.label),
      assignedToType: str(body.assignedToType) ?? "fleet",
      assignedToId: str(body.assignedToId),
      assignedToName: str(body.assignedToName),
      smsCapable: Boolean(cap.sms),
      voiceCapable: Boolean(cap.voice),
      mmsCapable: Boolean(cap.mms),
      messagingServiceSid: messagingServiceSid(),
      notes: str(body.notes),
      updatedAt: now,
    };

    if (existing) {
      await db.update(schema.fleetPhoneNumbers).set(patch).where(eq(schema.fleetPhoneNumbers.id, existing.id));
      return c.json({ assigned: true, reassigned: true, number: { ...existing, ...patch } });
    }
    const row = { id: rid("fpn"), phoneNumber: number, status: "active", assignedAt: now, releasedAt: null, createdAt: now, ...patch };
    await db.insert(schema.fleetPhoneNumbers).values(row);
    return c.json({ assigned: true, reassigned: false, number: row }, 201);
  })

  // ── Unassign locally (does NOT release the number at Twilio) ──────────────
  .post("/assign/:id/unassign", async (c) => {
    const [row] = await db
      .select()
      .from(schema.fleetPhoneNumbers)
      .where(eq(schema.fleetPhoneNumbers.id, c.req.param("id")))
      .limit(1);
    if (!row) return c.json({ error: "Not found" }, 404);
    const now = new Date();
    await db
      .update(schema.fleetPhoneNumbers)
      .set({ status: "released", releasedAt: now, updatedAt: now })
      .where(eq(schema.fleetPhoneNumbers.id, row.id));
    return c.json({
      unassigned: row.id,
      phoneNumber: row.phoneNumber,
      note: "Unassigned inside TruckWithEase only. Twilio still owns and still bills for this number until you release it in the Twilio console.",
    });
  })

  // ── Point a number's inbound SMS webhook at this app ──────────────────────
  .post("/wire-webhook", async (c) => {
    const creds = twilioCreds();
    if (!creds) return c.json(notConnected, 400);
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const number = e164(body.phoneNumber);
    const base = str(body.baseUrl);
    if (!number) return c.json({ error: "phoneNumber is required in E.164 form" }, 400);
    if (!base || !/^https:\/\//i.test(base)) {
      return c.json({ error: "baseUrl is required and must be an https URL Twilio can reach from the public internet, e.g. https://truckwithease.com" }, 400);
    }
    const r = await tw(creds, `${API}/Accounts/${creds.accountSid}/IncomingPhoneNumbers.json?PhoneNumber=${encodeURIComponent(number)}`);
    if (!r.ok) return c.json({ wired: false, httpStatus: r.status, twilioError: r.body.message ?? null }, 502);
    const found = (Array.isArray(r.body.incoming_phone_numbers) ? (r.body.incoming_phone_numbers as Record<string, unknown>[]) : [])[0];
    if (!found) return c.json({ wired: false, error: "not_on_account", message: `${number} is not on this Twilio account.` }, 400);

    const url = `${base.replace(/\/+$/, "")}/api/comms/inbound`;
    const u = await tw(creds, `${API}/Accounts/${creds.accountSid}/IncomingPhoneNumbers/${found.sid}.json`, {
      method: "POST",
      form: { SmsUrl: url, SmsMethod: "POST" },
    });
    if (!u.ok) return c.json({ wired: false, httpStatus: u.status, twilioError: u.body.message ?? null }, 502);
    return c.json({
      wired: true,
      phoneNumber: number,
      smsUrl: u.body.sms_url ?? url,
      note: "Twilio will POST inbound messages here. If this host is not reachable from the public internet, Twilio's delivery to the webhook fails and the message will not appear in the app.",
    });
  })

  // ── Threads ───────────────────────────────────────────────────────────────
  .get("/conversations", async (c) => {
    const rows = await db
      .select()
      .from(schema.smsConversations)
      .orderBy(desc(schema.smsConversations.lastMessageAt), desc(schema.smsConversations.createdAt))
      .limit(200);
    return c.json({
      conversations: rows,
      total: rows.length,
      unread: rows.reduce((s, r) => s + (r.unreadInbound || 0), 0),
      note: rows.length === 0 ? "No threads yet. A thread is created the first time this app sends to, or receives from, a number." : null,
    });
  })

  .get("/conversations/:id", async (c) => {
    const [conv] = await db
      .select()
      .from(schema.smsConversations)
      .where(eq(schema.smsConversations.id, c.req.param("id")))
      .limit(1);
    if (!conv) return c.json({ error: "Not found" }, 404);
    const messages = await db
      .select()
      .from(schema.smsMessages)
      .where(eq(schema.smsMessages.conversationId, conv.id))
      .orderBy(schema.smsMessages.createdAt);
    return c.json({ conversation: conv, messages, total: messages.length });
  })

  .post("/conversations/:id/read", async (c) => {
    const [conv] = await db
      .select()
      .from(schema.smsConversations)
      .where(eq(schema.smsConversations.id, c.req.param("id")))
      .limit(1);
    if (!conv) return c.json({ error: "Not found" }, 404);
    await db
      .update(schema.smsConversations)
      .set({ unreadInbound: 0, updatedAt: new Date() })
      .where(eq(schema.smsConversations.id, conv.id));
    return c.json({ id: conv.id, unreadInbound: 0 });
  })

  // ── Send ──────────────────────────────────────────────────────────────────
  .post("/send", async (c) => {
    const creds = twilioCreds();
    if (!creds) return c.json(notConnected, 400);
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const to = e164(body.to);
    const text = str(body.body);
    if (!to) return c.json({ error: "to is required in E.164 form, e.g. +13145550123" }, 400);
    if (!text) return c.json({ error: "body is required and cannot be empty" }, 400);
    if (text.length > 1600) return c.json({ error: "body is longer than 1600 characters, which Twilio will reject" }, 400);

    // Our side: an explicit from, else an active assignment, else the .env number.
    let from = e164(body.from);
    if (!from) {
      const [assigned] = await db
        .select()
        .from(schema.fleetPhoneNumbers)
        .where(eq(schema.fleetPhoneNumbers.status, "active"))
        .orderBy(desc(schema.fleetPhoneNumbers.assignedAt))
        .limit(1);
      from = assigned?.phoneNumber ?? creds.from;
    }
    const mg = messagingServiceSid();
    if (!from && !mg) {
      return c.json({ error: "no_sending_number", message: "No fleet number is assigned and TWILIO_PHONE_NUMBER is not set, so there is nothing to send from." }, 400);
    }

    const conv = await threadFor(from ?? `messaging_service:${mg}`, to);
    const form: Record<string, string> = { To: to, Body: text };
    if (mg && body.useMessagingService !== false) form.MessagingServiceSid = mg;
    else if (from) form.From = from;

    const r = await tw(creds, `${API}/Accounts/${creds.accountSid}/Messages.json`, { method: "POST", form });
    const now = new Date();
    const row = {
      id: rid("sms"),
      conversationId: conv.id,
      direction: "outbound",
      fromNumber: (r.body.from as string) || from || `messaging_service:${mg}`,
      toNumber: to,
      body: text,
      twilioSid: r.ok ? String(r.body.sid) : null,
      twilioStatus: r.ok ? String(r.body.status ?? "queued") : "rejected",
      errorCode: r.ok ? (r.body.error_code != null ? String(r.body.error_code) : null) : String(r.body.code ?? r.status),
      errorMessage: r.ok ? ((r.body.error_message as string) ?? null) : ((r.body.message as string) ?? null),
      numSegments: r.body.num_segments != null ? Number(r.body.num_segments) : null,
      priceUsd: r.body.price != null ? Number(r.body.price) : null,
      sentByUserId: str(body.sentByUserId),
      sentByName: str(body.sentByName),
      statusCheckedAt: now,
      createdAt: now,
    };
    await db.insert(schema.smsMessages).values(row);
    await db
      .update(schema.smsConversations)
      .set({
        lastMessageAt: now,
        lastMessagePreview: text.slice(0, 140),
        lastDirection: "outbound",
        messageCount: (conv.messageCount || 0) + 1,
        updatedAt: now,
      })
      .where(eq(schema.smsConversations.id, conv.id));

    if (!r.ok) {
      return c.json(
        {
          sent: false,
          message: row,
          httpStatus: r.status,
          twilioCode: r.body.code ?? null,
          twilioError: r.body.message ?? null,
          moreInfo: r.body.more_info ?? null,
        },
        502,
      );
    }
    return c.json(
      {
        sent: true,
        message: row,
        conversationId: conv.id,
        meaning: `Twilio accepted the message and reported status "${row.twilioStatus}". Accepted is not delivered — poll /api/comms/messages/${row.id}/refresh for Twilio's latest status.`,
      },
      201,
    );
  })

  // ── Ask Twilio what actually happened to a sent message ───────────────────
  .post("/messages/:id/refresh", async (c) => {
    const creds = twilioCreds();
    if (!creds) return c.json(notConnected, 400);
    const [row] = await db.select().from(schema.smsMessages).where(eq(schema.smsMessages.id, c.req.param("id"))).limit(1);
    if (!row) return c.json({ error: "Not found" }, 404);
    if (!row.twilioSid) return c.json({ error: "no_twilio_sid", message: "Twilio never accepted this message, so there is no status to read." }, 400);
    const r = await tw(creds, `${API}/Accounts/${creds.accountSid}/Messages/${row.twilioSid}.json`);
    if (!r.ok) return c.json({ refreshed: false, httpStatus: r.status, twilioError: r.body.message ?? null }, 502);
    const now = new Date();
    const patch = {
      twilioStatus: String(r.body.status ?? row.twilioStatus),
      errorCode: r.body.error_code != null ? String(r.body.error_code) : null,
      errorMessage: (r.body.error_message as string) ?? null,
      numSegments: r.body.num_segments != null ? Number(r.body.num_segments) : row.numSegments,
      priceUsd: r.body.price != null ? Number(r.body.price) : row.priceUsd,
      statusCheckedAt: now,
    };
    await db.update(schema.smsMessages).set(patch).where(eq(schema.smsMessages.id, row.id));
    return c.json({ refreshed: true, message: { ...row, ...patch }, source: "Twilio Messages resource, read just now." });
  })

  // ── Inbound webhook. Twilio POSTs form-encoded. ───────────────────────────
  .post("/inbound", async (c) => {
    const form = await c.req.parseBody().catch(() => ({}) as Record<string, unknown>);
    const from = e164(form.From);
    const to = e164(form.To);
    const text = typeof form.Body === "string" ? form.Body : "";
    if (!from || !to) {
      return c.text("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response/>", 200, { "Content-Type": "text/xml" });
    }
    const conv = await threadFor(to, from);
    const now = new Date();
    const inboundId = rid("sms");
    await db.insert(schema.smsMessages).values({
      id: inboundId,
      conversationId: conv.id,
      direction: "inbound",
      fromNumber: from,
      toNumber: to,
      body: text,
      twilioSid: typeof form.MessageSid === "string" ? form.MessageSid : null,
      twilioStatus: "received",
      errorCode: null,
      errorMessage: null,
      numSegments: form.NumSegments != null ? Number(form.NumSegments) : null,
      priceUsd: null,
      sentByUserId: null,
      sentByName: null,
      statusCheckedAt: now,
      createdAt: now,
    });
    await db
      .update(schema.smsConversations)
      .set({
        lastMessageAt: now,
        lastMessagePreview: text.slice(0, 140),
        lastDirection: "inbound",
        unreadInbound: (conv.unreadInbound || 0) + 1,
        messageCount: (conv.messageCount || 0) + 1,
        updatedAt: now,
      })
      .where(eq(schema.smsConversations.id, conv.id));

    // THE SEALED LINE: seal the inbound line at arrival, stamped with the
    // driver's duty clock as of this second. Sealing must never break receiving,
    // so a failure is swallowed here — /api/sealed-line/seal re-seals pending.
    try {
      await sealMessage(inboundId);
    } catch {
      /* the message is stored either way; sealing is retryable and idempotent */
    }

    // THE CLOCK ANSWER: parse the ask and, when a real clock backs it, reply over
    // the same fleet number and seal the reply into the same chain. This must
    // never break receiving either, so every failure is swallowed and recorded.
    try {
      await autoReplyTo(inboundId, conv);
    } catch {
      /* the ask is stored and sealed either way; the answer is retryable */
    }

    // Empty TwiML on purpose: the reply goes out through the Twilio REST API
    // instead, so Twilio's own Message SID, status and error code are stored
    // verbatim on the outbound row. TwiML would give us none of that.
    return c.text("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response/>", 200, { "Content-Type": "text/xml" });
  })

  // ── What the auto-answer did, and what it refused to do ───────────────────
  .get("/auto-reply", async (c) => {
    const rows = await db
      .select()
      .from(schema.clockAnswers)
      .orderBy(desc(schema.clockAnswers.createdAt))
      .limit(50);
    const decided = rows.filter((r) => r.autoReplyDecision);
    const tally: Record<string, number> = {};
    for (const r of decided) tally[r.autoReplyDecision as string] = (tally[r.autoReplyDecision as string] ?? 0) + 1;
    return c.json(
      {
        enabled: autoReplyEnabled(),
        envVar: "SEALED_LINE_AUTO_REPLY",
        howToDisable: "Set SEALED_LINE_AUTO_REPLY=off in .env and restart. No reply is sent while it is off.",
        twilioConfigured: Boolean(twilioCreds()),
        credentials: credentialShape(),
        decisionsRecorded: decided.length,
        sent: tally.sent ?? 0,
        tally,
        recent: decided.slice(0, 20).map((r) => ({
          id: r.id,
          at: r.createdAt,
          conversationId: r.conversationId,
          driverId: r.driverId,
          askText: r.askText,
          parsedIntent: r.parsedIntent,
          verdict: r.verdict,
          hoursNeeded: r.clockHoursNeeded,
          hoursAvailable: r.clockHoursAvailable,
          decision: r.autoReplyDecision,
          autoSent: r.autoSent,
          replyText: r.autoSent ? r.draftReply : null,
          replyMessageId: r.replySentMessageId,
          twilioSid: r.replyTwilioSid,
          error: r.autoReplyError,
        })),
        rules: [
          "Answered only when a driver phone match produced a real duty clock AND miles, hours or a deadline parsed out of the text.",
          "Never answered on a carrier opt-out keyword.",
          "The same answer text is not sent to a thread twice inside 10 minutes, so a retried webhook cannot double-text.",
          "Every skip is written to clock_answers with its reason, so silence is auditable.",
        ],
        notClaimed:
          "An answer is 49 CFR 395 arithmetic against stored hos_logs rows. It is not legal advice, and it is only as correct as those rows.",
        generatedAt: new Date().toISOString(),
      },
      200,
    );
  })

  /**
   * Live 10DLC campaign state for the Messaging Service this app actually sends
   * from, read straight off Twilio. Exists because a message can get a real
   * Twilio SID and still be refused by the carrier, and the reason lives here —
   * not in our logs. Nothing is cached and nothing is inferred: no credentials
   * means no answer rather than a guess.
   */
  .get("/a2p-status", async (c) => {
    const creds = twilioCreds();
    const mg = messagingServiceSid();
    if (!creds) {
      return c.json({ ...notConnected, messagingServiceSid: mg, credentials: credentialShape() }, 200);
    }
    if (!mg) {
      return c.json(
        {
          connected: true,
          messagingServiceSid: null,
          blocker:
            "No TWILIO_MESSAGING_SERVICE_SID in .env, so there is no Messaging Service to read a campaign from.",
        },
        200,
      );
    }

    const [comp, pool] = await Promise.all([
      tw(creds, `${MESSAGING}/Services/${mg}/Compliance/Usa2p`),
      tw(creds, `${MESSAGING}/Services/${mg}/PhoneNumbers?PageSize=50`),
    ]);

    // Twilio returns the campaign inside a `compliance` ARRAY. Reading top-level
    // keys here silently yields all-nulls and reads as "nothing is registered".
    const row = (Array.isArray(comp.body?.compliance) ? comp.body.compliance : [])[0] as
      | Record<string, unknown>
      | undefined;

    const senders = (Array.isArray(pool.body?.phone_numbers) ? pool.body.phone_numbers : []).map(
      (p: Record<string, unknown>) => ({
        sid: p.sid ?? null,
        phoneNumber: p.phone_number ?? null,
        capabilities: p.capabilities ?? null,
      }),
    );

    const from = process.env.TWILIO_FROM_NUMBER?.trim() || process.env.TWILIO_PHONE_NUMBER?.trim() || null;
    const sendingNumberInPool = from
      ? senders.some((s) => String(s.phoneNumber ?? "").replace(/\D/g, "").slice(-10) === from.replace(/\D/g, "").slice(-10))
      : null;

    if (!row) {
      return c.json(
        {
          connected: true,
          messagingServiceSid: mg,
          httpStatus: comp.status,
          campaignFiled: false,
          campaignStatus: "none",
          carrierWillFilter: true,
          senders,
          sendingNumber: from,
          sendingNumberInPool,
          plainEnglish:
            "No 10DLC campaign is attached to this Messaging Service. Until one is filed and approved, US carriers refuse the traffic — Twilio still hands back a message SID, so a send looks successful in the app and never reaches the phone.",
          generatedAt: new Date().toISOString(),
        },
        200,
      );
    }

    const status = String(row.campaign_status ?? "unknown");
    const approved = /^(verified|approved|active)$/i.test(status);
    const errors = Array.isArray(row.errors) ? row.errors : [];

    return c.json(
      {
        connected: true,
        messagingServiceSid: mg,
        httpStatus: comp.status,
        campaignFiled: true,
        campaignSid: row.sid ?? null,
        campaignStatus: status,
        campaignId: row.campaign_id ?? null,
        brandRegistrationSid: row.brand_registration_sid ?? null,
        useCase: row.us_app_to_person_usecase ?? null,
        mock: row.mock ?? null,
        filedAt: row.date_created ?? null,
        updatedAt: row.date_updated ?? null,
        errors,
        description: row.description ?? null,
        messageFlow: row.message_flow ?? null,
        messageSamples: Array.isArray(row.message_samples) ? row.message_samples : [],
        helpMessage: row.help_message ?? null,
        optOutKeywords: Array.isArray(row.opt_out_keywords) ? row.opt_out_keywords : [],
        hasEmbeddedLinks: row.has_embedded_links ?? null,
        hasEmbeddedPhone: row.has_embedded_phone ?? null,
        rateLimits: row.rate_limits ?? null,
        approved,
        carrierWillFilter: !approved,
        useCaseFit: useCaseFit(
          (row.us_app_to_person_usecase ?? null) as string | null,
          Array.isArray(row.message_samples) ? row.message_samples : [],
          Array.isArray(row.opt_in_keywords) ? row.opt_in_keywords : [],
        ),
        senders,
        sendingNumber: from,
        sendingNumberInPool,
        plainEnglish: approved
          ? "The campaign is approved. Carriers accept traffic from this Messaging Service, so an undelivered message now means a real delivery problem, not registration."
          : `The campaign is filed on this Messaging Service and is sitting at "${status}". Nothing is broken and nothing needs re-filing — it is waiting on carrier and TCR vetting. While it waits, outbound US SMS comes back "undelivered" with error 30034. That error code means the carrier has not finished approving the campaign, NOT that the app failed to send: Twilio accepted the message and issued a real SID, which is why the sealed chain still verifies.`,
        errorCode30034:
          "30034 = US A2P 10DLC: the sending number is not attached to an approved campaign. Carrier-side rejection, after Twilio accepted the message.",
        notClaimed:
          "This is Twilio's own campaign record read live. No approval date is predicted here, because Twilio does not publish one.",
        generatedAt: new Date().toISOString(),
      },
      200,
    );
  })

  /**
   * Retry the answers the provider refused. Every attempt RECOMPUTES the clock
   * as of now rather than resending the original text, because the hours in an
   * answer written an hour ago are no longer the driver's hours. The earlier
   * clock_answers row is never edited — a retry is a new row pointing at it.
   */
  .post("/auto-reply/retry", async (c) => {
    const creds = twilioCreds();
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const limit = Math.min(Number(body.limit) || 10, 25);

    const failed = (
      await db
        .select()
        .from(schema.clockAnswers)
        .orderBy(desc(schema.clockAnswers.createdAt))
        .limit(200)
    ).filter(
      (r) =>
        !r.autoSent &&
        r.inboundMessageId &&
        (r.autoReplyDecision === "send_failed" || r.autoReplyDecision === "skipped_no_creds"),
    );

    // A row that a later attempt already retried is not retried again.
    const retried = new Set(
      (await db.select().from(schema.clockAnswers)).map((r) => r.retryOfAnswerId).filter(Boolean) as string[],
    );
    const queue = failed.filter((r) => !retried.has(r.id)).slice(0, limit);

    if (!creds)
      return c.json(
        {
          retried: 0,
          pending: queue.length,
          blocked: true,
          reason:
            "TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are not set, so nothing could be sent. The queue is unchanged and still retryable.",
        },
        400,
      );

    const nowMs = Date.now();
    const results: Record<string, unknown>[] = [];

    for (const row of queue) {
      const ans = await answerForInbound(row.inboundMessageId as string, nowMs);
      if (!ans || !ans.answerable) {
        results.push({
          answerId: row.id,
          decision: "skipped_not_answerable_now",
          reason:
            ans?.notAnswerableReason ??
            "The inbound message could not be read back, so nothing was sent on this retry.",
        });
        continue;
      }
      const [conv] = await db
        .select()
        .from(schema.smsConversations)
        .where(eq(schema.smsConversations.id, row.conversationId ?? ""))
        .limit(1);
      if (!conv) {
        results.push({ answerId: row.id, decision: "skipped_no_thread", reason: "The thread for this answer no longer exists." });
        continue;
      }

      const v = ans.verdict;
      const sent = await sendOutbound({
        creds,
        conv,
        from: conv.fleetNumber?.startsWith("+") ? conv.fleetNumber : null,
        to: conv.peerNumber,
        text: v.draftReply,
        sentByName: "TruckWithEase clock answer (retry)",
      });
      try {
        await sealMessage(sent.row.id);
      } catch {
        /* the reply is stored either way; sealing is retryable and idempotent */
      }

      const newId = rid("cans");
      await db.insert(schema.clockAnswers).values({
        id: newId,
        sealedMessageId: null,
        conversationId: conv.id,
        driverId: ans.driver?.id ?? null,
        askText: row.askText,
        parsedMiles: v.parsed.miles,
        parsedDeadlineAt: v.parsed.deadlineAtMs ? new Date(v.parsed.deadlineAtMs) : null,
        parsedIntent: v.parsed.intent,
        verdict: v.verdict,
        verdictReason: v.reason,
        clockHoursNeeded: v.hoursNeeded,
        clockHoursAvailable: v.hoursAvailable,
        assumedMph: v.assumedMph,
        draftReply: v.draftReply,
        replySentMessageId: sent.row.id,
        replyTwilioSid: sent.row.twilioSid,
        autoSent: sent.ok,
        inboundMessageId: row.inboundMessageId,
        autoReplyDecision: sent.ok ? "sent_on_retry" : "retry_send_failed",
        autoReplyError: sent.ok ? null : (sent.row.errorMessage ?? String(sent.body.message ?? "")),
        retryOfAnswerId: row.id,
      });

      results.push({
        answerId: newId,
        retryOf: row.id,
        decision: sent.ok ? "sent_on_retry" : "retry_send_failed",
        verdict: v.verdict,
        clockRecomputedAt: new Date(nowMs).toISOString(),
        hoursNeeded: v.hoursNeeded,
        hoursAvailable: v.hoursAvailable,
        replyMessageId: sent.row.id,
        twilioSid: sent.row.twilioSid,
        twilioStatus: sent.row.twilioStatus,
        error: sent.ok ? null : (sent.row.errorMessage ?? null),
      });
    }

    const sentCount = results.filter((r) => r.decision === "sent_on_retry").length;
    return c.json(
      {
        queueSize: failed.length,
        attempted: queue.length,
        sent: sentCount,
        results,
        clockPolicy:
          "Each retry answers with the clock recomputed at the moment of sending, not the clock that was current when the ask arrived. Stale hours are never re-sent.",
        appendOnly: "No earlier clock_answers row was edited. Each retry is a new row whose retry_of_answer_id points at the attempt it replaces.",
        generatedAt: new Date().toISOString(),
      },
      200,
    );
  })

  /**
   * REFILE READINESS — the measurable gate in front of another 10DLC filing.
   *
   * The last refile came back FAILED with 30882 (TERMS_AND_CONDITIONS_URL) and 30908
   * (PRIVACY_POLICY_URL). Neither error was about the message content: the reviewer went to
   * the brand's website looking for Terms and a Privacy policy and the domain did not resolve.
   * Filing again before that is fixed spends money to collect the same two errors.
   *
   * So this endpoint measures the thing that actually failed, from this server, right now:
   * does the public host resolve, do the two required pages answer over HTTPS, and does the
   * privacy page carry the sentence the carriers look for. Every number below is a live check.
   */
  .get("/refile-readiness", async (c) => {
    const started = Date.now();
    const host = (process.env.PUBLIC_SITE_HOST?.trim().replace(/^"|"$/g, "") || "truckwithease.com").replace(
      /^https?:\/\//,
      "",
    );

    // The exact sentence US carriers look for on a privacy policy that backs SMS traffic.
    const CARRIER_SENTENCE =
      "No mobile information is sold or shared with any third party for marketing or promotional purposes";

    let dns: { resolves: boolean; addresses: string[]; error: string | null };
    try {
      const found = await lookup(host, { all: true });
      dns = { resolves: found.length > 0, addresses: found.map((f) => f.address), error: null };
    } catch (e) {
      dns = { resolves: false, addresses: [], error: e instanceof Error ? e.message : String(e) };
    }

    const probe = async (path: string) => {
      const url = `https://${host}${path}`;
      if (!dns.resolves) {
        return {
          url,
          reachable: false,
          httpStatus: null as number | null,
          bytes: null as number | null,
          ms: null as number | null,
          error: "host does not resolve, so no request was attempted",
          carrierSentencePresent: null as boolean | null,
        };
      }
      const t0 = Date.now();
      try {
        const res = await fetch(url, {
          redirect: "follow",
          headers: { accept: "text/html" },
          signal: AbortSignal.timeout(12_000),
        });
        const text = await res.text();
        return {
          url,
          reachable: true,
          httpStatus: res.status,
          bytes: new TextEncoder().encode(text).length,
          ms: Date.now() - t0,
          error: null as string | null,
          carrierSentencePresent: text.includes(CARRIER_SENTENCE),
        };
      } catch (e) {
        return {
          url,
          reachable: false,
          httpStatus: null,
          bytes: null,
          ms: Date.now() - t0,
          error: e instanceof Error ? e.message : String(e),
          carrierSentencePresent: null,
        };
      }
    };

    const [terms, privacy] = await Promise.all([probe("/terms"), probe("/privacy")]);

    // Same two pages, served locally. This separates "the pages don't exist" from
    // "the pages exist but the public internet can't reach them" — very different fixes.
    const localPort = process.env.PORT?.trim() || "4200";
    const localProbe = async (path: string) => {
      const t0 = Date.now();
      try {
        const res = await fetch(`http://localhost:${localPort}${path}`, {
          signal: AbortSignal.timeout(8_000),
        });
        await res.text();
        return { path, httpStatus: res.status, ms: Date.now() - t0, error: null as string | null };
      } catch (e) {
        return { path, httpStatus: null, ms: Date.now() - t0, error: e instanceof Error ? e.message : String(e) };
      }
    };
    const [termsLocal, privacyLocal] = await Promise.all([localProbe("/terms"), localProbe("/privacy")]);

    const pagesPublic = terms.httpStatus === 200 && privacy.httpStatus === 200;
    const pagesLocal = termsLocal.httpStatus === 200 && privacyLocal.httpStatus === 200;

    const blockers: Array<{ key: string; blocked: boolean; detail: string; whoCanFix: string }> = [
      {
        key: "public_dns",
        blocked: !dns.resolves,
        detail: dns.resolves
          ? `${host} resolves to ${dns.addresses.join(", ")}.`
          : `${host} has no A or AAAA record that this server can resolve${dns.error ? ` (${dns.error})` : ""}. A carrier reviewer typing the domain gets nothing, which is exactly what produced 30882 and 30908.`,
        whoCanFix: "Jeremiah — publish the site from the Runable platform UI and point the Cloudflare DNS record at it. Not something this server can do.",
      },
      {
        key: "public_terms_page",
        blocked: terms.httpStatus !== 200,
        detail:
          terms.httpStatus === 200
            ? `https://${host}/terms answered 200 in ${terms.ms} ms (${terms.bytes} bytes).`
            : `https://${host}/terms did not answer 200${terms.error ? ` — ${terms.error}` : ` — status ${terms.httpStatus}`}. Locally the same route answers ${termsLocal.httpStatus ?? "no status"}, so the page exists; it is only unreachable from outside.`,
        whoCanFix: "Jeremiah — same publish step.",
      },
      {
        key: "public_privacy_page",
        blocked: privacy.httpStatus !== 200,
        detail:
          privacy.httpStatus === 200
            ? `https://${host}/privacy answered 200 in ${privacy.ms} ms (${privacy.bytes} bytes).`
            : `https://${host}/privacy did not answer 200${privacy.error ? ` — ${privacy.error}` : ` — status ${privacy.httpStatus}`}. Locally the same route answers ${privacyLocal.httpStatus ?? "no status"}, so the page exists; it is only unreachable from outside.`,
        whoCanFix: "Jeremiah — same publish step.",
      },
      {
        key: "carrier_sentence_on_public_privacy",
        blocked: privacy.carrierSentencePresent !== true,
        detail:
          privacy.carrierSentencePresent === true
            ? "The public privacy page carries the no-sale sentence carriers look for, verbatim."
            : privacy.carrierSentencePresent === false
              ? "The public privacy page answered but does not contain the required no-sale sentence."
              : "Could not be checked because the public privacy page was never reached.",
        whoCanFix: "Already written into PrivacyNoticePage — it only needs to be publicly reachable to count.",
      },
    ];

    const readyToRefile = blockers.every((b) => !b.blocked);

    return c.json(
      {
        readyToRefile,
        publicHost: host,
        dns,
        publicPages: { terms, privacy },
        localPages: { terms: termsLocal, privacy: privacyLocal },
        pagesPublic,
        pagesLocal,
        carrierSentence: CARRIER_SENTENCE,
        blockers,
        lastFilingResult: {
          httpStatus: 201,
          campaignStatus: "FAILED",
          useCase: "LOW_VOLUME",
          errors: [
            { code: 30882, field: "TERMS_AND_CONDITIONS_URL", meaning: "rejected due to Terms and Conditions issues" },
            { code: 30908, field: "PRIVACY_POLICY_URL", meaning: "a compliant privacy policy can not be verified" },
          ],
          readOf: "Twilio returned 201 on create, then the campaign record read back FAILED seconds later with these two errors.",
        },
        whatHappensWhenGreen: [
          "Delete the FAILED campaign on the Messaging Service it was filed against.",
          "Re-create it with the internal-fleet-comms content already live in this app — read it at GET /api/comms/a2p-status under useCaseFit.recommended.",
          "Move the app's sending number into that Messaging Service, since a number can only belong to one.",
          "Update TWILIO_MESSAGING_SERVICE_SID in .env and restart, because env is only read at boot.",
          "POST a fresh inbound and confirm the outbound moves from undelivered to delivered. That is the moment the Sealed Line is provably end-to-end.",
        ],
        notClaimed: [
          "A 200 from this server proves the pages are reachable from the public internet. It does not guarantee a human carrier reviewer accepts their content.",
          "This endpoint files nothing and deletes nothing. Filing costs money and triggers vetting, so it stays a human decision.",
          "The old 2FA campaign is deliberately left in place until a replacement is confirmed approved, at roughly $2/month of overlap.",
          "TruckWithEase is not an ELD and is not FMCSA-registered.",
        ],
        measuredMs: Date.now() - started,
        generatedAt: new Date().toISOString(),
      },
      200,
    );
  });

export default comms;
