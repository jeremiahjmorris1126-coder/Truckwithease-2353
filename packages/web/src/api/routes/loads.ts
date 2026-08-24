import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";
import { ensureSeed } from "../lib/seed";

const rid = () => Math.random().toString(36).slice(2, 10);

export const loads = new Hono()
  .use("*", async (_c, next) => { await ensureSeed(); await next(); })
  .get("/", async (c) => {
    const rows = await db.select().from(schema.loads);
    return c.json({ loads: rows.map((l) => ({ ...l, rpm: l.rate && l.miles ? +(l.rate / l.miles).toFixed(2) : null })) }, 200);
  })
  .post("/", zValidator("json", z.object({ origin: z.string(), destination: z.string(), miles: z.number(), rate: z.number(), equipment: z.string(), weight: z.number().nullable().optional(), pickupDate: z.string(), broker: z.string() })), async (c) => {
    const b = c.req.valid("json");
    const [l] = await db.insert(schema.loads).values({
      id: `load-${rid()}`, origin: b.origin, destination: b.destination, miles: b.miles,
      rate: b.rate, equipment: b.equipment, weight: b.weight, pickupDate: b.pickupDate, broker: b.broker,
    }).returning();
    return c.json({ load: l }, 201);
  })
  .post("/:id/book", zValidator("json", z.object({ driverId: z.string() })), async (c) => {
    const b = c.req.valid("json");
    const [l] = await db.update(schema.loads)
      .set({ status: "booked", bookedByDriverId: b.driverId })
      .where(eq(schema.loads.id, c.req.param("id"))).returning();
    return c.json({ load: l }, 200);
  });
