/**
 * TRUCKWITHEASE™ ELD CHRONO-PREDICTIVE SENTINEL & TELEMATICS DATA FEEDBACK ENGINE
 * 
 * World-First ELD Innovations:
 * 1. Pre-Emptive eRODS Roadside Transfer Inspector & DOT Officer View Simulator (49 CFR § 395.24/26/30)
 * 2. Point-of-No-Return (PNR) Safe-Haven Parking Predictive Radar
 * 3. Split-Sleeper "Quantum Time Warp" Dynamic Solver (49 CFR § 395.1(g) 8/2 & 7/3 rules)
 * 4. J1939 CAN-Bus Micro-Jitter Unassigned Driving Auto-Classifier (§ 395.28)
 */

export interface ErodsAuditDefect {
  id: string;
  ruleCode: string;
  severity: 'CRITICAL_OOS' | 'HIGH_CITATION' | 'MEDIUM_WARNING' | 'CLEAN_PASS';
  title: string;
  statutoryCitation: string;
  detectedDetail: string;
  suggestedLegalAnnotation: string;
  isAnnotated: boolean;
  fineExposureUsd: number;
}

export interface ErodsPreFlightReport {
  overallRiskScore: number; // 0 - 100 (0 = clean, 100 = out of service)
  auditReadiness: 'READY_TO_TRANSMIT' | 'ANNOTATIONS_RECOMMENDED' | 'HIGH_AUDIT_EXPOSURE';
  inspectedDaysCount: number;
  totalMilesAudited: number;
  unassignedDrivingMiles: number;
  missingDriverSignatures: number;
  diagnosticMalfunctionEvents: number;
  defects: ErodsAuditDefect[];
  fmcsaTransferMethodsAvailable: {
    webServices: boolean;
    email: boolean;
    bluetooth: boolean;
    usb: boolean;
  };
}

export interface SafeHavenParkingNode {
  id: string;
  name: string;
  brand: 'LOVES' | 'PILOT_FLYING_J' | 'TA_PETRO' | 'STATE_REST_AREA' | 'INDEPENDENT_TRUCK_STOP';
  mileMarker: number;
  distanceMiles: number;
  estimatedMinutesArrival: number;
  totalTruckSpaces: number;
  openTruckSpaces: number;
  parkingConfidencePct: number;
  hasCATScale: boolean;
  hasDEFAtPump: boolean;
  hasShowers: boolean;
  isPointOfNoReturn: boolean; // True if passing this node will cause an HOS violation before the next legal parking spot
  status: 'REACHABLE_RECOMMENDED' | 'REACHABLE_CONGESTED' | 'UNREACHABLE_EXCEEDS_HOS';
}

export interface SplitSleeperSimulation {
  firstBreakHours: number; // e.g. 7, 8
  secondBreakHours: number; // e.g. 3, 2
  qualifyingPair: boolean;
  shiftWindowExtensionHours: number;
  regainedDriveHours: number;
  newShiftExpirationTimestamp: string;
  statutoryRuleApplied: '49 CFR § 395.1(g)(1)(ii) [8/2 Split]' | '49 CFR § 395.1(g)(1)(ii) [7/3 Split]' | 'NON_QUALIFYING';
  explanation: string;
}

export interface UnassignedDrivingEventAnalysis {
  id: string;
  timestamp: string;
  distanceMiles: number;
  maxSpeedMph: number;
  engineRpmMean: number;
  cabPhoneBleSignalDbm: number; // e.g. -95 (phone far away) vs -45 (driver in cab)
  classifiedSource: 'SHOP_MAINTENANCE_TECH' | 'TERMINAL_YARD_JOCKEY' | 'UNASSIGNED_DRIVER_DEFECT';
  confidencePct: number;
  autoAnnotationText: string;
  approvedByFleetManager: boolean;
}

export const INITIAL_ERODS_DEFECTS: ErodsAuditDefect[] = [
  {
    id: 'defect-001',
    ruleCode: 'FMCSA-395.28-UNASSIGNED',
    severity: 'HIGH_CITATION',
    title: 'Unassigned Driving Event on Unit T-104 (2.4 mi at Terminal)',
    statutoryCitation: '49 CFR § 395.28 & § 395.32(b)',
    detectedDetail: 'Unit moved 2.4 miles on 09/30 at 22:14 CDT while driver log was in Off-Duty status. State police eRODS parser flags this as unassigned driving.',
    suggestedLegalAnnotation: 'Move performed by certified maintenance technician inside terminal yard for scheduled brake stroke calibration. Not highway driving (§ 395.28).',
    isAnnotated: false,
    fineExposureUsd: 1100,
  },
  {
    id: 'defect-002',
    ruleCode: 'FMCSA-395.3-30M-BREAK',
    severity: 'MEDIUM_WARNING',
    title: '30-Minute Break Interval Timing (7h 52m Continuous Drive)',
    statutoryCitation: '49 CFR § 395.3(a)(3)(ii)',
    detectedDetail: 'Driver completed 30m break at 7h 52m into drive shift. Clean under FMCSA 8-hour drive threshold, but close to margin.',
    suggestedLegalAnnotation: 'Mandatory 30-minute non-driving rest break satisfied between 15:30 and 16:02 CDT (Off-Duty/Sleeper Berth compliant).',
    isAnnotated: true,
    fineExposureUsd: 0,
  },
  {
    id: 'defect-003',
    ruleCode: 'FMCSA-395.24-SIGNATURE',
    severity: 'MEDIUM_WARNING',
    title: 'Missing Daily Log Certification Signature (Day 7)',
    statutoryCitation: '49 CFR § 395.30(b)(2)',
    detectedDetail: 'Log record for 09/25 is missing the driver electronic signature certification timestamp.',
    suggestedLegalAnnotation: 'Driver digitally recertified and locked 24-hour log period pursuant to 49 CFR § 395.30(b)(2).',
    isAnnotated: false,
    fineExposureUsd: 650,
  },
];

export const INITIAL_SAFE_HAVEN_PARKING: SafeHavenParkingNode[] = [
  {
    id: 'park-01',
    name: "Love's Travel Stop #482",
    brand: 'LOVES',
    mileMarker: 142,
    distanceMiles: 18.4,
    estimatedMinutesArrival: 17,
    totalTruckSpaces: 110,
    openTruckSpaces: 24,
    parkingConfidencePct: 94,
    hasCATScale: true,
    hasDEFAtPump: true,
    hasShowers: true,
    isPointOfNoReturn: false,
    status: 'REACHABLE_RECOMMENDED',
  },
  {
    id: 'park-02',
    name: 'Pilot Travel Center #218 (POINT OF NO RETURN)',
    brand: 'PILOT_FLYING_J',
    mileMarker: 176,
    distanceMiles: 52.4,
    estimatedMinutesArrival: 49,
    totalTruckSpaces: 85,
    openTruckSpaces: 9,
    parkingConfidencePct: 88,
    hasCATScale: true,
    hasDEFAtPump: true,
    hasShowers: true,
    isPointOfNoReturn: true, // POINT OF NO RETURN: If passing this, the next stop exceeds drive clock!
    status: 'REACHABLE_RECOMMENDED',
  },
  {
    id: 'park-03',
    name: 'State Rest Area (Mile 212 WB)',
    brand: 'STATE_REST_AREA',
    mileMarker: 212,
    distanceMiles: 88.4,
    estimatedMinutesArrival: 82,
    totalTruckSpaces: 35,
    openTruckSpaces: 1,
    parkingConfidencePct: 42,
    hasCATScale: false,
    hasDEFAtPump: false,
    hasShowers: false,
    isPointOfNoReturn: false,
    status: 'REACHABLE_CONGESTED',
  },
  {
    id: 'park-04',
    name: 'TA Travel Center #104',
    brand: 'TA_PETRO',
    mileMarker: 254,
    distanceMiles: 130.4,
    estimatedMinutesArrival: 122,
    totalTruckSpaces: 145,
    openTruckSpaces: 38,
    parkingConfidencePct: 91,
    hasCATScale: true,
    hasDEFAtPump: true,
    hasShowers: true,
    isPointOfNoReturn: false,
    status: 'UNREACHABLE_EXCEEDS_HOS',
  },
];

export const INITIAL_UNASSIGNED_ANALYSIS: UnassignedDrivingEventAnalysis[] = [
  {
    id: 'unassign-01',
    timestamp: '2026-09-30 22:14:08 CDT',
    distanceMiles: 2.4,
    maxSpeedMph: 16.2,
    engineRpmMean: 1120,
    cabPhoneBleSignalDbm: -98, // BLE phone is > 100ft away -> Driver was NOT in cab!
    classifiedSource: 'SHOP_MAINTENANCE_TECH',
    confidencePct: 99.4,
    autoAnnotationText: 'Yard movement performed by shop technician for PM service & brake stroke measurement. Driver smartphone not in cab (BLE -98 dBm). Complies with 49 CFR § 395.28.',
    approvedByFleetManager: true,
  },
  {
    id: 'unassign-02',
    timestamp: '2026-09-28 04:32:19 CDT',
    distanceMiles: 0.8,
    maxSpeedMph: 12.0,
    engineRpmMean: 950,
    cabPhoneBleSignalDbm: -92,
    classifiedSource: 'TERMINAL_YARD_JOCKEY',
    confidencePct: 97.8,
    autoAnnotationText: 'Trailer repositioning inside closed private shipper terminal. Yard movement exempt under § 395.28.',
    approvedByFleetManager: true,
  },
];

export class EldChronoPredictiveService {
  /**
   * Generates a pre-flight eRODS audit report simulating an FMCSA Level-1 roadside trooper review
   */
  public generatePreFlightReport(defects: ErodsAuditDefect[] = INITIAL_ERODS_DEFECTS): ErodsPreFlightReport {
    const unannotatedDefects = defects.filter((d) => !d.isAnnotated);
    const criticalCount = unannotatedDefects.filter((d) => d.severity === 'CRITICAL_OOS').length;
    const highCount = unannotatedDefects.filter((d) => d.severity === 'HIGH_CITATION').length;
    const mediumCount = unannotatedDefects.filter((d) => d.severity === 'MEDIUM_WARNING').length;

    // Calculate risk score: 0 = perfect, 100 = critical out of service
    let riskScore = criticalCount * 45 + highCount * 25 + mediumCount * 10;
    riskScore = Math.min(Math.max(riskScore, 0), 100);

    let auditReadiness: ErodsPreFlightReport['auditReadiness'] = 'READY_TO_TRANSMIT';
    if (criticalCount > 0 || highCount > 1) {
      auditReadiness = 'HIGH_AUDIT_EXPOSURE';
    } else if (unannotatedDefects.length > 0) {
      auditReadiness = 'ANNOTATIONS_RECOMMENDED';
    }

    return {
      overallRiskScore: riskScore,
      auditReadiness,
      inspectedDaysCount: 8,
      totalMilesAudited: 3418.6,
      unassignedDrivingMiles: 3.2,
      missingDriverSignatures: 1,
      diagnosticMalfunctionEvents: 0,
      defects,
      fmcsaTransferMethodsAvailable: {
        webServices: true,
        email: true,
        bluetooth: true,
        usb: true,
      },
    };
  }

  /**
   * Solves FMCSA 49 CFR § 395.1(g) Split Sleeper Berth equations
   * dynamically computing recalculated 14-hour windows and regained driving hours.
   */
  public calculateSplitSleeper(firstBreakHours: number, secondBreakHours: number): SplitSleeperSimulation {
    const is8_2 = (firstBreakHours >= 8 && secondBreakHours >= 2) || (firstBreakHours >= 2 && secondBreakHours >= 8);
    const is7_3 = (firstBreakHours >= 7 && secondBreakHours >= 3) || (firstBreakHours >= 3 && secondBreakHours >= 7);

    const qualifying = is8_2 || is7_3;

    if (qualifying) {
      const qualifyingBreak = Math.max(firstBreakHours, secondBreakHours);
      const shorterBreak = Math.min(firstBreakHours, secondBreakHours);
      const rule = is8_2
        ? '49 CFR § 395.1(g)(1)(ii) [8/2 Split]'
        : '49 CFR § 395.1(g)(1)(ii) [7/3 Split]';

      return {
        firstBreakHours,
        secondBreakHours,
        qualifyingPair: true,
        shiftWindowExtensionHours: shorterBreak,
        regainedDriveHours: Math.min(11, 4.5 + shorterBreak * 0.8),
        newShiftExpirationTimestamp: new Date(Date.now() + (14 + shorterBreak) * 3600 * 1000).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        statutoryRuleApplied: rule,
        explanation: `Qualifying ${qualifyingBreak}/${shorterBreak} split pair detected. Neither period counts against your 14-hour driving window. Your 14-hour clock dynamically resets to the conclusion of the first qualifying rest period, legally restoring your available drive time.`,
      };
    }

    return {
      firstBreakHours,
      secondBreakHours,
      qualifyingPair: false,
      shiftWindowExtensionHours: 0,
      regainedDriveHours: 0,
      newShiftExpirationTimestamp: new Date(Date.now() + 2 * 3600 * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      statutoryRuleApplied: 'NON_QUALIFYING',
      explanation: 'Break combination does not meet FMCSA § 395.1(g) requirements (must be at least 7/3 or 8/2 in sleeper berth). Duty window continues to count down continuously.',
    };
  }

  /**
   * Evaluates Point-of-No-Return (PNR) for upcoming truck parking
   */
  public evaluatePointOfNoReturn(
    remainingDriveMinutes: number,
    currentSpeedMph: number = 63,
    parkingNodes: SafeHavenParkingNode[] = INITIAL_SAFE_HAVEN_PARKING
  ): {
    pnrNode: SafeHavenParkingNode | null;
    minutesToPnr: number;
    recommendedAction: string;
    criticalAlertLevel: 'NORMAL' | 'WARNING' | 'EMERGENCY_PNR';
  } {
    const maxSafeMiles = (remainingDriveMinutes / 60) * currentSpeedMph;
    const reachableNodes = parkingNodes.filter((p) => p.distanceMiles <= maxSafeMiles);
    const pnrNode = reachableNodes.find((p) => p.isPointOfNoReturn) || reachableNodes[reachableNodes.length - 1] || null;

    if (!pnrNode) {
      return {
        pnrNode: null,
        minutesToPnr: 0,
        recommendedAction: 'CRITICAL: No legal parking locations detected within remaining HOS drive clock! Activate FMCSA § 395.1(b)(1) Adverse Driving Condition legal dossier immediately.',
        criticalAlertLevel: 'EMERGENCY_PNR',
      };
    }

    const minutesToPnr = Math.round((pnrNode.distanceMiles / currentSpeedMph) * 60);

    let criticalAlertLevel: 'NORMAL' | 'WARNING' | 'EMERGENCY_PNR' = 'NORMAL';
    if (minutesToPnr <= 20) {
      criticalAlertLevel = 'EMERGENCY_PNR';
    } else if (minutesToPnr <= 45) {
      criticalAlertLevel = 'WARNING';
    }

    const recommendedAction = `Target ${pnrNode.name} at Mile Marker ${pnrNode.mileMarker} (${pnrNode.openTruckSpaces} spaces open). You must exit in ${minutesToPnr} minutes or you will surpass the Point of No Return.`;

    return {
      pnrNode,
      minutesToPnr,
      recommendedAction,
      criticalAlertLevel,
    };
  }
}

export const eldChronoPredictiveService = new EldChronoPredictiveService();
