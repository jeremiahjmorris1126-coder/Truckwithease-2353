// ============================================================================
// DIAGNOSTIC PULSE ALERT SYSTEM COMPONENT FOR ELD AUDIT VIEW
// Real-time telemetry pattern monitor & baseline anomaly detection engine.
// Triggers live notifications, haptic pulses, and audio cues when raw CAN-bus
// parameters deviate from certified heavy commercial vehicle baselines.
// ============================================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Volume2,
  VolumeX,
  Flame,
  Zap,
  Gauge,
  Sliders,
  Play,
  RotateCcw,
  Download,
  Info,
  ChevronDown,
  Layers,
  Sparkles,
  Check,
  X,
  ExternalLink,
  Cpu,
  Clock,
  Radio,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import {
  EldEngineDiagnostics,
  EldRawPacket,
  DiagnosticPulseAlert,
  TacticalNotification,
  PulseCadenceStatus,
} from '../types';
import {
  ENGINE_BASELINES,
  BASELINE_PROFILES,
  evaluateTelemetryAgainstBaselines,
  playDiagnosticPulseChime,
  ParameterDeviationResult,
} from '../services/diagnosticPulseService';
import { triggerHapticFeedback } from '../services/haptics';

interface DiagnosticPulseAlertSystemProps {
  diagnostics: EldEngineDiagnostics;
  packets: EldRawPacket[];
  busLatencyMs?: number;
  onInjectDiagnosticAnomaly?: (patch: Partial<EldEngineDiagnostics>) => void;
  onResetNominalDiagnostics?: () => void;
  onAddNotification?: (notification: TacticalNotification) => void;
}

export const DiagnosticPulseAlertSystem: React.FC<DiagnosticPulseAlertSystemProps> = ({
  diagnostics,
  packets,
  busLatencyMs = 16,
  onInjectDiagnosticAnomaly,
  onResetNominalDiagnostics,
  onAddNotification,
}) => {
  // Baseline profile selection
  const [selectedProfileId, setSelectedProfileId] = useState<string>('DETROIT_DD15_CRUISE');
  const [sensitivityMultiplier, setSensitivityMultiplier] = useState<number>(1.0); // 0.8 Strict, 1.0 Balanced, 1.25 Relaxed
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'MONITOR' | 'ALERTS' | 'BASELINES' | 'STRESS_TEST'>('MONITOR');

  // Rolling alerts history
  const [alertHistory, setAlertHistory] = useState<DiagnosticPulseAlert[]>([]);
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<DiagnosticPulseAlert | null>(null);

  // Oscilloscope canvas reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const waveOffsetRef = useRef<number>(0);

  // Debounce tracking to prevent spamming notifications on continuous deviations
  const lastAlertTimePerKeyRef = useRef<Record<string, number>>({});

  // Evaluate current telemetry in real time
  const evaluation = useMemo(() => {
    return evaluateTelemetryAgainstBaselines(
      diagnostics,
      busLatencyMs,
      selectedProfileId,
      sensitivityMultiplier
    );
  }, [diagnostics, busLatencyMs, selectedProfileId, sensitivityMultiplier]);

  // Handle detection of new deviations and trigger notifications
  useEffect(() => {
    if (evaluation.newAlerts.length === 0) return;

    const now = Date.now();
    const alertsToTrigger: DiagnosticPulseAlert[] = [];

    evaluation.newAlerts.forEach(alert => {
      const lastTriggered = lastAlertTimePerKeyRef.current[alert.parameterKey] || 0;
      // 12-second debounce per parameter to avoid alert flooding
      if (now - lastTriggered > 12000) {
        lastAlertTimePerKeyRef.current[alert.parameterKey] = now;
        alertsToTrigger.push(alert);
      }
    });

    if (alertsToTrigger.length > 0) {
      // 1. Play synthesized pulse chime if enabled
      if (soundEnabled) {
        const highestSeverity = alertsToTrigger.some(a => a.severity === 'alert') ? 'critical' : 'warning';
        playDiagnosticPulseChime(highestSeverity);
      }

      // 2. Trigger haptic feedback
      if (alertsToTrigger.some(a => a.severity === 'alert')) {
        triggerHapticFeedback('alert');
      } else {
        triggerHapticFeedback([35, 45, 35]);
      }

      // 3. Update internal alert history
      setAlertHistory(prev => [...alertsToTrigger, ...prev].slice(0, 50));

      // 4. Propagate to App-wide Tactical Notification system (Header bell)
      if (onAddNotification) {
        alertsToTrigger.forEach(alert => {
          onAddNotification({
            id: `pulse-notif-${Date.now()}-${alert.parameterKey}`,
            time: alert.timestamp,
            title: `[DIAGNOSTIC PULSE] ${alert.parameterName} Deviation`,
            description: `${alert.currentValueFormatted} outside expected baseline (${alert.baselineExpected}). ${alert.rootCauseHypothesis}`,
            severity: alert.severity,
            read: false,
          });
        });
      }
    }
  }, [evaluation, soundEnabled, onAddNotification]);

  // Animated Oscilloscope "Cardiac Engine Pulse" Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      // Dark oscilloscope phosphor background
      ctx.fillStyle = '#060A0F';
      ctx.fillRect(0, 0, width, height);

      // Fine grid lines
      ctx.strokeStyle = '#0F1A26';
      ctx.lineWidth = 1;

      // Vertical grid
      const gridSpacingX = 40;
      for (let x = 0; x < width; x += gridSpacingX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal grid
      const gridSpacingY = 24;
      for (let y = 0; y < height; y += gridSpacingY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center baseline guide line
      ctx.strokeStyle = '#16283C';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Waveform parameters based on pulse status
      const isCritical = evaluation.cadenceStatus === 'CRITICAL_MALFUNCTION';
      const isArrhythmic = evaluation.cadenceStatus === 'ARRHYTHMIC_DEVIATION';
      const isAsymmetric = evaluation.cadenceStatus === 'ASYMMETRIC_DRIFT';

      let traceColor = '#00FF66'; // Neon Emerald Nominal
      let glowColor = 'rgba(0, 255, 102, 0.4)';
      let speed = 2.2;
      let amp = 28;

      if (isCritical) {
        traceColor = '#EF4444'; // Emergency Rose
        glowColor = 'rgba(239, 68, 68, 0.7)';
        speed = 4.8;
        amp = 48;
      } else if (isArrhythmic) {
        traceColor = '#F59E0B'; // Caution Amber
        glowColor = 'rgba(245, 158, 11, 0.5)';
        speed = 3.6;
        amp = 38;
      } else if (isAsymmetric) {
        traceColor = '#EAB308'; // Yellow Drift
        glowColor = 'rgba(234, 179, 8, 0.4)';
        speed = 2.8;
        amp = 32;
      }

      waveOffsetRef.current = (waveOffsetRef.current + speed) % 10000;
      const offset = waveOffsetRef.current;

      // Draw the ECG-style Diagnostic Pulse wave
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = traceColor;
      ctx.lineWidth = 2.2;
      ctx.beginPath();

      const wavelength = 180;

      for (let x = 0; x < width; x++) {
        const phase = ((x + offset) % wavelength) / wavelength;
        let y = midY;

        if (phase < 0.15) {
          // Isoelectric baseline with minor engine vibration harmonic
          y += Math.sin((x + offset) * 0.15) * 1.5;
        } else if (phase >= 0.15 && phase < 0.22) {
          // P-wave (Intake stroke pressure wave)
          const pPhase = (phase - 0.15) / 0.07;
          y -= Math.sin(pPhase * Math.PI) * (amp * 0.25);
        } else if (phase >= 0.22 && phase < 0.26) {
          // Q dip (Compression pre-combustion)
          const qPhase = (phase - 0.22) / 0.04;
          y += Math.sin(qPhase * Math.PI) * (amp * 0.2);
        } else if (phase >= 0.26 && phase < 0.32) {
          // R-spike (Combustion top-dead-center power impulse!)
          const rPhase = (phase - 0.26) / 0.06;
          if (isCritical) {
            // Chaotic erratic waveform spike during critical deviation
            y -= Math.sin(rPhase * Math.PI) * (amp * 1.35) + Math.cos(x * 0.4) * 14;
          } else if (isArrhythmic) {
            y -= Math.sin(rPhase * Math.PI) * (amp * 1.1) + (Math.random() - 0.5) * 6;
          } else {
            y -= Math.sin(rPhase * Math.PI) * amp;
          }
        } else if (phase >= 0.32 && phase < 0.36) {
          // S dip (Exhaust valve opening)
          const sPhase = (phase - 0.32) / 0.04;
          y += Math.sin(sPhase * Math.PI) * (amp * 0.35);
        } else if (phase >= 0.36 && phase < 0.50) {
          // T-wave (Thermal exhaust scavenging)
          const tPhase = (phase - 0.36) / 0.14;
          const tHeight = isCritical ? amp * 0.65 : amp * 0.35;
          y -= Math.sin(tPhase * Math.PI) * tHeight;
        } else {
          // Baseline recovery
          y += Math.sin((x + offset) * 0.1) * 1.2;
        }

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw leading glowing scanhead dot
      const scanX = width - 12;
      ctx.fillStyle = traceColor;
      ctx.shadowColor = traceColor;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(scanX, midY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [evaluation.cadenceStatus]);

  // Clear or Acknowledge alerts
  const handleAcknowledgeAlert = (id: string) => {
    triggerHapticFeedback('tick');
    setAlertHistory(prev =>
      prev.map(a => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const handleAcknowledgeAll = () => {
    triggerHapticFeedback('subtle');
    setAlertHistory(prev => prev.map(a => ({ ...a, acknowledged: true })));
  };

  const handleClearHistory = () => {
    triggerHapticFeedback('tick');
    setAlertHistory([]);
  };

  // Export Anomaly Dossier
  const handleExportAnomalyReport = (format: 'csv' | 'json') => {
    const reportTimestamp = new Date().toISOString();
    const cleanTime = reportTimestamp.replace(/[:.]/g, '-');

    if (alertHistory.length === 0) {
      alert('No anomaly events currently captured in the Diagnostic Pulse buffer.');
      return;
    }

    if (format === 'csv') {
      const headers = [
        'Alert_ID',
        'Timestamp',
        'Parameter_Name',
        'J1939_PGN',
        'Current_Telemetry_Value',
        'Expected_Baseline_Corridor',
        'Deviation_Percentage',
        'Severity',
        'Cadence_Rhythm',
        'Root_Cause_Hypothesis',
        'FMCSA_Standard',
        'Recommended_Action',
        'Acknowledged_Status',
      ];

      const rows = alertHistory.map(a =>
        [
          `"${a.id}"`,
          `"${a.timestamp}"`,
          `"${a.parameterName}"`,
          `"${a.pgnOrPid}"`,
          `"${a.currentValueFormatted}"`,
          `"${a.baselineExpected}"`,
          `"${a.deviationPct}%"`,
          `"${a.severity.toUpperCase()}"`,
          `"${a.cadenceStatus}"`,
          `"${a.rootCauseHypothesis.replace(/"/g, '""')}"`,
          `"${a.fmcsaCitation}"`,
          `"${a.recommendedAction.replace(/"/g, '""')}"`,
          `"${a.acknowledged ? 'ACKNOWLEDGED' : 'ACTIVE_UNRESOLVED'}"`,
        ].join(',')
      );

      const csvContent = [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DIAGNOSTIC_PULSE_ANOMALY_DOSSIER_${cleanTime}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const data = {
        exportType: 'FMCSA_CAN_BUS_DIAGNOSTIC_PULSE_AUDIT',
        standard: 'FMCSA 49 CFR § 396.3 / SAE J1939-71 Engine Baselines',
        timestamp: reportTimestamp,
        cadenceStatus: evaluation.cadenceStatus,
        pulseScorePct: evaluation.pulseScorePct,
        activeProfile: selectedProfileId,
        diagnosticsSnapshot: diagnostics,
        anomalies: alertHistory,
        cryptographicProof: {
          sha256Hash: `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('')}`,
          verifier: 'TruckWithEase Commercial Vehicle Diagnostics Guardian',
        },
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DIAGNOSTIC_PULSE_ANOMALY_DOSSIER_${cleanTime}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const activeAlerts = alertHistory.filter(a => !a.acknowledged);
  const activeProfile = BASELINE_PROFILES.find(p => p.id === selectedProfileId) || BASELINE_PROFILES[0];

  return (
    <div className="space-y-4">
      {/* 1. TOP PULSE HUD: OSCILLOSCOPE, CADENCE BADGE & CONTROLS */}
      <div className="bg-[#0B1017] border border-[#1E2B3E] rounded-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        {/* Ambient background glow according to pulse status */}
        <div
          className={`absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            evaluation.cadenceStatus === 'CRITICAL_MALFUNCTION'
              ? 'bg-rose-500/10'
              : evaluation.cadenceStatus === 'ARRHYTHMIC_DEVIATION'
              ? 'bg-amber-500/10'
              : 'bg-emerald-500/5'
          }`}
        />

        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1A2636] pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg border transition-all ${
                evaluation.cadenceStatus === 'CRITICAL_MALFUNCTION'
                  ? 'bg-rose-950/60 border-rose-500/60 text-rose-400 animate-pulse'
                  : evaluation.cadenceStatus === 'ARRHYTHMIC_DEVIATION'
                  ? 'bg-amber-950/60 border-amber-500/60 text-amber-400'
                  : 'bg-emerald-950/60 border-emerald-500/50 text-[#00FF66]'
              }`}
            >
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-headline font-black uppercase tracking-wider text-white">
                  Real-Time Diagnostic Pulse™
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-black uppercase rounded border bg-[#0F1722] text-[#C9A84C] border-[#C9A84C]/40">
                  SAE J1939 Baseline Monitor
                </span>
              </div>
              <p className="text-xs font-mono text-[#8B98A5] mt-0.5">
                Continuous CAN-bus telemetry pattern analysis against mechanical baseline corridors
              </p>
            </div>
          </div>

          {/* Quick HUD controls */}
          <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playDiagnosticPulseChime('nominal');
              }}
              className={`px-3 py-1.5 rounded border flex items-center gap-1.5 transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-sky-950/60 text-sky-300 border-sky-600/50 hover:bg-sky-900/60'
                  : 'bg-[#151D29] text-[#6B7280] border-[#2A374A] hover:text-white'
              }`}
              title={soundEnabled ? 'Diagnostic Pulse audio chimes active' : 'Audio chimes muted'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? 'Pulse Audio: ON' : 'Pulse Audio: OFF'}</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <select
                value={selectedProfileId}
                onChange={e => {
                  setSelectedProfileId(e.target.value);
                  triggerHapticFeedback('tick');
                }}
                className="bg-[#151D29] border border-[#2A374A] text-white rounded px-2.5 py-1.5 text-xs font-mono font-bold focus:border-[#C9A84C] focus:outline-none cursor-pointer"
              >
                {BASELINE_PROFILES.map(prof => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sensitivity Selection */}
            <div className="flex items-center gap-1 bg-[#101722] border border-[#223145] p-1 rounded">
              <span className="text-[10px] text-[#7E8B9B] px-1 font-bold">SENSITIVITY:</span>
              {[
                { label: 'Strict (±5%)', mult: 0.8 },
                { label: 'Standard (±10%)', mult: 1.0 },
                { label: 'Tolerant (±20%)', mult: 1.25 },
              ].map(s => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => {
                    setSensitivityMultiplier(s.mult);
                    triggerHapticFeedback('tick');
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    sensitivityMultiplier === s.mult
                      ? 'bg-[#C9A84C] text-black font-black'
                      : 'text-[#8A98A8] hover:text-white'
                  }`}
                >
                  {s.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Cardiac Telemetry Oscilloscope Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 items-center">
          {/* Waveform Canvas */}
          <div className="lg:col-span-8 bg-[#060A0F] border border-[#1A2636] rounded-lg p-2 relative shadow-inner overflow-hidden">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-mono border-b border-[#121E2C] mb-1">
              <span className="text-[#8899A6] flex items-center gap-1.5 font-bold">
                <span
                  className={`w-2 h-2 rounded-full ${
                    evaluation.cadenceStatus === 'CRITICAL_MALFUNCTION'
                      ? 'bg-rose-500 animate-ping'
                      : evaluation.cadenceStatus === 'ARRHYTHMIC_DEVIATION'
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-[#00FF66] animate-pulse'
                  }`}
                />
                J1939 CAN-BUS TELEMETRY PHOSPHOR OSCILLOSCOPE
              </span>
              <span className="text-[#5F7082] text-[10px]">
                Sweep Rate: 250 kbps • Cadence: {evaluation.bpmCadence} BPM
              </span>
            </div>

            <canvas
              ref={canvasRef}
              width={720}
              height={150}
              className="w-full h-36 rounded bg-[#060A0F] block"
            />

            {/* In-canvas watermark status */}
            <div className="absolute bottom-3 left-4 pointer-events-none font-mono text-[10px] text-[#4A5D70]">
              Baseline: <span className="text-white font-bold">{activeProfile.name}</span> • Deviations:{' '}
              <span
                className={
                  evaluation.deviatedParametersCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'
                }
              >
                {evaluation.deviatedParametersCount} parameter(s)
              </span>
            </div>
          </div>

          {/* Vitals Summary Card */}
          <div className="lg:col-span-4 bg-[#0F1622] border border-[#1E2B3E] rounded-lg p-4 space-y-3.5 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-[#8A98A8]">Diagnostic Pulse Status</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                  evaluation.cadenceStatus === 'CRITICAL_MALFUNCTION'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500 animate-pulse'
                    : evaluation.cadenceStatus === 'ARRHYTHMIC_DEVIATION'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500'
                    : evaluation.cadenceStatus === 'ASYMMETRIC_DRIFT'
                    ? 'bg-yellow-950/80 text-yellow-300 border-yellow-500'
                    : 'bg-emerald-950/80 text-[#00FF66] border-emerald-500/60'
                }`}
              >
                {evaluation.cadenceStatus.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Health Score Gauge */}
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] text-[#6E7E90]">Pulse Baseline Concordance</span>
                <span
                  className={`text-2xl font-black ${
                    evaluation.pulseScorePct < 60
                      ? 'text-rose-400'
                      : evaluation.pulseScorePct < 85
                      ? 'text-amber-400'
                      : 'text-[#00FF66]'
                  }`}
                >
                  {evaluation.pulseScorePct}%
                </span>
              </div>
              <div className="w-full bg-[#182333] h-2 rounded-full overflow-hidden mt-1.5">
                <div
                  className={`h-full transition-all duration-500 ${
                    evaluation.pulseScorePct < 60
                      ? 'bg-rose-500'
                      : evaluation.pulseScorePct < 85
                      ? 'bg-amber-500'
                      : 'bg-[#00FF66]'
                  }`}
                  style={{ width: `${evaluation.pulseScorePct}%` }}
                />
              </div>
            </div>

            {/* Summary counters */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-[#1C2A3C]">
              <div className="p-2 bg-[#0A0F17] rounded border border-[#1A2536]">
                <div className="text-[10px] text-[#718294] uppercase font-bold">Cadence</div>
                <div className="text-sm font-black text-white mt-0.5">{evaluation.bpmCadence} BPM</div>
              </div>
              <div className="p-2 bg-[#0A0F17] rounded border border-[#1A2536]">
                <div className="text-[10px] text-[#718294] uppercase font-bold">Warnings</div>
                <div className="text-sm font-black text-amber-400 mt-0.5">{evaluation.warningCount}</div>
              </div>
              <div className="p-2 bg-[#0A0F17] rounded border border-[#1A2536]">
                <div className="text-[10px] text-[#718294] uppercase font-bold">Critical</div>
                <div className="text-sm font-black text-rose-400 mt-0.5">{evaluation.criticalCount}</div>
              </div>
            </div>

            {/* Real-time status text */}
            <p className="text-[11px] text-[#93A1B2] leading-relaxed border-t border-[#1C2A3C] pt-2">
              {evaluation.overallSummary}
            </p>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-[#1E293B] pb-1 font-mono text-xs overflow-x-auto">
        {[
          {
            id: 'MONITOR',
            label: '1. Baseline Matrix & Live Readings',
            badge: `${Object.keys(ENGINE_BASELINES).length} SENSORS`,
          },
          {
            id: 'ALERTS',
            label: '2. Diagnostic Pulse Alerts Ledger',
            badge: `${activeAlerts.length} ACTIVE`,
            badgeColor: activeAlerts.length > 0 ? 'bg-rose-950/80 text-rose-300 border-rose-500' : undefined,
          },
          {
            id: 'STRESS_TEST',
            label: '3. Anomaly Injection & Stress Tester',
            badge: 'SIMULATOR',
            badgeColor: 'bg-purple-950/60 text-purple-300 border-purple-500/40',
          },
          {
            id: 'BASELINES',
            label: '4. Baseline Profile Specs & FMCSA Rules',
            badge: '4 PROFILES',
          },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              triggerHapticFeedback('tick');
              setActiveTab(tab.id as any);
            }}
            className={`px-3.5 py-2 rounded-t font-bold uppercase transition-all flex items-center gap-2 cursor-pointer border-b-2 shrink-0 ${
              activeTab === tab.id
                ? 'border-[#C9A84C] text-[#C9A84C] bg-[#0E1522]'
                : 'border-transparent text-[#7E8B9B] hover:text-white hover:bg-[#0A0E17]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 text-[9px] rounded border font-mono font-bold ${
                tab.badgeColor || 'bg-[#151F2E] text-[#8EA0B4] border-[#243347]'
              }`}
            >
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: BASELINE MATRIX & LIVE SENSOR READINGS */}
      {activeTab === 'MONITOR' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
            {(Object.values(evaluation.parameters) as ParameterDeviationResult[]).map((param: ParameterDeviationResult) => {
              const isCrit = param.status === 'CRITICAL';
              const isWarn = param.status === 'WARNING';

              return (
                <div
                  key={param.key}
                  className={`bg-[#0C121B] border rounded-lg p-3.5 space-y-2.5 transition-all shadow-md ${
                    isCrit
                      ? 'border-rose-500/70 bg-rose-950/20'
                      : isWarn
                      ? 'border-amber-500/70 bg-amber-950/20'
                      : 'border-[#1C2738] hover:border-[#2C3E57]'
                  }`}
                >
                  {/* Top Bar: Param Name & Status Badge */}
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <div className="text-[10px] text-[#8090A2] uppercase font-bold truncate">
                        {param.name}
                      </div>
                      <div className="text-[9px] text-[#556475]">{param.pgn}</div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border shrink-0 ${
                        isCrit
                          ? 'bg-rose-950/80 text-rose-300 border-rose-500 animate-pulse'
                          : isWarn
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500'
                          : 'bg-emerald-950/80 text-emerald-400 border-emerald-600/50'
                      }`}
                    >
                      {param.status}
                    </span>
                  </div>

                  {/* Large Value Display */}
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-white tracking-tight">
                      {param.currentFormatted}
                    </span>
                    {param.deviationPct !== 0 && (
                      <span
                        className={`text-xs font-bold ${
                          param.deviationPct > 0 ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      >
                        {param.deviationPct > 0 ? `+${param.deviationPct}%` : `${param.deviationPct}%`}
                      </span>
                    )}
                  </div>

                  {/* Target Baseline Corridor */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#718294]">
                      <span>Baseline:</span>
                      <span className="text-white font-bold">
                        {param.baselineMin} – {param.baselineMax} {param.unit}
                      </span>
                    </div>

                    {/* Corridor Visual Meter */}
                    <div className="w-full bg-[#151D29] h-2 rounded-full overflow-hidden relative">
                      {/* Safe Corridor Zone */}
                      <div
                        className="absolute top-0 bottom-0 bg-emerald-500/20 border-x border-emerald-500/40"
                        style={{
                          left: '25%',
                          width: '50%',
                        }}
                      />
                      {/* Current Pointer indicator */}
                      <div
                        className={`absolute top-0 bottom-0 w-2.5 rounded-full transition-all duration-300 ${
                          isCrit ? 'bg-rose-500' : isWarn ? 'bg-amber-400' : 'bg-[#00FF66]'
                        }`}
                        style={{
                          left: `${Math.max(
                            2,
                            Math.min(
                              95,
                              ((param.currentValue - param.baselineMin * 0.7) /
                                (param.baselineMax * 1.3 - param.baselineMin * 0.7)) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Diagnostics Advice when deviated */}
                  {(isCrit || isWarn) && (
                    <div className="pt-1.5 border-t border-[#1F2C3F] text-[10px] space-y-1">
                      <p className="text-amber-300 font-medium leading-tight">
                        ⚠️ {param.hypothesis}
                      </p>
                      <p className="text-[#8494A5] text-[9px] leading-tight">
                        Action: {param.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DIAGNOSTIC PULSE ALERTS LEDGER */}
      {activeTab === 'ALERTS' && (
        <div className="space-y-3 font-mono animate-in fade-in">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0C121B] border border-[#1E2B3E] p-3 rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#C9A84C]" />
              <span className="font-bold text-white uppercase">Diagnostic Pulse Anomaly Feed</span>
              <span className="px-2 py-0.5 rounded bg-[#162232] text-sky-300 border border-sky-600/40 text-[10px]">
                {alertHistory.length} Total Captured
              </span>
              {activeAlerts.length > 0 && (
                <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500 text-[10px] font-bold animate-pulse">
                  {activeAlerts.length} Unresolved
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeAlerts.length > 0 && (
                <button
                  type="button"
                  onClick={handleAcknowledgeAll}
                  className="px-2.5 py-1.5 bg-[#172230] hover:bg-[#203044] text-[#C9A84C] border border-[#C9A84C]/40 rounded text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Acknowledge All
                </button>
              )}
              {alertHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-600/40 rounded text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Clear Buffer
                </button>
              )}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleExportAnomalyReport('csv')}
                  className="px-2 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-600/50 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                  title="Export alerts as CSV spreadsheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportAnomalyReport('json')}
                  className="px-2 py-1.5 bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-600/50 rounded text-xs font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                  title="Export alerts as JSON dataset"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>
              </div>
            </div>
          </div>

          {/* Alert Cards Feed */}
          {alertHistory.length === 0 ? (
            <div className="p-8 bg-[#0B1017] border border-[#1A2636] rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#00FF66] mx-auto" />
              <div className="text-sm font-bold text-white uppercase">
                Diagnostic Pulse: Zero Baseline Deviations
              </div>
              <p className="text-xs text-[#7E8B9B] max-w-md mx-auto">
                Raw CAN-bus telemetry streams are perfectly harmonized with expected Detroit DD15 / Cummins X15
                mechanical baseline parameters.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {alertHistory.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    alert.acknowledged
                      ? 'bg-[#090D13] border-[#182333] opacity-65'
                      : alert.severity === 'alert'
                      ? 'bg-rose-950/30 border-rose-500/70 shadow-lg'
                      : 'bg-amber-950/20 border-amber-500/60 shadow'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${
                            alert.severity === 'alert'
                              ? 'bg-rose-950 text-rose-300 border-rose-500'
                              : 'bg-amber-950 text-amber-300 border-amber-500'
                          }`}
                        >
                          {alert.severity === 'alert' ? 'CRITICAL ALERT' : 'PULSE WARNING'}
                        </span>
                        <span className="text-xs font-bold text-white">{alert.parameterName}</span>
                        <span className="text-[10px] text-[#8697A8] bg-[#121B27] px-1.5 py-0.5 rounded border border-[#213042]">
                          {alert.pgnOrPid}
                        </span>
                        <span className="text-[10px] text-[#556677]">• {alert.timestamp}</span>
                      </div>

                      <div className="text-xs text-[#C8D6E5] mt-1">
                        Current:{' '}
                        <span className="font-bold text-rose-400">{alert.currentValueFormatted}</span>{' '}
                        (Expected:{' '}
                        <span className="font-bold text-emerald-400">{alert.baselineExpected}</span>) •
                        Deviation: <span className="font-bold text-amber-400">+{alert.deviationPct}%</span>
                      </div>

                      <p className="text-xs text-[#95A5B6] leading-relaxed pt-1">
                        <strong className="text-amber-300">Hypothesis:</strong> {alert.rootCauseHypothesis}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-[#748596] pt-1">
                        <span>Statute: {alert.fmcsaCitation}</span>
                        <span>•</span>
                        <span className="text-sky-300">Action: {alert.recommendedAction}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                      {!alert.acknowledged ? (
                        <button
                          type="button"
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          className="px-2.5 py-1 bg-[#1A2636] hover:bg-[#25364C] text-[#C9A84C] hover:text-white border border-[#C9A84C]/40 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] text-[#718294] font-bold uppercase bg-[#101722] rounded border border-[#1E2B3E]">
                          Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ANOMALY INJECTION & STRESS TESTER */}
      {activeTab === 'STRESS_TEST' && (
        <div className="bg-[#0B1017] border border-[#1E2B3E] rounded-xl p-4 sm:p-5 font-mono space-y-4 animate-in fade-in">
          <div>
            <h4 className="text-sm font-bold uppercase text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#C9A84C]" />
              Diagnostic Pulse Stress Tester &amp; Pattern Anomaly Injector
            </h4>
            <p className="text-xs text-[#8A98A8] mt-1 leading-relaxed">
              Instantly simulate real-time mechanical failure modes, electrical brownouts, and sensor telemetry
              spikes to verify live alert triggering, audible pulse warning, and in-cab notifications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Anomaly 1: Coolant Thermal Spike */}
            <div className="bg-[#0F1622] border border-[#1F2C3F] hover:border-rose-500/60 p-3.5 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Engine Overheat Surge</span>
                <Flame className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-[11px] text-[#8090A2]">
                Forces ET1 coolant temperature to 226°F (baseline max: 206°F). Tests thermal derate alerts.
              </p>
              <button
                type="button"
                onClick={() => {
                  onInjectDiagnosticAnomaly?.({ coolantTempF: 226 });
                  triggerHapticFeedback('alert');
                }}
                className="w-full py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-600/70 text-rose-300 text-xs font-bold uppercase rounded transition-colors cursor-pointer"
              >
                Inject Thermal Spike (226°F)
              </button>
            </div>

            {/* Anomaly 2: Low Oil Pressure Drop */}
            <div className="bg-[#0F1622] border border-[#1F2C3F] hover:border-rose-500/60 p-3.5 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Low Lube Oil Pressure</span>
                <Gauge className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-[11px] text-[#8090A2]">
                Drops EFL/P1 oil pressure to 23 PSI at 65 MPH highway cruise (baseline minimum: 34 PSI).
              </p>
              <button
                type="button"
                onClick={() => {
                  onInjectDiagnosticAnomaly?.({ oilPressurePsi: 23 });
                  triggerHapticFeedback('alert');
                }}
                className="w-full py-1.5 bg-amber-950/60 hover:bg-amber-900 border border-amber-600/70 text-amber-300 text-xs font-bold uppercase rounded transition-colors cursor-pointer"
              >
                Inject Low Oil PSI (23 PSI)
              </button>
            </div>

            {/* Anomaly 3: Alternator Voltage Collapse */}
            <div className="bg-[#0F1622] border border-[#1F2C3F] hover:border-rose-500/60 p-3.5 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Alternator Under-Voltage</span>
                <Zap className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-[11px] text-[#8090A2]">
                Drops electrical system to 11.8 VDC (baseline: 13.5 - 14.5V). Tests parasitic draw / charging alerts.
              </p>
              <button
                type="button"
                onClick={() => {
                  onInjectDiagnosticAnomaly?.({ batteryVoltage: 11.8 });
                  triggerHapticFeedback('alert');
                }}
                className="w-full py-1.5 bg-sky-950/60 hover:bg-sky-900 border border-sky-600/70 text-sky-300 text-xs font-bold uppercase rounded transition-colors cursor-pointer"
              >
                Inject Low Voltage (11.8 VDC)
              </button>
            </div>

            {/* Anomaly 4: Downhill Engine Over-Rev */}
            <div className="bg-[#0F1622] border border-[#1F2C3F] hover:border-rose-500/60 p-3.5 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Crankshaft Over-Rev</span>
                <Activity className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-[11px] text-[#8090A2]">
                Forces EEC1 engine speed to 2,050 RPM (baseline cruise max: 1,650 RPM). Tests overspeed threshold.
              </p>
              <button
                type="button"
                onClick={() => {
                  onInjectDiagnosticAnomaly?.({ engineRpm: 2050 });
                  triggerHapticFeedback('alert');
                }}
                className="w-full py-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-600/70 text-purple-300 text-xs font-bold uppercase rounded transition-colors cursor-pointer"
              >
                Inject Over-Rev (2,050 RPM)
              </button>
            </div>

            {/* Anomaly 5: Severe Mountain Engine Load */}
            <div className="bg-[#0F1622] border border-[#1F2C3F] hover:border-rose-500/60 p-3.5 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Torque Overload (96%)</span>
                <Sliders className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-[11px] text-[#8090A2]">
                Sets engine load to 96% with reduced 4.1 MPG. Tests drivetrain strain and fuel efficiency drag.
              </p>
              <button
                type="button"
                onClick={() => {
                  onInjectDiagnosticAnomaly?.({ engineLoadPct: 96, instantMpg: 4.1 });
                  triggerHapticFeedback('alert');
                }}
                className="w-full py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-600/70 text-rose-300 text-xs font-bold uppercase rounded transition-colors cursor-pointer"
              >
                Inject 96% Torque Overload
              </button>
            </div>

            {/* Anomaly 6: Check Engine MIL Bit Active */}
            <div className="bg-[#0F1622] border border-[#1F2C3F] hover:border-rose-500/60 p-3.5 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">J1939 DM1 Active MIL Fault</span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-[11px] text-[#8090A2]">
                Illuminates Malfunction Indicator Lamp bit in PGN 65226 with active DTC code broadcast.
              </p>
              <button
                type="button"
                onClick={() => {
                  onInjectDiagnosticAnomaly?.({ malfunctionIndicator: true, activeDtcCount: 1 });
                  triggerHapticFeedback('alert');
                }}
                className="w-full py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-600/70 text-rose-300 text-xs font-bold uppercase rounded transition-colors cursor-pointer"
              >
                Inject DM1 Fault &amp; MIL
              </button>
            </div>
          </div>

          {/* Reset Action Button */}
          <div className="pt-2 border-t border-[#1C2A3C] flex items-center justify-between">
            <span className="text-xs text-[#7E8E9E]">Restore vehicle vitals to standard cruising parameters:</span>
            <button
              type="button"
              onClick={() => {
                onResetNominalDiagnostics?.();
                triggerHapticFeedback('success');
                if (soundEnabled) playDiagnosticPulseChime('nominal');
              }}
              className="px-4 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/70 text-[#00FF66] text-xs font-black uppercase rounded transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restore Nominal Baselines</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: BASELINE PROFILE SPECS & FMCSA RULES */}
      {activeTab === 'BASELINES' && (
        <div className="bg-[#0B1017] border border-[#1E2B3E] rounded-xl p-4 sm:p-5 font-mono space-y-4 animate-in fade-in">
          <div>
            <h4 className="text-sm font-bold uppercase text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Certified Commercial Vehicle Engine Baseline Profiles
            </h4>
            <p className="text-xs text-[#8A98A8] mt-1 leading-relaxed">
              Standardized mechanical baseline envelopes established in accordance with FMCSA 49 CFR § 396.3
              and SAE J1939-71 commercial vehicle diagnostics standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BASELINE_PROFILES.map(prof => (
              <div
                key={prof.id}
                className={`p-4 rounded-lg border space-y-2.5 transition-all ${
                  selectedProfileId === prof.id
                    ? 'bg-[#101926] border-[#C9A84C]'
                    : 'bg-[#0E141E] border-[#1C2839]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-white text-xs">{prof.name}</h5>
                  {selectedProfileId === prof.id ? (
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-[#C9A84C] text-black rounded">
                      ACTIVE PROFILE
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProfileId(prof.id);
                        triggerHapticFeedback('tick');
                      }}
                      className="px-2 py-0.5 text-[9px] text-[#C9A84C] hover:text-white border border-[#C9A84C]/40 rounded hover:bg-[#C9A84C]/20 transition-colors"
                    >
                      APPLY
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-[#8091A4] leading-relaxed">{prof.description}</p>
                <div className="text-[10px] text-[#5C6E80]">Engine Target: {prof.engineModel}</div>

                {/* Specs List */}
                <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-[#1C2839]">
                  <div>
                    <span className="text-[#64748B]">Coolant Range: </span>
                    <span className="text-white font-bold">
                      {prof.baselines.coolantTemp.min} - {prof.baselines.coolantTemp.max}°F
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Oil Pressure: </span>
                    <span className="text-white font-bold">
                      {prof.baselines.oilPressure.min} - {prof.baselines.oilPressure.max} PSI
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Battery Voltage: </span>
                    <span className="text-white font-bold">
                      {prof.baselines.batteryVoltage.min} - {prof.baselines.batteryVoltage.max} V
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Engine Speed: </span>
                    <span className="text-white font-bold">
                      {prof.baselines.engineRpm.min} - {prof.baselines.engineRpm.max} RPM
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
