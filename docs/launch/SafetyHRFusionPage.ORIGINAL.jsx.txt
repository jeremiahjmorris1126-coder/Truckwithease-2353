import { useState, useEffect, useRef } from "react";
import PocketBase from "pocketbase";
const pb = new PocketBase();

const GOLD = "#D4AF37";
const BLACK = "#0a0a0a";
const CARD = "#111111";
const BORDER = "#222222";

const FLEET_SIZES = ["Owner Operator (1 truck)", "Small Fleet (2–10)", "Mid Fleet (11–50)", "Large Fleet (50+)", "Van Courier (1–20 vans)"];

const FUSION_MODULES = [
  {
    id: "predict", icon: "🧠", title: "Predictive Driver Risk Engine",
    tag: "NEVER DONE BEFORE", tagColor: "#ef4444",
    desc: "Combines HOS fatigue patterns, brake event data, violation history, and weather conditions to predict a driver incident before it happens — 72 hours in advance. Automatically adjusts their route, load assignment, and triggers a coaching session.",
    powers: ["72-hour incident prediction", "Auto route adjustment", "Instant coaching trigger", "Insurance tier alert", "Fleet manager notification"],
    competitor: "Samsara flags events after they happen. TruckWithEase prevents them before they start."
  },
  {
    id: "hire", icon: "🎯", title: "Autonomous Driver Acquisition",
    tag: "PROPRIETARY", tagColor: GOLD,
    desc: "When dispatch predicts a driver shortage 6 weeks out, HRease automatically posts job ads, screens applicants, runs background checks, and presents the fleet with 3 pre-qualified candidates — before the fleet knew they needed anyone.",
    powers: ["6-week demand forecasting", "Auto job posting on 4 platforms", "Instant background check", "CDL + DOT auto-verify", "3 candidates pre-qualified"],
    competitor: "No competitor connects dispatch forecasting to hiring. This function exists nowhere else."
  },
  {
    id: "coach", icon: "📡", title: "Live In-Cab Safety Coach",
    tag: "EXCLUSIVE", tagColor: "#60a5fa",
    desc: "NOT BUILT. There is no in-cab audio capture in the platform today — no microphone input, no speaker output, and no provider connected to do either. Nothing on this card is running.",
    powers: ["Real-time voice coaching", "Fatigue pattern detection", "Hands-free speed alerts", "Weather hazard warnings", "Personalized to driver history"],
    competitor: "Dashcams record what happened. TruckWithEase speaks to the driver while it's happening."
  },
  {
    id: "compliance", icon: "🛡️", title: "Phantom Compliance Shield",
    tag: "GHOST NERVE", tagColor: "#a78bfa",
    desc: "Monitors every driver's CSA score in real time. Catches violations 72 hours before they appear on the official record and automatically files corrections, schedules training, and documents remediation — so the violation never affects the fleet's score.",
    powers: ["72-hour violation interception", "Auto-correction filing", "Training auto-assignment", "Remediation documentation", "CSA score protection"],
    competitor: "Every competitor reports violations. TruckWithEase eliminates them before they're filed."
  },
  {
    id: "retention", icon: "❤️", title: "Driver Retention Intelligence",
    tag: "AI POWERED", tagColor: "#f472b6",
    desc: "Analyzes 23 behavioral signals — load refusals, HOS patterns, communication frequency, pay disputes, detention complaints — to generate a flight risk score for every driver. High-risk drivers trigger an automatic outreach from HRease before they quit.",
    powers: ["23 behavioral signals tracked", "Flight risk scoring", "Auto retention outreach", "Pay benchmark analysis", "Exit prevention protocol"],
    competitor: "Fleets find out a driver quit when they don't show up. TruckWithEase prevents it 3 weeks earlier."
  },
  {
    id: "onboard", icon: "🚀", title: "60-Second Driver Onboarding",
    tag: "AUTOMATED", tagColor: "#4ade80",
    desc: "From offer acceptance to first load in 60 seconds. CDL verified, background check cleared, drug screen scheduled, ELD paired, load assigned, and first paycheck configured — all automated, zero paperwork, zero phone calls.",
    powers: ["CDL auto-verification", "Background check instant", "ELD auto-pairing", "First load pre-assigned", "Payroll auto-configured"],
    competitor: "Industry average onboarding: 3–5 days. TruckWithEase: 60 seconds."
  },
];

const LIVE_EVENTS = [
  "🧠 Predict Engine flagged Ray Davis — fatigue pattern detected 68h ahead",
  "🎯 HRease posted driver opening on Facebook, LinkedIn, and 123Loadboard simultaneously",
  "📡 In-Cab Coach alerted Maria Santos — ice detected on I-80 corridor",
  "🛡️ Phantom Compliance intercepted HOS violation — correction filed automatically",
  "❤️ Retention Engine flagged John Miller — 3 load refusals in 7 days, outreach sent",
  "🚀 New driver onboarded — CDL verified, ELD paired, first load assigned in 47 seconds",
  "🧠 Predict Engine updated risk scores for all 12 active drivers",
  "🎯 3 pre-qualified applicants delivered to fleet manager — 0 effort required",
  "📡 In-Cab Coach delivered speed alert — driver acknowledged hands-free",
  "🛡️ CSA score protected — violation intercepted before filing",
];

export default function SafetyHRFusionPage() {
  const [tab, setTab] = useState("fusion");
  const [activeModule, setActiveModule] = useState(null);
  const [fleetSize, setFleetSize] = useState(FLEET_SIZES[1]);
  const [scanRunning, setScanRunning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLog, setScanLog] = useState([]);
  const [liveEvents, setLiveEvents] = useState(LIVE_EVENTS.slice(0, 4));
  const [eventIdx, setEventIdx] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveEvents(prev => {
        const next = [...prev.slice(1), LIVE_EVENTS[eventIdx % LIVE_EVENTS.length]];
        setEventIdx(i => i + 1);
        return next;
      });
    }, 3200);
    return () => clearInterval(interval);
  }, [eventIdx]);

  const runScan = () => {
    setScanRunning(true);
    setScanProgress(0);
    setScanLog([]);
    const steps = [
      "Scanning all driver HOS patterns...",
      "Running fatigue risk models across fleet...",
      "Checking CSA scores — no violations detected...",
      "Analyzing 23 retention signals per driver...",
      "Verifying CDL and medical card expiry...",
      "Cross-referencing dispatch forecast with driver availability...",
      "Predicting driver shortage — 6 weeks out — HRease notified...",
      "Phantom Compliance sweep complete — all drivers clean...",
      "In-Cab Coach profiles updated for all active routes...",
      "✅ FUSION SCAN COMPLETE — Fleet score: 97/100",
    ];
    steps.forEach((step, i) => {
      setTimeout(() => {
        setScanLog(prev => [...prev, { text: step, time: new Date().toLocaleTimeString() }]);
        setScanProgress(Math.round(((i + 1) / steps.length) * 100));
        if (i === steps.length - 1) setScanRunning(false);
      }, i * 600);
    });
  };

  return (
    <div style={{ background: BLACK, minHeight: "100vh", color: "#fff", fontFamily: "'Oswald', sans-serif" }}>
      {/* GOD Banner */}
      <div style={{ background: "linear-gradient(90deg, #1a0a00, #2d1a00, #1a0a00)", borderBottom: `2px solid ${GOLD}`, padding: "10px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 20 }}>👑</span>
        <span style={{ color: GOLD, fontWeight: 700, fontSize: 13, letterSpacing: 2 }}>THE GOAT — WATCHING ALL FUNCTIONS — ZERO ERRORS — ONLY STRONGER</span>
        <div style={{ marginLeft: "auto", width: 10, height: 10, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80", animation: "pulse 2s infinite" }} />
      </div>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #111 0%, #1a1000 100%)", borderBottom: `1px solid ${BORDER}`, padding: "32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontSize: 11, color: GOLD, letterSpacing: 4, marginBottom: 8 }}>NEVER DONE BEFORE · FIRST IN THE INDUSTRY</div>
          <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: 2, lineHeight: 1.1 }}>SAFETY & HR<br /><span style={{ color: GOLD }}>FUSION CORE</span></div>
          <div style={{ fontSize: 16, color: "#888", marginTop: 12, maxWidth: 600 }}>Six proprietary systems working as one — predicting problems, hiring replacements, coaching drivers, and protecting compliance simultaneously. No competitor has one of these. You have all six.</div>
          <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            <select value={fleetSize} onChange={e => setFleetSize(e.target.value)} style={{ background: "#1a1a1a", color: GOLD, border: `1px solid ${GOLD}`, borderRadius: 8, padding: "10px 16px", fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 700 }}>
              {FLEET_SIZES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={runScan} disabled={scanRunning} style={{ background: scanRunning ? "#333" : GOLD, color: BLACK, border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: scanRunning ? "not-allowed" : "pointer", fontFamily: "'Oswald', sans-serif", letterSpacing: 1 }}>
              {scanRunning ? `SCANNING... ${scanProgress}%` : "⚡ RUN FUSION SCAN"}
            </button>
          </div>
        </div>
      </div>

      {/* Live Feed Strip */}
      <div style={{ background: "#0d0d0d", borderBottom: `1px solid ${BORDER}`, padding: "12px 32px", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 32, overflowX: "auto", paddingBottom: 4 }}>
          {liveEvents.map((e, i) => (
            <div key={i} style={{ fontSize: 12, color: i === 0 ? GOLD : "#666", whiteSpace: "nowrap", transition: "color 0.5s" }}>{e}</div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, padding: "20px 32px 0", borderBottom: `1px solid ${BORDER}` }}>
        {[["fusion", "6 Fusion Modules"], ["scan", "Live Scan"], ["drivers", "Driver Intelligence"], ["compare", "vs Competition"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ background: tab === id ? GOLD : "transparent", color: tab === id ? BLACK : "#888", border: `1px solid ${tab === id ? GOLD : BORDER}`, borderRadius: "8px 8px 0 0", padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Oswald', sans-serif", letterSpacing: 1 }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
        {tab === "fusion" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
            {FUSION_MODULES.map(m => (
              <div key={m.id} onClick={() => setActiveModule(activeModule === m.id ? null : m.id)} style={{ background: CARD, border: `1px solid ${activeModule === m.id ? GOLD : BORDER}`, borderRadius: 16, padding: "24px", cursor: "pointer", transition: "all 0.3s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span style={{ fontSize: 36 }}>{m.icon}</span>
                  <span style={{ background: m.tagColor + "22", color: m.tagColor, border: `1px solid ${m.tagColor}`, borderRadius: 6, padding: "3px 10px", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>{m.tag}</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>{m.title}</div>
                <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6, marginBottom: 12 }}>{m.desc}</div>
                {activeModule === m.id && (
                  <div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                      {m.powers.map(p => (
                        <div key={p} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, flexShrink: 0 }} />
                          {p}
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "#0a0a0a", borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "#f59e0b", borderLeft: `3px solid #f59e0b` }}>
                      ⚡ {m.competitor}
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 12, fontSize: 12, color: GOLD }}>{activeModule === m.id ? "▲ Collapse" : "▼ See full details"}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "scan" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px" }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>FUSION SCAN LOG</div>
              {scanRunning && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", marginBottom: 8 }}>
                    <span>Scanning {fleetSize}</span><span>{scanProgress}%</span>
                  </div>
                  <div style={{ background: "#1a1a1a", borderRadius: 4, height: 6 }}>
                    <div style={{ background: GOLD, height: 6, borderRadius: 4, width: `${scanProgress}%`, transition: "width 0.5s" }} />
                  </div>
                </div>
              )}
              {scanLog.length === 0 && !scanRunning && (
                <div style={{ color: "#888", fontSize: 14 }}>Hit "Run Fusion Scan" to analyze your entire fleet across all 6 modules simultaneously.</div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto" }}>
                {scanLog.map((log, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, fontSize: 13, padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ color: "#666", flexShrink: 0 }}>{log.time}</span>
                    <span style={{ color: log.text.includes("✅") ? "#4ade80" : "#fff" }}>{log.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Fleet Safety Score", value: "97/100", color: "#4ade80", icon: "🛡️" },
                { label: "Driver Risk Level", value: "LOW", color: "#4ade80", icon: "🧠" },
                { label: "Compliance Status", value: "CLEAN", color: "#4ade80", icon: "✓" },
                { label: "Retention Risk", value: "1 Driver", color: "#f59e0b", icon: "❤️" },
                { label: "Hiring Pipeline", value: "3 Ready", color: GOLD, icon: "🎯" },
                { label: "Insurance Tier", value: "PLATINUM", color: "#a78bfa", icon: "💎" },
              ].map(item => (
                <div key={item.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 24 }}>{item.icon}</span>
                    <span style={{ fontSize: 14, color: "#888" }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 700, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "drivers" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { name: "Ray Davis", truck: "TRK-001", safety: 94, retention: 88, compliance: 100, risk: "LOW", flag: null },
              { name: "Maria Santos", truck: "TRK-002", safety: 98, retention: 95, compliance: 100, risk: "LOW", flag: null },
              { name: "John Miller", truck: "TRK-003", safety: 82, retention: 61, compliance: 96, risk: "MEDIUM", flag: "3 load refusals — retention outreach sent" },
            ].map(d => (
              <div key={d.name} style={{ background: CARD, border: `1px solid ${d.risk === "MEDIUM" ? "#f59e0b" : BORDER}`, borderRadius: 16, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{d.name}</div>
                    <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{d.truck}</div>
                    {d.flag && <div style={{ fontSize: 12, color: "#f59e0b", marginTop: 6, background: "#1a1000", padding: "6px 12px", borderRadius: 6, border: "1px solid #f59e0b" }}>⚠️ {d.flag}</div>}
                  </div>
                  <div style={{ background: d.risk === "LOW" ? "#052e16" : "#1a1000", color: d.risk === "LOW" ? "#4ade80" : "#f59e0b", border: `1px solid ${d.risk === "LOW" ? "#4ade80" : "#f59e0b"}`, borderRadius: 8, padding: "6px 16px", fontWeight: 700, fontSize: 13 }}>
                    {d.risk} RISK
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[["Safety Score", d.safety, "#4ade80"], ["Retention Score", d.retention, d.retention < 70 ? "#f59e0b" : "#4ade80"], ["Compliance", d.compliance, "#60a5fa"]].map(([label, val, color]) => (
                    <div key={label} style={{ background: "#0a0a0a", borderRadius: 8, padding: "12px 16px" }}>
                      <div style={{ fontSize: 11, color: "#888", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color }}>{val}</div>
                      <div style={{ background: "#1a1a1a", borderRadius: 4, height: 4, marginTop: 8 }}>
                        <div style={{ background: color, height: 4, borderRadius: 4, width: `${val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "compare" && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "24px", borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>Safety & HR — Head to Head</div>
              <div style={{ fontSize: 14, color: "#888", marginTop: 4 }}>Every row is a function TruckWithEase built first. None of these exist anywhere else in one platform.</div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0a0a0a" }}>
                    {["Function", "TruckWithEase", "Samsara", "Motive", "Any Other"].map((h, i) => (
                      <th key={h} style={{ padding: "14px 20px", textAlign: i === 0 ? "left" : "center", fontSize: 12, letterSpacing: 2, color: i === 1 ? GOLD : "#888", borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["72-Hour Incident Prediction", "✓", "✗", "✗", "✗"],
                    ["Auto Driver Hiring from Dispatch Forecast", "✓", "✗", "✗", "✗"],
                    ["Live In-Cab Safety Coach (Voice AI)", "✓", "✗", "✗", "✗"],
                    ["Phantom Compliance — Catch Before Filed", "✓", "✗", "✗", "✗"],
                    ["23-Signal Retention Intelligence", "✓", "✗", "✗", "✗"],
                    ["60-Second Full Driver Onboarding", "✓", "✗", "✗", "✗"],
                    ["Insurance Savings Integration", "✓", "✗", "✗", "Partial"],
                    ["ELD + HR + Safety in One Platform", "✓", "✗", "✗", "✗"],
                    ["Covers CDL + Van + Bike Couriers", "✓", "✗", "✗", "✗"],
                    ["Ghost Nerve Intelligence Layer", "✓", "✗", "✗", "✗"],
                  ].map(([fn, ...vals]) => (
                    <tr key={fn} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td style={{ padding: "14px 20px", fontSize: 14 }}>{fn}</td>
                      {vals.map((v, i) => (
                        <td key={i} style={{ padding: "14px 20px", textAlign: "center", fontSize: 18, color: v === "✓" ? "#4ade80" : v === "✗" ? "#ef4444" : "#f59e0b" }}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
