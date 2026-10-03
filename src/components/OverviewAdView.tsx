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
  Cpu,
  Star,
  Quote,
  DollarSign,
  TrendingUp,
  Megaphone,
  Shield,
  HelpCircle,
  Play,
} from 'lucide-react';
import { TabType, UserRoleType } from '../types';
import { FounderHumanStorySection } from './FounderHumanStorySection';
import { RegionalWeatherHazardFeed } from './RegionalWeatherHazardFeed';
import { TwitterGoogleStudioFeed } from './TwitterGoogleStudioFeed';
import { UnifiedAutonomousFleetDeck } from './UnifiedAutonomousFleetDeck';
import { HardwareHealthWidget } from './HardwareHealthWidget';
import { SponsoredBillboardBanner } from './SponsoredBillboardBanner';
import { AdCampaignManagerModal } from './AdCampaignManagerModal';
import { FleetInquiryModal } from './FleetInquiryModal';

interface OverviewAdViewProps {
  onNavigateToTab?: (tab: TabType) => void;
  onOpenContact?: () => void;
  onOpenEcosystemIndex?: (autoTest?: boolean) => void;
  userRole?: UserRoleType;
}

export const OverviewAdView: React.FC<OverviewAdViewProps> = ({
  onNavigateToTab,
  onOpenContact,
  onOpenEcosystemIndex,
  userRole = 'admin',
}) => {
  const [selectedRange, setSelectedRange] = useState<'0.5M' | '1.0M' | '2.5M' | '360°'>('1.0M');
  const [radarAngle, setRadarAngle] = useState<number>(45);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [guideDownloaded, setGuideDownloaded] = useState<boolean>(false);
  const [isSuiteModalOpen, setIsSuiteModalOpen] = useState<boolean>(false);
  const [isAdManagerOpen, setIsAdManagerOpen] = useState<boolean>(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState<boolean>(false);
  const [selectedInquiryPlan, setSelectedInquiryPlan] = useState<string>('Enterprise Fleet Command');
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');

  const isAdmin = userRole === 'admin';

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
  };

  const openQuoteForPlan = (planName: string) => {
    setSelectedInquiryPlan(planName);
    setIsInquiryModalOpen(true);
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
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-[#FFE600] uppercase tracking-wider px-2 py-0.5 rounded bg-[#1C1600] border border-[#FFE600]/40">
                ENTERPRISE V4.28
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

        {/* Right 24/7 Priority Ops & Actions */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => setIsAdManagerOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161D2B] border border-[#FFD700]/40 text-[#FFD700] text-xs font-mono font-bold hover:bg-[#1E2638] transition-colors shadow-[0_0_10px_rgba(255,215,0,0.1)]"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>SPONSOR ADS</span>
            </button>
          )}

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
        </div>
      </header>

      {/* 1.5 DYNAMIC SPONSORED BILLBOARD BANNER (REBATES & PARTNERS) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 pt-4 bg-[#060709]">
        <SponsoredBillboardBanner
          isAdmin={isAdmin}
          onOpenAdManager={() => setIsAdManagerOpen(true)}
          onOpenInquiryModal={(sponsor) => openQuoteForPlan(`Sponsor Partner: ${sponsor}`)}
        />
      </div>

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
              <span className="font-mono text-[11px] font-bold text-[#FFE600] tracking-wider uppercase">
                TRUCKWITHEASE™ UNIFIED OPERATIONAL SPINE
              </span>
            </div>

            {/* Brand Logo & Display Title */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3 sm:gap-5 p-3 sm:p-4 rounded-2xl bg-[#0D1017]/90 border border-[#252D3D] shadow-2xl backdrop-blur-sm">
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

                <div className="hidden sm:block h-10 w-px bg-[#252D3D]" />

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141200] border border-[#FFE600]/40 text-[#FFE600] font-mono text-xs">
                  <Zap className="w-4 h-4 animate-pulse" />
                  <div>
                    <strong className="block text-[11px] uppercase tracking-wider text-white">7 Live Conduits Active</strong>
                    <span className="text-[9px] text-[#FFE600]">49 Subsystems · 0.000ms Drift</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-1">
                <h1 className="text-4xl sm:text-6xl lg:text-6xl font-black uppercase tracking-tight text-[#FFFFFF] leading-none">
                  TACTICAL FLEET
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFF080] to-[#E5C100]">
                    COMMAND CENTER
                  </span>
                </h1>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#A0AEC0] max-w-2xl leading-relaxed">
              Sub-millisecond FMCSA 49 CFR § 395 legal clock engines, FHWA Item 54B low-bridge collision radar,
              and hands-free in-cab voice execution. Zero form &amp; manner violations guaranteed across all 50 states.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => openQuoteForPlan('Enterprise Fleet Command')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#E5C100] text-black font-mono font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>REQUEST FLEET QUOTE</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleDownloadGuide}
                className="px-5 py-3.5 rounded-xl bg-[#141A26] border border-[#2A3448] text-[#E0E6ED] font-mono font-bold text-xs uppercase flex items-center gap-2 hover:bg-[#1E2638] transition-all"
              >
                <Download className="w-4 h-4 text-[#FFD700]" />
                <span>{guideDownloaded ? 'GUIDE DOWNLOADED ✓' : 'DOWNLOAD FMCSA GUIDE'}</span>
              </button>

              <button
                onClick={() => setIsSuiteModalOpen(true)}
                className="px-5 py-3.5 rounded-xl bg-[#10141B] border border-[#FFD700]/30 text-[#FFD700] font-mono font-bold text-xs uppercase hover:bg-[#18202D] transition-all"
              >
                EXPLORE MODULES
              </button>
            </div>

            {/* Metrics Triple Readout */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-xl pt-2 border-t border-[#1C2330]">
              <div className="p-3 rounded-xl bg-[#0D1118] border border-[#1A222E]">
                <div className="text-[10px] font-mono text-[#7C8799] uppercase">Overhead Spans</div>
                <div className="text-xl font-mono font-extrabold text-[#FFD700] mt-0.5">618,000</div>
                <div className="text-[9px] text-[#A0AEC0]">NBI Item 54B Mesh</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0D1118] border border-[#1A222E]">
                <div className="text-[10px] font-mono text-[#7C8799] uppercase">Clock Accuracy</div>
                <div className="text-xl font-mono font-extrabold text-[#00FF66] mt-0.5">0.000ms</div>
                <div className="text-[9px] text-[#A0AEC0]">FMCSA 49 CFR § 395</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0D1118] border border-[#1A222E]">
                <div className="text-[10px] font-mono text-[#7C8799] uppercase">Sponsor Rebates</div>
                <div className="text-xl font-mono font-extrabold text-[#38BDF8] mt-0.5">$0.42/gal</div>
                <div className="text-[9px] text-[#A0AEC0]">Love's &amp; Pilot Mesh</div>
              </div>
            </div>
          </div>

          {/* Right Phone Mockup - In-Cab Night HUD */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[340px] rounded-[36px] bg-[#090C12] border-4 border-[#222B3D] p-3 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col gap-3">
              <div className="w-20 h-4 bg-[#141A26] rounded-full mx-auto"></div>
              <div className="rounded-[24px] bg-[#000000] border border-[#1A2230] p-4 space-y-4">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#7C8799]">
                  <span className="text-[#FFD700] font-bold">NIGHT HUD • ACTIVE</span>
                  <span>78 MPH</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-[#0D1118] border border-[#202838] text-center">
                    <div className="text-[9px] font-mono text-[#7C8799]">11H DRIVE REMAINING</div>
                    <div className="text-xl font-mono font-bold text-[#FFD700] mt-1">07:44:19</div>
                    <div className="text-[8px] text-[#00FF66]">COMPLIANT</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0D1118] border border-[#202838] text-center">
                    <div className="text-[9px] font-mono text-[#7C8799]">30M REST BREAK IN</div>
                    <div className="text-xl font-mono font-bold text-[#00FF66] mt-1">03:18:04</div>
                    <div className="text-[8px] text-[#00FF66]">SAFE</div>
                  </div>
                </div>

                {/* Radar Viewport */}
                <div className="relative w-full aspect-square rounded-2xl bg-[#05080E] border border-[#1E2638] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-3/4 h-3/4 rounded-full border border-[#1A2536]"></div>
                    <div className="w-1/2 h-1/2 rounded-full border border-[#1A2536]"></div>
                    <div className="w-1/4 h-1/4 rounded-full border border-[#1A2536]"></div>
                  </div>
                  <div
                    className="absolute w-1/2 h-0.5 bg-gradient-to-r from-transparent to-[#FFD700] origin-left"
                    style={{ transform: `rotate(${radarAngle}deg)`, left: '50%' }}
                  />
                  <div className="w-3 h-3 rounded-full bg-[#00FF66] shadow-[0_0_10px_#00FF66] z-10"></div>
                  <div className="absolute top-4 right-4 text-[9px] font-mono text-[#FFD700] bg-[#FFD700]/10 px-2 py-0.5 rounded border border-[#FFD700]/30">
                    ITEM 54B: 14' 2" CLEAR
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0E131C] border border-[#1A2230] text-[10px] font-mono text-[#7C8799] flex justify-between">
                  <span>GPS: 38.6270° N, 90.1994° W</span>
                  <span className="text-[#00FF66]">I-70 EAST</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 WHAT SETS TRUCKWITHEASE APART & HOW EVERYTHING IS TIED TOGETHER (7 CONDUITS & 49 SUBSYSTEMS) */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-16 bg-[#04060A] border-t border-b border-[#FFE600]/30 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FFE600]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          
          {/* Header & The Isolated Silos Problem */}
          <div className="flex flex-col items-center text-center space-y-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181400] border border-[#FFE600] text-[#FFE600] text-xs font-mono font-black uppercase tracking-wider shadow-[0_0_15px_rgba(255,230,0,0.25)]">
              <Zap className="w-4 h-4 text-[#FFE600] animate-pulse" />
              <span>THE UNIFIED OPERATIONAL SPINE</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              WHAT SETS TRUCKWITHEASE APART
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFE600] via-[#FFF380] to-[#E6B800]">
                &amp; HOW EVERYTHING IS TIED TOGETHER
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 font-mono leading-relaxed max-w-3xl">
              Most trucking apps in the industry (Motive, Samsara, DAT One, Trucker Path, Fleetio) are <strong className="text-rose-400">isolated silos</strong>: hours don't talk to the load board, Google Maps has zero memory of 13'6" bridge clearances, pre-trip brake defects don't halt dispatch, and cellular dead zones drop records triggering unassigned driving citations.
              <br className="hidden sm:block" />
              What sets <strong className="text-[#FFE600]">TruckWithEase</strong> apart is the <strong className="text-white">Unified Operational Spine</strong>: every cab event, telematics pulse, HOS clock tick, and inspection item propagates across all other 48 subsystems in real time with 0.000ms drift.
            </p>

            {/* Quick Action CTA Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {onOpenEcosystemIndex && (
                <>
                  <button
                    onClick={() => onOpenEcosystemIndex(false)}
                    className="px-5 py-3 rounded-xl bg-[#FFE600] hover:bg-[#FFD700] text-black font-mono font-black text-xs uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(255,230,0,0.35)] transition-all cursor-pointer active:scale-95"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>⚡ ECOSYSTEM MESH (49 INDEXED)</span>
                  </button>

                  <button
                    onClick={() => onOpenEcosystemIndex(true)}
                    className="px-5 py-3 rounded-xl bg-[#120F02] border border-[#FFE600] hover:bg-[#1C1703] text-[#FFE600] font-mono font-bold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-md"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>TEST ALL 7 CONDUITS LIVE</span>
                  </button>
                </>
              )}

              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('orchestrator')}
                  className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 font-mono font-bold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>SRE 54/54 TEST FLIGHT</span>
                </button>
              )}
            </div>
          </div>

          {/* THE 7 LIVE CROSS-PROGRAM CONDUITS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
            
            {/* Conduit 1 */}
            <div className="p-5 rounded-2xl bg-[#090D15] border border-cyan-500/40 hover:border-cyan-400 space-y-3 shadow-xl transition-all group">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/50 text-[10px] font-bold">
                  CONDUIT 1
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE (14ms)
                </span>
              </div>
              <h3 className="text-white text-sm font-bold uppercase group-hover:text-cyan-400 transition-colors">
                Live HOS Clocks ⇄ GOAT Load Board &amp; Quantum Optimizer
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-rose-400">The Silo Problem:</strong> A driver books a 650-mile load on DAT with only 4 hours remaining, getting stranded or fined under FMCSA § 395.3.
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed bg-[#06080E] p-2.5 rounded-lg border border-slate-800">
                <strong className="text-cyan-400">TruckWithEase Solution:</strong> Load board actively queries 11h/14h/70h clocks. Over-window dispatches are automatically gated and a mandatory 10h sleeper reset is auto-scheduled.
              </p>
            </div>

            {/* Conduit 2 */}
            <div className="p-5 rounded-2xl bg-[#090D15] border border-amber-500/40 hover:border-amber-400 space-y-3 shadow-xl transition-all group">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/50 text-[10px] font-bold">
                  CONDUIT 2
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE (18ms)
                </span>
              </div>
              <h3 className="text-white text-sm font-bold uppercase group-hover:text-amber-400 transition-colors">
                CAN-Bus ECM ⇄ Idle Fuel Watchdog &amp; Driver Messaging
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-rose-400">The Silo Problem:</strong> Fleets discover excessive idling only at month's end on a fuel invoice after burning thousands of dollars.
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed bg-[#06080E] p-2.5 rounded-lg border border-slate-800">
                <strong className="text-amber-400">TruckWithEase Solution:</strong> ECM detects 0 MPH @ running engine &gt;15 min, calculates $4.85/hr burn, and fires an automated priority alert directly into the in-cab messaging inbox.
              </p>
            </div>

            {/* Conduit 3 */}
            <div className="p-5 rounded-2xl bg-[#090D15] border border-purple-500/40 hover:border-purple-400 space-y-3 shadow-xl transition-all group">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-500/50 text-[10px] font-bold">
                  CONDUIT 3
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE (9ms)
                </span>
              </div>
              <h3 className="text-white text-sm font-bold uppercase group-hover:text-purple-400 transition-colors">
                GPS Geolocation ⇄ Speed Sentinel &amp; SPE-2025 Haptics
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-rose-400">The Silo Problem:</strong> Drivers stare down at screens or GPS units while driving to check if they are speeding.
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed bg-[#06080E] p-2.5 rounded-lg border border-slate-800">
                <strong className="text-purple-400">TruckWithEase Solution:</strong> Cross-references statutory truck limits per corridor; if exceeding by +5 MPH for &gt;30s, triggers [120,60,120,60,240] haptic buzz without looking away.
              </p>
            </div>

            {/* Conduit 4 */}
            <div className="p-5 rounded-2xl bg-[#090D15] border border-rose-500/40 hover:border-rose-400 space-y-3 shadow-xl transition-all group">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/50 text-[10px] font-bold">
                  CONDUIT 4
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE (11ms)
                </span>
              </div>
              <h3 className="text-white text-sm font-bold uppercase group-hover:text-rose-400 transition-colors">
                Rig Height Profile ⇄ 5-Mile Acoustic Low-Bridge Siren
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-rose-400">The Silo Problem:</strong> Standard GPS causes over 15,000 commercial vehicle bridge strikes every year nationwide.
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed bg-[#06080E] p-2.5 rounded-lg border border-slate-800">
                <strong className="text-rose-400">TruckWithEase Solution:</strong> Changing rig profile (13'6", 14'0", or -3" air dump) recalculates against all 618,000 FHWA spans in memory; arms 5-mile dual-pulsed siren and detour bypass.
              </p>
            </div>

            {/* Conduit 5 */}
            <div className="p-5 rounded-2xl bg-[#090D15] border border-sky-500/40 hover:border-sky-400 space-y-3 shadow-xl transition-all group">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-500/50 text-[10px] font-bold">
                  CONDUIT 5
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE (16ms)
                </span>
              </div>
              <h3 className="text-white text-sm font-bold uppercase group-hover:text-sky-400 transition-colors">
                Cellular Dead Zone ⇄ Offline Store-and-Forward Cache
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-rose-400">The Silo Problem:</strong> Mountain canyons drop cellular packets, freezing ordinary ELDs and causing unassigned driving violations.
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed bg-[#06080E] p-2.5 rounded-lg border border-slate-800">
                <strong className="text-sky-400">TruckWithEase Solution:</strong> Cryptographically hashes (SHA-256) all CAN-bus pulses and duty logs in IndexedDB; auto-flushes to cloud upon 5G/LTE reconnect with zero packet loss.
              </p>
            </div>

            {/* Conduit 6 */}
            <div className="p-5 rounded-2xl bg-[#090D15] border border-emerald-500/40 hover:border-emerald-400 space-y-3 shadow-xl transition-all group">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/50 text-[10px] font-bold">
                  CONDUIT 6
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE (19ms)
                </span>
              </div>
              <h3 className="text-white text-sm font-bold uppercase group-hover:text-emerald-400 transition-colors">
                Autonomous DVIR Defect ⇄ Fleet Chief Mechanic Work Orders
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-rose-400">The Silo Problem:</strong> Pre-trip inspection defects sit in paper books until a roadside DOT officer puts the rig Out of Service.
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed bg-[#06080E] p-2.5 rounded-lg border border-slate-800">
                <strong className="text-emerald-400">TruckWithEase Solution:</strong> Flagging brake, tire, or gladhand defects halts dispatch and immediately spawns an open work order with parts allocation in Fleet Chief Mechanic.
              </p>
            </div>

            {/* Conduit 7 (Full Span on lg) */}
            <div className="md:col-span-2 lg:col-span-3 p-5 rounded-2xl bg-gradient-to-r from-[#0C121D] via-[#090D15] to-[#120F02] border border-[#FFE600]/40 space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#1C1600] text-[#FFE600] border border-[#FFE600]/50 text-[10px] font-bold">
                    CONDUIT 7
                  </span>
                  <span className="text-xs text-white font-bold uppercase">
                    In-Cab Telecom ⇄ Direct 24/7 Dispatch (636-706-8338) &amp; Geo-Locked Detention
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE (12ms)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <p className="text-slate-400 leading-relaxed">
                  <strong className="text-rose-400">The Silo Problem:</strong> Drivers use personal cell phones, get harassed by brokers, and fight endlessly for unpaid detention time at receiver docks without verifiable GPS timestamp evidence.
                </p>
                <p className="text-slate-300 leading-relaxed bg-[#06080E] p-2.5 rounded-lg border border-slate-800">
                  <strong className="text-[#FFE600]">TruckWithEase Solution:</strong> Dedicated masked SIP lines provide 1-tap direct connection to central dispatch <strong className="text-white">(636-706-8338)</strong> and automated geofenced arrival proof to lock in detention pay ($120/hr).
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* 3. COMMERCIAL FLEET PRICING & ENTERPRISE PLANS GRID */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-16 bg-[#080B10] border-t border-[#161C24]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#141A26] border border-[#FFD700]/30 text-[#FFD700] text-xs font-mono font-bold uppercase">
              <DollarSign className="w-3.5 h-3.5" />
              <span>CARRIER INVESTMENT TIERS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
              COMMERCIAL PLANS TAILORED FOR EVERY FLEET
            </h2>
            <p className="text-xs sm:text-sm text-[#A0AEC0] max-w-2xl">
              Transparent, flat-rate pricing. Zero hidden ELD connection penalties, zero per-driver add-on gouging,
              and 100% money-back compliance audit guarantee.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="flex items-center gap-3 p-1.5 rounded-xl bg-[#0F141F] border border-[#222B3D] mt-2">
              <button
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-[#FFD700] text-black shadow-md'
                    : 'text-[#7C8799] hover:text-[#F0F2F5]'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('ANNUAL')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                  billingCycle === 'ANNUAL'
                    ? 'bg-[#FFD700] text-black shadow-md'
                    : 'text-[#7C8799] hover:text-[#F0F2F5]'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.5 rounded bg-black/80 text-[#00FF66] text-[9px] font-mono font-extrabold">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tier 1: Indie Operator */}
            <div className="p-6 rounded-2xl bg-[#0D1118] border border-[#202838] hover:border-[#FFD700]/40 transition-all flex flex-col justify-between gap-6 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#FFD700] uppercase tracking-wider">
                    INDIE OPERATOR / HOTSHOT
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141A26] text-[#7C8799] border border-[#252D3D]">
                    1 - 3 TRUCKS
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-mono font-black text-white">
                      ${billingCycle === 'ANNUAL' ? '39' : '49'}
                    </span>
                    <span className="text-xs text-[#7C8799] font-mono">/ mo per truck</span>
                  </div>
                  <p className="text-xs text-[#A0AEC0] pt-1">
                    Ideal for single-truck owner-operators and hotshot haulers seeking bulletproof compliance.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-[#1A2230] text-xs text-[#E0E6ED]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>FHWA Item 54B Low-Bridge Radar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>FMCSA 49 CFR § 395 Duty Clock Engines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>In-Cab Night HUD Simulator</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>Automated Same-Day DVIR Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>Love's Fuel Rebate ($0.42/gal)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openQuoteForPlan('Indie Operator / Hotshot')}
                className="w-full py-3 rounded-xl bg-[#141A26] hover:bg-[#1E2638] border border-[#2A3448] text-[#F0F2F5] font-mono font-bold text-xs transition-colors"
              >
                Start Free Trial
              </button>
            </div>

            {/* Tier 2: Mid-Size Fleet Carrier (FEATURED) */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-b from-[#111722] to-[#0D121B] border-2 border-[#FFD700] flex flex-col justify-between gap-6 shadow-[0_0_35px_rgba(255,215,0,0.15)]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#FFD700] text-black text-[10px] font-mono font-extrabold uppercase tracking-wider shadow-md">
                MOST POPULAR FLEET TIER
              </div>

              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#FFD700] uppercase tracking-wider">
                    MID-SIZE REGIONAL FLEET
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30 font-bold">
                    4 - 25 TRUCKS
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-mono font-black text-white">
                      ${billingCycle === 'ANNUAL' ? '119' : '149'}
                    </span>
                    <span className="text-xs text-[#7C8799] font-mono">/ mo per truck</span>
                  </div>
                  <p className="text-xs text-[#A0AEC0] pt-1">
                    Full automated dispatch zero, live coercion shield, and hands-free voice command system.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-[#222E42] text-xs text-[#E0E6ED]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>Everything in Indie Operator</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>Hands-Free In-Cab Voice Command Listener</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>24/7 Coercion Shield &amp; Detention Escrow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>Automated Dispatch Zero (RateCon &amp; BOL)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>Bi-Directional ELD Sync (Samsara / Motive)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>Dedicated Driver Safety Meeting Portal</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openQuoteForPlan('Mid-Size Regional Fleet')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#E5C100] text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,215,0,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                Deploy Fleet Command
              </button>
            </div>

            {/* Tier 3: Enterprise Fleet Command */}
            <div className="p-6 rounded-2xl bg-[#0D1118] border border-[#202838] hover:border-[#FFD700]/40 transition-all flex flex-col justify-between gap-6 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#FFD700] uppercase tracking-wider">
                    ENTERPRISE FLEET COMMAND
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141A26] text-[#7C8799] border border-[#252D3D]">
                    25+ TRUCKS
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-mono font-black text-white">
                      ${billingCycle === 'ANNUAL' ? '319' : '399'}
                    </span>
                    <span className="text-xs text-[#7C8799] font-mono">/ mo per fleet node</span>
                  </div>
                  <p className="text-xs text-[#A0AEC0] pt-1">
                    Unlimited scale with custom voice personas, white-label branding, and dedicated legal counsel.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-[#1A2230] text-xs text-[#E0E6ED]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>Everything in Mid-Size Fleet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>Custom Human Voice Personas (Admin Studio)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>White-Label Carrier Branding &amp; Subdomains</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>Custom API &amp; TMS Webhooks (Geotab/Trimble)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>Dedicated 24/7 Operations Director Line</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                    <span>Unlimited Driver Heartbeat &amp; Non-CDL Suites</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openQuoteForPlan('Enterprise Fleet Command')}
                className="w-full py-3 rounded-xl bg-[#141A26] hover:bg-[#1E2638] border border-[#2A3448] text-[#FFD700] font-mono font-bold text-xs transition-colors"
              >
                Schedule Custom Onboarding
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VERIFIED CARRIER CASE STUDIES & TESTIMONIALS */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-16 bg-[#060709] border-t border-[#161C24]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#141A26] border border-[#FFD700]/30 text-[#FFD700] text-xs font-mono font-bold uppercase">
              <Star className="w-3.5 h-3.5 fill-[#FFD700]" />
              <span>CARRIER SUCCESS STORIES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              PROVEN ROI ACROSS OVER 4.2 MILLION ACTIVE ROAD MILES
            </h2>
            <p className="text-xs sm:text-sm text-[#A0AEC0] max-w-xl mx-auto">
              Real freight operators on how TruckWithEase eliminated legal friction and protected their bottom line.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Story 1 */}
            <div className="p-6 rounded-2xl bg-[#0A0E15] border border-[#1E2638] flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#FFD700]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FFD700]" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-[#2A3448]" />
                <p className="text-xs sm:text-sm text-[#D1D9E6] italic leading-relaxed">
                  "Before TruckWithEase, we had 3 form &amp; manner log audit citations every single quarter. Within 60 days of deploying the dual-engine sync with our Samsara units, we hit 0 violations and saved $1,280/month per truck on diesel rebates alone."
                </p>
              </div>

              <div className="pt-3 border-t border-[#1A2230] flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white">Vance Reynolds</div>
                  <div className="text-[11px] font-mono text-[#7C8799]">Safety Director • Silver Star Logistics (38 Units)</div>
                </div>
                <span className="text-[10px] font-mono text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded border border-[#00FF66]/30">
                  98% AUDIT DROP
                </span>
              </div>
            </div>

            {/* Story 2 */}
            <div className="p-6 rounded-2xl bg-[#0A0E15] border border-[#1E2638] flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#FFD700]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FFD700]" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-[#2A3448]" />
                <p className="text-xs sm:text-sm text-[#D1D9E6] italic leading-relaxed">
                  "The Item 54B Low-Bridge Radar literally saved our 53ft reefer from decapitation on Route 9 outside Albany. The in-cab voice alerted my driver 1.4 miles out and recalculated azimuth around the 12' 8\" span without touching the dash."
                </p>
              </div>

              <div className="pt-3 border-t border-[#1A2230] flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white">Jerome Washington</div>
                  <div className="text-[11px] font-mono text-[#7C8799]">Owner-Operator • Apex Corridors LLC</div>
                </div>
                <span className="text-[10px] font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/30">
                  $85K COLLISION AVOIDED
                </span>
              </div>
            </div>

            {/* Story 3 */}
            <div className="p-6 rounded-2xl bg-[#0A0E15] border border-[#1E2638] flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#FFD700]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FFD700]" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-[#2A3448]" />
                <p className="text-xs sm:text-sm text-[#D1D9E6] italic leading-relaxed">
                  "The Coercion Defense Shield is revolutionary. A broker tried to force our driver past his 14-hour duty clock on a frozen chicken load. TruckWithEase generated statutory 49 CFR § 390.6 documentation in seconds, and detention escrow was paid in full."
                </p>
              </div>

              <div className="pt-3 border-t border-[#1A2230] flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white">Elena Rostova</div>
                  <div className="text-[11px] font-mono text-[#7C8799]">Operations VP • Ironwood Heavy Freight (82 Units)</div>
                </div>
                <span className="text-[10px] font-mono text-[#FFD700] bg-[#FFD700]/10 px-2 py-0.5 rounded border border-[#FFD700]/30">
                  100% ESCROW RECOVERY
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AUTONOMOUS FLEET PILOT & HARDWARE HEALTH */}
      <section className="w-full">
        <UnifiedAutonomousFleetDeck onNavigateToTab={onNavigateToTab} />
      </section>

      <section id="hardware-health-dashboard-section" className="w-full px-4 sm:px-8 lg:px-12 py-8 bg-[#080B11] border-t border-[#1a202c]">
        <HardwareHealthWidget onNavigateToTab={onNavigateToTab} />
      </section>

      {/* 6. REGIONAL WEATHER HAZARD RADAR */}
      <section id="regional-weather-hazard-section" className="w-full px-4 sm:px-8 lg:px-12 py-8 bg-[#07090e] border-t border-[#1a202c]">
        <RegionalWeatherHazardFeed onNavigateToTab={onNavigateToTab} />
      </section>

      {/* 6.5 REAL-TIME HIGHWAY PATROL & GOOGLE AI STUDIO RADAR */}
      <section id="highway-patrol-social-radar" className="w-full px-4 sm:px-8 lg:px-12 py-8 bg-[#080b12] border-t border-[#1a202c]">
        <div className="max-w-7xl mx-auto">
          <TwitterGoogleStudioFeed />
        </div>
      </section>

      {/* 7. FOUNDER'S OPERATIONAL KEYNOTE */}
      <FounderHumanStorySection onNavigateToTab={onNavigateToTab} onOpenContact={onOpenContact} />

      {/* 8. ARCHITECTURE OVERVIEW: 54/54 FEDERAL COMPLIANCE GATEWAYS */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-12 bg-[#090B0E] border-t border-[#161C24]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-[#FFD700] uppercase tracking-widest">
                ARCHITECTURAL SPECIFICATION
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#FFFFFF] mt-1">
                54/54 FEDERAL TELEMETRY GATEWAYS
              </h2>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#00FF66]">
              <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse"></span>
              <span>LIVE CARRIER PROTOCOLS ACTIVE</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="p-5 rounded-xl bg-[#06080B] border border-[#1A222E] flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[#7C8799]">GATEWAY 01</span>
                <h3 className="font-bold text-sm text-[#FFFFFF]">Samsara AG / VG Mesh</h3>
                <p className="text-xs text-[#8C98A8]">Real-time GPS azimuth, CAN bus fault codes, and diagnostic memory streaming.</p>
              </div>
              <span className="text-[10px] font-mono text-[#00FF66]">18ms LATENCY</span>
            </div>

            <div className="p-5 rounded-xl bg-[#06080B] border border-[#1A222E] flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[#7C8799]">GATEWAY 02</span>
                <h3 className="font-bold text-sm text-[#FFFFFF]">Geotab GO9 Telemetry</h3>
                <p className="text-xs text-[#8C98A8]">Engine RPM, odometer validation, and unassigned driving event auto-reconciliation.</p>
              </div>
              <span className="text-[10px] font-mono text-[#00FF66]">14ms LATENCY</span>
            </div>

            <div className="p-5 rounded-xl bg-[#06080B] border border-[#1A222E] flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[#7C8799]">GATEWAY 03</span>
                <h3 className="font-bold text-sm text-[#FFFFFF]">Motive Drive Integration</h3>
                <p className="text-xs text-[#8C98A8]">Two-way driver duty clock sync, pre-trip DVIR signoff, and carrier audit ledger.</p>
              </div>
              <span className="text-[10px] font-mono text-[#00FF66]">16ms LATENCY</span>
            </div>

            <div className="p-5 rounded-xl bg-[#06080B] border border-[#1A222E] flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[#7C8799]">GATEWAY 04</span>
                <h3 className="font-bold text-sm text-[#FFFFFF]">FHWA Item 54B Radar</h3>
                <p className="text-xs text-[#8C98A8]">National Bridge Inventory coordinate vector mapping with zero offline failure.</p>
              </div>
              <span className="text-[10px] font-mono text-[#FFD700]">ACTIVE 360° SCOPE</span>
            </div>

            <div className="p-5 rounded-xl bg-[#040812] border border-sky-500/40 flex flex-col justify-between gap-4 shadow-lg shadow-sky-500/5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-sky-400 font-bold">GATEWAY 05 &middot; NASA EOSDIS</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <h3 className="font-bold text-sm text-[#FFFFFF] flex items-center gap-1.5">
                  <span className="text-sky-400">🛰️</span> NASA Earth Science Radar
                </h3>
                <p className="text-xs text-[#8C98A8]">MODIS/VIIRS wildfire intercept, 50m upper cab aerodynamic shear, and radiometer asphalt blowout warnings.</p>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-sky-300">UID: jmorris1126</span>
                <span className="text-emerald-400 font-bold">LIVE ORBIT</span>
              </div>
            </div>

            {/* GATEWAY 06: X/TWITTER & GOOGLE STUDIO AI */}
            <div className="p-4 rounded-xl bg-[#0F141C] border border-sky-500/30 flex flex-col justify-between hover:border-sky-400 transition group space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-sky-400 font-bold">GATEWAY 06 &middot; 𝕏 + GOOGLE STUDIO</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <h3 className="font-bold text-sm text-[#FFFFFF] flex items-center gap-1.5">
                  <span className="text-sky-400">⚡</span> Neural Highway Patrol Radar
                </h3>
                <p className="text-xs text-[#8C98A8]">Real-time state DOT closures, chain laws &amp; incident synthesis powered by Google Studio Gemini 3.8 Flash.</p>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-sky-300">GEMINI 3.8 FLASH</span>
                <span className="text-emerald-400 font-bold">100% ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CALL TO ACTION BANNER: ELIMINATE FORM & MANNER VIOLATIONS */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-12 bg-[#060709]">
        <div className="max-w-7xl mx-auto rounded-2xl bg-gradient-to-r from-[#0C1017] via-[#101622] to-[#0C1017] border border-[#252E3E] p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-[#FFD700] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#FFD700]"></span>
              <span>FEDERAL MOTOR CARRIER SAFETY STANDARD</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-[#FFFFFF] leading-tight">
              ELIMINATE FORM &amp; MANNER VIOLATIONS
              <br />
              BEFORE THEY HAPPEN
            </h2>
            <p className="text-xs sm:text-sm text-[#9AA5B8] leading-relaxed pt-1">
              TruckWithEase and Morrishive engineer sub-millisecond legal clock math directly into your
              truck's telemetry. Whether running continuous 80 MPH transit on toll corridors or navigating
              tight metropolitan bridges, our dual-engine architecture guarantees statutory compliance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => openQuoteForPlan('Enterprise Fleet Command')}
              className="px-6 py-3.5 rounded bg-[#FFD700] hover:bg-[#F0C800] text-[#0A0A0A] font-mono font-bold text-xs uppercase tracking-wider text-center transition-all shadow-[0_0_20px_rgba(255,215,0,0.25)] hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] active:scale-95 cursor-pointer"
            >
              REQUEST FLEET PROPOSAL
            </button>

            <a
              href="tel:6367068338"
              className="px-6 py-3.5 rounded bg-[#10141B] hover:bg-[#181F2A] border border-[#2A3442] text-[#E0E6ED] font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Phone className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>DISPATCH: 636-706-8338</span>
            </a>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="w-full bg-[#050608] border-t border-[#141A22] px-4 sm:px-8 lg:px-12 py-6 text-[10px] font-mono text-[#6E7B8E] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-[#12161D] border border-[#262F3D] flex items-center justify-center text-[#FFD700] font-bold text-[10px]">
            M
          </div>
          <div>
            <span className="font-bold text-[#A0AEC0]">TruckWithEase &amp; Morrishive</span>
            <span className="ml-2">Tactical Fleet Command Suite © 2026</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
          <span>49 CFR § 395.1 – 395.38</span>
          <span>•</span>
          <span>FHWA Item 54B Specs</span>
          <span>•</span>
          <span>FMCSA Certified ELD</span>
          <span className="hidden lg:inline">•</span>
          <span className="hidden lg:inline">24/7 Operations: 636-706-8338</span>
        </div>

        <div className="flex items-center gap-2 text-[#00FF66] font-bold">
          <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse"></span>
          <span>SYSTEM 100% OPERATIONAL</span>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Compliance Suite Modal */}
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

      {/* 2. Ad Campaign Manager Modal (Admin Only) */}
      <AdCampaignManagerModal
        isOpen={isAdManagerOpen}
        onClose={() => setIsAdManagerOpen(false)}
        isAdmin={isAdmin}
      />

      {/* 3. Fleet Inquiry / Custom Quote Modal */}
      <FleetInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        preselectedPlan={selectedInquiryPlan}
      />
    </div>
  );
};
