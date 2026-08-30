import { Hono } from "hono";

/**
 * OPENAPI — the machine-readable contract for the TruckWithEase API.
 *
 * The document is built from the app's OWN live route table at request time (same lazy-getter
 * contract as the function index and TRAXES). It is never hand-written, so it cannot describe an
 * endpoint that is not mounted, and it cannot go stale when routes are added or removed.
 *
 * Honest limits, stated in the document itself under `info.description`:
 *  - Request and response schemas are NOT modeled. Hono does not carry them in the route table,
 *    so inventing them would produce a contract that lies. Paths, methods and path parameters are
 *    measured; bodies are declared as free-form objects.
 *  - Descriptions exist only where they were written deliberately (see CURATED). Everything else
 *    gets a mechanical one-liner rather than a guess at semantics.
 *  - Auth is declared as a security scheme but only 3 route files reference auth today, so the
 *    scheme is documented as "session cookie, where enforced" and not applied globally.
 */

type RouteRow = { method: string; path: string };

const VERSION = "2026.08.30";

/** `/api/hos/:driverId` -> `/api/hos/{driverId}` plus the parameter list. */
const paramize = (path: string) => {
  const params: string[] = [];
  const out = path
    .split("/")
    .map((seg) => {
      if (!seg.startsWith(":")) return seg;
      const name = seg.slice(1).replace(/[^A-Za-z0-9_]/g, "");
      params.push(name);
      return `{${name}}`;
    })
    .join("/");
  return { path: out, params };
};

const normPath = (p: string) => {
  const s = ("/" + String(p ?? "").replace(/^\/+/, "")).replace(/\/{2,}/g, "/");
  return s.length > 1 ? s.replace(/\/+$/, "") : s;
};

/**
 * Descriptions written by hand, only for endpoints whose behaviour is documented elsewhere in the
 * codebase and verified. Anything absent from this map gets a mechanical summary instead of an
 * invented one.
 */
const CURATED: Record<string, { summary: string; description: string }> = {
  "GET /api/sealed-line": {
    summary: "Sealed Line overview",
    description:
      "Counts of sealed messages, chain head hash, unresolved rows, and phone-coverage totals for the fleet.",
  },
  "POST /api/sealed-line/seal": {
    summary: "Seal pending messages",
    description:
      "Stamps every unsealed message with the driver's duty clock recomputed as of the second the message existed, then links it into the append-only sha256 chain.",
  },
  "GET /api/sealed-line/chain": {
    summary: "Verify the chain",
    description:
      "Recomputes every link from stored payloads and reports breaks. Tamper-EVIDENT: an altered measurement or body text breaks the recomputed link. Not notarization and not a third-party timestamp authority.",
  },
  "GET /api/sealed-line/coverage": {
    summary: "Phone coverage",
    description:
      "Which message endpoints resolve to a known driver phone, and which cannot be attributed yet.",
  },
  "POST /api/sealed-line/link-driver": {
    summary: "Link a phone to a driver",
    description:
      "Attaches a normalized NANP number to a driver so past messages become resolvable. 409 when the number already belongs to another driver.",
  },
  "POST /api/sealed-line/reseal-unresolved": {
    summary: "Append corrected seals",
    description:
      "For messages that became resolvable after a phone link, appends a NEW sealed row carrying the clock recomputed as of the ORIGINAL timestamp, pointing back via supersedesSealedId. Nothing is updated or deleted.",
  },
  "GET /api/sealed-line/thread/:conversationId": {
    summary: "Replay a conversation",
    description:
      "Every message in a conversation in order, each with the duty clock attached as of its own timestamp.",
  },
  "POST /api/sealed-line/answer": {
    summary: "Answer a dispatch ask",
    description:
      "Parses an ask (\"400 more miles, be there by 6?\") and returns a 49 CFR 395 legality verdict against that driver's remaining clock: fits, does_not_fit, needs_break, needs_reset, unparsed, or no_clock.",
  },
  "POST /api/comms/inbound": {
    summary: "Twilio inbound webhook",
    description:
      "Twilio messaging webhook. Records the inbound message, seals it, and may auto-reply over the same fleet number via the REST API so Twilio's SID, status and error code land on the stored row. Returns empty TwiML by design.",
  },
  "GET /api/comms/auto-reply": {
    summary: "Auto-reply config and decisions",
    description:
      "Current auto-reply configuration, credential usability, decision tally, and the last 20 decisions with their reasons.",
  },
  "POST /api/comms/auto-reply/retry": {
    summary: "Retry refused sends",
    description:
      "Requeues auto-replies that were never sent (send_failed / skipped_no_creds), recomputed at now, and appends a new decision row. 400 when Twilio credentials are absent.",
  },
  "GET /api/comms/a2p-status": {
    summary: "Live US 10DLC registration status",
    description:
      "Reads the carrier campaign record live from Twilio and reports campaign status, errors, filed use case, sending numbers, and whether carriers will filter traffic.",
  },
  "GET /api/clock-ledger/open-intervals": {
    summary: "Stale open duty intervals",
    description:
      "Duty intervals still open past STALE_OPEN_HOURS, which distort every downstream clock calculation.",
  },
  "GET /api/routing/status": {
    summary: "Routing and Google key status",
    description:
      "Which Google Maps APIs are measured working, and which env key each API family resolves to (masked fingerprints only, never key material).",
  },
  "GET /api/functions": {
    summary: "Measured function index",
    description:
      "The app's own route table, capability rows with computed status, live table row counts, and the duplicate proof.",
  },
};

const TAG_NOTES: Record<string, string> = {
  "sealed-line":
    "THE SEALED LINE — every message on a fleet number stamped with the driver's duty clock as of the second it existed, chained sha256, tamper-evident.",
  comms: "Fleet phone lines for INTERNAL fleet communication (driver, dispatcher, staff).",
  "clock-ledger": "Duty-interval integrity: detection and defensible repair of stale open intervals.",
  hos: "Hours of service reads, computed through api/lib/dutyclock.ts (the single source of truth).",
  routing: "Route planning against Google Directions, with per-API key selection.",
};

const buildSpec = (rows: RouteRow[]) => {
  const seen = new Set<string>();
  type Ep = { method: string; raw: string; path: string; params: string[]; tag: string };
  const eps: Ep[] = [];

  for (const r of rows ?? []) {
    const method = String(r?.method ?? "ALL").toUpperCase();
    if (method === "USE" || method === "ALL") continue;
    const raw = normPath(String(r?.path ?? ""));
    if (!raw.startsWith("/api")) continue;
    if (raw.startsWith("/api/auth")) continue; // owned by Better Auth, documented by that library
    const key = `${method} ${raw}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const { path, params } = paramize(raw);
    eps.push({ method, raw, path, params, tag: raw.split("/")[2] ?? "root" });
  }
  eps.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));

  const paths: Record<string, Record<string, unknown>> = {};
  let curatedCount = 0;

  for (const ep of eps) {
    const curated = CURATED[`${ep.method} ${ep.raw}`];
    if (curated) curatedCount++;
    const lower = ep.method.toLowerCase();
    const tail = ep.path.split("/").filter(Boolean).slice(2).join("/") || "index";

    const op: Record<string, unknown> = {
      tags: [ep.tag],
      operationId: `${lower}_${ep.path.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "")}`,
      summary: curated?.summary ?? `${ep.method} ${tail}`,
      description:
        curated?.description ??
        "Behaviour not documented in the spec. Path and method are measured off the running app; request and response shapes are not modeled.",
      responses: {
        "200": {
          description: "Success. Response shape is not modeled in this spec.",
          content: { "application/json": { schema: { type: "object", additionalProperties: true } } },
        },
        "400": { description: "Invalid input." },
        "500": { description: "Server error." },
      },
    };

    if (ep.params.length) {
      op.parameters = ep.params.map((name) => ({
        name,
        in: "path",
        required: true,
        schema: { type: "string" },
      }));
    }

    if (lower === "post" || lower === "put" || lower === "patch") {
      op.requestBody = {
        required: false,
        content: {
          "application/json": { schema: { type: "object", additionalProperties: true } },
        },
      };
    }

    paths[ep.path] = { ...(paths[ep.path] ?? {}), [lower]: op };
  }

  const tags = [...new Set(eps.map((e) => e.tag))].sort().map((name) => ({
    name,
    description: TAG_NOTES[name] ?? `${name} endpoints.`,
  }));

  const spec = {
    openapi: "3.1.0",
    info: {
      title: "TruckWithEase API",
      version: VERSION,
      summary: "Compliance and fleet operations API for Class A carriers.",
      description: [
        "Generated from the running application's own route table, not hand-written, so it cannot",
        "describe an endpoint that is not mounted.",
        "",
        "Known limits of this document, stated plainly:",
        "- Request and response bodies are NOT modeled. Hono's route table does not carry them.",
        "  Every body and 200 response is declared as a free-form JSON object.",
        `- Only ${curatedCount} operations carry hand-written descriptions. The rest carry a`,
        "  mechanical summary rather than an invented one.",
        "- Authentication is enforced on only part of this surface today. Do not treat the absence",
        "  of a security requirement on an operation as proof it is public.",
        "- TruckWithEase is not an ELD and is not FMCSA-registered. It is compliance and fleet",
        "  software that runs alongside the ELD a driver already has.",
      ].join("\n"),
      contact: { name: "TruckWithEase", email: "jeremiahjmorris1126@gmail.com" },
    },
    servers: [
      { url: "https://truckwithease.com", description: "Production" },
      { url: "http://localhost:4200", description: "Local development" },
    ],
    tags,
    components: {
      securitySchemes: {
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
          description:
            "Session cookie issued by the sign-in flow, where enforcement exists. Not applied globally in this document because enforcement is partial.",
        },
      },
    },
    paths,
  };

  return { spec, endpointCount: eps.length, pathCount: Object.keys(paths).length, curatedCount, eps };
};

export const openapiRoutes = (getRoutes: () => RouteRow[]) =>
  new Hono()

    /** GET /api/openapi.json — the full OpenAPI 3.1 document. */
    .get("/openapi.json", (c) => {
      const t0 = Date.now();
      const { spec } = buildSpec(getRoutes() ?? []);
      c.header("x-generated-ms", String(Date.now() - t0));
      return c.json(spec, 200);
    })

    /** GET /api/openapi/summary — what the document covers, and what it honestly does not. */
    .get("/openapi/summary", (c) => {
      const t0 = Date.now();
      const built = buildSpec(getRoutes() ?? []);
      const byTag: Record<string, number> = {};
      for (const e of built.eps) byTag[e.tag] = (byTag[e.tag] ?? 0) + 1;
      return c.json(
        {
          version: VERSION,
          generatedAt: new Date().toISOString(),
          measuredMs: Date.now() - t0,
          document: "/api/openapi.json",
          openapi: "3.1.0",
          endpoints: built.endpointCount,
          paths: built.pathCount,
          tags: Object.keys(byTag).length,
          endpointsByTag: Object.fromEntries(
            Object.entries(byTag).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
          ),
          curatedDescriptions: built.curatedCount,
          excluded: {
            "/api/auth/*": "Owned by Better Auth; documented by that library, not re-described here.",
          },
          notClaimed: [
            "Request and response bodies are not modeled.",
            "Absence of a security requirement is not proof an endpoint is public.",
            "This document is not a support or availability commitment.",
          ],
        },
        200,
      );
    });

export default openapiRoutes;
