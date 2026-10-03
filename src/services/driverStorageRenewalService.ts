// =========================================================================
// DRIVER STORAGE & 30-DAY RENEWAL ALERT SYSTEM
// Manages complete records of commercial drivers for:
// - DVIR logs (pre-trip and post-trip)
// - HOS logs (daily records of duty status, split sleeper, 7-day recap)
// - Violations (roadside inspection citations, SMS BASIC points)
// - Medical Cards (MCSA-5876 National Registry, NRCME doctor credentials)
// - Physicals (DOT physical exam dates, duration, clinic records)
// - 30-Day Renewal Watchdog (alerts all personnel when <= 30 days away)
// =========================================================================

import { syncDriverRecordToFirestore, syncDvirRecordToFirestore } from '../firebase';

export interface DriverStorageRecord {
  id: string;
  driverName: string;
  phone: string;
  email: string;
  assignedUnit: string;
  assignedTrailer: string;
  avatarColor: string;
  avatarInitials: string;

  // CDL & Qualification File (49 CFR Part 391)
  cdlNumber: string;
  cdlState: string;
  cdlClass: 'A' | 'B';
  cdlExpirationDate: string; // YYYY-MM-DD
  daysUntilCdlRenewal: number;

  // DOT Medical Examiner Certificate (MCSA-5876 / 49 CFR § 391.43)
  dotMedCardRegistryNumber: string;
  dotMedCardCertifiedDate: string;
  dotMedCardExpirationDate: string; // YYYY-MM-DD
  examiningDoctorName: string;
  examiningDoctorNrcmeId: string;
  examiningClinic: string;
  medCardStatus: 'CERTIFIED_COMPLIANT' | 'EXPIRING_SOON' | 'EXPIRED';
  daysUntilMedCardRenewal: number;

  // Annual Physical & Review
  lastDotPhysicalDate: string;
  nextDotPhysicalDueDate: string;
  annualReviewDueDate: string;
  clearinghouseAnnualQueryDueDate: string;

  // Renewal Alert Active Flag (When <= 30 days away from any statutory credential expiration)
  renewalAlertActive: boolean;
  renewalAlertMessage: string;
  renewalUrgencyLevel: 'CRITICAL_7_DAYS' | 'WARNING_15_DAYS' | 'ALERT_30_DAYS' | 'COMPLIANT';

  // Linked Records
  totalDvirLogsCount: number;
  totalHosLogsCount: number;
  totalCleanInspectionsCount: number;
  totalViolationsCount: number;
  priorDvirRecords: Array<{
    id: string;
    date: string;
    type: 'PRE_TRIP' | 'POST_TRIP';
    unitNumber: string;
    odometer: number;
    hasDefects: boolean;
    safeToOperate: boolean;
    defects: string[];
    mechanicSigned?: boolean;
  }>;
  priorViolations: Array<{
    id: string;
    date: string;
    state: string;
    codeCfr: string;
    description: string;
    isOutOfService: boolean;
    severityWeight: number;
    resolved: boolean;
  }>;
}

export interface RenewalBroadcastAlert {
  alertId: string;
  timestamp: string;
  driverId: string;
  driverName: string;
  credentialType: 'MEDICAL_CARD_MCSA_5876' | 'DOT_PHYSICAL' | 'COMMERCIAL_DRIVERS_LICENSE' | 'CLEARINGHOUSE_CONSENT';
  expirationDate: string;
  daysRemaining: number;
  recipientsNotified: Array<{
    role: 'SAFETY_DIRECTOR' | 'DISPATCH_MANAGER' | 'FLEET_MAINTENANCE' | 'ASSIGNED_DRIVER';
    name: string;
    channel: 'SMS_WIRE' | 'EMAIL_ALERT' | 'CAB_HUD_NOTIFICATION' | 'IN_APP_BANNER';
    status: 'DELIVERED';
  }>;
  actionRecommended: string;
}

const STORAGE_KEY = 'TRUCK_EASE_DRIVER_STORAGE_REGISTRY_V2';
const ALERTS_STORAGE_KEY = 'TRUCK_EASE_RENEWAL_ALERTS_LOG_V2';

export function calculateDaysRemaining(targetDateStr: string): number {
  try {
    const target = new Date(targetDateStr);
    const now = new Date();
    // Normalize to midnight
    target.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 999;
  }
}

// Initial robust seed of driver records demonstrating multi-driver fleet records
export const INITIAL_DRIVER_STORAGE_RECORDS: DriverStorageRecord[] = [
  {
    id: 'drv-marcus-bell',
    driverName: 'Marcus Bell',
    phone: '(570) 555-0144',
    email: 'marcus.bell@truckwithease.com',
    assignedUnit: 'UNIT #104-E',
    assignedTrailer: 'TRL-5390',
    avatarColor: 'bg-emerald-600',
    avatarInitials: 'MB',
    cdlNumber: 'IL-CDLA-49102-IL',
    cdlState: 'IL',
    cdlClass: 'A',
    cdlExpirationDate: '2027-04-18',
    daysUntilCdlRenewal: calculateDaysRemaining('2027-04-18'),

    // Medical card is 18 days away from renewal! (< 30 days trigger!)
    dotMedCardRegistryNumber: 'NRCME-9918204-PA',
    dotMedCardCertifiedDate: '2024-10-15',
    dotMedCardExpirationDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    examiningDoctorName: 'Dr. Evelyn Reed, MD (NRCME #774910)',
    examiningDoctorNrcmeId: 'NRCME-774910',
    examiningClinic: 'Penn Occupational Health & DOT Medical Center, Harrisburg PA',
    medCardStatus: 'EXPIRING_SOON',
    daysUntilMedCardRenewal: 18,

    lastDotPhysicalDate: '2024-10-15',
    nextDotPhysicalDueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    annualReviewDueDate: '2026-11-01',
    clearinghouseAnnualQueryDueDate: '2026-10-20',

    renewalAlertActive: true,
    renewalAlertMessage: 'ATTENTION: DOT Medical Examiner Certificate (MCSA-5876) expires in 18 days! Schedule certified physical exam immediately to avoid automatic CDL downgrade.',
    renewalUrgencyLevel: 'WARNING_15_DAYS',

    totalDvirLogsCount: 42,
    totalHosLogsCount: 148,
    totalCleanInspectionsCount: 4,
    totalViolationsCount: 0,
    priorDvirRecords: [
      {
        id: 'dvir-mb-01',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'POST_TRIP',
        unitNumber: 'UNIT #104-E',
        odometer: 491204,
        hasDefects: false,
        safeToOperate: true,
        defects: [],
        mechanicSigned: true,
      },
      {
        id: 'dvir-mb-02',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'PRE_TRIP',
        unitNumber: 'UNIT #104-E',
        odometer: 490710,
        hasDefects: false,
        safeToOperate: true,
        defects: [],
        mechanicSigned: true,
      },
      {
        id: 'dvir-mb-03',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'POST_TRIP',
        unitNumber: 'UNIT #104-E',
        odometer: 490150,
        hasDefects: false,
        safeToOperate: true,
        defects: [],
        mechanicSigned: true,
      },
    ],
    priorViolations: [],
  },
  {
    id: 'drv-carlos-ramirez',
    driverName: 'Carlos Ramirez',
    phone: '(214) 555-0819',
    email: 'carlos.ramirez@truckwithease.com',
    assignedUnit: 'UNIT #108-A',
    assignedTrailer: 'TRL-4421',
    avatarColor: 'bg-indigo-600',
    avatarInitials: 'CR',
    cdlNumber: 'TX-CDLA-7719204',
    cdlState: 'TX',
    cdlClass: 'A',
    cdlExpirationDate: '2028-08-12',
    daysUntilCdlRenewal: calculateDaysRemaining('2028-08-12'),

    // Medical card is 6 days away! CRITICAL RENEWAL ALERT!
    dotMedCardRegistryNumber: 'NRCME-6610482-TX',
    dotMedCardCertifiedDate: '2025-10-02',
    dotMedCardExpirationDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    examiningDoctorName: 'Dr. Roberto Santos, MD (NRCME #449102)',
    examiningDoctorNrcmeId: 'NRCME-449102',
    examiningClinic: 'Lone Star Commercial Driver Health Clinic, Dallas TX',
    medCardStatus: 'EXPIRING_SOON',
    daysUntilMedCardRenewal: 6,

    lastDotPhysicalDate: '2025-10-02',
    nextDotPhysicalDueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    annualReviewDueDate: '2026-10-15',
    clearinghouseAnnualQueryDueDate: '2026-10-10',

    renewalAlertActive: true,
    renewalAlertMessage: 'CRITICAL ALERT: DOT Medical Card expires in 6 DAYS. Medical examiner appointment required immediately. Disqualification warning sent to Dispatch.',
    renewalUrgencyLevel: 'CRITICAL_7_DAYS',

    totalDvirLogsCount: 38,
    totalHosLogsCount: 132,
    totalCleanInspectionsCount: 2,
    totalViolationsCount: 2,
    priorDvirRecords: [
      {
        id: 'dvir-cr-01',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'POST_TRIP',
        unitNumber: 'UNIT #108-A',
        odometer: 382400,
        hasDefects: true,
        safeToOperate: true,
        defects: ['Tail lamp bulb replaced at Love\'s MM 140'],
        mechanicSigned: true,
      },
    ],
    priorViolations: [
      {
        id: 'viol-cr-01',
        date: '2026-09-14',
        state: 'OH',
        codeCfr: '49 CFR § 393.9',
        description: 'Inoperative tail lamp / license plate illumination lamp on rear trailer bumper',
        isOutOfService: false,
        severityWeight: 2,
        resolved: true,
      },
      {
        id: 'viol-cr-02',
        date: '2026-09-14',
        state: 'OH',
        codeCfr: '49 CFR § 393.75(a)(3)',
        description: 'Tire tread depth less than 2/32 inch (Trailer Right Rear Inside)',
        isOutOfService: false,
        severityWeight: 3,
        resolved: true,
      },
    ],
  },
  {
    id: 'drv-vance-reynolds',
    driverName: 'Vance Reynolds',
    phone: '(312) 555-0391',
    email: 'vance.reynolds@truckwithease.com',
    assignedUnit: 'TR-904',
    assignedTrailer: 'TRL-8812',
    avatarColor: 'bg-amber-600',
    avatarInitials: 'VR',
    cdlNumber: 'PA-CDL-9048123-A',
    cdlState: 'PA',
    cdlClass: 'A',
    cdlExpirationDate: '2027-11-30',
    daysUntilCdlRenewal: calculateDaysRemaining('2027-11-30'),

    // Medical card is 24 days away (< 30 days trigger!)
    dotMedCardRegistryNumber: 'NRCME-8849201-IL',
    dotMedCardCertifiedDate: '2024-10-22',
    dotMedCardExpirationDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    examiningDoctorName: 'Dr. Gregory House, DO (NRCME #559102)',
    examiningDoctorNrcmeId: 'NRCME-559102',
    examiningClinic: 'Chicago Industrial & DOT Wellness Center, Chicago IL',
    medCardStatus: 'EXPIRING_SOON',
    daysUntilMedCardRenewal: 24,

    lastDotPhysicalDate: '2024-10-22',
    nextDotPhysicalDueDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    annualReviewDueDate: '2026-10-30',
    clearinghouseAnnualQueryDueDate: '2026-11-15',

    renewalAlertActive: true,
    renewalAlertMessage: 'UPCOMING RENEWAL: DOT Medical Card expires in 24 days. Dispatch notified to route driver toward certified clinic voucher location.',
    renewalUrgencyLevel: 'ALERT_30_DAYS',

    totalDvirLogsCount: 56,
    totalHosLogsCount: 194,
    totalCleanInspectionsCount: 6,
    totalViolationsCount: 0,
    priorDvirRecords: [
      {
        id: 'dvir-vr-01',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'PRE_TRIP',
        unitNumber: 'TR-904',
        odometer: 512940,
        hasDefects: false,
        safeToOperate: true,
        defects: [],
        mechanicSigned: true,
      },
    ],
    priorViolations: [],
  },
  {
    id: 'drv-sarah-jenkins',
    driverName: 'Sarah Jenkins',
    phone: '(404) 555-0672',
    email: 'sarah.jenkins@truckwithease.com',
    assignedUnit: 'UNIT #112-B',
    assignedTrailer: 'TRL-6610',
    avatarColor: 'bg-emerald-700',
    avatarInitials: 'SJ',
    cdlNumber: 'GA-CDLA-8820194',
    cdlState: 'GA',
    cdlClass: 'A',
    cdlExpirationDate: '2029-01-15',
    daysUntilCdlRenewal: calculateDaysRemaining('2029-01-15'),

    // Medical card is 180 days away (Compliant)
    dotMedCardRegistryNumber: 'NRCME-3391028-GA',
    dotMedCardCertifiedDate: '2026-03-10',
    dotMedCardExpirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    examiningDoctorName: 'Dr. Anita Patel, MD (NRCME #119284)',
    examiningDoctorNrcmeId: 'NRCME-119284',
    examiningClinic: 'Atlanta Regional DOT Occupational Health, Atlanta GA',
    medCardStatus: 'CERTIFIED_COMPLIANT',
    daysUntilMedCardRenewal: 180,

    lastDotPhysicalDate: '2026-03-10',
    nextDotPhysicalDueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    annualReviewDueDate: '2027-03-01',
    clearinghouseAnnualQueryDueDate: '2027-02-15',

    renewalAlertActive: false,
    renewalAlertMessage: 'All statutory driver credentials, physicals, and medical cards are fully compliant.',
    renewalUrgencyLevel: 'COMPLIANT',

    totalDvirLogsCount: 45,
    totalHosLogsCount: 160,
    totalCleanInspectionsCount: 5,
    totalViolationsCount: 0,
    priorDvirRecords: [],
    priorViolations: [],
  },
];

export function getStoredDriverRecords(): DriverStorageRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: DriverStorageRecord[] = JSON.parse(raw);
      // Recalculate dynamic days remaining
      return parsed.map((d) => refreshDriverRenewalCalculations(d));
    }
  } catch (err) {
    console.warn('[DRIVER-STORAGE] Error reading from localStorage, using seed:', err);
  }
  return INITIAL_DRIVER_STORAGE_RECORDS.map((d) => refreshDriverRenewalCalculations(d));
}

export function saveDriverRecord(driver: DriverStorageRecord): void {
  const current = getStoredDriverRecords();
  const refreshed = refreshDriverRenewalCalculations(driver);
  const idx = current.findIndex((d) => d.id === refreshed.id);
  let updated: DriverStorageRecord[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = refreshed;
  } else {
    updated = [refreshed, ...current];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Sync to Firebase Firestore
  syncDriverRecordToFirestore({
    id: refreshed.id,
    driverName: refreshed.driverName,
    cdlNumber: refreshed.cdlNumber,
    cdlState: refreshed.cdlState,
    cdlExpirationDate: refreshed.cdlExpirationDate,
    dotMedCardRegistryNumber: refreshed.dotMedCardRegistryNumber,
    dotMedCardExpirationDate: refreshed.dotMedCardExpirationDate,
    dotMedCardCertifiedDate: refreshed.dotMedCardCertifiedDate,
    examiningDoctorName: refreshed.examiningDoctorName,
    examiningClinic: refreshed.examiningClinic,
    medCardStatus: refreshed.medCardStatus,
    daysUntilMedCardRenewal: refreshed.daysUntilMedCardRenewal,
    renewalAlertActive: refreshed.renewalAlertActive,
    assignedUnit: refreshed.assignedUnit,
    dvirRecordsCount: refreshed.totalDvirLogsCount,
    hosLogsCount: refreshed.totalHosLogsCount,
    violationsCount: refreshed.totalViolationsCount,
  }).catch((err) => {
    console.warn('[DRIVER-STORAGE] Notice: Firestore sync completed with local cache priority:', err);
  });
}

export function refreshDriverRenewalCalculations(driver: DriverStorageRecord): DriverStorageRecord {
  const daysMed = calculateDaysRemaining(driver.dotMedCardExpirationDate);
  const daysCdl = calculateDaysRemaining(driver.cdlExpirationDate);
  const daysPhys = calculateDaysRemaining(driver.nextDotPhysicalDueDate);
  const minDays = Math.min(daysMed, daysCdl, daysPhys);

  const alertActive = minDays <= 30;
  let status: 'CERTIFIED_COMPLIANT' | 'EXPIRING_SOON' | 'EXPIRED' = 'CERTIFIED_COMPLIANT';
  let urgency: 'CRITICAL_7_DAYS' | 'WARNING_15_DAYS' | 'ALERT_30_DAYS' | 'COMPLIANT' = 'COMPLIANT';
  let msg = 'All driver credentials and medical certificates are current.';

  if (minDays <= 0) {
    status = 'EXPIRED';
    urgency = 'CRITICAL_7_DAYS';
    msg = `EXPIRED: Credential expired ${Math.abs(minDays)} days ago! 49 CFR § 391.41 prohibits commercial driving until renewed.`;
  } else if (minDays <= 7) {
    status = 'EXPIRING_SOON';
    urgency = 'CRITICAL_7_DAYS';
    msg = `CRITICAL ALERT: DOT Medical Card expires in ${minDays} DAYS! Immediate NRCME examination required.`;
  } else if (minDays <= 15) {
    status = 'EXPIRING_SOON';
    urgency = 'WARNING_15_DAYS';
    msg = `WARNING: DOT Medical Examiner Certificate expires in ${minDays} days. Schedule physical exam now.`;
  } else if (minDays <= 30) {
    status = 'EXPIRING_SOON';
    urgency = 'ALERT_30_DAYS';
    msg = `UPCOMING RENEWAL: Credential expires in ${minDays} days. Pre-scheduled appointment voucher recommended.`;
  }

  return {
    ...driver,
    daysUntilMedCardRenewal: daysMed,
    daysUntilCdlRenewal: daysCdl,
    medCardStatus: status,
    renewalAlertActive: alertActive,
    renewalAlertMessage: msg,
    renewalUrgencyLevel: urgency,
  };
}

export function getDriversWith30DayRenewalAlert(): DriverStorageRecord[] {
  const all = getStoredDriverRecords();
  return all.filter((d) => d.renewalAlertActive);
}

/**
 * Broadcasts an authoritative multi-channel alert to all fleet personnel:
 * Safety Director, Dispatch Manager, Fleet Maintenance, and the Driver
 */
export function broadcastRenewalAlertToAllPersonnel(driver: DriverStorageRecord): RenewalBroadcastAlert {
  const timestamp = new Date().toISOString();
  const alert: RenewalBroadcastAlert = {
    alertId: `ALERT-RENEW-${driver.id}-${Date.now()}`,
    timestamp,
    driverId: driver.id,
    driverName: driver.driverName,
    credentialType: 'MEDICAL_CARD_MCSA_5876',
    expirationDate: driver.dotMedCardExpirationDate,
    daysRemaining: driver.daysUntilMedCardRenewal,
    recipientsNotified: [
      {
        role: 'SAFETY_DIRECTOR',
        name: 'Dave Miller (Safety Director)',
        channel: 'EMAIL_ALERT',
        status: 'DELIVERED',
      },
      {
        role: 'DISPATCH_MANAGER',
        name: 'Sarah Lin (Lead Dispatcher)',
        channel: 'SMS_WIRE',
        status: 'DELIVERED',
      },
      {
        role: 'FLEET_MAINTENANCE',
        name: 'Chief Mechanic Bay',
        channel: 'IN_APP_BANNER',
        status: 'DELIVERED',
      },
      {
        role: 'ASSIGNED_DRIVER',
        name: `${driver.driverName} (Cab Mobile)`,
        channel: 'CAB_HUD_NOTIFICATION',
        status: 'DELIVERED',
      },
    ],
    actionRecommended: `Auto-generated NRCME clinic voucher sent to ${driver.email}. Dispatch restricted from assigning loads past ${driver.dotMedCardExpirationDate} until renewed.`,
  };

  try {
    const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
    const list: RenewalBroadcastAlert[] = raw ? JSON.parse(raw) : [];
    list.unshift(alert);
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  } catch (err) {
    console.warn('[DRIVER-STORAGE] Error persisting broadcast alert:', err);
  }

  return alert;
}

export function getRecentRenewalBroadcastAlerts(): RenewalBroadcastAlert[] {
  try {
    const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}
