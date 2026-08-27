
import { useState, useRef, useEffect, useCallback } from "react";

const NAVY = "#0B2A6B";
const NAVY2 = "#081E4D";
const ORANGE = "#FF6B00";
const AMBER = "#FFB400";
const GREEN = "#16A34A";
const RED = "#DC2626";
const DARK = "#06090F";
const BG = "#0C2340";

const OWM_KEY = "7ed85542aec17128be4f7690b692e357";

// City coords for OpenWeatherMap API calls
const CITY_COORDS = {
  "St. Louis": { lat: 38.6270, lon: -90.1994 },
  "Dallas":    { lat: 32.7767, lon: -96.7970 },
  "Chicago":   { lat: 41.8781, lon: -87.6298 },
  "Denver":    { lat: 39.7392, lon: -104.9903 },
  "Atlanta":   { lat: 33.7490, lon: -84.3880 },
  "Phoenix":   { lat: 33.4484, lon: -112.0740 },
};

function kelvinToF(k) { return Math.round((k - 273.15) * 9/5 + 32); }
function mpsToMph(m) { return Math.round(m * 2.237); }


const CITY_WEATHER = {
  "St. Louis":  { temp: 87,  feels: 92,  icon: "☀️",  condition: "Clear",           wind: 12, gust: 18, humidity: 58, visibility: 10, hazards: [{level:"info",text:"Clear skies, no restrictions"},{level:"caution",text:"High humidity — watch for afternoon storms"},{level:"info",text:"I-70 clear both directions"}] },
  "Dallas":     { temp: 94,  feels: 102, icon: "☀️",  condition: "Hot & Sunny",      wind: 8,  gust: 14, humidity: 42, visibility: 10, hazards: [{level:"caution",text:"High heat advisory — check tire pressure every stop"},{level:"info",text:"I-35 clear, no restrictions"},{level:"info",text:"Low crosswind risk today"}] },
  "Chicago":    { temp: 72,  feels: 70,  icon: "⛈️",  condition: "Thunderstorms",    wind: 22, gust: 38, humidity: 78, visibility: 4,  hazards: [{level:"danger",text:"Wind gust 38 mph — crosswind danger on I-90 bridges"},{level:"danger",text:"Heavy rain reducing visibility to 4 miles"},{level:"caution",text:"I-55 flooding reported near Exit 127"}] },
  "Denver":     { temp: 68,  feels: 65,  icon: "☁️",  condition: "Partly Cloudy",    wind: 15, gust: 25, humidity: 35, visibility: 10, hazards: [{level:"caution",text:"Mountain passes: I-70 chain law possible above 10,000 ft"},{level:"caution",text:"Wind advisories Eisenhower Tunnel area"},{level:"info",text:"Plains corridors clear"}] },
  "Atlanta":    { temp: 83,  feels: 89,  icon: "🌧️",  condition: "Rain Showers",     wind: 10, gust: 16, humidity: 72, visibility: 7,  hazards: [{level:"caution",text:"Rain reducing visibility — wet roads on I-285"},{level:"info",text:"No wind restrictions active"},{level:"info",text:"I-75 and I-85 passable"}] },
  "Phoenix":    { temp: 106, feels: 110, icon: "☀️",  condition: "Extreme Heat",     wind: 6,  gust: 12, humidity: 8,  visibility: 10, hazards: [{level:"danger",text:"Extreme heat — diesel fuel expansion risk, watch gauges"},{level:"danger",text:"Tire blowout risk elevated above 105°F"},{level:"caution",text:"Dust devil activity possible on US-60"}] },
};

const QUICK_CITIES = ["St. Louis", "Dallas", "Chicago", "Denver", "Atlanta", "Phoenix"];

const HOUR_FORECAST = (weather) => {
  const icons = ["☀️","⛅","☁️","🌧️","⛈️","🌨️"];
  return Array.from({ length: 12 }, (_, i) => ({
    hour: `${(new Date().getHours() + i + 1) % 24}:00`,
    temp: weather.temp + Math.round((Math.random() - 0.5) * 10),
    icon: icons[Math.floor(Math.random() * 3)],
    gust: weather.gust + Math.round((Math.random() - 0.5) * 8),
  }));
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_FORECAST = (weather) => DAYS.map(d => ({
  day: d,
  high: weather.temp + Math.round((Math.random() - 0.5) * 12),
  low: weather.temp - 15 + Math.round((Math.random() - 0.5) * 6),
  icon: ["☀️","⛅","🌧️","☁️","⛈️"][Math.floor(Math.random() * 5)],
  precip: Math.round(Math.random() * 80),
  wind: weather.gust + Math.round((Math.random() - 0.5) * 10),
}));

const WANDA_MESSAGES = {
  "St. Louis":  "Weather Wanda here ☀️ St. Louis is clear today, but afternoon humidity could brew some storms by 4pm. Good window to move through now.",
  "Dallas":     "Weather Wanda here 🌡️ Dallas heat advisory is serious — 94°F ambient means road surface could be 130°F+. Check tire pressure at every fuel stop.",
  "Chicago":    "Weather Wanda here ⚠️ Heads up! 38 mph gusts on I-90 bridge overpasses are at the crosswind danger threshold for high-profile loads. Consider delaying.",
  "Denver":     "Weather Wanda here ⛰️ Mountain corridor caution — I-70 chain law is possible above Eisenhower Tunnel. Check CDOT alerts before heading west.",
  "Atlanta":    "Weather Wanda here 🌧️ Atlanta rain is keeping roads wet on the perimeter. Reduce following distance — I-285 interchange gets slick fast.",
  "Phoenix":    "Weather Wanda here 🔥 Phoenix is extreme today. 106°F is not a joke for trucks — check coolant, watch your oil temp gauge, and don't idle too long.",
};

const HAZARD_COLORS = { info: { bg: "rgba(22,163,74,0.1)", border: GREEN, text: GREEN, icon: "✅" }, caution: { bg: "rgba(255,180,0,0.1)", border: AMBER, text: AMBER, icon: "⚠️" }, danger: { bg: "rgba(220,38,38,0.1)", border: RED, text: RED, icon: "🔴" } };

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Poppins', sans-serif; background: ${BG}; color: #E2E8F0; }
  .weather-wrap { min-height: 100vh; background: ${BG}; }

  .weather-nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(8,30,64,0.95); backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255,255,255,0.07);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; height: 56px;
  }
  .nav-brand { font-weight: 700; font-size: 1rem; color: #fff; display: flex; align-items: center; gap: 8px; }
  .nav-links a { color: #94A3B8; text-decoration: none; font-size: 0.85rem; margin-left: 24px; font-weight: 500; }
  .nav-links a:hover { color: #fff; }

  .weather-content { max-width: 1100px; margin: 0 auto; padding: 32px 20px 80px; }

  .page-title { font-size: 1.8rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
  .page-sub { font-size: 0.9rem; color: #64748B; margin-bottom: 28px; }

  .mode-toggle { display: flex; gap: 0; margin-bottom: 28px; background: rgba(255,255,255,0.05); border-radius: 10px; padding: 4px; width: fit-content; }
  .mode-btn {
    padding: 9px 24px; border-radius: 8px; border: none; cursor: pointer;
    font-size: 0.85rem; font-weight: 600; transition: all 0.2s; font-family: 'Poppins', sans-serif;
    background: transparent; color: #64748B;
  }
  .mode-btn.active { background: ${NAVY}; color: #fff; }

  .search-bar { position: relative; margin-bottom: 16px; }
  .search-input {
    width: 100%; padding: 13px 18px 13px 44px; background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
    color: #fff; font-size: 0.95rem; font-family: 'Poppins', sans-serif;
    outline: none; transition: border-color 0.2s;
  }
  .search-input:focus { border-color: ${ORANGE}; }
  .search-input::placeholder { color: #4B5563; }
  .search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #4B5563; font-size: 1.1rem; }

  .quick-cities { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 28px; }
  .city-btn {
    padding: 7px 16px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05); color: #94A3B8; font-size: 0.78rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s; font-family: 'Poppins', sans-serif;
  }
  .city-btn:hover, .city-btn.active { background: ${ORANGE}; color: #fff; border-color: ${ORANGE}; }

  .weather-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
  @media (max-width: 768px) { .weather-grid { grid-template-columns: 1fr; } }

  .glass-card {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 24px;
  }

  .city-name { font-size: 1.3rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
  .condition-text { font-size: 0.85rem; color: #64748B; margin-bottom: 20px; }
  .temp-big { font-size: 4rem; font-weight: 800; color: #fff; font-family: 'DM Mono', monospace; line-height: 1; }
  .weather-icon { font-size: 3rem; margin-left: 16px; }
  .temp-row { display: flex; align-items: center; margin-bottom: 20px; }

  .weather-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .stat-item { background: rgba(255,255,255,0.04); border-radius: 10px; padding: 10px 14px; }
  .stat-label { font-size: 0.68rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
  .stat-val { font-size: 0.95rem; font-weight: 700; color: #E2E8F0; font-family: 'DM Mono', monospace; }
  .gust-warn { color: ${RED}; display: flex; align-items: center; gap: 4px; }

  .section-label { font-size: 0.72rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; }

  .hazard-card {
    padding: 12px 14px; border-radius: 10px; border-left: 3px solid; margin-bottom: 8px;
    display: flex; align-items: flex-start; gap: 10px;
  }
  .hazard-icon { font-size: 1rem; margin-top: 1px; }
  .hazard-text { font-size: 0.78rem; font-weight: 500; line-height: 1.4; }

  .hour-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 8px; }
  .hour-scroll::-webkit-scrollbar { height: 4px; }
  .hour-scroll::-webkit-scrollbar-track { background: transparent; }
  .hour-scroll::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 2px; }
  .hour-card {
    min-width: 70px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px; padding: 12px 8px; text-align: center; flex-shrink: 0;
  }
  .hour-time { font-size: 0.68rem; color: #64748B; font-family: 'DM Mono', monospace; margin-bottom: 8px; }
  .hour-icon { font-size: 1.3rem; margin-bottom: 6px; }
  .hour-temp { font-size: 0.85rem; font-weight: 700; color: #fff; font-family: 'DM Mono', monospace; margin-bottom: 4px; }
  .hour-gust { font-size: 0.65rem; color: #64748B; }

  .day-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .day-row:last-child { border-bottom: none; }
  .day-name { width: 40px; font-size: 0.78rem; font-weight: 600; color: #94A3B8; }
  .day-icon { font-size: 1.2rem; width: 30px; text-align: center; }
  .day-temps { flex: 1; font-family: 'DM Mono', monospace; font-size: 0.8rem; color: #E2E8F0; }
  .day-low { color: #64748B; }
  .day-precip { font-size: 0.72rem; color: #60A5FA; width: 45px; text-align: right; }
  .day-wind { font-size: 0.72rem; color: #64748B; width: 55px; text-align: right; }

  /* Route mode */
  .route-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  @media (max-width: 600px) { .route-inputs { grid-template-columns: 1fr; } }
  .route-input {
    padding: 12px 16px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; color: #fff; font-size: 0.88rem; font-family: 'Poppins', sans-serif; outline: none;
  }
  .route-input:focus { border-color: ${ORANGE}; }
  .route-input::placeholder { color: #4B5563; }
  .check-route-btn {
    padding: 13px 28px; background: ${ORANGE}; color: #fff; font-weight: 700;
    border: none; border-radius: 10px; cursor: pointer; font-size: 0.9rem;
    font-family: 'Poppins', sans-serif; transition: opacity 0.2s; margin-bottom: 24px;
  }
  .check-route-btn:hover { opacity: 0.88; }
  .route-stop-cards { display: flex; gap: 16px; flex-wrap: wrap; }
  .route-stop-card { flex: 1; min-width: 200px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 18px; }
  .stop-label { font-size: 0.68rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .stop-city { font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 4px; }
  .stop-temp { font-size: 2rem; font-weight: 800; font-family: 'DM Mono', monospace; color: #fff; }

  /* Wanda chat */
  .wanda-fab {
    position: fixed; bottom: 24px; right: 24px; z-index: 200;
    background: linear-gradient(135deg, #1a3a6b, #0C2340); border: 1px solid rgba(255,255,255,0.15);
    border-radius: 16px; padding: 16px 20px; max-width: 320px; width: 320px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  }
  .wanda-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .wanda-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, ${NAVY}, ${ORANGE}); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
  .wanda-name { font-size: 0.82rem; font-weight: 700; color: #fff; }
  .wanda-sub { font-size: 0.68rem; color: #64748B; }
  .wanda-msg { font-size: 0.78rem; line-height: 1.5; color: #CBD5E1; background: rgba(255,255,255,0.04); border-radius: 10px; padding: 12px; }

  @media (max-width: 480px) { .wanda-fab { width: calc(100% - 32px); right: 16px; } }
`;

export default function WeatherPage() {
  const [mode, setMode] = useState("area");
  const [liveWeather, setLiveWeather] = useState({});
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Chicago");
  const [search, setSearch] = useState("");
  const [routeOrigin, setRouteOrigin] = useState("");
  const [routeDest, setRouteDest] = useState("");
  const [routeResults, setRouteResults] = useState(null);


  // Fetch real weather from OpenWeatherMap for all 6 cities
  useEffect(() => {
    setWeatherLoading(true);
    const cities = Object.keys(CITY_COORDS);
    Promise.all(
      cities.map(city => {
        const { lat, lon } = CITY_COORDS[city];
        return fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=7ed85542aec17128be4f7690b692e357`
        )
          .then(r => r.json())
          .then(data => {
            if (!data.main) return null;
            const tempF  = kelvinToF(data.main.temp);
            const feelsF = kelvinToF(data.main.feels_like);
            const windMph = mpsToMph(data.wind?.speed || 0);
            const gustMph = mpsToMph(data.wind?.gust  || data.wind?.speed || 0);
            const cond = data.weather?.[0]?.main || '';
            const icon = cond.includes('Thund') ? '⛈️' : cond.includes('Rain') ? '🌧️' : cond.includes('Snow') ? '🌨️' : cond.includes('Cloud') ? '⛅' : cond.includes('Clear') ? '☀️' : '🌤️';
            const desc = data.weather?.[0]?.description || cond;
            // Build truck-specific hazards from real data
            const hazards = [];
            if (gustMph >= 35) hazards.push({ level:"danger",  text:`Wind gusts ${gustMph} mph — crosswind danger for high-profile loads` });
            else if (gustMph >= 20) hazards.push({ level:"caution", text:`Gusts to ${gustMph} mph — reduce speed on exposed bridges` });
            else hazards.push({ level:"info", text:`Wind ${windMph} mph — no restrictions` });
            if (tempF >= 100) hazards.push({ level:"danger",  text:`Extreme heat ${tempF}°F — tire blowout risk elevated, check gauges` });
            else if (tempF >= 90) hazards.push({ level:"caution", text:`High heat — check tire pressure every fuel stop` });
            if (cond.includes('Rain') || cond.includes('Thund')) hazards.push({ level:"caution", text:`${desc} — wet roads, reduce following distance` });
            if (cond.includes('Snow') || cond.includes('Sleet')) hazards.push({ level:"danger", text:`${desc} — chain laws may be active, reduce speed` });
            if (hazards.length === 0) hazards.push({ level:"info", text:`${desc} — no truck-specific restrictions` });
            return [city, { temp:tempF, feels:feelsF, icon, condition:desc.charAt(0).toUpperCase()+desc.slice(1), wind:windMph, gust:gustMph, humidity:data.main.humidity, visibility:Math.round((data.visibility||10000)/1609.34*10)/10, hazards }];
          })
          .catch(() => null);
      })
    ).then(results => {
      const live = {};
      results.forEach(r => { if (r) live[r[0]] = r[1]; });
      if (Object.keys(live).length > 0) setLiveWeather(live);
      setWeatherLoading(false);
    });
  }, []);

  // Use live data if available, fall back to static
  const weather = (liveWeather[selectedCity] || CITY_WEATHER[selectedCity]);
  const hours = HOUR_FORECAST(weather);
  const days = DAY_FORECAST(weather);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const city = QUICK_CITIES.find(c => c.toLowerCase().includes(search.toLowerCase()));
      if (city) setSelectedCity(city);
    }
  };

  const checkRoute = () => {
    const o = QUICK_CITIES.find(c => c.toLowerCase().includes(routeOrigin.toLowerCase())) || QUICK_CITIES[1];
    const d = QUICK_CITIES.find(c => c.toLowerCase().includes(routeDest.toLowerCase())) || QUICK_CITIES[2];
    setRouteResults([
      { label: "Origin", city: o, weather: CITY_WEATHER[o] },
      { label: "Midpoint", city: "St. Louis", weather: CITY_WEATHER["St. Louis"] },
      { label: "Destination", city: d, weather: CITY_WEATHER[d] },
    ]);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="weather-wrap">
        <nav className="weather-nav">
          <div className="nav-brand"><span>🌧️</span> Weather Wanda</div>
          <div className="nav-links">
            <a href="/trip-planner">Trip Planner</a>
            <a href="/command">Command</a>
            <a href="/#pricing" style={{ background: '#FFB400', color: '#06090F', padding: '6px 14px', borderRadius: 7, fontWeight: 800 }}>Free Trial</a>
            <a href="/" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>← Back</a>
          </div>
        </nav>

        <div className="weather-content">
          <div className="page-title">🌩️ Road Weather Center</div>
          <div className="page-sub">Truck-specific weather intelligence — wind, visibility, and hazard alerts that matter for your rig</div>

          <div className="mode-toggle">
            <button className={`mode-btn${mode === "area" ? " active" : ""}`} onClick={() => setMode("area")}>🗺️ Area Weather</button>
            <button className={`mode-btn${mode === "route" ? " active" : ""}`} onClick={() => setMode("route")}>🛣️ Route Weather</button>
          </div>

          {mode === "area" && (
            <>
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input className="search-input" placeholder="Search city or highway..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch} />
              </div>
              <div className="quick-cities">
                {QUICK_CITIES.map(c => (
                  <button key={c} className={`city-btn${selectedCity === c ? " active" : ""}`} onClick={() => setSelectedCity(c)}>{c}</button>
                ))}
              </div>

              <div className="weather-grid">
                {/* Main weather card */}
                <div className="glass-card">
                  <div className="city-name">{selectedCity}</div>
                  <div className="condition-text">{weather.condition}</div>
                  <div className="temp-row">
                    <div className="temp-big">{weather.temp}°</div>
                    <div className="weather-icon">{weather.icon}</div>
                  </div>
                  <div className="weather-stats">
                    <div className="stat-item">
                      <div className="stat-label">Wind</div>
                      <div className="stat-val">{weather.wind} mph</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Gust</div>
                      <div className={`stat-val${weather.gust > 35 ? " gust-warn" : ""}`}>{weather.gust > 35 ? "⚠️ " : ""}{weather.gust} mph</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Visibility</div>
                      <div className="stat-val">{weather.visibility} mi</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Humidity</div>
                      <div className="stat-val">{weather.humidity}%</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Feels Like</div>
                      <div className="stat-val">{weather.feels}°F</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Conditions</div>
                      <div className="stat-val" style={{ fontSize: "0.78rem" }}>{weather.condition}</div>
                    </div>
                  </div>
                </div>

                {/* Truck Hazard Watch */}
                <div className="glass-card">
                  <div className="section-label" style={{ color: ORANGE }}>🚛 Truck Hazard Watch</div>
                  {weather.hazards.map((h, i) => {
                    const colors = HAZARD_COLORS[h.level];
                    return (
                      <div key={i} className="hazard-card" style={{ background: colors.bg, borderLeftColor: colors.border }}>
                        <div className="hazard-icon">{colors.icon}</div>
                        <div className="hazard-text" style={{ color: h.level === "info" ? "#94A3B8" : colors.text }}>{h.text}</div>
                      </div>
                    );
                  })}
                  {weather.gust > 35 && (
                    <div style={{ marginTop: 16, background: "rgba(220,38,38,0.1)", border: `1px solid ${RED}`, borderRadius: 10, padding: "12px 14px", fontSize: "0.78rem", color: RED, fontWeight: 600 }}>
                      ⚠️ Wind gust {weather.gust} mph exceeds 35 mph truck safety threshold
                    </div>
                  )}
                </div>
              </div>

              {/* 12-Hour Forecast */}
              <div className="glass-card" style={{ marginBottom: 20 }}>
                <div className="section-label">12-Hour Forecast</div>
                <div className="hour-scroll">
                  {hours.map((h, i) => (
                    <div key={i} className="hour-card">
                      <div className="hour-time">{h.hour}</div>
                      <div className="hour-icon">{h.icon}</div>
                      <div className="hour-temp">{h.temp}°</div>
                      <div className="hour-gust" style={{ color: h.gust > 35 ? RED : "#64748B" }}>{h.gust}g</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5-Day Outlook */}
              <div className="glass-card">
                <div className="section-label">5-Day Outlook</div>
                {days.map((d, i) => (
                  <div key={i} className="day-row">
                    <div className="day-name">{d.day}</div>
                    <div className="day-icon">{d.icon}</div>
                    <div className="day-temps">
                      <span style={{ fontWeight: 700 }}>{d.high}°</span>
                      <span className="day-low"> / {d.low}°</span>
                    </div>
                    <div className="day-precip">💧 {d.precip}%</div>
                    <div className="day-wind">💨 {d.wind}g</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {mode === "route" && (
            <>
              <div className="route-inputs">
                <input className="route-input" placeholder="📍 Origin city..." value={routeOrigin} onChange={e => setRouteOrigin(e.target.value)} />
                <input className="route-input" placeholder="🏁 Destination city..." value={routeDest} onChange={e => setRouteDest(e.target.value)} />
              </div>
              <button className="check-route-btn" onClick={checkRoute}>Check Route Weather →</button>

              {routeResults && (
                <div className="route-stop-cards">
                  {routeResults.map((stop, i) => {
                    const h = stop.weather;
                    return (
                      <div key={i} className="route-stop-card">
                        <div className="stop-label">{stop.label}</div>
                        <div className="stop-city">{stop.city}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                          <div className="stop-temp">{h.temp}°</div>
                          <div style={{ fontSize: "2rem" }}>{h.icon}</div>
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 10 }}>{h.condition}</div>
                        {h.hazards.slice(0, 2).map((hz, j) => {
                          const c = HAZARD_COLORS[hz.level];
                          return (
                            <div key={j} style={{ background: c.bg, borderLeft: `3px solid ${c.border}`, padding: "8px 10px", borderRadius: 8, marginBottom: 6, fontSize: "0.72rem", color: hz.level === "info" ? "#94A3B8" : c.text }}>
                              {c.icon} {hz.text}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}

              {!routeResults && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#374151" }}>
                  <div style={{ fontSize: "3rem", marginBottom: 12 }}>🛣️</div>
                  <div style={{ fontSize: "0.9rem" }}>Enter origin and destination to check weather along your route</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Wanda Chat Box */}
        <div className="wanda-fab">
          <div className="wanda-header">
            <div className="wanda-avatar">🌩️</div>
            <div>
              <div className="wanda-name">Weather Wanda</div>
              <div className="wanda-sub">Truck Weather AI · Live</div>
            </div>
          </div>
          <div className="wanda-msg">{WANDA_MESSAGES[selectedCity]}</div>
        </div>
      </div>
    </>
  );
}
