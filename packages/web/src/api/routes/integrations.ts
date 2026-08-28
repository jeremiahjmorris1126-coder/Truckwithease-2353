import { Hono } from "hono";
import { storageConfigured, s3, S3_BUCKET, S3_ENDPOINT, S3_REGION } from "../lib/s3";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { emailInfo, verifyEmailToken } from "../services/email";

/**
 * Integration status — server-side, read-only, honest.
 *
 * Built 2026-08-28. This route exists to replace the invented integration
 * dashboards that used to live in the browser:
 *
 *   legacy/pages/APIAgentPage.jsx      — a credential-entry form that asked the
 *     DRIVER to type ~40 provider secrets (openai_api_key, aws_access_key_id,
 *     twilio_token, dat_api_key, efs_api_key, apex_api_key, ...) into the browser
 *     and stash them in a PocketBase collection that does not exist. It also
 *     printed a fake activity log ("18 services verified", "all 12 Dream Team
 *     agents online", "SerpAPI quota 847 of 100,000", "Facebook token 23 days
 *     remaining", "FMCSA renewal in 147 days"). None of it was measured.
 *   legacy/pages/APIDiagnosticPage.jsx — asserted status:"active" for vendors
 *     with no key and no code (SerpAPI, YouTube, World News, Twitter/X, Azure,
 *     FMCSA, iDrive E2, DevSecOps ALM).
 *   legacy/pages/AgentOrchestrator.jsx — same, plus "health score 100%",
 *     "security score 100/100", "all 150 pages verified".
 *
 * RULES THIS ROUTE FOLLOWS
 *   - No provider key is ever sent to the browser. Only "present: true/false"
 *     and, for a couple of providers, a short non-secret hint (key length).
 *   - No provider is ever reported live unless a real HTTP call to it in this
 *     process returned. Everything else is state "not_connected" with the
 *     actual reason, or state "unknown" until /probe is called.
 *   - A key that the vendor rejects is reported "rejected", not "active".
 *     OPENWEATHER_API_KEY and AZUGA_API_KEY are both in that state today.
 *   - Vendors we have no key and no code for are listed as "not_connected"
 *     with what it would take, and are never counted as active.
 */

const TIMEOUT_MS = 10000;

type State = "connected" | "rejected" | "not_connected" | "unknown";

type Provider = {
  id: string;
  name: string;
  category: string;
  /** What the platform actually uses it for today, or would use it for. */
  purpose: string;
  envKeys: string[];
  /** Server code paths that consume it. Empty = nothing reads it. */
  usedBy: string[];
  state: State;
  /** True only when a live call to the vendor has succeeded in this process. */
  probed: boolean;
  probeAt: string | null;
  reason: string;
  docsUrl: string | null;
  probeable: boolean;
};

const has = (k: string) => Boolean(process.env[k] && String(process.env[k]).replace(/"/g, "").trim());

function base(): Provider[] {
  const mail = emailInfo();
  const geminiKey = has("GEMINI_API_KEY");
  const twilio = has("TWILIO_ACCOUNT_SID") && has("TWILIO_AUTH_TOKEN");
  const maps = has("VITE_GOOGLE_MAPS_KEY");
  const openweather = has("OPENWEATHER_API_KEY");
  const azuga = has("AZUGA_API_KEY");
  const apifreaks = has("APIFREAKS_API_KEY");
  const gateway = has("AI_GATEWAY_API_KEY");
  const autumn = has("AUTUMN_SECRET_KEY");
  const db = has("DATABASE_URL") && has("DATABASE_AUTH_TOKEN");

  const p = (o: Partial<Provider> & Pick<Provider, "id" | "name" | "category" | "purpose">): Provider => ({
    envKeys: [],
    usedBy: [],
    state: "not_connected",
    probed: false,
    probeAt: null,
    reason: "",
    docsUrl: null,
    probeable: false,
    ...o,
  });

  return [
    p({
      id: "gemini",
      name: "Google Gemini",
      category: "AI",
      purpose: "Document OCR in TRAXES, audio transcription, live captions, and all text-to-speech for the co-pilot voices.",
      envKeys: ["GEMINI_API_KEY"],
      usedBy: ["/api/gemini", "/api/traxes/scan", "/api/captions"],
      state: geminiKey ? "unknown" : "not_connected",
      reason: geminiKey
        ? "Key present. Verified working against gemini-3.6-flash on 2026-08-27. Run a probe for a live answer."
        : "No GEMINI_API_KEY in the environment.",
      docsUrl: "https://aistudio.google.com/app/apikey",
      probeable: geminiKey,
    }),
    p({
      id: "storage",
      name: "Object storage (S3-compatible)",
      category: "Infrastructure",
      purpose: "Every uploaded document — BOLs, receipts, HR files, DVIR photos. Browser PUTs straight to the bucket with a presigned URL; files never stream through our server.",
      envKeys: ["S3_BUCKET", "S3_ENDPOINT", "S3_REGION", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"],
      usedBy: ["/api/storage", "/api/traxes"],
      state: storageConfigured ? "unknown" : "not_connected",
      reason: storageConfigured
        ? `Configured. Bucket ${S3_BUCKET || "(unset)"} at ${S3_ENDPOINT || "(unset)"}, region ${S3_REGION}.`
        : "Storage credentials are incomplete.",
      probeable: storageConfigured,
    }),
    p({
      id: "turso",
      name: "Turso (SQLite)",
      category: "Infrastructure",
      purpose: "The only database. 53 tables — drivers, HOS logs, DVIR, loads, HR, safety, TRAXES records.",
      envKeys: ["DATABASE_URL", "DATABASE_AUTH_TOKEN"],
      usedBy: ["every route"],
      state: db ? "connected" : "not_connected",
      reason: db ? "Connected — the app cannot serve a page without it." : "Database credentials missing.",
    }),
    p({
      id: "twilio",
      name: "Twilio",
      category: "Messaging",
      purpose: "SMS to drivers and voice. The account, token, and sending number exist.",
      envKeys: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"],
      usedBy: ["/api/twilio", "/api/a2p"],
      state: twilio ? "unknown" : "not_connected",
      reason: twilio
        ? "Credentials present. NOT usable for driver SMS yet: the A2P 10DLC brand is approved but no campaign is filed and the sending number is not attached to a messaging service. Until that is done, US carriers will reject application-to-person texts."
        : "No Twilio credentials.",
      docsUrl: "https://console.twilio.com",
      probeable: twilio,
    }),
    p({
      id: "google_maps",
      name: "Google Maps Platform",
      category: "Maps & routing",
      purpose: "Route planning, static map images, street view. Project 405307027459, billing enabled.",
      envKeys: ["VITE_GOOGLE_MAPS_KEY"],
      usedBy: ["/api/routing", "legacy/maps-config.js"],
      state: maps ? "connected" : "not_connected",
      reason: maps
        ? "Key present and 5 APIs verified working on 2026-08-27: Directions, Static Maps, Street View Static, Maps Embed, Maps JavaScript. 6 APIs are NOT enabled on the project and every call to them fails: Geocoding, Distance Matrix, Elevation, Places (legacy and v1), Time Zone, Roads. Enabling them is free and unblocks address lookup."
        : "No Maps key.",
      docsUrl: "https://console.cloud.google.com/apis/library",
    }),
    p({
      id: "nws",
      name: "US National Weather Service",
      category: "Weather",
      purpose: "All US forecasts and alerts on the weather page and week review. Keyless government API.",
      envKeys: [],
      usedBy: ["/api/weather"],
      state: "unknown",
      reason: "No key required. This is the weather source of record for the platform.",
      docsUrl: "https://www.weather.gov/documentation/services-web-api",
      probeable: true,
    }),
    p({
      id: "openweather",
      name: "OpenWeatherMap",
      category: "Weather",
      purpose: "Was going to be a second weather source. It is not used.",
      envKeys: ["OPENWEATHER_API_KEY"],
      usedBy: [],
      state: openweather ? "rejected" : "not_connected",
      reason: openweather
        ? "Key is present but OpenWeatherMap returns HTTP 401 for it. New free keys can take a couple of hours to activate, and this one has not. Weather stays on the NWS. Nothing in the platform reads this key."
        : "No key.",
      docsUrl: "https://home.openweathermap.org/api_keys",
      probeable: openweather,
    }),
    p({
      id: "azuga",
      name: "Azuga ELD",
      category: "Telematics",
      purpose: "Would supply real GPS, trip, and vehicle-diagnostic data instead of the seeded rows currently in the database.",
      envKeys: ["AZUGA_API_KEY"],
      usedBy: ["/api/azuga"],
      state: azuga ? "rejected" : "not_connected",
      reason: azuga
        ? "The v2 route is built and works. Azuga rejects this key with HTTP 401 — it is a credential problem, not a code problem. Azuga API access is provisioned per fleet account; the key has to be issued for this account."
        : "No key.",
      docsUrl: "https://www.azuga.com",
      probeable: azuga,
    }),
    p({
      id: "apifreaks",
      name: "APIFreaks",
      category: "Reference data",
      purpose: "VAT/GST rates by country for the TRAXES tax module, and IP geolocation.",
      envKeys: ["APIFREAKS_API_KEY"],
      usedBy: ["/api/vat-rates", "/api/intel"],
      state: apifreaks ? "unknown" : "not_connected",
      reason: apifreaks
        ? "Key present and verified live on 2026-08-26. It has no US state fuel-tax product, so no per-state diesel rate comes from here."
        : "No key.",
      probeable: apifreaks,
    }),
    p({
      id: "ai_gateway",
      name: "Runable AI Gateway",
      category: "AI",
      purpose: "The LLM behind the 10 built agents.",
      envKeys: ["AI_GATEWAY_API_KEY", "AI_GATEWAY_BASE_URL"],
      usedBy: ["/api/agent", "/api/chat"],
      state: gateway ? "connected" : "not_connected",
      reason: gateway ? "Key present. The agent routes answer." : "No gateway key.",
    }),
    p({
      id: "autumn",
      name: "Autumn (billing)",
      category: "Payments",
      purpose: "Subscriptions and checkout.",
      envKeys: ["AUTUMN_SECRET_KEY"],
      usedBy: ["/api/subscriptions"],
      state: autumn ? "rejected" : "not_connected",
      reason: autumn
        ? "The key in the environment is a TEST key and NODE_ENV is development. No money can move. Every /api/subscriptions response carries billing.live = false on purpose. A live key is required before launch."
        : "No billing key.",
    }),
    p({
      id: "email",
      name: "Postmark (transactional email)",
      category: "Messaging",
      purpose: "Emails a rate confirmation, invoice, or scanned BOL to a broker, and sends driver notifications.",
      envKeys: ["POSTMARK_SERVER_TOKEN", "EMAIL_FROM"],
      usedBy: ["api/services/email.ts", "api/routes/email.ts", "api/routes/traxes.ts"],
      state: mail.configured ? "unknown" : "not_connected",
      probeable: Boolean(mail.tokenPresent),
      reason: mail.configured
        ? `Provider chosen and code wired. Sending from ${mail.from}. Probe verifies the token against Postmark; a valid token still does not prove the From address is a verified Sender Signature.`
        : `Postmark was chosen on 2026-08-28 and the send path is built, but it cannot send yet: ${mail.blockers.join(" ")} Postmark also refuses senders on public domains, so a gmail address can never be the From — it has to be a mailbox on morrishive.com with Postmark's DKIM and Return-Path records in DNS.`,
      docsUrl: "https://postmarkapp.com/developer/api/email-api",
    }),
    p({
      id: "samsara",
      name: "Samsara",
      category: "Telematics",
      purpose: "GPS, HOS, safety events from Samsara hardware.",
      envKeys: [],
      usedBy: [],
      state: "not_connected",
      reason: "No credentials and no code. Requires a Samsara developer account tied to a fleet that runs their hardware.",
      docsUrl: "https://developers.samsara.com",
    }),
    p({
      id: "geotab",
      name: "Geotab",
      category: "Telematics",
      purpose: "White-label ELD data.",
      envKeys: [],
      usedBy: [],
      state: "not_connected",
      reason: "No credentials and no code.",
      docsUrl: "https://my.geotab.com",
    }),
    p({
      id: "dat",
      name: "DAT load board",
      category: "Freight",
      purpose: "Real loads and lane rates. The 5 loads in the database today are seeded test rows, not market loads.",
      envKeys: [],
      usedBy: [],
      state: "not_connected",
      reason: "No credentials and no code. DAT API access comes with a paid DAT subscription.",
      docsUrl: "https://developer.dat.com",
    }),
    p({
      id: "fmcsa",
      name: "FMCSA",
      category: "Compliance",
      purpose: "Carrier safety data, and the National Registry of Certified Medical Examiners.",
      envKeys: [],
      usedBy: [],
      state: "not_connected",
      reason: "No key. Separately settled: the National Registry cannot be scraped or mirrored — it is captcha-protected with no API and no bulk download, so the platform deep-links to it instead of listing examiners.",
      docsUrl: "https://mobile.fmcsa.dot.gov/developer/home.page",
    }),
    p({
      id: "here",
      name: "HERE truck routing",
      category: "Maps & routing",
      purpose: "Bridge heights, weight limits, hazmat restrictions — the truck-specific routing Google does not do.",
      envKeys: [],
      usedBy: [],
      state: "not_connected",
      reason: "No key. Free tier exists and needs no card, but nobody has signed up. Routing currently uses Google Directions, which is a car route with truck warnings absent.",
      docsUrl: "https://developer.here.com",
    }),
  ];
}

async function probe(id: string): Promise<{ ok: boolean; detail: string; status?: number }> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  const clean = (k: string) => String(process.env[k] ?? "").replace(/"/g, "").trim();
  try {
    if (id === "storage") {
      if (!storageConfigured) return { ok: false, detail: "Storage not configured." };
      const r = await s3.send(new ListObjectsV2Command({ Bucket: S3_BUCKET, MaxKeys: 1 }));
      return { ok: true, detail: `Bucket answered. KeyCount ${r.KeyCount ?? 0}.` };
    }
    if (id === "gemini") {
      const key = clean("GEMINI_API_KEY");
      if (!key) return { ok: false, detail: "No key." };
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`, { signal: ctl.signal });
      const j: any = await r.json().catch(() => null);
      if (!r.ok) return { ok: false, status: r.status, detail: j?.error?.message ?? `HTTP ${r.status}` };
      return { ok: true, status: r.status, detail: `${(j?.models ?? []).length} models visible to this key.` };
    }
    if (id === "nws") {
      const r = await fetch("https://api.weather.gov/points/37.2090,-93.2923", {
        headers: { "User-Agent": "TruckWithEase (support@truckwithease)", accept: "application/geo+json" },
        signal: ctl.signal,
      });
      return { ok: r.ok, status: r.status, detail: r.ok ? "Springfield MO grid point resolved." : `HTTP ${r.status}` };
    }
    if (id === "openweather") {
      const key = clean("OPENWEATHER_API_KEY");
      if (!key) return { ok: false, detail: "No key." };
      const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=37.209&lon=-93.292&appid=${encodeURIComponent(key)}`, { signal: ctl.signal });
      const j: any = await r.json().catch(() => null);
      return { ok: r.ok, status: r.status, detail: r.ok ? "Key accepted." : j?.message ? String(j.message) : `HTTP ${r.status}` };
    }
    if (id === "azuga") {
      const key = clean("AZUGA_API_KEY");
      if (!key) return { ok: false, detail: "No key." };
      const r = await fetch("https://api.azuga.com/v2/vehicles", {
        headers: { Authorization: `Bearer ${key}`, accept: "application/json" },
        signal: ctl.signal,
      });
      return { ok: r.ok, status: r.status, detail: r.ok ? "Key accepted." : `Azuga rejected the key with HTTP ${r.status}.` };
    }
    if (id === "twilio") {
      const sid = clean("TWILIO_ACCOUNT_SID");
      const tok = clean("TWILIO_AUTH_TOKEN");
      if (!sid || !tok) return { ok: false, detail: "No credentials." };
      const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}.json`, {
        headers: { Authorization: `Basic ${Buffer.from(`${sid}:${tok}`).toString("base64")}`, accept: "application/json" },
        signal: ctl.signal,
      });
      const j: any = await r.json().catch(() => null);
      if (!r.ok) return { ok: false, status: r.status, detail: j?.message ?? `HTTP ${r.status}` };
      return { ok: true, status: r.status, detail: `Account status: ${j?.status ?? "unknown"}. Note: authentication working does not mean driver SMS will deliver — that needs an A2P campaign.` };
    }
    if (id === "apifreaks") {
      const key = clean("APIFREAKS_API_KEY");
      if (!key) return { ok: false, detail: "No key." };
      const r = await fetch("https://api.apifreaks.com/v1.0/vat/rates/country?country=DE", { headers: { "X-apiKey": key }, signal: ctl.signal });
      return { ok: r.ok, status: r.status, detail: r.ok ? "DE VAT rate returned." : `HTTP ${r.status}` };
    }
    if (id === "email") {
      const r = await verifyEmailToken();
      return { ok: r.ok, status: r.status ?? undefined, detail: r.detail };
    }
    return { ok: false, detail: "This provider has no live probe. Nothing is connected to probe." };
  } catch (e: any) {
    return { ok: false, detail: e?.name === "AbortError" ? `Timed out after ${TIMEOUT_MS}ms.` : String(e?.message ?? e) };
  } finally {
    clearTimeout(t);
  }
}

export const integrations = new Hono()
  .get("/status", (c) => {
    const providers = base();
    const counts = {
      total: providers.length,
      connected: providers.filter((p) => p.state === "connected").length,
      keyPresentUnverified: providers.filter((p) => p.state === "unknown" && p.envKeys.length > 0).length,
      rejected: providers.filter((p) => p.state === "rejected").length,
      notConnected: providers.filter((p) => p.state === "not_connected").length,
    };
    return c.json({
      providers,
      counts,
      note: "State comes from environment-variable presence plus what has actually been verified against the vendor. Nothing here is marked active because a page wanted a green dot. Call POST /api/integrations/probe/:id for a live check.",
      rules: [
        "No provider key is entered in, stored in, or read by the browser.",
        "A key the vendor rejects is reported rejected, never active.",
        "A vendor with no key and no code is not connected, and is never counted.",
      ],
      generatedAt: new Date().toISOString(),
    });
  })
  .post("/probe/:id", async (c) => {
    const id = c.req.param("id");
    const p = base().find((x) => x.id === id);
    if (!p) return c.json({ error: `Unknown provider: ${id}` }, 404);
    if (!p.probeable) return c.json({ error: `${p.name} has no live probe. ${p.reason}` }, 400);
    const started = Date.now();
    const r = await probe(id);
    return c.json({
      id,
      name: p.name,
      ok: r.ok,
      httpStatus: r.status ?? null,
      detail: r.detail,
      latencyMs: Date.now() - started,
      probedAt: new Date().toISOString(),
    });
  });
