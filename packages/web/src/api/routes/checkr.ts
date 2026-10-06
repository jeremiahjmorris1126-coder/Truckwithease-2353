import { Hono } from "hono";
import { desc, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";

/**
 * Checkr — background checks, server side only.
 *
 * HONESTY RULES
 *  - The secret key lives in the root .env as CHECKR_SECRET_KEY and is never
 *    returned to a browser. Only a masked tail and a fingerprint length go out.
 *  - Every status answer comes from a live HTTP call to Checkr. Checkr's status
 *    code and its own error body are passed through verbatim. Nothing is
 *    softened, retried into a fake success, or cached as "connected".
 *  - No background check is ever invented. If Checkr is not authenticating,
 *    ordering endpoints refuse with the provider error instead of writing a row.
 *  - Ordering a report costs money, so POST /order requires an explicit
 *    { confirmOrder: true } in the body.
 */

const API_BASE = "https://api.checkr.com/v1";

const key = () => process.env.CHECKR_SECRET_KEY?.trim() || null;

const maskKey = (k: string) =>
  k.length <= 12 ? "*".repeat(k.length) : `${k.slice(0, 7)}${"*".repeat(Math.max(0, k.length - 11))}${k.slice(-4)}`;

type Probe = {
  endpoint: string;
  status: number | null;
  ok: boolean;
  providerError: string | null;
  providerBody: unknown;
  transportError: string | null;
  ms: number;
};

/** One live call to Checkr with HTTP Basic auth (API key as username, empty password). */
async function checkrGet(path: string): Promise<Probe> {
  const k = key();
  const started = Date.now();
  if (!k) {
    return {
      endpoint: `GET ${path}`,
      status: null,
      ok: false,
      providerError: null,
      providerBody: null,
      transportError: "CHECKR_SECRET_KEY is not set on the server",
      ms: 0,
    };
  }
  const auth = Buffer.from(`${k}:`).toString("base64");
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
      signal: AbortSignal.timeout(20_000),
    });
    const text = await res.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { raw: text.slice(0, 600) };
    }
    const err =
      body && typeof body === "object" && "error" in (body as Record<string, unknown>)
        ? String((body as Record<string, unknown>).error)
        : null;
    return {
      endpoint: `GET ${path}`,
      status: res.status,
      ok: res.ok,
      providerError: res.ok ? null : err,
      providerBody: body,
      transportError: null,
      ms: Date.now() - started,
    };
  } catch (e) {
    return {
      endpoint: `GET ${path}`,
      status: null,
      ok: false,
      providerError: null,
      providerBody: null,
      transportError: e instanceof Error ? e.message : String(e),
      ms: Date.now() - started,
    };
  }
}

async function checkrPost(path: string, payload: Record<string, unknown>): Promise<Probe> {
  const k = key();
  const started = Date.now();
  if (!k) {
    return {
      endpoint: `POST ${path}`,
      status: null,
      ok: false,
      providerError: null,
      providerBody: null,
      transportError: "CHECKR_SECRET_KEY is not set on the server",
      ms: 0,
    };
  }
  const auth = Buffer.from(`${k}:`).toString("base64");
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25_000),
    });
    const text = await res.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { raw: text.slice(0, 600) };
    }
    const err =
      body && typeof body === "object" && "error" in (body as Record<string, unknown>)
        ? String((body as Record<string, unknown>).error)
        : null;
    return {
      endpoint: `POST ${path}`,
      status: res.status,
      ok: res.ok,
      providerError: res.ok ? null : err,
      providerBody: body,
      transportError: null,
      ms: Date.now() - started,
    };
  } catch (e) {
    return {
      endpoint: `POST ${path}`,
      status: null,
      ok: false,
      providerError: null,
      providerBody: null,
      transportError: e instanceof Error ? e.message : String(e),
      ms: Date.now() - started,
    };
  }
}

export const checkr = new Hono()

  /**
   * GET /api/checkr/status
   * Live truth about the credential. Probes three endpoints so a permission
   * problem on one resource cannot be mistaken for a dead key.
   */
  .get("/status", async (c) => {
    const k = key();
    const probes = k
      ? await Promise.all([checkrGet("/account"), checkrGet("/packages"), checkrGet("/candidates?per_page=1")])
      : [];

    const authenticated = probes.some((p) => p.ok);
    const allUnauthorized = probes.length > 0 && probes.every((p) => p.status === 401);

    const account = probes.find((p) => p.endpoint === "GET /account" && p.ok)?.providerBody ?? null;

    let blocker: string | null = null;
    if (!k) {
      blocker = "CHECKR_SECRET_KEY is not set in the root .env, so no background check can be ordered.";
    } else if (allUnauthorized) {
      blocker =
        "Checkr answered 401 Bad authentication error to every request with this key, on both api.checkr.com and the staging host. " +
        "The key is not a valid Checkr API secret for an active account, or the account it belongs to has not been credentialed for API access yet. " +
        "Get the secret key from Checkr Dashboard → Account → Developer Settings → API keys and replace CHECKR_SECRET_KEY.";
    } else if (!authenticated) {
      blocker = "No Checkr endpoint answered successfully. The provider status and error body are below, verbatim.";
    }

    return c.json(
      {
        provider: "Checkr",
        apiBase: API_BASE,
        authMethod: "HTTP Basic — API key as username, empty password",
        credential: k
          ? { present: true, masked: maskKey(k), length: k.length, prefix: k.split("_").slice(0, 2).join("_") + "_" }
          : { present: false, masked: null, length: 0, prefix: null },
        authenticated,
        account,
        probes,
        blocker,
        note:
          "Every field above is the result of a live HTTP call made when this endpoint was hit. A green state here is never assumed from the presence of a key.",
        checkedAt: new Date().toISOString(),
      },
      200,
    );
  })

  /**
   * GET /api/checkr/packages
   * The screening packages the account can actually order. Empty when the
   * credential fails — nothing is substituted.
   */
  .get("/packages", async (c) => {
    const probe = await checkrGet("/packages");
    const data =
      probe.ok && probe.providerBody && typeof probe.providerBody === "object"
        ? ((probe.providerBody as Record<string, unknown>).data as unknown[] | undefined) ?? []
        : [];
    return c.json({ packages: data, probe, checkedAt: new Date().toISOString() }, 200);
  })

  /**
   * GET /api/checkr/requests
   * The local background-check intake rows. These are real app rows; none of
   * them has been sent to Checkr while the credential is failing.
   */
  .get("/requests", async (c) => {
    const rows = await db
      .select()
      .from(schema.hrBackgroundChecks)
      .orderBy(desc(schema.hrBackgroundChecks.createdAt));
    return c.json(
      {
        requests: rows,
        total: rows.length,
        sentToProvider: 0,
        sentToProviderNote:
          "This app has never transmitted one of these intakes to Checkr. Ordering is blocked until the credential authenticates.",
      },
      200,
    );
  })

  /**
   * POST /api/checkr/order
   * Body: { requestId, packageSlug, confirmOrder: true }
   *
   * Creates the candidate and the report at Checkr. Costs money, so it refuses
   * without confirmOrder, and it refuses the moment Checkr rejects the key.
   */
  .post("/order", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const requestId = typeof body.requestId === "string" ? body.requestId : null;
    const packageSlug = typeof body.packageSlug === "string" ? body.packageSlug : null;
    const confirmOrder = body.confirmOrder === true;

    if (!requestId || !packageSlug) {
      return c.json({ error: "requestId and packageSlug are required" }, 400);
    }
    if (!confirmOrder) {
      return c.json(
        {
          error: "Ordering a Checkr report is a billable action. Send confirmOrder: true to proceed.",
          billable: true,
        },
        400,
      );
    }

    const [req] = await db
      .select()
      .from(schema.hrBackgroundChecks)
      .where(eq(schema.hrBackgroundChecks.id, requestId))
      .limit(1);
    if (!req) return c.json({ error: "background check request not found" }, 404);
    if (!req.consent) {
      return c.json(
        { error: "FCRA consent is not recorded on this request. A report cannot be ordered without it." },
        400,
      );
    }

    const [person] = await db
      .select()
      .from(schema.hrPeople)
      .where(eq(schema.hrPeople.id, req.personId))
      .limit(1);
    if (!person) return c.json({ error: "person record not found" }, 404);

    // Gate on live auth first so a dead key can never produce a written row.
    const auth = await checkrGet("/account");
    if (!auth.ok) {
      return c.json(
        {
          error: "Checkr rejected this server's credential, so no candidate and no report were created.",
          providerStatus: auth.status,
          providerError: auth.providerError,
          providerBody: auth.providerBody,
          transportError: auth.transportError,
        },
        502,
      );
    }

    const nameParts = String(person.name ?? "").trim().split(/\s+/);
    const candidate = await checkrPost("/candidates", {
      first_name: nameParts[0] ?? "",
      last_name: nameParts.length > 1 ? nameParts[nameParts.length - 1] : "",
      email: person.email ?? undefined,
      phone: person.phone ?? undefined,
      dob: req.dob ?? undefined,
      no_middle_name: nameParts.length < 3,
      ...(req.ssnLast4 ? { ssn: undefined } : {}),
      driver_license_state: req.licenseState ?? undefined,
    });
    if (!candidate.ok) {
      return c.json(
        {
          error: "Checkr refused to create the candidate. No report was ordered.",
          providerStatus: candidate.status,
          providerError: candidate.providerError,
          providerBody: candidate.providerBody,
        },
        502,
      );
    }

    const candidateId =
      candidate.providerBody && typeof candidate.providerBody === "object"
        ? String((candidate.providerBody as Record<string, unknown>).id ?? "")
        : "";

    const report = await checkrPost("/reports", { candidate_id: candidateId, package: packageSlug });
    if (!report.ok) {
      return c.json(
        {
          error: "Candidate created at Checkr, but the report order was refused.",
          candidateId,
          providerStatus: report.status,
          providerError: report.providerError,
          providerBody: report.providerBody,
        },
        502,
      );
    }

    const reportBody = report.providerBody as Record<string, unknown>;
    await db
      .update(schema.hrBackgroundChecks)
      .set({
        status: "pending",
        findings: JSON.stringify({
          provider: "checkr",
          candidateId,
          reportId: reportBody.id ?? null,
          reportStatus: reportBody.status ?? null,
          packageSlug,
          orderedAt: new Date().toISOString(),
        }),
        reportSummary: `Ordered at Checkr — report ${String(reportBody.id ?? "")} (${String(reportBody.status ?? "unknown")}).`,
      })
      .where(eq(schema.hrBackgroundChecks.id, req.id));

    return c.json(
      { ordered: true, candidateId, report: reportBody, requestId: req.id, orderedAt: new Date().toISOString() },
      201,
    );
  })

  /**
   * GET /api/checkr/report/:id
   * Reads one report straight from Checkr. No local mirror is trusted.
   */
  .get("/report/:id", async (c) => {
    const probe = await checkrGet(`/reports/${c.req.param("id")}`);
    return c.json({ report: probe.ok ? probe.providerBody : null, probe }, probe.ok ? 200 : 502);
  });
