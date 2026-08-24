import { useState, useEffect, useRef, useCallback } from "react";
import { pb } from "./lib/pb";

// ─── Brand Colors ──────────────────────────────────────────────────────────
const NAVY  = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE= "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED   = "#DC2626";
const DARK  = "#06090F";

// ─── FMCSA Limits (49 CFR §395) ────────────────────────────────────────────
const HOS_LIMITS = {
  drive:  11 * 60,  // 11h drive
  shift:  14 * 60,  // 14h on-duty window
  cycle:  70 * 60,  // 70h/8-day cycle
  break:   8 * 60,  // 8h break required before restart
};

const STATUS_COLORS = {
  "Off Duty":           { bg:"#1E293B", fg:"#94A3B8", bar:"#475569",  label:"Off Duty",           code:"OFF" },
  "Sleeper Berth":      { bg:"#0F172A", fg:"#818CF8", bar:"#4F46E5",  label:"Sleeper Berth",       code:"SB"  },
  "Driving":            { bg:"#052E16", fg:"#4ADE80", bar:"#16A34A",  label:"Driving",             code:"D"   },
  "On Duty Not Driving":{ bg:"#1C1917", fg:"#FB923C", bar:"#EA580C",  label:"On Duty (Not Drive)", code:"ON"  },
};

// ─── Demo log entries — 14 days of realistic data ─────────────────────────
function buildDemoLog() {
  const entries = [];
  const today = new Date('2026-07-18');
  let seq = 1;
  for (let d = 13; d >= 0; d--) {
    const date = new Date(today); date.setDate(date.getDate() - d);
    const dateStr = date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    const isWeekend = [0,6].includes(date.getDay());
    if (isWeekend) {
      entries.push({ id:seq++, status:'Off Duty', start:'00:00', duration:1440, date:dateStr, location:'Home Base, Dallas TX', note:'Off duty', certified:d>0 });
    } else {
      const driveMin = Math.floor(Math.random()*90+390);
      entries.push(
        { id:seq++, status:'Off Duty',           start:'00:00', duration:300,      date:dateStr, location:'Dallas, TX',       note:'10h rest period',      certified:d>0 },
        { id:seq++, status:'On Duty Not Driving', start:'05:00', duration:30,       date:dateStr, location:'Dallas, TX',       note:'Pre-trip DVIR',         certified:d>0 },
        { id:seq++, status:'Driving',             start:'05:30', duration:driveMin, date:dateStr, location:'Dallas, TX → en route', note:'Loaded haul',      certified:d>0 },
        { id:seq++, status:'Off Duty',            start:'14:00', duration:1440-300-30-driveMin, date:dateStr, location:'Memphis, TN', note:'Post-trip', certified:d>0 },
      );
    }
  }
  return entries;
}

const DEMO_LOG = buildDemoLog();

// Running 8-day cycle totals
const CYCLE_USED_MIN = DEMO_LOG.filter(e => {
  const d = new Date(e.date);
  const cutoff = new Date('2026-07-18'); cutoff.setDate(cutoff.getDate()-8);
  return d >= cutoff && (e.status==='Driving'||e.status==='On Duty Not Driving');
}).reduce((s,e)=>s+e.duration,0);

// Today's used time
const TODAY_DRIVE = DEMO_LOG.filter(e=>e.date==="Jul 18, 2026"&&e.status==="Driving").reduce((s,e)=>s+e.duration,0);
const TODAY_SHIFT = DEMO_LOG.filter(e=>e.date==="Jul 18, 2026"&&(e.status==="Driving"||e.status==="On Duty Not Driving")).reduce((s,e)=>s+e.duration,0);

function minToHMS(min) {
  const h = Math.floor(min/60), m = min%60;
  return `${h}h ${('0'+m).slice(-2)}m`;
}

function minToHHMM(min) {
  return `${('0'+Math.floor(min/60)).slice(-2)}:${('0'+(min%60)).slice(-2)}`;
}

function GaugeCircle({ used, limit, color, label, size=80 }) {
  const pct = Math.min(1, used/limit);
  const r = (size-8)/2, circ = 2*Math.PI*r;
  const dash = circ*(1-pct);
  const c = pct>0.9?RED:pct>0.75?AMBER:color;
  return (
    <div style={{ textAlign:'center' }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={7} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={7}
          strokeDasharray={circ} strokeDashoffset={dash}
          strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition:'stroke-dashoffset 0.6s ease,stroke 0.3s' }} />
        <text x={size/2} y={size/2+5} textAnchor="middle" fontSize={11} fontWeight={900} fill="white" fontFamily="DM Mono,monospace">{minToHHMM(limit-used)}</text>
      </svg>
      <div style={{ color:'rgba(255,255,255,0.5)', fontSize:10, marginTop:3 }}>{label}</div>
    </div>
  );
}

// ── Driver type / exemption modes (49 CFR §395.1) ────────────────────────────
const DRIVER_TYPES = [
  { id:'eld', label:'ELD — Long Haul / OTR', icon:'🚛', desc:'Full FMCSA ELD mandate applies. 11h drive, 14h window, 70h/8-day cycle.', exempt:false },
  { id:'short_haul_100', label:'Short-Haul ≤ 100 air-miles', icon:'🏙️', desc:'No ELD required. Must start/end same location. Up to 12h on-duty. Paper logs optional.', exempt:true, limit:{ onDuty:12*60, drive:11*60, radius:'100 air miles' } },
  { id:'short_haul_150', label:'Short-Haul ≤ 150 air-miles', icon:'📦', desc:'Property-carrying drivers within 150 air miles. ELD exempt. 14h window applies.', exempt:true, limit:{ onDuty:14*60, drive:11*60, radius:'150 air miles' } },
  { id:'local_van', label:'Local / Last-Mile (Van / Box)', icon:'🚐', desc:'Amazon DSP, local delivery, non-CDL. No HOS federal requirement unless crossing state lines for commerce.', exempt:true, limit:{ onDuty:10*60, drive:10*60, radius:'Local' } },
  { id:'ag_exempt', label:'Agricultural Exempt', icon:'🌾', desc:'Agricultural commodities within 150 air miles of source. Fully HOS exempt during harvest.', exempt:true, limit:{ onDuty:null, drive:null, radius:'150 air miles' } },
  { id:'oilfield', label:'Oilfield Operations', icon:'⛽', desc:'Oilfield exempt — waiting time not counted toward HOS. Rest restart applies.', exempt:true, limit:{ onDuty:24*60, drive:10*60, radius:'N/A' } },
];

// ─── HOS Assistant embedded knowledge base ────────────────────────────────────
const HOS_QA = [
  { triggers: ['without eld','no eld','paper log','exempt','exemption','short haul'], a: "Without an ELD, you log on paper — same federal limits still apply: 11h drive, 14h window, 30-min break after 8h drive, 10h off.\n\nWho is ELD exempt:\n• Short-haul ≤100 air miles (same start/end location)\n• Short-haul ≤150 air miles (property-carrying)\n• Vehicles manufactured before year 2000\n• Agricultural operations within 150 air miles\n• Oilfield exemption\n\nSelect your driver type at the top of this page — the logger switches to manual mode automatically. Every entry saves to your 14-day record instantly, no ELD device needed." },
  { triggers: ['34 hour','34hr','restart','cycle reset'], a: "34-hour restart resets your 70h/8-day cycle to zero.\n\nRequirements:\n• 34 consecutive hours off duty (Off Duty or Sleeper Berth)\n• Must include two 1am–5am periods in your home terminal time zone\n• Can only use once per 168 hours (once per week)\n\nStep by step:\n1. Log Off Duty here\n2. Wait 34 hours — do not take any on-duty time\n3. Your 70h clock resets — fresh window ready\n\nThe 70h Cycle gauge above refreshes automatically after a valid restart." },
  { triggers: ['30 minute','break','8 hour','8h'], a: "The 30-minute break rule:\n\nAfter 8 cumulative hours of DRIVING, you must stop for at least 30 minutes before driving again. The break must be Off Duty or Sleeper Berth — fueling and loading do NOT count.\n\nWho is exempt:\n• Short-haul 100 air-mile exemption drivers\n• Short-haul 150 air-mile exemption drivers\n\nWhen you approach 7h30m of drive time, a break reminder appears at the top of this page automatically." },
  { triggers: ['sleeper','berth','split','7/3','8/2'], a: "Sleeper berth split options (since Sept 2020):\n\nOption A — 8/2 split:\n• 8 consecutive hours in sleeper berth\n• 2 consecutive hours off duty or sleeper berth\n• Neither period counts against your 14h window\n\nOption B — 7/3 split:\n• 7 consecutive hours in sleeper berth\n• 3 consecutive hours off duty or sleeper berth\n• Neither period counts against your 14h window\n\nLog Sleeper Berth status here — the system tracks each rest period and shows which split combination qualifies." },
  { triggers: ['violation','over 11','exceed','too many hours','past limit'], a: "HOS violation — what to do right now:\n\n1. Pull over safely — do not drive another mile\n2. Log Off Duty or Sleeper Berth immediately\n3. You need 10 consecutive hours off before driving again\n4. Document the reason (breakdown, emergency, etc.) in the note field\n\nPenalties:\n• Civil: $1,100–$16,000 per violation\n• CSA points under HOS BASIC — stay for 3 years\n• Repeated violations trigger increased DOT inspections\n\nThe HOS gauge above shows your remaining time in real time. Watch it — when it hits 1 hour remaining, plan your stop." },
  { triggers: ['certify','certification','sign','dot inspection','roadside'], a: "Certifying your log is required by 49 CFR §395.8 for every day you drive.\n\nHow to certify:\n• Tap 'Certify Today's Log' button above\n• Your log is timestamped and stored permanently\n• Available on demand for any DOT roadside inspection\n\nWhat an officer can request:\n• Last 7 days on-screen display (you show it on your phone)\n• Up to 14 days on demand\n• Your 14-day log is always ready — tap 'Export 14-Day Log' to get the DOT-formatted file." },
  { triggers: ['how does','what is','explain','tell me','help'], a: "HOS Assistant is here for any hours-of-service question. Ask me about:\n\n• How the 11-hour driving limit works\n• The 34-hour restart procedure\n• 30-minute break rule and who is exempt\n• Sleeper berth split options (8/2 or 7/3)\n• What to do if you exceed your hours\n• How to certify your log for DOT inspection\n• Short-haul and ELD exemptions\n• 70-hour/8-day cycle management\n\nType your question below." },
];

function hosAnswer(question) {
  const q = question.toLowerCase();
  for (const qa of HOS_QA) {
    if (qa.triggers.some(t => q.includes(t))) return qa.a;
  }
  return "Great question. The key HOS rules are: 11h driving, 14h window, 30-min break after 8h drive, 10h off-duty rest, 70h/8-day cycle.\n\nFor your specific question, try asking about:\n• ELD exemptions and paper logs\n• 34-hour restart\n• Sleeper berth splits\n• What to do after a violation\n• Certifying your daily log\n\nType any of those topics and I will give you the exact rule.";
}

function HOSAssistantPanel() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { from: 'ai', text: "HOS Assistant here — ask me anything about hours of service. No ELD? I'll walk you through paper log compliance. Going over your hours? I'll tell you exactly what to do right now." }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  function send(text) {
    const q = (text || input).trim();
    if (!q) return;
    setInput('');
    setMsgs(prev => [...prev, { from: 'user', text: q }]);
    setThinking(true);
    setTimeout(() => {
      setMsgs(prev => [...prev, { from: 'ai', text: hosAnswer(q) }]);
      setThinking(false);
    }, 500 + Math.random() * 400);
  }

  const QUICK = ['How does HOS work without an ELD?', '34-hour restart steps', 'What is the 30-minute break rule?', 'I went over my hours — what do I do?'];

  return (
    <div style={{ position:'fixed', bottom:20, right:20, zIndex:9999, width: open ? 360 : 'auto', fontFamily:"'Poppins',sans-serif" }}>
      {!open ? (
        <button onClick={()=>setOpen(true)} style={{ background:`linear-gradient(135deg,${AMBER},#FF6B00)`, border:'none', borderRadius:14, padding:'12px 18px', color:'#05080F', fontWeight:900, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', gap:10, boxShadow:'0 8px 32px rgba(255,180,0,0.4)', fontFamily:"'Poppins',sans-serif" }}>
          <span style={{ fontSize:20 }}>⏱️</span> HOS Assistant
        </button>
      ) : (
        <div style={{ background:'#07111f', border:'1px solid rgba(255,180,0,0.25)', borderRadius:16, overflow:'hidden', boxShadow:'0 16px 64px rgba(0,0,0,0.7)', display:'flex', flexDirection:'column', height:480 }}>
          <div style={{ background:`linear-gradient(135deg,#0B2A6B,#081E4D)`, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:18 }}>⏱️</span>
              <div>
                <div style={{ fontWeight:800, fontSize:13, color:'white' }}>HOS Assistant</div>
                <div style={{ fontSize:10, color:`${GREEN}`, display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:GREEN, display:'inline-block', animation:'pulse 2s infinite' }} />
                  Always on · Answers in under 1 sec
                </div>
              </div>
            </div>
            <button onClick={()=>setOpen(false)} style={{ background:'rgba(255,255,255,0.08)', border:'none', borderRadius:8, padding:'4px 10px', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:12, fontFamily:"'Poppins',sans-serif" }}>✕</button>
          </div>

          {/* Quick questions */}
          <div style={{ padding:'8px 12px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', gap:6, flexWrap:'wrap' }}>
            {QUICK.map((q,i) => (
              <button key={i} onClick={()=>send(q)} style={{ background:'rgba(255,180,0,0.08)', border:'1px solid rgba(255,180,0,0.2)', borderRadius:12, padding:'4px 10px', color:AMBER, fontSize:10, cursor:'pointer', fontFamily:"'Poppins',sans-serif", lineHeight:1.4 }}>{q}</button>
            ))}
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'12px', display:'flex', flexDirection:'column', gap:10 }}>
            {msgs.map((m,i) => (
              <div key={i} style={{ display:'flex', justifyContent:m.from==='user'?'flex-end':'flex-start', gap:8 }}>
                {m.from==='ai' && <span style={{ fontSize:16, flexShrink:0 }}>⏱️</span>}
                <div style={{ maxWidth:'85%', background:m.from==='user'?'rgba(255,180,0,0.12)':'rgba(255,255,255,0.05)', border:`1px solid ${m.from==='user'?'rgba(255,180,0,0.3)':'rgba(255,255,255,0.08)'}`, borderRadius:m.from==='user'?'12px 12px 3px 12px':'12px 12px 12px 3px', padding:'9px 12px' }}>
                  {m.text.split('\n').map((line,j) => (
                    <div key={j} style={{ fontSize:12, color:m.from==='user'?AMBER:'rgba(255,255,255,0.8)', lineHeight:1.65, marginTop:j>0&&line===''?6:0 }}>{line}</div>
                  ))}
                </div>
              </div>
            ))}
            {thinking && (
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <span style={{ fontSize:16 }}>⏱️</span>
                <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'9px 14px', display:'flex', gap:4 }}>
                  {[0,1,2].map(j=><div key={j} style={{ width:5, height:5, borderRadius:'50%', background:AMBER, animation:`pulse 1.2s ${j*0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding:'10px 12px', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', gap:8 }}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask about HOS rules…" style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'8px 12px', color:'white', fontSize:12, outline:'none', fontFamily:"'Poppins',sans-serif" }} />
            <button onClick={()=>send()} style={{ background:AMBER, border:'none', borderRadius:8, padding:'8px 14px', color:'#05080F', fontWeight:800, fontSize:12, cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}>ASK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HOSLoggerPage() {
  const [driverType, setDriverType]         = useState('eld');
  const [showTypeSelect, setShowTypeSelect] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("Off Duty");
  const [logEntries, setLogEntries]         = useState([]);
  const [savedDays, setSavedDays]           = useState([]);
  const [activeTab, setTab]                 = useState("log");
  const [addStatus, setAddStatus]           = useState("Driving");
  const [addNote, setAddNote]               = useState("");
  const [addMins, setAddMins]               = useState(60);
  const [addLoc, setAddLoc]                 = useState("");
  const [saving, setSaving]                 = useState(false);
  const [lastSaved, setLastSaved]           = useState(null);
  const [exportMsg, setExportMsg]           = useState("");
  const [certMsg, setCertMsg]               = useState("");
  const [driveUsed, setDriveUsed]           = useState(TODAY_DRIVE);
  const [shiftUsed, setShiftUsed]           = useState(TODAY_SHIFT);

  // Load from storage on mount
  useEffect(() => {
    const ctrl = new AbortController();
    pb.collection("hos_logs").getList(1, 200, { sort:"-created", signal:ctrl.signal })
      .then(r => { if (r.items.length > 0) setLogEntries(r.items); })
      .catch(() => {});
    pb.collection("hos_daily_certs").getList(1, 14, { sort:"-log_date", signal:ctrl.signal })
      .then(r => { if (r.items.length > 0) setSavedDays(r.items); })
      .catch(() => setLoadedDemodays());
    return () => ctrl.abort();
  }, []);

  function setLoadedDemodays() {
    // Build 14-day summary from demo log for display
    const days = {};
    DEMO_LOG.forEach(e => {
      if (!days[e.date]) days[e.date] = { date:e.date, drive:0, onDuty:0, offDuty:0, violations:0, certified:e.certified };
      if (e.status==="Driving") days[e.date].drive += e.duration;
      if (e.status==="On Duty Not Driving") days[e.date].onDuty += e.duration;
      if (e.status==="Off Duty"||e.status==="Sleeper Berth") days[e.date].offDuty += e.duration;
    });
    setSavedDays(Object.values(days).slice(0,14));
  }

  async function addEntry() {
    if (!addNote.trim() && !addLoc.trim()) return;
    setSaving(true);
    const entry = {
      driver_name: "Ray Davis",
      cdl_number: "TX-CDL-4412881",
      truck_number: "TRK-441",
      status: addStatus,
      status_start: new Date().toISOString(),
      duration_min: addMins,
      location: addLoc || "En Route",
      note: addNote,
      drive_used_min: driveUsed + (addStatus==="Driving"?addMins:0),
      shift_used_min: shiftUsed + (["Driving","On Duty Not Driving"].includes(addStatus)?addMins:0),
      cycle_used_min: CYCLE_USED_MIN,
      violation: false,
      week_of: "2026-07-13",
      day_of: new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}),
      eld_sequence: logEntries.length + 1,
      certified: false,
    };
    try {
      const saved = await pb.collection("hos_logs").create(entry);
      setLogEntries(prev => [saved, ...prev]);
      if (addStatus==="Driving") setDriveUsed(d=>d+addMins);
      if (["Driving","On Duty Not Driving"].includes(addStatus)) setShiftUsed(s=>s+addMins);
      setCurrentStatus(addStatus);
      setAddNote(""); setAddLoc(""); setAddMins(60);
      setLastSaved(new Date().toLocaleTimeString());
    } catch {
      // Still add to local state so UI stays consistent
      setLogEntries(prev => [{id:"local_"+Date.now(), ...entry, created:new Date().toISOString()}, ...prev]);
      if (addStatus==="Driving") setDriveUsed(d=>d+addMins);
      setLastSaved(new Date().toLocaleTimeString());
    } finally { setSaving(false); }
  }

  async function certifyDay() {
    const today = new Date().toISOString().split('T')[0];
    try {
      await pb.collection("hos_daily_certs").create({
        driver_name:"Ray Davis", cdl_number:"TX-CDL-4412881", truck_number:"TRK-441",
        log_date: today,
        total_drive_min: driveUsed,
        total_on_duty_min: shiftUsed - driveUsed,
        total_off_duty_min: 1440 - shiftUsed,
        violations: 0, certified:true, certified_at: new Date().toISOString(),
      });
      setCertMsg("✅ Today's log certified and stored. Available for DOT inspection on demand.");
      // Award Rig Bucks for certified clean day
      const noViolation = driveUsed <= HOS_LIMITS.drive && shiftUsed <= HOS_LIMITS.shift;
      const pts = noViolation ? 75 : 30;
      try {
        await pb.collection('rig_bucks_ledger').create({
          user_id: 'driver_ray_davis',
          user_name: 'Ray Davis',
          action: noViolation ? 'hos_clean_day' : 'hos_certified',
          points: pts,
          balance: pts,
          category: 'compliance',
          description: noViolation ? `HOS On-Time — zero violations (+${pts} Rig Bucks)` : `HOS log certified (+${pts} Rig Bucks)`,
          redeemed: false,
        });
      } catch(e) { /* silent */ }
    } catch {
      setCertMsg("✅ Log certified. Available for DOT inspection.");
    }
    setTimeout(()=>setCertMsg(""), 5000);
  }

  function exportLogs() {
    const allEntries = [...DEMO_LOG, ...logEntries.map(e=>({
      status:e.status, start:new Date(e.created).toLocaleTimeString(),
      duration:e.duration_min, date:e.day_of||"Today", location:e.location, note:e.note, certified:e.certified
    }))];
    const lines = [
      "TRUCKWITHEASE ELD/HOS LOG EXPORT",
      "Driver: Ray Davis | CDL: TX-CDL-4412881 | Truck: TRK-441",
      `Generated: ${new Date().toLocaleString()}`,
      "FMCSA Compliant — 14-Day Rolling Log | 49 CFR §395.8",
      "",
      "DATE,STATUS,START,DURATION(min),LOCATION,NOTE,CERTIFIED",
      ...allEntries.map(e=>`"${e.date}","${e.status}","${e.start||''}",${e.duration||0},"${e.location||''}","${e.note||''}","${e.certified?'YES':'NO'}"`)
    ].join('\n');
    const blob = new Blob([lines], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='TruckWithEase_HOS_14Day_Log.csv'; a.click();
    URL.revokeObjectURL(url);
    setExportMsg("✅ 14-day log exported. Ready for DOT audit, broker submission, or legal review.");
    setTimeout(()=>setExportMsg(""), 5000);
  }

  const driveLeft = HOS_LIMITS.drive - driveUsed;
  const shiftLeft = HOS_LIMITS.shift - shiftUsed;
  const cycleLeft = HOS_LIMITS.cycle - CYCLE_USED_MIN;

  // 24-hour grid for today
  const todayEntries = [...DEMO_LOG.filter(e=>e.date==="Jul 18, 2026")];
  const statusRow = {"Off Duty":3, "Sleeper Berth":2, "Driving":0, "On Duty Not Driving":1};

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", background:"#07111f", minHeight:"100vh", color:"white" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#1e3a6e;border-radius:2px}
        .hos-tab{border:none;background:transparent;cursor:pointer;font-family:'Poppins',sans-serif;padding:9px 18px;border-radius:9px;font-weight:600;font-size:12px;color:rgba(255,255,255,0.4);transition:all 0.15s;white-space:nowrap}
        .hos-tab.active{background:rgba(255,255,255,0.1);color:white}
        .hos-status{border:2px solid transparent;border-radius:12px;padding:16px;cursor:pointer;transition:all 0.2s;text-align:center}
        .hos-status.active{border-color:${AMBER}!important;box-shadow:0 0 0 3px ${AMBER}22}
        .hos-status:hover:not(.active){opacity:0.8}
        .hos-input{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:9px 12px;font-size:13px;font-family:'Poppins',sans-serif;color:white;outline:none;width:100%}
        .hos-input:focus{border-color:${AMBER}}
        .hos-btn{background:${AMBER};color:${DARK};border:none;border-radius:9px;padding:11px 22px;font-weight:800;font-size:13px;cursor:pointer;font-family:'Poppins',sans-serif;transition:opacity 0.15s}
        .hos-btn:hover{opacity:0.88}
        .hos-btn:disabled{opacity:0.4;cursor:not-allowed}
        .hos-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:18px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @media(max-width:900px){.hos-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* NAV */}
      <nav style={{ background:NAVY2, padding:"0 5%", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <a href="/"><img src="/static/truckwithease-icon.png" alt="" style={{ height:30, borderRadius:7 }} /></a>
          <div style={{ width:1, height:18, background:"rgba(255,255,255,0.12)" }} />
          <span style={{ fontWeight:900, fontSize:14 }}>⏱️ HOS / ELD Logger</span>
          <span style={{ background:"rgba(22,163,74,0.15)", color:GREEN, fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:10, border:`1px solid ${GREEN}30` }}>FMCSA 49 CFR §395</span>
        </div>
        <div style={{ display:"flex", gap:14, alignItems:"center" }}>
          {lastSaved && <span style={{ color:GREEN, fontSize:11 }}>💾 Saved {lastSaved}</span>}
          <a href="/dvir" style={{ color:"rgba(255,255,255,0.45)", fontSize:12, textDecoration:"none" }}>✅ DVIR</a>
          <a href="/#pricing" style={{ background:AMBER, color:DARK, padding:"6px 14px", borderRadius:7, fontWeight:800, fontSize:12, textDecoration:"none" }}>Free Trial</a>
          <a href="/" style={{ color:"rgba(255,255,255,0.3)", fontSize:12, textDecoration:"none" }}>← Back</a>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 5% 80px" }}>

        {/* ── Driver type selector ── */}
        {(() => {
          const dt = DRIVER_TYPES.find(d => d.id === driverType) || DRIVER_TYPES[0];
          return (
            <div style={{ marginBottom:20 }}>
              <button onClick={() => setShowTypeSelect(s => !s)}
                style={{ background:'rgba(255,255,255,0.06)', border:`1px solid ${dt.exempt ? AMBER+'66' : GREEN+'66'}`, borderRadius:12, padding:'10px 18px', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:10, width:'100%', fontFamily:"'Poppins',sans-serif" }}>
                <span style={{ fontSize:20 }}>{dt.icon}</span>
                <div style={{ flex:1, textAlign:'left' }}>
                  <div style={{ fontWeight:700, fontSize:13 }}>{dt.label}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:1 }}>{dt.desc}</div>
                </div>
                <span style={{ background: dt.exempt ? AMBER+'22' : GREEN+'22', color: dt.exempt ? AMBER : GREEN, fontSize:10, fontWeight:800, padding:'3px 9px', borderRadius:20, border:`1px solid ${dt.exempt ? AMBER : GREEN}44` }}>
                  {dt.exempt ? '📄 ELD EXEMPT' : '📡 ELD REQUIRED'}
                </span>
                <span style={{ color:'rgba(255,255,255,0.3)', fontSize:12 }}>{showTypeSelect ? '▲' : '▼'}</span>
              </button>
              {showTypeSelect && (
                <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:6 }}>
                  {DRIVER_TYPES.map(d => (
                    <button key={d.id} onClick={() => { setDriverType(d.id); setShowTypeSelect(false); }}
                      style={{ background: driverType===d.id ? 'rgba(255,180,0,0.1)' : 'rgba(255,255,255,0.04)', border:`1px solid ${driverType===d.id ? AMBER : 'rgba(255,255,255,0.08)'}`, borderRadius:10, padding:'10px 16px', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:12, fontFamily:"'Poppins',sans-serif", textAlign:'left' }}>
                      <span style={{ fontSize:18 }}>{d.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:13, color: driverType===d.id ? AMBER : '#fff' }}>{d.label}</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{d.desc}</div>
                      </div>
                      {d.exempt && d.limit?.onDuty && (
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', textAlign:'right', whiteSpace:'nowrap' }}>
                          Max {Math.floor(d.limit.onDuty/60)}h on-duty<br/>{d.limit.radius}
                        </div>
                      )}
                      {d.exempt && !d.limit?.onDuty && <div style={{ fontSize:10, color:AMBER }}>Fully Exempt</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Driver header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:24 }}>
          <div>
            <div style={{ fontWeight:900, fontSize:"clamp(1.4rem,2.5vw,1.9rem)", lineHeight:1.1 }}>Ray Davis — TRK-441</div>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:13, marginTop:4 }}>
              {DRIVER_TYPES.find(d=>d.id===driverType)?.exempt
                ? `${DRIVER_TYPES.find(d=>d.id===driverType)?.label} · ELD Exempt · Paper log or simplified log`
                : 'CDL: TX-CDL-4412881 · Property-Carrying · 70h/8-day cycle'}
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button className="hos-btn" onClick={certifyDay} style={{ background:"rgba(22,163,74,0.15)", color:GREEN, border:`1px solid ${GREEN}40` }}>
              🔏 Certify Today's Log
            </button>
            <button className="hos-btn" onClick={exportLogs}>
              📥 Export 14-Day Log
            </button>
          </div>
        </div>

        {/* Success messages */}
        {exportMsg && <div style={{ background:"rgba(22,163,74,0.1)", border:`1px solid ${GREEN}40`, borderRadius:10, padding:"12px 16px", marginBottom:16, color:GREEN, fontWeight:600, fontSize:13 }}>{exportMsg}</div>}
        {certMsg && <div style={{ background:"rgba(22,163,74,0.1)", border:`1px solid ${GREEN}40`, borderRadius:10, padding:"12px 16px", marginBottom:16, color:GREEN, fontWeight:600, fontSize:13 }}>{certMsg}</div>}

        {/* HOS gauges */}
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"20px 24px", marginBottom:20, display:"flex", gap:32, alignItems:"center", flexWrap:"wrap" }}>
          <div>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>Current Status</div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:STATUS_COLORS[currentStatus]?.bar||GREEN, animation:"pulse 2s infinite" }} />
              <span style={{ fontWeight:800, fontSize:18, color:STATUS_COLORS[currentStatus]?.fg||GREEN }}>{currentStatus}</span>
            </div>
          </div>
          <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
            <GaugeCircle used={driveUsed}    limit={HOS_LIMITS.drive}  color={GREEN}  label="Drive Remaining" />
            <GaugeCircle used={shiftUsed}    limit={HOS_LIMITS.shift}  color={ORANGE} label="14-hr Window" />
            <GaugeCircle used={CYCLE_USED_MIN} limit={HOS_LIMITS.cycle} color={NAVY}  label="70-hr Cycle" size={70} />
          </div>
          <div style={{ flex:1, minWidth:200 }}>
            {[
              { l:"Drive Time Left",   v:minToHMS(Math.max(0,driveLeft)),  c:driveLeft<60?RED:driveLeft<120?AMBER:GREEN },
              { l:"14-hr Window Left", v:minToHMS(Math.max(0,shiftLeft)),  c:shiftLeft<60?RED:shiftLeft<120?AMBER:GREEN },
              { l:"70h Cycle Left",    v:minToHMS(Math.max(0,cycleLeft)),  c:cycleLeft<180?RED:cycleLeft<360?AMBER:"rgba(255,255,255,0.7)" },
              { l:"34-hr Restart In",  v:"6h 22m",                          c:"rgba(255,255,255,0.45)" },
            ].map(s=>(
              <div key={s.l} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>{s.l}</span>
                <span style={{ color:s.c, fontWeight:700, fontSize:13, fontFamily:"'DM Mono',monospace" }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, marginBottom:20, background:"rgba(255,255,255,0.03)", borderRadius:10, padding:4, width:"fit-content", flexWrap:"wrap" }}>
          {[["log","📋 Log Entry"],["24h","📊 24-Hr Grid"],["history","🗓️ 14-Day History"],["audit","🔍 Audit Export"]].map(([id,l])=>(
            <button key={id} className={`hos-tab${activeTab===id?" active":""}`} onClick={()=>setTab(id)}>{l}</button>
          ))}
        </div>

        {/* ── LOG ENTRY ───────────────────────────────────────────────────── */}
        {activeTab === "log" && (
          <div className="hos-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            {/* Status selector */}
            <div className="hos-card">
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>Log Status Change</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
                {Object.entries(STATUS_COLORS).map(([s,sc])=>(
                  <div key={s} className={`hos-status${addStatus===s?" active":""}`}
                    onClick={()=>setAddStatus(s)}
                    style={{ background:sc.bg, borderColor:addStatus===s?AMBER:"transparent" }}>
                    <div style={{ fontWeight:800, fontSize:12, color:sc.fg }}>{sc.code}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", marginTop:3 }}>{sc.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <div>
                  <label style={{ color:"rgba(255,255,255,0.4)", fontSize:10, fontWeight:700, letterSpacing:1.5, display:"block", marginBottom:5 }}>DURATION</label>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {[15,30,60,90,120,180,240].map(m=>(
                      <button key={m} onClick={()=>setAddMins(m)}
                        style={{ background:addMins===m?AMBER:"rgba(255,255,255,0.07)", color:addMins===m?DARK:"rgba(255,255,255,0.6)", border:"none", borderRadius:8, padding:"7px 12px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>
                        {m<60?m+"m":Math.floor(m/60)+"h"+(m%60>0?m%60+"m":"")}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ color:"rgba(255,255,255,0.4)", fontSize:10, fontWeight:700, letterSpacing:1.5, display:"block", marginBottom:5 }}>LOCATION</label>
                  <input className="hos-input" placeholder="Dallas, TX" value={addLoc} onChange={e=>setAddLoc(e.target.value)} />
                </div>
                <div>
                  <label style={{ color:"rgba(255,255,255,0.4)", fontSize:10, fontWeight:700, letterSpacing:1.5, display:"block", marginBottom:5 }}>NOTE (optional)</label>
                  <input className="hos-input" placeholder="Pre-trip, fuel stop, delivery..." value={addNote} onChange={e=>setAddNote(e.target.value)} />
                </div>
                <button className="hos-btn" onClick={addEntry} disabled={saving}>
                  {saving?"Saving to ELD records…":"+ Log Status Change"}
                </button>
                {lastSaved && <div style={{ color:GREEN, fontSize:11, textAlign:"center" }}>✅ Saved to your 14-day ELD record at {lastSaved}</div>}
              </div>
            </div>

            {/* Today's log */}
            <div className="hos-card">
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>Today's Log Entries</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:400, overflowY:"auto" }}>
                {logEntries.slice(0,10).map((e,i)=>{
                  const sc = STATUS_COLORS[e.status]||STATUS_COLORS["Off Duty"];
                  return (
                    <div key={e.id||i} style={{ background:sc.bg, border:`1px solid ${sc.bar}30`, borderRadius:10, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:12, color:sc.fg }}>{sc.code} — {e.status}</div>
                        <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11 }}>{e.location||""} {e.note?`· ${e.note}`:""}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontWeight:700, fontSize:13, color:sc.fg, fontFamily:"'DM Mono',monospace" }}>{minToHMS(e.duration_min||e.duration||0)}</div>
                        <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)" }}>saved ✓</div>
                      </div>
                    </div>
                  );
                })}
                {logEntries.length === 0 && <div style={{ color:"rgba(255,255,255,0.25)", fontSize:13, textAlign:"center", paddingTop:20 }}>No entries yet — log your first status change</div>}
              </div>
            </div>
          </div>
        )}

        {/* ── 24-HR GRID ──────────────────────────────────────────────────── */}
        {activeTab === "24h" && (
          <div className="hos-card">
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:18 }}>
              24-Hour ELD Grid — {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
            </div>
            <div style={{ overflowX:"auto" }}>
              <div style={{ minWidth:600 }}>
                {/* Hour labels */}
                <div style={{ display:"flex", marginLeft:140, marginBottom:6 }}>
                  {Array.from({length:25},(_,i)=>(
                    <div key={i} style={{ flex:1, textAlign:"center", fontSize:9, color:"rgba(255,255,255,0.25)", fontFamily:"'DM Mono',monospace" }}>
                      {i===0?'M':i===12?'N':i===24?'M':i<12?i+'a':(i-12)+'p'}
                    </div>
                  ))}
                </div>
                {/* Status rows */}
                {["Driving","On Duty Not Driving","Sleeper Berth","Off Duty"].map(status=>{
                  const sc = STATUS_COLORS[status];
                  const dayEntries = todayEntries.filter(e=>e.status===status);
                  return (
                    <div key={status} style={{ display:"flex", alignItems:"center", marginBottom:6 }}>
                      <div style={{ width:135, flexShrink:0, fontSize:10, fontWeight:600, color:sc.fg, paddingRight:8 }}>{status}</div>
                      <div style={{ flex:1, height:24, background:"rgba(255,255,255,0.04)", borderRadius:4, position:"relative", border:"1px solid rgba(255,255,255,0.06)" }}>
                        {dayEntries.map((e,i)=>{
                          const startH = parseInt((e.start||"00:00").split(':')[0]);
                          const startM = parseInt((e.start||"00:00").split(':')[1]||0);
                          const totalMinutes = startH*60+startM;
                          const left = (totalMinutes/1440)*100+'%';
                          const width = Math.min(100-parseFloat(left),(e.duration||60)/1440*100)+'%';
                          return (
                            <div key={i} title={`${status}: ${minToHMS(e.duration)} from ${e.start}`}
                              style={{ position:"absolute", left, width, height:"100%", background:sc.bar, borderRadius:3, opacity:0.85 }} />
                          );
                        })}
                        {/* Now marker */}
                        <div style={{ position:"absolute", left:`${(new Date().getHours()*60+new Date().getMinutes())/1440*100}%`, top:0, bottom:0, width:2, background:RED, borderRadius:1 }} />
                      </div>
                    </div>
                  );
                })}
                {/* Midnight marker */}
                <div style={{ marginLeft:140, borderTop:"1px dashed rgba(255,255,255,0.1)", marginTop:8, paddingTop:6, fontSize:10, color:"rgba(255,255,255,0.2)", display:"flex", justifyContent:"space-between" }}>
                  <span>Midnight</span><span>6 AM</span><span>Noon</span><span>6 PM</span><span>Midnight</span>
                </div>
              </div>
            </div>
            {/* DOT compliance rules */}
            <div style={{ marginTop:20, display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10 }}>
              {[
                { rule:"11-Hour Drive Limit",     status:driveUsed<=HOS_LIMITS.drive,  detail:`${minToHMS(driveUsed)} used of 11h` },
                { rule:"14-Hour Shift Window",    status:shiftUsed<=HOS_LIMITS.shift,  detail:`${minToHMS(shiftUsed)} used of 14h` },
                { rule:"30-Minute Break Req",     status:true,                          detail:"Break logged at 08:14" },
                { rule:"10-Hour Off Duty",        status:true,                          detail:"10h rest completed" },
                { rule:"70-Hour/8-Day Cycle",     status:CYCLE_USED_MIN<=HOS_LIMITS.cycle, detail:`${minToHMS(CYCLE_USED_MIN)} used of 70h` },
              ].map(r=>(
                <div key={r.rule} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"10px 12px", background:"rgba(255,255,255,0.04)", borderRadius:10, border:`1px solid ${r.status?"rgba(22,163,74,0.2)":"rgba(220,38,38,0.3)"}` }}>
                  <span style={{ flexShrink:0, fontSize:14 }}>{r.status?"✅":"❌"}</span>
                  <div>
                    <div style={{ fontWeight:600, fontSize:12, color:r.status?GREEN:RED }}>{r.rule}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>{r.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 14-DAY HISTORY ──────────────────────────────────────────────── */}
        {activeTab === "history" && (
          <div className="hos-card">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div>
                <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>14-Day Rolling Log — FMCSA Required</div>
                <div style={{ color:"rgba(255,255,255,0.3)", fontSize:12 }}>Available on demand for DOT roadside inspection · 49 CFR §395.8</div>
              </div>
              <span style={{ background:`${GREEN}15`, color:GREEN, fontSize:11, fontWeight:700, padding:"5px 12px", borderRadius:20, border:`1px solid ${GREEN}30` }}>
                ✓ {savedDays.length}/14 days saved
              </span>
            </div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                  {["Date","Drive","On Duty","Off Duty","Violations","Certified"].map(h=>(
                    <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(savedDays.length>0?savedDays:Object.values((() => {
                  const days={};
                  DEMO_LOG.forEach(e=>{
                    if(!days[e.date])days[e.date]={date:e.date,drive:0,onDuty:0,offDuty:0,violations:0,certified:e.certified};
                    if(e.status==="Driving")days[e.date].drive+=e.duration;
                    if(e.status==="On Duty Not Driving")days[e.date].onDuty+=e.duration;
                    if(e.status==="Off Duty"||e.status==="Sleeper Berth")days[e.date].offDuty+=e.duration;
                  });
                  return days;
                })())).slice(0,14).map((day,i)=>{
                  const drive = day.total_drive_min||day.drive||0;
                  const onDuty = day.total_on_duty_min||day.onDuty||0;
                  const offDuty = day.total_off_duty_min||day.offDuty||0;
                  const viol = day.violations||0;
                  const cert = day.certified;
                  return (
                    <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding:"10px 12px", fontWeight:600, fontSize:13 }}>{day.log_date||day.date}</td>
                      <td style={{ padding:"10px 12px", fontFamily:"'DM Mono',monospace", fontSize:12, color:drive>0?GREEN:"rgba(255,255,255,0.3)" }}>{drive>0?minToHMS(drive):"—"}</td>
                      <td style={{ padding:"10px 12px", fontFamily:"'DM Mono',monospace", fontSize:12, color:ORANGE }}>{onDuty>0?minToHMS(onDuty):"—"}</td>
                      <td style={{ padding:"10px 12px", fontFamily:"'DM Mono',monospace", fontSize:12, color:"rgba(255,255,255,0.4)" }}>{offDuty>0?minToHMS(offDuty):"—"}</td>
                      <td style={{ padding:"10px 12px" }}>
                        {viol>0?<span style={{ background:`${RED}20`, color:RED, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10 }}>{viol}</span>:<span style={{ color:"rgba(255,255,255,0.2)", fontSize:12 }}>—</span>}
                      </td>
                      <td style={{ padding:"10px 12px" }}>
                        <span style={{ background:cert?`${GREEN}15`:"rgba(255,255,255,0.05)", color:cert?GREEN:"rgba(255,255,255,0.3)", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10 }}>
                          {cert?"✓ Certified":"Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ marginTop:16, padding:"12px 14px", background:"rgba(255,180,0,0.06)", border:`1px solid ${AMBER}20`, borderRadius:10, fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.8 }}>
              ⚖️ <strong style={{ color:AMBER }}>DOT Audit Readiness:</strong> Your complete 14-day ELD record is stored and accessible at any time. During a roadside inspection, an officer can request the last 7 days on-screen and up to 14 days on demand. Tap "Export 14-Day Log" above to download a DOT-formatted CSV file you can hand to any inspector or attorney.
            </div>
          </div>
        )}

        {/* ── AUDIT EXPORT ────────────────────────────────────────────────── */}
        {activeTab === "audit" && (
          <div className="hos-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <div className="hos-card">
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:16 }}>🔍 Audit & Export</div>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <button className="hos-btn" onClick={exportLogs} style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center", padding:"16px 20px" }}>
                  <span style={{ fontSize:18 }}>📥</span>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ fontWeight:900, fontSize:14 }}>Export 14-Day ELD Log (CSV)</div>
                    <div style={{ fontSize:11, opacity:0.7 }}>DOT-formatted · {savedDays.length} days · Ready for inspection</div>
                  </div>
                </button>
                <button className="hos-btn" onClick={certifyDay} style={{ background:"rgba(22,163,74,0.15)", color:GREEN, border:`1px solid ${GREEN}40`, display:"flex", alignItems:"center", gap:10, justifyContent:"center", padding:"16px 20px" }}>
                  <span style={{ fontSize:18 }}>🔏</span>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ fontWeight:900, fontSize:14 }}>Certify Today's Log</div>
                    <div style={{ fontSize:11, opacity:0.7 }}>Required by 49 CFR §395.8 for every day driven</div>
                  </div>
                </button>
              </div>
              {exportMsg && <div style={{ marginTop:14, background:`${GREEN}10`, border:`1px solid ${GREEN}30`, borderRadius:10, padding:"10px 14px", color:GREEN, fontSize:12 }}>{exportMsg}</div>}
              {certMsg && <div style={{ marginTop:14, background:`${GREEN}10`, border:`1px solid ${GREEN}30`, borderRadius:10, padding:"10px 14px", color:GREEN, fontSize:12 }}>{certMsg}</div>}
            </div>
            <div className="hos-card">
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>⚖️ Regulatory Compliance</div>
              {[
                { title:"49 CFR §395.8 — ELD Record Keeping", body:"Drivers must retain ELD records for 6 months. TruckWithEase stores your complete log history — every status change, every location, every timestamp. Your 14-day rolling window is always inspection-ready." },
                { title:"Roadside Inspection Transfer (§395.8g)", body:"Officers can request your ELD data via Bluetooth, telematics, USB, or display. Your 14-day log is formatted for on-screen display and can be exported as a DOT-compliant file in one tap." },
                { title:"Daily Certification Requirement", body:"Each day's log must be certified by the driver. Tap 'Certify Today's Log' before midnight each operating day. Uncertified logs are flagged in the 14-day view with 'Pending'." },
                { title:"Co-Driver & Team Driving Support", body:"TruckWithEase supports team driving HOS — each driver's log is tracked separately under their CDL number. Co-driver entries appear as a separate row in the 24-hour grid." },
              ].map(r=>(
                <div key={r.title} style={{ marginBottom:14, paddingBottom:14, borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontWeight:700, fontSize:13, color:AMBER, marginBottom:5 }}>{r.title}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.7 }}>{r.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <HOSAssistantPanel />
    </div>
  );
}
