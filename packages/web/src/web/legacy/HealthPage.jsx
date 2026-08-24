
import { useState } from "react";

const NAVY = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED = "#DC2626";
const DARK = "#06090F";

const VITALS_HISTORY = [
  { date:"Jul 10, 2026", bp:"138/88", hr:72, weight:218, sleep:6.5, flag:false },
  { date:"Jul 7, 2026", bp:"142/91", hr:75, weight:219, sleep:5.5, flag:true },
  { date:"Jun 30, 2026", bp:"135/85", hr:70, weight:218, sleep:7.0, flag:false },
  { date:"Jun 22, 2026", bp:"136/87", hr:68, weight:220, sleep:6.0, flag:false },
  { date:"Jun 15, 2026", bp:"141/90", hr:74, weight:221, sleep:6.5, flag:true },
];

const PHYSICALS_HISTORY = [
  { date:"Aug 2, 2025", examiner:"Dr. Patricia Moore, DO", location:"Concentra - Dallas, TX", type:"Annual", result:"2-Year Certificate" },
  { date:"Aug 5, 2024", examiner:"Dr. James Park, MD", location:"Urgent Care Plus - Memphis, TN", type:"Annual", result:"2-Year Certificate" },
  { date:"Jul 28, 2023", examiner:"Dr. Sandra Kim, DO", location:"DOT Medical Center - OKC, OK", type:"Renewal", result:"1-Year Certificate" },
];

const QUICK_PROMPTS = [
  "Will I pass my DOT physical?",
  "Best foods for truckers",
  "Sleep apnea screening",
  "Workout at truck stops",
  "2-year cert vs 1-year"
];

export default function HealthPage() {
  const [tab, setTab] = useState("medical");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role:"ai", text:"Your BP reading of 138/88 from Jul 10 is slightly elevated. At this level you'll likely still get a 1-year certificate. To get a 2-year card, aim to bring systolic under 140 consistently. Want a simple daily routine that helps?" }
  ]);
  const [vitalsForm, setVitalsForm] = useState({ systolic:"", diastolic:"", hr:"", weight:"", height:70, sugar:"", sleep:"", date:"" });
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [schedForm, setSchedForm] = useState({ examiner:"", date:"", location:"", type:"routine" });
  const [showSchedForm, setShowSchedForm] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);

  const bmi = vitalsForm.weight && vitalsForm.height
    ? (703 * Number(vitalsForm.weight) / (Number(vitalsForm.height) ** 2)).toFixed(1)
    : "";

  function sendChat(e) {
    if (e && e.preventDefault) e.preventDefault();
    const text = typeof e === "string" ? e : chatInput.trim();
    if (!text) return;
    setChatMessages(prev => [...prev, { role:"user", text }]);
    setChatInput("");
    setAiTyping(true);
    setTimeout(() => {
      setAiTyping(false);
      const responses = {
        "Will I pass my DOT physical?": "Based on your recent vitals, your BP of 138/88 puts you in the 1-year cert range. Your weight is within acceptable range. Main risk factor: blood pressure — stay consistent with any meds and get checked 2 weeks before your physical.",
        "Best foods for truckers": "High-protein, low-sodium meals are best: grilled chicken, eggs, nuts, fresh fruit. Avoid fast food with high sodium — it raises blood pressure. Truck stops with Subway or Denny's are better options. Drink water over energy drinks.",
        "Sleep apnea screening": "DOT examiners check for sleep apnea risk: BMI over 35, neck size over 17 inches, or complaints of excessive daytime sleepiness trigger a sleep study. If diagnosed, you'll need a CPAP — untreated sleep apnea can disqualify you.",
        "Workout at truck stops": "Love's and Pilot locations have fitness rooms. Also: resistance bands in the cab, walking 15 min after each stop, bodyweight squats and pushups. Even 20 min/day reduces blood pressure and improves sleep quality significantly.",
        "2-year cert vs 1-year": "A 2-year certificate requires BP below 140/90 and no disqualifying conditions. A 1-year cert is given when BP is 140-159/90-99, or when a condition needs monitoring. To move from 1-year to 2-year: consistent BP control, healthy weight, and no new issues.",
      };
      const reply = responses[text] || "That's a great health question. Based on DOT guidelines and your current vitals profile, I'd recommend discussing this with your certified medical examiner at your next appointment. Want me to help you prepare questions for your physical?";
      setChatMessages(prev => [...prev, { role:"ai", text: reply }]);
    }, 1400);
  }

  const TABS = [
    { id:"medical", label:"DOT Medical" },
    { id:"vitals", label:"Vitals Log" },
    { id:"physicals", label:"Physicals" },
    { id:"ai", label:"Health Chief AI" },
  ];

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", background:"#f8fafc", minHeight:"100vh", color:"#1e293b" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        .nav-link { color:#94a3b8; text-decoration:none; font-size:14px; font-weight:500; transition:color 0.2s; }
        .nav-link:hover { color:#FF6B00; }
        .tab-btn { background:transparent; border:none; padding:12px 20px; font-family:'Poppins',sans-serif; font-size:14px; font-weight:500; cursor:pointer; color:#64748b; border-bottom:2px solid transparent; transition:all 0.2s; }
        .tab-btn.active { color:${RED}; border-bottom-color:${RED}; font-weight:600; }
        .tab-btn:hover:not(.active) { color:#1e293b; }
        .card { background:#fff; border-radius:12px; padding:20px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.06); margin-bottom:16px; }
        .btn-primary { background:${RED}; color:#fff; border:none; border-radius:8px; padding:10px 20px; font-family:'Poppins',sans-serif; font-weight:600; cursor:pointer; font-size:14px; transition:background 0.2s; }
        .btn-primary:hover { background:#b91c1c; }
        .btn-outline { background:transparent; border:2px solid ${RED}; color:${RED}; border-radius:8px; padding:10px 20px; font-family:'Poppins',sans-serif; font-weight:600; cursor:pointer; font-size:14px; transition:all 0.2s; }
        .btn-outline:hover { background:${RED}; color:#fff; }
        .form-input { width:100%; border:1px solid #e2e8f0; border-radius:8px; padding:9px 14px; font-family:'Poppins',sans-serif; font-size:13px; color:#1e293b; outline:none; }
        .form-input:focus { border-color:${RED}; }
        .form-label { font-size:12px; font-weight:600; color:#64748b; margin-bottom:4px; display:block; }
        .chat-input { width:100%; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; font-family:'Poppins',sans-serif; font-size:13px; color:#1e293b; outline:none; }
        .chat-input:focus { border-color:${RED}; }
        .quick-prompt { background:#fef2f2; border:1px solid #fecaca; color:${RED}; border-radius:20px; padding:7px 14px; font-family:'Poppins',sans-serif; font-size:12px; font-weight:500; cursor:pointer; transition:all 0.2s; }
        .quick-prompt:hover { background:${RED}; color:#fff; }
        table { width:100%; border-collapse:collapse; font-size:13px; }
        th { text-align:left; padding:8px 12px; background:#f1f5f9; color:#64748b; font-weight:600; font-size:12px; border-bottom:1px solid #e2e8f0; }
        td { padding:10px 12px; border-bottom:1px solid #f1f5f9; }
        @media(max-width:768px){.content-area{padding:16px!important;}}
      `}</style>

      {/* Nav */}
      <nav style={{ background:NAVY2, padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <img src="/static/truckwithease-icon.png" alt="TruckWithEase" style={{ height:36 }} />
          <span style={{ fontWeight:700, fontSize:17, color:"#fff" }}>TruckWithEase</span>
        </div>
        <div style={{ display:"flex", gap:18, alignItems:"center" }}>
          <a href="/command" className="nav-link">🎯 Dashboard</a>
          <a href="/scorecard" className="nav-link">🏅 Scorecard</a>
          <a href="/humanai" className="nav-link">👩‍💼 HR</a>
          <a href="/#pricing" style={{ background:"#FFB400", color:"#06090F", padding:"7px 14px", borderRadius:7, fontWeight:800, fontSize:12, textDecoration:"none" }}>Free Trial</a>
          <a href="/" className="nav-link" style={{ opacity:0.4, fontSize:12 }}>← Back</a>
        </div>
      </nav>

      {/* Alert Banner */}
      <div style={{ background:"#fffbeb", borderBottom:"2px solid #FFB400", padding:"10px 24px", display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:18 }}>⚠️</span>
        <span style={{ fontSize:14, fontWeight:600, color:"#92400e" }}>Your DOT Medical Card expires in <strong>34 days</strong> — schedule your physical now.</span>
        <button className="btn-primary" style={{ marginLeft:"auto", padding:"6px 16px", fontSize:12, background:AMBER, color:"#000" }}>Schedule Now</button>
      </div>

      {/* Header */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e2e8f0", padding:"16px 24px 0" }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:"#1e293b", display:"flex", alignItems:"center", gap:8 }}>
          ❤️ Driver Health & DOT Medical
        </h1>
        <p style={{ color:"#64748b", fontSize:13, margin:"4px 0 12px" }}>Your health compliance hub — powered by Health Chief AI</p>
        <div style={{ display:"flex", gap:0 }}>
          {TABS.map(t => (
            <button key={t.id} className={`tab-btn${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="content-area" style={{ padding:"24px", maxWidth:960, margin:"0 auto" }}>

        {/* DOT Medical Tab */}
        {tab === "medical" && (
          <div>
            <div className="card" style={{ background:"linear-gradient(135deg,#fff 60%,#fef2f2)", borderLeft:`4px solid ${RED}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
                <div>
                  <div style={{ fontSize:13, color:"#64748b", marginBottom:4 }}>Current DOT Medical Certificate</div>
                  <div style={{ fontSize:22, fontWeight:800, color:"#1e293b" }}>James R. McKinley</div>
                  <div style={{ fontSize:13, color:"#64748b", margin:"8px 0" }}>CDL-A · License #TX-4821937</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 32px", marginTop:12 }}>
                    <div><span style={{ fontSize:11, color:"#64748b" }}>Issue Date</span><div style={{ fontWeight:600, fontSize:14 }}>Aug 2, 2025</div></div>
                    <div><span style={{ fontSize:11, color:"#64748b" }}>Expiry Date</span><div style={{ fontWeight:600, fontSize:14, color:RED }}>Aug 15, 2026</div></div>
                    <div><span style={{ fontSize:11, color:"#64748b" }}>Certificate Length</span><div style={{ fontWeight:600, fontSize:14 }}>1 Year</div></div>
                    <div><span style={{ fontSize:11, color:"#64748b" }}>Examiner</span><div style={{ fontWeight:600, fontSize:14 }}>Dr. Patricia Moore, DO</div></div>
                    <div><span style={{ fontSize:11, color:"#64748b" }}>Restrictions</span><div style={{ fontWeight:600, fontSize:14, color:GREEN }}>None</div></div>
                    <div><span style={{ fontSize:11, color:"#64748b" }}>Registry #</span><div style={{ fontWeight:600, fontSize:13, fontFamily:"'DM Mono',monospace" }}>NR-2187459</div></div>
                  </div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ background:"#fef2f2", border:`2px solid ${AMBER}`, borderRadius:12, padding:"12px 20px", marginBottom:12 }}>
                    <div style={{ fontSize:11, color:"#64748b" }}>Status</div>
                    <div style={{ fontWeight:800, fontSize:15, color:"#92400e" }}>⚠️ EXPIRING SOON</div>
                    <div style={{ fontSize:11, color:"#92400e" }}>34 days remaining</div>
                  </div>
                  <button className="btn-primary" style={{ width:"100%", marginBottom:8 }}>⬇️ Download Card</button>
                  <button className="btn-outline" style={{ width:"100%" }}>📅 Schedule Renewal</button>
                </div>
              </div>
            </div>
            <div className="card" style={{ background:"#f0fdf4", border:`1px solid #86efac` }}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <span style={{ fontSize:20 }}>ℹ️</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:"#166534", marginBottom:4 }}>DOT Compliance Reminder</div>
                  <p style={{ fontSize:13, color:"#166534", lineHeight:1.6 }}>Your medical examiner must be listed on the FMCSA National Registry. Find a certified examiner at: <strong>nationalregistry.fmcsa.dot.gov</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vitals Tab */}
        {tab === "vitals" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h2 style={{ fontSize:18, fontWeight:700 }}>Vitals Log</h2>
              <button className="btn-primary" onClick={()=>setShowVitalsForm(!showVitalsForm)}>+ Log Vitals</button>
            </div>

            {showVitalsForm && (
              <div className="card" style={{ marginBottom:20, borderTop:`3px solid ${RED}` }}>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>New Vitals Entry</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                  <div>
                    <label className="form-label">Systolic (mmHg)</label>
                    <input type="number" className="form-input" placeholder="120" value={vitalsForm.systolic} onChange={e=>setVitalsForm({...vitalsForm,systolic:e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">Diastolic (mmHg)</label>
                    <input type="number" className="form-input" placeholder="80" value={vitalsForm.diastolic} onChange={e=>setVitalsForm({...vitalsForm,diastolic:e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">Resting HR (bpm)</label>
                    <input type="number" className="form-input" placeholder="72" value={vitalsForm.hr} onChange={e=>setVitalsForm({...vitalsForm,hr:e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">Weight (lbs)</label>
                    <input type="number" className="form-input" placeholder="218" value={vitalsForm.weight} onChange={e=>setVitalsForm({...vitalsForm,weight:e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">BMI (auto-calc)</label>
                    <input type="text" className="form-input" value={bmi} readOnly placeholder="Auto" style={{ background:"#f8fafc" }} />
                  </div>
                  <div>
                    <label className="form-label">Blood Sugar (mg/dL)</label>
                    <input type="number" className="form-input" placeholder="95" value={vitalsForm.sugar} onChange={e=>setVitalsForm({...vitalsForm,sugar:e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">Sleep (hours)</label>
                    <input type="number" step="0.5" className="form-input" placeholder="7.0" value={vitalsForm.sleep} onChange={e=>setVitalsForm({...vitalsForm,sleep:e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">Date</label>
                    <input type="date" className="form-input" value={vitalsForm.date} onChange={e=>setVitalsForm({...vitalsForm,date:e.target.value})} />
                  </div>
                </div>
                <button className="btn-primary" style={{ marginTop:14 }} onClick={()=>setShowVitalsForm(false)}>Save Vitals</button>
              </div>
            )}

            {/* BP Thresholds */}
            <div className="card" style={{ marginBottom:20 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>DOT Blood Pressure Thresholds</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:8, padding:"10px 14px", textAlign:"center" }}>
                  <div style={{ fontWeight:700, fontSize:13, color:GREEN }}>Below 140/90</div>
                  <div style={{ fontSize:12, color:"#166534", marginTop:4 }}>2-Year Certificate</div>
                </div>
                <div style={{ background:"#fffbeb", border:"1px solid #fcd34d", borderRadius:8, padding:"10px 14px", textAlign:"center" }}>
                  <div style={{ fontWeight:700, fontSize:13, color:"#92400e" }}>140–159 / 90–99</div>
                  <div style={{ fontSize:12, color:"#92400e", marginTop:4 }}>1-Year Certificate</div>
                </div>
                <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:8, padding:"10px 14px", textAlign:"center" }}>
                  <div style={{ fontWeight:700, fontSize:13, color:RED }}>≥ 180/110</div>
                  <div style={{ fontSize:12, color:RED, marginTop:4 }}>Disqualifying</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding:0, overflow:"hidden" }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th><th>Blood Pressure</th><th>HR</th><th>Weight</th><th>Sleep</th><th>DOT Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {VITALS_HISTORY.map((v,i) => (
                    <tr key={i}>
                      <td style={{ fontWeight:500 }}>{v.date}</td>
                      <td style={{ fontFamily:"'DM Mono',monospace", color: v.flag ? AMBER : GREEN }}>{v.bp}</td>
                      <td>{v.hr} bpm</td>
                      <td>{v.weight} lbs</td>
                      <td>{v.sleep} hrs</td>
                      <td>{v.flag ? <span style={{ color:AMBER, fontWeight:700 }}>⚠️ Elevated</span> : <span style={{ color:GREEN }}>✓ Normal</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Physicals Tab */}
        {tab === "physicals" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h2 style={{ fontSize:18, fontWeight:700 }}>Physical Appointments</h2>
              <button className="btn-primary" onClick={()=>setShowSchedForm(!showSchedForm)}>+ Schedule Physical</button>
            </div>

            {/* Upcoming */}
            <div className="card" style={{ borderLeft:`4px solid ${AMBER}`, background:"#fffbeb", marginBottom:20 }}>
              <div style={{ fontWeight:700, fontSize:14, color:"#92400e", marginBottom:8 }}>📅 Upcoming Appointment</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                <div><span style={{ fontSize:11, color:"#92400e" }}>Date</span><div style={{ fontWeight:600, fontSize:14 }}>August 15, 2026</div></div>
                <div><span style={{ fontSize:11, color:"#92400e" }}>Examiner</span><div style={{ fontWeight:600, fontSize:14 }}>Dr. Patricia Moore, DO</div></div>
                <div><span style={{ fontSize:11, color:"#92400e" }}>Location</span><div style={{ fontWeight:600, fontSize:14 }}>Concentra - Dallas, TX</div></div>
              </div>
              <div style={{ marginTop:12, display:"flex", gap:10 }}>
                <button className="btn-primary" style={{ fontSize:12, padding:"7px 16px" }}>📍 Get Directions</button>
                <button className="btn-outline" style={{ fontSize:12, padding:"7px 16px" }}>✏️ Reschedule</button>
              </div>
            </div>

            {showSchedForm && (
              <div className="card" style={{ marginBottom:20, borderTop:`3px solid ${RED}` }}>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>Schedule a Physical</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <div>
                    <label className="form-label">Examiner Name</label>
                    <input className="form-input" placeholder="Dr. Name" value={schedForm.examiner} onChange={e=>setSchedForm({...schedForm,examiner:e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">Date</label>
                    <input type="date" className="form-input" value={schedForm.date} onChange={e=>setSchedForm({...schedForm,date:e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">Location</label>
                    <input className="form-input" placeholder="City, State" value={schedForm.location} onChange={e=>setSchedForm({...schedForm,location:e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">Type</label>
                    <select className="form-input" value={schedForm.type} onChange={e=>setSchedForm({...schedForm,type:e.target.value})}>
                      <option value="routine">Routine</option>
                      <option value="follow-up">Follow-Up</option>
                      <option value="renewal">Renewal</option>
                    </select>
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, marginTop:14 }}>
                  <button className="btn-primary" onClick={()=>setShowSchedForm(false)}>Save Appointment</button>
                  <a href="https://nationalregistry.fmcsa.dot.gov" target="_blank" rel="noreferrer" style={{ color:RED, fontWeight:600, fontSize:13, alignSelf:"center", textDecoration:"none" }}>🔍 Find FMCSA Examiner ↗</a>
                </div>
              </div>
            )}

            <div className="card" style={{ padding:0, overflow:"hidden" }}>
              <div style={{ padding:"14px 16px", borderBottom:"1px solid #e2e8f0", fontWeight:700, fontSize:14 }}>Physical History</div>
              <table>
                <thead>
                  <tr><th>Date</th><th>Examiner</th><th>Location</th><th>Type</th><th>Result</th></tr>
                </thead>
                <tbody>
                  {PHYSICALS_HISTORY.map((p,i) => (
                    <tr key={i}>
                      <td style={{ fontWeight:500 }}>{p.date}</td>
                      <td>{p.examiner}</td>
                      <td>{p.location}</td>
                      <td>{p.type}</td>
                      <td><span style={{ color:GREEN, fontWeight:600 }}>{p.result}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Health Chief AI Tab */}
        {tab === "ai" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
              <div style={{ width:48, height:48, background:"linear-gradient(135deg,#dc2626,#9f1239)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>❤️</div>
              <div>
                <div style={{ fontWeight:800, fontSize:16, color:"#1e293b" }}>Health Chief AI</div>
                <div style={{ fontSize:12, color:"#64748b" }}>Your DOT health advisor — always available</div>
              </div>
              <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:GREEN }} />
                <span style={{ fontSize:12, color:GREEN, fontWeight:600 }}>Online</span>
              </div>
            </div>

            <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:16, minHeight:360, marginBottom:16, display:"flex", flexDirection:"column", gap:10 }}>
              {chatMessages.map((m,i) => (
                <div key={i} style={{ display:"flex", justifyContent: m.role==="user"?"flex-end":"flex-start" }}>
                  <div style={{
                    maxWidth:"75%",
                    background: m.role==="user" ? RED : "#f8fafc",
                    border: m.role==="ai" ? `1px solid #fecaca` : "none",
                    color: m.role==="user" ? "#fff" : "#1e293b",
                    borderRadius: m.role==="user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    padding:"10px 14px",
                    fontSize:13,
                    lineHeight:1.6
                  }}>
                    {m.role==="ai" && <span style={{ fontWeight:700, color:RED }}>Health Chief: </span>}
                    {m.text}
                  </div>
                </div>
              ))}
              {aiTyping && (
                <div style={{ display:"flex", justifyContent:"flex-start" }}>
                  <div style={{ background:"#f8fafc", border:"1px solid #fecaca", borderRadius:"12px 12px 12px 2px", padding:"10px 14px", fontSize:13, color:"#64748b" }}>
                    <span style={{ fontWeight:700, color:RED }}>Health Chief: </span>Analyzing your health data...
                  </div>
                </div>
              )}
            </div>

            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
              {QUICK_PROMPTS.map(p => (
                <button key={p} className="quick-prompt" onClick={()=>sendChat(p)}>{p}</button>
              ))}
            </div>

            <form onSubmit={sendChat} style={{ display:"flex", gap:10 }}>
              <input
                className="chat-input"
                value={chatInput}
                onChange={e=>setChatInput(e.target.value)}
                placeholder="Ask Health Chief about your DOT health..."
              />
              <button type="submit" className="btn-primary" style={{ whiteSpace:"nowrap" }}>Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
