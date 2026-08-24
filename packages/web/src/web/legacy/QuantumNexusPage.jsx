import { useState, useEffect, useRef } from 'react';
import { pb } from './lib/pb';

// ─── QUANTUM NEXUS — Total Dispatch + Load Board + Contact Intelligence ───────
// One command center: every load, every shipper, every broker, every insurer,
// every driver — all indexed, all communicating, all quantum-coordinated.

const C = {
  bg:      '#050a0f',
  panel:   '#080f18',
  card:    '#0c1520',
  card2:   '#101c28',
  border:  '#162436',
  gold:    '#c9a84c',
  green:   '#00e676',
  amber:   '#ffab00',
  red:     '#ff1744',
  blue:    '#00b0ff',
  teal:    '#00e5ff',
  purple:  '#b388ff',
  muted:   '#4a6070',
  text:    '#c8dae8',
  dim:     '#567080',
};

const CONTACT_TYPES = ['Shipper', 'Broker', 'Insurance', 'Carrier', 'Factoring', 'Fuel Card', 'Other'];
const SOURCES = ['DAT', 'Truckstop', 'Convoy', 'CH Robinson', 'Amazon Relay', 'Coyote', 'Loadsmart', 'Uber Freight', '123Loadboard', 'Next Trucking', 'Direct', 'Sylectus'];
const EQUIPMENT = ['Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'Tanker', 'Box Truck', 'Lowboy'];
const PRIORITIES = ['CRITICAL', 'HIGH', 'NORMAL', 'LOW'];

const PLATFORM_MAP = {
  'Shipper':    ['ELD Portal', 'TMS System', 'MacroPoint', 'Project44', 'FourKites', 'Email', 'Phone', 'EDI'],
  'Broker':     ['DAT', 'Truckstop', 'Convoy App', 'CH Robinson Navisphere', 'Coyote Go', 'Direct API', 'Email'],
  'Insurance':  ['Agent Portal', 'ACORD Certificate', 'Email', 'Phone', 'Online Portal'],
  'Carrier':    ['ELD Integration', 'Email', 'Direct EDI', 'API'],
  'Factoring':  ['Factoring Portal', 'QuickPay', 'Email', 'Direct Deposit'],
  'Fuel Card':  ['Comdata', 'EFS', 'WEX', 'Pilot Flying J', 'Love\'s'],
};

const MOCK_CONTACTS = [
  { id:'QC-001', contact_type:'Shipper',   company_name:'Walmart Distribution',  contact_name:'James Lee',     phone:'816-555-0123', email:'james.lee@walmart.com',    platform:'TMS System',  integration:'Active',  loads_given:47, total_revenue:142800, avg_rate:3038, payment_terms:'30 days', rating:9.5, status:'preferred', last_contact:'Today', notes:'Consistent volume, Dallas to Chicago lane' },
  { id:'QC-002', contact_type:'Broker',    company_name:'CH Robinson',           contact_name:'Sarah Mills',   phone:'612-555-0199', email:'smills@chrobinson.com',     platform:'Navisphere',  integration:'Active',  loads_given:31, total_revenue:98400, avg_rate:3174, payment_terms:'21 days', rating:9.2, status:'active',    last_contact:'Yesterday', notes:'Large shipper network, reliable quick pay' },
  { id:'QC-003', contact_type:'Insurance', company_name:'Great West Casualty',   contact_name:'Tom Bradley',   phone:'402-555-0177', email:'tbradley@gwcc.com',         platform:'Agent Portal',integration:'Active',  loads_given:0,  total_revenue:0,      avg_rate:0,    payment_terms:'N/A',    rating:9.8, status:'active',    policy_number:'GWC-4821-TX', policy_expires:'2026-12-31', coverage_amount:'$1M Primary Liability', last_contact:'2026-08-01', notes:'Primary liability + cargo coverage' },
  { id:'QC-004', contact_type:'Shipper',   company_name:'Amazon Fulfillment',    contact_name:'Amazon Relay',  phone:'888-280-4331', email:'relay@amazon.com',          platform:'Amazon Relay App', integration:'Active', loads_given:28, total_revenue:46200, avg_rate:1650, payment_terms:'7 days', rating:10, status:'preferred', last_contact:'Today', notes:'No touch freight, fastest payment in industry' },
  { id:'QC-005', contact_type:'Broker',    company_name:'Coyote Logistics',      contact_name:'Mike Torres',   phone:'312-555-0144', email:'m.torres@coyote.com',       platform:'Coyote Go',   integration:'Active',  loads_given:19, total_revenue:58900, avg_rate:3100, payment_terms:'30 days', rating:8.7, status:'active',    last_contact:'3 days ago', notes:'UPS-owned, major corridor volume' },
  { id:'QC-006', contact_type:'Factoring', company_name:'OTR Capital',           contact_name:'Lisa Grant',    phone:'470-555-0188', email:'lgrant@otrcapital.com',     platform:'OTR Portal',  integration:'Pending', loads_given:0,  total_revenue:0,      avg_rate:0,    payment_terms:'24hr',   rating:9.1, status:'active',    last_contact:'1 week ago', notes:'Recourse factoring, 3% fee, no min volume' },
  { id:'QC-007', contact_type:'Insurance', company_name:'Progressive Commercial', contact_name:'Dawn Fisher',  phone:'440-555-0234', email:'dfisher@progressive.com',   platform:'Online Portal',integration:'Active',  loads_given:0,  total_revenue:0,      avg_rate:0,    payment_terms:'N/A',    rating:9.0, status:'active',    policy_number:'PGR-7742-TX', policy_expires:'2027-01-15', coverage_amount:'$100K Cargo', last_contact:'2026-07-20', notes:'Cargo coverage, physical damage' },
  { id:'QC-008', contact_type:'Shipper',   company_name:'Home Depot Direct',     contact_name:'Mark Davis',    phone:'678-555-0134', email:'mdavis@homedepot.com',      platform:'EDI',         integration:'Pending', loads_given:12, total_revenue:23760, avg_rate:1980, payment_terms:'45 days', rating:9.9, status:'active',    last_contact:'2 weeks ago', notes:'Building materials, flatbed preferred' },
];

const MOCK_LOADS = [
  { id:'QD-001', load_id:'QD-001', fleet_name:'Morris Fleet', source:'CH Robinson', shipper:'Walmart Distribution', shipper_phone:'816-555-0123', broker:'CH Robinson', origin_city:'Kansas City', origin_state:'MO', dest_city:'Dallas', dest_state:'TX', miles:501, rate:3120, rate_per_mile:6.23, weight:'45,000 lbs', commodity:'General Merchandise', equipment:'Dry Van', pickup_date:'Today 10:00', delivery_date:'Tomorrow 18:00', assigned_driver:'Ray Davis', assigned_truck:'TRK-441', status:'in_transit', priority:'HIGH', insurance_verified:'Yes', notes:'' },
  { id:'QD-002', load_id:'QD-002', fleet_name:'Morris Fleet', source:'Amazon Relay', shipper:'Amazon Fulfillment', shipper_phone:'888-280-4331', broker:'Direct', origin_city:'Phoenix', origin_state:'AZ', dest_city:'Los Angeles', dest_state:'CA', miles:370, rate:1650, rate_per_mile:4.46, weight:'28,000 lbs', commodity:'E-Commerce', equipment:'Dry Van', pickup_date:'Today 16:00', delivery_date:'Tomorrow 10:00', assigned_driver:'', assigned_truck:'', status:'available', priority:'NORMAL', insurance_verified:'Yes', notes:'' },
  { id:'QD-003', load_id:'QD-003', fleet_name:'Morris Fleet', source:'DAT', shipper:'Kroger Distribution', shipper_phone:'901-555-0145', broker:'Coyote Logistics', origin_city:'Memphis', origin_state:'TN', dest_city:'Atlanta', dest_state:'GA', miles:392, rate:2880, rate_per_mile:7.35, weight:'43,200 lbs', commodity:'Food/Groceries', equipment:'Reefer', pickup_date:'Tomorrow 06:00', delivery_date:'Tomorrow 20:00', assigned_driver:'Tony Williams', assigned_truck:'TRK-317', status:'claimed', priority:'HIGH', insurance_verified:'Yes', notes:'' },
  { id:'QD-004', load_id:'QD-004', fleet_name:'Morris Fleet', source:'Direct', shipper:'Home Depot Direct', shipper_phone:'678-555-0134', broker:'Direct', origin_city:'Atlanta', origin_state:'GA', dest_city:'Charlotte', dest_state:'NC', miles:245, rate:1980, rate_per_mile:8.08, weight:'40,000 lbs', commodity:'Building Materials', equipment:'Flatbed', pickup_date:'Today 11:00', delivery_date:'Today 22:00', assigned_driver:'', assigned_truck:'', status:'available', priority:'NORMAL', insurance_verified:'Pending', notes:'Flatbed straps required' },
];

function typeColor(t) {
  if (t === 'Shipper')   return C.blue;
  if (t === 'Broker')    return C.amber;
  if (t === 'Insurance') return C.green;
  if (t === 'Carrier')   return C.teal;
  if (t === 'Factoring') return C.purple;
  if (t === 'Fuel Card') return C.gold;
  return C.muted;
}
function statusColor(s) {
  if (s === 'available')  return C.teal;
  if (s === 'claimed')    return C.amber;
  if (s === 'in_transit') return C.green;
  if (s === 'delivered')  return C.purple;
  if (s === 'cancelled')  return C.red;
  if (s === 'preferred')  return C.gold;
  if (s === 'active')     return C.green;
  if (s === 'pending')    return C.amber;
  return C.muted;
}
function priorityColor(p) {
  if (p === 'CRITICAL') return C.red;
  if (p === 'HIGH')     return C.amber;
  if (p === 'NORMAL')   return C.blue;
  return C.muted;
}

const GOAT_INSIGHTS = [
  "Walmart and Amazon together represent 42% of your top-source revenue — protect those relationships with priority response times.",
  "CH Robinson 21-day payment + OTR factoring = cash in 24 hours on every CH Robinson load. Wire these two together.",
  "Your insurance expires Dec 31. Contact Great West Casualty now — renewal before expiry keeps your authority active.",
  "Home Depot Direct loads pay $8.08/mile — your highest rate-per-mile shipper. Prioritize their lanes.",
  "3 loads currently unassigned. Derrick Brown and Marcus Lee are both available with full HOS. Deploy now.",
  "Amazon Relay pays in 7 days — fastest in your network. Stack these loads to maximize cash flow weeks.",
  "Coyote Logistics is 30-day pay. Pair with factoring to keep cash flowing without waiting.",
];

export default function QuantumNexusPage() {
  const [tab, setTab]               = useState('nexus');
  const [contacts, setContacts]     = useState(MOCK_CONTACTS);
  const [loads, setLoads]           = useState(MOCK_LOADS);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedLoad, setSelectedLoad]       = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddLoad, setShowAddLoad]       = useState(false);
  const [goatTip, setGoatTip]       = useState(0);
  const [scanning, setScanning]     = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [newContact, setNewContact] = useState({ contact_type:'Shipper', company_name:'', contact_name:'', phone:'', email:'', platform:'', integration:'Active', payment_terms:'30 days', rating:8.0, status:'active', policy_number:'', policy_expires:'', coverage_amount:'', notes:'' });
  const [newLoad, setNewLoad]       = useState({ source:'DAT', shipper:'', shipper_phone:'', broker:'', origin_city:'', origin_state:'', dest_city:'', dest_state:'', miles:0, rate:0, rate_per_mile:0, weight:'', commodity:'', equipment:'Dry Van', pickup_date:'', delivery_date:'', assigned_driver:'', assigned_truck:'', status:'available', priority:'NORMAL', insurance_verified:'Yes', notes:'' });
  const [saving, setSaving]         = useState(false);
  const [commsOpen, setCommsOpen]   = useState(null);
  const [commsMsg, setCommsMsg]     = useState('');
  const [commsLog, setCommsLog]     = useState({});
  const tipRef = useRef(null);

  useEffect(() => {
    loadData();
    tipRef.current = setInterval(() => setGoatTip(t => (t+1) % GOAT_INSIGHTS.length), 9000);
    return () => clearInterval(tipRef.current);
  }, []);

  async function loadData() {
    try {
      const [c, l] = await Promise.all([
        pb.collection('quantum_contacts').getList(1, 200, { sort: '-created' }),
        pb.collection('quantum_dispatch_loads').getList(1, 200, { sort: '-created' }),
      ]);
      if (c.items.length > 0) setContacts(c.items);
      if (l.items.length > 0) setLoads(l.items);
    } catch { /* use mock data */ }
  }

  async function saveContact() {
    if (!newContact.company_name.trim()) return;
    setSaving(true);
    try {
      const rec = await pb.collection('quantum_contacts').create({ ...newContact, loads_given: 0, total_revenue: 0, avg_rate: 0, last_contact: 'Today' });
      setContacts(prev => [rec, ...prev]);
      setShowAddContact(false);
      setNewContact({ contact_type:'Shipper', company_name:'', contact_name:'', phone:'', email:'', platform:'', integration:'Active', payment_terms:'30 days', rating:8.0, status:'active', policy_number:'', policy_expires:'', coverage_amount:'', notes:'' });
    } catch(e) { console.error(e); }
    setSaving(false);
  }

  async function saveLoad() {
    if (!newLoad.shipper.trim()) return;
    setSaving(true);
    try {
      const lid = 'QD-' + Date.now().toString().slice(-5);
      const payload = { ...newLoad, load_id: lid, fleet_name: 'Morris Fleet', miles: Number(newLoad.miles)||0, rate: Number(newLoad.rate)||0, rate_per_mile: Number(newLoad.rate_per_mile)||0 };
      const rec = await pb.collection('quantum_dispatch_loads').create(payload);
      setLoads(prev => [rec, ...prev]);
      setShowAddLoad(false);
      setNewLoad({ source:'DAT', shipper:'', shipper_phone:'', broker:'', origin_city:'', origin_state:'', dest_city:'', dest_state:'', miles:0, rate:0, rate_per_mile:0, weight:'', commodity:'', equipment:'Dry Van', pickup_date:'', delivery_date:'', assigned_driver:'', assigned_truck:'', status:'available', priority:'NORMAL', insurance_verified:'Yes', notes:'' });
    } catch(e) { console.error(e); }
    setSaving(false);
  }

  async function updateLoadStatus(load, newStatus) {
    try {
      if (load.id && load.id.startsWith('QD-0')) throw new Error('mock');
      await pb.collection('quantum_dispatch_loads').update(load.id, { status: newStatus });
    } catch {}
    setLoads(prev => prev.map(l => l.id === load.id ? { ...l, status: newStatus } : l));
    if (selectedLoad?.id === load.id) setSelectedLoad(p => ({ ...p, status: newStatus }));
  }

  function runQuantumScan() {
    setScanning(true);
    setScanResult('');
    setTimeout(() => {
      const totalRev  = contacts.filter(c => c.contact_type === 'Shipper' || c.contact_type === 'Broker').reduce((s,c) => s + (Number(c.total_revenue)||0), 0);
      const insurers  = contacts.filter(c => c.contact_type === 'Insurance');
      const expiring  = insurers.filter(c => c.policy_expires && new Date(c.policy_expires) < new Date(Date.now() + 90*24*60*60*1000));
      const available = loads.filter(l => l.status === 'available').length;
      const revenue   = loads.reduce((s,l) => s + (Number(l.rate)||0), 0);
      const uninsured = loads.filter(l => l.insurance_verified !== 'Yes').length;
      setScanResult(`⚡ QUANTUM NEXUS SCAN COMPLETE — ${contacts.length} entities indexed · ${loads.length} loads tracked · $${revenue.toLocaleString()} active board value · ${available} loads unassigned · ${uninsured} loads pending insurance verification · ${expiring.length} insurance polic${expiring.length===1?'y':'ies'} expiring within 90 days${expiring.length>0?' — ACTION REQUIRED':''} · Total shipper/broker network value: $${totalRev.toLocaleString()} · THE GOAT recommends: ${GOAT_INSIGHTS[Math.floor(Math.random()*GOAT_INSIGHTS.length)]}`);
      setScanning(false);
    }, 2400);
  }

  function sendComms(contactId) {
    if (!commsMsg.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    setCommsLog(p => ({ ...p, [contactId]: [...(p[contactId]||[]), { from:'you', text: commsMsg, time }] }));
    setCommsMsg('');
    setTimeout(() => {
      const replies = ['10-4, copy that.', 'Got it, will confirm shortly.', 'Understood — processing now.', 'Thanks, noted on our end.', 'Confirmed. Stand by for update.'];
      const t2 = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
      setCommsLog(p => ({ ...p, [contactId]: [...(p[contactId]||[]), { from:'contact', text: replies[Math.floor(Math.random()*replies.length)], time: t2 }] }));
    }, 1500);
  }

  // Derived stats
  const totalBoardValue = loads.reduce((s,l) => s + (Number(l.rate)||0), 0);
  const availableLoads  = loads.filter(l => l.status === 'available').length;
  const activeLoads     = loads.filter(l => ['claimed','in_transit'].includes(l.status)).length;
  const insurerCount    = contacts.filter(c => c.contact_type === 'Insurance').length;
  const shipperCount    = contacts.filter(c => c.contact_type === 'Shipper').length;
  const brokerCount     = contacts.filter(c => c.contact_type === 'Broker').length;

  const filteredContacts = contacts.filter(c => {
    if (filterType !== 'All' && c.contact_type !== filterType) return false;
    if (filterStatus !== 'All' && c.status !== filterStatus) return false;
    return true;
  });

  const Input = ({ label, value, onChange, placeholder, type='text', span }) => (
    <div style={{ gridColumn: span ? '1/-1' : undefined }}>
      <label style={{ display:'block', color: C.dim, fontSize:10, letterSpacing:1.5, textTransform:'uppercase', marginBottom:4 }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width:'100%', background:'#060f18', border:`1px solid ${C.border}`, color: C.text, padding:'9px 12px', borderRadius:6, fontSize:13, boxSizing:'border-box', fontFamily:'inherit' }} />
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background: C.bg, color: C.text, fontFamily:"'IBM Plex Mono', monospace" }}>

      {/* ── HEADER ── */}
      <div style={{ background: C.panel, borderBottom:`2px solid ${C.gold}`, padding:'0 20px' }}>
        <div style={{ maxWidth:1400, margin:'0 auto', height:60, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <a href="/" style={{ color: C.dim, textDecoration:'none', fontSize:11 }}>← HOME</a>
            <div style={{ color: C.gold, fontWeight:700, letterSpacing:4, fontSize:14 }}>QUANTUM NEXUS</div>
            <div style={{ width:6, height:6, borderRadius:'50%', background: C.green, boxShadow:`0 0 10px ${C.green}`, animation:'pulse 2s ease-out infinite' }} />
            <div style={{ color: C.dim, fontSize:10 }}>TOTAL FLEET INTELLIGENCE</div>
          </div>
          <div style={{ display:'flex', gap:12, alignItems:'center', fontSize:11 }}>
            <span style={{ color: C.gold }}>${totalBoardValue.toLocaleString()} BOARD</span>
            <span style={{ color: C.teal }}>{availableLoads} AVAIL</span>
            <span style={{ color: C.green }}>{activeLoads} ACTIVE</span>
            <span style={{ color: C.blue }}>{contacts.length} CONTACTS</span>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={runQuantumScan} disabled={scanning}
              style={{ background: scanning ? C.card : C.gold, color: scanning ? C.dim : '#000', border:'none', padding:'8px 16px', borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:700 }}>
              {scanning ? '⚡ SCANNING…' : '⚡ QUANTUM SCAN'}
            </button>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ background: C.panel, borderBottom:`1px solid ${C.border}`, padding:'0 20px' }}>
        <div style={{ maxWidth:1400, margin:'0 auto', display:'flex', gap:2 }}>
          {[
            { id:'nexus',    label:'⚛️ NEXUS VIEW' },
            { id:'loads',    label:'📦 LOAD INDEX' },
            { id:'contacts', label:'📡 CONTACT BANK' },
            { id:'insurance',label:'🛡️ INSURANCE' },
            { id:'comms',    label:'💬 QUANTUM COMMS' },
            { id:'a2p',      label:'📱 A2P STATUS' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ background:'none', border:'none', color: tab===t.id ? C.gold : C.dim, padding:'12px 16px', cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:1, borderBottom: tab===t.id ? `2px solid ${C.gold}` : '2px solid transparent', marginBottom:-1, transition:'color 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1400, margin:'0 auto', padding:'20px 16px' }}>

        {/* ── GOAT SCAN RESULT ── */}
        {scanResult && (
          <div style={{ background:`linear-gradient(135deg, #0d0900, #050800)`, border:`1px solid ${C.gold}`, borderRadius:10, padding:'14px 18px', marginBottom:20, display:'flex', gap:12 }}>
            <span style={{ fontSize:22, flexShrink:0 }}>🐐</span>
            <div>
              <div style={{ color: C.gold, fontWeight:700, fontSize:10, letterSpacing:2, marginBottom:6 }}>THE GOAT — QUANTUM NEXUS ANALYSIS</div>
              <div style={{ color: C.text, fontSize:12, lineHeight:1.7 }}>{scanResult}</div>
            </div>
            <button onClick={() => setScanResult('')} style={{ background:'none', border:'none', color: C.dim, cursor:'pointer', fontSize:16, marginLeft:'auto', alignSelf:'flex-start' }}>×</button>
          </div>
        )}

        {/* ── GOAT TIP ── */}
        {!scanResult && (
          <div style={{ background: C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
            <span>🐐</span>
            <span style={{ color: C.dim, fontSize:10, letterSpacing:2 }}>THE GOAT:</span>
            <span style={{ color: C.text, fontSize:12 }}>{GOAT_INSIGHTS[goatTip]}</span>
          </div>
        )}

        {/* ══════════════ NEXUS VIEW ══════════════ */}
        {tab === 'nexus' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:16 }}>
            {/* Stats */}
            {[
              { label:'Board Value',    value:`$${totalBoardValue.toLocaleString()}`, color: C.gold,   icon:'💰', sub:`${loads.length} total loads` },
              { label:'Available Now',  value: availableLoads,  color: C.teal,   icon:'✅', sub:'ready to assign' },
              { label:'On The Road',    value: activeLoads,     color: C.green,  icon:'🚛', sub:'active movement' },
              { label:'Shippers',       value: shipperCount,    color: C.blue,   icon:'🏭', sub:'in contact bank' },
              { label:'Brokers',        value: brokerCount,     color: C.amber,  icon:'📋', sub:'active partners' },
              { label:'Insurers',       value: insurerCount,    color: C.purple, icon:'🛡️', sub:'policies tracked' },
            ].map(s => (
              <div key={s.label} style={{ background: C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'16px 18px', display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ fontSize:28 }}>{s.icon}</div>
                <div>
                  <div style={{ color: s.color, fontFamily:'Bebas Neue, sans-serif', fontSize:28, letterSpacing:1, lineHeight:1 }}>{s.value}</div>
                  <div style={{ color: C.text, fontSize:12, fontWeight:700 }}>{s.label}</div>
                  <div style={{ color: C.dim, fontSize:10 }}>{s.sub}</div>
                </div>
              </div>
            ))}

            {/* Top shippers */}
            <div style={{ background: C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:18, gridColumn:'span 2' }}>
              <div style={{ color: C.gold, fontSize:10, letterSpacing:2, fontWeight:700, marginBottom:14 }}>TOP REVENUE SOURCES — INDEXED</div>
              {contacts.filter(c => ['Shipper','Broker'].includes(c.contact_type)).sort((a,b) => (b.total_revenue||0)-(a.total_revenue||0)).slice(0,5).map(c => {
                const max = Math.max(...contacts.map(x => x.total_revenue||0));
                const pct = max > 0 ? ((c.total_revenue||0)/max*100) : 0;
                return (
                  <div key={c.id} style={{ marginBottom:12, cursor:'pointer' }} onClick={() => { setSelectedContact(c); setTab('contacts'); }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ color: typeColor(c.contact_type), fontSize:10, fontWeight:700 }}>[{c.contact_type.toUpperCase()}]</span>
                        <span style={{ color: C.text, fontSize:12, fontWeight:700 }}>{c.company_name}</span>
                        <span style={{ color: C.dim, fontSize:10 }}>{c.platform}</span>
                      </div>
                      <span style={{ color: C.gold, fontSize:13, fontWeight:700 }}>${(c.total_revenue||0).toLocaleString()}</span>
                    </div>
                    <div style={{ background:'#0a1520', borderRadius:3, height:5 }}>
                      <div style={{ width:`${pct}%`, height:'100%', background: typeColor(c.contact_type), borderRadius:3, transition:'width 0.6s' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active loads summary */}
            <div style={{ background: C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:18 }}>
              <div style={{ color: C.teal, fontSize:10, letterSpacing:2, fontWeight:700, marginBottom:14 }}>ACTIVE LOADS — LIVE STATUS</div>
              {loads.map(l => (
                <div key={l.id} onClick={() => { setSelectedLoad(l); setTab('loads'); }}
                  style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, cursor:'pointer', padding:'8px 10px', background: C.card2, borderRadius:6, border:`1px solid ${C.border}` }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background: statusColor(l.status), flexShrink:0,
                    boxShadow: l.status==='in_transit' ? `0 0 6px ${statusColor(l.status)}` : undefined }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:11, fontWeight:700, color: C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {l.origin_city}, {l.origin_state} → {l.dest_city}, {l.dest_state}
                    </div>
                    <div style={{ fontSize:10, color: C.dim }}>{l.shipper} · {l.source}</div>
                  </div>
                  <div style={{ color: C.gold, fontSize:12, fontWeight:700, flexShrink:0 }}>${Number(l.rate).toLocaleString()}</div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div style={{ background: C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:18 }}>
              <div style={{ color: C.amber, fontSize:10, letterSpacing:2, fontWeight:700, marginBottom:14 }}>QUICK ACTIONS</div>
              {[
                { label:'Add New Load',       action:() => { setShowAddLoad(true); setTab('loads'); },    color: C.green },
                { label:'Add Contact',        action:() => { setShowAddContact(true); setTab('contacts'); }, color: C.blue },
                { label:'View Dispatch →',    action:() => window.location.href='dispatch', color: C.teal },
                { label:'View Load Board →',  action:() => window.location.href='fleet-load-board', color: C.amber },
                { label:'Asset Bank →',       action:() => window.location.href='asset-ease', color: C.gold },
                { label:'Run GOAT Scan',      action: runQuantumScan, color: C.gold },
              ].map(a => (
                <button key={a.label} onClick={a.action}
                  style={{ display:'block', width:'100%', textAlign:'left', background:'transparent', border:`1px solid ${a.color}33`, color: a.color, padding:'10px 14px', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700, marginBottom:8, letterSpacing:1, fontFamily:'inherit' }}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════ LOAD INDEX ══════════════ */}
        {tab === 'loads' && (
          <>
            <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{ background: C.card, border:`1px solid ${C.border}`, color: C.text, padding:'8px 12px', borderRadius:6, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                <option value="All">All Statuses</option>
                {['available','claimed','in_transit','delivered','cancelled'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
              <button onClick={() => setShowAddLoad(true)}
                style={{ marginLeft:'auto', background: C.green, color:'#000', border:'none', padding:'8px 16px', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit' }}>
                + Add Load
              </button>
            </div>
            <div style={{ display:'grid', gap:10 }}>
              {loads.filter(l => filterStatus==='All' || l.status===filterStatus).map(load => (
                <div key={load.id} onClick={() => setSelectedLoad(selectedLoad?.id===load.id ? null : load)}
                  style={{ background: C.card, border:`1px solid ${selectedLoad?.id===load.id ? C.gold : C.border}`, borderRadius:10, padding:'14px 16px', cursor:'pointer' }}>
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
                    <div style={{ background: priorityColor(load.priority)+'22', border:`1px solid ${priorityColor(load.priority)}44`, color: priorityColor(load.priority), padding:'2px 8px', borderRadius:12, fontSize:9, fontWeight:700, flexShrink:0 }}>{load.priority}</div>
                    <div style={{ flex:1, minWidth:180 }}>
                      <span style={{ fontWeight:700, color:'#fff' }}>{load.origin_city}, {load.origin_state}</span>
                      <span style={{ color: C.dim, margin:'0 8px' }}>→</span>
                      <span style={{ fontWeight:700, color:'#fff' }}>{load.dest_city}, {load.dest_state}</span>
                    </div>
                    <span style={{ color: C.dim, fontSize:11 }}>{Number(load.miles).toLocaleString()} mi</span>
                    <span style={{ color: C.gold, fontFamily:'Bebas Neue, sans-serif', fontSize:20 }}>${Number(load.rate).toLocaleString()}</span>
                    <span style={{ color: C.green, fontSize:11, fontWeight:700 }}>${Number(load.rate_per_mile).toFixed(2)}/mi</span>
                    <div style={{ background: statusColor(load.status)+'22', border:`1px solid ${statusColor(load.status)}44`, color: statusColor(load.status), padding:'3px 10px', borderRadius:12, fontSize:10, fontWeight:700 }}>{load.status.replace('_',' ')}</div>
                  </div>
                  {/* Linked contact info */}
                  <div style={{ display:'flex', gap:16, marginTop:6, fontSize:10, color: C.dim }}>
                    <span>📦 {load.shipper}</span>
                    {load.broker && load.broker !== 'Direct' && <span>🔗 via {load.broker}</span>}
                    {load.shipper_phone && <span>📞 {load.shipper_phone}</span>}
                    {load.assigned_driver && <span>🚛 {load.assigned_driver}</span>}
                    <span style={{ color: load.insurance_verified==='Yes' ? C.green : C.amber }}>🛡️ Insurance: {load.insurance_verified}</span>
                  </div>
                  {selectedLoad?.id === load.id && (
                    <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${C.border}`, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:10 }}>
                      {[
                        ['Equipment', load.equipment], ['Commodity', load.commodity], ['Weight', load.weight],
                        ['Pickup', load.pickup_date], ['Delivery', load.delivery_date], ['Truck', load.assigned_truck||'Unassigned'],
                        ['Source', load.source], ['Notes', load.notes||'—'],
                      ].map(([k,v]) => (
                        <div key={k}><div style={{ color: C.dim, fontSize:9, letterSpacing:1 }}>{k.toUpperCase()}</div><div style={{ color: C.text, fontSize:12, marginTop:2 }}>{v||'—'}</div></div>
                      ))}
                      <div style={{ gridColumn:'1/-1', display:'flex', gap:8, flexWrap:'wrap', paddingTop:8 }}>
                        {load.status==='available'  && <button onClick={e=>{e.stopPropagation();updateLoadStatus(load,'claimed')}}    style={actionBtn(C.gold)}>Claim Load</button>}
                        {load.status==='claimed'    && <button onClick={e=>{e.stopPropagation();updateLoadStatus(load,'in_transit')}} style={actionBtn(C.blue)}>Mark In Transit</button>}
                        {load.status==='in_transit' && <button onClick={e=>{e.stopPropagation();updateLoadStatus(load,'delivered')}} style={actionBtn(C.green)}>Mark Delivered</button>}
                        {!['cancelled','delivered'].includes(load.status) && <button onClick={e=>{e.stopPropagation();updateLoadStatus(load,'cancelled')}} style={{ ...actionBtn(C.red), background:'transparent', border:`1px solid ${C.red}` }}>Cancel</button>}
                        {/* Link to shipper contact */}
                        {contacts.find(c => c.company_name === load.shipper) && (
                          <button onClick={e=>{e.stopPropagation(); setSelectedContact(contacts.find(c=>c.company_name===load.shipper)); setTab('contacts');}} style={actionBtn(C.teal)}>View Shipper Profile</button>
                        )}
                        <button onClick={e=>{e.stopPropagation(); setCommsOpen(load.shipper); setTab('comms');}} style={actionBtn(C.purple)}>Quantum Comms</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══════════════ CONTACT BANK ══════════════ */}
        {tab === 'contacts' && (
          <>
            <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                style={{ background: C.card, border:`1px solid ${C.border}`, color: C.text, padding:'8px 12px', borderRadius:6, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                <option value="All">All Types</option>
                {CONTACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={() => setShowAddContact(true)}
                style={{ marginLeft:'auto', background: C.blue, color:'#fff', border:'none', padding:'8px 16px', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit' }}>
                + Add Contact
              </button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:12 }}>
              {filteredContacts.map(c => {
                const isSelected = selectedContact?.id === c.id;
                const col = typeColor(c.contact_type);
                const loadsForContact = loads.filter(l => l.shipper === c.company_name || l.broker === c.company_name);
                return (
                  <div key={c.id} onClick={() => setSelectedContact(isSelected ? null : c)}
                    style={{ background: C.card, border:`2px solid ${isSelected ? col : C.border}`, borderRadius:12, padding:16, cursor:'pointer', transition:'border-color 0.2s' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                      <div>
                        <div style={{ background: col+'22', border:`1px solid ${col}44`, color: col, padding:'2px 8px', borderRadius:10, fontSize:9, fontWeight:700, display:'inline-block', marginBottom:6 }}>{c.contact_type.toUpperCase()}</div>
                        <div style={{ fontWeight:700, fontSize:14, color:'#fff', lineHeight:1.2 }}>{c.company_name}</div>
                        {c.contact_name && <div style={{ color: C.dim, fontSize:11, marginTop:2 }}>{c.contact_name}</div>}
                      </div>
                      <div style={{ background: statusColor(c.status)+'22', border:`1px solid ${statusColor(c.status)}44`, color: statusColor(c.status), padding:'3px 8px', borderRadius:10, fontSize:9, fontWeight:700 }}>{c.status?.toUpperCase()}</div>
                    </div>
                    <div style={{ display:'flex', gap:16, marginBottom:8, fontSize:10, color: C.dim, flexWrap:'wrap' }}>
                      {c.phone && <span>📞 {c.phone}</span>}
                      {c.platform && <span>🔗 {c.platform}</span>}
                      {c.payment_terms && c.contact_type !== 'Insurance' && <span>💳 {c.payment_terms}</span>}
                      {c.rating > 0 && <span style={{ color: C.gold }}>⭐ {c.rating}</span>}
                    </div>
                    {(c.total_revenue > 0) && (
                      <div style={{ display:'flex', gap:20, padding:'8px 0', borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, marginBottom:8 }}>
                        <div><div style={{ color: C.gold, fontFamily:'Bebas Neue, sans-serif', fontSize:18 }}>${(c.total_revenue||0).toLocaleString()}</div><div style={{ color: C.dim, fontSize:9 }}>TOTAL REV</div></div>
                        <div><div style={{ color: C.teal, fontFamily:'Bebas Neue, sans-serif', fontSize:18 }}>{c.loads_given||0}</div><div style={{ color: C.dim, fontSize:9 }}>LOADS</div></div>
                        <div><div style={{ color: C.green, fontFamily:'Bebas Neue, sans-serif', fontSize:18 }}>${(c.avg_rate||0).toLocaleString()}</div><div style={{ color: C.dim, fontSize:9 }}>AVG RATE</div></div>
                      </div>
                    )}
                    {/* Insurance fields */}
                    {c.contact_type === 'Insurance' && c.policy_number && (
                      <div style={{ fontSize:10, color: C.dim, marginBottom:8 }}>
                        <div>Policy: <span style={{ color: C.text }}>{c.policy_number}</span></div>
                        <div>Expires: <span style={{ color: c.policy_expires && new Date(c.policy_expires) < new Date(Date.now()+90*24*60*60*1000) ? C.amber : C.green }}>{c.policy_expires}</span></div>
                        {c.coverage_amount && <div>Coverage: <span style={{ color: C.text }}>{c.coverage_amount}</span></div>}
                      </div>
                    )}
                    {/* Linked loads */}
                    {loadsForContact.length > 0 && (
                      <div style={{ fontSize:10, color: C.dim, marginBottom:8 }}>
                        🔗 {loadsForContact.length} linked load{loadsForContact.length!==1?'s':''} · Last: {c.last_contact}
                      </div>
                    )}
                    {c.notes && <div style={{ color: C.dim, fontSize:10, fontStyle:'italic' }}>{c.notes}</div>}
                    {isSelected && (
                      <div style={{ display:'flex', gap:6, marginTop:12, flexWrap:'wrap' }}>
                        <button onClick={e=>{e.stopPropagation(); setCommsOpen(c.company_name); setTab('comms');}} style={actionBtn(C.purple)}>💬 Quantum Comms</button>
                        <button onClick={e=>{e.stopPropagation(); setFilterStatus('All'); setTab('loads');}} style={actionBtn(C.amber)}>View Loads</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ══════════════ INSURANCE TAB ══════════════ */}
        {tab === 'insurance' && (
          <div>
            <div style={{ color: C.green, fontSize:10, letterSpacing:2, fontWeight:700, marginBottom:16 }}>INSURANCE INTELLIGENCE — ALL POLICIES INDEXED</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:14, marginBottom:24 }}>
              {contacts.filter(c => c.contact_type === 'Insurance').map(ins => {
                const daysLeft = ins.policy_expires ? Math.ceil((new Date(ins.policy_expires)-new Date())/(1000*60*60*24)) : null;
                const urgency = daysLeft !== null ? (daysLeft < 30 ? C.red : daysLeft < 90 ? C.amber : C.green) : C.dim;
                return (
                  <div key={ins.id} style={{ background: C.card, border:`2px solid ${urgency}44`, borderRadius:12, padding:18 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                      <div>
                        <div style={{ color: C.green, fontSize:10, letterSpacing:1, fontWeight:700 }}>🛡️ INSURANCE</div>
                        <div style={{ fontWeight:700, fontSize:15, color:'#fff', marginTop:4 }}>{ins.company_name}</div>
                        {ins.contact_name && <div style={{ color: C.dim, fontSize:11 }}>{ins.contact_name}</div>}
                      </div>
                      {daysLeft !== null && (
                        <div style={{ textAlign:'right' }}>
                          <div style={{ color: urgency, fontFamily:'Bebas Neue, sans-serif', fontSize:28, lineHeight:1 }}>{daysLeft}</div>
                          <div style={{ color: C.dim, fontSize:9 }}>DAYS LEFT</div>
                        </div>
                      )}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                      {[
                        ['Policy #', ins.policy_number], ['Expires', ins.policy_expires],
                        ['Coverage', ins.coverage_amount], ['Contact', ins.phone],
                        ['Portal', ins.platform], ['Rating', ins.rating ? `⭐ ${ins.rating}` : '—'],
                      ].map(([k,v]) => v && (
                        <div key={k}><div style={{ color: C.dim, fontSize:9, letterSpacing:1 }}>{k.toUpperCase()}</div><div style={{ color: urgency===C.red && k==='Expires' ? C.red : C.text, fontSize:12, marginTop:2 }}>{v}</div></div>
                      ))}
                    </div>
                    {ins.notes && <div style={{ color: C.dim, fontSize:10, fontStyle:'italic', marginBottom:10 }}>{ins.notes}</div>}
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => { setCommsOpen(ins.company_name); setTab('comms'); }} style={actionBtn(C.purple)}>💬 Contact Insurer</button>
                    </div>
                  </div>
                );
              })}
              {contacts.filter(c => c.contact_type === 'Insurance').length === 0 && (
                <div style={{ color: C.dim, padding:40, textAlign:'center' }}>
                  No insurers indexed yet.<br/>
                  <button onClick={() => { setNewContact(p=>({...p, contact_type:'Insurance'})); setShowAddContact(true); setTab('contacts'); }} style={{ ...actionBtn(C.green), marginTop:12 }}>Add Insurer</button>
                </div>
              )}
            </div>
            {/* Insurance on loads */}
            <div style={{ color: C.amber, fontSize:10, letterSpacing:2, fontWeight:700, marginBottom:12 }}>INSURANCE STATUS — ACTIVE LOADS</div>
            <div style={{ display:'grid', gap:8 }}>
              {loads.map(l => (
                <div key={l.id} style={{ background: C.card, border:`1px solid ${l.insurance_verified==='Yes' ? C.green+'44' : C.amber+'44'}`, borderRadius:8, padding:'12px 14px', display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background: l.insurance_verified==='Yes' ? C.green : C.amber, flexShrink:0 }} />
                  <div style={{ flex:1 }}><span style={{ fontWeight:700, fontSize:13 }}>{l.origin_city} → {l.dest_city}</span><span style={{ color: C.dim, fontSize:11, marginLeft:10 }}>{l.shipper}</span></div>
                  <div style={{ color: l.insurance_verified==='Yes' ? C.green : C.amber, fontSize:11, fontWeight:700 }}>🛡️ {l.insurance_verified}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════ QUANTUM COMMS ══════════════ */}
        {tab === 'comms' && (
          <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:16, height:'calc(100vh - 220px)' }}>
            {/* Contact list */}
            <div style={{ background: C.card, border:`1px solid ${C.border}`, borderRadius:10, overflow:'auto' }}>
              <div style={{ padding:'12px 14px', borderBottom:`1px solid ${C.border}`, color: C.gold, fontSize:10, letterSpacing:2, fontWeight:700 }}>CONTACT BANK</div>
              {contacts.map(c => (
                <div key={c.id} onClick={() => setCommsOpen(c.company_name)}
                  style={{ padding:'10px 14px', borderBottom:`1px solid ${C.border}`, cursor:'pointer', background: commsOpen===c.company_name ? C.card2 : 'transparent', borderLeft: commsOpen===c.company_name ? `3px solid ${C.gold}` : '3px solid transparent', display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background: typeColor(c.contact_type), flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color: C.text }}>{c.company_name}</div>
                    <div style={{ fontSize:9, color: C.dim }}>{c.contact_type} · {c.platform}</div>
                  </div>
                  {(commsLog[c.company_name]||[]).length > 0 && (
                    <div style={{ marginLeft:'auto', background: C.gold, color:'#000', borderRadius:'50%', width:16, height:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700 }}>{commsLog[c.company_name].length}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat window */}
            <div style={{ background: C.card, border:`1px solid ${C.border}`, borderRadius:10, display:'flex', flexDirection:'column', overflow:'hidden' }}>
              {commsOpen ? (
                <>
                  <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background: C.green }} />
                    <div style={{ color:'#fff', fontWeight:700, fontSize:13 }}>{commsOpen}</div>
                    {(() => { const c = contacts.find(x => x.company_name===commsOpen); return c ? <span style={{ color: C.dim, fontSize:10 }}>{c.contact_type} · {c.phone || 'No phone'} · {c.platform}</span> : null; })()}
                  </div>
                  <div style={{ flex:1, overflow:'auto', padding:16, display:'flex', flexDirection:'column', gap:10 }}>
                    {(commsLog[commsOpen]||[]).length === 0 && (
                      <div style={{ textAlign:'center', color: C.dim, paddingTop:40, fontSize:12 }}>
                        Start a quantum communication with {commsOpen}<br/>
                        <span style={{ fontSize:10 }}>All messages are logged and indexed to this contact's profile</span>
                      </div>
                    )}
                    {(commsLog[commsOpen]||[]).map((m,i) => (
                      <div key={i} style={{ display:'flex', justifyContent: m.from==='you' ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth:'70%', background: m.from==='you' ? C.gold+'22' : C.card2, border:`1px solid ${m.from==='you' ? C.gold+'44' : C.border}`, borderRadius:8, padding:'8px 12px' }}>
                          <div style={{ fontSize:12, color: C.text }}>{m.text}</div>
                          <div style={{ fontSize:9, color: C.dim, marginTop:4, textAlign: m.from==='you'?'right':'left' }}>{m.from==='you'?'YOU':'CONTACT'} · {m.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding:12, borderTop:`1px solid ${C.border}`, display:'flex', gap:8 }}>
                    <input value={commsMsg} onChange={e => setCommsMsg(e.target.value)}
                      onKeyDown={e => e.key==='Enter' && sendComms(commsOpen)}
                      placeholder={`Message ${commsOpen}…`}
                      style={{ flex:1, background:'#060f18', border:`1px solid ${C.border}`, color: C.text, padding:'10px 14px', borderRadius:6, fontSize:12, fontFamily:'inherit' }} />
                    <button onClick={() => sendComms(commsOpen)}
                      style={{ background: C.gold, color:'#000', border:'none', padding:'10px 18px', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit' }}>SEND</button>
                  </div>
                </>
              ) : (
                <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color: C.dim, fontSize:13 }}>
                  Select a contact to start communicating
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── A2P STATUS TAB ── */}
        {tab === 'a2p' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ background:`linear-gradient(135deg, ${C.gold}10, rgba(0,212,255,0.06))`, border:`1px solid ${C.gold}33`, borderRadius:16, padding:'24px 28px', display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
              <div style={{ fontSize:40 }}>📱</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:20, fontWeight:900, color:C.gold, fontFamily:'Bebas Neue, sans-serif', letterSpacing:3, marginBottom:6 }}>A2P MESSAGING COMPLIANCE</div>
                <div style={{ fontSize:13, color:C.dim, lineHeight:1.6 }}>Every text Signal Sam sends must be registered under A2P 10DLC. THE GOAT monitors every campaign and alerts you the moment anything needs attention.</div>
              </div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <a href="/a2p" style={{ padding:'12px 24px', borderRadius:10, background:C.gold, color:'#000', fontWeight:900, fontSize:13, textDecoration:'none', fontFamily:'Bebas Neue, sans-serif', letterSpacing:2 }}>MANAGE REGISTRATIONS</a>
                <a href="/fleet-voice" style={{ padding:'12px 20px', borderRadius:10, background:'rgba(0,212,255,0.12)', border:'1px solid rgba(0,212,255,0.3)', color:'#00d4ff', fontWeight:700, fontSize:13, textDecoration:'none', fontFamily:'Bebas Neue, sans-serif', letterSpacing:2 }}>FLEET VOICE</a>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:14 }}>
              {[
                { label:'Brand Registration', status:'Required', icon:'🏢', color:C.gold },
                { label:'Driver Alerts', status:'Register', icon:'🚨', color:'#00d4ff' },
                { label:'Load Notifications', status:'Register', icon:'📦', color:C.green },
                { label:'Safety Alerts', status:'Register', icon:'⚠️', color:'#f59e0b' },
                { label:'Payroll', status:'Optional', icon:'💰', color:'#a78bfa' },
                { label:'Emergency', status:'Optional', icon:'🚑', color:C.red },
              ].map(item => (
                <div key={item.label} style={{ background:C.card, border:`1px solid ${item.color}33`, borderRadius:14, padding:18 }}>
                  <div style={{ fontSize:28, marginBottom:10 }}>{item.icon}</div>
                  <div style={{ fontWeight:800, fontSize:13, color:C.text, marginBottom:8, fontFamily:'Bebas Neue, sans-serif', letterSpacing:1 }}>{item.label}</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, background:`${item.color}22`, color:item.color }}>{item.status}</span>
                    <a href="/a2p" style={{ fontSize:11, color:item.color, textDecoration:'none', fontWeight:700 }}>Register</a>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:10 }}>
              {[
                { label:'A2P Registration', href:'/a2p', color:C.gold },
                { label:'Fleet Voice', href:'/fleet-voice', color:'#00d4ff' },
                { label:'API Keys', href:'/twilio-setup', color:'#a78bfa' },
                { label:'Privacy Policy', href:'/privacy', color:C.green },
              ].map(link => (
                <a key={link.label} href={link.href} style={{ display:'block', padding:'14px 16px', borderRadius:10, background:`${link.color}11`, border:`1px solid ${link.color}33`, color:link.color, fontWeight:700, fontSize:12, textDecoration:'none', textAlign:'center', fontFamily:'Bebas Neue, sans-serif', letterSpacing:1 }}>{link.label}</a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════ ADD CONTACT MODAL ══════════════ */}
      {showAddContact && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
          <div style={{ background: C.panel, border:`2px solid ${C.gold}`, borderRadius:14, padding:24, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ color: C.gold, fontFamily:'Bebas Neue, sans-serif', fontSize:18, letterSpacing:3, marginBottom:16 }}>ADD CONTACT TO NEXUS</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ display:'block', color: C.dim, fontSize:10, letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>Contact Type</label>
                <select value={newContact.contact_type} onChange={e => setNewContact(p=>({...p, contact_type:e.target.value}))}
                  style={{ width:'100%', background:'#060f18', border:`1px solid ${C.border}`, color: C.text, padding:'9px 12px', borderRadius:6, fontSize:13, boxSizing:'border-box', fontFamily:'inherit' }}>
                  {CONTACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <Input label="Company Name *" value={newContact.company_name} onChange={e=>setNewContact(p=>({...p,company_name:e.target.value}))} placeholder="Walmart Distribution" span />
              <Input label="Contact Name"   value={newContact.contact_name} onChange={e=>setNewContact(p=>({...p,contact_name:e.target.value}))} placeholder="James Lee" />
              <Input label="Phone"          value={newContact.phone}        onChange={e=>setNewContact(p=>({...p,phone:e.target.value}))}        placeholder="816-555-0123" />
              <Input label="Email"          value={newContact.email}        onChange={e=>setNewContact(p=>({...p,email:e.target.value}))}        placeholder="contact@company.com" span />
              <div>
                <label style={{ display:'block', color: C.dim, fontSize:10, letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>Platform / Integration</label>
                <select value={newContact.platform} onChange={e=>setNewContact(p=>({...p,platform:e.target.value}))}
                  style={{ width:'100%', background:'#060f18', border:`1px solid ${C.border}`, color: C.text, padding:'9px 12px', borderRadius:6, fontSize:13, boxSizing:'border-box', fontFamily:'inherit' }}>
                  <option value="">Select…</option>
                  {(PLATFORM_MAP[newContact.contact_type]||[]).map(pl=><option key={pl} value={pl}>{pl}</option>)}
                </select>
              </div>
              <Input label="Payment Terms"  value={newContact.payment_terms} onChange={e=>setNewContact(p=>({...p,payment_terms:e.target.value}))} placeholder="30 days" />
              {newContact.contact_type === 'Insurance' && <>
                <Input label="Policy Number"   value={newContact.policy_number}   onChange={e=>setNewContact(p=>({...p,policy_number:e.target.value}))}   placeholder="GWC-4821-TX" />
                <Input label="Policy Expires"  value={newContact.policy_expires}  onChange={e=>setNewContact(p=>({...p,policy_expires:e.target.value}))}  placeholder="2026-12-31" />
                <Input label="Coverage Amount" value={newContact.coverage_amount} onChange={e=>setNewContact(p=>({...p,coverage_amount:e.target.value}))} placeholder="$1M Primary Liability" span />
              </>}
              <Input label="Notes" value={newContact.notes} onChange={e=>setNewContact(p=>({...p,notes:e.target.value}))} placeholder="Any notes about this contact…" span />
            </div>
            <div style={{ display:'flex', gap:8, marginTop:16 }}>
              <button onClick={() => setShowAddContact(false)} style={{ flex:1, background:'transparent', border:`1px solid ${C.border}`, color: C.dim, padding:'10px', borderRadius:6, cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>Cancel</button>
              <button onClick={saveContact} disabled={saving} style={{ flex:2, background: C.gold, color:'#000', border:'none', padding:'10px', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'inherit' }}>{saving ? 'Saving…' : 'Add to Nexus'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ ADD LOAD MODAL ══════════════ */}
      {showAddLoad && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
          <div style={{ background: C.panel, border:`2px solid ${C.green}`, borderRadius:14, padding:24, width:'100%', maxWidth:540, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ color: C.green, fontFamily:'Bebas Neue, sans-serif', fontSize:18, letterSpacing:3, marginBottom:16 }}>ADD LOAD TO NEXUS INDEX</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>
                <label style={{ display:'block', color: C.dim, fontSize:10, letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>Source</label>
                <select value={newLoad.source} onChange={e=>setNewLoad(p=>({...p,source:e.target.value}))}
                  style={{ width:'100%', background:'#060f18', border:`1px solid ${C.border}`, color: C.text, padding:'9px 12px', borderRadius:6, fontSize:13, boxSizing:'border-box', fontFamily:'inherit' }}>
                  {SOURCES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', color: C.dim, fontSize:10, letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>Equipment</label>
                <select value={newLoad.equipment} onChange={e=>setNewLoad(p=>({...p,equipment:e.target.value}))}
                  style={{ width:'100%', background:'#060f18', border:`1px solid ${C.border}`, color: C.text, padding:'9px 12px', borderRadius:6, fontSize:13, boxSizing:'border-box', fontFamily:'inherit' }}>
                  {EQUIPMENT.map(eq=><option key={eq} value={eq}>{eq}</option>)}
                </select>
              </div>
              <Input label="Shipper *"        value={newLoad.shipper}        onChange={e=>setNewLoad(p=>({...p,shipper:e.target.value}))}        placeholder="Walmart Distribution" span />
              <Input label="Shipper Phone"    value={newLoad.shipper_phone}  onChange={e=>setNewLoad(p=>({...p,shipper_phone:e.target.value}))}  placeholder="816-555-0123" />
              <Input label="Broker (if any)"  value={newLoad.broker}         onChange={e=>setNewLoad(p=>({...p,broker:e.target.value}))}         placeholder="CH Robinson" />
              <Input label="Origin City"      value={newLoad.origin_city}    onChange={e=>setNewLoad(p=>({...p,origin_city:e.target.value}))}    placeholder="Dallas" />
              <Input label="Origin State"     value={newLoad.origin_state}   onChange={e=>setNewLoad(p=>({...p,origin_state:e.target.value}))}   placeholder="TX" />
              <Input label="Dest City"        value={newLoad.dest_city}      onChange={e=>setNewLoad(p=>({...p,dest_city:e.target.value}))}      placeholder="Chicago" />
              <Input label="Dest State"       value={newLoad.dest_state}     onChange={e=>setNewLoad(p=>({...p,dest_state:e.target.value}))}     placeholder="IL" />
              <Input label="Miles"            value={newLoad.miles}          onChange={e=>setNewLoad(p=>({...p,miles:e.target.value}))}          placeholder="500" type="number" />
              <Input label="Rate ($)"         value={newLoad.rate}           onChange={e=>setNewLoad(p=>({...p,rate:e.target.value}))}           placeholder="3200" type="number" />
              <Input label="Rate/Mile"        value={newLoad.rate_per_mile}  onChange={e=>setNewLoad(p=>({...p,rate_per_mile:e.target.value}))}  placeholder="6.40" type="number" />
              <Input label="Weight"           value={newLoad.weight}         onChange={e=>setNewLoad(p=>({...p,weight:e.target.value}))}         placeholder="44,000 lbs" />
              <Input label="Commodity"        value={newLoad.commodity}      onChange={e=>setNewLoad(p=>({...p,commodity:e.target.value}))}      placeholder="Auto Parts" />
              <Input label="Pickup Date"      value={newLoad.pickup_date}    onChange={e=>setNewLoad(p=>({...p,pickup_date:e.target.value}))}    placeholder="Today 08:00" />
              <Input label="Delivery Date"    value={newLoad.delivery_date}  onChange={e=>setNewLoad(p=>({...p,delivery_date:e.target.value}))}  placeholder="Tomorrow 18:00" />
              <Input label="Assigned Driver"  value={newLoad.assigned_driver} onChange={e=>setNewLoad(p=>({...p,assigned_driver:e.target.value}))} placeholder="Ray Davis" />
              <Input label="Assigned Truck"   value={newLoad.assigned_truck}  onChange={e=>setNewLoad(p=>({...p,assigned_truck:e.target.value}))}  placeholder="TRK-441" />
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ display:'block', color: C.dim, fontSize:10, letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>Priority</label>
                <select value={newLoad.priority} onChange={e=>setNewLoad(p=>({...p,priority:e.target.value}))}
                  style={{ width:'100%', background:'#060f18', border:`1px solid ${C.border}`, color: C.text, padding:'9px 12px', borderRadius:6, fontSize:13, boxSizing:'border-box', fontFamily:'inherit' }}>
                  {PRIORITIES.map(pr=><option key={pr} value={pr}>{pr}</option>)}
                </select>
              </div>
              <Input label="Notes" value={newLoad.notes} onChange={e=>setNewLoad(p=>({...p,notes:e.target.value}))} placeholder="Special requirements…" span />
            </div>
            <div style={{ display:'flex', gap:8, marginTop:16 }}>
              <button onClick={() => setShowAddLoad(false)} style={{ flex:1, background:'transparent', border:`1px solid ${C.border}`, color: C.dim, padding:'10px', borderRadius:6, cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>Cancel</button>
              <button onClick={saveLoad} disabled={saving} style={{ flex:2, background: C.green, color:'#000', border:'none', padding:'10px', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'inherit' }}>{saving ? 'Saving…' : 'Index This Load'}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        input:focus, select:focus, textarea:focus { outline:none; border-color: ${C.gold} !important; }
        ::-webkit-scrollbar { width:5px } ::-webkit-scrollbar-track { background:#050a0f } ::-webkit-scrollbar-thumb { background:#1a2a3a; border-radius:3px }
        select option { background:#050a0f }
      `}</style>
    </div>
  );
}

function actionBtn(color) {
  return { background: color, color: ['#c9a84c','#ffab00','#00e676'].includes(color) ? '#000' : '#fff', border:'none', padding:'7px 14px', borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:"'IBM Plex Mono', monospace" };
}
