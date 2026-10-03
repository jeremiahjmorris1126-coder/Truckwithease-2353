import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Route,
  Activity,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Compass,
  Zap,
  RefreshCw,
  MapPin,
  ShieldAlert,
  Download,
  FileJson,
  Gauge,
  Clock,
  Layers,
  Bell,
  Plus,
  Play,
  Pause,
  Trash2,
  Flame,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { LOW_BRIDGE_HAZARDS } from '../data/mockData';
import { LowBridgeHazard, EngineTelemetryPoint, TacticalNotification } from '../types';
import { FreightGeographicMap } from './FreightGeographicMap';
import { LowBridgeProximityOverlay } from './LowBridgeProximityOverlay';
import {
  EngineDiagnosticsDashboard,
  generateInitialHistory,
} from './EngineDiagnosticsDashboard';
import {
  LOW_BRIDGE_TRAFFIC_CORRIDORS,
  getCongestionColor,
} from '../data/trafficCorridors';

export type TelemetryStreamFilter = 'ALL' | 'DATA_POINTS' | 'NOTIFICATIONS';

export interface TelemetryStreamItem {
  id: string;
  type: 'DATA_POINT' | 'NOTIFICATION';
  timestamp: string;
  dataPoint?: EngineTelemetryPoint;
  notification?: TacticalNotification;
}

interface TelemetryViewProps {
  latency: number;
  notifications?: TacticalNotification[];
  onAddNotification?: (notification: TacticalNotification) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const TelemetryView: React.FC<TelemetryViewProps> = ({
  latency,
  notifications,
  onAddNotification,
  onNavigateToTab,
}) => {
  const [hazards, setHazards] = useState<LowBridgeHazard[]>(LOW_BRIDGE_HAZARDS);
  const [isScanning, setIsScanning] = useState(false);
  const [simulatedVehicleHeight, setSimulatedVehicleHeight] = useState<number>(162); // 13' 6"
  const [graphData, setGraphData] = useState<EngineTelemetryPoint[]>(generateInitialHistory);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedHazardId, setSelectedHazardId] = useState<string | null>(null);

  // Live Telemetry & Notification Stream State
  const [streamFilter, setStreamFilter] = useState<TelemetryStreamFilter>('ALL');
  const [isStreamCollecting, setIsStreamCollecting] = useState<boolean>(true);
  const lastRecordedPointTimeRef = useRef<string>('');
  const prevNotificationsLengthRef = useRef<number>(notifications?.length || 0);

  const [streamItems, setStreamItems] = useState<TelemetryStreamItem[]>(() => {
    const initialHistory = generateInitialHistory();
    const recent = initialHistory.slice(-4).reverse();
    const items: TelemetryStreamItem[] = [];

    // Seed with initial tactical notification
    items.push({
      id: 'init-notif-fmcsa',
      type: 'NOTIFICATION',
      timestamp: new Date(Date.now() - 15000).toLocaleTimeString(),
      notification: {
        id: 'notif-bridge-mesh',
        title: 'FHWA Low Bridge Clearance Mesh Synced',
        description: '7,869 monitored overpasses synchronized with 13\' 6" Cascadia profile.',
        time: new Date(Date.now() - 15000).toLocaleTimeString(),
        severity: 'info',
        read: false,
      },
    });

    recent.forEach((pt, idx) => {
      items.push({
        id: `init-pt-${idx}-${pt.time}`,
        type: 'DATA_POINT',
        timestamp: pt.time,
        dataPoint: pt,
      });
    });

    return items;
  });

  // Listen for incoming notifications from parent App.tsx
  useEffect(() => {
    if (notifications && notifications.length > prevNotificationsLengthRef.current) {
      const newest = notifications[0];
      if (newest) {
        setStreamItems((prev) => {
          if (prev.some((item) => item.notification?.id === newest.id)) return prev;
          return [
            {
              id: `stream-notif-${newest.id}-${Date.now()}`,
              type: 'NOTIFICATION',
              timestamp: newest.time || new Date().toLocaleTimeString(),
              notification: newest,
            },
            ...prev.slice(0, 49),
          ];
        });
      }
    }
    prevNotificationsLengthRef.current = notifications?.length || 0;
  }, [notifications]);

  // Hook for EngineDiagnosticsDashboard live data updates
  const handleTelemetryDataChange = (data: EngineTelemetryPoint[]) => {
    setGraphData(data);
    if (data && data.length > 0 && isStreamCollecting) {
      const latest = data[data.length - 1];
      if (latest && latest.time && latest.time !== lastRecordedPointTimeRef.current) {
        lastRecordedPointTimeRef.current = latest.time;
        const newItem: TelemetryStreamItem = {
          id: `point-${latest.time}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: 'DATA_POINT',
          timestamp: latest.time,
          dataPoint: latest,
        };
        setStreamItems((prev) => [newItem, ...prev.slice(0, 49)]);
      }
    }
  };

  // Hook for adding a notification and prepending it to the animated stream
  const handleAddNotification = (n: TacticalNotification) => {
    const newItem: TelemetryStreamItem = {
      id: `notif-${n.id || Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'NOTIFICATION',
      timestamp: n.time || new Date().toLocaleTimeString(),
      notification: n,
    };
    setStreamItems((prev) => [newItem, ...prev.slice(0, 49)]);

    if (onAddNotification) {
      onAddNotification(n);
    }
  };

  // Quick manual simulator for testing stream item animations
  const handleSimulateDataPoint = () => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newPoint: EngineTelemetryPoint = {
      time: timeStr,
      timestamp: Date.now(),
      rpm: Math.round(1350 + (Math.random() - 0.5) * 140),
      speedMph: Math.round(64 + (Math.random() - 0.5) * 6),
      fuelRateGph: +(7.2 + (Math.random() - 0.5) * 0.9).toFixed(2),
      engineLoadPct: Math.round(52 + (Math.random() - 0.5) * 12),
      coolantTempF: Math.round(192 + (Math.random() - 0.5) * 4),
      oilPressurePsi: Math.round(48 + (Math.random() - 0.5) * 3),
      boostPressurePsi: Math.round(22 + (Math.random() - 0.5) * 4),
    };
    const newItem: TelemetryStreamItem = {
      id: `point-sim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'DATA_POINT',
      timestamp: timeStr,
      dataPoint: newPoint,
    };
    setStreamItems((prev) => [newItem, ...prev.slice(0, 49)]);
  };

  const handleSimulateNotification = () => {
    const simulatedAlerts: {
      title: string;
      desc: string;
      severity: 'info' | 'warning' | 'alert' | 'success';
    }[] = [
      {
        title: 'FHWA Low Bridge Threat Triggered',
        desc: 'Proximity radar detects 13\' 10" bridge clearance 1.8 miles ahead on I-80 MM 42.',
        severity: 'alert',
      },
      {
        title: 'Detroit DD15 ECM Telemetry Burst',
        desc: 'SAE J1939 CAN-bus 10Hz diagnostic frame packet ingested without jitter.',
        severity: 'info',
      },
      {
        title: 'Freight Corridor Delay Ping',
        desc: 'Borman Expressway I-94: Standstill detected, 14 min estimated delay.',
        severity: 'warning',
      },
      {
        title: 'Pneumatic Air Dump Deployed',
        desc: 'Suspension lowered by -3.5" to safely clear low overpass ceiling.',
        severity: 'success',
      },
    ];
    const pick = simulatedAlerts[Math.floor(Math.random() * simulatedAlerts.length)];
    const newNotif: TacticalNotification = {
      id: `sim-notif-${Date.now()}`,
      title: pick.title,
      description: pick.desc,
      time: new Date().toLocaleTimeString(),
      severity: pick.severity,
      read: false,
    };
    handleAddNotification(newNotif);
  };

  const handleClearStream = () => {
    setStreamItems([]);
  };

  // Filtered items
  const filteredStreamItems = streamItems.filter((item) => {
    if (streamFilter === 'DATA_POINTS') return item.type === 'DATA_POINT';
    if (streamFilter === 'NOTIFICATIONS') return item.type === 'NOTIFICATION';
    return true;
  });

  const countPoints = streamItems.filter((i) => i.type === 'DATA_POINT').length;
  const countNotifs = streamItems.filter((i) => i.type === 'NOTIFICATION').length;

  const handleScanRoutes = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 900);
  };

  const handleExportGraphData = () => {
    setIsExporting(true);
    const dataToExport = graphData && graphData.length > 0 ? graphData : generateInitialHistory();
    const latest = dataToExport[dataToExport.length - 1];

    const exportPayload = {
      reportType: 'OFFLINE_TELEMETRY_GRAPH_REPORT',
      system: 'TRUCKWITHEASE - Tactical Command Center',
      version: '4.12.0',
      exportTimestamp: new Date().toISOString(),
      reportStatus: 'VALIDATED_OFFLINE_READY',
      vehicleMetadata: {
        vin: '1FUJGBD68HL92841',
        unitNumber: 'TR-904',
        makeModel: 'Freightliner Cascadia 126',
        powertrain: 'Detroit DD15 14.8L (505 HP / 1,750 LB-FT)',
        transmission: 'DT12 Automated Manual 12-Speed',
        canBusProtocol: 'SAE J1939-11 (Shielded Twisted Pair 250kbps ECM Mesh)',
        fmcsaCompliance: '49 CFR § 395.26 ELD Telematics Spec Verified',
      },
      graphMetricsSummary: {
        totalSamplesRecorded: dataToExport.length,
        timeSpanWindow: `${dataToExport[0]?.time} to ${latest?.time}`,
        latestReading: latest,
        statistics: {
          rpm: {
            current: latest?.rpm,
            average: Math.round(dataToExport.reduce((acc, p) => acc + p.rpm, 0) / dataToExport.length),
            min: Math.min(...dataToExport.map((p) => p.rpm)),
            max: Math.max(...dataToExport.map((p) => p.rpm)),
          },
          speedMph: {
            current: latest?.speedMph,
            average: +(dataToExport.reduce((acc, p) => acc + p.speedMph, 0) / dataToExport.length).toFixed(1),
            max: Math.max(...dataToExport.map((p) => p.speedMph)),
          },
          fuelRateGph: {
            current: latest?.fuelRateGph,
            average: +(dataToExport.reduce((acc, p) => acc + p.fuelRateGph, 0) / dataToExport.length).toFixed(2),
            min: Math.min(...dataToExport.map((p) => p.fuelRateGph)),
            max: Math.max(...dataToExport.map((p) => p.fuelRateGph)),
          },
          engineLoadPct: {
            current: latest?.engineLoadPct,
            average: Math.round(dataToExport.reduce((acc, p) => acc + p.engineLoadPct, 0) / dataToExport.length),
            max: Math.max(...dataToExport.map((p) => p.engineLoadPct)),
          },
          engineTemperatures: {
            coolantTempF: latest?.coolantTempF,
            oilPressurePsi: latest?.oilPressurePsi,
            boostPressurePsi: latest?.boostPressurePsi,
          },
        },
      },
      graphPoints: dataToExport,
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `telemetry-graph-data-${new Date().toISOString().slice(0, 10)}-${Date.now()}.json`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice(`Exported ${dataToExport.length} telemetry points (${filename})`);
    setTimeout(() => {
      setIsExporting(false);
    }, 400);
    setTimeout(() => {
      setExportNotice(null);
    }, 5000);
  };

  return (
    <div className="flex flex-col w-full pb-8 px-3 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Title Strip */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#C9A84C] font-bold">
              // RADAR &amp; PACKET VECTORS
            </span>
            <span className="px-2 py-0.5 bg-[#141414] border border-[#333] text-[#C9A84C] font-mono text-[10px] uppercase font-bold tracking-widest">
              Edge Node Active
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl uppercase text-[#F5F5F5] font-black tracking-tighter mt-1 flex items-center gap-2">
            Live Telemetry Mesh
            <span className="inline-block w-2.5 h-2.5 bg-[#C9A84C]" />
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            id="export-graph-json-btn"
            onClick={handleExportGraphData}
            disabled={isExporting}
            className="flex items-center gap-1.5 bg-[#141414] hover:bg-[#1E1E1E] border border-[#333] hover:border-[#C9A84C] active:scale-95 text-[#C9A84C] px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-widest transition-all shadow-sm"
            title="Export current graph data as JSON file for offline reporting"
          >
            <Download className="w-3.5 h-3.5" />
            <FileJson className="w-3.5 h-3.5 hidden sm:inline text-[#C9A84C]" />
            <span>{isExporting ? 'EXPORTING...' : 'EXPORT GRAPH JSON'}</span>
          </button>

          <button
            id="ping-mesh-btn"
            onClick={handleScanRoutes}
            disabled={isScanning}
            className="flex items-center gap-1.5 bg-[#141414] hover:bg-[#222] border border-[#333] hover:border-[#C9A84C] active:scale-95 text-[#C9A84C] px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-widest transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'SCANNING...' : 'PING MESH'}</span>
          </button>
        </div>
      </div>

      {/* Export Notice Banner */}
      {exportNotice && (
        <div
          id="telemetry-export-success-banner"
          className="p-3 bg-[#112211] border border-[#225522] text-[#C9A84C] text-xs font-mono flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#C9A84C] shrink-0" />
            <span className="font-bold">// OFFLINE REPORT EXPORTED:</span>
            <span className="text-white">{exportNotice}</span>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-[#666] hover:text-white font-bold px-2 py-0.5"
            aria-label="Dismiss export notice"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mesh Network Proximity & Low Bridge Threat Radar Overlay */}
      <LowBridgeProximityOverlay
        simulatedVehicleHeight={simulatedVehicleHeight}
        onUpdateVehicleHeight={setSimulatedVehicleHeight}
        onAddNotification={handleAddNotification}
        onNavigateToTab={onNavigateToTab}
        selectedHazardId={selectedHazardId}
        onSelectHazard={(id) => setSelectedHazardId(id)}
      />

      {/* Google Maps Platform: Interactive Geographic Freight Corridor & Hazard Map */}
      <FreightGeographicMap
        hazards={hazards}
        simulatedVehicleHeight={simulatedVehicleHeight}
        onSelectHazard={(haz) => {
          setSelectedHazardId(haz.id);
        }}
      />

      {/* Real-Time Engine Diagnostics & Fuel Consumption (Recharts) */}
      <EngineDiagnosticsDashboard onTelemetryDataChange={handleTelemetryDataChange} />

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FHWA Low Bridges Radar on Left (7 cols on lg) */}
        <div className="lg:col-span-7 bg-[#141414] border border-[#222] p-4 sm:p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Route className="w-5 h-5 text-[#C9A84C]" />
              <div>
                <span className="font-headline text-sm sm:text-base font-black uppercase tracking-wider text-white block">
                  FHWA Low Bridge Clearance Radar
                </span>
                <span className="text-[10px] font-mono text-[#666] tracking-wider uppercase font-bold">
                  7,869 Monitored &lt;174" Overpasses Nationwide
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] uppercase font-black tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Traffic Congestion Synced
              </span>
              <span className="px-2.5 py-1 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] font-mono text-[10px] uppercase font-black tracking-widest">
                Live En-Route
              </span>
            </div>
          </div>

          {/* Vehicle height interactive reference */}
          <div className="p-3 bg-[#0A0A0A] border border-[#222] flex items-center justify-between text-xs font-mono flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#C9A84C]" />
              <span className="text-[#888] uppercase tracking-wider">Simulated Rig Height:</span>
              <span className="text-white font-black text-sm">
                {Math.floor(simulatedVehicleHeight / 12)}' {simulatedVehicleHeight % 12}" ({simulatedVehicleHeight}")
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSimulatedVehicleHeight((h) => Math.max(132, h - 2))}
                className="w-7 h-7 bg-[#1C1C1C] border border-[#333] hover:border-[#C9A84C] text-white hover:text-[#C9A84C] font-black text-sm transition-colors flex items-center justify-center"
                aria-label="Decrease vehicle height"
              >
                -
              </button>
              <button
                onClick={() => setSimulatedVehicleHeight((h) => Math.min(174, h + 2))}
                className="w-7 h-7 bg-[#1C1C1C] border border-[#333] hover:border-[#C9A84C] text-white hover:text-[#C9A84C] font-black text-sm transition-colors flex items-center justify-center"
                aria-label="Increase vehicle height"
              >
                +
              </button>
            </div>
          </div>

          {/* Hazard items list with real-time traffic congestion telemetry */}
          <div className="space-y-2.5">
            {hazards.map((haz) => {
              const isHazardous = simulatedVehicleHeight >= haz.clearanceInches - 4;
              const isSelected = selectedHazardId === haz.id;
              const corridor = LOW_BRIDGE_TRAFFIC_CORRIDORS.find((c) => c.hazardId === haz.id);
              const trafficBadge = corridor ? getCongestionColor(corridor.congestionLevel) : null;

              return (
                <div
                  key={haz.id}
                  onClick={() => setSelectedHazardId(haz.id)}
                  className={`p-4 border text-xs font-mono transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1E1E1E] border-[#C9A84C] ring-1 ring-[#C9A84C]'
                      : haz.status === 'CRITICAL' || isHazardous
                      ? 'bg-[#1C1111] border-rose-800/80 hover:border-rose-600'
                      : haz.status === 'RESTRICTED'
                      ? 'bg-[#1A1810] border-amber-800/70 hover:border-amber-600'
                      : 'bg-[#1C1C1C] border-[#222] hover:border-[#444]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <MapPin
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          haz.status === 'CRITICAL' || isHazardous
                            ? 'text-rose-400'
                            : 'text-[#C9A84C]'
                        }`}
                      />
                      <div>
                        <div className="font-bold text-white text-sm uppercase tracking-tight flex items-center gap-2 flex-wrap">
                          <span>{haz.route}</span>
                          {corridor && trafficBadge && (
                            <span
                              className={`px-1.5 py-0.5 text-[9px] font-black uppercase rounded border ${trafficBadge.badgeBg} ${trafficBadge.badgeText} ${trafficBadge.badgeBorder}`}
                            >
                              {corridor.congestionLevel} · {corridor.currentSpeedMph} MPH
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#888]">{haz.location}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-mono text-base font-black ${
                          haz.status === 'CRITICAL' || isHazardous
                            ? 'text-rose-400'
                            : 'text-[#C9A84C]'
                        }`}
                      >
                        {haz.clearanceFormatted}
                      </span>
                      <span className="block text-[10px] text-[#666] tracking-wider uppercase font-bold">{haz.fhwaCode}</span>
                    </div>
                  </div>

                  {/* Real-time traffic congestion telemetry bar for this monitored corridor */}
                  {corridor && (
                    <div className="mt-2.5 pt-2 border-t border-[#222] grid grid-cols-3 gap-2 text-[10px] bg-[#0C0C0C] p-2 border border-[#1C1C1C]">
                      <div>
                        <span className="text-[#666] uppercase block">Corridor Flow</span>
                        <span
                          className={`font-bold ${
                            corridor.congestionLevel === 'STANDSTILL'
                              ? 'text-rose-400'
                              : corridor.congestionLevel === 'HEAVY'
                              ? 'text-orange-400'
                              : corridor.congestionLevel === 'MODERATE'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {corridor.currentSpeedMph} MPH (Lim: {corridor.freeFlowSpeedMph})
                        </span>
                      </div>
                      <div>
                        <span className="text-[#666] uppercase block">Traffic Delay</span>
                        <span className="font-bold text-rose-400">
                          +{corridor.delayMinutes} MIN ({corridor.backupLengthMiles} mi backup)
                        </span>
                      </div>
                      <div>
                        <span className="text-[#666] uppercase block">Truck Volume</span>
                        <span className="font-bold text-white">
                          {corridor.truckVolumePerHour} Rigs/hr
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-[#222] flex items-center justify-between text-[11px]">
                    <span className="text-[#666] tracking-wider uppercase font-bold">Auto-Detour Vector:</span>
                    <span className="text-[#C9A84C] font-bold truncate max-w-[280px] sm:max-w-md">{haz.detourVector}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mesh Latency & Packet Stats Card on Right (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#141414] border border-[#222] p-4 sm:p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#C9A84C]" />
                <span className="font-headline text-sm font-black uppercase tracking-wider text-white">
                  Packet Delivery &amp; Node Health
                </span>
              </div>
              <span className="text-xs font-mono text-[#C9A84C] font-black tracking-wider uppercase">99.998% UPTIME</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="p-3 bg-[#0A0A0A] border border-[#222]">
                <div className="text-[10px] text-[#666] tracking-widest uppercase font-bold">MESH LATENCY</div>
                <div className="text-xl font-black text-white mt-1">{latency}MS</div>
                <div className="text-[10px] text-[#C9A84C] font-medium mt-0.5">Jitter: ±2ms</div>
              </div>
              <div className="p-3 bg-[#0A0A0A] border border-[#222]">
                <div className="text-[10px] text-[#666] tracking-widest uppercase font-bold">PACKET LOSS</div>
                <div className="text-xl font-black text-white mt-1">0.002%</div>
                <div className="text-[10px] text-[#C9A84C] font-medium mt-0.5">Zero Inversion</div>
              </div>
              <div className="p-3 bg-[#0A0A0A] border border-[#222]">
                <div className="text-[10px] text-[#666] tracking-widest uppercase font-bold">GPS SAMPLES</div>
                <div className="text-xl font-black text-white mt-1">10 HZ</div>
                <div className="text-[10px] text-[#888] font-medium mt-0.5">Dual L1/L5</div>
              </div>
            </div>

            {/* Real-time ping sparkline */}
            <div className="p-3.5 bg-[#0A0A0A] border border-[#222] space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-[#666] uppercase font-bold">
                <span>NODE PROBE WAVEFORM (LAST 30S)</span>
                <span className="text-[#C9A84C]">US-EAST-01 · {latency}MS</span>
              </div>
              <div className="h-12 flex items-end gap-1">
                {[42, 38, 45, 50, 39, 41, 48, 62, 44, 40, 39, 43, 46, 52, 41, 38, 40, 47, 44, 42].map(
                  (val, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-[#333] hover:bg-[#C9A84C] transition-colors"
                      style={{
                        height: `${(val / 70) * 100}%`,
                        backgroundColor: val > 50 ? '#C9A84C' : undefined,
                      }}
                    />
                  )
                )}
              </div>
            </div>
          </div>

          {/* Real-Time Telemetry & Notification Stream Feed with Smooth Fade-In Animation */}
          <div
            id="telemetry-stream-feed"
            className="bg-[#141414] border border-[#222] p-4 sm:p-5 space-y-4 shadow-md"
          >
            {/* Header & Status Indicator */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#C9A84C]" />
                <div>
                  <span className="font-headline text-sm font-black uppercase tracking-wider text-white block">
                    Telemetry &amp; Alert Stream
                  </span>
                  <span className="text-[10px] font-mono text-[#777] uppercase font-bold tracking-wider">
                    Smooth Motion Live Ingress
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 border text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                    isStreamCollecting
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                      : 'bg-amber-950/60 border-amber-500/40 text-amber-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isStreamCollecting ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  {isStreamCollecting ? 'INGESTING' : 'PAUSED'}
                </span>
                <span className="px-2 py-0.5 bg-[#0A0A0A] border border-[#222] text-[#AAA] font-mono text-[10px] font-bold">
                  {filteredStreamItems.length} ITEMS
                </span>
              </div>
            </div>

            {/* Filter Tabs & Interactive Action Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
              <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 border border-[#222]">
                <button
                  onClick={() => setStreamFilter('ALL')}
                  className={`px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                    streamFilter === 'ALL'
                      ? 'bg-[#C9A84C] text-black font-black'
                      : 'text-[#888] hover:text-white'
                  }`}
                >
                  ALL ({streamItems.length})
                </button>
                <button
                  onClick={() => setStreamFilter('DATA_POINTS')}
                  className={`px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                    streamFilter === 'DATA_POINTS'
                      ? 'bg-[#C9A84C] text-black font-black'
                      : 'text-[#888] hover:text-white'
                  }`}
                >
                  POINTS ({countPoints})
                </button>
                <button
                  onClick={() => setStreamFilter('NOTIFICATIONS')}
                  className={`px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                    streamFilter === 'NOTIFICATIONS'
                      ? 'bg-[#C9A84C] text-black font-black'
                      : 'text-[#888] hover:text-white'
                  }`}
                >
                  ALERTS ({countNotifs})
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  id="simulate-data-point-btn"
                  onClick={handleSimulateDataPoint}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#1C1C1C] hover:bg-[#282828] border border-[#333] hover:border-[#C9A84C] text-[10px] font-mono font-bold uppercase tracking-wider text-[#CCC] hover:text-[#C9A84C] transition-all active:scale-95"
                  title="Inject a real-time J1939 CAN-bus telemetry data point to observe the smooth fade-in animation"
                >
                  <Plus className="w-3 h-3 text-[#C9A84C]" />
                  <span>+ DATA POINT</span>
                </button>

                <button
                  id="simulate-alert-btn"
                  onClick={handleSimulateNotification}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#1C1C1C] hover:bg-[#282828] border border-[#333] hover:border-rose-500 text-[10px] font-mono font-bold uppercase tracking-wider text-[#CCC] hover:text-rose-400 transition-all active:scale-95"
                  title="Dispatch a tactical notification to observe the smooth fade-in animation"
                >
                  <Bell className="w-3 h-3 text-rose-400" />
                  <span>+ ALERT</span>
                </button>

                <button
                  onClick={() => setIsStreamCollecting(!isStreamCollecting)}
                  className="p-1 bg-[#1C1C1C] hover:bg-[#282828] border border-[#333] text-[#888] hover:text-white transition-colors"
                  title={isStreamCollecting ? 'Pause stream collection' : 'Resume stream collection'}
                >
                  {isStreamCollecting ? (
                    <Pause className="w-3 h-3 text-[#888]" />
                  ) : (
                    <Play className="w-3 h-3 text-[#C9A84C]" />
                  )}
                </button>

                <button
                  onClick={handleClearStream}
                  className="p-1 bg-[#1C1C1C] hover:bg-[#282828] border border-[#333] text-[#888] hover:text-rose-400 transition-colors"
                  title="Clear stream buffer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Scrollable Animated Stream List with Smooth Fade-In on Every Injected Item */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {filteredStreamItems.length === 0 ? (
                  <motion.div
                    key="empty-stream"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 text-center bg-[#0A0A0A] border border-dashed border-[#262626]"
                  >
                    <Radio className="w-6 h-6 text-[#555] mx-auto mb-2" />
                    <p className="text-xs text-[#888] font-mono uppercase tracking-wider">
                      Stream Buffer Empty
                    </p>
                    <p className="text-[11px] text-[#555] font-mono mt-1">
                      Click "+ DATA POINT" or "+ ALERT" above to inject live animated items
                    </p>
                  </motion.div>
                ) : (
                  filteredStreamItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -14, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{
                        opacity: 0,
                        scale: 0.95,
                        height: 0,
                        marginBottom: 0,
                        transition: { duration: 0.2 },
                      }}
                      transition={{
                        duration: 0.45,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className={`p-3 border text-xs font-mono transition-colors relative overflow-hidden ${
                        item.type === 'NOTIFICATION'
                          ? item.notification?.severity === 'alert'
                            ? 'bg-[#1C1111] border-rose-800/80 shadow-sm shadow-rose-950/20'
                            : item.notification?.severity === 'warning'
                            ? 'bg-[#1C1810] border-amber-700/70 shadow-sm shadow-amber-950/20'
                            : item.notification?.severity === 'success'
                            ? 'bg-[#101A14] border-emerald-800/70 shadow-sm shadow-emerald-950/20'
                            : 'bg-[#12161E] border-sky-800/70 shadow-sm shadow-sky-950/20'
                          : 'bg-[#0E0E0E] border-[#262626] hover:border-[#3E3E3E]'
                      }`}
                    >
                      {/* Telemetry Data Point Display */}
                      {item.type === 'DATA_POINT' && item.dataPoint && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono text-[#888] pb-1.5 border-b border-[#1E1E1E]">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C] font-bold uppercase tracking-wider">
                                ECM J1939 10Hz
                              </span>
                              <span className="text-[#AAA]">{item.timestamp}</span>
                            </div>
                            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              CAN STREAM
                            </span>
                          </div>

                          <div className="grid grid-cols-4 gap-1.5 pt-0.5 text-center">
                            <div className="bg-[#0A0A0A] p-1.5 border border-[#1A1A1A]">
                              <span className="text-[9px] text-[#666] uppercase block font-bold">Speed</span>
                              <span className="text-sm font-black text-white font-mono">
                                {item.dataPoint.speedMph}
                              </span>
                              <span className="text-[8px] text-[#777] block font-bold">MPH</span>
                            </div>
                            <div className="bg-[#0A0A0A] p-1.5 border border-[#1A1A1A]">
                              <span className="text-[9px] text-[#666] uppercase block font-bold">Engine</span>
                              <span className="text-sm font-black text-[#C9A84C] font-mono">
                                {item.dataPoint.rpm}
                              </span>
                              <span className="text-[8px] text-[#777] block font-bold">RPM</span>
                            </div>
                            <div className="bg-[#0A0A0A] p-1.5 border border-[#1A1A1A]">
                              <span className="text-[9px] text-[#666] uppercase block font-bold">Load</span>
                              <span className="text-sm font-black text-white font-mono">
                                {item.dataPoint.engineLoadPct}%
                              </span>
                              <span className="text-[8px] text-[#777] block font-bold">TORQUE</span>
                            </div>
                            <div className="bg-[#0A0A0A] p-1.5 border border-[#1A1A1A]">
                              <span className="text-[9px] text-[#666] uppercase block font-bold">Fuel Rate</span>
                              <span className="text-sm font-black text-white font-mono">
                                {item.dataPoint.fuelRateGph}
                              </span>
                              <span className="text-[8px] text-[#777] block font-bold">GPH</span>
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-[#1A1A1A] flex items-center justify-between text-[10px] text-[#888] font-mono">
                            <span>
                              Coolant: <strong className="text-white">{item.dataPoint.coolantTempF}°F</strong>
                            </span>
                            <span>
                              Oil: <strong className="text-white">{item.dataPoint.oilPressurePsi} PSI</strong>
                            </span>
                            <span>
                              Boost: <strong className="text-sky-400">{item.dataPoint.boostPressurePsi} PSI</strong>
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Tactical Notification Display */}
                      {item.type === 'NOTIFICATION' && item.notification && (
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              {item.notification.severity === 'alert' ? (
                                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                              ) : item.notification.severity === 'warning' ? (
                                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              ) : item.notification.severity === 'success' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              ) : (
                                <Bell className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-white uppercase tracking-tight text-xs">
                                    {item.notification.title}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border ${
                                      item.notification.severity === 'alert'
                                        ? 'bg-rose-950/80 border-rose-500/80 text-rose-300'
                                        : item.notification.severity === 'warning'
                                        ? 'bg-amber-950/80 border-amber-500/80 text-amber-300'
                                        : item.notification.severity === 'success'
                                        ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300'
                                        : 'bg-sky-950/80 border-sky-500/80 text-sky-300'
                                    }`}
                                  >
                                    {item.notification.severity.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#CCC] mt-1 leading-relaxed">
                                  {item.notification.description}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] text-[#777] font-mono shrink-0">
                              {item.timestamp}
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
