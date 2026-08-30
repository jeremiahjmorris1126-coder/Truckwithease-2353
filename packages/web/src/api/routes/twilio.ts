import { Hono } from "hono";
import { desc, eq } from "drizzle-orm";
import { promises as dns } from "node:dns";
import { db } from "../database";
import * as schema from "../database/schema";

/**
 * Twilio account setup — server side.
 *
 * Replaces legacy/pages/TwilioSetupPage.jsx, which collected an Account SID and
 * Auth Token in the browser and wrote them to a PocketBase collection that
 * never existed. Secrets never travel through this API: credentials live in
 * `.env` only, and this file reads them server-side.
 *
 * HONESTY RULES:
 *  - Domain verification is decided by Twilio after IT reads your DNS. This app
 *    can only look up the TXT record itself and report what public DNS returns.
 *    `verifiedAt` is set only when a real lookup finds the exact token.
 *  - Nothing here writes to your DNS. Cloudflare is where the record goes for truckwithease.com.
 */

const rid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

type TwilioCreds = { accountSid: string; authToken: string; from: string | null };

export const twilioCreds = (): TwilioCreds | null => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!accountSid || !authToken) return null;
  const raw = process.env.TWILIO_PHONE_NUMBER?.trim() ?? "";
  const digits = raw.replace(/\D/g, "");
  const from = digits ? (raw.startsWith("+") ? raw : `+${digits.length === 10 ? "1" + digits : digits}`) : null;
  return { accountSid, authToken, from };
};

async function twilioGet(creds: TwilioCreds, url: string) {
  const auth = Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString("base64");
  const res = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
  const text = await res.text();
  let body: Record<string, unknown> = {};
  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    body = { raw: text };
  }
  return { ok: res.ok, status: res.status, body };
}

/** Twilio publishes the TXT record at the domain apex by default. Some flows
 *  use a _twilio-verification subdomain, so both are checked and reported. */
const candidateHosts = (domain: string, recordName: string | null) => {
  const d = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim().toLowerCase();
  const hosts = [d];
  if (recordName && recordName !== "@") hosts.unshift(`${recordName.replace(/\.$/, "")}.${d}`.replace(`.${d}.${d}`, `.${d}`));
  hosts.push(`_twilio.${d}`);
  return Array.from(new Set(hosts));
};

async function lookupToken(domain: string, token: string, recordName: string | null) {
  const checked: Array<{ host: string; records: string[]; error?: string }> = [];
  let foundOn: string | null = null;
  for (const host of candidateHosts(domain, recordName)) {
    try {
      const records = (await dns.resolveTxt(host)).map((chunks) => chunks.join(""));
      checked.push({ host, records });
      if (records.some((r) => r.includes(token))) {
        foundOn = host;
        break;
      }
    } catch (e) {
      checked.push({ host, records: [], error: e instanceof Error ? e.message : String(e) });
    }
  }
  return { found: Boolean(foundOn), foundOn, checked };
}

export const twilio = new Hono()

  // ── Credentials / account health ──────────────────────────────────────────
  .get("/", async (c) => {
    const creds = twilioCreds();
    if (!creds) {
      return c.json({
        connected: false,
        accountSid: null,
        reason: "TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are not set in .env.",
        secretsNote: "Credentials live in .env on the server. They are never sent to the browser and cannot be typed into this page.",
      });
    }
    const r = await twilioGet(creds, `https://api.twilio.com/2010-04-01/Accounts/${creds.accountSid}.json`);
    if (!r.ok) {
      return c.json({
        connected: false,
        accountSid: creds.accountSid,
        httpStatus: r.status,
        twilioError: r.body.message ?? null,
        reason: "Twilio rejected the credentials in .env.",
      });
    }
    return c.json({
      connected: true,
      accountSid: creds.accountSid,
      friendlyName: r.body.friendly_name ?? null,
      accountStatus: r.body.status ?? null,
      accountType: r.body.type ?? null,
      fromNumber: creds.from,
      checkedAt: new Date(),
      secretsNote: "Read from .env server-side. This page never receives the auth token.",
    });
  })

  // ── Real phone numbers on the account ─────────────────────────────────────
  .get("/numbers", async (c) => {
    const creds = twilioCreds();
    if (!creds) return c.json({ numbers: [], connected: false, reason: "No Twilio credentials in .env." });
    const r = await twilioGet(
      creds,
      `https://api.twilio.com/2010-04-01/Accounts/${creds.accountSid}/IncomingPhoneNumbers.json?PageSize=50`,
    );
    if (!r.ok) return c.json({ numbers: [], connected: true, httpStatus: r.status, twilioError: r.body.message ?? null }, 502);
    const list = Array.isArray(r.body.incoming_phone_numbers) ? (r.body.incoming_phone_numbers as Record<string, unknown>[]) : [];
    return c.json({
      connected: true,
      count: list.length,
      numbers: list.map((n) => ({
        sid: n.sid,
        phoneNumber: n.phone_number,
        friendlyName: n.friendly_name,
        smsCapable: (n.capabilities as Record<string, unknown> | undefined)?.sms ?? null,
        voiceCapable: (n.capabilities as Record<string, unknown> | undefined)?.voice ?? null,
        smsUrl: n.sms_url ?? null,
      })),
      note:
        list.length === 0
          ? "No numbers on this Twilio account yet. Buy one under Phone Numbers → Manage → Buy a number before you can send anything."
          : "Live from the Twilio API.",
    });
  })

  // ── Domain verification tokens ────────────────────────────────────────────
  .get("/domains", async (c) => {
    const rows = await db
      .select()
      .from(schema.twilioDomainVerifications)
      .orderBy(desc(schema.twilioDomainVerifications.createdAt))
      .limit(50);
    return c.json({
      domains: rows,
      total: rows.length,
      howItWorks:
        "Twilio verifies domain ownership by reading a DNS TXT record. Add the record at your DNS host (Cloudflare), then run the check here. Twilio's own console still has to be clicked to finish — this only proves the record is live in public DNS.",
    });
  })

  .post("/domains", async (c) => {
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const domain = str(body.domain)?.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase() ?? null;
    const token = str(body.token);
    if (!domain) return c.json({ error: "domain is required, e.g. truckwithease.morrishive.com" }, 400);
    if (!token) return c.json({ error: "token is required — the value Twilio gave you" }, 400);
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) return c.json({ error: `"${domain}" is not a valid domain name` }, 400);

    const value = token.startsWith("twilio-domain-verification=") ? token : `twilio-domain-verification=${token}`;
    const now = new Date();
    const row = {
      id: rid("twv"),
      domain,
      token: value,
      recordName: str(body.recordName) ?? "@",
      purpose: str(body.purpose) ?? "link_shortening",
      lastCheckedAt: null,
      lastCheckResult: null,
      verifiedAt: null,
      notes: str(body.notes),
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(schema.twilioDomainVerifications).values(row);
    return c.json(
      {
        verification: row,
        dnsRecord: {
          type: "TXT",
          host: row.recordName,
          value,
          ttl: "1 hour (or Cloudflare's Auto)",
        },
        nextStep:
          "Add that TXT record in Cloudflare → truckwithease.com → DNS → Records (type TXT, proxy status is not applicable to TXT). Then POST /api/twilio/domains/:id/check. DNS can take up to 72 hours to propagate, though Cloudflare is usually seconds.",
      },
      201,
    );
  })

  // ── Real DNS lookup ───────────────────────────────────────────────────────
  .post("/domains/:id/check", async (c) => {
    const [row] = await db
      .select()
      .from(schema.twilioDomainVerifications)
      .where(eq(schema.twilioDomainVerifications.id, c.req.param("id")))
      .limit(1);
    if (!row) return c.json({ error: "Not found" }, 404);

    const bare = row.token.replace(/^twilio-domain-verification=/, "");
    const result = await lookupToken(row.domain, bare, row.recordName);
    const now = new Date();
    await db
      .update(schema.twilioDomainVerifications)
      .set({
        lastCheckedAt: now,
        lastCheckResult: JSON.stringify(result).slice(0, 4000),
        verifiedAt: result.found ? (row.verifiedAt ?? now) : null,
        updatedAt: now,
      })
      .where(eq(schema.twilioDomainVerifications.id, row.id));

    return c.json({
      id: row.id,
      domain: row.domain,
      found: result.found,
      foundOn: result.foundOn,
      hostsChecked: result.checked,
      checkedAt: now,
      meaning: result.found
        ? "The token is live in public DNS. Go to the Twilio console and click Verify — Twilio makes the final call, not this app."
        : "Public DNS does not return this token yet. Either the record is not added, or it has not propagated. Nothing is wrong with the app.",
    });
  })

  .delete("/domains/:id", async (c) => {
    const [row] = await db
      .select()
      .from(schema.twilioDomainVerifications)
      .where(eq(schema.twilioDomainVerifications.id, c.req.param("id")))
      .limit(1);
    if (!row) return c.json({ error: "Not found" }, 404);
    await db.delete(schema.twilioDomainVerifications).where(eq(schema.twilioDomainVerifications.id, row.id));
    return c.json({ deleted: row.id, domain: row.domain });
  });

export default twilio;
