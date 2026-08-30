import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { and, desc, gte } from "drizzle-orm";
import { ensureSeed } from "../lib/seed";
import { LIMITS as DUTY_LIMITS, clockSnapshotAt } from "../lib/dutyclock";
import { scoreFatigue } from "./eld";

/**
 * Fleet intelligence — real aggregates for the "intelligence" analytics pages.
 *
 * These pages (HOSAnalyticsDashboard, FleetIntelligencePage,
 * RoadContextPage) were built as demo shells. Between them they called
 * Math.random() 27 times to produce fatigue scores, accident-risk percentages,
 * 128-dimension "neural vectors", cargo values, and market demand — and
 * RoadContextPage read four PocketBase collections that never existed.
 *
 * Everything here is computed from rows that actually exist: drivers, trucks,
 * loads, hos_logs, eld_telemetry, dispatch_compliance_log, maintenance_records
 * and accident_reports. Where the platform genuinely cannot know something, the
 * response says so instead of generating a number.
 */

// 49 CFR 395 property-carrying limits now come from lib/dutyclock — the single
// source of truth. This file used to keep its own copy AND its own
// `l.endedAt ? +l.endedAt : now`, which ran abandoned open rows to "now" and
// produced impossible clocks. That bug is gone: stale open intervals are
// excluded and counted by clockSnapshotAt.
const LIMITS = {
  driving: DUTY_LIMITS.driving,
  onDutyWindow: DUTY_LIMITS.onDutyWindow,
  cycle: DUTY_LIMITS.cycle,
  breakAfter: DUTY_LIMITS.breakAfterDriving,
};

function computeClocks(logs: (typeof schema.hosLogs.$inferSelect)[]) {
  const s = clockSnapshotAt(logs, Date.now());
  return {
    drivingUsed: s.drivingUsedMin,
    drivingRemaining: s.drivingRemainingMin,
    onDutyWindowUsed: s.windowUsedMin,
    onDutyWindowRemaining: s.windowRemainingMin,
    cycleUsed: s.cycleUsedMin,
    cycleRemaining: s.cycleRemainingMin,
    intervalsExcludedStaleOpen: s.intervalsExcludedStaleOpen,
    staleOpenHours: s.staleOpenHours,
    excludedNote: s.measurementNote,
    limits: LIMITS,
  };
}

/**
 * HOS exposure, 0-100. This is NOT an accident-probability model — the platform
 * has nowhere near the crash data required to build one. It is a bounded
 * exposure index built from how deep each driver is into their clocks, which is
 * a real and defensible signal. Labelled as such everywhere it is returned.
 */
function hosExposure(clocks: ReturnType<typeof computeClocks>) {
  const drivePct = Math.min(1, clocks.drivingUsed / LIMITS.driving);
  const windowPct = Math.min(1, clocks.onDutyWindowUsed / LIMITS.onDutyWindow);
  const overBreak = clocks.drivingUsed >= LIMITS.breakAfter ? 0.15 : 0;
  return Math.round(Math.min(100, (drivePct * 0.55 + windowPct * 0.3 + overBreak) * 100));
}

function band(score: number) {
  if (score < 30) return { level: "low", label: "Fresh", color: "#22c55e" };
  if (score < 50) return { level: "moderate", label: "Normal", color: "#C9A84C" };
  if (score < 70) return { level: "elevated", label: "Elevated", color: "#FFD700" };
  return { level: "high", label: "Critical", color: "#E0483B" };
}

const NO_MODEL_NOTE =
  "This platform does not have a crash-prediction model. Accident probability is not estimated. What is shown is HOS exposure and recorded telemetry — both measured, not predicted.";

export const fleetIntel = new Hono()
  .use("*", async (_c, next) => { await ensureSeed(); await next(); })

  /** Per-driver HOS exposure + real ELD fatigue, for the HOS Analytics dashboard. */
  .get("/hos", async (c) => {
    const since = new Date(Date.now() - 8 * 3600_000);
    const logWindow = new Date(Date.now() - 8 * 86400_000);

    // Queried once for the whole fleet, then grouped in memory — one round trip
    // each instead of one per driver.
    const [drivers, allLogs, allTlm] = await Promise.all([
      db.select().from(schema.drivers),
      db.select().from(schema.hosLogs)
        .where(gte(schema.hosLogs.startedAt, logWindow))
        .orderBy(desc(schema.hosLogs.startedAt)),
      db.select().from(schema.eldTelemetry)
        .where(gte(schema.eldTelemetry.recordedAt, since))
        .orderBy(desc(schema.eldTelemetry.recordedAt))
        .limit(5000),
    ]);

    const rows = await Promise.all(
      drivers.map(async (d) => {
        const clocks = computeClocks(allLogs.filter((l) => l.driverId === d.id));
        const exposure = hosExposure(clocks);
        const fatigue = scoreFatigue(allTlm.filter((t) => t.driverId === d.id));

        return {
          driverId: d.id,
          name: d.name,
          truckNumber: d.truckNumber,
          status: d.status,
          clocks,
          hosExposure: exposure,
          hosBand: band(exposure),
          eldFatigue: fatigue,
          hasEldData: !fatigue.insufficientData,
        };
      }),
    );

    const scored = rows.map((r) => r.hosExposure);
    const withEld = rows.filter((r) => r.hasEldData);

    return c.json({
      drivers: rows,
      fleet: {
        driverCount: rows.length,
        avgHosExposure: scored.length ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : 0,
        atOrOverLimit: rows.filter((r) => r.clocks.drivingRemaining <= 0 || r.clocks.onDutyWindowRemaining <= 0).length,
        within30Min: rows.filter((r) => r.clocks.drivingRemaining > 0 && r.clocks.drivingRemaining <= 30).length,
        driversWithEldTelemetry: withEld.length,
        driversWithoutEldTelemetry: rows.length - withEld.length,
      },
      accidentRisk: null,
      accidentRiskNote: NO_MODEL_NOTE,
      methodology:
        "HOS exposure = 55% share of the 11-hour driving clock used, 30% share of the 14-hour window used, +15 once past the 8-hour break trigger. Bounded 0-100. ELD fatigue comes from recorded telemetry and returns insufficientData below 10 samples.",
    });
  })

  /** Fleet-wide operating picture for the Fleet Intelligence page. */
  .get("/fleet", async (c) => {
    const [drivers, trucks, loads] = await Promise.all([
      db.select().from(schema.drivers),
      db.select().from(schema.trucks),
      db.select().from(schema.loads),
    ]);

    const booked = loads.filter((l) => l.status === "booked");
    const available = loads.filter((l) => l.status === "available");
    const rated = loads.filter((l) => (l.miles ?? 0) > 0 && (l.rate ?? 0) > 0);
    const rpms = rated.map((l) => (l.rate as number) / (l.miles as number));
    const avgRpm = rpms.length ? rpms.reduce((a, b) => a + b, 0) / rpms.length : null;

    const openMaint = await db.select().from(schema.maintenanceRecords);
    const accidents = await db.select().from(schema.accidentReports);
    const compliance = await db.select().from(schema.dispatchComplianceLog)
      .orderBy(desc(schema.dispatchComplianceLog.checkedAt)).limit(200);

    return c.json({
      counts: {
        drivers: drivers.length,
        trucks: trucks.length,
        trucksActive: trucks.filter((t) => t.status === "active").length,
        driversDriving: drivers.filter((d) => d.status === "driving").length,
        loadsTotal: loads.length,
        loadsBooked: booked.length,
        loadsAvailable: available.length,
        openMaintenance: openMaint.filter((m) => m.status === "open" || m.status === "in_progress").length,
        criticalMaintenance: openMaint.filter((m) => m.priority === "critical" && m.status !== "complete").length,
        accidentReports: accidents.length,
      },
      economics: {
        avgRatePerMile: avgRpm === null ? null : Number(avgRpm.toFixed(2)),
        ratedLoadSample: rated.length,
        bookedRevenue: Number(booked.reduce((a, l) => a + (l.rate ?? 0), 0).toFixed(2)),
        bookedMiles: Number(booked.reduce((a, l) => a + (l.miles ?? 0), 0).toFixed(0)),
        note: "Rate per mile is the plain average of loads that carry both a rate and a mileage. It is not a market index — this platform does not subscribe to a rate benchmark.",
      },
      compliance: {
        checksLogged: compliance.length,
        criticalChecks: compliance.filter((r) => r.status === "critical").length,
        warningChecks: compliance.filter((r) => r.status === "warning").length,
        lastCheckedAt: compliance[0]?.checkedAt ?? null,
      },
      notAvailable: {
        marketDemand: "No load-board or market feed is connected. Demand cannot be measured.",
        cargoValue: "Loads carry a rate, not a declared cargo value. Cargo value is unknown.",
        fuelPrice: "Live diesel pricing comes from /api/fuel (EIA). It is not duplicated here.",
        accidentProbability: NO_MODEL_NOTE,
      },
    });
  })

  /** Road context for a driver: real position, real nearby incidents, honest gaps. */
  .get("/road-context/:driverId", async (c) => {
    const driverId = c.req.param("driverId");
    const drivers = await db.select().from(schema.drivers);
    const driver = drivers.find((d) => d.id === driverId) ?? null;
    if (!driver) return c.json({ error: "Unknown driver" }, 404);

    const position = driver.lat !== null && driver.lng !== null
      ? { lat: driver.lat, lng: driver.lng, speed: driver.speed, heading: driver.heading, lastSeen: driver.lastSeen }
      : null;

    const loads = await db.select().from(schema.loads);
    const currentLoad = loads.find((l) => l.bookedByDriverId === driverId) ?? null;

    const accidents = await db.select().from(schema.accidentReports)
      .orderBy(desc(schema.accidentReports.occurredAt)).limit(50);

    // Straight-line distance only. No routing engine is wired in.
    const near = position
      ? accidents
          .filter((a) => a.lat !== null && a.lng !== null)
          .map((a) => {
            const dLat = (a.lat as number) - position.lat!;
            const dLng = ((a.lng as number) - position.lng!) * Math.cos((position.lat! * Math.PI) / 180);
            return { ...a, milesAway: Number((Math.sqrt(dLat * dLat + dLng * dLng) * 69).toFixed(1)) };
          })
          .filter((a) => a.milesAway <= 150)
          .sort((a, b) => a.milesAway - b.milesAway)
      : [];

    const brokers = await db.select().from(schema.brokerVerifications)
      .orderBy(desc(schema.brokerVerifications.checkedAt)).limit(50);

    return c.json({
      driverId,
      position,
      positionNote: position
        ? "Last reported position from the drivers table. It is only as fresh as the last location post."
        : "No position on file for this driver. Nothing is being tracked.",
      currentLoad,
      nearbyIncidents: near,
      brokerFlags: brokers.filter((b) => b.riskScore !== null && (b.riskScore as number) >= 40),
      unavailable: {
        roadDangerReports: "No driver-sourced danger reports table exists yet. The Community Bulletin Board would be the source.",
        stopFeedback: "No route_stop_feedback table exists. Truck-stop ratings are not collected yet.",
        weatherAlerts: "No weather provider is connected on the server.",
        nearbyDriverActivity: "No user_activity_index table exists. Nearby-driver activity is not tracked.",
      },
      note: "Distances are straight-line, not driving miles. No routing provider is wired in.",
    });
  });
