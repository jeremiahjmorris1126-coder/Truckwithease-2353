import { useState, useEffect, useCallback } from "react";

/**
 * Week In Review.
 *
 * Reads GET /api/week-review/:driverId, which counts real rows out of trips,
 * loads, hos_logs, dvir_inspections, speeding_events and safety_scores. The
 * previous version shipped a hardcoded WEEK_DATA object — "Ray Davis",
 * 2,847 miles, 98/100 safety, $847 in deductions, a 31-day clean streak — and
 * presented it as the signed-in driver's week. All of it was invented and it
 * is gone. It also built its own `new PocketBase()` client and wrote signups
 * to a `week_reviews` collection that existed on no server, so the recap
 * opt-in never left the browser. Signups now POST to /api/week-review/subscribe
 * and land in a real table.
 *
 * A metric with no rows renders NOT TRACKED with the reason from the API.
 * Nothing on this page falls back to 0 or 100.
 */

const GOLD = "#C9A84C";
const GOLDBR = "#FFD700";
const BLACK = "#0a0a0a";
const CARD = "#161616";
const CARD2 = "#111111";
const BORDER = "#222222";
const MUTED = "#8a8a8a";
const DIM = "#666666";
const WARN = "#c96a4c";

const styles = `
  .wir *, .wir *::before, .wir *::after { box-sizing: border-box; }
  .wir { min-height: 100vh; background: ${BLACK}; color: #e8e8e8; font-family: 'Inter', system-ui, sans-serif; }
  .wir ::-webkit-scrollbar { width: 4px } .wir ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 2px }

  .wir-nav { position: sticky; top: 0; z-index: 100; height: 58px; padding: 0 5%; display: flex; align-items: center; justify-content: space-between; background: rgba(17,17,17,0.96); border-bottom: 1px solid ${BORDER}; backdrop-filter: blur(10px); }
  .wir-nav-t { font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px; font-size: 1.2rem; color: ${GOLDBR}; }
  .wir-nav a { color: ${MUTED}; font-size: 0.8rem; text-decoration: none; margin-left: 18px; }
  .wir-nav a:hover { color: ${GOLDBR}; }

  .wir-body { max-width: 1100px; margin: 0 auto; padding: 34px 5% 80px; }
  .wir-eyebrow { color: ${GOLD}; font-size: 0.68rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; font-family: 'JetBrains Mono', monospace; }
  .wir-h1 { font-family: 'Oswald', sans-serif; font-size: clamp(1.7rem, 3.4vw, 2.4rem); font-weight: 600; line-height: 1.12; margin: 0 0 10px; color: #fff; }
  .wir-h1 span { color: ${GOLDBR}; }
  .wir-chips { display: flex; gap: 8px; flex-wrap: wrap; }
  .wir-chip { background: ${CARD2}; border: 1px solid ${BORDER}; color: ${MUTED}; font-size: 0.72rem; font-weight: 600; padding: 4px 12px; border-radius: 20px; }
  .wir-chip.gold { border-color: ${GOLD}; color: ${GOLDBR}; }

  .wir-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 26px; flex-wrap: wrap; }
  .wir-btn { background: ${GOLD}; color: ${BLACK}; border: none; border-radius: 10px; padding: 12px 22px; font-weight: 700; font-size: 0.86rem; cursor: pointer; font-family: inherit; white-space: nowrap; }
  .wir-btn.ghost { background: transparent; border: 1px solid ${GOLD}; color: ${GOLDBR}; }
  .wir-btn:disabled { opacity: .55; cursor: default; }

  .wir-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 26px; }
  @media (max-width: 900px) { .wir-grid { grid-template-columns: 1fr 1fr; } }
  .wir-stat { background: ${CARD}; border: 1px solid ${BORDER}; border-radius: 14px; padding: 16px; }
  .wir-stat-k { color: ${DIM}; font-size: 0.66rem; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 8px; }
  .wir-stat-v { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; line-height: 1; color: ${GOLDBR}; }
  .wir-stat-u { color: ${MUTED}; font-size: 0.72rem; margin-top: 5px; }
  .wir-na { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: ${WARN}; letter-spacing: 0.5px; }
  .wir-why { color: ${DIM}; font-size: 0.68rem; line-height: 1.45; margin-top: 6px; }
  .wir-src { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: #4a4a4a; margin-top: 8px; }

  .wir-card { background: ${CARD}; border: 1px solid ${BORDER}; border-radius: 14px; padding: 20px; }
  .wir-label { color: ${GOLD}; font-family: 'Oswald', sans-serif; font-size: 0.76rem; font-weight: 600; letter-spacing: 1.4px; text-transform: uppercase; margin-bottom: 14px; }
  .wir-two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 26px; }
  @media (max-width: 780px) { .wir-two { grid-template-columns: 1fr; } }

  .wir-input { background: ${CARD2}; border: 1px solid ${BORDER}; border-radius: 9px; padding: 11px 14px; font-size: 0.85rem; font-family: inherit; color: #fff; outline: none; flex: 1; min-width: 200px; }
  .wir-input::placeholder { color: ${DIM}; }
  .wir-input:focus { border-color: ${GOLD}; }
  .wir-select { background: ${CARD2}; border: 1px solid ${BORDER}; border-radius: 9px; padding: 9px 12px; color: #fff; font-family: inherit; font-size: 0.82rem; outline: none; }

  .wir-note { border: 1px solid ${BORDER}; background: ${CARD2}; border-radius: 12px; padding: 16px 18px; margin-bottom: 26px; }
  .wir-note li { color: ${MUTED}; font-size: 0.78rem; line-height: 1.6; margin-left: 18px; }
  .wir-err { border: 1px solid ${WARN}; background: rgba(201,106,76,0.08); color: ${WARN}; border-radius: 10px; padding: 14px; font-size: 0.82rem; }
  .wir-ok { border: 1px solid ${GOLD}; background: rgba(201,168,76,0.08); color: ${GOLDBR}; border-radius: 10px; padding: 14px; font-size: 0.83rem; line-height: 1.5; }
`;

function Stat({ label, unit, metric, render }) {
  const has = metric && metric.value !== null && metric.value !== undefined;
  return (
    <div className="wir-stat">
      <div className="wir-stat-k">{label}</div>
      {has ? (
        <>
          <div className="wir-stat-v">{render ? render(metric.value) : metric.value}</div>
          {unit && <div className="wir-stat-u">{unit}</div>}
        </>
      ) : (
        <>
          <div className="wir-na">NOT TRACKED</div>
          <div className="wir-why">{metric?.reason || "No source data."}</div>
        </>
      )}
      {metric?.source && <div className="wir-src">SRC: {metric.source}</div>}
    </div>
  );
}

export default function WeekInReviewPage() {
  const [drivers, setDrivers] = useState([]);
  const [driverId, setDriverId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [subResult, setSubResult] = useState(null);
  const [subError, setSubError] = useState(null);

  useEffect(() => {
    let live = true;
    fetch("/api/fleet/drivers")
      .then((r) => r.json())
      .then((j) => {
        if (!live) return;
        const list = j.drivers || [];
        setDrivers(list);
        if (list[0]) setDriverId(list[0].id);
      })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (!driverId) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/api/week-review/${encodeURIComponent(driverId)}`, { signal: controller.signal })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
        return j;
      })
      .then((j) => { setData(j); setLoading(false); })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError(e.message);
        setData(null);
        setLoading(false);
      });
    return () => controller.abort();
  }, [driverId]);

  const m = data?.metrics;

  const share = useCallback(() => {
    if (!data) return;
    const bits = [];
    if (m?.miles?.value !== null && m?.miles?.value !== undefined) bits.push(`${m.miles.value.toLocaleString()} miles`);
    if (m?.loads?.value) bits.push(`${m.loads.value} loads`);
    if (m?.driveHours?.value !== null && m?.driveHours?.value !== undefined) bits.push(`${m.driveHours.value} drive hours`);
    if (m?.safety?.value?.score) bits.push(`${m.safety.value.score}/100 safety score`);
    const text = bits.length
      ? `My TruckWithEase week (ending ${data.week.weekEnding}): ${bits.join(", ")}. #TruckWithEase`
      : `No logged activity yet this week on TruckWithEase.`;
    if (navigator.share) navigator.share({ title: "My Week on the Road — TruckWithEase", text }).catch(() => {});
    else {
      navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [data, m]);

  function subscribe(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setSubError(null);
    fetch("/api/week-review/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), driverId: driverId || null, weekEnding: data?.week?.weekEnding || null }),
    })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
        return j;
      })
      .then((j) => { setSubResult(j); setSending(false); })
      .catch((err) => { setSubError(err.message); setSending(false); });
  }

  return (
    <div className="wir">
      <style>{styles}</style>

      <nav className="wir-nav">
        <div className="wir-nav-t">YOUR WEEK IN REVIEW</div>
        <div>
          <a href="/driver?driver=1">My Profile</a>
          <a href="/rig-bucks">Points</a>
          <a href="/">← Back</a>
        </div>
      </nav>

      <div className="wir-body">
        <div className="wir-top">
          <div>
            <div className="wir-eyebrow">
              {data ? `WEEK ENDING ${data.week.weekEnding}` : "LOADING WEEK"}
            </div>
            <h1 className="wir-h1">
              {data?.driver?.name || "Driver"}'s<br />
              <span>Week on the Road</span>
            </h1>
            <div className="wir-chips">
              <select className="wir-select" value={driverId} onChange={(e) => setDriverId(e.target.value)}>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} · {d.truckNumber || d.id}</option>
                ))}
              </select>
              {data?.points?.value !== null && data?.points?.value !== undefined && (
                <span className="wir-chip gold">{data.points.value.toLocaleString()} Rig Bucks (lifetime)</span>
              )}
            </div>
          </div>
          <button className={`wir-btn${copied ? " ghost" : ""}`} onClick={share} disabled={!data}>
            {copied ? "Copied" : "Share My Week"}
          </button>
        </div>

        {loading && <div className="wir-card">Loading this driver's logged week…</div>}
        {error && <div className="wir-err">{error}</div>}

        {!loading && !error && data && (
          <>
            <div className="wir-grid">
              <Stat label="Miles Driven" unit="from logged trips" metric={m.miles} render={(v) => v.toLocaleString()} />
              <Stat label="Loads Completed" unit="booked to this driver" metric={m.loads} />
              <Stat label="Drive Hours" unit="closed HOS segments" metric={m.driveHours} />
              <Stat label="Safety Score" unit={m.safety?.value ? `${m.safety.value.grade} · ${m.safety.value.windowDays}-day window` : ""} metric={m.safety} render={(v) => `${v.score}/100`} />
              <Stat label="Load Revenue" unit="sum of booked load rates" metric={m.revenue} render={(v) => `$${v.toLocaleString()}`} />
              <Stat label="DVIRs Submitted" unit={m.dvir?.value ? `${m.dvir.value.withDefects} with defects` : ""} metric={m.dvir} render={(v) => v.submitted} />
              <Stat label="Speeding Events" unit={m.speeding?.value ? `${m.speeding.value.severe} severe` : ""} metric={m.speeding} render={(v) => v.total} />
              <Stat label="Rig Bucks Balance" unit="lifetime, not this week" metric={data.points} render={(v) => v.toLocaleString()} />
            </div>

            <div className="wir-two">
              <div className="wir-card">
                <div className="wir-label">Best Load This Week (by rate per mile)</div>
                {m.bestLoad?.value ? (
                  <>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "1.2rem", color: "#fff", marginBottom: 10 }}>{m.bestLoad.value.lane}</div>
                    <div style={{ display: "flex", gap: 22 }}>
                      <div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: GOLDBR, lineHeight: 1 }}>${m.bestLoad.value.rate.toLocaleString()}</div>
                        <div style={{ color: DIM, fontSize: "0.66rem", marginTop: 4 }}>TOTAL RATE</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: GOLD, lineHeight: 1 }}>${m.bestLoad.value.rpm}</div>
                        <div style={{ color: DIM, fontSize: "0.66rem", marginTop: 4 }}>PER MILE</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: "#fff", lineHeight: 1 }}>{m.bestLoad.value.miles.toLocaleString()}</div>
                        <div style={{ color: DIM, fontSize: "0.66rem", marginTop: 4 }}>MILES</div>
                      </div>
                    </div>
                    <div className="wir-src">SRC: {m.bestLoad.source}</div>
                  </>
                ) : (
                  <>
                    <div className="wir-na">NOT TRACKED</div>
                    <div className="wir-why">{m.bestLoad?.reason}</div>
                  </>
                )}
              </div>

              <div className="wir-card">
                <div className="wir-label">Compliance This Week</div>
                {m.dvir?.value ? (
                  <div style={{ fontSize: "0.83rem", lineHeight: 1.7, color: MUTED }}>
                    <div>{m.dvir.value.submitted} DVIR{m.dvir.value.submitted === 1 ? "" : "s"} submitted</div>
                    <div style={{ color: m.dvir.value.withDefects ? WARN : MUTED }}>{m.dvir.value.withDefects} reported defects</div>
                    <div style={{ color: m.dvir.value.unsafe ? WARN : MUTED }}>{m.dvir.value.unsafe} marked not safe to operate</div>
                    <div style={{ color: m.speeding?.value?.severe ? WARN : MUTED }}>
                      {m.speeding?.value?.total ?? 0} speeding event{(m.speeding?.value?.total ?? 0) === 1 ? "" : "s"}, {m.speeding?.value?.severe ?? 0} severe
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="wir-na">NO DVIR ON FILE THIS WEEK</div>
                    <div className="wir-why">{m.dvir?.reason} A missing inspection is a violation exposure — it is not the same as a clean week, and this page will not score it as one.</div>
                  </>
                )}
              </div>
            </div>

            {data.notTracked?.length > 0 && (
              <div className="wir-note">
                <div className="wir-label" style={{ marginBottom: 10 }}>Not on this recap yet — and why</div>
                <ul>
                  {data.notTracked.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}

            <div className="wir-card">
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "1.05rem", color: "#fff", marginBottom: 6 }}>Get this recap every Friday</div>
              <div style={{ color: MUTED, fontSize: "0.82rem", marginBottom: 16 }}>
                Miles, loads, drive hours, safety score and DVIR status for the week — only the numbers your logs actually contain.
              </div>
              {subResult ? (
                <div className="wir-ok">
                  Saved {subResult.email}. {subResult.delivery?.note}
                </div>
              ) : (
                <form onSubmit={subscribe} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input className="wir-input" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <button className="wir-btn" type="submit" disabled={sending}>{sending ? "Saving…" : "Subscribe"}</button>
                </form>
              )}
              {subError && <div className="wir-err" style={{ marginTop: 12 }}>{subError}</div>}
            </div>

            <div className="wir-src" style={{ marginTop: 18 }}>
              GENERATED {new Date(data.generatedAt).toLocaleString()} · EVERY FIGURE COUNTED FROM DATABASE ROWS · NO ESTIMATES
            </div>
          </>
        )}
      </div>
    </div>
  );
}
