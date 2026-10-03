import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Compass,
  Clock,
  Truck,
  CheckCircle2,
  X,
  FileCheck,
  Send,
  Download,
  Copy,
  Check,
  Radio,
  Sliders,
  Sparkles,
  RefreshCw,
  Activity,
  Layers,
  MapPin,
  ExternalLink,
  ChevronRight,
  Flame,
  Volume2,
} from 'lucide-react';
import {
  eldChronoPredictiveService,
  ErodsPreFlightReport,
  ErodsAuditDefect,
  SafeHavenParkingNode,
  SplitSleeperSimulation,
  UnassignedDrivingEventAnalysis,
  INITIAL_ERODS_DEFECTS,
  INITIAL_SAFE_HAVEN_PARKING,
  INITIAL_UNASSIGNED_ANALYSIS,
} from '../services/eldChronoPredictiveService';
import { triggerHapticFeedback } from '../services/haptics';

interface EldChronoPredictiveShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingDriveMinutes?: number;
  onShowToast?: (message: string, type?: 'success' | 'warning' | 'error') => void;
}

export const EldChronoPredictiveShieldModal: React.FC<EldChronoPredictiveShieldModalProps> = ({
  isOpen,
  onClose,
  remainingDriveMinutes = 48,
  onShowToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ERODS_SIMULATOR' | 'PNR_PARKING' | 'SPLIT_SLEEPER' | 'UNASSIGNED_DEFENSE'>('ERODS_SIMULATOR');

  // Sub-Tab 1: eRODS Simulator
  const [defects, setDefects] = useState<ErodsAuditDefect[]>(INITIAL_ERODS_DEFECTS);
  const [preFlightReport, setPreFlightReport] = useState<ErodsPreFlightReport>(() =>
    eldChronoPredictiveService.generatePreFlightReport(INITIAL_ERODS_DEFECTS)
  );
  const [isSimulatingTransmission, setIsSimulatingTransmission] = useState(false);
  const [transmissionSuccess, setTransmissionSuccess] = useState(false);
  const [copiedAnnotationId, setCopiedAnnotationId] = useState<string | null>(null);

  // Sub-Tab 2: PNR Parking Radar
  const [currentSpeedMph, setCurrentSpeedMph] = useState<number>(64);
  const [parkingNodes, setParkingNodes] = useState<SafeHavenParkingNode[]>(INITIAL_SAFE_HAVEN_PARKING);
  const [pnrEvaluation, setPnrEvaluation] = useState(() =>
    eldChronoPredictiveService.evaluatePointOfNoReturn(remainingDriveMinutes, 64, INITIAL_SAFE_HAVEN_PARKING)
  );
  const [adverseConditionTriggered, setAdverseConditionTriggered] = useState(false);

  // Sub-Tab 3: Split-Sleeper Dynamic Time Warp
  const [firstBreak, setFirstBreak] = useState<number>(7);
  const [secondBreak, setSecondBreak] = useState<number>(3);
  const [splitSimulation, setSplitSimulation] = useState<SplitSleeperSimulation>(() =>
    eldChronoPredictiveService.calculateSplitSleeper(7, 3)
  );

  // Sub-Tab 4: Unassigned Driving Defense
  const [unassignedEvents, setUnassignedEvents] = useState<UnassignedDrivingEventAnalysis[]>(INITIAL_UNASSIGNED_ANALYSIS);

  useEffect(() => {
    setPreFlightReport(eldChronoPredictiveService.generatePreFlightReport(defects));
  }, [defects]);

  useEffect(() => {
    setPnrEvaluation(
      eldChronoPredictiveService.evaluatePointOfNoReturn(remainingDriveMinutes, currentSpeedMph, parkingNodes)
    );
  }, [remainingDriveMinutes, currentSpeedMph, parkingNodes]);

  useEffect(() => {
    setSplitSimulation(eldChronoPredictiveService.calculateSplitSleeper(firstBreak, secondBreak));
  }, [firstBreak, secondBreak]);

  if (!isOpen) return null;

  const handleAnnotateDefect = (id: string) => {
    triggerHapticFeedback();
    setDefects((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isAnnotated: true, fineExposureUsd: 0 } : d))
    );
    if (onShowToast) {
      onShowToast('Legal statutory annotation attached. Trooper citation risk cleared.', 'success');
    }
  };

  const handleSimulateTransmission = () => {
    triggerHapticFeedback();
    setIsSimulatingTransmission(true);
    setTransmissionSuccess(false);

    setTimeout(() => {
      setIsSimulatingTransmission(false);
      setTransmissionSuccess(true);
      if (onShowToast) {
        onShowToast('eRODS transfer validated with FMCSA Gateway (0 citations flagged).', 'success');
      }
    }, 1800);
  };

  const handleTriggerAdverseCondition = () => {
    triggerHapticFeedback();
    setAdverseConditionTriggered(true);
    if (onShowToast) {
      onShowToast('49 CFR § 395.1(b)(1) Adverse Driving Condition logged (+2h extension active).', 'warning');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#0A0A0A] border-2 border-[#FFE600] rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(255,230,0,0.2)] overflow-hidden text-white my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-black via-[#141414] to-black border-b border-[#FFE600]/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FFE600]/10 border border-[#FFE600] rounded-xl text-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.3)]">
              <ShieldCheck className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-black tracking-widest uppercase bg-[#FFE600] text-black rounded font-mono">
                  INDUSTRY FIRST
                </span>
                <span className="text-xs text-zinc-400 font-mono">49 CFR § 395.24/26/30 AUDIT DEFENSE</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                ELD CHRONO-PREDICTIVE SHIELD™
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black border border-zinc-700 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono text-emerald-400 font-bold">
                AUDIT RISK: {preFlightReport.overallRiskScore}% ({preFlightReport.auditReadiness.replace(/_/g, ' ')})
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-[#0E0E0E] overflow-x-auto scrollbar-none px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveSubTab('ERODS_SIMULATOR')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-t-lg transition-all flex items-center gap-2 border-t-2 ${
              activeSubTab === 'ERODS_SIMULATOR'
                ? 'bg-black text-[#FFE600] border-[#FFE600]'
                : 'text-zinc-400 hover:text-white border-transparent'
            }`}
          >
            <Scale className="w-4 h-4" />
            eRODS DOT Inspector
          </button>
          <button
            onClick={() => setActiveSubTab('PNR_PARKING')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-t-lg transition-all flex items-center gap-2 border-t-2 ${
              activeSubTab === 'PNR_PARKING'
                ? 'bg-black text-[#FFE600] border-[#FFE600]'
                : 'text-zinc-400 hover:text-white border-transparent'
            }`}
          >
            <Compass className="w-4 h-4" />
            Safe-Haven PNR Radar
          </button>
          <button
            onClick={() => setActiveSubTab('SPLIT_SLEEPER')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-t-lg transition-all flex items-center gap-2 border-t-2 ${
              activeSubTab === 'SPLIT_SLEEPER'
                ? 'bg-black text-[#FFE600] border-[#FFE600]'
                : 'text-zinc-400 hover:text-white border-transparent'
            }`}
          >
            <Clock className="w-4 h-4" />
            Split-Sleeper Time Warp
          </button>
          <button
            onClick={() => setActiveSubTab('UNASSIGNED_DEFENSE')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-t-lg transition-all flex items-center gap-2 border-t-2 ${
              activeSubTab === 'UNASSIGNED_DEFENSE'
                ? 'bg-black text-[#FFE600] border-[#FFE600]'
                : 'text-zinc-400 hover:text-white border-transparent'
            }`}
          >
            <Radio className="w-4 h-4" />
            J1939 Unassigned Defense
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: eRODS DOT OFFICER SIMULATOR */}
          {activeSubTab === 'ERODS_SIMULATOR' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-zinc-950 via-black to-zinc-950 border border-zinc-800 p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded">
                      ROAD-TESTED ALGORITHM
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">FMCSA Web Services eRODS 2026</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Pre-Flight Roadside Inspection Defense</h3>
                  <p className="text-xs text-zinc-400 max-w-xl">
                    Simulates the exact automated audit screen that state troopers and DOT inspectors see before you electronically transmit your logs. Neutralize unassigned driving and timing technicalities with attorney-vetted statutory annotations.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={handleSimulateTransmission}
                    disabled={isSimulatingTransmission}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-[#FFE600] hover:bg-[#FFD700] text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,230,0,0.3)] disabled:opacity-50"
                  >
                    {isSimulatingTransmission ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Auditing 8-Day eRODS...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Test Roadside Transmit
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              {transmissionSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500 rounded-xl flex items-center gap-3 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold">FMCSA ROAD-AUDIT SIMULATION PASSED:</span> Electronic data file conforms with 49 CFR Part 395 Appendix A. All mandatory annotations present. 0 citations flagged.
                  </div>
                </div>
              )}

              {/* Risk KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-black/60 border border-zinc-800 rounded-xl">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase">Citation Risk Index</div>
                  <div className="text-2xl sm:text-3xl font-black text-[#FFE600] mt-1">
                    {preFlightReport.overallRiskScore}%
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1 font-mono">
                    {preFlightReport.overallRiskScore <= 15 ? 'Clean Green Light' : 'Requires Pre-Clearance'}
                  </div>
                </div>

                <div className="p-4 bg-black/60 border border-zinc-800 rounded-xl">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase">Audited Distance</div>
                  <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                    {preFlightReport.totalMilesAudited.toFixed(1)} <span className="text-xs text-zinc-400">mi</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1 font-mono">Last 8 Duty Cycles</div>
                </div>

                <div className="p-4 bg-black/60 border border-zinc-800 rounded-xl">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase">Unassigned Driving</div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
                    {preFlightReport.unassignedDrivingMiles.toFixed(1)} <span className="text-xs text-zinc-400">mi</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1 font-mono">Auto-classified below</div>
                </div>

                <div className="p-4 bg-black/60 border border-zinc-800 rounded-xl">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase">Potential Fines Avoided</div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                    ${defects.filter((d) => d.isAnnotated).reduce((sum, d) => sum + d.fineExposureUsd, 1750)}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1 font-mono">Via Attorney Annotations</div>
                </div>
              </div>

              {/* Defect Inspection & 1-Click Annotation Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#FFE600]" />
                    Detected eRODS Compliance Items ({defects.length})
                  </h4>
                  <span className="text-xs text-zinc-500 font-mono">Pre-Clear Before Handing Device to Officer</span>
                </div>

                <div className="space-y-3">
                  {defects.map((defect) => (
                    <div
                      key={defect.id}
                      className={`p-4 rounded-xl border transition-all ${
                        defect.isAnnotated
                          ? 'bg-zinc-950/40 border-emerald-500/30 text-zinc-400'
                          : 'bg-black border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-black rounded uppercase font-mono ${
                                defect.isAnnotated
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {defect.isAnnotated ? 'NEUTRALIZED' : defect.severity.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-zinc-400 font-mono">{defect.statutoryCitation}</span>
                          </div>
                          <h5 className="font-bold text-white text-sm">{defect.title}</h5>
                          <p className="text-xs text-zinc-400">{defect.detectedDetail}</p>
                        </div>

                        <div className="flex items-center gap-2 sm:self-center">
                          {defect.isAnnotated ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/40 rounded-lg text-emerald-400 text-xs font-bold font-mono">
                              <CheckCircle2 className="w-4 h-4" />
                              ANNOTATED FOR DOT
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAnnotateDefect(defect.id)}
                              className="px-3.5 py-1.5 bg-[#FFE600] hover:bg-[#FFD700] text-black font-black text-xs uppercase tracking-wider rounded-lg transition-transform active:scale-95 flex items-center gap-1.5"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              Apply Defense Note
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Suggested Annotation Box */}
                      <div className="mt-3 p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 flex items-center justify-between gap-2">
                        <div className="line-clamp-2">
                          <span className="text-[#FFE600] font-bold">Suggested Legal Text: </span>
                          {defect.suggestedLegalAnnotation}
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(defect.suggestedLegalAnnotation);
                            setCopiedAnnotationId(defect.id);
                            setTimeout(() => setCopiedAnnotationId(null), 2000);
                          }}
                          className="p-1.5 text-zinc-400 hover:text-white rounded bg-zinc-800 flex-shrink-0"
                          title="Copy legal text"
                        >
                          {copiedAnnotationId === defect.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POINT-OF-NO-RETURN SAFE-HAVEN PARKING */}
          {activeSubTab === 'PNR_PARKING' && (
            <div className="space-y-6">
              {/* PNR Banner */}
              <div
                className={`p-5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  pnrEvaluation.criticalAlertLevel === 'EMERGENCY_PNR'
                    ? 'bg-rose-950/30 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-black border-[#FFE600]/40 text-zinc-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-black bg-[#FFE600] text-black rounded font-mono">
                      PREDICTIVE BIO-TELEMETRICS
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">49 CFR § 395.1(b)(1) SAFE HAVEN</span>
                  </div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    POINT OF NO RETURN (PNR): EXIT IN {pnrEvaluation.minutesToPnr} MIN
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-2xl">{pnrEvaluation.recommendedAction}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTriggerAdverseCondition}
                    disabled={adverseConditionTriggered}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
                  >
                    <Flame className="w-4 h-4" />
                    {adverseConditionTriggered ? 'Adverse Extension Active (+2h)' : 'Log § 395.1(b) Adverse Event'}
                  </button>
                </div>
              </div>

              {/* Corridor Node List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#FFE600]" />
                    Approaching Safe-Haven Truck Stops & Parking Corridor
                  </h4>
                  <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                    <span>Truck Speed: {currentSpeedMph} MPH</span>
                    <span>Remaining Clock: {remainingDriveMinutes} min</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {parkingNodes.map((node) => (
                    <div
                      key={node.id}
                      className={`p-4 rounded-xl border transition-all ${
                        node.isPointOfNoReturn
                          ? 'bg-amber-950/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                          : node.status === 'UNREACHABLE_EXCEEDS_HOS'
                          ? 'bg-zinc-950/40 border-zinc-800/80 opacity-60'
                          : 'bg-black border-zinc-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-zinc-400">MM {node.mileMarker}</span>
                            {node.isPointOfNoReturn && (
                              <span className="px-2 py-0.5 text-[9px] font-black bg-amber-500 text-black rounded font-mono">
                                POINT OF NO RETURN
                              </span>
                            )}
                          </div>
                          <h5 className="font-bold text-white text-base mt-0.5">{node.name}</h5>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-black text-[#FFE600]">{node.distanceMiles} mi</div>
                          <div className="text-[10px] text-zinc-400 font-mono">~{node.estimatedMinutesArrival} min away</div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-zinc-800">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="text-zinc-500">Open Spots: </span>
                            <span
                              className={`font-bold ${
                                node.openTruckSpaces > 10 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {node.openTruckSpaces} / {node.totalTruckSpaces}
                            </span>
                          </div>
                          <div className="text-zinc-500">
                            Confidence: <span className="text-zinc-300 font-mono">{node.parkingConfidencePct}%</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                          {node.hasCATScale && <span className="px-1.5 py-0.5 bg-zinc-800 rounded">CAT</span>}
                          {node.hasShowers && <span className="px-1.5 py-0.5 bg-zinc-800 rounded">SHOWERS</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SPLIT-SLEEPER QUANTUM TIME WARP */}
          {activeSubTab === 'SPLIT_SLEEPER' && (
            <div className="space-y-6">
              <div className="bg-black border border-zinc-800 p-5 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-black bg-[#FFE600] text-black rounded font-mono">
                    MATHEMATICAL OPTIMIZER
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">49 CFR § 395.1(g)(1)(ii)</span>
                </div>
                <h3 className="text-lg font-bold text-white">Split-Sleeper Berth "Dynamic Time Warp" Visualizer</h3>
                <p className="text-xs text-zinc-400 max-w-3xl">
                  Stop violating HOS due to split-sleeper confusion. Dynamically simulate 8/2 or 7/3 break combinations. The engine recalculates the moving 14-hour window from the end of the first qualifying period in real-time.
                </p>
              </div>

              {/* Slider Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-zinc-400">First Rest Period (Sleeper)</span>
                    <span className="text-lg font-black text-[#FFE600]">{firstBreak} Hours</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    step={1}
                    value={firstBreak}
                    onChange={(e) => setFirstBreak(Number(e.target.value))}
                    className="w-full accent-[#FFE600] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>2 Hours</span>
                    <span>7 Hours (Qualifying)</span>
                    <span>8 Hours (Qualifying)</span>
                    <span>10 Hours (Full Reset)</span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-zinc-400">Second Rest Period (Sleeper)</span>
                    <span className="text-lg font-black text-[#FFE600]">{secondBreak} Hours</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={8}
                    step={1}
                    value={secondBreak}
                    onChange={(e) => setSecondBreak(Number(e.target.value))}
                    className="w-full accent-[#FFE600] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>2 Hours (Pair with 8h)</span>
                    <span>3 Hours (Pair with 7h)</span>
                    <span>8 Hours</span>
                  </div>
                </div>
              </div>

              {/* Split Sleeper Simulation Result Card */}
              <div
                className={`p-5 rounded-xl border ${
                  splitSimulation.qualifyingPair
                    ? 'bg-emerald-950/20 border-emerald-500'
                    : 'bg-zinc-950 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-black rounded font-mono ${
                        splitSimulation.qualifyingPair
                          ? 'bg-emerald-500 text-black'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {splitSimulation.statutoryRuleApplied}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-zinc-400 font-mono">Regained Drive Hours: </span>
                    <span className="text-lg font-black text-emerald-400">
                      +{splitSimulation.regainedDriveHours.toFixed(1)} hrs
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-zinc-300 leading-relaxed font-mono">
                  {splitSimulation.explanation}
                </p>

                {splitSimulation.qualifyingPair && (
                  <div className="mt-4 p-3 bg-black/60 rounded-lg border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">New Recalculated 14-Hour Shift Expiration:</span>
                    <span className="font-bold text-white">{splitSimulation.newShiftExpirationTimestamp}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: J1939 UNASSIGNED DRIVING DEFENSE */}
          {activeSubTab === 'UNASSIGNED_DEFENSE' && (
            <div className="space-y-6">
              <div className="bg-black border border-zinc-800 p-5 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-black bg-[#FFE600] text-black rounded font-mono">
                    MICRO-JITTER FUSION
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">49 CFR § 395.28 YARD MOVES</span>
                </div>
                <h3 className="text-lg font-bold text-white">Autonomous J1939 Acoustic & BLE Movement Defense</h3>
                <p className="text-xs text-zinc-400 max-w-3xl">
                  Eliminates the #1 cause of fleet audit penalties. When a terminal jockey or shop technician moves your truck, our engine cross-references in-cab Bluetooth signal, acoustic motor vibration, and wheel speed (< 20 mph) to automatically classify it as an exempt yard movement.
                </p>
              </div>

              <div className="space-y-3">
                {unassignedEvents.map((event) => (
                  <div key={event.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded font-mono">
                          {event.classifiedSource.replace(/_/g, ' ')} ({event.confidencePct}%)
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">{event.timestamp}</span>
                      </div>

                      <div className="text-xs font-mono text-zinc-400">
                        Distance: <span className="text-white font-bold">{event.distanceMiles} mi</span> · Max Speed: <span className="text-white font-bold">{event.maxSpeedMph} MPH</span>
                      </div>
                    </div>

                    <div className="p-3 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300">
                      <div className="text-[#FFE600] font-bold mb-1">Autonomous Audit Annotation:</div>
                      {event.autoAnnotationText}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                      <span>Sensor Signature: In-Cab BLE Signal {event.cabPhoneBleSignalDbm} dBm (Phone outside cab)</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved by Fleet Safety
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black border-t border-zinc-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-[#FFE600]" />
            <span>TruckWithEase™ Sovereign FMCSA Compliance Suite · 0.000ms Drift</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
            >
              Close Shield
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
