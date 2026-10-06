import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  Compass,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Gauge,
  Flame,
  Wind,
  Truck,
  Layers,
  Activity,
  ArrowRight,
  Sparkles,
  Sliders,
  DollarSign,
  Maximize2,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Navigation,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  V2xSpatialSector,
  IftaFuelArbitrageStation,
  AcousticDiagnosticComponent,
  TabType,
} from '../types';
import {
  INITIAL_V2X_SECTORS,
  INITIAL_IFTA_STATIONS,
  INITIAL_ACOUSTIC_COMPONENTS,
  calculateKineticBrakePhysics,
  calculateCrosswindRollover,
} from '../services/apexAvionicsService';
import { triggerHapticFeedback } from '../services/haptics';

interface ApexAvionicsViewProps {
  onNavigateToTab?: (tab: TabType) => void;
}

export const ApexAvionicsView: React.FC<ApexAvionicsViewProps> = ({
  onNavigateToTab,
}) => {
  const [activeModule, setActiveModule] = useState<'RADAR' | 'BRAKE_PHYSICS' | 'IFTA_ARBITRAGE' | 'ACOUSTIC_ML' | 'CROSSWIND'>('RADAR');
  const [isNightVisionHud, setIsNightVisionHud] = useState<boolean>(false);
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState<boolean>(true);

  // V2X Radar Simulation Controls
  const [rigSpeedMph, setRigSpeedMph] = useState<number>(64);
  const [trafficDensity, setTrafficDensity] = useState<'LOW' | 'MEDIUM' | 'HEAVY'>('MEDIUM');
  const [roadSurface, setRoadSurface] = useState<'DRY' | 'WET' | 'SNOW_ICE'>('DRY');
  const [activeHazardAlert, setActiveHazardAlert] = useState<string | null>(null);

  // Mountain Grade & Kinetic Brake Simulation Controls
  const [grossWeightLbs, setGrossWeightLbs] = useState<number>(78500); // 78,500 lbs
  const [descentGradePercent, setDescentGradePercent] = useState<number>(5.5); // 5.5% grade
  const [continuousDescentMiles, setContinuousDescentMiles] = useState<number>(3.8); // 3.8 miles down

  // Crosswind Controls
  const [ambientWindMph, setAmbientWindMph] = useState<number>(34);
  const [windAngleDegrees, setWindAngleDegrees] = useState<number>(75); // 75 deg crosswind

  // Live Kinetic Physics Computation
  const brakePhysics = useMemo(() => {
    return calculateKineticBrakePhysics(
      grossWeightLbs,
      rigSpeedMph,
      descentGradePercent,
      roadSurface,
      continuousDescentMiles
    );
  }, [grossWeightLbs, rigSpeedMph, descentGradePercent, roadSurface, continuousDescentMiles]);

  // Live Crosswind Rollover Computation
  const crosswindPhysics = useMemo(() => {
    return calculateCrosswindRollover(grossWeightLbs, ambientWindMph, windAngleDegrees, rigSpeedMph);
  }, [grossWeightLbs, ambientWindMph, windAngleDegrees, rigSpeedMph]);

  // Simulate Live Radar Telemetry Ping
  const [radarPing, setRadarPing] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setRadarPing((prev) => (prev + 1) % 100);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const triggerHazardSimulation = (hazardType: 'CUT_IN' | 'BLINDSPOT' | 'LOW_OVERPASS') => {
    triggerHapticFeedback('alert');
    if (hazardType === 'CUT_IN') {
      setActiveHazardAlert('CRITICAL: Sudden passenger vehicle lane cut-in detected at 85 feet! Automatic emergency air-brake pre-charge armed.');
    } else if (hazardType === 'BLINDSPOT') {
      setActiveHazardAlert('WARNING: Motorcycle entering trailer tandem right blindspot zone (No-Zone). Right turn signal interlock active.');
    } else {
      setActiveHazardAlert('OVERHEAD ADVISORY: 14\'1" railroad overpass 800ft ahead. Rig height 13\'6". Minimum vertical clearance verified (+7 inches).');
    }
    setTimeout(() => setActiveHazardAlert(null), 7000);
  };

  // Color theming for Night-Vision HUD vs Default Cockpit
  const themeClasses = isNightVisionHud
    ? 'bg-[#060805] text-[#33FF33] border-[#22AA22]/40 font-mono'
    : 'bg-[#0B0B0E] text-slate-100 border-[#222226] font-sans';

  return (
    <div className={`flex flex-col w-full pb-20 px-3 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto transition-colors duration-300 ${themeClasses}`}>
      
      {/* ==================================================================== */}
      {/* TOP HEADER: APEX V2X AVIONICS PLATFORM ARCHITECTURE                  */}
      {/* ==================================================================== */}
      <div className="border-b border-[#222] pb-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap text-xs">
              <span className="font-mono font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#D4AF37]" />
                APEX V2X SPATIAL AVIONICS MATRIX
              </span>
              <span className="text-[#666]">·</span>
              <span className="font-mono font-semibold text-emerald-400 uppercase">
                77GHZ RADAR &amp; LIDAR MESH
              </span>
              <span className="text-[#666]">·</span>
              <span className="font-mono text-sky-400 uppercase">
                IFTA DIESEL ARBITRAGE
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-3">
              <Compass className="w-7 h-7 text-[#D4AF37]" />
              Apex V2X Highway Telematics &amp; Spatial Matrix
            </h1>
            <p className="text-xs sm:text-sm text-[#888] mt-1 max-w-3xl">
              Next-generation commercial fleet avionics uniting 360° V2X spatial radar, 49 CFR kinetic mountain brake dissipation physics, real-time interstate IFTA net-tax diesel arbitrage, and acoustic predictive powertrain telematics.
            </p>
          </div>

          {/* Quick HUD Toggles & Audio Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                triggerHapticFeedback('tick');
                setIsNightVisionHud(!isNightVisionHud);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 border ${
                isNightVisionHud
                  ? 'bg-[#33FF33] text-black border-[#33FF33] font-black'
                  : 'bg-[#161616] text-[#aaa] border-[#333] hover:text-white'
              }`}
              title="Toggle low-fatigue monochromatic night vision HUD for nighttime driving"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isNightVisionHud ? 'Night HUD Active' : 'Night HUD'}</span>
            </button>

            <button
              onClick={() => setAudioAlertsEnabled(!audioAlertsEnabled)}
              className="p-2 rounded-lg bg-[#161616] text-[#aaa] hover:text-white border border-[#333] transition"
              title={audioAlertsEnabled ? 'Audio Chimes Active' : 'Audio Muted'}
            >
              {audioAlertsEnabled ? <Volume2 className="w-4 h-4 text-[#D4AF37]" /> : <VolumeX className="w-4 h-4 text-[#666]" />}
            </button>
          </div>
        </div>

        {/* Hazard Alert Banner */}
        {activeHazardAlert && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs font-mono flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="font-bold">{activeHazardAlert}</span>
            </div>
            <button
              onClick={() => setActiveHazardAlert(null)}
              className="text-xs text-rose-400 hover:text-white font-bold uppercase px-2 py-0.5 rounded border border-rose-800"
            >
              Acknowledge
            </button>
          </div>
        )}

        {/* Module Sub-Navigation Bar */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              triggerHapticFeedback('tick');
              setActiveModule('RADAR');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase transition shrink-0 flex items-center gap-1.5 ${
              activeModule === 'RADAR'
                ? isNightVisionHud ? 'bg-[#33FF33] text-black font-black' : 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-black'
                : 'bg-[#141416] text-[#888] border border-[#262628] hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            360° V2X Spatial Radar
          </button>

          <button
            onClick={() => {
              triggerHapticFeedback('tick');
              setActiveModule('BRAKE_PHYSICS');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase transition shrink-0 flex items-center gap-1.5 ${
              activeModule === 'BRAKE_PHYSICS'
                ? isNightVisionHud ? 'bg-[#33FF33] text-black font-black' : 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-black'
                : 'bg-[#141416] text-[#888] border border-[#262628] hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            Kinetic Mountain Grade Physics
          </button>

          <button
            onClick={() => {
              triggerHapticFeedback('tick');
              setActiveModule('IFTA_ARBITRAGE');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase transition shrink-0 flex items-center gap-1.5 ${
              activeModule === 'IFTA_ARBITRAGE'
                ? isNightVisionHud ? 'bg-[#33FF33] text-black font-black' : 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-black'
                : 'bg-[#141416] text-[#888] border border-[#262628] hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            IFTA Diesel Arbitrage Radar
          </button>

          <button
            onClick={() => {
              triggerHapticFeedback('tick');
              setActiveModule('ACOUSTIC_ML');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase transition shrink-0 flex items-center gap-1.5 ${
              activeModule === 'ACOUSTIC_ML'
                ? isNightVisionHud ? 'bg-[#33FF33] text-black font-black' : 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-black'
                : 'bg-[#141416] text-[#888] border border-[#262628] hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Acoustic &amp; Vibration Diagnostics
          </button>

          <button
            onClick={() => {
              triggerHapticFeedback('tick');
              setActiveModule('CROSSWIND');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase transition shrink-0 flex items-center gap-1.5 ${
              activeModule === 'CROSSWIND'
                ? isNightVisionHud ? 'bg-[#33FF33] text-black font-black' : 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-black'
                : 'bg-[#141416] text-[#888] border border-[#262628] hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            Crosswind Rollover Index
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODULE 1: 360° V2X SPATIAL RADAR & BLINDSPOT SENSOR ENVELOPE         */}
      {/* ==================================================================== */}
      {activeModule === 'RADAR' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Visual Radar Display (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-xl bg-[#121215] border border-[#26262b] relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#222] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-mono uppercase font-bold tracking-wider">
                    Live 360° Highway Radar Scope (77 GHz V2X)
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#888]">
                  Ping #{radarPing} · Latency: 8.4ms · Range: 1,500 ft
                </div>
              </div>

              {/* Graphic Radar Canvas View */}
              <div className="relative w-full h-[420px] bg-gradient-to-b from-[#09090c] via-[#050508] to-[#020204] rounded-lg border border-[#222] flex items-center justify-center overflow-hidden">
                {/* Radar Grid Circles */}
                <div className="absolute w-[360px] h-[360px] rounded-full border border-sky-500/10 pointer-events-none" />
                <div className="absolute w-[240px] h-[240px] rounded-full border border-sky-500/15 pointer-events-none" />
                <div className="absolute w-[120px] h-[120px] rounded-full border border-sky-500/20 pointer-events-none" />

                {/* Radar Distance Markers */}
                <span className="absolute top-3 text-[9px] font-mono text-sky-400/50">FORWARD 600 FT</span>
                <span className="absolute bottom-3 text-[9px] font-mono text-sky-400/50">REAR 300 FT</span>
                <span className="absolute left-3 text-[9px] font-mono text-sky-400/50">LEFT 150 FT</span>
                <span className="absolute right-3 text-[9px] font-mono text-sky-400/50">RIGHT 150 FT</span>

                {/* Animated Sweep Line */}
                <div
                  className="absolute inset-0 rounded-full border-t border-sky-400/30 animate-spin"
                  style={{ animationDuration: '4s' }}
                />

                {/* CENTER: THE 70-FOOT COMMERCIAL COMBINATION RIG */}
                <div className="z-10 flex flex-col items-center">
                  {/* Tractor Cab */}
                  <div className="w-8 h-12 bg-gradient-to-b from-[#D4AF37] to-[#8c7423] rounded-t-md border border-white/40 shadow-lg relative flex flex-col items-center justify-center">
                    <span className="text-[8px] font-black text-black font-mono">CAB</span>
                    {/* Headlight beams */}
                    <div className="absolute -top-12 w-16 h-12 bg-gradient-to-t from-yellow-300/25 to-transparent clip-triangle pointer-events-none" />
                  </div>
                  {/* 5th Wheel Articulation Gap */}
                  <div className="w-2 h-1.5 bg-[#444]" />
                  {/* 53-Foot Trailer Body */}
                  <div className="w-9 h-28 bg-[#1f2937] border border-[#4b5563] rounded-b-sm flex flex-col items-center justify-between p-1 text-[8px] font-mono text-gray-300">
                    <span className="text-[7px] text-[#888]">53FT</span>
                    <span className="font-bold text-[#D4AF37]">#104-E</span>
                    <div className="flex justify-between w-full px-0.5">
                      <div className="w-1.5 h-3 bg-red-500/80 rounded-xs" />
                      <div className="w-1.5 h-3 bg-red-500/80 rounded-xs" />
                    </div>
                  </div>
                </div>

                {/* TARGET 1: FORWARD LEAD VEHICLE */}
                <div className="absolute top-12 z-10 flex flex-col items-center animate-pulse">
                  <div className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-[9px] font-mono font-bold mb-1">
                    LEAD VEHICLE · 460 FT (5.2s)
                  </div>
                  <div className="w-7 h-10 bg-slate-700 border border-emerald-400 rounded-sm flex items-center justify-center text-[7px] font-mono font-bold text-white">
                    TANKER
                  </div>
                </div>

                {/* TARGET 2: RIGHT BLINDSPOT (NO-ZONE VEHICLE) */}
                <div className="absolute right-12 top-48 z-10 flex items-center gap-1.5 animate-bounce">
                  <div className="w-6 h-8 bg-rose-600 border border-rose-300 rounded-xs flex items-center justify-center text-[7px] font-mono font-bold text-white shadow-lg shadow-rose-600/40">
                    SUV
                  </div>
                  <div className="px-1.5 py-0.5 rounded bg-rose-950/90 border border-rose-500 text-rose-300 text-[8px] font-mono font-bold">
                    BLIND SPOT ALERT (38 FT)
                  </div>
                </div>

                {/* TARGET 3: REAR TAILGATING VEHICLE */}
                <div className="absolute bottom-6 z-10 flex flex-col items-center">
                  <div className="w-6 h-7 bg-amber-600 border border-amber-400 rounded-xs flex items-center justify-center text-[7px] font-mono font-bold text-white">
                    VAN
                  </div>
                  <div className="px-1.5 py-0.5 rounded bg-amber-950/90 border border-amber-500 text-amber-300 text-[8px] font-mono font-bold mt-1">
                    TAILGATER · 110 FT
                  </div>
                </div>
              </div>

              {/* Live Interactive Testing Hazard Injections */}
              <div className="pt-3 border-t border-[#222] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="font-mono text-[11px] text-[#888]">
                  Hazard Simulation Tests:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => triggerHazardSimulation('CUT_IN')}
                    className="px-2.5 py-1 rounded bg-[#1e1e24] hover:bg-rose-950 text-rose-300 border border-rose-800 text-[11px] font-mono font-bold transition"
                  >
                    Simulate Brake Cut-In
                  </button>
                  <button
                    onClick={() => triggerHazardSimulation('BLINDSPOT')}
                    className="px-2.5 py-1 rounded bg-[#1e1e24] hover:bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-mono font-bold transition"
                  >
                    Test No-Zone Blindspot
                  </button>
                  <button
                    onClick={() => triggerHazardSimulation('LOW_OVERPASS')}
                    className="px-2.5 py-1 rounded bg-[#1e1e24] hover:bg-sky-950 text-sky-300 border border-sky-800 text-[11px] font-mono font-bold transition"
                  >
                    Laser Bridge Scan
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sensor Sectors & Dynamic Safety Metrics (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Speed & Highway Traffic Controls */}
            <div className="p-4 rounded-xl bg-[#121215] border border-[#26262b] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> Highway Cruise Telematics
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {rigSpeedMph} MPH ({Math.round(rigSpeedMph * 1.467)} ft/s)
                </span>
              </div>

              {/* Speed Slider */}
              <div>
                <input
                  type="range"
                  min="35"
                  max="75"
                  value={rigSpeedMph}
                  onChange={(e) => setRigSpeedMph(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#777]">
                  <span>35 MPH (City / Grade)</span>
                  <span>55 MPH (State Route)</span>
                  <span>75 MPH (Interstate Limit)</span>
                </div>
              </div>

              {/* Road Condition Selector */}
              <div className="pt-2 border-t border-[#222]">
                <label className="text-[10px] font-mono text-[#888] uppercase block mb-1.5">
                  Road Surface &amp; Friction Coefficient (μ):
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <button
                    onClick={() => setRoadSurface('DRY')}
                    className={`py-1.5 px-2 rounded border text-center transition ${
                      roadSurface === 'DRY'
                        ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 font-bold'
                        : 'border-[#2a2a2e] text-[#888] hover:text-white'
                    }`}
                  >
                    Dry Asphalt (μ=0.65)
                  </button>
                  <button
                    onClick={() => setRoadSurface('WET')}
                    className={`py-1.5 px-2 rounded border text-center transition ${
                      roadSurface === 'WET'
                        ? 'border-amber-500 bg-amber-950/60 text-amber-300 font-bold'
                        : 'border-[#2a2a2e] text-[#888] hover:text-white'
                    }`}
                  >
                    Rain / Wet (μ=0.38)
                  </button>
                  <button
                    onClick={() => setRoadSurface('SNOW_ICE')}
                    className={`py-1.5 px-2 rounded border text-center transition ${
                      roadSurface === 'SNOW_ICE'
                        ? 'border-rose-500 bg-rose-950/60 text-rose-300 font-bold'
                        : 'border-[#2a2a2e] text-[#888] hover:text-white'
                    }`}
                  >
                    Black Ice (μ=0.16)
                  </button>
                </div>
              </div>
            </div>

            {/* Itemized 360° Sensor Sectors */}
            <div className="p-4 rounded-xl bg-[#121215] border border-[#26262b] space-y-3">
              <span className="text-xs font-mono font-bold text-white uppercase flex items-center justify-between border-b border-[#222] pb-2">
                <span>Active V2X Radar Envelope (5 Sectors)</span>
                <span className="text-emerald-400 text-[10px]">ALL SYSTEMS ONLINE</span>
              </span>

              <div className="space-y-2.5">
                {INITIAL_V2X_SECTORS.map((sector) => (
                  <div
                    key={sector.id}
                    className="p-2.5 rounded-lg bg-[#18181c] border border-[#2a2a30] space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono text-[11px]">{sector.name}</span>
                      <span className={`px-2 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                        sector.status === 'CLEAR'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : sector.status === 'CAUTION'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {sector.status} ({sector.distanceFt} FT)
                      </span>
                    </div>
                    <p className="text-[11px] text-[#999] leading-snug">{sector.description}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#666] pt-1">
                      <span>Target: {sector.targetType}</span>
                      <span>Time Buffer: <strong className="text-[#ccc]">{sector.timeBufferSec}s</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODULE 2: KINETIC ENERGY & MOUNTAIN DESCENT THERMAL BRAKE CALCULATOR */}
      {/* ==================================================================== */}
      {activeModule === 'BRAKE_PHYSICS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Physics Control Sliders (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-xl bg-[#121215] border border-[#26262b] space-y-5">
              <div className="border-b border-[#222] pb-3">
                <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-[#D4AF37]" />
                  Kinetic Energy &amp; 49 CFR Mountain Grade Parameters
                </span>
                <p className="text-xs text-[#888] mt-1">
                  Calculates instant kinetic energy ($E_k = \frac{1}{2}mv^2$), required pneumatic air brake stopping distance, and brake drum heat saturation on steep highway passes (e.g. Monteagle, Donner Pass, Saluda).
                </p>
              </div>

              {/* Slider 1: Gross Vehicle Weight */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#aaa]">Total Rig Gross Combination Weight (GVW):</span>
                  <strong className="text-white text-sm">{grossWeightLbs.toLocaleString()} LBS</strong>
                </div>
                <input
                  type="range"
                  min="34000"
                  max="80000"
                  step="500"
                  value={grossWeightLbs}
                  onChange={(e) => setGrossWeightLbs(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#666]">
                  <span>34,000 lbs (Empty 53ft Van)</span>
                  <span>60,000 lbs (Partial Freight)</span>
                  <span>80,000 lbs (Statutory Max Legal)</span>
                </div>
              </div>

              {/* Slider 2: Downhill Grade % */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#aaa]">Highway Downhill Grade Slope (%):</span>
                  <strong className={`text-sm ${descentGradePercent >= 6 ? 'text-rose-400' : 'text-[#D4AF37]'}`}>
                    -{descentGradePercent}% DOWNHILL
                  </strong>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.5"
                  value={descentGradePercent}
                  onChange={(e) => setDescentGradePercent(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#666]">
                  <span>1.0% (Gentle Slope)</span>
                  <span>5.0% (Steep Mountain Highway)</span>
                  <span>8.0% (Severe Grade / Ramp Alert)</span>
                </div>
              </div>

              {/* Slider 3: Continuous Descent Distance */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#aaa]">Continuous Descent Run Length:</span>
                  <strong className="text-white text-sm">{continuousDescentMiles} MILES</strong>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="12.0"
                  step="0.5"
                  value={continuousDescentMiles}
                  onChange={(e) => setContinuousDescentMiles(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#666]">
                  <span>0.5 Miles</span>
                  <span>6.0 Miles (Major Mountain Pass)</span>
                  <span>12.0 Miles (Extreme Sierra Nevada)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Thermal Brake Saturation & Stopping Results (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Thermal Brake Drum Gauge */}
            <div className="p-5 rounded-xl bg-[#121215] border border-[#26262b] space-y-4">
              <div className="flex items-center justify-between border-b border-[#222] pb-3">
                <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Brake Drum Thermal Saturation &amp; Kinetic Energy
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  brakePhysics.thermalBrakeStatus === 'BRAKE_FADE_DANGER'
                    ? 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse'
                    : brakePhysics.thermalBrakeStatus === 'ELEVATED'
                    ? 'bg-amber-950 text-amber-300 border border-amber-600'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                }`}>
                  {brakePhysics.thermalBrakeStatus.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-[#18181c] border border-[#2a2a30] text-center space-y-1">
                  <span className="text-[10px] font-mono text-[#888] uppercase block">
                    Brake Drum Estimated Temp
                  </span>
                  <div className={`text-3xl font-black font-mono ${
                    brakePhysics.brakeDrumTemperatureF >= 650 ? 'text-rose-500' : 'text-amber-400'
                  }`}>
                    {brakePhysics.brakeDrumTemperatureF}°F
                  </div>
                  <span className="text-[10px] text-[#666]">Fade Risk Zone: &gt;680°F</span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#18181c] border border-[#2a2a30] text-center space-y-1">
                  <span className="text-[10px] font-mono text-[#888] uppercase block">
                    Kinetic Dissipation Energy
                  </span>
                  <div className="text-3xl font-black font-mono text-sky-400">
                    {brakePhysics.kineticEnergyMegajoules} MJ
                  </div>
                  <span className="text-[10px] text-[#666]">MegaJoules at {rigSpeedMph} MPH</span>
                </div>
              </div>

              {/* Dynamic Stopping Distance Breakdown */}
              <div className="space-y-2 border-t border-[#222] pt-3 text-xs font-mono">
                <span className="text-[11px] text-[#aaa] font-bold block">
                  Complete Braking Distance Breakdown (At {rigSpeedMph} MPH on -{descentGradePercent}% grade):
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded bg-[#161618] border border-[#26262a]">
                    <div className="text-[#888]">Driver Perception (1.5s)</div>
                    <div className="text-white font-bold">{brakePhysics.perceptionDistanceFt} FT</div>
                  </div>
                  <div className="p-2 rounded bg-[#161618] border border-[#26262a]">
                    <div className="text-[#888]">Air Lag Propagation (0.4s)</div>
                    <div className="text-white font-bold">{brakePhysics.airBrakeLagDistanceFt} FT</div>
                  </div>
                  <div className="p-2 rounded bg-[#161618] border border-[#26262a]">
                    <div className="text-[#888]">Pneumatic Friction Stop</div>
                    <div className="text-white font-bold">{brakePhysics.frictionBrakingDistanceFt} FT</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#0e0e11] border border-[#333] flex items-center justify-between">
                  <span className="font-bold text-white">TOTAL EMERGENCY STOPPING DISTANCE:</span>
                  <span className="text-lg font-black text-[#D4AF37]">
                    {brakePhysics.totalStoppingDistanceFt} FEET ({(brakePhysics.totalStoppingDistanceFt / 53).toFixed(1)} Trailer Lengths)
                  </span>
                </div>
              </div>

              {/* Mountain Descent Safety Directives */}
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/60 text-xs space-y-1 text-emerald-200">
                <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Statutory Descent Directives for {descentGradePercent}% Grade:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>Recommended Transmission Gear: <strong>{brakePhysics.recommendedDescentGear}</strong></div>
                  <div>Jake Compression Brake Setting: <strong>{brakePhysics.recommendedJakeStage.replace(/_/g, ' ')}</strong></div>
                  <div>Maximum Safe Descent Speed: <strong>{brakePhysics.safeDescentSpeedMph} MPH</strong></div>
                  <div>Next Emergency Escape Ramp: <strong>{brakePhysics.nearestEscapeRampMiles} Miles Ahead</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODULE 3: INTERSTATE IFTA NET-TAX DIESEL ARBITRAGE RADAR             */}
      {/* ==================================================================== */}
      {activeModule === 'IFTA_ARBITRAGE' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-[#121215] border border-[#26262b]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#D4AF37]" />
                  Interstate IFTA Net-Tax Diesel Arbitrage Engine
                </h2>
                <p className="text-xs text-[#888] mt-1 max-w-3xl">
                  Retail pump prices are deceptive. State fuel excise taxes (e.g. PA 57.6¢ vs OH 38.5¢) create severe price cliffs. Truckwithease calculates the <strong>True Bottom-Line Net Cost</strong> per gallon after your quarterly IFTA fuel tax credit or surcharge, saving owner-operators $40–$90 per 150-gallon fill!
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#18181c] border border-[#333] text-right font-mono shrink-0">
                <span className="text-[10px] text-[#888] uppercase block">Typical 150-Gal Fill Savings</span>
                <span className="text-xl font-black text-emerald-400">+$68.40 Net</span>
              </div>
            </div>
          </div>

          {/* Arbitrage Station Comparison Table */}
          <div className="space-y-3">
            {INITIAL_IFTA_STATIONS.map((station) => (
              <div
                key={station.id}
                className="p-4 rounded-xl bg-[#121215] border border-[#26262b] hover:border-[#38383e] transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222] pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-white tracking-tight">
                        {station.stationName}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                        {station.brand}
                      </span>
                      <span className="text-xs font-mono text-[#888]">
                        {station.interstateHighway} &bull; {station.exitNumber} ({station.state})
                      </span>
                    </div>
                    <div className="text-[11px] text-[#777]">
                      {station.distanceMiles} miles ahead &bull; Open Truck Parking: <strong className="text-emerald-400">{station.openTruckParkingSpaces} stalls</strong> &bull; {station.cleanShowersAvailable} Showers Available
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono">
                      <div className="text-[10px] text-[#888] uppercase">Pump Price</div>
                      <div className="text-sm font-bold text-white line-through">${station.pumpPricePerGallon.toFixed(3)}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-[10px] text-emerald-400 uppercase font-bold">True Net Cost</div>
                      <div className="text-xl font-black text-emerald-400">${station.trueNetPricePerGallon.toFixed(3)}</div>
                    </div>
                  </div>
                </div>

                {/* Tax Breakdown Strip & Financial Advice */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono bg-[#161619] p-2.5 rounded-lg border border-[#26262b]">
                  <div>
                    <span className="text-[#888] block text-[10px]">State Excise Tax:</span>
                    <span className="text-white">${station.stateExciseTax.toFixed(3)} / gal</span>
                  </div>
                  <div>
                    <span className="text-[#888] block text-[10px]">IFTA Tax Adjustment:</span>
                    <span className={station.iftaCreditAdjustment < 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {station.iftaCreditAdjustment < 0 ? `Credit (-$${Math.abs(station.iftaCreditAdjustment).toFixed(3)})` : `Surcharge (+$${station.iftaCreditAdjustment.toFixed(3)})`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#888] block text-[10px]">Est. Savings (150 Gal):</span>
                    <span className={station.estimatedNetSavingsPer150Gal > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                      {station.estimatedNetSavingsPer150Gal > 0 ? `+$${station.estimatedNetSavingsPer150Gal.toFixed(2)} NET PROFIT` : `-$${Math.abs(station.estimatedNetSavingsPer150Gal).toFixed(2)} NET LOSS`}
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                      station.bypassRecommendation === 'OPTIMAL_FILL_STOP'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                        : station.bypassRecommendation === 'SECONDARY_OPTION'
                        ? 'bg-amber-950 text-amber-300 border border-amber-600'
                        : 'bg-rose-950 text-rose-300 border border-rose-600'
                    }`}>
                      {station.bypassRecommendation.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODULE 4: ACOUSTIC & VIBRATION ML TELEMATICS                         */}
      {/* ==================================================================== */}
      {activeModule === 'ACOUSTIC_ML' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-[#121215] border border-[#26262b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#D4AF37]" />
                Predictive Acoustic &amp; Vibration Telematics
              </h2>
              <p className="text-xs text-[#888] mt-1 max-w-3xl">
                Continuous high-frequency (0–120 kHz) acoustic waveform monitoring detects micro-fractures in wheel hub bearings, turbocharger shaft flutter, and SCR urea crystallization before catastrophic roadside derates occur.
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 font-mono text-xs font-bold border border-emerald-800 shrink-0">
              5 OF 5 CHANNELS HARMONIC
            </span>
          </div>

          {/* Component Diagnostics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INITIAL_ACOUSTIC_COMPONENTS.map((comp) => (
              <div
                key={comp.id}
                className="p-4 rounded-xl bg-[#121215] border border-[#26262b] flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#888] uppercase">{comp.category.replace(/_/g, ' ')}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      comp.status === 'OPTIMAL'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {comp.healthScorePercent}% Health
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{comp.componentName}</h3>
                  <div className="text-[11px] font-mono text-[#777]">
                    Resonance: {comp.sensorFrequencyKhz} kHz &bull; RMS Vibration: {comp.vibrationRms} mm/s
                  </div>
                  <p className="text-xs text-[#aaa] pt-1 leading-relaxed">{comp.recommendation}</p>
                </div>

                <div className="pt-2 border-t border-[#222] flex items-center justify-between text-[10px] font-mono text-[#777]">
                  <span>Est. Life Remaining:</span>
                  <strong className="text-white">{comp.estimatedMilesRemaining.toLocaleString()} Miles</strong>
                </div>
              </div>
            ))}
          </div>

          {/* 18-Wheeler Dynamic TPMS & Thermal Heatmap Graphic */}
          <div className="p-5 rounded-xl bg-[#121215] border border-[#26262b] space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                18-Wheel Commercial TPMS &amp; Axle Thermal Signature Grid
              </span>
              <span className="text-xs font-mono text-emerald-400">All 18 Chambers Operating at 100–105 PSI Cold</span>
            </div>

            {/* Visual Axle Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#18181c] border border-[#2a2a30] space-y-1">
                <div className="text-[#888] text-[10px]">AXLE 1 (STEER)</div>
                <div className="text-white font-bold">110 PSI &bull; 114°F</div>
                <span className="text-[9px] text-emerald-400">Hub 98% Health</span>
              </div>
              <div className="p-3 rounded-lg bg-[#18181c] border border-[#2a2a30] space-y-1">
                <div className="text-[#888] text-[10px]">AXLE 2 (FORWARD DRIVE)</div>
                <div className="text-white font-bold">102 PSI &bull; 128°F</div>
                <span className="text-[9px] text-emerald-400">Duals Matched</span>
              </div>
              <div className="p-3 rounded-lg bg-[#18181c] border border-[#2a2a30] space-y-1">
                <div className="text-[#888] text-[10px]">AXLE 3 (REAR DRIVE)</div>
                <div className="text-white font-bold">104 PSI &bull; 132°F</div>
                <span className="text-[9px] text-emerald-400">Duals Matched</span>
              </div>
              <div className="p-3 rounded-lg bg-[#18181c] border border-[#2a2a30] space-y-1">
                <div className="text-[#888] text-[10px]">AXLE 4 (TRAILER FRONT)</div>
                <div className="text-white font-bold">100 PSI &bull; 118°F</div>
                <span className="text-[9px] text-emerald-400">Tandem Pin Clean</span>
              </div>
              <div className="p-3 rounded-lg bg-[#18181c] border border-[#2a2a30] space-y-1">
                <div className="text-[#888] text-[10px]">AXLE 5 (TRAILER REAR)</div>
                <div className="text-white font-bold">101 PSI &bull; 120°F</div>
                <span className="text-[9px] text-emerald-400">Tandem Pin Clean</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODULE 5: AERODYNAMIC CROSSWIND & ROLLOVER VULNERABILITY MODEL       */}
      {/* ==================================================================== */}
      {activeModule === 'CROSSWIND' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-xl bg-[#121215] border border-[#26262b] space-y-5">
              <div className="border-b border-[#222] pb-3">
                <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-[#D4AF37]" />
                  Aerodynamic Crosswind &amp; Gust Vector Simulation
                </span>
                <p className="text-xs text-[#888] mt-1">
                  A 53ft trailer presents 477 square feet of lateral sail area. When empty or hauling light freight, crosswinds over 40 MPH on I-80 (Wyoming) or I-25 (Colorado) can tip a rig over.
                </p>
              </div>

              {/* Wind Speed Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#aaa]">Ambient Gust Wind Speed:</span>
                  <strong className={`text-sm ${ambientWindMph >= 45 ? 'text-rose-400' : 'text-white'}`}>
                    {ambientWindMph} MPH GUSTS
                  </strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="65"
                  value={ambientWindMph}
                  onChange={(e) => setAmbientWindMph(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#666]">
                  <span>10 MPH (Light)</span>
                  <span>35 MPH (Advisory)</span>
                  <span>65 MPH (Hurricane Force)</span>
                </div>
              </div>

              {/* Wind Angle Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#aaa]">Wind Direction Relative to Travel:</span>
                  <strong className="text-white text-sm">{windAngleDegrees}° Angle ({windAngleDegrees >= 75 ? 'Direct Broadside' : 'Quartering Headwind'})</strong>
                </div>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={windAngleDegrees}
                  onChange={(e) => setWindAngleDegrees(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#666]">
                  <span>15° (Headwind / Fuel Hit)</span>
                  <span>45° (Quartering)</span>
                  <span>90° (Direct Broadside Sail)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-xl bg-[#121215] border border-[#26262b] space-y-4">
              <div className="flex items-center justify-between border-b border-[#222] pb-3">
                <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  Rollover Vulnerability Assessment
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  crosswindPhysics.rolloverStatus === 'SAFE'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                    : crosswindPhysics.rolloverStatus === 'ELEVATED_VULNERABILITY'
                    ? 'bg-amber-950 text-amber-300 border border-amber-600'
                    : 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse'
                }`}>
                  {crosswindPhysics.rolloverStatus.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-[#18181c] border border-[#2a2a30] text-center space-y-1">
                  <span className="text-[10px] font-mono text-[#888] uppercase block">
                    Rollover Vulnerability Index
                  </span>
                  <div className={`text-4xl font-black font-mono ${
                    crosswindPhysics.rolloverVulnerabilityPercent > 70 ? 'text-rose-500' : 'text-emerald-400'
                  }`}>
                    {crosswindPhysics.rolloverVulnerabilityPercent}%
                  </div>
                  <span className="text-[10px] text-[#666]">Based on {grossWeightLbs.toLocaleString()} lbs GVW</span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#18181c] border border-[#2a2a30] text-center space-y-1">
                  <span className="text-[10px] font-mono text-[#888] uppercase block">
                    Lateral Broadside Force
                  </span>
                  <div className="text-4xl font-black font-mono text-[#D4AF37]">
                    {crosswindPhysics.effectiveLateralForceLbs.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-[#666]">Pounds of Lateral Pressure</span>
                </div>
              </div>

              {/* Action Directive */}
              <div className="p-3.5 rounded-lg bg-[#161619] border border-[#333] text-xs font-mono space-y-2">
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase block">
                  Aerodynamic Weather Advisory &amp; Safe Action:
                </span>
                <p className="text-slate-200 leading-relaxed">
                  "{crosswindPhysics.recommendedAction}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
