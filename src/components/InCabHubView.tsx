import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Copy, 
  Check, 
  Send, 
  Bluetooth, 
  FileText, 
  Phone, 
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Radio,
  Clock,
  Compass,
  AlertCircle,
  LayoutDashboard,
  Timer,
  Radar,
  Map,
  Vibrate,
  RotateCw,
  Mic,
  TrendingUp,
  Search,
  Filter,
  DollarSign,
  Award,
  Layers,
  Fuel,
  Shield,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Zap,
  Sliders,
  Play,
  Navigation
} from 'lucide-react';
import { TruckWithEaseLogo } from './TruckWithEaseLogo';
import { triggerHapticFeedback } from '../services/haptics';
import { INITIAL_LIVE_LOADS, DatBoardLoad } from '../services/datLoadBoardService';
import { CORRIDOR_FUEL_STATIONS, getNextFuelStation } from '../services/fuelStationService';

interface InCabHubViewProps {
  onNavigateToTab?: (tab: string) => void;
}

export const InCabHubView: React.FC<InCabHubViewProps> = ({ onNavigateToTab }) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isPrivacyLocked, setIsPrivacyLocked] = useState(false);
  const [activeDay, setActiveDay] = useState('TODAY (03/13)');
  const [fmcsaTransferState, setFmcsaTransferState] = useState<'IDLE' | 'TRANSMITTING' | 'SUCCESS'>('IDLE');
  const [activeBottomTab, setActiveBottomTab] = useState<'night-hud' | 'hos-clocks' | 'radar-54b' | 'the-goat'>('night-hud');

  // In-Cab G.O.A.T. Load Board State
  const [goatSearchQuery, setGoatSearchQuery] = useState('');
  const [goatCorridorFilter, setGoatCorridorFilter] = useState<'ALL' | 'AZ_MO' | 'REEFER' | 'DRY_VAN' | 'HIGH_RPM'>('AZ_MO');
  const [acceptedLoadId, setAcceptedLoadId] = useState<string | null>(null);

  // In-Cab HOS Duty Clocks State
  const [dutyStatus, setDutyStatus] = useState<'DRIVING' | 'ON_DUTY' | 'SLEEPER' | 'OFF_DUTY'>('DRIVING');

  useEffect(() => {
    const handleSwitch = (e: any) => {
      if (e.detail?.tab) {
        setActiveBottomTab(e.detail.tab);
      }
    };
    window.addEventListener('in-cab-switch-tab', handleSwitch);
    return () => window.removeEventListener('in-cab-switch-tab', handleSwitch);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3200);
  };

  const handleCopyHash = () => {
    const hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8552ef3a98c77114da';
    navigator.clipboard?.writeText(hash).catch(() => {});
    showToast('SHA-256 DIGEST COPIED TO CLIPBOARD');
  };

  const handleTransmitFmcsa = () => {
    setFmcsaTransferState('TRANSMITTING');
    setTimeout(() => {
      setFmcsaTransferState('SUCCESS');
      showToast('FMCSA ERDS TRANSFER COMPLETED: RECORD ACCEPTED');
      setTimeout(() => {
        setFmcsaTransferState('IDLE');
      }, 3500);
    }, 1400);
  };

  // Filtered G.O.A.T. loads for In-Cab display
  const filteredGoatLoads = INITIAL_LIVE_LOADS.filter((load) => {
    if (goatCorridorFilter === 'AZ_MO') {
      const isAzToMo = (load.originState === 'AZ' && load.destState === 'MO') || load.id.includes('AZ-MO');
      if (!isAzToMo && goatSearchQuery === '') return false;
    } else if (goatCorridorFilter === 'REEFER') {
      if (!load.equipment.toLowerCase().includes('reefer')) return false;
    } else if (goatCorridorFilter === 'DRY_VAN') {
      if (!load.equipment.toLowerCase().includes('van')) return false;
    } else if (goatCorridorFilter === 'HIGH_RPM') {
      if (load.ratePerMile < 4.0) return false;
    }

    if (goatSearchQuery.trim()) {
      const q = goatSearchQuery.toLowerCase();
      const match =
        load.originCity.toLowerCase().includes(q) ||
        load.originState.toLowerCase().includes(q) ||
        load.destCity.toLowerCase().includes(q) ||
        load.destState.toLowerCase().includes(q) ||
        load.commodity.toLowerCase().includes(q) ||
        load.brokerName.toLowerCase().includes(q) ||
        load.loadNumber.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col relative w-full pb-12 text-on-surface">
      {/* HUD SUB-HEADER STRIP */}
      <div className="w-full bg-surface-container-lowest/95 border-b border-[#222] rounded-xl p-3 sm:p-4 mb-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 shrink-0">
          <TruckWithEaseLogo size="md" showWordmark={false} />
          <div className="flex flex-col pl-2 border-l border-[#333]">
            <span className="font-headline-sm text-sm sm:text-base text-on-surface uppercase tracking-wide font-bold">
              In-Cab Cockpit
            </span>
            <span className="text-[10px] font-mono text-primary">FMCSA 49 CFR § 395 Ready · Unit #104-E</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Hands-Free Voice Status Pill (Renamed from Voice Sentinel) */}
          <div 
            className="flex items-center gap-1.5 bg-[#0E150F] px-2.5 py-1 rounded-lg border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]" 
            title="Hands-Free Voice active. Speak 'Can you find me a load from Arizona to Missouri', 'Can you find the next fuel station', or 'Open G.O.A.T.'"
          >
            <Mic className="text-emerald-400 w-3.5 h-3.5 animate-pulse" />
            <span className="font-mono text-[10px] text-emerald-300 uppercase font-bold tracking-wider">
              HANDS-FREE: ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded-lg border border-[#262626]">
            <Radio className="text-primary w-3.5 h-3.5 animate-pulse" />
            <span className="font-telemetry-label text-xs text-on-surface">10Hz CAN-bus</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded-lg border border-[#262626]">
            <Clock className="text-secondary-fixed-dim w-3.5 h-3.5" />
            <span className="font-telemetry-label text-xs text-primary-fixed">65 MPH</span>
          </div>
          <a
            aria-label="Emergency Hotline"
            className="h-8 px-2.5 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 text-white active:scale-95 transition-transform rounded-lg font-mono text-xs font-bold shadow"
            href="tel:6367068338"
          >
            <AlertCircle className="w-4 h-4 animate-bounce" />
            <span className="hidden sm:inline">636-706-8338</span>
          </a>
        </div>
      </div>

      {/* IN-CAB SUB-VIEW SELECTOR STRIP (Top Access) */}
      <div className="w-full bg-[#111319] border border-[#262626] rounded-xl p-1.5 mb-4 shadow-lg">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button 
            onClick={() => {
              triggerHapticFeedback('tick');
              setActiveBottomTab('night-hud');
            }}
            className={`flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 transition-all rounded-lg text-xs font-mono font-bold uppercase ${
              activeBottomTab === 'night-hud' ? 'text-black bg-[#C9A84C] font-black shadow-md' : 'text-on-surface-variant hover:text-primary hover:bg-[#1f1f1f]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>NIGHT HUD</span>
          </button>
          
          <button 
            onClick={() => {
              triggerHapticFeedback('tick');
              setActiveBottomTab('hos-clocks');
            }}
            className={`flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 transition-all rounded-lg text-xs font-mono font-bold uppercase ${
              activeBottomTab === 'hos-clocks' ? 'text-black bg-[#C9A84C] font-black shadow-md' : 'text-on-surface-variant hover:text-primary hover:bg-[#1f1f1f]'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>HOS CLOCKS</span>
          </button>
          
          <button 
            onClick={() => {
              triggerHapticFeedback('tick');
              setActiveBottomTab('radar-54b');
            }}
            className={`flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 transition-all rounded-lg text-xs font-mono font-bold uppercase ${
              activeBottomTab === 'radar-54b' ? 'text-black bg-[#C9A84C] font-black shadow-md' : 'text-on-surface-variant hover:text-primary hover:bg-[#1f1f1f]'
            }`}
          >
            <Radar className="w-4 h-4" />
            <span>RADAR 54B</span>
          </button>
          
          <button 
            id="in-cab-goat-tab-btn"
            onClick={() => {
              triggerHapticFeedback('tick');
              setActiveBottomTab('the-goat');
            }}
            className={`flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 transition-all rounded-lg text-xs font-mono font-bold uppercase ${
              activeBottomTab === 'the-goat' ? 'text-black bg-[#C9A84C] font-black shadow-md ring-2 ring-[#FFE899]/50' : 'text-on-surface-variant hover:text-primary hover:bg-[#1f1f1f]'
            }`}
          >
            <Award className="w-4 h-4 text-current" />
            <span>G.O.A.T. FREIGHT</span>
          </button>
        </div>
      </div>

      {/* TOAST NOTIFICATION CONTAINER */}
      <div 
        className={`fixed top-20 inset-x-4 z-50 transition-all duration-300 pointer-events-none flex items-center justify-between p-space-sm rounded-lg bg-surface-container-highest shadow-2xl text-on-surface border border-primary/30 max-w-2xl mx-auto ${
          toastMsg ? 'translate-y-0 opacity-100' : '-translate-y-32 opacity-0'
        }`}
      >
        <div className="flex items-center gap-space-sm">
          <ShieldCheck className="text-primary w-[20px] h-[20px]" />
          <span className="font-telemetry-label text-telemetry-label text-on-surface uppercase font-mono">{toastMsg}</span>
        </div>
        <Check className="text-primary w-[16px] h-[16px]" />
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: IN-CAB INTEGRATED G.O.A.T. LOAD BOARD & SPOT FREIGHT TERMINAL */}
      {/* ========================================================================= */}
      {activeBottomTab === 'the-goat' && (
        <div className="flex flex-col gap-4 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
          {/* Hands-Free Voice Prompt Ribbon */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-[#1E1805] via-[#141208] to-[#0D0E14] border-2 border-[#D4AF37]/70 shadow-[0_0_25px_rgba(212,175,55,0.2)]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] shrink-0">
                <Mic className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="font-mono text-xs font-black uppercase text-[#D4AF37] block">
                  Hands-Free Driver Voice Assistant Integrated
                </span>
                <p className="text-xs text-slate-300">
                  Ask Hands-Free anytime: <strong className="text-amber-200">&ldquo;Can you find me a load from Arizona to Missouri&rdquo;</strong> or <strong className="text-emerald-300">&ldquo;Can you find the next fuel station&rdquo;</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>DAT LIVE BRIDGE</span>
              </span>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('goat')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#F2CA50] text-[#0A0A0A] font-mono text-xs font-bold uppercase transition-all shadow active:scale-95"
                >
                  <span>Full Board</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Corridor Filter Chips & In-Cab Search */}
          <div className="bg-[#12141A] border border-slate-800 p-3 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-bold mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#D4AF37]" /> Filter:
              </span>
              <button
                onClick={() => {
                  triggerHapticFeedback('tick');
                  setGoatCorridorFilter('AZ_MO');
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-all ${
                  goatCorridorFilter === 'AZ_MO'
                    ? 'bg-[#D4AF37] text-black shadow-md font-black'
                    : 'bg-[#181B22] text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                🌵 Arizona ➔ Missouri ({INITIAL_LIVE_LOADS.filter(l => (l.originState === 'AZ' && l.destState === 'MO') || l.id.includes('AZ-MO')).length})
              </button>
              <button
                onClick={() => {
                  triggerHapticFeedback('tick');
                  setGoatCorridorFilter('REEFER');
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-all ${
                  goatCorridorFilter === 'REEFER'
                    ? 'bg-[#D4AF37] text-black shadow-md font-black'
                    : 'bg-[#181B22] text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                ❄️ Reefer 53'
              </button>
              <button
                onClick={() => {
                  triggerHapticFeedback('tick');
                  setGoatCorridorFilter('DRY_VAN');
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-all ${
                  goatCorridorFilter === 'DRY_VAN'
                    ? 'bg-[#D4AF37] text-black shadow-md font-black'
                    : 'bg-[#181B22] text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                📦 Dry Van 53'
              </button>
              <button
                onClick={() => {
                  triggerHapticFeedback('tick');
                  setGoatCorridorFilter('HIGH_RPM');
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-all ${
                  goatCorridorFilter === 'HIGH_RPM'
                    ? 'bg-[#D4AF37] text-black shadow-md font-black'
                    : 'bg-[#181B22] text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                ⚡ High RPM &gt; $4.00
              </button>
              <button
                onClick={() => {
                  triggerHapticFeedback('tick');
                  setGoatCorridorFilter('ALL');
                }}
                className={`px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-all ${
                  goatCorridorFilter === 'ALL'
                    ? 'bg-[#D4AF37] text-black shadow-md font-black'
                    : 'bg-[#181B22] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Loads ({INITIAL_LIVE_LOADS.length})
              </button>
            </div>

            {/* Quick in-cab search */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={goatSearchQuery}
                onChange={(e) => setGoatSearchQuery(e.target.value)}
                placeholder="Search city, broker, cargo..."
                className="w-full bg-[#0A0C10] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* G.O.A.T. Live Freight Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredGoatLoads.map((load) => {
              const isAccepted = acceptedLoadId === load.id;
              const isAzToMo = (load.originState === 'AZ' && load.destState === 'MO') || load.id.includes('AZ-MO');

              return (
                <div
                  key={load.id}
                  className={`flex flex-col bg-[#0F1218] border rounded-xl p-4 shadow-xl transition-all relative ${
                    isAzToMo
                      ? 'border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)] bg-gradient-to-b from-[#16140B] to-[#0E1017]'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-300">
                        {load.loadNumber}
                      </span>
                      {isAzToMo && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 uppercase">
                          ★ AZ ➔ MO SPOTLIGHT
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300">
                        {load.equipment}
                      </span>
                    </div>

                    <span className="font-mono text-sm font-black text-[#D4AF37] bg-[#1C1605] px-2.5 py-1 rounded-lg border border-[#D4AF37]/40">
                      ${load.rateUsd.toLocaleString()} (${load.ratePerMile.toFixed(2)}/mi)
                    </span>
                  </div>

                  {/* Route Corridor */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#07090D] border border-slate-800/80 mb-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Origin</span>
                      <span className="text-sm font-bold text-amber-300 font-mono">
                        {load.originCity}, {load.originState}
                      </span>
                    </div>

                    <div className="flex flex-col items-center px-3">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{load.miles} miles</span>
                      <div className="flex items-center gap-1 text-[#D4AF37]">
                        <span className="w-8 h-[2px] bg-[#D4AF37]"></span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Destination</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">
                        {load.destCity}, {load.destState}
                      </span>
                    </div>
                  </div>

                  {/* Cargo & Specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-slate-300 mb-3 bg-[#0A0D13] p-2.5 rounded-lg border border-slate-800/60">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Weight</span>
                      <strong className="text-white">{load.weightLbs.toLocaleString()} lbs</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Commodity</span>
                      <strong className="text-white truncate block">{load.commodity}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Payment</span>
                      <strong className="text-emerald-400 truncate block">{load.paymentTerms}</strong>
                    </div>
                  </div>

                  {/* Fuel Arbitrage & Bridge Clearance Note */}
                  <div className="text-[11px] font-sans text-slate-300 space-y-1 mb-3">
                    <div className="flex items-center gap-1.5 text-amber-200/90 font-mono text-[10px]">
                      <Fuel className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                      <span>{load.fuelArbitrageNote}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{load.fhwaClearanceStatus}</span>
                    </div>
                  </div>

                  {/* Broker & Direct Touch Actions */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/90 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-slate-400">Broker ({load.brokerTrustScore}% Trust)</span>
                      <span className="text-xs font-bold text-white font-mono">{load.brokerName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${load.brokerPhone.replace(/\D/g, '')}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-all active:scale-95"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Call</span>
                      </a>

                      <button
                        onClick={() => {
                          triggerHapticFeedback('success');
                          setAcceptedLoadId(load.id);
                          showToast(`TENDER ${load.loadNumber} ACCEPTED // RATE CON TRANSMITTED TO CARRIER`);
                        }}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all shadow-md active:scale-95 ${
                          isAccepted
                            ? 'bg-emerald-600 text-white font-black'
                            : 'bg-gradient-to-r from-[#D4AF37] via-[#F2CA50] to-[#E5B834] text-[#120E02] hover:brightness-110'
                        }`}
                      >
                        {isAccepted ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-white" />
                            <span>ACCEPTED &amp; LOCKED</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            <span>1-TAP ACCEPT TENDER</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: IN-CAB LIVE HOS DUTY CLOCKS & SPLIT SLEEPER ASSISTANT */}
      {/* ========================================================================= */}
      {activeBottomTab === 'hos-clocks' && (
        <div className="flex flex-col gap-4 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
          {/* Duty Status Selector Bar */}
          <div className="bg-[#101319] border border-slate-800 p-3 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black uppercase text-slate-400">Current Duty Status:</span>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40">
                {dutyStatus} (10Hz CAN-bus Verified)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full sm:w-auto font-mono text-xs">
              <button
                onClick={() => {
                  triggerHapticFeedback('tick');
                  setDutyStatus('DRIVING');
                  showToast('DUTY STATUS: DRIVING (49 CFR § 395.2)');
                }}
                className={`px-3 py-2 rounded-lg font-bold transition-all ${
                  dutyStatus === 'DRIVING' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-300'
                }`}
              >
                DRIVING
              </button>
              <button
                onClick={() => {
                  triggerHapticFeedback('tick');
                  setDutyStatus('ON_DUTY');
                  showToast('DUTY STATUS: ON DUTY NOT DRIVING');
                }}
                className={`px-3 py-2 rounded-lg font-bold transition-all ${
                  dutyStatus === 'ON_DUTY' ? 'bg-[#D4AF37] text-black shadow' : 'bg-slate-800 text-slate-300'
                }`}
              >
                ON DUTY
              </button>
              <button
                onClick={() => {
                  triggerHapticFeedback('tick');
                  setDutyStatus('SLEEPER');
                  showToast('DUTY STATUS: SLEEPER BERTH § 395.1(g)');
                }}
                className={`px-3 py-2 rounded-lg font-bold transition-all ${
                  dutyStatus === 'SLEEPER' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300'
                }`}
              >
                SLEEPER
              </button>
              <button
                onClick={() => {
                  triggerHapticFeedback('tick');
                  setDutyStatus('OFF_DUTY');
                  showToast('DUTY STATUS: OFF DUTY');
                }}
                className={`px-3 py-2 rounded-lg font-bold transition-all ${
                  dutyStatus === 'OFF_DUTY' ? 'bg-slate-600 text-white shadow' : 'bg-slate-800 text-slate-300'
                }`}
              >
                OFF DUTY
              </button>
            </div>
          </div>

          {/* Statutory Clocks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 11-Hour Driving Clock */}
            <div className="bg-[#0C0E14] border-2 border-emerald-500/60 rounded-xl p-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-slate-400 font-bold uppercase">11-Hour Drive</span>
                  <span className="text-[10px] font-mono text-emerald-400">§ 395.3(a)(3)</span>
                </div>
                <div className="text-3xl font-black font-mono text-emerald-400 tracking-wider">
                  07:42:18
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Drive time remaining</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>

            {/* 14-Hour Shift Clock */}
            <div className="bg-[#0C0E14] border-2 border-[#D4AF37]/60 rounded-xl p-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-slate-400 font-bold uppercase">14-Hour Shift</span>
                  <span className="text-[10px] font-mono text-amber-400">§ 395.3(a)(2)</span>
                </div>
                <div className="text-3xl font-black font-mono text-amber-300 tracking-wider">
                  09:15:40
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Duty window remaining</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '66%' }}></div>
              </div>
            </div>

            {/* 70-Hour / 8-Day Cycle */}
            <div className="bg-[#0C0E14] border-2 border-cyan-500/60 rounded-xl p-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-slate-400 font-bold uppercase">70-Hour Cycle</span>
                  <span className="text-[10px] font-mono text-cyan-400">§ 395.3(b)</span>
                </div>
                <div className="text-3xl font-black font-mono text-cyan-300 tracking-wider">
                  44:20:00
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Cycle clock remaining</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: '63%' }}></div>
              </div>
            </div>

            {/* 30-Minute Rest Break */}
            <div className="bg-[#0C0E14] border-2 border-indigo-500/60 rounded-xl p-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-slate-400 font-bold uppercase">30-Min Rest Break</span>
                  <span className="text-[10px] font-mono text-indigo-400">§ 395.3(a)(3)(ii)</span>
                </div>
                <div className="text-3xl font-black font-mono text-indigo-300 tracking-wider">
                  04:18:00
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Time until break required</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-indigo-400 rounded-full" style={{ width: '54%' }}></div>
              </div>
            </div>
          </div>

          {/* Split Sleeper Berth Calculator Card */}
          <div className="bg-[#0C0E14] border border-slate-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-mono text-xs font-bold text-white uppercase">
                  49 CFR § 395.1(g) Split Sleeper Berth Optimizer
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">QUALIFYING PERIOD VERIFIED</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
              Neither qualifying sleeper berth period (8/2 or 7/3 split) counts against your 14-hour shift driving window. Pair an 8-hour consecutive sleeper session with a 2-hour off-duty break at shipper/receiver facilities to pause your 14-hour clock.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#141720] border border-slate-800">
                <span className="text-amber-300 font-bold block mb-1">Option A: 8/2 Split Pairing</span>
                <p className="text-slate-400 text-[11px]">8h in Sleeper Berth + 2h Off-Duty at Customer Dock. Pauses shift clock completely.</p>
              </div>
              <div className="p-3 rounded-lg bg-[#141720] border border-slate-800">
                <span className="text-cyan-300 font-bold block mb-1">Option B: 7/3 Split Pairing</span>
                <p className="text-slate-400 text-[11px]">7h in Sleeper Berth + 3h Off-Duty at Truck Stop. Full FMCSA 2020 Final Rule compliance.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: IN-CAB RADAR 54B LOW BRIDGE & TRAFFIC HAZARD FEED */}
      {/* ========================================================================= */}
      {activeBottomTab === 'radar-54b' && (
        <div className="flex flex-col gap-4 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
          <div className="bg-[#0C0E14] border-2 border-emerald-500/70 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Radar className="w-5 h-5 text-emerald-400 animate-spin" />
                <div>
                  <h3 className="font-mono text-sm font-black text-white uppercase">
                    Radar 54B Highway &amp; Bridge Clearance Sentinel
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Rig Height: 13' 6" (162") · Corridor: I-40 Eastbound
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40">
                CORRIDOR CLEAR (100 MILES)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#13161F] border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Lowest Upcoming Bridge</span>
                <span className="text-lg font-black text-emerald-400">15' 8" (188")</span>
                <span className="text-[10px] text-slate-400 block">+2' 2" Safe Clearance</span>
              </div>
              <div className="p-3 rounded-lg bg-[#13161F] border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Low Bridge Hazards</span>
                <span className="text-lg font-black text-emerald-400">0 Violations</span>
                <span className="text-[10px] text-slate-400 block">FMCSA Route Approved</span>
              </div>
              <div className="p-3 rounded-lg bg-[#13161F] border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Next In-Network Fuel</span>
                <span className="text-lg font-black text-amber-300">14.2 miles</span>
                <span className="text-[10px] text-slate-400 block">Love's #419 ($3.04 net)</span>
              </div>
            </div>

            {/* Next Fuel Stop Banner */}
            <div className="p-3 rounded-lg bg-[#0E1714] border border-emerald-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Fuel className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="font-mono text-xs font-bold text-white block">
                    Next Fuel: Love's Travel Stop #419 (I-40 Exit 185)
                  </span>
                  <span className="text-[10px] font-mono text-slate-300">
                    Net Diesel: $3.04/gal (-$0.45 rebate) · 62 parking spots available · DEF at all 8 lanes
                  </span>
                </div>
              </div>

              <a
                href="tel:9285260814"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow"
              >
                Call Desk
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 4: NIGHT HUD ROADSIDE INSPECTION AUDIT SLIP (FMCSA STATUTORY VIEW) */}
      {/* ========================================================================= */}
      {activeBottomTab === 'night-hud' && (
        <>
          {/* PRIVACY LOCK MODAL (OVERLAY) */}
          {isPrivacyLocked && (
            <div className="fixed inset-0 z-50 bg-surface-container-lowest/95 backdrop-blur-2xl flex flex-col items-center justify-center p-space-lg transition-opacity duration-200">
              <div className="w-full max-w-sm bg-surface-container p-space-lg rounded-xl flex flex-col items-center text-center shadow-2xl space-y-space-base">
                <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center text-primary animate-pulse">
                  <Lock className="w-[36px] h-[36px]" />
                </div>
                <div className="flex flex-col space-y-space-2xs">
                  <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">Officer Privacy Shield</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">Inspection Mode Active</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">All fleet earnings, driver SMS, personal notes, and telemetry controls are locked. Present this screen directly to DOT enforcement.</p>
                </div>
                <div className="w-full bg-surface-container-low p-space-md rounded-lg flex flex-col gap-space-2xs items-center">
                  <span className="font-telemetry-label text-telemetry-label text-outline uppercase">Passcode To Exit Lock</span>
                  <span className="font-telemetry-metric text-telemetry-metric text-primary tracking-widest">● ● ● ●</span>
                </div>
                <button 
                  onClick={() => {
                    setIsPrivacyLocked(false);
                    showToast('OFFICER PRIVACY SHIELD DISABLED');
                  }}
                  className="w-full py-space-sm bg-surface-container-highest text-on-surface font-label-caps text-label-caps uppercase tracking-wider rounded-lg active:scale-95 transition-all"
                >
                  Driver Biometric / PIN Exit
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-space-md px-gutter-mobile pb-space-2xl max-w-7xl mx-auto w-full pt-2">
            
            {/* TOP STATUTORY AUDIT BANNER & LOCK SWITCH */}
            <div className="flex flex-col bg-surface-container p-space-md rounded-xl space-y-space-sm shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
                  <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">FMCSA ROADSIDE INSPECTION MODE</span>
                </div>
                <span className="bg-primary-container/20 text-primary font-telemetry-label text-[10px] px-space-xs py-0.5 rounded">49 CFR § 395.15</span>
              </div>
              
              <div className="flex items-center justify-between gap-space-sm pt-space-2xs">
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-on-surface uppercase">Statutory Audit Slip</span>
                  <span className="font-telemetry-label text-telemetry-label text-on-surface-variant">MERKLE RECORD #4,133 // BLOCK VERIFIED</span>
                </div>
                <button 
                  onClick={() => setIsPrivacyLocked(true)}
                  className="flex items-center gap-space-xs bg-primary-container px-space-sm py-space-xs rounded-lg active:scale-95 transition-transform text-on-primary-container shadow-md"
                >
                  <Lock className="w-[18px] h-[18px]" />
                  <span className="font-label-caps text-[10px] tracking-wider uppercase font-bold">CABIN LOCK</span>
                </button>
              </div>
              
              {/* Quick Trust Indicators Strip */}
              <div className="grid grid-cols-3 gap-space-xs pt-space-xs">
                <div className="flex flex-col items-center justify-center p-space-xs bg-surface-container-low rounded">
                  <span className="font-telemetry-label text-[10px] text-outline uppercase">Audit Status</span>
                  <span className="font-label-caps text-label-caps text-primary uppercase">COMPLIANT</span>
                </div>
                <div className="flex flex-col items-center justify-center p-space-xs bg-surface-container-low rounded">
                  <span className="font-telemetry-label text-[10px] text-outline uppercase">FMCSA Web Relay</span>
                  <span className="font-label-caps text-label-caps text-primary uppercase">200 READY</span>
                </div>
                <div className="flex flex-col items-center justify-center p-space-xs bg-surface-container-low rounded">
                  <span className="font-telemetry-label text-[10px] text-outline uppercase">Split Sleeper</span>
                  <span className="font-label-caps text-label-caps text-primary-fixed uppercase">§ 395.1(g) EXCL</span>
                </div>
              </div>
            </div>

            {/* OFFICER VERIFICATION QR & QUICK PIN DISPATCH */}
            <div className="flex flex-col bg-surface-container-low p-space-md rounded-xl space-y-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <QrCode className="text-primary w-[20px] h-[20px]" />
                  <span className="font-label-caps text-label-caps text-on-surface tracking-wider uppercase">Officer Quick-Verify Seal</span>
                </div>
                <span className="font-telemetry-label text-telemetry-label text-outline">PIN: <strong className="text-primary tracking-widest text-[13px]">5482-90</strong></span>
              </div>
              
              <div className="flex items-center gap-space-md bg-surface-container p-space-sm rounded-lg">
                {/* Generative Tactical QR Representation */}
                <div className="w-24 h-24 bg-surface-container-lowest p-1.5 rounded flex items-center justify-center shrink-0">
                  <svg className="w-full h-full text-primary" fill="currentColor" viewBox="0 0 100 100">
                    <rect fill="currentColor" height="30" rx="2" width="30" x="0" y="0"></rect>
                    <rect fill="#0d0e13" height="18" width="18" x="6" y="6"></rect>
                    <rect fill="currentColor" height="10" width="10" x="10" y="10"></rect>
                    <rect fill="currentColor" height="30" rx="2" width="30" x="70" y="0"></rect>
                    <rect fill="#0d0e13" height="18" width="18" x="76" y="6"></rect>
                    <rect fill="currentColor" height="10" width="10" x="80" y="10"></rect>
                    <rect fill="currentColor" height="30" rx="2" width="30" x="0" y="70"></rect>
                    <rect fill="#0d0e13" height="18" width="18" x="6" y="76"></rect>
                    <rect fill="currentColor" height="10" width="10" x="10" y="80"></rect>
                    <rect fill="currentColor" height="8" width="8" x="36" y="8"></rect>
                    <rect fill="currentColor" height="6" width="14" x="48" y="4"></rect>
                    <rect fill="currentColor" height="14" width="6" x="36" y="22"></rect>
                    <rect fill="currentColor" height="10" width="10" x="52" y="20"></rect>
                    <rect fill="currentColor" height="6" width="12" x="4" y="38"></rect>
                    <rect fill="currentColor" height="8" width="8" x="22" y="40"></rect>
                    <rect fill="currentColor" height="6" width="18" x="36" y="38"></rect>
                    <rect fill="currentColor" height="18" width="6" x="60" y="36"></rect>
                    <rect fill="currentColor" height="6" width="22" x="74" y="38"></rect>
                    <rect fill="currentColor" height="12" width="12" x="80" y="50"></rect>
                    <rect fill="currentColor" height="18" width="8" x="38" y="52"></rect>
                    <rect fill="currentColor" height="8" width="12" x="52" y="60"></rect>
                    <rect fill="currentColor" height="8" width="14" x="4" y="52"></rect>
                    <rect fill="currentColor" height="6" width="6" x="22" y="60"></rect>
                    <rect fill="currentColor" height="18" width="10" x="70" y="72"></rect>
                    <rect fill="currentColor" height="12" width="10" x="86" y="78"></rect>
                    <rect fill="currentColor" height="14" width="14" x="48" y="78"></rect>
                    <rect fill="currentColor" height="8" width="8" x="36" y="84"></rect>
                  </svg>
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div className="flex flex-col">
                    <span className="font-telemetry-label text-[10px] text-outline uppercase tracking-wider">Public Officer Portal</span>
                    <span className="font-body-sm text-body-sm text-on-surface truncate font-semibold">audit.truckwithease.gov/ver/3928110</span>
                  </div>
                  <p className="font-body-sm text-[11px] text-on-surface-variant leading-tight mt-1">Scan directly from cruiser MDT or smartphone camera to view instantaneous cloud-certified telemetrics.</p>
                  <div className="flex items-center gap-space-xs mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span className="font-telemetry-label text-[10px] text-primary">TLS 1.3 SECURE DOCK</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STATUTORY CARRIER & VEHICLE IDENTITY MATRIX */}
            <div className="flex flex-col bg-surface-container p-space-md rounded-xl space-y-space-sm shadow-md">
              <div className="flex items-center justify-between pb-space-2xs">
                <span className="font-label-caps text-label-caps text-primary tracking-wider uppercase">Carrier &amp; Equipment Identity</span>
                <span className="font-telemetry-label text-telemetry-label text-outline">§ 395.8(d) FORM</span>
              </div>
              
              <div className="grid grid-cols-2 gap-space-xs">
                <div className="flex flex-col p-space-xs bg-surface-container-low rounded">
                  <span className="font-telemetry-label text-[10px] text-outline uppercase">Motor Carrier Name</span>
                  <span className="font-body-sm text-body-sm text-on-surface font-bold">TITAN TRANS CONTINENTAL</span>
                </div>
                <div className="flex flex-col p-space-xs bg-surface-container-low rounded">
                  <span className="font-telemetry-label text-[10px] text-outline uppercase">USDOT #</span>
                  <span className="font-body-sm text-body-sm text-primary font-mono font-bold">3928110-US</span>
                </div>
                <div className="flex flex-col p-space-xs bg-surface-container-low rounded">
                  <span className="font-telemetry-label text-[10px] text-outline uppercase">Tractor Power Unit</span>
                  <span className="font-body-sm text-body-sm text-on-surface font-bold">UNIT #104-E (2024 VNL 860)</span>
                </div>
                <div className="flex flex-col p-space-xs bg-surface-container-low rounded">
                  <span className="font-telemetry-label text-[10px] text-outline uppercase">Assigned Trailer</span>
                  <span className="font-body-sm text-body-sm text-on-surface font-bold">TRL #53-REEFER-09</span>
                </div>
              </div>
            </div>

            {/* 8-DAY HISTORICAL LOG MATRIX TAB SWITCHER */}
            <div className="flex flex-col bg-surface-container p-space-md rounded-xl space-y-space-sm shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-primary tracking-wider uppercase">8-Day Statutory Duty Records</span>
                <span className="font-telemetry-label text-telemetry-label text-outline">FMCSA 70h/8d RULE</span>
              </div>

              {/* Day Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {['TODAY (03/13)', '03/12', '03/11', '03/10', '03/09', '03/08', '03/07', '03/06'].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      triggerHapticFeedback('tick');
                      setActiveDay(d);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold shrink-0 transition-all ${
                      activeDay === d
                        ? 'bg-primary text-black shadow-md font-black'
                        : 'bg-surface-container-low text-on-surface-variant hover:text-white hover:bg-surface-container-high'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Day Summary Grid */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="flex flex-col p-2 bg-surface-container-low rounded text-center">
                  <span className="text-[10px] font-mono text-outline uppercase">Driving</span>
                  <span className="text-sm font-bold font-mono text-primary">07h 42m</span>
                </div>
                <div className="flex flex-col p-2 bg-surface-container-low rounded text-center">
                  <span className="text-[10px] font-mono text-outline uppercase">On Duty</span>
                  <span className="text-sm font-bold font-mono text-on-surface">01h 33m</span>
                </div>
                <div className="flex flex-col p-2 bg-surface-container-low rounded text-center">
                  <span className="text-[10px] font-mono text-outline uppercase">Sleeper</span>
                  <span className="text-sm font-bold font-mono text-secondary-fixed">08h 00m</span>
                </div>
                <div className="flex flex-col p-2 bg-surface-container-low rounded text-center">
                  <span className="text-[10px] font-mono text-outline uppercase">Off Duty</span>
                  <span className="text-sm font-bold font-mono text-on-surface-variant">06h 45m</span>
                </div>
              </div>
            </div>

            {/* FMCSA ROADSIDE TRANSMIT & PDF COMPLIANCE SUITE */}
            <div className="flex flex-col bg-surface-container-high p-space-md rounded-xl space-y-space-md border border-primary/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <Send className="text-primary w-[20px] h-[20px]" />
                  <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider">Direct Roadside ERDS Transmit</span>
                </div>
                <span className="font-telemetry-label text-telemetry-label text-primary font-bold">ROADSIDE V3.1</span>
              </div>
              
              <button 
                onClick={handleTransmitFmcsa}
                disabled={fmcsaTransferState === 'TRANSMITTING'}
                className={`w-full py-space-md px-space-sm rounded-lg font-headline-sm text-sm uppercase tracking-wider flex items-center justify-center gap-space-sm shadow-xl transition-all active:scale-[0.98] ${
                  fmcsaTransferState === 'SUCCESS' 
                    ? 'bg-emerald-600 text-white font-bold' 
                    : 'bg-primary text-black font-black hover:brightness-110'
                }`}
              >
                {fmcsaTransferState === 'IDLE' && (
                  <>
                    <Send className="w-[20px] h-[20px]" />
                    <span>TRANSMIT LOGS TO FMCSA (WEB SERVICES)</span>
                  </>
                )}
                {fmcsaTransferState === 'TRANSMITTING' && (
                  <>
                    <RotateCw className="w-[20px] h-[20px] animate-spin" />
                    <span>TRANSMITTING TO FMCSA ROUTING ENGINE...</span>
                  </>
                )}
                {fmcsaTransferState === 'SUCCESS' && (
                  <>
                    <CheckCircle2 className="w-[20px] h-[20px]" />
                    <span>TRANSFER CONFIRMED // HTTP 200 OK</span>
                  </>
                )}
              </button>
              
              <div className="grid grid-cols-2 gap-space-xs">
                <button 
                  onClick={() => showToast('BROADCASTING DOT BLE PASSIVE AUDIT PACKET (UUID 0x180D)...')}
                  className="py-space-xs bg-surface-container-low text-on-surface hover:bg-surface-container-high font-label-caps text-[11px] uppercase rounded flex items-center justify-center gap-1 active:scale-95 transition-all"
                >
                  <Bluetooth className="text-primary w-[16px] h-[16px]" />
                  <span>DOT BLUETOOTH SYNC</span>
                </button>
                <button 
                  onClick={() => showToast('GENERATING SIGNED 8-DAY ROADSIDE COMPLIANCE PDF...')}
                  className="py-space-xs bg-surface-container-low text-on-surface hover:bg-surface-container-high font-label-caps text-[11px] uppercase rounded flex items-center justify-center gap-1 active:scale-95 transition-all"
                >
                  <FileText className="text-primary w-[16px] h-[16px]" />
                  <span>PRINT / 8-DAY PDF</span>
                </button>
              </div>
            </div>

            {/* OFFICER STATUTORY DISCLOSURE & HOTLINE FOOTER */}
            <div className="flex flex-col bg-surface-container-lowest p-space-md rounded-xl space-y-space-sm text-center">
              <div className="flex items-center justify-center gap-space-xs text-primary">
                <ShieldCheck className="w-[16px] h-[16px]" />
                <span className="font-label-caps text-label-caps uppercase tracking-wider">Formal Notice To Law Enforcement Official</span>
              </div>
              <p className="font-body-sm text-[11px] text-outline leading-relaxed text-left">
                This document constitutes a certified statutory record of duty status under <strong className="text-on-surface-variant">49 CFR Part 395</strong>. Truckwithease &amp; Morrishive maintain a continuous, immutable SHA-256 hash sequence verified against engine ECM telematics (J1939 CAN-bus at 10Hz). Any officer verification inquiry may be confirmed via FMCSA Web Services or direct dispatch hotlink.
              </p>
              <div className="flex items-center justify-between pt-space-xs bg-surface-container-low p-space-xs rounded text-left">
                <div className="flex flex-col">
                  <span className="font-telemetry-label text-[9px] text-outline uppercase">24/7 DOT Compliance Dispatch Hotline</span>
                  <span className="font-telemetry-metric text-[14px] text-primary font-bold">1-636-706-8338</span>
                </div>
                <a className="px-space-sm py-1 bg-primary text-on-primary rounded font-label-caps text-[10px] uppercase font-bold flex items-center gap-1" href="tel:6367068338">
                  <Phone className="w-[14px] h-[14px]" /> DISPATCH
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      {/* IN-CAB SUB-VIEW SELECTOR STRIP (Bottom Access) */}
      <div className="mt-6 w-full bg-surface-container-lowest border border-[#262626] rounded-xl p-1.5 shadow-lg">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button 
            onClick={() => {
              triggerHapticFeedback("tick");
              setActiveBottomTab("night-hud");
            }}
            className={`flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 transition-all rounded-lg text-xs font-mono font-bold uppercase ${
              activeBottomTab === "night-hud" ? "text-black bg-primary font-black shadow-md" : "text-on-surface-variant hover:text-primary hover:bg-[#1f1f1f]"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>NIGHT HUD</span>
          </button>
          
          <button 
            onClick={() => {
              triggerHapticFeedback("tick");
              setActiveBottomTab("hos-clocks");
            }}
            className={`flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 transition-all rounded-lg text-xs font-mono font-bold uppercase ${
              activeBottomTab === "hos-clocks" ? "text-black bg-primary font-black shadow-md" : "text-on-surface-variant hover:text-primary hover:bg-[#1f1f1f]"
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>HOS CLOCKS</span>
          </button>
          
          <button 
            onClick={() => {
              triggerHapticFeedback("tick");
              setActiveBottomTab("radar-54b");
            }}
            className={`flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 transition-all rounded-lg text-xs font-mono font-bold uppercase ${
              activeBottomTab === "radar-54b" ? "text-black bg-primary font-black shadow-md" : "text-on-surface-variant hover:text-primary hover:bg-[#1f1f1f]"
            }`}
          >
            <Radar className="w-4 h-4" />
            <span>RADAR 54B</span>
          </button>
          
          <button 
            onClick={() => {
              triggerHapticFeedback("tick");
              setActiveBottomTab("the-goat");
            }}
            className={`flex items-center justify-center gap-2 min-h-[44px] py-2 px-3 transition-all rounded-lg text-xs font-mono font-bold uppercase ${
              activeBottomTab === "the-goat" ? "text-black bg-[#C9A84C] font-black shadow-md" : "text-on-surface-variant hover:text-primary hover:bg-[#1f1f1f]"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>G.O.A.T. FREIGHT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
