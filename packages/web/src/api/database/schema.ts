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

// ── API key vault ────────────────────────────────────────────────────────────
// Encrypted at rest with AES-256-GCM (see api/lib/crypto.ts). The ciphertext
// never leaves the server: routes return a masked preview only. Replaces the
// client-side base64 "vault", which was not encryption at all.
export const apiKeyVault = sqliteTable("api_key_vault", {
  id: text("id").primaryKey(),
  service: text("service").notNull(), // apifreaks, google_maps, twilio, checkr, ...
  label: text("label"),
  ciphertext: text("ciphertext").notNull(), // iv.tag.data — base64url
  hint: text("hint").notNull(), // last 4 chars only, safe to display
  fingerprint: text("fingerprint").notNull(), // sha256 of plaintext, for rotation checks
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastRotated: integer("last_rotated", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  rotationCount: integer("rotation_count").notNull().default(0),
  accessCount: integer("access_count").notNull().default(0),
  lastAccessed: integer("last_accessed", { mode: "timestamp" }),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
});

export const apiKeyAuditLog = sqliteTable("api_key_audit_log", {
  id: text("id").primaryKey(),
  service: text("service").notNull(),
  action: text("action").notNull(), // store, rotate, use, denied, delete
  outcome: text("outcome").notNull(), // ok, not_found, disabled, error
  actor: text("actor").default("server"),
  detail: text("detail"),
  at: integer("at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ── Broker / shipper verification ────────────────────────────────────────────
export const brokerVerifications = sqliteTable("broker_verifications", {
  id: text("id").primaryKey(),
  email: text("email"),
  domain: text("domain"),
  ip: text("ip"),
  mcNumber: text("mc_number"),
  organization: text("organization"),
  registrar: text("registrar"),
  country: text("country"),
  region: text("region"),
  domainAgeDays: integer("domain_age_days"),
  hostingType: text("hosting_type"), // business, residential, hosting, vpn, unknown
  riskScore: integer("risk_score").notNull().default(0), // 0 clean .. 100 do-not-load
  verdict: text("verdict").notNull().default("unverified"), // verified, caution, unverified, high_risk
  reasons: text("reasons"), // JSON string[]
  source: text("source").notNull().default("heuristic"), // apifreaks, heuristic
  raw: text("raw"), // JSON provider payload
  checkedAt: integer("checked_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ── Agent integrity ─────────────────────────────────────────────────────────
// Baseline sha256 of each agent's composed system prompt. Verification is
// server-side: a modified prompt changes its hash and is actually detected.
export const agentIntegrity = sqliteTable("agent_integrity", {
  id: text("id").primaryKey(), // agent id
  name: text("name").notNull(),
  baselineHash: text("baseline_hash").notNull(),
  promptChars: integer("prompt_chars").notNull().default(0),
  guardrailsPresent: integer("guardrails_present", { mode: "boolean" }).notNull().default(true),
  sealedAt: integer("sealed_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastCheckedAt: integer("last_checked_at", { mode: "timestamp" }),
  lastResult: text("last_result"), // ok, drift, missing_guardrails
});

// ── ELD hardware ─────────────────────────────────────────────────────────────
// Physical device registry + telemetry. Replaces the client-side eldIntegration
// lib, which wrote to PocketBase collections that never existed.
export const eldDevices = sqliteTable("eld_devices", {
  id: text("id").primaryKey(),
  driverId: text("driver_id").notNull(),
  truckId: text("truck_id"),
  deviceType: text("device_type").notNull(), // gps_tracker, obd2_reader, dash_cam, cellular_modem, haptic_*
  deviceSerial: text("device_serial").notNull(),
  firmwareVersion: text("firmware_version"),
  status: text("status").notNull().default("active"), // active, offline, retired, fault
  batteryLevel: integer("battery_level").default(100),
  signalStrength: integer("signal_strength").default(-75), // dBm
  syncIntervalSeconds: integer("sync_interval_seconds").notNull().default(30),
  lastSync: integer("last_sync", { mode: "timestamp" }),
  registeredAt: integer("registered_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const eldTelemetry = sqliteTable("eld_telemetry", {
  id: text("id").primaryKey(),
  deviceId: text("device_id").notNull(),
  driverId: text("driver_id").notNull(),
  speedMph: real("speed_mph"),
  rpm: integer("rpm"),
  engineHours: real("engine_hours"),
  odometer: real("odometer"),
  lat: real("lat"),
  lng: real("lng"),
  harshBrake: integer("harsh_brake", { mode: "boolean" }).default(false),
  harshAccel: integer("harsh_accel", { mode: "boolean" }).default(false),
  laneDeparture: integer("lane_departure", { mode: "boolean" }).default(false),
  fatigueScore: integer("fatigue_score"), // 0 alert .. 100 critical
  recordedAt: integer("recorded_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ── Dispatch compliance ─────────────────────────────────────────────────────
export const dispatchComplianceLog = sqliteTable("dispatch_compliance_log", {
  id: text("id").primaryKey(),
  loadId: text("load_id"),
  driverId: text("driver_id"),
  originState: text("origin_state"),
  destinationState: text("destination_state"),
  distanceMiles: real("distance_miles"),
  estimatedDriveHours: real("estimated_drive_hours"),
  status: text("status").notNull().default("clear"), // clear, warning, critical
  alerts: text("alerts"), // JSON
  estimatedFuelTax: real("estimated_fuel_tax"),
  checkedAt: integer("checked_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ── DOT physical failure recovery ───────────────────────────────────────────
export const healthRecoveryPlans = sqliteTable("health_recovery_plans", {
  id: text("id").primaryKey(),
  driverId: text("driver_id").notNull(),
  failureCategory: text("failure_category").notNull(), // VISION, HEARING, BLOOD_PRESSURE, ...
  failureDetails: text("failure_details"), // JSON
  status: text("status").notNull().default("active"), // active, retest_ready, cleared, abandoned
  completedSteps: text("completed_steps"), // JSON number[]
  minDays: integer("min_days").notNull().default(30),
  maxDays: integer("max_days").notNull().default(90),
  estimatedCost: text("estimated_cost"),
  retestEarliest: integer("retest_earliest", { mode: "timestamp" }),
  retestLatest: integer("retest_latest", { mode: "timestamp" }),
  retestScheduled: integer("retest_scheduled", { mode: "timestamp" }),
  clearedAt: integer("cleared_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ── Checkout fraud screening (server-side, replaces the client-side mock) ────
export const checkoutScreenings = sqliteTable("checkout_screenings", {
  id: text("id").primaryKey(),
  transactionId: text("transaction_id"),
  ipAddress: text("ip_address"),
  amount: real("amount"),
  paymentMethod: text("payment_method"),
  riskScore: integer("risk_score").notNull(),
  riskLevel: text("risk_level").notNull(), // low, elevated, high, critical
  recommendation: text("recommendation").notNull(), // allow, verify, block
  requiresVerification: integer("requires_verification", { mode: "boolean" }).notNull().default(false),
  riskFactors: text("risk_factors"), // JSON
  source: text("source").notNull().default("heuristic"), // apifreaks | heuristic
  live: integer("live", { mode: "boolean" }).notNull().default(false),
  actionTaken: text("action_taken"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ── Customer support tickets ─────────────────────────────────────────────────
export const supportTickets = sqliteTable("support_tickets", {
  id: text("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull(),
  category: text("category").notNull(), // TECHNICAL, BILLING, COMPLIANCE, ...
  priority: text("priority").notNull().default("normal"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  driverId: text("driver_id"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  status: text("status").notNull().default("open"), // open, in_progress, resolved, closed
  resolution: text("resolution"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ── RideWithEase (second product: bike / car courier) ────────────────────────
// Separate product from TruckWithEase. No FMCSA/HOS surface here — a bicycle
// courier is not a CMV driver and none of 49 CFR 395 applies to them.
export const rideCouriers = sqliteTable("ride_couriers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  vehicleType: text("vehicle_type").notNull(), // ebike, road_bike, cargo_bike, hybrid, fat_tire_ebike, car, scooter
  city: text("city"),
  platforms: text("platforms"), // JSON array of platform keys the courier actually works
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const rideDeliveries = sqliteTable("ride_deliveries", {
  id: text("id").primaryKey(),
  courierId: text("courier_id").notNull(),
  platform: text("platform").notNull(),
  externalId: text("external_id"), // the platform's own order id, if the courier types it in
  pickupAddress: text("pickup_address"),
  dropoffAddress: text("dropoff_address"),
  distanceMi: real("distance_mi"),
  payout: real("payout"),
  tip: real("tip"),
  platformFee: real("platform_fee"),
  status: text("status").notNull().default("pending"), // pending, in_progress, delivered, cancelled
  proofPhotoUrl: text("proof_photo_url"),
  acceptedAt: integer("accepted_at", { mode: "timestamp" }),
  deliveredAt: integer("delivered_at", { mode: "timestamp" }),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const rideExpenses = sqliteTable("ride_expenses", {
  id: text("id").primaryKey(),
  courierId: text("courier_id").notNull(),
  category: text("category").notNull(), // gear, maintenance, platform_fee, phone, insurance, charging, other
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  businessPct: integer("business_pct").notNull().default(100),
  receiptUrl: text("receipt_url"),
  incurredAt: integer("incurred_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const rideMaintenance = sqliteTable("ride_maintenance", {
  id: text("id").primaryKey(),
  courierId: text("courier_id").notNull(),
  item: text("item").notNull(), // chain_lube, tires, brake_pads, battery, ...
  lastServiceAt: integer("last_service_at", { mode: "timestamp" }),
  lastServiceMi: real("last_service_mi"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ─────────────────────────────────────────────────────────────────────────────
// Signup, subscriptions, A2P and billing cases.
//
// These five tables back legacy pages that were writing to PocketBase
// collections that never existed on any server: SignupPage, SubscriptionsAdminPage,
// A2PRegistrationPage and SupportAgentBilling. Every submit on those pages
// showed a success message and threw the record away.
// ─────────────────────────────────────────────────────────────────────────────

export const signups = sqliteTable("signups", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  phone: text("phone"),
  company: text("company"),
  mcNumber: text("mc_number"),
  dotNumber: text("dot_number"),
  fleetSize: integer("fleet_size"),
  role: text("role").notNull().default("driver"), // driver, owner_operator, dispatcher, fleet_manager
  plan: text("plan"), // solo, pro, fleet_lease, fleet_owned
  vehicleWorld: text("vehicle_world").notNull().default("truck"), // truck, car, bike
  source: text("source"), // reddit_beta, referral, landing, trial_link
  trialCode: text("trial_code"),
  status: text("status").notNull().default("new"), // new, contacted, activated, rejected
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const trialLinks = sqliteTable("trial_links", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  label: text("label"),
  plan: text("plan"),
  trialDays: integer("trial_days").notNull().default(14),
  maxUses: integer("max_uses"),
  uses: integer("uses").notNull().default(0),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdBy: text("created_by"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  signupId: text("signup_id"),
  accountName: text("account_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  plan: text("plan").notNull(), // solo, pro, fleet_lease, fleet_owned
  seats: integer("seats").notNull().default(1),
  trucks: integer("trucks").notNull().default(0),
  unitPrice: real("unit_price").notNull(),
  status: text("status").notNull().default("trialing"), // trialing, active, past_due, cancelled
  trialEndsAt: integer("trial_ends_at", { mode: "timestamp" }),
  startedAt: integer("started_at", { mode: "timestamp" }),
  cancelledAt: integer("cancelled_at", { mode: "timestamp" }),
  cancelReason: text("cancel_reason"),
  // Set only when a real payment provider has the record. Null means nobody
  // has ever been charged for this row.
  provider: text("provider"),
  providerRef: text("provider_ref"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const billingCases = sqliteTable("billing_cases", {
  id: text("id").primaryKey(),
  subscriptionId: text("subscription_id"),
  contactEmail: text("contact_email").notNull(),
  category: text("category").notNull(), // overcharge, refund, failed_payment, plan_change, invoice_request, cancellation, other
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  amountDisputed: real("amount_disputed"),
  priority: text("priority").notNull().default("normal"), // low, normal, high
  status: text("status").notNull().default("open"), // open, in_review, resolved, refunded, rejected
  assignedTo: text("assigned_to"),
  resolution: text("resolution"),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const a2pRegistrations = sqliteTable("a2p_registrations", {
  id: text("id").primaryKey(),
  legalBusinessName: text("legal_business_name").notNull(),
  dbaName: text("dba_name"),
  ein: text("ein"),
  businessType: text("business_type"), // sole_proprietor, llc, corporation, partnership, non_profit
  street: text("street"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country").notNull().default("US"),
  website: text("website"),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  useCaseCategory: text("use_case_category"), // mixed, customer_care, 2fa, marketing, delivery_notification
  useCaseDescription: text("use_case_description"),
  sampleMessages: text("sample_messages"), // JSON array
  optInDescription: text("opt_in_description"),
  optInProofUrl: text("opt_in_proof_url"),
  estimatedMonthlyVolume: integer("estimated_monthly_volume"),
  // Assigned by The Campaign Registry THROUGH a messaging provider. Null until
  // a real provider account submits this brand/campaign.
  provider: text("provider"),
  brandId: text("brand_id"),
  campaignId: text("campaign_id"),
  // Twilio TrustHub bundle SIDs. Required by Twilio before a brand can be filed.
  // Created in the Twilio console (Trust Hub > Customer Profiles / A2P Profile).
  customerProfileBundleSid: text("customer_profile_bundle_sid"),
  a2pProfileBundleSid: text("a2p_profile_bundle_sid"),
  lastCarrierResponse: text("last_carrier_response"),
  status: text("status").notNull().default("draft"), // draft, ready, submitted, approved, rejected
  submittedAt: integer("submitted_at", { mode: "timestamp" }),
  decisionAt: integer("decision_at", { mode: "timestamp" }),
  rejectionReason: text("rejection_reason"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ── Twilio account setup: domain verification + Trust Hub bundles ────────────
// Twilio verifies domain ownership with a DNS TXT record. Nothing here proves
// verification by itself — `verifiedAt` is only set after a real DNS lookup
// finds the token in the zone.
export const twilioDomainVerifications = sqliteTable("twilio_domain_verifications", {
  id: text("id").primaryKey(),
  domain: text("domain").notNull(),
  token: text("token").notNull(),
  recordName: text("record_name"),
  purpose: text("purpose"), // link_shortening, organization, messaging
  lastCheckedAt: integer("last_checked_at", { mode: "timestamp" }),
  lastCheckResult: text("last_check_result"),
  verifiedAt: integer("verified_at", { mode: "timestamp" }),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ── Accessibility (from the pasted PocketBase schema, rebuilt server-side) ───
export const driverAccessibility = sqliteTable("driver_accessibility", {
  id: text("id").primaryKey(),
  driverId: text("driver_id").notNull(),
  preferredLanguage: text("preferred_language").notNull().default("en"),
  needs: text("needs"), // json array: deaf, hard_of_hearing, low_vision, dyslexia, ...
  captionsEnabled: integer("captions_enabled", { mode: "boolean" }).notNull().default(false),
  hapticsEnabled: integer("haptics_enabled", { mode: "boolean" }).notNull().default(false),
  signLanguage: text("sign_language"), // ASL, BSL, LSF, ...
  hapticDevice: text("haptic_device"), // phone, smartwatch, steering_wheel, dashboard
  vehicleWorld: text("vehicle_world").notNull().default("truck"), // truck, car, bike
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const hapticEvents = sqliteTable("haptic_events", {
  id: text("id").primaryKey(),
  driverId: text("driver_id").notNull(),
  patternType: text("pattern_type").notNull(),
  sequence: text("sequence"), // json array of ms on/off
  deviceType: text("device_type").notNull().default("phone"),
  urgency: text("urgency").notNull().default("low"), // low, medium, high, critical
  message: text("message"),
  delivered: integer("delivered", { mode: "boolean" }).notNull().default(false),
  deliveryNote: text("delivery_note"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// One table for caption / translation / sign-language requests. Nothing is
// fulfilled until a real provider is connected — `fulfilled` stays false and
// `note` says why. No fabricated confidence scores, no fake media urls.
export const accessibilityRequests = sqliteTable("accessibility_requests", {
  id: text("id").primaryKey(),
  driverId: text("driver_id").notNull(),
  kind: text("kind").notNull(), // caption, translation, sign_language
  sourceText: text("source_text"),
  sourceLanguage: text("source_language").notNull().default("en"),
  targetLanguage: text("target_language"),
  resultText: text("result_text"),
  resultSource: text("result_source"), // static_catalog | provider | null
  provider: text("provider"), // null until a real one is wired
  fulfilled: integer("fulfilled", { mode: "boolean" }).notNull().default(false),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Load board seats. Credentials are NOT stored here — `credentialRef` points at
// an api_key_vault row (AES-256-GCM). A password hash cannot be used to log in,
// so the pasted `password_hash` field was dropped on purpose.
export const loadBoardLicenses = sqliteTable("load_board_licenses", {
  id: text("id").primaryKey(),
  driverId: text("driver_id").notNull(),
  fleetId: text("fleet_id"),
  service: text("service").notNull(), // dat, uber_freight, truckstop, internal
  username: text("username"),
  credentialRef: text("credential_ref"), // api_key_vault.id, null = no credential stored
  status: text("status").notNull().default("pending"), // pending, active, expired, revoked
  seatLabel: text("seat_label"),
  purchased: integer("purchased", { mode: "boolean" }).notNull().default(false),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  loginCount: integer("login_count").notNull().default(0),
  revokedReason: text("revoked_reason"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ── Safety scoring ──────────────────────────────────────────────────────────
// Composite driver safety score. Every component is computed from rows that
// actually exist (hos_logs, dvir_inspections, hr_occurrences, speeding_events,
// eld_telemetry). There is deliberately no `accidentRisk` column: the platform
// has no crash-outcome dataset, so an accident-probability number would be
// invented. The API returns accidentRisk: null for that reason.
export const safetyScores = sqliteTable("safety_scores", {
  id: text("id").primaryKey(),
  driverId: text("driver_id").notNull(),
  score: integer("score"),                       // 0-100, null when insufficient data
  grade: text("grade"),                          // platinum, gold, silver, needs_work, at_risk
  windowDays: integer("window_days").notNull().default(30),
  milesDriven: real("miles_driven").notNull().default(0),
  speedingComponent: integer("speeding_component"),
  hosComponent: integer("hos_component"),
  dvirComponent: integer("dvir_component"),
  violationComponent: integer("violation_component"),
  fatigueComponent: integer("fatigue_component"),
  insufficientData: integer("insufficient_data", { mode: "boolean" }).notNull().default(true),
  missing: text("missing"),                      // JSON array of component names with no data
  note: text("note"),
  computedAt: integer("computed_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const speedingEvents = sqliteTable("speeding_events", {
  id: text("id").primaryKey(),
  driverId: text("driver_id").notNull(),
  truckUnit: text("truck_unit"),
  speedMph: real("speed_mph").notNull(),
  limitMph: real("limit_mph").notNull(),
  overBy: real("over_by").notNull(),
  severity: text("severity").notNull().default("minor"), // minor (1-9), moderate (10-14), severe (15+)
  lat: real("lat"),
  lng: real("lng"),
  roadName: text("road_name"),
  source: text("source").notNull().default("eld"),       // eld, gps, manual, citation
  occurredAt: integer("occurred_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/**
 * Fleet Memory — driver-sourced intelligence on brokers, shippers, receivers and stops.
 *
 * These four tables replace four PocketBase collections that legacy/lib/fleetMemory.js
 * wrote to and that never existed on any server. They were not in SERVER_COLLECTIONS,
 * so every note, rating and stop review lived in one browser's localStorage and the
 * "cross-fleet intelligence" pages rendered an empty array as if the fleet were clean.
 */

export const activityLog = sqliteTable("activity_log", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  module: text("module").notNull(),
  actionType: text("action_type").notNull(),
  detail: text("detail"),
  value: text("value"),
  device: text("device"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const fleetNotes = sqliteTable("fleet_intelligence_notes", {
  id: text("id").primaryKey(),
  entityName: text("entity_name").notNull(),
  entityNameKey: text("entity_name_key").notNull(),   // lowercased, trimmed — what lookups match on
  entityType: text("entity_type").notNull(),          // Broker, Shipper, Receiver
  noteType: text("note_type").notNull(),              // Payment Issue, Detention, Facility, Safety, Other
  severity: text("severity").notNull().default("Medium"), // Critical, High, Medium, Low
  noteText: text("note_text").notNull(),
  fleetName: text("fleet_name"),
  driverName: text("driver_name"),
  loadNumber: text("load_number"),
  mcNumber: text("mc_number"),
  resolved: integer("resolved", { mode: "boolean" }).notNull().default(false),
  sessionId: text("session_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const entityRatings = sqliteTable("shipper_broker_ratings", {
  id: text("id").primaryKey(),
  companyName: text("company_name").notNull(),
  companyNameKey: text("company_name_key").notNull(),
  companyType: text("company_type").notNull().default("Broker"),
  rating: integer("rating").notNull(),                // 1-5, submitted by a driver
  paySpeed: text("pay_speed"),
  communication: text("communication"),
  reviewText: text("review_text"),
  mcNumber: text("mc_number"),
  sessionId: text("session_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const stopFeedback = sqliteTable("route_stop_feedback", {
  id: text("id").primaryKey(),
  stopName: text("stop_name").notNull(),
  stopNameKey: text("stop_name_key").notNull(),
  vehicleType: text("vehicle_type").notNull().default("truck"),
  rating: integer("rating").notNull(),                // +1 thumbs up, -1 thumbs down
  routeOrigin: text("route_origin"),
  routeDest: text("route_dest"),
  sessionId: text("session_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/**
 * Week In Review — weekly driver recap.
 *
 * The legacy page constructed its own `new PocketBase()` client and wrote to a
 * `week_reviews` collection that existed on no server, so every emailed-recap
 * signup lived in one browser's localStorage. This table is the real store for
 * the recap subscription; the recap figures themselves are aggregated live from
 * trips / loads / hos_logs / dvir_inspections / speeding_events / safety_scores
 * and are never persisted as a snapshot of invented numbers.
 */
export const weekReviewSubscriptions = sqliteTable("week_review_subscriptions", {
  id: text("id").primaryKey(),
  driverId: text("driver_id"),
  email: text("email").notNull(),
  weekEnding: text("week_ending"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/**
 * Driver Algorithm — the per-driver learning layer.
 *
 * Jeremiah asked for the agents to "gain the algorithm of the user" across driving
 * skill, customer frequency, loads and routes. The honest way to do that is to learn
 * from what the driver actually did, never from a model's guess about him.
 *
 * driver_signals is the capture layer that did not exist. Nothing in the app recorded
 * a decision — which load was taken, which was passed, which broker was worked, which
 * lane was run — so there was no history for any algorithm to read. Every row here is
 * an observed event with a real source, written at the moment it happens.
 *
 * driver_patterns is the computed rollup. It stores sampleCount alongside every value
 * so the UI and the agents can refuse to act on a pattern built from two data points.
 * A pattern is never invented: if there are no signals, there is no row, and the
 * caller renders NOT ENOUGH DATA with the real count.
 */

export const driverSignals = sqliteTable("driver_signals", {
  id: text("id").primaryKey(),
  driverId: text("driver_id").notNull(),
  // dimension: driving | customer | load | route
  dimension: text("dimension").notNull(),
  // kind: load_accepted, load_declined, lane_run, broker_worked, hard_brake,
  // speeding, dvir_defect, shift_start, break_taken, route_planned, fuel_stop
  kind: text("kind").notNull(),
  subject: text("subject"),              // broker name, lane string, road name, equipment
  numericValue: real("numeric_value"),   // rate, rpm, miles, mph over, hours
  unit: text("unit"),                    // usd, usd_per_mile, miles, mph, seconds
  source: text("source").notNull(),      // which endpoint or user action produced this
  meta: text("meta"),                    // JSON blob of the raw observation
  occurredAt: integer("occurred_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});


/**
 * TRAXES — scanned document store and the financial/tax record built from it.
 *
 * One row per document a driver actually captured. `docKey` is the object-storage
 * key written by /api/storage/presign-upload; the file itself never passes through
 * this server and no presigned URL is persisted (they expire).
 *
 * Every money field is nullable on purpose. If the OCR pass could not read a
 * number off the page, the column stays null and the UI renders MISSING with the
 * reason from `ocrNote` — TRAXES never invents an amount. `ocrConfidence` stays
 * null unless the provider actually returns a confidence value; Gemini does not,
 * so it is null today.
 *
 * TRAXES is a record-keeper and a calculator. It does not file anything with any
 * tax authority and it makes no claim of IRS acceptance.
 */
export const traxesRecords = sqliteTable("traxes_records", {
  id: text("id").primaryKey(),
  driverId: text("driver_id").notNull(),
  // kind: bol | rate_confirmation | invoice | fuel_receipt | lumper_receipt |
  //       scale_ticket | toll_receipt | repair_invoice | permit | other
  kind: text("kind").notNull().default("other"),
  // category drives the tax rollup: revenue | fuel | tolls | lumper | scale |
  //       repair | permit | insurance | meals | supplies | other
  category: text("category").notNull().default("other"),
  docKey: text("doc_key"),               // storage key, null if filed without a file
  fileName: text("file_name"),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  broker: text("broker"),
  loadId: text("load_id"),
  reference: text("reference"),           // BOL #, PO #, invoice #, pro #
  vendor: text("vendor"),                 // truck stop, repair shop, lumper service
  amount: real("amount"),                 // null when unreadable — never guessed
  currency: text("currency").default("USD"),
  taxYear: integer("tax_year"),
  occurredAt: integer("occurred_at", { mode: "timestamp" }),
  deductible: integer("deductible", { mode: "boolean" }).notNull().default(true),
  ocrRaw: text("ocr_raw"),                // the model's raw JSON reply, kept for audit
  ocrNote: text("ocr_note"),              // plain-English reason a field came back null
  ocrModel: text("ocr_model"),
  ocrConfidence: real("ocr_confidence"),  // null — provider returns none
  // status: captured | extracted | filed | needs_review
  status: text("status").notNull().default("captured"),
  // destination: dispatch | link | none
  destination: text("destination").notNull().default("none"),
  destinationNote: text("destination_note"),
  sentAt: integer("sent_at", { mode: "timestamp" }),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/**
 * low_bridges — clearance advisory data, imported from the FHWA National Bridge
 * Inventory (NBI). Nothing here is invented: every row comes from the federal
 * 2025 delimited all-states file (2025HwyBridgesDelimitedAllStates.txt).
 *
 * The field that matters for truck strikes is NBI ITEM 54B, "Minimum Vertical
 * Underclearance" — the clearance UNDER the structure for the road or railway
 * passing beneath it. ITEM 53 (vertical clearance OVER the bridge roadway) is a
 * different number and is NOT used here.
 *
 * Honesty limits, surfaced in the UI:
 *  - NBI is annual and self-reported by the states. Local/municipal bridges and
 *    many railroad overpasses are missing or carry blank clearance fields.
 *  - This is a clearance ADVISORY layer, not truck-legal routing.
 *  - 99.99 m in the source means "no restriction recorded", not "measured".
 */
export const lowBridges = sqliteTable("low_bridges", {
  id: text("id").primaryKey(),
  structureNumber: text("structure_number").notNull(), // NBI item 8
  stateCode: text("state_code").notNull(),             // NBI item 1 (FIPS)
  stateAbbr: text("state_abbr").notNull(),
  countyCode: text("county_code"),                     // NBI item 3
  lat: real("lat").notNull(),                          // decimal degrees, from item 16
  lng: real("lng").notNull(),                          // decimal degrees, from item 17
  clearanceIn: integer("clearance_in").notNull(),      // item 54B converted to inches
  clearanceM: real("clearance_m").notNull(),           // item 54B as published (meters)
  underRef: text("under_ref").notNull(),               // item 54A: H = highway, R = railroad
  featureUnder: text("feature_under"),                 // item 6A
  facilityCarried: text("facility_carried"),           // item 7
  location: text("location"),                          // item 9
  openPosted: text("open_posted"),                     // item 41
  suspect: integer("suspect", { mode: "boolean" }).notNull().default(false),
  nbiYear: integer("nbi_year").notNull(),
  source: text("source").notNull().default("FHWA NBI"),
  importedAt: integer("imported_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/**
 * dispatch_decisions — DISPATCH ZERO: a signed, tamper-evident record of WHY a
 * load was assigned to a driver, written at the moment of assignment.
 *
 * Every row stores the exact inputs the dispatcher had (HOS clocks, route,
 * low-bridge clearance scan, safety score, economics), which of those inputs
 * were LIVE vs MISSING, the verdict, and a SHA-256 hash chain:
 *
 *   payloadHash = sha256(canonicalJson(decision))
 *   chainHash   = sha256(seq + "|" + prevHash + "|" + payloadHash)
 *
 * What the chain proves: the record has not been altered or back-dated after
 * the fact. What it does NOT prove: that the inputs were correct. Route data
 * comes from Google Directions, which has no truck profile; the clearance layer
 * is an advisory built on the annual, self-reported federal NBI.
 *
 * Nothing here is ever recomputed or rewritten. Rows are append-only.
 */
export const dispatchDecisions = sqliteTable("dispatch_decisions", {
  id: text("id").primaryKey(),
  seq: integer("seq").notNull(),                        // monotonic, 1-based
  loadId: text("load_id"),
  driverId: text("driver_id"),
  verdict: text("verdict").notNull(),                   // go | blocked | advisory
  scoreJson: text("score_json").notNull(),              // ranked candidate snapshot
  inputsJson: text("inputs_json").notNull(),            // which of the 7 inputs were live
  blockersJson: text("blockers_json").notNull(),        // hard stops at decision time
  unverifiedJson: text("unverified_json").notNull(),    // inputs we did NOT have
  revenuePerClockHour: real("revenue_per_clock_hour"),  // null when clock is 0
  payloadHash: text("payload_hash").notNull(),
  prevHash: text("prev_hash").notNull(),
  chainHash: text("chain_hash").notNull(),
  decidedBy: text("decided_by").notNull().default("dispatch"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

/**
 * Responsible Use Agreement acceptances.
 *
 * The page that collects this used to record NOTHING — it showed a screen
 * warning of "account suspension, permanent ban, or legal action", then on
 * submit called console.log(). An agreement nobody stores is not an agreement.
 *
 * One row per accepted agreement version per user. Append-only: a later
 * acceptance of a NEW version is a new row, never an update, so the history of
 * what a driver actually agreed to and when survives a wording change.
 *
 * termsVersion is a sha256 of the exact pledge text the user was shown, computed
 * server-side. If the wording changes, the hash changes, and prior acceptances
 * no longer count as acceptance of the new text.
 */
export const responsibleUseAcceptances = sqliteTable("responsible_use_acceptances", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userEmail: text("user_email"),
  locale: text("locale").notNull(),               // locale the pledges were displayed in
  localeStatus: text("locale_status").notNull(),  // TRANSLATED | ENGLISH_ONLY — was the text actually translated
  termsVersion: text("terms_version").notNull(),  // sha256 of the pledge text shown
  pledgeCount: integer("pledge_count").notNull(),
  acceptedAll: integer("accepted_all", { mode: "boolean" }).notNull(),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Better Auth tables (user, session, account, verification) — generated by the
// Better Auth CLI into auth-schema.ts and re-exported here so Drizzle push and
// every db import see one schema. Do not hand-edit auth-schema.ts; regenerate it.
export * from "./auth-schema";

/**
 * Role assignment for authenticated users.
 *
 * Kept OUT of the Better Auth `user` table on purpose: auth-schema.ts is
 * generated by the Better Auth CLI and gets overwritten on regeneration, so a
 * hand-added column there would silently disappear. Roles live here, one row
 * per user, and every assignment records who made it.
 *
 * Absence of a row means role "driver". New accounts are NEVER admin.
 */
export const userRoles = sqliteTable("user_roles", {
  userId: text("user_id").primaryKey(),
  role: text("role").notNull().default("driver"), // driver | dispatch | hr | admin
  assignedBy: text("assigned_by"), // user id of the assigner, or "bootstrap"
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
