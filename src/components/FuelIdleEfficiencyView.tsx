import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Fuel,
  TrendingDown,
  Flame,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Clock,
  Layers,
  Search,
  Download,
  ShieldCheck,
  Activity,
  Sliders,
  X,
  Plus,
  Send,
  Sparkles,
  Zap,
  Printer,
  ChevronRight,
  Maximize2,
  Minimize2,
  Compass,
  DollarSign,
  Truck,
  Building2,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import {
  HIGH_IDLE_ZONES,
  HighIdleZone,
  HOURLY_EFFICIENCY_DATA,
  HourlyEfficiencyDataPoint,
  generateHeatmapMatrix,
  HeatmapMatrixCell,
  DAYS_OF_WEEK,
  FLEET_TRUCK_IDLE_RANKINGS,
  TruckIdleRanking,
  IDLE_CAUSE_DISTRIBUTION,
  IdleCauseDistribution,
} from '../data/fuelIdleData';
import { TacticalNotification } from '../types';

interface FuelIdleEfficiencyViewProps {
  onAddNotification?: (notification: TacticalNotification) => void;
  onNavigateToTab?: (tab: string) => void;
}

export type ScenarioPreset = 'STANDARD' | 'COLD_WEATHER' | 'PORT_GRIDLOCK' | 'CARB_OPTIMIZED';
export type FuelViewTab = 'HEATMAP_AND_MAP' | 'CORRIDOR_MAP_VIEW' | 'RECHARTS_ANALYTICS' | 'DETENTION_AUDIT';

export const FuelIdleEfficiencyView: React.FC<FuelIdleEfficiencyViewProps> = ({
  onAddNotification,
  onNavigateToTab,
}) => {
  // Navigation & View Mode
  const [activeViewTab, setActiveViewTab] = useState<FuelViewTab>('HEATMAP_AND_MAP');
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D' | 'Q3_2026'>('7D');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('ALL');
  const [activeScenario, setActiveScenario] = useState<ScenarioPreset>('STANDARD');
  const [minIdleThresholdMinutes, setMinIdleThresholdMinutes] = useState<number>(15);

  // Map & Zone Selection State
  const [selectedZone, setSelectedZone] = useState<HighIdleZone | null>(HIGH_IDLE_ZONES[0]);
  const [mapSearchQuery, setMapSearchQuery] = useState<string>('');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('ALL');
  const [showGeofenceRadii, setShowGeofenceRadii] = useState<boolean>(true);
  const [showLiveTrucksOnMap, setShowLiveTrucksOnMap] = useState<boolean>(true);
  const [showThermalGlow, setShowThermalGlow] = useState<boolean>(true);

  // Heatmap Matrix Interaction
  const [hoveredMatrixCell, setHoveredMatrixCell] = useState<HeatmapMatrixCell | null>(null);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string | null>(null);

  // Export & Notification Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [alertTargetUnit, setAlertTargetUnit] = useState<string>('UNIT #104-E');
  const [alertDirectiveMessage, setAlertDirectiveMessage] = useState<string>(
    'SHUT DOWN AUXILIARY IDLE: High-idle threshold exceeded (>15m) in geofenced rail yard. Switch to electric APU immediately.'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Heatmap matrix data calculation
  const matrixCells = useMemo(() => {
    let cells = generateHeatmapMatrix();
    if (activeScenario === 'COLD_WEATHER') {
      cells = cells.map((c) => {
        // Cold weather causes night-time sleeper idle spike
        const isNight = c.hour >= 20 || c.hour <= 6;
        const multiplier = isNight ? 1.85 : 1.2;
        const newPct = Math.min(85, +(c.idlePercent * multiplier).toFixed(1));
        const newGal = +(newPct * 1.1).toFixed(1);
        let lvl: 0 | 1 | 2 | 3 | 4 = 2;
        if (newPct < 15) lvl = 1;
        else if (newPct < 30) lvl = 2;
        else if (newPct < 50) lvl = 3;
        else lvl = 4;
        return {
          ...c,
          idlePercent: newPct,
          gallonsWasted: newGal,
          costLoss: +(newGal * 3.89).toFixed(2),
          level: lvl,
          primaryReason: isNight ? 'Extreme Cold In-Cab Heating Spike (-12°F)' : c.primaryReason,
        };
      });
    } else if (activeScenario === 'PORT_GRIDLOCK') {
      cells = cells.map((c) => {
        // Port gridlock spikes weekdays 8am to 6pm
        const isDayWeekday = c.dayIndex < 5 && c.hour >= 8 && c.hour <= 18;
        const multiplier = isDayWeekday ? 1.95 : 1.0;
        const newPct = Math.min(90, +(c.idlePercent * multiplier).toFixed(1));
        const newGal = +(newPct * 1.15).toFixed(1);
        let lvl: 0 | 1 | 2 | 3 | 4 = 2;
        if (newPct < 15) lvl = 1;
        else if (newPct < 30) lvl = 2;
        else if (newPct < 50) lvl = 3;
        else lvl = 4;
        return {
          ...c,
          idlePercent: newPct,
          gallonsWasted: newGal,
          costLoss: +(newGal * 3.89).toFixed(2),
          level: lvl,
          primaryReason: isDayWeekday ? 'Port & Rail Container Turnaround Gridlock' : c.primaryReason,
        };
      });
    } else if (activeScenario === 'CARB_OPTIMIZED') {
      cells = cells.map((c) => {
        // Clean idle APU reduces all cells significantly
        const newPct = Math.max(3.2, +(c.idlePercent * 0.28).toFixed(1));
        const newGal = +(newPct * 0.8).toFixed(1);
        let lvl: 0 | 1 | 2 | 3 | 4 = 0;
        if (newPct > 15) lvl = 1;
        return {
          ...c,
          idlePercent: newPct,
          gallonsWasted: newGal,
          costLoss: +(newGal * 3.89).toFixed(2),
          level: lvl,
          primaryReason: 'Electric Standby APU Operating at 0.1 gal/hr',
        };
      });
    }
    return cells;
  }, [activeScenario]);

  // Filtered Hourly Data
  const hourlyChartData = useMemo(() => {
    let data = [...HOURLY_EFFICIENCY_DATA];
    if (activeScenario === 'COLD_WEATHER') {
      data = data.map((d) => ({
        ...d,
        idleGallons: +(d.idleGallons * 1.6).toFixed(1),
        idlePercentage: +(d.idlePercentage * 1.45).toFixed(1),
        financialWaste: +(d.financialWaste * 1.6).toFixed(2),
        avgMpg: +(d.avgMpg * 0.88).toFixed(1),
      }));
    } else if (activeScenario === 'PORT_GRIDLOCK') {
      data = data.map((d) => ({
        ...d,
        idleGallons: +(d.idleGallons * 1.8).toFixed(1),
        idlePercentage: +(d.idlePercentage * 1.6).toFixed(1),
        financialWaste: +(d.financialWaste * 1.8).toFixed(2),
        avgMpg: +(d.avgMpg * 0.82).toFixed(1),
      }));
    } else if (activeScenario === 'CARB_OPTIMIZED') {
      data = data.map((d) => ({
        ...d,
        idleGallons: +(d.idleGallons * 0.25).toFixed(1),
        idlePercentage: +(d.idlePercentage * 0.25).toFixed(1),
        financialWaste: +(d.financialWaste * 0.25).toFixed(2),
        avgMpg: +(d.avgMpg * 1.18).toFixed(1),
      }));
    }

    if (selectedUnitFilter !== 'ALL') {
      const scale = selectedUnitFilter === 'UNIT #104-E' ? 1.4 : selectedUnitFilter === 'UNIT #520-M' ? 0.35 : 1.0;
      data = data.map((d) => ({
        ...d,
        idleGallons: +(d.idleGallons * scale).toFixed(1),
        drivingGallons: +(d.drivingGallons * scale).toFixed(1),
        totalGallons: +(d.totalGallons * scale).toFixed(1),
        financialWaste: +(d.financialWaste * scale).toFixed(2),
      }));
    }

    return data;
  }, [activeScenario, selectedUnitFilter]);

  // Filtered Zones
  const filteredZones = useMemo(() => {
    return HIGH_IDLE_ZONES.filter((zone) => {
      const matchesSearch =
        zone.name.toLowerCase().includes(mapSearchQuery.toLowerCase()) ||
        zone.city.toLowerCase().includes(mapSearchQuery.toLowerCase()) ||
        zone.state.toLowerCase().includes(mapSearchQuery.toLowerCase()) ||
        zone.primaryCause.toLowerCase().includes(mapSearchQuery.toLowerCase());

      const matchesSeverity =
        selectedSeverityFilter === 'ALL' || zone.severity === selectedSeverityFilter;

      const matchesUnit =
        selectedUnitFilter === 'ALL' || zone.topOffendingUnits.includes(selectedUnitFilter);

      return matchesSearch && matchesSeverity && matchesUnit;
    });
  }, [mapSearchQuery, selectedSeverityFilter, selectedUnitFilter]);

  // Aggregate Metrics
  const aggregateMetrics = useMemo(() => {
    const totalIdleGal = hourlyChartData.reduce((acc, d) => acc + d.idleGallons, 0);
    const totalDrivingGal = hourlyChartData.reduce((acc, d) => acc + d.drivingGallons, 0);
    const totalGal = totalIdleGal + totalDrivingGal;
    const avgIdlePct = totalGal > 0 ? (totalIdleGal / totalGal) * 100 : 0;
    const totalCostLoss = totalIdleGal * 3.89;
    const co2Lbs = totalIdleGal * 22.4; // ~22.4 lbs CO2 per gallon of diesel
    const potentialApuSavings = totalCostLoss * 0.78; // 78% recoverable with electric APU

    return {
      totalIdleGal: +totalIdleGal.toFixed(1),
      totalDrivingGal: +totalDrivingGal.toFixed(1),
      avgIdlePct: +avgIdlePct.toFixed(1),
      totalCostLoss: +totalCostLoss.toFixed(2),
      co2Lbs: Math.round(co2Lbs),
      potentialApuSavings: +potentialApuSavings.toFixed(2),
    };
  }, [hourlyChartData]);

  // Show temporary toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Send Driver In-Cab Idle Directive
  const handleSendDriverAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const notif: TacticalNotification = {
      id: `idle-alert-${Date.now()}`,
      time: 'Just now',
      title: `⚡ In-Cab Idle Directive: ${alertTargetUnit}`,
      description: alertDirectiveMessage,
      severity: 'warning',
      read: false,
    };

    if (onAddNotification) {
      onAddNotification(notif);
    }

    triggerToast(`TRANSMITTED TO ${alertTargetUnit}: High-Idle Shut-off Directive dispatched.`);
    setIsAlertModalOpen(false);
  };

  // Quick Detention Invoice Trigger
  const handleTriggerDetentionNotice = (zone: HighIdleZone) => {
    const billableHours = Math.max(0, (zone.avgDwellMinutes - 120) / 60);
    const billableAmount = (billableHours * 75).toFixed(2);
    
    const notif: TacticalNotification = {
      id: `detention-${zone.id}-${Date.now()}`,
      time: 'Just now',
      title: `Detention Claim Drafted: ${zone.name}`,
      description: `Logged ${zone.avgDwellMinutes} min dwell (Free time: 120m). Claim amount: $${billableAmount} @ $75/hr billing.`,
      severity: 'info',
      read: false,
    };

    if (onAddNotification) {
      onAddNotification(notif);
    }

    triggerToast(`DETENTION CLAIM FILED: $${billableAmount} for ${zone.name}`);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 font-sans">
      {/* ===================================================================== */}
      {/* === HEADER STRIP & OPERATIONAL HERO SUMMARY === */}
      {/* ===================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#C9A84C] font-mono text-[10px] uppercase font-bold tracking-widest">
              <Flame className="w-3.5 h-3.5 text-[#C9A84C]" />
              FLEET TELEMATICS // FUEL &amp; IDLE HEATMAP
            </span>
            <span className="px-2 py-0.5 bg-[#0A0A0A] border border-[#333] text-emerald-400 font-mono text-[10px] font-bold">
              ● J1939 CAN-BUS ENGINE INGESTION LIVE
            </span>
            <span className="text-[11px] text-[#777] font-mono">
              Diesel Base: $3.89 / Gal · FMCSA § 396
            </span>
          </div>

          <h1 className="font-headline text-2xl sm:text-3xl uppercase text-white font-black tracking-tight mt-1.5 flex items-center gap-2.5">
            Fleet Fuel &amp; Idle Efficiency Radar
            <span className="inline-block w-2.5 h-2.5 bg-[#C9A84C] animate-pulse" />
          </h1>

          <p className="text-xs font-mono text-[#888] mt-1 max-w-3xl">
            Recharts-driven thermal efficiency heatmaps, real-time geographic high-idle terminal clusters, and automated detention recovery for commercial heavy-duty fleets.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1C1C1C] hover:bg-[#252525] border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-amber-400" />
            <span>Driver Idle Directive</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#C9A84C] text-black font-black uppercase text-xs hover:bg-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Idle Audit (PDF)</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Alert Banner */}
      {toastMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-mono flex items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-[#888] hover:text-white">✕</button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* === TOP METRICS KANBAN CARDS === */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 font-mono">
        <div className="p-3.5 bg-[#141414] border border-[#222] relative overflow-hidden">
          <span className="text-[10px] text-[#777] uppercase font-bold block">AVG FLEET IDLE RATE</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-black ${
              aggregateMetrics.avgIdlePct > 25
                ? 'text-rose-400'
                : aggregateMetrics.avgIdlePct > 15
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}>
              {aggregateMetrics.avgIdlePct}%
            </span>
            <span className="text-[10px] text-[#666]">Target: &lt;5%</span>
          </div>
          <div className="w-full bg-[#0A0A0A] h-1.5 mt-2 border border-[#222]">
            <div
              className={`h-full ${aggregateMetrics.avgIdlePct > 25 ? 'bg-rose-500' : 'bg-amber-400'}`}
              style={{ width: `${Math.min(100, aggregateMetrics.avgIdlePct * 2)}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 bg-[#141414] border border-[#222]">
          <span className="text-[10px] text-[#777] uppercase font-bold block">TOTAL IDLE FUEL BURN</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-rose-400">{aggregateMetrics.totalIdleGal}</span>
            <span className="text-xs text-white">GAL</span>
          </div>
          <span className="text-[10px] text-[#888] block mt-1">
            Driving: {aggregateMetrics.totalDrivingGal} gal
          </span>
        </div>

        <div className="p-3.5 bg-[#141414] border border-[#222]">
          <span className="text-[10px] text-[#777] uppercase font-bold block">FINANCIAL WASTE LOSS</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-white">${aggregateMetrics.totalCostLoss}</span>
          </div>
          <span className="text-[10px] text-emerald-400 block mt-1">
            APU Recoupable: ${aggregateMetrics.potentialApuSavings}
          </span>
        </div>

        <div className="p-3.5 bg-[#141414] border border-[#222]">
          <span className="text-[10px] text-[#777] uppercase font-bold block">CO2 CARBON PENALTY</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-slate-200">{aggregateMetrics.co2Lbs.toLocaleString()}</span>
            <span className="text-[10px] text-[#777]">LBS</span>
          </div>
          <span className="text-[10px] text-amber-400/90 block mt-1">
            EPA Greenhouse Metric
          </span>
        </div>

        <div className="p-3.5 bg-[#141414] border border-[#222] col-span-2 lg:col-span-1">
          <span className="text-[10px] text-[#777] uppercase font-bold block">HIGH-IDLE HOTSPOTS</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#C9A84C]">{filteredZones.length}</span>
            <span className="text-xs text-slate-400">Terminals</span>
          </div>
          <span className="text-[10px] text-sky-400 block mt-1">
            Avg Dwell: {Math.round(filteredZones.reduce((a, z) => a + z.avgDwellMinutes, 0) / (filteredZones.length || 1))} mins
          </span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* === FILTER & SCENARIO CONTROL BAR === */}
      {/* ===================================================================== */}
      <div className="p-4 bg-[#141414] border border-[#222] flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        {/* View Tabs */}
        <div className="flex items-center gap-1.5 bg-[#0A0A0A] p-1 border border-[#333] overflow-x-auto">
          <button
            onClick={() => setActiveViewTab('HEATMAP_AND_MAP')}
            className={`px-3 py-1.5 font-bold uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeViewTab === 'HEATMAP_AND_MAP'
                ? 'bg-[#C9A84C] text-black'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Heatmap &amp; High-Idle Map</span>
          </button>

          <button
            onClick={() => setActiveViewTab('CORRIDOR_MAP_VIEW')}
            className={`px-3 py-1.5 font-bold uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeViewTab === 'CORRIDOR_MAP_VIEW'
                ? 'bg-[#C9A84C] text-black'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Geographic Terminal Radar</span>
          </button>

          <button
            onClick={() => setActiveViewTab('RECHARTS_ANALYTICS')}
            className={`px-3 py-1.5 font-bold uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeViewTab === 'RECHARTS_ANALYTICS'
                ? 'bg-[#C9A84C] text-black'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Recharts Analytics Matrix</span>
          </button>

          <button
            onClick={() => setActiveViewTab('DETENTION_AUDIT')}
            className={`px-3 py-1.5 font-bold uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeViewTab === 'DETENTION_AUDIT'
                ? 'bg-[#C9A84C] text-black'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Detention Recovery ($75/h)</span>
          </button>
        </div>

        {/* Scenario & Unit Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Scenario Presets */}
          <div className="flex items-center gap-1 bg-[#0A0A0A] border border-[#333] px-2 py-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span className="text-[10px] text-[#777] uppercase font-bold mr-1">SCENARIO:</span>
            <select
              value={activeScenario}
              onChange={(e) => {
                setActiveScenario(e.target.value as ScenarioPreset);
                triggerToast(`APPLIED SCENARIO: ${e.target.value.replace('_', ' ')}`);
              }}
              className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
            >
              <option value="STANDARD" className="bg-[#111]">Baseline Standard Ops</option>
              <option value="COLD_WEATHER" className="bg-[#111]">Extreme Cold Bunk Idle Spike</option>
              <option value="PORT_GRIDLOCK" className="bg-[#111]">Port &amp; Rail Gate Crisis</option>
              <option value="CARB_OPTIMIZED" className="bg-[#111]">CARB APU Zero-Idle Mode</option>
            </select>
          </div>

          {/* Unit Filter */}
          <select
            value={selectedUnitFilter}
            onChange={(e) => setSelectedUnitFilter(e.target.value)}
            className="bg-[#0A0A0A] border border-[#333] px-3 py-1.5 text-white outline-none font-bold"
          >
            <option value="ALL">All Fleet Power Units (5 Rigs)</option>
            {FLEET_TRUCK_IDLE_RANKINGS.map((trk) => (
              <option key={trk.unitNumber} value={trk.unitNumber}>
                {trk.unitNumber} — {trk.driverName} ({trk.idlePercentage}%)
              </option>
            ))}
          </select>

          {/* Time Range */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-[#0A0A0A] border border-[#333] px-3 py-1.5 text-white outline-none font-bold"
          >
            <option value="24H">Last 24 Hours</option>
            <option value="7D">7-Day Trend</option>
            <option value="30D">30-Day Audit</option>
            <option value="Q3_2026">Q3 2026 IFTA</option>
          </select>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* === TAB 1: COMBINED HEATMAP & HIGH-IDLE GEOGRAPHIC MAP === */}
      {/* ===================================================================== */}
      {(activeViewTab === 'HEATMAP_AND_MAP' || activeViewTab === 'CORRIDOR_MAP_VIEW') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Map Column (7 cols on Desktop) */}
          <div className={`${activeViewTab === 'CORRIDOR_MAP_VIEW' ? 'lg:col-span-12' : 'lg:col-span-7'} space-y-4`}>
            <div className="p-4 bg-[#141414] border border-[#222] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222] pb-3 font-mono text-xs">
                <div>
                  <h3 className="font-headline text-base font-black text-white uppercase flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#C9A84C]" />
                    High-Idle Freight Terminals &amp; Dwell Hotspots
                  </h3>
                  <p className="text-[11px] text-[#888] mt-0.5">
                    Click any hotspot halo to inspect dwell duration, wasted gallons, and dispatch mitigation commands.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#777] uppercase font-bold">SEVERITY:</span>
                  <select
                    value={selectedSeverityFilter}
                    onChange={(e) => setSelectedSeverityFilter(e.target.value)}
                    className="bg-[#0A0A0A] border border-[#333] px-2 py-1 text-white text-[11px] outline-none"
                  >
                    <option value="ALL">All Severities</option>
                    <option value="CRITICAL">Critical (&gt;4.0h/day)</option>
                    <option value="ELEVATED">Elevated (2.5-4.0h)</option>
                    <option value="MODERATE">Moderate (1.0-2.5h)</option>
                  </select>
                </div>
              </div>

              {/* Tactical Interactive Map Stage */}
              <div className="relative w-full h-[420px] bg-[#070B0E] border border-[#222] overflow-hidden rounded-sm select-none">
                {/* SVG Tactical Grid Layer */}
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                  <defs>
                    <pattern id="fuelGridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2A3B4C" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#fuelGridPattern)" />
                </svg>

                {/* Simulated US Map Coastline / Background Silhouette */}
                <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
                  <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent" />
                </div>

                {/* Map Control HUD Overlay */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-[#0A0A0A]/90 border border-[#333] p-1.5 backdrop-blur-sm font-mono text-[10px]">
                  <span className="text-[#C9A84C] font-bold">RADAR GIS:</span>
                  <button
                    onClick={() => setShowThermalGlow(!showThermalGlow)}
                    className={`px-2 py-0.5 border ${
                      showThermalGlow ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-transparent border-[#333] text-[#777]'
                    }`}
                  >
                    Thermal Halos
                  </button>
                  <button
                    onClick={() => setShowGeofenceRadii(!showGeofenceRadii)}
                    className={`px-2 py-0.5 border ${
                      showGeofenceRadii ? 'bg-sky-500/20 border-sky-500/40 text-sky-300' : 'bg-transparent border-[#333] text-[#777]'
                    }`}
                  >
                    Geofences
                  </button>
                  <button
                    onClick={() => setShowLiveTrucksOnMap(!showLiveTrucksOnMap)}
                    className={`px-2 py-0.5 border ${
                      showLiveTrucksOnMap ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-transparent border-[#333] text-[#777]'
                    }`}
                  >
                    Live Fleet Rigs
                  </button>
                </div>

                {/* Hotspot Markers Placed on Map */}
                {filteredZones.map((zone) => {
                  // Project Lat/Lng to Container Coordinates (US Geographic Bounding Box: Lat 25-50, Lng -125 to -65)
                  const xPercent = Math.max(8, Math.min(92, ((zone.lng - (-124)) / ( -66 - (-124))) * 100));
                  const yPercent = Math.max(8, Math.min(90, (1 - (zone.lat - 24) / (50 - 24)) * 100));
                  const isSelected = selectedZone?.id === zone.id;

                  const colorClass =
                    zone.severity === 'CRITICAL'
                      ? 'bg-rose-500 border-rose-400 text-rose-400'
                      : zone.severity === 'ELEVATED'
                      ? 'bg-amber-500 border-amber-400 text-amber-400'
                      : 'bg-yellow-500 border-yellow-400 text-yellow-400';

                  const haloColor =
                    zone.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 border-rose-500/40'
                      : zone.severity === 'ELEVATED'
                      ? 'bg-amber-500/20 border-amber-500/40'
                      : 'bg-yellow-500/20 border-yellow-500/40';

                  return (
                    <div
                      key={zone.id}
                      onClick={() => setSelectedZone(zone)}
                      style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
                    >
                      {/* Pulsing Thermal Halo */}
                      {showThermalGlow && (
                        <div
                          className={`absolute -inset-5 rounded-full border ${haloColor} animate-ping opacity-75`}
                        />
                      )}

                      {/* Geofence Perimeter Circle */}
                      {showGeofenceRadii && (
                        <div
                          className={`absolute -inset-8 rounded-full border border-dashed ${
                            isSelected ? 'border-[#C9A84C] bg-[#C9A84C]/10' : 'border-[#444]/60'
                          } transition-all`}
                        />
                      )}

                      {/* Main Interactive Hotspot Node */}
                      <div
                        className={`relative w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform ${
                          isSelected ? 'scale-125 ring-2 ring-white z-30' : 'group-hover:scale-110'
                        } ${
                          zone.severity === 'CRITICAL'
                            ? 'bg-rose-950/90 border-rose-500 text-rose-300'
                            : zone.severity === 'ELEVATED'
                            ? 'bg-amber-950/90 border-amber-500 text-amber-300'
                            : 'bg-yellow-950/90 border-yellow-500 text-yellow-300'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5" />
                      </div>

                      {/* City/State Tag */}
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/85 border border-[#333] px-1.5 py-0.5 text-[9px] font-mono font-bold text-white shadow-md pointer-events-none">
                        {zone.city}, {zone.state}
                        <span className="text-[#C9A84C] ml-1">({zone.avgDailyIdleHours}h)</span>
                      </div>
                    </div>
                  );
                })}

                {/* Live Fleet Power Units On Map */}
                {showLiveTrucksOnMap && (
                  <>
                    <div style={{ left: '68%', top: '34%' }} className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                      <div className="flex items-center gap-1 bg-[#0A0A0A]/90 border border-sky-500/50 px-1.5 py-0.5 rounded text-[8px] font-mono text-sky-300">
                        <Truck className="w-2.5 h-2.5 text-sky-400" />
                        <span>#104-E (DWELL 4.2h)</span>
                      </div>
                    </div>

                    <div style={{ left: '48%', top: '78%' }} className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                      <div className="flex items-center gap-1 bg-[#0A0A0A]/90 border border-emerald-500/50 px-1.5 py-0.5 rounded text-[8px] font-mono text-emerald-300">
                        <Truck className="w-2.5 h-2.5 text-emerald-400" />
                        <span>#208-T (APU ENGAGED)</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Map Bottom Legend */}
                <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between flex-wrap gap-2 bg-[#0A0A0A]/90 border border-[#222] px-3 py-1.5 text-[10px] font-mono text-[#AAA]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Critical (&gt;4.0h)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Elevated (2.5 - 4.0h)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-400" />
                      <span>Moderate (&lt;2.5h)</span>
                    </span>
                  </div>
                  <span className="text-[#666]">Coordinates: WGS84 GIS North America Freight Mesh</span>
                </div>
              </div>

              {/* Selected Zone Dossier Panel */}
              {selectedZone && (
                <div className="p-4 bg-[#0A0A0A] border border-[#333] space-y-3 font-mono text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222] pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#C9A84C]/20 text-[#C9A84C] text-[9px] font-bold uppercase">
                          {selectedZone.facilityType.replace(/_/g, ' ')}
                        </span>
                        <h4 className="text-white font-bold text-sm">{selectedZone.name}</h4>
                      </div>
                      <span className="text-[#777] text-[10px]">
                        {selectedZone.city}, {selectedZone.state} · Lat: {selectedZone.lat.toFixed(3)}°, Lng: {selectedZone.lng.toFixed(3)}°
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTriggerDetentionNotice(selectedZone)}
                        className="px-3 py-1 bg-[#1C1C1C] hover:bg-[#252525] border border-[#C9A84C]/40 text-[#C9A84C] font-bold text-[11px] uppercase flex items-center gap-1"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>File Detention Claim</span>
                      </button>

                      <button
                        onClick={() => {
                          setAlertTargetUnit(selectedZone.topOffendingUnits[0] || 'UNIT #104-E');
                          setIsAlertModalOpen(true);
                        }}
                        className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[11px] uppercase flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Alert Trucks</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-[#141414] border border-[#222]">
                      <span className="text-[9px] text-[#666] uppercase block">AVG DAILY IDLE</span>
                      <span className="text-base font-bold text-rose-400">{selectedZone.avgDailyIdleHours} hrs/day</span>
                    </div>
                    <div className="p-2.5 bg-[#141414] border border-[#222]">
                      <span className="text-[9px] text-[#666] uppercase block">WASTED FUEL</span>
                      <span className="text-base font-bold text-white">{selectedZone.totalGallonsWastedDaily} gal/day</span>
                    </div>
                    <div className="p-2.5 bg-[#141414] border border-[#222]">
                      <span className="text-[9px] text-[#666] uppercase block">DAILY COST LOSS</span>
                      <span className="text-base font-bold text-white">${selectedZone.dailyFinancialLoss}</span>
                    </div>
                    <div className="p-2.5 bg-[#141414] border border-[#222]">
                      <span className="text-[9px] text-[#666] uppercase block">AVG DWELL TIME</span>
                      <span className="text-base font-bold text-[#C9A84C]">{selectedZone.avgDwellMinutes} mins</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#111] border border-[#222] space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-[#888]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span><strong>Primary Idle Cause:</strong> {selectedZone.primaryCause}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span><strong>Mitigation Action:</strong> {selectedZone.recommendedAction}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-[#1C1C1C]">
                      <span className="text-[#666]">Active Offending Fleet Rigs:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {selectedZone.topOffendingUnits.map((u) => (
                          <span key={u} className="px-1.5 py-0.2 bg-[#1C1C1C] border border-[#333] text-sky-400 text-[10px] font-bold">
                            {u}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Heatmap Matrix & Hourly Fuel Burn Column (5 cols on Desktop) */}
          {activeViewTab === 'HEATMAP_AND_MAP' && (
            <div className="lg:col-span-5 space-y-4 font-mono text-xs">
              {/* 2D Day-Hour Matrix Heatmap */}
              <div className="p-4 bg-[#141414] border border-[#222] space-y-3">
                <div className="flex items-center justify-between border-b border-[#222] pb-2.5">
                  <div>
                    <h3 className="font-headline text-base font-black text-white uppercase flex items-center gap-2">
                      <Flame className="w-4 h-4 text-[#C9A84C]" />
                      2D Fleet Idle Intensity Heatmap
                    </h3>
                    <p className="text-[10px] text-[#888]">
                      Hover over any time block to audit idle % and fuel waste.
                    </p>
                  </div>
                </div>

                {/* Matrix Grid */}
                <div className="space-y-1">
                  {/* Hours Header */}
                  <div className="grid grid-cols-13 gap-1 text-[8px] text-[#666] text-center font-bold">
                    <div className="text-left text-[#888]">DAY</div>
                    <div>12A</div>
                    <div>2A</div>
                    <div>4A</div>
                    <div>6A</div>
                    <div>8A</div>
                    <div>10A</div>
                    <div>12P</div>
                    <div>2P</div>
                    <div>4P</div>
                    <div>6P</div>
                    <div>8P</div>
                    <div>10P</div>
                  </div>

                  {/* Day Rows */}
                  {DAYS_OF_WEEK.map((day) => {
                    const dayCells = matrixCells.filter((c) => c.day === day);
                    return (
                      <div key={day} className="grid grid-cols-13 gap-1 items-center">
                        <div className="text-[10px] font-bold text-[#888]">{day}</div>
                        {dayCells.map((cell) => {
                          const isHovered =
                            hoveredMatrixCell?.day === cell.day &&
                            hoveredMatrixCell?.hour === cell.hour;

                          // Thermal Color Scale
                          let bg = 'bg-emerald-950/60 text-emerald-400 border-emerald-900/40';
                          if (cell.level === 1) bg = 'bg-yellow-950/70 text-yellow-300 border-yellow-800/40';
                          if (cell.level === 2) bg = 'bg-amber-900/80 text-amber-200 border-amber-600/50';
                          if (cell.level === 3) bg = 'bg-orange-800/90 text-orange-100 border-orange-500/60';
                          if (cell.level === 4) bg = 'bg-rose-700 text-white border-rose-400 font-black animate-pulse';

                          return (
                            <div
                              key={`${cell.day}-${cell.hour}`}
                              onMouseEnter={() => setHoveredMatrixCell(cell)}
                              onMouseLeave={() => setHoveredMatrixCell(null)}
                              className={`h-7 rounded-xs border text-[9px] flex items-center justify-center cursor-pointer transition-transform ${bg} ${
                                isHovered ? 'scale-125 z-20 ring-1 ring-white shadow-lg' : ''
                              }`}
                            >
                              {cell.idlePercent}%
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* Heatmap Tooltip Details Card */}
                {hoveredMatrixCell ? (
                  <div className="p-3 bg-[#0A0A0A] border border-[#C9A84C]/50 space-y-1 text-xs">
                    <div className="flex items-center justify-between border-b border-[#222] pb-1">
                      <span className="font-bold text-[#C9A84C]">
                        {hoveredMatrixCell.day} at {hoveredMatrixCell.hour}:00
                      </span>
                      <span className="font-bold text-rose-400">
                        {hoveredMatrixCell.idlePercent}% Idle Ratio
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#AAA]">
                      <span>Fuel Wasted: <strong className="text-white">{hoveredMatrixCell.gallonsWasted} gal</strong></span>
                      <span>Cost Penalty: <strong className="text-white">${hoveredMatrixCell.costLoss}</strong></span>
                    </div>
                    <div className="text-[10px] text-slate-300">
                      ⚡ <strong>Contributing Factor:</strong> {hoveredMatrixCell.primaryReason}
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-[#0A0A0A] border border-[#222] text-[10px] text-[#666] text-center italic">
                    Hover over any grid cell to view granular fuel burn and dwell factors.
                  </div>
                )}
              </div>

              {/* Recharts Hourly Idle vs Driving Fuel Chart */}
              <div className="p-4 bg-[#141414] border border-[#222] space-y-3">
                <div className="flex items-center justify-between border-b border-[#222] pb-2">
                  <h3 className="font-headline text-sm font-black text-white uppercase">
                    Hourly Fleet Fuel Consumed: Driving vs. Idle
                  </h3>
                  <span className="text-[10px] text-[#888]">Recharts Composed Model</span>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={hourlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis dataKey="displayHour" stroke="#666" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="left" stroke="#888" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="right" orientation="right" stroke="#C9A84C" tick={{ fontSize: 10 }} domain={[4, 9]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#333', color: '#FFF', fontSize: '11px' }}
                        formatter={(value: any, name: any) => {
                          if (name === 'idleGallons') return [`${value} gal`, 'Idle Wasted'];
                          if (name === 'drivingGallons') return [`${value} gal`, 'Driving Fuel'];
                          if (name === 'avgMpg') return [`${value} MPG`, 'Fleet MPG'];
                          return [value, name];
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar yAxisId="left" dataKey="drivingGallons" name="Driving Fuel (Gal)" fill="#3B82F6" stackId="a" />
                      <Bar yAxisId="left" dataKey="idleGallons" name="Idle Wasted (Gal)" fill="#EF4444" stackId="a" />
                      <Line yAxisId="right" type="monotone" dataKey="avgMpg" name="Fleet Moving MPG" stroke="#C9A84C" strokeWidth={2} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* === TAB 3: DEEP-DIVE RECHARTS ANALYTICS MATRIX === */}
      {/* ===================================================================== */}
      {activeViewTab === 'RECHARTS_ANALYTICS' && (
        <div className="space-y-5 font-mono text-xs">
          {/* Row 1: Fleet Trucks Idle Ranking & Root Cause Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Truck Idle Ranking (7 cols) */}
            <div className="lg:col-span-7 p-5 bg-[#141414] border border-[#222] space-y-4">
              <div className="flex items-center justify-between border-b border-[#222] pb-3">
                <div>
                  <h3 className="font-headline text-lg font-black text-white uppercase flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#C9A84C]" />
                    Fleet Power Units: Idle Duration vs. Fuel Loss Ranking
                  </h3>
                  <p className="text-xs text-[#888] mt-0.5">
                    Benchmarking individual rig engine hours against the 5% FMCSA Best Practice Threshold.
                  </p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={FLEET_TRUCK_IDLE_RANKINGS}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis type="number" stroke="#666" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="unitNumber" type="category" stroke="#FFF" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#333', color: '#FFF', fontSize: '11px' }}
                      formatter={(val: any, name: any) => {
                        if (name === 'idlePercentage') return [`${val}%`, 'Idle %'];
                        if (name === 'gallonsWasted') return [`${val} gal`, 'Gallons Burned'];
                        return [val, name];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="idlePercentage" name="Idle % of Total Run Time" fill="#EF4444" radius={[0, 4, 4, 0]}>
                      {FLEET_TRUCK_IDLE_RANKINGS.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.idlePercentage > 25 ? '#EF4444' : entry.idlePercentage > 15 ? '#F59E0B' : '#10B981'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Rigs Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#333] text-[10px] text-[#888] uppercase">
                      <th className="pb-2 font-bold">Unit / Driver</th>
                      <th className="pb-2 font-bold">Engine Hrs</th>
                      <th className="pb-2 font-bold">Idle Hrs</th>
                      <th className="pb-2 font-bold">Idle %</th>
                      <th className="pb-2 font-bold">Fuel Loss (Gal)</th>
                      <th className="pb-2 font-bold">Cost Loss ($)</th>
                      <th className="pb-2 font-bold">APU Status</th>
                      <th className="pb-2 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {FLEET_TRUCK_IDLE_RANKINGS.map((trk) => (
                      <tr key={trk.unitNumber} className="hover:bg-[#1A1A1A] transition-colors">
                        <td className="py-2.5 font-bold text-white">
                          <div>{trk.unitNumber}</div>
                          <span className="text-[10px] text-[#777] font-normal">{trk.driverName}</span>
                        </td>
                        <td className="py-2.5 text-slate-300">{trk.engineHours} hrs</td>
                        <td className="py-2.5 text-rose-400 font-bold">{trk.idleHours} hrs</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 text-[10px] font-bold ${
                            trk.idlePercentage > 25 ? 'bg-rose-500/20 text-rose-400' : trk.idlePercentage > 15 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {trk.idlePercentage}%
                          </span>
                        </td>
                        <td className="py-2.5 text-white font-bold">{trk.gallonsWasted} gal</td>
                        <td className="py-2.5 text-rose-400 font-bold">${trk.financialLoss}</td>
                        <td className="py-2.5">
                          <span className={trk.apuEquipped ? 'text-emerald-400' : 'text-slate-500'}>
                            {trk.apuEquipped ? '✓ Equipped' : '✗ No APU'}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => {
                              setAlertTargetUnit(trk.unitNumber);
                              setIsAlertModalOpen(true);
                            }}
                            className="px-2 py-1 bg-[#1C1C1C] hover:bg-[#252525] border border-[#333] text-amber-300 text-[10px] font-bold uppercase"
                          >
                            Directive
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Root Cause Distribution Pie Chart (5 cols) */}
            <div className="lg:col-span-5 p-5 bg-[#141414] border border-[#222] space-y-4">
              <div className="border-b border-[#222] pb-3">
                <h3 className="font-headline text-lg font-black text-white uppercase flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  Idle Root Cause Distribution
                </h3>
                <p className="text-xs text-[#888] mt-0.5">
                  Breakdown of operational conditions generating unproductive fuel burn.
                </p>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={IDLE_CAUSE_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="percentage"
                    >
                      {IDLE_CAUSE_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#333', color: '#FFF', fontSize: '11px' }}
                      formatter={(val: any, name: any) => [`${val}% (${IDLE_CAUSE_DISTRIBUTION.find(c => c.name === name)?.gallonsPerWeek} gal/wk)`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {IDLE_CAUSE_DISTRIBUTION.map((item) => (
                  <div key={item.name} className="p-2.5 bg-[#0A0A0A] border border-[#222] space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-white font-bold">{item.name}</span>
                      </div>
                      <span className="text-white font-black">{item.percentage}% ({item.gallonsPerWeek} gal)</span>
                    </div>
                    <p className="text-[10px] text-[#777]">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* === TAB 4: DETENTION RECOVERY AUDIT & SHIPPER BILLING === */}
      {/* ===================================================================== */}
      {activeViewTab === 'DETENTION_AUDIT' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-5 bg-[#141414] border border-[#222] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222] pb-3">
              <div>
                <h3 className="font-headline text-lg font-black text-white uppercase flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#C9A84C]" />
                  Shipper &amp; Receiver Detention Recovery Ledger
                </h3>
                <p className="text-xs text-[#888] mt-0.5">
                  Automated geofence time tracking. Free time: 2 hours (120 mins). Billable detention rate: $75.00/hour.
                </p>
              </div>

              <button
                onClick={() => setIsExportModalOpen(true)}
                className="px-4 py-2 bg-[#C9A84C] text-black font-black uppercase text-xs hover:bg-white"
              >
                Export Detention Invoices
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#333] text-[10px] text-[#888] uppercase">
                    <th className="pb-2 font-bold">Facility / Terminal</th>
                    <th className="pb-2 font-bold">Type</th>
                    <th className="pb-2 font-bold">Avg Dwell</th>
                    <th className="pb-2 font-bold">Free Time</th>
                    <th className="pb-2 font-bold">Excess Hours</th>
                    <th className="pb-2 font-bold">Idle Fuel Wasted</th>
                    <th className="pb-2 font-bold">Billable Detention</th>
                    <th className="pb-2 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {HIGH_IDLE_ZONES.map((zone) => {
                    const excessMins = Math.max(0, zone.avgDwellMinutes - 120);
                    const excessHours = +(excessMins / 60).toFixed(1);
                    const billableAmount = (excessHours * 75).toFixed(2);

                    return (
                      <tr key={zone.id} className="hover:bg-[#1A1A1A] transition-colors">
                        <td className="py-2.5 font-bold text-white">
                          <div>{zone.name}</div>
                          <span className="text-[10px] text-[#777] font-normal">{zone.city}, {zone.state}</span>
                        </td>
                        <td className="py-2.5 text-[#C9A84C]">{zone.facilityType.replace(/_/g, ' ')}</td>
                        <td className="py-2.5 text-slate-300">{zone.avgDwellMinutes} mins</td>
                        <td className="py-2.5 text-[#777]">120 mins</td>
                        <td className="py-2.5 text-rose-400 font-bold">{excessHours} hrs</td>
                        <td className="py-2.5 text-slate-300">{zone.totalGallonsWastedDaily} gal</td>
                        <td className="py-2.5 text-emerald-400 font-bold text-sm">${billableAmount}</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => handleTriggerDetentionNotice(zone)}
                            className="px-2.5 py-1 bg-[#1C1C1C] hover:bg-[#282828] border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase"
                          >
                            Issue Claim
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* === MODAL: DRIVER IN-CAB IDLE DIRECTIVE === */}
      {/* ===================================================================== */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#141414] border border-[#333] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-widest block">
                  SAFETY &amp; EFFICIENCY DIRECTIVE
                </span>
                <h3 className="font-headline text-xl uppercase font-black text-white">
                  Broadcast In-Cab Idle Shut-Off Notice
                </h3>
              </div>
              <button
                onClick={() => setIsAlertModalOpen(false)}
                className="text-[#666] hover:text-white font-mono text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendDriverAlert} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[#888] uppercase mb-1">Target Fleet Power Unit</label>
                <select
                  value={alertTargetUnit}
                  onChange={(e) => setAlertTargetUnit(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] p-2 text-white outline-none font-bold"
                >
                  {FLEET_TRUCK_IDLE_RANKINGS.map((trk) => (
                    <option key={trk.unitNumber} value={trk.unitNumber}>
                      {trk.unitNumber} — {trk.driverName} ({trk.idleHours} hrs idle)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#888] uppercase mb-1">Directive Message</label>
                <textarea
                  required
                  rows={3}
                  value={alertDirectiveMessage}
                  onChange={(e) => setAlertDirectiveMessage(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] p-2 text-white outline-none"
                />
              </div>

              <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 text-[10px] text-amber-200">
                ⚡ <strong>Transmission Method:</strong> This directive will trigger an in-cab HUD visual flash, haptic seat transducer pulse (SPE-2025), and dispatch messaging alert.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setIsAlertModalOpen(false)}
                  className="px-4 py-2 bg-[#1C1C1C] text-[#AAA] hover:text-white uppercase font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 text-black font-black uppercase text-xs hover:bg-white transition-colors"
                >
                  Transmit Directive Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* === MODAL: PRINTABLE / DOWNLOADABLE AUDIT MANIFEST === */}
      {/* ===================================================================== */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#141414] border border-[#333] p-6 space-y-4 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#C9A84C] uppercase font-bold tracking-widest block">
                  FMCSA § 396 // FLEET EFFICIENCY AUDIT MANIFEST
                </span>
                <h3 className="font-headline text-xl uppercase font-black text-white">
                  Fleet Fuel &amp; Idle Audit Summary
                </h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-[#666] hover:text-white font-mono text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="p-3 bg-[#0A0A0A] border border-[#222] grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-[9px] text-[#666] block uppercase">CARRIER USDOT</span>
                  <span className="text-white font-bold">#3928192 (TITAN)</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#666] block uppercase">AUDIT PERIOD</span>
                  <span className="text-white font-bold">{timeRange}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#666] block uppercase">TOTAL IDLE LOSS</span>
                  <span className="text-rose-400 font-bold">${aggregateMetrics.totalCostLoss}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#666] block uppercase">CO2 EMISSIONS</span>
                  <span className="text-amber-400 font-bold">{aggregateMetrics.co2Lbs} lbs</span>
                </div>
              </div>

              <div className="p-3 bg-[#0A0A0A] border border-[#222] space-y-2">
                <span className="text-[#888] font-bold uppercase text-[10px]">High-Idle Terminal Hotspots Monitored</span>
                <div className="divide-y divide-[#222]">
                  {HIGH_IDLE_ZONES.map((z) => (
                    <div key={z.id} className="py-1.5 flex items-center justify-between text-[11px]">
                      <span>{z.name} ({z.city}, {z.state})</span>
                      <span className="text-rose-400 font-bold">{z.avgDailyIdleHours} hrs/day (${z.dailyFinancialLoss}/day)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-2.5 bg-[#0E0E0E] border border-[#222] text-[10px] text-[#777]">
                SHA-256 Digest: e4f89d023b618991209bca782194f8910a390029bce781912903abdf0129091
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#222] font-mono text-xs">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 bg-[#1C1C1C] text-[#AAA] hover:text-white uppercase font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-[#C9A84C] text-black font-black uppercase hover:bg-white flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-black" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
