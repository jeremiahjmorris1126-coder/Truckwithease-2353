/**
 * Fleet Memory — client for /api/fleet-memory.
 *
 * WHAT CHANGED AND WHY
 * The previous version of this file wrote every driver-submitted note, rating and stop
 * review through the PocketBase browser shim to four collections:
 *   user_activity_index, fleet_intelligence_notes, shipper_broker_ratings, route_stop_feedback
 * None of those were in SERVER_COLLECTIONS (src/web/lib/pb-shim.ts), so all four resolved
 * to localStorage. A note a driver filed about a broker was saved to that one browser and
 * nowhere else, and checkEntityWarnings() returned "no warnings" for every broker on every
 * other device — DispatchPage and FleetLoadBoardPage were showing a clean broker check that
 * had checked nothing.
 *
 * All six exports keep their exact signatures. They now hit real Turso tables through the API.
 *
 * IMPORTANT for callers: hasWarnings === false does NOT mean the entity is clean. Read
 * reportCount and note. Zero reports means nobody has reported anything. This platform does
 * not rate brokers.
 */

const API = "/api/fleet-memory";

function getSessionId() {
  let sid = localStorage.getItem('twe_session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('twe_session_id', sid);
  }
  return sid;
}

async function post(path, body) {
  const res = await fetch(API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, sessionId: getSessionId() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

async function get(path) {
  const res = await fetch(API + path);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

/**
 * Log any user action across the platform. Fire-and-forget; never blocks a page.
 * module: 'Dispatch', 'Load Board', 'Route Planner', 'ELD', etc.
 * actionType: 'VIEW', 'SEARCH', 'SUBMIT', 'RATE', 'PLAN', 'SAVE', etc.
 */
export async function logAction(module, actionType, detail = '', value = '') {
  try {
    await post('/activity', {
      module,
      actionType,
      detail: String(detail).slice(0, 200),
      value: String(value).slice(0, 100),
      device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
    });
  } catch (_) {}
}

/**
 * Look up driver-submitted reports on a broker, shipper, or receiver.
 * Returns { hasWarnings, notes, ratings, negRatings, worstSeverity, reportCount, note, unavailable }
 *
 * reportCount === 0 means no driver has reported anything on that name. It is not a clean
 * record and must not be rendered as one. `unavailable: true` means the lookup itself failed —
 * also not a clean record.
 */
export async function checkEntityWarnings(entityName) {
  const empty = {
    hasWarnings: false, notes: [], ratings: [], negRatings: [], worstSeverity: 'none',
    reportCount: 0, note: '', unavailable: false,
  };
  if (!entityName || entityName.trim().length < 2) {
    return { ...empty, note: 'Enter at least 2 characters to look up a company.' };
  }
  try {
    const d = await get(`/entity/${encodeURIComponent(entityName.trim())}`);
    return {
      hasWarnings: !!d.hasWarnings,
      notes: d.notes || [],
      ratings: d.ratings || [],
      negRatings: d.negRatings || [],
      worstSeverity: d.worstSeverity || 'none',
      reportCount: d.reportCount ?? 0,
      note: d.note || '',
      unavailable: false,
    };
  } catch (_) {
    return {
      ...empty,
      unavailable: true,
      note: 'Broker check could not reach the server. This is NOT a clean result — nothing was checked.',
    };
  }
}

/**
 * File a fleet intelligence note (complaint/comment) about a broker, shipper, or receiver.
 * Throws on failure so the UI can tell the driver it was not saved.
 */
export async function submitEntityNote({ entityName, entityType, noteType, severity, noteText, fleetName = '', driverName = '', loadNumber = '', mcNumber = '' }) {
  return post('/notes', { entityName, entityType, noteType, severity, noteText, fleetName, driverName, loadNumber, mcNumber });
}

/**
 * Recent notes + ratings feed. Returns { notes, ratings, total }.
 */
export async function getRecentIntel(limit = 30) {
  try {
    const d = await get(`/notes?limit=${limit}`);
    return { notes: d.notes || [], ratings: d.ratings || [], total: d.total || 0 };
  } catch (_) {
    return { notes: [], ratings: [], total: 0, unavailable: true };
  }
}

/**
 * Submit a 1-5 star rating on a broker/shipper.
 */
export async function submitEntityRating({ companyName, companyType = 'Broker', rating, paySpeed = '', communication = '', reviewText = '', mcNumber = '' }) {
  return post('/ratings', { companyName, companyType, rating, paySpeed, communication, reviewText, mcNumber });
}

/**
 * Stops ranked by driver feedback. A stop needs at least 3 reports before it is ranked at all —
 * one thumbs-up is not a recommendation. Returns an array (same shape as before) with
 * `.meta` attached carrying totalReports, stopsBelowThreshold, minReports and a note.
 */
export async function getTopStops(vehicleType = null, limit = 10) {
  try {
    const qs = new URLSearchParams({ limit: String(limit) });
    if (vehicleType) qs.set('vehicleType', vehicleType);
    const d = await get(`/stops?${qs.toString()}`);
    const stops = (d.stops || []).map((s) => ({
      stop_name: s.stopName,
      vehicle_type: s.vehicleType,
      pos: s.pos,
      neg: s.neg,
      total: s.total,
      score: s.score,
      pct: s.pct, // null when below the report threshold — never a made-up number
    }));
    stops.meta = {
      totalReports: d.totalReports || 0,
      stopsBelowThreshold: d.stopsBelowThreshold || 0,
      minReports: d.minReports ?? 3,
      note: d.note || '',
    };
    return stops;
  } catch (_) {
    const out = [];
    out.meta = { totalReports: 0, stopsBelowThreshold: 0, minReports: 3, note: 'Stop feedback could not be loaded.', unavailable: true };
    return out;
  }
}

/**
 * Entities with the most driver flags. Counted, not scored.
 * Returns an array with `.meta` carrying totalReports and a note.
 */
export async function getWorstEntities(limit = 10) {
  try {
    const d = await get(`/worst-entities?limit=${limit}`);
    const entities = (d.entities || []).slice();
    entities.meta = { totalReports: d.totalReports || 0, note: d.note || '' };
    return entities;
  } catch (_) {
    const out = [];
    out.meta = { totalReports: 0, note: 'Flagged entities could not be loaded.', unavailable: true };
    return out;
  }
}

/**
 * Log a charge stop rating: +1 or -1.
 */
export async function logStopRating(stopName, vehicleType, rating, origin = '', dest = '') {
  return post('/stops', { stopName, vehicleType, rating, routeOrigin: origin, routeDest: dest });
}
