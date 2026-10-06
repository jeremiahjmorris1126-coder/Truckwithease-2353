import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { auth } from "../auth";

const input = z.object({
  grossPay: z.number().finite().nonnegative(),
  miles: z.number().finite().positive(),
  deadhead: z.number().finite().nonnegative().default(0),
  mpg: z.number().finite().positive(),
  fuelPrice: z.number().finite().nonnegative(),
  tolls: z.number().finite().nonnegative().default(0),
  lumper: z.number().finite().nonnegative().default(0),
  detention: z.number().finite().nonnegative().default(0),
  driverPayPerMile: z.number().finite().nonnegative().default(0),
  otherCosts: z.number().finite().nonnegative().default(0),
  broker: z.string().trim().max(160).optional(),
  trailerType: z.string().trim().max(80).optional(),
  weight: z.number().finite().nonnegative().optional(),
});

type CalculationInput = z.infer<typeof input>;
const id = () => `profit_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

function calculate(v: CalculationInput) {
  const totalMiles = v.miles + v.deadhead;
  const fuelGallons = totalMiles / v.mpg;
  const fuelCost = fuelGallons * v.fuelPrice;
  const driverPay = v.miles * v.driverPayPerMile;
  const revenue = v.grossPay + v.detention;
  const totalCosts = fuelCost + driverPay + v.tolls + v.lumper + v.otherCosts;
  const netProfit = revenue - totalCosts;
  const netPerMile = netProfit / v.miles;
  const verdict = netPerMile < 1.5 ? "poor" : netPerMile < 2.2 ? "marginal" : netPerMile < 3 ? "good" : "excellent";
  return { ...v, totalMiles, fuelGallons, fuelCost, driverPay, revenue, totalCosts, netProfit, grossPerMile: v.grossPay / v.miles, netPerMile, breakEvenPerMile: totalCosts / v.miles, margin: revenue ? netProfit / revenue : 0, verdict };
}

async function userId(headers: Headers) {
  try {
    const session = await auth.api.getSession({ headers });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

function recordFrom(row: typeof schema.driverSignals.$inferSelect) {
  try {
    const calculation = JSON.parse(row.meta ?? "{}") as ReturnType<typeof calculate>;
    return { id: row.id, createdAt: row.createdAt, calculation };
  } catch {
    return null;
  }
}

/** Server-authoritative calculations persisted as driver signals; no rate, fuel, or broker data is invented. */
export const profit = new Hono()
  .get("/calculations", async (c) => {
    const driverId = await userId(c.req.raw.headers);
    if (!driverId) return c.json({ error: "Authentication required." }, 401);
    const rows = await db.select().from(schema.driverSignals)
      .where(eq(schema.driverSignals.driverId, driverId))
      .orderBy(desc(schema.driverSignals.occurredAt)).limit(50);
    const calculations = rows.filter((r) => r.source === "load-profit" && r.kind === "calculation_saved").map(recordFrom).filter(Boolean);
    return c.json({ calculations, note: "Values are entered by the signed-in user. This endpoint does not supply market rates, fuel prices, or broker credit data." });
  })
  .post("/calculations", zValidator("json", input), async (c) => {
    const driverId = await userId(c.req.raw.headers);
    if (!driverId) return c.json({ error: "Authentication required." }, 401);
    const calculation = calculate(c.req.valid("json"));
    const row = {
      id: id(), driverId, dimension: "load", kind: "calculation_saved", subject: calculation.broker ?? null,
      numericValue: calculation.netProfit, unit: "usd", source: "load-profit", meta: JSON.stringify(calculation),
    };
    await db.insert(schema.driverSignals).values(row);
    return c.json({ calculation: { id: row.id, createdAt: new Date(), calculation }, stored: true }, 201);
  })
  .post("/calculate", zValidator("json", input), (c) => c.json({ calculation: calculate(c.req.valid("json")), stored: false }));
