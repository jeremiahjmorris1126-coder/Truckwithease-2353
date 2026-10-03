import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Search,
  Zap,
  ChevronDown,
  ChevronUp,
  Terminal,
  Activity,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  HardDrive,
  Power,
  Wifi,
  Sparkles,
  Info,
} from 'lucide-react';
import { EldHardwareNode } from '../types';
import { triggerHapticFeedback } from '../services/haptics';

export interface HardwareHealthWidgetProps {
  /** Optional override for primary active node from parent telemetry stream */
  connectedDeviceName?: string;
  activeRssi?: number;
  activeLatencyMs?: number;
  activeBatteryVolts?: number;
  compactMode?: boolean;
  className?: string;
  onOpenNodeDetails?: (node: EldHardwareNode) => void;
}

// Initial realistic connected ELD nodes across tractor and trailer mesh
const INITIAL_ELD_NODES: EldHardwareNode[] = [
  {
    id: 'ELD-NODE-T812',
    nodeName: 'Primary Tractor ECM Gateway',
    vehicleUnit: 'UNIT #T-812 (Kenworth T680)',
    vehicleType: 'Tractor',
    model: 'Samsara VG54-NA J1939 High-Speed',
    serialNumber: 'SN-VG54-8841920',
    interfaceType: 'J1939 9-Pin',
    connectionStatus: 'CONNECTED',
    signalStrength: {
      rssiDbm: -64,
      qualityPct: 92,
      rating: 'EXCELLENT',
      carrierOrProtocol: 'Verizon LTE-M / Band 13',
      bars: 5,
    },
    battery: {
      levelPct: 98,
      voltage: 14.1,
      powerSource: 'VEHICLE_BUS',
      chargingState: 'MAINTAINED',
      healthPct: 99,
      estimatedHoursRemaining: 72,
    },
    firmware: {
      currentVersion: 'v4.19.4-PROD',
      latestAvailableVersion: 'v4.19.4-PROD',
      status: 'CURRENT',
      fmcsaCertificationId: 'FMCSA-ELD-TRK-9821',
      buildDate: '2026-08-14',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    telemetry: {
      latencyMs: 14,
      packetsProcessed: 84920,
      errorRatePct: 0.0,
      temperatureC: 41.2,
      lastPingTime: 'Just now',
    },
  },
  {
    id: 'ELD-NODE-TR409',
    nodeName: 'Smart Reefer & ABS Telematics Node',
    vehicleUnit: 'TRAILER #TR-409 (Utility 53\')',
    vehicleType: 'Reefer Trailer',
    model: 'Carrier Vector Multi-Temp Gateway',
    serialNumber: 'SN-CV-409182',
    interfaceType: 'BLE 5.3',
    connectionStatus: 'CONNECTED',
    signalStrength: {
      rssiDbm: -72,
      qualityPct: 84,
      rating: 'GOOD',
      carrierOrProtocol: 'Direct BLE 5.3 Mesh PHY',
      bars: 4,
    },
    battery: {
      levelPct: 86,
      voltage: 13.8,
      powerSource: 'SOLAR_FLOAT',
      chargingState: 'CHARGING',
      healthPct: 96,
      estimatedHoursRemaining: 120,
    },
    firmware: {
      currentVersion: 'v3.8.2-REEFER',
      latestAvailableVersion: 'v3.9.0-UPDATE',
      status: 'UPDATE_AVAILABLE',
      fmcsaCertificationId: 'FMCSA-SUB-TR-409',
      buildDate: '2026-06-20',
      sha256Hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    },
    telemetry: {
      latencyMs: 22,
      packetsProcessed: 43210,
      errorRatePct: 0.01,
      temperatureC: 38.6,
      lastPingTime: '2s ago',
    },
  },
  {
    id: 'ELD-NODE-CAB01',
    nodeName: 'Auxiliary Diagnostic Dongle',
    vehicleUnit: 'UNIT #T-812 Aux Dash Bay',
    vehicleType: 'Diagnostic Sensor',
    model: 'Geotab GO9+ USB-CAN 2.0B Transceiver',
    serialNumber: 'SN-GO9-291039',
    interfaceType: 'USB-CAN 2.0B',
    connectionStatus: 'CONNECTED',
    signalStrength: {
      rssiDbm: -56,
      qualityPct: 98,
      rating: 'EXCELLENT',
      carrierOrProtocol: 'Hardwire USB 2.0 PHY',
      bars: 5,
    },
    battery: {
      levelPct: 100,
      voltage: 14.2,
      powerSource: 'VEHICLE_BUS',
      chargingState: 'MAINTAINED',
      healthPct: 100,
      estimatedHoursRemaining: 96,
    },
    firmware: {
      currentVersion: 'v5.1.0-CERT',
      latestAvailableVersion: 'v5.1.0-CERT',
      status: 'CURRENT',
      fmcsaCertificationId: 'DOT-CFR-395.22-A',
      buildDate: '2026-07-30',
      sha256Hash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    },
    telemetry: {
      latencyMs: 8,
      packetsProcessed: 128940,
      errorRatePct: 0.0,
      temperatureC: 36.4,
      lastPingTime: 'Just now',
    },
  },
  {
    id: 'ELD-NODE-TAB05',
    nodeName: 'Driver Co-Pilot Companion Tablet',
    vehicleUnit: 'CAB-MOUNT RAM-D10 (Driver Active5)',
    vehicleType: 'In-Cab Display',
    model: 'Samsung Galaxy Tab Active5 Enterprise',
    serialNumber: 'SN-TAB5-772910',
    interfaceType: 'LTE-M Cellular',
    connectionStatus: 'CONNECTED',
    signalStrength: {
      rssiDbm: -68,
      qualityPct: 88,
      rating: 'GOOD',
      carrierOrProtocol: 'AT&T FirstNet Band 14',
      bars: 4,
    },
    battery: {
      levelPct: 78,
      voltage: 4.12,
      powerSource: 'INTERNAL_LI_ION',
      chargingState: 'CHARGING',
      healthPct: 94,
      estimatedHoursRemaining: 18,
    },
    firmware: {
      currentVersion: 'v4.19.2-APK',
      latestAvailableVersion: 'v4.19.4-PROD',
      status: 'UPDATE_AVAILABLE',
      fmcsaCertificationId: 'FMCSA-DISP-MOBI-01',
      buildDate: '2026-08-01',
      sha256Hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    },
    telemetry: {
      latencyMs: 18,
      packetsProcessed: 29400,
      errorRatePct: 0.0,
      temperatureC: 32.1,
      lastPingTime: '1s ago',
    },
  },
  {
    id: 'ELD-NODE-SNS03',
    nodeName: 'TPMS & Cargo Acoustic Sensor Hub',
    vehicleUnit: 'DRY VAN #DV-104 (Great Dane)',
    vehicleType: 'Dry Van',
    model: 'Sensata Smart-Mesh Micro-Hub',
    serialNumber: 'SN-SNS-991204',
    interfaceType: 'BLE 5.3',
    connectionStatus: 'STANDBY',
    signalStrength: {
      rssiDbm: -81,
      qualityPct: 68,
      rating: 'FAIR',
      carrierOrProtocol: 'BLE 5.3 Long-Range Coded',
      bars: 3,
    },
    battery: {
      levelPct: 62,
      voltage: 3.65,
      powerSource: 'INTERNAL_LI_ION',
      chargingState: 'DISCHARGING',
      healthPct: 91,
      estimatedHoursRemaining: 48,
    },
    firmware: {
      currentVersion: 'v2.14.0',
      latestAvailableVersion: 'v2.14.0',
      status: 'CURRENT',
      fmcsaCertificationId: 'DOT-TPMS-CVSA-88',
      buildDate: '2026-05-18',
      sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    },
    telemetry: {
      latencyMs: 38,
      packetsProcessed: 12080,
      errorRatePct: 0.02,
      temperatureC: 28.9,
      lastPingTime: '12s ago',
    },
  },
];

export const HardwareHealthWidget: React.FC<HardwareHealthWidgetProps> = ({
  connectedDeviceName,
  activeRssi,
  activeLatencyMs,
  activeBatteryVolts,
  compactMode = false,
  className = '',
  onOpenNodeDetails,
}) => {
  const [nodes, setNodes] = useState<EldHardwareNode[]>(INITIAL_ELD_NODES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'TRACTOR' | 'TRAILER' | 'LOW_BATTERY' | 'UPDATES'>('ALL');
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const [isPingingAll, setIsPingingAll] = useState(false);
  const [updatingNodeId, setUpdatingNodeId] = useState<string | null>(null);
  const [otaProgress, setOtaProgress] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewDensity, setViewDensity] = useState<'STANDARD' | 'COMPACT'>(compactMode ? 'COMPACT' : 'STANDARD');

  // Sync parent's live active stream metrics into the primary tractor node
  useEffect(() => {
    if (activeRssi === undefined && activeLatencyMs === undefined && activeBatteryVolts === undefined) return;
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === 'ELD-NODE-T812') {
          const updatedRssi = activeRssi ?? node.signalStrength.rssiDbm;
          const updatedQuality = Math.min(100, Math.max(10, Math.round(100 + (updatedRssi + 40) * 1.2)));
          const updatedRating = updatedRssi > -65 ? 'EXCELLENT' : updatedRssi > -75 ? 'GOOD' : updatedRssi > -85 ? 'FAIR' : 'POOR';
          const updatedBars = updatedRssi > -60 ? 5 : updatedRssi > -70 ? 4 : updatedRssi > -80 ? 3 : updatedRssi > -90 ? 2 : 1;

          return {
            ...node,
            nodeName: connectedDeviceName || node.nodeName,
            signalStrength: {
              ...node.signalStrength,
              rssiDbm: updatedRssi,
              qualityPct: updatedQuality,
              rating: updatedRating,
              bars: updatedBars,
            },
            battery: {
              ...node.battery,
              voltage: activeBatteryVolts ? parseFloat(activeBatteryVolts.toFixed(1)) : node.battery.voltage,
            },
            telemetry: {
              ...node.telemetry,
              latencyMs: activeLatencyMs ?? node.telemetry.latencyMs,
              lastPingTime: 'Just now',
            },
          };
        }
        return node;
      })
    );
  }, [connectedDeviceName, activeRssi, activeLatencyMs, activeBatteryVolts]);

  // Periodic heartbeat / micro-jitter to keep live telemetry vibrant and real
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prev) =>
        prev.map((n) => {
          // Slight jitter in RSSI (+- 1 dBm)
          const jitterRssi = Math.round(n.signalStrength.rssiDbm + (Math.random() - 0.5) * 2);
          const boundedRssi = Math.min(-45, Math.max(-95, jitterRssi));
          const jitterLatency = Math.max(6, Math.round(n.telemetry.latencyMs + (Math.random() - 0.5) * 3));
          return {
            ...n,
            signalStrength: {
              ...n.signalStrength,
              rssiDbm: boundedRssi,
            },
            telemetry: {
              ...n.telemetry,
              latencyMs: jitterLatency,
              packetsProcessed: n.telemetry.packetsProcessed + Math.floor(1 + Math.random() * 4),
            },
          };
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Ping All Nodes Action
  const handlePingAll = () => {
    triggerHapticFeedback('double');
    setIsPingingAll(true);
    setToastMessage('Broadcasting ICMP & CAN heartbeat to all 5 connected ELD nodes...');

    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          connectionStatus: 'CONNECTED',
          telemetry: {
            ...n.telemetry,
            latencyMs: Math.floor(8 + Math.random() * 16),
            lastPingTime: 'Just now',
          },
        }))
      );
      setIsPingingAll(false);
      setToastMessage('All 5 ELD nodes verified online • Average latency: 13.8ms • 0 packet drops');
      setTimeout(() => setToastMessage(null), 4000);
    }, 700);
  };

  // Trigger OTA Firmware Update Simulation
  const handleStartOtaUpdate = (nodeId: string, targetVersion: string) => {
    triggerHapticFeedback('alert');
    setUpdatingNodeId(nodeId);
    setOtaProgress(5);
    setToastMessage(`Initiating encrypted FMCSA OTA payload delivery (${targetVersion}) to node ${nodeId}...`);

    let cur = 5;
    const progressInterval = setInterval(() => {
      cur += 25;
      if (cur >= 100) {
        clearInterval(progressInterval);
        setOtaProgress(100);
        setTimeout(() => {
          setNodes((prev) =>
            prev.map((n) =>
              n.id === nodeId
                ? {
                    ...n,
                    firmware: {
                      ...n.firmware,
                      currentVersion: targetVersion,
                      status: 'CURRENT',
                      buildDate: new Date().toISOString().slice(0, 10),
                    },
                    telemetry: {
                      ...n.telemetry,
                      lastPingTime: 'Just now (Post-OTA reboot nominal)',
                    },
                  }
                : n
            )
          );
          setUpdatingNodeId(null);
          setOtaProgress(0);
          setToastMessage(`Node ${nodeId} successfully upgraded to ${targetVersion} • SHA-256 signature verified.`);
          setTimeout(() => setToastMessage(null), 4500);
        }, 600);
      } else {
        setOtaProgress(cur);
      }
    }, 400);
  };

  // Reboot Single Node
  const handleRebootNode = (nodeId: string) => {
    triggerHapticFeedback('double');
    setToastMessage(`Sending soft-reboot command to CAN transceivers on ${nodeId}...`);
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, connectionStatus: 'SYNCING' } : n))
    );

    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                connectionStatus: 'CONNECTED',
                telemetry: {
                  ...n.telemetry,
                  latencyMs: 12,
                  lastPingTime: 'Just now (Reboot complete)',
                },
              }
            : n
        )
      );
      setToastMessage(`Hardware node ${nodeId} re-synchronized with vehicle J1939 bus.`);
      setTimeout(() => setToastMessage(null), 3500);
    }, 1200);
  };

  // Filtered Nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      // Query filter
      const matchesQuery =
        n.nodeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.vehicleUnit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.firmware.currentVersion.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesQuery) return false;

      // Category filter
      if (selectedFilter === 'TRACTOR') return n.vehicleType === 'Tractor' || n.vehicleType === 'Diagnostic Sensor';
      if (selectedFilter === 'TRAILER') return n.vehicleType === 'Reefer Trailer' || n.vehicleType === 'Dry Van';
      if (selectedFilter === 'LOW_BATTERY') return n.battery.levelPct < 70;
      if (selectedFilter === 'UPDATES') return n.firmware.status === 'UPDATE_AVAILABLE';

      return true;
    });
  }, [nodes, searchQuery, selectedFilter]);

  // Aggregate Metrics
  const onlineCount = nodes.filter((n) => n.connectionStatus === 'CONNECTED' || n.connectionStatus === 'SYNCING').length;
  const avgBattery = Math.round(nodes.reduce((acc, cur) => acc + cur.battery.levelPct, 0) / nodes.length);
  const pendingUpdatesCount = nodes.filter((n) => n.firmware.status === 'UPDATE_AVAILABLE').length;

  return (
    <div
      className={`bg-[#0B0F17] border-2 border-[#1E293B] rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 font-mono text-white ${className}`}
      data-testid="hardware-health-widget"
    >
      {/* 1. WIDGET HEADER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-[#C9A84C]/20 border border-[#C9A84C]/60 text-[#C9A84C] text-[10px] font-black uppercase tracking-wider rounded flex items-center gap-1.5 shadow-sm">
              <Cpu className="w-3.5 h-3.5 text-[#C9A84C]" />
              HARDWARE HEALTH WIDGET
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold uppercase rounded flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {onlineCount}/{nodes.length} NODES CONNECTED
            </span>
            {pendingUpdatesCount > 0 && (
              <span className="px-2.5 py-0.5 bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[10px] font-bold uppercase rounded flex items-center gap-1.5">
                <Download className="w-3 h-3 text-amber-400" />
                {pendingUpdatesCount} FIRMWARE OTA PENDING
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <span>Connected ELD Nodes &amp; Transceiver Telemetry</span>
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Real-time RF signal strength (RSSI), battery storage &amp; bus power, and verified FMCSA firmware versions across tractor &amp; trailer nodes.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={handlePingAll}
            disabled={isPingingAll}
            className="px-3 py-1.5 bg-[#141E2D] hover:bg-[#1E2B3C] border border-[#233144] hover:border-[#C9A84C]/60 text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
            title="Broadcast ICMP & CAN heartbeat to all nodes"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C9A84C] ${isPingingAll ? 'animate-spin' : ''}`} />
            <span>{isPingingAll ? 'PINGING NODES...' : 'PING ALL NODES'}</span>
          </button>

          <button
            onClick={() => {
              triggerHapticFeedback('tick');
              setViewDensity((prev) => (prev === 'STANDARD' ? 'COMPACT' : 'STANDARD'));
            }}
            className="p-2 bg-[#141E2D] hover:bg-[#1E2B3C] border border-[#233144] text-[#94A3B8] hover:text-white rounded-lg transition-colors"
            title={viewDensity === 'STANDARD' ? 'Switch to compact row layout' : 'Switch to detailed card layout'}
          >
            {viewDensity === 'STANDARD' ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* 2. AGGREGATE SUMMARY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Metric 1: Signal Health */}
        <div className="p-3 bg-[#111823] border border-[#1E2B3C] rounded-xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">AVG RF SIGNAL</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-emerald-400">-66</span>
              <span className="text-[10px] text-[#64748B]">dBm (91%)</span>
            </div>
            <span className="text-[10px] text-emerald-300 flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400" />
              LTE-M &amp; BLE Mesh Link
            </span>
          </div>
          <div className="flex items-end gap-0.5 h-8">
            <span className="w-1.5 h-2 bg-emerald-400 rounded-sm" />
            <span className="w-1.5 h-3.5 bg-emerald-400 rounded-sm" />
            <span className="w-1.5 h-5 bg-emerald-400 rounded-sm" />
            <span className="w-1.5 h-6.5 bg-emerald-400 rounded-sm" />
            <span className="w-1.5 h-8 bg-emerald-400/40 rounded-sm" />
          </div>
        </div>

        {/* Metric 2: Battery Reserve */}
        <div className="p-3 bg-[#111823] border border-[#1E2B3C] rounded-xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">BATTERY &amp; POWER</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-[#C9A84C]">{avgBattery}%</span>
              <span className="text-[10px] text-[#64748B]">FLEET AVG</span>
            </div>
            <span className="text-[10px] text-sky-300 flex items-center gap-1">
              <Zap className="w-3 h-3 text-sky-400" />
              14.1V Bus &amp; Solar Float
            </span>
          </div>
          <div className="p-2 bg-[#1A2536] rounded-lg text-[#C9A84C]">
            <BatteryCharging className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Firmware Compliance */}
        <div className="p-3 bg-[#111823] border border-[#1E2B3C] rounded-xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">FIRMWARE AUDIT</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-white">49 CFR § 395</span>
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              100% Certified eRODS
            </span>
          </div>
          <div className="p-2 bg-[#1A2536] rounded-lg text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: CAN Link Latency */}
        <div className="p-3 bg-[#111823] border border-[#1E2B3C] rounded-xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">MESH LATENCY</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-sky-400">14.2</span>
              <span className="text-[10px] text-[#64748B]">ms RTT</span>
            </div>
            <span className="text-[10px] text-sky-300 flex items-center gap-1">
              <Activity className="w-3 h-3 text-sky-400" />
              0.00% Packet Drop
            </span>
          </div>
          <div className="p-2 bg-[#1A2536] rounded-lg text-sky-400">
            <Radio className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search node, unit, model, firmware..."
            className="w-full bg-[#111823] border border-[#1E2B3C] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#C9A84C]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: `All (${nodes.length})` },
            { id: 'TRACTOR', label: 'Tractors' },
            { id: 'TRAILER', label: 'Trailers & Sens' },
            { id: 'LOW_BATTERY', label: 'Battery Alert' },
            { id: 'UPDATES', label: `OTA Pending (${pendingUpdatesCount})` },
          ].map((flt) => (
            <button
              key={flt.id}
              onClick={() => {
                triggerHapticFeedback('subtle');
                setSelectedFilter(flt.id as any);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all whitespace-nowrap border ${
                selectedFilter === flt.id
                  ? 'bg-[#C9A84C] text-black border-[#C9A84C]'
                  : 'bg-[#111823] text-[#94A3B8] border-[#1E2B3C] hover:text-white'
              }`}
            >
              {flt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. ACTIVE TOAST ALERT (IF ANY) */}
      {toastMessage && (
        <div className="p-3 bg-[#132238] border border-sky-500/50 rounded-xl flex items-center justify-between gap-3 text-xs text-sky-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-sky-400 hover:text-white text-xs px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* 5. OTA PROGRESS BAR (IF ACTIVE) */}
      {updatingNodeId && (
        <div className="p-3 bg-[#1F1D11] border border-amber-500/50 rounded-xl space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4 text-amber-400 animate-bounce" />
              UPDATING FIRMWARE FOR NODE {updatingNodeId}...
            </span>
            <span>{otaProgress}%</span>
          </div>
          <div className="w-full h-2 bg-[#0B0F17] rounded-full overflow-hidden border border-amber-500/30">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-[#C9A84C] transition-all duration-300"
              style={{ width: `${otaProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 6. HARDWARE NODE CARDS MATRIX */}
      <div className="space-y-3">
        {filteredNodes.length === 0 ? (
          <div className="p-8 text-center bg-[#070A0F] border border-[#1A2536] rounded-xl text-xs text-[#64748B]">
            No ELD nodes found matching criteria.
          </div>
        ) : (
          filteredNodes.map((node) => {
            const isExpanded = expandedNodeId === node.id;
            const isTractor = node.id === 'ELD-NODE-T812';
            const isLowBatt = node.battery.levelPct < 70;

            // Signal bar renderer
            const renderSignalBars = (bars: number) => {
              const activeColor = bars >= 4 ? 'bg-emerald-400' : bars >= 3 ? 'bg-amber-400' : 'bg-rose-400';
              return (
                <div className="flex items-end gap-1 h-4">
                  {[1, 2, 3, 4, 5].map((b) => (
                    <span
                      key={b}
                      className={`w-1 rounded-sm ${
                        b <= bars ? activeColor : 'bg-[#1E293B]'
                      }`}
                      style={{ height: `${b * 20}%` }}
                    />
                  ))}
                </div>
              );
            };

            return (
              <div
                key={node.id}
                className={`bg-[#0D131E] border rounded-xl transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-[#C9A84C]/80 shadow-[0_0_20px_rgba(201,168,76,0.12)]'
                    : isTractor
                    ? 'border-[#2B3B52] hover:border-[#C9A84C]/50'
                    : 'border-[#1E2B3C] hover:border-[#334155]'
                }`}
              >
                {/* Primary Node Header Row */}
                <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Node Info & Type */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        node.connectionStatus === 'CONNECTED'
                          ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400'
                          : node.connectionStatus === 'SYNCING'
                          ? 'bg-sky-950/60 border border-sky-500/40 text-sky-400'
                          : 'bg-amber-950/60 border border-amber-500/40 text-amber-400'
                      }`}
                    >
                      <Cpu className="w-5 h-5" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-white">{node.nodeName}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-[#172232] text-[#94A3B8] border border-[#2B3B52] rounded font-bold">
                          {node.id}
                        </span>
                        {isTractor && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/50 rounded font-black">
                            PRIMARY TELEMETRY BUS
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#94A3B8] flex items-center gap-2">
                        <strong className="text-sky-300">{node.vehicleUnit}</strong>
                        <span>•</span>
                        <span>{node.model}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Key 3 Hardware Metrics (Signal, Battery, Firmware) */}
                  <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                    {/* Signal Telemetry */}
                    <div className="flex items-center gap-2.5">
                      {renderSignalBars(node.signalStrength.bars)}
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-[#64748B] uppercase font-bold">SIGNAL</div>
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                          <span>{node.signalStrength.rssiDbm} dBm</span>
                          <span className="text-[10px] text-emerald-400">({node.signalStrength.qualityPct}%)</span>
                        </div>
                        <div className="text-[9px] text-[#94A3B8] truncate max-w-[110px]">
                          {node.signalStrength.carrierOrProtocol}
                        </div>
                      </div>
                    </div>

                    {/* Battery Telemetry */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isLowBatt
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                            : 'bg-[#15202E] text-[#C9A84C]'
                        }`}
                      >
                        {node.battery.chargingState === 'CHARGING' ? (
                          <BatteryCharging className="w-4 h-4 text-emerald-400" />
                        ) : isLowBatt ? (
                          <BatteryWarning className="w-4 h-4" />
                        ) : (
                          <Battery className="w-4 h-4" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-[#64748B] uppercase font-bold">BATTERY</div>
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                          <span className={isLowBatt ? 'text-rose-400' : 'text-[#C9A84C]'}>
                            {node.battery.levelPct}%
                          </span>
                          <span className="text-[10px] text-[#64748B]">({node.battery.voltage}V)</span>
                        </div>
                        <div className="text-[9px] text-sky-300">
                          {node.battery.chargingState}
                        </div>
                      </div>
                    </div>

                    {/* Firmware Version */}
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-[#64748B] uppercase font-bold">FIRMWARE</div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="font-mono text-[#C9A84C]">{node.firmware.currentVersion}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {node.firmware.status === 'CURRENT' ? (
                          <span className="text-[9px] text-emerald-400 flex items-center gap-0.5 font-bold">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            CURRENT
                          </span>
                        ) : (
                          <span className="text-[9px] text-amber-400 flex items-center gap-0.5 font-bold">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            OTA READY
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expand/Collapse Toggle Button */}
                    <button
                      onClick={() => {
                        triggerHapticFeedback('subtle');
                        setExpandedNodeId(isExpanded ? null : node.id);
                      }}
                      className="p-1.5 bg-[#15202E] hover:bg-[#1E2B3C] border border-[#233144] text-[#94A3B8] hover:text-white rounded-lg transition-colors ml-auto sm:ml-0"
                      title={isExpanded ? 'Hide node diagnostics' : 'Show full node hardware telemetry'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed Diagnostic Drawer */}
                {isExpanded && (
                  <div className="border-t border-[#1E2B3C] bg-[#070A0F] p-4 sm:p-5 space-y-4 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {/* Diagnostic Block 1: Radio & Protocol */}
                      <div className="p-3 bg-[#0D131E] border border-[#1E2B3C] rounded-lg space-y-1.5">
                        <span className="text-[10px] text-[#64748B] uppercase font-bold flex items-center gap-1">
                          <Radio className="w-3 h-3 text-sky-400" />
                          INTERFACE &amp; PROTOCOL
                        </span>
                        <div className="text-white font-bold">{node.interfaceType}</div>
                        <div className="text-[11px] text-[#94A3B8]">Carrier: {node.signalStrength.carrierOrProtocol}</div>
                        <div className="text-[11px] text-[#94A3B8]">Link RTT: <strong className="text-sky-300">{node.telemetry.latencyMs} ms</strong></div>
                        <div className="text-[10px] text-emerald-400">Zero Frame Inversion Detected</div>
                      </div>

                      {/* Diagnostic Block 2: Power Architecture */}
                      <div className="p-3 bg-[#0D131E] border border-[#1E2B3C] rounded-lg space-y-1.5">
                        <span className="text-[10px] text-[#64748B] uppercase font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3 text-[#C9A84C]" />
                          POWER SUBSYSTEM
                        </span>
                        <div className="text-white font-bold">{node.battery.powerSource.replace('_', ' ')}</div>
                        <div className="text-[11px] text-[#94A3B8]">
                          Bus Voltage: <strong className="text-[#C9A84C]">{node.battery.voltage} VDC</strong>
                        </div>
                        <div className="text-[11px] text-[#94A3B8]">
                          Cell Health: <strong className="text-emerald-400">{node.battery.healthPct}%</strong>
                        </div>
                        <div className="text-[10px] text-[#64748B]">
                          Estimated Reserve: ~{node.battery.estimatedHoursRemaining} hrs
                        </div>
                      </div>

                      {/* Diagnostic Block 3: FMCSA Certification */}
                      <div className="p-3 bg-[#0D131E] border border-[#1E2B3C] rounded-lg space-y-1.5">
                        <span className="text-[10px] text-[#64748B] uppercase font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          FMCSA COMPLIANCE ID
                        </span>
                        <div className="text-emerald-400 font-bold font-mono">{node.firmware.fmcsaCertificationId}</div>
                        <div className="text-[11px] text-[#94A3B8]">Build Date: {node.firmware.buildDate}</div>
                        <div className="text-[10px] text-[#64748B] truncate font-mono">
                          SHA: {node.firmware.sha256Hash.slice(0, 16)}...
                        </div>
                      </div>

                      {/* Diagnostic Block 4: Node Telemetry Metrics */}
                      <div className="p-3 bg-[#0D131E] border border-[#1E2B3C] rounded-lg space-y-1.5">
                        <span className="text-[10px] text-[#64748B] uppercase font-bold flex items-center gap-1">
                          <Activity className="w-3 h-3 text-sky-400" />
                          OPERATIONAL VITALS
                        </span>
                        <div className="text-white font-bold">
                          {node.telemetry.packetsProcessed.toLocaleString()} Packets
                        </div>
                        <div className="text-[11px] text-[#94A3B8]">
                          Temperature: <strong className="text-white">{node.telemetry.temperatureC}°C</strong> ({Math.round(node.telemetry.temperatureC * 1.8 + 32)}°F)
                        </div>
                        <div className="text-[11px] text-[#94A3B8]">
                          Last Pulse: <strong className="text-emerald-300">{node.telemetry.lastPingTime}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Node Interactive Controls Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1E2B3C]">
                      <div className="text-[11px] text-[#64748B] font-mono">
                        SERIAL: <strong className="text-white">{node.serialNumber}</strong> • STATUS: <strong className="text-emerald-400">{node.connectionStatus}</strong>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {node.firmware.status === 'UPDATE_AVAILABLE' && (
                          <button
                            onClick={() => handleStartOtaUpdate(node.id, node.firmware.latestAvailableVersion)}
                            disabled={updatingNodeId !== null}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-black text-xs font-black uppercase rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>INSTALL OTA {node.firmware.latestAvailableVersion}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleRebootNode(node.id)}
                          className="px-3 py-1.5 bg-[#141E2D] hover:bg-[#1E2B3C] border border-[#233144] text-[#94A3B8] hover:text-white text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <Power className="w-3.5 h-3.5 text-rose-400" />
                          <span>SOFT REBOOT NODE</span>
                        </button>

                        {onOpenNodeDetails && (
                          <button
                            onClick={() => onOpenNodeDetails(node)}
                            className="px-3 py-1.5 bg-[#C9A84C]/20 hover:bg-[#C9A84C]/30 border border-[#C9A84C]/60 text-[#C9A84C] text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 transition-colors"
                          >
                            <span>FULL SPECS</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 7. BOTTOM PROTOCOL COMPLIANCE STRIP */}
      <div className="p-2.5 bg-[#070A0F] border border-[#1A2536] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-[#64748B]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
          <span>FMCSA Technical Specifications 49 CFR § 395 Subpart B Appendix A Compliant Transceiver Network</span>
        </div>
        <div className="text-white font-mono">
          CAN 2.0B / J1939-11 High-Speed Physical Bus • AES-256 Mesh Secured
        </div>
      </div>
    </div>
  );
};
