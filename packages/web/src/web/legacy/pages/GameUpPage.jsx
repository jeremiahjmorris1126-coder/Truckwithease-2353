import { useState, useEffect, useRef } from "react";
import PocketBase from "pocketbase";
const pb = new PocketBase();

const C = {
  bg: "#05030f",
  card: "#0d0820",
  purple: "#A855F7",
  purpleGlow: "rgba(168,85,247,0.4)",
  gold: "#F59E0B",
  green: "#10B981",
  blue: "#60A5FA",
  red: "#EF4444",
  text: "#F1F0FF",
  muted: "#6B7280",
  border: "rgba(168,85,247,0.2)",
};

const MODULES = [
  { id: 1, icon: "⏱️", title: "Hours of Service", sub: "FMCSA HOS Rules", levels: 5, xp: 500, color: "#F59E0B", desc: "Master the 11-hour driving rule, 14-hour window, 30-minute break, 60/70-hour limits, and sleeper berth splits.", questions: 42 },
  { id: 2, icon: "🔍", title: "Pre-Trip Inspection", sub: "DVIR Mastery", levels: 4, xp: 400, color: "#10B981", desc: "Learn every inspection point — brakes, tires, lights, coupling, cargo securement — and pass every DOT pre-trip.", questions: 38 },
  { id: 3, icon: "☢️", title: "Hazmat Handling", sub: "Placarding & Safety", levels: 6, xp: 600, color: "#EF4444", desc: "Classes 1-9, placarding requirements, shipping papers, emergency response, and route restrictions.", questions: 55 },
  { id: 4, icon: "🚔", title: "DOT Inspection Prep", sub: "Roadside Ready", levels: 5, xp: 500, color: "#60A5FA", desc: "Level 1-6 inspections, what inspectors look for, your rights, CSA scoring, and out-of-service criteria.", questions: 47 },
  { id: 5, icon: "🌧️", title: "Defensive Driving", sub: "Weather & Hazards", levels: 4, xp: 400, color: "#A855F7", desc: "Black ice, hydroplaning, high winds, fog, mountain grades, and emergency maneuver techniques.", questions: 35 },
  { id: 6, icon: "⚖️", title: "Load Securement", sub: "Weight & Balance", levels: 4, xp: 400, color: "#F97316", desc: "WLL calculations, tie-down angles, blocking and bracing, flatbed requirements, and oversize/overweight rules.", questions: 33 },
  { id: 7, icon: "📱", title: "ELD Operation", sub: "Electronic Logging", levels: 3, xp: 300, color: "#06B6D4", desc: "Duty status changes, unassigned driving, malfunctions, driver edits, and roadside transfer procedures.", questions: 28 },
  { id: 8, icon: "🚨", title: "Accident Reporting", sub: "Scene Management", levels: 3, xp: 300, color: "#EC4899", desc: "First responder steps, DOT recordable accidents, insurance notification, driver statement, and post-accident testing.", questions: 24 },
  { id: 9, icon: "💊", title: "Drug & Alcohol", sub: "Compliance & Testing", levels: 3, xp: 300, color: "#84CC16", desc: "DOT testing types, clearinghouse registration, return-to-duty process, and supervisor reasonable suspicion.", questions: 26 },
  { id: 10, icon: "🔄", title: "Backing & Maneuvering", sub: "Advanced Skills", levels: 5, xp: 500, color: "#F59E0B", desc: "Straight-line backing, offset backing, parallel parking, alley dock, and tight turn techniques.", questions: 40 },
];

const SAMPLE_QUESTIONS = {
  1: [
    { q: "A property-carrying driver may drive a maximum of how many hours after coming on duty?", opts: ["10 hours", "11 hours", "12 hours", "14 hours"], ans: 1, exp: "Property-carrying CMV drivers may drive a maximum of 11 hours after coming off duty for 10 consecutive hours." },
    { q: "What is the maximum on-duty window under the 14-hour rule?", opts: ["12 hours", "13 hours", "14 hours", "16 hours"], ans: 2, exp: "Once you come on duty, you have a 14-consecutive-hour window in which you may drive up to 11 hours." },
    { q: "How long must a 30-minute break be taken after 8 cumulative hours of driving?", opts:["15 minutes", "20 minutes", "30 minutes", "45 minutes"], ans: 2, exp: "Drivers must take a 30-minute break when 8 cumulative hours have passed since the last off-duty or sleeper berth period of at least 30 minutes." },
    { q: "Under the 60/70-hour rule, a driver using the 7-consecutive-day cycle must not exceed:", opts: ["60 hours in 7 days", "70 hours in 7 days", "60 hours in 8 days", "70 hours in 8 days"], ans: 0, exp: "The 7-day cycle limits drivers to 60 on-duty hours in any 7 consecutive days." },
  ],
  2: [
    { q: "During a pre-trip inspection, which brake component should you check for cracks or missing parts?", opts: ["Brake drums", "Slack adjusters", "S-cam", "All of the above"], ans: 3, exp: "All brake components — drums, slack adjusters, and S-cams — must be inspected for cracks, missing parts, or improper adjustment." },
    { q: "What is the minimum tread depth required for front tires on a commercial vehicle?", opts: ["2/32 inch", "4/32 inch", "6/32 inch", "8/32 inch"], ans: 1, exp: "Front tires must have at least 4/32 inch tread depth. Other tires require at least 2/32 inch." },
  ],
  3: [
    { q: "Which hazmat class covers flammable liquids?", opts: ["Class 2", "Class 3", "Class 4", "Class 5"], ans: 1, exp: "Class 3 covers flammable liquids such as gasoline, diesel fuel, and ethanol." },
    { q: "When must hazmat shipping papers be within reach of the driver?", opts: ["In the cab at all times", "Only during transport", "When crossing state lines", "All of the above"], ans: 0, exp: "Hazmat shipping papers must be within reach of the driver and visible from outside through the driver's door at all times during transport." },
  ],
};

const BADGES = [
  { id: "first_lesson", icon: "🎯", name: "First Move", desc: "Complete your first lesson" },
  { id: "perfect_score", icon: "💯", name: "Perfect Run", desc: "Score 100% on any quiz" },
  { id: "hos_master", icon: "⏱️", name: "HOS Master", desc: "Complete all HOS levels" },
  { id: "five_modules", icon: "🔥", name: "On Fire", desc: "Complete 5 modules" },
  { id: "streak_7", icon: "⚡", name: "7-Day Streak", desc: "Train 7 days in a row" },
  { id: "top_score", icon: "👑", name: "Road King", desc: "Reach 5,000 XP" },
];

export default function GameUpPage() {
  const [tab, setTab] = useState("home");
  const [activeModule, setActiveModule] = useState(null);
  const [quizState, setQuizState] = useState(null); // null | "intro" | "playing" | "result"
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [completedModules, setCompletedModules] = useState([]);
  const [badges, setBadges] = useState([]);
  const [streak, setStreak] = useState(3);
  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: "Carlos M.", xp: 4820, badge: "👑", fleet: "Swift Transport" },
    { rank: 2, name: "Deja W.", xp: 4210, badge: "🔥", fleet: "Morrishive Fleet" },
    { rank: 3, name: "Ray D.", xp: 3950, badge: "⚡", fleet: "Morrishive Fleet" },
    { rank: 4, name: "Maria S.", xp: 3640, badge: "💯", fleet: "Atlas Logistics" },
    { rank: 5, name: "John M.", xp: 3120, badge: "🎯", fleet: "Prime Inc." },
  ]);
  const [showXpPop, setShowXpPop] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [feedMessages, setFeedMessages] = useState([
    { driver: "Carlos M.", action: "completed Hazmat Level 3", time: "2m ago", xp: 150 },
    { driver: "Deja W.", action: "scored 100% on HOS Quiz", time: "5m ago", xp: 200 },
    { driver: "Ray D.", action: "earned the HOS Master badge", time: "12m ago", xp: 500 },
    { driver: "Maria S.", action: "started ELD Operation", time: "18m ago", xp: 50 },
  ]);

  const hasKey = () => !!sessionStorage.getItem("gameup_api_key");

  const startQuiz = (mod) => {
    setActiveModule(mod);
    setQuizState("intro");
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setAnswers([]);
  };

  const questions = activeModule ? (SAMPLE_QUESTIONS[activeModule.id] || SAMPLE_QUESTIONS[1]) : [];

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === questions[qIndex].ans;
    if (correct) setScore(s => s + 1);
    setAnswers(a => [...a, { correct, selected: idx, correct_ans: questions[qIndex].ans }]);
  };

  const nextQuestion = () => {
    if (qIndex + 1 < questions.length) {
      setQIndex(q => q + 1);
      setSelected(null);
    } else {
      const earned = Math.round((score / questions.length) * activeModule.xp * 0.3);
      setXpEarned(earned);
      setXp(x => x + earned);
      setShowXpPop(true);
      setTimeout(() => setShowXpPop(false), 3000);
      if (!completedModules.includes(activeModule.id)) {
        setCompletedModules(c => [...c, activeModule.id]);
      }
      if (score === questions.length && !badges.includes("perfect_score")) {
        setBadges(b => [...b, "perfect_score"]);
      }
      setQuizState("result");
    }
  };

  const xpToNext = (level + 1) * 500;
  const xpProgress = Math.min((xp % 500) / 500 * 100, 100);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Courier New', monospace" }}>
      {/* Animated bg */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: 2, height: 2,
            background: C.purple,
            borderRadius: "50%",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.3 + Math.random() * 0.4,
            animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }} />
        ))}
        <div style={{ position: "absolute", top: -200, left: -200, width: 600, height: 600, background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -200, right: -200, width: 500, height: 500, background: "radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)", borderRadius: "50%" }} />
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.2;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.5)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes xpPop { 0%{opacity:0;transform:translateY(0) scale(0.5)} 30%{opacity:1;transform:translateY(-30px) scale(1.2)} 70%{opacity:1;transform:translateY(-60px) scale(1)} 100%{opacity:0;transform:translateY(-90px) scale(0.8)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(168,85,247,0.3)} 50%{box-shadow:0 0 40px rgba(168,85,247,0.7)} }
        .mod-card:hover { transform: translateY(-4px); border-color: rgba(168,85,247,0.6) !important; }
        .mod-card { transition: all 0.2s ease; }
        .tab-btn:hover { background: rgba(168,85,247,0.15) !important; }
      `}</style>

      {/* XP Pop */}
      {showXpPop && (
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1000, animation: "xpPop 3s ease forwards", fontSize: 48, fontWeight: 900, color: C.gold, textShadow: `0 0 30px ${C.gold}` }}>
          +{xpEarned} XP
        </div>
      )}

      {/* Header */}
      <div style={{ position: "relative", zIndex: 10, borderBottom: `1px solid ${C.border}`, background: "rgba(5,3,15,0.95)", backdropFilter: "blur(20px)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 16, height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>🎮</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.purple, letterSpacing: 3, textTransform: "uppercase" }}>GAME UP</div>
              <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, textTransform: "uppercase" }}>Driver Training Platform</div>
            </div>
          </div>

          <div style={{ marginLeft: 32, display: "flex", gap: 4 }}>
            {["home", "modules", "quiz", "leaderboard", "badges", "fleet"].map(t => (
              <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{
                background: tab === t ? "rgba(168,85,247,0.2)" : "transparent",
                border: tab === t ? `1px solid ${C.border}` : "1px solid transparent",
                color: tab === t ? C.purple : C.muted,
                borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: 1,
              }}>{t}</button>
            ))}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
            {/* Streak */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, padding: "4px 12px" }}>
              <span>🔥</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.gold }}>{streak} day streak</span>
            </div>
            {/* XP Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.purple }}>LVL {level}</div>
              <div style={{ width: 80, height: 6, background: "rgba(168,85,247,0.2)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${xpProgress}%`, height: "100%", background: C.purple, borderRadius: 3, transition: "width 0.5s ease" }} />
              </div>
              <div style={{ fontSize: 11, color: C.muted }}>{xp} XP</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

        {/* HOME TAB */}
        {tab === "home" && (
          <div style={{ animation: "slideIn 0.4s ease" }}>
            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: C.purple, textTransform: "uppercase", marginBottom: 12 }}>TruckWithEase Exclusive</div>
              <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
                <span style={{ color: C.text }}>Train Like a </span>
                <span style={{ color: C.purple, textShadow: `0 0 30px ${C.purpleGlow}` }}>Pro.</span>
                <br />
                <span style={{ color: C.text }}>Earn Like a </span>
                <span style={{ color: C.gold, textShadow: "0 0 30px rgba(245,158,11,0.4)" }}>Legend.</span>
              </div>
              <div style={{ fontSize: 16, color: C.muted, maxWidth: 500, margin: "0 auto 32px" }}>
                10 modules. 368 live questions. Real FMCSA scenarios. Every completed lesson earns Rig Bucks and XP — automatically.
              </div>
              <button onClick={() => setTab("modules")} style={{
                background: `linear-gradient(135deg, ${C.purple}, #7C3AED)`,
                border: "none", color: "#FFF", borderRadius: 12, padding: "16px 40px",
                fontSize: 16, fontWeight: 900, cursor: "pointer", letterSpacing: 1,
                boxShadow: `0 0 30px ${C.purpleGlow}`, animation: "glow 2s ease-in-out infinite",
              }}>START TRAINING →</button>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
              {[
                { label: "Training Modules", value: "10", icon: "📚", color: C.purple },
                { label: "Total Questions", value: "368", icon: "❓", color: C.blue },
                { label: "XP Available", value: "4,700", icon: "⚡", color: C.gold },
                { label: "Rig Bucks Earnable", value: "2,350", icon: "💰", color: C.green },
              ].map(s => (
                <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Live activity feed */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.purple, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>⚡ Live Training Feed</div>
              {feedMessages.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < feedMessages.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${C.purple}, #7C3AED)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, flexShrink: 0 }}>{f.driver[0]}</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 800, color: C.text }}>{f.driver}</span>
                    <span style={{ color: C.muted }}> {f.action}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.gold, fontWeight: 800 }}>+{f.xp} XP</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{f.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODULES TAB */}
        {tab === "modules" && (
          <div style={{ animation: "slideIn 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: C.text }}>Training Modules</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{completedModules.length} of {MODULES.length} completed · {xp} XP earned</div>
              </div>
              <div style={{ background: "rgba(168,85,247,0.1)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "8px 18px", fontSize: 13, color: C.purple, fontWeight: 700 }}>
                {Math.round(completedModules.length / MODULES.length * 100)}% Complete
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {MODULES.map(mod => {
                const done = completedModules.includes(mod.id);
                return (
                  <div key={mod.id} className="mod-card" style={{
                    background: C.card, border: `1px solid ${done ? mod.color + "44" : C.border}`,
                    borderRadius: 20, padding: 24, cursor: "pointer", position: "relative", overflow: "hidden",
                  }} onClick={() => { setActiveModule(mod); setTab("quiz"); setQuizState("intro"); }}>
                    {done && <div style={{ position: "absolute", top: 12, right: 12, background: mod.color + "22", border: `1px solid ${mod.color}44`, borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 800, color: mod.color }}>COMPLETED ✓</div>}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div style={{ fontSize: 36 }}>{mod.icon}</div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>{mod.title}</div>
                        <div style={{ fontSize: 11, color: mod.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{mod.sub}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>{mod.desc}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: C.muted }}>{mod.questions} questions</span>
                      <span style={{ background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: C.muted }}>{mod.levels} levels</span>
                      <span style={{ background: mod.color + "15", border: `1px solid ${mod.color}33`, borderRadius: 6, padding: "3px 10px", fontSize: 11, color: mod.color, fontWeight: 700 }}>+{mod.xp} XP max</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* QUIZ TAB */}
        {tab === "quiz" && (
          <div style={{ animation: "slideIn 0.4s ease", maxWidth: 700, margin: "0 auto" }}>
            {!activeModule && (
              <div style={{ textAlign: "center", padding: 60 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Pick a Module First</div>
                <div style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>Head to the Modules tab and tap any training module to start your quiz.</div>
                <button onClick={() => setTab("modules")} style={{ background: C.purple, border: "none", color: "#FFF", borderRadius: 10, padding: "12px 28px", fontWeight: 800, cursor: "pointer", fontSize: 14 }}>Browse Modules →</button>
              </div>
            )}

            {activeModule && quizState === "intro" && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>{activeModule.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.text, marginBottom: 8 }}>{activeModule.title}</div>
                <div style={{ fontSize: 14, color: C.muted, marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>{activeModule.desc}</div>
                {/* YouTube Training Video */}
                {sessionStorage.getItem('youtube_api_key') && (
                  <div style={{ marginBottom: 28, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}`, background: C.card }}>
                    <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ color: "#ff0000", fontSize: 18 }}>▶</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Training Video — {activeModule.title}</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: C.muted }}>Powered by YouTube</span>
                    </div>
                    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                      <iframe
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                        src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent("CDL training " + activeModule.title + " FMCSA")}&key=${sessionStorage.getItem('youtube_api_key')}`}
                        allowFullScreen
                        title={`${activeModule.title} Training Video`}
                      />
                    </div>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
                  {[
                    { label: "Questions", value: questions.length },
                    { label: "XP Available", value: `${Math.round(activeModule.xp * 0.3)}` },
                    { label: "Pass Score", value: "70%" },
                  ].map(s => (
                    <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: C.purple }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setQuizState("playing")} style={{
                  background: `linear-gradient(135deg, ${C.purple}, #7C3AED)`,
                  border: "none", color: "#FFF", borderRadius: 12, padding: "16px 48px",
                  fontSize: 18, fontWeight: 900, cursor: "pointer", letterSpacing: 1,
                  boxShadow: `0 0 30px ${C.purpleGlow}`,
                }}>START QUIZ ▶</button>
              </div>
            )}

            {activeModule && quizState === "playing" && questions[qIndex] && (
              <div>
                {/* Progress */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                  <div style={{ fontSize: 13, color: C.muted, fontWeight: 700 }}>Question {qIndex + 1} of {questions.length}</div>
                  <div style={{ flex: 1, height: 6, background: "rgba(168,85,247,0.2)", borderRadius: 3 }}>
                    <div style={{ width: `${(qIndex / questions.length) * 100}%`, height: "100%", background: C.purple, borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                  <div style={{ fontSize: 13, color: C.gold, fontWeight: 700 }}>Score: {score}/{qIndex}</div>
                </div>

                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, marginBottom: 20 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.text, lineHeight: 1.5, marginBottom: 28 }}>{questions[qIndex].q}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {questions[qIndex].opts.map((opt, i) => {
                      let bg = "rgba(255,255,255,0.04)";
                      let border = C.border;
                      let color = C.text;
                      if (selected !== null) {
                        if (i === questions[qIndex].ans) { bg = "rgba(16,185,129,0.15)"; border = "#10B981"; color = "#10B981"; }
                        else if (i === selected && i !== questions[qIndex].ans) { bg = "rgba(239,68,68,0.15)"; border = "#EF4444"; color = "#EF4444"; }
                      }
                      return (
                        <button key={i} onClick={() => handleAnswer(i)} style={{
                          background: bg, border: `1px solid ${border}`, borderRadius: 12,
                          padding: "14px 20px", color, fontSize: 14, fontWeight: 600,
                          textAlign: "left", cursor: selected === null ? "pointer" : "default",
                          transition: "all 0.2s",
                        }}>
                          <span style={{ fontWeight: 900, marginRight: 10, color: C.purple }}>{"ABCD"[i]}.</span> {opt}
                        </button>
                      );
                    })}
                  </div>
                  {selected !== null && (
                    <div style={{ marginTop: 20, padding: 16, background: "rgba(168,85,247,0.08)", border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                      <span style={{ fontWeight: 800, color: C.purple }}>💡 Explanation: </span>{questions[qIndex].exp}
                    </div>
                  )}
                </div>
                {selected !== null && (
                  <button onClick={nextQuestion} style={{ width: "100%", background: C.purple, border: "none", color: "#FFF", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 900, cursor: "pointer" }}>
                    {qIndex + 1 < questions.length ? "NEXT QUESTION →" : "SEE RESULTS →"}
                  </button>
                )}
              </div>
            )}

            {activeModule && quizState === "result" && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>{score === questions.length ? "🏆" : score >= questions.length * 0.7 ? "✅" : "📚"}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: score >= questions.length * 0.7 ? C.green : C.red, marginBottom: 8 }}>
                  {Math.round(score / questions.length * 100)}%
                </div>
                <div style={{ fontSize: 16, color: C.text, marginBottom: 8 }}>{score} of {questions.length} correct</div>
                <div style={{ fontSize: 14, color: C.gold, fontWeight: 800, marginBottom: 32 }}>+{xpEarned} XP earned · +{Math.round(xpEarned / 2)} Rig Bucks</div>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button onClick={() => { setQuizState("intro"); setQIndex(0); setSelected(null); setScore(0); setAnswers([]); }} style={{ background: C.purple, border: "none", color: "#FFF", borderRadius: 10, padding: "12px 28px", fontWeight: 800, cursor: "pointer", fontSize: 14 }}>RETRY MODULE</button>
                  <button onClick={() => setTab("modules")} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.text, borderRadius: 10, padding: "12px 28px", fontWeight: 800, cursor: "pointer", fontSize: 14 }}>ALL MODULES</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {tab === "leaderboard" && (
          <div style={{ animation: "slideIn 0.4s ease", maxWidth: 700, margin: "0 auto" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 8 }}>Top Drivers</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>Ranked by total XP earned across all modules</div>
            {leaderboard.map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 16, padding: 20,
                background: i === 0 ? "rgba(245,158,11,0.08)" : C.card,
                border: `1px solid ${i === 0 ? "rgba(245,158,11,0.3)" : C.border}`,
                borderRadius: 16, marginBottom: 12,
              }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: i === 0 ? C.gold : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : C.muted, width: 32, textAlign: "center" }}>
                  {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${p.rank}`}
                </div>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${C.purple}, #7C3AED)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, flexShrink: 0 }}>{p.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{p.fleet}</div>
                </div>
                <div style={{ fontSize: 24 }}>{p.badge}</div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C.purple }}>{p.xp.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>XP</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BADGES TAB */}
        {tab === "badges" && (
          <div style={{ animation: "slideIn 0.4s ease" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 8 }}>Your Badges</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>{badges.length} of {BADGES.length} earned</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {BADGES.map(b => {
                const earned = badges.includes(b.id);
                return (
                  <div key={b.id} style={{
                    background: earned ? "rgba(168,85,247,0.1)" : C.card,
                    border: `1px solid ${earned ? C.purple : C.border}`,
                    borderRadius: 16, padding: 24, textAlign: "center",
                    opacity: earned ? 1 : 0.5,
                  }}>
                    <div style={{ fontSize: 40, marginBottom: 12, filter: earned ? "none" : "grayscale(1)" }}>{b.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: earned ? C.text : C.muted, marginBottom: 6 }}>{b.name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{b.desc}</div>
                    {earned && <div style={{ marginTop: 10, fontSize: 11, color: C.purple, fontWeight: 700 }}>EARNED ✓</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FLEET TAB */}
        {tab === "fleet" && (
          <div style={{ animation: "slideIn 0.4s ease" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 8 }}>Fleet Training Dashboard</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>Monitor every driver's training progress, certifications, and compliance status</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Drivers Enrolled", value: "3", color: C.purple },
                { label: "Modules Completed", value: "7", color: C.green },
                { label: "Total XP Earned", value: "9,170", color: C.gold },
                { label: "Certifications", value: "2", color: C.blue },
              ].map(s => (
                <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {[
              { name: "Jeremiah Morris", progress: 60, modules: 6, xp: 3800, status: "Active", cert: "HOS Certified" },
              { name: "Kyleigh Morris", progress: 40, modules: 4, xp: 2920, status: "Active", cert: "In Progress" },
              { name: "Bridget Taft", progress: 25, modules: 2, xp: 1450, status: "Active", cert: "In Progress" },
            ].map((d, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${C.purple}, #7C3AED)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, flexShrink: 0 }}>{d.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 6 }}>{d.name}</div>
                  <div style={{ width: "100%", height: 6, background: "rgba(168,85,247,0.2)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${d.progress}%`, height: "100%", background: C.purple, borderRadius: 3 }} />
                  </div>
                </div>
                <div style={{ textAlign: "center", minWidth: 60 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: C.gold }}>{d.xp.toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>XP</div>
                </div>
                <div style={{ textAlign: "center", minWidth: 80 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: d.cert === "HOS Certified" ? C.green : C.muted }}>{d.cert}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{d.modules} modules</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
