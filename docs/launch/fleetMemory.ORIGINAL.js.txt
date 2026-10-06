/**
 * Fleet Memory Intelligence — shared utility
 * Logs user/fleet actions, surfaces warnings for known bad brokers/shippers/receivers,
 * and aggregates cross-fleet charge stop intelligence.
 *
 * Import { logAction, checkEntityWarnings, submitEntityNote, getTopStops, logStopRating }
 * from '../lib/fleetMemory'
 */
import { pb } from './pb.js';

function getSessionId() {
  let sid = localStorage.getItem('twe_session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('twe_session_id', sid);
  }
  return sid;
}

/**
 * Log any user action across the platform.
 * module: 'Dispatch', 'Load Board', 'Route Planner', 'ELD', etc.
 * actionType: 'VIEW', 'SEARCH', 'SUBMIT', 'RATE', 'PLAN', 'SAVE', etc.
 */
export async function logAction(module, actionType, detail = '', value = '') {
  try {
    await pb.collection('user_activity_index').create({
      session_id: getSessionId(),
      action_type: actionType,
      module,
      detail: detail.slice(0, 200),
      value: String(value).slice(0, 100),
      device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
      duration_seconds: 0,
    });
  } catch (_) {}
}

/**
 * Check if a broker, shipper, or receiver has any previous complaints or negative ratings.
 * Returns { hasWarnings, notes, ratings, worstSeverity }
 */
export async function checkEntityWarnings(entityName) {
  if (!entityName || entityName.trim().length < 2) return { hasWarnings: false, notes: [], ratings: [] };
  const name = entityName.trim().toLowerCase();
  try {
    const [notesRes, ratingsRes] = await Promise.all([
      pb.collection('fleet_intelligence_notes').getList(1, 50, {
        filter: `entity_name ~ "${name}"`,
        sort: '-created',
      }).catch(() => ({ items: [] })),
      pb.collection('shipper_broker_ratings').getList(1, 50, {
        filter: `company_name ~ "${name}"`,
        sort: 'rating',
      }).catch(() => ({ items: [] })),
    ]);

    const notes = notesRes.items || [];
    const ratings = ratingsRes.items || [];
    const negRatings = ratings.filter(r => r.rating <= 2);
    const hasWarnings = notes.length > 0 || negRatings.length > 0;

    let worstSeverity = 'none';
    if (notes.some(n => n.severity === 'Critical')) worstSeverity = 'critical';
    else if (negRatings.length >= 2 || notes.some(n => n.severity === 'High')) worstSeverity = 'high';
    else if (notes.length > 0 || negRatings.length > 0) worstSeverity = 'medium';

    return { hasWarnings, notes, ratings, negRatings, worstSeverity };
  } catch (_) {
    return { hasWarnings: false, notes: [], ratings: [], negRatings: [], worstSeverity: 'none' };
  }
}

/**
 * Submit a fleet intelligence note (comment/complaint) about a broker, shipper, or receiver.
 */
export async function submitEntityNote({ entityName, entityType, noteType, severity, noteText, fleetName = '', driverName = '', loadNumber = '', mcNumber = '' }) {
  await pb.collection('fleet_intelligence_notes').create({
    entity_name: entityName,
    entity_type: entityType,
    note_type: noteType,
    severity,
    note_text: noteText,
    fleet_name: fleetName,
    driver_name: driverName,
    load_number: loadNumber,
    mc_number: mcNumber,
    resolved: false,
    session_id: getSessionId(),
  });
}

/**
 * Get top-rated charge stops across all fleets (aggregated from route_stop_feedback).
 * Returns array sorted by avg positive score, highest first.
 */
export async function getTopStops(vehicleType = null, limit = 10) {
  try {
    const filter = vehicleType ? `vehicle_type = "${vehicleType}"` : '';
    const res = await pb.collection('route_stop_feedback').getList(1, 500, {
      filter,
      sort: '-created',
    });

    const agg = {};
    res.items.forEach(item => {
      const k = item.stop_name;
      if (!k) return;
      if (!agg[k]) agg[k] = { stop_name: k, vehicle_type: item.vehicle_type, pos: 0, neg: 0, total: 0 };
      if (item.rating > 0) agg[k].pos++;
      else if (item.rating < 0) agg[k].neg++;
      agg[k].total++;
    });

    return Object.values(agg)
      .map(s => ({ ...s, score: s.pos - s.neg, pct: s.total > 0 ? Math.round((s.pos / s.total) * 100) : 50 }))
      .filter(s => s.total > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (_) { return []; }
}

/**
 * Get the most-complained-about entities (brokers/shippers/receivers).
 * Returns array sorted by complaint count, worst first.
 */
export async function getWorstEntities(limit = 10) {
  try {
    const [notesRes, ratingsRes] = await Promise.all([
      pb.collection('fleet_intelligence_notes').getList(1, 500, { sort: '-created' }).catch(() => ({ items: [] })),
      pb.collection('shipper_broker_ratings').getList(1, 500, { sort: 'rating' }).catch(() => ({ items: [] })),
    ]);

    const agg = {};

    (notesRes.items || []).forEach(n => {
      const k = (n.entity_name || '').toLowerCase().trim();
      if (!k) return;
      if (!agg[k]) agg[k] = { name: n.entity_name, type: n.entity_type, complaints: 0, negRatings: 0, notes: [] };
      agg[k].complaints++;
      agg[k].notes.push(n);
    });

    (ratingsRes.items || []).filter(r => r.rating <= 2).forEach(r => {
      const k = (r.company_name || '').toLowerCase().trim();
      if (!k) return;
      if (!agg[k]) agg[k] = { name: r.company_name, type: r.company_type, complaints: 0, negRatings: 0, notes: [] };
      agg[k].negRatings++;
    });

    return Object.values(agg)
      .map(e => ({ ...e, totalFlags: e.complaints + e.negRatings }))
      .filter(e => e.totalFlags > 0)
      .sort((a, b) => b.totalFlags - a.totalFlags)
      .slice(0, limit);
  } catch (_) { return []; }
}

/**
 * Log a charge stop rating and update fleet_stop_intelligence aggregates.
 */
export async function logStopRating(stopName, vehicleType, rating, origin = '', dest = '') {
  const sid = getSessionId();
  await pb.collection('route_stop_feedback').create({
    session_id: sid,
    stop_name: stopName,
    vehicle_type: vehicleType,
    rating,
    route_origin: origin,
    route_dest: dest,
  });
}
