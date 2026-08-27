import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Zap, Brain, Radio, Target, Eye, Cpu } from 'lucide-react';

/**
 * Fleet Intelligence — rewired to real data.
 *
 * The original page called Math.random() 17 times inside a generateQuantumProfile()
 * helper: fake driver IDs, four separate 128-element "neural vectors", cargo value,
 * fuel price, market demand, accident risk, breakdown risk, optimal price and
 * compliance-violation risk. It also printed an "Expected profit margin" pulled
 * straight out of Math.floor(Math.random() * 40) + 10.
 *
 * All of that is gone. What is left comes from GET /api/fleet-intel/fleet, which
 * counts real rows: drivers, trucks, loads, maintenance_records, accident_reports
 * and dispatch_compliance_log. Anything the platform cannot measure is listed in
 * a "Not Yet Measurable" panel with the reason, instead of a made-up number.
 */

const C = {
  black: '#0a0a0a',
  card: '#161616',
  nav: '#111111',
  border: '#222222',
  white: '#ffffff',
  white60: '#9a9a9a',
  gold: '#C9A84C',
  goldBright: '#FFD700',
  green: '#22c55e',
  red: '#E0483B',
};

const GOLD_GRADIENT = 'linear-gradient(135deg,#C9A84C 0%,#FFD700 40%,#C9A84C 70%,#8A6E2F 100%)';

// Capability roadmap. These are descriptions of what the module is designed to do —
// deliberately carrying no performance percentages, because none have been measured.
const CAPABILITIES = [
  {
    title: 'Cargo & Rate Intelligence',
    desc: 'Rate-per-mile computed from your own booked loads. A market benchmark needs a load-board feed, which is not connected yet.',
    icon: Target,
    status: 'partial',
  },
  {
    title: 'Fatigue-Aware Assignment',
    desc: 'ELD telemetry drives a fatigue score; dispatch can weigh it before assigning a load. Scoring is live, auto-assignment is not.',
    icon: Zap,
    status: 'partial',
  },
  {
    title: 'Broker Risk Screening',
    desc: 'Domain age, hosting type, MC format and email reputation produce a 0-100 risk score before you send paperwork. Live.',
    icon: Brain,
    status: 'live',
  },
  {
    title: 'Maintenance Watch',
    desc: 'PM intervals, open work orders and critical defects tracked per unit from real maintenance records. Live.',
    icon: Cpu,
    status: 'live',
  },
  {
    title: 'Compliance Log',
    desc: 'Every dispatch compliance check is written to the ledger with its alert level and the rule that triggered it. Live.',
    icon: Radio,
    status: 'live',
  },
  {
    title: 'Cross-Fleet Market Sync',
    desc: 'Requires a multi-tenant data-sharing agreement and a market feed. Neither exists. Not built.',
    icon: Eye,
    status: 'planned',
  },
];

const STATUS_STYLE = {
  live: { label: 'LIVE', color: C.green },
  partial: { label: 'PARTIAL', color: C.goldBright },
  planned: { label: 'NOT BUILT', color: C.white60 },
};

function Stat({ label, value, color, sub }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '18px 20px' }}>
      <div style={{ fontSize: 11, color: C.white60, letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || C.gold }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.white60, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function QuantumFleetIntelligencePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch('/api/fleet-intel/fleet')
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then((j) => { if (alive) { setData(j); setError(null); } })
        .catch((e) => { if (alive) setError(e.message); });
    };
    load();
    const id = setInterval(load, 60000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const c = data?.counts;
  const e = data?.economics;
  const comp = data?.compliance;

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              marginBottom: 12,
              background: GOLD_GRADIENT,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Fleet Intelligence
          </div>
          <p style={{ fontSize: 16, color: C.white60, maxWidth: 820, lineHeight: 1.7 }}>
            One operating picture for the fleet, built from rows that actually exist in your account. No simulated
            drivers, no generated vectors, no invented market data.
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(224,72,59,0.1)', border: `1px solid ${C.red}55`, borderRadius: 10, padding: 16, marginBottom: 24, fontSize: 14 }}>
            Could not load fleet data: {error}
          </div>
        )}
        {!data && !error && <div style={{ color: C.white60, fontSize: 14, marginBottom: 24 }}>Loading fleet…</div>}

        {/* Real counts */}
        {c && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, color: C.gold }}>Fleet Right Now</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
              <Stat label="DRIVERS" value={c.drivers} sub={`${c.driversDriving} currently driving`} />
              <Stat label="TRUCKS" value={c.trucks} sub={`${c.trucksActive} active`} />
              <Stat label="LOADS" value={c.loadsTotal} sub={`${c.loadsBooked} booked · ${c.loadsAvailable} available`} />
              <Stat
                label="OPEN MAINTENANCE"
                value={c.openMaintenance}
                color={c.criticalMaintenance ? C.red : C.gold}
                sub={`${c.criticalMaintenance} critical`}
              />
              <Stat
                label="ACCIDENT REPORTS"
                value={c.accidentReports}
                color={c.accidentReports ? C.red : C.green}
                sub="Filed in this account"
              />
            </div>
          </div>
        )}

        {/* Economics */}
        {e && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, color: C.gold }}>Load Economics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 12 }}>
              <Stat
                label="AVG RATE / MILE"
                value={e.avgRatePerMile === null ? '—' : `$${e.avgRatePerMile.toFixed(2)}`}
                sub={`From ${e.ratedLoadSample} rated loads`}
              />
              <Stat label="BOOKED REVENUE" value={`$${Number(e.bookedRevenue).toLocaleString()}`} color={C.green} sub="Sum of booked load rates" />
              <Stat label="BOOKED MILES" value={Number(e.bookedMiles).toLocaleString()} sub="Sum of booked load miles" />
            </div>
            <p style={{ fontSize: 12, color: C.white60, lineHeight: 1.7, maxWidth: 900 }}>{e.note}</p>
          </div>
        )}

        {/* Compliance */}
        {comp && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, color: C.gold }}>Dispatch Compliance Ledger</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
              <Stat label="CHECKS LOGGED" value={comp.checksLogged} sub="Most recent 200" />
              <Stat label="CRITICAL" value={comp.criticalChecks} color={comp.criticalChecks ? C.red : C.green} sub="Blocked or illegal dispatch" />
              <Stat label="WARNINGS" value={comp.warningChecks} color={comp.warningChecks ? C.goldBright : C.green} sub="Needs a dispatcher decision" />
              <Stat
                label="LAST CHECK"
                value={comp.lastCheckedAt ? new Date(comp.lastCheckedAt).toLocaleDateString() : '—'}
                sub={comp.lastCheckedAt ? new Date(comp.lastCheckedAt).toLocaleTimeString() : 'No checks run yet'}
              />
            </div>
          </div>
        )}

        {/* Not measurable — the honest replacement for the fabricated metrics */}
        {data?.notAvailable && (
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${C.gold}`,
              borderRadius: 12,
              padding: 24,
              marginBottom: 40,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: C.gold, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={20} /> Not Yet Measurable
            </h2>
            <p style={{ fontSize: 13, color: C.white60, marginBottom: 16 }}>
              These used to show generated numbers. They now show why the platform cannot know them.
            </p>
            <div style={{ display: 'grid', gap: 12 }}>
              {Object.entries(data.notAvailable).map(([k, v]) => (
                <div key={k} style={{ background: C.black, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.goldBright, marginBottom: 4, textTransform: 'capitalize' }}>
                    {k.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div style={{ fontSize: 12, color: C.white60, lineHeight: 1.6 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Capability status */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, color: C.gold }}>Module Status</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {CAPABILITIES.map((item) => {
              const Icon = item.icon;
              const st = STATUS_STYLE[item.status];
              return (
                <div key={item.title} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Icon size={26} color={C.gold} />
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: st.color, border: `1px solid ${st.color}55`, borderRadius: 4, padding: '3px 8px' }}>
                      {st.label}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: C.white }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: C.white60, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Positioning — claims trimmed to what the product actually does */}
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.gold}`,
            borderRadius: 16,
            padding: 32,
            marginBottom: 40,
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14, color: C.gold, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={22} /> What Makes This Different
          </h2>
          <ul style={{ fontSize: 14, color: C.white60, lineHeight: 2, marginLeft: 20 }}>
            <li>Fatigue comes from recorded ELD telemetry, not a self-reported checkbox.</li>
            <li>Compliance decisions are written to a ledger you can hand to an auditor.</li>
            <li>Brokers get screened before you send paperwork, not after the load goes missing.</li>
            <li>Maintenance is tracked against real PM intervals per unit, not a calendar reminder.</li>
            <li>When the platform does not know something, it says so instead of showing a number.</li>
          </ul>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: 32, background: C.card, borderRadius: 16, border: `1px solid ${C.border}` }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: C.gold }}>Try TruckWithEase</h2>
          <p style={{ fontSize: 14, color: C.white60, marginBottom: 22 }}>14-day free trial. No contracts, cancel anytime.</p>
          <a
            href="/app/billing"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: GOLD_GRADIENT,
              color: C.black,
              borderRadius: 8,
              fontWeight: 800,
              fontSize: 15,
              textDecoration: 'none',
            }}
          >
            Start Free Trial
          </a>
        </div>
      </div>
    </div>
  );
}
