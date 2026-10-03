/**
 * ============================================================================
 * TRUCKWITHEASE™ REAL-TIME ELD COMPLIANCE & HARDWARE LINK SERVICE
 * 
 * FMCSA 49 CFR Part 395 (Hours of Service) & Part 395.22 (ELD Technical Standards)
 * Real-time Firestore Listener Engine & J1939 CAN-Bus Link Diagnostics
 * ============================================================================
 */

import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  getDocs,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { EldComplianceAlert, EldHardwareMalfunctionIndicator } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice (Optimistic Fallback active):', JSON.stringify(errInfo));
}

export const INITIAL_ELD_COMPLIANCE_ALERTS: EldComplianceAlert[] = [
  {
    id: 'eld-alert-tr904',
    unitNumber: 'TR-904',
    driverName: 'Marcus Bell',
    driverId: 'drv-001',
    dutyStatus: 'DRIVING',
    drivingMinutesRemaining: 222, // 3h 42m
    shiftMinutesRemaining: 318, // 5h 18m
    cycleMinutesRemaining: 1470, // 24h 30m
    restBreakMinutesRemaining: 74, // 1h 14m (approaching break limit!)
    isApproachingDrivingLimit: false,
    isApproachingShiftLimit: false,
    isApproachingBreakLimit: true,
    isApproachingCycleLimit: false,
    hardwareConnected: true,
    hardwareProtocol: 'J1939_9_PIN_CANBUS',
    signalQualityPct: 98,
    dataStreamFrequencyHz: 50,
    engineSyncStatus: 'SYNCHRONIZED',
    powerComplianceStatus: 'COMPLIANT',
    timingComplianceStatus: 'GPS_UTC_LOCKED',
    positioningStatus: 'ACCURATE_3D_FIX',
    malfunctionIndicators: [
      {
        code: 'DIAG-REST-01',
        fmcsaStandardCode: '49 CFR § 395.3(a)(3)(ii)',
        severity: 'WARNING',
        description: '30-Minute Rest Break mandatory within 74 minutes of consecutive driving.',
        occurredAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        cleared: false,
      },
    ],
    lastHeartbeatIso: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'eld-alert-tr802',
    unitNumber: 'TR-802',
    driverName: 'Darius Thorne',
    driverId: 'drv-002',
    dutyStatus: 'ON_DUTY',
    drivingMinutesRemaining: 540, // 9h 00m
    shiftMinutesRemaining: 660, // 11h 00m
    cycleMinutesRemaining: 2880, // 48h 00m
    restBreakMinutesRemaining: 480, // 8h 00m
    isApproachingDrivingLimit: false,
    isApproachingShiftLimit: false,
    isApproachingBreakLimit: false,
    isApproachingCycleLimit: false,
    hardwareConnected: true,
    hardwareProtocol: 'J1939_9_PIN_CANBUS',
    signalQualityPct: 94,
    dataStreamFrequencyHz: 50,
    engineSyncStatus: 'SYNCHRONIZED',
    powerComplianceStatus: 'COMPLIANT',
    timingComplianceStatus: 'GPS_UTC_LOCKED',
    positioningStatus: 'ACCURATE_3D_FIX',
    malfunctionIndicators: [],
    lastHeartbeatIso: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'eld-alert-tr715',
    unitNumber: 'TR-715',
    driverName: 'Elena Vance',
    driverId: 'drv-003',
    dutyStatus: 'DRIVING',
    drivingMinutesRemaining: 28, // 0h 28m (CRITICAL WARNING!)
    shiftMinutesRemaining: 45, // 0h 45m
    cycleMinutesRemaining: 180, // 3h 00m
    restBreakMinutesRemaining: 28,
    isApproachingDrivingLimit: true,
    isApproachingShiftLimit: true,
    isApproachingBreakLimit: true,
    isApproachingCycleLimit: false,
    hardwareConnected: true,
    hardwareProtocol: 'OBD2_DIRECT_ECM',
    signalQualityPct: 88,
    dataStreamFrequencyHz: 48,
    engineSyncStatus: 'SYNCHRONIZED',
    powerComplianceStatus: 'COMPLIANT',
    timingComplianceStatus: 'GPS_UTC_LOCKED',
    positioningStatus: 'ACCURATE_3D_FIX',
    malfunctionIndicators: [
      {
        code: 'HOS-DRV-LIMIT-01',
        fmcsaStandardCode: '49 CFR § 395.3(a)(1)',
        severity: 'MALFUNCTION',
        description: '11-Hour Maximum Driving Limit expires in 28 minutes. Safe parking designated.',
        occurredAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        cleared: false,
      },
    ],
    lastHeartbeatIso: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class EldComplianceAlertService {
  private cachedAlerts: Map<string, EldComplianceAlert> = new Map();
  private isInitialized = false;

  constructor() {
    INITIAL_ELD_COMPLIANCE_ALERTS.forEach((alert) => {
      this.cachedAlerts.set(alert.id, alert);
    });
  }

  // Subscribe to real-time Firestore updates on eld_compliance_alerts
  public subscribeToEldAlerts(
    onAlertsUpdate: (alerts: EldComplianceAlert[]) => void,
    onSyncStatusChange?: (isLive: boolean, latencyMs: number) => void
  ): Unsubscribe {
    const path = 'eld_compliance_alerts';
    let isInitialFetch = true;

    try {
      const colRef = collection(db, path);
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const startTime = performance.now();
          if (snapshot.empty && isInitialFetch) {
            // Seed initial records to Firestore so collection is populated
            this.seedInitialAlerts();
            onAlertsUpdate(Array.from(this.cachedAlerts.values()));
          } else if (!snapshot.empty) {
            const fetchedAlerts: EldComplianceAlert[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as EldComplianceAlert;
              this.cachedAlerts.set(data.id || docSnap.id, {
                ...data,
                id: data.id || docSnap.id,
              });
              fetchedAlerts.push(data);
            });
            onAlertsUpdate(fetchedAlerts.sort((a, b) => a.unitNumber.localeCompare(b.unitNumber)));
          } else {
            onAlertsUpdate(Array.from(this.cachedAlerts.values()));
          }

          isInitialFetch = false;
          const latency = Math.round(performance.now() - startTime);
          if (onSyncStatusChange) {
            onSyncStatusChange(true, latency);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          // Seamless fallback to cached/simulated real-time records
          onAlertsUpdate(Array.from(this.cachedAlerts.values()));
          if (onSyncStatusChange) {
            onSyncStatusChange(false, 0);
          }
        }
      );

      return unsubscribe;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      onAlertsUpdate(Array.from(this.cachedAlerts.values()));
      if (onSyncStatusChange) {
        onSyncStatusChange(false, 0);
      }
      return () => {};
    }
  }

  // Seed default alerts to Firestore on first run
  public async seedInitialAlerts(): Promise<void> {
    const path = 'eld_compliance_alerts';
    for (const alert of INITIAL_ELD_COMPLIANCE_ALERTS) {
      try {
        const docRef = doc(db, path, alert.id);
        await setDoc(docRef, alert, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `${path}/${alert.id}`);
      }
    }
  }

  // Update or persist specific alert
  public async saveEldAlert(alert: EldComplianceAlert): Promise<void> {
    this.cachedAlerts.set(alert.id, alert);
    const path = `eld_compliance_alerts/${alert.id}`;
    try {
      const docRef = doc(db, 'eld_compliance_alerts', alert.id);
      await setDoc(docRef, {
        ...alert,
        updatedAt: new Date().toISOString(),
        lastHeartbeatIso: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  // Simulation: Trigger Near-Violation Warning (e.g. < 30 mins)
  public async simulateNearViolation(alertId: string): Promise<EldComplianceAlert | null> {
    const existing = this.cachedAlerts.get(alertId);
    if (!existing) return null;

    const updated: EldComplianceAlert = {
      ...existing,
      drivingMinutesRemaining: 18,
      shiftMinutesRemaining: 32,
      restBreakMinutesRemaining: 18,
      isApproachingDrivingLimit: true,
      isApproachingShiftLimit: true,
      isApproachingBreakLimit: true,
      malfunctionIndicators: [
        {
          code: 'WARN-HOS-CRITICAL-18M',
          fmcsaStandardCode: '49 CFR § 395.3(a)(1)',
          severity: 'WARNING',
          description: 'CRITICAL COUNTDOWN: 18 Minutes of allowable driving remaining before statutory violation.',
          occurredAt: new Date().toISOString(),
          cleared: false,
        },
        ...existing.malfunctionIndicators.filter((m) => m.code !== 'WARN-HOS-CRITICAL-18M'),
      ],
      updatedAt: new Date().toISOString(),
    };

    await this.saveEldAlert(updated);
    return updated;
  }

  // Simulation: Toggle J1939 Hardware Disconnect / Malfunction Warning
  public async toggleHardwareConnection(alertId: string): Promise<EldComplianceAlert | null> {
    const existing = this.cachedAlerts.get(alertId);
    if (!existing) return null;

    const newHardwareState = !existing.hardwareConnected;
    const malfunctionList = [...existing.malfunctionIndicators];

    if (!newHardwareState) {
      // Disconnected: Add J1939 diagnostic warning
      malfunctionList.unshift({
        code: 'MALF-ECM-J1939-DISCONN',
        fmcsaStandardCode: '49 CFR § 395.22(a) Technical Standard § 4.6.1.1',
        severity: 'MALFUNCTION',
        description: 'HARDWARE LINK WARNING: J1939 9-Pin ECM Diagnostic link dropped. Unidentified driving records accumulating.',
        occurredAt: new Date().toISOString(),
        cleared: false,
      });
    } else {
      // Reconnected: Clear diagnostic
      const item = malfunctionList.find((m) => m.code === 'MALF-ECM-J1939-DISCONN');
      if (item) item.cleared = true;
    }

    const updated: EldComplianceAlert = {
      ...existing,
      hardwareConnected: newHardwareState,
      signalQualityPct: newHardwareState ? 98 : 0,
      engineSyncStatus: newHardwareState ? 'SYNCHRONIZED' : 'UNSYNCHRONIZED',
      powerComplianceStatus: newHardwareState ? 'COMPLIANT' : 'VOLTAGE_DROP_WARNING',
      malfunctionIndicators: malfunctionList,
      updatedAt: new Date().toISOString(),
    };

    await this.saveEldAlert(updated);
    return updated;
  }

  // Simulation: Reset Clocks (10-Hour Off-Duty Reset)
  public async resetClocks(alertId: string): Promise<EldComplianceAlert | null> {
    const existing = this.cachedAlerts.get(alertId);
    if (!existing) return null;

    const updated: EldComplianceAlert = {
      ...existing,
      dutyStatus: 'OFF_DUTY',
      drivingMinutesRemaining: 660, // Full 11h
      shiftMinutesRemaining: 840, // Full 14h
      restBreakMinutesRemaining: 480, // Full 8h
      cycleMinutesRemaining: Math.min(4200, existing.cycleMinutesRemaining + 660),
      isApproachingDrivingLimit: false,
      isApproachingShiftLimit: false,
      isApproachingBreakLimit: false,
      isApproachingCycleLimit: false,
      malfunctionIndicators: existing.malfunctionIndicators.map((m) => ({ ...m, cleared: true })),
      updatedAt: new Date().toISOString(),
    };

    await this.saveEldAlert(updated);
    return updated;
  }
}

export const eldComplianceAlertService = new EldComplianceAlertService();
