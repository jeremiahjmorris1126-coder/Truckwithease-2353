import { useState, useEffect, useRef } from 'react';

const C = {
  truck: '#F5A623', car: '#00D68F', bike: '#00E5FF',
  dark: '#080810', card: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.8)',
  dim: 'rgba(255,255,255,0.4)',
};

const VEHICLE_MODES = {
  truck: {
    label: 'TRACTOR-TRAILER', emoji: '🚛', color: C.truck,
    glow: 'rgba(245,166,35,0.3)',
    layers: [
      { name: 'Weight Restriction Scan', desc: 'Bridge weight limits, low clearance routes, restricted zones — auto-avoided', time: '0.3s' },
      { name: 'HazMat Corridor Check', desc: 'Tunnel restrictions, populated area routing, placard requirements validated', time: '0.4s' },
      { name: 'Fuel Station Optimizer', desc: 'Diesel prices along route, DEF availability, parking confirmed at each stop', time: '0.5s' },
      { name: 'ELD Hours Sync', desc: 'Drive time remaining cross-referenced — route adjusted to keep HOS compliant', time: '0.3s' },
      { name: 'Weigh Station Predictor', desc: 'Open/closed status + bypass qualification via PrePass/Drivewyze', time: '0.4s' },
      { name: 'Weather & Road Conditions', desc: 'Ice, high wind, fog, flooding — alternate route staged before impact', time: '0.6s' },
      { name: 'Toll Optimization', desc: 'Cheapest toll path calculated — transponder rates vs cash vs alternate', time: '0.3s' },
      { name: 'Parking Intelligence', desc: 'Confirmed truck stops, rest areas, and legal overnight spots at destination', time: '0.5s' },
      { name: 'Profit Per Mile Calc', desc: 'Net earnings after fuel, tolls, and time — displayed before you accept the load', time: '0.2s' },
      { name: 'Ghost Nerve Override', desc: 'Proprietary layer — re-optimizes all 9 variables simultaneously every 60 seconds', time: '0.1s' },
    ],
    stats: [{ label: 'Avg Miles Saved', val: '47/load' }, { label: 'Fuel Savings', val: '$28/load' }, { label: 'HOS Compliance', val: '100%' }, { label: 'On-Time Rate', val: '96.4%' }],
  },
  car: {
    label: 'DELIVERY VEHICLE', emoji: '🚗', color: C.car,
    glow: 'rgba(0,214,143,0.3)',
    layers: [
      { name: 'Real-Time Traffic Mesh', desc: '47 simultaneous traffic data points — accidents, slowdowns, signal timing all computed', time: '0.2s' },
      { name: 'Delivery Sequence AI', desc: 'Optimal drop order calculated for all stops — saves 18–34 minutes per shift', time: '0.4s' },
      { name: 'Fuel Price Radar', desc: 'Live gas prices within 2 miles of route — cheapest station surfaced automatically', time: '0.3s' },
      { name: 'Parking Availability', desc: 'Street parking, meters, loading zones — confirmed open before you arrive', time: '0.5s' },
      { name: 'Platform Earnings Max', desc: 'Highest-paying orders on your route calculated across all gig apps simultaneously', time: '0.4s' },
      { name: 'Tax Mile Logger', desc: 'Every mile logged automatically to IRS-standard mileage record — zero manual entry', time: '0.1s' },
      { name: 'School Zone / Speed Alert', desc: 'Zone boundaries, active hours, and camera locations — zero violations', time: '0.3s' },
      { name: 'Weather Rerouter', desc: 'Rain, ice, and flooding rerouted before impact — customer ETA auto-updated', time: '0.4s' },
      { name: 'Vehicle Health Monitor', desc: 'Oil life, tire pressure, battery charge — alert before a breakdown costs your shift', time: '0.3s' },
      { name: 'Earnings Intelligence', desc: 'Slow zones, high-tip areas, surge timing — your earning pattern learned and optimized', time: '0.2s' },
    ],
    stats: [{ label: 'Time Saved/Shift', val: '28 min' }, { label: 'More Deliveries', val: '+6/day' }, { label: 'Extra Earnings', val: '+$34/day' }, { label: 'Miles Logged', val: 'Auto' }],
  },
  bike: {
    label: 'BIKE & E-BIKE COURIER', emoji: '🚲', color: C.bike,
    glow: 'rgba(0,229,255,0.3)',
    layers: [
      { name: 'Protected Lane Router', desc: 'Bike lanes, greenways, low-traffic streets — city infrastructure mapped in real time', time: '0.3s' },
      { name: 'Elevation Intelligence', desc: 'Climbs avoided or staged based on your fitness level and e-bike battery remaining', time: '0.4s' },
      { name: 'Wind & Weather Layer', desc: 'Headwind corridors avoided, crosswind alerts, rain routing via covered streets', time: '0.3s' },
      { name: 'E-Bike Battery Planner', desc: 'Range calculated per route — charging stations staged before battery hits 20%', time: '0.5s' },
      { name: 'City Law Compliance', desc: 'NYC, Chicago, SF, LA rules — sidewalk zones, speed limits, registration checked', time: '0.4s' },
      { name: 'Pedestrian Density Map', desc: 'High foot-traffic zones flagged — safer routes prioritized for courier and public', time: '0.3s' },
      { name: 'Delivery Sequence Opt', desc: 'Multi-stop order optimized for bike speed, lane access, and building entry points', time: '0.4s' },
      { name: 'Safety Zone Awareness', desc: 'Nearest hospital, police station, and safe stop plotted at all times along route', time: '0.2s' },
      { name: 'Earnings Per Pedal', desc: 'Real earnings per mile by platform — tells you which orders are worth taking', time: '0.3s' },
      { name: 'Incident Predictor', desc: 'Historical accident intersections, door-zone streets, and hazard zones flagged proactively', time: '0.2s' },
    ],
    stats: [{ label: 'Safe Routes', val: '100%' }, { label: 'Battery Saved', val: '31%' }, { label: 'More Deliveries', val: '+8/shift' }, { label: 'Incident Rate', val: '-67%' }],
  },
};

const FEED_ITEMS = [
  { vehicle: 'truck', emoji: '🚛', msg: 'Ghost Nerve re-optimized I-80 route — saving $41 in fuel', color: C.truck },
  { vehicle: 'car', emoji: '🚗', msg: 'Delivery sequence updated — added 3 more orders, same route', color: C.car },
  { vehicle: 'bike', emoji: '🚲', msg: 'Protected lane on Michigan Ave confirmed open — route locked', color: C.bike },
  { vehicle: 'truck', emoji: '🚛', msg: 'Weigh station I-70 MM 204 — bypass qualified via PrePass', color: C.truck },
  { vehicle: 'car', emoji: '🚗', msg: 'Surge zone detected — $2.4x multiplier active on 5th Ave', color: C.car },
  { vehicle: 'bike', emoji: '🚲', msg: 'E-bike battery 34% — charging station staged at next stop', color: C.bike },
  { vehicle: 'truck', emoji: '🚛', msg: 'HazMat tunnel restriction avoided — 4-minute alternate route', color: C.truck },
  { vehicle: 'car', emoji: '🚗', msg: 'School zone active — speed alert issued, route flagged', color: C.car },
  { vehicle: 'bike', emoji: '🚲', msg: 'Headwind 18mph on Lake Shore — inland route prioritized', color: C.bike },
  { vehicle: 'truck', emoji: '🚛', msg: 'Parking confirmed — Loves Exit 204, 23 spots available', color: C.truck },
];

export default function QuantumRoutingEngine() {
  const [mode, setMode] = useState('truck');
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const [feedIdx, setFeedIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const intervalRef = useRef(null);
  const vm = VEHICLE_MODES[mode];

  useEffect(() => {
    const t = setInterval(() => setFeedIdx(i => (i + 1) % FEED_ITEMS.length), 2500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setRunning(false);
    setStep(-1);
    setDone(false);
    setCompletedSteps([]);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [mode]);

  const runOptimization = () => {
    if (running) return;
    setRunning(true);
    setStep(0);
    setDone(false);
    setCompletedSteps([]);
    let s = 0;
    intervalRef.current = setInterval(() => {
      setStep(s);
      setCompletedSteps(prev => [...prev, s]);
      s++;
      if (s >= vm.layers.length) {
        clearInterval(intervalRef.current);
        setRunning(false);
        setDone(true);
        setStep(-1);
      }
    }, 600);
  };

  const feed = FEED_ITEMS[feedIdx];

  return (
    <div style={{
      minHeight: '100vh',
      background: C.dark,
      fontFamily: "'Rajdhani', 'Barlow Condensed', sans-serif",
      color: '#fff',
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, #05050f 0%, ${C.dark} 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: 'clamp(40px,8vw,80px) 24px 40px',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: vm.glow, filter: 'blur(120px)',
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          opacity: 0.2, pointerEvents: 'none', transition: 'background 0.6s',
        }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-block', fontSize: 11, letterSpacing: 5,
            color: vm.color, fontWeight: 800, textTransform: 'uppercase',
            marginBottom: 16, padding: '6px 20px',
            border: `1px solid ${vm.color}40`,
            borderRadius: 2, background: `${vm.color}10`,
            transition: 'all 0.4s',
          }}>
            QUANTUM ROUTING INTELLIGENCE
          </div>
          <h1 style={{
            fontSize: 'clamp(32px,6vw,72px)', fontWeight: 900,
            margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: -1,
          }}>
            EVERY VEHICLE.<br />
            <span style={{ color: vm.color, transition: 'color 0.4s' }}>ONE BRAIN.</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px,2vw,18px)', color: C.text, maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.6 }}>
            10-layer quantum optimization running simultaneously for trucks, cars, and bikes.
            The same intelligence. Tuned perfectly to your vehicle.
          </p>

          {/* Vehicle Selector */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {Object.entries(VEHICLE_MODES).map(([key, v]) => (
              <button key={key} onClick={() => setMode(key)} style={{
                padding: '14px 28px', borderRadius: 4, cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 800, fontSize: 15,
                textTransform: 'uppercase', letterSpacing: 2,
                transition: 'all 0.3s',
                background: mode === key ? v.color : 'transparent',
                color: mode === key ? C.dark : v.color,
                border: `2px solid ${v.color}`,
                boxShadow: mode === key ? `0 0 24px ${v.color}60` : 'none',
              }}>
                {v.emoji} {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Feed Strip */}
      <div style={{
        background: `${feed.color}12`,
        borderBottom: `1px solid ${feed.color}30`,
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', gap: 12,
        transition: 'background 0.5s',
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: feed.color, boxShadow: `0 0 8px ${feed.color}`,
          animation: 'pulse 1.5s infinite',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 13, color: feed.color, fontWeight: 700, letterSpacing: 1 }}>LIVE</span>
        <span style={{ fontSize: 14, color: C.text }}>
          {feed.emoji} {feed.msg}
        </span>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Stats Row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
          gap: 16, marginBottom: 48,
        }}>
          {vm.stats.map((s, i) => (
            <div key={i} style={{
              background: C.card, border: `1px solid ${vm.color}30`,
              borderRadius: 8, padding: '20px 16px', textAlign: 'center',
              transition: 'all 0.4s',
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: vm.color, letterSpacing: -1 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: C.dim, letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
          {/* Optimization Layers */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: 2 }}>
                {vm.emoji} {vm.label} — 10 OPTIMIZATION LAYERS
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
              {vm.layers.map((layer, i) => {
                const isActive = step === i;
                const isDone = completedSteps.includes(i);
                return (
                  <div key={i} style={{
                    background: isActive ? `${vm.color}18` : isDone ? `${vm.color}08` : C.card,
                    border: `1px solid ${isActive ? vm.color : isDone ? `${vm.color}40` : C.border}`,
                    borderRadius: 6, padding: '14px 18px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    transition: 'all 0.3s',
                    transform: isActive ? 'translateX(4px)' : 'none',
                    boxShadow: isActive ? `0 0 20px ${vm.color}30` : 'none',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: isDone ? vm.color : isActive ? `${vm.color}30` : C.border,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 900, color: isDone ? C.dark : vm.color,
                      transition: 'all 0.3s',
                    }}>
                      {isDone ? '✓' : isActive ? '◉' : i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? vm.color : '#fff', letterSpacing: 0.5 }}>
                        {layer.name}
                      </div>
                      <div style={{ fontSize: 12, color: C.dim, marginTop: 2, lineHeight: 1.4 }}>{layer.desc}</div>
                    </div>
                    <div style={{
                      fontSize: 11, color: isDone ? vm.color : C.dim,
                      fontWeight: 700, letterSpacing: 1, flexShrink: 0,
                    }}>
                      {isDone ? `✓ ${layer.time}` : layer.time}
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={runOptimization} disabled={running} style={{
              width: '100%', padding: '18px 0', borderRadius: 6,
              background: done ? vm.color : running ? 'transparent' : vm.color,
              border: `2px solid ${vm.color}`,
              color: done || !running ? C.dark : vm.color,
              fontSize: 16, fontWeight: 900, letterSpacing: 3,
              textTransform: 'uppercase', cursor: running ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'all 0.3s',
              boxShadow: !running ? `0 0 32px ${vm.color}50` : 'none',
            }}>
              {done ? '✓ ROUTE OPTIMIZED — RUN AGAIN' : running ? `⚡ OPTIMIZING LAYER ${step + 1} OF ${vm.layers.length}...` : `⚡ RUN QUANTUM OPTIMIZATION`}
            </button>
          </div>

          {/* Side Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Mode comparison */}
            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: 24,
            }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: C.dim, textTransform: 'uppercase', marginBottom: 16 }}>
                ALL THREE MODES — LIVE NOW
              </div>
              {Object.entries(VEHICLE_MODES).map(([key, v]) => (
                <div key={key} onClick={() => setMode(key)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0', borderBottom: `1px solid ${C.border}`,
                  cursor: 'pointer', opacity: mode === key ? 1 : 0.6,
                  transition: 'opacity 0.2s',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: v.color, boxShadow: `0 0 8px ${v.color}`,
                    animation: 'pulse 2s infinite',
                  }} />
                  <span style={{ fontSize: 22 }}>{v.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: v.color }}>{v.label}</div>
                    <div style={{ fontSize: 11, color: C.dim }}>{v.layers.length} optimization layers active</div>
                  </div>
                  {mode === key && <div style={{ fontSize: 11, color: v.color, fontWeight: 700 }}>ACTIVE</div>}
                </div>
              ))}
            </div>

            {/* Ghost Nerve Badge */}
            <div style={{
              background: 'linear-gradient(135deg, #0a0a1a, #050510)',
              border: '1px solid rgba(245,166,35,0.3)',
              borderRadius: 8, padding: 24,
            }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: C.truck, textTransform: 'uppercase', marginBottom: 12 }}>
                ⚡ GHOST NERVE LAYER
              </div>
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6, marginBottom: 16 }}>
                The proprietary intelligence layer that runs beneath all three vehicle modes simultaneously — re-optimizing every route, every variable, every 60 seconds. No other platform has this.
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['TRUCKS', 'CARS', 'BIKES'].map(v => (
                  <div key={v} style={{
                    padding: '4px 12px', borderRadius: 2,
                    background: 'rgba(245,166,35,0.1)',
                    border: '1px solid rgba(245,166,35,0.3)',
                    fontSize: 11, color: C.truck, fontWeight: 700, letterSpacing: 2,
                  }}>{v}</div>
                ))}
              </div>
            </div>

            {/* No competitor badge */}
            <div style={{
              background: 'rgba(255,61,87,0.06)',
              border: '1px solid rgba(255,61,87,0.2)',
              borderRadius: 8, padding: 20,
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#FF3D57', marginBottom: 8, letterSpacing: 1 }}>
                ZERO COMPETITORS HAVE THIS
              </div>
              <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6 }}>
                Samsara: trucks only.<br />
                Motive: trucks only.<br />
                DAT: trucks only.<br />
                <span style={{ color: '#fff', fontWeight: 700 }}>TruckWithEase: every vehicle on the road.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
