import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Zap,
  Activity,
  Sliders,
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Award,
  CheckCircle2,
  Building2,
  Lock,
  ExternalLink,
  ChevronRight,
  Flame,
  Gauge,
  Radio,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import {
  quantumRiskScoringEngine,
  computeQuantumRiskScore,
} from '../services/quantumRiskScoringService';
import {
  QuantumTelematicsVector,
  QuantumCarrierSafetyVector,
  QuantumInsuranceRiskProfileVector,
  QuantumRiskScoreBreakdown,
} from '../types';
import { triggerHapticFeedback } from '../services/haptics';

interface QuantumRiskScoringPanelProps {
  onNavigateToInsuranceTab?: () => void;
  compactMode?: boolean;
}

export const QuantumRiskScoringPanel: React.FC<QuantumRiskScoringPanelProps> = ({
  onNavigateToInsuranceTab,
  compactMode = false,
}) => {
  const [vectors, setVectors] = useState(quantumRiskScoringEngine.getVectors());
  const [breakdown, setBreakdown] = useState<QuantumRiskScoreBreakdown>(
    quantumRiskScoringEngine.getScore()
  );
  const [activeVectorTab, setActiveVectorTab] = useState<'TELEMATICS' | 'SAFETY' | 'INSURANCE'>('TELEMATICS');
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);
  const [simulationBanner, setSimulationBanner] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = quantumRiskScoringEngine.subscribe((newScore) => {
      setBreakdown(newScore);
      setVectors(quantumRiskScoringEngine.getVectors());
    });
    return () => unsubscribe();
  }, []);

  const handleTelematicsChange = (field: keyof QuantumTelematicsVector, value: number) => {
    triggerHapticFeedback('tick');
    const updated = quantumRiskScoringEngine.updateTelematics({ [field]: value });
    setBreakdown(updated);
    setVectors(quantumRiskScoringEngine.getVectors());
  };

  const handleSafetyChange = (field: keyof QuantumCarrierSafetyVector, value: number) => {
    triggerHapticFeedback('tick');
    const updated = quantumRiskScoringEngine.updateSafety({ [field]: value });
    setBreakdown(updated);
    setVectors(quantumRiskScoringEngine.getVectors());
  };

  const handleInsuranceChange = (
    field: keyof QuantumInsuranceRiskProfileVector,
    value: any
  ) => {
    triggerHapticFeedback('tick');
    const updated = quantumRiskScoringEngine.updateInsurance({ [field]: value });
    setBreakdown(updated);
    setVectors(quantumRiskScoringEngine.getVectors());
  };

  const handleSimulateHighwayEvent = (
    type: 'HARSH_BRAKE' | 'SPEED_SURGE' | 'SMOOTH_CRUISE' | 'NIGHT_HAUL'
  ) => {
    triggerHapticFeedback('subtle');
    const updated = quantumRiskScoringEngine.simulateHighwayEvent(type);
    setBreakdown(updated);
    setVectors(quantumRiskScoringEngine.getVectors());

    const msgs: Record<string, string> = {
      HARSH_BRAKE: 'Simulated 1x emergency deceleration event (0.45G drop logged on J1939)',
      SPEED_SURGE: 'Simulated +3.2 MPH speed delta overage during mountain descent',
      SMOOTH_CRUISE: 'Simulated 1,000 miles pristine highway cruising with zero harsh events',
      NIGHT_HAUL: 'Logged +4.5% night-driving shift through high-density urban corridor',
    };
    setSimulationBanner(msgs[type]);
    setTimeout(() => setSimulationBanner(null), 4000);
  };

  const handleReset = () => {
    triggerHapticFeedback('subtle');
    const reset = quantumRiskScoringEngine.resetToDefaults();
    setBreakdown(reset);
    setVectors(quantumRiskScoringEngine.getVectors());
    setSimulationBanner('Reset all multi-vector parameters to baseline certified fleet profile.');
    setTimeout(() => setSimulationBanner(null), 3500);
  };

  const handleCopyQuote = (partnerId: string) => {
    triggerHapticFeedback('subtle');
    navigator.clipboard.writeText(`TWE-QTM-${partnerId.toUpperCase()}-${Date.now().toString().slice(-4)}`);
    setCopiedQuoteId(partnerId);
    setTimeout(() => setCopiedQuoteId(null), 2500);
  };

  // Color mappings based on Quantum Tier
  const tierColor = useMemo(() => {
    switch (breakdown.quantumSafetyTier) {
      case 'QUANTUM_DIAMOND':
        return {
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.4)]',
          text: 'text-cyan-400',
          border: 'border-cyan-500/50',
          glow: 'shadow-[0_0_30px_rgba(6,182,212,0.25)]',
          gradient: 'from-cyan-400 to-blue-500',
        };
      case 'QUANTUM_PLATINUM':
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
          text: 'text-emerald-400',
          border: 'border-emerald-500/50',
          glow: 'shadow-[0_0_30px_rgba(16,185,129,0.25)]',
          gradient: 'from-emerald-400 to-teal-500',
        };
      case 'QUANTUM_GOLD':
        return {
          badge: 'bg-[#FFE600]/20 text-[#FFE600] border-[#FFE600]/60 shadow-[0_0_15px_rgba(255,230,0,0.4)]',
          text: 'text-[#FFE600]',
          border: 'border-[#FFE600]/50',
          glow: 'shadow-[0_0_30px_rgba(255,230,0,0.25)]',
          gradient: 'from-[#FFE600] to-amber-500',
        };
      case 'QUANTUM_STANDARD':
        return {
          badge: 'bg-blue-500/20 text-blue-300 border-blue-400/60',
          text: 'text-blue-400',
          border: 'border-blue-500/40',
          glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
          gradient: 'from-blue-400 to-indigo-500',
        };
      default:
        return {
          badge: 'bg-rose-500/20 text-rose-300 border-rose-400/60',
          text: 'text-rose-400',
          border: 'border-rose-500/50',
          glow: 'shadow-[0_0_15px_rgba(244,63,94,0.2)]',
          gradient: 'from-rose-400 to-red-500',
        };
    }
  }, [breakdown.quantumSafetyTier]);

  return (
    <div className="w-full bg-[#0A0D14] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl font-mono text-zinc-200">
      {/* Simulation Banner Feedback */}
      {simulationBanner && (
        <div className="bg-[#0F1E2E] border-b border-cyan-500/40 p-2.5 px-4 text-xs flex items-center justify-between text-cyan-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-semibold">{simulationBanner}</span>
          </div>
          <span className="text-[10px] text-cyan-400/70 uppercase">QUANTUM DISCOUNTS RE-CALCULATED</span>
        </div>
      )}

      {/* Main Header / Top Bar */}
      <div className="p-4 sm:p-6 border-b border-[#1A2638] bg-gradient-to-r from-[#0C121D] via-[#0A0E18] to-[#0A0D14] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black tracking-widest uppercase bg-gradient-to-r from-[#FFE600]/20 to-cyan-500/20 text-[#FFE600] border border-[#FFE600]/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,230,0,0.25)]">
              <Zap className="w-3.5 h-3.5 text-[#FFE600]" />
              ACTUARIAL TELEMATICS FUSION ENGINE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 uppercase flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              LIVE J1939 CAN-BUS FEED
            </span>
            <span className="text-[10px] text-zinc-400">
              USDOT #{vectors.safety.dotNumber} · MC-1482901
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2.5 font-[Oswald]">
            <span>Predictive Carrier Risk Scoring &amp; Dynamic Insurance Engine</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl mt-1 leading-relaxed">
            Multi-vector engine analyzing real-time highway telematics, FMCSA safety percentiles, and commercial underwriting profiles. Adjusts insurance rate discounts dynamically down to the second.
          </p>
        </div>

        {/* Quick Simulation Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleSimulateHighwayEvent('HARSH_BRAKE')}
            className="px-2.5 py-1.5 rounded-lg bg-[#141B26] hover:bg-[#1E293B] border border-amber-500/30 hover:border-amber-500/60 text-amber-400 text-[11px] font-bold uppercase transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            title="Simulate sudden hard braking event"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Harsh Brake</span>
          </button>

          <button
            type="button"
            onClick={() => handleSimulateHighwayEvent('SMOOTH_CRUISE')}
            className="px-2.5 py-1.5 rounded-lg bg-[#141B26] hover:bg-[#1E293B] border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 text-[11px] font-bold uppercase transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            title="Simulate 1,000 miles smooth clean cruise"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Clean Cruise</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-[#141B26] hover:bg-[#1E293B] border border-[#2A374A] text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Reset parameters to standard baseline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CORE HERO METRICS: Dynamic Quantum Risk & Premium Discount Readout */}
      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#080B10] border-b border-[#1A2638]">
        {/* Metric 1: Quantum Composite Risk Score */}
        <div className="p-4 rounded-xl bg-[#0D131F] border border-[#1E2E42] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
              QUANTUM COMPOSITE RISK
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tierColor.badge}`}>
              {breakdown.quantumSafetyTier.replace('_', ' ')}
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {breakdown.compositeQuantumRiskScore}
            </span>
            <span className="text-xs text-zinc-400 font-normal">/ 100 Risk Index</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>ACTUARIAL LOSS FACTOR</span>
              <span className={`font-bold ${tierColor.text}`}>{breakdown.actuarialRiskMultiplier}x Base</span>
            </div>
            <div className="w-full bg-[#16202E] h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${tierColor.gradient} transition-all duration-500`}
                style={{ width: `${Math.min(100, (breakdown.compositeQuantumRiskScore / 70) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 2: Live Insurance Safety Score */}
        <div className="p-4 rounded-xl bg-[#0D131F] border border-[#1E2E42] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
              INSURANCE SAFETY RATING
            </span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              UNDERWRITER PRE-APPROVED
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className={`text-3xl sm:text-4xl font-black tracking-tight ${tierColor.text}`}>
              {breakdown.quantumSafetyScore}
            </span>
            <span className="text-xs text-zinc-400 font-normal">/ 100 Safety Score</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>TELEMATICS CONFIDENCE</span>
              <span className="text-emerald-400 font-bold">{breakdown.telematicsConfidenceIndex}%</span>
            </div>
            <div className="w-full bg-[#16202E] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${breakdown.telematicsConfidenceIndex}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 3: Dynamic Premium Discount Rate */}
        <div className="p-4 rounded-xl bg-[#0D131F] border-2 border-[#FFE600]/40 relative overflow-hidden flex flex-col justify-between shadow-[0_0_20px_rgba(255,230,0,0.15)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#FFE600] uppercase font-black tracking-wider">
              DYNAMIC PREMIUM DISCOUNT
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#FFE600] text-black">
              LIVE CREDIT
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-[#FFE600] tracking-tight drop-shadow-[0_0_12px_rgba(255,230,0,0.5)]">
              {breakdown.dynamicPremiumDiscountPct}%
            </span>
            <span className="text-xs text-zinc-300 font-bold">OFF RETAIL</span>
          </div>

          <div className="text-[11px] text-zinc-300 flex items-center justify-between font-semibold">
            <span>SAVINGS PER TRUCK:</span>
            <span className="text-white font-bold">${breakdown.estimatedAnnualSavingsPerTruck.toLocaleString()} / yr</span>
          </div>
        </div>

        {/* Metric 4: Total Fleet Annual Cashflow Impact */}
        <div className="p-4 rounded-xl bg-[#0D131F] border border-cyan-500/40 relative overflow-hidden flex flex-col justify-between shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
              TOTAL FLEET ANNUAL SAVINGS
            </span>
            <span className="text-[10px] text-cyan-300 font-bold">
              {vectors.insurance.fleetSize} POWER UNITS
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-cyan-300 tracking-tight drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              ${breakdown.totalFleetAnnualSavings.toLocaleString()}
            </span>
            <span className="text-xs text-zinc-400">/ YEAR</span>
          </div>

          <div className="text-[11px] text-zinc-300 flex items-center justify-between">
            <span>ROI ON TRUCKWITHEASE:</span>
            <span className="text-emerald-400 font-black">
              {Math.round((breakdown.totalFleetAnnualSavings / (vectors.insurance.fleetSize * 99 * 12)) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* THREE MULTI-DIMENSIONAL VECTORS EXPLORATION & SLIDERS */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Vector Category Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveVectorTab('TELEMATICS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                activeVectorTab === 'TELEMATICS'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-[#121824] text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>1. Live Highway Telematics ({breakdown.telematicsRiskComponent}/100)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveVectorTab('SAFETY')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                activeVectorTab === 'SAFETY'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'bg-[#121824] text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. Carrier Safety History ({breakdown.carrierSafetyHistoryComponent}/100)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveVectorTab('INSURANCE')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                activeVectorTab === 'INSURANCE'
                  ? 'bg-[#FFE600]/20 text-[#FFE600] border border-[#FFE600]/60 shadow-[0_0_12px_rgba(255,230,0,0.3)]'
                  : 'bg-[#121824] text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#FFE600]" />
              <span>3. Underwriting Profile ({breakdown.insuranceProfileComponent}/100)</span>
            </button>
          </div>

          <div className="text-[11px] text-zinc-400 hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>REAL-TIME ACTUARIAL SLIDERS ACTIVE</span>
          </div>
        </div>

        {/* TAB 1: Real-Time Highway Telematics Vector */}
        {activeVectorTab === 'TELEMATICS' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Slider 1: Harsh Braking */}
              <div className="p-3.5 rounded-xl bg-[#0D121B] border border-[#1C2636] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-bold">Harsh Braking Rate</span>
                  <span className="text-[#FFE600] font-black">
                    {vectors.telematics.harshBrakingPer1000Mi} / 1k mi
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="3.0"
                  step="0.05"
                  value={vectors.telematics.harshBrakingPer1000Mi}
                  onChange={(e) =>
                    handleTelematicsChange('harshBrakingPer1000Mi', parseFloat(e.target.value))
                  }
                  className="w-full accent-[#FFE600] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>0.05 (Ideal)</span>
                  <span>Baseline: 2.10</span>
                </div>
              </div>

              {/* Slider 2: Speed Compliance */}
              <div className="p-3.5 rounded-xl bg-[#0D121B] border border-[#1C2636] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-bold">Speed Compliance</span>
                  <span className="text-emerald-400 font-black">
                    {vectors.telematics.speedCompliancePct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="99.9"
                  step="0.1"
                  value={vectors.telematics.speedCompliancePct}
                  onChange={(e) =>
                    handleTelematicsChange('speedCompliancePct', parseFloat(e.target.value))
                  }
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>80% (Warning)</span>
                  <span>99.9% (Optimal)</span>
                </div>
              </div>

              {/* Slider 3: Headway Radar Proximity */}
              <div className="p-3.5 rounded-xl bg-[#0D121B] border border-[#1C2636] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-bold">Headway Radar Alerts</span>
                  <span className="text-cyan-400 font-black">
                    {vectors.telematics.headwayRadarAlertsPer100Mi} / 100 mi
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.5"
                  step="0.05"
                  value={vectors.telematics.headwayRadarAlertsPer100Mi}
                  onChange={(e) =>
                    handleTelematicsChange('headwayRadarAlertsPer100Mi', parseFloat(e.target.value))
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>0.1 (High Cushion)</span>
                  <span>2.5 (Tailgating)</span>
                </div>
              </div>

              {/* Slider 4: Night Driving Exposure */}
              <div className="p-3.5 rounded-xl bg-[#0D121B] border border-[#1C2636] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-bold">Night Driving (12am-5am)</span>
                  <span className="text-indigo-400 font-black">
                    {vectors.telematics.nightDrivingExposurePct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="0.5"
                  value={vectors.telematics.nightDrivingExposurePct}
                  onChange={(e) =>
                    handleTelematicsChange('nightDrivingExposurePct', parseFloat(e.target.value))
                  }
                  className="w-full accent-indigo-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>5% (Day Shift)</span>
                  <span>45% (High Fatigue)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Carrier Safety History Vector */}
        {activeVectorTab === 'SAFETY' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Slider 1: Unsafe Driving BASIC */}
              <div className="p-3.5 rounded-xl bg-[#0D121B] border border-[#1C2636] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-bold">Unsafe Driving BASIC</span>
                  <span className="text-emerald-400 font-black">
                    {vectors.safety.fmcsaUnsafeDrivingPercentile}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="65"
                  step="0.5"
                  value={vectors.safety.fmcsaUnsafeDrivingPercentile}
                  onChange={(e) =>
                    handleSafetyChange('fmcsaUnsafeDrivingPercentile', parseFloat(e.target.value))
                  }
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>1% (Pristine)</span>
                  <span>65% (FMCSA Threshold)</span>
                </div>
              </div>

              {/* Slider 2: Crash Indicator Percentile */}
              <div className="p-3.5 rounded-xl bg-[#0D121B] border border-[#1C2636] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-bold">Crash Indicator BASIC</span>
                  <span className="text-cyan-400 font-black">
                    {vectors.safety.fmcsaCrashIndicatorPercentile}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="65"
                  step="0.5"
                  value={vectors.safety.fmcsaCrashIndicatorPercentile}
                  onChange={(e) =>
                    handleSafetyChange('fmcsaCrashIndicatorPercentile', parseFloat(e.target.value))
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>0% (Zero Crashes)</span>
                  <span>65% (Intervention)</span>
                </div>
              </div>

              {/* Slider 3: Out-of-Service Rate */}
              <div className="p-3.5 rounded-xl bg-[#0D121B] border border-[#1C2636] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-bold">Out-of-Service Rate</span>
                  <span className="text-[#FFE600] font-black">
                    {vectors.safety.outOfServiceRatePct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.2"
                  value={vectors.safety.outOfServiceRatePct}
                  onChange={(e) =>
                    handleSafetyChange('outOfServiceRatePct', parseFloat(e.target.value))
                  }
                  className="w-full accent-[#FFE600] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>0% (Clean)</span>
                  <span>US Avg: 21.4%</span>
                </div>
              </div>

              {/* Slider 4: DVIR Defect Correction */}
              <div className="p-3.5 rounded-xl bg-[#0D121B] border border-[#1C2636] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-bold">DVIR Defect Resolution</span>
                  <span className="text-emerald-400 font-black">
                    {vectors.safety.dvirDefectCorrectionRatePct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="85"
                  max="100"
                  step="0.2"
                  value={vectors.safety.dvirDefectCorrectionRatePct}
                  onChange={(e) =>
                    handleSafetyChange('dvirDefectCorrectionRatePct', parseFloat(e.target.value))
                  }
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>85% (Deficient)</span>
                  <span>100% (Certified)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Underwriting & Insurance Profile Vector */}
        {activeVectorTab === 'INSURANCE' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Input 1: Fleet Size */}
              <div className="p-3.5 rounded-xl bg-[#0D121B] border border-[#1C2636] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-bold">Fleet Size (Power Units)</span>
                  <span className="text-cyan-400 font-black">{vectors.insurance.fleetSize} Trucks</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="1"
                  value={vectors.insurance.fleetSize}
                  onChange={(e) =>
                    handleInsuranceChange('fleetSize', parseInt(e.target.value, 10))
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>1 Owner-Op</span>
                  <span>25 Fleet Units</span>
                </div>
              </div>

              {/* Input 2: Prior Claims Last 3 Years */}
              <div className="p-3.5 rounded-xl bg-[#0D121B] border border-[#1C2636] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-bold">Claims (Past 36 Mos)</span>
                  <span className="text-[#FFE600] font-black">
                    {vectors.insurance.priorLossClaimsLast3Years} Claims
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1">
                  {[0, 1, 2].map((claims) => (
                    <button
                      key={claims}
                      type="button"
                      onClick={() => handleInsuranceChange('priorLossClaimsLast3Years', claims)}
                      className={`py-1.5 rounded text-xs font-bold cursor-pointer transition-all ${
                        vectors.insurance.priorLossClaimsLast3Years === claims
                          ? 'bg-[#FFE600] text-black font-black'
                          : 'bg-[#16202E] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {claims === 0 ? '0 (Zero)' : claims === 1 ? '1 Claim' : '2+ Claims'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input 3: Operating Radius */}
              <div className="p-3.5 rounded-xl bg-[#0D121B] border border-[#1C2636] space-y-2">
                <span className="text-zinc-300 font-bold text-xs block">Operating Haul Radius</span>
                <select
                  value={vectors.insurance.operatingRadius}
                  onChange={(e) => handleInsuranceChange('operatingRadius', e.target.value)}
                  className="w-full bg-[#16202E] border border-[#2B3B52] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#FFE600]"
                >
                  <option value="LOCAL_100MI">Local (Within 100 Miles)</option>
                  <option value="REGIONAL_500MI">Regional (Up to 500 Miles)</option>
                  <option value="LONG_HAUL_OTR_NATIONWIDE">Long-Haul OTR (All 48 States)</option>
                </select>
                <span className="text-[10px] text-zinc-400 block">Actuarial exposure class</span>
              </div>

              {/* Input 4: Cargo Class */}
              <div className="p-3.5 rounded-xl bg-[#0D121B] border border-[#1C2636] space-y-2">
                <span className="text-zinc-300 font-bold text-xs block">Commodity Cargo Class</span>
                <select
                  value={vectors.insurance.cargoRiskClass}
                  onChange={(e) => handleInsuranceChange('cargoRiskClass', e.target.value)}
                  className="w-full bg-[#16202E] border border-[#2B3B52] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#FFE600]"
                >
                  <option value="GENERAL_FREIGHT">Dry Van / General Freight</option>
                  <option value="REFRIGERATED_FOODS">Refrigerated Produce / Foods</option>
                  <option value="BUILDING_MATERIALS">Flatbed / Building Materials</option>
                  <option value="HAZMAT_CHEM">Hazmat / Chemical Tanker</option>
                </select>
                <span className="text-[10px] text-zinc-400 block">Cargo loss probability index</span>
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC NATIONWIDE PARTNER BIDS ACCORDION */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#080C14] border border-[#1E293B] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1A2638] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#FFE600]" />
                <span>Live Partner Agency Bids &amp; Rate Reductions</span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Underwriting syndicates dynamically pricing risk against your live Quantum Risk Score ({breakdown.compositeQuantumRiskScore}/100)
              </p>
            </div>

            {onNavigateToInsuranceTab && (
              <button
                type="button"
                onClick={onNavigateToInsuranceTab}
                className="text-xs text-[#FFE600] hover:text-[#FFF500] font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Open Insurance Hub</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {breakdown.partnerCarrierBids.map((partner) => (
              <div
                key={partner.partnerId}
                className="p-3.5 rounded-lg bg-[#0C121D] border border-[#1E2E44] hover:border-[#FFE600]/60 transition-all flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white leading-tight">
                      {partner.partnerName}
                    </span>
                    {partner.instantBindingEligible && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black border border-emerald-500/40">
                        INSTANT BIND
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#FFE600]">
                      {partner.quotedDiscountPct}%
                    </span>
                    <span className="text-[10px] text-zinc-400">DISCOUNT</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#182334] flex items-center justify-between">
                  <span className="text-[11px] text-emerald-400 font-bold">
                    +${partner.annualSavingsFleet.toLocaleString()} / yr
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopyQuote(partner.partnerId)}
                    className="px-2 py-1 rounded bg-[#162234] hover:bg-[#203048] text-zinc-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {copiedQuoteId === partner.partnerId ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-zinc-400" />
                        <span>Quote ID</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RISK MITIGATORS & CRYPTOGRAPHIC VERIFICATION FOOTER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#182232] space-y-2">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
              TOP QUANTUM RISK MITIGATORS
            </span>
            <ul className="space-y-1 text-zinc-300 text-[11px]">
              {breakdown.keyRiskMitigators.map((mitigator, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{mitigator}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#182232] space-y-2">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
              UNDERWRITING CERTIFICATE ATTESTATION
            </span>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              J1939 CAN-bus telemetry attestation authenticated with SHA-256 digital signature. Ready for direct electronic filing to agency underwriting rating portals.
            </p>
            <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-[#16202E]">
              <span>CALCULATED AT: {breakdown.calculatedAt}</span>
              <span className="text-cyan-400 font-bold">FMCSA 49 CFR § 395 COMPLIANT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
