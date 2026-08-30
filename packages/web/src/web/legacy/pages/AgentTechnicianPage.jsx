/**
 * AgentTechnicianPage — live endpoint checker for TruckWithEase.
 *
 * READS (in the browser, on demand — no background job exists):
 *   GET /api/session/status         GET /api/session/coverage
 *   GET /api/hos                    GET /api/loads
 *   GET /api/fleet/drivers          GET /api/safety/drv-1
 *   GET /api/dvir                   GET /api/maintenance
 *   GET /api/incidents              GET /api/support
 *   GET /api/bridges/status         GET /api/dispatch-zero/status
 *   GET /api/data-index/summary     GET /api/routing/status
 *   GET /api/traxes/status          GET /api/algorithm/status
 *   GET /api/integrations/status    GET /api/rewards/status
 *   GET /api/fleetio/vehicles       GET /api/weather?lat&lon
 *   GET /api/gemini
 *
 * REMOVED IN THIS REWRITE (all fabricated — none of it came from a monitor):
 *   · A 14-row TEST_FUNCTIONS array with hardcoded uptime strings
 *     ("99.8%", "99.9%", "100%", "99.95%", "99.6%", "99.92%" ...) and
 *     hardcoded lastRun values ("2 min ago", "12 min ago", "just now").
 *   · status: 'pass' hardcoded on every single row, plus a setInterval that
 *     "re-tested" with `Math.random() > 0.015` and then assigned 'pass'
 *     either way — the pass rate could never be anything but 100%.
 *   · A "PLATFORM UPTIME" headline number averaged from those invented strings.
 *   · "CRITICAL FAILURES: 0 / This 24-hour period" — nothing was recorded.
 *   · "ALERT THRESHOLD 98% / Alert if uptime drops below" — no alerting exists.
 *   · Rows for engines that are not built: sign-language-engine,
 *     intelligence-hos, jj-keller-compliance, blind-spatial-audio,
 *     haptic-vibration, multi-device-haptics, broker-arrival-alerts,
 *     eld-hardware-sync, load-board-sync.
 *   · Off-brand navy/blue/green/purple palette (#0f1419, #3b82f6, #a855f7).
 *
 * WHAT THIS PAGE DOES NOT CLAIM:
 *   · It is not uptime monitoring. Nothing is stored between page loads, so
 *     there is no history, no percentage, and no alerting.
 *   · A 200 means the route answered. It does not mean the data is correct.
 *   · Latency is measured in this browser and includes your network.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity, AlertTriangle, CheckCircle2, RefreshCw, XCircle, Clock, Wrench,
} from 'lucide-react';

const GOLD = '#C9A84C';
const GOLDB = '#FFD700';
const WARN = '#c96a4c';
const C = {
  black: '#0a0a0a',
  card: '#161616',
  border: '#222222',
  white: '#f0ede8',
  muted: '#8a8a8a',
  dim: '#666666',
};

const FD = "'Bebas Neue', sans-serif";
const FH = "'Oswald', sans-serif";
const FB = "'Inter', sans-serif";
const FM = "'JetBrains Mono', monospace";

// Springfield MO — the weather route needs coordinates.
const WX = 'lat=37.2089&lon=-93.2923';

const CHECKS = [
  { id: 'session-status',   name: 'Session status',            category: 'Auth',        path: '/api/session/status' },
  { id: 'session-coverage', name: 'Auth coverage report',      category: 'Auth',        path: '/api/session/coverage' },
  { id: 'hos',              name: 'HOS clocks (49 CFR 395)',   category: 'Compliance',  path: '/api/hos' },
  { id: 'dvir',            name: 'DVIR inspections',           category: 'Compliance',  path: '/api/dvir' },
  { id: 'safety',           name: 'Safety score (drv-1)',      category: 'Compliance',  path: '/api/safety/drv-1' },
  { id: 'bridges',          name: 'Low bridges (FHWA NBI)',    category: 'Compliance',  path: '/api/bridges/status' },
  { id: 'loads',            name: 'Load board',                category: 'Operations',  path: '/api/loads' },
  { id: 'drivers',          name: 'Driver roster',             category: 'Operations',  path: '/api/fleet/drivers' },
  { id: 'dispatch-zero',    name: 'Dispatch decision ledger',  category: 'Operations',  path: '/api/dispatch-zero/status' },
  { id: 'routing',          name: 'Routing engine',            category: 'Operations',  path: '/api/routing/status' },
  { id: 'maintenance',      name: 'Maintenance',               category: 'Operations',  path: '/api/maintenance' },
  { id: 'incidents',        name: 'Incidents',                 category: 'Operations',  path: '/api/incidents' },
  { id: 'support',          name: 'Support tickets',           category: 'Operations',  path: '/api/support' },
  { id: 'traxes',           name: 'TRAXES financial',          category: 'Money',       path: '/api/traxes/status' },
  { id: 'rewards',          name: 'Rig Bucks / rewards',       category: 'Money',       path: '/api/rewards/status' },
  { id: 'algorithm',        name: 'Per-driver learning layer', category: 'AI',          path: '/api/algorithm/status' },
  { id: 'gemini',           name: 'Gemini gateway',            category: 'AI',          path: '/api/gemini' },
  { id: 'data-index',       name: 'Live data index',           category: 'Platform',    path: '/api/data-index/summary' },
  { id: 'integrations',     name: 'Integration inventory',     category: 'Platform',    path: '/api/integrations/status' },
  { id: 'fleetio',          name: 'Fleetio (read-only)',       category: 'Third party', path: '/api/fleetio/vehicles' },
  { id: 'weather',          name: 'Weather (NWS)',             category: 'Third party', path: `/api/weather?${WX}` },
];

const CATEGORIES = ['All', ...Array.from(new Set(CHECKS.map((c) => c.category)))];

function Panel({ title, note, right, icon, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18, marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, marginBottom: note ? 6 : 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          {icon}
          <div style={{ fontFamily: FH, fontSize: 13, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.white }}>{title}</div>
        </div>
        {right}
      </div>
      {note && (
        <div style={{ fontFamily: FM, fontSize: 11, color: C.dim, marginBottom: 14, lineHeight: 1.7 }}>{note}</div>
      )}
      {children}
    </div>
  );
}

function Missing({ label, reason }) {
  return (
    <div style={{ border: `1px dashed #333`, borderRadius: 8, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <AlertTriangle size={15} color={WARN} />
        <span style={{ fontFamily: FH, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: WARN }}>
          MISSING / NOT TRACKED
        </span>
      </div>
      <div style={{ fontFamily: FB, fontSize: 13, color: C.white, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: FB, fontSize: 12, color: C.muted, lineHeight: 1.7 }}>{reason}</div>
    </div>
  );
}

function Stat({ value, label, tone }) {
  return (
    <div>
      <div style={{ fontFamily: FD, fontSize: 34, lineHeight: 1, color: tone || GOLDB }}>{value}</div>
      <div style={{ fontFamily: FH, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.muted, marginTop: 6 }}>
        {label}
      </div>
    </div>
  );
}

export default function AgentTechnicianPage() {
  // results[id] = { state: 'idle'|'running'|'ok'|'fail', code, latencyMs, error, at }
  const [results, setResults] = useState({});
  const [category, setCategory] = useState('All');
  const [runningAll, setRunningAll] = useState(false);
  const [lastRunAt, setLastRunAt] = useState(null);
  const alive = useRef(true);

  useEffect(() => {
    // Must set true on every mount: React StrictMode mounts twice in dev, and the
    // first cleanup would otherwise leave this false forever, discarding all results.
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  const runOne = useCallback(async (check) => {
    setResults((r) => ({ ...r, [check.id]: { ...(r[check.id] || {}), state: 'running' } }));
    const t0 = performance.now();
    try {
      const res = await fetch(check.path, { headers: { accept: 'application/json' } });
      const latencyMs = Math.round(performance.now() - t0);
      let body = '';
      try { body = await res.text(); } catch { body = ''; }
      let error = '';
      if (!res.ok) {
        try {
          const j = JSON.parse(body);
          error = j.error || j.message || body.slice(0, 200);
        } catch {
          error = body.slice(0, 200) || `HTTP ${res.status}`;
        }
      }
      const out = {
        state: res.ok ? 'ok' : 'fail',
        code: res.status,
        latencyMs,
        bytes: body.length,
        error,
        at: new Date(),
      };
      if (alive.current) setResults((r) => ({ ...r, [check.id]: out }));
      return out;
    } catch (e) {
      const out = {
        state: 'fail',
        code: 0,
        latencyMs: Math.round(performance.now() - t0),
        bytes: 0,
        error: e && e.message ? e.message : 'fetch failed',
        at: new Date(),
      };
      if (alive.current) setResults((r) => ({ ...r, [check.id]: out }));
      return out;
    }
  }, []);

  const runAll = useCallback(async () => {
    setRunningAll(true);
    // Sequential on purpose: 21 parallel fetches skews the latency numbers.
    for (const check of CHECKS) {
      if (!alive.current) break;
      await runOne(check);
    }
    if (alive.current) {
      setLastRunAt(new Date());
      setRunningAll(false);
    }
  }, [runOne]);

  useEffect(() => { runAll(); }, [runAll]);

  const done = CHECKS.filter((c) => ['ok', 'fail'].includes(results[c.id]?.state));
  const okCount = done.filter((c) => results[c.id].state === 'ok').length;
  const failCount = done.length - okCount;
  const latencies = done.map((c) => results[c.id].latencyMs).filter((n) => typeof n === 'number');
  const medianLatency = latencies.length
    ? [...latencies].sort((a, b) => a - b)[Math.floor(latencies.length / 2)]
    : null;

  const shown = category === 'All' ? CHECKS : CHECKS.filter((c) => c.category === category);

  const toneFor = (state) => (state === 'ok' ? GOLDB : state === 'fail' ? WARN : C.muted);

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, fontFamily: FB }}>
      {/* Header band */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: `linear-gradient(180deg, #111 0%, ${C.black} 100%)`, padding: '30px 5% 26px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${C.border}`, borderRadius: 999, padding: '5px 12px', marginBottom: 14 }}>
            <Wrench size={13} color={GOLD} />
            <span style={{ fontFamily: FH, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD }}>
              Agent Technician
            </span>
          </div>
          <h1 style={{ fontFamily: FD, fontSize: 52, lineHeight: 1, margin: 0, letterSpacing: '0.02em' }}>
            Does it <span style={{ color: GOLDB }}>answer</span> right now?
          </h1>
          <p style={{ fontFamily: FB, fontSize: 14, color: C.muted, maxWidth: 760, lineHeight: 1.8, marginTop: 12 }}>
            This page fires a real request at every endpoint listed below, from this browser, when you load it or
            press Run. What you see is the HTTP status the server actually returned and the round trip measured
            with a clock. Nothing is stored, so there is no uptime number and no history.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '26px 5% 60px' }}>
        {/* Summary */}
        <Panel
          title="This run"
          icon={<Activity size={15} color={GOLD} />}
          note={`${CHECKS.length} endpoints probed sequentially. Latency is measured in this browser and includes your network.`}
          right={(
            <button
              onClick={runAll}
              disabled={runningAll}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent',
                border: `1px solid ${runningAll ? C.border : GOLD}`, color: runningAll ? C.muted : GOLD,
                borderRadius: 8, padding: '9px 16px', fontFamily: FH, fontSize: 11,
                letterSpacing: '0.18em', textTransform: 'uppercase', cursor: runningAll ? 'default' : 'pointer',
              }}
            >
              <RefreshCw size={14} className={runningAll ? 'spin' : undefined} />
              {runningAll ? 'Running' : 'Run all checks'}
            </button>
          )}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 22 }}>
            <Stat value={`${okCount}/${CHECKS.length}`} label="Answered 2xx" />
            <Stat value={failCount} label="Did not answer" tone={failCount ? WARN : GOLDB} />
            <Stat value={medianLatency == null ? '—' : `${medianLatency}ms`} label="Median round trip" />
            <Stat
              value={lastRunAt ? lastRunAt.toLocaleTimeString() : '—'}
              label="Run finished"
              tone={GOLD}
            />
          </div>
        </Panel>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          {CATEGORIES.map((cat) => {
            const on = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  background: on ? GOLD : 'transparent',
                  color: on ? C.black : C.muted,
                  border: `1px solid ${on ? GOLD : C.border}`,
                  borderRadius: 6, padding: '8px 14px', cursor: 'pointer',
                  fontFamily: FH, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14, marginBottom: 22 }}>
          {shown.map((check) => {
            const r = results[check.id] || { state: 'idle' };
            const tone = toneFor(r.state);
            return (
              <div key={check.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FB, fontSize: 14, fontWeight: 600, color: C.white }}>{check.name}</div>
                    <div style={{ fontFamily: FH, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.dim, marginTop: 4 }}>
                      {check.category}
                    </div>
                  </div>
                  {r.state === 'ok' && <CheckCircle2 size={18} color={GOLDB} />}
                  {r.state === 'fail' && <XCircle size={18} color={WARN} />}
                  {r.state === 'running' && <RefreshCw size={18} color={C.muted} className="spin" />}
                  {r.state === 'idle' && <Clock size={18} color={C.dim} />}
                </div>

                <div style={{ fontFamily: FM, fontSize: 11, color: C.dim, margin: '12px 0 12px', wordBreak: 'break-all' }}>
                  GET {check.path}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { k: 'HTTP', v: r.code == null ? '—' : (r.code === 0 ? 'no response' : String(r.code)) },
                    { k: 'Round trip', v: r.latencyMs == null ? '—' : `${r.latencyMs}ms` },
                    { k: 'Body', v: r.bytes == null ? '—' : `${r.bytes}B` },
                  ].map((m) => (
                    <div key={m.k} style={{ background: C.black, border: `1px solid ${C.border}`, borderRadius: 6, padding: '10px 11px' }}>
                      <div style={{ fontFamily: FH, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.dim, marginBottom: 5 }}>
                        {m.k}
                      </div>
                      <div style={{ fontFamily: FM, fontSize: 12, color: m.k === 'HTTP' ? tone : C.white }}>{m.v}</div>
                    </div>
                  ))}
                </div>

                {r.error ? (
                  <div style={{ marginTop: 12, border: `1px solid ${WARN}55`, borderRadius: 6, padding: '10px 12px' }}>
                    <div style={{ fontFamily: FM, fontSize: 11, color: WARN, lineHeight: 1.6, wordBreak: 'break-word' }}>
                      {r.error}
                    </div>
                  </div>
                ) : null}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12 }}>
                  <div style={{ fontFamily: FM, fontSize: 10, color: C.dim }}>
                    {r.at ? `checked ${r.at.toLocaleTimeString()}` : 'not checked yet'}
                  </div>
                  <button
                    onClick={() => runOne(check)}
                    disabled={r.state === 'running'}
                    style={{
                      background: 'transparent', border: `1px solid ${C.border}`, color: C.muted,
                      borderRadius: 6, padding: '6px 12px', cursor: r.state === 'running' ? 'default' : 'pointer',
                      fontFamily: FH, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
                    }}
                  >
                    Recheck
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <Panel title="Uptime" icon={<AlertTriangle size={15} color={WARN} />}>
          <Missing
            label="Platform uptime percentage, pass-rate history, and failure alerting"
            reason="Nothing on this platform records check results over time. There is no monitoring job, no results table, and no alert channel — so no uptime figure can be published and none is shown here. Until a scheduled server-side checker writes results to the database, this page is a live spot check and nothing more."
          />
        </Panel>

        <Panel title="What this does not cover" icon={<AlertTriangle size={15} color={WARN} />}>
          <ol style={{ margin: 0, paddingLeft: 20, fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 2 }}>
            <li>A 200 only means the route answered. It does not mean the numbers inside are right.</li>
            <li>Requests run from your browser, so latency includes your own connection.</li>
            <li>Auth-gated routes will report 401 or 403 when you are signed out. That is correct behavior, not an outage.</li>
            <li>Third-party checks (Fleetio, weather, Gemini) test our route, not the vendor's whole service.</li>
            <li>Nothing here tests the mobile app, the database directly, or any background job.</li>
          </ol>
        </Panel>

        <div style={{ fontFamily: FB, fontSize: 12, color: C.dim, lineHeight: 1.9, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
          TruckWithEase does not claim certified uptime, and this page is not a status page. Every value above was
          produced by a request made moments ago and is discarded when you leave.
        </div>
      </div>

      <style>{`
        .spin { animation: spin 0.9s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
