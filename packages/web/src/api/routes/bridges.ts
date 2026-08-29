/**
 * /api/bridges — low-clearance bridge advisory, built in-house on free federal data.
 *
 * DATA SOURCE (no key, no vendor, no license fee):
 *   FHWA National Bridge Inventory, 2025 delimited all-states file
 *   https://www.fhwa.dot.gov/bridge/nbi/ascii2025.cfm
 *   Record format: https://www.fhwa.dot.gov/bridge/nbi/format.cfm
 *   624,193 highway bridge records scanned; 7,869 with a measured vertical
 *   UNDERclearance below 14'6" were imported into the low_bridges table.
 *
 * THE FIELD THAT MATTERS: NBI ITEM 54B "Minimum Vertical Underclearance", the
 * clearance UNDER the structure for the road or railway passing beneath it,
 * qualified by ITEM 54A (H = highway under, R = railroad under). ITEM 53 is the
 * clearance OVER the bridge deck and is NOT used — mixing them up would produce
 * dangerously wrong warnings.
 *
 * WHAT THIS IS NOT:
 *   - Not truck-legal routing. /api/routing/plan runs on Google Directions,
 *     which has no truck profile. This is an advisory layer on top of it.
 *   - Not complete. NBI is annual and self-reported by the states. Local and
 *     municipal structures and many railroad overpasses are missing or carry a
 *     blank clearance field. Zero results means "no data", never "safe".
 *   - Not a legal record. See 23 U.S.C. 409 and
 *     https://www.fhwa.dot.gov/bridge/nbi/disclaim.cfm
 *
 * No fabricated rows. Every number returned is read from the database or
 * computed from it.
 */
import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { db } from "../database";

const bridges = new Hono();

const NBI_SOURCE = "FHWA National Bridge Inventory 2025 (delimited, all states)";
const NBI_URL = "https://www.fhwa.dot.gov/bridge/nbi/ascii2025.cfm";
const NBI_FORMAT_URL = "https://www.fhwa.dot.gov/bridge/nbi/format.cfm";
const DISCLAIMER_URL = "https://www.fhwa.dot.gov/bridge/nbi/disclaim.cfm";
const LEGAL_NOTE =
  "NBI data is furnished by the states under 23 U.S.C. 409. It is an advisory reference, not a certification that any road is clear. Always obey the posted clearance at the structure.";
const IMPORT_THRESHOLD_IN = 174; // 14'6" — nothing above this was imported
const STANDARD_TRAILER_IN = 162; // 13'6"

// The full house rule: nothing is cached. Every request reads the table.
async function rows(q: string): Promise<any[]> {
  const r: any = await db.run(sql.raw(q));
  return (r?.rows ?? []) as any[];
}

function esc(s: string) {
  return s.replace(/'/g, "''");
}

function ftIn(inches: number) {
  const ft = Math.floor(inches / 12);
  const inc = inches % 12;
  return `${ft}'${inc}"`;
}

function shape(r: any) {
  const clearanceIn = Number(r.clearance_in);
  return {
    id: String(r.id),
    structureNumber: String(r.structure_number || "").trim(),
    state: String(r.state_abbr),
    countyCode: r.county_code ? String(r.county_code) : null,
    lat: Number(r.lat),
    lng: Number(r.lng),
    clearanceIn,
    clearance: ftIn(clearanceIn),
    clearanceM: Number(r.clearance_m),
    under: String(r.under_ref) === "R" ? "railroad" : "highway",
    featureUnder: r.feature_under ? String(r.feature_under) : null,
    facilityCarried: r.facility_carried ? String(r.facility_carried) : null,
    location: r.location ? String(r.location) : null,
    openPosted: r.open_posted ? String(r.open_posted) : null,
    suspect: Number(r.suspect) === 1,
    nbiYear: Number(r.nbi_year),
  };
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

/** GET /api/bridges/status — coverage, honestly stated. */
bridges.get("/status", async (c) => {
  let total = 0;
  let year: number | null = null;
  let suspect = 0;
  let byState: { state: string; count: number; lowest: number }[] = [];
  let minClr: number | null = null;
  let importedAt: number | null = null;
  try {
    const t = await rows(`SELECT COUNT(*) AS n, MIN(clearance_in) AS lo, MAX(nbi_year) AS y,
      SUM(CASE WHEN suspect = 1 THEN 1 ELSE 0 END) AS sus, MAX(imported_at) AS imp FROM low_bridges`);
    total = Number(t[0]?.n ?? 0);
    minClr = t[0]?.lo === null || t[0]?.lo === undefined ? null : Number(t[0].lo);
    year = t[0]?.y === null || t[0]?.y === undefined ? null : Number(t[0].y);
    suspect = Number(t[0]?.sus ?? 0);
    importedAt = t[0]?.imp ? Number(t[0].imp) : null;
    byState = (
      await rows(
        `SELECT state_abbr AS s, COUNT(*) AS n, MIN(clearance_in) AS lo FROM low_bridges GROUP BY state_abbr ORDER BY n DESC`,
      )
    ).map((r) => ({ state: String(r.s), count: Number(r.n), lowest: Number(r.lo) }));
  } catch (err) {
    return c.json({ error: `low_bridges table unreadable: ${(err as Error).message}` }, 500);
  }

  return c.json({
    live: total > 0,
    source: NBI_SOURCE,
    sourceUrl: NBI_URL,
    recordFormatUrl: NBI_FORMAT_URL,
    disclaimerUrl: DISCLAIMER_URL,
    legalNote: LEGAL_NOTE,
    nbiYear: year,
    importedAt,
    nbiItemsUsed: {
      "54A": "Reference feature under the structure (H = highway, R = railroad)",
      "54B": "Minimum vertical underclearance — the number used for warnings",
      "16/17": "Latitude / longitude, converted from DDMMSSss to decimal degrees",
    },
    nbiItemsNotUsed: { "53": "Vertical clearance OVER the bridge roadway — wrong number for strike warnings" },
    counts: {
      lowBridges: total,
      suspectRows: suspect,
      statesWithData: byState.length,
      lowestClearanceIn: minClr,
      lowestClearance: minClr === null ? null : ftIn(minClr),
    },
    importRule: {
      scannedRecords: 624193,
      keptWhen: `NBI 54A in (H,R) and 54B is a real measurement below ${ftIn(IMPORT_THRESHOLD_IN)}`,
      thresholdIn: IMPORT_THRESHOLD_IN,
      note: "99.99 m in the source means 'no restriction recorded', not 'measured'. Those rows were dropped, not treated as clear.",
    },
    byState,
    limits: [
      "NBI is published annually and self-reported by each state DOT. A bridge lowered or re-measured after the file was cut is not reflected here.",
      "Local, municipal and private structures are frequently absent. Many railroad overpasses carry a blank clearance field and were dropped.",
      "A state with zero rows means no qualifying NBI records were found — it does not mean the state has no low bridges.",
      "This is a clearance advisory. It is not truck-legal routing and does not apply weight, axle, hazmat or truck-prohibited restrictions.",
    ],
    truckLegalRouting: false,
  });
});

/** GET /api/bridges/nearby?lat=&lng=&radius=&height= */
bridges.get("/nearby", async (c) => {
  const lat = Number(c.req.query("lat"));
  const lng = Number(c.req.query("lng"));
  const radius = Math.min(Math.max(Number(c.req.query("radius") || 25), 1), 250);
  const height = Number(c.req.query("height") || STANDARD_TRAILER_IN);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return c.json({ error: "Pass numeric lat and lng." }, 400);
  }
  if (!Number.isFinite(height) || height < 100 || height > 200) {
    return c.json({ error: "Pass height in inches between 100 and 200 (13'6\" = 162)." }, 400);
  }

  // bounding-box prefilter in SQL, exact haversine in JS
  const dLat = radius / 69;
  const dLng = radius / Math.max(1, 69 * Math.cos((lat * Math.PI) / 180));
  let candidates: any[];
  try {
    candidates = await rows(
      `SELECT * FROM low_bridges
       WHERE lat BETWEEN ${lat - dLat} AND ${lat + dLat}
         AND lng BETWEEN ${lng - dLng} AND ${lng + dLng}
         AND clearance_in < ${Math.round(height)}
       LIMIT 2000`,
    );
  } catch (err) {
    return c.json({ error: `Query failed: ${(err as Error).message}` }, 500);
  }

  const hits = candidates
    .map((r) => {
      const b = shape(r);
      return { ...b, distanceMi: Math.round(distMi(lat, lng, b.lat, b.lng) * 100) / 100 };
    })
    .filter((b) => b.distanceMi <= radius)
    .sort((a, b) => a.clearanceIn - b.clearanceIn);

  return c.json({
    source: NBI_SOURCE,
    query: { lat, lng, radiusMi: radius, truckHeightIn: height, truckHeight: ftIn(height) },
    count: hits.length,
    lowest: hits[0] ?? null,
    bridges: hits.slice(0, 200),
    truncated: hits.length > 200,
    legalNote: LEGAL_NOTE,
    zeroMeansNoData:
      "Zero results means no qualifying NBI record inside this box, not that the area is clear.",
  });
});

type ScanBody = {
  heightIn?: number;
  corridorMi?: number;
  points?: { lat: number; lng: number }[];
  polyline?: string;
};

/** Google encoded-polyline decoder — the format /api/routing/plan gets back. */
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

/**
 * POST /api/bridges/scan-route
 * Body: { heightIn, corridorMi, points[] } or { heightIn, corridorMi, polyline }
 * Flags every imported low bridge within corridorMi of the path.
 */
bridges.post("/scan-route", async (c) => {
  let body: ScanBody;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Body must be JSON." }, 400);
  }
  const height = Number(body.heightIn ?? STANDARD_TRAILER_IN);
  const corridor = Math.min(Math.max(Number(body.corridorMi ?? 0.5), 0.05), 5);
  if (!Number.isFinite(height) || height < 100 || height > 200) {
    return c.json({ error: "heightIn must be between 100 and 200 inches." }, 400);
  }

  let path: { lat: number; lng: number }[] = [];
  if (typeof body.polyline === "string" && body.polyline.length > 1) {
    try {
      path = decodePolyline(body.polyline);
    } catch (err) {
      return c.json({ error: `Could not decode polyline: ${(err as Error).message}` }, 400);
    }
  } else if (Array.isArray(body.points)) {
    path = body.points
      .map((p) => ({ lat: Number(p?.lat), lng: Number(p?.lng) }))
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  }
  if (path.length < 2) {
    return c.json(
      { error: "Pass at least 2 route points, or a Google encoded polyline from /api/routing/plan." },
      400,
    );
  }

  // Sample the path so a 2,000-point polyline does not become 2,000 queries.
  const MAX_SAMPLES = 400;
  const stride = Math.max(1, Math.ceil(path.length / MAX_SAMPLES));
  const samples = path.filter((_, i) => i % stride === 0 || i === path.length - 1);

  const minLat = Math.min(...path.map((p) => p.lat));
  const maxLat = Math.max(...path.map((p) => p.lat));
  const minLng = Math.min(...path.map((p) => p.lng));
  const maxLng = Math.max(...path.map((p) => p.lng));
  const padLat = corridor / 69;
  const padLng = corridor / Math.max(1, 69 * Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180));

  let candidates: any[];
  try {
    candidates = await rows(
      `SELECT * FROM low_bridges
       WHERE lat BETWEEN ${minLat - padLat} AND ${maxLat + padLat}
         AND lng BETWEEN ${minLng - padLng} AND ${maxLng + padLng}
         AND clearance_in < ${Math.round(height)}
       LIMIT 5000`,
    );
  } catch (err) {
    return c.json({ error: `Query failed: ${(err as Error).message}` }, 500);
  }

  const hits: any[] = [];
  for (const r of candidates) {
    const b = shape(r);
    let best = Infinity;
    let atIndex = -1;
    for (let i = 0; i < samples.length; i++) {
      const d = distMi(samples[i].lat, samples[i].lng, b.lat, b.lng);
      if (d < best) {
        best = d;
        atIndex = i;
      }
      if (best <= corridor / 4) break; // close enough, stop early
    }
    if (best <= corridor) {
      hits.push({
        ...b,
        offRouteMi: Math.round(best * 100) / 100,
        atSampleIndex: atIndex,
        atSampleFraction: samples.length > 1 ? Math.round((atIndex / (samples.length - 1)) * 100) / 100 : 0,
        deficitIn: Math.round(height) - b.clearanceIn,
      });
    }
  }
  hits.sort((a, b) => a.clearanceIn - b.clearanceIn);

  return c.json({
    source: NBI_SOURCE,
    query: {
      truckHeightIn: Math.round(height),
      truckHeight: ftIn(Math.round(height)),
      corridorMi: corridor,
      routePoints: path.length,
      pointsSampled: samples.length,
      boundingBox: { minLat, maxLat, minLng, maxLng },
    },
    count: hits.length,
    worst: hits[0] ?? null,
    bridges: hits.slice(0, 200),
    truncated: hits.length > 200,
    truckLegalRouting: false,
    warning:
      "This scan only sees bridges present in the NBI file with a measured underclearance. It does not certify the route. Google Directions gave the route and has no truck profile.",
    legalNote: LEGAL_NOTE,
  });
});

export { bridges };
export default bridges;
