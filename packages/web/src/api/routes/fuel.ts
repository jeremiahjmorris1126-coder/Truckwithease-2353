import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getDieselPrices, regionalPrice } from "../lib/eia-fuel";

// Fuel Finder — LIVE regional diesel prices from the U.S. EIA (no key required).
// Per-station price = real regional average + a small brand/station offset so
// the cheapest-station ranking is realistic. Data source is government-published.
const STATION_SEED = [
  { id: "f1", brand: "Pilot", name: "Pilot Travel Center #412", lat: 38.71, lng: -90.42, offset: -0.04, amenities: ["Parking", "Showers", "Scales", "DEF"] },
  { id: "f2", brand: "Loves", name: "Love's Travel Stop", lat: 38.59, lng: -90.05, offset: -0.09, amenities: ["Parking", "Showers", "DEF", "Restaurant"] },
  { id: "f3", brand: "TA", name: "TA Travel Center", lat: 38.82, lng: -90.21, offset: 0.05, amenities: ["Parking", "Scales", "Service Bay"] },
  { id: "f4", brand: "Petro", name: "Petro Stopping Center", lat: 38.55, lng: -90.38, offset: 0.02, amenities: ["Parking", "Showers", "Laundry", "DEF"] },
  { id: "f5", brand: "Casey's", name: "Casey's General Store", lat: 38.66, lng: -90.12, offset: 0.11, amenities: ["Parking", "DEF"] },
];

function haversine(a: [number, number], b: [number, number]) {
  const R = 3958.8, toR = (d: number) => (d * Math.PI) / 180;
  const dLat = toR(b[0] - a[0]), dLng = toR(b[1] - a[1]);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a[0])) * Math.cos(toR(b[0])) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// In-memory fuel card ($100 for Pro tier)
const cards: Record<string, { number: string; balance: number; history: { at: number; station: string; gallons: number; amount: number }[] }> = {};
function getCard(id: string) {
  if (!cards[id]) cards[id] = { number: "TWE-4417-" + id.slice(-4).toUpperCase().padStart(4, "0"), balance: 100, history: [] };
  return cards[id];
}

export const fuel = new Hono()
  .get(
    "/stations",
    zValidator("query", z.object({ lat: z.string().optional(), lng: z.string().optional(), state: z.string().optional() })),
    async (c) => {
      const q = c.req.valid("query");
      const lat = Number(q.lat);
      const lng = Number(q.lng);

      // LIVE regional diesel base price from EIA
      const { data, live } = await getDieselPrices();
      const reg = regionalPrice(data, q.state);
      const base = reg?.base ?? 3.74; // fallback national-ish if EIA unreachable
      const isLive = live && !!reg;

      let stations = STATION_SEED.map((s) => ({
        id: s.id, brand: s.brand, name: s.name, lat: s.lat, lng: s.lng,
        amenities: s.amenities,
        price: +(base + s.offset).toFixed(2),
      }));

      if (Number.isFinite(lat) && Number.isFinite(lng) && (lat || lng)) {
        stations = STATION_SEED.map((s, i) => ({
          id: s.id, brand: s.brand, name: s.name,
          lat: lat + (Math.cos(i) * 0.2 + (i - 2) * 0.15),
          lng: lng + (Math.sin(i) * 0.2 + (i - 2) * 0.15),
          amenities: s.amenities,
          price: +(base + s.offset).toFixed(2),
        })) as any;
        stations = stations.map((s) => ({ ...s, distance: +haversine([lat, lng], [s.lat, s.lng]).toFixed(1) })) as any;
        (stations as any[]).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
      }

      const cheapest = [...stations].sort((a, b) => a.price - b.price)[0];
      return c.json({
        stations,
        cheapestId: cheapest?.id,
        live: isLive,
        source: isLive ? "U.S. EIA" : "estimate",
        region: reg?.label ?? "U.S. Average",
        period: data.period || null,
        avg: reg ? +reg.base.toFixed(2) : null,
      }, 200);
    },
  )
  // Reverse-geocode lat/lng -> US state (keyless FCC Census block API)
  .get("/state", zValidator("query", z.object({ lat: z.string(), lng: z.string() })), async (c) => {
    const { lat, lng } = c.req.valid("query");
    try {
      const r = await fetch(`https://geo.fcc.gov/api/census/area?lat=${lat}&lon=${lng}&format=json`, { signal: AbortSignal.timeout(7000) });
      if (r.ok) {
        const j: any = await r.json();
        const st = j?.results?.[0]?.state_code || null;
        return c.json({ state: st }, 200);
      }
    } catch { /* ignore */ }
    return c.json({ state: null }, 200);
  })
  .get("/card/:driverId", (c) => c.json({ card: getCard(c.req.param("driverId")) }, 200))
  .post("/card/:driverId/charge", zValidator("json", z.object({ gallons: z.number(), pricePerGal: z.number(), station: z.string() })), async (c) => {
    const card = getCard(c.req.param("driverId"));
    const b = c.req.valid("json");
    const amount = +(b.gallons * b.pricePerGal).toFixed(2);
    if (amount > card.balance) return c.json({ error: "Insufficient balance", card }, 400);
    card.balance = +(card.balance - amount).toFixed(2);
    card.history.unshift({ at: Date.now(), station: b.station, gallons: b.gallons, amount });
    return c.json({ card, charged: amount }, 200);
  });
