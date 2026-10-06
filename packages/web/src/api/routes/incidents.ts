import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, desc } from "drizzle-orm";
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

/** The 8-step fleet accident protocol fired by Dispatch on any incident. */
export const ACCIDENT_PROTOCOL = [
  { step: 1, label: "Secure the scene", detail: "Hazards on, triangles out, driver out of traffic if safe." },
  { step: 2, label: "Check for injuries", detail: "Call 911 immediately if anyone is hurt. One-tap 911 from Dispatch." },
  { step: 3, label: "Call dispatch", detail: "Driver reports location, severity, and units involved." },
  { step: 4, label: "Do not admit fault", detail: "Exchange info only. No statements about cause to any party." },
  { step: 5, label: "Photograph everything", detail: "All four sides, plates, road, skid marks, other units, cargo." },
  { step: 6, label: "Collect information", detail: "Other driver, insurance, witnesses, officer name and report number." },
  { step: 7, label: "Notify insurance", detail: "Carrier notified with photos and report attached." },
  { step: 8, label: "Post-accident testing", detail: "49 CFR 382.303 — drug/alcohol test if criteria are met. Document the decision either way." },
];

type Row = typeof schema.accidentReports.$inferSelect;
const hydrate = (r: Row) => ({
  ...r,
  customSteps: p<string[]>(r.customSteps, []),
  stepsCompleted: p<string[]>(r.stepsCompleted, []),
  complianceGaps: p<string[]>(r.complianceGaps, []),
  documentUrls: p<string[]>(r.documentUrls, []),
  photoUrls: p<string[]>(r.photoUrls, []),
  otherParties: p<unknown[]>(r.otherParties, []),
});

/** Incident command — the permanent fleet incident archive. */
export const incidents = new Hono()
  .use("*", async (_c, next) => {
    await ensureSeed();
    await next();
  })

  .get("/protocol", (c) => c.json({ protocol: ACCIDENT_PROTOCOL }, 200))

  .get("/", async (c) => {
    const rows = await db.select().from(schema.accidentReports).orderBy(desc(schema.accidentReports.createdAt));
    return c.json({ reports: rows.map(hydrate) }, 200);
  })

  .get("/driver/:driverId", async (c) => {
    const rows = await db
      .select()
      .from(schema.accidentReports)
      .where(eq(schema.accidentReports.driverId, c.req.param("driverId")))
      .orderBy(desc(schema.accidentReports.createdAt));
    return c.json({ reports: rows.map(hydrate) }, 200);
  })

  .get("/:id", async (c) => {
    const [row] = await db
      .select()
      .from(schema.accidentReports)
      .where(eq(schema.accidentReports.id, c.req.param("id")));
    if (!row) return c.json({ error: "not found" }, 404);
    return c.json({ report: hydrate(row) }, 200);
  })

  .post("/", async (c) => {
    const b = await c.req.json();

    // Compliance gaps THE GOAT flags on intake — real FMCSA triggers only.
    const gaps: string[] = [];
    if (!b.policeReportNumber) gaps.push("No police report number on file.");
    if (b.injuries || b.towRequired) {
      gaps.push("DOT-recordable: injury or tow-away. Post-accident drug/alcohol test required (49 CFR 382.303).");
    }
    if (!b.photoUrls?.length) gaps.push("No scene photos attached.");
    if (!b.insuranceNotified) gaps.push("Insurance carrier not yet notified.");

    const [row] = await db
      .insert(schema.accidentReports)
      .values({
        id: `acc-${rid()}`,
        driverId: b.driverId ?? null,
        driverName: b.driverName ?? null,
        truckUnit: b.truckUnit ?? null,
        occurredAt: b.occurredAt ? new Date(b.occurredAt) : new Date(),
        location: b.location ?? null,
        lat: b.lat ?? null,
        lng: b.lng ?? null,
        severity: b.severity ?? "minor",
        injuries: Boolean(b.injuries),
        towRequired: Boolean(b.towRequired),
        policeReportNumber: b.policeReportNumber ?? null,
        otherParties: b.otherParties ? JSON.stringify(b.otherParties) : "[]",
        description: b.description ?? null,
        fleetProcedureId: b.fleetProcedureId ?? null,
        customSteps: j(b.customSteps ?? ACCIDENT_PROTOCOL.map((s) => s.label)),
        stepsCompleted: j(b.stepsCompleted ?? []),
        goatRecommendations: b.goatRecommendations ?? null,
        complianceGaps: j(gaps),
        documentUrls: j(b.documentUrls ?? []),
        photoUrls: j(b.photoUrls ?? []),
        insuranceNotified: Boolean(b.insuranceNotified),
        status: "open",
      })
      .returning();
    return c.json({ report: hydrate(row) }, 201);
  })

  .post("/:id/step", async (c) => {
    const { step } = await c.req.json();
    const [cur] = await db
      .select()
      .from(schema.accidentReports)
      .where(eq(schema.accidentReports.id, c.req.param("id")));
    if (!cur) return c.json({ error: "not found" }, 404);
    const done = new Set(p<string[]>(cur.stepsCompleted, []));
    done.add(String(step));
    const [row] = await db
      .update(schema.accidentReports)
      .set({ stepsCompleted: j([...done]), updatedAt: new Date() })
      .where(eq(schema.accidentReports.id, c.req.param("id")))
      .returning();
    return c.json({ report: hydrate(row) }, 200);
  })

  .patch("/:id", async (c) => {
    const b = await c.req.json();
    const patch: Partial<typeof schema.accidentReports.$inferInsert> = { updatedAt: new Date() };
    for (const k of [
      "status", "severity", "description", "location", "policeReportNumber", "goatRecommendations", "driverName",
    ] as const) {
      if (b[k] !== undefined) (patch as Record<string, unknown>)[k] = b[k];
    }
    if (b.injuries !== undefined) patch.injuries = Boolean(b.injuries);
    if (b.towRequired !== undefined) patch.towRequired = Boolean(b.towRequired);
    if (b.insuranceNotified !== undefined) patch.insuranceNotified = Boolean(b.insuranceNotified);
    if (b.documentUrls !== undefined) patch.documentUrls = j(b.documentUrls);
    if (b.photoUrls !== undefined) patch.photoUrls = j(b.photoUrls);
    if (b.complianceGaps !== undefined) patch.complianceGaps = j(b.complianceGaps);
    const [row] = await db
      .update(schema.accidentReports)
      .set(patch)
      .where(eq(schema.accidentReports.id, c.req.param("id")))
      .returning();
    if (!row) return c.json({ error: "not found" }, 404);
    return c.json({ report: hydrate(row) }, 200);
  })

  .delete("/:id", async (c) => {
    await db.delete(schema.accidentReports).where(eq(schema.accidentReports.id, c.req.param("id")));
    return c.json({ ok: true }, 200);
  });
