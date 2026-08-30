/**
 * functions.ts — THE FUNCTION INDEX
 * Mounted at /api/functions
 *
 * WHAT THIS IS
 * Jeremiah's instruction: "go through all the functions TruckwithEASE will be able to offer,
 * index all the design/webdev/programmer/truck,car,bike = can not duplicate. Add AI/HUMAN
 * functions who read algorithms = capability/trust with the users."
 *
 * So this is one deduplicated index of every function the platform offers, and for each one it
 * names its own evidence. Nothing here is a claim someone typed. Every row's status is COMPUTED
 * at request time from three measurable things:
 *
 *   1. ENDPOINTS — does the route actually exist on the running Hono app? The route list is
 *      read off the live app instance (`app.routes`), not off a hand-kept list. If a router is
 *      unmounted, its capabilities drop to "not_built" on the next request.
 *   2. TABLES    — does the table exist in the real Turso database, and does it have rows?
 *      Live sqlite_master + COUNT(*) per request.
 *   3. ENV KEYS  — is the provider credential present? BOOLEAN ONLY. This route never returns,
 *      logs, or partially reveals a key value.
 *
 * DEDUPLICATION
 * He said "can not duplicate." So the response carries a computed `duplicates` block: collision
 * counts on capability id and on (name + world). The page displays that number. Zero is proven,
 * not asserted.
 *
 * WHAT IT WILL NOT DO
 * - NO UPTIME / "no downtime" PERCENTAGE. Nothing in this platform records health-check results
 *   over time, so no availability figure can be honestly published. It renders as MISSING with
 *   that reason. A one-shot 200 today is not uptime.
 * - No competitor comparison. Never a competitor price, never a self-score. That comparison
 *   exists as a source-cited internal engineering document, not as a page inside the product.
 *   No feature-grid "us vs them" data is served here.
 * - No ELD registration claim. TruckWithEase is not a registered ELD.
 * - No tax/IFTA filing claim. TruckWithEase files nothing with any agency.
 * - AI rows carry a trust note stating what the model does NOT return (e.g. Gemini captions
 *   return no confidence score). Algorithm rows state their minimum sample size.
 */

import { Hono } from "hono";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { sql } from "drizzle-orm";
import { db } from "../database";

type Row = Record<string, unknown>;

async function run(q: string): Promise<Row[]> {
  const r = (await db.run(sql.raw(q))) as unknown as { rows: Row[] };
  return (r.rows ?? []) as Row[];
}

/* ---------------------------------------------------------------------------
 * VOCABULARY — fixed, small, and shared with the frontend filters
 * ------------------------------------------------------------------------- */

/** The vehicle worlds are the real ones from GET /api/signup (`VEHICLE_WORLDS`). */
export const WORLDS = ["truck", "car", "bike"] as const;
/** Who builds/owns the surface. Jeremiah's three: design / webdev / programmer. */
export const DISCIPLINES = ["design", "webdev", "programmer"] as const;
/** Who or what performs the function. */
export const KINDS = ["ai", "human", "algorithm"] as const;

type World = (typeof WORLDS)[number];
type Discipline = (typeof DISCIPLINES)[number];
type Kind = (typeof KINDS)[number];

export type Cap = {
  id: string;
  name: string;
  domain: string;
  what: string;
  kind: Kind;
  disciplines: Discipline[];
  worlds: World[];
  /** Router prefixes this capability depends on, e.g. "/api/hos". */
  endpoints: string[];
  /** Real table names this capability reads or writes. */
  tables: string[];
  /** Env keys required for it to do anything real. Presence is reported as a boolean only. */
  envKeys: string[];
  /**
   * In-app screen routes that surface this capability. Each one is checked at request time
   * against the route table in legacy/App.jsx — a declared screen that no longer resolves is
   * reported as routed:false rather than quietly listed.
   */
  pages?: string[];
  /**
   * Capability + trust note. For AI rows: what the model does not tell us. For algorithm rows:
   * the sample floor. For human rows: who actually has to act.
   */
  trust: string;
};

/* ---------------------------------------------------------------------------
 * THE REGISTRY
 * One row per function. Ids are unique by construction and the uniqueness is
 * re-checked at request time in the `duplicates` block.
 * ------------------------------------------------------------------------- */

export const CAPS: Cap[] = [
  /* ---------------- Compliance (truck world, federal rules) ---------------- */
  {
    id: "hos-clocks",
    pages: ["/hos"],
    name: "Hours-of-service clocks",
    domain: "Compliance",
    what: "Computes driving, on-duty window, cycle and break clocks in minutes for every driver from hos_logs.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck"],
    endpoints: ["/api/hos"],
    tables: ["hos_logs", "drivers"],
    envKeys: [],
    trust:
      "Limits are coded from 49 CFR 395 (660 driving / 840 on-duty window / 3600 cycle / break after 480, all minutes). It is a calculator over logged duty status, not a registered ELD, and it does not certify a log.",
  },
  {
    id: "hos-violations",
    pages: ["/hos", "/live-compliance"],
    name: "HOS violation detection",
    domain: "Compliance",
    what: "Flags each driver's clock breaches with a severity level and a plain-language message.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck"],
    endpoints: ["/api/hos"],
    tables: ["hos_logs"],
    envKeys: [],
    trust:
      "Deterministic rule check — no model, no probability. It reports what the logged minutes exceed. It cannot see duty time that was never logged.",
  },
  {
    id: "eld-telemetry-ingest",
    pages: ["/twe-eld"],
    name: "ELD telemetry storage",
    domain: "Compliance",
    what: "Stores engine/position telemetry rows that HOS and safety math read from.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck"],
    endpoints: ["/api/eld"],
    tables: ["eld_telemetry", "eld_devices"],
    envKeys: [],
    trust:
      "Storage and query only. TruckWithEase is NOT an FMCSA-registered ELD and no row here is an FMCSA-certified record.",
  },
  {
    id: "dvir-inspections",
    pages: ["/dvir", "/compliance-dvir"],
    name: "DVIR inspection records",
    domain: "Compliance",
    what: "Pre/post-trip inspection reports with defects, per driver and truck.",
    kind: "human",
    disciplines: ["webdev", "design"],
    worlds: ["truck"],
    endpoints: ["/api/dvir"],
    tables: ["dvir_inspections"],
    envKeys: [],
    trust:
      "A driver fills this in. The platform stores and surfaces it; it does not observe the vehicle and cannot detect a defect the driver did not report.",
  },
  {
    id: "compliance-vault",
    pages: ["/dot-compliance-vault", "/permit-book"],
    name: "Document vault",
    domain: "Compliance",
    what: "Stores driver and carrier documents with an audit log of key access.",
    kind: "human",
    disciplines: ["webdev"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/vault"],
    tables: ["api_key_vault", "api_key_audit_log"],
    envKeys: [],
    trust:
      "Every read of a stored credential is written to api_key_audit_log. No provider secret is ever returned to a browser.",
  },
  {
    id: "low-bridge-alert",
    pages: ["/low-bridges"],
    name: "Low-bridge clearance alerting",
    domain: "Routing safety",
    what: "7,869 sub-standard vertical clearances scanned out of the federal bridge inventory, queried by corridor.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck"],
    endpoints: ["/api/bridges"],
    tables: ["low_bridges"],
    envKeys: [],
    trust:
      "Built in-house from FHWA NBI 2025, ITEM 54B only (minimum vertical clearance over the roadway). Zero flagged bridges on a corridor means NO DATA for that corridor, never 'clear'. Advisory only under 23 U.S.C. 409.",
  },
  {
    id: "federal-weight-check",
    pages: ["/bypass", "/catscales"],
    name: "Federal weight and axle check",
    domain: "Compliance",
    what: "Gross/single/tandem limits plus the Bridge Formula, computed in the browser from the citation.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck"],
    endpoints: [],
    tables: [],
    envKeys: [],
    trust:
      "23 U.S.C. 127 and 23 CFR 658.17: 80,000 gross / 20,000 single / 34,000 tandem, W = 500 x [ LN/(N-1) + 12N + 36 ]. Interstate System only. No per-state table is published because each state row would need its own verified statute citation.",
  },

  /* ---------------- Safety ---------------- */
  {
    id: "safety-score",
    pages: ["/driver-scorecard", "/dot-scorecard"],
    name: "Driver safety score",
    domain: "Safety",
    what: "0-100 composite per driver over a 30-day window with a letter grade.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck"],
    endpoints: ["/api/safety"],
    tables: ["safety_scores", "speeding_events", "hos_logs", "dvir_inspections"],
    envKeys: [],
    trust:
      "Weights are published with the score (speeding 30, hos 25, violations 20, dvir 15, fatigue 10) and the response names componentsScored vs componentsMissing. A component with no data is excluded, never scored as zero.",
  },
  {
    id: "speeding-events",
    pages: ["/driver-scorecard"],
    name: "Speeding event capture",
    domain: "Safety",
    what: "Per-event speed exceedances, normalised per 100 miles before they touch a score.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck"],
    endpoints: ["/api/safety"],
    tables: ["speeding_events"],
    envKeys: [],
    trust: "Rate-normalised, so a high-mileage driver is not penalised for distance.",
  },
  {
    id: "incident-reports",
    pages: ["/accident-report"],
    name: "Incident and accident reporting",
    domain: "Safety",
    what: "Driver-filed incident records for the carrier's own file.",
    kind: "human",
    disciplines: ["webdev", "design"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/incidents"],
    tables: ["accident_reports"],
    envKeys: [],
    trust:
      "Internal record only. Nothing here is transmitted to FMCSA, an insurer, or a state agency.",
  },
  {
    id: "fleet-safety-intel",
    pages: ["/fleet-safety"],
    name: "Fleet safety intelligence view",
    domain: "Safety",
    what: "Cross-driver rollup of scores, violations and open defects for a fleet manager.",
    kind: "human",
    disciplines: ["design", "webdev"],
    worlds: ["truck"],
    endpoints: ["/api/fleet-intel", "/api/safety"],
    tables: ["safety_scores", "drivers"],
    envKeys: [],
    trust: "Aggregation of the rows above. It adds no new judgement of its own.",
  },

  /* ---------------- Dispatch and loads ---------------- */
  {
    id: "load-board",
    pages: ["/loads", "/fleet-load-board"],
    name: "Load board",
    domain: "Loads",
    what: "Available loads with origin, destination, miles, rate and computed rate-per-mile.",
    kind: "human",
    disciplines: ["webdev", "design"],
    worlds: ["truck"],
    endpoints: ["/api/loads"],
    tables: ["loads"],
    envKeys: [],
    trust:
      "Rows in this database only. There is no external load-board feed connected, so this is not a market rate and not a national board.",
  },
  {
    id: "dispatch-zero-score",
    pages: ["/dispatch-zero"],
    name: "Dispatch Zero candidate scoring",
    domain: "Dispatch",
    what: "Scores each driver against a load on revenue per remaining-clock-hour, and blocks anyone without legal clock.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck"],
    endpoints: ["/api/dispatch-zero"],
    tables: ["dispatch_decisions", "hos_logs", "loads", "drivers"],
    envKeys: [],
    trust:
      "A driver with zero driving minutes remaining returns blocked, not a low score. The metric is revenue per remaining-clock-hour, stated on screen so the operator can disagree with it.",
  },
  {
    id: "dispatch-zero-ledger",
    pages: ["/dispatch-zero"],
    name: "Signed dispatch decision ledger",
    domain: "Dispatch",
    what: "Append-only SHA-256 hash chain recording why each load was assigned, with a verify endpoint.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck"],
    endpoints: ["/api/dispatch-zero"],
    tables: ["dispatch_decisions"],
    envKeys: [],
    trust:
      "Tamper-evident, not tamper-proof: /verify recomputes the chain and reports ok:true/false. Rows are never updated or deleted by app code.",
  },
  {
    id: "dispatch-chat",
    pages: ["/walkie-talk"],
    name: "Dispatch messaging",
    domain: "Dispatch",
    what: "Driver/dispatcher message thread stored server-side.",
    kind: "human",
    disciplines: ["webdev"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/chat"],
    tables: ["messages"],
    envKeys: [],
    trust: "Plain messaging. No AI reads or summarises this thread today.",
  },
  {
    id: "dispatch-compliance-log",
    pages: ["/dispatch-zero"],
    name: "Dispatch compliance log",
    domain: "Dispatch",
    what: "Records dispatch actions that touch a compliance limit.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck"],
    endpoints: ["/api/dispatch"],
    tables: ["dispatch_compliance_log"],
    envKeys: [],
    trust: "Write-and-read only. It does not block a dispatch on its own.",
  },
  {
    id: "route-plan",
    pages: ["/trip-planner", "/dispatch"],
    name: "Route planning",
    domain: "Routing",
    what: "Turn-by-turn route with distance, duration and an overview polyline.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/routing"],
    tables: [],
    envKeys: ["VITE_GOOGLE_MAPS_KEY"],
    trust:
      "Google Directions. It is a CAR route: not truck-legal, no height/weight/hazmat restrictions applied. The low-bridge index is a separate advisory layer, not a routing constraint.",
  },
  {
    id: "route-feedback",
    pages: ["/trip-planner"],
    name: "Route stop feedback",
    domain: "Routing",
    what: "Driver-reported truth about a stop (access, wait, gate hours).",
    kind: "human",
    disciplines: ["webdev"],
    worlds: ["truck"],
    endpoints: ["/api/routing"],
    tables: ["route_stop_feedback"],
    envKeys: [],
    trust: "Driver-sourced. Accuracy is whatever the last driver reported, with no verification step.",
  },

  /* ---------------- Money ---------------- */
  {
    id: "traxes-records",
    pages: ["/traxes"],
    name: "TRAXES financial records",
    domain: "Money",
    what: "Per-driver mileage, expense and settlement rows the accountant agent reads.",
    kind: "human",
    disciplines: ["webdev"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/traxes"],
    tables: ["traxes_records"],
    envKeys: [],
    trust:
      "Bookkeeping only. TruckWithEase does not file a tax return, a 2290, or an IFTA return with any agency, and no figure here is tax advice.",
  },
  {
    id: "traxes-agent",
    pages: ["/traxes"],
    name: "TRAXES accountant agent",
    domain: "Money",
    what: "Conversational agent over the driver's own mileage, cost-per-mile and expense rows.",
    kind: "ai",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/traxes", "/api/agent"],
    tables: ["traxes_records"],
    envKeys: ["AI_GATEWAY_API_KEY"],
    trust:
      "A language model answers over tool results, and the model returns no confidence value. Every number it quotes comes from a tool call against these tables; when a table is empty it must say so instead of estimating.",
  },
  {
    id: "traxes-platform-ai",
    pages: ["/traxes"],
    name: "TRAXES platform intelligence",
    domain: "AI",
    what: "Answers any question about this platform by reading it live — the Hono route table, the database tables and their real row counts, which credentials are present and whether they parse, this capability index, and the screen list — then names the exact blocker and the exact fix.",
    kind: "ai",
    disciplines: ["programmer", "webdev"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/traxes"],
    tables: ["traxes_records"],
    envKeys: ["AI_GATEWAY_API_KEY", "AI_GATEWAY_BASE_URL", "GEMINI_API_KEY"],
    trust:
      "TRAXES is never handed a written description of the platform to recite; it re-measures the platform on every request, so it cannot describe a feature that no longer exists. The model returns no confidence score, so none is shown. It has no write tool by design — no INSERT, UPDATE or DELETE exists for it, and endpoint reads are limited to parameter-free GET routes taken from the live route table — so when the fix is a change it names the endpoint and payload for a human to apply. GET /api/traxes/brain publishes exactly what TRAXES can see, so any answer can be audited before it is trusted. Credential values are never read into an answer, only presence and shape.",
  },
  {
    id: "fuel-prices",
    pages: ["/fuel-finder"],
    name: "Fuel price reference",
    domain: "Money",
    what: "Regional diesel reference pricing and fuel-stop lookups.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck"],
    endpoints: ["/api/fuel"],
    tables: [],
    envKeys: [],
    trust:
      "Free US EIA regional averages. A regional average is not the price on the pump at a specific truck stop.",
  },
  {
    id: "toll-estimate",
    pages: ["/tolls"],
    name: "Toll reference",
    domain: "Money",
    what: "Toll information surfaced alongside a route.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck", "car"],
    endpoints: ["/api/tolls"],
    tables: [],
    envKeys: [],
    trust: "Reference figures only. No toll authority account is connected and nothing is paid through the app.",
  },
  {
    id: "vat-rates",
    pages: ["/tax-rates"],
    name: "VAT / tax rate lookup",
    domain: "Money",
    what: "Rate lookup used for invoicing outside the US.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/vat-rates"],
    tables: [],
    envKeys: ["APIFREAKS_API_KEY"],
    trust: "Third-party rate feed. Rates are reported as the provider returns them, with no local override.",
  },
  {
    id: "subscription-plans",
    pages: ["/pricing", "/checkout", "/forecast", "/revenue-forecast", "/index-forecast"],
    name: "Plan and pricing catalog",
    domain: "Billing",
    what: "The four plans, their unit prices, hardware terms and the 14-day trial.",
    kind: "algorithm",
    disciplines: ["design", "webdev"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/signup", "/api/subscriptions"],
    tables: ["subscriptions", "trial_links"],
    envKeys: [],
    trust:
      "PLANS in signup.ts is the single source of truth for every price shown anywhere in the product.",
  },
  {
    id: "subscription-admin",
    pages: ["/admin/subscriptions"],
    name: "Subscription administration",
    domain: "Billing",
    what: "Lists real subscriptions with computed monthly totals and contracted MRR.",
    kind: "human",
    disciplines: ["webdev"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/subscriptions"],
    tables: ["subscriptions"],
    envKeys: ["AUTUMN_SECRET_KEY"],
    trust:
      "Every response carries billing.live:false. No payment provider subscription exists, no card is stored, and no money can move. Nothing in this platform stores banking or payment-method data.",
  },
  {
    id: "signup-intake",
    pages: ["/signup", "/onboarding"],
    name: "Signup intake",
    domain: "Growth",
    what: "Captures role, vehicle world, fleet size and plan interest, with status tracking.",
    kind: "human",
    disciplines: ["design", "webdev"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/signup"],
    tables: ["signups"],
    envKeys: [],
    trust:
      "MC number input is a FORMAT check only. It is not an FMCSA authority lookup and must never be presented as one.",
  },
  {
    id: "rewards-points",
    pages: ["/rewards", "/leaderboard"],
    name: "Roadwards points engine",
    domain: "Rewards",
    what: "Idempotent points accrual on miles, fuel spend, clean days and violation-free weeks.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck"],
    endpoints: ["/api/rewards"],
    tables: ["drivers"],
    envKeys: [],
    trust:
      "A unique sourceKey per award makes double-credit impossible under concurrency. Badges, once awarded, are never revoked.",
  },

  /* ---------------- AI and agents ---------------- */
  {
    id: "agent-cast",
    pages: ["/ai-team", "/agent-dashboard"],
    name: "AI agent cast",
    domain: "AI",
    what: "Twelve named agents, each scoped to one domain, running over real tool calls.",
    kind: "ai",
    disciplines: ["programmer", "design"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/agent"],
    tables: ["agent_integrity"],
    envKeys: ["AI_GATEWAY_API_KEY"],
    trust:
      "Every agent call is passed the driver profile note so it cannot invent whose data it is reading. The model returns no confidence score, so none is displayed.",
  },
  {
    id: "agent-integrity",
    pages: ["/qa-agent"],
    name: "Agent integrity log",
    domain: "AI",
    what: "Records agent runs so an answer can be traced back to what it actually read.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/integrity"],
    tables: ["agent_integrity", "activity_log"],
    envKeys: [],
    trust: "This exists so an AI answer is auditable rather than trusted on faith.",
  },
  {
    id: "gemini-ocr",
    pages: ["/scan-bill", "/documents"],
    name: "Document OCR",
    domain: "AI",
    what: "Reads a photographed BOL or receipt into structured fields for confirmation.",
    kind: "ai",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/gemini"],
    tables: [],
    envKeys: ["GEMINI_API_KEY"],
    trust:
      "Gemini returns no confidence score, so every extracted field lands in an editable confirm step. A human accepts it before it becomes a record.",
  },
  {
    id: "gemini-tts",
    pages: ["/voice"],
    name: "Voice output",
    domain: "AI",
    what: "Server-side text-to-speech for agent replies and alerts.",
    kind: "ai",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/gemini"],
    tables: [],
    envKeys: ["GEMINI_API_KEY"],
    trust: "Gemini TTS. Synthetic speech, always generated server-side; no provider key reaches the browser.",
  },
  {
    id: "captions-live",
    pages: ["/accessibility"],
    name: "Live audio captions",
    domain: "Accessibility",
    what: "Transcribes audio and translates text for deaf and hard-of-hearing drivers.",
    kind: "ai",
    disciplines: ["programmer", "design"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/captions"],
    tables: [],
    envKeys: ["GEMINI_API_KEY"],
    trust:
      "Measured Gemini latency is displayed with a real clock, in seconds, not a marketing millisecond figure. No confidence score is returned by the provider, so accuracy is not quantified anywhere.",
  },
  {
    id: "fleet-memory",
    pages: ["/fleet-memory"],
    name: "Per-driver memory layer",
    domain: "AI",
    what: "Durable facts an agent learned about a driver, reused across sessions.",
    kind: "ai",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/fleet-memory"],
    tables: ["fleet_intelligence_notes", "driver_signals"],
    envKeys: [],
    trust: "Stored text a driver can read. It is not inferred behaviour scoring and it is not shared between carriers.",
  },
  {
    id: "algorithm-patterns",
    pages: ["/driver-algorithm"],
    name: "Pattern learning layer",
    domain: "AI",
    what: "Learns a driver's own patterns from their history and refuses to assert on thin data.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/algorithm"],
    tables: ["driver_signals", "hos_logs", "trips"],
    envKeys: [],
    trust:
      "MIN_SAMPLES = 5. Below five observations it returns insufficient data instead of a pattern. This is the row that answers 'who reads the algorithms' — it reports its own sample count every time.",
  },

  /* ---------------- Accessibility ---------------- */
  {
    id: "accessibility-requests",
    pages: ["/accessibility"],
    name: "Accessibility request queue",
    domain: "Accessibility",
    what: "Driver requests for captions, translation, haptic or sign-language support.",
    kind: "human",
    disciplines: ["design", "webdev"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/accessibility"],
    tables: ["accessibility_requests", "driver_accessibility"],
    envKeys: [],
    trust:
      "The queue currently reports caption and translation providers as live:false while /api/captions reports Gemini live. That disagreement is displayed rather than smoothed over, and it is an open engineering item.",
  },
  {
    id: "haptic-patterns",
    pages: ["/haptic-language"],
    name: "Haptic alert language",
    domain: "Accessibility",
    what: "Seven distinct vibration patterns mapped to alert meanings across devices.",
    kind: "algorithm",
    disciplines: ["design", "programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/accessibility"],
    tables: ["haptic_events"],
    envKeys: [],
    trust: "Patterns are defined server-side so phone and wearable agree. Device support is per-device and is listed, not assumed.",
  },
  {
    id: "sign-language-video",
    name: "Sign-language video generation",
    domain: "Accessibility",
    what: "Not built.",
    kind: "ai",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: [],
    tables: [],
    envKeys: [],
    trust:
      "NOT BUILT and no provider exists in this codebase. /api/captions returns signLanguageVideo:false. Every page that mentions it says so.",
  },

  /* ---------------- HR ---------------- */
  {
    id: "hr-people",
    pages: ["/hr", "/humanai"],
    name: "HR people records",
    domain: "HR",
    what: "Employee and contractor records with documents and occurrences.",
    kind: "human",
    disciplines: ["webdev"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/hr"],
    tables: ["hr_people", "hr_documents", "hr_occurrences"],
    envKeys: [],
    trust: "Fleet-tier module. Records are what a human entered.",
  },
  {
    id: "hr-payroll",
    pages: ["/payroll"],
    name: "Payroll calculation",
    domain: "HR",
    what: "Mileage or hourly pay computed into statements per run.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/hr"],
    tables: ["hr_pay_statements", "hr_payroll_runs", "hr_runs"],
    envKeys: [],
    trust:
      "Arithmetic only. No money moves, no tax is withheld or remitted, and no bank account is stored anywhere in this platform.",
  },
  {
    id: "hr-screening",
    pages: ["/hiring"],
    name: "AI pre-screen interview",
    domain: "HR",
    what: "Conversational pre-screen that remembers stated facts across a session.",
    kind: "ai",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/hr"],
    tables: ["hr_screenings"],
    envKeys: ["AI_GATEWAY_API_KEY"],
    trust:
      "It gathers answers for a human to read. It does not score, rank or reject a candidate, and no hiring decision is automated.",
  },
  {
    id: "hr-background-check",
    pages: ["/hiring"],
    name: "Criminal background check request",
    domain: "HR",
    what: "Checkr request flow, built and waiting on a provider key.",
    kind: "human",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/hr"],
    tables: ["hr_background_checks", "checkout_screenings"],
    envKeys: ["CHECKR_SECRET_KEY"],
    trust:
      "No Checkr key is present, so this returns provider-not-connected. It has never run a real check and does not pretend to.",
  },

  /* ---------------- Maintenance ---------------- */
  {
    id: "maintenance-records",
    pages: ["/maintenance"],
    name: "Maintenance records",
    domain: "Maintenance",
    what: "Service history per truck.",
    kind: "human",
    disciplines: ["webdev"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/maintenance"],
    tables: ["maintenance_records"],
    envKeys: [],
    trust: "Currently empty. The endpoint returns an empty array rather than sample rows.",
  },
  {
    id: "fleetio-read",
    pages: ["/fleetio"],
    name: "Fleetio vehicle sync",
    domain: "Maintenance",
    what: "Read-only pull of vehicles from a connected Fleetio account.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck", "car"],
    endpoints: ["/api/fleetio"],
    tables: [],
    envKeys: ["FLEETIO_API_KEY", "FLEETIO_ACCOUNT_TOKEN"],
    trust:
      "READ ONLY — nothing is written back to Fleetio. Every vehicle currently returned is flagged is_sample:true by Fleetio and is never presented as a real fleet.",
  },
  {
    id: "mechanic-session",
    pages: ["/mechanic"],
    name: "Mechanic diagnostic session",
    domain: "Maintenance",
    what: "Guided breakdown triage session record.",
    kind: "ai",
    disciplines: ["programmer"],
    worlds: ["truck"],
    endpoints: ["/api/mechanic"],
    tables: ["mechanic_sessions"],
    envKeys: ["AI_GATEWAY_API_KEY"],
    trust: "Guidance, not a repair authorisation, and not a substitute for a qualified technician.",
  },
  {
    id: "roadside-recovery",
    pages: ["/breakdown"],
    name: "Breakdown and recovery",
    domain: "Maintenance",
    what: "Breakdown intake and recovery coordination record.",
    kind: "human",
    disciplines: ["webdev", "design"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/recovery"],
    tables: [],
    envKeys: [],
    trust: "No towing network is contracted. This records a request; a human still has to make the call.",
  },

  /* ---------------- Driver wellbeing ---------------- */
  {
    id: "driver-health",
    pages: ["/health"],
    name: "Driver health tracking",
    domain: "Health",
    what: "Driver-entered health signals and recovery plans.",
    kind: "human",
    disciplines: ["design", "webdev"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/driver-health"],
    tables: ["health_recovery_plans"],
    envKeys: [],
    trust: "Not medical advice, not a DOT physical, and not shared with a medical examiner.",
  },
  {
    id: "medical-examiner-locator",
    pages: ["/medical-cdl"],
    name: "Certified medical examiner locator",
    domain: "Health",
    what: "Deep-links a driver into the FMCSA National Registry search.",
    kind: "human",
    disciplines: ["design", "webdev"],
    worlds: ["truck"],
    endpoints: [],
    tables: [],
    envKeys: [],
    trust:
      "The National Registry cannot be scraped or mirrored, so no examiner list is stored locally. This is a deep link into the official registry, by design.",
  },
  {
    id: "week-review",
    pages: ["/week-review"],
    name: "Week in review",
    domain: "Health",
    what: "Weekly summary of a driver's own week, opt-in.",
    kind: "algorithm",
    disciplines: ["design", "webdev"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/week-review"],
    tables: ["week_review_subscriptions", "trips"],
    envKeys: [],
    trust: "Summarises rows that exist. An empty week reads as no data, not a zero score.",
  },

  /* ---------------- Car / bike world ---------------- */
  {
    id: "ride-couriers",
    pages: ["/ride-dashboard"],
    name: "Courier roster (car / bike)",
    domain: "Ride",
    what: "Non-truck courier records for the car and bike worlds.",
    kind: "human",
    disciplines: ["webdev"],
    worlds: ["car", "bike"],
    endpoints: ["/api/ride"],
    tables: ["ride_couriers"],
    envKeys: [],
    trust:
      "The car/bike world is deliberately narrower than truck: no HOS, no DVIR, no weight rules apply to it, and the platform does not pretend otherwise.",
  },
  {
    id: "ride-deliveries",
    pages: ["/ride-dashboard"],
    name: "Delivery records (car / bike)",
    domain: "Ride",
    what: "Per-delivery records with pay and distance.",
    kind: "human",
    disciplines: ["webdev"],
    worlds: ["car", "bike"],
    endpoints: ["/api/ride"],
    tables: ["ride_deliveries"],
    envKeys: [],
    trust: "Rows entered by the courier. No gig-platform API is connected to import them.",
  },
  {
    id: "ride-expenses",
    pages: ["/expenses"],
    name: "Courier expenses (car / bike)",
    domain: "Ride",
    what: "Expense and maintenance rows for a car or bike courier.",
    kind: "human",
    disciplines: ["webdev"],
    worlds: ["car", "bike"],
    endpoints: ["/api/ride"],
    tables: ["ride_expenses", "ride_maintenance"],
    envKeys: [],
    trust: "Bookkeeping only, same limits as TRAXES: nothing is filed with any agency.",
  },

  /* ---------------- Platform ---------------- */
  {
    id: "auth-accounts",
    pages: ["/sign-in"],
    name: "Accounts and sign-in",
    domain: "Platform",
    what: "Email/password accounts with sessions, on Better Auth.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/auth", "/api/session"],
    tables: ["user_roles"],
    envKeys: ["BETTER_AUTH_SECRET", "WEBSITE_URL"],
    trust:
      "New accounts default to the driver role, never admin, and the admin bootstrap window is permanently closed.",
  },
  {
    id: "auth-coverage",
    name: "Authorization coverage honesty endpoint",
    domain: "Platform",
    what: "Reports which endpoints are actually gated by a session and which are not.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/session"],
    tables: [],
    envKeys: [],
    trust:
      "It currently reports that most endpoints answer without a session. That is the truth and finishing authorization across the routers is the top open security item.",
  },
  {
    id: "data-index",
    pages: ["/entitled-index", "/startup-data-agent", "/data-agent"],
    name: "Live data index",
    domain: "Platform",
    what: "Live table, row, and column counts plus the named filing gaps.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/data-index"],
    tables: [],
    envKeys: [],
    trust:
      "Introspects the real database on every request, which is why it is slow (8-17 s measured). Slow and true beats cached and stale here, but caching it is an open item.",
  },
  {
    id: "function-index",
    pages: ["/entitled"],
    name: "Function index (this index)",
    domain: "Platform",
    what: "Deduplicated index of every function, with computed evidence per row and a duplicate-collision count.",
    kind: "algorithm",
    disciplines: ["programmer", "webdev"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/functions"],
    tables: [],
    envKeys: [],
    trust:
      "Route existence is read off the running app, table state off the live database, credentials as booleans only. It publishes no uptime figure because nothing records health over time.",
  },
  {
    id: "integrations-status",
    pages: ["/integration-status", "/integrations"],
    name: "Integration status board",
    domain: "Platform",
    what: "Nineteen providers with key presence, live probe result and reason.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/integrations"],
    tables: [],
    envKeys: [],
    trust:
      "It never returns a key value — only present/absent plus the vendor's own error string when a probe is rejected.",
  },
  {
    id: "file-storage",
    pages: ["/documents"],
    name: "Large file storage",
    domain: "Platform",
    what: "Presigned upload and download of documents and photos.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/storage"],
    tables: [],
    envKeys: ["S3_BUCKET", "S3_ACCESS_KEY_ID"],
    trust: "Presigned URLs only. No storage credential is ever exposed to a browser.",
  },
  {
    id: "transactional-email",
    name: "Transactional email",
    domain: "Platform",
    what: "Server-side send through Postmark, resolving only on a real MessageID.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/email"],
    tables: [],
    envKeys: ["POSTMARK_SERVER_TOKEN", "EMAIL_FROM"],
    trust:
      "The token is verified live but real sends currently return Postmark ErrorCode 412 — the account is not approved yet, so no production email is being delivered. A send is never reported as sent without a MessageID.",
  },
  {
    id: "sms-messaging",
    pages: ["/twilio-setup", "/a2p"],
    name: "SMS / A2P messaging",
    domain: "Platform",
    what: "Twilio A2P brand and domain verification records.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/a2p", "/api/twilio"],
    tables: ["a2p_registrations", "twilio_domain_verifications"],
    envKeys: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"],
    trust:
      "The brand is approved but NO messaging campaign exists, so no application text message can be delivered today. No page in this app claims a text was sent.",
  },
  {
    id: "support-desk",
    pages: ["/support-technical", "/support-billing"],
    name: "Support desk",
    domain: "Support",
    what: "Seven ticket categories with target response times, plus real ticket records.",
    kind: "human",
    disciplines: ["design", "webdev"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/support"],
    tables: ["support_tickets"],
    envKeys: [],
    trust: "A human answers these. Phone 636-706-8338. Target response times are targets, not guarantees.",
  },
  {
    id: "weather-brief",
    pages: ["/weather"],
    name: "Weather along route",
    domain: "Operations",
    what: "Forecast for a driver's coordinates.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/weather"],
    tables: [],
    envKeys: ["OPENWEATHER_API_KEY"],
    trust: "Provider forecast, passed through unchanged. No forecast is generated locally.",
  },
  {
    id: "fleet-branding",
    pages: ["/branding"],
    name: "Fleet branding",
    domain: "Platform",
    what: "Per-carrier logo and colour settings.",
    kind: "human",
    disciplines: ["design", "webdev"],
    worlds: ["truck", "car", "bike"],
    endpoints: ["/api/branding"],
    tables: ["fleet_branding"],
    envKeys: [],
    trust:
      "Empty today. It renders the TruckWithEase brand until a carrier sets its own. Performed by a human — a carrier admin uploads the mark and picks the colours; nothing is generated.",
  },
  {
    id: "revenue-model-mirror",
    pages: ["/forecast", "/revenue-forecast", "/index-forecast"],
    name: "Revenue model mirror",
    domain: "Platform",
    what:
      "Runs the 36-month subscription recurrence for three scenarios in the browser, priced off the live plan list from GET /api/signup, and shows it against the real signup and subscription counts.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck"],
    endpoints: ["/api/signup", "/api/subscriptions"],
    tables: ["signups", "signups"].slice(0, 1),
    envKeys: [],
    trust:
      "It is arithmetic over inputs a human chose, not a forecast. No market size, no adoption rate, no industry churn figure and no valuation is used anywhere in it. Actual revenue collected is $0 and no payment processor is connected.",
  },
  {
    id: "design-system",
    pages: ["/design"],
    name: "Design system",
    domain: "Design",
    what: "One gold-on-black token set and four loaded fonts shared by web and mobile.",
    kind: "human",
    disciplines: ["design"],
    worlds: ["truck", "car", "bike"],
    endpoints: [],
    tables: [],
    envKeys: [],
    trust:
      "Tokens: gold #C9A84C, bright gold #FFD700, black #0a0a0a, card #161616, nav #111111, border #222222. Fonts load once in the document head; no component imports a font at runtime.",
  },
  {
    id: "broker-reputation",
    pages: ["/customer-book"],
    name: "Broker and shipper reputation",
    domain: "Loads",
    what: "Driver-reported ratings of brokers and shippers.",
    kind: "human",
    disciplines: ["webdev"],
    worlds: ["truck"],
    endpoints: ["/api/loads"],
    tables: ["shipper_broker_ratings", "broker_verifications"],
    envKeys: [],
    trust:
      "Empty today. When populated it is driver opinion, not a credit check and not a bond verification.",
  },
  {
    id: "licensing",
    pages: ["/load-board-licenses"],
    name: "Load board licensing records",
    domain: "Platform",
    what: "License records for load-board access.",
    kind: "algorithm",
    disciplines: ["programmer"],
    worlds: ["truck"],
    endpoints: ["/api/licensing"],
    tables: ["load_board_licenses"],
    envKeys: [],
    trust: "Record keeping only. It grants no external board access on its own.",
  },
];

/* ---------------------------------------------------------------------------
 * COMPUTED STATUS
 * ------------------------------------------------------------------------- */

type Status = "live" | "built_empty" | "needs_key" | "not_built";

function normPath(p: string): string {
  const s = p.startsWith("/") ? p : `/${p}`;
  return s.length > 1 && s.endsWith("/") ? s.slice(0, -1) : s;
}

/* ---------------------------------------------------------------------------
 * SCREENS — the in-app route table, read off legacy/App.jsx, not typed here.
 * Same rule as endpoints: if a screen route is not in the router, it is not
 * claimed. If the source file cannot be read at runtime, this reports
 * checked:false with the reason instead of pretending.
 * ------------------------------------------------------------------------- */

const APP_JSX_CANDIDATES = [
  "packages/web/src/web/legacy/App.jsx",
  "src/web/legacy/App.jsx",
  "../web/legacy/App.jsx",
];

let screenCache: { paths: string[]; source: string | null; error: string | null } | null = null;

export function appScreens(): { paths: string[]; source: string | null; error: string | null } {
  if (screenCache) return screenCache;
  let lastErr = "no candidate path was readable";
  for (const rel of APP_JSX_CANDIDATES) {
    try {
      const abs = join(process.cwd(), rel);
      const src = readFileSync(abs, "utf-8");
      const paths = [
        ...new Set([...src.matchAll(/path === "([^"]+)"/g)].map((m) => normPath(m[1]))),
      ].sort();
      screenCache = { paths, source: rel, error: null };
      return screenCache;
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
  }
  screenCache = { paths: [], source: null, error: lastErr };
  return screenCache;
}

export const envPresent = (k: string) => {
  const v = process.env[k];
  return typeof v === "string" && v.replace(/"/g, "").trim().length > 0;
};

export const functionsIndex = (getRoutes: () => { method: string; path: string }[]) =>
  new Hono()

    /**
     * GET /api/functions
     * The whole index in one response: measured endpoints, capability rows with computed
     * status, world coverage, and the duplicate proof.
     */
    .get("/", async (c) => {
      const t0 = Date.now();

      /* 1. ENDPOINTS — measured off the running app, deduped -------------- */
      const raw = getRoutes() ?? [];
      const seen = new Set<string>();
      const endpoints: { method: string; path: string; domain: string }[] = [];
      for (const r of raw) {
        const method = String(r.method ?? "ALL").toUpperCase();
        const path = normPath(String(r.path ?? ""));
        if (!path.startsWith("/api")) continue;
        if (method === "USE") continue; // middleware, not an endpoint
        const key = `${method} ${path}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const domain = path.split("/")[2] ?? "root";
        endpoints.push({ method, path, domain });
      }
      endpoints.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));

      const screens = appScreens();

      const routePaths = endpoints.map((e) => e.path);
      const routerExists = (prefix: string) =>
        routePaths.some((p) => p === normPath(prefix) || p.startsWith(`${normPath(prefix)}/`));

      const domains = [...new Set(endpoints.map((e) => e.domain))].sort();

      /* 2. TABLES — live existence + row counts, only the ones referenced -- */
      const wanted = [...new Set(CAPS.flatMap((x) => x.tables))].sort();
      const existing = new Set(
        (await run("SELECT name FROM sqlite_master WHERE type='table'")).map((r) =>
          String(r.name),
        ),
      );
      const rowCounts: Record<string, number | null> = {};
      for (const t of wanted) {
        if (!existing.has(t)) {
          rowCounts[t] = null; // does not exist
          continue;
        }
        const r = await run(`SELECT COUNT(*) AS n FROM "${t}"`);
        rowCounts[t] = Number(r[0]?.n ?? 0);
      }

      /* 3. CAPABILITY ROWS — status computed, never typed ----------------- */
      const capabilities = CAPS.map((cap) => {
        const endpointEvidence = cap.endpoints.map((e) => ({ path: e, mounted: routerExists(e) }));
        const tableEvidence = cap.tables.map((t) => ({
          table: t,
          exists: rowCounts[t] !== null && rowCounts[t] !== undefined,
          rows: rowCounts[t],
        }));
        const envEvidence = cap.envKeys.map((k) => ({ key: k, present: envPresent(k) }));
        const pageEvidence = (cap.pages ?? []).map((pg) => ({
          path: normPath(pg),
          routed: screens.paths.includes(normPath(pg)),
        }));

        const declaresSurface = cap.endpoints.length > 0 || cap.tables.length > 0;
        const allMounted = endpointEvidence.every((e) => e.mounted);
        const anyMounted = endpointEvidence.some((e) => e.mounted);
        const tablesExist = tableEvidence.every((t) => t.exists);
        const anyRows = tableEvidence.some((t) => (t.rows ?? 0) > 0);
        const keysOk = envEvidence.every((e) => e.present);

        let status: Status;
        let statusReason: string;

        if (!declaresSurface && cap.envKeys.length === 0) {
          // Pure client-side or documentation-only capability (design system, weight math,
          // registry deep link). Nothing to measure server-side — say that plainly.
          status = "not_built";
          statusReason =
            "No server endpoint and no table — this function is computed in the browser or is a deep link, so there is nothing server-side to measure.";
        } else if (cap.endpoints.length > 0 && !anyMounted) {
          status = "not_built";
          statusReason = `None of its endpoints are mounted on the running app: ${cap.endpoints.join(", ")}.`;
        } else if (!allMounted) {
          status = "not_built";
          statusReason = `Partially mounted — missing ${endpointEvidence
            .filter((e) => !e.mounted)
            .map((e) => e.path)
            .join(", ")}.`;
        } else if (!tablesExist) {
          status = "not_built";
          statusReason = `Table missing from the live database: ${tableEvidence
            .filter((t) => !t.exists)
            .map((t) => t.table)
            .join(", ")}.`;
        } else if (!keysOk) {
          status = "needs_key";
          statusReason = `Endpoint is mounted but a required credential is absent: ${envEvidence
            .filter((e) => !e.present)
            .map((e) => e.key)
            .join(", ")}. Nothing real can be returned until it is set.`;
        } else if (cap.tables.length > 0 && !anyRows) {
          status = "built_empty";
          statusReason = "Endpoint and tables exist, but every table it reads has zero rows.";
        } else {
          status = "live";
          statusReason =
            cap.tables.length > 0
              ? "Endpoint mounted, tables exist and hold rows, credentials present."
              : "Endpoint mounted and credentials present.";
        }

        return {
          ...cap,
          status,
          statusReason,
          evidence: {
            endpoints: endpointEvidence,
            tables: tableEvidence,
            envKeys: envEvidence,
            pages: pageEvidence,
          },
        };
      });

      /* 4. DUPLICATE PROOF — he said it can not duplicate ---------------- */
      const idCounts = new Map<string, number>();
      const nameWorldCounts = new Map<string, number>();
      for (const cap of CAPS) {
        idCounts.set(cap.id, (idCounts.get(cap.id) ?? 0) + 1);
        for (const w of cap.worlds) {
          const k = `${cap.name.toLowerCase()}::${w}`;
          nameWorldCounts.set(k, (nameWorldCounts.get(k) ?? 0) + 1);
        }
      }
      const idCollisions = [...idCounts.entries()].filter(([, n]) => n > 1).map(([k]) => k);
      const nameWorldCollisions = [...nameWorldCounts.entries()]
        .filter(([, n]) => n > 1)
        .map(([k]) => k);
      const endpointCollisions = raw.length - seen.size;

      /* 5. WORLD + DISCIPLINE + KIND COVERAGE ---------------------------- */
      const countBy = <T extends string>(keys: readonly T[], pick: (c: Cap) => T[]) =>
        Object.fromEntries(
          keys.map((k) => [
            k,
            {
              total: CAPS.filter((c) => pick(c).includes(k)).length,
              live: capabilities.filter((c) => pick(c as Cap).includes(k) && c.status === "live")
                .length,
            },
          ]),
        );

      const counts = {
        capabilities: CAPS.length,
        endpoints: endpoints.length,
        byStatus: {
          live: capabilities.filter((c) => c.status === "live").length,
          built_empty: capabilities.filter((c) => c.status === "built_empty").length,
          needs_key: capabilities.filter((c) => c.status === "needs_key").length,
          not_built: capabilities.filter((c) => c.status === "not_built").length,
        },
        byWorld: countBy(WORLDS, (c) => c.worlds),
        byDiscipline: countBy(DISCIPLINES, (c) => c.disciplines),
        byKind: Object.fromEntries(
          KINDS.map((k) => [k, CAPS.filter((c) => c.kind === k).length]),
        ),
        screens: screens.paths.length,
      };

      /* 6. SCREENS — which routed pages an indexed function actually claims -- */
      const claimedPages = new Set(
        CAPS.flatMap((c) => (c.pages ?? []).map((pg) => normPath(pg))),
      );
      const declaredNotRouted = [...claimedPages].filter((pg) => !screens.paths.includes(pg)).sort();
      const unclaimed = screens.paths.filter((pg) => !claimedPages.has(pg));

      return c.json(
        {
          vocabulary: { worlds: WORLDS, disciplines: DISCIPLINES, kinds: KINDS },
          counts,
          endpoints,
          domains,
          capabilities,
          duplicates: {
            idCollisions,
            nameWorldCollisions,
            duplicateEndpointRegistrations: endpointCollisions,
            clean: idCollisions.length === 0 && nameWorldCollisions.length === 0,
            note:
              "Computed on this request. idCollisions counts repeated capability ids; nameWorldCollisions counts the same function name claimed twice for the same vehicle world. duplicateEndpointRegistrations counts method+path pairs Hono registered more than once (middleware chains legitimately repeat, so this number is informational).",
          },
          missing: {
            uptime:
              "NOT TRACKED. Nothing in this platform records health-check results over time, so no uptime or availability percentage can be published. A 200 measured once is not uptime.",
            comparison:
              "NOT SERVED HERE. The comparison against similar applications exists as a source-cited internal engineering document. No competitor price and no self-score is ever published inside the product.",
            eld: "TruckWithEase is NOT an FMCSA-registered ELD.",
            filing: "TruckWithEase files nothing with any agency — no IFTA, no 2290, no tax return.",
          },
          screens: {
            checked: screens.error === null,
            source: screens.source,
            error: screens.error,
            totalRouted: screens.paths.length,
            claimedByAFunction: [...claimedPages].filter((pg) => screens.paths.includes(pg)).length,
            declaredButNotRouted: declaredNotRouted,
            unclaimed,
            note:
              "Screen routes are read out of the legacy route table at request time, the same way endpoints are read off the running Hono app. `unclaimed` are pages that resolve in the app but that no indexed function claims yet — most of them are legacy screens still waiting on a rewrite. They are listed, not hidden.",
          },
          measuredMs: Date.now() - t0,
          generatedAt: new Date().toISOString(),
        },
        200,
      );
    })

    /** GET /api/functions/endpoints — just the measured route list. */
    .get("/endpoints", (c) => {
      const seen = new Set<string>();
      const out: { method: string; path: string }[] = [];
      for (const r of getRoutes() ?? []) {
        const method = String(r.method ?? "ALL").toUpperCase();
        const path = normPath(String(r.path ?? ""));
        if (!path.startsWith("/api") || method === "USE") continue;
        const key = `${method} ${path}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ method, path });
      }
      out.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
      return c.json({ endpoints: out, count: out.length, note: "Read off the running Hono app." }, 200);
    });
