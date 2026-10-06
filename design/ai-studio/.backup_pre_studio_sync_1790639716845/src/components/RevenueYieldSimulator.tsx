import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Truck,
  Fuel,
  Scale,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Compass,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { triggerHapticFeedback } from '../services/haptics';

interface RevenueYieldSimulatorProps {
  onApplyStrategy?: (strategySummary: string) => void;
  className?: string;
}

export type FreightMode = 'DRY_VAN' | 'REEFER' | 'FLATBED' | 'EXPEDITED_TEAM';

interface ScenarioPreset {
  id: string;
  name: string;
  trucks: number;
  ratePerMile: number;
  dailyMiles: number;
  daysOnRoad: number;
  deadheadPct: number;
  mode: FreightMode;
}

const PRESET_SCENARIOS: ScenarioPreset[] = [
  {
    id: 'conservative',
    name: 'Conservative Spot',
    trucks: 6,
    ratePerMile: 2.85,
    dailyMiles: 480,
    daysOnRoad: 20,
    deadheadPct: 14,
    mode: 'DRY_VAN',
  },
  {
    id: 'optimal',
    name: 'TRUCKWITHEASE Target',
    trucks: 8,
    ratePerMile: 3.45,
    dailyMiles: 550,
    daysOnRoad: 22,
    deadheadPct: 9,
    mode: 'REEFER',
  },
  {
    id: 'aggressive',
    name: 'High-Yield Specialized',
    trucks: 12,
    ratePerMile: 4.25,
    dailyMiles: 620,
    daysOnRoad: 24,
    deadheadPct: 6,
    mode: 'EXPEDITED_TEAM',
  },
];

export const RevenueYieldSimulator: React.FC<RevenueYieldSimulatorProps> = ({
  onApplyStrategy,
  className = '',
}) => {
  // Core Operational Variables
  const [fleetTrucks, setFleetTrucks] = useState<number>(8);
  const [daysOnRoad, setDaysOnRoad] = useState<number>(22);
  const [dailyMiles, setDailyMiles] = useState<number>(540);
  const [ratePerMile, setRatePerMile] = useState<number>(3.35);
  const [deadheadPct, setDeadheadPct] = useState<number>(10);
  const [freightMode, setFreightMode] = useState<FreightMode>('REEFER');

  // Expense & Overhead Variables
  const [dieselPrice, setDieselPrice] = useState<number>(3.85);
  const [equipmentMpg, setEquipmentMpg] = useState<number>(6.9);
  const [driverPayCpm, setDriverPayCpm] = useState<number>(0.68);
  const [fixedOverheadPerTruck, setFixedOverheadPerTruck] = useState<number>(2100);
  const [accessorialDetentionRev, setAccessorialDetentionRev] = useState<number>(650);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showFeedbackToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFreightModeChange = (mode: FreightMode) => {
    triggerHapticFeedback('tick');
    setFreightMode(mode);
    switch (mode) {
      case 'DRY_VAN':
        setRatePerMile(2.95);
        setEquipmentMpg(7.2);
        break;
      case 'REEFER':
        setRatePerMile(3.45);
        setEquipmentMpg(6.7);
        break;
      case 'FLATBED':
        setRatePerMile(3.85);
        setEquipmentMpg(6.2);
        break;
      case 'EXPEDITED_TEAM':
        setRatePerMile(4.45);
        setEquipmentMpg(6.5);
        setDailyMiles(720);
        break;
    }
  };

  const handleApplyPreset = (preset: ScenarioPreset) => {
    triggerHapticFeedback('double');
    setFleetTrucks(preset.trucks);
    setRatePerMile(preset.ratePerMile);
    setDailyMiles(preset.dailyMiles);
    setDaysOnRoad(preset.daysOnRoad);
    setDeadheadPct(preset.deadheadPct);
    setFreightMode(preset.mode);
    showFeedbackToast(`Applied Preset Scenario: "${preset.name}"`);
  };

  // Predictive Calculations
  const metrics = useMemo(() => {
    const loadedMilesPerTruck = daysOnRoad * dailyMiles;
    const totalLoadedMiles = fleetTrucks * loadedMilesPerTruck;
    const deadheadFactor = deadheadPct / 100;
    const totalDeadheadMiles = totalLoadedMiles * deadheadFactor;
    const totalFleetMiles = totalLoadedMiles + totalDeadheadMiles;

    // Gross Revenue
    const freightLinehaulRevenue = totalLoadedMiles * ratePerMile;
    const totalAccessorialRev = fleetTrucks * accessorialDetentionRev;
    const grossMonthlyRevenue = freightLinehaulRevenue + totalAccessorialRev;

    // Operating Expenses
    const totalGallonsBurned = totalFleetMiles / equipmentMpg;
    const totalFuelCost = totalGallonsBurned * dieselPrice;
    const totalDriverPay = totalFleetMiles * driverPayCpm;
    const maintenanceReserve = totalFleetMiles * 0.16; // $0.16/mi wear, tires, PM
    const totalFixedOverhead = fleetTrucks * fixedOverheadPerTruck; // Insurance, ELD, software, lease

    const totalOperatingExpenses =
      totalFuelCost + totalDriverPay + maintenanceReserve + totalFixedOverhead;

    // Yield Metrics
    const netOperatingIncome = grossMonthlyRevenue - totalOperatingExpenses;
    const operatingRatio = grossMonthlyRevenue > 0
      ? (totalOperatingExpenses / grossMonthlyRevenue) * 100
      : 100;
    const netProfitMarginPct = grossMonthlyRevenue > 0
      ? (netOperatingIncome / grossMonthlyRevenue) * 100
      : 0;
    const netProfitPerTruck = fleetTrucks > 0 ? netOperatingIncome / fleetTrucks : 0;
    const revPerAvailableTruckDay = (fleetTrucks * 30) > 0
      ? grossMonthlyRevenue / (fleetTrucks * 30)
      : 0;
    const deadheadDragCost = totalDeadheadMiles * (dieselPrice / equipmentMpg + 0.16);

    // Projected Annualized Run-Rate
    const annualizedGross = grossMonthlyRevenue * 12;
    const annualizedNet = netOperatingIncome * 12;

    return {
      totalLoadedMiles,
      totalDeadheadMiles,
      totalFleetMiles,
      freightLinehaulRevenue,
      totalAccessorialRev,
      grossMonthlyRevenue,
      totalFuelCost,
      totalDriverPay,
      maintenanceReserve,
      totalFixedOverhead,
      totalOperatingExpenses,
      netOperatingIncome,
      operatingRatio,
      netProfitMarginPct,
      netProfitPerTruck,
      revPerAvailableTruckDay,
      deadheadDragCost,
      annualizedGross,
      annualizedNet,
    };
  }, [
    fleetTrucks,
    daysOnRoad,
    dailyMiles,
    ratePerMile,
    deadheadPct,
    dieselPrice,
    equipmentMpg,
    driverPayCpm,
    fixedOverheadPerTruck,
    accessorialDetentionRev,
  ]);

  const handleApplyStrategy = () => {
    triggerHapticFeedback('success');
    const summary = `Applied ${fleetTrucks}-Truck Yield Target: $${Math.round(metrics.grossMonthlyRevenue).toLocaleString()}/mo ($${metrics.netProfitMarginPct.toFixed(1)}% Net Margin)`;
    showFeedbackToast(`Strategy Locked: ${summary}`);
    if (onApplyStrategy) {
      onApplyStrategy(summary);
    }
  };

  const handleReset = () => {
    triggerHapticFeedback('tick');
    setFleetTrucks(8);
    setDaysOnRoad(22);
    setDailyMiles(540);
    setRatePerMile(3.35);
    setDeadheadPct(10);
    setFreightMode('REEFER');
    setDieselPrice(3.85);
    setEquipmentMpg(6.9);
    setDriverPayCpm(0.68);
    setFixedOverheadPerTruck(2100);
    setAccessorialDetentionRev(650);
    showFeedbackToast('Reset simulator parameters to TRUCKWITHEASE standard defaults.');
  };

  return (
    <div className={`bg-[#0D0E12] border border-[#262833] rounded-2xl p-4 sm:p-6 shadow-2xl relative ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#1F222E]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C]">
              TRUCKWITHEASE // PREDICTIVE YIELD ENGINE
            </span>
            <span className="text-[11px] font-mono text-[#7E8B9B]">
              Real-time Fleet Revenue &amp; Net Margin Model
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2 mt-1">
            <DollarSign className="w-6 h-6 text-[#C9A84C]" />
            Revenue Forecasting &amp; Predictive Yield Simulator
          </h2>
          <p className="text-xs text-[#8E92A4] mt-0.5 max-w-2xl">
            Simulate monthly freight billings, net operating margins (NOI), driver CPM compensation, and deadhead friction across various fleet deployment strategies.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-[#151720] hover:bg-[#1E202B] border border-[#2B2D38] text-xs font-mono text-[#A2A6B8] rounded-lg flex items-center gap-1.5 transition-all"
            title="Reset to default baseline"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>RESET</span>
          </button>
          <button
            onClick={handleApplyStrategy}
            className="px-4 py-2 bg-gradient-to-r from-[#C9A84C] to-[#E5C158] hover:from-[#DFBD5C] hover:to-[#F5D574] text-black font-black text-xs font-mono uppercase tracking-wider rounded-lg shadow-[0_0_16px_rgba(201,168,76,0.25)] flex items-center gap-2 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>LOCK YIELD STRATEGY</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {toastMessage && (
        <div className="mt-3 p-3 bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 text-xs font-mono rounded-lg flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Scenario Presets Strip */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-mono uppercase text-[#777] font-bold">RAPID SCENARIO PRESETS:</span>
        {PRESET_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => handleApplyPreset(scenario)}
            className="px-2.5 py-1 rounded bg-[#161822] hover:bg-[#202330] border border-[#2C2F3E] text-[11px] font-mono text-[#DDD] flex items-center gap-1.5 transition-all"
          >
            <Zap className="w-3 h-3 text-[#C9A84C]" />
            <span>{scenario.name}</span>
            <span className="text-[#888] text-[10px]">({scenario.trucks} Trucks · ${scenario.ratePerMile}/mi)</span>
          </button>
        ))}
      </div>

      {/* Freight Mode Selector */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(['DRY_VAN', 'REEFER', 'FLATBED', 'EXPEDITED_TEAM'] as FreightMode[]).map((mode) => {
          const isSelected = freightMode === mode;
          const labels: Record<FreightMode, { title: string; subtitle: string }> = {
            DRY_VAN: { title: "53' DRY VAN", subtitle: 'Baseline Freight' },
            REEFER: { title: "53' REEFER", subtitle: 'Cold Chain Yield (+15%)' },
            FLATBED: { title: 'OPEN FLATBED', subtitle: 'Specialized Industrial' },
            EXPEDITED_TEAM: { title: 'EXPEDITED TEAM', subtitle: 'Continuous Transit' },
          };

          return (
            <button
              key={mode}
              onClick={() => handleFreightModeChange(mode)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-[#1D1A10] border-[#C9A84C] text-[#C9A84C] shadow-md'
                  : 'bg-[#12131A] border-[#222430] text-[#888] hover:text-white hover:border-[#333]'
              }`}
            >
              <div className="text-xs font-mono font-bold uppercase">{labels[mode].title}</div>
              <div className="text-[10px] font-mono text-[#777] mt-0.5">{labels[mode].subtitle}</div>
            </button>
          );
        })}
      </div>

      {/* Main KPI Yield Projections Header Grid */}
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Gross Projected Revenue */}
        <div className="p-4 bg-[#13141B] border border-[#252838] rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8E92A4] uppercase tracking-wider font-bold">
              PROJECTED MONTHLY GROSS
            </span>
            <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-mono font-black text-[#C9A84C]">
              ${Math.round(metrics.grossMonthlyRevenue).toLocaleString()}
            </span>
            <span className="text-xs font-mono text-[#777]">/MO</span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>${Math.round(metrics.annualizedGross / 1000).toLocaleString()}k Annual Run-Rate</span>
          </div>
        </div>

        {/* Net Operating Income (NOI) */}
        <div className="p-4 bg-[#13141B] border border-[#252838] rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8E92A4] uppercase tracking-wider font-bold">
              NET OPERATING INCOME (NOI)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
              EBITDA
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-mono font-black text-white">
              ${Math.round(metrics.netOperatingIncome).toLocaleString()}
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              ({metrics.netProfitMarginPct.toFixed(1)}%)
            </span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-[#888]">
            Operating Ratio (OR): <strong className="text-amber-300">{metrics.operatingRatio.toFixed(1)}%</strong>
          </div>
        </div>

        {/* Net Profit Per Truck */}
        <div className="p-4 bg-[#13141B] border border-[#252838] rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8E92A4] uppercase tracking-wider font-bold">
              PROFIT PER UNIT / MONTH
            </span>
            <Truck className="w-3.5 h-3.5 text-[#C9A84C]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-mono font-black text-white">
              ${Math.round(metrics.netProfitPerTruck).toLocaleString()}
            </span>
            <span className="text-xs font-mono text-[#777]">/TRUCK</span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-[#888]">
            RevPATD: <strong className="text-[#C9A84C]">${Math.round(metrics.revPerAvailableTruckDay)}</strong> / day
          </div>
        </div>

        {/* Deadhead Loss Drag */}
        <div className="p-4 bg-[#13141B] border border-[#252838] rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8E92A4] uppercase tracking-wider font-bold">
              DEADHEAD DRAG FRICTION
            </span>
            <span className="text-[10px] font-mono text-amber-400 font-bold">{deadheadPct}% EMPTY</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-mono font-black text-rose-300">
              -${Math.round(metrics.deadheadDragCost).toLocaleString()}
            </span>
            <span className="text-xs font-mono text-[#777]">/MO</span>
          </div>
          <div className="mt-1 text-[10px] font-mono text-[#888]">
            {Math.round(metrics.totalDeadheadMiles).toLocaleString()} unbilled repositioning mi
          </div>
        </div>
      </div>

      {/* Two-Column Interactive Workspace: Sliders vs Expense/Yield Breakdown */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Parametric Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-[#202330] pb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#C9A84C]" />
              FLEET OPERATIONAL CONTROLS
            </span>
            <span className="text-[10px] font-mono text-[#777]">Slide to stress-test capacity</span>
          </div>

          {/* Active Fleet Trucks */}
          <div className="bg-[#12131B] border border-[#222533] p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#AAA] font-bold">ACTIVE POWER UNITS (FLEET SIZE)</span>
              <span className="text-white font-black text-sm text-[#C9A84C]">{fleetTrucks} TRUCKS</span>
            </div>
            <input
              type="range"
              min={1}
              max={40}
              step={1}
              value={fleetTrucks}
              onChange={(e) => {
                triggerHapticFeedback('tick');
                setFleetTrucks(parseInt(e.target.value, 10));
              }}
              className="w-full accent-[#C9A84C] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#666]">
              <span>1 Truck (Solo O/O)</span>
              <span>10 Trucks</span>
              <span>25 Trucks</span>
              <span>40 Trucks</span>
            </div>
          </div>

          {/* Average Rate Per Loaded Mile */}
          <div className="bg-[#12131B] border border-[#222533] p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#AAA] font-bold">AVERAGE RATE PER LOADED MILE</span>
              <span className="text-white font-black text-sm text-emerald-400">${ratePerMile.toFixed(2)} / MI</span>
            </div>
            <input
              type="range"
              min={2.10}
              max={5.50}
              step={0.05}
              value={ratePerMile}
              onChange={(e) => {
                triggerHapticFeedback('tick');
                setRatePerMile(parseFloat(e.target.value));
              }}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#666]">
              <span>$2.10 (Market Floor)</span>
              <span>$3.25 (Contract Median)</span>
              <span>$4.50 (Expedited)</span>
              <span>$5.50 (Premium Hazmat)</span>
            </div>
          </div>

          {/* Daily Loaded Miles Per Unit */}
          <div className="bg-[#12131B] border border-[#222533] p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#AAA] font-bold">DAILY TARGET LOADED MILES / UNIT</span>
              <span className="text-white font-black text-sm">{dailyMiles} MILES / DAY</span>
            </div>
            <input
              type="range"
              min={350}
              max={750}
              step={10}
              value={dailyMiles}
              onChange={(e) => {
                triggerHapticFeedback('tick');
                setDailyMiles(parseInt(e.target.value, 10));
              }}
              className="w-full accent-[#C9A84C] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#666]">
              <span>350 mi (Regional)</span>
              <span>550 mi (OTR Single)</span>
              <span>750 mi (Expedited Team)</span>
            </div>
          </div>

          {/* Operating Days on Road / Month */}
          <div className="bg-[#12131B] border border-[#222533] p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#AAA] font-bold">DAYS ON ROAD PER DRIVER / MONTH</span>
              <span className="text-white font-black text-sm">{daysOnRoad} DAYS</span>
            </div>
            <input
              type="range"
              min={16}
              max={28}
              step={1}
              value={daysOnRoad}
              onChange={(e) => {
                triggerHapticFeedback('tick');
                setDaysOnRoad(parseInt(e.target.value, 10));
              }}
              className="w-full accent-[#C9A84C] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#666]">
              <span>16 Days (Home Weekends)</span>
              <span>22 Days (Standard OTR)</span>
              <span>28 Days (Max HOS)</span>
            </div>
          </div>

          {/* Deadhead / Empty Miles Ratio */}
          <div className="bg-[#12131B] border border-[#222533] p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#AAA] font-bold">DEADHEAD RATIO (% UNLOADED)</span>
              <span className={`font-black text-sm ${deadheadPct > 15 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {deadheadPct}% EMPTY
              </span>
            </div>
            <input
              type="range"
              min={4}
              max={25}
              step={1}
              value={deadheadPct}
              onChange={(e) => {
                triggerHapticFeedback('tick');
                setDeadheadPct(parseInt(e.target.value, 10));
              }}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#666]">
              <span>4% (Near Zero Deadhead)</span>
              <span>10% (Target Threshold)</span>
              <span>25% (Excess Repositioning)</span>
            </div>
          </div>

          {/* Diesel Fuel Price & MPG */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#12131B] border border-[#222533] p-3 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#AAA]">DIESEL PRICE</span>
                <span className="text-[#C9A84C] font-bold font-mono">${dieselPrice.toFixed(2)}/gal</span>
              </div>
              <input
                type="range"
                min={3.00}
                max={5.50}
                step={0.05}
                value={dieselPrice}
                onChange={(e) => {
                  triggerHapticFeedback('tick');
                  setDieselPrice(parseFloat(e.target.value));
                }}
                className="w-full accent-[#C9A84C] cursor-pointer"
              />
            </div>

            <div className="bg-[#12131B] border border-[#222533] p-3 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#AAA]">FLEET AVERAGE MPG</span>
                <span className="text-white font-bold font-mono">{equipmentMpg.toFixed(1)} MPG</span>
              </div>
              <input
                type="range"
                min={5.5}
                max={8.5}
                step={0.1}
                value={equipmentMpg}
                onChange={(e) => {
                  triggerHapticFeedback('tick');
                  setEquipmentMpg(parseFloat(e.target.value));
                }}
                className="w-full accent-[#C9A84C] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Expense Breakdown & High-Yield Corridor Recommendations (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#202330] pb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-[#C9A84C]" />
              EXPENSE WATERFALL &amp; CORRIDORS
            </span>
            <span className="text-[10px] font-mono text-[#777]">Monthly Cost Allocation</span>
          </div>

          {/* Waterfall Cost Allocation Card */}
          <div className="bg-[#12131A] border border-[#222533] p-4 rounded-xl space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center text-[#AAA]">
              <span>Gross Freight Revenue:</span>
              <span className="text-[#C9A84C] font-black">${Math.round(metrics.grossMonthlyRevenue).toLocaleString()}</span>
            </div>

            <div className="space-y-1.5 border-t border-[#1F2230] pt-2">
              <div className="flex justify-between items-center text-[#888]">
                <span className="flex items-center gap-1.5">
                  <Fuel className="w-3 h-3 text-amber-400" />
                  Fuel Expenses ({Math.round(metrics.totalFleetMiles / equipmentMpg).toLocaleString()} gal):
                </span>
                <span className="text-white font-bold">-${Math.round(metrics.totalFuelCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[#888]">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3 text-blue-400" />
                  Driver Pay (${driverPayCpm.toFixed(2)}/mi total):
                </span>
                <span className="text-white font-bold">-${Math.round(metrics.totalDriverPay).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[#888]">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-purple-400" />
                  Tire &amp; Maintenance Reserves ($0.16/mi):
                </span>
                <span className="text-white font-bold">-${Math.round(metrics.maintenanceReserve).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[#888]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-emerald-400" />
                  Fixed Fleet Overhead (${fixedOverheadPerTruck}/truck):
                </span>
                <span className="text-white font-bold">-${Math.round(metrics.totalFixedOverhead).toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-[#292D3E] pt-2.5 flex justify-between items-center">
              <span className="font-bold text-white uppercase">Total Operating Costs:</span>
              <span className="text-rose-300 font-bold">-${Math.round(metrics.totalOperatingExpenses).toLocaleString()}</span>
            </div>

            <div className="p-3 bg-[#181924] border border-[#2E3245] rounded-lg flex justify-between items-center">
              <div>
                <span className="font-black text-white text-sm block">NET OPERATING PROFIT</span>
                <span className="text-[10px] text-[#888]">Retained Carrier Surplus</span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-emerald-400 block font-mono">
                  +${Math.round(metrics.netOperatingIncome).toLocaleString()}
                </span>
                <span className="text-[10px] font-mono text-[#AAA]">{metrics.netProfitMarginPct.toFixed(1)}% margin</span>
              </div>
            </div>
          </div>

          {/* High-Yield Corridor Multiplier Table */}
          <div className="bg-[#12131A] border border-[#222533] p-4 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C9A84C] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#C9A84C]" />
                HIGH-YIELD CORRIDOR BENCHMARKS
              </span>
              <span className="text-[9px] font-mono text-[#666]">LIVE SPOT MULTIPLIERS</span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between p-2 bg-[#0E0F15] rounded border border-[#1E202C]">
                <div>
                  <div className="font-bold text-white">Texas Triangle (I-35 / I-10)</div>
                  <div className="text-[10px] text-[#777]">Dallas ↔ Houston ↔ San Antonio</div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold text-xs">+$3.68/mi</span>
                  <span className="text-[9px] text-[#888] block">+18.4% Yield</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#0E0F15] rounded border border-[#1E202C]">
                <div>
                  <div className="font-bold text-white">Southeast Cold Chain (I-75 / I-95)</div>
                  <div className="text-[10px] text-[#777]">Atlanta ↔ Orlando ↔ Miami (Reefer)</div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold text-xs">+$3.95/mi</span>
                  <span className="text-[9px] text-[#888] block">+22.1% Yield</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#0E0F15] rounded border border-[#1E202C]">
                <div>
                  <div className="font-bold text-white">Midwest Grain &amp; Auto (I-80 / I-90)</div>
                  <div className="text-[10px] text-[#777]">Chicago ↔ Omaha ↔ Denver</div>
                </div>
                <div className="text-right">
                  <span className="text-amber-400 font-bold text-xs">+$3.42/mi</span>
                  <span className="text-[9px] text-[#888] block">+12.6% Yield</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
