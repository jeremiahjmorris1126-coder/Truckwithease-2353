/**
 * StartupDataAgent — startup data check
 * ---------------------------------------------------------------------------
 * READS (live, measured, every round trip is printed on screen)
 *   GET /api/data-index/summary   REQUIRED. Real SQLite introspection of the
 *                                 live Turso database: table count, row count,
 *                                 column count, how many tables have rows, how
 *                                 many are empty, filings coverage, and the
 *                                 domain list. Costs ~9s because the server
 *                                 runs a COUNT(*) per table. Flags itself slow.
 *   GET /api/functions            OPTIONAL. Capability and endpoint counts plus
 *                                 the live/built_empty/needs_key/not_built
 *                                 breakdown. ~8s. Degrades to MISSING.
 *   GET /api/integrations/status  OPTIONAL. 19 providers, connection state only,
 *                                 never a key value. ~40ms. Degrades to MISSING.
 *
 * COMPUTES / MEASURES LOCALLY
 *   - Round-trip milliseconds per request via performance.now().
 *   - Response body size in bytes.
 *   - populated / (populated + empty) as a percentage of tables holding rows.
 *   - Nothing else. No score, no grade, no health percentage, no uptime.
 *
 * REMOVED IN THIS REWRITE (every item below was fabricated)
 *   - `import PocketBase from 'pocketbase'; const pb = new PocketBase();` — a
 *     client constructed with NO URL, then asked for 41 collections. Every one
 *     of those 41 calls failed, the catch branch recorded `count: 0`, and the
 *     screen rendered 41 rows of zeros as if it were a health report.
 *   - RESOLUTION_MAP — 41 invented "storage areas". Named tables that do not
 *     exist in this database: driver_profiles, fleet_profiles, fleet_customers,
 *     fleet_vehicles, hos_daily_certs, compliance_tracking,
 *     compliance_verification, pretrip_posttrip_inspections, safety_incidents,
 *     safety_scoring, coaching_sessions, dispatch_planning,
 *     routing_optimization, load_alternatives, trip_telemetry,
 *     live_gps_tracking, location_memory, customer_loads, customer_reviews,
 *     predictive_outcomes, fleet_reports, payroll_records, analytics_events,
 *     supplier_orders, agent_order_queue, supplier_submitted_orders,
 *     supplier_inquiries, eld_suppliers, fleet_notifications,
 *     driver_onboarding, ad_campaigns, contact_messages, live_agent_sessions,
 *     week_reviews, contact_management, feature_library. There is no supplier
 *     table of any kind in this product; five of those rows claimed otherwise.
 *   - The invented `priority: critical | high | medium | low` field on all 41
 *     rows, and PRIORITY_COLOR. No severity model exists for tables.
 *   - Pure theatre: sleep() calls of 400/600/300/500/400/80/300/200/300 ms, the
 *     `scan-line` animation, `pulse-ring`, `progress-glow`, and a progress
 *     percentage that was only the loop index — Math.round((i / 41) * 70) — then
 *     hardcoded to 80, 95 and 100.
 *   - The claims "Assigning all data to correct resolutions", "… assigned to …",
 *     "…and N more areas successfully routed" and "Startup complete — N areas
 *     indexed, N records routed". Nothing was indexed, assigned or routed. The
 *     loop only attempted a read.
 *   - "Browser cache: N items found (session data, auth tokens, UI state)" —
 *     it counted Object.keys(localStorage) and asserted they were auth tokens.
 *   - Clickable rows that navigate()'d to 19 routes that do not exist:
 *     /location-data-agent, /finance-alert-agent, /live-gps, /driver-gala,
 *     /hardware-inventory-agent, /customer-book, /operations-health,
 *     /accident-report, /safety-sos, /scorecard, /share-and-onboard,
 *     /contact-inbox, /customer-memory, /commands, /financial-model,
 *     /tutorials, /growth, /admin/suppliers, /hardware-suppliers.
 *   - The CATEGORY_ICONS emoji set and every other emoji on the screen.
 *   - The off-palette navy/slate/orange/blue/green/red/amber/purple hex set
 *     (#010b18 #020d1c #010810 #020c1b #0f2640 #0a1628 #1e3a5f #334155 #475569
 *     #64748b #e2e8f0 #f97316 #ea580c #fb923c #16a34a #15803d #4ade80 #22c55e
 *     #60a5fa #3b82f6 #f87171 #ef4444 #fbbf24 #f59e0b #a78bfa #7f1d1d #14532d
 *     #1c0505 #0d1f0d #0f1629 #1a1a0d #3d3300) and the system-ui font stack.
 *   - The "Enter App" dismiss button, which only set local state.
 *
 * WHAT THIS PAGE DOES NOT CLAIM
 *   - It does not claim to repair, migrate, index, assign or route anything.
 *     It reads counts and prints them.
 *   - It does not report per-table pass/fail. /api/data-index/summary returns
 *     counts only, with no per-table list, so no per-table verdict is shown.
 *   - It does not report uptime, health percentages or a system score.
 *   - It does not read or report browser storage contents.
 *   - Empty tables are reported as empty, not as failures. A table with zero
 *     rows is a feature nobody has used yet, not a broken one.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Database,
  AlertTriangle,
  RefreshCw,
  Table2,
  Layers,
  Plug,
  FileWarning,
  Gauge,
} from 'lucide-react';

const GOLD = '#C9A84C';
const GOLDB = '#FFD700';
const WARN = '#c96a4c';
const C = {
  black: '#0a0a0a',
  card: '#161616',
  nav: '#111111',
  border: '#222222',
  white: '#f2f2f2',
  muted: '#8a8a8a',
  dim: '#666666',
};
const FD = "'Bebas Neue', sans-serif";
const FH = "'Oswald', sans-serif";
const FB = "'Inter', sans-serif";
const FM = "'JetBrains Mono', monospace";
const SLOW_MS = 3000;

/** The 41 names the previous version of this screen invented. Kept only so the
 *  page can state the count it claimed against the database that actually
 *  exists. Nothing reads these as data. */
const CLAIMED_STORAGE_AREAS_REMOVED = 41;

async function timedGet(url) {
  const t0 = performance.now();
  let res;
  try {
    res = await fetch(url, { headers: { accept: 'application/json' } });
  } catch (e) {
    const err = new Error(`${url} — network error: ${e.message}`);
    err.status = 0;
    err.ms = Math.round(performance.now() - t0);
    err.url = url;
    throw err;
  }
  const text = await res.text();
  const ms = Math.round(performance.now() - t0);
  if (!res.ok) {
    const err = new Error(`${url} — HTTP ${res.status}: ${text.slice(0, 240)}`);
    err.status = res.status;
    err.ms = ms;
    err.url = url;
    throw err;
  }
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    const err = new Error(`${url} — HTTP 200 but the body is not JSON: ${text.slice(0, 240)}`);
    err.status = res.status;
    err.ms = ms;
    err.url = url;
    throw err;
  }
  return { body, ms, status: res.status, url, bytes: text.length };
}

function Spin() {
  return (
    <>
      <style>{`@keyframes twe-spin{to{transform:rotate(360deg)}}`}</style>
      <RefreshCw size={14} style={{ color: GOLD, animation: 'twe-spin 1s linear infinite' }} />
    </>
  );
}

function Wordmark({ size = 26 }) {
  return (
    <span style={{ fontFamily: FD, fontSize: size, letterSpacing: '0.06em', color: C.white }}>
      TRUCK<span style={{ color: GOLD }}>WITH</span>EASE
    </span>
  );
}

function Tag({ text, tone }) {
  const col = tone === 'warn' ? WARN : tone === 'gold' ? GOLDB : C.muted;
  return (
    <span
      style={{
        fontFamily: FM,
        fontSize: 10,
        letterSpacing: '0.14em',
        color: col,
        border: `1px solid ${col}44`,
        borderRadius: 3,
        padding: '2px 7px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
}

function Panel({ title, note, right, icon, children }) {
  return (
    <section
      style={{
        border: `1px solid ${C.border}`,
        background: C.card,
        borderRadius: 4,
        marginBottom: 18,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 18px',
          borderBottom: `1px solid ${C.border}`,
          flexWrap: 'wrap',
        }}
      >
        {icon ? <span style={{ color: GOLD, display: 'flex' }}>{icon}</span> : null}
        <h2
          style={{
            margin: 0,
            fontFamily: FH,
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: C.white,
          }}
        >
          {title}
        </h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>{right}</div>
        {note ? (
          <p
            style={{
              margin: '4px 0 0',
              width: '100%',
              fontFamily: FM,
              fontSize: 11,
              color: C.dim,
              letterSpacing: '0.02em',
            }}
          >
            {note}
          </p>
        ) : null}
      </header>
      <div style={{ padding: 18 }}>{children}</div>
    </section>
  );
}

function Missing({ label = 'MISSING / NOT TRACKED', reason }) {
  return (
    <div
      style={{
        border: `1px dashed #333`,
        borderRadius: 4,
        padding: '12px 14px',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}
    >
      <AlertTriangle size={15} style={{ color: WARN, flexShrink: 0, marginTop: 2 }} />
      <div>
        <div
          style={{
            fontFamily: FH,
            fontSize: 12,
            letterSpacing: '0.18em',
            color: WARN,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
        <div style={{ fontFamily: FB, fontSize: 13, color: C.muted, marginTop: 4, lineHeight: 1.6 }}>
          {reason}
        </div>
      </div>
    </div>
  );
}

function Err({ msg }) {
  return (
    <pre
      style={{
        fontFamily: FM,
        fontSize: 12,
        color: WARN,
        background: '#0f0f0f',
        border: `1px solid ${C.border}`,
        borderRadius: 4,
        padding: 12,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        margin: 0,
      }}
    >
      {msg}
    </pre>
  );
}

function Btn({ children, onClick, primary, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: FH,
        fontSize: 12,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        padding: '9px 16px',
        borderRadius: 3,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        border: `1px solid ${primary ? GOLD : C.border}`,
        background: primary ? GOLD : 'transparent',
        color: primary ? '#0a0a0a' : C.white,
      }}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 4,
        padding: '14px 16px',
        background: '#121212',
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontFamily: FH,
          fontSize: 11,
          letterSpacing: '0.2em',
          color: C.muted,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: FD, fontSize: 40, lineHeight: 1.05, color: GOLDB, marginTop: 6 }}>
        {value}
      </div>
      {sub ? (
        <div style={{ fontFamily: FM, fontSize: 11, color: C.dim, marginTop: 4 }}>{sub}</div>
      ) : null}
    </div>
  );
}

const th = {
  textAlign: 'left',
  fontFamily: FH,
  fontSize: 11,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: C.muted,
  padding: '8px 10px',
  borderBottom: `1px solid ${C.border}`,
  whiteSpace: 'nowrap',
};
const td = {
  fontFamily: FM,
  fontSize: 12,
  color: C.white,
  padding: '8px 10px',
  borderBottom: `1px solid #1b1b1b`,
  verticalAlign: 'top',
};

export default function StartupDataAgent({ onComplete }) {
  const [state, setState] = useState('loading'); // loading | ok | error
  const [err, setErr] = useState('');
  const [summary, setSummary] = useState(null);
  const [functions, setFunctions] = useState(null);
  const [functionsErr, setFunctionsErr] = useState('');
  const [integrations, setIntegrations] = useState(null);
  const [integrationsErr, setIntegrationsErr] = useState('');
  const [reads, setReads] = useState([]);
  const alive = useRef(false);

  const load = useCallback(async () => {
    setState('loading');
    setErr('');
    setReads([]);
    const log = (r) => {
      if (!alive.current) return;
      setReads((prev) => [...prev, r]);
    };

    let sum;
    try {
      sum = await timedGet('/api/data-index/summary');
      log({ url: sum.url, status: sum.status, ms: sum.ms, bytes: sum.bytes });
    } catch (e) {
      log({ url: e.url, status: e.status, ms: e.ms, bytes: 0 });
      if (!alive.current) return;
      setErr(e.message);
      setState('error');
      return;
    }
    if (!alive.current) return;
    setSummary(sum.body);
    setState('ok');

    const [fn, ints] = await Promise.allSettled([
      timedGet('/api/functions'),
      timedGet('/api/integrations/status'),
    ]);
    if (!alive.current) return;
    if (fn.status === 'fulfilled') {
      setFunctions(fn.value.body);
      setFunctionsErr('');
      log({ url: fn.value.url, status: fn.value.status, ms: fn.value.ms, bytes: fn.value.bytes });
    } else {
      setFunctions(null);
      setFunctionsErr(fn.reason?.message || 'unknown error');
      log({ url: '/api/functions', status: fn.reason?.status ?? 0, ms: fn.reason?.ms ?? 0, bytes: 0 });
    }
    if (ints.status === 'fulfilled') {
      setIntegrations(ints.value.body);
      setIntegrationsErr('');
      log({ url: ints.value.url, status: ints.value.status, ms: ints.value.ms, bytes: ints.value.bytes });
    } else {
      setIntegrations(null);
      setIntegrationsErr(ints.reason?.message || 'unknown error');
      log({
        url: '/api/integrations/status',
        status: ints.reason?.status ?? 0,
        ms: ints.reason?.ms ?? 0,
        bytes: 0,
      });
    }
    if (typeof onComplete === 'function') onComplete();
  }, [onComplete]);

  useEffect(() => {
    alive.current = true;
    load();
    return () => {
      alive.current = false;
    };
  }, [load]);

  const d = summary?.data || null;
  const f = summary?.filings || null;
  const domains = Array.isArray(summary?.domains) ? summary.domains : [];
  const tableTotal = d ? (d.populated ?? 0) + (d.empty ?? 0) : 0;
  const pctPopulated = tableTotal > 0 ? Math.round(((d.populated ?? 0) / tableTotal) * 100) : null;

  return (
    <div style={{ background: C.black, minHeight: '100vh', color: C.white, fontFamily: FB }}>
      {/* nav */}
      <nav
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: C.nav,
          padding: '14px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <a href="/" style={{ textDecoration: 'none' }}>
          <Wordmark size={24} />
        </a>
        <span style={{ marginLeft: 'auto' }}>
          <Tag text="internal · system inventory" />
        </span>
      </nav>

      {/* header band */}
      <header
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: `linear-gradient(180deg, ${C.nav} 0%, ${C.black} 100%)`,
          padding: '38px 22px 34px',
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              border: `1px solid ${C.border}`,
              borderRadius: 999,
              padding: '6px 14px',
              fontFamily: FM,
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: C.muted,
            }}
          >
            <Database size={13} style={{ color: GOLD }} />
            startup data check
          </span>
          <h1
            style={{
              fontFamily: FD,
              fontSize: 'clamp(38px,7vw,68px)',
              lineHeight: 1.02,
              margin: '18px 0 12px',
              letterSpacing: '0.01em',
            }}
          >
            THIS SCREEN COUNTS WHAT IS IN THE DATABASE.{' '}
            <span style={{ color: GOLDB }}>IT DOES NOT FIX ANYTHING.</span>
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: 780,
              fontSize: 15,
              lineHeight: 1.7,
              color: C.muted,
            }}
          >
            Every number below comes from one live introspection query against the production
            database, run when this page loaded. There is no repair step, no migration, no indexing
            and no routing. Tables with zero rows are shown as empty, because a feature nobody has
            used yet is not a broken feature.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 22px 70px' }}>
        {state === 'loading' && (
          <Panel
            title="Reading the database"
            note="GET /api/data-index/summary — the server runs a COUNT(*) per table, so this takes about 9 seconds."
            icon={<Spin />}
          >
            <div style={{ fontFamily: FM, fontSize: 13, color: C.muted }}>
              Waiting on the server. Nothing is cached and nothing is being written.
            </div>
          </Panel>
        )}

        {state === 'error' && (
          <Panel
            title="The read failed"
            note="GET /api/data-index/summary returned an error. The server's own message is printed verbatim below."
            icon={<AlertTriangle size={15} />}
            right={<Btn onClick={load} primary>Try again</Btn>}
          >
            <Err msg={err} />
          </Panel>
        )}

        {state === 'ok' && d && (
          <>
            <Panel
              title="Live database"
              note="GET /api/data-index/summary → data{} — real introspection, counted per request."
              icon={<Table2 size={15} />}
              right={
                summary?.generatedAt ? (
                  <Tag text={`server time ${String(summary.generatedAt).replace('T', ' ').slice(0, 19)}Z`} />
                ) : null
              }
            >
              <div
                style={{
                  display: 'grid',
                  gap: 12,
                  gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
                }}
              >
                <Stat label="Tables" value={d.tables ?? '—'} sub="schema objects counted" />
                <Stat label="Rows" value={(d.rows ?? 0).toLocaleString()} sub="across every table" />
                <Stat label="Columns" value={d.columns ?? '—'} sub="total column definitions" />
                <Stat
                  label="Tables with rows"
                  value={d.populated ?? '—'}
                  sub={pctPopulated === null ? 'not computable' : `${pctPopulated}% of ${tableTotal}`}
                />
                <Stat label="Empty tables" value={d.empty ?? '—'} sub="zero rows — not a failure" />
              </div>
            </Panel>

            <Panel
              title="What the old version of this screen claimed"
              note="No endpoint was called for this panel. It compares a hardcoded list that used to live in this file against the numbers above."
              icon={<FileWarning size={15} />}
            >
              <Missing
                label="PREVIOUS VERSION WAS WRONG BY CONSTRUCTION"
                reason={`It listed ${CLAIMED_STORAGE_AREAS_REMOVED} "storage areas" and checked each one through a PocketBase client built with no server URL, so all ${CLAIMED_STORAGE_AREAS_REMOVED} reads failed and every row rendered a count of 0. This database has ${d.tables ?? '?'} tables, ${d.populated ?? '?'} with rows and ${d.empty ?? '?'} empty. The old list was not accurate and it was not even a subset — it named tables that have never existed here, including every supplier table, because this product has no supplier table of any kind. The whole list was deleted rather than restyled.`}
              />
              <div style={{ marginTop: 14 }}>
                <Missing
                  label="NO PER-TABLE VERDICT SHOWN"
                  reason="/api/data-index/summary returns counts only — it does not return a per-table list. Printing a pass/fail per table would mean inventing one, so this page prints none. A per-table breakdown needs a new server endpoint first."
                />
              </div>
            </Panel>

            <Panel
              title="Domains the data index groups by"
              note="GET /api/data-index/summary → domains[] — the server's own grouping, printed as returned."
              icon={<Layers size={15} />}
            >
              {domains.length === 0 ? (
                <Missing reason="The server returned an empty domains list." />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {domains.map((x) => (
                    <Tag key={x} text={x} />
                  ))}
                </div>
              )}
            </Panel>

            <Panel
              title="Regulatory filings coverage"
              note="GET /api/data-index/summary → filings{} — how many filing types the index tracks versus how many are actually backed by a live table."
              icon={<FileWarning size={15} />}
            >
              {!f ? (
                <Missing reason="The server did not return a filings block." />
              ) : (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gap: 12,
                      gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))',
                    }}
                  >
                    <Stat label="Tracked" value={f.total ?? '—'} sub="filing types in the index" />
                    <Stat label="Live" value={f.live ?? '—'} sub="backed by a real table" />
                    <Stat label="Table empty" value={f.tableEmpty ?? '—'} sub="table exists, no rows" />
                    <Stat label="Gap" value={f.gap ?? '—'} sub="not built yet" />
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <Missing
                      label="TRUCKWITHEASE FILES NOTHING"
                      reason="These counts describe stored records only. TruckWithEase does not submit anything to FMCSA, the IRS, IFTA, IRP or any state agency, and nothing on this page changes that."
                    />
                  </div>
                </>
              )}
            </Panel>

            <Panel
              title="Capabilities and endpoints"
              note="GET /api/functions — optional read. If it fails this panel says so instead of guessing."
              icon={<Gauge size={15} />}
            >
              {functionsErr ? (
                <Missing
                  label="FUNCTION INDEX UNREADABLE"
                  reason={`GET /api/functions failed: ${functionsErr}`}
                />
              ) : !functions ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: FM, fontSize: 12, color: C.muted }}>
                  <Spin /> Reading /api/functions — about 8 seconds.
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gap: 12,
                      gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))',
                    }}
                  >
                    <Stat
                      label="Capabilities"
                      value={functions.counts?.capabilities ?? '—'}
                      sub="declared in the index"
                    />
                    <Stat
                      label="API endpoints"
                      value={functions.counts?.endpoints ?? '—'}
                      sub="mounted on the server"
                    />
                  </div>
                  {functions.counts?.byStatus ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
                      <thead>
                        <tr>
                          <th style={th}>Capability status</th>
                          <th style={th}>Count</th>
                          <th style={th}>What it means</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['live', 'Built and returning real data.'],
                          ['built_empty', 'Built, but the table behind it has no rows yet.'],
                          ['needs_key', 'Built, waiting on a provider credential.'],
                          ['not_built', 'Named in the roadmap, not implemented.'],
                        ].map(([k, meaning]) => (
                          <tr key={k}>
                            <td style={td}>{k}</td>
                            <td style={{ ...td, color: GOLDB }}>{functions.counts.byStatus[k] ?? 0}</td>
                            <td style={{ ...td, fontFamily: FB, color: C.muted }}>{meaning}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ marginTop: 14 }}>
                      <Missing reason="The server did not return a byStatus breakdown." />
                    </div>
                  )}
                </>
              )}
            </Panel>

            <Panel
              title="Provider connections"
              note="GET /api/integrations/status — connection state only. This endpoint never returns a key value, and no provider key is ever readable by the browser."
              icon={<Plug size={15} />}
            >
              {integrationsErr ? (
                <Missing
                  label="INTEGRATION STATUS UNREADABLE"
                  reason={`GET /api/integrations/status failed: ${integrationsErr}`}
                />
              ) : !integrations ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: FM, fontSize: 12, color: C.muted }}>
                  <Spin /> Reading /api/integrations/status.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={th}>State</th>
                      <th style={th}>Count</th>
                      <th style={th}>What it means</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['total', 'Providers the platform knows about.'],
                      ['connected', 'Credential present and verified against the vendor.'],
                      ['keyPresentUnverified', 'Key is in the environment but has not been proven live.'],
                      ['rejected', 'The vendor refused the credential we hold.'],
                      ['notConnected', 'No credential at all.'],
                    ].map(([k, meaning]) => (
                      <tr key={k}>
                        <td style={td}>{k}</td>
                        <td style={{ ...td, color: GOLDB }}>{integrations.counts?.[k] ?? '—'}</td>
                        <td style={{ ...td, fontFamily: FB, color: C.muted }}>{meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </>
        )}

        <Panel
          title="Measured round trips"
          note="Timed in this browser with performance.now(). Anything at or above 3000 ms is flagged."
          icon={<Gauge size={15} />}
          right={<Btn onClick={load} disabled={state === 'loading'}>Re-read</Btn>}
        >
          {reads.length === 0 ? (
            <div style={{ fontFamily: FM, fontSize: 12, color: C.dim }}>No requests recorded yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Endpoint</th>
                  <th style={th}>Status</th>
                  <th style={th}>Time</th>
                  <th style={th}>Bytes</th>
                </tr>
              </thead>
              <tbody>
                {reads.map((r, i) => (
                  <tr key={`${r.url}-${i}`}>
                    <td style={td}>{r.url}</td>
                    <td style={{ ...td, color: r.status === 200 ? GOLD : WARN }}>
                      {r.status === 0 ? 'network error' : r.status}
                    </td>
                    <td style={{ ...td, color: r.ms >= SLOW_MS ? WARN : C.white }}>
                      {r.ms} ms{r.ms >= SLOW_MS ? '  ← slow' : ''}
                    </td>
                    <td style={{ ...td, color: C.muted }}>{r.bytes ? r.bytes.toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel title="What this page does not do" icon={<AlertTriangle size={15} />}>
          <ol
            style={{
              margin: 0,
              paddingLeft: 22,
              fontSize: 14,
              lineHeight: 1.85,
              color: C.muted,
            }}
          >
            <li>It does not repair, migrate, index, assign or route any data.</li>
            <li>It does not write to the database. Every request on this page is a GET.</li>
            <li>It does not report a per-table pass or fail, because the server returns counts only.</li>
            <li>It does not report uptime, a health percentage or a system score. None are published anywhere in this product.</li>
            <li>It does not read, count or describe anything in browser storage.</li>
            <li>It does not treat an empty table as a fault.</li>
            <li>It does not block startup or gate access to the rest of the app.</li>
            <li>It does not verify provider credentials itself — it prints the states the server reports.</li>
            <li>It does not show a progress bar, because there is no multi-step job to measure.</li>
          </ol>
        </Panel>

        <p
          style={{
            fontSize: 12,
            lineHeight: 1.75,
            color: C.dim,
            fontFamily: FB,
            borderTop: `1px solid ${C.border}`,
            paddingTop: 18,
            margin: 0,
          }}
        >
          TruckWithEase is compliance and fleet management software that runs alongside the ELD a
          driver already has. It is not an ELD, it is not registered with FMCSA, and it files nothing
          with any agency.
        </p>
      </main>
    </div>
  );
}
