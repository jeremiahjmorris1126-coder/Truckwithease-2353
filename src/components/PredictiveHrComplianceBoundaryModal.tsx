// ============================================================================
// PREDICTIVE HR COMPLIANCE BOUNDARY MODAL
// Cross-references driver safety meetings, FMCSA incident logs, and upcoming
// certification expirations to identify regulatory gaps before an FMCSA breach occurs.
// Enables automated proactive mitigation workflows for fleet managers.
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  Send,
  Zap,
  RefreshCw,
  Search,
  Filter,
  FileText,
  UserCheck,
  Truck,
  HeartPulse,
  Activity,
  Award,
  ChevronRight,
  ExternalLink,
  Layers,
  X,
  Sparkles,
  AlertOctagon,
  ArrowRight,
  Shield,
  FileCheck,
  Play,
  Users,
} from 'lucide-react';
import {
  PredictiveComplianceGap,
  DriverPredictiveBoundaryProfile,
  INITIAL_PREDICTIVE_PROFILES,
  getFleetPredictiveBoundaryProfiles,
  getDriverPredictiveProfile,
  executeProactiveWorkflowAction,
  simulateNewPredictiveGap,
} from '../services/predictiveComplianceBoundaryService';
import { triggerHapticFeedback } from '../services/haptics';

interface PredictiveHrComplianceBoundaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDriverName?: string;
  onOpenDossier?: (driverName: string) => void;
  onOpenTraxesAdvocate?: (driverName: string) => void;
}

export const PredictiveHrComplianceBoundaryModal: React.FC<PredictiveHrComplianceBoundaryModalProps> = ({
  isOpen,
  onClose,
  initialDriverName,
  onOpenDossier,
  onOpenTraxesAdvocate,
}) => {
  const [profiles, setProfiles] = useState<DriverPredictiveBoundaryProfile[]>(INITIAL_PREDICTIVE_PROFILES);
  const [selectedDriverName, setSelectedDriverName] = useState<string>(
    initialDriverName || 'Vance Reynolds'
  );
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'ELEVATED' | 'COMPLIANT'>('ALL');
  const [isExecutingWorkflow, setIsExecutingWorkflow] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [notification, setNotification] = useState<{ message: string; sub?: string; type: 'success' | 'alert' } | null>(null);

  // Sync initialDriverName if changed
  useEffect(() => {
    if (initialDriverName) {
      setSelectedDriverName(initialDriverName);
    }
  }, [initialDriverName]);

  // Load from backend or fallback
  const fetchBoundaryData = async () => {
    try {
      const res = await fetch('/api/compliance/predictive-boundary');
      if (res.ok) {
        const data = await res.json();
        if (data.driverProfiles && data.driverProfiles.length > 0) {
          // Merge with detailed initial profiles
          const merged = INITIAL_PREDICTIVE_PROFILES.map((p) => {
            const serverP = data.driverProfiles.find((sp: any) => sp.driverName === p.driverName);
            if (serverP) {
              return {
                ...p,
                riskIndex: serverP.riskIndex,
                riskLevel: serverP.riskLevel,
                daysUntilPredictedBreach: serverP.daysUntilPredictedBreach,
                gaps: serverP.gaps || p.gaps,
              };
            }
            return p;
          });
          setProfiles(merged);
          return;
        }
      }
    } catch {
      // Local fallback
    }
    setProfiles(getFleetPredictiveBoundaryProfiles());
  };

  useEffect(() => {
    if (isOpen) {
      fetchBoundaryData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentProfile =
    profiles.find((p) => p.driverName.toLowerCase() === selectedDriverName.toLowerCase()) ||
    profiles[0];

  const totalGapsCount = profiles.reduce(
    (sum, p) => sum + p.gaps.filter((g) => !g.isMitigated).length,
    0
  );
  const criticalDriversCount = profiles.filter(
    (p) => p.riskLevel === 'CRITICAL_INTERVENTION_REQUIRED'
  ).length;
  const earliestBreachDays = Math.min(
    ...profiles.map((p) => p.daysUntilPredictedBreach)
  );

  const filteredProfiles = profiles.filter((p) => {
    if (activeFilter === 'CRITICAL') return p.riskLevel === 'CRITICAL_INTERVENTION_REQUIRED';
    if (activeFilter === 'ELEVATED') return p.riskLevel === 'ELEVATED_RISK_WARNING';
    if (activeFilter === 'COMPLIANT') return p.riskLevel === 'COMPLIANT_SECURE';
    return true;
  });

  // Execute Proactive Mitigation Workflow
  const handleExecuteWorkflow = async (gap: PredictiveComplianceGap) => {
    setIsExecutingWorkflow(gap.id);
    triggerHapticFeedback('success');
    try {
      const res = await fetch('/api/compliance/predictive-boundary/execute-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gapId: gap.id,
          actionType: gap.actionType,
          managerNotes: 'Proactive mitigation via Predictive HR Boundary Console',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state
        setProfiles((prev) =>
          prev.map((p) => {
            if (p.driverId === gap.driverId) {
              const updatedGaps = p.gaps.map((g) =>
                g.id === gap.id ? { ...g, isMitigated: true, mitigatedAt: new Date().toISOString() } : g
              );
              const unmitigated = updatedGaps.filter((g) => !g.isMitigated);
              const newRisk = Math.max(5, unmitigated.reduce((s, g) => s + g.riskContributionPercent, 0));
              let newLevel = p.riskLevel;
              if (newRisk < 25) newLevel = 'COMPLIANT_SECURE';
              else if (newRisk < 50) newLevel = 'MODERATE_ADVISORY';
              else if (newRisk < 80) newLevel = 'ELEVATED_RISK_WARNING';
              return {
                ...p,
                riskIndex: newRisk,
                riskLevel: newLevel,
                gaps: updatedGaps,
              };
            }
            return p;
          })
        );

        setNotification({
          type: 'success',
          message: data.message,
          sub: `Audit proof sealed with SHA-256. Risk reduced before FMCSA breach horizon.`,
        });
      } else {
        throw new Error('Local fallback');
      }
    } catch {
      const result = executeProactiveWorkflowAction(gap.id, 'Fleet Manager One-Click Intervention');
      if (result.success && result.profile) {
        setProfiles((prev) =>
          prev.map((p) => (p.driverId === result.profile!.driverId ? result.profile! : p))
        );
        setNotification({
          type: 'success',
          message: result.message,
          sub: 'Regulatory breach prevented through proactive intervention.',
        });
      }
    } finally {
      setIsExecutingWorkflow(null);
      setTimeout(() => setNotification(null), 7000);
    }
  };

  // Simulate an impending regulatory gap for demonstration
  const handleSimulateGap = async () => {
    setIsSimulating(true);
    triggerHapticFeedback('alert');
    try {
      const res = await fetch('/api/compliance/predictive-boundary/simulate-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverName: currentProfile.driverName }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfiles((prev) =>
          prev.map((p) => {
            if (p.driverName === currentProfile.driverName) {
              return {
                ...p,
                riskIndex: Math.min(100, p.riskIndex + 25),
                riskLevel: 'CRITICAL_INTERVENTION_REQUIRED',
                daysUntilPredictedBreach: 3,
                gaps: [data.newGap, ...p.gaps],
              };
            }
            return p;
          })
        );
        setNotification({
          type: 'alert',
          message: `SIMULATED GAP INJECTED: ${data.newGap.title}`,
          sub: 'Cross-correlated anomaly generated. Review proactive action workflow on the right.',
        });
      } else {
        throw new Error('Fallback local');
      }
    } catch {
      const sim = simulateNewPredictiveGap(currentProfile.driverName);
      setProfiles((prev) =>
        prev.map((p) => (p.driverId === sim.updatedProfile.driverId ? sim.updatedProfile : p))
      );
      setNotification({
        type: 'alert',
        message: `SIMULATED ANOMALY: ${sim.newGap.title}`,
        sub: 'Automated gap detection radar flagged predictive breach.',
      });
    } finally {
      setIsSimulating(false);
      setTimeout(() => setNotification(null), 8000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#0f141c] border border-cyan-800/80 rounded-xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl font-mono text-xs overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0d1622] via-[#101b2a] to-[#0a121d] border-b border-cyan-800/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/90 border border-cyan-500/60 flex items-center justify-center text-cyan-300 shadow-inner">
              <ShieldAlert className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-600/50">
                  TRAXES x HREASE SENTINEL
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  FMCSA PROACTIVE RADAR ACTIVE
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5 flex items-center gap-2">
                Predictive HR Compliance Boundary &amp; Regulatory Gap Sentinel
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateGap}
              disabled={isSimulating}
              className="px-3 py-1.5 bg-[#1b2532] hover:bg-[#253344] text-cyan-300 border border-cyan-700/60 font-bold rounded flex items-center gap-1.5 transition-all text-[11px]"
              title="Inject a simulated cross-correlated anomaly to test proactive workflows"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSimulating ? 'SIMULATING...' : 'SIMULATE GAP (RADAR TEST)'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded bg-[#16202c] hover:bg-[#223144] text-[#AAA] hover:text-white flex items-center justify-center border border-[#304255] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Summary Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:p-4 bg-[#0a0f16] border-b border-[#1b2838] text-[11px]">
          <div className="bg-[#101722] p-2.5 rounded border border-[#203044] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#777] block uppercase">EARLIEST PREDICTED BREACH:</span>
              <span className="text-amber-400 font-bold text-sm flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {earliestBreachDays} Days Out
              </span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              ACTION DUE
            </span>
          </div>

          <div className="bg-[#101722] p-2.5 rounded border border-[#203044] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#777] block uppercase">UNMITIGATED GAPS:</span>
              <span className="text-red-400 font-bold text-sm flex items-center gap-1 mt-0.5">
                <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                {totalGapsCount} Active Regulatory Gaps
              </span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
              {criticalDriversCount} CRITICAL
            </span>
          </div>

          <div className="bg-[#101722] p-2.5 rounded border border-[#203044] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#777] block uppercase">SAFETY MEETING AUDIT:</span>
              <span className="text-cyan-300 font-bold text-sm flex items-center gap-1 mt-0.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                75% Fleet Attendance
              </span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              PART 392
            </span>
          </div>

          <div className="bg-[#101722] p-2.5 rounded border border-[#203044] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#777] block uppercase">15-DAY PART 396.9 NOTICES:</span>
              <span className="text-emerald-400 font-bold text-sm flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                1 Pending / 0 OOS
              </span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              TRACKED
            </span>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div
            className={`p-3 mx-4 mt-3 rounded border flex items-start justify-between ${
              notification.type === 'alert'
                ? 'bg-[#2a1313] border-red-500/70 text-red-200'
                : 'bg-[#102419] border-emerald-500/70 text-emerald-200'
            }`}
          >
            <div className="flex items-start gap-2">
              {notification.type === 'alert' ? (
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              )}
              <div>
                <span className="font-bold">{notification.message}</span>
                {notification.sub && <div className="text-[11px] opacity-80 mt-0.5">{notification.sub}</div>}
              </div>
            </div>
            <button onClick={() => setNotification(null)} className="text-[#888] hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Main Body: 2 Columns */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-[#1f2d3d]">
          {/* Left Column (5 cols): Driver Roster & Risk Rankings */}
          <div className="lg:col-span-5 flex flex-col bg-[#0b1017] p-4 space-y-3 overflow-y-auto max-h-[600px] lg:max-h-full">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 text-[10px]">
              {(['ALL', 'CRITICAL', 'ELEVATED', 'COMPLIANT'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2.5 py-1 rounded font-bold transition-all ${
                    activeFilter === filter
                      ? 'bg-cyan-900/80 text-cyan-200 border border-cyan-600'
                      : 'bg-[#141b25] text-[#777] hover:text-white border border-transparent'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Drivers List */}
            <div className="space-y-2">
              {filteredProfiles.map((profile) => {
                const isSelected = profile.driverName.toLowerCase() === selectedDriverName.toLowerCase();
                const unmitigatedCount = profile.gaps.filter((g) => !g.isMitigated).length;

                return (
                  <div
                    key={profile.driverId}
                    onClick={() => {
                      triggerHapticFeedback('tick');
                      setSelectedDriverName(profile.driverName);
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#152232] border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                        : 'bg-[#101720] border-[#223142] hover:bg-[#131d2a]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            profile.riskLevel === 'CRITICAL_INTERVENTION_REQUIRED'
                              ? 'bg-red-950 text-red-300 border border-red-700'
                              : profile.riskLevel === 'ELEVATED_RISK_WARNING'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          }`}
                        >
                          {profile.driverName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <div className="text-white font-bold text-xs flex items-center gap-1.5">
                            <span>{profile.driverName}</span>
                            <span className="text-[10px] text-[#777] font-normal">
                              ({profile.assignedUnit})
                            </span>
                          </div>
                          <div className="text-[10px] text-[#888]">{profile.cdlNumber}</div>
                        </div>
                      </div>

                      {/* Risk Score Pill */}
                      <div className="text-right">
                        <div
                          className={`text-xs font-bold ${
                            profile.riskLevel === 'CRITICAL_INTERVENTION_REQUIRED'
                              ? 'text-red-400'
                              : profile.riskLevel === 'ELEVATED_RISK_WARNING'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {profile.riskIndex}% RISK
                        </div>
                        <div className="text-[9px] text-[#777]">
                          {profile.daysUntilPredictedBreach}d to breach
                        </div>
                      </div>
                    </div>

                    {/* Gap Count Badge */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1c2838] text-[10px]">
                      <span className="text-[#888]">
                        Meetings: {profile.safetyMeetingsSummary.complianceRatePercent}% • Med Card:{' '}
                        {profile.certificationExpirations.medCardDaysRemaining}d
                      </span>
                      {unmitigatedCount > 0 ? (
                        <span className="px-1.5 py-0.5 bg-red-950/80 text-red-300 border border-red-800 rounded font-bold">
                          {unmitigatedCount} GAPS PENDING
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> SECURE
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (7 cols): Cross-Referencing Deep Dive & Proactive Action Console */}
          <div className="lg:col-span-7 flex flex-col bg-[#0e141d] p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[600px] lg:max-h-full">
            {/* Driver Profile Banner */}
            <div className="bg-[#121b27] border border-cyan-800/60 p-4 rounded-lg flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                  ACTIVE PREDICTIVE PROFILE
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                  {currentProfile.driverName}
                  <span className="text-xs text-[#AAA] font-normal">
                    • Unit {currentProfile.assignedUnit} • {currentProfile.cdlNumber}
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {onOpenDossier && (
                  <button
                    onClick={() => onOpenDossier(currentProfile.driverName)}
                    className="px-2.5 py-1 bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black border border-[#D4AF37]/50 rounded text-[11px] font-bold transition-all flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    <span>DQF DOSSIER</span>
                  </button>
                )}
                {onOpenTraxesAdvocate && (
                  <button
                    onClick={() => onOpenTraxesAdvocate(currentProfile.driverName)}
                    className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 rounded text-[11px] font-bold transition-all flex items-center gap-1"
                  >
                    <Shield className="w-3 h-3" />
                    <span>TRAXES ADVOCATE</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3-Pillar Cross-Reference Audit Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
              {/* Pillar 1: Safety Meetings */}
              <div className="bg-[#111822] p-3 rounded-lg border border-[#202e40] space-y-1.5">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    1. Safety Meetings
                  </span>
                  <span>{currentProfile.safetyMeetingsSummary.complianceRatePercent}%</span>
                </div>
                <div className="text-[#888] text-[10px]">
                  Attended {currentProfile.safetyMeetingsSummary.attendedCount} of{' '}
                  {currentProfile.safetyMeetingsSummary.totalAssigned}
                </div>
                {currentProfile.safetyMeetingsSummary.missedMeetings.length > 0 ? (
                  <div className="text-red-300 text-[10px] bg-red-950/40 p-1.5 rounded border border-red-900/50">
                    <span className="font-bold block">Missed:</span>
                    {currentProfile.safetyMeetingsSummary.missedMeetings[0]}
                  </div>
                ) : (
                  <div className="text-emerald-400 text-[10px]">✓ All mandatory meetings current</div>
                )}
              </div>

              {/* Pillar 2: FMCSA Incident Logs */}
              <div className="bg-[#111822] p-3 rounded-lg border border-[#202e40] space-y-1.5">
                <div className="flex items-center justify-between text-amber-300 font-bold">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    2. Roadside Logs
                  </span>
                  <span>{currentProfile.fmcsaIncidentSummary.csaUnsafePercentile}% CSA</span>
                </div>
                <div className="text-[#888] text-[10px]">
                  {currentProfile.fmcsaIncidentSummary.totalInspectionsPast24Mo} Inspections (
                  {currentProfile.fmcsaIncidentSummary.cleanInspections} Clean)
                </div>
                {currentProfile.fmcsaIncidentSummary.unresolved15DayNotices > 0 ? (
                  <div className="text-amber-300 text-[10px] bg-amber-950/40 p-1.5 rounded border border-amber-900/50">
                    <span className="font-bold block">Part 396.9(d) Notice:</span>
                    {currentProfile.fmcsaIncidentSummary.unresolved15DayNotices} item pending closeout
                  </div>
                ) : (
                  <div className="text-emerald-400 text-[10px]">✓ Zero overdue inspection notices</div>
                )}
              </div>

              {/* Pillar 3: Expiration Radar */}
              <div className="bg-[#111822] p-3 rounded-lg border border-[#202e40] space-y-1.5">
                <div className="flex items-center justify-between text-red-300 font-bold">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-red-400" />
                    3. Expiry Radar
                  </span>
                  <span>
                    {currentProfile.certificationExpirations.medCardDaysRemaining <= 30
                      ? 'EXPIRING'
                      : 'NOMINAL'}
                  </span>
                </div>
                <div className="text-[#888] text-[10px]">
                  Med Card: {currentProfile.certificationExpirations.medCardDaysRemaining} days remaining
                </div>
                <div className="text-[#888] text-[10px]">
                  Clearinghouse: {currentProfile.certificationExpirations.clearinghouseDueDays} days remaining
                </div>
                <div className="text-[#888] text-[10px]">
                  MVR Review: {currentProfile.certificationExpirations.mvrDueDays} days remaining
                </div>
              </div>
            </div>

            {/* Identified Regulatory Gaps & Automated Workflows */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#202e40] pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Identified Regulatory Gaps &amp; Proactive Mitigation Actions
                </span>
                <span className="text-[10px] text-[#888]">
                  Automated Pre-Breach Horizon: 14 Days
                </span>
              </div>

              {currentProfile.gaps.length === 0 ? (
                <div className="p-5 bg-[#0f1722] border border-emerald-800/60 rounded-lg text-center text-emerald-300 space-y-1">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
                  <div className="font-bold text-sm">100% REGULATORY BOUNDARY NOMINAL</div>
                  <p className="text-[#888] text-xs max-w-md mx-auto">
                    No predictive gaps detected for {currentProfile.driverName}. Safety meeting attendance, roadside inspection logs, and DQF certification expirations are in complete alignment.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentProfile.gaps.map((gap) => (
                    <div
                      key={gap.id}
                      className={`p-4 rounded-lg border text-xs space-y-2.5 transition-all ${
                        gap.isMitigated
                          ? 'bg-[#0e1d16] border-emerald-700/60 opacity-80'
                          : gap.severity === 'CRITICAL'
                          ? 'bg-[#201014] border-red-600/70 shadow'
                          : 'bg-[#1a1612] border-amber-600/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                gap.isMitigated
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                  : gap.severity === 'CRITICAL'
                                  ? 'bg-red-950 text-red-300 border border-red-700'
                                  : 'bg-amber-950 text-amber-300 border border-amber-700'
                              }`}
                            >
                              {gap.isMitigated ? 'MITIGATED ✓' : `${gap.severity} RISK GAP`}
                            </span>
                            <span className="text-cyan-300 font-bold">{gap.fmcsaStatute}</span>
                            <span className="text-[#888] text-[10px]">
                              • Est. Breach: {gap.predictedBreachDays} Days
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1">{gap.title}</h4>
                        </div>

                        {/* Action Button */}
                        <div>
                          {gap.isMitigated ? (
                            <span className="px-3 py-1 bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-bold rounded flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              MITIGATED
                            </span>
                          ) : (
                            <button
                              onClick={() => handleExecuteWorkflow(gap)}
                              disabled={isExecutingWorkflow === gap.id}
                              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-black font-bold text-[11px] rounded shadow transition-all flex items-center gap-1.5"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>
                                {isExecutingWorkflow === gap.id
                                  ? 'EXECUTING...'
                                  : 'EXECUTE PROACTIVE WORKFLOW'}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-[#BBB] text-[11px] leading-relaxed">{gap.description}</p>

                      <div className="p-2.5 bg-[#0a0e14] border border-[#202e40] rounded text-[11px] space-y-1">
                        <div className="text-cyan-300 font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>Recommended Proactive Workflow:</span>
                        </div>
                        <div className="text-[#AAA]">{gap.recommendedWorkflow}</div>
                      </div>

                      {gap.isMitigated && gap.mitigationProofHash && (
                        <div className="text-[9px] text-emerald-400/80 break-all font-mono">
                          Mitigated by: {gap.mitigatedBy} • Hash: {gap.mitigationProofHash}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Proactive Action Queue Summary */}
            <div className="bg-[#101722] border border-[#202e40] p-3.5 rounded-lg space-y-2">
              <div className="text-white font-bold text-xs uppercase flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Autonomous Action Dispatch Queue for Fleet Manager</span>
              </div>
              <div className="space-y-1">
                {currentProfile.proactiveActionQueue.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-[#0c1219] border border-[#1a2636] rounded text-[11px] text-[#CCC] flex items-center gap-2"
                  >
                    <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#0a0f16] border-t border-[#1b2838] flex items-center justify-between text-[11px]">
          <span className="text-[#777]">
            FMCSA 49 CFR § 391 &amp; § 396 Autonomous Audit Interlock • Cryptographic SHA-256 Ledger
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1b2532] hover:bg-[#253344] text-white font-bold rounded transition-all"
          >
            CLOSE SENTINEL CONSOLE
          </button>
        </div>
      </div>
    </div>
  );
};
