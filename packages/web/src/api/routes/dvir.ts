import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, desc } from "drizzle-orm";
import { ensureSeed } from "../lib/seed";

const rid = () => Math.random().toString(36).slice(2, 10);

// 49 CFR 396.11/396.13 inspection checklist items
export const TRACTOR_ITEMS = [
  "Service brakes", "Parking brake", "Steering mechanism", "Lighting devices/reflectors",
  "Tires", "Horn", "Windshield wipers", "Rear vision mirrors", "Coupling devices",
  "Wheels and rims", "Emergency equipment", "Air compressor / lines",
];
export const TRAILER_ITEMS = [
  "Brake connections", "Brakes", "Coupling devices", "Coupling king pin",
  "Doors", "Hitch", "Landing gear", "Lighting devices", "Reflectors",
  "Tires", "Wheels and rims", "Suspension",
];

export const dvir = new Hono()
  .use("*", async (_c, next) => { await ensureSeed(); await next(); })
  .get("/items", (c) => c.json({ tractor: TRACTOR_ITEMS, trailer: TRAILER_ITEMS }, 200))
  .get("/", async (c) => {
    const rows = await db.select().from(schema.dvirInspections).orderBy(desc(schema.dvirInspections.createdAt));
    return c.json({ inspections: rows.map((r) => ({ ...r, defects: JSON.parse(r.defects || "[]") })) }, 200);
  })
  .get("/driver/:driverId", async (c) => {
    const rows = await db.select().from(schema.dvirInspections)
      .where(eq(schema.dvirInspections.driverId, c.req.param("driverId")))
      .orderBy(desc(schema.dvirInspections.createdAt));
    return c.json({ inspections: rows.map((r) => ({ ...r, defects: JSON.parse(r.defects || "[]") })) }, 200);
  })
  .post("/", async (c) => {
    const b = await c.req.json();
    const defects: string[] = b.defects ?? [];
    const [insp] = await db.insert(schema.dvirInspections).values({
      id: `dvir-${rid()}`, driverId: b.driverId, truckUnit: b.truckUnit, type: b.type,
      vehicleType: b.vehicleType ?? "tractor", odometer: b.odometer, location: b.location,
      defects: JSON.stringify(defects), hasDefects: defects.length > 0,
      safeToOperate: b.safeToOperate ?? defects.length === 0, signature: b.signature,
      photoUrls: JSON.stringify(b.photoUrls ?? []),
      status: defects.length > 0 ? "needs_repair" : "submitted",
    }).returning();
    return c.json({ inspection: { ...insp, defects } }, 201);
  })
  .post("/:id/resolve", async (c) => {
    const [insp] = await db.update(schema.dvirInspections)
      .set({ status: "resolved", safeToOperate: true })
      .where(eq(schema.dvirInspections.id, c.req.param("id"))).returning();
    return c.json({ inspection: insp }, 200);
  });
