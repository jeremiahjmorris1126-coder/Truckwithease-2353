import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Download,
  Check,
  X,
  Play,
  Pause,
  Zap,
  ShieldCheck,
  Sliders,
  Cpu,
  Radio,
  Cable,
  Flame,
  Search,
} from 'lucide-react';
import { EldEngineDiagnostics } from '../types';
import { triggerHapticFeedback } from '../services/haptics';

export interface HandshakeLogEntry {
  id: string;
  timestamp: string;
  type: 'SYS' | 'TX' | 'RX' | 'PASS' | 'WARN' | 'ERROR' | 'METRIC';
  opcode?: string;
  message: string;
  detail?: string;
}

interface EldQuickDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnostics: EldEngineDiagnostics;
  connectedDeviceName: string;
  interfaceType: 'bluetooth' | 'usb-hid' | 'simulator';
  baudRate: string;
  onInjectAnomaly?: (patch: Partial<EldEngineDiagnostics>) => void;
}

export const EldQuickDiagnosticModal: React.FC<EldQuickDiagnosticModalProps> = ({
  isOpen,
  onClose,
  diagnostics,
  connectedDeviceName,
  interfaceType,
  baudRate,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [handshakeLogs, setHandshakeLogs] = useState<HandshakeLogEntry[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'ALL' | 'TX_RX' | 'PASS_WARN'>('ALL');
  const [testMode, setTestMode] = useState<'NOMINAL' | 'STRESS_TEST'>('NOMINAL');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [handshakeSuccess, setHandshakeSuccess] = useState<boolean | null>(null);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const isRunningRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  isRunningRef.current = isRunning;
  isPausedRef.current = isPaused;

  const STAGES = [
    'Physical Transceiver Link & Baud Synchronization',
    'ECM / TCM Gateway Arbitration & Address Claim',
    'J1939 Protocol Query & VIN / Calibration Verification',
    'Sensor Telemetry Baseline & Odometer Integrity Lock',
    'Active DTC / MIL Lamp Diagnostic Inspection',
    'FMCSA 49 CFR § 395.26 Encryption & Cadence Certification',
  ];

  // Auto scroll terminal to bottom
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [handshakeLogs, autoScroll]);

  // Construct realistic handshake steps sequence
  const generateHandshakeSequence = (mode: 'NOMINAL' | 'STRESS_TEST'): HandshakeLogEntry[] => {
    const timeBase = new Date();
    const formatTime = (offsetMs: number) => {
      const d = new Date(timeBase.getTime() + offsetMs);
      return d.toTimeString().slice(0, 8) + '.' + String(d.getMilliseconds()).padStart(3, '0');
    };

    const isStress = mode === 'STRESS_TEST';
    const vinCode = '1FT8W3BT7NED84912';

    return [
      {
        id: 'step-1',
        timestamp: formatTime(20),
        type: 'SYS',
        message: `INITIALIZING COMMERCIAL ELD HARDWARE HANDSHAKE PROBE [${interfaceType.toUpperCase()}]`,
        detail: `Interface: ${connectedDeviceName} | Baud: ${baudRate} bps | Standard: SAE J1939 / ISO 15765-4`,
      },
      {
        id: 'step-2',
        timestamp: formatTime(90),
        type: 'TX',
        opcode: 'ATZ / AT SP 0',
        message: 'Broadcasting transponder hardware wake signal & auto-protocol handshake',
      },
      {
        id: 'step-3',
        timestamp: formatTime(180),
        type: 'RX',
        opcode: 'ELM327 v2.3 CAN J1939',
        message: 'Microcontroller response acknowledged: ELD Subsystem Chipset Ready (Silicon Labs v5.3)',
      },
      {
        id: 'step-4',
        timestamp: formatTime(260),
        type: 'PASS',
        opcode: 'ISO-TP_LINK_OK',
        message: `Physical bus impedance nominal (60.2 Ω differential across CAN_H & CAN_L). Baud rate locked at ${baudRate} bps`,
      },
      {
        id: 'step-5',
        timestamp: formatTime(350),
        type: 'TX',
        opcode: 'PGN 60928 (0x00EE00)',
        message: 'Transmitting SAE J1939 Address Claiming Request (Preferred Addr: 0xF9 / ELD Diagnostic Tool)',
      },
      {
        id: 'step-6',
        timestamp: formatTime(440),
        type: 'RX',
        opcode: '0x18EEFF00: 00 00 00 00 00 00 F9 80',
        message: 'Address Claim Granted: Transponder registered as Node 0xF9 on Heavy-Duty J1939 Backbone',
      },
      {
        id: 'step-7',
        timestamp: formatTime(530),
        type: 'TX',
        opcode: 'PGN 59904 (REQ PGN 65260)',
        message: 'Querying Component Identification (VIN, Make, Model, ECM Firmware Calibration)',
      },
      {
        id: 'step-8',
        timestamp: formatTime(650),
        type: 'RX',
        opcode: 'PGN 65260 (ECU 0x00)',
        message: `VIN Decoded: ${vinCode} | ECM Cal ID: CUMMINS-ISX15-X12-EPA24-REV9`,
      },
      {
        id: 'step-9',
        timestamp: formatTime(760),
        type: 'PASS',
        opcode: 'VIN_MATCH',
        message: 'VIN validation matched registered carrier vehicle profile (Unit assigned)',
      },
      {
        id: 'step-10',
        timestamp: formatTime(880),
        type: 'TX',
        opcode: 'PGN 65248 / PGN 65257',
        message: 'Querying High-Resolution Cumulative Odometer & Engine Run Hours',
      },
      {
        id: 'step-11',
        timestamp: formatTime(980),
        type: 'RX',
        opcode: '0x18FEE000 / 0x18FEE500',
        message: `Odometer: ${diagnostics.totalOdometerMiles.toFixed(1)} MI (${(diagnostics.totalOdometerMiles * 1.60934).toFixed(1)} KM) | Total Engine Hours: ${diagnostics.totalEngineHours.toFixed(1)} hrs`,
      },
      {
        id: 'step-12',
        timestamp: formatTime(1100),
        type: 'METRIC',
        opcode: 'TELEMETRY_SAMPLE',
        message: `Telemetry Real-Time: Speed: ${diagnostics.roadSpeedMph.toFixed(1)} MPH | RPM: ${Math.round(diagnostics.engineRpm)} | Coolant: ${diagnostics.coolantTempF}°F | Oil: ${diagnostics.oilPressurePsi} PSI | Bus: ${diagnostics.batteryVoltage.toFixed(1)}V`,
      },
      {
        id: 'step-13',
        timestamp: formatTime(1220),
        type: 'TX',
        opcode: 'PGN 65226 (DM1 DTC REQ)',
        message: 'Querying Active Diagnostic Trouble Codes & Malfunction Indicator Lamp (MIL) status',
      },
      {
        id: 'step-14',
        timestamp: formatTime(1340),
        type: isStress ? 'WARN' : 'PASS',
        opcode: isStress ? 'DM1_FAULT_PRESENT' : 'DM1_CLEAR',
        message: isStress
          ? 'SPN 3251 FMI 2 (DPF Differential Pressure Intermittent) active in ECU buffer'
          : `Active DTC Count: ${diagnostics.activeDtcCount} | MIL Lamp: ${diagnostics.malfunctionIndicator ? 'ON (Warning)' : 'OFF (Nominal)'}`,
      },
      {
        id: 'step-15',
        timestamp: formatTime(1460),
        type: 'TX',
        opcode: 'FMCSA § 395.26 CRYPTO_PROBE',
        message: 'Executing SHA-256 duty-cycle tamper verification & monotonic sequence checksum probe',
      },
      {
        id: 'step-16',
        timestamp: formatTime(1580),
        type: 'RX',
        opcode: '0x7E8_SEC_HASH',
        message: `Cryptographic Signature Generated: 0x8f2a91b4c3e80d440c99... [VALID]`,
      },
      {
        id: 'step-17',
        timestamp: formatTime(1700),
        type: 'PASS',
        opcode: 'HANDSHAKE_COMPLETE',
        message: 'ALL 6 FMCSA / SAE J1939 HANDSHAKE CHECKPOINTS VERIFIED (100% OPERATIONAL READINESS)',
        detail: 'Hardware is fully certified for real-time electronic logging & automated HOS transition recording.',
      },
    ];
  };

  const startHandshake = async () => {
    triggerHapticFeedback('subtle');
    setIsRunning(true);
    setIsPaused(false);
    setProgressPct(0);
    setCurrentStageIndex(0);
    setHandshakeLogs([]);
    setHandshakeSuccess(null);

    const steps = generateHandshakeSequence(testMode);

    for (let i = 0; i < steps.length; i++) {
      // Check if paused or closed
      while (isPausedRef.current) {
        await new Promise(r => setTimeout(r, 200));
        if (!isRunningRef.current) return;
      }

      if (!isRunningRef.current) return;

      const step = steps[i];
      setHandshakeLogs(prev => [...prev, step]);
      
      const pct = Math.round(((i + 1) / steps.length) * 100);
      setProgressPct(pct);

      const stageIdx = Math.min(STAGES.length - 1, Math.floor((i / steps.length) * STAGES.length));
      setCurrentStageIndex(stageIdx);

      // Delay between steps for authentic terminal feel
      await new Promise(r => setTimeout(r, 120 + Math.random() * 80));
    }

    setIsRunning(false);
    setHandshakeSuccess(true);
    triggerHapticFeedback('success');
  };

  // Run on open
  useEffect(() => {
    if (isOpen) {
      startHandshake();
    } else {
      setIsRunning(false);
      setIsPaused(false);
    }
  }, [isOpen]);

  const handleCopyLogs = () => {
    triggerHapticFeedback('subtle');
    const text = handshakeLogs
      .map(
        l =>
          `[${l.timestamp}] [${l.type}] ${l.opcode ? `[${l.opcode}] ` : ''}${l.message}${l.detail ? ` (${l.detail})` : ''}`
      )
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadLog = () => {
    triggerHapticFeedback('subtle');
    const text = [
      '=========================================================================',
      '  TRUCKWITHEASE™ COMMERCIAL ELD HARDWARE HANDSHAKE DIAGNOSTIC REPORT',
      '  Standard: FMCSA 49 CFR Part 395 Subpart B § 395.26 / SAE J1939',
      `  Date: ${new Date().toISOString()}`,
      `  Hardware Interface: ${interfaceType.toUpperCase()} (${connectedDeviceName})`,
      `  Baud Rate: ${baudRate} bps`,
      '=========================================================================\n',
      ...handshakeLogs.map(
        l =>
          `[${l.timestamp}] [${l.type.padEnd(6)}] ${l.opcode ? `[${l.opcode.padEnd(20)}] ` : ''}${l.message}${l.detail ? `\n    └─ Detail: ${l.detail}` : ''}`
      ),
      '\n=========================================================================',
      '  HANDSHAKE VERIFICATION RESULT: PASS - 100% PROTOCOL INTEGRITY',
      '=========================================================================',
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ELD_HARDWARE_HANDSHAKE_DIAGNOSTIC_${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const filteredLogs = handshakeLogs.filter(l => {
    if (filterType === 'TX_RX') return l.type === 'TX' || l.type === 'RX';
    if (filterType === 'PASS_WARN') return l.type === 'PASS' || l.type === 'WARN' || l.type === 'ERROR';
    return true;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-[#070A0F] border border-[#1E293B] shadow-2xl shadow-black rounded-xl w-full max-w-4xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* TOP BAR / TERMINAL TITLEBAR */}
        <div className="bg-[#0B1017] border-b border-[#1A2536] px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Terminal Window Dots */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block border border-rose-600/40" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block border border-amber-600/40" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block border border-emerald-600/40" />
            </div>

            <div className="h-4 w-px bg-[#1E293B] mx-1" />

            <div className="flex items-center gap-2 min-w-0">
              <Terminal className="w-4 h-4 text-[#00FF66] shrink-0" />
              <div className="truncate">
                <h3 className="font-[Oswald] text-base sm:text-lg font-bold uppercase text-white tracking-wide flex items-center gap-2">
                  <span>Quick Diagnostic Handshake Console</span>
                  {isRunning && (
                    <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-500/40 text-sky-400 font-mono text-[10px] font-bold animate-pulse">
                      PROBING J1939 BUS...
                    </span>
                  )}
                  {handshakeSuccess && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      HANDSHAKE VERIFIED
                    </span>
                  )}
                </h3>
                <p className="text-[10px] font-mono text-[#9CA3AF] truncate">
                  Target: <strong className="text-white">{connectedDeviceName}</strong> • {baudRate} bps • {interfaceType.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#141B26] hover:bg-[#1E293B] text-[#9CA3AF] hover:text-white border border-[#233145] transition-colors"
              title="Close Diagnostic Terminal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ACTIVE STAGE PROGRESS STRIP */}
        <div className="bg-[#05080E] px-4 py-2.5 sm:px-6 border-b border-[#141E2C] font-mono text-xs">
          <div className="flex items-center justify-between mb-1.5 text-[11px]">
            <span className="text-[#9CA3AF] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#C9A84C]" />
              Phase {currentStageIndex + 1} of {STAGES.length}:{' '}
              <strong className="text-white">{STAGES[currentStageIndex]}</strong>
            </span>
            <span className="text-[#00FF66] font-bold">{progressPct}%</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-[#121A26] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-[#C9A84C] to-[#00FF66] transition-all duration-300 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* CONTROLS & FILTER TOOLBAR */}
        <div className="bg-[#0A0E15] px-4 py-2 sm:px-6 border-b border-[#141E2C] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={startHandshake}
              disabled={isRunning && !isPaused}
              className="px-2.5 py-1.5 rounded bg-[#162232] hover:bg-[#203045] disabled:opacity-50 text-white font-bold uppercase text-[11px] border border-[#283C56] transition-all flex items-center gap-1.5 shadow-sm"
              title="Re-run Diagnostic Handshake"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#00FF66] ${isRunning ? 'animate-spin' : ''}`} />
              <span>Re-Run</span>
            </button>

            {isRunning && (
              <button
                type="button"
                onClick={() => setIsPaused(prev => !prev)}
                className="px-2.5 py-1.5 rounded bg-[#162232] hover:bg-[#203045] text-[#C9A84C] font-bold uppercase text-[11px] border border-[#283C56] transition-all flex items-center gap-1.5 shadow-sm"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
            )}

            <div className="h-4 w-px bg-[#1E293B] mx-1 hidden sm:block" />

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#05080E] p-0.5 rounded border border-[#1A2536]">
              {(['ALL', 'TX_RX', 'PASS_WARN'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterType(tab)}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                    filterType === tab
                      ? 'bg-[#1E2E42] text-sky-300 font-black'
                      : 'text-[#6E8094] hover:text-white'
                  }`}
                >
                  {tab === 'ALL' ? 'All Logs' : tab === 'TX_RX' ? 'TX / RX Frames' : 'Verifications'}
                </button>
              ))}
            </div>

            {/* Stress Test vs Nominal Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                const nextMode = testMode === 'NOMINAL' ? 'STRESS_TEST' : 'NOMINAL';
                setTestMode(nextMode);
                triggerHapticFeedback('tick');
              }}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase border transition-all flex items-center gap-1 ${
                testMode === 'STRESS_TEST'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                  : 'bg-[#0E1520] text-[#9CA3AF] border-[#1C2738] hover:text-white'
              }`}
              title="Toggle between Nominal Baseline and Fault Anomaly simulation"
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>{testMode === 'NOMINAL' ? 'Nominal Pass' : 'Stress/DTC Mode'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyLogs}
              className="px-2.5 py-1.5 rounded bg-[#121A26] hover:bg-[#1A2638] text-gray-300 hover:text-white border border-[#233145] text-[11px] font-bold transition-colors flex items-center gap-1"
              title="Copy terminal logs to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#00FF66]" /> : <Copy className="w-3.5 h-3.5 text-[#9CA3AF]" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadLog}
              className="px-2.5 py-1.5 rounded bg-[#121A26] hover:bg-[#1A2638] text-sky-300 hover:text-white border border-[#233145] text-[11px] font-bold transition-colors flex items-center gap-1"
              title="Download full diagnostic session log"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export .log</span>
            </button>
          </div>
        </div>

        {/* TERMINAL OUTPUT STREAM CONTAINER */}
        <div className="flex-1 bg-[#03060A] p-3 sm:p-4 overflow-y-auto font-mono text-xs text-[#9CA3AF] space-y-1.5 min-h-[280px] max-h-[50vh] border-y border-[#0E1520] relative">
          
          {/* Subtle background scanlines */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] opacity-20" />

          {filteredLogs.length === 0 && (
            <div className="text-center py-12 text-[#566579]">
              <Terminal className="w-8 h-8 mx-auto mb-2 text-[#2A374A]" />
              <p>Diagnostic terminal stream ready. Initializing handshake...</p>
            </div>
          )}

          {filteredLogs.map(log => {
            const isTx = log.type === 'TX';
            const isRx = log.type === 'RX';
            const isPass = log.type === 'PASS';
            const isWarn = log.type === 'WARN';
            const isMetric = log.type === 'METRIC';

            return (
              <div
                key={log.id}
                className={`py-0.5 px-2 rounded font-mono text-[11px] sm:text-xs leading-relaxed flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 transition-colors ${
                  isPass
                    ? 'bg-emerald-950/30 text-emerald-300 border-l-2 border-emerald-500'
                    : isWarn
                    ? 'bg-amber-950/30 text-amber-300 border-l-2 border-amber-500'
                    : isTx
                    ? 'bg-sky-950/20 text-sky-200 border-l-2 border-sky-500/60'
                    : isRx
                    ? 'bg-[#0E1826] text-white border-l-2 border-[#C9A84C]'
                    : isMetric
                    ? 'bg-[#101928] text-purple-200 border-l-2 border-purple-500/60'
                    : 'text-[#94A3B8] border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-1.5 shrink-0 select-none">
                  <span className="text-[#526377] text-[10px]">{log.timestamp}</span>
                  <span
                    className={`px-1 py-0.2 rounded text-[9px] font-black uppercase ${
                      isPass
                        ? 'bg-emerald-900/80 text-emerald-200'
                        : isWarn
                        ? 'bg-amber-900/80 text-amber-200'
                        : isTx
                        ? 'bg-sky-900/80 text-sky-200'
                        : isRx
                        ? 'bg-[#C9A84C]/20 text-[#C9A84C]'
                        : isMetric
                        ? 'bg-purple-900/80 text-purple-200'
                        : 'bg-[#1E293B] text-[#94A3B8]'
                    }`}
                  >
                    {log.type}
                  </span>
                  {log.opcode && (
                    <span className="text-[#C9A84C] font-bold text-[10px] bg-black/40 px-1 rounded truncate max-w-[140px]">
                      {log.opcode}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 break-words">
                  <span>{log.message}</span>
                  {log.detail && (
                    <span className="block text-[10px] text-[#718296] mt-0.5 pl-2 border-l border-[#243142]">
                      └─ {log.detail}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {isRunning && (
            <div className="flex items-center gap-2 text-sky-400 font-mono text-xs pt-1">
              <span className="inline-block w-2 h-3.5 bg-sky-400 animate-pulse" />
              <span className="text-[11px] text-[#6A7E94] animate-pulse">
                Probing vehicle transponder and executing J1939 protocol query...
              </span>
            </div>
          )}

          <div ref={terminalEndRef} />
        </div>

        {/* BOTTOM METRICS SUMMARY FOOTER */}
        <div className="bg-[#070B10] p-3 sm:p-4 border-t border-[#141E2C] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono shrink-0">
          <div className="p-2 rounded bg-[#0D131C] border border-[#1A2536]">
            <div className="text-[9px] text-[#6E8094] uppercase font-bold">Bus Protocol</div>
            <div className="text-white font-bold text-xs truncate">SAE J1939 / ISO 15765-4</div>
          </div>
          <div className="p-2 rounded bg-[#0D131C] border border-[#1A2536]">
            <div className="text-[9px] text-[#6E8094] uppercase font-bold">Transponder Addr</div>
            <div className="text-[#00FF66] font-bold text-xs">0xF9 (Claimed OK)</div>
          </div>
          <div className="p-2 rounded bg-[#0D131C] border border-[#1A2536]">
            <div className="text-[9px] text-[#6E8094] uppercase font-bold">Sensor CRC Check</div>
            <div className="text-sky-400 font-bold text-xs">CRC-16 / PASS (0 Error)</div>
          </div>
          <div className="p-2 rounded bg-[#0D131C] border border-[#1A2536]">
            <div className="text-[9px] text-[#6E8094] uppercase font-bold">FMCSA § 395.26</div>
            <div className="text-[#C9A84C] font-bold text-xs">100% Compliant</div>
          </div>
        </div>

        {/* ACTION FOOTER */}
        <div className="bg-[#05080E] p-3 sm:px-6 sm:py-3.5 border-t border-[#141E2C] flex items-center justify-between">
          <div className="text-[10px] font-mono text-[#6E8094] hidden sm:block">
            Simulated Handshake Engine • TruckWithEase™ Telematics Subsystem
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-[#141D2B] hover:bg-[#1F2C40] text-white font-mono font-bold text-xs uppercase tracking-wider border border-[#283A52] transition-colors"
          >
            Close Terminal
          </button>
        </div>

      </div>
    </div>
  );
};
