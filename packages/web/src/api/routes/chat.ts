import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { desc } from "drizzle-orm";
import { ensureSeed } from "../lib/seed";

const rid = () => Math.random().toString(36).slice(2, 10);

export const chat = new Hono()
  .use("*", async (_c, next) => { await ensureSeed(); await next(); })
  .get("/", async (c) => {
    const rows = await db.select().from(schema.messages).orderBy(desc(schema.messages.createdAt)).limit(100);
    return c.json({ messages: rows.reverse() }, 200);
  })
  .post("/", async (c) => {
    const b = await c.req.json();
    const [m] = await db.insert(schema.messages).values({
      id: `msg-${rid()}`, fromId: b.fromId, fromName: b.fromName, toId: b.toId ?? null, body: b.body,
    }).returning();
    return c.json({ message: m }, 201);
  });
