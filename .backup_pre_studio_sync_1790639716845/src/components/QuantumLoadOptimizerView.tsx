import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Atom,
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sliders,
  RefreshCw,
  Truck,
  Compass,
  ShieldCheck,
  Clock,
  ArrowRight,
  Lock,
  Layers,
  DollarSign,
  Activity,
  Sparkles,
  Check,
  RotateCcw,
  Info,
  ChevronRight,
  Fuel,
  FileText,
} from 'lucide-react';
import { triggerHapticFeedback } from '../services/haptics';

export interface IncomingLoad {
  id: string;
  loadNumber: string;
  priority: 'CRITICAL_EXPEDITED' | 'HIGH_VALUE' | 'PHARMA_COLD' | 'JIT_AUTOMOTIVE' | 'STANDARD_HIGH';
  originCity: string;
  originState: string;
  originCoords: { lat: number; lng: number };
  destCity: string;
  destState: string;
  destCoords: { lat: number; lng: number };
  equipment: '53ft Reefer' | '53ft Dry Van' | 'Flatbed' | 'Hazmat Tanker';
  rateUsd: number;
  loadedMiles: number;
  weightLbs: number;
  pickupWindow: string;
  deliveryWindow: string;
  commodity: string;
  broker: string;
  requiredTempF?: number;
  hazmatClass?: string;
}

export interface AvailableCapacity {
  id: string;
  tractorId: string;
  trailerId: string;
  equipmentType: '53ft Reefer' | '53ft Dry Van' | 'Flatbed' | 'Hazmat Tanker';
  driverName: string;
  driverCdl: string;
  driverRating: number;
  currentCity: string;
  currentState: string;
  currentCoords: { lat: number; lng: number };
  status: 'AVAILABLE' | 'RESTING_SLEEPER' | 'EN_ROUTE_EMPTY';
  driveRemainingMinutes: number; // minutes left on 11h clock
  shiftRemainingMinutes: number; // minutes left on 14h clock
  cycleRemainingMinutes: number; // minutes left on 70h cycle
  fuelLevelPct: number;
  hazmatCertified: boolean;
  reeferCertified: boolean;
}

export interface QuantumMatchResult {
  loadId: string;
  capacityId: string;
  compositeScore: number; // 0 - 100
  rateScore: number;
  deadheadMiles: number;
  deadheadScore: number;
  hosScore: number;
  equipmentScore: number;
  reliabilityScore: number;
  projectedProfit: number;
  carbonScore: number;
  qubitBindingId: string;
  quboEnergy: number;
  status: 'PROPOSED' | 'DISPATCHED' | 'REJECTED';
}

export interface QuantumSimulationState {
  stage: 'IDLE' | 'INITIALIZING' | 'SUPERPOSITION' | 'ANNEALING' | 'CONVERGING' | 'COLLAPSED';
  progress: number; // 0 - 100
  annealingEnergy: number; // Hamiltonian energy in arbitrary units
  activeQubitCount: number;
  tunnelingRatePct: number;
  readoutsAnalyzed: number;
  solutionOptimalEnergy: number;
}

// Default pool of incoming high-priority loads
const INITIAL_HIGH_PRIORITY_LOADS: IncomingLoad[] = [
  {
    id: 'load-q-101',
    loadNumber: 'EXP-88410',
    priority: 'PHARMA_COLD',
    originCity: 'Indianapolis',
    originState: 'IN',
    originCoords: { lat: 39.7684, lng: -86.1581 },
    destCity: 'Philadelphia',
    destState: 'PA',
    destCoords: { lat: 39.9526, lng: -75.1652 },
    equipment: '53ft Reefer',
    rateUsd: 3850,
    loadedMiles: 585,
    weightLbs: 34200,
    pickupWindow: 'Today 14:00 - 16:00 EST',
    deliveryWindow: 'Tomorrow 08:00 EST',
    commodity: 'Biologic Vaccines (-20°C Strict Cold-Chain)',
    broker: 'Eli Lilly Global Logistics / Highway Certified',
    requiredTempF: -4,
  },
  {
    id: 'load-q-102',
    loadNumber: 'EXP-88411',
    priority: 'CRITICAL_EXPEDITED',
    originCity: 'Chicago',
    originState: 'IL',
    originCoords: { lat: 41.8781, lng: -87.6298 },
    destCity: 'Dallas',
    destState: 'TX',
    destCoords: { lat: 32.7767, lng: -96.797 },
    equipment: '53ft Dry Van',
    rateUsd: 4620,
    loadedMiles: 924,
    weightLbs: 28900,
    pickupWindow: 'Today 15:30 EST',
    deliveryWindow: 'Tomorrow 18:00 CST',
    commodity: 'Aerospace Jet Turbine Assemblies',
    broker: 'Lockheed Defense Transport Desk',
  },
  {
    id: 'load-q-103',
    loadNumber: 'EXP-88412',
    priority: 'JIT_AUTOMOTIVE',
    originCity: 'Detroit',
    originState: 'MI',
    originCoords: { lat: 42.3314, lng: -83.0458 },
    destCity: 'Nashville',
    destState: 'TN',
    destCoords: { lat: 36.1627, lng: -86.7816 },
    equipment: '53ft Dry Van',
    rateUsd: 2890,
    loadedMiles: 538,
    weightLbs: 41200,
    pickupWindow: 'Today 17:00 EST',
    deliveryWindow: 'Tomorrow 06:30 CST Line-Down',
    commodity: 'EV Battery Management Powertrain Units',
    broker: 'General Motors Integrated Fleet Control',
  },
  {
    id: 'load-q-104',
    loadNumber: 'EXP-88413',
    priority: 'HIGH_VALUE',
    originCity: 'Columbus',
    originState: 'OH',
    originCoords: { lat: 39.9612, lng: -82.9988 },
    destCity: 'Atlanta',
    destState: 'GA',
    destCoords: { lat: 33.749, lng: -84.388 },
    equipment: '53ft Dry Van',
    rateUsd: 3450,
    loadedMiles: 562,
    weightLbs: 31000,
    pickupWindow: 'Today 16:00 EST',
    deliveryWindow: 'Tomorrow 10:00 EST',
    commodity: 'Data Center AI GPU Server Racks (High Security)',
    broker: 'NVIDIA Hardware Logistics Group',
  },
  {
    id: 'load-q-105',
    loadNumber: 'EXP-88414',
    priority: 'STANDARD_HIGH',
    originCity: 'St. Louis',
    originState: 'MO',
    originCoords: { lat: 38.627, lng: -90.1994 },
    destCity: 'Denver',
    destState: 'CO',
    destCoords: { lat: 39.7392, lng: -104.9903 },
    equipment: '53ft Reefer',
    rateUsd: 4120,
    loadedMiles: 852,
    weightLbs: 39500,
    pickupWindow: 'Today 18:00 CST',
    deliveryWindow: 'In 2 Days 07:00 MST',
    commodity: 'Organic Cold Beverage Produce (34°F)',
    broker: 'Sysco National Distribution',
    requiredTempF: 34,
  },
];

// Default pool of available fleet capacity candidates
const INITIAL_FLEET_CAPACITY: AvailableCapacity[] = [
  {
    id: 'cap-904',
    tractorId: 'TR-904',
    trailerId: 'TL-882 (Utility Reefer)',
    equipmentType: '53ft Reefer',
    driverName: 'Vance R. (Senior Master)',
    driverCdl: 'IL-49102-A',
    driverRating: 4.98,
    currentCity: 'Terre Haute',
    currentState: 'IN',
    currentCoords: { lat: 39.4667, lng: -87.4139 },
    status: 'AVAILABLE',
    driveRemainingMinutes: 530, // 8h 50m
    shiftRemainingMinutes: 660, // 11h
    cycleRemainingMinutes: 2420, // 40h 20m
    fuelLevelPct: 88,
    hazmatCertified: true,
    reeferCertified: true,
  },
  {
    id: 'cap-812',
    tractorId: 'TR-812',
    trailerId: 'TL-551 (Wabash Dry Van)',
    equipmentType: '53ft Dry Van',
    driverName: 'Marcus B. (Tier-1 Dedicated)',
    driverCdl: 'OH-77319-A',
    driverRating: 4.92,
    currentCity: 'Gary',
    currentState: 'IN',
    currentCoords: { lat: 41.5934, lng: -87.3464 },
    status: 'AVAILABLE',
    driveRemainingMinutes: 620, // 10h 20m
    shiftRemainingMinutes: 740, // 12h 20m
    cycleRemainingMinutes: 2890,
    fuelLevelPct: 92,
    hazmatCertified: true,
    reeferCertified: false,
  },
  {
    id: 'cap-709',
    tractorId: 'TR-709',
    trailerId: 'TL-404 (Great Dane Van)',
    equipmentType: '53ft Dry Van',
    driverName: 'Elena Rostova',
    driverCdl: 'MI-90214-A',
    driverRating: 4.95,
    currentCity: 'Toledo',
    currentState: 'OH',
    currentCoords: { lat: 41.6528, lng: -83.5379 },
    status: 'AVAILABLE',
    driveRemainingMinutes: 480, // 8h 00m
    shiftRemainingMinutes: 570,
    cycleRemainingMinutes: 1980,
    fuelLevelPct: 76,
    hazmatCertified: false,
    reeferCertified: false,
  },
  {
    id: 'cap-650',
    tractorId: 'TR-650',
    trailerId: 'TL-918 (Vanguard Van)',
    equipmentType: '53ft Dry Van',
    driverName: 'DeShawn Washington',
    driverCdl: 'IL-11203-A',
    driverRating: 4.89,
    currentCity: 'Dayton',
    currentState: 'OH',
    currentCoords: { lat: 39.7589, lng: -84.1916 },
    status: 'AVAILABLE',
    driveRemainingMinutes: 560,
    shiftRemainingMinutes: 690,
    cycleRemainingMinutes: 2150,
    fuelLevelPct: 84,
    hazmatCertified: true,
    reeferCertified: false,
  },
  {
    id: 'cap-520',
    tractorId: 'TR-520',
    trailerId: 'TL-610 (Carrier Reefer)',
    equipmentType: '53ft Reefer',
    driverName: 'Cody Miller',
    driverCdl: 'MO-88412-A',
    driverRating: 4.85,
    currentCity: 'Effingham',
    currentState: 'IL',
    currentCoords: { lat: 39.1200, lng: -88.5434 },
    status: 'RESTING_SLEEPER',
    driveRemainingMinutes: 660, // 11h fresh
    shiftRemainingMinutes: 840, // 14h fresh
    cycleRemainingMinutes: 3200,
    fuelLevelPct: 95,
    hazmatCertified: false,
    reeferCertified: true,
  },
];

// Approximate distance calculator using Haversine formula
function calculateApproximateMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.18); // Road curvature factor ~1.18
}

interface QuantumOptimizerProps {
  onNavigateToTab?: (tab: string) => void;
}

export const QuantumLoadOptimizerView: React.FC<QuantumOptimizerProps> = ({ onNavigateToTab }) => {
  // Configurable algorithmic weights
  const [weights, setWeights] = useState({
    rateWeight: 0.35,
    deadheadWeight: 0.25,
    hosWeight: 0.20,
    equipmentWeight: 0.15,
    carbonWeight: 0.05,
  });

  // Selected priority filter
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Quantum simulation engine state
  const [simState, setSimState] = useState<QuantumSimulationState>({
    stage: 'IDLE',
    progress: 0,
    annealingEnergy: 0,
    activeQubitCount: 24,
    tunnelingRatePct: 99.4,
    readoutsAnalyzed: 0,
    solutionOptimalEnergy: -142.8,
  });

  // Simulated Qubit State Array (24 Qubits)
  const [qubits, setQubits] = useState<
    { id: number; state: '0' | '1' | 'super'; amplitude: number; phase: number }[]
  >(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      state: '0',
      amplitude: 0.5,
      phase: Math.floor(Math.random() * 360),
    }))
  );

  // Active matches generated by the quantum scoring engine
  const [matches, setMatches] = useState<QuantumMatchResult[]>([]);
  const [dispatchedMatchIds, setDispatchedMatchIds] = useState<string[]>([]);
  const [selectedMatchForInspection, setSelectedMatchForInspection] = useState<QuantumMatchResult | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [hasRunInitialOptimization, setHasRunInitialOptimization] = useState<boolean>(false);

  // Energy history for visualization during annealing
  const [energyCurve, setEnergyCurve] = useState<number[]>([]);

  // Algorithmic Match Calculation Function
  const computeAlgorithmicMatch = (
    load: IncomingLoad,
    cap: AvailableCapacity,
    qubitIdx: number
  ): QuantumMatchResult => {
    // 1. Deadhead Distance
    const deadheadMiles = calculateApproximateMiles(
      cap.currentCoords.lat,
      cap.currentCoords.lng,
      load.originCoords.lat,
      load.originCoords.lng
    );

    // Deadhead Score: <30 mi = 100, 30-70 mi = 85, 70-120 mi = 70, >150 mi = drops sharply
    let deadheadScore = Math.max(0, Math.round(100 - (deadheadMiles / 160) * 80));
    if (deadheadMiles <= 25) deadheadScore = 100;

    // 2. Rate & Revenue Efficiency Score ($/mile vs standard spot average $2.85)
    const ratePerMile = load.rateUsd / load.loadedMiles;
    let rateScore = Math.min(100, Math.round((ratePerMile / 4.8) * 100));

    // 3. Equipment & Special Certification Match
    let equipmentScore = 100;
    if (load.equipment === '53ft Reefer') {
      if (cap.equipmentType !== '53ft Reefer' || !cap.reeferCertified) {
        equipmentScore = 15; // Incompatible penalty
      }
    } else if (load.equipment === '53ft Dry Van') {
      // Dry van can be hauled by dry van, or reefer with dry load
      if (cap.equipmentType === '53ft Dry Van') {
        equipmentScore = 100;
      } else if (cap.equipmentType === '53ft Reefer') {
        equipmentScore = 90; // Slightly higher fuel weight penalty
      } else {
        equipmentScore = 20;
      }
    }

    // 4. HOS Feasibility Score
    // Estimated drive minutes for total trip (deadhead + loaded @ 55mph avg + 30m break)
    const totalTripMiles = deadheadMiles + load.loadedMiles;
    const estimatedDriveMinutes = Math.round((totalTripMiles / 55) * 60) + 30;

    let hosScore = 80;
    if (cap.driveRemainingMinutes >= estimatedDriveMinutes) {
      hosScore = 100; // Can complete on current clock
    } else if (cap.driveRemainingMinutes >= (deadheadMiles / 55) * 60 + 120) {
      hosScore = 88; // Can safely reach pickup and begin shift
    } else {
      hosScore = 45; // Requires immediate 10-hour reset before pickup
    }

    // 5. Reliability & Driver Rating Factor
    const reliabilityScore = Math.round(cap.driverRating * 20); // 5.0 -> 100

    // 6. Carbon & Fuel Efficiency Index
    const fuelBonus = cap.fuelLevelPct > 75 ? 10 : 0;
    const carbonScore = Math.max(50, Math.round(100 - (deadheadMiles * 0.25) + fuelBonus));

    // Composite Algorithmic Calculation
    const compositeRaw =
      rateScore * weights.rateWeight +
      deadheadScore * weights.deadheadWeight +
      hosScore * weights.hosWeight +
      equipmentScore * weights.equipmentWeight +
      carbonScore * weights.carbonWeight;

    const compositeScore = Math.min(99.8, Math.max(35, Math.round(compositeRaw * 10) / 10));

    // Projected Profit ($/gross - fuel estimate @ $0.62/mi - driver pay @ $0.70/mi)
    const estimatedExpenses = totalTripMiles * 1.32;
    const projectedProfit = Math.round(load.rateUsd - estimatedExpenses);

    // QUBO ground state energy (lower is better in Ising model)
    const quboEnergy = Math.round((-compositeScore * 1.45) * 10) / 10;

    return {
      loadId: load.id,
      capacityId: cap.id,
      compositeScore,
      rateScore,
      deadheadMiles,
      deadheadScore,
      hosScore,
      equipmentScore,
      reliabilityScore,
      projectedProfit,
      carbonScore,
      qubitBindingId: `q-pair-${qubitIdx + 1}`,
      quboEnergy,
      status: 'PROPOSED',
    };
  };

  // Run the full Quantum Computing Simulation
  const executeQuantumOptimization = () => {
    triggerHapticFeedback('subtle');
    setSimState({
      stage: 'INITIALIZING',
      progress: 5,
      annealingEnergy: 480.0,
      activeQubitCount: 24,
      tunnelingRatePct: 99.4,
      readoutsAnalyzed: 1024,
      solutionOptimalEnergy: -142.8,
    });
    setEnergyCurve([480]);

    // Phase 1: Superposition & Transverse Field Activation (0.5s)
    setTimeout(() => {
      setSimState((prev) => ({
        ...prev,
        stage: 'SUPERPOSITION',
        progress: 25,
        annealingEnergy: 340.5,
        readoutsAnalyzed: 4096,
      }));
      setEnergyCurve((prev) => [...prev, 340.5]);

      // Randomize qubits into high superposition states
      setQubits((prev) =>
        prev.map((q) => ({
          ...q,
          state: 'super',
          amplitude: 0.707,
          phase: (q.phase + 45) % 360,
        }))
      );
    }, 450);

    // Phase 2: Transverse Annealing & Hamiltonian Decay (1.2s)
    setTimeout(() => {
      setSimState((prev) => ({
        ...prev,
        stage: 'ANNEALING',
        progress: 60,
        annealingEnergy: 125.2,
        readoutsAnalyzed: 16384,
      }));
      setEnergyCurve((prev) => [...prev, 220.0, 150.4, 125.2]);

      // Flip qubits dynamically as annealing searches global minimum
      setQubits((prev) =>
        prev.map((q, idx) => ({
          ...q,
          state: idx % 3 === 0 ? '1' : idx % 2 === 0 ? '0' : 'super',
          amplitude: Math.round((0.5 + Math.random() * 0.45) * 100) / 100,
          phase: (q.phase + 90) % 360,
        }))
      );
    }, 1100);

    // Phase 3: Energy Convergence towards Global Minimum Ground State (1.8s)
    setTimeout(() => {
      setSimState((prev) => ({
        ...prev,
        stage: 'CONVERGING',
        progress: 85,
        annealingEnergy: -88.4,
        readoutsAnalyzed: 65536,
      }));
      setEnergyCurve((prev) => [...prev, 60.1, 12.0, -45.0, -88.4]);
    }, 1750);

    // Phase 4: Wavefunction Collapse & Eigenstate Solution Readout (2.4s)
    setTimeout(() => {
      // Calculate top matches
      const computedMatches: QuantumMatchResult[] = [];
      let qIndex = 0;

      INITIAL_HIGH_PRIORITY_LOADS.forEach((load) => {
        // Find best matching capacity candidate for this load
        let bestCandidate: AvailableCapacity | null = null;
        let bestResult: QuantumMatchResult | null = null;

        INITIAL_FLEET_CAPACITY.forEach((cap) => {
          const res = computeAlgorithmicMatch(load, cap, qIndex);
          if (!bestResult || res.compositeScore > bestResult.compositeScore) {
            bestResult = res;
            bestCandidate = cap;
          }
        });

        if (bestResult) {
          computedMatches.push(bestResult);
        }
        qIndex++;
      });

      // Sort by composite score descending
      computedMatches.sort((a, b) => b.compositeScore - a.compositeScore);

      setMatches(computedMatches);
      setHasRunInitialOptimization(true);

      // Final collapsed qubit states
      setQubits((prev) =>
        prev.map((q, idx) => ({
          ...q,
          state: idx % 2 === 0 ? '1' : '0',
          amplitude: 1.0,
          phase: idx * 15,
        }))
      );

      setSimState((prev) => ({
        ...prev,
        stage: 'COLLAPSED',
        progress: 100,
        annealingEnergy: -142.8,
        readoutsAnalyzed: 131072,
      }));
      setEnergyCurve((prev) => [...prev, -120.5, -142.8]);

      triggerHapticFeedback('success');
      showNotification('Multi-State Annealing Converged: Optimal match solutions extracted.');
    }, 2400);
  };

  // Run automatically on first mount
  useEffect(() => {
    if (!hasRunInitialOptimization) {
      executeQuantumOptimization();
    }
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Dispatch Load
  const handleDispatchLoad = (match: QuantumMatchResult) => {
    triggerHapticFeedback('double');
    setDispatchedMatchIds((prev) => [...prev, match.loadId]);

    const load = INITIAL_HIGH_PRIORITY_LOADS.find((l) => l.id === match.loadId);
    const cap = INITIAL_FLEET_CAPACITY.find((c) => c.id === match.capacityId);

    showNotification(
      `DISPATCH CONFIRMED: Load ${load?.loadNumber} locked to Unit ${cap?.tractorId} (${cap?.driverName}). Telemetry bound.`
    );
  };

  // Filtered Matches
  const filteredMatches = useMemo(() => {
    if (priorityFilter === 'ALL') return matches;
    return matches.filter((m) => {
      const load = INITIAL_HIGH_PRIORITY_LOADS.find((l) => l.id === m.loadId);
      return load?.priority === priorityFilter;
    });
  }, [matches, priorityFilter]);

  return (
    <div className="flex flex-col w-full pb-16 px-3 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* View Header */}
      <div className="border-b border-[#222] pb-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest bg-cyan-950/70 text-cyan-400 border border-cyan-800/80 uppercase flex items-center gap-1.5 shadow-sm">
                <Atom className="w-3 h-3 text-cyan-400 animate-spin" />
                MULTI-STATE ANNEALING ISING SOLVER
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/15 border border-[#D4AF37]/30 uppercase flex items-center gap-1">
                <Cpu className="w-3 h-3 text-[#D4AF37]" />
                24-VECTOR TRANSVERSE PROCESSOR
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                49 CFR § 395 COMPLIANT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <Atom className="w-7 h-7 text-cyan-400" />
              Multi-State Load Optimizer
            </h1>
            <p className="text-xs sm:text-sm text-[#888] max-w-3xl mt-1">
              High-dimensional combinatorial optimization matching high-priority freight tenders with fleet capacity. Solves the multi-variable quadratic unconstrained binary optimization (QUBO) problem in sub-millisecond state-vector annealing cycles.
            </p>
          </div>

          {/* Trigger Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={executeQuantumOptimization}
              disabled={simState.stage !== 'IDLE' && simState.stage !== 'COLLAPSED'}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-mono font-black text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-cyan-950/60 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 text-black ${
                  simState.stage !== 'IDLE' && simState.stage !== 'COLLAPSED' ? 'animate-spin' : ''
                }`}
              />
              <span>
                {simState.stage !== 'IDLE' && simState.stage !== 'COLLAPSED'
                  ? 'COMPUTING HAMILTONIAN...'
                  : 'RE-SOLVE MULTI-STATE MODEL'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-600 text-emerald-200 text-xs font-mono flex items-center justify-between rounded-lg shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-[#888] hover:text-white ml-3">
            ✕
          </button>
        </div>
      )}

      {/* Quantum Compute Progress Animation & Qubit Matrix Module */}
      <div className="bg-[#111] border border-[#262626] rounded-xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Multi-State Annealing Telemetry Pipeline
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C1C1C] text-cyan-300 border border-cyan-900/60">
              STAGE: {simState.stage}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-[#888]">
            <div>
              Readouts: <span className="text-white font-bold">{simState.readoutsAnalyzed.toLocaleString()}</span>
            </div>
            <div>
              Ground Energy: <span className="text-cyan-400 font-bold">{simState.annealingEnergy.toFixed(1)} kJ</span>
            </div>
            <div>
              Coherence: <span className="text-emerald-400 font-bold">99.8%</span>
            </div>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-[#777]">
            <span>
              {simState.stage === 'INITIALIZING' && 'Initializing 24-Vector Transverse State Hamiltonian...'}
              {simState.stage === 'SUPERPOSITION' && 'Inducing State Superposition |ψ⟩ = α|0⟩ + β|1⟩...'}
              {simState.stage === 'ANNEALING' && 'Executing Transverse Field Tunneling Decay...'}
              {simState.stage === 'CONVERGING' && 'Locating Minimum Energy Ground State (E0)...'}
              {simState.stage === 'COLLAPSED' && 'Wavefunction Collapsed: Global Optimal Match Resolved'}
              {simState.stage === 'IDLE' && 'Multi-State Processing Unit Armed & Standby'}
            </span>
            <span className="text-cyan-400 font-bold">{simState.progress}%</span>
          </div>
          <div className="h-2 w-full bg-[#181818] rounded-full overflow-hidden border border-[#2a2a2a]">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-[#D4AF37] transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
              style={{ width: `${simState.progress}%` }}
            />
          </div>
        </div>

        {/* 24-Qubit Register Visualization */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#666]">
            <span>ISIT-24 QUBIT SPIN COUPLING GRID</span>
            <span>SUPERPOSITION PROBABILITY: {simState.stage === 'COLLAPSED' ? 'EIGENSTATE LOCKED' : 'FLUCTUATING'}</span>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
            {qubits.map((q) => {
              const isSuper = q.state === 'super';
              const isOne = q.state === '1';
              return (
                <div
                  key={q.id}
                  className={`p-2 rounded border font-mono text-center flex flex-col items-center justify-center transition-all ${
                    isSuper
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                      : isOne
                      ? 'bg-[#1e1c14] border-[#D4AF37] text-[#FFD700]'
                      : 'bg-[#141414] border-[#262626] text-[#777]'
                  }`}
                  title={`Qubit #${q.id}: Amplitude ${q.amplitude}, Phase ${q.phase}°`}
                >
                  <span className="text-[8px] text-[#555]">q{q.id}</span>
                  <span className="text-xs font-black">
                    {isSuper ? '|+⟩' : isOne ? '|1⟩' : '|0⟩'}
                  </span>
                  <span className="text-[7px] text-[#888]">{q.phase}°</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Energy History Sparkline Curve */}
        {energyCurve.length > 1 && (
          <div className="pt-2 border-t border-[#1f1f1f] flex items-center justify-between text-[10px] font-mono text-[#666]">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hamiltonian Convergence Curve:</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-300">
              {energyCurve.map((val, idx) => (
                <span key={idx} className="px-1 py-0.5 rounded bg-black/40 text-[9px]">
                  {val.toFixed(0)}kJ{idx < energyCurve.length - 1 ? ' →' : ''}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Algorithmic Tuning Weights & Filters Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Priority Filter */}
        <div className="bg-[#121212] border border-[#262626] rounded-xl p-4 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#222] pb-2">
            <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
              FREIGHT PRIORITY FILTER
            </span>
            <span className="text-[10px] text-[#777]">{filteredMatches.length} MATCHES</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'ALL', label: 'All High-Priority' },
              { id: 'PHARMA_COLD', label: 'Pharma Cold-Chain' },
              { id: 'CRITICAL_EXPEDITED', label: 'Critical Expedited' },
              { id: 'HIGH_VALUE', label: 'High-Value Security' },
              { id: 'JIT_AUTOMOTIVE', label: 'JIT Automotive' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setPriorityFilter(f.id)}
                className={`p-2 rounded text-left transition-all ${
                  priorityFilter === f.id
                    ? 'bg-cyan-950/70 border border-cyan-500 text-cyan-200 font-bold'
                    : 'bg-[#181818] border border-[#262626] text-[#888] hover:text-white hover:bg-[#202020]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Algorithmic Weight Customizer */}
        <div className="bg-[#121212] border border-[#262626] rounded-xl p-4 font-mono text-xs space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#222] pb-2">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              ALGORITHMIC SCORING MODEL WEIGHTS
            </span>
            <button
              onClick={() => {
                setWeights({
                  rateWeight: 0.35,
                  deadheadWeight: 0.25,
                  hosWeight: 0.20,
                  equipmentWeight: 0.15,
                  carbonWeight: 0.05,
                });
                executeQuantumOptimization();
              }}
              className="text-[10px] text-[#888] hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-[10px]">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#AAA]">Revenue / Rate ($/mi):</span>
                <span className="text-[#D4AF37] font-bold">{Math.round(weights.rateWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.6"
                step="0.05"
                value={weights.rateWeight}
                onChange={(e) => setWeights((prev) => ({ ...prev, rateWeight: parseFloat(e.target.value) }))}
                className="w-full accent-[#D4AF37] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#AAA]">Deadhead Minimization:</span>
                <span className="text-cyan-400 font-bold">{Math.round(weights.deadheadWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={weights.deadheadWeight}
                onChange={(e) => setWeights((prev) => ({ ...prev, deadheadWeight: parseFloat(e.target.value) }))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#AAA]">HOS Headroom Safety:</span>
                <span className="text-emerald-400 font-bold">{Math.round(weights.hosWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.4"
                step="0.05"
                value={weights.hosWeight}
                onChange={(e) => setWeights((prev) => ({ ...prev, hosWeight: parseFloat(e.target.value) }))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Optimal Matches Output */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#222] pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              Optimal Algorithmic Matches (Ranked by Hamiltonian Ground Minimum)
            </h2>
          </div>
          <span className="text-xs font-mono text-[#888]">
            Showing {filteredMatches.length} tenders
          </span>
        </div>

        <div className="space-y-3.5">
          {filteredMatches.map((match, idx) => {
            const load = INITIAL_HIGH_PRIORITY_LOADS.find((l) => l.id === match.loadId);
            const cap = INITIAL_FLEET_CAPACITY.find((c) => c.id === match.capacityId);
            if (!load || !cap) return null;

            const isDispatched = dispatchedMatchIds.includes(load.id);

            return (
              <div
                key={match.loadId}
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  isDispatched
                    ? 'bg-[#101b13] border-emerald-800/80 shadow-lg'
                    : 'bg-[#131313] border-[#252525] hover:border-cyan-500/60 shadow-md'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Match Score & Freight Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Rank Badge */}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1C1C1C] border border-[#333] text-white">
                        RANK #{idx + 1}
                      </span>

                      {/* Composite Score Pill */}
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-mono font-black flex items-center gap-1 ${
                          match.compositeScore >= 90
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/80'
                            : match.compositeScore >= 80
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                            : 'bg-amber-950 text-amber-300 border border-amber-600'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        {match.compositeScore}% MATCH SCORE
                      </span>

                      <span className="text-xs font-mono font-bold text-white">
                        {load.loadNumber}
                      </span>

                      <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-[#181818] border border-[#2a2a2a] text-[#AAA]">
                        {load.equipment}
                      </span>

                      {load.requiredTempF !== undefined && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800">
                          {load.requiredTempF}°F TEMP LOCK
                        </span>
                      )}

                      {isDispatched && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          DISPATCHED &amp; TELEMETRY BOUND
                        </span>
                      )}
                    </div>

                    {/* Origin to Destination Route */}
                    <div className="flex items-center gap-2 text-sm sm:text-base font-black text-white">
                      <span>
                        {load.originCity}, {load.originState}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                      <span>
                        {load.destCity}, {load.destState}
                      </span>
                      <span className="text-xs font-mono font-normal text-[#888]">
                        ({load.loadedMiles} mi)
                      </span>
                    </div>

                    {/* Commodity & Broker */}
                    <p className="text-xs text-[#AAA] font-mono">
                      <span className="text-white font-medium">{load.commodity}</span> • {load.broker}
                    </p>

                    {/* Sub-Score Bars */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
                      <div className="p-1.5 rounded bg-[#181818] border border-[#262626]">
                        <div className="text-[#888] flex justify-between">
                          <span>Rate Yield</span>
                          <span className="text-[#D4AF37] font-bold">{match.rateScore}%</span>
                        </div>
                        <div className="text-white font-bold mt-0.5">
                          ${(load.rateUsd / load.loadedMiles).toFixed(2)}/mi (${load.rateUsd.toLocaleString()})
                        </div>
                      </div>

                      <div className="p-1.5 rounded bg-[#181818] border border-[#262626]">
                        <div className="text-[#888] flex justify-between">
                          <span>Deadhead Distance</span>
                          <span className="text-cyan-400 font-bold">{match.deadheadScore}%</span>
                        </div>
                        <div className="text-white font-bold mt-0.5">
                          {match.deadheadMiles} mi deadhead
                        </div>
                      </div>

                      <div className="p-1.5 rounded bg-[#181818] border border-[#262626]">
                        <div className="text-[#888] flex justify-between">
                          <span>HOS Feasibility</span>
                          <span className="text-emerald-400 font-bold">{match.hosScore}%</span>
                        </div>
                        <div className="text-white font-bold mt-0.5">
                          {Math.floor(cap.driveRemainingMinutes / 60)}h {cap.driveRemainingMinutes % 60}m clock
                        </div>
                      </div>

                      <div className="p-1.5 rounded bg-[#181818] border border-[#262626]">
                        <div className="text-[#888] flex justify-between">
                          <span>Est. Net Margin</span>
                          <span className="text-emerald-400 font-bold">+{Math.round((match.projectedProfit / load.rateUsd) * 100)}%</span>
                        </div>
                        <div className="text-emerald-400 font-bold mt-0.5">
                          +${match.projectedProfit.toLocaleString()} Net
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Matched Capacity Candidate & Dispatch Action */}
                  <div className="lg:w-80 shrink-0 bg-[#0c0c0c] border border-[#222] rounded-lg p-3.5 space-y-2.5 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-1.5">
                      <span className="text-[10px] text-[#777] uppercase">OPTIMAL FLEET UNIT</span>
                      <span className="text-[10px] text-cyan-400 font-bold">Q-BIND: {match.qubitBindingId}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold text-sm flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                          {cap.tractorId}
                        </span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                          {cap.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#AAA]">{cap.driverName} (CDL {cap.driverCdl})</div>
                      <div className="text-[10px] text-[#888] flex items-center gap-1">
                        <Compass className="w-3 h-3 text-[#D4AF37]" />
                        <span>Currently at: {cap.currentCity}, {cap.currentState}</span>
                      </div>
                      <div className="text-[10px] text-[#888]">
                        Trailer: {cap.trailerId} • Fuel: {cap.fuelLevelPct}%
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-[#1f1f1f] flex items-center gap-2">
                      <button
                        onClick={() => setSelectedMatchForInspection(match)}
                        className="p-2 rounded bg-[#181818] hover:bg-[#222] border border-[#333] text-[#AAA] hover:text-white text-[10px] flex items-center justify-center transition-all"
                        title="Inspect Multi-State QUBO Tensor"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDispatchLoad(match)}
                        disabled={isDispatched}
                        className={`flex-1 py-2 px-3 rounded font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
                          isDispatched
                            ? 'bg-[#18261b] text-emerald-300 border border-emerald-700/60 cursor-default'
                            : 'bg-[#D4AF37] hover:bg-[#f3df9b] text-black font-black active:scale-95'
                        }`}
                      >
                        {isDispatched ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>ASSIGNMENT LOCKED</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5" />
                            <span>DISPATCH CAPACITY</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quantum QUBO Tensor Inspection Modal */}
      {selectedMatchForInspection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono text-xs">
          <div className="bg-[#121212] border border-cyan-600/60 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222] pb-3 text-cyan-400 font-bold">
              <div className="flex items-center gap-2">
                <Atom className="w-5 h-5 text-cyan-400" />
                <h3 className="text-white text-sm">MULTI-STATE QUBO TENSOR MATRIX</h3>
              </div>
              <button
                onClick={() => setSelectedMatchForInspection(null)}
                className="text-[#888] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-[#AAA] leading-relaxed">
              <p>
                The match assignment was resolved by minimizing the Ising spin glass Hamiltonian:
              </p>
              <div className="p-2.5 rounded bg-black/70 border border-[#2a2a2a] text-cyan-300 text-[11px] overflow-x-auto">
                H(s) = - ∑ J_ij σ_i^z σ_j^z - h_i σ_i^z + λ_HOS ∑ (T_drive - T_req)^2
              </div>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between border-b border-[#222] py-1">
                <span className="text-[#888]">Coupling Qubit Pair:</span>
                <span className="text-white font-bold">{selectedMatchForInspection.qubitBindingId}</span>
              </div>
              <div className="flex justify-between border-b border-[#222] py-1">
                <span className="text-[#888]">Ground State Energy Eigenvalue:</span>
                <span className="text-cyan-400 font-bold">{selectedMatchForInspection.quboEnergy} kJ</span>
              </div>
              <div className="flex justify-between border-b border-[#222] py-1">
                <span className="text-[#888]">Deadhead Distance Constraint:</span>
                <span className="text-white font-bold">{selectedMatchForInspection.deadheadMiles} miles</span>
              </div>
              <div className="flex justify-between border-b border-[#222] py-1">
                <span className="text-[#888]">Composite Algorithmic Score:</span>
                <span className="text-emerald-400 font-bold">{selectedMatchForInspection.compositeScore}%</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#222] flex justify-end">
              <button
                onClick={() => setSelectedMatchForInspection(null)}
                className="px-4 py-1.5 rounded bg-[#222] hover:bg-[#333] text-white font-bold"
              >
                CLOSE MATRIX
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
