import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, desc, and } from "drizzle-orm";
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

type Row = typeof schema.maintenanceRecords.$inferSelect;
const hydrate = (r: Row) => ({
  ...r,
  dtcCodes: p<string[]>(r.dtcCodes, []),
  eldFlags: p<string[]>(r.eldFlags, []),
  photoUrls: p<string[]>(r.photoUrls, []),
});

/**
 * Preventive-maintenance intervals used by the PM Planner. Miles-based unless
 * the interval is hours- or calendar-driven.
 */
export const PM_INTERVALS: { key: string; label: string; miles?: number; hours?: number; months?: number }[] = [
  { key: "oil_change", label: "Engine oil & filter", miles: 25000, hours: 500 },
  { key: "fuel_filter", label: "Fuel filters", miles: 25000 },
  { key: "air_filter", label: "Air filter", miles: 50000 },
  { key: "coolant_sca", label: "Coolant / SCA test", miles: 50000, months: 12 },
  { key: "belts_hoses", label: "Belts & hoses", miles: 60000 },
  { key: "trans_fluid", label: "Transmission fluid", miles: 250000 },
  { key: "differentials", label: "Differential fluid", miles: 250000 },
  { key: "wheel_bearings", label: "Wheel bearings / seals", miles: 200000 },
  { key: "dpf_clean", label: "DPF cleaning", miles: 200000 },
  { key: "def_filter", label: "DEF pump filter", miles: 200000 },
  { key: "valve_adjust", label: "Valve lash adjustment", miles: 300000 },
  { key: "brake_inspect", label: "Brake inspection / adjustment", miles: 25000 },
  { key: "brake_shoes", label: "Brake shoes / drums", miles: 150000 },
  { key: "tire_rotation", label: "Tire rotation", miles: 50000 },
  { key: "alignment", label: "Alignment check", miles: 100000, months: 12 },
  { key: "steering_gear", label: "Steering gear & linkage", miles: 100000 },
  { key: "suspension", label: "Suspension / airbags", miles: 100000 },
  { key: "batteries", label: "Batteries & terminals", months: 36 },
  { key: "greasing", label: "Chassis lube / greasing", miles: 25000 },
  { key: "dot_annual", label: "DOT annual inspection", months: 12 },
];

/** MaintEase — the permanent fleet service archive. */
export const maintenance = new Hono()
  .use("*", async (_c, next) => {
    await ensureSeed();
    await next();
  })

  .get("/pm-intervals", (c) => c.json({ intervals: PM_INTERVALS }, 200))

  .get("/", async (c) => {
    const status = c.req.query("status");
    const rows = status
      ? await db
          .select()
          .from(schema.maintenanceRecords)
          .where(eq(schema.maintenanceRecords.status, status))
          .orderBy(desc(schema.maintenanceRecords.createdAt))
      : await db.select().from(schema.maintenanceRecords).orderBy(desc(schema.maintenanceRecords.createdAt));
    return c.json({ records: rows.map(hydrate) }, 200);
  })

  .get("/truck/:unit", async (c) => {
    const rows = await db
      .select()
      .from(schema.maintenanceRecords)
      .where(eq(schema.maintenanceRecords.truckUnit, c.req.param("unit")))
      .orderBy(desc(schema.maintenanceRecords.createdAt));
    return c.json({ records: rows.map(hydrate) }, 200);
  })

  /** Open work orders the fleet manager needs to see, highest priority first. */
  .get("/work-orders", async (c) => {
    const rows = await db
      .select()
      .from(schema.maintenanceRecords)
      .where(and(eq(schema.maintenanceRecords.type, "work_order"), eq(schema.maintenanceRecords.status, "open")))
      .orderBy(desc(schema.maintenanceRecords.createdAt));
    const rank: Record<string, number> = { critical: 0, high: 1, normal: 2, low: 3 };
    const records = rows.map(hydrate).sort((a, b) => (rank[a.priority] ?? 9) - (rank[b.priority] ?? 9));
    return c.json({ records }, 200);
  })

  /**
   * PM Planner: given current odometer and engine hours, returns every interval
   * with its status. Uses the last completed record per interval as the baseline.
   */
  .get("/pm-plan/:unit", async (c) => {
    const unit = c.req.param("unit");
    const odometer = Number(c.req.query("odometer") ?? 0);
    const engineHours = Number(c.req.query("engineHours") ?? 0);

    const done = await db
      .select()
      .from(schema.maintenanceRecords)
      .where(and(eq(schema.maintenanceRecords.truckUnit, unit), eq(schema.maintenanceRecords.status, "complete")))
      .orderBy(desc(schema.maintenanceRecords.createdAt));

    const plan = PM_INTERVALS.map((iv) => {
      const last = done.find((r) => r.pmInterval === iv.key);
      const lastMiles = last?.odometer ?? 0;
      const dueAtMiles = iv.miles ? lastMiles + iv.miles : null;
      const milesRemaining = dueAtMiles === null ? null : dueAtMiles - odometer;

      let status: "overdue" | "due_soon" | "on_track" = "on_track";
      if (milesRemaining !== null) {
        if (milesRemaining <= 0) status = "overdue";
        else if (milesRemaining <= (iv.miles ?? 0) * 0.1) status = "due_soon";
      } else if (iv.hours && engineHours > 0 && last?.engineHours != null) {
        const hoursRemaining = last.engineHours + iv.hours - engineHours;
        if (hoursRemaining <= 0) status = "overdue";
        else if (hoursRemaining <= iv.hours * 0.1) status = "due_soon";
      }

      return {
        ...iv,
        lastServiceMiles: last?.odometer ?? null,
        lastServiceDate: last?.performedOn ?? null,
        dueAtMiles,
        milesRemaining,
        status,
      };
    });

    return c.json(
      {
        unit,
        odometer,
        engineHours,
        overdue: plan.filter((x) => x.status === "overdue").length,
        dueSoon: plan.filter((x) => x.status === "due_soon").length,
        plan,
      },
      200,
    );
  })

  /** Asset Health Index — cost, downtime and open-defect roll-up per unit. */
  .get("/health-index", async (c) => {
    const rows = await db.select().from(schema.maintenanceRecords);
    const byUnit = new Map<string, { unit: string; open: number; critical: number; totalCost: number; downtimeHours: number; records: number }>();
    for (const r of rows) {
      const e = byUnit.get(r.truckUnit) ?? { unit: r.truckUnit, open: 0, critical: 0, totalCost: 0, downtimeHours: 0, records: 0 };
      e.records += 1;
      if (r.status === "open" || r.status === "in_progress") e.open += 1;
      if (r.priority === "critical") e.critical += 1;
      e.totalCost += r.totalCost ?? 0;
      e.downtimeHours += r.downtimeHours ?? 0;
      byUnit.set(r.truckUnit, e);
    }
    const units = [...byUnit.values()].map((e) => {
      // 100 minus penalties: 6/open defect, 15/critical, 1 per 8h downtime.
      const score = Math.max(0, Math.min(100, Math.round(100 - e.open * 6 - e.critical * 15 - e.downtimeHours / 8)));
      return { ...e, healthScore: score, grade: score >= 85 ? "good" : score >= 65 ? "watch" : "action" };
    });
    return c.json({ units: units.sort((a, b) => a.healthScore - b.healthScore) }, 200);
  })

  .get("/:id", async (c) => {
    const [row] = await db
      .select()
      .from(schema.maintenanceRecords)
      .where(eq(schema.maintenanceRecords.id, c.req.param("id")));
    if (!row) return c.json({ error: "not found" }, 404);
    return c.json({ record: hydrate(row) }, 200);
  })

  .post("/", async (c) => {
    const b = await c.req.json();
    const partsCost = Number(b.partsCost ?? 0);
    const laborCost = Number(b.laborCost ?? 0);
    const [row] = await db
      .insert(schema.maintenanceRecords)
      .values({
        id: `mr-${rid()}`,
        truckUnit: b.truckUnit,
        driverId: b.driverId ?? null,
        sessionId: b.sessionId ?? null,
        type: b.type ?? "repair",
        category: b.category ?? null,
        status: b.status ?? "open",
        priority: b.priority ?? "normal",
        title: b.title ?? "Service record",
        description: b.description ?? null,
        dtcCodes: j(b.dtcCodes ?? []),
        eldFlags: j(b.eldFlags ?? []),
        scanData: b.scanData ? JSON.stringify(b.scanData) : null,
        quantumDiagnosis: b.quantumDiagnosis ?? null,
        photoNotes: b.photoNotes ?? null,
        photoUrls: j(b.photoUrls ?? []),
        odometer: b.odometer ?? null,
        engineHours: b.engineHours ?? null,
        vendor: b.vendor ?? null,
        vendorPhone: b.vendorPhone ?? null,
        invoiceNumber: b.invoiceNumber ?? null,
        partsCost,
        laborCost,
        laborHours: b.laborHours ?? 0,
        totalCost: b.totalCost ?? partsCost + laborCost,
        warrantyClaim: Boolean(b.warrantyClaim),
        warrantyClaimNumber: b.warrantyClaimNumber ?? null,
        downtimeHours: b.downtimeHours ?? 0,
        pmInterval: b.pmInterval ?? null,
        nextDueMiles: b.nextDueMiles ?? null,
        nextDueDate: b.nextDueDate ?? null,
        performedOn: b.performedOn ?? null,
        performedBy: b.performedBy ?? null,
        notes: b.notes ?? null,
      })
      .returning();
    return c.json({ record: hydrate(row) }, 201);
  })

  .patch("/:id", async (c) => {
    const b = await c.req.json();
    const patch: Partial<typeof schema.maintenanceRecords.$inferInsert> = { updatedAt: new Date() };
    for (const k of [
      "status", "priority", "category", "title", "description", "quantumDiagnosis", "photoNotes",
      "odometer", "engineHours", "vendor", "vendorPhone", "invoiceNumber", "partsCost", "laborCost",
      "laborHours", "totalCost", "warrantyClaimNumber", "downtimeHours", "pmInterval", "nextDueMiles",
      "nextDueDate", "performedOn", "performedBy", "notes",
    ] as const) {
      if (b[k] !== undefined) (patch as Record<string, unknown>)[k] = b[k];
    }
    if (b.warrantyClaim !== undefined) patch.warrantyClaim = Boolean(b.warrantyClaim);
    if (b.dtcCodes !== undefined) patch.dtcCodes = j(b.dtcCodes);
    if (b.eldFlags !== undefined) patch.eldFlags = j(b.eldFlags);
    if (b.photoUrls !== undefined) patch.photoUrls = j(b.photoUrls);
    if (b.partsCost !== undefined || b.laborCost !== undefined) {
      const [cur] = await db
        .select()
        .from(schema.maintenanceRecords)
        .where(eq(schema.maintenanceRecords.id, c.req.param("id")));
      if (cur) {
        patch.totalCost =
          b.totalCost ?? Number(b.partsCost ?? cur.partsCost ?? 0) + Number(b.laborCost ?? cur.laborCost ?? 0);
      }
    }
    const [row] = await db
      .update(schema.maintenanceRecords)
      .set(patch)
      .where(eq(schema.maintenanceRecords.id, c.req.param("id")))
      .returning();
    if (!row) return c.json({ error: "not found" }, 404);
    return c.json({ record: hydrate(row) }, 200);
  })

  .delete("/:id", async (c) => {
    await db.delete(schema.maintenanceRecords).where(eq(schema.maintenanceRecords.id, c.req.param("id")));
    return c.json({ ok: true }, 200);
  });
