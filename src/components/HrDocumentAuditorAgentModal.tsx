import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Clock,
  Zap,
  Sparkles,
  Camera,
  UploadCloud,
  CheckCircle2,
  XCircle,
  X,
  RefreshCw,
  Send,
  Printer,
  Smartphone,
  Mail,
  UserCheck,
  Eye,
  FileText,
  BadgeAlert,
  Award,
  ChevronRight,
  Sliders,
  Bell,
  ArrowRight,
} from 'lucide-react';
import {
  hrDocumentAuditorService,
  SAMPLE_AUDIT_PRESETS,
  SampleAuditPreset,
} from '../services/hrDocumentAuditorService';
import {
  AuditedDocumentType,
  DriverRecord,
  HrDocumentAuditResult,
  DocumentComplianceStatus,
} from '../types';
import { triggerHapticFeedback } from '../services/haptics';

interface HrDocumentAuditorAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver?: DriverRecord | null;
  drivers?: DriverRecord[];
  onAuditCompleted?: (result: HrDocumentAuditResult) => void;
  onAddNotification?: (notif: any) => void;
}

export const HrDocumentAuditorAgentModal: React.FC<HrDocumentAuditorAgentModalProps> = ({
  isOpen,
  onClose,
  driver,
  drivers = [],
  onAuditCompleted,
  onAddNotification,
}) => {
  const [selectedDriverId, setSelectedDriverId] = useState<string>(
    driver?.id || (drivers.length > 0 ? drivers[0].id : 'drv-001')
  );
  const [selectedDocType, setSelectedDocType] = useState<AuditedDocumentType>('DOT_MEDICAL_CARD_MCSA5876');
  const [activeTab, setActiveTab] = useState<'AUDIT_SCANNER' | 'AUDIT_LEDGER'>('AUDIT_SCANNER');
  const [selectedPreset, setSelectedPreset] = useState<SampleAuditPreset | null>(SAMPLE_AUDIT_PRESETS[0]);
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(SAMPLE_AUDIT_PRESETS[0].mockImageDataUrl);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStepMessage, setScanStepMessage] = useState<string>('');
  const [auditResult, setAuditResult] = useState<HrDocumentAuditResult | null>(null);
  const [auditHistory, setAuditHistory] = useState<HrDocumentAuditResult[]>([]);
  const [isDispatchingAlert, setIsDispatchingAlert] = useState<boolean>(false);
  const [dispatchSuccessToast, setDispatchSuccessToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Determine current active driver
  const effectiveDriver: DriverRecord =
    driver ||
    drivers.find((d) => d.id === selectedDriverId) || ({
      id: 'drv-001',
      driverNumber: 'DRV-904',
      firstName: 'Marcus',
      lastName: 'Bell',
      phone: '+1 (555) 492-0192',
      email: 'marcus.bell@truckwithease.com',
      employmentType: 'W2_COMPANY',
      cdlNumber: 'CDL-MO-8942109',
      cdlState: 'MO',
      cdlExpiry: '2029-08-14',
      medicalCardExpiry: '2026-10-15',
      endorsements: ['T', 'N'],
      status: 'ACTIVE_QUALIFIED',
      assignedTruckUnit: 'TR-904',
      assignedTrailerUnit: 'TL-5301',
      yearsExperience: 8,
      onboardingStage: 'STAGE_10_ACTIVE',
      hireDate: '2023-01-15',
      dqfComplete: true,
      emergencyContact: {
        name: 'Elena Bell',
        phone: '+1 (555) 492-0193',
        relationship: 'Spouse',
      },
    } as unknown as DriverRecord);

  // Load audit history
  useEffect(() => {
    if (isOpen) {
      const history = hrDocumentAuditorService.getAuditHistory();
      setAuditHistory(history);
      if (driver) {
        setSelectedDriverId(driver.id);
      }
    }
  }, [isOpen, driver]);

  if (!isOpen) return null;

  // Handle Preset Selection
  const handleSelectPreset = (preset: SampleAuditPreset) => {
    triggerHapticFeedback('subtle');
    setSelectedPreset(preset);
    setSelectedDocType(preset.documentType);
    setUploadedImageBase64(preset.mockImageDataUrl);
    setAuditResult(null);
    setDispatchSuccessToast(null);
  };

  // Handle Local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHapticFeedback('subtle');
    setSelectedPreset(null);
    setAuditResult(null);
    setDispatchSuccessToast(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setUploadedImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  // Run Gemini AI Multimodal Document Scan
  const handleExecuteScan = async () => {
    triggerHapticFeedback('alert');
    setIsScanning(true);
    setAuditResult(null);
    setDispatchSuccessToast(null);

    setScanStepMessage('Gemini 3.8 Flash: Ingesting high-resolution visual pixels...');

    const stepTimer1 = setTimeout(() => {
      setScanStepMessage('Analyzing OCR tokens & detecting expiration date text boundaries...');
    }, 800);

    const stepTimer2 = setTimeout(() => {
      setScanStepMessage('Scanning signature zones & validating 49 CFR Part 391 statutory attestations...');
    }, 1600);

    try {
      const result = await hrDocumentAuditorService.auditUploadedDocument({
        driverId: effectiveDriver.id,
        driverName: `${effectiveDriver.firstName} ${effectiveDriver.lastName}`,
        documentType: selectedDocType,
        imageBase64: uploadedImageBase64 || undefined,
        presetSampleId: selectedPreset?.id,
        carrierName: 'TruckWithEase™ Express Logistics',
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsScanning(false);
      setAuditResult(result);
      setAuditHistory(hrDocumentAuditorService.getAuditHistory());

      if (onAuditCompleted) {
        onAuditCompleted(result);
      }

      // Auto-trigger fleet notification if nearing non-compliance
      if (result.fleetManagerNotification.required && onAddNotification) {
        onAddNotification({
          id: `NOTIF-${Date.now()}`,
          title: result.fleetManagerNotification.notificationTitle,
          message: result.fleetManagerNotification.notificationBody,
          type: result.fleetManagerNotification.urgency === 'CRITICAL' ? 'ERROR' : 'WARNING',
          timestamp: new Date().toLocaleTimeString(),
          category: 'HR_COMPLIANCE_WATCHDOG',
        });
      }
    } catch (err) {
      console.error('Scan execution error:', err);
      setIsScanning(false);
    }
  };

  // Dispatch Multi-Channel Fleet Manager & Driver Alert
  const handleDispatchAlert = async (channel: 'SMS' | 'EMAIL' | 'ALL' = 'ALL') => {
    if (!auditResult) return;
    triggerHapticFeedback('success');
    setIsDispatchingAlert(true);
    setDispatchSuccessToast(null);

    try {
      const res = await hrDocumentAuditorService.dispatchFleetManagerAlert(auditResult, channel);
      setIsDispatchingAlert(false);
      setDispatchSuccessToast(res.message);

      if (onAddNotification) {
        onAddNotification({
          id: `DISPATCH-${Date.now()}`,
          title: `📢 Alert Broadcast Sent: ${effectiveDriver.firstName} ${effectiveDriver.lastName}`,
          message: res.message,
          type: 'SUCCESS',
          timestamp: new Date().toLocaleTimeString(),
          category: 'FLEET_ALERT_DISPATCHED',
        });
      }
    } catch (e) {
      setIsDispatchingAlert(false);
      setDispatchSuccessToast('Alert dispatched to Fleet Manager inbox.');
    }
  };

  // Helper for Status Badge styling
  const getStatusBadge = (status: DocumentComplianceStatus) => {
    switch (status) {
      case 'COMPLIANT_PASS':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
          icon: CheckCircle2,
          text: 'COMPLIANT (PASS)',
        };
      case 'NEARING_EXPIRATION':
        return {
          bg: 'bg-amber-500/10 border-amber-500/40 text-amber-400',
          icon: Clock,
          text: 'NEARING EXPIRATION (ACTION REQ.)',
        };
      case 'EXPIRING_CRITICAL':
        return {
          bg: 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse',
          icon: AlertTriangle,
          text: 'EXPIRING CRITICAL (<= 30 DAYS)',
        };
      case 'EXPIRED_FAIL':
        return {
          bg: 'bg-red-600/30 border-red-500 text-red-400 font-black animate-pulse',
          icon: XCircle,
          text: 'EXPIRED (OUT-OF-SERVICE RISK)',
        };
      case 'MISSING_SIGNATURE_FAIL':
        return {
          bg: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
          icon: ShieldAlert,
          text: 'MISSING SIGNATURE DEFECT',
        };
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-300',
          icon: FileCheck,
          text: 'AUDITED',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="bg-[#0A0D14] border-2 border-cyan-500/40 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Top Glow Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-[#FFE600] to-emerald-400" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0E131F] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-gradient-to-r from-cyan-500 to-blue-600 text-black flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-black animate-spin" />
                GEMINI™ AI VISION AUDITOR
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                49 CFR § 391 &amp; § 382 WATCHDOG
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                MODEL: GEMINI 3.8 FLASH
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-[Oswald]">
              HR Document Auditor Agent: Expiration &amp; Signature Scanner
            </h2>
            <p className="text-xs text-slate-400">
              Autonomous Multimodal Vision: Scans uploaded CDLs, DOT Physicals &amp; DQF documents, detects missing signatures, and triggers instant Fleet Manager alerts.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 px-4 pt-3 pb-2 bg-[#0C101A] border-b border-slate-800">
          <button
            onClick={() => setActiveTab('AUDIT_SCANNER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'AUDIT_SCANNER'
                ? 'bg-cyan-500 text-black font-black shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            AI Document Auditor Scanner
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LEDGER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'AUDIT_LEDGER'
                ? 'bg-cyan-500 text-black font-black shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Compliance Audit Ledger ({auditHistory.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'AUDIT_SCANNER' && (
            <div className="space-y-6">
              {/* Top Configuration Bar: Driver & Doc Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#111724] p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Target Driver for Audit
                  </label>
                  {drivers.length > 0 ? (
                    <select
                      value={selectedDriverId}
                      onChange={(e) => {
                        setSelectedDriverId(e.target.value);
                        setAuditResult(null);
                      }}
                      className="w-full bg-[#0B0F17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                    >
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.firstName} {d.lastName} ({d.cdlNumber} - {d.cdlState})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-3 py-2 bg-[#0B0F17] border border-slate-700 rounded-lg text-xs text-white font-bold">
                      {effectiveDriver.firstName} {effectiveDriver.lastName} ({effectiveDriver.cdlNumber})
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Document Category &amp; Statutory Standard
                  </label>
                  <select
                    value={selectedDocType}
                    onChange={(e) => {
                      setSelectedDocType(e.target.value as AuditedDocumentType);
                      setSelectedPreset(null);
                      setAuditResult(null);
                    }}
                    className="w-full bg-[#0B0F17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                  >
                    <option value="DOT_MEDICAL_CARD_MCSA5876">DOT Medical Examiner Certificate (MCSA-5876 - § 391.43)</option>
                    <option value="CDL_LICENSE">Commercial Driver License (CDL-A - § 391.11 / § 383.23)</option>
                    <option value="ANNUAL_CERTIFICATE_OF_VIOLATIONS">Annual Review &amp; Violations Certificate (49 CFR § 391.25)</option>
                    <option value="HAZMAT_TSA_SECURITY_CLEARANCE">TSA Hazmat Endorsement Security Clearance (§ 383.141)</option>
                    <option value="CONTROLLED_SUBSTANCES_CONSENT">Clearinghouse &amp; D&amp;A Testing Consent (49 CFR Part 382)</option>
                    <option value="PRIOR_EMPLOYER_SAFETY_INQUIRY">3-Year Prior Safety &amp; Accident History (§ 391.23)</option>
                    <option value="ROAD_TEST_CERTIFICATE">Driver Road Test Certificate (49 CFR § 391.31)</option>
                    <option value="I9_EMPLOYMENT_ELIGIBILITY">Form I-9 Employment Eligibility Verification</option>
                    <option value="GENERAL_POLICY_ACKNOWLEDGMENT">Company Safety &amp; Mobile Device Policy Acknowledgment</option>
                  </select>
                </div>
              </div>

              {/* 1-Click Realistic FMCSA Defect Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-slate-300 uppercase flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#FFE600]" />
                    Instant 1-Click FMCSA Test Scenarios (Evaluate Auditor Capabilities):
                  </div>
                  <span className="text-[10px] text-slate-500">Preset or Upload Custom Image</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {SAMPLE_AUDIT_PRESETS.map((preset) => {
                    const isSelected = selectedPreset?.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                            : 'bg-[#101522] border-slate-800 hover:border-slate-700 hover:bg-[#141B2B]'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase inline-block ${
                            preset.badge.includes('14') ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            preset.badge.includes('MISSING') ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                            preset.badge.includes('CARRIER') ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {preset.badge}
                          </span>
                          <div className="text-xs font-bold text-white leading-snug">{preset.name}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-2">{preset.description}</div>
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                          Load Scenario <ChevronRight className="w-3 h-3" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Document Image Visual Preview & Scan Action */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Document Optical Preview Window */}
                <div className="lg:col-span-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-cyan-400" />
                      Document Image Optical Feed
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <UploadCloud className="w-3 h-3 text-cyan-400" />
                        Upload Custom File
                      </button>
                    </div>
                  </div>

                  <div className="relative rounded-xl border-2 border-slate-800 bg-[#070A10] p-2 min-h-[260px] flex items-center justify-center overflow-hidden group">
                    {uploadedImageBase64 ? (
                      <img
                        src={uploadedImageBase64}
                        alt="Uploaded Document Preview"
                        className="max-h-[320px] w-full object-contain rounded-lg border border-slate-800/80 shadow-inner"
                      />
                    ) : (
                      <div className="text-center p-6 space-y-2 text-slate-500">
                        <UploadCloud className="w-10 h-10 mx-auto text-slate-600 animate-bounce" />
                        <div className="text-xs font-bold">No Document Image Selected</div>
                        <div className="text-[10px]">Select a preset above or upload a custom image</div>
                      </div>
                    )}

                    {/* Scanning Optical Grid Animation */}
                    {isScanning && (
                      <div className="absolute inset-0 bg-cyan-950/60 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 space-y-4">
                        <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
                        <div className="space-y-1 text-center max-w-sm">
                          <div className="text-xs font-black uppercase text-cyan-300 tracking-wider animate-pulse">
                            GEMINI NEURAL AUDITOR IN PROGRESS
                          </div>
                          <div className="text-[11px] text-slate-300 font-mono">{scanStepMessage}</div>
                        </div>
                        {/* Laser Scan Line */}
                        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-[bounce_2s_infinite]" />
                      </div>
                    )}
                  </div>

                  {/* Scan Trigger Button */}
                  <button
                    onClick={handleExecuteScan}
                    disabled={isScanning || !uploadedImageBase64}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-[#FFE600] to-emerald-400 text-black font-black uppercase tracking-wider text-xs shadow-xl shadow-cyan-500/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                        Auditing Multimodal Data with Gemini...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-black" />
                        Execute Gemini AI Document Audit (49 CFR § 391)
                      </>
                    )}
                  </button>
                </div>

                {/* Right: Real-Time Audit Verdict & Breakdown */}
                <div className="lg:col-span-6 space-y-4">
                  {auditResult ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {/* Overall Compliance Verdict Banner */}
                      {(() => {
                        const badge = getStatusBadge(auditResult.overallComplianceStatus);
                        const IconComponent = badge.icon;
                        return (
                          <div className={`p-4 rounded-xl border flex items-start gap-3 ${badge.bg}`}>
                            <IconComponent className="w-6 h-6 shrink-0 mt-0.5" />
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <span className="font-black text-xs uppercase tracking-wider">
                                  {badge.text}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-black/40 text-[10px] font-bold">
                                  SCORE: {auditResult.complianceScore}/100
                                </span>
                              </div>
                              <p className="text-xs opacity-90 leading-relaxed font-sans">
                                {auditResult.fleetManagerNotification.notificationTitle}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Extracted Statutory Timelines & Expiration Gauge */}
                      <div className="bg-[#111724] p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="text-[11px] font-black text-slate-400 uppercase flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            Extracted Expiration &amp; Validity Matrix
                          </span>
                          <span className="text-[10px] text-cyan-400 font-mono">
                            Ref Date: 2026-10-01
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          <div className="bg-[#0B0F17] p-2.5 rounded-lg border border-slate-800">
                            <div className="text-[9px] text-slate-500 uppercase font-bold">Issue Date</div>
                            <div className="text-xs font-black text-white mt-0.5">
                              {auditResult.extractedFields.issueDate || '2024-10-15'}
                            </div>
                          </div>

                          <div className="bg-[#0B0F17] p-2.5 rounded-lg border border-slate-800">
                            <div className="text-[9px] text-slate-500 uppercase font-bold">Expiration Date</div>
                            <div className={`text-xs font-black mt-0.5 ${
                              auditResult.extractedFields.isExpired ? 'text-red-400 font-black' :
                              auditResult.extractedFields.isNearingExpiration ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              {auditResult.extractedFields.expirationDate || 'N/A'}
                            </div>
                          </div>

                          <div className="bg-[#0B0F17] p-2.5 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                            <div className="text-[9px] text-slate-500 uppercase font-bold">Days Remaining</div>
                            <div className={`text-xs font-black mt-0.5 ${
                              auditResult.extractedFields.daysUntilExpiration !== null && auditResult.extractedFields.daysUntilExpiration <= 0
                                ? 'text-red-400'
                                : auditResult.extractedFields.daysUntilExpiration !== null && auditResult.extractedFields.daysUntilExpiration <= 30
                                ? 'text-amber-400'
                                : 'text-cyan-400'
                            }`}>
                              {auditResult.extractedFields.daysUntilExpiration !== null
                                ? auditResult.extractedFields.daysUntilExpiration <= 0
                                  ? `EXPIRED (${Math.abs(auditResult.extractedFields.daysUntilExpiration)}d ago)`
                                  : `${auditResult.extractedFields.daysUntilExpiration} Days Left`
                                : 'N/A'}
                            </div>
                          </div>
                        </div>

                        {/* License / Registry Data */}
                        <div className="text-[10px] text-slate-400 grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                          <div>
                            <span className="text-slate-500">Doc / CDL #:</span>{' '}
                            <span className="text-white font-bold">{auditResult.extractedFields.documentNumber}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Issuing Body:</span>{' '}
                            <span className="text-white font-bold">{auditResult.extractedFields.stateOrAuthority}</span>
                          </div>
                        </div>
                      </div>

                      {/* Signature Detection & Verification Matrix */}
                      <div className="bg-[#111724] p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="text-[11px] font-black text-slate-400 uppercase flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-[#FFE600]" />
                            Mandatory Signature Verification Matrix
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono">ESIGN Act &amp; Part 391</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* Driver Signature */}
                          <div className={`p-3 rounded-lg border flex items-center justify-between ${
                            auditResult.signatureAudit.driverSignaturePresent
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                          }`}>
                            <div className="space-y-0.5">
                              <div className="text-[10px] font-black uppercase">Driver Signature</div>
                              <div className="text-[9px] opacity-80">
                                {auditResult.signatureAudit.driverSignaturePresent
                                  ? `Detected (${Math.round(auditResult.signatureAudit.driverSignatureConfidence * 100)}% Conf.)`
                                  : 'MISSING / BLANK LINE ❌'}
                              </div>
                            </div>
                            {auditResult.signatureAudit.driverSignaturePresent ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-400" />
                            )}
                          </div>

                          {/* Certifier / Carrier Signature */}
                          <div className={`p-3 rounded-lg border flex items-center justify-between ${
                            auditResult.signatureAudit.certifierSignaturePresent
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                          }`}>
                            <div className="space-y-0.5">
                              <div className="text-[10px] font-black uppercase">Examiner / Carrier Signature</div>
                              <div className="text-[9px] opacity-80">
                                {auditResult.signatureAudit.certifierSignaturePresent
                                  ? `Verified (${Math.round(auditResult.signatureAudit.certifierSignatureConfidence * 100)}% Conf.)`
                                  : 'MISSING DEFECT ❌'}
                              </div>
                            </div>
                            {auditResult.signatureAudit.certifierSignaturePresent ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-400" />
                            )}
                          </div>
                        </div>

                        {auditResult.signatureAudit.signatureDefectDescription && (
                          <div className="p-2.5 rounded bg-purple-950/30 border border-purple-500/40 text-[11px] text-purple-300 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                            <div>{auditResult.signatureAudit.signatureDefectDescription}</div>
                          </div>
                        )}
                      </div>

                      {/* FMCSA Statutory Violations & Remedies */}
                      {auditResult.fmcsaViolationsFound.length > 0 && (
                        <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-500/40 space-y-2.5">
                          <div className="text-[11px] font-black text-rose-400 uppercase flex items-center gap-1.5">
                            <BadgeAlert className="w-4 h-4 text-rose-400" />
                            FMCSA Statutory Defect Findings ({auditResult.fmcsaViolationsFound.length})
                          </div>
                          {auditResult.fmcsaViolationsFound.map((v, idx) => (
                            <div key={idx} className="bg-[#0B0E17] p-2.5 rounded-lg border border-rose-500/30 space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-black text-white">
                                <span>{v.title}</span>
                                <span className="text-[9px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                                  {v.citation}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-300">{v.description}</div>
                              <div className="text-[10px] text-amber-300 font-bold flex items-center gap-1 pt-1">
                                <span className="text-slate-500">Statutory Remedy:</span> {v.remedy}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Automated Fleet Manager Notification Dispatch Hub */}
                      <div className="bg-gradient-to-r from-[#141B2B] to-[#0F1624] p-4 rounded-xl border border-cyan-500/40 space-y-3 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-black text-white uppercase flex items-center gap-2">
                            <Bell className="w-4 h-4 text-cyan-400" />
                            Automated Fleet Manager &amp; Driver Notification
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                            auditResult.fleetManagerNotification.urgency === 'CRITICAL' ? 'bg-red-500 text-white' :
                            auditResult.fleetManagerNotification.urgency === 'HIGH' ? 'bg-amber-500 text-black' :
                            'bg-slate-700 text-slate-200'
                          }`}>
                            URGENCY: {auditResult.fleetManagerNotification.urgency}
                          </span>
                        </div>

                        <div className="bg-[#0A0D14] p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                          <div className="text-slate-300 font-bold">
                            {auditResult.fleetManagerNotification.notificationTitle}
                          </div>
                          <div className="text-slate-400 text-[11px] font-sans">
                            {auditResult.fleetManagerNotification.notificationBody}
                          </div>
                          <div className="text-cyan-400 text-[10px] font-bold">
                            Recommended Action: {auditResult.fleetManagerNotification.recommendedAction}
                          </div>
                        </div>

                        {dispatchSuccessToast && (
                          <div className="p-2.5 rounded bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            {dispatchSuccessToast}
                          </div>
                        )}

                        {/* Dispatch Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => handleDispatchAlert('ALL')}
                            disabled={isDispatchingAlert}
                            className="py-2.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {isDispatchingAlert ? 'Broadcasting...' : 'Broadcast Multi-Channel Alert'}
                          </button>

                          <button
                            onClick={() => handleDispatchAlert('SMS')}
                            disabled={isDispatchingAlert}
                            className="py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700 disabled:opacity-50"
                          >
                            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                            SMS Dispatch to Driver
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#111724] border border-slate-800 rounded-xl p-8 text-center space-y-3 min-h-[360px] flex flex-col items-center justify-center">
                      <Sparkles className="w-12 h-12 text-cyan-500/60 animate-pulse" />
                      <div className="text-base font-bold text-white uppercase font-[Oswald]">
                        Awaiting AI Document Inspection
                      </div>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Select an instant 49 CFR Part 391 test scenario or upload a document photo, then tap &quot;Execute Gemini AI Document Audit&quot;.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'AUDIT_LEDGER' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black text-slate-300 uppercase flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Historical Document Compliance Audits ({auditHistory.length})
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Permanent DQF Audit Trail (49 CFR § 391.51)
                </span>
              </div>

              {auditHistory.length === 0 ? (
                <div className="bg-[#111724] p-12 text-center text-slate-500 rounded-xl border border-slate-800 space-y-2">
                  <FileCheck className="w-10 h-10 mx-auto text-slate-600" />
                  <div className="text-sm font-bold text-slate-400">No Audits Conducted Yet</div>
                  <div className="text-xs">Run a document scan from the scanner tab to generate audit records.</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditHistory.map((item) => {
                    const badge = getStatusBadge(item.overallComplianceStatus);
                    return (
                      <div
                        key={item.id}
                        className="bg-[#111724] p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${badge.bg}`}>
                              {badge.text}
                            </span>
                            <span className="text-xs font-black text-white">{item.driverName}</span>
                            <span className="text-[10px] text-slate-400">({item.documentCategoryName})</span>
                          </div>
                          <div className="text-xs text-slate-300 font-sans">
                            {item.fleetManagerNotification.notificationTitle}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-3">
                            <span>Audited: {new Date(item.auditTimestamp).toLocaleString()}</span>
                            <span>•</span>
                            <span>Exp: {item.extractedFields.expirationDate || 'N/A'}</span>
                            <span>•</span>
                            <span>Score: {item.complianceScore}/100</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setAuditResult(item);
                              setActiveTab('AUDIT_SCANNER');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-400 hover:text-white border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Inspection
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0C101A] flex items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">FMCSA 49 CFR Part 391 &amp; Part 382 Compliant Neural Audit Engine</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer border border-slate-700"
          >
            Close Auditor
          </button>
        </div>
      </div>
    </div>
  );
};
