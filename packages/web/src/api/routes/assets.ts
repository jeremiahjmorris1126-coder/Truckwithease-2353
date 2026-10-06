import { Hono } from "hono";
import { desc, eq } from "drizzle-orm";
import { db } from "../database";
import { fleetAssets } from "../database/schema";

const id = () => `ast_${crypto.randomUUID()}`;
const states = new Set(["active", "available", "maintenance", "retired"]);

function suggestion(asset: typeof fleetAssets.$inferSelect) {
  if (!asset.documentKey) return "Add registration, inspection, or warranty documents to keep this asset ready for the next assignment.";
  if (!asset.assignedTo && asset.status === "available") return "This asset is available to assign when the next compatible job is scheduled.";
  if (asset.nextServiceAt && asset.nextServiceAt.getTime() - Date.now() < 30 * 86400_000) return "Schedule the upcoming service early to keep this asset available.";
  return "This asset record is complete. Keep mileage, hours, and service dates current to improve planning.";
}

export const assets = new Hono()
  .get("/", async (c) => {
    const rows = await db.select().from(fleetAssets).orderBy(desc(fleetAssets.updatedAt));
    return c.json({ assets: rows.map((asset) => ({ ...asset, suggestion: suggestion(asset) })) });
  })
  .get("/:id", async (c) => {
    const [asset] = await db.select().from(fleetAssets).where(eq(fleetAssets.id, c.req.param("id"))).limit(1);
    if (!asset) return c.json({ error: "Asset not found." }, 404);
    return c.json({ asset: { ...asset, suggestion: suggestion(asset) } });
  })
  .post("/", async (c) => {
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const assetType = typeof body.assetType === "string" ? body.assetType.trim() : "";
    if (!name || !assetType) return c.json({ error: "name and assetType are required." }, 400);
    const status = typeof body.status === "string" && states.has(body.status) ? body.status : "available";
    const now = new Date();
    const row = { id: id(), name, assetType, status, unit: typeof body.unit === "string" ? body.unit.trim() || null : null, vin: typeof body.vin === "string" ? body.vin.trim() || null : null, assignedTo: typeof body.assignedTo === "string" ? body.assignedTo.trim() || null : null, odometer: Number.isFinite(Number(body.odometer)) ? Number(body.odometer) : null, engineHours: Number.isFinite(Number(body.engineHours)) ? Number(body.engineHours) : null, documentKey: typeof body.documentKey === "string" ? body.documentKey : null, notes: typeof body.notes === "string" ? body.notes.trim() || null : null, nextServiceAt: body.nextServiceAt ? new Date(String(body.nextServiceAt)) : null, createdAt: now, updatedAt: now };
    await db.insert(fleetAssets).values(row);
    return c.json({ asset: { ...row, suggestion: suggestion(row) } }, 201);
  })
  .patch("/:id", async (c) => {
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const status = typeof body.status === "string" && states.has(body.status) ? body.status : undefined;
    const patch = { status, assignedTo: typeof body.assignedTo === "string" ? body.assignedTo.trim() || null : undefined, documentKey: typeof body.documentKey === "string" ? body.documentKey : undefined, notes: typeof body.notes === "string" ? body.notes.trim() || null : undefined, nextServiceAt: body.nextServiceAt ? new Date(String(body.nextServiceAt)) : undefined, updatedAt: new Date() };
    const [asset] = await db.update(fleetAssets).set(patch).where(eq(fleetAssets.id, c.req.param("id"))).returning();
    if (!asset) return c.json({ error: "Asset not found." }, 404);
    return c.json({ asset: { ...asset, suggestion: suggestion(asset) } });
  });
