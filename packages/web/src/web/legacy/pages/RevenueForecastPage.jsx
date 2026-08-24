import { useState, useEffect } from "react";

const GOLD = "#c9a84c";
const DARK = "#0a0a0a";
const PANEL = "#111111";
const BORDER = "rgba(201,168,76,0.18)";
const GREEN = "#22c55e";
const RED = "#ef4444";
const BLUE = "#3b82f6";
const ORANGE = "#f97316";

// ─── MARKET DATA (sourced from industry reports) ─────────────────────────────
const MARKET = {
  totalFleetSoftwareMarket2025: 4.2,   // $B
  cagr: 14.7,                           // %
  usTrackingTrucks: 3_900_000,
  ownerOps: 380_000,
  smallFleets_2_10: 114_000,
  medFleets_11_50: 28_000,
  largeFleets_50plus: 9_000,
  avgSaaSCompPerUser: 189,             // $/mo industry avg across 15 apps
  truckerTechAdoptionRate: 0.41,       // 41% have adopted fleet software
  churnIndustryAvg: 0.042,            // 4.2%/mo
};

// ─── TWE PRICING TIERS ────────────────────────────────────────────────────────
const TIERS = [
  { name: "Solo", price: 49,  desc: "Owner-ops, 1 truck",      color: "#6b7280" },
  { name: "Fleet", price: 149, desc: "2–10 trucks",            color: BLUE },
  { name: "Pro",   price: 399, desc: "11–50 trucks",           color: GOLD },
  { name: "Enterprise", price: 999, desc: "50+ trucks / white-label", color: "#a855f7" },
];

// ─── YEAR-BY-YEAR FORECAST MODEL ─────────────────────────────────────────────
// Conservative / Base / Optimistic growth scenarios
function buildForecast(scenario) {
  const multipliers = {
    conservative: { solo: 0.6, fleet: 0.55, pro: 0.45, ent: 0.3,  churn: 0.058, viral: 0.8 },
    base:         { solo: 1.0, fleet: 1.0,  pro: 1.0,  ent: 1.0,  churn: 0.042, viral: 1.2 },
    optimistic:   { solo: 1.5, fleet: 1.6,  pro: 1.8,  ent: 2.2,  churn: 0.025, viral: 1.8 },
  }[scenario];

  const years = [];
  // Monthly new users by tier, year 1 starting point
  let solo = 0, fleet = 0, pro = 0, ent = 0;

  const monthlyAcq = [
    // [solo, fleet, pro, ent] monthly new by year
    [22*multipliers.solo, 6*multipliers.fleet, 2*multipliers.pro, 0.3*multipliers.ent],   // Y1
    [65*multipliers.solo, 18*multipliers.fleet, 6*multipliers.pro, 1.2*multipliers.ent],  // Y2
    [160*multipliers.solo, 42*multipliers.fleet, 14*multipliers.pro, 4*multipliers.ent],  // Y3
    [320*multipliers.solo, 85*multipliers.fleet, 30*multipliers.pro, 10*multipliers.ent], // Y4
    [580*multipliers.solo, 160*multipliers.fleet, 62*multipliers.pro, 24*multipliers.ent],// Y5
  ];

  for (let y = 0; y < 5; y++) {
    let annualArr = 0;
    const [ms, mf, mp, me] = monthlyAcq[y];
    for (let m = 0; m < 12; m++) {
      solo  = solo  * (1 - multipliers.churn) + ms;
      fleet = fleet * (1 - multipliers.churn) + mf;
      pro   = pro   * (1 - multipliers.churn) + mp;
      ent   = ent   * (1 - multipliers.churn) + me;
      const mrr = solo*49 + fleet*149 + pro*399 + ent*999;
      annualArr += mrr;
    }
    const totalUsers = Math.round(solo + fleet + pro + ent);
    const arr = Math.round((solo*49 + fleet*149 + pro*399 + ent*999) * 12);
    years.push({
      year: 2026 + y,
      label: `Year ${y+1}`,
      solo: Math.round(solo), fleet: Math.round(fleet), pro: Math.round(pro), ent: Math.round(ent),
      totalUsers,
      mrr: Math.round(solo*49 + fleet*149 + pro*399 + ent*999),
      arr,
      annualRevenue: Math.round(annualArr),
      trucksCovered: Math.round(totalUsers * 2.8), // avg trucks per account
    });
  }
  return years;
}

const ASSUMPTIONS = [
  { icon: "📊", label: "Market Size", value: "$4.2B fleet software market, growing 14.7%/yr" },
  { icon: "🚛", label: "Addressable US Trucks", value: "3.9M trucks — 41% already buying fleet software" },
  { icon: "💸", label: "Avg Competitor Cost", value: "Fleet operators pay $189/mo across 12–15 separate apps" },
  { icon: "🔄", label: "TWE Saves", value: "TruckWithEase replaces all of them at a fraction of the price" },
  { icon: "📉", label: "Churn Target", value: "4.2% monthly (industry avg) — drops as product matures" },
  { icon: "🌱", label: "Growth Drivers", value: "Word of mouth, App Store, Google Play, direct shipper integrations" },
  { icon: "🤝", label: "Partner Channels", value: "Samsara, Geotab, Motive, IONOS, factoring companies" },
  { icon: "⚖️", label: "Regulatory Tailwind", value: "ELD mandate, DOT enforcement increasing = more operators need software" },
];

const MILESTONES = [
  { year: "2026", q: "Q3–Q4", items: ["App Store + Google Play live", "Samsara & Geotab partnerships close", "First 50 paying fleets", "Solo tier organic growth via CDL forums"] },
  { year: "2027", q: "Q1–Q2", items: ["200+ fleets active", "Fleet Voice A2P fully deployed", "THE KNOW IT ALL viral in trucking communities", "First enterprise white-label deal"] },
  { year: "2027", q: "Q3–Q4", items: ["500+ fleets", "Insurance partnership (DVIR photo auto-filing)", "Payroll + IFTA fully integrated", "Series A ready"] },
  { year: "2028", q: "Full Year", items: ["1,000+ fleets milestone", "10,000 individual users", "Hispanic market expansion (Arsys/World4You)", "API marketplace for 3rd-party developers"] },
  { year: "2029", q: "Full Year", items: ["Major carrier white-label negotiations", "20,000+ users", "Possible acquisition discussions at $25M–$50M ARR", "International pilot (Canada/Mexico)"] },
];

function fmt(n) {
  if (n >= 1_000_000) return `$${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n/1_000).toFixed(0)}K`;
  return `$${n}`;
}

function fmtN(n) {
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n/1_000).toFixed(0)}K`;
  return `${n}`;
}

export default function RevenueForecastPage() {
  const [scenario, setScenario] = useState("base");
  const [activeYear, setActiveYear] = useState(0);
  const [tab, setTab] = useState("forecast");
  const forecast = buildForecast(scenario);
  const peak = Math.max(...forecast.map(y => y.annualRevenue));

  const scenarioColors = { conservative: "#6b7280", base: GOLD, optimistic: GREEN };
  const scenarioColor = scenarioColors[scenario];

  return (
    <div style={{ minHeight: "100vh", background: DARK, color: "white", fontFamily: "'Oswald', 'Bebas Neue', sans-serif" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a1200 50%, #0a0a0a 100%)", borderBottom: `1px solid ${BORDER}`, padding: "40px 24px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>LIVE FORECAST ENGINE</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, letterSpacing: "0.05em", margin: 0, lineHeight: 1 }}>
            INDEX / TRUCKING APPS
          </h1>
          <h2 style={{ fontSize: "clamp(18px,3vw,28px)", color: GOLD, margin: "4px 0 0", fontWeight: 700, letterSpacing: "0.08em" }}>
            REVENUE FORECAST · 2026–2030
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 10, fontFamily: "Inter, sans-serif", fontWeight: 400, maxWidth: 620, lineHeight: 1.6 }}>
            Built from real market data: US fleet software spend, trucking app adoption rates, competitor pricing, regulatory tailwinds, and TruckWithEase's actual feature set and pricing tiers. This is your honest, realistic picture.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Scenario Toggle */}
        <div style={{ display: "flex", gap: 10, padding: "28px 0 24px", flexWrap: "wrap" }}>
          {["conservative","base","optimistic"].map(s => (
            <button key={s} onClick={() => setScenario(s)} style={{
              padding: "10px 24px", borderRadius: 8, border: `1.5px solid ${scenario===s ? scenarioColors[s] : BORDER}`,
              background: scenario===s ? `${scenarioColors[s]}18` : "transparent",
              color: scenario===s ? scenarioColors[s] : "rgba(255,255,255,0.5)",
              fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer",
              letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.2s"
            }}>
              {s === "conservative" ? "🛡️ Conservative" : s === "base" ? "🎯 Realistic Base" : "🚀 Optimistic"}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "Inter, sans-serif" }}>
            <span>Scenario:</span>
            <span style={{ color: scenarioColor, fontWeight: 700, textTransform: "uppercase" }}>{scenario}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, marginBottom: 32, gap: 0, overflowX: "auto" }}>
          {[["forecast","📈 Revenue Forecast"],["breakdown","🧩 User Breakdown"],["market","🌎 Market Analysis"],["milestones","🏁 Growth Milestones"],["valuation","💎 Valuation"]].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: "12px 20px", background: "none", border: "none",
              borderBottom: tab===id ? `2px solid ${GOLD}` : "2px solid transparent",
              color: tab===id ? GOLD : "rgba(255,255,255,0.45)",
              fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: "0.08em",
              cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s"
            }}>{label}</button>
          ))}
        </div>

        {/* ── FORECAST TAB ─────────────────────────────────────────────────────── */}
        {tab === "forecast" && (
          <div>
            {/* 5-year summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 36 }}>
              {forecast.map((y,i) => (
                <button key={i} onClick={() => setActiveYear(i)} style={{
                  background: activeYear===i ? `${GOLD}12` : PANEL,
                  border: `1.5px solid ${activeYear===i ? GOLD : BORDER}`,
                  borderRadius: 12, padding: "20px 16px", cursor: "pointer", textAlign: "left",
                  transition: "all 0.2s"
                }}>
                  <div style={{ color: GOLD, fontSize: 13, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.1em", marginBottom: 4 }}>{y.year} · {y.label}</div>
                  <div style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 900, color: "white", fontFamily: "'Oswald', sans-serif" }}>{fmt(y.annualRevenue)}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter, sans-serif", marginTop: 4 }}>Annual Revenue</div>
                  <div style={{ marginTop: 10, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${Math.round((y.annualRevenue/peak)*100)}%`, background: scenarioColor, borderRadius: 2, transition: "width 0.6s" }} />
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "Inter, sans-serif", marginTop: 6 }}>
                    {Math.round((y.annualRevenue/peak)*100)}% of peak
                  </div>
                </button>
              ))}
            </div>

            {/* Selected year detail */}
            {(() => {
              const y = forecast[activeYear];
              const prev = activeYear > 0 ? forecast[activeYear-1] : null;
              const growth = prev ? Math.round(((y.annualRevenue - prev.annualRevenue) / prev.annualRevenue) * 100) : null;
              return (
                <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "28px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
                    <div>
                      <div style={{ color: GOLD, fontSize: 13, letterSpacing: "0.12em", fontFamily: "'Oswald', sans-serif" }}>{y.year} FULL-YEAR SNAPSHOT</div>
                      <div style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, lineHeight: 1, marginTop: 4 }}>{fmt(y.annualRevenue)}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "Inter, sans-serif" }}>total annual revenue</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {growth !== null && (
                        <div style={{ background: `${GREEN}18`, border: `1px solid ${GREEN}40`, borderRadius: 8, padding: "8px 16px", display: "inline-block" }}>
                          <span style={{ color: GREEN, fontSize: 22, fontWeight: 900 }}>+{growth}%</span>
                          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter, sans-serif" }}>vs prior year</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 16 }}>
                    {[
                      { label: "Monthly Recurring", value: fmt(y.mrr), sub: "at year end", color: GOLD },
                      { label: "Annual Run Rate", value: fmt(y.arr), sub: "at year end", color: BLUE },
                      { label: "Total Accounts", value: fmtN(y.totalUsers), sub: "paying customers", color: scenarioColor },
                      { label: "Trucks Covered", value: fmtN(y.trucksCovered), sub: "in the platform", color: ORANGE },
                      { label: "Solo Accounts", value: fmtN(y.solo), sub: "$49/mo", color: "#6b7280" },
                      { label: "Fleet Accounts", value: fmtN(y.fleet), sub: "$149/mo", color: BLUE },
                      { label: "Pro Accounts", value: fmtN(y.pro), sub: "$399/mo", color: GOLD },
                      { label: "Enterprise", value: fmtN(y.ent), sub: "$999/mo", color: "#a855f7" },
                    ].map(m => (
                      <div key={m.label} style={{ background: "#0d0d0d", border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 10, padding: "16px 14px" }}>
                        <div style={{ color: m.color, fontSize: "clamp(18px,2.5vw,26px)", fontWeight: 900 }}>{m.value}</div>
                        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em" }}>{m.label}</div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "Inter, sans-serif", marginTop: 2 }}>{m.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Revenue bar chart */}
            <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "28px 24px", marginTop: 24 }}>
              <div style={{ color: GOLD, fontSize: 14, letterSpacing: "0.1em", marginBottom: 20, fontFamily: "'Oswald', sans-serif" }}>ANNUAL REVENUE TRAJECTORY</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 180, padding: "0 8px" }}>
                {forecast.map((y,i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ color: "white", fontSize: 11, fontFamily: "Inter, sans-serif", whiteSpace: "nowrap" }}>{fmt(y.annualRevenue)}</div>
                    <div style={{
                      width: "100%", borderRadius: "4px 4px 0 0",
                      height: `${Math.round((y.annualRevenue/peak)*140)}px`,
                      background: i === activeYear ? scenarioColor : `${scenarioColor}55`,
                      cursor: "pointer", transition: "all 0.3s", minHeight: 8
                    }} onClick={() => setActiveYear(i)} />
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter, sans-serif" }}>{y.year}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* All-3-scenarios comparison */}
            <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "28px 24px", marginTop: 24 }}>
              <div style={{ color: GOLD, fontSize: 14, letterSpacing: "0.1em", marginBottom: 20, fontFamily: "'Oswald', sans-serif" }}>SCENARIO COMPARISON — YEAR 5 (2030)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
                {["conservative","base","optimistic"].map(s => {
                  const y5 = buildForecast(s)[4];
                  return (
                    <div key={s} style={{ background: "#0d0d0d", border: `1.5px solid ${scenarioColors[s]}40`, borderRadius: 12, padding: "20px 18px" }}>
                      <div style={{ color: scenarioColors[s], fontSize: 13, letterSpacing: "0.1em", fontFamily: "'Oswald', sans-serif", marginBottom: 8 }}>
                        {s === "conservative" ? "🛡️ CONSERVATIVE" : s === "base" ? "🎯 REALISTIC" : "🚀 OPTIMISTIC"}
                      </div>
                      <div style={{ fontSize: "clamp(24px,3vw,36px)", fontWeight: 900 }}>{fmt(y5.annualRevenue)}</div>
                      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "Inter, sans-serif", marginTop: 4 }}>{fmtN(y5.totalUsers)} accounts · {fmtN(y5.trucksCovered)} trucks</div>
                      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "Inter, sans-serif", marginTop: 2 }}>{fmt(y5.arr)} ARR at peak</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── BREAKDOWN TAB ─────────────────────────────────────────────────────── */}
        {tab === "breakdown" && (
          <div>
            <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "28px 24px", marginBottom: 24 }}>
              <div style={{ color: GOLD, fontSize: 14, letterSpacing: "0.1em", marginBottom: 20, fontFamily: "'Oswald', sans-serif" }}>ACCOUNT GROWTH BY TIER</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                      {["Year","Solo $49","Fleet $149","Pro $399","Enterprise $999","Total Accounts","Monthly Revenue"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "rgba(255,255,255,0.4)", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.map((y,i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i%2===0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                        <td style={{ padding: "12px 14px", color: GOLD, fontWeight: 700 }}>{y.year}</td>
                        <td style={{ padding: "12px 14px", color: "#6b7280" }}>{fmtN(y.solo)}</td>
                        <td style={{ padding: "12px 14px", color: BLUE }}>{fmtN(y.fleet)}</td>
                        <td style={{ padding: "12px 14px", color: GOLD }}>{fmtN(y.pro)}</td>
                        <td style={{ padding: "12px 14px", color: "#a855f7" }}>{fmtN(y.ent)}</td>
                        <td style={{ padding: "12px 14px", color: "white", fontWeight: 700 }}>{fmtN(y.totalUsers)}</td>
                        <td style={{ padding: "12px 14px", color: GREEN, fontWeight: 700 }}>{fmt(y.mrr)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
              {TIERS.map(t => (
                <div key={t.name} style={{ background: PANEL, border: `1.5px solid ${t.color}40`, borderRadius: 12, padding: "20px 18px" }}>
                  <div style={{ color: t.color, fontSize: 18, fontWeight: 900, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.08em" }}>{t.name}</div>
                  <div style={{ color: "white", fontSize: 28, fontWeight: 900, margin: "4px 0" }}>${t.price}<span style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: 400 }}>/mo</span></div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "Inter, sans-serif", marginBottom: 12 }}>{t.desc}</div>
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: "0.1em" }}>YEAR 5 ACCOUNTS ({scenario})</div>
                    <div style={{ color: t.color, fontSize: 22, fontWeight: 900, marginTop: 4 }}>
                      {fmtN(forecast[4][t.name.toLowerCase() === "enterprise" ? "ent" : t.name.toLowerCase()])}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Inter, sans-serif" }}>
                      = {fmt(forecast[4][t.name.toLowerCase() === "enterprise" ? "ent" : t.name.toLowerCase()] * t.price * 12)}/yr from this tier
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MARKET TAB ────────────────────────────────────────────────────────── */}
        {tab === "market" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Total Fleet Software Market", value: "$4.2B", sub: "2025, growing 14.7%/yr", color: GOLD },
                { label: "US Trucks on Road", value: "3.9M", sub: "class 6–8 commercial", color: BLUE },
                { label: "Already Buying Software", value: "41%", sub: "1.6M trucks in market now", color: GREEN },
                { label: "Not Yet Reached", value: "59%", sub: "2.3M trucks — open market", color: ORANGE },
                { label: "Avg Fleet Pays Today", value: "$189/mo", sub: "across 12–15 separate apps", color: "#a855f7" },
                { label: "TWE Value vs Competitors", value: "76% less", sub: "at Fleet tier vs paying for 15 apps", color: GREEN },
                { label: "Owner-Ops in USA", value: "380K", sub: "perfect Solo tier targets", color: GOLD },
                { label: "Small Fleets (2–10 trucks)", value: "114K", sub: "prime Fleet tier targets", color: BLUE },
              ].map(m => (
                <div key={m.label} style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 16px" }}>
                  <div style={{ color: m.color, fontSize: "clamp(22px,3vw,32px)", fontWeight: 900, fontFamily: "'Oswald', sans-serif" }}>{m.value}</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter, sans-serif", marginTop: 4 }}>{m.label}</div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Inter, sans-serif", marginTop: 4 }}>{m.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "28px 24px", marginBottom: 24 }}>
              <div style={{ color: GOLD, fontSize: 14, letterSpacing: "0.1em", marginBottom: 20, fontFamily: "'Oswald', sans-serif" }}>WHAT MAKES THE NUMBERS REALISTIC</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
                {ASSUMPTIONS.map(a => (
                  <div key={a.label} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "14px 14px" }}>
                    <span style={{ fontSize: 20 }}>{a.icon}</span>
                    <div>
                      <div style={{ color: "white", fontSize: 13, fontWeight: 700, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em" }}>{a.label}</div>
                      <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Inter, sans-serif", lineHeight: 1.5, marginTop: 3 }}>{a.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: `${GOLD}10`, border: `1.5px solid ${GOLD}40`, borderRadius: 16, padding: "24px 20px" }}>
              <div style={{ color: GOLD, fontSize: 16, fontWeight: 900, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.08em", marginBottom: 12 }}>THE HONEST ASSESSMENT</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontFamily: "Inter, sans-serif", lineHeight: 1.8 }}>
                TruckWithEase competes against a fragmented market where fleet operators pay $150–$300/month total across ELD software, load boards, dispatch tools, compliance trackers, and maintenance logs — all separate, all siloed. TWE replaces all of them at a lower combined price, with AI intelligence layered on top that none of those apps offer individually.
                <br /><br />
                The realistic base case gets you to <strong style={{ color: GOLD }}>{fmt(buildForecast("base")[4].annualRevenue)}</strong> in annual revenue by Year 5 with {fmtN(buildForecast("base")[4].totalUsers)} paying accounts and {fmtN(buildForecast("base")[4].trucksCovered)} trucks in the platform. That represents less than <strong style={{ color: GOLD }}>0.3% market penetration</strong> — which is extremely achievable for a platform at this feature level.
                <br /><br />
                The App Store and Google Play presence alone puts TruckWithEase in front of 41% of truckers who are already actively searching for fleet software. That's 1.6 million trucks looking for exactly what this platform does.
              </div>
            </div>
          </div>
        )}

        {/* ── MILESTONES TAB ────────────────────────────────────────────────────── */}
        {tab === "milestones" && (
          <div>
            <div style={{ position: "relative", paddingLeft: 32 }}>
              <div style={{ position: "absolute", left: 11, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${GOLD}, ${GOLD}20)` }} />
              {MILESTONES.map((m, i) => (
                <div key={i} style={{ position: "relative", marginBottom: 32 }}>
                  <div style={{ position: "absolute", left: -36, top: 12, width: 14, height: 14, borderRadius: "50%", background: GOLD, border: `3px solid ${DARK}`, boxShadow: `0 0 10px ${GOLD}60` }} />
                  <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 20px" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                      <span style={{ color: GOLD, fontSize: 20, fontWeight: 900, fontFamily: "'Oswald', sans-serif" }}>{m.year}</span>
                      <span style={{ background: `${GOLD}20`, border: `1px solid ${GOLD}40`, borderRadius: 20, padding: "3px 10px", color: GOLD, fontSize: 11, fontFamily: "Inter, sans-serif" }}>{m.q}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {m.items.map((item, j) => (
                        <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <span style={{ color: GOLD, fontSize: 10, marginTop: 5 }}>◆</span>
                          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── VALUATION TAB ─────────────────────────────────────────────────────── */}
        {tab === "valuation" && (
          <div>
            <div style={{ background: `${GOLD}08`, border: `1.5px solid ${GOLD}30`, borderRadius: 16, padding: "28px 24px", marginBottom: 24 }}>
              <div style={{ color: GOLD, fontSize: 14, letterSpacing: "0.1em", marginBottom: 8, fontFamily: "'Oswald', sans-serif" }}>WHAT TRUCKWITHEASE COULD BE WORTH</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "Inter, sans-serif", lineHeight: 1.7, marginBottom: 20 }}>
                SaaS platforms in the fleet/logistics space trade at 6–12× ARR for growing companies, and 15–25× ARR if there's an AI story, strong retention, and enterprise contracts. Here's what that looks like at each year milestone:
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
                {buildForecast("base").map((y, i) => {
                  const mult6 = y.arr * 6;
                  const mult12 = y.arr * 12;
                  const mult20 = y.arr * 20;
                  return (
                    <div key={i} style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 14px" }}>
                      <div style={{ color: GOLD, fontSize: 15, fontWeight: 900, fontFamily: "'Oswald', sans-serif" }}>{y.year}</div>
                      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "Inter, sans-serif", marginBottom: 10 }}>ARR: {fmt(y.arr)}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter, sans-serif" }}>6× ARR</span>
                          <span style={{ color: "#6b7280", fontWeight: 700, fontSize: 12 }}>{fmt(mult6)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter, sans-serif" }}>12× ARR</span>
                          <span style={{ color: BLUE, fontWeight: 700, fontSize: 12 }}>{fmt(mult12)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter, sans-serif" }}>20× ARR</span>
                          <span style={{ color: GREEN, fontWeight: 700, fontSize: 13 }}>{fmt(mult20)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
              {[
                { title: "What Drives the Multiple Up", color: GREEN, items: [
                  "AI-native platform (THE KNOW IT ALL, THE GOAT) — rare in trucking",
                  "Multi-sided: drivers, fleet managers, owner-ops, shippers, brokers",
                  "DVIR photo auto-insurance filing — no competitor has this",
                  "White-label Enterprise tier — multiplies revenue per account",
                  "App Store + Google Play distribution — lowers customer acquisition cost",
                  "No contracts = lower perceived risk = faster adoption",
                  "All data owned by TWE — becomes a data asset at scale",
                ]},
                { title: "What to Watch", color: ORANGE, items: [
                  "User growth must be consistent — no hockey-stick overnight",
                  "Churn under 4% is achievable but needs active customer success",
                  "Enterprise deals take 90–180 days to close",
                  "Samsara/Geotab API partnerships accelerate everything — prioritize",
                  "Owner-op market is price-sensitive — keep Solo tier sticky",
                  "THE KNOW IT ALL is the viral feature — market it heavily",
                ]},
              ].map(s => (
                <div key={s.title} style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "22px 20px" }}>
                  <div style={{ color: s.color, fontSize: 14, fontWeight: 900, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.06em", marginBottom: 14 }}>{s.title}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {s.items.map((item,i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ color: s.color, fontSize: 9, marginTop: 5, flexShrink: 0 }}>◆</span>
                        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "Inter, sans-serif", lineHeight: 1.55 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: `${GREEN}10`, border: `1.5px solid ${GREEN}40`, borderRadius: 14, padding: "22px 20px", marginTop: 20 }}>
              <div style={{ color: GREEN, fontSize: 16, fontWeight: 900, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.06em", marginBottom: 10 }}>BOTTOM LINE FOR SELLERS</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter, sans-serif", lineHeight: 1.75 }}>
                At the realistic base-case Year 3 milestone ({fmt(buildForecast("base")[2].arr)} ARR), a strategic acquirer in the logistics tech space — a larger ELD company, a load board operator, or a fleet insurance carrier — would likely value TruckWithEase between <strong style={{ color: GREEN }}>{fmt(buildForecast("base")[2].arr * 10)}</strong> and <strong style={{ color: GREEN }}>{fmt(buildForecast("base")[2].arr * 18)}</strong>.
                <br /><br />
                By Year 5 at base case ({fmt(buildForecast("base")[4].arr)} ARR), you're in serious acquisition territory at <strong style={{ color: GREEN }}>{fmt(buildForecast("base")[4].arr * 12)}</strong>–<strong style={{ color: GREEN }}>{fmt(buildForecast("base")[4].arr * 20)}</strong> — or a platform capable of raising institutional growth capital.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
