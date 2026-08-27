import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { desc, eq } from "drizzle-orm";

/**
 * DOT physical failure recovery — server-side.
 *
 * The original driverHealthRecovery.js was pure client-side data with no
 * persistence: createRecoveryPlan() built an object, nothing stored it, and the
 * driver lost the plan on refresh. The content itself is good and is carried
 * over almost verbatim. What's new is that plans, completed steps, and retest
 * windows are actually saved and can be resumed.
 */

export const MEDICAL_DISCLAIMER =
  "This is a recovery-logistics tool, not medical advice. Only a certified FMCSA medical examiner can disqualify or clear a driver. Nothing here replaces your doctor or your examiner.";

export const HEALTH_FAILURE_CATEGORIES = {
  VISION: { name: "Vision Issues", code: "VISION-FAIL", description: "Corrected or uncorrected vision below 20/40", failureReasons: ["Uncorrected vision needing glasses/contacts", "Eye disease (cataracts, macular degeneration)", "Color blindness severity", "Visual field restrictions"] },
  HEARING: { name: "Hearing Deficiency", code: "HEARING-FAIL", description: "Unable to perceive whispered voice at 5 ft in one or both ears", failureReasons: ["Age-related hearing loss", "Noise-induced hearing loss", "Ear infection/fluid", "Hearing aid not functioning"] },
  BLOOD_PRESSURE: { name: "Hypertension", code: "BP-FAIL", description: "Systolic ≥140 or diastolic ≥90 mmHg", failureReasons: ["Unmedicated hypertension", "Medication side effects", "White coat syndrome (test anxiety)", "Recent salt/caffeine intake"] },
  DIABETES: { name: "Diabetes Complications", code: "DIABETES-FAIL", description: "Uncontrolled diabetes or diabetic complications", failureReasons: ["Blood sugar not controlled", "Neuropathy affecting driving", "Vision loss from diabetes", "Recent diagnosis"] },
  CARDIAC: { name: "Cardiac Issues", code: "CARDIAC-FAIL", description: "Heart condition that may affect safe driving", failureReasons: ["Uncontrolled arrhythmia", "Recent heart attack or stent", "Congestive heart failure", "Syncope (fainting) history"] },
  MENTAL_HEALTH: { name: "Mental Health / Sleep", code: "MENTAL-FAIL", description: "Untreated depression, sleep apnea, or other conditions", failureReasons: ["Untreated sleep apnea", "Untreated depression", "Untreated anxiety disorder", "Medication side effects"] },
  SUBSTANCE: { name: "Substance Use", code: "SUBSTANCE-FAIL", description: "DUI conviction or substance abuse indicators", failureReasons: ["DUI within past 3 years", "Positive drug/alcohol test", "Ongoing substance use disorder", "Failed to disclose use"] },
  NEUROLOGICAL: { name: "Neurological Condition", code: "NEURO-FAIL", description: "Seizure, epilepsy, or other neurological disorder", failureReasons: ["Uncontrolled seizures", "Recent seizure", "Unmedicated epilepsy", "Blackout / loss-of-consciousness episodes"] },
} as const;

export type FailureCategory = keyof typeof HEALTH_FAILURE_CATEGORIES;

export const RECOVERY_STRATEGIES = {
  IMMEDIATE_DISQUALIFICATION: { level: "SEVERE", daysToRetest: null, requirements: ["Major surgery or recent major medical event", "Uncontrolled condition requiring specialist clearance", "Multiple serious failures", "Loss of consciousness in past 12 months"], recoveryPath: "Specialist-led medical intervention; FMCSA exemption petition possible after 1-2 years" },
  TEMPORARY_SUSPENSION: { level: "SERIOUS", daysToRetest: 90, requirements: ["Uncontrolled hypertension (≥150/100)", "Recent cardiac event (< 3 months)", "Unmedicated diabetes", "Active substance use"], recoveryPath: "Medical treatment + specialist clearance + reassessment after 90 days" },
  CONDITIONAL_RETURN: { level: "MODERATE", daysToRetest: 30, requirements: ["Controlled condition with medication adjustment", "Vision/hearing correctable", "Sleep apnea with CPAP", "Borderline hypertension"], recoveryPath: "Treatment plan + retest after 30 days" },
  IMMEDIATE_CLEARANCE: { level: "MINOR", daysToRetest: 0, requirements: ["White coat syndrome (retake immediately)", "Correctable vision/hearing", "Medication refill needed", "Test administration error"], recoveryPath: "Retest same week, no waiting period" },
} as const;

type Step = { step: number; title: string; timeline: string; actions: string[]; resources?: string[] };

export const RECOVERY_ACTION_PLAN: Partial<Record<FailureCategory, Step[]>> = {
  VISION: [
    { step: 1, title: "Get an eye exam", timeline: "3-5 days", actions: ["Schedule with an optometrist or ophthalmologist, not a glasses counter", "Bring a copy of the failed physical", "Get a prescription if needed", "Ask the examiner to verify 20/40 corrected"], resources: ["VSP Vision Care: vspdirect.com", "EyeMed: eyemed.com", "Zenni: zenni.com"] },
    { step: 2, title: "Verify the prescription", timeline: "Same day as exam", actions: ["Confirm glasses/contacts correct to 20/40 or better", "Wear them full time while driving — non-negotiable", "Keep a backup pair in the truck"] },
    { step: 3, title: "Schedule the retest", timeline: "1 week after glasses arrive", actions: ["Contact the original medical examiner", "Bring new glasses plus exam results", "Arrive rested; early morning is best"] },
  ],
  HEARING: [
    { step: 1, title: "Get a hearing test", timeline: "3-5 days", actions: ["See an audiologist, not a hearing-aid salesman", "Get a formal audiogram document", "Determine whether the loss is treatable"], resources: ["American Academy of Audiology: audiology.org", "Costco Hearing Center", "VA benefits: va.gov if you served"] },
    { step: 2, title: "Get a hearing aid if needed", timeline: "2-4 weeks", actions: ["Get the aid fitted and adjusted", "Wear it while driving and at the retest", "Track battery and maintenance", "Get written audiologist approval for FMCSA"] },
    { step: 3, title: "Medical examiner clearance", timeline: "1 week after fitting", actions: ["Return to the examiner with the device", "Retest with the device in place", "Get the clearance letter"] },
  ],
  BLOOD_PRESSURE: [
    { step: 1, title: "Home BP monitoring", timeline: "Start now, 14 days", actions: ["Buy a home cuff (Omron, Withings)", "Take BP daily at the same time", "Log two weeks of readings", "Bring the log to your doctor"], resources: ["Free BP checks at Walgreens and CVS", "Nurse line through your insurance"] },
    { step: 2, title: "Doctor visit", timeline: "Within 1 week", actions: ["See primary care or cardiology", "Bring the BP log", "Get medication started or adjusted", "Raise white coat syndrome if home readings are normal"] },
    { step: 3, title: "Lifestyle changes", timeline: "Start immediately, 4-week commitment", actions: ["Sodium under 2,300 mg/day", "Caffeine under 200 mg/day", "30 minutes walking daily", "Stress reduction", "Weight management"] },
    { step: 4, title: "Retest", timeline: "30-45 days on medication plus lifestyle changes", actions: ["Take BP at home the morning of the retest and log it", "Arrive 15 minutes early and sit quietly", "Tell the examiner about medication and home readings"] },
  ],
  DIABETES: [
    { step: 1, title: "Endocrinologist appointment", timeline: "1-2 weeks", actions: ["Get a referral from primary care", "See an endocrinologist", "Get an A1C test", "Review the current treatment plan"] },
    { step: 2, title: "Treatment adjustment", timeline: "2-4 weeks", actions: ["Adjust insulin or oral medication", "Get a glucose meter and supplies", "Test 3-4x daily to find patterns", "Attend a diabetes education class"] },
    { step: 3, title: "Neuropathy assessment", timeline: "Within 4 weeks", actions: ["Have feet and legs checked for nerve damage", "Evaluate whether it affects driving ability", "Physical therapy if indicated"] },
    { step: 4, title: "Retest", timeline: "After A1C controlled ~90 days", actions: ["New A1C one week before the retest", "Bring results to the examiner", "Target A1C under 8.0 for commercial certification"] },
  ],
  CARDIAC: [
    { step: 1, title: "Cardiologist evaluation", timeline: "URGENT — within 1 week", actions: ["Get a cardiology referral immediately", "Provide all test results and medications", "EKG and stress test as ordered", "Full workup on driving safety"] },
    { step: 2, title: "Medical stabilization", timeline: "4-12 weeks", actions: ["Follow the treatment plan exactly", "No missed doses", "Cardiac rehab if recommended", "Keep every follow-up"] },
    { step: 3, title: "Clearance letter", timeline: "After stabilization", actions: ["Written letter from the cardiologist", "It must state safe for commercial driving duties", "Note any restrictions"] },
    { step: 4, title: "Examiner retest", timeline: "With the clearance letter in hand", actions: ["Bring all cardiac results plus the letter", "A second-opinion examiner may be required", "Certification issued if approved"] },
  ],
  MENTAL_HEALTH: [
    { step: 1, title: "Screening", timeline: "1 week", actions: ["See a therapist or psychiatrist", "Complete PHQ-9 / GAD-7 screening", "Sleep apnea screening if suspected", "Get an honest driving-safety assessment"], resources: ["SAMHSA Helpline: 1-800-662-4357 (free, confidential)", "BetterHelp / Talkspace", "Home sleep test or sleep lab"] },
    { step: 2, title: "Treatment plan", timeline: "2-8 weeks", actions: ["Weekly therapy minimum", "Start medication if prescribed", "If sleep apnea: CPAP plus a 30-day use log", "Track mood and energy daily"] },
    { step: 3, title: "Stability checkpoint", timeline: "4-8 weeks in", actions: ["Provider reassesses driving safety", "Document improvement", "Download CPAP compliance data", "Get the clearance letter"] },
    { step: 4, title: "Retest", timeline: "With provider clearance", actions: ["Give the examiner the clearance letter", "Report treatment compliance", "Expect annual rather than 2-year certification"] },
  ],
  SUBSTANCE: [
    { step: 1, title: "SAP evaluation", timeline: "URGENT — within 3 days", actions: ["Complete a Substance Abuse Professional evaluation", "The SAP must be DOT-qualified under 49 CFR Part 40", "Be honest about severity", "Get the SAP treatment referral"], resources: ["SAMHSA Find Treatment: findtreatment.gov", "AA / NA: aa.org, na.org (free)", "49 CFR 382.605 governs return-to-duty"] },
    { step: 2, title: "Treatment completion", timeline: "4-12 weeks per SAP", actions: ["Complete the SAP-recommended program", "100% session attendance", "Pass required tests", "Get the SAP return-to-duty clearance"] },
    { step: 3, title: "Follow-up testing", timeline: "12 months minimum", actions: ["Follow-up testing schedule set by the SAP, employer-administered", "SAP follow-up evaluations", "Document support group attendance", "No failed tests"] },
    { step: 4, title: "Medical certification", timeline: "After return-to-duty and follow-up testing", actions: ["Examiner reviews the SAP clearance", "Certification issued if all conditions are met"] },
  ],
  NEUROLOGICAL: [
    { step: 1, title: "Neurologist evaluation", timeline: "URGENT — within 1 week", actions: ["Get a neurology referral", "EEG / imaging as ordered", "Establish the seizure or episode history precisely", "Ask directly about FMCSA disqualification criteria"] },
    { step: 2, title: "Control and documentation", timeline: "Ongoing, seizure-free interval required", actions: ["Medication compliance with no missed doses", "Keep a dated episode log", "Understand that a seizure history carries a long seizure-free requirement", "Discuss the FMCSA exemption program with the neurologist"] },
    { step: 3, title: "Clearance and retest", timeline: "After the required seizure-free interval", actions: ["Written neurologist clearance", "Bring the full record to the examiner", "Be prepared for a denial and an exemption route"] },
  ],
};

export const RECOVERY_TIMELINES: Record<string, { min: number; max: number; avgCost: string }> = {
  vision: { min: 7, max: 14, avgCost: "$100-$300" },
  hearing: { min: 21, max: 60, avgCost: "$1500-$6000" },
  blood_pressure: { min: 30, max: 60, avgCost: "$50-$200" },
  diabetes: { min: 90, max: 120, avgCost: "$100-$500" },
  cardiac: { min: 60, max: 180, avgCost: "$1000-$5000" },
  mental_health: { min: 30, max: 90, avgCost: "$500-$2000" },
  substance: { min: 90, max: 365, avgCost: "$1000-$10000" },
  neurological: { min: 60, max: 180, avgCost: "$500-$3000" },
};

export const FINANCIAL_ASSISTANCE = [
  { name: "Driver Health Fund", description: "Direct grants up to $2,000 for medical costs", eligibility: "Owner-operators, company drivers", contact: "trucking.org/health-fund" },
  { name: "American Trucking Associations scholarships", description: "Health and wellness grants for drivers", eligibility: "ATA member company drivers", contact: "ata.org/scholarships" },
  { name: "Vision benefits", description: "Free eye exams via VSP and EyeMed networks", eligibility: "Included in most health plans", contact: "Your insurance provider" },
  { name: "Medicaid DOT physical coverage", description: "Free or low-cost physicals for low-income drivers", eligibility: "Income-qualified individuals", contact: "medicaid.gov (state-specific)" },
  { name: "Community health centers", description: "Sliding-scale fees for uninsured drivers", eligibility: "Uninsured individuals", contact: "findahealthcenter.hrsa.gov" },
];

const DAY = 86_400_000;

function timelineFor(category: string) {
  return RECOVERY_TIMELINES[category.toLowerCase()] ?? { min: 30, max: 90, avgCost: "unknown" };
}

export function estimateRetestDate(category: string, startDate = new Date()) {
  const t = timelineFor(category);
  return {
    earliest: new Date(+startDate + t.min * DAY),
    latest: new Date(+startDate + t.max * DAY),
    expectedDays: Math.round((t.min + t.max) / 2),
  };
}

export const recovery = new Hono()
  .get("/catalog", (c) =>
    c.json({
      disclaimer: MEDICAL_DISCLAIMER,
      categories: HEALTH_FAILURE_CATEGORIES,
      strategies: RECOVERY_STRATEGIES,
      timelines: RECOVERY_TIMELINES,
      financialAssistance: FINANCIAL_ASSISTANCE,
      actionPlanCategories: Object.keys(RECOVERY_ACTION_PLAN),
    }),
  )

  .get("/catalog/:category", (c) => {
    const key = c.req.param("category").toUpperCase() as FailureCategory;
    const cat = HEALTH_FAILURE_CATEGORIES[key];
    if (!cat) return c.json({ error: "Unknown failure category", allowed: Object.keys(HEALTH_FAILURE_CATEGORIES) }, 404);
    return c.json({ disclaimer: MEDICAL_DISCLAIMER, category: key, ...cat, actionPlan: RECOVERY_ACTION_PLAN[key] ?? [], timeline: timelineFor(key) });
  })

  .post("/plans", async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const driverId = b.driverId ?? b.driver_id;
    const category = String(b.failureCategory ?? b.category ?? "").toUpperCase() as FailureCategory;
    if (!driverId) return c.json({ error: "driverId is required" }, 400);
    if (!HEALTH_FAILURE_CATEGORIES[category]) {
      return c.json({ error: "Unknown failure category", allowed: Object.keys(HEALTH_FAILURE_CATEGORIES) }, 400);
    }
    const t = timelineFor(category);
    const start = new Date();
    const id = `hrp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await db.insert(schema.healthRecoveryPlans).values({
      id,
      driverId,
      failureCategory: category,
      failureDetails: JSON.stringify(b.failureDetails ?? b.details ?? {}),
      status: "active",
      completedSteps: JSON.stringify([]),
      minDays: t.min,
      maxDays: t.max,
      estimatedCost: t.avgCost,
      retestEarliest: new Date(+start + t.min * DAY),
      retestLatest: new Date(+start + t.max * DAY),
    });
    const [plan] = await db.select().from(schema.healthRecoveryPlans).where(eq(schema.healthRecoveryPlans.id, id));
    return c.json({ ok: true, disclaimer: MEDICAL_DISCLAIMER, plan: hydrate(plan) }, 201);
  })

  .get("/plans/:driverId", async (c) => {
    const rows = await db.select().from(schema.healthRecoveryPlans)
      .where(eq(schema.healthRecoveryPlans.driverId, c.req.param("driverId")))
      .orderBy(desc(schema.healthRecoveryPlans.createdAt));
    return c.json({ disclaimer: MEDICAL_DISCLAIMER, count: rows.length, plans: rows.map(hydrate) });
  })

  .post("/plans/:id/step", async (c) => {
    const id = c.req.param("id");
    const b = await c.req.json().catch(() => ({}));
    const step = Number(b.step);
    const [plan] = await db.select().from(schema.healthRecoveryPlans).where(eq(schema.healthRecoveryPlans.id, id)).limit(1);
    if (!plan) return c.json({ error: "Unknown plan" }, 404);
    const steps: number[] = plan.completedSteps ? JSON.parse(plan.completedSteps) : [];
    if (!Number.isFinite(step)) return c.json({ error: "step must be a number" }, 400);
    if (!steps.includes(step)) steps.push(step);
    const total = (RECOVERY_ACTION_PLAN[plan.failureCategory as FailureCategory] ?? []).length;
    const allDone = total > 0 && steps.length >= total;
    await db.update(schema.healthRecoveryPlans)
      .set({ completedSteps: JSON.stringify(steps), status: allDone ? "retest_ready" : plan.status, updatedAt: new Date() })
      .where(eq(schema.healthRecoveryPlans.id, id));
    const [updated] = await db.select().from(schema.healthRecoveryPlans).where(eq(schema.healthRecoveryPlans.id, id));
    return c.json({ ok: true, disclaimer: MEDICAL_DISCLAIMER, plan: hydrate(updated) });
  })

  .get("/plans/:id/next-action", async (c) => {
    const [plan] = await db.select().from(schema.healthRecoveryPlans).where(eq(schema.healthRecoveryPlans.id, c.req.param("id"))).limit(1);
    if (!plan) return c.json({ error: "Unknown plan" }, 404);
    const steps: number[] = plan.completedSteps ? JSON.parse(plan.completedSteps) : [];
    const actionPlan = RECOVERY_ACTION_PLAN[plan.failureCategory as FailureCategory] ?? [];
    if (actionPlan.length === 0) {
      return c.json({ disclaimer: MEDICAL_DISCLAIMER, next: { step: 1, title: "Consult a healthcare provider", message: "No scripted plan exists for this category. Start with your doctor and your medical examiner." } });
    }
    const next = actionPlan.find((a) => !steps.includes(a.step));
    return c.json({
      disclaimer: MEDICAL_DISCLAIMER,
      completed: steps,
      remaining: actionPlan.length - steps.length,
      next: next ?? { step: "complete", title: "Ready for retest", message: "Every recovery step is logged as done. Schedule the medical retest — only the examiner can certify you." },
    });
  })

  .post("/plans/:id/status", async (c) => {
    const id = c.req.param("id");
    const b = await c.req.json().catch(() => ({}));
    const status = String(b.status ?? "");
    const allowed = ["active", "retest_ready", "cleared", "abandoned"];
    if (!allowed.includes(status)) return c.json({ error: "Invalid status", allowed }, 400);
    const res = await db.update(schema.healthRecoveryPlans)
      .set({ status, clearedAt: status === "cleared" ? new Date() : null, updatedAt: new Date() })
      .where(eq(schema.healthRecoveryPlans.id, id)).returning();
    if (res.length === 0) return c.json({ error: "Unknown plan" }, 404);
    return c.json({ ok: true, disclaimer: MEDICAL_DISCLAIMER, plan: hydrate(res[0]) });
  });

function hydrate(row: typeof schema.healthRecoveryPlans.$inferSelect) {
  const cat = row.failureCategory as FailureCategory;
  return {
    ...row,
    failureDetails: row.failureDetails ? JSON.parse(row.failureDetails) : {},
    completedSteps: row.completedSteps ? JSON.parse(row.completedSteps) : [],
    categoryDetails: HEALTH_FAILURE_CATEGORIES[cat] ?? null,
    actionPlan: RECOVERY_ACTION_PLAN[cat] ?? [],
  };
}
