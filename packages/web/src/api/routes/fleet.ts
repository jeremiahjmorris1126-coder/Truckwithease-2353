import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";
import { ensureSeed } from "../lib/seed";

const rid = () => Math.random().toString(36).slice(2, 10);

export const fleet = new Hono()
  .use("*", async (_c, next) => { await ensureSeed(); await next(); })
  .get("/drivers", async (c) => {
    const rows = await db.select().from(schema.drivers);
    return c.json({ drivers: rows }, 200);
  })
  .get("/drivers/:id", async (c) => {
    const [d] = await db.select().from(schema.drivers).where(eq(schema.drivers.id, c.req.param("id")));
    return c.json({ driver: d ?? null }, 200);
  })
  .get("/trucks", async (c) => {
    const rows = await db.select().from(schema.trucks);
    return c.json({ trucks: rows }, 200);
  })
  .post("/trucks", async (c) => {
    const b = await c.req.json();
    const [t] = await db.insert(schema.trucks).values({
      id: `trk-${rid()}`, unit: b.unit, make: b.make, model: b.model, year: b.year,
      vin: b.vin, plate: b.plate, assignedDriverId: b.assignedDriverId, odometer: b.odometer ?? 0,
      status: b.status ?? "active",
    }).returning();
    return c.json({ truck: t }, 201);
  })
  .post("/trucks/:id/assign", async (c) => {
    const b = await c.req.json();
    const [t] = await db.update(schema.trucks).set({ assignedDriverId: b.driverId })
      .where(eq(schema.trucks.id, c.req.param("id"))).returning();
    return c.json({ truck: t }, 200);
  })
  // Live positions for map — simulate small drift for driving drivers
  .get("/positions", async (c) => {
    const rows = await db.select().from(schema.drivers);
    const positions = rows.map((d) => {
      let { lat, lng } = d;
      if (d.status === "driving" && lat && lng) {
        const rad = ((d.heading ?? 0) * Math.PI) / 180;
        lat += Math.cos(rad) * 0.004 * Math.random();
        lng += Math.sin(rad) * 0.004 * Math.random();
      }
      return { id: d.id, name: d.name, truckNumber: d.truckNumber, status: d.status, lat, lng, speed: d.speed, heading: d.heading };
    });
    return c.json({ positions }, 200);
  })
  .post("/drivers/:id/status", async (c) => {
    const b = await c.req.json();
    const [d] = await db.update(schema.drivers).set({ status: b.status, lastSeen: new Date() })
      .where(eq(schema.drivers.id, c.req.param("id"))).returning();
    return c.json({ driver: d }, 200);
  })
  .post("/drivers/:id/location", async (c) => {
    const b = await c.req.json();
    const [d] = await db.update(schema.drivers).set({
      lat: b.lat, lng: b.lng, speed: b.speed ?? 0, heading: b.heading ?? 0, lastSeen: new Date(),
    }).where(eq(schema.drivers.id, c.req.param("id"))).returning();
    return c.json({ driver: d }, 200);
  });
