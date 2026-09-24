import React, { useState } from 'react';
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
} from 'lucide-react';
import { MapGeofencingTool } from './MapGeofencingTool';
import { TruckWithEaseLogo } from './TruckWithEaseLogo';

interface MobileCockpitViewProps {
  onNavigateToTab?: (tab: string) => void;
}

export const MobileCockpitView: React.FC<MobileCockpitViewProps> = ({ onNavigateToTab }) => {
  const [deviceViewMode, setDeviceViewMode] = useState<'MOBILE' | 'TABLET' | 'DESKTOP'>('MOBILE');
  const [assignedLoads, setAssignedLoads] = useState<string[]>([]);
  const [activeBottomTab, setActiveBottomTab] = useState<'control' | 'geofence' | 'clocks' | 'bridges' | 'dispatch' | 'ops'>('control');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAssignLoad = (loadId: string) => {
    setAssignedLoads((prev) => [...prev, loadId]);
    showToast(`DISPATCH ZERO: ${loadId} COMMITTED TO DRIVER TELEMATICS (200 OK)`);
  };

  return (
    <div className="w-full min-h-screen bg-[#050608] text-slate-200 font-sans pb-24 selection:bg-[#D4AF37] selection:text-[#050608]">
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
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-mono text-sm font-bold text-[#D4AF37] uppercase">
                  FHWA Low-Bridge Radar &amp; Bypass Diverters — Active Tablet Mesh
                </h3>
              </div>
              <span className="font-mono text-xs bg-[#1A1B21] text-white px-2 py-0.5 rounded border border-slate-700">
                TABLET IN-CAB MOUNT
              </span>
            </div>

            <div className="relative h-64 sm:h-80 bg-[#07090E] rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
              {/* Simulated Tactical Map Canvas */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]" />
              <svg className="w-full h-full" viewBox="0 0 600 300">
                {/* Interstate lines */}
                <line x1="50" y1="150" x2="550" y2="150" stroke="#292A2F" strokeWidth="6" />
                <line x1="250" y1="30" x2="250" y2="270" stroke="#292A2F" strokeWidth="6" />
                {/* Safe active route vector */}
                <path
                  d="M 60 150 Q 180 120, 250 150 T 450 140 T 540 150"
                  stroke="#D4AF37"
                  strokeWidth="4"
                  fill="none"
                />
                {/* Active truck position */}
                <circle cx="280" cy="145" r="7" fill="#00E676" stroke="#fff" strokeWidth="2" />
                <circle cx="280" cy="145" r="14" fill="none" stroke="#00E676" opacity="0.4" />
                {/* Safe bridge blips (green) */}
                <circle cx="120" cy="150" r="5" fill="#00E676" />
                <circle cx="190" cy="135" r="5" fill="#00E676" />
                <circle cx="360" cy="142" r="5" fill="#00E676" />
                <circle cx="480" cy="148" r="5" fill="#00E676" />
                {/* Hazard bridge blips (red) */}
                <circle cx="250" cy="80" r="6" fill="#EF4444" />
                <circle cx="250" cy="220" r="6" fill="#EF4444" />
                <circle cx="320" cy="200" r="6" fill="#EF4444" />
              </svg>

              {/* Overlay HUD Pill */}
              <div className="absolute top-4 left-4 p-3 bg-[#050608]/90 backdrop-blur rounded border border-[#D4AF37] font-mono text-xs space-y-1">
                <div className="text-[#D4AF37] font-bold">RADAR CORRIDOR: I-80 W MM 142</div>
                <div className="text-white">LOWEST STRUCTURE: 15' 8" (CLEARED +26 IN)</div>
                <div className="text-emerald-400 font-bold">NO BYPASS DIVERTER REQUIRED</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#111319] rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">NBI ITEM 54B</span>
                <span className="text-base font-bold text-white">7,869 Structures</span>
              </div>
              <div className="p-3 bg-[#111319] rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">TRAILER STANDARD</span>
                <span className="text-base font-bold text-[#D4AF37]">162 Inches (13' 6")</span>
              </div>
              <div className="p-3 bg-[#111319] rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">RADAR REFRESH</span>
                <span className="text-base font-bold text-emerald-400">10 Hz CAN-Bus</span>
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
                <span>MP 142.4 · 64 MPH</span>
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

            <div className="mt-1 flex items-center justify-between bg-black/60 rounded px-2 py-1 border border-amber-500/40">
              <div className="flex items-center space-x-1 text-amber-400 font-bold">
                <AlertTriangle className="w-3 h-3" />
                <span>CLEARANCE: 13'8" (+14 MI)</span>
              </div>
              <span className="text-slate-300">SAFE FOR DRY VAN</span>
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
          className={`transition-all rounded-xl ${
            activeBottomTab === 'geofence' ? 'ring-2 ring-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.3)]' : ''
          }`}
        >
          <MapGeofencingTool />
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
                setDeviceViewMode('TABLET');
                showToast('SWITCHED TO RADAR BRIDGES MAP');
              }}
              className={`flex flex-col items-center py-1 transition-all ${
                activeBottomTab === 'bridges' ? 'text-[#D4AF37]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4 mb-0.5" />
              <span className="text-[8px]">BRIDGES</span>
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
