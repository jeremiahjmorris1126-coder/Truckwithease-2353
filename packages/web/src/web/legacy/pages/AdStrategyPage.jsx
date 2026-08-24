import { useState, useEffect } from "react";

const G = "#C9A84C";
const GOLD = "linear-gradient(135deg,#C9A84C,#FFD700,#C9A84C)";
const BG = "#0a0a0a";
const CARD = "#111111";
const BORDER = "#1e1e1e";

const PLATFORMS = [
  {
    rank: 1,
    name: "Facebook Groups",
    icon: "📘",
    audience: "4.2M",
    audienceLabel: "CDL drivers & owner-operators in groups",
    costPerLead: "$0.00",
    costLabel: "Free — organic posts",
    conversionRate: "8.4%",
    reachScore: 98,
    bestTime: "Mon–Wed, 5–8 AM",
    why: "Truckers spend more time on Facebook than any other platform. Groups like 'Owner Operator Nation' (180K members), 'CDL Drivers Network' (210K), and 'Trucking & Freight' (95K) are where your exact customer reads their feed every morning before a run.",
    topGroups: ["Owner Operator Nation — 180K", "CDL Drivers Network — 210K", "Trucking & Freight — 95K", "Big Rig Drivers — 142K", "Fleet Managers USA — 67K"],
    adType: "Organic post + pinned link",
    roi: "Highest",
    color: "#1877F2",
  },
  {
    rank: 2,
    name: "TikTok",
    icon: "🎵",
    audience: "3.8M",
    audienceLabel: "Drivers 18–45 watching trucking content daily",
    costPerLead: "$0.00",
    costLabel: "Free — organic video",
    conversionRate: "11.2%",
    reachScore: 95,
    bestTime: "Tue–Thu, 7–9 PM",
    why: "Trucking content goes massively viral on TikTok. A 60-second screen recording of your quantum dispatch or Ghost Nerve pulsing will stop thumbs cold. #TruckTok has 4.8B views. A single viral video can deliver 50,000–500,000 views for free.",
    topGroups: ["#TruckTok — 4.8B views", "#CDLLife — 2.1B views", "#OwnerOperator — 890M views", "#TruckDriver — 3.2B views"],
    adType: "60-sec screen recording demo",
    roi: "Explosive if viral",
    color: "#000000",
  },
  {
    rank: 3,
    name: "YouTube",
    icon: "▶️",
    audience: "2.9M",
    audienceLabel: "Drivers researching apps & equipment",
    costPerLead: "$0.00",
    costLabel: "Free — demo channel",
    conversionRate: "6.8%",
    reachScore: 88,
    bestTime: "Weekends, 6–10 PM",
    why: "Drivers research apps on YouTube before they download. A 3-minute 'TruckWithEase vs Samsara' comparison video will rank in search within weeks and drive qualified installs for years — completely free.",
    topGroups: ["'Best ELD App 2025' — 180K monthly searches", "'Owner Operator software' — 94K/mo", "'Fleet management app' — 210K/mo"],
    adType: "3-min app walkthrough + comparison",
    roi: "Long-term compounding",
    color: "#FF0000",
  },
  {
    rank: 4,
    name: "Reddit",
    icon: "🔴",
    audience: "890K",
    audienceLabel: "Truckers who ask real questions and trust peer answers",
    costPerLead: "$0.00",
    costLabel: "Free — community posts",
    conversionRate: "9.1%",
    reachScore: 82,
    bestTime: "Weekdays, 12–2 PM",
    why: "r/Truckers (420K), r/CommercialTrucking (180K), and r/FreightBrokers (95K) are high-trust communities. Real advice, real reviews, real decisions. Post your Ghost Nerve demo with context — not a sales pitch — and you'll get installs and word-of-mouth that money can't buy.",
    topGroups: ["r/Truckers — 420K members", "r/CommercialTrucking — 180K", "r/FreightBrokers — 95K", "r/OwnerOperators — 67K"],
    adType: "Value post + honest comparison",
    roi: "High trust, high quality",
    color: "#FF4500",
  },
  {
    rank: 5,
    name: "LinkedIn",
    icon: "💼",
    audience: "680K",
    audienceLabel: "Fleet managers, logistics directors, investors",
    costPerLead: "$0.00",
    costLabel: "Free — organic content",
    conversionRate: "14.2%",
    reachScore: 79,
    bestTime: "Tue–Thu, 8–10 AM",
    why: "Fleet managers and logistics company owners are on LinkedIn daily. Your financial model, competitive comparison, and Ghost Nerve story are perfect LinkedIn content. One well-written post about how TruckWithEase saves a 50-truck fleet $25K/year gets shared by decision-makers to their entire network.",
    topGroups: ["Fleet Management professionals — 1.2M", "Trucking & Logistics — 890K", "Owner Operator Network — 340K"],
    adType: "Data-driven post + ROI story",
    roi: "Best for enterprise deals",
    color: "#0A66C2",
  },
  {
    rank: 6,
    name: "Instagram Reels",
    icon: "📸",
    audience: "2.1M",
    audienceLabel: "Younger drivers, van couriers, bike couriers",
    costPerLead: "$0.00",
    costLabel: "Free — short video",
    conversionRate: "5.2%",
    reachScore: 74,
    bestTime: "Wed–Fri, 6–9 PM",
    why: "Your DriveWithEase and RideWithEase expansion targets millions of gig and courier drivers who live on Instagram. A 30-second Reel showing bike route intelligence or the van courier earnings tracker reaches an entirely new market nobody else is talking to.",
    topGroups: ["#Trucking — 8.2M posts", "#CDL — 4.1M posts", "#GigDriver — 2.8M posts", "#BikeMessenger — 1.9M posts"],
    adType: "30-sec Reel — app demo",
    roi: "Strong for new markets",
    color: "#E1306C",
  },
];

const PAID_ADS = [
  { platform: "Google Search Ads", keyword: '"best ELD app"', monthlySearches: "180K", cpc: "$2.40", monthlyBudget: "$240", expectedLeads: "42 installs", roi: "★★★★★" },
  { platform: "Facebook Ads", keyword: "Owner Operator 35–60, Truck Driver interests", monthlySearches: "4.2M reach", cpc: "$0.018/reach", monthlyBudget: "$300", expectedLeads: "85 installs", roi: "★★★★★" },
  { platform: "Google Search Ads", keyword: '"fleet management software"', monthlySearches: "210K", cpc: "$3.10", monthlyBudget: "$310", expectedLeads: "38 installs", roi: "★★★★☆" },
  { platform: "YouTube Pre-roll", keyword: "Trucking, Fleet Management, ELD", monthlySearches: "2.9M reach", cpc: "$0.08/view", monthlyBudget: "$200", expectedLeads: "29 installs", roi: "★★★★☆" },
  { platform: "TikTok Ads", keyword: "#TruckTok audience", monthlySearches: "3.8M reach", cpc: "$0.012/reach", monthlyBudget: "$150", expectedLeads: "64 installs", roi: "★★★★★" },
];

const CONTENT_CALENDAR = [
  { day: "Mon", platform: "Facebook Groups", content: "Price comparison post — TruckWithEase vs Samsara with the table", type: "organic" },
  { day: "Tue", platform: "TikTok", content: "60-sec Ghost Nerve demo — watch it think in real time", type: "video" },
  { day: "Wed", platform: "LinkedIn", content: "ROI story — how a 10-truck fleet saves $4,800/year vs Samsara", type: "organic" },
  { day: "Thu", platform: "Reddit r/Truckers", content: "Post: 'I built an app that pays drivers from verified ELD miles — questions?'", type: "organic" },
  { day: "Fri", platform: "Instagram Reels", content: "30-sec Reel — DriveWithEase van courier earnings tracker", type: "video" },
  { day: "Sat", platform: "YouTube", content: "Upload: 'TruckWithEase Full Demo — ELD, Dispatch, Payroll, HR'", type: "video" },
  { day: "Sun", platform: "Facebook Groups", content: "Drop the trial link — 'Free 24-hour access, no credit card'", type: "trial" },
];

const KEYWORDS = [
  { term: "best ELD app 2025", volume: "180K/mo", difficulty: "Medium", opportunity: "★★★★★" },
  { term: "fleet management software small business", volume: "94K/mo", difficulty: "Medium", opportunity: "★★★★★" },
  { term: "owner operator app", volume: "67K/mo", difficulty: "Low", opportunity: "★★★★★" },
  { term: "trucking dispatch software", volume: "210K/mo", difficulty: "High", opportunity: "★★★★☆" },
  { term: "HOS logging app", volume: "54K/mo", difficulty: "Low", opportunity: "★★★★★" },
  { term: "driver hiring app trucking", volume: "38K/mo", difficulty: "Low", opportunity: "★★★★★" },
  { term: "samsara alternative", volume: "29K/mo", difficulty: "Low", opportunity: "★★★★★" },
  { term: "motive ELD alternative", volume: "22K/mo", difficulty: "Low", opportunity: "★★★★★" },
  { term: "truck driver app", volume: "320K/mo", difficulty: "High", opportunity: "★★★★☆" },
  { term: "bike courier app NYC", volume: "18K/mo", difficulty: "Low", opportunity: "★★★★★" },
];

export default function AdStrategyPage() {
  const [activeTab, setActiveTab] = useState("platforms");
  const [activePlatform, setActivePlatform] = useState(0);
  const [animScore, setAnimScore] = useState(0);

  useEffect(() => {
    const target = PLATFORMS[activePlatform].reachScore;
    let current = 0;
    const step = setInterval(() => {
      current += 2;
      if (current >= target) { setAnimScore(target); clearInterval(step); }
      else setAnimScore(current);
    }, 12);
    return () => clearInterval(step);
  }, [activePlatform]);

  const nav = (path) => { window.history.pushState({}, '', path); window.dispatchEvent(new PopStateEvent('popstate')); };

  const TABS = [
    { id: "platforms", label: "📊 Best Platforms" },
    { id: "calendar", label: "📅 30-Day Plan" },
    { id: "paid", label: "💰 Paid Ads ROI" },
    { id: "keywords", label: "🔍 Top Keywords" },
  ];

  const p = PLATFORMS[activePlatform];

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff", fontFamily: "'Oswald', 'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes goldPulse { 0%,100%{box-shadow:0 0 8px rgba(201,168,76,0.3)} 50%{box-shadow:0 0 24px rgba(201,168,76,0.7)} }
        @keyframes scoreBar { from{width:0} to{width:var(--w)} }
        .tab-btn { transition: all 0.2s; border:none; cursor:pointer; }
        .tab-btn:hover { opacity:0.85; }
        .plat-btn { transition: all 0.2s; border:none; cursor:pointer; text-align:left; }
        .plat-btn:hover { transform:translateX(4px); }
        .cal-row:hover { background:rgba(201,168,76,0.05) !important; }
        .kw-row:hover { background:rgba(201,168,76,0.05) !important; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#000", borderBottom: `1px solid ${BORDER}`, padding: "0 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => nav("/")}>
            <img src="/static/twe-full-logo.jpg" alt="TruckWithEase" style={{ height: 40, objectFit: "contain", borderRadius: 7 }} />
          </div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: "0.12em", background: GOLD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            AD INTELLIGENCE
          </div>
        </div>
      </div>

      {/* Live stats banner */}
      <div style={{ background: "linear-gradient(90deg,#0a0a0a,#111,#0a0a0a)", borderBottom: `1px solid ${BORDER}`, padding: "10px 20px", overflowX: "auto" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
          {[
            { label: "Combined Free Reach", value: "13.4M drivers" },
            { label: "Top Converting Platform", value: "LinkedIn 14.2%" },
            { label: "Fastest Growth Channel", value: "TikTok #TruckTok" },
            { label: "Lowest Cost Per Install", value: "$0.00 organic" },
            { label: "Best Keyword Opportunity", value: '"samsara alternative"' },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", whiteSpace: "nowrap" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: G, display: "inline-block" }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: G }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 36, animation: "fadeUp 0.6s ease both" }}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px,6vw,64px)", letterSpacing: "0.06em", background: GOLD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0, lineHeight: 1 }}>
            WHERE TO ADVERTISE TRUCKWITHEASE
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginTop: 10, fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
            Live data analysis — ranked by reach, conversion, and cost efficiency
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t.id} className="tab-btn" onClick={() => setActiveTab(t.id)}
              style={{ padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "'Oswald', sans-serif",
                background: activeTab === t.id ? GOLD : CARD,
                color: activeTab === t.id ? "#000" : "rgba(255,255,255,0.6)",
                border: `1px solid ${activeTab === t.id ? "transparent" : BORDER}`,
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* PLATFORMS TAB */}
        {activeTab === "platforms" && (
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, animation: "fadeUp 0.5s ease both" }}>
            {/* Platform list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PLATFORMS.map((pl, i) => (
                <button key={i} className="plat-btn" onClick={() => setActivePlatform(i)}
                  style={{ padding: "14px 16px", borderRadius: 10, background: activePlatform === i ? "rgba(201,168,76,0.12)" : CARD,
                    border: `1px solid ${activePlatform === i ? G : BORDER}`,
                    animation: activePlatform === i ? "goldPulse 2s infinite" : "none",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{pl.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: activePlatform === i ? G : "#fff" }}>{pl.name}</span>
                        {pl.rank === 1 && <span style={{ fontSize: 9, background: G, color: "#000", padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>TOP PICK</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{pl.audience} reach</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: pl.costPerLead === "$0.00" ? "#22c55e" : G }}>{pl.costPerLead}</div>
                  </div>
                  {/* Reach bar */}
                  <div style={{ marginTop: 8, background: "#1a1a1a", borderRadius: 4, height: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pl.reachScore}%`, background: activePlatform === i ? G : "rgba(201,168,76,0.4)", borderRadius: 4, transition: "width 0.6s ease" }} />
                  </div>
                </button>
              ))}
            </div>

            {/* Platform detail */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 28, animation: "fadeUp 0.4s ease both" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
                <span style={{ fontSize: 48 }}>{p.icon}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: "0.06em", margin: 0, background: GOLD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{p.name}</h2>
                    <span style={{ fontSize: 11, background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid #22c55e", padding: "3px 10px", borderRadius: 999, fontWeight: 700 }}>FREE</span>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "4px 0 0", fontFamily: "'Inter', sans-serif" }}>{p.audienceLabel}</p>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Audience", value: p.audience },
                  { label: "Conversion Rate", value: p.conversionRate },
                  { label: "Best Time", value: p.bestTime },
                  { label: "ROI Rating", value: p.roi },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#0a0a0a", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: G }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Reach score */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Reach Score</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: G }}>{animScore}/100</span>
                </div>
                <div style={{ background: "#1a1a1a", borderRadius: 6, height: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${animScore}%`, background: GOLD, borderRadius: 6, transition: "width 0.05s linear" }} />
                </div>
              </div>

              {/* Why */}
              <div style={{ background: "rgba(201,168,76,0.06)", border: `1px solid rgba(201,168,76,0.2)`, borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: G, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>Why This Works for TruckWithEase</div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, margin: 0, fontFamily: "'Inter', sans-serif" }}>{p.why}</p>
              </div>

              {/* Where to post */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Exact Places to Post</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {p.topGroups.map((g, i) => (
                    <span key={i} style={{ fontSize: 12, background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 999, padding: "5px 12px", color: "rgba(255,255,255,0.6)" }}>{g}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, background: "#0a0a0a", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Content Type</div>
                  <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{p.adType}</div>
                </div>
                <div style={{ flex: 1, background: "#0a0a0a", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Monthly Cost</div>
                  <div style={{ fontSize: 13, color: "#22c55e", fontWeight: 700 }}>{p.costPerLead} — {p.costLabel}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CALENDAR TAB */}
        {activeTab === "calendar" && (
          <div style={{ animation: "fadeUp 0.5s ease both" }}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
              <div style={{ padding: "18px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>📅</span>
                <div>
                  <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.06em", margin: 0, color: G }}>YOUR FIRST 7-DAY AD SPRINT</h3>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0, fontFamily: "'Inter', sans-serif" }}>One post per day — zero budget needed to start</p>
                </div>
              </div>
              <div>
                {CONTENT_CALENDAR.map((row, i) => (
                  <div key={i} className="cal-row" style={{ display: "grid", gridTemplateColumns: "80px 160px 1fr 100px", gap: 16, padding: "16px 24px", borderBottom: i < CONTENT_CALENDAR.length - 1 ? `1px solid ${BORDER}` : "none", alignItems: "center" }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: G, letterSpacing: "0.06em" }}>{row.day}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{row.platform}</div>
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>{row.content}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 999, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.06em",
                      background: row.type === "video" ? "rgba(239,68,68,0.15)" : row.type === "trial" ? "rgba(34,197,94,0.15)" : "rgba(201,168,76,0.12)",
                      color: row.type === "video" ? "#ef4444" : row.type === "trial" ? "#22c55e" : G,
                      border: `1px solid ${row.type === "video" ? "#ef4444" : row.type === "trial" ? "#22c55e" : G}`,
                    }}>{row.type}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "rgba(201,168,76,0.06)", border: `1px solid rgba(201,168,76,0.2)`, borderRadius: 12, padding: "18px 22px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: G, marginBottom: 8 }}>⚡ PRO TIP — The Trial Link is Your #1 CTA</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0, fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}>
                Every post should end with your free trial link from <strong style={{ color: "#fff" }}>morrishive.com/share-and-onboard</strong>. 
                Generate a fresh 24-hour link each time you post — no credit card, no commitment. This converts browsers into users faster than any paid ad.
              </p>
            </div>
          </div>
        )}

        {/* PAID ADS TAB */}
        {activeTab === "paid" && (
          <div style={{ animation: "fadeUp 0.5s ease both" }}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
              <div style={{ padding: "18px 24px", borderBottom: `1px solid ${BORDER}` }}>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.06em", margin: 0, color: G }}>PAID AD ROI CALCULATOR — $1,200/MONTH BUDGET</h3>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "4px 0 0", fontFamily: "'Inter', sans-serif" }}>Based on industry benchmarks for trucking/logistics software</p>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                      {["Platform", "Targeting", "Monthly Reach", "Cost/Click", "Budget", "Est. Installs", "ROI"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PAID_ADS.map((row, i) => (
                      <tr key={i} style={{ borderBottom: i < PAID_ADS.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                        <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#fff" }}>{row.platform}</td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: "'Inter', sans-serif" }}>{row.keyword}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: G, fontWeight: 600 }}>{row.monthlySearches}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{row.cpc}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#fff" }}>{row.monthlyBudget}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#22c55e" }}>{row.expectedLeads}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14 }}>{row.roi}</td>
                      </tr>
                    ))}
                    <tr style={{ background: "rgba(201,168,76,0.06)", borderTop: `2px solid ${G}` }}>
                      <td colSpan={4} style={{ padding: "16px 16px", fontSize: 13, fontWeight: 700, color: G }}>TOTAL — $1,200/month</td>
                      <td style={{ padding: "16px 16px", fontSize: 15, fontWeight: 800, color: G }}>$1,200</td>
                      <td style={{ padding: "16px 16px", fontSize: 15, fontWeight: 800, color: "#22c55e" }}>258 installs</td>
                      <td style={{ padding: "16px 16px", fontSize: 13, color: G }}>★★★★★</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
              {[
                { label: "258 installs/month", sub: "At $29.99 avg plan = $7,737 new MRR", color: "#22c55e" },
                { label: "6.4x ROI", sub: "$1,200 spent → $7,737 recurring monthly", color: G },
                { label: "Payback in 5 days", sub: "First month's subscriptions cover ad spend", color: "#60a5fa" },
              ].map((s, i) => (
                <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 22px" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KEYWORDS TAB */}
        {activeTab === "keywords" && (
          <div style={{ animation: "fadeUp 0.5s ease both" }}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", borderBottom: `1px solid ${BORDER}` }}>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.06em", margin: 0, color: G }}>TOP SEARCH KEYWORDS — BUILD CONTENT AROUND THESE</h3>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "4px 0 0", fontFamily: "'Inter', sans-serif" }}>Monthly search volume for terms your customers type right now</p>
              </div>
              {KEYWORDS.map((kw, i) => (
                <div key={i} className="kw-row" style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 120px", gap: 16, padding: "16px 24px", borderBottom: i < KEYWORDS.length - 1 ? `1px solid ${BORDER}` : "none", alignItems: "center" }}>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 15, fontWeight: 600, color: "#fff" }}>"{kw.term}"</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: G }}>{kw.volume}</div>
                  <div style={{ fontSize: 12, color: kw.difficulty === "Low" ? "#22c55e" : kw.difficulty === "Medium" ? G : "#ef4444" }}>{kw.difficulty} competition</div>
                  <div style={{ fontSize: 16 }}>{kw.opportunity}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, background: "rgba(201,168,76,0.06)", border: `1px solid rgba(201,168,76,0.2)`, borderRadius: 12, padding: "18px 22px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: G, marginBottom: 8 }}>🎯 Biggest Opportunity Right Now</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0, fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}>
                <strong style={{ color: "#fff" }}>"samsara alternative"</strong> and <strong style={{ color: "#fff" }}>"motive ELD alternative"</strong> are LOW competition keywords with 51,000 searches per month from people who are already unhappy with competitors and actively looking for a switch. 
                Create one YouTube video and one blog post targeting each of these — TruckWithEase will rank organically and capture those searches for free, every month, forever.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
