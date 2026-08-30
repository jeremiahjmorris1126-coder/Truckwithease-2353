// Dispatch Compliance Intelligence — thin client over the real server API.
//
// The original version of this file ran the rule table in the browser, covered
// 8 states, and wrote every check to a PocketBase collection
// (`dispatch_compliance_log`) that never existed — so nothing was ever saved.
// Original preserved at docs/launch/dispatchComplianceIntel.ORIGINAL.js.txt.
//
// Now: 45 states server-side, checks persisted, exports unchanged so
// DispatchCorePage.jsx needs no edits.

async function api(path, options) {
  const res = await fetch(`/api/dispatch${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { error: body.error || `Request failed (${res.status})`, ...body };
  return body;
}

export async function getComplianceRulesForLocation(state) {
  if (!state) return { error: "State not found", state };
  return api(`/rules/${encodeURIComponent(String(state).toUpperCase())}`);
}

export async function checkDispatchCompliance(loadData) {
  const out = await api("/check", { method: "POST", body: JSON.stringify(loadData || {}) });
  if (out.error) return { error: out.error, alerts: [] };
  return out;
}

export async function getTaxCostForRoute(originState, destState, loadValue, distance) {
  const out = await api("/tax", {
    method: "POST",
    body: JSON.stringify({ originState, destState, loadValue, distance }),
  });
  return out.error ? null : out;
}

/**
 * Compat no-op. The server persists every check inside POST /api/dispatch/check,
 * so a second write from the browser would duplicate the row.
 */
export async function logComplianceCheck(loadId, driverId, complianceData) {
  return { logged: true, byServer: true, loadId, driverId, status: complianceData?.complianceStatus ?? null };
}

export async function getComplianceHistory(driverId) {
  return api(`/history${driverId ? `?driverId=${encodeURIComponent(driverId)}` : ""}`);
}

export default {
  getComplianceRulesForLocation,
  checkDispatchCompliance,
  getTaxCostForRoute,
  logComplianceCheck,
  getComplianceHistory,
};
