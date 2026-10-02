/**
 * traxes-brain.ts — THE LIVE PLATFORM INDEX TRAXES THINKS WITH
 *
 * WHAT THIS IS
 * Jeremiah's instruction: "Build Traxes to be the staple AI of this platform, knows the whole
 * platform top to bottom, problem solver of all."
 *
 * An LLM that has been *told* what a platform contains will confidently describe a platform that
 * no longer exists. So TRAXES is never told. This file builds a factual index at request time and
 * TRAXES reads it through tools. If a router is unmounted, a table is dropped or a credential is
 * pulled, the index changes on the next request and TRAXES's answer changes with it.
 *
 * READS (live, every request, nothing typed here)
 *   app.routes                 the running Hono route table, passed in as a lazy getter because
 *                              this module cannot import `app` (circular) — same contract as
 *                              functions.ts / functionsIndex(getRoutes)
 *   sqlite_master + COUNT(*)   real table names and real row counts from Turso
 *   process.env                PRESENCE ONLY, as a boolean
 *   CAPS (functions.ts)        the deduplicated capability registry, reused not re-declared
 *   appScreens() (functions.ts) the in-app route table scraped from legacy/App.jsx
 *
 * COMPUTES LOCALLY
 *   Route prefix grouping, empty-table list, credential-shape checks, and the blocker list.
 *   A 30-second cache so one chat turn firing six tools does not run 60 COUNT(*) queries.
 *
 * WHAT THIS DOES NOT DO
 *   - It NEVER returns an env value, or any part of one. Booleans only. A shape check reports
 *     "does not match the documented prefix", never the characters that failed.
 *   - It publishes no score, no health percentage, no confidence figure. Nothing in this platform
 *     records health-check results over time, so no availability number can be honest.
 *   - It writes nothing. Read-only by construction: no INSERT, no UPDATE, no DELETE, no provider
 *     call that costs money or files anything.
 *   - It makes no ELD registration claim and no tax-filing claim. TruckWithEase is not a
 *     registered ELD and files nothing with any agency.
 */

import { sql } from "drizzle-orm";
import { db } from "../database";
import { CAPS, appScreens, envPresent, type Cap } from "../routes/functions";

type Row = Record<string, unknown>;

async function run(q: string): Promise<Row[]> {
  const r = (await db.execute(sql.raw(q))) as unknown as { rows: Row[] };
  return (r.rows ?? []) as Row[];
}

const norm = (p: string) => {
  const s = p.startsWith("/") ? p : `/${p}`;
  return s.length > 1 && s.endsWith("/") ? s.slice(0, -1) : s;
};

/**
 * Every provider credential the platform reads, grouped by what stops working without it.
 * Presence is reported as a boolean. `shape` is an optional documented format check — it exists
 * because a syntactically wrong key produces a provider 401 that looks like an outage.
 */
export const ENV_KEYS: {
  key: string;
  powers: string;
  breaksWithout: string;
  shape?: { test: RegExp; documented: string };
}[] = [
  { key: "DATABASE_URL", powers: "Turso database connection", breaksWithout: "Every read and write on the platform." },
  { key: "DATABASE_AUTH_TOKEN", powers: "Turso auth", breaksWithout: "Every read and write on the platform." },
  { key: "AI_GATEWAY_API_KEY", powers: "All AI agents including TRAXES", breaksWithout: "Every agent falls back to demo answers." },
  { key: "AI_GATEWAY_BASE_URL", powers: "All AI agents including TRAXES", breaksWithout: "Every agent falls back to demo answers." },
  { key: "GEMINI_API_KEY", powers: "Document OCR (TRAXES scan), captions, TTS", breaksWithout: "POST /api/traxes/scan returns 503. Records can still be typed by hand." },
  { key: "S3_ACCESS_KEY_ID", powers: "Object storage (document photos)", breaksWithout: "No document upload, so nothing to scan." },
  { key: "S3_SECRET_ACCESS_KEY", powers: "Object storage", breaksWithout: "No document upload, so nothing to scan." },
  { key: "S3_BUCKET", powers: "Object storage", breaksWithout: "No document upload, so nothing to scan." },
  { key: "POSTMARK_SERVER_TOKEN", powers: "Outbound email", breaksWithout: "TRAXES /send cannot email a broker; it returns a signed link instead and claims no send." },
  { key: "EMAIL_FROM", powers: "Outbound email sender identity", breaksWithout: "Postmark rejects the send." },
  {
    key: "TWILIO_ACCOUNT_SID",
    powers: "Fleet phone numbers and in-app SMS",
    breaksWithout: "Every /api/comms and /api/a2p call fails.",
    shape: { test: /^AC[0-9a-fA-F]{32}$/, documented: "A Twilio Account SID starts with AC and is 34 characters. Source: console.twilio.com." },
  },
  { key: "TWILIO_AUTH_TOKEN", powers: "Twilio auth", breaksWithout: "Every /api/comms and /api/a2p call fails." },
  { key: "TWILIO_MESSAGING_SERVICE_SID", powers: "SMS sending pool", breaksWithout: "Outbound SMS has no messaging service to send through." },
  { key: "CHECKR_API_KEY", powers: "Criminal background checks (HR)", breaksWithout: "Background checks report provider-not-connected. No check is ever faked." },
  { key: "OPENWEATHER_API_KEY", powers: "Weather reads", breaksWithout: "Weather panels report the provider as unavailable." },
  { key: "GOOGLE_PLACES_API_KEY", powers: "Place lookup", breaksWithout: "Place search is unavailable." },
  { key: "VITE_GOOGLE_MAPS_KEY", powers: "Browser maps", breaksWithout: "Maps do not render." },
  { key: "AZUGA_API_KEY", powers: "Azuga telematics pull", breaksWithout: "No Azuga telemetry ingest." },
  { key: "FLEETIO_API_KEY", powers: "Fleetio maintenance sync", breaksWithout: "No Fleetio sync." },
  { key: "FLEETIO_ACCOUNT_TOKEN", powers: "Fleetio account scope", breaksWithout: "No Fleetio sync." },
  { key: "AUTUMN_SECRET_KEY", powers: "Subscriptions and billing", breaksWithout: "No plan or subscription operation." },
  { key: "BETTER_AUTH_SECRET", powers: "Session signing", breaksWithout: "Nobody can sign in." },
];

/** Tables whose emptiness changes what the product can honestly show. */
const CORE_TABLES = [
  "drivers",
  "trucks",
  "hos_logs",
  "loads",
  "eld_devices",
  "eld_telemetry",
  "traxes_records",
  "clock_ledger_entries",
  "safety_scores",
  "dvir_inspections",
];

export type Blocker = {
  id: string;
  severity: "blocking" | "degraded" | "empty";
  what: string;
  /** The measurement this blocker was derived from in THIS request. */
  evidence: string;
  /** The exact next action, and who has to take it. No workaround is invented. */
  fix: string;
  owner: "account owner" | "deployment" | "data entry";
};

export type TraxesBrain = {
  builtAt: string;
  cachedForMs: number;
  product: {
    name: string;
    what: string;
    isAnELD: false;
    fmcsaRegistered: false;
    filesWithAgencies: false;
    boundaries: string[];
  };
  api: {
    totalRoutes: number;
    routers: { prefix: string; routes: number; methods: string[] }[];
    routes: { method: string; path: string }[];
  };
  database: {
    totalTables: number;
    tables: { name: string; rows: number | null; error: string | null }[];
    emptyCoreTables: string[];
    unreadable: string[];
  };
  credentials: { key: string; present: boolean; powers: string; breaksWithout: string; shapeOk: boolean | null; shapeNote: string | null }[];
  capabilities: { total: number; byDomain: Record<string, number>; rows: Pick<Cap, "id" | "name" | "domain" | "what" | "kind" | "endpoints" | "tables" | "envKeys" | "pages" | "trust">[] };
  screens: { total: number; paths: string[]; source: string | null; error: string | null };
  blockers: Blocker[];
  reads: string[];
};

/**
 * The product boundaries TRAXES must never cross when answering. These are not marketing lines —
 * each one is a rule that was enforced by deleting a claim from this codebase.
 */
const BOUNDARIES = [
  "TruckWithEase is not an ELD and is not registered with FMCSA. It runs alongside the ELD the driver already has. The ELD remains the log of record.",
  "TruckWithEase files nothing with any agency — no IFTA, no tax return, no FMCSA filing. TRAXES is a record-keeper and a calculator for a human preparer.",
  "No availability or uptime percentage exists. Nothing records health-check results over time.",
  "OCR returns no confidence score, so no confidence number is ever shown.",
  "Support is not 24/7. Support is 636-706-8338 during staffed hours.",
  "No competitor is named, compared, or priced anywhere in this product.",
];

let cache: { at: number; brain: TraxesBrain } | null = null;
const CACHE_MS = 30_000;

export function invalidateBrain() {
  cache = null;
}

export async function buildBrain(getRoutes: () => { method: string; path: string }[]): Promise<TraxesBrain> {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return { ...cache.brain, cachedForMs: Date.now() - cache.at };
  }

  /* ---- API surface: the running route table, not a list someone kept ---- */
  const raw = getRoutes() ?? [];
  const seen = new Set<string>();
  const routes: { method: string; path: string }[] = [];
  for (const r of raw) {
    const method = String(r.method ?? "").toUpperCase();
    const path = norm(String(r.path ?? ""));
    if (method === "USE" || method === "ALL") continue;
    if (!path.startsWith("/api/")) continue;
    const k = `${method} ${path}`;
    if (seen.has(k)) continue;
    seen.add(k);
    routes.push({ method, path });
  }
  routes.sort((a, b) => (a.path === b.path ? a.method.localeCompare(b.method) : a.path.localeCompare(b.path)));

  const routerMap = new Map<string, { routes: number; methods: Set<string> }>();
  for (const r of routes) {
    const prefix = `/api/${r.path.split("/")[2] ?? ""}`;
    const e = routerMap.get(prefix) ?? { routes: 0, methods: new Set<string>() };
    e.routes += 1;
    e.methods.add(r.method);
    routerMap.set(prefix, e);
  }
  const routers = [...routerMap.entries()]
    .map(([prefix, v]) => ({ prefix, routes: v.routes, methods: [...v.methods].sort() }))
    .sort((a, b) => a.prefix.localeCompare(b.prefix));

  /* ---- Database: real names, real counts ---- */
  const tables: { name: string; rows: number | null; error: string | null }[] = [];
  const unreadable: string[] = [];
  let names: string[] = [];
  try {
    names = (await run("select table_name as name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name")).map((r) =>
      String(r.name),
    );
  } catch (e) {
    unreadable.push(`sqlite_master: ${e instanceof Error ? e.message : String(e)}`);
  }
  for (const name of names) {
    try {
      const r = await run(`select count(*) as n from "${name}"`);
      tables.push({ name, rows: Number(r[0]?.n ?? 0), error: null });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      tables.push({ name, rows: null, error: msg });
      unreadable.push(`${name}: ${msg}`);
    }
  }
  const rowsOf = (t: string) => tables.find((x) => x.name === t)?.rows ?? null;
  const emptyCoreTables = CORE_TABLES.filter((t) => rowsOf(t) === 0);

  /* ---- Credentials: booleans and documented-shape checks only ---- */
  const credentials = ENV_KEYS.map((e) => {
    const present = envPresent(e.key);
    let shapeOk: boolean | null = null;
    let shapeNote: string | null = null;
    if (present && e.shape) {
      const v = String(process.env[e.key] ?? "").replace(/"/g, "").trim();
      shapeOk = e.shape.test.test(v);
      if (!shapeOk) shapeNote = `The stored value does not match the documented format. ${e.shape.documented}`;
    }
    return { key: e.key, present, powers: e.powers, breaksWithout: e.breaksWithout, shapeOk, shapeNote };
  });
  const cred = (k: string) => credentials.find((c) => c.key === k);

  /* ---- Capabilities and screens: reuse the existing registries ---- */
  const byDomain: Record<string, number> = {};
  for (const c of CAPS) byDomain[c.domain] = (byDomain[c.domain] ?? 0) + 1;
  const screens = appScreens();

  /* ---- Blockers: derived from the measurements above, in this request ---- */
  const blockers: Blocker[] = [];

  for (const c of credentials) {
    if (!c.present) {
      blockers.push({
        id: `env-missing-${c.key.toLowerCase()}`,
        severity: c.key === "DATABASE_URL" || c.key === "BETTER_AUTH_SECRET" ? "blocking" : "degraded",
        what: `${c.key} is not set, so ${c.powers.toLowerCase()} is unavailable.`,
        evidence: `process.env.${c.key} is absent (checked as a boolean this request).`,
        fix: `${c.breaksWithout} Add ${c.key} to the single root .env. Never create .env.local or any other env file — deployments ship only .env.`,
        owner: "account owner",
      });
    } else if (c.shapeOk === false) {
      blockers.push({
        id: `env-shape-${c.key.toLowerCase()}`,
        severity: "blocking",
        what: `${c.key} is set but is not a valid ${c.key.split("_")[0]} credential, so ${c.powers.toLowerCase()} fails with a provider authentication error.`,
        evidence: c.shapeNote ?? "Documented format check failed.",
        fix: `Replace ${c.key} in the root .env with the real value from the provider console. There is no workaround for a wrong credential — do not retry, the provider will keep returning 401.`,
        owner: "account owner",
      });
    }
  }

  // A2P 10DLC: an approved brand alone does not let US SMS flow. Read the real registration rows.
  if (cred("TWILIO_MESSAGING_SERVICE_SID")?.present) {
    try {
      const a2p = await run(
        // Column list verified against pragma table_info(a2p_registrations) on 2026-08-30.
        // There is no brand_status column; the registration verdict lives in `status`.
        "select brand_id, campaign_id, status from a2p_registrations order by created_at desc limit 20",
      );
      const withCampaign = a2p.filter((r) => String(r.campaign_id ?? "").trim().length > 0);
      if (a2p.length === 0) {
        blockers.push({
          id: "a2p-no-registration",
          severity: "degraded",
          what: "No A2P 10DLC registration row exists, so US carriers will filter outbound SMS from this platform.",
          evidence: "a2p_registrations returned 0 rows this request.",
          fix: "Register a brand and then a messaging campaign in the Twilio console, and attach the sending number to the campaign. Registration carries a one-time brand fee and a monthly campaign fee billed by the provider.",
          owner: "account owner",
        });
      } else if (withCampaign.length === 0) {
        blockers.push({
          id: "a2p-no-campaign",
          severity: "degraded",
          what: "A2P brand rows exist but none carries a campaign SID. Without a registered messaging campaign, US carriers filter outbound SMS even when the brand is approved.",
          evidence: `a2p_registrations has ${a2p.length} row(s), campaign_id set on 0 of them.`,
          fix: "Register the messaging campaign (use case, sample messages, opt-in language) on the existing Messaging Service and attach the sending number. Do not submit a new brand — that re-files and re-charges.",
          owner: "account owner",
        });
      }
    } catch (e) {
      blockers.push({
        id: "a2p-unreadable",
        severity: "degraded",
        what: "A2P registration state could not be read, so SMS deliverability cannot be confirmed either way.",
        evidence: `a2p_registrations query failed: ${e instanceof Error ? e.message : String(e)}`,
        fix: "Confirm the a2p_registrations table exists in this database before trusting any SMS-delivery answer.",
        owner: "deployment",
      });
    }
  }

  // Inbound SMS: a provider webhook needs a public https host. This is a deployment fact.
  if (cred("TWILIO_AUTH_TOKEN")?.present) {
    blockers.push({
      id: "inbound-sms-needs-public-host",
      severity: "degraded",
      what: "Twilio can only deliver inbound SMS to POST /api/comms/inbound once this app is reachable at a public https host.",
      evidence: "Stated as a deployment property of provider webhooks, not measured here.",
      fix: "After deploying, set the number's inbound webhook to https://<public-host>/api/comms/inbound in the Twilio console or through POST /api/comms/numbers/:sid/webhook.",
      owner: "deployment",
    });
  }

  for (const t of emptyCoreTables) {
    blockers.push({
      id: `empty-${t}`,
      severity: "empty",
      what: `${t} has 0 rows, so anything computed from it renders as unavailable rather than as a number.`,
      evidence: `select count(*) from "${t}" returned 0 this request.`,
      fix: `Create real ${t.replace(/_/g, " ")} rows. An empty table is reported as empty — it is never filled with a placeholder figure.`,
      owner: "data entry",
    });
  }

  for (const u of unreadable) {
    blockers.push({
      id: `unreadable-${u.split(":")[0]}`,
      severity: "blocking",
      what: `A database object could not be read: ${u.split(":")[0]}.`,
      evidence: u,
      fix: "Check the schema against the live database. Tables are created from the Drizzle schema with `drizzle-kit push` against Neon Postgres.",
      owner: "deployment",
    });
  }

  const order = { blocking: 0, degraded: 1, empty: 2 } as const;
  blockers.sort((a, b) => order[a.severity] - order[b.severity] || a.id.localeCompare(b.id));

  const brain: TraxesBrain = {
    builtAt: new Date().toISOString(),
    cachedForMs: 0,
    product: {
      name: "TruckWithEase",
      what: "Compliance and fleet software for Class A drivers and the fleets that run them. It runs alongside the driver's existing ELD.",
      isAnELD: false,
      fmcsaRegistered: false,
      filesWithAgencies: false,
      boundaries: BOUNDARIES,
    },
    api: { totalRoutes: routes.length, routers, routes },
    database: { totalTables: tables.length, tables, emptyCoreTables, unreadable },
    credentials,
    capabilities: {
      total: CAPS.length,
      byDomain,
      rows: CAPS.map((c) => ({
        id: c.id,
        name: c.name,
        domain: c.domain,
        what: c.what,
        kind: c.kind,
        endpoints: c.endpoints,
        tables: c.tables,
        envKeys: c.envKeys,
        pages: c.pages,
        trust: c.trust,
      })),
    },
    screens: { total: screens.paths.length, paths: screens.paths, source: screens.source, error: screens.error },
    blockers,
    reads: [
      "app.routes (live Hono route table, passed in as a lazy getter)",
      "information_schema + COUNT(*) per table (live Neon Postgres)",
      "process.env presence as booleans only",
      "CAPS registry in api/routes/functions.ts",
      "legacy/App.jsx route table via appScreens()",
      "a2p_registrations rows (campaign presence only)",
    ],
  };

  cache = { at: Date.now(), brain };
  return brain;
}

/** A compact text digest for the model's system prompt. Structure only — the tools carry detail. */
export function brainDigest(b: TraxesBrain): string {
  const lines: string[] = [];
  lines.push(`PLATFORM: ${b.product.name} — ${b.product.what}`);
  lines.push(`INDEX BUILT: ${b.builtAt}`);
  lines.push(
    `SURFACE: ${b.api.totalRoutes} live API routes across ${b.api.routers.length} routers, ${b.database.totalTables} database tables, ${b.capabilities.total} indexed capabilities, ${b.screens.total} in-app screens.`,
  );
  lines.push(`ROUTERS: ${b.api.routers.map((r) => r.prefix).join(", ")}`);
  lines.push(
    `CAPABILITY DOMAINS: ${Object.entries(b.capabilities.byDomain)
      .map(([d, n]) => `${d} (${n})`)
      .join(", ")}`,
  );
  lines.push(
    `CREDENTIALS PRESENT: ${b.credentials.filter((c) => c.present).length} of ${b.credentials.length}. Missing: ${
      b.credentials.filter((c) => !c.present).map((c) => c.key).join(", ") || "none"
    }`,
  );
  lines.push(
    `OPEN BLOCKERS: ${b.blockers.length}${b.blockers.length ? ` — ${b.blockers.slice(0, 8).map((x) => x.id).join(", ")}` : ""}`,
  );
  lines.push(`HARD BOUNDARIES:\n- ${b.product.boundaries.join("\n- ")}`);
  return lines.join("\n");
}
