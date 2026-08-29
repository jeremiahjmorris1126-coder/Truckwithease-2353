/**
 * /api/dispatch-zero — DISPATCH ZERO: the Signed Dispatch Decision Ledger.
 *
 * WHAT THIS IS
 * Every other platform records WHAT happened. This records WHY a load was
 * assigned to a driver, at the moment of assignment, and then seals it in a
 * SHA-256 hash chain so the record cannot be quietly edited afterwards.
 *
 * THE SEVEN INPUTS, all read live, none invented:
 *   1. Feasibility  — hos_logs, via computeClocks() from routes/hos.ts (49 CFR 395)
 *   2. Route        — Google Directions (car profile; NOT truck-legal)
 *   3. Clearance    — low_bridges, FHWA NBI 2025 item 54B, corridor scan
 *   4. Safety fit   — computeSafetyScore() from routes/safety.ts
 *   5. Economics    — rate / miles = RPM, and revenue per REMAINING CLOCK HOUR
 *   6. Honesty      — per-decision list of inputs that were LIVE vs MISSING
 *   7. Hash chain   — payloadHash = sha256(canonicalJson(decision));
 *                     chainHash   = sha256(seq | prevHash | payloadHash)
 *
 * THE NOVEL METRIC: revenue per remaining-clock-hour. The scarce resource in
 * dispatch is legal clock seconds, not miles. A $3.72/mi load is worth nothing
 * to a driver with 40 minutes of drive time left. Load boards rank by RPM.
 * Dispatch Zero ranks by revenue ÷ the hours the driver may legally still drive.
 *
 * WHAT THE CHAIN PROVES: the record was not altered or back-dated.
 * WHAT IT DOES NOT PROVE: that the inputs were correct. Route data has no truck
 * profile. The clearance layer is an annual, self-reported federal advisory.
 * Both limits are repeated in every response and on the page.
 *
 * MISSING INPUTS are named per decision, never defaulted: fuel price at pickup,
 * weather at ETA, broker detention history, IFTA jurisdiction miles.
 */
import { createHash } from "node:crypto";
import { Hono } from "hono";
import { sql, eq, desc } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { computeClocks, hosViolations } from "./hos";
import { computeSafetyScore } from "./safety";

const dispatchZero = new Hono();

const DIRECTIONS = "https://maps.googleapis.com/maps/api/directions/json";
const METERS_PER_MILE = 1609.344;
const STANDARD_TRAILER_IN = 162; // 13'6"
const CORRIDOR_MI = 0.4;

const CHAIN_ALGO = "sha256";
const GENESIS = "0".repeat(64);

const LIMITS_NOTE =
  "The hash chain proves this record was not altered after it was written. It does not prove the inputs were correct.";
const ROUTE_NOTE =
  "Route distance and drive time come from Google Directions, which has no truck profile. Weight, axle, hazmat and truck-prohibited restrictions are NOT applied.";
const CLEARANCE_NOTE =
  "Clearance flags come from the FHWA National Bridge Inventory 2025 (item 54B). NBI is annual and self-reported; local and municipal structures are frequently absent. Zero flagged bridges means no data for that corridor, never 'clear'.";

/** Inputs we deliberately do NOT have. Named on every decision. */
const KNOWN_MISSING = [
  { key: "fuelPriceAtPickup", why: "No fuel-price feed is wired to this decision path, so net margin is not computed." },
  { key: "weatherAtEta", why: "Forecast is fetched per-page from NWS, not joined to the decision record." },
  { key: "brokerDetentionHistory", why: "No detention claims have been recorded yet, so broker dwell risk is unknown." },
  { key: "iftaJurisdictionMiles", why: "State-by-state mileage split needs a truck-legal routing engine. Google Directions does not return it." },
  { key: "truckLegalRouting", why: "Route is a car route. Truck-legal miles (PC*MILER-class) are not licensed." },
];

const rid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

async function rawRows(q: string): Promise<any[]> {
  const r: any = await db.run(sql.raw(q));
  return (r?.rows ?? []) as any[];
}

function ftIn(inches: number) {
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

const HAVERSINE_MI = 3958.7613;
function distMi(aLat: number, aLng: number, bLat: number, bLng: number) {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLng = (bLng - aLng) * rad;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * HAVERSINE_MI * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** Google encoded-polyline decoder — same implementation as routes/bridges.ts. */
function decodePolyline(str: string): { lat: number; lng: number }[] {
  const out: { lat: number; lng: number }[] = [];
  let i = 0;
  let lat = 0;
  let lng = 0;
  while (i < str.length) {
    let shift = 0;
    let result = 0;
    let b: number;
    do {
      b = str.charCodeAt(i++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;
    do {
      b = str.charCodeAt(i++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    out.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return out;
}

function mapsKey(): string {
  return (process.env.GOOGLE_MAPS_KEY || process.env.VITE_GOOGLE_MAPS_KEY || "").replace(/^"|"$/g, "").trim();
}

/** Deterministic JSON: keys sorted at every level. Two identical decisions hash identically. */
function canonical(v: any): string {
  if (v === null || typeof v === "number" || typeof v === "boolean") return JSON.stringify(v);
  if (typeof v === "string") return JSON.stringify(v);
  if (v === undefined) return "null";
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  const keys = Object.keys(v).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(",")}}`;
}

function sha256(s: string): string {
  // node:crypto, not Bun.CryptoHasher: the Vite dev server runs the API under
  // Node, where the Bun global does not exist. Same digest either way.
  return createHash("sha256").update(s, "utf8").digest("hex");
}

function chainHashOf(seq: number, prevHash: string, payloadHash: string) {
  return sha256(`${seq}|${prevHash}|${payloadHash}`);
}

// ---------------------------------------------------------------------------
// The seven inputs
// ---------------------------------------------------------------------------

async function routePlan(origin: string, destination: string) {
  const key = mapsKey();
  if (!key) return { live: false, error: "No Google Maps key configured on the server.", miles: null as number | null, seconds: null as number | null, polyline: null as string | null, summary: null as string | null };
  const params = new URLSearchParams({ origin, destination, key });
  const started = Date.now();
  try {
    const res = await fetch(`${DIRECTIONS}?${params.toString()}`, { signal: AbortSignal.timeout(20000) });
    const payload: any = await res.json();
    if (payload?.status !== "OK") {
      return { live: false, error: `Google Directions: ${payload?.status ?? "unknown"}${payload?.error_message ? ` — ${payload.error_message}` : ""}`, miles: null, seconds: null, polyline: null, summary: null };
    }
    const legs = payload.routes?.[0]?.legs ?? [];
    const meters = legs.reduce((s: number, l: any) => s + (l.distance?.value ?? 0), 0);
    const seconds = legs.reduce((s: number, l: any) => s + (l.duration?.value ?? 0), 0);
    return {
      live: true,
      error: null as string | null,
      latencyMs: Date.now() - started,
      miles: Math.round((meters / METERS_PER_MILE) * 10) / 10,
      seconds,
      polyline: payload.routes?.[0]?.overview_polyline?.points ?? null,
      summary: payload.routes?.[0]?.summary ?? null,
      resolvedOrigin: legs[0]?.start_address ?? null,
      resolvedDestination: legs[legs.length - 1]?.end_address ?? null,
      truckProfile: false,
    };
  } catch (err) {
    return { live: false, error: `Directions request failed: ${(err as Error).message}`, miles: null, seconds: null, polyline: null, summary: null };
  }
}

/** Corridor scan against the imported NBI low_bridges table. */
async function clearanceScan(polyline: string | null, heightIn: number) {
  if (!polyline) {
    return { live: false, error: "No route polyline, so no corridor could be scanned.", count: 0, lowest: null as any, bridges: [] as any[] };
  }
  let path: { lat: number; lng: number }[];
  try {
    path = decodePolyline(polyline);
  } catch (err) {
    return { live: false, error: `Could not decode polyline: ${(err as Error).message}`, count: 0, lowest: null, bridges: [] };
  }
  if (path.length < 2) {
    return { live: false, error: "Route polyline had fewer than 2 points.", count: 0, lowest: null, bridges: [] };
  }

  const stride = Math.max(1, Math.ceil(path.length / 400));
  const samples = path.filter((_, i) => i % stride === 0 || i === path.length - 1);
  const minLat = Math.min(...path.map((p) => p.lat));
  const maxLat = Math.max(...path.map((p) => p.lat));
  const minLng = Math.min(...path.map((p) => p.lng));
  const maxLng = Math.max(...path.map((p) => p.lng));
  const padLat = CORRIDOR_MI / 69;
  const padLng = CORRIDOR_MI / Math.max(1, 69 * Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180));

  let candidates: any[];
  try {
    candidates = await rawRows(
      `SELECT * FROM low_bridges
       WHERE lat BETWEEN ${minLat - padLat} AND ${maxLat + padLat}
         AND lng BETWEEN ${minLng - padLng} AND ${maxLng + padLng}
         AND clearance_in < ${Math.round(heightIn)}
       LIMIT 5000`,
    );
  } catch (err) {
    return { live: false, error: `low_bridges query failed: ${(err as Error).message}`, count: 0, lowest: null, bridges: [] };
  }

  const hits: any[] = [];
  for (const r of candidates) {
    const bLat = Number(r.lat);
    const bLng = Number(r.lng);
    let best = Infinity;
    for (let i = 0; i < samples.length; i++) {
      const d = distMi(samples[i].lat, samples[i].lng, bLat, bLng);
      if (d < best) best = d;
      if (best <= CORRIDOR_MI / 4) break;
    }
    if (best <= CORRIDOR_MI) {
      const clr = Number(r.clearance_in);
      hits.push({
        structureNumber: String(r.structure_number || "").trim(),
        state: String(r.state_abbr),
        lat: bLat,
        lng: bLng,
        clearanceIn: clr,
        clearance: ftIn(clr),
        deficitIn: Math.round(heightIn) - clr,
        under: String(r.under_ref) === "R" ? "railroad" : "highway",
        location: r.location ? String(r.location) : null,
        facilityCarried: r.facility_carried ? String(r.facility_carried) : null,
        offRouteMi: Math.round(best * 100) / 100,
        suspect: Number(r.suspect) === 1,
      });
    }
  }
  hits.sort((a, b) => a.clearanceIn - b.clearanceIn);
  return {
    live: true,
    error: null as string | null,
    corridorMi: CORRIDOR_MI,
    routePoints: path.length,
    pointsSampled: samples.length,
    count: hits.length,
    lowest: hits[0] ?? null,
    bridges: hits.slice(0, 25),
    zeroMeansNoData: "Zero flagged bridges means no qualifying NBI record in this corridor, not that the corridor is clear.",
  };
}

type Candidate = {
  driverId: string;
  name: string;
  truckNumber: string | null;
  homeBase: string | null;
  verdict: "go" | "advisory" | "blocked";
  blockers: string[];
  advisories: string[];
  clock: {
    drivingRemainingMin: number;
    drivingRemainingHours: number;
    windowRemainingMin: number;
    driveTimeNeededMin: number | null;
    clockShortfallMin: number | null;
    hosViolations: { level: string; msg: string }[];
  };
  safety: { score: number | null; grade: string | null; insufficientData: boolean; missing: string[]; error?: string };
  economics: {
    rate: number | null;
    miles: number | null;
    rpm: number | null;
    revenuePerClockHour: number | null;
    revenuePerClockHourNote: string;
  };
  rank: number | null;
};

// ---------------------------------------------------------------------------
// POST /score
// ---------------------------------------------------------------------------
dispatchZero.post("/score", async (c) => {
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Body must be JSON." }, 400);
  }

  const heightIn = Number(body.heightIn ?? STANDARD_TRAILER_IN);
  if (!Number.isFinite(heightIn) || heightIn < 100 || heightIn > 200) {
    return c.json({ error: "heightIn must be between 100 and 200 inches (13'6\" = 162)." }, 400);
  }

  // Load: either an existing row, or an ad-hoc quote
  let load: any = null;
  if (body.loadId) {
    const rowsFound = await db.select().from(schema.loads).where(eq(schema.loads.id, String(body.loadId)));
    load = rowsFound[0] ?? null;
    if (!load) return c.json({ error: `No load with id ${body.loadId}.` }, 404);
  } else {
    const origin = String(body.origin || "").trim();
    const destination = String(body.destination || "").trim();
    if (!origin || !destination) {
      return c.json({ error: "Pass loadId, or origin + destination (+ optional rate)." }, 400);
    }
    load = {
      id: null,
      origin,
      destination,
      rate: body.rate === undefined || body.rate === null || body.rate === "" ? null : Number(body.rate),
      miles: body.miles === undefined || body.miles === null || body.miles === "" ? null : Number(body.miles),
      equipment: body.equipment ?? null,
      weight: body.weight ?? null,
      broker: body.broker ?? null,
    };
  }

  // Input 2 — route
  const route = await routePlan(String(load.origin), String(load.destination));
  // Input 3 — clearance
  const clearance = await clearanceScan(route.polyline ?? null, heightIn);

  const miles = route.live && route.miles !== null ? route.miles : (load.miles !== null && load.miles !== undefined ? Number(load.miles) : null);
  const milesSource = route.live && route.miles !== null ? "google-directions" : (load.miles ? "load record" : null);
  const driveMin = route.live && route.seconds ? Math.round(route.seconds / 60) : null;
  const rate = load.rate === null || load.rate === undefined ? null : Number(load.rate);
  const rpm = rate !== null && miles ? Math.round((rate / miles) * 100) / 100 : null;

  // Inputs 1, 4, 5 — per driver
  const driverFilter = body.driverId ? String(body.driverId) : null;
  const allDrivers = await db.select().from(schema.drivers);
  const drivers = driverFilter ? allDrivers.filter((d) => d.id === driverFilter) : allDrivers;
  if (!drivers.length) {
    return c.json({ error: driverFilter ? `No driver with id ${driverFilter}.` : "No drivers on file." }, 404);
  }

  const candidates: Candidate[] = [];
  for (const d of drivers) {
    const logs = await db.select().from(schema.hosLogs).where(eq(schema.hosLogs.driverId, d.id));
    const clocks = computeClocks(logs);
    const hv = hosViolations(clocks);

    let safety: Candidate["safety"];
    try {
      const s = await computeSafetyScore(d.id);
      safety = {
        score: typeof s.score === "number" ? s.score : null,
        grade: (s as any).grade ?? null,
        insufficientData: !!(s as any).insufficientData,
        missing: ((s as any).componentsMissing ?? []) as string[],
      };
    } catch (err) {
      safety = { score: null, grade: null, insufficientData: true, missing: [], error: (err as Error).message };
    }

    const blockers: string[] = [];
    const advisories: string[] = [];

    // 1 — HOS feasibility. This is a hard stop, not a warning.
    const drivingRemaining = clocks.drivingRemaining;
    const windowRemaining = clocks.onDutyWindowRemaining;
    let shortfall: number | null = null;
    if (drivingRemaining <= 0) {
      blockers.push("No driving time left on the 11-hour clock. Assigning this load would require an HOS violation.");
    } else if (driveMin !== null) {
      if (driveMin > drivingRemaining) {
        shortfall = driveMin - drivingRemaining;
        blockers.push(`Route needs ${driveMin} min of driving; only ${drivingRemaining} min remain on the 11-hour clock (short by ${shortfall} min). Requires a split with a 10-hour reset.`);
      }
      if (driveMin > windowRemaining) {
        blockers.push(`Route needs ${driveMin} min; only ${windowRemaining} min remain in the 14-hour on-duty window.`);
      }
    }
    if (driveMin === null) advisories.push("Drive time is unknown because the route did not resolve, so HOS feasibility could not be checked against the route.");
    for (const v of hv) {
      if (v.level === "danger") blockers.push(`HOS: ${v.msg}`);
      else advisories.push(`HOS: ${v.msg}`);
    }

    // 3 — clearance (advisory, never a hard block: NBI is incomplete)
    if (clearance.live && clearance.count > 0) {
      advisories.push(`${clearance.count} NBI bridge${clearance.count === 1 ? "" : "s"} below ${ftIn(Math.round(heightIn))} within ${CORRIDOR_MI} mi of this route. Lowest ${clearance.lowest?.clearance} in ${clearance.lowest?.state}.`);
    } else if (!clearance.live) {
      advisories.push(`Clearance scan did not run: ${clearance.error}`);
    }

    // 4 — safety fit
    if (safety.insufficientData) advisories.push("Safety score is based on insufficient data for this window — not used to rank.");
    else if (safety.score !== null && safety.score < 70) advisories.push(`Safety score ${safety.score} is below 70. Consider a different driver for a high-exposure lane.`);

    // 5 — economics: the novel metric
    const clockHours = drivingRemaining / 60;
    const revenuePerClockHour = rate !== null && clockHours > 0 ? Math.round((rate / clockHours) * 100) / 100 : null;

    candidates.push({
      driverId: d.id,
      name: d.name,
      truckNumber: d.truckNumber ?? null,
      homeBase: (d as any).homeBase ?? null,
      verdict: blockers.length ? "blocked" : advisories.length ? "advisory" : "go",
      blockers,
      advisories,
      clock: {
        drivingRemainingMin: drivingRemaining,
        drivingRemainingHours: Math.round((drivingRemaining / 60) * 100) / 100,
        windowRemainingMin: windowRemaining,
        driveTimeNeededMin: driveMin,
        clockShortfallMin: shortfall,
        hosViolations: hv,
      },
      safety,
      economics: {
        rate,
        miles,
        rpm,
        revenuePerClockHour,
        revenuePerClockHourNote:
          revenuePerClockHour === null
            ? drivingRemaining <= 0
              ? "Not computable: this driver has zero legal driving hours remaining, so revenue per clock-hour is undefined."
              : "Not computable: no rate on this load."
            : "Load rate divided by the hours this driver may still legally drive.",
      },
      rank: null,
    });
  }

  // Rank: feasible first, then revenue per clock-hour, then safety.
  const order = { go: 0, advisory: 1, blocked: 2 } as const;
  candidates.sort((a, b) => {
    if (order[a.verdict] !== order[b.verdict]) return order[a.verdict] - order[b.verdict];
    const ar = a.economics.revenuePerClockHour ?? -1;
    const br = b.economics.revenuePerClockHour ?? -1;
    if (ar !== br) return br - ar;
    return (b.safety.score ?? -1) - (a.safety.score ?? -1);
  });
  candidates.forEach((cd, i) => { cd.rank = i + 1; });

  const anyFeasible = candidates.some((cd) => cd.verdict !== "blocked");

  const inputs = [
    { n: 1, key: "feasibility", label: "HOS clocks (49 CFR 395)", live: true, source: "hos_logs table, computed per request" },
    { n: 2, key: "route", label: "Route distance and drive time", live: route.live, source: "Google Directions", error: route.error ?? null, note: ROUTE_NOTE },
    { n: 3, key: "clearance", label: "Low-bridge clearance corridor scan", live: clearance.live, source: "FHWA NBI 2025, item 54B", error: clearance.error ?? null, note: CLEARANCE_NOTE },
    { n: 4, key: "safetyFit", label: "Driver safety score", live: candidates.some((cd) => cd.safety.score !== null), source: "computeSafetyScore() over 30 days" },
    { n: 5, key: "economics", label: "Rate, RPM, revenue per clock-hour", live: rate !== null && !!miles, source: rate === null ? "no rate on this load" : `rate from ${load.id ? "loads table" : "request body"}, miles from ${milesSource ?? "nowhere"}` },
    { n: 6, key: "honesty", label: "Live vs missing input ledger", live: true, source: "computed per request, never cached" },
    { n: 7, key: "chain", label: "SHA-256 decision chain", live: true, source: "dispatch_decisions table" },
  ];

  return c.json({
    load: {
      id: load.id,
      origin: load.origin,
      destination: load.destination,
      broker: load.broker ?? null,
      equipment: load.equipment ?? null,
      weight: load.weight ?? null,
      rate,
      miles,
      milesSource,
      rpm,
      resolvedOrigin: (route as any).resolvedOrigin ?? null,
      resolvedDestination: (route as any).resolvedDestination ?? null,
      routeSummary: route.summary,
      driveTimeMin: driveMin,
    },
    truck: { heightIn: Math.round(heightIn), height: ftIn(Math.round(heightIn)) },
    anyFeasible,
    feasibilityNote: anyFeasible
      ? null
      : "No driver on this fleet has legal clock for this load right now. Every candidate below is blocked on hours of service, computed from their own logs. That is the honest answer, not a data error.",
    candidates,
    inputs,
    missingInputs: KNOWN_MISSING,
    notes: { chain: LIMITS_NOTE, route: ROUTE_NOTE, clearance: CLEARANCE_NOTE },
    clearance,
    novelMetric: {
      name: "revenue per remaining-clock-hour",
      why: "Load boards rank by revenue per mile. Miles are not the scarce resource — legal clock hours are. A high-RPM load a driver cannot legally finish is worth zero.",
      formula: "load rate / (driving minutes remaining on the 11-hour clock / 60)",
    },
    committed: false,
    commitHint: "POST /api/dispatch-zero/commit with { loadId, driverId } to seal this decision into the chain.",
  });
});

// ---------------------------------------------------------------------------
// POST /commit — append-only, hash-chained
// ---------------------------------------------------------------------------
dispatchZero.post("/commit", async (c) => {
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Body must be JSON." }, 400);
  }
  const driverId = body.driverId ? String(body.driverId) : null;
  if (!driverId) return c.json({ error: "Pass driverId — a decision without a driver is not a dispatch decision." }, 400);
  if (!body.decision || typeof body.decision !== "object") {
    return c.json({ error: "Pass the full decision object returned by /score as { decision }. The ledger stores what the dispatcher actually saw, not a re-run." }, 400);
  }

  const scored = body.decision;
  const cand = (scored.candidates ?? []).find((x: any) => x.driverId === driverId);
  if (!cand) return c.json({ error: `Driver ${driverId} was not in the scored candidate set. Re-score before committing.` }, 400);

  const prev = await db.select().from(schema.dispatchDecisions).orderBy(desc(schema.dispatchDecisions.seq)).limit(1);
  const prevRow = prev[0] ?? null;
  const seq = (prevRow?.seq ?? 0) + 1;
  const prevHash = prevRow?.chainHash ?? GENESIS;

  const payload = {
    seq,
    loadId: scored.load?.id ?? null,
    driverId,
    verdict: cand.verdict,
    decidedBy: body.decidedBy ? String(body.decidedBy) : "dispatch",
    decidedAtIso: new Date().toISOString(),
    load: scored.load ?? null,
    truck: scored.truck ?? null,
    candidate: cand,
    inputs: scored.inputs ?? [],
    missingInputs: scored.missingInputs ?? KNOWN_MISSING,
    clearanceCount: scored.clearance?.count ?? null,
    clearanceLive: scored.clearance?.live ?? null,
  };

  const payloadHash = sha256(canonical(payload));
  const chainHash = chainHashOf(seq, prevHash, payloadHash);

  const row = {
    id: rid("dz"),
    seq,
    loadId: payload.loadId,
    driverId,
    verdict: String(cand.verdict),
    scoreJson: JSON.stringify(payload),
    inputsJson: JSON.stringify(payload.inputs),
    blockersJson: JSON.stringify(cand.blockers ?? []),
    unverifiedJson: JSON.stringify(payload.missingInputs),
    revenuePerClockHour: cand.economics?.revenuePerClockHour ?? null,
    payloadHash,
    prevHash,
    chainHash,
    decidedBy: payload.decidedBy,
  };

  try {
    await db.insert(schema.dispatchDecisions).values(row as any);
  } catch (err) {
    return c.json({ error: `Could not write the decision: ${(err as Error).message}` }, 500);
  }

  return c.json({
    committed: true,
    seq,
    algo: CHAIN_ALGO,
    payloadHash,
    prevHash,
    chainHash,
    verdict: row.verdict,
    note: LIMITS_NOTE,
    verifyHint: "GET /api/dispatch-zero/verify recomputes the whole chain from seq 1.",
  }, 201);
});

// ---------------------------------------------------------------------------
// GET /ledger
// ---------------------------------------------------------------------------
dispatchZero.get("/ledger", async (c) => {
  const limit = Math.min(Math.max(Number(c.req.query("limit") || 50), 1), 500);
  let all: any[];
  try {
    all = await db.select().from(schema.dispatchDecisions).orderBy(schema.dispatchDecisions.seq);
  } catch (err) {
    return c.json({ error: `dispatch_decisions unreadable: ${(err as Error).message}` }, 500);
  }

  let prevHash = GENESIS;
  const checked = all.map((r) => {
    const payload = (() => { try { return JSON.parse(r.scoreJson); } catch { return null; } })();
    const recomputedPayload = payload ? sha256(canonical(payload)) : null;
    const payloadOk = recomputedPayload === r.payloadHash;
    const linkOk = r.prevHash === prevHash;
    const recomputedChain = chainHashOf(r.seq, r.prevHash, r.payloadHash);
    const chainOk = payloadOk && linkOk && recomputedChain === r.chainHash;
    prevHash = r.chainHash;
    return {
      id: r.id,
      seq: r.seq,
      loadId: r.loadId,
      driverId: r.driverId,
      driverName: payload?.candidate?.name ?? null,
      truckNumber: payload?.candidate?.truckNumber ?? null,
      origin: payload?.load?.origin ?? null,
      destination: payload?.load?.destination ?? null,
      rate: payload?.load?.rate ?? null,
      miles: payload?.load?.miles ?? null,
      verdict: r.verdict,
      blockers: (() => { try { return JSON.parse(r.blockersJson); } catch { return []; } })(),
      missingInputs: (() => { try { return JSON.parse(r.unverifiedJson); } catch { return []; } })(),
      revenuePerClockHour: r.revenuePerClockHour,
      decidedBy: r.decidedBy,
      createdAt: r.createdAt,
      payloadHash: r.payloadHash,
      prevHash: r.prevHash,
      chainHash: r.chainHash,
      chainOk,
      failedCheck: chainOk ? null : !payloadOk ? "payload hash does not match the stored record" : !linkOk ? "prevHash does not match the previous row's chainHash" : "chainHash does not match seq|prevHash|payloadHash",
    };
  });

  const newestFirst = [...checked].reverse().slice(0, limit);
  return c.json({
    algo: CHAIN_ALGO,
    rows: checked.length,
    chainOk: checked.every((r) => r.chainOk),
    decisions: newestFirst,
    empty: checked.length === 0,
    emptyNote: checked.length === 0 ? "No decisions have been committed yet. Score a load and commit it to start the chain." : null,
    note: LIMITS_NOTE,
  });
});

// ---------------------------------------------------------------------------
// GET /verify — recompute the entire chain
// ---------------------------------------------------------------------------
dispatchZero.get("/verify", async (c) => {
  let all: any[];
  try {
    all = await db.select().from(schema.dispatchDecisions).orderBy(schema.dispatchDecisions.seq);
  } catch (err) {
    return c.json({ error: `dispatch_decisions unreadable: ${(err as Error).message}` }, 500);
  }

  let prevHash = GENESIS;
  let firstBreakAtSeq: number | null = null;
  const problems: { seq: number; problem: string }[] = [];
  for (const r of all) {
    const payload = (() => { try { return JSON.parse(r.scoreJson); } catch { return null; } })();
    const payloadOk = payload ? sha256(canonical(payload)) === r.payloadHash : false;
    const linkOk = r.prevHash === prevHash;
    const chainOk = chainHashOf(r.seq, r.prevHash, r.payloadHash) === r.chainHash;
    if (!payloadOk) problems.push({ seq: r.seq, problem: "stored decision no longer hashes to payloadHash — the record was edited" });
    if (!linkOk) problems.push({ seq: r.seq, problem: "prevHash does not match the previous row's chainHash — a row was inserted, removed or reordered" });
    if (!chainOk) problems.push({ seq: r.seq, problem: "chainHash does not match seq|prevHash|payloadHash" });
    if ((!payloadOk || !linkOk || !chainOk) && firstBreakAtSeq === null) firstBreakAtSeq = r.seq;
    prevHash = r.chainHash;
  }

  return c.json({
    ok: problems.length === 0,
    algo: CHAIN_ALGO,
    genesisPrevHash: GENESIS,
    rows: all.length,
    firstBreakAtSeq,
    problems,
    headChainHash: all.length ? all[all.length - 1].chainHash : null,
    proves: "Rows 1..n were written in this order and none has been altered since.",
    doesNotProve: "That the inputs were correct. See the route and clearance notes.",
  });
});

// ---------------------------------------------------------------------------
// GET /status — the Entitled-Index honesty pattern, computed per request
// ---------------------------------------------------------------------------
dispatchZero.get("/status", async (c) => {
  const out: any[] = [];

  // 1 feasibility
  let hosRows = 0;
  try { hosRows = Number((await rawRows("SELECT COUNT(*) AS n FROM hos_logs"))[0]?.n ?? 0); } catch {}
  out.push({ n: 1, key: "feasibility", label: "HOS clocks", live: hosRows > 0, detail: `${hosRows} hos_logs rows`, source: "hos_logs (49 CFR 395 limits)" });

  // 2 route
  out.push({ n: 2, key: "route", label: "Route + drive time", live: mapsKey().length > 0, detail: mapsKey() ? "Google Directions key present on the server" : "no Maps key configured", source: "Google Directions", truckLegal: false, note: ROUTE_NOTE });

  // 3 clearance
  let lb = 0; let nbiYear: number | null = null;
  try {
    const r = (await rawRows("SELECT COUNT(*) AS n, MAX(nbi_year) AS y FROM low_bridges"))[0];
    lb = Number(r?.n ?? 0);
    nbiYear = r?.y === null || r?.y === undefined ? null : Number(r.y);
  } catch {}
  out.push({ n: 3, key: "clearance", label: "Low-bridge clearance", live: lb > 0, detail: `${lb} NBI ${nbiYear ?? "?"} structures below 14'6"`, source: "FHWA NBI item 54B", note: CLEARANCE_NOTE });

  // 4 safety
  let telem = 0;
  try { telem = Number((await rawRows("SELECT COUNT(*) AS n FROM eld_telemetry"))[0]?.n ?? 0); } catch {}
  out.push({ n: 4, key: "safetyFit", label: "Driver safety score", live: telem > 0, detail: `${telem} eld_telemetry rows in scoring window inputs`, source: "computeSafetyScore()" });

  // 5 economics
  let loadRows = 0; let rated = 0;
  try {
    const r = (await rawRows("SELECT COUNT(*) AS n, SUM(CASE WHEN rate IS NOT NULL THEN 1 ELSE 0 END) AS r FROM loads"))[0];
    loadRows = Number(r?.n ?? 0);
    rated = Number(r?.r ?? 0);
  } catch {}
  out.push({ n: 5, key: "economics", label: "Rate / RPM / revenue per clock-hour", live: rated > 0, detail: `${rated} of ${loadRows} loads carry a rate`, source: "loads table" });

  // 6 honesty
  out.push({ n: 6, key: "honesty", label: "Live vs missing ledger", live: true, detail: `${KNOWN_MISSING.length} inputs named as missing on every decision`, source: "computed per request" });

  // 7 chain
  let dz = 0; let head: string | null = null;
  try {
    const r = (await rawRows("SELECT COUNT(*) AS n FROM dispatch_decisions"))[0];
    dz = Number(r?.n ?? 0);
    if (dz > 0) head = String((await rawRows("SELECT chain_hash FROM dispatch_decisions ORDER BY seq DESC LIMIT 1"))[0]?.chain_hash ?? "");
  } catch {}
  out.push({ n: 7, key: "chain", label: "SHA-256 decision chain", live: true, detail: dz === 0 ? "chain empty — no decisions committed yet" : `${dz} sealed decisions, head ${head?.slice(0, 12)}…`, source: "dispatch_decisions table" });

  return c.json({
    inputs: out,
    liveCount: out.filter((x) => x.live).length,
    total: out.length,
    missingInputs: KNOWN_MISSING,
    decisionsCommitted: dz,
    headChainHash: head,
    notes: { chain: LIMITS_NOTE, route: ROUTE_NOTE, clearance: CLEARANCE_NOTE },
    cached: false,
  });
});

export { dispatchZero };
export default dispatchZero;
