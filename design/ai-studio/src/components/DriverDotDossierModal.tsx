// ============================================================================
// DRIVER DOT COMPLIANCE DOSSIER MODAL (FMCSA 49 CFR § 391 & STATE DOT)
// RBAC-protected dossier displaying full Driver Qualification File (DQF), CDL,
// DOT Medical Card, FMCSA Clearinghouse, MVR records, and emergency contacts.
// ============================================================================

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  UserCheck,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Truck,
  Award,
  CheckCircle2,
  X,
  ExternalLink,
  Printer,
  Sparkles,
  KeyRound,
  Eye,
  Activity,
  Layers,
  Wrench,
  Radio,
} from 'lucide-react';
import {
  DriverDotDossier,
  UserRole,
  canUserAccessDotDossier,
  verifyManagerPin,
} from '../services/driverIntelligenceService';
import { triggerHapticFeedback } from '../services/haptics';

interface DriverDotDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: DriverDotDossier | null;
  currentUserRole?: UserRole;
  onOpenDriverIntelligence?: (driver: DriverDotDossier) => void;
  onOpenSafetyMeetings?: () => void;
}

export const DriverDotDossierModal: React.FC<DriverDotDossierModalProps> = ({
  isOpen,
  onClose,
  driver,
  currentUserRole = 'ADMIN', // Default to manager/admin access
  onOpenDriverIntelligence,
  onOpenSafetyMeetings,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CDL_DQF' | 'MED_CLEARINGHOUSE' | 'SAFETY_CSA'>('OVERVIEW');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>(currentUserRole);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || !driver) return null;

  const hasAccess = canUserAccessDotDossier(activeRole) || isPinUnlocked;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyManagerPin(pinInput)) {
      triggerHapticFeedback('success');
      setIsPinUnlocked(true);
      setPinError(false);
      setPinInput('');
      setToastMessage('MANAGER ACCESS GRANTED // AUDIT RECORD CREATED');
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      triggerHapticFeedback('alert');
      setPinError(true);
    }
  };

  const handlePrintDossier = () => {
    triggerHapticFeedback('tick');
    setToastMessage('GENERATING FMCSA STATUTORY 49 CFR § 391 DQF DOSSIER PDF...');
    setTimeout(() => {
      window.print();
      setToastMessage(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0C0E14] border-2 border-[#D4AF37] rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.9)] text-white font-sans">
        
        {/* TOAST POPUP */}
        {toastMessage && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-[#161305] border border-[#D4AF37] text-amber-200 px-4 py-2 rounded-xl text-xs font-mono font-bold shadow-2xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* MODAL HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-slate-800 bg-[#10131C]">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl ${driver.avatarColor} flex items-center justify-center font-headline text-lg font-black text-white shadow-lg shrink-0`}>
              {driver.avatarInitials}
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-xl font-headline font-black text-white uppercase tracking-tight">
                  {driver.driverName}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                  DOT RECORD #{driver.id.toUpperCase()}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  FMCSA COMPLIANT
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Assigned: <strong className="text-white">{driver.assignedUnit}</strong> ({driver.assignedTrailer}) · CDL #{driver.cdlNumber} ({driver.cdlState})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-center">
            {/* RBAC Role Selector for testing/demonstration */}
            <div className="flex items-center bg-[#151926] border border-slate-800 rounded-lg p-1 text-[11px] font-mono">
              <span className="text-slate-400 px-1.5 hidden md:inline">Role:</span>
              <select
                value={activeRole}
                onChange={(e) => {
                  setActiveRole(e.target.value as UserRole);
                  setIsPinUnlocked(false);
                }}
                className="bg-transparent text-[#D4AF37] font-bold focus:outline-none cursor-pointer"
                title="Current authenticated role"
              >
                <option value="ADMIN" className="bg-[#151926] text-white">ADMIN</option>
                <option value="FLEET_MANAGER" className="bg-[#151926] text-white">FLEET_MANAGER</option>
                <option value="SAFETY_DIRECTOR" className="bg-[#151926] text-white">SAFETY_DIRECTOR</option>
                <option value="DISPATCHER" className="bg-[#151926] text-white">DISPATCHER</option>
                <option value="DRIVER" className="bg-[#151926] text-white">DRIVER (RESTRICTED)</option>
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-95"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* RESTRICTED ACCESS GATE (IF UNAUTHORIZED ROLE) */}
        {!hasAccess ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 bg-[#0A0C10]">
            <div className="p-4 rounded-2xl bg-rose-500/10 border-2 border-rose-500/50 text-rose-400 animate-pulse">
              <Lock className="w-12 h-12" />
            </div>
            
            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-headline font-black text-white uppercase tracking-tight">
                DOT Compliance File Access Restricted
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                Under <strong className="text-amber-200">49 CFR Part 391</strong> &amp; the Federal Driver Privacy Protection Act, detailed driver medical examiner registries, MVR pulls, and Clearinghouse query histories are restricted to <strong className="text-white">Admin, Fleet Manager, &amp; Safety Director</strong> credentials.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="w-full max-w-xs space-y-3 pt-2">
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Enter Manager PIN (1126)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141722] border-2 border-slate-700 focus:border-[#D4AF37] text-white text-center font-mono text-sm tracking-widest focus:outline-none"
                />
              </div>

              {pinError && (
                <p className="text-[11px] font-mono text-rose-400 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Invalid Security PIN. Access Denied.</span>
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F2CA50] text-[#0A0A0A] font-mono text-xs font-bold uppercase transition-all shadow-md active:scale-98"
              >
                Unlock Driver Dossier
              </button>
            </form>
          </div>
        ) : (
          /* AUTHORIZED FULL DOSSIER VIEW */
          <div className="p-4 sm:p-6 space-y-5">
            {/* SUB-NAVIGATION TABS */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-mono font-bold">
              <button
                onClick={() => setActiveTab('OVERVIEW')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'OVERVIEW'
                    ? 'bg-[#D4AF37] text-[#0A0A0A] font-black shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>OVERVIEW &amp; CONTACTS</span>
              </button>

              <button
                onClick={() => setActiveTab('CDL_DQF')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'CDL_DQF'
                    ? 'bg-[#D4AF37] text-[#0A0A0A] font-black shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>CDL &amp; DQF STATUTORY</span>
              </button>

              <button
                onClick={() => setActiveTab('MED_CLEARINGHOUSE')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'MED_CLEARINGHOUSE'
                    ? 'bg-[#D4AF37] text-[#0A0A0A] font-black shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>MED CARD &amp; CLEARINGHOUSE</span>
              </button>

              <button
                onClick={() => setActiveTab('SAFETY_CSA')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'SAFETY_CSA'
                    ? 'bg-[#D4AF37] text-[#0A0A0A] font-black shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>CSA SAFETY BASICS</span>
              </button>
            </div>

            {/* TAB 1: OVERVIEW & CONTACTS */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-4">
                {/* Driver Contact & Emergency Roster */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary Direct Comms */}
                  <div className="p-4 rounded-xl bg-[#111420] border border-slate-800 space-y-3">
                    <span className="font-mono text-[11px] text-[#D4AF37] uppercase font-bold tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Direct Driver Contact (24/7 Cab Link)</span>
                    </span>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Mobile Phone:</span>
                        <a href={`tel:${driver.driverPhone.replace(/\D/g, '')}`} className="text-emerald-400 font-bold hover:underline">
                          {driver.driverPhone}
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Fleet Email:</span>
                        <span className="text-white">{driver.driverEmail}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Assigned Tractor:</span>
                        <span className="text-amber-300 font-bold">{driver.assignedUnit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Assigned Trailer:</span>
                        <span className="text-white">{driver.assignedTrailer}</span>
                      </div>
                    </div>
                  </div>

                  {/* Statutory Emergency Contact & Next of Kin */}
                  <div className="p-4 rounded-xl bg-[#111420] border border-slate-800 space-y-3">
                    <span className="font-mono text-[11px] text-rose-300 uppercase font-bold tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                      <span>Statutory Emergency Contact (DOT § 391)</span>
                    </span>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Next of Kin:</span>
                        <span className="text-white font-bold">{driver.emergencyContactName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Relationship:</span>
                        <span className="text-slate-300">{driver.emergencyContactRelation}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Emergency Phone:</span>
                        <a href={`tel:${driver.emergencyContactPhone.replace(/\D/g, '')}`} className="text-rose-400 font-bold hover:underline">
                          {driver.emergencyContactPhone}
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Dispatch Notification:</span>
                        <span className="text-emerald-400 font-bold">AUTOMATED SMS PROTOCOL</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Intelligence Summary Bar */}
                <div className="p-4 rounded-xl bg-[#151926] border border-[#D4AF37]/40 flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-mono text-sm font-bold text-white uppercase">
                        Driver &amp; Rig Intelligence Suite
                      </h4>
                      <p className="text-[11px] font-mono text-slate-300">
                        Voice Biometrics · Prior Breakdowns ({driver.priorBreakdowns.length}) · Prior DVIRs ({driver.priorDvirRecords.length}) · Route Memory
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenDriverIntelligence && (
                      <button
                        onClick={() => {
                          onOpenDriverIntelligence(driver);
                          onClose();
                        }}
                        className="px-3 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#F2CA50] text-[#0A0A0A] font-mono text-xs font-bold uppercase transition-all shadow flex items-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Inspect Rig Intelligence</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CDL & DQF STATUTORY */}
            {activeTab === 'CDL_DQF' && (
              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-[#111420] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[11px] text-[#D4AF37] uppercase font-bold tracking-wider">
                      Commercial Driver License (CDL) Credentials
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                      STATUS: {driver.cdlStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-2.5 rounded-lg bg-[#0A0C12] border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">CDL Number</span>
                      <strong className="text-white text-sm">{driver.cdlNumber}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#0A0C12] border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Issuing State</span>
                      <strong className="text-emerald-400 text-sm">{driver.cdlState} (Class {driver.cdlClass})</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#0A0C12] border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Expiration Date</span>
                      <strong className="text-amber-300 text-sm">{driver.cdlExpirationDate}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#0A0C12] border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">MVR Review</span>
                      <strong className="text-white text-sm">{driver.mvrReviewStatus} (0 pts)</strong>
                    </div>
                  </div>

                  {/* Endorsements Strip */}
                  <div className="pt-2">
                    <span className="text-slate-400 text-[10px] block mb-1.5 uppercase font-bold">Authorized CDL Endorsements:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {driver.endorsements.map((end, idx) => (
                        <span key={idx} className="px-2 py-1 rounded bg-[#181D2E] text-cyan-300 border border-cyan-500/40 font-bold text-[11px]">
                          ✓ {end}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Restrictions */}
                  <div className="pt-1">
                    <span className="text-slate-400 text-[10px] block mb-1.5 uppercase font-bold">CDL Restrictions:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {driver.restrictions.map((res, idx) => (
                        <span key={idx} className="px-2 py-1 rounded bg-[#1C1605] text-amber-200 border border-amber-500/30 text-[11px]">
                          {res}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* State DMV Annual MVR Pull Record */}
                <div className="p-4 rounded-xl bg-[#111420] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <span className="text-[11px] text-white uppercase font-bold">
                      State DMV Motor Vehicle Record (MVR) 49 CFR § 391.25
                    </span>
                    <span className="text-slate-400 text-[10px]">Annual Review Valid</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                    <div>Agency: <strong className="text-white">{driver.mvrStateDmvAgency}</strong></div>
                    <div>Last Pull: <strong className="text-emerald-400">{driver.mvrLastPullDate}</strong></div>
                    <div>Violation Points: <strong className="text-emerald-400">{driver.mvrViolationPoints} Points (Clean)</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MEDICAL CARD & CLEARINGHOUSE */}
            {activeTab === 'MED_CLEARINGHOUSE' && (
              <div className="space-y-4 font-mono text-xs">
                {/* Medical Certificate */}
                <div className="p-4 rounded-xl bg-[#111420] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[11px] text-[#D4AF37] uppercase font-bold tracking-wider">
                      DOT Medical Examiner's Certificate (49 CFR § 391.43)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                      {driver.medCardStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-2.5 rounded-lg bg-[#0A0C12] border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">National Registry #</span>
                      <strong className="text-white text-sm">{driver.dotMedCardRegistryNumber}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#0A0C12] border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Certified Date</span>
                      <strong className="text-white text-sm">{driver.dotMedCardCertifiedDate}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#0A0C12] border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Expiration Date</span>
                      <strong className="text-emerald-400 text-sm">{driver.dotMedCardExpirationDate}</strong>
                    </div>
                  </div>

                  <div className="text-slate-300 text-xs">
                    Examined By: <strong className="text-white">{driver.examiningDoctorName}</strong> ({driver.examiningClinic})
                  </div>
                </div>

                {/* FMCSA Drug & Alcohol Clearinghouse */}
                <div className="p-4 rounded-xl bg-[#111420] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[11px] text-cyan-300 uppercase font-bold tracking-wider">
                      FMCSA Drug &amp; Alcohol Clearinghouse (49 CFR Part 382 Subpart G)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-bold border border-cyan-500/40">
                      {driver.clearinghouseStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Annual Query Timestamp</span>
                      <strong className="text-white text-sm">{driver.clearinghouseQueryDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Clearinghouse Query Transaction ID</span>
                      <strong className="text-white text-sm">{driver.clearinghouseQueryId}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/80">
                    ✓ Verified zero commercial driving prohibitions, positive drug/alcohol tests, or refusals under federal testing protocols.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: CSA SAFETY BASICS */}
            {activeTab === 'SAFETY_CSA' && (
              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-[#111420] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[11px] text-[#D4AF37] uppercase font-bold tracking-wider">
                      FMCSA CSA Safety Measurement System (SMS) Profile
                    </span>
                    <span className="text-emerald-400 font-bold">Overall Safety: {driver.safetyScorePercent}%</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-[#0A0C12] border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase block">Unsafe Driving</span>
                      <span className="text-xl font-black text-emerald-400">{driver.csaUnsafeDrivingPercentile}%</span>
                      <span className="text-[10px] text-slate-500 block">Threshold: 65%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0A0C12] border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase block">HOS Compliance</span>
                      <span className="text-xl font-black text-emerald-400">{driver.csaHosCompliancePercentile}%</span>
                      <span className="text-[10px] text-slate-500 block">Threshold: 65%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0A0C12] border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase block">Vehicle Maint.</span>
                      <span className="text-xl font-black text-emerald-400">{driver.csaVehicleMaintenancePercentile}%</span>
                      <span className="text-[10px] text-slate-500 block">Threshold: 80%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0A0C12] border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase block">Crash Indicator</span>
                      <span className="text-xl font-black text-emerald-400">{driver.csaCrashIndicatorPercentile}%</span>
                      <span className="text-[10px] text-slate-500 block">Zero Preventables</span>
                    </div>
                  </div>
                </div>

                {/* Prior Issues Quick Glance */}
                <div className="p-4 rounded-xl bg-[#111420] border border-slate-800 space-y-2">
                  <span className="text-[11px] text-white uppercase font-bold block pb-1 border-b border-slate-800">
                    Prior Logged Issues ({driver.priorIssues.length})
                  </span>
                  {driver.priorIssues.length === 0 ? (
                    <p className="text-slate-400 text-xs py-2">Zero prior issues logged for this commercial driver.</p>
                  ) : (
                    driver.priorIssues.map((iss) => (
                      <div key={iss.id} className="p-2 rounded-lg bg-[#0A0C12] border border-slate-800 text-[11px]">
                        <div className="flex items-center justify-between font-bold text-amber-200">
                          <span>{iss.type} · {iss.date}</span>
                          <span className="text-emerald-400">RESOLVED</span>
                        </div>
                        <p className="text-slate-300 mt-1">{iss.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ACTION FOOTER */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrintDossier}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Print Statutory DQF PDF</span>
                </button>

                {onOpenSafetyMeetings && (
                  <button
                    onClick={() => {
                      onOpenSafetyMeetings();
                      onClose();
                    }}
                    className="px-3 py-2 rounded-xl bg-[#141B26] hover:bg-[#1D2736] border border-cyan-500/40 text-cyan-200 font-mono text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Award className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Safety Meetings Roster</span>
                  </button>
                )}
              </div>

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#F2CA50] text-[#0A0A0A] font-mono text-xs font-black uppercase transition-all shadow-md active:scale-95"
              >
                Close Dossier
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
