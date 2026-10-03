// ============================================================================
// DRIVER DOT INTELLIGENCE, BIOMETRIC VOICE, ROUTES & DEFECT HISTORY SERVICE
// Provides RBAC-protected FMCSA Driver Qualification Files (DQF), Acoustic Voice
// Profiles, Historical Route Memory, Prior Telematics Issues, Prior Roadside
// Breakdowns, and Prior DVIR Inspections.
// ============================================================================

export type UserRole = 'ADMIN' | 'FLEET_MANAGER' | 'SAFETY_DIRECTOR' | 'DISPATCHER' | 'DRIVER';

export interface DriverVoiceProfile {
  voicePrintHash: string;
  fundamentalFreqHz: number;
  noiseGateThresholdDb: number;
  acousticTimbre: string;
  preferredWakePhrase: string;
  recognitionConfidencePercent: number;
  lastCalibratedDate: string;
  calibratedBy: string;
  isCalibrated: boolean;
}

export interface DriverRouteProfile {
  primaryCorridor: string;
  preferredHighways: string[];
  maxBridgeClearanceInches: number;
  bridgeClearanceFormatted: string;
  restrictedHazmatTunnels: string[];
  preferredFuelWaypoints: string[];
  totalSafeMilesLogged: number;
  highRiskCorridorsAvoided: string[];
}

export interface DriverPriorIssue {
  id: string;
  date: string;
  type: 'HARSH_BRAKE' | 'SPEED_GOVERNANCE' | 'LANE_DEPARTURE' | 'ROADSIDE_CITATION' | 'HOS_WARNING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  location: string;
  statuteReference?: string;
  correctiveAction: string;
  resolved: boolean;
}

export interface DriverPriorBreakdown {
  id: string;
  date: string;
  unitNumber: string;
  trailerNumber?: string;
  location: string;
  highwayMilepost: string;
  componentFailed: string;
  rootCause: string;
  towingVendor: string;
  repairShop: string;
  totalCostUsd: number;
  downtimeHours: number;
  resolutionTimestamp: string;
  warrantyExpirationDate: string;
  workOrderSha256: string;
}

export interface DriverPriorDvir {
  id: string;
  date: string;
  unitNumber: string;
  trailerNumber: string;
  inspectionType: 'PRE_TRIP' | 'POST_TRIP';
  odometerMiles: number;
  defectsReported: string[];
  safeToOperate: boolean;
  mechanicName?: string;
  mechanicCertNumber?: string;
  correctionDate?: string;
  driverSignature: string;
  sha256MerkleHash: string;
}

export interface DriverDotDossier {
  id: string;
  driverName: string;
  driverPhone: string;
  driverEmail: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  assignedUnit: string;
  assignedTrailer: string;
  avatarColor: string;
  avatarInitials: string;
  
  // State & FMCSA Driver Qualification File (DQF) 49 CFR Part 391
  cdlNumber: string;
  cdlState: string;
  cdlClass: 'A' | 'B';
  cdlExpirationDate: string;
  cdlStatus: 'ACTIVE_VALID' | 'SUSPENDED' | 'EXPIRING_SOON';
  endorsements: string[]; // e.g. ['Tanker (N)', 'HazMat (H)', 'Doubles/Triples (T)']
  restrictions: string[]; // e.g. ['Corrective Lenses (B)']
  
  // Medical Examiner's Certificate (DOT Med Card) 49 CFR § 391.43
  dotMedCardRegistryNumber: string;
  dotMedCardExpirationDate: string;
  dotMedCardCertifiedDate: string;
  examiningDoctorName: string;
  examiningClinic: string;
  medCardStatus: 'CERTIFIED_COMPLIANT' | 'EXPIRING_SOON' | 'EXPIRED';
  
  // FMCSA Drug & Alcohol Clearinghouse 49 CFR Part 382 Subpart G
  clearinghouseQueryDate: string;
  clearinghouseStatus: 'ELIGIBLE_NO_VIOLATIONS' | 'PROHIBITED' | 'PENDING_CONSENT';
  clearinghouseQueryId: string;
  
  // State DMV Motor Vehicle Record (MVR) 49 CFR § 391.25
  mvrLastPullDate: string;
  mvrStateDmvAgency: string;
  mvrViolationPoints: number;
  mvrReviewStatus: 'CLEAN_APPROVED' | 'MONITORING' | 'REJECTED';
  
  // FMCSA CSA Safety Measurement System (SMS) BASICs
  safetyScorePercent: number; // e.g. 98%
  csaUnsafeDrivingPercentile: number; // e.g. 2% (Lower is better)
  csaHosCompliancePercentile: number; // e.g. 0%
  csaVehicleMaintenancePercentile: number; // e.g. 4%
  csaCrashIndicatorPercentile: number;
  
  // Integrated Programming Modules
  voiceProfile: DriverVoiceProfile;
  routeProfile: DriverRouteProfile;
  priorIssues: DriverPriorIssue[];
  priorBreakdowns: DriverPriorBreakdown[];
  priorDvirRecords: DriverPriorDvir[];
}

export const INITIAL_DRIVER_DOSSIERS: DriverDotDossier[] = [
  {
    id: 'drv-marcus-vance',
    driverName: 'Marcus Vance',
    driverPhone: '(570) 555-0144',
    driverEmail: 'marcus.vance@truckwithease.com',
    emergencyContactName: 'Clara Vance',
    emergencyContactPhone: '(570) 555-0199',
    emergencyContactRelation: 'Spouse',
    assignedUnit: 'UNIT #104-E',
    assignedTrailer: 'TRL-5390',
    avatarColor: 'bg-emerald-600',
    avatarInitials: 'MV',
    cdlNumber: 'PA-CDL-9048123-A',
    cdlState: 'PA',
    cdlClass: 'A',
    cdlExpirationDate: '2028-09-15',
    cdlStatus: 'ACTIVE_VALID',
    endorsements: ['Tanker (N)', 'HazMat (H)', 'Doubles/Triples (T)', 'Air Brakes'],
    restrictions: ['None (Full Interstate CMV)'],
    dotMedCardRegistryNumber: 'NRC-884102941',
    dotMedCardExpirationDate: '2027-04-12',
    dotMedCardCertifiedDate: '2025-04-12',
    examiningDoctorName: 'Dr. Raymond Holt, MD',
    examiningClinic: 'Penn Occupational Health Center · Allentown, PA',
    medCardStatus: 'CERTIFIED_COMPLIANT',
    clearinghouseQueryDate: '2026-01-14',
    clearinghouseStatus: 'ELIGIBLE_NO_VIOLATIONS',
    clearinghouseQueryId: 'DACH-2026-PA-88192',
    mvrLastPullDate: '2026-02-01',
    mvrStateDmvAgency: 'PennDOT Bureau of Driver Licensing',
    mvrViolationPoints: 0,
    mvrReviewStatus: 'CLEAN_APPROVED',
    safetyScorePercent: 99,
    csaUnsafeDrivingPercentile: 1,
    csaHosCompliancePercentile: 0,
    csaVehicleMaintenancePercentile: 3,
    csaCrashIndicatorPercentile: 0,
    voiceProfile: {
      voicePrintHash: 'sha256-voice-mv-419b882',
      fundamentalFreqHz: 128,
      noiseGateThresholdDb: -36,
      acousticTimbre: 'Deep Baritone / Clear Cabin Presence',
      preferredWakePhrase: 'Hands-Free Marcus',
      recognitionConfidencePercent: 98.4,
      lastCalibratedDate: '2026-02-18',
      calibratedBy: 'Chief Dispatcher / Studio HUD',
      isCalibrated: true,
    },
    routeProfile: {
      primaryCorridor: 'I-80 & I-76 East-West Freight Corridor (PA ➔ OH ➔ IL)',
      preferredHighways: ['I-80', 'I-76', 'I-70', 'I-40'],
      maxBridgeClearanceInches: 162,
      bridgeClearanceFormatted: "13' 6\" (162\")",
      restrictedHazmatTunnels: ['PA Turnpike Tunnels (Placarded Route)', 'Baltimore Harbor Tunnel (I-895)'],
      preferredFuelWaypoints: ["Love's Travel Stop #419 (I-80 Exit 185)", "Pilot Travel Center #224"],
      totalSafeMilesLogged: 412500,
      highRiskCorridorsAvoided: ['US-209 Mountain S-Curves', 'Allegheny Old Summit Bypass'],
    },
    priorIssues: [
      {
        id: 'iss-101',
        date: '2025-11-04',
        type: 'HARSH_BRAKE',
        severity: 'LOW',
        description: 'Hard braking deceleration 0.42G to avoid sudden deer crossing on I-80 EB Milepost 142.',
        location: 'I-80 EB MP 142, PA',
        correctiveAction: 'Dashcam telematic clip verified defensive maneuver. Cleared by Safety Dept.',
        resolved: true,
      },
      {
        id: 'iss-102',
        date: '2025-06-18',
        type: 'ROADSIDE_CITATION',
        severity: 'LOW',
        description: 'Level II Roadside Inspection: Minor clearance marker lamp bulb dim. Replaced on-site.',
        location: 'I-76 Scale Station, OH',
        statuteReference: '49 CFR § 393.11',
        correctiveAction: 'New LED bulb installed and signed off by officer in 12 minutes. Zero points.',
        resolved: true,
      },
    ],
    priorBreakdowns: [
      {
        id: 'bd-8841',
        date: '2025-08-22',
        unitNumber: 'UNIT #104-E',
        trailerNumber: 'TRL-5390',
        location: 'I-80 Westbound near Bellefonte, PA',
        highwayMilepost: 'MP 161.4',
        componentFailed: 'Alternator & Serpentine Belt Tensioner',
        rootCause: 'Bearing wear caused belt slippage, triggering low battery alternator fault code SPN 168.',
        towingVendor: 'Keystone Heavy Duty Roadside Service',
        repairShop: 'Freightliner Western Star Center · State College, PA',
        totalCostUsd: 1420.50,
        downtimeHours: 4.5,
        resolutionTimestamp: '2025-08-22 18:30 EDT',
        warrantyExpirationDate: '2027-08-22 (2-Year Nationwide Parts/Labor)',
        workOrderSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      },
    ],
    priorDvirRecords: [
      {
        id: 'dvir-9011',
        date: '2026-03-12',
        unitNumber: 'UNIT #104-E',
        trailerNumber: 'TRL-5390',
        inspectionType: 'PRE_TRIP',
        odometerMiles: 142850,
        defectsReported: ['None. All 18 tires inspected, air pressure 105 PSI, glad hands clean, lights operational.'],
        safeToOperate: true,
        mechanicName: 'Certified Pre-Trip Inspection by Driver',
        driverSignature: 'Marcus Vance [Verified PIN 4192]',
        sha256MerkleHash: 'sha256-dvir-blk-88192-verified',
      },
      {
        id: 'dvir-8942',
        date: '2026-02-28',
        unitNumber: 'UNIT #104-E',
        trailerNumber: 'TRL-5390',
        inspectionType: 'POST_TRIP',
        odometerMiles: 140610,
        defectsReported: ['Slight air leakage on trailer red emergency glad-hand rubber grommet.'],
        safeToOperate: true,
        mechanicName: 'Dave Miller (Master Fleet Tech #402)',
        mechanicCertNumber: 'ASE-HD-884102',
        correctionDate: '2026-02-28 20:15 EST',
        driverSignature: 'Marcus Vance [Verified PIN 4192]',
        sha256MerkleHash: 'sha256-dvir-blk-87201-corrected',
      },
    ],
  },
  {
    id: 'drv-elena-rostova',
    driverName: 'Elena Rostova',
    driverPhone: '(956) 555-0182',
    driverEmail: 'elena.rostova@truckwithease.com',
    emergencyContactName: 'Viktor Rostov',
    emergencyContactPhone: '(956) 555-0191',
    emergencyContactRelation: 'Brother',
    assignedUnit: 'UNIT #108-A',
    assignedTrailer: 'TRL-4811',
    avatarColor: 'bg-cyan-600',
    avatarInitials: 'ER',
    cdlNumber: 'TX-CDL-4820199-A',
    cdlState: 'TX',
    cdlClass: 'A',
    cdlExpirationDate: '2029-03-20',
    cdlStatus: 'ACTIVE_VALID',
    endorsements: ['Refrigerated Food-Grade', 'HazMat (H)', 'Tanker (N)', 'FAST Card Cross-Border'],
    restrictions: ['None'],
    dotMedCardRegistryNumber: 'NRC-771920443',
    dotMedCardExpirationDate: '2027-08-10',
    dotMedCardCertifiedDate: '2025-08-10',
    examiningDoctorName: 'Dr. Maria Santos, MD',
    examiningClinic: 'Laredo Border Fleet Medical · Laredo, TX',
    medCardStatus: 'CERTIFIED_COMPLIANT',
    clearinghouseQueryDate: '2026-01-20',
    clearinghouseStatus: 'ELIGIBLE_NO_VIOLATIONS',
    clearinghouseQueryId: 'DACH-2026-TX-99410',
    mvrLastPullDate: '2026-02-15',
    mvrStateDmvAgency: 'Texas Department of Public Safety (TxDPS)',
    mvrViolationPoints: 0,
    mvrReviewStatus: 'CLEAN_APPROVED',
    safetyScorePercent: 98,
    csaUnsafeDrivingPercentile: 2,
    csaHosCompliancePercentile: 0,
    csaVehicleMaintenancePercentile: 2,
    csaCrashIndicatorPercentile: 0,
    voiceProfile: {
      voicePrintHash: 'sha256-voice-er-8192a01',
      fundamentalFreqHz: 198,
      noiseGateThresholdDb: -34,
      acousticTimbre: 'Mezzo / Crisp High-Consonant Enunciation',
      preferredWakePhrase: 'Elena Voice Lead',
      recognitionConfidencePercent: 97.9,
      lastCalibratedDate: '2026-01-30',
      calibratedBy: 'Safety Director Studio',
      isCalibrated: true,
    },
    routeProfile: {
      primaryCorridor: 'I-35 NAFTA Freight Corridor (Laredo ➔ San Antonio ➔ Dallas ➔ Kansas City)',
      preferredHighways: ['I-35', 'I-35E', 'I-40', 'I-30'],
      maxBridgeClearanceInches: 162,
      bridgeClearanceFormatted: "13' 6\" (162\")",
      restrictedHazmatTunnels: ['Dallas Downtown Canyon Bypass (HazMat Placarded)'],
      preferredFuelWaypoints: ["Flying J Travel Center #718 (I-35 Exit 13)", "Pilot #392 (Austin North)"],
      totalSafeMilesLogged: 388900,
      highRiskCorridorsAvoided: ['Austin Downtown Express Lanes (Weight Restr)'],
    },
    priorIssues: [
      {
        id: 'iss-201',
        date: '2025-10-14',
        type: 'HOS_WARNING',
        severity: 'LOW',
        description: '30-minute rest break required alert triggered 15 minutes before 8-hour driving limit.',
        location: 'I-35 NB near Waco, TX',
        statuteReference: '49 CFR § 395.3(a)(3)(ii)',
        correctiveAction: 'Driver took compliant 34-minute rest break at Pilot Travel Center. Zero violation.',
        resolved: true,
      },
    ],
    priorBreakdowns: [
      {
        id: 'bd-7712',
        date: '2025-05-11',
        unitNumber: 'UNIT #108-A',
        trailerNumber: 'TRL-4811',
        location: 'I-35 North of Austin, TX',
        highwayMilepost: 'MP 248.0',
        componentFailed: 'Trailer Reefer Unit Electronic Expansion Valve (EEV)',
        rootCause: 'Refrigerant temperature sensor calibration drift caused sub-cooling warning.',
        towingVendor: 'Thermo King Mobile Emergency Fleet Response',
        repairShop: 'Thermo King of Austin, TX',
        totalCostUsd: 890.00,
        downtimeHours: 2.5,
        resolutionTimestamp: '2025-05-11 14:15 CDT',
        warrantyExpirationDate: '2026-05-11',
        workOrderSha256: '9f837261b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b78',
      },
    ],
    priorDvirRecords: [
      {
        id: 'dvir-8811',
        date: '2026-03-12',
        unitNumber: 'UNIT #108-A',
        trailerNumber: 'TRL-4811',
        inspectionType: 'PRE_TRIP',
        odometerMiles: 198420,
        defectsReported: ['Reefer setpoint -10°F validated. Door gaskets intact, fuel tank 95%, pre-trip clear.'],
        safeToOperate: true,
        mechanicName: 'Driver Pre-Trip FMCSA § 396.11 Certified',
        driverSignature: 'Elena Rostova [Verified PIN 8192]',
        sha256MerkleHash: 'sha256-dvir-er-20260312-clean',
      },
    ],
  },
  {
    id: 'drv-darnell-washington',
    driverName: 'Darnell Washington',
    driverPhone: '(312) 555-0199',
    driverEmail: 'darnell.washington@truckwithease.com',
    emergencyContactName: 'Keisha Washington',
    emergencyContactPhone: '(312) 555-0177',
    emergencyContactRelation: 'Spouse',
    assignedUnit: 'UNIT #112-B',
    assignedTrailer: 'TRL-9920',
    avatarColor: 'bg-purple-600',
    avatarInitials: 'DW',
    cdlNumber: 'IL-CDL-8829103-A',
    cdlState: 'IL',
    cdlClass: 'A',
    cdlExpirationDate: '2027-11-05',
    cdlStatus: 'ACTIVE_VALID',
    endorsements: ['HazMat (H)', 'Tanker (N)', 'Doubles/Triples (T)'],
    restrictions: ['None'],
    dotMedCardRegistryNumber: 'NRC-992014811',
    dotMedCardExpirationDate: '2026-11-20',
    dotMedCardCertifiedDate: '2024-11-20',
    examiningDoctorName: 'Dr. Arthur Pendelton, MD',
    examiningClinic: 'Chicago Industrial & DOT Clinic · Chicago, IL',
    medCardStatus: 'CERTIFIED_COMPLIANT',
    clearinghouseQueryDate: '2026-01-05',
    clearinghouseStatus: 'ELIGIBLE_NO_VIOLATIONS',
    clearinghouseQueryId: 'DACH-2026-IL-77182',
    mvrLastPullDate: '2026-01-10',
    mvrStateDmvAgency: 'Illinois Secretary of State (IL SOS)',
    mvrViolationPoints: 0,
    mvrReviewStatus: 'CLEAN_APPROVED',
    safetyScorePercent: 97,
    csaUnsafeDrivingPercentile: 3,
    csaHosCompliancePercentile: 1,
    csaVehicleMaintenancePercentile: 2,
    csaCrashIndicatorPercentile: 0,
    voiceProfile: {
      voicePrintHash: 'sha256-voice-dw-77192a2',
      fundamentalFreqHz: 115,
      noiseGateThresholdDb: -38,
      acousticTimbre: 'Deep Resonant Bass / Steady Cadence',
      preferredWakePhrase: 'Hey Darnell',
      recognitionConfidencePercent: 96.7,
      lastCalibratedDate: '2026-02-10',
      calibratedBy: 'Fleet Comms Desk',
      isCalibrated: true,
    },
    routeProfile: {
      primaryCorridor: 'I-80 / I-94 Great Lakes Corridor (Chicago ➔ Gary ➔ Detroit)',
      preferredHighways: ['I-80', 'I-94', 'I-90', 'I-69'],
      maxBridgeClearanceInches: 162,
      bridgeClearanceFormatted: "13' 6\" (162\")",
      restrictedHazmatTunnels: ['Detroit-Windsor Tunnel (HazMat Prohibited)'],
      preferredFuelWaypoints: ["TA Travel Center #118 (Gary, IN Exit 9)", "Love's #334"],
      totalSafeMilesLogged: 520000,
      highRiskCorridorsAvoided: ['Chicago Skyway Congestion Reroute'],
    },
    priorIssues: [],
    priorBreakdowns: [
      {
        id: 'bd-6619',
        date: '2025-07-09',
        unitNumber: 'UNIT #112-B',
        trailerNumber: 'TRL-9920',
        location: 'I-94 Eastbound near Kalamazoo, MI',
        highwayMilepost: 'MP 78.5',
        componentFailed: 'Drive Axle Right Inner Tire Rapid Pressure Loss',
        rootCause: 'Road debris puncture detected by TPMS sensor at 45 PSI.',
        towingVendor: 'Great Lakes Mobile Roadside Tire & Towing',
        repairShop: 'Commercial Tire Solutions · Kalamazoo, MI',
        totalCostUsd: 685.00,
        downtimeHours: 1.8,
        resolutionTimestamp: '2025-07-09 11:45 EDT',
        warrantyExpirationDate: '2026-07-09',
        workOrderSha256: '7a19283746b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b',
      },
    ],
    priorDvirRecords: [
      {
        id: 'dvir-7719',
        date: '2026-03-11',
        unitNumber: 'UNIT #112-B',
        trailerNumber: 'TRL-9920',
        inspectionType: 'PRE_TRIP',
        odometerMiles: 231450,
        defectsReported: ['All tires torqued, brakes 100%, steering linkage tight. Approved.'],
        safeToOperate: true,
        mechanicName: 'Driver Pre-Trip Certified',
        driverSignature: 'Darnell Washington [Verified PIN 7712]',
        sha256MerkleHash: 'sha256-dvir-dw-20260311-pass',
      },
    ],
  },
  {
    id: 'drv-mateo-rodriguez',
    driverName: 'Mateo Rodriguez',
    driverPhone: '(305) 555-0149',
    driverEmail: 'mateo.rodriguez@truckwithease.com',
    emergencyContactName: 'Isabella Rodriguez',
    emergencyContactPhone: '(305) 555-0133',
    emergencyContactRelation: 'Spouse',
    assignedUnit: 'UNIT #115-C',
    assignedTrailer: 'TRL-3340',
    avatarColor: 'bg-amber-600',
    avatarInitials: 'MR',
    cdlNumber: 'FL-CDL-3391024-A',
    cdlState: 'FL',
    cdlClass: 'A',
    cdlExpirationDate: '2028-04-18',
    cdlStatus: 'ACTIVE_VALID',
    endorsements: ['Tanker (N)', 'Flatbed / Oversize Permits'],
    restrictions: ['None'],
    dotMedCardRegistryNumber: 'NRC-662910441',
    dotMedCardExpirationDate: '2027-02-14',
    dotMedCardCertifiedDate: '2025-02-14',
    examiningDoctorName: 'Dr. Carlos Benitez, MD',
    examiningClinic: 'Sunshine Occupational Health · Jacksonville, FL',
    medCardStatus: 'CERTIFIED_COMPLIANT',
    clearinghouseQueryDate: '2026-01-18',
    clearinghouseStatus: 'ELIGIBLE_NO_VIOLATIONS',
    clearinghouseQueryId: 'DACH-2026-FL-66192',
    mvrLastPullDate: '2026-02-05',
    mvrStateDmvAgency: 'Florida Highway Safety & Motor Vehicles (FLHSMV)',
    mvrViolationPoints: 0,
    mvrReviewStatus: 'CLEAN_APPROVED',
    safetyScorePercent: 96,
    csaUnsafeDrivingPercentile: 4,
    csaHosCompliancePercentile: 1,
    csaVehicleMaintenancePercentile: 3,
    csaCrashIndicatorPercentile: 0,
    voiceProfile: {
      voicePrintHash: 'sha256-voice-mr-66192b3',
      fundamentalFreqHz: 145,
      noiseGateThresholdDb: -36,
      acousticTimbre: 'Warm Tenor / Fast Rhythmic Enunciation',
      preferredWakePhrase: 'Mateo Cockpit',
      recognitionConfidencePercent: 98.1,
      lastCalibratedDate: '2026-02-05',
      calibratedBy: 'Lead Safety Inspector',
      isCalibrated: true,
    },
    routeProfile: {
      primaryCorridor: 'I-95 Southeast Atlantic Corridor (Miami ➔ Jacksonville ➔ Savannah ➔ Richmond)',
      preferredHighways: ['I-95', 'I-10', 'I-16', 'I-85'],
      maxBridgeClearanceInches: 162,
      bridgeClearanceFormatted: "13' 6\" (162\")",
      restrictedHazmatTunnels: ['Fort McHenry Tunnel (I-95 HazMat Restrictions)'],
      preferredFuelWaypoints: ["Pilot Travel Center #418 (St. Augustine, FL)", "Love's #554 (Brunswick, GA)"],
      totalSafeMilesLogged: 440200,
      highRiskCorridorsAvoided: ['US-1 Low Tree Overhangs'],
    },
    priorIssues: [
      {
        id: 'iss-401',
        date: '2025-09-29',
        type: 'SPEED_GOVERNANCE',
        severity: 'LOW',
        description: 'Momentary 68 MPH on 6% downhill grade on I-26 before engine compression brake engaged.',
        location: 'I-26 WB Saluda Grade, NC',
        correctiveAction: 'Engine compression brake auto-governed rig to 55 MPH. Retrained on early descent gear selection.',
        resolved: true,
      },
    ],
    priorBreakdowns: [],
    priorDvirRecords: [
      {
        id: 'dvir-6612',
        date: '2026-03-12',
        unitNumber: 'UNIT #115-C',
        trailerNumber: 'TRL-3340',
        inspectionType: 'PRE_TRIP',
        odometerMiles: 167300,
        defectsReported: ['Pre-trip approved. Flatbed winches and strap tensioners 100% compliant.'],
        safeToOperate: true,
        mechanicName: 'Certified Pre-Trip Inspection',
        driverSignature: 'Mateo Rodriguez [Verified PIN 3312]',
        sha256MerkleHash: 'sha256-dvir-mr-20260312-secure',
      },
    ],
  },
  {
    id: 'drv-sarah-jenkins',
    driverName: 'Sarah Jenkins',
    driverPhone: '(615) 555-0177',
    driverEmail: 'sarah.jenkins@truckwithease.com',
    emergencyContactName: 'Thomas Jenkins',
    emergencyContactPhone: '(615) 555-0166',
    emergencyContactRelation: 'Spouse',
    assignedUnit: 'UNIT #120-D',
    assignedTrailer: 'TRL-6610',
    avatarColor: 'bg-emerald-700',
    avatarInitials: 'SJ',
    cdlNumber: 'TN-CDL-7749102-A',
    cdlState: 'TN',
    cdlClass: 'A',
    cdlExpirationDate: '2029-06-14',
    cdlStatus: 'ACTIVE_VALID',
    endorsements: ['HazMat (H)', 'Tanker (N)', 'Air Brakes'],
    restrictions: ['None'],
    dotMedCardRegistryNumber: 'NRC-551029411',
    dotMedCardExpirationDate: '2027-05-30',
    dotMedCardCertifiedDate: '2025-05-30',
    examiningDoctorName: 'Dr. Brenda Vance, MD',
    examiningClinic: 'Music City Fleet Medicine · Nashville, TN',
    medCardStatus: 'CERTIFIED_COMPLIANT',
    clearinghouseQueryDate: '2026-01-22',
    clearinghouseStatus: 'ELIGIBLE_NO_VIOLATIONS',
    clearinghouseQueryId: 'DACH-2026-TN-55192',
    mvrLastPullDate: '2026-02-12',
    mvrStateDmvAgency: 'Tennessee Dept of Safety & Homeland Security (TDOT)',
    mvrViolationPoints: 0,
    mvrReviewStatus: 'CLEAN_APPROVED',
    safetyScorePercent: 100,
    csaUnsafeDrivingPercentile: 0,
    csaHosCompliancePercentile: 0,
    csaVehicleMaintenancePercentile: 1,
    csaCrashIndicatorPercentile: 0,
    voiceProfile: {
      voicePrintHash: 'sha256-voice-sj-55102a4',
      fundamentalFreqHz: 210,
      noiseGateThresholdDb: -35,
      acousticTimbre: 'Clear Alto / High Intelligibility',
      preferredWakePhrase: 'Sarah Dispatch Comms',
      recognitionConfidencePercent: 99.1,
      lastCalibratedDate: '2026-02-20',
      calibratedBy: 'Safety Director Studio',
      isCalibrated: true,
    },
    routeProfile: {
      primaryCorridor: 'I-40 / I-65 Mid-South Hub (Nashville ➔ Memphis ➔ Little Rock)',
      preferredHighways: ['I-40', 'I-65', 'I-24', 'I-55'],
      maxBridgeClearanceInches: 162,
      bridgeClearanceFormatted: "13' 6\" (162\")",
      restrictedHazmatTunnels: ['None along standard interstate routing'],
      preferredFuelWaypoints: ["Love's Travel Stop #352 (Jackson, TN)", "Pilot #488 (Memphis East)"],
      totalSafeMilesLogged: 360000,
      highRiskCorridorsAvoided: ['Memphis Hernando de Soto Bridge Peak Congestion'],
    },
    priorIssues: [],
    priorBreakdowns: [],
    priorDvirRecords: [
      {
        id: 'dvir-5519',
        date: '2026-03-12',
        unitNumber: 'UNIT #120-D',
        trailerNumber: 'TRL-6610',
        inspectionType: 'PRE_TRIP',
        odometerMiles: 112400,
        defectsReported: ['Perfect condition. Zero defects found. All safety equipment certified.'],
        safeToOperate: true,
        mechanicName: 'Driver Pre-Trip FMCSA § 396.11 Certified',
        driverSignature: 'Sarah Jenkins [Verified PIN 5521]',
        sha256MerkleHash: 'sha256-dvir-sj-20260312-clean',
      },
    ],
  },
  {
    id: 'drv-travis-boone',
    driverName: 'Travis Boone',
    driverPhone: '(314) 555-0166',
    driverEmail: 'travis.boone@truckwithease.com',
    emergencyContactName: 'Rachel Boone',
    emergencyContactPhone: '(314) 555-0155',
    emergencyContactRelation: 'Spouse',
    assignedUnit: 'UNIT #124-E',
    assignedTrailer: 'TRL-8820',
    avatarColor: 'bg-blue-600',
    avatarInitials: 'TB',
    cdlNumber: 'MO-CDL-5529104-A',
    cdlState: 'MO',
    cdlClass: 'A',
    cdlExpirationDate: '2028-10-31',
    cdlStatus: 'ACTIVE_VALID',
    endorsements: ['HazMat (H)', 'Tanker (N)', 'Doubles/Triples (T)'],
    restrictions: ['None'],
    dotMedCardRegistryNumber: 'NRC-441920199',
    dotMedCardExpirationDate: '2026-10-15',
    dotMedCardCertifiedDate: '2024-10-15',
    examiningDoctorName: 'Dr. Gary Henderson, MD',
    examiningClinic: 'Gateway Occupational Health · St. Louis, MO',
    medCardStatus: 'CERTIFIED_COMPLIANT',
    clearinghouseQueryDate: '2026-01-12',
    clearinghouseStatus: 'ELIGIBLE_NO_VIOLATIONS',
    clearinghouseQueryId: 'DACH-2026-MO-44192',
    mvrLastPullDate: '2026-01-25',
    mvrStateDmvAgency: 'Missouri Department of Revenue (DOR)',
    mvrViolationPoints: 0,
    mvrReviewStatus: 'CLEAN_APPROVED',
    safetyScorePercent: 97,
    csaUnsafeDrivingPercentile: 2,
    csaHosCompliancePercentile: 1,
    csaVehicleMaintenancePercentile: 2,
    csaCrashIndicatorPercentile: 0,
    voiceProfile: {
      voicePrintHash: 'sha256-voice-tb-44192c5',
      fundamentalFreqHz: 132,
      noiseGateThresholdDb: -37,
      acousticTimbre: 'Mid Baritone / Calm Midwestern Cadence',
      preferredWakePhrase: 'Travis Rig Lead',
      recognitionConfidencePercent: 97.6,
      lastCalibratedDate: '2026-01-28',
      calibratedBy: 'Fleet Comms Desk',
      isCalibrated: true,
    },
    routeProfile: {
      primaryCorridor: 'I-70 / I-44 Midwest Freight Corridor (St. Louis ➔ Kansas City ➔ Springfield)',
      preferredHighways: ['I-70', 'I-44', 'I-55', 'I-64'],
      maxBridgeClearanceInches: 162,
      bridgeClearanceFormatted: "13' 6\" (162\")",
      restrictedHazmatTunnels: ['None on route'],
      preferredFuelWaypoints: ["Love's Travel Stop #349 (Boonville, MO)", "TA Travel Center #190"],
      totalSafeMilesLogged: 490000,
      highRiskCorridorsAvoided: ['St. Louis Downtown Arch Construction Reroute'],
    },
    priorIssues: [
      {
        id: 'iss-601',
        date: '2025-11-20',
        type: 'ROADSIDE_CITATION',
        severity: 'LOW',
        description: 'Level III Inspection: Cab document pouch missing physical copy of IFTA license (had electronic PDF).',
        location: 'I-70 Eastbound Scale, MO',
        statuteReference: '49 CFR § 390.15',
        correctiveAction: 'Physical laminated IFTA sticker and cab binder replaced and verified by Safety Mgr.',
        resolved: true,
      },
    ],
    priorBreakdowns: [
      {
        id: 'bd-5511',
        date: '2025-06-04',
        unitNumber: 'UNIT #124-E',
        trailerNumber: 'TRL-8820',
        location: 'I-70 WB near Columbia, MO',
        highwayMilepost: 'MP 128.2',
        componentFailed: 'Engine Turbocharger Variable Geometry Actuator (VGT)',
        rootCause: 'Electrical solenoid harness connector pin fretting caused loss of turbo boost pressure.',
        towingVendor: 'Mid-Missouri Heavy Wrecker Service',
        repairShop: 'Cummins Central Power · Columbia, MO',
        totalCostUsd: 2180.00,
        downtimeHours: 6.0,
        resolutionTimestamp: '2025-06-04 19:45 CDT',
        warrantyExpirationDate: '2027-06-04',
        workOrderSha256: '5b19283746b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991c',
      },
    ],
    priorDvirRecords: [
      {
        id: 'dvir-4411',
        date: '2026-03-12',
        unitNumber: 'UNIT #124-E',
        trailerNumber: 'TRL-8820',
        inspectionType: 'PRE_TRIP',
        odometerMiles: 204120,
        defectsReported: ['All systems nominal. Kingpin lock inspected, 5th wheel jaw engaged, pre-trip signed.'],
        safeToOperate: true,
        mechanicName: 'Driver Pre-Trip Certified',
        driverSignature: 'Travis Boone [Verified PIN 4412]',
        sha256MerkleHash: 'sha256-dvir-tb-20260312-nominal',
      },
    ],
  },
];

// Helper to look up a driver by name or partial name
export function findDriverByNameOrQuery(query: string): DriverDotDossier | undefined {
  const q = query.toLowerCase().trim();
  return INITIAL_DRIVER_DOSSIERS.find((d) => {
    const fullName = d.driverName.toLowerCase();
    const parts = fullName.split(' ');
    const firstName = parts[0] || '';
    const lastName = parts[parts.length - 1] || '';
    return (
      fullName.includes(q) ||
      q.includes(fullName) ||
      (firstName.length > 2 && q.includes(firstName)) ||
      (lastName.length > 2 && q.includes(lastName)) ||
      d.id.includes(q) ||
      d.assignedUnit.toLowerCase().includes(q) ||
      d.cdlNumber.toLowerCase().includes(q)
    );
  });
}

// RBAC Permissions Check
export const ALLOWED_DOT_ROLES: UserRole[] = ['ADMIN', 'FLEET_MANAGER', 'SAFETY_DIRECTOR', 'DISPATCHER'];

export function canUserAccessDotDossier(role: UserRole): boolean {
  return ALLOWED_DOT_ROLES.includes(role);
}

// Security PIN for manager unlock override
export const MANAGER_SECURITY_PIN = '1126';

export function verifyManagerPin(pin: string): boolean {
  return pin.trim() === MANAGER_SECURITY_PIN;
}
