/**
 * Load Board Licensing — client wrapper around the real server API.
 *
 * The original version of this file (preserved at
 * docs/launch/loadBoardLicensing.ORIGINAL.js.txt) talked to PocketBase in 12
 * places against collections that exist on no server, and it invented DAT and
 * Uber Freight usernames, passwords and license keys in the browser. Those
 * credentials logged nobody into anything — TruckWithEase has no reseller or
 * API agreement with DAT, Uber Freight or Truckstop.
 *
 * Everything here now goes to /api/licensing (Hono + Turso). Export names and
 * signatures are unchanged so callers keep working.
 *
 * What no longer happens, on purpose:
 *  - No password or license key is generated. Real load board credentials go
 *    through /api/vault and this table stores only a `credentialRef`.
 *  - Nothing is marked `active` automatically. A seat is created `pending`;
 *    activating it requires a credentialRef or a named person who confirmed
 *    the account exists.
 *  - Nothing is purchased or billed. Every response carries `purchased: false`
 *    or `charged: false`.
 */

const BASE = "/api/licensing";

async function call(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    const msg = (body && (body.error || body.message)) || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return body;
}

/** Not supported yet — returned instead of pretending an action happened. */
function unsupported(what, why) {
  const note = `${what} is not wired to a server yet. ${why}`;
  console.warn(`[loadBoardLicensing] ${note}`);
  return { supported: false, changed: false, charged: false, note };
}

/**
 * Create load board seats for a driver.
 * Creates one PENDING seat per service. No account is purchased, no username
 * or password is generated, nothing is emailed.
 */
export async function purchaseLoadBoardLicense(userId, plan) {
  const services = ["dat", "uber_freight"];
  const created = [];
  for (const service of services) {
    const out = await call("/", {
      method: "POST",
      body: JSON.stringify({
        driverId: userId,
        service,
        days: 30,
        notes: plan ? `Requested with plan: ${plan}` : null,
      }),
    });
    created.push(out);
  }
  return {
    dat: created[0]?.license ?? null,
    uber: created[1]?.license ?? null,
    purchased: false,
    reseller: created[0]?.reseller ?? null,
    note: "Seats recorded as pending. No DAT or Uber Freight account was bought or provisioned — TruckWithEase has no reseller agreement with either.",
  };
}

/**
 * Emailing credentials is deliberately gone.
 * Credentials are never generated here, so there is nothing to send. Real
 * credentials belong in /api/vault and are handed over by a human.
 */
export async function sendLicenseCredentials(email, credentials) {
  return unsupported(
    "Emailing load board credentials",
    "This app does not generate load board logins, so it has none to send. Store real credentials with /api/vault and share them out of band.",
  );
}

/** Record a load board login reported by the client. */
export async function trackLoadBoardLogin(userId, service, success = true) {
  const { licenses = [] } = await call(
    `/list?driverId=${encodeURIComponent(userId)}&service=${encodeURIComponent(service)}`,
  );
  const license = licenses[0];
  if (!license) throw new Error(`No ${service} seat on record for this driver.`);
  const out = await call(`/${license.id}/login`, { method: "POST", body: JSON.stringify({ success }) });
  return { ...license, loginCount: out.loginCount, verifiedWithProvider: false, note: out.note };
}

/** All seats on record for a driver. */
export async function getUserLoadBoardLicenses(userId) {
  const { licenses = [], reseller } = await call(`/list?driverId=${encodeURIComponent(userId)}`);
  return licenses.map((l) => ({
    id: l.id,
    service: l.service,
    status: l.status,
    username: l.username || null,
    hasCredential: Boolean(l.hasCredential),
    licenseKey: null,
    expiryDate: l.expiresAt,
    expired: Boolean(l.expired),
    loginCount: l.loginCount,
    lastLogin: l.lastLoginAt,
    daysRemaining: calculateDaysRemaining(l.expiresAt),
    reseller,
  }));
}

function calculateDaysRemaining(expiryDate) {
  if (!expiryDate) return 0;
  const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
  return Number.isFinite(days) ? Math.max(days, 0) : 0;
}

/** Extend a seat's expiry. Nothing is billed and no subscription is renewed. */
export async function renewLoadBoardLicense(licenseId, days = 30) {
  const out = await call(`/${licenseId}/renew`, { method: "POST", body: JSON.stringify({ days }) });
  return out.license;
}

/** Revoke a seat in our records only. The load board is not contacted. */
export async function revokeLicense(licenseId, reason = "manual_revoke") {
  const out = await call(`/${licenseId}/status`, {
    method: "POST",
    body: JSON.stringify({ status: "revoked", reason }),
  });
  return out.license;
}

/**
 * Assign a seat to a fleet driver.
 * Seat-limit enforcement is not implemented: there is no fleet_profiles table
 * with per-fleet seat caps, so no limit is invented here.
 */
export async function addFleetDriverLicense(fleetId, driverId, service = "dat") {
  const svc = service === "both" ? "dat" : service;
  const out = await call("/", {
    method: "POST",
    body: JSON.stringify({ driverId, fleetId, service: svc, days: 365 }),
  });
  return { ...out.license, seatLimitEnforced: false, purchased: false };
}

/** Fleet view of every seat on record. Seat caps are not tracked. */
export async function getFleetLoadBoardDashboard(fleetId) {
  const { licenses = [], reseller } = await call("/list");
  const mine = licenses.filter((l) => l.fleetId === fleetId);
  const shape = (svc) => {
    const rows = mine.filter((l) => l.service === svc);
    return {
      active: rows.filter((l) => l.status === "active").length,
      pending: rows.filter((l) => l.status === "pending").length,
      total: rows.length,
      drivers: rows.map((l) => ({
        id: l.id,
        driverId: l.driverId,
        username: l.username || null,
        status: l.status,
        lastLogin: l.lastLoginAt,
        loginCount: l.loginCount,
      })),
    };
  };
  return {
    fleet_id: fleetId,
    dat_usage: shape("dat"),
    uber_usage: shape("uber_freight"),
    seatLimits: null,
    reseller,
    note: "Seat caps are not tracked — there is no fleet seat-limit table. Counts above are seats recorded in TruckWithEase, not accounts confirmed with any load board.",
  };
}

/**
 * Buying more seats is deliberately gone.
 * The original charged $15/seat against a payment path that does not exist and
 * raised the fleet's limit anyway.
 */
export async function upgradeFleetSeats(fleetId, service, additionalSeats, costPerSeat = 15) {
  return unsupported(
    "Buying additional load board seats",
    "There is no reseller agreement and no live payment provider, so no seat can be bought and nothing was charged.",
  );
}

/**
 * Audit logging is deliberately gone.
 * There is no load_board_audit_log table; silently swallowing writes into one
 * would make the audit trail look real when it is empty.
 */
export async function logLicenseEvent(userId, eventType, eventData) {
  console.info(`[loadBoardLicensing] ${eventType} for ${userId}`, eventData);
  return { logged: false, note: "No audit table exists yet — event written to the console only." };
}

export default {
  purchaseLoadBoardLicense,
  sendLicenseCredentials,
  trackLoadBoardLogin,
  getUserLoadBoardLicenses,
  renewLoadBoardLicense,
  revokeLicense,
  addFleetDriverLicense,
  getFleetLoadBoardDashboard,
  upgradeFleetSeats,
  logLicenseEvent,
};
