import React, { useState, useEffect, useMemo } from "react";

/**
 * Celestial Navigation & Night Driving.
 *
 * What was removed from the previous version:
 *   - Hardcoded sunrise/sunset. The old calculateTwilightTimes() returned
 *     05:30/20:30 in "spring/summer" and 07:00/17:30 otherwise — the same two
 *     pairs of times for every location on earth, and `isNight` (and the night
 *     driving banner) was derived from them. Sunrise/sunset is now computed
 *     from real latitude/longitude with the NOAA solar position equations, for
 *     the location the driver picks.
 *   - driverLocation hardcoded to New York City (40.7128, -74.0060). The page
 *     now uses browser geolocation, falling back to the same ten city presets
 *     the weather service exposes at GET /api/weather/cities.
 *   - The entire "James Webb Space Telescope Views" tab. It published invented
 *     findings under a real telescope's name — "3 new stellar nurseries
 *     detected", "over 1000 young stellar objects catalogued", stellar
 *     temperature ranges — none of which came from any data source.
 *   - The "Night Driving Alerts" live readings, which were all constants:
 *     "next safe rest area: 14 miles ahead", "current visibility: 150 feet",
 *     "hours remaining: 6 hours 23 minutes", "next mandatory break: 1 hour 37
 *     minutes", dew point, and "wind: gusts 12-18 mph". Nothing measured any of
 *     them. That tab is now general night-driving guidance, labelled as
 *     guidance, with links to the pages that hold the real numbers.
 *   - Invented per-constellation "brightness" percentages (0.7-1.0).
 *   - Slate/blue/cyan/purple palette, replaced with gold on black.
 *
 * The star-field dots are decoration only and are positioned from a fixed seed
 * so they do not move between renders.
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

const CITY_FALLBACK = [
  { name: "Springfield, MO", lat: 37.209, lon: -93.2923, tz: "America/Chicago" },
  { name: "St. Louis, MO", lat: 38.627, lon: -90.1994, tz: "America/Chicago" },
  { name: "Kansas City, MO", lat: 39.0997, lon: -94.5786, tz: "America/Chicago" },
  { name: "Dallas, TX", lat: 32.7767, lon: -96.797, tz: "America/Chicago" },
  { name: "Chicago, IL", lat: 41.8781, lon: -87.6298, tz: "America/Chicago" },
  { name: "Denver, CO", lat: 39.7392, lon: -104.9903, tz: "America/Denver" },
  { name: "Atlanta, GA", lat: 33.749, lon: -84.388, tz: "America/New_York" },
  { name: "Phoenix, AZ", lat: 33.4484, lon: -112.074, tz: "America/Phoenix" },
  { name: "Indianapolis, IN", lat: 39.7684, lon: -86.1581, tz: "America/Indiana/Indianapolis" },
  { name: "Salt Lake City, UT", lat: 40.7608, lon: -111.891, tz: "America/Denver" },
];

const deviceTz = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

/* ------------------------------------------------------------------ *
 * NOAA solar position — sunrise, sunset, civil twilight.
 * Source: NOAA Global Monitoring Laboratory solar calculation equations
 * (https://gml.noaa.gov/grad/solcalc/calcdetails.html). No API key, no
 * network call, accurate to about a minute at these latitudes.
 * ------------------------------------------------------------------ */

const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

function julianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function solarEventUTC(date, lat, lon, zenithDeg, rising) {
  // Iterate twice: the equation of time depends on the event time itself.
  let jd = Math.floor(julianDay(date) - 0.5) + 0.5;
  let minutes = 720;
  for (let i = 0; i < 3; i++) {
    const t = (jd + minutes / 1440 - 2451545) / 36525;
    const gml = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360;
    const gma = 357.52911 + t * (35999.05029 - 0.0001537 * t);
    const ecc = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
    const ctr =
      Math.sin(rad(gma)) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
      Math.sin(rad(2 * gma)) * (0.019993 - 0.000101 * t) +
      Math.sin(rad(3 * gma)) * 0.000289;
    const trueLong = gml + ctr;
    const appLong = trueLong - 0.00569 - 0.00478 * Math.sin(rad(125.04 - 1934.136 * t));
    const oblique =
      23 +
      (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60 +
      0.00256 * Math.cos(rad(125.04 - 1934.136 * t));
    const declin = deg(Math.asin(Math.sin(rad(oblique)) * Math.sin(rad(appLong))));
    const vary = Math.tan(rad(oblique / 2)) ** 2;
    const eqTime =
      4 *
      deg(
        vary * Math.sin(2 * rad(gml)) -
          2 * ecc * Math.sin(rad(gma)) +
          4 * ecc * vary * Math.sin(rad(gma)) * Math.cos(2 * rad(gml)) -
          0.5 * vary * vary * Math.sin(4 * rad(gml)) -
          1.25 * ecc * ecc * Math.sin(2 * rad(gma)),
      );
    const cosHa =
      (Math.cos(rad(zenithDeg)) - Math.sin(rad(lat)) * Math.sin(rad(declin))) /
      (Math.cos(rad(lat)) * Math.cos(rad(declin)));
    if (cosHa > 1 || cosHa < -1) return null; // sun never reaches that angle today
    const ha = deg(Math.acos(cosHa)) * (rising ? 1 : -1);
    minutes = 720 - 4 * (lon + ha) - eqTime;
  }
  const utcMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return new Date(utcMidnight + minutes * 60000);
}

function solarTimes(date, lat, lon) {
  return {
    sunrise: solarEventUTC(date, lat, lon, 90.833, true),
    sunset: solarEventUTC(date, lat, lon, 90.833, false),
    dawn: solarEventUTC(date, lat, lon, 96, true),
    dusk: solarEventUTC(date, lat, lon, 96, false),
  };
}

const fmt = (d, tz) =>
  d
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: tz })
    : "—";

/* ------------------------------------------------------------------ *
 * Constellation reference. Astronomy reference content, not measurement.
 * ------------------------------------------------------------------ */

const CONSTELLATIONS = {
  "ursa-major": {
    name: "The Big Dipper (Ursa Major)",
    season: "Circumpolar",
    visibility: "Year-round from the northern US, all night.",
    navigation:
      "The two stars at the end of the bowl point to Polaris — extend that line about five times the gap between them.",
  },
  "ursa-minor": {
    name: "The Little Dipper (Ursa Minor)",
    season: "Circumpolar",
    visibility: "Year-round, circles the pole.",
    navigation: "Polaris is the last star in the handle. It sits over true north.",
  },
  cassiopeia: {
    name: "Cassiopeia",
    season: "Circumpolar",
    visibility: "Year-round; a W or M shape depending on the hour.",
    navigation:
      "Sits on the opposite side of Polaris from the Big Dipper — useful when the Dipper is low or blocked.",
  },
  orion: {
    name: "Orion",
    season: "Winter",
    visibility: "December through March, best in January.",
    navigation:
      "The three belt stars rise close to due east and set close to due west.",
  },
  leo: {
    name: "Leo",
    season: "Spring",
    visibility: "March through May.",
    navigation: "Regulus sits near the ecliptic — a rough east-west reference.",
  },
  scorpius: {
    name: "Scorpius",
    season: "Summer",
    visibility: "June through August, low in the south.",
    navigation:
      "From the northern US it stays low and southerly — when Antares is at its highest, you are looking near due south.",
  },
};

// Fixed decorative star positions (no randomness, so they never jump).
const DECOR_STARS = [
  [12, 18, 2], [27, 9, 3], [41, 24, 2], [58, 14, 2], [73, 28, 3],
  [86, 11, 2], [19, 44, 3], [33, 61, 2], [49, 52, 2], [64, 68, 3],
  [79, 47, 2], [91, 63, 2], [8, 77, 3], [24, 88, 2], [44, 82, 2],
  [61, 91, 3], [77, 84, 2], [93, 79, 2],
];

const TABS = [
  { id: "navigation", label: "Navigate by Stars" },
  { id: "night", label: "Night Driving" },
  { id: "constellations", label: "Constellation Guide" },
];

const AstronomyNavigationPage = () => {
  const [activeTab, setActiveTab] = useState("navigation");
  const [now, setNow] = useState(new Date());
  const [cityIdx, setCityIdx] = useState(0);
  const [coords, setCoords] = useState(null); // {lat, lon} from the browser
  const [geoState, setGeoState] = useState("idle"); // idle | asking | ok | denied
  const [constellationView, setConstellationView] = useState("ursa-major");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const city = CITY_FALLBACK[cityIdx];
  const lat = coords ? coords.lat : city.lat;
  const lon = coords ? coords.lon : city.lon;
  const locLabel = coords
    ? `Your device location (${coords.lat.toFixed(3)}, ${coords.lon.toFixed(3)})`
    : city.name;
  const tz = coords ? deviceTz() : city.tz;

  function askForLocation() {
    if (!navigator.geolocation) {
      setGeoState("denied");
      return;
    }
    setGeoState("asking");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({ lat: p.coords.latitude, lon: p.coords.longitude });
        setGeoState("ok");
      },
      () => setGeoState("denied"),
      { timeout: 10000 },
    );
  }

  const times = useMemo(() => solarTimes(now, lat, lon), [now, lat, lon]);
  const isNight =
    times.sunrise && times.sunset ? now < times.sunrise || now > times.sunset : null;

  const constellation = CONSTELLATIONS[constellationView];

  const label = {
    fontFamily: "Oswald, sans-serif",
    fontSize: ".72rem",
    letterSpacing: ".1em",
    textTransform: "uppercase",
    color: DIM,
  };
  const card = {
    background: CARD,
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    padding: 18,
  };
  const h2 = {
    fontFamily: "Oswald, sans-serif",
    fontSize: "1.05rem",
    fontWeight: 600,
    letterSpacing: ".07em",
    textTransform: "uppercase",
    color: GOLD,
    margin: "0 0 14px",
  };

  return (
    <div
      style={{
        background: BLACK,
        minHeight: "100vh",
        color: "#e8e8e8",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ background: CARD2, padding: "30px 24px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <h1
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "2.4rem",
              letterSpacing: ".04em",
              margin: 0,
              color: GOLDBR,
            }}
          >
            CELESTIAL NAVIGATION &amp; NIGHT DRIVING
          </h1>
          <p style={{ margin: "6px 0 0", color: MUTED, fontSize: ".95rem" }}>
            Real sunrise, sunset and twilight for where you are, plus how to find true north
            without a signal.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 24px 64px" }}>
        {/* Location + solar times */}
        <div style={{ ...card, marginBottom: 22 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div>
              <div style={label}>Location</div>
              <div style={{ fontSize: "1.05rem", color: GOLDBR, fontWeight: 700, marginTop: 4 }}>
                {locLabel}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {!coords && (
                <select
                  value={cityIdx}
                  onChange={(e) => setCityIdx(Number(e.target.value))}
                  style={{
                    background: CARD2,
                    color: "#e8e8e8",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    padding: "9px 12px",
                    fontSize: ".88rem",
                  }}
                >
                  {CITY_FALLBACK.map((c, i) => (
                    <option key={c.name} value={i}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={coords ? () => { setCoords(null); setGeoState("idle"); } : askForLocation}
                style={{
                  background: "transparent",
                  border: `1px solid ${GOLD}`,
                  color: GOLD,
                  borderRadius: 8,
                  padding: "9px 16px",
                  fontFamily: "Oswald, sans-serif",
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  fontSize: ".8rem",
                  cursor: "pointer",
                }}
              >
                {coords ? "Use a city instead" : geoState === "asking" ? "Locating…" : "Use my location"}
              </button>
            </div>
          </div>

          {geoState === "denied" && (
            <p style={{ color: WARN, fontSize: ".84rem", margin: "0 0 14px" }}>
              Location was blocked or unavailable, so times below are for the selected city — not
              for where you are.
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 12,
            }}
          >
            {[
              ["First light (civil dawn)", fmt(times.dawn, tz)],
              ["Sunrise", fmt(times.sunrise, tz)],
              ["Sunset", fmt(times.sunset, tz)],
              ["Full dark (civil dusk)", fmt(times.dusk, tz)],
            ].map(([k, v]) => (
              <div key={k} style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 14 }}>
                <div style={label}>{k}</div>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "1.35rem",
                    color: GOLDBR,
                    marginTop: 6,
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
            <div style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 14 }}>
              <div style={label}>Right now</div>
              <div
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "1.35rem",
                  color: isNight === null ? MUTED : isNight ? WARN : GOLDBR,
                  marginTop: 6,
                }}
              >
                {isNight === null ? "N/A" : isNight ? "DARK" : "DAYLIGHT"}
              </div>
            </div>
          </div>

          <p style={{ margin: "14px 0 0", fontSize: ".8rem", color: DIM, lineHeight: 1.6 }}>
            Computed on this device from latitude/longitude with the NOAA solar position equations —
            no API and no key. Times shown in <strong style={{ color: MUTED }}>{tz}</strong>
            {coords ? " (your device timezone)" : " (the selected city's timezone)"}. Where the sun
            never crosses the horizon — far north in midsummer or midwinter — the field reads N/A
            instead of guessing.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${BORDER}`, marginBottom: 24, flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${activeTab === t.id ? GOLD : "transparent"}`,
                color: activeTab === t.id ? GOLDBR : MUTED,
                padding: "12px 16px",
                fontFamily: "Oswald, sans-serif",
                letterSpacing: ".06em",
                textTransform: "uppercase",
                fontSize: ".85rem",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "navigation" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
            <div>
              <h2 style={h2}>Finding true north without a signal</h2>
              <div style={{ ...card, marginBottom: 14 }}>
                <ul style={{ margin: 0, paddingLeft: 18, color: MUTED, fontSize: ".9rem", lineHeight: 1.75 }}>
                  <li>Find the Big Dipper. The two stars forming the outer lip of the bowl are the pointers.</li>
                  <li>Follow that line away from the bowl about five times the distance between the two stars. The moderately bright star you land on is Polaris.</li>
                  <li>Polaris sits over true north and barely moves all night. Face it and you are facing north.</li>
                  <li>If the Dipper is below the horizon or blocked, use Cassiopeia — it sits on the far side of Polaris.</li>
                  <li>This is a backup for orientation, not for routing. It tells you which way is north, not which way the road goes.</li>
                </ul>
              </div>
              <div style={card}>
                <div style={label}>Selected</div>
                <h3 style={{ margin: "6px 0 8px", color: GOLDBR, fontSize: "1.05rem", fontFamily: "Oswald, sans-serif" }}>
                  {constellation.name}
                </h3>
                <p style={{ margin: "0 0 6px", fontSize: ".88rem", color: MUTED }}>{constellation.visibility}</p>
                <p style={{ margin: 0, fontSize: ".88rem", color: "#e8e8e8" }}>{constellation.navigation}</p>
              </div>
            </div>

            <div>
              <h2 style={h2}>Sky panel</h2>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1 / 1",
                  background: "#060606",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                {DECOR_STARS.map(([l, t, s], i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${l}%`,
                      top: `${t}%`,
                      width: s,
                      height: s,
                      borderRadius: "50%",
                      background: "#4a4a3a",
                    }}
                  />
                ))}
                {constellationView === "ursa-major" && (
                  <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                    <polyline
                      points="26,30 36,34 46,38 56,42 56,58 50,63 42,60"
                      fill="none"
                      stroke="rgba(201,168,76,0.45)"
                      strokeWidth="0.7"
                    />
                    {[[26,30],[36,34],[46,38],[56,42],[56,58],[50,63],[42,60]].map(([x, y], i) => (
                      <circle key={i} cx={x} cy={y} r={1.6} fill={GOLDBR} />
                    ))}
                    <circle cx={72} cy={16} r={2} fill={GOLDBR} />
                    <text x={66} y={11} fill={GOLD} fontSize="3.2">Polaris</text>
                    <line x1="56" y1="42" x2="72" y2="16" stroke="rgba(201,168,76,0.25)" strokeWidth="0.5" strokeDasharray="2 2" />
                  </svg>
                )}
                {constellationView === "orion" && (
                  <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                    {[[36,18],[62,22],[42,48],[50,50],[58,52],[38,78],[64,80]].map(([x, y], i) => (
                      <circle key={i} cx={x} cy={y} r={1.6} fill={GOLDBR} />
                    ))}
                    <line x1="42" y1="48" x2="58" y2="52" stroke="rgba(201,168,76,0.45)" strokeWidth="0.7" />
                    <text x="30" y="60" fill={GOLD} fontSize="3.2">belt → east/west</text>
                  </svg>
                )}
                <div
                  style={{
                    position: "absolute",
                    left: 12,
                    right: 12,
                    bottom: 12,
                    fontSize: ".74rem",
                    color: DIM,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  Diagram only — a shape reference, not a live sky rendering for {locLabel}.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "night" && (
          <div>
            <h2 style={h2}>Night driving guidance</h2>
            <p style={{ color: MUTED, fontSize: ".9rem", margin: "0 0 18px", lineHeight: 1.6 }}>
              General guidance, not readings. This page does not measure your visibility, your dew
              point, your remaining drive time or the distance to the next rest area. The previous
              version printed all of those as if it did — every one was a hardcoded number.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginBottom: 20 }}>
              {[
                {
                  t: "Fatigue window",
                  b: [
                    "The hardest hours on the body are roughly 02:00–06:00 and the hour either side of midnight.",
                    "A 20-minute nap beats coffee for alertness that holds up over the next hour.",
                    "Sleep debt does not clear with a single long night.",
                  ],
                },
                {
                  t: "Visibility",
                  b: [
                    "Low beams reach roughly 150–200 ft; at 65 mph you cover that in under two seconds.",
                    "Speed to what your lights actually show, not to the posted limit.",
                    "Clean the windshield inside as well as out — inside film is what scatters oncoming headlights.",
                  ],
                },
                {
                  t: "Wildlife",
                  b: [
                    "Deer movement peaks around dusk and again before dawn.",
                    "One animal at the shoulder usually means more behind it.",
                    "Brake, do not swerve — a loaded trailer punishes an abrupt lane change.",
                  ],
                },
                {
                  t: "Cold and bridges",
                  b: [
                    "Bridge decks lose heat from both sides and ice before the roadway does.",
                    "Air temperature near freezing with damp pavement is the black ice setup.",
                    "High-profile trailers feel crosswind gusts hardest on open bridges.",
                  ],
                },
              ].map((c) => (
                <div key={c.t} style={card}>
                  <h3 style={{ margin: "0 0 10px", color: GOLDBR, fontSize: "1rem", fontFamily: "Oswald, sans-serif" }}>
                    {c.t}
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: 18, color: MUTED, fontSize: ".87rem", lineHeight: 1.65 }}>
                    {c.b.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div style={{ ...card, background: CARD2 }}>
              <h3 style={{ margin: "0 0 12px", color: GOLD, fontFamily: "Oswald, sans-serif", fontSize: ".95rem", letterSpacing: ".06em", textTransform: "uppercase" }}>
                Where the real numbers live
              </h3>
              <ul style={{ margin: 0, paddingLeft: 18, color: MUTED, fontSize: ".88rem", lineHeight: 1.8 }}>
                <li>
                  Remaining drive time, break timing and the restart window:{" "}
                  <a href="/hos" style={{ color: GOLDBR }}>Hours of Service</a>
                </li>
                <li>
                  Forecast, wind and active National Weather Service warnings:{" "}
                  <a href="/weather" style={{ color: GOLDBR }}>Weather</a>
                </li>
                <li>
                  Somewhere to stop at the end of the clock:{" "}
                  <a href="/parking" style={{ color: GOLDBR }}>Parking</a>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "constellations" && (
          <div>
            <h2 style={h2}>Constellation guide</h2>
            <p style={{ color: MUTED, fontSize: ".88rem", margin: "0 0 18px" }}>
              Reference material for the northern United States. Pick one to load it into the sky
              panel on the first tab.
            </p>
            <div style={{ display: "grid", gap: 12 }}>
              {Object.entries(CONSTELLATIONS).map(([key, c]) => {
                const on = constellationView === key;
                return (
                  <div
                    key={key}
                    onClick={() => setConstellationView(key)}
                    style={{
                      background: on ? CARD : CARD2,
                      border: `1px solid ${on ? GOLD : BORDER}`,
                      borderRadius: 10,
                      padding: 18,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                      <h3 style={{ margin: 0, color: GOLDBR, fontSize: "1.02rem", fontFamily: "Oswald, sans-serif" }}>
                        {c.name}
                      </h3>
                      <span
                        style={{
                          fontSize: ".72rem",
                          color: GOLD,
                          border: `1px solid ${BORDER}`,
                          borderRadius: 4,
                          padding: "3px 8px",
                          whiteSpace: "nowrap",
                          fontFamily: "Oswald, sans-serif",
                          letterSpacing: ".06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {c.season}
                      </span>
                    </div>
                    <p style={{ margin: "0 0 6px", fontSize: ".87rem", color: MUTED }}>{c.visibility}</p>
                    <p style={{ margin: 0, fontSize: ".87rem", color: "#e8e8e8" }}>{c.navigation}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ ...card, background: CARD2, marginTop: 26 }}>
          <h2 style={{ ...h2, margin: "0 0 10px" }}>What this page used to show</h2>
          <ul style={{ margin: 0, paddingLeft: 18, color: MUTED, fontSize: ".87rem", lineHeight: 1.75 }}>
            <li>
              Sunrise 05:30 and sunset 20:30 in summer, 07:00 and 17:30 in winter — the same two
              times for every location on earth, with the night-driving banner triggered off them.
            </li>
            <li>Your location fixed to New York City, whatever you were actually driving.</li>
            <li>
              A James Webb Space Telescope tab publishing invented findings — "3 new stellar
              nurseries detected", "over 1000 young stellar objects catalogued", stellar temperature
              ranges — under a real telescope's name.
            </li>
            <li>
              Night alerts with hardcoded readings: 150 ft visibility, 14 miles to the next rest
              area, 6 h 23 m of drive time left, 12–18 mph gusts.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AstronomyNavigationPage;
