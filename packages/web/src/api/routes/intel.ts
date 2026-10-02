import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { desc } from "drizzle-orm";
import { getKeyOrEnv } from "./vault";

/**
 * APIFreaks intel proxy + broker/shipper verification.
 *
 * Two rules, both deliberate:
 *  1. The APIFreaks key is read from the server-side vault and never reaches
 *     the browser bundle. This is the same class of bug as the two Google Maps
 *     keys compiled into the frontend.
 *  2. When no key is present we return `{ live: false, source: "mock" }` with
 *     clearly-labelled sample data. We never present mock data as live.
 *
 * Endpoint paths and parameter names below were probed live against APIFreaks
 * on 2026-08-24 with the account key and are confirmed working. Auth is the
 * `apiKey` query parameter — the `X-API-Key` header is NOT accepted (every
 * request 400s with "Please provide apiKey").
 *
 * Confirmed:
 *   GET /v1.0/geolocation/lookup?ip=            -> 200
 *   GET /v1.0/geolocation/timezone?ip=          -> 200
 *   GET /v1.0/domain/whois/live?domainName=     -> 200
 *   GET /v1.0/domain/availability?domain=       -> 200
 * The timezone endpoint resolves by IP only; latitude/longitude params are
 * silently ignored (they return the caller's own IP), so we do not pretend to
 * support lat/lng lookups.
 */

const APIFREAKS_BASE = "https://api.apifreaks.com/v1.0";

const ENDPOINTS = {
  ipGeolocation: "/geolocation/lookup",
  whois: "/domain/whois/live",
  timezone: "/geolocation/timezone",
  domainAvailability: "/domain/availability",
} as const;

/** Query parameter each endpoint expects for its subject. Probed live. */
const PARAMS = {
  ip: "ip",
  domainWhois: "domainName",
  domainAvailability: "domain",
} as const;

type Live<T> = { live: boolean; source: "apifreaks" | "mock"; note?: string; data: T };

async function apifreaksKey(): Promise<string | null> {
  return getKeyOrEnv("apifreaks", "APIFREAKS_API_KEY");
}

async function callApiFreaks<T>(
  path: string,
  params: Record<string, string>,
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const key = await apifreaksKey();
  if (!key) return { ok: false, status: 401, error: "no_api_key" };
  const url = new URL(APIFREAKS_BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  // APIFreaks authenticates on the query string only.
  url.searchParams.set("apiKey", key);
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, status: res.status, error: text.slice(0, 400) };
    return { ok: true, data: JSON.parse(text) as T };
  } catch (e) {
    return { ok: false, status: 502, error: e instanceof Error ? e.message : "fetch failed" };
  }
}

// ── Administrative units (ported from legacy/lib/adminUnitsIntel.js) ─────────
// Real HOS/tax facts. These are jurisdiction rules, not vendor data, so they
// are correct offline and stay the fallback even when APIFreaks is connected.
type Unit = {
  code: string;
  name: string;
  salesTax: number;
  fuelTax: number;
  drivingHours: number;
  breakMinutes: number;
  timezone: string;
};

export const ADMIN_UNITS: Record<string, { country: string; units: Unit[] }> = {
  US: {
    country: "United States",
    units: [
      { code: "MO", name: "Missouri", salesTax: 4.225, fuelTax: 0.195, drivingHours: 11, breakMinutes: 30, timezone: "America/Chicago" },
      { code: "IL", name: "Illinois", salesTax: 6.25, fuelTax: 0.454, drivingHours: 11, breakMinutes: 30, timezone: "America/Chicago" },
      { code: "TX", name: "Texas", salesTax: 6.25, fuelTax: 0.2, drivingHours: 11, breakMinutes: 30, timezone: "America/Chicago" },
      { code: "CA", name: "California", salesTax: 7.25, fuelTax: 0.68, drivingHours: 11, breakMinutes: 30, timezone: "America/Los_Angeles" },
      { code: "OK", name: "Oklahoma", salesTax: 4.5, fuelTax: 0.19, drivingHours: 11, breakMinutes: 30, timezone: "America/Chicago" },
      { code: "KS", name: "Kansas", salesTax: 6.5, fuelTax: 0.26, drivingHours: 11, breakMinutes: 30, timezone: "America/Chicago" },
      { code: "AR", name: "Arkansas", salesTax: 6.5, fuelTax: 0.285, drivingHours: 11, breakMinutes: 30, timezone: "America/Chicago" },
      { code: "TN", name: "Tennessee", salesTax: 7.0, fuelTax: 0.27, drivingHours: 11, breakMinutes: 30, timezone: "America/Chicago" },
      { code: "IN", name: "Indiana", salesTax: 7.0, fuelTax: 0.57, drivingHours: 11, breakMinutes: 30, timezone: "America/Indiana/Indianapolis" },
      { code: "OH", name: "Ohio", salesTax: 5.75, fuelTax: 0.47, drivingHours: 11, breakMinutes: 30, timezone: "America/New_York" },
      { code: "PA", name: "Pennsylvania", salesTax: 6.0, fuelTax: 0.741, drivingHours: 11, breakMinutes: 30, timezone: "America/New_York" },
      { code: "NY", name: "New York", salesTax: 4.0, fuelTax: 0.4445, drivingHours: 11, breakMinutes: 30, timezone: "America/New_York" },
      { code: "FL", name: "Florida", salesTax: 6.0, fuelTax: 0.3595, drivingHours: 11, breakMinutes: 30, timezone: "America/New_York" },
      { code: "GA", name: "Georgia", salesTax: 4.0, fuelTax: 0.326, drivingHours: 11, breakMinutes: 30, timezone: "America/New_York" },
      { code: "CO", name: "Colorado", salesTax: 2.9, fuelTax: 0.2225, drivingHours: 11, breakMinutes: 30, timezone: "America/Denver" },
      { code: "AZ", name: "Arizona", salesTax: 5.6, fuelTax: 0.26, drivingHours: 11, breakMinutes: 30, timezone: "America/Phoenix" },
      { code: "WA", name: "Washington", salesTax: 6.5, fuelTax: 0.494, drivingHours: 11, breakMinutes: 30, timezone: "America/Los_Angeles" },
    ],
  },
  CA: {
    country: "Canada",
    // Canadian federal HOS: 13 hours driving, 30-minute break not federally required.
    units: [
      { code: "ON", name: "Ontario", salesTax: 13.0, fuelTax: 0.143, drivingHours: 13, breakMinutes: 0, timezone: "America/Toronto" },
      { code: "QC", name: "Quebec", salesTax: 14.975, fuelTax: 0.192, drivingHours: 13, breakMinutes: 0, timezone: "America/Montreal" },
      { code: "AB", name: "Alberta", salesTax: 5.0, fuelTax: 0.13, drivingHours: 13, breakMinutes: 0, timezone: "America/Edmonton" },
      { code: "BC", name: "British Columbia", salesTax: 12.0, fuelTax: 0.225, drivingHours: 13, breakMinutes: 0, timezone: "America/Vancouver" },
      { code: "MB", name: "Manitoba", salesTax: 12.0, fuelTax: 0.14, drivingHours: 13, breakMinutes: 0, timezone: "America/Winnipeg" },
    ],
  },
  MX: {
    country: "Mexico",
    units: [
      { code: "NLE", name: "Nuevo Leon", salesTax: 16.0, fuelTax: 0.28, drivingHours: 14, breakMinutes: 30, timezone: "America/Monterrey" },
      { code: "CHH", name: "Chihuahua", salesTax: 16.0, fuelTax: 0.28, drivingHours: 14, breakMinutes: 30, timezone: "America/Chihuahua" },
      { code: "TAM", name: "Tamaulipas", salesTax: 16.0, fuelTax: 0.28, drivingHours: 14, breakMinutes: 30, timezone: "America/Matamoros" },
    ],
  },
};

// ── Broker verification ─────────────────────────────────────────────────────
const FREE_MAIL = new Set([
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com",
  "icloud.com", "protonmail.com", "mail.com", "gmx.com", "yandex.com",
]);

const DISPOSABLE = new Set([
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
  "throwawaymail.com", "yopmail.com", "sharklasers.com", "trashmail.com",
]);

type Verdict = "verified" | "caution" | "unverified" | "high_risk";

type BrokerCheck = {
  email: string | null;
  domain: string | null;
  ip: string | null;
  mcNumber: string | null;
  organization: string | null;
  registrar: string | null;
  country: string | null;
  region: string | null;
  domainAgeDays: number | null;
  hostingType: string;
  riskScore: number;
  verdict: Verdict;
  reasons: string[];
  source: "apifreaks" | "heuristic";
  live: boolean;
};

function verdictFor(score: number): Verdict {
  if (score >= 70) return "high_risk";
  if (score >= 40) return "caution";
  if (score >= 20) return "unverified";
  return "verified";
}

/** MC numbers are 5–8 digits. Format check only — this is not an FMCSA lookup. */
function mcLooksValid(mc: string | null): boolean {
  if (!mc) return false;
  return /^\d{5,8}$/.test(mc.replace(/^MC[-\s]*/i, "").trim());
}

async function runBrokerCheck(input: {
  email?: string;
  ip?: string;
  mcNumber?: string;
}): Promise<BrokerCheck> {
  const email = input.email?.trim().toLowerCase() || null;
  const domain = email?.includes("@") ? email.split("@")[1] : null;
  const ip = input.ip?.trim() || null;
  const mcNumber = input.mcNumber?.trim() || null;

  const reasons: string[] = [];
  let score = 0;
  let source: "apifreaks" | "heuristic" = "heuristic";
  let organization: string | null = null;
  let registrar: string | null = null;
  let country: string | null = null;
  let region: string | null = null;
  let domainAgeDays: number | null = null;
  let hostingType = "unknown";

  // --- WHOIS on the email domain -------------------------------------------
  if (domain) {
    if (DISPOSABLE.has(domain)) {
      score += 60;
      reasons.push(`${domain} is a disposable email provider — no legitimate broker uses one.`);
    } else if (FREE_MAIL.has(domain)) {
      score += 30;
      reasons.push(
        `${domain} is free consumer email, not a company domain. Common in double-brokering and load-phishing.`,
      );
    } else {
      const whois = await callApiFreaks<Record<string, unknown>>(ENDPOINTS.whois, { [PARAMS.domainWhois]: domain });
      if (whois.ok) {
        source = "apifreaks";
        const d = whois.data as Record<string, any>;
        registrar = d.registrar?.name ?? d.registrar ?? null;
        organization = d.registrant?.organization ?? d.registrant_name ?? null;
        country = d.registrant?.country ?? null;
        const created = d.created_date ?? d.creation_date ?? d.createdDate;
        if (created) {
          const ms = Date.now() - new Date(created).getTime();
          domainAgeDays = Math.max(0, Math.round(ms / 86_400_000));
        }
      }
      if (domainAgeDays !== null) {
        if (domainAgeDays < 90) {
          score += 45;
          reasons.push(`Domain is only ${domainAgeDays} days old. Fresh domains are the #1 double-brokering tell.`);
        } else if (domainAgeDays < 365) {
          score += 20;
          reasons.push(`Domain is under a year old (${domainAgeDays} days).`);
        } else {
          reasons.push(`Domain registered ${Math.round(domainAgeDays / 365)}+ years ago.`);
        }
      } else {
        score += 15;
        reasons.push("Domain age unknown — WHOIS data not available (no APIFreaks key connected).");
      }
    }
  } else {
    score += 20;
    reasons.push("No broker email supplied, so the domain could not be checked.");
  }

  // --- IP intel -------------------------------------------------------------
  if (ip) {
    const geo = await callApiFreaks<Record<string, any>>(ENDPOINTS.ipGeolocation, { [PARAMS.ip]: ip });
    if (geo.ok) {
      source = "apifreaks";
      const d = geo.data;
      country = d.country?.code ?? d.country_code ?? country;
      region = d.region?.name ?? d.region ?? region;
      organization = organization ?? d.connection?.organization ?? d.isp ?? null;
      const sec = d.security ?? {};
      if (sec.is_vpn || sec.is_proxy || sec.is_tor) {
        hostingType = "vpn";
        score += 35;
        reasons.push("Broker IP is behind a VPN, proxy or Tor. Legitimate broker offices are not.");
      } else if (sec.is_hosting || d.connection?.type === "hosting") {
        hostingType = "hosting";
        score += 20;
        reasons.push("Broker IP belongs to a hosting/datacenter range, not a business ISP.");
      } else {
        hostingType = d.connection?.type ?? "business";
      }
      if (country && country !== "US" && country !== "CA" && country !== "MX") {
        score += 30;
        reasons.push(`IP geolocates to ${country} — outside North American freight authority.`);
      }
    } else {
      score += 10;
      reasons.push("IP could not be checked — no APIFreaks key connected.");
    }
  }

  // --- MC number ------------------------------------------------------------
  if (mcNumber) {
    if (mcLooksValid(mcNumber)) {
      reasons.push(`MC ${mcNumber} is a valid format. Format only — this is not an FMCSA authority lookup.`);
    } else {
      score += 25;
      reasons.push(`"${mcNumber}" is not a valid MC number format (expects 5–8 digits).`);
    }
  } else {
    score += 15;
    reasons.push("No MC number supplied. Never move freight for a broker who won't give one.");
  }

  score = Math.min(100, score);
  return {
    email,
    domain,
    ip,
    mcNumber,
    organization,
    registrar,
    country,
    region,
    domainAgeDays,
    hostingType,
    riskScore: score,
    verdict: verdictFor(score),
    reasons,
    source,
    live: source === "apifreaks",
  };
}

export const intel = new Hono()
  /** Which providers are actually live. */
  .get("/status", async (c) => {
    const key = await apifreaksKey();
    return c.json(
      {
        provider: "APIFreaks",
        connected: Boolean(key),
        keySource: key ? "vault_or_env" : null,
        auth: "apiKey query parameter (the X-API-Key header is rejected by APIFreaks)",
        endpoints: Object.entries(ENDPOINTS).map(([name, path]) => ({
          name,
          path,
          verifiedLive: "2026-08-24",
        })),
        note: key
          ? "Key present. All four endpoint paths were probed live against APIFreaks and returned 200."
          : "No APIFreaks key stored. Add one at POST /api/vault with service=apifreaks. Until then intel endpoints return labelled sample data, never fake live data.",
      },
      200,
    );
  })

  .get("/admin-units", (c) => {
    const country = (c.req.query("country") || "US").toUpperCase();
    const entry = ADMIN_UNITS[country];
    if (!entry) return c.json({ error: "unsupported_country", supported: Object.keys(ADMIN_UNITS) }, 404);
    return c.json({ live: true, source: "internal", ...entry }, 200);
  })

  .get("/admin-units/:country/:code", (c) => {
    const country = c.req.param("country").toUpperCase();
    const code = c.req.param("code").toUpperCase();
    const unit = ADMIN_UNITS[country]?.units.find((u) => u.code === code);
    if (!unit) return c.json({ error: "not_found" }, 404);
    return c.json({ live: true, source: "internal", unit }, 200);
  })

  .get("/ip/:ip", async (c) => {
    const ip = c.req.param("ip");
    const r = await callApiFreaks<Record<string, unknown>>(ENDPOINTS.ipGeolocation, { [PARAMS.ip]: ip });
    if (r.ok) return c.json({ live: true, source: "apifreaks", data: r.data } satisfies Live<unknown>, 200);
    return c.json(
      {
        live: false,
        source: "mock",
        note:
          r.error === "no_api_key"
            ? "No APIFreaks key in the vault. This is sample shape, not real data."
            : `APIFreaks call failed (${r.status}): ${r.error}`,
        data: { ip, country: null, region: null, city: null, connection: null, security: null },
      },
      200,
    );
  })

  .get("/whois/:domain", async (c) => {
    const domain = c.req.param("domain");
    const r = await callApiFreaks<Record<string, unknown>>(ENDPOINTS.whois, { [PARAMS.domainWhois]: domain });
    if (r.ok) return c.json({ live: true, source: "apifreaks", data: r.data }, 200);
    return c.json(
      {
        live: false,
        source: "mock",
        note:
          r.error === "no_api_key"
            ? "No APIFreaks key in the vault. This is sample shape, not real data."
            : `APIFreaks call failed (${r.status}): ${r.error}`,
        data: { domain, registrar: null, created_date: null, registrant: null },
      },
      200,
    );
  })

  /**
   * Timezone lookup. APIFreaks resolves timezone by IP only — latitude and
   * longitude parameters are accepted by the URL but silently ignored, and the
   * response comes back for the *caller's* IP. Rather than return a Los
   * Angeles timezone for a Missouri lat/lng, lat/lng is refused outright.
   */
  .get("/timezone", async (c) => {
    const ip = c.req.query("ip");
    if (!ip) {
      const lat = c.req.query("lat");
      const lng = c.req.query("lng");
      return c.json(
        {
          error: "ip_required",
          note:
            lat && lng
              ? "APIFreaks resolves timezone by IP address only; it ignores latitude/longitude and would return the server's own timezone. Refusing rather than returning a wrong zone. Pass ?ip= instead."
              : "Pass ?ip=<address>.",
        },
        400,
      );
    }
    const r = await callApiFreaks<Record<string, unknown>>(ENDPOINTS.timezone, { [PARAMS.ip]: ip });
    if (r.ok) return c.json({ live: true, source: "apifreaks", data: r.data }, 200);
    return c.json(
      {
        live: false,
        source: "mock",
        note: r.error === "no_api_key" ? "No APIFreaks key in the vault." : `APIFreaks call failed (${r.status})`,
        data: { ip, timezone: null },
      },
      200,
    );
  })

  /** Domain availability — used when vetting a broker's claimed website. */
  .get("/domain-availability/:domain", async (c) => {
    const domain = c.req.param("domain");
    const r = await callApiFreaks<Record<string, unknown>>(ENDPOINTS.domainAvailability, {
      [PARAMS.domainAvailability]: domain,
    });
    if (r.ok) return c.json({ live: true, source: "apifreaks", data: r.data }, 200);
    return c.json(
      {
        live: false,
        source: "mock",
        note: r.error === "no_api_key" ? "No APIFreaks key in the vault." : `APIFreaks call failed (${r.status})`,
        data: { domain, domainAvailability: null },
      },
      200,
    );
  })

  // ── Broker verification ───────────────────────────────────────────────────
  .post("/broker/verify", async (c) => {
    const body = await c.req.json<{ email?: string; ip?: string; mcNumber?: string; loadId?: string }>();
    if (!body.email && !body.ip && !body.mcNumber) {
      return c.json({ error: "supply at least one of email, ip, mcNumber" }, 400);
    }
    const result = await runBrokerCheck(body);
    const id = crypto.randomUUID();
    await db.insert(schema.brokerVerifications).values({
      id,
      email: result.email,
      domain: result.domain,
      ip: result.ip,
      mcNumber: result.mcNumber,
      organization: result.organization,
      registrar: result.registrar,
      country: result.country,
      region: result.region,
      domainAgeDays: result.domainAgeDays,
      hostingType: result.hostingType,
      riskScore: result.riskScore,
      verdict: result.verdict,
      reasons: JSON.stringify(result.reasons),
      source: result.source,
      raw: null,
      checkedAt: new Date(),
    });
    return c.json(
      {
        id,
        ...result,
        safeToSend: result.riskScore < 40,
        recommendation:
          result.riskScore >= 70
            ? "block — do not send arrival details or paperwork"
            : result.riskScore >= 40
              ? "verify by phone against the FMCSA SAFER record before sending anything"
              : "proceed, but keep the rate confirmation on file",
      },
      200,
    );
  })

  /**
   * Checkout fraud screening. Replaces legacy/lib/checkoutFraudScreening.js,
   * whose "WHOIS lookup" was `ASN-${Math.floor(Math.random() * 65535)}` and
   * whose VPN detection was a 3-entry hardcoded list containing Cloudflare
   * and Google DNS — neither of which a customer pays from.
   *
   * Everything scored here is observed: the IP intel comes from APIFreaks when
   * a key is connected, and when it is not we say so and score conservatively
   * instead of inventing an organization name.
   */
  .post("/checkout/screen", async (c) => {
    const body = await c.req.json().catch(() => ({}) as Record<string, unknown>);
    const ipAddress =
      (body.ipAddress as string) ||
      c.req.header("x-forwarded-for")?.split(",")[0].trim() ||
      null;
    const paymentMethod = (body.paymentMethod as string) || "card";
    const amount = typeof body.amount === "number" ? body.amount : null;
    const transactionId = (body.transactionId as string) || null;
    const email = (body.email as string) || undefined;

    const factors: { type: string; message: string; measured: boolean }[] = [];
    let score = 0;
    let source: "apifreaks" | "heuristic" = "heuristic";
    let organization: string | null = null;
    let country: string | null = null;
    let hostingType = "unknown";

    if (!ipAddress) {
      score += 20;
      factors.push({
        type: "ip_missing",
        message: "No client IP was supplied, so nothing about the payment origin could be checked.",
        measured: false,
      });
    } else {
      const geo = await callApiFreaks<Record<string, any>>(ENDPOINTS.ipGeolocation, {
        [PARAMS.ip]: ipAddress,
      });
      if (geo.ok) {
        source = "apifreaks";
        const d = geo.data;
        organization = d.connection?.organization ?? d.isp ?? null;
        country = d.country?.code ?? d.country_code ?? null;
        const sec = d.security ?? {};
        if (sec.is_tor) {
          hostingType = "tor";
          score += 45;
          factors.push({ type: "tor", message: "Payment is coming through the Tor network.", measured: true });
        } else if (sec.is_vpn || sec.is_proxy) {
          hostingType = "vpn";
          score += 30;
          factors.push({ type: "vpn", message: "Payment IP is behind a VPN or proxy.", measured: true });
        } else if (sec.is_hosting || d.connection?.type === "hosting") {
          hostingType = "hosting";
          score += 25;
          factors.push({
            type: "datacenter",
            message: "Payment IP belongs to a datacenter range, not a consumer or business ISP.",
            measured: true,
          });
        } else {
          hostingType = d.connection?.type ?? "consumer";
        }
        if (country && country !== "US" && country !== "CA" && country !== "MX") {
          score += 25;
          factors.push({
            type: "geography",
            message: `Payment IP geolocates to ${country}, outside the service area.`,
            measured: true,
          });
        }
      } else {
        score += 15;
        factors.push({
          type: "ip_uncheckable",
          message:
            "IP could not be checked — no APIFreaks key is connected, so VPN/datacenter detection is unavailable.",
          measured: false,
        });
      }
    }

    if (paymentMethod === "prepaid-card") {
      score += 15;
      factors.push({
        type: "payment_method",
        message: "Prepaid card. Not fraud on its own, but it cannot be charged back to a named account.",
        measured: true,
      });
    }

    if (email) {
      const domain = email.includes("@") ? email.split("@")[1].toLowerCase() : null;
      if (domain && DISPOSABLE.has(domain)) {
        score += 40;
        factors.push({
          type: "disposable_email",
          message: `${domain} is a disposable email provider.`,
          measured: true,
        });
      }
    }

    score = Math.min(100, score);
    const riskLevel = score >= 70 ? "critical" : score >= 50 ? "high" : score >= 30 ? "elevated" : "low";
    const recommendation = score >= 70 ? "block" : score >= 50 ? "verify" : "allow";

    const id = crypto.randomUUID();
    await db.insert(schema.checkoutScreenings).values({
      id,
      transactionId,
      ipAddress,
      amount,
      paymentMethod,
      riskScore: score,
      riskLevel,
      recommendation,
      requiresVerification: recommendation !== "allow",
      riskFactors: JSON.stringify(factors),
      source,
      live: source === "apifreaks",
      actionTaken: recommendation === "block" ? "blocked" : recommendation === "verify" ? "flagged" : "approved",
      createdAt: new Date(),
    });

    return c.json(
      {
        id,
        ipAddress,
        organization,
        country,
        hostingType,
        riskScore: score,
        riskLevel,
        recommendation,
        requiresVerification: recommendation !== "allow",
        riskFactors: factors,
        source,
        live: source === "apifreaks",
        methodology:
          "Score is additive from observed signals only: Tor +45, VPN/proxy +30, datacenter +25, outside US/CA/MX +25, no client IP +20, prepaid card +15, IP uncheckable +15, disposable email +40. Capped at 100. block >=70, verify >=50, allow below.",
        limitation: !ipAddress || source === "heuristic"
          ? "No live IP intel provider is connected, so VPN, proxy and datacenter detection are not running. This score reflects only what could be checked."
          : null,
      },
      200,
    );
  })

  .get("/checkout/history", async (c) => {
    const rows = await db
      .select()
      .from(schema.checkoutScreenings)
      .orderBy(desc(schema.checkoutScreenings.createdAt))
      .limit(100);
    return c.json(
      { screenings: rows.map((r) => ({ ...r, riskFactors: r.riskFactors ? JSON.parse(r.riskFactors) : [] })) },
      200,
    );
  })

  .get("/broker/history", async (c) => {
    const rows = await db
      .select()
      .from(schema.brokerVerifications)
      .orderBy(desc(schema.brokerVerifications.checkedAt))
      .limit(100);
    return c.json(
      {
        checks: rows.map((r) => ({ ...r, reasons: r.reasons ? JSON.parse(r.reasons) : [] })),
      },
      200,
    );
  });
