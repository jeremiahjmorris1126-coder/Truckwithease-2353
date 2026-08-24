import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";
import { ensureSeed } from "../lib/seed";

const p = <T,>(v: string | null, fallback: T): T => {
  try {
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

/** Brand Studio unlocks once the fleet has this many assets. */
export const BRAND_STUDIO_UNLOCK_AT = 10;

/** The 16 toggleable MaintEase modules. */
export const MODULES = [
  "photo_scan", "dtc_reader", "predictive_engine", "service_log", "asset_health",
  "pm_planner", "work_orders", "warranty_tracking", "vendor_directory", "parts_inventory",
  "downtime_analytics", "cost_per_mile", "dvir_memory", "insurance_alerts", "eld_fault_scan",
  "brand_studio",
];

const SINGLETON = "fleet-branding-default";

/** Brand Studio — white-label settings and module toggles. */
export const branding = new Hono()
  .use("*", async (_c, next) => {
    await ensureSeed();
    await next();
  })

  .get("/modules", (c) => c.json({ modules: MODULES, unlockAt: BRAND_STUDIO_UNLOCK_AT }, 200))

  .get("/", async (c) => {
    const [row] = await db.select().from(schema.fleetBranding).where(eq(schema.fleetBranding.id, SINGLETON));
    const assetCount = (await db.select().from(schema.trucks)).length;
    const unlocked = assetCount >= BRAND_STUDIO_UNLOCK_AT;

    if (!row) {
      // Defaults are the TruckWithEase brand: gold on black.
      return c.json(
        {
          branding: {
            id: SINGLETON,
            fleetName: "My Dads Trucking LLC",
            logoUrl: "/static/twe-logo-horizontal-trim.png",
            primaryColor: "#C9A84C",
            accentColor: "#FFD700",
            backgroundColor: "#0a0a0a",
            enabledModules: MODULES,
            whiteLabel: false,
            assetCount,
            unlocked,
          },
        },
        200,
      );
    }
    return c.json(
      { branding: { ...row, enabledModules: p<string[]>(row.enabledModules, MODULES), assetCount, unlocked } },
      200,
    );
  })

  .put("/", async (c) => {
    const b = await c.req.json();
    const assetCount = (await db.select().from(schema.trucks)).length;
    const unlocked = assetCount >= BRAND_STUDIO_UNLOCK_AT;

    // White-label is gated on the asset count, not on what the client sends.
    const values = {
      id: SINGLETON,
      fleetName: b.fleetName ?? "My Dads Trucking LLC",
      logoUrl: b.logoUrl ?? "/static/twe-logo-horizontal-trim.png",
      primaryColor: b.primaryColor ?? "#C9A84C",
      accentColor: b.accentColor ?? "#FFD700",
      backgroundColor: b.backgroundColor ?? "#0a0a0a",
      enabledModules: JSON.stringify(
        Array.isArray(b.enabledModules) ? b.enabledModules.filter((m: string) => MODULES.includes(m)) : MODULES,
      ),
      whiteLabel: Boolean(b.whiteLabel) && unlocked,
      assetCount,
      unlocked,
      updatedAt: new Date(),
    };

    const [existing] = await db.select().from(schema.fleetBranding).where(eq(schema.fleetBranding.id, SINGLETON));
    const [row] = existing
      ? await db.update(schema.fleetBranding).set(values).where(eq(schema.fleetBranding.id, SINGLETON)).returning()
      : await db.insert(schema.fleetBranding).values(values).returning();

    return c.json({ branding: { ...row, enabledModules: p<string[]>(row.enabledModules, MODULES) } }, 200);
  });
