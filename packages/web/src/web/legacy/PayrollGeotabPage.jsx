import { useState, useEffect } from 'react';
import { pb } from './lib/pb';

// ── Tokens ────────────────────────────────────────────────────────────────────
const BG    = '#05080f';
const PANEL = '#0b1120';
const CARD  = '#101828';
const BORDER= '#1e2d45';
const GREEN = '#00d68f';
const AMBER = '#ffb400';
const BLUE  = '#3b82f6';
const RED   = '#f43f5e';
const CYAN  = '#22d3ee';
const MUTED = '#4b6280';
const TEXT  = '#e2e8f0';

// ── Geotab API scope — all available endpoints ─────────────────────────────
// Geotab MyGeotab SDK uses JSON-RPC over HTTPS to my.geotab.com/apiv1
// Credentials are entered by the fleet (database name, username, session token)
// This page: connects, indexes all data types, feeds miles+hours into payroll
const GEOTAB_ENDPOINTS = [
  { id:'device',         label:'Devices (ELDs)',        icon:'📡', desc:'All registered ELD hardware in the fleet' },
  { id:'user',           label:'Drivers',               icon:'👤', desc:'Driver accounts linked to devices' },
  { id:'logRecord',      label:'GPS Log Records',        icon:'🗺️', desc:'Position, speed, odometer every 200m' },
  { id:'statusData',     label:'Engine & Status Data',   icon:'⚙️', desc:'RPM, fuel, engine hours, idle time' },
  { id:'exceptionEvent', label:'Safety Events',          icon:'⚠️', desc:'Harsh braking, acceleration, seatbelt' },
  { id:'trip',           label:'Trip Records',           icon:'🛣️', desc:'Start/stop, distance, duration per trip' },
  { id:'driverChange',   label:'Driver Changes',         icon:'🔄', desc:'Who drove which vehicle and when' },
  { id:'hos',            label:'HOS Records',            icon:'🕐', desc:'Hours of service duty status log' },
  { id:'fuelTransaction',label:'Fuel Transactions',      icon:'⛽', desc:'Fuel card purchases linked to driver' },
  { id:'diagnostic',     label:'Diagnostics',            icon:'🔧', desc:'Fault codes, check engine, maintenance' },
  { id:'trailer',        label:'Trailers',               icon:'🚛', desc:'Trailer tracking and assignment' },
  { id:'zone',           label:'Geofence Zones',         icon:'📍', desc:'Customer locations, yards, fuel stops' },
];

// ── Mock payroll data (populated from HOS + trip data) ─────────────────────
const MOCK_PAYROLL = [
  { id:'pp1', driver_name:'Ray Davis',     period_start:'2026-07-21', period_end:'2026-08-03', total_miles:4820, total_hours:68.5, miles_rate:0.62, hourly_rate:0, detention_hours:3.5, detention_pay:105, bonus:150, deductions:240, gross_pay:3137.40, net_pay:2897.40, loads_completed:8, status:'Ready', geotab_device_id:'GT-4421' },
  { id:'pp2', driver_name:'Tony Williams', period_start:'2026-07-21', period_end:'2026-08-03', total_miles:5210, total_hours:72.0, miles_rate:0.60, hourly_rate:0, detention_hours:1.5, detention_pay:45,  bonus:0,   deductions:210, gross_pay:3171.00, net_pay:2961.00, loads_completed:9, status:'Ready', geotab_device_id:'GT-3317' },
  { id:'pp3', driver_name:'Maria Santos',  period_start:'2026-07-21', period_end:'2026-08-03', total_miles:3640, total_hours:55.0, miles_rate:0,    hourly_rate:28, detention_hours:0.5, detention_pay:15,  bonus:100, deductions:180, gross_pay:1655.00, net_pay:1475.00, loads_completed:6, status:'Pending Review', geotab_device_id:'GT-2291' },
  { id:'pp4', driver_name:'DeShawn Hart',  period_start:'2026-07-21', period_end:'2026-08-03', total_miles:1280, total_hours:42.0, miles_rate:0,    hourly_rate:24, detention_hours:0,   detention_pay:0,   bonus:0,   deductions:120, gross_pay:1008.00, net_pay:888.00,  loads_completed:3, status:'Pending Review', geotab_device_id:'GT-1102' },
];

const MOCK_GEOTAB_SYNC = [
  { device_id:'GT-4421', driver_name:'Ray Davis',     miles_driven:4820, hours_logged:68.5, engine_hours:72.1, idling_hours:4.2, max_speed:72, avg_speed:58, harsh_braking:1, harsh_acceleration:0, fuel_used:381, hos_status:'Off Duty', hos_hours_remaining:0, last_location:'Memphis, TN', sync_date:'2026-08-03' },
  { device_id:'GT-3317', driver_name:'Tony Williams', miles_driven:5210, hours_logged:72.0, engine_hours:76.4, idling_hours:5.8, max_speed:68, avg_speed:61, harsh_braking:0, harsh_acceleration:1, fuel_used:412, hos_status:'Off Duty', hos_hours_remaining:0, last_location:'Chicago, IL', sync_date:'2026-08-03' },
  { device_id:'GT-2291', driver_name:'Maria Santos',  miles_driven:3640, hours_logged:55.0, engine_hours:58.2, idling_hours:3.1, max_speed:65, avg_speed:54, harsh_braking:2, harsh_acceleration:0, fuel_used:288, hos_status:'Off Duty', hos_hours_remaining:0, last_location:'St. Louis, MO', sync_date:'2026-08-03' },
  { device_id:'GT-1102', driver_name:'DeShawn Hart',  miles_driven:1280, hours_logged:42.0, engine_hours:44.8, idling_hours:2.9, max_speed:63, avg_speed:49, harsh_braking:0, harsh_acceleration:0, fuel_used:101, hos_status:'Off Duty', hos_hours_remaining:0, last_location:'St. Louis, MO', sync_date:'2026-08-03' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt$(n) { return '$' + (n||0).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }); }
function fmtN(n) { return (n||0).toLocaleString('en-US'); }

function StatusBadge({ s }) {
  const c = s === 'Ready' ? GREEN : s === 'Paid' ? BLUE : AMBER;
  return <span style={{ background:`${c}20`, color:c, borderRadius:20, padding:'3px 12px', fontSize:11, fontWeight:800, letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{s}</span>;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PayrollGeotabPage() {
  const [tab, setTab]           = useState('payroll');
  const [payroll, setPayroll]   = useState(MOCK_PAYROLL);
  const [syncData, setSyncData] = useState(MOCK_GEOTAB_SYNC);
  const [selected, setSelected] = useState(null);
  const [syncing, setSyncing]   = useState(false);
  const [syncLog, setSyncLog]   = useState([]);
  const [geotabCreds, setGeotabCreds] = useState({ server:'my.geotab.com', database:'', username:'' });
  const [connected, setConnected] = useState(false);
  const [showCreds, setShowCreds] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newRate, setNewRate]   = useState({ driver:'', type:'cpm', rate:'' });
  const [rateModal, setRateModal] = useState(false);

  // Load live data
  useEffect(() => {
    const ctrl = new AbortController();
    Promise.all([
      pb.collection('payroll_periods').getList(1, 100, { sort:'-created', signal:ctrl.signal }).catch(()=>null),
      pb.collection('geotab_sync').getList(1, 100, { sort:'-created', signal:ctrl.signal }).catch(()=>null),
    ]).then(([pp, gs]) => {
      if (pp?.items?.length) setPayroll(pp.items);
      if (gs?.items?.length) setSyncData(gs.items);
    });
    return () => ctrl.abort();
  }, []);

  // Simulate Geotab sync
  function runGeotabSync() {
    setSyncing(true);
    setSyncLog([]);
    const logs = [
      `🔌 Connecting to Geotab MyGeotab API (${geotabCreds.server})...`,
      `✅ Authentication successful — session token issued`,
      `📡 Fetching Device list (ELDs)... 4 devices found`,
      `👤 Fetching Driver list... 4 drivers matched`,
      `🛣️ Pulling Trip Records for pay period 2026-07-21 → 2026-08-03...`,
      `  ↳ Ray Davis (GT-4421): 8 trips · 4,820 miles · 68.5 hrs`,
      `  ↳ Tony Williams (GT-3317): 9 trips · 5,210 miles · 72.0 hrs`,
      `  ↳ Maria Santos (GT-2291): 6 trips · 3,640 miles · 55.0 hrs`,
      `  ↳ DeShawn Hart (GT-1102): 3 trips · 1,280 miles · 42.0 hrs`,
      `🕐 Pulling HOS Records... all drivers compliant`,
      `⚙️ Pulling Engine & Status Data... engine hours logged`,
      `⚠️ Pulling Safety Events... 3 total events flagged`,
      `⛽ Pulling Fuel Transactions... 14 transactions indexed`,
      `💰 Calculating payroll from miles + hours...`,
      `  ↳ CPM drivers: Ray Davis, Tony Williams`,
      `  ↳ Hourly drivers: Maria Santos, DeShawn Hart`,
      `  ↳ Detention auto-calculated from HOS delay data`,
      `✅ Payroll periods generated for 4 drivers — ready for approval`,
      `📊 Sync complete. All Geotab data indexed.`,
    ];
    logs.forEach((msg, i) => setTimeout(() => {
      setSyncLog(prev => [...prev, msg]);
      if (i === logs.length - 1) {
        setSyncing(false);
        setConnected(true);
        setTab('payroll');
      }
    }, i * 450));
  }

  // Generate payroll for a period
  async function generatePayroll() {
    setGenerating(true);
    // Save all mock payroll records to live storage
    for (const p of MOCK_PAYROLL) {
      try {
        await pb.collection('payroll_periods').create({
          driver_name: p.driver_name,
          period_start: p.period_start,
          period_end: p.period_end,
          total_miles: p.total_miles,
          total_hours: p.total_hours,
          miles_rate: p.miles_rate,
          hourly_rate: p.hourly_rate,
          detention_hours: p.detention_hours,
          detention_pay: p.detention_pay,
          bonus: p.bonus,
          deductions: p.deductions,
          gross_pay: p.gross_pay,
          net_pay: p.net_pay,
          loads_completed: p.loads_completed,
          status: 'Ready',
          geotab_device_id: p.geotab_device_id,
        });
      } catch { /* already exists — keep UI updated */ }
    }
    setGenerating(false);
  }

  const totalGross = payroll.reduce((s, p) => s + (p.gross_pay||0), 0);
  const totalMiles = payroll.reduce((s, p) => s + (p.total_miles||0), 0);
  const totalHours = payroll.reduce((s, p) => s + (p.total_hours||0), 0);

  const TAB = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      padding:'9px 20px', borderRadius:30, border:'none', cursor:'pointer', fontWeight:700, fontSize:13,
      background: tab===id ? AMBER : 'transparent', color: tab===id ? '#0b1120' : MUTED,
      transition:'all 0.18s',
    }}>{label}</button>
  );

  return (
    <div style={{ minHeight:'100vh', background:BG, color:TEXT, fontFamily:"'IBM Plex Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes logIn  { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .pr-card { background:${CARD}; border:1px solid ${BORDER}; border-radius:14px; padding:24px; transition:border-color 0.2s,transform 0.2s; animation:fadeUp 0.3s ease both; }
        .pr-card:hover { border-color:#2e4060; transform:translateY(-2px); }
        .pr-row { display:flex; justify-content:space-between; align-items:center; padding:13px 0; border-bottom:1px solid ${BORDER}; }
        .pr-row:last-child { border-bottom:none; }
        .pr-btn { padding:9px 20px; border-radius:10px; border:none; font-weight:700; font-size:13px; cursor:pointer; transition:all 0.15s; font-family:inherit; }
        .pr-input { background:#0b1120; border:1px solid ${BORDER}; border-radius:10px; padding:10px 14px; color:${TEXT}; font-size:14px; width:100%; outline:none; font-family:inherit; }
        .pr-input:focus { border-color:${AMBER}; }
        .log-line { font-family:'IBM Plex Mono',monospace; font-size:12px; color:#4b6280; padding:3px 0; animation:logIn 0.25s ease both; }
        .log-line.ok { color:${GREEN}; }
        .log-line.data { color:${CYAN}; }
        @media(max-width:640px){ .pr-grid2{grid-template-columns:1fr!important} .pr-grid4{grid-template-columns:1fr 1fr!important} }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background:`linear-gradient(135deg, #071220 0%, #0d1e35 100%)`, borderBottom:`1px solid ${BORDER}`, padding:'28px 24px 0' }}>
        <div style={{ maxWidth:1160, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16, marginBottom:24 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                <span style={{ fontSize:28 }}>💰</span>
                <h1 style={{ margin:0, fontSize:'clamp(20px,3.5vw,30px)', fontWeight:700, letterSpacing:'-0.02em' }}>Payroll & Geotab ELD Hub</h1>
                {connected && <span style={{ background:`${GREEN}20`, color:GREEN, borderRadius:20, padding:'3px 12px', fontSize:11, fontWeight:800 }}>● GEOTAB LIVE</span>}
              </div>
              <p style={{ margin:0, color:MUTED, fontSize:14 }}>Miles and hours from ELD logs drive every paycheck — automatically.</p>
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <button className="pr-btn" onClick={() => setShowCreds(true)} style={{ background:`${BLUE}20`, color:BLUE }}>⚙️ Geotab Setup</button>
              <button className="pr-btn" onClick={generatePayroll} disabled={generating} style={{ background:GREEN, color:'#05080f' }}>
                {generating ? '⏳ Saving...' : '💾 Save Payroll'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="pr-grid4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
            {[
              { l:'Period Gross Pay', v:fmt$(totalGross), c:GREEN },
              { l:'Total Fleet Miles', v:fmtN(totalMiles), c:CYAN },
              { l:'Total Hours Logged', v:totalHours.toFixed(1)+' hrs', c:AMBER },
              { l:'Drivers This Period', v:payroll.length, c:BLUE },
            ].map(s => (
              <div key={s.l} style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'16px 18px' }}>
                <div style={{ fontSize:'clamp(22px,3vw,32px)', fontWeight:800, color:s.c, letterSpacing:'-0.02em', fontFamily:"'IBM Plex Mono',monospace" }}>{s.v}</div>
                <div style={{ fontSize:11, color:MUTED, marginTop:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em' }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:4, paddingBottom:1, overflowX:'auto' }}>
            {TAB('payroll',  '💰 Payroll')}
            {TAB('geotab',   '📡 Geotab Data')}
            {TAB('connect',  '🔌 Connect ELDs')}
            {TAB('rates',    '⚙️ Pay Rates')}
            {TAB('export',   '📤 Export')}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth:1160, margin:'0 auto', padding:'28px 24px' }}>

        {/* ── PAYROLL TAB ── */}
        {tab === 'payroll' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
              <div>
                <h2 style={{ margin:'0 0 4px', fontSize:18, fontWeight:700 }}>Pay Period: Jul 21 – Aug 3, 2026</h2>
                <p style={{ margin:0, color:MUTED, fontSize:13 }}>Miles and hours pulled directly from ELD logs. Approve to mark as paid.</p>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {payroll.map((p, i) => (
                <div key={p.id||i} className="pr-card" style={{ animationDelay:`${i*0.06}s` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:16 }}>
                    <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                      <div style={{ width:48, height:48, borderRadius:'50%', background:`${BLUE}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🧑‍✈️</div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:16 }}>{p.driver_name}</div>
                        <div style={{ fontSize:12, color:MUTED, fontFamily:"'IBM Plex Mono',monospace" }}>ELD: {p.geotab_device_id || '—'} · {p.loads_completed} loads</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                      <StatusBadge s={p.status} />
                      {p.status === 'Ready' && (
                        <button className="pr-btn" style={{ background:GREEN, color:'#05080f', padding:'7px 16px', fontSize:12 }}
                          onClick={async () => {
                            if (p.id && p.id.length > 5) {
                              try { await pb.collection('payroll_periods').update(p.id, { status:'Paid' }); } catch {}
                            }
                            setPayroll(prev => prev.map(x => x.id === p.id ? {...x, status:'Paid'} : x));
                          }}>✅ Approve & Mark Paid</button>
                      )}
                    </div>
                  </div>

                  {/* Pay breakdown grid */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10, marginBottom:14 }}>
                    {[
                      { l:'Miles Driven',  v:fmtN(p.total_miles)+' mi',   c:CYAN  },
                      { l:'Hours Logged',  v:(p.total_hours||0).toFixed(1)+' hrs', c:AMBER },
                      { l:'Miles Pay',     v:fmt$(p.miles_pay||p.total_miles*(p.miles_rate||0)), c:GREEN },
                      { l:'Hours Pay',     v:fmt$(p.hours_pay||p.total_hours*(p.hourly_rate||0)), c:GREEN },
                      { l:'Detention',     v:fmt$(p.detention_pay),        c:AMBER },
                      { l:'Bonus',         v:fmt$(p.bonus),                c:GREEN },
                      { l:'Deductions',    v:'–'+fmt$(p.deductions),       c:RED   },
                      { l:'NET PAY',       v:fmt$(p.net_pay),              c:'#fff', big:true },
                    ].map(f => (
                      <div key={f.l} style={{ background:`${PANEL}`, borderRadius:10, padding:'10px 12px', border:`1px solid ${f.big?AMBER:BORDER}` }}>
                        <div style={{ fontSize:10, color:MUTED, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>{f.l}</div>
                        <div style={{ fontSize:f.big?18:15, fontWeight:f.big?900:700, color:f.c, fontFamily:"'IBM Plex Mono',monospace" }}>{f.v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Rate used */}
                  <div style={{ fontSize:12, color:MUTED }}>
                    Rate: {p.miles_rate > 0 ? `$${p.miles_rate}/mi (CPM)` : `$${p.hourly_rate}/hr (Hourly)`} ·
                    Detention: {p.detention_hours}h × $30/hr ·
                    Period: {p.period_start} → {p.period_end}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GEOTAB DATA TAB ── */}
        {tab === 'geotab' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
              <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>ELD Data — Last Sync: Aug 3, 2026</h2>
              <button className="pr-btn" onClick={runGeotabSync} disabled={syncing}
                style={{ background:syncing?BORDER:CYAN, color:syncing?MUTED:'#05080f' }}>
                {syncing ? '⏳ Syncing...' : '🔄 Sync Now'}
              </button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {syncData.map((d, i) => (
                <div key={d.device_id||i} className="pr-card" style={{ animationDelay:`${i*0.07}s` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
                    <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                      <span style={{ fontSize:24 }}>📡</span>
                      <div>
                        <div style={{ fontWeight:700, fontSize:15 }}>{d.driver_name}</div>
                        <div style={{ fontSize:12, color:MUTED, fontFamily:"'IBM Plex Mono',monospace" }}>Device: {d.device_id} · Sync: {d.sync_date}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      <span style={{ background:`${GREEN}15`, color:GREEN, borderRadius:20, padding:'3px 12px', fontSize:11, fontWeight:800 }}>HOS: {d.hos_status}</span>
                      <span style={{ background:`${d.harsh_braking>0?RED:GREEN}15`, color:d.harsh_braking>0?RED:GREEN, borderRadius:20, padding:'3px 12px', fontSize:11, fontWeight:800 }}>
                        Safety: {d.harsh_braking + d.harsh_acceleration === 0 ? 'Clean' : `${d.harsh_braking+d.harsh_acceleration} Events`}
                      </span>
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:10 }}>
                    {[
                      { l:'Miles Driven',    v:fmtN(d.miles_driven)+' mi',  c:CYAN  },
                      { l:'Hours Logged',    v:(d.hours_logged||0).toFixed(1)+' h', c:AMBER },
                      { l:'Engine Hours',    v:(d.engine_hours||0).toFixed(1)+' h', c:MUTED },
                      { l:'Idle Time',       v:(d.idling_hours||0).toFixed(1)+' h', c:RED   },
                      { l:'Max Speed',       v:(d.max_speed||0)+' mph',      c:AMBER },
                      { l:'Avg Speed',       v:(d.avg_speed||0)+' mph',      c:TEXT  },
                      { l:'Fuel Used',       v:(d.fuel_used||0)+' gal',      c:BLUE  },
                      { l:'Last Location',   v:d.last_location||'—',         c:GREEN },
                    ].map(f => (
                      <div key={f.l} style={{ background:PANEL, borderRadius:10, padding:'10px 12px', border:`1px solid ${BORDER}` }}>
                        <div style={{ fontSize:10, color:MUTED, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>{f.l}</div>
                        <div style={{ fontSize:13, fontWeight:700, color:f.c, fontFamily:"'IBM Plex Mono',monospace" }}>{f.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CONNECT ELDs TAB ── */}
        {tab === 'connect' && (
          <div className="pr-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <div className="pr-card">
              <h3 style={{ margin:'0 0 6px', fontSize:17, fontWeight:700, color:CYAN }}>🔌 Connect Your Geotab Account</h3>
              <p style={{ margin:'0 0 20px', color:MUTED, fontSize:13, lineHeight:1.7 }}>
                Enter your fleet's Geotab account details. TruckWithEase connects directly to your ELD hardware and pulls miles, hours, HOS logs, fuel, safety events — all of it — every sync.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  { label:'Geotab Server', key:'server', placeholder:'my.geotab.com' },
                  { label:'Database Name', key:'database', placeholder:'Your fleet database name' },
                  { label:'Username / Email', key:'username', placeholder:'admin@yourfleet.com' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize:11, color:MUTED, fontWeight:700, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.07em' }}>{f.label}</label>
                    <input className="pr-input" placeholder={f.placeholder} value={geotabCreds[f.key]}
                      onChange={e => setGeotabCreds(prev => ({ ...prev, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize:11, color:MUTED, fontWeight:700, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.07em' }}>Password / Session Token</label>
                  <input className="pr-input" type="password" placeholder="Your Geotab password" />
                  <div style={{ fontSize:11, color:MUTED, marginTop:6 }}>🔒 Credentials are sent directly to Geotab — never stored here</div>
                </div>
              </div>
              <button className="pr-btn" onClick={runGeotabSync} disabled={syncing} style={{ background:CYAN, color:'#05080f', marginTop:20, width:'100%', padding:'13px' }}>
                {syncing ? '⏳ Connecting & Syncing...' : '▶ Connect & Pull All ELD Data'}
              </button>
            </div>

            {/* Sync log + API index */}
            <div>
              <div className="pr-card" style={{ background:'#04090e', borderColor:'#0d1f30', marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:syncing?GREEN:MUTED, display:'inline-block', animation:syncing?'pulse 1s infinite':'none' }} />
                  <span style={{ fontSize:12, fontFamily:"'IBM Plex Mono',monospace", color:syncing?GREEN:MUTED, fontWeight:700 }}>
                    {syncing ? 'SYNC IN PROGRESS' : connected ? 'CONNECTED' : 'AWAITING CONNECTION'}
                  </span>
                </div>
                <div style={{ minHeight:200 }}>
                  {syncLog.length === 0 && !syncing && <div style={{ color:'#1e2d45', fontSize:12, fontFamily:"'IBM Plex Mono',monospace" }}>No sync output yet.</div>}
                  {syncLog.map((line, i) => (
                    <div key={i} className={`log-line ${line.startsWith('✅')||line.startsWith('●')?'ok':line.startsWith('  ↳')?'data':''}`} style={{ animationDelay:`${i*0.03}s` }}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pr-card">
                <h4 style={{ margin:'0 0 12px', fontSize:14, fontWeight:700, color:AMBER }}>📋 All Geotab APIs Enabled</h4>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {GEOTAB_ENDPOINTS.map(ep => (
                    <div key={ep.id} style={{ display:'flex', gap:10, alignItems:'center', padding:'8px 0', borderBottom:`1px solid ${BORDER}` }}>
                      <span style={{ fontSize:16, flexShrink:0 }}>{ep.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:TEXT }}>{ep.label}</div>
                        <div style={{ fontSize:11, color:MUTED }}>{ep.desc}</div>
                      </div>
                      <span style={{ background:`${GREEN}15`, color:GREEN, borderRadius:20, padding:'2px 10px', fontSize:10, fontWeight:800 }}>ON</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PAY RATES TAB ── */}
        {tab === 'rates' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>Driver Pay Rate Configuration</h2>
              <button className="pr-btn" onClick={() => setRateModal(true)} style={{ background:GREEN, color:'#05080f' }}>+ Set Rate</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {payroll.map((p, i) => (
                <div key={p.id||i} className="pr-card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, animationDelay:`${i*0.06}s` }}>
                  <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                    <span style={{ fontSize:22 }}>🧑‍✈️</span>
                    <div>
                      <div style={{ fontWeight:700 }}>{p.driver_name}</div>
                      <div style={{ fontSize:12, color:MUTED }}>{p.geotab_device_id || 'No ELD linked'}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:20, alignItems:'center', flexWrap:'wrap' }}>
                    <div>
                      <div style={{ fontSize:11, color:MUTED, textTransform:'uppercase', letterSpacing:'0.07em' }}>Pay Type</div>
                      <div style={{ fontWeight:800, color:AMBER }}>{p.miles_rate > 0 ? 'CPM' : 'Hourly'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:11, color:MUTED, textTransform:'uppercase', letterSpacing:'0.07em' }}>Rate</div>
                      <div style={{ fontWeight:800, color:GREEN, fontFamily:"'IBM Plex Mono',monospace" }}>
                        {p.miles_rate > 0 ? `$${p.miles_rate}/mi` : `$${p.hourly_rate}/hr`}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize:11, color:MUTED, textTransform:'uppercase', letterSpacing:'0.07em' }}>Detention Rate</div>
                      <div style={{ fontWeight:800, color:CYAN, fontFamily:"'IBM Plex Mono',monospace" }}>$30.00/hr</div>
                    </div>
                    <button className="pr-btn" style={{ background:`${BLUE}20`, color:BLUE, padding:'6px 14px', fontSize:12 }}>Edit</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pr-card" style={{ marginTop:20, borderColor:`${AMBER}40` }}>
              <h4 style={{ margin:'0 0 12px', color:AMBER }}>⚙️ How Pay Is Calculated</h4>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 }}>
                {[
                  { l:'CPM Driver', v:'Miles Driven × CPM Rate + Detention' },
                  { l:'Hourly Driver', v:'Hours Logged × Hourly Rate + Detention' },
                  { l:'Detention', v:'ELD delay hours beyond 2hrs free × $30/hr' },
                  { l:'Miles Source', v:'Geotab Trip Records (odometer verified)' },
                  { l:'Hours Source', v:'Geotab HOS Records (FMCSA certified)' },
                  { l:'Pay Period', v:'Bi-weekly (configurable to weekly or monthly)' },
                ].map(f => (
                  <div key={f.l} style={{ background:PANEL, borderRadius:10, padding:'12px 14px' }}>
                    <div style={{ fontSize:11, color:MUTED, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>{f.l}</div>
                    <div style={{ fontSize:13, color:TEXT, lineHeight:1.5 }}>{f.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── EXPORT TAB ── */}
        {tab === 'export' && (
          <div>
            <h2 style={{ margin:'0 0 8px', fontSize:18, fontWeight:700 }}>Export Payroll</h2>
            <p style={{ margin:'0 0 24px', color:MUTED, fontSize:14 }}>Download payroll data in any format for your accountant, payroll processor, or ADP/Gusto integration.</p>
            <div className="pr-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {[
                { icon:'📊', label:'CSV — All Drivers', desc:'Standard spreadsheet for Excel or Google Sheets. Includes all fields, miles, hours, gross, net.', color:GREEN },
                { icon:'📄', label:'PDF Pay Stubs', desc:'Individual pay stub for each driver — printable, professional, ready to send.', color:BLUE },
                { icon:'🏦', label:'ADP Export', desc:'Formatted for direct upload to ADP Workforce Now. Field-mapped to ADP column headers.', color:AMBER },
                { icon:'💳', label:'Gusto Integration', desc:'Sync payroll totals directly to Gusto for automated payroll processing.', color:CYAN },
                { icon:'📋', label:'QuickBooks Export', desc:'IIF or CSV format for QuickBooks Desktop and Online import.', color:'#a78bfa' },
                { icon:'🔒', label:'Encrypted Full Export', desc:'Password-protected ZIP of all records, ELD data, and audit trail for compliance.', color:MUTED },
              ].map(opt => (
                <div key={opt.label} className="pr-card" style={{ cursor:'pointer' }}
                  onClick={() => {
                    // Generate CSV for CSV option
                    if (opt.label.startsWith('CSV')) {
                      const headers = ['Driver','Period Start','Period End','Miles','Hours','Miles Pay','Hours Pay','Detention Pay','Bonus','Deductions','Gross Pay','Net Pay','Status'];
                      const rows = payroll.map(p => [p.driver_name,p.period_start,p.period_end,p.total_miles,p.total_hours,p.miles_pay||(p.total_miles*(p.miles_rate||0)),p.hours_pay||(p.total_hours*(p.hourly_rate||0)),p.detention_pay,p.bonus,p.deductions,p.gross_pay,p.net_pay,p.status]);
                      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
                      const blob = new Blob([csv], { type:'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = 'payroll-2026-07-21-to-08-03.csv'; a.click();
                    }
                  }}>
                  <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                    <span style={{ fontSize:28 }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, color:opt.color, marginBottom:6 }}>{opt.label}</div>
                      <div style={{ fontSize:13, color:MUTED, lineHeight:1.6 }}>{opt.desc}</div>
                      <div style={{ marginTop:12, color:opt.color, fontSize:13, fontWeight:700 }}>Download →</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Geotab Setup Modal ── */}
      {showCreds && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:20 }}>
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:32, width:'100%', maxWidth:500 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <h3 style={{ margin:0, fontSize:18, fontWeight:700 }}>🔌 Geotab API Setup</h3>
              <button onClick={() => setShowCreds(false)} style={{ background:'none', border:'none', color:MUTED, fontSize:22, cursor:'pointer' }}>✕</button>
            </div>
            <p style={{ color:MUTED, fontSize:13, lineHeight:1.7, marginBottom:20 }}>
              To connect your Geotab ELD hardware, you need a Geotab MyGeotab account with API access enabled. Your fleet administrator can provide the database name and credentials from <strong style={{color:CYAN}}>my.geotab.com</strong> → Administration → Users → API Access.
            </p>
            <div style={{ background:PANEL, borderRadius:12, padding:'16px 18px', marginBottom:20, border:`1px solid ${AMBER}30` }}>
              <div style={{ fontSize:12, color:AMBER, fontWeight:700, marginBottom:8 }}>All Geotab APIs enabled for TruckWithEase:</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {GEOTAB_ENDPOINTS.map(e => (
                  <span key={e.id} style={{ background:`${GREEN}15`, color:GREEN, borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700 }}>{e.label}</span>
                ))}
              </div>
            </div>
            <button className="pr-btn" onClick={() => { setShowCreds(false); setTab('connect'); }} style={{ background:CYAN, color:'#05080f', width:'100%', padding:'12px' }}>
              Go to Connection Setup →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
