import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Zap,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Scale,
  Compass,
  DollarSign,
  TrendingUp,
  Truck,
  RotateCcw,
  Play,
  Pause,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Flame,
  Camera,
  Layers,
  ArrowRight,
  Eye,
  Maximize2,
  RefreshCw,
  Send,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import {
  INITIAL_WHEEL_END_SENSORS,
  INITIAL_PRE_SCALE_SCENARIO,
  INITIAL_IFTA_STATE_RATES,
  INITIAL_IFTA_ROUTE_PLAN,
  INITIAL_DOCKING_STATE,
  INITIAL_BROKER_SCENARIOS,
  WheelEndAcousticSensor,
  PreScaleInspectionPoint,
  DockingTrajectoryState,
  BrokerNegotiationScenario,
} from '../services/nextGenInnovationsService';
import { triggerHapticFeedback } from '../services/haptics';

interface NextGenInnovationsMasterDeckProps {
  onNavigateToTab?: (tab: string) => void;
  defaultSubTab?: 'ACOUSTO_KINETIC' | 'PRE_SCALE_SIM' | 'IFTA_ARBITRAGE' | 'AR_DOCKING' | 'BROKER_NEGOTIATOR';
}

export const NextGenInnovationsMasterDeck: React.FC<NextGenInnovationsMasterDeckProps> = ({
  onNavigateToTab,
  defaultSubTab = 'ACOUSTO_KINETIC',
}) => {
  const [activeEngine, setActiveEngine] = useState<
    'ACOUSTO_KINETIC' | 'PRE_SCALE_SIM' | 'IFTA_ARBITRAGE' | 'AR_DOCKING' | 'BROKER_NEGOTIATOR'
  >(defaultSubTab);

  // Engine 1: Acousto-Kinetic
  const [wheelSensors, setWheelSensors] = useState<WheelEndAcousticSensor[]>(INITIAL_WHEEL_END_SENSORS);
  const [selectedWheel, setSelectedWheel] = useState<WheelEndAcousticSensor>(wheelSensors[6]); // Dragging brake shoe
  const [isMicrophoneListening, setIsMicrophoneListening] = useState<boolean>(false);
  const [audioFreqData, setAudioFreqData] = useState<number[]>([25, 48, 72, 88, 64, 42, 35, 18, 12, 6]);

  // Engine 2: Pre-Scale Simulator
  const [scaleScenario, setScaleScenario] = useState<PreScaleInspectionPoint>(INITIAL_PRE_SCALE_SCENARIO);
  const [isPreScaleScanning, setIsPreScaleScanning] = useState<boolean>(false);

  // Engine 3: IFTA Arbitrage
  const [gallonsAtIllinois, setGallonsAtIllinois] = useState<number>(80);
  const [gallonsAtOhio, setGallonsAtOhio] = useState<number>(65);

  // Engine 4: AR Docking Assistant
  const [dockingState, setDockingState] = useState<DockingTrajectoryState>(INITIAL_DOCKING_STATE);
  const [isCameraSimulated, setIsCameraSimulated] = useState<boolean>(true);

  // Engine 5: Broker Negotiator
  const [brokerScenarios, setBrokerScenarios] = useState<BrokerNegotiationScenario[]>(INITIAL_BROKER_SCENARIOS);
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState<number>(0);
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);

  // Audio frequency simulation ticker
  useEffect(() => {
    let interval: any = null;
    if (isMicrophoneListening || activeEngine === 'ACOUSTO_KINETIC') {
      interval = setInterval(() => {
        setAudioFreqData([
          Math.floor(Math.random() * 40) + 10,
          Math.floor(Math.random() * 60) + 20,
          Math.floor(Math.random() * 80) + 30,
          Math.floor(Math.random() * 95) + 40,
          Math.floor(Math.random() * 70) + 25,
          Math.floor(Math.random() * 50) + 15,
          Math.floor(Math.random() * 30) + 10,
          Math.floor(Math.random() * 20) + 5,
        ]);
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isMicrophoneListening, activeEngine]);

  const currentScenario = brokerScenarios[selectedScenarioIdx] || brokerScenarios[0];

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(currentScenario.autoDraftMessage);
    setCopiedDraft(true);
    triggerHapticFeedback('success');
    setTimeout(() => setCopiedDraft(false), 3000);
  };

  return (
    <div className="flex flex-col w-full pb-16 px-3 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto font-sans text-white">
      {/* Top Banner */}
      <div className="border-b border-[#222] pb-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                PROPRIETARY FLEET MECHANICS &amp; HARDWARE SUITE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-700/60 uppercase">
                5 BREAKTHROUGH ENGINES ONLINE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5 font-[Oswald]">
              Next-Gen Proprietary Technologies
            </h1>
            <p className="text-xs sm:text-sm text-[#888] max-w-3xl mt-1">
              High-frequency CAN-bus acoustics, pre-scale DOT bypass simulation, net IFTA tax arbitrage, AR backing guidance, and autonomous spot-rate broker negotiation.
            </p>
          </div>
        </div>
      </div>

      {/* 5-Engine Navigation Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 font-mono text-xs">
        <button
          type="button"
          onClick={() => {
            triggerHapticFeedback('subtle');
            setActiveEngine('ACOUSTO_KINETIC');
          }}
          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
            activeEngine === 'ACOUSTO_KINETIC'
              ? 'bg-[#182335] border-[#D4AF37] text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.25)]'
              : 'bg-[#0E141E] hover:bg-[#141C2B] border-[#1E2B3E] text-[#7E90A6]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Radio className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800">
              500-Mi Warning
            </span>
          </div>
          <div className="font-bold text-white text-[11px] leading-tight">1. Acousto-Kinetic Bearing Predictor</div>
          <div className="text-[9px] text-[#7E90A6] mt-1">J1939 ABS Jitter &amp; Micro-Spall</div>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHapticFeedback('subtle');
            setActiveEngine('PRE_SCALE_SIM');
          }}
          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
            activeEngine === 'PRE_SCALE_SIM'
              ? 'bg-[#182335] border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.25)]'
              : 'bg-[#0E141E] hover:bg-[#141C2B] border-[#1E2B3E] text-[#7E90A6]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Scale className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              94% Bypass
            </span>
          </div>
          <div className="font-bold text-white text-[11px] leading-tight">2. Pre-Scale DOT Level-1 Simulator</div>
          <div className="text-[9px] text-[#7E90A6] mt-1">ISS Score &amp; Thermal Rotor</div>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHapticFeedback('subtle');
            setActiveEngine('IFTA_ARBITRAGE');
          }}
          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
            activeEngine === 'IFTA_ARBITRAGE'
              ? 'bg-[#182335] border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
              : 'bg-[#0E141E] hover:bg-[#141C2B] border-[#1E2B3E] text-[#7E90A6]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <DollarSign className="w-4 h-4 text-cyan-400" />
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              +$82 Saved
            </span>
          </div>
          <div className="font-bold text-white text-[11px] leading-tight">3. IFTA Fuel Tax Arbitrage</div>
          <div className="text-[9px] text-[#7E90A6] mt-1">Net-After-Tax Fuel Optimizer</div>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHapticFeedback('subtle');
            setActiveEngine('AR_DOCKING');
          }}
          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
            activeEngine === 'AR_DOCKING'
              ? 'bg-[#182335] border-purple-400 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
              : 'bg-[#0E141E] hover:bg-[#141C2B] border-[#1E2B3E] text-[#7E90A6]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Camera className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
              53ft Pivot
            </span>
          </div>
          <div className="font-bold text-white text-[11px] leading-tight">4. AR Backing &amp; Dock Assistant</div>
          <div className="text-[9px] text-[#7E90A6] mt-1">Trailer Tail-Swing &amp; Pivot HUD</div>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHapticFeedback('subtle');
            setActiveEngine('BROKER_NEGOTIATOR');
          }}
          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
            activeEngine === 'BROKER_NEGOTIATOR'
              ? 'bg-[#182335] border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
              : 'bg-[#0E141E] hover:bg-[#141C2B] border-[#1E2B3E] text-[#7E90A6]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
              +$500/Load
            </span>
          </div>
          <div className="font-bold text-white text-[11px] leading-tight">5. Broker Spot-Rate Maximizer</div>
          <div className="text-[9px] text-[#7E90A6] mt-1">Autonomous DAT &amp; Lane Counter</div>
        </button>
      </div>

      {/* ================= ENGINE 1: ACOUSTO-KINETIC BEARING FORECASTER ================= */}
      {activeEngine === 'ACOUSTO_KINETIC' && (
        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-[#1E1114] via-[#16101B] to-[#0E121B] border border-red-500/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-700/60 rounded text-[10px] font-mono font-bold uppercase">
                  Sub-Millisecond J1939 CAN-Bus Micro-Jitter
                </span>
                <span className="text-xs text-[#8EA2B8]">Predicts Catastrophic Bearing &amp; Wheel Fires</span>
              </div>
              <h3 className="text-lg font-bold text-white font-[Oswald]">
                Acousto-Kinetic Wheel-End &amp; Hub Bearing Failure Forecaster
              </h3>
              <p className="text-xs text-[#8EA2B8] max-w-3xl font-mono">
                Analyzes acoustic harmonic frequencies (10–30 kHz) and ABS tone-ring micro-jitter to detect outer race spalling and dry bearing friction 500+ miles before highway fires or wheel-off incidents.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 font-mono">
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback('subtle');
                  setIsMicrophoneListening(!isMicrophoneListening);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-2 ${
                  isMicrophoneListening
                    ? 'bg-red-600 text-white border-red-400 animate-pulse'
                    : 'bg-[#182335] text-cyan-300 border-cyan-600/50'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>{isMicrophoneListening ? 'LIVE ACOUSTIC SCANNING...' : 'START IN-CAB MIC ACOUSTIC RADAR'}</span>
              </button>
            </div>
          </div>

          {/* Real-Time Acoustic Spectrogram Visualizer */}
          <div className="bg-[#101724] border border-[#1E2E44] rounded-xl p-4 sm:p-5 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs border-b border-[#1E2E44] pb-2">
              <span className="font-bold text-cyan-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>REAL-TIME CAN-BUS ABS PULSE JITTER &amp; ACOUSTIC FFT SPECTRUM (10kHz - 30kHz)</span>
              </span>
              <span className="text-emerald-400 font-bold">50Hz J1939 STREAM LOCKED</span>
            </div>

            <div className="grid grid-cols-8 gap-2 h-20 items-end bg-[#090D15] p-3 rounded-lg border border-[#162132]">
              {audioFreqData.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${
                      val > 70 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : val > 45 ? 'bg-amber-400' : 'bg-cyan-500'
                    }`}
                    style={{ height: `${val}%` }}
                  />
                  <span className="text-[8px] text-[#556980]">{idx * 4 + 2}k</span>
                </div>
              ))}
            </div>
          </div>

          {/* 8-Wheel Position Heatmap Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            {wheelSensors.map((w) => {
              const isSelected = selectedWheel.wheelPosition === w.wheelPosition;
              const isCritical = w.status === 'CRITICAL_REPAIR_REQUIRED';
              const isWatch = w.status === 'WATCH_MONITOR';

              return (
                <button
                  key={w.wheelPosition}
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback('subtle');
                    setSelectedWheel(w);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#D4AF37] bg-[#182436] shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                      : isCritical
                      ? 'border-red-500/70 bg-red-950/40'
                      : isWatch
                      ? 'border-amber-500/60 bg-amber-950/30'
                      : 'border-[#1E2B3E] bg-[#0E141E] hover:bg-[#141C2B]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white text-xs">{w.positionLabel}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      isCritical ? 'bg-red-900 text-red-100 animate-pulse' : isWatch ? 'bg-amber-900 text-amber-200' : 'bg-emerald-950 text-emerald-300'
                    }`}>
                      {w.bearingHealthScore}% HEALTH
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-[#CBD5E1]">
                    <div className="flex justify-between">
                      <span className="text-[#7E90A6]">Hub Temp:</span>
                      <span className={`font-bold ${w.temperatureF > 160 ? 'text-red-400' : 'text-white'}`}>{w.temperatureF}°F</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7E90A6]">Jitter:</span>
                      <span className="text-cyan-300 font-bold">{w.j1939AbsPulseJitterMicrosec} µs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7E90A6]">Defect:</span>
                      <span className={`font-bold text-[10px] ${isCritical ? 'text-red-400' : isWatch ? 'text-amber-300' : 'text-emerald-400'}`}>
                        {w.defectType.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-[#8EA2B8] flex justify-between items-center">
                    <span>Est. Runway:</span>
                    <span className="font-bold text-white">{w.estimatedMilesToFailure.toLocaleString()} mi</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= ENGINE 2: PRE-SCALE VIRTUAL DOT LEVEL-1 SIMULATOR ================= */}
      {activeEngine === 'PRE_SCALE_SIM' && (
        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-[#0C1E16] via-[#10241A] to-[#0E1820] border border-emerald-500/50 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded text-[10px] font-bold uppercase">
                  Scale House in {scaleScenario.distanceMiles} Miles
                </span>
                <span className="text-xs text-[#8EA2B8]">{scaleScenario.stationName}</span>
              </div>
              <h3 className="text-lg font-bold text-white font-[Oswald]">
                Pre-Scale Virtual Level-1 Inspection Simulator &amp; Bypass Radar
              </h3>
              <p className="text-xs text-[#8EA2B8] max-w-3xl">
                Pre-computes state weigh station WIM gross weight, thermal rotor scans, ELD log completeness, and FMCSA ISS safety scores before passing the ramp sensors.
              </p>
            </div>

            <div className="text-right shrink-0 bg-[#07130E] p-3 rounded-xl border border-emerald-500/50">
              <div className="text-[10px] text-[#8EA2B8] uppercase">Predicted Bypass Probability</div>
              <div className="text-3xl font-black text-emerald-400">{scaleScenario.predictedBypassProbabilityPct}%</div>
              <div className="text-[10px] text-emerald-300 font-bold">GREEN LIGHT CLEARANCE</div>
            </div>
          </div>

          {/* 37-Point Pre-Scale Inspection Checklist */}
          <div className="bg-[#101724] border border-[#1E2E44] rounded-xl p-4 sm:p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#1E2E44] pb-2">
              <span className="font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>REAL-TIME 37-POINT PRE-SCALE SENSOR DIAGNOSTICS</span>
              </span>
              <span className="text-[#8EA2B8]">Carrier ISS-D Score: <strong className="text-emerald-400">{scaleScenario.historicalCarrierIssScore} (Pass)</strong></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scaleScenario.checklistItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${
                    item.status === 'CLEARED'
                      ? 'bg-[#0E1520] border-[#1E2E44] text-white'
                      : 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      {item.status === 'CLEARED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                      )}
                      <span>{item.system}</span>
                    </div>
                    <div className="text-[11px] text-[#A0AEC0]">{item.reading}</div>
                    {item.remediationAction && (
                      <div className="text-[10px] text-amber-300 font-bold">
                        → Action: {item.remediationAction}
                      </div>
                    )}
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'CLEARED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-900 text-amber-200'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= ENGINE 3: IFTA FUEL TAX ARBITRAGE OPTIMIZER ================= */}
      {activeEngine === 'IFTA_ARBITRAGE' && (
        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-[#0C1E26] via-[#102430] to-[#0D1824] border border-cyan-500/50 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700/60 rounded text-[10px] font-bold uppercase">
                  Net-After-Tax Fuel Cost Optimizer
                </span>
                <span className="text-xs text-[#8EA2B8]">Route: Chicago, IL → Harrisburg, PA (685 mi)</span>
              </div>
              <h3 className="text-lg font-bold text-white font-[Oswald]">
                Dynamic IFTA Fuel Tax Arbitrage &amp; Elevation Engine
              </h3>
              <p className="text-xs text-[#8EA2B8] max-w-3xl">
                Calculates pump price minus state IFTA tax refund credits to reveal the true base cost of fuel, preventing carriers from overpaying based on pump sticker illusions.
              </p>
            </div>

            <div className="text-right shrink-0 bg-[#07151D] p-3 rounded-xl border border-cyan-500/50">
              <div className="text-[10px] text-[#8EA2B8] uppercase">Net Trip Fuel Savings</div>
              <div className="text-3xl font-black text-cyan-300">+${INITIAL_IFTA_ROUTE_PLAN.netTripSavings.toFixed(2)}</div>
              <div className="text-[10px] text-cyan-400 font-bold">OPTIMIZED VS UNPLANNED STOPS</div>
            </div>
          </div>

          {/* State Comparison Table */}
          <div className="bg-[#101724] border border-[#1E2E44] rounded-xl overflow-hidden font-mono text-xs">
            <div className="p-3.5 bg-[#141C2B] border-b border-[#1E2E44] flex items-center justify-between">
              <span className="font-bold text-white">4-STATE IFTA TAX REFUND &amp; BASE PRICE MATRIX</span>
              <span className="text-[10px] text-cyan-300">Updated Hourly</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0C121D] text-[#7E90A6] uppercase text-[10px] border-b border-[#1E2E44]">
                  <tr>
                    <th className="p-3">State</th>
                    <th className="p-3">Pump Price / Gal</th>
                    <th className="p-3">State IFTA Tax Credit</th>
                    <th className="p-3">Carrier Bulk Discount</th>
                    <th className="p-3">True Net Fuel Price</th>
                    <th className="p-3 text-right">Arbitrage Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2536] text-[#CBD5E1]">
                  {INITIAL_IFTA_STATE_RATES.map((st) => (
                    <tr key={st.state} className="hover:bg-[#152030] transition-colors">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#182436] border border-[#2A3D58]">{st.state}</span>
                      </td>
                      <td className="p-3 text-white font-bold">${st.pumpPricePerGallon.toFixed(2)}</td>
                      <td className="p-3 text-emerald-400 font-bold">+${st.stateIftaTaxRate.toFixed(3)}/gal</td>
                      <td className="p-3 text-cyan-300">-${st.carrierDiscountPerGal.toFixed(2)}/gal</td>
                      <td className="p-3 text-emerald-300 font-black text-sm">${st.effectiveNetPrice.toFixed(3)}</td>
                      <td className="p-3 text-right">
                        {st.state === 'IL' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold text-[10px]">
                            MAX PURCHASE (HIGH IFTA CREDIT)
                          </span>
                        ) : st.state === 'PA' ? (
                          <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-700 font-bold text-[10px]">
                            MIN FUEL (HIGH BASE PUMP)
                          </span>
                        ) : (
                          <span className="text-[#7E90A6]">Standard Stop</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= ENGINE 4: AR DOCKING & TRAILER PIVOT ASSISTANT ================= */}
      {activeEngine === 'AR_DOCKING' && (
        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-[#201026] via-[#1A0D22] to-[#120A1A] border border-purple-500/50 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-700/60 rounded text-[10px] font-bold uppercase">
                  53-Foot Trailer Trajectory &amp; Tail-Swing Arc
                </span>
                <span className="text-xs text-[#8EA2B8]">Target: {dockingState.targetBayNumber}</span>
              </div>
              <h3 className="text-lg font-bold text-white font-[Oswald]">
                In-Cab AR Blind-Spot &amp; Tight-Dock Backing Trajectory Assistant
              </h3>
              <p className="text-xs text-[#8EA2B8] max-w-3xl">
                Projects real-time pivot geometry, blind-side tail-swing clearance, and jackknife risk angles onto live camera feeds to eliminate warehouse dock backing collisions.
              </p>
            </div>

            <div className="text-right shrink-0 bg-[#14081E] p-3 rounded-xl border border-purple-500/50">
              <div className="text-[10px] text-[#8EA2B8] uppercase">Distance to Dock Bumper</div>
              <div className="text-3xl font-black text-purple-300">{dockingState.distanceToBumperFt} FT</div>
              <div className="text-[10px] text-emerald-400 font-bold">ALIGNED WITH BAY 14</div>
            </div>
          </div>

          {/* AR Camera HUD Simulation Box */}
          <div className="relative bg-[#080B12] border-2 border-purple-500/60 rounded-2xl p-6 h-80 flex flex-col justify-between overflow-hidden shadow-2xl font-mono">
            {/* Camera Grid Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

            {/* Target Dock Bay Markers */}
            <div className="absolute inset-x-1/4 top-10 border-2 border-dashed border-emerald-400/80 h-40 rounded-lg flex items-center justify-center pointer-events-none">
              <div className="text-emerald-400 text-xs font-bold bg-black/80 px-3 py-1 rounded border border-emerald-500">
                TARGET: DOCK BAY 14 (RUBBER BUMPERS)
              </div>
            </div>

            {/* Dynamic Trailer Pivot Arc */}
            <div className="absolute bottom-6 inset-x-1/3 border-b-4 border-l-4 border-r-4 border-[#D4AF37] h-32 rounded-b-3xl opacity-80 pointer-events-none flex items-end justify-center pb-2">
              <span className="text-[10px] text-[#D4AF37] font-bold bg-black/80 px-2 py-0.5 rounded">
                TRAILER 53FT PIVOT ARC: -22° (STEER: CHASE RIGHT)
              </span>
            </div>

            {/* Top HUD Telemetry */}
            <div className="relative flex items-center justify-between text-xs z-10">
              <div className="flex items-center gap-2 bg-black/80 px-3 py-1.5 rounded-lg border border-purple-500/40">
                <Camera className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="font-bold">AR CAMERA HUD ACTIVE · 60 FPS</span>
              </div>
              <div className="bg-black/80 px-3 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-300 font-bold">
                JACKKNIFE ANGLE: 22° (SAFE LIMIT: 65°)
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="relative flex items-center justify-between z-10 pt-4">
              <div className="text-xs text-[#CBD5E1] bg-black/80 px-3 py-1.5 rounded-lg border border-[#2A3B52]">
                Tail-Swing Clearance: <strong className="text-white">38 Inches</strong> · Blind-Side: <strong className="text-white">8.4 Ft</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback('subtle');
                    setDockingState((prev) => ({
                      ...prev,
                      distanceToBumperFt: Math.max(1.2, +(prev.distanceToBumperFt - 2.5).toFixed(1)),
                    }));
                  }}
                  className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  Back Up -2.5 ft
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback('subtle');
                    setDockingState(INITIAL_DOCKING_STATE);
                  }}
                  className="px-3 py-1.5 rounded bg-[#1C2638] text-[#8EA2B8] text-xs font-bold"
                >
                  Reset Dock Pos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ENGINE 5: AUTONOMOUS BROKER RATE NEGOTIATOR ================= */}
      {activeEngine === 'BROKER_NEGOTIATOR' && (
        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-[#261E0C] via-[#1E170A] to-[#141008] border border-amber-500/50 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-700/60 rounded text-[10px] font-bold uppercase">
                  Direct Spot Rate Intelligence
                </span>
                <span className="text-xs text-[#8EA2B8]">Lane: {currentScenario.lane}</span>
              </div>
              <h3 className="text-lg font-bold text-white font-[Oswald]">
                Autonomous Broker Spot-Rate Negotiation &amp; Profit Maximizer
              </h3>
              <p className="text-xs text-[#8EA2B8] max-w-3xl">
                Analyzes live DAT spot averages, deadhead penalty, operating costs, and market capacity tightening to auto-draft the highest-converting profit counter-offers.
              </p>
            </div>

            <div className="text-right shrink-0 bg-[#161005] p-3 rounded-xl border border-amber-500/50">
              <div className="text-[10px] text-[#8EA2B8] uppercase">Target Counter Rate</div>
              <div className="text-3xl font-black text-amber-300">${currentScenario.targetCounterOffer}</div>
              <div className="text-[10px] text-emerald-400 font-bold">+${currentScenario.targetCounterOffer - currentScenario.brokerInitialOffer} Above Broker Offer (${currentScenario.targetRatePerMile}/mi)</div>
            </div>
          </div>

          {/* Rate Breakdown and Negotiation Script */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 font-mono text-xs">
            {/* Left: Financial Breakdown */}
            <div className="bg-[#121824] border border-[#212E42] rounded-xl p-4 sm:p-5 space-y-3">
              <div className="font-bold text-white text-xs uppercase border-b border-[#212E42] pb-2 flex items-center justify-between">
                <span>Trip Financial Ledger</span>
                <span className="text-amber-400">{currentScenario.mileage} Miles</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-[#0C121D] rounded border border-[#1A2536]">
                  <span className="text-[#8EA2B8]">Broker Initial Offer:</span>
                  <span className="text-red-400 font-bold">${currentScenario.brokerInitialOffer} (${currentScenario.initialRatePerMile}/mi)</span>
                </div>
                <div className="flex justify-between p-2 bg-[#0C121D] rounded border border-[#1A2536]">
                  <span className="text-[#8EA2B8]">DAT National Spot Avg:</span>
                  <span className="text-cyan-300 font-bold">${currentScenario.datSpotRateAvg}</span>
                </div>
                <div className="flex justify-between p-2 bg-[#0C121D] rounded border border-[#1A2536]">
                  <span className="text-[#8EA2B8]">Trip Operating Cost:</span>
                  <span className="text-white font-bold">${currentScenario.estimatedTripOperatingCost}</span>
                </div>
                <div className="flex justify-between p-2 bg-emerald-950/60 rounded border border-emerald-600/60">
                  <span className="text-emerald-300 font-bold">Expected Net Profit:</span>
                  <span className="text-emerald-400 font-black text-sm">+${currentScenario.expectedNetCarrierProfit}</span>
                </div>
              </div>
            </div>

            {/* Right: Negotiation Leverage & Auto-Draft Message */}
            <div className="lg:col-span-2 bg-[#121824] border border-[#212E42] rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#212E42] pb-2">
                <span className="font-bold text-white text-xs uppercase">Market Leverage Points</span>
                <span className="text-[10px] text-amber-400 font-bold">1-Click Dispatch Script</span>
              </div>

              <ul className="space-y-1.5 text-[11px] text-[#CBD5E1]">
                {currentScenario.negotiationPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-[#8EA2B8] uppercase block">
                  Auto-Generated Broker Counter Message:
                </label>
                <div className="p-3 bg-[#0A0E17] rounded-xl border border-[#25354E] text-xs font-sans text-white leading-relaxed">
                  {currentScenario.autoDraftMessage}
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyDraft}
                    className="px-4 py-2 bg-[#1C273B] hover:bg-[#25354F] text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    <span>{copiedDraft ? 'COPIED TO CLIPBOARD!' : 'COPY COUNTER OFFER'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
