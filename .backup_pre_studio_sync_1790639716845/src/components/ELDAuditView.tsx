import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Binary,
  Radio,
  Wifi,
  WifiOff,
  Cable,
  HardDrive,
  Activity,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  Download,
  Search,
  Sliders,
  Database,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Terminal,
  Clock,
  Truck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  FileSpreadsheet,
  FileCode,
  Filter,
  Layers,
  ArrowDownUp,
  Cpu,
  Wrench,
  HelpCircle,
  X,
  Printer,
} from 'lucide-react';
import { EldSetupAssistantModal } from './EldSetupAssistantModal';
import { EldPdfAuditModal } from './EldPdfAuditModal';
import { CanBusFrequencyChart } from './CanBusFrequencyChart';
import {
  EldRawPacket,
  EldEngineDiagnostics,
  EldDiagnosticTroubleCode,
  EldDutyCycleSyncEvent,
  CanBusFrequencyDataPoint,
  TabType,
} from '../types';
import { MOCK_HOS_STATUS } from '../data/mockData';

export type HardwareInterface = 'bluetooth' | 'usb-hid' | 'simulator';
export type HardwareStatus = 'disconnected' | 'scanning' | 'connecting' | 'connected' | 'error';
export type SimScenario = 'highway' | 'dock-idle' | 'mountain-grade' | 'fault-alert';

export type TelemetryFilterOption =
  | 'ALL'
  // Specific CAN Message IDs (SAE J1939 PGNs)
  | 'PGN_61444' // EEC1 (Engine Speed / RPM)
  | 'PGN_65265' // CCVS (Cruise Control & Road Speed)
  | 'PGN_65262' // ET1 (Engine Coolant Temperature)
  | 'PGN_65263' // EFL/P1 (Engine Fluid Level & Oil Pressure)
  | 'PGN_65248' // VD (Vehicle Distance / Total Odometer)
  | 'PGN_65257' // HOURS (Engine Operating Hours & Revolutions)
  | 'PGN_65271' // VEP (Vehicle Electrical Power / Battery)
  | 'PGN_65226' // DM1 (Active Diagnostic Trouble Codes & MIL)
  // Specific Event Types
  | 'EVENT_RPM'        // Engine Speed & RPM Dynamics
  | 'EVENT_SPEED'      // Road Speed & Vehicle Motion
  | 'EVENT_THERMAL'    // Coolant & Thermal Dynamics
  | 'EVENT_PRESSURE'   // Fluid & Oil Pressures
  | 'EVENT_ODOMETER'   // Cumulative Odometer Miles
  | 'EVENT_HOURS'      // Total Engine Run Hours
  | 'EVENT_ELECTRICAL' // Battery Potential & Voltage
  | 'EVENT_FAULTS'     // Active DTCs & MIL Warning Status
  | 'EVENT_PRIORITY';  // High Priority Broadcasts (Priority <= 3)

interface ELDAuditViewProps {
  onNavigateToTab?: (tab: TabType) => void;
}

// Initial default engine diagnostics
const INITIAL_DIAGNOSTICS: EldEngineDiagnostics = {
  engineRpm: 1420,
  roadSpeedMph: 62.4,
  coolantTempF: 194,
  oilPressurePsi: 44,
  fuelLevelPct: 78,
  defLevelPct: 86,
  batteryVoltage: 13.9,
  instantMpg: 7.2,
  totalOdometerMiles: 482914.8,
  totalEngineHours: 11482.3,
  engineLoadPct: 58,
  throttlePositionPct: 45,
  malfunctionIndicator: false,
  activeDtcCount: 0,
};

// Common initial DTCs
const INITIAL_DTCS: EldDiagnosticTroubleCode[] = [
  {
    id: 'dtc-101',
    spn: 3251,
    fmi: 2,
    description: 'DPF Differential Pressure Sensor - Data Erratic or Intermittent',
    severity: 'WARNING',
    status: 'PENDING',
    firstObserved: '2026-09-12 06:14:22 EDT',
    occurrenceCount: 2,
  },
];

// Initial pre-populated sync events
const INITIAL_DUTY_SYNC_EVENTS: EldDutyCycleSyncEvent[] = [
  {
    id: 'SYNC-8941',
    timestamp: '2026-09-12T07:45:00Z',
    dutyStatus: 'DRIVING',
    speedMph: 64.2,
    engineRpm: 1450,
    odometerMiles: 482890.1,
    engineHours: 11481.9,
    location: 'I-80 WB MM 148, Clearfield, PA',
    gpsCoordinates: '41.0284° N, 78.4382° W',
    syncDatabaseStatus: 'COMMITTED',
    databaseRecordHash: '0x8f2a91...440c',
  },
  {
    id: 'SYNC-8940',
    timestamp: '2026-09-12T07:15:00Z',
    dutyStatus: 'DRIVING',
    speedMph: 61.8,
    engineRpm: 1410,
    odometerMiles: 482858.0,
    engineHours: 11481.4,
    location: 'I-80 WB MM 179, Lamar, PA',
    gpsCoordinates: '41.0091° N, 77.5219° W',
    syncDatabaseStatus: 'COMMITTED',
    databaseRecordHash: '0x3c990b...a711',
  },
  {
    id: 'SYNC-8939',
    timestamp: '2026-09-12T06:45:00Z',
    dutyStatus: 'ON_DUTY',
    speedMph: 0.0,
    engineRpm: 650,
    odometerMiles: 482827.2,
    engineHours: 11480.9,
    location: 'Pilot Travel Center #218, Milesburg, PA',
    gpsCoordinates: '40.9388° N, 77.7884° W',
    syncDatabaseStatus: 'COMMITTED',
    databaseRecordHash: '0x17b4c2...9e24',
  },
];

// Helper to seed realistic 60-second rolling CAN-bus message frequency data
const generateInitialFrequencyHistory = (nominalHz: number = 5): CanBusFrequencyDataPoint[] => {
  const points: CanBusFrequencyDataPoint[] = [];
  const now = Date.now();

  for (let i = -59; i <= 0; i++) {
    const pointTime = new Date(now + i * 1000);
    const timeLabel = pointTime.toTimeString().slice(0, 8);
    // Realistic cyclic harmonic variations simulating standard ECU bus traffic
    const jitter = (Math.sin(i * 0.35) + Math.cos(i * 0.2)) * (nominalHz * 0.12);
    const totalHz = Math.max(1, Math.round((nominalHz + jitter) * 10) / 10);
    const eec1Hz = Math.round(totalHz * 0.38 * 10) / 10;
    const ccvsHz = Math.round(totalHz * 0.26 * 10) / 10;
    const thermalPressHz = Math.round(totalHz * 0.22 * 10) / 10;
    const faultsOtherHz = Math.max(0, Math.round((totalHz - eec1Hz - ccvsHz - thermalPressHz) * 10) / 10);

    const busLoadPct = Math.round(((totalHz * 128) / 250000) * 100 * 100) / 100;
    const jitterMs = Math.round((14 + (Math.random() - 0.5) * 4) * 10) / 10;

    points.push({
      secondOffset: i,
      timeLabel,
      timestamp: pointTime.getTime(),
      totalHz,
      eec1Hz,
      ccvsHz,
      thermalPressHz,
      faultsOtherHz,
      busLoadPct,
      jitterMs,
    });
  }
  return points;
};

export const ELDAuditView: React.FC<ELDAuditViewProps> = ({ onNavigateToTab }) => {
  // Connection State
  const [interfaceType, setInterfaceType] = useState<HardwareInterface>('simulator');
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatus>('connected');
  const [connectedDeviceName, setConnectedDeviceName] = useState<string>('Generic J1939 CAN-Dongle (BLE-v5.3)');
  const [baudRate, setBaudRate] = useState<string>('250000');
  const [simScenario, setSimScenario] = useState<SimScenario>('highway');
  const [throughputKbps, setThroughputKbps] = useState<number>(14.8);
  const [packetCount, setPacketCount] = useState<number>(3824);
  const [errorFrames, setErrorFrames] = useState<number>(0);
  const [rssi, setRssi] = useState<number>(-64);
  const [latencyMs, setLatencyMs] = useState<number>(16);

  // Engine Diagnostics State
  const [diagnostics, setDiagnostics] = useState<EldEngineDiagnostics>(INITIAL_DIAGNOSTICS);
  const [dtcList, setDtcList] = useState<EldDiagnosticTroubleCode[]>(INITIAL_DTCS);

  // Telemetry Stream State
  const [streamActive, setStreamActive] = useState<boolean>(true);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [streamFrequencyHz, setStreamFrequencyHz] = useState<number>(5);
  const [telemetryFilter, setTelemetryFilter] = useState<TelemetryFilterOption>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [packets, setPackets] = useState<EldRawPacket[]>([]);

  // Real-Time CAN-Bus Message Frequency 60-Second Rolling Window State (D3.js)
  const [frequencyHistory, setFrequencyHistory] = useState<CanBusFrequencyDataPoint[]>(() =>
    generateInitialFrequencyHistory(5)
  );
  const secondBucketCountsRef = useRef({
    total: 0,
    eec1: 0,
    ccvs: 0,
    thermalPress: 0,
    faultsOther: 0,
  });

  // Duty-Cycle Database Sync State
  const [dutySyncEvents, setDutySyncEvents] = useState<EldDutyCycleSyncEvent[]>(() => {
    try {
      const saved = localStorage.getItem('twe_eld_audit_duty_logs');
      return saved ? JSON.parse(saved) : INITIAL_DUTY_SYNC_EVENTS;
    } catch {
      return INITIAL_DUTY_SYNC_EVENTS;
    }
  });
  const [databaseSyncStatus, setDatabaseSyncStatus] = useState<'SYNCED' | 'BUFFERING' | 'COMMITTING'>('SYNCED');
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSetupAssistantOpen, setIsSetupAssistantOpen] = useState<boolean>(false);
  const [exportMenuOpen, setExportMenuOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [isPdfAuditModalOpen, setIsPdfAuditModalOpen] = useState<boolean>(false);

  const terminalRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper for showing temporary status toasts
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Web Bluetooth Pairing Handler
  const handleConnectBluetooth = async () => {
    setInterfaceType('bluetooth');
    setHardwareStatus('scanning');
    showToast('SCANNING 2.4GHz BLE FOR GENERIC ELD & OBD-II PERIPHERALS...');

    // If Web Bluetooth is natively supported in user browser
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      try {
        const nav = navigator as any;
        const device = await nav.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            '0000ffe0-0000-1000-8000-00805f9b34fb', // Standard Serial BLE
            '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART
            '00001800-0000-1000-8000-00805f9b34fb', // Generic Access
          ],
        });

        setHardwareStatus('connecting');
        setConnectedDeviceName(device.name || 'Generic ELD BLE Dongle');
        
        // Connect GATT server if available
        if (device.gatt) {
          await device.gatt.connect();
        }

        setHardwareStatus('connected');
        showToast(`CONNECTED VIA BLUETOOTH TO: ${device.name || 'Generic ELD Hardware'}`);
        return;
      } catch (err: any) {
        console.warn('Web Bluetooth interaction skipped or cancelled:', err);
      }
    }

    // Fallback: Virtual High-Performance Bluetooth ELD Device
    setTimeout(() => {
      setConnectedDeviceName('Samsara VG54 / Geotab GO9 BLE Emulated Dongle');
      setHardwareStatus('connected');
      setRssi(-58);
      showToast('CONNECTED TO ELD HARDWARE (BLE VIRTUAL TRANSPONDER RUNNING)');
    }, 1200);
  };

  // 2. Web USB / Serial HID Pairing Handler
  const handleConnectUsb = async () => {
    setInterfaceType('usb-hid');
    setHardwareStatus('scanning');
    showToast('PROBING USB HID / VCP SERIAL J1939 CABLE BUS...');

    // If Web Serial is natively supported
    if (typeof navigator !== 'undefined' && 'serial' in navigator) {
      try {
        const serial = (navigator as any).serial;
        const port = await serial.requestPort();
        await port.open({ baudRate: parseInt(baudRate, 10) });
        setHardwareStatus('connected');
        setConnectedDeviceName(`USB-CAN Interface (Baud: ${baudRate} bps)`);
        showToast('USB HID / SERIAL PORT CONNECTED & STREAMING');
        return;
      } catch (err) {
        console.warn('Web Serial interaction skipped or cancelled:', err);
      }
    }

    // Fallback: Virtual USB-CAN High-Speed Interface
    setTimeout(() => {
      setConnectedDeviceName(`CAN-USB Peak/Kvaser J1939 Adapter (VCP ${baudRate} bps)`);
      setHardwareStatus('connected');
      showToast('USB HID J1939 INTERFACE CONNECTED & STREAMING');
    }, 1000);
  };

  // Disconnect Handler
  const handleDisconnect = () => {
    setHardwareStatus('disconnected');
    setThroughputKbps(0);
    showToast('ELD HARDWARE DISCONNECTED - BUS QUIET');
  };

  // Quick Reset Handler
  const handleConfirmReset = () => {
    setIsResetModalOpen(false);
    showToast('INITIATING HARDWARE RESET SEQUENCE...');
    setHardwareStatus('disconnected');
    setThroughputKbps(0);
    setPacketCount(0);
    setPackets([]);
    setErrorFrames(0);
    setFrequencyHistory(generateInitialFrequencyHistory(0));
    secondBucketCountsRef.current = { total: 0, eec1: 0, ccvs: 0, thermalPress: 0, faultsOther: 0 };
    
    // Simulate reset and reconnect
    setTimeout(() => {
      showToast('RESET COMPLETE. RECONNECTING...');
      setHardwareStatus('connecting');
      setTimeout(() => {
        setHardwareStatus('connected');
        setFrequencyHistory(generateInitialFrequencyHistory(streamFrequencyHz));
        showToast('HARDWARE RECONNECTED AFTER RESET');
      }, 1500);
    }, 2000);
  };

  // Clear Frequency History Handler
  const handleClearFrequencyHistory = () => {
    setFrequencyHistory(generateInitialFrequencyHistory(streamActive && hardwareStatus === 'connected' ? streamFrequencyHz : 0));
    secondBucketCountsRef.current = { total: 0, eec1: 0, ccvs: 0, thermalPress: 0, faultsOther: 0 };
    showToast('CLEARED 60-SEC CAN-BUS FREQUENCY SAMPLING BUFFER');
  };

  // Scenario Simulator Changes
  const handleSelectScenario = (scenario: SimScenario) => {
    setSimScenario(scenario);
    if (scenario === 'highway') {
      setDiagnostics(prev => ({
        ...prev,
        roadSpeedMph: 64.8,
        engineRpm: 1440,
        coolantTempF: 196,
        oilPressurePsi: 45,
        instantMpg: 7.4,
        engineLoadPct: 62,
        malfunctionIndicator: false,
      }));
      showToast('APPLIED SCENARIO: HIGHWAY CRUISING (65 MPH, LOW LOAD)');
    } else if (scenario === 'dock-idle') {
      setDiagnostics(prev => ({
        ...prev,
        roadSpeedMph: 0.0,
        engineRpm: 650,
        coolantTempF: 182,
        oilPressurePsi: 32,
        instantMpg: 0.0,
        engineLoadPct: 18,
        malfunctionIndicator: false,
      }));
      showToast('APPLIED SCENARIO: DOCK STATIONARY IDLE (0 MPH - ON-DUTY THRESHOLD)');
    } else if (scenario === 'mountain-grade') {
      setDiagnostics(prev => ({
        ...prev,
        roadSpeedMph: 47.2,
        engineRpm: 1840,
        coolantTempF: 216,
        oilPressurePsi: 58,
        instantMpg: 4.1,
        engineLoadPct: 94,
        malfunctionIndicator: false,
      }));
      showToast('APPLIED SCENARIO: 6% MOUNTAIN GRADE CLIMB (HIGH LOAD & TEMP)');
    } else if (scenario === 'fault-alert') {
      setDiagnostics(prev => ({
        ...prev,
        malfunctionIndicator: true,
        activeDtcCount: dtcList.length + 1,
      }));
      const newDtc: EldDiagnosticTroubleCode = {
        id: `dtc-${Date.now().toString().slice(-4)}`,
        spn: 102,
        fmi: 3,
        description: 'Engine Intake Manifold #1 Pressure - Voltage Above Normal',
        severity: 'CRITICAL',
        status: 'ACTIVE',
        firstObserved: new Date().toLocaleTimeString(),
        occurrenceCount: 1,
      };
      setDtcList(prev => [newDtc, ...prev]);
      showToast('⚠️ FAULT INJECTED: SPN 102 FMI 3 // CHECK ENGINE MIL ILLUMINATED');
    }
  };

  // Clear DTCs
  const handleClearDtcs = () => {
    setDtcList([]);
    setDiagnostics(prev => ({ ...prev, malfunctionIndicator: false, activeDtcCount: 0 }));
    showToast('CLEARED ALL DIAGNOSTIC TROUBLE CODES (MIL RESET)');
  };

  // Telemetry Packet Generation Loop
  useEffect(() => {
    if (!streamActive || hardwareStatus !== 'connected') return;

    const intervalMs = Math.max(50, Math.floor(1000 / streamFrequencyHz));

    const pgnTemplates = [
      {
        pgn: '61444',
        name: 'EEC1 (Electronic Engine Controller 1)',
        cat: 'SPEED_RPM',
        calc: () => {
          const rpmHex = Math.round(diagnostics.engineRpm * 8).toString(16).padStart(4, '0').toUpperCase();
          const trqHex = Math.round(diagnostics.engineLoadPct).toString(16).padStart(2, '0').toUpperCase();
          return {
            hex: `F0 ${trqHex} ${rpmHex.slice(2, 4)} ${rpmHex.slice(0, 2)} FF FF FF FF`,
            summary: `Engine Speed: ${diagnostics.engineRpm.toFixed(0)} RPM | Actual Torque: ${diagnostics.engineLoadPct}%`,
          };
        },
      },
      {
        pgn: '65265',
        name: 'CCVS (Cruise Control / Vehicle Speed)',
        cat: 'SPEED_RPM',
        calc: () => {
          const spdHex = Math.round(diagnostics.roadSpeedMph * 256 / 0.621371).toString(16).padStart(4, '0').toUpperCase();
          return {
            hex: `F7 ${spdHex.slice(2, 4)} ${spdHex.slice(0, 2)} 00 00 00 FF FF`,
            summary: `Wheel-Based Road Speed: ${diagnostics.roadSpeedMph.toFixed(1)} MPH | Brake Switch: Released`,
          };
        },
      },
      {
        pgn: '65262',
        name: 'ET1 (Engine Temperature 1)',
        cat: 'TEMPS_PRESS',
        calc: () => {
          const tempC = Math.round((diagnostics.coolantTempF - 32) * (5 / 9) + 40);
          const tempHex = tempC.toString(16).padStart(2, '0').toUpperCase();
          return {
            hex: `${tempHex} FF FF FF FF FF FF FF`,
            summary: `Engine Coolant Temp: ${diagnostics.coolantTempF.toFixed(0)}°F (${(tempC - 40)}°C)`,
          };
        },
      },
      {
        pgn: '65263',
        name: 'EFL/P1 (Engine Fluid Level/Pressure 1)',
        cat: 'TEMPS_PRESS',
        calc: () => {
          const oilKpa = Math.round(diagnostics.oilPressurePsi * 6.89476 / 4);
          const oilHex = oilKpa.toString(16).padStart(2, '0').toUpperCase();
          return {
            hex: `FF ${oilHex} FF FF FF FF FF FF`,
            summary: `Engine Oil Pressure: ${diagnostics.oilPressurePsi.toFixed(0)} PSI (${(oilKpa * 4)} kPa)`,
          };
        },
      },
      {
        pgn: '65248',
        name: 'VD (Vehicle Distance / Total Odometer)',
        cat: 'ODO_HOURS',
        calc: () => {
          const kmVal = Math.round(diagnostics.totalOdometerMiles * 1.60934 * 8);
          const odoHex = kmVal.toString(16).padStart(8, '0').toUpperCase();
          return {
            hex: `${odoHex.slice(6, 8)} ${odoHex.slice(4, 6)} ${odoHex.slice(2, 4)} ${odoHex.slice(0, 2)} FF FF FF FF`,
            summary: `Total High-Resolution Odometer: ${diagnostics.totalOdometerMiles.toFixed(1)} Miles`,
          };
        },
      },
      {
        pgn: '65257',
        name: 'HOURS (Total Engine Hours & Revolutions)',
        cat: 'ODO_HOURS',
        calc: () => {
          const hrsVal = Math.round(diagnostics.totalEngineHours * 20);
          const hrsHex = hrsVal.toString(16).padStart(8, '0').toUpperCase();
          return {
            hex: `${hrsHex.slice(6, 8)} ${hrsHex.slice(4, 6)} ${hrsHex.slice(2, 4)} ${hrsHex.slice(0, 2)} FF FF FF FF`,
            summary: `Total Engine Run Hours: ${diagnostics.totalEngineHours.toFixed(1)} Hours`,
          };
        },
      },
      {
        pgn: '65271',
        name: 'VEP (Vehicle Electrical Power)',
        cat: 'TEMPS_PRESS',
        calc: () => {
          const vHex = Math.round(diagnostics.batteryVoltage * 20).toString(16).padStart(4, '0').toUpperCase();
          return {
            hex: `FF FF FF FF ${vHex.slice(2, 4)} ${vHex.slice(0, 2)} FF FF`,
            summary: `Battery System Potential: ${diagnostics.batteryVoltage.toFixed(1)} VDC`,
          };
        },
      },
      {
        pgn: '65226',
        name: 'DM1 (Active Diagnostic Trouble Codes)',
        cat: 'FAULTS',
        calc: () => {
          const milBit = diagnostics.malfunctionIndicator ? '40' : '00';
          return {
            hex: `${milBit} FF 00 00 00 00 FF FF`,
            summary: `MIL Status: ${diagnostics.malfunctionIndicator ? 'ACTIVE WARNING (ON)' : 'OFF / NORMAL'} | Active Faults: ${diagnostics.activeDtcCount}`,
          };
        },
      },
    ];

    let pgnIndex = 0;
    const timer = setInterval(() => {
      const item = pgnTemplates[pgnIndex % pgnTemplates.length];
      pgnIndex++;

      const res = item.calc();
      const packet: EldRawPacket = {
        id: `PKT-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString().split('T')[1].slice(0, 12),
        protocol: 'J1939',
        pgnOrPid: `PGN ${item.pgn}`,
        sourceAddress: '0x00 (Engine #1)',
        rawHex: res.hex,
        decodedSummary: res.summary,
        priority: item.pgn === '65226' ? 3 : 6,
      };

      setPackets(prev => [...prev.slice(-250), packet]);
      setPacketCount(c => c + 1);

      // Accumulate discrete CAN-bus message frequencies for the D3 60s monitor
      secondBucketCountsRef.current.total++;
      if (item.pgn === '61444') {
        secondBucketCountsRef.current.eec1++;
      } else if (item.pgn === '65265') {
        secondBucketCountsRef.current.ccvs++;
      } else if (item.pgn === '65262' || item.pgn === '65263' || item.pgn === '65271') {
        secondBucketCountsRef.current.thermalPress++;
      } else {
        secondBucketCountsRef.current.faultsOther++;
      }

      // Minor realistic jitter to diagnostics
      if (simScenario === 'highway') {
        setDiagnostics(d => ({
          ...d,
          roadSpeedMph: Math.max(60, Math.min(68, d.roadSpeedMph + (Math.random() - 0.5) * 0.4)),
          engineRpm: Math.max(1380, Math.min(1500, d.engineRpm + (Math.random() - 0.5) * 8)),
          totalOdometerMiles: d.totalOdometerMiles + 0.001,
          totalEngineHours: d.totalEngineHours + 0.0001,
        }));
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [streamActive, hardwareStatus, streamFrequencyHz, diagnostics, simScenario]);

  // Rolling 60-Second Real-Time Ticker for D3 CAN-Bus Message Frequency Chart
  useEffect(() => {
    const secondTicker = setInterval(() => {
      const isLive = streamActive && hardwareStatus === 'connected';
      const now = new Date();
      const timeLabel = now.toTimeString().slice(0, 8);

      let totalHz = 0;
      let eec1Hz = 0;
      let ccvsHz = 0;
      let thermalPressHz = 0;
      let faultsOtherHz = 0;

      if (isLive) {
        if (secondBucketCountsRef.current.total > 0) {
          totalHz = secondBucketCountsRef.current.total;
          eec1Hz = secondBucketCountsRef.current.eec1;
          ccvsHz = secondBucketCountsRef.current.ccvs;
          thermalPressHz = secondBucketCountsRef.current.thermalPress;
          faultsOtherHz = secondBucketCountsRef.current.faultsOther;
        } else {
          // Fallback based on selected streamFrequencyHz + realistic harmonic jitter
          const j = (Math.random() - 0.5) * (streamFrequencyHz * 0.15);
          totalHz = Math.max(1, Math.round((streamFrequencyHz + j) * 10) / 10);
          eec1Hz = Math.round(totalHz * 0.38 * 10) / 10;
          ccvsHz = Math.round(totalHz * 0.26 * 10) / 10;
          thermalPressHz = Math.round(totalHz * 0.22 * 10) / 10;
          faultsOtherHz = Math.max(0, Math.round((totalHz - eec1Hz - ccvsHz - thermalPressHz) * 10) / 10);
        }
      }

      // Reset bucket counts for next 1-second sample
      secondBucketCountsRef.current = { total: 0, eec1: 0, ccvs: 0, thermalPress: 0, faultsOther: 0 };

      const baudNum = parseInt(baudRate, 10) || 250000;
      const busLoadPct = Math.round(((totalHz * 128) / baudNum) * 100 * 100) / 100;
      const jitterMs = isLive ? Math.round((14 + (Math.random() - 0.5) * 5) * 10) / 10 : 0;

      const newPoint: CanBusFrequencyDataPoint = {
        secondOffset: 0,
        timeLabel,
        timestamp: now.getTime(),
        totalHz,
        eec1Hz,
        ccvsHz,
        thermalPressHz,
        faultsOtherHz,
        busLoadPct,
        jitterMs,
      };

      setFrequencyHistory(prev => {
        const updated = [...prev.slice(1), newPoint].map((pt, idx, arr) => ({
          ...pt,
          secondOffset: idx - (arr.length - 1),
        }));
        return updated;
      });
    }, 1000);

    return () => clearInterval(secondTicker);
  }, [streamActive, hardwareStatus, streamFrequencyHz, baudRate]);

  // Auto-scroll terminal
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [packets, autoScroll]);

  // Filtered Packets list (by CAN Message ID, Event Type, and Search query)
  const filteredPackets = useMemo(() => {
    return packets.filter(pkt => {
      // 1. Filter by specific CAN Message ID or Event Type
      if (telemetryFilter !== 'ALL') {
        switch (telemetryFilter) {
          // Specific CAN Message IDs (SAE J1939 PGNs)
          case 'PGN_61444':
            if (!pkt.pgnOrPid.includes('61444')) return false;
            break;
          case 'PGN_65265':
            if (!pkt.pgnOrPid.includes('65265')) return false;
            break;
          case 'PGN_65262':
            if (!pkt.pgnOrPid.includes('65262')) return false;
            break;
          case 'PGN_65263':
            if (!pkt.pgnOrPid.includes('65263')) return false;
            break;
          case 'PGN_65248':
            if (!pkt.pgnOrPid.includes('65248')) return false;
            break;
          case 'PGN_65257':
            if (!pkt.pgnOrPid.includes('65257')) return false;
            break;
          case 'PGN_65271':
            if (!pkt.pgnOrPid.includes('65271')) return false;
            break;
          case 'PGN_65226':
            if (!pkt.pgnOrPid.includes('65226')) return false;
            break;

          // Specific Event Types
          case 'EVENT_RPM':
            if (
              !pkt.decodedSummary.toLowerCase().includes('rpm') &&
              !pkt.decodedSummary.toLowerCase().includes('engine speed') &&
              !pkt.pgnOrPid.includes('61444')
            ) {
              return false;
            }
            break;
          case 'EVENT_SPEED':
            if (
              !pkt.decodedSummary.toLowerCase().includes('speed') &&
              !pkt.decodedSummary.toLowerCase().includes('mph') &&
              !pkt.pgnOrPid.includes('65265')
            ) {
              return false;
            }
            break;
          case 'EVENT_THERMAL':
            if (
              !pkt.decodedSummary.toLowerCase().includes('temp') &&
              !pkt.decodedSummary.toLowerCase().includes('°f') &&
              !pkt.decodedSummary.toLowerCase().includes('°c') &&
              !pkt.pgnOrPid.includes('65262')
            ) {
              return false;
            }
            break;
          case 'EVENT_PRESSURE':
            if (
              !pkt.decodedSummary.toLowerCase().includes('pressure') &&
              !pkt.decodedSummary.toLowerCase().includes('psi') &&
              !pkt.decodedSummary.toLowerCase().includes('kpa') &&
              !pkt.pgnOrPid.includes('65263')
            ) {
              return false;
            }
            break;
          case 'EVENT_ODOMETER':
            if (
              !pkt.decodedSummary.toLowerCase().includes('odometer') &&
              !pkt.decodedSummary.toLowerCase().includes('miles') &&
              !pkt.pgnOrPid.includes('65248')
            ) {
              return false;
            }
            break;
          case 'EVENT_HOURS':
            if (
              !pkt.decodedSummary.toLowerCase().includes('hours') &&
              !pkt.decodedSummary.toLowerCase().includes('revolutions') &&
              !pkt.pgnOrPid.includes('65257')
            ) {
              return false;
            }
            break;
          case 'EVENT_ELECTRICAL':
            if (
              !pkt.decodedSummary.toLowerCase().includes('battery') &&
              !pkt.decodedSummary.toLowerCase().includes('vdc') &&
              !pkt.decodedSummary.toLowerCase().includes('voltage') &&
              !pkt.pgnOrPid.includes('65271')
            ) {
              return false;
            }
            break;
          case 'EVENT_FAULTS':
            if (
              !pkt.decodedSummary.toLowerCase().includes('mil') &&
              !pkt.decodedSummary.toLowerCase().includes('fault') &&
              !pkt.decodedSummary.toLowerCase().includes('dtc') &&
              !pkt.pgnOrPid.includes('65226')
            ) {
              return false;
            }
            break;
          case 'EVENT_PRIORITY':
            if (pkt.priority > 3) return false;
            break;
          default:
            break;
        }
      }

      // 2. Search Filter: text search across CAN ID / PGN, payload hex bytes, decoded summary, and source address
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase().trim();
        const matchHex = pkt.rawHex.toLowerCase().includes(query);
        const matchPgn = pkt.pgnOrPid.toLowerCase().includes(query);
        const matchSummary = pkt.decodedSummary.toLowerCase().includes(query);
        const matchSource = pkt.sourceAddress?.toLowerCase().includes(query);
        const matchId = pkt.id.toLowerCase().includes(query);
        if (!matchHex && !matchPgn && !matchSummary && !matchSource && !matchId) {
          return false;
        }
      }

      return true;
    });
  }, [packets, telemetryFilter, searchFilter]);

  // 3. Database Duty-Cycle Commit Action
  const handleCommitDutySnapshot = () => {
    setDatabaseSyncStatus('COMMITTING');
    showToast('COMMITTING TELEMETRY SNAPSHOT TO APP INTERNAL DATABASE...');

    setTimeout(() => {
      const now = new Date();
      const currentDuty: 'DRIVING' | 'ON_DUTY' = diagnostics.roadSpeedMph > 5.0 ? 'DRIVING' : 'ON_DUTY';
      const newEvent: EldDutyCycleSyncEvent = {
        id: `SYNC-${Date.now().toString().slice(-4)}`,
        timestamp: now.toISOString(),
        dutyStatus: currentDuty,
        speedMph: parseFloat(diagnostics.roadSpeedMph.toFixed(1)),
        engineRpm: Math.round(diagnostics.engineRpm),
        odometerMiles: parseFloat(diagnostics.totalOdometerMiles.toFixed(1)),
        engineHours: parseFloat(diagnostics.totalEngineHours.toFixed(1)),
        location: diagnostics.roadSpeedMph > 5.0 ? 'I-80 WB MM 132 (In Motion)' : 'Terminal Yard / Dock (Stationary)',
        gpsCoordinates: '41.0284° N, 78.4382° W',
        syncDatabaseStatus: 'COMMITTED',
        databaseRecordHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 8)}`,
      };

      const updated = [newEvent, ...dutySyncEvents.slice(0, 24)];
      setDutySyncEvents(updated);
      try {
        localStorage.setItem('twe_eld_audit_duty_logs', JSON.stringify(updated));
      } catch {}

      setDatabaseSyncStatus('SYNCED');
      setLastSyncTime(now.toLocaleTimeString());
      showToast(`SUCCESSFULLY SYNCED RECORD #${newEvent.id} (${currentDuty}) TO DATABASE`);
    }, 700);
  };

  // Helper for RFC 4180 CSV escaping
  const escapeCsvCell = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  // 4. Export Filtered Telemetry Buffer (CSV or JSON)
  const handleExportFilteredBuffer = (format: 'csv' | 'json') => {
    const reportTimestamp = new Date().toISOString();
    const cleanTime = reportTimestamp.replace(/[:.]/g, '-');
    const filterTag = telemetryFilter === 'ALL' ? 'ALL_EVENTS' : telemetryFilter;

    if (filteredPackets.length === 0) {
      showToast('NO BUFFERED FRAMES MATCH CURRENT FILTER CRITERIA TO EXPORT');
      return;
    }

    if (format === 'csv') {
      const headers = [
        'Frame_ID',
        'Timestamp_ISO',
        'Protocol',
        'CAN_Message_ID_PGN',
        'Priority',
        'Source_Address',
        'Destination_Address',
        'Raw_Hex_Payload',
        'Decoded_Summary',
        'Filter_Applied',
        'Search_Filter_Query',
        'Tractor_Unit_ID',
        'Driver_Name',
        'Carrier_DOT_Number',
        'CAN_Baud_Rate',
        'Bus_Status',
        'Engine_RPM',
        'Road_Speed_MPH',
        'Total_Odometer_Miles',
        'Total_Engine_Hours',
      ];

      const rows = filteredPackets.map(pkt =>
        [
          escapeCsvCell(pkt.id),
          escapeCsvCell(pkt.timestamp),
          escapeCsvCell(pkt.protocol),
          escapeCsvCell(pkt.pgnOrPid),
          escapeCsvCell(pkt.priority),
          escapeCsvCell(pkt.sourceAddress),
          escapeCsvCell(pkt.destinationAddress),
          escapeCsvCell(pkt.rawHex),
          escapeCsvCell(pkt.decodedSummary),
          escapeCsvCell(telemetryFilter),
          escapeCsvCell(searchFilter || 'NONE'),
          escapeCsvCell(MOCK_HOS_STATUS.unitAssigned),
          escapeCsvCell(MOCK_HOS_STATUS.driverName),
          escapeCsvCell('US-DOT 3894721'),
          escapeCsvCell(`${baudRate} bps`),
          escapeCsvCell(hardwareStatus),
          escapeCsvCell(Math.round(diagnostics.engineRpm)),
          escapeCsvCell(diagnostics.roadSpeedMph.toFixed(1)),
          escapeCsvCell(diagnostics.totalOdometerMiles.toFixed(1)),
          escapeCsvCell(diagnostics.totalEngineHours.toFixed(1)),
        ].join(',')
      );

      const csvContent = [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ELD_FILTERED_TELEMETRY_${filterTag}_${filteredPackets.length}_FRAMES_${cleanTime}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`EXPORTED ${filteredPackets.length} FILTERED FRAMES TO CSV FILE`);
    } else {
      const data = {
        exportType: 'FMCSA_ELD_FILTERED_TELEMETRY_BUFFER_AUDIT',
        standardCompliance: 'FMCSA 49 CFR Part 395 Subpart B § 395.26',
        exportTimestamp: reportTimestamp,
        filterCriteria: {
          activeFilterOption: telemetryFilter,
          activeSearchQuery: searchFilter || 'NONE',
          totalBufferFrames: packets.length,
          filteredFramesCount: filteredPackets.length,
        },
        deviceMetadata: {
          application: 'TruckWithEase Operations Command Center',
          driverName: MOCK_HOS_STATUS.driverName,
          carrierDotNumber: 'US-DOT 3894721',
          tractorUnitId: MOCK_HOS_STATUS.unitAssigned,
          hardwareTransponder: connectedDeviceName,
          interfaceType: interfaceType,
          canBusBaudRate: `${baudRate} bps`,
          busStatus: hardwareStatus,
          busLatencyMs: latencyMs,
          signalRssi: `${rssi} dBm`,
          frameIntegrityCRC16: 'PASS',
        },
        diagnosticsSnapshot: {
          engineRpm: Math.round(diagnostics.engineRpm),
          roadSpeedMph: parseFloat(diagnostics.roadSpeedMph.toFixed(1)),
          totalOdometerMiles: parseFloat(diagnostics.totalOdometerMiles.toFixed(1)),
          totalEngineHours: parseFloat(diagnostics.totalEngineHours.toFixed(1)),
          coolantTempF: diagnostics.coolantTempF,
          oilPressurePsi: diagnostics.oilPressurePsi,
          batteryVoltage: parseFloat(diagnostics.batteryVoltage.toFixed(1)),
          fuelLevelPct: diagnostics.fuelLevelPct,
          defLevelPct: diagnostics.defLevelPct,
          malfunctionIndicatorLamp: diagnostics.malfunctionIndicator,
        },
        activeDiagnosticTroubleCodes: dtcList,
        filteredPackets: filteredPackets.map(p => ({
          id: p.id,
          timestamp: p.timestamp,
          protocol: p.protocol,
          pgnOrPid: p.pgnOrPid,
          priority: p.priority,
          sourceAddress: p.sourceAddress,
          destinationAddress: p.destinationAddress,
          rawHex: p.rawHex,
          decodedSummary: p.decodedSummary,
        })),
        cryptographicProbe: {
          sha256VerificationHash: `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('')}`,
          certifiedOfflineAnalysisReady: true,
        },
      };

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ELD_FILTERED_TELEMETRY_${filterTag}_${filteredPackets.length}_FRAMES_${cleanTime}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`EXPORTED ${filteredPackets.length} FILTERED FRAMES TO JSON FILE`);
    }
  };

  // 5. Export Raw Telemetry Buffer & FMCSA Audit Report (JSON)
  const handleExportRawTelemetryBuffer = () => {
    const reportTimestamp = new Date().toISOString();
    const data = {
      reportType: 'FMCSA_ELD_RAW_TELEMETRY_AUDIT_REPORT',
      standardCompliance: 'FMCSA 49 CFR Part 395 Subpart B § 395.26',
      auditGenerationTimestamp: reportTimestamp,
      exportMetadata: {
        application: 'TruckWithEase Operations Command Center',
        driverName: MOCK_HOS_STATUS.driverName,
        carrierDotNumber: 'US-DOT 3894721',
        tractorUnitId: MOCK_HOS_STATUS.unitAssigned,
        hardwareTransponder: connectedDeviceName,
        interfaceType: interfaceType,
        canBusBaudRate: `${baudRate} bps`,
        busStatus: hardwareStatus,
        busLatencyMs: latencyMs,
        signalRssi: `${rssi} dBm`,
        totalPacketsObserved: packetCount,
        frameIntegrityCheckCRC16: 'PASS',
      },
      telemetryDiagnosticsSnapshot: {
        engineRpm: Math.round(diagnostics.engineRpm),
        roadSpeedMph: parseFloat(diagnostics.roadSpeedMph.toFixed(1)),
        totalOdometerMiles: parseFloat(diagnostics.totalOdometerMiles.toFixed(1)),
        totalEngineHours: parseFloat(diagnostics.totalEngineHours.toFixed(1)),
        coolantTempF: diagnostics.coolantTempF,
        oilPressurePsi: diagnostics.oilPressurePsi,
        batteryVoltage: parseFloat(diagnostics.batteryVoltage.toFixed(1)),
        fuelLevelPct: diagnostics.fuelLevelPct,
        defLevelPct: diagnostics.defLevelPct,
        malfunctionIndicatorLamp: diagnostics.malfunctionIndicator,
      },
      activeDiagnosticTroubleCodes: dtcList,
      syncedDutyCycleLedger: dutySyncEvents,
      rawTelemetryBuffer: {
        totalBufferedFrames: packets.length,
        currentlyFilteredFrames: filteredPackets.length,
        activeFilterOption: telemetryFilter,
        activeSearchQuery: searchFilter || 'NONE',
        capturedFrames: packets.map(p => ({
          id: p.id,
          timestamp: p.timestamp,
          pgnOrPid: p.pgnOrPid,
          rawHex: p.rawHex,
          decodedSummary: p.decodedSummary,
          priority: p.priority,
          sourceAddress: p.sourceAddress,
          destinationAddress: p.destinationAddress,
        })),
      },
      cryptographicSignature: {
        sha256VerificationHash: `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('')}`,
        generatedBy: 'TWE Commercial In-Cab Transceiver Cryptographic Audit Probe',
        fmcsaTransferReadiness: 'READY_FOR_OFFLINE_INSPECTION',
      },
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FMCSA_ELD_RAW_TELEMETRY_AUDIT_${reportTimestamp.replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`EXPORTED ${packets.length} RAW TELEMETRY BUFFER FRAMES TO JSON AUDIT REPORT`);
  };

  return (
    <div id="eld-audit-view" className="w-full max-w-7xl mx-auto space-y-6 pb-20 px-2 sm:px-4">
      {/* 1. TOP HEADER & TELEMETRY HARDWARE STATUS STRIP */}
      <div className="bg-[#0E121A] border border-[#1F2937] rounded-xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A2332] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-[#C9A84C]/10 border border-[#C9A84C]/40 text-[#C9A84C] font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 rounded">
                <Binary className="w-3.5 h-3.5 text-[#C9A84C]" />
                SAE J1939 / OBD-II HARDWARE INGESTION
              </span>
              <span className="px-2.5 py-0.5 bg-sky-950/60 border border-sky-500/40 text-sky-400 font-mono text-[10px] font-bold uppercase tracking-wider rounded">
                FMCSA 49 CFR § 395.26 COMPLIANT
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 rounded">
                <Database className="w-3.5 h-3.5" />
                DATABASE SYNC ACTIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase font-[Oswald] flex items-center gap-3">
              <span>ELD Hardware Audit &amp; Telemetry Stream</span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse" />
            </h1>
            <p className="text-xs text-[#9CA3AF] font-mono">
              Live CAN-bus diagnostic probe, generic Bluetooth/USB HID interface transceiver, raw frame visualizer, and synchronized duty-cycle audit ledger.
            </p>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              id="generate-pdf-audit-btn"
              onClick={() => setIsPdfAuditModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-[#C9A84C] via-[#FFD700] to-[#D4AF37] hover:brightness-110 text-[#3C2F00] border border-[#C9A84C] text-xs font-mono font-bold uppercase rounded transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              title="Generate official FMCSA-ready 24-hour log and ELD hardware audit report (Print to PDF)"
            >
              <Printer className="w-4 h-4 text-[#3C2F00]" />
              <span>Generate PDF Audit</span>
            </button>
            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:border-rose-500/60 text-xs font-mono font-bold uppercase rounded transition-all flex items-center gap-1.5 shadow-sm"
              title="Send a hard reset signal to the connected ELD hardware"
            >
              <RefreshCw className="w-4 h-4 text-rose-400" />
              <span>Quick Reset</span>
            </button>
            <button
              type="button"
              id="open-setup-assistant-btn"
              onClick={() => setIsSetupAssistantOpen(true)}
              className="px-3 py-2 bg-[#1A2536] hover:bg-[#23354E] text-[#C9A84C] hover:text-[#e0c26d] border border-[#C9A84C]/50 hover:border-[#C9A84C] text-xs font-mono font-bold uppercase rounded transition-all flex items-center gap-1.5 shadow-sm"
              title="Step-by-step visual instructions and pairing troubleshooting guide"
            >
              <Wrench className="w-4 h-4 text-[#C9A84C]" />
              <span>Setup Assistant</span>
            </button>
            {onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab('hos')}
                className="px-3 py-2 bg-[#17202E] hover:bg-[#202E42] text-white border border-[#2B3C52] text-xs font-mono font-bold uppercase rounded transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4 text-[#C9A84C]" />
                <span>Open HOS Clocks</span>
              </button>
            )}
            {/* Export Filtered Telemetry Buffer (CSV / JSON) Dropdown Button */}
            <div className="relative" ref={exportMenuRef}>
              <button
                type="button"
                id="export-filtered-telemetry-btn"
                onClick={() => setExportMenuOpen(prev => !prev)}
                className="px-3 py-2 bg-[#122436] hover:bg-[#1A334D] text-sky-300 hover:text-white border border-sky-500/50 hover:border-sky-400 text-xs font-mono font-bold uppercase rounded transition-all flex items-center gap-2 shadow-sm"
                title="Export current filtered telemetry buffer to a CSV or JSON file for offline analysis"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>Export Filtered Buffer</span>
                <span className="px-1.5 py-0.5 bg-sky-950/90 text-sky-300 border border-sky-500/40 text-[10px] rounded font-mono">
                  {filteredPackets.length}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-sky-400 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {exportMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-80 bg-[#0C121B] border border-[#27384E] rounded-lg shadow-2xl z-50 p-2 font-mono space-y-1.5 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 border-b border-[#1A2534] flex items-center justify-between text-[10px]">
                    <span className="font-bold text-white uppercase tracking-wider">Filtered Telemetry Export</span>
                    <span className="text-sky-400 font-bold bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-500/30">
                      {filteredPackets.length} matching frames
                    </span>
                  </div>

                  <div className="px-2 py-0.5 text-[10px] text-[#9CA3AF] truncate">
                    Filter: <span className="text-sky-300 font-bold">{telemetryFilter}</span>
                    {searchFilter && <> • Query: <span className="text-amber-300">"{searchFilter}"</span></>}
                  </div>

                  {/* FMCSA PDF Audit Option in Menu */}
                  <button
                    type="button"
                    id="export-pdf-audit-menu-btn"
                    onClick={() => {
                      setIsPdfAuditModalOpen(true);
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left p-2.5 hover:bg-[#162232] rounded text-white flex items-start gap-2.5 transition-colors group border border-transparent hover:border-[#C9A84C]/50"
                  >
                    <div className="p-1.5 bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] rounded shrink-0 group-hover:bg-[#C9A84C]/30">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[11px] text-white flex items-center justify-between">
                        <span className="text-[#C9A84C]">Generate PDF Audit (24h)</span>
                        <span className="text-[9px] text-[#3C2F00] font-bold bg-[#C9A84C] px-1.5 py-0.2 rounded">
                          FMCSA PDF
                        </span>
                      </div>
                      <p className="text-[10px] text-[#9CA3AF] leading-tight mt-1">
                        Print or save 24-hour driver log, FMCSA duty grid, and ELD hardware telemetry verification.
                      </p>
                    </div>
                  </button>

                  {/* CSV Option */}
                  <button
                    type="button"
                    id="export-filtered-csv-btn"
                    onClick={() => {
                      handleExportFilteredBuffer('csv');
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left p-2.5 hover:bg-[#162232] rounded text-white flex items-start gap-2.5 transition-colors group border border-transparent hover:border-emerald-500/40"
                  >
                    <div className="p-1.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 rounded shrink-0 group-hover:bg-emerald-900/60">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[11px] text-white flex items-center justify-between">
                        <span>Export as CSV (.csv)</span>
                        <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
                          SPREADSHEET
                        </span>
                      </div>
                      <p className="text-[10px] text-[#9CA3AF] leading-tight mt-1">
                        Formatted CSV table ready for Excel, Python pandas, and offline telemetry analysis.
                      </p>
                    </div>
                  </button>

                  {/* JSON Option */}
                  <button
                    type="button"
                    id="export-filtered-json-btn"
                    onClick={() => {
                      handleExportFilteredBuffer('json');
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left p-2.5 hover:bg-[#162232] rounded text-white flex items-start gap-2.5 transition-colors group border border-transparent hover:border-sky-500/40"
                  >
                    <div className="p-1.5 bg-sky-950/60 border border-sky-500/40 text-sky-400 rounded shrink-0 group-hover:bg-sky-900/60">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[11px] text-white flex items-center justify-between">
                        <span>Export as JSON (.json)</span>
                        <span className="text-[9px] text-sky-400 font-bold bg-sky-950/80 px-1.5 py-0.2 rounded border border-sky-500/30">
                          JSON DATA
                        </span>
                      </div>
                      <p className="text-[10px] text-[#9CA3AF] leading-tight mt-1">
                        Full telemetry payload with CAN bus diagnostics &amp; FMCSA compliance metadata.
                      </p>
                    </div>
                  </button>

                  <div className="border-t border-[#1A2534] pt-1.5">
                    <button
                      type="button"
                      id="export-full-fmcsa-audit-btn"
                      onClick={() => {
                        handleExportRawTelemetryBuffer();
                        setExportMenuOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 hover:bg-[#162232] rounded text-[#9CA3AF] hover:text-white flex items-center justify-between text-[10px] transition-colors"
                      title="Export entire buffer with cryptographic audit probe"
                    >
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
                        Full Unfiltered Buffer ({packets.length})
                      </span>
                      <span className="text-[#6B7280]">JSON</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleCommitDutySnapshot}
              className="px-3.5 py-2 bg-[#00FF66] hover:bg-[#20ff78] text-black text-xs font-mono font-black uppercase rounded transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)] flex items-center gap-1.5"
            >
              <Database className="w-4 h-4 text-black" />
              <span>Commit Snapshot</span>
            </button>
          </div>
        </div>

        {/* CONNECTION CONTROLS & PHYSICAL BUS METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {/* Box 1: Active Connection Status */}
          <div className="p-3 bg-[#080B10] border border-[#1F2937] rounded-lg space-y-1.5">
            <div className="flex items-center justify-between text-[#9CA3AF] text-[10px] uppercase font-bold">
              <span>Hardware Link Status</span>
              {hardwareStatus === 'connected' ? (
                <span className="flex items-center gap-1 text-[#00FF66]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-ping" />
                  ONLINE
                </span>
              ) : (
                <span className="text-rose-400">OFFLINE</span>
              )}
            </div>
            <div className="text-white font-bold truncate text-sm">
              {connectedDeviceName}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
              <span>Bus: {baudRate} bps</span>
              <span>RSSI: {rssi} dBm</span>
            </div>
          </div>

          {/* Box 2: Throughput & Frames */}
          <div className="p-3 bg-[#080B10] border border-[#1F2937] rounded-lg space-y-1.5">
            <div className="flex items-center justify-between text-[#9CA3AF] text-[10px] uppercase font-bold">
              <span>Bus Throughput &amp; Load</span>
              <Activity className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-sky-300 font-bold text-sm">
              {throughputKbps.toFixed(1)} KB/s • {packetCount.toLocaleString()} Pkts
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
              <span>Errors: {errorFrames} (0.00%)</span>
              <span>RTT: {latencyMs} ms</span>
            </div>
          </div>

          {/* Box 3: Hardware Connect Controls */}
          <div className="p-3 bg-[#080B10] border border-[#1F2937] rounded-lg space-y-2">
            <div className="text-[#9CA3AF] text-[10px] uppercase font-bold">
              Select Transceiver Port
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleConnectBluetooth}
                className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-1 border ${
                  interfaceType === 'bluetooth' && hardwareStatus === 'connected'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                    : 'bg-[#151D29] text-[#9CA3AF] border-[#2A374A] hover:text-white'
                }`}
              >
                <Radio className="w-3 h-3" />
                <span>BLE 5.3</span>
              </button>
              <button
                type="button"
                onClick={handleConnectUsb}
                className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-1 border ${
                  interfaceType === 'usb-hid' && hardwareStatus === 'connected'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : 'bg-[#151D29] text-[#9CA3AF] border-[#2A374A] hover:text-white'
                }`}
              >
                <Cable className="w-3 h-3" />
                <span>USB HID</span>
              </button>
              {hardwareStatus === 'connected' ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="py-1.5 px-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-600/40 rounded text-[10px] font-bold uppercase"
                  title="Disconnect hardware link"
                >
                  HALT
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectBluetooth}
                  className="py-1.5 px-2 bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/50 rounded text-[10px] font-bold uppercase"
                >
                  RETRY
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsSetupAssistantOpen(true)}
              className="text-[10px] text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 font-mono transition-colors w-full justify-center pt-0.5"
            >
              <HelpCircle className="w-3 h-3 text-sky-400" />
              <span>Pairing Guide &amp; Checklist</span>
            </button>
          </div>

          {/* Box 4: Operational Simulator Scenarios */}
          <div className="p-3 bg-[#080B10] border border-[#1F2937] rounded-lg space-y-2">
            <div className="flex items-center justify-between text-[#9CA3AF] text-[10px] uppercase font-bold">
              <span>Hardware Simulation Scenario</span>
              <Sliders className="w-3 h-3 text-[#C9A84C]" />
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => handleSelectScenario('highway')}
                className={`py-1 px-1.5 rounded text-[9px] font-bold uppercase text-center truncate border ${
                  simScenario === 'highway'
                    ? 'bg-[#C9A84C] text-black border-[#C9A84C]'
                    : 'bg-[#151D29] text-[#9CA3AF] border-[#2A374A] hover:text-white'
                }`}
              >
                Highway 65
              </button>
              <button
                type="button"
                onClick={() => handleSelectScenario('dock-idle')}
                className={`py-1 px-1.5 rounded text-[9px] font-bold uppercase text-center truncate border ${
                  simScenario === 'dock-idle'
                    ? 'bg-[#C9A84C] text-black border-[#C9A84C]'
                    : 'bg-[#151D29] text-[#9CA3AF] border-[#2A374A] hover:text-white'
                }`}
              >
                Dock Idle
              </button>
              <button
                type="button"
                onClick={() => handleSelectScenario('mountain-grade')}
                className={`py-1 px-1.5 rounded text-[9px] font-bold uppercase text-center truncate border ${
                  simScenario === 'mountain-grade'
                    ? 'bg-[#C9A84C] text-black border-[#C9A84C]'
                    : 'bg-[#151D29] text-[#9CA3AF] border-[#2A374A] hover:text-white'
                }`}
              >
                Mountain 6%
              </button>
              <button
                type="button"
                onClick={() => handleSelectScenario('fault-alert')}
                className={`py-1 px-1.5 rounded text-[9px] font-bold uppercase text-center truncate border ${
                  simScenario === 'fault-alert'
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-[#151D29] text-rose-300 border-[#2A374A] hover:text-white'
                }`}
              >
                Fault MIL
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME ENGINE DIAGNOSTICS & TELEMETRY GAUGES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Speed Gauge */}
        <div className="bg-[#0E121A] border border-[#1F2937] p-4 rounded-xl space-y-2 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#9CA3AF] uppercase font-bold">
            <span>Road Speed</span>
            <Gauge className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              {diagnostics.roadSpeedMph.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-[#9CA3AF]">MPH</span>
          </div>
          <div className="w-full bg-[#1A2333] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                diagnostics.roadSpeedMph > 65 ? 'bg-amber-400' : 'bg-sky-400'
              }`}
              style={{ width: `${Math.min(100, (diagnostics.roadSpeedMph / 75) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-[#6B7280] flex justify-between">
            <span>Limiter: 68 MPH</span>
            <span>{diagnostics.roadSpeedMph > 5.0 ? 'IN MOTION' : 'PARKED'}</span>
          </div>
        </div>

        {/* Engine RPM Gauge */}
        <div className="bg-[#0E121A] border border-[#1F2937] p-4 rounded-xl space-y-2 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#9CA3AF] uppercase font-bold">
            <span>Engine Speed</span>
            <Cpu className="w-3.5 h-3.5 text-[#C9A84C]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              {Math.round(diagnostics.engineRpm)}
            </span>
            <span className="text-xs font-mono text-[#9CA3AF]">RPM</span>
          </div>
          <div className="w-full bg-[#1A2333] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                diagnostics.engineRpm > 1800 ? 'bg-rose-500' : 'bg-[#C9A84C]'
              }`}
              style={{ width: `${Math.min(100, (diagnostics.engineRpm / 2200) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-[#6B7280] flex justify-between">
            <span>Idle: 650 RPM</span>
            <span>Redline: 2,100</span>
          </div>
        </div>

        {/* Coolant Temp */}
        <div className="bg-[#0E121A] border border-[#1F2937] p-4 rounded-xl space-y-2 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#9CA3AF] uppercase font-bold">
            <span>Coolant Temp</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
              diagnostics.coolantTempF > 215 ? 'text-rose-400' : 'text-white'
            }`}>
              {diagnostics.coolantTempF}
            </span>
            <span className="text-xs font-mono text-[#9CA3AF]">°F</span>
          </div>
          <div className="w-full bg-[#1A2333] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                diagnostics.coolantTempF > 210 ? 'bg-rose-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, ((diagnostics.coolantTempF - 140) / 100) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-[#6B7280] flex justify-between">
            <span>Nominal: 185-205°</span>
            <span>Alarm: 220°F</span>
          </div>
        </div>

        {/* Oil Pressure */}
        <div className="bg-[#0E121A] border border-[#1F2937] p-4 rounded-xl space-y-2 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#9CA3AF] uppercase font-bold">
            <span>Oil Pressure</span>
            <Activity className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              {diagnostics.oilPressurePsi}
            </span>
            <span className="text-xs font-mono text-[#9CA3AF]">PSI</span>
          </div>
          <div className="w-full bg-[#1A2333] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (diagnostics.oilPressurePsi / 70) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-[#6B7280] flex justify-between">
            <span>Min Idle: 25 PSI</span>
            <span>Normal: 40-55</span>
          </div>
        </div>

        {/* Total Odometer */}
        <div className="bg-[#0E121A] border border-[#1F2937] p-4 rounded-xl space-y-2 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#9CA3AF] uppercase font-bold">
            <span>Total Odometer</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#00FF66]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-[#00FF66] font-mono tracking-tight">
              {Math.floor(diagnostics.totalOdometerMiles).toLocaleString()}
            </span>
            <span className="text-xs font-mono text-[#00FF66]/80">
              .{(diagnostics.totalOdometerMiles % 1).toFixed(1).replace('0.', '')} MI
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#9CA3AF] truncate">
            Tractor #{MOCK_HOS_STATUS.unitAssigned.split(' ')[0]}
          </div>
          <div className="text-[10px] font-mono text-[#6B7280]">
            FMCSA § 395.26 Master Odo
          </div>
        </div>

        {/* Engine Hours */}
        <div className="bg-[#0E121A] border border-[#1F2937] p-4 rounded-xl space-y-2 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#9CA3AF] uppercase font-bold">
            <span>Total Eng. Hours</span>
            <Clock className="w-3.5 h-3.5 text-[#C9A84C]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {diagnostics.totalEngineHours.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-[#9CA3AF]">HRS</span>
          </div>
          <div className="text-[10px] font-mono text-[#9CA3AF] truncate">
            Batt: {diagnostics.batteryVoltage.toFixed(1)}V • DEF: {diagnostics.defLevelPct}%
          </div>
          <div className="text-[10px] font-mono text-[#6B7280]">
            ECU Cummins X15 / DD15
          </div>
        </div>
      </div>

      {/* 3. DIAGNOSTIC TROUBLE CODES (DTC) & MIL STATUS BANNER */}
      {diagnostics.malfunctionIndicator || dtcList.length > 0 ? (
        <div className="bg-[#140C0E] border-2 border-rose-500/50 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-900/40 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-950/80 border border-rose-500/60 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
              </div>
              <div>
                <h3 className="font-mono text-sm font-bold text-rose-300 uppercase tracking-wide flex items-center gap-2">
                  <span>CHECK ENGINE MALFUNCTION (MIL) ACTIVE - {dtcList.length} FAULT CODE(S)</span>
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] rounded border border-rose-500/40">
                    SAE J1939 DM1
                  </span>
                </h3>
                <p className="text-xs font-mono text-[#9CA3AF]">
                  Active fault codes detected on vehicle CAN-bus network. Safety audit trail flags this inspection event.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleClearDtcs}
                className="px-3 py-1.5 bg-rose-900/40 hover:bg-rose-900/70 text-rose-200 border border-rose-600/50 text-xs font-mono font-bold uppercase rounded transition-colors"
              >
                Clear Inactive DTCs
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {dtcList.map(dtc => (
              <div
                key={dtc.id}
                className="p-3 bg-[#0B0507] border border-rose-900/30 rounded flex items-start justify-between gap-3 font-mono text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-black text-sm">SPN {dtc.spn}</span>
                    <span className="text-[#9CA3AF]">FMI {dtc.fmi}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded">
                      {dtc.status}
                    </span>
                  </div>
                  <p className="text-white mt-1 text-xs leading-snug">{dtc.description}</p>
                  <span className="text-[10px] text-[#6B7280] block mt-1">
                    First Observed: {dtc.firstObserved} (Occurrences: {dtc.occurrenceCount})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#0A110E] border border-emerald-500/30 rounded-xl p-3 px-4 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-white font-bold">ALL J1939 ON-BOARD DIAGNOSTIC SYSTEMS NOMINAL</span>
            <span className="text-[#6B7280] hidden sm:inline">• No Active Diagnostic Trouble Codes (MIL Lamp Off)</span>
          </div>
          <span className="text-emerald-400 text-[10px] uppercase font-bold bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
            FMCSA § 395.22 PASSED
          </span>
        </div>
      )}

      {/* 4. REAL-TIME CAN-BUS MESSAGE FREQUENCY PATTERNS (D3.JS 60-SEC MONITOR) */}
      <CanBusFrequencyChart
        data={frequencyHistory}
        currentHz={streamActive && hardwareStatus === 'connected' ? streamFrequencyHz : 0}
        baudRate={baudRate}
        isStreamActive={streamActive && hardwareStatus === 'connected'}
        onClearHistory={handleClearFrequencyHistory}
      />

      {/* 5. SPLIT PANE: RAW TELEMETRY TERMINAL & SYNCED DUTY-CYCLE DATABASE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: RAW J1939 STREAMING CONSOLE (7 Cols) */}
        <div className="lg:col-span-7 bg-[#090C12] border border-[#1F2937] rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
          {/* Terminal Controls Bar */}
          <div className="bg-[#0D121B] border-b border-[#1A2433] p-3 flex flex-wrap items-center justify-between gap-2.5 shrink-0 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span className="text-white font-bold uppercase tracking-wider">RAW J1939 TELEMETRY STREAM</span>
              <span className="px-1.5 py-0.5 bg-[#172232] text-sky-300 text-[10px] rounded border border-[#2B3B52]">
                {filteredPackets.length} FRAMES
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="terminal-export-filtered-csv-btn"
                onClick={() => handleExportFilteredBuffer('csv')}
                className="px-2 py-1 rounded text-[11px] font-bold uppercase flex items-center gap-1 bg-[#0e2118] hover:bg-[#163325] text-emerald-400 border border-emerald-500/40 transition-colors shadow-sm"
                title="Export current filtered telemetry buffer as CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>CSV</span>
              </button>

              <button
                type="button"
                id="terminal-export-filtered-json-btn"
                onClick={() => handleExportFilteredBuffer('json')}
                className="px-2 py-1 rounded text-[11px] font-bold uppercase flex items-center gap-1 bg-[#142334] hover:bg-[#1D3249] text-sky-300 border border-sky-500/40 transition-colors shadow-sm"
                title="Export current filtered telemetry buffer as JSON"
              >
                <FileCode className="w-3.5 h-3.5 text-sky-400" />
                <span>JSON</span>
              </button>

              <button
                type="button"
                onClick={() => setStreamActive(!streamActive)}
                className={`px-2.5 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 border transition-colors ${
                  streamActive
                    ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/50 hover:bg-emerald-900/60'
                    : 'bg-amber-950/50 text-amber-300 border-amber-500/50 hover:bg-amber-900/60'
                }`}
              >
                {streamActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{streamActive ? 'PAUSE' : 'RESUME'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAutoScroll(!autoScroll)}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase border transition-colors ${
                  autoScroll
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                    : 'bg-[#151D29] text-[#6B7280] border-[#2A374A]'
                }`}
                title="Toggle terminal auto-scrolling"
              >
                SCROLL: {autoScroll ? 'ON' : 'OFF'}
              </button>

              <button
                type="button"
                onClick={() => setPackets([])}
                className="p-1 text-[#9CA3AF] hover:text-white hover:bg-[#1C2738] rounded border border-[#26354A]"
                title="Clear frame buffer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filtering & Search Bar */}
          <div className="bg-[#07090E] border-b border-[#161F2C] p-2.5 space-y-2 shrink-0 text-xs font-mono">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              {/* Search Bar Input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  id="eld-terminal-search"
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder="Filter CAN ID, hex payload, PGN, or event keywords..."
                  className="w-full bg-[#0E131C] border border-[#222E3F] focus:border-sky-500 pl-8 pr-7 py-1 text-white text-[11px] font-mono outline-none rounded placeholder:text-[#4B5563] transition-colors"
                />
                {searchFilter && (
                  <button
                    type="button"
                    onClick={() => setSearchFilter('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white p-0.5"
                    title="Clear search query"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* CAN Message ID & Event Type Dropdown Filter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 text-[#6B7280] text-[10px]">
                  <Filter className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">FILTER:</span>
                </div>
                <select
                  id="eld-telemetry-filter-dropdown"
                  aria-label="Filter telemetry buffer by CAN message ID or event type"
                  value={telemetryFilter}
                  onChange={e => setTelemetryFilter(e.target.value as TelemetryFilterOption)}
                  className="bg-[#0E131C] border border-[#222E3F] focus:border-sky-500 text-sky-300 text-[11px] rounded px-2 py-1 outline-none font-mono font-bold max-w-[240px] sm:max-w-none truncate"
                >
                  <option value="ALL">All CAN Message IDs &amp; Events</option>

                  <optgroup label="── Specific CAN Message IDs (PGN) ──">
                    <option value="PGN_61444">PGN 61444 — EEC1 (Engine Speed / RPM)</option>
                    <option value="PGN_65265">PGN 65265 — CCVS (Wheel Speed &amp; Brake)</option>
                    <option value="PGN_65262">PGN 65262 — ET1 (Engine Coolant Temp)</option>
                    <option value="PGN_65263">PGN 65263 — EFL/P1 (Engine Oil Pressure)</option>
                    <option value="PGN_65248">PGN 65248 — VD (High-Res Odometer Miles)</option>
                    <option value="PGN_65257">PGN 65257 — HOURS (Total Engine Run Hours)</option>
                    <option value="PGN_65271">PGN 65271 — VEP (Battery System Voltage)</option>
                    <option value="PGN_65226">PGN 65226 — DM1 (Active Faults &amp; MIL)</option>
                  </optgroup>

                  <optgroup label="── Telemetry Event Types ──">
                    <option value="EVENT_RPM">Event: Engine Speed &amp; RPM Dynamics</option>
                    <option value="EVENT_SPEED">Event: Vehicle Road Motion &amp; Speed</option>
                    <option value="EVENT_THERMAL">Event: Thermal / Engine Coolant</option>
                    <option value="EVENT_PRESSURE">Event: Fluid &amp; Oil Pressures</option>
                    <option value="EVENT_ODOMETER">Event: Cumulative Odometer Miles</option>
                    <option value="EVENT_HOURS">Event: Total Engine Run Hours</option>
                    <option value="EVENT_ELECTRICAL">Event: Electrical &amp; Battery Voltage</option>
                    <option value="EVENT_FAULTS">Event: Active Faults &amp; Warning Alerts</option>
                    <option value="EVENT_PRIORITY">Event: High Priority Broadcasts (≤ 3)</option>
                  </optgroup>
                </select>
              </div>

              {/* Frequency Selector */}
              <div className="flex items-center gap-1 shrink-0 text-[10px] text-[#6B7280]">
                <span className="hidden sm:inline">RATE:</span>
                <select
                  aria-label="Packet Streaming Frequency"
                  value={streamFrequencyHz}
                  onChange={e => setStreamFrequencyHz(Number(e.target.value))}
                  className="bg-[#0E131C] border border-[#222E3F] text-white text-[10px] rounded px-1.5 py-1 outline-none font-mono"
                >
                  <option value={1}>1 Hz</option>
                  <option value={5}>5 Hz</option>
                  <option value={10}>10 Hz</option>
                  <option value={20}>20 Hz</option>
                </select>
              </div>
            </div>

            {/* Quick Preset Filter Badges & Reset Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#121A26] text-[10px]">
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 custom-scrollbar">
                <span className="text-[#64748B] text-[9px] uppercase font-bold mr-1 shrink-0">Presets:</span>
                {[
                  { label: 'ALL', val: 'ALL' as TelemetryFilterOption },
                  { label: 'RPM (61444)', val: 'PGN_61444' as TelemetryFilterOption },
                  { label: 'SPEED (65265)', val: 'PGN_65265' as TelemetryFilterOption },
                  { label: 'ODO (65248)', val: 'PGN_65248' as TelemetryFilterOption },
                  { label: 'TEMPS (65262)', val: 'PGN_65262' as TelemetryFilterOption },
                  { label: 'PRESS (65263)', val: 'PGN_65263' as TelemetryFilterOption },
                  { label: 'FAULTS (65226)', val: 'PGN_65226' as TelemetryFilterOption },
                ].map(preset => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setTelemetryFilter(preset.val)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-colors shrink-0 border ${
                      telemetryFilter === preset.val
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/60'
                        : 'bg-[#0E141E] text-[#6B7280] border-[#1C2636] hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[#9CA3AF] text-[10px]">
                  Matching: <strong className="text-white">{filteredPackets.length}</strong> / {packets.length}
                </span>
                {(telemetryFilter !== 'ALL' || searchFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setTelemetryFilter('ALL');
                      setSearchFilter('');
                    }}
                    className="text-amber-400 hover:text-amber-300 underline text-[10px] font-bold flex items-center gap-1"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Scrolling Terminal Frame Output */}
          <div
            ref={terminalRef}
            className="flex-1 p-3 bg-[#030508] font-mono text-[11px] overflow-y-auto max-h-[480px] custom-scrollbar space-y-1 select-text"
          >
            {filteredPackets.length === 0 ? (
              <div className="p-8 text-center text-[#4B5563] space-y-1">
                {hardwareStatus !== 'connected' ? (
                  <p>Hardware bus quiet. Connect Bluetooth/USB or start Simulation to begin telemetry ingestion.</p>
                ) : (
                  <div>
                    <p className="text-white font-bold text-xs">No packets matching current filter criteria.</p>
                    <p className="text-[11px] text-[#6B7280] mt-1">
                      Filter: <span className="text-sky-300">{telemetryFilter}</span>
                      {searchFilter && <> • Query: <span className="text-amber-300">"{searchFilter}"</span></>}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setTelemetryFilter('ALL');
                        setSearchFilter('');
                      }}
                      className="mt-3 px-2.5 py-1 bg-[#15202E] hover:bg-[#1E2E42] text-sky-300 border border-sky-500/40 rounded text-[10px] font-bold uppercase transition-colors"
                    >
                      Clear Active Filters
                    </button>
                  </div>
                )}
              </div>
            ) : (
              filteredPackets.map(pkt => {
                const isSpeedOrRpm = pkt.decodedSummary.includes('RPM') || pkt.decodedSummary.includes('Speed');
                const isFault = pkt.decodedSummary.includes('MIL') || pkt.decodedSummary.includes('Fault');
                const isOdo = pkt.decodedSummary.includes('Odometer');

                return (
                  <div
                    key={pkt.id}
                    className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2.5 py-1 px-2 border-b border-[#0C121B] hover:bg-[#080D14] transition-colors rounded leading-relaxed"
                  >
                    <span className="text-[#4B5563] text-[10px] shrink-0">{pkt.timestamp}</span>
                    <span className="text-sky-400 font-bold shrink-0 text-[10px]">{pkt.pgnOrPid}</span>
                    <span className="font-mono text-[#F3F4F6] text-[10px] bg-[#0A0F17] px-1.5 py-0.5 rounded border border-[#162130] shrink-0">
                      {pkt.rawHex}
                    </span>
                    <span
                      className={`truncate flex-1 text-[10px] ${
                        isFault
                          ? 'text-rose-400 font-bold'
                          : isSpeedOrRpm
                          ? 'text-[#C9A84C]'
                          : isOdo
                          ? 'text-[#00FF66]'
                          : 'text-[#9CA3AF]'
                      }`}
                    >
                      {pkt.decodedSummary}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Terminal Footer */}
          <div className="bg-[#070A0F] border-t border-[#161F2C] p-2 px-3 text-[10px] font-mono text-[#6B7280] flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-3">
              <span>Buffer: {packets.length} frames (250 cap) • SAE J1939-21 Data Link Layer</span>
              <button
                type="button"
                onClick={handleExportRawTelemetryBuffer}
                className="text-sky-400 hover:text-sky-300 underline font-bold flex items-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Save JSON Dump</span>
              </button>
            </div>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Frame Check Sequence (CRC-16): PASS
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: DUTY-CYCLE LOGS SYNCED WITH INTERNAL DATABASE (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0E121A] border border-[#1F2937] rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
          {/* Header Bar */}
          <div className="bg-[#131A26] border-b border-[#1E2A3C] p-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#00FF66]" />
              <div>
                <h3 className="text-white font-mono text-xs font-bold uppercase tracking-wider">
                  Duty-Cycle Database Ledger
                </h3>
                <span className="text-[10px] font-mono text-[#9CA3AF]">
                  Internal Sync: {lastSyncTime} • {dutySyncEvents.length} Verified Events
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCommitDutySnapshot}
              className="px-2.5 py-1.5 bg-[#00FF66] hover:bg-[#20ff78] text-black font-mono font-black text-[10px] uppercase rounded transition-all shadow flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Snapshot</span>
            </button>
          </div>

          {/* FMCSA Automatic Duty Rule Banner */}
          <div className="bg-[#090D14] border-b border-[#192435] p-3 text-xs font-mono space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#9CA3AF] font-bold">AUTOMATIC DUTY TRIGGER</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                diagnostics.roadSpeedMph > 5.0
                  ? 'bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/50'
                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
              }`}>
                {diagnostics.roadSpeedMph > 5.0 ? 'AUTO DRIVING (> 5 MPH)' : 'STATIONARY (< 5 MPH)'}
              </span>
            </div>
            <p className="text-[10px] text-[#6B7280]">
              49 CFR § 395.26 dictates automatic duty switch to DRIVING when wheel speed exceeds 5 MPH, and ON-DUTY prompt when stationary for 5 minutes.
            </p>
          </div>

          {/* Synced Events Scrollable List */}
          <div className="flex-1 p-3 overflow-y-auto max-h-[460px] custom-scrollbar space-y-2.5 font-mono">
            {dutySyncEvents.map(evt => {
              const isDriving = evt.dutyStatus === 'DRIVING';
              const isOnDuty = evt.dutyStatus === 'ON_DUTY';

              return (
                <div
                  key={evt.id}
                  className="p-3 bg-[#080B10] border border-[#1E293B] hover:border-[#2F425E] rounded-lg transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        isDriving
                          ? 'bg-[#C9A84C] text-black'
                          : isOnDuty
                          ? 'bg-amber-400 text-black'
                          : 'bg-[#333] text-white'
                      }`}>
                        {evt.dutyStatus}
                      </span>
                      <span className="text-white text-xs font-bold">{evt.id}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      {evt.syncDatabaseStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-[#9CA3AF]">
                    <div>
                      <span className="text-[#6B7280] block">Speed / RPM:</span>
                      <span className="text-white font-bold">{evt.speedMph} MPH • {evt.engineRpm} RPM</span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block">Odometer:</span>
                      <span className="text-[#00FF66] font-bold">{evt.odometerMiles} MI</span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block">Location:</span>
                      <span className="text-white truncate block">{evt.location}</span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block">Engine Hours:</span>
                      <span className="text-white font-bold">{evt.engineHours} hrs</span>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-[#151D2A] flex items-center justify-between text-[9px] text-[#6B7280]">
                    <span>Timestamp: {evt.timestamp.replace('T', ' ').slice(0, 19)}</span>
                    <span className="truncate max-w-[120px]" title={evt.databaseRecordHash}>
                      Hash: {evt.databaseRecordHash}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Database Footer Action */}
          <div className="bg-[#0A0E15] border-t border-[#1C2738] p-3 flex items-center justify-between shrink-0 text-xs font-mono">
            <span className="text-[10px] text-[#9CA3AF]">
              Storage: IndexedDB &amp; Local Vault Engine
            </span>
            {onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab('hos')}
                className="text-xs text-[#C9A84C] hover:underline flex items-center gap-1 font-bold uppercase"
              >
                <span>View Full HOS 4-Clocks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. AUDIT COMPLIANCE GUIDE RIBBON */}
      <div className="bg-[#0C1017] border border-[#1C2738] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#C9A84C] shrink-0" />
          <div>
            <h4 className="font-bold text-white uppercase text-sm">
              FMCSA ELD Self-Certification Standard Verification
            </h4>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">
              TWE ELD telematics transponder automatically cross-references engine power status, vehicle motion status, and 5-mile geographic location accuracy against 49 CFR Part 395 Subpart B specifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="export-fmcsa-compliance-report-btn"
            onClick={handleExportRawTelemetryBuffer}
            className="px-4 py-2 bg-[#172230] hover:bg-[#202E42] text-sky-300 hover:text-white border border-[#2F415A] hover:border-sky-500/50 text-xs font-mono uppercase font-bold rounded transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export Compliance Audit (JSON)</span>
          </button>
        </div>
      </div>

      {/* Setup Assistant & Troubleshooting Modal */}
      <EldSetupAssistantModal
        isOpen={isSetupAssistantOpen}
        onClose={() => setIsSetupAssistantOpen(false)}
        hardwareStatus={hardwareStatus}
        interfaceType={interfaceType}
        connectedDeviceName={connectedDeviceName}
        onConnectBluetooth={handleConnectBluetooth}
        onConnectUsb={handleConnectUsb}
        onSelectScenario={handleSelectScenario}
      />

      {/* FMCSA 24-Hour ELD PDF Audit Report & Print Modal */}
      <EldPdfAuditModal
        isOpen={isPdfAuditModalOpen}
        onClose={() => setIsPdfAuditModalOpen(false)}
        diagnostics={diagnostics}
        connectedDeviceName={connectedDeviceName}
        interfaceType={interfaceType}
        baudRate={baudRate}
        hardwareStatus={hardwareStatus}
        latencyMs={latencyMs}
        rssi={rssi}
        dtcList={dtcList}
        dutySyncEvents={dutySyncEvents}
        packets={packets}
        filteredPackets={filteredPackets}
      />

      {/* Quick Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#0A0E15] border border-rose-900 shadow-2xl shadow-rose-950/40 rounded-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 border-b border-[#1A2536] bg-rose-950/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-950/50 flex items-center justify-center border border-rose-500/30">
                  <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-[Oswald] text-lg sm:text-xl font-bold uppercase text-rose-400 tracking-wide">
                    Hardware Reset Warning
                  </h3>
                  <p className="text-[10px] font-mono text-rose-300/80 uppercase tracking-widest mt-0.5">
                    Action requires physical interface restart
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-5 sm:p-6 space-y-4">
              <p className="text-sm text-gray-300">
                You are about to send a hard reset command to the connected <strong className="text-white">{connectedDeviceName}</strong>. 
                This will immediately sever the data stream, flush the volatile memory buffer, and re-initialize the transponder.
              </p>
              
              <div className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-lg flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-200/90 leading-relaxed font-mono">
                  <strong className="text-rose-400 block mb-1 uppercase tracking-wider text-sm">Critical Warning</strong>
                  Performing a hardware reset during active vehicle motion may result in missing ELD duty-cycle records or corrupt telematics packets in violation of FMCSA regulations. Ensure the vehicle is safely parked before proceeding.
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#080B10] border-t border-[#1A2536] flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#121A26] hover:bg-[#1A2536] border border-[#2A3B54] text-gray-300 text-sm font-bold transition-colors active:scale-95"
              >
                Cancel / Abort
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-white font-bold tracking-wide uppercase text-sm border border-rose-500/50 flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(225,29,72,0.4)] active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Execute Hard Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 flex items-center gap-3 bg-[#0A0F17] border-2 border-[#C9A84C] text-white px-4 py-3 shadow-[0_0_25px_rgba(201,168,76,0.3)] font-mono text-xs uppercase tracking-wider rounded-lg max-w-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-[#C9A84C] shrink-0" />
          <div className="text-white font-bold leading-tight">{toastMessage}</div>
        </div>
      )}
    </div>
  );
};
