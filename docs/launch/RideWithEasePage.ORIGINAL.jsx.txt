import { useState, useEffect } from 'react';

const C = {
  blue: '#00E5FF', dark: '#060A10', card: 'rgba(0,229,255,0.07)',
  border: 'rgba(0,229,255,0.18)', text: 'rgba(255,255,255,0.85)',
  dim: 'rgba(255,255,255,0.42)', glow: 'rgba(0,229,255,0.22)',
  green: '#00D68F', amber: '#F5A623', red: '#FF3D57',
  surface: 'rgba(255,255,255,0.05)', gold: '#c9a84c',
};

const TABS = [
  { icon: '🏠', label: 'Dashboard' },
  { icon: '🗺️', label: 'Route AI' },
  { icon: '💵', label: 'Earnings' },
  { icon: '🧾', label: 'Tax & Miles' },
  { icon: '🚲', label: 'Bike Care' },
  { icon: '📦', label: 'Deliveries' },
  { icon: '🛡️', label: 'Safety' },
  { icon: '🔋', label: 'Battery & Gear' },
  { icon: '⚡', label: 'Charging' },
  { icon: '🏆', label: 'Rig Bucks' },
];

const PLATFORMS = [
  { name: 'DoorDash', icon: '🍔', color: '#FF3008', status: 'Active', earn: '$114', deliveries: 24, rating: 4.9, available: true },
  { name: 'Uber Eats', icon: '🛵', color: '#06C167', status: 'Active', earn: '$98', deliveries: 19, rating: 4.8, available: true },
  { name: 'GrubHub', icon: '🍟', color: '#F63440', status: 'Active', earn: '$72', deliveries: 14, rating: 4.7, available: true },
  { name: 'Postmates', icon: '📫', color: '#00CC99', status: 'Active', earn: '$61', deliveries: 11, rating: 4.8, available: true },
  { name: 'Amazon Flex', icon: '📦', color: '#FF9900', status: 'Available', earn: '$0', deliveries: 0, rating: null, available: false },
  { name: 'Instacart', icon: '🛒', color: '#43B02A', status: 'Available', earn: '$0', deliveries: 0, rating: null, available: false },
  { name: 'Relay', icon: '🚀', color: '#0055FF', status: 'Available', earn: '$0', deliveries: 0, rating: null, available: false },
  { name: 'Shipt', icon: '🎯', color: '#EE3244', status: 'Available', earn: '$0', deliveries: 0, rating: null, available: false },
];

const ROUTES = [
  { name: 'Hudson River Greenway — NYC Food Loop', city: 'New York', distance: '8.4 mi', duration: '38 min', deliveries: 6, earn: '$58', net: '$58', type: 'Protected Path', safety: 99, tip: 'Car-free entire route — fastest food loop in NYC' },
  { name: 'Chicago Lakefront — Lakeview Corridor', city: 'Chicago', distance: '5.2 mi', duration: '24 min', deliveries: 4, earn: '$44', net: '$44', type: 'Protected Path', safety: 97, tip: 'Lake view the entire way — zero traffic conflicts' },
  { name: 'Market Street Protected Lane — SF', city: 'San Francisco', distance: '3.8 mi', duration: '18 min', deliveries: 5, earn: '$52', net: '$52', type: 'Protected Lane', safety: 91, tip: 'Watch Muni tracks at cross streets' },
  { name: 'LA Beach Corridor — Santa Monica', city: 'Los Angeles', distance: '7.1 mi', duration: '31 min', deliveries: 5, earn: '$48', net: '$48', type: 'Beachfront Trail', safety: 94, tip: 'No motor vehicles — 22 mi of flat paved path' },
  { name: 'Midtown Manhattan — Office Catering', city: 'New York', distance: '2.6 mi', duration: '22 min', deliveries: 8, earn: '$74', net: '$74', type: 'Urban Mixed', safety: 74, tip: 'Peak window 11am–1pm — stay in protected lanes, avoid 5th Ave door zone' },
  { name: 'Austin Greenway — Rainey Street Run', city: 'Austin', distance: '4.4 mi', duration: '20 min', deliveries: 5, earn: '$51', net: '$51', type: 'Mixed Trail', safety: 92, tip: 'Lady Bird Lake loop — smooth surface, high tip areas' },
];

const BIKE_TYPES = [
  { name: 'E-Bike', emoji: '⚡🚲', range: '25–60 mi / charge', best: 'High-volume delivery, hills, long shifts', earn: '$90–$140/day', power: 'Motor-assisted, 28 mph max' },
  { name: 'Road Bike', emoji: '🚴', range: 'Unlimited', best: 'Fast flat routes, catering, downtown loops', earn: '$70–$110/day', power: 'Human-powered, 18–22 mph avg' },
  { name: 'Cargo Bike', emoji: '📦🚲', range: '20–40 mi / charge', best: 'Bulk grocery, large orders, multi-stop batches', earn: '$80–$130/day', power: 'E-assist, 250 lbs cargo capacity' },
  { name: 'Hybrid / City Bike', emoji: '🚲', range: 'Unlimited', best: 'All-around delivery, urban routes', earn: '$65–$100/day', power: 'Human-powered, 14–18 mph avg' },
  { name: 'Fat Tire E-Bike', emoji: '🏔️🚲', range: '20–35 mi / charge', best: 'All weather, gravel routes, winter deliveries', earn: '$80–$120/day', power: 'E-assist, stable in rain and snow' },
];

const MAINTENANCE = [
  { item: 'Chain Lubrication', status: 'DUE', miles: 0, color: C.red },
  { item: 'Tire Pressure', status: 'OK', psi: '90 PSI front / 95 PSI rear', color: C.green },
  { item: 'Brake Pads', status: 'OK', miles: 640, color: C.green },
  { item: 'Battery Health', status: 'GOOD', pct: '89%', color: C.green },
  { item: 'Rear Derailleur', status: 'CHECK', miles: null, color: C.amber },
  { item: 'Helmet Inspection', status: 'OK', months: 8, color: C.green },
  { item: 'Lights — Front & Rear', status: 'OK', hours: 14, color: C.green },
  { item: 'Cable Tension', status: 'OK', miles: 1200, color: C.green },
];

const SAFETY_ZONES = [
  { zone: 'Hudson River Greenway, NYC', level: 'SAFEST', score: 99, tip: 'Car-free entire route. Emergency call boxes every 0.5 mi. Safest urban path in the US.' },
  { zone: 'Midtown Manhattan, NYC', level: 'CAUTION', score: 72, tip: 'High door-zone risk on 5th Ave. Stay in the protected lane, never to the right of the line.' },
  { zone: 'South Side Chicago', level: 'WARNING', score: 54, tip: 'Ride before dusk. Use main arterials only. Never cut through alleys at night.' },
  { zone: 'Chicago Lakefront Trail', level: 'SAFEST', score: 97, tip: 'Pedestrian crossings at Oak Street need caution on weekends.' },
  { zone: 'Market Street, SF', level: 'SAFE', score: 88, tip: 'Protected lane full length. Watch Muni tracks at every crossing — approach at 90°.' },
  { zone: 'Tenderloin, SF', level: 'WARNING', score: 51, tip: 'Avoid after 9pm. Use alternate Van Ness protected lane instead.' },
  { zone: 'Miami Beach Boardwalk', level: 'SAFEST', score: 98, tip: 'Fully pedestrian and bike — watch for tourists walking slowly near the strip.' },
  { zone: 'Rainey Street, Austin', level: 'SAFE', score: 89, tip: 'After 10pm, bar traffic increases. Use app lights on max visibility mode.' },
];

const LEVEL_C = { SAFEST: C.green, SAFE: C.blue, CAUTION: C.amber, WARNING: C.red };

const BATTERY_CHECKLIST = [
  { item: 'Charge to 80% before long shift (extends battery life)', done: true },
  { item: 'Never store battery below 20% for more than 48 hrs', done: true },
  { item: 'Keep battery out of direct sun when parked', done: false },
  { item: 'Bring portable USB charger for emergencies', done: true },
  { item: 'Full discharge cycle once per month to calibrate gauge', done: false },
];

const GEAR = [
  { item: '🪖 Helmet', status: 'Certified', brand: 'Giro Syntax MIPS', last: '8 months ago' },
  { item: '💡 Front Light', status: 'Charged', brand: 'Cygolite Metro Pro 1100', last: 'Last night' },
  { item: '🔴 Rear Light', status: 'Charged', brand: 'Bontrager Ion 200 RT', last: 'Last night' },
  { item: '🔒 Lock', status: 'OK', brand: 'Kryptonite Evolution U-Lock', last: '—' },
  { item: '🧤 Gloves', status: 'OK', brand: 'Giro DND II', last: '—' },
  { item: '📱 Phone Mount', status: 'Secure', brand: 'Quad Lock Pro', last: 'Checked today' },
  { item: '🎒 Insulated Bag', status: 'Clean', brand: 'Cargo Works Hotbag L', last: 'Washed 3 days ago' },
  { item: '🩹 First Aid Kit', status: 'Stocked', brand: 'Adventure Medical Kits', last: 'Restocked last month' },
];

const TAX_ITEMS = [
  { label: 'Miles Logged This Month', value: '1,402 mi', detail: 'Est. $770 deduction at IRS rate' },
  { label: 'Miles Logged This Year', value: '16,840 mi', detail: 'Est. $9,239 annual deduction' },
  { label: 'Platform Fees Paid', value: '$84.20', detail: 'DoorDash, Uber Eats — all deductible' },
  { label: 'Gear & Equipment', value: '$1,240', detail: 'Helmet, lights, bag, lock — fully deductible' },
  { label: 'Bike Maintenance', value: '$314', detail: 'Tubes, chains, brake pads — documented' },
  { label: 'Phone / Data (Business %)', value: '82%', detail: 'Est. $984/year deduction' },
  { label: 'E-Bike Depreciation', value: 'Section 179', detail: 'Full e-bike cost may qualify — ask your CPA' },
  { label: 'IRS Report Ready', value: 'Yes', detail: 'Export PDF or CSV anytime — ready for your accountant' },
];

const DELIVERIES = [
  { id: 'DD-88214', customer: 'M. Jackson', address: '182 W Madison, Chicago', platform: 'DoorDash', status: 'Delivered', time: '11:44am', photo: true, tip: '$4.00' },
  { id: 'DD-88215', customer: 'A. Patel', address: '340 N Michigan Ave, Chicago', platform: 'DoorDash', status: 'Delivered', time: '12:02pm', photo: true, tip: '$6.50' },
  { id: 'UE-22811', customer: 'S. Thompson', address: '219 W Erie St, Chicago', platform: 'Uber Eats', status: 'In Progress', time: '—', photo: false, tip: null },
  { id: 'UE-22812', customer: 'K. Rivera', address: '1447 N Wells St, Chicago', platform: 'Uber Eats', status: 'Pending', time: '—', photo: false, tip: null },
  { id: 'DD-88216', customer: 'T. Williams', address: '800 N Clark St, Chicago', platform: 'DoorDash', status: 'Pending', time: '—', photo: false, tip: null },
];

const STATUS_C = { Delivered: C.green, 'In Progress': C.amber, Pending: C.dim };

const FEED = [
  { icon: '🗺️', msg: 'Protected lane on Michigan Ave updated — fastest route active', color: C.blue },
  { icon: '🌦️', msg: 'Rain in 20 min — waterproof covered route queued automatically', color: C.amber },
  { icon: '💵', msg: 'Shift earnings: $114.40 — 24 deliveries, 0 incidents', color: C.green },
  { icon: '🔋', msg: 'E-bike battery: 67% — 18 miles remaining on current charge', color: C.green },
  { icon: '🏆', msg: '5-star delivery streak — 100 Rig Bucks earned automatically', color: C.amber },
  { icon: '🛡️', msg: 'Safe zone active — nearest ER 0.3 miles, SOS ready', color: C.red },
  { icon: '📦', msg: '24 deliveries confirmed — photo proof auto-enabled on all', color: C.green },
  { icon: '🅿️', msg: 'Secured bike parking — 0.1 mi from your next drop', color: C.blue },
];

export default function RideWithEasePage() {
  const [tab, setTab] = useState(0);
  const [feedIdx, setFeedIdx] = useState(0);
  const [activePlatform, setActivePlatform] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [activeBike, setActiveBike] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setFeedIdx(i => (i + 1) % FEED.length), 2800);
    return () => clearInterval(t);
  }, []);

  const s = {
    page: { background: C.dark, minHeight: '100vh', color: '#fff', fontFamily: "'Oswald', 'Bebas Neue', sans-serif" },
    header: { background: 'linear-gradient(135deg, rgba(0,229,255,0.12) 0%, rgba(6,10,16,0.98) 60%)', borderBottom: `1px solid ${C.border}`, padding: '18px 24px' },
    tabBar: { display: 'flex', gap: 4, padding: '12px 20px', borderBottom: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.3)', overflowX: 'auto', flexWrap: 'nowrap' },
    tab: (a) => ({ padding: '7px 14px', borderRadius: 8, border: `1px solid ${a ? C.blue : 'transparent'}`, background: a ? 'rgba(0,229,255,0.12)' : 'transparent', color: a ? C.blue : C.dim, cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5 }),
    card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 },
    label: { fontSize: 10, letterSpacing: 4, color: C.blue, textTransform: 'uppercase', fontWeight: 800, marginBottom: 6 },
    wrap: { padding: '20px 20px 40px' },
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: C.blue, fontWeight: 800, marginBottom: 4 }}>RIDEWITHEASE — BIKE & E-BIKE COURIER PLATFORM</div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 1 }}>🚲 Ride<span style={{ color: C.blue }}>WithEase</span></div>
            <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>Road Bikes · E-Bikes · Cargo Bikes · Every City · Every Platform — One Complete Courier Dashboard</div>
          </div>
          <div style={{ background: 'rgba(0,229,255,0.08)', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 16px', maxWidth: 340, flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 10, color: C.blue, letterSpacing: 3, marginBottom: 4, fontWeight: 800 }}>LIVE FEED</div>
            <div style={{ fontSize: 13, color: FEED[feedIdx].color, fontWeight: 700, transition: 'all 0.4s' }}>{FEED[feedIdx].icon} {FEED[feedIdx].msg}</div>
          </div>
        </div>

        {/* KPI Strip */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { l: "Today's Earnings", v: '$114.40', c: C.green },
            { l: 'Deliveries', v: '24 done', c: C.amber },
            { l: 'Miles Today', v: '28.4 mi', c: C.blue },
            { l: 'Battery Left', v: '67%', c: C.green },
            { l: 'Weekly Total', v: '$612', c: C.gold },
            { l: 'Active Platforms', v: '4', c: C.dim },
          ].map(k => (
            <div key={k.l} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', flex: 1, minWidth: 110 }}>
              <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3 }}>{k.l}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: k.c }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      <div style={s.tabBar}>
        {TABS.map((t2, i) => (
          <button key={i} style={s.tab(tab === i)} onClick={() => setTab(i)}>{t2.icon} {t2.label}</button>
        ))}
      </div>

      <div style={s.wrap}>

        {/* ── DASHBOARD ── */}
        {tab === 0 && (
          <div>
            <div style={{ ...s.label, marginBottom: 16 }}>Your Platforms — This Week</div>
            <div style={s.grid2}>
              {PLATFORMS.map(p => (
                <div key={p.name} onClick={() => setActivePlatform(activePlatform?.name === p.name ? null : p)} style={{ ...s.card, cursor: 'pointer', borderColor: activePlatform?.name === p.name ? C.blue : C.border, transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontSize: 24 }}>{p.icon}</div>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: 15 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: p.available ? C.blue : C.dim }}>{p.status}</div>
                      </div>
                    </div>
                    {p.available && <div style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{p.earn}</div>}
                  </div>
                  {p.available ? (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ fontSize: 11, color: C.dim }}>{p.deliveries} deliveries this week</div>
                      <div style={{ fontSize: 11, color: C.amber }}>★ {p.rating}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: C.dim }}>Tap to connect this platform</div>
                  )}
                </div>
              ))}
            </div>

            {activePlatform && (
              <div style={{ ...s.card, marginTop: 16, borderColor: C.blue }}>
                <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>{activePlatform.icon} {activePlatform.name} — Quick Actions</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {['View Route Queue', 'Log Earnings', 'Upload Receipt', 'Report Issue', 'View History'].map(a => (
                    <button key={a} style={{ background: 'rgba(0,229,255,0.1)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 14px', color: C.blue, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{a}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ ...s.card, marginTop: 20 }}>
              <div style={{ ...s.label }}>Today's Shift Progress</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: C.text }}>24 of 24 deliveries completed</span>
                <span style={{ fontSize: 13, color: C.green, fontWeight: 900 }}>100% ✓</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: `linear-gradient(90deg, ${C.blue}, ${C.green})`, borderRadius: 4 }} />
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                {[['On-Time Rate', '98.2%', C.green], ['Customer Rating', '4.9 ★', C.amber], ['Incidents', '0', C.green], ['Tips Earned', '$32.50', C.gold]].map(([l, v, c]) => (
                  <div key={l}>
                    <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2 }}>{l.toUpperCase()}</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: c }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ROUTE AI ── */}
        {tab === 1 && (
          <div>
            <div style={{ ...s.label, marginBottom: 4 }}>Bike Route Intelligence</div>
            <p style={{ color: C.text, fontSize: 14, marginBottom: 20 }}>Every route optimized for protected paths, safety rating, and delivery sequence. Rain-aware — alternate covered routes queued automatically when weather rolls in.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ROUTES.map(r => (
                <div key={r.name} onClick={() => setActiveRoute(activeRoute?.name === r.name ? null : r)} style={{ ...s.card, cursor: 'pointer', borderColor: activeRoute?.name === r.name ? C.blue : C.border, transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 4 }}>{r.name}</div>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: C.dim }}>📍 {r.city}</span>
                        <span style={{ fontSize: 11, color: C.dim }}>📏 {r.distance}</span>
                        <span style={{ fontSize: 11, color: C.dim }}>⏱ {r.duration}</span>
                        <span style={{ fontSize: 11, color: C.dim }}>📦 {r.deliveries} stops</span>
                        <span style={{ fontSize: 11, color: LEVEL_C[r.level] || C.green }}>🛡️ Safety {r.safety}/100</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: C.green }}>{r.net}</div>
                      <div style={{ fontSize: 10, color: C.dim }}>{r.type}</div>
                    </div>
                  </div>
                  {activeRoute?.name === r.name && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 12, color: C.text, marginBottom: 12, background: 'rgba(0,229,255,0.08)', borderRadius: 8, padding: '8px 12px' }}>💡 {r.tip}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button style={{ background: C.blue, color: '#000', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 900, fontSize: 13, cursor: 'pointer' }}>🗺️ Start Route</button>
                        <button style={{ background: 'rgba(0,214,143,0.1)', border: `1px solid ${C.green}`, borderRadius: 8, padding: '8px 16px', color: C.green, fontWeight: 900, fontSize: 13, cursor: 'pointer' }}>📊 Profit Breakdown</button>
                        <button style={{ background: 'rgba(245,166,35,0.1)', border: `1px solid ${C.amber}`, borderRadius: 8, padding: '8px 16px', color: C.amber, fontWeight: 900, fontSize: 13, cursor: 'pointer' }}>🌦️ Rain Alternate</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EARNINGS ── */}
        {tab === 2 && (
          <div>
            <div style={{ ...s.label, marginBottom: 4 }}>Earnings Intelligence</div>
            <p style={{ color: C.text, fontSize: 14, marginBottom: 20 }}>Every dollar tracked across every delivery platform. Tips, base pay, bonuses — all unified in one view.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
              {[
                { l: 'This Week', v: '$612', c: C.green },
                { l: 'This Month', v: '$2,480', c: C.green },
                { l: 'Year to Date', v: '$22,140', c: C.amber },
                { l: 'Tips YTD', v: '$4,820', c: C.gold },
                { l: 'Avg Per Delivery', v: '$4.75', c: C.blue },
                { l: 'Best Platform', v: 'DoorDash', c: C.dim },
              ].map(k => (
                <div key={k.l} style={{ ...s.card }}>
                  <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 4 }}>{k.l.toUpperCase()}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: k.c }}>{k.v}</div>
                </div>
              ))}
            </div>
            <div style={{ ...s.label }}>Platform Breakdown — This Week</div>
            <div style={{ ...s.card, marginTop: 12 }}>
              {PLATFORMS.filter(p => p.available).map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{p.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: C.dim }}>{p.deliveries} deliveries · ★ {p.rating}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C.green }}>{p.earn}</div>
                </div>
              ))}
            </div>
            <div style={{ ...s.card, marginTop: 16, borderColor: C.amber }}>
              <div style={{ fontSize: 13, color: C.amber, fontWeight: 900, marginBottom: 8 }}>💡 Earnings Tip</div>
              <div style={{ fontSize: 13, color: C.text }}>Your best earnings-per-mile platform is <strong style={{ color: C.green }}>DoorDash at $4.03/mi</strong>. Midtown office catering orders between 11am–1pm average 38% higher tips — try stacking 2–3 per lunch window.</div>
            </div>
          </div>
        )}

        {/* ── TAX & MILES ── */}
        {tab === 3 && (
          <div>
            <div style={{ ...s.label, marginBottom: 4 }}>Tax Intelligence & Mileage Log</div>
            <p style={{ color: C.text, fontSize: 14, marginBottom: 20 }}>Every delivery mile tracked by GPS. Every repair logged. Your IRS-ready report is always one tap away — most couriers save $6,000–$12,000 per year they never knew about.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TAX_ITEMS.map(t2 => (
                <div key={t2.label} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{t2.label}</div>
                    <div style={{ fontSize: 12, color: C.dim, marginTop: 3 }}>{t2.detail}</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C.blue }}>{t2.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              <button style={{ background: C.blue, color: '#000', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 900, fontSize: 14, cursor: 'pointer' }}>📄 Export IRS Report (PDF)</button>
              <button style={{ background: 'rgba(0,214,143,0.1)', border: `1px solid ${C.green}`, borderRadius: 10, padding: '12px 24px', color: C.green, fontWeight: 900, fontSize: 14, cursor: 'pointer' }}>📊 Export Mileage Log (CSV)</button>
            </div>
          </div>
        )}

        {/* ── BIKE CARE ── */}
        {tab === 4 && (
          <div>
            <div style={{ ...s.label, marginBottom: 4 }}>Bike Maintenance Tracker</div>
            <p style={{ color: C.text, fontSize: 14, marginBottom: 20 }}>Track every service alert before it leaves you stranded on a shift. Alerts based on actual miles ridden — not calendar days.</p>

            <div style={{ ...s.label }}>Your Bike Type</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12, marginBottom: 24 }}>
              {BIKE_TYPES.map(b => (
                <div key={b.name} onClick={() => setActiveBike(activeBike?.name === b.name ? null : b)} style={{ ...s.card, cursor: 'pointer', borderColor: activeBike?.name === b.name ? C.blue : C.border, transition: 'all 0.2s' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{b.emoji}</div>
                  <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 4 }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: C.dim, marginBottom: 6 }}>{b.best}</div>
                  <div style={{ fontSize: 13, color: C.green, fontWeight: 800 }}>{b.earn}</div>
                  {activeBike?.name === b.name && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 11, color: C.dim }}>Range: {b.range}</div>
                      <div style={{ fontSize: 11, color: C.dim, marginTop: 3 }}>Power: {b.power}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ ...s.label }}>Service Alerts</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {MAINTENANCE.map(m => (
                <div key={m.item} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{m.item}</div>
                    {m.miles && <div style={{ fontSize: 11, color: C.dim }}>Due in {m.miles} mi</div>}
                    {m.psi && <div style={{ fontSize: 11, color: C.dim }}>{m.psi}</div>}
                    {m.pct && <div style={{ fontSize: 11, color: C.dim }}>Battery health: {m.pct}</div>}
                    {m.months && <div style={{ fontSize: 11, color: C.dim }}>{m.months} months old</div>}
                    {m.hours && <div style={{ fontSize: 11, color: C.dim }}>{m.hours} hours charge remaining</div>}
                  </div>
                  <div style={{ background: `${m.color}22`, border: `1px solid ${m.color}`, borderRadius: 6, padding: '3px 10px', fontSize: 11, color: m.color, fontWeight: 800 }}>{m.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DELIVERIES ── */}
        {tab === 5 && (
          <div>
            <div style={{ ...s.label, marginBottom: 4 }}>Delivery Tracker</div>
            <p style={{ color: C.text, fontSize: 14, marginBottom: 20 }}>Every drop logged with photo proof and GPS timestamp. Platform disputes resolved automatically — your record is always there.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DELIVERIES.map(d => (
                <div key={d.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 900, fontSize: 13, color: C.blue }}>{d.id}</span>
                      <span style={{ fontSize: 11, color: C.dim }}>{d.platform}</span>
                      <span style={{ fontSize: 12, color: STATUS_C[d.status], fontWeight: 800 }}>● {d.status}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{d.customer}</div>
                    <div style={{ fontSize: 11, color: C.dim }}>{d.address}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {d.tip && <span style={{ fontSize: 12, color: C.gold, fontWeight: 800 }}>+{d.tip} tip</span>}
                    {d.time !== '—' && <span style={{ fontSize: 11, color: C.dim }}>✓ {d.time}</span>}
                    {d.photo && <span style={{ fontSize: 11, color: C.green }}>📷</span>}
                    {d.status === 'In Progress' && (
                      <button style={{ background: C.blue, color: '#000', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 900, fontSize: 12, cursor: 'pointer' }}>📷 Confirm</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SAFETY ── */}
        {tab === 6 && (
          <div>
            <div style={{ ...s.label, marginBottom: 4 }}>Route Safety Intelligence</div>
            <p style={{ color: C.text, fontSize: 14, marginBottom: 20 }}>Real-time zone ratings from the TruckWithEase courier network. Updated continuously — always know before you ride.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {SAFETY_ZONES.map(z => (
                <div key={z.zone} style={{ ...s.card, borderLeft: `4px solid ${LEVEL_C[z.level] || C.dim}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                    <div style={{ fontWeight: 900, fontSize: 14 }}>{z.zone}</div>
                    <div style={{ background: `${LEVEL_C[z.level] || C.dim}22`, border: `1px solid ${LEVEL_C[z.level] || C.dim}`, borderRadius: 6, padding: '2px 10px', fontSize: 11, color: LEVEL_C[z.level] || C.dim, fontWeight: 800 }}>{z.level}</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.dim, marginBottom: 6 }}>Safety score: <strong style={{ color: LEVEL_C[z.level] || C.dim }}>{z.score}/100</strong></div>
                  <div style={{ fontSize: 12, color: C.text }}>💡 {z.tip}</div>
                </div>
              ))}
            </div>
            <div style={{ ...s.card, marginTop: 16, borderColor: C.red }}>
              <div style={{ fontWeight: 900, fontSize: 14, color: C.red, marginBottom: 8 }}>🆘 Rider SOS — Emergency Contact</div>
              <div style={{ fontSize: 13, color: C.text, marginBottom: 12 }}>One tap sends your GPS location, bike type, and timestamp to emergency services and your emergency contact simultaneously.</div>
              <button style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 900, fontSize: 15, cursor: 'pointer', width: '100%' }}>🆘 SEND RIDER SOS</button>
            </div>
          </div>
        )}

        {/* ── BATTERY & GEAR ── */}
        {tab === 7 && (
          <div>
            <div style={{ ...s.label, marginBottom: 4 }}>Battery & Gear Tracker</div>
            <p style={{ color: C.text, fontSize: 14, marginBottom: 20 }}>Keep your gear shift-ready. Battery, lights, helmet, locks — everything tracked so you never get caught short on a job.</p>

            <div style={{ ...s.card, borderColor: C.blue, marginBottom: 20 }}>
              <div style={{ ...s.label }}>E-Bike Battery — Current Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginTop: 8 }}>
                <div>
                  <div style={{ fontSize: 42, fontWeight: 900, color: C.green }}>67%</div>
                  <div style={{ fontSize: 12, color: C.dim }}>18 miles remaining</div>
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ height: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ width: '67%', height: '100%', background: `linear-gradient(90deg, ${C.green}, ${C.blue})`, borderRadius: 6 }} />
                  </div>
                  <div style={{ fontSize: 11, color: C.dim }}>Battery health: 89% · 340 charge cycles</div>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, color: C.dim, marginBottom: 8, fontWeight: 700 }}>E-Bike Battery Best Practices:</div>
                {BATTERY_CHECKLIST.map(b => (
                  <div key={b.item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 14, color: b.done ? C.green : C.dim, flexShrink: 0 }}>{b.done ? '✓' : '○'}</span>
                    <span style={{ fontSize: 12, color: b.done ? C.text : C.dim }}>{b.item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...s.label }}>Gear Inventory</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {GEAR.map(g => (
                <div key={g.item} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{g.item}</div>
                    <div style={{ fontSize: 11, color: C.dim }}>{g.brand}</div>
                    {g.last !== '—' && <div style={{ fontSize: 10, color: C.dim }}>Last checked: {g.last}</div>}
                  </div>
                  <div style={{ background: 'rgba(0,229,255,0.1)', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 10px', fontSize: 11, color: C.blue, fontWeight: 800 }}>{g.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CHARGING ── */}
        {tab === 8 && (
          <div>
            <div style={{ ...s.label, marginBottom: 4 }}>E-Bike Charging Stations Near You</div>
            <p style={{ color: C.text, fontSize: 14, marginBottom: 20 }}>Find free and paid e-bike charging docks, bike-share stations, and powered bike corrals across every city — all on a live map.</p>
            <div style={{ ...s.card, borderColor: C.blue, marginBottom: 20, textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚡🚲</div>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Charging Station Finder</div>
              <div style={{ fontSize: 13, color: C.dim, marginBottom: 20 }}>Live map of e-bike charging docks, Divvy stations, free city corrals, and solar-powered charging hubs near you.</div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => window.location.href = '/charging-stations'} style={{ background: C.blue, color: '#000', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}>⚡ Open Charging Map</button>
                <button onClick={() => window.location.href = '/charging-stations'} style={{ background: 'rgba(0,214,143,0.1)', border: `1px solid ${C.green}`, borderRadius: 10, padding: '12px 24px', color: C.green, fontWeight: 900, fontSize: 14, cursor: 'pointer' }}>🚗 EV Car Charging Too</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
              {[
                { icon: '🏙️', name: 'Divvy E-Bike Docks', city: 'Chicago', free: true, count: '600+ stations' },
                { icon: '🌞', name: 'Solar Charging Corral', city: 'Chicago / Austin', free: true, count: '12 locations' },
                { icon: '🏬', name: 'REI Charging Hubs', city: 'Nationwide', free: true, count: '178 stores' },
                { icon: '🔌', name: 'Whole Foods Bike Ports', city: 'Nationwide', free: true, count: '500+ stores' },
              ].map(loc => (
                <div key={loc.name} style={{ ...s.card, textAlign: 'center', padding: 16 }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{loc.icon}</div>
                  <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 4 }}>{loc.name}</div>
                  <div style={{ fontSize: 11, color: C.dim, marginBottom: 6 }}>{loc.city} · {loc.count}</div>
                  {loc.free && <div style={{ fontSize: 11, color: C.green, fontWeight: 800 }}>Free Charging</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RIG BUCKS ── */}
        {tab === 9 && (
          <div>
            <div style={{ ...s.label, marginBottom: 4 }}>Rig Bucks — Courier Edition</div>
            <p style={{ color: C.text, fontSize: 14, marginBottom: 24 }}>Earn points on every delivery, every safe ride, every perfect rating. 100 Rig Bucks = $1 toward gear, repairs, or platform fees.</p>
            <div style={{ ...s.card, borderColor: C.gold, marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: C.gold, letterSpacing: 3, fontWeight: 800, marginBottom: 6 }}>YOUR BALANCE</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: C.gold }}>3,140</div>
              <div style={{ fontSize: 14, color: C.dim }}>Rig Bucks = <strong style={{ color: C.gold }}>$31.40 value</strong></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
              {[
                { icon: '📦', action: 'Per Delivery Completed', pts: '+5 RB' },
                { icon: '⭐', action: '5-Star Customer Rating', pts: '+25 RB' },
                { icon: '🛡️', action: 'Zero-Incident Shift', pts: '+50 RB' },
                { icon: '📷', action: 'Photo Proof Submitted', pts: '+3 RB' },
                { icon: '🔋', action: 'Full Shift — Zero Battery Issues', pts: '+30 RB' },
                { icon: '🌧️', action: 'Rainy Day Shift Completed', pts: '+40 RB' },
                { icon: '📊', action: 'Mileage Log Submitted', pts: '+10 RB' },
                { icon: '👥', action: 'Courier Referral', pts: '+500 RB' },
              ].map(e => (
                <div key={e.action} style={{ ...s.card }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{e.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{e.action}</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: C.gold }}>{e.pts}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
