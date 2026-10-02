import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, desc, and, ne } from "drizzle-orm";
import { ensureSeed } from "../lib/seed";

const rid = () => Math.random().toString(36).slice(2, 10);
const j = (v: unknown) => JSON.stringify(v ?? []);
const p = <T,>(v: string | null, fallback: T): T => {
  try {
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

type Row = typeof schema.mechanicSessions.$inferSelect;
const hydrate = (r: Row) => ({
  ...r,
  codes: p<string[]>(r.codes, []),
  repairSteps: p<string[]>(r.repairSteps, []),
  photoUrls: p<string[]>(r.photoUrls, []),
});

/**
 * INDEX=MECHANIC session archive — diagnoses, ELD fault scans, DVIR sessions
 * and PM plans. Replaces the localStorage-only shim storage for `mechanic_sessions`.
 */
export const mechanic = new Hono()
  .use("*", async (_c, next) => {
    await ensureSeed();
    await next();
  })

  .get("/", async (c) => {
    const mode = c.req.query("mode");
    const rows = mode
      ? await db
          .select()
          .from(schema.mechanicSessions)
          .where(eq(schema.mechanicSessions.mode, mode))
          .orderBy(desc(schema.mechanicSessions.createdAt))
      : await db.select().from(schema.mechanicSessions).orderBy(desc(schema.mechanicSessions.createdAt));
    return c.json({ sessions: rows.map(hydrate) }, 200);
  })

  .get("/truck/:unit", async (c) => {
    const rows = await db
      .select()
      .from(schema.mechanicSessions)
      .where(eq(schema.mechanicSessions.truckUnit, c.req.param("unit")))
      .orderBy(desc(schema.mechanicSessions.createdAt));
    return c.json({ sessions: rows.map(hydrate) }, 200);
  })

  /**
   * DVIR memory: the prior session for this truck, so the UI can diff today's
   * defects against yesterday's and flag anything new as NEW DAMAGE.
   */
  .get("/prior-dvir/:unit", async (c) => {
    const [prior] = await db
      .select()
      .from(schema.mechanicSessions)
      .where(and(eq(schema.mechanicSessions.truckUnit, c.req.param("unit")), eq(schema.mechanicSessions.mode, "dvir")))
      .orderBy(desc(schema.mechanicSessions.createdAt))
      .limit(1);
    return c.json({ prior: prior ? hydrate(prior) : null }, 200);
  })

  .get("/:id", async (c) => {
    const [row] = await db
      .select()
      .from(schema.mechanicSessions)
      .where(eq(schema.mechanicSessions.id, c.req.param("id")));
    if (!row) return c.json({ error: "not found" }, 404);
    return c.json({ session: hydrate(row) }, 200);
  })

  .post("/", async (c) => {
    const b = await c.req.json();
    const id = `mech-${rid()}`;
    const truckUnit: string | undefined = b.truckUnit;
    const codes: string[] = b.codes ?? [];
    const photoUrls: string[] = b.photoUrls ?? [];

    // DVIR memory: compare against the most recent prior DVIR for this truck
    let priorDvirId: string | null = null;
    let newDamage = false;
    if (b.mode === "dvir" && truckUnit) {
      const [prior] = await db
        .select()
        .from(schema.mechanicSessions)
        .where(and(eq(schema.mechanicSessions.truckUnit, truckUnit), eq(schema.mechanicSessions.mode, "dvir")))
        .orderBy(desc(schema.mechanicSessions.createdAt))
        .limit(1);
      if (prior) {
        priorDvirId = prior.id;
        const before = new Set(p<string[]>(prior.codes, []));
        newDamage = codes.some((x) => !before.has(x));
      } else {
        newDamage = codes.length > 0;
      }
    }

    const insuranceCarrier: string | null = b.insuranceCarrier ?? null;
    const insuranceFlagged = Boolean(newDamage && insuranceCarrier);

    const [session] = await db
      .insert(schema.mechanicSessions)
      .values({
        id,
        driverId: b.driverId ?? null,
        truckUnit: truckUnit ?? null,
        mode: b.mode ?? "diagnose",
        brand: b.brand ?? null,
        symptom: b.symptom ?? null,
        codes: j(codes),
        diagnosis: b.diagnosis ?? null,
        rootCause: b.rootCause ?? null,
        repairSteps: j(b.repairSteps ?? []),
        eldDevice: b.eldDevice ?? null,
        photoUrls: j(photoUrls),
        damageNotes: b.damageNotes ?? null,
        priorDvirId,
        newDamage,
        insuranceFlagged,
        insuranceCarrier,
        loggedToMaintease: false,
      })
      .returning();

    // Auto-wire to MaintEase: any defect found opens a work order the fleet
    // manager sees immediately.
    let workOrderId: string | null = null;
    if (codes.length > 0 && truckUnit) {
      workOrderId = `mr-${rid()}`;
      await db.insert(schema.maintenanceRecords).values({
        id: workOrderId,
        truckUnit,
        driverId: b.driverId ?? null,
        sessionId: id,
        type: "work_order",
        category: b.category ?? null,
        status: "open",
        priority: newDamage ? "high" : "normal",
        title: b.mode === "dvir" ? `DVIR defects — unit ${truckUnit}` : `Diagnosis — unit ${truckUnit}`,
        description: b.diagnosis ?? b.symptom ?? null,
        dtcCodes: j(codes),
        photoUrls: j(photoUrls),
        photoNotes: b.damageNotes ?? null,
        odometer: b.odometer ?? null,
        engineHours: b.engineHours ?? null,
      });
      await db
        .update(schema.mechanicSessions)
        .set({ loggedToMaintease: true })
        .where(eq(schema.mechanicSessions.id, id));
    }

    return c.json({ session: { ...hydrate(session), loggedToMaintease: Boolean(workOrderId) }, workOrderId }, 201);
  })

  .patch("/:id", async (c) => {
    const b = await c.req.json();
    const patch: Partial<typeof schema.mechanicSessions.$inferInsert> = {};
    if (b.diagnosis !== undefined) patch.diagnosis = b.diagnosis;
    if (b.rootCause !== undefined) patch.rootCause = b.rootCause;
    if (b.damageNotes !== undefined) patch.damageNotes = b.damageNotes;
    if (b.repairSteps !== undefined) patch.repairSteps = j(b.repairSteps);
    if (b.photoUrls !== undefined) patch.photoUrls = j(b.photoUrls);
    if (b.insuranceCarrier !== undefined) patch.insuranceCarrier = b.insuranceCarrier;
    const [row] = await db
      .update(schema.mechanicSessions)
      .set(patch)
      .where(eq(schema.mechanicSessions.id, c.req.param("id")))
      .returning();
    if (!row) return c.json({ error: "not found" }, 404);
    return c.json({ session: hydrate(row) }, 200);
  })

  .delete("/:id", async (c) => {
    await db.delete(schema.mechanicSessions).where(eq(schema.mechanicSessions.id, c.req.param("id")));
    return c.json({ ok: true }, 200);
  })

  /** Insurance queue: every session with new damage that flagged a carrier. */
  .get("/insurance/queue", async (c) => {
    const rows = await db
      .select()
      .from(schema.mechanicSessions)
      .where(and(eq(schema.mechanicSessions.insuranceFlagged, true), ne(schema.mechanicSessions.mode, "pm_planner")))
      .orderBy(desc(schema.mechanicSessions.createdAt));
    return c.json({ flagged: rows.map(hydrate) }, 200);
  });
