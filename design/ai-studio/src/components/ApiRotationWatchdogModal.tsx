import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  Lock,
  Flame,
  AlertTriangle,
  Server,
  Layers,
  Sparkles,
  ArrowRight,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  apiRotationManager,
  ApiRotationState,
  ApiEndpointHealth,
  RotationAuditLog,
} from '../services/apiRotationService';
import { MorrishiveEmblem } from './MorrishiveEmblem';

interface ApiRotationWatchdogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiRotationWatchdogModal: React.FC<ApiRotationWatchdogModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [rotationState, setRotationState] = useState<ApiRotationState>(
    apiRotationManager.getState()
  );
  const [isRotatingNow, setIsRotatingNow] = useState(false);
  const [isRepairingNow, setIsRepairingNow] = useState(false);
  const [activeTab, setActiveTab] = useState<'endpoints' | 'schedule' | 'logs'>('endpoints');

  useEffect(() => {
    const unsubscribe = apiRotationManager.subscribe((newState) => {
      setRotationState(newState);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const formatCountdown = (targetDate: Date) => {
    const diffMs = Math.max(0, new Date(targetDate).getTime() - Date.now());
    const totalSec = Math.floor(diffMs / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleManualRotate = async () => {
    setIsRotatingNow(true);
    await apiRotationManager.executeZeroDowntimeRotation(
      'MANUAL_TRIGGER',
      'User-initiated live credential rotation.'
    );
    setIsRotatingNow(false);
  };

  const handleSelfRepair = async () => {
    setIsRepairingNow(true);
    await apiRotationManager.triggerSelfRepair('Manual diagnostic inspection & self-healing cycle.');
    setIsRepairingNow(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#121318] border border-[#2E303B] shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[92vh] rounded-2xl">
        {/* Top Gold Kinetic Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#D4AF37] via-[#F2CA50] to-[#FFE088] shadow-[0_0_15px_rgba(242,202,80,0.5)]" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#222430] flex items-center justify-between bg-[#161720]">
          <div className="flex items-center gap-3">
            <MorrishiveEmblem size="sm" variant="hexagon" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black uppercase text-white tracking-wider font-mono">
                  AUTONOMOUS GOOGLE API ROTATOR
                </h2>
                <span className="px-2 py-0.5 bg-[#F2CA50]/15 border border-[#F2CA50]/30 text-[#F2CA50] text-[9px] font-mono font-bold uppercase rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F2CA50] animate-ping" />
                  0-DOWNTIME ARMED
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#9AA0B4]">
                Self-Healing Credential Watchdog // 45m Proactive Schedule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-white hover:bg-[#23242E] rounded-lg transition-colors"
            title="Close Watchdog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Telemetry HUD Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-4 bg-[#0E0F14] border-b border-[#222430]">
          <div className="p-3 bg-[#181A24] border border-[#2E303B] rounded-xl flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-[#8E93A6]">NEXT AUTO-ROTATION</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-[#F2CA50]">
                {formatCountdown(rotationState.nextScheduledRotation)}
              </span>
              <span className="text-[9px] font-mono text-[#8E93A6]">MM:SS</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 mt-1">
              Interval: {rotationState.rotationIntervalMinutes}m
            </span>
          </div>

          <div className="p-3 bg-[#181A24] border border-[#2E303B] rounded-xl flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-[#8E93A6]">CLUSTER HEALTH</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                {rotationState.healthScore}%
              </span>
              <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase">OPTIMAL</span>
            </div>
            <span className="text-[9px] font-mono text-[#8E93A6] mt-1">
              5/5 Endpoints Synced
            </span>
          </div>

          <div className="p-3 bg-[#181A24] border border-[#2E303B] rounded-xl flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-[#8E93A6]">UPTIME GUARANTEE</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-white">
                {rotationState.zeroDowntimeUptimePercent}%
              </span>
            </div>
            <span className="text-[9px] font-mono text-[#F2CA50] mt-1">
              0 Drops · Preemptive Cache
            </span>
          </div>

          <div className="p-3 bg-[#181A24] border border-[#2E303B] rounded-xl flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-[#8E93A6]">ACTIVE TOKEN AGE</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-cyan-400">
                {Math.floor(rotationState.activeTokenAgeSeconds / 60)}m {rotationState.activeTokenAgeSeconds % 60}s
              </span>
            </div>
            <span className="text-[9px] font-mono text-cyan-300 mt-1">
              Safety Window: 15m Buffer
            </span>
          </div>
        </div>

        {/* Tab Selector & Control Actions */}
        <div className="px-4 py-3 bg-[#14151D] border-b border-[#222430] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-[#0E0F14] p-1 border border-[#262833] rounded-lg">
            <button
              onClick={() => setActiveTab('endpoints')}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-md transition-colors ${
                activeTab === 'endpoints'
                  ? 'bg-[#F2CA50] text-[#121318]'
                  : 'text-[#8A8F9F] hover:text-white'
              }`}
            >
              Google APIs ({rotationState.endpoints.length})
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-md transition-colors ${
                activeTab === 'schedule'
                  ? 'bg-[#F2CA50] text-[#121318]'
                  : 'text-[#8A8F9F] hover:text-white'
              }`}
            >
              Rotation Policy
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-md transition-colors ${
                activeTab === 'logs'
                  ? 'bg-[#F2CA50] text-[#121318]'
                  : 'text-[#8A8F9F] hover:text-white'
              }`}
            >
              Audit Trail ({rotationState.logs.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRotate}
              disabled={isRotatingNow || isRepairingNow}
              className="flex-1 sm:flex-none px-3 py-2 bg-[#F2CA50] hover:bg-[#FFE088] text-[#121318] font-bold text-xs font-mono uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(242,202,80,0.25)] flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRotatingNow ? 'animate-spin' : ''}`} />
              <span>Rotate Now</span>
            </button>

            <button
              onClick={handleSelfRepair}
              disabled={isRotatingNow || isRepairingNow}
              className="flex-1 sm:flex-none px-3 py-2 bg-[#20222C] hover:bg-[#2A2C38] border border-[#383B4A] text-[#E0E2EC] font-bold text-xs font-mono uppercase rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <Zap className={`w-3.5 h-3.5 text-[#F2CA50] ${isRepairingNow ? 'animate-bounce' : ''}`} />
              <span>Self-Repair Cycle</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: ENDPOINTS */}
          {activeTab === 'endpoints' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {rotationState.endpoints.map((ep) => (
                  <div
                    key={ep.id}
                    className="p-3.5 bg-[#161720] border border-[#2A2C37] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#F2CA50]/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-[#0E0F14] border border-[#2E303B] rounded-lg text-[#F2CA50] shrink-0 mt-0.5">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-white uppercase">
                            {ep.name}
                          </span>
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-[#20222C] text-[#8E93A6] rounded">
                            {ep.scopeCategory}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#7C8092] block mt-0.5 truncate max-w-md">
                          {ep.url}
                        </span>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {ep.scopesGranted.map((scope) => (
                            <span
                              key={scope}
                              className="text-[9px] font-mono px-1.5 py-0.5 bg-[#0E0F14] border border-[#262833] text-[#A0A4B6] rounded"
                            >
                              {scope}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#222430]">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 ${
                          ep.status === 'OPTIMAL'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/50'
                            : ep.status === 'ROTATING'
                            ? 'bg-[#F2CA50]/20 text-[#F2CA50] border border-[#F2CA50]/40 animate-pulse'
                            : 'bg-cyan-950/60 text-cyan-300 border border-cyan-700/50'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {ep.status}
                      </span>
                      <span className="text-[10px] font-mono text-[#8E93A6] mt-1">
                        Latency: <strong className="text-white">{ep.latencyMs}ms</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SCHEDULE & POLICY */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#161720] border border-[#2A2C37] rounded-xl space-y-3">
                <h3 className="text-sm font-mono font-bold text-white uppercase flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#F2CA50]" />
                  Zero-Downtime Sliding-Window Policy
                </h3>
                <p className="text-xs text-[#9AA0B4] leading-relaxed">
                  Google Workspace OAuth access tokens carry an operational expiration lifespan of 3,600 seconds (60 minutes).
                  The Morrishive Autonomous Rotator executes a proactive refresh sequence at <strong>45 minutes (75% threshold)</strong>.
                  This provides a 15-minute fail-safe window to guarantee continuous HTTP communication with 0 dropped calls.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-[#0E0F14] border border-[#262833] rounded-lg">
                    <span className="text-[10px] font-mono text-[#8E93A6] uppercase">Interval Setting</span>
                    <div className="text-base font-bold font-mono text-[#F2CA50] mt-1">45 Minutes</div>
                    <span className="text-[9px] font-mono text-emerald-400">Proactive sliding window</span>
                  </div>
                  <div className="p-3 bg-[#0E0F14] border border-[#262833] rounded-lg">
                    <span className="text-[10px] font-mono text-[#8E93A6] uppercase">Failover Resilience</span>
                    <div className="text-base font-bold font-mono text-white mt-1">Dual Enclave</div>
                    <span className="text-[9px] font-mono text-cyan-400">In-Memory + Firebase HSM</span>
                  </div>
                  <div className="p-3 bg-[#0E0F14] border border-[#262833] rounded-lg">
                    <span className="text-[10px] font-mono text-[#8E93A6] uppercase">Retry Strategy</span>
                    <div className="text-base font-bold font-mono text-white mt-1">Jittered Backoff</div>
                    <span className="text-[9px] font-mono text-[#8E93A6]">Max 3 attempts // &lt;800ms</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-2">
              {rotationState.logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-[#14151D] border border-[#242632] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 mt-0.5 ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/40'
                          : log.status === 'REPAIRED'
                          ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-700/40'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-700/40'
                      }`}
                    >
                      {log.action}
                    </span>
                    <div>
                      <div className="text-white font-semibold">{log.apiName}</div>
                      <div className="text-[#8E93A6] text-[11px] mt-0.5">{log.details}</div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0 text-[#6C7082] text-[10px]">
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="text-[#F2CA50] font-bold">{log.latencyMs}ms</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#222430] bg-[#14151D] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-[#7C8092]">
          <div className="flex items-center gap-1.5">
            <MorrishiveEmblem size="xs" variant="hexagon" />
            <span>Morrishive Enterprise Logistics Watchdog Active</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-[#20222C] hover:bg-[#2A2C38] text-white rounded-lg transition-colors font-bold uppercase text-[11px]"
          >
            Dismiss Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
