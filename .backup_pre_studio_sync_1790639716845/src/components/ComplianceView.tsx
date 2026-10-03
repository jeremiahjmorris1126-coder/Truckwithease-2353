import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  Building,
  UserCheck,
  Calendar,
  Award,
  Search,
  Filter,
  Radio,
  Vibrate,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Eye,
  Check,
  Zap,
  Gauge,
  HelpCircle,
  TrendingDown,
  Navigation,
  FileSpreadsheet,
  Cpu,
  Car,
  Scale,
  Printer,
  BadgeCheck,
} from 'lucide-react';
import { MOCK_COMPLIANCE_DOCUMENTS } from '../data/mockData';
import {
  ComplianceDocument,
  DotScoreData,
  WeighStationBypassState,
  RoadsideInspectionGuide,
  TabType,
} from '../types';
import {
  fetchDotScore,
  fetchWeighStationBypass,
  simulateWeighStationBypass,
  fetchRoadsideInspectionGuide,
  FALLBACK_DOT_SCORE_DATA,
  FALLBACK_BYPASS_STATE,
  FALLBACK_ROADSIDE_GUIDE,
} from '../services/dotScoreService';
import { triggerHapticFeedback } from '../services/haptics';
import { MandatoryDvirExportModal } from './MandatoryDvirExportModal';

interface ComplianceViewProps {
  onNavigateToTab?: (tab: TabType) => void;
}

export const ComplianceView: React.FC<ComplianceViewProps> = ({ onNavigateToTab }) => {
  // Main Top-Level Tab Navigation
  const [activeMainTab, setActiveMainTab] = useState<
    'DOT_SCORE' | 'SCALE_BYPASS' | 'ROADSIDE_SHIELD' | 'MANDATORY_DVIR' | 'DOC_VAULT'
  >('DOT_SCORE');

  // Mandatory DVIR Export Modal State
  const [isDvirExportModalOpen, setIsDvirExportModalOpen] = useState(false);
  const [dvirExportUnit, setDvirExportUnit] = useState('UNIT #104-E');

  // DOT Score Data State
  const [dotScore, setDotScore] = useState<DotScoreData>(FALLBACK_DOT_SCORE_DATA);
  const [bypassState, setBypassState] = useState<WeighStationBypassState>(FALLBACK_BYPASS_STATE);
  const [roadsideGuide, setRoadsideGuide] = useState<RoadsideInspectionGuide>(
    FALLBACK_ROADSIDE_GUIDE
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSimulatingBypass, setIsSimulatingBypass] = useState<boolean>(false);

  // Document Vault State (Preserved)
  const [docs, setDocs] = useState<ComplianceDocument[]>(MOCK_COMPLIANCE_DOCUMENTS);
  const [selectedDocCategory, setSelectedDocCategory] = useState<string>('ALL');
  const [previewDoc, setPreviewDoc] = useState<ComplianceDocument | null>(null);

  // Roadside Inspection Interactive State
  const [officerRoutingCode, setOfficerRoutingCode] = useState<string>('US-DOT-7829');
  const [eldTransferStatus, setEldTransferStatus] = useState<
    'IDLE' | 'TRANSMITTING' | 'CONFIRMED'
  >('IDLE');
  const [cabInspectionModeActive, setCabInspectionModeActive] = useState<boolean>(false);
  const [checkedOosItems, setCheckedOosItems] = useState<Record<string, boolean>>({
    'check-brakes': true,
    'check-tires': true,
    'check-lights': true,
    'check-securement': true,
    'check-coupling': true,
  });

  // Haptics Test Indicator
  const [lastHapticTriggered, setLastHapticTriggered] = useState<string>('');

  useEffect(() => {
    loadAllComplianceData();
  }, []);

  const loadAllComplianceData = async () => {
    setIsLoading(true);
    try {
      const [scoreRes, bypassRes, guideRes] = await Promise.all([
        fetchDotScore(),
        fetchWeighStationBypass(),
        fetchRoadsideInspectionGuide(),
      ]);
      setDotScore(scoreRes);
      setBypassState(bypassRes);
      setRoadsideGuide(guideRes);
    } catch (err) {
      console.warn('[COMPLIANCE] Data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateBypassSignal = async (mode: 'BYPASS_GREEN' | 'PULL_IN_RED') => {
    setIsSimulatingBypass(true);
    try {
      const updated = await simulateWeighStationBypass(mode);
      setBypassState(updated);

      if (mode === 'BYPASS_GREEN') {
        triggerHapticFeedback('bypass-green');
        setLastHapticTriggered('BYPASS GREEN LIGHT HAPTIC PULSE [• •]');
      } else {
        triggerHapticFeedback('pull-in-red');
        setLastHapticTriggered('MANDATORY SCALE PULL-IN HAPTIC ALERT [••• ••• •••]');
      }
    } finally {
      setIsSimulatingBypass(false);
    }
  };

  const handleEldTransfer = () => {
    setEldTransferStatus('TRANSMITTING');
    triggerHapticFeedback('double');
    setTimeout(() => {
      setEldTransferStatus('CONFIRMED');
      triggerHapticFeedback('success');
    }, 1200);
  };

  const toggleOosItem = (id: string) => {
    setCheckedOosItems((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      triggerHapticFeedback('tick');
      return next;
    });
  };

  const filteredDocs = docs.filter(
    (d) => selectedDocCategory === 'ALL' || d.category === selectedDocCategory
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] font-bold">
              // FMCSA CARRIER AUTHORITY &amp; SAFETY MATRIX
            </span>
            <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-[9px] uppercase font-bold tracking-widest rounded">
              ISS SCORE: {dotScore.issScore} ({dotScore.issCategory})
            </span>
            <span className="px-2 py-0.5 bg-[#0A0A0A] border border-[#333] text-[#C9A84C] font-mono text-[9px] uppercase font-bold tracking-widest rounded">
              BYPASS: {dotScore.bypassClearanceRatePct}%
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl uppercase text-white font-black tracking-tight mt-1 flex items-center gap-2">
            DOT Safety Score &amp; Roadside Inspection Shield
            <span className="inline-block w-2 h-2 bg-[#C9A84C]" />
          </h1>
          <p className="text-xs font-mono text-[#888] mt-1 max-w-3xl">
            Live FMCSA Safety Measurement System (SMS) scoring, scale house bypass radar, certified CVSA roadside inspection guides, and digital document vault.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setDvirExportUnit('UNIT #104-E');
              setIsDvirExportModalOpen(true);
              triggerHapticFeedback('double');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black text-xs font-mono font-black uppercase tracking-wider rounded transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] active:scale-95"
            title="Generate consolidated Pre-Trip & Post-Trip DVIR Bundle (49 CFR § 396.11)"
          >
            <ShieldCheck className="w-4 h-4 text-black" />
            <span>MANDATORY DVIR EXPORT</span>
          </button>

          <button
            onClick={() => loadAllComplianceData()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1C1C1C] hover:bg-[#252525] border border-[#333] text-[#AAA] hover:text-white text-xs font-mono font-bold uppercase tracking-wider rounded transition-all"
            title="Refresh live FMCSA telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </button>

          <button
            onClick={() => {
              triggerHapticFeedback('double');
              alert('Complete Carrier Regulatory Packet (W-9, COI, Authority Certificate, DQF & ISS Verification) downloaded.');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] hover:bg-white text-black text-xs font-mono font-black uppercase tracking-wider rounded transition-all shadow-[0_0_20px_rgba(201,168,76,0.2)] active:scale-95"
          >
            <Download className="w-4 h-4 text-black" />
            <span>DOWNLOAD BROKER PACKET</span>
          </button>
        </div>
      </div>

      {/* Trust & Identity Header Strip */}
      <div className="p-4 sm:p-5 bg-[#141414] border border-[#222] rounded-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shadow-md">
        <div className="border-b sm:border-b-0 sm:border-r border-[#222] pb-3 sm:pb-0 sm:pr-4 flex flex-col justify-center">
          <span className="text-[10px] font-mono text-[#777] uppercase font-bold tracking-widest">
            CARRIER LEGAL ENTITY
          </span>
          <div className="font-headline text-lg sm:text-xl font-black text-white mt-1">
            {dotScore.carrierLegalName}
          </div>
          <div className="text-xs font-mono text-[#C9A84C] font-bold mt-0.5">
            DBA {dotScore.dba}
          </div>
        </div>

        <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded text-center font-mono">
          <span className="text-[9px] text-[#666] block uppercase">USDOT &amp; MC NUMBER</span>
          <span className="text-base sm:text-lg font-black text-[#C9A84C] mt-0.5 block">
            DOT: {dotScore.usdotNumber} • MC: {dotScore.mcNumber}
          </span>
          <span className="text-[9px] text-emerald-400 font-bold">AUTHORIZED FOR HIRE (COMMON)</span>
        </div>

        <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded text-center font-mono">
          <span className="text-[9px] text-[#666] block uppercase">SAFETY RATING &amp; ISS TIER</span>
          <span className="text-base sm:text-lg font-black text-white mt-0.5 block flex items-center justify-center gap-1.5">
            <span className="text-emerald-400">{dotScore.safetyRating}</span>
            <span className="text-xs text-[#888]">/ ISS {dotScore.issScore}</span>
          </span>
          <span className="text-[9px] text-emerald-400 font-bold">PASS TIER // LOWEST AUDIT RISK</span>
        </div>

        <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded text-center font-mono">
          <span className="text-[9px] text-[#666] block uppercase">SCALE BYPASS RATE</span>
          <span className="text-base sm:text-lg font-black text-emerald-400 mt-0.5 block">
            {dotScore.bypassClearanceRatePct}%
          </span>
          <span className="text-[9px] text-[#888]">PREPASS &amp; DRIVEWYZE CVISN</span>
        </div>
      </div>

      {/* Main Feature Tabs */}
      <div className="flex items-center gap-2 border-b border-[#222] overflow-x-auto pb-1">
        {[
          {
            id: 'DOT_SCORE',
            label: '1. DOT Safety Score & CSA BASICs',
            badge: `${dotScore.issScore} PASS`,
            badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700',
          },
          {
            id: 'SCALE_BYPASS',
            label: '2. Weigh Station Bypass Radar',
            badge: bypassState.upcomingWeighStation.currentCabSignal === 'BYPASS_APPROVED' ? 'GREEN LIGHT' : 'PULL IN',
            badgeColor: bypassState.upcomingWeighStation.currentCabSignal === 'BYPASS_APPROVED' ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-red-950 text-red-300 border-red-700',
          },
          {
            id: 'ROADSIDE_SHIELD',
            label: '3. Roadside Inspection Zero-Violation Shield',
            badge: 'CVSA LEVEL I/II/III',
            badgeColor: 'bg-[#1C1C1C] text-[#C9A84C] border-[#444]',
          },
          {
            id: 'MANDATORY_DVIR',
            label: '4. Mandatory DVIR Export Bundler',
            badge: '49 CFR § 396.11',
            badgeColor: 'bg-amber-950 text-amber-300 border-amber-700',
          },
          {
            id: 'DOC_VAULT',
            label: '5. Document Vault & Certificates',
            badge: `${filteredDocs.length} DOCS`,
            badgeColor: 'bg-[#1C1C1C] text-[#AAA] border-[#333]',
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveMainTab(tab.id as any);
              triggerHapticFeedback('tick');
            }}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 shrink-0 flex items-center gap-2 rounded-t ${
              activeMainTab === tab.id
                ? 'border-[#C9A84C] text-[#C9A84C] bg-[#181818]'
                : 'border-transparent text-[#777] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase border rounded ${tab.badgeColor}`}
            >
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FMCSA DOT SAFETY SCORE & CSA BASICS BREAKDOWN */}
      {/* ========================================================================= */}
      {activeMainTab === 'DOT_SCORE' && (
        <div className="space-y-6">
          {/* Executive Score & Out-of-Service KPI Strip */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Primary ISS Score Dial */}
            <div className="p-5 bg-[#141414] border border-[#222] rounded-lg flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#777] uppercase font-bold tracking-wider">
                  FMCSA ISS-D SCORE
                </span>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-mono font-bold rounded">
                  PASS (1–49)
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-4xl font-black text-emerald-400">
                  {dotScore.issScore}
                </span>
                <span className="text-xs font-mono text-[#666]">/ 100 max</span>
              </div>
              <p className="text-[11px] font-mono text-[#AAA] leading-relaxed">
                {dotScore.issRecommendation}
              </p>
              <div className="w-full bg-[#222] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all"
                  style={{ width: `${(dotScore.issScore / 100) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-[#666]">
                <span>1 PASS</span>
                <span>50 OPTIONAL</span>
                <span>75+ INSPECT</span>
              </div>
            </div>

            {/* Vehicle Out of Service Rate */}
            <div className="p-5 bg-[#141414] border border-[#222] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#777] uppercase font-bold tracking-wider">
                  VEHICLE OOS RATE
                </span>
                <span className="text-emerald-400 text-[10px] font-mono font-bold">
                  90% BETTER
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-3xl font-black text-white">
                  {dotScore.oosRates.vehicleOosPct}%
                </span>
                <span className="text-xs font-mono text-[#666]">
                  vs {dotScore.oosRates.nationalVehicleOosAvgPct}% nat’l avg
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#888]">
                Only 1 minor vehicle defect recorded in 34 roadside inspections over 24 months.
              </p>
            </div>

            {/* Driver Out of Service Rate */}
            <div className="p-5 bg-[#141414] border border-[#222] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#777] uppercase font-bold tracking-wider">
                  DRIVER OOS RATE
                </span>
                <span className="text-emerald-400 text-[10px] font-mono font-bold">PERFECT</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-3xl font-black text-emerald-400">
                  {dotScore.oosRates.driverOosPct}%
                </span>
                <span className="text-xs font-mono text-[#666]">
                  vs {dotScore.oosRates.nationalDriverOosAvgPct}% nat’l avg
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#888]">
                Zero HOS or driver credential out-of-service orders. 100% statutory lock verified.
              </p>
            </div>

            {/* Hazmat Out of Service Rate */}
            <div className="p-5 bg-[#141414] border border-[#222] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#777] uppercase font-bold tracking-wider">
                  HAZMAT OOS RATE
                </span>
                <span className="text-emerald-400 text-[10px] font-mono font-bold">PERFECT</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-3xl font-black text-emerald-400">
                  {dotScore.oosRates.hazmatOosPct}%
                </span>
                <span className="text-xs font-mono text-[#666]">
                  vs {dotScore.oosRates.nationalHazmatOosAvgPct}% nat’l avg
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#888]">
                Zero hazmat citations or shipping paper defects across all eligible loads.
              </p>
            </div>
          </div>

          {/* "WHAT IS IN THAT DATA SCORE" — Transparent Mathematical Breakdown */}
          <div className="p-5 bg-[#161616] border border-[#292A2F] rounded-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222] pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#C9A84C]" />
                <h2 className="font-headline text-lg uppercase font-black text-white">
                  What Is In That Data Score? (FMCSA SMS Methodology Explained)
                </h2>
              </div>
              <span className="text-xs font-mono text-[#888]">
                49 CFR Part 385 • Safety Measurement System (SMS)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3.5 bg-[#0D0E13] border border-[#222] rounded space-y-2">
                <span className="text-[10px] text-[#C9A84C] font-bold uppercase tracking-wider block">
                  1. TIME-WEIGHTING MULTIPLIERS
                </span>
                <p className="text-[#888] leading-relaxed">
                  Every citation is weighted based on recency:
                </p>
                <ul className="space-y-1 text-[#AAA]">
                  <li className="flex justify-between">
                    <span>0–6 Months:</span>
                    <span className="text-red-400 font-bold">3x Weight (Maximum)</span>
                  </li>
                  <li className="flex justify-between">
                    <span>6–12 Months:</span>
                    <span className="text-amber-400 font-bold">2x Weight</span>
                  </li>
                  <li className="flex justify-between">
                    <span>12–24 Months:</span>
                    <span className="text-emerald-400 font-bold">1x Weight</span>
                  </li>
                  <li className="flex justify-between">
                    <span>&gt; 24 Months:</span>
                    <span className="text-emerald-300 font-bold">0x PURGED</span>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 bg-[#0D0E13] border border-[#222] rounded space-y-2">
                <span className="text-[10px] text-[#C9A84C] font-bold uppercase tracking-wider block">
                  2. SEVERITY &amp; PEER NORMALIZATION
                </span>
                <p className="text-[#888] leading-relaxed">
                  Severity points (1 to 10) are assigned per 49 CFR statute code. Points are normalized against your peer group:
                </p>
                <div className="p-2 bg-[#161616] rounded border border-[#282828] text-[11px] text-white">
                  {dotScore.dataScoreComposition.powerUnitCohort}
                </div>
                <p className="text-[#777] text-[11px]">
                  Smaller carriers are judged against carriers with similar vehicle counts to prevent statistical bias.
                </p>
              </div>

              <div className="p-3.5 bg-[#0D0E13] border border-[#222] rounded space-y-2">
                <span className="text-[10px] text-[#C9A84C] font-bold uppercase tracking-wider block">
                  3. CLEAN INSPECTION DILUTION CREDIT
                </span>
                <p className="text-[#888] leading-relaxed">
                  Clean inspections with <strong className="text-white">zero violations</strong> expand your inspection denominator, actively lowering all percentiles:
                </p>
                <div className="flex justify-between items-center py-1 border-t border-[#222]">
                  <span className="text-[#888]">Total Inspections (24 Mo):</span>
                  <span className="text-white font-bold">{dotScore.dataScoreComposition.totalInspections24Months}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-[#222]">
                  <span className="text-[#888]">Clean Inspections:</span>
                  <span className="text-emerald-400 font-bold">{dotScore.dataScoreComposition.cleanInspectionsCount} ({dotScore.dataScoreComposition.cleanInspectionRatioPct}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* The 7 CSA BASICs Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#222] pb-2">
              <h2 className="font-headline text-lg uppercase font-black text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#C9A84C]" />
                Carrier CSA 7 BASICs Percentile Matrix
              </h2>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                ALL 7 BASICS BELOW FMCSA INTERVENTION THRESHOLDS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dotScore.csaBasics.map((basic) => {
                const isUnderThreshold = basic.percentile < basic.interventionThreshold;
                return (
                  <div
                    key={basic.code}
                    className="p-4 bg-[#141414] border border-[#222] hover:border-[#333] rounded-lg space-y-3 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-[#222] pb-2">
                      <div>
                        <span className="text-[9px] font-mono text-[#666] uppercase tracking-wider block">
                          {basic.regulationsCited}
                        </span>
                        <h3 className="font-headline text-sm font-bold text-white mt-0.5">
                          {basic.basicName}
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 text-[9px] font-mono uppercase font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                        {basic.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-[#888]">Carrier Percentile:</span>
                        <span className="text-white font-bold">{basic.percentile}%</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-[#666]">FMCSA Alert Threshold:</span>
                        <span className="text-[#AAA]">{basic.interventionThreshold}%</span>
                      </div>
                      <div className="w-full bg-[#222] h-2 rounded-full overflow-hidden mt-1 relative">
                        <div
                          className="bg-emerald-400 h-full rounded-full transition-all"
                          style={{ width: `${Math.max(2, basic.percentile)}%` }}
                        />
                        {/* Threshold indicator line */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                          style={{ left: `${basic.interventionThreshold}%` }}
                          title={`Threshold: ${basic.interventionThreshold}%`}
                        />
                      </div>
                    </div>

                    <p className="text-[11px] font-mono text-[#777] leading-relaxed">
                      {basic.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actionable Recommendations to Improve & Protect Score */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#222] pb-2">
              <h2 className="font-headline text-lg uppercase font-black text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-[#C9A84C]" />
                Actionable Recommendations to Improve &amp; Safeguard Score
              </h2>
              <span className="text-xs font-mono text-[#C9A84C] font-bold">
                FMCSA ZERO-DEFECT STRATEGY
              </span>
            </div>

            <div className="space-y-3">
              {dotScore.actionableRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 bg-[#141414] border border-[#222] rounded-lg space-y-2 hover:border-[#333] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                          rec.priority === 'HIGH'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : rec.priority === 'MEDIUM'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {rec.priority} PRIORITY
                      </span>
                      <h3 className="font-headline text-base font-bold text-white">
                        {rec.title}
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-[#C9A84C] font-bold">
                      {rec.scoreImpact}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-[#888]">
                    <span className="text-[#666]">Regulatory Baseline:</span> {rec.fmcsaRule}
                  </div>

                  <ul className="space-y-1 font-mono text-xs text-[#AAA] list-disc list-inside">
                    {rec.actionSteps.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WEIGH STATION BYPASS & ELECTRONIC SCREENING RADAR */}
      {/* ========================================================================= */}
      {activeMainTab === 'SCALE_BYPASS' && (
        <div className="space-y-6">
          {/* Live In-Cab Weigh Station Signal Display */}
          <div
            className={`p-6 border-2 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${
              bypassState.upcomingWeighStation.currentCabSignal === 'BYPASS_APPROVED'
                ? 'bg-emerald-950/20 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                : 'bg-red-950/20 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
            }`}
          >
            <div className="flex items-center gap-5">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center font-headline text-2xl font-black shrink-0 border-4 animate-pulse ${
                  bypassState.upcomingWeighStation.currentCabSignal === 'BYPASS_APPROVED'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                    : 'bg-red-500/20 border-red-400 text-red-400 shadow-[0_0_20px_rgba(248,113,113,0.5)]'
                }`}
              >
                {bypassState.upcomingWeighStation.currentCabSignal === 'BYPASS_APPROVED'
                  ? 'GO'
                  : 'STOP'}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#888] uppercase tracking-widest font-bold">
                    PREPASS / DRIVEWYZE IN-CAB E-SCREENING SIGNAL
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase ${
                      bypassState.upcomingWeighStation.currentCabSignal === 'BYPASS_APPROVED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-red-950 text-red-300 border border-red-700'
                    }`}
                  >
                    {bypassState.upcomingWeighStation.operatingStatus}
                  </span>
                </div>

                <h2 className="font-headline text-xl sm:text-2xl font-black text-white mt-1">
                  {bypassState.upcomingWeighStation.signalTitle}
                </h2>

                <p className="text-xs font-mono text-[#AAA] mt-1">
                  Upcoming Scale: <strong className="text-white">{bypassState.upcomingWeighStation.name}</strong> • {bypassState.upcomingWeighStation.distanceMiles} miles ahead on {bypassState.upcomingWeighStation.corridor}
                </p>
              </div>
            </div>

            {/* In-Cab Haptics Testing & Simulation Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={() => handleSimulateBypassSignal('BYPASS_GREEN')}
                disabled={isSimulatingBypass}
                className="px-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500 text-emerald-300 font-mono text-xs font-bold uppercase rounded transition-all flex items-center justify-center gap-2 active:scale-95 shadow"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>TEST GREEN BYPASS</span>
              </button>

              <button
                onClick={() => handleSimulateBypassSignal('PULL_IN_RED')}
                disabled={isSimulatingBypass}
                className="px-4 py-2.5 bg-red-950 hover:bg-red-900 border border-red-500 text-red-300 font-mono text-xs font-bold uppercase rounded transition-all flex items-center justify-center gap-2 active:scale-95 shadow"
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>TEST RED PULL-IN</span>
              </button>
            </div>
          </div>

          {lastHapticTriggered && (
            <div className="p-3 bg-[#111] border border-[#222] rounded flex items-center justify-between text-xs font-mono text-cyan-300">
              <span className="flex items-center gap-2">
                <Vibrate className="w-4 h-4 text-cyan-400 animate-bounce" />
                Haptic Actuator Fired: {lastHapticTriggered}
              </span>
              <span className="text-[#666]">Web Vibration API // In-Cab Confirmed</span>
            </div>
          )}

          {/* Credential Health Verification Grid */}
          <div className="p-5 bg-[#141414] border border-[#222] rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-2">
              <h3 className="font-headline text-base uppercase font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />
                Electronic Pre-Clearance Credential Health
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                100% VERIFIED PRE-CLEARANCE ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded">
                <span className="text-[10px] text-[#666] block uppercase">IFTA FUEL TAX</span>
                <span className="text-white font-bold mt-1 block">VALID 2026 ACTIVE</span>
                <span className="text-[10px] text-emerald-400">Decal affixed to cab</span>
              </div>

              <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded">
                <span className="text-[10px] text-[#666] block uppercase">UCR REGISTRATION</span>
                <span className="text-white font-bold mt-1 block">PAID &amp; ACTIVE</span>
                <span className="text-[10px] text-emerald-400">National database linked</span>
              </div>

              <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded">
                <span className="text-[10px] text-[#666] block uppercase">BMC-91X INSURANCE</span>
                <span className="text-white font-bold mt-1 block">$1,000,000 ON FILE</span>
                <span className="text-[10px] text-emerald-400">FMCSA Active Liability</span>
              </div>

              <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded">
                <span className="text-[10px] text-[#666] block uppercase">TRANSPONDER RFID</span>
                <span className="text-[#C9A84C] font-bold mt-1 block">{bypassState.transponderId}</span>
                <span className="text-[10px] text-emerald-400">915 MHz Active Transceiver</span>
              </div>
            </div>
          </div>

          {/* How Weigh Station Bypass Works: Educational & Operational Protocol */}
          <div className="p-5 bg-[#141414] border border-[#222] rounded-lg space-y-4">
            <h3 className="font-headline text-base uppercase font-black text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#C9A84C]" />
              How Weigh Station Bypass Works &amp; Scale Protocol
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3.5 bg-[#0A0A0A] border border-[#222] rounded space-y-1.5">
                <span className="text-[#C9A84C] font-bold uppercase text-[10px]">
                  1. ROAD SENSORS &amp; WIM SCALES
                </span>
                <p className="text-[#888] leading-relaxed">
                  1 mile before the scale, Weigh-in-Motion (WIM) sensors embedded in the highway weigh your steer, drive, and trailer axles at 65 MPH while an overhead reader queries your PrePass transponder.
                </p>
              </div>

              <div className="p-3.5 bg-[#0A0A0A] border border-[#222] rounded space-y-1.5">
                <span className="text-[#C9A84C] font-bold uppercase text-[10px]">
                  2. INSTANT FMCSA CLEARANCE CHECK
                </span>
                <p className="text-[#888] leading-relaxed">
                  The state screening computer verifies your carrier ISS score (18 = PASS), valid IFTA, active insurance, and axle weights in 40 milliseconds.
                </p>
              </div>

              <div className="p-3.5 bg-[#0A0A0A] border border-[#222] rounded space-y-1.5">
                <span className="text-[#C9A84C] font-bold uppercase text-[10px]">
                  3. CAB SIGNAL &amp; DRIVER ACTION
                </span>
                <p className="text-[#888] leading-relaxed">
                  <strong className="text-emerald-400">GREEN LIGHT:</strong> Maintain speed on mainline highway. Do not exit.<br />
                  <strong className="text-red-400">RED LIGHT:</strong> Mandatory exit into weigh station queue. Failing to exit is a moving violation with $500–$1,500 fine.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ROADSIDE INSPECTION "ZERO-VIOLATION SHIELD" COPILOT */}
      {/* ========================================================================= */}
      {activeMainTab === 'ROADSIDE_SHIELD' && (
        <div className="space-y-6">
          {/* Emergency Alert Banner If Stopped */}
          <div className="p-4 bg-amber-950/30 border border-amber-500/50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h3 className="font-headline text-sm font-bold text-white uppercase">
                  PULLED OVER FOR ROADSIDE INSPECTION? STAY CALM &amp; FOLLOW THIS SHIELD PROTOCOL
                </h3>
                <p className="text-xs font-mono text-[#CCC] mt-0.5">
                  Follow these certified CVSA step-by-step instructions to protect your CDL, avoid admissions, pass cleanly, and earn MCMIS safety points.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setCabInspectionModeActive(!cabInspectionModeActive);
                  triggerHapticFeedback('double');
                }}
                className={`px-3 py-1.5 rounded font-mono text-xs font-bold uppercase transition-all ${
                  cabInspectionModeActive
                    ? 'bg-emerald-500 text-black shadow'
                    : 'bg-[#222] text-[#AAA] hover:text-white border border-[#444]'
                }`}
              >
                {cabInspectionModeActive ? 'CAB LOCK: ENGAGED' : 'ENGAGE CAB LOCK MODE'}
              </button>
            </div>
          </div>

          {/* Phase 1 & 2: Officer Demeanor & ELD Web Services Transfer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phase 1: In-Cab Demeanor */}
            <div className="p-5 bg-[#141414] border border-[#222] rounded-lg space-y-3">
              <div className="flex items-center gap-2 border-b border-[#222] pb-2">
                <span className="w-6 h-6 rounded-full bg-[#C9A84C] text-black font-black text-xs flex items-center justify-center font-mono">
                  1
                </span>
                <div>
                  <h3 className="font-headline text-sm uppercase font-black text-white">
                    In-Cab Officer Approach &amp; Demeanor
                  </h3>
                  <span className="text-[10px] font-mono text-[#777]">
                    49 CFR § 390.15 Driver Conduct
                  </span>
                </div>
              </div>

              <ul className="space-y-2 font-mono text-xs text-[#AAA]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Roll down driver window completely before the officer approaches.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Turn on interior cab dome light immediately at night.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Keep both hands resting visibly on top of steering wheel at 10 and 2.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Turn off engine and set tractor-trailer spring brakes when instructed.</span>
                </li>
                <li className="flex items-start gap-2 text-[#C9A84C]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A84C] mt-0.5 shrink-0" />
                  <span><strong>Do not speculate or volunteer unsolicited comments</strong> about truck health, load weight, or driving hours. Answer only direct questions politely.</span>
                </li>
              </ul>
            </div>

            {/* Phase 2: ELD Electronic Transfer */}
            <div className="p-5 bg-[#141414] border border-[#222] rounded-lg space-y-3">
              <div className="flex items-center gap-2 border-b border-[#222] pb-2">
                <span className="w-6 h-6 rounded-full bg-[#C9A84C] text-black font-black text-xs flex items-center justify-center font-mono">
                  2
                </span>
                <div>
                  <h3 className="font-headline text-sm uppercase font-black text-white">
                    ELD Electronic Data Transfer Protocol
                  </h3>
                  <span className="text-[10px] font-mono text-[#777]">
                    49 CFR § 395.24 &amp; § 395.34
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded space-y-2">
                <label className="text-[10px] font-mono text-[#888] uppercase block">
                  OFFICER FMCSA ROUTING CODE (ENTER FROM BADGE/CARD):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={officerRoutingCode}
                    onChange={(e) => setOfficerRoutingCode(e.target.value)}
                    className="flex-1 bg-[#161616] border border-[#333] text-white font-mono text-xs px-3 py-1.5 rounded focus:border-[#C9A84C] outline-none"
                    placeholder="e.g. US-DOT-7829 or IL-ISP-402"
                  />
                  <button
                    onClick={handleEldTransfer}
                    disabled={eldTransferStatus === 'TRANSMITTING'}
                    className="px-3.5 py-1.5 bg-[#C9A84C] hover:bg-white text-black font-mono text-xs font-black uppercase rounded transition-all active:scale-95"
                  >
                    {eldTransferStatus === 'TRANSMITTING' ? 'SENDING...' : 'TRANSMIT LOGS'}
                  </button>
                </div>

                {eldTransferStatus === 'CONFIRMED' && (
                  <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded text-[11px] font-mono text-emerald-300 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>8-Day Duty Status Logs transmitted via FMCSA Web Services (SHA-256 Verified).</span>
                  </div>
                )}
              </div>

              <div className="text-[11px] font-mono text-[#777] leading-relaxed">
                Tip: Always have the mandatory <strong className="text-white">8-day blank paper log sheets</strong> and ELD Malfunction Card ready in the glove box to prevent an instant 49 CFR § 395.22 citation.
              </div>
            </div>
          </div>

          {/* Phase 3: In-Cab Document Rapid Access Vault */}
          <div className="p-5 bg-[#141414] border border-[#222] rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#C9A84C] text-black font-black text-xs flex items-center justify-center font-mono">
                  3
                </span>
                <h3 className="font-headline text-sm uppercase font-black text-white">
                  1-Click In-Cab Regulatory Document Rapid Access
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                READY FOR IMMEDIATE PRESENTATION
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
              {/* Mandatory DVIR Roadside Bundle Special Presentation Card */}
              <div className="p-3 bg-gradient-to-br from-amber-950/40 to-[#141414] border-2 border-amber-500/50 rounded flex flex-col justify-between space-y-2 col-span-1 sm:col-span-2 lg:col-span-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                          MANDATORY ROADSIDE PACKET • 49 CFR § 396.11 &amp; § 396.13
                        </span>
                        <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                          PRE-TRIP + POST-TRIP SIGNED
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white mt-0.5">
                        Consolidated Daily Vehicle Inspection Report (DVIR) Bundle
                      </h4>
                      <p className="text-[11px] text-[#AAA] mt-0.5">
                        Includes verified brake air-loss measurements, steer/drive tire tread depth, 5th-wheel coupling, mechanic sign-off, driver digital signatures, and tamper-evident SHA-256 seal.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDvirExportUnit('UNIT #104-E');
                      setIsDvirExportModalOpen(true);
                      triggerHapticFeedback('double');
                    }}
                    className="px-4 py-2 bg-[#C9A84C] hover:bg-white text-black text-xs font-mono font-black uppercase tracking-wider rounded transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>PRINT / EXPORT DOT PDF</span>
                  </button>
                </div>
              </div>

              {[
                { title: 'CDL Class A (Driver)', id: 'CDL-BELL-104', issuer: 'IL Secretary of State', category: 'DRIVER_QUAL' },
                { title: 'Medical Examiner Card (MEC)', id: 'MCSA-5876-EXP27', issuer: 'National Registry #8841', category: 'DRIVER_QUAL' },
                { title: 'IRP Apportioned Cab Card', id: 'IRP-IL-2026-T104', issuer: 'Illinois DOT / IRP', category: 'AUTHORITY' },
                { title: 'IFTA License & Decal Certificate', id: 'IFTA-2026-IL-99120', issuer: 'International Fuel Tax', category: 'AUTHORITY' },
                { title: 'BMC-91X Certificate of Insurance', id: 'COI-GREAT-WEST-1M', issuer: 'Great West Casualty ($1M)', category: 'INSURANCE' },
                { title: 'Annual Periodic Inspection (App G)', id: 'INSP-2026-T104', issuer: 'Rush Truck Centers', category: 'AUTHORITY' },
              ].map((docItem) => (
                <div
                  key={docItem.id}
                  className="p-3 bg-[#0A0A0A] border border-[#222] hover:border-[#333] rounded flex flex-col justify-between space-y-2"
                >
                  <div>
                    <span className="text-[9px] text-[#666] uppercase block">{docItem.issuer}</span>
                    <span className="text-white font-bold block mt-0.5">{docItem.title}</span>
                    <span className="text-[10px] text-[#C9A84C]">{docItem.id}</span>
                  </div>
                  <button
                    onClick={() => {
                      triggerHapticFeedback('subtle');
                      alert(`Certified digital copy of ${docItem.title} displayed for officer presentation.`);
                    }}
                    className="w-full py-1 bg-[#1C1C1C] hover:bg-[#252525] border border-[#333] text-white text-[10px] font-mono font-bold uppercase rounded flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3 text-[#C9A84C]" />
                    <span>PRESENT TO OFFICER</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 4: Critical Out-of-Service (OOS) Avoidance Pre-Check */}
          <div className="p-5 bg-[#141414] border border-[#222] rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#C9A84C] text-black font-black text-xs flex items-center justify-center font-mono">
                  4
                </span>
                <h3 className="font-headline text-sm uppercase font-black text-white">
                  CVSA Critical Out-of-Service (OOS) Avoidance Pre-Check
                </h3>
              </div>
              <span className="text-xs font-mono text-[#888]">
                Interactive Field Verification
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {[
                {
                  id: 'check-brakes',
                  title: 'Brake System Pushrod Stroke & Air Buildup',
                  standard: '49 CFR § 393.47',
                  instruction: 'Pressure builds 85 to 100 PSI < 45 seconds. Pushrod stroke < 2.0" on Type 30 chambers. No audible air leaks.',
                },
                {
                  id: 'check-tires',
                  title: 'Steer & Drive Tire Tread Depth',
                  standard: '49 CFR § 393.75',
                  instruction: 'Steer tires >= 4/32" in every major groove. Drives/trailer >= 2/32". Zero exposed belts, cords, or side bulges.',
                },
                {
                  id: 'check-lights',
                  title: 'Complete 360° Lighting & Reflectors',
                  standard: '49 CFR § 393.11',
                  instruction: 'All headlights, turn indicators, brake lights, clearance markers, and license plate lamps illuminate.',
                },
                {
                  id: 'check-securement',
                  title: 'Cargo Securement & Working Load Limit (WLL)',
                  standard: '49 CFR § 393.102',
                  instruction: 'Total WLL >= 50% of cargo weight. Winch straps tight, edge protectors seated, zero tears or frayed webbing.',
                },
                {
                  id: 'check-coupling',
                  title: 'Fifth Wheel Locking Jaws & Gladhand Seals',
                  standard: '49 CFR § 393.70',
                  instruction: 'Jaws tightly locked around kingpin. Release handle flush. Gladhand rubber grommets free of cuts and grit.',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleOosItem(item.id)}
                  className={`p-3 rounded border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                    checkedOosItems[item.id]
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
                      : 'bg-[#0D0E13] border-[#222] text-[#888]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{item.title}</span>
                      <span className="text-[10px] text-[#C9A84C]">[{item.standard}]</span>
                    </div>
                    <p className="text-[11px] text-[#AAA]">{item.instruction}</p>
                  </div>

                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                      checkedOosItems[item.id]
                        ? 'bg-emerald-500 border-emerald-400 text-black'
                        : 'border-[#444] bg-[#161616]'
                    }`}
                  >
                    {checkedOosItems[item.id] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 5: Post-Inspection Debrief & Clean Inspection Credit */}
          <div className="p-5 bg-gradient-to-br from-[#181818] to-[#121212] border border-[#C9A84C]/40 rounded-lg space-y-3">
            <div className="flex items-center gap-2 border-b border-[#222] pb-2">
              <span className="w-6 h-6 rounded-full bg-[#C9A84C] text-black font-black text-xs flex items-center justify-center font-mono">
                5
              </span>
              <h3 className="font-headline text-base uppercase font-black text-white">
                Post-Inspection Debrief &amp; Clean Inspection Credit (The Golden Script)
              </h3>
            </div>

            <p className="text-xs font-mono text-[#AAA] leading-relaxed">
              When the inspecting officer concludes their check and finds no defects, <strong className="text-white">do not just drive away</strong>. Always politely ask the officer this exact phrase:
            </p>

            <div className="p-4 bg-[#0A0A0A] border border-[#C9A84C] rounded-lg font-mono text-sm text-[#FFE16D] italic">
              “Officer, thank you for your time. If everything is in order, could you please note &lsquo;No Violations Discovered&rsquo; on the final inspection report and transmit it to MCMIS?”
            </div>

            <div className="text-xs font-mono text-[#888] space-y-1">
              <span className="text-emerald-400 font-bold block">WHY THIS MATTERS:</span>
              <p>
                Every clean roadside inspection transmitted to FMCSA MCMIS expands your total inspection denominator. This mathematically lowers all 7 CSA BASIC percentiles, boosts your carrier trust score, and ensures you receive green bypass lights at 98%+ of weigh stations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MANDATORY DVIR BUNDLER & DOT ROADSIDE EXPORT */}
      {/* ========================================================================= */}
      {activeMainTab === 'MANDATORY_DVIR' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-6 bg-gradient-to-br from-[#181818] via-[#141414] to-[#0F0F0F] border-2 border-amber-500/40 rounded-xl space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-amber-500 text-black font-mono font-black text-[10px] uppercase rounded">
                    49 CFR § 396.11 &amp; § 396.13
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono font-bold text-[10px] uppercase rounded flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3 text-emerald-400" />
                    CRYPTOGRAPHIC SEAL ACTIVE
                  </span>
                </div>
                <h2 className="font-headline text-2xl uppercase font-black text-white">
                  Mandatory Daily Vehicle Inspection (DVIR) Bundler
                </h2>
                <p className="text-xs font-mono text-[#AAA] max-w-3xl">
                  Automated consolidation of Driver Pre-Trip &amp; Post-Trip safety inspections, certified mechanic repair certifications, and digital signature stamps into a single timestamped PDF for DOT roadside inspection and FMCSA safety audits.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsDvirExportModalOpen(true);
                    triggerHapticFeedback('double');
                  }}
                  className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 flex items-center gap-2 shrink-0"
                >
                  <Printer className="w-4 h-4 text-black" />
                  <span>LAUNCH BUNDLE EXPORT MODAL</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded">
                <span className="text-[10px] text-[#777] uppercase block">PRE-TRIP STATUS</span>
                <span className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PASSED (0 DEFECTS)
                </span>
                <span className="text-[9px] text-[#666]">06:15 AM CDT • 104-E</span>
              </div>

              <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded">
                <span className="text-[10px] text-[#777] uppercase block">POST-TRIP STATUS</span>
                <span className="text-sm font-bold text-amber-400 mt-0.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> 1 DEFECT (REPAIRED)
                </span>
                <span className="text-[9px] text-[#666]">05:45 PM CDT • 104-E</span>
              </div>

              <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded">
                <span className="text-[10px] text-[#777] uppercase block">MECHANIC SIGN-OFF</span>
                <span className="text-sm font-bold text-white mt-0.5 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-[#C9A84C]" /> CERTIFIED SAFE
                </span>
                <span className="text-[9px] text-[#666]">M. Rodriguez #TECH-882</span>
              </div>

              <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded">
                <span className="text-[10px] text-[#777] uppercase block">INTEGRITY HASH</span>
                <span className="text-xs font-mono font-bold text-[#C9A84C] mt-1 block truncate">
                  SHA256: 7f8a9b2c...4d1e
                </span>
                <span className="text-[9px] text-emerald-400 font-semibold">FMCSA TAMPER-EVIDENT</span>
              </div>
            </div>
          </div>

          {/* Unit Selection & Inspection Checklist Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pre-Trip Snapshot Card */}
            <div className="p-5 bg-[#141414] border border-[#222] rounded-lg space-y-4">
              <div className="flex items-center justify-between border-b border-[#222] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center border border-emerald-500/40">
                    PRE
                  </span>
                  <div>
                    <h3 className="font-headline text-sm uppercase font-black text-white">
                      Pre-Trip Inspection Packet
                    </h3>
                    <span className="text-[10px] font-mono text-[#777]">49 CFR § 396.13 Compliance</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30 rounded">
                  VERIFIED CLEAN
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs text-[#AAA]">
                <div className="p-2.5 bg-[#0A0A0A] border border-[#222] rounded flex justify-between">
                  <span className="text-[#666]">Inspection Timestamp:</span>
                  <span className="text-white font-bold">2026-09-12 06:15:00 CDT</span>
                </div>
                <div className="p-2.5 bg-[#0A0A0A] border border-[#222] rounded flex justify-between">
                  <span className="text-[#666]">Odometer &amp; Location:</span>
                  <span className="text-white font-bold">284,192 mi (Effingham, IL)</span>
                </div>
                <div className="p-2.5 bg-[#0A0A0A] border border-[#222] rounded flex justify-between">
                  <span className="text-[#666]">Brake Chamber Pushrod Stroke:</span>
                  <span className="text-emerald-400 font-bold">1.45 in (Pass &lt; 2.0&quot;)</span>
                </div>
                <div className="p-2.5 bg-[#0A0A0A] border border-[#222] rounded flex justify-between">
                  <span className="text-[#666]">Steer Tire Minimum Tread:</span>
                  <span className="text-emerald-400 font-bold">6/32 in (Pass &gt;= 4/32&quot;)</span>
                </div>
                <div className="p-2.5 bg-[#0A0A0A] border border-[#222] rounded flex justify-between">
                  <span className="text-[#666]">Driver Digital Signature:</span>
                  <span className="text-[#C9A84C] font-bold">Marcus Bell (CDL-IL-984210)</span>
                </div>
              </div>
            </div>

            {/* Post-Trip Snapshot Card */}
            <div className="p-5 bg-[#141414] border border-[#222] rounded-lg space-y-4">
              <div className="flex items-center justify-between border-b border-[#222] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center border border-amber-500/40">
                    POST
                  </span>
                  <div>
                    <h3 className="font-headline text-sm uppercase font-black text-white">
                      Post-Trip Inspection &amp; Certification
                    </h3>
                    <span className="text-[10px] font-mono text-[#777]">49 CFR § 396.11 Compliance</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold border border-amber-500/30 rounded">
                  REPAIRS CERTIFIED
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs text-[#AAA]">
                <div className="p-2.5 bg-[#0A0A0A] border border-[#222] rounded flex justify-between">
                  <span className="text-[#666]">Inspection Timestamp:</span>
                  <span className="text-white font-bold">2026-09-12 17:45:00 CDT</span>
                </div>
                <div className="p-2.5 bg-[#0A0A0A] border border-[#222] rounded flex justify-between">
                  <span className="text-[#666]">Odometer &amp; Location:</span>
                  <span className="text-white font-bold">284,650 mi (Pontoon Beach, IL)</span>
                </div>
                <div className="p-2.5 bg-[#0A0A0A] border border-[#222] rounded flex justify-between">
                  <span className="text-[#666]">Defect Reported:</span>
                  <span className="text-amber-400 font-bold">Right Marker Lamp Bulb Replaced</span>
                </div>
                <div className="p-2.5 bg-[#0A0A0A] border border-[#222] rounded flex justify-between">
                  <span className="text-[#666]">Corrective Action / Mechanic:</span>
                  <span className="text-emerald-400 font-bold">Repaired &amp; Certified Safe</span>
                </div>
                <div className="p-2.5 bg-[#0A0A0A] border border-[#222] rounded flex justify-between">
                  <span className="text-[#666]">Next Driver Review Sign-off:</span>
                  <span className="text-[#C9A84C] font-bold">Signed &amp; Acknowledged</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="p-4 bg-[#141414] border border-[#222] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#1C1C1C] border border-[#333] flex items-center justify-center text-[#C9A84C]">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="font-mono text-xs">
                <span className="text-white font-bold block">Ready for Roadside Inspection or State DOT Audit</span>
                <span className="text-[#777] text-[11px]">Generate FMCSA-standard combined Pre/Post-Trip PDF with digital signatures.</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsDvirExportModalOpen(true);
                triggerHapticFeedback('double');
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#C9A84C] hover:bg-white text-black font-mono font-black text-xs uppercase tracking-wider rounded transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>GENERATE &amp; EXPORT DVIR BUNDLE</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DIGITAL DOCUMENT VAULT & AUTHORITY PACKETS (PRESERVED) */}
      {/* ========================================================================= */}
      {activeMainTab === 'DOC_VAULT' && (
        <div className="space-y-6">
          {/* Filter Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-[#222] overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Documents' },
              { id: 'INSURANCE', label: 'Certificates of Insurance (COI)' },
              { id: 'AUTHORITY', label: 'FMCSA & Tax Authority' },
              { id: 'DRIVER_QUAL', label: 'Driver Qualifications (DQF)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedDocCategory(tab.id)}
                className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 shrink-0 ${
                  selectedDocCategory === tab.id
                    ? 'border-[#C9A84C] text-[#C9A84C] bg-[#141414]'
                    : 'border-transparent text-[#777] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-5 bg-[#141414] border border-[#222] hover:border-[#333] transition-all space-y-3 flex flex-col justify-between rounded"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-[#222] pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded bg-[#0A0A0A] border border-[#333] flex items-center justify-center text-[#C9A84C] shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#777] uppercase font-bold tracking-widest block">
                          {doc.category.replace('_', ' ')}
                        </span>
                        <h3 className="font-headline text-base font-bold text-white leading-tight mt-0.5">
                          {doc.title}
                        </h3>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-mono uppercase font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0 rounded">
                      {doc.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 font-mono text-xs text-[#888]">
                    <div className="flex justify-between">
                      <span className="text-[#666]">Issuing Authority:</span>
                      <span className="text-white font-semibold">{doc.issuer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666]">Policy / Reference #:</span>
                      <span className="text-[#C9A84C] font-bold">{doc.policyOrDocNumber}</span>
                    </div>
                    {doc.coverageAmount && (
                      <div className="flex justify-between">
                        <span className="text-[#666]">Coverage Amount:</span>
                        <span className="text-white font-bold">{doc.coverageAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[#666]">Valid Period:</span>
                      <span className="text-[#AAA]">{doc.effectiveDate} → {doc.expirationDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1C1C1C] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Highway Verified &amp; Signed
                  </span>
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="px-3 py-1.5 bg-[#1C1C1C] hover:bg-[#252525] border border-[#333] text-white text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 rounded"
                  >
                    <FileText className="w-3 h-3 text-[#C9A84C]" />
                    <span>INSPECT DOCUMENT</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Inspector Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#141414] border border-[#333] p-6 space-y-4 shadow-2xl rounded-lg">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#C9A84C] uppercase font-bold tracking-widest block">
                  DIGITAL DOCUMENT VAULT
                </span>
                <h3 className="font-headline text-xl uppercase font-black text-white mt-0.5">
                  {previewDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-[#666] hover:text-white font-mono text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-[#0A0A0A] border border-[#222] space-y-3 font-mono text-xs rounded">
              <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-[#222] pb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>CRYPTOGRAPHICALLY SEALED WITH HIGHWAY 2.0 PKI</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-[#666] block">ISSUING ENTITY</span>
                  <span className="text-white font-bold">{previewDoc.issuer}</span>
                </div>
                <div>
                  <span className="text-[#666] block">DOCUMENT ID</span>
                  <span className="text-[#C9A84C] font-bold">{previewDoc.policyOrDocNumber}</span>
                </div>
                <div>
                  <span className="text-[#666] block">EFFECTIVE DATE</span>
                  <span className="text-white font-bold">{previewDoc.effectiveDate}</span>
                </div>
                <div>
                  <span className="text-[#666] block">EXPIRATION</span>
                  <span className="text-white font-bold">{previewDoc.expirationDate}</span>
                </div>
              </div>
              {previewDoc.coverageAmount && (
                <div className="pt-2 border-t border-[#1C1C1C]">
                  <span className="text-[#666] block">LIABILITY / COVERAGE LIMIT</span>
                  <span className="text-base text-white font-black">{previewDoc.coverageAmount}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-[#1C1C1C] text-[#AAA] hover:text-white uppercase font-bold text-xs rounded"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Certified copy of ${previewDoc.policyOrDocNumber} downloaded.`);
                  setPreviewDoc(null);
                }}
                className="px-5 py-2 bg-[#C9A84C] text-black font-black uppercase text-xs hover:bg-white transition-colors flex items-center gap-1.5 rounded"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD CERTIFIED PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory DVIR Roadside & DOT Export Modal */}
      <MandatoryDvirExportModal
        isOpen={isDvirExportModalOpen}
        onClose={() => setIsDvirExportModalOpen(false)}
        initialUnit={dvirExportUnit}
      />
    </div>
  );
};
