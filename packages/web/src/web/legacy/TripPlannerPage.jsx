import { useState, useRef, useEffect } from "react";

const NAVY   = "#0B2A6B";
const NAVY2  = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER  = "#FFB400";
const GREEN  = "#16A34A";
const RED    = "#DC2626";
const DARK   = "#06090F";

// ─── Pre-built routes ────────────────────────────────────────────────────────
const PRESET_ROUTES = [
  { id: 1, from: "Dallas, TX", to: "Memphis, TN",     miles: 466,  drive: "6h 58m",  fuel: "$142", toll: "$0",   toll2: "$0",  load: "43,200 lbs", type: "Reefer",  rpm: "$3.10" },
  { id: 2, from: "Chicago, IL", to: "Atlanta, GA",    miles: 716,  drive: "10h 22m", fuel: "$218", toll: "$24",  toll2: "$0",  load: "38,000 lbs", type: "Dry Van", rpm: "$2.85" },
  { id: 3, from: "Dallas, TX", to: "Los Angeles, CA", miles: 1435, drive: "20h 10m", fuel: "$436", toll: "$18",  toll2: "$0",  load: "44,000 lbs", type: "Flatbed", rpm: "$2.65" },
  { id: 4, from: "Houston, TX", to: "Denver, CO",     miles: 1012, drive: "14h 20m", fuel: "$308", toll: "$8",   toll2: "$0",  load: "40,000 lbs", type: "Dry Van", rpm: "$2.90" },
  { id: 5, from: "Memphis, TN", to: "Kansas City, MO",miles: 450,  drive: "6h 40m",  fuel: "$136", toll: "$12",  toll2: "$0",  load: "36,500 lbs", type: "Dry Van", rpm: "$2.78" },
];

// Route legs (Dallas → Memphis)
const DEFAULT_LEGS = [
  { leg: 1, from: "Dallas, TX",         to: "Texarkana, TX",      miles: 182, drive: "2h 44m", fuel: "Pilot TT — Exit 220", alert: null },
  { leg: 2, from: "Texarkana, TX",      to: "Little Rock, AR",    miles: 143, drive: "2h 08m", fuel: null,                   alert: "🚦 WB-1 Weigh Station — open" },
  { leg: 3, from: "Little Rock, AR",    to: "Memphis, TN",        miles: 141, drive: "2h 06m", fuel: "Love's — Exit 11",    alert: "⚡ PrePass bypass active" },
];

const FUEL_STOPS = [
  { name: "Pilot Travel Center", city: "Texarkana, TX", exit: "220", price: "$3.12/gal", amenities: ["Showers", "Restaurant", "CAT Scale"], miles: 182 },
  { name: "Love's Travel Stop",  city: "Memphis, TN",   exit: "11",  price: "$3.08/gal", amenities: ["Showers", "Laundry", "Restaurant"],   miles: 466 },
];

const REST_AREAS = [
  { name: "Hope Rest Area",         state: "AR", mile: 220, amenities: ["Parking", "Restrooms"], spaces: "12 truck spaces" },
  { name: "West Memphis Truck Stop",state: "AR", mile: 280, amenities: ["Fuel", "Food", "Scale"], spaces: "Open 24h" },
];

const HOS_PLAN = [
  { phase: "Pre-Trip",    time: "05:00",  duration: "30 min", type: "prep",    icon: "🔍", note: "DVIR + pre-trip inspection" },
  { phase: "Drive Leg 1", time: "05:30",  duration: "2h 44m", type: "drive",   icon: "🚛", note: "Dallas → Texarkana (182 mi)" },
  { phase: "30-min Break",time: "08:14",  duration: "30 min", type: "break",   icon: "☕", note: "FMCSA-required after 8h" },
  { phase: "Drive Leg 2", time: "08:44",  duration: "2h 08m", type: "drive",   icon: "🚛", note: "Texarkana → Little Rock (143 mi)" },
  { phase: "Fuel Stop",   time: "10:52",  duration: "20 min", type: "fuel",    icon: "⛽", note: "Love's, Little Rock — $3.08/gal" },
  { phase: "Drive Leg 3", time: "11:12",  duration: "2h 06m", type: "drive",   icon: "🚛", note: "Little Rock → Memphis (141 mi)" },
  { phase: "Arrival",     time: "13:18",  duration: "—",      type: "arrive",  icon: "📍", note: "Memphis, TN — delivery confirmed" },
];

const STATE_ALERTS = [
  { state: "Texas",    flag: "🟦", alert: "Max 80,000 lbs GVW on I-30. No restrictions today.", ok: true },
  { state: "Arkansas", flag: "🟩", alert: "Spring weight ban lifted June 15. All good.", ok: true },
  { state: "Tennessee",flag: "🟨", alert: "I-40 EB lane restriction near Memphis — right lane closed.", ok: false },
];


const CONSTRUCTION_ZONES = [
  { highway:'I-30 EB', location:'Mile 182-195, Benton, AR', delay:'25-40 min', severity:'HIGH', lanes_open:1, lanes_total:2, speed:45, detour:'US-70 via Benton — adds 8 mi, saves 35 min vs waiting', tip:'🚧 Active 7am-6pm weekdays. Clear by 6:01pm typically.', icon:'🚧' },
  { highway:'I-40 EB', location:'Mile 272, West Memphis, AR', delay:'10-15 min', severity:'MED', lanes_open:2, lanes_total:3, speed:55, detour:null, tip:'Reduced to 2 lanes. Move right early — merge is tight.', icon:'🚧' },
  { highway:'I-55 NB', location:'Exit 12, Memphis, TN', delay:'5-10 min', severity:'LOW', lanes_open:2, lanes_total:3, speed:65, detour:null, tip:'Minor shoulder work. No significant delay expected.', icon:'⚠️' },
];

const ALTERNATE_ROUTES = [
  {
    id:'alt1',
    label:'Avoid I-30 Construction (Recommended)',
    savings:'Saves ~35 min',
    addedMiles:8,
    description:'Exit I-30 at Exit 111 (Benton) → US-70 E → rejoin I-30 at Exit 123. Active construction at mile 182-195 is the worst bottleneck on this corridor today.',
    steps:['Take Exit 111 → US-70 East','Continue 12 miles through Benton','Rejoin I-30 East at Exit 123'],
    color:'#16A34A',
    icon:'🟢',
  },
  {
    id:'alt2', 
    label:'US-67 Alternate Corridor',
    savings:'Saves 22 mi on fuel, adds 8 min',
    addedMiles:-22,
    description:'Bypass congested I-30 entirely via US-67 North from Texarkana. Shorter but slower road — best for lighter loads. Truck-legal, no height restrictions.',
    steps:['From Texarkana, take US-67 North','Continue through Arkadelphia','Merge onto I-30 East near Benton'],
    color:'#F59E0B',
    icon:'🟡',
  },
];

function useInView(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true); }, { threshold: 0.06 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return seen;
}
function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  return (
    <div ref={ref} style={{ opacity: seen ? 1 : 0, transform: seen ? "translateY(0)" : "translateY(16px)", transition: `opacity 0.55s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.55s cubic-bezier(.22,1,.36,1) ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

export default function TripPlannerPage() {
  const [from, setFrom]             = useState("Dallas, TX");
  const [to, setTo]                 = useState("Memphis, TN");
  const [weight, setWeight]         = useState("43200");
  const [mpg, setMpg]               = useState("6.5");
  const [fuelPrice, setFuelPrice]   = useState("3.10");
  const [planned, setPlanned]       = useState(true);
  const [routeChoice, setRoute]     = useState("recommended");
  const [activeTab, setTab]         = useState("legs");
  const [selectedPreset, setPreset] = useState(0);

  const route = PRESET_ROUTES[selectedPreset];
  const fuelCost = ((route.miles / parseFloat(mpg || 6.5)) * parseFloat(fuelPrice || 3.10)).toFixed(0);
  const tollCost = routeChoice === "toll" ? route.toll : "$0";
  const totalCost = (parseFloat(fuelCost) + parseFloat(tollCost.replace("$","") || 0)).toFixed(0);
  const grossPay = (route.miles * parseFloat(route.rpm.replace("$",""))).toFixed(0);
  const netPay = (parseFloat(grossPay) - parseFloat(totalCost)).toFixed(0);

  function planTrip() { setPlanned(true); }

  const typeColors = { prep: NAVY, drive: GREEN, break: AMBER, fuel: ORANGE, arrive: "#8B5CF6" };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#F0F4FA", minHeight: "100vh", color: "#0F172A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #F0F4FA; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 2px; }
        .tp-input { transition: border-color 0.15s; }
        .tp-input:focus { outline: none; border-color: ${NAVY} !important; }
        .tp-tab { transition: all 0.15s; cursor: pointer; border-bottom: 2px solid transparent; }
        .tp-tab.active { border-bottom-color: ${NAVY}; color: ${NAVY} !important; font-weight: 700; }
        .tp-tab:hover:not(.active) { color: ${ORANGE} !important; }
        .tp-preset { transition: all 0.18s; cursor: pointer; }
        .tp-preset:hover { border-color: ${NAVY} !important; background: #EFF6FF !important; }
        .tp-preset.active { border-color: ${NAVY} !important; background: #EFF6FF !important; }
        .tp-route-btn { transition: all 0.18s; cursor: pointer; }
        .tp-route-btn.active { background: ${NAVY} !important; color: white !important; border-color: ${NAVY} !important; }
        .tp-route-btn:hover:not(.active) { border-color: ${NAVY} !important; }
        .tp-leg { transition: background 0.15s; }
        .tp-leg:hover { background: #EFF6FF !important; }
        .tp-fuel-card { transition: transform 0.18s; }
        .tp-fuel-card:hover { transform: translateY(-3px); }
        @keyframes tpDot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .tp-live { animation: tpDot 2s ease-in-out infinite; }
        @keyframes tpSlide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .tp-result { animation: tpSlide 0.4s cubic-bezier(.22,1,.36,1) both; }
        @media (max-width: 900px) {
          .tp-two-col { grid-template-columns: 1fr !important; }
          .tp-three-col { grid-template-columns: 1fr 1fr !important; }
          .tp-nav-links { display: none !important; }
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav style={{ background: NAVY2, borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 5%", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/static/truckwithease-icon.png" alt="" style={{ width: 28, height: 28, borderRadius: 7, objectFit: "cover" }} />
          </a>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)" }} />
          <div style={{ color: "white", fontWeight: 800, fontSize: 14 }}>🗺️ Trip Planner</div>
        </div>
        <div className="tp-nav-links" style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <a href="/command" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>🎯 Command Center</a>
          <a href="/driver?driver=1" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>👤 Driver Profile</a>
          <a href="/#pricing" style={{ background: AMBER, color: DARK, padding: "7px 16px", borderRadius: 7, fontWeight: 800, fontSize: 13, textDecoration: "none" }}>Start Free Trial</a>
          <a href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textDecoration: "none" }}>← Back</a>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 5% 60px" }}>

        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <FadeIn>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 900, color: NAVY, marginBottom: 4 }}>Trip Pre-Planner</h1>
              <p style={{ color: "#64748B", fontSize: 14 }}>Plan your route, calculate real costs, and check HOS compliance before you turn the key.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 20, padding: "6px 14px" }}>
              <div className="tp-live" style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN }} />
              <span style={{ color: GREEN, fontSize: 12, fontWeight: 700 }}>Live DOT + Weather data</span>
            </div>
          </div>
        </FadeIn>

        <div className="tp-two-col" style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>

          {/* ── LEFT: INPUT PANEL ──────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Quick-pick preset routes */}
            <FadeIn>
              <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", padding: "16px" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: NAVY, marginBottom: 12 }}>Quick Routes</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {PRESET_ROUTES.map((r, i) => (
                    <div key={r.id} className={`tp-preset${selectedPreset === i ? " active" : ""}`}
                      onClick={() => { setPreset(i); setFrom(r.from); setTo(r.to); setPlanned(true); }}
                      style={{ border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 12, color: "#0F172A" }}>{r.from.split(",")[0]} → {r.to.split(",")[0]}</div>
                        <div style={{ color: "#94A3B8", fontSize: 10, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{r.miles} mi · {r.drive}</div>
                      </div>
                      <div style={{ color: GREEN, fontWeight: 800, fontSize: 13, fontFamily: "'DM Mono', monospace" }}>{r.rpm}/mi</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Manual entry */}
            <FadeIn delay={40}>
              <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", padding: "16px" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: NAVY, marginBottom: 14 }}>Trip Details</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Origin", value: from, setter: setFrom, placeholder: "City, State" },
                    { label: "Destination", value: to, setter: setTo, placeholder: "City, State" },
                    { label: "Load Weight (lbs)", value: weight, setter: setWeight, placeholder: "80000" },
                    { label: "Truck MPG", value: mpg, setter: setMpg, placeholder: "6.5" },
                    { label: "Diesel Price ($/gal)", value: fuelPrice, setter: setFuelPrice, placeholder: "3.10" },
                  ].map(field => (
                    <div key={field.label}>
                      <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{field.label}</div>
                      <input className="tp-input" value={field.value} onChange={e => field.setter(e.target.value)}
                        placeholder={field.placeholder}
                        style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "'Poppins', sans-serif", color: "#0F172A" }} />
                    </div>
                  ))}
                </div>

                {/* Route choice */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ color: "#64748B", fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Route Preference</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                    {[["recommended","⭐ Best"],["toll","🛣️ Toll"],["tollfree","⚡ Toll-Free"]].map(([val,label]) => (
                      <button key={val} onClick={() => setRoute(val)}
                        className={`tp-route-btn${routeChoice === val ? " active" : ""}`}
                        style={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 4px", fontSize: 11, fontWeight: 600, fontFamily: "'Poppins', sans-serif", color: "#475569" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={planTrip} style={{ width: "100%", marginTop: 14, background: `linear-gradient(135deg, ${NAVY}, ${ORANGE})`, color: "white", border: "none", borderRadius: 10, padding: "13px", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "'Poppins', sans-serif", boxShadow: `0 6px 20px rgba(11,42,107,0.3)` }}>
                  Plan This Trip →
                </button>
              </div>
            </FadeIn>
          </div>

          {/* ── RIGHT: RESULTS ─────────────────────────────────────────────── */}
          {planned && (
            <div className="tp-result" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Summary cards */}
              <FadeIn>
                <div className="tp-three-col" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
                  {[
                    { label: "Total Miles",  value: `${route.miles}`,      sub: "via I-30 E",       color: NAVY,   icon: "🛣️" },
                    { label: "Drive Time",   value: route.drive,            sub: "excl. breaks",     color: ORANGE, icon: "⏱️" },
                    { label: "Fuel Cost",    value: `$${fuelCost}`,        sub: `${mpg} MPG avg`,   color: GREEN,  icon: "⛽" },
                    { label: "Tolls",        value: tollCost,               sub: routeChoice === "tollfree" ? "toll-free route" : "estimated", color: AMBER, icon: "💳" },
                    { label: "Net Pay Est.", value: `$${netPay}`,          sub: `vs $${grossPay} gross`, color: netPay > 0 ? GREEN : RED, icon: "💰" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "white", borderRadius: 12, border: "1px solid #E2E8F0", padding: "14px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                      <div style={{ color: s.color, fontWeight: 900, fontSize: 18, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{s.value}</div>
                      <div style={{ color: "#0F172A", fontWeight: 700, fontSize: 10, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
                      <div style={{ color: "#94A3B8", fontSize: 9, marginTop: 2 }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
              </FadeIn>

              {/* State DOT alerts */}
              <FadeIn delay={30}>
                <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", padding: "16px 18px" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: NAVY, marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
                    <span>🤖 State DOT AI — Route Alerts</span>
                    <span style={{ background: "rgba(22,163,74,0.08)", color: GREEN, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>All 3 states checked</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {STATE_ALERTS.map(s => (
                      <div key={s.state} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 12px", background: s.ok ? "rgba(22,163,74,0.04)" : "rgba(245,158,11,0.06)", borderRadius: 8, border: `1px solid ${s.ok ? "rgba(22,163,74,0.15)" : "rgba(245,158,11,0.2)"}` }}>
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{s.ok ? "✅" : "⚠️"}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12, color: "#0F172A" }}>{s.state}</div>
                          <div style={{ color: "#64748B", fontSize: 12, marginTop: 2 }}>{s.alert}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              {/* Tabs */}
              <FadeIn delay={50}>
                <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
                  <div style={{ display: "flex", borderBottom: "1px solid #F1F5F9" }}>
                    {[["legs","🚛 Drive Legs"],["hos","⏱️ HOS Plan"],["fuel","⛽ Fuel Stops"],["rest","🅿️ Rest Areas"],["map","🗺️ Route Map"],["construction","🚧 Construction"]].map(([id,label]) => (
                      <button key={id} onClick={() => setTab(id)}
                        className={`tp-tab${activeTab === id ? " active" : ""}`}
                        style={{ padding: "12px 16px", background: "none", border: "none", color: activeTab === id ? NAVY : "#94A3B8", fontWeight: activeTab === id ? 700 : 500, fontSize: 12, fontFamily: "'Poppins', sans-serif" }}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Drive Legs */}
                  {activeTab === "legs" && (
                    <div>
                      {DEFAULT_LEGS.map((leg, i) => (
                        <div key={leg.leg} className="tp-leg" style={{ padding: "14px 18px", borderBottom: i < DEFAULT_LEGS.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${NAVY}15`, display: "flex", alignItems: "center", justifyContent: "center", color: NAVY, fontWeight: 900, fontSize: 12, flexShrink: 0 }}>{leg.leg}</div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>{leg.from} → {leg.to}</div>
                                <div style={{ color: "#94A3B8", fontSize: 11, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{leg.miles} mi · {leg.drive}</div>
                                {leg.fuel && <div style={{ color: ORANGE, fontSize: 11, marginTop: 4 }}>⛽ {leg.fuel}</div>}
                                {leg.alert && <div style={{ color: leg.alert.includes("bypass") ? GREEN : AMBER, fontSize: 11, marginTop: 4 }}>{leg.alert}</div>}
                              </div>
                            </div>
                            <div style={{ width: 60, height: 5, background: "#F1F5F9", borderRadius: 3, marginTop: 10, flexShrink: 0 }}>
                              <div style={{ height: "100%", width: `${(leg.miles / route.miles * 100).toFixed(0)}%`, background: `linear-gradient(90deg, ${NAVY}, ${ORANGE})`, borderRadius: 3 }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* HOS Plan */}
                  {activeTab === "hos" && (
                    <div style={{ padding: "16px 18px" }}>
                      <div style={{ marginBottom: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {[["Drive left","9h 00m",GREEN],["Break req.","30 min",AMBER],["ETA","1:18 PM",NAVY]].map(([l,v,c]) => (
                          <div key={l} style={{ background: `${c}10`, border: `1px solid ${c}25`, borderRadius: 8, padding: "6px 12px", textAlign: "center" }}>
                            <div style={{ color: c, fontWeight: 800, fontSize: 14, fontFamily: "'DM Mono', monospace" }}>{v}</div>
                            <div style={{ color: "#94A3B8", fontSize: 10 }}>{l}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {HOS_PLAN.map((phase, i) => (
                          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingBottom: i < HOS_PLAN.length - 1 ? 0 : 0 }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 9, background: `${typeColors[phase.type]}15`, border: `1.5px solid ${typeColors[phase.type]}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{phase.icon}</div>
                              {i < HOS_PLAN.length - 1 && <div style={{ width: 2, height: 20, background: "#E2E8F0", margin: "2px 0" }} />}
                            </div>
                            <div style={{ paddingBottom: 14 }}>
                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <span style={{ fontWeight: 700, fontSize: 12, color: "#0F172A" }}>{phase.phase}</span>
                                <span style={{ color: typeColors[phase.type], fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{phase.time}</span>
                                <span style={{ color: "#94A3B8", fontSize: 10 }}>{phase.duration}</span>
                              </div>
                              <div style={{ color: "#64748B", fontSize: 11, marginTop: 2 }}>{phase.note}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fuel Stops */}
                  {activeTab === "fuel" && (
                    <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                      {FUEL_STOPS.map(stop => (
                        <div key={stop.name} className="tp-fuel-card" style={{ border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>{stop.name}</div>
                              <div style={{ color: "#64748B", fontSize: 11, marginTop: 2 }}>Exit {stop.exit} · {stop.city}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ color: GREEN, fontWeight: 800, fontSize: 15, fontFamily: "'DM Mono', monospace" }}>{stop.price}</div>
                              <div style={{ color: "#94A3B8", fontSize: 10, marginTop: 1 }}>At mile {stop.miles}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {stop.amenities.map(a => (
                              <span key={a} style={{ background: `${NAVY}0F`, color: NAVY, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10 }}>{a}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rest Areas */}
                  {activeTab === "rest" && (
                    <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                      {REST_AREAS.map(rest => (
                        <div key={rest.name} style={{ border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>🅿️ {rest.name}</div>
                              <div style={{ color: "#64748B", fontSize: 11, marginTop: 2 }}>{rest.state} · Mile marker {rest.mile}</div>
                            </div>
                            <span style={{ background: "rgba(22,163,74,0.08)", color: GREEN, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>{rest.spaces}</span>
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            {rest.amenities.map(a => (
                              <span key={a} style={{ background: `${ORANGE}0F`, color: ORANGE, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10 }}>{a}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div style={{ background: "rgba(255,180,0,0.06)", border: "1px solid rgba(255,180,0,0.2)", borderRadius: 10, padding: "12px 14px" }}>
                        <div style={{ color: AMBER, fontWeight: 700, fontSize: 12, marginBottom: 4 }}>💡 AI Parking Tip</div>
                        <div style={{ color: "#64748B", fontSize: 12, lineHeight: 1.6 }}>Based on your HOS plan, your mandatory 10-hour break falls near Memphis. West Memphis Truck Stop at mile 280 is recommended — book a spot via the app before you leave to guarantee parking.</div>
                      </div>
                    </div>
                  )}
                  {activeTab === "map" && (
                    <div style={{ padding: 0, position: "relative" }}>
                      <iframe
                        title="Route Map"
                        width="100%"
                        height="320"
                        style={{ border: 0, display: "block" }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/directions?key=AIzaSyAtgo9lKS-aCevpsgeda7VYgodpYPqbboE&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&mode=driving&avoid=ferries`}
                      />
                      <div style={{ position:"absolute", bottom:8, left:8, background:"rgba(11,42,107,0.85)", borderRadius:8, padding:"5px 10px", display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ width:7, height:7, borderRadius:"50%", background:"#16A34A" }} />
                        <span style={{ color:"white", fontSize:11, fontWeight:700 }}>Google Maps — {from} → {to}</span>
                      </div>
                      {/* Street View — destination preview */}
                      <div style={{ padding:"12px 16px", background:"#0a0a0a", borderTop:"1px solid rgba(201,168,76,0.2)" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                          <span style={{ fontSize:16 }}>📸</span>
                          <span style={{ color:"#c9a84c", fontWeight:700, fontSize:13 }}>Destination Street View — {to}</span>
                        </div>
                        <img
                          src={`https://maps.googleapis.com/maps/api/streetview?size=640x200&location=${encodeURIComponent(to)}&key=AIzaSyAtgo9lKS-aCevpsgeda7VYgodpYPqbboE`}
                          alt={`Street view of ${to}`}
                          style={{ width:"100%", borderRadius:8, border:"1px solid rgba(201,168,76,0.2)", display:"block" }}
                          onError={e => { e.target.style.display='none'; }}
                        />
                        <p style={{ color:"#888", fontSize:11, marginTop:6, marginBottom:0 }}>Know exactly what the delivery location looks like before your driver arrives.</p>
                      </div>
                    </div>
                  )}

                  {/* Construction Tab */}
                  {activeTab === "construction" && (
                    <div style={{ padding:"16px 18px" }}>
                      {/* Alert banner */}
                      <div style={{ background:"rgba(220,38,38,0.06)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:10, padding:"12px 16px", marginBottom:16, display:"flex", gap:10, alignItems:"flex-start" }}>
                        <span style={{ fontSize:20, flexShrink:0 }}>🚧</span>
                        <div>
                          <div style={{ fontWeight:700, fontSize:13, color:"#DC2626", marginBottom:2 }}>3 Construction Zones on Your Route</div>
                          <div style={{ color:"#64748B", fontSize:12 }}>Total potential delay: 40-65 minutes. 1 detour available that saves 35 minutes.</div>
                        </div>
                      </div>

                      {/* Alternate route recommendations */}
                      <div style={{ fontWeight:700, fontSize:12, color:"#64748B", letterSpacing:1.5, textTransform:"uppercase", marginBottom:10 }}>✅ Recommended Alternates</div>
                      {ALTERNATE_ROUTES.map(alt => (
                        <div key={alt.id} style={{ border:`2px solid ${alt.color}30`, background:`${alt.color}06`, borderRadius:12, padding:"14px 16px", marginBottom:12 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                            <div style={{ fontWeight:700, fontSize:13, color:"#0F172A" }}>{alt.icon} {alt.label}</div>
                            <span style={{ background:`${alt.color}15`, color:alt.color, fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:20 }}>{alt.savings}</span>
                          </div>
                          <div style={{ color:"#475569", fontSize:12, lineHeight:1.7, marginBottom:10 }}>{alt.description}</div>
                          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                            {alt.steps.map((s,i) => (
                              <div key={i} style={{ display:"flex", gap:8, alignItems:"center", fontSize:12, color:"#64748B" }}>
                                <span style={{ width:18, height:18, background:`${alt.color}20`, color:alt.color, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, flexShrink:0 }}>{i+1}</span>
                                {s}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Construction zone list */}
                      <div style={{ fontWeight:700, fontSize:12, color:"#64748B", letterSpacing:1.5, textTransform:"uppercase", marginBottom:10, marginTop:16 }}>🚧 Active Construction Zones</div>
                      {CONSTRUCTION_ZONES.map((z,i) => (
                        <div key={i} style={{ border:`1px solid ${z.severity==="HIGH"?"rgba(220,38,38,0.3)":z.severity==="MED"?"rgba(245,158,11,0.3)":"rgba(203,213,225,0.5)"}`, borderRadius:12, padding:"14px 16px", marginBottom:10, borderLeft:`4px solid ${z.severity==="HIGH"?"#DC2626":z.severity==="MED"?"#F59E0B":"#CBD5E1"}` }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                            <div style={{ fontWeight:700, fontSize:13 }}>{z.icon} {z.highway} — {z.location}</div>
                            <span style={{ background:z.severity==="HIGH"?"rgba(220,38,38,0.1)":z.severity==="MED"?"rgba(245,158,11,0.1)":"rgba(203,213,225,0.2)", color:z.severity==="HIGH"?"#DC2626":z.severity==="MED"?"#D97706":"#94A3B8", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10 }}>{z.severity}</span>
                          </div>
                          <div style={{ display:"flex", gap:16, marginBottom:8 }}>
                            <span style={{ fontSize:12, color:"#64748B" }}>⏱️ Delay: <strong>{z.delay}</strong></span>
                            <span style={{ fontSize:12, color:"#64748B" }}>🛣️ {z.lanes_open}/{z.lanes_total} lanes open</span>
                            <span style={{ fontSize:12, color:"#64748B" }}>🚗 {z.speed} MPH</span>
                          </div>
                          <div style={{ fontSize:12, color:"#475569", lineHeight:1.6 }}>{z.tip}</div>
                          {z.detour && (
                            <div style={{ marginTop:8, background:"rgba(22,163,74,0.08)", border:"1px solid rgba(22,163,74,0.2)", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#16A34A", fontWeight:600 }}>
                              🟢 Detour: {z.detour}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FadeIn>

              {/* Profit breakdown */}
              <FadeIn delay={70}>
                <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)`, borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ color: AMBER, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>💰 Load Profit Breakdown</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                    {[
                      { l: "Gross Pay",   v: `$${grossPay}`, c: "white" },
                      { l: "Fuel Cost",   v: `-$${fuelCost}`, c: RED    },
                      { l: "Tolls",       v: `-${tollCost}`, c: tollCost === "$0" ? GREEN : RED },
                      { l: "Net Profit",  v: `$${netPay}`,   c: parseInt(netPay) > 0 ? "#4ADE80" : RED },
                    ].map(item => (
                      <div key={item.l} style={{ textAlign: "center" }}>
                        <div style={{ color: item.c, fontWeight: 900, fontSize: 18, fontFamily: "'DM Mono', monospace" }}>{item.v}</div>
                        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginTop: 3 }}>{item.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(255,255,255,0.06)", borderRadius: 8, color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
                    At {route.rpm}/mi · {route.miles} miles · Breakdown excludes driver pay, insurance, and permits
                  </div>
                </div>
              </FadeIn>
            </div>
          )}
        </div>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <FadeIn delay={100} style={{ marginTop: 28 }}>
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #E2E8F0", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: NAVY, marginBottom: 4 }}>This is your actual Trip Planner — inside TruckWithEase.</div>
              <div style={{ color: "#64748B", fontSize: 13 }}>With your account, it knows your real HOS, your truck's MPG, your fuel card rate, and pre-fills everything automatically.</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <a href="/#pricing" style={{ background: ORANGE, color: "white", padding: "12px 24px", borderRadius: 9, fontWeight: 800, fontSize: 14, textDecoration: "none", boxShadow: `0 4px 16px rgba(255,107,0,0.35)` }}>Start Free Trial</a>
              <a href="/command" style={{ background: "#F1F5F9", color: NAVY, padding: "12px 20px", borderRadius: 9, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Command Center</a>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
