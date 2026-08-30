/**
 * traxes-tools.ts — TRAXES's HANDS. READ-ONLY BY CONSTRUCTION.
 *
 * WHAT THIS IS
 * The tool set that makes TRAXES the platform's staple AI instead of a chatbot with a description
 * of the platform pasted into its prompt. Every factual claim TRAXES makes must come from one of
 * these calls, made during that turn. It is instructed to say "I did not check" rather than recite.
 *
 * READS
 *   traxes-brain.ts     the live index (routes, tables, credentials, capabilities, screens, blockers)
 *   the running server   readEndpoint performs a real HTTP GET against this same process
 *   Turso               inspectTable (schema + count + tiny sample) and traxesRecords (money sums)
 *
 * COMPUTES LOCALLY
 *   Keyword scoring in findCapability. Non-2xx collection in diagnose. Category sums in
 *   traxesRecords. Nothing else — no derived figure that the server did not return.
 *
 * WHY THERE IS NO WRITE TOOL — DELIBERATE
 * TRAXES answers, diagnoses, and states the exact fix. It does not mutate. No INSERT, UPDATE or
 * DELETE tool exists here, and readEndpoint is hard-limited to GET routes that are registered on
 * the live app. That means TRAXES can never file a record, send an SMS, submit an A2P brand,
 * charge a card, or delete a document as a side effect of a conversation. A wrong answer costs
 * nothing; a wrong write costs money and trust. When the fix is a mutation, TRAXES names the exact
 * endpoint and payload and lets a human run it.
 *
 * WHAT THESE TOOLS NEVER RETURN
 *   - An environment variable value, or any part of one. envCheck is booleans plus a
 *     documented-format verdict.
 *   - An invented number. A figure that cannot be computed comes back null with a reason string.
 *   - A confidence, accuracy or uptime percentage. Nothing here measures any of the three.
 */

import { tool } from "ai";
import z from "zod";
import { and, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "../database";
import { traxesRecords as traxesRecordsTable } from "../database/schema";
import { buildBrain, type TraxesBrain } from "./traxes-brain";

type Row = Record<string, unknown>;

async function run(q: string): Promise<Row[]> {
  const r = (await db.run(sql.raw(q))) as unknown as { rows: Row[] };
  return (r.rows ?? []) as Row[];
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}\n…[truncated at ${n} characters]` : s);

/** How long TRAXES waits on one of its own endpoints before reporting it as slow/unreachable. */
const READ_TIMEOUT_MS = 8_000;

/** Endpoints diagnose() sweeps. Each is a GET with no required parameter. */
const DIAGNOSE_SWEEP = [
  "/api/functions",
  "/api/traxes/status",
  "/api/eld",
  "/api/hos",
  "/api/clock-ledger",
  "/api/intelligence/status",
  "/api/comms/status",
  "/api/fleet/drivers",
  "/api/safety",
  "/api/integrations",
];

export type TraxesToolCtx = {
  /** Lazy getter for the live Hono route table — this module cannot import `app` (circular). */
  getRoutes: () => { method: string; path: string }[];
  /** Origin of the request being served, so readEndpoint talks to this same running server. */
  baseUrl: string;
};

export function makeTraxesTools(ctx: TraxesToolCtx) {
  const brain = () => buildBrain(ctx.getRoutes);

  /** GET routes registered on the live app, with no path parameter. The readEndpoint whitelist. */
  const gettableRoutes = (b: TraxesBrain) =>
    b.api.routes.filter((r) => r.method === "GET" && !r.path.includes(":") && !r.path.includes("*")).map((r) => r.path);

  const platformMap = tool({
    description:
      "The live structural map of TruckWithEase: counts of API routes, database tables, indexed capabilities and in-app screens, the router list, capability domains, credential presence and the current computed blockers. Call this first for any question about what the platform is, has, or cannot do. Built fresh from the running route table, sqlite_master and process.env at call time.",
    inputSchema: z.object({
      include: z
        .enum(["summary", "routers", "tables", "capabilities", "screens", "blockers", "credentials"])
        .default("summary")
        .describe("Which section to expand. 'summary' returns counts plus blockers and is usually enough."),
    }),
    async execute({ include }) {
      const b = await brain();
      const summary = {
        product: b.product,
        builtAt: b.builtAt,
        counts: {
          apiRoutes: b.api.totalRoutes,
          routers: b.api.routers.length,
          databaseTables: b.database.totalTables,
          capabilities: b.capabilities.total,
          screens: b.screens.total,
          blockers: b.blockers.length,
        },
        emptyCoreTables: b.database.emptyCoreTables,
        blockers: b.blockers,
        reads: b.reads,
      };
      if (include === "summary") return summary;
      if (include === "routers") return { counts: summary.counts, routers: b.api.routers };
      if (include === "tables") return { counts: summary.counts, tables: b.database.tables, unreadable: b.database.unreadable };
      if (include === "capabilities") return { total: b.capabilities.total, byDomain: b.capabilities.byDomain, rows: b.capabilities.rows };
      if (include === "screens") return b.screens;
      if (include === "credentials") return { credentials: b.credentials, note: "Presence is a boolean. No value or partial value is ever returned." };
      return { blockers: b.blockers, note: "Each blocker carries the measurement it was derived from and the exact fix." };
    },
  });

  const findCapability = tool({
    description:
      "Search the live platform index by keyword and get back the matching capabilities, API routes, database tables and in-app screen paths. Use it to answer 'can the platform do X', 'where does X live', 'which endpoint handles X'. Returns an explicit empty result rather than a guess when nothing matches.",
    inputSchema: z.object({
      query: z.string().min(2).describe("Keywords, e.g. 'hours of service', 'background check', 'fuel receipt', 'sms'."),
      limit: z.number().int().min(1).max(25).default(8),
    }),
    async execute({ query, limit }) {
      const b = await brain();
      const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2);
      const score = (hay: string) => terms.reduce((n, t) => n + (hay.includes(t) ? 1 : 0), 0);

      const caps = b.capabilities.rows
        .map((c) => ({ cap: c, s: score(`${c.id} ${c.name} ${c.domain} ${c.what} ${c.kind} ${c.tables.join(" ")} ${c.endpoints.join(" ")} ${(c.pages ?? []).join(" ")}`.toLowerCase()) }))
        .filter((x) => x.s > 0)
        .sort((a, z) => z.s - a.s)
        .slice(0, limit)
        .map((x) => x.cap);

      const routes = b.api.routes.filter((r) => score(r.path.toLowerCase()) > 0).slice(0, limit * 3);
      const tables = b.database.tables.filter((t) => score(t.name.toLowerCase()) > 0).slice(0, limit * 2);
      const screens = b.screens.paths.filter((p) => score(p.toLowerCase()) > 0).slice(0, limit * 2);

      const found = caps.length + routes.length + tables.length + screens.length;
      return {
        query,
        found,
        capabilities: caps,
        routes,
        tables,
        screens,
        note:
          found === 0
            ? "Nothing in the live index matched. Say the platform has no such capability today rather than describing one — and offer platformMap to list what does exist."
            : "Every row here exists in the running app right now.",
      };
    },
  });

  const readEndpoint = tool({
    description:
      "Perform a real HTTP GET against one of this platform's own API endpoints and return the actual status code and body. Only GET routes that are registered on the running app and take no path parameter are allowed; anything else is refused with the reason. Use this whenever the user asks for a real number, a real status, or 'is X working'. Report the status verbatim.",
    inputSchema: z.object({
      path: z
        .string()
        .describe("An /api/... path, query string allowed, e.g. '/api/eld' or '/api/traxes/summary?taxYear=2026'."),
      maxChars: z.number().int().min(200).max(8000).default(4000),
    }),
    async execute({ path, maxChars }) {
      const b = await brain();
      const raw = path.startsWith("/") ? path : `/${path}`;
      const [base, query] = raw.split("?");
      const allowed = gettableRoutes(b);
      if (!base.startsWith("/api/")) {
        return { refused: true, reason: "Only /api/ paths can be read.", path: raw };
      }
      if (!allowed.includes(base.replace(/\/$/, ""))) {
        const near = allowed.filter((p) => p.startsWith(base.split("/").slice(0, 3).join("/"))).slice(0, 15);
        return {
          refused: true,
          reason: `GET ${base} is not a parameter-free GET route on the running app, so it was not called. Nothing was assumed about it.`,
          availableUnderSamePrefix: near,
          path: raw,
        };
      }
      const url = `${ctx.baseUrl}${base}${query ? `?${query}` : ""}`;
      const started = Date.now();
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(READ_TIMEOUT_MS), headers: { accept: "application/json" } });
        const text = await res.text();
        return {
          path: raw,
          status: res.status,
          ok: res.ok,
          latencyMs: Date.now() - started,
          contentType: res.headers.get("content-type"),
          body: clip(text, maxChars),
          note: res.ok
            ? "Live response from this server. Quote its numbers as-is; do not round or re-derive them."
            : "Non-2xx. Report this status and the body's error string verbatim to the user. Do not soften it and do not retry blindly.",
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          path: raw,
          status: null,
          ok: false,
          latencyMs: Date.now() - started,
          error: msg,
          note: `The request did not complete within ${READ_TIMEOUT_MS / 1000}s or the connection failed. Report this as unreachable, not as a zero value.`,
        };
      }
    },
  });

  const inspectTable = tool({
    description:
      "Inspect one real database table: its column definitions, its exact row count, and up to 3 sample rows with long values truncated. Use it when the user asks what is stored, whether data exists, or why a figure renders as unavailable. An empty table is reported as empty — never as a zero-valued result.",
    inputSchema: z.object({
      table: z.string().describe("Exact table name, e.g. 'hos_logs'. Get names from platformMap include='tables'."),
      sample: z.number().int().min(0).max(3).default(2),
    }),
    async execute({ table, sample }) {
      if (!/^[a-z_][a-z0-9_]*$/i.test(table)) {
        return { refused: true, reason: "That is not a valid table identifier, so nothing was queried." };
      }
      const exists = await run(`select name from sqlite_master where type='table' and name='${table}'`);
      if (exists.length === 0) {
        return { table, exists: false, note: "No such table in this database. Say it does not exist rather than describing what it would hold." };
      }
      const cols = await run(`pragma table_info("${table}")`);
      const count = Number((await run(`select count(*) as n from "${table}"`))[0]?.n ?? 0);
      let rows: Row[] = [];
      if (sample > 0 && count > 0) {
        rows = (await run(`select * from "${table}" limit ${sample}`)).map((r) => {
          const out: Row = {};
          for (const [k, v] of Object.entries(r)) out[k] = typeof v === "string" ? clip(v, 120) : v;
          return out;
        });
      }
      return {
        table,
        exists: true,
        rowCount: count,
        columns: cols.map((c) => ({ name: c.name, type: c.type, notNull: !!Number(c.notnull), pk: !!Number(c.pk) })),
        sampleRows: rows,
        note:
          count === 0
            ? "0 rows. Anything computed from this table must be reported as unavailable, with this emptiness as the reason."
            : "Sample rows are real records. Do not quote a person's data back unless the user asked about that record.",
      };
    },
  });

  const envCheck = tool({
    description:
      "Check which provider credentials this deployment has, as booleans, plus a documented-format verdict where one exists. Use it before claiming any provider-backed feature works. It never returns a key value or any part of one, so never ask the user to paste a key into chat — tell them which file it belongs in.",
    inputSchema: z.object({
      keys: z.array(z.string()).default([]).describe("Specific keys to check. Empty array returns all indexed credentials."),
    }),
    async execute({ keys }) {
      const b = await brain();
      const wanted = keys.length ? b.credentials.filter((c) => keys.map((k) => k.toUpperCase()).includes(c.key)) : b.credentials;
      const unknown = keys.filter((k) => !b.credentials.some((c) => c.key === k.toUpperCase()));
      return {
        credentials: wanted,
        unknownKeys: unknown,
        note: "Booleans and format verdicts only. A present-but-malformed credential produces a provider 401 that looks like an outage — say which of the two it is.",
      };
    },
  });

  const diagnose = tool({
    description:
      "Sweep the platform's key endpoints, collect every non-2xx result with its verbatim status and error string, and return them alongside the computed blockers. Use it for 'what is broken', 'why is X not working', or any troubleshooting request. It changes nothing.",
    inputSchema: z.object({
      focus: z
        .string()
        .default("")
        .describe("Optional keyword to narrow the sweep, e.g. 'sms', 'eld', 'traxes'. Empty sweeps the standard set."),
    }),
    async execute({ focus }) {
      const b = await brain();
      const allowed = new Set(gettableRoutes(b));
      let targets = DIAGNOSE_SWEEP.filter((p) => allowed.has(p));
      if (focus.trim()) {
        const f = focus.trim().toLowerCase();
        const extra = [...allowed].filter((p) => p.toLowerCase().includes(f)).slice(0, 8);
        targets = [...new Set([...targets.filter((p) => p.toLowerCase().includes(f)), ...extra])];
      }

      const results = await Promise.all(
        targets.map(async (p) => {
          const started = Date.now();
          try {
            const res = await fetch(`${ctx.baseUrl}${p}`, { signal: AbortSignal.timeout(READ_TIMEOUT_MS), headers: { accept: "application/json" } });
            const text = await res.text();
            return { path: p, status: res.status, ok: res.ok, latencyMs: Date.now() - started, error: res.ok ? null : clip(text, 600) };
          } catch (e) {
            return { path: p, status: null, ok: false, latencyMs: Date.now() - started, error: e instanceof Error ? e.message : String(e) };
          }
        }),
      );

      const failing = results.filter((r) => !r.ok);
      const slow = results.filter((r) => r.ok && r.latencyMs >= 3000);
      return {
        swept: results.length,
        failing,
        slow,
        healthyCount: results.length - failing.length,
        blockers: b.blockers,
        uptime: null,
        uptimeUnavailableReason:
          "Nothing in this platform records health-check results over time, so no availability or uptime percentage can be stated. This sweep is one moment, not uptime.",
        note:
          failing.length === 0
            ? "Every endpoint swept answered 2xx in this one sweep. Say exactly that — it is not a claim about reliability."
            : "Quote each failing status and error string verbatim. If a credential blocker explains a failure, name the credential and where it belongs; do not invent a workaround.",
      };
    },
  });

  const traxesRecords = tool({
    description:
      "TRAXES's original job: the money records. Returns stored document counts and category totals for a tax year, optionally for one driver, straight from traxes_records. Records with no readable amount are counted separately and never estimated. This is a sum of stored documents — not a tax return, not a filing, not advice.",
    inputSchema: z.object({
      taxYear: z.number().int().min(2000).max(2100).default(new Date().getUTCFullYear()),
      driverId: z.string().default("").describe("Empty means the whole fleet."),
    }),
    async execute({ taxYear, driverId }) {
      const filters = [
        eq(traxesRecordsTable.taxYear, taxYear),
        driverId.trim() ? eq(traxesRecordsTable.driverId, driverId.trim()) : undefined,
      ].filter(Boolean);
      const rows = await db
        .select()
        .from(traxesRecordsTable)
        .where(and(...(filters as never[])));

      const byCategory: Record<string, { records: number; amount: number; missingAmount: number }> = {};
      let revenue = 0;
      let deductions = 0;
      let missingAmount = 0;
      for (const r of rows) {
        const cat = r.category || "other";
        byCategory[cat] ??= { records: 0, amount: 0, missingAmount: 0 };
        byCategory[cat].records += 1;
        if (r.amount === null) {
          byCategory[cat].missingAmount += 1;
          missingAmount += 1;
          continue;
        }
        byCategory[cat].amount += r.amount;
        if (cat === "revenue") revenue += r.amount;
        else if (r.deductible) deductions += r.amount;
      }

      return {
        taxYear,
        driverId: driverId.trim() || null,
        records: rows.length,
        revenue: rows.length ? revenue : null,
        deductions: rows.length ? deductions : null,
        net: rows.length ? revenue - deductions : null,
        byCategory,
        recordsMissingAnAmount: missingAmount,
        unavailableReason: rows.length === 0 ? "No documents are stored for that tax year, so there is no total to report." : null,
        disclaimer:
          "These are sums of documents stored in TRAXES. TruckWithEase files nothing with the IRS or any state, computes no tax owed as advice, and is not a substitute for a preparer.",
      };
    },
  });

  return { platformMap, findCapability, readEndpoint, inspectTable, envCheck, diagnose, traxesRecords };
}
