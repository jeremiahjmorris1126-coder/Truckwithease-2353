import React, { useState, useEffect } from 'react';
import {
  AlertCircle, Navigation, Zap, MapPin, AlertTriangle, CheckCircle, Phone, MessageSquare, Truck,
} from 'lucide-react';

/**
 * Road Context — rewired to real data.
 *
 * The original page simulated GPS with Math.random() on a 5-second interval, and
 * decided whether a hazard was "nearby" with `return Math.random() > 0.7;`
 * (his own comment: "Simulate finding nearby dangers"). It also read four
 * PocketBase collections that were never created — road_danger_reports,
 * shipper_broker_ratings, route_stop_feedback and user_activity_index — which
 * failed silently and rendered as empty arrays, i.e. "all clear on your route".
 * An empty list that means "we never checked" is worse than no list at all.
 *
 * This version reads GET /api/fleet-intel/road-context/:driverId: the driver's
 * last reported position from the drivers table, their booked load, incidents
 * from accident_reports within 150 straight-line miles, and broker risk flags
 * from broker_verifications. Everything the platform does not collect is
 * rendered explicitly as "not collected", never as "all clear".
 */

const GOLD = '#C9A84C';
const GOLD_BRIGHT = '#FFD700';
const RED = '#E0483B';

const RoadContextPage = () => {
  const [driverId, setDriverId] = useState('drv-1');
  const [drivers, setDrivers] = useState([]);
  const [ctx, setCtx] = useState(null);
  const [error, setError] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    fetch('/api/fleet-intel/hos')
      .then((r) => r.json())
      .then((j) => setDrivers(j.drivers ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch(`/api/fleet-intel/road-context/${driverId}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then((j) => { if (alive) { setCtx(j); setError(null); } })
        .catch((e) => { if (alive) setError(e.message); });
    };
    load();
    const id = setInterval(load, 30000);
    return () => { alive = false; clearInterval(id); };
  }, [driverId]);

  const pos = ctx?.position ?? null;
  const incidents = ctx?.nearbyIncidents ?? [];
  const brokerFlags = ctx?.brokerFlags ?? [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-[#161616] border border-[#222222] rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex-1">
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: GOLD_BRIGHT }}>
                <MapPin className="w-5 h-5" />
                Road Context
              </h2>
              {pos ? (
                <p className="text-xs text-neutral-400 mt-2 font-mono">
                  {pos.lat.toFixed(4)}, {pos.lng.toFixed(4)}
                  {pos.speed != null && ` • ${pos.speed} mph`}
                  {pos.heading != null && ` • heading ${pos.heading}°`}
                  {pos.lastSeen && ` • last seen ${new Date(pos.lastSeen).toLocaleString()}`}
                </p>
              ) : (
                <p className="text-xs text-neutral-500 mt-2">{ctx?.positionNote ?? 'No position on file.'}</p>
              )}
            </div>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="bg-[#0a0a0a] border border-[#222222] rounded px-3 py-2 text-sm"
              style={{ color: GOLD }}
            >
              {drivers.map((d) => (
                <option key={d.driverId} value={d.driverId}>{d.name}</option>
              ))}
              {drivers.length === 0 && <option value={driverId}>{driverId}</option>}
            </select>
          </div>
          {pos && <p className="text-[11px] text-neutral-500 mt-2">{ctx.positionNote}</p>}
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg border text-sm" style={{ borderColor: `${RED}88`, background: `${RED}18` }}>
            Could not load road context: {error}
          </div>
        )}

        {/* Current load */}
        {ctx && (
          ctx.currentLoad ? (
            <div className="bg-[#161616] border rounded-lg p-4 mb-4" style={{ borderColor: GOLD }}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold flex items-center gap-2"><Truck className="w-4 h-4" style={{ color: GOLD }} /> Current Load</h3>
                <span className="text-xs px-2 py-1 rounded" style={{ background: `${GOLD}22`, color: GOLD_BRIGHT }}>
                  {ctx.currentLoad.status ?? 'booked'}
                </span>
              </div>
              <div className="text-sm space-y-1 text-neutral-300">
                <p><strong>{ctx.currentLoad.origin}</strong> → <strong>{ctx.currentLoad.destination}</strong></p>
                <p className="font-mono text-xs">
                  {ctx.currentLoad.miles} mi
                  {ctx.currentLoad.rate != null && ` • $${ctx.currentLoad.rate.toLocaleString()}`}
                  {ctx.currentLoad.miles && ctx.currentLoad.rate
                    ? ` • $${(ctx.currentLoad.rate / ctx.currentLoad.miles).toFixed(2)}/mi`
                    : ''}
                </p>
                {ctx.currentLoad.commodity && <p className="text-xs text-neutral-500">{ctx.currentLoad.commodity}</p>}
              </div>
            </div>
          ) : (
            <div className="bg-[#161616] border border-[#222222] rounded-lg p-4 mb-4 text-center text-sm text-neutral-400">
              No load booked to this driver. Claim one on the Load Board.
            </div>
          )
        )}

        {/* Critical banners */}
        {incidents.length > 0 && (
          <div className="p-4 rounded-lg mb-4 flex items-start gap-3" style={{ background: `${RED}1f`, border: `1px solid ${RED}` }}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: RED }} />
            <div className="flex-1">
              <h3 className="font-bold" style={{ color: RED }}>Incident reported near you</h3>
              <p className="text-sm mt-1 text-neutral-300">
                {incidents[0].description ?? incidents[0].type ?? 'Recorded incident'} — {incidents[0].milesAway} mi away
                (straight line)
              </p>
            </div>
          </div>
        )}

        {brokerFlags.length > 0 && (
          <div className="p-4 rounded-lg mb-4 flex items-start gap-3" style={{ background: `${GOLD}1a`, border: `1px solid ${GOLD}` }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: GOLD_BRIGHT }} />
            <div className="flex-1">
              <h3 className="font-bold" style={{ color: GOLD_BRIGHT }}>Broker risk flags</h3>
              <p className="text-sm mt-1 text-neutral-300">
                {brokerFlags.length} verified broker{brokerFlags.length > 1 ? 's' : ''} scored 40 or higher. Check before
                sending paperwork.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* Incidents */}
            <div className="bg-[#161616] border border-[#222222] rounded-lg p-4">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5" style={{ color: GOLD }} />
                Recorded Incidents Within 150 Miles
              </h3>
              {incidents.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  No incidents on file within 150 miles of the last reported position. This covers accident reports
                  filed in your account only — it is not a public crash or traffic feed.
                </p>
              ) : (
                <div className="space-y-2">
                  {incidents.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAlert(a)}
                      className="w-full text-left p-3 bg-[#0a0a0a] rounded border-l-2 hover:border-[#C9A84C] transition"
                      style={{ borderLeftColor: RED }}
                    >
                      <div className="flex justify-between gap-3">
                        <span className="font-semibold text-sm">{a.type ?? 'Incident'}</span>
                        <span className="text-xs font-mono" style={{ color: GOLD }}>{a.milesAway} mi</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">{a.description ?? a.location ?? '—'}</p>
                      {a.occurredAt && (
                        <p className="text-[11px] text-neutral-600 mt-1">{new Date(a.occurredAt).toLocaleString()}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {ctx?.note && <p className="text-[11px] text-neutral-600 mt-3">{ctx.note}</p>}
            </div>

            {/* Broker flags detail */}
            <div className="bg-[#161616] border border-[#222222] rounded-lg p-4">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5" style={{ color: GOLD }} />
                Broker Risk Flags
              </h3>
              {brokerFlags.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  No broker on file has scored 40 or higher. Run a check on the Broker Verification page before you
                  accept a load from someone new.
                </p>
              ) : (
                <div className="space-y-2">
                  {brokerFlags.map((b) => (
                    <div key={b.id} className="p-3 bg-[#0a0a0a] rounded border border-[#222222]">
                      <div className="flex justify-between gap-3">
                        <span className="font-semibold text-sm">{b.domain ?? b.email}</span>
                        <span className="text-xs font-mono" style={{ color: b.riskScore >= 70 ? RED : GOLD_BRIGHT }}>
                          {b.riskScore} · {b.verdict}
                        </span>
                      </div>
                      {b.mcNumber && <p className="text-[11px] text-neutral-500 mt-1 font-mono">MC {b.mcNumber}</p>}
                      {b.reasons && (
                        <ul className="text-xs text-neutral-400 mt-2 list-disc ml-4 space-y-1">
                          {(() => { try { return JSON.parse(b.reasons); } catch { return [b.reasons]; } })().map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Not collected — replaces the four dead PocketBase reads */}
            {ctx?.unavailable && (
              <div className="bg-[#161616] border border-[#222222] rounded-lg p-4" style={{ borderLeft: `3px solid ${GOLD}` }}>
                <h3 className="font-bold flex items-center gap-2 mb-2" style={{ color: GOLD }}>
                  <AlertCircle className="w-5 h-5" />
                  Not Collected Yet
                </h3>
                <p className="text-xs text-neutral-500 mb-3">
                  These panels used to render empty and read as "all clear". They were never being checked.
                </p>
                <div className="space-y-2">
                  {Object.entries(ctx.unavailable).map(([k, v]) => (
                    <div key={k} className="p-3 bg-[#0a0a0a] rounded text-xs">
                      <div className="font-semibold capitalize mb-1" style={{ color: GOLD_BRIGHT }}>
                        {k.replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div className="text-neutral-400 leading-relaxed">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-[#161616] border border-[#222222] rounded-lg p-4 sticky top-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" style={{ color: GOLD }} />
                Active Alerts
              </h3>
              {incidents.length === 0 && brokerFlags.length === 0 ? (
                <div className="text-center text-neutral-500 text-sm py-4">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#22c55e' }} />
                  <p>Nothing flagged from the data we do collect.</p>
                  <p className="text-[11px] mt-2 text-neutral-600">See "Not Collected Yet" for what is not being checked.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {incidents.slice(0, 3).map((a) => (
                    <div key={a.id} className="p-3 bg-[#0a0a0a] rounded border-l-2 text-sm" style={{ borderLeftColor: RED }}>
                      <div className="font-semibold">{a.type ?? 'Incident'}</div>
                      <div className="text-xs text-neutral-400">{a.milesAway} mi away</div>
                    </div>
                  ))}
                  {brokerFlags.slice(0, 3).map((b) => (
                    <div key={b.id} className="p-3 bg-[#0a0a0a] rounded border-l-2 text-sm" style={{ borderLeftColor: GOLD }}>
                      <div className="font-semibold">{b.domain ?? b.email}</div>
                      <div className="text-xs text-neutral-400">Risk {b.riskScore} · {b.verdict}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-[#222222] space-y-2">
                <a
                  href="tel:6367068338"
                  className="w-full flex items-center justify-center gap-2 py-2 rounded font-semibold text-sm"
                  style={{ background: 'linear-gradient(135deg,#C9A84C 0%,#FFD700 40%,#C9A84C 70%,#8A6E2F 100%)', color: '#0a0a0a' }}
                >
                  <Phone className="w-4 h-4" />
                  Call Support
                </a>
                <a
                  href="/community"
                  className="w-full flex items-center justify-center gap-2 bg-[#222222] text-neutral-200 py-2 rounded font-semibold text-sm hover:bg-[#2a2a2a] transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  Report to Bulletin Board
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedAlert && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setSelectedAlert(null)}>
          <div className="bg-[#161616] border border-[#222222] rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-3" style={{ color: GOLD_BRIGHT }}>
              {selectedAlert.type ?? 'Incident'}
            </h2>
            <p className="text-neutral-300 mb-2 text-sm">{selectedAlert.description ?? '—'}</p>
            <p className="text-xs text-neutral-500 mb-4 font-mono">
              {selectedAlert.milesAway} mi straight-line
              {selectedAlert.occurredAt && ` • ${new Date(selectedAlert.occurredAt).toLocaleString()}`}
            </p>
            <button
              onClick={() => setSelectedAlert(null)}
              className="w-full py-2 rounded font-semibold"
              style={{ background: 'linear-gradient(135deg,#C9A84C 0%,#FFD700 40%,#C9A84C 70%,#8A6E2F 100%)', color: '#0a0a0a' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadContextPage;
