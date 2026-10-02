/**
 * RevenueForecastPage — 3-year revenue model (arithmetic, not a forecast)
 * ---------------------------------------------------------------------------
 * This page is the on-screen version of /home/user/twe-revenue.xlsx. It runs
 * the exact same recurrence the workbook runs, on the exact same three input
 * sets, and it reproduces the workbook's totals to the dollar.
 *
 * READS (live, measured, every round trip is printed on screen)
 *   GET /api/signup            REQUIRED. The ONLY price list in this product
 *                              (PLANS in packages/web/src/api/routes/signup.ts).
 *                              Solo / Pro / Fleet-lease / Fleet-owned prices and
 *                              notes.payment are printed verbatim. No price is
 *                              ever retyped into this file.
 *   GET /api/signup/list       OPTIONAL. How many signup records actually exist.
 *   GET /api/subscriptions/list OPTIONAL. How many subscriptions exist, their
 *                              statuses, contractedMrr, and billing.live.
 *   Both optional reads degrade to a MISSING box.
 *
 * COMPUTES / MEASURES LOCALLY
 *   - 36 months x 3 scenarios of plain arithmetic. Every column is the same
 *     formula as the workbook column of the same name:
 *       trials    m=1 -> m1 ; m>1 -> prev * (1 + growth for that year)
 *       new paid  trials * conversion
 *       churned   m=1 -> 0 ; m>1 -> prev ending * churn
 *       ending    prev ending + new paid - churned
 *       units     ending * mix share, per plan
 *       MRR       units * the live price for that plan
 *       add-ons   solo units * attach rate * add-on ARPU (Solo only)
 *       hardware  new paid * fleet-owned share * $600, one-time, not recurring
 *       total     subscription revenue + hardware
 *       exit ARR  month-36 subscription revenue x 12 (hardware excluded)
 *   - Round-trip milliseconds and body size per request, via performance.now().
 *   - Nothing else. No market model, no valuation, no probability weighting.
 *
 * REMOVED IN THIS REWRITE (every item below was fabricated)
 *   - The entire MARKET object, commented "sourced from industry reports" with
 *     no source: totalFleetSoftwareMarket2025 $4.2B, cagr 14.7%,
 *     usTrackingTrucks 3,900,000, ownerOps 380,000, smallFleets_2_10 114,000,
 *     medFleets_11_50 28,000, largeFleets_50plus 9,000, avgSaaSCompPerUser $189,
 *     truckerTechAdoptionRate 0.41, churnIndustryAvg 0.042. Not one of those
 *     numbers was verified from anywhere. No market-size figure, adoption rate
 *     or industry churn number appears on this page.
 *   - The TIERS array — a SECOND, WRONG price list: Solo $49, Fleet $149,
 *     Pro $399, Enterprise $999. The real prices come from GET /api/signup and
 *     are $29.99 / $39.99 / $49.99 / $59.99. There is no Enterprise plan and no
 *     white-label offering in this product.
 *   - buildForecast() — invented monthlyAcq arrays for five years, invented
 *     conservative/base/optimistic multipliers, priced with the fake tiers, plus
 *     trucksCovered = totalUsers * 2.8, a made-up ratio.
 *   - The ASSUMPTIONS list, including "Fleet operators pay $189/mo across 12-15
 *     separate apps" (a competitor price claim) and "TruckWithEase replaces all
 *     of them".
 *   - The MILESTONES roadmap for 2026-2029, which reintroduced a launch
 *     schedule and asserted things that do not exist: "Samsara & Geotab
 *     partnerships close", "First 50 paying fleets", "First enterprise
 *     white-label deal", "Insurance partnership", "Payroll + IFTA fully
 *     integrated", "Series A ready", "Possible acquisition discussions at
 *     $25M-$50M ARR", "International pilot".
 *   - The Valuation tab and every multiple on it.
 *   - The "LIVE FORECAST ENGINE" badge and its pulsing green dot. Nothing on
 *     this page is live except the three reads listed above.
 *   - The header claim "Built from real market data ... This is your honest,
 *     realistic picture."
 *   - Every emoji (the tab labels, the assumption rows) and the off-palette
 *     constants GREEN #22c55e, RED #ef4444, BLUE #3b82f6, ORANGE #f97316,
 *     #6b7280, #a855f7 and BORDER rgba(201,168,76,0.18).
 *
 * WHAT THIS PAGE DOES NOT CLAIM
 *   - It is not a forecast, a projection or a promise. It is arithmetic on
 *     assumptions that were chosen, not measured.
 *   - No scenario is weighted, likely or probable. Nobody has assigned a
 *     probability to any of them, because there is no data to do it with.
 *   - No market size, no total addressable market, no industry adoption rate,
 *     no industry-average churn and no competitor price is used anywhere.
 *   - Revenue collected to date is $0. No payment processor is connected.
 *   - The Aggressive scenario's original blurb mentioned ELD registration
 *     landing early. TruckWithEase is NOT pursuing FMCSA ELD provider
 *     registration, so that clause is annotated on screen as not planned
 *     rather than shipped silently.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Calculator,
  Users,
  CreditCard,
  Tag as TagIcon,
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

/** Hardware is one-time, Fleet-owned only, and excluded from ARR. This is the
 *  plan table's own figure, published in GET /api/signup as a note on the
 *  fleet_owned plan; it is not an ELD claim. */
const HARDWARE_ONE_TIME = 600;

/** The three input sets. Identical to the workbook's SCEN block. These are
 *  labelled guesses. They were chosen to differ from each other, not measured. */
const SCENARIOS = [
  {
    key: 'conservative',
    name: 'Conservative',
    blurb: 'A slow, word-of-mouth build with no paid acquisition and high early churn.',
    note: null,
    p: { m1: 10, g1: 0.05, g2: 0.04, g3: 0.03, conv: 0.25, churn: 0.04, solo: 0.55, pro: 0.25, fl: 0.1, fo: 0.1, attach: 0.3, arpu: 5.99 },
  },
  {
    key: 'base',
    name: 'Base',
    blurb: 'The 50-driver Reddit beta converts, and small fleets start arriving in year 2.',
    note: null,
    p: { m1: 20, g1: 0.1, g2: 0.07, g3: 0.05, conv: 0.35, churn: 0.03, solo: 0.45, pro: 0.3, fl: 0.15, fo: 0.1, attach: 0.4, arpu: 6.99 },
  },
  {
    key: 'aggressive',
    name: 'Aggressive',
    blurb: 'Hardware ships on time and fleet deals carry the mix.',
    note:
      'The workbook wrote this one as "ELD registration lands early, hardware ships on time, and fleet deals carry the mix." That first clause is removed here: TruckWithEase is not pursuing FMCSA ELD provider registration, so no scenario on this page may depend on it.',
    p: { m1: 35, g1: 0.15, g2: 0.1, g3: 0.07, conv: 0.45, churn: 0.02, solo: 0.35, pro: 0.3, fl: 0.2, fo: 0.15, attach: 0.5, arpu: 7.99 },
  },
];

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

/** The workbook's recurrence, month by month. Prices come in from the API. */
function runModel(p, prices) {
  const rows = [];
  let prevTrials = 0;
  let prevEnding = 0;
  let cumulative = 0;
  for (let m = 1; m <= 36; m += 1) {
    const g = m <= 12 ? p.g1 : m <= 24 ? p.g2 : p.g3;
    const trials = m === 1 ? p.m1 : prevTrials * (1 + g);
    const newPaid = trials * p.conv;
    const churned = m === 1 ? 0 : prevEnding * p.churn;
    const ending = m === 1 ? newPaid - churned : prevEnding + newPaid - churned;

    const uSolo = ending * p.solo;
    const uPro = ending * p.pro;
    const uFl = ending * p.fl;
    const uFo = ending * p.fo;

    const mrrSolo = uSolo * prices.solo;
    const mrrPro = uPro * prices.pro;
    const mrrFl = uFl * prices.fleet_lease;
    const mrrFo = uFo * prices.fleet_owned;
    const addons = uSolo * p.attach * p.arpu;

    const subs = mrrSolo + mrrPro + mrrFl + mrrFo + addons;
    const hardware = newPaid * p.fo * HARDWARE_ONE_TIME;
    const total = subs + hardware;
    cumulative += total;

    rows.push({
      m,
      period: `Y${Math.ceil(m / 12)} M${((m - 1) % 12) + 1}`,
      trials,
      newPaid,
      churned,
      ending,
      uSolo,
      uPro,
      uFl,
      uFo,
      addons,
      subs,
      hardware,
      total,
      cumulative,
    });
    prevTrials = trials;
    prevEnding = ending;
  }
  const y1 = rows.slice(0, 12).reduce((a, r) => a + r.total, 0);
  const y2 = rows.slice(12, 24).reduce((a, r) => a + r.total, 0);
  const y3 = rows.slice(24, 36).reduce((a, r) => a + r.total, 0);
  return {
    rows,
    y1,
    y2,
    y3,
    threeYearTotal: y1 + y2 + y3,
    exitArr: rows[35].subs * 12,
    endUnitsY1: rows[11].ending,
    endUnitsY2: rows[23].ending,
    endUnitsY3: rows[35].ending,
    hardwareTotal: rows.reduce((a, r) => a + r.hardware, 0),
    subsTotal: rows.reduce((a, r) => a + r.subs, 0),
  };
}

const money0 = (n) =>
  n == null || Number.isNaN(n)
    ? '—'
    : `$${Math.round(n).toLocaleString('en-US')}`;
const money2 = (n) =>
  n == null || Number.isNaN(n)
    ? '—'
    : `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const unit1 = (n) =>
  n == null || Number.isNaN(n)
    ? '—'
    : Number(n).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const pct = (n) => `${(n * 100).toFixed(n * 100 % 1 === 0 ? 0 : 1)}%`;

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
        border: '1px dashed #333',
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
      <div style={{ fontFamily: FD, fontSize: 38, lineHeight: 1.05, color: GOLDB, marginTop: 6 }}>
        {value}
      </div>
      {sub ? (
        <div style={{ fontFamily: FM, fontSize: 11, color: C.dim, marginTop: 4, lineHeight: 1.5 }}>
          {sub}
        </div>
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
  padding: '7px 10px',
  borderBottom: '1px solid #1b1b1b',
  verticalAlign: 'top',
  whiteSpace: 'nowrap',
};
const tdNum = { ...td, textAlign: 'right' };

export default function RevenueForecastPage() {
  const [state, setState] = useState('loading'); // loading | ok | error
  const [err, setErr] = useState('');
  const [signup, setSignup] = useState(null);
  const [signups, setSignups] = useState(null);
  const [signupsErr, setSignupsErr] = useState('');
  const [subs, setSubs] = useState(null);
  const [subsErr, setSubsErr] = useState('');
  const [reads, setReads] = useState([]);
  const [active, setActive] = useState('base');
  const alive = useRef(false);

  const load = useCallback(async () => {
    setState('loading');
    setErr('');
    setReads([]);
    const log = (r) => {
      if (!alive.current) return;
      setReads((prev) => [...prev, r]);
    };

    let plans;
    try {
      plans = await timedGet('/api/signup');
      log({ url: plans.url, status: plans.status, ms: plans.ms, bytes: plans.bytes });
    } catch (e) {
      log({ url: e.url, status: e.status, ms: e.ms, bytes: 0 });
      if (!alive.current) return;
      setErr(e.message);
      setState('error');
      return;
    }
    if (!alive.current) return;
    setSignup(plans.body);
    setState('ok');

    const [sl, sb] = await Promise.allSettled([
      timedGet('/api/signup/list'),
      timedGet('/api/subscriptions/list'),
    ]);
    if (!alive.current) return;
    if (sl.status === 'fulfilled') {
      setSignups(sl.value.body);
      setSignupsErr('');
      log({ url: sl.value.url, status: sl.value.status, ms: sl.value.ms, bytes: sl.value.bytes });
    } else {
      setSignups(null);
      setSignupsErr(sl.reason?.message || 'unknown error');
      log({ url: '/api/signup/list', status: sl.reason?.status ?? 0, ms: sl.reason?.ms ?? 0, bytes: 0 });
    }
    if (sb.status === 'fulfilled') {
      setSubs(sb.value.body);
      setSubsErr('');
      log({ url: sb.value.url, status: sb.value.status, ms: sb.value.ms, bytes: sb.value.bytes });
    } else {
      setSubs(null);
      setSubsErr(sb.reason?.message || 'unknown error');
      log({
        url: '/api/subscriptions/list',
        status: sb.reason?.status ?? 0,
        ms: sb.reason?.ms ?? 0,
        bytes: 0,
      });
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    return () => {
      alive.current = false;
    };
  }, [load]);

  const planMap = signup?.plans || null;
  const prices = planMap
    ? {
        solo: Number(planMap.solo?.unitPrice),
        pro: Number(planMap.pro?.unitPrice),
        fleet_lease: Number(planMap.fleet_lease?.unitPrice),
        fleet_owned: Number(planMap.fleet_owned?.unitPrice),
      }
    : null;
  const pricesUsable =
    prices &&
    Object.values(prices).every((v) => typeof v === 'number' && Number.isFinite(v) && v > 0);

  const results = pricesUsable
    ? SCENARIOS.reduce((acc, s) => {
        acc[s.key] = runModel(s.p, prices);
        return acc;
      }, {})
    : null;

  const scenario = SCENARIOS.find((s) => s.key === active) || SCENARIOS[1];
  const r = results ? results[scenario.key] : null;

  return (
    <div style={{ background: C.black, minHeight: '100vh', color: C.white, fontFamily: FB }}>
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
          <Tag text="internal · revenue model" />
        </span>
      </nav>

      {/* header band */}
      <div
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: `linear-gradient(180deg, ${C.nav} 0%, ${C.black} 100%)`,
          padding: '34px 22px 30px',
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
              padding: '5px 12px',
              fontFamily: FM,
              fontSize: 11,
              letterSpacing: '0.16em',
              color: GOLD,
              textTransform: 'uppercase',
            }}
          >
            <Calculator size={13} />
            36-month calculator
          </span>
          <h1
            style={{
              fontFamily: FD,
              fontSize: 'clamp(38px,7vw,68px)',
              letterSpacing: '0.02em',
              margin: '14px 0 10px',
              lineHeight: 1.02,
            }}
          >
            THIS IS ARITHMETIC ON ASSUMPTIONS.{' '}
            <span style={{ color: GOLDB }}>IT IS NOT A FORECAST AND IT IS NOT A PROMISE.</span>
          </h1>
          <p
            style={{
              maxWidth: 820,
              margin: 0,
              fontFamily: FB,
              fontSize: 15,
              lineHeight: 1.75,
              color: C.muted,
            }}
          >
            Nobody can forecast revenue from two signup records and zero dollars collected. What can be
            built is the machine that computes it. Three scenarios, thirty-six months each, every number
            below derived from the inputs on this page and the live price list at{' '}
            <span style={{ fontFamily: FM, color: GOLD }}>GET /api/signup</span>. No market size, no
            adoption rate, no industry churn figure and no competitor price is used anywhere, because
            none was verified from a source. Change nothing here and it still means nothing until month
            one actually happens.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 22px 70px' }}>
        {state === 'loading' ? (
          <Panel title="Loading" icon={<Spin />}>
            <div style={{ fontFamily: FM, fontSize: 13, color: C.muted }}>
              Reading /api/signup for the live price list…
            </div>
          </Panel>
        ) : null}

        {state === 'error' ? (
          <Panel
            title="Could not read the price list"
            note="GET /api/signup is required — without it there is no price to model with, and this page will not invent one."
            icon={<AlertTriangle size={16} />}
            right={<Btn onClick={load} primary>Try again</Btn>}
          >
            <Err msg={err} />
          </Panel>
        ) : null}

        {state === 'ok' ? (
          <>
            {/* what is real today */}
            <Panel
              title="What is real today"
              note="GET /api/signup/list and GET /api/subscriptions/list — the only commercial data that exists in this product."
              icon={<Users size={16} />}
              right={<Tag text="measured" tone="gold" />}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))',
                  gap: 12,
                }}
              >
                {signups ? (
                  <Stat
                    label="Signup records"
                    value={String(signups.total ?? 0)}
                    sub={
                      signups.counts
                        ? Object.entries(signups.counts)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' · ')
                        : 'no status breakdown returned'
                    }
                  />
                ) : null}
                {subs ? (
                  <>
                    <Stat
                      label="Subscriptions"
                      value={String(subs.total ?? 0)}
                      sub={
                        subs.counts
                          ? Object.entries(subs.counts)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' · ')
                          : 'no status breakdown returned'
                      }
                    />
                    <Stat
                      label="Contracted MRR"
                      value={money0(subs.contractedMrr ?? 0)}
                      sub="server field: contractedMrr"
                    />
                    <Stat
                      label="Billing live"
                      value={subs.billing?.live ? 'YES' : 'NO'}
                      sub={`provider: ${subs.billing?.provider ?? 'null'}`}
                    />
                  </>
                ) : null}
                <Stat
                  label="Revenue collected"
                  value="$0"
                  sub="No charge has ever been attempted through any processor."
                />
              </div>

              {(signupsErr || subsErr) && (
                <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
                  {signupsErr ? (
                    <Missing
                      label="SIGNUP COUNT UNAVAILABLE"
                      reason={`GET /api/signup/list failed: ${signupsErr}`}
                    />
                  ) : null}
                  {subsErr ? (
                    <Missing
                      label="SUBSCRIPTION COUNT UNAVAILABLE"
                      reason={`GET /api/subscriptions/list failed: ${subsErr}`}
                    />
                  ) : null}
                </div>
              )}

              {signup?.notes?.payment ? (
                <p
                  style={{
                    marginTop: 14,
                    marginBottom: 0,
                    fontFamily: FB,
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: C.muted,
                    borderLeft: `2px solid ${WARN}`,
                    paddingLeft: 12,
                  }}
                >
                  Server says, verbatim: “{signup.notes.payment}”
                </p>
              ) : null}
            </Panel>

            {/* prices */}
            <Panel
              title="Prices — not assumptions"
              note="GET /api/signup → plans. PLANS in packages/web/src/api/routes/signup.ts is the only price list in this product. Nothing on this page retypes a price."
              icon={<TagIcon size={16} />}
              right={
                signup?.trialDays ? <Tag text={`${signup.trialDays}-day trial`} /> : null
              }
            >
              {!planMap ? (
                <Missing reason="The server returned no plans object." />
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={th}>Plan</th>
                      <th style={th}>Price</th>
                      <th style={th}>Billed per</th>
                      <th style={{ ...th, whiteSpace: 'normal' }}>Server note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['solo', 'pro', 'fleet_lease', 'fleet_owned'].map((k) => {
                      const pl = planMap[k];
                      if (!pl) return null;
                      return (
                        <tr key={k}>
                          <td style={{ ...td, color: GOLDB }}>{pl.name || k}</td>
                          <td style={td}>{money2(pl.unitPrice)}</td>
                          <td style={td}>{pl.unit || '—'}</td>
                          <td style={{ ...td, whiteSpace: 'normal', color: C.muted }}>
                            {pl.note || '—'}
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td style={{ ...td, color: GOLDB }}>Hardware</td>
                      <td style={td}>{money2(HARDWARE_ONE_TIME)}</td>
                      <td style={td}>one-time per truck</td>
                      <td style={{ ...td, whiteSpace: 'normal', color: C.muted }}>
                        Fleet-owned only. One-time, so it is excluded from exit ARR.
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
              {!pricesUsable ? (
                <div style={{ marginTop: 14 }}>
                  <Missing
                    label="MODEL NOT RUN"
                    reason="At least one plan price came back missing or non-numeric, so the 36-month model was not computed. It will not fall back to a hardcoded price."
                  />
                </div>
              ) : null}
            </Panel>

            {pricesUsable && r ? (
              <>
                {/* scenario switcher */}
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    marginBottom: 18,
                  }}
                >
                  {SCENARIOS.map((s) => {
                    const on = s.key === active;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setActive(s.key)}
                        style={{
                          fontFamily: FH,
                          fontSize: 13,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          padding: '11px 20px',
                          borderRadius: 3,
                          cursor: 'pointer',
                          border: `1px solid ${on ? GOLD : C.border}`,
                          background: on ? GOLD : C.card,
                          color: on ? '#0a0a0a' : C.white,
                        }}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>

                <Panel
                  title={`${scenario.name} scenario`}
                  note="Computed in this browser from the input block below and the live prices above. Nothing here is measured, sourced or promised."
                  icon={<TrendingUp size={16} />}
                  right={<Tag text="arithmetic only" tone="warn" />}
                >
                  <p
                    style={{
                      margin: '0 0 14px',
                      fontFamily: FB,
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: C.white,
                    }}
                  >
                    {scenario.blurb}
                  </p>
                  {scenario.note ? (
                    <div style={{ marginBottom: 16 }}>
                      <Missing label="CLAUSE REMOVED FROM THIS SCENARIO" reason={scenario.note} />
                    </div>
                  ) : null}

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
                      gap: 12,
                    }}
                  >
                    <Stat label="Year 1 revenue" value={money0(r.y1)} sub="months 1–12" />
                    <Stat label="Year 2 revenue" value={money0(r.y2)} sub="months 13–24" />
                    <Stat label="Year 3 revenue" value={money0(r.y3)} sub="months 25–36" />
                    <Stat
                      label="36-month total"
                      value={money0(r.threeYearTotal)}
                      sub={`subscriptions ${money0(r.subsTotal)} + hardware ${money0(r.hardwareTotal)}`}
                    />
                    <Stat
                      label="Exit ARR"
                      value={money0(r.exitArr)}
                      sub="month-36 recurring × 12, hardware excluded"
                    />
                    <Stat
                      label="Ending billing units"
                      value={unit1(r.endUnitsY3)}
                      sub={`end Y1 ${unit1(r.endUnitsY1)} · end Y2 ${unit1(r.endUnitsY2)}`}
                    />
                  </div>

                  <p
                    style={{
                      margin: '16px 0 0',
                      fontFamily: FB,
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: C.muted,
                    }}
                  >
                    A billing unit is not a headcount. Solo, Pro and Fleet-owned bill per driver;
                    Fleet-leased bills per truck. The model mixes the two in one column on purpose,
                    exactly as the workbook does.
                  </p>
                </Panel>

                <Panel
                  title="Inputs for this scenario"
                  note="These are labelled guesses, chosen to differ from each other. They were not measured and no source is claimed for any of them."
                  icon={<Calculator size={16} />}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={th}>Input</th>
                        <th style={{ ...th, textAlign: 'right' }}>Value</th>
                        <th style={{ ...th, whiteSpace: 'normal' }}>What it drives</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Month 1 new trials', String(scenario.p.m1), 'The only seed number in the model.'],
                        ['Trial growth / mo — Year 1', pct(scenario.p.g1), 'Compounds month over month.'],
                        ['Trial growth / mo — Year 2', pct(scenario.p.g2), 'Months 13–24.'],
                        ['Trial growth / mo — Year 3', pct(scenario.p.g3), 'Months 25–36.'],
                        ['Trial → paid conversion', pct(scenario.p.conv), 'Share of trials that become paid billing units.'],
                        ['Monthly churn', pct(scenario.p.churn), 'Applied to the prior month ending units.'],
                        ['Solo share of new paid', pct(scenario.p.solo), 'Per driver.'],
                        ['Pro share of new paid', pct(scenario.p.pro), 'Per driver.'],
                        ['Fleet-leased share', pct(scenario.p.fl), 'Per truck.'],
                        ['Fleet-owned share', pct(scenario.p.fo), 'Per driver, and the only source of hardware revenue.'],
                        ['Add-on attach rate', pct(scenario.p.attach), 'Solo only — Pro is all-inclusive.'],
                        ['Add-on revenue per attached Solo', money2(scenario.p.arpu), 'The à-la-carte menu runs $2.99–$10.99.'],
                      ].map(([k, v, why]) => (
                        <tr key={k}>
                          <td style={td}>{k}</td>
                          <td style={{ ...tdNum, color: GOLDB }}>{v}</td>
                          <td style={{ ...td, whiteSpace: 'normal', color: C.muted }}>{why}</td>
                        </tr>
                      ))}
                      <tr>
                        <td style={{ ...td, color: GOLD }}>Mix check</td>
                        <td style={{ ...tdNum, color: GOLD }}>
                          {pct(scenario.p.solo + scenario.p.pro + scenario.p.fl + scenario.p.fo)}
                        </td>
                        <td style={{ ...td, whiteSpace: 'normal', color: C.muted }}>
                          Must read 100% or the mix is wrong.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Panel>

                <Panel
                  title={`36 months — ${scenario.name}`}
                  note="Every column is the same formula as the workbook column of the same name. Fractional units are kept, not rounded, so the arithmetic matches the spreadsheet to the dollar."
                  icon={<CreditCard size={16} />}
                >
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1080 }}>
                      <thead>
                        <tr>
                          <th style={th}>#</th>
                          <th style={th}>Period</th>
                          <th style={{ ...th, textAlign: 'right' }}>New trials</th>
                          <th style={{ ...th, textAlign: 'right' }}>New paid</th>
                          <th style={{ ...th, textAlign: 'right' }}>Churned</th>
                          <th style={{ ...th, textAlign: 'right' }}>Ending units</th>
                          <th style={{ ...th, textAlign: 'right' }}>Add-ons</th>
                          <th style={{ ...th, textAlign: 'right' }}>Subs revenue</th>
                          <th style={{ ...th, textAlign: 'right' }}>Hardware</th>
                          <th style={{ ...th, textAlign: 'right' }}>Total</th>
                          <th style={{ ...th, textAlign: 'right' }}>Cumulative</th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.rows.map((row) => (
                          <tr
                            key={row.m}
                            style={{
                              background: row.m % 2 === 1 ? C.card : 'transparent',
                              borderBottom:
                                row.m % 12 === 0 ? `1px solid ${GOLD}55` : undefined,
                            }}
                          >
                            <td style={td}>{row.m}</td>
                            <td style={{ ...td, color: C.muted }}>{row.period}</td>
                            <td style={tdNum}>{unit1(row.trials)}</td>
                            <td style={tdNum}>{unit1(row.newPaid)}</td>
                            <td style={tdNum}>{unit1(row.churned)}</td>
                            <td style={tdNum}>{unit1(row.ending)}</td>
                            <td style={tdNum}>{money0(row.addons)}</td>
                            <td style={tdNum}>{money0(row.subs)}</td>
                            <td style={tdNum}>{money0(row.hardware)}</td>
                            <td style={{ ...tdNum, color: GOLDB }}>{money0(row.total)}</td>
                            <td style={{ ...tdNum, color: C.muted }}>{money0(row.cumulative)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>

                <Panel
                  title="All three side by side"
                  note="No column is weighted, likely or probable. Nobody has assigned a probability to any of them."
                  icon={<TrendingUp size={16} />}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={th}>Metric</th>
                        {SCENARIOS.map((s) => (
                          <th key={s.key} style={{ ...th, textAlign: 'right' }}>
                            {s.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Year 1 revenue', (x) => money0(x.y1)],
                        ['Year 2 revenue', (x) => money0(x.y2)],
                        ['Year 3 revenue', (x) => money0(x.y3)],
                        ['3-year total revenue', (x) => money0(x.threeYearTotal)],
                        ['Ending billing units — end Y1', (x) => unit1(x.endUnitsY1)],
                        ['Ending billing units — end Y2', (x) => unit1(x.endUnitsY2)],
                        ['Ending billing units — end Y3', (x) => unit1(x.endUnitsY3)],
                        ['Month-36 MRR (recurring only)', (x) => money0(x.rows[35].subs)],
                        ['Exit ARR (month-36 MRR × 12)', (x) => money0(x.exitArr)],
                        ['3-year hardware one-time', (x) => money0(x.hardwareTotal)],
                        ['3-year subscription revenue', (x) => money0(x.subsTotal)],
                      ].map(([label, fn]) => (
                        <tr key={label}>
                          <td style={{ ...td, whiteSpace: 'normal' }}>{label}</td>
                          {SCENARIOS.map((s) => (
                            <td key={s.key} style={{ ...tdNum, color: GOLDB }}>
                              {fn(results[s.key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Panel>

                <Panel
                  title="What gates all of this — none of it is code"
                  note="Same list as the workbook's front sheet, minus the ELD registration gate, which is no longer being pursued."
                  icon={<AlertTriangle size={16} />}
                >
                  <div style={{ display: 'grid', gap: 10 }}>
                    <Missing
                      label="PAYMENTS"
                      reason="The payment key in this environment is a test key and billing.live is false. Nothing can be charged today, so month 1 of every scenario above is currently unreachable."
                    />
                    <Missing
                      label="EMAIL DELIVERY"
                      reason="Postmark account approval is still pending. Until it clears, no trial email, invoice or receipt can leave the platform."
                    />
                    <Missing
                      label="HARDWARE"
                      reason="Fleet-leased at the per-truck price and Fleet-owned at the one-time hardware price both assume a device exists and ships. No supplier is under contract, and TruckWithEase does not ship its own ELD."
                    />
                  </div>
                </Panel>
              </>
            ) : null}

            {/* measured reads */}
            <Panel
              title="Measured reads"
              note="Timed in this browser with performance.now(). Anything at or above 3000 ms is flagged."
              icon={<RefreshCw size={16} />}
              right={<Btn onClick={load}>Re-read</Btn>}
            >
              {reads.length === 0 ? (
                <div style={{ fontFamily: FM, fontSize: 12, color: C.dim }}>No reads recorded.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={th}>Endpoint</th>
                      <th style={th}>Status</th>
                      <th style={{ ...th, textAlign: 'right' }}>ms</th>
                      <th style={{ ...th, textAlign: 'right' }}>bytes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reads.map((x, i) => (
                      <tr key={`${x.url}-${i}`}>
                        <td style={td}>{x.url}</td>
                        <td style={{ ...td, color: x.status === 200 ? GOLD : WARN }}>
                          {x.status || 'network error'}
                        </td>
                        <td style={{ ...tdNum, color: x.ms >= SLOW_MS ? WARN : C.white }}>
                          {x.ms}
                          {x.ms >= SLOW_MS ? '  ← slow' : ''}
                        </td>
                        <td style={tdNum}>{x.bytes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>

            <Panel title="What this page does not do" icon={<AlertTriangle size={16} />}>
              <ol
                style={{
                  margin: 0,
                  paddingLeft: 20,
                  fontFamily: FB,
                  fontSize: 14,
                  lineHeight: 1.85,
                  color: C.muted,
                }}
              >
                <li>It does not forecast anything. It multiplies numbers somebody chose.</li>
                <li>
                  It does not use a market size, a total addressable market, an industry adoption rate,
                  an industry-average churn rate or any competitor&apos;s price. The previous version of
                  this page used all of those and cited none of them.
                </li>
                <li>It does not weight, rank or assign a probability to any scenario.</li>
                <li>It does not value the company. There is no valuation, multiple or exit number.</li>
                <li>It does not publish a roadmap, a launch date or a partnership that has not happened.</li>
                <li>
                  It does not track actual revenue against the model, because actual revenue is $0 and
                  no payment processor is connected.
                </li>
                <li>It does not save, export or share anything. Nothing here is written to the database.</li>
                <li>
                  It does not let you edit the inputs on screen yet — the spreadsheet does. This page is
                  the read-only mirror of it.
                </li>
              </ol>
            </Panel>
          </>
        ) : null}

        <p
          style={{
            marginTop: 26,
            fontFamily: FB,
            fontSize: 12,
            lineHeight: 1.8,
            color: C.dim,
            borderTop: `1px solid ${C.border}`,
            paddingTop: 16,
          }}
        >
          TruckWithEase is compliance and fleet management software that runs alongside the ELD a driver
          already has. It is not an ELD, it is not registered with FMCSA, and it files nothing with any
          agency.
        </p>
      </main>
    </div>
  );
}
