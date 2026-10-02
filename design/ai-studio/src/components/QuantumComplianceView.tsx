import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Scale,
  Compass,
  FileCheck,
  Disc,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Flame,
  Radio,
  Eye,
  Sliders,
  ChevronRight,
  AlertOctagon,
  Wrench,
} from 'lucide-react';
import { QuantumDotScenario, DotScenarioCategory, TabType } from '../types';
import { triggerHapticFeedback } from '../services/haptics';
import { TruckWithEaseLogo } from './TruckWithEaseLogo';

interface QuantumComplianceViewProps {
  onNavigateToTab?: (tab: TabType) => void;
}

export const QuantumComplianceView: React.FC<QuantumComplianceViewProps> = ({
  onNavigateToTab,
}) => {
  const [scenarios, setScenarios] = useState<QuantumDotScenario[]>([]);
  const [coherencePct, setCoherencePct] = useState<number>(98.5);
  const [eigenvalue, setEigenvalue] = useState<number>(0.0014);
  const [violationsAverted, setViolationsAverted] = useState<number>(38);
  const [loading, setLoading] = useState<boolean>(true);
  const [annealing, setAnnealing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedScenarioId, setExpandedScenarioId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Fetch Quantum Scenarios
  const fetchScenarios = async () => {
    try {
      const res = await fetch('/api/quantum-compliance/scenarios');
      if (res.ok) {
        const data = await res.json();
        setScenarios(data.scenarios);
        setCoherencePct(data.quantumCoherencePct);
        setEigenvalue(data.zeroViolationEigenvalue);
        setViolationsAverted(data.imminentViolationsAverted);
      }
    } catch (err) {
      console.error('Failed to fetch quantum compliance scenarios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  // Anneal / Collapse All Scenarios to Zero-Violation Ground State
  const handleAnnealAllScenarios = async () => {
    triggerHapticFeedback('double');
    setAnnealing(true);
    setStatusNotice('Simulating Quantum Hamiltonian Annealing across all 49 CFR constraint manifolds...');

    try {
      const res = await fetch('/api/quantum-compliance/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        setScenarios(data.scenarios);
        setCoherencePct(data.quantumCoherencePct);
        setEigenvalue(data.zeroViolationEigenvalue);
        setViolationsAverted((prev) => prev + 8);
        setStatusNotice('All potential DOT violation scenarios collapsed into deterministic ground-state resolutions!');
        triggerHapticFeedback('success');
      }
    } catch (err) {
      console.error('Annealing failed:', err);
      setStatusNotice('Quantum resolution simulation error.');
    } finally {
      setAnnealing(false);
    }
  };

  // Collapse Individual Scenario
  const handleResolveSingleScenario = async (scenarioId: string) => {
    triggerHapticFeedback('subtle');
    try {
      const res = await fetch('/api/quantum-compliance/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId }),
      });

      if (res.ok) {
        const data = await res.json();
        setScenarios(data.scenarios);
        setCoherencePct(data.quantumCoherencePct);
        setEigenvalue(data.zeroViolationEigenvalue);
        setViolationsAverted((prev) => prev + 1);
        setStatusNotice(`Scenario resolved proactively. Action items dispatched to driver & carrier.`);
      }
    } catch (err) {
      console.error('Single resolution failed:', err);
    }
  };

  // Stress-Test Matrix (Inject Roadside Blitz)
  const handleStressTest = async () => {
    triggerHapticFeedback('alert');
    try {
      const res = await fetch('/api/quantum-compliance/stress-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        setScenarios(data.scenarios);
        setCoherencePct(data.quantumCoherencePct);
        setStatusNotice('Stress test injected: Roadside Blitz & Severe Weather superposition waves active!');
      }
    } catch (err) {
      console.error('Stress test failed:', err);
    }
  };

  const filteredScenarios = scenarios.filter((s) => {
    if (selectedCategory === 'ALL') return true;
    return s.category === selectedCategory;
  });

  const getCategoryIcon = (cat: DotScenarioCategory) => {
    switch (cat) {
      case 'HOS_DUTY_CLOCK':
        return Clock;
      case 'ROADSIDE_CVSA_LEVEL_1':
        return ShieldCheck;
      case 'WEIGHT_BRIDGE_FORMULA':
        return Scale;
      case 'CARGO_SECUREMENT':
        return Disc;
      case 'TIRE_BLOWOUT_TREAD':
        return AlertOctagon;
      case 'LOW_BRIDGE_CLEARANCE':
        return Compass;
      case 'ADVERSE_WEATHER_SAFE_HAVEN':
        return Flame;
      case 'PRE_TRIP_DVIR_DISCREPANCY':
        return FileCheck;
      default:
        return Zap;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Quantum Compliance Mission Header */}
      <div className="bg-gradient-to-r from-[#0B1522] via-[#10141C] to-[#141209] border-2 border-cyan-500/50 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Zap className="w-64 h-64 text-cyan-400" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <TruckWithEaseLogo size="sm" showWordmark={false} />
              <span className="px-2.5 py-0.5 bg-cyan-500 text-black font-mono text-xs font-black uppercase tracking-widest rounded flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-black" />
                PREDICTIVE COMPLIANCE ENGINE
              </span>
              <span className="text-xs font-mono text-cyan-300 font-bold tracking-wider">
                FMCSA 49 CFR RESOLUTION MATRIX
              </span>
              <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-mono text-[10px] uppercase font-bold rounded flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ZERO-VIOLATION GROUND STATE
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-2 flex items-center gap-3">
              Driver & Fleet Predictive DOT Scenario Engine
            </h1>
            <p className="text-xs sm:text-sm font-mono text-cyan-100/80 max-w-3xl mt-1">
              <strong>Resolving all scenarios before they occur on the asphalt.</strong> Applying combinatorial
              state-vector simulation models to solve HOS clock traps, roadside Level-1 inspections, bridge formula overloads, cargo shifts, and tire wear hours before contact with state enforcement.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleAnnealAllScenarios}
              disabled={annealing}
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-400 hover:bg-white text-black font-mono text-xs font-black uppercase tracking-wider rounded transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${annealing ? 'animate-spin' : ''}`} />
              <span>{annealing ? 'ANNEALING HAMILTONIAN...' : 'COLLAPSE ALL SCENARIOS (E₀)'}</span>
            </button>

            <button
              onClick={handleStressTest}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1A1515] hover:bg-red-950 border border-red-800/60 text-red-300 font-mono text-xs font-bold uppercase rounded transition-all"
            >
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>Stress-Test Road Blitz</span>
            </button>

            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('equipment-agent')}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#1C180A] hover:bg-amber-950 border border-[#D4AF37] text-[#D4AF37] font-mono text-xs font-bold uppercase rounded transition-all"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>#1 Equipment Agent</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Quantum State Metric Strip */}
        <div className="mt-4 pt-4 border-t border-[#263548] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-black/40 border border-[#1E293B] p-2.5 rounded">
            <span className="text-[10px] text-[#888] block uppercase">Phase Coherence (C)</span>
            <span className="font-bold text-cyan-300 text-lg">{coherencePct.toFixed(1)}%</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">High Phase Alignment</span>
          </div>

          <div className="bg-black/40 border border-[#1E293B] p-2.5 rounded">
            <span className="text-[10px] text-[#888] block uppercase">Ground State Energy (E₀)</span>
            <span className="font-bold text-emerald-400 text-lg">{eigenvalue.toFixed(4)} eV</span>
            <span className="text-[10px] text-[#888] block mt-0.5">Minimum Potential Risk</span>
          </div>

          <div className="bg-black/40 border border-[#1E293B] p-2.5 rounded">
            <span className="text-[10px] text-[#888] block uppercase">Violations Pre-Empted</span>
            <span className="font-bold text-white text-lg">{violationsAverted} Averted</span>
            <span className="text-[10px] text-cyan-400 block mt-0.5">$0 Roadside Fines</span>
          </div>

          <div className="bg-black/40 border border-[#1E293B] p-2.5 rounded">
            <span className="text-[10px] text-[#888] block uppercase">Active Multi-State Solvers</span>
            <span className="font-bold text-amber-300 text-lg">
              {scenarios.filter((s) => s.status === 'SUPERPOSITION_ACTIVE').length} / {scenarios.length}
            </span>
            <span className="text-[10px] text-[#888] block mt-0.5">Continuous Dynamic Guard</span>
          </div>
        </div>
      </div>

      {statusNotice && (
        <div className="bg-cyan-950/60 border border-cyan-500/60 text-cyan-200 text-xs font-mono p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{statusNotice}</span>
          </div>
          <button
            onClick={() => setStatusNotice(null)}
            className="text-[#888] hover:text-white text-xs font-mono uppercase ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#222]">
        {[
          { id: 'ALL', label: 'All Scenarios (8)' },
          { id: 'HOS_DUTY_CLOCK', label: 'HOS 14h Clock' },
          { id: 'ROADSIDE_CVSA_LEVEL_1', label: 'CVSA Roadside Level 1' },
          { id: 'WEIGHT_BRIDGE_FORMULA', label: 'Bridge Formula & Weight' },
          { id: 'CARGO_SECUREMENT', label: 'Cargo Securement' },
          { id: 'TIRE_BLOWOUT_TREAD', label: 'Tire Tread & Blowouts' },
          { id: 'LOW_BRIDGE_CLEARANCE', label: 'Low Bridges' },
          { id: 'ADVERSE_WEATHER_SAFE_HAVEN', label: 'Adverse Weather' },
          { id: 'PRE_TRIP_DVIR_DISCREPANCY', label: 'DVIR Integrity' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1.5 rounded-t text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedCategory === tab.id
                ? 'bg-cyan-950/80 text-cyan-300 border-b-2 border-cyan-400'
                : 'text-[#777] hover:text-white hover:bg-[#141414]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredScenarios.map((scen) => {
          const Icon = getCategoryIcon(scen.category);
          const isResolved =
            scen.status === 'RESOLVED_GROUND_STATE' || scen.status === 'PREVENTED';
          const isExpanded = expandedScenarioId === scen.id;

          return (
            <div
              key={scen.id}
              className={`rounded-xl border p-5 transition-all shadow-lg space-y-4 relative ${
                isResolved
                  ? 'bg-gradient-to-b from-[#0E1513] to-[#0A0E0C] border-emerald-800/60'
                  : 'bg-gradient-to-b from-[#14161C] to-[#0E1014] border-cyan-500/40 hover:border-cyan-400'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-lg border ${
                      isResolved
                        ? 'bg-emerald-950/50 border-emerald-700 text-emerald-400'
                        : 'bg-cyan-950/50 border-cyan-600 text-cyan-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-base tracking-tight uppercase">
                        {scen.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-amber-300 border border-[#333]">
                        {scen.fmcsaStatute}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#888] mt-0.5">
                      Penalty Risk: <span className="text-red-400 font-bold">{scen.cvsaFineOrPenalty}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                    isResolved
                      ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                      : 'bg-cyan-950 border border-cyan-500 text-cyan-300 animate-pulse'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isResolved ? 'bg-emerald-400' : 'bg-cyan-400'
                    }`}
                  />
                  {isResolved ? 'RESOLVED GROUND STATE' : 'SUPERPOSITION WAVE'}
                </span>
              </div>

              {/* Quantum Probability & Prevention Horizon */}
              <div className="grid grid-cols-2 gap-2 bg-black/50 p-2.5 rounded border border-[#222] font-mono text-xs">
                <div>
                  <div className="flex justify-between text-[10px] text-[#888] mb-1">
                    <span>Wave Amplitude (|ψ|²)</span>
                    <span
                      className={`font-bold ${
                        isResolved ? 'text-emerald-400' : 'text-cyan-300'
                      }`}
                    >
                      {(scen.riskProbabilityAmplitude * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isResolved ? 'bg-emerald-500' : 'bg-cyan-400'
                      }`}
                      style={{
                        width: `${Math.min(100, scen.riskProbabilityAmplitude * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[9px] text-[#666] block mt-1">
                    Phase: {scen.quantumPhaseDeg}° Coupling
                  </span>
                </div>

                <div className="border-l border-[#222] pl-3 flex flex-col justify-center">
                  <span className="text-[10px] text-[#888] block uppercase">Prevention Horizon</span>
                  <span className="font-bold text-white text-sm">
                    {isResolved ? 'AVERTED' : `${scen.preventionTimeWindowMinutes} min threshold`}
                  </span>
                  <span className="text-[9px] text-[#666] block">Before Statutory Breach</span>
                </div>
              </div>

              {/* Superposition Real-World Context */}
              <p className="text-xs font-mono text-[#AAA] leading-relaxed">
                {scen.superpositionDescription}
              </p>

              {/* Ground-State Resolution Box */}
              <div className="p-3 bg-[#0A0D12] border border-cyan-900/60 rounded-lg font-mono text-xs space-y-1.5">
                <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  // Quantum Ground-State Preventive Action:
                </div>
                <p className="text-white text-xs leading-relaxed font-medium">
                  {scen.eigenstateGroundResolution}
                </p>
              </div>

              {/* Toggle Detail Actions */}
              <div className="space-y-2">
                <button
                  onClick={() =>
                    setExpandedScenarioId(isExpanded ? null : scen.id)
                  }
                  className="w-full flex items-center justify-between text-xs font-mono text-[#888] hover:text-white py-1 px-2 rounded hover:bg-black/40 transition-all"
                >
                  <span>Inspect Driver & Dispatcher Task Directives</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="pt-2 border-t border-[#222] space-y-2 font-mono text-xs">
                    <div className="bg-[#12141C] p-2.5 rounded border border-[#2A2E3D]">
                      <span className="text-[10px] font-bold text-amber-300 uppercase block mb-0.5">
                        Driver Immediate In-Cab Action:
                      </span>
                      <span className="text-white">{scen.driverImmediateAction}</span>
                    </div>

                    <div className="bg-[#12141C] p-2.5 rounded border border-[#2A2E3D]">
                      <span className="text-[10px] font-bold text-cyan-300 uppercase block mb-0.5">
                        Fleet Dispatcher Action:
                      </span>
                      <span className="text-white">{scen.fleetDispatcherAction}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Action */}
              <div className="flex items-center justify-between pt-2 border-t border-[#222]">
                <span className="text-[10px] font-mono text-[#666]">
                  Status: <strong className="text-white">{scen.status}</strong>
                </span>

                {!isResolved ? (
                  <button
                    onClick={() => handleResolveSingleScenario(scen.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500 text-cyan-300 font-mono text-xs font-bold uppercase rounded transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Collapse & Resolve</span>
                  </button>
                ) : (
                  <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>100% Pre-empted</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
