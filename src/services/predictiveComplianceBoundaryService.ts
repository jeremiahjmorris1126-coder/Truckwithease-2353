// ============================================================================
// PREDICTIVE HR COMPLIANCE BOUNDARY SERVICE
// Cross-references driver safety meetings, FMCSA roadside incident logs, and
// upcoming certification expirations to detect potential regulatory gaps before
// an FMCSA out-of-service event or audit violation occurs.
// Automatically triggers proactive remediation workflows for fleet managers.
// ============================================================================

export type ComplianceRiskLevel =
  | 'CRITICAL_INTERVENTION_REQUIRED'
  | 'ELEVATED_RISK_WARNING'
  | 'MODERATE_ADVISORY'
  | 'COMPLIANT_SECURE';

export type GapCategory =
  | 'SAFETY_MEETING_ABSENCE'
  | 'FMCSA_INCIDENT_FLAG'
  | 'CERTIFICATION_EXPIRATION'
  | 'CROSS_CORRELATION_COMPOUND';

export type ProactiveActionType =
  | 'SAFETY_TRAINING_DISPATCH'
  | 'NRCME_VOUCHER_ISSUE'
  | 'DISPATCH_HOLD_BUFFER'
  | 'CLEARINGHOUSE_PULL'
  | 'INSPECTION_15DAY_CLOSEOUT'
  | 'ANNUAL_MVR_ORDER';

export interface PredictiveComplianceGap {
  id: string;
  driverId: string;
  driverName: string;
  assignedUnit: string;
  category: GapCategory;
  fmcsaStatute: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  predictedBreachDays: number;
  detectedAt: string;
  riskContributionPercent: number;
  recommendedWorkflow: string;
  actionType: ProactiveActionType;
  isMitigated: boolean;
  mitigationProofHash?: string;
  mitigatedAt?: string;
  mitigatedBy?: string;
}

export interface DriverPredictiveBoundaryProfile {
  driverId: string;
  driverName: string;
  cdlNumber: string;
  assignedUnit: string;
  riskIndex: number; // 0 - 100%
  riskLevel: ComplianceRiskLevel;
  daysUntilPredictedBreach: number;
  safetyMeetingsSummary: {
    totalAssigned: number;
    attendedCount: number;
    complianceRatePercent: number;
    lastAttendedDate: string;
    missedMeetings: string[];
  };
  fmcsaIncidentSummary: {
    totalInspectionsPast24Mo: number;
    cleanInspections: number;
    recentViolationsCount: number;
    unresolved15DayNotices: number;
    latestViolationNote: string;
    csaUnsafePercentile: number;
  };
  certificationExpirations: {
    cdlExpirationDate: string;
    cdlDaysRemaining: number;
    dotMedCardExpirationDate: string;
    medCardDaysRemaining: number;
    annualClearinghouseQueryDate: string;
    clearinghouseDueDays: number;
    annualMvrReviewDate: string;
    mvrDueDays: number;
  };
  gaps: PredictiveComplianceGap[];
  proactiveActionQueue: string[];
}

export interface FleetPredictiveBoundaryReport {
  timestamp: string;
  totalDriversScanned: number;
  highRiskDriversCount: number;
  criticalGapsDetected: number;
  averageFleetRiskScore: number;
  earliestPredictedBreachDays: number;
  driverProfiles: DriverPredictiveBoundaryProfile[];
  sha256AuditSeal: string;
  statutoryDirectives: string[];
}

// Initial Simulated Seed Data reflecting real fleet drivers
export const INITIAL_PREDICTIVE_PROFILES: DriverPredictiveBoundaryProfile[] = [
  {
    driverId: 'drv-02',
    driverName: 'Vance Reynolds',
    cdlNumber: 'IL-CDL-4491028-A',
    assignedUnit: 'TR-904',
    riskIndex: 88,
    riskLevel: 'CRITICAL_INTERVENTION_REQUIRED',
    daysUntilPredictedBreach: 6,
    safetyMeetingsSummary: {
      totalAssigned: 4,
      attendedCount: 2,
      complianceRatePercent: 50,
      lastAttendedDate: '2025-10-18',
      missedMeetings: [
        'FMCSA Severe Weather & Mountain Pass Chain Controls (49 CFR § 392.14)',
        'Cargo Securement & 18-Wheel Load Balance (49 CFR § 393.100)',
      ],
    },
    fmcsaIncidentSummary: {
      totalInspectionsPast24Mo: 5,
      cleanInspections: 3,
      recentViolationsCount: 2,
      unresolved15DayNotices: 1,
      latestViolationNote: 'Level 2 Inspection: Brake clamp travel exceeds limit on steer axle (396.3(a)(1)). 15-day certification notice pending.',
      csaUnsafePercentile: 24,
    },
    certificationExpirations: {
      cdlExpirationDate: '2027-11-20',
      cdlDaysRemaining: 420,
      dotMedCardExpirationDate: '2026-10-02',
      medCardDaysRemaining: 7, // Imminent breach!
      annualClearinghouseQueryDate: '2025-09-20',
      clearinghouseDueDays: 2, // Query overdue in 2 days!
      annualMvrReviewDate: '2025-10-10',
      mvrDueDays: 14,
    },
    gaps: [
      {
        id: 'gap-vr-01',
        driverId: 'drv-02',
        driverName: 'Vance Reynolds',
        assignedUnit: 'TR-904',
        category: 'CROSS_CORRELATION_COMPOUND',
        fmcsaStatute: '49 CFR § 391.45 & § 396.9(d)',
        severity: 'CRITICAL',
        title: 'Compound Risk: DOT Medical Card Expiring in 7 Days + Unresolved 15-Day Roadside Brake Notice',
        description: 'Vance Reynolds will become statutorily disqualified from operating CMV on 2026-10-02 unless MCSA-5876 recertification is completed. Concurrently, an uncertified Level 2 brake inspection item has 4 days remaining before carrier audit sanction.',
        predictedBreachDays: 6,
        detectedAt: '2026-09-25T20:10:00Z',
        riskContributionPercent: 45,
        recommendedWorkflow: 'Engage HR Dispatch Buffer. Issue Employer-Paid NRCME Clinic Voucher and require immediate electronic upload of Level 2 shop repair invoice.',
        actionType: 'DISPATCH_HOLD_BUFFER',
        isMitigated: false,
      },
      {
        id: 'gap-vr-02',
        driverId: 'drv-02',
        driverName: 'Vance Reynolds',
        assignedUnit: 'TR-904',
        category: 'SAFETY_MEETING_ABSENCE',
        fmcsaStatute: '49 CFR § 392.14 / OSHA Mandate',
        severity: 'HIGH',
        title: 'Safety Meeting Absence: Mountain Pass Chain Controls & Adverse Weather',
        description: 'Driver missed mandatory March 2026 safety meeting on winter mountain chain-up rules while assigned to I-80 Wyoming / Colorado corridor during active snow advisory window.',
        predictedBreachDays: 12,
        detectedAt: '2026-09-25T20:10:00Z',
        riskContributionPercent: 25,
        recommendedWorkflow: 'Dispatch in-cab interactive micro-training module with mandatory digital signature comprehension verification before next mountain transit dispatch.',
        actionType: 'SAFETY_TRAINING_DISPATCH',
        isMitigated: false,
      },
      {
        id: 'gap-vr-03',
        driverId: 'drv-02',
        driverName: 'Vance Reynolds',
        assignedUnit: 'TR-904',
        category: 'CERTIFICATION_EXPIRATION',
        fmcsaStatute: '49 CFR § 382.701(b)',
        severity: 'HIGH',
        title: 'Annual Drug & Alcohol Clearinghouse Query Window Due',
        description: 'The mandatory 365-day annual query deadline under Part 382 expires in 2 days. Failure to conduct query prevents legal dispatch.',
        predictedBreachDays: 2,
        detectedAt: '2026-09-25T20:10:00Z',
        riskContributionPercent: 18,
        recommendedWorkflow: 'Trigger automated electronic batch pull via FMCSA Clearinghouse direct hook.',
        actionType: 'CLEARINGHOUSE_PULL',
        isMitigated: false,
      },
    ],
    proactiveActionQueue: [
      'HOLD DISPATCH: Block load CHR-99214 until med card & brake invoice uploaded',
      'ISSUE NRCME VOUCHER: Send $135 pre-paid credit to Concentra Joliet',
      'PUSH CAB BRIEFING: 15-minute § 392.14 weather video & quiz to in-cab HUD',
    ],
  },
  {
    driverId: 'drv-06',
    driverName: 'Travis Boone',
    cdlNumber: 'MO-CDL-8821940-A',
    assignedUnit: 'TR-124',
    riskIndex: 72,
    riskLevel: 'ELEVATED_RISK_WARNING',
    daysUntilPredictedBreach: 14,
    safetyMeetingsSummary: {
      totalAssigned: 4,
      attendedCount: 3,
      complianceRatePercent: 75,
      lastAttendedDate: '2026-01-14',
      missedMeetings: ['Hours of Service Split-Sleeper & Adverse Conditions (49 CFR § 395)'],
    },
    fmcsaIncidentSummary: {
      totalInspectionsPast24Mo: 3,
      cleanInspections: 2,
      recentViolationsCount: 1,
      unresolved15DayNotices: 0,
      latestViolationNote: 'Roadside warning: Speeding 6-10 mph over posted construction limit on I-70. No points assessed.',
      csaUnsafePercentile: 14,
    },
    certificationExpirations: {
      cdlExpirationDate: '2027-05-18',
      cdlDaysRemaining: 235,
      dotMedCardExpirationDate: '2026-10-18',
      medCardDaysRemaining: 23,
      annualClearinghouseQueryDate: '2026-03-10',
      clearinghouseDueDays: 165,
      annualMvrReviewDate: '2025-10-04',
      mvrDueDays: 9, // MVR review due in 9 days
    },
    gaps: [
      {
        id: 'gap-tb-01',
        driverId: 'drv-06',
        driverName: 'Travis Boone',
        assignedUnit: 'TR-124',
        category: 'CERTIFICATION_EXPIRATION',
        fmcsaStatute: '49 CFR § 391.25 (Annual Review of Driving Record)',
        severity: 'HIGH',
        title: 'Annual MVR 3-Year Driving Record Review Due Within 9 Days',
        description: 'Carrier must pull state licensing agency motor vehicle record and conduct formal annual safety evaluation under 49 CFR § 391.25.',
        predictedBreachDays: 9,
        detectedAt: '2026-09-25T20:10:00Z',
        riskContributionPercent: 38,
        recommendedWorkflow: 'Trigger real-time state DMV pull via Highway / AAMVA portal and log executive safety officer approval sign-off.',
        actionType: 'ANNUAL_MVR_ORDER',
        isMitigated: false,
      },
      {
        id: 'gap-tb-02',
        driverId: 'drv-06',
        driverName: 'Travis Boone',
        assignedUnit: 'TR-124',
        category: 'CROSS_CORRELATION_COMPOUND',
        fmcsaStatute: '49 CFR § 392.2 & § 395',
        severity: 'MEDIUM',
        title: 'Recent Speed Warning Combined with Missed HOS Safety Refresher',
        description: 'Roadside construction zone speed warning correlated with missed Split-Sleeper HOS meeting indicates potential scheduling fatigue pressure on Midwest lanes.',
        predictedBreachDays: 18,
        detectedAt: '2026-09-25T20:10:00Z',
        riskContributionPercent: 34,
        recommendedWorkflow: 'Assign 10-minute digital HOS fatigue & construction zone hazard briefing with haptic confirmation.',
        actionType: 'SAFETY_TRAINING_DISPATCH',
        isMitigated: false,
      },
    ],
    proactiveActionQueue: [
      'AUTO-PULL MVR: Order Missouri DOR 3-year record pull',
      'SCHEDULE NRCME: Pre-book DOT physical appointment at Joliet clinic before Oct 18',
    ],
  },
  {
    driverId: 'drv-01',
    driverName: 'Marcus Kowalski',
    cdlNumber: 'PA-CDL-9048123-A',
    assignedUnit: 'TR-101',
    riskIndex: 12,
    riskLevel: 'COMPLIANT_SECURE',
    daysUntilPredictedBreach: 198,
    safetyMeetingsSummary: {
      totalAssigned: 4,
      attendedCount: 4,
      complianceRatePercent: 100,
      lastAttendedDate: '2026-03-20',
      missedMeetings: [],
    },
    fmcsaIncidentSummary: {
      totalInspectionsPast24Mo: 6,
      cleanInspections: 6,
      recentViolationsCount: 0,
      unresolved15DayNotices: 0,
      latestViolationNote: 'Level 1 North American Standard Inspection: 100% CLEAN. CVSA Decal Affixed.',
      csaUnsafePercentile: 1,
    },
    certificationExpirations: {
      cdlExpirationDate: '2028-09-15',
      cdlDaysRemaining: 720,
      dotMedCardExpirationDate: '2027-04-12',
      medCardDaysRemaining: 198,
      annualClearinghouseQueryDate: '2026-01-14',
      clearinghouseDueDays: 110,
      annualMvrReviewDate: '2026-02-01',
      mvrDueDays: 128,
    },
    gaps: [],
    proactiveActionQueue: ['All regulatory boundaries nominal. Zero active interventions required.'],
  },
  {
    driverId: 'drv-04',
    driverName: 'Elena Rostova',
    cdlNumber: 'OH-CDL-3391820-A',
    assignedUnit: 'TR-550',
    riskIndex: 44,
    riskLevel: 'MODERATE_ADVISORY',
    daysUntilPredictedBreach: 28,
    safetyMeetingsSummary: {
      totalAssigned: 4,
      attendedCount: 3,
      complianceRatePercent: 75,
      lastAttendedDate: '2026-02-10',
      missedMeetings: ['HazMat Incident Prevention & Emergency Response Guidebook (49 CFR § 172.704)'],
    },
    fmcsaIncidentSummary: {
      totalInspectionsPast24Mo: 4,
      cleanInspections: 3,
      recentViolationsCount: 1,
      unresolved15DayNotices: 0,
      latestViolationNote: 'Roadside citation: Missing fire extinguisher inspection tag (393.95(a)). Fixed immediately on-site.',
      csaUnsafePercentile: 6,
    },
    certificationExpirations: {
      cdlExpirationDate: '2027-08-30',
      cdlDaysRemaining: 338,
      dotMedCardExpirationDate: '2026-11-15',
      medCardDaysRemaining: 51,
      annualClearinghouseQueryDate: '2026-02-14',
      clearinghouseDueDays: 141,
      annualMvrReviewDate: '2026-03-01',
      mvrDueDays: 156,
    },
    gaps: [
      {
        id: 'gap-er-01',
        driverId: 'drv-04',
        driverName: 'Elena Rostova',
        assignedUnit: 'TR-550',
        category: 'SAFETY_MEETING_ABSENCE',
        fmcsaStatute: '49 CFR § 172.704 (HazMat Recurrent Training)',
        severity: 'MEDIUM',
        title: 'HazMat Placard & Emergency Response 3-Year Refresher Missing',
        description: 'Driver carries active HazMat endorsement (H) on CDL and is eligible for placarded loads, but has not completed required triennial safety recurrent training.',
        predictedBreachDays: 28,
        detectedAt: '2026-09-25T20:10:00Z',
        riskContributionPercent: 44,
        recommendedWorkflow: 'Auto-assign 49 CFR Part 172 recurrent online training module. Prevent placarded hazmat dispatch until passing score logged.',
        actionType: 'SAFETY_TRAINING_DISPATCH',
        isMitigated: false,
      },
    ],
    proactiveActionQueue: ['DISPATCH HAZMAT MODULE: Push Part 172 training to cab tablet'],
  },
];

// In-memory state for runtime mutations
let cachedProfiles: DriverPredictiveBoundaryProfile[] = [...INITIAL_PREDICTIVE_PROFILES];

export const getFleetPredictiveBoundaryProfiles = (): DriverPredictiveBoundaryProfile[] => {
  return cachedProfiles;
};

export const getDriverPredictiveProfile = (
  driverIdOrName: string
): DriverPredictiveBoundaryProfile | undefined => {
  const query = driverIdOrName.toLowerCase();
  return cachedProfiles.find(
    (p) =>
      p.driverId.toLowerCase() === query ||
      p.driverName.toLowerCase().includes(query) ||
      p.assignedUnit.toLowerCase() === query
  );
};

export const executeProactiveWorkflowAction = (
  gapId: string,
  managerNotes?: string
): { success: boolean; gap?: PredictiveComplianceGap; profile?: DriverPredictiveBoundaryProfile; message: string } => {
  for (const profile of cachedProfiles) {
    const gap = profile.gaps.find((g) => g.id === gapId);
    if (gap) {
      gap.isMitigated = true;
      gap.mitigatedAt = new Date().toISOString();
      gap.mitigatedBy = managerNotes ? `Fleet Manager (${managerNotes})` : 'Autonomous Sentinel Interlock';
      gap.mitigationProofHash =
        'sha256=' +
        Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      // Recalculate driver risk index
      const remainingUnmitigated = profile.gaps.filter((g) => !g.isMitigated);
      const newRisk = remainingUnmitigated.reduce((sum, g) => sum + g.riskContributionPercent, 0);
      profile.riskIndex = Math.min(100, Math.max(5, newRisk));

      if (profile.riskIndex >= 80) profile.riskLevel = 'CRITICAL_INTERVENTION_REQUIRED';
      else if (profile.riskIndex >= 50) profile.riskLevel = 'ELEVATED_RISK_WARNING';
      else if (profile.riskIndex >= 25) profile.riskLevel = 'MODERATE_ADVISORY';
      else profile.riskLevel = 'COMPLIANT_SECURE';

      return {
        success: true,
        gap,
        profile,
        message: `Proactive mitigation workflow executed successfully for ${gap.title}. Statutory risk index reduced to ${profile.riskIndex}%.`,
      };
    }
  }

  return {
    success: false,
    message: `Gap record '${gapId}' not found in active predictive audit registry.`,
  };
};

export const simulateNewPredictiveGap = (
  driverName = 'Vance Reynolds'
): { success: boolean; newGap: PredictiveComplianceGap; updatedProfile: DriverPredictiveBoundaryProfile } => {
  const profile =
    getDriverPredictiveProfile(driverName) ||
    cachedProfiles[0];

  const newGapId = `gap-sim-${Date.now()}`;
  const newGap: PredictiveComplianceGap = {
    id: newGapId,
    driverId: profile.driverId,
    driverName: profile.driverName,
    assignedUnit: profile.assignedUnit,
    category: 'FMCSA_INCIDENT_FLAG',
    fmcsaStatute: '49 CFR § 395.8(e) (False Records of Duty Status)',
    severity: 'HIGH',
    title: 'Cross-Correlated GPS Telematics Dwell vs. Off-Duty Log Anomaly',
    description: `Automated radar detected 42 minutes of motion on I-80 while duty status remained OFF_DUTY. Potential Form & Manner or False Logbook violation predicted under Part 395.`,
    predictedBreachDays: 3,
    detectedAt: new Date().toISOString(),
    riskContributionPercent: 28,
    recommendedWorkflow: 'Transmit logbook edit verification prompt to in-cab ELD. Require driver certification of yard move exemption.',
    actionType: 'SAFETY_TRAINING_DISPATCH',
    isMitigated: false,
  };

  profile.gaps.unshift(newGap);
  profile.riskIndex = Math.min(100, profile.riskIndex + 20);
  if (profile.riskIndex >= 80) profile.riskLevel = 'CRITICAL_INTERVENTION_REQUIRED';
  else if (profile.riskIndex >= 50) profile.riskLevel = 'ELEVATED_RISK_WARNING';

  profile.proactiveActionQueue.unshift(`URGENT: Verify ELD yard move on ${profile.assignedUnit}`);

  return {
    success: true,
    newGap,
    updatedProfile: profile,
  };
};
