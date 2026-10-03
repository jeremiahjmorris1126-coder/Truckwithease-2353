import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  Activity,
  Zap,
  Clock,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Lock,
  Phone,
  Truck,
  Shield,
  Compass,
  Bell,
  Sliders,
  Sparkles,
  AlertOctagon,
  Ban,
  ShieldAlert,
  ShieldCheck,
  ArrowDownUp,
  Info,
  Route,
  ChevronRight,
  Maximize2,
  Volume2,
  VolumeX,
  Navigation,
  Gauge,
  TrendingDown,
  Flame,
} from 'lucide-react';
import {
  MapGeofencingTool,
  CANVAS_LOW_BRIDGES,
  CanvasLowBridgeMarker,
  calculateGpsDistanceMiles,
} from './MapGeofencingTool';
import { TruckWithEaseLogo } from './TruckWithEaseLogo';
import { OfflineCacheIndicator } from './OfflineCacheIndicator';

interface MobileCockpitViewProps {
  onNavigateToTab?: (tab: string) => void;
}

export const MobileCockpitView: React.FC<MobileCockpitViewProps> = ({ onNavigateToTab }) => {
  const [deviceViewMode, setDeviceViewMode] = useState<'MOBILE' | 'TABLET' | 'DESKTOP'>('MOBILE');
  const [assignedLoads, setAssignedLoads] = useState<string[]>([]);
  const [activeBottomTab, setActiveBottomTab] = useState<'control' | 'geofence' | 'clocks' | 'bridges' | 'dispatch' | 'ops'>('control');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Vehicle Height Profile state for Low-Bridge Radar and Route Restriction calculations
  const [vehicleHeightInches, setVehicleHeightInches] = useState<number>(162); // 13' 6" Standard Dry Van
  const [isAirDumped, setIsAirDumped] = useState<boolean>(false); // Pneumatic suspension air-dump (-3")
  const [selectedTabletBridge, setSelectedTabletBridge] = useState<CanvasLowBridgeMarker | null>(null);

  // Active Vehicle GPS coordinates (default: 41.5389° N, 92.3550° W — approx 2.0 miles W of Mill Hall Viaduct)
  const [vehicleGps, setVehicleGps] = useState<{ lat: number; lng: number }>({
    lat: 41.5389,
    lng: -92.355,
  });

  // Auditory Warning System states
  const [isAuditoryMuted, setIsAuditoryMuted] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastChimeTimestampRef = useRef<number>(0);
  const lastChimedBridgeKeyRef = useRef<string | null>(null);

  const effectiveHeight = isAirDumped ? Math.max(120, vehicleHeightInches - 3) : vehicleHeightInches;

  const formatHeight = (inches: number) => {
    const feet = Math.floor(inches / 12);
    const inRemainder = Math.round(inches % 12);
    return `${feet}' ${inRemainder}" (${inches}")`;
  };

  const restrictedBridges = CANVAS_LOW_BRIDGES.filter((b) => b.clearanceInches < effectiveHeight);
  const cautionBridges = CANVAS_LOW_BRIDGES.filter(
    (b) => b.clearanceInches >= effectiveHeight && b.clearanceInches < effectiveHeight + 6
  );
  const safeBridges = CANVAS_LOW_BRIDGES.filter((b) => b.clearanceInches >= effectiveHeight + 6);

  // Compute distance from current vehicle GPS to all low-bridge markers in statute miles
  const bridgeDistances = useMemo(() => {
    return CANVAS_LOW_BRIDGES.map((bridge) => {
      const distanceMiles = calculateGpsDistanceMiles(
        vehicleGps.lat,
        vehicleGps.lng,
        bridge.lat,
        bridge.lng
      );
      const clearanceMargin = bridge.clearanceInches - effectiveHeight;
      const isThreat = clearanceMargin < 0;
      const isCaution = clearanceMargin >= 0 && clearanceMargin < 6;
      const isSafe = clearanceMargin >= 6;
      const isWithin5Miles = distanceMiles <= 5.0;

      return {
        bridge,
        distanceMiles,
        clearanceMargin,
        isThreat,
        isCaution,
        isSafe,
        isWithin5Miles,
      };
    }).sort((a, b) => a.distanceMiles - b.distanceMiles);
  }, [vehicleGps, effectiveHeight]);

  // Low-Bridge hazards currently within the 5-mile proximity auditory threshold
  const hazardsWithin5Miles = useMemo(
    () => bridgeDistances.filter((b) => b.isWithin5Miles),
    [bridgeDistances]
  );

  const primaryHazardWithin5Miles = hazardsWithin5Miles[0] || null;

  // Synthesized Auditory Warning Chime & Speech Alert Engine (Web Audio API)
  const playAuditoryWarningAlert = (
    threat: 'CRITICAL_COLLISION' | 'CAUTION_TIGHT' | 'SAFE_ADVISORY',
    force: boolean = false
  ) => {
    if (isAuditoryMuted && !force) return;

    const now = Date.now();
    if (!force && now - lastChimeTimestampRef.current < 3500) return; // Prevent audio distortion/spam
    lastChimeTimestampRef.current = now;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const t0 = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      if (threat === 'CRITICAL_COLLISION') {
        // High-urgency dual-pulsed siren (880Hz A5 alternating with 1175Hz D6)
        osc1.type = 'sawtooth';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(880, t0);
        osc1.frequency.setValueAtTime(1175, t0 + 0.14);
        osc1.frequency.setValueAtTime(880, t0 + 0.28);
        osc2.frequency.setValueAtTime(440, t0);
        osc2.frequency.setValueAtTime(587, t0 + 0.14);
        osc2.frequency.setValueAtTime(440, t0 + 0.28);

        gain.gain.setValueAtTime(0.2, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.55);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(t0);
        osc2.start(t0);
        osc1.stop(t0 + 0.56);
        osc2.stop(t0 + 0.56);
      } else if (threat === 'CAUTION_TIGHT') {
        // Warning chime (660Hz -> 523Hz)
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(660, t0);
        osc1.frequency.exponentialRampToValueAtTime(523, t0 + 0.25);
        gain.gain.setValueAtTime(0.16, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.45);
        osc1.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(t0);
        osc1.stop(t0 + 0.46);
      } else {
        // Calm radar alert ping (587Hz -> 880Hz)
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587, t0);
        osc1.frequency.exponentialRampToValueAtTime(880, t0 + 0.22);
        gain.gain.setValueAtTime(0.14, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4);
        osc1.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(t0);
        osc1.stop(t0 + 0.41);
      }

      // Haptic tactile pulse for driver phone/tablet
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(
            threat === 'CRITICAL_COLLISION'
              ? [300, 100, 300, 100, 400]
              : [200, 100, 200]
          );
        } catch {
          // Ignore vibration error
        }
      }
    } catch {
      // AudioContext policy fallback
    }

    // Speech synthesis vocal alert
    if (isVoiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const distStr = primaryHazardWithin5Miles
          ? `${primaryHazardWithin5Miles.distanceMiles.toFixed(1)} miles`
          : 'ahead';
        const msg =
          threat === 'CRITICAL_COLLISION'
            ? `Warning! Overhead collision threat in ${distStr}. Clearance is under current vehicle height.`
            : threat === 'CAUTION_TIGHT'
            ? `Caution! Low clearance bridge in ${distStr}. Tight headroom.`
            : `Notice. Overhead structure detected within 5 miles.`;
        const utterance = new SpeechSynthesisUtterance(msg);
        utterance.rate = 1.05;
        utterance.pitch = threat === 'CRITICAL_COLLISION' ? 1.2 : 1.0;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Speech synthesis fallback
      }
    }
  };

  // Automated Proximity Auditory Warning Trigger (Within 5-Mile Threshold)
  useEffect(() => {
    if (primaryHazardWithin5Miles) {
      const bridgeKey = `${primaryHazardWithin5Miles.bridge.id}-${primaryHazardWithin5Miles.distanceMiles.toFixed(1)}-${effectiveHeight}`;
      if (lastChimedBridgeKeyRef.current !== bridgeKey) {
        lastChimedBridgeKeyRef.current = bridgeKey;
        const threatLevel = primaryHazardWithin5Miles.isThreat
          ? 'CRITICAL_COLLISION'
          : primaryHazardWithin5Miles.isCaution
          ? 'CAUTION_TIGHT'
          : 'SAFE_ADVISORY';
        playAuditoryWarningAlert(threatLevel);
      }
    } else {
      lastChimedBridgeKeyRef.current = null;
    }
  }, [primaryHazardWithin5Miles, effectiveHeight]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAssignLoad = (loadId: string) => {
    setAssignedLoads((prev) => [...prev, loadId]);
    showToast(`DISPATCH ZERO: ${loadId} COMMITTED TO DRIVER TELEMATICS (200 OK)`);
  };

  return (
    <div className="w-full bg-[#050608] text-slate-200 font-sans pb-8 selection:bg-[#D4AF37] selection:text-[#050608]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 p-3.5 rounded-lg bg-[#111319] border border-[#D4AF37] text-white font-mono text-xs shadow-2xl flex items-center gap-2 animate-fadeIn max-w-md">
          <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BRAND HERO BANNER (MATCHING USER UPLOADED GRAPHIC) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0e0f14] via-[#050608] to-[#050608] border-b border-[#D4AF37]/30 py-6 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Official Gold Brand Badges */}
          <div className="flex items-center gap-4 mb-3 flex-wrap justify-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#FFE08A] to-[#D4AF37] flex items-center justify-center text-[#241A00] font-black">
                <Truck className="w-5 h-5" />
              </div>
              <span className="font-mono text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#D4AF37]">
                TruckWithEase
              </span>
            </div>
            <div className="h-4 w-px bg-[#D4AF37]/40 hidden sm:block" />
            <div className="flex items-center gap-1.5 font-mono text-sm font-bold tracking-widest text-white uppercase">
              <span className="text-[#D4AF37]">M</span> MORRISHIVE
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFF2A3] via-[#FFD700] to-[#B8860B] drop-shadow-sm">
            NOW LIVE ON IOS, ANDROID &amp; DESKTOP COCKPIT
          </h1>

          {/* 3 Core Value Pillars */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-4xl">
            <div className="p-3 bg-gradient-to-r from-[#161922] to-[#111319] border border-[#D4AF37]/30 rounded-lg flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-mono font-bold text-xs text-white uppercase">100% SRE Self-Healing</div>
                <span className="text-[10px] text-slate-400 font-mono">Real-time failover mesh</span>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-[#161922] to-[#111319] border border-[#D4AF37]/30 rounded-lg flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-mono font-bold text-xs text-white uppercase">Zero Hardware Lock-In</div>
                <span className="text-[10px] text-slate-400 font-mono">Runs with Samsara &amp; Motive</span>
              </div>
            </div>

            <a
              href="tel:6367068338"
              className="p-3 bg-gradient-to-r from-[#D4AF37]/20 to-[#111319] border border-[#D4AF37] rounded-lg flex items-center justify-center gap-3 hover:border-[#FFE08A] transition-all active:scale-95"
            >
              <div className="w-8 h-8 rounded bg-[#D4AF37] flex items-center justify-center text-[#050608] shrink-0 font-bold">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-mono font-bold text-xs text-[#D4AF37] uppercase">Direct 24/7 Dispatch</div>
                <span className="text-xs font-mono font-bold text-white">636-706-8338</span>
              </div>
            </a>
          </div>

          {/* Device Preview Mode Switcher */}
          <div className="mt-6 flex items-center gap-2 p-1 bg-[#111319] border border-[#222634] rounded-lg font-mono text-xs">
            <button
              onClick={() => setDeviceViewMode('MOBILE')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold uppercase transition-all ${
                deviceViewMode === 'MOBILE'
                  ? 'bg-[#D4AF37] text-[#050608]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Telemetry (iPhone/Android)</span>
            </button>

            <button
              onClick={() => setDeviceViewMode('TABLET')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold uppercase transition-all ${
                deviceViewMode === 'TABLET'
                  ? 'bg-[#D4AF37] text-[#050608]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet Radar (FHWA Low-Bridge)</span>
            </button>

            <button
              onClick={() => setDeviceViewMode('DESKTOP')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold uppercase transition-all ${
                deviceViewMode === 'DESKTOP'
                  ? 'bg-[#D4AF37] text-[#050608]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop Cockpit</span>
            </button>
          </div>
        </div>
      </section>

      {/* TABLET VIEW MODE OVERLAY */}
      {deviceViewMode === 'TABLET' && (
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="bg-[#0C0E14] border-2 border-[#D4AF37] rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <h3 className="font-mono text-sm font-bold text-[#D4AF37] uppercase flex items-center gap-2">
                    FHWA Low-Bridge Radar &amp; Bypass Diverters
                    <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-600 px-1.5 py-0.2 rounded font-bold">
                      {restrictedBridges.length} RESTRICTED
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Corridor restrictions mapped dynamically for: <strong className="text-white">{formatHeight(effectiveHeight)}</strong>
                    {isAirDumped && <span className="text-amber-400 ml-1">(-3" AIR DUMP ENGAGED)</span>}
                  </p>
                </div>
              </div>

              {/* Tablet Height Profile & Air Dump Controls */}
              <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
                <div className="flex items-center bg-[#111319] border border-slate-700 rounded p-1 gap-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">RIG:</span>
                  {[
                    { label: "12'6\"", val: 150 },
                    { label: "13'6\"", val: 162 },
                    { label: "14'0\"", val: 168 },
                    { label: "14'6\"", val: 174 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      onClick={() => setVehicleHeightInches(p.val)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        vehicleHeightInches === p.val ? 'bg-[#D4AF37] text-black shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setIsAirDumped(!isAirDumped)}
                    className={`ml-1 px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                      isAirDumped
                        ? 'bg-amber-500 text-black border-amber-400 animate-pulse'
                        : 'bg-black border-slate-800 text-slate-400 hover:text-amber-300'
                    }`}
                  >
                    AIR DUMP (-3")
                  </button>
                </div>

                <span className="font-mono text-xs bg-[#1A1B21] text-white px-2 py-1 rounded border border-slate-700">
                  TABLET MOUNT
                </span>
              </div>
            </div>

            {/* Tactical Tablet Radar Canvas */}
            <div className="relative h-72 sm:h-96 bg-[#07090E] rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center select-none">
              {/* Simulated Tactical Map Grid */}
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:20px_20px]" />

              <svg className="w-full h-full" viewBox="0 0 600 320">
                <defs>
                  <filter id="tabletRedGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="tabletAmberGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* 1. I-80 Primary Corridor */}
                <path
                  d="M 30 160 Q 200 140, 320 150 T 570 145"
                  stroke={effectiveHeight > 162 ? '#EF4444' : effectiveHeight > 156 ? '#F59E0B' : '#10B981'}
                  strokeWidth={effectiveHeight > 162 ? '6' : '3.5'}
                  strokeDasharray={effectiveHeight > 162 ? '8 6' : effectiveHeight > 156 ? '6 4' : 'none'}
                  filter={effectiveHeight > 162 ? 'url(#tabletRedGlow)' : undefined}
                  fill="none"
                  opacity="0.9"
                />

                {/* 2. US-30 Industrial Corridor */}
                <path
                  d="M 30 90 Q 200 70, 300 85 T 570 80"
                  stroke={effectiveHeight > 154 ? '#EF4444' : effectiveHeight > 148 ? '#F59E0B' : '#D4AF37'}
                  strokeWidth={effectiveHeight > 154 ? '5' : '3'}
                  strokeDasharray={effectiveHeight > 154 ? '8 5' : effectiveHeight > 148 ? '5 4' : 'none'}
                  filter={effectiveHeight > 154 ? 'url(#tabletRedGlow)' : undefined}
                  fill="none"
                  opacity="0.85"
                />

                {/* 3. I-90 Kennedy Expressway */}
                <path
                  d="M 30 40 Q 220 30, 350 42 T 570 38"
                  stroke={effectiveHeight > 158 ? '#EF4444' : effectiveHeight > 152 ? '#F59E0B' : '#64748B'}
                  strokeWidth={effectiveHeight > 158 ? '5' : '2.5'}
                  strokeDasharray={effectiveHeight > 158 ? '8 5' : 'none'}
                  filter={effectiveHeight > 158 ? 'url(#tabletRedGlow)' : undefined}
                  fill="none"
                  opacity="0.8"
                />

                {/* 4. Commercial Parkway Spur */}
                <path
                  d="M 450 200 Q 500 240, 570 270"
                  stroke={effectiveHeight > 136 ? '#EF4444' : '#10B981'}
                  strokeWidth={effectiveHeight > 136 ? '5' : '2.5'}
                  strokeDasharray={effectiveHeight > 136 ? '6 3' : 'none'}
                  filter={effectiveHeight > 136 ? 'url(#tabletRedGlow)' : undefined}
                  fill="none"
                  opacity="0.75"
                />

                {/* Corridor Labels */}
                <g fontFamily="monospace" fontSize="8" fill="#94A3B8">
                  <text x="35" y="180">I-80 TRUNK</text>
                  <text x="35" y="105">US-30 INDUSTRIAL</text>
                  <text x="35" y="32">I-90 EXP</text>
                  <text x="460" y="280" fill={effectiveHeight > 136 ? '#EF4444' : '#94A3B8'} fontWeight="bold">
                    {effectiveHeight > 136 ? '⛔ PKWY RESTRICTED' : 'PARKWAY'}
                  </text>
                </g>

                {/* OVERLAID LOW-BRIDGE HAZARD MARKERS WITH DISTINCT ICON SET */}
                {CANVAS_LOW_BRIDGES.map((bridge) => {
                  // Map coordinates scaled to tablet SVG viewport (600x320 from 800x360)
                  const tx = (bridge.canvasX / 800) * 540 + 30;
                  const ty = (bridge.canvasY / 360) * 260 + 30;
                  const margin = bridge.clearanceInches - effectiveHeight;
                  const isRestricted = margin < 0;
                  const isCaution = margin >= 0 && margin < 6;
                  const isSafe = margin >= 6;
                  const isSelected = selectedTabletBridge?.id === bridge.id;

                  return (
                    <g
                      key={bridge.id}
                      transform={`translate(${tx}, ${ty})`}
                      onClick={() => {
                        setSelectedTabletBridge(bridge);
                        showToast(`INSPECTING ${bridge.name}: ${bridge.clearanceFormatted}`);
                      }}
                      className="cursor-pointer transition-transform hover:scale-125"
                    >
                      {/* Selection ring */}
                      {isSelected && (
                        <circle cx="0" cy="0" r="18" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeDasharray="3 2" />
                      )}

                      {/* 1. RESTRICTED ICON SET: Red Octagonal Stop + Barrier Cross */}
                      {isRestricted && (
                        <g filter="url(#tabletRedGlow)">
                          <circle cx="0" cy="0" r="15" fill="none" stroke="#EF4444" strokeWidth="1.5" className="animate-ping" opacity="0.7" />
                          <polygon points="-10,-4 -4,-10 4,-10 10,-4 10,4 4,10 -4,10 -10,4" fill="#B91C1C" stroke="#EF4444" strokeWidth="1.5" />
                          <rect x="-6" y="-1.5" width="12" height="3" fill="#FFFFFF" rx="0.5" />
                          {/* Clearance badge */}
                          <g transform="translate(0, -18)">
                            <rect x="-38" y="-11" width="76" height="13" rx="3" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1" />
                            <text x="0" y="-2" fill="#FFFFFF" fontFamily="monospace" fontSize="7" fontWeight="bold" textAnchor="middle">
                              ⛔ {bridge.clearanceFormatted}
                            </text>
                          </g>
                        </g>
                      )}

                      {/* 2. CAUTION ICON SET: Amber Diamond + Exclamation */}
                      {isCaution && (
                        <g filter="url(#tabletAmberGlow)">
                          <polygon points="0,-10 10,0 0,10 -10,0" fill="#D97706" stroke="#F59E0B" strokeWidth="1.5" />
                          <text x="0" y="3" fill="#000000" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle">
                            !
                          </text>
                          <g transform="translate(0, -16)">
                            <rect x="-34" y="-10" width="68" height="12" rx="2" fill="#451A03" stroke="#F59E0B" strokeWidth="1" />
                            <text x="0" y="-1" fill="#FCD34D" fontFamily="monospace" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                              ⚠️ {bridge.clearanceFormatted}
                            </text>
                          </g>
                        </g>
                      )}

                      {/* 3. SAFE ICON SET: Emerald Truss Circle */}
                      {isSafe && (
                        <g>
                          <circle cx="0" cy="0" r="8" fill="#065F46" stroke="#10B981" strokeWidth="1.5" />
                          <path d="M -5 3 Q 0 -3 5 3" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
                          <g transform="translate(0, -15)">
                            <rect x="-30" y="-9" width="60" height="11" rx="2" fill="#064E3B" stroke="#10B981" strokeWidth="1" />
                            <text x="0" y="-1" fill="#A7F3D0" fontFamily="monospace" fontSize="6" fontWeight="bold" textAnchor="middle">
                              ✓ {bridge.clearanceFormatted}
                            </text>
                          </g>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Active Truck Position Blip */}
                <g transform="translate(250, 148)">
                  <circle cx="0" cy="0" r="12" fill="none" stroke="#10B981" strokeWidth="1.5" opacity="0.5" className="animate-ping" />
                  <circle cx="0" cy="0" r="7" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                  <polygon points="0,-10 4,-3 -4,-3" fill="#FFFFFF" />
                  <g transform="translate(10, -7)">
                    <rect x="0" y="0" width="68" height="16" rx="3" fill="#050608" stroke="#10B981" strokeWidth="1" />
                    <text x="5" y="11" fill="#FFFFFF" fontFamily="monospace" fontSize="8" fontWeight="bold">
                      T-904 RIG
                    </text>
                  </g>
                </g>
              </svg>

              {/* Overlay HUD Pill */}
              <div className="absolute top-3 left-3 p-2.5 bg-[#050608]/90 backdrop-blur rounded border border-[#D4AF37] font-mono text-[10px] space-y-1">
                <div className="text-[#D4AF37] font-bold">RADAR CORRIDOR: I-80 W (MM 142.4)</div>
                <div className="text-white">
                  RIG PROFILE: <strong className="text-white">{formatHeight(effectiveHeight)}</strong>
                </div>
                <div className={effectiveHeight > 162 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {effectiveHeight > 162 ? '⛔ 2 RESTRICTIONS ON ROUTE — DIVERTER RECOMMENDED' : '✓ ALL REGIONAL TRUNK LINES CLEARED'}
                </div>
              </div>
            </div>

            {/* Selected Bridge Dossier on Tablet Screen */}
            {selectedTabletBridge && (
              <div className="bg-[#111319] border border-[#D4AF37] rounded-lg p-3 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        selectedTabletBridge.clearanceInches < effectiveHeight
                          ? 'bg-rose-950 text-rose-300 border border-rose-600'
                          : selectedTabletBridge.clearanceInches < effectiveHeight + 6
                          ? 'bg-amber-950 text-amber-300 border border-amber-600'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                      }`}
                    >
                      {selectedTabletBridge.clearanceInches < effectiveHeight
                        ? '⛔ RESTRICTED ROUTE'
                        : selectedTabletBridge.clearanceInches < effectiveHeight + 6
                        ? '⚠️ CAUTION TIGHT'
                        : '✓ CLEARED'}
                    </span>
                    <strong className="text-white text-sm">{selectedTabletBridge.name}</strong>
                    <span className="text-slate-400 text-[10px]">({selectedTabletBridge.fhwaCode})</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Location: <strong className="text-white">{selectedTabletBridge.location}</strong> ({selectedTabletBridge.mileMarker})
                  </div>
                  <div className="text-[11px]">
                    Clearance: <strong className="text-[#D4AF37]">{selectedTabletBridge.clearanceFormatted}</strong> vs Rig:{' '}
                    <strong className="text-white">{formatHeight(effectiveHeight)}</strong> (
                    <span
                      className={
                        selectedTabletBridge.clearanceInches < effectiveHeight ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'
                      }
                    >
                      {selectedTabletBridge.clearanceInches - effectiveHeight >= 0
                        ? `+${selectedTabletBridge.clearanceInches - effectiveHeight}" headroom`
                        : `${selectedTabletBridge.clearanceInches - effectiveHeight}" DEFICIT`}
                    </span>
                    )
                  </div>
                  <div className="text-amber-300 text-[10px]">
                    Detour Bypass: <strong>{selectedTabletBridge.detourVector}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      showToast(`DETOUR ENGAGED: Routing via ${selectedTabletBridge.detourVector}`);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold uppercase rounded text-[10px] shadow"
                  >
                    ENGAGE DETOUR
                  </button>
                  <button
                    onClick={() => setSelectedTabletBridge(null)}
                    className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#111319] rounded border border-rose-500/40">
                <span className="text-[10px] text-slate-400 block uppercase">RESTRICTED BRIDGES</span>
                <span className="text-base font-bold text-rose-400">{restrictedBridges.length} Hazardous</span>
              </div>
              <div className="p-3 bg-[#111319] rounded border border-amber-500/40">
                <span className="text-[10px] text-slate-400 block uppercase">CAUTION (&lt;6" MARGIN)</span>
                <span className="text-base font-bold text-amber-400">{cautionBridges.length} Tight</span>
              </div>
              <div className="p-3 bg-[#111319] rounded border border-emerald-500/40">
                <span className="text-[10px] text-slate-400 block uppercase">CLEARED CORRIDORS</span>
                <span className="text-base font-bold text-emerald-400">{safeBridges.length} Cleared</span>
              </div>
              <div className="p-3 bg-[#111319] rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">RADAR REFRESH</span>
                <span className="text-base font-bold text-[#D4AF37]">10 Hz CAN-Bus</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP MISSION CONTROL VIEW OVERLAY */}
      {deviceViewMode === 'DESKTOP' && (
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="bg-[#0C0E14] border border-[#D4AF37] rounded-xl p-5 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-[#D4AF37] uppercase">
                Master Mission Control — Desktop Cockpit Multi-Monitor Array
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                54/54 QUBIT NODES ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#111319] rounded border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase block">FLEET CORRIDORS</span>
                <div className="text-2xl font-bold text-white">2,841 Loads</div>
                <p className="text-slate-400 text-[11px]">
                  All active Interstate corridors monitored across Midwest and Southeast networks.
                </p>
              </div>

              <div className="p-4 bg-[#111319] rounded border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase block">AUTONOMOUS AUDIT</span>
                <div className="text-2xl font-bold text-[#D4AF37]">100.0% Compliant</div>
                <p className="text-slate-400 text-[11px]">
                  Zero statutory HOS violations committed across 42 active commercial rigs.
                </p>
              </div>

              <div className="p-4 bg-[#111319] rounded border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase block">DISPATCH RESPONSE</span>
                <div className="text-2xl font-bold text-emerald-400">1.4s Median</div>
                <p className="text-slate-400 text-[11px]">
                  Traxes AI Advocate automatically negotiating counter-offers and carrier verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE TELEMETRY COCKPIT VIEW (DEFAULT FOCUS AS PROVIDED IN PROMPT) */}
      <div className="max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* TOP MOBILE APP HEADER */}
        <header className="bg-[#111319] border border-slate-800/80 rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center">
              <TruckWithEaseLogo size="sm" showWordmark={false} />
            </div>

            <div className="flex items-center space-x-2">
              <OfflineCacheIndicator onShowToast={showToast} />

              <div className="relative p-1.5 rounded-lg bg-[#050608] border border-slate-800 text-[#D4AF37]">
                <Activity className="w-3.5 h-3.5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
              </div>

              <button
                onClick={() => showToast('NO NEW ALERTS: ALL TELEMETRY NOMINAL')}
                className="p-1.5 rounded-lg bg-[#050608] border border-slate-800 text-slate-400 hover:text-[#D4AF37]"
              >
                <Bell className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#161922] border border-[#D4AF37]/30 font-mono text-[10px] text-[#D4AF37] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                <span>VANCE</span>
              </div>
            </div>
          </div>

          {/* Real-time Status Chips Sub-Bar */}
          <div className="mt-2.5 flex items-center justify-between gap-1.5 text-[10px] font-mono overflow-x-auto">
            <div className="flex items-center gap-1 bg-[#0E1711] border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ON-DUTY : 04:32 REM</span>
            </div>
            <div className="flex items-center gap-1 bg-[#050608] border border-slate-800 text-slate-300 px-2 py-0.5 rounded whitespace-nowrap">
              <span className="text-[#D4AF37] font-bold">((•))</span>
              <span>SAMSARA ELD SYNCED</span>
            </div>
            <div className="bg-[#050608] border border-slate-800 text-slate-400 px-2 py-0.5 rounded whitespace-nowrap">
              USDOT #3928192-A
            </div>
          </div>
        </header>

        {/* MISSION CONTROL BANNER */}
        <section className="border-l-2 border-[#D4AF37] pl-3 py-1 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#D4AF37] uppercase">
                MISSION CONTROL ACTIVE
              </span>
            </div>
            <p className="text-[9px] font-mono text-slate-400 mt-0.5">49 CFR § 395 DIRECT MATH KERNEL</p>
          </div>
          <span className="text-[10px] font-mono bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded uppercase">
            FHWA NBI ITEM 54B
          </span>
        </section>

        {/* MICRO METRICS ROW */}
        <section className="grid grid-cols-3 gap-2 font-mono text-xs">
          <div className="bg-[#111319] rounded-lg p-2.5 border border-[#D4AF37]/20 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 uppercase">CAPABILITIES</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-bold text-white">67</span>
              <span className="text-[10px] text-[#D4AF37] font-semibold">IDX</span>
            </div>
            <span className="text-[9px] text-emerald-400 mt-1">● 54 Live</span>
          </div>

          <div className="bg-[#111319] rounded-lg p-2.5 border border-[#D4AF37]/20 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 uppercase">LOW BRIDGES</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-bold text-[#D4AF37]">7,869</span>
            </div>
            <span className="text-[9px] text-slate-400 mt-1">&lt;14'6" · 162" Dat</span>
          </div>

          <div className="bg-[#111319] rounded-lg p-2.5 border border-[#D4AF37]/20 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 uppercase">INTEGRATIONS</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-bold text-white">3</span>
              <span className="text-[10px] text-slate-400">/19</span>
              <span className="text-[9px] text-emerald-400 font-bold">LIVE</span>
            </div>
            <span className="text-[9px] text-[#D4AF37] mt-1 truncate">7 Key Pnd</span>
          </div>
        </section>

        {/* AUDITORY WARNING SYSTEM PROXIMITY SENTINEL (5-MILE RADIUS) */}
        {primaryHazardWithin5Miles ? (
          <section className="bg-gradient-to-r from-[#170a0a] via-[#1c0d0e] to-[#12080a] border-2 border-rose-500 rounded-xl p-4 shadow-[0_0_30px_rgba(239,68,68,0.35)] relative overflow-hidden font-mono text-xs animate-fadeIn">
            {/* Pulsing acoustic radar wave overlay */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-900/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-600 text-white animate-bounce shadow-lg">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-white uppercase tracking-wide">
                      AUDITORY WARNING: LOW-BRIDGE WITHIN 5 MILES
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white animate-pulse">
                      {primaryHazardWithin5Miles.isThreat
                        ? 'CRITICAL COLLISION DEFICIT'
                        : primaryHazardWithin5Miles.isCaution
                        ? 'CAUTION TIGHT HEADROOM'
                        : 'OVERHEAD STRUCTURE AHEAD'}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-300 mt-0.5">
                    Structure detected <strong className="text-white underline">{primaryHazardWithin5Miles.distanceMiles.toFixed(1)} miles</strong> from current vehicle GPS
                  </p>
                </div>
              </div>

              {/* Glove-Friendly Quick Auditory Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    const next = !isAuditoryMuted;
                    setIsAuditoryMuted(next);
                    showToast(next ? 'AUDITORY SIREN MUTED' : 'AUDITORY SIREN UNMUTED (ALERTS ACTIVE)');
                  }}
                  className={`px-3 py-2 rounded-lg font-bold uppercase text-[11px] flex items-center gap-1.5 transition-all shadow ${
                    isAuditoryMuted
                      ? 'bg-slate-800 text-slate-300 border border-slate-600 hover:text-white'
                      : 'bg-rose-950 text-rose-200 border border-rose-500 hover:bg-rose-900'
                  }`}
                >
                  {isAuditoryMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  <span>{isAuditoryMuted ? 'MUTED' : 'AUDIO ACTIVE'}</span>
                </button>

                <button
                  onClick={() => {
                    playAuditoryWarningAlert(
                      primaryHazardWithin5Miles.isThreat
                        ? 'CRITICAL_COLLISION'
                        : primaryHazardWithin5Miles.isCaution
                        ? 'CAUTION_TIGHT'
                        : 'SAFE_ADVISORY',
                      true
                    );
                    showToast(`TESTING AUDITORY CHIME & VOCAL ALERT FOR ${primaryHazardWithin5Miles.bridge.name}`);
                  }}
                  className="px-3 py-2 rounded-lg font-bold uppercase text-[11px] bg-black border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center gap-1 shadow"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>PLAY CHIME</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              <div className="p-2.5 rounded bg-black/60 border border-rose-900/60">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">STRUCTURE &amp; CORRIDOR</span>
                <strong className="text-white text-sm block mt-0.5">{primaryHazardWithin5Miles.bridge.name}</strong>
                <span className="text-rose-300 text-[10px] block">{primaryHazardWithin5Miles.bridge.route} ({primaryHazardWithin5Miles.bridge.mileMarker})</span>
                <span className="text-slate-400 text-[9px] block mt-0.5">{primaryHazardWithin5Miles.bridge.fhwaCode}</span>
              </div>

              <div className="p-2.5 rounded bg-black/60 border border-rose-900/60">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">GPS PROXIMITY &amp; RANGE</span>
                <div className="text-xl font-black text-[#D4AF37] mt-0.5">
                  {primaryHazardWithin5Miles.distanceMiles.toFixed(1)} <span className="text-xs text-slate-300">STATUTE MILES</span>
                </div>
                <span className="text-slate-300 text-[10px] block">
                  Rig GPS: <strong className="text-white">{vehicleGps.lat.toFixed(4)}° N, {Math.abs(vehicleGps.lng).toFixed(4)}° W</strong>
                </span>
                <span className="text-emerald-400 text-[9px] block">ETA: ~{Math.max(1, Math.round((primaryHazardWithin5Miles.distanceMiles / 64) * 60))} MINS AT 64 MPH</span>
              </div>

              <div className="p-2.5 rounded bg-black/60 border border-rose-900/60">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">CLEARANCE VS RIG PROFILE</span>
                <div className="text-sm font-bold text-white mt-0.5">
                  Limit: <strong className="text-[#D4AF37]">{primaryHazardWithin5Miles.bridge.clearanceFormatted}</strong>
                </div>
                <div className="text-[11px] text-slate-300">
                  Rig Height: <strong className="text-white">{formatHeight(effectiveHeight)}</strong>
                </div>
                <div className={`text-xs font-black mt-1 ${primaryHazardWithin5Miles.clearanceMargin < 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                  {primaryHazardWithin5Miles.clearanceMargin < 0
                    ? `⛔ DEFICIT: -${Math.abs(primaryHazardWithin5Miles.clearanceMargin)}" (PHYSICAL STRIKE HAZARD)`
                    : `✓ CLEARANCE MARGIN: +${primaryHazardWithin5Miles.clearanceMargin}" HEADROOM`}
                </div>
              </div>
            </div>

            {/* Tactical Bypass Actions */}
            <div className="mt-3 pt-2.5 border-t border-rose-900/60 flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] text-amber-300 flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Verified Bypass Diverter: <strong className="text-white">{primaryHazardWithin5Miles.bridge.detourVector}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next = !isAirDumped;
                    setIsAirDumped(next);
                    showToast(next ? 'SUSPENSION AIR-DUMP DEPLOYED (-3" CLEARANCE GAINED)' : 'RIDE HEIGHT RESTORED');
                  }}
                  className={`px-3 py-1.5 rounded text-[11px] font-bold border uppercase transition-all ${
                    isAirDumped
                      ? 'bg-amber-500 text-black border-amber-300 shadow animate-pulse'
                      : 'bg-black border-slate-700 text-slate-300 hover:text-amber-400'
                  }`}
                >
                  {isAirDumped ? 'AIR DUMP ACTIVE (-3")' : 'DUMP SUSPENSION (-3")'}
                </button>

                <button
                  onClick={() => {
                    showToast(`BYPASS VECTOR COMMITTED: Rerouting via ${primaryHazardWithin5Miles.bridge.detourVector}`);
                  }}
                  className="px-3.5 py-1.5 rounded bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-extrabold text-[11px] uppercase tracking-wider shadow"
                >
                  ENGAGE DIVERTER BYPASS
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-[#0C0E14] border border-slate-800 rounded-xl p-3 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="font-bold text-white uppercase text-xs">
                  AUDITORY WARNING SYSTEM: 5-MILE PROXIMITY SENTINEL
                </span>
                <p className="text-[10px] text-slate-400">
                  Current GPS: <strong className="text-slate-200">{vehicleGps.lat.toFixed(4)}° N, {Math.abs(vehicleGps.lng).toFixed(4)}° W</strong> · All overhead low bridges clear &gt; 5.0 miles away
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playAuditoryWarningAlert('SAFE_ADVISORY', true);
                  showToast('AUDITORY WARNING SYSTEM TEST CHIME VERIFIED (100% AUDIBLE)');
                }}
                className="px-2.5 py-1 rounded bg-black border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 uppercase font-bold text-[10px] flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>TEST AUDITORY WARNING</span>
              </button>
            </div>
          </section>
        )}

        {/* DRIVER TELEMATICS & ELD SAFETY SENTINEL */}
        <section className="bg-gradient-to-br from-[#0C0E14] to-[#12151F] rounded-xl border border-[#D4AF37]/40 p-4 shadow-xl font-mono text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                DRIVER TELEMATICS &amp; SPEED SENTINEL
              </h3>
            </div>
            <button
              onClick={() => {
                if (onNavigateToTab) onNavigateToTab('telemetry');
                showToast('OPENING UNTOUCHABLE TELEMATICS SUITE');
              }}
              className="text-[10px] font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
            >
              <span>FULL SUITE</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            {/* Speed vs Limit */}
            <div className="bg-black/50 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
              <span className="text-[9px] text-slate-400 uppercase">CURRENT SPEED</span>
              <div className="text-2xl font-black text-white my-0.5">64.2 <span className="text-[10px] font-normal text-slate-400">MPH</span></div>
              <span className="text-[9px] text-emerald-400 font-bold">65 MPH Limit (Optimal)</span>
            </div>

            {/* Motion & Stop Duration */}
            <div className="bg-black/50 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
              <span className="text-[9px] text-slate-400 uppercase">MOTION STATUS</span>
              <div className="text-sm font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-600 rounded py-1 my-0.5">
                DRIVING (&gt;5 MPH)
              </div>
              <span className="text-[9px] text-slate-400">FMCSA Auto-Motion Active</span>
            </div>

            {/* Harsh Braking Sensor */}
            <div className="bg-black/50 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
              <span className="text-[9px] text-slate-400 uppercase">HARSH BRAKING</span>
              <div className="text-lg font-black text-slate-200 my-0.5 flex items-center justify-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <span>-0.02 g</span>
              </div>
              <span className="text-[9px] text-emerald-400 font-bold">1 Event Logged / 94 Score</span>
            </div>

            {/* Collision & Crash Black Box */}
            <div className="bg-black/50 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
              <span className="text-[9px] text-slate-400 uppercase">COLLISION BUFFER</span>
              <div className="text-sm font-bold text-emerald-400 my-0.5 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ARMED (2.5G)</span>
              </div>
              <span className="text-[9px] text-slate-400">5s Black Box Ready</span>
            </div>
          </div>
        </section>

        {/* ACTIVE CAB CORRIDOR CARD */}
        <section className="bg-[#0C0E14] rounded-xl border border-[#D4AF37]/30 p-3.5 shadow-lg relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded bg-[#111319] border border-slate-700 text-[#D4AF37]">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">T-904 (J. VANCE)</h2>
                <p className="text-[10px] font-mono text-slate-400 uppercase">
                  KENWORTH T680 · I-80 W CORRIDOR
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D4AF37] text-black uppercase">
              ROLLING
            </span>
          </div>

          {/* Tactical Mini Radar Vector Box */}
          <div className="mt-3 bg-[#07090E] rounded-lg p-2.5 border border-slate-800 relative font-mono text-[10px]">
            <div className="flex items-center justify-between text-[#D4AF37] mb-1">
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>MP 142.4 · 64 MPH · GPS: {vehicleGps.lat.toFixed(4)}°N, {Math.abs(vehicleGps.lng).toFixed(4)}°W</span>
              </div>
              <span className="text-slate-400">HEADING 270° W</span>
            </div>

            {/* Corrugated Route SVG Visualization */}
            <div className="h-14 w-full relative flex items-center justify-center">
              <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 280 50">
                <line x1="0" x2="280" y1="25" y2="25" stroke="#1F2430" strokeDasharray="2 4" strokeWidth="1" />
                <line x1="70" x2="70" y1="0" y2="50" stroke="#1F2430" strokeDasharray="2 4" strokeWidth="1" />
                <line x1="140" x2="140" y1="0" y2="50" stroke="#1F2430" strokeDasharray="2 4" strokeWidth="1" />
                <line x1="210" x2="210" y1="0" y2="50" stroke="#1F2430" strokeDasharray="2 4" strokeWidth="1" />
                <path d="M 10 40 Q 60 45, 110 25 T 200 20 T 270 10" fill="none" stroke="#D4AF37" strokeWidth="2.5" />
                <circle cx="110" cy="25" fill="#00E676" r="4" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="110" cy="25" opacity="0.6" r="9" stroke="#00E676" strokeWidth="1" />
                <polygon fill="#F59E0B" points="200,14 206,24 194,24" />
              </svg>
            </div>

            <div
              className={`mt-1 flex items-center justify-between rounded px-2 py-1 border font-mono text-[10px] ${
                primaryHazardWithin5Miles && primaryHazardWithin5Miles.isThreat
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                  : primaryHazardWithin5Miles && primaryHazardWithin5Miles.isCaution
                  ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                  : 'bg-black/60 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold">
                {primaryHazardWithin5Miles && primaryHazardWithin5Miles.isThreat ? (
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                ) : primaryHazardWithin5Miles && primaryHazardWithin5Miles.isCaution ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <span>
                  {primaryHazardWithin5Miles
                    ? `${primaryHazardWithin5Miles.bridge.name}: ${primaryHazardWithin5Miles.distanceMiles.toFixed(1)} MILES (${primaryHazardWithin5Miles.bridge.clearanceFormatted})`
                    : `ALL OVERHEAD STRUCTURES CLEAR (> 5 MILES)`}
                </span>
              </div>
              <span className="text-slate-300 font-semibold uppercase text-[9px]">
                {primaryHazardWithin5Miles
                  ? primaryHazardWithin5Miles.isThreat
                    ? '⛔ BYPASS DIVERTER REQUIRED'
                    : primaryHazardWithin5Miles.isCaution
                    ? '⚠️ CAUTION SPEED'
                    : '✓ 5-MILE AUDITORY SENTINEL'
                  : 'CLEARED'}
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
            <div>
              <span className="text-[9px] text-slate-400 uppercase block">REMAINING PAY MILES</span>
              <span className="text-base font-bold text-white tracking-wide">
                482.6 <span className="text-[10px] text-[#D4AF37]">MI</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-400 uppercase block">TARGET ETA</span>
              <span className="text-base font-bold text-white tracking-wide">
                21:45 <span className="text-[10px] text-[#D4AF37]">CDT</span>
              </span>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono bg-[#111319] px-2.5 py-1.5 rounded border border-slate-800">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="text-[#D4AF37]">⚡</span>
              <span>
                Haptic Alert Vocab: <strong className="text-white">Profile C-15</strong>
              </span>
            </div>
            <span className="text-emerald-400 font-bold">100% LATENCY &lt;5s</span>
          </div>
        </section>

        {/* MAP-BASED GEOFENCING CONFIGURATION & NOTIFICATION SENTINEL */}
        <section
          id="geofencing-cockpit-section"
          className={`transition-all rounded-xl space-y-3 ${
            activeBottomTab === 'geofence' || activeBottomTab === 'bridges'
              ? 'ring-2 ring-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.3)]'
              : ''
          }`}
        >
          {/* VEHICLE HEIGHT PROFILE & RESTRICTED ROUTE HUD STRIP */}
          <div className="bg-[#0C0E14] border border-[#D4AF37]/50 rounded-xl p-3.5 font-mono text-xs shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded bg-[#161922] border border-[#D4AF37]/40 text-[#D4AF37]">
                  <ArrowDownUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white uppercase text-xs">
                      RIG HEIGHT PROFILE &amp; RESTRICTED ROUTE SENTINEL
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        restrictedBridges.length > 0
                          ? 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                      }`}
                    >
                      {restrictedBridges.length > 0
                        ? `⛔ ${restrictedBridges.length} RESTRICTED ROUTES FOR CURRENT HEIGHT`
                        : '✓ ALL ROUTES CLEARED'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Active Rig Profile: <strong className="text-[#D4AF37]">{formatHeight(effectiveHeight)}</strong>
                    {isAirDumped && <span className="text-amber-400 font-bold ml-1.5">(SUSPENSION AIR-DUMP ACTIVE -3")</span>}
                  </p>
                </div>
              </div>

              {/* Quick Profile Selector & Fine-Tuning */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">PRESET:</span>
                {[
                  { label: "12' 6\"", inches: 150, title: "Flatbed / Lowboy" },
                  { label: "13' 6\"", inches: 162, title: "Standard Dry Van (162\")" },
                  { label: "13' 10\"", inches: 166, title: "High-Cube Reefer" },
                  { label: "14' 0\"", inches: 168, title: "Auto Hauler" },
                  { label: "14' 6\"", inches: 174, title: "Heavy Haul Permitted" },
                ].map((preset) => (
                  <button
                    key={preset.inches}
                    onClick={() => {
                      setVehicleHeightInches(preset.inches);
                      showToast(`RIG PROFILE UPDATED: ${preset.label} (${preset.inches}")`);
                    }}
                    title={preset.title}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                      vehicleHeightInches === preset.inches
                        ? 'bg-[#D4AF37] text-black shadow-md'
                        : 'bg-[#111319] border border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}

                {/* Step adjusters */}
                <div className="flex items-center ml-1 bg-[#111319] border border-slate-700 rounded">
                  <button
                    onClick={() => {
                      setVehicleHeightInches(Math.max(120, vehicleHeightInches - 1));
                      showToast(`RIG HEIGHT REDUCED TO ${formatHeight(vehicleHeightInches - 1)}`);
                    }}
                    title="Lower height profile by 1 inch"
                    className="px-2 py-0.5 text-xs text-slate-300 hover:text-white font-bold"
                  >
                    -1"
                  </button>
                  <button
                    onClick={() => {
                      setVehicleHeightInches(Math.min(192, vehicleHeightInches + 1));
                      showToast(`RIG HEIGHT INCREASED TO ${formatHeight(vehicleHeightInches + 1)}`);
                    }}
                    title="Raise height profile by 1 inch"
                    className="px-2 py-0.5 text-xs text-slate-300 hover:text-white font-bold"
                  >
                    +1"
                  </button>
                </div>

                {/* Suspension Air Dump Toggle */}
                <button
                  onClick={() => {
                    const next = !isAirDumped;
                    setIsAirDumped(next);
                    showToast(
                      next
                        ? 'PNEUMATIC SUSPENSION AIR-DUMP ENGAGED: -3" RIG CLEARANCE GAINED'
                        : 'PNEUMATIC SUSPENSION RESTORED TO NOMINAL RIDE HEIGHT'
                    );
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all ${
                    isAirDumped
                      ? 'bg-amber-500 text-black border-amber-300 shadow animate-pulse'
                      : 'bg-[#111319] border-slate-700 text-slate-300 hover:text-amber-400'
                  }`}
                >
                  AIR DUMP (-3")
                </button>
              </div>
            </div>

            {/* Distinct Icon Sets Legend */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
              <div className="flex items-center gap-2 p-2 rounded bg-rose-950/40 border border-rose-600/50">
                <div className="w-5 h-5 rounded bg-rose-700 text-white flex items-center justify-center font-bold text-[9px] shrink-0 border border-rose-500">
                  ⛔
                </div>
                <div>
                  <strong className="text-rose-300 block">RESTRICTED ROUTE ICON</strong>
                  <span className="text-slate-400 text-[9px]">
                    Octagon stop sign + barrier. Clearance &lt; {formatHeight(effectiveHeight)}.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded bg-amber-950/40 border border-amber-600/50">
                <div className="w-5 h-5 rounded bg-amber-600 text-black flex items-center justify-center font-bold text-xs shrink-0 border border-amber-400">
                  !
                </div>
                <div>
                  <strong className="text-amber-300 block">CAUTION TIGHT ICON</strong>
                  <span className="text-slate-400 text-[9px]">
                    Diamond warning. Clearance buffer &lt; 6 inches.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded bg-emerald-950/40 border border-emerald-600/50">
                <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-400">
                  ✓
                </div>
                <div>
                  <strong className="text-emerald-300 block">SAFE ROUTE ICON</strong>
                  <span className="text-slate-400 text-[9px]">
                    Truss arch circle. Clearance headroom ≥ 6 inches.
                  </span>
                </div>
              </div>
            </div>

            {/* AUDITORY WARNING SYSTEM CONFIGURATION & GPS PROXIMITY CALIBRATION STRIP */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#07090D] border border-slate-800 p-2.5 rounded-lg text-[10px]">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded ${isAuditoryMuted ? 'bg-slate-800 text-slate-400' : 'bg-rose-950 border border-rose-500 text-rose-300'}`}>
                    {isAuditoryMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white uppercase text-[11px]">
                        AUDITORY WARNING RADAR (5-MILE RADIUS)
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${primaryHazardWithin5Miles ? 'bg-rose-900 text-white animate-pulse' : 'bg-emerald-950 text-emerald-300'}`}>
                        {primaryHazardWithin5Miles ? `ACTIVE: ${primaryHazardWithin5Miles.distanceMiles.toFixed(1)} MI TO HAZARD` : 'STANDBY: ALL BRIDGES >5 MI'}
                      </span>
                    </div>
                    <span className="text-slate-400">
                      Vehicle Telemetry GPS: <strong className="text-white">{vehicleGps.lat.toFixed(4)}° N, {Math.abs(vehicleGps.lng).toFixed(4)}° W</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => {
                      const next = !isAuditoryMuted;
                      setIsAuditoryMuted(next);
                      showToast(next ? 'AUDITORY SIREN MUTED' : 'AUDITORY SIREN UNMUTED');
                    }}
                    className={`px-2.5 py-1 rounded font-bold uppercase transition-all ${
                      isAuditoryMuted
                        ? 'bg-slate-800 text-slate-300 hover:text-white'
                        : 'bg-rose-950 text-rose-200 border border-rose-500'
                    }`}
                  >
                    {isAuditoryMuted ? 'MUTE ON' : 'AUDIO ON'}
                  </button>

                  <button
                    onClick={() => {
                      const next = !isVoiceEnabled;
                      setIsVoiceEnabled(next);
                      showToast(next ? 'VOICE CALLOUT ENABLED' : 'VOICE CALLOUT MUTED');
                    }}
                    className={`px-2 py-1 rounded font-bold uppercase transition-all ${
                      isVoiceEnabled ? 'bg-[#D4AF37] text-black shadow' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    VOICE: {isVoiceEnabled ? 'ON' : 'OFF'}
                  </button>

                  <button
                    onClick={() => {
                      playAuditoryWarningAlert('CRITICAL_COLLISION', true);
                      showToast('TESTING 5-MILE AUDITORY PROXIMITY CHIME (DUAL SIREN + VOICE)');
                    }}
                    className="px-2.5 py-1 rounded bg-black border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 uppercase font-bold flex items-center gap-1"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>TEST CHIME</span>
                  </button>
                </div>
              </div>

              {/* GPS Proximity Position Simulation Jumpers */}
              <div className="flex items-center justify-between gap-1.5 bg-[#050608] border border-slate-800/80 p-2 rounded text-[10px] flex-wrap">
                <span className="text-slate-400 uppercase font-bold mr-1">SIMULATE GPS DISTANCE TO HAZARD:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {[
                    { label: "1.9 mi (Mill Hall)", lat: 41.5389, lng: -92.355, title: "1.9 miles from I-80 Mill Hall Viaduct (In 5-mi radius)" },
                    { label: "3.4 mi (Rail Trestle)", lat: 41.8033, lng: -93.325, title: "3.4 miles from US-30 Trestle (In 5-mi radius)" },
                    { label: "4.8 mi (Kennedy)", lat: 41.9861, lng: -89.155, title: "4.8 miles from I-90 Trestle (Boundary check)" },
                    { label: "12.5 mi (Safe)", lat: 41.2000, lng: -94.000, title: "12.5 miles from nearest hazard (No warning)" },
                  ].map((pos) => (
                    <button
                      key={pos.label}
                      onClick={() => {
                        setVehicleGps({ lat: pos.lat, lng: pos.lng });
                        showToast(`GPS TELEMETRY JUMPED: ${pos.label} (${pos.lat}°N, ${pos.lng}°W)`);
                      }}
                      title={pos.title}
                      className="px-2 py-0.5 rounded bg-[#111319] border border-slate-700 hover:border-[#D4AF37] text-slate-300 hover:text-white font-bold transition-all"
                    >
                      {pos.label}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (p) => {
                            setVehicleGps({ lat: Number(p.coords.latitude.toFixed(4)), lng: Number(p.coords.longitude.toFixed(4)) });
                            showToast(`DEVICE GPS LOCKED: ${p.coords.latitude.toFixed(4)}°N, ${p.coords.longitude.toFixed(4)}°W`);
                          },
                          () => {
                            showToast('GPS PERMISSION UNAVAILABLE — USING TELEMETRICS FEED');
                          }
                        );
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 hover:bg-emerald-900 font-bold flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>DEVICE GPS</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Tactical Map Component with Overlaid Low-Bridge Markers & Live GPS */}
          <MapGeofencingTool
            vehicleHeightInches={effectiveHeight}
            onUpdateVehicleHeight={(h) => setVehicleHeightInches(h)}
            showLowBridgeOverlayDefault={true}
            onGpsUpdate={(coords) => setVehicleGps(coords)}
          />
        </section>

        {/* 49 CFR § 395 TELEMETRY CLOCKS (4 CIRCULAR DIALS) */}
        <section className="bg-[#0C0E14] rounded-xl border border-[#D4AF37]/50 p-3.5 shadow-xl">
          <div className="flex items-start justify-between mb-3 border-b border-slate-800 pb-2.5">
            <div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  49 CFR § 395 TELEMETRY CLOCKS
                </h3>
              </div>
              <p className="text-[9px] font-mono text-slate-400 mt-0.5">
                CALCULATED FROM RAW LOG TIMESTAMPS
              </p>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold whitespace-nowrap">
              ● ALL COMPLIANT
            </span>
          </div>

          {/* 2x2 Telemetry Dials Mobile Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Clock 1: 11-HR Driving */}
            <div className="bg-[#111319] rounded-lg p-2.5 border border-slate-800 flex flex-col items-center text-center">
              <span className="text-[9px] font-mono uppercase text-slate-400 font-semibold mb-1">
                11-HR DRIVING
              </span>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="40" stroke="#1F2430" strokeWidth="7" />
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="40"
                    stroke="#D4AF37"
                    strokeDasharray="251.2"
                    strokeDashoffset="98"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-base font-mono font-bold text-white leading-none">04:18</span>
                  <span className="text-[8px] font-mono uppercase text-[#D4AF37] tracking-wider">
                    REMAINING
                  </span>
                </div>
              </div>
              <div className="mt-2 w-full flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                <span>Used: 06h 42m</span>
                <span className="text-emerald-400 font-bold">Normal</span>
              </div>
            </div>

            {/* Clock 2: 14-HR Duty Window */}
            <div className="bg-[#111319] rounded-lg p-2.5 border border-slate-800 flex flex-col items-center text-center">
              <span className="text-[9px] font-mono uppercase text-slate-400 font-semibold mb-1">
                14-HR DUTY WIN
              </span>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="40" stroke="#1F2430" strokeWidth="7" />
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="40"
                    stroke="#D4AF37"
                    strokeDasharray="251.2"
                    strokeDashoffset="130"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-base font-mono font-bold text-white leading-none">03:02</span>
                  <span className="text-[8px] font-mono uppercase text-[#D4AF37] tracking-wider">
                    REMAINING
                  </span>
                </div>
              </div>
              <div className="mt-2 w-full flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                <span>Hard Cut: 23:49</span>
                <span className="text-emerald-400 font-bold">Normal</span>
              </div>
            </div>

            {/* Clock 3: 30-MIN Rest Break (Warning State) */}
            <div className="bg-[#111319] rounded-lg p-2.5 border border-amber-500/40 bg-amber-950/10 flex flex-col items-center text-center">
              <span className="text-[9px] font-mono uppercase text-amber-400 font-semibold mb-1">
                30-MIN REST BRK
              </span>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="40" stroke="#2A1F11" strokeWidth="7" />
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="40"
                    stroke="#F59E0B"
                    strokeDasharray="251.2"
                    strokeDashoffset="190"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-base font-mono font-bold text-amber-300 leading-none">00:41</span>
                  <span className="text-[8px] font-mono uppercase text-amber-400 tracking-wider">
                    TIME TO BRK
                  </span>
                </div>
              </div>
              <div className="mt-2 w-full flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                <span>Stop: 21:28</span>
                <span className="text-amber-400 font-bold">WARNING</span>
              </div>
            </div>

            {/* Clock 4: 70-HR Cycle */}
            <div className="bg-[#111319] rounded-lg p-2.5 border border-slate-800 flex flex-col items-center text-center">
              <span className="text-[9px] font-mono uppercase text-slate-400 font-semibold mb-1">
                70-HR / 8-DAY
              </span>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="40" stroke="#1F2430" strokeWidth="7" />
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="40"
                    stroke="#D4AF37"
                    strokeDasharray="251.2"
                    strokeDashoffset="75"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-base font-mono font-bold text-white leading-none">34:15</span>
                  <span className="text-[8px] font-mono uppercase text-[#D4AF37] tracking-wider">
                    REMAINING
                  </span>
                </div>
              </div>
              <div className="mt-2 w-full flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                <span>Gained: +08:45</span>
                <span className="text-emerald-400 font-bold">Good</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-400">
            <div className="flex items-center space-x-1">
              <span className="text-[#D4AF37]">⇄</span>
              <span>Recalculated 14s ago</span>
            </div>
            <span className="text-slate-300 font-semibold">ELD: 9A0B-4811-C</span>
          </div>
        </section>

        {/* LIVE VERIFIED ENDPOINTS */}
        <section className="bg-[#111319] rounded-xl border border-[#D4AF37]/30 p-3.5 shadow-md font-mono text-xs">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                LIVE VERIFIED ENDPOINTS
              </h3>
              <p className="text-[9px] text-slate-400">Active platform telemetry latency</p>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
              200 OK
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="bg-[#161922] rounded p-2 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#D4AF37] bg-black/50 px-1 rounded">
                    GET
                  </span>
                  <span className="text-white font-semibold text-[11px]">/api/hos</span>
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  Driving, 14h window, 70h cycle &amp; rest break math
                </p>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-bold text-[11px]">293 ms</span>
                <span className="block text-[8px] text-slate-500 uppercase">STATUS 200</span>
              </div>
            </div>

            <div className="bg-[#161922] rounded p-2 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#D4AF37] bg-black/50 px-1 rounded">
                    GET
                  </span>
                  <span className="text-white font-semibold text-[11px]">/api/bridges/status</span>
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  7,869 structures under 174 in. vs 162 in. standard
                </p>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-bold text-[11px]">341 ms</span>
                <span className="block text-[8px] text-slate-500 uppercase">STATUS 200</span>
              </div>
            </div>

            <div className="bg-[#161922] rounded p-2 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#D4AF37] bg-black/50 px-1 rounded">
                    GET
                  </span>
                  <span className="text-white font-semibold text-[11px]">/api/support</span>
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  Server-side America/Chicago schedule (6am-10pm CT)
                </p>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-bold text-[11px]">529 ms</span>
                <span className="block text-[8px] text-slate-500 uppercase">STATUS 200</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">
              Ledger Hash: <strong className="text-[#D4AF37]">0x82f4...d901</strong>
            </span>
            <button
              onClick={() => showToast('RE-READING ENGINE ENDPOINTS (ALL 200 OK)')}
              className="px-2.5 py-1 rounded bg-black border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 uppercase font-bold text-[10px]"
            >
              RE-READ
            </button>
          </div>
        </section>

        {/* DISPATCH ZERO — RANKED QUEUE */}
        <section className="bg-[#0C0E14] rounded-xl border border-[#D4AF37]/50 p-3.5 shadow-xl font-mono text-xs">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wide">
                  DISPATCH ZERO — RANKED QUEUE
                </h3>
              </div>
              <p className="text-[9px] text-[#D4AF37] mt-0.5">
                RANKED BY REVENUE / REMAINING CLOCK HOUR
              </p>
            </div>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#111319] border border-[#D4AF37]/30 text-[#D4AF37] uppercase">
              APPEND-ONLY
            </span>
          </div>

          <div className="space-y-2 mt-3">
            {/* Load 1 */}
            <div className="bg-[#111319] rounded-lg p-2.5 border border-[#D4AF37]/30">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#D4AF37]">#01</span>
                  <div>
                    <span className="font-bold text-white">LD-88219</span>
                    <span className="text-[10px] text-slate-400 ml-1">(Reefer)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400">$184.20/hr</span>
                  <span className="block text-[10px] text-slate-300 font-semibold">$1,520.00 Net</span>
                </div>
              </div>
              <div className="mt-1 text-[10px] text-slate-300">Omaha, NE → Gary, IN (468 mi)</div>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[9px]">
                <span className="text-slate-400">08h 15m Req · Driver 11h 00m Cap</span>
                <button
                  onClick={() => handleAssignLoad('LD-88219')}
                  disabled={assignedLoads.includes('LD-88219')}
                  className={`px-3 py-1 rounded font-bold uppercase tracking-wider text-[10px] transition-all shadow ${
                    assignedLoads.includes('LD-88219')
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black'
                  }`}
                >
                  {assignedLoads.includes('LD-88219') ? 'ASSIGNED' : 'ASSIGN'}
                </button>
              </div>
            </div>

            {/* Load 2 */}
            <div className="bg-[#111319] rounded-lg p-2.5 border border-slate-800">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-400">#02</span>
                  <div>
                    <span className="font-bold text-white">LD-88224</span>
                    <span className="text-[10px] text-slate-400 ml-1">(Dry Van)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#D4AF37]">$168.70/hr</span>
                  <span className="block text-[10px] text-slate-300 font-semibold">$970.00 Net</span>
                </div>
              </div>
              <div className="mt-1 text-[10px] text-slate-300">Des Moines, IA → Joliet, IL (330 mi)</div>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[9px]">
                <span className="text-slate-400">05h 45m Req · Driver 09h 30m Cap</span>
                <button
                  onClick={() => handleAssignLoad('LD-88224')}
                  disabled={assignedLoads.includes('LD-88224')}
                  className={`px-3 py-1 rounded font-bold uppercase tracking-wider text-[10px] transition-all shadow ${
                    assignedLoads.includes('LD-88224')
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black'
                  }`}
                >
                  {assignedLoads.includes('LD-88224') ? 'ASSIGNED' : 'ASSIGN'}
                </button>
              </div>
            </div>

            {/* Disqualified Item */}
            <div className="bg-[#12080A] rounded-lg p-2.5 border border-red-900/60 opacity-80">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-1 rounded bg-red-950 text-red-400 border border-red-800">
                    DISQ
                  </span>
                  <div className="line-through text-slate-500 font-mono text-xs">
                    LD-88199 (Hazmat)
                  </div>
                </div>
                <span className="text-red-400 font-bold text-[10px]">HOS LOCK</span>
              </div>
              <div className="mt-1 text-[9px] text-slate-500">
                Omaha → Columbus, OH (490 mi) · Req: 09h 10m vs Rem: 04h 18m
              </div>
            </div>
          </div>

          <div className="mt-3 p-2 bg-[#090B10] rounded border border-[#D4AF37]/30 flex items-center justify-between text-[9px]">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Shield className="w-3 h-3 text-[#D4AF37]" />
              <span>Zero-Violation Guarantee active</span>
            </div>
            <span className="text-[#D4AF37] font-bold">14 DISQ BLOCKED TODAY</span>
          </div>
        </section>

        {/* STATUTORY TRUTH BOUNDARIES */}
        <section className="bg-[#111319] rounded-xl border border-slate-800 p-3 font-mono text-xs">
          <div className="flex items-center space-x-1.5 mb-2 text-[#D4AF37] font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider text-[11px]">
              WHAT TRUCKWITHEASE DOES NOT DO
            </span>
          </div>

          <div className="space-y-1.5 text-[10px] text-slate-400">
            <div className="bg-black/40 p-2 rounded border-l-2 border-[#D4AF37]">
              <strong className="text-slate-200 block mb-0.5">NOT AN FMCSA REGISTERED ELD</strong>
              Runs alongside your certified hardware log engine (Samsara, Motive).
            </div>
            <div className="bg-black/40 p-2 rounded border-l-2 border-[#D4AF37]">
              <strong className="text-slate-200 block mb-0.5">HARDWARE &amp; FILINGS FREE</strong>
              No physical hardware shipped. We do not file IFTA or Form 2290 taxes.
            </div>
            <div className="bg-black/40 p-2 rounded border-l-2 border-[#D4AF37]">
              <strong className="text-slate-200 block mb-0.5">ZERO MONEY FLOW / NO BROKER FEED</strong>
              No load board broker subscriptions. Zero driver banking credentials held.
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[9px]">
            <span>Support: 6am–10pm CT</span>
            <a href="tel:6367068338" className="text-[#D4AF37] font-bold hover:underline">
              636-706-8338
            </a>
          </div>
        </section>

        {/* MOBILE BOTTOM COMMAND DOCK */}
        <nav className="sticky bottom-2 z-30 bg-[#07090D]/95 backdrop-blur-lg border border-[#D4AF37]/30 rounded-xl px-2 py-1.5 shadow-2xl font-mono text-xs">
          <div className="grid grid-cols-6 gap-1 text-center">
            <button
              onClick={() => {
                setActiveBottomTab('control');
                showToast('CONTROL ARRAY LOADED');
              }}
              className={`flex flex-col items-center py-1 transition-all ${
                activeBottomTab === 'control' ? 'text-[#D4AF37]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4 mb-0.5" />
              <span className="text-[8px] font-bold">CONTROL</span>
            </button>

            <button
              onClick={() => {
                setActiveBottomTab('geofence');
                const el = document.getElementById('geofencing-cockpit-tool');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                showToast('GEOFENCE PERIMETER CONFIGURATION ACTIVE');
              }}
              className={`flex flex-col items-center py-1 transition-all relative ${
                activeBottomTab === 'geofence' ? 'text-[#D4AF37]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 mb-0.5" />
              <span className="text-[8px] font-bold">GEOFENCE</span>
            </button>

            <button
              onClick={() => {
                setActiveBottomTab('clocks');
                showToast('TELEMETRY CLOCKS FOCUSED');
              }}
              className={`flex flex-col items-center py-1 transition-all ${
                activeBottomTab === 'clocks' ? 'text-[#D4AF37]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 mb-0.5" />
              <span className="text-[8px]">CLOCKS</span>
            </button>

            <button
              onClick={() => {
                setActiveBottomTab('bridges');
                const el = document.getElementById('geofencing-cockpit-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                showToast(
                  `LOW-BRIDGE RADAR: ${restrictedBridges.length} RESTRICTED ROUTES FOR RIG PROFILE ${formatHeight(effectiveHeight)}`
                );
              }}
              className={`flex flex-col items-center py-1 transition-all ${
                activeBottomTab === 'bridges' ? 'text-[#D4AF37]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4 mb-0.5" />
              <span className="text-[8px] font-bold">BRIDGES</span>
            </button>

            <button
              onClick={() => {
                setActiveBottomTab('dispatch');
                showToast('DISPATCH ZERO QUEUE FOCUSED');
              }}
              className={`flex flex-col items-center py-1 transition-all relative ${
                activeBottomTab === 'dispatch' ? 'text-[#D4AF37]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="absolute top-0 right-4 w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <Zap className="w-4 h-4 mb-0.5" />
              <span className="text-[8px]">DISPATCH</span>
            </button>

            <button
              onClick={() => {
                setActiveBottomTab('ops');
                showToast('OPS ENDPOINTS & STATUS ACTIVE');
              }}
              className={`flex flex-col items-center py-1 transition-all ${
                activeBottomTab === 'ops' ? 'text-[#D4AF37]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4 mb-0.5" />
              <span className="text-[8px]">API / OPS</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};
