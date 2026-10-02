import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";
import { ensureSeed } from "../lib/seed";

// EaseRewards — the first real driver loyalty program built into a compliance app.
// Points from: miles driven, clean-compliance days, DVIRs, fuel purchases.
type Ledger = { id: string; driverId: string; type: string; points: number; note: string; at: number };
const ledger: Ledger[] = [];

const CATALOG = [
  { id: "r1", title: "$10 Subscription Credit", cost: 5000, category: "subscription", desc: "One month, $10 off your plan." },
  { id: "r2", title: "$25 Fuel Credit", cost: 12000, category: "fuel", desc: "Loaded to your in-app fuel card." },
  { id: "r3", title: "Free Month (Solo)", cost: 20000, category: "subscription", desc: "One month of Solo free." },
  { id: "r4", title: "$50 Pilot/Flying J Gift", cost: 24000, category: "partner", desc: "Partner truck-stop gift card." },
  { id: "r5", title: "TruckWithEase Hat + Mug", cost: 6000, category: "merch", desc: "Branded driver merch bundle." },
  { id: "r6", title: "$100 Fuel Credit", cost: 45000, category: "fuel", desc: "Big fill-up on us." },
];

const EARN_RULES = [
  { action: "Mile driven", points: "1 pt / mile" },
  { action: "Clean compliance day (no violations)", points: "250 pts / day" },
  { action: "On-time DVIR submitted", points: "150 pts" },
  { action: "Fuel purchase via app", points: "5 pts / gallon" },
  { action: "Referral joins", points: "10,000 pts" },
];

// Achievement badges — keys match packages/web/src/web/components/badge-showcase.tsx.
// Earned status is derived from real rows; anything with no data source stays locked
// rather than being faked.
const BADGE_KEYS = [
  "first-load-assigned",
  "first-route-saved",
  "five-routes-saved",
  "ten-stops-rated",
  "danger-report-filed",
  "broker-warned",
  "one-week-user",
  "fifty-actions",
] as const;

export const rewards = new Hono()
  .use("*", async (_c, next) => { await ensureSeed(); await next(); })
  .get("/catalog", (c) => c.json({ catalog: CATALOG, earnRules: EARN_RULES }, 200))
  .get("/:driverId", async (c) => {
    const driverId = c.req.param("driverId");
    const [d] = await db.select().from(schema.drivers).where(eq(schema.drivers.id, driverId));
    const history = ledger.filter((l) => l.driverId === driverId).sort((a, b) => b.at - a.at);
    const points = d?.points ?? 0;
    const tier = points >= 5000 ? "Gold" : points >= 2000 ? "Silver" : "Bronze";
    const nextTier = points >= 5000 ? null : points >= 2000 ? { name: "Gold", at: 5000 } : { name: "Silver", at: 2000 };
    return c.json({ points, tier, nextTier, history }, 200);
  })
  .get("/:driverId/badges", async (c) => {
    const driverId = c.req.param("driverId");
    const [d] = await db.select().from(schema.drivers).where(eq(schema.drivers.id, driverId));
    if (!d) return c.json({ error: "Driver not found" }, 404);

    const bookedLoads = await db.select().from(schema.loads).where(eq(schema.loads.bookedByDriverId, driverId));
    const inspections = await db.select().from(schema.dvirInspections).where(eq(schema.dvirInspections.driverId, driverId));
    const driverTrips = await db.select().from(schema.trips).where(eq(schema.trips.driverId, driverId));
    const actions = bookedLoads.length + inspections.length + driverTrips.length + ledger.filter((l) => l.driverId === driverId).length;
    const ageDays = (Date.now() - new Date(d.createdAt).getTime()) / 86_400_000;

    const earned: string[] = [];
    if (bookedLoads.length >= 1) earned.push("first-load-assigned");
    if (driverTrips.length >= 1) earned.push("first-route-saved");
    if (driverTrips.length >= 5) earned.push("five-routes-saved");
    if (inspections.filter((i) => i.hasDefects).length >= 1) earned.push("danger-report-filed");
    if (ageDays >= 7) earned.push("one-week-user");
    if (actions >= 50) earned.push("fifty-actions");
    // ten-stops-rated and broker-warned have no table yet — intentionally never awarded.

    return c.json(
      {
        achievements: earned,
        all: BADGE_KEYS,
        counters: { bookedLoads: bookedLoads.length, inspections: inspections.length, trips: driverTrips.length, actions, ageDays: Math.floor(ageDays) },
      },
      200,
    );
  })
  .post("/:driverId/earn", async (c) => {
    const driverId = c.req.param("driverId");
    const b = await c.req.json();
    const [d] = await db.select().from(schema.drivers).where(eq(schema.drivers.id, driverId));
    const newPts = (d?.points ?? 0) + b.points;
    await db.update(schema.drivers).set({ points: newPts }).where(eq(schema.drivers.id, driverId));
    ledger.push({ id: Math.random().toString(36).slice(2), driverId, type: "earn", points: b.points, note: b.note ?? "Points earned", at: Date.now() });
    return c.json({ points: newPts }, 200);
  })
  .post("/:driverId/redeem", zValidator("json", z.object({ rewardId: z.string() })), async (c) => {
    const driverId = c.req.param("driverId");
    const b = c.req.valid("json");
    const item = CATALOG.find((r) => r.id === b.rewardId);
    if (!item) return c.json({ error: "Reward not found" }, 404);
    const [d] = await db.select().from(schema.drivers).where(eq(schema.drivers.id, driverId));
    if ((d?.points ?? 0) < item.cost) return c.json({ error: "Not enough points" }, 400);
    const newPts = (d?.points ?? 0) - item.cost;
    await db.update(schema.drivers).set({ points: newPts }).where(eq(schema.drivers.id, driverId));
    ledger.push({ id: Math.random().toString(36).slice(2), driverId, type: "redeem", points: -item.cost, note: `Redeemed: ${item.title}`, at: Date.now() });
    return c.json({ points: newPts, redeemed: item }, 200);
  });
