import { useState, useRef, useEffect } from "react";
import { askAgentStream } from "./services/OpenAIService";

const NAVY  = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER  = "#FFB400";
const GREEN  = "#16A34A";
const DARK   = "#06090F";

// Road Agent responses are generated server-side through the existing AI Gateway.
// The client never receives an AI provider credential.

// ─── Helpers ─────────────────────────────────────────────────────────────────
function useInView(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true); }, { threshold: 0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return seen;
}
function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  return (
    <div ref={ref} style={{ opacity: seen ? 1 : 0, transform: seen ? "translateY(0)" : "translateY(22px)", transition: `opacity 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

function formatMessage(text) {
  text = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Bullets
  const lines = text.split('\n');
  const result = [];
  let inList = false;
  for (let line of lines) {
    if (line.trim().startsWith('•') || line.trim().startsWith('🏆') || line.trim().startsWith('⛽') || line.trim().startsWith('🎓') || line.trim().startsWith('💰') || line.trim().startsWith('📊') || line.trim().startsWith('🛡️') || line.trim().startsWith('💰') || line.trim().startsWith('🚛') || line.trim().startsWith('📣') || line.trim().startsWith('🤝') || line.trim().startsWith('✍️') || line.trim().startsWith('🚀') || line.trim().startsWith('🗺️')) {
      result.push(`<div style="display:flex;gap:8px;margin:5px 0;"><span style="flex-shrink:0">${line.trim().charAt(0)}</span><span>${line.trim().slice(1).trim()}</span></div>`);
    } else if (line.trim().startsWith('>')) {
      result.push(`<blockquote style="border-left:3px solid #FFB400;padding-left:14px;margin:12px 0;color:rgba(255,255,255,0.9);font-style:italic;">${line.trim().slice(1).trim()}</blockquote>`);
    } else if (line.trim().startsWith('|')) {
      result.push(`<code style="display:block;font-family:'DM Mono',monospace;font-size:11px;color:rgba(255,255,255,0.7);margin:2px 0;">${line}</code>`);
    } else if (line.trim() === '') {
      result.push('<div style="height:8px"></div>');
    } else {
      result.push(`<div style="margin:3px 0;">${line}</div>`);
    }
  }
  return result.join('');
}

// ─── Suggested prompts ───────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: "🗺️", label: "How big is this market?" },
  { icon: "📣", label: "Where do I find owner-operators?" },
  { icon: "🤝", label: "Best partnerships to pursue?" },
  { icon: "✍️", label: "Write me a pitch for drivers" },
  { icon: "🚀", label: "Build me a launch plan" },
  { icon: "💰", label: "How do I sell the price?" },
  { icon: "⚔️", label: "How do we beat Motive?" },
  { icon: "📱", label: "Content strategy for TikTok" },
];

export default function RoadAgentPage() {
  const [messages, setMessages] = useState([
    {
      role: "agent",
      text: `Welcome. I'm **Road Agent** — your logistics and growth strategist for the trucking app market.\n\nI know this industry cold: 3.5M drivers, 500K owner-operators, $875B in freight, and every platform competing for their attention. I know what messaging cuts through, which channels convert, and exactly where TruckWithEase has a genuine competitive edge.\n\n**Ask me anything about reaching your market.** Or pick one of the quick topics below to get started.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function send(text) {
    const q = (text || input).trim();
    if (!q || typing) return;
    setInput("");
    setMessages((current) => [...current, { role: "user", text: q }]);
    setTyping(true);
    let responseStarted = false;
    try {
      const result = await askAgentStream("Road Agent", q, (chunk) => {
        setMessages((current) => {
          if (!responseStarted) {
            responseStarted = true;
            return [...current, { role: "agent", text: chunk }];
          }
          const updated = [...current];
          updated[updated.length - 1] = { ...updated[updated.length - 1], text: updated[updated.length - 1].text + chunk };
          return updated;
        });
      });
      if (!responseStarted) setMessages((current) => [...current, { role: "agent", text: result.text || "Road Agent returned an empty response. Nothing was generated." }]);
    } finally {
      setTyping(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: DARK, minHeight: "100vh", display: "flex", flexDirection: "column", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${DARK}; }
        ::-webkit-scrollbar-thumb { background: #1E3050; border-radius: 2px; }
        .ra-sugg { transition: all 0.18s; border: 1px solid rgba(255,180,0,0.18); }
        .ra-sugg:hover { background: rgba(255,180,0,0.1) !important; border-color: rgba(255,180,0,0.5) !important; transform: translateY(-2px); }
        .ra-send { transition: all 0.18s; }
        .ra-send:hover { background: #D97F00 !important; }
        .ra-nav-link { transition: color 0.2s; }
        .ra-nav-link:hover { color: ${AMBER} !important; }
        @keyframes raTyping {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-6px); opacity: 1; }
        }
        .ra-dot { animation: raTyping 1.2s ease-in-out infinite; }
        .ra-dot:nth-child(2) { animation-delay: 0.15s; }
        .ra-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes raFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ra-msg { animation: raFadeUp 0.35s cubic-bezier(.22,1,.36,1) both; }
        @keyframes raGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(255,180,0,0.2); }
          50%       { box-shadow: 0 0 40px rgba(255,180,0,0.45); }
        }
        .ra-avatar { animation: raGlow 3s ease-in-out infinite; }
        @media (max-width: 767px) {
          .ra-nav-links { display: none !important; }
          .ra-sugg-grid { grid-template-columns: 1fr 1fr !important; }
          .ra-stats { gap: 20px !important; }
        }
      `}</style>

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(6,9,15,0.96)", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(255,180,0,0.1)", padding: "0 5%", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/static/truckwithease-icon.png" alt="" style={{ width: 30, height: 30, borderRadius: 7, objectFit: "cover" }} />
          <span style={{ fontWeight: 900, fontSize: 15, color: "white" }}>TruckWith<span style={{ color: AMBER }}>Ease</span></span>
        </a>
        <div className="ra-nav-links" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,180,0,0.08)", border: "1px solid rgba(255,180,0,0.2)", borderRadius: 20, padding: "6px 14px" }}>
            <span style={{ fontSize: 16 }}>🛣️</span>
            <span style={{ color: AMBER, fontWeight: 700, fontSize: 13 }}>Road Agent</span>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
          </div>
          <a href="/" className="ra-nav-link" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none", marginLeft: 8 }}>← Back to site</a>
        </div>
      </nav>

      {/* ── HERO STRIP ───────────────────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY2} 0%, #0A1830 50%, ${DARK} 100%)`, borderBottom: "1px solid rgba(255,180,0,0.08)", padding: "40px 5% 36px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,180,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,180,0,0.025) 1px, transparent 1px)", backgroundSize: "44px 44px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,0,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              {/* Avatar */}
              <div className="ra-avatar" style={{ width: 72, height: 72, borderRadius: 18, background: `linear-gradient(135deg, ${NAVY}, #0D3060)`, border: `2px solid rgba(255,180,0,0.35)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>🛣️</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <h1 style={{ color: "white", fontWeight: 900, fontSize: "clamp(1.5rem,3vw,2.2rem)", letterSpacing: -0.5 }}>Road Agent</h1>
                  <span style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ADE80", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>● Online</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.6 }}>
                  Logistics pro + trucking market specialist. Knows your drivers, your competition, and exactly how to put TruckWithEase in front of the right people.
                </p>
              </div>
              {/* Quick stats */}
              <div className="ra-stats" style={{ display: "flex", gap: 32, flexShrink: 0 }}>
                {[["$875B","US Trucking Market"],["500K+","Owner-Operators"],["3.5M+","Active Drivers"]].map(([v,l]) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ color: AMBER, fontWeight: 900, fontSize: 18, fontFamily: "'DM Mono', monospace" }}>{v}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* ── CHAT AREA ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 900, width: "100%", margin: "0 auto", padding: "0 5%", paddingBottom: 0 }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 0 20px" }}>
          {messages.map((msg, i) => (
            <div key={i} className="ra-msg" style={{ display: "flex", gap: 14, marginBottom: 22, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.role === "agent" && (
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${NAVY}, #0D3060)`, border: "1px solid rgba(255,180,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, marginTop: 2 }}>🛣️</div>
              )}
              <div style={{ maxWidth: "82%", background: msg.role === "agent" ? "#0C1628" : `linear-gradient(135deg, ${NAVY}, #0D3060)`, border: msg.role === "agent" ? "1px solid rgba(255,255,255,0.07)" : `1px solid rgba(255,180,0,0.2)`, borderRadius: msg.role === "agent" ? "4px 16px 16px 16px" : "16px 4px 16px 16px", padding: "14px 18px", color: "rgba(255,255,255,0.88)", fontSize: 14, lineHeight: 1.75 }}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
              />
              {msg.role === "user" && (
                <div style={{ width: 38, height: 38, borderRadius: 10, background: AMBER, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, marginTop: 2, color: DARK, fontWeight: 900 }}>U</div>
              )}
            </div>
          ))}
          {typing && (
            <div className="ra-msg" style={{ display: "flex", gap: 14, marginBottom: 22 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${NAVY}, #0D3060)`, border: "1px solid rgba(255,180,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🛣️</div>
              <div style={{ background: "#0C1628", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px 16px 16px 16px", padding: "16px 20px", display: "flex", gap: 6, alignItems: "center" }}>
                {[0,1,2].map(i => <div key={i} className="ra-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: AMBER, opacity: 0.4 }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions — show only before first user message */}
        {messages.filter(m => m.role === "user").length === 0 && (
          <FadeIn delay={200}>
            <div className="ra-sugg-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
              {SUGGESTIONS.map(s => (
                <button key={s.label} className="ra-sugg"
                  onClick={() => send(s.label)}
                  style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px", cursor: "pointer", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, fontFamily: "'Poppins', sans-serif", display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{s.icon}</span>
                  <span style={{ lineHeight: 1.4 }}>{s.label}</span>
                </button>
              ))}
            </div>
          </FadeIn>
        )}

        {/* Input bar */}
        <div style={{ padding: "16px 0 24px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea ref={inputRef} rows={1} value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
              onKeyDown={handleKey}
              placeholder="Ask Road Agent anything about reaching the trucking market…"
              style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "13px 16px", color: "white", fontSize: 14, fontFamily: "'Poppins', sans-serif", outline: "none", resize: "none", lineHeight: 1.5, minHeight: 48, maxHeight: 120, overflowY: "auto", transition: "border-color 0.2s" }}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(255,180,0,0.4)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
            <button onClick={() => send()} className="ra-send" disabled={!input.trim() || typing}
              style={{ width: 48, height: 48, borderRadius: 12, background: input.trim() && !typing ? AMBER : "rgba(255,255,255,0.08)", border: "none", cursor: input.trim() && !typing ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, transition: "all 0.18s" }}>
              <span style={{ color: input.trim() && !typing ? DARK : "rgba(255,255,255,0.3)", fontWeight: 900 }}>↑</span>
            </button>
          </div>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 8, textAlign: "center" }}>
            Road Agent knows the US trucking market, owner-operator behavior, competitor landscape, and growth strategy for TruckWithEase.
          </p>
        </div>
      </div>
    </div>
  );
}
