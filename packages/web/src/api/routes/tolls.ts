import { Hono } from "hono";

// Toll suite — 5-axle truck rates for major toll roads. Demo-safe, in-memory.
const ROADS = [
  { id: "il-tri", name: "Illinois Tollway (I-90/I-294)", state: "IL", perMile: 0.28 },
  { id: "oh-tpk", name: "Ohio Turnpike", state: "OH", perMile: 0.19 },
  { id: "in-tpk", name: "Indiana Toll Road", state: "IN", perMile: 0.31 },
  { id: "pa-tpk", name: "Pennsylvania Turnpike", state: "PA", perMile: 0.42 },
  { id: "nj-tpk", name: "New Jersey Turnpike", state: "NJ", perMile: 0.38 },
  { id: "ny-thr", name: "New York Thruway", state: "NY", perMile: 0.24 },
  { id: "ks-tpk", name: "Kansas Turnpike", state: "KS", perMile: 0.14 },
  { id: "ok-tpk", name: "Oklahoma Turnpikes", state: "OK", perMile: 0.16 },
  { id: "fl-tpk", name: "Florida Turnpike", state: "FL", perMile: 0.22 },
  { id: "tx-tpk", name: "Texas Tollways", state: "TX", perMile: 0.20 },
];

type Expense = { id: string; driverId: string; road: string; state: string; amount: number; date: string; at: number };
const expenses: Expense[] = [];
const transponders: Record<string, { active: boolean; tag: string }> = {};

export const tolls = new Hono()
  .get("/roads", (c) => c.json({ roads: ROADS }, 200))
  .post("/estimate", async (c) => {
    const b = await c.req.json();
    const road = ROADS.find((r) => r.id === b.roadId);
    if (!road) return c.json({ error: "Road not found" }, 404);
    const axleFactor = (b.axles ?? 5) / 5;
    const gross = road.perMile * b.miles * axleFactor;
    const prepass = +(gross * 0.82).toFixed(2); // ~18% discount
    return c.json({ road: road.name, miles: b.miles, gross: +gross.toFixed(2), withPrePass: prepass, saved: +(gross - prepass).toFixed(2) }, 200);
  })
  .post("/compare", async (c) => {
    const b = await c.req.json();
    const road = ROADS.find((r) => r.id === b.roadId);
    if (!road) return c.json({ error: "Road not found" }, 404);
    const tollCost = +(road.perMile * b.miles).toFixed(2);
    const detourMiles = b.detourMiles ?? b.miles * 1.15;
    const fuelCost = +((detourMiles - b.miles) / 6.5 * 3.7).toFixed(2); // extra fuel for detour
    const addedMin = Math.round(((detourMiles - b.miles) / 55) * 60);
    return c.json({
      tollRoute: { miles: b.miles, cost: tollCost, addedMin: 0 },
      freeRoute: { miles: +detourMiles.toFixed(0), cost: fuelCost, addedMin },
      recommendation: tollCost > fuelCost + 20 ? "toll-free" : "toll",
      netSaved: +(tollCost - fuelCost).toFixed(2),
    }, 200);
  })
  .get("/expenses/:driverId", (c) => {
    const rows = expenses.filter((e) => e.driverId === c.req.param("driverId"));
    const byState: Record<string, number> = {};
    for (const e of rows) byState[e.state] = (byState[e.state] ?? 0) + e.amount;
    const total = +rows.reduce((s, e) => s + e.amount, 0).toFixed(2);
    return c.json({ expenses: rows.sort((a, b) => b.at - a.at), byState, total }, 200);
  })
  .post("/expenses/:driverId", async (c) => {
    const b = await c.req.json();
    const e: Expense = { id: Math.random().toString(36).slice(2), driverId: c.req.param("driverId"), road: b.road, state: b.state, amount: b.amount, date: b.date ?? new Date().toISOString().slice(0, 10), at: Date.now() };
    expenses.push(e);
    return c.json({ expense: e }, 201);
  })
  .get("/transponder/:driverId", (c) => {
    const tier = c.req.query("tier");
    if (tier !== "pro" && tier !== "fleet") return c.json({ eligible: false, reason: "PrePass bundle is a Pro / Fleet perk." }, 200);
    const t = transponders[c.req.param("driverId")] ?? { active: false, tag: "" };
    return c.json({ eligible: true, ...t, price: 14.95, retail: 19.99 }, 200);
  })
  .post("/transponder/:driverId/activate", (c) => {
    const tag = "PP-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    transponders[c.req.param("driverId")] = { active: true, tag };
    return c.json({ active: true, tag }, 200);
  });
