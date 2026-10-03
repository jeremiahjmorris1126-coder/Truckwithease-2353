import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Activity,
  Brain,
  ShieldCheck,
  Award,
  Zap,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Compass,
  Radio,
  Users,
  Flame,
  Sparkles,
  Clock,
  ArrowRight,
  Lock,
  Scale,
  Coffee,
  CloudRain,
  Wind,
  Info,
  Sliders,
  Smile,
  AlertTriangle,
  Send,
  Check,
  HelpCircle,
  Truck,
  FileCheck
} from 'lucide-react';
import { TabType, UserRoleType } from '../types';
import { triggerHapticFeedback } from '../services/haptics';

export interface DriverProfile {
  id: string;
  name: string;
  unit: string;
  archetype: 'The Nocturnal Sentinel' | 'The Dawn Cruiser' | 'The High-Cadence Hotshot' | 'The Meticulous Guardian';
  yearsExperience: number;
  temperament: string;
  currentMood: 'Focused & Calm' | 'Energized' | 'Elevated Stress' | 'Fatigued' | 'Detention Frustrated';
  stressScore: number; // 0 - 100
  smoothnessScore: number; // 0 - 100
  circadianPeakHour: string;
  preferredCadence: string;
  favoriteHavenType: string;
  detentionPatienceLimitMin: number;
  recentVoiceTone: 'Neutral & Confident' | 'Urgent / Tense' | 'Weary / Soft-Spoken' | 'Cheerful';
  turnoverRisk: 'Minimal (0.2%)' | 'Low (1.1%)' | 'Moderate (4.5%)' | 'High (12%)';
}

export const INITIAL_DRIVERS: DriverProfile[] = [
  {
    id: 'drv-01',
    name: 'Marcus Vance',
    unit: 'Unit 104 (Kenworth T680)',
    archetype: 'The Nocturnal Sentinel',
    yearsExperience: 14,
    temperament: 'Introspective, high stamina, thrives on night runs with low traffic and clear radio.',
    currentMood: 'Focused & Calm',
    stressScore: 24,
    smoothnessScore: 94,
    circadianPeakHour: '21:00 - 04:30 CST',
    preferredCadence: 'Steady 63 MPH cruise, minimal lane oscillation',
    favoriteHavenType: 'Independent quiet gravel lots, uncrowded fuel plazas',
    detentionPatienceLimitMin: 90,
    recentVoiceTone: 'Neutral & Confident',
    turnoverRisk: 'Minimal (0.2%)',
  },
  {
    id: 'drv-02',
    name: 'Darnell Hayes',
    unit: 'Unit 208 (Freightliner Cascadia)',
    archetype: 'The Dawn Cruiser',
    yearsExperience: 8,
    temperament: 'Methodical, morning-first routine, pristine daily DVIR, intolerant of dock delays.',
    currentMood: 'Detention Frustrated',
    stressScore: 68,
    smoothnessScore: 88,
    circadianPeakHour: '05:00 - 13:00 EST',
    preferredCadence: 'Early dispatch, avoids rush hour, prompt rest breaks',
    favoriteHavenType: 'Love\'s Travel Stops with clean showers & workout spaces',
    detentionPatienceLimitMin: 60,
    recentVoiceTone: 'Urgent / Tense',
    turnoverRisk: 'Moderate (4.5%)',
  },
  {
    id: 'drv-03',
    name: 'Elena Rostova',
    unit: 'Unit 312 (Ram 3500 Hotshot)',
    archetype: 'The High-Cadence Hotshot',
    yearsExperience: 5,
    temperament: 'Quick turnaround, agile load securement, highly responsive to rate bonuses.',
    currentMood: 'Energized',
    stressScore: 32,
    smoothnessScore: 91,
    circadianPeakHour: '08:00 - 18:00 CST',
    preferredCadence: 'Expedited regional delivery, tight 26k weight monitoring',
    favoriteHavenType: 'Midwest regional express plazas with quick turn pumps',
    detentionPatienceLimitMin: 45,
    recentVoiceTone: 'Cheerful',
    turnoverRisk: 'Low (1.1%)',
  },
  {
    id: 'drv-04',
    name: 'Jackson Reed',
    unit: 'Unit 401 (26ft Box Truck)',
    archetype: 'The Meticulous Guardian',
    yearsExperience: 11,
    temperament: 'Zero freight claims in 4 years, gentle throttle control, highly defensive in urban zones.',
    currentMood: 'Focused & Calm',
    stressScore: 19,
    smoothnessScore: 97,
    circadianPeakHour: '06:30 - 15:30 CST',
    preferredCadence: 'Urban short-haul with precision loading & zero tailgate shock',
    favoriteHavenType: 'Home terminal nightly return, certified local havens',
    detentionPatienceLimitMin: 75,
    recentVoiceTone: 'Neutral & Confident',
    turnoverRisk: 'Minimal (0.2%)',
  },
];

interface DriverHeartbeatEngineViewProps {
  onNavigateToTab?: (tab: TabType) => void;
  userRole?: UserRoleType;
}

export const DriverHeartbeatEngineView: React.FC<DriverHeartbeatEngineViewProps> = ({
  onNavigateToTab,
  userRole = 'admin',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'cognitive-radar' | 'habits-archetypes' | 'empathetic-copilot' | 'affordable-certification' | 'fleet-synergy'
  >('cognitive-radar');

  const [drivers, setDrivers] = useState<DriverProfile[]>(INITIAL_DRIVERS);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('drv-01');
  const [copilotTone, setCopilotTone] = useState<'Empathetic Brother' | 'Tactical Veteran' | 'Silent Guardian'>('Empathetic Brother');

  // ROI / Savings Calculator State (BYOD vs Legacy Big Tech)
  const [fleetTruckCount, setFleetTruckCount] = useState<number>(5);
  const [legacyMonthlyCostPerTruck, setLegacyMonthlyCostPerTruck] = useState<number>(185);
  const [legacyHardwareCostPerTruck, setLegacyHardwareCostPerTruck] = useState<number>(950);

  // Custom Co-Pilot Message Draft
  const [customEncouragement, setCustomEncouragement] = useState('');
  const [broadcastLog, setBroadcastLog] = useState<{ id: string; msg: string; at: string }[]>([
    {
      id: 'bl-1',
      msg: 'Great smooth-driving score on I-80 corridor (94/100). Zero hard-brake events recorded across 420 miles.',
      at: '22m ago',
    },
    {
      id: 'bl-2',
      msg: 'Detention alert logged at receiver dock (Atlanta). Detention voucher generated for accounting review.',
      at: '1h ago',
    },
  ]);

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];

  // Calculate 3-Year Enterprise Savings Comparison
  const tweMonthlyPerTruck = 29;
  const tweHardwarePerTruck = 45; // Standard Bluetooth J1939 dongle
  const threeYearLegacyCost = (legacyHardwareCostPerTruck + legacyMonthlyCostPerTruck * 36) * fleetTruckCount;
  const threeYearTweCost = (tweHardwarePerTruck + tweMonthlyPerTruck * 36) * fleetTruckCount;
  const netThreeYearSavings = threeYearLegacyCost - threeYearTweCost;

  // Insurance telematics discount (average $1,600/yr per truck with verified safe telemetry)
  const estimatedInsuranceSavingsPerYear = fleetTruckCount * 1650;

  const handleSendCopilotMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEncouragement.trim()) return;

    triggerHapticFeedback('medium');
    const newEntry = {
      id: `bl-${Date.now()}`,
      msg: customEncouragement.trim(),
      at: 'Just now',
    };
    setBroadcastLog([newEntry, ...broadcastLog]);
    setCustomEncouragement('');
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Tactical Master Mission Header */}
      <div className="p-4 sm:p-6 bg-[#0D140F] border-2 border-[#1E2D22] rounded-2xl relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
        {/* Decorative Grid and Reticles */}
        <div className="absolute top-0 right-0 w-80 h-full bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.12),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-2 right-4 text-[10px] font-mono text-[#233327] select-none hidden md:block">
          SYS-SPEC // 49-CFR-BEHAVIORAL-ENGINE // SOVEREIGN FLEET OS
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#16251A] border-2 border-[#4ADE80] flex items-center justify-center text-[#4ADE80] shadow-[0_0_20px_rgba(74,222,128,0.4)] shrink-0">
              <HeartPulse className="w-7 h-7 animate-pulse text-[#4ADE80]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-[#E5B869] px-2 py-0.5 rounded bg-[#E5B869]/10 border border-[#E5B869]/30 tracking-widest uppercase">
                  THE HEART OF TRUCKWITHEASE
                </span>
                <span className="text-[10px] font-mono text-[#4ADE80] flex items-center gap-1 font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-ping" />
                  COGNITIVE PARTNER ACTIVE
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-['Chakra_Petch'] font-black text-[#F1F5F9] uppercase tracking-wider mt-1">
                Driver Heartbeat, Behavioral AI & Sovereign Fleet Hub
              </h1>
              <p className="text-xs sm:text-sm text-[#94A39A] font-sans max-w-3xl mt-0.5">
                Human-centric telematics observing habits, mood, demeanor & circadian alertness. Empowering independent drivers & small fleets with enterprise tools at a fraction of legacy corporate rates.
              </p>
            </div>
          </div>

          {/* Active Driver Profile Switcher */}
          <div className="flex items-center gap-2 bg-[#111A13] border border-[#233327] p-2 rounded-xl shrink-0 w-full sm:w-auto">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-[#64748B] uppercase">OBSERVING DRIVER:</span>
              <select
                value={selectedDriverId}
                onChange={(e) => {
                  triggerHapticFeedback('subtle');
                  setSelectedDriverId(e.target.value);
                }}
                className="bg-[#0A0E0B] border border-[#1E2D22] text-[#4ADE80] font-['Chakra_Petch'] font-bold text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#4ADE80]"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.unit.split(' ')[0]} ({d.archetype})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Heartbeat Waveform Metric Bar */}
        <div className="mt-4 pt-4 border-t border-[#1E2D22] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-[#111813] border border-[#1E2D22]">
            <span className="text-[10px] font-mono text-[#64748B] block">CURRENT MOOD & DEMEANOR</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Smile className="w-4 h-4 text-[#4ADE80]" />
              <span className="font-['Chakra_Petch'] font-bold text-[#F1F5F9]">
                {selectedDriver.currentMood}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#111813] border border-[#1E2D22]">
            <span className="text-[10px] font-mono text-[#64748B] block">STRESS & FATIGUE INDEX</span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex-1 bg-[#1A261D] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    selectedDriver.stressScore > 50
                      ? 'bg-rose-500'
                      : selectedDriver.stressScore > 30
                      ? 'bg-[#E5B869]'
                      : 'bg-[#4ADE80]'
                  }`}
                  style={{ width: `${selectedDriver.stressScore}%` }}
                />
              </div>
              <span className="font-mono font-bold text-[#E5B869] text-xs">
                {selectedDriver.stressScore}/100
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#111813] border border-[#1E2D22]">
            <span className="text-[10px] font-mono text-[#64748B] block">DRIVING SMOOTHNESS SCORE</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Activity className="w-4 h-4 text-[#4ADE80]" />
              <span className="font-mono font-bold text-[#4ADE80] text-sm">
                {selectedDriver.smoothnessScore} / 100
              </span>
              <span className="text-[9px] text-[#94A39A]">(Top 5% Tier)</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#111813] border border-[#1E2D22]">
            <span className="text-[10px] font-mono text-[#64748B] block">SOVEREIGN FLEET MODEL</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <DollarSign className="w-4 h-4 text-[#E5B869]" />
              <span className="font-['Chakra_Petch'] font-bold text-[#E5B869]">
                $29 / MO BYOD
              </span>
              <span className="text-[9px] text-[#94A39A]">(vs $185 Legacy)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tactical Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1.5 bg-[#0D140F] border border-[#1E2D22] rounded-xl select-none">
        {[
          { id: 'cognitive-radar', label: '1. MOOD & STRESS RADAR', icon: Brain, badge: 'LIVE' },
          { id: 'habits-archetypes', label: '2. HABITS & ARCHETYPES', icon: Activity, badge: 'LEARN' },
          { id: 'empathetic-copilot', label: '3. EMPATHETIC CO-PILOT', icon: HeartPulse, badge: 'ADVOCATE' },
          { id: 'affordable-certification', label: '4. AFFORDABLE FLEET CERT & ROI', icon: ShieldCheck, badge: 'DISRUPT' },
          { id: 'fleet-synergy', label: '5. FLEET OWNER & DRIVER SYNERGY', icon: Users, badge: 'RETENTION' },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHapticFeedback('light');
                setActiveSubTab(tab.id as typeof activeSubTab);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-['Chakra_Petch'] font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#182C1D] text-[#4ADE80] border border-[#4ADE80] shadow-[0_0_12px_rgba(74,222,128,0.25)]'
                  : 'text-[#94A39A] hover:text-[#F1F5F9] hover:bg-[#111813]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`text-[8px] font-mono px-1 py-0.2 rounded ${
                  isActive
                    ? 'bg-[#4ADE80] text-[#0A0E0B]'
                    : 'bg-[#162017] text-[#64748B] border border-[#233327]'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub-Tab 1: Cognitive Radar (Mood, Demeanor & Stress) */}
      {activeSubTab === 'cognitive-radar' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Real-Time Acoustic & Vocal Sentiment Card */}
            <div className="p-4 bg-[#0D140F] border border-[#1E2D22] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#4ADE80]" />
                  <h3 className="text-xs font-['Chakra_Petch'] font-bold text-[#F1F5F9] uppercase">
                    Vocal Sentiment & Speech Cadence
                  </h3>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/30 font-bold">
                  ACOUSTIC AI
                </span>
              </div>
              <p className="text-xs text-[#94A39A]">
                Analyzes driver radio and telecom voice inflection to identify subtle stress, fatigue, or frustration without recording private conversations.
              </p>
              <div className="p-3 bg-[#111813] border border-[#1E2D22] rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Recent Speech Tone:</span>
                  <span className="font-['Chakra_Petch'] font-bold text-[#4ADE80]">
                    {selectedDriver.recentVoiceTone}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Speech Pace:</span>
                  <span className="font-mono text-[#F1F5F9]">134 words/min (Calm & Steady)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Vocal Pitch Variance:</span>
                  <span className="font-mono text-[#E5B869]">12 Hz (Low Stress Variance)</span>
                </div>
              </div>
            </div>

            {/* Highway Stress Factors */}
            <div className="p-4 bg-[#0D140F] border border-[#1E2D22] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-[#E5B869]" />
                  <h3 className="text-xs font-['Chakra_Petch'] font-bold text-[#F1F5F9] uppercase">
                    Highway Stress Correlator
                  </h3>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#E5B869]/10 text-[#E5B869] border border-[#E5B869]/30 font-bold">
                  TELEMETRY
                </span>
              </div>
              <p className="text-xs text-[#94A39A]">
                Correlates environmental factors (crosswinds, traffic choke points, shipper detention) to explain sudden demeanor changes.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-[#111813] border border-[#1E2D22]">
                  <span className="text-[#CBD5E1]">Crosswinds / Weather Strain</span>
                  <span className="text-[#4ADE80] font-mono font-bold">LOW (12 MPH GUSTS)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#111813] border border-[#1E2D22]">
                  <span className="text-[#CBD5E1]">Traffic Stop-and-Go Gridlock</span>
                  <span className="text-[#4ADE80] font-mono font-bold">CLEAR (58 MPH AVG)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#111813] border border-[#1E2D22]">
                  <span className="text-[#CBD5E1]">Shipper Dock Detention Wait</span>
                  <span className="text-[#E5B869] font-mono font-bold">MODERATE (42 MINS)</span>
                </div>
              </div>
            </div>

            {/* Circadian Rhythm & Sleep Acuity */}
            <div className="p-4 bg-[#0D140F] border border-[#1E2D22] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#4ADE80]" />
                  <h3 className="text-xs font-['Chakra_Petch'] font-bold text-[#F1F5F9] uppercase">
                    Circadian Peak & Acuity
                  </h3>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/30 font-bold">
                  BIOMETRIC
                </span>
              </div>
              <p className="text-xs text-[#94A39A]">
                Predicts driver's personal mental acuity window based on historical duty starts and restorative rest cycles.
              </p>
              <div className="p-3 bg-[#111813] border border-[#1E2D22] rounded-lg space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Driver Peak Focus Window:</span>
                  <span className="font-['Chakra_Petch'] text-[#4ADE80] font-bold">
                    {selectedDriver.circadianPeakHour}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Restorative Off-Duty Sleep:</span>
                  <span className="font-mono text-[#F1F5F9]">8.4 Hours (Fully Recharged)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Micro-Steering Stability:</span>
                  <span className="font-mono text-[#4ADE80] font-bold">98.2% (Zero Slump)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Habits & Tendency Learning Matrix */}
      {activeSubTab === 'habits-archetypes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Driver Operating Archetype */}
            <div className="p-4 sm:p-5 bg-[#0D140F] border border-[#1E2D22] rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#E5B869]" />
                <h3 className="text-sm font-['Chakra_Petch'] font-bold text-[#F1F5F9] uppercase">
                  Learned Driver Archetype: {selectedDriver.archetype}
                </h3>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                {selectedDriver.temperament}
              </p>
              <div className="p-3 bg-[#111813] border border-[#1E2D22] rounded-lg space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Preferred Highway Cadence:</span>
                  <span className="text-[#F1F5F9] font-medium">{selectedDriver.preferredCadence}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Preferred Havens:</span>
                  <span className="text-[#E5B869] font-medium">{selectedDriver.favoriteHavenType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Detention Patience Threshold:</span>
                  <span className="text-[#4ADE80] font-mono font-bold">{selectedDriver.detentionPatienceLimitMin} Minutes</span>
                </div>
              </div>
            </div>

            {/* How TruckWithEase Automatically Adapts */}
            <div className="p-4 sm:p-5 bg-[#0D140F] border border-[#1E2D22] rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#4ADE80]" />
                <h3 className="text-sm font-['Chakra_Petch'] font-bold text-[#F1F5F9] uppercase">
                  Personalized AI Co-Pilot Adaptations
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-[#CBD5E1]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0 mt-0.5" />
                  <span><strong>Night-Vision UI Preset:</strong> Automatically enables dark amber/green HUD for {selectedDriver.name} at 20:00 without requiring manual menu clicks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0 mt-0.5" />
                  <span><strong>Zero-Nonsense Dispatch Tone:</strong> Audio alerts are concise and quiet; no intrusive beeps or punitive chimes during gear shifts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0 mt-0.5" />
                  <span><strong>Automated Dock Detention Clock:</strong> Starts counting at minute 45 and automatically pre-fills the broker detention voucher before frustration mounts.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Empathetic Co-Pilot & Advocate */}
      {activeSubTab === 'empathetic-copilot' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tone Selector & Co-Pilot Identity */}
            <div className="p-4 sm:p-5 bg-[#0D140F] border border-[#1E2D22] rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-[#4ADE80]" />
                  <h3 className="text-sm font-['Chakra_Petch'] font-bold text-[#F1F5F9] uppercase">
                    Co-Pilot Companion Persona
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#E5B869] font-bold">
                  RESPECTFUL AI
                </span>
              </div>
              <p className="text-xs text-[#94A39A]">
                Unlike legacy systems that treat drivers like erratic robots, TruckWithEase acts as a loyal co-driver and brother on the road.
              </p>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Empathetic Brother', desc: 'Warm, calm, supportive tone' },
                  { id: 'Tactical Veteran', desc: 'Crisp military radio brevity' },
                  { id: 'Silent Guardian', desc: 'Zero speech, visual HUD only' },
                ].map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => {
                      triggerHapticFeedback('subtle');
                      setCopilotTone(tone.id as typeof copilotTone);
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      copilotTone === tone.id
                        ? 'bg-[#182C1D] border-[#4ADE80] text-[#F1F5F9]'
                        : 'bg-[#111813] border-[#1E2D22] text-[#64748B]'
                    }`}
                  >
                    <span className="text-xs font-['Chakra_Petch'] font-bold block">{tone.id}</span>
                    <span className="text-[10px] text-[#94A39A] block mt-0.5">{tone.desc}</span>
                  </button>
                ))}
              </div>

              {/* Sample In-Cab Co-Pilot Voice Prompts */}
              <div className="p-3 bg-[#111813] border border-[#1E2D22] rounded-lg space-y-2">
                <span className="text-[10px] font-mono text-[#E5B869] font-bold block">
                  RECENT CO-PILOT IN-CAB RADIO PROMPTS:
                </span>
                <p className="text-xs text-[#CBD5E1] italic">
                  "Hey Marcus, gusting crosswinds at Elk Mountain are peaking at 42 mph. Let's ease it back to 58 mph and grab coffee at mile 255. Your load is secured solid."
                </p>
                <p className="text-xs text-[#CBD5E1] italic">
                  "Dock delay in Atlanta reached 120 minutes. I've automatically signed and generated your detention compensation voucher ($85/hr rate). Take a breather."
                </p>
              </div>
            </div>

            {/* Custom Encouragement / Broadcast Dispatcher */}
            <div className="p-4 sm:p-5 bg-[#0D140F] border border-[#1E2D22] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#4ADE80]" />
                  <h3 className="text-sm font-['Chakra_Petch'] font-bold text-[#F1F5F9] uppercase">
                    Fleet Owner Encouragement Channel
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#4ADE80] font-bold">1-ON-1 COMM</span>
              </div>
              <p className="text-xs text-[#94A39A]">
                Send direct positive reinforcement, bonus acknowledgments, or wellness check-ins directly to {selectedDriver.name}'s in-cab HUD.
              </p>

              <form onSubmit={handleSendCopilotMessage} className="space-y-2">
                <textarea
                  value={customEncouragement}
                  onChange={(e) => setCustomEncouragement(e.target.value)}
                  placeholder={`Type a personal encouragement or bonus notice for ${selectedDriver.name}...`}
                  rows={2}
                  className="w-full bg-[#0A0E0B] border border-[#233327] rounded-lg p-2.5 text-xs text-[#F1F5F9] placeholder-[#64748B] focus:border-[#4ADE80] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!customEncouragement.trim()}
                  className="btn-mil-primary px-3 py-1.5 text-xs font-['Chakra_Petch'] font-bold rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>TRANSMIT RECOGNITION</span>
                </button>
              </form>

              <div className="space-y-1.5 pt-2 border-t border-[#1E2D22] max-h-36 overflow-y-auto">
                {broadcastLog.map((b) => (
                  <div key={b.id} className="p-2 rounded bg-[#111813] border border-[#1E2D22] text-xs">
                    <div className="flex items-center justify-between text-[10px] text-[#64748B] font-mono">
                      <span>SENT TO CAB</span>
                      <span>{b.at}</span>
                    </div>
                    <p className="text-[#CBD5E1] mt-0.5">{b.msg}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Affordable Fleet Certification & Big-Tech Disruption */}
      {activeSubTab === 'affordable-certification' && (
        <div className="space-y-5">
          {/* The 4 Sovereign Carrier Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 bg-[#0D140F] border border-[#1E2D22] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <ShieldCheck className="w-5 h-5 text-[#4ADE80]" />
                <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-[#4ADE80]/10 text-[#4ADE80] font-bold">100% LEGAL</span>
              </div>
              <h4 className="text-xs font-['Chakra_Petch'] font-bold text-[#F1F5F9] uppercase">FMCSA Self-Certified ELD</h4>
              <p className="text-[11px] text-[#94A39A]">
                49 CFR Part 395 Subpart B compliant. Registered on the official FMCSA list with zero federal filing fee.
              </p>
            </div>

            <div className="p-3.5 bg-[#0D140F] border border-[#1E2D22] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <DollarSign className="w-5 h-5 text-[#E5B869]" />
                <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-[#E5B869]/10 text-[#E5B869] font-bold">15% SAVINGS</span>
              </div>
              <h4 className="text-xs font-['Chakra_Petch'] font-bold text-[#F1F5F9] uppercase">Insurance Telematics Portal</h4>
              <p className="text-[11px] text-[#94A39A]">
                Shares verified smooth driving telemetry with underwriters (Progressive, Great West), saving $1,650/truck annually.
              </p>
            </div>

            <div className="p-3.5 bg-[#0D140F] border border-[#1E2D22] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <FileCheck className="w-5 h-5 text-[#4ADE80]" />
                <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-[#4ADE80]/10 text-[#4ADE80] font-bold">HIGHWAY CERT</span>
              </div>
              <h4 className="text-xs font-['Chakra_Petch'] font-bold text-[#F1F5F9] uppercase">Highway Trust Gold Seal</h4>
              <p className="text-[11px] text-[#94A39A]">
                Digital identity and authority vetting eliminating double-brokering suspicion and unlocking premium quick-pay loads.
              </p>
            </div>

            <div className="p-3.5 bg-[#0D140F] border border-[#1E2D22] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <Radio className="w-5 h-5 text-[#E5B869]" />
                <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-[#E5B869]/10 text-[#E5B869] font-bold">CVSA SPEC</span>
              </div>
              <h4 className="text-xs font-['Chakra_Petch'] font-bold text-[#F1F5F9] uppercase">CVSA Roadside Bluetooth</h4>
              <p className="text-[11px] text-[#94A39A]">
                Instant 1-tap wireless eRODS transfer to state troopers during roadside inspections with zero paperwork hassle.
              </p>
            </div>
          </div>

          {/* Interactive ROI & Savings Calculator */}
          <div className="p-5 bg-[#0D140F] border-2 border-[#E5B869]/50 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#1E2D22] pb-3">
              <div>
                <h3 className="text-base font-['Chakra_Petch'] font-bold text-[#F1F5F9] uppercase">
                  Sovereign Fleet Disruption Calculator: TruckWithEase vs. Big Tech
                </h3>
                <p className="text-xs text-[#94A39A]">
                  See exact net cash savings for independent carriers switching from legacy systems (Samsara / Motive / Omnitracs).
                </p>
              </div>
              <span className="text-xs font-mono text-[#4ADE80] font-bold px-2 py-1 rounded bg-[#16251A] border border-[#233327]">
                ZERO LOCK-IN CONTRACTS
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sliders */}
              <div className="space-y-4 lg:col-span-1">
                <div>
                  <div className="flex items-center justify-between text-xs font-['Chakra_Petch'] font-bold mb-1">
                    <span className="text-[#CBD5E1]">ACTIVE POWER UNITS:</span>
                    <span className="text-[#4ADE80] font-mono text-sm">{fleetTruckCount} TRUCKS</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    value={fleetTruckCount}
                    onChange={(e) => setFleetTruckCount(Number(e.target.value))}
                    className="w-full accent-[#4ADE80] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-['Chakra_Petch'] font-bold mb-1">
                    <span className="text-[#CBD5E1]">LEGACY MONTHLY / TRUCK:</span>
                    <span className="text-[#E5B869] font-mono">${legacyMonthlyCostPerTruck} / MO</span>
                  </div>
                  <input
                    type="range"
                    min={120}
                    max={250}
                    step={5}
                    value={legacyMonthlyCostPerTruck}
                    onChange={(e) => setLegacyMonthlyCostPerTruck(Number(e.target.value))}
                    className="w-full accent-[#E5B869] cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-[#111813] border border-[#1E2D22] rounded-xl text-xs text-[#94A39A]">
                  <p>
                    <strong>The BYOD Revolution:</strong> Drivers bring their own Android/iOS tablet or phone. Connects wirelessly to a $45 Bluetooth OBD-II/J1939 dongle. No $1,000 proprietary screens.
                  </p>
                </div>
              </div>

              {/* Side-by-Side Comparison & Net Cash Savings */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#111813] border border-rose-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-['Chakra_Petch'] font-bold text-rose-400">LEGACY CORPORATE TECH</span>
                    <span className="text-[10px] font-mono text-[#64748B]">36-MO LOCK</span>
                  </div>
                  <div className="text-2xl font-mono font-black text-rose-400">
                    ${threeYearLegacyCost.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-[#64748B]">
                    Includes ${legacyHardwareCostPerTruck} upfront hardware per truck + 3-year auto-renew contracts with punitive cancellation clauses.
                  </p>
                </div>

                <div className="p-4 bg-[#142217] border-2 border-[#4ADE80] rounded-xl space-y-2 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-['Chakra_Petch'] font-bold text-[#4ADE80]">TRUCKWITHEASE SOVEREIGN</span>
                    <span className="text-[10px] font-mono text-[#4ADE80] font-bold">MONTH-TO-MONTH</span>
                  </div>
                  <div className="text-2xl font-mono font-black text-[#4ADE80]">
                    ${threeYearTweCost.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-[#94A39A]">
                    Just $29/mo BYOD + $45 standard dongle. No hardware markups, zero cancellation fees, driver-respectful AI included.
                  </p>
                </div>

                {/* Total Cash Windfall */}
                <div className="sm:col-span-2 p-4 bg-[#1A261D] border border-[#2D4533] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono text-[#E5B869] font-bold block">
                      3-YEAR NET CASH SAVED + INSURANCE REBATES:
                    </span>
                    <div className="text-2xl sm:text-3xl font-mono font-black text-[#4ADE80] mt-0.5">
                      +${(netThreeYearSavings + estimatedInsuranceSavingsPerYear * 3).toLocaleString()} NET RETAINED
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#94A39A] block">
                      Re-invest in equipment maintenance or driver fuel bonuses
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 5: Fleet Owner & Driver Synergy */}
      {activeSubTab === 'fleet-synergy' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {drivers.map((d) => (
              <div
                key={d.id}
                className={`p-4 rounded-xl border transition-all ${
                  selectedDriverId === d.id
                    ? 'bg-[#16251A] border-[#4ADE80] shadow-[0_0_15px_rgba(74,222,128,0.2)]'
                    : 'bg-[#0D140F] border-[#1E2D22]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-['Chakra_Petch'] font-bold text-[#F1F5F9]">
                    {d.name}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#4ADE80]/10 text-[#4ADE80] font-bold">
                    {d.turnoverRisk} TURNOVER
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#E5B869] mb-2">{d.archetype}</p>
                <div className="space-y-1.5 text-xs text-[#94A39A]">
                  <div className="flex items-center justify-between">
                    <span>Smoothness:</span>
                    <span className="font-mono text-[#4ADE80] font-bold">{d.smoothnessScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Stress Level:</span>
                    <span className="font-mono text-[#E5B869] font-bold">{d.stressScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Optimal Dispatch:</span>
                    <span className="font-sans text-[#CBD5E1] text-[10px]">{d.circadianPeakHour}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    triggerHapticFeedback('light');
                    setSelectedDriverId(d.id);
                  }}
                  className="mt-3 w-full py-1.5 rounded bg-[#111813] border border-[#1E2D22] text-xs font-['Chakra_Petch'] text-[#94A39A] hover:text-[#4ADE80] hover:border-[#4ADE80]"
                >
                  SELECT FOR 1-ON-1 COGNITIVE REVIEW
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
