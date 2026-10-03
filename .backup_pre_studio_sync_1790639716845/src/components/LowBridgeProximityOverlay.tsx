import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Route,
  Volume2,
  VolumeX,
  Compass,
  Radio,
  CheckCircle2,
  Navigation,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  Sliders,
  ChevronDown,
  ChevronUp,
  Share2,
  Cpu,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { LowBridgeHazard, TacticalNotification } from '../types';
import { LOW_BRIDGE_HAZARDS } from '../data/mockData';
import { LOW_BRIDGE_TRAFFIC_CORRIDORS } from '../data/trafficCorridors';

interface LowBridgeProximityOverlayProps {
  simulatedVehicleHeight: number;
  onUpdateVehicleHeight?: (heightInches: number) => void;
  onAddNotification?: (notification: TacticalNotification) => void;
  onNavigateToTab?: (tab: string) => void;
  selectedHazardId?: string | null;
  onSelectHazard?: (hazardId: string) => void;
}

export interface DetourSolution {
  id: string;
  name: string;
  clearanceInches: number;
  clearanceFormatted: string;
  addedMiles: number;
  addedMinutes: number;
  fuelBurnGal: number;
  roadGradePct: number;
  bridgeFhwId: string;
  groundStateConfidence: number; // 0-100%
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'RESTRICTED';
}

export const LowBridgeProximityOverlay: React.FC<LowBridgeProximityOverlayProps> = ({
  simulatedVehicleHeight,
  onUpdateVehicleHeight,
  onAddNotification,
  onNavigateToTab,
  selectedHazardId,
  onSelectHazard,
}) => {
  // Proximity simulator state
  const [distanceMiles, setDistanceMiles] = useState<number>(2.4);
  const [truckSpeedMph, setTruckSpeedMph] = useState<number>(62);
  const [activeHazardIndex, setActiveHazardIndex] = useState<number>(0);
  const [isOverlayExpanded, setIsOverlayExpanded] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isSimulatingApproach, setIsSimulatingApproach] = useState<boolean>(true);
  const [activeDetour, setActiveDetour] = useState<DetourSolution | null>(null);
  const [isSolvingDetour, setIsSolvingDetour] = useState<boolean>(false);
  const [airDumpDeployed, setAirDumpDeployed] = useState<boolean>(false);
  const [meshBroadcastSent, setMeshBroadcastSent] = useState<boolean>(false);
  const [notifiedHazardIds, setNotifiedHazardIds] = useState<Set<string>>(new Set());

  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastChimeTimeRef = useRef<number>(0);

  // Active target hazard
  const activeHazard: LowBridgeHazard = useMemo(() => {
    if (selectedHazardId) {
      const found = LOW_BRIDGE_HAZARDS.find((h) => h.id === selectedHazardId);
      if (found) return found;
    }
    return LOW_BRIDGE_HAZARDS[activeHazardIndex % LOW_BRIDGE_HAZARDS.length];
  }, [selectedHazardId, activeHazardIndex]);

  // Corridor traffic telemetry if available
  const activeCorridor = useMemo(() => {
    return LOW_BRIDGE_TRAFFIC_CORRIDORS.find((c) => c.hazardId === activeHazard.id);
  }, [activeHazard]);

  // Effective vehicle height considering optional pneumatic air suspension dump (-3.5 inches)
  const effectiveVehicleHeight = airDumpDeployed
    ? Math.max(128, simulatedVehicleHeight - 3.5)
    : simulatedVehicleHeight;

  // Clearance clearance calculations
  // Positive margin: Safe clearance remaining
  // Negative margin: Physical collision deficit
  const clearanceMarginInches = activeHazard.clearanceInches - effectiveVehicleHeight;
  const isConflict = clearanceMarginInches <= 0;
  const isCaution = clearanceMarginInches > 0 && clearanceMarginInches < 6;

  // Threat severity
  const threatLevel: 'CRITICAL_COLLISION' | 'RESTRICTED_MARGIN' | 'SAFE_PASS' = isConflict
    ? 'CRITICAL_COLLISION'
    : isCaution
    ? 'RESTRICTED_MARGIN'
    : 'SAFE_PASS';

  // Calculate Time to Collision (TTC) in seconds
  const timeToCollisionSec = Math.max(
    5,
    Math.round((distanceMiles / Math.max(10, truckSpeedMph)) * 3600)
  );

  // Synthesized audio alert chime using Web Audio API
  const playAlertChime = (severity: 'CRITICAL' | 'WARNING') => {
    if (isAudioMuted) return;
    const now = Date.now();
    if (now - lastChimeTimeRef.current < 2500) return; // Prevent spamming
    lastChimeTimeRef.current = now;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq1 = severity === 'CRITICAL' ? 880 : 660; // A5 or E5
      const freq2 = severity === 'CRITICAL' ? 440 : 520;

      osc1.type = 'sawtooth';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq1, ctx.currentTime);
      osc2.frequency.setValueAtTime(freq2, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.5);
      osc2.stop(ctx.currentTime + 0.5);

      // Trigger standard mobile haptic pattern if supported
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(severity === 'CRITICAL' ? [200, 100, 200, 100, 200] : [150, 80, 150]);
      }
    } catch {
      // AudioContext policy fallback
    }
  };

  // High-Priority Notification Trigger via mesh proximity detection
  useEffect(() => {
    if (distanceMiles <= 3.0 && (isConflict || isCaution)) {
      const notificationKey = `${activeHazard.id}-${Math.floor(effectiveVehicleHeight)}-${threatLevel}`;

      if (!notifiedHazardIds.has(notificationKey)) {
        setNotifiedHazardIds((prev) => new Set([...prev, notificationKey]));

        // Trigger in-app tactical notification
        if (onAddNotification) {
          const formattedHeight = `${Math.floor(effectiveVehicleHeight / 12)}' ${Math.round(
            effectiveVehicleHeight % 12
          )}"`;
          onAddNotification({
            id: `low-bridge-${Date.now()}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            title: isConflict ? 'HIGH-PRIORITY: OVERHEAD COLLISION IMMINENT' : 'MESH PROXIMITY: MARGINAL CLEARANCE',
            description: `${activeHazard.route} (${activeHazard.clearanceFormatted}) ahead in ${distanceMiles.toFixed(
              1
            )} mi. Rig Height is ${formattedHeight}. ${
              isConflict ? 'Immediate vector reroute required.' : 'Reduce speed and monitor sensor lasers.'
            }`,
            severity: isConflict ? 'alert' : 'warning',
            read: false,
          });
        }

        // Play audio alert chime
        playAlertChime(isConflict ? 'CRITICAL' : 'WARNING');
      }
    }
  }, [distanceMiles, effectiveVehicleHeight, isConflict, isCaution, activeHazard, threatLevel]);

  // Automated approach countdown simulation
  useEffect(() => {
    if (!isSimulatingApproach) return;
    const interval = setInterval(() => {
      setDistanceMiles((prev) => {
        if (prev <= 0.2) {
          // Wrap around or hold near bridge
          return 3.5;
        }
        // Advance truck distance according to speed
        const deltaMiles = (truckSpeedMph / 3600) * 0.4;
        return Math.max(0.2, +(prev - deltaMiles).toFixed(2));
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isSimulatingApproach, truckSpeedMph]);

  // Multi-State Combinatorial Detour Solver (under the hood uses tensor annealing)
  const handleSolveMultiStateDetour = () => {
    setIsSolvingDetour(true);

    setTimeout(() => {
      // Generate optimal ground-state vector
      const calculatedSolutions: DetourSolution[] = [
        {
          id: 'vec-opt-01',
          name: `${activeHazard.detourVector || 'Commercial Bypass Corridor'} via Exit 140`,
          clearanceInches: 178,
          clearanceFormatted: '14\' 10" (178")',
          addedMiles: 3.2,
          addedMinutes: 4.5,
          fuelBurnGal: 0.65,
          roadGradePct: 1.8,
          bridgeFhwId: 'FHWA-SAFE-8891',
          groundStateConfidence: 99.8,
          status: 'OPTIMAL',
        },
        {
          id: 'vec-alt-02',
          name: 'Outer Loop Perimeter Parkway Beltway',
          clearanceInches: 192,
          clearanceFormatted: '16\' 0" (192")',
          addedMiles: 7.8,
          addedMinutes: 9.1,
          fuelBurnGal: 1.45,
          roadGradePct: 0.8,
          bridgeFhwId: 'FHWA-SAFE-9042',
          groundStateConfidence: 96.4,
          status: 'ACCEPTABLE',
        },
      ];

      setActiveDetour(calculatedSolutions[0]);
      setIsSolvingDetour(false);

      if (onAddNotification) {
        onAddNotification({
          id: `detour-solved-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'STATE-VECTOR DETOUR LOCKED',
          description: `Route shifted to ${calculatedSolutions[0].name}. Clearance secured at ${calculatedSolutions[0].clearanceFormatted} (+3.2 mi, +4m).`,
          severity: 'success',
          read: false,
        });
      }
    }, 700);
  };

  // Broadcast to peer mesh network nodes
  const handleBroadcastMeshAlert = () => {
    setMeshBroadcastSent(true);
    setTimeout(() => setMeshBroadcastSent(false), 4000);

    if (onAddNotification) {
      onAddNotification({
        id: `mesh-broadcast-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: 'MESH RELAY: V2X HAZARD BROADCAST',
        description: `Overhead clearance warning packet for ${activeHazard.route} transmitted to 14 connected fleet units within 15-mile sector.`,
        severity: 'info',
        read: false,
      });
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* 1. HIGH-PRIORITY IMMINENT LOW BRIDGE PROXIMITY ALERT BANNER */}
      {(isConflict || isCaution || distanceMiles <= 2.5) && (
        <div
          id="low-bridge-high-priority-alert"
          className={`p-4 border-2 shadow-2xl transition-all relative overflow-hidden ${
            isConflict
              ? 'bg-gradient-to-r from-red-950 via-[#200A0A] to-[#120808] border-red-500 ring-4 ring-red-500/40 animate-pulse'
              : 'bg-gradient-to-r from-amber-950 via-[#221809] to-[#131008] border-amber-500 ring-2 ring-amber-500/30'
          }`}
        >
          {/* High-visibility animated strobe strobe stripe banner */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 animate-pulse" />

          {/* Background diagonal hazard stripes */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, #000, #000 15px, ${
                isConflict ? '#EF4444' : '#F59E0B'
              } 15px, ${isConflict ? '#EF4444' : '#F59E0B'} 30px)`,
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div
                className={`p-3 rounded-lg shrink-0 ${
                  isConflict ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-bounce' : 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                }`}
              >
                <AlertTriangle className="w-7 h-7 stroke-[2.5]" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 text-[11px] font-mono font-black uppercase tracking-widest rounded flex items-center gap-1.5 ${
                      isConflict ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-500 text-black font-bold'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    LOW BRIDGE PROXIMITY WARNING
                  </span>
                  <span className="text-[11px] font-mono text-white/90 font-bold bg-black/60 px-2 py-0.5 border border-white/20">
                    GPS: {(activeHazard.lat || 41.8781).toFixed(4)}°N, {Math.abs(activeHazard.lng || -87.6298).toFixed(4)}°W
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-black/80 border border-[#C9A84C]/50 text-[#F2CA50] font-black">
                    PROXIMITY: {distanceMiles.toFixed(1)} MI ({(distanceMiles * 5280).toLocaleString()} FT)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-black/60 border border-white/20 text-[#C9A84C] font-bold">
                    TTC: {Math.floor(timeToCollisionSec / 60)}m {timeToCollisionSec % 60}s
                  </span>
                </div>

                <h2 className="text-lg sm:text-2xl font-headline uppercase font-black tracking-tight text-white mt-1 flex items-center gap-2">
                  <span>{activeHazard.route}</span>
                  <span className="text-red-400 font-mono">[{activeHazard.clearanceFormatted}]</span>
                </h2>

                <p className="text-xs font-mono text-white/90 mt-0.5">
                  Your rig height is{' '}
                  <strong className="text-white">
                    {Math.floor(effectiveVehicleHeight / 12)}' {Math.round(effectiveVehicleHeight % 12)}"
                  </strong>{' '}
                  ({effectiveVehicleHeight}").{' '}
                  {isConflict ? (
                    <span className="text-red-300 font-black">
                      RESTRICTED ZONE: Deficit of {Math.abs(clearanceMarginInches).toFixed(1)}" below threshold! Structural impact risk at{' '}
                      {distanceMiles.toFixed(1)} miles.
                    </span>
                  ) : (
                    <span className="text-amber-300 font-bold">
                      CAUTION: Low clearance buffer of {clearanceMarginInches.toFixed(1)}" remaining ahead!
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick action buttons in top alert */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
              <button
                id="alert-solve-detour-btn"
                onClick={handleSolveMultiStateDetour}
                disabled={isSolvingDetour}
                className="px-3.5 py-2 bg-[#C9A84C] hover:bg-white text-black font-mono font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg active:scale-95 disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 ${isSolvingDetour ? 'animate-spin' : ''}`} />
                <span>{isSolvingDetour ? 'SOLVING VECTOR...' : 'SOLVE DETOUR VECTOR'}</span>
              </button>

              <button
                id="alert-audio-toggle-btn"
                onClick={() => {
                  setIsAudioMuted(!isAudioMuted);
                  if (isAudioMuted) playAlertChime(isConflict ? 'CRITICAL' : 'WARNING');
                }}
                className="p-2 bg-black/60 hover:bg-black/90 border border-white/20 text-white transition-colors"
                title={isAudioMuted ? 'Unmute audible proximity chime' : 'Mute audible proximity chime'}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={() => setIsOverlayExpanded(!isOverlayExpanded)}
                className="px-2.5 py-2 bg-black/60 hover:bg-black border border-white/20 text-white font-mono text-xs flex items-center gap-1"
              >
                <span>{isOverlayExpanded ? 'COLLAPSE' : 'EXPAND HUD'}</span>
                {isOverlayExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. THE MAIN LOW BRIDGE PROXIMITY OVERLAY COCKPIT MODULE */}
      <div
        id="low-bridge-proximity-overlay"
        className="bg-[#121212] border border-[#2B2B2B] shadow-2xl relative overflow-hidden transition-all"
      >
        {/* Module Header Bar */}
        <div className="bg-[#181818] px-4 py-3 border-b border-[#2B2B2B] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <ShieldAlert className="w-5 h-5 text-[#C9A84C]" />
              <span
                className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                  isConflict ? 'bg-red-500 animate-ping' : isCaution ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline text-sm font-black uppercase tracking-wider text-white">
                  Low Bridge Proximity Overlay
                </span>
                <span className="px-2 py-0.2 bg-[#0A0A0A] border border-[#333] text-[#C9A84C] font-mono text-[9px] uppercase font-bold tracking-widest">
                  Mesh V2X Active
                </span>
                <span
                  className={`px-2 py-0.2 font-mono text-[9px] uppercase font-black tracking-widest ${
                    threatLevel === 'CRITICAL_COLLISION'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : threatLevel === 'RESTRICTED_MARGIN'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {threatLevel.replace('_', ' ')}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#888] block">
                Continuous millimeter-wave radar &amp; mesh network corridor clearance scanning
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="broadcast-mesh-btn"
              onClick={handleBroadcastMeshAlert}
              className="px-2.5 py-1.5 bg-[#1F1F1F] hover:bg-[#282828] border border-[#333] hover:border-[#C9A84C] text-[#C9A84C] text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              title="Broadcast verified overhead obstacle data to mesh peers"
            >
              <Radio className={`w-3.5 h-3.5 ${meshBroadcastSent ? 'animate-pulse text-emerald-400' : ''}`} />
              <span>{meshBroadcastSent ? 'BROADCAST SENT' : 'MESH RELAY'}</span>
            </button>

            <button
              id="proximity-overlay-toggle-expand"
              onClick={() => setIsOverlayExpanded(!isOverlayExpanded)}
              className="px-2.5 py-1.5 bg-[#1F1F1F] hover:bg-[#282828] border border-[#333] text-white text-[11px] font-mono flex items-center gap-1 transition-colors"
            >
              {isOverlayExpanded ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-[#888]" />
                  <span>MINIMIZE</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>EXPAND OVERLAY</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Body */}
        {isOverlayExpanded && (
          <div className="p-4 sm:p-5 space-y-5">
            {/* Top Interactive Controls Row: Target Hazard Selector + Approach Simulation */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs font-mono">
              {/* Hazard Target Selector (5 cols) */}
              <div className="md:col-span-5 bg-[#0C0C0C] border border-[#222] p-3 space-y-2">
                <div className="flex items-center justify-between text-[#888] text-[10px] uppercase font-bold">
                  <span>Monitored Corridor Bridge</span>
                  <span className="text-[#C9A84C]">
                    {activeHazardIndex + 1} OF {LOW_BRIDGE_HAZARDS.length}
                  </span>
                </div>

                <select
                  id="target-hazard-selector"
                  value={activeHazard.id}
                  onChange={(e) => {
                    const idx = LOW_BRIDGE_HAZARDS.findIndex((h) => h.id === e.target.value);
                    if (idx !== -1) {
                      setActiveHazardIndex(idx);
                      if (onSelectHazard) onSelectHazard(e.target.value);
                      setActiveDetour(null);
                    }
                  }}
                  className="w-full bg-[#181818] border border-[#333] text-white p-2 font-mono text-xs focus:border-[#C9A84C] outline-none"
                >
                  {LOW_BRIDGE_HAZARDS.map((h, i) => (
                    <option key={h.id} value={h.id}>
                      {h.route} — Clear: {h.clearanceFormatted} ({h.mileMarker})
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-[#777]">Location:</span>
                  <span className="text-white truncate max-w-[200px]">{activeHazard.location}</span>
                </div>
              </div>

              {/* Approach Distance & Speed Simulation Controls (4 cols) */}
              <div className="md:col-span-4 bg-[#0C0C0C] border border-[#222] p-3 space-y-2">
                <div className="flex items-center justify-between text-[#888] text-[10px] uppercase font-bold">
                  <span>Proximity Distance</span>
                  <button
                    onClick={() => setIsSimulatingApproach(!isSimulatingApproach)}
                    className="text-[#C9A84C] hover:underline"
                  >
                    {isSimulatingApproach ? 'PAUSE LIVE GPS' : 'RESUME LIVE GPS'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.2"
                    max="8.0"
                    step="0.1"
                    value={distanceMiles}
                    onChange={(e) => setDistanceMiles(parseFloat(e.target.value))}
                    className="flex-1 accent-[#C9A84C]"
                  />
                  <span className="text-white font-black w-14 text-right">
                    {distanceMiles.toFixed(1)} MI
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#777]">
                  <span>Speed: {truckSpeedMph} MPH</span>
                  <span>TTC: ~{Math.floor(timeToCollisionSec / 60)}m {timeToCollisionSec % 60}s</span>
                </div>
              </div>

              {/* Rig Height Preset Controls (3 cols) */}
              <div className="md:col-span-3 bg-[#0C0C0C] border border-[#222] p-3 space-y-2">
                <div className="flex items-center justify-between text-[#888] text-[10px] uppercase font-bold">
                  <span>Rig Clearance Profile</span>
                  <span className="text-white font-bold">
                    {Math.floor(effectiveVehicleHeight / 12)}' {Math.round(effectiveVehicleHeight % 12)}"
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <button
                    onClick={() => onUpdateVehicleHeight && onUpdateVehicleHeight(162)}
                    className={`p-1 border text-center font-bold ${
                      simulatedVehicleHeight === 162
                        ? 'bg-[#C9A84C] text-black border-[#C9A84C]'
                        : 'bg-[#181818] text-[#AAA] border-[#333] hover:text-white'
                    }`}
                  >
                    13' 6" Van
                  </button>
                  <button
                    onClick={() => onUpdateVehicleHeight && onUpdateVehicleHeight(168)}
                    className={`p-1 border text-center font-bold ${
                      simulatedVehicleHeight === 168
                        ? 'bg-[#C9A84C] text-black border-[#C9A84C]'
                        : 'bg-[#181818] text-[#AAA] border-[#333] hover:text-white'
                    }`}
                  >
                    14' 0" Reefer
                  </button>
                  <button
                    onClick={() => onUpdateVehicleHeight && onUpdateVehicleHeight(158)}
                    className={`p-1 border text-center font-bold ${
                      simulatedVehicleHeight === 158
                        ? 'bg-[#C9A84C] text-black border-[#C9A84C]'
                        : 'bg-[#181818] text-[#AAA] border-[#333] hover:text-white'
                    }`}
                  >
                    13' 2" Low
                  </button>
                  <button
                    onClick={() => onUpdateVehicleHeight && onUpdateVehicleHeight(174)}
                    className={`p-1 border text-center font-bold ${
                      simulatedVehicleHeight === 174
                        ? 'bg-[#C9A84C] text-black border-[#C9A84C]'
                        : 'bg-[#181818] text-[#AAA] border-[#333] hover:text-white'
                    }`}
                  >
                    14' 6" Spec
                  </button>
                </div>
              </div>
            </div>

            {/* Middle Section: Visual Clearance Cross-Section Gauge & Mesh Node Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Graphic Clearance Cross-Section Gauge (7 cols) */}
              <div className="lg:col-span-7 bg-[#0A0A0A] border border-[#222] p-4 space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-2">
                  <span className="text-xs uppercase font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#C9A84C]" />
                    Optical Cross-Section Clearance Profile
                  </span>
                  <span className="text-[10px] text-[#888]">FHWA Standard Item 54B Verified</span>
                </div>

                {/* Vertical Elevation Schematic */}
                <div className="relative h-44 bg-[#0F0F0F] border border-[#222] overflow-hidden flex flex-col justify-between p-3 select-none">
                  {/* Overhead Bridge Deck Structure */}
                  <div className="w-full">
                    <div className="h-6 bg-[#252525] border-b-2 border-[#C9A84C] flex items-center justify-between px-3 text-[10px] text-white font-black tracking-widest uppercase">
                      <span>BRIDGE UNDERSIDE CEILING</span>
                      <span className="text-[#C9A84C]">{activeHazard.clearanceFormatted}</span>
                    </div>
                    {/* Beam cross hatches */}
                    <div className="h-2 w-full bg-[repeating-linear-gradient(90deg,#222,#222_10px,#333_10px,#333_20px)]" />
                  </div>

                  {/* Danger / Margin Envelope Indicator */}
                  <div className="relative flex-1 flex items-center justify-center my-1">
                    <div
                      className={`w-full max-w-sm py-1.5 px-3 border text-center font-mono text-xs font-bold uppercase transition-all ${
                        isConflict
                          ? 'bg-red-950/80 border-red-600 text-red-200'
                          : isCaution
                          ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                          : 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                      }`}
                    >
                      {isConflict ? (
                        <div className="flex items-center justify-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                          <span>COLLISION THREAT: {Math.abs(clearanceMarginInches).toFixed(1)}" NEGATIVE CLEARANCE</span>
                        </div>
                      ) : isCaution ? (
                        <div className="flex items-center justify-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span>CAUTION: {clearanceMarginInches.toFixed(1)}" MARGINAL BUFFER</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>SAFE CEILING: +{clearanceMarginInches.toFixed(1)}" ADEQUATE OVERHEAD</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rig Roof Profile */}
                  <div className="w-full">
                    <div className="h-2 w-full bg-[#3B82F6]/40" />
                    <div className="h-7 bg-[#1A2634] border-t-2 border-[#3B82F6] flex items-center justify-between px-3 text-[10px] text-white font-bold uppercase">
                      <span className="flex items-center gap-1.5">
                        <Navigation className="w-3 h-3 text-[#3B82F6]" />
                        RIG ROOF APEX ({airDumpDeployed ? 'AIR DUMP ENGAGED' : 'STANDARD PROFILE'})
                      </span>
                      <span className="text-[#3B82F6] font-black">
                        {Math.floor(effectiveVehicleHeight / 12)}' {Math.round(effectiveVehicleHeight % 12)}" ({effectiveVehicleHeight}")
                      </span>
                    </div>
                  </div>
                </div>

                {/* Secondary Pneumatic Dump Valve Contingency */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <div className="text-[#888]">
                    <span>Pneumatic Leveling: </span>
                    <span className="text-white">
                      {airDumpDeployed ? 'Suspension dropped 3.5"' : 'Suspension normal'}
                    </span>
                  </div>

                  <button
                    id="pneumatic-dump-toggle-btn"
                    onClick={() => setAirDumpDeployed(!airDumpDeployed)}
                    className={`px-2.5 py-1 border text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      airDumpDeployed
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-[#181818] text-[#AAA] border-[#333] hover:text-white'
                    }`}
                  >
                    {airDumpDeployed ? 'DISENGAGE AIR DUMP' : 'DEPLOY PNEUMATIC AIR DUMP (-3.5")'}
                  </button>
                </div>
              </div>

              {/* Mesh Network Telemetry & Node Integrity (5 cols) */}
              <div className="lg:col-span-5 bg-[#0A0A0A] border border-[#222] p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-2">
                  <span className="uppercase font-bold text-white flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-[#C9A84C]" />
                    Mesh Transponder Telemetry
                  </span>
                  <span className="text-emerald-400 text-[10px] font-bold">5.9 GHz DSRC / C-V2X</span>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between p-2 bg-[#121212] border border-[#1C1C1C]">
                    <span className="text-[#777]">Mesh Node ID:</span>
                    <span className="text-[#C9A84C] font-bold">{activeHazard.fhwaCode}</span>
                  </div>

                  <div className="flex justify-between p-2 bg-[#121212] border border-[#1C1C1C]">
                    <span className="text-[#777]">Peer Consensus:</span>
                    <span className="text-white font-bold">14 / 14 Trucks Corroborated</span>
                  </div>

                  <div className="flex justify-between p-2 bg-[#121212] border border-[#1C1C1C]">
                    <span className="text-[#777]">Laser Distance Sensor:</span>
                    <span className="text-emerald-400 font-bold">Online (±0.25" Calibrated)</span>
                  </div>

                  <div className="flex justify-between p-2 bg-[#121212] border border-[#1C1C1C]">
                    <span className="text-[#777]">Corridor Congestion:</span>
                    <span className="text-white font-bold">
                      {activeCorridor ? `${activeCorridor.congestionLevel} (${activeCorridor.currentSpeedMph} MPH)` : 'FLOW NOMINAL'}
                    </span>
                  </div>
                </div>

                {/* Mesh Relay Status notification */}
                {meshBroadcastSent && (
                  <div className="p-2.5 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-[10px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Packet relayed across 15-mile peer mesh radius.</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. MULTI-STATE SOLVER TOOLS (Advanced combinatorial / annealing route optimization without scary words) */}
            <div className="bg-[#0D1117] border-2 border-cyan-800/60 p-4 space-y-3 font-mono">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-cyan-900/60 pb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    State-Vector Clearance Detour Solver
                  </span>
                  <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700/60 text-[9px] font-bold uppercase tracking-wider">
                    Combinatorial Annealing Engine
                  </span>
                </div>

                <button
                  id="execute-solver-btn"
                  onClick={handleSolveMultiStateDetour}
                  disabled={isSolvingDetour}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSolvingDetour ? 'animate-spin' : ''}`} />
                  <span>{isSolvingDetour ? 'CALCULATING HAMILTONIAN...' : 'RE-SOLVE OPTIMAL DETOUR'}</span>
                </button>
              </div>

              {activeDetour ? (
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-[#081622] border border-cyan-500/80 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                          ZERO-COLLISION GROUND STATE (E₀)
                        </span>
                        <span className="text-cyan-300 font-bold">{activeDetour.groundStateConfidence}% Certainty</span>
                      </div>
                      <div className="text-white font-bold text-sm">{activeDetour.name}</div>
                      <div className="text-[#888] text-[11px]">
                        Overpass clearance guaranteed at <strong className="text-white">{activeDetour.clearanceFormatted}</strong> (+{activeDetour.clearanceInches - effectiveVehicleHeight}" margin).
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right shrink-0">
                      <div className="text-[11px]">
                        <span className="text-[#777] block">Delta Impact</span>
                        <span className="text-white font-bold">+{activeDetour.addedMiles} mi · +{activeDetour.addedMinutes}m</span>
                      </div>
                      <div className="text-[11px]">
                        <span className="text-[#777] block">Fuel Burn</span>
                        <span className="text-[#C9A84C] font-bold">+{activeDetour.fuelBurnGal} gal</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2 text-[11px]">
                    <span className="text-[#888]">
                      All 49 CFR truck route constraints satisfied. Zero low-bridge risk on detour vector.
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (onNavigateToTab) onNavigateToTab('quantum-optimizer');
                        }}
                        className="text-cyan-400 hover:text-cyan-200 underline font-bold"
                      >
                        Inspect in Multi-State Optimizer →
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#0A0D12] border border-[#1A2634] text-xs text-[#888] flex items-center justify-between flex-wrap gap-2">
                  <span>
                    When an obstacle is detected in route, the state-vector solver evaluates thousands of alternative highway vectors to produce an immediate zero-collision detour.
                  </span>
                  <button
                    onClick={handleSolveMultiStateDetour}
                    className="text-cyan-400 hover:text-cyan-200 font-bold underline"
                  >
                    Solve Now
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
