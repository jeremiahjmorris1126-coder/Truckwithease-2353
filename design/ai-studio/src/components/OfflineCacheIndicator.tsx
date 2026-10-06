import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  CloudOff,
  Cloud,
  Database,
  RefreshCw,
  Radio,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
  Zap,
  Activity,
  PlusCircle,
} from 'lucide-react';
import {
  offlineSyncService,
  OfflineSyncStatus,
  QueuedOfflineEvent,
} from '../services/offlineSyncService';

interface OfflineCacheIndicatorProps {
  onShowToast?: (message: string) => void;
  compact?: boolean;
}

export const OfflineCacheIndicator: React.FC<OfflineCacheIndicatorProps> = ({
  onShowToast,
  compact = false,
}) => {
  const [status, setStatus] = useState<OfflineSyncStatus>(offlineSyncService.getStatus());
  const [queue, setQueue] = useState<QueuedOfflineEvent[]>(offlineSyncService.getQueuedEvents());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineSyncService.subscribe((newStatus, newQueue) => {
      setStatus(newStatus);
      setQueue(newQueue);
    });
    return unsubscribe;
  }, []);

  const handleToggleDeadZone = (enable: boolean) => {
    offlineSyncService.setSimulatedDeadZone(enable);
    if (onShowToast) {
      onShowToast(
        enable
          ? 'CELLULAR DEAD ZONE SIMULATED: Telematics buffering to local offline cache'
          : 'CELLULAR SIGNAL RESTORED: Cloud gateway active'
      );
    }
  };

  const handleManualSync = async () => {
    if (queue.length === 0) {
      if (onShowToast) onShowToast('CACHE ALREADY SYNCHRONIZED: 0 events pending');
      return;
    }
    setIsSyncing(true);
    const result = await offlineSyncService.syncQueuedEvents();
    setIsSyncing(false);
    if (onShowToast) {
      onShowToast(
        `OFFLINE CACHE SYNCED: ${result.count} telematics events flushed to cloud (${result.durationMs}ms)`
      );
    }
  };

  const handleEnqueueTestPulse = () => {
    const evt = offlineSyncService.enqueueRandomTelemetryPulse();
    if (onShowToast) {
      onShowToast(`QUEUED TO OFFLINE CACHE: ${evt.title} (${evt.formattedTime})`);
    }
  };

  const isDeadZone = status.isOffline;
  const queuedCount = status.queuedCount;

  return (
    <>
      {/* HEADER PILL INDICATOR */}
      <div className="relative inline-flex items-center">
        <button
          onClick={() => setIsModalOpen(true)}
          title={
            isDeadZone
              ? `Cellular Dead Zone: ${queuedCount} events queued in offline cache. Click to inspect & sync.`
              : `Cloud Synced: ${queuedCount} events pending. Click to inspect offline cache.`
          }
          className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold border transition-all select-none ${
            isDeadZone
              ? 'bg-amber-950/70 border-amber-500/70 text-amber-300 hover:border-amber-400 hover:bg-amber-900/80 shadow-[0_0_12px_rgba(245,158,11,0.2)] animate-pulse'
              : queuedCount > 0
              ? 'bg-[#161922] border-[#D4AF37]/50 text-[#D4AF37] hover:border-[#FFE08A]'
              : 'bg-[#0E131F] border-slate-700/80 text-slate-300 hover:border-[#D4AF37]/40 hover:text-white'
          }`}
        >
          {/* Status Icon */}
          {isDeadZone ? (
            <div className="relative flex items-center justify-center">
              <CloudOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            </div>
          ) : (
            <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          )}

          {/* Label Text */}
          <div className="flex items-center gap-1">
            <span className="text-[9px] uppercase tracking-wider font-semibold">
              {isDeadZone ? 'Offline Cache' : 'Cache'}
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                isDeadZone
                  ? 'bg-amber-500 text-black shadow-sm'
                  : queuedCount > 0
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {queuedCount} {compact ? 'Q' : 'queued'}
            </span>
          </div>

          {/* Subtle dropdown hint */}
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* DETAILED OFFLINE CACHE & DEAD ZONE INSPECTOR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn">
          <div
            className="bg-[#0C0E14] border-2 border-[#D4AF37] rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#111319] border-b border-slate-800 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-lg ${
                    isDeadZone ? 'bg-amber-950 border border-amber-500 text-amber-300' : 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                  }`}
                >
                  {isDeadZone ? <CloudOff className="w-5 h-5" /> : <Database className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wide flex items-center gap-2">
                    Offline Telematics Cache
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        isDeadZone ? 'bg-amber-500 text-black animate-pulse' : 'bg-emerald-500 text-black'
                      }`}
                    >
                      {isDeadZone ? 'CELLULAR DEAD ZONE' : '5G CLOUD CONNECTED'}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    FMCSA §395 Store-and-Forward Memory · Zero Data Loss Guarantee
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
              {/* Status Alert Banner */}
              <div
                className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                  isDeadZone
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                    : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                }`}
              >
                <Radio className={`w-4 h-4 mt-0.5 shrink-0 ${isDeadZone ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
                <div className="space-y-1">
                  <div className="font-bold text-[11px] text-white">
                    {isDeadZone
                      ? 'No Cellular Gateway Available (Buffering Locally)'
                      : 'Cellular Mesh Active — Real-time Sync'}
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    {isDeadZone
                      ? `Vehicle is navigating through a remote canyon or cellular dead zone. All CAN-bus ECM pulses, HOS events, and speed records are cryptographically timestamped and queued locally in IndexedDB storage.`
                      : `Telematics buffer is streaming directly to fleet headquarters via low-latency cellular mesh.`}
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-[#111319] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase block">QUEUED EVENTS</span>
                  <div className="text-xl font-bold text-[#D4AF37] my-0.5">{queuedCount}</div>
                  <span className="text-[9px] text-slate-400">{(status.totalBytesQueued / 1024).toFixed(2)} KB Buffer</span>
                </div>

                <div className="bg-[#111319] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase block">NETWORK STATE</span>
                  <div
                    className={`text-xs font-black my-1 uppercase truncate ${
                      isDeadZone ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {isDeadZone ? 'DEAD ZONE' : 'ONLINE (5G)'}
                  </div>
                  <span className="text-[9px] text-slate-400">Zero packet drop</span>
                </div>

                <div className="bg-[#111319] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase block">INTEGRITY HASH</span>
                  <div className="text-xs font-bold text-white my-1 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SHA-256</span>
                  </div>
                  <span className="text-[9px] text-emerald-400">FMCSA Verified</span>
                </div>
              </div>

              {/* Simulation & Test Controls */}
              <div className="bg-[#111319] p-3 rounded-lg border border-[#D4AF37]/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    CELLULAR DEAD ZONE SIMULATION
                  </span>
                  <span className="text-[9px] text-slate-400">Test store-and-forward</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleToggleDeadZone(!isDeadZone)}
                    className={`px-3 py-1.5 rounded font-bold text-[10px] uppercase transition-all flex items-center gap-1.5 ${
                      isDeadZone
                        ? 'bg-amber-500 text-black border border-amber-300 shadow'
                        : 'bg-black border border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>{isDeadZone ? 'DEAD ZONE ACTIVE (CLICK TO RESTORE)' : 'SIMULATE CELLULAR DEAD ZONE'}</span>
                  </button>

                  <button
                    onClick={handleEnqueueTestPulse}
                    className="px-2.5 py-1.5 rounded font-bold text-[10px] uppercase bg-black border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center gap-1"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>+ RECORD EVENT</span>
                  </button>
                </div>
              </div>

              {/* Queued Events List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
                  <span>Queued Records Ledger ({queue.length})</span>
                  <span>Awaiting Cloud Ingestion</span>
                </div>

                {queue.length === 0 ? (
                  <div className="p-6 text-center bg-[#111319] rounded-lg border border-slate-800 text-slate-400 space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <div className="font-bold text-white text-xs">Offline Cache is Empty</div>
                    <p className="text-[10px]">All telemetry logs have been synchronized with the cloud backend.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {queue.map((item, idx) => (
                      <div
                        key={item.id}
                        className="bg-[#111319] p-2.5 rounded-lg border border-slate-800/80 hover:border-slate-700 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-slate-400">#{idx + 1}</span>
                            <strong className="text-white text-[11px]">{item.title}</strong>
                          </div>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                              item.priority === 'CRITICAL_DOT'
                                ? 'bg-rose-950 text-rose-300 border border-rose-700'
                                : item.priority === 'HIGH'
                                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-300 bg-black/40 p-1.5 rounded font-mono break-all">
                          {item.payloadSummary}
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-slate-400">
                          <span>📍 {item.location}</span>
                          <span>🕒 {item.formattedTime} · {item.sizeBytes} B</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="bg-[#111319] border-t border-slate-800 p-3 flex items-center justify-between gap-2">
              <div className="text-[10px] text-slate-400 font-mono">
                Last Synced: <strong className="text-white">{new Date(status.lastSyncedTimestamp || Date.now()).toLocaleTimeString()}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => offlineSyncService.clearQueue()}
                  disabled={queue.length === 0}
                  className="px-2.5 py-1.5 rounded bg-black border border-slate-800 text-slate-400 hover:text-rose-400 text-[10px] font-bold uppercase disabled:opacity-40"
                >
                  Clear
                </button>

                <button
                  onClick={handleManualSync}
                  disabled={isSyncing || queue.length === 0}
                  className={`px-3.5 py-1.5 rounded bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-extrabold text-[10px] uppercase flex items-center gap-1.5 shadow transition-all ${
                    isSyncing ? 'opacity-70 animate-pulse' : 'hover:scale-[1.02]'
                  } disabled:opacity-50`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'SYNCING...' : `FORCE SYNC (${queue.length})`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
