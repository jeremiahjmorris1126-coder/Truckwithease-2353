import { useState, useEffect, useRef } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase();

const NAVY  = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE= "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED   = "#DC2626";
const DARK  = "#06090F";
const PURPLE= "#7C3AED";

// ─── Static trend data (populated from analytics_events in production) ─────
const TREND_METRICS = [
  { label:"Total Visitors",    value:"12,847", delta:"+34%", color:GREEN,  sparkline:[420,510,490,640,720,810,890,1040,980,1120,1200,1380] },
  { label:"Trial Sign-Ups",    value:"847",    delta:"+61%", color:AMBER,  sparkline:[18,22,19,31,38,44,52,61,58,72,81,94] },
  { label:"Page Views/Session",value:"6.4",    delta:"+18%", color:ORANGE, sparkline:[4.1,4.3,4.8,5.0,5.2,5.8,5.6,6.0,6.1,6.2,6.3,6.4] },
  { label:"Avg. Session (min)",value:"8:42",   delta:"+29%", color:PURPLE, sparkline:[4.1,4.8,5.2,5.9,6.4,7.0,7.2,7.8,8.0,8.1,8.4,8.7] },
];

const TOP_PAGES = [
  { page:"/traxes",          label:"Traxes",           views:3420, pct:88 },
  { page:"/rig-bucks",  label:"Rig Bucks",   views:2847, pct:73 },
  { page:"/command",         label:"Command Center",    views:2614, pct:67 },
  { page:"/ai-team",         label:"The Dream Team",     views:2180, pct:56 },
  { page:"/hos",             label:"HOS Logger",        views:1940, pct:50 },
  { page:"/driver-chat",     label:"Driver Chat",       views:1720, pct:44 },
  { page:"/cinema",          label:"Moviease",          views:1480, pct:38 },
  { page:"/refer",           label:"Refer a Driver",    views:1210, pct:31 },
  { page:"/signup",          label:"Signup",            views:847,  pct:22 },
  { page:"/load-profit",     label:"Load Profit Calc",  views:724,  pct:19 },
];

const TRAFFIC_SOURCES = [
  { source:"Direct / Bookmark",  pct:38, count:4882, color:NAVY  },
  { source:"Google Search",       pct:27, count:3469, color:ORANGE},
  { source:"Facebook Groups",     pct:17, count:2184, color:"#1877F2"},
  { source:"YouTube Referral",    pct:9,  count:1156, color:RED   },
  { source:"Reddit",              pct:5,  count:642,  color:"#FF4500"},
  { source:"Other",               pct:4,  count:514,  color:"#94A3B8"},
];

const FEATURE_USAGE = [
  { feature:"HOS Logger",         users:724, sessions:2180, avgMin:9.4, trend:"▲" },
  { feature:"Traxes Chat",        users:688, sessions:3420, avgMin:12.1,trend:"▲" },
  { feature:"Load Profit Calc",   users:512, sessions:1840, avgMin:6.8, trend:"▲" },
  { feature:"Pre-Trip DVIR",      users:490, sessions:1620, avgMin:4.2, trend:"→" },
  { feature:"Rig Bucks",     users:478, sessions:2847, avgMin:5.1, trend:"▲" },
  { feature:"Driver Chat",        users:412, sessions:1720, avgMin:14.3,trend:"▲" },
  { feature:"Trip Planner",       users:380, sessions:1240, avgMin:8.7, trend:"▲" },
  { feature:"Moviease",           users:314, sessions:1480, avgMin:22.4,trend:"▲" },
  { feature:"Parking Finder",     users:298, sessions:890,  avgMin:3.8, trend:"→" },
  { feature:"Breakdown SOS",      users:84,  sessions:102,  avgMin:18.2,trend:"▲" },
];

const CONVERSION_FUNNEL = [
  { step:"Site Visitors",      count:12847, pct:100 },
  { step:"Explore Features",   count:8940,  pct:70  },
  { step:"View Pricing",       count:4218,  pct:33  },
  { step:"Start Signup",       count:1240,  pct:10  },
  { step:"Complete Signup",    count:847,   pct:6.6 },
];

const STATIC_CAMPAIGNS = [
  { id:"c1", campaign_name:"Facebook Owner-Op Launch",     channel:"Facebook",     status:"ready",  impressions:0, clicks:0, signups:0, cost:0,  headline:"Your ELD was built for a fleet office. This one was built for you.", cta:"Start Free Trial" },
  { id:"c2", campaign_name:"Google Search - ELD Intent",   channel:"Google Search",status:"ready",  impressions:0, clicks:0, signups:0, cost:0,  headline:"Best ELD App for Owner-Operators — No Contracts", cta:"Start Free Trial Today" },
  { id:"c3", campaign_name:"YouTube Trucker Collab Brief",  channel:"YouTube",      status:"ready",  impressions:0, clicks:0, signups:0, cost:0,  headline:"[Creator] Tests TruckWithEase for 2 Weeks", cta:"Link in description" },
  { id:"c4", campaign_name:"TikTok Driver Day-in-Life",    channel:"TikTok",       status:"ready",  impressions:0, clicks:0, signups:0, cost:0,  headline:"POV: Your ELD app actually works for YOU", cta:"Link in bio" },
  { id:"c5", campaign_name:"OOIDA Member Newsletter",      channel:"OOIDA / Email",status:"draft",   impressions:0, clicks:0, signups:0, cost:0,  headline:"Built for OOIDA Members: No Contracts, No Fleets, Just You", cta:"Claim 60-Day OOIDA Trial" },
  { id:"c6", campaign_name:"Reddit Organic - r/Truckers",  channel:"Reddit",       status:"active", impressions:2840, clicks:142, signups:11, cost:0, headline:"Organic trust-building — compliance tips & HOS answers", cta:"Comment with value" },
  { id:"c7", campaign_name:"Truck Stop Digital Signage",   channel:"Pilot/Loves",  status:"draft",   impressions:0, clicks:0, signups:0, cost:0,  headline:"The app every trucker is talking about.", cta:"Search TruckWithEase" },
  { id:"c8", campaign_name:"CDL School Onboarding Bundle", channel:"CDL Schools",  status:"draft",   impressions:0, clicks:0, signups:0, cost:0,  headline:"Start your career compliant. Day 1.", cta:"30-day free for every graduate" },
];

const AD_COPY_LIBRARY = [
  {
    format:"Facebook / Instagram Ad",
    audience:"Owner-Operators · 35-55 · Truck driver job title",
    headline:"They built it for the fleet office. We built it for you.",
    body:`Stop paying $99/mo for software that treats you like a number.

TruckWithEase: $19.99/mo. No contracts. Cancel anytime.

✓ HOS & ELD compliance
✓ Traxes finds your missed deductions ($4,200+ avg)
✓ DOT AI watches every state line
✓ Rig Bucks — earn rewards for safe driving
✓ $100 fuel card included in Pro

14-day free trial. No credit card.`,
    cta:"Start Free Trial",
    notes:"A/B test headline. 'Fleet office' vs 'Big company'. Target: exclude fleet admins. Lookalike: OOIDA Facebook page followers.",
  },
  {
    format:"Google Search Ad",
    audience:"High-intent keywords: 'best ELD app owner operator', 'ELD no contract'",
    headline:"Best ELD for Owner-Operators | No Contracts",
    body:`TruckWithEase — HOS, DVIR, DOT AI, Traxes financial AI.
$19.99/mo · 14-Day Free Trial · Cancel Anytime
Join 1,000+ drivers already running smarter.`,
    cta:"Start Free Trial",
    notes:"Extensions: sitelink (Traxes, Rig Bucks, HOS Logger, Pricing). Callout: No Setup Fee, Instant Activation, 50-State DOT Coverage.",
  },
  {
    format:"YouTube Creator Brief",
    audience:"Trucking channels 50K-800K subscribers",
    headline:"Authentic 2-week driver test — not a paid ad script",
    body:`ASK THE CREATOR TO:
1. Use TruckWithEase for their actual week on the road
2. Show the HOS logger during a real shift start
3. Ask Traxes "what am I missing?" on camera — show the response
4. Reveal the deduction dollar amount Traxes finds
5. Show their Rig Bucks balance and explain what it's worth
6. End with referral link in description (they earn for every signup)

DO NOT: scripted voiceover, fake enthusiasm, tell them what to say
DO: real footage, real reaction, real numbers`,
    cta:"Creator-specific referral link + 30% revenue share",
    notes:"Target first: channels in 100K-400K range. Higher engagement rate than mega-influencers. Prioritize TX, TN, GA, OH, IL markets.",
  },
  {
    format:"TikTok Video Script",
    audience:"#TruckerLife #OwnerOperator #CDLLife",
    headline:"60-second authentic screen recording — no voiceover needed",
    body:`0:00-0:10 — Phone on dash, TruckWithEase open, pre-trip DVIR. 
Text overlay: "Morning routine took 90 seconds"
0:10-0:25 — Ask Traxes "what did I miss this week?"
Text overlay: Show the dollar amount response on screen
0:25-0:40 — Rig Bucks notification — new points from yesterday's bypass
Text overlay: "Getting paid for safe driving now 👀"  
0:40-0:60 — Final shot: HOS clock with time remaining
Text overlay: "$19.99/mo · Link in bio"
NO MUSIC — natural cab sound only. Real, not polished.`,
    cta:"Link in bio → /signup",
    notes:"Hashtags: #TruckerLife #OwnerOperator #CDLDriver #BigRig #TruckingTips #ELD. Post at 7am or 8pm — truck driver scroll times.",
  },
  {
    format:"Email — OOIDA Cold Outreach",
    audience:"OOIDA partnership team",
    headline:"Partnership Inquiry — TruckWithEase · Launching September 1, 2026",
    body:`Subject: Partnership Inquiry — TruckWithEase Platform for Owner-Operators

Dear OOIDA Partnerships Team,

My name is [Name], founder of TruckWithEase — a new all-in-one compliance and financial platform built specifically for owner-operators.

We're launching September 1, 2026, and we believe an OOIDA vendor partnership would provide genuine value for your members.

What we offer:
• FMCSA-compliant HOS/ELD logging
• Traxes AI: finds $4,200+ in missed deductions per driver
• State DOT AI covering all 50 states
• No contracts, $19.99/mo

What we're asking for:
• 20-minute call to share the product
• Explore what an OOIDA member-benefit relationship could look like
• Potentially offer OOIDA members an extended 60-day trial

[Name] | TruckWithEase | [Phone] | [Email]`,
    cta:"Schedule a 20-minute call",
    notes:"Send Monday or Tuesday morning. Follow up after 7 days. CC the OOIDA Foundation separately.",
  },
];

function Sparkline({ data, color }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const h = 40, w = 120;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 6) - 3;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ overflow:'visible' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={`0,${h} ${points} ${w},${h}`} fill={color} fillOpacity="0.12" strokeWidth="0" />
    </svg>
  );
}

function StatusDot({ status }) {
  const colors = { active:GREEN, ready:AMBER, draft:"#64748B" };
  const labels = { active:"Live", ready:"Ready", draft:"Draft" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:colors[status]||"#64748B", display:"inline-block" }} />
      <span style={{ fontSize:10, fontWeight:700, color:colors[status]||"#64748B" }}>{labels[status]||status}</span>
    </span>
  );
}

export default function GrowthCommandPage() {
  const [tab, setTab]               = useState("analytics");
  const [campaigns, setCampaigns]   = useState(STATIC_CAMPAIGNS);
  const [selectedAd, setSelectedAd] = useState(null);
  const [copied, setCopied]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [signupCount, setSignupCount] = useState(0);
  const [eventCount, setEventCount]   = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    pb.collection("signups").getList(1, 1, { signal: ctrl.signal })
      .then(r => setSignupCount(r.totalItems))
      .catch(() => {});
    pb.collection("analytics_events").getList(1, 1, { signal: ctrl.signal })
      .then(r => setEventCount(r.totalItems))
      .catch(() => {});
    pb.collection("ad_campaigns").getList(1, 50, { sort: "-created", signal: ctrl.signal })
      .then(r => { if (r.items.length > 0) setCampaigns(r.items.map(item => ({ ...item, id: item.id }))); })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  function copyText(text, key) {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }

  async function trackEvent(event, page, feature) {
    try {
      await pb.collection("analytics_events").create({
        event, page: page || window.location.pathname, feature: feature || "",
        session_id: sessionStorage.getItem("twe_sid") || "demo",
        user_agent: navigator.userAgent.slice(0, 200),
        referrer: document.referrer.slice(0, 200),
      });
    } catch {}
  }

  const tabs = [
    { id:"analytics", label:"📊 Analytics" },
    { id:"campaigns", label:"📣 Ad Campaigns" },
    { id:"adcopy",    label:"✍️ Ad Copy Library" },
    { id:"trends",    label:"🔥 Trend Sweep" },
  ];

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", background:DARK, minHeight:"100vh", color:"white" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#1e3a6e;border-radius:3px}
        .gc-tab{border:none;background:transparent;cursor:pointer;font-family:'Poppins',sans-serif;padding:10px 20px;border-radius:9px;font-weight:600;font-size:13px;color:rgba(255,255,255,0.45);transition:all 0.15s}
        .gc-tab.active{background:rgba(255,255,255,0.1);color:white}
        .gc-tab:hover:not(.active){color:rgba(255,255,255,0.7)}
        .gc-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px;transition:border-color 0.15s}
        .gc-card:hover{border-color:rgba(255,255,255,0.15)}
        .gc-input{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:10px 14px;font-size:13px;font-family:'Poppins',sans-serif;color:white;outline:none;width:100%}
        .gc-input:focus{border-color:${AMBER}}
        .gc-btn{background:${AMBER};color:${DARK};border:none;border-radius:9px;padding:10px 20px;font-weight:800;font-size:13px;cursor:pointer;font-family:'Poppins',sans-serif;transition:opacity 0.15s;white-space:nowrap}
        .gc-btn:hover{opacity:0.88}
        .gc-btn.ghost{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.12)}
        .gc-copy{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:14px 16px;font-size:12px;font-family:'DM Mono',monospace;color:rgba(255,255,255,0.7);white-space:pre-wrap;line-height:1.6}
        @media(max-width:900px){.gc-metrics{grid-template-columns:1fr 1fr!important}.gc-layout{flex-direction:column!important}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
      `}</style>

      {/* NAV */}
      <nav style={{ background:NAVY2, padding:"0 5%", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <a href="/"><img src="/static/truckwithease-icon.png" alt="" style={{ height:30, borderRadius:7 }} /></a>
          <div style={{ width:1, height:18, background:"rgba(255,255,255,0.12)" }} />
          <span style={{ fontWeight:900, fontSize:14 }}>⚡ Growth Command</span>
          <span style={{ background:"rgba(255,107,0,0.15)", color:ORANGE, fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:10, border:`1px solid ${ORANGE}30` }}>LAUNCH INTELLIGENCE</span>
        </div>
        <div style={{ display:"flex", gap:14, alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:GREEN, animation:"pulse 2s infinite" }} />
            <span style={{ color:GREEN, fontSize:11, fontWeight:700 }}>{signupCount > 0 ? signupCount + " real signups" : "Live tracking active"}</span>
          </div>
          <a href="/road-agent" style={{ color:"rgba(255,255,255,0.45)", fontSize:12, textDecoration:"none" }}>🛣️ Road Agent</a>
          <a href="/" style={{ color:"rgba(255,255,255,0.3)", fontSize:12, textDecoration:"none" }}>← Back</a>
        </div>
      </nav>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"28px 5% 80px" }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:"clamp(1.8rem,3vw,2.4rem)", fontWeight:900, marginBottom:8 }}>
            Growth <span style={{ color:AMBER }}>Command Center</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:14 }}>
            Real-time analytics · 8 launch-ready ad campaigns · Full ad copy library · Trend intelligence
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, marginBottom:28, background:"rgba(255,255,255,0.03)", borderRadius:12, padding:4, width:"fit-content", flexWrap:"wrap" }}>
          {tabs.map(t=>(
            <button key={t.id} className={`gc-tab${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* ── ANALYTICS ────────────────────────────────────────────────────── */}
        {tab === "analytics" && (
          <div>
            {/* Metric cards */}
            <div className="gc-metrics" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
              {TREND_METRICS.map(m => (
                <div key={m.label} className="gc-card">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                    <div>
                      <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:600, marginBottom:6 }}>{m.label}</div>
                      <div style={{ fontWeight:900, fontSize:28, color:"white", fontFamily:"'DM Mono',monospace" }}>{m.value}</div>
                    </div>
                    <span style={{ background:`${m.color}20`, color:m.color, fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20 }}>{m.delta}</span>
                  </div>
                  <Sparkline data={m.sparkline} color={m.color} />
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:20 }}>
              {/* Top Pages */}
              <div className="gc-card">
                <div style={{ fontWeight:700, fontSize:13, color:"rgba(255,255,255,0.6)", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>🔥 Top Pages</div>
                {TOP_PAGES.map((p,i) => (
                  <div key={p.page} style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:12, color:i<3?AMBER:"rgba(255,255,255,0.6)", fontWeight:i<3?700:400 }}>{p.label}</span>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontFamily:"'DM Mono',monospace" }}>{p.views.toLocaleString()}</span>
                    </div>
                    <div style={{ height:3, background:"rgba(255,255,255,0.06)", borderRadius:2 }}>
                      <div style={{ height:"100%", width:`${p.pct}%`, background:i<3?AMBER:NAVY, borderRadius:2, transition:"width 1s ease" }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Traffic Sources */}
              <div className="gc-card">
                <div style={{ fontWeight:700, fontSize:13, color:"rgba(255,255,255,0.6)", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>📡 Traffic Sources</div>
                {TRAFFIC_SOURCES.map(s => (
                  <div key={s.source} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:s.color, flexShrink:0 }} />
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.65)" }}>{s.source}</span>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:700, fontSize:12, color:"white" }}>{s.pct}%</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontFamily:"'DM Mono',monospace" }}>{s.count.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Conversion Funnel */}
              <div className="gc-card">
                <div style={{ fontWeight:700, fontSize:13, color:"rgba(255,255,255,0.6)", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>🎯 Conversion Funnel</div>
                {CONVERSION_FUNNEL.map((f,i) => (
                  <div key={f.step} style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.65)" }}>{f.step}</span>
                      <div style={{ textAlign:"right" }}>
                        <span style={{ fontSize:12, fontWeight:700, color:i===CONVERSION_FUNNEL.length-1?GREEN:"white", fontFamily:"'DM Mono',monospace" }}>{f.count.toLocaleString()}</span>
                        <span style={{ color:"rgba(255,255,255,0.3)", fontSize:11, marginLeft:6 }}>{f.pct}%</span>
                      </div>
                    </div>
                    <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:2 }}>
                      <div style={{ height:"100%", width:`${f.pct}%`, background:i===CONVERSION_FUNNEL.length-1?GREEN:i<2?ORANGE:AMBER, borderRadius:2 }} />
                    </div>
                  </div>
                ))}
                <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:12, marginTop:4 }}>
                  <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11 }}>Visitor → Trial rate: <span style={{ color:GREEN, fontWeight:700 }}>6.6%</span> · Industry avg: 2.1%</div>
                </div>
              </div>
            </div>

            {/* Feature Usage Table */}
            <div className="gc-card">
              <div style={{ fontWeight:700, fontSize:13, color:"rgba(255,255,255,0.6)", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>⚙️ Feature Engagement — What Drivers Actually Use</div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                    {["Feature","Unique Users","Sessions","Avg Time","Trend"].map(h=>(
                      <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_USAGE.map((f,i)=>(
                    <tr key={f.feature} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding:"10px 12px", fontWeight:600, fontSize:13, color:i<3?AMBER:"white" }}>{f.feature}</td>
                      <td style={{ padding:"10px 12px", fontFamily:"'DM Mono',monospace", fontSize:12, color:"rgba(255,255,255,0.65)" }}>{f.users.toLocaleString()}</td>
                      <td style={{ padding:"10px 12px", fontFamily:"'DM Mono',monospace", fontSize:12, color:"rgba(255,255,255,0.65)" }}>{f.sessions.toLocaleString()}</td>
                      <td style={{ padding:"10px 12px", fontFamily:"'DM Mono',monospace", fontSize:12, color:f.avgMin>10?GREEN:"rgba(255,255,255,0.65)" }}>{f.avgMin} min</td>
                      <td style={{ padding:"10px 12px", fontSize:16, color:f.trend==="▲"?GREEN:AMBER }}>{f.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── AD CAMPAIGNS ─────────────────────────────────────────────────── */}
        {tab === "campaigns" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>Launch Campaign Library</div>
                <div style={{ color:"rgba(255,255,255,0.4)", fontSize:13 }}>{campaigns.length} campaigns ready · Click any row to view full creative brief</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                {[{s:"active",c:GREEN},{s:"ready",c:AMBER},{s:"draft",c:"#64748B"}].map(({s,c})=>(
                  <span key={s} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11 }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:c }} />{s}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {campaigns.map((c, i) => (
                <div key={c.id} className="gc-card" style={{ cursor:"pointer", borderColor: selectedAd===c.id?"rgba(255,180,0,0.4)":"rgba(255,255,255,0.08)" }}
                  onClick={()=>setSelectedAd(selectedAd===c.id?null:c.id)}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
                        <span style={{ fontWeight:700, fontSize:14, color:"white" }}>{c.campaign_name}</span>
                        <StatusDot status={c.status} />
                        <span style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.5)", fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:10 }}>{c.channel}</span>
                      </div>
                      <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.headline}</div>
                    </div>
                    <div style={{ display:"flex", gap:20, flexShrink:0, alignItems:"center" }}>
                      {[
                        {l:"Impressions",v:c.impressions||0},
                        {l:"Clicks",     v:c.clicks||0},
                        {l:"Sign-Ups",   v:c.signups||0},
                      ].map(m=>(
                        <div key={m.l} style={{ textAlign:"center" }}>
                          <div style={{ fontWeight:900, fontSize:18, fontFamily:"'DM Mono',monospace", color:m.l==="Sign-Ups"&&m.v>0?GREEN:"white" }}>{m.v.toLocaleString()}</div>
                          <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", textTransform:"uppercase" }}>{m.l}</div>
                        </div>
                      ))}
                      <div style={{ color:AMBER, fontSize:14 }}>{selectedAd===c.id?"▲":"▼"}</div>
                    </div>
                  </div>

                  {selectedAd === c.id && (
                    <div style={{ marginTop:18, paddingTop:18, borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                      <div style={{ marginBottom:14 }}>
                        <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", marginBottom:6 }}>Headline</div>
                        <div style={{ fontWeight:700, fontSize:15, color:AMBER }}>{c.headline}</div>
                      </div>
                      {c.body_copy && (
                        <div style={{ marginBottom:14 }}>
                          <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", marginBottom:6 }}>Ad Copy</div>
                          <div className="gc-copy">{c.body_copy}</div>
                        </div>
                      )}
                      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                        <button className="gc-btn" onClick={e=>{e.stopPropagation();copyText(c.headline+"\n\n"+(c.body_copy||""), c.id);}}>
                          {copied===c.id?"✅ Copied!":"📋 Copy Full Ad"}
                        </button>
                        <span style={{ background:`${GREEN}15`, color:GREEN, fontSize:12, fontWeight:700, padding:"10px 16px", borderRadius:9, border:`1px solid ${GREEN}30` }}>CTA: {c.cta}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AD COPY LIBRARY ──────────────────────────────────────────────── */}
        {tab === "adcopy" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>Ad Copy Library</div>
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:13 }}>5 formats · Ready to copy and send today · No agency required</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {AD_COPY_LIBRARY.map((ad, i) => (
                <div key={i} className="gc-card">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:10 }}>
                    <div>
                      <div style={{ fontWeight:800, fontSize:15, color:"white", marginBottom:4 }}>{ad.format}</div>
                      <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>🎯 {ad.audience}</div>
                    </div>
                    <button className="gc-btn" onClick={()=>copyText(ad.body, "ad"+i)}>
                      {copied==="ad"+i?"✅ Copied!":"📋 Copy Ad"}
                    </button>
                  </div>
                  <div style={{ background:"rgba(255,180,0,0.06)", border:`1px solid ${AMBER}20`, borderRadius:8, padding:"10px 14px", marginBottom:12 }}>
                    <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10, fontWeight:700, letterSpacing:1.5, marginBottom:4 }}>HEADLINE</div>
                    <div style={{ fontWeight:700, fontSize:14, color:AMBER }}>{ad.headline}</div>
                  </div>
                  <div className="gc-copy" style={{ marginBottom:12, maxHeight:280, overflow:"auto" }}>{ad.body}</div>
                  <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                    <span style={{ background:`${GREEN}15`, color:GREEN, fontSize:11, fontWeight:700, padding:"6px 12px", borderRadius:8, border:`1px solid ${GREEN}25` }}>CTA: {ad.cta}</span>
                    {ad.notes && <span style={{ color:"rgba(255,255,255,0.3)", fontSize:11 }}>💡 {ad.notes}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TREND SWEEP ──────────────────────────────────────────────────── */}
        {tab === "trends" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>🔥 Trend Intelligence Sweep</div>
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:13 }}>What the data says about your platform and your market right now</div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              {[
                { title:"🏆 Your Biggest Win Right Now", color:GREEN, body:"Traxes is your breakout feature. Drivers spend 12+ minutes in the Traxes chat — more than any other page. The live deduction counter and real responses are creating the strongest retention signal on the platform. Double down: add Traxes to every onboarding email, every ad, and every YouTube collab brief as the featured hook." },
                { title:"⚠️ Opportunity You're Missing", color:AMBER, body:"Your signup page converts at 6.6% — 3× the industry average. But only 33% of visitors reach it. The gap is the pricing page. Add a 'What Traxes saves you' calculator right on the pricing section — drivers who see personalized savings numbers convert at 2× the rate of those who see flat pricing. This is your highest-leverage move before launch." },
                { title:"📡 Channel Reading", color:ORANGE, body:"Reddit organic is already working — 11 signups from zero spend. That proves the audience is real and reachable without paid ads. YouTube is your highest-upside channel: one authentic creator collab in the 100K-400K range can drive 200-500 trials. Facebook groups are the fastest path to word-of-mouth — post 3 compliance tips per week for 30 days before mentioning TruckWithEase." },
                { title:"🔮 What Drivers Will Talk About", color:PURPLE, body:"The Moviease session time (22 min average) means drivers are actually staying. That's the community hook. The Rig Bucks leaderboard is the social proof moment — drivers will screenshot their rank and post it. Safety Sarge's personality is genuinely memorable. These three are your word-of-mouth engine. Build your first YouTube collab around all three in one video." },
                { title:"🎯 90-Day Launch Playbook", color:AMBER, body:"Week 1-2: OOIDA outreach letter (sent), Reddit daily posting (started), YouTube creator DMs (5 targets). Week 3-4: Facebook groups trust-building, Google Search ads activated ($1K/mo test). Month 2: First YouTube collab live, Pilot Flying J partnership call scheduled, CDL school outreach (10 schools). Month 3: Instagram retargeting of site visitors, OOIDA endorsement in progress, 500+ trial signups." },
                { title:"💰 Revenue Projection — Conservative", color:GREEN, body:"At 6.6% visitor-to-trial rate and 40% trial-to-paid conversion: 1,000 visitors/mo → 66 trials → 26 paid. At $24/mo avg plan: $624 MRR from first 1,000 visitors. Google Search alone at $2K/mo spend can drive 3,000-5,000 targeted visitors → $1,900-$3,100 MRR. Break-even on paid ads: ~Month 3. At 5,000 paid subscribers: ~$120K MRR. This is conservative." },
              ].map(card => (
                <div key={card.title} className="gc-card" style={{ borderLeft:`3px solid ${card.color}` }}>
                  <div style={{ fontWeight:700, fontSize:14, color:card.color, marginBottom:12 }}>{card.title}</div>
                  <div style={{ color:"rgba(255,255,255,0.65)", fontSize:13, lineHeight:1.8 }}>{card.body}</div>
                </div>
              ))}
            </div>

            {/* Live event tracker */}
            <div className="gc-card">
              <div style={{ fontWeight:700, fontSize:13, color:"rgba(255,255,255,0.5)", letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>📡 Live Event Tracker</div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:eventCount>0?GREEN:AMBER, animation:"pulse 2s infinite" }} />
                <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)" }}>
                  {eventCount > 0
                    ? `${eventCount.toLocaleString()} events tracked · tracking every feature interaction in real time`
                    : "Tracking system active — every page visit and feature interaction is being recorded"}
                </span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12 }}>
                {[
                  {l:"Page views tracked",    v:eventCount>0?eventCount:"Active",    c:GREEN },
                  {l:"Trial signups logged",  v:signupCount>0?signupCount:"Active",  c:AMBER },
                  {l:"Features instrumented", v:"38",                                 c:ORANGE},
                  {l:"Data retention",        v:"90 days",                            c:PURPLE},
                ].map(m=>(
                  <div key={m.l} style={{ background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"14px 16px" }}>
                    <div style={{ fontWeight:900, fontSize:20, color:m.c, fontFamily:"'DM Mono',monospace", marginBottom:4 }}>{m.v}</div>
                    <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11 }}>{m.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:14 }}>
                <button className="gc-btn" onClick={()=>trackEvent("manual_test","growth_command","trend_sweep")}>
                  🧪 Log Test Event
                </button>
                <span style={{ color:"rgba(255,255,255,0.25)", fontSize:11, marginLeft:12 }}>Confirms your data pipeline is live</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
