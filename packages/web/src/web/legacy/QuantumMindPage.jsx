import { useState, useEffect, useRef } from "react";
import PocketBase from "pocketbase";
const pb = new PocketBase();

const C = {
  gold: "#F5A623",
  goldBright: "#FFD700",
  goldDim: "#B8860B",
  black: "#0a0a0a",
  dark: "#111111",
  card: "#161616",
  border: "#2a2200",
  green: "#00ff88",
  blue: "#00aaff",
  red: "#ff3344",
  purple: "#aa44ff",
  cyan: "#00ffee",
};

const SYSTEMS = [
  {
    id: "dispatch",
    name: "Quantum Dispatch",
    icon: "⚡",
    color: C.gold,
    status: "ACTIVE",
    iq: 99,
    prediction: "Staging 3 loads for Driver Martinez before shift starts",
    actions: ["Pre-routing tomorrow's loads", "Flagging detention risk on Lane 7", "Optimizing fuel stop sequence"],
    connectedTo: ["ghost-nerve", "hos", "payroll", "safety"],
  },
  {
    id: "ghost-nerve",
    name: "Ghost Nerve",
    icon: "🧠",
    color: C.purple,
    status: "ACTIVE",
    iq: 100,
    prediction: "Detected broker payment delay pattern — alerting AP agent",
    actions: ["Indexing 2.4M data points", "Preventing 3 violations 72hrs early", "Revenue Nerve computing 47 variables"],
    connectedTo: ["dispatch", "safety", "hr", "finance"],
  },
  {
    id: "hr",
    name: "HRease",
    icon: "🧑‍💼",
    color: C.green,
    status: "ACTIVE",
    iq: 97,
    prediction: "Driver Williams showing flight risk — scheduling retention call",
    actions: ["Posting driver ad for Chicago lane", "Running background check on 2 applicants", "Onboarding step 4 of 7 for new hire"],
    connectedTo: ["dispatch", "payroll", "game-up", "safety"],
  },
  {
    id: "payroll",
    name: "Payroll Engine",
    icon: "💰",
    color: "#00ff88",
    status: "ACTIVE",
    iq: 98,
    prediction: "Pay period closes Friday — pre-calculating 14 driver checks",
    actions: ["Pulling verified ELD miles", "Calculating detention hours", "Preparing CSV export for ADP"],
    connectedTo: ["dispatch", "eld", "hr", "finance"],
  },
  {
    id: "safety",
    name: "Safety Shield",
    icon: "🛡️",
    color: C.blue,
    status: "ACTIVE",
    iq: 96,
    prediction: "Storm system on I-80 — pre-alerting 4 active drivers",
    actions: ["Monitoring CSA scores real-time", "Insurance score at 94/100", "DVIR completion rate 98%"],
    connectedTo: ["dispatch", "ghost-nerve", "eld", "finance"],
  },
  {
    id: "eld",
    name: "Sovereign ELD",
    icon: "📡",
    color: C.cyan,
    status: "ACTIVE",
    iq: 99,
    prediction: "Driver Chen approaching 10hr drive limit — queuing rest alert",
    actions: ["Sealing HOS logs cryptographically", "Syncing Geotab data stream", "Local driver exemptions applied"],
    connectedTo: ["dispatch", "payroll", "safety", "hos"],
  },
  {
    id: "hos",
    name: "HOS Logger",
    icon: "⏱️",
    color: "#ff9900",
    status: "ACTIVE",
    iq: 95,
    prediction: "3 drivers have 30-min windows — optimally placed at fuel stops",
    actions: ["Local driver mode active", "Short-haul exemptions verified", "34hr restart flagged for Monday"],
    connectedTo: ["eld", "dispatch", "safety"],
  },
  {
    id: "finance",
    name: "Finance Alert",
    icon: "📊",
    color: "#ff6644",
    status: "ACTIVE",
    iq: 96,
    prediction: "Revenue up 12% this month — projecting $47K by period close",
    actions: ["Fund allocation optimized", "Lane profitability updated", "Insurance renewal in 147 days"],
    connectedTo: ["payroll", "ghost-nerve", "safety"],
  },
  {
    id: "game-up",
    name: "Game Up Training",
    icon: "🎮",
    color: "#ff44aa",
    status: "ACTIVE",
    iq: 94,
    prediction: "Driver Johnson 80% through HOS module — auto-queuing DOT prep next",
    actions: ["Adaptive difficulty active", "3 drivers in certification track", "Rig Bucks awarded automatically"],
    connectedTo: ["hr", "safety", "eld"],
  },
  {
    id: "signal-sam",
    name: "Signal Sam",
    icon: "📱",
    color: "#44aaff",
    status: "ACTIVE",
    iq: 97,
    prediction: "2 subscriptions renewing Sunday — pre-sending confirmation texts",
    actions: ["3 fleet lines active", "SMS delivery 99.8%", "Twilio REST firing dispatch alerts"],
    connectedTo: ["hr", "dispatch", "payroll"],
  },
  {
    id: "billie-scan",
    name: "Billie Scan",
    icon: "🔍",
    color: "#ffaa00",
    status: "ACTIVE",
    iq: 98,
    prediction: "BOL scan queued — billing all 4 parties in 8 seconds of delivery",
    actions: ["IBM Watson OCR active", "AP agent synced", "Invoice accuracy 99.9%"],
    connectedTo: ["finance", "payroll", "dispatch"],
  },
  {
    id: "the-god",
    name: "THE GOAT",
    icon: "👑",
    color: C.goldBright,
    status: "SUPREME",
    iq: 100,
    prediction: "All 11 systems nominal — platform at 100% — no mistakes",
    actions: ["Overseeing 140 destinations", "Correcting code drift proactively", "Zero errors in last 72 hours"],
    connectedTo: ["dispatch", "ghost-nerve", "hr", "payroll", "safety", "eld", "hos", "finance", "game-up", "signal-sam", "billie-scan"],
  },
];

const INTENT_PREDICTIONS = [
  { trigger: "dispatch", prediction: "Opening Dispatch? Pre-loading top 5 profitable loads for your active drivers.", icon: "⚡" },
  { trigger: "hr", prediction: "Visiting HR? 2 applicants scored HIRE — interview slots pre-populated.", icon: "🧑‍💼" },
  { trigger: "payroll", prediction: "Payroll tab? This week's verified miles already compiled — one tap to approve.", icon: "💰" },
  { trigger: "loads", prediction: "Load board? Broker reputation pre-checked on top 8 loads. 3 flagged CAUTION.", icon: "📦" },
  { trigger: "safety", prediction: "Safety check? Your fleet score is 94 — $22K insurance savings unlocked.", icon: "🛡️" },
  { trigger: "scan", prediction: "Got a BOL? Camera ready. Billing fires in 8 seconds of capture.", icon: "📷" },
  { trigger: "training", prediction: "Game Up? 3 drivers are mid-module. Resuming their sessions automatically.", icon: "🎮" },
  { trigger: "eld", prediction: "ELD check? All drivers compliant. 2 approaching limits — rest queued.", icon: "📡" },
];

const QUANTUM_FEED = [
  { sys: "Ghost Nerve", msg: "Broker SWIFT Logistics — payment delay detected. AP agent alerted.", color: C.purple, time: "0s" },
  { sys: "Dispatch", msg: "Load LD-9921 pre-matched to Driver Chen — 2.4hrs before shift.", color: C.gold, time: "2s" },
  { sys: "Safety Shield", msg: "CSA score improved 3pts — insurance tier upgrade triggered.", color: C.blue, time: "4s" },
  { sys: "HRease", msg: "Driver Williams retention risk HIGH — call scheduled 9AM Monday.", color: C.green, time: "6s" },
  { sys: "Sovereign ELD", msg: "HOS log sealed cryptographically — DOT inspection ready.", color: C.cyan, time: "8s" },
  { sys: "Billie Scan", msg: "BOL #8843 scanned — $2,840 billed to broker, fleet, AP in 8 seconds.", color: "#ffaa00", time: "10s" },
  { sys: "Signal Sam", msg: "Fleet Voice line test passed — 3 lines active, 0 dropped.", color: "#44aaff", time: "12s" },
  { sys: "Finance Alert", msg: "Revenue Nerve: Lane CHI→DAL profit up 8% — doubling allocation.", color: "#ff6644", time: "14s" },
  { sys: "THE GOAT", msg: "Full platform scan complete — 140 destinations live — ZERO ERRORS.", color: C.goldBright, time: "16s" },
  { sys: "Game Up", msg: "Driver Johnson completed HOS module — 150 Rig Bucks awarded.", color: "#ff44aa", time: "18s" },
  { sys: "Ghost Nerve", msg: "Storm system I-80 detected — 4 drivers pre-alerted, routes adjusted.", color: C.purple, time: "20s" },
  { sys: "Payroll Engine", msg: "14 driver checks pre-calculated — $47,280 total — pending approval.", color: "#00ff88", time: "22s" },
];

export default function QuantumMindPage() {
  const [activeSystem, setActiveSystem] = useState("the-god");
  const [feedItems, setFeedItems] = useState([]);
  const [pulseCount, setPulseCount] = useState(0);
  const [intentIdx, setIntentIdx] = useState(0);
  const [synergyScore, setSynergyScore] = useState(0);
  const [tab, setTab] = useState("mind");
  const [connectionLines, setConnectionLines] = useState([]);
  const feedRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Animate synergy score to 100
    let s = 0;
    const scoreInterval = setInterval(() => {
      s = Math.min(100, s + 2);
      setSynergyScore(s);
      if (s >= 100) clearInterval(scoreInterval);
    }, 30);

    // Feed items
    let idx = 0;
    intervalRef.current = setInterval(() => {
      const item = QUANTUM_FEED[idx % QUANTUM_FEED.length];
      setFeedItems(prev => [{ ...item, id: Date.now(), ts: new Date().toLocaleTimeString() }, ...prev.slice(0, 19)]);
      idx++;
      setPulseCount(p => p + 1);
    }, 2400);

    // Intent cycle
    const intentInterval = setInterval(() => {
      setIntentIdx(i => (i + 1) % INTENT_PREDICTIONS.length);
    }, 4000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(intentInterval);
      clearInterval(scoreInterval);
    };
  }, []);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [feedItems]);

  const active = SYSTEMS.find(s => s.id === activeSystem);
  const connected = active ? SYSTEMS.filter(s => active.connectedTo.includes(s.id)) : [];

  return (
    <div style={{ background: C.black, minHeight: "100vh", fontFamily: "'Oswald', sans-serif", color: "white" }}>
      {/* Top Banner */}
      <div style={{
        background: `linear-gradient(90deg, #000 0%, #1a0f00 20%, #2a1500 50%, #1a0f00 80%, #000 100%)`,
        borderBottom: `2px solid ${C.gold}`,
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        overflow: "hidden",
        position: "relative",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/static/twe-logo.png" alt="TruckWithEase" style={{ height: 36, objectFit: "contain" }} />
          <div style={{ borderLeft: `1px solid ${C.goldDim}`, paddingLeft: 12 }}>
            <div style={{ fontSize: 11, color: C.goldDim, letterSpacing: 3 }}>QUANTUM MIND</div>
            <div style={{ fontSize: 14, color: C.gold, letterSpacing: 2, fontWeight: 700 }}>UNIFIED INTELLIGENCE LAYER</div>
          </div>
        </div>

        {/* Synergy score */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.goldDim, letterSpacing: 2 }}>SYSTEM SYNERGY</div>
            <div style={{ fontSize: 28, color: C.goldBright, fontWeight: 900, lineHeight: 1 }}>{synergyScore}<span style={{ fontSize: 14, color: C.gold }}>%</span></div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.goldDim, letterSpacing: 2 }}>PULSE COUNT</div>
            <div style={{ fontSize: 28, color: C.green, fontWeight: 900, lineHeight: 1 }}>{pulseCount}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.goldDim, letterSpacing: 2 }}>SYSTEMS ACTIVE</div>
            <div style={{ fontSize: 28, color: C.cyan, fontWeight: 900, lineHeight: 1 }}>12</div>
          </div>
        </div>
      </div>

      {/* Intent Prediction Bar */}
      <div style={{
        background: `linear-gradient(90deg, #0a0500 0%, #1a0d00 50%, #0a0500 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "8px 24px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <div style={{ fontSize: 10, color: C.goldDim, letterSpacing: 3, whiteSpace: "nowrap" }}>🔮 QUANTUM MIND PREDICTS:</div>
        <div style={{
          fontSize: 13,
          color: C.gold,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          animation: "fadeInPred 0.5s ease",
        }}>
          {INTENT_PREDICTIONS[intentIdx].icon} {INTENT_PREDICTIONS[intentIdx].prediction}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.border}`, padding: "0 24px", background: C.dark }}>
        {[
          { id: "mind", label: "🧬 QUANTUM MIND" },
          { id: "synergy", label: "🔗 SYSTEM SYNERGY" },
          { id: "feed", label: "⚡ LIVE FEED" },
          { id: "intent", label: "🔮 INTENT ENGINE" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "14px 20px",
            color: tab === t.id ? C.gold : "#666",
            borderBottom: tab === t.id ? `2px solid ${C.gold}` : "2px solid transparent",
            fontSize: 12, letterSpacing: 2, fontFamily: "'Oswald', sans-serif",
            transition: "all 0.2s",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
        {/* QUANTUM MIND TAB */}
        {tab === "mind" && (
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
            {/* System selector */}
            <div>
              <div style={{ fontSize: 11, color: C.goldDim, letterSpacing: 3, marginBottom: 12 }}>SELECT SYSTEM</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {SYSTEMS.map(sys => (
                  <button key={sys.id} onClick={() => setActiveSystem(sys.id)} style={{
                    background: activeSystem === sys.id ? `${sys.color}18` : C.card,
                    border: `1px solid ${activeSystem === sys.id ? sys.color : C.border}`,
                    borderRadius: 8, padding: "10px 14px",
                    display: "flex", alignItems: "center", gap: 10,
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.2s",
                    boxShadow: activeSystem === sys.id ? `0 0 20px ${sys.color}30` : "none",
                  }}>
                    <span style={{ fontSize: 18 }}>{sys.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: activeSystem === sys.id ? sys.color : "white", fontWeight: 700, letterSpacing: 1 }}>{sys.name}</div>
                      <div style={{ fontSize: 10, color: "#666", letterSpacing: 1 }}>IQ {sys.iq} · {sys.status}</div>
                    </div>
                    {activeSystem === sys.id && (
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: sys.color, boxShadow: `0 0 8px ${sys.color}` }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* System detail */}
            {active && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Header card */}
                <div style={{
                  background: `linear-gradient(135deg, ${active.color}15 0%, ${C.card} 100%)`,
                  border: `1px solid ${active.color}60`,
                  borderRadius: 16, padding: 28,
                  boxShadow: `0 0 40px ${active.color}20`,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 40 }}>{active.icon}</div>
                      <div style={{ fontSize: 28, color: active.color, fontWeight: 900, letterSpacing: 2, marginTop: 8 }}>{active.name}</div>
                      <div style={{ fontSize: 11, color: "#666", letterSpacing: 3 }}>{active.status} · INTELLIGENCE QUOTIENT {active.iq}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: "#666", letterSpacing: 2, marginBottom: 4 }}>SYSTEM IQ</div>
                      <div style={{ fontSize: 64, color: active.color, fontWeight: 900, lineHeight: 1 }}>{active.iq}</div>
                    </div>
                  </div>

                  {/* Prediction */}
                  <div style={{
                    background: `${active.color}12`,
                    border: `1px solid ${active.color}40`,
                    borderRadius: 10, padding: "14px 18px",
                    marginBottom: 20,
                  }}>
                    <div style={{ fontSize: 10, color: active.color, letterSpacing: 3, marginBottom: 6 }}>🔮 CURRENT PREDICTION</div>
                    <div style={{ fontSize: 15, color: "white", fontFamily: "'Inter', sans-serif" }}>{active.prediction}</div>
                  </div>

                  {/* Active actions */}
                  <div style={{ fontSize: 11, color: "#666", letterSpacing: 3, marginBottom: 12 }}>RUNNING NOW</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {active.actions.map((action, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: active.color, animation: "pulse 1.5s infinite", animationDelay: `${i * 0.4}s` }} />
                        <div style={{ fontSize: 13, color: "#ccc", fontFamily: "'Inter', sans-serif" }}>{action}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connected systems */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                  <div style={{ fontSize: 11, color: C.goldDim, letterSpacing: 3, marginBottom: 16 }}>CONNECTED SYSTEMS — WORKING TOGETHER RIGHT NOW</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                    {connected.map(sys => (
                      <div key={sys.id} onClick={() => setActiveSystem(sys.id)} style={{
                        background: `${sys.color}10`,
                        border: `1px solid ${sys.color}40`,
                        borderRadius: 10, padding: "14px 16px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}>
                        <div style={{ fontSize: 22, marginBottom: 6 }}>{sys.icon}</div>
                        <div style={{ fontSize: 13, color: sys.color, fontWeight: 700 }}>{sys.name}</div>
                        <div style={{ fontSize: 10, color: "#666", marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{sys.actions[0]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SYNERGY TAB */}
        {tab === "synergy" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{
              background: C.card, border: `1px solid ${C.gold}40`,
              borderRadius: 16, padding: 28,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 11, color: C.goldDim, letterSpacing: 3, marginBottom: 8 }}>PLATFORM SYNERGY SCORE</div>
              <div style={{ fontSize: 96, color: C.goldBright, fontWeight: 900, lineHeight: 1 }}>{synergyScore}<span style={{ fontSize: 32 }}>%</span></div>
              <div style={{ fontSize: 14, color: "#aaa", marginTop: 8, fontFamily: "'Inter', sans-serif" }}>
                All 12 systems communicating in real time — no gaps, no delays, no failures
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {SYSTEMS.map(sys => (
                <div key={sys.id} style={{
                  background: `${sys.color}10`,
                  border: `1px solid ${sys.color}40`,
                  borderRadius: 12, padding: 20,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <span style={{ fontSize: 24 }}>{sys.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, color: sys.color, fontWeight: 700 }}>{sys.name}</div>
                      <div style={{ fontSize: 10, color: "#666", letterSpacing: 2 }}>IQ {sys.iq}</div>
                    </div>
                  </div>
                  {/* IQ bar */}
                  <div style={{ background: "#1a1a1a", borderRadius: 4, height: 6, overflow: "hidden", marginBottom: 10 }}>
                    <div style={{
                      width: `${sys.iq}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${sys.color}80, ${sys.color})`,
                      borderRadius: 4,
                      transition: "width 1s ease",
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#666", fontFamily: "'Inter', sans-serif" }}>
                    Feeds into: {sys.connectedTo.slice(0, 3).join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LIVE FEED TAB */}
        {tab === "feed" && (
          <div>
            <div style={{ fontSize: 11, color: C.goldDim, letterSpacing: 3, marginBottom: 16 }}>
              ⚡ QUANTUM MIND — LIVE INTELLIGENCE FEED — ALL 12 SYSTEMS
            </div>
            <div ref={feedRef} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {feedItems.map((item, i) => (
                <div key={item.id} style={{
                  background: `${item.color}10`,
                  border: `1px solid ${item.color}40`,
                  borderRadius: 10, padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 14,
                  animation: i === 0 ? "slideIn 0.4s ease" : "none",
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0, boxShadow: `0 0 8px ${item.color}` }} />
                  <div style={{ fontSize: 10, color: item.color, letterSpacing: 2, whiteSpace: "nowrap", minWidth: 120 }}>{item.sys}</div>
                  <div style={{ fontSize: 13, color: "#ccc", fontFamily: "'Inter', sans-serif", flex: 1 }}>{item.msg}</div>
                  <div style={{ fontSize: 10, color: "#444", whiteSpace: "nowrap" }}>{item.ts}</div>
                </div>
              ))}
              {feedItems.length === 0 && (
                <div style={{ textAlign: "center", color: "#444", padding: 40 }}>Initializing quantum feed...</div>
              )}
            </div>
          </div>
        )}

        {/* INTENT ENGINE TAB */}
        {tab === "intent" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{
              background: `linear-gradient(135deg, #1a0d00 0%, ${C.card} 100%)`,
              border: `1px solid ${C.gold}40`,
              borderRadius: 16, padding: 28,
            }}>
              <div style={{ fontSize: 11, color: C.goldDim, letterSpacing: 3, marginBottom: 8 }}>WHAT IS THE INTENT ENGINE?</div>
              <div style={{ fontSize: 18, color: C.gold, fontWeight: 700, marginBottom: 12 }}>
                TruckWithEase predicts what every user needs before they tap a button.
              </div>
              <div style={{ fontSize: 14, color: "#aaa", fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}>
                Ghost Nerve indexes 2.4 million data points across every driver, every load, every lane, and every compliance record — continuously, in real time. The moment a user opens the app, Quantum Mind has already staged the information they need, pre-run the calculations, and queued the next logical action. They never wait. They never search. The platform thinks one step ahead of everyone on it.
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {INTENT_PREDICTIONS.map((pred, i) => (
                <div key={i} style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: 20,
                  borderLeft: `3px solid ${C.gold}`,
                }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{pred.icon}</div>
                  <div style={{ fontSize: 11, color: C.goldDim, letterSpacing: 3, marginBottom: 8 }}>WHEN USER OPENS {pred.trigger.toUpperCase()}</div>
                  <div style={{ fontSize: 13, color: "white", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>{pred.prediction}</div>
                </div>
              ))}
            </div>

            {/* The 5 laws */}
            <div style={{ background: C.card, border: `1px solid ${C.gold}40`, borderRadius: 16, padding: 28 }}>
              <div style={{ fontSize: 11, color: C.goldDim, letterSpacing: 3, marginBottom: 20 }}>THE 5 LAWS OF QUANTUM MIND — NO COMPETITOR HAS THESE</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { num: "01", title: "Every function feeds every other function", desc: "No feature operates alone. Dispatch feeds payroll. Payroll feeds HR. HR feeds safety. Safety feeds insurance. All 12 systems are one organism, not 12 separate tools." },
                  { num: "02", title: "The platform knows before you ask", desc: "Intent Engine stages answers before the question is typed. Loads pre-matched. Pay pre-calculated. Violations pre-caught. The user arrives to a done job, not a task." },
                  { num: "03", title: "Zero tolerance for downtime", desc: "THE GOAT monitors every function continuously. Fallback Engine switches services in under 100ms. The platform has never gone dark and never will." },
                  { num: "04", title: "Every data point improves every decision", desc: "3 years of indexed memory. 47 profit variables per mile. Every load, driver, and lane makes the next recommendation smarter. It compounds daily." },
                  { num: "05", title: "The driver never needs to think about the platform", desc: "Compliance handled. Pay calculated. Routes optimized. Training queued. The driver drives. The fleet grows. TruckWithEase runs everything else." },
                ].map(law => (
                  <div key={law.num} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                    <div style={{ fontSize: 36, color: C.goldDim, fontWeight: 900, lineHeight: 1, minWidth: 48 }}>{law.num}</div>
                    <div>
                      <div style={{ fontSize: 15, color: C.gold, fontWeight: 700, marginBottom: 6 }}>{law.title}</div>
                      <div style={{ fontSize: 13, color: "#aaa", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>{law.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.5)} }
        @keyframes fadeInPred { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </div>
  );
}
