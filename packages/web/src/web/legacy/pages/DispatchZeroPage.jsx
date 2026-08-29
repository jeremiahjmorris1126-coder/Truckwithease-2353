import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle, RefreshCw, ShieldCheck, Clock, Route, Link2, Database,
  ExternalLink, Lock, Gauge, DollarSign,
} from 'lucide-react';

/**
 * DISPATCH ZERO — the signed dispatch decision ledger.
 *
 * Built 2026-08-29. Nothing on this page is invented. Every number is read
 * from the server, which reads it from the database or from a live provider.
 *
 * Endpoints this page reads (no cache, no client-side math on data):
 *   GET  /api/dispatch-zero/status   — which of the 7 inputs are live right now
 *   GET  /api/loads                  — the loads available to score
 *   POST /api/dispatch-zero/score    — rank every driver against one load
 *   POST /api/dispatch-zero/commit   — seal the decision into the SHA-256 chain
 *   GET  /api/dispatch-zero/ledger   — committed decisions, newest first
 *   GET  /api/dispatch-zero/verify   — recompute the whole chain from seq 1
 *
 * WHAT IS DELIBERATELY NOT CLAIMED HERE:
 *   - The hash chain proves the RECORD was not altered. It does not prove the
 *     INPUTS were correct. Both sentences appear on screen.
 *   - The route is Google Directions — a car route. Not truck-legal. Weight,
 *     axle, hazmat and truck-prohibited restrictions are not applied.
 *   - The clearance layer is the annual, self-reported federal NBI. Zero
 *     flagged bridges is rendered as "no data for that corridor", never "clear".
 *   - When every driver is out of hours, the page says so and blocks every
 *     candidate. No available clock is invented to make the screen look better.
 *   - Fuel price, weather at ETA, broker detention history and IFTA
 *     jurisdiction miles are named as MISSING on every single decision.
 *   - No competitor is named, priced or scored against.
 */

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

async function getJSON(url) {
  const r = await fetch(url);
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(j?.error || `HTTP ${r.status} from ${url}`);
  return j;
}
async function postJSON(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(j?.error || `HTTP ${r.status} from ${url}`);
  return j;
}

function Panel({ title, note, right, icon: Icon, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
        {Icon ? <Icon size={16} color={GOLD} /> : null}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: 13, color: C.white }}>{title}</div>
          {note ? <div style={{ fontSize: 11, color: C.dim, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{note}</div> : null}
        </div>
        {right}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

function Missing({ label, reason }) {
  return (
    <div style={{ border: '1px dashed #333', borderRadius: 4, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <AlertTriangle size={18} color={WARN} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 11, color: WARN }}>Missing / not tracked</div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, color: C.white, marginTop: 4 }}>{label}</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 6, lineHeight: 1.6 }}>{reason}</div>
      </div>
    </div>
  );
}

function Stat({ value, label, tone }) {
  return (
    <div style={{ minWidth: 110 }}>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 34, lineHeight: 1, color: tone === 'warn' ? WARN : GOLDB }}>{value}</div>
      <div style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 10, color: C.muted, marginTop: 6 }}>{label}</div>
    </div>
  );
}

function Row({ k, v, mono, tone }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 13, color: C.muted }}>{k}</div>
      <div style={{ fontSize: 13, color: tone === 'warn' ? WARN : C.white, fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit', textAlign: 'right', wordBreak: 'break-all' }}>{v}</div>
    </div>
  );
}

const Err = ({ msg }) => (
  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: WARN, lineHeight: 1.7 }}>{msg}</div>
);

const inputStyle = {
  background: '#0f0f0f',
  border: `1px solid ${C.border}`,
  borderRadius: 3,
  color: C.white,
  padding: '10px 12px',
  fontSize: 13,
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  width: '100%',
};
const labelStyle = {
  fontFamily: 'Oswald, sans-serif',
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  fontSize: 10,
  color: C.muted,
  marginBottom: 6,
  display: 'block',
};
function Btn({ children, onClick, disabled, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: primary ? GOLD : 'transparent',
        color: primary ? '#0a0a0a' : GOLD,
        border: `1px solid ${primary ? GOLD : C.border}`,
        borderRadius: 3,
        padding: '10px 18px',
        fontFamily: 'Oswald, sans-serif',
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        fontSize: 11,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {children}
    </button>
  );
}

const HEIGHTS = [
  { label: "13'6\" standard dry van / reefer", in: 162 },
  { label: "13'0\" low-profile trailer", in: 156 },
  { label: "14'0\" tall load", in: 168 },
  { label: "13'6\" + 6\" of snow / ice on the roof", in: 168 },
];

const VERDICT = {
  go: { label: 'GO', color: GOLDB, note: 'No blocker found in the checks that ran.' },
  advisory: { label: 'ADVISORY', color: GOLD, note: 'Legal, but something on this decision needs a human to read it.' },
  blocked: { label: 'BLOCKED', color: WARN, note: 'A hard stop was found. Assigning this would require a violation.' },
};

function money(n) {
  if (n === null || n === undefined) return '—';
  return `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function CandidateCard({ cd, onCommit, committing, committed }) {
  const v = VERDICT[cd.verdict] || VERDICT.advisory;
  return (
    <div style={{ border: `1px solid ${C.border}`, borderLeft: `3px solid ${v.color}`, borderRadius: 4, padding: 16, marginBottom: 14, background: '#131313' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 30, color: C.dim, lineHeight: 1, minWidth: 34 }}>#{cd.rank}</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 17, color: C.white, letterSpacing: '0.04em' }}>
            {cd.name} <span style={{ color: C.dim, fontSize: 13 }}>· {cd.truckNumber || 'no truck'}</span>
          </div>
          <div style={{ fontSize: 12, color: C.dim, marginTop: 3 }}>{cd.homeBase || 'home base not recorded'} · {cd.driverId}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.2em', fontSize: 13, color: v.color }}>{v.label}</div>
          <div style={{ fontSize: 11, color: C.dim, maxWidth: 240, marginTop: 3 }}>{v.note}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginTop: 16 }}>
        <div>
          <div style={{ ...labelStyle, marginBottom: 8 }}>Clock (49 CFR 395)</div>
          <Row k="Driving left" v={`${cd.clock.drivingRemainingMin} min`} mono tone={cd.clock.drivingRemainingMin <= 0 ? 'warn' : undefined} />
          <Row k="14-hr window left" v={`${cd.clock.windowRemainingMin} min`} mono tone={cd.clock.windowRemainingMin <= 0 ? 'warn' : undefined} />
          <Row k="Route needs" v={cd.clock.driveTimeNeededMin === null ? '—' : `${cd.clock.driveTimeNeededMin} min`} mono />
          <Row k="Short by" v={cd.clock.clockShortfallMin === null ? '—' : `${cd.clock.clockShortfallMin} min`} mono tone={cd.clock.clockShortfallMin ? 'warn' : undefined} />
        </div>
        <div>
          <div style={{ ...labelStyle, marginBottom: 8 }}>Safety fit</div>
          <Row k="Score (30 d)" v={cd.safety.score === null ? '—' : cd.safety.score} mono />
          <Row k="Grade" v={cd.safety.grade || '—'} />
          <Row k="Insufficient data" v={cd.safety.insufficientData ? 'yes' : 'no'} tone={cd.safety.insufficientData ? 'warn' : undefined} />
          <Row k="Components missing" v={cd.safety.missing?.length ? cd.safety.missing.join(', ') : 'none'} />
        </div>
        <div>
          <div style={{ ...labelStyle, marginBottom: 8 }}>Economics</div>
          <Row k="Rate" v={money(cd.economics.rate)} mono />
          <Row k="Miles" v={cd.economics.miles ?? '—'} mono />
          <Row k="Revenue / mile" v={cd.economics.rpm === null ? '—' : `$${cd.economics.rpm}`} mono />
          <Row
            k="Revenue / clock-hour"
            v={cd.economics.revenuePerClockHour === null ? '—' : `$${cd.economics.revenuePerClockHour}`}
            mono
            tone={cd.economics.revenuePerClockHour === null ? 'warn' : undefined}
          />
          <div style={{ fontSize: 11, color: C.dim, marginTop: 6, lineHeight: 1.6 }}>{cd.economics.revenuePerClockHourNote}</div>
        </div>
      </div>

      {cd.blockers?.length ? (
        <div style={{ marginTop: 14, border: `1px solid ${WARN}33`, borderRadius: 3, padding: 12 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.18em', fontSize: 10, color: WARN, textTransform: 'uppercase' }}>Hard stops at decision time</div>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18, color: C.white, fontSize: 13, lineHeight: 1.8 }}>
            {cd.blockers.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </div>
      ) : null}

      {cd.advisories?.length ? (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.18em', fontSize: 10, color: GOLD, textTransform: 'uppercase' }}>Advisories recorded with the decision</div>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18, color: C.muted, fontSize: 13, lineHeight: 1.8 }}>
            {cd.advisories.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      ) : null}

      <div style={{ marginTop: 14, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <Btn onClick={() => onCommit(cd)} disabled={committing || !!committed} primary={!committed}>
          <Lock size={12} />
          {committed ? `Sealed at seq ${committed.seq}` : committing ? 'Sealing…' : 'Seal this decision'}
        </Btn>
        {committed ? (
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.dim }}>
            chain {committed.chainHash?.slice(0, 24)}…
          </span>
        ) : (
          <span style={{ fontSize: 11, color: C.dim }}>
            Sealing writes this exact screen — inputs, blockers and missing data — into an append-only chain. It does not book the load.
          </span>
        )}
      </div>
    </div>
  );
}

export default function DispatchZeroPage() {
  const [state, setState] = useState('loading');
  const [err, setErr] = useState('');
  const [status, setStatus] = useState(null);
  const [loads, setLoads] = useState([]);
  const [ledger, setLedger] = useState(null);
  const [verify, setVerify] = useState(null);

  const [loadId, setLoadId] = useState('');
  const [heightIn, setHeightIn] = useState(162);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [rate, setRate] = useState('');

  const [scoreState, setScoreState] = useState('idle');
  const [scoreErr, setScoreErr] = useState('');
  const [decision, setDecision] = useState(null);
  const [committing, setCommitting] = useState('');
  const [committed, setCommitted] = useState({});
  const [commitErr, setCommitErr] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    setErr('');
    try {
      const [st, ld, lg, vf] = await Promise.all([
        getJSON('/api/dispatch-zero/status'),
        getJSON('/api/loads').catch(() => ({ loads: [] })),
        getJSON('/api/dispatch-zero/ledger'),
        getJSON('/api/dispatch-zero/verify'),
      ]);
      setStatus(st);
      setLoads(ld?.loads ?? []);
      setLedger(lg);
      setVerify(vf);
      if (!loadId && ld?.loads?.length) setLoadId(ld.loads[0].id);
      setState('ok');
    } catch (e) {
      setErr(e.message);
      setState('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  const runScore = async () => {
    setScoreState('loading');
    setScoreErr('');
    setDecision(null);
    setCommitted({});
    setCommitErr('');
    try {
      const body = loadId === '__adhoc'
        ? { origin, destination, rate: rate === '' ? null : Number(rate), heightIn: Number(heightIn) }
        : { loadId, heightIn: Number(heightIn) };
      const d = await postJSON('/api/dispatch-zero/score', body);
      setDecision(d);
      setScoreState('ok');
    } catch (e) {
      setScoreErr(e.message);
      setScoreState('error');
    }
  };

  const commit = async (cd) => {
    setCommitting(cd.driverId);
    setCommitErr('');
    try {
      const r = await postJSON('/api/dispatch-zero/commit', { driverId: cd.driverId, decision });
      setCommitted((prev) => ({ ...prev, [cd.driverId]: r }));
      const [lg, vf] = await Promise.all([
        getJSON('/api/dispatch-zero/ledger'),
        getJSON('/api/dispatch-zero/verify'),
      ]);
      setLedger(lg);
      setVerify(vf);
      setStatus(await getJSON('/api/dispatch-zero/status'));
    } catch (e) {
      setCommitErr(e.message);
    }
    setCommitting('');
  };

  const adhoc = loadId === '__adhoc';
  const chosen = loads.find((l) => l.id === loadId);

  return (
    <div style={{ background: C.black, minHeight: '100vh', color: C.white, fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
        table.dz{width:100%;border-collapse:collapse;font-size:12px}
        table.dz th{text-align:left;padding:8px 10px;border-bottom:1px solid #222;color:#8a8a8a;font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:.14em;font-size:10px;white-space:nowrap}
        table.dz td{padding:8px 10px;border-bottom:1px solid #1b1b1b;color:#f0ede8;vertical-align:top}
      `}</style>

      {/* header band */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: 'linear-gradient(180deg,#111 0%,#0a0a0a 100%)', padding: '34px 24px 26px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${C.border}`, borderRadius: 3, padding: '5px 10px', marginBottom: 16 }}>
            <ShieldCheck size={13} color={GOLD} />
            <span style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '0.24em', fontSize: 10, color: GOLD }}>
              Signed dispatch decision ledger
            </span>
          </div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 52, lineHeight: 1, margin: 0, letterSpacing: '0.02em' }}>
            DISPATCH <span style={{ color: GOLDB }}>ZERO</span>
          </h1>
          <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.8, maxWidth: 900, marginTop: 14 }}>
            Every platform records what happened. This records <strong style={{ color: C.white }}>why a load was given to a driver</strong> —
            the hours he actually had left, the bridges on his route, his safety record, the money — and then seals that record in a
            SHA-256 chain so nobody can quietly rewrite it after a crash, an audit or a broker dispute. It also ranks drivers by
            <strong style={{ color: C.white }}> revenue per remaining clock-hour</strong>, not revenue per mile, because clock hours are
            the resource you actually run out of.
          </p>

          <div style={{ display: 'flex', gap: 34, flexWrap: 'wrap', marginTop: 22, alignItems: 'flex-end' }}>
            <Stat value={status ? `${status.liveCount}/${status.total}` : '—'} label="Decision inputs live" />
            <Stat value={status?.decisionsCommitted ?? '—'} label="Decisions sealed" />
            <Stat
              value={verify ? (verify.rows === 0 ? 'EMPTY' : verify.ok ? 'INTACT' : 'BROKEN') : '—'}
              label="Chain state"
              tone={verify && verify.rows > 0 && !verify.ok ? 'warn' : undefined}
            />
            <Stat value={status?.missingInputs?.length ?? '—'} label="Inputs named missing" tone="warn" />
            <Btn onClick={load} disabled={state === 'loading'}>
              <RefreshCw size={12} className={state === 'loading' ? 'spin' : undefined} /> Refresh
            </Btn>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '26px 24px 60px' }}>
        {state === 'error' ? (
          <Panel title="Page could not load" icon={AlertTriangle}><Err msg={err} /></Panel>
        ) : null}

        {/* score a load */}
        <Panel
          title="Score a load against the fleet"
          note="POST /api/dispatch-zero/score — reads hos_logs, Google Directions, low_bridges (NBI 54B), computeSafetyScore()"
          icon={Gauge}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div>
              <label style={labelStyle}>Load</label>
              <select style={inputStyle} value={loadId} onChange={(e) => setLoadId(e.target.value)}>
                {loads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.origin} → {l.destination} · {money(l.rate)} · {l.broker || 'no broker'}
                  </option>
                ))}
                <option value="__adhoc">Quote a load that is not on the board…</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Load height (real measured height)</label>
              <select style={inputStyle} value={heightIn} onChange={(e) => setHeightIn(Number(e.target.value))}>
                {HEIGHTS.map((h) => <option key={h.label} value={h.in}>{h.label}</option>)}
              </select>
            </div>
            {adhoc ? (
              <>
                <div>
                  <label style={labelStyle}>Origin</label>
                  <input style={inputStyle} value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Springfield, MO" />
                </div>
                <div>
                  <label style={labelStyle}>Destination</label>
                  <input style={inputStyle} value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Brooklyn, NY" />
                </div>
                <div>
                  <label style={labelStyle}>Rate (USD, optional)</label>
                  <input style={inputStyle} value={rate} onChange={(e) => setRate(e.target.value)} placeholder="2450" />
                </div>
              </>
            ) : null}
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Btn primary onClick={runScore} disabled={scoreState === 'loading'}>
              {scoreState === 'loading' ? <RefreshCw size={12} className="spin" /> : <Gauge size={12} />}
              {scoreState === 'loading' ? 'Scoring every driver…' : 'Score every driver'}
            </Btn>
            <span style={{ fontSize: 11, color: C.dim }}>
              Address autocomplete needs the Google Places API, which is not enabled on this key — type city, state.
            </span>
          </div>

          {chosen && !adhoc ? (
            <div style={{ marginTop: 16, fontSize: 12, color: C.dim, fontFamily: 'JetBrains Mono, monospace' }}>
              {chosen.equipment || 'equipment not recorded'} · {chosen.weight ? `${Number(chosen.weight).toLocaleString()} lb` : 'weight not recorded'} · board miles {chosen.miles ?? '—'} · board RPM {chosen.rpm ?? '—'}
            </div>
          ) : null}

          {scoreState === 'error' ? <div style={{ marginTop: 14 }}><Err msg={scoreErr} /></div> : null}
        </Panel>

        {/* result */}
        {decision ? (
          <>
            <Panel
              title="The decision"
              note={`miles from ${decision.load?.milesSource || 'nowhere'} · drive time from Google Directions · clearance from FHWA NBI 2025`}
              icon={Route}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 22 }}>
                <div>
                  <Row k="Origin (resolved)" v={decision.load?.resolvedOrigin || decision.load?.origin || '—'} />
                  <Row k="Destination (resolved)" v={decision.load?.resolvedDestination || decision.load?.destination || '—'} />
                  <Row k="Route summary" v={decision.load?.routeSummary || '—'} />
                  <Row k="Broker" v={decision.load?.broker || '—'} />
                </div>
                <div>
                  <Row k="Miles" v={decision.load?.miles ?? '—'} mono />
                  <Row k="Drive time" v={decision.load?.driveTimeMin === null ? '—' : `${decision.load.driveTimeMin} min`} mono />
                  <Row k="Rate" v={money(decision.load?.rate)} mono />
                  <Row k="Revenue / mile" v={decision.load?.rpm === null ? '—' : `$${decision.load?.rpm}`} mono />
                </div>
                <div>
                  <Row k="Load height used" v={decision.truck?.height || '—'} mono />
                  <Row k="Bridges flagged on route" v={decision.clearance?.live ? decision.clearance.count : 'scan did not run'} mono tone={decision.clearance?.count ? 'warn' : undefined} />
                  <Row k="Lowest flagged" v={decision.clearance?.lowest ? `${decision.clearance.lowest.clearance} · ${decision.clearance.lowest.state}` : '—'} mono />
                  <Row k="Truck-legal route" v="No — Google Directions has no truck profile" tone="warn" />
                </div>
              </div>

              {decision.feasibilityNote ? (
                <div style={{ marginTop: 18, border: `1px solid ${WARN}`, borderRadius: 3, padding: 14, display: 'flex', gap: 12 }}>
                  <Clock size={18} color={WARN} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: 13, color: C.white, lineHeight: 1.7 }}>{decision.feasibilityNote}</div>
                </div>
              ) : null}
            </Panel>

            <Panel
              title="Ranked candidates"
              note="feasible first, then revenue per remaining clock-hour, then safety score"
              icon={DollarSign}
              right={<span style={{ fontSize: 11, color: C.dim }}>{decision.candidates?.length ?? 0} drivers checked</span>}
            >
              {commitErr ? <div style={{ marginBottom: 14 }}><Err msg={commitErr} /></div> : null}
              {(decision.candidates ?? []).map((cd) => (
                <CandidateCard
                  key={cd.driverId}
                  cd={cd}
                  onCommit={commit}
                  committing={committing === cd.driverId}
                  committed={committed[cd.driverId]}
                />
              ))}
              <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.8, marginTop: 6 }}>
                {decision.novelMetric?.why}
                <br />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: GOLD }}>{decision.novelMetric?.formula}</span>
              </div>
            </Panel>

            {decision.clearance?.live && decision.clearance.count > 0 ? (
              <Panel title="Low bridges inside the route corridor" note={`FHWA NBI 2025 item 54B · corridor ${decision.clearance.corridorMi} mi · ${decision.clearance.pointsSampled} route points sampled`} icon={AlertTriangle}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="dz">
                    <thead>
                      <tr><th>Clearance</th><th>Short by</th><th>State</th><th>Under</th><th>Structure carries</th><th>Location (NBI 9)</th><th>Off route</th><th>Map</th></tr>
                    </thead>
                    <tbody>
                      {decision.clearance.bridges.map((b) => (
                        <tr key={`${b.structureNumber}-${b.lat}-${b.lng}`}>
                          <td style={{ fontFamily: 'JetBrains Mono, monospace', color: WARN, whiteSpace: 'nowrap' }}>
                            {b.clearance}{b.suspect ? <span title="Source value implausibly low — treat as bad state data" style={{ color: C.dim, marginLeft: 6 }}>?</span> : null}
                          </td>
                          <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{b.deficitIn}"</td>
                          <td>{b.state}</td>
                          <td style={{ color: b.under === 'railroad' ? GOLD : C.muted }}>{b.under}</td>
                          <td>{b.facilityCarried || '—'}</td>
                          <td style={{ color: C.muted }}>{b.location || '—'}</td>
                          <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{b.offRouteMi} mi</td>
                          <td>
                            <a href={`https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`} target="_blank" rel="noreferrer" style={{ color: GOLD, textDecoration: 'none', display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                              open <ExternalLink size={11} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            ) : null}
          </>
        ) : null}

        {/* the 7 inputs */}
        <Panel
          title="The seven inputs, checked live"
          note="GET /api/dispatch-zero/status — computed per request, never cached"
          icon={Database}
        >
          <div style={{ overflowX: 'auto' }}>
            <table className="dz">
              <thead><tr><th>#</th><th>Input</th><th>State</th><th>What it actually reads</th><th>Detail</th></tr></thead>
              <tbody>
                {(status?.inputs ?? []).map((i) => (
                  <tr key={i.key}>
                    <td style={{ color: C.dim, fontFamily: 'JetBrains Mono, monospace' }}>{i.n}</td>
                    <td style={{ fontFamily: 'Oswald, sans-serif' }}>{i.label}</td>
                    <td style={{ color: i.live ? GOLDB : WARN, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.12em' }}>{i.live ? 'LIVE' : 'MISSING'}</td>
                    <td style={{ color: C.muted }}>{i.source}</td>
                    <td style={{ color: C.muted }}>{i.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* missing inputs */}
        <Panel title="What every decision does NOT know" note="named on the record, never defaulted to a guess" icon={AlertTriangle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {(status?.missingInputs ?? []).map((m) => (
              <Missing key={m.key} label={m.key} reason={m.why} />
            ))}
          </div>
        </Panel>

        {/* ledger */}
        <Panel
          title="The chain"
          note="GET /api/dispatch-zero/ledger and /verify — every row re-hashed on read"
          icon={Link2}
          right={
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: verify && verify.rows > 0 && !verify.ok ? WARN : C.dim }}>
              {verify ? (verify.rows === 0 ? 'chain empty' : verify.ok ? `intact · ${verify.rows} rows` : `BROKEN at seq ${verify.firstBreakAtSeq}`) : '—'}
            </span>
          }
        >
          {ledger?.empty ? (
            <Missing
              label="No decisions sealed yet"
              reason={ledger.emptyNote || 'Score a load above and seal a decision to start the chain. The first row links to a genesis hash of 64 zeros.'}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="dz">
                <thead>
                  <tr><th>Seq</th><th>Decided</th><th>Driver</th><th>Lane</th><th>Verdict</th><th>Rev / clock-hr</th><th>Blockers</th><th>Chain hash</th><th>Check</th></tr>
                </thead>
                <tbody>
                  {(ledger?.decisions ?? []).map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', color: GOLD }}>{d.seq}</td>
                      <td style={{ color: C.muted, whiteSpace: 'nowrap' }}>{d.createdAt ? new Date(d.createdAt).toLocaleString() : '—'}</td>
                      <td>{d.driverName || d.driverId} {d.truckNumber ? <span style={{ color: C.dim }}>· {d.truckNumber}</span> : null}</td>
                      <td style={{ color: C.muted }}>{d.origin || '—'} → {d.destination || '—'}</td>
                      <td style={{ color: (VERDICT[d.verdict] || VERDICT.advisory).color, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.12em' }}>{(VERDICT[d.verdict] || {}).label || d.verdict}</td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{d.revenuePerClockHour === null ? '—' : `$${d.revenuePerClockHour}`}</td>
                      <td style={{ color: d.blockers?.length ? WARN : C.dim }}>{d.blockers?.length ?? 0}</td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', color: C.dim }}>{d.chainHash?.slice(0, 16)}…</td>
                      <td style={{ color: d.chainOk ? GOLDB : WARN, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.12em' }}>
                        {d.chainOk ? 'OK' : 'FAIL'}
                        {d.failedCheck ? <div style={{ fontSize: 10, color: WARN, letterSpacing: 0 }}>{d.failedCheck}</div> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 18 }}>
            <Row k="Hash algorithm" v="SHA-256 over canonical JSON with sorted keys" mono />
            <Row k="Payload hash" v="sha256(canonicalJson(decision))" mono />
            <Row k="Chain hash" v="sha256(seq | prevHash | payloadHash)" mono />
            <Row k="Genesis prevHash" v={verify?.genesisPrevHash ? `${verify.genesisPrevHash.slice(0, 20)}… (64 zeros)` : '—'} mono />
            <Row k="Head" v={verify?.headChainHash ? `${verify.headChainHash.slice(0, 32)}…` : 'no rows yet'} mono />
            <Row k="Rows append-only" v="Yes — nothing in this table is ever updated or deleted by the app" />
          </div>
        </Panel>

        {/* proves / does not prove */}
        <Panel title="What this proves — and what it does not" note="read this before you show it to an attorney or an auditor" icon={ShieldCheck}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            <div>
              <div style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.18em', fontSize: 11, color: GOLDB, textTransform: 'uppercase' }}>It proves</div>
              <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: C.muted, fontSize: 13, lineHeight: 1.9 }}>
                <li>{verify?.proves || 'Rows were written in order and none has been altered since.'}</li>
                <li>Exactly which HOS clock numbers the dispatcher had in front of him at that moment.</li>
                <li>That the low-bridge corridor scan and the driver's safety score were pulled before the assignment, not after.</li>
                <li>Which data was admittedly unknown at decision time, in writing, before anything went wrong.</li>
              </ul>
            </div>
            <div>
              <div style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.18em', fontSize: 11, color: WARN, textTransform: 'uppercase' }}>It does not prove</div>
              <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: C.muted, fontSize: 13, lineHeight: 1.9 }}>
                <li>{verify?.doesNotProve || 'That the inputs were correct.'}</li>
                <li>That the route is legal for a truck. It is a car route from Google Directions.</li>
                <li>That a corridor with zero flagged bridges is clear — the federal NBI is annual and incomplete.</li>
                <li>That the ELD logs feeding the HOS clock are certified. TruckWithEase is not a registered ELD.</li>
              </ul>
            </div>
          </div>
        </Panel>

        {/* roadmap */}
        <Panel title="What would make this smarter" icon={Route}>
          <ol style={{ margin: 0, paddingLeft: 18, color: C.muted, fontSize: 13, lineHeight: 1.9 }}>
            <li>Truck-legal miles. A PC*MILER-class engine would replace the car route and hand us IFTA jurisdiction miles at the same time — the single biggest gap on this page.</li>
            <li>Fuel price at the pickup PADD, so the decision records margin instead of gross revenue.</li>
            <li>Weather at ETA, joined to the decision instead of fetched separately, so a winter mountain lane is on the record.</li>
            <li>Broker detention history, once detention claims are being logged — dwell is the hidden clock killer.</li>
            <li>Anchoring: publish the head chain hash daily somewhere outside this database, so the chain cannot be rebuilt wholesale.</li>
            <li>Export a single decision as a signed PDF for an attorney, an insurer or a DOT auditor.</li>
            <li>A decision on the phone: score and seal from the cab, so the record is written at the moment of the call.</li>
          </ol>
        </Panel>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, color: C.dim, fontSize: 12, lineHeight: 1.8 }}>
          {status?.notes?.chain}
          <br />
          {status?.notes?.route}
          <br />
          {status?.notes?.clearance}
          <br />
          TruckWithEase is not a registered ELD, does not certify routes, does not survey bridges, and files nothing with any agency.
          This ledger is a business record of a dispatch decision. It is not a legal opinion and it is not a compliance certification.
        </div>
      </div>
    </div>
  );
}
