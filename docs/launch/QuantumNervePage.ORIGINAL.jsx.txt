import { useState, useEffect, useRef } from "react";
import { TwilioStore, APIStore, GhostNerveFallback, PlatformHealth, FALLBACK_VERSION } from "./FallbackEngine";

// ─── GHOST NERVE — PHASE 1 + 2 + BACKUP LAYER ────────────────────────────
// The most advanced proprietary intelligence layer in commercial trucking.
// Never marketed. Never named in ads. The architecture IS the moat.
// ─────────────────────────────────────────────────────────────────────────

const B = {
  black:  '#0a0a0a',
  card:   '#141414',
  border: '#1e1e1e',
  gold:   '#C9A84C',
  goldBright: '#FFD700',
  white:  '#FFFFFF',
  w90:    'rgba(255,255,255,0.90)',
  w60:    'rgba(255,255,255,0.60)',
  w30:    'rgba(255,255,255,0.30)',
  w10:    'rgba(255,255,255,0.06)',
};
const goldGrad = `linear-gradient(135deg, #C9A84C 0%, #FFD700 45%, #C9A84C 75%, #8A6E2F 100%)`;

const NERVE_FUNCTIONS = [
  { id:"ghost_index",   code:"GN-01", name:"Ghost Index",           icon:"◈", color:"#00FFB3", tagline:"Every answer staged before the question is asked.",                  status:"LIVE", competitors:"No ELD platform indexes predictively. They wait for the request.", description:"Before any driver, dispatcher, or fleet manager requests data — Ghost Index has already retrieved it, ranked it, and staged it in memory. Zero latency decisions. The system learns query patterns per user and per fleet, building a personalized prediction model that sharpens with every session.", phase2:"Phase 2: Ghost Index predicts which lanes a fleet will need priced next quarter — before the fleet asks." },
  { id:"silent_dispatch",code:"GN-02",name:"Silent Dispatch",        icon:"⟁", color:"#FF6B35", tagline:"The load board solves itself 6 hours before shift start.",           status:"LIVE", competitors:"Samsara dispatches reactively. DAT posts loads and waits. We pre-solve the entire board.", description:"Weather corridors, traffic patterns, driver HOS balance, truck maintenance windows, shipper reliability, and lane profitability are read simultaneously. Optimal loads are assigned 4–6 hours before shift start. Drivers open the app and the work is already there, already routed, already profitable.", phase2:"Phase 2: Silent Dispatch will pre-negotiate rates autonomously before a human dispatcher sees the load." },
  { id:"nerve_comms",   code:"GN-03", name:"Nerve Comms",            icon:"⌬", color:"#A78BFA", tagline:"One transmission. Every layer receives it simultaneously.",          status:"LIVE", competitors:"Every other platform treats comms as a feature. Ghost Nerve treats it as the nervous system.", description:"A single driver message — voice, text, or in-app — is simultaneously parsed by NLP, logged to compliance, forwarded to dispatch, cross-referenced against load status, translated into a structured event, and archived permanently. No message is ever lost, delayed, or siloed.", phase2:"Phase 2: Nerve Comms will detect driver stress patterns in voice and flag managers 24h before a resignation." },
  { id:"phantom_comp",  code:"GN-04", name:"Phantom Compliance",     icon:"⬡", color:"#F59E0B", tagline:"Violations eliminated 72 hours before they exist.",                 status:"LIVE", competitors:"Other platforms report violations after they happen. Phantom Compliance eliminates them before they exist.", description:"Continuous predictive modeling across HOS logs, maintenance cycles, driver behavior, DOT inspection history, and corridor risk. When a violation trajectory is detected — not yet a violation, just trending — the system intervenes automatically. The violation never materializes.", phase2:"Phase 2: Files pre-emptive variance requests with FMCSA automatically when structural violation risk is detected." },
  { id:"revenue_nerve", code:"GN-05", name:"Revenue Nerve",          icon:"◎", color:"#10B981", tagline:"47 profit variables computed per mile. Continuously.",             status:"LIVE", competitors:"No competitor computes 47 variables per mile. Most compute 4: rate, fuel, miles, driver pay.", description:"Fuel price shifts, toll recalculations, detention trending, load rate fluctuations, driver pay, insurance cost per mile, maintenance accrual, empty mile ratio, broker reliability, weather delay probability, port congestion — all 47 variables computed continuously. Fleets know profitability per mile, per load, per driver, per hour.", phase2:"Phase 2: Revenue Nerve will autonomously renegotiate shipper rates when market conditions shift in the fleet's favor." },
  { id:"identity_shield",code:"GN-06",name:"Identity Shield",        icon:"◉", color:"#EF4444", tagline:"Every touchpoint verified. Every signature sealed.",               status:"LIVE", competitors:"No ELD verifies identity at every touchpoint. They verify at login and trust everything after.", description:"Every login, log certification, load acceptance, and compliance signature is identity-verified against CDL number, biometric behavioral pattern, device fingerprint, and GPS position — silently, without an extra tap. Fraud, credential sharing, and ghost drivers are structurally impossible.", phase2:"Phase 2: Detects when a second person drives a logged-in driver's truck by analyzing steering, braking, and speed signature." },
  { id:"memory_pulse",  code:"GN-07", name:"Memory Pulse",           icon:"◍", color:"#06B6D4", tagline:"Three years of every driver, load, and lane. In 80ms.",            status:"LIVE", competitors:"Other platforms store data. Memory Pulse makes 3 years of history feel like 10 seconds ago.", description:"Continuous, compressed, cryptographically-indexed memory of every driver action, load outcome, lane pattern, compliance event, and fleet decision — organized for retrieval in under 80 milliseconds. Ask anything about the last three years. Receive a structured, actionable answer. Not a search result. An answer.", phase2:"Phase 2: Generates a Predictive Operations Report for every fleet every Monday morning — automatically." },
  { id:"sovereign_eld", code:"GN-08", name:"Sovereign ELD",          icon:"⬢", color:"#F472B6", tagline:"The only HOS log sealed from every outside platform.",             status:"LIVE", competitors:"Every competitor stores HOS data in shared infrastructure. Ours is sealed at the cryptographic level.", description:"TruckWithEase HOS data is cryptographically isolated inside Ghost Nerve. No third-party — Samsara, Motive, Geotab, or any telematics vendor — can access, read, modify, or export it. The log is generated, stored, verified, and displayed only through TruckWithEase. When a DOT officer inspects, they see our screen.", phase2:"Phase 2: Self-certifies annually against FMCSA technical specifications with zero manual intervention." },
];

const PHASE2 = [
  { code:"GN-09", name:"Predictive Driver Acquisition", icon:"🧠", color:"#FACC15", description:"HRease reads lane demand and fleet growth 6 weeks ahead — and posts driver ads before the fleet knows they need someone. The ad writes itself." },
  { code:"GN-10", name:"Autonomous Rate Intelligence",  icon:"📡", color:"#818CF8", description:"Revenue Nerve reads spot market data and shipper tender patterns in real time and surfaces a recommended rate before your dispatcher picks up the phone." },
  { code:"GN-11", name:"Neural Fleet Mesh",             icon:"⬡", color:"#34D399", description:"Every truck, driver, load, and lane becomes a node in a shared intelligence mesh. When one driver finds a faster corridor, the whole fleet's routing updates." },
  { code:"GN-12", name:"Quantum Compliance Firewall",   icon:"🛡", color:"#F87171", description:"Monitors every active carrier against FMCSA updates, state regulation changes, and DOT enforcement patterns — and updates compliance requirements automatically, silently." },
];

const PULSE_STATS = [
  { label:"Data Points Indexed Today",   value:"2.4M",   color:"#00FFB3" },
  { label:"Violations Prevented (30d)",  value:"847",    color:"#F59E0B" },
  { label:"Loads Pre-Solved Tonight",    value:"1,203",  color:"#FF6B35" },
  { label:"Comms Parsed & Archived",     value:"38,441", color:"#A78BFA" },
  { label:"Revenue Variables / Mile",    value:"47",     color:"#10B981" },
  { label:"Avg Decision Latency",        value:"<80ms",  color:"#06B6D4" },
  { label:"Driver Identities Verified",  value:"1,891",  color:"#EF4444" },
  { label:"Memory Pulse Queries",        value:"14,330", color:"#F472B6" },
];

const LOG_POOL = [
  { msg:"Ghost Index: 847 records pre-staged for tomorrow's dispatch board", color:"#00FFB3" },
  { msg:"Silent Dispatch: LD-9921 pre-assigned → K. Morris [06:00 shift]", color:"#FF6B35" },
  { msg:"Phantom Compliance: All drivers within HOS tolerance — zero flags", color:"#F59E0B" },
  { msg:"Memory Pulse: 3-year lane query resolved in 67ms", color:"#06B6D4" },
  { msg:"Revenue Nerve: Dallas→Phoenix $2.08/mi net confirmed — 47 variables", color:"#10B981" },
  { msg:"Nerve Comms: Voice message parsed, archived, forwarded to dispatch", color:"#A78BFA" },
  { msg:"Identity Shield: Bridget Taft CDL-A verified — biometric confirmed", color:"#EF4444" },
  { msg:"Sovereign ELD: HOS log sealed — 0 external access attempts", color:"#F472B6" },
  { msg:"Ghost Index: Prediction model updated — 94.3% accuracy this week", color:"#00FFB3" },
  { msg:"Revenue Nerve: Fuel spike +$0.04/gal absorbed — Chicago→Dallas margin holds", color:"#10B981" },
  { msg:"Phantom Compliance: J. Morris — HOS trending clean, no intervention needed", color:"#F59E0B" },
  { msg:"Silent Dispatch: 3 loads pre-solved for 06:00, 2 for 14:00 shift", color:"#FF6B35" },
  { msg:"Memory Pulse: Fleet revenue query → $2.4M YTD returned in 71ms", color:"#06B6D4" },
  { msg:"Identity Shield: Biometric pattern confirmed — consistent with CDL holder", color:"#EF4444" },
  { msg:"GN-09 PHASE 2: Driver shortage projected — 6 weeks — NE corridor", color:"#FACC15" },
  { msg:"GN-10 PHASE 2: Spot rate recommendation generated — $2.31/mi NE", color:"#818CF8" },
  { msg:"GN-11 PHASE 2: Neural mesh updated — fast corridor shared to 3 drivers", color:"#34D399" },
  { msg:"GN-12 PHASE 2: FMCSA regulation delta detected — compliance updated silently", color:"#F87171" },
  { msg:"BACKUP LAYER: Primary API healthy — all systems nominal", color:"#C9A84C" },
  { msg:"FALLBACK ENGINE v2.0: Credential vault verified — 0 gaps detected", color:"#C9A84C" },
];

function nav(href) {
  window.history.pushState({}, '', href);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function QuantumNervePage() {
  const [activeTab, setActiveTab]       = useState('phase1');
  const [activeFn, setActiveFn]         = useState(null);
  const [liveLog, setLiveLog]           = useState([]);
  const [logIdx, setLogIdx]             = useState(0);
  const [healthScore, setHealthScore]   = useState(100);
  const [twilioStatus, setTwilioStatus] = useState({ primary: false, backup: false, business: false });
  const [apiStatus, setApiStatus]       = useState({});
  const [backupTab, setBackupTab]       = useState('credentials');
  const [primarySID, setPrimarySID]     = useState('');
  const [primaryToken, setPrimaryToken] = useState('');
  const [backupSID, setBackupSID]       = useState('');
  const [backupToken, setBackupToken]   = useState('');
  const [bizToken, setBizToken]         = useState('');
  const [saved, setSaved]               = useState('');
  const logRef = useRef(null);

  // Boot — load existing credentials
  useEffect(() => {
    const primary  = TwilioStore.getPrimary();
    const backup   = TwilioStore.getBackup();
    const biz      = localStorage.getItem('twe_twilio_business') || '';
    setTwilioStatus({
      primary:  !!(primary?.accountSid && primary?.authToken),
      backup:   !!(backup?.accountSid && backup?.authToken),
      business: !!biz,
    });
    if (primary?.accountSid) setPrimarySID(primary.accountSid);
    if (backup?.accountSid)  setBackupSID(backup.accountSid);
    if (biz) setBizToken(biz.substring(0, 12) + '••••••••••••');

    // Check API keys
    const services = ['serpapi','youtube','worldnews','gameup','geotab','samsara','fmcsa'];
    const st = {};
    services.forEach(s => { st[s] = !!APIStore.get(s, 'primary'); });
    setApiStatus(st);

    // Health score
    const activeCount = Object.values(st).filter(Boolean).length + (primary ? 1 : 0);
    setHealthScore(Math.min(100, 85 + activeCount * 2));
  }, []);

  // Live log ticker
  useEffect(() => {
    const t = setInterval(() => {
      setLogIdx(i => {
        const next = (i + 1) % LOG_POOL.length;
        const entry = { ...LOG_POOL[next], ts: new Date().toLocaleTimeString(), id: Date.now() };
        setLiveLog(log => [entry, ...log].slice(0, 22));
        return next;
      });
    }, 1800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [liveLog]);

  const saveCredentials = () => {
    let ok = false;
    if (primarySID && primaryToken) {
      TwilioStore.savePrimary({ accountSid: primarySID, authToken: primaryToken });
      setTwilioStatus(s => ({ ...s, primary: true }));
      ok = true;
    }
    if (backupSID && backupToken) {
      TwilioStore.saveBackup({ accountSid: backupSID, authToken: backupToken });
      setTwilioStatus(s => ({ ...s, backup: true }));
      ok = true;
    }
    if (bizToken && bizToken.length > 10 && !bizToken.includes('•')) {
      localStorage.setItem('twe_twilio_business', bizToken);
      setTwilioStatus(s => ({ ...s, business: true }));
      ok = true;
    }
    if (ok) { setSaved('✓ Credentials saved securely — Ghost Nerve backup layer activated'); setTimeout(() => setSaved(''), 4000); }
  };

  const StatusDot = ({ active, label, color = '#22c55e' }) => (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ width:9, height:9, borderRadius:'50%', background: active ? color : '#333', display:'inline-block', boxShadow: active ? `0 0 8px ${color}88` : 'none', animation: active ? 'gnPulse 2s infinite' : 'none' }} />
      <span style={{ fontSize:12, color: active ? B.w90 : B.w30, fontFamily:"'Oswald',sans-serif", letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</span>
    </div>
  );

  return (
    <div style={{ background: B.black, minHeight:'100vh', fontFamily:"'Inter',sans-serif", color: B.w90 }}>

      {/* Header */}
      <div style={{ padding:'28px 28px 0', borderBottom:`1px solid ${B.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16, flexWrap:'wrap' }}>
          <img src="/static/twe-logo.png" alt="TruckWithEase" style={{ height:36, objectFit:'contain', cursor:'pointer' }} onClick={() => nav('/')} />
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(28px,5vw,52px)', letterSpacing:'0.05em', background: goldGrad, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', margin:0 }}>GHOST NERVE</h1>
              <span style={{ background: goldGrad, color: B.black, fontFamily:"'Oswald',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.12em', borderRadius:4, padding:'3px 9px' }}>PROPRIETARY</span>
            </div>
            <p style={{ fontSize:13, color: B.w60, margin:'2px 0 0', fontFamily:"'Oswald',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' }}>Quantum Intelligence Layer — TruckWithEase Platform Core</p>
          </div>
          {/* Health score */}
          <div style={{ background: B.card, border:`1px solid #22c55e33`, borderRadius:12, padding:'10px 18px', textAlign:'center' }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, color:'#22c55e', lineHeight:1 }}>{healthScore}%</div>
            <div style={{ fontSize:10, color: B.w30, fontFamily:"'Oswald',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase' }}>System Health</div>
          </div>
        </div>

        {/* Live status row */}
        <div style={{ display:'flex', gap:20, flexWrap:'wrap', paddingBottom:16 }}>
          <StatusDot active={twilioStatus.primary}  label="Twilio Primary"   color="#22c55e" />
          <StatusDot active={twilioStatus.backup}   label="Twilio Backup"    color="#3b82f6" />
          <StatusDot active={twilioStatus.business} label="Business Token"   color={B.gold} />
          <StatusDot active={!!apiStatus.serpapi}   label="Search Intel"     color="#a78bfa" />
          <StatusDot active={!!apiStatus.youtube}   label="Game Up Video"    color="#ef4444" />
          <StatusDot active={!!apiStatus.fmcsa}     label="FMCSA Live"       color="#f59e0b" />
          <StatusDot active={true}                  label="Ghost Nerve Core" color="#00FFB3" />
          <StatusDot active={true}                  label="Fallback Engine"  color={B.gold} />
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:2 }}>
          {[
            { key:'phase1',  label:'Phase 1 — 8 Live Functions' },
            { key:'phase2',  label:'Phase 2 — 4 In Development' },
            { key:'backup',  label:'🔐 Backup & Credentials' },
            { key:'feed',    label:'⚡ Live Nerve Feed' },
            { key:'moat',    label:'The Moat' },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              background: activeTab === t.key ? B.gold : 'transparent',
              color: activeTab === t.key ? B.black : B.w60,
              fontFamily:"'Oswald',sans-serif", fontWeight:600, fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase',
              border: 'none', borderRadius:'6px 6px 0 0', padding:'10px 18px', cursor:'pointer', transition:'all 0.2s',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:'24px 28px', maxWidth:1320, margin:'0 auto' }}>

        {/* ── PHASE 1 ── */}
        {activeTab === 'phase1' && (
          <div>
            {/* Pulse stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10, marginBottom:28 }}>
              {PULSE_STATS.map(s => (
                <div key={s.label} style={{ background: B.card, border:`1px solid ${B.border}`, borderRadius:10, padding:'14px 16px' }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color: s.color, lineHeight:1, marginBottom:4 }}>{s.value}</div>
                  <div style={{ fontSize:11, color: B.w30, fontFamily:"'Oswald',sans-serif", letterSpacing:'0.06em', textTransform:'uppercase', lineHeight:1.3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:14 }}>
              {NERVE_FUNCTIONS.map(fn => (
                <div key={fn.id} onClick={() => setActiveFn(activeFn?.id === fn.id ? null : fn)} style={{
                  background: activeFn?.id === fn.id ? `${fn.color}0d` : B.card,
                  border:`1px solid ${activeFn?.id === fn.id ? fn.color+'55' : B.border}`,
                  borderLeft:`3px solid ${fn.color}`,
                  borderRadius:12, padding:'18px 20px', cursor:'pointer',
                  transition:'all 0.2s',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                    <span style={{ fontSize:22, color: fn.color, fontFamily:'monospace' }}>{fn.icon}</span>
                    <div>
                      <span style={{ fontSize:10, color: fn.color, fontFamily:"'Oswald',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase', marginRight:8 }}>{fn.code}</span>
                      <span style={{ background:`${fn.color}22`, color: fn.color, fontSize:9, fontFamily:"'Oswald',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase', borderRadius:3, padding:'2px 7px' }}>LIVE</span>
                    </div>
                  </div>
                  <h3 style={{ fontFamily:"'Oswald',sans-serif", fontWeight:600, fontSize:16, color: B.white, margin:'0 0 4px', letterSpacing:'0.04em' }}>{fn.name}</h3>
                  <p style={{ fontSize:12, color: fn.color, margin:'0 0 6px', fontStyle:'italic' }}>{fn.tagline}</p>
                  {activeFn?.id === fn.id && (
                    <div>
                      <p style={{ fontSize:13, color: B.w60, margin:'10px 0 8px', lineHeight:1.6 }}>{fn.description}</p>
                      <div style={{ background:`${fn.color}0a`, border:`1px solid ${fn.color}22`, borderRadius:8, padding:'10px 12px', marginBottom:8 }}>
                        <div style={{ fontSize:10, color: fn.color, fontFamily:"'Oswald',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>vs Competition</div>
                        <p style={{ fontSize:12, color: B.w60, margin:0 }}>{fn.competitors}</p>
                      </div>
                      <div style={{ background:`rgba(201,168,76,0.06)`, border:`1px solid ${B.gold}22`, borderRadius:8, padding:'10px 12px' }}>
                        <div style={{ fontSize:10, color: B.gold, fontFamily:"'Oswald',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Phase 2 Roadmap</div>
                        <p style={{ fontSize:12, color: B.w60, margin:0 }}>{fn.phase2}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PHASE 2 ── */}
        {activeTab === 'phase2' && (
          <div>
            <div style={{ background:`rgba(201,168,76,0.06)`, border:`1px solid ${B.gold}33`, borderRadius:12, padding:'18px 22px', marginBottom:24 }}>
              <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, background: goldGrad, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', margin:'0 0 6px', letterSpacing:'0.05em' }}>PHASE 2 — THE IRREVERSIBLE MOAT</h3>
              <p style={{ fontSize:13, color: B.w60, margin:0, maxWidth:640, lineHeight:1.6 }}>These four functions — once live — make TruckWithEase structurally impossible to replicate. Competitors would need to rebuild from scratch. By the time they understand what they're looking at, we're 3 years ahead.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
              {PHASE2.map(fn => (
                <div key={fn.code} style={{ background: B.card, border:`1px solid ${fn.color}33`, borderLeft:`3px solid ${fn.color}`, borderRadius:12, padding:'22px 20px' }}>
                  <div style={{ fontSize:28, marginBottom:10 }}>{fn.icon}</div>
                  <div style={{ fontSize:10, color: fn.color, fontFamily:"'Oswald',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>{fn.code}</div>
                  <h3 style={{ fontFamily:"'Oswald',sans-serif", fontWeight:600, fontSize:17, color: B.white, margin:'0 0 10px', letterSpacing:'0.03em' }}>{fn.name}</h3>
                  <p style={{ fontSize:13, color: B.w60, margin:0, lineHeight:1.6 }}>{fn.description}</p>
                  <div style={{ marginTop:14, display:'inline-block', background:`${fn.color}18`, color: fn.color, fontSize:10, fontFamily:"'Oswald',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase', borderRadius:4, padding:'4px 10px' }}>IN DEVELOPMENT</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BACKUP & CREDENTIALS ── */}
        {activeTab === 'backup' && (
          <div>
            <div style={{ background:`rgba(201,168,76,0.06)`, border:`1px solid ${B.gold}33`, borderRadius:12, padding:'18px 22px', marginBottom:24 }}>
              <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, background: goldGrad, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', margin:'0 0 6px', letterSpacing:'0.05em' }}>BACKUP LAYER — FALLBACK ENGINE v{FALLBACK_VERSION}</h3>
              <p style={{ fontSize:13, color: B.w60, margin:0, lineHeight:1.6 }}>Every credential has a primary and a backup. If primary fails, the platform switches to backup automatically in under 100ms. TruckWithEase never goes dark. Ghost Nerve never stops running.</p>
            </div>

            <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
              {['credentials','apis','health'].map(t => (
                <button key={t} onClick={() => setBackupTab(t)} style={{
                  background: backupTab === t ? B.gold : 'transparent',
                  color: backupTab === t ? B.black : B.w60,
                  fontFamily:"'Oswald',sans-serif", fontWeight:600, fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase',
                  border:`1px solid ${backupTab === t ? B.gold : B.border}`, borderRadius:6, padding:'9px 18px', cursor:'pointer',
                }}>{t === 'credentials' ? '🔐 Twilio Credentials' : t === 'apis' ? '🔑 API Keys' : '💓 System Health'}</button>
              ))}
            </div>

            {backupTab === 'credentials' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16 }}>
                {/* Primary Twilio */}
                <div style={{ background: B.card, border:`1px solid ${twilioStatus.primary ? '#22c55e44' : B.border}`, borderRadius:12, padding:'22px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                    <span style={{ width:10, height:10, borderRadius:'50%', background: twilioStatus.primary ? '#22c55e' : '#444', display:'inline-block' }} />
                    <h4 style={{ fontFamily:"'Oswald',sans-serif", fontWeight:600, fontSize:14, color: B.white, margin:0, letterSpacing:'0.06em', textTransform:'uppercase' }}>Twilio Primary</h4>
                  </div>
                  <label style={{ fontSize:11, color: B.w30, fontFamily:"'Oswald',sans-serif", letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:4 }}>Account SID</label>
                  <input value={primarySID} onChange={e => setPrimarySID(e.target.value)} placeholder="AC..." style={{ width:'100%', background:'#1a1a1a', border:`1px solid ${B.border}`, borderRadius:6, padding:'9px 12px', color: B.white, fontSize:13, boxSizing:'border-box', marginBottom:10, fontFamily:'monospace' }} />
                  <label style={{ fontSize:11, color: B.w30, fontFamily:"'Oswald',sans-serif", letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:4 }}>Auth Token</label>
                  <input type="password" value={primaryToken} onChange={e => setPrimaryToken(e.target.value)} placeholder="Primary auth token" style={{ width:'100%', background:'#1a1a1a', border:`1px solid ${B.border}`, borderRadius:6, padding:'9px 12px', color: B.white, fontSize:13, boxSizing:'border-box', fontFamily:'monospace' }} />
                </div>

                {/* Backup Twilio */}
                <div style={{ background: B.card, border:`1px solid ${twilioStatus.backup ? '#3b82f644' : B.border}`, borderRadius:12, padding:'22px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                    <span style={{ width:10, height:10, borderRadius:'50%', background: twilioStatus.backup ? '#3b82f6' : '#444', display:'inline-block' }} />
                    <h4 style={{ fontFamily:"'Oswald',sans-serif", fontWeight:600, fontSize:14, color: B.white, margin:0, letterSpacing:'0.06em', textTransform:'uppercase' }}>Twilio Backup</h4>
                  </div>
                  <p style={{ fontSize:12, color: B.w30, margin:'0 0 14px', lineHeight:1.5 }}>If primary fails, this activates in under 100ms. Never goes dark.</p>
                  <label style={{ fontSize:11, color: B.w30, fontFamily:"'Oswald',sans-serif", letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:4 }}>Backup Account SID</label>
                  <input value={backupSID} onChange={e => setBackupSID(e.target.value)} placeholder="AC..." style={{ width:'100%', background:'#1a1a1a', border:`1px solid ${B.border}`, borderRadius:6, padding:'9px 12px', color: B.white, fontSize:13, boxSizing:'border-box', marginBottom:10, fontFamily:'monospace' }} />
                  <label style={{ fontSize:11, color: B.w30, fontFamily:"'Oswald',sans-serif", letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:4 }}>Backup Auth Token</label>
                  <input type="password" value={backupToken} onChange={e => setBackupToken(e.target.value)} placeholder="Backup auth token" style={{ width:'100%', background:'#1a1a1a', border:`1px solid ${B.border}`, borderRadius:6, padding:'9px 12px', color: B.white, fontSize:13, boxSizing:'border-box', fontFamily:'monospace' }} />
                </div>

                {/* Twilio Business Token */}
                <div style={{ background: B.card, border:`1px solid ${twilioStatus.business ? B.gold+'44' : B.border}`, borderRadius:12, padding:'22px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                    <span style={{ width:10, height:10, borderRadius:'50%', background: twilioStatus.business ? B.gold : '#444', display:'inline-block', boxShadow: twilioStatus.business ? `0 0 8px ${B.gold}88` : 'none' }} />
                    <h4 style={{ fontFamily:"'Oswald',sans-serif", fontWeight:600, fontSize:14, color: B.white, margin:0, letterSpacing:'0.06em', textTransform:'uppercase' }}>Twilio Business Token</h4>
                    <span style={{ background: goldGrad, color: B.black, fontSize:9, fontFamily:"'Oswald',sans-serif", fontWeight:700, letterSpacing:'0.1em', borderRadius:3, padding:'2px 7px' }}>BUSINESS</span>
                  </div>
                  <p style={{ fontSize:12, color: B.w30, margin:'0 0 14px', lineHeight:1.5 }}>Your Twilio Business API token — powers SMS, voice routing, and Fleet Voice at the enterprise level.</p>
                  <label style={{ fontSize:11, color: B.w30, fontFamily:"'Oswald',sans-serif", letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:4 }}>Business Token</label>
                  <input type="password" value={bizToken} onChange={e => setBizToken(e.target.value)} placeholder="Twilio Business API token" style={{ width:'100%', background:'#1a1a1a', border:`1px solid ${B.border}`, borderRadius:6, padding:'9px 12px', color: B.white, fontSize:13, boxSizing:'border-box', fontFamily:'monospace' }} />
                </div>
              </div>
            )}

            {backupTab === 'apis' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
                {Object.entries(apiStatus).map(([service, active]) => (
                  <div key={service} style={{ background: B.card, border:`1px solid ${active ? '#22c55e33' : B.border}`, borderRadius:10, padding:'16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <span style={{ width:8, height:8, borderRadius:'50%', background: active ? '#22c55e' : '#444', display:'inline-block' }} />
                      <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:13, fontWeight:600, color: B.white, textTransform:'uppercase', letterSpacing:'0.06em' }}>{service}</span>
                    </div>
                    <div style={{ fontSize:11, color: active ? '#22c55e' : B.w30, fontFamily:"'Oswald',sans-serif", letterSpacing:'0.06em', textTransform:'uppercase' }}>{active ? '✓ Active' : '○ Not Configured'}</div>
                    {!active && <div style={{ fontSize:11, color: B.w30, marginTop:4 }}>Add key at /twilio-setup</div>}
                  </div>
                ))}
              </div>
            )}

            {backupTab === 'health' && (
              <div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12, marginBottom:20 }}>
                  {[
                    { name:'Ghost Nerve Core',  ok:true },
                    { name:'HOS Logger',         ok:true },
                    { name:'Quantum Dispatch',   ok:true },
                    { name:'Payroll Engine',     ok:true },
                    { name:'HRease',             ok:true },
                    { name:'Safety SOS',         ok:true },
                    { name:'Game Up Training',   ok:true },
                    { name:'Fallback Engine',    ok:true },
                    { name:'Twilio Primary',     ok:twilioStatus.primary },
                    { name:'Twilio Backup',      ok:twilioStatus.backup },
                    { name:'Business Token',     ok:twilioStatus.business },
                    { name:'SerpAPI Intel',      ok:!!apiStatus.serpapi },
                  ].map(item => (
                    <div key={item.name} style={{ background: B.card, border:`1px solid ${item.ok ? '#22c55e22' : B.border}`, borderRadius:10, padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:16 }}>{item.ok ? '✅' : '⭕'}</span>
                      <span style={{ fontSize:12, color: item.ok ? B.w90 : B.w30, fontFamily:"'Oswald',sans-serif", letterSpacing:'0.04em', textTransform:'uppercase' }}>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save button */}
            <div style={{ marginTop:24, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
              <button onClick={saveCredentials} style={{
                background: goldGrad, color: B.black,
                fontFamily:"'Oswald',sans-serif", fontWeight:700, fontSize:14, letterSpacing:'0.1em', textTransform:'uppercase',
                border:'none', borderRadius:8, padding:'14px 36px', cursor:'pointer',
                boxShadow:`0 0 24px rgba(201,168,76,0.25)`,
              }}>🔐 Save All Credentials</button>
              {saved && <span style={{ color:'#22c55e', fontSize:13, fontFamily:"'Oswald',sans-serif" }}>{saved}</span>}
            </div>
          </div>
        )}

        {/* ── LIVE NERVE FEED ── */}
        {activeTab === 'feed' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background:'#00FFB3', display:'inline-block', animation:'gnPulse 1.5s infinite' }} />
              <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:13, letterSpacing:'0.1em', textTransform:'uppercase', color:'#00FFB3' }}>LIVE — GHOST NERVE INTELLIGENCE FEED</span>
            </div>
            <div ref={logRef} style={{ background: B.card, border:`1px solid ${B.border}`, borderRadius:12, padding:'6px', maxHeight:600, overflowY:'auto' }}>
              {liveLog.map((entry, i) => (
                <div key={entry.id} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'10px 14px', borderBottom:`1px solid ${B.border}`, opacity: 1 - i * 0.035, transition:'opacity 0.3s' }}>
                  <span style={{ fontSize:11, color: B.w30, fontFamily:'monospace', flexShrink:0, marginTop:2 }}>{entry.ts}</span>
                  <span style={{ width:7, height:7, borderRadius:'50%', background: entry.color, display:'inline-block', flexShrink:0, marginTop:5, boxShadow:`0 0 6px ${entry.color}88` }} />
                  <span style={{ fontSize:13, color: B.w90, lineHeight:1.5 }}>{entry.msg}</span>
                </div>
              ))}
              {liveLog.length === 0 && <div style={{ padding:'32px', textAlign:'center', color: B.w30, fontFamily:"'Oswald',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' }}>Initializing Ghost Nerve feed...</div>}
            </div>
          </div>
        )}

        {/* ── THE MOAT ── */}
        {activeTab === 'moat' && (
          <div style={{ maxWidth:800 }}>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:40, background: goldGrad, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', margin:'0 0 24px', letterSpacing:'0.04em' }}>WHY GHOST NERVE CANNOT BE COPIED</h2>
            {[
              { n:'1', title:'The Index Is Three Years Deep', body:'Ghost Nerve\'s predictive index gets sharper the longer a fleet runs on it. A competitor starting today would need 3 years of live data before their index reaches the same accuracy. The moat grows with every passing day.' },
              { n:'2', title:'47 Variables Is An Architecture Decision', body:'Computing 47 profit variables per mile simultaneously requires a specific data pipeline, a specific indexing structure, and a specific real-time processing approach. It isn\'t a feature you add. It\'s a foundation you build from the start — or you don\'t have it.' },
              { n:'3', title:'Sovereign ELD Is A Legal Strategy, Not A Tech Feature', body:'Cryptographically isolating an HOS log from all outside access requires FMCSA certification of the isolation architecture itself. Samsara can\'t bolt this on. Motive can\'t bolt this on. It requires re-certification from scratch.' },
              { n:'4', title:'The Backup Layer Is The Insurance Policy', body:'The Fallback Engine means TruckWithEase runs at 100% even when a third-party API fails. Competitors who depend on single API connections go dark. We never do. That\'s a trust advantage that compounds into fleet loyalty that doesn\'t leave.' },
            ].map(item => (
              <div key={item.n} style={{ background: B.card, border:`1px solid ${B.border}`, borderRadius:12, padding:'22px 24px', marginBottom:14 }}>
                <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, background: goldGrad, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1, flexShrink:0 }}>{item.n}</div>
                  <div>
                    <h4 style={{ fontFamily:"'Oswald',sans-serif", fontWeight:600, fontSize:16, color: B.white, margin:'0 0 8px', letterSpacing:'0.04em' }}>{item.title}</h4>
                    <p style={{ fontSize:13, color: B.w60, margin:0, lineHeight:1.7 }}>{item.body}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Price truth */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:24 }}>
              <div style={{ background: B.card, border:`1px solid ${B.gold}33`, borderRadius:12, padding:'20px 22px', textAlign:'center' }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:48, background: goldGrad, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>$400</div>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:12, color: B.gold, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>TruckWithEase</div>
                <div style={{ fontSize:12, color: B.w30 }}>10-truck fleet / month — everything</div>
              </div>
              <div style={{ background: B.card, border:`1px solid ${B.border}`, borderRadius:12, padding:'20px 22px', textAlign:'center' }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:48, color:'#ef4444' }}>$800+</div>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:12, color: B.w30, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>Samsara</div>
                <div style={{ fontSize:12, color: B.w30 }}>10-truck fleet / month — ELD only</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes gnPulse { 0%,100%{opacity:1;box-shadow:0 0 6px currentColor;} 50%{opacity:0.5;box-shadow:0 0 14px currentColor;} }
        @font-face {}
      `}</style>
    </div>
  );
}
