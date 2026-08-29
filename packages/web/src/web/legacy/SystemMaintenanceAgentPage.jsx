/**
 * SystemMaintenanceAgentPage — route: /system-maintenance (legacy/App.jsx L391)
 *
 * READS (live, browser fetch, no credentials in the client):
 *   GET /api/integrations/status   — the 19 real provider entries: state (connected /
 *                                    rejected / not_connected / unknown), the env var names
 *                                    each needs, which routes use it, the server's own reason
 *                                    string, plus counts and the three standing key rules.
 *   GET /api/data-index/summary    — live schema introspection: table count, total rows,
 *                                    column count, populated vs empty tables, and the
 *                                    filings gap (total / live / tableEmpty / gap).
 *   GET /api/session/coverage      — the authorization honesty endpoint: which routes are
 *                                    actually gated, and the verbatim `honest` statement.
 *   GET /api/maintenance           — real maintenance records (currently an empty array).
 *
 * MEASURES LOCALLY:
 *   Round-trip latency of each of the four reads above, via performance.now(), and the HTTP
 *   status returned. That is a measurement taken in this browser on this page load, not a
 *   stored metric. /api/data-index/summary is genuinely slow (it introspects every table on
 *   every request) and the page shows whatever it actually took rather than hiding it.
 *
 * REMOVED IN THIS REWRITE (all hardcoded, none of it was ever measured or recorded):
 *   - Six invented "systems" with invented uptime figures: HOS / ELD Logger 99.94%, Load
 *     Board Sync 99.87%, Traxes AI Processing 99.50%, GPS Tracking Service 99.98%, Push
 *     Notifications 98.32%, Payment Processing 99.99%. Nothing in this platform records
 *     check results over time, so no uptime figure can exist. Publishing one is barred.
 *   - The matching invented "performance" scores: 98%, 96%, 87%, 99%, 72%, 99%.
 *   - Invented lastCheck timestamps, all dated 2024-07-24 — over two years stale, and shown
 *     as if the system had just been checked.
 *   - The Healthy / Warning / Degraded counters, which only counted rows of that fake array.
 *   - Six invented scheduled maintenance tasks ("Clear expired session tokens" Daily,
 *     "Verify all user profiles for compliance" Weekly, "Clean up orphaned database records",
 *     "Validate banking information encryption", "Sync load board with external providers"
 *     Every 6 hours, "Generate system health report") with invented lastRun/nextRun dates in
 *     July 2024 and status "Scheduled". There is no job scheduler in this codebase. Nothing
 *     was scheduled, nothing ran, and no banking encryption validation exists.
 *   - Three invented alerts: "Traxes AI response time elevated (avg 2.3s, target <1.5s)",
 *     "Push notification delivery rate dropped to 72% (target 95%+)", and "Database query
 *     times slow for expense reports (avg 1.8s)". No latency monitor, no push delivery
 *     metric and no query timer exists. The "Expense Tracker" system named there is not a
 *     component of this platform at all.
 *   - runMaintenance(systemId) — a button labeled as running maintenance that only rewrote
 *     the local array to status Healthy, issues 0, performance 98%. It touched no system.
 *   - resolveAlert(alertId) — "resolved" an alert by filtering it out of a local array.
 *   - The off-brand palette: navy #0B2A6B / #081E4D / #06090F, slate #64748B / #94A3B8 /
 *     #E2E8F0, light background #F8FAFC, orange #FF6B00, amber #FFB400, green #16A34A,
 *     red #DC2626. Also the runtime Google Fonts @import of Poppins and the emoji icons
 *     (wrench, check, warning, cross) — emoji render as empty boxes in headless capture.
 *
 * WHAT THIS PAGE DOES NOT CLAIM:
 *   - No uptime percentage, for anything, ever. Nothing records history.
 *   - No performance score or health grade for any subsystem.
 *   - No scheduled job, cron, or automated maintenance run — none exists.
 *   - No alerting. Nothing watches anything and nothing pages anyone.
 *   - A provider whose key the vendor rejected is shown rejected, never active.
 *   - It does not claim the platform is access-controlled. /api/session/coverage says
 *     plainly that it is not, and that text is printed here verbatim.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench, Database, ShieldAlert, Plug, AlertTriangle, Loader2,
  CheckCircle2, XCircle, HelpCircle, MinusCircle, Timer, ClipboardList,
} from 'lucide-react';

const GOLD = '#C9A84C';
const GOLDB = '#FFD700';
const WARN = '#c96a4c';
const C = {
  black: '#0a0a0a',
  card: '#161616',
  nav: '#111111',
  border: '#222222',
  white: '#ffffff',
  muted: '#8a8a8a',
  dim: '#666666',
};
const FD = "'Bebas Neue', sans-serif";
const FH = "'Oswald', sans-serif";
const FB = "'Inter', sans-serif";
const FM = "'JetBrains Mono', monospace";

/** Fetch JSON and measure the real round trip in this browser. */
async function timedGet(url) {
  const t0 = performance.now();
  const r = await fetch(url);
  let body = null;
  try { body = await r.json(); } catch { /* non-JSON body */ }
  const ms = Math.round(performance.now() - t0);
  if (!r.ok) {
    const err = new Error((body && body.error) || `HTTP ${r.status} ${r.statusText}`);
    err.ms = ms;
    err.status = r.status;
    throw err;
  }
  return { body, ms, status: r.status };
}

function Panel({ title, note, right, icon, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, marginBottom: 20 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px',
        borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap',
      }}>
        {icon}
        <div style={{
          fontFamily: FH, fontSize: 13, fontWeight: 600, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: GOLD,
        }}>{title}</div>
        <div style={{ marginLeft: 'auto' }}>{right}</div>
      </div>
      {note ? (
        <div style={{
          padding: '10px 18px', borderBottom: `1px solid ${C.border}`,
          fontFamily: FM, fontSize: 11, color: C.dim,
        }}>{note}</div>
      ) : null}
      <div style={{ padding: '18px' }}>{children}</div>
    </div>
  );
}

function Missing({ label, reason }) {
  return (
    <div style={{
      border: `1px dashed #333`, borderRadius: 4, padding: '16px 18px',
      background: 'rgba(201,106,76,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <AlertTriangle size={15} color={WARN} />
        <span style={{
          fontFamily: FH, fontSize: 11, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: WARN,
        }}>Missing / not tracked</span>
      </div>
      <div style={{ fontFamily: FH, fontSize: 15, color: C.white, marginBottom: 6, letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{reason}</div>
    </div>
  );
}

function Stat({ value, label, tone }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '14px 16px', background: C.black }}>
      <div style={{ fontFamily: FD, fontSize: 34, lineHeight: 1, color: tone || GOLDB }}>{value}</div>
      <div style={{
        fontFamily: FH, fontSize: 10, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: C.dim, marginTop: 6,
      }}>{label}</div>
    </div>
  );
}

function Row({ k, v, mono, tone }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', gap: 16,
      padding: '9px 0', borderBottom: `1px solid ${C.border}`,
    }}>
      <span style={{ fontFamily: FB, fontSize: 13, color: C.muted }}>{k}</span>
      <span style={{
        fontFamily: mono ? FM : FB, fontSize: 13,
        color: tone || C.white, textAlign: 'right', wordBreak: 'break-word',
      }}>{v}</span>
    </div>
  );
}

function Err({ msg }) {
  return (
    <div style={{
      border: `1px solid ${WARN}`, borderRadius: 4, padding: '12px 14px',
      fontFamily: FM, fontSize: 12, color: WARN, background: 'rgba(201,106,76,0.06)',
      wordBreak: 'break-word',
    }}>{msg}</div>
  );
}

function Spin() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: FM, fontSize: 12, color: C.dim }}>
      <Loader2 size={14} color={GOLD} className="twe-spin" /> reading
    </span>
  );
}

/** Provider state badge. Colour and wording come straight from the server's state string. */
function StateBadge({ state }) {
  const map = {
    connected: { icon: <CheckCircle2 size={13} />, color: GOLDB, text: 'connected' },
    rejected: { icon: <XCircle size={13} />, color: WARN, text: 'rejected by vendor' },
    not_connected: { icon: <MinusCircle size={13} />, color: C.dim, text: 'not connected' },
    unknown: { icon: <HelpCircle size={13} />, color: GOLD, text: 'key present, unverified' },
  };
  const m = map[state] || { icon: <HelpCircle size={13} />, color: C.dim, text: String(state) };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: FM, fontSize: 11, color: m.color,
      border: `1px solid ${C.border}`, borderRadius: 3, padding: '3px 8px',
    }}>{m.icon}{m.text}</span>
  );
}

/** One measured read: shows the endpoint, HTTP status and the latency actually observed. */
function ProbeRow({ url, st }) {
  const tone = st.state === 'ok' ? GOLDB : st.state === 'error' ? WARN : C.dim;
  const slow = st.state === 'ok' && st.ms >= 3000;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      padding: '10px 0', borderBottom: `1px solid ${C.border}`,
    }}>
      <span style={{ fontFamily: FM, fontSize: 12, color: C.white, minWidth: 240 }}>{url}</span>
      <span style={{ fontFamily: FM, fontSize: 12, color: tone }}>
        {st.state === 'loading' ? '…' : st.state === 'ok' ? `HTTP ${st.status}` : `HTTP ${st.status || 'ERR'}`}
      </span>
      <span style={{ fontFamily: FM, fontSize: 12, color: slow ? WARN : C.muted, marginLeft: 'auto' }}>
        {st.ms == null ? '—' : `${st.ms.toLocaleString()} ms`}
        {slow ? '  ← slow' : ''}
      </span>
    </div>
  );
}

const URLS = {
  integrations: '/api/integrations/status',
  dataindex: '/api/data-index/summary',
  coverage: '/api/session/coverage',
  maintenance: '/api/maintenance',
};

export default function SystemMaintenanceAgentPage() {
  const alive = useRef(false);
  const blank = { state: 'loading', data: null, err: null, ms: null, status: null };
  const [integ, setInteg] = useState(blank);
  const [didx, setDidx] = useState(blank);
  const [cov, setCov] = useState(blank);
  const [maint, setMaint] = useState(blank);

  useEffect(() => {
    // Must set true on every mount: React StrictMode mounts twice in dev, and the
    // first cleanup would otherwise leave this false forever, discarding all results.
    alive.current = true;

    const load = async (url, setter) => {
      try {
        const { body, ms, status } = await timedGet(url);
        if (alive.current) setter({ state: 'ok', data: body, err: null, ms, status });
      } catch (e) {
        if (alive.current) {
          setter({ state: 'error', data: null, err: String(e.message || e), ms: e.ms ?? null, status: e.status ?? null });
        }
      }
    };

    load(URLS.integrations, setInteg);
    load(URLS.coverage, setCov);
    load(URLS.maintenance, setMaint);
    load(URLS.dataindex, setDidx);

    return () => { alive.current = false; };
  }, []);

  const iData = integ.data || {};
  const providers = Array.isArray(iData.providers) ? iData.providers : [];
  const counts = iData.counts || {};
  const dData = didx.data || {};
  const dRows = dData.data || {};
  const dFilings = dData.filings || {};
  const cData = cov.data || {};
  const mRecords = (maint.data && Array.isArray(maint.data.records)) ? maint.data.records : [];

  const order = { rejected: 0, connected: 1, unknown: 2, not_connected: 3 };
  const sortedProviders = [...providers].sort(
    (a, b) => (order[a.state] ?? 9) - (order[b.state] ?? 9) || a.name.localeCompare(b.name)
  );

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, fontFamily: FB }}>

      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${C.border}`,
        background: `linear-gradient(180deg, ${C.nav} 0%, ${C.black} 100%)`,
        padding: '38px 24px 30px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            border: `1px solid ${C.border}`, borderRadius: 999,
            padding: '5px 14px', marginBottom: 16,
          }}>
            <Wrench size={13} color={GOLD} />
            <span style={{
              fontFamily: FH, fontSize: 10, letterSpacing: '0.24em',
              textTransform: 'uppercase', color: GOLD,
            }}>System maintenance</span>
          </div>

          <h1 style={{
            fontFamily: FD, fontSize: 'clamp(34px, 7vw, 52px)', lineHeight: 1.02,
            margin: '0 0 14px', letterSpacing: '0.01em',
          }}>
            WHAT THE PLATFORM <span style={{ color: GOLDB }}>ACTUALLY REPORTS</span>
          </h1>

          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, maxWidth: 780, margin: 0 }}>
            <strong style={{ color: C.white }}>There is no uptime figure on this page and there never will be</strong> —
            nothing in this platform records check results over time, so any percentage would be invented.
            There is also no job scheduler, so nothing here claims a maintenance task ran. What you get instead:
            the real state of all {counts.total || 19} provider integrations, live schema counts, the
            authorization gap stated in the server's own words, and the measured latency of each read taken
            in your browser on this page load.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 70px' }}>

        {/* Measured reads */}
        <Panel
          title="This page load, measured"
          note="Round trip measured with performance.now() in your browser. Not a stored metric."
          icon={<Timer size={15} color={GOLD} />}
        >
          <ProbeRow url={URLS.integrations} st={integ} />
          <ProbeRow url={URLS.coverage} st={cov} />
          <ProbeRow url={URLS.maintenance} st={maint} />
          <ProbeRow url={URLS.dataindex} st={didx} />
          <div style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.7, marginTop: 14 }}>
            One real finding, left visible rather than smoothed over:{' '}
            <span style={{ fontFamily: FM, color: GOLDB }}>/api/data-index/summary</span> introspects every
            table in the database on every single request, so it takes seconds while the other three answer in
            milliseconds. That is a genuine performance problem worth fixing before launch, not a glitch.
          </div>
        </Panel>

        {/* Uptime */}
        <Panel title="Uptime and subsystem health" icon={<AlertTriangle size={15} color={WARN} />}>
          <Missing
            label="No uptime, performance score or health grade exists for any subsystem"
            reason={
              'Nothing writes check results to storage, so there is no history to compute availability from. ' +
              'The previous version of this page printed six subsystems with invented uptime figures — HOS / ELD ' +
              'Logger 99.94%, Load Board Sync 99.87%, Traxes AI Processing 99.50%, GPS Tracking Service 99.98%, ' +
              'Push Notifications 98.32%, Payment Processing 99.99% — plus invented performance scores of 98%, ' +
              '96%, 87%, 99%, 72% and 99%, and "last checked" timestamps all dated 2024-07-24. Every one of ' +
              'those numbers was typed into the file by hand. They are deleted. A live one-shot probe of 21 ' +
              'real endpoints exists at /agent-technician; it reports status and latency per request and ' +
              'likewise publishes no uptime number.'
            }
          />
        </Panel>

        {/* Scheduled tasks */}
        <Panel title="Scheduled maintenance" icon={<ClipboardList size={15} color={WARN} />}>
          <Missing
            label="No scheduler exists in this codebase"
            reason={
              'There is no cron, no job runner and no background worker. The previous version listed six tasks ' +
              'as "Scheduled" with last-run and next-run timestamps — clearing expired session tokens daily, ' +
              'verifying all user profiles for compliance weekly, cleaning up orphaned database records, ' +
              'validating banking information encryption, syncing the load board with external providers every ' +
              '6 hours, and generating a weekly system health report. None of those jobs was ever written. ' +
              'No banking encryption validation exists anywhere in this platform. The dates shown were in ' +
              'July 2024.'
            }
          />
        </Panel>

        {/* Alerting */}
        <Panel title="Alerting" icon={<ShieldAlert size={15} color={WARN} />}>
          <Missing
            label="Nothing watches anything and nothing pages anyone"
            reason={
              'There is no latency monitor, no push-delivery metric and no slow-query log. The previous version ' +
              'showed three alerts as if a monitor had raised them: "Traxes AI response time elevated (avg 2.3s, ' +
              'target <1.5s)", "Push notification delivery rate dropped to 72% (target 95%+)" and "Database ' +
              'query times slow for expense reports (avg 1.8s)" — the last one naming an "Expense Tracker" ' +
              'component that is not part of this platform. Its Resolve button removed the alert from a local ' +
              'array and changed nothing. Its Run Maintenance button rewrote the same array to status Healthy, ' +
              'issues 0, performance 98% without contacting any system.'
            }
          />
        </Panel>

        {/* Integrations */}
        <Panel
          title="Provider integrations"
          note={`GET ${URLS.integrations}`}
          icon={<Plug size={15} color={GOLD} />}
          right={integ.state === 'loading' ? <Spin /> : null}
        >
          {integ.state === 'error' ? <Err msg={integ.err} /> : null}
          {integ.state === 'ok' ? (
            <>
              <div style={{
                display: 'grid', gap: 12, marginBottom: 18,
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              }}>
                <Stat value={counts.total ?? '—'} label="Providers tracked" />
                <Stat value={counts.connected ?? '—'} label="Verified connected" />
                <Stat value={counts.keyPresentUnverified ?? '—'} label="Key present, unverified" tone={GOLD} />
                <Stat value={counts.rejected ?? '—'} label="Rejected by vendor" tone={WARN} />
                <Stat value={counts.notConnected ?? '—'} label="Not connected" tone={C.muted} />
              </div>

              {iData.note ? (
                <div style={{
                  fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.7,
                  border: `1px solid ${C.border}`, borderRadius: 4, padding: '13px 15px',
                  background: C.black, marginBottom: 14,
                }}>
                  Server note: {iData.note}
                </div>
              ) : null}

              {Array.isArray(iData.rules) && iData.rules.length ? (
                <div style={{ marginBottom: 18 }}>
                  <div style={{
                    fontFamily: FH, fontSize: 10, letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: C.dim, marginBottom: 10,
                  }}>Standing key rules, verbatim from the server</div>
                  {iData.rules.map((r, i) => (
                    <div key={i} style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 5 }}>
                      — {r}
                    </div>
                  ))}
                </div>
              ) : null}

              {sortedProviders.map((p) => (
                <div key={p.id} style={{
                  border: `1px solid ${C.border}`, borderRadius: 4, padding: '13px 15px',
                  background: C.black, marginBottom: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span style={{ fontFamily: FH, fontSize: 14, color: C.white, letterSpacing: '0.04em' }}>{p.name}</span>
                    <span style={{
                      border: `1px solid ${C.border}`, borderRadius: 3, padding: '2px 8px',
                      fontFamily: FH, fontSize: 9, letterSpacing: '0.18em',
                      textTransform: 'uppercase', color: C.dim,
                    }}>{p.category}</span>
                    <StateBadge state={p.state} />
                  </div>
                  {p.purpose ? (
                    <div style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 8 }}>
                      {p.purpose}
                    </div>
                  ) : null}
                  <Row k="Server reason" v={p.reason || '—'} />
                  <Row k="Env vars required" v={(p.envKeys || []).join(', ') || '—'} mono />
                  <Row k="Used by" v={(p.usedBy || []).join('  ') || 'nothing yet'} mono
                    tone={(p.usedBy || []).length ? C.white : WARN} />
                  <Row k="Live probe available" v={p.probeable ? 'POST /api/integrations/probe/' + p.id : 'no'} mono />
                  <Row k="Last probed" v={p.probeAt || 'never'} mono tone={p.probeAt ? C.white : C.dim} />
                </div>
              ))}

              {iData.generatedAt ? (
                <div style={{ fontFamily: FM, fontSize: 11, color: C.dim, marginTop: 12 }}>
                  generatedAt {iData.generatedAt}
                </div>
              ) : null}
            </>
          ) : null}
        </Panel>

        {/* Data health */}
        <Panel
          title="Database health"
          note={`GET ${URLS.dataindex} — live sqlite_master introspection, counted per request`}
          icon={<Database size={15} color={GOLD} />}
          right={didx.state === 'loading' ? <Spin /> : null}
        >
          {didx.state === 'error' ? <Err msg={didx.err} /> : null}
          {didx.state === 'loading' ? (
            <div style={{ fontFamily: FM, fontSize: 12, color: C.dim }}>
              counting every table — this one genuinely takes several seconds…
            </div>
          ) : null}
          {didx.state === 'ok' ? (
            <>
              <div style={{
                display: 'grid', gap: 12, marginBottom: 18,
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              }}>
                <Stat value={dRows.tables ?? '—'} label="Tables" />
                <Stat value={(dRows.rows ?? 0).toLocaleString()} label="Rows total" />
                <Stat value={dRows.columns ?? '—'} label="Columns" />
                <Stat value={dRows.populated ?? '—'} label="Tables with data" />
                <Stat value={dRows.empty ?? '—'} label="Tables empty" tone={WARN} />
              </div>

              <div style={{ marginBottom: 18 }}>
                <Row k="Filings / data sources mapped" v={dFilings.total ?? '—'} mono />
                <Row k="Live" v={dFilings.live ?? '—'} mono tone={GOLDB} />
                <Row k="Mapped but table empty" v={dFilings.tableEmpty ?? '—'} mono tone={WARN} />
                <Row k="Named gap, not built" v={dFilings.gap ?? '—'} mono tone={WARN} />
                <Row k="Counted at" v={dData.generatedAt || '—'} mono />
              </div>

              {Array.isArray(dData.domains) && dData.domains.length ? (
                <div>
                  <div style={{
                    fontFamily: FH, fontSize: 10, letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: C.dim, marginBottom: 10,
                  }}>Domains present in the schema</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {dData.domains.map((d) => (
                      <span key={d} style={{
                        border: `1px solid ${C.border}`, borderRadius: 3,
                        padding: '5px 10px', fontFamily: FM, fontSize: 11, color: C.muted,
                      }}>{d}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </Panel>

        {/* Authorization coverage */}
        <Panel
          title="Authorization coverage"
          note={`GET ${URLS.coverage}`}
          icon={<ShieldAlert size={15} color={GOLD} />}
          right={cov.state === 'loading' ? <Spin /> : null}
        >
          {cov.state === 'error' ? <Err msg={cov.err} /> : null}
          {cov.state === 'ok' ? (
            <>
              {cData.honest ? (
                <div style={{
                  border: `1px solid ${WARN}`, borderRadius: 4, padding: '14px 16px',
                  background: 'rgba(201,106,76,0.06)', marginBottom: 16,
                }}>
                  <div style={{
                    fontFamily: FH, fontSize: 10, letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: WARN, marginBottom: 8,
                  }}>The server's own words</div>
                  <div style={{ fontFamily: FB, fontSize: 14, color: C.white, lineHeight: 1.7 }}>
                    {cData.honest}
                  </div>
                </div>
              ) : null}

              <div style={{
                fontFamily: FH, fontSize: 10, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: C.dim, marginBottom: 10,
              }}>Gated endpoints</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {((cData.gated && cData.gated.endpoints) || []).map((e) => (
                  <span key={e} style={{
                    border: `1px solid ${C.border}`, borderRadius: 3,
                    padding: '5px 10px', fontFamily: FM, fontSize: 11, color: GOLDB,
                  }}>{e}</span>
                ))}
              </div>
              {cData.gated && cData.gated.note ? (
                <div style={{ fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 16 }}>
                  {cData.gated.note}
                </div>
              ) : null}
              {cData.notGated && cData.notGated.note ? (
                <div style={{
                  border: `1px dashed #333`, borderRadius: 4, padding: '13px 15px',
                  fontFamily: FB, fontSize: 13, color: C.muted, lineHeight: 1.7,
                }}>
                  {cData.notGated.note}
                </div>
              ) : null}
            </>
          ) : null}
        </Panel>

        {/* Maintenance records */}
        <Panel
          title="Maintenance records on file"
          note={`GET ${URLS.maintenance}`}
          icon={<Wrench size={15} color={GOLD} />}
          right={maint.state === 'loading' ? <Spin /> : null}
        >
          {maint.state === 'error' ? <Err msg={maint.err} /> : null}
          {maint.state === 'ok' && mRecords.length === 0 ? (
            <Missing
              label="Zero maintenance records"
              reason="The endpoint answers correctly and returns an empty array. The maintenance_records table has never been written to. This panel shows nothing rather than filling the space with example rows."
            />
          ) : null}
          {maint.state === 'ok' && mRecords.length > 0 ? (
            mRecords.map((r, i) => (
              <div key={r.id || i} style={{
                border: `1px solid ${C.border}`, borderRadius: 4, padding: '13px 15px',
                background: C.black, marginBottom: 10,
              }}>
                {Object.entries(r).map(([k, v]) => (
                  <Row key={k} k={k} v={v === null ? '—' : String(v)} mono />
                ))}
              </div>
            ))
          ) : null}
        </Panel>

        {/* What this page does not cover */}
        <Panel title="What this page does not cover" icon={<AlertTriangle size={15} color={WARN} />}>
          <ol style={{
            margin: 0, paddingLeft: 20, fontFamily: FB, fontSize: 13,
            color: C.muted, lineHeight: 1.9,
          }}>
            <li>
              <strong style={{ color: C.white }}>No uptime, ever.</strong> Nothing records check results over
              time. The six invented uptime figures, up to 99.99%, are deleted.
            </li>
            <li>
              <strong style={{ color: C.white }}>No health grade or performance score.</strong> The 98% / 96% /
              87% / 99% / 72% / 99% scores were typed by hand and measured nothing.
            </li>
            <li>
              <strong style={{ color: C.white }}>No scheduled jobs.</strong> No cron, no worker. The six
              "Scheduled" tasks never existed, including the banking-encryption validation.
            </li>
            <li>
              <strong style={{ color: C.white }}>No alerting or on-call.</strong> The three alerts were
              hardcoded and the Resolve button only filtered a local array.
            </li>
            <li>
              <strong style={{ color: C.white }}>Latency here is one sample.</strong> Four reads, this page
              load, this browser. It is not an average, a percentile, or a trend.
            </li>
            <li>
              <strong style={{ color: C.white }}>No security or compliance certification.</strong> No SOC 2,
              no PCI-DSS, no penetration test. Authorization across the API is unfinished and this page
              prints the server's admission of that verbatim.
            </li>
          </ol>
        </Panel>

        <div style={{
          fontFamily: FM, fontSize: 11, color: C.dim, lineHeight: 1.8,
          borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 8,
        }}>
          Every value on this page is read live from {URLS.integrations}, {URLS.dataindex},{' '}
          {URLS.coverage} and {URLS.maintenance} when the page loads. No value is cached, averaged or stored.
          No provider key is entered in, stored in, or read by this browser.
        </div>
      </div>

      <style>{`
        .twe-spin { animation: twe-spin 1s linear infinite; }
        @keyframes twe-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
