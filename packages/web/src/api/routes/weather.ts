import { Hono } from "hono";

/**
 * Road weather — server-side, keyless, government data.
 *
 * Source: National Weather Service API (api.weather.gov). No API key, no
 * billing, US + territories only. Two hops:
 *   1. /points/{lat},{lon}          -> grid + forecast URLs + county/zone
 *   2. /gridpoints/.../forecast     -> 7-day periods
 *      /gridpoints/.../forecast/hourly -> hourly periods
 *   3. /alerts/active?point=lat,lon -> live warnings/advisories
 *
 * Nothing here is invented. When NWS does not return a field, the field is
 * null and the caller renders "NOT AVAILABLE" — never a fabricated number.
 * The previous client-side version hardcoded an OpenWeatherMap key in browser
 * source and generated the whole forecast with Math.random().
 */

const UA = "TruckWithEase/1.0 (truckeasecare@gmail.com)";
const NWS = "https://api.weather.gov";

/** Preset lanes/cities the UI offers. Coordinates are geographic fact. */
export const CITIES: Record<string, { lat: number; lon: number; state: string }> = {
  "Springfield, MO": { lat: 37.2090, lon: -93.2923, state: "MO" },
  "St. Louis, MO": { lat: 38.6270, lon: -90.1994, state: "MO" },
  "Kansas City, MO": { lat: 39.0997, lon: -94.5786, state: "MO" },
  "Dallas, TX": { lat: 32.7767, lon: -96.7970, state: "TX" },
  "Chicago, IL": { lat: 41.8781, lon: -87.6298, state: "IL" },
  "Denver, CO": { lat: 39.7392, lon: -104.9903, state: "CO" },
  "Atlanta, GA": { lat: 33.7490, lon: -84.3880, state: "GA" },
  "Phoenix, AZ": { lat: 33.4484, lon: -112.0740, state: "AZ" },
  "Indianapolis, IN": { lat: 39.7684, lon: -86.1581, state: "IN" },
  "Salt Lake City, UT": { lat: 40.7608, lon: -111.8910, state: "UT" },
};

type Cached = { at: number; body: unknown };
const cache = new Map<string, Cached>();
const TTL_MS = 10 * 60 * 1000; // NWS updates roughly hourly; 10 min is polite.

async function nws(path: string): Promise<unknown> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.body;
  const res = await fetch(path.startsWith("http") ? path : `${NWS}${path}`, {
    headers: { "User-Agent": UA, Accept: "application/geo+json" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`NWS ${res.status} on ${path}`);
  const body = await res.json();
  cache.set(path, { at: Date.now(), body });
  return body;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/** NWS gives wind as a string like "10 to 20 mph" or "15 mph". */
function windMph(s: unknown): { low: number | null; high: number | null; text: string | null } {
  if (typeof s !== "string" || !s.trim()) return { low: null, high: null, text: null };
  const nums = s.match(/\d+/g);
  if (!nums || nums.length === 0) return { low: null, high: null, text: s };
  const vals = nums.map(Number);
  return { low: vals[0] ?? null, high: vals[vals.length - 1] ?? null, text: s };
}

/**
 * Truck-specific hazards, each one derived from a value NWS actually returned.
 * Thresholds are published guidance, not guesses:
 *  - 35 mph+ gust: FMCSA/state high-profile-vehicle wind restriction territory
 *  - 32F or below with precip: ice risk
 *  - visibility handled by NWS alerts (dense fog advisory), not invented here
 */
function hazards(input: {
  tempF: number | null;
  windHigh: number | null;
  precipPct: number | null;
  shortForecast: string | null;
}): { level: "info" | "caution" | "danger"; text: string }[] {
  const out: { level: "info" | "caution" | "danger"; text: string }[] = [];
  const f = (input.shortForecast || "").toLowerCase();
  const w = input.windHigh;
  const t = input.tempF;

  if (w !== null) {
    if (w >= 35) out.push({ level: "danger", text: `Wind to ${w} mph — crosswind risk for high-profile and empty trailers. Many states restrict at this level.` });
    else if (w >= 20) out.push({ level: "caution", text: `Wind to ${w} mph — reduce speed on exposed bridges and overpasses.` });
    else out.push({ level: "info", text: `Wind to ${w} mph — no wind restriction indicated.` });
  }

  if (t !== null) {
    if (t <= 32 && /rain|snow|sleet|freez|ice|wintry|shower|storm/.test(f)) out.push({ level: "danger", text: `${t}°F with precipitation — ice on bridges and ramps. Chain laws may be active.` });
    else if (t <= 32) out.push({ level: "caution", text: `${t}°F — black ice possible on bridges overnight.` });
    else if (t >= 100) out.push({ level: "danger", text: `${t}°F — elevated tire failure risk. Check pressure cold, watch coolant and oil temp.` });
    else if (t >= 90) out.push({ level: "caution", text: `${t}°F — check tire pressure at every fuel stop.` });
  }

  if (/thunder/.test(f)) out.push({ level: "caution", text: "Thunderstorms — sudden gust fronts and standing water. Increase following distance." });
  if (/snow|sleet|freezing|wintry|blizzard/.test(f)) out.push({ level: "danger", text: `${input.shortForecast} — winter driving conditions. Check state chain law before departure.` });
  if (/fog/.test(f)) out.push({ level: "caution", text: "Fog — reduced visibility. Low beams, no hazards while moving." });

  if (input.precipPct !== null && input.precipPct >= 60) out.push({ level: "caution", text: `${input.precipPct}% chance of precipitation — wet roads likely.` });

  if (out.length === 0) out.push({ level: "info", text: "No truck-specific hazard indicated by the current NWS forecast." });
  return out;
}

type Period = Record<string, unknown>;

function mapDaily(p: Period) {
  const wind = windMph(p.windSpeed);
  const temp = num(p.temperature);
  const precip = num((p.probabilityOfPrecipitation as Record<string, unknown> | undefined)?.value);
  return {
    name: (p.name as string) ?? null,
    startTime: (p.startTime as string) ?? null,
    isDaytime: p.isDaytime === true,
    tempF: temp,
    tempUnit: (p.temperatureUnit as string) ?? "F",
    precipPct: precip,
    windText: wind.text,
    windHigh: wind.high,
    windDirection: (p.windDirection as string) ?? null,
    shortForecast: (p.shortForecast as string) ?? null,
    detailedForecast: (p.detailedForecast as string) ?? null,
  };
}

function mapHourly(p: Period) {
  const wind = windMph(p.windSpeed);
  return {
    startTime: (p.startTime as string) ?? null,
    tempF: num(p.temperature),
    precipPct: num((p.probabilityOfPrecipitation as Record<string, unknown> | undefined)?.value),
    windHigh: wind.high,
    windText: wind.text,
    shortForecast: (p.shortForecast as string) ?? null,
  };
}

async function forecastFor(lat: number, lon: number) {
  const point = (await nws(`/points/${lat.toFixed(4)},${lon.toFixed(4)}`)) as {
    properties?: {
      forecast?: string;
      forecastHourly?: string;
      relativeLocation?: { properties?: { city?: string; state?: string } };
      forecastOffice?: string;
      timeZone?: string;
    };
  };
  const props = point.properties ?? {};
  const rel = props.relativeLocation?.properties ?? {};

  const [daily, hourly, alerts] = await Promise.all([
    props.forecast ? nws(props.forecast).catch(() => null) : null,
    props.forecastHourly ? nws(props.forecastHourly).catch(() => null) : null,
    nws(`/alerts/active?point=${lat.toFixed(4)},${lon.toFixed(4)}`).catch(() => null),
  ]);

  const dailyPeriods = (((daily as Record<string, any>)?.properties?.periods ?? []) as Period[]).slice(0, 10).map(mapDaily);
  const hourlyPeriods = (((hourly as Record<string, any>)?.properties?.periods ?? []) as Period[]).slice(0, 12).map(mapHourly);
  const alertList = (((alerts as Record<string, any>)?.features ?? []) as Record<string, any>[]).map((f) => ({
    id: (f.id as string) ?? null,
    event: f.properties?.event ?? null,
    severity: f.properties?.severity ?? null,
    urgency: f.properties?.urgency ?? null,
    headline: f.properties?.headline ?? null,
    description: f.properties?.description ?? null,
    instruction: f.properties?.instruction ?? null,
    areaDesc: f.properties?.areaDesc ?? null,
    ends: f.properties?.ends ?? f.properties?.expires ?? null,
  }));

  const now = hourlyPeriods[0] ?? null;
  const today = dailyPeriods[0] ?? null;

  return {
    location: {
      lat,
      lon,
      city: rel.city ?? null,
      state: rel.state ?? null,
      office: props.forecastOffice ?? null,
      timeZone: props.timeZone ?? null,
    },
    current: now
      ? {
          tempF: now.tempF,
          windHigh: now.windHigh,
          windText: now.windText,
          precipPct: now.precipPct,
          shortForecast: now.shortForecast,
          observedFor: now.startTime,
        }
      : null,
    hazards: hazards({
      tempF: now?.tempF ?? today?.tempF ?? null,
      windHigh: now?.windHigh ?? today?.windHigh ?? null,
      precipPct: now?.precipPct ?? today?.precipPct ?? null,
      shortForecast: now?.shortForecast ?? today?.shortForecast ?? null,
    }),
    hourly: hourlyPeriods,
    daily: dailyPeriods,
    alerts: alertList,
    source: "National Weather Service (api.weather.gov)",
    fetchedAt: new Date().toISOString(),
  };
}

export const weather = new Hono()
  /** Preset cities the page offers. */
  .get("/cities", (c) =>
    c.json(
      {
        cities: Object.entries(CITIES).map(([name, v]) => ({ name, ...v })),
        coverage: "United States and territories only — NWS does not cover Canada or Mexico.",
      },
      200,
    ),
  )

  /** GET /api/weather?lat=&lon=  or  ?city=Chicago,%20IL */
  .get("/", async (c) => {
    const cityParam = c.req.query("city");
    let lat = Number(c.req.query("lat"));
    let lon = Number(c.req.query("lon"));

    if (cityParam) {
      const key = Object.keys(CITIES).find((k) => k.toLowerCase() === cityParam.toLowerCase());
      if (!key) return c.json({ error: `Unknown preset city "${cityParam}". Call /api/weather/cities for the list, or pass lat and lon.` }, 400);
      lat = CITIES[key]!.lat;
      lon = CITIES[key]!.lon;
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return c.json({ error: "Pass lat and lon, or city." }, 400);
    }

    try {
      return c.json(await forecastFor(lat, lon), 200);
    } catch (err) {
      return c.json(
        {
          error: "National Weather Service is not reachable right now.",
          detail: err instanceof Error ? err.message : String(err),
          hint: "NWS covers the United States only. Coordinates outside US coverage return an error.",
        },
        502,
      );
    }
  })

  /** Route weather: origin, midpoints, destination. POST { points: [{label, lat, lon}] } */
  .post("/route", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { points?: { label?: string; lat?: number; lon?: number; city?: string }[] };
    const points = Array.isArray(body.points) ? body.points.slice(0, 6) : [];
    if (points.length === 0) return c.json({ error: "Pass points: [{ label, lat, lon }] or [{ label, city }]." }, 400);

    const legs = await Promise.all(
      points.map(async (p) => {
        let lat = p.lat;
        let lon = p.lon;
        if (p.city) {
          const key = Object.keys(CITIES).find((k) => k.toLowerCase() === p.city!.toLowerCase());
          if (key) {
            lat = CITIES[key]!.lat;
            lon = CITIES[key]!.lon;
          }
        }
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          return { label: p.label ?? p.city ?? "Unknown", error: "No usable coordinates for this stop." };
        }
        try {
          return { label: p.label ?? p.city ?? "Stop", ...(await forecastFor(lat as number, lon as number)) };
        } catch (err) {
          return { label: p.label ?? p.city ?? "Stop", error: err instanceof Error ? err.message : String(err) };
        }
      }),
    );

    const worst = legs
      .flatMap((l) => ("hazards" in l ? (l.hazards as { level: string; text: string }[]) : []))
      .find((h) => h.level === "danger");

    return c.json({ legs, worstHazard: worst ?? null, source: "National Weather Service (api.weather.gov)" }, 200);
  });

export default weather;
