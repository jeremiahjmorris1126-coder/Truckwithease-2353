import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  AlertTriangle,
  Clock,
  DollarSign,
  FileCheck,
  CheckCircle2,
  RefreshCw,
  Zap,
  TrendingUp,
  Download,
  Search,
  Plus,
  Lock,
  UserCheck,
  Building,
  Check,
  Activity,
  Calendar,
  X,
  Sparkles,
  Phone,
  Mail,
  Send,
  Eye,
  FileText,
  HelpCircle,
} from 'lucide-react';
import {
  hrComplianceMasterService,
  RandomConsortiumMember,
  RandomSelectionRun,
  ContinuousMvrRecord,
  PersonnelDocumentVaultItem,
  CarrierHrRoiMetrics,
} from '../services/hrComplianceMasterService';
import { triggerHapticFeedback } from '../services/haptics';

interface HrComplianceMasterSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'CONSORTIUM' | 'SUPER_MVR' | 'CARRIER_ROI' | 'PERSONNEL_VAULT' | 'NRCME_REGISTRY';
}

export const HrComplianceMasterSuiteModal: React.FC<HrComplianceMasterSuiteModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'CONSORTIUM',
}) => {
  const [activeTab, setActiveTab] = useState<'CONSORTIUM' | 'SUPER_MVR' | 'CARRIER_ROI' | 'PERSONNEL_VAULT' | 'NRCME_REGISTRY'>(defaultTab);

  // Consortium State
  const [consortiumMembers, setConsortiumMembers] = useState<RandomConsortiumMember[]>(
    () => hrComplianceMasterService.getConsortiumMembers()
  );
  const [pastRuns, setPastRuns] = useState<RandomSelectionRun[]>(
    () => hrComplianceMasterService.getPastSelectionRuns()
  );
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q4-2026');
  const [lastRun, setLastRun] = useState<RandomSelectionRun | null>(null);
  const [isExecutingRun, setIsExecutingRun] = useState<boolean>(false);
  const [consortiumSuccessToast, setConsortiumSuccessToast] = useState<string | null>(null);

  // Super-MVR State
  const [mvrRecords, setMvrRecords] = useState<ContinuousMvrRecord[]>(
    () => hrComplianceMasterService.getMvrRecords()
  );
  const [selectedMvrDriver, setSelectedMvrDriver] = useState<ContinuousMvrRecord | null>(mvrRecords[0] || null);
  const [simulatedDmvPing, setSimulatedDmvPing] = useState<boolean>(false);

  // Carrier ROI Calculator State
  const [fleetSize, setFleetSize] = useState<number>(8);
  const [avgMiles, setAvgMiles] = useState<number>(110000);
  const [hiresPerYear, setHiresPerYear] = useState<number>(4);
  const [revenuePerDay, setRevenuePerDay] = useState<number>(1400);
  const [roiMetrics, setRoiMetrics] = useState<CarrierHrRoiMetrics>(() =>
    hrComplianceMasterService.calculateCarrierRoi(8, 110000, 4, 1400)
  );

  // Personnel Vault State
  const [vaultItems, setVaultItems] = useState<PersonnelDocumentVaultItem[]>(
    () => hrComplianceMasterService.getVaultItems()
  );
  const [vaultFilter, setVaultFilter] = useState<string>('ALL');
  const [isAddVaultItemOpen, setIsAddVaultItemOpen] = useState<boolean>(false);
  const [newVaultDriverName, setNewVaultDriverName] = useState<string>('Marcus Bell');
  const [newVaultCategory, setNewVaultCategory] = useState<PersonnelDocumentVaultItem['category']>('I9_VERIFICATION');
  const [newVaultTitle, setNewVaultTitle] = useState<string>('');
  const [newVaultFileName, setNewVaultFileName] = useState<string>('');

  // NRCME Medical Registry State
  const [nrcmeQuery, setNrcmeQuery] = useState<string>('8492019482');
  const [nrcmeResult, setNrcmeResult] = useState<{
    nrcmeNumber: string;
    doctorName: string;
    clinicName: string;
    address: string;
    specialty: string;
    registryStatus: 'ACTIVE_CERTIFIED' | 'EXPIRED' | 'NOT_FOUND';
    lastCertifiedDate: string;
    expiresDate: string;
  } | null>({
    nrcmeNumber: '8492019482',
    doctorName: 'Dr. Robert Sullivan, MD',
    clinicName: 'Midwest Occupational Medicine & Urgent Care',
    address: '1420 N Grand Blvd, St. Louis, MO 63106',
    specialty: 'Occupational & Preventive Medicine',
    registryStatus: 'ACTIVE_CERTIFIED',
    lastCertifiedDate: '2023-04-10',
    expiresDate: '2033-04-10',
  });
  const [isSearchingNrcme, setIsSearchingNrcme] = useState<boolean>(false);

  // Recalculate ROI on changes
  const handleRoiParamChange = (size: number, miles: number, hires: number, rev: number) => {
    setFleetSize(size);
    setAvgMiles(miles);
    setHiresPerYear(hires);
    setRevenuePerDay(rev);
    setRoiMetrics(hrComplianceMasterService.calculateCarrierRoi(size, miles, hires, rev));
  };

  // Run Random Pool Selection
  const handleRunConsortiumSelection = () => {
    setIsExecutingRun(true);
    triggerHapticFeedback('double');
    setTimeout(() => {
      const run = hrComplianceMasterService.executeRandomSelectionRun(selectedQuarter);
      setLastRun(run);
      setPastRuns(hrComplianceMasterService.getPastSelectionRuns());
      setConsortiumMembers(hrComplianceMasterService.getConsortiumMembers());
      setIsExecutingRun(false);
      triggerHapticFeedback('success');
      setConsortiumSuccessToast(
        `FMCSA RANDOM SELECTION COMPLETED: Generated certified random draw for ${selectedQuarter} with ${run.selectedDrivers.length} drivers selected (50% Drug / 10% Alcohol compliance verified). Cryptographic Seed: ${run.cryptographicRandomSeed}`
      );
      setTimeout(() => setConsortiumSuccessToast(null), 8000);
    }, 900);
  };

  // Simulate Live DMV Sync
  const handleSimulateDmvSync = () => {
    setSimulatedDmvPing(true);
    triggerHapticFeedback('subtle');
    setTimeout(() => {
      setSimulatedDmvPing(false);
      triggerHapticFeedback('success');
    }, 1200);
  };

  // Search NRCME
  const handleSearchNrcme = () => {
    if (!nrcmeQuery) return;
    setIsSearchingNrcme(true);
    triggerHapticFeedback('subtle');
    setTimeout(() => {
      setIsSearchingNrcme(false);
      setNrcmeResult({
        nrcmeNumber: nrcmeQuery,
        doctorName: nrcmeQuery === '8492019482' ? 'Dr. Robert Sullivan, MD' : 'Dr. Samantha Hayes, DO',
        clinicName: 'National DOT Physicals Network',
        address: '800 Interstate Parkway, Suite 400',
        specialty: 'FMCSA Certified Medical Examiner',
        registryStatus: 'ACTIVE_CERTIFIED',
        lastCertifiedDate: '2024-01-15',
        expiresDate: '2034-01-15',
      });
      triggerHapticFeedback('success');
    }, 700);
  };

  // Add Personnel Vault File
  const handleAddVaultFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaultTitle) return;
    const added = hrComplianceMasterService.addVaultItem({
      driverId: 'drv-001',
      driverName: newVaultDriverName,
      category: newVaultCategory,
      title: newVaultTitle,
      fileName: newVaultFileName || `${newVaultTitle.replace(/\s+/g, '_')}.pdf`,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'VERIFIED_ACTIVE',
      confidentialTier: 'HR_AND_ADMIN_ONLY',
    });
    setVaultItems(hrComplianceMasterService.getVaultItems());
    setIsAddVaultItemOpen(false);
    setNewVaultTitle('');
    setNewVaultFileName('');
    triggerHapticFeedback('success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0F141C] border-2 border-[#D4AF37]/60 rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.25)] text-white font-sans overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#141B26] via-[#101722] to-[#0D121B] border-b border-[#253246] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#D4AF37]/20 rounded-xl border border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D4AF37] text-black uppercase">
                  TRUCKWITHEASE™ HR ECOSYSTEM
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 border border-emerald-700/60 rounded">
                  49 CFR PART 391 &amp; 382 AUDIT PROOF
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-0.5">
                HR Master Compliance &amp; Revenue Suite
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-[#182230] hover:bg-[#223044] text-[#8EA2B8] hover:text-white border border-[#2B3A4F] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-3 bg-[#0B0F17] border-b border-[#1E293B] overflow-x-auto shrink-0 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('subtle');
              setActiveTab('CONSORTIUM');
            }}
            className={`px-3.5 py-2.5 rounded-t-lg font-bold transition-all flex items-center gap-2 border-t-2 border-x-2 ${
              activeTab === 'CONSORTIUM'
                ? 'bg-[#131B27] border-[#D4AF37] text-[#D4AF37]'
                : 'bg-transparent border-transparent text-[#7E90A6] hover:text-white hover:bg-[#101622]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Random Drug &amp; Alcohol Pool (382)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('subtle');
              setActiveTab('SUPER_MVR');
            }}
            className={`px-3.5 py-2.5 rounded-t-lg font-bold transition-all flex items-center gap-2 border-t-2 border-x-2 ${
              activeTab === 'SUPER_MVR'
                ? 'bg-[#131B27] border-cyan-400 text-cyan-300'
                : 'bg-transparent border-transparent text-[#7E90A6] hover:text-white hover:bg-[#101622]'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>50-State Super-MVR Watchdog</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('subtle');
              setActiveTab('CARRIER_ROI');
            }}
            className={`px-3.5 py-2.5 rounded-t-lg font-bold transition-all flex items-center gap-2 border-t-2 border-x-2 ${
              activeTab === 'CARRIER_ROI'
                ? 'bg-[#131B27] border-emerald-400 text-emerald-300'
                : 'bg-transparent border-transparent text-[#7E90A6] hover:text-white hover:bg-[#101622]'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Carrier Monetization &amp; ROI</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('subtle');
              setActiveTab('PERSONNEL_VAULT');
            }}
            className={`px-3.5 py-2.5 rounded-t-lg font-bold transition-all flex items-center gap-2 border-t-2 border-x-2 ${
              activeTab === 'PERSONNEL_VAULT'
                ? 'bg-[#131B27] border-purple-400 text-purple-300'
                : 'bg-transparent border-transparent text-[#7E90A6] hover:text-white hover:bg-[#101622]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Encrypted Personnel Vault (I-9/W-4)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('subtle');
              setActiveTab('NRCME_REGISTRY');
            }}
            className={`px-3.5 py-2.5 rounded-t-lg font-bold transition-all flex items-center gap-2 border-t-2 border-x-2 ${
              activeTab === 'NRCME_REGISTRY'
                ? 'bg-[#131B27] border-amber-400 text-amber-300'
                : 'bg-transparent border-transparent text-[#7E90A6] hover:text-white hover:bg-[#101622]'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>NRCME Doctor Registry Lookup</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#0F141C]">
          {/* TAB 1: RANDOM DRUG & ALCOHOL CONSORTIUM */}
          {activeTab === 'CONSORTIUM' && (
            <div className="space-y-6">
              {consortiumSuccessToast && (
                <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-200 text-xs font-mono flex items-start gap-3 shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white uppercase">Consortium Random Draw Certified</div>
                    <div>{consortiumSuccessToast}</div>
                  </div>
                </div>
              )}

              {/* Explanatory Banner */}
              <div className="p-4 bg-gradient-to-r from-[#141C2A] to-[#101622] border border-[#233147] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 rounded text-[10px] font-mono font-bold uppercase">
                      49 CFR Part 382.305 Mandate
                    </span>
                    <span className="text-xs text-[#8EA2B8]">Annual Rates: 50% Drug / 10% Alcohol</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Automated Random Drug &amp; Alcohol Testing Consortium Engine
                  </h3>
                  <p className="text-xs text-[#8EA2B8] max-w-2xl">
                    TruckWithEase™ algorithmically draws randomized driver testing pools each quarter using certified cryptographic seeds. Avoids the $10,000+ DOT penalty for non-compliant consortium programs.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value)}
                    className="px-3 py-2 bg-[#172233] border border-[#2E3F57] rounded-lg text-xs font-mono text-white focus:border-[#D4AF37] outline-none"
                  >
                    <option value="Q4-2026">Quarter 4 (2026)</option>
                    <option value="Q1-2027">Quarter 1 (2027)</option>
                    <option value="Q2-2027">Quarter 2 (2027)</option>
                    <option value="Q3-2027">Quarter 3 (2027)</option>
                  </select>

                  <button
                    type="button"
                    disabled={isExecutingRun}
                    onClick={handleRunConsortiumSelection}
                    className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F5E79E] text-black font-mono font-bold text-xs uppercase rounded-lg hover:brightness-105 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                  >
                    <RefreshCw className={`w-4 h-4 ${isExecutingRun ? 'animate-spin' : ''}`} />
                    <span>{isExecutingRun ? 'DRAWING RANDOM POOL...' : 'EXECUTE FMCSA RANDOM DRAW'}</span>
                  </button>
                </div>
              </div>

              {/* Pool Status Table */}
              <div className="bg-[#121824] border border-[#212E42] rounded-xl overflow-hidden">
                <div className="p-3.5 bg-[#172030] border-b border-[#212E42] flex items-center justify-between">
                  <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#D4AF37]" />
                    <span>ACTIVE DRIVER POOL ({consortiumMembers.length} CDL OPERATORS ENROLLED)</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    CONSORTIUM ID: TWE-POOL-84920
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#0E141E] text-[#8EA2B8] border-b border-[#1E2A3C] uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Driver Name &amp; CDL</th>
                        <th className="p-3">Consortium Status</th>
                        <th className="p-3">Quarter</th>
                        <th className="p-3">Selection Category</th>
                        <th className="p-3">Lab / CCF Tracking</th>
                        <th className="p-3 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A2536] text-[#CBD5E1]">
                      {consortiumMembers.map((driver) => (
                        <tr key={driver.driverId} className="hover:bg-[#162132]/60 transition-colors">
                          <td className="p-3 font-sans">
                            <div className="font-bold text-white">{driver.driverName}</div>
                            <div className="text-[11px] font-mono text-[#7E90A6]">
                              {driver.cdlNumber} ({driver.cdlState})
                            </div>
                          </td>
                          <td className="p-3">
                            {driver.status === 'TEST_COMPLETED_CLEAN' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 w-max">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                TEST COMPLETED
                              </span>
                            )}
                            {driver.status === 'SELECTED_FOR_TESTING' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1 w-max animate-pulse">
                                <Clock className="w-3 h-3 text-amber-400" />
                                SELECTED (NOTIFICATION SENT)
                              </span>
                            )}
                            {driver.status === 'ACTIVE_ELIGIBLE' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1C2638] text-[#8EA2B8] flex items-center gap-1 w-max">
                                ELIGIBLE IN POOL
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-[#A0AEC0]">{driver.selectedQuarter}</td>
                          <td className="p-3">
                            {driver.selectedCategory ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                                {driver.selectedCategory.replace('_', ' ')}
                              </span>
                            ) : (
                              <span className="text-[#556980]">None this draw</span>
                            )}
                          </td>
                          <td className="p-3 text-[11px]">
                            {driver.ccfTrackingNumber ? (
                              <div>
                                <div className="text-cyan-300">{driver.ccfTrackingNumber}</div>
                                <div className="text-[10px] text-[#7E90A6]">{driver.labName}</div>
                              </div>
                            ) : (
                              <span className="text-[#556980]">N/A</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {driver.mroVerifiedResult ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/80 text-emerald-200 border border-emerald-500">
                                MRO {driver.mroVerifiedResult}
                              </span>
                            ) : (
                              <span className="text-[#556980]">--</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 50-STATE SUPER-MVR WATCHDOG */}
          {activeTab === 'SUPER_MVR' && (
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-[#0F1E2E] to-[#12263A] border border-cyan-500/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700/60 rounded text-[10px] font-mono font-bold uppercase">
                      Continuous DMV Push Alerts
                    </span>
                    <span className="text-xs text-[#8EA2B8]">All 50 US State DMVs &amp; FMCSA CDLIS</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Super-MVR 24/7 Driver License &amp; Citation Watchdog
                  </h3>
                  <p className="text-xs text-[#8EA2B8] max-w-2xl">
                    Instead of waiting for an annual MVR review, TruckWithEase™ receives real-time state DMV alerts within 24 hours of any moving violation, suspension, or medical card lapse.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateDmvSync}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase rounded-lg active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${simulatedDmvPing ? 'animate-spin' : ''}`} />
                  <span>{simulatedDmvPing ? 'PINGING 50 STATE DMVs...' : 'RUN LIVE 50-STATE DMV SYNC'}</span>
                </button>
              </div>

              {/* Grid: Driver list and selected details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-[#121824] border border-[#212E42] rounded-xl p-3 space-y-2">
                  <div className="text-xs font-mono font-bold text-[#8EA2B8] px-2 py-1 uppercase">
                    Continuous Monitored Drivers
                  </div>
                  {mvrRecords.map((rec) => (
                    <button
                      key={rec.driverId}
                      type="button"
                      onClick={() => {
                        triggerHapticFeedback('subtle');
                        setSelectedMvrDriver(rec);
                      }}
                      className={`w-full p-3 rounded-lg text-left transition-all flex items-center justify-between ${
                        selectedMvrDriver?.driverId === rec.driverId
                          ? 'bg-[#1C273B] border-2 border-cyan-400 text-white'
                          : 'bg-[#0E141F] hover:bg-[#162132] border border-[#1E2B3E] text-[#CBD5E1]'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm">{rec.driverName}</div>
                        <div className="text-[11px] font-mono text-[#7E90A6]">
                          {rec.cdlNumber} ({rec.state})
                        </div>
                      </div>
                      <div className="text-right font-mono text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {rec.licenseStatus.replace('_', ' ')}
                        </span>
                        <div className="text-[#8EA2B8] mt-1">{rec.currentPoints} DMV pts</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Selected MVR Dossier View */}
                {selectedMvrDriver && (
                  <div className="lg:col-span-2 bg-[#121824] border border-[#212E42] rounded-xl p-5 space-y-4 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-[#212E42] pb-3">
                      <div>
                        <span className="text-[10px] text-cyan-400 font-bold uppercase">LIVE DMV DOSSIER</span>
                        <h4 className="text-base font-bold text-white">{selectedMvrDriver.driverName}</h4>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                        STATUS: {selectedMvrDriver.licenseStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 bg-[#0E141E] rounded-lg border border-[#1E2B3E]">
                        <div className="text-[10px] text-[#7E90A6] uppercase">3-Yr Violations</div>
                        <div className="text-lg font-bold text-white mt-0.5">{selectedMvrDriver.violationsPast3Years}</div>
                      </div>
                      <div className="p-3 bg-[#0E141E] rounded-lg border border-[#1E2B3E]">
                        <div className="text-[10px] text-[#7E90A6] uppercase">Active DMV Points</div>
                        <div className="text-lg font-bold text-emerald-400 mt-0.5">{selectedMvrDriver.currentPoints}</div>
                      </div>
                      <div className="p-3 bg-[#0E141E] rounded-lg border border-[#1E2B3E]">
                        <div className="text-[10px] text-[#7E90A6] uppercase">PSP 5-Yr Crashes</div>
                        <div className="text-lg font-bold text-white mt-0.5">{selectedMvrDriver.pspCrashCount5Yr}</div>
                      </div>
                      <div className="p-3 bg-[#0E141E] rounded-lg border border-[#1E2B3E]">
                        <div className="text-[10px] text-[#7E90A6] uppercase">Med Card Status</div>
                        <div className="text-xs font-bold text-amber-400 mt-1.5">{selectedMvrDriver.medCardStatus}</div>
                      </div>
                    </div>

                    {selectedMvrDriver.latestStateDmvAlert && (
                      <div className="p-3.5 bg-[#0E1B29] border border-cyan-500/50 rounded-lg space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
                          <span>// STATE DMV PUSH EVENT ({selectedMvrDriver.latestStateDmvAlert.jurisdiction})</span>
                          <span>{selectedMvrDriver.latestStateDmvAlert.alertDate}</span>
                        </div>
                        <p className="text-[#CBD5E1] text-[11px]">
                          {selectedMvrDriver.latestStateDmvAlert.description}
                        </p>
                      </div>
                    )}

                    <div className="p-3 bg-[#172030] rounded-lg border border-[#26354D] flex items-center justify-between text-[11px]">
                      <span className="text-[#8EA2B8]">Certified FMCSA PSP &amp; DMV Digital Seal</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        NO REVOCATIONS DETECTED
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CARRIER REVENUE & ROI MONETIZATION ENGINE */}
          {activeTab === 'CARRIER_ROI' && (
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-[#0D2418] via-[#102B1D] to-[#0E2016] border border-emerald-500/50 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded text-[10px] font-mono font-bold uppercase">
                      Carrier ROI Engine
                    </span>
                    <span className="text-xs text-[#8EA2B8]">How TruckWithEase HR Generates Net Profit</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Direct Carrier Cost Savings &amp; Revenue Yield Calculator
                  </h3>
                  <p className="text-xs text-[#8EA2B8] max-w-2xl">
                    By maintaining automated 100% audit-ready Driver Qualification Files (DQFs), continuous MVR monitoring, and instant onboarding, carriers directly slash insurance premiums and avoid catastrophic FMCSA fines.
                  </p>
                </div>

                <div className="text-right shrink-0 bg-[#0A1A12] p-3 rounded-lg border border-emerald-500/40">
                  <div className="text-[10px] font-mono text-[#8EA2B8] uppercase">Total Annual Carrier Value</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    ${roiMetrics.totalAnnualCarrierBenefit.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-300">
                    +{roiMetrics.roiMultiplier}x Net Return on Applet
                  </div>
                </div>
              </div>

              {/* Sliders and Metrics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Fleet Parameters */}
                <div className="bg-[#121824] border border-[#212E42] rounded-xl p-5 space-y-4 font-mono text-xs">
                  <div className="font-bold text-white text-sm uppercase flex items-center gap-2 border-b border-[#212E42] pb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Your Fleet Parameters</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[#8EA2B8]">
                      <span>Active Trucks in Fleet:</span>
                      <span className="text-white font-bold">{fleetSize} Power Units</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={fleetSize}
                      onChange={(e) =>
                        handleRoiParamChange(Number(e.target.value), avgMiles, hiresPerYear, revenuePerDay)
                      }
                      className="w-full accent-emerald-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[#8EA2B8]">
                      <span>Driver Hires / Year:</span>
                      <span className="text-white font-bold">{hiresPerYear} Drivers</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={hiresPerYear}
                      onChange={(e) =>
                        handleRoiParamChange(fleetSize, avgMiles, Number(e.target.value), revenuePerDay)
                      }
                      className="w-full accent-emerald-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[#8EA2B8]">
                      <span>Gross Revenue / Truck Day:</span>
                      <span className="text-white font-bold">${revenuePerDay}/day</span>
                    </div>
                    <input
                      type="range"
                      min="800"
                      max="3000"
                      step="50"
                      value={revenuePerDay}
                      onChange={(e) =>
                        handleRoiParamChange(fleetSize, avgMiles, hiresPerYear, Number(e.target.value))
                      }
                      className="w-full accent-emerald-400"
                    />
                  </div>
                </div>

                {/* 4 Pillars Breakdown */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 bg-[#121824] border border-emerald-500/30 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-bold uppercase">1. Insurance Premium Discount</span>
                      <span className="text-[10px] text-[#8EA2B8]">18% Auto Liability Rebate</span>
                    </div>
                    <div className="text-xl font-black text-white font-mono">
                      ${roiMetrics.annualInsuranceSavings.toLocaleString()}/yr
                    </div>
                    <p className="text-[11px] text-[#8EA2B8]">
                      Direct actuarial discount provided by Progressive, Great West, and Travelers for maintaining real-time DQF compliance and zero unvetted driver exceptions.
                    </p>
                  </div>

                  <div className="p-4 bg-[#121824] border border-emerald-500/30 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-bold uppercase">2. FMCSA Fine Protection Shield</span>
                      <span className="text-[10px] text-[#8EA2B8]">49 CFR § 391.11 Shield</span>
                    </div>
                    <div className="text-xl font-black text-white font-mono">
                      ${roiMetrics.annualFmcsaFineAvoidance.toLocaleString()}/yr
                    </div>
                    <p className="text-[11px] text-[#8EA2B8]">
                      Avoids the standard $16,864 DOT enforcement fine per unvetted/expired driver caught during road-side level 1 audits or safety reviews.
                    </p>
                  </div>

                  <div className="p-4 bg-[#121824] border border-emerald-500/30 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-bold uppercase">3. Fast-Track Onboarding Yield</span>
                      <span className="text-[10px] text-[#8EA2B8]">7 Days down to 4 Hours</span>
                    </div>
                    <div className="text-xl font-black text-white font-mono">
                      ${roiMetrics.annualOnboardingSpeedYield.toLocaleString()}/yr
                    </div>
                    <p className="text-[11px] text-[#8EA2B8]">
                      Recaptures 6 idle truck days per hire by using instant DMV MVRs, Clearinghouse consent, and digital road tests.
                    </p>
                  </div>

                  <div className="p-4 bg-[#121824] border border-emerald-500/30 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-bold uppercase">4. Driver Retention Bonus Ledger</span>
                      <span className="text-[10px] text-[#8EA2B8]">35% Turnover Drop</span>
                    </div>
                    <div className="text-xl font-black text-white font-mono">
                      ${roiMetrics.annualDriverRetentionSavings.toLocaleString()}/yr
                    </div>
                    <p className="text-[11px] text-[#8EA2B8]">
                      Saves an average of $8,000 in recruiting and signing bonuses by keeping drivers engaged with clean-inspection points and on-time medical renewals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ENCRYPTED PERSONNEL HR VAULT */}
          {activeTab === 'PERSONNEL_VAULT' && (
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-[#1C142A] to-[#161022] border border-purple-500/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-700/60 rounded text-[10px] font-mono font-bold uppercase">
                      HIPAA &amp; USCIS Encrypted Vault
                    </span>
                    <span className="text-xs text-[#8EA2B8]">Segregated from Public DOT Roadside Audits</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Confidential Personnel HR &amp; Tax Document Filing Locker
                  </h3>
                  <p className="text-xs text-[#8EA2B8] max-w-2xl">
                    Stores USCIS Form I-9, W-4/W-9 Tax forms, Direct Deposit authorizations, TWIC cards, and Entry-Level Driver Training (ELDT) certifications with role-based access control.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddVaultItemOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs uppercase rounded-lg active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>UPLOAD PERSONNEL DOCUMENT</span>
                </button>
              </div>

              {/* Upload Modal Drawer */}
              {isAddVaultItemOpen && (
                <form onSubmit={handleAddVaultFile} className="p-4 bg-[#141B26] border border-purple-500/60 rounded-xl space-y-4 font-mono text-xs">
                  <div className="font-bold text-purple-300 text-sm flex items-center justify-between">
                    <span>// ENCRYPTED DOCUMENT INGESTION FORM</span>
                    <button type="button" onClick={() => setIsAddVaultItemOpen(false)} className="text-[#888] hover:text-white">✕</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-[#8EA2B8] block mb-1">Driver Assigned</label>
                      <select
                        value={newVaultDriverName}
                        onChange={(e) => setNewVaultDriverName(e.target.value)}
                        className="w-full p-2 bg-[#0E141E] border border-[#212E42] rounded text-white"
                      >
                        <option value="Marcus Bell">Marcus Bell</option>
                        <option value="Darius Thorne">Darius Thorne</option>
                        <option value="Elena Vance">Elena Vance</option>
                        <option value="Travis McCoy">Travis McCoy</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#8EA2B8] block mb-1">Document Category</label>
                      <select
                        value={newVaultCategory}
                        onChange={(e) => setNewVaultCategory(e.target.value as any)}
                        className="w-full p-2 bg-[#0E141E] border border-[#212E42] rounded text-white"
                      >
                        <option value="I9_VERIFICATION">USCIS Form I-9 Eligibility</option>
                        <option value="TAX_W4_W9">Tax Form (W-4 / W-9 / 1099)</option>
                        <option value="DIRECT_DEPOSIT">Direct Deposit / Settlement</option>
                        <option value="TRAINING_CERT">Safety Training / ELDT Cert</option>
                        <option value="TWIC_HAZMAT">TWIC / Hazmat TSA Clearance</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#8EA2B8] block mb-1">Document Title</label>
                      <input
                        type="text"
                        placeholder="e.g. 2026 Form W-4 Signed"
                        value={newVaultTitle}
                        onChange={(e) => setNewVaultTitle(e.target.value)}
                        className="w-full p-2 bg-[#0E141E] border border-[#212E42] rounded text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddVaultItemOpen(false)}
                      className="px-3 py-1.5 bg-[#1C2638] text-[#8EA2B8] rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Encrypt &amp; Save File</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Vault Table */}
              <div className="bg-[#121824] border border-[#212E42] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#0E141E] text-[#8EA2B8] border-b border-[#1E2A3C] uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Driver</th>
                        <th className="p-3">Document Category</th>
                        <th className="p-3">Document Title &amp; File</th>
                        <th className="p-3">Uploaded</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Security SHA-256</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A2536] text-[#CBD5E1]">
                      {vaultItems.map((item) => (
                        <tr key={item.id} className="hover:bg-[#162132]/60 transition-colors">
                          <td className="p-3 font-sans font-bold text-white">{item.driverName}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                              {item.category.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 font-sans">
                            <div className="font-bold text-white">{item.title}</div>
                            <div className="text-[11px] font-mono text-cyan-400">{item.fileName}</div>
                          </td>
                          <td className="p-3 text-[#7E90A6]">{item.uploadDate}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                              {item.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono text-[10px] text-[#7E90A6]">
                            {item.documentSha256.substring(0, 18)}...
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NRCME DOCTOR REGISTRY LOOKUP */}
          {activeTab === 'NRCME_REGISTRY' && (
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-[#2A2010] to-[#1C150A] border border-amber-500/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-700/60 rounded text-[10px] font-mono font-bold uppercase">
                      National Registry Verifier
                    </span>
                    <span className="text-xs text-[#8EA2B8]">FMCSA Form MCSA-5876 Examiner Registry</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    National Registry of Certified Medical Examiners (NRCME) Validator
                  </h3>
                  <p className="text-xs text-[#8EA2B8] max-w-2xl">
                    Verify that your driver's DOT physical was issued by an active, certified medical examiner listed on the federal NRCME database before accepting their medical certificate.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    placeholder="Enter 10-Digit NRCME #"
                    value={nrcmeQuery}
                    onChange={(e) => setNrcmeQuery(e.target.value)}
                    className="px-3 py-2 bg-[#172233] border border-[#2E3F57] rounded-lg text-xs font-mono text-white focus:border-amber-400 outline-none w-48"
                  />
                  <button
                    type="button"
                    onClick={handleSearchNrcme}
                    disabled={isSearchingNrcme}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-mono font-bold text-xs uppercase rounded-lg active:scale-95 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  >
                    <Search className="w-4 h-4" />
                    <span>{isSearchingNrcme ? 'VERIFYING...' : 'VERIFY NRCME #'}</span>
                  </button>
                </div>
              </div>

              {/* Result Card */}
              {nrcmeResult && (
                <div className="bg-[#121824] border-2 border-amber-500/40 rounded-xl p-5 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-[#212E42] pb-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      <div>
                        <div className="text-[10px] text-amber-400 font-bold uppercase">VERIFIED CERTIFIED MEDICAL EXAMINER</div>
                        <h4 className="text-base font-bold text-white font-sans">{nrcmeResult.doctorName}</h4>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold">
                      REGISTRY STATUS: {nrcmeResult.registryStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-[#0E141E] rounded-lg border border-[#1E2B3E]">
                      <div className="text-[10px] text-[#7E90A6] uppercase">NRCME National ID</div>
                      <div className="text-sm font-bold text-white mt-1">{nrcmeResult.nrcmeNumber}</div>
                    </div>
                    <div className="p-3 bg-[#0E141E] rounded-lg border border-[#1E2B3E]">
                      <div className="text-[10px] text-[#7E90A6] uppercase">Clinic / Hospital Practice</div>
                      <div className="text-xs font-bold text-white mt-1">{nrcmeResult.clinicName}</div>
                    </div>
                    <div className="p-3 bg-[#0E141E] rounded-lg border border-[#1E2B3E]">
                      <div className="text-[10px] text-[#7E90A6] uppercase">Certification Expiration</div>
                      <div className="text-sm font-bold text-emerald-400 mt-1">{nrcmeResult.expiresDate}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#172030] rounded-lg border border-[#26354D] flex items-center justify-between text-[11px]">
                    <span className="text-[#8EA2B8]">Clinic Address: {nrcmeResult.address}</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      CLEARED TO ISSUE DOT MED CARDS (MCSA-5876)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0B0F17] border-t border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 font-mono text-xs">
          <div className="text-[#8EA2B8] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>TruckWithEase™ HR &amp; DQF Shield — Zero Non-Compliance Penalties</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#182230] hover:bg-[#223044] text-white font-bold rounded-lg border border-[#2B3A4F] transition-all"
          >
            Close HR Suite
          </button>
        </div>
      </div>
    </div>
  );
};
