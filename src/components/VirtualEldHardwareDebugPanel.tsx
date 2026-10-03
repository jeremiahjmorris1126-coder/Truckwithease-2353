import React, { useState, useEffect, useMemo } from 'react';
import {
  Cpu,
  Sliders,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Gauge,
  Clock,
  Radio,
  Flame,
  ShieldCheck,
  ShieldAlert,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Terminal,
  Layers,
  ArrowRight,
  Truck,
  Activity,
  ChevronRight,
  HelpCircle,
  FileCode,
  Binary,
  Search,
  SlidersHorizontal,
  FileText,
} from 'lucide-react';
import {
  EldEngineDiagnostics,
  EldDiagnosticTroubleCode,
  EldRawPacket,
  TacticalNotification,
} from '../types';
import {
  decodeJ1939CanFrame,
  J1939_PRESET_FRAMES,
  J1939PgnPresetFrame,
  DecodedCanFrameResult,
} from '../services/j1939PgnDecoder';
import { triggerHapticFeedback } from '../services/haptics';

export interface VirtualEldHardwareDebugPanelProps {
  diagnostics: EldEngineDiagnostics;
  onUpdateDiagnostics: (patch: Partial<EldEngineDiagnostics>) => void;
  onInjectPacket?: (packet: EldRawPacket) => void;
  onInjectDtc?: (dtc: EldDiagnosticTroubleCode) => void;
  onClearDtcs?: () => void;
  onAddNotification?: (notification: TacticalNotification) => void;
  onShowToast?: (msg: string) => void;
}

export interface ComplianceTriggerLog {
  id: string;
  timestamp: string;
  eventCode: string;
  eventTypeDescription: string;
  standardReference: string;
  triggerCondition: string;
  severity: 'INFO' | 'TRIGGER' | 'MALFUNCTION' | 'WARNING';
}

export const VirtualEldHardwareDebugPanel: React.FC<VirtualEldHardwareDebugPanelProps> = ({
  diagnostics,
  onUpdateDiagnostics,
  onInjectPacket,
  onInjectDtc,
  onClearDtcs,
  onAddNotification,
  onShowToast,
}) => {
  // Local active simulation states
  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<string>('custom');
  const [copiedFrameIndex, setCopiedFrameIndex] = useState<number | null>(null);
  const [complianceLogs, setComplianceLogs] = useState<ComplianceTriggerLog[]>([]);
  const [customSpn, setCustomSpn] = useState<number>(3251);
  const [customFmi, setCustomFmi] = useState<number>(2);
  const [customDtcDesc, setCustomDtcDesc] = useState<string>('DPF Differential Pressure Intermittent');

  // J1939 PGN Decoder Tool States
  const [decoderArbId, setDecoderArbId] = useState<string>('0x0CF00400');
  const [decoderPayloadHex, setDecoderPayloadHex] = useState<string>('F0 3E 00 2D FF FF FF FF');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('eec1-nominal');
  const [copiedDecodedText, setCopiedDecodedText] = useState<boolean>(false);

  // Search Filter State for PGN / SPN / Parameter troubleshooting
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live Decoded PGN Frame Calculation
  const decodedResult: DecodedCanFrameResult = useMemo(() => {
    return decodeJ1939CanFrame(decoderArbId, decoderPayloadHex);
  }, [decoderArbId, decoderPayloadHex]);

  // Filtered Decoded SPN Parameters based on search query
  const filteredDecodedParameters = useMemo(() => {
    if (!searchQuery.trim()) return decodedResult.parameters;
    const query = searchQuery.toLowerCase().trim();
    return decodedResult.parameters.filter(param => {
      const matchSpn = `spn ${param.spn}`.includes(query) || String(param.spn).includes(query);
      const matchName = param.name.toLowerCase().includes(query);
      const matchByte = param.bytePosition.toLowerCase().includes(query);
      const matchHex = param.rawHex.toLowerCase().includes(query);
      const matchValue = String(param.decodedValue).toLowerCase().includes(query);
      const matchDisplay = param.formattedDisplay.toLowerCase().includes(query);
      const matchCategory = param.category.toLowerCase().includes(query);
      return matchSpn || matchName || matchByte || matchHex || matchValue || matchDisplay || matchCategory;
    });
  }, [decodedResult.parameters, searchQuery]);

  // Handle Loading Preset into Decoder
  const handleSelectPreset = (presetId: string) => {
    const preset = J1939_PRESET_FRAMES.find(p => p.id === presetId);
    if (!preset) return;
    triggerHapticFeedback('subtle');
    setSelectedPresetId(presetId);
    setDecoderArbId(preset.arbIdHex);
    setDecoderPayloadHex(preset.payloadHex);
  };

  // Apply Decoded Parameters into Live Virtual Engine Simulation
  const handleApplyDecodedToSimulation = () => {
    triggerHapticFeedback('subtle');
    const patch: Partial<EldEngineDiagnostics> = {};

    decodedResult.parameters.forEach(p => {
      if (typeof p.decodedValue === 'number' && !isNaN(p.decodedValue)) {
        if (p.spn === 190) patch.engineRpm = p.decodedValue; // RPM
        if (p.spn === 84) patch.roadSpeedMph = p.decodedValue; // Speed
        if (p.spn === 513) patch.engineLoadPct = Math.max(0, Math.min(100, p.decodedValue)); // Torque
        if (p.spn === 100) patch.oilPressurePsi = p.decodedValue; // Oil Pressure
        if (p.spn === 110) patch.coolantTempF = p.decodedValue; // Coolant Temp
        if (p.spn === 245) patch.totalOdometerMiles = p.decodedValue; // Odometer
        if (p.spn === 247) patch.totalEngineHours = p.decodedValue; // Engine Hours
        if (p.spn === 168) patch.batteryVoltage = p.decodedValue; // Battery Voltage
        if (p.spn === 184) patch.instantMpg = p.decodedValue; // Instant MPG
      }
      if (p.spn === 1213) {
        patch.malfunctionIndicator = String(p.decodedValue).toLowerCase().includes('active') || String(p.decodedValue).toLowerCase().includes('warning');
      }
    });

    if (Object.keys(patch).length > 0) {
      onUpdateDiagnostics(patch);
      addComplianceLog(
        'J1939_PGN_APPLIED',
        `Applied Decoded ${decodedResult.pgnAcronym} (PGN ${decodedResult.pgn}) Parameters`,
        'SAE J1939-71 Application Layer',
        `Updated live simulation baselines: ${Object.keys(patch).map(k => `${k}: ${(patch as any)[k]}`).join(', ')}`,
        'INFO'
      );
      if (onShowToast) {
        onShowToast(`APPLIED DECODED PGN ${decodedResult.pgn} (${decodedResult.pgnAcronym}) TO SIMULATION`);
      }
    } else {
      if (onShowToast) {
        onShowToast(`PGN ${decodedResult.pgn} DECODED SUCCESSFULLY`);
      }
    }
  };

  const handleCopyDecodedSummary = () => {
    triggerHapticFeedback('subtle');
    const lines = [
      `=========================================================================`,
      `TRUCKWITHEASE™ SAE J1939 CAN FRAME DECODER REPORT`,
      `CAN ID: ${decodedResult.arbitrationIdHex} | Priority: ${decodedResult.priority} | PGN: ${decodedResult.pgn} (${decodedResult.pgnHex})`,
      `Group Name: ${decodedResult.pgnAcronym} — ${decodedResult.pgnName}`,
      `Source Address: ${decodedResult.sourceAddressHex} (${decodedResult.sourceAddressName})`,
      `Payload Hex: ${decodedResult.rawPayloadHex}`,
      `Compliance Note: ${decodedResult.fmcsaComplianceImpact}`,
      `=========================================================================`,
      ...decodedResult.parameters.map(p => `• [SPN ${p.spn}] ${p.name.padEnd(35)}: ${p.formattedDisplay} (${p.bytePosition})`),
      `=========================================================================`,
    ].join('\n');

    navigator.clipboard.writeText(lines);
    setCopiedDecodedText(true);
    setTimeout(() => setCopiedDecodedText(false), 2500);
  };

  // Trigger helper
  const addComplianceLog = (
    eventCode: string,
    eventTypeDescription: string,
    standardReference: string,
    triggerCondition: string,
    severity: 'INFO' | 'TRIGGER' | 'MALFUNCTION' | 'WARNING' = 'TRIGGER'
  ) => {
    const newLog: ComplianceTriggerLog = {
      id: `COMPL-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleTimeString(),
      eventCode,
      eventTypeDescription,
      standardReference,
      triggerCondition,
      severity,
    };
    setComplianceLogs(prev => [newLog, ...prev.slice(0, 24)]);
    triggerHapticFeedback(severity === 'MALFUNCTION' ? 'alert' : 'subtle');

    if (onShowToast) {
      onShowToast(`FMCSA EVENT TRIGGERED: [${eventCode}] ${eventTypeDescription}`);
    }
  };

  // Generate live J1939 CAN frame byte representations based on current diagnostics
  const liveCanFrames = useMemo(() => {
    // 1. PGN 61444 (EEC1) - Engine Speed & Torque
    const rpmRaw = Math.round(diagnostics.engineRpm / 0.125);
    const rpmHexLo = (rpmRaw & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    const rpmHexHi = ((rpmRaw >> 8) & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    const trqHex = Math.round(diagnostics.engineLoadPct).toString(16).padStart(2, '0').toUpperCase();
    const eec1Payload = `F0 ${trqHex} ${rpmHexLo} ${rpmHexHi} FF FF FF FF`;

    // 2. PGN 65265 (CCVS) - Road Speed
    const spdRaw = Math.round((diagnostics.roadSpeedMph / 0.621371) * 256);
    const spdHexLo = (spdRaw & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    const spdHexHi = ((spdRaw >> 8) & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    const ccvsPayload = `F7 ${spdHexLo} ${spdHexHi} 00 00 00 FF FF`;

    // 3. PGN 65248 (VD) - Total Odometer
    const odoKm = Math.round((diagnostics.totalOdometerMiles * 1.60934) / 0.125);
    const odoHex0 = (odoKm & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    const odoHex1 = ((odoKm >> 8) & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    const odoHex2 = ((odoKm >> 16) & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    const odoHex3 = ((odoKm >> 24) & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    const vdPayload = `${odoHex0} ${odoHex1} ${odoHex2} ${odoHex3} FF FF FF FF`;

    // 4. PGN 65257 (HOURS) - Total Engine Hours
    const hrsRaw = Math.round(diagnostics.totalEngineHours / 0.05);
    const hrsHex0 = (hrsRaw & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    const hrsHex1 = ((hrsRaw >> 8) & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    const hrsHex2 = ((hrsRaw >> 16) & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    const hrsHex3 = ((hrsRaw >> 24) & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    const hoursPayload = `${hrsHex0} ${hrsHex1} ${hrsHex2} ${hrsHex3} FF FF FF FF`;

    // 5. PGN 65262 (ET1) - Coolant Temp
    const tempC = Math.round((diagnostics.coolantTempF - 32) * (5 / 9)) + 40;
    const tempHex = Math.max(0, Math.min(255, tempC)).toString(16).padStart(2, '0').toUpperCase();
    const et1Payload = `${tempHex} FF FF FF FF FF FF FF`;

    // 6. PGN 65263 (EFL/P1) - Oil Pressure
    const oilKpa = Math.round((diagnostics.oilPressurePsi / 0.145038) / 4);
    const oilHex = Math.max(0, Math.min(255, oilKpa)).toString(16).padStart(2, '0').toUpperCase();
    const eflPayload = `FF ${oilHex} FF FF FF FF FF FF`;

    // 7. PGN 65271 (VEP) - Battery Voltage
    const vRaw = Math.round(diagnostics.batteryVoltage / 0.05);
    const vHexLo = (vRaw & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    const vHexHi = ((vRaw >> 8) & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    const vepPayload = `FF FF FF FF ${vHexLo} ${vHexHi} FF FF`;

    // 8. PGN 65226 (DM1) - DTCs & MIL
    const milBit = diagnostics.malfunctionIndicator ? '40' : '00';
    const dm1Payload = `${milBit} FF 00 00 00 00 FF FF`;

    return [
      {
        pgn: 61444,
        acronym: 'EEC1',
        name: 'Electronic Engine Controller 1',
        arbId: '0x0CF00400',
        priority: 3,
        source: '0x00 (Engine #1)',
        hex: eec1Payload,
        decoded: `Engine Speed: ${diagnostics.engineRpm.toFixed(0)} RPM | Actual Torque: ${diagnostics.engineLoadPct}%`,
        complianceNote: 'FMCSA § 395.26 Engine Power & Motion Detection',
      },
      {
        pgn: 65265,
        acronym: 'CCVS',
        name: 'Cruise Control / Vehicle Speed',
        arbId: '0x18FEF100',
        priority: 6,
        source: '0x00 (Engine #1)',
        hex: ccvsPayload,
        decoded: `Wheel Speed: ${diagnostics.roadSpeedMph.toFixed(1)} MPH (FMCSA 5.0 MPH trigger: ${diagnostics.roadSpeedMph > 5.0 ? 'TRIGGERED (DRIVING)' : 'INACTIVE (STATIONARY)'})`,
        complianceNote: 'FMCSA 5.0 MPH Automated Duty Status Transition Threshold',
      },
      {
        pgn: 65248,
        acronym: 'VD',
        name: 'Vehicle Distance / Cumulative Odometer',
        arbId: '0x18FEE000',
        priority: 6,
        source: '0x00 (Engine #1)',
        hex: vdPayload,
        decoded: `Total Odometer: ${diagnostics.totalOdometerMiles.toFixed(1)} Miles (${(diagnostics.totalOdometerMiles * 1.60934).toFixed(1)} KM)`,
        complianceNote: 'FMCSA § 395.26 Monotonic Cumulative Mileage Verification',
      },
      {
        pgn: 65257,
        acronym: 'HOURS',
        name: 'Total Engine Operating Hours',
        arbId: '0x18FEE900',
        priority: 6,
        source: '0x00 (Engine #1)',
        hex: hoursPayload,
        decoded: `Total Engine Hours: ${diagnostics.totalEngineHours.toFixed(1)} hrs`,
        complianceNote: 'FMCSA § 395.26 Engine Run Time & Power Event Baseline',
      },
      {
        pgn: 65262,
        acronym: 'ET1',
        name: 'Engine Temperature 1 (Coolant)',
        arbId: '0x18FEEE00',
        priority: 6,
        source: '0x00 (Engine #1)',
        hex: et1Payload,
        decoded: `Coolant Temp: ${diagnostics.coolantTempF.toFixed(0)}°F (${((diagnostics.coolantTempF - 32) * (5 / 9)).toFixed(0)}°C)`,
        complianceNote: 'Thermal Engine Operational Envelope Monitor',
      },
      {
        pgn: 65263,
        acronym: 'EFL/P1',
        name: 'Engine Fluid Level & Pressure (Oil)',
        arbId: '0x18FEEF00',
        priority: 6,
        source: '0x00 (Engine #1)',
        hex: eflPayload,
        decoded: `Oil Pressure: ${diagnostics.oilPressurePsi.toFixed(0)} PSI (${(diagnostics.oilPressurePsi * 6.89476).toFixed(0)} kPa)`,
        complianceNote: 'Lubrication Pressure Diagnostic Verification',
      },
      {
        pgn: 65271,
        acronym: 'VEP',
        name: 'Vehicle Electrical Power (Battery)',
        arbId: '0x18FEF700',
        priority: 6,
        source: '0x00 (Engine #1)',
        hex: vepPayload,
        decoded: `Battery Voltage: ${diagnostics.batteryVoltage.toFixed(1)} VDC`,
        complianceNote: 'Electrical Power Continuity Verification',
      },
      {
        pgn: 65226,
        acronym: 'DM1',
        name: 'Active Diagnostic Trouble Codes & MIL',
        arbId: '0x18FECA00',
        priority: 6,
        source: '0x00 (Engine #1)',
        hex: dm1Payload,
        decoded: `MIL Lamp: ${diagnostics.malfunctionIndicator ? 'ILLUMINATED (WARNING)' : 'OFF (NOMINAL)'} | Active DTC Count: ${diagnostics.activeDtcCount}`,
        complianceNote: 'FMCSA § 395.22 Diagnostic Malfunction Monitoring',
      },
    ];
  }, [diagnostics]);

  // Filter live broadcast frames based on user search query
  const filteredLiveCanFrames = useMemo(() => {
    if (!searchQuery.trim()) return liveCanFrames;
    const query = searchQuery.toLowerCase().trim();
    return liveCanFrames.filter(frame => {
      const matchPgn = `pgn ${frame.pgn}`.includes(query) || String(frame.pgn).includes(query);
      const matchAcronym = frame.acronym.toLowerCase().includes(query);
      const matchName = frame.name.toLowerCase().includes(query);
      const matchArbId = frame.arbId.toLowerCase().includes(query);
      const matchHex = frame.hex.toLowerCase().includes(query);
      const matchDecoded = frame.decoded.toLowerCase().includes(query);
      const matchNote = frame.complianceNote.toLowerCase().includes(query);
      return matchPgn || matchAcronym || matchName || matchArbId || matchHex || matchDecoded || matchNote;
    });
  }, [liveCanFrames, searchQuery]);

  // Scenario Presets
  const applyPresetScenario = (scenarioKey: string) => {
    setActiveScenario(scenarioKey);
    triggerHapticFeedback('subtle');

    switch (scenarioKey) {
      case 'driving-onset':
        onUpdateDiagnostics({
          roadSpeedMph: 18.5,
          engineRpm: 1250,
          engineLoadPct: 54,
          coolantTempF: 192,
          oilPressurePsi: 46,
          instantMpg: 6.8,
        });
        addComplianceLog(
          'EVENT_TYPE_1',
          'Automatic Driving Duty Status Transition',
          '49 CFR § 395.26(b) / § 395.24(b)',
          'Vehicle Road Speed exceeded 5.0 MPH threshold (18.5 MPH detected). ELD automatically switched duty status to DRIVING.',
          'TRIGGER'
        );
        break;

      case 'highway-cruise':
        onUpdateDiagnostics({
          roadSpeedMph: 65.2,
          engineRpm: 1440,
          engineLoadPct: 62,
          coolantTempF: 196,
          oilPressurePsi: 48,
          instantMpg: 7.4,
          malfunctionIndicator: false,
        });
        addComplianceLog(
          'EVENT_TYPE_2',
          '60-Minute Intermediate In-Motion Telematics Record',
          '49 CFR § 395.26(c)',
          'Vehicle in continuous motion at 65.2 MPH. Periodic hourly position & odometer snapshot anchored in audit ledger.',
          'INFO'
        );
        break;

      case 'dock-idle':
        onUpdateDiagnostics({
          roadSpeedMph: 0.0,
          engineRpm: 650,
          engineLoadPct: 16,
          coolantTempF: 180,
          oilPressurePsi: 32,
          instantMpg: 0.0,
        });
        addComplianceLog(
          'EVENT_TYPE_1_STATIONARY',
          'Stationary Idle Prompt Trigger (5-Minute Inactivity)',
          '49 CFR § 395.24(b)',
          'Vehicle road speed dropped to 0.0 MPH and remained stationary. ELD presents driver confirmation prompt for ON-DUTY / OFF-DUTY.',
          'INFO'
        );
        break;

      case 'engine-shutdown':
        onUpdateDiagnostics({
          roadSpeedMph: 0.0,
          engineRpm: 0,
          engineLoadPct: 0,
          oilPressurePsi: 0,
          batteryVoltage: 12.4,
        });
        addComplianceLog(
          'EVENT_TYPE_7',
          'Engine Power-Down / Ignition Off Event',
          '49 CFR § 395.26(a)',
          'Engine RPM dropped to 0. Final odometer and engine hours recorded to non-volatile local storage.',
          'TRIGGER'
        );
        break;

      case 'unidentified-driving':
        onUpdateDiagnostics({
          roadSpeedMph: 32.0,
          engineRpm: 1350,
          engineLoadPct: 50,
        });
        addComplianceLog(
          'UDR_TRIGGER',
          'Unidentified Driving Record (UDR) Generated',
          '49 CFR § 395.26(b) / § 395.32',
          'Vehicle movement detected (32.0 MPH) with no authenticated driver logged into the mobile terminal. Logged under UNIDENTIFIED DRIVER profile.',
          'WARNING'
        );
        break;

      case 'thermal-malfunction':
        onUpdateDiagnostics({
          coolantTempF: 232,
          oilPressurePsi: 14,
          engineRpm: 1950,
          engineLoadPct: 98,
          malfunctionIndicator: true,
          activeDtcCount: 1,
        });
        if (onInjectDtc) {
          onInjectDtc({
            id: `dtc-thermal-${Date.now().toString().slice(-4)}`,
            spn: 110,
            fmi: 0,
            description: 'Engine Coolant Temperature - Data Valid but Above Normal Operational Range (Severe Overheat)',
            severity: 'CRITICAL',
            status: 'ACTIVE',
            firstObserved: new Date().toLocaleTimeString(),
            occurrenceCount: 1,
          });
        }
        addComplianceLog(
          'DIAG_MALFUNCTION_CODE_2',
          'Engine Synchronization & Critical Thermal Anomaly',
          '49 CFR Part 395 Appendix A § 4.6.1.2',
          'Coolant temp reached 232°F and Oil Pressure collapsed to 14 PSI. DM1 Malfunction Indicator Lamp (MIL) activated.',
          'MALFUNCTION'
        );
        break;

      case 'j1939-dropout':
        addComplianceLog(
          'DIAG_MALFUNCTION_CODE_1',
          'Engine Synchronization Data Diagnostic Malfunction (Missing ECM Link)',
          '49 CFR Part 395 Appendix A § 4.6.1.1',
          'ELD lost communication with ECM CAN bus for > 30 cumulative minutes during 24-hour period. Data diagnostic indicator active.',
          'MALFUNCTION'
        );
        break;

      default:
        break;
    }
  };

  const handleManualInjectDtc = () => {
    if (!onInjectDtc) return;
    triggerHapticFeedback('subtle');
    onUpdateDiagnostics({
      malfunctionIndicator: true,
      activeDtcCount: diagnostics.activeDtcCount + 1,
    });
    onInjectDtc({
      id: `dtc-custom-${Date.now().toString().slice(-4)}`,
      spn: customSpn,
      fmi: customFmi,
      description: customDtcDesc,
      severity: 'WARNING',
      status: 'ACTIVE',
      firstObserved: new Date().toLocaleTimeString(),
      occurrenceCount: 1,
    });
    addComplianceLog(
      'DM1_DTC_INJECT',
      `Custom Diagnostic Trouble Code Injected: SPN ${customSpn} FMI ${customFmi}`,
      'SAE J1939-73 Diagnostic Layer',
      `${customDtcDesc} injected into ECM diagnostic message buffer.`,
      'WARNING'
    );
  };

  const handleCopyFrame = (hex: string, idx: number) => {
    triggerHapticFeedback('subtle');
    navigator.clipboard.writeText(hex);
    setCopiedFrameIndex(idx);
    setTimeout(() => setCopiedFrameIndex(null), 2000);
  };

  const handleExportCanTrace = () => {
    triggerHapticFeedback('subtle');
    const header = [
      '; =========================================================================',
      '; TRUCKWITHEASE™ VIRTUAL ELD HARDWARE J1939 CAN-BUS SIMULATION TRACE (.TRC)',
      `; Timestamp: ${new Date().toISOString()}`,
      '; Protocol: SAE J1939 (29-Bit Extended Arbitration IDs)',
      '; Baud Rate: 250000 bps',
      '; =========================================================================\n',
      'Time_Offset_ms  CAN_ID       Type  DLC  Data_Bytes                      Decoded_Parameters',
      '--------------------------------------------------------------------------------------------------',
    ];

    const rows = liveCanFrames.map((f, i) => {
      const timeMs = (i * 20).toString().padStart(8, ' ');
      const arb = f.arbId.padEnd(12, ' ');
      const hex = f.hex.padEnd(28, ' ');
      return `${timeMs}        ${arb}  Ext   8    ${hex}  ${f.acronym}: ${f.decoded}`;
    });

    const content = [...header, ...rows].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VIRTUAL_ELD_J1939_TRACE_${new Date().toISOString().replace(/[:.]/g, '-')}.trc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (onShowToast) onShowToast('EXPORTED VIRTUAL J1939 CAN TRACE FILE (.TRC)');
  };

  return (
    <div className="bg-[#090D14] border-2 border-[#1E293B] rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 font-mono text-xs text-[#9CA3AF]">
      
      {/* 1. TOP HEADER & VIRTUAL HARDWARE STATUS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1A2536] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-[#C9A84C]/20 border border-[#C9A84C]/60 text-[#C9A84C] font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 rounded">
              <Cpu className="w-3.5 h-3.5 text-[#C9A84C]" />
              VIRTUAL ELD HARDWARE TRANSCEIVER
            </span>
            <span className="px-2.5 py-0.5 bg-sky-950/80 border border-sky-500/50 text-sky-400 font-mono text-[10px] font-bold uppercase rounded flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              EMBEDDED CAN ENGINE SIMULATOR
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-950/80 border border-emerald-500/50 text-[#00FF66] font-mono text-[10px] font-bold uppercase rounded">
              NO PHYSICAL DONGLE REQUIRED
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3 font-[Oswald]">
            <span>Virtual ELD Hardware Debug &amp; J1939 CAN Generator</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse" />
          </h2>
          <p className="text-xs text-[#94A3B8] max-w-3xl">
            Test automated FMCSA 49 CFR Part 395 compliance triggers (5.0 MPH driving transition, engine power status, intermediate records, and diagnostic malfunctions) with interactive vehicle parameters.
          </p>
        </div>

        {/* Quick Trace Export */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleExportCanTrace}
            className="px-3.5 py-2 bg-[#142334] hover:bg-[#1D3249] text-sky-300 hover:text-white border border-sky-500/50 text-xs font-bold uppercase rounded transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Download simulated J1939 CAN frame trace in Vector .TRC format"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Export CAN Trace (.trc)</span>
          </button>
        </div>
      </div>

      {/* 2. COMPLIANCE SCENARIO QUICK PRESETS */}
      <div className="bg-[#05080E] p-4 rounded-xl border border-[#162234] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-xs uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C9A84C]" />
            <span>FMCSA Compliance Scenario Presets (Instant Triggers)</span>
          </span>
          <span className="text-[10px] text-[#6E8094]">
            Click any scenario to instantly modulate CAN frames &amp; test ELD state transitions
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          {[
            {
              id: 'driving-onset',
              label: '1. Auto Driving Onset',
              sub: '18.5 MPH (> 5.0 MPH)',
              color: 'hover:border-emerald-500 text-emerald-300',
              activeBg: 'bg-emerald-950/80 border-emerald-500 text-emerald-200',
            },
            {
              id: 'highway-cruise',
              label: '2. Highway Cruise',
              sub: '65 MPH (Hourly Record)',
              color: 'hover:border-sky-500 text-sky-300',
              activeBg: 'bg-sky-950/80 border-sky-500 text-sky-200',
            },
            {
              id: 'dock-idle',
              label: '3. Stationary Idle',
              sub: '0 MPH (5-Min Timeout)',
              color: 'hover:border-amber-500 text-amber-300',
              activeBg: 'bg-amber-950/80 border-amber-500 text-amber-200',
            },
            {
              id: 'engine-shutdown',
              label: '4. Engine Shutdown',
              sub: '0 RPM (Power-Down)',
              color: 'hover:border-purple-500 text-purple-300',
              activeBg: 'bg-purple-950/80 border-purple-500 text-purple-200',
            },
            {
              id: 'unidentified-driving',
              label: '5. Unidentified Motion',
              sub: '32 MPH (No Driver)',
              color: 'hover:border-rose-500 text-rose-300',
              activeBg: 'bg-rose-950/80 border-rose-500 text-rose-200',
            },
            {
              id: 'thermal-malfunction',
              label: '6. Overheat & MIL',
              sub: '232°F / 14 PSI',
              color: 'hover:border-rose-600 text-rose-400',
              activeBg: 'bg-rose-950 border-rose-500 text-white animate-pulse',
            },
            {
              id: 'j1939-dropout',
              label: '7. CAN Bus Dropout',
              sub: 'Missing ECM Link',
              color: 'hover:border-amber-600 text-amber-400',
              activeBg: 'bg-amber-950 border-amber-500 text-white',
            },
          ].map(scenario => (
            <button
              key={scenario.id}
              type="button"
              onClick={() => applyPresetScenario(scenario.id)}
              className={`p-2.5 rounded-lg border text-left transition-all active:scale-95 cursor-pointer ${
                activeScenario === scenario.id
                  ? scenario.activeBg
                  : `bg-[#0B1017] border-[#1A2536] ${scenario.color} hover:bg-[#121A26]`
              }`}
            >
              <div className="font-bold text-[11px] truncate">{scenario.label}</div>
              <div className="text-[10px] text-[#718296] truncate mt-0.5">{scenario.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. INTERACTIVE ENGINE PARAMETER SLIDERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Speed Slider (FMCSA 5.0 MPH Driving Trigger) */}
        <div className="bg-[#0B1017] p-4 rounded-xl border border-[#1A2536] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-xs uppercase flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-sky-400" />
              <span>Vehicle Road Speed (CCVS)</span>
            </span>
            <span className="text-lg font-black text-white">
              {diagnostics.roadSpeedMph.toFixed(1)}{' '}
              <span className="text-[10px] text-[#6E8094]">MPH</span>
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={85}
            step={0.5}
            value={diagnostics.roadSpeedMph}
            onChange={e => {
              const speed = parseFloat(e.target.value);
              onUpdateDiagnostics({ roadSpeedMph: speed });
              if (speed > 5.0 && diagnostics.roadSpeedMph <= 5.0) {
                addComplianceLog(
                  'EVENT_TYPE_1_DRIVING',
                  'Automated DRIVING Duty Status Transition',
                  '49 CFR § 395.26(b)',
                  `Speed crossed 5.0 MPH threshold (${speed.toFixed(1)} MPH). ELD transitioned to DRIVING.`,
                  'TRIGGER'
                );
              }
            }}
            className="w-full accent-sky-400 cursor-pointer h-2 bg-[#1A2536] rounded-lg"
          />

          <div className="flex items-center justify-between text-[10px] pt-1">
            <span className={diagnostics.roadSpeedMph > 5.0 ? 'text-[#00FF66] font-bold' : 'text-[#6E8094]'}>
              {diagnostics.roadSpeedMph > 5.0 ? '● AUTOMATIC DRIVING ACTIVE' : '○ Stationary / Parked'}
            </span>
            <div className="flex items-center gap-1">
              {[0, 4.5, 5.0, 15, 65, 75].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onUpdateDiagnostics({ roadSpeedMph: v })}
                  className="px-1.5 py-0.5 rounded bg-[#141C28] hover:bg-[#1E2B3D] text-[9px] text-[#9CA3AF] hover:text-white border border-[#243346]"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Engine RPM Slider (Power Status Trigger) */}
        <div className="bg-[#0B1017] p-4 rounded-xl border border-[#1A2536] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-xs uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#C9A84C]" />
              <span>Engine Speed (EEC1 RPM)</span>
            </span>
            <span className="text-lg font-black text-[#C9A84C]">
              {Math.round(diagnostics.engineRpm)}{' '}
              <span className="text-[10px] text-[#6E8094]">RPM</span>
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={2400}
            step={25}
            value={diagnostics.engineRpm}
            onChange={e => {
              const rpm = parseInt(e.target.value, 10);
              onUpdateDiagnostics({ engineRpm: rpm });
              if (rpm === 0 && diagnostics.engineRpm > 0) {
                addComplianceLog(
                  'EVENT_TYPE_7',
                  'Engine Power-Down Detected',
                  '49 CFR § 395.26(a)',
                  'Engine RPM dropped to 0. Power-down sequence initiated.',
                  'TRIGGER'
                );
              } else if (rpm > 0 && diagnostics.engineRpm === 0) {
                addComplianceLog(
                  'EVENT_TYPE_6',
                  'Engine Power-Up Ignition Detected',
                  '49 CFR § 395.26(a)',
                  `Engine ignited at ${rpm} RPM. Power-up baseline recorded.`,
                  'TRIGGER'
                );
              }
            }}
            className="w-full accent-[#C9A84C] cursor-pointer h-2 bg-[#1A2536] rounded-lg"
          />

          <div className="flex items-center justify-between text-[10px] pt-1">
            <span className={diagnostics.engineRpm > 0 ? 'text-[#00FF66] font-bold' : 'text-rose-400 font-bold'}>
              {diagnostics.engineRpm > 0 ? '● ENGINE POWER ON' : '○ ENGINE OFF'}
            </span>
            <div className="flex items-center gap-1">
              {[0, 650, 1200, 1440, 1850].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onUpdateDiagnostics({ engineRpm: v })}
                  className="px-1.5 py-0.5 rounded bg-[#141C28] hover:bg-[#1E2B3D] text-[9px] text-[#9CA3AF] hover:text-white border border-[#243346]"
                >
                  {v === 0 ? 'Off' : v === 650 ? 'Idle' : v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Engine Load & Torque % */}
        <div className="bg-[#0B1017] p-4 rounded-xl border border-[#1A2536] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-xs uppercase flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Engine Load &amp; Torque</span>
            </span>
            <span className="text-lg font-black text-purple-300">
              {diagnostics.engineLoadPct}%
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={diagnostics.engineLoadPct}
            onChange={e => onUpdateDiagnostics({ engineLoadPct: parseInt(e.target.value, 10) })}
            className="w-full accent-purple-400 cursor-pointer h-2 bg-[#1A2536] rounded-lg"
          />

          <div className="flex items-center justify-between text-[10px] pt-1 text-[#6E8094]">
            <span>Actual Torque PGN 61444</span>
            <div className="flex items-center gap-1">
              {[15, 45, 65, 95].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onUpdateDiagnostics({ engineLoadPct: v })}
                  className="px-1.5 py-0.5 rounded bg-[#141C28] hover:bg-[#1E2B3D] text-[9px] text-[#9CA3AF] hover:text-white border border-[#243346]"
                >
                  {v}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Coolant Temperature */}
        <div className="bg-[#0B1017] p-4 rounded-xl border border-[#1A2536] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-xs uppercase flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Coolant Temp (ET1)</span>
            </span>
            <span className={`text-lg font-black ${diagnostics.coolantTempF > 220 ? 'text-rose-400' : 'text-white'}`}>
              {diagnostics.coolantTempF.toFixed(0)}°F
            </span>
          </div>

          <input
            type="range"
            min={120}
            max={245}
            value={diagnostics.coolantTempF}
            onChange={e => onUpdateDiagnostics({ coolantTempF: parseInt(e.target.value, 10) })}
            className="w-full accent-amber-400 cursor-pointer h-2 bg-[#1A2536] rounded-lg"
          />

          <div className="flex items-center justify-between text-[10px] pt-1">
            <span className={diagnostics.coolantTempF > 220 ? 'text-rose-400 font-bold' : 'text-[#6E8094]'}>
              {diagnostics.coolantTempF > 220 ? '⚠️ OVERHEAT WARNING' : 'Nominal: 180°F - 205°F'}
            </span>
            <button
              type="button"
              onClick={() => onUpdateDiagnostics({ coolantTempF: 194 })}
              className="px-2 py-0.5 rounded bg-[#141C28] text-[9px] text-[#C9A84C] border border-[#243346]"
            >
              Reset 194°F
            </button>
          </div>
        </div>

        {/* Oil Pressure */}
        <div className="bg-[#0B1017] p-4 rounded-xl border border-[#1A2536] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-xs uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Oil Pressure (EFL/P1)</span>
            </span>
            <span className={`text-lg font-black ${diagnostics.oilPressurePsi < 20 ? 'text-rose-400' : 'text-white'}`}>
              {diagnostics.oilPressurePsi.toFixed(0)} PSI
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={80}
            value={diagnostics.oilPressurePsi}
            onChange={e => onUpdateDiagnostics({ oilPressurePsi: parseInt(e.target.value, 10) })}
            className="w-full accent-emerald-400 cursor-pointer h-2 bg-[#1A2536] rounded-lg"
          />

          <div className="flex items-center justify-between text-[10px] pt-1">
            <span className={diagnostics.oilPressurePsi < 20 ? 'text-rose-400 font-bold' : 'text-[#6E8094]'}>
              {diagnostics.oilPressurePsi < 20 ? '⚠️ LOW OIL ALARM' : 'Nominal: 35 - 55 PSI'}
            </span>
            <button
              type="button"
              onClick={() => onUpdateDiagnostics({ oilPressurePsi: 45 })}
              className="px-2 py-0.5 rounded bg-[#141C28] text-[9px] text-emerald-400 border border-[#243346]"
            >
              Reset 45 PSI
            </button>
          </div>
        </div>

        {/* Cumulative Odometer & Engine Hours Step Modulators */}
        <div className="bg-[#0B1017] p-4 rounded-xl border border-[#1A2536] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-xs uppercase flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#00FF66]" />
              <span>Odometer &amp; Engine Hours</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-[#070B11] border border-[#172332]">
              <span className="text-[9px] text-[#6E8094] block uppercase font-bold">Odometer (VD)</span>
              <span className="text-white font-bold text-xs">{diagnostics.totalOdometerMiles.toFixed(1)} MI</span>
              <div className="flex items-center gap-1 mt-1.5">
                {[1.0, 10.0, 50.0].map(inc => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback('tick');
                      onUpdateDiagnostics({ totalOdometerMiles: diagnostics.totalOdometerMiles + inc });
                    }}
                    className="px-1.5 py-0.5 rounded bg-[#121D2B] text-[9px] font-bold text-[#00FF66] border border-[#1E2F44]"
                  >
                    +{inc}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2 rounded bg-[#070B11] border border-[#172332]">
              <span className="text-[9px] text-[#6E8094] block uppercase font-bold">Hours (HOURS)</span>
              <span className="text-white font-bold text-xs">{diagnostics.totalEngineHours.toFixed(1)} HRS</span>
              <div className="flex items-center gap-1 mt-1.5">
                {[0.1, 1.0, 5.0].map(inc => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback('tick');
                      onUpdateDiagnostics({ totalEngineHours: diagnostics.totalEngineHours + inc });
                    }}
                    className="px-1.5 py-0.5 rounded bg-[#121D2B] text-[9px] font-bold text-[#C9A84C] border border-[#1E2F44]"
                  >
                    +{inc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. J1939 PGN & SPN SEARCH & TROUBLESHOOTING FILTER BAR */}
      <div className="bg-[#070B12] p-4 rounded-xl border border-sky-500/40 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-white font-bold uppercase text-xs">
              J1939 PGN &amp; SPN Parameter Search Filter
            </span>
            <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-500/30 text-sky-300 text-[10px] font-bold">
              {filteredLiveCanFrames.length} Frames • {filteredDecodedParameters.length} SPNs
            </span>
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[10px] text-amber-400 hover:text-amber-300 underline font-bold flex items-center gap-1 self-start sm:self-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Search Filter</span>
            </button>
          )}
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            id="virtual-eld-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search PGN (e.g. 61444, 65265, 65266), SPN (e.g. 190, 84, 183, 100), or keyword (RPM, Fuel, Oil, Speed)..."
            className="w-full bg-[#0E1522] border border-[#23354E] focus:border-sky-400 pl-9 pr-8 py-2 text-white text-xs font-mono rounded-lg outline-none placeholder:text-[#4B5E78] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8899AA] hover:text-white p-1"
              title="Clear search query"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Search Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] custom-scrollbar">
          <span className="text-[#64748B] uppercase font-bold mr-1 shrink-0">Quick Chips:</span>
          {[
            { label: 'ALL', q: '' },
            { label: 'PGN 61444 (RPM)', q: '61444' },
            { label: 'PGN 65266 (Fuel Rate)', q: '65266' },
            { label: 'PGN 65263 (Oil Press)', q: '65263' },
            { label: 'PGN 65265 (Speed)', q: '65265' },
            { label: 'PGN 65262 (Coolant)', q: '65262' },
            { label: 'PGN 65248 (Odometer)', q: '65248' },
            { label: 'PGN 65257 (Hours)', q: '65257' },
            { label: 'PGN 65271 (Battery)', q: '65271' },
            { label: 'PGN 65226 (DTCs)', q: '65226' },
            { label: 'SPN 190 (RPM)', q: '190' },
            { label: 'SPN 183 (Fuel)', q: '183' },
            { label: 'SPN 100 (Oil)', q: '100' },
            { label: 'SPN 84 (Speed)', q: '84' },
            { label: 'SPN 110 (Temp)', q: '110' },
          ].map(chip => (
            <button
              key={chip.label}
              type="button"
              onClick={() => {
                triggerHapticFeedback('tick');
                setSearchQuery(chip.q);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all shrink-0 border ${
                searchQuery === chip.q
                  ? 'bg-sky-500/20 text-sky-300 border-sky-400'
                  : 'bg-[#0E1520] text-[#718296] border-[#1C283A] hover:text-white'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. J1939 PARAMETER GROUP NUMBER (PGN) DECODER & HEX FRAME ANALYZER */}
      <div className="bg-[#05080E] p-4 sm:p-6 rounded-xl border-2 border-[#1E2E42] shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#162234] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-[#C9A84C]/20 border border-[#C9A84C]/50 text-[#C9A84C] text-[10px] font-bold uppercase rounded flex items-center gap-1.5">
                <Binary className="w-3.5 h-3.5" />
                SAE J1939-71 APPLICATION LAYER DECODER
              </span>
              <span className="px-2 py-0.5 bg-sky-950/80 border border-sky-500/40 text-sky-300 text-[10px] font-bold uppercase rounded">
                SPN SCALING &amp; BITMASK ENGINE
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold uppercase text-white tracking-wide flex items-center gap-2 font-[Oswald]">
              <span>J1939 PGN Parameter Decoder &amp; Hex Frame Analyzer</span>
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Decodes 29-bit CAN arbitration IDs and 8-byte hexadecimal payloads into human-readable parameters: RPM, Fuel Rate (GPH), Oil Pressure (PSI), Coolant Temp, Odometer, Voltage, and Active DTCs.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              id="apply-decoded-to-sim-btn"
              onClick={handleApplyDecodedToSimulation}
              className="px-3.5 py-2 bg-[#FFE600] hover:bg-[#FFD700] text-black text-xs font-mono font-black uppercase rounded transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)] flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Apply all decoded parameter values (RPM, Speed, Fuel, Oil, Temps) directly into the live virtual engine simulation"
            >
              <Zap className="w-4 h-4 text-black" />
              <span>Apply to Virtual Engine</span>
            </button>

            <button
              type="button"
              onClick={handleCopyDecodedSummary}
              className="px-3 py-2 bg-[#121A26] hover:bg-[#1A2638] text-gray-200 hover:text-white border border-[#233145] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Copy decoded J1939 parameters summary"
            >
              {copiedDecodedText ? <Check className="w-3.5 h-3.5 text-[#00FF66]" /> : <Copy className="w-3.5 h-3.5 text-[#9CA3AF]" />}
              <span>{copiedDecodedText ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>
        </div>

        {/* Decoder Input Controls Strip */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          {/* Preset Selector Dropdown (4 cols) */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-[10px] text-[#6E8094] uppercase font-bold flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span>Load Preset J1939 PGN Frame</span>
            </label>
            <select
              value={selectedPresetId}
              onChange={e => handleSelectPreset(e.target.value)}
              className="w-full bg-[#0E1520] border border-[#223044] focus:border-[#C9A84C] text-[#C9A84C] text-xs rounded px-2.5 py-2 outline-none font-mono font-bold truncate"
            >
              {J1939_PRESET_FRAMES.map(preset => (
                <option key={preset.id} value={preset.id}>
                  {preset.acronym} — {preset.title}
                </option>
              ))}
            </select>
          </div>

          {/* 29-bit Arbitration ID / CAN ID (3 cols) */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[10px] text-[#6E8094] uppercase font-bold flex items-center justify-between">
              <span>CAN Arbitration ID (Hex)</span>
              <span className="text-sky-400 font-bold">PGN: {decodedResult.pgn}</span>
            </label>
            <input
              type="text"
              value={decoderArbId}
              onChange={e => {
                setDecoderArbId(e.target.value);
                setSelectedPresetId('custom');
              }}
              placeholder="e.g. 0x0CF00400"
              className="w-full bg-[#0E1520] border border-[#223044] focus:border-sky-500 text-sky-300 text-xs rounded px-2.5 py-2 outline-none font-mono font-bold"
            />
          </div>

          {/* 8-Byte Hex Payload (5 cols) */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-[10px] text-[#6E8094] uppercase font-bold flex items-center justify-between">
              <span>8-Byte Raw Hex Payload</span>
              <span className="text-[#00FF66] font-bold">8 Bytes (DLC 8)</span>
            </label>
            <input
              type="text"
              value={decoderPayloadHex}
              onChange={e => {
                setDecoderPayloadHex(e.target.value);
                setSelectedPresetId('custom');
              }}
              placeholder="e.g. F0 3E 00 2D FF FF FF FF"
              className="w-full bg-[#0E1520] border border-[#223044] focus:border-[#00FF66] text-[#00FF66] text-xs rounded px-2.5 py-2 outline-none font-mono font-bold tracking-wider"
            />
          </div>
        </div>

        {/* Decoded PGN Header Card */}
        <div className="p-3 sm:p-4 bg-[#080D14] border border-[#182638] rounded-xl grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[9px] text-[#6E8094] uppercase font-bold block">Parameter Group</span>
            <span className="text-white font-black text-sm">{decodedResult.pgnAcronym}</span>
            <span className="text-[10px] text-[#C9A84C] block font-bold">PGN {decodedResult.pgn} ({decodedResult.pgnHex})</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[9px] text-[#6E8094] uppercase font-bold block">Priority &amp; PDU Format</span>
            <span className="text-sky-300 font-bold text-xs">Priority {decodedResult.priority}</span>
            <span className="text-[10px] text-[#6E8094] block">PF: {decodedResult.pduFormat} • PS: {decodedResult.pduSpecific}</span>
          </div>

          <div className="space-y-0.5 sm:col-span-2">
            <span className="text-[9px] text-[#6E8094] uppercase font-bold block">Transmitting Source Node</span>
            <span className="text-[#00FF66] font-bold text-xs truncate block">{decodedResult.sourceAddressName}</span>
            <span className="text-[10px] text-[#6E8094] block">SA: {decodedResult.sourceAddressHex} ({decodedResult.sourceAddress})</span>
          </div>

          <div className="space-y-0.5 sm:col-span-2">
            <span className="text-[9px] text-[#6E8094] uppercase font-bold block">FMCSA § 395 Compliance Role</span>
            <p className="text-[10px] text-gray-300 leading-tight">
              {decodedResult.fmcsaComplianceImpact || 'Auxiliary engine telematics broadcast frame.'}
            </p>
          </div>
        </div>

        {/* Interactive 8-Byte Breakdown Strip */}
        <div className="space-y-1.5">
          <div className="text-[10px] text-[#6E8094] uppercase font-bold flex items-center justify-between">
            <span>Hex Payload Byte Alignment (Little Endian J1939 Format)</span>
            <span>DLC: 8 Bytes</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 font-mono">
            {decodedResult.bytes.map((byte, bi) => {
              const hexStr = byte.toString(16).padStart(2, '0').toUpperCase();
              const isUnused = byte === 0xFF;
              return (
                <div
                  key={bi}
                  className={`p-2 rounded border text-center transition-all ${
                    isUnused
                      ? 'bg-[#06090E] border-[#141C28] text-[#425266]'
                      : 'bg-[#0B1522] border-sky-500/40 text-white shadow-sm'
                  }`}
                >
                  <div className="text-[9px] text-[#64748B] uppercase font-bold">Byte {bi + 1}</div>
                  <div className={`text-sm font-black mt-0.5 ${isUnused ? 'text-[#425266]' : 'text-[#00FF66]'}`}>
                    0x{hexStr}
                  </div>
                  <div className="text-[9px] text-[#8697A8] truncate mt-0.5">
                    {byte} ({byte.toString(2).padStart(8, '0')})
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Decoded SPN Parameters Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#6E8094]">
            <span className="font-bold text-white uppercase flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>Decoded Suspect Parameter Numbers (SPN Mappings)</span>
            </span>
            <span>
              Showing <strong className="text-white">{filteredDecodedParameters.length}</strong> of {decodedResult.parameters.length} Parameters
            </span>
          </div>

          <div className="border border-[#172336] rounded-lg overflow-x-auto bg-[#070B11]">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#0D1420] text-[#6E8094] border-b border-[#1A2536] text-[10px] uppercase font-bold">
                  <th className="py-2.5 px-3">SPN #</th>
                  <th className="py-2.5 px-3">Parameter Name</th>
                  <th className="py-2.5 px-3">Byte / Bits</th>
                  <th className="py-2.5 px-3">Raw Hex / Int</th>
                  <th className="py-2.5 px-3">Scaling &amp; Offset</th>
                  <th className="py-2.5 px-3">Decoded Physical Value</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#131C28]">
                {filteredDecodedParameters.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-[#6B7D94]">
                      No decoded SPN parameters match search query "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredDecodedParameters.map((param, pi) => {
                    const isEngine = param.category === 'ENGINE';
                    const isFuel = param.category === 'FUEL';
                    const isPress = param.category === 'PRESSURES';
                    const isTemp = param.category === 'TEMPS';
                    const isOdo = param.category === 'ODOMETER';
                    const isFault = param.category === 'FAULTS';

                    return (
                      <tr key={pi} className="hover:bg-[#0E1724] transition-colors">
                        <td className="py-2.5 px-3 font-bold text-[#C9A84C]">
                          {param.spn > 0 ? `SPN ${param.spn}` : 'DATA'}
                        </td>
                        <td className="py-2.5 px-3 text-white font-bold">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isEngine
                                  ? 'bg-sky-400'
                                  : isFuel
                                  ? 'bg-emerald-400'
                                  : isPress
                                  ? 'bg-amber-400'
                                  : isTemp
                                  ? 'bg-rose-400'
                                  : isOdo
                                  ? 'bg-purple-400'
                                  : isFault
                                  ? 'bg-rose-500 animate-pulse'
                                  : 'bg-[#64748B]'
                              }`}
                            />
                            <span>{param.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-[#8697A8] text-[11px]">
                          {param.bytePosition}
                          {param.bitRange && <span className="text-[10px] text-[#55677B] block">{param.bitRange}</span>}
                        </td>
                        <td className="py-2.5 px-3 text-sky-300 text-[11px]">
                          {param.rawHex} <span className="text-[#55677B]">({param.rawInteger})</span>
                        </td>
                        <td className="py-2.5 px-3 text-[#8697A8] text-[10px]">
                          <div>{param.resolution}</div>
                          {param.offset !== '0' && <div className="text-[#55677B]">Offset: {param.offset}</div>}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-white font-black text-xs bg-black/40 px-2 py-0.5 rounded border border-[#1A2536] inline-block">
                            {param.formattedDisplay}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              param.status === 'VALID'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                : param.status === 'OUT_OF_RANGE'
                                ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                                : 'bg-[#151D2A] text-[#6E8094] border border-[#233145]'
                            }`}
                          >
                            {param.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. LIVE J1939 CAN FRAME BINARY / HEX VISUALIZER MATRIX */}
      <div className="bg-[#05080E] p-4 sm:p-5 rounded-xl border border-[#162234] space-y-4">
        <div className="flex items-center justify-between border-b border-[#141E2C] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#00FF66]" />
            <span className="text-white font-bold uppercase text-xs">
              Live J1939 CAN-Bus Broadcast Frames (29-Bit Extended Arbitration ID Matrix)
            </span>
            <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px] text-sky-400 font-mono">
              {filteredLiveCanFrames.length} of {liveCanFrames.length}
            </span>
          </div>
          <span className="text-[10px] text-[#6E8094]">
            Broadcast Frequency: 10 Hz per PGN • 250,000 bps Physical Bus
          </span>
        </div>

        {filteredLiveCanFrames.length === 0 ? (
          <div className="py-8 text-center text-[#64748B]">
            <Terminal className="w-8 h-8 mx-auto mb-2 text-[#243346]" />
            <p>No broadcast frames match search query "{searchQuery}".</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-2 text-sky-400 hover:underline text-xs font-bold"
            >
              Clear Search Query
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredLiveCanFrames.map((frame, idx) => (
              <div
                key={frame.pgn}
                className="p-3 bg-[#080D14] border border-[#172336] hover:border-[#2A3F5E] rounded-lg space-y-2 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-[#C9A84C]/20 border border-[#C9A84C]/50 text-[#C9A84C] font-bold text-[10px] rounded">
                      PGN {frame.pgn}
                    </span>
                    <span className="text-white font-bold text-xs">{frame.acronym}</span>
                    <span className="text-[10px] text-[#6E8094]">({frame.name})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-sky-400 font-mono">{frame.arbId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyFrame(frame.hex, idx)}
                      className="p-1 rounded bg-[#101824] hover:bg-[#1C2A3D] text-[#8697A8] hover:text-white transition-colors"
                      title="Copy 8-byte raw hex payload"
                    >
                      {copiedFrameIndex === idx ? <Check className="w-3 h-3 text-[#00FF66]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Hex Payload Strip */}
                <div className="p-2 bg-[#030508] border border-[#121B28] rounded flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2 flex-wrap">
                    {frame.hex.split(' ').map((byte, bi) => (
                      <span
                        key={bi}
                        className={`text-xs font-bold ${
                          byte === 'FF' ? 'text-[#3E4F63]' : 'text-[#00FF66]'
                        }`}
                      >
                        {byte}
                      </span>
                    ))}
                  </div>
                  <span className="text-[9px] text-[#55677B] uppercase">8 Bytes</span>
                </div>

                {/* Decoded Physical Metric */}
                <div className="text-[11px] text-[#CBD5E1] flex items-center justify-between">
                  <span>{frame.decoded}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. COMPLIANCE TRIGGER AUDIT STREAM LOGS */}
      <div className="bg-[#05080E] p-4 sm:p-5 rounded-xl border border-[#162234] space-y-3">
        <div className="flex items-center justify-between border-b border-[#141E2C] pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />
            <span className="text-white font-bold uppercase text-xs">
              Simulated FMCSA Compliance Event Audit Trail
            </span>
            <span className="px-1.5 py-0.2 rounded bg-[#131E2C] text-sky-300 text-[9px]">
              {complianceLogs.length} Events
            </span>
          </div>
          {complianceLogs.length > 0 && (
            <button
              type="button"
              onClick={() => setComplianceLogs([])}
              className="text-[10px] text-rose-400 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Event Log</span>
            </button>
          )}
        </div>

        {complianceLogs.length === 0 ? (
          <div className="py-6 text-center text-[#55677B]">
            <Activity className="w-6 h-6 mx-auto mb-2 text-[#243346]" />
            <p>No compliance events triggered yet. Move the speed slider or click a scenario preset above.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {complianceLogs.map(log => (
              <div
                key={log.id}
                className={`p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs font-mono ${
                  log.severity === 'MALFUNCTION'
                    ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                    : log.severity === 'WARNING'
                    ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                    : log.severity === 'TRIGGER'
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                    : 'bg-[#0A1017] border-[#182536] text-sky-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#6E8094]">{log.timestamp}</span>
                    <span className="px-1.5 py-0.2 rounded bg-black/40 text-[9px] font-bold text-white uppercase">
                      {log.eventCode}
                    </span>
                    <strong className="text-white text-xs">{log.eventTypeDescription}</strong>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] pl-1">{log.triggerCondition}</p>
                </div>
                <span className="text-[9px] text-[#6E8094] shrink-0 font-bold sm:text-right">
                  {log.standardReference}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
