import { useState } from "react";

const NAVY = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED = "#DC2626";
const DARK = "#06090F";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  

  .sc-nav {
    position: sticky; top: 0; z-index: 100;
    background: ${NAVY2};
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; height: 64px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  }
  .sc-nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .sc-nav-logo img { width: 36px; height: 36px; border-radius: 8px; }
  .sc-nav-label { color: #fff; font-weight: 700; font-size: 1rem; letter-spacing: 0.01em; }
  .sc-nav-sub { color: ${AMBER}; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
  .sc-nav-links { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .sc-nav-links a { color: #c8d4f0; text-decoration: none; font-size: 0.85rem; padding: 6px 10px; border-radius: 6px; transition: background 0.2s; }
  .sc-nav-links a:hover { background: rgba(255,255,255,0.08); }
  .sc-btn-trial { background: ${AMBER}; color: ${DARK}; font-weight: 700; font-size: 0.85rem; padding: 8px 18px; border-radius: 8px; text-decoration: none; white-space: nowrap; transition: opacity 0.2s; }
  .sc-btn-trial:hover { opacity: 0.88; }

  .sc-stats-bar {
    background: ${NAVY};
    display: flex; gap: 0; overflow-x: auto;
  }
  .sc-stat {
    flex: 1; min-width: 160px; padding: 14px 20px; text-align: center;
    border-right: 1px solid rgba(255,255,255,0.1);
  }
  .sc-stat:last-child { border-right: none; }
  .sc-stat-val { color: ${AMBER}; font-size: 1.4rem; font-weight: 800; font-family: 'DM Mono', monospace; }
  .sc-stat-lbl { color: #a0b4d8; font-size: 0.72rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }

  .sc-tabs { display: flex; gap: 0; border-bottom: 2px solid #e2e8f0; background: #fff; padding: 0 32px; }
  .sc-tab { padding: 14px 28px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; color: #64748b; transition: all 0.2s; }
  .sc-tab.active { color: ${NAVY}; border-bottom-color: ${AMBER}; }

  .sc-content { max-width: 960px; margin: 0 auto; padding: 32px 20px; }

  /* GAUGE */
  .sc-gauge-wrap { display: flex; flex-direction: column; align-items: center; margin-bottom: 32px; }
  .sc-gauge { position: relative; width: 200px; height: 200px; }
  .sc-gauge svg { transform: rotate(-90deg); }
  .sc-gauge-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .sc-gauge-score { font-size: 3rem; font-weight: 800; color: ${NAVY}; font-family: 'DM Mono', monospace; line-height: 1; }
  .sc-gauge-total { font-size: 1rem; color: #94a3b8; font-weight: 500; }
  .sc-grade { font-size: 2.5rem; font-weight: 800; color: ${AMBER}; margin-top: 8px; }
  .sc-rating { font-size: 1rem; color: #64748b; font-weight: 500; margin-top: 4px; }

  .sc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  @media(max-width:700px){ .sc-grid { grid-template-columns: 1fr; } }

  .sc-card { background: #fff; border-radius: 14px; padding: 24px; box-shadow: 0 2px 12px rgba(11,42,107,0.07); }
  .sc-card-title { font-size: 0.9rem; font-weight: 700; color: ${NAVY}; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 16px; }

  .sc-bar-item { margin-bottom: 14px; }
  .sc-bar-label { display: flex; justify-content: space-between; font-size: 0.85rem; color: #334155; font-weight: 500; margin-bottom: 5px; }
  .sc-bar-track { background: #e2e8f0; border-radius: 99px; height: 10px; overflow: hidden; }
  .sc-bar-fill { height: 10px; border-radius: 99px; transition: width 0.8s cubic-bezier(.4,0,.2,1); }

  .sc-events { display: flex; flex-direction: column; gap: 0; }
  .sc-event { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
  .sc-event:last-child { border-bottom: none; }
  .sc-event-date { font-size: 0.78rem; color: #94a3b8; font-family: 'DM Mono', monospace; width: 44px; flex-shrink: 0; }
  .sc-event-desc { flex: 1; font-size: 0.85rem; color: #334155; font-weight: 500; }
  .sc-event-delta { font-family: 'DM Mono', monospace; font-size: 0.85rem; font-weight: 700; width: 52px; text-align: right; }
  .sc-event-after { font-size: 0.78rem; color: #64748b; font-family: 'DM Mono', monospace; width: 28px; text-align: right; }
  .pos { color: ${GREEN}; }
  .neg { color: ${RED}; }

  .sc-log-btn { margin-top: 20px; background: ${NAVY}; color: #fff; border: none; border-radius: 9px; padding: 12px 24px; font-size: 0.9rem; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; transition: opacity 0.2s; }
  .sc-log-btn:hover { opacity: 0.85; }

  /* MODAL */
  .sc-modal-overlay { position: fixed; inset: 0; background: rgba(6,9,15,0.6); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .sc-modal { background: #fff; border-radius: 16px; padding: 32px; width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
  .sc-modal h3 { font-size: 1.2rem; font-weight: 700; color: ${NAVY}; margin-bottom: 20px; }
  .sc-modal select, .sc-modal textarea { width: 100%; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; font-family: 'Poppins', sans-serif; font-size: 0.9rem; margin-bottom: 14px; outline: none; }
  .sc-modal select:focus, .sc-modal textarea:focus { border-color: ${NAVY}; }
  .sc-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }
  .sc-modal-cancel { background: #f1f5f9; color: #64748b; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; }
  .sc-modal-submit { background: ${AMBER}; color: ${DARK}; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; }

  /* RANKING */
  .sc-podium { display: flex; justify-content: center; align-items: flex-end; gap: 16px; margin-bottom: 32px; }
  .sc-podium-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .sc-podium-avatar { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; color: #fff; }
  .sc-podium-block { display: flex; align-items: center; justify-content: center; border-radius: 8px 8px 0 0; font-size: 1.5rem; }
  .sc-podium-name { font-size: 0.78rem; font-weight: 600; color: ${NAVY}; text-align: center; }
  .sc-podium-score { font-size: 0.85rem; font-weight: 700; font-family: 'DM Mono', monospace; color: #334155; }

  .sc-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  .sc-table th { text-align: left; padding: 10px 14px; color: #94a3b8; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 2px solid #e2e8f0; }
  .sc-table td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; color: #334155; font-weight: 500; }
  .sc-table tr:last-child td { border-bottom: none; }
  .sc-table tr.me td { background: #fffbeb; font-weight: 700; }

  .sc-trend-up { color: ${GREEN}; }
  .sc-trend-down { color: ${RED}; }

  .sc-grade-badge { display: inline-block; padding: 2px 8px; border-radius: 5px; font-size: 0.78rem; font-weight: 700; }

  .sc-sarge { background: linear-gradient(135deg, ${NAVY2}, ${NAVY}); border-radius: 14px; padding: 24px 28px; display: flex; align-items: center; gap: 16px; margin-top: 32px; }
  .sc-sarge-icon { font-size: 2.5rem; }
  .sc-sarge-text { color: #fff; font-size: 0.9rem; font-weight: 500; }
  .sc-sarge-text strong { color: ${AMBER}; }

  @media(max-width:500px){
    .sc-nav-label { font-size: 0.85rem; }
    .sc-nav-links { gap: 4px; }
    .sc-nav-links a { font-size: 0.78rem; padding: 5px 7px; }
    .sc-btn-trial { padding: 7px 12px; font-size: 0.78rem; }
  }
`;

const SCORE = 91;
const RADIUS = 82;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const breakdowns = [
  { label: "HOS Compliance", pct: 96, color: NAVY },
  { label: "DVIR Completion", pct: 100, color: GREEN },
  { label: "Speed Compliance", pct: 88, color: AMBER },
  { label: "Violation-Free Days", pct: 85, color: ORANGE },
  { label: "Inspection Results", pct: 94, color: NAVY },
];

const events = [
  { date: "Jul 12", desc: "Clean DVIR", delta: +2, after: 91 },
  { date: "Jul 11", desc: "Speed alert (75mph/70 zone)", delta: -2, after: 89 },
  { date: "Jul 10", desc: "On-time HOS log", delta: +1, after: 91 },
  { date: "Jul 9", desc: "Zero-violation day", delta: +3, after: 90 },
  { date: "Jul 8", desc: "DOT inspection passed", delta: +4, after: 87 },
  { date: "Jul 7", desc: "DVIR defect noted (minor)", delta: -1, after: 83 },
];

const drivers = [
  { rank: 1, name: "Ray Davis", score: 98, grade: "A+", streak: 14, trend: "up" },
  { rank: 2, name: "Tony Williams", score: 95, grade: "A", streak: 9, trend: "up" },
  { rank: 3, name: "Derrick Brown", score: 93, grade: "A-", streak: 6, trend: "up" },
  { rank: 4, name: "James Miller", score: 91, grade: "A-", streak: 3, trend: "down", me: true },
  { rank: 5, name: "Andre Johnson", score: 87, grade: "B+", streak: 1, trend: "down" },
];

const gradeColors = { "A+": GREEN, "A": GREEN, "A-": "#0891b2", "B+": AMBER };

function GradeBadge({ grade }) {
  return (
    <span className="sc-grade-badge" style={{ background: gradeColors[grade] + "22", color: gradeColors[grade] }}>
      {grade}
    </span>
  );
}

export default function ScorecardPage() {
  const [tab, setTab] = useState("my");
  const [modalOpen, setModalOpen] = useState(false);
  const [eventType, setEventType] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const dashOffset = CIRCUMFERENCE - (SCORE / 100) * CIRCUMFERENCE;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setModalOpen(false); setEventType(""); }, 2000);
  };

  return (
    <>
      <style>{styles}</style>

      {/* NAV */}
      <nav className="sc-nav">
        <a href="/" className="sc-nav-logo">
          <img src="/static/truckwithease-icon.png" alt="TruckWithEase" />
          <div>
            <div className="sc-nav-label">TruckWithEase</div>
            <div className="sc-nav-sub">Driver Safety Scorecard</div>
          </div>
        </a>
        <div className="sc-nav-links">
          <a href="/">← Back</a>
          <a href="/permit-book">Permits</a>
          <a href="/factoring">Factoring</a>
          <a href="/fuel-card">Fuel Card</a>
          <a href="/#pricing" className="sc-btn-trial">Start Free Trial</a>
        </div>
      </nav>

      {/* STATS BAR */}
      <div className="sc-stats-bar">
        <div className="sc-stat">
          <div className="sc-stat-val">92.8</div>
          <div className="sc-stat-lbl">Fleet Safety Average</div>
        </div>
        <div className="sc-stat">
          <div className="sc-stat-val">Ray Davis</div>
          <div className="sc-stat-lbl">This Week's Top Driver</div>
        </div>
        <div className="sc-stat">
          <div className="sc-stat-val">48/60</div>
          <div className="sc-stat-lbl">Zero-Violation Days</div>
        </div>
        <div className="sc-stat">
          <div className="sc-stat-val">8/8</div>
          <div className="sc-stat-lbl">DOT Inspections Passed</div>
        </div>
      </div>

      {/* TABS */}
      <div className="sc-tabs">
        <div className={`sc-tab${tab === "my" ? " active" : ""}`} onClick={() => setTab("my")}>My Score</div>
        <div className={`sc-tab${tab === "fleet" ? " active" : ""}`} onClick={() => setTab("fleet")}>Fleet Ranking</div>
      </div>

      <div className="sc-content">
        {tab === "my" ? (
          <>
            {/* GAUGE */}
            <div className="sc-gauge-wrap">
              <div className="sc-gauge">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#e2e8f0" strokeWidth="16" />
                  <circle
                    cx="100" cy="100" r={RADIUS}
                    fill="none"
                    stroke={AMBER}
                    strokeWidth="16"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
                  />
                </svg>
                <div className="sc-gauge-inner">
                  <div className="sc-gauge-score">{SCORE}</div>
                  <div className="sc-gauge-total">/100</div>
                </div>
              </div>
              <div className="sc-grade">A-</div>
              <div className="sc-rating">Safety Rating: Satisfactory</div>
            </div>

            <div className="sc-grid">
              {/* SCORE BREAKDOWN */}
              <div className="sc-card">
                <div className="sc-card-title">Score Breakdown</div>
                {breakdowns.map((b) => (
                  <div className="sc-bar-item" key={b.label}>
                    <div className="sc-bar-label">
                      <span>{b.label}</span>
                      <span style={{ color: b.color, fontFamily: "'DM Mono',monospace" }}>{b.pct}%</span>
                    </div>
                    <div className="sc-bar-track">
                      <div className="sc-bar-fill" style={{ width: `${b.pct}%`, background: b.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* RECENT EVENTS */}
              <div className="sc-card">
                <div className="sc-card-title">Recent Events</div>
                <div className="sc-events">
                  {events.map((ev, i) => (
                    <div className="sc-event" key={i}>
                      <div className="sc-event-date">{ev.date}</div>
                      <div className="sc-event-desc">{ev.desc}</div>
                      <div className={`sc-event-delta ${ev.delta > 0 ? "pos" : "neg"}`}>
                        {ev.delta > 0 ? `+${ev.delta}` : ev.delta} pts
                      </div>
                      <div className="sc-event-after">{ev.after}</div>
                    </div>
                  ))}
                </div>
                <button className="sc-log-btn" onClick={() => setModalOpen(true)}>+ Log Safety Event</button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* PODIUM */}
            <div className="sc-card" style={{ marginBottom: 24 }}>
              <div className="sc-card-title" style={{ textAlign: "center" }}>🏆 Top 3 This Week</div>
              <div className="sc-podium">
                {/* Silver */}
                <div className="sc-podium-item">
                  <div className="sc-podium-avatar" style={{ background: "#94a3b8" }}>TW</div>
                  <div className="sc-podium-name">Tony Williams</div>
                  <div className="sc-podium-score">95</div>
                  <div className="sc-podium-block" style={{ width: 70, height: 60, background: "#94a3b8" + "33" }}>🥈</div>
                </div>
                {/* Gold */}
                <div className="sc-podium-item">
                  <div className="sc-podium-avatar" style={{ background: "#F59E0B" }}>RD</div>
                  <div className="sc-podium-name">Ray Davis</div>
                  <div className="sc-podium-score">98</div>
                  <div className="sc-podium-block" style={{ width: 70, height: 80, background: "#F59E0B33" }}>🥇</div>
                </div>
                {/* Bronze */}
                <div className="sc-podium-item">
                  <div className="sc-podium-avatar" style={{ background: "#b45309" }}>DB</div>
                  <div className="sc-podium-name">Derrick Brown</div>
                  <div className="sc-podium-score">93</div>
                  <div className="sc-podium-block" style={{ width: 70, height: 45, background: "#b4530933" }}>🥉</div>
                </div>
              </div>
            </div>

            {/* FULL TABLE */}
            <div className="sc-card">
              <div className="sc-card-title">Full Fleet Ranking</div>
              <table className="sc-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Driver</th>
                    <th>Score</th>
                    <th>Grade</th>
                    <th>Streak</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((d) => (
                    <tr key={d.rank} className={d.me ? "me" : ""}>
                      <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>#{d.rank}</td>
                      <td>{d.name}{d.me ? " (You)" : ""}</td>
                      <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{d.score}</td>
                      <td><GradeBadge grade={d.grade} /></td>
                      <td style={{ fontFamily: "'DM Mono',monospace" }}>{d.streak}d 🔥</td>
                      <td className={d.trend === "up" ? "sc-trend-up" : "sc-trend-down"}>
                        {d.trend === "up" ? "▲" : "▼"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* SAFETY SARGE */}
        <div className="sc-sarge">
          <div className="sc-sarge-icon">🪖</div>
          <div className="sc-sarge-text">
            <strong>Safety Sarge is watching.</strong> Every clean mile counts toward your Diamond tier. Keep your streak alive — one zero-violation week pushes you to the top of the ranking.
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="sc-modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="sc-modal">
            <h3>Log Safety Event</h3>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: GREEN, fontWeight: 700, fontSize: "1.1rem" }}>
                ✅ Event logged successfully!
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>Event Type</label>
                <select value={eventType} onChange={(e) => setEventType(e.target.value)} required>
                  <option value="">Select event type…</option>
                  <option>Clean DVIR</option>
                  <option>On-time HOS log</option>
                  <option>Zero-violation day</option>
                  <option>DOT inspection passed</option>
                  <option>Speed alert</option>
                  <option>DVIR defect noted</option>
                  <option>Other</option>
                </select>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>Notes (optional)</label>
                <textarea rows={3} placeholder="Any additional details…" />
                <div className="sc-modal-actions">
                  <button type="button" className="sc-modal-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
                  <button type="submit" className="sc-modal-submit">Submit Event</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
