import React, { useState, useMemo } from 'react';
import {
  Scale,
  Truck,
  Printer,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  MapPin,
  ShieldCheck,
  Fuel,
  Maximize2,
  FileCheck,
  RotateCcw,
  Layers,
  ChevronRight,
  Info,
  Award,
  Sparkles,
  Smartphone,
  Check,
} from 'lucide-react';
import {
  US_STATE_BRIDGE_REGULATIONS,
  getStateBridgeRegulation,
  generateDefault53FootPalletLayout,
  calculateCombinationAxleWeights,
  PalletPosition,
  TractorCapacitySpec,
  TrailerSpec,
  AxleWeightCalculationResult,
} from '../services/axleLoadCalculatorService';
import { DatBoardLoad, INITIAL_LIVE_LOADS } from '../services/datLoadBoardService';
import { triggerHapticFeedback } from '../services/haptics';

interface LoadSheetsViewProps {
  initialLoad?: DatBoardLoad | null;
  onNavigateToTab?: (tab: string) => void;
}

export const LoadSheetsView: React.FC<LoadSheetsViewProps> = ({ initialLoad, onNavigateToTab }) => {
  // Available loads to select from
  const [allLoads] = useState<DatBoardLoad[]>(INITIAL_LIVE_LOADS);
  const [selectedLoadId, setSelectedLoadId] = useState<string>(
    initialLoad ? initialLoad.id : INITIAL_LIVE_LOADS[0]?.id || 'custom'
  );

  // Active load state
  const activeLoad = useMemo(() => {
    return allLoads.find((l) => l.id === selectedLoadId) || allLoads[0];
  }, [allLoads, selectedLoadId]);

  // Operational Parameters
  const [cargoWeightLbs, setCargoWeightLbs] = useState<number>(
    activeLoad ? activeLoad.weightLbs : 44500
  );
  const [originState, setOriginState] = useState<string>(
    activeLoad ? activeLoad.originState : 'IL'
  );
  const [destinationState, setDestinationState] = useState<string>(
    activeLoad ? activeLoad.destState : 'CA'
  );
  const [commodityName, setCommodityName] = useState<string>(
    activeLoad ? activeLoad.commodity : 'Consumer Goods & Electronics'
  );
  const [palletCount, setPalletCount] = useState<number>(26);

  // Tractor & Trailer Capacities
  const [tractorSpec, setTractorSpec] = useState<TractorCapacitySpec>({
    unitNumber: 'TRUCK-9901 (Cascadia DD15)',
    steerGawrLbs: 12500,
    driveGawrLbs: 40000,
    tractorTareWeightLbs: 18500,
    fuelTankCapacityGallons: 200,
    fuelLevelPercent: 95,
    fifthWheelPositionHole: 3,
  });

  const [trailerSpec, setTrailerSpec] = useState<TrailerSpec>({
    trailerNumber: 'VAN-5321 (Wabash Duraplate)',
    trailerLengthFeet: 53,
    trailerType: 'Dry Van 53\'',
    trailerTareWeightLbs: 13800,
    trailerGawrLbs: 34000,
    totalPinHoles: 12,
    selectedTandemHole: 6, // Hole 6 is typical for 40' KPRA (California legal)
    inchesPerHole: 4,
    weightShiftPerHoleLbs: 480,
  });

  // 26-pallet floor layout
  const [palletLayout, setPalletLayout] = useState<PalletPosition[]>(() =>
    generateDefault53FootPalletLayout(cargoWeightLbs, palletCount)
  );

  // View mode: 'CONFIG' | 'LOADER_HANDOUT' | 'PRINT_PREVIEW'
  const [viewMode, setViewMode] = useState<'CONFIG' | 'LOADER_HANDOUT'>('CONFIG');

  // Loader sign-off inputs
  const [loaderName, setLoaderName] = useState<string>('Marcus Vance (Shift Lead)');
  const [dockDoorNumber, setDockDoorNumber] = useState<string>('Door 42-B');
  const [sealNumber, setSealNumber] = useState<string>('SL-884921-HIGH-SECURITY');
  const [scaleTicketNumber, setScaleTicketNumber] = useState<string>('CAT-99201-SCALE');
  const [isLoaderSigned, setIsLoaderSigned] = useState<boolean>(true);
  const [isDriverSigned, setIsDriverSigned] = useState<boolean>(true);

  // Update when active load changes
  const handleSelectLoad = (loadId: string) => {
    setSelectedLoadId(loadId);
    const target = allLoads.find((l) => l.id === loadId);
    if (target) {
      setCargoWeightLbs(target.weightLbs);
      setOriginState(target.originState);
      setDestinationState(target.destState);
      setCommodityName(target.commodity);
      setPalletLayout(generateDefault53FootPalletLayout(target.weightLbs, palletCount));
      triggerHapticFeedback('subtle');
    }
  };

  // Synchronize pallet layout when total weight or pallet count changes
  const handleUpdateCargoWeight = (newWeight: number) => {
    setCargoWeightLbs(newWeight);
    setPalletLayout(generateDefault53FootPalletLayout(newWeight, palletCount));
  };

  // Tandem hole slider change
  const handleSliderHoleChange = (holeNumber: number) => {
    setTrailerSpec((prev) => ({
      ...prev,
      selectedTandemHole: holeNumber,
    }));
    triggerHapticFeedback('tick');
  };

  // Perform real-time axle weight physics calculation
  const calcResult: AxleWeightCalculationResult = useMemo(() => {
    return calculateCombinationAxleWeights({
      cargoWeightLbs,
      palletPositions: palletLayout,
      tractorSpec,
      trailerSpec,
      destinationStateCode: destinationState,
    });
  }, [cargoWeightLbs, palletLayout, tractorSpec, trailerSpec, destinationState]);

  // Destination State Rule
  const destStateRule = useMemo(() => {
    return getStateBridgeRegulation(destinationState);
  }, [destinationState]);

  // Handle print load sheet
  const handlePrintSheet = () => {
    triggerHapticFeedback('success');
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 print:p-0 print:m-0 print:max-w-none">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-white print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-wide">80,000 LB LOAD SHEETS & LOADER DIRECTIVES</h1>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
                  DOT 49 CFR PART 658
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Axle weight distribution calculator, State KPRA bridge enforcement, and warehouse loader handout sheets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setViewMode(viewMode === 'CONFIG' ? 'LOADER_HANDOUT' : 'CONFIG');
                triggerHapticFeedback('subtle');
              }}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border transition-all ${
                viewMode === 'LOADER_HANDOUT'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              {viewMode === 'LOADER_HANDOUT' ? 'EXIT HANDOUT MODE' : 'LOADER HANDOUT MODE'}
            </button>

            <button
              onClick={handlePrintSheet}
              className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all border border-emerald-400"
            >
              <Printer className="w-4 h-4" />
              PRINT LOAD SHEET
            </button>
          </div>
        </div>

        {/* Load Selector Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">SELECT ACTIVE HAUL / TENDER</label>
            <select
              value={selectedLoadId}
              onChange={(e) => handleSelectLoad(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              {allLoads.map((load) => (
                <option key={load.id} value={load.id}>
                  {load.loadNumber} • {load.originCity}, {load.originState} → {load.destCity}, {load.destState} ({load.weightLbs.toLocaleString()} lbs)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">CARGO WEIGHT (LBS)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10000"
                max="48000"
                step="250"
                value={cargoWeightLbs}
                onChange={(e) => handleUpdateCargoWeight(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
              />
              <span className="text-xs text-slate-400 font-mono">lbs</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">DESTINATION STATE (KPRA RULES)</label>
            <select
              value={destinationState}
              onChange={(e) => setDestinationState(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              {Object.keys(US_STATE_BRIDGE_REGULATIONS).map((st) => (
                <option key={st} value={st}>
                  {st} — {US_STATE_BRIDGE_REGULATIONS[st].stateName} (Max KPRA: {US_STATE_BRIDGE_REGULATIONS[st].kpraMaxDistanceFeet}&apos;)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">TRAILER SPEC & LENGTH</label>
            <div className="flex items-center gap-2">
              <select
                value={trailerSpec.trailerType}
                onChange={(e) =>
                  setTrailerSpec((prev) => ({
                    ...prev,
                    trailerType: e.target.value as any,
                  }))
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Dry Van 53&apos;">53&apos; Dry Van (13,800 lbs tare)</option>
                <option value="Reefer 53&apos;">53&apos; Reefer (15,200 lbs tare)</option>
                <option value="Flatbed 48&apos;">48&apos; Flatbed (11,400 lbs tare)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Axle Weight Live Scale Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {/* Steer Axle */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            calcResult.isSteerLegal
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-red-950/40 border-red-500/80 shadow-lg shadow-red-900/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">STEER AXLE</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                calcResult.isSteerLegal
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse'
              }`}
            >
              {calcResult.isSteerLegal ? 'LEGAL' : 'OVERWEIGHT'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-white">
              {calcResult.steerWeightLbs.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 12,000 lbs</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                calcResult.isSteerLegal ? 'bg-blue-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, (calcResult.steerWeightLbs / 12000) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-mono">
            {calcResult.steerOverUnderLbs <= 0
              ? `${Math.abs(calcResult.steerOverUnderLbs).toLocaleString()} lbs buffer remaining`
              : `+${calcResult.steerOverUnderLbs.toLocaleString()} lbs OVER LEGAL CAP`}
          </p>
        </div>

        {/* Drive Tandems */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            calcResult.isDriveLegal
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-red-950/40 border-red-500/80 shadow-lg shadow-red-900/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">DRIVE TANDEMS</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                calcResult.isDriveLegal
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse'
              }`}
            >
              {calcResult.isDriveLegal ? 'LEGAL' : 'OVERWEIGHT'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-white">
              {calcResult.driveTandemWeightLbs.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 34,000 lbs</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                calcResult.isDriveLegal ? 'bg-indigo-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, (calcResult.driveTandemWeightLbs / 34000) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-mono">
            {calcResult.driveOverUnderLbs <= 0
              ? `${Math.abs(calcResult.driveOverUnderLbs).toLocaleString()} lbs buffer remaining`
              : `+${calcResult.driveOverUnderLbs.toLocaleString()} lbs OVER TANDEM CAP`}
          </p>
        </div>

        {/* Trailer Tandems */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            calcResult.isTrailerLegal
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-red-950/40 border-red-500/80 shadow-lg shadow-red-900/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">TRAILER TANDEMS</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                calcResult.isTrailerLegal
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse'
              }`}
            >
              {calcResult.isTrailerLegal ? 'LEGAL' : 'OVERWEIGHT'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-white">
              {calcResult.trailerTandemWeightLbs.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 34,000 lbs</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                calcResult.isTrailerLegal ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, (calcResult.trailerTandemWeightLbs / 34000) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-mono">
            {calcResult.trailerOverUnderLbs <= 0
              ? `${Math.abs(calcResult.trailerOverUnderLbs).toLocaleString()} lbs buffer remaining`
              : `+${calcResult.trailerOverUnderLbs.toLocaleString()} lbs OVER TANDEM CAP`}
          </p>
        </div>

        {/* Gross Combination Weight */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            calcResult.isGrossLegal
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-red-950/40 border-red-500/80 shadow-lg shadow-red-900/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">TOTAL COMBINATION GROSS</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                calcResult.isGrossLegal
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse'
              }`}
            >
              {calcResult.isGrossLegal ? '80K LEGAL' : 'OVER 80,000 LBS'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {calcResult.grossCombinationWeightLbs.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 80,000 lbs</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                calcResult.isGrossLegal ? 'bg-emerald-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, (calcResult.grossCombinationWeightLbs / 80000) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-mono">
            {calcResult.grossOverUnderLbs <= 0
              ? `${Math.abs(calcResult.grossOverUnderLbs).toLocaleString()} lbs headroom under 80k`
              : `+${calcResult.grossOverUnderLbs.toLocaleString()} lbs OVER 80,000 LB FEDERAL CAP`}
          </p>
        </div>
      </div>

      {/* State KPRA & Slider Alert Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg mt-0.5 ${
              calcResult.kpraComplianceState.isLegal
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}
          >
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                {destStateRule.stateName} ({destStateRule.stateCode}) KPRA Standard: Max {destStateRule.kpraMaxDistanceFeet}&apos; 0&quot;
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  calcResult.kpraComplianceState.isLegal
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse'
                }`}
              >
                {calcResult.kpraComplianceState.isLegal
                  ? `CURRENT KPRA: ${calcResult.kpraDistanceFeet}&apos; (COMPLIANT)`
                  : `CURRENT KPRA: ${calcResult.kpraDistanceFeet}&apos; (ILLEGAL: +${calcResult.kpraComplianceState.differenceFeet}&apos;)`}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{destStateRule.kpraRuleNotes}</p>
          </div>
        </div>

        {/* Tandem Slider Control */}
        <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block">TANDEM PIN HOLE</span>
            <span className="text-sm font-bold font-mono text-amber-300">
              HOLE {trailerSpec.selectedTandemHole} of {trailerSpec.totalPinHoles}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleSliderHoleChange(Math.max(1, trailerSpec.selectedTandemHole - 1))}
              disabled={trailerSpec.selectedTandemHole <= 1}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-xs font-bold text-white"
              title="Slide tandems back (shifts weight to trailer)"
            >
              ◄ BACK
            </button>
            <span className="px-2 text-xs font-mono font-bold text-white">
              {calcResult.kpraDistanceFeet}&apos;
            </span>
            <button
              onClick={() =>
                handleSliderHoleChange(Math.min(trailerSpec.totalPinHoles, trailerSpec.selectedTandemHole + 1))
              }
              disabled={trailerSpec.selectedTandemHole >= trailerSpec.totalPinHoles}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-xs font-bold text-white"
              title="Slide tandems forward (shifts weight to drives)"
            >
              FWD ►
            </button>
          </div>
        </div>
      </div>

      {/* Main Section: 53-Foot Trailer Floor Blueprint & Loader Loading Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (7 cols): Visual 53' Trailer Deck Diagram */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  53-FOOT TRAILER DECK LOADING BLUEPRINT (26 PALLETS)
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Bulkhead (Nose) → Rear Doors (Tail)
              </span>
            </div>

            {/* Trailer Blueprint Container */}
            <div className="bg-slate-950 border-2 border-slate-700 rounded-xl p-4 relative overflow-x-auto">
              {/* Nose Bulkhead indicator */}
              <div className="w-full text-center py-1.5 bg-slate-800 text-slate-300 font-mono text-xs font-bold rounded-t tracking-widest border-b border-slate-700 flex items-center justify-center gap-2">
                <span>▲ FRONT BULKHEAD / NOSE (KINGPIN AT 36&quot;) ▲</span>
              </div>

              {/* Floor Rows */}
              <div className="py-4 space-y-2">
                {Array.from({ length: 13 }).map((_, rowIdx) => {
                  const rowNum = rowIdx + 1;
                  const leftPallet = palletLayout.find((p) => p.row === rowNum && p.side === 'LEFT');
                  const rightPallet = palletLayout.find((p) => p.row === rowNum && p.side === 'RIGHT');

                  let rowZone = 'BELLY_CORE';
                  let zoneLabel = 'BELLY CORE';
                  let zoneBg = 'border-slate-800 bg-slate-900/60';

                  if (rowNum <= 2) {
                    rowZone = 'NOSE';
                    zoneLabel = 'NOSE ZONE';
                    zoneBg = 'border-blue-900/40 bg-blue-950/20';
                  } else if (rowNum >= 10 && rowNum <= 12) {
                    rowZone = 'OVER_TANDEM';
                    zoneLabel = 'OVER TANDEMS';
                    zoneBg = 'border-amber-900/40 bg-amber-950/20';
                  } else if (rowNum === 13) {
                    rowZone = 'TAIL';
                    zoneLabel = 'REAR TAIL';
                    zoneBg = 'border-purple-900/40 bg-purple-950/20';
                  }

                  return (
                    <div
                      key={rowNum}
                      className={`p-2 rounded-lg border ${zoneBg} flex items-center justify-between gap-3 text-xs`}
                    >
                      <div className="w-16 font-mono text-[10px] text-slate-400">
                        <span className="block font-bold text-slate-200">ROW {rowNum}</span>
                        <span>{zoneLabel}</span>
                      </div>

                      {/* Left Pallet */}
                      <div className="flex-1 bg-slate-800/90 border border-slate-700 rounded p-2 text-center">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>PALLET #{leftPallet?.slotNumber} (L)</span>
                          <span className="text-amber-300 font-bold">
                            {leftPallet?.weightLbs.toLocaleString()} lbs
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-200 truncate mt-0.5">
                          Standard GMA 48x40
                        </div>
                      </div>

                      {/* Right Pallet */}
                      <div className="flex-1 bg-slate-800/90 border border-slate-700 rounded p-2 text-center">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>PALLET #{rightPallet?.slotNumber} (R)</span>
                          <span className="text-amber-300 font-bold">
                            {rightPallet?.weightLbs.toLocaleString()} lbs
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-200 truncate mt-0.5">
                          Standard GMA 48x40
                        </div>
                      </div>

                      <div className="w-20 text-right font-mono text-[11px] text-slate-300 font-bold">
                        {((leftPallet?.weightLbs || 0) + (rightPallet?.weightLbs || 0)).toLocaleString()} lbs
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rear Doors indicator */}
              <div className="w-full text-center py-1.5 bg-slate-800 text-slate-300 font-mono text-xs font-bold rounded-b tracking-widest border-t border-slate-700">
                <span>▼ REAR SWING DOORS / ICC BUMPER (LOAD LOCKS REQUIRED) ▼</span>
              </div>
            </div>

            {/* Weight Zone Guidance Legend */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-blue-950/40 border border-blue-800/50 text-blue-300">
                <span className="font-bold block">NOSE (Rows 1-2)</span>
                Transfers to Steer & Drives. Keep under 7,000 lbs.
              </div>
              <div className="p-2 rounded bg-slate-800/80 border border-slate-700 text-slate-300">
                <span className="font-bold block">BELLY (Rows 3-9)</span>
                Core weight bridge. Evenly split between axles.
              </div>
              <div className="p-2 rounded bg-amber-950/40 border border-amber-800/50 text-amber-300">
                <span className="font-bold block">TANDEMS (Rows 10-12)</span>
                Transfers direct to trailer bogie. Keep &lt;10,500 lbs.
              </div>
              <div className="p-2 rounded bg-purple-950/40 border border-purple-800/50 text-purple-300">
                <span className="font-bold block">TAIL (Row 13)</span>
                Lightweight step-down. Secure with load bars.
              </div>
            </div>
          </div>
        </div>

        {/* Right Col (5 cols): Official Loader Directives & Handout Sheet */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  LOADER DIRECTIVES &amp; COMPLIANCE VERIFICATION
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                FORKLIFT READY
              </span>
            </div>

            {/* Recommended Tandem Hole Badge */}
            <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">
                  RECOMMENDED TANDEM HOLE PIN
                </span>
                <span className="text-base font-bold text-amber-400 font-mono">
                  HOLE {calcResult.recommendedTandemHole} (KPRA: {calcResult.kpraDistanceFeet}&apos; 0&quot;)
                </span>
              </div>
              <button
                onClick={() => handleSliderHoleChange(calcResult.recommendedTandemHole)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition-all font-mono"
              >
                APPLY HOLE {calcResult.recommendedTandemHole}
              </button>
            </div>

            {/* Directives List */}
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                FORKLIFT OPERATOR STEP-BY-STEP RULES:
              </h4>
              {calcResult.loaderDirectives.map((directive, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs flex items-start gap-2 text-slate-300"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{directive}</span>
                </div>
              ))}
            </div>

            {/* Sign-Off Verification Block */}
            <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-mono text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                DOCK VERIFICATION &amp; CARRIER SIGN-OFF
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-0.5">
                    LOADER / SHIFT LEAD
                  </label>
                  <input
                    type="text"
                    value={loaderName}
                    onChange={(e) => setLoaderName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-0.5">
                    DOCK DOOR #
                  </label>
                  <input
                    type="text"
                    value={dockDoorNumber}
                    onChange={(e) => setDockDoorNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-0.5">
                    SECURITY BOLT SEAL #
                  </label>
                  <input
                    type="text"
                    value={sealNumber}
                    onChange={(e) => setSealNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-0.5">
                    CAT SCALE TICKET #
                  </label>
                  <input
                    type="text"
                    value={scaleTicketNumber}
                    onChange={(e) => setScaleTicketNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={isLoaderSigned}
                    onChange={(e) => setIsLoaderSigned(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span>Loader Certified Balanced</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={isDriverSigned}
                    onChange={(e) => setIsDriverSigned(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span>Driver Verified Scaled</span>
                </label>
              </div>

              {/* Hand to Loader Direct Trigger */}
              <button
                onClick={() => setViewMode('LOADER_HANDOUT')}
                className="w-full mt-2 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 font-mono uppercase tracking-wider"
              >
                <Smartphone className="w-4 h-4" />
                OPEN IN FULL-SCREEN LOADER HANDOUT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* FULL-SCREEN DRIVER ON-HAND / LOADER TABLET HANDOUT MODAL            */}
      {/* ==================================================================== */}
      {viewMode === 'LOADER_HANDOUT' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 print:hidden">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xl">
                  80K
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-wide text-amber-400">
                    ATTENTION: WAREHOUSE LOADER / FORKLIFT OPERATOR
                  </h2>
                  <p className="text-xs text-slate-300">
                    Maximum Capacity 80,000 LB Gross Axle Distribution Instructions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewMode('CONFIG')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-bold"
              >
                CLOSE
              </button>
            </div>

            {/* Core Load Information Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">TOTAL CARGO</span>
                <span className="text-base font-bold text-amber-400">
                  {cargoWeightLbs.toLocaleString()} lbs
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">PALLET COUNT</span>
                <span className="text-base font-bold text-white">26 Pallets</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">DESTINATION STATE</span>
                <span className="text-base font-bold text-emerald-400">
                  {destStateRule.stateName} ({destStateRule.stateCode})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">MANDATORY HOLE</span>
                <span className="text-base font-bold text-amber-400">
                  HOLE {calcResult.recommendedTandemHole}
                </span>
              </div>
            </div>

            {/* Critical Axle Weight Scale Targets */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                MANDATORY STATUTORY SCALING LIMITS:
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">STEER AXLE</span>
                  <span className="text-sm font-bold text-blue-400">
                    {calcResult.steerWeightLbs.toLocaleString()} lbs
                  </span>
                  <span className="text-[10px] text-slate-500 block">Max 12,000 lbs</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">DRIVE TANDEMS</span>
                  <span className="text-sm font-bold text-indigo-400">
                    {calcResult.driveTandemWeightLbs.toLocaleString()} lbs
                  </span>
                  <span className="text-[10px] text-slate-500 block">Max 34,000 lbs</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">TRAILER TANDEMS</span>
                  <span className="text-sm font-bold text-amber-400">
                    {calcResult.trailerTandemWeightLbs.toLocaleString()} lbs
                  </span>
                  <span className="text-[10px] text-slate-500 block">Max 34,000 lbs</span>
                </div>
              </div>
            </div>

            {/* Loader Instructions Checklist */}
            <div className="space-y-2 text-xs">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                MANDATORY LOADING PROCEDURE:
              </h3>
              <ul className="space-y-2 text-slate-200">
                <li className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>1. Inspect Trailer Floor:</strong> Verify 53&apos; floor boards are free of cracks and nails. Dry clean sweep.
                  </span>
                </li>
                <li className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>2. Protect Front Bulkhead:</strong> Load first 4 pallets straight in against the nose. Do NOT double stack heaviest items in extreme nose (prevents drive axle overweight).
                  </span>
                </li>
                <li className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>3. Center of Gravity in Belly:</strong> Concentrated weight belongs in Rows 3 through 9 directly over the center floor beams.
                  </span>
                </li>
                <li className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>4. Set Tandem Slider:</strong> Trailer tandems MUST be locked in <strong>Hole {calcResult.recommendedTandemHole}</strong> to comply with {destStateRule.stateName}&apos;s {destStateRule.kpraMaxDistanceFeet}&apos; KPRA regulation.
                  </span>
                </li>
                <li className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>5. Secure Tail Before Sealing:</strong> Install at least 2 load-locks / cargo bars across rear pallets before sealing doors with Bolt Seal #{sealNumber}.
                  </span>
                </li>
              </ul>
            </div>

            {/* Direct Driver Hand-Off Button */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Dock Door: <strong>{dockDoorNumber}</strong> • Lead: <strong>{loaderName}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintSheet}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs font-mono flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  PRINT COPY
                </button>
                <button
                  onClick={() => setViewMode('CONFIG')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs font-mono"
                >
                  CONFIRMED &amp; RETURN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 8.5" x 11" PRINTABLE LOAD SHEET STYLESHEET                          */}
      {/* ==================================================================== */}
      <div className="hidden print:block font-sans text-black p-8 bg-white max-w-4xl mx-auto space-y-6">
        {/* Print Header */}
        <div className="border-b-2 border-black pb-4 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase">
              TITAN CARRIER SERVICES LLC // MOTOR CARRIER LOAD SHEET
            </h1>
            <p className="text-xs font-semibold text-gray-700 mt-1">
              80,000 LB GROSS AXLE WEIGHT DISTRIBUTION &amp; LOADER DIRECTIVE SHEET
            </p>
            <p className="text-[11px] text-gray-600 font-mono">
              USDOT: 3928192 • MC: 991204 • Standard Operating Procedure 49 CFR Part 658
            </p>
          </div>
          <div className="text-right font-mono text-xs">
            <p className="font-bold">LOAD #{activeLoad?.loadNumber || 'LD-8819'}</p>
            <p>DATE: {new Date().toLocaleDateString()}</p>
            <p className="text-sm font-black text-black">STATUS: 80K LEGAL</p>
          </div>
        </div>

        {/* Load Specs Grid */}
        <div className="grid grid-cols-4 gap-4 border border-gray-400 p-3 rounded text-xs">
          <div>
            <span className="font-bold block text-gray-500">ORIGIN:</span>
            <span>{originState} — Quad Cities Terminal</span>
          </div>
          <div>
            <span className="font-bold block text-gray-500">DESTINATION:</span>
            <span>{destinationState} — {destStateRule.stateName}</span>
          </div>
          <div>
            <span className="font-bold block text-gray-500">COMMODITY:</span>
            <span>{commodityName}</span>
          </div>
          <div>
            <span className="font-bold block text-gray-500">NET CARGO WEIGHT:</span>
            <span className="font-bold text-black">{cargoWeightLbs.toLocaleString()} LBS</span>
          </div>
        </div>

        {/* Equipment & Bridge Dimensions */}
        <div className="grid grid-cols-4 gap-4 border border-gray-400 p-3 rounded text-xs bg-gray-50">
          <div>
            <span className="font-bold block text-gray-500">TRACTOR:</span>
            <span>{tractorSpec.unitNumber}</span>
          </div>
          <div>
            <span className="font-bold block text-gray-500">TRAILER:</span>
            <span>{trailerSpec.trailerNumber} ({trailerSpec.trailerLengthFeet}&apos;)</span>
          </div>
          <div>
            <span className="font-bold block text-gray-500">TANDEM PIN SETTING:</span>
            <span className="font-bold">HOLE {trailerSpec.selectedTandemHole} of 12</span>
          </div>
          <div>
            <span className="font-bold block text-gray-500">KPRA DISTANCE:</span>
            <span className="font-bold">{calcResult.kpraDistanceFeet}&apos; 0&quot; (Legal in {destinationState})</span>
          </div>
        </div>

        {/* Scaled Axle Weights Table */}
        <div>
          <h2 className="text-sm font-bold uppercase mb-2">
            CERTIFIED COMBINATION AXLE WEIGHT SUMMARY:
          </h2>
          <table className="w-full text-xs border border-collapse border-gray-400">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="border border-gray-400 p-2">AXLE GROUP</th>
                <th className="border border-gray-400 p-2">CALCULATED WEIGHT</th>
                <th className="border border-gray-400 p-2">FEDERAL STATUTORY CAP</th>
                <th className="border border-gray-400 p-2">COMPLIANCE MARGIN</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2 font-bold">Steer Axle (Single)</td>
                <td className="border border-gray-400 p-2">{calcResult.steerWeightLbs.toLocaleString()} lbs</td>
                <td className="border border-gray-400 p-2">12,000 lbs</td>
                <td className="border border-gray-400 p-2 font-bold text-green-700">LEGAL (-{Math.abs(calcResult.steerOverUnderLbs)} lbs)</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-bold">Drive Tandem Axle</td>
                <td className="border border-gray-400 p-2">{calcResult.driveTandemWeightLbs.toLocaleString()} lbs</td>
                <td className="border border-gray-400 p-2">34,000 lbs</td>
                <td className="border border-gray-400 p-2 font-bold text-green-700">LEGAL (-{Math.abs(calcResult.driveOverUnderLbs)} lbs)</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-bold">Trailer Tandem Axle</td>
                <td className="border border-gray-400 p-2">{calcResult.trailerTandemWeightLbs.toLocaleString()} lbs</td>
                <td className="border border-gray-400 p-2">34,000 lbs</td>
                <td className="border border-gray-400 p-2 font-bold text-green-700">LEGAL (-{Math.abs(calcResult.trailerOverUnderLbs)} lbs)</td>
              </tr>
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-400 p-2">GROSS COMBINATION WEIGHT</td>
                <td className="border border-gray-400 p-2">{calcResult.grossCombinationWeightLbs.toLocaleString()} lbs</td>
                <td className="border border-gray-400 p-2">80,000 lbs</td>
                <td className="border border-gray-400 p-2 font-black text-green-700">LEGAL (-{Math.abs(calcResult.grossOverUnderLbs)} lbs)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Loader Floor Layout Map */}
        <div>
          <h2 className="text-sm font-bold uppercase mb-2">
            53-FT FLOOR PLAN (26 STANDARD 48x40 PALLET SPACES):
          </h2>
          <div className="border border-gray-400 p-3 text-[11px] font-mono space-y-1">
            <div className="text-center font-bold bg-gray-200 py-1">▲ TRAILER FRONT / NOSE BULKHEAD ▲</div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="border border-gray-300 p-1 bg-gray-50">Slots 1-4: NOSE ZONE (Avg 1,650 lbs / pallet)</div>
              <div className="border border-gray-300 p-1 bg-gray-50">Slots 5-18: BELLY CORE (Avg 1,750 lbs / pallet)</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="border border-gray-300 p-1 bg-gray-50">Slots 19-24: OVER TANDEMS (Avg 1,700 lbs / pallet)</div>
              <div className="border border-gray-300 p-1 bg-gray-50">Slots 25-26: REAR TAIL (Avg 1,600 lbs / pallet)</div>
            </div>
            <div className="text-center font-bold bg-gray-200 py-1">▼ REAR DOORS (2 LOAD LOCKS REQUIRED) ▼</div>
          </div>
        </div>

        {/* Signatures */}
        <div className="border-t-2 border-black pt-4 grid grid-cols-2 gap-8 text-xs">
          <div>
            <p className="font-bold">WAREHOUSE FORKLIFT / LOADER SIGN-OFF:</p>
            <p className="mt-1 text-gray-700">I certify cargo was loaded pursuant to the distribution plan above.</p>
            <div className="mt-6 border-b border-black w-48"></div>
            <p className="mt-1 font-mono">Sign: {loaderName}</p>
            <p className="font-mono">Door: {dockDoorNumber} • Seal: {sealNumber}</p>
          </div>
          <div>
            <p className="font-bold">COMMERCIAL DRIVER ACKNOWLEDGEMENT:</p>
            <p className="mt-1 text-gray-700">I have verified tandem pin setting and scaled within legal bounds.</p>
            <div className="mt-6 border-b border-black w-48"></div>
            <p className="mt-1 font-mono">Sign: Driver (Titan Carrier)</p>
            <p className="font-mono">Scale Ticket: {scaleTicketNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
