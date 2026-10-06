import { Hono } from "hono";

/**
 * Fleetio — fleet maintenance system of record.
 *
 * Built 2026-08-28 after the credentials Jeremiah pasted were tested live
 * against Fleetio before a single line of this file was written:
 *
 *   GET https://secure.fleetio.com/api/v1/accounts   -> 200
 *     account 721469 "Truckwithease", Lake Saint Louis MO, user_type owner
 *   GET /api/v1/vehicles?per_page=2                  -> 200, 8 vehicles
 *   GET /api/v1/issues?per_page=2                    -> 200, 6 issues
 *   GET /api/v1/service_reminders?per_page=2         -> 200, 11 reminders
 *   GET /api/v1/work_orders?per_page=2               -> 200, 0 work orders
 *
 * TWO headers are required on every call except /accounts:
 *   Authorization: Token <FLEETIO_API_KEY>
 *   Account-Token: <FLEETIO_ACCOUNT_TOKEN>
 * He sent only the API key. The account token (31a4106e2e) was read off the
 * /accounts response, which is the one endpoint that does not require it.
 *
 * HONESTY NOTES THAT MUST STAY IN THE UI
 *   - Most vehicles in this Fleetio account carry is_sample = true. They are
 *     Fleetio's own demo fleet (a Hyster forklift, a Utility reefer). This
 *     route reports isSample per vehicle and counts samples separately so no
 *     page can present demo equipment as his fleet.
 *   - Nothing here is cached or written to our database. Every response is a
 *     live read-through to Fleetio. If Fleetio is down or the key is revoked,
 *     the endpoint returns the vendor's own status and message — it never
 *     falls back to invented data.
 *   - The Fleetio vehicle list and our own `drivers` / `maintenance` tables
 *     are NOT linked yet. There is no shared identifier. Do not imply one.
 */

const BASE = "https://secure.fleetio.com/api/v1";
const TIMEOUT_MS = 15000;

const clean = (k: string) => String(process.env[k] ?? "").replace(/"/g, "").trim();

export const fleetioApiKey = () => clean("FLEETIO_API_KEY");
export const fleetioAccountToken = () => clean("FLEETIO_ACCOUNT_TOKEN");
export const fleetioConfigured = () => Boolean(fleetioApiKey());

export function fleetioInfo() {
  const key = fleetioApiKey();
  const acct = fleetioAccountToken();
  const blockers: string[] = [];
  if (!key) blockers.push("FLEETIO_API_KEY is not set.");
  if (!acct) blockers.push("FLEETIO_ACCOUNT_TOKEN is not set — every endpoint except /accounts needs it.");
  return {
    provider: "fleetio",
    apiKeyPresent: Boolean(key),
    accountTokenPresent: Boolean(acct),
    configured: Boolean(key && acct),
    blockers,
  };
}

type FleetioCall = { ok: boolean; status: number; body: any; detail: string };

async function call(path: string, opts: { needsAccount?: boolean } = {}): Promise<FleetioCall> {
  const key = fleetioApiKey();
  const acct = fleetioAccountToken();
  const needsAccount = opts.needsAccount !== false;
  if (!key) return { ok: false, status: 0, body: null, detail: "FLEETIO_API_KEY is not set." };
  if (needsAccount && !acct) return { ok: false, status: 0, body: null, detail: "FLEETIO_ACCOUNT_TOKEN is not set." };

  const headers: Record<string, string> = {
    Authorization: `Token ${key}`,
    Accept: "application/json",
  };
  if (needsAccount) headers["Account-Token"] = acct;

  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(`${BASE}${path}`, { headers, signal: ctl.signal });
    const text = await r.text();
    let body: any = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }
    if (!r.ok) {
      const msg =
        (body && (body.error || body.message || (Array.isArray(body.errors) ? body.errors.join("; ") : null))) ||
        `Fleetio returned HTTP ${r.status}.`;
      return { ok: false, status: r.status, body, detail: String(msg) };
    }
    return { ok: true, status: r.status, body, detail: "OK" };
  } catch (e: any) {
    const detail = e?.name === "AbortError" ? `Fleetio did not answer within ${TIMEOUT_MS}ms.` : String(e?.message ?? e);
    return { ok: false, status: 0, body: null, detail };
  } finally {
    clearTimeout(t);
  }
}

/** Fleetio returns either a bare array or a cursor envelope with `records`. */
function records(body: any): any[] {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.records)) return body.records;
  return [];
}

const num = (v: any) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** Probe used by /api/integrations. Hits the one endpoint that needs no account token. */
export async function verifyFleetio(): Promise<{ ok: boolean; status: number | null; detail: string }> {
  const r = await call("/accounts", { needsAccount: false });
  if (!r.ok) return { ok: false, status: r.status || null, detail: r.detail };
  const rows = records(r.body);
  if (!rows.length) return { ok: false, status: r.status, detail: "Key accepted but no Fleetio account is attached to it." };
  const names = rows.map((a: any) => `${a.name ?? "unnamed"} (id ${a.id})`).join(", ");
  const acct = fleetioAccountToken();
  const matched = rows.some((a: any) => String(a.token ?? "") === acct);
  return {
    ok: true,
    status: r.status,
    detail: `Key accepted. ${rows.length} account(s): ${names}.${
      acct ? (matched ? " The configured Account-Token matches one of them." : " WARNING: the configured Account-Token does not match any account on this key.") : " No Account-Token configured yet."
    }`,
  };
}

export const fleetio = new Hono()
  .get("/status", async (c) => {
    const info = fleetioInfo();
    if (!info.apiKeyPresent) {
      return c.json({
        ...info,
        accounts: [],
        note: "Fleetio is not configured. No call was made.",
      });
    }
    const r = await call("/accounts", { needsAccount: false });
    return c.json({
      ...info,
      live: r.ok,
      httpStatus: r.status || null,
      detail: r.detail,
      accounts: records(r.body).map((a: any) => ({
        id: a.id,
        name: typeof a.name === "string" ? a.name.trim() : a.name,
        token: a.token,
        userType: a.user_type,
        city: a.city,
        region: a.region,
        country: a.country,
        isConfiguredAccount: String(a.token ?? "") === fleetioAccountToken(),
      })),
      note: "Read-through to Fleetio. Nothing is cached and nothing is written to our database. The account token is not a secret — it identifies which Fleetio account a call applies to and Fleetio shows it in the API key screen.",
    });
  })

  .get("/vehicles", async (c) => {
    const r = await call("/vehicles?per_page=100");
    if (!r.ok) return c.json({ error: r.detail, httpStatus: r.status || null }, 502);
    const rows = records(r.body).map((v: any) => ({
      id: v.id,
      name: v.name,
      status: v.vehicle_status_name,
      type: v.vehicle_type_name,
      group: v.group_name,
      ownership: v.ownership,
      make: v.make ?? null,
      model: v.model ?? null,
      year: v.year ?? null,
      vin: v.vin ?? null,
      licensePlate: v.license_plate ?? null,
      primaryMeter: num(v.primary_meter_value),
      primaryMeterUnit: v.primary_meter_unit ?? null,
      isSample: Boolean(v.is_sample),
      archivedAt: v.archived_at ?? null,
    }));
    return c.json({
      vehicles: rows,
      counts: {
        total: rows.length,
        sample: rows.filter((v) => v.isSample).length,
        real: rows.filter((v) => !v.isSample).length,
        active: rows.filter((v) => String(v.status ?? "").toLowerCase() === "active").length,
      },
      note: "isSample = true means this is Fleetio's built-in demo equipment, not Jeremiah's fleet. Sample rows are counted separately and must never be presented as real vehicles.",
      source: "fleetio",
      fetchedAt: new Date().toISOString(),
    });
  })

  .get("/issues", async (c) => {
    const r = await call("/issues?per_page=100");
    if (!r.ok) return c.json({ error: r.detail, httpStatus: r.status || null }, 502);
    const rows = records(r.body).map((i: any) => ({
      id: i.id,
      number: i.number,
      name: i.name,
      summary: i.summary,
      description: i.description,
      state: i.state,
      vehicleId: i.vehicle_id ?? null,
      vehicleName: i.vehicle_name ?? null,
      reportedAt: i.reported_at ?? null,
      reportedByName: i.reported_by_name ?? null,
      dueDate: i.due_date ?? null,
      assignedToName: i.assigned_contact_full_name ?? null,
      overdue: Boolean(i.overdue),
    }));
    const byState: Record<string, number> = {};
    for (const i of rows) byState[String(i.state ?? "unknown")] = (byState[String(i.state ?? "unknown")] ?? 0) + 1;
    return c.json({
      issues: rows,
      counts: { total: rows.length, open: rows.filter((i) => String(i.state).toLowerCase() === "open").length, byState },
      source: "fleetio",
      fetchedAt: new Date().toISOString(),
    });
  })

  .get("/service-reminders", async (c) => {
    const r = await call("/service_reminders?per_page=100");
    if (!r.ok) return c.json({ error: r.detail, httpStatus: r.status || null }, 502);
    const rows = records(r.body).map((s: any) => ({
      id: s.id,
      active: Boolean(s.active),
      vehicleId: s.vehicle_id ?? null,
      task: s.service_task_name ?? null,
      status: s.service_reminder_status_name ?? null,
      nextDueAt: s.next_due_at ?? null,
      dueSoonAt: s.due_soon_at ?? null,
      timeInterval: s.time_interval ?? null,
      timeFrequency: s.time_frequency ?? null,
      meterRemaining: num(s.meter_remaining_until_due),
      snoozeUntil: s.snooze_until ?? null,
    }));
    const byStatus: Record<string, number> = {};
    for (const s of rows) byStatus[String(s.status ?? "unknown")] = (byStatus[String(s.status ?? "unknown")] ?? 0) + 1;
    return c.json({
      reminders: rows,
      counts: {
        total: rows.length,
        active: rows.filter((s) => s.active).length,
        overdue: rows.filter((s) => String(s.status).toLowerCase() === "overdue").length,
        dueSoon: rows.filter((s) => String(s.status).toLowerCase() === "due_soon").length,
        byStatus,
      },
      source: "fleetio",
      fetchedAt: new Date().toISOString(),
    });
  })

  .get("/work-orders", async (c) => {
    const r = await call("/work_orders?per_page=100");
    if (!r.ok) return c.json({ error: r.detail, httpStatus: r.status || null }, 502);
    const rows = records(r.body).map((w: any) => ({
      id: w.id,
      number: w.number ?? null,
      state: w.state ?? null,
      vehicleId: w.vehicle_id ?? null,
      issuedAt: w.issued_at ?? null,
      startedAt: w.started_at ?? null,
      completedAt: w.completed_at ?? null,
      totalAmount: num(w.total_amount_cents) === null ? null : (num(w.total_amount_cents) as number) / 100,
    }));
    return c.json({
      workOrders: rows,
      counts: { total: rows.length },
      note: rows.length === 0 ? "Fleetio answered with zero work orders. That is a real empty list, not a failure." : undefined,
      source: "fleetio",
      fetchedAt: new Date().toISOString(),
    });
  })

  /** One call for a maintenance dashboard. Every section reports its own failure. */
  .get("/summary", async (c) => {
    const info = fleetioInfo();
    if (!info.configured) {
      return c.json({ ...info, live: false, note: "Fleetio is not fully configured, so no call was made.", sections: {} });
    }
    const [veh, iss, rem, wo] = await Promise.all([
      call("/vehicles?per_page=100"),
      call("/issues?per_page=100"),
      call("/service_reminders?per_page=100"),
      call("/work_orders?per_page=100"),
    ]);

    const vRows = records(veh.body);
    const iRows = records(iss.body);
    const rRows = records(rem.body);
    const wRows = records(wo.body);

    const section = (r: FleetioCall, value: any) =>
      r.ok ? { ok: true, ...value } : { ok: false, error: r.detail, httpStatus: r.status || null };

    return c.json({
      ...info,
      live: veh.ok || iss.ok || rem.ok || wo.ok,
      sections: {
        vehicles: section(veh, {
          total: vRows.length,
          sample: vRows.filter((v: any) => v.is_sample).length,
          real: vRows.filter((v: any) => !v.is_sample).length,
          active: vRows.filter((v: any) => String(v.vehicle_status_name ?? "").toLowerCase() === "active").length,
        }),
        issues: section(iss, {
          total: iRows.length,
          open: iRows.filter((i: any) => String(i.state ?? "").toLowerCase() === "open").length,
          overdue: iRows.filter((i: any) => Boolean(i.overdue)).length,
        }),
        serviceReminders: section(rem, {
          total: rRows.length,
          overdue: rRows.filter((s: any) => String(s.service_reminder_status_name ?? "").toLowerCase() === "overdue").length,
          dueSoon: rRows.filter((s: any) => String(s.service_reminder_status_name ?? "").toLowerCase() === "due_soon").length,
        }),
        workOrders: section(wo, { total: wRows.length }),
      },
      note: "Live read-through to Fleetio on every request. Sample vehicles are Fleetio demo equipment and are counted apart from real ones. Fleetio vehicles are NOT linked to our drivers or maintenance tables — there is no shared identifier yet.",
      source: "fleetio",
      fetchedAt: new Date().toISOString(),
    });
  });
