import { Hono } from "hono";

/**
 * Route planning — server-side, real Google Directions API.
 *
 * Verified live on 2026-08-27 against the project key: the Directions API
 * IS enabled and returns real distance/duration. Geocoding, Distance Matrix,
 * Elevation, Places, Time Zone and Roads are NOT enabled on the same key and
 * return REQUEST_DENIED — so nothing here uses them.
 *
 * What was deleted from the page this feeds (QuantumRoutingEngine):
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

/** The Maps key. Currently stored as VITE_GOOGLE_MAPS_KEY — read server-side
 *  only here. It is a browser-restrictable Maps key, not a secret provider
 *  key, but it should still be renamed to GOOGLE_MAPS_KEY and given an HTTP
 *  referrer restriction. Flagged, not silently changed. */
function mapsKey(): string {
  return (process.env.GOOGLE_MAPS_KEY || process.env.VITE_GOOGLE_MAPS_KEY || "").replace(/^"|"$/g, "").trim();
}

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
    // Verified by live probe on 2026-08-27. Not a guess.
    apisEnabled: ["Directions", "Static Maps", "Street View Static", "Maps Embed", "Maps JavaScript"],
    apisNotEnabled: ["Geocoding", "Distance Matrix", "Elevation", "Places", "Time Zone", "Roads"],
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

export { routing };
