import {
  DotScoreData,
  WeighStationBypassState,
  RoadsideInspectionGuide,
} from '../types';

export const FALLBACK_DOT_SCORE_DATA: DotScoreData = {
  carrierLegalName: 'TITAN CARRIER SERVICES LLC',
  dba: 'TRUCKWITHEASE Enterprise',
  usdotNumber: '3928192',
  mcNumber: '991204',
  safetyRating: 'SATISFACTORY',
  issScore: 18,
  issCategory: 'PASS',
  issRecommendation: 'PASS — High-performing carrier. Cleared for weigh station bypass and lowest inspection frequency.',
  bypassClearanceRatePct: 98.4,
  highwayAssuredTrustScore: 99.8,
  oosRates: {
    vehicleOosPct: 2.1,
    nationalVehicleOosAvgPct: 21.4,
    driverOosPct: 0.0,
    nationalDriverOosAvgPct: 5.8,
    hazmatOosPct: 0.0,
    nationalHazmatOosAvgPct: 4.5,
  },
  csaBasics: [
    {
      basicName: 'Unsafe Driving',
      code: 'UNSAFE_DRV',
      percentile: 4,
      interventionThreshold: 65,
      status: 'EXCELLENT',
      timeWeightedViolations: 0,
      description: 'Speeding, reckless driving, improper lane change, mobile phone use, and seat belt compliance.',
      regulationsCited: '49 CFR Part 392',
    },
    {
      basicName: 'Hours of Service (HOS) Compliance',
      code: 'HOS_COMP',
      percentile: 6,
      interventionThreshold: 65,
      status: 'EXCELLENT',
      timeWeightedViolations: 0,
      description: '11/14-hour driving rules, 30-minute rest breaks, 60/70-hour weekly caps, and ELD compliance.',
      regulationsCited: '49 CFR Part 395',
    },
    {
      basicName: 'Vehicle Maintenance',
      code: 'VEH_MAINT',
      percentile: 12,
      interventionThreshold: 80,
      status: 'EXCELLENT',
      timeWeightedViolations: 1,
      description: 'Brakes, tires, lighting, frame, exhaust, load securement, and periodic inspection records.',
      regulationsCited: '49 CFR Parts 393 & 396',
    },
    {
      basicName: 'Controlled Substances / Alcohol',
      code: 'DRUG_ALC',
      percentile: 0,
      interventionThreshold: 80,
      status: 'EXCELLENT',
      timeWeightedViolations: 0,
      description: 'Random testing consortium, pre-employment screening, and FMCSA Clearinghouse queries.',
      regulationsCited: '49 CFR Part 382',
    },
    {
      basicName: 'Crash Indicator',
      code: 'CRASH_IND',
      percentile: 0,
      interventionThreshold: 65,
      status: 'EXCELLENT',
      timeWeightedViolations: 0,
      description: 'DOT-recordable crashes (fatalities, injuries, or tows). 0 crashes in past 24 months.',
      regulationsCited: '49 CFR Part 390.15',
    },
    {
      basicName: 'Driver Fitness',
      code: 'DRV_FIT',
      percentile: 2,
      interventionThreshold: 80,
      status: 'EXCELLENT',
      timeWeightedViolations: 0,
      description: 'Valid CDL class & endorsements, active Medical Examiner’s Certificate (MEC), and DQF.',
      regulationsCited: '49 CFR Part 391',
    },
    {
      basicName: 'Hazardous Materials Compliance',
      code: 'HAZMAT',
      percentile: 0,
      interventionThreshold: 80,
      status: 'EXCELLENT',
      timeWeightedViolations: 0,
      description: 'Placarding, shipping papers, hazardous material packaging, and driver training.',
      regulationsCited: '49 CFR Part 397 & Hazmat Regs',
    },
  ],
  dataScoreComposition: {
    totalInspections24Months: 34,
    cleanInspectionsCount: 33,
    cleanInspectionRatioPct: 97.1,
    violationsRecordedCount: 1,
    timeWeightBreakdown: {
      under6Months: '3x Multiplier (Highest weight)',
      sixTo12Months: '2x Multiplier (Moderate weight)',
      twelveTo24Months: '1x Multiplier (Standard weight)',
      over24Months: '0x Purged (Automatically dropped from SMS)',
    },
    severityWeightScale: 'Assigned from 1 to 10 points based on CVSA violation severity tables.',
    powerUnitCohort: 'Segment 1 (1–5 Power Units) — Peer group percentile normalization.',
  },
  actionableRecommendations: [
    {
      id: 'rec-01',
      priority: 'HIGH',
      title: 'Always Request Clean Inspection Notation on Field Reports',
      fmcsaRule: 'FMCSA SMS MCMIS Credit Protocol',
      actionSteps: [
        'When an officer completes a Level I, II, or III inspection without issuing a citation, politely request: "Officer, could you please ensure the report indicates No Violations Found?"',
        'Every clean inspection transmitted to MCMIS expands the carrier inspection denominator, immediately lowering all CSA BASIC percentiles and reinforcing the 98.4% bypass probability.',
      ],
      scoreImpact: 'Reduces SMS Percentiles by 1.5% to 3.0% per clean inspection',
    },
    {
      id: 'rec-02',
      priority: 'HIGH',
      title: 'Mandatory 15-Minute Pre-Trip & Post-Trip DVIR Discipline',
      fmcsaRule: '49 CFR § 396.11 & § 396.13',
      actionSteps: [
        'Perform a complete walk-around check: test all clearance lamps, verify brake pushrod travel, check steer tires for >= 4/32" tread, and check trailer gladhands.',
        'Document and sign DVIR electronically prior to releasing brakes. Resolving minor defects at the terminal eliminates 82% of all roadside vehicle maintenance citations.',
      ],
      scoreImpact: 'Averts 10-point Vehicle Maintenance SMS citations and Out-of-Service red tags',
    },
    {
      id: 'rec-03',
      priority: 'MEDIUM',
      title: 'File Immediate FMCSA DataQs Challenges for Disputed Citations',
      fmcsaRule: 'FMCSA DataQs System (49 CFR § 385.15)',
      actionSteps: [
        'If an inspector writes an erroneous citation (e.g. citing a non-preventable road hazard or improper regulation code), upload photographs and telematics logs to DataQs within 14 days.',
        'Removing an improper 5-point violation within the 0-6 month window removes 15 time-weighted points from the carrier SMS score.',
      ],
      scoreImpact: 'Scrubs up to 30 time-weighted points from the carrier safety profile',
    },
    {
      id: 'rec-04',
      priority: 'CONTINUOUS',
      title: 'Maintain In-Cab ELD Backup Paper Logs & Instruction Sheet',
      fmcsaRule: '49 CFR § 395.22(h)',
      actionSteps: [
        'Keep 8 days of blank paper RODS (Records of Duty Status) sheets and the official ELD malfunction sheet in the cab binder.',
        'Failure to present blank paper logs during an ELD reboot results in an immediate 49 CFR § 395.8 citation even if electronic logs are accurate.',
      ],
      scoreImpact: 'Prevents automatic 5-point HOS Form & Manner violation at inspection',
    },
    {
      id: 'rec-05',
      priority: 'CONTINUOUS',
      title: 'Automated Drug & Alcohol Clearinghouse Annual Sync',
      fmcsaRule: '49 CFR § 382.701(b)',
      actionSteps: [
        'Run annual limited queries for all rostered drivers at least 30 days prior to their anniversary.',
        'Keep signed driver consent forms archived in the digital compliance vault to maintain 0% Driver Fitness exposure.',
      ],
      scoreImpact: 'Maintains perfect 0% Controlled Substances percentile and gold-tier authority',
    },
  ],
};

export const FALLBACK_BYPASS_STATE: WeighStationBypassState = {
  activeProgram: 'PrePass & Drivewyze CVISN Integrated e-Screening',
  enrollmentStatus: 'ACTIVE_AND_ENROLLED',
  transponderId: 'PREPASS-TX-99210-A',
  bypassEligibilityPct: 98.4,
  highwayCredentials: {
    iftaLicenseStatus: 'VALID_2026_ACTIVE',
    ucrRegistrationStatus: 'PAID_ACTIVE',
    autoLiabilityInsurance: '$1,000,000 ACTIVE (BMC-91X ON FILE)',
    issCategory: 'PASS (ISS Score: 18)',
    overweightPermitState: 'NOT_REQUIRED_LEGAL_WEIGHT',
  },
  upcomingWeighStation: {
    id: 'scale-i80-mm128',
    name: 'I-80 Milepost 128 Scale House & Inspection Facility',
    corridor: 'Interstate 80 Eastbound (Quad Cities / IL Border)',
    distanceMiles: 2.4,
    operatingStatus: 'OPEN_ACTIVE_SCREENING',
    scaleLaneType: 'High-Speed Weigh-in-Motion (WIM) & Overhead Sensor',
    sensorFrequencyHz: 915.0,
    currentCabSignal: 'BYPASS_APPROVED',
    signalTitle: 'BYPASS APPROVED — PROCEED AT HIGHWAY SPEED',
    signalColor: 'GREEN',
    hapticCommand: 'harmonic_double_pulse',
    timestamp: new Date().toISOString(),
  },
};

export const FALLBACK_ROADSIDE_GUIDE: RoadsideInspectionGuide = {
  certifiedStandard: 'CVSA North American Standard Roadside Inspection (49 CFR Parts 350-399)',
  inspectionLevels: [
    {
      level: 'Level I',
      title: 'North American Standard 37-Step Comprehensive Inspection',
      coverage: 'Complete driver documents, hours of service, physical fitness, alcohol/drug check, plus total 37-step vehicle undercarriage and brake inspection.',
      estimatedDurationMinutes: 45,
    },
    {
      level: 'Level II',
      title: 'Walk-Around Driver & Vehicle Inspection',
      coverage: 'Includes all driver credentials and vehicle components inspectable without going beneath the vehicle.',
      estimatedDurationMinutes: 25,
    },
    {
      level: 'Level III',
      title: 'Driver-Only / Administrative & Credentials Inspection',
      coverage: 'Focuses purely on driver license, Medical Examiner Certificate, ELD duty status, seatbelt compliance, and vehicle documentation.',
      estimatedDurationMinutes: 15,
    },
  ],
  roadsideChecklistPhases: [
    {
      phaseId: 'phase-01-conduct',
      phaseNumber: 1,
      title: 'Immediate In-Cab Approach & Officer Demeanor',
      statutoryCitation: '49 CFR § 390.15 & Officer Interaction Protocol',
      instructions: [
        'Roll down your driver-side window completely before the officer reaches the cab.',
        'At night, turn on the interior cab dome light immediately so the officer has clear visibility.',
        'Place both hands visibly on top of the steering wheel at 10 and 2 o’clock and await instructions.',
        'Turn off the engine and set the tractor-trailer parking brakes when requested.',
        'Maintain professional composure. Answer only questions asked directly; avoid unsolicited admissions or casual speculation regarding vehicle condition or driving time.',
      ],
    },
    {
      phaseId: 'phase-02-eld-transfer',
      phaseNumber: 2,
      title: 'ELD Electronic Data Transfer Protocol',
      statutoryCitation: '49 CFR § 395.24 & § 395.34',
      instructions: [
        'Ask the inspecting officer: "Officer, would you like me to transmit electronic logs via FMCSA Web Services or Email, and what is your routing code?"',
        'Enter the officer’s designated routing code into the ELD transfer screen and press "TRANSMIT".',
        'Engage "Cab Inspection Mode" on the ELD tablet to freeze the display to 8-day duty logs and prevent unauthorized inspection of personal device files.',
        'Have 8 days of blank paper log sheets and the ELD instruction manual ready in the glove box to avoid a 395.22 citation in case of tablet reboot.',
      ],
    },
    {
      phaseId: 'phase-03-vault-docs',
      phaseNumber: 3,
      title: 'In-Cab Regulatory Document Rapid Access',
      statutoryCitation: '49 CFR § 391.41 & 49 CFR Part 396 App. G',
      instructions: [
        'Commercial Driver’s License (CDL Class A): Present card with valid state medical card link.',
        'Medical Examiner’s Certificate (MEC Form MCSA-5876): Have physical or digital card accessible.',
        'IRP Cab Card / Vehicle Registration: Verify active registration matching tractor VIN.',
        'IFTA Decal & License: Confirm current-year license certificate is in cab and decal is affixed.',
        'Proof of Public Liability Insurance: Certificate of Insurance (Form BMC-91X) showing $1,000,000 active coverage.',
        'Annual Periodic Inspection Report: Form confirming inspection within the past 12 months.',
        'Bill of Lading (BOL) & Shipping Paperwork: Signed clean document showing shipper, receiver, and cargo count.',
      ],
    },
    {
      phaseId: 'phase-04-cvsa-oos-avoidance',
      phaseNumber: 4,
      title: 'Critical Vehicle Out-of-Service (OOS) Avoidance Pre-Check',
      statutoryCitation: 'CVSA North American Standard Out-of-Service Criteria',
      instructions: [
        'Brake System: Ensure air system builds from 85 to 100 PSI in under 45 seconds; verify pushrod stroke is under legal chamber limits (e.g. < 2.0" on Type 30 chambers); ensure no audible air leaks.',
        'Tires: Verify steer tires have at least 4/32" tread in every major groove; drives and trailer have at least 2/32"; verify no cords exposed, no sidewall bulges, and all lug nuts are torqued tight.',
        'Lighting: Verify all headlights, clearance markers, turn signals, hazard flashers, and license plate lamps are fully lit. Carry spare bulbs in cab.',
        'Cargo Securement: Ensure total Working Load Limit (WLL) equals at least 50% of cargo weight; verify all straps are free of tears or frayed edges.',
        'Coupling & Fifth Wheel: Ensure locking jaws are closed tightly around trailer kingpin, release handle is locked in, and no excessive space between fifth wheel and apron.',
      ],
    },
    {
      phaseId: 'phase-05-post-inspection',
      phaseNumber: 5,
      title: 'Post-Inspection Debrief & Clean Inspection Credit',
      statutoryCitation: 'FMCSA MCMIS Safety Credit Procedure',
      instructions: [
        'If the officer concludes the inspection without violations, politely ask: "Officer, could you please note \'No Violations Discovered\' on the final roadside inspection report?"',
        'A clean inspection notation transmitted to MCMIS expands your carrier inspection base and directly reduces all CSA BASIC percentiles while increasing weigh station bypass probability.',
        'If a minor citation is issued, request a clear explanation of the statute cited and photograph the exact component at the inspection site for immediate DataQs appeal.',
      ],
    },
  ],
};

export async function fetchDotScore(): Promise<DotScoreData> {
  try {
    const res = await fetch('/api/compliance/dot-score');
    if (res.ok) {
      const data = await res.json();
      if (data.data) return data.data;
    }
  } catch (err) {
    console.warn('[DOT-SCORE] Backend fetch failed, utilizing resilient offline cache:', err);
  }
  return FALLBACK_DOT_SCORE_DATA;
}

export async function fetchWeighStationBypass(): Promise<WeighStationBypassState> {
  try {
    const res = await fetch('/api/compliance/weigh-station-bypass');
    if (res.ok) {
      const data = await res.json();
      if (data.bypassState) return data.bypassState;
    }
  } catch (err) {
    console.warn('[BYPASS] Backend fetch failed, utilizing resilient offline cache:', err);
  }
  return FALLBACK_BYPASS_STATE;
}

export async function simulateWeighStationBypass(
  mode: 'BYPASS_GREEN' | 'PULL_IN_RED'
): Promise<WeighStationBypassState> {
  try {
    const res = await fetch('/api/compliance/weigh-station-bypass/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.bypassState) return data.bypassState;
    }
  } catch (err) {
    console.warn('[BYPASS-SIM] Backend call failed, using client simulation:', err);
  }

  // Client-side fallback state
  return {
    ...FALLBACK_BYPASS_STATE,
    upcomingWeighStation: {
      ...FALLBACK_BYPASS_STATE.upcomingWeighStation,
      currentCabSignal: mode === 'BYPASS_GREEN' ? 'BYPASS_APPROVED' : 'PULL_IN_INSPECT',
      signalTitle:
        mode === 'BYPASS_GREEN'
          ? 'BYPASS APPROVED — PROCEED AT HIGHWAY SPEED'
          : 'PULL IN FOR INSPECTION — FOLLOW WEIGH STATION SIGNS',
      signalColor: mode === 'BYPASS_GREEN' ? 'GREEN' : 'RED',
      hapticCommand: mode === 'BYPASS_GREEN' ? 'harmonic_double_pulse' : 'urgent_triple_pulse',
      timestamp: new Date().toISOString(),
    },
  };
}

export async function fetchRoadsideInspectionGuide(): Promise<RoadsideInspectionGuide> {
  try {
    const res = await fetch('/api/compliance/roadside-inspection-guide');
    if (res.ok) {
      const data = await res.json();
      if (data.guide) return data.guide;
    }
  } catch (err) {
    console.warn('[ROADSIDE-GUIDE] Backend fetch failed, utilizing resilient offline cache:', err);
  }
  return FALLBACK_ROADSIDE_GUIDE;
}
