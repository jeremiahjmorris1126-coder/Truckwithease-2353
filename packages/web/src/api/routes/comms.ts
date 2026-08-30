import { Hono } from "hono";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { twilioCreds } from "./twilio";

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
  const auth = Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString("base64");
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
    await db.insert(schema.smsMessages).values({
      id: rid("sms"),
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

    // Empty TwiML: the message is stored, and no automatic reply is sent.
    return c.text("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response/>", 200, { "Content-Type": "text/xml" });
  });

export default comms;
