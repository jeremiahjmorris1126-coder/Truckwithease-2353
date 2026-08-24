import { db } from "../database";
import * as schema from "../database/schema";
import { sql } from "drizzle-orm";

/**
 * Idempotent seed for the HumanAI HR Manager module.
 * Populates people, occurrences, docs, screenings, background checks,
 * a finalized payroll run, and profitability runs so every tab is explorable.
 */
let hrSeeded = false;

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86_400_000);
const iso = (d: number) => new Date(now - d * 86_400_000).toISOString().slice(0, 10);

const PEOPLE = [
  { id: "hp-1", driverId: "drv-1", name: "Marcus Bell", type: "driver", status: "active", position: "Company Driver", phone: "417-555-0104", email: "marcus@twe.demo", cdlNumber: "MO-CDL-88213", cdlClass: "A", cdlState: "MO", endorsements: "H, N, T", homeBase: "St. Louis, MO", yearsExperience: 9, payType: "mileage", payRate: 0.62, hireDate: iso(1400), notes: "Top safety score. Mentor for new hires." },
  { id: "hp-2", driverId: "drv-2", name: "Dana Cruz", type: "driver", status: "active", position: "Company Driver", phone: "417-555-0217", email: "dana@twe.demo", cdlNumber: "IL-CDL-40921", cdlClass: "A", cdlState: "IL", endorsements: "T", homeBase: "Chicago, IL", yearsExperience: 4, payType: "mileage", payRate: 0.55, hireDate: iso(700), notes: "" },
  { id: "hp-3", driverId: "drv-3", name: "Ray Okafor", type: "driver", status: "active", position: "Lead Driver", phone: "417-555-0330", email: "ray@twe.demo", cdlNumber: "TX-CDL-55110", cdlClass: "A", cdlState: "TX", endorsements: "H, N, T, X", homeBase: "Dallas, TX", yearsExperience: 12, payType: "mileage", payRate: 0.68, hireDate: iso(2100), notes: "Hazmat certified. Handles tanker lanes." },
  { id: "hp-4", driverId: "drv-4", name: "Ashley Kim", type: "driver", status: "on_leave", position: "Company Driver", phone: "417-555-0451", email: "ashley@twe.demo", cdlNumber: "OH-CDL-72004", cdlClass: "A", cdlState: "OH", endorsements: "T", homeBase: "Columbus, OH", yearsExperience: 6, payType: "hourly", payRate: 26.5, hireDate: iso(980), notes: "Medical leave — DOT recert pending." },
  { id: "hp-5", driverId: null, name: "Terrell Owens", type: "prospect", status: "screening", position: "Company Driver", phone: "314-555-7781", email: "towens@example.com", cdlNumber: "MO-CDL-91002", cdlClass: "A", cdlState: "MO", endorsements: "T", homeBase: "St. Charles, MO", yearsExperience: 3, payType: "mileage", payRate: 0.54, hireDate: null, notes: "Applied via Indeed. Passed initial screen." },
  { id: "hp-6", driverId: null, name: "Gina Alvarez", type: "prospect", status: "background", position: "Regional Driver", phone: "636-555-3390", email: "galvarez@example.com", cdlNumber: "MO-CDL-77451", cdlClass: "A", cdlState: "MO", endorsements: "H, T", homeBase: "O'Fallon, MO", yearsExperience: 7, payType: "mileage", payRate: 0.6, hireDate: null, notes: "Strong interview. Background in progress." },
  { id: "hp-7", driverId: null, name: "Jordan Pratt", type: "prospect", status: "applicant", position: "Company Driver", phone: "618-555-2245", email: "jpratt@example.com", cdlNumber: "IL-CDL-33218", cdlClass: "A", cdlState: "IL", endorsements: "", homeBase: "Belleville, IL", yearsExperience: 1.5, payType: "mileage", payRate: 0.5, hireDate: null, notes: "New application — needs pre-screen." },
];

const OCCURRENCES = [
  { id: "ho-1", personId: "hp-2", category: "violation", severity: "moderate", occurredOn: iso(18), title: "Log form & manner violation", description: "Roadside inspection flagged missing shipping document reference on ELD log.", location: "I-80 Iowa scale", actionTaken: "Coached on document entry. Written warning issued.", points: 2, status: "resolved", reportedBy: "Dispatch" },
  { id: "ho-2", personId: "hp-3", category: "commendation", severity: "minor", occurredOn: iso(30), title: "Accident avoidance — commended", description: "Avoided a multi-car pileup on I-45 through defensive braking. Dashcam reviewed.", location: "I-45 TX", actionTaken: "Safety bonus awarded. Featured in monthly newsletter.", points: 0, status: "resolved", reportedBy: "Safety" },
  { id: "ho-3", personId: "hp-4", category: "accident", severity: "major", occurredOn: iso(45), title: "Backing incident — dock", description: "Clipped a dock plate while backing at consignee. Minor trailer corner damage, no injuries.", location: "Columbus DC", actionTaken: "Post-accident drug test (negative). Remedial backing training completed.", points: 3, status: "resolved", reportedBy: "Terminal Mgr" },
  { id: "ho-4", personId: "hp-2", category: "attendance", severity: "minor", occurredOn: iso(6), title: "Late dispatch check-in", description: "Missed morning check-in window by 40 minutes, no call.", location: "", actionTaken: "Verbal coaching logged.", points: 1, status: "open", reportedBy: "Dispatch" },
  { id: "ho-5", personId: "hp-1", category: "coaching", severity: "minor", occurredOn: iso(10), title: "Idle-time coaching", description: "Idle percentage trended above fleet target for the week.", location: "", actionTaken: "Reviewed idle-reduction tips. No discipline.", points: 0, status: "under_review", reportedBy: "Safety" },
];

const DOCUMENTS = [
  { id: "hd-1", personId: "hp-1", category: "cdl", name: "CDL — Marcus Bell (MO)", sizeBytes: 184320, notes: "Class A, endorsements H/N/T", issuedOn: iso(400), expiresOn: iso(-320) },
  { id: "hd-2", personId: "hp-1", category: "medical_card", name: "DOT Medical Card — Marcus Bell", sizeBytes: 96000, notes: "2-year card", issuedOn: iso(120), expiresOn: iso(-610) },
  { id: "hd-3", personId: "hp-4", category: "medical_card", name: "DOT Medical Card — Ashley Kim", sizeBytes: 91000, notes: "Recert pending", issuedOn: iso(360), expiresOn: iso(-20) },
  { id: "hd-4", personId: "hp-3", category: "contract", name: "Lead Driver Agreement — Ray Okafor", sizeBytes: 240000, notes: "Signed employment agreement", issuedOn: iso(2100), expiresOn: null },
  { id: "hd-5", personId: "hp-5", category: "application", name: "Employment Application — Terrell Owens", sizeBytes: 210000, notes: "DOT application for employment (391.21)", issuedOn: iso(8), expiresOn: null },
];

const SCREENINGS = [
  {
    id: "hs-1", personId: "hp-5", candidateName: "Terrell Owens", position: "Company Driver",
    transcript: JSON.stringify([
      { q: "How many years of verifiable Class A experience do you have, and what equipment?", a: "3 years, dry van and some reefer, mostly Midwest regional." },
      { q: "Any accidents, moving violations, or out-of-service events in the last 3 years?", a: "One speeding ticket about 2 years ago, no accidents, no OOS." },
      { q: "Are you comfortable with ELD logs and are you familiar with the 70-hour/8-day rule?", a: "Yes, I've run ELDs the whole time and manage my clock tightly." },
      { q: "Why are you leaving your current carrier?", a: "Looking for more consistent home time and better mileage pay." },
    ]),
    score: 78, recommendation: "advance", summary: "Solid 3-year regional driver with clean recent record aside from one old speeding ticket. Comfortable with ELD/HOS. Motivations (home time, pay) align with the role. Recommend advancing to background + MVR.", redFlags: JSON.stringify(["Only 3 years experience — verify employment history for gaps"]), status: "completed",
  },
];

const BG_CHECKS = [
  {
    id: "hb-1", personId: "hp-6", ssnLast4: "4471", dob: "1988-04-12", licenseState: "MO", consent: true,
    checkTypes: JSON.stringify(["mvr", "criminal", "employment", "drug", "psp", "clearinghouse"]),
    status: "complete",
    findings: JSON.stringify({
      mvr: "No suspensions. 1 minor speeding (2023). Class A valid through 2027.",
      criminal: "No felony or disqualifying misdemeanor records found in searched jurisdictions.",
      employment: "Verified 2 prior DOT carriers (7 yrs total). No unexplained gaps.",
      drug: "Pre-employment drug screen: negative.",
      psp: "PSP: 0 crashes, 2 clean inspections in 24 months.",
      clearinghouse: "FMCSA Clearinghouse: no drug/alcohol violations on file.",
    }),
    reportSummary: "All checks returned clear. Candidate meets 49 CFR 391 qualification standards. No adverse findings. Recommend proceeding to offer.",
    adjudication: "clear",
  },
];

const RUNS = [
  { id: "hr-run-1", personId: "hp-1", driverName: "Marcus Bell", origin: "St. Louis, MO", destination: "Nashville, TN", miles: 309, revenue: 1150, fuelCost: 268, driverPay: 192, tolls: 14, maintenance: 46, otherCost: 20, ranOn: iso(4) },
  { id: "hr-run-2", personId: "hp-3", driverName: "Ray Okafor", origin: "Dallas, TX", destination: "Houston, TX", miles: 239, revenue: 900, fuelCost: 205, driverPay: 163, tolls: 8, maintenance: 36, otherCost: 15, ranOn: iso(5) },
  { id: "hr-run-3", personId: "hp-2", driverName: "Dana Cruz", origin: "Chicago, IL", destination: "Indianapolis, IN", miles: 183, revenue: 690, fuelCost: 158, driverPay: 101, tolls: 22, maintenance: 27, otherCost: 12, ranOn: iso(6) },
  { id: "hr-run-4", personId: "hp-1", driverName: "Marcus Bell", origin: "St. Louis, MO", destination: "Kansas City, MO", miles: 249, revenue: 815, fuelCost: 214, driverPay: 154, tolls: 0, maintenance: 37, otherCost: 18, ranOn: iso(9) },
];

export async function ensureHrSeed() {
  if (hrSeeded) return;
  try {
    const existing = await db.select({ c: sql<number>`count(*)` }).from(schema.hrPeople);
    if ((existing[0]?.c ?? 0) > 0) {
      hrSeeded = true;
      return;
    }

    await db.insert(schema.hrPeople).values(PEOPLE.map((p) => ({ ...p, createdAt: daysAgo(p.hireDate ? 30 : 10) })));
    await db.insert(schema.hrOccurrences).values(OCCURRENCES);
    await db.insert(schema.hrDocuments).values(DOCUMENTS);
    await db.insert(schema.hrScreenings).values(SCREENINGS);
    await db.insert(schema.hrBackgroundChecks).values(BG_CHECKS);
    await db.insert(schema.hrRuns).values(RUNS);

    // One finalized payroll run (prior week)
    const runId = "hr-pr-1";
    const start = iso(11), end = iso(4);
    const stmts = [
      { id: "hr-ps-1", runId, personId: "hp-1", personName: "Marcus Bell", payType: "mileage", units: 2740, rate: 0.62, gross: 1698.8 },
      { id: "hr-ps-2", runId, personId: "hp-2", personName: "Dana Cruz", payType: "mileage", units: 2210, rate: 0.55, gross: 1215.5 },
      { id: "hr-ps-3", runId, personId: "hp-3", personName: "Ray Okafor", payType: "mileage", units: 2980, rate: 0.68, gross: 2026.4 },
      { id: "hr-ps-4", runId, personId: "hp-4", personName: "Ashley Kim", payType: "hourly", units: 40, rate: 26.5, gross: 1060 },
    ].map((s) => {
      const fed = +(s.gross * 0.1).toFixed(2);
      const fica = +(s.gross * 0.0765).toFixed(2);
      const state = +(s.gross * 0.04).toFixed(2);
      const deductions = [
        { label: "Federal W/H", amount: fed },
        { label: "FICA", amount: fica },
        { label: "State W/H", amount: state },
      ];
      const totalDeductions = +(fed + fica + state).toFixed(2);
      const net = +(s.gross - totalDeductions).toFixed(2);
      return { ...s, deductions: JSON.stringify(deductions), totalDeductions, net };
    });
    const totalGross = +stmts.reduce((a, s) => a + s.gross, 0).toFixed(2);
    const totalNet = +stmts.reduce((a, s) => a + s.net, 0).toFixed(2);

    await db.insert(schema.hrPayrollRuns).values({
      id: runId, periodStart: start, periodEnd: end, status: "finalized",
      totalGross, totalNet, headcount: stmts.length,
    });
    await db.insert(schema.hrPayStatements).values(stmts);

    hrSeeded = true;
  } catch (e) {
    console.error("HR seed error:", e);
  }
}
