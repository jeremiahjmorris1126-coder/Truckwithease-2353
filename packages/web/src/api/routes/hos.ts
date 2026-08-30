import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, desc } from "drizzle-orm";
import { ensureSeed } from "../lib/seed";
import { LIMITS as DUTY_LIMITS, clockSnapshotAt } from "../lib/dutyclock";

const rid = () => Math.random().toString(36).slice(2, 10);

// 49 CFR 395 property-carrying limits and the interval reader now live in
// api/lib/dutyclock.ts. That module holds the STALE_OPEN_HOURS guard: an
// hos_logs row left open for longer than that is EXCLUDED and counted, never
// run to "now". This file used to do `l.endedAt ? +l.endedAt : now`, which
// counted abandoned rows as live duty time.
const LIMITS = {
  driving: DUTY_LIMITS.driving,
  onDutyWindow: DUTY_LIMITS.onDutyWindow,
  cycle: DUTY_LIMITS.cycle,
  breakAfter: DUTY_LIMITS.breakAfterDriving,
};

export function computeClocks(logs: (typeof schema.hosLogs.$inferSelect)[]) {
  const snap = clockSnapshotAt(logs, Date.now());
  return {
    drivingUsed: snap.drivingUsedMin,
    drivingRemaining: snap.drivingRemainingMin,
    onDutyWindowUsed: snap.windowUsedMin,
    onDutyWindowRemaining: snap.windowRemainingMin,
    cycleUsed: snap.cycleUsedMin,
    cycleRemaining: snap.cycleRemainingMin,
    limits: LIMITS,
    intervalsExcludedStaleOpen: snap.intervalsExcludedStaleOpen,
    staleOpenHours: snap.staleOpenHours,
    excludedNote: snap.measurementNote,
  };
}

export function hosViolations(clocks: ReturnType<typeof computeClocks>) {
  const v: { level: string; msg: string }[] = [];
  if (clocks.drivingRemaining <= 0) v.push({ level: "danger", msg: "11-hour driving limit reached — you must stop." });
  else if (clocks.drivingRemaining <= 30) v.push({ level: "warning", msg: `Only ${clocks.drivingRemaining} min driving time left.` });
  if (clocks.onDutyWindowRemaining <= 0) v.push({ level: "danger", msg: "14-hour on-duty window closed." });
  else if (clocks.onDutyWindowRemaining <= 60) v.push({ level: "warning", msg: `${clocks.onDutyWindowRemaining} min left in 14-hr window.` });
  if (clocks.drivingUsed >= LIMITS.breakAfter) v.push({ level: "warning", msg: "30-minute break required (8 hrs driving)." });
  return v;
}

export const hos = new Hono()
  .use("*", async (_c, next) => { await ensureSeed(); await next(); })
  .get("/:driverId", async (c) => {
    const driverId = c.req.param("driverId");
    const logs = await db.select().from(schema.hosLogs)
      .where(eq(schema.hosLogs.driverId, driverId)).orderBy(desc(schema.hosLogs.startedAt));
    const clocks = computeClocks(logs);
    return c.json({ logs, clocks, violations: hosViolations(clocks) }, 200);
  })
  // Switch duty status — closes open log, opens new one
  .post("/:driverId/status", zValidator("json", z.object({ status: z.string(), location: z.string().optional(), note: z.string().optional() })), async (c) => {
    const driverId = c.req.param("driverId");
    const b = c.req.valid("json");
    const nowD = new Date();
    const open = await db.select().from(schema.hosLogs)
      .where(eq(schema.hosLogs.driverId, driverId)).orderBy(desc(schema.hosLogs.startedAt));
    const current = open.find((l) => !l.endedAt);
    if (current) {
      await db.update(schema.hosLogs).set({ endedAt: nowD }).where(eq(schema.hosLogs.id, current.id));
    }
    const [log] = await db.insert(schema.hosLogs).values({
      id: `hos-${rid()}`, driverId, status: b.status, startedAt: nowD, location: b.location ?? null, note: b.note ?? null,
    }).returning();
    await db.update(schema.drivers).set({ status: b.status }).where(eq(schema.drivers.id, driverId));
    return c.json({ log }, 201);
  })
  // Fleet-wide HOS summary for admin
  .get("/", async (c) => {
    const drivers = await db.select().from(schema.drivers);
    const out = [];
    for (const d of drivers) {
      const logs = await db.select().from(schema.hosLogs).where(eq(schema.hosLogs.driverId, d.id));
      const clocks = computeClocks(logs);
      out.push({ driverId: d.id, name: d.name, truckNumber: d.truckNumber, status: d.status, clocks, violations: hosViolations(clocks) });
    }
    return c.json({ fleet: out }, 200);
  });
