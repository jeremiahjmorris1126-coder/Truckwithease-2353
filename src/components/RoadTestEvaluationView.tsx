import React, { useState, useEffect } from 'react';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  Truck,
  Clock,
  Printer,
  FileCheck,
  PlusCircle,
  HelpCircle,
  Eye,
  Search,
  Sliders,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Download,
  AlertCircle,
  Compass,
  ArrowRight,
  ShieldAlert,
  Save,
  RotateCcw,
  CheckSquare,
  Square,
  Send,
  X,
} from 'lucide-react';
import {
  RoadTestTemplate,
  RoadTestEvaluationItem,
  RoadTestRecord,
  RoadTestScoredItem,
  RoadTestOverallResult,
  RoadTestItemStatus,
  TabType,
} from '../types';
import {
  FMCSA_STATUTORY_ROAD_TEST_ITEMS,
  PRELOADED_ROAD_TEST_TEMPLATES,
  getStoredRoadTestRecords,
  saveRoadTestRecord,
  generateDqfCryptographicSeal,
} from '../services/roadTestService';
import { FmcsaRoadTestReportModal } from './FmcsaRoadTestReportModal';

interface RoadTestEvaluationViewProps {
  onNavigateToTab?: (tab: TabType) => void;
}

export const RoadTestEvaluationView: React.FC<RoadTestEvaluationViewProps> = ({
  onNavigateToTab,
}) => {
  const [activeTab, setActiveTab] = useState<'NEW_TEST' | 'CHECKLIST_ITEMS' | 'TEMPLATES' | 'PAST_TESTS'>('NEW_TEST');
  const [templates] = useState<RoadTestTemplate[]>(PRELOADED_ROAD_TEST_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-class-a-tractor-trailer');
  const [pastRecords, setPastRecords] = useState<RoadTestRecord[]>([]);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<RoadTestRecord | null>(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Active Test Scoring Form State
  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const [candidateName, setCandidateName] = useState<string>('Marcus Vance');
  const [candidateCdl, setCandidateCdl] = useState<string>('PA-CDLA-9921408');
  const [candidateState, setCandidateState] = useState<string>('PA');
  const [candidatePhone, setCandidatePhone] = useState<string>('(717) 555-0142');
  const [yearsExperience, setYearsExperience] = useState<number>(3);

  // Evaluator Info
  const [evaluatorName, setEvaluatorName] = useState<string>('Marcus Bell');
  const [evaluatorTitle, setEvaluatorTitle] = useState<string>('Senior Certified Driver Trainer & Safety Inspector');
  const [evaluatorCdl, setEvaluatorCdl] = useState<string>('IL-CDLA-49102-IL');
  const [evaluatorCompany, setEvaluatorCompany] = useState<string>('Truckwithease Fleet Logistics Corp');

  // Equipment Info
  const [powerUnit, setPowerUnit] = useState<string>('UNIT #104-E');
  const [powerUnitMake, setPowerUnitMake] = useState<string>('2024 Freightliner Cascadia DD15');
  const [trailerUnit, setTrailerUnit] = useState<string>('TRL-5390');
  const [trailerType, setTrailerType] = useState<string>('53ft Utility 3000R Reefer');
  const [transmissionType, setTransmissionType] = useState<'AUTOMATED_MANUAL' | 'MANUAL_10_SPEED' | 'MANUAL_13_SPEED' | 'MANUAL_18_SPEED' | 'AUTOMATIC'>('AUTOMATED_MANUAL');
  const [routeDescription, setRouteDescription] = useState<string>('Terminal staging -> Interstate 81 corridor -> Highway merge -> Downtown arterial with 4 commercial right turns -> 90° alley dock at terminal dock #4');
  const [weatherCondition, setWeatherCondition] = useState<'CLEAR_DRY' | 'RAIN_WET' | 'SNOW_ICE' | 'NIGHT_DUSK' | 'HIGH_WIND'>('CLEAR_DRY');

  // Itemized Scores State
  const [itemScores, setItemScores] = useState<Record<string, RoadTestScoredItem>>({});

  // Trainer Qualitative Feedback
  const [feedbackSafety, setFeedbackSafety] = useState<string>('Candidate demonstrated excellent situational awareness, maintaining continuous 5-8 second mirror scanning and adequate following distance.');
  const [feedbackControl, setFeedbackControl] = useState<string>('Vehicle control was steady. Progressive service braking was smooth without harsh pedal application or weight shifting.');
  const [feedbackBacking, setFeedbackBacking] = useState<string>('Executed 90-degree alley dock with 1 pull-up. Used G.O.A.L. (Get Out And Look) appropriately before docking.');
  const [feedbackClearance, setFeedbackClearance] = useState<string>('Noted overhead bridge clearances and buttonhooked right turn to avoid curb encroachment.');
  const [feedbackRecommendation, setFeedbackRecommendation] = useState<string>('Recommend for full unqualified commercial interstate driving duties under 49 CFR § 391.31.');

  // Load past records
  useEffect(() => {
    setPastRecords(getStoredRoadTestRecords());
  }, []);

  // Initialize scoring when template changes
  useEffect(() => {
    const initial: Record<string, RoadTestScoredItem> = {};
    activeTemplate.items.forEach((item) => {
      // Default to PASS with full points
      initial[item.id] = {
        itemId: item.id,
        pointsEarned: item.pointsMax,
        status: 'PASS',
        trainerNote: '',
      };
    });
    setItemScores(initial);
  }, [selectedTemplateId]);

  // Handle score change for an item
  const handleScoreChange = (itemId: string, status: RoadTestItemStatus, points?: number, note?: string) => {
    const targetItem = activeTemplate.items.find((i) => i.id === itemId);
    const maxPoints = targetItem ? targetItem.pointsMax : 10;
    let earned = points !== undefined ? points : (status === 'PASS' ? maxPoints : status === 'NEEDS_WORK' ? Math.round(maxPoints * 0.7) : 0);

    setItemScores((prev) => ({
      ...prev,
      [itemId]: {
        itemId,
        pointsEarned: earned,
        status,
        trainerNote: note !== undefined ? note : (prev[itemId]?.trainerNote || ''),
      },
    }));
  };

  // Calculate live totals
  const totalPossiblePoints = activeTemplate.items.reduce((sum, item) => sum + item.pointsMax, 0);
  const scoredItemsList = Object.values(itemScores) as RoadTestScoredItem[];
  const totalEarnedPoints: number = scoredItemsList.reduce((sum: number, s: RoadTestScoredItem) => sum + (s.pointsEarned || 0), 0);
  const scorePercentage = totalPossiblePoints > 0 ? Math.round((totalEarnedPoints / totalPossiblePoints) * 1000) / 10 : 0;

  // Check critical failures
  const criticalFailureItems = activeTemplate.items.filter((item) => {
    const score = itemScores[item.id];
    return item.isCriticalDisqualifier && (score?.status === 'FAIL' || score?.status === 'CRITICAL_DISQUALIFICATION');
  });
  const hasCriticalFailure = criticalFailureItems.length > 0;

  // Determine overall result
  let overallResult: RoadTestOverallResult = 'SATISFACTORY_PASS';
  if (hasCriticalFailure) {
    overallResult = 'DISQUALIFIED_SAFETY_VIOLATION';
  } else if (scorePercentage >= activeTemplate.passingScorePercent) {
    overallResult = 'SATISFACTORY_PASS';
  } else if (scorePercentage >= 70) {
    overallResult = 'CONDITIONAL_RETEST';
  } else {
    overallResult = 'NEEDS_REMEDIAL';
  }

  // Submit & Finalize Road Test Evaluation
  const handleFinalizeRoadTest = () => {
    if (!candidateName.trim() || !candidateCdl.trim()) {
      alert('Please enter candidate driver full name and CDL number.');
      return;
    }

    const testId = `rt-${Date.now().toString(36).toUpperCase()}`;
    const certNumber = `FMCSA-391-31-${candidateState}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const cryptographicSeal = generateDqfCryptographicSeal(certNumber, candidateCdl);

    const newRecord: RoadTestRecord = {
      id: testId,
      testDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      testStartTime: '09:00 EDT',
      testEndTime: '11:15 EDT',
      templateId: activeTemplate.id,
      templateTitle: activeTemplate.title,
      driverCandidateName: candidateName,
      driverCandidateCdl: candidateCdl,
      driverCandidateState: candidateState,
      driverCandidatePhone: candidatePhone,
      yearsExperience,
      evaluatorTrainerName: evaluatorName,
      evaluatorTrainerTitle: evaluatorTitle,
      evaluatorTrainerCdl: evaluatorCdl,
      evaluatorCompany: evaluatorCompany,
      powerUnitNumber: powerUnit,
      powerUnitMakeModel: powerUnitMake,
      trailerNumber: trailerUnit,
      trailerType,
      transmissionType,
      grossVehicleWeightRating: '80,000 lbs Max Gross',
      routeDescription,
      weatherConditions: weatherCondition,
      mileageCovered: 28.4,
      scores: itemScores,
      totalEarnedPoints,
      totalPossiblePoints,
      scorePercentage,
      hasCriticalFailure,
      criticalFailureReason: hasCriticalFailure ? `Critical safety violation on: ${criticalFailureItems.map((c) => c.name).join(', ')}` : undefined,
      overallResult,
      trainerFeedback: {
        safetyAndAwarenessCritique: feedbackSafety,
        vehicleControlAndShiftingCritique: feedbackControl,
        backingAndManeuveringCritique: feedbackBacking,
        clearanceAndSpatialJudgementCritique: feedbackClearance,
        overallTrainerRecommendation: feedbackRecommendation,
      },
      certificateNumber: certNumber,
      evaluatorSignature: `${evaluatorName} (Digitally Verified Trainer)`,
      evaluatorSignatureDate: new Date().toISOString().split('T')[0],
      driverCandidateSignature: `${candidateName} (Candidate Acknowledged)`,
      driverCandidateSignatureDate: new Date().toISOString().split('T')[0],
      cryptographicSealHash: cryptographicSeal,
      isSavedToDqf: true,
    };

    const updated = saveRoadTestRecord(newRecord);
    setPastRecords(updated);
    setSelectedRecordForDetail(newRecord);
    setIsCertificateModalOpen(true);
    setStatusBanner(`Road Test for ${candidateName} finalized successfully! FMCSA 391.31 Certificate #${certNumber} generated & synced to DQF vault.`);
    setTimeout(() => setStatusBanner(null), 8000);
  };

  // Filtered past records
  const filteredPast = pastRecords.filter((r) =>
    r.driverCandidateName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.driverCandidateCdl.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.certificateNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.evaluatorTrainerName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full pb-20 px-3 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner / Header */}
      <div className="border-b border-[#222] pb-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                FMCSA 49 CFR § 391.31 CERTIFIED
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 uppercase flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-400" />
                DRIVER TRAINER &amp; EVALUATOR SUITE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-sky-400 bg-sky-950/70 border border-sky-800/80 uppercase">
                DQF CRYPTOGRAPHIC SEALING
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <UserCheck className="w-7 h-7 text-[#D4AF37]" />
              Driver Trainer Road Test &amp; Evaluation Suite
            </h1>
            <p className="text-xs sm:text-sm text-[#888] mt-1 max-w-3xl">
              Equip senior driver trainers and fleet safety directors to conduct, score, critique, and certify commercial driver road tests in strict compliance with federal regulation <span className="text-[#D4AF37] font-semibold">49 CFR § 391.31</span>. Includes pre-trip 4-point air brake testing, coupling, off-tracking, backing, and instant statutory DQF certificate generation.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('NEW_TEST')}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1.5 ${
                activeTab === 'NEW_TEST'
                  ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-black'
                  : 'bg-[#181818] text-[#aaa] border border-[#333] hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Live Evaluation
            </button>
            <button
              onClick={() => setActiveTab('CHECKLIST_ITEMS')}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1.5 ${
                activeTab === 'CHECKLIST_ITEMS'
                  ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-black'
                  : 'bg-[#181818] text-[#aaa] border border-[#333] hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Pass Criteria &amp; Items
            </button>
            <button
              onClick={() => setActiveTab('TEMPLATES')}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1.5 ${
                activeTab === 'TEMPLATES'
                  ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-black'
                  : 'bg-[#181818] text-[#aaa] border border-[#333] hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Templates ({templates.length})
            </button>
            <button
              onClick={() => setActiveTab('PAST_TESTS')}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1.5 ${
                activeTab === 'PAST_TESTS'
                  ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-black'
                  : 'bg-[#181818] text-[#aaa] border border-[#333] hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Certificates &amp; DQF ({pastRecords.length})
            </button>
          </div>
        </div>

        {statusBanner && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {statusBanner}
            </span>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              {selectedRecordForDetail && (
                <button
                  type="button"
                  onClick={() => setIsCertificateModalOpen(true)}
                  className="px-3 py-1 rounded-md bg-[#D4AF37] hover:bg-[#c49f27] text-black font-black text-xs uppercase flex items-center gap-1.5 transition shadow"
                  title="Print clean FMCSA road test report to PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print to PDF</span>
                </button>
              )}
              <button onClick={() => setStatusBanner(null)} className="text-emerald-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: LIVE TEST SCORING FORM */}
      {activeTab === 'NEW_TEST' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Candidate & Equipment Setup + Scorecard (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Template Selector Bar */}
            <div className="p-4 rounded-xl bg-[#111] border border-[#262626]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <label className="text-xs font-mono text-[#D4AF37] uppercase font-bold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> Select Evaluation Template
                </label>
                <span className="text-[11px] font-mono text-[#888]">
                  Passing Threshold: <strong className="text-white">{activeTemplate.passingScorePercent}%</strong>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`text-left p-2.5 rounded-lg border text-xs transition ${
                      selectedTemplateId === tpl.id
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white shadow-sm'
                        : 'border-[#262626] bg-[#161616] text-[#888] hover:text-[#ccc] hover:border-[#444]'
                    }`}
                  >
                    <div className="font-bold text-white flex items-center justify-between">
                      <span className="truncate">{tpl.title}</span>
                      {selectedTemplateId === tpl.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 ml-1" />}
                    </div>
                    <div className="text-[10px] text-[#777] mt-0.5 truncate">{tpl.targetVehicleType}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate & Evaluator Details Grid */}
            <div className="p-4 rounded-xl bg-[#111] border border-[#262626] space-y-4">
              <h2 className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 border-b border-[#222] pb-2">
                <UserCheck className="w-4 h-4 text-[#D4AF37]" />
                Driver Candidate &amp; Trainer Evaluator Credentials
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">Candidate Full Name</label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] rounded px-2.5 py-1.5 text-white font-medium focus:border-[#D4AF37] focus:outline-none"
                    placeholder="e.g. Marcus Vance"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">Candidate CDL Number &amp; State</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={candidateCdl}
                      onChange={(e) => setCandidateCdl(e.target.value)}
                      className="w-2/3 bg-[#181818] border border-[#333] rounded px-2.5 py-1.5 text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                      placeholder="PA-CDLA-9921408"
                    />
                    <input
                      type="text"
                      value={candidateState}
                      onChange={(e) => setCandidateState(e.target.value.toUpperCase())}
                      maxLength={2}
                      className="w-1/3 bg-[#181818] border border-[#333] rounded px-2 py-1.5 text-center text-white font-mono uppercase focus:border-[#D4AF37] focus:outline-none"
                      placeholder="PA"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">Years Driving Experience</label>
                  <input
                    type="number"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(Number(e.target.value))}
                    min={0}
                    max={50}
                    className="w-full bg-[#181818] border border-[#333] rounded px-2.5 py-1.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">Trainer / Evaluator Name</label>
                  <input
                    type="text"
                    value={evaluatorName}
                    onChange={(e) => setEvaluatorName(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] rounded px-2.5 py-1.5 text-white font-medium focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">Trainer Title / Credential</label>
                  <input
                    type="text"
                    value={evaluatorTitle}
                    onChange={(e) => setEvaluatorTitle(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] rounded px-2.5 py-1.5 text-white text-[11px] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">Trainer CDL #</label>
                  <input
                    type="text"
                    value={evaluatorCdl}
                    onChange={(e) => setEvaluatorCdl(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] rounded px-2.5 py-1.5 text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Equipment Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2 border-t border-[#222]">
                <div>
                  <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">Tractor Unit #</label>
                  <input
                    type="text"
                    value={powerUnit}
                    onChange={(e) => setPowerUnit(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] rounded px-2.5 py-1.5 text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">Trailer Unit #</label>
                  <input
                    type="text"
                    value={trailerUnit}
                    onChange={(e) => setTrailerUnit(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] rounded px-2.5 py-1.5 text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">Transmission</label>
                  <select
                    value={transmissionType}
                    onChange={(e) => setTransmissionType(e.target.value as any)}
                    className="w-full bg-[#181818] border border-[#333] rounded px-2 py-1.5 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="AUTOMATED_MANUAL">Automated Manual (DT12 / Endurant)</option>
                    <option value="MANUAL_10_SPEED">Manual 10-Speed Eaton</option>
                    <option value="MANUAL_13_SPEED">Manual 13-Speed Eaton</option>
                    <option value="MANUAL_18_SPEED">Manual 18-Speed Heavy Haul</option>
                    <option value="AUTOMATIC">Fully Automatic (Allison)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">Weather Conditions</label>
                  <select
                    value={weatherCondition}
                    onChange={(e) => setWeatherCondition(e.target.value as any)}
                    className="w-full bg-[#181818] border border-[#333] rounded px-2 py-1.5 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="CLEAR_DRY">☀️ Clear &amp; Dry</option>
                    <option value="RAIN_WET">🌧️ Rain / Wet Pavement</option>
                    <option value="SNOW_ICE">❄️ Snow / Ice Caution</option>
                    <option value="NIGHT_DUSK">🌙 Night / Dusk Low-Light</option>
                    <option value="HIGH_WIND">💨 High Crosswinds</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">Test Route / Road Description</label>
                <input
                  type="text"
                  value={routeDescription}
                  onChange={(e) => setRouteDescription(e.target.value)}
                  className="w-full bg-[#181818] border border-[#333] rounded px-2.5 py-1.5 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                  placeholder="Describe highways, arterial streets, turns, backing pad, and railroad crossings traversed"
                />
              </div>
            </div>

            {/* MASTER CHECKLIST SCORING RUBRIC */}
            <div className="p-4 rounded-xl bg-[#111] border border-[#262626] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222] pb-3">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
                    Interactive Evaluation Rubric (49 CFR § 391.31)
                  </h2>
                  <p className="text-[11px] text-[#888] mt-0.5">
                    Click status on each item to rate. Items marked with <span className="text-rose-400 font-bold">SAFETY CRITICAL</span> cause immediate road test disqualification if failed.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-[#777]">Total Items: </span>
                  <span className="text-xs font-mono font-bold text-white">{activeTemplate.items.length}</span>
                </div>
              </div>

              <div className="space-y-4">
                {activeTemplate.items.map((item, index) => {
                  const score = itemScores[item.id] || {
                    itemId: item.id,
                    pointsEarned: item.pointsMax,
                    status: 'PASS',
                    trainerNote: '',
                  };

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-lg border transition ${
                        score.status === 'CRITICAL_DISQUALIFICATION' || score.status === 'FAIL'
                          ? 'bg-rose-950/20 border-rose-800/80'
                          : score.status === 'NEEDS_WORK'
                          ? 'bg-amber-950/20 border-amber-800/60'
                          : 'bg-[#151515] border-[#222]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1 max-w-xl">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#262626] text-[#bbb]">
                              #{index + 1}
                            </span>
                            <span className="text-xs font-bold text-white tracking-tight">
                              {item.name}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                              {item.statutoryCfr}
                            </span>
                            {item.isCriticalDisqualifier && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold text-rose-400 bg-rose-950/80 border border-rose-800/80 flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                DISQUALIFIER
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#999] leading-relaxed">
                            {item.description}
                          </p>

                          {/* Suggested criteria tags */}
                          <div className="pt-1 flex flex-wrap gap-1">
                            {item.suggestedCriteria.map((crit, cIdx) => (
                              <span key={cIdx} className="text-[10px] text-[#777] bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#282828]">
                                • {crit}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Rating Buttons */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center gap-1 bg-[#0d0d0d] p-1 rounded-lg border border-[#262626]">
                            <button
                              type="button"
                              onClick={() => handleScoreChange(item.id, 'PASS')}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                                score.status === 'PASS'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'text-[#777] hover:text-emerald-400'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Pass ({item.pointsMax}p)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleScoreChange(item.id, 'NEEDS_WORK')}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                                score.status === 'NEEDS_WORK'
                                  ? 'bg-amber-600 text-white shadow-sm'
                                  : 'text-[#777] hover:text-amber-400'
                              }`}
                            >
                              <AlertCircle className="w-3 h-3" />
                              Needs Work ({Math.round(item.pointsMax * 0.7)}p)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleScoreChange(item.id, item.isCriticalDisqualifier ? 'CRITICAL_DISQUALIFICATION' : 'FAIL')}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                                score.status === 'FAIL' || score.status === 'CRITICAL_DISQUALIFICATION'
                                  ? 'bg-rose-600 text-white shadow-sm'
                                  : 'text-[#777] hover:text-rose-400'
                              }`}
                            >
                              <AlertTriangle className="w-3 h-3" />
                              {item.isCriticalDisqualifier ? 'DQ (0p)' : 'Fail (0p)'}
                            </button>
                          </div>

                          {/* Trainer note input */}
                          <input
                            type="text"
                            value={score.trainerNote || ''}
                            onChange={(e) => handleScoreChange(item.id, score.status, score.pointsEarned, e.target.value)}
                            placeholder="Trainer critique / specific observation..."
                            className="w-full sm:w-64 bg-[#181818] border border-[#2b2b2b] rounded px-2 py-1 text-[11px] text-[#ccc] focus:border-[#D4AF37] focus:outline-none placeholder:text-[#555]"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Qualitative Feedback Sections */}
            <div className="p-4 rounded-xl bg-[#111] border border-[#262626] space-y-4">
              <h2 className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 border-b border-[#222] pb-2">
                <FileCheck className="w-4 h-4 text-[#D4AF37]" />
                Trainer Qualitative Feedback &amp; Performance Critique
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-mono text-[#888] uppercase mb-1 font-bold">
                    1. Defensive Driving &amp; Mirror Scanning Feedback
                  </label>
                  <textarea
                    rows={2}
                    value={feedbackSafety}
                    onChange={(e) => setFeedbackSafety(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] rounded p-2 text-white text-xs focus:border-[#D4AF37] focus:outline-none leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#888] uppercase mb-1 font-bold">
                    2. Shifting, Acceleration &amp; Speed Management
                  </label>
                  <textarea
                    rows={2}
                    value={feedbackControl}
                    onChange={(e) => setFeedbackControl(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] rounded p-2 text-white text-xs focus:border-[#D4AF37] focus:outline-none leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#888] uppercase mb-1 font-bold">
                    3. Backing Maneuvers &amp; G.O.A.L. Execution
                  </label>
                  <textarea
                    rows={2}
                    value={feedbackBacking}
                    onChange={(e) => setFeedbackBacking(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] rounded p-2 text-white text-xs focus:border-[#D4AF37] focus:outline-none leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#888] uppercase mb-1 font-bold">
                    4. Overhead Clearance &amp; Turning Off-Tracking
                  </label>
                  <textarea
                    rows={2}
                    value={feedbackClearance}
                    onChange={(e) => setFeedbackClearance(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] rounded p-2 text-white text-xs focus:border-[#D4AF37] focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#D4AF37] uppercase mb-1 font-bold">
                  5. Overall Trainer Recommendation &amp; Dispatch Clearance
                </label>
                <textarea
                  rows={2}
                  value={feedbackRecommendation}
                  onChange={(e) => setFeedbackRecommendation(e.target.value)}
                  className="w-full bg-[#181818] border border-[#D4AF37]/50 rounded p-2 text-white text-xs focus:border-[#D4AF37] focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Live Scoring Hub & DQF Finalizer (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Scorecard Card */}
            <div className="p-5 rounded-xl bg-[#111] border border-[#262626] sticky top-4 space-y-5">
              <div className="flex items-center justify-between border-b border-[#222] pb-3">
                <span className="text-xs font-mono uppercase text-[#888] font-bold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Live Scorecard
                </span>
                <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
                  49 CFR § 391.31
                </span>
              </div>

              {/* Huge Percentage Gauge */}
              <div className="text-center py-2">
                <div className={`text-5xl font-black font-mono tracking-tight ${
                  hasCriticalFailure
                    ? 'text-rose-500'
                    : scorePercentage >= activeTemplate.passingScorePercent
                    ? 'text-emerald-400'
                    : scorePercentage >= 70
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}>
                  {scorePercentage}%
                </div>
                <div className="text-xs font-mono text-[#777] mt-1">
                  Earned <strong className="text-white">{totalEarnedPoints}</strong> of <strong className="text-white">{totalPossiblePoints}</strong> Points
                </div>

                {/* Status Badge */}
                <div className="mt-3">
                  {hasCriticalFailure ? (
                    <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs font-bold uppercase flex items-center justify-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      CRITICAL SAFETY DISQUALIFICATION
                    </div>
                  ) : scorePercentage >= activeTemplate.passingScorePercent ? (
                    <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 text-xs font-bold uppercase flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      SATISFACTORY PASS ({activeTemplate.passingScorePercent}% REQUIRED)
                    </div>
                  ) : scorePercentage >= 70 ? (
                    <div className="p-2.5 rounded-lg bg-amber-950/80 border border-amber-500/80 text-amber-200 text-xs font-bold uppercase flex items-center justify-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      CONDITIONAL PASS (RE-TEST IN 7 DAYS)
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs font-bold uppercase flex items-center justify-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      UNSATISFACTORY / REMEDIAL REQUIRED
                    </div>
                  )}
                </div>
              </div>

              {/* Critical Disqualifier Warning */}
              {hasCriticalFailure && (
                <div className="p-3 rounded-lg bg-rose-900/30 border border-rose-700/60 text-rose-300 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1 text-rose-400">
                    <ShieldAlert className="w-4 h-4" />
                    Automatic Safety Disqualification Triggered:
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-rose-300 space-y-0.5">
                    {criticalFailureItems.map((cf) => (
                      <li key={cf.id}>{cf.name}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-rose-400/80 pt-1">
                    Under FMCSA statutory regulations, failure of safety-critical maneuvers (such as the 4-point air brake test or red light violation) prohibits driver qualification regardless of overall percentage.
                  </p>
                </div>
              )}

              {/* Category Breakdown Progress */}
              <div className="space-y-2 border-t border-[#222] pt-3 text-xs">
                <span className="text-[11px] font-mono text-[#888] uppercase font-bold block mb-1">
                  Category Mastery Breakdown
                </span>
                {Array.from(new Set(activeTemplate.items.map((i) => i.categoryName))).map((catName) => {
                  const itemsInCat = activeTemplate.items.filter((i) => i.categoryName === catName);
                  const catPossible = itemsInCat.reduce((sum, item) => sum + item.pointsMax, 0);
                  const catEarned = itemsInCat.reduce((sum, item) => sum + (itemScores[item.id]?.pointsEarned || 0), 0);
                  const catPct = catPossible > 0 ? Math.round((catEarned / catPossible) * 100) : 0;

                  return (
                    <div key={catName} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-[#aaa] truncate max-w-[190px]">{catName}</span>
                        <span className={catPct >= 80 ? 'text-emerald-400' : 'text-amber-400'}>
                          {catEarned}/{catPossible}p ({catPct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            catPct >= 80 ? 'bg-emerald-500' : catPct >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, catPct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Digital Signature & Certification Box */}
              <div className="p-3 rounded-lg bg-[#181818] border border-[#2b2b2b] space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Statutory Certification Check</span>
                </div>
                <p className="text-[10px] text-[#888] leading-relaxed">
                  By clicking Finalize, the evaluator certifies under penalty of 49 CFR § 390.35 that the candidate completed all evaluated maneuvers in accordance with FMCSA 49 CFR § 391.31.
                </p>
                <div className="text-[10px] font-mono text-[#666] pt-1">
                  Evaluator: <span className="text-[#ccc]">{evaluatorName}</span> ({evaluatorCdl})
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleFinalizeRoadTest}
                  className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c49f27] text-black font-black uppercase text-xs tracking-wider transition shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  Finalize &amp; Issue FMCSA Certificate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const testId = `rt-preview-${Date.now().toString(36).toUpperCase()}`;
                    const certNumber = `FMCSA-391-31-${candidateState}-${new Date().getFullYear()}-PREVIEW`;
                    const cryptographicSeal = generateDqfCryptographicSeal(certNumber, candidateCdl);
                    const previewRecord: RoadTestRecord = {
                      id: testId,
                      testDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                      testStartTime: '09:00 EDT',
                      testEndTime: '11:15 EDT',
                      templateId: activeTemplate.id,
                      templateTitle: activeTemplate.title,
                      driverCandidateName: candidateName || 'Marcus Vance',
                      driverCandidateCdl: candidateCdl || 'PA-CDLA-9921408',
                      driverCandidateState: candidateState || 'PA',
                      driverCandidatePhone: candidatePhone || '(717) 555-0142',
                      yearsExperience,
                      evaluatorTrainerName: evaluatorName,
                      evaluatorTrainerTitle: evaluatorTitle,
                      evaluatorTrainerCdl: evaluatorCdl,
                      evaluatorCompany: evaluatorCompany,
                      powerUnitNumber: powerUnit,
                      powerUnitMakeModel: powerUnitMake,
                      trailerNumber: trailerUnit,
                      trailerType,
                      transmissionType,
                      grossVehicleWeightRating: '80,000 lbs Max Gross',
                      routeDescription,
                      weatherConditions: weatherCondition,
                      mileageCovered: 28.4,
                      scores: itemScores,
                      totalEarnedPoints,
                      totalPossiblePoints,
                      scorePercentage,
                      hasCriticalFailure,
                      criticalFailureReason: hasCriticalFailure ? `Critical safety violation on: ${criticalFailureItems.map((c) => c.name).join(', ')}` : undefined,
                      overallResult,
                      trainerFeedback: {
                        safetyAndAwarenessCritique: feedbackSafety,
                        vehicleControlAndShiftingCritique: feedbackControl,
                        backingAndManeuveringCritique: feedbackBacking,
                        clearanceAndSpatialJudgementCritique: feedbackClearance,
                        overallTrainerRecommendation: feedbackRecommendation,
                      },
                      certificateNumber: certNumber,
                      evaluatorSignature: `${evaluatorName} (Digitally Verified Trainer)`,
                      evaluatorSignatureDate: new Date().toISOString().split('T')[0],
                      driverCandidateSignature: `${candidateName} (Candidate Acknowledged)`,
                      driverCandidateSignatureDate: new Date().toISOString().split('T')[0],
                      cryptographicSealHash: cryptographicSeal,
                      isSavedToDqf: false,
                    };
                    setSelectedRecordForDetail(previewRecord);
                    setIsCertificateModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#1d1d22] hover:bg-[#282830] text-[#D4AF37] hover:text-white font-bold text-xs uppercase transition border border-[#D4AF37]/30 flex items-center justify-center gap-2"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Preview Report &amp; Print to PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const reset: Record<string, RoadTestScoredItem> = {};
                    activeTemplate.items.forEach((item) => {
                      reset[item.id] = { itemId: item.id, pointsEarned: item.pointsMax, status: 'PASS', trainerNote: '' };
                    });
                    setItemScores(reset);
                  }}
                  className="w-full py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#222] text-[#888] hover:text-[#ccc] font-mono text-[11px] uppercase transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Scorecard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ALL ITEMS NEEDED TO PERFORM AND PASS ROAD TESTS */}
      {activeTab === 'CHECKLIST_ITEMS' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-[#111] border border-[#262626]">
            <div className="max-w-3xl space-y-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase">
                FMCSA 49 CFR § 391.31 MASTER CURRICULUM
              </span>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                Mandatory Items Needed to Perform &amp; Pass Commercial Road Tests
              </h2>
              <p className="text-xs text-[#888] leading-relaxed">
                Under federal law 49 CFR § 391.31(c), a person who drives a commercial motor vehicle must be given a road test by the motor carrier or designated trainer that is of sufficient duration to enable the person giving it to evaluate whether the person who is tested has demonstrated competence in operating the motor vehicle. Below is the comprehensive master checklist of all statutory competencies.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FMCSA_STATUTORY_ROAD_TEST_ITEMS.map((item, idx) => (
              <div key={item.id} className="p-4 rounded-xl bg-[#121212] border border-[#262626] space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-[#222] pb-2">
                  <div>
                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold block">
                      {item.categoryName}
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-tight mt-0.5">
                      {idx + 1}. {item.name}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1f1f1f] text-[#aaa] border border-[#333] shrink-0">
                    {item.pointsMax} Pts
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                    {item.statutoryCfr}
                  </span>
                  {item.isCriticalDisqualifier && (
                    <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/80 flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      CRITICAL DISQUALIFIER
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#999] leading-relaxed">
                  {item.description}
                </p>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-mono text-[#777] uppercase font-bold block">
                    Trainer Pass Criteria / Demonstrations Required:
                  </span>
                  <ul className="space-y-1">
                    {item.suggestedCriteria.map((c, i) => (
                      <li key={i} className="text-xs text-[#ccc] flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: TEMPLATES OVERVIEW */}
      {activeTab === 'TEMPLATES' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-[#111] border border-[#262626]">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#D4AF37]" />
              Standardized Road Test Evaluation Templates
            </h2>
            <p className="text-xs text-[#888] mt-1">
              Select or apply any of the 5 pre-configured road test templates customized for fleet equipment classes and operational risk profiles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <div key={tpl.id} className="p-5 rounded-xl bg-[#121212] border border-[#262626] flex flex-col justify-between space-y-4 hover:border-[#D4AF37]/50 transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase">
                      {tpl.passingScorePercent}% Passing
                    </span>
                    <span className="text-xs font-mono text-[#777]">{tpl.totalItems} Items</span>
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{tpl.title}</h3>
                  <div className="text-[11px] font-mono text-[#aaa]">{tpl.subtitle}</div>
                  <p className="text-xs text-[#777] leading-relaxed pt-1">{tpl.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#222]">
                  <div className="text-[10px] font-mono text-[#888]">
                    Target: <strong className="text-white">{tpl.targetVehicleType}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplateId(tpl.id);
                      setActiveTab('NEW_TEST');
                    }}
                    className="w-full py-2 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black font-bold uppercase text-xs transition border border-[#D4AF37]/40 flex items-center justify-center gap-1.5"
                  >
                    <span>Use Template for Evaluation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: PAST ROAD TESTS & DQF CERTIFICATES LEDGER */}
      {activeTab === 'PAST_TESTS' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-[#111] border border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#D4AF37]" />
                Road Test Evaluation Archive &amp; DQF Certificates
              </h2>
              <p className="text-xs text-[#888] mt-1">
                All completed commercial road tests, digital signatures, scores, and FMCSA § 391.31 certificates stored for the mandatory statutory 3-year DQF retention window.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#666]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search driver, CDL, certificate..."
                className="w-full bg-[#181818] border border-[#333] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#666] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredPast.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#121212] border border-[#222] text-center space-y-2">
                <FileText className="w-8 h-8 text-[#555] mx-auto" />
                <p className="text-xs text-[#888]">No road test evaluations match your search filter.</p>
              </div>
            ) : (
              filteredPast.map((record) => (
                <div
                  key={record.id}
                  className="p-4 rounded-xl bg-[#121212] border border-[#262626] hover:border-[#383838] transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222] pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white tracking-tight">
                          {record.driverCandidateName}
                        </span>
                        <span className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
                          {record.driverCandidateCdl}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          record.overallResult === 'SATISFACTORY_PASS'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {record.overallResult.replace(/_/g, ' ')} ({record.scorePercentage}%)
                        </span>
                      </div>
                      <div className="text-[11px] text-[#777]">
                        Evaluated by <strong className="text-[#ccc]">{record.evaluatorTrainerName}</strong> on {record.testDate} · Unit: {record.powerUnitNumber}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRecordForDetail(record);
                          setIsCertificateModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#c49f27] text-black font-black text-xs uppercase transition shadow flex items-center gap-1.5"
                        title="Print clean FMCSA road test report to PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print to PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRecordForDetail(record);
                          setIsCertificateModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#1a1a1f] hover:bg-[#25252e] text-[#ccc] hover:text-white font-bold text-xs uppercase transition border border-[#333] flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                        View Report
                      </button>
                    </div>
                  </div>

                  {/* Summary Feedback Quote */}
                  <div className="p-3 rounded-lg bg-[#181818] border border-[#222] text-xs text-[#aaa] space-y-1">
                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold block">
                      Trainer Recommendation &amp; Performance Summary:
                    </span>
                    <p className="italic">"{record.trainerFeedback.overallTrainerRecommendation}"</p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#666] pt-1">
                    <span>Cert #: <strong className="text-[#aaa]">{record.certificateNumber}</strong></span>
                    <span className="truncate max-w-[300px]">DQF Seal: {record.cryptographicSealHash.substring(0, 20)}...</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* OFFICIAL FMCSA 49 CFR § 391.31 ROAD TEST EXAMINATION & CERTIFICATE MODAL */}
      <FmcsaRoadTestReportModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        record={selectedRecordForDetail}
      />
    </div>
  );
};
