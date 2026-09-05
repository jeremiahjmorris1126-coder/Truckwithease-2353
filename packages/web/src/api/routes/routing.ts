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

/**
 * GET /api/routing/streetview?lat=..&lng=..  (or ?address=..)
 *
 * Server-side Street View proxy. This exists to close a real key leak: the browser helpers in
 * legacy/maps-config.js used to build a maps.googleapis.com/streetview URL with the Maps key
 * pasted into the query string, which means the key shipped to every visitor in plain sight and
 * could be scraped and billed against this project. The image now comes back through this route
 * and the key never leaves the server.
 *
 * Returns the JPEG bytes Google returned, or JSON with Google's own status when it refused.
 */
routing.get("/streetview", async (c) => {
  const lat = (c.req.query("lat") ?? "").trim();
  const lng = (c.req.query("lng") ?? "").trim();
  const address = (c.req.query("address") ?? "").trim();

  const location = address || (lat && lng ? `${lat},${lng}` : "");
  if (!location) {
    return c.json({ error: "location_required", detail: "Pass address, or both lat and lng." }, 400);
  }

  // Clamp to the Street View Static API's documented maximum so a crafted request cannot be
  // used to bill oversized images against this project.
  const clamp = (raw: string | undefined, dflt: number, max: number) => {
    const n = Number.parseInt((raw ?? "").trim(), 10);
    if (!Number.isFinite(n) || n <= 0) return dflt;
    return Math.min(n, max);
  };
  const width = clamp(c.req.query("width"), 640, 640);
  const height = clamp(c.req.query("height"), 480, 640);
  const heading = (c.req.query("heading") ?? "").trim();
  const pitch = (c.req.query("pitch") ?? "").trim();

  const key = googleKeyFor("places");
  if (!key) {
    return c.json({ error: "no_streetview_key", keySource: googleKeySourceFor("places") }, 503);
  }

  const params = new URLSearchParams({
    size: `${width}x${height}`,
    location,
    key,
  });
  if (heading) params.set("heading", heading);
  if (pitch) params.set("pitch", pitch);

  const t0 = Date.now();
  let res: Response;
  try {
    res = await fetch(`https://maps.googleapis.com/maps/api/streetview?${params.toString()}`);
  } catch (e: any) {
    return c.json({ error: "streetview_request_failed", detail: String(e?.message ?? e) }, 502);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!res.ok || !contentType.startsWith("image/")) {
    // Google answers non-image errors as text. Pass its own words through rather than guessing.
    const text = await res.text().catch(() => "");
    return c.json(
      {
        error: "streetview_failed",
        googleHttpStatus: res.status,
        googleContentType: contentType || null,
        googleBody: text.slice(0, 400) || null,
        keySource: googleKeySourceFor("places"),
        measuredMs: Date.now() - t0,
      },
      502,
    );
  }

  const bytes = await res.arrayBuffer();
  c.header("content-type", contentType);
  c.header("cache-control", "public, max-age=86400");
  return c.body(bytes, 200);
});

/** Google Routes API (v2). Returns only car-profile routing; commercial restrictions are not applied. */
routing.post("/routes", async (c) => {
  const body = await c.req.json().catch(() => null) as PlanBody | null;
  const origin = body?.origin?.trim() ?? "";
  const destination = body?.destination?.trim() ?? "";
  if (!origin || !destination) return c.json({ error: "origin and destination are required" }, 400);
  const key = googleKeyFor("routes");
  if (!key) return c.json({ error: "no_routes_key", keySource: googleKeySourceFor("routes") }, 503);
  const t0 = Date.now();
  let response: Response;
  try {
    response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.description" },
      body: JSON.stringify({ origin: { address: origin }, destination: { address: destination }, travelMode: "DRIVE", routingPreference: "TRAFFIC_AWARE" }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    return c.json({ error: "routes_request_failed", detail: error instanceof Error ? error.message : "request failed" }, 502);
  }
  const payload = await response.json().catch(() => null) as { routes?: Array<{ duration?: string; distanceMeters?: number; polyline?: { encodedPolyline?: string }; description?: string }>; error?: { message?: string } } | null;
  if (!response.ok || !payload?.routes?.[0]) return c.json({ error: "routes_failed", googleHttpStatus: response.status, googleError: payload?.error?.message ?? null, measuredMs: Date.now() - t0 }, 502);
  const route = payload.routes[0];
  const seconds = Number.parseInt(route.duration ?? "0", 10);
  return c.json({ source: "google-routes", live: true, request: { origin, destination }, distance: { meters: route.distanceMeters ?? null, miles: route.distanceMeters ? Math.round(route.distanceMeters / METERS_PER_MILE * 10) / 10 : null }, duration: { seconds, minutes: Math.round(seconds / 60) }, overviewPolyline: route.polyline?.encodedPolyline ?? null, summary: route.description ?? null, truckProfile: false, notApplied: ["Truck height and weight restrictions", "Hazmat routing", "Truck-prohibited roads"], keySource: googleKeySourceFor("routes"), measuredMs: Date.now() - t0 });
});

/** Google Places Text Search for operational stops. */
routing.post("/places", async (c) => {
  const body = await c.req.json().catch(() => null) as { query?: string; maxResults?: number } | null;
  const query = body?.query?.trim() ?? "";
  if (!query) return c.json({ error: "query_required" }, 400);
  const key = googleKeyFor("places");
  if (!key) return c.json({ error: "no_places_key", keySource: googleKeySourceFor("places") }, 503);
  const maxResultCount = Math.min(Math.max(Number(body?.maxResults) || 10, 1), 20);
  const t0 = Date.now();
  let response: Response;
  try {
    response = await fetch("https://places.googleapis.com/v1/places:searchText", { method: "POST", headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.types" }, body: JSON.stringify({ textQuery: query, maxResultCount }), signal: AbortSignal.timeout(20_000) });
  } catch (error) {
    return c.json({ error: "places_request_failed", detail: error instanceof Error ? error.message : "request failed" }, 502);
  }
  const payload = await response.json().catch(() => null) as { places?: Array<{ id: string; displayName?: { text?: string }; formattedAddress?: string; location?: { latitude?: number; longitude?: number }; types?: string[] }>; error?: { message?: string } } | null;
  if (!response.ok) return c.json({ error: "places_failed", googleHttpStatus: response.status, googleError: payload?.error?.message ?? null, measuredMs: Date.now() - t0 }, 502);
  return c.json({ source: "google-places", query, places: (payload?.places ?? []).map((place) => ({ id: place.id, name: place.displayName?.text ?? null, address: place.formattedAddress ?? null, lat: place.location?.latitude ?? null, lng: place.location?.longitude ?? null, types: place.types ?? [] })), keySource: googleKeySourceFor("places"), measuredMs: Date.now() - t0 });
});

/**
 * Google Routes Route Matrix for dispatch comparisons.
 * This compares up to 25 typed origins with one typed destination. It is not
 * truck-legal routing: height, weight, hazmat, and truck-prohibited roads are
 * not applied by Google Routes.
 */
routing.post("/matrix", async (c) => {
  const body = await c.req.json().catch(() => null) as { origins?: Array<{ id?: string; address?: string }>; destination?: string } | null;
  const origins = Array.isArray(body?.origins) ? body.origins : [];
  const destination = body?.destination?.trim() ?? "";
  if (!destination) return c.json({ error: "destination_required" }, 400);
  if (!origins.length || origins.length > 25) return c.json({ error: "origins must contain 1 to 25 items" }, 400);
  const normalized = origins.map((origin, index) => ({ id: origin.id?.trim() || String(index), address: origin.address?.trim() || "" }));
  if (normalized.some((origin) => !origin.address)) return c.json({ error: "every origin requires an address" }, 400);

  const key = googleKeyFor("routes");
  if (!key) return c.json({ error: "no_routes_key", keySource: googleKeySourceFor("routes") }, 503);
  const started = Date.now();
  let response: Response;
  try {
    response = await fetch("https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "originIndex,destinationIndex,condition,distanceMeters,duration,staticDuration",
      },
      body: JSON.stringify({
        origins: normalized.map((origin) => ({ waypoint: { address: origin.address } })),
        destinations: [{ waypoint: { address: destination } }],
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
      }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    return c.json({ error: "matrix_request_failed", detail: error instanceof Error ? error.message : "request failed" }, 502);
  }
  const payload = await response.json().catch(() => null) as { error?: { message?: string }; [key: string]: unknown } | null;
  if (!response.ok || !Array.isArray(payload)) {
    return c.json({ error: "matrix_failed", googleHttpStatus: response.status, googleError: payload?.error?.message ?? null, measuredMs: Date.now() - started }, 502);
  }
  const comparisons = payload.map((element: any) => {
    const source = normalized[element.originIndex ?? -1];
    const seconds = Number.parseInt(element.duration ?? "0", 10);
    return {
      originId: source?.id ?? null,
      origin: source?.address ?? null,
      condition: element.condition ?? "UNKNOWN",
      distance: { meters: element.distanceMeters ?? null, miles: element.distanceMeters ? Math.round(element.distanceMeters / METERS_PER_MILE * 10) / 10 : null },
      duration: { seconds, minutes: Math.round(seconds / 60) },
    };
  }).sort((a: { duration: { seconds: number } }, b: { duration: { seconds: number } }) => a.duration.seconds - b.duration.seconds);
  return c.json({ source: "google-routes-route-matrix", live: true, destination, comparisons, truckProfile: false, notApplied: ["Truck height and weight restrictions", "Hazmat routing", "Truck-prohibited roads"], keySource: googleKeySourceFor("routes"), measuredMs: Date.now() - started });
});

/** Snap a bounded GPS trace to Google Roads. */
routing.post("/roads/snap", async (c) => {
  const body = await c.req.json().catch(() => null) as { points?: Array<{ lat?: number; lng?: number }> } | null;
  const points = Array.isArray(body?.points) ? body.points : [];
  if (points.length < 2 || points.length > 100) return c.json({ error: "points must contain 2 to 100 locations" }, 400);
  if (points.some((point) => !Number.isFinite(point.lat) || !Number.isFinite(point.lng))) return c.json({ error: "every point requires numeric lat and lng" }, 400);
  const key = googleKeyFor("roads");
  if (!key) return c.json({ error: "no_roads_key", keySource: googleKeySourceFor("roads") }, 503);
  const started = Date.now();
  let response: Response;
  try { response = await fetch(`https://roads.googleapis.com/v1/snapToRoads?path=${encodeURIComponent(points.map((point) => `${point.lat},${point.lng}`).join("|"))}&interpolate=true&key=${encodeURIComponent(key)}`, { signal: AbortSignal.timeout(20_000) }); } catch (error) { return c.json({ error: "roads_request_failed", detail: error instanceof Error ? error.message : "request failed" }, 502); }
  const payload = await response.json().catch(() => null) as { snappedPoints?: Array<{ location?: { latitude?: number; longitude?: number }; placeId?: string; originalIndex?: number }>; error?: { message?: string } } | null;
  if (!response.ok) return c.json({ error: "roads_failed", googleHttpStatus: response.status, googleError: payload?.error?.message ?? null, measuredMs: Date.now() - started }, 502);
  return c.json({ source: "google-roads", points: (payload?.snappedPoints ?? []).map((point) => ({ lat: point.location?.latitude ?? null, lng: point.location?.longitude ?? null, placeId: point.placeId ?? null, originalIndex: point.originalIndex ?? null })), keySource: googleKeySourceFor("roads"), measuredMs: Date.now() - started });
});

/** Resolve a route point's local timezone using Google Time Zone API. */
routing.get("/timezone", async (c) => {
  const lat = Number(c.req.query("lat")); const lng = Number(c.req.query("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return c.json({ error: "numeric lat and lng are required" }, 400);
  const key = googleKeyFor("timezone");
  if (!key) return c.json({ error: "no_timezone_key", keySource: googleKeySourceFor("timezone") }, 503);
  const started = Date.now();
  let response: Response;
  try { response = await fetch(`https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=${encodeURIComponent(key)}`, { signal: AbortSignal.timeout(20_000) }); } catch (error) { return c.json({ error: "timezone_request_failed", detail: error instanceof Error ? error.message : "request failed" }, 502); }
  const payload = await response.json().catch(() => null) as { status?: string; timeZoneId?: string; timeZoneName?: string; rawOffset?: number; dstOffset?: number; errorMessage?: string } | null;
  if (!response.ok || payload?.status !== "OK") return c.json({ error: "timezone_failed", googleHttpStatus: response.status, googleStatus: payload?.status ?? null, googleError: payload?.errorMessage ?? null, measuredMs: Date.now() - started }, 502);
  return c.json({ source: "google-timezone", lat, lng, timeZoneId: payload.timeZoneId, timeZoneName: payload.timeZoneName, rawOffsetSeconds: payload.rawOffset, dstOffsetSeconds: payload.dstOffset, keySource: googleKeySourceFor("timezone"), measuredMs: Date.now() - started });
});

/** Get elevations for up to 100 route points. */
routing.post("/elevation", async (c) => {
  const body = await c.req.json().catch(() => null) as { points?: Array<{ lat?: number; lng?: number }> } | null;
  const points = Array.isArray(body?.points) ? body.points : [];
  if (!points.length || points.length > 100 || points.some((point) => !Number.isFinite(point.lat) || !Number.isFinite(point.lng))) return c.json({ error: "points must contain 1 to 100 numeric locations" }, 400);
  const key = googleKeyFor("elevation");
  if (!key) return c.json({ error: "no_elevation_key", keySource: googleKeySourceFor("elevation") }, 503);
  const started = Date.now();
  let response: Response;
  try { response = await fetch(`https://maps.googleapis.com/maps/api/elevation/json?locations=${encodeURIComponent(points.map((point) => `${point.lat},${point.lng}`).join("|"))}&key=${encodeURIComponent(key)}`, { signal: AbortSignal.timeout(20_000) }); } catch (error) { return c.json({ error: "elevation_request_failed", detail: error instanceof Error ? error.message : "request failed" }, 502); }
  const payload = await response.json().catch(() => null) as { status?: string; results?: Array<{ elevation?: number; location?: { lat?: number; lng?: number }; resolution?: number }>; error_message?: string } | null;
  if (!response.ok || payload?.status !== "OK") return c.json({ error: "elevation_failed", googleHttpStatus: response.status, googleStatus: payload?.status ?? null, googleError: payload?.error_message ?? null, measuredMs: Date.now() - started }, 502);
  return c.json({ source: "google-elevation", elevations: (payload.results ?? []).map((result) => ({ meters: result.elevation ?? null, lat: result.location?.lat ?? null, lng: result.location?.lng ?? null, resolutionMeters: result.resolution ?? null })), keySource: googleKeySourceFor("elevation"), measuredMs: Date.now() - started });
});

export { routing };
