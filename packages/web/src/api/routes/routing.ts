import { Hono } from "hono";
import { googleKeyFor, googleKeySourceFor, googleKeyReport } from "../lib/googlekeys";

/**
 * Route planning — server-side, real Google Directions API.
 *
 * Verified live on 2026-08-27 against the project key: the Directions API
 * IS enabled and returns real distance/duration. Geocoding, Distance Matrix,
 * Elevation, Places, Time Zone and Roads are NOT enabled on the same key and
 * return REQUEST_DENIED — so nothing here uses them.
 *
 * What was deleted from the page this feeds (RoutingEnginePage):
 *   - VEHICLE_MODES: 30 invented "optimization layers" with invented
 *     per-layer solve times ("0.3s", "0.1s") that measured nothing.
 *   - Invented outcome stats presented as fact: "Avg Miles Saved 47/load",
 *     "Fuel Savings $28/load", "HOS Compliance 100%", "On-Time Rate 96.4%",
 *     "+$34/day", "Battery Saved 31%", "Incident Rate -67%", "+8/shift".
 *   - A setInterval animation that stepped through those layers and printed
 *     "optimized" — no computation of any kind ran.
 *   - A rotating feed of invented events naming real vendors and places:
 *     "Weigh station I-70 MM 204 bypass qualified via PrePass", "Parking
 *     confirmed - Loves Exit 204, 23 spots available", "surge $2.4x on 5th Ave".
 *
 * Every number this route returns comes from Google Directions or from the
 * toll table in routes/tolls.ts, and each is labeled with its source.
 */

const routing = new Hono();

const DIRECTIONS = "https://maps.googleapis.com/maps/api/directions/json";

/** Directions key, picked per-API because the project's two keys have
 *  different API restrictions and neither covers everything. See
 *  lib/googlekeys.ts for the measured capability table. */
function mapsKey(): string {
  return googleKeyFor("directions");
}

const GEOCODE = "https://maps.googleapis.com/maps/api/geocode/json";

const METERS_PER_MILE = 1609.344;

type PlanBody = {
  origin?: string;
  destination?: string;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
};

routing.get("/status", (c) => {
  const key = mapsKey();
  return c.json({
    provider: "google-directions",
    keyPresent: key.length > 0,
    keys: googleKeyReport(),
    // Verified by live probe on 2026-08-30, per key. The project's two keys do
    // NOT have the same API restrictions, so "enabled" is a property of the
    // key being used, not of the project.
    apisEnabled: ["Directions", "Geocoding", "Places (New)", "Static Maps", "Street View Static", "Maps Embed", "Maps JavaScript"],
    apisNotEnabled: ["Distance Matrix", "Elevation", "Time Zone", "Roads"],
    keyRestrictionSplit:
      "Directions answers on VITE_GOOGLE_MAPS_KEY only. Geocoding and Places (New) answer on GOOGLE_PLACES_API_KEY only. Each call is sent the key that its API restrictions allow; see keys.perApi.",
    truckRouting: false,
    truckRoutingNote:
      "Google Directions has no truck profile. Distance and drive time are car-based. Bridge heights, weight limits, hazmat corridors and low clearances are NOT applied.",
    note: "Origin and destination must be typed as text. Address autocomplete needs the Places API, which is not enabled on this key.",
  });
});

routing.post("/plan", async (c) => {
  const key = mapsKey();
  if (!key) return c.json({ error: "No Google Maps key configured on the server." }, 503);

  let body: PlanBody;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Body must be JSON." }, 400);
  }

  const origin = (body.origin || "").trim();
  const destination = (body.destination || "").trim();
  if (!origin || !destination) return c.json({ error: "Pass origin and destination." }, 400);

  const params = new URLSearchParams({ origin, destination, key });
  const avoid: string[] = [];
  if (body.avoidTolls) avoid.push("tolls");
  if (body.avoidHighways) avoid.push("highways");
  if (avoid.length) params.set("avoid", avoid.join("|"));

  const started = Date.now();
  let payload: any;
  try {
    const res = await fetch(`${DIRECTIONS}?${params.toString()}`, { signal: AbortSignal.timeout(20000) });
    payload = await res.json();
  } catch (err) {
    return c.json({ error: `Directions request failed: ${(err as Error).message}` }, 502);
  }
  const latencyMs = Date.now() - started;

  if (payload?.status !== "OK") {
    return c.json(
      {
        error: "Google Directions did not return a route.",
        googleStatus: payload?.status ?? "unknown",
        googleMessage: payload?.error_message ?? null,
        latencyMs,
      },
      502,
    );
  }

  const route = payload.routes?.[0];
  const legs = route?.legs ?? [];
  const meters = legs.reduce((s: number, l: any) => s + (l.distance?.value ?? 0), 0);
  const seconds = legs.reduce((s: number, l: any) => s + (l.duration?.value ?? 0), 0);
  const miles = meters / METERS_PER_MILE;

  return c.json({
    source: "google-directions",
    live: true,
    latencyMs,
    request: { origin, destination, avoidTolls: !!body.avoidTolls, avoidHighways: !!body.avoidHighways },
    resolved: {
      origin: legs[0]?.start_address ?? null,
      destination: legs[legs.length - 1]?.end_address ?? null,
    },
    distance: { meters, miles: Math.round(miles * 10) / 10, text: legs.map((l: any) => l.distance?.text).join(" + ") },
    duration: { seconds, hours: Math.round((seconds / 3600) * 100) / 100, text: legs.map((l: any) => l.duration?.text).join(" + ") },
    summary: route?.summary ?? null,
    warnings: route?.warnings ?? [],
    steps: legs[0]?.steps?.length ?? 0,
    // Google's encoded overview polyline. /api/bridges/scan-route decodes this
    // to flag low-clearance bridges along the path.
    overviewPolyline: route?.overview_polyline?.points ?? null,
    // Stated plainly so the UI can repeat it. This is a car route.
    truckProfile: false,
    notApplied: [
      "Bridge height and low-clearance restrictions",
      "Gross weight and axle-weight limits",
      "Hazmat tunnel and corridor restrictions",
      "Truck-prohibited roads and parkways",
      "Hours-of-service break placement along the route",
    ],
  });
});


/**
 * GET /api/routing/geocode?address=...
 *
 * Server-side geocoding. This exists because the browser cannot do it: the Maps JavaScript API
 * Geocoder in the browser uses VITE_GOOGLE_MAPS_KEY, and that key's API restrictions REJECT
 * Geocoding (measured 2026-08-30 -> REQUEST_DENIED). Geocoding answers only on
 * GOOGLE_PLACES_API_KEY, which is server-only and must never reach the browser. So the browser
 * calls this route and the server sends the key that Google will accept.
 */
routing.get("/geocode", async (c) => {
  const address = (c.req.query("address") ?? "").trim();
  if (!address) return c.json({ error: "address_required" }, 400);

  const key = googleKeyFor("geocoding");
  if (!key) {
    return c.json(
      { error: "no_geocoding_key", keySource: googleKeySourceFor("geocoding") },
      503,
    );
  }

  const t0 = Date.now();
  const url = `${GEOCODE}?address=${encodeURIComponent(address)}&key=${encodeURIComponent(key)}`;
  let body: any;
  try {
    const r = await fetch(url);
    body = await r.json();
  } catch (e: any) {
    return c.json({ error: "geocode_request_failed", detail: String(e?.message ?? e) }, 502);
  }

  const status = String(body?.status ?? "UNKNOWN");
  if (status !== "OK" || !Array.isArray(body?.results) || body.results.length === 0) {
    // Google's own words, verbatim. REQUEST_DENIED here means the key restrictions changed.
    return c.json(
      {
        error: "geocode_failed",
        googleStatus: status,
        googleError: body?.error_message ?? null,
        keySource: googleKeySourceFor("geocoding"),
        measuredMs: Date.now() - t0,
      },
      status === "ZERO_RESULTS" ? 404 : 502,
    );
  }

  const top = body.results[0];
  return c.json({
    query: address,
    lat: top?.geometry?.location?.lat ?? null,
    lng: top?.geometry?.location?.lng ?? null,
    formatted: top?.formatted_address ?? null,
    locationType: top?.geometry?.location_type ?? null,
    placeId: top?.place_id ?? null,
    partialMatch: top?.partial_match === true,
    resultCount: body.results.length,
    provider: "google-geocoding",
    keySource: googleKeySourceFor("geocoding"),
    measuredMs: Date.now() - t0,
  });
});

export { routing };
