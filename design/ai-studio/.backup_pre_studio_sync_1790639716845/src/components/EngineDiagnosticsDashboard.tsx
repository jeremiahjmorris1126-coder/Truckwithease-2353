import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  Gauge,
  Fuel,
  Activity,
  Thermometer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Cpu,
  Download,
} from 'lucide-react';
import { EngineTelemetryPoint } from '../types';

type DriveMode = 'CRUISE' | 'CLIMB' | 'URBAN' | 'IDLE';

interface DriveModeConfig {
  name: string;
  label: string;
  rpmBase: number;
  rpmJitter: number;
  fuelBase: number;
  fuelJitter: number;
  loadBase: number;
  loadJitter: number;
  speedBase: number;
  speedJitter: number;
  coolantBase: number;
  oilBase: number;
  boostBase: number;
}

const DRIVE_MODES: Record<DriveMode, DriveModeConfig> = {
  CRUISE: {
    name: 'CRUISE',
    label: 'Highway Cruise (65 MPH)',
    rpmBase: 1380,
    rpmJitter: 40,
    fuelBase: 7.2,
    fuelJitter: 0.5,
    loadBase: 52,
    loadJitter: 5,
    speedBase: 65,
    speedJitter: 1.5,
    coolantBase: 192,
    oilBase: 48,
    boostBase: 22,
  },
  CLIMB: {
    name: 'CLIMB',
    label: 'Mountain Grade (6% Grade)',
    rpmBase: 1740,
    rpmJitter: 80,
    fuelBase: 14.8,
    fuelJitter: 1.2,
    loadBase: 88,
    loadJitter: 6,
    speedBase: 46,
    speedJitter: 3,
    coolantBase: 204,
    oilBase: 54,
    boostBase: 36,
  },
  URBAN: {
    name: 'URBAN',
    label: 'Urban Stop & Accel',
    rpmBase: 1560,
    rpmJitter: 150,
    fuelBase: 9.8,
    fuelJitter: 1.8,
    loadBase: 68,
    loadJitter: 12,
    speedBase: 32,
    speedJitter: 7,
    coolantBase: 196,
    oilBase: 50,
    boostBase: 28,
  },
  IDLE: {
    name: 'IDLE',
    label: 'High Idle / PTO Standby',
    rpmBase: 720,
    rpmJitter: 25,
    fuelBase: 1.1,
    fuelJitter: 0.15,
    loadBase: 18,
    loadJitter: 3,
    speedBase: 0,
    speedJitter: 0,
    coolantBase: 182,
    oilBase: 38,
    boostBase: 2,
  },
};

export const generateInitialHistory = (): EngineTelemetryPoint[] => {
  const points: EngineTelemetryPoint[] = [];
  const now = Date.now();
  const cfg = DRIVE_MODES.CRUISE;

  for (let i = 24; i >= 0; i--) {
    const timestamp = now - i * 1500;
    const date = new Date(timestamp);
    const timeStr = date.toTimeString().split(' ')[0];
    const jitter = Math.sin(i * 0.5);

    points.push({
      time: timeStr,
      timestamp,
      rpm: Math.round(cfg.rpmBase + jitter * cfg.rpmJitter + (Math.random() - 0.5) * 20),
      fuelRateGph: +(cfg.fuelBase + jitter * cfg.fuelJitter + (Math.random() - 0.5) * 0.2).toFixed(2),
      engineLoadPct: Math.round(cfg.loadBase + jitter * cfg.loadJitter),
      speedMph: +(cfg.speedBase + jitter * cfg.speedJitter).toFixed(1),
      coolantTempF: Math.round(cfg.coolantBase + (Math.random() - 0.5) * 2),
      oilPressurePsi: Math.round(cfg.oilBase + (Math.random() - 0.5) * 2),
      boostPressurePsi: Math.round(cfg.boostBase + (Math.random() - 0.5) * 3),
    });
  }
  return points;
};

// Custom Tooltip with cyber styling
const CustomTelemetryTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A0A0A]/95 border border-[#333] p-3 font-mono text-xs shadow-2xl backdrop-blur-sm z-50">
        <div className="text-[10px] text-[#888] uppercase tracking-wider mb-2 border-b border-[#222] pb-1 flex items-center justify-between gap-4">
          <span>TIME: {label}</span>
          <span className="text-[#C9A84C] font-bold">J1939 CAN PKT</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => {
            const isRpm = entry.dataKey === 'rpm';
            const isFuel = entry.dataKey === 'fuelRateGph';
            const isLoad = entry.dataKey === 'engineLoadPct';
            const isSpeed = entry.dataKey === 'speedMph';

            return (
              <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-[#AAA]">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}:
                </span>
                <span className="font-bold text-white">
                  {entry.value}{' '}
                  {isRpm ? 'RPM' : isFuel ? 'GPH' : isLoad ? '%' : isSpeed ? 'MPH' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export interface EngineDiagnosticsDashboardProps {
  onTelemetryDataChange?: (data: EngineTelemetryPoint[]) => void;
}

export const EngineDiagnosticsDashboard: React.FC<EngineDiagnosticsDashboardProps> = ({
  onTelemetryDataChange,
}) => {
  const [data, setData] = useState<EngineTelemetryPoint[]>(generateInitialHistory);
  const [driveMode, setDriveMode] = useState<DriveMode>('CRUISE');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [activeChart, setActiveChart] = useState<'rpm-speed' | 'fuel-load' | 'split'>('split');

  useEffect(() => {
    if (onTelemetryDataChange) {
      onTelemetryDataChange(data);
    }
  }, [data, onTelemetryDataChange]);

  // Current latest values
  const current = data[data.length - 1] || {
    rpm: 1380,
    fuelRateGph: 7.2,
    engineLoadPct: 52,
    speedMph: 65,
    coolantTempF: 192,
    oilPressurePsi: 48,
    boostPressurePsi: 22,
  };

  // Instantaneous MPG calculation: Speed / Fuel Rate (GPH)
  const currentMpg = current.fuelRateGph > 0 && current.speedMph > 0
    ? (current.speedMph / current.fuelRateGph).toFixed(1)
    : '0.0';

  // Live real-time interval simulation
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const cfg = DRIVE_MODES[driveMode];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      // Add controlled natural noise
      const noise = (Math.random() - 0.5) * 2;
      const newRpm = Math.max(
        600,
        Math.min(2200, Math.round(cfg.rpmBase + noise * cfg.rpmJitter))
      );
      const newFuel = Math.max(
        0.5,
        +(cfg.fuelBase + noise * cfg.fuelJitter).toFixed(2)
      );
      const newLoad = Math.max(
        10,
        Math.min(100, Math.round(cfg.loadBase + noise * cfg.loadJitter))
      );
      const newSpeed = Math.max(
        0,
        +(cfg.speedBase + noise * cfg.speedJitter).toFixed(1)
      );
      const newCoolant = Math.round(cfg.coolantBase + noise * 1.5);
      const newOil = Math.round(cfg.oilBase + noise * 1.2);
      const newBoost = Math.max(0, Math.round(cfg.boostBase + noise * 2));

      const newPoint: EngineTelemetryPoint = {
        time: timeStr,
        timestamp: now.getTime(),
        rpm: newRpm,
        fuelRateGph: newFuel,
        engineLoadPct: newLoad,
        speedMph: newSpeed,
        coolantTempF: newCoolant,
        oilPressurePsi: newOil,
        boostPressurePsi: newBoost,
      };

      setData((prev) => {
        const next = [...prev.slice(1), newPoint];
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isStreaming, driveMode]);

  const handleResetData = () => {
    setData(generateInitialHistory());
  };

  const handleExportData = () => {
    const payload = {
      reportType: 'OFFLINE_ENGINE_TELEMETRY_REPORT',
      system: 'TRUCKWITHEASE - Tactical Command Center',
      version: '4.12.0',
      exportTimestamp: new Date().toISOString(),
      driveMode,
      hardware: {
        vin: '1FUJGBD68HL92841',
        unit: 'TRACTOR #TR-904',
        powertrain: 'DETROIT DD15 14.8L (505 HP / 1,750 LB-FT)',
        canProtocol: 'SAE J1939 250 kbps ECM Mesh',
        baudRate: '250000 bps',
      },
      metricsSummary: {
        totalPointsSampled: data.length,
        timeSpan: `${data[0]?.time} to ${current?.time}`,
        latestValues: current,
        instantaneousMpg: currentMpg,
        rpm: {
          current: current.rpm,
          status: rpmStatus.label,
          average: Math.round(data.reduce((acc, p) => acc + p.rpm, 0) / data.length),
          max: Math.max(...data.map((p) => p.rpm)),
          min: Math.min(...data.map((p) => p.rpm)),
        },
        speedMph: {
          current: current.speedMph,
          average: +(data.reduce((acc, p) => acc + p.speedMph, 0) / data.length).toFixed(1),
          max: Math.max(...data.map((p) => p.speedMph)),
        },
        fuelRateGph: {
          current: current.fuelRateGph,
          average: +(data.reduce((acc, p) => acc + p.fuelRateGph, 0) / data.length).toFixed(2),
        },
        engineLoadPct: {
          current: current.engineLoadPct,
          average: Math.round(data.reduce((acc, p) => acc + p.engineLoadPct, 0) / data.length),
        },
        temperatures: {
          coolantTempF: current.coolantTempF,
          oilPressurePsi: current.oilPressurePsi,
          boostPressurePsi: current.boostPressurePsi,
        },
      },
      graphPoints: data,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `engine-telemetry-graph-data-${new Date().toISOString().slice(0, 10)}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // RPM Sweet Spot Status
  const getRpmStatus = (rpm: number) => {
    if (rpm < 900) return { label: 'LOW IDLE', color: 'text-amber-400' };
    if (rpm <= 1500) return { label: 'SWEET SPOT', color: 'text-[#C9A84C]' };
    if (rpm <= 1850) return { label: 'PEAK TORQUE', color: 'text-sky-400' };
    return { label: 'HIGH RANGE', color: 'text-rose-400' };
  };

  const rpmStatus = getRpmStatus(current.rpm);

  return (
    <div className="bg-[#141414] border border-[#222] p-4 sm:p-5 lg:p-6 space-y-6 shadow-xl">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#C9A84C]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] font-bold">
              // J1939 CAN-BUS ENGINE ECM TELEMETRY
            </span>
            <span className="px-2 py-0.5 bg-[#0A0A0A] border border-[#333] text-[#C9A84C] font-mono text-[9px] uppercase font-bold tracking-widest">
              250 KBPS ACTIVE
            </span>
          </div>
          <h2 className="font-headline text-xl sm:text-2xl uppercase text-white font-black tracking-tight mt-1 flex items-center gap-2">
            Engine Diagnostics &amp; Fuel Flow
            <span className="inline-block w-2 h-2 bg-[#C9A84C]" />
          </h2>
          <div className="text-[11px] font-mono text-[#777] mt-0.5 tracking-wider">
            VIN: <span className="text-[#AAA] font-bold">1FUJGBD68HL92841</span> · POWERTRAIN: <span className="text-[#AAA] font-bold">DETROIT DD15 14.8L (505 HP / 1,750 LB-FT)</span>
          </div>
        </div>

        {/* Live status & Playback controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0A0A0A] border border-[#222]">
            <span
              className={`w-2 h-2 rounded-full ${
                isStreaming ? 'bg-[#C9A84C] animate-pulse' : 'bg-[#666]'
              }`}
            />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#AAA]">
              {isStreaming ? 'STREAMING 1.2S' : 'STREAM PAUSED'}
            </span>
          </div>

          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-mono font-bold uppercase tracking-widest transition-all ${
              isStreaming
                ? 'bg-[#1C1C1C] hover:bg-[#252525] border-[#333] text-[#CCC]'
                : 'bg-[#C9A84C] hover:bg-white text-black border-[#C9A84C]'
            }`}
            title={isStreaming ? 'Pause live stream' : 'Resume live stream'}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isStreaming ? 'PAUSE' : 'RESUME'}</span>
          </button>

          <button
            onClick={handleResetData}
            className="p-1.5 bg-[#1C1C1C] hover:bg-[#252525] border border-[#333] text-[#888] hover:text-[#C9A84C] transition-colors"
            title="Reset telemetry buffer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            id="engine-diagnostics-export-btn"
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1C1C] hover:bg-[#252525] border border-[#333] hover:border-[#C9A84C] text-xs font-mono font-bold uppercase tracking-widest text-[#CCC] hover:text-[#C9A84C] transition-all"
            title="Export current graph data as JSON file for offline reporting"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">EXPORT JSON</span>
          </button>
        </div>
      </div>

      {/* Profile / Drive Cycle Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#0A0A0A] border border-[#222]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#C9A84C]" />
          <span className="text-[11px] font-mono text-[#888] uppercase tracking-wider font-bold">
            Simulated Load Cycle:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.keys(DRIVE_MODES) as DriveMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setDriveMode(mode)}
              className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                driveMode === mode
                  ? 'bg-[#C9A84C] text-black shadow-sm font-black'
                  : 'bg-[#141414] hover:bg-[#1C1C1C] text-[#888] hover:text-white border border-[#222]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Metric Dials / Gauges Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* RPM Card */}
        <div className="p-4 bg-[#0A0A0A] border border-[#222] relative overflow-hidden group hover:border-[#333] transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-[#777]">
            <span className="tracking-widest uppercase font-bold flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[#C9A84C]" />
              ENGINE RPM
            </span>
            <span className={`text-[10px] font-bold ${rpmStatus.color}`}>
              {rpmStatus.label}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight">
              {current.rpm.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-[#666] font-bold">RPM</span>
          </div>
          <div className="mt-3 w-full bg-[#1C1C1C] h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                current.rpm > 1900
                  ? 'bg-rose-500'
                  : current.rpm > 1600
                  ? 'bg-amber-400'
                  : 'bg-[#C9A84C]'
              }`}
              style={{ width: `${Math.min(100, (current.rpm / 2200) * 100)}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[9px] font-mono text-[#555]">
            <span>600 IDLE</span>
            <span className="text-[#C9A84C]">1100-1450 OPTIMAL</span>
            <span>2200 MAX</span>
          </div>
        </div>

        {/* Fuel Flow Card */}
        <div className="p-4 bg-[#0A0A0A] border border-[#222] relative overflow-hidden group hover:border-[#333] transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-[#777]">
            <span className="tracking-widest uppercase font-bold flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-[#C9A84C]" />
              FUEL FLOW
            </span>
            <span className="text-[10px] text-[#C9A84C] font-bold">
              {currentMpg} MPG INST
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-black text-[#C9A84C] tracking-tight">
              {current.fuelRateGph.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-[#666] font-bold">GAL/HR</span>
          </div>
          <div className="mt-3 w-full bg-[#1C1C1C] h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                current.fuelRateGph > 12 ? 'bg-amber-400' : 'bg-[#C9A84C]'
              }`}
              style={{ width: `${Math.min(100, (current.fuelRateGph / 20) * 100)}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[9px] font-mono text-[#555]">
            <span>0.8 IDLE</span>
            <span className="text-[#888]">FLEET TARGET &lt; 8.0</span>
            <span>20.0 MAX</span>
          </div>
        </div>

        {/* Engine Load & Speed Card */}
        <div className="p-4 bg-[#0A0A0A] border border-[#222] relative overflow-hidden group hover:border-[#333] transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-[#777]">
            <span className="tracking-widest uppercase font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#C9A84C]" />
              ENGINE LOAD
            </span>
            <span className="text-[10px] text-white font-bold">
              {current.speedMph} MPH
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight">
              {current.engineLoadPct}%
            </span>
            <span className="text-xs font-mono text-[#666] font-bold">DUTY CYCLE</span>
          </div>
          <div className="mt-3 w-full bg-[#1C1C1C] h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                current.engineLoadPct > 85
                  ? 'bg-rose-500'
                  : current.engineLoadPct > 70
                  ? 'bg-amber-400'
                  : 'bg-sky-400'
              }`}
              style={{ width: `${current.engineLoadPct}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[9px] font-mono text-[#555]">
            <span>0%</span>
            <span className="text-[#888]">BOOST: {current.boostPressurePsi} PSI</span>
            <span>100%</span>
          </div>
        </div>

        {/* Thermal & Pressures Card */}
        <div className="p-4 bg-[#0A0A0A] border border-[#222] relative overflow-hidden group hover:border-[#333] transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-[#777]">
            <span className="tracking-widest uppercase font-bold flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-[#C9A84C]" />
              THERMAL / OIL
            </span>
            <span className="text-[10px] text-[#C9A84C] font-bold">NOMINAL</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-1">
            <div>
              <span className="text-xl sm:text-2xl font-mono font-black text-white">
                {current.coolantTempF}°F
              </span>
              <span className="block text-[10px] font-mono text-[#666] uppercase font-bold">COOLANT</span>
            </div>
            <div className="h-7 w-[1px] bg-[#222]" />
            <div>
              <span className="text-xl sm:text-2xl font-mono font-black text-[#C9A84C]">
                {current.oilPressurePsi} PSI
              </span>
              <span className="block text-[10px] font-mono text-[#666] uppercase font-bold">OIL PRESS</span>
            </div>
          </div>
          <div className="mt-3 pt-1.5 border-t border-[#1C1C1C] flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#666] uppercase font-bold">DTC Status:</span>
            <span className="text-[#C9A84C] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#C9A84C]" />
              0 Active Faults
            </span>
          </div>
        </div>
      </div>

      {/* Chart View Switcher Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#888] uppercase tracking-wider font-bold">
            Telemetry Graphs:
          </span>
          <div className="flex items-center gap-1 bg-[#0A0A0A] border border-[#222] p-0.5">
            <button
              onClick={() => setActiveChart('split')}
              className={`px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider transition-colors ${
                activeChart === 'split'
                  ? 'bg-[#C9A84C] text-black'
                  : 'text-[#888] hover:text-[#C9A84C]'
              }`}
            >
              Dual Split
            </button>
            <button
              onClick={() => setActiveChart('rpm-speed')}
              className={`px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider transition-colors ${
                activeChart === 'rpm-speed'
                  ? 'bg-[#C9A84C] text-black'
                  : 'text-[#888] hover:text-[#C9A84C]'
              }`}
            >
              RPM &amp; Speed
            </button>
            <button
              onClick={() => setActiveChart('fuel-load')}
              className={`px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider transition-colors ${
                activeChart === 'fuel-load'
                  ? 'bg-[#C9A84C] text-black'
                  : 'text-[#888] hover:text-[#C9A84C]'
              }`}
            >
              Fuel &amp; Load
            </button>
          </div>
        </div>

        <div className="text-[11px] font-mono text-[#666]">
          ROLLING BUFFER: <span className="text-white font-bold">25 SAMPLES (30 SECONDS)</span>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="space-y-6">
        {(activeChart === 'rpm-speed' || activeChart === 'split') && (
          <div className="bg-[#0A0A0A] border border-[#222] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#C9A84C]" />
                <span className="font-headline text-sm font-bold uppercase tracking-wider text-white">
                  Engine Speed (RPM) &amp; Road Speed (MPH)
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-[#C9A84C]">
                  <span className="w-2.5 h-1 bg-[#C9A84C] inline-block" />
                  RPM (L-Axis)
                </span>
                <span className="flex items-center gap-1.5 text-sky-400">
                  <span className="w-2.5 h-1 bg-sky-400 inline-block" />
                  Road Speed (R-Axis)
                </span>
              </div>
            </div>

            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rpmGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C9A84C" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1E1E1E" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#555"
                    tick={{ fill: '#777', fontSize: 10, fontFamily: 'monospace' }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[500, 2200]}
                    stroke="#555"
                    tick={{ fill: '#C9A84C', fontSize: 10, fontFamily: 'monospace' }}
                    tickLine={false}
                    tickFormatter={(val) => `${val}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 85]}
                    stroke="#555"
                    tick={{ fill: '#38BDF8', fontSize: 10, fontFamily: 'monospace' }}
                    tickLine={false}
                    tickFormatter={(val) => `${val}m`}
                  />
                  <Tooltip content={<CustomTelemetryTooltip />} />
                  <ReferenceLine
                    yAxisId="left"
                    y={1450}
                    stroke="#C9A84C"
                    strokeDasharray="4 4"
                    strokeOpacity={0.6}
                  />
                  <ReferenceLine
                    yAxisId="left"
                    y={1950}
                    stroke="#EF4444"
                    strokeDasharray="3 3"
                    strokeOpacity={0.6}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="rpm"
                    name="Engine RPM"
                    stroke="#C9A84C"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#rpmGradient)"
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="speedMph"
                    name="Road Speed"
                    stroke="#38BDF8"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {(activeChart === 'fuel-load' || activeChart === 'split') && (
          <div className="bg-[#0A0A0A] border border-[#222] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4 text-[#C9A84C]" />
                <span className="font-headline text-sm font-bold uppercase tracking-wider text-white">
                  Fuel Consumption Rate (GPH) &amp; Engine Load (%)
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-1 bg-amber-400 inline-block" />
                  Fuel Burn (GPH)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-1 bg-emerald-400 inline-block" />
                  Load Factor (%)
                </span>
              </div>
            </div>

            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1E1E1E" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#555"
                    tick={{ fill: '#777', fontSize: 10, fontFamily: 'monospace' }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[0, 20]}
                    stroke="#555"
                    tick={{ fill: '#F59E0B', fontSize: 10, fontFamily: 'monospace' }}
                    tickLine={false}
                    tickFormatter={(val) => `${val}g`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    stroke="#555"
                    tick={{ fill: '#10B981', fontSize: 10, fontFamily: 'monospace' }}
                    tickLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip content={<CustomTelemetryTooltip />} />
                  <ReferenceLine
                    yAxisId="left"
                    y={8.0}
                    stroke="#F59E0B"
                    strokeDasharray="4 4"
                    strokeOpacity={0.6}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="fuelRateGph"
                    name="Fuel Rate"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#fuelGradient)"
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="engineLoadPct"
                    name="Engine Load"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Auxiliary CAN-Bus Diagnostics Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs font-mono pt-1">
        <div className="p-3 bg-[#0A0A0A] border border-[#222]">
          <div className="text-[10px] text-[#666] uppercase font-bold tracking-widest">DEF TANK FLUID</div>
          <div className="text-base font-black text-white mt-0.5">86% FULL</div>
          <div className="text-[10px] text-[#C9A84C] font-medium mt-0.5">Quality: Grade 1 ISO 22241</div>
        </div>

        <div className="p-3 bg-[#0A0A0A] border border-[#222]">
          <div className="text-[10px] text-[#666] uppercase font-bold tracking-widest">DPF SOOT LOAD</div>
          <div className="text-base font-black text-white mt-0.5">18% ACCUM</div>
          <div className="text-[10px] text-[#C9A84C] font-medium mt-0.5">Passive Regen Active</div>
        </div>

        <div className="p-3 bg-[#0A0A0A] border border-[#222]">
          <div className="text-[10px] text-[#666] uppercase font-bold tracking-widest">TURBO BOOST &amp; TACH</div>
          <div className="text-base font-black text-white mt-0.5">{current.boostPressurePsi} PSI</div>
          <div className="text-[10px] text-sky-400 font-medium mt-0.5">VGT Actuator: 64% Nominal</div>
        </div>

        <div className="p-3 bg-[#0A0A0A] border border-[#222]">
          <div className="text-[10px] text-[#666] uppercase font-bold tracking-widest">TRANSMISSION LOCK</div>
          <div className="text-base font-black text-white mt-0.5">GEAR 12 (DIRECT)</div>
          <div className="text-[10px] text-[#C9A84C] font-medium mt-0.5">Torque Converter Lockup</div>
        </div>
      </div>
    </div>
  );
};
