
import { useState, useEffect, useRef } from "react";

const NAVY = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED = "#DC2626";
const DARK = "#06090F";

const FLEET_CHIEF_OPENER = "I'm Fleet Chief. I'm monitoring your truck's last known fault codes. Tell me what happened — engine warning, tire, brake, or something else — and I'll help you figure out if you can limp to the nearest shop or need to stay put.";

const FLEET_CHIEF_REPLIES = {
  default: "Based on your description, this sounds like a common mechanical issue. Here's what to do while you wait:\n1) Pull as far off the road as possible\n2) Turn on hazard lights immediately\n3) Place reflective triangles 100, 200, and 300 ft behind the vehicle\n4) Stay in the cab if you're on a highway\n5) Do NOT attempt repairs in traffic",
  tire: "This sounds like a tire or blowout issue. Do NOT drive on a flat — you risk rim damage and loss of control.\n1) Stay in the cab with hazards on\n2) Set triangles behind the truck\n3) Call roadside — changing a truck tire on a shoulder is dangerous alone\n4) ETA for roadside assistance: 45–60 min",
  engine: "Engine warning codes detected. Before anything else:\n1) Check your oil pressure and coolant temp gauges\n2) If either is red, shut down immediately\n3) Do NOT try to 'limp' a truck with low oil pressure\n4) Roadside has been notified — stay put",
  brake: "Brake issues are serious — do not attempt to move this truck.\n1) Apply the parking brake and chock the wheels if you have them\n2) Place triangles immediately — brakes failing means the truck can roll\n3) Emergency dispatch has been notified\n4) Do NOT release the parking brake until technician arrives",
};

const CONTACTS = [
  { icon: "🚨", label: "911 — Emergency", number: "911", color: RED },
  { icon: "🔧", label: "NationaLease Roadside", number: "1-800-NationaLease", color: ORANGE },
  { icon: "⛽", label: "Pilot Flying J Roadside", number: "1-877-866-7378", color: AMBER },
  { icon: "🏥", label: "Your Fleet Manager", number: "(214) 555-0198", color: GREEN },
];

const ACTION_STEPS = [
  { icon: "🔴", text: "Turn on hazard lights immediately", priority: "critical" },
  { icon: "⚠️", text: "Place triangles/flares 100, 200, 300 ft behind truck", priority: "critical" },
  { icon: "📞", text: "Call your carrier: (800) 555-0100", priority: "important" },
  { icon: "🚗", text: "Stay in cab — do NOT stand on shoulder", priority: "critical" },
  { icon: "📋", text: "Document everything — photos + time", priority: "important" },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Poppins', sans-serif; background: #0A0A0F; color: #E2E8F0; }

  .breakdown-wrap { min-height: 100vh; background: #0A0A0F; }

  /* NAV */
  .breakdown-nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(10,10,15,0.97); backdrop-filter: blur(10px);
    border-bottom: 2px solid rgba(220,38,38,0.3);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px; height: 56px;
  }
  .nav-brand { font-weight: 800; font-size: 1rem; color: #fff; display: flex; align-items: center; gap: 8px; }
  .nav-sos-badge { background: ${RED}; color: #fff; font-size: 0.68rem; font-weight: 700; padding: 3px 8px; border-radius: 9999px; animation: pulse 2s infinite; }
  .nav-links a { color: #94A3B8; text-decoration: none; font-size: 0.85rem; margin-left: 20px; font-weight: 500; }
  .nav-links a:hover { color: #fff; }
  @media (max-width: 480px) { .nav-links { display: none; } }

  /* CONTENT */
  .breakdown-content { max-width: 800px; margin: 0 auto; padding: 28px 16px 100px; }

  /* HERO */
  .hero-section { text-align: center; padding: 32px 16px 28px; border-radius: 20px; background: linear-gradient(180deg, rgba(220,38,38,0.1), transparent); border: 1px solid rgba(220,38,38,0.2); margin-bottom: 24px; }
  .hero-icon { font-size: 3.5rem; animation: pulse 1.5s infinite; display: block; margin-bottom: 12px; }
  .hero-title { font-size: 2rem; font-weight: 900; color: #fff; margin-bottom: 8px; }
  @media (max-width: 480px) { .hero-title { font-size: 1.5rem; } }
  .hero-sub { font-size: 0.88rem; color: #94A3B8; line-height: 1.5; }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.75; transform: scale(1.05); }
  }
  @keyframes pulseRing {
    0% { box-shadow: 0 0 0 0 rgba(220,38,38,0.6); }
    70% { box-shadow: 0 0 0 20px rgba(220,38,38,0); }
    100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
  }

  /* BIG SOS BUTTON */
  .sos-section { margin-bottom: 24px; }
  .sos-btn {
    width: 100%; height: 72px; background: linear-gradient(135deg, #C01E1E, ${RED});
    border: none; border-radius: 16px; color: #fff; font-size: 1.1rem; font-weight: 900;
    cursor: pointer; font-family: 'Poppins', sans-serif; letter-spacing: 0.02em;
    animation: pulseRing 2s infinite; transition: transform 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 12px;
  }
  .sos-btn:hover { transform: scale(1.01); }
  .sos-btn:active { transform: scale(0.99); }
  .sos-btn.sending { background: linear-gradient(135deg, #D97706, ${AMBER}); animation: none; }
  .sos-btn.sent { background: linear-gradient(135deg, #15803D, ${GREEN}); animation: none; }

  /* STATUS CARD */
  .status-card {
    background: rgba(22,163,74,0.08); border: 1px solid rgba(22,163,74,0.3);
    border-radius: 16px; padding: 20px; margin-bottom: 24px;
  }
  .status-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .status-title { font-size: 1rem; font-weight: 800; color: ${GREEN}; }
  .location-badge { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 14px; margin-bottom: 14px; font-family: 'DM Mono', monospace; font-size: 0.8rem; color: #E2E8F0; }
  .location-label { font-size: 0.68rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; font-family: 'Poppins', sans-serif; }
  .status-checks { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
  .status-check { display: flex; align-items: center; gap: 10px; font-size: 0.82rem; font-weight: 600; color: ${GREEN}; }
  .eta-badge { background: rgba(255,180,0,0.1); border: 1px solid rgba(255,180,0,0.3); border-radius: 10px; padding: 10px 14px; }
  .eta-label { font-size: 0.68rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
  .eta-val { font-size: 1rem; font-weight: 800; color: ${AMBER}; font-family: 'DM Mono', monospace; }

  /* FLEET CHIEF DIAGNOSIS IN STATUS */
  .diagnosis-section { margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.07); padding-top: 16px; }
  .diagnosis-label { font-size: 0.72rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
  .diagnosis-textarea {
    width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff;
    font-size: 0.85rem; font-family: 'Poppins', sans-serif; min-height: 80px; outline: none; resize: vertical;
  }
  .diagnosis-textarea:focus { border-color: ${ORANGE}; }
  .ask-fc-btn {
    margin-top: 10px; padding: 12px 20px; background: ${ORANGE}; color: #fff;
    font-weight: 700; border: none; border-radius: 10px; cursor: pointer;
    font-size: 0.85rem; font-family: 'Poppins', sans-serif; transition: opacity 0.2s;
  }
  .ask-fc-btn:hover { opacity: 0.88; }
  .fc-response { margin-top: 12px; background: rgba(11,42,107,0.4); border: 1px solid rgba(11,42,107,0.8); border-radius: 10px; padding: 14px; font-size: 0.8rem; line-height: 1.7; color: #CBD5E1; white-space: pre-line; }
  .fc-label { font-size: 0.68rem; font-weight: 700; color: ${ORANGE}; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }

  /* SECTION HEADER */
  .section-title { font-size: 1rem; font-weight: 800; color: #fff; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }

  /* ACTION STEPS */
  .action-steps { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
  .action-step {
    display: flex; align-items: center; gap: 16px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 18px 20px; cursor: pointer;
    transition: background 0.2s;
  }
  .action-step.critical { border-left: 4px solid ${RED}; }
  .action-step.important { border-left: 4px solid ${AMBER}; }
  .action-step:hover { background: rgba(255,255,255,0.07); }
  .action-icon { font-size: 1.8rem; min-width: 40px; text-align: center; }
  .action-text { font-size: 0.92rem; font-weight: 700; color: #fff; line-height: 1.3; }
  .action-check { margin-left: auto; width: 28px; height: 28px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; transition: all 0.2s; flex-shrink: 0; }
  .action-check.done { background: ${GREEN}; border-color: ${GREEN}; }

  /* CONTACTS */
  .contacts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; }
  @media (max-width: 480px) { .contacts-grid { grid-template-columns: 1fr; } }
  .contact-card {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 18px; text-decoration: none; display: flex; flex-direction: column; gap: 6px;
    transition: background 0.2s; cursor: pointer;
  }
  .contact-card:hover { background: rgba(255,255,255,0.08); }
  .contact-icon { font-size: 1.6rem; }
  .contact-label { font-size: 0.82rem; font-weight: 700; color: #fff; }
  .contact-number { font-size: 0.9rem; font-weight: 700; font-family: 'DM Mono', monospace; }
  .contact-tap-hint { font-size: 0.65rem; color: #4B5563; margin-top: 2px; }

  /* FLEET CHIEF CHAT */
  .fc-chat { background: rgba(8,18,40,0.8); border: 1px solid rgba(11,42,107,0.5); border-radius: 20px; overflow: hidden; }
  .fc-chat-header { padding: 16px 20px; background: rgba(11,42,107,0.5); border-bottom: 1px solid rgba(11,42,107,0.5); display: flex; align-items: center; gap: 12px; }
  .fc-avatar { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, ${NAVY}, ${ORANGE}); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
  .fc-name { font-size: 0.9rem; font-weight: 700; color: #fff; }
  .fc-status { font-size: 0.7rem; color: ${GREEN}; display: flex; align-items: center; gap: 5px; }
  .fc-status::before { content: '●'; animation: pulse 1.5s infinite; }
  .fc-messages { padding: 16px 20px; max-height: 260px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
  .fc-messages::-webkit-scrollbar { width: 4px; }
  .fc-messages::-webkit-scrollbar-track { background: transparent; }
  .fc-messages::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 2px; }
  .fc-bubble-ai { background: rgba(11,42,107,0.5); border-radius: 12px; border-bottom-left-radius: 3px; padding: 12px 14px; font-size: 0.8rem; line-height: 1.6; color: #CBD5E1; max-width: 85%; white-space: pre-line; }
  .fc-bubble-user { background: ${NAVY}; border-radius: 12px; border-bottom-right-radius: 3px; padding: 12px 14px; font-size: 0.8rem; line-height: 1.6; color: #fff; max-width: 85%; align-self: flex-end; }
  .fc-row { display: flex; }
  .fc-row.user { justify-content: flex-end; }
  .fc-input-row { padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.07); display: flex; gap: 10px; }
  .fc-input {
    flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; padding: 12px 14px; color: #fff; font-size: 0.85rem;
    font-family: 'Poppins', sans-serif; outline: none; transition: border-color 0.2s;
  }
  .fc-input:focus { border-color: ${ORANGE}; }
  .fc-input::placeholder { color: #4B5563; }
  .fc-send {
    padding: 12px 20px; background: ${ORANGE}; color: #fff; font-weight: 700;
    border: none; border-radius: 10px; cursor: pointer; font-size: 0.85rem;
    font-family: 'Poppins', sans-serif; transition: opacity 0.2s;
  }
  .fc-send:hover { opacity: 0.88; }

  .typing-indicator { display: flex; gap: 4px; padding: 10px 14px; background: rgba(11,42,107,0.5); border-radius: 12px; border-bottom-left-radius: 3px; width: fit-content; }
  .typing-dot { width: 7px; height: 7px; border-radius: 50%; background: #64748B; animation: typingBounce 1.2s infinite; }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
`;

const now = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

export default function BreakdownPage() {
  const [sosState, setSosState] = useState("idle"); // idle | sending | active
  const [checkedSteps, setCheckedSteps] = useState([]);
  const [diagText, setDiagText] = useState("");
  const [fcResponse, setFcResponse] = useState("");
  const [fcLoading, setFcLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, from: "ai", text: FLEET_CHIEF_OPENER }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatTyping, setChatTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatTyping]);

  const handleSOS = () => {
    if (sosState !== "idle") return;
    setSosState("sending");
    setTimeout(() => setSosState("active"), 2000);
  };

  const toggleStep = (i) => {
    setCheckedSteps(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const getReply = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("tire") || lower.includes("blowout") || lower.includes("flat")) return FLEET_CHIEF_REPLIES.tire;
    if (lower.includes("engine") || lower.includes("oil") || lower.includes("overheat") || lower.includes("check engine")) return FLEET_CHIEF_REPLIES.engine;
    if (lower.includes("brake") || lower.includes("brakes") || lower.includes("stopping")) return FLEET_CHIEF_REPLIES.brake;
    return FLEET_CHIEF_REPLIES.default;
  };

  const askFleetChief = () => {
    if (!diagText.trim()) return;
    setFcLoading(true);
    setTimeout(() => {
      setFcResponse(getReply(diagText));
      setFcLoading(false);
    }, 1800);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = { id: Date.now(), from: "user", text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatTyping(true);
    const reply = getReply(chatInput);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { id: Date.now() + 1, from: "ai", text: reply }]);
      setChatTyping(false);
    }, 1800);
  };

  const sosBtnText = {
    idle: "🆘 I'M BROKEN DOWN — GET HELP NOW",
    sending: "📡 SENDING YOUR LOCATION...",
    active: "✅ HELP IS ON THE WAY",
  };

  return (
    <>
      <style>{styles}</style>
      <div className="breakdown-wrap">
        {/* NAV */}
        <nav className="breakdown-nav">
          <div className="nav-brand">
            🆘 Breakdown SOS
            <span className="nav-sos-badge">EMERGENCY</span>
          </div>
          <div className="nav-links">
            <a href="/dispatch">Dispatch</a>
            <a href="/command">Command</a>
            <a href="/#pricing" style={{ background: '#FFB400', color: '#06090F', padding: '6px 14px', borderRadius: 7, fontWeight: 800 }}>Free Trial</a>
            <a href="/" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>← Back</a>
          </div>
        </nav>

        <div className="breakdown-content">
          {/* HERO */}
          <div className="hero-section">
            <span className="hero-icon">🆘</span>
            <div className="hero-title">Breakdown SOS</div>
            <div className="hero-sub">Stay calm. Follow the steps below. Help is available 24/7.</div>
          </div>

          {/* STEP 1 — SOS BUTTON */}
          <div className="sos-section">
            <button
              className={`sos-btn ${sosState}`}
              onClick={handleSOS}
              disabled={sosState === "sending"}
            >
              {sosBtnText[sosState]}
            </button>
          </div>

          {/* STATUS CARD — shown after activation */}
          {sosState === "active" && (
            <div className="status-card">
              <div className="status-header">
                <span style={{ fontSize: "1.4rem" }}>📡</span>
                <div className="status-title">SOS ACTIVATED — HELP IS ON THE WAY</div>
              </div>

              <div className="location-badge">
                <div className="location-label">Your Location</div>
                I-40 EB · Mile Marker 218 · Near Amarillo, TX
              </div>

              <div className="status-checks">
                <div className="status-check">✅ DISPATCH NOTIFIED</div>
                <div className="status-check">✅ ROADSIDE ASSISTANCE CONTACTED</div>
              </div>

              <div className="eta-badge">
                <div className="eta-label">Estimated Arrival</div>
                <div className="eta-val">45–60 minutes</div>
              </div>

              <div className="diagnosis-section">
                <div className="diagnosis-label">Fleet Chief AI Diagnosis</div>
                <textarea
                  className="diagnosis-textarea"
                  placeholder="Describe what happened: engine light on, tire blowout, brakes not working..."
                  value={diagText}
                  onChange={e => setDiagText(e.target.value)}
                />
                <button className="ask-fc-btn" onClick={askFleetChief} disabled={fcLoading}>
                  {fcLoading ? "Analyzing..." : "Ask Fleet Chief →"}
                </button>
                {fcResponse && (
                  <div className="fc-response">
                    <div className="fc-label">🤖 Fleet Chief Says</div>
                    {fcResponse}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WHAT TO DO RIGHT NOW */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-title">📋 What To Do Right Now</div>
            <div className="action-steps">
              {ACTION_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`action-step ${step.priority}`}
                  onClick={() => toggleStep(i)}
                >
                  <div className="action-icon">{step.icon}</div>
                  <div className="action-text">{step.text}</div>
                  <div className={`action-check${checkedSteps.includes(i) ? " done" : ""}`}>
                    {checkedSteps.includes(i) ? "✓" : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK CONTACTS */}
          <div style={{ marginBottom: 32 }}>
            <div className="section-title">📞 Quick Contacts</div>
            <div className="contacts-grid">
              {CONTACTS.map((c, i) => (
                <a key={i} href={`tel:${c.number.replace(/\D/g, "")}`} className="contact-card" style={{ borderLeft: `4px solid ${c.color}` }}>
                  <div className="contact-icon">{c.icon}</div>
                  <div className="contact-label">{c.label}</div>
                  <div className="contact-number" style={{ color: c.color }}>{c.number}</div>
                  <div className="contact-tap-hint">Tap to call</div>
                </a>
              ))}
            </div>
          </div>

          {/* FLEET CHIEF AI CHAT */}
          <div style={{ marginBottom: 20 }}>
            <div className="section-title">🤖 Fleet Chief AI</div>
            <div className="fc-chat">
              <div className="fc-chat-header">
                <div className="fc-avatar">🤖</div>
                <div>
                  <div className="fc-name">Fleet Chief</div>
                  <div className="fc-status">Online — monitoring your truck</div>
                </div>
              </div>

              <div className="fc-messages">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`fc-row${msg.from === "user" ? " user" : ""}`}>
                    <div className={msg.from === "ai" ? "fc-bubble-ai" : "fc-bubble-user"}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatTyping && (
                  <div className="fc-row">
                    <div className="typing-indicator">
                      <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="fc-input-row">
                <input
                  className="fc-input"
                  placeholder="Describe what happened..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendChat()}
                />
                <button className="fc-send" onClick={sendChat}>Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
