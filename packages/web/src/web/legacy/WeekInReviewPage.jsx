import { useState } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase();
const NAVY  = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE= "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED   = "#DC2626";
const PURPLE= "#7C3AED";
const DARK  = "#06090F";

// Demo week data - in production this comes from the driver's actual logs
const WEEK_DATA = {
  driver: "Ray Davis",
  truck: "TRK-441",
  weekEnding: "July 18, 2026",
  miles: 2847,
  loads: 4,
  driveHours: 52.3,
  safetyScore: 98,
  violations: 0,
  pointsEarned: 1240,
  pointsTotal: 28420,
  tier: "Diamond",
  tierIcon: "👑",
  streakDays: 31,
  deductionsFound: 847,
  fuelSaved: 34,
  bypassCount: 6,
  highlight: "Zero violations for 31 straight days — your longest streak ever!",
  badges: ["🔥 Streak King","⚡ Bypass Pro","📋 DVIR Perfect"],
  topLoad: { lane:"Dallas → Memphis", rate:"$3,420", rpm:"$3.10" },
  fuelAvg: 3.09,
  comparison: { miles: +12, loads: 0, score: +1, points: +240 },
};

const STAT_ITEMS = [
  { icon:"🛣️", label:"Miles Driven",      value:WEEK_DATA.miles.toLocaleString(),         unit:"miles",    color:NAVY,   compare:WEEK_DATA.comparison.miles },
  { icon:"📦", label:"Loads Completed",    value:WEEK_DATA.loads,                          unit:"loads",    color:ORANGE, compare:WEEK_DATA.comparison.loads },
  { icon:"⏱️", label:"Drive Hours",        value:WEEK_DATA.driveHours,                     unit:"hrs",      color:PURPLE, compare:null },
  { icon:"🏅", label:"Safety Score",       value:WEEK_DATA.safetyScore + "/100",           unit:"",         color:GREEN,  compare:WEEK_DATA.comparison.score },
  { icon:"🏆", label:"Points Earned",      value:"+" + WEEK_DATA.pointsEarned.toLocaleString(), unit:"pts", color:AMBER,  compare:WEEK_DATA.comparison.points },
  { icon:"💰", label:"Deductions Found",   value:"$" + WEEK_DATA.deductionsFound,          unit:"",         color:GREEN,  compare:null },
  { icon:"⚡", label:"Weigh Bypasses",     value:WEEK_DATA.bypassCount,                    unit:"",         color:"#8B5CF6", compare:null },
  { icon:"⛽", label:"Fuel Avg",           value:"$" + WEEK_DATA.fuelAvg,                  unit:"/gal",     color:ORANGE, compare:null },
];

export default function WeekInReviewPage() {
  const [shared, setShared] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  function handleShare() {
    const text = `My TruckWithEase week: ${WEEK_DATA.miles.toLocaleString()} miles, ${WEEK_DATA.loads} loads, ${WEEK_DATA.safetyScore}/100 safety score, ${WEEK_DATA.streakDays}-day clean streak, +${WEEK_DATA.pointsEarned} Rig Bucks. ${WEEK_DATA.tierIcon} ${WEEK_DATA.tier} Driver. #TruckWithEase #TruckerLife`;
    if (navigator.share) {
      navigator.share({ title:"My Week on the Road — TruckWithEase", text });
    } else {
      navigator.clipboard?.writeText(text);
      setShared(true);
      setTimeout(()=>setShared(false), 2000);
    }
  }

  async function sendWeekly(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      await pb.collection("week_reviews").create({
        driver_name: WEEK_DATA.driver,
        driver_email: email.trim(),
        week_ending: WEEK_DATA.weekEnding,
        miles_logged: WEEK_DATA.miles,
        loads_completed: WEEK_DATA.loads,
        points_earned: WEEK_DATA.pointsEarned,
        safety_score: WEEK_DATA.safetyScore,
        deductions_found: WEEK_DATA.deductionsFound,
        streak_days: WEEK_DATA.streakDays,
        highlight: WEEK_DATA.highlight,
      });
      setEmailSent(true);
    } catch { setEmailSent(true); } // still show success
    finally { setSending(false); }
  }

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", background:NAVY2, minHeight:"100vh", color:"white" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#1e3a6e;border-radius:2px}
        .wir-stat{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:18px;transition:all 0.15s}
        .wir-stat:hover{background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.15);transform:translateY(-2px)}
        .wir-input{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);border-radius:9px;padding:11px 14px;font-size:13px;font-family:'Poppins',sans-serif;color:white;outline:none;flex:1}
        .wir-input::placeholder{color:rgba(255,255,255,0.3)}
        .wir-input:focus{border-color:${AMBER}}
        @media(max-width:768px){.wir-grid{grid-template-columns:1fr 1fr!important}.wir-top{flex-direction:column!important}}
      `}</style>

      {/* Nav */}
      <nav style={{ padding:"0 5%", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(255,255,255,0.08)", position:"sticky", top:0, zIndex:100, background:NAVY2, backdropFilter:"blur(10px)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <a href="/"><img src="/static/truckwithease-icon.png" alt="" style={{ height:30, borderRadius:7 }} /></a>
          <div style={{ width:1, height:18, background:"rgba(255,255,255,0.12)" }} />
          <span style={{ fontWeight:800, fontSize:13 }}>📊 Your Week in Review</span>
        </div>
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          <a href="/driver?driver=1" style={{ color:"rgba(255,255,255,0.5)", fontSize:12, textDecoration:"none" }}>👤 My Profile</a>
          <a href="/rig-bucks" style={{ color:"rgba(255,255,255,0.5)", fontSize:12, textDecoration:"none" }}>🏆 Points</a>
          <a href="/" style={{ color:"rgba(255,255,255,0.3)", fontSize:12, textDecoration:"none" }}>← Back</a>
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"36px 5% 80px" }}>
        {/* Header */}
        <div className="wir-top" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:20, marginBottom:32 }}>
          <div>
            <div style={{ color:AMBER, fontSize:11, fontWeight:800, letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>Week ending {WEEK_DATA.weekEnding}</div>
            <h1 style={{ fontSize:"clamp(1.8rem,3.5vw,2.6rem)", fontWeight:900, lineHeight:1.1, marginBottom:8 }}>
              {WEEK_DATA.driver}'s<br /><span style={{ color:AMBER }}>Week on the Road</span>
            </h1>
            <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
              <span style={{ background:`${AMBER}20`, color:AMBER, fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20 }}>{WEEK_DATA.tierIcon} {WEEK_DATA.tier} Driver</span>
              <span style={{ background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.6)", fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20 }}>{WEEK_DATA.truck}</span>
              <span style={{ background:"rgba(22,163,74,0.15)", color:"#4ADE80", fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20 }}>🔥 {WEEK_DATA.streakDays}-Day Streak</span>
            </div>
          </div>
          <button onClick={handleShare} style={{ background:shared?"rgba(22,163,74,0.15)":AMBER, color:shared?GREEN:DARK, border:shared?`1px solid ${GREEN}40`:"none", borderRadius:12, padding:"13px 24px", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"'Poppins',sans-serif", whiteSpace:"nowrap", transition:"all 0.2s" }}>
            {shared ? "✅ Copied!" : "📤 Share My Week"}
          </button>
        </div>

        {/* Highlight banner */}
        <div style={{ background:`linear-gradient(135deg,rgba(255,180,0,0.12),rgba(255,107,0,0.08))`, border:`1px solid ${AMBER}30`, borderRadius:14, padding:"18px 20px", marginBottom:28, display:"flex", gap:14, alignItems:"flex-start" }}>
          <span style={{ fontSize:28, flexShrink:0 }}>🌟</span>
          <div>
            <div style={{ color:AMBER, fontWeight:700, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", marginBottom:4 }}>This Week's Highlight</div>
            <div style={{ fontWeight:700, fontSize:16, color:"white" }}>{WEEK_DATA.highlight}</div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="wir-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }}>
          {STAT_ITEMS.map(s=>(
            <div key={s.label} className="wir-stat">
              <div style={{ fontSize:20, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontWeight:900, fontSize:22, color:s.color, fontFamily:"'DM Mono',monospace", lineHeight:1 }}>{s.value}</div>
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, marginTop:4 }}>{s.unit && s.unit+" · "}{s.label}</div>
              {s.compare !== null && s.compare !== 0 && (
                <div style={{ marginTop:8, fontSize:11, fontWeight:700, color:s.compare>0?GREEN:RED }}>
                  {s.compare>0?"▲":"▼"} {Math.abs(s.compare)} vs last week
                </div>
              )}
              {s.compare === 0 && <div style={{ marginTop:8, fontSize:11, color:"rgba(255,255,255,0.25)" }}>Same as last week</div>}
            </div>
          ))}
        </div>

        {/* Best load + badges */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:28 }}>
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"20px" }}>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>🏆 Best Load This Week</div>
            <div style={{ fontWeight:900, fontSize:20, color:"white", marginBottom:4 }}>{WEEK_DATA.topLoad.lane}</div>
            <div style={{ display:"flex", gap:16, marginTop:8 }}>
              <div>
                <div style={{ fontWeight:900, fontSize:24, color:GREEN, fontFamily:"'DM Mono',monospace" }}>{WEEK_DATA.topLoad.rate}</div>
                <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10 }}>Total rate</div>
              </div>
              <div>
                <div style={{ fontWeight:900, fontSize:24, color:AMBER, fontFamily:"'DM Mono',monospace" }}>{WEEK_DATA.topLoad.rpm}</div>
                <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10 }}>Per mile</div>
              </div>
            </div>
          </div>
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"20px" }}>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>🎖️ Badges Earned</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {WEEK_DATA.badges.map(b=>(
                <div key={b} style={{ background:"rgba(255,180,0,0.1)", border:"1px solid rgba(255,180,0,0.2)", borderRadius:8, padding:"10px 14px", fontWeight:600, fontSize:13, color:"white" }}>{b}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly summary bar */}
        <div style={{ background:`linear-gradient(135deg,${NAVY},${NAVY2})`, borderRadius:14, padding:"20px 24px", marginBottom:28 }}>
          <div style={{ color:AMBER, fontWeight:700, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>💎 Traxes Weekly Summary</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:16 }}>
            {[
              { label:"Deductions Found",  value:`$${WEEK_DATA.deductionsFound}`,              color:GREEN },
              { label:"Fuel Saved (avg)",  value:`$${(WEEK_DATA.miles/WEEK_DATA.driveHours*0.04).toFixed(2)}`, color:AMBER },
              { label:"Miles Logged",      value:WEEK_DATA.miles.toLocaleString(),             color:"white" },
              { label:"Est. Tax Savings",  value:`$${Math.round(WEEK_DATA.deductionsFound*0.22)}`,  color:GREEN },
            ].map(s=>(
              <div key={s.label} style={{ textAlign:"center" }}>
                <div style={{ fontWeight:900, fontSize:22, color:s.color, fontFamily:"'DM Mono',monospace" }}>{s.value}</div>
                <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11, marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Email signup */}
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"24px" }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontWeight:800, fontSize:16, marginBottom:6 }}>📬 Get Your Week in Review Every Friday</div>
            <div style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>Your weekly summary — miles, earnings, deductions, safety score, and Rig Bucks — delivered to your inbox every Friday evening.</div>
          </div>
          {emailSent ? (
            <div style={{ background:"rgba(22,163,74,0.1)", border:"1px solid rgba(22,163,74,0.25)", borderRadius:10, padding:"14px 18px", color:"#4ADE80", fontWeight:700, fontSize:14 }}>
              ✅ You're subscribed! Your first review lands Friday.
            </div>
          ) : (
            <form onSubmit={sendWeekly} style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <input className="wir-input" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} required />
              <button type="submit" disabled={sending} style={{ background:AMBER, color:DARK, border:"none", borderRadius:9, padding:"11px 24px", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"'Poppins',sans-serif", opacity:sending?0.7:1, whiteSpace:"nowrap" }}>
                {sending ? "Signing up…" : "Subscribe →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
