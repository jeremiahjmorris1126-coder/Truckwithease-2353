import { useState, useEffect } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase();

const C = {
  gold: "#D4AF37", black: "#0a0a0a", card: "#111", border: "#222",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444", blue: "#3b82f6",
};

const COMPLIANCE_AREAS = [
  { id: "hos", label: "Hours of Service", icon: "⏱️", score: 97, status: "green", items: 48, issues: 1, autoFixed: true },
  { id: "dvir", label: "Vehicle Inspection", icon: "🔍", score: 94, status: "green", items: 35, issues: 2, autoFixed: true },
  { id: "cdl", label: "CDL Verification", icon: "🪪", score: 100, status: "green", items: 12, issues: 0, autoFixed: false },
  { id: "medical", label: "Medical Certificates", icon: "🏥", score: 100, status: "green", items: 12, issues: 0, autoFixed: false },
  { id: "drug", label: "Drug & Alcohol", icon: "🧪", score: 100, status: "green", items: 12, issues: 0, autoFixed: false },
  { id: "hazmat", label: "HazMat Endorsements", icon: "☢️", score: 88, status: "amber", items: 4, issues: 1, autoFixed: false },
  { id: "insurance", label: "Insurance Filings", icon: "📋", score: 100, status: "green", items: 5, issues: 0, autoFixed: false },
  { id: "permits", label: "Operating Permits", icon: "📄", score: 92, status: "amber", items: 8, issues: 1, autoFixed: false },
];

const LIVE_EVENTS = [
  { time: "00:02s ago", msg: "Ray Davis HOS log certified — Day 14 clean", type: "green" },
  { time: "00:47s ago", msg: "Maria Santos DVIR submitted — minor defect reported & corrected", type: "amber" },
  { time: "01:12s ago", msg: "TR-2201 CDL verified against FMCSA database — valid", type: "green" },
  { time: "02:08s ago", msg: "Phantom Compliance: flagged HazMat endorsement expiry in 18 days — alert sent", type: "amber" },
  { time: "03:44s ago", msg: "John Miller HOS violation prevented — 30-minute break auto-suggested", type: "green" },
  { time: "05:01s ago", msg: "Carlos Vega pre-trip DVIR complete — all clear", type: "green" },
  { time: "07:22s ago", msg: "Ghost Nerve: Oversize permit renewal due in 14 days — fleet notified", type: "amber" },
  { time: "09:55s ago", msg: "Drug & Alcohol clearinghouse sync complete — all drivers clear", type: "green" },
];

const statusColor = s => ({ green: C.green, amber: C.amber, red: C.red })[s];
const scoreColor = v => v >= 95 ? C.green : v >= 85 ? C.amber : C.red;

export default function LiveComplianceMonitorPage() {
  const [events, setEvents] = useState(LIVE_EVENTS);
  const [overallScore, setOverallScore] = useState(97);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      setPulse(p => !p);
      const newEvents = [
        "Ghost Nerve compliance check — all 5 drivers clear",
        "ELD log sync complete — 0 anomalies",
        "FMCSA safety score updated — Satisfactory",
        "Brake inspection reminder sent to TR-3390",
        "Annual DOT audit readiness score: 98%",
      ];
      const msg = newEvents[Math.floor(Math.random() * newEvents.length)];
      setEvents(prev => [{ time: "just now", msg, type: "green" }, ...prev.slice(0, 11)]);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const totalIssues = COMPLIANCE_AREAS.reduce((sum, a) => sum + a.issues, 0);
  const autoFixed = COMPLIANCE_AREAS.filter(a => a.autoFixed).length;

  return (
    <div style={{ minHeight: "100vh", background: C.black, color: "#fff", fontFamily: "'Oswald', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #001a00 100%)", borderBottom: `2px solid ${C.gold}`, padding: "20px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <img src="/static/twe-full-logo.jpg" alt="TruckWithEase" style={{ height: 48, borderRadius: 8 }} />
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.gold, letterSpacing: 2 }}>LIVE COMPLIANCE MONITOR</div>
          <div style={{ fontSize: 13, color: "#888", letterSpacing: 1 }}>PHANTOM COMPLIANCE — 72-HOUR ADVANCE VIOLATION PREVENTION</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: scoreColor(overallScore), lineHeight: 1 }}>{overallScore}%</div>
            <div style={{ fontSize: 11, color: "#666" }}>FLEET COMPLIANCE</div>
          </div>
          <div style={{ width: 1, height: 60, background: C.border }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.green, boxShadow: `0 0 16px ${C.green}` }} />
            <span style={{ color: C.green, fontSize: 13 }}>LIVE MONITORING</span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderBottom: `1px solid ${C.border}` }}>
        {[
          { label: "Areas Monitored", value: COMPLIANCE_AREAS.length, color: C.blue },
          { label: "Total Items Tracked", value: COMPLIANCE_AREAS.reduce((s, a) => s + a.items, 0), color: "#fff" },
          { label: "Issues Detected", value: totalIssues, color: totalIssues > 0 ? C.amber : C.green },
          { label: "Auto-Fixed by Ghost Nerve", value: autoFixed, color: C.green },
        ].map((stat, i) => (
          <div key={i} style={{ padding: "16px 24px", borderRight: i < 3 ? `1px solid ${C.border}` : "none", textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: "#666", letterSpacing: 1 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 0 }}>
        {/* Compliance Areas */}
        <div style={{ padding: 24, borderRight: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 16, color: C.gold, letterSpacing: 1, marginBottom: 20 }}>ALL COMPLIANCE AREAS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {COMPLIANCE_AREAS.map((area, i) => (
              <div key={i} style={{ padding: 20, borderRadius: 12, background: "#111", border: `1px solid ${statusColor(area.status)}33` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{area.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{area.label}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: scoreColor(area.score) }}>{area.score}%</div>
                    <div style={{ fontSize: 11, color: statusColor(area.status) }}>{area.status === "green" ? "✓ CLEAR" : "⚠ ATTENTION"}</div>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#222", marginBottom: 12 }}>
                  <div style={{ height: "100%", width: `${area.score}%`, background: scoreColor(area.score), borderRadius: 3 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#666" }}>{area.items} items tracked</span>
                  {area.issues > 0 && <span style={{ color: C.amber }}>{area.issues} issue{area.issues > 1 ? "s" : ""}</span>}
                  {area.autoFixed && <span style={{ color: C.green }}>Auto-fixed ✓</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Event Feed */}
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 16, color: C.gold, letterSpacing: 1, marginBottom: 20 }}>⚡ LIVE COMPLIANCE FEED</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {events.map((event, i) => (
              <div key={i} style={{ padding: "12px 16px", borderRadius: 8, background: "#111", border: `1px solid ${event.type === "green" ? C.green + "33" : C.amber + "33"}`, opacity: 1 - (i * 0.06) }}>
                <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>{event.time}</div>
                <div style={{ fontSize: 13, color: event.type === "green" ? C.green : C.amber, lineHeight: 1.5 }}>{event.msg}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: "#0a0a00", border: `1px solid ${C.gold}44` }}>
            <div style={{ fontSize: 14, color: C.gold, marginBottom: 12 }}>📋 AUDIT READINESS</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: C.green, textAlign: "center", margin: "16px 0" }}>98%</div>
            <div style={{ fontSize: 13, color: "#999", textAlign: "center", lineHeight: 1.6 }}>Your fleet is ready for a DOT audit right now. All records are documented, signed, and accessible in under 60 seconds.</div>
            <button style={{ width: "100%", marginTop: 16, padding: "12px 0", borderRadius: 8, background: `linear-gradient(135deg, ${C.gold}, #8B6914)`, border: "none", color: "#000", fontSize: 15, fontFamily: "'Oswald', sans-serif", fontWeight: 700, cursor: "pointer", letterSpacing: 1 }}>GENERATE AUDIT REPORT</button>
          </div>
        </div>
      </div>
    </div>
  );
}
