/**
 * Driver Health Recovery & Turnaround Strategy — client shim over the real API.
 *
 * The original version held all of this content in the browser and never stored
 * a plan anywhere: createRecoveryPlan() returned an object and the driver lost
 * it on refresh. Original preserved at
 * docs/launch/driverHealthRecovery.ORIGINAL.js.txt.
 *
 * The catalog constants below are kept so DriverHealthRecoveryPage.jsx renders
 * instantly without a round trip. Plans are now created and resumed through
 * /api/recovery, which persists them.
 *
 * This is a recovery-logistics tool, not medical advice. Only a certified FMCSA
 * medical examiner can disqualify or clear a driver.
 */

export const MEDICAL_DISCLAIMER =
  'This is a recovery-logistics tool, not medical advice. Only a certified FMCSA medical examiner can disqualify or clear a driver.';

export const HEALTH_FAILURE_CATEGORIES = {
  VISION: {
    name: 'Vision Issues', code: 'VISION-FAIL', icon: '👁️',
    description: 'Corrected or uncorrected vision below 20/40',
    failureReasons: ['Uncorrected vision needing glasses/contacts', 'Eye disease (cataracts, macular degeneration)', 'Color blindness severity', 'Visual field restrictions'],
  },
  HEARING: {
    name: 'Hearing Deficiency', code: 'HEARING-FAIL', icon: '🔊',
    description: 'Unable to perceive whispered voice at 5 ft in one or both ears',
    failureReasons: ['Age-related hearing loss', 'Noise-induced hearing loss', 'Ear infection/fluid', 'Hearing aid not functioning'],
  },
  BLOOD_PRESSURE: {
    name: 'Hypertension', code: 'BP-FAIL', icon: '💓',
    description: 'Systolic ≥140 or diastolic ≥90 mmHg',
    failureReasons: ['Unmedicated hypertension', 'Medication side effects', 'White coat syndrome (test anxiety)', 'Recent salt/caffeine intake'],
  },
  DIABETES: {
    name: 'Diabetes Complications', code: 'DIABETES-FAIL', icon: '🩺',
    description: 'Uncontrolled diabetes or diabetic complications',
    failureReasons: ['Blood sugar not controlled', 'Neuropathy affecting driving', 'Vision loss from diabetes', 'Recent diagnosis'],
  },
  CARDIAC: {
    name: 'Cardiac Issues', code: 'CARDIAC-FAIL', icon: '❤️',
    description: 'Heart condition that may affect safe driving',
    failureReasons: ['Uncontrolled arrhythmia', 'Recent heart attack or stent', 'Congestive heart failure', 'Syncope (fainting) history'],
  },
  MENTAL_HEALTH: {
    name: 'Mental Health/Sleep', code: 'MENTAL-FAIL', icon: '🧠',
    description: 'Untreated depression, sleep apnea, or other conditions',
    failureReasons: ['Untreated sleep apnea', 'Untreated depression', 'Untreated anxiety disorder', 'Medication side effects'],
  },
  SUBSTANCE: {
    name: 'Substance Use', code: 'SUBSTANCE-FAIL', icon: '⚠️',
    description: 'DUI conviction or substance abuse indicators',
    failureReasons: ['DUI within past 3 years', 'Positive drug/alcohol test', 'Ongoing substance use disorder', 'Failed to disclose use'],
  },
  NEUROLOGICAL: {
    name: 'Neurological Condition', code: 'NEURO-FAIL', icon: '🧬',
    description: 'Seizure, epilepsy, or other neurological disorder',
    failureReasons: ['Uncontrolled seizures', 'Recent seizure', 'Unmedicated epilepsy', 'Blackout/LOC episodes'],
  },
};

export const RECOVERY_STRATEGIES = {
  IMMEDIATE_DISQUALIFICATION: {
    level: 'SEVERE', icon: '🚫', daysToRetest: null,
    requirements: ['Major surgery or recent major medical event', 'Uncontrolled condition requiring specialist clearance', 'Multiple serious failures', 'Loss of consciousness in past 12 months'],
    recoveryPath: 'Specialist-led medical intervention; FMCSA exemption petition possible after 1-2 years',
  },
  TEMPORARY_SUSPENSION: {
    level: 'SERIOUS', icon: '⏸️', daysToRetest: 90,
    requirements: ['Uncontrolled hypertension (≥150/100)', 'Recent cardiac event (< 3 months)', 'Unmedicated diabetes', 'Active substance use'],
    recoveryPath: 'Medical treatment + specialist clearance + reassessment after 90 days',
  },
  CONDITIONAL_RETURN: {
    level: 'MODERATE', icon: '⚠️', daysToRetest: 30,
    requirements: ['Controlled condition with medication adjustment', 'Vision/hearing correctable', 'Sleep apnea with CPAP', 'Borderline hypertension'],
    recoveryPath: 'Treatment plan + retest after 30 days',
  },
  IMMEDIATE_CLEARANCE: {
    level: 'MINOR', icon: '✓', daysToRetest: 0,
    requirements: ['White coat syndrome (retake immediately)', 'Correctable vision/hearing', 'Medication refill needed', 'Test administration error'],
    recoveryPath: 'Retest same week, no waiting period',
  },
};

export const RECOVERY_TIMELINES = {
  vision: { min: 7, max: 14, avgCost: '$100-$300' },
  hearing: { min: 21, max: 60, avgCost: '$1500-$6000' },
  blood_pressure: { min: 30, max: 60, avgCost: '$50-$200' },
  bloodPressure: { min: 30, max: 60, avgCost: '$50-$200' },
  diabetes: { min: 90, max: 120, avgCost: '$100-$500' },
  cardiac: { min: 60, max: 180, avgCost: '$1000-$5000' },
  mental_health: { min: 30, max: 90, avgCost: '$500-$2000' },
  mentalHealth: { min: 30, max: 90, avgCost: '$500-$2000' },
  substance: { min: 90, max: 365, avgCost: '$1000-$10000' },
  neurological: { min: 60, max: 180, avgCost: '$500-$3000' },
};

export const FINANCIAL_ASSISTANCE = [
  { name: 'Driver Health Fund', description: 'Direct grants up to $2,000 for medical costs', eligibility: 'Owner-operators, company drivers', contact: 'trucking.org/health-fund' },
  { name: 'American Trucking Associations Scholarship', description: 'Health/wellness grants for drivers', eligibility: 'ATA member company drivers', contact: 'ata.org/scholarships' },
  { name: 'Vision Benefits', description: 'Free eye exams via VSP, EyeMed networks', eligibility: 'Included in most health plans', contact: 'Your insurance provider' },
  { name: 'Medicaid DOT Physical Coverage', description: 'Free/low-cost physicals for low-income drivers', eligibility: 'Income-qualified individuals', contact: 'medicaid.gov (state-specific)' },
  { name: 'Community Health Centers', description: 'Sliding-scale fees for uninsured drivers', eligibility: 'Uninsured individuals', contact: 'findahealthcenter.hrsa.gov' },
];

/** Populated on first catalog fetch so the step scripts always match the server. */
export let RECOVERY_ACTION_PLAN = {};

async function api(path, options) {
  const res = await fetch(`/api/recovery${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

export async function loadCatalog() {
  const cat = await api('/catalog');
  return cat;
}

export async function getCategory(category) {
  const out = await api(`/catalog/${encodeURIComponent(category)}`);
  if (out.actionPlan) RECOVERY_ACTION_PLAN = { ...RECOVERY_ACTION_PLAN, [category]: out.actionPlan };
  return out;
}

/** Creates AND persists the plan. Returns the stored row, including its id. */
export async function createRecoveryPlan(failureCategory, driverId, failureDetails = {}) {
  const out = await api('/plans', {
    method: 'POST',
    body: JSON.stringify({ failureCategory, driverId, failureDetails }),
  });
  if (out.plan?.actionPlan) RECOVERY_ACTION_PLAN = { ...RECOVERY_ACTION_PLAN, [failureCategory]: out.plan.actionPlan };
  return out.plan;
}

export async function getRecoveryPlans(driverId) {
  const out = await api(`/plans/${encodeURIComponent(driverId)}`);
  return out.plans || [];
}

export async function completeStep(planId, step) {
  const out = await api(`/plans/${encodeURIComponent(planId)}/step`, {
    method: 'POST',
    body: JSON.stringify({ step }),
  });
  return out.plan;
}

/**
 * Works both ways: pass a persisted plan id to ask the server, or pass the plan
 * object plus completed steps to resolve locally (original signature).
 */
export async function getNextAction(recoveryPlan, completedSteps = []) {
  if (typeof recoveryPlan === 'string') {
    const out = await api(`/plans/${encodeURIComponent(recoveryPlan)}/next-action`);
    return out.next;
  }
  const plan = recoveryPlan?.actionPlan || [];
  if (plan.length === 0) {
    return { step: 1, title: 'Consult Healthcare Provider', message: 'Contact a medical professional immediately' };
  }
  const done = completedSteps.length ? completedSteps : recoveryPlan?.completedSteps || [];
  const next = plan.find((a) => !done.includes(a.step));
  return next || { step: 'complete', title: 'Ready for Retest', message: 'Every recovery step is logged. Schedule the medical retest — only the examiner can certify you.' };
}

export function estimateRetestDate(failureCategory, startDate = new Date()) {
  const key = String(failureCategory || '').toLowerCase();
  const timeline = RECOVERY_TIMELINES[key];
  if (!timeline) return null;
  const DAY = 24 * 60 * 60 * 1000;
  return {
    earliest: new Date(startDate.getTime() + timeline.min * DAY),
    latest: new Date(startDate.getTime() + timeline.max * DAY),
    expectedDays: Math.round((timeline.min + timeline.max) / 2),
  };
}

export default {
  MEDICAL_DISCLAIMER,
  HEALTH_FAILURE_CATEGORIES,
  RECOVERY_STRATEGIES,
  RECOVERY_TIMELINES,
  FINANCIAL_ASSISTANCE,
  loadCatalog,
  getCategory,
  createRecoveryPlan,
  getRecoveryPlans,
  completeStep,
  getNextAction,
  estimateRetestDate,
};
