import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Zap,
  Activity,
  Radio,
  RefreshCw,
  Sliders,
  Bell,
  CheckCircle2,
  XCircle,
  Truck,
  Cpu,
  Flame,
  ArrowRight,
  Sparkles,
  Layers,
  Send,
  Download,
  Power,
  Wifi,
  WifiOff,
  Maximize2,
} from 'lucide-react';
import { EldComplianceAlert, EldHardwareMalfunctionIndicator } from '../types';
import {
  eldComplianceAlertService,
  INITIAL_ELD_COMPLIANCE_ALERTS,
} from '../services/eldComplianceAlertService';
import { triggerHapticFeedback } from '../services/haptics';

interface EldComplianceAlertSectionProps {
  onNavigateToTab?: (tab: string) => void;
  onAddNotification?: (notif: any) => void;
}

export const EldComplianceAlertSection: React.FC<EldComplianceAlertSectionProps> = ({
  onNavigateToTab,
  onAddNotification,
}) => {
  const [alerts, setAlerts] = useState<EldComplianceAlert[]>(INITIAL_ELD_COMPLIANCE_ALERTS);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('eld-alert-tr904');
  const [isFirestoreLive, setIsFirestoreLive] = useState<boolean>(true);
  const [firestoreLatency, setFirestoreLatency] = useState<number>(42);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(new Date().toLocaleTimeString());
  const [isActionPending, setIsActionPending] = useState<boolean>(false);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Live countdown timer ticking simulation (seconds decrement)
  const [currentSeconds, setCurrentSeconds] = useState<number>(59);

  // Subscribe to real-time Firestore listener
  useEffect(() => {
    const unsubscribe = eldComplianceAlertService.subscribeToEldAlerts(
      (updatedAlerts) => {
        setAlerts(updatedAlerts);
        setLastSyncedAt(new Date().toLocaleTimeString());
      },
      (isLive, latency) => {
        setIsFirestoreLive(isLive);
        if (latency > 0) setFirestoreLatency(latency);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // 1-second interval for clock tick animation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSeconds((prev) => (prev > 0 ? prev - 1 : 59));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeAlert = alerts.find((a) => a.id === selectedUnitId) || alerts[0] || INITIAL_ELD_COMPLIANCE_ALERTS[0];

  // Helper to format minutes into HH:MM:SS
  const formatTimeRemaining = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const secs = currentSeconds;
    return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  };

  // Helper for progress percentage (11h = 660 mins, 14h = 840 mins, 8h = 480 mins, 70h = 4200 mins)
  const getProgressPct = (remaining: number, max: number) => {
    return Math.min(100, Math.max(0, Math.round((remaining / max) * 100)));
  };

  // Simulate Near-Violation
  const handleSimulateNearViolation = async () => {
    setIsActionPending(true);
    triggerHapticFeedback('double');
    try {
      const res = await eldComplianceAlertService.simulateNearViolation(activeAlert.id);
      if (res) {
        setActionToast(
          `HOS WARNING TRIGGERED: ${activeAlert.unitNumber} (${activeAlert.driverName}) driving countdown forced to 18m remaining. Real-time Firestore sync broadcasted to fleet!`
        );
        if (onAddNotification) {
          onAddNotification({
            id: `notif-hos-${Date.now()}`,
            title: `HOS Warning: Unit ${activeAlert.unitNumber}`,
            description: `18 minutes remaining before 11-hour driving limit violation. Safe parking required.`,
            time: new Date().toLocaleTimeString(),
            severity: 'critical',
            read: false,
          });
        }
      }
    } finally {
      setIsActionPending(false);
      setTimeout(() => setActionToast(null), 6000);
    }
  };

  // Toggle Hardware Connection
  const handleToggleHardware = async () => {
    setIsActionPending(true);
    triggerHapticFeedback('alert');
    try {
      const res = await eldComplianceAlertService.toggleHardwareConnection(activeAlert.id);
      if (res) {
        const stateText = res.hardwareConnected ? 'RECONNECTED (J1939 CAN-Bus 50Hz)' : 'DISCONNECTED (Diagnostic Link Dropped)';
        setActionToast(`HARDWARE STATUS CHANGED: ${activeAlert.unitNumber} J1939 ECM Diagnostic link ${stateText}`);
        if (!res.hardwareConnected && onAddNotification) {
          onAddNotification({
            id: `notif-hw-${Date.now()}`,
            title: `ELD Hardware Warning: Unit ${activeAlert.unitNumber}`,
            description: `J1939 9-Pin ECM Diagnostic link dropped. Unidentified driving records accumulating.`,
            time: new Date().toLocaleTimeString(),
            severity: 'warning',
            read: false,
          });
        }
      }
    } finally {
      setIsActionPending(false);
      setTimeout(() => setActionToast(null), 6000);
    }
  };

  // Reset Clocks
  const handleResetClocks = async () => {
    setIsActionPending(true);
    triggerHapticFeedback('success');
    try {
      await eldComplianceAlertService.resetClocks(activeAlert.id);
      setActionToast(`10-HOUR OFF-DUTY RESET: ${activeAlert.unitNumber} (${activeAlert.driverName}) driving and shift clocks reset to full 11h/14h limits.`);
    } finally {
      setIsActionPending(false);
      setTimeout(() => setActionToast(null), 6000);
    }
  };

  return (
    <div className="bg-[#0B0F19] border-2 border-[#D4AF37]/60 rounded-2xl p-4 sm:p-6 font-mono text-white shadow-[0_0_35px_rgba(212,175,55,0.15)] space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-[#D4AF37] text-black flex items-center gap-1.5 shadow-[0_0_12px_rgba(212,175,55,0.35)]">
              <ShieldAlert className="w-3.5 h-3.5 text-black" />
              ELD COMPLIANCE &amp; HARDWARE LINK WATCHDOG
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE FIRESTORE STREAM ACTIVE</span>
            </span>
            <span className="text-[10px] text-[#7E90A6]">
              Latency: {firestoreLatency}ms · Last Sync: {lastSyncedAt}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight font-[Oswald] flex items-center gap-2">
            <span>49 CFR § 395 Real-Time HOS Violation Countdowns &amp; J1939 Diagnostics</span>
          </h3>
        </div>

        {/* Unit Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto shrink-0">
          {alerts.map((alert) => {
            const hasCritical = alert.isApproachingDrivingLimit || alert.drivingMinutesRemaining < 30 || !alert.hardwareConnected;
            return (
              <button
                key={alert.id}
                type="button"
                onClick={() => {
                  triggerHapticFeedback('subtle');
                  setSelectedUnitId(alert.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  selectedUnitId === alert.id
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                    : 'bg-[#121927] hover:bg-[#1A2538] text-[#CBD5E1] border-[#223048]'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{alert.unitNumber}</span>
                {hasCritical && (
                  <span className={`w-2 h-2 rounded-full ${selectedUnitId === alert.id ? 'bg-red-900' : 'bg-red-500 animate-ping'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Toast */}
      {actionToast && (
        <div className="p-3.5 bg-gradient-to-r from-amber-950/90 to-[#1F170E] border border-amber-500/80 text-amber-200 text-xs rounded-xl flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
            <span className="font-bold">// ELD TELEMETRY DISPATCH:</span>
            <span>{actionToast}</span>
          </div>
          <button type="button" onClick={() => setActionToast(null)} className="text-amber-400 hover:text-white font-bold ml-3">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: HOS Clocks (Left 2 cols) & Hardware Diagnostics (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* HOS Countdowns Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#8EA2B8] border-b border-[#1E293B] pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-bold text-white uppercase">
                Active Operator: <span className="text-[#D4AF37]">{activeAlert.driverName}</span> (Unit {activeAlert.unitNumber})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#7E90A6]">Duty Status:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                activeAlert.dutyStatus === 'DRIVING'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                  : 'bg-blue-950 text-blue-300 border border-blue-600'
              }`}>
                {activeAlert.dutyStatus}
              </span>
            </div>
          </div>

          {/* 4 Core HOS Clocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Clock 1: 11-Hour Driving Limit */}
            <div className={`p-4 rounded-xl border transition-all ${
              activeAlert.drivingMinutesRemaining < 30
                ? 'bg-gradient-to-br from-red-950/80 to-[#1A0B0F] border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
                : activeAlert.drivingMinutesRemaining < 120
                ? 'bg-gradient-to-br from-amber-950/60 to-[#18120B] border-amber-500/60'
                : 'bg-[#101724] border-[#1E2E44]'
            }`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-[#CBD5E1] flex items-center gap-1.5">
                  <Flame className={`w-3.5 h-3.5 ${activeAlert.drivingMinutesRemaining < 30 ? 'text-red-400 animate-bounce' : 'text-[#D4AF37]'}`} />
                  11-Hour Driving Limit
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  activeAlert.drivingMinutesRemaining < 30
                    ? 'bg-red-900 text-red-100 animate-pulse'
                    : 'bg-[#182335] text-[#8EA2B8]'
                }`}>
                  49 CFR § 395.3(a)(1)
                </span>
              </div>
              <div className={`text-2xl font-black tracking-tight ${
                activeAlert.drivingMinutesRemaining < 30 ? 'text-red-400' : 'text-white'
              }`}>
                {formatTimeRemaining(activeAlert.drivingMinutesRemaining)}
              </div>
              <div className="w-full bg-[#1A2536] h-2 rounded-full overflow-hidden mt-2.5">
                <div
                  className={`h-full transition-all duration-500 ${
                    activeAlert.drivingMinutesRemaining < 30
                      ? 'bg-red-500'
                      : activeAlert.drivingMinutesRemaining < 120
                      ? 'bg-amber-400'
                      : 'bg-[#D4AF37]'
                  }`}
                  style={{ width: `${getProgressPct(activeAlert.drivingMinutesRemaining, 660)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#7E90A6] mt-1">
                <span>{getProgressPct(activeAlert.drivingMinutesRemaining, 660)}% Remaining</span>
                <span>Max: 11h 00m</span>
              </div>
            </div>

            {/* Clock 2: 14-Hour Shift Duty Window */}
            <div className={`p-4 rounded-xl border transition-all ${
              activeAlert.shiftMinutesRemaining < 60
                ? 'bg-gradient-to-br from-red-950/80 to-[#1A0B0F] border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
                : 'bg-[#101724] border-[#1E2E44]'
            }`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-[#CBD5E1] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  14-Hour Shift Window
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#182335] text-[#8EA2B8]">
                  49 CFR § 395.3(a)(2)
                </span>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                {formatTimeRemaining(activeAlert.shiftMinutesRemaining)}
              </div>
              <div className="w-full bg-[#1A2536] h-2 rounded-full overflow-hidden mt-2.5">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${getProgressPct(activeAlert.shiftMinutesRemaining, 840)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#7E90A6] mt-1">
                <span>{getProgressPct(activeAlert.shiftMinutesRemaining, 840)}% Window Open</span>
                <span>Max: 14h 00m</span>
              </div>
            </div>

            {/* Clock 3: 8-Hour Mandatory Rest Break */}
            <div className={`p-4 rounded-xl border transition-all ${
              activeAlert.restBreakMinutesRemaining < 60
                ? 'bg-gradient-to-br from-amber-950/70 to-[#1A140B] border-amber-500/70'
                : 'bg-[#101724] border-[#1E2E44]'
            }`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-[#CBD5E1] flex items-center gap-1.5">
                  <AlertTriangle className={`w-3.5 h-3.5 ${activeAlert.restBreakMinutesRemaining < 60 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
                  8-Hour Rest Break Mandate
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#182335] text-[#8EA2B8]">
                  30-Min Stop
                </span>
              </div>
              <div className="text-2xl font-black text-amber-300 tracking-tight">
                {formatTimeRemaining(activeAlert.restBreakMinutesRemaining)}
              </div>
              <div className="w-full bg-[#1A2536] h-2 rounded-full overflow-hidden mt-2.5">
                <div
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${getProgressPct(activeAlert.restBreakMinutesRemaining, 480)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#7E90A6] mt-1">
                <span>{getProgressPct(activeAlert.restBreakMinutesRemaining, 480)}% Until 30m Rest</span>
                <span>Max: 8h 00m</span>
              </div>
            </div>

            {/* Clock 4: 70-Hour / 8-Day Cycle */}
            <div className="p-4 bg-[#101724] border border-[#1E2E44] rounded-xl">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-[#CBD5E1] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  70-Hour / 8-Day Rolling Cycle
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#182335] text-[#8EA2B8]">
                  Cycle Clock
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-300 tracking-tight">
                {Math.floor(activeAlert.cycleMinutesRemaining / 60)}h {activeAlert.cycleMinutesRemaining % 60}m
              </div>
              <div className="w-full bg-[#1A2536] h-2 rounded-full overflow-hidden mt-2.5">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${getProgressPct(activeAlert.cycleMinutesRemaining, 4200)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#7E90A6] mt-1">
                <span>{getProgressPct(activeAlert.cycleMinutesRemaining, 4200)}% Remaining</span>
                <span>34-Hour Restart Eligible</span>
              </div>
            </div>
          </div>

          {/* Active Malfunction & Diagnostic Banner */}
          {activeAlert.malfunctionIndicators && activeAlert.malfunctionIndicators.filter((m) => !m.cleared).length > 0 && (
            <div className="p-3.5 bg-red-950/80 border border-red-500/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-red-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
                  <span>ACTIVE ELD TECHNICAL &amp; STATUTORY DIAGNOSTICS ({activeAlert.malfunctionIndicators.filter((m) => !m.cleared).length})</span>
                </span>
                <span className="text-[10px] uppercase text-red-400 bg-red-900/60 px-2 py-0.5 rounded">
                  FMCSA § 4.6 Notice
                </span>
              </div>
              {activeAlert.malfunctionIndicators
                .filter((m) => !m.cleared)
                .map((malf, idx) => (
                  <div key={idx} className="p-2 bg-[#1A0B10] rounded border border-red-800/60 flex items-start gap-2 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">{malf.code} · {malf.fmcsaStandardCode}</div>
                      <div className="text-red-200">{malf.description}</div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Hardware Connection & J1939 Diagnostics Column */}
        <div className="bg-[#101724] border border-[#1E2E44] rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E2E44] pb-2.5">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-bold text-white text-xs uppercase">J1939 ECM Diagnostic Link</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
              activeAlert.hardwareConnected
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'bg-red-950 text-red-300 border border-red-700 animate-pulse'
            }`}>
              {activeAlert.hardwareConnected ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>LINK LOCKED</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-red-400" />
                  <span>LINK LOST</span>
                </>
              )}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center p-2 bg-[#0C121D] rounded border border-[#182335]">
              <span className="text-[#8EA2B8]">Hardware Interface:</span>
              <span className="text-white font-bold">{activeAlert.hardwareProtocol}</span>
            </div>

            <div className="flex justify-between items-center p-2 bg-[#0C121D] rounded border border-[#182335]">
              <span className="text-[#8EA2B8]">CAN-Bus Stream Frequency:</span>
              <span className="text-cyan-400 font-bold">{activeAlert.dataStreamFrequencyHz} Hz (Live)</span>
            </div>

            <div className="flex justify-between items-center p-2 bg-[#0C121D] rounded border border-[#182335]">
              <span className="text-[#8EA2B8]">Signal Link Integrity:</span>
              <span className="text-emerald-400 font-bold">{activeAlert.signalQualityPct}% Signal</span>
            </div>

            <div className="flex justify-between items-center p-2 bg-[#0C121D] rounded border border-[#182335]">
              <span className="text-[#8EA2B8]">Engine Sync Status:</span>
              <span className={`font-bold ${activeAlert.engineSyncStatus === 'SYNCHRONIZED' ? 'text-emerald-400' : 'text-red-400'}`}>
                {activeAlert.engineSyncStatus}
              </span>
            </div>

            <div className="flex justify-between items-center p-2 bg-[#0C121D] rounded border border-[#182335]">
              <span className="text-[#8EA2B8]">UTC Timing Compliance:</span>
              <span className="text-emerald-400 font-bold">{activeAlert.timingComplianceStatus}</span>
            </div>

            <div className="flex justify-between items-center p-2 bg-[#0C121D] rounded border border-[#182335]">
              <span className="text-[#8EA2B8]">GNSS Positioning:</span>
              <span className="text-cyan-300 font-bold">{activeAlert.positioningStatus}</span>
            </div>
          </div>

          {/* Quick Simulation Actions */}
          <div className="pt-2 border-t border-[#1E2E44] space-y-2">
            <div className="text-[10px] text-[#8EA2B8] uppercase font-bold tracking-wider">
              Simulation &amp; Diagnostic Triggers
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isActionPending}
                onClick={handleSimulateNearViolation}
                className="p-2 rounded bg-[#1C1410] hover:bg-amber-950 border border-amber-600/50 text-amber-300 text-[10px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
              >
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Simulate &lt; 30m</span>
              </button>

              <button
                type="button"
                disabled={isActionPending}
                onClick={handleToggleHardware}
                className={`p-2 rounded border text-[10px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95 ${
                  activeAlert.hardwareConnected
                    ? 'bg-[#1A0D12] hover:bg-red-950 border-red-600/50 text-red-300'
                    : 'bg-[#0E1D16] hover:bg-[#FFE600] border-[#FFE600] text-black'
                }`}
              >
                <Power className="w-3 h-3" />
                <span>{activeAlert.hardwareConnected ? 'Drop J1939' : 'Reconnect'}</span>
              </button>
            </div>

            <button
              type="button"
              disabled={isActionPending}
              onClick={handleResetClocks}
              className="shadow-[0_0_15px_rgba(255,230,0,0.45)] w-full p-2 rounded bg-[#FFE600] hover:bg-[#FFD700] border border-[#FFE600] text-black text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <RefreshCw className="w-3 h-3 text-emerald-400" />
              <span>Full 10-Hour Off-Duty Reset (All Limits)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
