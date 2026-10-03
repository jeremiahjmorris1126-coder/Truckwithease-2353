import React, { useState, useEffect } from 'react';
import {
  Truck,
  Zap,
  ShieldCheck,
  Activity,
  Clock,
  Phone,
  Download,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileText,
  Check,
  Sparkles,
  RefreshCw,
  Layers,
  ArrowRight,
  Crosshair,
  Wifi,
  ExternalLink,
  Volume2,
  CloudFog,
} from 'lucide-react';
import { TabType } from '../types';
import { MORRISHIVE_LOGO_URL } from './TruckWithEaseLogo';
import { FounderHumanStorySection } from './FounderHumanStorySection';
import { RegionalWeatherHazardFeed } from './RegionalWeatherHazardFeed';

interface OverviewAdViewProps {
  onNavigateToTab?: (tab: TabType) => void;
  onOpenContact?: () => void;
}

export const OverviewAdView: React.FC<OverviewAdViewProps> = ({
  onNavigateToTab,
  onOpenContact,
}) => {
  const [selectedRange, setSelectedRange] = useState<'0.5M' | '1.0M' | '2.5M' | '360°'>('1.0M');
  const [radarAngle, setRadarAngle] = useState<number>(45);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [guideDownloaded, setGuideDownloaded] = useState<boolean>(false);
  const [isSuiteModalOpen, setIsSuiteModalOpen] = useState<boolean>(false);
  const [activeTabSelected, setActiveTabSelected] = useState<string>('gateways');

  // Animated rotating radar sweep
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle((prev) => (prev + 3) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadGuide = () => {
    const guideContent = `================================================================================
FMCSA 49 CFR § 395 & FHWA ITEM 54B DRIVER COMPLIANCE GUIDE
TRUCKWITHEASE CARRIER COMMAND PROTOCOL (2025-2026)
================================================================================

1. STATUTORY DRIVER DUTY CLOCKS (49 CFR § 395.3)
--------------------------------------------------------------------------------
- 11-Hour Driving Limit: May drive a maximum of 11 hours after 10 consecutive
  hours off duty.
- 14-Hour On-Duty Window: Cannot drive beyond the 14th consecutive hour after
  coming on duty, following 10 consecutive hours off duty.
- 30-Minute Rest Break: Driving is not permitted if more than 8 hours of driving
  have passed without a consecutive 30-minute break (Off-Duty, Sleeper, or On-Duty
  Not Driving).
- 60/70-Hour Limit: May not drive after 60/70 hours on duty in 7/8 consecutive days.
  May restart a 7/8 consecutive day period after taking 34 or more consecutive
  hours off duty.

2. FHWA ITEM 54B LOW-BRIDGE OVERHEAD DETECTION PROTOCOL
--------------------------------------------------------------------------------
- Real-Time National Bridge Inventory (NBI) Coordinate Vectors: 618,000 Spans
- Minimum Safety Threshold: 14' 0" Standard / 13' 6" High-Risk Warning
- Automatic Azimuth & Collision Avoidance Routing: Real-time recalculation
  with 0.000ms drift at continuous 80 MPH transit.

3. DISPATCH ZERO & UNASSIGNED DRIVING EVENT REMEDIATION
--------------------------------------------------------------------------------
- Zero Form & Manner Violations guarantee via live CAN-bus telemetry sync.
- Bi-directional ELD clearing (Samsara, Geotab, Motive) under 18ms latency.

24/7 Dispatch Operations Hotline: 636-706-8338
System Verification: https://ais-dev-wrrge6amyofrjo7iv3lsj5-842327122676.us-east1.run.app
================================================================================`;

    const blob = new Blob([guideContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'FMCSA-49CFR395-Item54B-Driver-Guide.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setGuideDownloaded(true);
    setTimeout(() => setGuideDownloaded(false), 5000);
  };

  return (
    <div className="w-full min-h-screen bg-[#060709] text-[#F0F2F5] font-sans antialiased selection:bg-[#C9A84C] selection:text-[#0a0a0a] flex flex-col -m-3 sm:-m-4 md:-m-6 overflow-x-hidden">
      {/* 1. TOP STATUS / NAVIGATION HEADER STRIP */}
      <header className="w-full bg-[#090B0E] border-b border-[#1A1F26] px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#141820] border border-[#2A313D] flex items-center justify-center text-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.15)]">
            <Truck className="w-5 h-5 fill-[#FFD700]/20 text-[#FFD700]" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold tracking-wider text-sm text-[#F0F2F5]">TRUCKWITH</span>
                <span className="font-extrabold tracking-wider text-sm text-[#FFD700]">EASE</span>
              </div>
              <span className="text-[9px] font-mono tracking-widest text-[#7C8799] uppercase mt-0.5">
                FLEET COMMAND
              </span>
            </div>
            <div className="h-5 w-px bg-[#2A313D]" />
            <div className="flex items-center gap-1.5" title="Morrishive Official Logo">
              <img
                src={MORRISHIVE_LOGO_URL}
                alt="Morrishive Logo"
                className="h-6 w-auto object-contain drop-shadow-[0_0_8px_rgba(242,202,80,0.3)]"
              />
              <span className="text-[10px] font-mono font-bold text-[#FFD700] uppercase tracking-wider">
                MORRISHIVE
              </span>
            </div>
          </div>
        </div>

        {/* Center Live Badges */}
        <div className="hidden md:flex items-center gap-6 font-mono text-[11px] text-[#A0AEC0]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]"></span>
            <span>49 CFR § 395</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700]"></span>
            <span>ITEM 54B RADAR</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse"></span>
            <span>TELEMETRY MESH</span>
          </div>
        </div>

        {/* Right 24/7 Priority Ops & Morrishive Emblem */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-[9px] font-mono text-[#7C8799] uppercase tracking-wider">
              24/7 PRIORITY OPS
            </span>
            <a
              href="tel:6367068338"
              className="text-xs font-mono font-bold text-[#F0F2F5] hover:text-[#FFD700] transition-colors"
            >
              636-706-8338
            </a>
          </div>
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#161B22] border border-[#FFD700]/30 shadow-[0_0_10px_rgba(255,215,0,0.1)]"
            title="Morrishive Kinetic Freight"
          >
            <img
              src="https://lh3.googleusercontent.com/aida/AEtjO1WWqKhJvf4NaFAjdlnZI04SFcqtUNgslIkHEij3oTpRDkVioH960VNKpU1JC92k_d7sRtPJKE-i48dhMWj37AltyrGxollTaOkGPcws97my3CYkNvBIETtvtKxQLspJPv6hDXJt4VCkdlcl5GFRVEPh5UCLcF2Plo8x6cxx3bgPls2AjiQwRvuHXaelJqYn6bu9TEhI4R4zrmLN0G6-NsOMeoAtFR-qJXrhoXkNxtoV8jx0_FaVccw-yLIELYEWS1VJdG8bfNh5nA"
              alt="Morrishive Logo"
              className="h-6 w-auto object-contain"
            />
            <span className="hidden sm:inline text-[10px] font-mono font-bold text-[#FFD700] uppercase tracking-wider">
              MORRISHIVE
            </span>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION WITH DUAL-COLUMN COMMAND COCKPIT */}
      <section className="relative w-full px-4 sm:px-8 lg:px-12 py-10 lg:py-16 bg-[#060709] overflow-hidden">
        {/* Subtle radial radar grid background */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-[#161C24] pointer-events-none opacity-40"></div>
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-[#1A222C] pointer-events-none opacity-30"></div>
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-[#202A38] pointer-events-none opacity-20"></div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#14181F] border border-[#FFD700]/40 shadow-[0_0_15px_rgba(255,215,0,0.08)]">
              <Truck className="w-3.5 h-3.5 text-[#FFD700]" />
              <span className="font-mono text-[11px] font-bold text-[#FFD700] tracking-wider uppercase">
                TRUCKWITHEASE × MORRISHIVE
              </span>
            </div>

            {/* Brand Logo & Display Title - TRUCKWITHEASE and the MORRISHIVE Logo Next To It */}
            <div className="flex flex-col gap-4">
              {/* Dual Brand Emblems: TRUCKWITHEASE Logo and MORRISHIVE Logo Side-by-Side */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-5 p-3 sm:p-4 rounded-2xl bg-[#0D1017]/90 border border-[#252D3D] shadow-2xl backdrop-blur-sm">
                {/* TruckWithEase Official Logo */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#141923] border border-[#FFD700]/50 flex items-center justify-center text-[#FFD700] shadow-[0_0_18px_rgba(255,215,0,0.25)]">
                    <Truck className="w-7 h-7 sm:w-8 sm:h-8 fill-[#FFD700]/20 text-[#FFD700]" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="font-extrabold tracking-wider text-base sm:text-lg text-[#F0F2F5]">TRUCKWITH</span>
                      <span className="font-extrabold tracking-wider text-base sm:text-lg text-[#FFD700]">EASE</span>
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-[#7C8799] uppercase mt-1">
                      FLEET PLATFORM
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block h-10 w-px bg-[#252D3D]" />

                {/* Morrishive Logo Next To It */}
                <div className="flex items-center gap-3">
                  <img
                    src={MORRISHIVE_LOGO_URL}
                    alt="Morrishive Kinetic Freight Logo"
                    className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_0_20px_rgba(242,202,80,0.4)]"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="font-mono font-black tracking-wider text-sm sm:text-base text-[#FFD700] uppercase">
                        MORRISHIVE
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30 font-bold">
                        HQ
                      </span>
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-[#7C8799] uppercase mt-1">
                      KINETIC FREIGHT &amp; TELEMETRY
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Headline: TRUCKWITHEASE with the MORRISHIVE Logo next to it */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-1">
                <h1 className="text-4xl sm:text-6xl lg:text-6xl font-black uppercase tracking-tight text-[#FFFFFF] leading-none">
                  TRUCKWITHEASE
                </h1>
                <div
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#141A24] border border-[#FFD700]/60 shadow-[0_0_20px_rgba(255,215,0,0.25)]"
                  title="Morrishive Official Logo"
                >
                  <img
                    src={MORRISHIVE_LOGO_URL}
                    alt="Morrishive Official Logo"
                    className="h-8 sm:h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(242,202,80,0.5)]"
                  />
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs sm:text-sm font-mono font-black text-[#FFD700] uppercase tracking-wider">
                      MORRISHIVE
                    </span>
                    <span className="text-[9px] font-mono text-[#8E9BB0] tracking-widest uppercase">
                      OFFICIAL LOGO
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#9AA5B8] max-w-xl font-normal leading-relaxed">
              Federal 49 CFR § 395 Engine & Item 54B Low-Bridge Radar
            </p>

            {/* Status Pill Box */}
            <div className="inline-flex flex-col items-start px-4 py-2.5 rounded-lg bg-[#0A1017] border border-[#00FF66]/60 shadow-[0_0_20px_rgba(0,255,102,0.15)]">
              <div className="text-[10px] font-mono text-[#00FF66]/90 uppercase tracking-widest font-semibold">
                54/54 ENDPOINTS
              </div>
              <div className="flex items-center gap-2 text-sm font-mono font-bold text-[#00FF66]">
                <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse"></span>
                <span>100% LIVE</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="hero-get-compliance-suite-btn"
                onClick={() => {
                  if (onNavigateToTab) {
                    onNavigateToTab('orchestrator');
                  } else {
                    setIsSuiteModalOpen(true);
                  }
                }}
                className="px-6 py-3.5 rounded bg-[#FFD700] hover:bg-[#F0C800] active:scale-95 text-[#0A0A0A] font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(255,215,0,0.3)] hover:shadow-[0_0_35px_rgba(255,215,0,0.5)] cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current text-[#0A0A0A]" />
                <span>GET COMPLIANCE SUITE</span>
              </button>

              <button
                id="hero-listen-founder-btn"
                onClick={() => {
                  const elem = document.getElementById('founder-human-story-section');
                  if (elem) {
                    elem.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-6 py-3.5 rounded bg-[#131A26] hover:bg-[#1C2638] border border-[#FFD700]/60 text-[#FFD700] font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-[0_0_20px_rgba(255,215,0,0.15)] hover:shadow-[0_0_25px_rgba(255,215,0,0.3)]"
              >
                <Volume2 className="w-4 h-4 text-[#FFD700] animate-pulse" />
                <span>HEAR FOUNDER ADDRESS</span>
              </button>

              <button
                id="hero-weather-hazards-btn"
                onClick={() => {
                  const elem = document.getElementById('regional-weather-hazard-section');
                  if (elem) {
                    elem.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-6 py-3.5 rounded bg-[#101926] hover:bg-[#162338] border border-amber-500/60 text-amber-300 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]"
              >
                <CloudFog className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>WEATHER HAZARDS (FOG/ICE/WIND)</span>
              </button>

              <button
                id="hero-preview-night-hud-btn"
                onClick={() => {
                  if (onNavigateToTab) {
                    onNavigateToTab('nighthud');
                  } else {
                    window.scrollTo({ top: 600, behavior: 'smooth' });
                  }
                }}
                className="px-6 py-3.5 rounded bg-[#10141B] hover:bg-[#181F2A] border border-[#2A3442] text-[#E0E6ED] font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>PREVIEW NIGHT HUD</span>
              </button>
            </div>

            {/* Metrics Triple Readout */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[#161C24] w-full max-w-lg">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-[#7C8799] uppercase tracking-wider">
                  ALGORITHMIC DRIFT
                </span>
                <span className="text-base sm:text-lg font-mono font-bold text-[#FFD700] mt-0.5">
                  0.000 ms
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-[#7C8799] uppercase tracking-wider">
                  RADAR LATENCY
                </span>
                <span className="text-base sm:text-lg font-mono font-bold text-[#00FF66] mt-0.5">
                  &lt; 18 ms
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-[#7C8799] uppercase tracking-wider">
                  FMCSA AUDIT
                </span>
                <span className="text-base sm:text-lg font-mono font-bold text-[#FFFFFF] mt-0.5">
                  PASS 100%
                </span>
              </div>
            </div>
          </div>

          {/* Right Phone Mockup - In-Cab Night HUD */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[340px] sm:max-w-[370px] rounded-[38px] p-3.5 bg-gradient-to-b from-[#1E242E] via-[#0E1217] to-[#080B0E] border-2 border-[#2C3545] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(255,215,0,0.06)]">
              {/* Phone Speaker Notch */}
              <div className="w-20 h-3.5 bg-[#080B0E] rounded-full mx-auto mb-2.5 flex items-center justify-center">
                <div className="w-8 h-1 bg-[#1F2633] rounded-full"></div>
              </div>

              {/* Inside Screen Container */}
              <div className="w-full bg-[#050709] rounded-[28px] p-4 flex flex-col gap-3.5 border border-[#161D27] overflow-hidden text-[#E0E6ED]">
                {/* Phone Header */}
                <div className="flex items-center justify-between text-[10px] font-mono border-b border-[#141B24] pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FFD700]"></span>
                    <span className="font-bold text-[#FFD700]">IN-CAB NIGHT HUD</span>
                  </div>
                  <span className="text-[#7C8799]">GPS: LOCK (14 SAT)</span>
                </div>

                {/* Dual Clocks (11h DRIVE & 30m BREAK) */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Left Drive Clock */}
                  <div className="bg-[#0B0F15] rounded-xl p-3 border border-[#1B2330] flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="relative w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center my-1">
                      {/* SVG Gauge Circle */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="15.5"
                          fill="none"
                          stroke="#151C26"
                          strokeWidth="2.5"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.5"
                          fill="none"
                          stroke="#FFD700"
                          strokeWidth="2.5"
                          strokeDasharray="75, 100"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-mono text-sm sm:text-base font-extrabold text-[#FFFFFF] leading-none">
                          11h
                        </span>
                        <span className="font-mono text-[8px] text-[#7C8799] uppercase mt-0.5">
                          REMAINING
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-[#FFD700] uppercase mt-1 tracking-wider">
                      DRIVE
                    </span>
                  </div>

                  {/* Right Break Clock */}
                  <div className="bg-[#0B0F15] rounded-xl p-3 border border-[#1B2330] flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="relative w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center my-1">
                      {/* SVG Gauge Circle */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="15.5"
                          fill="none"
                          stroke="#151C26"
                          strokeWidth="2.5"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.5"
                          fill="none"
                          stroke="#FFD700"
                          strokeWidth="2.5"
                          strokeDasharray="45, 100"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-mono text-sm sm:text-base font-extrabold text-[#FFFFFF] leading-none">
                          30m
                        </span>
                        <span className="font-mono text-[8px] text-[#7C8799] uppercase mt-0.5">
                          REQUIRED
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-[#FFD700] uppercase mt-1 tracking-wider">
                      BREAK
                    </span>
                  </div>
                </div>

                {/* Item 54B Scope Container */}
                <div className="bg-[#0B0F15] rounded-xl p-3 border border-[#1B2330] flex flex-col gap-2 relative">
                  {/* Scope Header & Range Buttons */}
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#FFD700]"></span>
                      <span className="font-bold text-[#E0E6ED]">ITEM 54B SCOPE</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#121720] p-0.5 rounded border border-[#202936]">
                      {(['0.5M', '1.0M', '2.5M', '360°'] as const).map((rng) => (
                        <button
                          key={rng}
                          onClick={() => setSelectedRange(rng)}
                          className={`px-1.5 py-0.5 text-[8px] font-mono rounded transition-colors ${
                            selectedRange === rng
                              ? 'bg-[#FFD700] text-[#0A0A0A] font-bold'
                              : 'text-[#7C8799] hover:text-[#CCD6E0]'
                          }`}
                        >
                          {rng}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Tactical Radar Viewport */}
                  <div className="relative w-full h-36 bg-[#040608] rounded-lg border border-[#161D27] overflow-hidden flex items-center justify-center">
                    {/* Concentric rings */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-28 h-28 rounded-full border border-[#15202D]"></div>
                      <div className="absolute w-20 h-20 rounded-full border border-[#15202D]"></div>
                      <div className="absolute w-12 h-12 rounded-full border border-[#15202D]"></div>
                      <div className="absolute w-full h-[1px] bg-[#101824]"></div>
                      <div className="absolute h-full w-[1px] bg-[#101824]"></div>
                    </div>

                    {/* Rotating Radar Sweep Line */}
                    <div
                      className="absolute w-28 h-28 pointer-events-none"
                      style={{
                        transform: `rotate(${radarAngle}deg)`,
                        transformOrigin: 'center center',
                      }}
                    >
                      <div className="w-1/2 h-1/2 ml-auto origin-bottom-left bg-gradient-to-tr from-transparent via-[#FFD700]/10 to-[#FFD700]/30 rounded-tr-full"></div>
                      <div className="absolute top-1/2 right-0 w-1/2 h-[1.5px] bg-[#FFD700]/80 shadow-[0_0_8px_#FFD700]"></div>
                    </div>

                    {/* Active Hazard Marker: 13' 6" */}
                    <div className="absolute top-7 right-10 flex items-center gap-1 z-10 animate-bounce">
                      <div className="w-4 h-4 rounded-full bg-[#FFD700]/20 border border-[#FFD700] flex items-center justify-center text-[#FFD700]">
                        <AlertTriangle className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-[#FFD700] text-[#0A0A0A] px-1 py-0.2 rounded shadow">
                        13' 6"
                      </span>
                    </div>

                    {/* Secondary Marker: 14' 9" OK */}
                    <div className="absolute bottom-6 left-8 flex items-center gap-1 z-10">
                      <span className="text-[8px] font-mono text-[#00FF66] bg-[#00FF66]/15 px-1 py-0.2 rounded border border-[#00FF66]/40">
                        14' 9" OK
                      </span>
                    </div>

                    {/* Center Vehicle Reticle */}
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFD700] border-2 border-[#040608] z-10 shadow-[0_0_8px_#FFD700]"></div>
                  </div>

                  {/* Lower Telemetry Readouts */}
                  <div className="flex flex-col gap-1 text-[9px] font-mono pt-1">
                    <div className="flex items-center justify-between text-[#CCD6E0]">
                      <span>AZIMUTH: 284° WNW</span>
                      <span className="text-[#00FF66] font-bold bg-[#00FF66]/10 px-1 py-0.2 rounded">
                        RADAR LOCK // PING ACTIVE
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#FFD700] font-bold">
                      <span>CLEARANCE: 13' 6" (OVERHEAD HAZARD)</span>
                      <span className="text-[#CCD6E0] font-normal">ETA: 42s @ 68 MPH</span>
                    </div>
                    <div className="flex items-center justify-between text-[#6B778C] pt-0.5 border-t border-[#141B24]">
                      <span>FHWA ITEM 54B HIGHWAY VECTOR SCAN</span>
                    </div>
                    <div className="flex items-center justify-between text-[#6B778C]">
                      <span>FMCSA #49-CFR-395</span>
                      <span className="text-[#00FF66] flex items-center gap-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse"></span>
                        ACTIVE STREAM
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.4 REAL-TIME REGIONAL WEATHER HAZARD RADAR (SEARCH GROUNDING) */}
      <section id="regional-weather-hazard-section" className="w-full px-4 sm:px-8 lg:px-12 py-8 bg-[#07090e] border-t border-[#1a202c]">
        <div className="max-w-7xl mx-auto">
          <RegionalWeatherHazardFeed
            onBroadcastHazard={(h) => {
              if (onNavigateToTab) {
                onNavigateToTab('telemetry');
              }
            }}
          />
        </div>
      </section>

      {/* 2.5 THE HUMAN VOICE & NARRATIVE: FOUNDER'S UNFILTERED OPERATIONAL KEYNOTE */}
      <FounderHumanStorySection
        onNavigateToTab={onNavigateToTab}
        onOpenContact={onOpenContact}
      />

      {/* 3. ARCHITECTURE OVERVIEW: 54/54 FEDERAL COMPLIANCE GATEWAYS */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-12 bg-[#090B0E] border-t border-[#161C24]">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono font-bold text-[#FFD700] uppercase tracking-widest">
                ARCHITECTURE OVERVIEW
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#FFFFFF]">
                54/54 FEDERAL COMPLIANCE GATEWAYS
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#8C9BAE] max-w-md font-mono leading-relaxed">
              Continuous zero-drift algorithmic evaluation of driver duty logs, cycle limits, and national
              bridge inventory item 54B datasets.
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Samsara */}
            <div className="bg-[#0D1117] rounded-xl p-5 border border-[#1E2530] flex flex-col justify-between gap-4 hover:border-[#FFD700]/40 transition-colors shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#7C8799] uppercase tracking-wider">ELD INGESTION</span>
                  <span className="text-[#00FF66] font-bold bg-[#00FF66]/10 px-1.5 py-0.5 rounded">
                    12ms LATENCY
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#FFFFFF] tracking-tight">Samsara API Core</h3>
                <p className="text-xs text-[#8C9BAE] leading-relaxed">
                  Direct CAN-bus engine RPM, wheel speed, and diagnostic telemetry ingestion at 1-second
                  ticks.
                </p>
              </div>
              <div className="pt-3 border-t border-[#18202A] flex items-center justify-between text-[10px] font-mono text-[#7C8799]">
                <span>Protocol: WebSocket</span>
                <span className="text-[#00FF66] font-bold">Status: 100% Valid</span>
              </div>
            </div>

            {/* Card 2: Geotab */}
            <div className="bg-[#0D1117] rounded-xl p-5 border border-[#1E2530] flex flex-col justify-between gap-4 hover:border-[#FFD700]/40 transition-colors shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#7C8799] uppercase tracking-wider">FEDERAL CLEARING</span>
                  <span className="text-[#00FF66] font-bold bg-[#00FF66]/10 px-1.5 py-0.5 rounded">
                    18ms LATENCY
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#FFFFFF] tracking-tight">Geotab Drive Mesh</h3>
                <p className="text-xs text-[#8C9BAE] leading-relaxed">
                  Automated driver log annotations and 16-hour exceptional duty window calculations.
                </p>
              </div>
              <div className="pt-3 border-t border-[#18202A] flex items-center justify-between text-[10px] font-mono text-[#7C8799]">
                <span>Protocol: REST v4</span>
                <span className="text-[#00FF66] font-bold">Status: 100% Valid</span>
              </div>
            </div>

            {/* Card 3: Motive */}
            <div className="bg-[#0D1117] rounded-xl p-5 border border-[#1E2530] flex flex-col justify-between gap-4 hover:border-[#FFD700]/40 transition-colors shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#7C8799] uppercase tracking-wider">FLEET SYNC</span>
                  <span className="text-[#00FF66] font-bold bg-[#00FF66]/10 px-1.5 py-0.5 rounded">
                    14ms LATENCY
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#FFFFFF] tracking-tight">Motive Sync Hub</h3>
                <p className="text-xs text-[#8C9BAE] leading-relaxed">
                  Bi-directional dispatch sync, real-time unassigned driving event remediation, and DOT
                  audit slips.
                </p>
              </div>
              <div className="pt-3 border-t border-[#18202A] flex items-center justify-between text-[10px] font-mono text-[#7C8799]">
                <span>Protocol: gRPC</span>
                <span className="text-[#00FF66] font-bold">Status: 100% Valid</span>
              </div>
            </div>

            {/* Card 4: FHWA Radar */}
            <div className="bg-[#0D1117] rounded-xl p-5 border border-[#1E2530] flex flex-col justify-between gap-4 hover:border-[#FFD700]/40 transition-colors shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#FFD700] uppercase tracking-wider font-bold">ITEM 54B RADAR</span>
                  <span className="text-[#FFD700] font-bold bg-[#FFD700]/10 px-1.5 py-0.5 rounded">
                    618,000 SPANS
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#FFFFFF] tracking-tight">FHWA Clearance Map</h3>
                <p className="text-xs text-[#8C9BAE] leading-relaxed">
                  Sub-second vector lookup against every overhead bridge, overpass, and culvert across all 50
                  states.
                </p>
              </div>
              <div className="pt-3 border-t border-[#18202A] flex items-center justify-between text-[10px] font-mono text-[#7C8799]">
                <span>Database: In-Memory Geo</span>
                <span className="text-[#FFD700] font-bold">Audited: Real-Time</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER: ELIMINATE FORM & MANNER VIOLATIONS */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-12 bg-[#060709]">
        <div className="max-w-7xl mx-auto rounded-2xl p-6 sm:p-10 bg-gradient-to-r from-[#0C1017] via-[#0E131C] to-[#0A0D12] border border-[#222B38] relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
          {/* Subtle gold polygon accent in background */}
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-[#FFD700]/5 to-transparent pointer-events-none"></div>

          {/* Left Text */}
          <div className="flex flex-col gap-3 max-w-2xl">
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#FFD700] uppercase tracking-widest font-bold">
              <span className="w-2 h-2 rounded-full bg-[#FFD700]"></span>
              <span>FEDERAL MOTOR CARRIER SAFETY STANDARD</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-[#FFFFFF] leading-tight">
              ELIMINATE FORM & MANNER VIOLATIONS
              <br />
              BEFORE THEY HAPPEN
            </h2>
            <p className="text-xs sm:text-sm text-[#9AA5B8] leading-relaxed pt-1">
              TruckWithEase and Morrishive engineer sub-millisecond legal clock math directly into your
              truck's telemetry. Whether running continuous 80 MPH transit on toll corridors or navigating
              tight metropolitan bridges, our dual-engine architecture guarantees statutory compliance.
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            <a
              href="tel:6367068338"
              className="px-6 py-3.5 rounded bg-[#FFD700] hover:bg-[#F0C800] text-[#0A0A0A] font-mono font-bold text-xs uppercase tracking-wider text-center transition-all shadow-[0_0_20px_rgba(255,215,0,0.25)] hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] active:scale-95 cursor-pointer"
            >
              CALL DISPATCH: 636-706-8338
            </a>

            <button
              onClick={handleDownloadGuide}
              className="px-6 py-3.5 rounded bg-[#10141B] hover:bg-[#181F2A] border border-[#2A3442] text-[#E0E6ED] font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>{guideDownloaded ? 'GUIDE DOWNLOADED ✓' : 'DOWNLOAD DRIVER GUIDE'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="w-full bg-[#050608] border-t border-[#141A22] px-4 sm:px-8 lg:px-12 py-6 text-[10px] font-mono text-[#6E7B8E] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-[#12161D] border border-[#262F3D] flex items-center justify-center text-[#FFD700] font-bold text-[10px]">
            M
          </div>
          <div>
            <span className="font-bold text-[#A0AEC0]">TruckWithEase & Morrishive</span>
            <span className="ml-2">Tactical Obsidian Vanguard Command Suite © 2025</span>
          </div>
        </div>

        {/* Center */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
          <span>49 CFR § 395.1 – 395.38</span>
          <span>•</span>
          <span>FHWA Item 54B Specs</span>
          <span>•</span>
          <span>FMCSA Certified ELD</span>
          <span className="hidden lg:inline">•</span>
          <span className="hidden lg:inline">24/7 Support: 636-706-8338</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 text-[#00FF66] font-bold">
          <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse"></span>
          <span>SYSTEM 100% OPERATIONAL</span>
        </div>
      </footer>

      {/* COMPLIANCE SUITE MODAL */}
      {isSuiteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0E14] border border-[#283242] rounded-2xl max-w-lg w-full p-6 flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1A222E] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#FFD700]" />
                <h3 className="font-bold text-base text-[#FFFFFF] uppercase tracking-wide">
                  Morrishive Compliance Suite
                </h3>
              </div>
              <button
                onClick={() => setIsSuiteModalOpen(false)}
                className="text-[#7C8799] hover:text-[#FFFFFF] text-sm font-mono px-2 py-1 rounded bg-[#141B24]"
              >
                ESC
              </button>
            </div>

            <p className="text-xs text-[#9AA5B8] leading-relaxed">
              Your fleet node is authenticated. Select a tactical operational module to deploy live:
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setIsSuiteModalOpen(false);
                  if (onNavigateToTab) onNavigateToTab('hos');
                }}
                className="p-3 rounded-lg bg-[#121720] hover:bg-[#1A222F] border border-[#222B3A] text-left transition-colors flex flex-col gap-1"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#FFD700]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>HOS / ELD Clocks</span>
                </div>
                <span className="text-[10px] text-[#7C8799]">49 CFR § 395 11h/14h/70h engines</span>
              </button>

              <button
                onClick={() => {
                  setIsSuiteModalOpen(false);
                  if (onNavigateToTab) onNavigateToTab('nighthud');
                }}
                className="p-3 rounded-lg bg-[#121720] hover:bg-[#1A222F] border border-[#222B3A] text-left transition-colors flex flex-col gap-1"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#00FF66]">
                  <Activity className="w-3.5 h-3.5" />
                  <span>In-Cab Night HUD</span>
                </div>
                <span className="text-[10px] text-[#7C8799]">Item 54B &lt;13'6" Radar Scope</span>
              </button>

              <button
                onClick={() => {
                  setIsSuiteModalOpen(false);
                  if (onNavigateToTab) onNavigateToTab('dvir-agent');
                }}
                className="p-3 rounded-lg bg-[#121720] hover:bg-[#1A222F] border border-[#222B3A] text-left transition-colors flex flex-col gap-1"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#FFFFFF]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Autonomous DVIR</span>
                </div>
                <span className="text-[10px] text-[#7C8799]">Voice-guided pre/post trip audits</span>
              </button>

              <button
                onClick={() => {
                  setIsSuiteModalOpen(false);
                  if (onNavigateToTab) onNavigateToTab('orchestrator');
                }}
                className="p-3 rounded-lg bg-[#121720] hover:bg-[#1A222F] border border-[#222B3A] text-left transition-colors flex flex-col gap-1"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#FFD700]">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Launch Cockpit</span>
                </div>
                <span className="text-[10px] text-[#7C8799]">Enterprise T1-T5 pipelines</span>
              </button>
            </div>

            <div className="pt-2 border-t border-[#1A222E] flex items-center justify-between">
              <a
                href="tel:6367068338"
                className="text-xs font-mono font-bold text-[#FFD700] hover:underline flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call 24/7 Ops: 636-706-8338</span>
              </a>
              <button
                onClick={() => setIsSuiteModalOpen(false)}
                className="px-4 py-2 rounded bg-[#161D27] hover:bg-[#202937] text-xs font-mono font-bold text-[#CCD6E0]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
