import { useState, useEffect } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase();

const C = {
  gold: "#D4AF37",
  goldLight: "#F0D060",
  black: "#0a0a0a",
  card: "#111111",
  border: "#222222",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  blue: "#3b82f6",
};

const DRIVERS = [
  { id: "d1", name: "Ray Davis", truck: "TR-4821", miles: 12450, safetyScore: 96, hosCompliance: 99, inspections: 3, violations: 0, dvirs: 28, rigBucks: 2840, trend: "up", avatar: "RD" },
  { id: "d2", name: "Maria Santos", truck: "TR-3390", miles: 9870, safetyScore: 91, hosCompliance: 97, inspections: 2, violations: 0, dvirs: 22, rigBucks: 1950, trend: "up", avatar: "MS" },
  { id: "d3", name: "John Miller", truck: "TR-5512", miles: 11200, safetyScore: 78, hosCompliance: 88, inspections: 4, violations: 1, dvirs: 19, rigBucks: 1200, trend: "down", avatar: "JM" },
  { id: "d4", name: "Tanya Rhodes", truck: "TR-2201", miles: 8900, safetyScore: 94, hosCompliance: 100, inspections: 2, violations: 0, dvirs: 25, rigBucks: 2100, trend: "up", avatar: "TR" },
  { id: "d5", name: "Carlos Vega", truck: "TR-6677", miles: 13100, safetyScore: 88, hosCompliance: 94, inspections: 5, violations: 0, dvirs: 31, rigBucks: 2450, trend: "stable", avatar: "CV" },
];

const CATEGORIES = [
  { key: "safetyScore", label: "Safety Score", max: 100, icon: "🛡️", weight: 35 },
  { key: "hosCompliance", label: "HOS Compliance", max: 100, icon: "⏱️", weight: 30 },
  { key: "dvirs", label: "DVIRs Completed", max: 35, icon: "✅", weight: 20 },
  { key: "inspections", label: "Inspections Passed", max: 6, icon: "🔍", weight: 15 },
];

export default function DriverScorecardPage() {
  const [selected, setSelected] = useState(DRIVERS[0]);
  const [tab, setTab] = useState("overview");
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(iv);
  }, []);

  const overallScore = d => Math.round(
    CATEGORIES.reduce((sum, c) => sum + (Math.min(d[c.key], c.max) / c.max) * c.weight, 0)
  );

  const scoreColor = s => s >= 90 ? C.green : s >= 75 ? C.amber : C.red;
  const trendIcon = t => t === "up" ? "↑" : t === "down" ? "↓" : "→";
  const trendColor = t => t === "up" ? C.green : t === "down" ? C.red : C.amber;

  return (
    <div style={{ minHeight: "100vh", background: C.black, color: "#fff", fontFamily: "'Oswald', sans-serif" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #0a0a0a 0%, #1a1200 100%)`, borderBottom: `2px solid ${C.gold}`, padding: "20px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <img src="/static/twe-full-logo.jpg" alt="TruckWithEase" style={{ height: 48, borderRadius: 8 }} />
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.gold, letterSpacing: 2 }}>DRIVER SCORECARD</div>
          <div style={{ fontSize: 13, color: "#888", letterSpacing: 1 }}>LIVE PERFORMANCE INTELLIGENCE — POWERED BY GHOST NERVE</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, boxShadow: `0 0 12px ${C.green}`, animation: pulse ? "none" : "pulse 2s infinite" }} />
          <span style={{ color: C.green, fontSize: 13 }}>LIVE SCORING</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 0, height: "calc(100vh - 90px)" }}>
        {/* Driver List */}
        <div style={{ borderRight: `1px solid ${C.border}`, overflowY: "auto", padding: 16 }}>
          <div style={{ fontSize: 11, color: "#666", letterSpacing: 2, marginBottom: 12 }}>YOUR DRIVERS</div>
          {DRIVERS.map(d => {
            const score = overallScore(d);
            const isSelected = selected.id === d.id;
            return (
              <div key={d.id} onClick={() => setSelected(d)} style={{ cursor: "pointer", padding: "14px 16px", borderRadius: 10, marginBottom: 8, background: isSelected ? "#1a1200" : "#0f0f0f", border: `1px solid ${isSelected ? C.gold : C.border}`, transition: "all 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, #8B6914)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: "#000", flexShrink: 0 }}>{d.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: isSelected ? C.gold : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{d.truck}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: scoreColor(score) }}>{score}</div>
                    <div style={{ fontSize: 12, color: trendColor(d.trend) }}>{trendIcon(d.trend)}</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: "#222", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${score}%`, background: `linear-gradient(90deg, ${scoreColor(score)}, ${scoreColor(score)}88)`, borderRadius: 2, transition: "width 0.6s" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div style={{ overflowY: "auto", padding: "24px 32px" }}>
          {/* Driver Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, #8B6914)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 28, color: "#000", border: `3px solid ${C.gold}` }}>{selected.avatar}</div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 700, color: C.gold, letterSpacing: 2 }}>{selected.name.toUpperCase()}</div>
              <div style={{ fontSize: 15, color: "#888" }}>Truck {selected.truck} · {selected.miles.toLocaleString()} miles this period</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <span style={{ padding: "3px 10px", borderRadius: 20, background: "#1a1a1a", border: `1px solid ${scoreColor(overallScore(selected))}`, color: scoreColor(overallScore(selected)), fontSize: 12 }}>{overallScore(selected) >= 90 ? "TOP PERFORMER" : overallScore(selected) >= 75 ? "GOOD STANDING" : "NEEDS COACHING"}</span>
                <span style={{ padding: "3px 10px", borderRadius: 20, background: "#1a1a1a", border: `1px solid ${trendColor(selected.trend)}`, color: trendColor(selected.trend), fontSize: 12 }}>TRENDING {selected.trend.toUpperCase()}</span>
              </div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "center" }}>
              <div style={{ fontSize: 72, fontWeight: 900, color: scoreColor(overallScore(selected)), lineHeight: 1 }}>{overallScore(selected)}</div>
              <div style={{ fontSize: 13, color: "#666" }}>OVERALL SCORE</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
            {["overview", "compliance", "earnings", "coaching"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", background: "none", border: "none", borderBottom: tab === t ? `3px solid ${C.gold}` : "3px solid transparent", color: tab === t ? C.gold : "#666", fontSize: 14, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, cursor: "pointer", textTransform: "uppercase", transition: "all 0.2s" }}>{t}</button>
            ))}
          </div>

          {tab === "overview" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Safety Score", value: selected.safetyScore, suffix: "/100", color: scoreColor(selected.safetyScore), icon: "🛡️" },
                  { label: "HOS Compliance", value: selected.hosCompliance, suffix: "%", color: scoreColor(selected.hosCompliance), icon: "⏱️" },
                  { label: "DVIRs", value: selected.dvirs, suffix: " done", color: C.blue, icon: "✅" },
                  { label: "Rig Bucks", value: selected.rigBucks.toLocaleString(), suffix: " pts", color: C.gold, icon: "⭐" },
                ].map((stat, i) => (
                  <div key={i} style={{ padding: 20, borderRadius: 12, background: "#111", border: `1px solid ${C.border}`, textAlign: "center" }}>
                    <div style={{ fontSize: 28 }}>{stat.icon}</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: stat.color, margin: "8px 0" }}>{stat.value}<span style={{ fontSize: 14, color: "#666" }}>{stat.suffix}</span></div>
                    <div style={{ fontSize: 12, color: "#666" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {CATEGORIES.map((cat, i) => {
                  const val = selected[cat.key];
                  const pct = Math.min(val / cat.max, 1) * 100;
                  return (
                    <div key={i} style={{ padding: 20, borderRadius: 12, background: "#111", border: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <span style={{ fontSize: 15, color: "#ccc" }}>{cat.icon} {cat.label}</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: scoreColor(pct) }}>{Math.round(pct)}%</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: "#222" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${scoreColor(pct)}, ${scoreColor(pct)}88)`, borderRadius: 4, transition: "width 0.8s ease" }} />
                      </div>
                      <div style={{ fontSize: 12, color: "#555", marginTop: 8 }}>{cat.weight}% of overall score</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "compliance" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "HOS Violations", value: selected.violations, good: selected.violations === 0, note: selected.violations === 0 ? "Zero violations — excellent record" : "Coaching recommended" },
                { label: "DOT Inspections Passed", value: selected.inspections, good: true, note: "All inspections cleared" },
                { label: "DVIR Completion Rate", value: `${Math.round((selected.dvirs / 31) * 100)}%`, good: selected.dvirs >= 25, note: selected.dvirs >= 25 ? "Consistent daily reporting" : "Missed some DVIRs this period" },
                { label: "HOS Compliance Rate", value: `${selected.hosCompliance}%`, good: selected.hosCompliance >= 95, note: selected.hosCompliance >= 95 ? "Fully compliant" : "Minor compliance gaps detected" },
              ].map((item, i) => (
                <div key={i} style={{ padding: 24, borderRadius: 12, background: "#111", border: `1px solid ${item.good ? C.green + "44" : C.amber + "44"}` }}>
                  <div style={{ fontSize: 13, color: "#666", marginBottom: 8, letterSpacing: 1 }}>{item.label.toUpperCase()}</div>
                  <div style={{ fontSize: 42, fontWeight: 700, color: item.good ? C.green : C.amber }}>{item.value}</div>
                  <div style={{ fontSize: 13, color: item.good ? C.green : C.amber, marginTop: 8 }}>{item.good ? "✓" : "⚠"} {item.note}</div>
                </div>
              ))}
            </div>
          )}

          {tab === "earnings" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "Miles This Period", value: selected.miles.toLocaleString(), icon: "🛣️", color: C.blue },
                  { label: "Est. Gross Pay", value: `$${(selected.miles * 0.58).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, icon: "💵", color: C.green },
                  { label: "Rig Bucks Earned", value: selected.rigBucks.toLocaleString(), icon: "⭐", color: C.gold },
                ].map((item, i) => (
                  <div key={i} style={{ padding: 24, borderRadius: 12, background: "#111", border: `1px solid ${C.border}`, textAlign: "center" }}>
                    <div style={{ fontSize: 32 }}>{item.icon}</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: item.color, margin: "8px 0" }}>{item.value}</div>
                    <div style={{ fontSize: 13, color: "#666" }}>{item.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: 24, borderRadius: 12, background: "#111", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 16, color: C.gold, marginBottom: 16, letterSpacing: 1 }}>PAY BREAKDOWN</div>
                {[
                  { label: "Base Miles Pay", value: `$${(selected.miles * 0.52).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` },
                  { label: "Safety Bonus", value: selected.safetyScore >= 90 ? "+$350" : selected.safetyScore >= 80 ? "+$150" : "$0", color: C.green },
                  { label: "HOS Compliance Bonus", value: selected.hosCompliance >= 95 ? "+$200" : "$0", color: C.green },
                  { label: "Deductions", value: selected.violations > 0 ? `-$${selected.violations * 100}` : "$0", color: selected.violations > 0 ? C.red : "#fff" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ color: "#999" }}>{row.label}</span>
                    <span style={{ color: row.color || "#fff", fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "coaching" && (
            <div>
              <div style={{ padding: 20, borderRadius: 12, background: "#111", border: `1px solid ${C.gold}44`, marginBottom: 16 }}>
                <div style={{ fontSize: 16, color: C.gold, marginBottom: 12 }}>🧠 GHOST NERVE AI COACHING — {selected.name.toUpperCase()}</div>
                {selected.safetyScore >= 90 ? (
                  <div style={{ color: C.green, lineHeight: 1.7 }}>✓ Top performer. No immediate coaching needed.<br />Recommend for mentor program — this driver's habits improve fleet-wide scores when shared.</div>
                ) : selected.safetyScore >= 80 ? (
                  <div style={{ color: C.amber, lineHeight: 1.7 }}>⚠ Good performance with room to improve.<br />Schedule a 15-minute safety review this week. Focus on HOS log accuracy and DVIR consistency.</div>
                ) : (
                  <div style={{ color: C.red, lineHeight: 1.7 }}>🔴 Coaching required immediately.<br />Schedule a mandatory safety meeting within 48 hours. Review violation details, run Game Up training module, and monitor closely for 30 days.</div>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { title: "Assign Training", desc: "Send a Game Up module directly to this driver", btn: "Assign Module →", color: C.blue },
                  { title: "Schedule Meeting", desc: "Book a safety meeting through the Safety Center", btn: "Book Meeting →", color: C.gold },
                  { title: "Add Note", desc: "Log a coaching note to this driver's permanent record", btn: "Add Note →", color: "#888" },
                  { title: "Award Bonus Bucks", desc: "Manually award Rig Bucks for outstanding performance", btn: "Award Bucks →", color: C.green },
                ].map((item, i) => (
                  <div key={i} style={{ padding: 18, borderRadius: 10, background: "#111", border: `1px solid ${C.border}`, cursor: "pointer" }}>
                    <div style={{ fontSize: 15, color: "#fff", fontWeight: 600, marginBottom: 6 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>{item.desc}</div>
                    <div style={{ color: item.color, fontSize: 13 }}>{item.btn}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
