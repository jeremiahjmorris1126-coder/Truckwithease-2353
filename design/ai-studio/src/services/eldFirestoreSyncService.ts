// ============================================================================
// TRUCKWITHEASE ELD HOS LOCAL-FIRST TO FIRESTORE SYNC SERVICE
// Orchestrates seamless store-and-forward sync from IndexedDB to Firestore.
// Ensures critical 49 CFR § 395 ELD logs persist offline and auto-push upon reconnection.
// ============================================================================

import {
  eldIndexedDbService,
  EldHosLogRecord,
  EldDutyStatusEvent,
  DutyStatusType,
} from './eldIndexedDbService';
import { syncEldHosLogToFirestore } from '../firebase';
import { offlineSyncService } from './offlineSyncService';
import { triggerServiceWorkerSync } from '../serviceWorkerRegistration';

export interface EldSyncState {
  isOffline: boolean;
  isSimulatedDeadZone: boolean;
  isSyncing: boolean;
  pendingCount: number;
  syncedCount: number;
  totalLocalCount: number;
  lastSyncTimestamp: number | null;
  lastSyncDurationMs: number | null;
  lastSyncMessage: string | null;
}

type EldSyncListener = (state: EldSyncState, logs: EldHosLogRecord[]) => void;

class EldFirestoreSyncService {
  private isSyncing = false;
  private lastSyncTimestamp: number | null = null;
  private lastSyncDurationMs: number | null = null;
  private lastSyncMessage: string | null = null;
  private listeners = new Set<EldSyncListener>();
  private syncChannel: BroadcastChannel | null = null;
  private periodicTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.initNetworkListeners();
    this.initBroadcastChannel();
    this.startPeriodicSync();
  }

  private initNetworkListeners() {
    if (typeof window === 'undefined') return;

    // When cellular connectivity returns, automatically push all pending logs
    window.addEventListener('online', () => {
      console.log('Cellular connection restored: Initiating automatic ELD HOS push to Firestore...');
      this.syncPendingLogsToFirestore();
    });

    // Listen to offlineSyncService dead zone toggles
    offlineSyncService.subscribe((status) => {
      if (!status.isOffline && !this.isSyncing) {
        this.syncPendingLogsToFirestore();
      } else {
        this.notify();
      }
    });
  }

  private initBroadcastChannel() {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;

    try {
      this.syncChannel = new BroadcastChannel('truckwithease_eld_sync');
      this.syncChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'AUTO_SYNC_REQUESTED') {
          this.syncPendingLogsToFirestore();
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel error in EldFirestoreSyncService:', e);
    }
  }

  private startPeriodicSync() {
    if (this.periodicTimer) clearInterval(this.periodicTimer);
    // Periodic sweep every 25 seconds if online
    this.periodicTimer = setInterval(() => {
      if (this.isOnline()) {
        this.syncPendingLogsToFirestore({ background: true });
      }
    }, 25000);
  }

  public isOnline(): boolean {
    if (typeof navigator === 'undefined') return true;
    const isDeadZone = offlineSyncService.isEffectivelyOffline();
    return navigator.onLine && !isDeadZone;
  }

  public async getState(): Promise<EldSyncState> {
    const stats = await eldIndexedDbService.getEldLocalStats();
    return {
      isOffline: !this.isOnline(),
      isSimulatedDeadZone: offlineSyncService.getStatus().isSimulatedDeadZone,
      isSyncing: this.isSyncing,
      pendingCount: stats.pendingSync,
      syncedCount: stats.synced,
      totalLocalCount: stats.totalLogs,
      lastSyncTimestamp: this.lastSyncTimestamp || (stats.lastSyncedAt ? new Date(stats.lastSyncedAt).getTime() : null),
      lastSyncDurationMs: this.lastSyncDurationMs,
      lastSyncMessage: this.lastSyncMessage,
    };
  }

  /**
   * Main synchronization routine:
   * Flushes all pending IndexedDB logs directly to Cloud Firestore.
   */
  public async syncPendingLogsToFirestore(options: { background?: boolean } = {}): Promise<{
    syncedCount: number;
    failedCount: number;
    durationMs: number;
  }> {
    if (this.isSyncing) {
      return { syncedCount: 0, failedCount: 0, durationMs: 0 };
    }

    if (!this.isOnline()) {
      if (!options.background) {
        this.lastSyncMessage = 'Offline / Cellular Dead Zone active. Logs preserved safely in IndexedDB.';
        this.notify();
      }
      return { syncedCount: 0, failedCount: 0, durationMs: 0 };
    }

    const pendingLogs = await eldIndexedDbService.getPendingSyncLogs();
    if (pendingLogs.length === 0) {
      if (!options.background) {
        this.lastSyncMessage = 'All ELD logs are currently synchronized with Cloud Firestore.';
        this.notify();
      }
      return { syncedCount: 0, failedCount: 0, durationMs: 0 };
    }

    this.isSyncing = true;
    this.notify();
    const startTime = performance.now();
    let syncedCount = 0;
    let failedCount = 0;

    for (const log of pendingLogs) {
      try {
        await syncEldHosLogToFirestore({
          logId: log.logId,
          driverId: log.driverId,
          date: log.date,
          drivingMinutes: log.drivingMinutes,
          onDutyMinutes: log.onDutyMinutes,
          sleeperMinutes: log.sleeperMinutes,
          offDutyMinutes: log.offDutyMinutes,
          violationsCount: log.violationsCount,
          certified: log.certified,
          signature: log.signature,
          splitBerthExclusion: log.splitBerthExclusion,
        });

        await eldIndexedDbService.markEldLogSynced(log.id, log.logId);
        syncedCount++;
      } catch (err) {
        console.warn(`Failed to push ELD log ${log.id} to Firestore (kept safely in IndexedDB):`, err);
        failedCount++;
      }
    }

    const durationMs = Math.round(performance.now() - startTime);
    this.lastSyncTimestamp = Date.now();
    this.lastSyncDurationMs = durationMs;
    this.isSyncing = false;

    this.lastSyncMessage =
      syncedCount > 0
        ? `Successfully pushed ${syncedCount} ELD log${syncedCount > 1 ? 's' : ''} to Firestore (${durationMs}ms)`
        : failedCount > 0
        ? `Sync failed for ${failedCount} logs. Data safely retained in local IndexedDB.`
        : 'All logs synchronized.';

    // Trigger service worker background sync registration for persistence
    triggerServiceWorkerSync();

    this.notify();
    return { syncedCount, failedCount, durationMs };
  }

  /**
   * Records a duty status event local-first in IndexedDB, then triggers immediate auto-push if online.
   */
  public async recordDutyStatusWithAutoPush(
    driverId: string,
    newStatus: DutyStatusType,
    notes: string = '',
    customLocation?: string,
    odometerMiles?: number,
    engineHours?: number
  ): Promise<{ updatedLog: EldHosLogRecord; newEvent: EldDutyStatusEvent; pushedToFirestore: boolean }> {
    // 1. Write to local IndexedDB first (0 latency guarantee)
    const { updatedLog, newEvent } = await eldIndexedDbService.recordDutyStatusTransition(
      driverId,
      newStatus,
      notes,
      customLocation,
      odometerMiles,
      engineHours
    );

    // 2. Also register offline telemetry event in offlineSyncService
    offlineSyncService.enqueueEvent({
      eventType: 'ELD_INTERMEDIATE_LOG',
      title: `Duty Transition: ${newStatus.replace(/_/g, ' ')}`,
      location: newEvent.location,
      payloadSummary: `Status: ${newStatus} | Odo: ${newEvent.odometerMiles.toLocaleString()} mi | Eng Hrs: ${newEvent.engineHours.toFixed(1)}h`,
      priority: 'CRITICAL_DOT',
      sizeBytes: 320,
    });

    let pushedToFirestore = false;

    // 3. If online, immediately push to Firestore in background
    if (this.isOnline()) {
      try {
        await syncEldHosLogToFirestore({
          logId: updatedLog.logId,
          driverId: updatedLog.driverId,
          date: updatedLog.date,
          drivingMinutes: updatedLog.drivingMinutes,
          onDutyMinutes: updatedLog.onDutyMinutes,
          sleeperMinutes: updatedLog.sleeperMinutes,
          offDutyMinutes: updatedLog.offDutyMinutes,
          violationsCount: updatedLog.violationsCount,
          certified: updatedLog.certified,
          signature: updatedLog.signature,
          splitBerthExclusion: updatedLog.splitBerthExclusion,
        });
        await eldIndexedDbService.markEldLogSynced(updatedLog.id, updatedLog.logId);
        pushedToFirestore = true;
      } catch {
        // Kept as PENDING_SYNC in IndexedDB
      }
    }

    this.notify();
    return { updatedLog, newEvent, pushedToFirestore };
  }

  /**
   * Certifies and signs the current day's ELD log locally and pushes to Firestore.
   */
  public async certifyAndSignLog(
    logId: string,
    signatureText: string
  ): Promise<{ success: boolean; pushedToFirestore: boolean }> {
    const log = await eldIndexedDbService.getEldLogLocal(logId);
    if (!log) return { success: false, pushedToFirestore: false };

    log.certified = true;
    log.signature = signatureText;
    log.syncStatus = 'PENDING_SYNC';
    await eldIndexedDbService.saveEldLogLocal(log);

    let pushedToFirestore = false;
    if (this.isOnline()) {
      try {
        await syncEldHosLogToFirestore({
          logId: log.logId,
          driverId: log.driverId,
          date: log.date,
          drivingMinutes: log.drivingMinutes,
          onDutyMinutes: log.onDutyMinutes,
          sleeperMinutes: log.sleeperMinutes,
          offDutyMinutes: log.offDutyMinutes,
          violationsCount: log.violationsCount,
          certified: true,
          signature: signatureText,
          splitBerthExclusion: log.splitBerthExclusion,
        });
        await eldIndexedDbService.markEldLogSynced(log.id, log.logId);
        pushedToFirestore = true;
      } catch {}
    }

    this.notify();
    return { success: true, pushedToFirestore };
  }

  /**
   * Subscribes to live sync state and local logs updates.
   */
  public subscribe(listener: EldSyncListener): () => void {
    this.listeners.add(listener);
    // Trigger immediate update
    this.getState().then((state) => {
      eldIndexedDbService.getAllLocalEldLogs().then((logs) => {
        listener(state, logs);
      });
    });

    return () => {
      this.listeners.delete(listener);
    };
  }

  private async notify() {
    const state = await this.getState();
    const logs = await eldIndexedDbService.getAllLocalEldLogs();
    this.listeners.forEach((l) => {
      try {
        l(state, logs);
      } catch (err) {
        console.warn('Listener error in eldFirestoreSyncService:', err);
      }
    });
  }
}

export const eldFirestoreSyncService = new EldFirestoreSyncService();
