import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Send,
  FileText,
  Printer,
  ChevronRight,
  Sparkles,
  Calendar,
  Clock,
  Truck,
  Award,
  Lock,
  ExternalLink,
  Check,
  Building,
  UserCheck,
  AlertCircle,
  FileCheck,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import {
  RandomInspectionDossierPackage,
  generate1ClickRandomInspectionDossier,
  ViolationRemediationPlan,
  STATE_ENFORCEMENT_DATABASE,
} from '../services/randomInspectionDossierService';
import { triggerHapticFeedback } from '../services/haptics';

interface Prior7DaysInspectionDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName?: string;
  unitNumber?: string;
}

export const Prior7DaysInspectionDossierModal: React.FC<Prior7DaysInspectionDossierModalProps> = ({
  isOpen,
  onClose,
  driverName = 'Marcus Bell',
  unitNumber = 'UNIT #104-E',
}) => {
  const [dossier, setDossier] = useState<RandomInspectionDossierPackage | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedViolation, setSelectedViolation] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'LOGS' | 'DVIRS' | 'CLEAN_PASS' | 'VIOLATIONS_REMEDIATION'>('LOGS');
  const [transferToast, setTransferToast] = useState<string | null>(null);
  const [isCabinLocked, setIsCabinLocked] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const generated = generate1ClickRandomInspectionDossier(driverName, unitNumber);
      setDossier(generated);
      if (generated.notedViolations.length > 0) {
        setSelectedViolation(generated.notedViolations[0]);
      }
    }
  }, [isOpen, driverName, unitNumber]);

  const handleOfficerTransfer = (protocol: 'WEB_SERVICES' | 'BLUETOOTH' | 'PRINT') => {
    triggerHapticFeedback('double');
    setTransferToast(`FMCSA ERDS 8-Day Log Package transmitted via ${protocol}. Officer verification receipt: #ERDS-${Date.now().toString(36).toUpperCase()}`);
    setTimeout(() => setTransferToast(null), 5000);
  };

  const handleToggleCabinLock = () => {
    triggerHapticFeedback('subtle');
    setIsCabinLocked(!isCabinLocked);
  };

  if (!isOpen || !dossier) return null;

  const currentDay = dossier.days[selectedDayIndex] || dossier.days[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0D0E13] border-2 border-emerald-500/40 rounded-2xl max-w-6xl w-full text-[#E3E1E9] shadow-2xl overflow-hidden my-4 animate-fadeIn flex flex-col max-h-[94vh]">
        {/* TOP STATUS BAR: DOT ROADSIDE MODE */}
        <div className="bg-emerald-950/80 px-6 py-4 border-b border-emerald-700/60 flex items-center justify-between flex-wrap gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-300">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  OFFICIAL 1-CLICK 7-DAY FMCSA LOG & INSPECTION DOSSIER
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500 text-black rounded-full">
                  ROADSIDE READY (49 CFR § 395.24)
                </span>
                <span className="px-2 py-0.5 text-xs font-mono bg-black/60 text-emerald-300 border border-emerald-500/30 rounded">
                  8 CONSECUTIVE DAYS
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Driver: <strong className="text-white">{dossier.driverName}</strong> (CDL: {dossier.cdlNumber}) | Carrier: <strong className="text-white">{dossier.carrierName}</strong> ({dossier.usdotNumber}) | Unit: {dossier.tractorUnit}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleToggleCabinLock}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isCabinLocked
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-900/30'
                  : 'bg-[#1E1F25] text-white hover:bg-[#282A33]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              {isCabinLocked ? 'OFFICER PIN LOCKED' : 'OFFICER CABIN LOCK'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#90909A] hover:text-white hover:bg-[#1E1F25] rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST MESSAGE */}
        {transferToast && (
          <div className="bg-emerald-900/90 border-b border-emerald-500/40 px-6 py-2 text-xs text-emerald-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{transferToast}</span>
          </div>
        )}

        {/* 1-CLICK OFFICER TRANSMIT STRIP */}
        <div className="bg-[#14151B] px-6 py-3 border-b border-[#292A2F] flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-[#90909A] uppercase font-mono text-[10px]">7-Day Drive Total:</span>
              <span className="font-bold text-emerald-400 ml-1.5">{dossier.total7DayDrivingHours} hrs</span>
            </div>
            <div>
              <span className="text-[#90909A] uppercase font-mono text-[10px]">7-Day On-Duty Total:</span>
              <span className="font-bold text-blue-400 ml-1.5">{dossier.total7DayOnDutyHours} hrs</span>
            </div>
            <div>
              <span className="text-[#90909A] uppercase font-mono text-[10px]">70-Hour Clock Left:</span>
              <span className="font-bold text-amber-400 ml-1.5">{dossier.cycle70HoursRemaining} hrs</span>
            </div>
            <div>
              <span className="text-[#90909A] uppercase font-mono text-[10px]">ISS Safety Score:</span>
              <span className="font-bold text-emerald-300 ml-1.5">18 (PASS · LOWEST RISK)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOfficerTransfer('WEB_SERVICES')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              WEB SERVICES TRANSFER (ROADSIDE)
            </button>
            <button
              onClick={() => handleOfficerTransfer('BLUETOOTH')}
              className="px-3 py-1.5 bg-[#1E1F25] hover:bg-[#282A33] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              BLUETOOTH ERDS
            </button>
            <button
              onClick={() => handleOfficerTransfer('PRINT')}
              className="px-3 py-1.5 bg-[#1E1F25] hover:bg-[#282A33] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              PRINT 8-DAY PDF
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="bg-[#090A0E] px-6 py-2.5 border-b border-[#292A2F] flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'LOGS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-[#90909A] hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            8 CONSECUTIVE DAYS OF ELD LOGS
          </button>
          <button
            onClick={() => setActiveTab('DVIRS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'DVIRS'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'text-[#90909A] hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            PRIOR 7 DAYS PRE/POST-TRIP DVIRS
          </button>
          <button
            onClick={() => setActiveTab('CLEAN_PASS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'CLEAN_PASS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-[#90909A] hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            CLEAN INSPECTIONS & CVSA DECALS ({dossier.cleanInspectionsSummary.totalCleanPasses})
          </button>
          <button
            onClick={() => setActiveTab('VIOLATIONS_REMEDIATION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'VIOLATIONS_REMEDIATION'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-[#90909A] hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            VIOLATIONS & STATE-SPECIFIC REMEDIATION ({dossier.notedViolations.length})
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: 8-DAY LOGS */}
          {activeTab === 'LOGS' && (
            <div className="space-y-4">
              {/* DAY SELECTOR STRIP */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {dossier.days.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedDayIndex === idx
                        ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md'
                        : 'bg-[#14151B] border-[#292A2F] text-[#90909A] hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-mono font-bold">
                      {idx === 0 ? 'TODAY' : `${idx}D AGO`}
                    </div>
                    <div className="text-xs font-bold text-white mt-0.5">{day.dayOfWeek}</div>
                    <div className="text-[10px] text-[#A0A0AA]">{day.dateFormatted.split(',')[0]}</div>
                    <div className="mt-1 text-[11px] font-mono font-semibold text-emerald-400">
                      {day.drivingHours}h drive
                    </div>
                  </button>
                ))}
              </div>

              {/* SELECTED DAY DETAIL CARD */}
              <div className="bg-[#14151B] border border-[#292A2F] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#292A2F] pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      DAILY LOG: {currentDay.dayOfWeek}, {currentDay.dateFormatted}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                      {currentDay.eldTransferStatus}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#90909A]">
                    Digital Seal: {currentDay.cryptographicSignature}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 bg-[#0D0E13] rounded-lg border border-[#222]">
                    <div className="text-[10px] text-[#90909A] uppercase font-mono">Driving Time</div>
                    <div className="text-lg font-bold text-emerald-400 mt-1">{currentDay.drivingHours} hrs</div>
                  </div>
                  <div className="p-3 bg-[#0D0E13] rounded-lg border border-[#222]">
                    <div className="text-[10px] text-[#90909A] uppercase font-mono">On-Duty (Not Driving)</div>
                    <div className="text-lg font-bold text-blue-400 mt-1">{currentDay.onDutyNotDrivingHours} hrs</div>
                  </div>
                  <div className="p-3 bg-[#0D0E13] rounded-lg border border-[#222]">
                    <div className="text-[10px] text-[#90909A] uppercase font-mono">Sleeper Berth</div>
                    <div className="text-lg font-bold text-indigo-400 mt-1">{currentDay.sleeperBerthHours} hrs</div>
                  </div>
                  <div className="p-3 bg-[#0D0E13] rounded-lg border border-[#222]">
                    <div className="text-[10px] text-[#90909A] uppercase font-mono">Off-Duty</div>
                    <div className="text-lg font-bold text-gray-400 mt-1">{currentDay.offDutyHours} hrs</div>
                  </div>
                  <div className="p-3 bg-[#0D0E13] rounded-lg border border-[#222]">
                    <div className="text-[10px] text-[#90909A] uppercase font-mono">Total Miles Logged</div>
                    <div className="text-lg font-bold text-amber-400 mt-1">{currentDay.totalMilesDriven} mi</div>
                  </div>
                </div>

                {/* 24-HOUR ELD GRID BAR VISUALIZER */}
                <div className="space-y-1.5">
                  <div className="text-xs font-mono text-[#90909A] flex items-center justify-between">
                    <span>24-HOUR FMCSA DUTY STATUS TIMELINE GRAPH</span>
                    <span>00:00 TO 24:00 (MIDNIGHT TO MIDNIGHT)</span>
                  </div>
                  <div className="h-8 bg-[#090A0E] rounded-lg border border-[#292A2F] flex overflow-hidden">
                    <div style={{ width: `${(currentDay.offDutyHours / 24) * 100}%` }} className="bg-gray-600/80 flex items-center justify-center text-[10px] font-bold text-white border-r border-black" title="Off Duty">
                      OFF
                    </div>
                    <div style={{ width: `${(currentDay.sleeperBerthHours / 24) * 100}%` }} className="bg-indigo-600/80 flex items-center justify-center text-[10px] font-bold text-white border-r border-black" title="Sleeper Berth">
                      SB
                    </div>
                    <div style={{ width: `${(currentDay.drivingHours / 24) * 100}%` }} className="bg-emerald-600/90 flex items-center justify-center text-[10px] font-bold text-white border-r border-black" title="Driving">
                      DRIVE
                    </div>
                    <div style={{ width: `${(currentDay.onDutyNotDrivingHours / 24) * 100}%` }} className="bg-blue-600/90 flex items-center justify-center text-[10px] font-bold text-white" title="On Duty">
                      ON
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DVIR PRE/POST TRIP */}
          {activeTab === 'DVIRS' && (
            <div className="space-y-3">
              <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-xl flex items-start gap-3">
                <FileCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-blue-200">
                    PRIOR 7 DAYS PRE-TRIP & POST-TRIP DVIR INSPECTIONS (49 CFR § 396.11)
                  </h4>
                  <p className="text-xs text-blue-300/80 mt-1">
                    Every commercial motor vehicle must have daily pre-trip inspection verification and a post-trip DVIR prepared at the completion of each day's work.
                  </p>
                </div>
              </div>

              {dossier.days.map((day, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#14151B] border border-[#292A2F] flex items-center justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {day.dayOfWeek}, {day.dateFormatted}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                        SAFE TO OPERATE
                      </span>
                    </div>
                    <div className="text-xs text-[#90909A] flex items-center gap-3">
                      <span>Pre-Trip: Completed (07:15 EDT)</span>
                      <span>Post-Trip: Completed (18:40 EDT)</span>
                      <span>Mechanic Certification: On File</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Zero Uncorrected Defects
                    </div>
                    <div className="text-[11px] text-[#90909A] font-mono mt-0.5">
                      Driver Sig: Marcus Bell (IL-49102)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CLEAN INSPECTIONS */}
          {activeTab === 'CLEAN_PASS' && (
            <div className="space-y-4">
              <div className="p-5 bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-300 border border-emerald-500/40">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      OFFICIAL CVSA CLEAN ROADSIDE INSPECTIONS RECORD
                    </h3>
                    <p className="text-xs text-emerald-200/90 mt-0.5">
                      {dossier.cleanInspectionsSummary.lastCleanInspectionDate}
                    </p>
                    <div className="text-xs font-mono font-bold text-emerald-300 mt-1">
                      {dossier.cleanInspectionsSummary.lastCvsaDecalIssued}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black text-emerald-400">
                    {dossier.cleanInspectionsSummary.totalCleanPasses}
                  </div>
                  <div className="text-xs text-emerald-300/80 uppercase font-mono font-bold">
                    Clean Passes on File
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#14151B] border border-[#292A2F] space-y-2">
                <h4 className="text-xs font-bold text-white uppercase font-mono">
                  FMCSA ISS-D INSPECTION SELECTION MATRIX RATING:
                </h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#90909A]">Current Inspection Selection System (ISS) Score:</span>
                  <span className="font-bold text-emerald-400">18 (PASS TIER — LOWEST AUDIT RISK)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#90909A]">CVSA Windshield Decal Validity:</span>
                  <span className="font-bold text-emerald-300">Q3 2026 Decal Active (Exempt from Level 1 reinspection for 90 days)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VIOLATIONS & STATE REMEDIATION ADVISOR */}
          {activeTab === 'VIOLATIONS_REMEDIATION' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-200">
                    STATE-SPECIFIC VIOLATION REMEDIATION & DATAQS DEFENSE ADVISOR
                  </h4>
                  <p className="text-xs text-amber-300/80 mt-1">
                    Customized corrective resolution based on driver profile, state enforcement jurisdiction (Ohio OSHP), and specific CFR issues reported.
                  </p>
                </div>
              </div>

              {dossier.notedViolations.map((v) => (
                <div key={v.id} className="bg-[#14151B] border border-amber-500/30 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#292A2F] pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-bold font-mono rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                        {v.cfrCode}
                      </span>
                      <span className="text-sm font-bold text-white">{v.description}</span>
                    </div>
                    <span className="text-xs font-mono text-[#90909A]">
                      State: {v.state} · Report: {v.reportNumber}
                    </span>
                  </div>

                  {/* 4-STEP REMEDIATION GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#0D0E13] rounded-lg border border-[#222] space-y-1">
                      <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                        Step 1: Immediate Roadside Cure
                      </div>
                      <p className="text-emerald-200">{v.remediation.immediateRoadsideCure}</p>
                    </div>

                    <div className="p-3 bg-[#0D0E13] rounded-lg border border-[#222] space-y-1">
                      <div className="text-[10px] font-mono text-blue-400 uppercase font-bold">
                        Step 2: 15-Day Motor Carrier Certification Plan (49 CFR § 396.9(d))
                      </div>
                      <p className="text-blue-200">{v.remediation.carrier15DayCertificationPlan}</p>
                    </div>

                    <div className="p-3 bg-[#0D0E13] rounded-lg border border-[#222] space-y-1">
                      <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                        Step 3: State-Specific DataQs RDR Challenge Strategy ({v.state})
                      </div>
                      <p className="text-amber-200">{v.remediation.dataQsChallengeStrategy}</p>
                    </div>

                    <div className="p-3 bg-[#0D0E13] rounded-lg border border-[#222] space-y-1">
                      <div className="text-[10px] font-mono text-indigo-400 uppercase font-bold">
                        Step 4: Shop Preventive Action & CSA Impact
                      </div>
                      <p className="text-indigo-200">
                        {v.remediation.preventativeShopAction} (Points impact: -{v.remediation.estimatedCsaScoreImpactPoints} pts)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-[#090A0E] px-6 py-4 border-t border-[#292A2F] flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="text-xs text-[#90909A] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Cryptographically sealed 8-day package verified under 49 CFR § 395.24</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1B1D25] hover:bg-[#252833] text-white text-xs font-semibold rounded-xl transition-colors"
          >
            CLOSE DOSSIER
          </button>
        </div>
      </div>
    </div>
  );
};
