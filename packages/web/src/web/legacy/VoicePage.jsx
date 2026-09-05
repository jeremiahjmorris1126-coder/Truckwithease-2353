import { useState, useRef, useEffect } from "react";

const NAVY  = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE= "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const DARK  = "#06090F";

const COMMANDS = [
  { icon: "⏱️", category: "HOS",      phrase: "Log me as driving",          action: "Duty status changed to Driving ✓",                desc: "Change your HOS status hands-free" },
  { icon: "⏱️", category: "HOS",      phrase: "Take a break",                action: "Duty status changed to On Break ✓",               desc: "Start your 30-minute break" },
  { icon: "🔍", category: "DVIR",     phrase: "Start pre-trip inspection",   action: "Opening Pre-Trip DVIR ✓",                        desc: "Launch the DVIR checklist" },
  { icon: "🔍", category: "DVIR",     phrase: "Log brake defect",            action: "Brakes flagged as defect in DVIR ✓",             desc: "Flag a specific defect item" },
  { icon: "📡", category: "Dispatch", phrase: "Tell dispatch I'm 30 out",    action: 'Message sent: "ETA 30 minutes" ✓',               desc: "Send a quick status to dispatch" },
  { icon: "📡", category: "Dispatch", phrase: "I'm at the dock",             action: 'Message sent: "Arrived at dock" + Detention timer started ✓', desc: "Alert dispatch + start detention clock" },
  { icon: "⛽", category: "Fuel",     phrase: "Find fuel near me",           action: "Opening Fuel Finder — 3 stops nearby ✓",         desc: "Pull up nearby fuel stops" },
  { icon: "🗺️", category: "Navigation","phrase": "How much drive time do I have", action: "You have 3h 42m of drive time remaining ✓",   desc: "Get your current HOS status" },
  { icon: "🆘", category: "Emergency", phrase: "I've broken down",           action: "Breakdown SOS activated — dispatching help ✓",   desc: "Trigger emergency response" },
  { icon: "💰", category: "Finance",  phrase: "What did I make today",       action: "Today's gross: $1,240. Net after fuel: $988 ✓",   desc: "Quick earnings check via Traxes" },
];

function useInView(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true); }, { threshold: 0.04 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return seen;
}
function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  return (
    <div ref={ref} style={{ opacity: seen ? 1 : 0, transform: seen ? "translateY(0)" : "translateY(14px)", transition: `opacity 0.5s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.5s cubic-bezier(.22,1,.36,1) ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

export default function VoicePage() {
  const [listening, setListening]   = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse]     = useState(null);
  const [filter, setFilter]         = useState("All");
  const [signedIn, setSignedIn]     = useState(false);
  const [error, setError]           = useState(null);

  const categories = ["All", ...new Set(COMMANDS.map(c => c.category))];

  async function tryCommand(cmd) {
    setListening(true); setTranscript(cmd.phrase); setResponse(null);
    try {
      const response = await fetch("/api/voice/execute", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript: cmd.phrase, driverId: "drv-1" }) });
      const body = await response.json();
      setResponse(body.message || body.error || `Command failed (${response.status}).`);
    } catch (error) { setResponse(error instanceof Error ? error.message : "Command unavailable."); }
    finally { setListening(false); }
  }

  function simulate() { tryCommand(COMMANDS[0]); }

  function simulate() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return runCommand("Log me as driving");
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.onstart = () => { setListening(true); setTranscript(""); setResponse(null); setError(null); };
    recognition.onresult = (event) => {
      const phrase = Array.from(event.results).map((result) => result[0].transcript).join(" ").trim();
      setTranscript(phrase);
      if (event.results[event.results.length - 1].isFinal) runCommand(phrase);
    };
    recognition.onerror = () => { setListening(false); setError("Voice recognition failed. Select a command below or try again."); };
    recognition.start();
  }

  function tryCommand(cmd) { runCommand(cmd.phrase); }

  const filtered = filter === "All" ? COMMANDS : COMMANDS.filter(c => c.category === filter);
  const catColors = { HOS:"#60A5FA", DVIR:"#34D399", Dispatch:"#FB923C", Fuel:"#FBBF24", Navigation:"#38BDF8", Emergency:"#F87171", Finance:"#A3E635" };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: NAVY2, minHeight: "100vh", color: "white" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes voicePulse { 0%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,107,0,0.5)} 70%{transform:scale(1.05);box-shadow:0 0 0 20px rgba(255,107,0,0)} 100%{transform:scale(1)} }
        .vc-pulse { animation: voicePulse 1.2s ease-in-out infinite; }
        @keyframes vcWave { 0%,100%{height:8px} 50%{height:28px} }
        .vc-bar { animation: vcWave var(--d) ease-in-out infinite alternate; }
        .vc-cmd { transition: all 0.18s; cursor: pointer; }
        .vc-cmd:hover { background: rgba(255,255,255,0.12) !important; transform: translateY(-2px); }
        .vc-cat { transition: all 0.15s; cursor: pointer; }
        .vc-cat.active { background: ${AMBER} !important; color: ${DARK} !important; }
        @media(max-width:900px){.vc-nav-links{display:none!important;}.vc-grid{grid-template-columns:1fr!important;}}
      `}</style>

      <nav style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 5%", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/static/truckwithease-icon.png" alt="" style={{ width: 28, height: 28, borderRadius: 7, objectFit: "cover" }} />
          </a>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)" }} />
          <div style={{ color: "white", fontWeight: 800, fontSize: 14 }}>🎤 Voice Commands</div>
        </div>
        <div className="vc-nav-links" style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <a href="/command" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, textDecoration: "none" }}>🎯 Command Center</a>
          <a href="/#pricing" style={{ background: AMBER, color: DARK, padding: "7px 16px", borderRadius: 7, fontWeight: 800, fontSize: 13, textDecoration: "none" }}>Free Trial</a>
          <a href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textDecoration: "none" }}>← Back</a>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 5% 64px" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ color: AMBER, fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Hands-Free Operation</div>
            <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: 14 }}>Your eyes on the road.<br /><span style={{ color: AMBER }}>Your voice on the app.</span></h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, maxWidth: 540, margin: "0 auto" }}>Just talk. TruckWithEase understands what you need — whether it's logging HOS, alerting dispatch, or calling for help.</p>
          </div>
        </FadeIn>

        {/* Main mic button */}
        <FadeIn delay={40}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 48 }}>
            <button onClick={simulate} className={listening ? "vc-pulse" : ""}
              style={{ width: 100, height: 100, borderRadius: "50%", background: listening ? ORANGE : `linear-gradient(135deg, ${NAVY}, ${ORANGE})`, border: "4px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, cursor: "pointer", outline: "none" }}>
              🎤
            </button>
            {listening && (
              <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 36, marginTop: 16 }}>
                {[0.8,1.2,0.6,1.4,0.9,1.1,0.7].map((d,i)=>(
                  <div key={i} className="vc-bar" style={{ width:6, background:AMBER, borderRadius:3, "--d":`${d}s` }} />
                ))}
              </div>
            )}
            {transcript && <div style={{ marginTop: 12, color: "rgba(255,255,255,0.7)", fontSize: 15, fontStyle: "italic" }}>"{transcript}"</div>}
            {response && (
              <div style={{ marginTop: 12, background: "rgba(22,163,74,0.15)", border: "1px solid rgba(22,163,74,0.3)", borderRadius: 10, padding: "10px 20px", color: GREEN, fontWeight: 700, fontSize: 14 }}>
                ✓ {response}
              </div>
            )}
            {error && <div style={{ marginTop: 12, color: "#FCA5A5", fontSize: 13 }}>{error}</div>}
            {!listening && !response && !error && <div style={{ marginTop: 12, color: "rgba(255,255,255,0.35)", fontSize: 13 }}>{signedIn ? "Tap to speak or select a command" : "Sign in to run voice commands"}</div>}
          </div>
        </FadeIn>

        {/* Category filter */}
        <FadeIn delay={60}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} className={`vc-cat${filter===cat?" active":""}`}
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", fontFamily: "'Poppins',sans-serif", cursor: "pointer" }}>
                {cat}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Command grid */}
        <FadeIn delay={70}>
          <div className="vc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 12 }}>
            {filtered.map((cmd,i) => (
              <div key={i} className="vc-cmd" onClick={() => tryCommand(cmd)}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{cmd.icon}</span>
                  <span style={{ background: `${catColors[cmd.category] || AMBER}18`, color: catColors[cmd.category] || AMBER, fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, letterSpacing: 1 }}>{cmd.category.toUpperCase()}</span>
                </div>
                <div style={{ color: AMBER, fontWeight: 700, fontSize: 15, marginBottom: 4, fontStyle: "italic" }}>"{cmd.phrase}"</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{cmd.desc}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={90} style={{ marginTop: 48, textAlign: "center" }}>
          <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "28px 24px", maxWidth: 560, margin: "0 auto" }}>
            <div style={{ color: "white", fontWeight: 800, fontSize: 16, marginBottom: 8 }}>Voice commands included with every plan.</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 20 }}>All plans · Priority voice response on Pro and Fleet.</div>
            <a href="/#pricing" style={{ display: "inline-block", background: ORANGE, color: "white", padding: "12px 32px", borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: "none" }}>Start 14-Day Free Trial</a>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
