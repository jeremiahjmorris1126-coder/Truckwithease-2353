import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "../auth";

const id = (prefix: string) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
async function currentUser(headers: Headers) { try { return (await auth.api.getSession({ headers }))?.user ?? null; } catch { return null; } }

/** Executes a deliberately small, auditable command set. Speech recognition remains client/provider work; this route only executes text the user confirms. */
export const voice = new Hono().post("/execute", async (c) => {
  const user = await currentUser(c.req.raw.headers);
  if (!user) return c.json({ error: "Authentication required." }, 401);
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const transcript = String(body.transcript || "").trim();
  const driverId = String(body.driverId || "").trim();
  if (!transcript) return c.json({ error: "transcript is required" }, 400);
  const q = transcript.toLowerCase();
  if (/log me as driving|log driving/.test(q)) {
    if (!driverId) return c.json({ error: "driverId is required to change duty status." }, 400);
    const rows = await db.select().from(schema.hosLogs).where(eq(schema.hosLogs.driverId, driverId)).orderBy(desc(schema.hosLogs.startedAt));
    const open = rows.find((row) => !row.endedAt);
    if (open) await db.update(schema.hosLogs).set({ endedAt: new Date() }).where(eq(schema.hosLogs.id, open.id));
    await db.insert(schema.hosLogs).values({ id: id("hos"), driverId, status: "driving", startedAt: new Date(), note: "Voice command confirmed by signed-in user." });
    await db.update(schema.drivers).set({ status: "driving", lastSeen: new Date() }).where(eq(schema.drivers.id, driverId));
    return c.json({ executed: true, action: "duty_status", message: "Duty status changed to driving." });
  }
  if (/take a break|log.*break/.test(q)) {
    if (!driverId) return c.json({ error: "driverId is required to change duty status." }, 400);
    const rows = await db.select().from(schema.hosLogs).where(eq(schema.hosLogs.driverId, driverId)).orderBy(desc(schema.hosLogs.startedAt));
    const open = rows.find((row) => !row.endedAt);
    if (open) await db.update(schema.hosLogs).set({ endedAt: new Date() }).where(eq(schema.hosLogs.id, open.id));
    await db.insert(schema.hosLogs).values({ id: id("hos"), driverId, status: "off_duty", startedAt: new Date(), note: "Voice command confirmed by signed-in user." });
    await db.update(schema.drivers).set({ status: "off_duty", lastSeen: new Date() }).where(eq(schema.drivers.id, driverId));
    return c.json({ executed: true, action: "duty_status", message: "Break started." });
  }
  if (/tell dispatch|at the dock/.test(q)) {
    const message = /at the dock/.test(q) ? "Arrived at dock." : "ETA 30 minutes.";
    await db.insert(schema.messages).values({ id: id("msg"), fromId: user.id, fromName: user.name || user.email || "Driver", body: message });
    return c.json({ executed: true, action: "dispatch_message", message: `Dispatch message saved: ${message}` });
  }
  return c.json({ executed: false, message: "That command is not enabled yet. Use the displayed commands to avoid unsafe or ambiguous actions." }, 200);
});
