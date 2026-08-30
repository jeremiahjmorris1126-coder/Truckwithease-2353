import { useState, useEffect, useRef } from "react";

const DARK    = "#080c12";
const NAVY    = "#0b1929";
const NAVY2   = "#0f2236";
const ORANGE  = "#ff6200";
const AMBER   = "#ffb400";
const GREEN   = "#00c851";
const RED     = "#ff3333";
const BLUE    = "#0ea5e9";
const WHITE   = "#f0f4fa";
const MUTED   = "rgba(240,244,250,0.45)";
const BORDER  = "rgba(240,244,250,0.07)";

const COMPETITORS = [
  {
    name: "Samsara",
    category: "ELD · Telematics · AI Safety · Dispatch",
    emoji: "🔵",
    color: "#3b82f6",
    threat: "high",
    pricing: "$27–$33/vehicle/month + $150–$350 hardware",
    about: "The 800-lb gorilla. Best-in-class AI dashcams, enterprise integrations, and polished hardware. Dominates large fleets (100+ trucks). $15B valuation.",
    strengths: ["Industry-leading AI dashcam tech", "Deep enterprise integrations (SAP, Oracle)", "Best hardware reliability", "Real-time driver coaching"],
    weaknesses: ["1–3 year contracts — no flexibility", "Solo & small fleets priced out", "No HR, hiring, or payroll tools", "No driver community", "$150–$350 upfront hardware per truck"],
    edge: "We serve every driver from solo to 500+ trucks — no contracts, no hardware upfront. A 10-truck fleet pays $299/mo total vs $330/mo for ELD alone with Samsara, and they get HR + payroll + dispatch included."
  },
  {
    name: "Motive",
    category: "ELD · GPS · Driver App",
    emoji: "🟠",
    color: "#ea580c",
    threat: "high",
    pricing: "$20–$35/vehicle/month + $99–$250 hardware",
    about: "Formerly KeepTruckin — built on affordable ELD and grew up-market. 175,000+ fleets. Popular with owner-operators and small fleets.",
    strengths: ["Affordable entry, strong brand loyalty", "Clean driver-friendly mobile app", "AI dashcam built in", "Good small fleet features"],
    weaknesses: ["No hiring, HR, or onboarding tools", "No payroll from mileage data", "No driver community or retention", "Still requires hardware purchase", "Customer support widely criticized"],
    edge: "We beat Motive's price at every tier while adding HR, payroll, community, and AI dispatch. Drivers who love Motive's clean app will love ours more — and their fleet manager gets 5x more tools."
  },
  {
    name: "Geotab",
    category: "Telematics · ELD · Fleet Intelligence",
    emoji: "🟢",
    color: "#16a34a",
    threat: "medium",
    pricing: "$23–$50/vehicle/month + $150+ hardware",
    about: "Deep telematics, massive data, open API ecosystem. The choice for enterprise fleets wanting maximum data granularity. Highly customizable, requires technical expertise.",
    strengths: ["Best open API in the industry", "Deepest vehicle data & diagnostics", "Massive integration marketplace", "Strong compliance reporting"],
    weaknesses: ["Complex — requires dedicated IT staff", "Not designed for solo or small fleets", "No useful driver-facing app", "No hiring, HR, payroll, or community"],
    edge: "We integrate Geotab's data via their API — meaning we can offer their data depth AND our usability. Fleets on Geotab hardware can connect to TruckWithEase and get HR, payroll, and AI dispatch on top."
  },
  {
    name: "DAT Freight",
    category: "Load Board · Rate Intelligence",
    emoji: "🔷",
    color: "#6366f1",
    threat: "medium",
    pricing: "$45–$160/month",
    about: "The largest load board in North America. 183 million loads/year. Focused purely on load matching and rate benchmarking — nothing else.",
    strengths: ["Biggest load volume — 183M+ loads/year", "Industry-standard rate benchmarking", "Carrier/broker network depth"],
    weaknesses: ["Load board only — no ELD, dispatch, or HR", "No driver app or HOS compliance", "Expensive for what it is", "Requires 4+ other subscriptions to run a fleet"],
    edge: "Our load board is built right in — fleets stop paying $160/mo to DAT. TruckWithEase replaces DAT + ELD + HR + dispatch + payroll with one subscription."
  },
  {
    name: "J.J. Keller",
    category: "Compliance · ELD · Safety Training",
    emoji: "🔴",
    color: "#dc2626",
    threat: "low",
    pricing: "$25–$55/vehicle/month",
    about: "Compliance-first company. Strong DOT compliance programs, drug & alcohol clearinghouse, and safety training. Trusted by conservative fleets.",
    strengths: ["Deep FMCSA compliance expertise", "Drug & alcohol clearinghouse programs", "Driver training library"],
    weaknesses: ["Outdated, clunky interfaces", "No real-time dispatch or routing", "No community or retention tools", "Expensive for compliance-only value"],
    edge: "Our DOT Compliance Vault matches their depth with modern UX, automated cross-referencing, and per-state rules — at half the price, bundled with everything else."
  },
  {
    name: "Trimble / PeopleNet",
    category: "ELD · Enterprise TMS",
    emoji: "🟣",
    color: "#a855f7",
    threat: "low",
    pricing: "$40–$80/vehicle/month (enterprise only)",
    about: "Enterprise-only TMS. Focused on large carriers (500+ trucks). Complex, expensive, requires full IT implementation teams. 6-month onboarding.",
    strengths: ["Deep TMS for large carriers", "Strong legacy freight system integrations"],
    weaknesses: ["Not accessible to fleets under 200 trucks", "6-month implementation required", "$80/vehicle minimum", "No modern driver app", "Zero community or retention"],
    edge: "We're what Trimble customers wish they had — every capability without the 6-month implementation, IT team requirement, or $80/truck price tag. We'll take their unhappy mid-market customers every time."
  }
];

const WIN_REASONS = [
  { num: "01", icon: "🔗", title: "One App Replaces Five", color: ORANGE,
    desc: "The average fleet pays for ELD software, a load board, HR tools, payroll, and compliance separately — $600–$900/month in subscriptions. TruckWithEase replaces all five.",
    proof: "\"We cancelled three subscriptions the first month.\" — what a 15-truck fleet owner will say." },
  { num: "02", icon: "👩‍💼", title: "We Solve Driver Shortage", color: AMBER,
    desc: "Samsara helps you manage drivers you have. We help you find, screen, hire, onboard, pay, and keep drivers — automatically. The #1 fleet problem is driver retention. We fix it.",
    proof: "Automated background checks + onboarding pipeline + retention scoring + driver rewards. No competitor offers all four." },
  { num: "03", icon: "💰", title: "Payroll Runs Itself", color: GREEN,
    desc: "ELD miles flow directly into payroll. No spreadsheets, no manual timesheets. Driver gets paid based on exactly what the ELD verified. First in the industry to close this loop.",
    proof: "Verified miles → auto-calculated gross → ADP/QuickBooks export → done. Every pay period, automatically." },
  { num: "04", icon: "🚛", title: "Built for EVERY Driver", color: BLUE,
    desc: "Samsara is built for OTR long-haul. We serve Amazon van drivers, local delivery, short-haul, LTL, flatbed, reefer, and owner-operators — all with the correct rules for their actual job.",
    proof: "3.5 million local and van drivers in the US have no good option. We are that option." },
  { num: "05", icon: "⚡", title: "Dispatch That Thinks", color: ORANGE,
    desc: "Our intelligence dispatch calculates 12 variables simultaneously — HOS time, fuel, tolls, live traffic, load weight, driver preference, detention risk — to recommend the optimal move.",
    proof: "One dispatcher using TruckWithEase manages 40 trucks with the efficiency of a 5-person team." },
  { num: "06", icon: "🤝", title: "No Contracts. No Hardware.", color: AMBER,
    desc: "Every competitor requires annual contracts and hardware purchases. We don't. Month-to-month, software only, cancel any time. Fleets sign up at 9pm on a Sunday without a sales call.",
    proof: "Self-serve signup to fully operational in under 10 minutes. No sales team, no implementation fee." },
  { num: "07", icon: "🛡️", title: "Safety That Goes All the Way", color: GREEN,
    desc: "SOS button transmits GPS to local 911, state patrol direct connect for all 50 states, voice-capture accident reporting, and automated insurance alerts.",
    proof: "When a driver is stranded at 2am and TruckWithEase connects them to help — that driver never forgets it." },
  { num: "08", icon: "🏆", title: "Drivers Actually Love It", color: BLUE,
    desc: "Driver Gala community, Rig Bucks rewards, video calls, and peer reviews — TruckWithEase is the first fleet platform drivers open for fun. Happy drivers don't leave.",
    proof: "Driver adoption is the #1 reason fleet software fails. We've built the only platform drivers choose to use." },
];

const FEAT_TABLE = {
  cols: ["Feature", "TruckWithEase", "Samsara", "Motive", "Geotab", "DAT"],
  sections: [
    { label: "ELD & Compliance", rows: [
      ["FMCSA-Certified ELD",           "partner", "✓", "✓", "✓", "—"],
      ["HOS — All Driver Types",         "✓", "✓", "✓", "✓", "—"],
      ["Short-Haul / Local Exempt HOS",  "✓", "partial", "partial", "✓", "—"],
      ["DOT Compliance Vault",           "✓", "partial", "—", "✓", "—"],
      ["Document OCR & Cross-Reference", "✓", "—", "—", "—", "—"],
      ["DVIR Vehicle Inspection",        "✓", "✓", "✓", "✓", "—"],
    ]},
    { label: "Dispatch & Operations", rows: [
      ["Real-Time GPS Tracking",         "✓", "✓", "✓", "✓", "—"],
      ["AI / Dispatch",          "✓", "partial", "—", "—", "—"],
      ["Integrated Load Board",          "✓", "—", "—", "—", "✓"],
      ["Multi-Source Satellite Mapping", "✓", "partial", "partial", "partial", "—"],
      ["Weigh Station Bypass",           "✓", "✓", "✓", "partial", "—"],
      ["Detention Time Tracking",        "✓", "✓", "partial", "—", "—"],
    ]},
    { label: "HR, Hiring & Payroll", rows: [
      ["Driver Job Posting & Ads",       "✓", "—", "—", "—", "—"],
      ["Automated Background Checks",    "✓", "—", "—", "—", "—"],
      ["Driver Onboarding Pipeline",     "✓", "—", "—", "—", "—"],
      ["Driver Retention Scoring",       "✓", "—", "—", "—", "—"],
      ["Miles-to-Payroll Automation",    "✓", "—", "—", "—", "—"],
      ["ADP / QuickBooks Payroll Export","✓", "—", "—", "—", "—"],
    ]},
    { label: "Driver Experience", rows: [
      ["Driver Community Hub",           "✓", "—", "—", "—", "—"],
      ["In-App Video Calls",             "✓", "—", "—", "—", "—"],
      ["Driver Rewards Program",         "✓", "—", "—", "—", "—"],
      ["Walkie Talkie / Push-to-Talk",   "✓", "✓", "partial", "—", "—"],
      ["Accident Reporting + Voice",     "✓", "partial", "—", "—", "—"],
      ["Safety SOS / 911 Integration",   "✓", "—", "—", "—", "—"],
    ]},
    { label: "Pricing & Access", rows: [
      ["Solo Driver Plan",               "$29.99/mo", "—", "$20+hw", "—", "$45+"],
      ["No Hardware Required",           "✓", "—", "—", "—", "✓"],
      ["Month-to-Month",                 "✓", "—", "partial", "—", "✓"],
      ["Local / Van / All Driver Types", "✓", "partial", "partial", "partial", "partial"],
    ]},
  ]
};

function ThreatBadge({ level }) {
  const map = { high: [RED, "HIGH THREAT"], medium: [AMBER, "MED THREAT"], low: [GREEN, "LOW THREAT"] };
  const [color, label] = map[level];
  return (
    <span style={{ background: `${color}18`, border: `1px solid ${color}35`, color, borderRadius: 8,
      padding: "3px 10px", fontSize: 10, fontWeight: 800, letterSpacing: 1, whiteSpace: "nowrap", fontFamily: "monospace" }}>
      {label}
    </span>
  );
}

function CellVal({ val, isTWE }) {
  if (val === "✓") return <span style={{ color: GREEN, fontSize: 18 }}>✓</span>;
  if (val === "—") return <span style={{ color: "rgba(240,244,250,0.15)", fontSize: 16 }}>—</span>;
  if (val === "partial") return <span style={{ color: AMBER, fontSize: 12, fontWeight: 700 }}>~</span>;
  if (val === "partner") return <span style={{ color: BLUE, fontSize: 11, fontWeight: 700 }}>Partner</span>;
  return <span style={{ color: isTWE ? ORANGE : WHITE, fontSize: 12, fontWeight: 700 }}>{val}</span>;
}

export default function CompetitiveIntelligencePage() {
  const [activeComp, setActiveComp] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => { setTimeout(() => setAnimIn(true), 50); }, []);

  return (
    <div style={{ fontFamily: "'Barlow', 'Helvetica Neue', sans-serif", background: DARK, minHeight: "100vh", color: WHITE, overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${ORANGE}40; border-radius: 2px; }
        .comp-card { cursor: pointer; transition: transform 0.2s, border-color 0.2s; }
        .comp-card:hover { transform: translateY(-4px) !important; }
        .win-card { transition: transform 0.2s; }
        .win-card:hover { transform: translateY(-3px); }
        .tab-btn { transition: all 0.15s; cursor: pointer; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      {/* TOP NAV */}
      <div style={{ background: "rgba(8,12,18,0.95)", borderBottom: `1px solid ${BORDER}`, padding: "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/command" style={{ color: MUTED, fontSize: 12, textDecoration: "none" }}>← Command Center</a>
          <span style={{ color: BORDER }}>·</span>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 1 }}>
            TruckWith<span style={{ color: ORANGE }}>Ease</span> Intelligence
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["overview","table","why-us"].map(t => (
            <button key={t} className="tab-btn" onClick={() => setActiveTab(t)}
              style={{ background: activeTab === t ? ORANGE : "transparent", color: activeTab === t ? "white" : MUTED,
                border: `1px solid ${activeTab === t ? ORANGE : BORDER}`, borderRadius: 8,
                padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow', sans-serif",
                textTransform: "capitalize" }}>
              {t === "why-us" ? "Why Us" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* HERO */}
      <div style={{ position: "relative", padding: "80px 24px 60px", textAlign: "center", overflow: "hidden",
        background: `radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,98,0,0.1) 0%, transparent 70%), ${DARK}` }}>
        {/* grid lines */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(255,98,0,0.03) 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(255,98,0,0.03) 80px)`, pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,200,81,0.1)", border: "1px solid rgba(0,200,81,0.3)", borderRadius: 30, padding: "5px 16px", marginBottom: 24 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN, display: "inline-block", animation: "pulse 1.5s infinite" }} />
          <span style={{ color: GREEN, fontSize: 12, fontWeight: 700, letterSpacing: 2, fontFamily: "'Barlow Condensed', sans-serif" }}>COMPETITIVE INTELLIGENCE · AUGUST 2026</span>
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(52px,9vw,110px)", lineHeight: 0.9, letterSpacing: 2, marginBottom: 16, opacity: animIn ? 1 : 0, transform: animIn ? "none" : "translateY(20px)", transition: "all 0.7s ease" }}>
          CAN WE BEAT<br /><span style={{ color: ORANGE }}>SAMSARA?</span>
        </h1>
        <p style={{ color: MUTED, fontSize: "clamp(16px,2vw,20px)", maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.6 }}>
          Honest analysis of every major competitor — what they do well, where they fall short, and exactly why fleets will choose TruckWithEase.
        </p>
        <div style={{ display: "inline-block", background: `linear-gradient(135deg, rgba(255,98,0,0.12), rgba(255,180,0,0.06))`, border: `1px solid rgba(255,98,0,0.25)`, borderRadius: 16, padding: "24px 32px", maxWidth: 660, textAlign: "left" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 3, color: ORANGE, marginBottom: 10 }}>THE SHORT ANSWER</div>
          <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.7 }}>Yes — not by doing what they do <em>cheaper</em>, but by doing things they <strong style={{ color: ORANGE }}>can't do at all</strong>. TruckWithEase is the only platform combining ELD compliance, AI dispatch, HR & hiring, payroll, driver community, and intelligence routing — in a single app a solo driver can afford and a 500-truck fleet can trust.</p>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="fade-up">
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 4, color: ORANGE, marginBottom: 12 }}>WHO WE'RE UP AGAINST</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px,5vw,60px)", marginBottom: 10, letterSpacing: 1 }}>The Competition, Exposed</h2>
            <p style={{ color: MUTED, fontSize: 16, marginBottom: 36, maxWidth: 540 }}>Every platform has its strengths. Here's the honest picture — what they do well, what they don't, and where we take the win.</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
              {COMPETITORS.map(c => (
                <div key={c.name} className="comp-card"
                  onClick={() => setActiveComp(activeComp === c.name ? null : c.name)}
                  style={{ background: NAVY, border: `1px solid ${activeComp === c.name ? c.color + "50" : BORDER}`, borderRadius: 16, overflow: "hidden" }}>
                  {/* header */}
                  <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 46, height: 46, borderRadius: 12, background: `${c.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{c.emoji}</div>
                      <div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800 }}>{c.name}</div>
                        <div style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>{c.category}</div>
                      </div>
                    </div>
                    <ThreatBadge level={c.threat} />
                  </div>
                  <div style={{ padding: "18px 22px" }}>
                    <div style={{ color: AMBER, fontSize: 13, fontWeight: 700, fontFamily: "monospace", marginBottom: 12 }}>{c.pricing}</div>
                    <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{c.about}</p>

                    {activeComp === c.name && (
                      <>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                          <div>
                            <div style={{ color: GREEN, fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif" }}>STRENGTHS</div>
                            <ul style={{ listStyle: "none" }}>
                              {c.strengths.map(s => <li key={s} style={{ fontSize: 12, color: "rgba(240,244,250,0.7)", padding: "3px 0", display: "flex", gap: 6, lineHeight: 1.4 }}><span style={{ color: GREEN, flexShrink: 0 }}>✓</span>{s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <div style={{ color: RED, fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif" }}>WEAKNESSES</div>
                            <ul style={{ listStyle: "none" }}>
                              {c.weaknesses.map(w => <li key={w} style={{ fontSize: 12, color: "rgba(240,244,250,0.7)", padding: "3px 0", display: "flex", gap: 6, lineHeight: 1.4 }}><span style={{ color: RED, flexShrink: 0 }}>✗</span>{w}</li>)}
                            </ul>
                          </div>
                        </div>
                        <div style={{ background: `${ORANGE}0D`, border: `1px solid ${ORANGE}25`, borderRadius: 10, padding: "12px 14px" }}>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: 2, color: ORANGE, marginBottom: 6 }}>OUR EDGE</div>
                          <p style={{ fontSize: 13, color: "rgba(240,244,250,0.8)", lineHeight: 1.5 }}>{c.edge}</p>
                        </div>
                      </>
                    )}

                    <div style={{ marginTop: 14, textAlign: "center", color: MUTED, fontSize: 12 }}>
                      {activeComp === c.name ? "▲ Show less" : "▼ Full analysis"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* gaps section */}
            <div style={{ marginTop: 60 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 4, color: AMBER, marginBottom: 12 }}>FULL TRANSPARENCY</div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px,5vw,56px)", marginBottom: 10, letterSpacing: 1 }}>Where We're Still Growing</h2>
              <p style={{ color: MUTED, fontSize: 16, marginBottom: 28, maxWidth: 500 }}>Honest gaps — what Samsara has today that we're building toward.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
                {[
                  { icon: "📹", title: "AI Dashcam Hardware", desc: "Samsara and Motive have proprietary AI dashcam hardware. Our white-label Geotab partnership will close this gap — dashcam integration is on the 6-month roadmap." },
                  { icon: "🏢", title: "500+ Truck Enterprise TMS", desc: "Very large carriers with complex TMS needs may still need Trimble or Oracle. Our sweet spot today is 1–200 trucks." },
                  { icon: "🤝", title: "Broker / 3PL Integrations", desc: "Deep EDI integrations with large 3PLs and brokers are in progress. The API gateway is ready — partner agreements are the next step." },
                  { icon: "📊", title: "Brand Recognition", desc: "Samsara has a $15B valuation. We win the product comparison every time — the challenge is getting in front of fleet owners. That's marketing, not a product gap." },
                ].map(g => (
                  <div key={g.title} style={{ background: NAVY, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 22px" }}>
                    <div style={{ fontSize: 22, marginBottom: 10 }}>{g.icon}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 17, fontWeight: 800, marginBottom: 8 }}>{g.title}</div>
                    <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{g.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FEATURE TABLE TAB */}
        {activeTab === "table" && (
          <div className="fade-up">
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 4, color: ORANGE, marginBottom: 12 }}>HEAD TO HEAD</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px,5vw,60px)", marginBottom: 10, letterSpacing: 1 }}>Feature by Feature</h2>
            <p style={{ color: MUTED, fontSize: 16, marginBottom: 32, maxWidth: 500 }}>Every platform stacked up — including where we're still building and where we already win outright.</p>
            <div style={{ overflowX: "auto", borderRadius: 16, border: `1px solid ${BORDER}` }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
                <thead>
                  <tr>
                    {FEAT_TABLE.cols.map((col, i) => (
                      <th key={col} style={{ padding: "14px 16px", background: NAVY2, textAlign: i === 0 ? "left" : "center",
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 1,
                        color: i === 1 ? ORANGE : WHITE, borderRight: i === 1 ? `2px solid ${ORANGE}30` : "none", borderLeft: i === 1 ? `2px solid ${ORANGE}30` : "none" }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEAT_TABLE.sections.map(sec => (
                    <>
                      <tr key={sec.label}>
                        <td colSpan={6} style={{ padding: "10px 16px", background: DARK, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 3, color: ORANGE, textTransform: "uppercase" }}>{sec.label}</td>
                      </tr>
                      {sec.rows.map(row => (
                        <tr key={row[0]} style={{ borderTop: `1px solid ${BORDER}` }}>
                          {row.map((cell, ci) => (
                            <td key={ci} style={{ padding: "12px 16px", background: ci === 1 ? `${ORANGE}07` : NAVY, textAlign: ci === 0 ? "left" : "center",
                              fontWeight: ci === 0 ? 600 : 400, fontSize: ci === 0 ? 13 : 14,
                              borderRight: ci === 1 ? `2px solid ${ORANGE}20` : "none", borderLeft: ci === 1 ? `2px solid ${ORANGE}20` : "none" }}>
                              {ci === 0 ? cell : <CellVal val={cell} isTWE={ci === 1} />}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* WHY US TAB */}
        {activeTab === "why-us" && (
          <div className="fade-up">
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: 4, color: ORANGE, marginBottom: 12 }}>THE REAL REASONS</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px,5vw,60px)", marginBottom: 10, letterSpacing: 1 }}>Why Fleets Choose Us</h2>
            <p style={{ color: MUTED, fontSize: 16, marginBottom: 36, maxWidth: 540 }}>Not features. Not price. The real reasons a fleet owner will pick up the phone and say "we're switching."</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20, marginBottom: 60 }}>
              {WIN_REASONS.map(w => (
                <div key={w.num} className="win-card" style={{ background: NAVY, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "28px 24px", position: "relative", overflow: "hidden", borderTop: `3px solid ${w.color}` }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, lineHeight: 1, position: "absolute", top: 20, right: 16, opacity: 0.07, color: w.color }}>{w.num}</div>
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{w.icon}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 21, fontWeight: 800, marginBottom: 10 }}>{w.title}</div>
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginBottom: 14 }}>{w.desc}</p>
                  <div style={{ borderLeft: `3px solid ${w.color}`, paddingLeft: 12, fontSize: 12, color: "rgba(240,244,250,0.65)", fontStyle: "italic", lineHeight: 1.5 }}>{w.proof}</div>
                </div>
              ))}
            </div>

            {/* final verdict */}
            <div style={{ background: `linear-gradient(135deg, rgba(255,98,0,0.08), rgba(255,180,0,0.04))`, border: `1px solid rgba(255,98,0,0.22)`, borderRadius: 20, padding: "48px 40px", textAlign: "center" }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px,6vw,76px)", letterSpacing: 2, marginBottom: 20 }}>
                The Verdict: <span style={{ color: ORANGE }}>Yes, We Win.</span>
              </h2>
              <p style={{ fontSize: 18, color: MUTED, maxWidth: 680, margin: "0 auto 32px", lineHeight: 1.7 }}>
                TruckWithEase doesn't need to beat Samsara at everything. We beat them at what fleet owners actually lose sleep over — finding drivers, keeping drivers, running payroll correctly, and managing the whole business from one place without a $30,000 annual contract.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 36 }}>
                {["✓ Replace 5 subscriptions with 1","✓ Solo driver to 200-truck fleet","✓ Hire, pay, and retain drivers","✓ No contracts, no hardware","✓ The only app drivers love","✓ AI dispatch no one else matches"].map(p => (
                  <span key={p} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, borderRadius: 30, padding: "8px 18px", fontSize: 14, fontWeight: 600 }}>{p}</span>
                ))}
              </div>
              <a href="/signup" style={{ display: "inline-block", background: ORANGE, color: "white", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: 1, padding: "14px 36px", borderRadius: 12, textDecoration: "none" }}>
                Start Free Trial →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
