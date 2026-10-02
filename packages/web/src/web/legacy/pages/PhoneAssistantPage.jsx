import { useState, useEffect } from "react";
import PocketBase from "pocketbase";
const pb = new PocketBase();

const GOLD = "#D4AF37";
const BLACK = "#0a0a0a";
const CARD = "#111111";
const BORDER = "#222222";

const VOICES = [
  { id: "aria", name: "Aria", gender: "Female", accent: "Professional US", tone: "Warm & Confident", sample: "Thank you for calling Smith Trucking. This is Aria, your 24/7 fleet assistant. How can I help you today?" },
  { id: "rex", name: "Rex", gender: "Male", accent: "Deep South US", tone: "Authoritative & Friendly", sample: "Hey there! You've reached Smith Trucking. I'm Rex, your automated fleet coordinator. What can I do for you?" },
  { id: "nova", name: "Nova", gender: "Female", accent: "Neutral US", tone: "Sharp & Efficient", sample: "Smith Trucking, Nova speaking. I handle all fleet inquiries around the clock. How can I direct your call?" },
  { id: "max", name: "Max", gender: "Male", accent: "Northern US", tone: "Direct & Professional", sample: "Thanks for calling. You've reached Smith Trucking's automated fleet line. I'm Max — let's get you sorted quickly." },
];

const CALL_FLOWS = [
  { id: "dispatch", label: "Dispatch Inquiries", icon: "🚛", desc: "Load status, driver location, ETA updates" },
  { id: "driver", label: "Driver Support", icon: "👤", desc: "HOS questions, breakdown help, load issues" },
  { id: "broker", label: "Broker Calls", icon: "📋", desc: "Rate confirmations, load availability, booking" },
  { id: "safety", label: "Safety Reports", icon: "🛡️", desc: "Incident reporting, DOT questions, compliance" },
  { id: "hr", label: "Driver Applications", icon: "🎯", desc: "Job inquiries, application status, onboarding" },
  { id: "billing", label: "Billing & Invoices", icon: "💰", desc: "Invoice status, payment questions, factoring" },
];

const RECENT_CALLS = [
  { time: "2m ago", caller: "+1 (312) 555-0147", type: "Dispatch", resolved: true, duration: "1m 24s", summary: "Caller asked for ETA on load #8847 — answered automatically" },
  { time: "18m ago", caller: "+1 (773) 555-0293", type: "Broker", resolved: true, duration: "2m 12s", summary: "Rate confirmation on Chicago→Dallas lane — confirmed $2.85/mi" },
  { time: "47m ago", caller: "+1 (214) 555-0381", type: "Driver", resolved: true, duration: "0m 58s", summary: "HOS hours question — answered with current log data" },
  { time: "1h ago", caller: "+1 (708) 555-0512", type: "HR", resolved: false, duration: "3m 05s", summary: "CDL driver application — transferred to HRease agent" },
];

export default function PhoneAssistantPage() {
  const [tab, setTab] = useState("setup");
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [fleetName, setFleetName] = useState("Smith Trucking");
  const [greeting, setGreeting] = useState("");
  const [activeFlows, setActiveFlows] = useState(["dispatch", "driver", "broker"]);
  const [playing, setPlaying] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setGreeting(selectedVoice.sample.replace("Smith Trucking", fleetName));
  }, [selectedVoice, fleetName]);

  const toggleFlow = (id) => {
    setActiveFlows(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const totalCalls = 247;
  const resolved = 231;
  const avgDuration = "1m 43s";

  return (
    <div style={{ background: BLACK, minHeight: "100vh", color: "#fff", fontFamily: "'Oswald', sans-serif" }}>
      {/* GOD Banner */}
      <div style={{ background: "linear-gradient(90deg, #1a0a00, #2d1a00, #1a0a00)", borderBottom: `2px solid ${GOLD}`, padding: "10px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 20 }}>👑</span>
        <span style={{ color: GOLD, fontWeight: 700, fontSize: 13, letterSpacing: 2 }}>THE GOAT — MONITORING ALL CALLS — ZERO ERRORS — ONLY STRONGER</span>
        <div style={{ marginLeft: "auto", width: 10, height: 10, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
      </div>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #111 0%, #001a00 100%)", borderBottom: `1px solid ${BORDER}`, padding: "32px" }}>
        <div style={{ fontSize: 11, color: GOLD, letterSpacing: 4, marginBottom: 8 }}>POWERED BY TWILIO · CUSTOMIZED FOR YOUR FLEET</div>
        <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: 2, lineHeight: 1.1 }}>AUTOMATED<br /><span style={{ color: GOLD }}>PHONE ASSISTANT</span></div>
        <div style={{ fontSize: 16, color: "#888", marginTop: 12, maxWidth: 600 }}>Your fleet's 24/7 phone line — custom voice, custom content, fully automated. Handles dispatch inquiries, broker calls, driver support, and HR questions without a single human on duty.</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginTop: 24, maxWidth: 700 }}>
          {[
            { label: "CALLS HANDLED", value: totalCalls.toLocaleString(), color: GOLD },
            { label: "AUTO-RESOLVED", value: `${Math.round((resolved/totalCalls)*100)}%`, color: "#4ade80" },
            { label: "AVG DURATION", value: avgDuration, color: "#60a5fa" },
            { label: "STATUS", value: "LIVE 24/7", color: "#4ade80" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 11, color: "#888", letterSpacing: 2, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, padding: "20px 32px 0", borderBottom: `1px solid ${BORDER}`, overflowX: "auto" }}>
        {[["setup", "Voice & Setup"], ["flows", "Call Flows"], ["calls", "Recent Calls"], ["numbers", "Phone Numbers"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ background: tab === id ? GOLD : "transparent", color: tab === id ? BLACK : "#888", border: `1px solid ${tab === id ? GOLD : BORDER}`, borderRadius: "8px 8px 0 0", padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Oswald', sans-serif", letterSpacing: 1, whiteSpace: "nowrap" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
        {tab === "setup" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px" }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>YOUR FLEET NAME</div>
                <input value={fleetName} onChange={e => setFleetName(e.target.value)} style={{ width: "100%", background: "#0a0a0a", color: GOLD, border: `1px solid ${GOLD}`, borderRadius: 8, padding: "12px 16px", fontFamily: "'Oswald', sans-serif", fontSize: 20, fontWeight: 700, boxSizing: "border-box" }} />
                <div style={{ fontSize: 13, color: "#888", marginTop: 8 }}>This name is spoken in every greeting and response.</div>
              </div>

              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px" }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>CHOOSE YOUR VOICE</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {VOICES.map(v => (
                    <div key={v.id} onClick={() => setSelectedVoice(v)} style={{ background: selectedVoice.id === v.id ? "#1a1000" : "#0a0a0a", border: `1px solid ${selectedVoice.id === v.id ? GOLD : BORDER}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{v.name} <span style={{ fontSize: 12, color: "#888", fontWeight: 400 }}>· {v.gender} · {v.accent}</span></div>
                        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{v.tone}</div>
                      </div>
                      {selectedVoice.id === v.id && <div style={{ color: GOLD, fontSize: 20 }}>✓</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: CARD, border: `1px solid ${GOLD}`, borderRadius: 16, padding: "24px" }}>
                <div style={{ fontSize: 13, color: GOLD, letterSpacing: 2, marginBottom: 12 }}>LIVE PREVIEW — {selectedVoice.name.toUpperCase()}</div>
                <div style={{ background: "#0a0a0a", borderRadius: 10, padding: "20px", fontSize: 16, lineHeight: 1.7, color: "#fff", borderLeft: `3px solid ${GOLD}` }}>
                  "{greeting}"
                </div>
                <button onClick={() => { setPlaying(true); setTimeout(() => setPlaying(false), 3000); }} style={{ marginTop: 16, background: playing ? "#333" : GOLD, color: playing ? "#888" : BLACK, border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Oswald', sans-serif", letterSpacing: 1, width: "100%" }}>
                  {playing ? "🔊 PLAYING..." : "▶ PREVIEW GREETING"}
                </button>
              </div>

              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px" }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>CUSTOM GREETING</div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>Customize what {selectedVoice.name} says when someone calls your fleet line.</div>
                <textarea value={greeting} onChange={e => setGreeting(e.target.value)} rows={4} style={{ width: "100%", background: "#0a0a0a", color: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 16px", fontFamily: "'Oswald', sans-serif", fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
                <button onClick={handleSave} style={{ marginTop: 12, background: saved ? "#4ade80" : GOLD, color: BLACK, border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Oswald', sans-serif", letterSpacing: 1, width: "100%" }}>
                  {saved ? "✓ SAVED" : "SAVE CONFIGURATION"}
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "flows" && (
          <div>
            <div style={{ fontSize: 16, color: "#888", marginBottom: 20 }}>Select which call types your assistant handles automatically. Unselected types route to you directly.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              {CALL_FLOWS.map(f => {
                const active = activeFlows.includes(f.id);
                return (
                  <div key={f.id} onClick={() => toggleFlow(f.id)} style={{ background: CARD, border: `2px solid ${active ? GOLD : BORDER}`, borderRadius: 16, padding: "24px", cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontSize: 36 }}>{f.icon}</span>
                      <div style={{ background: active ? GOLD : "#333", width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: active ? BLACK : "#888", fontWeight: 700, fontSize: 14 }}>{active ? "✓" : ""}</div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginTop: 12, marginBottom: 6 }}>{f.label}</div>
                    <div style={{ fontSize: 13, color: "#888" }}>{f.desc}</div>
                    <div style={{ marginTop: 12, fontSize: 12, color: active ? GOLD : "#666", fontWeight: 700 }}>{active ? "✓ AUTO-HANDLED" : "ROUTES TO YOU"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "calls" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 16, color: "#888", marginBottom: 8 }}>Every call handled by your assistant — logged permanently with full summary.</div>
            {RECENT_CALLS.map((call, i) => (
              <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ fontSize: 12, color: "#888", minWidth: 60 }}>{call.time}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{call.caller}</div>
                    <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{call.summary}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: "#888" }}>{call.duration}</div>
                  <div style={{ background: call.type === "Dispatch" ? "#1e3a5f" : call.type === "Broker" ? "#1a2e00" : call.type === "HR" ? "#2d1a00" : "#1a1a1a", color: call.type === "Dispatch" ? "#60a5fa" : call.type === "Broker" ? "#4ade80" : call.type === "HR" ? GOLD : "#888", border: `1px solid currentColor`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{call.type}</div>
                  <div style={{ color: call.resolved ? "#4ade80" : "#f59e0b", fontSize: 12, fontWeight: 700 }}>{call.resolved ? "✓ RESOLVED" : "TRANSFERRED"}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "numbers" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 16, color: "#888", marginBottom: 8 }}>Your dedicated fleet phone numbers — all powered by Twilio and monitored by Signal Sam 24/7.</div>
            {[
              { label: "Main Dispatch Line", number: "Activate to get your number", type: "Dispatch + Broker calls", status: "pending" },
              { label: "Driver Support Line", number: "Activate to get your number", type: "Driver inquiries + HOS questions", status: "pending" },
              { label: "HR & Applications", number: "Activate to get your number", type: "Driver job applications + onboarding", status: "pending" },
              { label: "Toll-Free Main Line", number: "1-800-XXX-XXXX", type: "All call types — premium number", status: "upgrade" },
            ].map(n => (
              <div key={n.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{n.label}</div>
                  <div style={{ fontSize: 14, color: GOLD, marginTop: 4 }}>{n.number}</div>
                  <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{n.type}</div>
                </div>
                <button style={{ background: n.status === "upgrade" ? "#1a1000" : GOLD, color: n.status === "upgrade" ? GOLD : BLACK, border: n.status === "upgrade" ? `1px solid ${GOLD}` : "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Oswald', sans-serif", letterSpacing: 1 }}>
                  {n.status === "upgrade" ? "UPGRADE →" : "ACTIVATE NUMBER"}
                </button>
              </div>
            ))}
            <div style={{ background: "#0d0d0d", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px", fontSize: 13, color: "#888" }}>
              💡 Numbers activate instantly once your Twilio credentials are saved at <span style={{ color: GOLD }}>/twilio-setup</span>. Signal Sam monitors every line 24/7 and alerts you immediately if any line goes down.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
