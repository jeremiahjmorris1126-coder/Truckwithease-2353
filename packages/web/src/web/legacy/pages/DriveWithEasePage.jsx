import { useState, useEffect } from 'react';

const C = {
  green: '#00D68F', dark: '#060A10', card: 'rgba(0,214,143,0.07)',
  border: 'rgba(0,214,143,0.18)', text: 'rgba(255,255,255,0.85)',
  dim: 'rgba(255,255,255,0.42)', glow: 'rgba(0,214,143,0.22)',
  amber: '#F5A623', red: '#FF3D57', blue: '#00E5FF',
  surface: 'rgba(255,255,255,0.05)', gold: '#c9a84c',
};

const TABS = [
  { icon: '🏠', label: 'Dashboard' },
  { icon: '🗺️', label: 'Route AI' },
  { icon: '💵', label: 'Earnings' },
  { icon: '🧾', label: 'Tax & Miles' },
  { icon: '🚐', label: 'Vehicle' },
  { icon: '📦', label: 'Packages' },
  { icon: '🛡️', label: 'Safety' },
  { icon: '⛽', label: 'Fuel & Rest' },
  { icon: '⚡', label: 'EV Charging' },
  { icon: '🏆', label: 'Rig Bucks' },
];

const PLATFORMS = [
  { name: 'Amazon Flex', icon: '📦', color: '#FF9900', status: 'Active', earn: '$218', shifts: 4, rating: 4.8, available: true },
  { name: 'UPS My Choice', icon: '🟤', color: '#351C15', status: 'Active', earn: '$196', shifts: 3, rating: 4.9, available: true },
  { name: 'FedEx Ground', icon: '🟣', color: '#4D148C', status: 'Active', earn: '$204', shifts: 3, rating: 4.7, available: true },
  { name: 'DoorDash', icon: '🍔', color: '#FF3008', status: 'Active', earn: '$94', shifts: 8, rating: 4.6, available: true },
  { name: 'Uber Eats', icon: '🛵', color: '#06C167', status: 'Active', earn: '$87', shifts: 6, rating: 4.7, available: true },
  { name: 'Instacart', icon: '🛒', color: '#43B02A', status: 'Available', earn: '$0', shifts: 0, rating: null, available: false },
  { name: 'GoShare', icon: '🛻', color: '#1565C0', status: 'Available', earn: '$0', shifts: 0, rating: null, available: false },
  { name: 'Dolly', icon: '🪑', color: '#E53935', status: 'Available', earn: '$0', shifts: 0, rating: null, available: false },
];

const ROUTES = [
  { name: 'Amazon DSP — Chicago North Loop', platform: 'Amazon', stops: 182, distance: '94 mi', duration: '6.4 hrs', fuel: '$18.20', earn: '$218', net: '$199.80', saved: '34 min', type: 'Last Mile', state: 'IL' },
  { name: 'FedEx Ground — I-90 Corridor', platform: 'FedEx', stops: 14, distance: '312 mi', duration: '5.8 hrs', fuel: '$61.40', earn: '$204', net: '$142.60', saved: '51 min', type: 'Cross-State', state: 'IL→OH' },
  { name: 'UPS City — Midtown NYC', platform: 'UPS', stops: 238, distance: '29 mi', duration: '7.2 hrs', fuel: '$9.80', earn: '$196', net: '$186.20', saved: '28 min', type: 'Urban', state: 'NY' },
  { name: 'DoorDash Catering — SF Financial', platform: 'DoorDash', stops: 6, distance: '11 mi', duration: '2.1 hrs', fuel: '$3.80', earn: '$94', net: '$90.20', saved: '18 min', type: 'Catering', state: 'CA' },
  { name: 'Instacart Batch — LA Westside', platform: 'Instacart', stops: 8, distance: '22 mi', duration: '1.9 hrs', fuel: '$6.40', earn: '$94', net: '$87.60', saved: '22 min', type: 'Grocery', state: 'CA' },
  { name: 'GoShare Furniture — Dallas Loop', platform: 'GoShare', stops: 3, distance: '41 mi', duration: '3.2 hrs', fuel: '$12.20', earn: '$145', net: '$132.80', saved: '14 min', type: 'Heavy Haul', state: 'TX' },
];

const VEHICLES = [
  { name: 'Sprinter Van', emoji: '🚐', platforms: ['Amazon', 'UPS', 'FedEx'], capacity: '3,500 lbs', earn: '$182–$220/day', best: 'Cross-state routes, high-volume stops' },
  { name: 'Cargo Van', emoji: '🚌', platforms: ['Amazon', 'Instacart', 'Grocery'], capacity: '2,200 lbs', earn: '$140–$175/day', best: 'Last-mile, pharmacy, grocery delivery' },
  { name: 'Box Truck', emoji: '🚛', platforms: ['GoShare', 'Dolly', 'B2B'], capacity: '10,000 lbs', earn: '$200–$280/day', best: 'Furniture, appliances, regional freight' },
  { name: 'Pickup Truck', emoji: '🛻', platforms: ['TaskRabbit', 'GoShare', 'Dolly'], capacity: '1,800 lbs', earn: '$140–$190/day', best: 'Heavy items, construction deliveries' },
  { name: 'Sedan / SUV', emoji: '🚗', platforms: ['DoorDash', 'Uber Eats', 'Lyft'], capacity: '400 lbs', earn: '$90–$130/day', best: 'Food delivery, rideshare, urban courier' },
  { name: 'Refrigerated Van', emoji: '❄️', platforms: ['Meal Kits', 'Pharmacy', 'Cold Chain'], capacity: '2,400 lbs', earn: '$175–$220/day', best: 'Temperature-sensitive, pharmaceutical' },
];

const MAINTENANCE = [
  { item: 'Engine Oil', status: 'DUE SOON', miles: 340, color: C.amber },
  { item: 'Tire Pressure', status: 'OK', miles: 8200, color: C.green },
  { item: 'Brake Pads', status: 'OK', miles: 14600, color: C.green },
  { item: 'Air Filter', status: 'OK', miles: 6100, color: C.green },
  { item: 'Cargo Door Latch', status: 'CHECK', miles: null, color: C.red },
  { item: 'AC / Heat', status: 'OK', miles: null, color: C.green },
];

const FUEL = [
  { name: 'Pilot Flying J — I-90 Exit 43', city: 'Chicago, IL', gas: '$3.41', diesel: '$3.78', parking: '240 spots', amenities: ['Showers', 'WiFi', 'Restaurant', 'Laundry'], rating: 4.7, bucks: '+25 Rig Bucks' },
  { name: "Love's Travel Stop — I-78", city: 'Newark, NJ', gas: '$3.55', diesel: '$3.91', parking: '180 spots', amenities: ['WiFi', 'Subway', 'Laundry', 'ATM'], rating: 4.5, bucks: '+25 Rig Bucks' },
  { name: 'Sheetz — I-376 PA', city: 'Pittsburgh, PA', gas: '$3.38', diesel: '$3.74', parking: '40 spots', amenities: ['Food', 'WiFi', 'ATM', 'EV Charge'], rating: 4.8, bucks: '+15 Rig Bucks' },
  { name: "TA Travel Center — I-10", city: 'Los Angeles, CA', gas: '$4.12', diesel: '$4.48', parking: '320 spots', amenities: ['Showers', 'Laundry', 'Restaurant', 'Repair'], rating: 4.6, bucks: '+25 Rig Bucks' },
  { name: "Buc-ee's — I-35", city: 'Austin, TX', gas: '$3.29', diesel: '$3.66', parking: '120 spots', amenities: ['Food Hall', 'Restrooms', 'WiFi', 'Merch'], rating: 4.9, bucks: '+15 Rig Bucks' },
];

const SAFETY_ZONES = [
  { zone: 'I-90 Chicago Night Corridor', level: 'SAFE', score: 88, tip: 'Well-lit, frequent patrol. Exit 33 rest area staffed 24/7' },
  { zone: 'South Side Chicago — Last Mile', level: 'CAUTION', score: 69, tip: 'Daytime delivery recommended. Notify customers before arrival.' },
  { zone: 'NYC Midtown Loading Zones', level: 'CAUTION', score: 74, tip: 'Meter enforcement 8am–7pm. Use intelligence routing to pre-clear loading windows.' },
  { zone: 'I-10 LA Overnight', level: 'SAFE', score: 91, tip: 'CHP-patrolled. Rest areas mile 22 and 47 have 24/7 cameras.' },
  { zone: 'Tenderloin SF — Deliveries', level: 'WARNING', score: 52, tip: 'Two-person delivery after 8pm. Photo-proof required all drops.' },
];

const LEVEL_C = { SAFE: C.green, CAUTION: C.amber, WARNING: C.red };

const FEED = [
  { icon: '🗺️', msg: 'Route recalculated — 34 min saved via I-290 bypass', color: C.green },
  { icon: '💵', msg: 'Shift earnings: $218.40 — $2.32/mile avg today', color: C.amber },
  { icon: '⛽', msg: "Pilot Flying J Exit 43: $3.41/gal — 2.1 miles ahead", color: C.blue },
  { icon: '🧾', msg: 'Tax miles logged: 2,847 this month — est. $1,562 deduction', color: C.green },
  { icon: '📦', msg: '182 stops confirmed — photo proof auto-enabled', color: C.green },
  { icon: '🔧', msg: 'Oil change due in 340 miles — 3 shops on your route', color: C.amber },
  { icon: '🛡️', msg: 'IL weight limit: 80,000 lbs — your load is compliant ✓', color: C.green },
  { icon: '🌦️', msg: 'Storm in 45 min — dry alternate route queued', color: '#FF6B35' },
];

const TAX_ITEMS = [
  { label: 'Miles Logged This Month', value: '2,847 mi', detail: 'Est. $1,562 deduction at IRS rate' },
  { label: 'Miles Logged This Year', value: '31,204 mi', detail: 'Est. $17,131 annual deduction' },
  { label: 'Fuel Receipts Captured', value: '64 receipts', detail: '$1,842 in documented fuel expenses' },
  { label: 'Platform Fees Paid', value: '$218.40', detail: 'Amazon, FedEx, DoorDash — all deductible' },
  { label: 'Phone / Data (Business %)', value: '78%', detail: 'Est. $936/year deduction' },
  { label: 'Vehicle Depreciation', value: 'Section 179', detail: 'Full vehicle cost may qualify — ask your CPA' },
  { label: 'Parking & Tolls', value: '$342', detail: 'All stops documented with GPS timestamp' },
  { label: 'IRS Report Ready', value: 'Yes', detail: 'Export PDF or CSV anytime — ready for your accountant' },
];

const PACKAGES = [
  { id: 'AMZ-44821', customer: 'J. Patterson', address: '2847 N Clark St, Chicago', status: 'Delivered', time: '9:14am', photo: true, sig: false },
  { id: 'AMZ-44822', customer: 'M. Torres', address: '1204 W Belmont Ave, Chicago', status: 'Delivered', time: '9:31am', photo: true, sig: false },
  { id: 'AMZ-44823', customer: 'R. Johnson', address: '548 W Wrightwood, Chicago', status: 'In Progress', time: '—', photo: false, sig: false },
  { id: 'AMZ-44824', customer: 'S. Kim', address: '3311 N Halsted, Chicago', status: 'Pending', time: '—', photo: false, sig: false },
  { id: 'AMZ-44825', customer: 'A. Williams', address: '2100 N Sheffield, Chicago', status: 'Pending', time: '—', photo: false, sig: false },
];

const STATUS_C = { Delivered: C.green, 'In Progress': C.amber, Pending: C.dim };

export default function DriveWithEasePage() {
  const [tab, setTab] = useState(0);
  const [feedIdx, setFeedIdx] = useState(0);
  const [activePlatform, setActivePlatform] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [activeVehicle, setActiveVehicle] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setFeedIdx(i => (i + 1) % FEED.length), 2800);
    return () => clearInterval(t);
  }, []);

  const s = {
    page: { background: C.dark, minHeight: '100vh', color: '#fff', fontFamily: "'Oswald', 'Bebas Neue', sans-serif" },
    header: { background: 'linear-gradient(135deg, rgba(0,214,143,0.12) 0%, rgba(6,10,16,0.98) 60%)', borderBottom: `1px solid ${C.border}`, padding: '18px 24px' },
    tabBar: { display: 'flex', gap: 4, padding: '12px 20px', borderBottom: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.3)', overflowX: 'auto', flexWrap: 'nowrap' },
    tab: (a) => ({ padding: '7px 14px', borderRadius: 8, border: `1px solid ${a ? C.green : 'transparent'}`, background: a ? 'rgba(0,214,143,0.12)' : 'transparent', color: a ? C.green : C.dim, cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5 }),
    card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 },
    label: { fontSize: 10, letterSpacing: 4, color: C.green, textTransform: 'uppercase', fontWeight: 800, marginBottom: 6 },
    wrap: { padding: '20px 20px 40px' },
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: C.green, fontWeight: 800, marginBottom: 4 }}>DRIVEWITEASE — NON-CDL DELIVERY PLATFORM</div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 1 }}>🚐 Drive<span style={{ color: C.green }}>WithEase</span></div>
            <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>Sprinters · Cargo Vans · Box Trucks · Pickups · Sedans — Every gig, every platform, one dashboard</div>
          </div>
          {/* Live feed ticker */}
          <div style={{ background: 'rgba(0,214,143,0.08)', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 16px', maxWidth: 340, flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 10, color: C.green, letterSpacing: 3, marginBottom: 4, fontWeight: 800 }}>LIVE FEED</div>
            <div style={{ fontSize: 13, color: FEED[feedIdx].color, fontWeight: 700, transition: 'all 0.4s' }}>{FEED[feedIdx].icon} {FEED[feedIdx].msg}</div>
          </div>
        </div>

        {/* KPI Strip */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { l: "Today's Earnings", v: '$218.40', c: C.green },
            { l: 'Stops Completed', v: '181 / 182', c: C.amber },
            { l: 'Miles Today', v: '94.2 mi', c: C.blue },
            { l: 'Net After Fuel', v: '$199.80', c: C.green },
            { l: 'Weekly Total', v: '$1,042', c: C.gold },
            { l: 'Active Platforms', v: '5', c: C.dim },
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
                <div key={p.name} onClick={() => setActivePlatform(activePlatform?.name === p.name ? null : p)} style={{ ...s.card, cursor: 'pointer', borderColor: activePlatform?.name === p.name ? C.green : C.border, transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontSize: 24 }}>{p.icon}</div>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: 15 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: p.available ? C.green : C.dim }}>{p.status}</div>
                      </div>
                    </div>
                    {p.available && <div style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{p.earn}</div>}
                  </div>
                  {p.available ? (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ fontSize: 11, color: C.dim }}>{p.shifts} shifts this week</div>
                      <div style={{ fontSize: 11, color: C.amber }}>★ {p.rating}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: C.dim }}>Tap to connect this platform</div>
                  )}
                </div>
              ))}
            </div>

            {activePlatform && (
              <div style={{ ...s.card, marginTop: 16, borderColor: C.green }}>
                <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>{activePlatform.icon} {activePlatform.name} — Quick Actions</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {['View Today\'s Route', 'Log Earnings', 'Upload Receipt', 'Report Issue', 'View History'].map(a => (
                    <button key={a} style={{ background: 'rgba(0,214,143,0.1)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 14px', color: C.green, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{a}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Today's progress */}
            <div style={{ ...s.card, marginTop: 20 }}>
              <div style={{ ...s.label }}>Today's Shift Progress</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: C.text }}>181 of 182 stops completed</span>
                <span style={{ fontSize: 13, color: C.green, fontWeight: 900 }}>99.4%</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '99.4%', height: '100%', background: `linear-gradient(90deg, ${C.green}, ${C.blue})`, borderRadius: 4 }} />
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                {[['On Time Delivery', '98.9%', C.green], ['Customer Rating', '4.8 ★', C.amber], ['Incidents', '0', C.green], ['Photo Proof', '181/181', C.blue]].map(([l, v, c]) => (
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
            <div style={{ ...s.label, marginBottom: 4 }}>Intelligence Route Intelligence</div>
            <p style={{ color: C.text, fontSize: 14, marginBottom: 20 }}>Every route profit-analyzed before you leave. Net earnings after fuel shown on every card — stop sequencing AI saves an average of 31 minutes per shift.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ROUTES.map(r => (
                <div key={r.name} onClick={() => setActiveRoute(activeRoute?.name === r.name ? null : r)} style={{ ...s.card, cursor: 'pointer', borderColor: activeRoute?.name === r.name ? C.green : C.border, transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 4 }}>{r.name}</div>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: C.dim }}>📍 {r.state}</span>
                        <span style={{ fontSize: 11, color: C.dim }}>🚏 {r.stops} stops</span>
                        <span style={{ fontSize: 11, color: C.dim }}>📏 {r.distance}</span>
                        <span style={{ fontSize: 11, color: C.dim }}>⏱ {r.duration}</span>
                        <span style={{ fontSize: 11, color: C.green }}>⚡ {r.saved} saved</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: C.green }}>{r.net}</div>
                      <div style={{ fontSize: 10, color: C.dim }}>net after fuel</div>
                    </div>
                  </div>
                  {activeRoute?.name === r.name && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                        {[['Gross Pay', r.earn], ['Fuel Cost', r.fuel], ['Net Profit', r.net]].map(([l, v]) => (
                          <div key={l} style={{ background: 'rgba(0,214,143,0.08)', borderRadius: 8, padding: '8px 14px', flex: 1, minWidth: 90 }}>
                            <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2 }}>{l.toUpperCase()}</div>
                            <div style={{ fontSize: 18, fontWeight: 900, color: C.green }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button style={{ background: C.green, color: '#000', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 900, fontSize: 13, cursor: 'pointer' }}>🗺️ Start Route</button>
                        <button style={{ background: 'rgba(0,229,255,0.1)', border: `1px solid ${C.blue}`, borderRadius: 8, padding: '8px 16px', color: C.blue, fontWeight: 900, fontSize: 13, cursor: 'pointer' }}>📊 Analyze Profitability</button>
                        <button style={{ background: 'rgba(245,166,35,0.1)', border: `1px solid ${C.amber}`, borderRadius: 8, padding: '8px 16px', color: C.amber, fontWeight: 900, fontSize: 13, cursor: 'pointer' }}>⛽ Find Fuel on Route</button>
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
            <p style={{ color: C.text, fontSize: 14, marginBottom: 20 }}>Every dollar tracked across every gig platform. Real-time net-after-expenses shown on every shift — no spreadsheets, no guessing.</p>

            {/* Weekly summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
              {[
                { l: 'This Week', v: '$1,042', c: C.green },
                { l: 'This Month', v: '$4,218', c: C.green },
                { l: 'Year to Date', v: '$38,940', c: C.amber },
                { l: 'Fuel Costs YTD', v: '$4,112', c: C.red },
                { l: 'Net YTD', v: '$34,828', c: C.green },
                { l: 'Avg Per Mile', v: '$2.18', c: C.blue },
              ].map(k => (
                <div key={k.l} style={{ ...s.card }}>
                  <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 4 }}>{k.l.toUpperCase()}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: k.c }}>{k.v}</div>
                </div>
              ))}
            </div>

            {/* Platform breakdown */}
            <div style={{ ...s.label }}>Platform Breakdown — This Week</div>
            <div style={{ ...s.card, marginTop: 12 }}>
              {PLATFORMS.filter(p => p.available).map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{p.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: C.dim }}>{p.shifts} shifts</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: C.green, textAlign: 'right' }}>{p.earn}</div>
                    <div style={{ fontSize: 10, color: C.dim, textAlign: 'right' }}>this week</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ ...s.card, marginTop: 16, borderColor: C.amber }}>
              <div style={{ fontSize: 13, color: C.amber, fontWeight: 900, marginBottom: 8 }}>💡 Earnings Tip</div>
              <div style={{ fontSize: 13, color: C.text }}>Your highest net-per-mile platform this week is <strong style={{ color: C.green }}>Amazon Flex at $2.32/mile</strong>. Shifting one DoorDash shift to an extra Amazon route could add ~$80 to your weekly total.</div>
            </div>
          </div>
        )}

        {/* ── TAX & MILES ── */}
        {tab === 3 && (
          <div>
            <div style={{ ...s.label, marginBottom: 4 }}>Tax Intelligence & Mileage Log</div>
            <p style={{ color: C.text, fontSize: 14, marginBottom: 20 }}>Every mile tracked by GPS automatically. Every receipt captured. Your IRS-ready report is always one tap away — worth thousands in deductions every year.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TAX_ITEMS.map(t2 => (
                <div key={t2.label} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{t2.label}</div>
                    <div style={{ fontSize: 12, color: C.dim, marginTop: 3 }}>{t2.detail}</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C.green }}>{t2.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              <button style={{ background: C.green, color: '#000', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 900, fontSize: 14, cursor: 'pointer' }}>📄 Export IRS Report (PDF)</button>
              <button style={{ background: 'rgba(0,229,255,0.1)', border: `1px solid ${C.blue}`, borderRadius: 10, padding: '12px 24px', color: C.blue, fontWeight: 900, fontSize: 14, cursor: 'pointer' }}>📊 Export Mileage Log (CSV)</button>
            </div>
          </div>
        )}

        {/* ── VEHICLE ── */}
        {tab === 4 && (
          <div>
            <div style={{ ...s.label, marginBottom: 4 }}>Vehicle & Maintenance Tracker</div>
            <p style={{ color: C.text, fontSize: 14, marginBottom: 20 }}>Track every service alert, every mile, every cost. Never miss a maintenance item that sidelines your shift.</p>

            <div style={{ ...s.label }}>Your Fleet</div>
            <div style={s.grid2}>
              {VEHICLES.map(v => (
                <div key={v.name} onClick={() => setActiveVehicle(activeVehicle?.name === v.name ? null : v)} style={{ ...s.card, cursor: 'pointer', borderColor: activeVehicle?.name === v.name ? C.green : C.border }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{v.emoji}</div>
                  <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 4 }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: C.dim, marginBottom: 8 }}>{v.best}</div>
                  <div style={{ fontSize: 12, color: C.green, fontWeight: 800 }}>{v.earn}</div>
                  {activeVehicle?.name === v.name && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 11, color: C.dim, marginBottom: 6 }}>Best platforms:</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {v.platforms.map(pl => <span key={pl} style={{ background: 'rgba(0,214,143,0.1)', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px', fontSize: 11, color: C.green }}>{pl}</span>)}
                      </div>
                      <div style={{ marginTop: 8, fontSize: 11, color: C.dim }}>Max capacity: {v.capacity}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ ...s.label, marginTop: 24 }}>Maintenance Alerts — Current Vehicle</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {MAINTENANCE.map(m => (
                <div key={m.item} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{m.item}</div>
                  <div style={{ display: 'flex', align: 'center', gap: 12 }}>
                    {m.miles && <div style={{ fontSize: 11, color: C.dim }}>Due in {m.miles} mi</div>}
                    <div style={{ background: `${m.color}22`, border: `1px solid ${m.color}`, borderRadius: 6, padding: '3px 10px', fontSize: 11, color: m.color, fontWeight: 800 }}>{m.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PACKAGES ── */}
        {tab === 5 && (
          <div>
            <div style={{ ...s.label, marginBottom: 4 }}>Package & Stop Tracker</div>
            <p style={{ color: C.text, fontSize: 14, marginBottom: 20 }}>Every stop logged with photo proof and GPS timestamp. Customer disputes handled automatically — no calls needed.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PACKAGES.map(p => (
                <div key={p.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ display: 'flex', align: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 900, fontSize: 13, color: C.blue }}>{p.id}</span>
                      <span style={{ fontSize: 12, color: STATUS_C[p.status], fontWeight: 800 }}>● {p.status}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{p.customer}</div>
                    <div style={{ fontSize: 11, color: C.dim }}>{p.address}</div>
                  </div>
                  <div style={{ display: 'flex', align: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {p.time !== '—' && <span style={{ fontSize: 11, color: C.dim }}>✓ {p.time}</span>}
                    {p.photo && <span style={{ fontSize: 11, color: C.green }}>📷 Photo</span>}
                    {p.status === 'In Progress' && (
                      <button style={{ background: C.green, color: '#000', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 900, fontSize: 12, cursor: 'pointer' }}>📷 Photo Confirm</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ ...s.card, marginTop: 16, borderColor: C.green }}>
              <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 8 }}>📸 Photo Proof — How It Works</div>
              <div style={{ fontSize: 13, color: C.text }}>Every delivered package is photographed with GPS location and timestamp embedded. If a customer claims non-delivery, your proof is automatically attached to the dispute — Amazon, UPS, FedEx, and DoorDash all accept this format.</div>
            </div>
          </div>
        )}

        {/* ── SAFETY ── */}
        {tab === 6 && (
          <div>
            <div style={{ ...s.label, marginBottom: 4 }}>Safety Intelligence</div>
            <p style={{ color: C.text, fontSize: 14, marginBottom: 20 }}>Real-time zone ratings, incident counts, and safety tips updated continuously from the TruckWithEase driver network.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {SAFETY_ZONES.map(z => (
                <div key={z.zone} style={{ ...s.card, borderLeft: `4px solid ${LEVEL_C[z.level] || C.dim}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                    <div style={{ fontWeight: 900, fontSize: 14 }}>{z.zone}</div>
                    <div style={{ background: `${LEVEL_C[z.level] || C.dim}22`, border: `1px solid ${LEVEL_C[z.level] || C.dim}`, borderRadius: 6, padding: '2px 10px', fontSize: 11, color: LEVEL_C[z.level] || C.dim, fontWeight: 800 }}>{z.level}</div>
                  </div>
                  <div style={{ display: 'flex', align: 'center', gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: C.dim }}>Safety score: <strong style={{ color: LEVEL_C[z.level] || C.dim }}>{z.score}/100</strong></span>
                  </div>
                  <div style={{ fontSize: 12, color: C.text }}>💡 {z.tip}</div>
                </div>
              ))}
            </div>
            <div style={{ ...s.card, marginTop: 16, borderColor: C.red }}>
              <div style={{ fontWeight: 900, fontSize: 14, color: C.red, marginBottom: 8 }}>🆘 SOS — Emergency Contact</div>
              <div style={{ fontSize: 13, color: C.text, marginBottom: 12 }}>One tap sends your GPS location, vehicle info, and timestamp to emergency services and your dispatcher simultaneously.</div>
              <button style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 900, fontSize: 15, cursor: 'pointer', width: '100%' }}>🆘 SEND SOS ALERT</button>
            </div>
          </div>
        )}

        {/* ── FUEL & REST ── */}
        {tab === 7 && (
          <div>
            <div style={{ ...s.label, marginBottom: 4 }}>Fuel & Rest Intelligence</div>
            <p style={{ color: C.text, fontSize: 14, marginBottom: 20 }}>Live fuel prices updated every 15 minutes. Earn Rig Bucks every time you fill up at a partner location.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FUEL.map(f => (
                <div key={f.name} style={s.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 3 }}>{f.name}</div>
                      <div style={{ fontSize: 12, color: C.dim }}>{f.city}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 900, color: C.amber }}>⛽ Gas {f.gas}</div>
                      <div style={{ fontSize: 12, color: C.dim }}>Diesel {f.diesel}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    {f.amenities.map(a => <span key={a} style={{ background: 'rgba(0,214,143,0.08)', border: `1px solid ${C.border}`, borderRadius: 6, padding: '2px 8px', fontSize: 10, color: C.dim }}>{a}</span>)}
                  </div>
                  <div style={{ display: 'flex', justify: 'space-between', align: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 11, color: C.dim }}>🅿️ {f.parking} · ★ {f.rating}</span>
                    <span style={{ fontSize: 11, color: C.gold, fontWeight: 800 }}>🏆 {f.bucks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EV CHARGING ── */}
        {tab === 8 && (
          <div>
            <div style={{ ...s.label, marginBottom: 4 }}>EV & E-Bike Charging Stations</div>
            <p style={{ color: C.text, fontSize: 14, marginBottom: 20 }}>Find DC fast chargers, Level 2 stations, and e-bike charging docks near any stop on your route — filterable by connector type, network, and availability right now.</p>
            <div style={{ ...s.card, borderColor: '#00D68F', marginBottom: 20, textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚡🚗</div>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Live Charging Map</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', marginBottom: 20 }}>Tesla Superchargers, ChargePoint, Electrify America, EVgo, and Blink — all networks, real-time availability, connector type, and wait time — one tap to navigate.</div>
              <button onClick={() => window.location.href = '/charging-stations'} style={{ background: '#00D68F', color: '#000', border: 'none', borderRadius: 10, padding: '14px 32px', fontWeight: 900, fontSize: 16, cursor: 'pointer' }}>⚡ Open Charging Station Finder</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
              {[
                { icon: '🔴', name: 'Tesla Supercharger', speed: 'Up to 250kW', note: 'Fastest — 15 min to 80%', color: '#E31937' },
                { icon: '🔵', name: 'ChargePoint', speed: 'Level 2 + DC Fast', note: 'Largest US network', color: '#00A8E0' },
                { icon: '🔌', name: 'Electrify America', speed: 'Up to 350kW', note: 'Ultra-fast highway stops', color: '#0068B5' },
                { icon: '🟢', name: 'EVgo', speed: 'Up to 100kW DC Fast', note: 'Urban focus, retail locations', color: '#00B140' },
                { icon: '💚', name: 'Blink', speed: 'Level 2 (6.2kW)', note: 'Affordable — good for long stops', color: '#4B8B3B' },
                { icon: '🚲', name: 'E-Bike Charging', speed: '110V / 3–6 hr charge', note: 'Free at REI, Whole Foods, city docks', color: '#00E5FF' },
              ].map(n => (
                <div key={n.name} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${n.color}44`, borderRadius: 12, padding: 14, borderLeft: `4px solid ${n.color}` }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{n.icon}</div>
                  <div style={{ fontWeight: 900, fontSize: 13, color: n.color, marginBottom: 3 }}>{n.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 3 }}>{n.speed}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.42)' }}>{n.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RIG BUCKS ── */}
        {tab === 9 && (
          <div>
            <div style={{ ...s.label, marginBottom: 4 }}>Rig Bucks — Delivery Edition</div>
            <p style={{ color: C.text, fontSize: 14, marginBottom: 24 }}>Earn points on every delivery, every fill-up, every safe shift. 100 Rig Bucks = $1 toward fuel, gear, or platform fees.</p>
            <div style={{ ...s.card, borderColor: C.gold, marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: C.gold, letterSpacing: 3, fontWeight: 800, marginBottom: 6 }}>YOUR BALANCE</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: C.gold }}>4,820</div>
              <div style={{ fontSize: 14, color: C.dim }}>Rig Bucks = <strong style={{ color: C.gold }}>$48.20 value</strong></div>
            </div>
            <div style={s.grid2}>
              {[
                { icon: '📦', action: 'Per Delivery Completed', pts: '+5 RB' },
                { icon: '⭐', action: '5-Star Customer Rating', pts: '+25 RB' },
                { icon: '⛽', action: 'Fill-Up at Partner Station', pts: '+25 RB' },
                { icon: '📷', action: 'Photo Proof Submitted', pts: '+3 RB' },
                { icon: '🛡️', action: 'Zero-Incident Shift', pts: '+50 RB' },
                { icon: '🚗', action: 'Weekly Goal Hit', pts: '+100 RB' },
                { icon: '📊', action: 'Mileage Log Submitted', pts: '+10 RB' },
                { icon: '👥', action: 'Driver Referral', pts: '+500 RB' },
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
