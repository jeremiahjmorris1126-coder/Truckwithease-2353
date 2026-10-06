import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneForwarded,
  PhoneIncoming,
  ShieldCheck,
  Zap,
  Check,
  Clock,
  Lock,
  Layers,
  Sparkles,
  DollarSign,
  TrendingUp,
  Truck,
  Send,
  Radio,
  Volume2,
  Copy,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Headphones,
  Activity,
  UserCheck,
  Building,
  Hash,
  Play,
  Share2,
  Search,
  BookOpen,
  Wrench,
  Navigation,
  FileText,
  Filter,
} from 'lucide-react';
import {
  TelecomLine,
  TelecomCallLog,
  LineProvisioningRequest,
  FleetSpeedDialContact,
  FleetCallCategory,
  EmergencyBreakdownReport,
  ActiveCallSession,
} from '../types';
import {
  getTelecomLines,
  saveTelecomLines,
  getTelecomCallLogs,
  saveTelecomCallLogs,
  calculateTelecomSavings,
  generateRandomSha256,
  provisionNewCabLine,
  getSpeedDialContacts,
  getEmergencyBreakdowns,
  playDtmfTone,
  playRingbackBeep,
} from '../services/telecomService';
import { PhoneTutorialModal } from './PhoneTutorialModal';
import { EmergencyBreakdownModal } from './EmergencyBreakdownModal';
import { ActiveCallModal } from './ActiveCallModal';

export const InCabTelecomView: React.FC = () => {
  // Core Data State
  const [lines, setLines] = useState<TelecomLine[]>([]);
  const [callLogs, setCallLogs] = useState<TelecomCallLog[]>([]);
  const [speedDialContacts, setSpeedDialContacts] = useState<FleetSpeedDialContact[]>([]);
  const [breakdowns, setBreakdowns] = useState<EmergencyBreakdownReport[]>([]);
  const [selectedLine, setSelectedLine] = useState<TelecomLine | null>(null);

  // Sub-Navigation Tabs
  const [activeSubView, setActiveSubView] = useState<
    'OVERVIEW' | 'COMMS' | 'BREAKDOWNS' | 'LINES' | 'CALL_LOGS' | 'CALCULATOR'
  >('COMMS');

  // Modal Visibility States
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState<boolean>(false);
  const [activeCallSession, setActiveCallSession] = useState<ActiveCallSession | null>(null);

  // Live Comms & Dialer Filter States
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<
    'ALL' | 'BROKER' | 'RECEIVER' | 'DISPATCH' | 'EMERGENCY_BREAKDOWN'
  >('ALL');
  const [contactSearchQuery, setContactSearchQuery] = useState<string>('');
  const [keypadDialedNumber, setKeypadDialedNumber] = useState<string>('');
  const [pttActive, setPttActive] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Live Simulator State
  const [isSimulatingCall, setIsSimulatingCall] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(43);
  const [driverHosState, setDriverHosState] = useState<'DRIVING' | 'PARKED'>('DRIVING');

  // Cost Calculator State
  const [calcUnits, setCalcUnits] = useState<number>(5);

  // Line Provisioning Form State
  const [configuredLineType, setConfiguredLineType] = useState<'LOCAL' | 'TOLL_FREE' | 'PORTED'>('LOCAL');
  const [selectedAreaCode, setSelectedAreaCode] = useState<string>('312');
  const [usdot, setUsdot] = useState<string>('USDOT 3129304');
  const [fleetName, setFleetName] = useState<string>('Apex Logistics LLC');
  const [dispatchPhone, setDispatchPhone] = useState<string>('636-706-8338');
  const [requestedLineCount, setRequestedLineCount] = useState<number>(1);
  const [customPrefix, setCustomPrefix] = useState<string>('312 (Chicago)');
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);
  const [provisionSuccessMsg, setProvisionSuccessMsg] = useState<string | null>(null);

  // Load Initial Data
  useEffect(() => {
    const loadedLines = getTelecomLines();
    const loadedLogs = getTelecomCallLogs();
    const loadedContacts = getSpeedDialContacts();
    const loadedBreakdowns = getEmergencyBreakdowns();

    setLines(loadedLines);
    setCallLogs(loadedLogs);
    setSpeedDialContacts(loadedContacts);
    setBreakdowns(loadedBreakdowns);

    if (loadedLines.length > 0) {
      setSelectedLine(loadedLines[0]);
    }
  }, []);

  // Timer for active call simulator (if active)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulatingCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSimulatingCall]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Dial / Call Initiate
  const handleStartCall = (
    contactName: string,
    phoneNumber: string,
    category: FleetCallCategory,
    callerBadge?: string
  ) => {
    playRingbackBeep();
    setActiveCallSession({
      contactName,
      phoneNumber,
      category,
      callerBadge,
      isMuted: false,
      isSpeakerOn: true,
      durationSeconds: 0,
      isRecordingDetention: false,
    });
  };

  const handleEndCall = () => {
    if (activeCallSession) {
      // Record call log
      const newLog: TelecomCallLog = {
        id: `call-log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' CST',
        unitNumber: selectedLine ? selectedLine.unitNumber : 'TRUCK #104',
        callerName: activeCallSession.contactName,
        callerType:
          activeCallSession.category === 'BROKER'
            ? 'FREIGHT_BROKER'
            : activeCallSession.category === 'RECEIVER'
            ? 'RECEIVER_DOCK'
            : activeCallSession.category === 'DISPATCH'
            ? 'DISPATCH'
            : 'SAFETY_DEPT',
        callerNumber: activeCallSession.phoneNumber,
        durationSeconds: activeCallSession.durationSeconds,
        hosStatusAtCall: driverHosState === 'DRIVING' ? 'DRIVING_11H_ACTIVE' : 'ON_DUTY_PARKED',
        actionTaken: 'CALL_ROUTED_TO_HEADSET',
        detentionTimestampProof: activeCallSession.detentionRecordedProof,
        sha256AuditHash: generateRandomSha256(),
      };
      const updated = [newLog, ...callLogs];
      setCallLogs(updated);
      saveTelecomCallLogs(updated);
    }
    setActiveCallSession(null);
  };

  const handleRecordDetentionOnActiveCall = () => {
    if (!activeCallSession) return;
    const proof = `GEO-LOCKED: 32.7767° N, 96.7970° W (DFW Metro Receiver Dock Gate) • TIME: ${new Date().toLocaleTimeString()} CST`;
    setActiveCallSession({
      ...activeCallSession,
      isRecordingDetention: true,
      detentionRecordedProof: proof,
    });
  };

  const handleSendGpsEtaOnActiveCall = () => {
    // Send simulated SMS
    handleCopy('SYSTEM AUTO-REPLY: Unit 104 is 24 miles from receiver. ETA: 14:10 CST. HOS Drive Time Remaining: 03h 48m.');
  };

  const handleKeypadPress = (digit: string) => {
    playDtmfTone(digit);
    setKeypadDialedNumber((prev) => prev + digit);
  };

  const handleKeypadBackspace = () => {
    setKeypadDialedNumber((prev) => prev.slice(0, -1));
  };

  const handleDialCustomNumber = () => {
    if (!keypadDialedNumber) return;
    handleStartCall(`Custom Call (${keypadDialedNumber})`, keypadDialedNumber, 'DISPATCH');
    setKeypadDialedNumber('');
  };

  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProvisioning(true);
    setProvisionSuccessMsg(null);

    setTimeout(() => {
      const newProvisioned = provisionNewCabLine({
        usdotNumber: usdot,
        carrierLegalName: fleetName,
        dispatchCellNumber: dispatchPhone,
        numCabLines: requestedLineCount,
        desiredAreaCodeOrPrefix: customPrefix,
        lineTypePreference: configuredLineType,
      });

      const updatedLines = getTelecomLines();
      setLines(updatedLines);
      setSelectedLine(newProvisioned);
      setIsProvisioning(false);
      setProvisionSuccessMsg(
        `SUCCESS: Provisioned ${requestedLineCount} dedicated cab line(s) for ${fleetName}! Primary Line: ${newProvisioned.assignedPhoneNumber} on Twilio Super-Network.`
      );
    }, 1500);
  };

  const savingsMath = calculateTelecomSavings(calcUnits);

  // Filter contacts by category and query
  const filteredContacts = speedDialContacts.filter((c) => {
    const matchesCat =
      activeCategoryFilter === 'ALL' || c.category === activeCategoryFilter;
    const matchesQuery =
      !contactSearchQuery ||
      c.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
      c.phone.includes(contactSearchQuery) ||
      (c.subtitle && c.subtitle.toLowerCase().includes(contactSearchQuery.toLowerCase())) ||
      (c.badge && c.badge.toLowerCase().includes(contactSearchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#0A0C10] text-zinc-100 font-sans pb-24 selection:bg-[#D4AF37] selection:text-black">
      {/* 1. TOP HEADER BRAND & TELECOM NETWORK TICKER */}
      <div className="bg-[#10131B] border-b border-[#1E2330] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#181C26] border border-[#2B3346] rounded font-mono text-[#D4AF37] font-bold">
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              TRUCKWITHEASE FLEET COMMUNICATIONS // TWILIO SIP CORE
            </div>
            <span className="hidden sm:inline text-zinc-600">|</span>
            <div className="flex items-center gap-1.5 text-zinc-300 font-mono">
              <span className="text-zinc-500">24/7 DISPATCH DESK:</span>
              <button
                onClick={() => handleStartCall('Fleet Dispatch Desk', '(636) 706-8338', 'DISPATCH', 'TACTICAL HOTLINE')}
                className="text-[#D4AF37] font-bold hover:underline flex items-center gap-1"
              >
                636-706-8338
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Tutorial Button */}
            <button
              onClick={() => setIsTutorialOpen(true)}
              className="px-3 py-1 bg-[#1C2230] hover:bg-[#252E40] border border-[#D4AF37]/50 text-[#D4AF37] font-bold uppercase tracking-wider text-[11px] rounded transition-transform active:scale-95 flex items-center gap-1.5 shadow-sm"
              title="Open System Tutorial for Drivers & Dispatch"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
              HOW TO USE (TUTORIAL)
            </button>

            {/* Emergency Breakdown SOS Pulse Button */}
            <button
              onClick={() => setIsBreakdownModalOpen(true)}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-wider text-[11px] rounded transition-transform active:scale-95 flex items-center gap-1.5 shadow-md shadow-rose-900/50 animate-pulse"
              title="Open Emergency Roadside Breakdown Cockpit"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              EMERGENCY BREAKDOWN SOS
            </button>
          </div>
        </div>

        {/* Live Network Status Banner */}
        <div className="bg-[#090B0F] border-t border-[#171B26] px-4 py-1.5 text-[11px] font-mono text-zinc-400 overflow-x-auto whitespace-nowrap">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
                TWILIO SIP SUPER-NETWORK: ONLINE (100% SLA)
              </span>
              <span>•</span>
              <span className="text-zinc-300">LATENCY: 14.8MS TO AT&amp;T / VERIZON CAB TOWERS</span>
              <span>•</span>
              <span className="text-[#D4AF37]">PROVISIONING SPEED: &lt;3 SECONDS PER LINE</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="text-emerald-400 font-bold">34,000+ CAB LINES ACTIVE</span>
              <span className="px-1.5 py-0.2 bg-[#1C2230] text-[#D4AF37] rounded border border-[#2B3346]">
                DIRECT TIER-1 VOIP
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* TOP COMMAND SUB-NAVIGATION TABS */}
        <div className="flex items-center justify-between gap-3 border-b border-[#1E2330] pb-3 overflow-x-auto">
          <div className="flex items-center gap-2 select-none">
            {[
              { id: 'COMMS', label: 'QUICK COMMS & DIALER', icon: PhoneCall, badge: `${speedDialContacts.length} SPEED DIALS` },
              { id: 'BREAKDOWNS', label: 'EMERGENCY ROADSIDE', icon: AlertTriangle, badge: 'CAN-BUS PULL' },
              { id: 'OVERVIEW', label: 'NETWORK BLUEPRINT', icon: Layers },
              { id: 'CALL_LOGS', label: '49 CFR AUDIT LOGS', icon: Clock, badge: `${callLogs.length} LOGS` },
              { id: 'LINES', label: 'CAB LINES ($12.50)', icon: Radio, badge: `${lines.length} UNITS` },
              { id: 'CALCULATOR', label: 'SAVINGS MATRIX', icon: DollarSign, badge: '-76%' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubView(tab.id as typeof activeSubView)}
                  className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 shrink-0 border ${
                    isActive
                      ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg shadow-[#D4AF37]/15'
                      : 'bg-[#12151E] text-zinc-400 hover:text-zinc-200 border-[#1E2330] hover:border-[#2D3548]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-[#D4AF37]'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        isActive
                          ? 'bg-black/20 text-black'
                          : tab.id === 'BREAKDOWNS'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-[#1C2230] text-[#D4AF37] border border-[#2B3346]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick PTT Radio Intercom Toggle */}
          <button
            onClick={() => {
              playDtmfTone('5');
              setPttActive(!pttActive);
            }}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase flex items-center gap-1.5 border transition-all shrink-0 ${
              pttActive
                ? 'bg-emerald-600 text-black border-emerald-500 shadow-lg shadow-emerald-950'
                : 'bg-[#151924] hover:bg-[#1F2535] text-emerald-400 border-emerald-500/40'
            }`}
            title="Push-To-Talk Low Latency Driver-to-Dispatch Intercom"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{pttActive ? 'PTT CHANNEL ACTIVE' : 'PTT INTERCOM'}</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SUBVIEW 1: QUICK COMMS & SPEED DIALER (Brokers, Receivers, Dispatch, SOS) */}
        {/* ========================================================================= */}
        {activeSubView === 'COMMS' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Tactical Comms Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#121622] via-[#161B29] to-[#121622] border border-[#242C40] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#1C2333] border border-[#2B354D] text-[#D4AF37] shrink-0">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider">
                      FLEET COMMS GATEWAY
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                      49 CFR § 392.82 HANDS-FREE VERIFIED
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                    Tactile In-Cab Speed Dials &amp; Automated Comms
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                    Connect instantly with freight brokers, receivers, 24/7 dispatch, and emergency breakdown mechanics.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setIsTutorialOpen(true)}
                  className="w-full md:w-auto px-4 py-2.5 bg-[#1C2230] hover:bg-[#252E40] border border-[#D4AF37]/40 text-[#D4AF37] font-mono font-bold text-xs uppercase rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                  <span>HOW TO COMMUNICATE</span>
                </button>

                <button
                  onClick={() => setIsBreakdownModalOpen(true)}
                  className="w-full md:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-black text-xs uppercase rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/40"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>EMERGENCY SOS</span>
                </button>
              </div>
            </div>

            {/* Grid Layout: Left Dialpad & Status, Right Speed Dials */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive In-Cab Dialpad & Live Unit Line */}
              <div className="lg:col-span-4 space-y-4">
                {/* Active Unit Card */}
                <div className="p-4 rounded-xl bg-[#121622] border border-[#202738] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-zinc-400 uppercase">
                      IN-CAB ASSIGNED LINE
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      ONLINE
                    </span>
                  </div>
                  <div className="text-xl font-mono font-black text-[#D4AF37] flex items-center justify-between">
                    <span>{selectedLine ? selectedLine.assignedPhoneNumber : '(312) 847-9284'}</span>
                    <button
                      onClick={() => handleCopy(selectedLine ? selectedLine.assignedPhoneNumber : '(312) 847-9284')}
                      className="p-1 text-zinc-400 hover:text-zinc-200"
                      title="Copy Assigned Cab Number"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between pt-1 border-t border-[#1C2230]">
                    <span>UNIT: TRUCK #104</span>
                    <span>CARRIER: TWILIO TIER-1</span>
                  </div>
                </div>

                {/* Tactile In-Cab Dialpad (with real Web Audio DTMF tones) */}
                <div className="p-5 rounded-xl bg-[#10131B] border border-[#1E2433] shadow-xl space-y-4">
                  <div className="text-center">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                      TACTILE DTMF KEYPAD // 1-TOUCH HANDS-FREE
                    </div>
                    <div className="h-10 px-3 bg-[#0B0D13] border border-[#202738] rounded-lg flex items-center justify-between font-mono text-base font-bold text-[#D4AF37]">
                      <span className="truncate">{keypadDialedNumber || 'DIAL NUMBER...'}</span>
                      {keypadDialedNumber && (
                        <button
                          onClick={handleKeypadBackspace}
                          className="text-xs text-zinc-400 hover:text-rose-400 ml-2"
                        >
                          CLEAR
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 12-Button Keypad Grid */}
                  <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto">
                    {[
                      { key: '1', sub: '' },
                      { key: '2', sub: 'ABC' },
                      { key: '3', sub: 'DEF' },
                      { key: '4', sub: 'GHI' },
                      { key: '5', sub: 'JKL' },
                      { key: '6', sub: 'MNO' },
                      { key: '7', sub: 'PQRS' },
                      { key: '8', sub: 'TUV' },
                      { key: '9', sub: 'WXYZ' },
                      { key: '*', sub: '' },
                      { key: '0', sub: '+' },
                      { key: '#', sub: '' },
                    ].map((btn) => (
                      <button
                        key={btn.key}
                        onClick={() => handleKeypadPress(btn.key)}
                        className="h-12 rounded-xl bg-[#161B26] hover:bg-[#202736] active:scale-95 border border-[#273145] text-white font-mono flex flex-col items-center justify-center transition-all shadow-sm"
                      >
                        <span className="text-base font-bold leading-none">{btn.key}</span>
                        {btn.sub && (
                          <span className="text-[9px] text-zinc-500 font-semibold tracking-widest mt-0.5">
                            {btn.sub}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Green Call Button */}
                  <div className="pt-1">
                    <button
                      onClick={handleDialCustomNumber}
                      disabled={!keypadDialedNumber}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
                    >
                      <Phone className="w-4 h-4 fill-black" />
                      <span>DIAL NUMBER NOW</span>
                    </button>
                  </div>

                  {/* 1-Touch Hotlines */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1C2230]">
                    <button
                      onClick={() => handleStartCall('24/7 Dispatch Desk', '(636) 706-8338', 'DISPATCH', 'HOTLINE')}
                      className="p-2 rounded-lg bg-[#181D29] hover:bg-[#22293A] border border-[#2B3448] text-xs font-mono text-[#D4AF37] font-bold flex items-center justify-center gap-1.5"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>636-706-8338</span>
                    </button>

                    <button
                      onClick={() => handleStartCall("Love's Roadside Care", '(800) 655-6837', 'EMERGENCY_BREAKDOWN', 'OK-LOVES')}
                      className="p-2 rounded-lg bg-rose-950/50 hover:bg-rose-950/80 border border-rose-500/40 text-xs font-mono text-rose-300 font-bold flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>1-800-OK-LOVES</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Speed Dial Directory & Quick Comms Cards */}
              <div className="lg:col-span-8 space-y-4">
                {/* Search & Category Filter Header */}
                <div className="p-4 rounded-xl bg-[#10131B] border border-[#1E2433] space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={contactSearchQuery}
                        onChange={(e) => setContactSearchQuery(e.target.value)}
                        placeholder="Search brokers, receivers, dispatch, road mechanics..."
                        className="w-full pl-9 pr-4 py-2 bg-[#0A0C12] border border-[#202738] rounded-lg text-xs font-mono text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="text-xs font-mono text-zinc-400 shrink-0">
                      SHOWING <span className="text-[#D4AF37] font-bold">{filteredContacts.length}</span> DIRECT CONTACTS
                    </div>
                  </div>

                  {/* Category Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
                    {[
                      { id: 'ALL', label: 'ALL DIRECTORY' },
                      { id: 'BROKER', label: 'FREIGHT BROKERS' },
                      { id: 'RECEIVER', label: 'RECEIVERS & SHIPPERS' },
                      { id: 'DISPATCH', label: 'FLEET DISPATCH' },
                      { id: 'EMERGENCY_BREAKDOWN', label: 'EMERGENCY ROADSIDE' },
                    ].map((chip) => (
                      <button
                        key={chip.id}
                        onClick={() => setActiveCategoryFilter(chip.id as typeof activeCategoryFilter)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition-all whitespace-nowrap ${
                          activeCategoryFilter === chip.id
                            ? 'bg-[#D4AF37] text-black shadow-sm'
                            : 'bg-[#151924] text-zinc-400 hover:text-zinc-200 border border-[#202738]'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed Dial Contacts Cards List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredContacts.map((contact) => {
                    const isBroker = contact.category === 'BROKER';
                    const isReceiver = contact.category === 'RECEIVER';
                    const isDispatch = contact.category === 'DISPATCH';
                    const isSos = contact.category === 'EMERGENCY_BREAKDOWN';

                    return (
                      <div
                        key={contact.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 relative group ${
                          isSos
                            ? 'bg-[#151012] border-rose-500/40 hover:border-rose-500/80 shadow-rose-950/20'
                            : isBroker
                            ? 'bg-[#10141D] border-sky-500/30 hover:border-sky-500/60'
                            : isReceiver
                            ? 'bg-[#0E1513] border-emerald-500/30 hover:border-emerald-500/60'
                            : 'bg-[#13151D] border-[#D4AF37]/30 hover:border-[#D4AF37]/60'
                        }`}
                      >
                        {/* Top Metadata */}
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                isSos
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : isBroker
                                  ? 'bg-sky-950 text-sky-300 border border-sky-800'
                                  : isReceiver
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                              }`}
                            >
                              {contact.category.replace('_', ' ')}
                            </span>

                            {contact.badge && (
                              <span className="text-[10px] font-mono font-bold text-zinc-400">
                                {contact.badge}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-black text-white mt-1.5 leading-snug group-hover:text-[#D4AF37] transition-colors">
                            {contact.name}
                          </h3>
                          <div className="text-xs text-zinc-400 mt-0.5 leading-tight">
                            {contact.subtitle}
                          </div>

                          <div className="text-sm font-mono font-bold text-[#D4AF37] mt-2">
                            {contact.phone} {contact.extension && <span className="text-zinc-500 text-xs">Ext {contact.extension}</span>}
                          </div>
                        </div>

                        {/* Canned Communication Script preview */}
                        {contact.autoPromptScript && (
                          <div className="p-2.5 rounded-lg bg-black/40 border border-[#202738] text-[11px] font-mono text-zinc-300 space-y-1">
                            <div className="text-[9px] font-bold text-zinc-500 uppercase flex items-center justify-between">
                              <span>PRE-CONFIGURED COMMS SCRIPT</span>
                              <button
                                onClick={() => handleCopy(contact.autoPromptScript!)}
                                className="text-zinc-400 hover:text-white"
                                title="Copy Script"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="line-clamp-2 italic text-zinc-300">
                              "{contact.autoPromptScript}"
                            </p>
                          </div>
                        )}

                        {/* Action Buttons Row */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1C2230]">
                          <button
                            onClick={() => handleStartCall(contact.name, contact.phone, contact.category, contact.badge)}
                            className={`py-2 px-3 rounded-lg font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-transform active:scale-95 ${
                              isSos
                                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-md'
                            }`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>CALL DIRECT</span>
                          </button>

                          <button
                            onClick={() => {
                              if (contact.autoPromptScript) {
                                handleCopy(contact.autoPromptScript);
                              } else {
                                handleCopy(`Check-in for ${contact.name}: Unit 104 in transit on I-40 Eastbound.`);
                              }
                            }}
                            className="py-2 px-3 rounded-lg bg-[#181D29] hover:bg-[#232A3B] border border-[#2A3448] text-zinc-300 font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>SEND TEXT/ETA</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBVIEW 2: EMERGENCY ROADSIDE & BREAKDOWNS COCKPIT */}
        {/* ========================================================================= */}
        {activeSubView === 'BREAKDOWNS' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Roadside Emergency Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/80 via-[#1F1215] to-rose-950/80 border-2 border-rose-500/50 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-rose-950/30">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-rose-600/30 border border-rose-500 text-rose-400 animate-pulse shrink-0">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-rose-400 uppercase tracking-widest">
                      CRITICAL TELEMATICS &amp; EMERGENCY ROADSIDE RESCUE
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500 text-black uppercase">
                      49 CFR § 392.22 ACTIVE
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    Highway Breakdown Protocol &amp; 60-Second Dispatch
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                    Directly tied into J1939 CAN-bus engine telemetry and GPS for immediate roadside technician deployment.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsBreakdownModalOpen(true)}
                className="w-full md:w-auto px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-black text-sm uppercase rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-rose-950/60 shrink-0"
              >
                <AlertTriangle className="w-5 h-5" />
                <span>OPEN EMERGENCY SOS COCKPIT</span>
              </button>
            </div>

            {/* Live Telematics Snapshot Card */}
            <div className="p-5 rounded-xl bg-[#121622] border border-[#232B3D] space-y-4">
              <div className="flex items-center justify-between border-b border-[#232B3D] pb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-200 uppercase">
                  <Navigation className="w-4 h-4 text-[#D4AF37]" />
                  <span>CURRENT IN-CAB POSITION &amp; ENGINE HEALTH TELEMETRY</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 font-mono text-[10px] rounded border border-emerald-800">
                  SATELLITE LOCK VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#0B0D13] border border-[#1E2536]">
                  <div className="text-zinc-500 text-[10px] uppercase">COMMERCIAL POWER UNIT</div>
                  <div className="text-zinc-100 font-bold mt-1">TRUCK #104</div>
                  <div className="text-[10px] text-zinc-400">2026 Peterbilt 579 UltraLoft</div>
                </div>

                <div className="p-3 rounded-lg bg-[#0B0D13] border border-[#1E2536]">
                  <div className="text-zinc-500 text-[10px] uppercase">SATELLITE GPS LAT/LONG</div>
                  <div className="text-emerald-400 font-bold mt-1">35.1495° N, 90.0490° W</div>
                  <div className="text-[10px] text-zinc-400">I-40 Eastbound MM 284</div>
                </div>

                <div className="p-3 rounded-lg bg-[#0B0D13] border border-[#1E2536]">
                  <div className="text-zinc-500 text-[10px] uppercase">NEAREST EXIT &amp; HAVEN</div>
                  <div className="text-amber-400 font-bold mt-1">Exit 280 (Airport Rd)</div>
                  <div className="text-[10px] text-zinc-400">Love's Travel Stop #412 (4.2 mi)</div>
                </div>

                <div className="p-3 rounded-lg bg-[#0B0D13] border border-[#1E2536]">
                  <div className="text-zinc-500 text-[10px] uppercase">CAN-BUS ENGINE CODES</div>
                  <div className="text-rose-400 font-bold mt-1">SPN 3251 / FMI 0</div>
                  <div className="text-[10px] text-rose-300">DPF Pressure High / Derate</div>
                </div>
              </div>
            </div>

            {/* National Breakdown Speed Dials Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-200 uppercase">
                  <Wrench className="w-4 h-4 text-rose-400" />
                  <span>24/7 NATIONAL COMMERCIAL TRUCK RESCUE HOTLINES</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">1-TOUCH DIRECT VOIP CONNECT</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {speedDialContacts
                  .filter((c) => c.category === 'EMERGENCY_BREAKDOWN')
                  .map((sosContact) => (
                    <div
                      key={sosContact.id}
                      className="p-4 rounded-xl bg-[#141012] border border-rose-500/30 hover:border-rose-500/70 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white">{sosContact.name}</span>
                          {sosContact.badge && (
                            <span className="px-1.5 py-0.2 bg-rose-950 text-rose-300 border border-rose-800 rounded font-mono text-[9px] font-bold">
                              {sosContact.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 mt-1">{sosContact.subtitle}</div>
                        <div className="text-sm font-mono text-[#D4AF37] font-bold mt-2">
                          {sosContact.phone}
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartCall(sosContact.name, sosContact.phone, 'EMERGENCY_BREAKDOWN', sosContact.badge)}
                        className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/40"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>CALL {sosContact.phone}</span>
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Past / Active Breakdown Reports Table */}
            <div className="p-5 rounded-xl bg-[#10131B] border border-[#1E2433] space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E2433] pb-3">
                <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  HISTORICAL BREAKDOWN SOS AUDIT LOGS (49 CFR COMPLIANT)
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  {breakdowns.length} LOGGED INCIDENTS
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0A0C12] text-zinc-400 uppercase border-b border-[#1E2433]">
                    <tr>
                      <th className="p-3">TIMESTAMP</th>
                      <th className="p-3">UNIT #</th>
                      <th className="p-3">ISSUE CATEGORY</th>
                      <th className="p-3">LOCATION</th>
                      <th className="p-3">STATUS</th>
                      <th className="p-3">DISPATCHED VENDOR</th>
                      <th className="p-3">SHA-256 AUDIT HASH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181D29]">
                    {breakdowns.map((b) => (
                      <tr key={b.id} className="hover:bg-[#141924] transition-colors">
                        <td className="p-3 text-zinc-400">{b.timestamp}</td>
                        <td className="p-3 font-bold text-white">{b.unitNumber}</td>
                        <td className="p-3 text-rose-400 font-bold">{b.issueCategory.replace('_', ' ')}</td>
                        <td className="p-3 text-zinc-300">{b.interstateLocation}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {b.sosStatus.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-[#D4AF37] font-bold">{b.dispatchedVendor}</td>
                        <td className="p-3 text-zinc-500 font-mono text-[10px]">
                          {b.sha256AuditHash.substring(0, 16)}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBVIEW 3: NETWORK BLUEPRINT & VALUE PROP */}
        {/* ========================================================================= */}
        {activeSubView === 'OVERVIEW' && (
          <div className="space-y-12 animate-in fade-in duration-200">
            {/* Value Prop Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#181C26] border border-[#D4AF37]/40 rounded-full text-xs font-mono text-[#D4AF37]">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-[#D4AF37]" />
                  TELECOM DISRUPTION // IN-CAB DEDICATED VOIP
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight uppercase">
                  RADICAL FLEET CONNECTIVITY: <br />
                  <span className="text-[#D4AF37]">DEDICATED IN-CAB PHONE LINES</span> FOR $12.50/MO
                </h1>

                <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
                  Powered by Twilio's Carrier Super-Network. Give every truck its own business line,
                  automated SMS broker updates, dynamic HOS call routing, and emergency breakdown SOS
                  without handing out personal driver numbers or signing $65/mo carrier lock-ins.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveSubView('LINES')}
                    className="px-6 py-3.5 bg-[#D4AF37] hover:bg-[#c59e2a] text-black font-extrabold text-sm uppercase tracking-wider rounded shadow-lg shadow-[#D4AF37]/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    <Zap className="w-4 h-4 fill-black" />
                    PROVISION LINES &amp; START 14-DAY TRIAL
                  </button>

                  <button
                    onClick={() => setActiveSubView('CALCULATOR')}
                    className="px-6 py-3.5 bg-[#141722] hover:bg-[#1f2536] border border-[#D4AF37]/50 text-[#D4AF37] font-bold text-sm uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    CALCULATE FLEET TELECOM SAVINGS
                  </button>
                </div>

                {/* Quick Metrics Bar */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#202738]">
                  <div className="p-3 bg-[#11141D] border border-[#202738] rounded-xl">
                    <div className="text-[11px] font-mono text-zinc-400 uppercase">FLAT PRICING</div>
                    <div className="text-xl font-black text-[#D4AF37] font-mono">$12.50</div>
                    <div className="text-[10px] text-zinc-500">Per Unit | No-Hardware Fees</div>
                  </div>

                  <div className="p-3 bg-[#11141D] border border-[#202738] rounded-xl">
                    <div className="text-[11px] font-mono text-zinc-400 uppercase">COST SAVINGS</div>
                    <div className="text-xl font-black text-emerald-400 font-mono">-76%</div>
                    <div className="text-[10px] text-zinc-500">vs $65/mo AT&amp;T/Verizon lines</div>
                  </div>

                  <div className="p-3 bg-[#11141D] border border-[#202738] rounded-xl">
                    <div className="text-[11px] font-mono text-zinc-400 uppercase">NETWORK SLA</div>
                    <div className="text-xl font-black text-white font-mono">99.999%</div>
                    <div className="text-[10px] text-zinc-500">Direct Twilio Global Tier-1</div>
                  </div>
                </div>
              </div>

              {/* Right Column: In-Cab Live Terminal Simulation */}
              <div className="lg:col-span-5">
                <div className="bg-[#10131B] border-2 border-[#D4AF37] rounded-2xl p-5 shadow-2xl relative overflow-hidden space-y-4">
                  <div className="flex items-center justify-between border-b border-[#202738] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="font-mono text-xs font-bold text-zinc-200 uppercase tracking-wide">
                        CAB LINE: TRUCK #104
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-mono text-[10px] font-bold rounded">
                      SIP LIVE
                    </span>
                  </div>

                  <div className="bg-[#161B26] border border-[#263145] rounded-xl p-3.5">
                    <div className="text-[11px] font-mono text-zinc-400 uppercase flex items-center justify-between">
                      <span>ASSIGNED DEDICATED NUMBER</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <ShieldCheck className="w-3 h-3" /> CALL SHIELD: ON
                      </span>
                    </div>
                    <div className="text-2xl font-mono font-black text-[#D4AF37] tracking-wider mt-1 flex items-center justify-between">
                      <span>(312) 847-9284</span>
                      <button
                        onClick={() => handleCopy('(312) 847-9284')}
                        className="text-xs text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-[#202738]"
                        title="Copy Phone Number"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Incoming Call Notification Mock */}
                  <div className="bg-[#121622] border border-[#222B3D] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PhoneIncoming className="w-4 h-4 text-emerald-400 animate-bounce" />
                        <span className="font-mono text-xs font-bold text-emerald-400 uppercase">
                          INCOMING BROKER CALL INTERCEPTED
                        </span>
                      </div>
                      <span className="font-mono text-xs text-zinc-400 bg-black/40 px-2 py-0.5 rounded border border-[#202738]">
                        00:43 DURATION
                      </span>
                    </div>

                    <div className="p-2.5 bg-black/60 border border-[#202738] rounded-lg flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">C.H. Robinson Worldwide</div>
                        <div className="text-xs font-mono text-zinc-400">(800) 323-7587 • Load #CH-98214</div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] rounded">
                        Verified Broker ID
                      </span>
                    </div>

                    {/* HOS Banner */}
                    <div className="p-2.5 bg-[#1C1814] border border-[#D4AF37]/30 rounded-lg text-xs font-mono">
                      <div className="flex items-center gap-1.5 text-[#D4AF37] font-bold">
                        <Zap className="w-3.5 h-3.5" />
                        <span>HOS Auto-Guard: 11H Driving Clock Active. Automated ETA Audio Sent.</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1">
                        Zero distracted driving violations. Broker receives live satellite status without driver distraction.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBVIEW 4: 49 CFR AUDIT CALL LOGS & DETENTION PROOFS */}
        {/* ========================================================================= */}
        {activeSubView === 'CALL_LOGS' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-5 rounded-2xl bg-[#10131B] border border-[#1E2433] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  FMCSA 49 CFR § 395 Statutory Call &amp; Detention Audit Logs
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                  Cryptographically sealed SHA-256 records of every broker call, receiver arrival, and detention clock.
                </p>
              </div>
              <button
                onClick={() => handleCopy(JSON.stringify(callLogs, null, 2))}
                className="px-3.5 py-2 bg-[#1C2230] hover:bg-[#252E40] border border-[#2B354D] text-zinc-300 font-mono text-xs uppercase rounded-lg flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>EXPORT AUDIT JSON</span>
              </button>
            </div>

            <div className="bg-[#10131B] border border-[#1E2433] rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#090B0F] text-zinc-400 uppercase border-b border-[#1E2433]">
                    <tr>
                      <th className="p-3">TIMESTAMP</th>
                      <th className="p-3">CALLER</th>
                      <th className="p-3">CALLER TYPE</th>
                      <th className="p-3">PHONE</th>
                      <th className="p-3">DURATION</th>
                      <th className="p-3">HOS STATUS</th>
                      <th className="p-3">ACTION TAKEN</th>
                      <th className="p-3">DETENTION PROOF</th>
                      <th className="p-3">SHA-256 AUDIT HASH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181D29]">
                    {callLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#141924] transition-colors">
                        <td className="p-3 text-zinc-400">{log.timestamp}</td>
                        <td className="p-3 font-bold text-white">{log.callerName}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1C2230] text-[#D4AF37] border border-[#2B354D]">
                            {log.callerType}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-300">{log.callerNumber}</td>
                        <td className="p-3 text-zinc-400">{log.durationSeconds}s</td>
                        <td className="p-3 text-emerald-400 font-bold">{log.hosStatusAtCall}</td>
                        <td className="p-3 text-zinc-300">{log.actionTaken}</td>
                        <td className="p-3 text-sky-400 font-medium truncate max-w-[200px]">
                          {log.detentionTimestampProof || 'N/A'}
                        </td>
                        <td className="p-3 text-zinc-500 font-mono text-[10px]">
                          {log.sha256AuditHash.substring(0, 16)}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBVIEW 5: CAB LINES & PROVISIONING ($12.50/MO) */}
        {/* ========================================================================= */}
        {activeSubView === 'LINES' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Active Lines Cards */}
            <div className="space-y-3">
              <h2 className="text-xl font-black text-white uppercase tracking-tight font-mono">
                Active In-Cab Dedicated Phone Endpoints
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lines.map((line) => (
                  <div
                    key={line.id}
                    className="p-5 rounded-xl bg-[#121622] border border-[#222B3D] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-zinc-400 uppercase">
                        {line.lineType} LINE
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {line.sipTrunkStatus}
                      </span>
                    </div>

                    <div className="text-xl font-mono font-black text-[#D4AF37]">
                      {line.assignedPhoneNumber}
                    </div>

                    <div className="text-xs text-zinc-300 font-bold">{line.unitNumber}</div>

                    <div className="text-[11px] font-mono text-zinc-400 pt-2 border-t border-[#1C2230] flex items-center justify-between">
                      <span>COST: ${line.monthlyCost.toFixed(2)}/MO</span>
                      <span>LATENCY: {line.latencyMs}MS</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fast-Track Provisioning Form */}
            <div className="max-w-3xl mx-auto bg-[#10131B] border-2 border-[#D4AF37] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#202738] pb-4">
                <div>
                  <h3 className="text-lg font-black text-white uppercase">
                    Provision Dedicated Fleet Lines In &lt;60 Seconds
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    Instant Twilio line binding. Zero hardware leases. 14-day free trial.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#D4AF37] text-black font-mono text-xs font-bold">
                  $12.50 / UNIT
                </span>
              </div>

              {provisionSuccessMsg && (
                <div className="p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-xs font-mono text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{provisionSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleProvisionSubmit} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1 uppercase">CARRIER USDOT NUMBER *</label>
                    <input
                      type="text"
                      required
                      value={usdot}
                      onChange={(e) => setUsdot(e.target.value)}
                      className="w-full bg-[#181D29] border border-[#2B3448] rounded px-3 py-2 text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 uppercase">FLEET / CARRIER LEGAL NAME *</label>
                    <input
                      type="text"
                      required
                      value={fleetName}
                      onChange={(e) => setFleetName(e.target.value)}
                      className="w-full bg-[#181D29] border border-[#2B3448] rounded px-3 py-2 text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1 uppercase">DISPATCH CELL / SMS HOTLINE *</label>
                    <input
                      type="tel"
                      required
                      value={dispatchPhone}
                      onChange={(e) => setDispatchPhone(e.target.value)}
                      className="w-full bg-[#181D29] border border-[#2B3448] rounded px-3 py-2 text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 uppercase">NUMBER OF CAB LINES NEEDED *</label>
                    <select
                      value={requestedLineCount}
                      onChange={(e) => setRequestedLineCount(Number(e.target.value))}
                      className="w-full bg-[#181D29] border border-[#2B3448] rounded px-3 py-2 text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value={1}>1 Dedicated Line (Solo Owner-Operator) = $12.50/mo</option>
                      <option value={3}>3 Dedicated Lines (Small Squad) = $37.50/mo</option>
                      <option value={5}>5 Dedicated Lines (Regional Fleet) = $62.50/mo</option>
                      <option value={10}>10 Dedicated Lines (Fleet Package) = $125.00/mo</option>
                      <option value={25}>25 Dedicated Lines (Midsize Carrier) = $312.50/mo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 uppercase">
                    DESIRED AREA CODE OR CITY PREFIX (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={customPrefix}
                    onChange={(e) => setCustomPrefix(e.target.value)}
                    placeholder='e.g. 312 (Chicago), 214 (Dallas), 636 (St. Louis), or "888 Toll-Free"'
                    className="w-full bg-[#181D29] border border-[#2B3448] rounded px-3 py-2 text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProvisioning}
                  className="w-full py-3.5 bg-[#D4AF37] hover:bg-[#c59e2a] text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#D4AF37]/20 disabled:opacity-50"
                >
                  {isProvisioning ? (
                    'PROVISIONING TWILIO SIP ENDPOINTS...'
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-black" />
                      <span>PROVISION FLEET CAB LINES &amp; START 14-DAY TRIAL</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBVIEW 6: RADICAL COST SAVINGS CALCULATOR */}
        {/* ========================================================================= */}
        {activeSubView === 'CALCULATOR' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <div className="text-xs font-mono text-[#D4AF37] uppercase tracking-widest">
                // RADICAL COST TRANSPARENCY
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
                TRUCKWITHEASE ($12.50) vs. Standard Cellular Lines ($45–$65)
              </h2>
              <p className="text-sm text-zinc-400">
                Stop paying massive cellular contracts for in-cab communication. See your fleet's exact cash savings.
              </p>
            </div>

            <div className="bg-[#10131B] border border-[#1E2433] rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 bg-[#161B26] border-b border-[#222B3D] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs font-mono text-zinc-300 uppercase">
                  SELECT POWER UNIT COUNT TO SIMULATE ANNUAL SAVINGS:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {[1, 5, 10, 25, 50, 100].map((units) => (
                    <button
                      key={units}
                      onClick={() => setCalcUnits(units)}
                      className={`px-3 py-1 rounded font-mono text-xs font-bold transition-colors ${
                        calcUnits === units
                          ? 'bg-[#D4AF37] text-black'
                          : 'bg-[#202738] text-zinc-300 hover:bg-[#2C364C]'
                      }`}
                    >
                      {units} {units === 1 ? 'Truck' : 'Trucks'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#090B0F] text-zinc-400 uppercase border-b border-[#1E2433]">
                    <tr>
                      <th className="p-4">FLEET SIZE</th>
                      <th className="p-4">STANDARD CELLULAR CARRIER ($55/LINE)</th>
                      <th className="p-4 text-[#D4AF37]">TRUCKWITHEASE LINE ($12.50)</th>
                      <th className="p-4 text-emerald-400">ANNUAL CASH SAVINGS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181D29]">
                    <tr className={calcUnits === 1 ? 'bg-[#D4AF37]/10' : ''}>
                      <td className="p-4 font-bold text-white">1 Power Unit (Solo Owner-Operator)</td>
                      <td className="p-4 text-zinc-400">$660 / year + fees</td>
                      <td className="p-4 text-[#D4AF37] font-bold">$150 / year flat</td>
                      <td className="p-4 text-emerald-400 font-black">$510 / YEAR SAVED</td>
                    </tr>
                    <tr className={calcUnits === 5 ? 'bg-[#D4AF37]/10' : ''}>
                      <td className="p-4 font-bold text-white">5 Power Units (Regional Squad)</td>
                      <td className="p-4 text-zinc-400">$3,300 / year + fees</td>
                      <td className="p-4 text-[#D4AF37] font-bold">$750 / year flat</td>
                      <td className="p-4 text-emerald-400 font-black">$2,550 / YEAR SAVED</td>
                    </tr>
                    <tr className={calcUnits === 25 ? 'bg-[#D4AF37]/10' : ''}>
                      <td className="p-4 font-bold text-white">25 Power Units (Midsize Fleet)</td>
                      <td className="p-4 text-zinc-400">$16,250 / year + fees</td>
                      <td className="p-4 text-[#D4AF37] font-bold">$3,750 / year flat</td>
                      <td className="p-4 text-emerald-400 font-black">$12,500 / YEAR SAVED</td>
                    </tr>
                    <tr className={calcUnits >= 50 ? 'bg-[#D4AF37]/10' : ''}>
                      <td className="p-4 font-bold text-white">50 Power Units (Enterprise Carrier)</td>
                      <td className="p-4 text-zinc-400">$33,000 / year + fees</td>
                      <td className="p-4 text-[#D4AF37] font-bold">$7,500 / year flat</td>
                      <td className="p-4 text-emerald-400 font-black">
                        $25,500 / YEAR SAVED (77.2% CUT)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Output Banner */}
              <div className="p-6 bg-[#161B26] border-t border-[#222B3D] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-xs font-mono text-zinc-400">
                    CALCULATED RESULT FOR YOUR <span className="text-[#D4AF37] font-bold">{calcUnits} POWER UNIT(S)</span>:
                  </div>
                  <div className="text-sm text-zinc-300 font-mono">
                    Standard Telco: <span className="line-through text-red-400">${savingsMath.totalStandardCost.toLocaleString()}</span> → TRUCKWITHEASE:{' '}
                    <span className="text-[#D4AF37] font-bold">${savingsMath.totalTweCost.toLocaleString()}</span>
                  </div>
                </div>

                <div className="px-5 py-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-center">
                  <div className="text-[10px] font-mono text-emerald-300 uppercase">NET ANNUAL SAVINGS</div>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    ${savingsMath.totalAnnualSavings.toLocaleString()} / YR
                  </div>
                  <div className="text-[10px] font-mono text-emerald-300">{savingsMath.savingsPercentage}% EXPENSE REDUCTION</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-8 border-t border-[#1C2230] text-center text-[10px] font-mono text-zinc-500 uppercase leading-relaxed">
          TRUCKWITHEASE COMMUNICATIONS INFRASTRUCTURE POWERED BY TWILIO CARRIER VOIP NETWORKS. OPERATED BY
          MORRIS EDGE LLC (MORRISEDGE.COM). NO CELLULAR DONGLE OR PROPRIETARY TABLET PURCHASE REQUIRED. FMCSA 49
          CFR COMPLIANT AUDIO SHIELDING.
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      {/* 1. System Tutorial Walkthrough */}
      <PhoneTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onActionClick={(category) => {
          if (category === 'EMERGENCY') {
            setIsBreakdownModalOpen(true);
          } else if (category === 'BROKERS' || category === 'RECEIVERS' || category === 'DISPATCH') {
            setActiveSubView('COMMS');
            setActiveCategoryFilter(category === 'BROKERS' ? 'BROKER' : category === 'RECEIVERS' ? 'RECEIVER' : 'DISPATCH');
          }
        }}
      />

      {/* 2. Emergency Breakdown Cockpit */}
      <EmergencyBreakdownModal
        isOpen={isBreakdownModalOpen}
        onClose={() => setIsBreakdownModalOpen(false)}
        onCallNumber={(name, phone, category) => {
          setIsBreakdownModalOpen(false);
          handleStartCall(name, phone, category);
        }}
        contacts={speedDialContacts}
      />

      {/* 3. Active Call HUD Modal */}
      <ActiveCallModal
        session={activeCallSession}
        onEndCall={handleEndCall}
        onRecordDetention={handleRecordDetentionOnActiveCall}
        onSendGpsEta={handleSendGpsEtaOnActiveCall}
      />
    </div>
  );
};

export default InCabTelecomView;
