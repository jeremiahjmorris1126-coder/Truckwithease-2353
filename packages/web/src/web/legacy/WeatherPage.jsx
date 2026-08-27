import { useState, useEffect, useCallback } from "react";

/**
 * Road Weather Center.
 *
 * Every number on this page comes from GET /api/weather, which reads the
 * National Weather Service (api.weather.gov). Nothing is generated locally.
 * The previous version hardcoded an OpenWeatherMap API key in browser source
 * and invented the entire hourly and 5-day forecast with Math.random() — both
 * are gone. When NWS has no value for a field the UI shows "—" or
 * "NOT AVAILABLE", never a placeholder number.
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

const HAZARD_STYLE = {
  info: { bg: "rgba(201,168,76,0.07)", border: BORDER, text: MUTED, icon: "•" },
  caution: { bg: "rgba(201,168,76,0.10)", border: GOLD, text: GOLD, icon: "⚠" },
  danger: { bg: "rgba(201,106,76,0.12)", border: WARN, text: WARN, icon: "⚠" },
};

const styles = `
  .wx-wrap *, .wx-wrap *::before, .wx-wrap *::after { box-sizing: border-box; }
  .wx-wrap { min-height: 100vh; background: ${BLACK}; color: #e8e8e8; font-family: 'Inter', system-ui, sans-serif; }

  .wx-nav {
    position: sticky; top: 0; z-index: 100; background: rgba(17,17,17,0.96);
    backdrop-filter: blur(10px); border-bottom: 1px solid ${BORDER};
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; height: 56px;
  }
  .wx-brand { font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px; font-size: 1.25rem; color: ${GOLDBR}; display: flex; align-items: center; gap: 8px; }
  .wx-links a { color: ${MUTED}; text-decoration: none; font-size: 0.85rem; margin-left: 22px; font-weight: 500; }
  .wx-links a:hover { color: ${GOLDBR}; }

  .wx-content { max-width: 1100px; margin: 0 auto; padding: 32px 20px 80px; }
  .wx-title { font-family: 'Oswald', sans-serif; font-size: 1.9rem; font-weight: 600; color: ${GOLDBR}; margin: 0 0 4px; letter-spacing: 0.5px; }
  .wx-sub { font-size: 0.88rem; color: ${MUTED}; margin-bottom: 10px; }
  .wx-source { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; color: ${DIM}; margin-bottom: 26px; }

  .wx-toggle { display: flex; gap: 0; margin-bottom: 24px; background: ${CARD2}; border: 1px solid ${BORDER}; border-radius: 10px; padding: 4px; width: fit-content; }
  .wx-tab { padding: 9px 22px; border-radius: 7px; border: none; cursor: pointer; font-size: 0.84rem; font-weight: 600; background: transparent; color: ${MUTED}; font-family: inherit; transition: all .15s; }
  .wx-tab.on { background: ${GOLD}; color: ${BLACK}; }

  .wx-cities { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
  .wx-city { padding: 7px 15px; border-radius: 9999px; border: 1px solid ${BORDER}; background: ${CARD2}; color: ${MUTED}; font-size: 0.76rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .15s; }
  .wx-city:hover { border-color: ${GOLD}; color: ${GOLDBR}; }
  .wx-city.on { background: ${GOLD}; color: ${BLACK}; border-color: ${GOLD}; }

  .wx-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 20px; }
  @media (max-width: 820px) { .wx-grid { grid-template-columns: 1fr; } }

  .wx-card { background: ${CARD}; border: 1px solid ${BORDER}; border-radius: 14px; padding: 22px; }
  .wx-label { font-family: 'Oswald', sans-serif; font-size: 0.78rem; font-weight: 600; letter-spacing: 1.4px; text-transform: uppercase; color: ${GOLD}; margin-bottom: 14px; }

  .wx-place { font-family: 'Oswald', sans-serif; font-size: 1.35rem; color: #fff; font-weight: 600; }
  .wx-cond { font-size: 0.86rem; color: ${MUTED}; margin-bottom: 14px; }
  .wx-temp { font-family: 'Bebas Neue', sans-serif; font-size: 4.2rem; line-height: 1; color: ${GOLDBR}; }
  .wx-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 18px; }
  .wx-stat { background: ${CARD2}; border: 1px solid ${BORDER}; border-radius: 10px; padding: 10px 12px; }
  .wx-stat-k { font-size: 0.66rem; letter-spacing: 1px; text-transform: uppercase; color: ${DIM}; margin-bottom: 4px; }
  .wx-stat-v { font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; color: #fff; }
  .wx-stat-v.warn { color: ${WARN}; }

  .wx-haz { display: flex; gap: 10px; align-items: flex-start; border-left: 3px solid; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; }
  .wx-haz-t { font-size: 0.79rem; line-height: 1.45; }

  .wx-alert { border: 1px solid ${WARN}; background: rgba(201,106,76,0.10); border-radius: 10px; padding: 14px; margin-bottom: 10px; }
  .wx-alert-h { font-family: 'Oswald', sans-serif; font-size: 0.9rem; color: ${WARN}; font-weight: 600; margin-bottom: 6px; }
  .wx-alert-b { font-size: 0.76rem; color: #d8d8d8; line-height: 1.5; white-space: pre-wrap; max-height: 150px; overflow-y: auto; }

  .wx-hours { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 8px; }
  .wx-hour { min-width: 82px; background: ${CARD2}; border: 1px solid ${BORDER}; border-radius: 10px; padding: 12px 8px; text-align: center; }
  .wx-hour-t { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; color: ${DIM}; margin-bottom: 6px; }
  .wx-hour-d { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; color: ${GOLDBR}; line-height: 1; }
  .wx-hour-s { font-size: 0.6rem; color: ${MUTED}; margin-top: 6px; line-height: 1.25; min-height: 22px; }
  .wx-hour-w { font-family: 'JetBrains Mono', monospace; font-size: 0.64rem; margin-top: 4px; color: ${DIM}; }

  .wx-day { display: grid; grid-template-columns: 130px 1fr 90px 90px; gap: 12px; align-items: center; padding: 12px 0; border-bottom: 1px solid ${BORDER}; }
  .wx-day:last-child { border-bottom: none; }
  .wx-day-n { font-family: 'Oswald', sans-serif; font-size: 0.86rem; color: #fff; font-weight: 500; }
  .wx-day-s { font-size: 0.76rem; color: ${MUTED}; }
  .wx-day-v { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: ${GOLD}; text-align: right; }
  @media (max-width: 640px) { .wx-day { grid-template-columns: 1fr 1fr; } }

  .wx-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  @media (max-width: 640px) { .wx-inputs { grid-template-columns: 1fr; } }
  .wx-select { width: 100%; padding: 12px 14px; background: ${CARD2}; border: 1px solid ${BORDER}; border-radius: 10px; color: #fff; font-size: 0.9rem; font-family: inherit; outline: none; }
  .wx-select:focus { border-color: ${GOLD}; }
  .wx-btn { padding: 12px 26px; border-radius: 10px; border: none; background: ${GOLD}; color: ${BLACK}; font-weight: 700; font-size: 0.88rem; cursor: pointer; font-family: inherit; }
  .wx-btn:disabled { opacity: .5; cursor: default; }

  .wx-empty { text-align: center; padding: 56px 20px; color: ${DIM}; font-size: 0.88rem; }
  .wx-err { border: 1px solid ${WARN}; background: rgba(201,106,76,0.08); color: ${WARN}; border-radius: 10px; padding: 14px; font-size: 0.82rem; }
  .wx-na { font-family: 'JetBrains Mono', monospace; color: ${DIM}; font-size: 0.8rem; }
`;

function fmtHour(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString([], { hour: "numeric" });
}

function Val({ v, suffix = "" }) {
  if (v === null || v === undefined) return <span className="wx-na">—</span>;
  return (
    <>
      {v}
      {suffix}
    </>
  );
}

function HazardList({ items }) {
  if (!items || items.length === 0) return <div className="wx-na">NOT AVAILABLE</div>;
  return items.map((h, i) => {
    const s = HAZARD_STYLE[h.level] || HAZARD_STYLE.info;
    return (
      <div key={i} className="wx-haz" style={{ background: s.bg, borderLeftColor: s.border }}>
        <div style={{ color: s.text }}>{s.icon}</div>
        <div className="wx-haz-t" style={{ color: s.text }}>{h.text}</div>
      </div>
    );
  });
}

export default function WeatherPage() {
  const [mode, setMode] = useState("area");
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState("Springfield, MO");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [origin, setOrigin] = useState("Springfield, MO");
  const [dest, setDest] = useState("Chicago, IL");
  const [routeData, setRouteData] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);

  useEffect(() => {
    let live = true;
    fetch("/api/weather/cities")
      .then((r) => r.json())
      .then((j) => { if (live) setCities(j.cities || []); })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/api/weather?city=${encodeURIComponent(city)}`, { signal: controller.signal })
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
  }, [city]);

  const checkRoute = useCallback(() => {
    setRouteLoading(true);
    setRouteError(null);
    setRouteData(null);
    fetch("/api/weather/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        points: [
          { label: "Origin", city: origin },
          { label: "Destination", city: dest },
        ],
      }),
    })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
        return j;
      })
      .then((j) => { setRouteData(j); setRouteLoading(false); })
      .catch((e) => { setRouteError(e.message); setRouteLoading(false); });
  }, [origin, dest]);

  const cur = data?.current || null;
  const gustWarn = cur?.windHigh !== null && cur?.windHigh !== undefined && cur.windHigh >= 35;

  return (
    <>
      <style>{styles}</style>
      <div className="wx-wrap">
        <nav className="wx-nav">
          <div className="wx-brand">ROAD WEATHER</div>
          <div className="wx-links">
            <a href="/trip-planner">Trip Planner</a>
            <a href="/command">Command</a>
            <a href="/pricing">Pricing</a>
            <a href="/">← Back</a>
          </div>
        </nav>

        <div className="wx-content">
          <h1 className="wx-title">Road Weather Center</h1>
          <div className="wx-sub">Wind, ice, and visibility read straight from the National Weather Service — the hazards that actually change how you drive a rig.</div>
          <div className="wx-source">
            SOURCE: api.weather.gov (NWS) · US COVERAGE ONLY · NO FORECAST VALUE ON THIS PAGE IS ESTIMATED
            {data?.fetchedAt ? ` · FETCHED ${new Date(data.fetchedAt).toLocaleTimeString()}` : ""}
          </div>

          <div className="wx-toggle">
            <button className={`wx-tab${mode === "area" ? " on" : ""}`} onClick={() => setMode("area")}>Area Weather</button>
            <button className={`wx-tab${mode === "route" ? " on" : ""}`} onClick={() => setMode("route")}>Route Weather</button>
          </div>

          {mode === "area" && (
            <>
              <div className="wx-cities">
                {cities.map((c) => (
                  <button key={c.name} className={`wx-city${city === c.name ? " on" : ""}`} onClick={() => setCity(c.name)}>{c.name}</button>
                ))}
              </div>

              {loading && <div className="wx-card">Loading National Weather Service data…</div>}
              {error && <div className="wx-err">Weather unavailable: {error}</div>}

              {!loading && !error && data && (
                <>
                  <div className="wx-grid">
                    <div className="wx-card">
                      <div className="wx-place">
                        {data.location?.city || city}
                        {data.location?.state ? `, ${data.location.state}` : ""}
                      </div>
                      <div className="wx-cond">{cur?.shortForecast || "Conditions not reported"}</div>
                      <div className="wx-temp">{cur?.tempF !== null && cur?.tempF !== undefined ? `${cur.tempF}°` : "—"}</div>
                      <div className="wx-stats">
                        <div className="wx-stat">
                          <div className="wx-stat-k">Wind</div>
                          <div className={`wx-stat-v${gustWarn ? " warn" : ""}`}>{cur?.windText || "—"}</div>
                        </div>
                        <div className="wx-stat">
                          <div className="wx-stat-k">Precip Chance</div>
                          <div className="wx-stat-v"><Val v={cur?.precipPct} suffix="%" /></div>
                        </div>
                        <div className="wx-stat">
                          <div className="wx-stat-k">Forecast Office</div>
                          <div className="wx-stat-v" style={{ fontSize: "0.8rem" }}>{data.location?.office ? data.location.office.split("/").pop() : "—"}</div>
                        </div>
                        <div className="wx-stat">
                          <div className="wx-stat-k">Valid For</div>
                          <div className="wx-stat-v" style={{ fontSize: "0.8rem" }}>{fmtHour(cur?.observedFor)}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 14, fontSize: "0.7rem", color: DIM, lineHeight: 1.5 }}>
                        NWS publishes forecast values, not live station observations, at this endpoint. Humidity and visibility are not part of this feed, so they are not shown rather than guessed.
                      </div>
                    </div>

                    <div className="wx-card">
                      <div className="wx-label">Truck Hazard Watch</div>
                      <HazardList items={data.hazards} />
                      {gustWarn && (
                        <div style={{ marginTop: 14, background: "rgba(201,106,76,0.12)", border: `1px solid ${WARN}`, borderRadius: 10, padding: "12px 14px", fontSize: "0.78rem", color: WARN, fontWeight: 600 }}>
                          Wind to {cur.windHigh} mph is at or above the 35 mph level where states commonly restrict high-profile vehicles. Check the state DOT before you roll.
                        </div>
                      )}
                    </div>
                  </div>

                  {data.alerts && data.alerts.length > 0 && (
                    <div className="wx-card" style={{ marginBottom: 20 }}>
                      <div className="wx-label">Active NWS Alerts ({data.alerts.length})</div>
                      {data.alerts.map((a) => (
                        <div key={a.id} className="wx-alert">
                          <div className="wx-alert-h">{a.event}{a.severity ? ` · ${a.severity}` : ""}</div>
                          <div className="wx-alert-b">{a.headline || a.description || "No detail provided."}</div>
                          {a.instruction && <div className="wx-alert-b" style={{ marginTop: 8, color: MUTED }}>{a.instruction}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="wx-card" style={{ marginBottom: 20 }}>
                    <div className="wx-label">Next 12 Hours</div>
                    {data.hourly && data.hourly.length > 0 ? (
                      <div className="wx-hours">
                        {data.hourly.map((h, i) => (
                          <div key={i} className="wx-hour">
                            <div className="wx-hour-t">{fmtHour(h.startTime)}</div>
                            <div className="wx-hour-d">{h.tempF !== null ? `${h.tempF}°` : "—"}</div>
                            <div className="wx-hour-s">{h.shortForecast || ""}</div>
                            <div className="wx-hour-w" style={{ color: h.windHigh !== null && h.windHigh >= 35 ? WARN : DIM }}>
                              {h.windHigh !== null ? `${h.windHigh} mph` : "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="wx-na">NOT AVAILABLE — NWS returned no hourly periods for this grid point.</div>
                    )}
                  </div>

                  <div className="wx-card">
                    <div className="wx-label">Extended Outlook</div>
                    {data.daily && data.daily.length > 0 ? (
                      data.daily.map((d, i) => (
                        <div key={i} className="wx-day">
                          <div className="wx-day-n">{d.name || "—"}</div>
                          <div className="wx-day-s">{d.shortForecast || "—"}</div>
                          <div className="wx-day-v">{d.tempF !== null ? `${d.tempF}°${d.tempUnit || "F"}` : "—"}</div>
                          <div className="wx-day-v" style={{ color: d.windHigh !== null && d.windHigh >= 35 ? WARN : GOLD }}>
                            {d.windHigh !== null ? `${d.windHigh} mph` : "—"}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="wx-na">NOT AVAILABLE — NWS returned no daily periods for this grid point.</div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {mode === "route" && (
            <>
              <div className="wx-inputs">
                <select className="wx-select" value={origin} onChange={(e) => setOrigin(e.target.value)}>
                  {cities.map((c) => <option key={c.name} value={c.name}>Origin — {c.name}</option>)}
                </select>
                <select className="wx-select" value={dest} onChange={(e) => setDest(e.target.value)}>
                  {cities.map((c) => <option key={c.name} value={c.name}>Destination — {c.name}</option>)}
                </select>
              </div>
              <button className="wx-btn" onClick={checkRoute} disabled={routeLoading}>
                {routeLoading ? "Checking…" : "Check Route Weather →"}
              </button>

              <div style={{ marginTop: 12, fontSize: "0.72rem", color: DIM }}>
                Route weather pulls a real NWS forecast at each stop. Only the preset cities are supported until the map geocoder is wired to this page — no invented midpoints.
              </div>

              {routeError && <div className="wx-err" style={{ marginTop: 18 }}>{routeError}</div>}

              {routeData && (
                <div style={{ marginTop: 20 }}>
                  {routeData.worstHazard && (
                    <div className="wx-alert" style={{ marginBottom: 16 }}>
                      <div className="wx-alert-h">Worst hazard on this lane</div>
                      <div className="wx-alert-b">{routeData.worstHazard.text}</div>
                    </div>
                  )}
                  <div className="wx-grid">
                    {routeData.legs.map((leg, i) => (
                      <div key={i} className="wx-card">
                        <div className="wx-label">{leg.label}</div>
                        {leg.error ? (
                          <div className="wx-err">{leg.error}</div>
                        ) : (
                          <>
                            <div className="wx-place">
                              {leg.location?.city || "—"}
                              {leg.location?.state ? `, ${leg.location.state}` : ""}
                            </div>
                            <div className="wx-cond">{leg.current?.shortForecast || "—"}</div>
                            <div className="wx-temp" style={{ fontSize: "3rem" }}>
                              {leg.current?.tempF !== null && leg.current?.tempF !== undefined ? `${leg.current.tempF}°` : "—"}
                            </div>
                            <div style={{ marginTop: 14 }}>
                              <HazardList items={(leg.hazards || []).slice(0, 3)} />
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!routeData && !routeError && !routeLoading && (
                <div className="wx-empty">Pick an origin and a destination to pull the NWS forecast at each end of the lane.</div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
