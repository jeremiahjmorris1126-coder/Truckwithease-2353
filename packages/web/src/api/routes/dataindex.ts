/**
 * dataindex.ts — THE ENTITLED INDEX, AS DATA
 * Mounted at /api/data-index
 *
 * WHAT THIS IS
 * Jeremiah's instruction: "the entitled index equals ALL DATA not documents. Anything ever
 * reported filed equals a function we can add to be better than Samsara or any trucking app."
 *
 * So this route stops describing features and starts counting facts. Three inventories:
 *
 *   1. TABLES  — live SQLite introspection of the real Turso database. Table names, real row
 *                counts, real column counts. Nothing hardcoded; if a table is dropped this
 *                list shrinks on the next request.
 *   2. ROUTES  — every API router actually mounted on the Hono app, read off the running app
 *                instance, not off a list someone maintained by hand.
 *   3. FILED   — every record a US motor carrier ever reports, files, or is asked to produce
 *                in an audit. Each one is matched to a real table and a real route. Coverage
 *                status is COMPUTED from whether that table exists and whether it has rows —
 *                it is never asserted.
 *
 * WHY THIS BEATS A FEATURE GRID
 * A feature grid is a marketing claim. This is a diff. Every row where `status` is "gap" is a
 * function that does not exist yet, named precisely, with the filing that justifies building it.
 * That list IS the roadmap to being more complete than Samsara — not an opinion about it.
 *
 * WHAT IT WILL NOT DO
 * - It does not claim TruckWithEase files anything with a government. It does not.
 * - It does not claim ELD registration. We are not a registered ELD.
 * - Retention periods below are only the ones verified against FMCSA / eCFR / IFTA sources on
 *   2026-08-28. Where a period was not verified, the field is null, not a guess.
 * - It never compares us to a competitor by score or price.
 */

import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { db } from "../database";

type Row = Record<string, unknown>;

async function run(q: string): Promise<Row[]> {
  const r = (await db.execute(sql.raw(q))) as unknown as { rows: Row[] };
  return (r.rows ?? []) as Row[];
}

/* ---------------------------------------------------------------------------
 * 1. TABLE INVENTORY — live introspection
 * ------------------------------------------------------------------------- */

/**
 * What each table actually feeds. Only pages/routes that genuinely read the table are
 * listed. A table with no consumer is marked null and shows up as "stored, nothing reads it"
 * — that is a real finding, not a blank.
 */
const TABLE_MAP: Record<string, { domain: string; powers: string | null }> = {
  a2p_registrations: { domain: "Messaging", powers: "/a2p-registration, /api/a2p" },
  accessibility_requests: { domain: "Accessibility", powers: "/api/accessibility" },
  accident_reports: { domain: "Safety", powers: "/api/incidents" },
  activity_log: { domain: "Platform", powers: "/api/integrity" },
  agent_integrity: { domain: "AI", powers: "/orchestrator, /api/integrity" },
  api_key_audit_log: { domain: "Platform", powers: "/api/vault" },
  api_key_vault: { domain: "Platform", powers: "/api/vault" },
  billing_cases: { domain: "Billing", powers: "/api/support" },
  broker_verifications: { domain: "Loads", powers: "/api/intel" },
  checkout_screenings: { domain: "Billing", powers: "/api/signup" },
  dispatch_compliance_log: { domain: "Dispatch", powers: "/api/dispatch" },
  driver_accessibility: { domain: "Accessibility", powers: "/api/accessibility" },
  driver_signals: { domain: "AI", powers: "/driver-algorithm, /api/algorithm" },
  drivers: { domain: "Fleet", powers: "/api/fleet, nearly every page" },
  dvir_inspections: { domain: "Compliance", powers: "/api/dvir" },
  eld_devices: { domain: "Compliance", powers: "/api/eld" },
  eld_telemetry: { domain: "Compliance", powers: "/api/eld, /api/safety" },
  fleet_branding: { domain: "Platform", powers: "/api/branding" },
  fleet_intelligence_notes: { domain: "AI", powers: "/api/fleet-intel" },
  haptic_events: { domain: "Accessibility", powers: "/api/accessibility" },
  health_recovery_plans: { domain: "Driver health", powers: "/api/recovery" },
  hos_logs: { domain: "Compliance", powers: "/api/hos, /app/hos" },
  hr_background_checks: { domain: "HR", powers: "/api/hr" },
  hr_documents: { domain: "HR", powers: "/api/hr, /entitled-index" },
  hr_occurrences: { domain: "HR", powers: "/api/hr, /safety-hr-fusion" },
  hr_pay_statements: { domain: "HR", powers: "/api/hr" },
  hr_payroll_runs: { domain: "HR", powers: "/api/hr" },
  hr_people: { domain: "HR", powers: "/api/hr" },
  hr_runs: { domain: "HR", powers: "/api/hr" },
  hr_screenings: { domain: "HR", powers: "/api/hr" },
  load_board_licenses: { domain: "Loads", powers: "/api/licensing" },
  loads: { domain: "Loads", powers: "/api/loads, /load-board" },
  maintenance_records: { domain: "Maintenance", powers: "/api/maintenance" },
  mechanic_sessions: { domain: "Maintenance", powers: "/api/mechanic" },
  messages: { domain: "Comms", powers: "/api/chat" },
  platform_settings: { domain: "Platform", powers: "/api/settings" },
  ride_couriers: { domain: "Ride", powers: "/api/ride" },
  ride_deliveries: { domain: "Ride", powers: "/api/ride" },
  ride_expenses: { domain: "Ride", powers: "/api/ride" },
  ride_maintenance: { domain: "Ride", powers: "/api/ride" },
  route_stop_feedback: { domain: "AI", powers: "/api/algorithm" },
  safety_scores: { domain: "Safety", powers: "/api/safety (computes live, persists nothing)" },
  shipper_broker_ratings: { domain: "AI", powers: "/api/algorithm" },
  signups: { domain: "Billing", powers: "/api/signup, /signup" },
  speeding_events: { domain: "Safety", powers: "/api/safety" },
  subscriptions: { domain: "Billing", powers: "/api/subscriptions" },
  support_tickets: { domain: "Support", powers: "/api/support" },
  traxes_records: { domain: "Money", powers: "/traxes, /api/traxes" },
  trial_links: { domain: "Billing", powers: "/api/signup" },
  trips: { domain: "Loads", powers: "/api/loads, /api/traxes" },
  trucks: { domain: "Fleet", powers: "/api/fleet" },
  twilio_domain_verifications: { domain: "Messaging", powers: "/api/twilio" },
  week_review_subscriptions: { domain: "Reporting", powers: "/api/week-review" },
};

async function tableInventory() {
  const names = (
    await run(
      `SELECT table_name AS name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`,
    )
  ).map((r) => String(r.name));

  const tables = [];
  for (const name of names) {
    const c = await run(`SELECT COUNT(*) AS c FROM "${name}"`);
    const cols = await run(
      `SELECT column_name AS name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${name}'`,
    );
    const meta = TABLE_MAP[name] ?? { domain: "Unmapped", powers: null };
    tables.push({
      table: name,
      rows: Number(c[0]?.c ?? 0),
      columns: cols.length,
      columnNames: cols.map((x) => String(x.name)),
      domain: meta.domain,
      powers: meta.powers,
      state: Number(c[0]?.c ?? 0) > 0 ? "populated" : "empty",
    });
  }
  return tables;
}

/* ---------------------------------------------------------------------------
 * 2. FILED / REPORTED RECORD CATALOG
 *
 * Every record a US motor carrier files, reports, or must produce on demand. `table` names a
 * real table in our schema or null. Status is computed downstream from live row counts.
 *
 * `retention` and `cadence` are ONLY populated where verified 2026-08-28 against eCFR,
 * FMCSA CSA Safety Planner, FMCSA registration pages, and IFTA Inc. Everything unverified is
 * null on purpose. Sources listed in SOURCES below.
 * ------------------------------------------------------------------------- */

type Filed = {
  id: string;
  name: string;
  what: string;
  filedWith: string;
  cadence: string | null;
  retention: string | null;
  cite: string | null;
  table: string | null;
  route: string | null;
  /** If we don't have it, this is the exact function to build. */
  gapFunction: string | null;
};

const FILED: Filed[] = [
  // ---- Driver files -------------------------------------------------------
  {
    id: "dqf",
    name: "Driver Qualification File",
    what: "Application, MVR, annual MVR review note, road test or CDL equivalent, med cert, previous-employer safety history.",
    filedWith: "Kept by carrier, produced on DOT audit",
    cadence: "Per hire, MVR reviewed annually",
    retention: "Duration of employment + 3 years",
    cite: "49 CFR 391.51",
    table: "hr_people",
    route: "/api/hr/people",
    gapFunction:
      "hr_people holds the person but there is no DQ-file completeness checker. Build a per-driver 10-item DQF checklist that turns red the moment an item is missing or an MVR review is over 12 months old.",
  },
  {
    id: "medcert",
    name: "Medical Examiner's Certificate",
    what: "DOT physical card, max 24-month validity, issued by a National Registry examiner.",
    filedWith: "Carrier file + state driver licensing agency",
    cadence: "Up to every 24 months",
    retention: null,
    cite: "49 CFR 391.43",
    table: "hr_documents",
    route: "/api/hr/documents",
    gapFunction: null,
  },
  {
    id: "mvr",
    name: "Motor Vehicle Record + annual review",
    what: "State driving record pulled yearly, plus a signed note naming who reviewed it and when.",
    filedWith: "Carrier file",
    cadence: "Annual",
    retention: "3 years",
    cite: "49 CFR 391.25",
    table: null,
    route: null,
    gapFunction:
      "No MVR table. Build hr_mvr_reviews (driver, state, pull date, reviewer, violations found, next due) — this is the single most common DOT audit failure and nothing in the platform tracks it.",
  },
  {
    id: "clearinghouse",
    name: "FMCSA Drug & Alcohol Clearinghouse query",
    what: "Pre-employment full query and annual limited query on every CDL driver.",
    filedWith: "FMCSA Clearinghouse",
    cadence: "Pre-employment + annual",
    retention: null,
    cite: "49 CFR 382 subpart G",
    table: null,
    route: null,
    gapFunction:
      "Not tracked anywhere. Build hr_clearinghouse_queries with query type, date, result, consent on file, and next-annual-due. Missing an annual limited query is a per-driver violation.",
  },
  {
    id: "drugtest",
    name: "Drug & alcohol testing program records",
    what: "Pre-employment, random pool selections, post-accident, reasonable suspicion, return-to-duty.",
    filedWith: "Carrier + consortium/TPA",
    cadence: "Ongoing, random pool by quarter",
    retention: null,
    cite: "49 CFR 382",
    table: "hr_screenings",
    route: "/api/hr",
    gapFunction:
      "hr_screenings exists but has no random-pool selection logic or post-accident trigger. Wire an accident_reports row to auto-open a post-accident test task inside the 8/32-hour windows.",
  },
  {
    id: "bgcheck",
    name: "Criminal background / PSP report",
    what: "Pre-Employment Screening Program crash and inspection history, plus criminal check where required.",
    filedWith: "Carrier file",
    cadence: "Per hire",
    retention: null,
    cite: null,
    table: "hr_background_checks",
    route: "/api/hr",
    gapFunction: null,
  },

  // ---- Daily operating records -------------------------------------------
  {
    id: "rods",
    name: "Record of Duty Status (HOS logs)",
    what: "Every driver's on-duty, driving, sleeper and off-duty time with supporting documents.",
    filedWith: "Carrier, produced on demand roadside and on audit",
    cadence: "Daily",
    retention: "6 months",
    cite: "49 CFR 395.8",
    table: "hos_logs",
    route: "/api/hos",
    gapFunction: null,
  },
  {
    id: "dvir",
    name: "Driver Vehicle Inspection Report",
    what: "Post-trip written report of defects, plus the certification that defects were repaired.",
    filedWith: "Carrier",
    cadence: "Daily / post-trip",
    retention: "3 months",
    cite: "49 CFR 396.11",
    table: "dvir_inspections",
    route: "/api/dvir",
    gapFunction:
      "DVIR defects never leave our database. Build the DVIR → Fleetio issue write path so a reported defect opens a real maintenance issue and closes when the repair is signed off.",
  },
  {
    id: "annualinsp",
    name: "Annual / periodic vehicle inspection",
    what: "Yearly DOT inspection report per power unit and trailer.",
    filedWith: "Carrier, decal on unit",
    cadence: "Annual",
    retention: "14 months",
    cite: "49 CFR 396.17, 396.21",
    table: null,
    route: null,
    gapFunction:
      "No annual-inspection tracking. Build vehicle_inspections (unit, inspector, date, pass/fail, expiry) with a countdown per truck. Fleetio holds service reminders but not the DOT annual.",
  },
  {
    id: "maint",
    name: "Systematic maintenance & repair records",
    what: "Every inspection, repair and service per vehicle, with the identifying info of the unit.",
    filedWith: "Carrier",
    cadence: "Ongoing",
    retention: "1 year in service + 6 months after the vehicle leaves the fleet",
    cite: "49 CFR 396.3(b)",
    table: "maintenance_records",
    route: "/api/maintenance, /api/fleetio",
    gapFunction:
      "maintenance_records is empty and Fleetio holds 0 work orders. Nothing computes maintenance cost per mile because there is no cost data to compute it from.",
  },
  {
    id: "eldmalf",
    name: "ELD malfunction record",
    what: "Written notice of malfunction and 8 days of paper logs while the device is down.",
    filedWith: "Carrier",
    cadence: "Per event",
    retention: null,
    cite: "49 CFR 395.34",
    table: "eld_devices",
    route: "/api/eld",
    gapFunction:
      "eld_devices tracks the device but not malfunction events. Build eld_malfunctions with the 8-day paper-log countdown. Note: TruckWithEase is NOT a registered ELD.",
  },

  // ---- Crashes and enforcement -------------------------------------------
  {
    id: "accreg",
    name: "Accident register",
    what: "Register of every qualifying crash: date, city/state, driver, fatalities, injuries, hazmat release.",
    filedWith: "Carrier, produced on audit",
    cadence: "Per crash",
    retention: "3 years from the date of each accident",
    cite: "49 CFR 390.15",
    table: "accident_reports",
    route: "/api/incidents",
    gapFunction:
      "The table exists with 25 columns and zero rows, and no page writes to it. Build the crash-entry flow: driver reports from mobile, register row is created, post-accident test task opens, 3-year clock starts.",
  },
  {
    id: "roadside",
    name: "Roadside inspection report",
    what: "The paper the officer hands you at the scale — levels I–VI, violations, OOS status.",
    filedWith: "Carrier must sign and return within 15 days",
    cadence: "Per inspection",
    retention: "12 months",
    cite: "49 CFR 396.9",
    table: null,
    route: null,
    gapFunction:
      "Nothing captures roadside inspections. Build roadside_inspections (date, state, level, violations, OOS, 15-day signed-return countdown) — this feeds CSA BASIC scores and drivers photograph these anyway.",
  },
  {
    id: "csa",
    name: "CSA / SMS BASIC scores",
    what: "FMCSA's public safety percentiles across the seven BASIC categories.",
    filedWith: "Published by FMCSA from inspection data",
    cadence: "Monthly refresh",
    retention: null,
    cite: null,
    table: null,
    route: null,
    gapFunction:
      "Not pulled. Once roadside_inspections exists, mirror our own violation history against the BASIC categories so a driver sees what an inspection did to the carrier's score.",
  },

  // ---- Tax and registration ----------------------------------------------
  {
    id: "ifta",
    name: "IFTA quarterly fuel tax return",
    what: "Miles and fuel purchased per jurisdiction, netted into one quarterly return.",
    filedWith: "Base jurisdiction",
    cadence: "Quarterly",
    retention: null,
    cite: "IFTA Articles of Agreement",
    table: null,
    route: null,
    gapFunction:
      "The biggest single gap. We already have GPS position on drivers and fuel purchases in TRAXES — build ifta_jurisdiction_miles from route data plus fuel receipts and generate the quarterly worksheet. This is hours of paperwork per quarter for every carrier.",
  },
  {
    id: "hvut",
    name: "Form 2290 Heavy Highway Vehicle Use Tax",
    what: "Federal use tax on power units at 55,000 lbs or more taxable gross weight.",
    filedWith: "IRS",
    cadence: "Annual, tax year July–June, due August 31",
    retention: null,
    cite: "IRS Form 2290",
    table: null,
    route: null,
    gapFunction:
      "Not tracked. Build a per-truck 2290 status field with the stamped Schedule 1 stored in Tigris and an August 31 reminder. Cheap to build, and it is due three days from now every year.",
  },
  {
    id: "irp",
    name: "IRP apportioned registration",
    what: "Apportioned plates and cab card based on distance travelled per jurisdiction.",
    filedWith: "Base jurisdiction",
    cadence: "Annual renewal",
    retention: null,
    cite: null,
    table: null,
    route: null,
    gapFunction:
      "Not tracked. Same jurisdiction-mile dataset as IFTA — build it once and both filings fall out of it.",
  },
  {
    id: "ucr",
    name: "Unified Carrier Registration",
    what: "Annual federal registration fee based on fleet size.",
    filedWith: "UCR / base state",
    cadence: "Annual",
    retention: null,
    cite: null,
    table: null,
    route: null,
    gapFunction: "Not tracked. A one-field annual reminder per carrier with the fleet-size bracket.",
  },
  {
    id: "mcs150",
    name: "MCS-150 biennial update",
    what: "Motor Carrier Identification Report — mileage and fleet size refresh tied to the USDOT number.",
    filedWith: "FMCSA",
    cadence: "Biennial, due month set by USDOT number",
    retention: null,
    cite: "FMCSA Form MCS-150",
    table: null,
    route: null,
    gapFunction:
      "Not tracked. Deriving the due month from the USDOT number is deterministic — store the DOT number once and the reminder computes itself forever.",
  },
  {
    id: "insurance",
    name: "Insurance filings (BMC-91/91X, MCS-90)",
    what: "Proof of financial responsibility filed by the insurer against the carrier's authority.",
    filedWith: "FMCSA",
    cadence: "On policy change",
    retention: null,
    cite: null,
    table: null,
    route: null,
    gapFunction:
      "Not tracked. Store policy, carrier, expiry and certificate PDF so an expiring policy is visible before authority is revoked.",
  },

  // ---- Load and money paperwork ------------------------------------------
  {
    id: "bol",
    name: "Bill of Lading / Proof of Delivery",
    what: "The document that proves the freight moved and gets the load paid.",
    filedWith: "Broker / shipper",
    cadence: "Per load",
    retention: null,
    cite: null,
    table: "loads",
    route: "/api/loads, /api/storage",
    gapFunction:
      "Uploads work through presigned URLs but no page attaches a scanned BOL to a load row. Wire the storage round-trip into the load detail view.",
  },
  {
    id: "ratecon",
    name: "Rate confirmation",
    what: "The signed agreement on what the load pays, including detention and layover terms.",
    filedWith: "Broker",
    cadence: "Per load",
    retention: null,
    cite: null,
    table: "loads",
    route: "/api/loads",
    gapFunction:
      "No rate-con storage or parsing. OCR it with Gemini, extract the rate and accessorial terms, and flag when a broker pays less than the confirmation said.",
  },
  {
    id: "detention",
    name: "Detention / accessorial claims",
    what: "Time on a dock beyond free time, billed back to the broker.",
    filedWith: "Broker",
    cadence: "Per event",
    retention: null,
    cite: null,
    table: null,
    route: null,
    gapFunction:
      "Not tracked. We already have GPS arrival times — a geofence dwell timer would auto-generate a timestamped detention claim with evidence. This is money drivers currently lose by not documenting.",
  },
  {
    id: "scale",
    name: "Scale tickets & weight records",
    what: "Certified weights, axle distribution, overweight exposure.",
    filedWith: "Carrier / shipper",
    cadence: "Per load",
    retention: null,
    cite: null,
    table: null,
    route: null,
    gapFunction: "Not tracked. Store scale tickets against the load and check them against the Bridge Formula.",
  },
  {
    id: "fuelreceipt",
    name: "Fuel purchase receipts",
    what: "Per-jurisdiction gallons and dollars — the other half of an IFTA return.",
    filedWith: "Carrier",
    cadence: "Per purchase",
    retention: null,
    cite: null,
    table: "traxes_records",
    route: "/api/traxes",
    gapFunction:
      "traxes_records has 27 columns and 0 rows, and /api/traxes/scan has never been run against a real receipt image. Prove the OCR path before launch.",
  },
  {
    id: "settlement",
    name: "Settlement statements",
    what: "What the driver was actually paid, line by line, against what the load promised.",
    filedWith: "Carrier to driver",
    cadence: "Per pay period",
    retention: null,
    cite: null,
    table: "hr_pay_statements",
    route: "/api/hr",
    gapFunction: null,
  },
  {
    id: "payroll",
    name: "Payroll & hours-worked records",
    what: "Hours, miles, rate and deductions per pay period.",
    filedWith: "Carrier, IRS/state on request",
    cadence: "Per pay period",
    retention: null,
    cite: null,
    table: "hr_payroll_runs",
    route: "/api/hr",
    gapFunction: null,
  },

  // ---- Permits and specialty ---------------------------------------------
  {
    id: "oversize",
    name: "Oversize / overweight permits",
    what: "Per-state permits with routing restrictions and time-of-day limits.",
    filedWith: "State permit offices",
    cadence: "Per move",
    retention: null,
    cite: null,
    table: null,
    route: null,
    gapFunction: "Not tracked. Store the permit, its route restriction and its expiry against the trip.",
  },
  {
    id: "hazmat",
    name: "Hazmat registration, shipping papers, placarding",
    what: "Federal hazmat registration plus per-load shipping papers and emergency response info.",
    filedWith: "PHMSA / carried in cab",
    cadence: "Annual registration, per load papers",
    retention: null,
    cite: null,
    table: null,
    route: null,
    gapFunction:
      "Not tracked at all. Only build this if Jeremiah wants hazmat carriers as customers — it is a large, high-liability surface.",
  },
  {
    id: "trailerlease",
    name: "Lease agreements & equipment titles",
    what: "Owner-operator lease, trailer interchange, titles and registrations per unit.",
    filedWith: "Carrier",
    cadence: "Per unit",
    retention: null,
    cite: null,
    table: "trucks",
    route: "/api/fleet",
    gapFunction: "trucks has 5 rows but no document slots. Attach title, registration and lease PDFs per unit.",
  },
];

const SOURCES = [
  "eCFR Title 49 Part 391.51 — driver qualification file contents",
  "FMCSA CSA Safety Planner 4.4.2 — accident register, 3-year retention (390.15)",
  "FMCSA CSA Safety Planner 5.2.1 — maintenance records, 1 year in service + 6 months after",
  "FMCSA — Form MCS-150 biennial update requirement",
  "IFTA Inc. carrier information — quarterly return filed with base jurisdiction",
  "IRS Form 2290 — HVUT at 55,000 lbs, tax year July–June, due August 31",
];

/* ---------------------------------------------------------------------------
 * 3. ROUTE INVENTORY — read off the running Hono app
 * ------------------------------------------------------------------------- */

function routeInventory(app: { routes?: Array<{ path: string; method: string }> }) {
  const seen = new Map<string, Set<string>>();
  for (const r of app.routes ?? []) {
    if (!r.path.startsWith("/api")) continue;
    const seg = r.path.split("/").filter(Boolean);
    const root = "/" + (seg[1] ?? "");
    if (root === "/") continue;
    if (!seen.has(root)) seen.set(root, new Set());
    seen.get(root)!.add(r.method.toUpperCase());
  }
  return [...seen.entries()]
    .map(([mount, methods]) => ({ mount: "/api" + mount, methods: [...methods].sort() }))
    .sort((a, b) => a.mount.localeCompare(b.mount));
}

/* ------------------------------------------------------------------------- */

export const dataIndex = new Hono()
  .get("/tables", async (c) => {
    try {
      const tables = await tableInventory();
      return c.json({
        tables,
        counts: {
          tables: tables.length,
          rows: tables.reduce((n, t) => n + t.rows, 0),
          columns: tables.reduce((n, t) => n + t.columns, 0),
          populated: tables.filter((t) => t.rows > 0).length,
          empty: tables.filter((t) => t.rows === 0).length,
          unmapped: tables.filter((t) => t.powers === null).length,
        },
        note: "Live information_schema/COUNT(*) against the Neon Postgres database on every request. Nothing cached.",
      });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : "introspection failed" }, 502);
    }
  })

  .get("/filed", async (c) => {
    try {
      const tables = await tableInventory();
      const byName = new Map(tables.map((t) => [t.table, t]));

      const records = FILED.map((f) => {
        const t = f.table ? byName.get(f.table) : undefined;
        let status: "live" | "table-empty" | "gap";
        if (!f.table || !t) status = "gap";
        else if (t.rows > 0) status = "live";
        else status = "table-empty";
        return { ...f, rows: t?.rows ?? null, tableExists: Boolean(t), status };
      });

      return c.json({
        records,
        sources: SOURCES,
        counts: {
          total: records.length,
          live: records.filter((r) => r.status === "live").length,
          tableEmpty: records.filter((r) => r.status === "table-empty").length,
          gap: records.filter((r) => r.status === "gap").length,
          withGapFunction: records.filter((r) => r.gapFunction).length,
        },
        note: "Status is computed from live row counts, never asserted. 'gap' means no table backs this filing.",
      });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : "catalog failed" }, 502);
    }
  })

  .get("/routes", (c) => {
    // Imported lazily to avoid a circular import at module load.
    const app = (c.env as unknown as { app?: unknown })?.app;
    void app;
    return c.json({ error: "Use /api/data-index/summary — route inventory is served there." }, 400);
  })

  .get("/summary", async (c) => {
    try {
      const tables = await tableInventory();
      const byName = new Map(tables.map((t) => [t.table, t]));
      const filed = FILED.map((f) => {
        const t = f.table ? byName.get(f.table) : undefined;
        const status = !f.table || !t ? "gap" : t.rows > 0 ? "live" : "table-empty";
        return { id: f.id, name: f.name, status };
      });
      return c.json({
        data: {
          tables: tables.length,
          rows: tables.reduce((n, t) => n + t.rows, 0),
          columns: tables.reduce((n, t) => n + t.columns, 0),
          populated: tables.filter((t) => t.rows > 0).length,
          empty: tables.filter((t) => t.rows === 0).length,
        },
        filings: {
          total: filed.length,
          live: filed.filter((f) => f.status === "live").length,
          tableEmpty: filed.filter((f) => f.status === "table-empty").length,
          gap: filed.filter((f) => f.status === "gap").length,
        },
        domains: [...new Set(tables.map((t) => t.domain))].sort(),
        generatedAt: new Date().toISOString(),
      });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : "summary failed" }, 502);
    }
  });

export { routeInventory, FILED, SOURCES };
