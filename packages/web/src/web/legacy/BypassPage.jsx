/**
 * BypassPage — weigh-station readiness for TruckWithEase.
 *
 * READS (live, server-side data only):
 *   GET /api/hos              — real HOS clocks for the fleet (minutes)
 *   GET /api/safety/:driverId — real 30-day safety score components
 *
 * COMPUTES LOCALLY (federal law, no invented numbers):
 *   Gross / single-axle / tandem-axle limits and the Federal Bridge Formula
 *   W = 500 x [ LN/(N-1) + 12N + 36 ], from 23 U.S.C. 127 and 23 CFR 658.17.
 *   Source: FHWA Bridge Formula Weights
 *   https://ops.fhwa.dot.gov/Freight/publications/brdg_frm_wghts/index.htm
 *
 * REMOVED IN THIS REWRITE (all fabricated — none of it came from a provider):
 *   · BYPASS_HISTORY — 6 hardcoded trips ("Aug 14 Sikeston, MO — BYPASS",
 *     "Aug 12 Joplin, MO — BYPASS", ...) with invented gross weights and
 *     invented Rig Bucks point awards. No bypass has ever been recorded.
 *   · Header stats derived from that array: "5 Bypasses This Month",
 *     "250 Rig Bucks Earned", "110 Minutes Saved" (literally
 *     totalBypasses * 22 — the 22 minutes was made up).
 *   · STATIONS — 8 hardcoded weigh stations with invented distances
 *     ("22 mi", "340 mi"), invented wait times ("waitMin: 7"), and a
 *     "network: Drivewyze / PrePass" label on each. We have no station
 *     dataset and no account with either network.
 *   · simulateBypass() — a 2.4 s setTimeout that returned
 *     `Math.random() < 0.82 ? "BYPASS" : "PULL_IN"` and rendered it as a
 *     bypass decision.
 *   · REQUIREMENTS — 5 rows hardcoded `valid: true` (IRP, IFTA, annual
 *     inspection, safety score, OOS orders). None of those are tracked.
 *   · A `bypassActive` toggle that switched nothing.
 *   · The per-state weight table (STATE_LIMITS / axle limits like
 *     FL 44,000 and NC 38,000) — state-specific, grandfathered and
 *     permit-route limits were not verified against any state statute, so
 *     the calculator now runs federal Interstate limits only and says so.
 *   · Advice to "keep your Drivewyze or PrePass transponder active".
 *   · Off-brand green/navy palette (#16A34A, #0B2A6B, #2563EB, #060f0a).
 *
 * WHAT THIS PAGE DOES NOT CLAIM:
 *   · TruckWithEase is not a bypass provider. It cannot grant a bypass and
 *     is not connected to Drivewyze, PrePass or any state enforcement system.
 *   · A GREEN result means your entered weights are within federal Interstate
 *     limits. It is not permission to pass a scale and it is not a scale ticket.
 *   · Federal limits only. Your state, your route, or your permit may be lower.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Scale, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Info, Clock, Shield,
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

/* ── Federal Interstate limits — 23 U.S.C. 127 / 23 CFR 658.17 ───────────── */
const FED = {
  gross: 80000,
  single: 20000,
  tandem: 34000,
};

/** Federal Bridge Formula: W = 500 [ LN/(N-1) + 12N + 36 ], capped at 80,000. */
function bridgeFormula(lengthFt, axles) {
  if (!(lengthFt > 0) || !(axles > 1)) return null;
  const w = 500 * ((lengthFt * axles) / (axles - 1) + 12 * axles + 36);
  return Math.min(Math.floor(w), FED.gross);
}

function evaluate({ steer, drive, trailer, lengthFt, axles }) {
  const gross = steer + drive + trailer;
  const bridge = bridgeFormula(lengthFt, axles);
  const checks = [
    {
      label: 'Gross vehicle weight',
      value: gross,
      limit: FED.gross,
      cite: '23 U.S.C. 127',
    },
    {
      label: 'Steer axle (single)',
      value: steer,
      limit: FED.single,
      cite: '23 CFR 658.17(c)',
    },
    {
      label: 'Drive axles (tandem)',
      value: drive,
      limit: FED.tandem,
      cite: '23 CFR 658.17(b)',
    },
    {
      label: 'Trailer axles (tandem)',
      value: trailer,
      limit: FED.tandem,
      cite: '23 CFR 658.17(b)',
    },
  ];
  if (bridge !== null) {
    checks.push({
      label: `Bridge Formula (${axles} axles over ${lengthFt} ft)`,
      value: gross,
      limit: bridge,
      cite: '23 U.S.C. 127 Bridge Formula',
    });
  }
  const over = checks.filter((c) => c.value > c.limit);
  const tightest = checks.reduce(
    (acc, c) => Math.min(acc, c.limit - c.value),
    Number.POSITIVE_INFINITY,
  );

  let code;
  let headline;
  if (over.length) code = 'OVER';
  else if (tightest < 1500) code = 'CLOSE';
  else code = 'LEGAL';

  if (code === 'OVER') {
    headline = `Over federal limit on ${over.length} check${over.length > 1 ? 's' : ''}`;
  } else if (code === 'CLOSE') {
    headline = `Within federal limits — ${tightest.toLocaleString()} lb of margin`;
  } else {
    headline = `Within federal limits — ${tightest.toLocaleString()} lb of margin`;
  }

  /* Axle-shift guidance. Physical, not regulatory: sliding the tandems moves
     weight between drives and trailer. Stated as approximate on purpose. */
  const actions = [];
  if (steer > FED.single) {
    actions.push('Steer axle is over 20,000 lb. Slide the fifth wheel back to move weight onto the drives, then re-weigh.');
  }
  if (drive > FED.tandem) {
    actions.push('Drive tandems are over 34,000 lb. Slide the trailer tandems REARWARD to pull weight off the drives, then re-weigh.');
  }
  if (trailer > FED.tandem) {
    actions.push('Trailer tandems are over 34,000 lb. Slide them FORWARD to shift weight onto the drives, then re-weigh.');
  }
  if (bridge !== null && gross > bridge) {
    actions.push(`Bridge Formula limit for this axle group is ${bridge.toLocaleString()} lb. Weight cannot be shifted out of this — you need more axle spread, more axles, or less freight.`);
  }
  if (gross > FED.gross) {
    actions.push(`Gross is ${(gross - FED.gross).toLocaleString()} lb over 80,000. Sliding axles will not fix gross — this needs an offload or an overweight permit.`);
  }
  if (!actions.length) {
    actions.push('No axle correction indicated by the numbers you entered.');
    actions.push('These are federal Interstate limits only. Confirm your state and your route before you rely on this.');
    actions.push('A Cat Scale ticket is the only weight record an officer accepts. This page is not one.');
  }

  return { code, headline, checks, gross, bridge, actions, over };
}

/* ── Fetch helper ─────────────────────────────────────────────────────────── */
async function getJSON(url) {
  const r = await fetch(url);
  let body = null;
  try {
    body = await r.json();
  } catch {
    throw new Error(`${r.status} ${r.statusText} — response was not JSON`);
  }
  if (!r.ok) throw new Error(body?.error || `${r.status} ${r.statusText}`);
  return body;
}

/* ── UI primitives (house pattern) ────────────────────────────────────────── */
function Panel({ title, note, right, icon: Icon, children }) {
  return (
    <section
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
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
        }}
      >
        {Icon ? <Icon size={15} color={GOLD} /> : null}
        <h2
          style={{
            font: `500 13px ${FH}`,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: C.white,
            margin: 0,
            flex: 1,
          }}
        >
          {title}
        </h2>
        {right}
      </header>
      <div style={{ padding: 18 }}>
        {note ? (
          <p
            style={{
              font: `400 12px/1.6 ${FB}`,
              color: C.muted,
              margin: '0 0 14px',
            }}
          >
            {note}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}

function Missing({ label, reason }) {
  return (
    <div
      style={{
        border: `1px dashed #333333`,
        borderRadius: 4,
        padding: 16,
        background: 'rgba(201,168,76,0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <AlertTriangle size={14} color={WARN} />
        <span
          style={{
            font: `500 11px ${FH}`,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: WARN,
          }}
        >
          Missing / Not tracked
        </span>
      </div>
      <div style={{ font: `500 14px ${FH}`, color: C.white, marginBottom: 6 }}>{label}</div>
      <div style={{ font: `400 12px/1.7 ${FB}`, color: C.muted }}>{reason}</div>
    </div>
  );
}

function Stat({ value, label, tone }) {
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 4,
        padding: '14px 16px',
        background: C.black,
      }}
    >
      <div style={{ font: `400 34px ${FD}`, color: tone || GOLDB, lineHeight: 1 }}>{value}</div>
      <div
        style={{
          font: `400 10px ${FH}`,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: C.dim,
          marginTop: 6,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Row({ k, v, mono, tone }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        padding: '9px 0',
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <span style={{ font: `400 12px ${FB}`, color: C.muted }}>{k}</span>
      <span
        style={{
          font: mono ? `400 12px ${FM}` : `500 12px ${FB}`,
          color: tone || C.white,
          textAlign: 'right',
        }}
      >
        {v}
      </span>
    </div>
  );
}

function Err({ msg }) {
  return (
    <div
      style={{
        border: `1px solid ${WARN}`,
        borderRadius: 4,
        padding: 12,
        font: `400 12px ${FM}`,
        color: WARN,
        wordBreak: 'break-word',
      }}
    >
      {msg}
    </div>
  );
}

const inputStyle = {
  background: C.black,
  border: `1px solid ${C.border}`,
  borderRadius: 4,
  padding: '10px 12px',
  color: C.white,
  font: `400 14px ${FM}`,
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
};

const labelStyle = {
  font: `400 10px ${FH}`,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: C.dim,
  display: 'block',
  marginBottom: 6,
};

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function BypassPage() {
  const [steer, setSteer] = useState('12000');
  const [drive, setDrive] = useState('33500');
  const [trailer, setTrailer] = useState('32000');
  const [lengthFt, setLengthFt] = useState('51');
  const [axles, setAxles] = useState('5');
  const [result, setResult] = useState(null);

  const [hos, setHos] = useState({ state: 'loading', data: null, error: null });
  const [safety, setSafety] = useState({ state: 'loading', data: null, error: null });
  const [driverId, setDriverId] = useState('drv-1');
  const alive = useRef(true);

  const loadHos = useCallback(async () => {
    setHos({ state: 'loading', data: null, error: null });
    try {
      const d = await getJSON('/api/hos');
      if (!alive.current) return;
      setHos({ state: 'ok', data: d, error: null });
    } catch (e) {
      if (!alive.current) return;
      setHos({ state: 'error', data: null, error: String(e.message || e) });
    }
  }, []);

  const loadSafety = useCallback(async (id) => {
    setSafety({ state: 'loading', data: null, error: null });
    try {
      const d = await getJSON(`/api/safety/${encodeURIComponent(id)}`);
      if (!alive.current) return;
      setSafety({ state: 'ok', data: d, error: null });
    } catch (e) {
      if (!alive.current) return;
      setSafety({ state: 'error', data: null, error: String(e.message || e) });
    }
  }, []);

  useEffect(() => {
    // Must set true on every mount: React StrictMode mounts twice in dev, and
    // the first cleanup would otherwise leave this false forever.
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    loadHos();
  }, [loadHos]);

  useEffect(() => {
    loadSafety(driverId);
  }, [loadSafety, driverId]);

  function run() {
    const nums = {
      steer: parseInt(steer, 10) || 0,
      drive: parseInt(drive, 10) || 0,
      trailer: parseInt(trailer, 10) || 0,
      lengthFt: parseFloat(lengthFt) || 0,
      axles: parseInt(axles, 10) || 0,
    };
    setResult(evaluate(nums));
  }

  const codeTone =
    result?.code === 'OVER' ? WARN : result?.code === 'CLOSE' ? GOLD : GOLDB;

  const drivers = hos.state === 'ok' ? hos.data?.fleet || [] : [];
  const selected = drivers.find((d) => d.driverId === driverId) || null;

  return (
    <div style={{ background: C.black, minHeight: '100vh', color: C.white, fontFamily: FB }}>
      <style>{`.spin{animation:bpspin 1s linear infinite}@keyframes bpspin{to{transform:rotate(360deg)}}`}</style>

      {/* Header band */}
      <div
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: `linear-gradient(180deg,#111111,${C.black})`,
          padding: '34px 22px 30px',
        }}
      >
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              border: `1px solid ${C.border}`,
              borderRadius: 999,
              padding: '5px 12px',
              marginBottom: 14,
            }}
          >
            <Scale size={13} color={GOLD} />
            <span
              style={{
                font: `400 10px ${FH}`,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: GOLD,
              }}
            >
              Weigh station readiness
            </span>
          </div>
          <h1
            style={{
              font: `400 52px ${FD}`,
              letterSpacing: '0.02em',
              margin: 0,
              lineHeight: 1,
            }}
          >
            SCALE <span style={{ color: GOLDB }}>READY</span>
          </h1>
          <p
            style={{
              font: `400 13px/1.7 ${FB}`,
              color: C.muted,
              maxWidth: 720,
              margin: '12px 0 0',
            }}
          >
            Federal axle-weight and Bridge Formula math, plus your real HOS clock and
            safety score. TruckWithEase is not a bypass provider — it cannot grant a
            bypass and is not connected to Drivewyze, PrePass, or any state
            enforcement system.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 22px 60px' }}>
        {/* Bypass eligibility — honestly missing */}
        <Panel
          title="Bypass eligibility"
          icon={Shield}
          note="No provider is connected. Nothing on this page contacts a bypass network."
        >
          <Missing
            label="Weigh-station bypass decisions"
            reason={
              'A bypass signal comes from Drivewyze or PrePass, who read your carrier safety record ' +
              'from FMCSA and answer at the station. TruckWithEase has no account with either network ' +
              'and no station-approach feed, so there is no eligibility to show, no bypass history, and ' +
              'no minutes saved. The previous version of this page displayed six bypasses, 250 Rig Bucks ' +
              'and 110 minutes saved — all of it invented, and all of it deleted. What we can help with ' +
              'is the paperwork side: getting your PrePass or Drivewyze account set up under your own ' +
              'DOT number.'
            }
          />
        </Panel>

        {/* Weight check */}
        <Panel
          title="Federal weight check"
          icon={Scale}
          note="Computed in this browser from 23 U.S.C. 127 and 23 CFR 658.17: 80,000 lb gross, 20,000 lb single axle, 34,000 lb tandem, and the Federal Bridge Formula W = 500 × [ LN/(N−1) + 12N + 36 ]. Federal Interstate limits only — no state table."
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div>
              <label style={labelStyle}>Steer axle (lb)</label>
              <input style={inputStyle} value={steer} onChange={(e) => setSteer(e.target.value)} inputMode="numeric" />
            </div>
            <div>
              <label style={labelStyle}>Drive tandems (lb)</label>
              <input style={inputStyle} value={drive} onChange={(e) => setDrive(e.target.value)} inputMode="numeric" />
            </div>
            <div>
              <label style={labelStyle}>Trailer tandems (lb)</label>
              <input style={inputStyle} value={trailer} onChange={(e) => setTrailer(e.target.value)} inputMode="numeric" />
            </div>
            <div>
              <label style={labelStyle}>Outer axle spread (ft)</label>
              <input style={inputStyle} value={lengthFt} onChange={(e) => setLengthFt(e.target.value)} inputMode="numeric" />
            </div>
            <div>
              <label style={labelStyle}>Axle count</label>
              <input style={inputStyle} value={axles} onChange={(e) => setAxles(e.target.value)} inputMode="numeric" />
            </div>
          </div>

          <button
            onClick={run}
            style={{
              background: GOLD,
              color: C.black,
              border: 'none',
              borderRadius: 4,
              padding: '11px 22px',
              font: `500 12px ${FH}`,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Run check
          </button>

          {result ? (
            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  border: `1px solid ${codeTone}`,
                  borderRadius: 4,
                  padding: 16,
                  marginBottom: 16,
                  background: 'rgba(201,168,76,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  {result.code === 'OVER' ? (
                    <XCircle size={17} color={WARN} />
                  ) : (
                    <CheckCircle2 size={17} color={codeTone} />
                  )}
                  <span style={{ font: `400 28px ${FD}`, color: codeTone, lineHeight: 1 }}>
                    {result.code === 'OVER'
                      ? 'OVER FEDERAL LIMIT'
                      : result.code === 'CLOSE'
                        ? 'LEGAL — TIGHT MARGIN'
                        : 'WITHIN FEDERAL LIMITS'}
                  </span>
                </div>
                <div style={{ font: `400 12px/1.6 ${FB}`, color: C.muted, marginTop: 8 }}>
                  {result.headline}. This is a calculation from the numbers you typed — it is
                  not a scale ticket and it is not permission to pass a scale.
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <Stat value={result.gross.toLocaleString()} label="Gross entered (lb)" />
                <Stat
                  value={result.bridge === null ? '—' : result.bridge.toLocaleString()}
                  label="Bridge Formula cap (lb)"
                />
                <Stat
                  value={result.over.length}
                  label="Checks over limit"
                  tone={result.over.length ? WARN : GOLDB}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                {result.checks.map((c) => {
                  const ok = c.value <= c.limit;
                  return (
                    <Row
                      key={c.label}
                      k={`${c.label} — ${c.cite}`}
                      v={`${c.value.toLocaleString()} / ${c.limit.toLocaleString()} lb ${ok ? 'OK' : 'OVER'}`}
                      mono
                      tone={ok ? C.white : WARN}
                    />
                  );
                })}
              </div>

              <div
                style={{
                  font: `400 10px ${FH}`,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: C.dim,
                  marginBottom: 8,
                }}
              >
                What to do
              </div>
              <ol style={{ margin: 0, paddingLeft: 20, font: `400 12px/1.8 ${FB}`, color: C.muted }}>
                {result.actions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ol>
            </div>
          ) : null}
        </Panel>

        {/* Driver context — real data */}
        <Panel
          title="Your clock at the scale"
          icon={Clock}
          note="Live from GET /api/hos. Minutes, computed from 49 CFR 395 rules coded in api/routes/hos.ts."
          right={
            <button
              onClick={loadHos}
              style={{
                background: 'none',
                border: `1px solid ${C.border}`,
                borderRadius: 4,
                padding: '5px 10px',
                color: GOLD,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                font: `400 10px ${FH}`,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              <RefreshCw size={11} className={hos.state === 'loading' ? 'spin' : undefined} />
              Refresh
            </button>
          }
        >
          {hos.state === 'loading' ? (
            <div style={{ font: `400 12px ${FM}`, color: C.dim }}>Loading /api/hos …</div>
          ) : hos.state === 'error' ? (
            <Err msg={hos.error} />
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {drivers.map((d) => (
                  <button
                    key={d.driverId}
                    onClick={() => setDriverId(d.driverId)}
                    style={{
                      background: d.driverId === driverId ? GOLD : 'none',
                      color: d.driverId === driverId ? C.black : C.muted,
                      border: `1px solid ${d.driverId === driverId ? GOLD : C.border}`,
                      borderRadius: 4,
                      padding: '6px 12px',
                      font: `500 11px ${FH}`,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    {d.name} · {d.truckNumber}
                  </button>
                ))}
              </div>

              {selected ? (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
                      gap: 12,
                      marginBottom: 14,
                    }}
                  >
                    <Stat
                      value={selected.clocks.drivingRemaining}
                      label="Driving min remaining"
                      tone={selected.clocks.drivingRemaining > 0 ? GOLDB : WARN}
                    />
                    <Stat
                      value={selected.clocks.onDutyWindowRemaining}
                      label="On-duty window min left"
                    />
                    <Stat value={selected.status} label="Duty status" tone={GOLD} />
                  </div>
                  <Row k="Driving used (min)" v={selected.clocks.drivingUsed} mono />
                  <Row k="Driving limit (min)" v={selected.clocks.limits.driving} mono />
                  <Row k="On-duty window limit (min)" v={selected.clocks.limits.onDutyWindow} mono />
                  <Row k="Break required after (min)" v={selected.clocks.limits.breakAfter} mono />
                  {selected.violations?.length ? (
                    selected.violations.map((v, i) => (
                      <Row key={i} k={`Violation — ${v.level}`} v={v.msg} tone={WARN} />
                    ))
                  ) : (
                    <Row k="Violations" v="none returned by /api/hos" tone={C.muted} />
                  )}
                  {selected.clocks.drivingRemaining === 0 ? (
                    <p style={{ font: `400 12px/1.7 ${FB}`, color: WARN, marginTop: 12 }}>
                      This driver has 0 driving minutes remaining, so a legal weight does not
                      make the trip legal. The clock is the harder constraint here.
                    </p>
                  ) : null}
                </>
              ) : (
                <Missing
                  label={`Driver ${driverId} not in the /api/hos fleet response`}
                  reason="Pick a driver above. The list is exactly what the server returned."
                />
              )}
            </>
          )}
        </Panel>

        {/* Safety score — real data, matters because bypass networks read it */}
        <Panel
          title="Safety record"
          icon={Shield}
          note={`Live from GET /api/safety/${driverId}. Bypass networks decide from your FMCSA carrier record, not from this score — this is our own 30-day internal score.`}
        >
          {safety.state === 'loading' ? (
            <div style={{ font: `400 12px ${FM}`, color: C.dim }}>Loading /api/safety/{driverId} …</div>
          ) : safety.state === 'error' ? (
            <Err msg={safety.error} />
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <Stat value={safety.data.score ?? '—'} label={`Score / ${safety.data.windowDays}-day window`} />
                <Stat value={(safety.data.gradeLabel || safety.data.grade || '—').toString()} label="Grade" tone={GOLD} />
                <Stat value={(safety.data.milesObserved ?? 0).toLocaleString()} label="Miles observed" />
              </div>
              <Row k="Insufficient data" v={String(safety.data.insufficientData)} mono />
              <Row
                k="Components scored"
                v={(safety.data.componentsScored || []).join(', ') || '—'}
              />
              <Row
                k="Components missing"
                v={(safety.data.componentsMissing || []).join(', ') || 'none'}
                tone={(safety.data.componentsMissing || []).length ? WARN : C.white}
              />
            </>
          )}
        </Panel>

        {/* What this does not cover */}
        <Panel title="What this does not cover" icon={Info}>
          <ol style={{ margin: 0, paddingLeft: 20, font: `400 12px/1.9 ${FB}`, color: C.muted }}>
            <li>
              Bypass itself. No Drivewyze or PrePass account is connected, so no bypass can be
              granted, recorded, or predicted here.
            </li>
            <li>
              State limits. The calculator runs federal Interstate limits only. Grandfathered
              routes, state-specific axle rules, seasonal frost laws, and permit limits are not
              coded, and the old per-state table was deleted because it was never verified
              against a state statute.
            </li>
            <li>
              Weigh station locations, hours, and wait times. We have no station dataset. The
              eight stations previously listed here, with distances and wait times, were invented.
            </li>
            <li>
              Your actual weight. Nothing here reads a scale. The numbers are whatever you type,
              and only a certified scale ticket counts at a roadside inspection.
            </li>
            <li>
              IRP, IFTA, annual inspection, and out-of-service status. The old page showed all
              five as green checkmarks — they were hardcoded and are not tracked anywhere in the
              platform.
            </li>
          </ol>
        </Panel>

        <p
          style={{
            font: `400 11px/1.7 ${FB}`,
            color: C.dim,
            borderTop: `1px solid ${C.border}`,
            paddingTop: 16,
          }}
        >
          Weight limits and the Bridge Formula are quoted from 23 U.S.C. 127 and 23 CFR 658.17 via
          FHWA, Bridge Formula Weights. TruckWithEase is not a bypass provider, is not a registered
          ELD, and files nothing with any agency. Confirm every weight on a certified scale and
          every limit with the state you are running in.
        </p>
      </div>
    </div>
  );
}
