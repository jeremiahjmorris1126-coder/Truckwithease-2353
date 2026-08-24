import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

/**
 * TruckWithEase schema — core fleet + compliance entities.
 * Demo-friendly: seeded on boot. No hard auth wall.
 */

export const drivers = sqliteTable("drivers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  truckNumber: text("truck_number"),
  status: text("status").notNull().default("off_duty"), // driving, on_duty, sleeper, off_duty
  phone: text("phone"),
  email: text("email"),
  cdlNumber: text("cdl_number"),
  homeBase: text("home_base"),
  tier: text("tier").notNull().default("solo"), // solo, pro, fleet
  points: integer("points").notNull().default(0),
  lat: real("lat"),
  lng: real("lng"),
  speed: real("speed").default(0),
  heading: real("heading").default(0),
  lastSeen: integer("last_seen", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const trucks = sqliteTable("trucks", {
  id: text("id").primaryKey(),
  unit: text("unit").notNull(),
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  vin: text("vin"),
  plate: text("plate"),
  assignedDriverId: text("assigned_driver_id"),
  odometer: integer("odometer").default(0),
  status: text("status").notNull().default("active"), // active, maintenance, out_of_service
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const hosLogs = sqliteTable("hos_logs", {
  id: text("id").primaryKey(),
  driverId: text("driver_id").notNull(),
  status: text("status").notNull(), // driving, on_duty, sleeper, off_duty
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  endedAt: integer("ended_at", { mode: "timestamp" }),
  location: text("location"),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const dvirInspections = sqliteTable("dvir_inspections", {
  id: text("id").primaryKey(),
  driverId: text("driver_id").notNull(),
  truckUnit: text("truck_unit").notNull(),
  type: text("type").notNull(), // pre_trip, post_trip
  vehicleType: text("vehicle_type").notNull().default("tractor"), // tractor, trailer
  odometer: integer("odometer"),
  location: text("location"),
  defects: text("defects"), // JSON string array
  hasDefects: integer("has_defects", { mode: "boolean" }).notNull().default(false),
  safeToOperate: integer("safe_to_operate", { mode: "boolean" }).notNull().default(true),
  signature: text("signature"),
  photoUrls: text("photo_urls"), // JSON
  status: text("status").notNull().default("submitted"), // submitted, needs_repair, resolved
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const trips = sqliteTable("trips", {
  id: text("id").primaryKey(),
  driverId: text("driver_id").notNull(),
  origin: text("origin"),
  destination: text("destination"),
  miles: real("miles").default(0),
  startedAt: integer("started_at", { mode: "timestamp" }),
  endedAt: integer("ended_at", { mode: "timestamp" }),
  maxSpeed: real("max_speed").default(0),
  idleMinutes: integer("idle_minutes").default(0),
  status: text("status").notNull().default("active"), // active, completed
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const loads = sqliteTable("loads", {
  id: text("id").primaryKey(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  miles: real("miles"),
  rate: real("rate"),
  equipment: text("equipment"), // dry van, reefer, flatbed
  weight: integer("weight"),
  pickupDate: text("pickup_date"),
  broker: text("broker"),
  status: text("status").notNull().default("available"), // available, booked
  bookedByDriverId: text("booked_by_driver_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  fromId: text("from_id").notNull(),
  fromName: text("from_name").notNull(),
  toId: text("to_id"), // null = broadcast
  body: text("body").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/* ============================================================
 * HumanAI HR Manager — personnel, hiring, compliance, payroll
 * ============================================================ */

// People: drivers, prospects/applicants, and other employees
export const hrPeople = sqliteTable("hr_people", {
  id: text("id").primaryKey(),
  driverId: text("driver_id"), // link to drivers table if applicable
  name: text("name").notNull(),
  type: text("type").notNull().default("prospect"), // prospect, driver, employee
  status: text("status").notNull().default("applicant"), // applicant, screening, background, offer, hired, active, on_leave, terminated
  position: text("position").default("Company Driver"),
  phone: text("phone"),
  email: text("email"),
  cdlNumber: text("cdl_number"),
  cdlClass: text("cdl_class").default("A"),
  cdlState: text("cdl_state"),
  endorsements: text("endorsements"), // e.g. "H, N, T"
  homeBase: text("home_base"),
  yearsExperience: real("years_experience").default(0),
  payType: text("pay_type").notNull().default("mileage"), // mileage, hourly, salary
  payRate: real("pay_rate").notNull().default(0), // $/mile, $/hour, or $/year
  hireDate: text("hire_date"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Occurrences: violations, accidents, complaints, coaching, commendations
export const hrOccurrences = sqliteTable("hr_occurrences", {
  id: text("id").primaryKey(),
  personId: text("person_id").notNull(),
  category: text("category").notNull().default("coaching"), // violation, accident, complaint, coaching, commendation, attendance, drug_alcohol
  severity: text("severity").notNull().default("minor"), // minor, moderate, major, critical
  occurredOn: text("occurred_on"),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  actionTaken: text("action_taken"),
  points: integer("points").default(0), // CSA/internal points
  status: text("status").notNull().default("open"), // open, under_review, resolved
  reportedBy: text("reported_by"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Documents: long-term storage — CDLs, medical cards, contracts, applications
export const hrDocuments = sqliteTable("hr_documents", {
  id: text("id").primaryKey(),
  personId: text("person_id").notNull(),
  category: text("category").notNull().default("misc"), // cdl, medical_card, contract, application, background, mvr, w4, misc
  name: text("name").notNull(),
  dataUrl: text("data_url"), // base64 data URL for demo storage
  sizeBytes: integer("size_bytes").default(0),
  notes: text("notes"),
  issuedOn: text("issued_on"),
  expiresOn: text("expires_on"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Screening: AI pre-screen interview sessions
export const hrScreenings = sqliteTable("hr_screenings", {
  id: text("id").primaryKey(),
  personId: text("person_id"),
  candidateName: text("candidate_name").notNull(),
  position: text("position").notNull().default("Company Driver"),
  transcript: text("transcript"), // JSON [{ q, a }]
  score: integer("score"), // 0-100 fit score
  recommendation: text("recommendation"), // advance, hold, reject
  summary: text("summary"),
  redFlags: text("red_flags"), // JSON string[]
  status: text("status").notNull().default("completed"), // in_progress, completed
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Background checks: consent intake + generated report
export const hrBackgroundChecks = sqliteTable("hr_background_checks", {
  id: text("id").primaryKey(),
  personId: text("person_id").notNull(),
  ssnLast4: text("ssn_last4"),
  dob: text("dob"),
  licenseState: text("license_state"),
  consent: integer("consent", { mode: "boolean" }).notNull().default(false),
  checkTypes: text("check_types"), // JSON string[] — mvr, criminal, employment, drug, psp, clearinghouse
  status: text("status").notNull().default("intake"), // intake, pending, complete
  findings: text("findings"), // JSON per check-type result
  reportSummary: text("report_summary"),
  adjudication: text("adjudication"), // clear, review, adverse
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Payroll runs + pay statements
export const hrPayrollRuns = sqliteTable("hr_payroll_runs", {
  id: text("id").primaryKey(),
  periodStart: text("period_start").notNull(),
  periodEnd: text("period_end").notNull(),
  status: text("status").notNull().default("draft"), // draft, finalized
  totalGross: real("total_gross").default(0),
  totalNet: real("total_net").default(0),
  headcount: integer("headcount").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const hrPayStatements = sqliteTable("hr_pay_statements", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull(),
  personId: text("person_id").notNull(),
  personName: text("person_name").notNull(),
  payType: text("pay_type").notNull(),
  units: real("units").default(0), // miles or hours
  rate: real("rate").default(0),
  gross: real("gross").default(0),
  deductions: text("deductions"), // JSON { label, amount }[]
  totalDeductions: real("total_deductions").default(0),
  net: real("net").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Profitability: cost vs revenue per run
export const hrRuns = sqliteTable("hr_runs", {
  id: text("id").primaryKey(),
  personId: text("person_id"),
  driverName: text("driver_name"),
  origin: text("origin"),
  destination: text("destination"),
  miles: real("miles").default(0),
  revenue: real("revenue").default(0),
  fuelCost: real("fuel_cost").default(0),
  driverPay: real("driver_pay").default(0),
  tolls: real("tolls").default(0),
  maintenance: real("maintenance").default(0),
  otherCost: real("other_cost").default(0),
  ranOn: text("ran_on"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/* ─────────────────────────────────────────────────────────────────────────────
 * Platform reference doc tables (Aug 2026). The recovered frontend wrote these
 * to localStorage via the PocketBase shim; these give them real persistence.
 * ───────────────────────────────────────────────────────────────────────────── */

// INDEX=MECHANIC: every diagnosis, ELD fault scan, and DVIR session
export const mechanicSessions = sqliteTable("mechanic_sessions", {
  id: text("id").primaryKey(),
  driverId: text("driver_id"),
  truckUnit: text("truck_unit"),
  mode: text("mode").notNull().default("diagnose"), // diagnose, eld_scan, dvir, pm_planner
  brand: text("brand"), // volvo, peterbilt, kenworth, freightliner, international, mack, western_star
  symptom: text("symptom"),
  codes: text("codes"), // JSON string[] of SPN/DTC codes
  diagnosis: text("diagnosis"),
  rootCause: text("root_cause"),
  repairSteps: text("repair_steps"), // JSON string[]
  eldDevice: text("eld_device"), // geotab, motive, samsara, azuga, manual
  photoUrls: text("photo_urls"), // JSON string[]
  damageNotes: text("damage_notes"),
  priorDvirId: text("prior_dvir_id"), // the DVIR this session was compared against
  newDamage: integer("new_damage", { mode: "boolean" }).default(false),
  insuranceFlagged: integer("insurance_flagged", { mode: "boolean" }).default(false),
  insuranceCarrier: text("insurance_carrier"),
  loggedToMaintease: integer("logged_to_maintease", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// MaintEase: the permanent service archive
export const maintenanceRecords = sqliteTable("maintenance_records", {
  id: text("id").primaryKey(),
  truckUnit: text("truck_unit").notNull(),
  driverId: text("driver_id"),
  sessionId: text("session_id"), // origin mechanic_sessions.id, if any
  type: text("type").notNull().default("repair"), // repair, pm, inspection, warranty, work_order
  category: text("category"), // engine, brakes, tires, aftertreatment, electrical, ...
  status: text("status").notNull().default("open"), // open, in_progress, complete, deferred
  priority: text("priority").notNull().default("normal"), // low, normal, high, critical
  title: text("title").notNull(),
  description: text("description"),
  dtcCodes: text("dtc_codes"), // JSON string[]
  eldFlags: text("eld_flags"), // JSON string[]
  scanData: text("scan_data"), // JSON blob from photo scan / ELD scan
  quantumDiagnosis: text("quantum_diagnosis"), // predictive engine output
  photoNotes: text("photo_notes"),
  photoUrls: text("photo_urls"), // JSON string[]
  odometer: integer("odometer"),
  engineHours: real("engine_hours"),
  vendor: text("vendor"),
  vendorPhone: text("vendor_phone"),
  invoiceNumber: text("invoice_number"),
  partsCost: real("parts_cost").default(0),
  laborCost: real("labor_cost").default(0),
  laborHours: real("labor_hours").default(0),
  totalCost: real("total_cost").default(0),
  warrantyClaim: integer("warranty_claim", { mode: "boolean" }).default(false),
  warrantyClaimNumber: text("warranty_claim_number"),
  downtimeHours: real("downtime_hours").default(0),
  pmInterval: text("pm_interval"), // e.g. "oil_change", "dpf_clean", "dot_annual"
  nextDueMiles: integer("next_due_miles"),
  nextDueDate: text("next_due_date"),
  performedOn: text("performed_on"),
  performedBy: text("performed_by"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Brand Studio: white-label settings (unlocks at 10+ assets)
export const fleetBranding = sqliteTable("fleet_branding", {
  id: text("id").primaryKey(),
  fleetName: text("fleet_name").notNull(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#C9A84C"),
  accentColor: text("accent_color").default("#FFD700"),
  backgroundColor: text("background_color").default("#0a0a0a"),
  enabledModules: text("enabled_modules"), // JSON string[] — the 16 toggleable modules
  whiteLabel: integer("white_label", { mode: "boolean" }).default(false),
  assetCount: integer("asset_count").default(0),
  unlocked: integer("unlocked", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Incident command: the permanent fleet incident archive
export const accidentReports = sqliteTable("accident_reports", {
  id: text("id").primaryKey(),
  driverId: text("driver_id"),
  driverName: text("driver_name"),
  truckUnit: text("truck_unit"),
  occurredAt: integer("occurred_at", { mode: "timestamp" }),
  location: text("location"),
  lat: real("lat"),
  lng: real("lng"),
  severity: text("severity").notNull().default("minor"), // minor, moderate, major, fatality
  injuries: integer("injuries", { mode: "boolean" }).default(false),
  towRequired: integer("tow_required", { mode: "boolean" }).default(false),
  policeReportNumber: text("police_report_number"),
  otherParties: text("other_parties"), // JSON blob
  description: text("description"),
  fleetProcedureId: text("fleet_procedure_id"),
  customSteps: text("custom_steps"), // JSON string[] — the 8-step protocol as executed
  stepsCompleted: text("steps_completed"), // JSON string[]
  goatRecommendations: text("goat_recommendations"),
  complianceGaps: text("compliance_gaps"), // JSON string[]
  documentUrls: text("document_urls"), // JSON string[]
  photoUrls: text("photo_urls"), // JSON string[]
  insuranceNotified: integer("insurance_notified", { mode: "boolean" }).default(false),
  status: text("status").notNull().default("open"), // open, under_review, closed
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Integration credentials + platform toggles. NOTE: values are stored as-is;
// never put a live secret here that the browser can read back.
export const platformSettings = sqliteTable("platform_settings", {
  id: text("id").primaryKey(),
  key: text("key").notNull(),
  category: text("category").default("general"), // eld, load_board, comms, gps, payments, weather
  provider: text("provider"),
  value: text("value"),
  secret: integer("secret", { mode: "boolean" }).default(false), // true => never returned to the client
  enabled: integer("enabled", { mode: "boolean" }).default(true),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
