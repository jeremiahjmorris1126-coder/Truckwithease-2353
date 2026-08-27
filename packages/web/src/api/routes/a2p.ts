import { Hono } from "hono";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";

/**
 * A2P 10DLC registration staging — server side.
 *
 * Replaces the PocketBase calls in legacy/pages/A2PRegistrationPage.jsx, which
 * wrote to a collection (`a2p_registrations`) that existed on no server.
 *
 * HONESTY RULE — read before touching this file:
 * A2P 10DLC brand and campaign registration happens with The Campaign Registry
 * THROUGH a messaging provider. Twilio credentials are now present in `.env`,
 * so this file talks to Twilio for real. Two things are still true and must
 * stay true:
 *   1. Twilio will not accept a brand until a Trust Hub Customer Profile
 *      bundle AND an A2P Trust Product bundle exist on the Twilio account.
 *      Those are created in the Twilio console; their SIDs (BUxxxx) must be
 *      stored on the registration row before a submit can succeed.
 *   2. Approval is decided by TCR and the carriers, never by this app. A row
 *      only becomes `approved` when Twilio reports it, or when a human records
 *      a real brandId. `approved` without a brandId still returns 400.
 */

const rid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const BUSINESS_TYPES = ["sole_proprietor", "llc", "corporation", "partnership", "non_profit"] as const;
export const USE_CASE_CATEGORIES = [
  "mixed",
  "customer_care",
  "2fa",
  "marketing",
  "delivery_notification",
] as const;
export const A2P_STATUSES = ["draft", "ready", "submitted", "approved", "rejected"] as const;

/** Twilio credentials. Present == this file can talk to Twilio for real. */
type TwilioCreds = { accountSid: string; authToken: string; from: string | null };
const twilioCreds = (): TwilioCreds | null => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!accountSid || !authToken) return null;
  const raw = process.env.TWILIO_PHONE_NUMBER?.trim() ?? "";
  const digits = raw.replace(/\D/g, "");
  const from = digits ? (raw.startsWith("+") ? raw : `+${digits.length === 10 ? "1" + digits : digits}`) : null;
  return { accountSid, authToken, from };
};

const TWILIO_MESSAGING = "https://messaging.twilio.com/v1";

/** One place for every Twilio call. Returns the parsed body plus the status so
 *  callers can surface Twilio's own error text instead of inventing one. */
async function twilioFetch(
  creds: TwilioCreds,
  url: string,
  init?: { method?: string; form?: Record<string, string> },
): Promise<{ ok: boolean; status: number; body: Record<string, unknown> }> {
  const auth = Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString("base64");
  const res = await fetch(url, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Basic ${auth}`,
      ...(init?.form ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: init?.form ? new URLSearchParams(init.form).toString() : undefined,
  });
  const text = await res.text();
  let body: Record<string, unknown> = {};
  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    body = { raw: text };
  }
  return { ok: res.ok, status: res.status, body };
}

const carrierMode = () => {
  const creds = twilioCreds();
  return {
    provider: creds ? "twilio" : null,
    canSubmit: Boolean(creds),
    submittedToCarrier: false,
    fromNumber: creds?.from ?? null,
    reason: creds
      ? "Twilio credentials are present. POST /api/a2p/:id/submit files the brand with Twilio for real — but Twilio requires a Trust Hub Customer Profile bundle SID and an A2P Trust Product bundle SID on the row first (POST /api/a2p/:id/bundles). Without them the submit stops at `ready` and tells you which one is missing."
      : "No messaging provider credentials in .env. A2P 10DLC registration goes to The Campaign Registry through a provider. Until TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN exist, this only stores your application data.",
    brandIdNote:
      "brandId is the Twilio BrandRegistration SID (BNxxxx) and campaignId is the Messaging Service / campaign SID. Both come back from Twilio and TCR — never set them by hand unless you are copying a real value out of the Twilio console.",
    approvalNote: "Approval is decided by TCR and the carriers. This app only reports what Twilio returns.",
  };
};

const emailOk = (v: unknown): v is string =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/** EIN is 9 digits, commonly written 12-3456789. Format check only — this is
 *  not an IRS verification. */
const einFormatOk = (v: string) => /^\d{2}-?\d{7}$/.test(v.trim());

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

/** What TCR actually rejects brands and campaigns for. Used to tell the user
 *  what is still missing before anything gets submitted. */
function readiness(r: Record<string, unknown>) {
  const missing: string[] = [];
  if (!r.legalBusinessName) missing.push("legalBusinessName — must match IRS/state registration exactly");
  if (!r.ein) missing.push("ein — required for anything other than sole proprietor");
  if (!r.businessType) missing.push("businessType");
  if (!r.street || !r.city || !r.state || !r.postalCode) missing.push("full business address");
  if (!r.website) missing.push("website — TCR checks that it exists and matches the business");
  if (!r.contactEmail) missing.push("contactEmail");
  if (!r.contactPhone) missing.push("contactPhone");
  if (!r.useCaseCategory) missing.push("useCaseCategory");
  if (!r.useCaseDescription) missing.push("useCaseDescription");

  let samples: string[] = [];
  try {
    const parsed = JSON.parse(typeof r.sampleMessages === "string" ? r.sampleMessages : "[]");
    if (Array.isArray(parsed)) samples = parsed.filter((s) => typeof s === "string" && s.trim());
  } catch {
    samples = [];
  }
  if (samples.length < 2) missing.push("at least 2 sampleMessages");
  const noOptOut = samples.length > 0 && !samples.some((s) => /stop|unsubscribe/i.test(s));
  if (noOptOut) missing.push('at least one sample message containing opt-out language such as "Reply STOP to unsubscribe"');
  if (!r.optInDescription) missing.push("optInDescription — how the recipient agreed to be texted");
  if (!r.optInProofUrl) missing.push("optInProofUrl — a public URL showing the opt-in form or checkbox");

  return { ready: missing.length === 0, missing, sampleCount: samples.length };
}

export const a2p = new Hono()

  // ── Config ────────────────────────────────────────────────────────────────
  .get("/", (c) =>
    c.json({
      businessTypes: BUSINESS_TYPES,
      useCaseCategories: USE_CASE_CATEGORIES,
      statuses: A2P_STATUSES,
      carrier: carrierMode(),
      requirements: [
        "Legal business name must match IRS / Secretary of State records character for character.",
        "EIN is required for an LLC, corporation, partnership or non-profit.",
        "A live website matching the business is checked by The Campaign Registry.",
        "Sample messages must show real message content, and at least one must carry opt-out language.",
        "Opt-in proof must be publicly reachable — a screenshot behind a login gets rejected.",
      ],
      feesNote:
        "TCR charges a one-time brand registration fee plus a monthly campaign fee, billed through whichever messaging provider you use. Those fees are not handled by this app.",
    }),
  )

  // ── Create / update a staged registration ─────────────────────────────────
  .post("/", async (c) => {
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const legalBusinessName = str(body.legalBusinessName);
    if (!legalBusinessName) return c.json({ error: "legalBusinessName is required" }, 400);

    const businessType = str(body.businessType);
    if (businessType && !(BUSINESS_TYPES as readonly string[]).includes(businessType)) {
      return c.json({ error: `businessType must be one of ${BUSINESS_TYPES.join(", ")}` }, 400);
    }
    const useCaseCategory = str(body.useCaseCategory);
    if (useCaseCategory && !(USE_CASE_CATEGORIES as readonly string[]).includes(useCaseCategory)) {
      return c.json({ error: `useCaseCategory must be one of ${USE_CASE_CATEGORIES.join(", ")}` }, 400);
    }
    const ein = str(body.ein);
    if (ein && !einFormatOk(ein)) {
      return c.json({ error: "ein must be 9 digits, e.g. 12-3456789. This is a format check only, not an IRS lookup." }, 400);
    }
    if (body.contactEmail !== undefined && body.contactEmail !== null && !emailOk(body.contactEmail)) {
      return c.json({ error: "contactEmail is not a valid email address" }, 400);
    }

    const samples = Array.isArray(body.sampleMessages)
      ? (body.sampleMessages as unknown[]).filter((s) => typeof s === "string" && s.trim()).map((s) => (s as string).trim())
      : [];
    const volume = Number(body.estimatedMonthlyVolume);

    const now = new Date();
    const row = {
      id: rid("a2p"),
      legalBusinessName,
      dbaName: str(body.dbaName),
      ein,
      businessType,
      street: str(body.street),
      city: str(body.city),
      state: str(body.state),
      postalCode: str(body.postalCode),
      country: str(body.country) ?? "US",
      website: str(body.website),
      contactName: str(body.contactName),
      contactEmail: emailOk(body.contactEmail) ? (body.contactEmail as string).trim().toLowerCase() : null,
      contactPhone: str(body.contactPhone),
      useCaseCategory,
      useCaseDescription: str(body.useCaseDescription),
      sampleMessages: JSON.stringify(samples),
      optInDescription: str(body.optInDescription),
      optInProofUrl: str(body.optInProofUrl),
      estimatedMonthlyVolume: Number.isFinite(volume) && volume > 0 ? Math.floor(volume) : null,
      // Assigned by TCR through a provider. Never set from here.
      provider: null,
      brandId: null,
      campaignId: null,
      status: "draft" as const,
      submittedAt: null,
      decisionAt: null,
      rejectionReason: null,
      notes: str(body.notes),
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(schema.a2pRegistrations).values(row);
    const check = readiness(row as unknown as Record<string, unknown>);

    return c.json(
      {
        registration: { ...row, sampleMessages: samples },
        readiness: check,
        einCheck: ein ? "Format only — 9 digits. Not verified against the IRS." : null,
        carrier: carrierMode(),
      },
      201,
    );
  })

  .get("/list", async (c) => {
    const status = c.req.query("status");
    const rows = status
      ? await db
          .select()
          .from(schema.a2pRegistrations)
          .where(eq(schema.a2pRegistrations.status, status))
          .orderBy(desc(schema.a2pRegistrations.createdAt))
          .limit(200)
      : await db.select().from(schema.a2pRegistrations).orderBy(desc(schema.a2pRegistrations.createdAt)).limit(200);

    const counts = await db
      .select({ status: schema.a2pRegistrations.status, n: sql<number>`count(*)` })
      .from(schema.a2pRegistrations)
      .groupBy(schema.a2pRegistrations.status);

    return c.json({
      registrations: rows.map((r) => ({
        ...r,
        readiness: readiness(r as unknown as Record<string, unknown>),
      })),
      total: rows.length,
      counts: Object.fromEntries(counts.map((r) => [r.status, Number(r.n)])),
      carrier: carrierMode(),
    });
  })

  .get("/:id", async (c) => {
    const [row] = await db
      .select()
      .from(schema.a2pRegistrations)
      .where(eq(schema.a2pRegistrations.id, c.req.param("id")))
      .limit(1);
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json({
      registration: row,
      readiness: readiness(row as unknown as Record<string, unknown>),
      carrier: carrierMode(),
    });
  })

  // ── Twilio credential health ──────────────────────────────────────────────
  // Real call to Twilio. Proves the credentials in .env actually work instead
  // of assuming they do.
  .get("/twilio/health", async (c) => {
    const creds = twilioCreds();
    if (!creds) return c.json({ connected: false, reason: "TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN are not set in .env" }, 200);
    const r = await twilioFetch(creds, `https://api.twilio.com/2010-04-01/Accounts/${creds.accountSid}.json`);
    if (!r.ok) {
      return c.json(
        { connected: false, httpStatus: r.status, twilioError: r.body.message ?? r.body, reason: "Twilio rejected these credentials." },
        200,
      );
    }
    return c.json({
      connected: true,
      accountSid: creds.accountSid,
      friendlyName: r.body.friendly_name ?? null,
      accountStatus: r.body.status ?? null,
      accountType: r.body.type ?? null,
      fromNumber: creds.from,
      note: "Credentials are valid. Brand filing still needs Trust Hub bundle SIDs — see POST /api/a2p/:id/bundles.",
    });
  })

  // ── Attach Twilio Trust Hub bundle SIDs to a registration ─────────────────
  // Twilio will not accept a brand without these. They are created once, in the
  // Twilio console under Trust Hub, and reused for every brand on the account.
  .post("/:id/bundles", async (c) => {
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const cp = str(body.customerProfileBundleSid);
    const a2pB = str(body.a2pProfileBundleSid);
    if (!cp && !a2pB) {
      return c.json({ error: "Send customerProfileBundleSid and/or a2pProfileBundleSid. Both start with BU and come from the Twilio console." }, 400);
    }
    for (const [k, v] of [["customerProfileBundleSid", cp], ["a2pProfileBundleSid", a2pB]] as const) {
      if (v && !/^BU[0-9a-f]{32}$/i.test(v)) return c.json({ error: `${k} does not look like a Twilio bundle SID (BU + 32 hex chars)` }, 400);
    }
    const [row] = await db.select().from(schema.a2pRegistrations).where(eq(schema.a2pRegistrations.id, c.req.param("id"))).limit(1);
    if (!row) return c.json({ error: "Not found" }, 404);

    // Verify each SID actually exists on the Twilio account before storing it.
    const creds = twilioCreds();
    const verified: Record<string, unknown> = {};
    if (creds) {
      for (const [k, v] of [["customerProfileBundleSid", cp], ["a2pProfileBundleSid", a2pB]] as const) {
        if (!v) continue;
        const r = await twilioFetch(creds, `https://trusthub.twilio.com/v1/CustomerProfiles/${v}`);
        verified[k] = r.ok ? { exists: true, status: r.body.status ?? null } : { exists: false, httpStatus: r.status, twilioError: r.body.message ?? null };
        if (!r.ok) return c.json({ error: `Twilio does not recognise ${k} ${v}`, twilio: verified[k] }, 400);
      }
    }

    const now = new Date();
    await db
      .update(schema.a2pRegistrations)
      .set({
        customerProfileBundleSid: cp ?? row.customerProfileBundleSid,
        a2pProfileBundleSid: a2pB ?? row.a2pProfileBundleSid,
        provider: "twilio",
        updatedAt: now,
      })
      .where(eq(schema.a2pRegistrations.id, row.id));

    return c.json({
      id: row.id,
      customerProfileBundleSid: cp ?? row.customerProfileBundleSid,
      a2pProfileBundleSid: a2pB ?? row.a2pProfileBundleSid,
      verifiedAgainstTwilio: creds ? verified : "skipped — no Twilio credentials in .env",
      carrier: carrierMode(),
    });
  })

  // ── File the brand with Twilio ────────────────────────────────────────────
  // With credentials AND both Trust Hub bundle SIDs this performs a real
  // POST to Twilio's BrandRegistrations endpoint. Without them it stops at
  // `ready` and says exactly what is missing. It never claims approval.
  .post("/:id/submit", async (c) => {
    const [row] = await db
      .select()
      .from(schema.a2pRegistrations)
      .where(eq(schema.a2pRegistrations.id, c.req.param("id")))
      .limit(1);
    if (!row) return c.json({ error: "Not found" }, 404);

    const check = readiness(row as unknown as Record<string, unknown>);
    if (!check.ready) {
      return c.json(
        {
          id: row.id,
          status: row.status,
          submittedToCarrier: false,
          readiness: check,
          error: "Application is incomplete. The Campaign Registry rejects brands for exactly these gaps.",
        },
        400,
      );
    }

    const now = new Date();
    const creds = twilioCreds();

    // No credentials, or Trust Hub bundles not attached yet → stage only.
    const blockers: string[] = [];
    if (!creds) blockers.push("TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN missing from .env");
    if (!row.customerProfileBundleSid) blockers.push("customerProfileBundleSid — create a Trust Hub Customer Profile in the Twilio console, then POST /api/a2p/:id/bundles");
    if (!row.a2pProfileBundleSid) blockers.push("a2pProfileBundleSid — create the A2P Trust Product bundle in the Twilio console, then POST /api/a2p/:id/bundles");

    if (blockers.length) {
      await db
        .update(schema.a2pRegistrations)
        .set({ status: "ready", submittedAt: now, updatedAt: now })
        .where(eq(schema.a2pRegistrations.id, row.id));
      return c.json({
        id: row.id,
        status: "ready",
        markedReadyAt: now,
        submittedToCarrier: false,
        brandId: null,
        campaignId: null,
        blockers,
        nextStep:
          "Your application data is complete. Clear the blockers above and call this endpoint again — it will then file the brand with Twilio for real.",
        carrier: carrierMode(),
      });
    }

    // Real submission.
    const twilio = creds as TwilioCreds;
    const form: Record<string, string> = {
      CustomerProfileBundleSid: row.customerProfileBundleSid as string,
      A2PProfileBundleSid: row.a2pProfileBundleSid as string,
      BrandType: "STANDARD",
      Mock: "false",
      SkipAutomaticSecVet: "false",
    };
    const r = await twilioFetch(twilio, `${TWILIO_MESSAGING}/a2p/BrandRegistrations`, { method: "POST", form });

    if (!r.ok) {
      await db
        .update(schema.a2pRegistrations)
        .set({ status: "ready", provider: "twilio", lastCarrierResponse: JSON.stringify(r.body).slice(0, 4000), updatedAt: now })
        .where(eq(schema.a2pRegistrations.id, row.id));
      return c.json(
        {
          id: row.id,
          status: "ready",
          submittedToCarrier: false,
          httpStatus: r.status,
          twilioError: r.body.message ?? r.body,
          twilioCode: r.body.code ?? null,
          moreInfo: r.body.more_info ?? null,
          note: "Twilio refused the brand registration. The row stays `ready` — nothing was filed and nothing was billed.",
        },
        502,
      );
    }

    const brandSid = typeof r.body.sid === "string" ? r.body.sid : null;
    const twilioStatus = typeof r.body.status === "string" ? r.body.status : null;

    await db
      .update(schema.a2pRegistrations)
      .set({
        status: "submitted",
        provider: "twilio",
        brandId: brandSid,
        submittedAt: now,
        lastCarrierResponse: JSON.stringify(r.body).slice(0, 4000),
        updatedAt: now,
      })
      .where(eq(schema.a2pRegistrations.id, row.id));

    return c.json({
      id: row.id,
      status: "submitted",
      submittedToCarrier: true,
      provider: "twilio",
      brandId: brandSid,
      twilioStatus,
      submittedAt: now,
      nextStep:
        "Filed with Twilio. TCR and the carriers decide from here — typically 1–3 weeks. Poll POST /api/a2p/:id/refresh to read the real status back from Twilio. Do not mark this approved by hand.",
      carrier: carrierMode(),
    });
  })

  /**
   * Link an EXISTING Twilio brand registration to this row.
   *
   * Why this exists: /submit files a NEW brand with Twilio. When a brand has
   * already been filed and approved (as this account's has), calling /submit
   * would file a duplicate — another vetting fee and another review clock — so
   * there has to be an import path. Nothing here is taken on trust: the brand
   * SID is read back from Twilio and only what Twilio returns gets stored.
   */
  .post("/:id/link-brand", async (c) => {
    const creds = twilioCreds();
    if (!creds) return c.json({ error: "No Twilio credentials in .env — cannot verify a brand SID." }, 400);
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const brandSid = typeof body.brandId === "string" ? body.brandId.trim() : "";
    if (!/^BN[0-9a-fA-F]{32}$/.test(brandSid)) {
      return c.json({ error: "brandId must be a Twilio BrandRegistration SID: BN followed by 32 hex characters." }, 400);
    }
    const [row] = await db.select().from(schema.a2pRegistrations).where(eq(schema.a2pRegistrations.id, c.req.param("id"))).limit(1);
    if (!row) return c.json({ error: "Not found" }, 404);

    const r = await twilioFetch(creds, `${TWILIO_MESSAGING}/a2p/BrandRegistrations/${brandSid}`);
    if (!r.ok) {
      return c.json(
        {
          error: "Twilio does not return that brand for this account, so nothing was stored.",
          brandId: brandSid,
          httpStatus: r.status,
          twilioError: r.body.message ?? r.body,
        },
        502,
      );
    }

    const twilioStatus = String(r.body.status ?? "").toUpperCase();
    const mapped =
      twilioStatus === "APPROVED" ? "approved" : twilioStatus === "FAILED" ? "rejected" : twilioStatus === "IN_REVIEW" || twilioStatus === "PENDING" ? "submitted" : row.status;
    const cp = typeof r.body.customer_profile_bundle_sid === "string" ? r.body.customer_profile_bundle_sid : null;
    const a2pB = typeof r.body.a2p_profile_bundle_sid === "string" ? r.body.a2p_profile_bundle_sid : null;
    const failureReason = typeof r.body.failure_reason === "string" ? r.body.failure_reason : null;
    const now = new Date();

    await db
      .update(schema.a2pRegistrations)
      .set({
        brandId: brandSid,
        provider: "twilio",
        status: mapped,
        customerProfileBundleSid: cp ?? row.customerProfileBundleSid,
        a2pProfileBundleSid: a2pB ?? row.a2pProfileBundleSid,
        submittedAt: row.submittedAt ?? now,
        decisionAt: mapped === "approved" || mapped === "rejected" ? now : row.decisionAt,
        rejectionReason: mapped === "rejected" ? (failureReason ?? "Twilio reported FAILED without a reason string") : row.rejectionReason,
        lastCarrierResponse: JSON.stringify(r.body).slice(0, 4000),
        updatedAt: now,
      })
      .where(eq(schema.a2pRegistrations.id, row.id));

    return c.json({
      id: row.id,
      brandId: brandSid,
      linked: true,
      twilioStatus,
      status: mapped,
      identityStatus: r.body.identity_status ?? null,
      tcrId: r.body.tcr_id ?? null,
      brandType: r.body.brand_type ?? null,
      customerProfileBundleSid: cp,
      a2pProfileBundleSid: a2pB,
      readFrom: "Twilio BrandRegistrations API",
      note: "Imported an existing brand. No new brand was filed and no vetting fee was incurred.",
      nextStep:
        "An approved brand alone does not let messages flow. A messaging campaign (use case, sample messages, opt-in language) must be registered on the Messaging Service, and the sending number attached to it, before A2P traffic is delivered.",
    });
  })

  // ── Read the real status back from Twilio ─────────────────────────────────
  .post("/:id/refresh", async (c) => {
    const creds = twilioCreds();
    if (!creds) return c.json({ error: "No Twilio credentials in .env — nothing to poll." }, 400);
    const [row] = await db.select().from(schema.a2pRegistrations).where(eq(schema.a2pRegistrations.id, c.req.param("id"))).limit(1);
    if (!row) return c.json({ error: "Not found" }, 404);
    if (!row.brandId) {
      return c.json({ error: "This registration has no brandId. It was never filed with Twilio, so there is no status to read." }, 400);
    }

    const r = await twilioFetch(creds, `${TWILIO_MESSAGING}/a2p/BrandRegistrations/${row.brandId}`);
    if (!r.ok) {
      return c.json({ id: row.id, brandId: row.brandId, httpStatus: r.status, twilioError: r.body.message ?? r.body }, 502);
    }

    const twilioStatus = String(r.body.status ?? "").toUpperCase();
    const mapped =
      twilioStatus === "APPROVED" ? "approved" : twilioStatus === "FAILED" ? "rejected" : twilioStatus === "IN_REVIEW" || twilioStatus === "PENDING" ? "submitted" : row.status;
    const failureReason = typeof r.body.failure_reason === "string" ? r.body.failure_reason : null;
    const now = new Date();

    await db
      .update(schema.a2pRegistrations)
      .set({
        status: mapped,
        rejectionReason: mapped === "rejected" ? (failureReason ?? "Twilio reported FAILED without a reason string") : row.rejectionReason,
        decisionAt: mapped === "approved" || mapped === "rejected" ? now : row.decisionAt,
        lastCarrierResponse: JSON.stringify(r.body).slice(0, 4000),
        updatedAt: now,
      })
      .where(eq(schema.a2pRegistrations.id, row.id));

    return c.json({
      id: row.id,
      brandId: row.brandId,
      twilioStatus,
      status: mapped,
      failureReason,
      identityStatus: r.body.identity_status ?? null,
      brandScore: r.body.brand_score ?? null,
      readFrom: "Twilio BrandRegistrations API",
      note: "This status came from Twilio, not from anyone typing it in.",
    });
  })

  // ── Record a real outcome from a provider ─────────────────────────────────
  .post("/:id/status", async (c) => {
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const status = typeof body.status === "string" ? body.status : "";
    if (!(A2P_STATUSES as readonly string[]).includes(status)) {
      return c.json({ error: `status must be one of ${A2P_STATUSES.join(", ")}` }, 400);
    }
    const [row] = await db
      .select()
      .from(schema.a2pRegistrations)
      .where(eq(schema.a2pRegistrations.id, c.req.param("id")))
      .limit(1);
    if (!row) return c.json({ error: "Not found" }, 404);

    if (status === "approved" && !str(body.brandId)) {
      return c.json(
        {
          error:
            "approved requires the real brandId issued by The Campaign Registry. Without it there is no evidence of approval, and marking this approved would be a claim we cannot back.",
        },
        400,
      );
    }
    if (status === "rejected" && !str(body.rejectionReason)) {
      return c.json({ error: "rejected requires rejectionReason so the gap can be fixed" }, 400);
    }

    const now = new Date();
    await db
      .update(schema.a2pRegistrations)
      .set({
        status,
        provider: str(body.provider) ?? row.provider,
        brandId: str(body.brandId) ?? row.brandId,
        campaignId: str(body.campaignId) ?? row.campaignId,
        rejectionReason: str(body.rejectionReason) ?? row.rejectionReason,
        decisionAt: status === "approved" || status === "rejected" ? now : row.decisionAt,
        submittedAt: status === "submitted" ? now : row.submittedAt,
        notes: str(body.notes) ?? row.notes,
        updatedAt: now,
      })
      .where(eq(schema.a2pRegistrations.id, row.id));

    return c.json({
      id: row.id,
      status,
      brandId: str(body.brandId) ?? row.brandId,
      campaignId: str(body.campaignId) ?? row.campaignId,
      recordedBy: "manual entry",
      note: "This app did not talk to a carrier. This status is whatever a human recorded from the provider console.",
    });
  });

export default a2p;
