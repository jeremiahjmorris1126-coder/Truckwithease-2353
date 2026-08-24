/**
 * Driver Health Recovery & Turnaround Strategy
 * Complete recovery plan when drivers fail physicals or health checks
 * Direct action steps, medical clarity, timeline, coaching, retest support
 */

// Physical test failure categories with recovery paths
export const HEALTH_FAILURE_CATEGORIES = {
  VISION: {
    name: 'Vision Issues',
    code: 'VISION-FAIL',
    icon: '👁️',
    description: 'Corrected or uncorrected vision below 20/40',
    failureReasons: [
      'Uncorrected vision needing glasses/contacts',
      'Eye disease (cataracts, macular degeneration)',
      'Color blindness severity',
      'Visual field restrictions',
    ],
  },
  HEARING: {
    name: 'Hearing Deficiency',
    code: 'HEARING-FAIL',
    icon: '🔊',
    description: 'Unable to perceive whispered voice at 5 ft in one or both ears',
    failureReasons: [
      'Age-related hearing loss',
      'Noise-induced hearing loss',
      'Ear infection/fluid',
      'Hearing aid not functioning',
    ],
  },
  BLOOD_PRESSURE: {
    name: 'Hypertension',
    code: 'BP-FAIL',
    icon: '💓',
    description: 'Systolic ≥140 or Diastolic ≥90 mmHg',
    failureReasons: [
      'Unmedicated hypertension',
      'Medication side effects',
      'White coat syndrome (test anxiety)',
      'Recent salt/caffeine intake',
    ],
  },
  DIABETES: {
    name: 'Diabetes Complications',
    code: 'DIABETES-FAIL',
    icon: '🩺',
    description: 'Uncontrolled diabetes or diabetic complications',
    failureReasons: [
      'Blood sugar not controlled',
      'Neuropathy (nerve damage) affecting driving',
      'Vision loss from diabetes',
      'Recent diagnosis',
    ],
  },
  CARDIAC: {
    name: 'Cardiac Issues',
    code: 'CARDIAC-FAIL',
    icon: '❤️',
    description: 'Heart condition that may affect safe driving',
    failureReasons: [
      'Uncontrolled arrhythmia',
      'Recent heart attack or stent',
      'Congestive heart failure',
      'Syncope (fainting) history',
    ],
  },
  MENTAL_HEALTH: {
    name: 'Mental Health/Sleep',
    code: 'MENTAL-FAIL',
    icon: '🧠',
    description: 'Untreated depression, sleep apnea, or other conditions',
    failureReasons: [
      'Untreated sleep apnea',
      'Untreated depression',
      'Untreated anxiety disorder',
      'Medication side effects',
    ],
  },
  SUBSTANCE: {
    name: 'Substance Use',
    code: 'SUBSTANCE-FAIL',
    icon: '⚠️',
    description: 'DUI conviction or substance abuse indicators',
    failureReasons: [
      'DUI within past 3 years',
      'Positive drug/alcohol test',
      'Ongoing substance use disorder',
      'Failed to disclose use',
    ],
  },
  NEUROLOGICAL: {
    name: 'Neurological Condition',
    code: 'NEURO-FAIL',
    icon: '🧬',
    description: 'Seizure, epilepsy, or other neurological disorder',
    failureReasons: [
      'Uncontrolled seizures',
      'Recent seizure',
      'Unmedicated epilepsy',
      'Blackout/LOC episodes',
    ],
  },
};

// Tiered recovery strategies by failure severity
export const RECOVERY_STRATEGIES = {
  IMMEDIATE_DISQUALIFICATION: {
    level: 'SEVERE',
    icon: '🚫',
    daysToRetest: null, // Permanent disqualification
    requirements: [
      'Major surgery or recent major medical event',
      'Uncontrolled condition requiring specialist clearance',
      'Multiple serious failures',
      'Loss of consciousness in past 12 months',
    ],
    recoveryPath: 'Specialist-led medical intervention with FMCSA waiver petition possible after 1-2 years',
  },
  TEMPORARY_SUSPENSION: {
    level: 'SERIOUS',
    icon: '⏸️',
    daysToRetest: 90,
    requirements: [
      'Uncontrolled hypertension (≥150/100)',
      'Recent cardiac event (< 3 months)',
      'Unmedicated diabetes',
      'Active substance use',
    ],
    recoveryPath: 'Medical treatment + specialist clearance + reassessment after 90 days',
  },
  CONDITIONAL_RETURN: {
    level: 'MODERATE',
    icon: '⚠️',
    daysToRetest: 30,
    requirements: [
      'Controlled condition with medication adjustment',
      'Vision/hearing correctable',
      'Sleep apnea (with CPAP)',
      'Borderline hypertension',
    ],
    recoveryPath: 'Treatment plan + retest after 30 days',
  },
  IMMEDIATE_CLEARANCE: {
    level: 'MINOR',
    icon: '✓',
    daysToRetest: 0,
    requirements: [
      'White coat syndrome (retake immediately)',
      'Correctable vision/hearing',
      'Medication refill needed',
      'Test admin error',
    ],
    recoveryPath: 'Retest same week, no waiting period',
  },
};

// Step-by-step recovery action plan
export const RECOVERY_ACTION_PLAN = {
  VISION_FAIL: [
    {
      step: 1,
      title: 'Get Eye Exam',
      timeline: '3-5 days',
      actions: [
        'Schedule appointment with optometrist/ophthalmologist (not just glasses store)',
        'Bring copy of failed physical results',
        'Get prescription if needed (glasses/contacts)',
        'Ask examiner to verify 20/40 corrected vision',
      ],
      resources: [
        'VSP Vision Care: vspdirect.com (largest vision network)',
        'EyeMed: eyemed.com (most affordable)',
        'Zenni: zenni.com (cheap online glasses)',
      ],
    },
    {
      step: 2,
      title: 'Verify Prescription',
      timeline: 'Same day as exam',
      actions: [
        'Ensure glasses/contacts correct vision to 20/40 or better',
        'Wear glasses full time while driving (non-negotiable)',
        'Keep backup pair in truck',
      ],
    },
    {
      step: 3,
      title: 'Schedule Retest',
      timeline: '1 week after glasses received',
      actions: [
        'Contact original medical examiner',
        'Bring new glasses + exam results',
        'Arrive rested, early morning best',
      ],
    },
  ],

  HEARING_FAIL: [
    {
      step: 1,
      title: 'Get Hearing Test',
      timeline: '3-5 days',
      actions: [
        'See audiologist (not just hearing aid seller)',
        'Get formal audiogram (test results document)',
        'Determine if hearing loss is treatable',
      ],
      resources: [
        'American Academy of Audiology: audiology.org (find certified)',
        'Costco Hearing Center: costco.com/hearing (affordable)',
        'VA Benefits: va.gov (if veteran)',
      ],
    },
    {
      step: 2,
      title: 'Get Hearing Aid (if needed)',
      timeline: '2-4 weeks',
      actions: [
        'If hearing loss: get hearing aid fitted and adjusted',
        'Wear during driving and medical retest',
        'Check battery/maintenance schedule',
        'Get audiologist written approval for FMCSA compliance',
      ],
    },
    {
      step: 3,
      title: 'Medical Examiner Clearance',
      timeline: '1 week after hearing aid fitted',
      actions: [
        'Return to medical examiner with hearing aid',
        'Retest with device to confirm 20/40 hearing standard met',
        'Get clearance letter',
      ],
    },
  ],

  BLOOD_PRESSURE_FAIL: [
    {
      step: 1,
      title: 'Home BP Monitoring',
      timeline: 'Immediately (next 14 days)',
      actions: [
        'Buy home blood pressure monitor (Omron, Withings recommended)',
        'Take BP daily at same time (morning before meds best)',
        'Log readings for 2 weeks',
        'Bring log to doctor',
      ],
      resources: [
        'Omron BP Monitor: amazon.com (most reliable)',
        'Free BP checks: Walgreens, CVS pharmacies',
        'Nurse hotlines: Your insurance plan or 811',
      ],
    },
    {
      step: 2,
      title: 'Doctor Visit',
      timeline: 'Within 1 week',
      actions: [
        'See primary care doctor or cardiologist',
        'Bring BP log showing readings',
        'Get medication adjustment or new prescription',
        'Discuss white coat syndrome if BP normal at home',
      ],
    },
    {
      step: 3,
      title: 'Lifestyle Changes (mandatory)',
      timeline: 'Start immediately, 4-week commitment',
      actions: [
        'Reduce sodium intake (<2,300mg/day)',
        'Limit caffeine (max 200mg/day = 1-2 cups coffee)',
        'Increase physical activity (30 min walking daily)',
        'Reduce stress (meditation, breathing exercises)',
        'Maintain healthy weight',
      ],
    },
    {
      step: 4,
      title: 'Retest',
      timeline: 'After 30-45 days on medication + lifestyle changes',
      actions: [
        'Take BP at home morning of retest (log it)',
        'See medical examiner',
        'Arrive 15 min early, sit quietly before exam',
        'Inform examiner of medication + home readings',
      ],
    },
  ],

  DIABETES_FAIL: [
    {
      step: 1,
      title: 'Endocrinologist Appointment',
      timeline: '1-2 weeks',
      actions: [
        'Get referral from primary care doctor',
        'See endocrinologist (diabetes specialist)',
        'Get A1C test (3-month blood sugar average)',
        'Discuss current treatment plan',
      ],
    },
    {
      step: 2,
      title: 'Treatment Adjustment',
      timeline: '2-4 weeks',
      actions: [
        'Adjust insulin/oral medications if needed',
        'Get glucose meter and supplies',
        'Test blood sugar 3-4x daily to find patterns',
        'Attend diabetes education class (many are free/low-cost)',
      ],
    },
    {
      step: 3,
      title: 'Neuropathy Assessment',
      timeline: 'Within 4 weeks',
      actions: [
        'Doctor checks for nerve damage affecting feet/legs (neuropathy)',
        'If present: evaluate if it affects driving ability',
        'Physical therapy if needed',
      ],
    },
    {
      step: 4,
      title: 'Retest',
      timeline: 'After A1C controlled for 90 days (usually after medication change)',
      actions: [
        'Get new A1C test 1 week before retest',
        'Bring results to medical examiner',
        'Aim for A1C <8.0 for commercial driving approval',
      ],
    },
  ],

  CARDIAC_FAIL: [
    {
      step: 1,
      title: 'Cardiologist Evaluation',
      timeline: 'URGENT - within 1 week',
      actions: [
        'Get cardiology referral immediately',
        'Provide all test results and medications',
        'Get EKG, stress test if needed',
        'Full cardiac workup to assess driving safety',
      ],
    },
    {
      step: 2,
      title: 'Medical Stabilization',
      timeline: '4-12 weeks (depends on condition)',
      actions: [
        'Follow cardiologist treatment plan',
        'Medication compliance (no missed doses)',
        'Cardiac rehabilitation program (if recommended)',
        'Regular follow-up appointments',
      ],
    },
    {
      step: 3,
      title: 'Cardiologist Clearance Letter',
      timeline: 'After stabilization',
      actions: [
        'Get written letter from cardiologist',
        'Letter must state: safe for commercial driving duties',
        'Specify any restrictions (weight limits, routes, hours)',
      ],
    },
    {
      step: 4,
      title: 'FMCSA Medical Examiner Retest',
      timeline: 'With cardiologist clearance letter',
      actions: [
        'Bring all cardiac test results + clearance letter',
        'May require second opinion examiner (FMCSA approves)',
        'Examiner provides certification if approved',
      ],
    },
  ],

  MENTAL_HEALTH_FAIL: [
    {
      step: 1,
      title: 'Mental Health Screening',
      timeline: '1 week',
      actions: [
        'See therapist or psychiatrist',
        'Complete depression/anxiety screening (PHQ-9, GAD-7)',
        'Sleep apnea screening if suspected',
        'Get honest assessment of condition & driving safety',
      ],
      resources: [
        'SAMHSA Helpline: 1-800-662-4357 (free, confidential)',
        'Therapy platforms: BetterHelp, Talkspace (affordable)',
        'Sleep apnea test: Home sleep test or sleep lab',
      ],
    },
    {
      step: 2,
      title: 'Treatment Plan',
      timeline: '2-8 weeks',
      actions: [
        'Start therapy (weekly minimum)',
        'Start medication if prescribed (compliance essential)',
        'If sleep apnea: get CPAP machine + 30-day use log',
        'Track mood/energy daily',
      ],
    },
    {
      step: 3,
      title: 'Stability Checkpoint',
      timeline: 'After 4-8 weeks',
      actions: [
        'Reassess with provider: driving safety evaluation',
        'Document improvement (therapy notes, medication compliance)',
        'If CPAP: confirm usage (data download)',
        'Get clearance letter from mental health provider',
      ],
    },
    {
      step: 4,
      title: 'Retest',
      timeline: 'With provider clearance',
      actions: [
        'Provide medical examiner with clearance letter',
        'Report treatment compliance (therapy, meds, CPAP)',
        'Expect ongoing monitoring (annual exams vs every 2 yrs)',
      ],
    },
  ],

  SUBSTANCE_FAIL: [
    {
      step: 1,
      title: 'Substance Abuse Evaluation',
      timeline: 'URGENT - within 3 days',
      actions: [
        'Complete Substance Abuse Professional (SAP) evaluation',
        'SAP must be SAMHSA certified',
        'Honest assessment of severity',
        'Get SAP referral for treatment if needed',
      ],
      resources: [
        'SAMHSA Find Treatment: findtreatment.gov',
        'AA/NA: aa.org, na.org (free)',
        'Hazmat Endorsement SAP: 49 CFR 382.605',
      ],
    },
    {
      step: 2,
      title: 'Treatment Completion',
      timeline: '4-12 weeks (depends on SAP recommendation)',
      actions: [
        'Complete SAP-recommended program (rehab, counseling, support group)',
        'Attend every session (100% compliance)',
        'Pass random drug tests if required',
        'Get SAP Return-to-Work clearance letter',
      ],
    },
    {
      step: 3,
      title: 'Ongoing Monitoring',
      timeline: 'Continuous for 12 months',
      actions: [
        'Random drug/alcohol testing (employer coordinated)',
        'SAP follow-up evaluations',
        'Support group attendance documentation',
        'No failed tests = full clearance after 12 months',
      ],
    },
    {
      step: 4,
      title: 'Medical Certification',
      timeline: 'After treatment + 12-month monitoring',
      actions: [
        'Medical examiner reviews SAP clearance',
        'May require HIS (Hair Follicle) test for long-term confirmation',
        'Certification issued if all conditions met',
      ],
    },
  ],
};

// Timeline and cost estimates
export const RECOVERY_TIMELINES = {
  vision: { min: 7, max: 14, avgCost: '$100-$300' },
  hearing: { min: 21, max: 60, avgCost: '$1500-$6000' },
  bloodPressure: { min: 30, max: 60, avgCost: '$50-$200' },
  diabetes: { min: 90, max: 120, avgCost: '$100-$500' },
  cardiac: { min: 60, max: 180, avgCost: '$1000-$5000' },
  mentalHealth: { min: 30, max: 90, avgCost: '$500-$2000' },
  substance: { min: 90, max: 365, avgCost: '$1000-$10000' },
  neurological: { min: 60, max: 180, avgCost: '$500-$3000' },
};

// Financial assistance options
export const FINANCIAL_ASSISTANCE = [
  {
    name: 'Driver Health Fund',
    description: 'Direct grants up to $2,000 for medical costs',
    eligibility: 'Owner-operators, company drivers',
    contact: 'trucking.org/health-fund',
  },
  {
    name: 'American Trucking Associations Scholarship',
    description: 'Health/wellness grants for drivers',
    eligibility: 'ATA member company drivers',
    contact: 'ata.org/scholarships',
  },
  {
    name: 'Vision Benefits',
    description: 'Free eye exams via VSP, EyeMed networks',
    eligibility: 'Most health insurance plans include',
    contact: 'Your insurance provider',
  },
  {
    name: 'Medicaid DOT Physical Coverage',
    description: 'Free/low-cost physicals for low-income drivers',
    eligibility: 'Income-qualified individuals',
    contact: 'medicaid.gov (state-specific)',
  },
  {
    name: 'Community Health Centers',
    description: 'Sliding-scale fees for uninsured drivers',
    eligibility: 'Uninsured individuals',
    contact: 'findahealthcenter.hrsa.gov',
  },
];

/**
 * Create personalized recovery plan for driver
 */
export function createRecoveryPlan(failureCategory, driverId, failureDetails = {}) {
  const category = HEALTH_FAILURE_CATEGORIES[failureCategory];
  const actionPlan = RECOVERY_ACTION_PLAN[failureCategory];
  const timeline = RECOVERY_TIMELINES[failureCategory.toLowerCase()] || { min: 30, max: 90 };

  return {
    driverId,
    failureCategory,
    categoryDetails: category,
    actionPlan: actionPlan || [],
    estimatedTimeline: {
      minDays: timeline.min,
      maxDays: timeline.max,
      estimatedRetestDate: new Date(Date.now() + timeline.min * 24 * 60 * 60 * 1000),
    },
    estimatedCost: timeline.avgCost,
    failureDetails,
    createdAt: new Date(),
    status: 'active',
    completedSteps: [],
  };
}

/**
 * Get next action for driver based on recovery progress
 */
export function getNextAction(recoveryPlan, completedSteps) {
  if (!recoveryPlan.actionPlan || recoveryPlan.actionPlan.length === 0) {
    return { step: 1, title: 'Consult Healthcare Provider', message: 'Contact a medical professional immediately' };
  }

  const nextStep = recoveryPlan.actionPlan.find(
    action => !completedSteps.includes(action.step)
  );

  return nextStep || {
    step: 'complete',
    title: 'Ready for Retest',
    message: 'You\'ve completed all recovery steps. Schedule your medical retest now.',
  };
}

/**
 * Calculate estimated retest date
 */
export function estimateRetestDate(failureCategory, startDate = new Date()) {
  const timeline = RECOVERY_TIMELINES[failureCategory.toLowerCase()];
  if (!timeline) return null;

  return {
    earliest: new Date(startDate.getTime() + timeline.min * 24 * 60 * 60 * 1000),
    latest: new Date(startDate.getTime() + timeline.max * 24 * 60 * 60 * 1000),
    expectedDays: Math.round((timeline.min + timeline.max) / 2),
  };
}
