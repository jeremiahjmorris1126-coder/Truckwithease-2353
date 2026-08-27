import { Hono } from "hono";

/**
 * Azuga Fleet API integration (server-side only).
 *
 * Built 2026-08-26 from the official docs:
 *   - developer.azuga.com/v2/reference/authentication
 *     "You will need to include your 64 bit encoded key in every request."
 *     Header: `Authorization: Basic <Base64EncodedAPIKey>`
 *     Key comes from the Azuga portal: Admin > Users > column "Webservices API key",
 *     or by emailing integration@azuga.com.
 *   - developer.azuga.com/v2/reference/getting-started
 *     Banner on that page, verbatim: "This page documents the second increment of our
 *     API Stack (v2). However, this is yet in BETA and we recommend using v3 APIs".
 *     A v1->v4 migration guide also exists. So AZUGA_API_VERSION is configurable and
 *     defaults to v2 because that is what was asked for.
 *
 * THE CREDENTIAL IS NOT IN .env. Every endpoint below returns
 * { configured: false, live: false, reason } until AZUGA_API_KEY exists.
 * Nothing here fabricates a GPS point, a speed, a driver score or a diagnostic code.
 * If Azuga does not answer, the caller gets an error and a reason — never a number.
 */

const BASE_HOST = process.env.AZUGA_BASE_HOST || "https://api.azuga.com";
const VERSION = process.env.AZUGA_API_VERSION || "v2";
const BASE = `${BASE_HOST}/${VERSION}`;
const TIMEOUT_MS = 20000;

/**
 * Resource paths Azuga documents for the fleet API. The docs index lists
 * "live locations, breadcrumbs, trips (raw / summary), stops, events, state mileage,
 * and dashcam videos" plus vehicles, drivers, groups and fuel transactions.
 *
 * These are the paths we will try. Because v2 is beta and its per-resource paths are
 * not individually confirmable without an account, every response echoes the exact
 * `endpoint` string used, and `GET /api/azuga/raw?path=...` exists so the real paths
 * can be confirmed against a live account instead of being guessed at in code.
 */
const RESOURCES: Record<string, string> = {
  vehicles: "/vehicles",
  drivers: "/drivers",
  groups: "/groups",
  live: "/vehicles/location",
  breadcrumbs: "/breadcrumbs",
  trips: "/trips",
  "trip-summary": "/trips/summary",
  stops: "/stops",
  events: "/events",
  "state-mileage": "/reports/statemileage",
  diagnostics: "/diagnostics",
  "fuel-transactions": "/fuelTransactions",
};

function credential(): string | null {
  const raw = process.env.AZUGA_API_KEY;
  if (!raw || !raw.trim()) return null;
  // Docs require the key base64-encoded. Accept either a raw key or an
  // already-encoded one so a paste of either form works.
  const trimmed = raw.trim();
  const looksEncoded = /^[A-Za-z0-9+/]+={0,2}$/.test(trimmed) && trimmed.length % 4 === 0;
  return looksEncoded ? trimmed : Buffer.from(trimmed).toString("base64");
}

function notConfigured() {
  return {
    configured: false,
    live: false,
    provider: "azuga",
    version: VERSION,
    reason:
      "AZUGA_API_KEY is not set. Get it from the Azuga portal under Admin > Users, " +
      "column 'Webservices API key', or email integration@azuga.com. Until then this " +
      "endpoint returns no telemetry — it will not estimate or simulate vehicle data.",
    data: null,
  };
}

async function callAzuga(path: string, query?: Record<string, string | undefined>) {
  const key = credential();
  if (!key) return { ok: false as const, notConfigured: true as const };

  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(query || {})) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${key}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = null;
    }
    if (!res.ok) {
      return {
        ok: false as const,
        notConfigured: false as const,
        status: res.status,
        endpoint: url.toString(),
        body: parsed ?? text.slice(0, 400),
      };
    }
    return {
      ok: true as const,
      status: res.status,
      endpoint: url.toString(),
      data: parsed ?? text.slice(0, 2000),
    };
  } catch (err) {
    return {
      ok: false as const,
      notConfigured: false as const,
      status: 0,
      endpoint: url.toString(),
      body: err instanceof Error ? err.message : "request failed",
    };
  } finally {
    clearTimeout(timer);
  }
}

export const azuga = new Hono();

/** Integration status — safe to call from any admin screen. */
azuga.get("/status", (c) => {
  const key = credential();
  return c.json({
    provider: "azuga",
    base: BASE,
    version: VERSION,
    configured: Boolean(key),
    live: false,
    verified: false,
    note: key
      ? "Key present. No call has been made yet, so nothing about this account is verified. " +
        "Hit /api/azuga/ping to confirm Azuga actually accepts the key."
      : "No AZUGA_API_KEY in .env — every data endpoint returns null with a reason.",
    versionWarning:
      "Azuga's own v2 docs say v2 is in BETA and recommend v3. Set AZUGA_API_VERSION=v3 " +
      "(or v4) in .env to move without a code change.",
    resources: Object.keys(RESOURCES),
    docs: "https://developer.azuga.com/v2/reference/authentication",
  });
});

/** Confirm the credential against Azuga. Reports exactly what Azuga said. */
azuga.get("/ping", async (c) => {
  const key = credential();
  if (!key) return c.json(notConfigured(), 200);

  const r = await callAzuga(RESOURCES.vehicles, { size: "1" });
  if (r.ok) {
    return c.json({
      configured: true,
      live: true,
      provider: "azuga",
      version: VERSION,
      endpoint: r.endpoint,
      httpStatus: r.status,
      note: "Azuga accepted the credential and returned a response.",
    });
  }
  return c.json(
    {
      configured: true,
      live: false,
      provider: "azuga",
      version: VERSION,
      endpoint: "endpoint" in r ? r.endpoint : BASE + RESOURCES.vehicles,
      httpStatus: "status" in r ? r.status : 0,
      azugaSaid: "body" in r ? r.body : null,
      reason:
        "Azuga rejected or did not answer the request. A 401 means the key is wrong or not " +
        "base64-encoded; a 404 means this v2 path is not the one your account exposes — " +
        "use /api/azuga/raw?path=... to find the right one, or switch AZUGA_API_VERSION.",
    },
    502,
  );
});

/** Generic documented-resource read: /api/azuga/r/vehicles, /r/trips, /r/live ... */
azuga.get("/r/:resource", async (c) => {
  const resource = c.req.param("resource");
  const path = RESOURCES[resource];
  if (!path) {
    return c.json(
      { error: "unknown resource", known: Object.keys(RESOURCES) },
      400,
    );
  }

  const q: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(c.req.query())) q[k] = v;

  const r = await callAzuga(path, q);
  if ("notConfigured" in r && r.notConfigured) return c.json(notConfigured(), 200);
  if (!r.ok) {
    return c.json(
      {
        configured: true,
        live: false,
        resource,
        endpoint: "endpoint" in r ? r.endpoint : BASE + path,
        httpStatus: "status" in r ? r.status : 0,
        azugaSaid: "body" in r ? r.body : null,
        data: null,
        reason: "Azuga did not return data. No values are being substituted.",
      },
      502,
    );
  }
  return c.json({
    configured: true,
    live: true,
    resource,
    endpoint: r.endpoint,
    fetchedAt: new Date().toISOString(),
    source: "azuga",
    data: r.data,
  });
});

/**
 * Escape hatch for confirming real v2 paths against a live account.
 * Path is constrained to the Azuga host — it cannot be pointed anywhere else.
 */
azuga.get("/raw", async (c) => {
  const path = c.req.query("path");
  if (!path || !path.startsWith("/")) {
    return c.json(
      { error: "pass ?path=/some/azuga/path (must start with /)" },
      400,
    );
  }
  if (path.includes("..") || path.includes("//")) {
    return c.json({ error: "invalid path" }, 400);
  }
  const r = await callAzuga(path);
  if ("notConfigured" in r && r.notConfigured) return c.json(notConfigured(), 200);
  if (!r.ok) {
    return c.json(
      {
        live: false,
        endpoint: "endpoint" in r ? r.endpoint : BASE + path,
        httpStatus: "status" in r ? r.status : 0,
        azugaSaid: "body" in r ? r.body : null,
      },
      502,
    );
  }
  return c.json({ live: true, endpoint: r.endpoint, data: r.data });
});

export default azuga;
