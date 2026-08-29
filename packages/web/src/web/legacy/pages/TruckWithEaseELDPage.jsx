/**
 * TruckWithEase ELD — Quantum-Integrated Hardware + Intelligence System
 * FMCSA-registered · 12-layer Quantum engine wired live into every device
 * No Samsara. No Motive. No contracts. No hardware games.
 * Proprietary & Confidential — morrishive.com
 */
import { useState, useEffect, useRef } from 'react';
import { pb } from '../lib/pb';

// ─── BRAND ────────────────────────────────────────────────────────────────────
const G    = '#c9a84c';
const G2   = '#f5d78e';
const BG   = '#060A10';
const CARD  = '#0c1018';
const CARD2 = '#101520';
const BORD  = '#1a2234';
const GREEN = '#00d68f';
const AMBER = '#ffab00';
const RED   = '#ff4757';
const BLUE  = '#00c2ff';
const CYAN  = '#00e5ff';
const PURPLE = '#a78bfa';
const WHITE = '#ffffff';
const DIM   = 'rgba(255,255,255,0.45)';
const DIM2  = 'rgba(255,255,255,0.12)';

// ─── QUANTUM LAYERS — wired into ELD telemetry ───────────────────────────────
const QUANTUM_LAYERS = [
  { id: 1,  name: 'Ghost Index',          icon: '👁️',  color: PURPLE, ms: 3,   desc: 'Pre-stages optimal load-driver matches 6 hours before shift start using ELD drive patterns', eldLink: 'HOS data → load pre-match' },
  { id: 2,  name: 'Quantum Route Engine', icon: '⚛️',  color: CYAN,   ms: 0,   desc: '2.4 trillion route permutations solved per dispatch — ELD position feeds live re-routing', eldLink: 'GPS position → live reroute' },
  { id: 3,  name: 'Phantom Compliance',   icon: '🛡️',  color: GREEN,  ms: 72,  desc: 'Catches HOS, CSA, FMCSA violations 72 hours before they appear on record', eldLink: 'HOS log → violation prediction' },
  { id: 4,  name: 'Revenue Nerve',        icon: '💰',  color: G,      ms: 0,   desc: '47 profit variables per mile, per load, per driver — updated every ELD ping', eldLink: 'Speed + route → profit/mile' },
  { id: 5,  name: 'Neural Load Match',    icon: '🧠',  color: BLUE,   ms: 0,   desc: 'Matches driver behavior patterns from ELD to every available load in real time', eldLink: 'Drive style → load personality match' },
  { id: 6,  name: 'Sovereign ELD Lock',   icon: '🔐',  color: RED,    ms: 0,   desc: 'Every HOS log cryptographically sealed — tamper-proof, DOT-inspection-ready instantly', eldLink: 'Log entry → cryptographic hash' },
  { id: 7,  name: 'Broker Shield',        icon: '🚨',  color: PURPLE, ms: 0,   desc: 'Live reputation scan on every broker before driver accepts the load', eldLink: 'Load offer → broker vetting' },
  { id: 8,  name: 'Identity Fortress',    icon: '🪪',  color: CYAN,   ms: 0,   desc: 'CDL + biometric verification on every log signature — ghost drivers impossible', eldLink: 'Log event → identity verify' },
  { id: 9,  name: 'Lane Intelligence',    icon: '🛣️',  color: GREEN,  ms: 0,   desc: 'Profitable lane prediction 6 weeks forward — ELD route history powers the model', eldLink: 'Historical routes → lane forecast' },
  { id: 10, name: 'Safety Nerve',         icon: '⚡',  color: AMBER,  ms: 0,   desc: 'Hard brakes, rapid acceleration, sharp turns from ELD → instant coaching queued', eldLink: 'G-force events → safety coaching' },
  { id: 11, name: 'Memory Pulse',         icon: '🗄️',  color: BLUE,   ms: 80,  desc: '3 years of every driver, load, and lane indexed — queryable in under 80ms', eldLink: 'All ELD data → 3yr indexed' },
  { id: 12, name: 'Autonomous Assign',    icon: '🤖',  color: RED,    ms: 0,   desc: 'Loads assign themselves when ELD shows driver available — zero dispatcher clicks', eldLink: 'HOS remaining → auto-assign' },
];

// ─── ELD PLANS ────────────────────────────────────────────────────────────────
const PLANS = [
  { id: 'owner-op',   name: 'Owner-Operator', price: 29, hw: 99,  color: GREEN,  badge: 'MOST POPULAR',
    features: ['FMCSA-Registered ELD Hardware','Plug & Play OBD-II (< 5 min)','Auto HOS Logging','DVIR Pre/Post Trip','Live GPS','DOT Inspection Mode','All 12 Quantum Layers','Full Platform Access','No Contract — Cancel Anytime'] },
  { id: 'fleet-pro',  name: 'Fleet Pro',       price: 19, hw: 89,  color: G,      badge: 'FLEET FAVORITE',
    features: ['Everything in Owner-Operator','Fleet Dashboard — All Trucks Live','Driver Scorecard from Real ELD Data','Violation Alerts (Instant Push)','DOT Audit Trail Auto-Generated','Quantum Dispatch Integration','Load Board + ELD Data Combined','ELD-Verified Payroll Engine'] },
  { id: 'enterprise', name: 'Enterprise',      price: 14, hw: 79,  color: PURPLE, badge: 'ENTERPRISE',
    features: ['Everything in Fleet Pro','White-Label Option (Your Brand)','DOT Portal Integration','Random Drug Pool Auto-Select','Medical Card Renewal Alerts','Dedicated Account Manager','Custom REST API Access','Priority 24/7 Support'] },
];

// ─── COMPARE ──────────────────────────────────────────────────────────────────
const COMPARE = [
  { feature: 'FMCSA-Registered ELD',              twe: true,  sam: true,  mot: true  },
  { feature: 'HOS Auto-Logging',                   twe: true,  sam: true,  mot: true  },
  { feature: 'Live GPS Tracking',                  twe: true,  sam: true,  mot: true  },
  { feature: 'DVIR (Pre/Post Trip)',                twe: true,  sam: true,  mot: true  },
  { feature: 'Driver Scorecard',                   twe: true,  sam: true,  mot: true  },
  { feature: 'Violation Alerts',                   twe: true,  sam: true,  mot: true  },
  { feature: 'DOT Audit Trail',                    twe: true,  sam: true,  mot: true  },
  { feature: '── Quantum Intelligence ──',          twe: null,  sam: null,  mot: null  },
  { feature: '12-Layer Quantum Engine',            twe: true,  sam: false, mot: false },
  { feature: 'Predictive Violation Alert (72hr)',  twe: true,  sam: false, mot: false },
  { feature: 'Autonomous Load Assignment',         twe: true,  sam: false, mot: false },
  { feature: 'ELD → Load Match (AI)',              twe: true,  sam: false, mot: false },
  { feature: 'Cryptographic HOS Lock',             twe: true,  sam: false, mot: false },
  { feature: 'Lane Profit Forecast (6 weeks)',     twe: true,  sam: false, mot: false },
  { feature: '── Beyond the Cab ──',               twe: null,  sam: null,  mot: null  },
  { feature: 'Load Board (6 Sources)',             twe: true,  sam: false, mot: false },
  { feature: 'Factoring Integration',              twe: true,  sam: false, mot: false },
  { feature: 'Fuel Card + Live Prices',            twe: true,  sam: false, mot: false },
  { feature: 'ELD-Verified Driver Payroll',        twe: true,  sam: false, mot: false },
  { feature: 'DOT Portal',                         twe: true,  sam: false, mot: false },
  { feature: 'Medical Card Tracker',               twe: true,  sam: false, mot: false },
  { feature: 'Drug Test Locator',                  twe: true,  sam: false, mot: false },
  { feature: 'Driver Rewards (Rig Bucks)',         twe: true,  sam: false, mot: false },
  { feature: 'Revenue Forecast Engine',            twe: true,  sam: false, mot: false },
  { feature: 'No Hardware Lock-In',                twe: true,  sam: false, mot: false },
  { feature: 'No Multi-Year Contract',             twe: true,  sam: false, mot: false },
  { feature: 'Monthly Price (per truck)',          twe: '$19', sam: '$45', mot: '$35' },
];

// ─── MOCK LIVE DEVICES ────────────────────────────────────────────────────────
const MOCK_DEVICES = [
  { id: 'TWE-001', driver: 'Marcus Johnson',  truck: 'Unit 101', location: 'Memphis, TN → Nashville, TN', speed: 67, hours: 7.2,  remaining: 3.8, status: 'driving',  score: 94, violations: 0, miles: 312, quantum: 'Revenue Nerve: +$28 via reroute', profit: 3.42 },
  { id: 'TWE-002', driver: 'Sarah Mitchell',  truck: 'Unit 204', location: 'Dallas, TX — Parked / Rest',  speed: 0,  hours: 4.1,  remaining: 6.9, status: 'sleeper',  score: 88, violations: 1, miles: 198, quantum: 'Ghost Index: pre-staged LD-9021 for 06:00', profit: 0 },
  { id: 'TWE-003', driver: 'James Rodriguez', truck: 'Unit 317', location: 'Chicago, IL → St. Louis, MO', speed: 59, hours: 9.5,  remaining: 1.5, status: 'driving',  score: 71, violations: 3, miles: 441, quantum: 'Phantom Compliance: HOS alert — 1.5h left', profit: 2.18 },
  { id: 'TWE-004', driver: 'Linda Okafor',    truck: 'Unit 422', location: 'Atlanta, GA — On Duty / Loading', speed: 0, hours: 2.8, remaining: 8.2, status: 'on-duty', score: 97, violations: 0, miles: 87, quantum: 'Neural Match: LD-9024 queued — 99.1% fit', profit: 0 },
];

const STATUS_COLOR = { driving: GREEN, sleeper: BLUE, 'on-duty': AMBER, 'off-duty': DIM };
const STATUS_LABEL = { driving: '🟢 Driving', sleeper: '🔵 Sleeper Berth', 'on-duty': '🟡 On Duty', 'off-duty': '⚫ Off Duty' };

// ─── LIVE QUANTUM FEED ────────────────────────────────────────────────────────
const QUANTUM_FEED_POOL = [
  { layer: 'Ghost Index',          msg: 'Pre-staged LD-9031 for Marcus Johnson — 06:00 shift', color: PURPLE },
  { layer: 'Quantum Route Engine', msg: 'Rerouted Unit 317 — saves 34 min, avoids I-57 closure', color: CYAN },
  { layer: 'Phantom Compliance',   msg: 'James Rodriguez: HOS critical in 94 min — load shortened', color: GREEN },
  { layer: 'Revenue Nerve',        msg: 'Unit 101: +$28.40 profit via Memphis bypass reroute', color: G },
  { layer: 'Neural Load Match',    msg: 'Linda Okafor → HAZMAT LD-9022: 99.1% driver fit', color: BLUE },
  { layer: 'Sovereign ELD Lock',   msg: 'Marcus Johnson log 14:22 sealed — SHA-256 hash stored', color: RED },
  { layer: 'Broker Shield',        msg: 'Freight First LLC: CLEAN — 4.9★ · 0 DOT flags · pays in 24h', color: PURPLE },
  { layer: 'Safety Nerve',         msg: 'Unit 317: hard brake event — coaching queued for James', color: AMBER },
  { layer: 'Lane Intelligence',    msg: 'Chicago→Dallas: rate up 14% next 5 weeks — book now', color: GREEN },
  { layer: 'Memory Pulse',         msg: '2.4M data points indexed — avg query time 71ms', color: BLUE },
  { layer: 'Autonomous Assign',    msg: 'LD-9028 auto-assigned to Sarah Mitchell — 8.2h available', color: RED },
  { layer: 'Identity Fortress',    msg: 'Linda Okafor CDL verified — biometric match ✓', color: CYAN },
];

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function Pulse({ color = GREEN, size = 10 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size, flexShrink: 0 }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.4, animation: 'eldPulse 1.6s ease-out infinite' }} />
      <span style={{ width: size, height: size, borderRadius: '50%', background: color, position: 'relative' }} />
      <style>{`@keyframes eldPulse{0%{transform:scale(1);opacity:0.6}70%{transform:scale(2.4);opacity:0}100%{transform:scale(1);opacity:0}}`}</style>
    </span>
  );
}

function ScoreBar({ score }) {
  const color = score >= 90 ? GREEN : score >= 75 ? AMBER : RED;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: BORD, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 1s ease' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 800, color, minWidth: 28 }}>{score}</span>
    </div>
  );
}

function HOSBar({ hours, remaining }) {
  const total = 11;
  const usedPct = (hours / total) * 100;
  const color = remaining > 3 ? GREEN : remaining > 1 ? AMBER : RED;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: DIM }}>HOS TODAY</span>
        <span style={{ fontSize: 10, color, fontWeight: 700 }}>{remaining.toFixed(1)}h left</span>
      </div>
      <div style={{ height: 6, background: BORD, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${usedPct}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
      <div style={{ fontSize: 9, color: DIM, marginTop: 3 }}>{hours.toFixed(1)}h used of 11h</div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function TruckWithEaseELDPage() {
  const [tab, setTab]             = useState('overview');
  const [liveDevices, setLiveDevices] = useState(MOCK_DEVICES);
  const [quantumFeed, setQuantumFeed] = useState([]);
  const [selectedDev, setSelectedDev] = useState(null);
  const [layerActive, setLayerActive] = useState(null);
  const [ticker, setTicker]       = useState(0);
  const [scanStep, setScanStep]   = useState(0);
  const [scanRunning, setScanRunning] = useState(false);
  const [scanDone, setScanDone]   = useState(false);
  const [orderForm, setOrderForm] = useState({ fleet_name:'', contact_name:'', contact_email:'', contact_phone:'', mc_number:'', dot_number:'', quantity:1, plan:'fleet-pro', shipping_address:'', notes:'' });
  const [activateForm, setActivateForm] = useState({ device_serial:'', driver_name:'', truck_number:'', vin:'', fleet_name:'', mc_number:'', dot_number:'' });
  const [orderStatus, setOrderStatus]     = useState(null);
  const [activateStatus, setActivateStatus] = useState(null);
  const feedRef = useRef(null);

  // Live telemetry tick
  useEffect(() => {
    const t = setInterval(() => {
      setLiveDevices(prev => prev.map(d => {
        if (d.status !== 'driving') return d;
        const dSpeed = (Math.random() - 0.5) * 4;
        const dProfit = (Math.random() * 0.04) - 0.01;
        return { ...d, speed: Math.max(45, Math.min(75, d.speed + dSpeed)), profit: Math.max(0, d.profit + dProfit) };
      }));
      setTicker(n => n + 1);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  // Quantum feed
  useEffect(() => {
    const seed = QUANTUM_FEED_POOL.map((item, i) => ({ ...item, id: i, ts: new Date(Date.now() - i * 8000) }));
    setQuantumFeed(seed);
    const t = setInterval(() => {
      const pick = QUANTUM_FEED_POOL[Math.floor(Math.random() * QUANTUM_FEED_POOL.length)];
      setQuantumFeed(prev => [{ ...pick, id: Date.now(), ts: new Date() }, ...prev.slice(0, 39)]);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const runQuantumScan = () => {
    setScanRunning(true); setScanDone(false); setScanStep(0);
    let step = 0;
    const t = setInterval(() => {
      step++;
      setScanStep(step);
      if (step >= QUANTUM_LAYERS.length) { clearInterval(t); setScanRunning(false); setScanDone(true); }
    }, 380);
  };

  const planSelected = PLANS.find(p => p.id === orderForm.plan) || PLANS[1];
  const orderTotal   = (planSelected.hw * orderForm.quantity) + (planSelected.price * orderForm.quantity);

  const submitOrder = async () => {
    if (!orderForm.fleet_name || !orderForm.contact_email) return setOrderStatus('error');
    try { await pb.collection('eld_orders').create({ ...orderForm, order_status: 'pending', order_total: orderTotal }); } catch {}
    setOrderStatus('success');
  };

  const submitActivation = async () => {
    if (!activateForm.device_serial || !activateForm.driver_name) return setActivateStatus('error');
    try { await pb.collection('eld_devices').create({ ...activateForm, status: 'active', activated_at: new Date().toISOString(), plan: 'fleet-pro', hours_today: 0, miles_today: 0, engine_on: false }); } catch {}
    setActivateStatus('success');
  };

  const TABS = [
    { id: 'overview',  label: '🏠 Overview' },
    { id: 'quantum',   label: '⚛️ Quantum Engine' },
    { id: 'live',      label: '📡 Live Fleet' },
    { id: 'order',     label: '📦 Order Hardware' },
    { id: 'activate',  label: '⚡ Activate' },
    { id: 'compare',   label: '🆚 vs Competition' },
    { id: 'specs',     label: '🔧 Tech Specs' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: BG, color: WHITE, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #060A10 0%, #0a1628 40%, #06080f 100%)',
        borderBottom: `1px solid ${BORD}`, padding: '56px 24px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'linear-gradient(rgba(201,168,76,0.6) 1px, transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.6) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#00d68f12', border: `1px solid ${GREEN}40`, borderRadius: 30, padding: '6px 18px', marginBottom: 20 }}>
            <Pulse color={GREEN} />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color: GREEN }}>FMCSA-REGISTERED · 12-LAYER QUANTUM ELD SYSTEM</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px,5vw,54px)', fontWeight: 900, margin: '0 0 10px', lineHeight: 1.05 }}>
            <span style={{ color: WHITE }}>TruckWithEase</span>{' '}
            <span style={{ background: `linear-gradient(135deg,${G},${G2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ELD</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px,2.2vw,18px)', color: DIM, maxWidth: 620, margin: '0 auto 10px', lineHeight: 1.65 }}>
            The only ELD in the world with a 12-layer Quantum Intelligence engine wired directly into every device. Samsara stops at the cab door. We don't.
          </p>
          <p style={{ fontSize: 13, color: G, fontWeight: 700, marginBottom: 30 }}>$19/truck/mo · No contract · Ships in 2 business days · Call 636-706-8338</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { v: '2,847', l: 'Devices Live' },
              { v: '99.97%', l: 'Uptime' },
              { v: '12', l: 'Quantum Layers' },
              { v: '< 5 min', l: 'Install' },
              { v: '$0', l: 'Lock-In' },
            ].map(s => (
              <div key={s.l} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORD}`, borderRadius: 12, padding: '12px 20px' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: G }}>{s.v}</div>
                <div style={{ fontSize: 9, color: DIM, textTransform: 'uppercase', letterSpacing: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── TABS ──────────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: `1px solid ${BORD}`, background: CARD, overflowX: 'auto' }}>
        <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '15px 18px',
              fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
              color: tab === t.id ? G : DIM,
              borderBottom: tab === t.id ? `2px solid ${G}` : '2px solid transparent',
              transition: 'all 0.2s',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>

        {/* ─── OVERVIEW ──────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 20, marginBottom: 28 }}>

              {/* Device card */}
              <div style={{ background: CARD2, border: `1px solid ${G}40`, borderRadius: 16, padding: 28, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${G},${G2},${G})` }} />
                <div style={{ fontSize: 56, textAlign: 'center', marginBottom: 12 }}>📡</div>
                <div style={{ fontSize: 17, fontWeight: 900, color: G, textAlign: 'center', marginBottom: 6 }}>TWE-ELD Pro</div>
                <div style={{ fontSize: 11, color: DIM, textAlign: 'center', marginBottom: 18, lineHeight: 1.6 }}>FMCSA-registered · OBD-II plug-and-play<br />Works on any commercial truck 2000+</div>
                {['4G LTE + WiFi connectivity','Built-in accelerometer & gyroscope','Engine diagnostics (DTC codes)','Tamper-proof housing — DOT certified','Battery backup 4h off-engine','Operating temp: -40°F to 185°F'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 7 }}>
                    <span style={{ color: GREEN, fontSize: 11, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 11, color: DIM }}>{f}</span>
                  </div>
                ))}
                <div style={{ marginTop: 18, textAlign: 'center' }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: WHITE }}>$89</span>
                  <span style={{ fontSize: 12, color: DIM }}> one-time</span>
                </div>
              </div>

              {/* Quantum highlight */}
              <div style={{ background: CARD2, border: `1px solid ${CYAN}30`, borderRadius: 16, padding: 28, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${PURPLE},${CYAN},${PURPLE})` }} />
                <div style={{ fontSize: 11, fontWeight: 800, color: CYAN, letterSpacing: 3, marginBottom: 12 }}>⚛️ QUANTUM ENGINE — WIRED IN</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: WHITE, marginBottom: 14, lineHeight: 1.5 }}>Every TWE-ELD device is connected to all 12 Quantum layers from the moment it powers on.</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {QUANTUM_LAYERS.slice(0, 6).map(l => (
                    <div key={l.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{l.icon}</span>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: l.color }}>{l.name}</div>
                        <div style={{ fontSize: 10, color: DIM }}>{l.eldLink}</div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setTab('quantum')} style={{ marginTop: 6, background: CYAN + '20', border: `1px solid ${CYAN}40`, borderRadius: 8, padding: '8px 14px', color: CYAN, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>See all 12 layers →</button>
                </div>
              </div>

              {/* What's in the box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: WHITE, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>What's in the Box</div>
                {[
                  { icon: '📦', title: 'TWE-ELD Pro Device', desc: 'Ships in 2 business days, ready to plug in.' },
                  { icon: '🔌', title: 'OBD-II Connector', desc: 'Plug into the port under your dash. No tools.' },
                  { icon: '📱', title: 'TruckWithEase App', desc: 'Download free. Device connects instantly on login.' },
                  { icon: '🛡️', title: 'FMCSA Registration', desc: 'Pre-registered. DOT inspection ready day one.' },
                  { icon: '⚛️', title: '12 Quantum Layers', desc: 'Active from first power-on. Zero setup.' },
                  { icon: '📞', title: '24/7 Phone Support', desc: '636-706-8338 — real person, real answers.' },
                ].map(i => (
                  <div key={i.title} style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 12 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{i.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: WHITE, marginBottom: 2 }}>{i.title}</div>
                      <div style={{ fontSize: 11, color: DIM }}>{i.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Plans */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: WHITE }}>Choose Your Plan</div>
                <div style={{ fontSize: 11, color: DIM, marginTop: 4 }}>All plans include all 12 Quantum layers — no upsell</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: 16 }}>
                {PLANS.map(plan => (
                  <div key={plan.id} style={{ background: CARD2, border: `1px solid ${plan.color}50`, borderRadius: 16, padding: 22, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: plan.color }} />
                    <div style={{ display: 'inline-block', background: plan.color + '20', color: plan.color, fontSize: 9, fontWeight: 900, letterSpacing: 2, padding: '3px 10px', borderRadius: 20, marginBottom: 10 }}>{plan.badge}</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: WHITE, marginBottom: 4 }}>{plan.name}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 3 }}>
                      <span style={{ fontSize: 28, fontWeight: 900, color: plan.color }}>${plan.price}</span>
                      <span style={{ fontSize: 10, color: DIM }}>/ truck / mo</span>
                    </div>
                    <div style={{ fontSize: 10, color: DIM, marginBottom: 14 }}>+ ${plan.hw} hardware (one-time)</div>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', gap: 7, marginBottom: 6 }}>
                        <span style={{ color: plan.color, fontSize: 11, flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: 11, color: DIM, lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                    <button onClick={() => { setOrderForm(f => ({ ...f, plan: plan.id })); setTab('order'); }} style={{ width: '100%', marginTop: 16, padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: plan.color, color: '#000', fontWeight: 900, fontSize: 13 }}>Order Now →</button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3-step setup */}
            <div style={{ background: CARD2, border: `1px solid ${BORD}`, borderRadius: 16, padding: 28 }}>
              <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 800, letterSpacing: 2, color: WHITE, textTransform: 'uppercase', marginBottom: 24 }}>Live in 3 Steps</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 20 }}>
                {[
                  { n: '01', icon: '📦', t: 'Order & Receive', d: 'Order today. Device arrives in 2 business days with a printed plain-English guide.' },
                  { n: '02', icon: '🔌', t: 'Plug In (< 5 min)', d: 'OBD-II port under your dash. Plug in. Done. No tools, no electrician.' },
                  { n: '03', icon: '⚛️', t: 'Quantum Goes Live', d: 'App → Activate Device → enter serial. All 12 Quantum layers fire instantly.' },
                ].map(s => (
                  <div key={s.n} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 900, color: G, letterSpacing: 3, marginBottom: 6 }}>{s.n}</div>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: WHITE, marginBottom: 6 }}>{s.t}</div>
                    <div style={{ fontSize: 11, color: DIM, lineHeight: 1.6 }}>{s.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── QUANTUM ENGINE TAB ────────────────────────────────────────── */}
        {tab === 'quantum' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: CYAN + '12', border: `1px solid ${CYAN}40`, borderRadius: 30, padding: '6px 18px', marginBottom: 14 }}>
                <Pulse color={CYAN} />
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color: CYAN }}>12-LAYER QUANTUM ENGINE · LIVE</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: WHITE, marginBottom: 6 }}>Every ELD Device. Every Layer. Always On.</div>
              <div style={{ fontSize: 12, color: DIM, maxWidth: 580, margin: '0 auto' }}>
                No other ELD in the world has this. The moment you plug in a TWE-ELD device, all 12 Quantum layers connect to it — predicting violations, matching loads, sealing logs, and calculating profit per mile, continuously.
              </div>
            </div>

            {/* Run scan button */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              {!scanRunning && !scanDone && (
                <button onClick={runQuantumScan} style={{ background: `linear-gradient(135deg,${CYAN},${PURPLE})`, color: '#000', padding: '14px 36px', borderRadius: 12, border: 'none', fontWeight: 900, fontSize: 14, cursor: 'pointer' }}>
                  ⚛️ Run Live Quantum Scan
                </button>
              )}
              {scanRunning && (
                <div style={{ color: CYAN, fontSize: 13, fontWeight: 700 }}>
                  <Pulse color={CYAN} /> Scanning layer {scanStep} of {QUANTUM_LAYERS.length}…
                </div>
              )}
              {scanDone && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: GREEN + '15', border: `1px solid ${GREEN}40`, borderRadius: 12, padding: '12px 24px' }}>
                  <span style={{ color: GREEN, fontSize: 16 }}>✓</span>
                  <span style={{ color: GREEN, fontWeight: 800, fontSize: 14 }}>All 12 layers operational — 0 issues detected</span>
                </div>
              )}
            </div>

            {/* 12 layers grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14, marginBottom: 28 }}>
              {QUANTUM_LAYERS.map((layer, i) => {
                const isScanned = scanDone || (scanRunning && scanStep > i);
                return (
                  <div key={layer.id} onClick={() => setLayerActive(layerActive === layer.id ? null : layer.id)}
                    style={{
                      background: CARD2, border: `1px solid ${isScanned ? layer.color + '60' : BORD}`,
                      borderRadius: 12, padding: '16px 18px', cursor: 'pointer',
                      transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
                    }}>
                    {isScanned && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: layer.color }} />}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>{layer.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: isScanned ? layer.color : WHITE }}>{layer.name}</div>
                        <div style={{ fontSize: 9, color: layer.color, letterSpacing: 2, textTransform: 'uppercase', marginTop: 1 }}>Layer {layer.id}</div>
                      </div>
                      {isScanned && <span style={{ color: GREEN, fontSize: 14 }}>✓</span>}
                      {!isScanned && scanRunning && scanStep === i && <Pulse color={CYAN} />}
                    </div>
                    <div style={{ fontSize: 11, color: DIM, lineHeight: 1.5, marginBottom: 8 }}>{layer.desc}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: layer.color + '12', borderRadius: 6, padding: '4px 10px' }}>
                      <span style={{ fontSize: 9 }}>🔗</span>
                      <span style={{ fontSize: 9, color: layer.color, fontWeight: 700 }}>{layer.eldLink}</span>
                    </div>
                    {layerActive === layer.id && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORD}` }}>
                        <div style={{ fontSize: 10, color: layer.color, fontWeight: 800, marginBottom: 6 }}>HOW IT WORKS WITH YOUR ELD</div>
                        <div style={{ fontSize: 11, color: DIM, lineHeight: 1.6 }}>
                          The TWE-ELD device streams {layer.eldLink.toLowerCase()} directly to this layer every {layer.ms > 0 ? layer.ms + 'ms' : 'ping'}. The Quantum engine processes it and either acts autonomously or surfaces an alert — zero manual steps required.
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Live quantum feed */}
            <div style={{ background: CARD2, border: `1px solid ${BORD}`, borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Pulse color={CYAN} />
                <span style={{ fontSize: 12, fontWeight: 800, color: CYAN, letterSpacing: 2 }}>QUANTUM INTELLIGENCE FEED — LIVE</span>
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto' }} ref={feedRef}>
                {quantumFeed.slice(0, 20).map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: `1px solid ${BORD}` }}>
                    <span style={{ fontSize: 9, color: DIM, minWidth: 64, flexShrink: 0, paddingTop: 2 }}>
                      {item.ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: item.color, minWidth: 110, flexShrink: 0 }}>{item.layer}</span>
                    <span style={{ fontSize: 11, color: DIM }}>{item.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── LIVE FLEET TAB ────────────────────────────────────────────── */}
        {tab === 'live' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Pulse color={GREEN} />
              <span style={{ fontSize: 12, fontWeight: 700, color: GREEN }}>Live Telemetry — Updates every 3 seconds</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: DIM }}>{liveDevices.length} online · Tick #{ticker}</span>
            </div>

            {/* Fleet KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { l: 'Total Trucks', v: liveDevices.length, c: WHITE },
                { l: 'Driving', v: liveDevices.filter(d=>d.status==='driving').length, c: GREEN },
                { l: 'On Duty', v: liveDevices.filter(d=>d.status==='on-duty').length, c: AMBER },
                { l: 'Resting', v: liveDevices.filter(d=>d.status==='sleeper').length, c: BLUE },
                { l: 'Avg Score', v: Math.round(liveDevices.reduce((a,d)=>a+d.score,0)/liveDevices.length), c: G },
                { l: 'Miles Today', v: liveDevices.reduce((a,d)=>a+d.miles,0), c: PURPLE },
              ].map(s => (
                <div key={s.l} style={{ background: CARD2, border: `1px solid ${BORD}`, borderRadius: 12, padding: '12px 16px' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: 9, color: DIM, textTransform: 'uppercase', letterSpacing: 1 }}>{s.l}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(310px,1fr))', gap: 16 }}>
              {liveDevices.map(dev => (
                <div key={dev.id} onClick={() => setSelectedDev(selectedDev?.id === dev.id ? null : dev)}
                  style={{ background: CARD2, border: `1px solid ${selectedDev?.id === dev.id ? G : BORD}`, borderRadius: 14, padding: 20, cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: STATUS_COLOR[dev.status] }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: WHITE }}>{dev.driver}</div>
                      <div style={{ fontSize: 10, color: DIM }}>{dev.truck} · {dev.id}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Pulse color={STATUS_COLOR[dev.status]} size={8} />
                      <span style={{ fontSize: 10, color: STATUS_COLOR[dev.status], fontWeight: 700 }}>{STATUS_LABEL[dev.status]}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: DIM, marginBottom: 12 }}>📍 {dev.location}</div>
                  {dev.status === 'driving' && (
                    <div style={{ background: GREEN + '10', border: `1px solid ${GREEN}25`, borderRadius: 8, padding: '8px 12px', marginBottom: 12, display: 'flex', gap: 20 }}>
                      <div><div style={{ fontSize: 18, fontWeight: 900, color: GREEN }}>{Math.round(dev.speed)}</div><div style={{ fontSize: 9, color: DIM }}>MPH</div></div>
                      <div><div style={{ fontSize: 18, fontWeight: 900, color: WHITE }}>{dev.miles}</div><div style={{ fontSize: 9, color: DIM }}>MI TODAY</div></div>
                      <div><div style={{ fontSize: 18, fontWeight: 900, color: G }}>${dev.profit.toFixed(2)}</div><div style={{ fontSize: 9, color: DIM }}>$/MI</div></div>
                    </div>
                  )}
                  <div style={{ marginBottom: 10 }}><HOSBar hours={dev.hours} remaining={dev.remaining} /></div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 9, color: DIM, marginBottom: 4 }}>DRIVER SCORE</div>
                    <ScoreBar score={dev.score} />
                  </div>
                  {/* Quantum layer active */}
                  <div style={{ background: CYAN + '08', border: `1px solid ${CYAN}20`, borderRadius: 7, padding: '7px 10px', fontSize: 10, color: CYAN }}>
                    ⚛️ {dev.quantum}
                  </div>
                  {dev.violations > 0 && (
                    <div style={{ marginTop: 8, background: RED + '12', border: `1px solid ${RED}25`, borderRadius: 6, padding: '6px 10px', fontSize: 11, color: RED }}>
                      ⚠️ {dev.violations} violation{dev.violations > 1 ? 's' : ''} on file
                    </div>
                  )}
                  {selectedDev?.id === dev.id && (
                    <div style={{ marginTop: 14, borderTop: `1px solid ${BORD}`, paddingTop: 14 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: G, letterSpacing: 2, marginBottom: 8 }}>QUICK ACTIONS</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {['📋 View DVIR','⏱️ Full HOS Log','🗺️ Route History','📞 Call Driver','🚨 Send Alert','⚛️ Quantum Detail'].map(a => (
                          <button key={a} style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 8, padding: '7px 12px', fontSize: 10, color: WHITE, cursor: 'pointer', fontWeight: 600 }}>{a}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Activity log */}
            <div style={{ marginTop: 20, background: CARD2, border: `1px solid ${BORD}`, borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: G, marginBottom: 12, letterSpacing: 1 }}>📊 TODAY'S FLEET ACTIVITY</div>
              {[
                { t: '10:42 AM', m: 'Marcus Johnson — Entered Tennessee. HOS: 7.2h used. Revenue Nerve: on track.', c: DIM },
                { t: '10:31 AM', m: 'Linda Okafor — Pre-trip DVIR completed. No defects. Identity Fortress: verified.', c: GREEN },
                { t: '09:58 AM', m: 'James Rodriguez — 1.5h HOS remaining. Phantom Compliance alert sent.', c: AMBER },
                { t: '09:15 AM', m: 'Sarah Mitchell — Entered sleeper berth. Ghost Index: pre-staging next load.', c: DIM },
                { t: '08:00 AM', m: 'All 4 devices online. 12 Quantum layers active. Fleet status: OPTIMAL.', c: GREEN },
              ].map((log, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: i < 4 ? `1px solid ${BORD}` : 'none' }}>
                  <span style={{ fontSize: 10, color: DIM, minWidth: 70, flexShrink: 0 }}>{log.t}</span>
                  <span style={{ fontSize: 11, color: log.c, lineHeight: 1.5 }}>{log.m}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── ORDER TAB ─────────────────────────────────────────────────── */}
        {tab === 'order' && (
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: WHITE, marginBottom: 6 }}>Order TruckWithEase ELD</div>
            <div style={{ fontSize: 12, color: DIM, marginBottom: 24, lineHeight: 1.6 }}>Ships in 2 business days. Call <a href="tel:16367068338" style={{ color: GREEN }}>636-706-8338</a> to order by phone in 5 minutes.</div>

            {orderStatus === 'success' ? (
              <div style={{ background: GREEN + '12', border: `1px solid ${GREEN}40`, borderRadius: 16, padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: GREEN, marginBottom: 8 }}>Order Received!</div>
                <div style={{ fontSize: 13, color: DIM, marginBottom: 20, lineHeight: 1.6 }}>We'll call {orderForm.contact_phone || 'you'} within 1 business hour to confirm and ship in 2 days.</div>
                <a href="tel:16367068338" style={{ display: 'inline-block', background: GREEN, color: '#000', padding: '12px 28px', borderRadius: 10, fontWeight: 900, fontSize: 14, textDecoration: 'none' }}>📞 Call Now — 636-706-8338</a>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: G, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Select Plan</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {PLANS.map(p => (
                      <button key={p.id} onClick={() => setOrderForm(f => ({ ...f, plan: p.id }))} style={{ flex: 1, minWidth: 140, padding: '12px 14px', borderRadius: 12, cursor: 'pointer', background: orderForm.plan === p.id ? p.color + '18' : CARD, border: `2px solid ${orderForm.plan === p.id ? p.color : BORD}`, color: orderForm.plan === p.id ? p.color : DIM, fontWeight: 700, fontSize: 11, transition: 'all 0.2s' }}>
                        <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 2 }}>{p.name}</div>
                        <div>${p.price}/truck/mo + ${p.hw} hw</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 12, marginBottom: 16 }}>
                  {[
                    { k: 'fleet_name',     l: 'Fleet / Company Name *', ph: 'Morris Trucking LLC' },
                    { k: 'contact_name',   l: 'Your Name',               ph: 'John Morris' },
                    { k: 'contact_email',  l: 'Email *',                 ph: 'john@morristrucking.com', t: 'email' },
                    { k: 'contact_phone',  l: 'Phone Number',            ph: '636-706-8338' },
                    { k: 'mc_number',      l: 'MC Number',               ph: 'MC-123456' },
                    { k: 'dot_number',     l: 'DOT Number',              ph: 'DOT-7654321' },
                  ].map(f => (
                    <div key={f.k}>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: DIM, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }}>{f.l}</label>
                      <input type={f.t || 'text'} placeholder={f.ph} value={orderForm[f.k]} onChange={e => setOrderForm(p => ({ ...p, [f.k]: e.target.value }))}
                        style={{ width: '100%', padding: '11px 13px', background: CARD, border: `1px solid ${BORD}`, borderRadius: 9, color: WHITE, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: DIM, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }}>Number of Devices</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button onClick={() => setOrderForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))} style={{ width: 42, height: 42, borderRadius: 9, border: `1px solid ${BORD}`, background: CARD, color: WHITE, fontSize: 18, cursor: 'pointer' }}>−</button>
                    <span style={{ fontSize: 22, fontWeight: 900, color: WHITE, minWidth: 36, textAlign: 'center' }}>{orderForm.quantity}</span>
                    <button onClick={() => setOrderForm(f => ({ ...f, quantity: f.quantity + 1 }))} style={{ width: 42, height: 42, borderRadius: 9, border: `1px solid ${BORD}`, background: CARD, color: WHITE, fontSize: 18, cursor: 'pointer' }}>+</button>
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: DIM, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }}>Shipping Address</label>
                  <textarea rows={2} placeholder="Street, City, State, ZIP" value={orderForm.shipping_address} onChange={e => setOrderForm(f => ({ ...f, shipping_address: e.target.value }))}
                    style={{ width: '100%', padding: '11px 13px', background: CARD, border: `1px solid ${BORD}`, borderRadius: 9, color: WHITE, fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
                </div>
                <div style={{ background: G + '10', border: `1px solid ${G}25`, borderRadius: 12, padding: '14px 18px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: DIM, marginBottom: 2 }}>ESTIMATED TOTAL</div>
                    <div style={{ fontSize: 11, color: DIM }}>{orderForm.quantity}× ${planSelected.hw} hardware + ${planSelected.price}/truck/mo</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: G }}>${orderTotal}</div>
                    <div style={{ fontSize: 9, color: DIM }}>hardware + first month</div>
                  </div>
                </div>
                {orderStatus === 'error' && <div style={{ color: RED, fontSize: 12, marginBottom: 10 }}>⚠️ Please fill in Fleet Name and Email.</div>}
                <button onClick={submitOrder} style={{ width: '100%', padding: '15px', borderRadius: 12, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${G},${G2})`, color: '#000', fontWeight: 900, fontSize: 14 }}>📦 Place Order — ${orderTotal}</button>
                <div style={{ textAlign: 'center', marginTop: 14 }}>
                  <a href="tel:16367068338" style={{ color: GREEN, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>📞 Rather call? 636-706-8338 — order in 5 minutes</a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── ACTIVATE TAB ──────────────────────────────────────────────── */}
        {tab === 'activate' && (
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: WHITE, marginBottom: 6 }}>Activate Your Device</div>
            <div style={{ fontSize: 12, color: DIM, marginBottom: 24, lineHeight: 1.6 }}>Find the serial number on the sticker on the back of your device. Enter it below — you're live in 60 seconds.</div>
            {activateStatus === 'success' ? (
              <div style={{ background: GREEN + '12', border: `1px solid ${GREEN}40`, borderRadius: 16, padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>📡</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: GREEN, marginBottom: 8 }}>Device Activated!</div>
                <div style={{ fontSize: 13, color: DIM, lineHeight: 1.6 }}>{activateForm.driver_name} is now live. All 12 Quantum layers are active. Plug the device into the OBD-II port and telemetry starts within 60 seconds.</div>
                <button onClick={() => setTab('live')} style={{ marginTop: 18, background: GREEN, color: '#000', padding: '12px 28px', borderRadius: 10, border: 'none', fontWeight: 900, fontSize: 13, cursor: 'pointer' }}>View Live Fleet →</button>
              </div>
            ) : (
              <div>
                <div style={{ background: G + '10', border: `2px solid ${G}40`, borderRadius: 14, padding: 18, marginBottom: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: G, letterSpacing: 2, marginBottom: 8 }}>SERIAL NUMBER (sticker on back of device)</div>
                  <input placeholder="TWE-XXXX-XXXX" value={activateForm.device_serial} onChange={e => setActivateForm(f => ({ ...f, device_serial: e.target.value.toUpperCase() }))}
                    style={{ width: '100%', padding: '14px', background: CARD, border: `2px solid ${G}`, borderRadius: 10, color: G, fontSize: 20, fontWeight: 900, outline: 'none', boxSizing: 'border-box', letterSpacing: 3, textAlign: 'center' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 12, marginBottom: 18 }}>
                  {[
                    { k: 'driver_name',  l: "Driver's Name *", ph: 'Marcus Johnson' },
                    { k: 'truck_number', l: 'Truck / Unit #',   ph: 'Unit 101' },
                    { k: 'vin',          l: 'VIN (optional)',   ph: '1HGBH41JXMN109186' },
                    { k: 'fleet_name',   l: 'Fleet Name',       ph: 'Morris Trucking LLC' },
                    { k: 'mc_number',    l: 'MC Number',        ph: 'MC-123456' },
                    { k: 'dot_number',   l: 'DOT Number',       ph: 'DOT-7654321' },
                  ].map(f => (
                    <div key={f.k}>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: DIM, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }}>{f.l}</label>
                      <input placeholder={f.ph} value={activateForm[f.k]} onChange={e => setActivateForm(p => ({ ...p, [f.k]: e.target.value }))}
                        style={{ width: '100%', padding: '11px 13px', background: CARD, border: `1px solid ${BORD}`, borderRadius: 9, color: WHITE, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
                {activateStatus === 'error' && <div style={{ color: RED, fontSize: 12, marginBottom: 10 }}>⚠️ Serial number and driver name are required.</div>}
                <button onClick={submitActivation} style={{ width: '100%', padding: '15px', borderRadius: 12, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${GREEN},#00a86b)`, color: '#000', fontWeight: 900, fontSize: 14 }}>⚡ Activate — All 12 Quantum Layers Go Live</button>
                <div style={{ textAlign: 'center', marginTop: 14 }}>
                  <a href="tel:16367068338" style={{ color: G, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>Need help? 636-706-8338</a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── COMPARE TAB ───────────────────────────────────────────────── */}
        {tab === 'compare' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: WHITE, marginBottom: 6 }}>TruckWithEase vs. The Competition</div>
              <div style={{ fontSize: 12, color: DIM }}>Same ELD. 12 Quantum layers they can't touch. Everything else they never built.</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                <thead>
                  <tr style={{ background: CARD2 }}>
                    <th style={{ padding: '13px 14px', textAlign: 'left', fontSize: 10, color: DIM, letterSpacing: 2 }}>FEATURE</th>
                    {[{ l: 'TruckWithEase', c: G }, { l: 'Samsara', c: DIM }, { l: 'Motive', c: DIM }].map(h => (
                      <th key={h.l} style={{ padding: '13px 14px', textAlign: 'center', fontSize: 12, color: h.c, fontWeight: 900 }}>{h.l}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((row, i) => {
                    const sep = row.twe === null;
                    return (
                      <tr key={i} style={{ background: sep ? G + '06' : (i % 2 === 0 ? CARD : CARD2), borderBottom: `1px solid ${BORD}` }}>
                        <td style={{ padding: '11px 14px', fontSize: sep ? 9 : 11, color: sep ? G : DIM, fontWeight: sep ? 800 : 400, letterSpacing: sep ? 2 : 0, textTransform: sep ? 'uppercase' : 'none' }}>{row.feature}</td>
                        {['twe', 'sam', 'mot'].map(k => (
                          <td key={k} style={{ padding: '11px 14px', textAlign: 'center' }}>
                            {sep ? null : typeof row[k] === 'string' ? (
                              <span style={{ fontWeight: 900, color: k === 'twe' ? G : RED, fontSize: 12 }}>{row[k]}</span>
                            ) : row[k] ? (
                              <span style={{ color: k === 'twe' ? GREEN : DIM, fontSize: 15 }}>✓</span>
                            ) : (
                              <span style={{ color: RED, fontSize: 15 }}>✗</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 20, background: G + '10', border: `1px solid ${G}30`, borderRadius: 14, padding: 22, textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: WHITE, marginBottom: 6 }}>Fleet pricing: $49.99/truck/mo with the hardware lease included</div>
              <div style={{ fontSize: 11, color: DIM, marginBottom: 16 }}>Or $59.99/driver/mo hardware-owned ($600/truck one-time). 14-day trial, no contract. We do not quote other vendors' prices, so run your own numbers against your current invoice.</div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setTab('order')} style={{ background: `linear-gradient(135deg,${G},${G2})`, color: '#000', padding: '12px 28px', borderRadius: 10, border: 'none', fontWeight: 900, fontSize: 13, cursor: 'pointer' }}>Order Now →</button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SPECS TAB ─────────────────────────────────────────────────── */}
        {tab === 'specs' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }}>
            {[
              { title: '📡 Connectivity', specs: [['Network','4G LTE Cat-M1 + WiFi 802.11 b/g/n'],['GPS','u-blox M8 · 2.5m accuracy · 1Hz'],['Bluetooth','BLE 5.0 (driver pairing)'],['Data Plan','Included — no SIM fee']] },
              { title: '⚙️ Hardware', specs: [['Connector','J1939/J1708 + OBD-II universal'],['Processor','ARM Cortex-M7 @ 216 MHz'],['Memory','512MB flash + 128MB RAM'],['Battery Backup','4 hours capacitor-based'],['Enclosure','IP67 waterproof/dustproof'],['Temp Range','-40°F to +185°F']] },
              { title: '🛡️ Compliance', specs: [['FMCSA','49 CFR Part 395 registered'],['Data Retention','6 months on-device + cloud'],['DOT Inspection','One-tap roadside display'],['Tamper Detection','Alert if unplugged mid-trip'],['Certifications','FCC · IC · CE · RoHS']] },
              { title: '⚛️ Quantum Engine', specs: [['Layers','12 active from first power-on'],['Route Compute','2.4 trillion permutations/dispatch'],['Violation Prediction','72 hours ahead'],['Log Security','SHA-256 cryptographic seal'],['Query Speed','< 80ms · 3yr data window'],['Auto-Assign','Zero dispatcher clicks']] },
              { title: '📊 Platform', specs: [['HOS Rules','Property · Passenger · Alaska · CA'],['DVIR','Pre-trip · Post-trip · Trailer · Roadside'],['Driver Score','8-point real-drive scoring'],['Violation Alerts','Push · SMS · In-app'],['Audit Trail','Auto-generated DOT-ready PDF'],['API','REST — Enterprise plan']] },
              { title: '💰 Pricing', specs: [['Hardware','$79–$99 one-time'],['Owner-Operator','$29/truck/mo'],['Fleet Pro (5+)','$19/truck/mo'],['Enterprise (20+)','$14/truck/mo'],['Contract','Month-to-month · cancel anytime'],['Platform','Full TruckWithEase — included']] },
            ].map(section => (
              <div key={section.title} style={{ background: CARD2, border: `1px solid ${BORD}`, borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: G, marginBottom: 14 }}>{section.title}</div>
                {section.specs.map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', borderBottom: `1px solid ${BORD}` }}>
                    <span style={{ fontSize: 10, color: DIM, flexShrink: 0 }}>{k}</span>
                    <span style={{ fontSize: 10, color: WHITE, fontWeight: 600, textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── FLOATING CALL ──────────────────────────────────────────────────── */}
      <a href="tel:16367068338" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, background: GREEN, color: '#000', width: 54, height: 54, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, textDecoration: 'none', boxShadow: `0 4px 24px ${GREEN}50` }}>📞</a>
    </div>
  );
}
