import { Hono } from "hono";
import { db } from "../database";
import { fleetAssets, maintenanceRecords, trucks } from "../database/schema";

/**
 * Quantum Operations is conventional parallel fleet analysis, not quantum hardware.
 * Recommendations use current asset, truck, and maintenance rows only.
 */
export const quantumOperations = new Hono().get("/", async (c) => {
  const [assets, fleet, maintenance] = await Promise.all([
    db.select().from(fleetAssets),
    db.select().from(trucks),
    db.select().from(maintenanceRecords),
  ]);

  const openMaintenance = maintenance.filter((record) => record.status === "open" || record.status === "in_progress");
  const assetSuggestions = assets.map((asset) => {
    if (!asset.documentKey) return { assetId: asset.id, title: `Complete ${asset.name}`, action: "Add its registration, inspection, or warranty document so it is ready for the next assignment.", priority: "next" };
    if (asset.status === "available" && !asset.assignedTo) return { assetId: asset.id, title: `Use ${asset.name}`, action: "This asset is ready to review for the next compatible assignment.", priority: "opportunity" };
    return { assetId: asset.id, title: `Keep ${asset.name} current`, action: "Continue recording service and operating details to strengthen future planning.", priority: "routine" };
  });
  const maintenanceSuggestions = openMaintenance.map((record) => ({
    assetId: record.truckUnit,
    title: `Plan service for ${record.truckUnit}`,
    action: `Schedule the ${record.title} work order early to support reliable fleet availability.`,
    priority: record.priority === "critical" || record.priority === "high" ? "next" : "routine",
  }));

  return c.json({
    mode: "conventional_parallel_analysis",
    note: "This workspace analyzes the fleet's stored operational data in parallel. It does not use or claim quantum hardware.",
    snapshot: { assets: assets.length, trucks: fleet.length, openMaintenance: openMaintenance.length },
    scenarios: [
      { id: "availability", title: "Asset availability", basis: "asset lifecycle status and assignment", suggestions: assetSuggestions },
      { id: "maintenance", title: "Service readiness", basis: "open and in-progress maintenance records", suggestions: maintenanceSuggestions },
    ],
    generatedAt: new Date().toISOString(),
  });
});
