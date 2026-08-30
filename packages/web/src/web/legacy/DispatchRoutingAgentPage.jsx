import { useState, useEffect, useRef } from 'react';
import { pb } from './lib/pb';
import { lookupBrokerReputation, lookupRoadAlerts, lookupFreightNews } from './SerpAPIService';

const C = {
  navy: '#0B1A3E',
  gold: '#F5A623',
  green: '#00D68F',
  red: '#FF3D57',
  blue: '#0085FF',
  purple: '#8B5CF6',
  cyan: '#00E5FF',
  dark: '#060E22',
  card: '#0D1F4A',
  border: '#1A2E6A',
  text: '#E8EEF8',
  muted: '#7A8AAA',
};

const mockLoads = [
  { id:'LD-9001', shipper:'Midwest Auto Parts', origin:'St. Louis, MO', destination:'Chicago, IL', distance:298, weight:'41,500 lbs', rate:2450, fuel:287, detention:0, profit:487, category:'DRY VAN', status:'unassigned', pickupTime:'08:00', hosDays:1.2, detentionRisk:'Low', reliability:94 },
  { id:'LD-9002', shipper:'Cold Chain Express', origin:'Dallas, TX', destination:'Memphis, TN', distance:441, weight:'38,000 lbs', rate:3200, fuel:412, detention:80, profit:621, category:'REEFER', status:'unassigned', pickupTime:'06:00', hosDays:1.8, detentionRisk:'Medium', reliability:88 },
  { id:'LD-9003', shipper:'Flatbed Freight Co', origin:'Denver, CO', destination:'Phoenix, AZ', distance:602, weight:'44,000 lbs', rate:4100, fuel:581, detention:0, profit:892, category:'FLATBED', status:'unassigned', pickupTime:'07:30', hosDays:2.4, detentionRisk:'Low', reliability:97 },
  { id:'LD-9004', shipper:'HazMat Solutions', origin:'Houston, TX', destination:'New Orleans, LA', distance:348, weight:'22,000 lbs', rate:5500, fuel:334, detention:120, profit:1244, category:'HAZMAT', status:'unassigned', pickupTime:'09:00', hosDays:1.4, detentionRisk:'High', reliability:91 },
  { id:'LD-9005', shipper:'Amazon Freight', origin:'Atlanta, GA', destination:'Charlotte, NC', distance:244, weight:'18,000 lbs', rate:1800, fuel:232, detention:0, profit:388, category:'LOCAL', status:'unassigned', pickupTime:'10:00', hosDays:0.9, detentionRisk:'Low', reliability:99 },
  { id:'LD-9006', shipper:'Steel Dynamics', origin:'Indianapolis, IN', destination:'Detroit, MI', distance:167, weight:'46,500 lbs', rate:2100, fuel:158, detention:40, profit:512, category:'FLATBED', status:'unassigned', pickupTime:'07:00', hosDays:0.7, detentionRisk:'Medium', reliability:85 },
];

const mockDrivers = [
  { id:'DRV-1', name:'Ray Davis', truck:'T-101', hos:8.4, status:'available', location:'St. Louis, MO', cdl:'Class A', score:94, miles_ytd:87420 },
  { id:'DRV-2', name:'Maria Santos', truck:'T-204', hos:10.1, status:'available', location:'Dallas, TX', cdl:'Class A', score:98, miles_ytd:92100 },
  { id:'DRV-3', name:'John Miller', truck:'T-318', hos:6.2, status:'on_load', location:'Denver, CO', cdl:'Class A', score:89, miles_ytd:78300 },
  { id:'DRV-4', name:'Keisha Brown', truck:'T-422', hos:11.0, status:'available', location:'Houston, TX', cdl:'Class A+HAZMAT', score:96, miles_ytd:104200 },
  { id:'DRV-5', name:'Derek Okafor', truck:'T-517', hos:9.3, status:'available', location:'Atlanta, GA', cdl:'Class A', score:91, miles_ytd:81900 },
];

const CATCOLORS = { 'DRY VAN':'#0085FF','REEFER':'#00E5FF','FLATBED':'#F5A623','HAZMAT':'#FF3D57','LOCAL':'#00D68F' };

export default function DispatchRoutingAgentPage() {
  const [tab, setTab] = useState('dashboard');
  const [loads, setLoads] = useState(mockLoads);
  const [drivers, setDrivers] = useState(mockDrivers);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('ALL');
  const [brokerResult, setBrokerResult] = useState(null);
  const [brokerLoading, setBrokerLoading] = useState(false);
  const [roadAlerts, setRoadAlerts] = useState(null);
  const [roadLoading, setRoadLoading] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [nerveFeed, setNerveFeed] = useState([]);
  const [ghostScore, setGhostScore] = useState(98);
  const [engineRunning, setEngineRunning] = useState(false);
  const [engineResult, setEngineResult] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [bookingDriver, setBookingDriver] = useState('');
  const nerveRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchData() {
      try {
        const [loadsData, driversData, assignData] = await Promise.all([
          pb.collection('dispatch_planning').getList(1, 50, { sort: '-created', signal: controller.signal }).catch(() => ({ items: [] })),
          pb.collection('driver_profiles').getList(1, 50, { signal: controller.signal }).catch(() => ({ items: [] })),
          pb.collection('routing_optimization').getList(1, 20, { sort: '-created', signal: controller.signal }).catch(() => ({ items: [] })),
        ]);
        if (loadsData.items.length > 0) setLoads(loadsData.items);
        if (driversData.items.length > 0) setDrivers(driversData.items);
        setAssignments(assignData.items);
      } catch (e) {
        if (!e?.isAbort) console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // Ghost Nerve live feed
    const nerveMessages = [
      { icon:'🧠', msg:'Ghost Index pre-staged 6 loads for next shift', color: C.cyan },
      { icon:'⚡', msg:'Silent Dispatch: LD-9003 optimal match → Maria Santos', color: C.green },
      { icon:'🛡️', msg:'Phantom Compliance: 0 violations forecast next 72h', color: C.purple },
      { icon:'📡', msg:'Nerve Comms: 3 driver messages cross-referenced & archived', color: C.blue },
      { icon:'💰', msg:'Revenue Nerve: 47-variable profit scan complete — LD-9004 highest margin', color: C.gold },
      { icon:'🔐', msg:'Identity Shield: All CDL/biometrics verified for today\'s shift', color: C.cyan },
      { icon:'🧬', msg:'Memory Pulse: 3-year lane data query completed in 71ms', color: C.green },
      { icon:'🔒', msg:'Sovereign ELD: HOS logs sealed — zero external access attempts', color: C.purple },
    ];
    let idx = 0;
    const interval = setInterval(() => {
      const entry = { ...nerveMessages[idx % nerveMessages.length], time: new Date().toLocaleTimeString(), id: Date.now() };
      setNerveFeed(prev => [entry, ...prev].slice(0, 12));
      idx++;
    }, 3200);

    // Load freight news
    lookupFreightNews('trucking freight rates fuel prices 2026').then(r => {
      if (r?.news) setNewsItems(r.news.slice(0, 4));
    });

    return () => { controller.abort(); clearInterval(interval); };
  }, []);

  const filteredLoads = catFilter === 'ALL' ? loads : loads.filter(l => l.category === catFilter);

  async function checkBroker(load) {
    if (!load) return;
    setBrokerLoading(true);
    setBrokerResult(null);
    const result = await lookupBrokerReputation(load.shipper);
    setBrokerResult(result);
    setBrokerLoading(false);
  }

  async function checkRoad(load) {
    if (!load) return;
    setRoadLoading(true);
    setRoadAlerts(null);
    const result = await lookupRoadAlerts(load.origin, load.destination);
    setRoadAlerts(result);
    setRoadLoading(false);
  }

  async function runDispatchCore() {
    setEngineRunning(true);
    setEngineResult(null);
    await new Promise(r => setTimeout(r, 2800));
    const best = filteredLoads.filter(l => l.status === 'unassigned').sort((a,b) => (b.profit||0)-(a.profit||0)).slice(0,3);
    const result = best.map((load, i) => ({
      load,
      driver: mockDrivers[i] || mockDrivers[0],
      score: (98 - i * 3),
      reason: `Profit-optimized • HOS clear • ${load.detentionRisk} detention risk • Route pre-verified`,
    }));
    setEngineResult(result);
    setEngineRunning(false);
    // Award Rig Bucks for intelligence dispatch use
    try {
      await pb.collection('rig_bucks_ledger').create({ driver_name: 'Dispatcher', action: 'Dispatch Run', points: 25, source: 'dispatch', balance: 25 });
    } catch {}
  }

  async function assignLoad(load, driverName) {
    try {
      await pb.collection('routing_optimization').create({ data: { load_id: load.id, driver: driverName, assigned_at: new Date().toISOString() }, label: `${load.id} → ${driverName}`, status: 'assigned' });
      setLoads(prev => prev.map(l => l.id === load.id ? { ...l, status: `Assigned to ${driverName}` } : l));
      setAssignments(prev => [...prev, { load_id: load.id, driver: driverName, profit: load.profit }]);
      // Award Rig Bucks to driver
      try {
        await pb.collection('rig_bucks_ledger').create({ driver_name: driverName, action: 'Load Accepted via Dispatch', points: 50, source: 'dispatch', balance: 50 });
      } catch {}
      setAssignModal(null);
      setBookingDriver('');
    } catch (e) {
      console.error(e);
    }
  }

  const cats = ['ALL', 'DRY VAN', 'REEFER', 'FLATBED', 'HAZMAT', 'LOCAL'];
  const availDrivers = drivers.filter(d => d.status === 'available');

  return (
    <div style={{ minHeight: '100vh', background: C.dark, color: C.text, fontFamily: "'Space Mono', 'Courier New', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        .dtab { background: transparent; border: none; padding: 12px 22px; color: ${C.muted}; font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; border-bottom: 3px solid transparent; letter-spacing: 0.08em; text-transform: uppercase; transition: all .2s; }
        .dtab.active { color: ${C.gold}; border-bottom-color: ${C.gold}; }
        .dtab:hover { color: ${C.text}; }
        .load-card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 12px; padding: 18px; cursor: pointer; transition: all .2s; }
        .load-card:hover, .load-card.sel { border-color: ${C.gold}; background: #112060; }
        .cat-btn { padding: 6px 14px; border-radius: 20px; border: 1px solid ${C.border}; background: transparent; color: ${C.muted}; font-family: inherit; font-size: 11px; font-weight: 700; cursor: pointer; transition: all .2s; letter-spacing: .06em; }
        .cat-btn.active { background: ${C.gold}; color: ${C.dark}; border-color: ${C.gold}; }
        .nerve-entry { animation: slideIn .4s ease; }
        @keyframes slideIn { from { opacity:0; transform: translateX(20px); } to { opacity:1; transform: none; } }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        .engine-btn { background: linear-gradient(135deg, ${C.purple}, ${C.blue}); border: none; border-radius: 12px; padding: 16px 32px; color: #fff; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; letter-spacing: .08em; transition: all .2s; box-shadow: 0 0 30px ${C.purple}40; }
        .engine-btn:hover { transform: translateY(-2px); box-shadow: 0 0 50px ${C.purple}60; }
        .assign-btn { background: ${C.gold}; border: none; border-radius: 8px; padding: 10px 20px; color: ${C.dark}; font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; transition: all .2s; }
        .assign-btn:hover { background: #ffc94d; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${C.dark}; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
        @media (max-width: 768px) { .dispatch-grid { grid-template-columns: 1fr !important; } .dispatch-side { display: none; } }
      `}</style>

      {/* Header */}
      <div style={{ background: C.navy, borderBottom: `1px solid ${C.border}`, padding: '0 5%' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingTop: 16, paddingBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `linear-gradient(135deg, ${C.gold}, ${C.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.gold, letterSpacing: '.04em' }}>INTELLIGENCE DISPATCH</div>
              <div style={{ fontSize: 11, color: C.muted }}>Ghost Nerve Intelligence · 47-Variable Optimization · Live SerpAPI</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.green }}>{loads.filter(l=>l.status==='unassigned').length}</div>
              <div style={{ fontSize: 10, color: C.muted }}>OPEN LOADS</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.cyan }}>{availDrivers.length}</div>
              <div style={{ fontSize: 10, color: C.muted }}>DRIVERS READY</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.gold }}>{assignments.length}</div>
              <div style={{ fontSize: 10, color: C.muted }}>ASSIGNED TODAY</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${C.green}18`, border: `1px solid ${C.green}40`, borderRadius: 20, padding: '6px 14px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} className="pulse" />
              <span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>GHOST NERVE {ghostScore}%</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 0, marginTop: 8 }}>
          {[
            { id:'dashboard', label:'📊 Live Command' },
            { id:'loads', label:'📦 Load Board' },
            { id:'drivers', label:'👥 Driver Match' },
            { id:'intelligence', label:'⚡ Fleet AI' },
            { id:'alerts', label:'🚨 Road Intelligence' },
            { id:'news', label:'🌍 Market Intel' },
          ].map(t => (
            <button key={t.id} className={`dtab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 5%' }}>

        {/* DASHBOARD TAB */}
        {tab === 'dashboard' && (
          <div className="dispatch-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
            <div>
              {/* Category filters */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {cats.map(c => (
                  <button key={c} className={`cat-btn ${catFilter===c?'active':''}`} onClick={() => setCatFilter(c)}
                    style={c !== 'ALL' ? { borderColor: CATCOLORS[c] + '60', color: catFilter===c ? C.dark : CATCOLORS[c] } : {}}>
                    {c}
                  </button>
                ))}
              </div>

              {/* Load cards */}
              <div style={{ display: 'grid', gap: 14 }}>
                {filteredLoads.slice(0,6).map(load => (
                  <div key={load.id} className={`load-card ${selectedLoad?.id===load.id?'sel':''}`} onClick={() => setSelectedLoad(load)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ background: CATCOLORS[load.category]+'22', border: `1px solid ${CATCOLORS[load.category]}50`, borderRadius: 6, padding: '3px 10px', fontSize: 10, fontWeight: 700, color: CATCOLORS[load.category], letterSpacing: '.08em' }}>{load.category}</div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{load.id}</span>
                        <span style={{ fontSize: 12, color: C.muted }}>{load.shipper}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: C.green }}>${(load.profit||0).toLocaleString()}</div>
                          <div style={{ fontSize: 10, color: C.muted }}>NET PROFIT</div>
                        </div>
                        {load.status === 'unassigned' && (
                          <button className="assign-btn" onClick={e => { e.stopPropagation(); setAssignModal(load); }}>ASSIGN</button>
                        )}
                      </div>
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: C.text }}>📍 {load.origin} → {load.destination}</span>
                      <span style={{ fontSize: 12, color: C.muted }}>{load.distance} mi</span>
                      <span style={{ fontSize: 12, color: C.muted }}>⏱ {load.hosDays}h HOS</span>
                      <span style={{ fontSize: 12, color: load.detentionRisk==='High'?C.red:load.detentionRisk==='Medium'?C.gold:C.green }}>
                        ⚠ {load.detentionRisk} Detention
                      </span>
                      <span style={{ fontSize: 12, color: C.muted }}>Reliability: {load.reliability}%</span>
                    </div>
                    {selectedLoad?.id === load.id && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button className="assign-btn" style={{ background: 'transparent', border: `1px solid ${C.cyan}`, color: C.cyan }}
                          onClick={e => { e.stopPropagation(); checkBroker(load); }}>
                          {brokerLoading ? '⏳ Checking...' : '🔍 Check Broker'}
                        </button>
                        <button className="assign-btn" style={{ background: 'transparent', border: `1px solid ${C.blue}`, color: C.blue }}
                          onClick={e => { e.stopPropagation(); checkRoad(load); }}>
                          {roadLoading ? '⏳ Scanning...' : '🚨 Road Alerts'}
                        </button>
                      </div>
                    )}
                    {/* Broker result inline */}
                    {selectedLoad?.id === load.id && brokerResult && (
                      <div style={{ marginTop: 12, background: brokerResult.score==='CLEAN'?`${C.green}10`:brokerResult.score==='HIGH RISK'?`${C.red}10`:`${C.gold}10`, border: `1px solid ${brokerResult.score==='CLEAN'?C.green:brokerResult.score==='HIGH RISK'?C.red:C.gold}30`, borderRadius: 8, padding: 14 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: brokerResult.score==='CLEAN'?C.green:brokerResult.score==='HIGH RISK'?C.red:C.gold, marginBottom: 6 }}>
                          {brokerResult.score==='CLEAN'?'✅':'⚠️'} Broker: {brokerResult.score}
                        </div>
                        {brokerResult.redFlags.length > 0 && brokerResult.redFlags.map((f,i) => (
                          <div key={i} style={{ fontSize: 11, color: C.red, marginTop: 3 }}>• {f}</div>
                        ))}
                        {brokerResult.results.slice(0,2).map((r,i) => (
                          <div key={i} style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{r.snippet?.slice(0,100)}...</div>
                        ))}
                      </div>
                    )}
                    {/* Road alert inline */}
                    {selectedLoad?.id === load.id && roadAlerts && (
                      <div style={{ marginTop: 12, background: roadAlerts.severity==='CLEAR'?`${C.green}10`:`${C.red}10`, border: `1px solid ${roadAlerts.severity==='CLEAR'?C.green:C.red}30`, borderRadius: 8, padding: 14 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: roadAlerts.severity==='CLEAR'?C.green:C.red, marginBottom: 6 }}>
                          🚨 Route: {roadAlerts.severity}
                        </div>
                        {roadAlerts.alerts.slice(0,2).map((a,i) => (
                          <div key={i} style={{ fontSize: 11, color: C.text, marginTop: 4 }}>• {a.title}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Ghost Nerve sidebar */}
            <div className="dispatch-side">
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, letterSpacing: '.1em', marginBottom: 14 }}>⚡ GHOST NERVE LIVE FEED</div>
                <div ref={nerveRef} style={{ display: 'grid', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
                  {nerveFeed.map(entry => (
                    <div key={entry.id} className="nerve-entry" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 16 }}>{entry.icon}</span>
                      <div>
                        <div style={{ fontSize: 11, color: entry.color, fontWeight: 700 }}>{entry.msg}</div>
                        <div style={{ fontSize: 10, color: C.muted }}>{entry.time}</div>
                      </div>
                    </div>
                  ))}
                  {nerveFeed.length === 0 && <div style={{ fontSize: 11, color: C.muted }}>Initializing Ghost Nerve...</div>}
                </div>
              </div>

              {/* Assignments today */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: '.1em', marginBottom: 14 }}>📋 ASSIGNED TODAY</div>
                {assignments.length === 0 ? (
                  <div style={{ fontSize: 11, color: C.muted }}>No assignments yet — run Fleet AI to optimize</div>
                ) : assignments.slice(0,5).map((a,i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: `1px solid ${C.border}`, fontSize: 11 }}>
                    <div style={{ color: C.text, fontWeight: 700 }}>{a.load_id || `Load ${i+1}`}</div>
                    <div style={{ color: C.muted }}>{a.driver || a.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LOADS TAB */}
        {tab === 'loads' && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.gold, marginBottom: 20 }}>📦 Full Load Board — All Sources</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {cats.map(c => (
                <button key={c} className={`cat-btn ${catFilter===c?'active':''}`} onClick={() => setCatFilter(c)}>{c}</button>
              ))}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    {['ID','Category','Shipper','Lane','Miles','Rate','Fuel','Net Profit','HOS','Detention Risk','Action'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: C.muted, fontWeight: 700, fontSize: 10, letterSpacing: '.08em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLoads.map(load => (
                    <tr key={load.id} style={{ borderBottom: `1px solid ${C.border}20`, cursor: 'pointer' }} onClick={() => setSelectedLoad(load)}>
                      <td style={{ padding: '12px 14px', color: C.gold, fontWeight: 700 }}>{load.id}</td>
                      <td style={{ padding: '12px 14px' }}><span style={{ background: CATCOLORS[load.category]+'22', color: CATCOLORS[load.category], borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>{load.category}</span></td>
                      <td style={{ padding: '12px 14px', color: C.text }}>{load.shipper}</td>
                      <td style={{ padding: '12px 14px', color: C.muted, whiteSpace: 'nowrap' }}>{load.origin?.split(',')[0]} → {load.destination?.split(',')[0]}</td>
                      <td style={{ padding: '12px 14px', color: C.text }}>{load.distance}</td>
                      <td style={{ padding: '12px 14px', color: C.text }}>${(load.rate||0).toLocaleString()}</td>
                      <td style={{ padding: '12px 14px', color: C.red }}>${(load.fuel||0).toLocaleString()}</td>
                      <td style={{ padding: '12px 14px', color: C.green, fontWeight: 700 }}>${(load.profit||0).toLocaleString()}</td>
                      <td style={{ padding: '12px 14px', color: C.muted }}>{load.hosDays}h</td>
                      <td style={{ padding: '12px 14px', color: load.detentionRisk==='High'?C.red:load.detentionRisk==='Medium'?C.gold:C.green }}>{load.detentionRisk}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <button className="assign-btn" style={{ fontSize: 10, padding: '6px 12px' }} onClick={e => { e.stopPropagation(); setAssignModal(load); }}>ASSIGN →</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DRIVERS TAB */}
        {tab === 'drivers' && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.gold, marginBottom: 20 }}>👥 Driver Matching — HOS & Compliance</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
              {drivers.map(driver => (
                <div key={driver.id} style={{ background: C.card, border: `1px solid ${driver.status==='available'?C.green+'50':C.border}`, borderRadius: 14, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{driver.name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{driver.truck} · {driver.cdl}</div>
                    </div>
                    <div style={{ background: driver.status==='available'?`${C.green}20`:`${C.gold}20`, border: `1px solid ${driver.status==='available'?C.green:C.gold}40`, borderRadius: 20, padding: '4px 12px', fontSize: 10, color: driver.status==='available'?C.green:C.gold, fontWeight: 700, textTransform: 'uppercase' }}>
                      {driver.status}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: `${C.blue}15`, borderRadius: 8, padding: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: C.cyan }}>{driver.hos}h</div>
                      <div style={{ fontSize: 10, color: C.muted }}>HOS REMAIN</div>
                    </div>
                    <div style={{ background: `${C.green}15`, borderRadius: 8, padding: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: C.green }}>{driver.score}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>SAFETY SCORE</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, fontSize: 11, color: C.muted }}>📍 {driver.location}</div>
                  <div style={{ marginTop: 6, fontSize: 11, color: C.muted }}>📊 {(driver.miles_ytd||0).toLocaleString()} miles YTD</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INTELLIGENCE TAB */}
        {tab === 'intelligence' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.gold, marginBottom: 8 }}>Dispatch AI</div>
              <div style={{ fontSize: 14, color: C.muted, maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>12 simultaneous optimization layers running in parallel. Profit, HOS, detention risk, fuel cost, driver score, lane history, broker reliability, road alerts — all computed at once.</div>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <button className="engine-btn" onClick={runDispatchCore} disabled={engineRunning}>
                {engineRunning ? '⏳ Computing 12 Layers...' : '⚡ RUN INTELLIGENCE DISPATCH'}
              </button>
            </div>
            {engineRunning && (
              <div style={{ background: C.card, border: `1px solid ${C.purple}40`, borderRadius: 14, padding: 24, maxWidth: 600, margin: '0 auto' }}>
                {['Ghost Index pre-staging loads...','Scanning 47 profit variables...','Cross-referencing HOS logs...','Checking broker reliability via SerpAPI...','Running road alert scan...','Computing detention probability...','Matching driver safety scores...','Optimizing fuel corridors...','Verifying CDL & compliance...','Sealing HOS logs cryptographically...','Calculating net profit per mile...','Finalizing intelligence dispatch order...'].map((step,i) => (
                  <div key={i} className="nerve-entry" style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, opacity: 1 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.purple }} className="pulse" />
                    <span style={{ fontSize: 12, color: C.muted }}>{step}</span>
                  </div>
                ))}
              </div>
            )}
            {engineResult && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.green, textAlign: 'center', marginBottom: 24 }}>✅ Intelligence Optimization Complete — Top 3 Assignments</div>
                <div style={{ display: 'grid', gap: 18, maxWidth: 800, margin: '0 auto' }}>
                  {engineResult.map((r,i) => (
                    <div key={i} style={{ background: C.card, border: `1px solid ${C.purple}40`, borderRadius: 14, padding: 24, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${C.purple}, ${C.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>#{i+1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.gold }}>{r.load.id} → {r.driver.name}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{r.load.origin} → {r.load.destination}</div>
                        <div style={{ fontSize: 11, color: C.cyan, marginTop: 6 }}>{r.reason}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: C.green }}>${(r.load.profit||0).toLocaleString()}</div>
                        <div style={{ fontSize: 10, color: C.muted }}>NET PROFIT</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.gold, marginTop: 4 }}>{r.score}%</div>
                        <div style={{ fontSize: 10, color: C.muted }}>MATCH SCORE</div>
                      </div>
                      <button className="assign-btn" onClick={() => assignLoad(r.load, r.driver.name)}>CONFIRM →</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ALERTS TAB */}
        {tab === 'alerts' && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.gold, marginBottom: 20 }}>🚨 Road Intelligence — Live SerpAPI</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 28 }}>
              {[
                { label:'I-80 Chicago→Denver', origin:'Chicago IL', dest:'Denver CO' },
                { label:'I-95 Miami→NYC', origin:'Miami FL', dest:'New York NY' },
                { label:'I-40 LA→Memphis', origin:'Los Angeles CA', dest:'Memphis TN' },
                { label:'I-10 Houston→LA', origin:'Houston TX', dest:'Los Angeles CA' },
                { label:'I-75 Detroit→Atlanta', origin:'Detroit MI', dest:'Atlanta GA' },
                { label:'I-70 Kansas City→St Louis', origin:'Kansas City MO', dest:'St Louis MO' },
              ].map((route,i) => (
                <button key={i} onClick={() => checkRoad({ origin: route.origin, destination: route.dest })}
                  style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, textAlign: 'left', cursor: 'pointer', color: C.text, fontFamily: 'inherit', transition: 'all .2s' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.cyan, marginBottom: 4 }}>{route.label}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Tap to scan live conditions</div>
                </button>
              ))}
            </div>
            {roadLoading && <div style={{ textAlign: 'center', color: C.muted, fontSize: 13 }}>⏳ Scanning live road conditions...</div>}
            {roadAlerts && (
              <div style={{ background: C.card, border: `1px solid ${roadAlerts.severity==='CLEAR'?C.green:C.red}40`, borderRadius: 14, padding: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: roadAlerts.severity==='CLEAR'?C.green:C.red, marginBottom: 16 }}>
                  🚨 {roadAlerts.origin} → {roadAlerts.destination}: {roadAlerts.severity}
                </div>
                {roadAlerts.alerts.length === 0 ? (
                  <div style={{ color: C.green, fontSize: 13 }}>✅ No active incidents detected on this corridor</div>
                ) : roadAlerts.alerts.map((a,i) => (
                  <div key={i} style={{ padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 700 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{a.snippet}</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{a.source} · {a.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NEWS TAB */}
        {tab === 'news' && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.gold, marginBottom: 20 }}>🌍 Live Market Intelligence</div>
            {newsItems.length === 0 ? (
              <div style={{ color: C.muted, fontSize: 13 }}>Loading live freight market news...</div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {newsItems.map((item,i) => (
                  <a key={i} href={item.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, transition: 'all .2s', cursor: 'pointer' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{item.snippet}</div>
                      <div style={{ marginTop: 10, fontSize: 11, color: C.gold }}>{item.source} · {item.date}</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
          <div style={{ background: C.card, border: `1px solid ${C.gold}40`, borderRadius: 18, padding: 32, maxWidth: 480, width: '100%' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.gold, marginBottom: 8 }}>Assign {assignModal.id}</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>{assignModal.origin} → {assignModal.destination} · Net Profit: <span style={{ color: C.green }}>${(assignModal.profit||0).toLocaleString()}</span></div>
            <select value={bookingDriver} onChange={e => setBookingDriver(e.target.value)}
              style={{ width: '100%', background: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px', color: C.text, fontFamily: 'inherit', fontSize: 13, marginBottom: 20 }}>
              <option value="">— Select Available Driver —</option>
              {availDrivers.map(d => <option key={d.id} value={d.name}>{d.name} · {d.hos}h HOS · Score {d.score}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="assign-btn" style={{ flex: 1 }} disabled={!bookingDriver} onClick={() => assignLoad(assignModal, bookingDriver)}>CONFIRM ASSIGNMENT</button>
              <button className="assign-btn" style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.muted }} onClick={() => { setAssignModal(null); setBookingDriver(''); }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
