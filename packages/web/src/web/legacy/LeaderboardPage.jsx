import { useState, useEffect, useRef } from "react";

const NAVY   = "#0B2A6B";
const ORANGE = "#FF6B00";
const AMBER  = "#FFB400";
const GREEN  = "#16A34A";
const DARK   = "#05080F";

// ─── Helpers ────────────────────────────────────────────────────────────────
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
    <div ref={ref} style={{ opacity: seen ? 1 : 0, transform: seen ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

// Animated live clock
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4ADE80" }}>
      {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} UTC
    </span>
  );
}

// ─── Data ───────────────────────────────────────────────────────────────────
const TIER_META = {
  Diamond: { icon: "👑", color: ORANGE,    bg: "rgba(255,107,0,0.12)" },
  Platinum: { icon: "💎", color: "#60A5FA", bg: "rgba(96,165,250,0.1)" },
  Gold:     { icon: "⭐", color: AMBER,    bg: "rgba(255,180,0,0.1)" },
  Standard: { icon: "🚛", color: "#94A3B8", bg: "rgba(148,163,184,0.08)" },
};

const MONTHLY = [
  { rank: 1,  name: "Ray Davis",       pts: 28420, tier: "Diamond", state: "TX", miles: "148,200", streak: 31, badge: "👑", change: "+3" },
  { rank: 2,  name: "James Miller",    pts: 21880, tier: "Platinum", state: "OK", miles: "112,400", streak: 22, badge: "💎", change: "—" },
  { rank: 3,  name: "Tony Williams",   pts: 18200, tier: "Platinum", state: "MO", miles: "98,700",  streak: 18, badge: "💎", change: "-1" },
  { rank: 4,  name: "Andre Johnson",   pts: 12750, tier: "Gold",     state: "IL", miles: "76,300",  streak: 12, badge: "⭐", change: "+2" },
  { rank: 5,  name: "Derrick Brown",   pts: 9400,  tier: "Gold",     state: "KS", miles: "61,100",  streak: 9,  badge: "⭐", change: "-1" },
  { rank: 6,  name: "Marcus Lee",      pts: 8820,  tier: "Gold",     state: "OH", miles: "58,400",  streak: 7,  badge: "⭐", change: "+4" },
  { rank: 7,  name: "Sandra Reyes",    pts: 7650,  tier: "Gold",     state: "TN", miles: "52,900",  streak: 6,  badge: "⭐", change: "+1" },
  { rank: 8,  name: "Kevin Foster",    pts: 6200,  tier: "Gold",     state: "GA", miles: "44,100",  streak: 4,  badge: "⭐", change: "-2" },
  { rank: 9,  name: "Priya Patel",     pts: 5400,  tier: "Gold",     state: "AZ", miles: "39,800",  streak: 3,  badge: "⭐", change: "NEW" },
  { rank: 10, name: "Tommy Nguyen",    pts: 4900,  tier: "Gold",     state: "CA", miles: "36,500",  streak: 2,  badge: "⭐", change: "+1" },
  { rank: 11, name: "Lisa Monroe",     pts: 3800,  tier: "Standard", state: "WA", miles: "28,200",  streak: 5,  badge: "🚛", change: "NEW" },
  { rank: 12, name: "Carl Hutchins",   pts: 3200,  tier: "Standard", state: "CO", miles: "24,700",  streak: 3,  badge: "🚛", change: "-3" },
  { rank: 13, name: "Denise Walls",    pts: 2900,  tier: "Standard", state: "FL", miles: "22,100",  streak: 2,  badge: "🚛", change: "—" },
  { rank: 14, name: "Elijah Grant",    pts: 2400,  tier: "Standard", state: "NC", miles: "18,900",  streak: 1,  badge: "🚛", change: "+2" },
  { rank: 15, name: "Maria Torres",    pts: 1850,  tier: "Standard", state: "NM", miles: "14,600",  streak: 0,  badge: "🚛", change: "NEW" },
];

const ALL_TIME = [
  { rank: 1,  name: "Ray Davis",       pts: 148420, tier: "Diamond", state: "TX", badge: "👑" },
  { rank: 2,  name: "James Miller",    pts: 121880, tier: "Diamond", state: "OK", badge: "👑" },
  { rank: 3,  name: "Tony Williams",   pts: 98200,  tier: "Diamond", state: "MO", badge: "👑" },
  { rank: 4,  name: "Andre Johnson",   pts: 72750,  tier: "Platinum", state: "IL", badge: "💎" },
  { rank: 5,  name: "Derrick Brown",   pts: 59400,  tier: "Platinum", state: "KS", badge: "💎" },
  { rank: 6,  name: "Marcus Lee",      pts: 48820,  tier: "Platinum", state: "OH", badge: "💎" },
  { rank: 7,  name: "Sandra Reyes",    pts: 37650,  tier: "Platinum", state: "TN", badge: "💎" },
  { rank: 8,  name: "Kevin Foster",    pts: 26200,  tier: "Gold",     state: "GA", badge: "⭐" },
  { rank: 9,  name: "Priya Patel",     pts: 18400,  tier: "Gold",     state: "AZ", badge: "⭐" },
  { rank: 10, name: "Tommy Nguyen",    pts: 14900,  tier: "Gold",     state: "CA", badge: "⭐" },
];

const STATE_LEADERS = [
  { state: "TX", driver: "Ray Davis",      pts: "28,420", tier: "Diamond" },
  { state: "OK", driver: "James Miller",   pts: "21,880", tier: "Platinum" },
  { state: "MO", driver: "Tony Williams",  pts: "18,200", tier: "Platinum" },
  { state: "IL", driver: "Andre Johnson",  pts: "12,750", tier: "Gold" },
  { state: "KS", driver: "Derrick Brown",  pts: "9,400",  tier: "Gold" },
  { state: "OH", driver: "Marcus Lee",     pts: "8,820",  tier: "Gold" },
  { state: "TN", driver: "Sandra Reyes",   pts: "7,650",  tier: "Gold" },
  { state: "GA", driver: "Kevin Foster",   pts: "6,200",  tier: "Gold" },
];

const TOP_EARNERS_THIS_WEEK = [
  { name: "Ray Davis",     earned: 1840, reason: "7-Day Clean Streak × 2 bonus",  icon: "🔥" },
  { name: "Priya Patel",   earned: 950,  reason: "DOT Inspection + 3 DVIRs",     icon: "🛡️" },
  { name: "Marcus Lee",    earned: 875,  reason: "Zero-violation streak",         icon: "✅" },
  { name: "Sandra Reyes",  earned: 700,  reason: "Driver referral + HOS",        icon: "👥" },
];

function changeColor(c) {
  if (c.startsWith("+")) return "#4ADE80";
  if (c.startsWith("-")) return "#FC8181";
  if (c === "NEW") return AMBER;
  return "rgba(255,255,255,0.3)";
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState("monthly");
  const [search, setSearch] = useState("");
  const [tick, setTick] = useState(0);

  // Simulate live points ticking up for top 3
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 4000);
    return () => clearInterval(t);
  }, []);

  const dataset = tab === "monthly" ? MONTHLY : ALL_TIME;
  const filtered = dataset.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.state.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = MONTHLY.slice(0, 3);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", color: "#0F172A", overflowX: "hidden", background: DARK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: ${DARK}; }
        ::-webkit-scrollbar-thumb { background: #1A2840; border-radius: 3px; }
        .lb-row { transition: background 0.18s; }
        .lb-row:hover { background: rgba(255,180,0,0.06) !important; }
        .lb-tab { transition: all 0.18s; cursor: pointer; border-bottom: 2px solid transparent; }
        .lb-tab.active { border-bottom: 2px solid ${AMBER}; color: ${AMBER} !important; }
        .lb-tab:hover:not(.active) { color: rgba(255,255,255,0.85) !important; }
        .lb-nav-link { transition: color 0.2s; }
        .lb-nav-link:hover { color: ${AMBER} !important; }
        .lb-state-card { transition: transform 0.2s, background 0.2s; }
        .lb-state-card:hover { transform: translateY(-3px); background: rgba(255,180,0,0.07) !important; }
        @keyframes lbPodiumRise {
          from { transform: scaleY(0); opacity: 0; }
          to   { transform: scaleY(1); opacity: 1; }
        }
        @keyframes lbPulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.5; }
        }
        .lb-live-dot { animation: lbPulse 1.6s ease-in-out infinite; }
        @keyframes lbCrown {
          0%, 100% { transform: rotate(-6deg); }
          50%       { transform: rotate(6deg); }
        }
        .lb-crown { display: inline-block; animation: lbCrown 3s ease-in-out infinite; }
        @keyframes lbCountUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lb-tick { animation: lbCountUp 0.35s ease both; }
        @media (max-width: 767px) {
          .lb-two-col { grid-template-columns: 1fr !important; }
          .lb-podium { flex-direction: column !important; align-items: center !important; }
          .lb-podium > div { width: 100% !important; max-width: 280px; }
          .lb-nav-links { display: none !important; }
          .lb-mob-btns { display: flex !important; }
          .lb-hide-mob { display: none !important; }
          .lb-table-col-extra { display: none !important; }
        }
        @media (min-width: 768px) { .lb-mob-btns { display: none !important; } }
      `}</style>

      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(5,8,15,0.95)", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(255,180,0,0.1)", padding: "0 5%", height: 66, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/static/truckwithease-icon.png" alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
          <span style={{ fontWeight: 900, fontSize: 15, color: "white" }}>TruckWith<span style={{ color: AMBER }}>Ease</span></span>
        </a>
        <div className="lb-nav-links" style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a href="/rig-bucks" className="lb-nav-link" style={{ color: "rgba(255,255,255,0.55)", fontWeight: 500, fontSize: 14, textDecoration: "none" }}>← Rig Bucks</a>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="lb-live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80" }} />
            <span style={{ color: "#4ADE80", fontSize: 13, fontWeight: 600 }}>Live Rankings</span>
            <LiveClock />
          </div>
          <a href="/#pricing" style={{ background: AMBER, color: DARK, padding: "9px 20px", borderRadius: 8, fontWeight: 800, fontSize: 14, textDecoration: "none" }}>Start Earning Free</a>
        </div>
        <div className="lb-mob-btns" style={{ display: "none", gap: 10, alignItems: "center" }}>
          <div className="lb-live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80" }} />
          <span style={{ color: "#4ADE80", fontSize: 12, fontWeight: 600 }}>Live</span>
          <a href="/#pricing" style={{ background: AMBER, color: DARK, padding: "8px 14px", borderRadius: 7, fontWeight: 800, fontSize: 13, textDecoration: "none" }}>Join Free</a>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{ background: DARK, padding: "70px 5% 50px", position: "relative", overflow: "hidden" }}>
        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,180,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,180,0,0.03) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 700, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,180,0,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,180,0,0.1)", border: "1px solid rgba(255,180,0,0.3)", borderRadius: 20, padding: "6px 16px", marginBottom: 20 }}>
                <div className="lb-live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80" }} />
                <span style={{ color: "#4ADE80", fontSize: 12, fontWeight: 700 }}>LIVE</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>·</span>
                <span style={{ color: AMBER, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Rig Bucks Leaderboard</span>
              </div>
              <h1 style={{ fontSize: "clamp(2.8rem,7vw,5.5rem)", fontWeight: 900, color: "white", letterSpacing: -3, lineHeight: 1.0, marginBottom: 14 }}>
                Who's<br /><span style={{ color: AMBER }}>Running the Board?</span>
              </h1>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, maxWidth: 480, margin: "0 auto", lineHeight: 1.8 }}>
                Rankings update in real time as drivers earn Rig Bucks across the platform. Every clean day moves the needle.
              </p>
            </div>
          </FadeIn>

          {/* ── PODIUM — Top 3 ── */}
          <FadeIn delay={100}>
            <div className="lb-podium" style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 16, marginTop: 56, marginBottom: 16 }}>
              {/* 2nd */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 28 }}>{top3[1].badge}</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "white", fontWeight: 800, fontSize: 14 }}>{top3[1].name}</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>{top3[1].state} · {top3[1].tier}</div>
                </div>
                <div style={{ background: "#60A5FA", color: DARK, fontFamily: "'DM Mono', monospace", fontWeight: 900, fontSize: 15, padding: "4px 14px", borderRadius: 20 }}>
                  {(top3[1].pts + (tick % 3 === 1 ? 75 : 0)).toLocaleString()} pts
                </div>
                <div style={{ width: 100, height: 90, background: "linear-gradient(180deg, #1E3A5F 0%, #0C1628 100%)", borderRadius: "10px 10px 0 0", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(96,165,250,0.2)", borderBottom: "none" }}>
                  <span style={{ color: "#60A5FA", fontWeight: 900, fontSize: 28, fontFamily: "'DM Mono', monospace" }}>2</span>
                </div>
              </div>
              {/* 1st */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <span className="lb-crown" style={{ fontSize: 36 }}>👑</span>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "white", fontWeight: 900, fontSize: 16 }}>{top3[0].name}</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{top3[0].state} · {top3[0].tier}</div>
                </div>
                <div style={{ background: `linear-gradient(135deg, ${AMBER}, #D97F00)`, color: DARK, fontFamily: "'DM Mono', monospace", fontWeight: 900, fontSize: 17, padding: "5px 18px", borderRadius: 20, boxShadow: "0 4px 18px rgba(255,180,0,0.4)" }}>
                  {(top3[0].pts + (tick % 3 === 0 ? 200 : 0)).toLocaleString()} pts
                </div>
                <div style={{ width: 120, height: 130, background: "linear-gradient(180deg, #2A1800 0%, #0C1628 100%)", borderRadius: "10px 10px 0 0", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid rgba(255,180,0,0.35)`, borderBottom: "none", boxShadow: "0 -8px 32px rgba(255,180,0,0.12)" }}>
                  <span style={{ color: AMBER, fontWeight: 900, fontSize: 36, fontFamily: "'DM Mono', monospace" }}>1</span>
                </div>
              </div>
              {/* 3rd */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 28 }}>{top3[2].badge}</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "white", fontWeight: 800, fontSize: 14 }}>{top3[2].name}</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>{top3[2].state} · {top3[2].tier}</div>
                </div>
                <div style={{ background: "#FBBF24", color: DARK, fontFamily: "'DM Mono', monospace", fontWeight: 900, fontSize: 15, padding: "4px 14px", borderRadius: 20 }}>
                  {(top3[2].pts + (tick % 3 === 2 ? 50 : 0)).toLocaleString()} pts
                </div>
                <div style={{ width: 90, height: 68, background: "linear-gradient(180deg, #2A1C00 0%, #0C1628 100%)", borderRadius: "10px 10px 0 0", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(251,191,36,0.2)", borderBottom: "none" }}>
                  <span style={{ color: "#FBBF24", fontWeight: 900, fontSize: 24, fontFamily: "'DM Mono', monospace" }}>3</span>
                </div>
              </div>
            </div>
            {/* Podium base */}
            <div style={{ height: 4, background: "linear-gradient(90deg, transparent, rgba(255,180,0,0.3), transparent)", borderRadius: 2, maxWidth: 440, margin: "0 auto" }} />
          </FadeIn>
        </div>
      </section>

      {/* ── FULL RANKINGS TABLE ──────────────────────────────────────────────── */}
      <section style={{ padding: "60px 5% 100px", background: "#080D1A" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          {/* Controls */}
          <FadeIn>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {[["monthly","Monthly"], ["alltime","All-Time"]].map(([id, label]) => (
                  <button key={id} onClick={() => setTab(id)}
                    className={`lb-tab${tab === id ? " active" : ""}`}
                    style={{ padding: "10px 22px", background: "none", border: "none", color: tab === id ? AMBER : "rgba(255,255,255,0.45)", fontWeight: 700, fontSize: 14, fontFamily: "'Poppins', sans-serif" }}>
                    {label}
                  </button>
                ))}
              </div>
              {/* Search */}
              <input
                type="text" placeholder="Search driver or state…"
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 16px", color: "white", fontSize: 13, fontFamily: "'Poppins', sans-serif", outline: "none", width: 220 }}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(255,180,0,0.4)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>
          </FadeIn>

          {/* Table */}
          <FadeIn delay={40}>
            <div style={{ background: "#0C1628", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "56px 1fr 80px 100px 100px 80px", gap: 0, padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                {["Rank","Driver","State","Tier","Big Rig Pts","Week Δ"].map((h, i) => (
                  <div key={h} className={i > 3 ? "lb-table-col-extra" : ""} style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>{h}</div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 14 }}>No drivers found matching "{search}"</div>
              )}

              {filtered.map((driver, i) => {
                const tierMeta = TIER_META[driver.tier] || TIER_META.Standard;
                return (
                  <div key={driver.rank} className="lb-row"
                    style={{ display: "grid", gridTemplateColumns: "56px 1fr 80px 100px 100px 80px", gap: 0, padding: "15px 24px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "center", background: driver.rank <= 3 ? `${tierMeta.bg}` : "transparent" }}>
                    {/* Rank */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: driver.rank === 1 ? "rgba(255,180,0,0.2)" : driver.rank === 2 ? "rgba(96,165,250,0.15)" : driver.rank === 3 ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: driver.rank === 1 ? AMBER : driver.rank === 2 ? "#60A5FA" : driver.rank === 3 ? "#FBBF24" : "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace" }}>
                        {driver.rank}
                      </div>
                    </div>
                    {/* Driver */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${tierMeta.color}20`, border: `1px solid ${tierMeta.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                        {driver.badge}
                      </div>
                      <div>
                        <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>{driver.name}</div>
                        {driver.streak > 0 && (
                          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>🔥 {driver.streak}-day streak</div>
                        )}
                      </div>
                    </div>
                    {/* State */}
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "4px 10px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.65)", fontFamily: "'DM Mono', monospace", display: "inline-block", width: "fit-content" }}>{driver.state}</div>
                    {/* Tier */}
                    <div>
                      <span style={{ background: tierMeta.bg, border: `1px solid ${tierMeta.color}33`, color: tierMeta.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                        {tierMeta.icon} {driver.tier}
                      </span>
                    </div>
                    {/* Points */}
                    <div className="lb-table-col-extra" style={{ color: AMBER, fontWeight: 900, fontSize: 16, fontFamily: "'DM Mono', monospace" }}>
                      {driver.pts.toLocaleString()}
                    </div>
                    {/* Change */}
                    <div className="lb-table-col-extra" style={{ color: changeColor(driver.change || "—"), fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                      {driver.change || "—"}
                    </div>
                  </div>
                );
              })}

              {/* Your row CTA */}
              <div style={{ display: "grid", gridTemplateColumns: "56px 1fr 80px 100px 100px 80px", gap: 0, padding: "16px 24px", background: "rgba(255,180,0,0.05)", borderTop: "1px solid rgba(255,180,0,0.15)", alignItems: "center" }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,180,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>?</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🚛</div>
                  <div>
                    <div style={{ color: AMBER, fontWeight: 700, fontSize: 14 }}>Your spot on the board</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Start your free trial to claim it</div>
                  </div>
                </div>
                <div />
                <div />
                <div className="lb-table-col-extra" />
                <div className="lb-table-col-extra">
                  <a href="/#pricing" style={{ background: AMBER, color: DARK, padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: 800, textDecoration: "none" }}>Join →</a>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── THIS WEEK'S TOP EARNERS ──────────────────────────────────────────── */}
      <section style={{ padding: "80px 5%", background: DARK }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ marginBottom: 36 }}>
              <div style={{ color: AMBER, fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>This Week</div>
              <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 900, color: "white" }}>
                Top earners, <span style={{ color: AMBER }}>right now.</span>
              </h2>
            </div>
          </FadeIn>
          <div className="lb-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {TOP_EARNERS_THIS_WEEK.map((e, i) => (
              <FadeIn key={e.name} delay={i * 60}>
                <div style={{ background: "#0C1628", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px", display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,180,0,0.1)", border: "1px solid rgba(255,180,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{e.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>{e.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 3 }}>{e.reason}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color: GREEN, fontWeight: 900, fontSize: 16, fontFamily: "'DM Mono', monospace" }}>+{e.earned.toLocaleString()}</div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>pts this week</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATE LEADERS ────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 5% 100px", background: "#080D1A" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ marginBottom: 36 }}>
              <div style={{ color: AMBER, fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>State Champions</div>
              <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 900, color: "white" }}>
                #1 driver in <span style={{ color: AMBER }}>every state.</span>
              </h2>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {STATE_LEADERS.map((s, i) => {
              const meta = TIER_META[s.tier] || TIER_META.Standard;
              return (
                <FadeIn key={s.state} delay={i * 40}>
                  <div className="lb-state-card" style={{ background: "#0C1628", border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 12, padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ background: "rgba(255,180,0,0.1)", border: "1px solid rgba(255,180,0,0.25)", borderRadius: 8, padding: "4px 12px", fontWeight: 900, fontSize: 15, color: AMBER, fontFamily: "'DM Mono', monospace" }}>{s.state}</div>
                      <span style={{ color: meta.color, fontSize: 14 }}>{meta.icon}</span>
                    </div>
                    <div style={{ color: "white", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{s.driver}</div>
                    <div style={{ color: AMBER, fontWeight: 900, fontSize: 14, fontFamily: "'DM Mono', monospace" }}>{s.pts} pts</div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "90px 5%", background: DARK, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,180,0,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <FadeIn>
          <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🏆</div>
            <h2 style={{ fontSize: "clamp(2rem,4.5vw,3.2rem)", fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: 18 }}>
              Your name could be<br /><span style={{ color: AMBER }}>on this board.</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, maxWidth: 420, margin: "0 auto 36px", lineHeight: 1.8 }}>
              Start your free trial, earn your first Rig Bucks on day one, and climb the leaderboard every clean mile you run.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/#pricing" style={{ background: AMBER, color: DARK, padding: "16px 40px", borderRadius: 12, fontWeight: 900, fontSize: 16, textDecoration: "none", boxShadow: "0 8px 28px rgba(255,180,0,0.4)" }}>Start Earning — Free Trial</a>
              <a href="/rig-bucks" style={{ background: "rgba(255,255,255,0.07)", color: "white", padding: "16px 28px", borderRadius: 12, fontWeight: 600, fontSize: 16, textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)" }}>← Rig Bucks</a>
            </div>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginTop: 20 }}>No credit card required · Cancel anytime</p>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer style={{ background: "#030508", padding: "24px 5%", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>© 2026 TruckWithEase · Rig Bucks Leaderboard · Updates live</span>
        <a href="/" style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, textDecoration: "none" }}>← Back to main site</a>
      </footer>
    </div>
  );
}
