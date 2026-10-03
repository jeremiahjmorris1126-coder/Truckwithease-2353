import {
  RoadsideInspectionRecord,
  RoadsideViolationItem,
  CvsaInspectionLevel,
} from '../types';

// =====================================================================
// === INITIAL SEED ROADSIDE INSPECTIONS (CVSA / FMCSA 49 CFR § 396.9) ===
// =====================================================================

export const INITIAL_ROADSIDE_INSPECTIONS: RoadsideInspectionRecord[] = [
  {
    id: 'rsi-202609-001',
    reportNumber: 'PA-PSP-2026-904128',
    inspectionDate: 'Sep 21, 2026',
    inspectionTime: '11:15 EDT',
    stateJurisdiction: 'PA',
    locationDescription: 'I-81 Northbound Weigh Station & Inspection Facility (Mile Marker 77)',
    highwayMileMarker: 'I-81 MM 77.4 NB',
    inspectingAgency: 'STATE_POLICE',
    inspectorNameAndBadge: 'Trooper M. Higgins #4892 (CVSA Certified Level 1)',
    carrierName: 'Truckwithease Fleet Logistics Corp',
    carrierUsDot: 'USDOT #3948102',
    driverName: 'Marcus Bell',
    driverCdlNumber: 'IL-CDLA-49102-IL',
    driverCdlState: 'IL',
    tractorUnitNumber: 'UNIT #104-E',
    tractorVin: '1FUJGLDR8PL948201',
    tractorPlate: 'PA-P99420',
    trailerUnitNumber: 'TRL-5390',
    trailerPlate: 'PA-TRL8839',
    inspectionLevel: 'LEVEL_1_COMPREHENSIVE',
    isCleanPass: true, // ZERO DEFECTS CLEAN PASS!
    isCvsaDecalIssued: true, // Official CVSA quarterly decal applied to windshield
    outOfService: false,
    oosType: 'NONE',
    violations: [],
    documentFileName: 'PA_PSP_Inspection_Report_904128_Clean.pdf',
    documentFileSize: '1.4 MB',
    documentFileType: 'application/pdf',
    uploadedAt: 'Sep 21, 2026 · 11:40 EDT',
    sentToCompany: true,
    sentToCompanyTimestamp: 'Sep 21, 2026 · 11:42 EDT',
    companyRecipientEmail: 'safety@truckwithease.com',
    companyWorkOrderId: 'WO-CLEAN-PASS-VERIFIED',
    sentToDot: true,
    sentToDotTimestamp: 'Sep 21, 2026 · 11:45 EDT',
    dotTransmittalTrackingId: 'DOT-RECEIPT-PA-2026-904128-CLEAN',
    dot15DayDeadlineDate: 'Oct 06, 2026',
    carrierCertifiedCorrectiveAction: {
      certifiedByName: 'Dave Miller',
      certifiedByTitle: 'Director of Safety & Compliance',
      certifiedDate: '2026-09-21',
      repairDetailsNote: 'Clean inspection verified. CVSA safety decal affixed to windshield. Driver rewarded +150 EaseRewards points for zero-defect scale pass.',
      signatureToken: 'CERT-SIG-DM-88392-PA',
    },
    rewardPointsCredited: 150,
    statusNotes: 'Clean CVSA Level 1 inspection. CVSA 3rd Quarter inspection decal issued. No enforcement actions required.',
  },
  {
    id: 'rsi-202609-002',
    reportNumber: 'OH-SHP-2026-441029',
    inspectionDate: 'Sep 14, 2026',
    inspectionTime: '14:22 EDT',
    stateJurisdiction: 'OH',
    locationDescription: 'Ohio Turnpike (I-80) Scale #4 Eastbound (Mile Marker 135)',
    highwayMileMarker: 'I-80 MM 135.2 EB',
    inspectingAgency: 'HIGHWAY_PATROL',
    inspectorNameAndBadge: 'Officer T. Reynolds #814',
    carrierName: 'Truckwithease Fleet Logistics Corp',
    carrierUsDot: 'USDOT #3948102',
    driverName: 'Carlos Ramirez',
    driverCdlNumber: 'TX-CDLA-7719204',
    driverCdlState: 'TX',
    tractorUnitNumber: 'UNIT #108-A',
    tractorVin: '1NKDX4EX9PR771829',
    tractorPlate: 'TX-R77218',
    trailerUnitNumber: 'TRL-4421',
    trailerPlate: 'TX-T44109',
    inspectionLevel: 'LEVEL_2_WALKAROUND',
    isCleanPass: false,
    isCvsaDecalIssued: false,
    outOfService: false,
    oosType: 'NONE',
    violations: [
      {
        id: 'viol-01',
        codeCfr: '49 CFR § 393.9',
        description: 'Inoperative tail lamp / license plate illumination lamp on rear trailer bumper',
        unitTarget: 'TRAILER',
        isOutOfService: false,
        severityWeight: 2,
        actionTakenNotes: 'Bulb socket cleaned and sealed; new LED bulb installed at Love\'s Travel Stop MM 140.',
      },
      {
        id: 'viol-02',
        codeCfr: '49 CFR § 393.75(a)(3)',
        description: 'Tire - other than steer axle - tread depth less than 2/32 inch (Trailer Right Rear Inside: 1.5/32")',
        unitTarget: 'TRAILER',
        isOutOfService: false,
        severityWeight: 3,
        actionTakenNotes: 'Replaced tire with Goodyear Endurance trailer casing at Love\'s Speedco shop.',
      },
    ],
    documentFileName: 'OH_SHP_Inspection_Report_441029_Violations.pdf',
    documentFileSize: '2.1 MB',
    documentFileType: 'application/pdf',
    uploadedAt: 'Sep 14, 2026 · 15:05 EDT',
    sentToCompany: true,
    sentToCompanyTimestamp: 'Sep 14, 2026 · 15:10 EDT',
    companyRecipientEmail: 'maintenance@truckwithease.com',
    companyWorkOrderId: 'WO-88429-OH-SPEEDCO',
    sentToDot: true,
    sentToDotTimestamp: 'Sep 16, 2026 · 09:30 EDT',
    dotTransmittalTrackingId: 'DOT-CERT-OH-2026-441029-REPAIRED',
    dot15DayDeadlineDate: 'Sep 29, 2026',
    carrierCertifiedCorrectiveAction: {
      certifiedByName: 'Dave Miller',
      certifiedByTitle: 'Director of Safety & Compliance',
      certifiedDate: '2026-09-16',
      repairDetailsNote: 'All cited violations repaired within 48 hours at Love\'s Speedco #312. Paid repair invoice WO-88429 on file. Motor carrier certification signed and uploaded to Ohio PUCO / FMCSA portal.',
      signatureToken: 'CERT-SIG-DM-44102-OH',
    },
    rewardPointsCredited: 0,
    statusNotes: 'Non-OOS violations corrected and certified back to Ohio State Highway Patrol within the statutory 15-day window.',
  },
  {
    id: 'rsi-202609-003',
    reportNumber: 'IN-ISP-2026-778210',
    inspectionDate: 'Aug 29, 2026',
    inspectionTime: '09:40 CDT',
    stateJurisdiction: 'IN',
    locationDescription: 'I-65 Southbound Weigh Station (Mile Marker 192 near Wolcott)',
    highwayMileMarker: 'I-65 MM 192.5 SB',
    inspectingAgency: 'STATE_POLICE',
    inspectorNameAndBadge: 'Commercial Vehicle Inspector R. Vance #1094',
    carrierName: 'Truckwithease Fleet Logistics Corp',
    carrierUsDot: 'USDOT #3948102',
    driverName: 'Marcus Bell',
    driverCdlNumber: 'IL-CDLA-49102-IL',
    driverCdlState: 'IL',
    tractorUnitNumber: 'UNIT #104-E',
    tractorVin: '1FUJGLDR8PL948201',
    tractorPlate: 'PA-P99420',
    trailerUnitNumber: 'TRL-5390',
    trailerPlate: 'PA-TRL8839',
    inspectionLevel: 'LEVEL_3_DRIVER_CREDENTIALS',
    isCleanPass: true,
    isCvsaDecalIssued: false,
    outOfService: false,
    oosType: 'NONE',
    violations: [],
    documentFileName: 'IN_ISP_Inspection_778210_DriverOnly.pdf',
    documentFileSize: '890 KB',
    documentFileType: 'application/pdf',
    uploadedAt: 'Aug 29, 2026 · 10:15 CDT',
    sentToCompany: true,
    sentToCompanyTimestamp: 'Aug 29, 2026 · 10:18 CDT',
    companyRecipientEmail: 'safety@truckwithease.com',
    companyWorkOrderId: 'WO-CLEAN-PASS-VERIFIED',
    sentToDot: true,
    sentToDotTimestamp: 'Aug 29, 2026 · 10:20 CDT',
    dotTransmittalTrackingId: 'DOT-RECEIPT-IN-2026-778210-CLEAN',
    dot15DayDeadlineDate: 'Sep 13, 2026',
    carrierCertifiedCorrectiveAction: {
      certifiedByName: 'Dave Miller',
      certifiedByTitle: 'Director of Safety & Compliance',
      certifiedDate: '2026-08-29',
      repairDetailsNote: 'Clean Level 3 driver credentials inspection. CDL-A, Medical Card, and electronic HOS logs verified 100% compliant with zero infractions.',
      signatureToken: 'CERT-SIG-DM-77821-IN',
    },
    rewardPointsCredited: 100,
    statusNotes: 'Clean Level 3 inspection. HOS and Medical certificate validated.',
  },
];

// =====================================================================
// === STORAGE HELPERS ===
// =====================================================================

const ROADSIDE_INSPECTIONS_STORAGE_KEY = 'truckwithease_roadside_inspections_v1';

export function getStoredRoadsideInspections(): RoadsideInspectionRecord[] {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return INITIAL_ROADSIDE_INSPECTIONS;
    }
    const raw = localStorage.getItem(ROADSIDE_INSPECTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read stored roadside inspections:', err);
  }
  return INITIAL_ROADSIDE_INSPECTIONS;
}

export function saveRoadsideInspection(record: RoadsideInspectionRecord): RoadsideInspectionRecord[] {
  const current = getStoredRoadsideInspections();
  const updated = [record, ...current.filter((r) => r.id !== record.id)];
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(ROADSIDE_INSPECTIONS_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('Could not save roadside inspection:', err);
  }
  return updated;
}

// Calculate 15-day statutory deadline from inspection date per 49 CFR § 396.9(d)
export function calculate15DayDeadline(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      d.setDate(d.getDate() + 15);
      return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    }
  } catch (e) {
    // fallback
  }
  const now = new Date();
  now.setDate(now.getDate() + 15);
  return now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}
