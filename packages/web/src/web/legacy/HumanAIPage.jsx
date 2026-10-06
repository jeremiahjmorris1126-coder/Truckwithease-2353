import { useState, useRef, useEffect } from "react";

const NAVY   = "#0B2A6B";
const NAVY2  = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER  = "#FFB400";
const GREEN  = "#16A34A";
const RED    = "#DC2626";
const PURPLE = "#7C3AED";
const DARK   = "#06090F";

// ─── Data ────────────────────────────────────────────────────────────────────
const DRIVERS = [
  { id:1, name:"Ray Davis",     truck:"TRK-441", cdl:"TX-CDL-441892", medCard:"2027-03-15", drugTest:"2026-05-01", violations:0, safetyScore:98, status:"Active",  mileRate:0.55, hoursWeek:52, detentionHrs:2.3 },
  { id:2, name:"James Miller",  truck:"TRK-228", cdl:"TN-CDL-228441", medCard:"2026-09-03", drugTest:"2026-03-12", violations:1, safetyScore:91, status:"Active",  mileRate:0.55, hoursWeek:44, detentionHrs:5.1 },
  { id:3, name:"Tony Williams", truck:"TRK-317", cdl:"MO-CDL-317882", medCard:"2027-01-20", drugTest:"2026-06-15", violations:0, safetyScore:95, status:"Active",  mileRate:0.60, hoursWeek:60, detentionHrs:0 },
  { id:4, name:"Andre Johnson", truck:"TRK-509", cdl:"GA-CDL-509224", medCard:"2026-08-11", drugTest:"2025-11-30", violations:2, safetyScore:87, status:"Inactive",mileRate:0.50, hoursWeek:0,  detentionHrs:0 },
  { id:5, name:"Derrick Brown", truck:"TRK-102", cdl:"TX-CDL-102773", medCard:"2027-06-30", drugTest:"2026-04-22", violations:0, safetyScore:93, status:"Active",  mileRate:0.55, hoursWeek:38, detentionHrs:1.5 },
];

const APPLICANTS = [
  { id:1, name:"Marcus Thompson", applied:"Jul 10", cdlClass:"Class A", exp:"8 years", state:"TX", score:92, status:"pending" },
  { id:2, name:"Linda Okafor",    applied:"Jul 8",  cdlClass:"Class A", exp:"5 years", state:"IL", score:88, status:"screening" },
  { id:3, name:"Steve Ramirez",   applied:"Jul 5",  cdlClass:"Class A", exp:"12 years",state:"CA", score:95, status:"approved" },
];

const INCIDENTS = [
  { id:1, driver:"James Miller",  date:"Jul 9",  type:"HOS Violation",   severity:"Minor",  desc:"14-hour window exceeded by 22 min — dispatch error. Corrected.",     status:"resolved" },
  { id:2, driver:"Andre Johnson", date:"Jul 3",  type:"DOT Inspection",  severity:"Major",  desc:"Out-of-service violation: brake adjustment. Vehicle grounded 48h.",   status:"open" },
  { id:3, driver:"Andre Johnson", date:"Jun 18", type:"Accident Report",  severity:"Major",  desc:"Minor fender bender at fuel stop. No injuries. Insurance filed.",    status:"resolved" },
];

const PAYROLL_WEEK = "Jul 7–12, 2026";

function daysUntil(dateStr) {
  const d = new Date(dateStr);
  return Math.round((d - new Date()) / 86400000);
}

function docStatus(days) {
  if (days < 0)  return { label:"Expired",  color:RED };
  if (days < 30) return { label:`${days}d`,  color:RED };
  if (days < 90) return { label:`${days}d`,  color:AMBER };
  return             { label:"Current",  color:GREEN };
}

export default function HReasePage() {
  const [tab,         setTab]         = useState("roster");
  const [selectedDriver, setDriver]   = useState(null);
  const [payrollDone, setPayrollDone] = useState(false);
  const [runningPayroll, setRunning]  = useState(false);
  const [aiInput,     setAiInput]     = useState("");
  const [aiMessages,  setAiMessages]  = useState([
    { role:"ai", text:"I'm HRease — your fleet HR manager. I track CDL expiries, run payroll, manage applicants, and handle compliance. What do you need?" }
  ]);
  const [activeApplicant, setApplicant] = useState(null);
  const [interviewStep,   setStep]      = useState(0);
  const chatEnd = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [aiMessages]);

  const payroll = DRIVERS.filter(d => d.status === "Active").map(d => {
    const miles    = Math.round(d.hoursWeek * 55 * 0.9);
    const milesPay = miles * d.mileRate;
    const detention= d.detentionHrs * 50;
    const bonus    = d.safetyScore >= 95 ? 100 : 0;
    return { ...d, miles, milesPay, detention, bonus, gross: milesPay + detention + bonus };
  });

  const totalPayroll = payroll.reduce((s, p) => s + p.gross, 0);

  function runPayroll() {
    setRunning(true);
    setTimeout(() => { setPayrollDone(true); setRunning(false); }, 2000);
  }

  function sendAiMsg() {
    if (!aiInput.trim()) return;
    const q = aiInput.trim();
    setAiMessages(m => [...m, { role:"user", text:q }]);
    setAiInput("");
    setTimeout(() => {
      const ql = q.toLowerCase();
      let r;
      if (ql.includes("payroll") || ql.includes("pay"))
        r = `Payroll for ${PAYROLL_WEEK}: Ray Davis $${payroll[0]?.gross.toFixed(2)} · James Miller $${payroll[1]?.gross.toFixed(2)} (incl. $${payroll[1]?.detention.toFixed(2)} detention) · Tony Williams $${payroll[2]?.gross.toFixed(2)} (incl. $100 bonus) · Derrick Brown $${payroll[4]?.gross.toFixed(2)}. Total: $${totalPayroll.toLocaleString("en-US",{minimumFractionDigits:2})}. Ready to export — confirm?`;
      else if (ql.includes("expir") || ql.includes("cdl") || ql.includes("med"))
        r = "James Miller's DOT medical card expires Sep 3, 2026 — 51 days out. Andre Johnson's drug test is overdue by 226 days. HAZMAT endorsement renewals: none due in the next 90 days.";
      else if (ql.includes("violation") || ql.includes("incident"))
        r = "Andre Johnson has 2 major violations on record — the OOS brake citation from Jul 3 is still open. James Miller has 1 minor HOS violation, resolved. Ray Davis, Tony Williams, and Derrick Brown have clean records.";
      else if (ql.includes("applicant") || ql.includes("hiring") || ql.includes("hire"))
        r = "3 active applicants: Steve Ramirez (12 years exp, AI score 95 — recommended for immediate hire), Marcus Thompson (pending pre-screen), Linda Okafor (in screening). Want me to run Steve's background check intake now?";
      else if (ql.includes("ab5") || ql.includes("california") || ql.includes("compliance"))
        r = "California AB5: if any of your drivers operate in CA as independent contractors, you may need to reclassify. Tony Williams ran 3 CA loads in Q2 — I'd recommend legal review before Q3 CA dispatches. Do you want me to flag his contract?";
      else
        r = "I can help with payroll calculation, CDL/medical card expiry tracking, driver incident reports, AB5 compliance review, background check intake, and applicant pre-screening. What would you like?";
      setAiMessages(m => [...m, { role:"ai", text:r }]);
    }, 1000);
  }

  const INTERVIEW_QS = [
    "Tell me about your most recent long-haul route and how you managed your HOS.",
    "Describe a time you had a vehicle defect during a pre-trip inspection. What did you do?",
    "How do you handle dispatcher pressure to violate HOS rules?",
    "What experience do you have with ELD systems? Which ones have you used?",
    "Do you have any moving violations or DOT citations in the last 3 years?",
  ];

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", background:"#F0F4FA", minHeight:"100vh", color:"#0F172A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:2px}
        .hm-tab{transition:all 0.15s;cursor:pointer;border:none;background:transparent}
        .hm-tab.active{background:${NAVY}!important;color:white!important;border-color:${NAVY}!important}
        .hm-tab:hover:not(.active){border-color:${NAVY}!important}
        .hm-driver-row{transition:background 0.12s;cursor:pointer}
        .hm-driver-row:hover{background:#EFF6FF!important}
        .hm-btn-primary{background:${NAVY};color:white;border:none;border-radius:9px;padding:10px 20px;font-weight:700;font-size:13px;cursor:pointer;font-family:'Poppins',sans-serif;transition:opacity 0.15s}
        .hm-btn-primary:hover{opacity:0.88}
        .hm-btn-primary:disabled{opacity:0.4;cursor:not-allowed}
        .hm-input{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:9px 12px;font-size:13px;font-family:'Poppins',sans-serif;color:#0F172A;width:100%;outline:none}
        .hm-input:focus{border-color:${NAVY}}
        @media(max-width:900px){.hm-grid{grid-template-columns:1fr!important}.hm-nav-links{display:none!important}}
      `}</style>

      {/* NAV */}
      <nav style={{ background:NAVY2, borderBottom:"1px solid rgba(255,255,255,0.08)", padding:"0 5%", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <a href="/"><img src="/static/truckwithease-icon.png" alt="" style={{ width:28, height:28, borderRadius:7 }} /></a>
          <div style={{ width:1, height:20, background:"rgba(255,255,255,0.12)" }} />
          <div style={{ color:"white", fontWeight:800, fontSize:14 }}>👩‍💼 HRease</div>
        </div>
        <div className="hm-nav-links" style={{ display:"flex", gap:18, alignItems:"center" }}>
          <a href="/command" style={{ color:"rgba(255,255,255,0.55)", fontSize:13, textDecoration:"none" }}>🎯 Command</a>
          <a href="/reports"  style={{ color:"rgba(255,255,255,0.55)", fontSize:13, textDecoration:"none" }}>📈 Reports</a>
          <a href="/#pricing" style={{ background:AMBER, color:DARK, padding:"7px 16px", borderRadius:7, fontWeight:800, fontSize:13, textDecoration:"none" }}>Free Trial</a>
          <a href="/" style={{ color:"rgba(255,255,255,0.3)", fontSize:12, textDecoration:"none" }}>← Back</a>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 5% 64px" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:22 }}>
          <div>
            <h1 style={{ fontSize:"clamp(1.4rem,2.5vw,1.9rem)", fontWeight:900, color:NAVY, marginBottom:4 }}>HRease</h1>
            <p style={{ color:"#64748B", fontSize:14 }}>Fleet-wide HR intelligence — payroll, compliance, hiring, and incident management.</p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <span style={{ background:`${PURPLE}12`, color:PURPLE, fontSize:11, fontWeight:700, padding:"5px 12px", borderRadius:20, border:`1px solid ${PURPLE}25` }}>5 drivers · 3 applicants</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:22 }}>
          {[
            { label:"Active Drivers",     value:"4",                        color:GREEN  },
            { label:"This Week Payroll",  value:`$${totalPayroll.toLocaleString("en-US",{minimumFractionDigits:2})}`, color:NAVY },
            { label:"Open Violations",    value:"1",                        color:RED    },
            { label:"Docs Expiring <90d", value:"2",                        color:AMBER  },
          ].map(s => (
            <div key={s.label} style={{ background:"white", borderRadius:12, border:"1px solid #E2E8F0", padding:"14px 16px" }}>
              <div style={{ color:s.color, fontWeight:900, fontSize:20, fontFamily:"'DM Mono',monospace", lineHeight:1 }}>{s.value}</div>
              <div style={{ color:"#94A3B8", fontSize:11, fontWeight:600, marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
          {[
            {id:"roster",   label:"Driver Roster"},
            {id:"payroll",  label:"Payroll"},
            {id:"hiring",   label:"Hiring"},
            {id:"incidents",label:"Incidents"},
            {id:"chat",     label:"HRease Chat"},
          ].map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} className={`hm-tab${tab===t.id?" active":""}`}
              style={{ border:`1px solid #E2E8F0`, borderRadius:9, padding:"8px 18px", fontSize:13, fontWeight:600, fontFamily:"'Poppins',sans-serif", color:"#475569" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── ROSTER ───────────────────────────────────────────────────────────── */}
        {tab === "roster" && (
          <div className="hm-grid" style={{ display:"grid", gridTemplateColumns:selectedDriver?"1fr 360px":"1fr", gap:20 }}>
            <div style={{ background:"white", borderRadius:14, border:"1px solid #E2E8F0", overflow:"hidden" }}>
              <div style={{ padding:"14px 18px", borderBottom:"1px solid #F1F5F9", fontWeight:700, fontSize:14, color:NAVY }}>Driver Roster</div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr style={{ background:"#F8FAFC" }}>
                  {["Driver","Truck","CDL","Medical Card","Drug Test","Safety Score","Status"].map(h=>(
                    <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {DRIVERS.map((d,i) => {
                    const med  = docStatus(daysUntil(d.medCard));
                    const drug = docStatus(daysUntil(d.drugTest));
                    return (
                      <tr key={d.id} className="hm-driver-row" onClick={()=>setDriver(d.id===selectedDriver?null:d.id)}
                        style={{ borderBottom:"1px solid #F8FAFC", background:selectedDriver===d.id?"#EFF6FF":"white" }}>
                        <td style={{ padding:"12px 16px", fontWeight:600, fontSize:13 }}>{d.name}</td>
                        <td style={{ padding:"12px 16px", fontFamily:"'DM Mono',monospace", fontSize:12 }}>{d.truck}</td>
                        <td style={{ padding:"12px 16px", fontFamily:"'DM Mono',monospace", fontSize:11, color:"#64748B" }}>{d.cdl}</td>
                        <td style={{ padding:"12px 16px" }}>
                          <span style={{ background:`${med.color}12`, color:med.color, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>{med.label}</span>
                        </td>
                        <td style={{ padding:"12px 16px" }}>
                          <span style={{ background:`${drug.color}12`, color:drug.color, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>{drug.label}</span>
                        </td>
                        <td style={{ padding:"12px 16px", fontFamily:"'DM Mono',monospace", fontWeight:800, fontSize:14, color:d.safetyScore>=95?GREEN:d.safetyScore>=85?AMBER:RED }}>{d.safetyScore}</td>
                        <td style={{ padding:"12px 16px" }}>
                          <span style={{ background:d.status==="Active"?`${GREEN}12`:`${RED}12`, color:d.status==="Active"?GREEN:RED, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>{d.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selectedDriver && (() => {
              const d = DRIVERS.find(x=>x.id===selectedDriver);
              if (!d) return null;
              return (
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div style={{ background:"white", borderRadius:14, border:"1px solid #E2E8F0", padding:"18px" }}>
                    <div style={{ fontWeight:800, fontSize:15, color:NAVY, marginBottom:16 }}>{d.name}</div>
                    {[
                      {l:"Truck",         v:d.truck},
                      {l:"CDL Number",    v:d.cdl},
                      {l:"Medical Card",  v:d.medCard},
                      {l:"Drug Test",     v:d.drugTest},
                      {l:"Safety Score",  v:`${d.safetyScore}/100`},
                      {l:"Violations",    v:d.violations===0?"✓ Clean":`${d.violations} on record`},
                      {l:"Pay Rate",      v:`$${d.mileRate.toFixed(2)}/mi`},
                    ].map(row=>(
                      <div key={row.l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #F8FAFC" }}>
                        <span style={{ color:"#64748B", fontSize:12 }}>{row.l}</span>
                        <span style={{ fontWeight:600, fontSize:12 }}>{row.v}</span>
                      </div>
                    ))}
                    <div style={{ display:"flex", gap:8, marginTop:14 }}>
                      <a href={`/driver?driver=${d.id}`} style={{ flex:1, background:NAVY, color:"white", borderRadius:8, padding:"9px", fontWeight:700, fontSize:12, textDecoration:"none", textAlign:"center" }}>View Profile</a>
                      <a href="/hos" style={{ flex:1, background:"#F1F5F9", color:NAVY, borderRadius:8, padding:"9px", fontWeight:600, fontSize:12, textDecoration:"none", textAlign:"center" }}>HOS Logs</a>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── PAYROLL ──────────────────────────────────────────────────────────── */}
        {tab === "payroll" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:"white", borderRadius:14, border:"1px solid #E2E8F0", overflow:"hidden" }}>
              <div style={{ padding:"14px 20px", borderBottom:"1px solid #F1F5F9", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:14, color:NAVY }}>Weekly Payroll — {PAYROLL_WEEK}</div>
                  <div style={{ color:"#64748B", fontSize:12, marginTop:2 }}>$0.55–$0.60/mi base · $50/hr detention · $100 safety bonus threshold: 95</div>
                </div>
                <span style={{ color:NAVY, fontWeight:900, fontSize:18, fontFamily:"'DM Mono',monospace" }}>${totalPayroll.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr style={{ background:"#F8FAFC" }}>
                  {["Driver","Miles","Mile Pay","Detention","Bonus","Gross"].map(h=>(
                    <th key={h} style={{ padding:"10px 18px", textAlign:"left", fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {payroll.map((p,i)=>(
                    <tr key={p.id} style={{ borderBottom:"1px solid #F8FAFC" }}>
                      <td style={{ padding:"12px 18px", fontWeight:600, fontSize:13 }}>{p.name}</td>
                      <td style={{ padding:"12px 18px", fontFamily:"'DM Mono',monospace" }}>{p.miles.toLocaleString()}</td>
                      <td style={{ padding:"12px 18px", fontFamily:"'DM Mono',monospace" }}>${p.milesPay.toFixed(2)}</td>
                      <td style={{ padding:"12px 18px", fontFamily:"'DM Mono',monospace", color:p.detention>0?ORANGE:"#94A3B8" }}>{p.detention>0?`$${p.detention.toFixed(2)}`:"—"}</td>
                      <td style={{ padding:"12px 18px", fontFamily:"'DM Mono',monospace", color:p.bonus>0?GREEN:"#94A3B8" }}>{p.bonus>0?`$${p.bonus}`:"—"}</td>
                      <td style={{ padding:"12px 18px", fontFamily:"'DM Mono',monospace", fontWeight:900, fontSize:15, color:NAVY }}>${p.gross.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding:"16px 20px", background:"#F8FAFC", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ color:"#64748B", fontSize:13 }}>
                  {payrollDone ? "✅ Payroll complete — PDF statements sent to all 4 active drivers" : "Review above and confirm to run payroll"}
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  {payrollDone && <button onClick={()=>setPayrollDone(false)} style={{ background:"#F1F5F9", color:"#475569", border:"none", borderRadius:9, padding:"10px 20px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>New Run</button>}
                  <button onClick={runPayroll} disabled={runningPayroll || payrollDone} className="hm-btn-primary">
                    {runningPayroll ? "⏳ Processing…" : payrollDone ? "✓ Complete" : "▶ Run Payroll"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── HIRING ───────────────────────────────────────────────────────────── */}
        {tab === "hiring" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {activeApplicant ? (
              <div style={{ background:"white", borderRadius:14, border:"1px solid #E2E8F0", padding:"24px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:16, color:NAVY }}>AI Pre-Screen — {APPLICANTS.find(a=>a.id===activeApplicant)?.name}</div>
                    <div style={{ color:"#64748B", fontSize:13, marginTop:2 }}>Question {interviewStep+1} of {INTERVIEW_QS.length}</div>
                  </div>
                  <button onClick={()=>{setApplicant(null);setStep(0);}} style={{ background:"#F1F5F9", color:"#475569", border:"none", borderRadius:8, padding:"8px 16px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>← Back</button>
                </div>
                <div style={{ background:"#F8FAFC", borderRadius:10, padding:"16px 18px", marginBottom:20, borderLeft:`4px solid ${NAVY}` }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#64748B", marginBottom:6 }}>HRease ASKS</div>
                  <div style={{ fontSize:15, fontWeight:600, color:"#0F172A" }}>{INTERVIEW_QS[interviewStep]}</div>
                </div>
                <textarea placeholder="Record applicant's response here…" rows={4}
                  style={{ width:"100%", background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:8, padding:"10px 12px", fontSize:13, fontFamily:"'Poppins',sans-serif", resize:"vertical" }} />
                <div style={{ display:"flex", gap:10, marginTop:14 }}>
                  {interviewStep < INTERVIEW_QS.length-1
                    ? <button onClick={()=>setStep(s=>s+1)} className="hm-btn-primary">Next Question →</button>
                    : <button onClick={()=>{setApplicant(null);setStep(0);}} className="hm-btn-primary" style={{ background:GREEN }}>✓ Complete Pre-Screen</button>
                  }
                </div>
              </div>
            ) : (
              <div style={{ background:"white", borderRadius:14, border:"1px solid #E2E8F0", overflow:"hidden" }}>
                <div style={{ padding:"14px 18px", borderBottom:"1px solid #F1F5F9", fontWeight:700, fontSize:14, color:NAVY }}>Active Applicants</div>
                {APPLICANTS.map(a => (
                  <div key={a.id} style={{ padding:"14px 18px", borderBottom:"1px solid #F8FAFC", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14 }}>{a.name}</div>
                      <div style={{ color:"#64748B", fontSize:12 }}>{a.cdlClass} · {a.exp} · {a.state} · Applied {a.applied}</div>
                    </div>
                    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                      <span style={{ color:a.score>=90?GREEN:AMBER, fontWeight:900, fontSize:15, fontFamily:"'DM Mono',monospace" }}>{a.score}</span>
                      <span style={{ background:a.status==="approved"?`${GREEN}12`:a.status==="screening"?`${AMBER}12`:`${NAVY}12`, color:a.status==="approved"?GREEN:a.status==="screening"?AMBER:NAVY, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>{a.status}</span>
                      <button onClick={()=>setApplicant(a.id)} className="hm-btn-primary" style={{ fontSize:11, padding:"7px 14px" }}>Pre-Screen</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── INCIDENTS ────────────────────────────────────────────────────────── */}
        {tab === "incidents" && (
          <div style={{ background:"white", borderRadius:14, border:"1px solid #E2E8F0", overflow:"hidden" }}>
            <div style={{ padding:"14px 18px", borderBottom:"1px solid #F1F5F9", fontWeight:700, fontSize:14, color:NAVY }}>Violation & Incident Log</div>
            {INCIDENTS.map((inc,i)=>(
              <div key={inc.id} style={{ padding:"14px 18px", borderBottom:i<INCIDENTS.length-1?"1px solid #F8FAFC":"none", borderLeft:`4px solid ${inc.severity==="Major"?RED:AMBER}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ fontWeight:700, fontSize:13 }}>{inc.driver}</span>
                    <span style={{ background:inc.severity==="Major"?`${RED}12`:`${AMBER}12`, color:inc.severity==="Major"?RED:AMBER, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:10 }}>{inc.severity}</span>
                    <span style={{ background:inc.status==="resolved"?`${GREEN}12`:`${RED}12`, color:inc.status==="resolved"?GREEN:RED, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:10 }}>{inc.status}</span>
                  </div>
                  <span style={{ color:"#94A3B8", fontSize:11 }}>{inc.date} · {inc.type}</span>
                </div>
                <div style={{ color:"#64748B", fontSize:12, lineHeight:1.6 }}>{inc.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── HRease CHAT ─────────────────────────────────────────────────────── */}
        {tab === "chat" && (
          <div style={{ background:"white", borderRadius:14, border:"1px solid #E2E8F0", overflow:"hidden" }}>
            <div style={{ padding:"14px 20px", background:`linear-gradient(135deg,${NAVY},${NAVY2})`, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:28 }}>👩‍💼</span>
              <div>
                <div style={{ color:"white", fontWeight:800, fontSize:14 }}>HRease</div>
                <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11 }}>Payroll · Compliance · Hiring · Incidents</div>
              </div>
            </div>
            <div style={{ padding:"16px", minHeight:320, maxHeight:400, overflowY:"auto", display:"flex", flexDirection:"column", gap:10 }}>
              {aiMessages.map((m,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
                  <div style={{ maxWidth:"82%", background:m.role==="user"?NAVY:"#F8FAFC", border:m.role==="ai"?"1px solid #E2E8F0":"none", color:m.role==="user"?"white":"#0F172A", borderRadius:10, padding:"9px 13px", fontSize:13, lineHeight:1.6 }}>
                    {m.role==="ai"&&<span style={{ color:PURPLE, fontWeight:700 }}>HRease: </span>}
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={chatEnd} />
            </div>
            <div style={{ padding:"12px 16px", borderTop:"1px solid #E2E8F0", display:"flex", gap:8, flexWrap:"wrap" }}>
              {["Run payroll summary","Expiring docs","Active violations","Applicant status","AB5 compliance"].map(p=>(
                <button key={p} onClick={()=>{setAiInput(p);setTimeout(()=>sendAiMsg(),10);}}
                  style={{ background:"#F1F5F9", color:NAVY, border:"1px solid #E2E8F0", borderRadius:20, padding:"5px 12px", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>{p}</button>
              ))}
            </div>
            <div style={{ padding:"10px 16px 16px", display:"flex", gap:8 }}>
              <input className="hm-input" value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendAiMsg()} placeholder="Ask HRease anything about your fleet HR…" />
              <button onClick={sendAiMsg} className="hm-btn-primary" style={{ flexShrink:0 }}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
