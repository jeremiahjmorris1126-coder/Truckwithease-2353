import { useState, useEffect, useRef } from "react";

const NAVY  = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE= "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED   = "#DC2626";
const DARK  = "#06090F";

const HISTORY = [
  { id:1, broker:"Bluegrass Logistics", shipper:"AutoZone DC #14",    location:"Springfield, MO", loadId:"LD-8821", freeMin:120, rateHr:50, arrivedAt:"2026-07-10T10:42:00", departedAt:"2026-07-10T13:02:00", totalMin:140, billable:20, pay:16.67, status:"paid" },
  { id:2, broker:"Echo Global",          shipper:"Walmart DC #47",     location:"Joplin, MO",      loadId:"LD-9034", freeMin:120, rateHr:50, arrivedAt:"2026-07-09T08:15:00", departedAt:"2026-07-09T12:45:00", totalMin:270, billable:150, pay:125.00, status:"invoiced" },
  { id:3, broker:"Coyote Logistics",     shipper:"Target Distribution", location:"Kansas City, KS", loadId:"LD-7712", freeMin:120, rateHr:50, arrivedAt:"2026-07-07T14:00:00", departedAt:"2026-07-07T16:10:00", totalMin:130, billable:10, pay:8.33, status:"paid" },
  { id:4, broker:"XPO Logistics",        shipper:"Kroger Ralphs DC",   location:"OKC, OK",         loadId:"LD-6651", freeMin:120, rateHr:50, arrivedAt:"2026-07-05T09:30:00", departedAt:"2026-07-05T14:00:00", totalMin:270, billable:150, pay:125.00, status:"disputed" },
];

function fmt(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function useInView(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true); }, { threshold: 0.04 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return seen;
}
function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  return (
    <div ref={ref} style={{ opacity: seen ? 1 : 0, transform: seen ? "translateY(0)" : "translateY(14px)", transition: `opacity 0.5s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.5s cubic-bezier(.22,1,.36,1) ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

export default function DetentionPage() {
  const [tab, setTab] = useState("active");
  const [active, setActive] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [form, setForm] = useState({ broker:"", shipper:"", location:"", loadId:"", freeMin:"120", rateHr:"50" });
  const [started, setStarted] = useState(null);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setElapsed(Date.now() - active.startTime), 500);
    return () => clearInterval(id);
  }, [active]);

  const billableMs  = Math.max(0, elapsed - (active ? active.freeMin * 60000 : 0));
  const billableHrs = billableMs / 3600000;
  const earnedSoFar = billableHrs * (active ? active.rateHr : 50);
  const freeTimeLeft = active ? Math.max(0, active.freeMin * 60000 - elapsed) : 0;
  const inFreeTime   = active && elapsed < active.freeMin * 60000;

  function startTimer() {
    if (!form.broker || !form.shipper) return;
    setActive({ ...form, freeMin: parseInt(form.freeMin) || 120, rateHr: parseFloat(form.rateHr) || 50, startTime: Date.now() });
    setElapsed(0);
    setStarted(new Date().toLocaleTimeString());
    setTab("active");
  }
  function stopTimer() {
    setActive(null);
    setElapsed(0);
    setTab("history");
  }

  const totalEarned = HISTORY.reduce((s, h) => s + h.pay, 0);
  const statusColor = { paid: GREEN, invoiced: AMBER, disputed: RED };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#F0F4FA", minHeight: "100vh", color: "#0F172A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 2px; }
        .dt-tab { transition: all 0.15s; cursor: pointer; }
        .dt-tab.active { background: ${NAVY} !important; color: white !important; border-color: ${NAVY} !important; }
        .dt-input:focus { outline: none; border-color: ${NAVY} !important; }
        @keyframes dtPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .dt-live { animation: dtPulse 1.5s ease-in-out infinite; }
        @keyframes dtTick { from{opacity:0.7} to{opacity:1} }
        .dt-clock { animation: dtTick 0.5s ease-in-out infinite alternate; }
        @media(max-width:900px){.dt-grid{grid-template-columns:1fr!important;}.dt-nav-links{display:none!important;}}
      `}</style>

      <nav style={{ background: NAVY2, borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 5%", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/static/truckwithease-icon.png" alt="" style={{ width: 28, height: 28, borderRadius: 7, objectFit: "cover" }} />
          </a>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)" }} />
          <div style={{ color: "white", fontWeight: 800, fontSize: 14 }}>⏳ Detention Pay Tracker</div>
        </div>
        <div className="dt-nav-links" style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <a href="/load-profit" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, textDecoration: "none" }}>💰 Load Profit</a>
          <a href="/dispatch" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, textDecoration: "none" }}>💬 Dispatch</a>
          <a href="/#pricing" style={{ background: AMBER, color: DARK, padding: "7px 16px", borderRadius: 7, fontWeight: 800, fontSize: 13, textDecoration: "none" }}>Free Trial</a>
          <a href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textDecoration: "none" }}>← Back</a>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 5% 64px" }}>
        <FadeIn style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: "clamp(1.5rem,2.5vw,2rem)", fontWeight: 900, color: NAVY, marginBottom: 4 }}>Detention Pay Tracker</h1>
              <p style={{ color: "#64748B", fontSize: 14 }}>Your time is money. Track it. Bill it. Get paid.</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={20}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 22 }}>
            {[
              { label: "Active Timer",    value: active ? "RUNNING" : "—",       color: active ? RED : "#94A3B8" },
              { label: "This Month",      value: `$${totalEarned.toFixed(2)}`,    color: GREEN  },
              { label: "Sessions",        value: HISTORY.length.toString(),       color: NAVY   },
              { label: "Avg Wait",        value: "2h 22m",                        color: AMBER  },
            ].map(s => (
              <div key={s.label} style={{ background: "white", borderRadius: 12, border: "1px solid #E2E8F0", padding: "14px 16px" }}>
                <div style={{ color: s.color, fontWeight: 900, fontSize: s.label === "Active Timer" && active ? 14 : 20, fontFamily: "'DM Mono', monospace", lineHeight: 1 }} className={active && s.label === "Active Timer" ? "dt-live" : ""}>{s.value}</div>
                <div style={{ color: "#94A3B8", fontSize: 11, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={30}>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {[{id:"active",label:"Active Timer"},{id:"start",label:"Start Timer"},{id:"history",label:"History"}].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`dt-tab${tab === t.id ? " active" : ""}`}
                style={{ background: "white", border: `1px solid ${tab===t.id?NAVY:"#E2E8F0"}`, color: "#475569", borderRadius: 9, padding: "8px 18px", fontSize: 13, fontWeight: 600, fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}>
                {t.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {tab === "active" && (
          <FadeIn>
            {active ? (
              <div className="dt-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
                <div style={{ background: "white", borderRadius: 16, border: `2px solid ${inFreeTime ? AMBER : RED}`, padding: "32px 28px", textAlign: "center" }}>
                  <div style={{ color: inFreeTime ? AMBER : RED, fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
                    {inFreeTime ? "⏳ In Free Time" : "💰 BILLING NOW"}
                  </div>
                  <div className="dt-clock" style={{ fontSize: 56, fontWeight: 900, fontFamily: "'DM Mono', monospace", color: inFreeTime ? "#0F172A" : RED, lineHeight: 1, marginBottom: 8 }}>
                    {fmt(elapsed)}
                  </div>
                  <div style={{ color: "#64748B", fontSize: 14, marginBottom: 28 }}>
                    {inFreeTime ? `Free time remaining: ${fmt(freeTimeLeft)}` : `Billable time: ${fmt(billableMs)}`}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
                    {[
                      { l: "Earning Rate",  v: `$${active.rateHr}/hr`,     c: NAVY  },
                      { l: "Earned",        v: `$${earnedSoFar.toFixed(2)}`,c: inFreeTime ? "#94A3B8" : GREEN },
                      { l: "Free Time",     v: `${active.freeMin}min`,     c: AMBER },
                    ].map(s => (
                      <div key={s.l} style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px" }}>
                        <div style={{ color: s.c, fontWeight: 900, fontSize: 18, fontFamily: "'DM Mono', monospace" }}>{s.v}</div>
                        <div style={{ color: "#94A3B8", fontSize: 10, marginTop: 3 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={stopTimer} style={{ width: "100%", background: RED, color: "white", border: "none", borderRadius: 10, padding: "14px", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                    ⏹ Stop Timer & Create Invoice
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", padding: "18px" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: NAVY, marginBottom: 12 }}>Current Session</div>
                    {[
                      { l: "Broker",   v: active.broker },
                      { l: "Shipper",  v: active.shipper },
                      { l: "Location", v: active.location },
                      { l: "Load ID",  v: active.loadId || "—" },
                      { l: "Started",  v: started },
                    ].map(d => (
                      <div key={d.l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #F8FAFC" }}>
                        <span style={{ color: "#94A3B8", fontSize: 12 }}>{d.l}</span>
                        <span style={{ fontWeight: 600, fontSize: 12 }}>{d.v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY2})`, borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ color: AMBER, fontWeight: 700, fontSize: 11, marginBottom: 6 }}>📡 Dispatch Darryl</div>
                    <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.7 }}>
                      Detention started at {started}. I've notified {active.broker}. If you gate out within 2 hours, no charge. After that I'll auto-generate the invoice at ${active.rateHr}/hr and send it immediately.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: "white", borderRadius: 14, border: "2px dashed #E2E8F0", padding: "64px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>⏱️</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: NAVY, marginBottom: 8 }}>No active detention timer</div>
                <div style={{ color: "#64748B", fontSize: 14, marginBottom: 20 }}>Arrived at a dock? Start your timer — we'll track every billable minute.</div>
                <button onClick={() => setTab("start")} style={{ background: ORANGE, color: "white", border: "none", borderRadius: 9, padding: "12px 28px", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                  Start Detention Timer →
                </button>
              </div>
            )}
          </FadeIn>
        )}

        {tab === "start" && (
          <FadeIn>
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", padding: "28px", maxWidth: 520 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: NAVY, marginBottom: 18 }}>⏱️ Start Detention Timer</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Broker *", key: "broker", placeholder: "e.g. Bluegrass Logistics" },
                  { label: "Shipper / Facility *", key: "shipper", placeholder: "e.g. AutoZone DC #14" },
                  { label: "Location", key: "location", placeholder: "e.g. Springfield, MO" },
                  { label: "Load ID", key: "loadId", placeholder: "e.g. LD-8821" },
                ].map(f => (
                  <div key={f.key}>
                    <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{f.label}</div>
                    <input className="dt-input" value={form[f.key]} onChange={e => setForm(p => ({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}
                      style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "'Poppins', sans-serif", color: "#0F172A" }} />
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Free Time (min)</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["60","90","120","180"].map(v => (
                        <button key={v} onClick={() => setForm(p=>({...p,freeMin:v}))}
                          style={{ flex:1, background: form.freeMin===v?NAVY:"#F8FAFC", color: form.freeMin===v?"white":"#475569", border:`1px solid ${form.freeMin===v?NAVY:"#E2E8F0"}`, borderRadius:6, padding:"6px 0", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>
                          {v}m
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Rate ($/hr)</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["35","50","65"].map(v => (
                        <button key={v} onClick={() => setForm(p=>({...p,rateHr:v}))}
                          style={{ flex:1, background: form.rateHr===v?NAVY:"#F8FAFC", color: form.rateHr===v?"white":"#475569", border:`1px solid ${form.rateHr===v?NAVY:"#E2E8F0"}`, borderRadius:6, padding:"6px 0", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>
                          ${v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={startTimer} style={{ background: `linear-gradient(135deg,${NAVY},${ORANGE})`, color:"white", border:"none", borderRadius:10, padding:"13px", fontWeight:900, fontSize:16, cursor:"pointer", fontFamily:"'Poppins',sans-serif" }}>
                  ▶ Start Timer
                </button>
              </div>
            </div>
          </FadeIn>
        )}

        {tab === "history" && (
          <FadeIn>
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: NAVY }}>Detention History</div>
                <div style={{ color: GREEN, fontWeight: 800, fontSize: 14, fontFamily: "'DM Mono', monospace" }}>Total: ${totalEarned.toFixed(2)}</div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ background: "#F8FAFC" }}>
                  {["Broker","Shipper","Location","Wait","Billable","Earned","Status"].map(h=>(
                    <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {HISTORY.map((h,i) => (
                    <tr key={h.id} style={{ borderBottom: "1px solid #F8FAFC" }}>
                      <td style={{ padding:"12px 16px", fontWeight:600, fontSize:13 }}>{h.broker}</td>
                      <td style={{ padding:"12px 16px", fontSize:13, color:"#64748B" }}>{h.shipper}</td>
                      <td style={{ padding:"12px 16px", fontSize:12, color:"#94A3B8" }}>{h.location}</td>
                      <td style={{ padding:"12px 16px", fontFamily:"'DM Mono',monospace", fontSize:13 }}>{Math.floor(h.totalMin/60)}h {h.totalMin%60}m</td>
                      <td style={{ padding:"12px 16px", fontFamily:"'DM Mono',monospace", fontSize:13 }}>{h.billable}m</td>
                      <td style={{ padding:"12px 16px", fontFamily:"'DM Mono',monospace", fontWeight:700, fontSize:14, color:GREEN }}>${h.pay.toFixed(2)}</td>
                      <td style={{ padding:"12px 16px" }}>
                        <span style={{ background:`${statusColor[h.status]}12`, color:statusColor[h.status], fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:10 }}>
                          {h.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        )}

        <FadeIn delay={80} style={{ marginTop: 20 }}>
          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY2})`, borderRadius: 14, padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div>
              <div style={{ color: AMBER, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, marginBottom: 4 }}>📡 DISPATCH DARRYL</div>
              <div style={{ color: "white", fontWeight: 800, fontSize: 15, marginBottom: 3 }}>Never leave detention money on the table.</div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>Darryl notifies your broker the moment your free time ends, and sends the invoice automatically when you gate out.</div>
            </div>
            <a href="/#pricing" style={{ background: AMBER, color: DARK, padding: "10px 22px", borderRadius: 9, fontWeight: 800, fontSize: 14, textDecoration: "none", flexShrink: 0 }}>Start Free Trial</a>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
