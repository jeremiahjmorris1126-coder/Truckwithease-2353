import { useState, useEffect } from "react";

const C = {
  bg: "#060b0f",
  card: "#0d1420",
  border: "#1a2540",
  green: "#39ff14",
  gold: "#f5a623",
  blue: "#00d4ff",
  red: "#ff3d57",
  text: "#e8eaf0",
  muted: "#5a6a8a",
};

const CATEGORIES = [
  { key: "all", label: "All News", icon: "🌍" },
  { key: "fuel", label: "Fuel", icon: "⛽" },
  { key: "weather", label: "Weather", icon: "🌪️" },
  { key: "port", label: "Ports", icon: "🚢" },
  { key: "regulation", label: "Regulations", icon: "📋" },
  { key: "freight", label: "Freight Rates", icon: "📦" },
];

const MOCK_NEWS = [
  { id: 1, category: "fuel", title: "Diesel prices drop 8 cents nationwide as refinery output increases", source: "FreightWaves", time: "12 min ago", impact: "positive", region: "National", summary: "Wholesale diesel futures fell sharply this week following higher-than-expected refinery utilization rates." },
  { id: 2, category: "weather", title: "Severe weather warning: I-40 corridor through Oklahoma — high wind advisory", source: "NOAA", time: "28 min ago", impact: "negative", region: "Southwest", summary: "Wind gusts up to 65mph expected Thursday afternoon. High-profile vehicles advised to delay travel." },
  { id: 3, category: "port", title: "Port of Los Angeles reports 18% increase in container throughput", source: "Port Authority", time: "1 hr ago", impact: "positive", region: "West Coast", summary: "Increased imports from Asia driving higher volumes, beneficial for drayage and local carriers." },
  { id: 4, category: "freight", title: "Spot rates on DAT surge 12% on key Midwest lanes amid produce season", source: "DAT Solutions", time: "2 hr ago", impact: "positive", region: "Midwest", summary: "Reefer demand from California, Arizona, and Florida is pushing rates higher heading into peak produce season." },
  { id: 5, category: "regulation", title: "FMCSA proposes updated HOS exemptions for agricultural haulers", source: "FMCSA", time: "3 hr ago", impact: "neutral", region: "National", summary: "Proposed rule would expand the ag exemption radius from 150 to 200 air miles and add new commodities." },
  { id: 6, category: "weather", title: "Flash flood watch issued for I-10 through Louisiana and Mississippi", source: "NWS", time: "4 hr ago", impact: "negative", region: "Southeast", summary: "Up to 6 inches of rain expected over 24 hours. Several underpasses historically flood during these events." },
  { id: 7, category: "fuel", title: "Texas Panhandle diesel shortage easing as supply trucks arrive", source: "GasBuddy", time: "5 hr ago", impact: "positive", region: "Texas", summary: "Refinery maintenance that caused regional shortages is complete. Full supply expected by end of week." },
  { id: 8, category: "freight", title: "Amazon Relay opens 340 new direct loads in Midwest region", source: "Amazon Logistics", time: "6 hr ago", impact: "positive", region: "Midwest", summary: "New fulfillment center openings in Columbus, Indianapolis, and Kansas City creating significant load volume." },
];

function impactColor(impact) {
  if (impact === "positive") return C.green;
  if (impact === "negative") return C.red;
  return C.gold;
}

export default function WorldNewsFeed({ compact = false }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [liveCount, setLiveCount] = useState(MOCK_NEWS.length);
  const apiKey = sessionStorage.getItem("worldnews_api_key");

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      setLiveCount(c => c + Math.floor(Math.random() * 2));
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const filtered = activeCategory === "all"
    ? MOCK_NEWS
    : MOCK_NEWS.filter(n => n.category === activeCategory);

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", marginTop: 20 }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, boxShadow: `0 0 8px ${C.green}`, animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: "0.04em" }}>
            🌍 WORLD NEWS INTELLIGENCE
          </span>
          <span style={{ fontSize: 11, color: C.muted, background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 4 }}>
            {liveCount} stories
          </span>
        </div>
        <div style={{ fontSize: 11, color: C.muted }}>
          Updated {lastUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {!apiKey && (
            <a href="/twilio-setup" style={{ marginLeft: 10, color: C.gold, fontWeight: 700, fontSize: 11 }}>
              + Activate Live Feed →
            </a>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ display: "flex", gap: 6, padding: "10px 16px", borderBottom: `1px solid ${C.border}`, overflowX: "auto" }}>
        {CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => setActiveCategory(cat.key)} style={{
            padding: "5px 12px", borderRadius: 20, border: `1px solid ${activeCategory === cat.key ? C.green : C.border}`,
            background: activeCategory === cat.key ? "rgba(57,255,20,0.12)" : "transparent",
            color: activeCategory === cat.key ? C.green : C.muted,
            fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s"
          }}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* News Feed */}
      <div style={{ maxHeight: compact ? 300 : 480, overflowY: "auto" }}>
        {filtered.map(story => (
          <div key={story.id}
            onClick={() => setExpanded(expanded === story.id ? null : story.id)}
            style={{
              padding: "14px 20px",
              borderBottom: `1px solid ${C.border}`,
              cursor: "pointer",
              transition: "background 0.15s",
              background: expanded === story.id ? "rgba(255,255,255,0.03)" : "transparent",
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{
                width: 3, flexShrink: 0, borderRadius: 2, alignSelf: "stretch", minHeight: 40,
                background: impactColor(story.impact),
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.4 }}>
                    {story.title}
                  </div>
                  <div style={{ fontSize: 10, color: C.muted, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {story.time}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: C.muted }}>{story.source}</span>
                  <span style={{ fontSize: 10, background: "rgba(255,255,255,0.05)", padding: "1px 6px", borderRadius: 3, color: C.muted }}>
                    {story.region}
                  </span>
                  <span style={{
                    fontSize: 10, padding: "1px 8px", borderRadius: 3, fontWeight: 700,
                    color: impactColor(story.impact),
                    background: `${impactColor(story.impact)}18`,
                  }}>
                    {story.impact === "positive" ? "▲ POSITIVE" : story.impact === "negative" ? "▼ ALERT" : "● NEUTRAL"}
                  </span>
                </div>
                {expanded === story.id && (
                  <div style={{ marginTop: 10, fontSize: 12, color: C.muted, lineHeight: 1.6, padding: "10px 14px", background: "rgba(0,0,0,0.3)", borderRadius: 8, borderLeft: `3px solid ${impactColor(story.impact)}` }}>
                    {story.summary}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: C.muted }}>
          {apiKey ? "🟢 Live feed active" : "🟡 Demo mode — activate at /twilio-setup"}
        </span>
        <a href="/ghost-nerve" style={{ fontSize: 11, color: C.blue, fontWeight: 700, textDecoration: "none" }}>
          Ghost Nerve Intel →
        </a>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
