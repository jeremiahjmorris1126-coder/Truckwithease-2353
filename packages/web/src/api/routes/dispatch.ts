import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { desc, eq } from "drizzle-orm";

/**
 * Dispatch compliance intelligence — server-side.
 *
 * The original dispatchComplianceIntel.js ran in the browser, covered 8 states,
 * and wrote every check to a PocketBase collection (`dispatch_compliance_log`)
 * that never existed — so nothing was ever persisted. This version runs the same
 * rule set on the server against a wider state table and actually stores the result.
 *
 * Honest notes on the numbers, carried through from the original:
 *  - Fuel cost math assumes 6 MPG. That is the original assumption; it is now
 *    labeled in the response instead of hidden in a formula.
 *  - CA hosDaily 10 is the *intrastate* limit. Federal interstate is 11. We report
 *    both rather than silently picking one.
 *  - Average speed 65 mph for drive-time estimates.
 */

const MPG_ASSUMPTION = 6;
const AVG_SPEED_MPH = 65;

type StateRule = {
  state: string;
  hosDaily: number;
  hosWeekly: number;
  /** Set when the state's own limit differs from the federal interstate limit. */
  hosNote?: string;
  fuelTax: number;
  salesTax: number;
  tolls: string[];
  hazmat: true | "restricted";
  mc: boolean;
  oversize: true | "restricted";
};

/** Federal interstate baseline — what applies to almost every load on this platform. */
export const FEDERAL_HOS = { daily: 11, weekly: 70, onDuty: 14, break: 30 };

export const STATE_COMPLIANCE: Record<string, StateRule> = {
  // ── his original 8 ────────────────────────────────────────────────────────
  TX: { state: "Texas", hosDaily: 11, hosWeekly: 70, fuelTax: 0.20, salesTax: 6.25, tolls: ["TxTag", "PlazaPass"], hazmat: true, mc: true, oversize: true },
  CA: { state: "California", hosDaily: 11, hosWeekly: 70, hosNote: "CA intrastate limit is 10 h driving / 60 h per 7 days. Interstate loads follow the federal 11/70.", fuelTax: 0.68, salesTax: 7.25, tolls: ["FasTrak"], hazmat: "restricted", mc: true, oversize: "restricted" },
  NY: { state: "New York", hosDaily: 11, hosWeekly: 70, fuelTax: 0.25, salesTax: 4.0, tolls: ["E-ZPass"], hazmat: true, mc: true, oversize: "restricted" },
  FL: { state: "Florida", hosDaily: 11, hosWeekly: 70, fuelTax: 0.27, salesTax: 6.0, tolls: ["SunPass"], hazmat: true, mc: true, oversize: true },
  IL: { state: "Illinois", hosDaily: 11, hosWeekly: 70, fuelTax: 0.38, salesTax: 6.25, tolls: ["I-PASS"], hazmat: true, mc: true, oversize: "restricted" },
  WA: { state: "Washington", hosDaily: 11, hosWeekly: 70, fuelTax: 0.49, salesTax: 6.5, tolls: ["Good To Go"], hazmat: true, mc: true, oversize: "restricted" },
  OR: { state: "Oregon", hosDaily: 11, hosWeekly: 70, fuelTax: 0.36, salesTax: 0, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  CO: { state: "Colorado", hosDaily: 11, hosWeekly: 70, fuelTax: 0.22, salesTax: 2.9, tolls: ["ExpressToll"], hazmat: true, mc: true, oversize: "restricted" },
  // ── expanded coverage ─────────────────────────────────────────────────────
  MO: { state: "Missouri", hosDaily: 11, hosWeekly: 70, fuelTax: 0.27, salesTax: 4.225, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  KS: { state: "Kansas", hosDaily: 11, hosWeekly: 70, fuelTax: 0.26, salesTax: 6.5, tolls: ["K-TAG"], hazmat: true, mc: true, oversize: "restricted" },
  OK: { state: "Oklahoma", hosDaily: 11, hosWeekly: 70, fuelTax: 0.19, salesTax: 4.5, tolls: ["PIKEPASS"], hazmat: true, mc: true, oversize: true },
  AR: { state: "Arkansas", hosDaily: 11, hosWeekly: 70, fuelTax: 0.285, salesTax: 6.5, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  TN: { state: "Tennessee", hosDaily: 11, hosWeekly: 70, fuelTax: 0.27, salesTax: 7.0, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  GA: { state: "Georgia", hosDaily: 11, hosWeekly: 70, fuelTax: 0.343, salesTax: 4.0, tolls: ["Peach Pass"], hazmat: true, mc: true, oversize: "restricted" },
  NC: { state: "North Carolina", hosDaily: 11, hosWeekly: 70, fuelTax: 0.405, salesTax: 4.75, tolls: ["NC Quick Pass"], hazmat: true, mc: true, oversize: "restricted" },
  OH: { state: "Ohio", hosDaily: 11, hosWeekly: 70, fuelTax: 0.47, salesTax: 5.75, tolls: ["E-ZPass"], hazmat: true, mc: true, oversize: "restricted" },
  IN: { state: "Indiana", hosDaily: 11, hosWeekly: 70, fuelTax: 0.57, salesTax: 7.0, tolls: ["E-ZPass"], hazmat: true, mc: true, oversize: "restricted" },
  MI: { state: "Michigan", hosDaily: 11, hosWeekly: 70, fuelTax: 0.31, salesTax: 6.0, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  PA: { state: "Pennsylvania", hosDaily: 11, hosWeekly: 70, fuelTax: 0.741, salesTax: 6.0, tolls: ["E-ZPass"], hazmat: true, mc: true, oversize: "restricted" },
  NJ: { state: "New Jersey", hosDaily: 11, hosWeekly: 70, fuelTax: 0.494, salesTax: 6.625, tolls: ["E-ZPass"], hazmat: "restricted", mc: true, oversize: "restricted" },
  AZ: { state: "Arizona", hosDaily: 11, hosWeekly: 70, fuelTax: 0.26, salesTax: 5.6, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  NV: { state: "Nevada", hosDaily: 11, hosWeekly: 70, fuelTax: 0.27, salesTax: 6.85, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  UT: { state: "Utah", hosDaily: 11, hosWeekly: 70, fuelTax: 0.365, salesTax: 6.1, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  NM: { state: "New Mexico", hosDaily: 11, hosWeekly: 70, fuelTax: 0.21, salesTax: 5.125, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  IA: { state: "Iowa", hosDaily: 11, hosWeekly: 70, fuelTax: 0.325, salesTax: 6.0, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  NE: { state: "Nebraska", hosDaily: 11, hosWeekly: 70, fuelTax: 0.248, salesTax: 5.5, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  MN: { state: "Minnesota", hosDaily: 11, hosWeekly: 70, fuelTax: 0.286, salesTax: 6.875, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  WI: { state: "Wisconsin", hosDaily: 11, hosWeekly: 70, fuelTax: 0.329, salesTax: 5.0, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  VA: { state: "Virginia", hosDaily: 11, hosWeekly: 70, fuelTax: 0.271, salesTax: 5.3, tolls: ["E-ZPass"], hazmat: true, mc: true, oversize: "restricted" },
  MD: { state: "Maryland", hosDaily: 11, hosWeekly: 70, fuelTax: 0.3675, salesTax: 6.0, tolls: ["E-ZPass"], hazmat: "restricted", mc: true, oversize: "restricted" },
  SC: { state: "South Carolina", hosDaily: 11, hosWeekly: 70, fuelTax: 0.28, salesTax: 6.0, tolls: ["Palmetto Pass"], hazmat: true, mc: true, oversize: "restricted" },
  AL: { state: "Alabama", hosDaily: 11, hosWeekly: 70, fuelTax: 0.30, salesTax: 4.0, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  MS: { state: "Mississippi", hosDaily: 11, hosWeekly: 70, fuelTax: 0.184, salesTax: 7.0, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  LA: { state: "Louisiana", hosDaily: 11, hosWeekly: 70, fuelTax: 0.20, salesTax: 4.45, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  KY: { state: "Kentucky", hosDaily: 11, hosWeekly: 70, fuelTax: 0.267, salesTax: 6.0, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  ID: { state: "Idaho", hosDaily: 11, hosWeekly: 70, fuelTax: 0.32, salesTax: 6.0, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  MT: { state: "Montana", hosDaily: 11, hosWeekly: 70, fuelTax: 0.2975, salesTax: 0, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  WY: { state: "Wyoming", hosDaily: 11, hosWeekly: 70, fuelTax: 0.24, salesTax: 4.0, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  ND: { state: "North Dakota", hosDaily: 11, hosWeekly: 70, fuelTax: 0.23, salesTax: 5.0, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  SD: { state: "South Dakota", hosDaily: 11, hosWeekly: 70, fuelTax: 0.28, salesTax: 4.2, tolls: [], hazmat: true, mc: true, oversize: "restricted" },
  MA: { state: "Massachusetts", hosDaily: 11, hosWeekly: 70, fuelTax: 0.24, salesTax: 6.25, tolls: ["E-ZPass"], hazmat: "restricted", mc: true, oversize: "restricted" },
  CT: { state: "Connecticut", hosDaily: 11, hosWeekly: 70, fuelTax: 0.492, salesTax: 6.35, tolls: [], hazmat: "restricted", mc: true, oversize: "restricted" },
  WV: { state: "West Virginia", hosDaily: 11, hosWeekly: 70, fuelTax: 0.372, salesTax: 6.0, tolls: ["E-ZPass"], hazmat: true, mc: true, oversize: "restricted" },
};

export const ALERT_LEVELS = {
  info: { color: "#C9A84C", action: "info" },
  warning: { color: "#FFD700", action: "warn" },
  critical: { color: "#E0483B", action: "stop" },
} as const;

type Alert = { level: "info" | "warning" | "critical"; title: string; message: string; color: string };

export type ComplianceInput = {
  id?: string;
  loadId?: string;
  driverId?: string;
  origin_state?: string;
  destination_state?: string;
  originState?: string;
  destinationState?: string;
  distance?: number;
  hours_avail?: number;
  hoursAvail?: number;
  hazmat?: boolean;
  oversize?: boolean;
};

export function runComplianceCheck(input: ComplianceInput) {
  const originCode = (input.origin_state ?? input.originState ?? "").toUpperCase();
  const destCode = (input.destination_state ?? input.destinationState ?? "").toUpperCase();
  const alerts: Alert[] = [];

  if (!originCode || !destCode) {
    return { error: "Missing origin or destination state", alerts, complianceStatus: "unknown" as const };
  }

  const origin = STATE_COMPLIANCE[originCode];
  const dest = STATE_COMPLIANCE[destCode];
  if (!origin || !dest) {
    return {
      error: `No rule set on file for ${!origin ? originCode : destCode}`,
      unknownState: !origin ? originCode : destCode,
      alerts,
      complianceStatus: "unknown" as const,
    };
  }

  const distance = Number(input.distance ?? 0);
  const hoursAvail = Number(input.hours_avail ?? input.hoursAvail ?? FEDERAL_HOS.daily);
  const estimatedDriveTime = distance / AVG_SPEED_MPH;

  if (estimatedDriveTime > hoursAvail) {
    alerts.push({
      level: "critical",
      title: "Insufficient hours of service",
      message: `Load needs about ${estimatedDriveTime.toFixed(1)} h of driving at ${AVG_SPEED_MPH} mph, driver has ${hoursAvail} h left. Split the run or reset first.`,
      color: ALERT_LEVELS.critical.color,
    });
  } else if (estimatedDriveTime > hoursAvail - 1) {
    alerts.push({
      level: "warning",
      title: "HOS margin under one hour",
      message: `About ${estimatedDriveTime.toFixed(1)} h of driving against ${hoursAvail} h available. No room for traffic, detention, or a scale stop.`,
      color: ALERT_LEVELS.warning.color,
    });
  }

  if (origin.hosNote) alerts.push({ level: "info", title: `${origin.state} HOS note`, message: origin.hosNote, color: ALERT_LEVELS.info.color });
  if (dest.hosNote && destCode !== originCode) alerts.push({ level: "info", title: `${dest.state} HOS note`, message: dest.hosNote, color: ALERT_LEVELS.info.color });

  if (input.hazmat && origin.hazmat === "restricted") {
    alerts.push({ level: "warning", title: "Hazmat restricted in origin state", message: `${origin.state} restricts hazmat routing. Verify placards, tunnel and bridge restrictions before dispatch.`, color: ALERT_LEVELS.warning.color });
  }
  if (input.hazmat && dest.hazmat === "restricted") {
    alerts.push({ level: "warning", title: "Hazmat restricted in destination state", message: `${dest.state} restricts hazmat routing. Confirm an approved route to the consignee.`, color: ALERT_LEVELS.warning.color });
  }
  if (input.oversize && origin.oversize === "restricted") {
    alerts.push({ level: "warning", title: "Oversize permit needed in origin", message: `${origin.state} restricts oversize movement. Pull the state permit and check travel-time limits.`, color: ALERT_LEVELS.warning.color });
  }
  if (input.oversize && dest.oversize === "restricted") {
    alerts.push({ level: "warning", title: "Oversize permit needed in destination", message: `${dest.state} restricts oversize movement. Pull the state permit before crossing the line.`, color: ALERT_LEVELS.warning.color });
  }

  const fuelTaxEstimate = (distance / MPG_ASSUMPTION) * ((origin.fuelTax + dest.fuelTax) / 2);
  if (originCode !== destCode) {
    alerts.push({
      level: "info",
      title: "Interstate run — IFTA applies",
      message: `${origin.state} → ${dest.state}. Estimated fuel tax about $${fuelTaxEstimate.toFixed(2)} at ${MPG_ASSUMPTION} MPG. Log jurisdiction miles for the IFTA quarter.`,
      color: ALERT_LEVELS.info.color,
    });
  }

  const tollSystems = [...new Set([...(origin.tolls || []), ...(dest.tolls || [])])];
  if (tollSystems.length > 0) {
    alerts.push({ level: "info", title: "Toll transponders on this route", message: `Route touches: ${tollSystems.join(", ")}. Confirm the truck has a working transponder or a prepaid account.`, color: ALERT_LEVELS.info.color });
  }

  if (!origin.mc || !dest.mc) {
    alerts.push({ level: "critical", title: "MC authority issue", message: "One or both states require operating authority on file. Verify carrier registration before dispatching.", color: ALERT_LEVELS.critical.color });
  }

  const complianceStatus = alerts.length === 0
    ? "clear"
    : alerts.some((a) => a.level === "critical")
      ? "critical"
      : alerts.some((a) => a.level === "warning")
        ? "warning"
        : "clear";

  return {
    loadId: input.loadId ?? input.id ?? null,
    driverId: input.driverId ?? null,
    origin: origin.state,
    originCode,
    destination: dest.state,
    destinationCode: destCode,
    distance,
    estimatedDriveTime: Number(estimatedDriveTime.toFixed(1)),
    estimatedFuelTax: Number(fuelTaxEstimate.toFixed(2)),
    assumptions: { avgSpeedMph: AVG_SPEED_MPH, mpg: MPG_ASSUMPTION, hosBaseline: "federal interstate 11 h driving / 14 h on duty / 70 h per 8 days" },
    complianceStatus,
    alerts,
  };
}

export function taxCostForRoute(originCode: string, destCode: string, loadValue: number, distance: number) {
  const origin = STATE_COMPLIANCE[originCode?.toUpperCase()];
  const dest = STATE_COMPLIANCE[destCode?.toUpperCase()];
  if (!origin || !dest) return null;
  const fuelCost = (distance / MPG_ASSUMPTION) * ((origin.fuelTax + dest.fuelTax) / 2);
  const salesTax = (loadValue || 0) * ((origin.salesTax + dest.salesTax) / 200);
  return {
    fuelTax: Number(fuelCost.toFixed(2)),
    salesTax: Number(salesTax.toFixed(2)),
    total: Number((fuelCost + salesTax).toFixed(2)),
    assumptions: { mpg: MPG_ASSUMPTION, note: "Sales tax shown is the average of the two jurisdictions applied to declared load value. Freight is not sales-taxable in most states — treat this as a worst case, not an invoice." },
  };
}

export const dispatch = new Hono()
  .get("/rules", (c) =>
    c.json({
      federal: FEDERAL_HOS,
      count: Object.keys(STATE_COMPLIANCE).length,
      states: Object.entries(STATE_COMPLIANCE).map(([code, r]) => ({ code, ...r })),
    }),
  )
  .get("/rules/:state", (c) => {
    const code = c.req.param("state").toUpperCase();
    const rule = STATE_COMPLIANCE[code];
    if (!rule) return c.json({ error: "No rule set on file for this state", state: code, covered: Object.keys(STATE_COMPLIANCE) }, 404);
    return c.json({ code, ...rule, federal: FEDERAL_HOS });
  })
  .post("/check", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const result = runComplianceCheck(body as ComplianceInput);
    if ("error" in result && result.complianceStatus === "unknown") return c.json(result, 400);

    const id = `dcl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await db.insert(schema.dispatchComplianceLog).values({
      id,
      loadId: (result as any).loadId ?? null,
      driverId: (result as any).driverId ?? null,
      originState: (result as any).originCode,
      destinationState: (result as any).destinationCode,
      distanceMiles: (result as any).distance,
      estimatedDriveHours: (result as any).estimatedDriveTime,
      status: (result as any).complianceStatus,
      alerts: JSON.stringify((result as any).alerts),
      estimatedFuelTax: (result as any).estimatedFuelTax,
    });
    return c.json({ ...result, logged: true, logId: id });
  })
  .post("/tax", async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const out = taxCostForRoute(b.originState ?? b.origin_state, b.destState ?? b.destination_state, Number(b.loadValue ?? 0), Number(b.distance ?? 0));
    if (!out) return c.json({ error: "Unknown state in route" }, 400);
    return c.json(out);
  })
  .get("/history", async (c) => {
    const driverId = c.req.query("driverId");
    const rows = await db
      .select()
      .from(schema.dispatchComplianceLog)
      .where(driverId ? eq(schema.dispatchComplianceLog.driverId, driverId) : undefined)
      .orderBy(desc(schema.dispatchComplianceLog.checkedAt))
      .limit(100);
    return c.json({
      count: rows.length,
      checks: rows.map((r) => ({ ...r, alerts: r.alerts ? JSON.parse(r.alerts) : [] })),
    });
  });
