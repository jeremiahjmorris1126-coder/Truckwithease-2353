import { useState, useEffect, useRef } from "react";

const NAVY   = "#0B2A6B";
const NAVY2  = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER  = "#FFB400";
const GREEN  = "#16A34A";
const RED    = "#DC2626";
const DARK   = "#06090F";

const ALL_DRIVERS = [
  {
    id: 1, name: "Ray Davis", avatar: "RD", truck: "TRK-441", cdl: "CDL-TX-4412881",
    state: "TX", since: "March 2024", tier: "Diamond", tierIcon: "👑",
    score: 98, miles: "148,200", loads: 312, violations: 0, inspections: 14,
    rigBucks: 28420, streakDays: 31,
    status: "Driving Now", location: "Dallas, TX → Memphis, TN",
    hos: { driveLeft: "2h 38m", cycleUsed: "68h", restartIn: "6h 22m" },
    badges: [
      { icon: "👑", name: "Diamond Driver", desc: "Top tier status" },
      { icon: "🔥", name: "31-Day Streak", desc: "Clean driving streak" },
      { icon: "🛡️", name: "Zero Violations", desc: "No violations ever" },
      { icon: "📋", name: "DVIR Pro", desc: "100% DVIR completion" },
      { icon: "⚡", name: "Bypass King", desc: "50+ weigh bypasses" },
      { icon: "🏆", name: "Leaderboard #1", desc: "Top ranked driver" },
    ],
    recentLoads: [
      { lane: "Dallas → Memphis", rate: "$3,420", date: "Today", status: "In Transit" },
      { lane: "OKC → Dallas", rate: "$2,100", date: "Jul 9", status: "Delivered" },
      { lane: "Houston → OKC", rate: "$2,850", date: "Jul 7", status: "Delivered" },
    ],
    safetyBreakdown: [
      { label: "HOS Compliance", score: 100 },
      { label: "DVIR Completion", score: 100 },
      { label: "Speed & Idle", score: 96 },
      { label: "Inspection Results", score: 98 },
      { label: "Zero Violations", score: 100 },
    ],
  },
  {
    id: 2, name: "James Miller", avatar: "JM", truck: "TRK-228", cdl: "CDL-OK-2291047",
    state: "OK", since: "June 2024", tier: "Platinum", tierIcon: "💎",
    score: 91, miles: "112,400", loads: 228, violations: 1, inspections: 11,
    rigBucks: 21880, streakDays: 22,
    status: "On Break", location: "Oklahoma City, OK",
    hos: { driveLeft: "1h 50m", cycleUsed: "62h", restartIn: "18h 10m" },
    badges: [
      { icon: "💎", name: "Platinum Driver", desc: "Platinum tier status" },
      { icon: "🔥", name: "22-Day Streak", desc: "Clean driving streak" },
      { icon: "📦", name: "Load King", desc: "200+ loads completed" },
      { icon: "⚡", name: "Bypass Regular", desc: "30+ weigh bypasses" },
    ],
    recentLoads: [
      { lane: "OKC → Kansas City", rate: "$2,180", date: "Today", status: "Delivered" },
      { lane: "Tulsa → OKC", rate: "$1,450", date: "Jul 8", status: "Delivered" },
      { lane: "Kansas City → Tulsa", rate: "$1,980", date: "Jul 6", status: "Delivered" },
    ],
    safetyBreakdown: [
      { label: "HOS Compliance", score: 94 },
      { label: "DVIR Completion", score: 88 },
      { label: "Speed & Idle", score: 90 },
      { label: "Inspection Results", score: 95 },
      { label: "Zero Violations", score: 88 },
    ],
  },
  {
    id: 3, name: "Tony Williams", avatar: "TW", truck: "TRK-317", cdl: "CDL-MO-3174422",
    state: "MO", since: "January 2024", tier: "Platinum", tierIcon: "💎",
    score: 95, miles: "98,700", loads: 197, violations: 0, inspections: 9,
    rigBucks: 18200, streakDays: 18,
    status: "Driving Now", location: "Kansas City, MO → Chicago, IL",
    hos: { driveLeft: "4h 45m", cycleUsed: "44h", restartIn: "—" },
    badges: [
      { icon: "💎", name: "Platinum Driver", desc: "Platinum tier status" },
      { icon: "🛡️", name: "Clean Record", desc: "Zero violations" },
      { icon: "🔥", name: "18-Day Streak", desc: "Clean driving streak" },
      { icon: "📋", name: "Inspection Ace", desc: "9 passed DOT inspections" },
    ],
    recentLoads: [
      { lane: "KC → Chicago", rate: "$4,100", date: "Today", status: "In Transit" },
      { lane: "St. Louis → KC", rate: "$1,750", date: "Jul 8", status: "Delivered" },
      { lane: "Chicago → St. Louis", rate: "$2,200", date: "Jul 6", status: "Delivered" },
    ],
    safetyBreakdown: [
      { label: "HOS Compliance", score: 98 },
      { label: "DVIR Completion", score: 95 },
      { label: "Speed & Idle", score: 92 },
      { label: "Inspection Results", score: 100 },
      { label: "Zero Violations", score: 98 },
    ],
  },
  {
    id: 4, name: "Andre Johnson", avatar: "AJ", truck: "TRK-509", cdl: "CDL-GA-5091833",
    state: "GA", since: "August 2024", tier: "Gold", tierIcon: "⭐",
    score: 87, miles: "76,300", loads: 152, violations: 2, inspections: 7,
    rigBucks: 12750, streakDays: 12,
    status: "Sleeper Berth", location: "Atlanta, GA",
    hos: { driveLeft: "0h 00m", cycleUsed: "70h", restartIn: "2h 00m" },
    badges: [
      { icon: "⭐", name: "Gold Driver", desc: "Gold tier status" },
      { icon: "🔥", name: "12-Day Streak", desc: "Current clean streak" },
      { icon: "📦", name: "100+ Loads", desc: "150+ loads delivered" },
    ],
    recentLoads: [
      { lane: "Atlanta → Nashville", rate: "$1,850", date: "Yesterday", status: "Delivered" },
      { lane: "Nashville → Atlanta", rate: "$1,720", date: "Jul 7", status: "Delivered" },
    ],
    safetyBreakdown: [
      { label: "HOS Compliance", score: 85 },
      { label: "DVIR Completion", score: 82 },
      { label: "Speed & Idle", score: 88 },
      { label: "Inspection Results", score: 90 },
      { label: "Zero Violations", score: 82 },
    ],
  },
  {
    id: 5, name: "Derrick Brown", avatar: "DB", truck: "TRK-102", cdl: "CDL-KS-1024490",
    state: "KS", since: "October 2024", tier: "Gold", tierIcon: "⭐",
    score: 93, miles: "61,100", loads: 122, violations: 0, inspections: 6,
    rigBucks: 9400, streakDays: 9,
    status: "Off Duty", location: "Houston, TX",
    hos: { driveLeft: "11h 00m", cycleUsed: "28h", restartIn: "—" },
    badges: [
      { icon: "⭐", name: "Gold Driver", desc: "Gold tier status" },
      { icon: "🛡️", name: "Clean Record", desc: "Zero violations" },
      { icon: "🔥", name: "9-Day Streak", desc: "Current clean streak" },
    ],
    recentLoads: [
      { lane: "Houston → Dallas", rate: "$1,480", date: "Jul 10", status: "Delivered" },
      { lane: "Dallas → Houston", rate: "$1,520", date: "Jul 8", status: "Delivered" },
    ],
    safetyBreakdown: [
      { label: "HOS Compliance", score: 95 },
      { label: "DVIR Completion", score: 90 },
      { label: "Speed & Idle", score: 94 },
      { label: "Inspection Results", score: 92 },
      { label: "Zero Violations", score: 95 },
    ],
  },
];

function maskCDL(cdl) {
  // CDL-TX-4412881 → CDL-TX-***2881
  const parts = cdl.split("-");
  if (parts.length === 3) {
    const num = parts[2];
    const masked = "***" + num.slice(-4);
    return `${parts[0]}-${parts[1]}-${masked}`;
  }
  return cdl;
}

function tierColor(tier) {
  if (tier === "Diamond") return "#B9F2FF";
  if (tier === "Platinum") return "#E5E7EB";
  if (tier === "Gold") return AMBER;
  return "#CD7F32";
}

function tierGradient(tier) {
  if (tier === "Diamond") return "linear-gradient(135deg, #B9F2FF 0%, #67E8F9 100%)";
  if (tier === "Platinum") return "linear-gradient(135deg, #E5E7EB 0%, #9CA3AF 100%)";
  if (tier === "Gold") return `linear-gradient(135deg, ${AMBER} 0%, ${ORANGE} 100%)`;
  return "linear-gradient(135deg, #CD7F32 0%, #92400E 100%)";
}

function statusColor(status) {
  if (status === "Driving Now") return GREEN;
  if (status === "On Break") return AMBER;
  if (status === "Sleeper Berth") return "#6366F1";
  if (status === "Off Duty") return "#6B7280";
  return ORANGE;
}

function ScoreGauge({ score, size = 140 }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(t);
  }, [score]);

  const pct = mounted ? score : 0;
  const deg = Math.round((pct / 100) * 360);
  const scoreColor = score >= 95 ? GREEN : score >= 85 ? AMBER : RED;
  const borderW = 10;
  const innerSize = size - borderW * 2;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: `conic-gradient(${scoreColor} 0deg ${deg}deg, #1E3A5F ${deg}deg 360deg)`,
          transition: "background 1.2s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: "50%",
            background: NAVY2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 36, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
            {score}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#94A3B8", letterSpacing: "0.1em", marginTop: 2 }}>
            SAFETY
          </div>
        </div>
      </div>
    </div>
  );
}

function CountUp({ target, duration = 1800 }) {
  const [val, setVal] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    const delay = setTimeout(() => {
      frameRef.current = requestAnimationFrame(step);
    }, 400);
    return () => {
      clearTimeout(delay);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return <span>{val.toLocaleString()}</span>;
}

function ProgressBar({ score, color = ORANGE, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 300 + delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  const barColor = score >= 95 ? GREEN : score >= 85 ? AMBER : RED;

  return (
    <div style={{ background: "#1E3A5F", borderRadius: 4, height: 8, overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background: barColor,
          borderRadius: 4,
          transition: `width 0.9s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
          boxShadow: `0 0 8px ${barColor}88`,
        }}
      />
    </div>
  );
}

function StatCard({ label, value, icon, highlight }) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)`,
        border: highlight ? `1px solid ${ORANGE}` : "1px solid #1E3A5F",
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flex: 1,
        minWidth: 120,
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 2 }}>{icon}</div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 26, fontWeight: 800, color: highlight ? ORANGE : "#F1F5F9", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#64748B", letterSpacing: "0.05em" }}>
        {label}
      </div>
    </div>
  );
}

function BadgeCard({ badge }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `linear-gradient(135deg, ${NAVY} 0%, #0F3080 100%)` : `linear-gradient(135deg, ${NAVY2} 0%, ${NAVY} 100%)`,
        border: hovered ? `1px solid ${ORANGE}` : "1px solid #1E3A5F",
        borderRadius: 12,
        padding: "16px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        cursor: "default",
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ fontSize: 28 }}>{badge.icon}</div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 700, color: "#F1F5F9", textAlign: "center", lineHeight: 1.3 }}>
        {badge.name}
      </div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#64748B", textAlign: "center", lineHeight: 1.4 }}>
        {badge.desc}
      </div>
    </div>
  );
}

function DriverSelectorCard({ driver, isActive }) {
  function go() {
    const url = new URL(window.location.href);
    url.searchParams.set("driver", driver.id);
    window.location.href = url.toString();
  }

  return (
    <div
      onClick={go}
      style={{
        background: isActive ? `linear-gradient(135deg, ${NAVY} 0%, #0F3080 100%)` : `linear-gradient(135deg, ${NAVY2} 0%, ${NAVY} 100%)`,
        border: isActive ? `2px solid ${ORANGE}` : "1px solid #1E3A5F",
        borderRadius: 12,
        padding: "14px 16px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        transition: "all 0.2s ease",
        flex: "1 1 160px",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: tierGradient(driver.tier),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 800,
          fontSize: 14,
          color: DARK,
          flexShrink: 0,
        }}
      >
        {driver.avatar}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 700, color: "#F1F5F9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {driver.name}
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#64748B" }}>
          {driver.tierIcon} {driver.tier} · {driver.score}
        </div>
      </div>
    </div>
  );
}

export default function DriverProfilePage() {
  const params = new URLSearchParams(window.location.search);
  const driverId = parseInt(params.get("driver") || "1", 10);
  const driver = ALL_DRIVERS.find(d => d.id === driverId) || ALL_DRIVERS[0];

  const [copied, setCopied] = useState(false);

  function shareProfile() {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const maskedCDL = maskCDL(driver.cdl);
  const tc = tierColor(driver.tier);

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${DARK}; }
        .driver-hero-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 32px;
          align-items: center;
        }
        .driver-hero-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }
        .main-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .driver-selector-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .stats-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .driver-hero-grid {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .driver-hero-right {
            align-items: center;
          }
          .main-two-col {
            grid-template-columns: 1fr;
          }
          .stats-row {
            gap: 8px;
          }
        }
        .load-status-transit {
          background: ${ORANGE}22;
          color: ${ORANGE};
          border: 1px solid ${ORANGE}44;
        }
        .load-status-delivered {
          background: ${GREEN}22;
          color: ${GREEN};
          border: 1px solid ${GREEN}44;
        }
        a { text-decoration: none; }
      `}</style>

      <div style={{ background: DARK, minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>

        {/* ── NAV ── */}
        <nav style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: `${NAVY2}F5`,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid #1E3A5F`,
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>🚛</span>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 16, color: "#F1F5F9" }}>
                Truck<span style={{ color: ORANGE }}>With</span>Ease
              </span>
            </div>
            <a
              href="./"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                color: "#64748B",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = ORANGE}
              onMouseLeave={e => e.currentTarget.style.color = "#64748B"}
            >
              ← Command Center
            </a>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <a href="/#pricing" style={{ background:AMBER, color:DARK, fontFamily:"'Poppins',sans-serif", fontWeight:800, fontSize:12, padding:"8px 16px", borderRadius:8, textDecoration:"none", whiteSpace:"nowrap" }}>
              Start Free Trial
            </a>
            <a href="/command" style={{ background:`linear-gradient(135deg,${ORANGE},#FF8C00)`, color:DARK, fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:13, padding:"8px 18px", borderRadius:8, textDecoration:"none", whiteSpace:"nowrap" }}>
              🎯 Command Center
            </a>
            <a href="/" style={{ color:"#64748B", fontFamily:"'Poppins',sans-serif", fontSize:12, textDecoration:"none", opacity:0.6 }}>← Back</a>
          </div>
        </nav>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px 60px" }}>

          {/* ── HERO CARD ── */}
          <div style={{
            background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 60%, #050D1A 100%)`,
            border: `1px solid #1E3A5F`,
            borderRadius: 20,
            padding: "32px 36px",
            marginBottom: 24,
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Background accent */}
            <div style={{
              position: "absolute",
              top: -80,
              right: -80,
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: `${ORANGE}08`,
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute",
              bottom: -60,
              left: -60,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: `${NAVY}40`,
              pointerEvents: "none",
            }} />

            <div className="driver-hero-grid">
              {/* LEFT: Driver Info */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Avatar + Name */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: tierGradient(driver.tier),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 26,
                    color: DARK,
                    border: `3px solid ${tc}`,
                    boxShadow: `0 0 20px ${tc}44`,
                    flexShrink: 0,
                  }}>
                    {driver.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 28, color: "#F1F5F9", lineHeight: 1.1 }}>
                      {driver.name}
                    </div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#64748B", marginTop: 4 }}>
                      {maskedCDL}
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{
                    background: `${statusColor(driver.status)}22`,
                    color: statusColor(driver.status),
                    border: `1px solid ${statusColor(driver.status)}55`,
                    borderRadius: 20,
                    padding: "4px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}>
                    <span style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: statusColor(driver.status),
                      display: "inline-block",
                    }} />
                    {driver.status}
                  </span>
                </div>

                {/* Meta info */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, color: "#94A3B8" }}>📍</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#94A3B8" }}>{driver.location}</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#64748B" }}>
                      🚛 <span style={{ color: "#94A3B8" }}>{driver.truck}</span>
                    </div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#64748B" }}>
                      📍 <span style={{ color: "#94A3B8" }}>{driver.state}</span>
                    </div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#64748B" }}>
                      📅 Since <span style={{ color: "#94A3B8" }}>{driver.since}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CENTER: Score Gauge + Tier */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <ScoreGauge score={driver.score} size={150} />
                <div style={{
                  background: tierGradient(driver.tier),
                  borderRadius: 20,
                  padding: "6px 20px",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  color: DARK,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: `0 4px 16px ${tc}44`,
                }}>
                  {driver.tierIcon} {driver.tier} Driver
                </div>
              </div>

              {/* RIGHT: BigRig Points + Share */}
              <div className="driver-hero-right">
                {/* BigRig Points */}
                <div style={{
                  background: `${AMBER}12`,
                  border: `1px solid ${AMBER}33`,
                  borderRadius: 14,
                  padding: "20px 24px",
                  textAlign: "center",
                  minWidth: 160,
                }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: AMBER, letterSpacing: "0.1em", marginBottom: 4 }}>
                    RIG BUCKS
                  </div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: 32, color: AMBER, lineHeight: 1 }}>
                    <CountUp target={driver.rigBucks} />
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#64748B", marginTop: 4 }}>
                    🏅 pts earned
                  </div>
                </div>

                {/* Streak */}
                <div style={{
                  background: `${ORANGE}12`,
                  border: `1px solid ${ORANGE}33`,
                  borderRadius: 14,
                  padding: "12px 20px",
                  textAlign: "center",
                  minWidth: 160,
                }}>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 22, color: ORANGE }}>
                    🔥 {driver.streakDays} Days
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#64748B", marginTop: 2 }}>
                    CLEAN STREAK
                  </div>
                </div>

                {/* Share button */}
                <button
                  onClick={shareProfile}
                  style={{
                    background: copied
                      ? `linear-gradient(135deg, ${GREEN} 0%, #15803D 100%)`
                      : `linear-gradient(135deg, ${ORANGE} 0%, #FF8C00 100%)`,
                    color: DARK,
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    padding: "12px 24px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    width: "100%",
                    transition: "background 0.3s",
                    minWidth: 160,
                  }}
                >
                  {copied ? "✅ Copied!" : "🔗 Share Profile"}
                </button>
              </div>
            </div>
          </div>

          {/* ── STATS ROW ── */}
          <div className="stats-row" style={{ marginBottom: 24 }}>
            <StatCard label="TOTAL MILES" value={driver.miles} icon="🛣️" />
            <StatCard label="LOADS COMPLETED" value={driver.loads} icon="📦" />
            <StatCard label="INSPECTIONS PASSED" value={driver.inspections} icon="✅" />
            <StatCard
              label="VIOLATIONS"
              value={driver.violations}
              icon={driver.violations === 0 ? "🛡️" : "⚠️"}
              highlight={driver.violations > 0}
            />
            <StatCard label="RIG BUCKS" value={driver.rigBucks.toLocaleString()} icon="⭐" />
          </div>

          {/* ── TWO-COLUMN MAIN ── */}
          <div className="main-two-col" style={{ marginBottom: 24 }}>

            {/* LEFT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Safety Scorecard */}
              <div style={{
                background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)`,
                border: "1px solid #1E3A5F",
                borderRadius: 16,
                padding: "24px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <span style={{ fontSize: 20 }}>🛡️</span>
                  <span style={{ fontWeight: 800, fontSize: 18, color: "#F1F5F9" }}>Safety Scorecard</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {driver.safetyBreakdown.map((item, i) => (
                    <div key={item.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#94A3B8" }}>{item.label}</span>
                        <span style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 13,
                          fontWeight: 700,
                          color: item.score >= 95 ? GREEN : item.score >= 85 ? AMBER : RED,
                        }}>
                          {item.score}%
                        </span>
                      </div>
                      <ProgressBar score={item.score} delay={i * 100} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Loads */}
              <div style={{
                background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)`,
                border: "1px solid #1E3A5F",
                borderRadius: 16,
                padding: "24px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <span style={{ fontSize: 20 }}>🚚</span>
                  <span style={{ fontWeight: 800, fontSize: 18, color: "#F1F5F9" }}>Recent Loads</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {driver.recentLoads.map((load, i) => (
                    <div key={i} style={{
                      background: "#0D1F3C",
                      border: "1px solid #1E3A5F",
                      borderRadius: 10,
                      padding: "14px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 8,
                    }}>
                      <div>
                        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 600, color: "#F1F5F9", marginBottom: 3 }}>
                          {load.lane}
                        </div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#64748B" }}>{load.date}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 15, color: AMBER }}>
                          {load.rate}
                        </span>
                        <span
                          className={load.status === "In Transit" ? "load-status-transit" : "load-status-delivered"}
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            borderRadius: 20,
                            padding: "3px 10px",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {load.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Achievement Badges */}
              <div style={{
                background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)`,
                border: "1px solid #1E3A5F",
                borderRadius: 16,
                padding: "24px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <span style={{ fontSize: 20 }}>🏅</span>
                  <span style={{ fontWeight: 800, fontSize: 18, color: "#F1F5F9" }}>Achievement Badges</span>
                  <span style={{
                    background: `${ORANGE}22`,
                    color: ORANGE,
                    borderRadius: 20,
                    padding: "2px 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "'DM Mono', monospace",
                    marginLeft: "auto",
                  }}>
                    {driver.badges.length} earned
                  </span>
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}>
                  {driver.badges.map((badge, i) => (
                    <BadgeCard key={i} badge={badge} />
                  ))}
                </div>
              </div>

              {/* HOS Status */}
              <div style={{
                background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)`,
                border: "1px solid #1E3A5F",
                borderRadius: 16,
                padding: "24px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <span style={{ fontSize: 20 }}>⏱️</span>
                  <span style={{ fontWeight: 800, fontSize: 18, color: "#F1F5F9" }}>HOS Current Status</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Drive Time Left", value: driver.hos.driveLeft, icon: "🟢" },
                    { label: "Cycle Used", value: driver.hos.cycleUsed, icon: "🔵" },
                    { label: "34h Restart In", value: driver.hos.restartIn, icon: "🔄" },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: "#0D1F3C",
                      border: "1px solid #1E3A5F",
                      borderRadius: 10,
                      padding: "14px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span>{item.icon}</span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#94A3B8" }}>{item.label}</span>
                      </div>
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 16, color: "#F1F5F9" }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Status label */}
                <div style={{
                  marginTop: 16,
                  background: `${statusColor(driver.status)}12`,
                  border: `1px solid ${statusColor(driver.status)}33`,
                  borderRadius: 10,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#64748B" }}>CURRENT STATUS</span>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 13, color: statusColor(driver.status) }}>
                    {driver.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── DRIVER SELECTOR ── */}
          <div style={{
            background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)`,
            border: "1px solid #1E3A5F",
            borderRadius: 16,
            padding: "24px",
            marginBottom: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>👥</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#F1F5F9" }}>Browse Driver Profiles</span>
            </div>
            <div className="driver-selector-grid">
              {ALL_DRIVERS.map(d => (
                <DriverSelectorCard key={d.id} driver={d} isActive={d.id === driver.id} />
              ))}
            </div>
          </div>

          {/* ── CTA BAND ── */}
          <div style={{
            background: `linear-gradient(135deg, ${NAVY2} 0%, #0F1A35 50%, ${NAVY2} 100%)`,
            border: `1px solid ${ORANGE}33`,
            borderRadius: 16,
            padding: "40px 32px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              height: 200,
              borderRadius: "50%",
              background: `${ORANGE}08`,
              pointerEvents: "none",
            }} />
            <div style={{ fontSize: 36, marginBottom: 12 }}>🚛</div>
            <div style={{ fontWeight: 900, fontSize: 26, color: "#F1F5F9", marginBottom: 8 }}>
              Want your own TruckWithEase profile?
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#64748B", marginBottom: 28, maxWidth: 500, margin: "0 auto 28px" }}>
              Build your professional driver scorecard. Track miles, earn badges, and get discovered by top brokers.
            </div>
            <button
              style={{
                background: `linear-gradient(135deg, ${ORANGE} 0%, #FF8C00 100%)`,
                color: DARK,
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 800,
                fontSize: 16,
                padding: "16px 40px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                boxShadow: `0 8px 32px ${ORANGE}44`,
              }}
            >
              🚀 Start Free Trial
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
