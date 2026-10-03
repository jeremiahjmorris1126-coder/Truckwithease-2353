import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UploadCloud,
  FileText,
  Send,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Plus,
  Trash2,
  Eye,
  Download,
  Award,
  Truck,
  UserCheck,
  FileCheck,
  AlertCircle,
  X,
  FileUp,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Building,
  Check,
  Play,
} from 'lucide-react';
import {
  RoadsideInspectionRecord,
  RoadsideViolationItem,
  CvsaInspectionLevel,
  TabType,
} from '../types';
import {
  INITIAL_ROADSIDE_INSPECTIONS,
  getStoredRoadsideInspections,
  saveRoadsideInspection,
  calculate15DayDeadline,
} from '../services/roadsideInspectionService';
import { Prior7DaysInspectionDossierModal } from './Prior7DaysInspectionDossierModal';
import { InspectionMovingClipsModal } from './InspectionMovingClipsModal';

interface RoadsideInspectionsViewProps {
  onNavigateToTab?: (tab: TabType) => void;
}

export const RoadsideInspectionsView: React.FC<RoadsideInspectionsViewProps> = ({
  onNavigateToTab,
}) => {
  const [inspections, setInspections] = useState<RoadsideInspectionRecord[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'CLEAN' | 'VIOLATIONS' | 'OOS'>('ALL');
  const [selectedHaulerFilter, setSelectedHaulerFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [selectedInspection, setSelectedInspection] = useState<RoadsideInspectionRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isSendCompanyModalOpen, setIsSendCompanyModalOpen] = useState<boolean>(false);
  const [isSendDotModalOpen, setIsSendDotModalOpen] = useState<boolean>(false);
  const [activeActionRecord, setActiveActionRecord] = useState<RoadsideInspectionRecord | null>(null);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const [isPrior7DaysDossierOpen, setIsPrior7DaysDossierOpen] = useState<boolean>(false);
  const [isMovingClipsOpen, setIsMovingClipsOpen] = useState<boolean>(false);

  // Send to Company Form State
  const [companyEmail, setCompanyEmail] = useState<string>('safety@truckwithease.com');
  const [companyNotes, setCompanyNotes] = useState<string>('Roadside inspection report attached for safety filing and shop maintenance review.');

  // Send to DOT Form State (49 CFR § 396.9(d) 15-Day Motor Carrier Certification)
  const [dotCertifierName, setDotCertifierName] = useState<string>('Dave Miller');
  const [dotCertifierTitle, setDotCertifierTitle] = useState<string>('Director of Fleet Safety & Compliance');
  const [dotRepairSummary, setDotRepairSummary] = useState<string>('All cited violations have been fully corrected in certified shop bay. Invoices on file.');

  // New Inspection Upload Form State
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadFileSize, setUploadFileSize] = useState<string>('');
  const [reportNumber, setReportNumber] = useState<string>('PA-PSP-2026-994120');
  const [inspectionDate, setInspectionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [stateJurisdiction, setStateJurisdiction] = useState<string>('PA');
  const [highwayLocation, setHighwayLocation] = useState<string>('I-81 Northbound Weigh Station MM 77.4');
  const [inspectingAgency, setInspectingAgency] = useState<'STATE_POLICE' | 'DOT_COMMERCIAL_SAFETY' | 'HIGHWAY_PATROL' | 'FMCSA_FEDERAL' | 'CVSA_CERTIFIED'>('STATE_POLICE');
  const [inspectorName, setInspectorName] = useState<string>('Trooper C. Miller #4018');
  const [carrierUsDot, setCarrierUsDot] = useState<string>('USDOT #3948102');
  const [driverName, setDriverName] = useState<string>('Marcus Bell');
  const [driverCdl, setDriverCdl] = useState<string>('IL-CDLA-49102-IL');
  const [tractorUnit, setTractorUnit] = useState<string>('UNIT #104-E');
  const [trailerUnit, setTrailerUnit] = useState<string>('TRL-5390');
  const [inspectionLevel, setInspectionLevel] = useState<CvsaInspectionLevel>('LEVEL_1_COMPREHENSIVE');
  const [isCleanPass, setIsCleanPass] = useState<boolean>(true);
  const [outOfService, setOutOfService] = useState<boolean>(false);
  const [oosType, setOosType] = useState<'VEHICLE_OOS' | 'DRIVER_OOS' | 'BOTH_OOS' | 'NONE'>('NONE');
  const [violationsList, setViolationsList] = useState<RoadsideViolationItem[]>([]);

  // Temporary new violation input
  const [newCfrCode, setNewCfrCode] = useState<string>('49 CFR § 393.9');
  const [newViolDesc, setNewViolDesc] = useState<string>('');
  const [newViolTarget, setNewViolTarget] = useState<'TRACTOR' | 'TRAILER' | 'DRIVER'>('TRAILER');
  const [newViolOos, setNewViolOos] = useState<boolean>(false);

  useEffect(() => {
    setInspections(getStoredRoadsideInspections());
  }, []);

  // Handle Mock File Drag/Drop or Select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFileName(file.name);
      setUploadFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      // Simulate Smart OCR Auto-Extraction
      setStatusNotification(`OCR Document Scanner: Extracted data from ${file.name}`);
      setTimeout(() => setStatusNotification(null), 4000);
    }
  };

  // Add violation to draft inspection
  const handleAddViolation = () => {
    if (!newViolDesc.trim()) {
      alert('Please enter violation description.');
      return;
    }
    const newViol: RoadsideViolationItem = {
      id: `v-${Date.now()}`,
      codeCfr: newCfrCode,
      description: newViolDesc,
      unitTarget: newViolTarget,
      isOutOfService: newViolOos,
      severityWeight: newViolOos ? 7 : 3,
    };
    setViolationsList((prev) => [...prev, newViol]);
    setIsCleanPass(false);
    if (newViolOos) {
      setOutOfService(true);
      setOosType(newViolTarget === 'DRIVER' ? 'DRIVER_OOS' : 'VEHICLE_OOS');
    }
    setNewViolDesc('');
    setNewViolOos(false);
  };

  const handleRemoveViolation = (id: string) => {
    const updated = violationsList.filter((v) => v.id !== id);
    setViolationsList(updated);
    if (updated.length === 0) {
      setIsCleanPass(true);
      setOutOfService(false);
      setOosType('NONE');
    }
  };

  // Save new uploaded inspection
  const handleSaveUploadedInspection = () => {
    if (!reportNumber.trim() || !driverName.trim()) {
      alert('Please provide report number and driver name.');
      return;
    }

    const newRecord: RoadsideInspectionRecord = {
      id: `rsi-${Date.now().toString(36)}`,
      reportNumber,
      inspectionDate,
      inspectionTime: '10:30 EDT',
      stateJurisdiction,
      locationDescription: highwayLocation,
      highwayMileMarker: highwayLocation,
      inspectingAgency,
      inspectorNameAndBadge: inspectorName,
      carrierName: 'Truckwithease Fleet Logistics Corp',
      carrierUsDot,
      driverName,
      driverCdlNumber: driverCdl,
      driverCdlState: stateJurisdiction,
      tractorUnitNumber: tractorUnit,
      tractorVin: '1FUJGLDR8PL948201',
      tractorPlate: `${stateJurisdiction}-P99420`,
      trailerUnitNumber: trailerUnit,
      trailerPlate: `${stateJurisdiction}-TRL8839`,
      inspectionLevel,
      isCleanPass,
      isCvsaDecalIssued: isCleanPass && (inspectionLevel === 'LEVEL_1_COMPREHENSIVE' || inspectionLevel === 'LEVEL_5_VEHICLE_ONLY'),
      outOfService,
      oosType,
      violations: isCleanPass ? [] : violationsList,
      documentFileName: uploadFileName || `Inspection_${reportNumber}.pdf`,
      documentFileSize: uploadFileSize || '1.2 MB',
      documentFileType: 'application/pdf',
      uploadedAt: new Date().toLocaleString(),
      sentToCompany: false,
      sentToDot: false,
      dot15DayDeadlineDate: calculate15DayDeadline(inspectionDate),
      rewardPointsCredited: isCleanPass ? 150 : 0,
      statusNotes: isCleanPass ? 'Clean inspection uploaded. Ready to submit to company.' : 'Violations recorded. 15-day certification required.',
    };

    const updated = saveRoadsideInspection(newRecord);
    setInspections(updated);
    setIsUploadModalOpen(false);
    setStatusNotification(`Roadside Inspection #${reportNumber} uploaded successfully! Choose to Send to Company or DOT.`);
    setTimeout(() => setStatusNotification(null), 6000);
  };

  // Action: Transmit to Company / Safety Director
  const handleExecuteSendToCompany = () => {
    if (!activeActionRecord) return;

    const workOrderNumber = activeActionRecord.isCleanPass
      ? 'WO-CLEAN-PASS-VERIFIED'
      : `WO-ROADSIDE-${Math.floor(10000 + Math.random() * 90000)}`;

    const updatedRecord: RoadsideInspectionRecord = {
      ...activeActionRecord,
      sentToCompany: true,
      sentToCompanyTimestamp: new Date().toLocaleString(),
      companyRecipientEmail: companyEmail,
      companyWorkOrderId: workOrderNumber,
      statusNotes: activeActionRecord.isCleanPass
        ? `Sent to Fleet Safety (${companyEmail}). Awarded +150 EaseRewards points to driver ${activeActionRecord.driverName}.`
        : `Sent to Fleet Safety. Shop repair ticket ${workOrderNumber} automatically generated for cited defects.`,
    };

    const updatedList = saveRoadsideInspection(updatedRecord);
    setInspections(updatedList);
    setIsSendCompanyModalOpen(false);
    setStatusNotification(`Inspection #${activeActionRecord.reportNumber} transmitted to Company Safety (${companyEmail})! Repair ticket: ${workOrderNumber}`);
    setTimeout(() => setStatusNotification(null), 7000);
  };

  // Action: Transmit to DOT / State Highway Patrol (49 CFR § 396.9(d) 15-day certification)
  const handleExecuteSendToDot = () => {
    if (!activeActionRecord) return;

    const trackingId = `DOT-CERT-${activeActionRecord.stateJurisdiction}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const updatedRecord: RoadsideInspectionRecord = {
      ...activeActionRecord,
      sentToDot: true,
      sentToDotTimestamp: new Date().toLocaleString(),
      dotTransmittalTrackingId: trackingId,
      carrierCertifiedCorrectiveAction: {
        certifiedByName: dotCertifierName,
        certifiedByTitle: dotCertifierTitle,
        certifiedDate: new Date().toISOString().split('T')[0],
        repairDetailsNote: dotRepairSummary,
        signatureToken: `CERT-SIG-${dotCertifierName.replace(/\s+/g, '').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      },
      statusNotes: `Motor carrier certification signed by ${dotCertifierName} and transmitted to State DOT portal (Tracking: ${trackingId}) within statutory 15-day requirement (49 CFR § 396.9(d)).`,
    };

    const updatedList = saveRoadsideInspection(updatedRecord);
    setInspections(updatedList);
    setIsSendDotModalOpen(false);
    setStatusNotification(`Inspection #${activeActionRecord.reportNumber} certified & submitted to State DOT! Tracking Receipt: ${trackingId}`);
    setTimeout(() => setStatusNotification(null), 8000);
  };

  // Filtered Inspections
  const filteredInspections = inspections.filter((ins) => {
    const matchesSearch =
      ins.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ins.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ins.tractorUnitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ins.stateJurisdiction.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesHauler =
      selectedHaulerFilter === 'ALL' ||
      ins.trailerUnitNumber.toLowerCase().includes(selectedHaulerFilter.toLowerCase()) ||
      ins.violations.some((v) => v.description.toLowerCase().includes(selectedHaulerFilter.toLowerCase()));

    if (!matchesSearch || !matchesHauler) return false;
    if (filterType === 'ALL') return true;
    if (filterType === 'CLEAN') return ins.isCleanPass;
    if (filterType === 'VIOLATIONS') return !ins.isCleanPass && !ins.outOfService;
    if (filterType === 'OOS') return ins.outOfService;
    return true;
  });

  const cleanPassCount = inspections.filter((i) => i.isCleanPass).length;
  const oosCount = inspections.filter((i) => i.outOfService).length;
  const violationsCount = inspections.filter((i) => !i.isCleanPass).length;

  return (
    <div className="flex flex-col w-full pb-20 px-3 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner / Header */}
      <div className="border-b border-[#222] pb-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                FMCSA 49 CFR § 396.9 &amp; CVSA LEVEL 1-6
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 uppercase flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-400" />
                OFFICIAL ROADSIDE INSPECTIONS PORTAL
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-sky-400 bg-sky-950/70 border border-sky-800/80 uppercase">
                15-DAY STATUTORY CERTIFICATION DISPATCH
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <UploadCloud className="w-7 h-7 text-[#D4AF37]" />
              Roadside Inspection Upload &amp; Transmittal Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#888] mt-1 max-w-3xl">
              Upload state trooper and CVSA inspection reports, extract cited equipment and HOS violations, and immediately dispatch certified copies to <strong className="text-white">your Company Safety Department</strong> or the <strong className="text-[#D4AF37]">State DOT / FMCSA</strong> within the statutory 15-day certification deadline (49 CFR § 396.9(d)).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsPrior7DaysDossierOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-wider transition shadow-lg shadow-emerald-950 flex items-center gap-2 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              1-Click 7-Day Inspection Dossier
            </button>
            <button
              onClick={() => setIsMovingClipsOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-wider transition shadow-lg shadow-indigo-950 flex items-center gap-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              Moving Clips (Do's & Don'ts)
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#c49f27] text-black font-black uppercase text-xs tracking-wider transition shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2"
            >
              <FileUp className="w-4 h-4" />
              Upload Inspection Report
            </button>
          </div>
        </div>

        {statusNotification && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-mono flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {statusNotification}
            </span>
            <button onClick={() => setStatusNotification(null)} className="text-emerald-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#111] border border-[#222]">
          <div className="text-[10px] font-mono text-[#777] uppercase font-bold">Total Inspections</div>
          <div className="text-2xl font-black text-white mt-1 font-mono">{inspections.length}</div>
          <div className="text-[10px] text-[#888] mt-0.5">Recorded in Fleet Vault</div>
        </div>
        <div className="p-4 rounded-xl bg-[#111] border border-[#222]">
          <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Clean Passes (Zero Defect)
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">{cleanPassCount}</div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">CVSA Decals &amp; Rewards</div>
        </div>
        <div className="p-4 rounded-xl bg-[#111] border border-[#222]">
          <div className="text-[10px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Defects Cited
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1 font-mono">{violationsCount}</div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">Work Orders Generated</div>
        </div>
        <div className="p-4 rounded-xl bg-[#111] border border-[#222]">
          <div className="text-[10px] font-mono text-rose-400 uppercase font-bold flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            Out-of-Service (OOS)
          </div>
          <div className="text-2xl font-black text-rose-400 mt-1 font-mono">{oosCount}</div>
          <div className="text-[10px] text-rose-400/80 mt-0.5">All Cleared &amp; Certified</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#111] border border-[#262626] rounded-xl">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterType === 'ALL'
                ? 'bg-[#D4AF37] text-black font-black'
                : 'bg-[#181818] text-[#888] hover:text-white border border-[#282828]'
            }`}
          >
            All Reports ({inspections.length})
          </button>
          <button
            onClick={() => setFilterType('CLEAN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              filterType === 'CLEAN'
                ? 'bg-emerald-500 text-black font-black'
                : 'bg-[#181818] text-[#888] hover:text-white border border-[#282828]'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Clean Passes ({cleanPassCount})
          </button>
          <button
            onClick={() => setFilterType('VIOLATIONS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              filterType === 'VIOLATIONS'
                ? 'bg-amber-500 text-black font-black'
                : 'bg-[#181818] text-[#888] hover:text-white border border-[#282828]'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Violations Cited ({violationsCount})
          </button>
          <button
            onClick={() => setFilterType('OOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              filterType === 'OOS'
                ? 'bg-rose-600 text-white font-black'
                : 'bg-[#181818] text-[#888] hover:text-white border border-[#282828]'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            Out-of-Service ({oosCount})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Hauler Type Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedHaulerFilter}
              onChange={(e) => setSelectedHaulerFilter(e.target.value)}
              className="bg-[#181818] border border-[#333] hover:border-cyan-500/60 text-xs font-mono text-cyan-200 px-2.5 py-1.5 rounded-lg outline-none cursor-pointer"
            >
              <option value="ALL">All Hauler Types</option>
              <option value="Flatbed">Flatbed (49 CFR § 393)</option>
              <option value="Van">Dry Van (53&apos; Freight)</option>
              <option value="Box">Box Truck (16&apos;-26&apos; Liftgate)</option>
              <option value="Cargo">Cargo / Sprinter Van</option>
              <option value="Hotshot">Hotshot Flatbed</option>
              <option value="Reefer">Reefer (FSMA)</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#666]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search report #, driver, state..."
              className="w-full bg-[#181818] border border-[#333] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-[#666] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Roadside Inspections Ledger */}
      <div className="space-y-4">
        {filteredInspections.length === 0 ? (
          <div className="p-12 rounded-xl bg-[#111] border border-[#222] text-center space-y-3">
            <FileText className="w-10 h-10 text-[#555] mx-auto" />
            <div className="text-sm font-bold text-white">No roadside inspection reports found</div>
            <p className="text-xs text-[#888] max-w-md mx-auto">
              Upload your state highway patrol or CVSA scale inspection report to log violations, submit corrective certification to DOT, or alert fleet safety.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#D4AF37] text-black font-bold uppercase text-xs"
            >
              Upload Inspection Now
            </button>
          </div>
        ) : (
          filteredInspections.map((ins) => (
            <div
              key={ins.id}
              className="p-5 rounded-xl bg-[#111] border border-[#262626] hover:border-[#383838] transition space-y-4"
            >
              {/* Header Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#222] pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-white font-mono tracking-tight">
                      Report #{ins.reportNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase">
                      {ins.inspectionLevel.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#222] text-[#ccc]">
                      State: {ins.stateJurisdiction}
                    </span>
                    {ins.isCleanPass ? (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        CLEAN PASS · ZERO DEFECTS
                      </span>
                    ) : ins.outOfService ? (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold text-rose-300 bg-rose-950/80 border border-rose-800 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-rose-400" />
                        OUT OF SERVICE ({ins.oosType})
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        {ins.violations.length} VIOLATIONS CITED
                      </span>
                    )}

                    {ins.isCvsaDecalIssued && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        CVSA SAFETY DECAL ISSUED
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#888] flex items-center gap-3 flex-wrap">
                    <span>
                      Date: <strong className="text-white">{ins.inspectionDate}</strong> ({ins.inspectionTime})
                    </span>
                    <span>•</span>
                    <span>
                      Driver: <strong className="text-[#ccc]">{ins.driverName}</strong> ({ins.driverCdlNumber})
                    </span>
                    <span>•</span>
                    <span>
                      Equipment: <strong className="text-[#ccc]">{ins.tractorUnitNumber}</strong> / {ins.trailerUnitNumber}
                    </span>
                    <span>•</span>
                    <span>
                      Facility: <span className="text-[#aaa]">{ins.locationDescription}</span>
                    </span>
                  </div>
                </div>

                {/* Transmittal Status Indicators & Quick Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Send to Company Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveActionRecord(ins);
                      setIsSendCompanyModalOpen(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1.5 ${
                      ins.sentToCompany
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                        : 'bg-[#181818] hover:bg-[#252525] text-[#ccc] border border-[#333] hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-sky-400" />
                    {ins.sentToCompany ? 'Company Received ✓' : 'Send to Company'}
                  </button>

                  {/* Send to DOT Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveActionRecord(ins);
                      setIsSendDotModalOpen(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1.5 ${
                      ins.sentToDot
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                        : 'bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black border border-[#D4AF37]/40'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {ins.sentToDot ? 'DOT Certified ✓' : 'Send to DOT (15d)'}
                  </button>

                  {/* View Details */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInspection(ins);
                      setIsDetailModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-[#181818] hover:bg-[#252525] text-[#aaa] hover:text-white border border-[#333]"
                    title="View Inspection Report"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Violations List (if any) */}
              {ins.violations.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-mono text-[#888] uppercase font-bold block">
                    Cited Defect Items ({ins.violations.length}):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {ins.violations.map((v) => (
                      <div
                        key={v.id}
                        className="p-2.5 rounded-lg bg-[#151515] border border-[#262626] text-xs flex items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800/80">
                              {v.codeCfr}
                            </span>
                            <span className="text-[10px] font-mono text-[#777] uppercase font-bold">
                              [{v.unitTarget}]
                            </span>
                            {v.isOutOfService && (
                              <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-950 px-1 rounded border border-rose-800">
                                OOS
                              </span>
                            )}
                          </div>
                          <div className="text-white text-xs">{v.description}</div>
                          {v.actionTakenNotes && (
                            <div className="text-[11px] text-emerald-400/90 pt-0.5">
                              ✓ Corrective Action: {v.actionTakenNotes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transmittal Status Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#1a1a1a] text-[11px] font-mono">
                <div className="text-[#777] flex items-center gap-3 flex-wrap">
                  {ins.documentFileName && (
                    <span className="flex items-center gap-1 text-[#aaa]">
                      <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {ins.documentFileName} ({ins.documentFileSize})
                    </span>
                  )}
                  <span>•</span>
                  <span>
                    15-Day Statutory Deadline: <strong className="text-white">{ins.dot15DayDeadlineDate}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {ins.sentToCompany && (
                    <span className="text-sky-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Company: {ins.companyWorkOrderId}
                    </span>
                  )}
                  {ins.sentToDot && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      DOT Transmitted: {ins.dotTransmittalTrackingId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: UPLOAD INSPECTION REPORT WITH OCR SIMULATOR */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#0f0f0f] border border-[#2b2b2b] rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 relative text-white font-sans max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 text-[#888] hover:text-white p-1 rounded-lg hover:bg-[#222]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#D4AF37] uppercase">
                <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
                Document Intake &amp; OCR Inspection Ingestion
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white mt-0.5">
                Upload Roadside Inspection Report
              </h2>
              <p className="text-xs text-[#888] mt-1">
                Upload a PDF, smartphone camera photo, or scan of your Driver/Vehicle Examination Report.
              </p>
            </div>

            {/* Drag & Drop File Zone */}
            <div className="p-6 rounded-xl border-2 border-dashed border-[#333] hover:border-[#D4AF37] bg-[#141414] text-center space-y-2 cursor-pointer transition relative">
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileUp className="w-8 h-8 text-[#D4AF37] mx-auto" />
              <div className="text-xs font-bold text-white">
                {uploadFileName ? uploadFileName : 'Drop PDF or photo of inspection here, or click to browse'}
              </div>
              <p className="text-[11px] text-[#777]">
                Supports CVSA Form, State Highway Patrol examination slips, PDF, JPG, PNG up to 25 MB
              </p>
              {uploadFileName && (
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  ✓ File Selected: {uploadFileName} ({uploadFileSize})
                </div>
              )}
            </div>

            {/* Extracted / Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">
                  Inspection Report Number
                </label>
                <input
                  type="text"
                  value={reportNumber}
                  onChange={(e) => setReportNumber(e.target.value)}
                  className="w-full bg-[#181818] border border-[#333] rounded px-2.5 py-1.5 text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                  placeholder="e.g. PA-PSP-2026-904128"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">
                  State Jurisdiction
                </label>
                <input
                  type="text"
                  value={stateJurisdiction}
                  onChange={(e) => setStateJurisdiction(e.target.value.toUpperCase())}
                  maxLength={2}
                  className="w-full bg-[#181818] border border-[#333] rounded px-2.5 py-1.5 text-white font-mono uppercase focus:border-[#D4AF37] focus:outline-none"
                  placeholder="PA"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">
                  Inspection Level
                </label>
                <select
                  value={inspectionLevel}
                  onChange={(e) => setInspectionLevel(e.target.value as any)}
                  className="w-full bg-[#181818] border border-[#333] rounded px-2.5 py-1.5 text-white focus:border-[#D4AF37] focus:outline-none text-xs"
                >
                  <option value="LEVEL_1_COMPREHENSIVE">Level 1 - Full Standard Inspection</option>
                  <option value="LEVEL_2_WALKAROUND">Level 2 - Walk-Around Driver &amp; Vehicle</option>
                  <option value="LEVEL_3_DRIVER_CREDENTIALS">Level 3 - Driver Only (Credentials &amp; HOS)</option>
                  <option value="LEVEL_4_SPECIAL">Level 4 - Special One-Time Study</option>
                  <option value="LEVEL_5_VEHICLE_ONLY">Level 5 - Vehicle-Only Inspection</option>
                  <option value="LEVEL_6_HAZMAT">Level 6 - Enhanced Radioactive &amp; HazMat</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">
                  Inspecting Agency
                </label>
                <select
                  value={inspectingAgency}
                  onChange={(e) => setInspectingAgency(e.target.value as any)}
                  className="w-full bg-[#181818] border border-[#333] rounded px-2.5 py-1.5 text-white focus:border-[#D4AF37] focus:outline-none text-xs"
                >
                  <option value="STATE_POLICE">State Police / Highway Patrol</option>
                  <option value="DOT_COMMERCIAL_SAFETY">State DOT Motor Carrier Safety</option>
                  <option value="FMCSA_FEDERAL">FMCSA Federal Safety Investigator</option>
                  <option value="CVSA_CERTIFIED">CVSA Certified Municipal Officer</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">
                  Driver Name &amp; CDL
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-1/2 bg-[#181818] border border-[#333] rounded px-2 py-1.5 text-white focus:border-[#D4AF37] focus:outline-none"
                    placeholder="Marcus Bell"
                  />
                  <input
                    type="text"
                    value={driverCdl}
                    onChange={(e) => setDriverCdl(e.target.value)}
                    className="w-1/2 bg-[#181818] border border-[#333] rounded px-2 py-1.5 text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                    placeholder="CDL Number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">
                  Tractor &amp; Trailer Units
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={tractorUnit}
                    onChange={(e) => setTractorUnit(e.target.value)}
                    className="w-1/2 bg-[#181818] border border-[#333] rounded px-2 py-1.5 text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                    placeholder="TR-104"
                  />
                  <input
                    type="text"
                    value={trailerUnit}
                    onChange={(e) => setTrailerUnit(e.target.value)}
                    className="w-1/2 bg-[#181818] border border-[#333] rounded px-2 py-1.5 text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                    placeholder="TRL-5390"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">
                  Highway Location / Weigh Station Description
                </label>
                <input
                  type="text"
                  value={highwayLocation}
                  onChange={(e) => setHighwayLocation(e.target.value)}
                  className="w-full bg-[#181818] border border-[#333] rounded px-2.5 py-1.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  placeholder="e.g. I-80 EB Scale #4 Mile Marker 135"
                />
              </div>
            </div>

            {/* Clean Pass Toggle */}
            <div className="p-3 rounded-xl bg-[#141414] border border-[#2b2b2b] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Clean Inspection (Zero Violations)
                </div>
                <div className="text-[10px] text-[#888]">
                  Clean Level 1, 2, or 3 inspections automatically qualify for EaseRewards points (+150 PTS).
                </div>
              </div>
              <input
                type="checkbox"
                checked={isCleanPass}
                onChange={(e) => {
                  setIsCleanPass(e.target.checked);
                  if (e.target.checked) {
                    setViolationsList([]);
                    setOutOfService(false);
                    setOosType('NONE');
                  }
                }}
                className="w-5 h-5 accent-[#D4AF37] rounded"
              />
            </div>

            {/* Violation Builder (If not clean) */}
            {!isCleanPass && (
              <div className="p-3 rounded-xl bg-[#151515] border border-amber-900/40 space-y-3">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Log Cited Defect Item
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <input
                      type="text"
                      value={newCfrCode}
                      onChange={(e) => setNewCfrCode(e.target.value)}
                      placeholder="CFR (e.g. 49 CFR § 393.9)"
                      className="w-full bg-[#1c1c1c] border border-[#333] rounded px-2 py-1 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <select
                      value={newViolTarget}
                      onChange={(e) => setNewViolTarget(e.target.value as any)}
                      className="w-full bg-[#1c1c1c] border border-[#333] rounded px-2 py-1 text-white text-xs"
                    >
                      <option value="TRAILER">Trailer Item</option>
                      <option value="TRACTOR">Tractor Item</option>
                      <option value="DRIVER">Driver Credentials / HOS</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-rose-400 flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newViolOos}
                        onChange={(e) => setNewViolOos(e.target.checked)}
                        className="accent-rose-500"
                      />
                      <span>Out-of-Service (OOS)</span>
                    </label>
                  </div>
                  <div className="sm:col-span-3 flex gap-2">
                    <input
                      type="text"
                      value={newViolDesc}
                      onChange={(e) => setNewViolDesc(e.target.value)}
                      placeholder="Violation description (e.g. Inoperative tail lamp on rear bumper)"
                      className="flex-1 bg-[#1c1c1c] border border-[#333] rounded px-2 py-1 text-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddViolation}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded"
                    >
                      Add Defect
                    </button>
                  </div>
                </div>

                {/* List of draft violations */}
                {violationsList.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {violationsList.map((v) => (
                      <div key={v.id} className="flex items-center justify-between p-2 rounded bg-[#1c1c1c] text-xs">
                        <span className="text-[#ccc]">
                          <strong className="text-amber-400 font-mono">{v.codeCfr}</strong>: {v.description} [{v.unitTarget}] {v.isOutOfService && '⚠️ OOS'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveViolation(v.id)}
                          className="text-rose-400 hover:text-white"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#222] text-[#aaa] hover:text-white text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUploadedInspection}
                className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#c49f27] text-black font-black uppercase text-xs tracking-wider"
              >
                Save &amp; Ingest Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SEND TO COMPANY / SAFETY DIRECTOR */}
      {isSendCompanyModalOpen && activeActionRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0f0f0f] border border-[#2b2b2b] rounded-2xl shadow-2xl p-6 space-y-5 relative text-white font-sans">
            <button
              onClick={() => setIsSendCompanyModalOpen(false)}
              className="absolute top-4 right-4 text-[#888] hover:text-white p-1 rounded-lg hover:bg-[#222]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 uppercase">
                <Building2 className="w-4 h-4 text-sky-400" />
                Company Dispatch &amp; Safety Desk
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-white mt-0.5">
                Send Roadside Inspection to Company
              </h2>
              <p className="text-xs text-[#888] mt-1">
                Transmit inspection report #{activeActionRecord.reportNumber} to fleet safety management, auto-generate maintenance work orders, and record driver safety points.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626] space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#777]">Report Number:</span>
                <span className="text-white font-bold">{activeActionRecord.reportNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777]">Driver:</span>
                <span className="text-white">{activeActionRecord.driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777]">Result:</span>
                <span className={activeActionRecord.isCleanPass ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {activeActionRecord.isCleanPass ? 'CLEAN PASS (+150 PTS REWARD)' : `${activeActionRecord.violations.length} VIOLATIONS`}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">
                  Recipient Safety Email
                </label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full bg-[#181818] border border-[#333] rounded px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">
                  Transmittal Notes
                </label>
                <textarea
                  rows={2}
                  value={companyNotes}
                  onChange={(e) => setCompanyNotes(e.target.value)}
                  className="w-full bg-[#181818] border border-[#333] rounded p-2 text-white text-xs focus:border-sky-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSendCompanyModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#222] text-[#aaa] hover:text-white text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSendToCompany}
                className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-black uppercase text-xs tracking-wider flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Confirm &amp; Send to Company
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SEND TO DOT / STATE HIGHWAY PATROL (15-DAY CERTIFICATION) */}
      {isSendDotModalOpen && activeActionRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-xl bg-[#0f0f0f] border-2 border-[#D4AF37]/60 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 relative text-white font-sans">
            <button
              onClick={() => setIsSendDotModalOpen(false)}
              className="absolute top-4 right-4 text-[#888] hover:text-white p-1 rounded-lg hover:bg-[#222]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#D4AF37] uppercase">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                FMCSA 49 CFR § 396.9(d) STATUTORY RETURN
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white mt-0.5">
                Certify &amp; Return to DOT / State Agency
              </h2>
              <p className="text-xs text-[#888] mt-1 leading-relaxed">
                Federal regulation 49 CFR § 396.9(d) requires the motor carrier to complete the certification of corrective action and return the signed report to the issuing authority within <strong className="text-[#D4AF37]">15 calendar days</strong>.
              </p>
            </div>

            {/* 15-Day Countdown Badge */}
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-center justify-between text-xs">
              <span className="text-amber-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Statutory 15-Day Return Deadline:
              </span>
              <span className="font-mono font-bold text-white bg-amber-900/60 px-2 py-0.5 rounded">
                {activeActionRecord.dot15DayDeadlineDate}
              </span>
            </div>

            {/* Certification Inputs */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">
                    Certifying Carrier Official Name
                  </label>
                  <input
                    type="text"
                    value={dotCertifierName}
                    onChange={(e) => setDotCertifierName(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] rounded px-2.5 py-1.5 text-white font-medium focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">
                    Title of Certifying Official
                  </label>
                  <input
                    type="text"
                    value={dotCertifierTitle}
                    onChange={(e) => setDotCertifierTitle(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] rounded px-2.5 py-1.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#777] uppercase mb-1">
                  Certification Statement &amp; Corrective Action Description
                </label>
                <textarea
                  rows={3}
                  value={dotRepairSummary}
                  onChange={(e) => setDotRepairSummary(e.target.value)}
                  className="w-full bg-[#181818] border border-[#333] rounded p-2 text-white text-xs focus:border-[#D4AF37] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#141414] border border-[#2b2b2b] text-[10px] text-[#888] space-y-1">
                <span className="font-mono text-[#D4AF37] font-bold block uppercase">
                  Motor Carrier Legal Certification:
                </span>
                <p>
                  "I certify under penalty of perjury that all violations cited on Driver/Vehicle Examination Report #{activeActionRecord.reportNumber} have been corrected and that the vehicle and driver are in compliance with 49 CFR Part 396."
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSendDotModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#222] text-[#aaa] hover:text-white text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSendToDot}
                className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#c49f27] text-black font-black uppercase text-xs tracking-wider flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Sign &amp; Transmit to State DOT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DETAILED INSPECTION REPORT VIEW */}
      {isDetailModalOpen && selectedInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#0f0f0f] border border-[#2b2b2b] rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 relative text-white font-sans max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute top-4 right-4 text-[#888] hover:text-white p-1 rounded-lg hover:bg-[#222]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#222] pb-3">
              <span className="text-xs font-mono text-[#D4AF37] font-bold uppercase">
                Official Driver / Vehicle Examination Record
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight text-white mt-0.5">
                Inspection Report #{selectedInspection.reportNumber}
              </h2>
              <div className="text-xs text-[#888] mt-0.5">
                {selectedInspection.stateJurisdiction} · {selectedInspection.inspectingAgency.replace(/_/g, ' ')} · {selectedInspection.inspectorNameAndBadge}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-[#141414] p-3 rounded-xl border border-[#222]">
              <div>
                <span className="text-[#666] text-[10px] uppercase block">Date &amp; Location:</span>
                <span className="text-white">{selectedInspection.inspectionDate} · {selectedInspection.locationDescription}</span>
              </div>
              <div>
                <span className="text-[#666] text-[10px] uppercase block">Driver Credentials:</span>
                <span className="text-white">{selectedInspection.driverName} ({selectedInspection.driverCdlNumber})</span>
              </div>
              <div>
                <span className="text-[#666] text-[10px] uppercase block">Tractor Unit &amp; VIN:</span>
                <span className="text-white">{selectedInspection.tractorUnitNumber} ({selectedInspection.tractorVin})</span>
              </div>
              <div>
                <span className="text-[#666] text-[10px] uppercase block">Trailer Unit:</span>
                <span className="text-white">{selectedInspection.trailerUnitNumber}</span>
              </div>
            </div>

            {/* Violations Section */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-white uppercase block">
                Violations &amp; Defect Items ({selectedInspection.violations.length}):
              </span>
              {selectedInspection.violations.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs text-center font-bold">
                  ✓ ZERO VIOLATIONS RECORDED · CLEAN CVSA EXAMINATION
                </div>
              ) : (
                selectedInspection.violations.map((v) => (
                  <div key={v.id} className="p-3 rounded-xl bg-[#151515] border border-[#262626] text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-400 font-bold">{v.codeCfr}</span>
                      <span className="text-[#888]">[{v.unitTarget}]</span>
                      {v.isOutOfService && <span className="text-rose-400 font-bold bg-rose-950 px-1.5 py-0.2 rounded border border-rose-800 text-[10px]">OOS</span>}
                    </div>
                    <div className="text-white">{v.description}</div>
                    {v.actionTakenNotes && <div className="text-emerald-400 text-[11px]">Action: {v.actionTakenNotes}</div>}
                  </div>
                ))
              )}
            </div>

            {/* Transmittal Receipts */}
            <div className="p-3 rounded-xl bg-[#141414] border border-[#222] space-y-2 text-xs font-mono">
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold block">
                Transmission Proof &amp; Audit Trail:
              </span>
              <div className="flex justify-between text-[#aaa]">
                <span>Company Dispatch Received:</span>
                <span className="text-white">{selectedInspection.sentToCompany ? `${selectedInspection.sentToCompanyTimestamp} (${selectedInspection.companyWorkOrderId})` : 'Not yet transmitted'}</span>
              </div>
              <div className="flex justify-between text-[#aaa]">
                <span>State DOT 15-Day Certified:</span>
                <span className="text-white">{selectedInspection.sentToDot ? `${selectedInspection.sentToDotTimestamp} (Tracking: ${selectedInspection.dotTransmittalTrackingId})` : 'Pending certification'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#222] hover:bg-[#333] text-white text-xs font-bold uppercase"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Prior 7 Days Random Inspection Dossier Modal */}
      <Prior7DaysInspectionDossierModal
        isOpen={isPrior7DaysDossierOpen}
        onClose={() => setIsPrior7DaysDossierOpen(false)}
        driverName="Marcus Bell"
        unitNumber="UNIT #104-E"
      />

      {/* Pre/Post-Trip Inspection Moving Clips Studio Modal */}
      <InspectionMovingClipsModal
        isOpen={isMovingClipsOpen}
        onClose={() => setIsMovingClipsOpen(false)}
      />
    </div>
  );
};
