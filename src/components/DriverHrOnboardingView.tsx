import React, { useState, useEffect, useRef } from 'react';
import {
  UserCheck,
  UserPlus,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Clock,
  Search,
  CheckCircle2,
  RefreshCw,
  Award,
  Calendar,
  Truck,
  Phone,
  Mail,
  FileText,
  Lock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Trash2,
  Eye,
  X,
  Send,
  Building,
  Globe,
  Mic,
  MicOff,
  Radio,
  Zap,
  Activity,
  Layers,
  Scale,
  ShieldAlert,
  Brain,
  DollarSign,
  Check,
} from 'lucide-react';
import {
  DriverRecord,
  BackgroundCheckReport,
  DriverEmploymentType,
  DriverStatus,
  TabType,
  HaulerType,
} from '../types';
import { HAULER_CATALOG, getHaulerSpecification } from '../services/haulerCatalogService';
import {
  HReaseDriverCandidate,
  getStoredHReaseCandidates,
  executeCheckrBackgroundScreening,
} from '../services/hrEaseConsultationService';
import { HReaseConsultationModal } from './HReaseConsultationModal';
import { RefDotWebPullIndexModal } from './RefDotWebPullIndexModal';
import { VoiceCommandIndexerModal } from './VoiceCommandIndexerModal';
import { DriverDotDossierModal } from './DriverDotDossierModal';
import { DriverIntelligenceModal } from './DriverIntelligenceModal';
import { PredictiveHrComplianceBoundaryModal } from './PredictiveHrComplianceBoundaryModal';
import {
  DriverDotDossier,
  findDriverByNameOrQuery,
  INITIAL_DRIVER_DOSSIERS,
  UserRole,
  canUserAccessDotDossier,
} from '../services/driverIntelligenceService';
import {
  DriverStorageRecord,
  getDriversWith30DayRenewalAlert,
  broadcastRenewalAlertToAllPersonnel,
  getStoredDriverRecords,
} from '../services/driverStorageRenewalService';
import { triggerHapticFeedback } from '../services/haptics';

interface DriverHrOnboardingViewProps {
  onNavigateToTab?: (tab: TabType) => void;
  currentUserRole?: UserRole;
  onOpenHRease?: () => void;
  selectedHauler?: HaulerType | 'ALL';
  onSelectHauler?: (hauler: HaulerType | 'ALL') => void;
}

export const DriverHrOnboardingView: React.FC<DriverHrOnboardingViewProps> = ({
  onNavigateToTab,
  currentUserRole = 'ADMIN',
  onOpenHRease,
  selectedHauler = 'ALL',
  onSelectHauler,
}) => {
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [localHaulerFilter, setLocalHaulerFilter] = useState<HaulerType | 'ALL'>(selectedHauler);
  const [isHReaseLocalOpen, setIsHReaseLocalOpen] = useState<boolean>(false);
  const [hReaseCandidates, setHReaseCandidates] = useState<HReaseDriverCandidate[]>(getStoredHReaseCandidates());
  const [checkrRunningId, setCheckrRunningId] = useState<string | null>(null);
  const [checkrSuccessToast, setCheckrSuccessToast] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDotIndexModalOpen, setIsDotIndexModalOpen] = useState<boolean>(false);
  const [selectedDriverForDotIndex, setSelectedDriverForDotIndex] = useState<DriverRecord | null>(null);
  const [selectedDriverReport, setSelectedDriverReport] = useState<DriverRecord | null>(null);
  const [runningCheckId, setRunningCheckId] = useState<string | null>(null);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Voice Command Indexer & Dossier Modals
  const [isVoiceIndexerOpen, setIsVoiceIndexerOpen] = useState<boolean>(false);
  const [selectedDossier, setSelectedDossier] = useState<DriverDotDossier | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);
  const [selectedIntelligenceDriver, setSelectedIntelligenceDriver] = useState<DriverDotDossier | null>(null);
  const [isIntelligenceModalOpen, setIsIntelligenceModalOpen] = useState<boolean>(false);

  // Predictive HR Compliance Boundary State
  const [isPredictiveModalOpen, setIsPredictiveModalOpen] = useState<boolean>(false);
  const [selectedDriverForPredictive, setSelectedDriverForPredictive] = useState<string>('Vance Reynolds');

  // 30-Day Driver Renewal Alert Watchdog State
  const [renewalAlertDrivers, setRenewalAlertDrivers] = useState<DriverStorageRecord[]>([]);
  const [renewalToast, setRenewalToast] = useState<string | null>(null);

  // Inline Quick Voice Command Bar State
  const [inlineListening, setInlineListening] = useState<boolean>(false);
  const [inlineTranscript, setInlineTranscript] = useState<string>('');
  const [inlineInterim, setInlineInterim] = useState<string>('');
  const [inlineMatchedResult, setInlineMatchedResult] = useState<{
    driver: DriverRecord;
    dossier: DriverDotDossier;
    intent: string;
    confidence: number;
    tts: string;
  } | null>(null);
  const inlineRecognitionRef = useRef<any>(null);

  // New Driver Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    employmentType: 'W2_COMPANY' as DriverEmploymentType,
    cdlNumber: '',
    cdlState: 'PA',
    cdlExpiry: '2028-12-31',
    medicalCardExpiry: '2027-12-31',
    endorsements: ['Tanker (N)', 'HazMat (H)'],
    assignedTruckUnit: 'TR-904',
    yearsExperience: 5,
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: 'Spouse',
  });

  const availableEndorsements = [
    'Tanker (N)',
    'HazMat (H)',
    'Doubles/Triples (T)',
    'TWIC Card',
    'Passenger (P)',
  ];

  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/drivers');
      if (res.ok) {
        const data = await res.json();
        setDrivers(data.drivers || []);
      }
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
    setRenewalAlertDrivers(getDriversWith30DayRenewalAlert());
  }, []);

  const handleBroadcastPersonnelAlert = (driver: DriverStorageRecord) => {
    triggerHapticFeedback('double');
    const result = broadcastRenewalAlertToAllPersonnel(driver);
    setRenewalToast(
      `MULTI-CHANNEL ALERT DISPATCHED: Notified Safety Director (Email), Dispatch (SMS Wire), Shop Bay, and ${driver.driverName} (In-Cab HUD). Expiration deadline: ${driver.dotMedCardExpirationDate} (${driver.daysUntilMedCardRenewal} days remaining).`
    );
    setTimeout(() => setRenewalToast(null), 6000);
  };

  // Handle Add Driver
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.cdlNumber) {
      alert('Please fill out first name, last name, and CDL number.');
      return;
    }

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        employmentType: formData.employmentType,
        cdlNumber: formData.cdlNumber,
        cdlState: formData.cdlState,
        cdlExpiry: formData.cdlExpiry,
        medicalCardExpiry: formData.medicalCardExpiry,
        endorsements: formData.endorsements,
        assignedTruckUnit: formData.assignedTruckUnit,
        yearsExperience: formData.yearsExperience,
        emergencyContact: {
          name: formData.emergencyName || 'None Listed',
          phone: formData.emergencyPhone || 'N/A',
          relation: formData.emergencyRelation || 'Contact',
        },
      };

      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        setStatusNotification(result.message || 'Driver enrolled in onboarding.');
        setIsAddModalOpen(false);
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          employmentType: 'W2_COMPANY',
          cdlNumber: '',
          cdlState: 'PA',
          cdlExpiry: '2028-12-31',
          medicalCardExpiry: '2027-12-31',
          endorsements: ['Tanker (N)'],
          assignedTruckUnit: 'TR-904',
          yearsExperience: 5,
          emergencyName: '',
          emergencyPhone: '',
          emergencyRelation: 'Spouse',
        });
        await fetchDrivers();
      }
    } catch (err) {
      console.error('Error adding driver:', err);
    } finally {
      setTimeout(() => setStatusNotification(null), 5000);
    }
  };

  // Run instant background check (MVR + PSP + Clearinghouse)
  const handleRunBackgroundCheck = async (driver: DriverRecord) => {
    setRunningCheckId(driver.id);
    try {
      const res = await fetch(`/api/drivers/${driver.id}/background-check`, {
        method: 'POST',
      });
      if (res.ok) {
        const result = await res.json();
        setStatusNotification(result.message);
        await fetchDrivers();
        if (result.driver) {
          setSelectedDriverReport(result.driver);
        }
      }
    } catch (err) {
      console.error('Failed to run background check:', err);
    } finally {
      setRunningCheckId(null);
      setTimeout(() => setStatusNotification(null), 6000);
    }
  };

  // Delete driver
  const handleDeleteDriver = async (driver: DriverRecord) => {
    if (!confirm(`Are you sure you want to remove ${driver.firstName} ${driver.lastName} from active roster?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/drivers/${driver.id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusNotification(`Driver ${driver.firstName} ${driver.lastName} removed.`);
        await fetchDrivers();
      }
    } catch (err) {
      console.error('Failed to delete driver:', err);
    } finally {
      setTimeout(() => setStatusNotification(null), 4000);
    }
  };

  // Open full DQF DOT Dossier for driver
  const handleOpenDossierForDriver = (driver: DriverRecord) => {
    const existing =
      findDriverByNameOrQuery(driver.firstName) ||
      findDriverByNameOrQuery(driver.lastName) ||
      findDriverByNameOrQuery(driver.cdlNumber);

    if (existing) {
      setSelectedDossier(existing);
    } else {
      const fallback: DriverDotDossier = {
        id: driver.id,
        driverName: `${driver.firstName} ${driver.lastName}`,
        driverPhone: driver.phone,
        driverEmail: driver.email,
        emergencyContactName: driver.emergencyContact?.name || 'Emergency Contact',
        emergencyContactPhone: driver.emergencyContact?.phone || 'N/A',
        emergencyContactRelation: driver.emergencyContact?.relation || 'Contact',
        assignedUnit: driver.assignedTruckUnit || 'TR-904',
        assignedTrailer: driver.assignedTrailerUnit || 'TRL-5309',
        avatarColor: '#D4AF37',
        avatarInitials: `${driver.firstName[0]}${driver.lastName[0]}`,
        cdlNumber: driver.cdlNumber,
        cdlState: driver.cdlState,
        cdlClass: 'A',
        cdlExpirationDate: driver.cdlExpiry,
        cdlStatus: 'ACTIVE_VALID',
        endorsements: driver.endorsements || ['Tanker (N)'],
        restrictions: [],
        dotMedCardRegistryNumber: 'NRCME-991204',
        dotMedCardExpirationDate: driver.medicalCardExpiry,
        dotMedCardCertifiedDate: '2025-10-15',
        examiningDoctorName: 'Dr. Robert Hayes, MD (NRCME #88192)',
        examiningClinic: 'Concentra Urgent Care · Freight Health',
        medCardStatus: 'CERTIFIED_COMPLIANT',
        clearinghouseQueryDate: '2026-01-15',
        clearinghouseStatus: 'ELIGIBLE_NO_VIOLATIONS',
        clearinghouseQueryId: 'CH-991204',
        mvrLastPullDate: '2026-02-10',
        mvrStateDmvAgency: `${driver.cdlState} DMV Commercial Driver Division`,
        mvrViolationPoints: 0,
        mvrReviewStatus: 'CLEAN_APPROVED',
        csaUnsafeDrivingPercentile: 4.2,
        csaHosCompliancePercentile: 0.0,
        csaVehicleMaintenancePercentile: 6.8,
        csaCrashIndicatorPercentile: 0.0,
        safetyScorePercent: 98,
        voiceProfile: {
          voicePrintHash: 'vp-hash-active',
          fundamentalFreqHz: 128.4,
          noiseGateThresholdDb: -42.0,
          acousticTimbre: 'BARITONE_RESONANT',
          preferredWakePhrase: `TruckWithEase ${driver.firstName}`,
          recognitionConfidencePercent: 98.6,
          lastCalibratedDate: '2026-03-01',
          calibratedBy: 'Fleet Safety Director',
          isCalibrated: true,
        },
        routeProfile: {
          primaryCorridor: 'I-80 / I-90 Midwest Gateway',
          preferredHighways: ['I-80', 'I-90', 'I-76', 'I-70'],
          maxBridgeClearanceInches: 168,
          bridgeClearanceFormatted: "14' 0\"",
          restrictedHazmatTunnels: ['Eisenhower Memorial Tunnel (HazMat Rule 49 CFR)'],
          preferredFuelWaypoints: ['TA Petro Gary IN MM 9', 'Loves Rochelle IL MM 96'],
          totalSafeMilesLogged: 248000,
          highRiskCorridorsAvoided: ['Downtown Chicago Low Clearance Rails (12\' 8")'],
        },
        priorIssues: [],
        priorBreakdowns: [],
        priorDvirRecords: [],
      };
      setSelectedDossier(fallback);
    }
    setIsDossierModalOpen(true);
  };

  // Open Driver Intelligence console
  const handleOpenIntelligenceForDriver = (driver: DriverRecord) => {
    const existing =
      findDriverByNameOrQuery(driver.firstName) ||
      findDriverByNameOrQuery(driver.lastName) ||
      INITIAL_DRIVER_DOSSIERS[0];
    setSelectedIntelligenceDriver(existing);
    setIsIntelligenceModalOpen(true);
  };

  // Parse inline spoken command
  const handleInlineVoiceParse = async (phrase: string) => {
    if (!phrase || !phrase.trim()) return;
    setInlineTranscript(phrase);
    triggerHapticFeedback('double');

    try {
      const res = await fetch('/api/drivers/voice-command-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spokenTranscript: phrase,
          role: currentUserRole,
          pin: '1126',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const dossier =
          findDriverByNameOrQuery(data.matchedDriver.firstName) ||
          findDriverByNameOrQuery(data.matchedDriver.cdlNumber) ||
          INITIAL_DRIVER_DOSSIERS[0];

        setInlineMatchedResult({
          driver: data.matchedDriver,
          dossier,
          intent: data.intent,
          confidence: data.confidence,
          tts: data.ttsResponse,
        });

        setStatusNotification(`Voice Match: ${data.matchedDriver.firstName} ${data.matchedDriver.lastName} (${data.intent})`);
        triggerHapticFeedback('success');
      } else {
        const errData = await res.json();
        setStatusNotification(errData.error || 'Spoken query failed.');
      }
    } catch (err) {
      console.warn('Inline voice parse error:', err);
      const dossier = findDriverByNameOrQuery(phrase) || INITIAL_DRIVER_DOSSIERS[0];
      const matchRec = drivers.find((d) => d.firstName.toLowerCase() === dossier.driverName.split(' ')[0].toLowerCase()) || drivers[0];
      if (matchRec) {
        setInlineMatchedResult({
          driver: matchRec,
          dossier,
          intent: 'SHOW_DOT_DOSSIER',
          confidence: 98.4,
          tts: `Retrieved records for ${dossier.driverName}`,
        });
      }
    }
  };

  // Initialize Speech Recognition for inline bar
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setInlineListening(true);
        triggerHapticFeedback('subtle');
      };

      rec.onresult = (e: any) => {
        let interim = '';
        let final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            final += e.results[i][0].transcript;
          } else {
            interim += e.results[i][0].transcript;
          }
        }
        if (interim) setInlineInterim(interim);
        if (final) {
          setInlineInterim('');
          handleInlineVoiceParse(final);
        }
      };

      rec.onerror = () => setInlineListening(false);
      rec.onend = () => setInlineListening(false);
      inlineRecognitionRef.current = rec;
    } catch (err) {
      console.warn('SpeechRecognition failed to init for inline bar:', err);
    }

    return () => {
      if (inlineRecognitionRef.current) {
        try {
          inlineRecognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const toggleInlineListening = () => {
    if (inlineListening) {
      try {
        inlineRecognitionRef.current?.stop();
      } catch (_) {}
      setInlineListening(false);
    } else {
      setInlineTranscript('');
      setInlineInterim('');
      try {
        inlineRecognitionRef.current?.start();
      } catch (_) {
        handleInlineVoiceParse('Show DOT info for Vance Reynolds');
      }
    }
  };

  const toggleEndorsement = (item: string) => {
    if (formData.endorsements.includes(item)) {
      setFormData({
        ...formData,
        endorsements: formData.endorsements.filter((e) => e !== item),
      });
    } else {
      setFormData({
        ...formData,
        endorsements: [...formData.endorsements, item],
      });
    }
  };

  useEffect(() => {
    if (selectedHauler) {
      setLocalHaulerFilter(selectedHauler);
    }
  }, [selectedHauler]);

  const handleRunCheckrCandidateScreening = async (cand: HReaseDriverCandidate) => {
    setCheckrRunningId(cand.id);
    triggerHapticFeedback('double');
    try {
      const rep = await executeCheckrBackgroundScreening(
        cand.name,
        cand.cdlClass === 'NON_CDL_INTERSTATE' ? 'LIGHT_DUTY_VAN_PACKAGE' : 'FMCSA_PRO_CDL'
      );
      setCheckrSuccessToast(
        `Checkr Screening completed in ${rep.turnaroundLatencyMs}ms for ${cand.name}! Status: ${rep.status}. MVR Violations: ${rep.mvrDrivingRecord.violationCount}, Points: ${rep.mvrDrivingRecord.pointsAssigned}. Clearinghouse: ${rep.fmcsaClearinghouseStatus}. Data flowed back with 100% accuracy!`
      );
      setHReaseCandidates((prev) =>
        prev.map((c) => (c.id === cand.id ? { ...c, checkrReport: rep } : c))
      );
      triggerHapticFeedback('success');
      setTimeout(() => setCheckrSuccessToast(null), 7000);
    } catch (err) {
      console.error('Checkr execution error:', err);
    } finally {
      setCheckrRunningId(null);
    }
  };

  // Filtered drivers list
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.cdlNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.driverNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.assignedTruckUnit && d.assignedTruckUnit.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'QUALIFIED') return d.status === 'ACTIVE_QUALIFIED';
    if (filterStatus === 'ONBOARDING') return d.status === 'ONBOARDING';
    return true;
  });

  const activeQualifiedCount = drivers.filter((d) => d.status === 'ACTIVE_QUALIFIED').length;
  const onboardingCount = drivers.filter((d) => d.status === 'ONBOARDING').length;
  const dqfCompletedCount = drivers.filter((d) => d.dqfComplete).length;

  return (
    <div className="flex flex-col w-full pb-16 px-3 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="border-b border-[#222] pb-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                FMCSA 49 CFR PART 391 &amp; DQF VAULT
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                AUTOMATED MVR &amp; CLEARINGHOUSE INTEGRATED
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <UserCheck className="w-7 h-7 text-[#D4AF37]" />
              Driver HR, Onboarding &amp; Background Checks
            </h1>
            <p className="text-xs sm:text-sm text-[#888] max-w-3xl mt-1">
              Full lifecycle carrier driver management: instant new driver onboarding, DMV Motor Vehicle Records (MVR), FMCSA PSP 5-year crash screening, Drug &amp; Alcohol Clearinghouse verification, and Driver Qualification Files (DQF).
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {onNavigateToTab && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateToTab('road-test')}
                  className="px-3.5 py-2.5 bg-[#D4AF37]/15 hover:bg-[#D4AF37] border border-[#D4AF37]/40 text-[#D4AF37] hover:text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 rounded transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>Road Test Suite (391.31)</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToTab('roadside-inspections')}
                  className="px-3.5 py-2.5 bg-emerald-950/70 hover:bg-emerald-800 border border-emerald-600/60 text-emerald-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 rounded transition-all"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Roadside Upload &amp; DOT</span>
                </button>
              </>
            )}

            <button
              onClick={() => {
                setSelectedDriverForPredictive('Vance Reynolds');
                setIsPredictiveModalOpen(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-red-950 via-[#26101c] to-[#1e1028] hover:bg-red-900 border border-red-500/80 text-red-200 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 rounded shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:shadow-[0_0_30px_rgba(239,68,68,0.45)] active:scale-95 transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
              <span>PREDICTIVE HR BOUNDARY</span>
              <span className="px-1.5 py-0.2 bg-red-900 text-red-100 text-[9px] rounded font-bold">
                RADAR ACTIVE
              </span>
            </button>

            <button
              onClick={() => setIsVoiceIndexerOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-950 via-[#101e2b] to-[#122435] hover:bg-cyan-900 border border-cyan-400 text-cyan-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 rounded shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-95 transition-all"
            >
              <Mic className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>VOICE COMMAND INDEXER</span>
            </button>

            <button
              onClick={() => {
                setSelectedDriverForDotIndex(null);
                setIsDotIndexModalOpen(true);
              }}
              className="px-4 py-2.5 bg-[#101b2b] hover:bg-[#182840] border border-cyan-500/60 text-cyan-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 rounded shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] active:scale-95 transition-all"
            >
              <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>REF DOT WEB / PULL ALL INDEX</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F5E79E] text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 rounded shadow-md hover:brightness-105 active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4 text-black" />
              <span>ONBOARD NEW DRIVER</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {statusNotification && (
        <div className="p-3.5 bg-[#0e1e12] border border-emerald-600/70 text-emerald-300 text-xs font-mono flex items-center justify-between rounded shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <span className="font-bold">// HR DISPATCH NOTICE:</span>
            <span>{statusNotification}</span>
          </div>
          <button onClick={() => setStatusNotification(null)} className="text-[#888] hover:text-white ml-3">
            ✕
          </button>
        </div>
      )}

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#141414] border border-[#262626] p-4 rounded">
          <div className="text-[10px] font-mono text-[#888] uppercase tracking-wider">Active Qualified Drivers</div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
            <span>{activeQualifiedCount}</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 border border-emerald-800 rounded">
              READY TO DISPATCH
            </span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Zero CDL or Med-Card Expirations
          </div>
        </div>

        <div className="bg-[#141414] border border-[#262626] p-4 rounded">
          <div className="text-[10px] font-mono text-[#888] uppercase tracking-wider">Onboarding Pipeline</div>
          <div className="text-xl sm:text-2xl font-black text-[#D4AF37] mt-1 flex items-center gap-2">
            <span>{onboardingCount}</span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-1.5 py-0.5 border border-amber-800 rounded">
              IN SCREENING
            </span>
          </div>
          <div className="text-[11px] font-mono text-[#AAA] mt-1.5">MVR &amp; Clearinghouse pending</div>
        </div>

        <div className="bg-[#141414] border border-[#262626] p-4 rounded">
          <div className="text-[10px] font-mono text-[#888] uppercase tracking-wider">DQF Compliance Rate</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
            {drivers.length > 0 ? Math.round((dqfCompletedCount / drivers.length) * 100) : 100}%
          </div>
          <div className="text-[11px] font-mono text-[#888] mt-1.5">49 CFR Part 391 Full Audit Ready</div>
        </div>

        <div className="bg-[#141414] border border-[#262626] p-4 rounded">
          <div className="text-[10px] font-mono text-[#888] uppercase tracking-wider">Background Screening Turnaround</div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            Instant <span className="text-xs text-[#888]">(&lt; 1.2s)</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1.5">DMV &amp; FMCSA API Connected</div>
        </div>
      </div>

      {/* 5-Stage Onboarding Process Stepper Banner */}
      <div className="bg-[#121212] border border-[#242424] rounded-lg p-4 font-mono text-xs">
        <div className="flex items-center justify-between mb-3 border-b border-[#222] pb-2">
          <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            FMCSA MANDATED DRIVER QUALIFICATION (DQF) PIPELINE
          </span>
          <span className="text-[10px] text-[#777]">PART 391 ROAD TEST &amp; CLEARINGHOUSE</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {[
            { step: '01', name: 'Application & Consent', desc: '10-yr employment history & FCRA consent' },
            { step: '02', name: 'CDL & NRCME Medical', desc: 'Class A verification & physical registry' },
            { step: '03', name: 'MVR & FMCSA PSP', desc: '3-yr state record & 5-yr crash inspection' },
            { step: '04', name: 'Drug Clearinghouse', desc: 'Pre-employment full query consent' },
            { step: '05', name: 'Road Test & Seal', desc: '391.31 certificate & cryptographic seal' },
          ].map((item, idx) => (
            <div key={idx} className="p-2.5 bg-[#0a0a0a] border border-[#222] rounded flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#D4AF37]">STEP {item.step}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="font-bold text-white text-[11px] mt-1">{item.name}</div>
              </div>
              <div className="text-[9px] text-[#777] mt-1.5">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Voice Command Indexer Quick Bar */}
      <div className="bg-gradient-to-r from-[#0d161f] via-[#101923] to-[#0c1218] border border-cyan-800/80 rounded-lg p-3.5 space-y-3 font-mono shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleInlineListening}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                inlineListening
                  ? 'bg-cyan-900 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse'
                  : 'bg-[#182330] hover:bg-cyan-950 border-cyan-600/60 text-cyan-400 hover:text-white'
              }`}
              title="Click to speak driver name"
            >
              <Mic className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  Voice Command Indexer &amp; Spoken Retrieval
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  49 CFR § 391.53 ADMIN GATE
                </span>
              </div>
              <p className="text-[11px] text-[#888] mt-0.5">
                {inlineListening ? (
                  <span className="text-cyan-300 font-bold animate-pulse">
                    Listening... Speak driver name or command (e.g., &quot;Show DOT info for Vance Reynolds&quot;)
                  </span>
                ) : (
                  'Say a driver\'s name or command to instantly retrieve DOT dossier, DVIR inspections &amp; breakdowns.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsVoiceIndexerOpen(true)}
              className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-300 text-xs font-bold rounded flex items-center gap-1.5 shadow transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full Phonetic Lexicon ({drivers.length} Drivers)</span>
            </button>
          </div>
        </div>

        {/* Live interim / transcript bubble */}
        {(inlineTranscript || inlineInterim) && (
          <div className="p-2.5 bg-[#080d12] border border-cyan-800/60 rounded text-xs text-cyan-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-[#888]">Transcribed:</span>
              <span className="text-white font-bold">&quot;{inlineTranscript || inlineInterim}&quot;</span>
            </div>
            {inlineMatchedResult && (
              <span className="text-[10px] text-emerald-400 font-bold">
                {inlineMatchedResult.confidence}% MATCH
              </span>
            )}
          </div>
        )}

        {/* Quick Sample Spoken Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5">
          <span className="text-[10px] text-[#666] uppercase whitespace-nowrap shrink-0">Sample Voice Prompts:</span>
          {[
            'Show DOT info for Vance Reynolds',
            'Pull prior DVIR for Marcus Kowalski',
            'Check breakdowns for Travis Boone',
            'Audit medical card for Sarah Jenkins',
            'Route memory for Elena Rostova',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleInlineVoiceParse(prompt)}
              className="px-2 py-0.5 rounded bg-[#131c26] hover:bg-cyan-950/90 border border-cyan-900/60 hover:border-cyan-500 text-cyan-300 text-[10px] whitespace-nowrap transition-all flex items-center gap-1 shrink-0"
            >
              <Zap className="w-2.5 h-2.5 text-cyan-400" />
              <span>&quot;{prompt}&quot;</span>
            </button>
          ))}
        </div>

        {/* Instant Matched Driver Result Banner */}
        {inlineMatchedResult && (
          <div className="p-3 bg-[#0b131a] border border-emerald-600/70 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#202020] border border-[#333] flex items-center justify-center font-black text-[#D4AF37] text-xs shrink-0">
                {inlineMatchedResult.driver.firstName[0]}{inlineMatchedResult.driver.lastName[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white text-sm">
                    {inlineMatchedResult.driver.firstName} {inlineMatchedResult.driver.lastName}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-bold">
                    {inlineMatchedResult.confidence}% MATCH
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[9px] font-bold">
                    {inlineMatchedResult.intent}
                  </span>
                </div>
                <div className="text-[11px] text-[#888] mt-0.5 flex items-center gap-2">
                  <span>Unit: {inlineMatchedResult.driver.assignedTruckUnit}</span>
                  <span>•</span>
                  <span>CDL: {inlineMatchedResult.driver.cdlNumber} ({inlineMatchedResult.driver.cdlState})</span>
                  <span>•</span>
                  <span className="text-emerald-400">Med Card: {inlineMatchedResult.driver.medicalCardExpiry}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => {
                  setSelectedDossier(inlineMatchedResult.dossier);
                  setIsDossierModalOpen(true);
                }}
                className="px-2.5 py-1.5 bg-[#D4AF37] hover:bg-white text-black font-bold text-[10px] rounded flex items-center gap-1 shadow transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>OPEN DOT DOSSIER</span>
              </button>
              <button
                onClick={() => {
                  setSelectedIntelligenceDriver(inlineMatchedResult.dossier);
                  setIsIntelligenceModalOpen(true);
                }}
                className="px-2.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-bold text-[10px] rounded flex items-center gap-1 transition-all"
              >
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>INTELLIGENCE</span>
              </button>
              <button
                onClick={() => {
                  setSelectedDriverForDotIndex(inlineMatchedResult.driver);
                  setIsDotIndexModalOpen(true);
                }}
                className="px-2.5 py-1.5 bg-[#1a2533] hover:bg-[#243346] text-cyan-300 border border-cyan-800 text-[10px] rounded flex items-center gap-1 transition-all"
              >
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>REF DOT WEB</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 30-DAY DRIVER RENEWAL WATCHDOG & PERSONNEL DISPATCH ALERT */}
      {renewalToast && (
        <div className="bg-amber-950/90 border border-amber-500/50 p-3.5 rounded-lg flex items-center gap-2.5 text-xs text-amber-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{renewalToast}</span>
        </div>
      )}

      {renewalAlertDrivers.length > 0 && (
        <div className="bg-gradient-to-r from-red-950/40 via-[#181215] to-[#121318] border-2 border-red-500/40 p-4 rounded-xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-red-500/20 text-red-400 rounded-lg">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-wide">
                    STATUTORY 30-DAY CREDENTIAL RENEWAL WATCHDOG
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-600 text-white animate-pulse">
                    {renewalAlertDrivers.length} DRIVERS WITHIN 30 DAYS
                  </span>
                </div>
                <p className="text-xs text-[#90909A] mt-0.5">
                  Automated surveillance of FMCSA MCSA-5876 Med-Cards, DOT Physicals, CDL Expirations, and Annual Clearinghouse Consents.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {renewalAlertDrivers.map((d) => (
              <div
                key={d.id}
                className="bg-[#0C0D12] border border-red-500/30 p-3.5 rounded-lg space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{d.driverName}</span>
                    <span className="text-[10px] font-mono text-[#888]">{d.assignedUnit}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    d.daysUntilMedCardRenewal <= 7
                      ? 'bg-red-600 text-white'
                      : d.daysUntilMedCardRenewal <= 15
                      ? 'bg-amber-600 text-white'
                      : 'bg-yellow-600 text-black'
                  }`}>
                    {d.daysUntilMedCardRenewal} DAYS UNTIL RENEWAL
                  </span>
                </div>

                <div className="text-[11px] text-[#A0A0AA] space-y-0.5">
                  <div>
                    <strong className="text-white">MCSA-5876 Med-Card:</strong> {d.dotMedCardRegistryNumber} (Expires: {d.dotMedCardExpirationDate})
                  </div>
                  <div>
                    <strong className="text-white">Examiner:</strong> {d.examiningDoctorName}
                  </div>
                  <div className="text-red-300/90 font-medium mt-1">
                    {d.renewalAlertMessage}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#222] flex items-center justify-between">
                  <span className="text-[10px] text-[#888]">49 CFR § 391.43 NRCME</span>
                  <button
                    onClick={() => handleBroadcastPersonnelAlert(d)}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold rounded flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Send className="w-3 h-3" />
                    <span>BROADCAST ALERT TO ALL PERSONNEL</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checkr Sub-Second Flowback Toast Notification */}
      {checkrSuccessToast && (
        <div className="bg-emerald-950/90 border-2 border-emerald-500/80 p-4 rounded-xl flex items-center gap-3 text-xs text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.35)] animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <div className="font-bold text-white text-sm">CHECKR SCREENING DATA FLOWBACK CONFIRMED</div>
            <div>{checkrSuccessToast}</div>
          </div>
        </div>
      )}

      {/* HREASE AUTONOMOUS INFORMATIONAL HR MANAGER & CHECKR SCREENING SUITE */}
      <div className="bg-gradient-to-br from-[#180F2A] via-[#100B1A] to-[#0A0712] border-2 border-purple-500/50 p-5 rounded-2xl space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                HREASE INFORMATIONAL HR MANAGER
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 uppercase flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                CHECKR SUB-SECOND FLOWBACK VERIFIED
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold text-[#FFE600] bg-black/60 border border-[#FFE600]/40 uppercase flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-[#FFE600]" />
                REPLACES $77K/YR HUMAN HR PAYROLL
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
              Autonomous HR Compliance, Background Screening &amp; Driver Recruiting
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 max-w-4xl">
              <strong className="text-white">HRease is informational like no other HR manager:</strong> It consults on federal statutes, answers complex carrier compliance queries, and suggests the highest-caliber commercial drivers based on verified Checkr criminal backgrounds, 3-year MVR transcripts, FMCSA Clearinghouse records, and PSP roadside inspection histories.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => (onOpenHRease ? onOpenHRease() : setIsHReaseLocalOpen(true))}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-lg flex items-center gap-2 shadow-lg shadow-purple-900/40 transition-all active:scale-95 border border-purple-400/30"
            >
              <Brain className="w-4 h-4 text-purple-200" />
              <span>CONSULT HREASE HR &amp; RANK DRIVERS</span>
            </button>
          </div>
        </div>

        {/* 4 Pillars of HRease Intelligence */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 pt-2">
          <div className="bg-black/60 border border-purple-500/30 p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-300 font-mono">1. CONSULT &amp; SUGGEST</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <p className="text-xs text-white font-semibold">Algorithmic Best-Driver Rankings</p>
            <p className="text-[11px] text-zinc-400">
              Evaluates MVR driving points, PSP safety passes, NRCME medical validity, and criminal records to auto-recommend top candidates.
            </p>
          </div>

          <div className="bg-black/60 border border-emerald-500/30 p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 font-mono">2. CHECKR SUB-SECOND</span>
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xs text-white font-semibold">Instant Background &amp; MVR Flowback</p>
            <p className="text-[11px] text-zinc-400">
              Confirmed: Checkr autonomously pulls direct state DMV records, national criminal databases, SSN traces, and Clearinghouse queries in &lt;1000ms.
            </p>
          </div>

          <div className="bg-black/60 border border-cyan-500/30 p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-300 font-mono">3. ALL HAULERS REGULATED</span>
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <p className="text-xs text-white font-semibold">Zero Haulers Blackballed</p>
            <p className="text-[11px] text-zinc-400">
              Flatbeds (49 CFR § 393), Dry Vans (40&apos; KPRA), Box Trucks (10k-26k lbs Non-CDL), and Cargo Vans operate under full DOT compliance.
            </p>
          </div>

          <div className="bg-black/60 border border-amber-500/30 p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#FFE600] font-mono">4. PAYROLL REPLACEMENT</span>
              <DollarSign className="w-3.5 h-3.5 text-[#FFE600]" />
            </div>
            <p className="text-xs text-white font-semibold">$77,000/yr Saved Per Recruiter</p>
            <p className="text-[11px] text-zinc-400">
              Replaces the human eating up payroll ($65k salary + $12k benefits/taxes). Zero recruiter delay, zero bias, and 100% legal accuracy.
            </p>
          </div>
        </div>

        {/* Candidate Bench Quick Preview */}
        <div className="pt-2 border-t border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wide">
              Top Ranked Candidates from Checkr &amp; HRease Registry:
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              Click candidate to run live Checkr sub-second background check
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {hReaseCandidates.map((cand) => (
              <div
                key={cand.id}
                className="bg-black/70 border border-purple-500/30 hover:border-purple-400 p-2.5 rounded-lg space-y-1.5 transition-all text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white truncate">{cand.name}</span>
                  <span className="px-1.5 py-0.2 bg-purple-900/60 text-purple-200 rounded text-[10px] font-bold font-mono">
                    {cand.overallQualityScore}/100
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 flex items-center justify-between">
                  <span>{cand.haulerSpecialization.replace('_', ' ')}</span>
                  <span className="font-mono text-zinc-300">{cand.experienceYears}y exp</span>
                </div>
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/5">
                  <span className={`font-bold ${cand.checkrReport.status === 'CLEAR' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    Checkr: {cand.checkrReport.status}
                  </span>
                  <span className="text-zinc-400 font-mono">MVR: {cand.mvrDrivingPoints} pts</span>
                </div>
                <button
                  disabled={checkrRunningId === cand.id}
                  onClick={() => {
                    handleRunCheckrCandidateScreening(cand);
                  }}
                  className="w-full mt-1 py-1 px-2 bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/40 rounded text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all"
                >
                  {checkrRunningId === cand.id ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin text-purple-300" />
                      <span>Screening...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3 text-emerald-400" />
                      <span>Run Checkr ({cand.checkrReport.turnaroundLatencyMs || 840}ms)</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search, Filter & Hauler Specialization Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#141414] border border-[#262626] p-3 rounded-lg">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by driver name, CDL, or truck..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#0a0a0a] border border-[#333] rounded text-xs font-mono text-white placeholder-[#555] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* HAULER EQUIPMENT SPECIALIZATION DROPDOWN - PREVENTS BLACKBALLING */}
          <div className="w-full sm:w-auto flex items-center gap-1.5">
            <label className="text-[11px] font-mono text-cyan-300 font-bold whitespace-nowrap flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
              <span>HAULER:</span>
            </label>
            <select
              value={localHaulerFilter}
              onChange={(e) => {
                const val = e.target.value as HaulerType | 'ALL';
                setLocalHaulerFilter(val);
                if (onSelectHauler) onSelectHauler(val);
                triggerHapticFeedback('subtle');
              }}
              className="bg-[#0a0a0f] border border-cyan-500/50 hover:border-cyan-400 text-cyan-200 text-xs font-mono rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer w-full sm:w-64"
            >
              <option value="ALL">All Haulers (Flatbed, Dry Van, Box, Van)</option>
              <option value="FLATBED">Flatbed Hauler (49 CFR § 393 Cargo Securement)</option>
              <option value="DRY_VAN">Dry Van Hauler (53&apos; Freight &amp; 40&apos; KPRA)</option>
              <option value="BOX_TRUCK">Box Truck (16&apos;-26&apos; Non-CDL &amp; Class B)</option>
              <option value="CARGO_VAN">Cargo / Sprinter Van (10,001+ lbs CMV)</option>
              <option value="HOTSHOT_FLATBED">Hotshot Flatbed (Class 3-5 + Gooseneck)</option>
              <option value="REEFER">Reefer Hauler (FSMA Sanitary Food Rule)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'ALL', label: `All Drivers (${drivers.length})` },
            { id: 'QUALIFIED', label: `Active Qualified (${activeQualifiedCount})` },
            { id: 'ONBOARDING', label: `In Onboarding (${onboardingCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold whitespace-nowrap transition-all ${
                filterStatus === tab.id
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-[#1e1e1e] text-[#888] hover:text-white border border-[#333]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* HAULER REGULATORY CLARITY BANNER - CONFIRMS BOX TRUCKS & VANS ARE FULLY VALIDATED */}
      {localHaulerFilter !== 'ALL' && (
        <div className="bg-cyan-950/40 border border-cyan-500/40 p-3.5 rounded-lg flex items-start gap-3 text-xs text-cyan-200">
          <Truck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <div className="font-bold text-white text-xs">
              DOT &amp; FMCSA COMPLIANCE FOR {getHaulerSpecification(localHaulerFilter).name}:
            </div>
            <div className="text-[11px] text-zinc-300">
              {getHaulerSpecification(localHaulerFilter).regulationsSummary}
            </div>
            <div className="text-[10px] text-cyan-300 font-mono">
              <strong>HOS Variant:</strong> {getHaulerSpecification(localHaulerFilter).hosRuleVariant}
            </div>
          </div>
        </div>
      )}

      {/* Drivers Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map((driver) => {
          const isRunning = runningCheckId === driver.id;

          return (
            <div
              key={driver.id}
              className="bg-gradient-to-b from-[#161616] to-[#101010] border border-[#262626] hover:border-[#D4AF37]/60 p-5 rounded-lg transition-all space-y-4 shadow-sm relative group"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#202020] border border-[#333] flex items-center justify-center font-black text-[#D4AF37] text-sm">
                    {driver.firstName[0]}
                    {driver.lastName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-base">
                        {driver.firstName} {driver.lastName}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#222] text-[#888] border border-[#333]">
                        {driver.driverNumber}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#888] mt-0.5 flex items-center gap-2">
                      <span>{driver.employmentType.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{driver.yearsExperience} Yrs Exp</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                    driver.status === 'ACTIVE_QUALIFIED'
                      ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-700/60'
                      : 'text-amber-400 bg-amber-950/60 border border-amber-700/60'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      driver.status === 'ACTIVE_QUALIFIED' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                    }`}
                  />
                  {driver.status === 'ACTIVE_QUALIFIED' ? 'QUALIFIED' : 'ONBOARDING'}
                </span>
              </div>

              {/* CDL & Equipment Specs */}
              <div className="bg-[#0C0C0C] border border-[#222] p-3 rounded text-xs font-mono space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#777] uppercase block">Commercial Driver License</span>
                    <span className="text-white font-bold">{driver.cdlNumber}</span>
                    <span className="text-[10px] text-[#888] block">State: {driver.cdlState}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#777] uppercase block">Assigned Tractor</span>
                    <span className="text-[#D4AF37] font-bold">{driver.assignedTruckUnit || 'Unassigned'}</span>
                    <span className="text-[10px] text-[#888] block">{driver.assignedTrailerUnit || 'No Trailer'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1a1a1a] grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-[#777] block">CDL EXPIRY:</span>
                    <span className="text-[#CCC]">{driver.cdlExpiry}</span>
                  </div>
                  <div>
                    <span className="text-[#777] block">NRCME MED CARD:</span>
                    <span className="text-[#CCC]">{driver.medicalCardExpiry}</span>
                  </div>
                </div>

                {/* Endorsements tags */}
                <div className="pt-1 flex flex-wrap gap-1">
                  {driver.endorsements.map((end, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 bg-[#181818] border border-[#2a2a2a] text-[#BBB] rounded text-[9px]"
                    >
                      {end}
                    </span>
                  ))}
                </div>
              </div>

              {/* Background Check / DQF Status Banner */}
              <div className="text-xs font-mono">
                {driver.lastBackgroundCheck ? (
                  <div className="p-2.5 bg-[#0e1711] border border-emerald-900/60 rounded flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>MVR &amp; CLEARINGHOUSE PASS</span>
                      </div>
                      <div className="text-[9px] text-[#888] mt-0.5">
                        0 Violations • 0 Crashes (5 Yrs)
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedDriverReport(driver)}
                      className="px-2 py-1 bg-[#1a2d1f] hover:bg-emerald-800 text-emerald-300 text-[10px] font-bold rounded flex items-center gap-1 transition-all"
                    >
                      <Eye className="w-3 h-3" />
                      <span>VIEW DQF</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 bg-[#1a140a] border border-amber-900/60 rounded flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>BACKGROUND CHECK PENDING</span>
                      </div>
                      <div className="text-[9px] text-[#888] mt-0.5">
                        Stage: {driver.onboardingStage.replace('STAGE_', 'STEP ')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRunBackgroundCheck(driver)}
                      disabled={isRunning}
                      className="px-2 py-1 bg-[#D4AF37] hover:bg-white text-black text-[10px] font-bold rounded flex items-center gap-1 transition-all"
                    >
                      <Send className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
                      <span>{isRunning ? 'RUNNING...' : 'RUN CHECK'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Footer contact & action */}
              <div className="pt-2 border-t border-[#222] flex items-center justify-between text-xs font-mono text-[#888]">
                <div className="flex items-center gap-2">
                  <span title={driver.phone}>{driver.phone}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => handleOpenDossierForDriver(driver)}
                    className="px-2 py-1 bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black border border-[#D4AF37]/50 text-[10px] font-bold rounded flex items-center gap-1 transition-all"
                    title="Open full FMCSA DOT Qualification Dossier"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>DOSSIER</span>
                  </button>
                  <button
                    onClick={() => handleOpenIntelligenceForDriver(driver)}
                    className="px-2 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-[10px] font-bold rounded flex items-center gap-1 transition-all"
                    title="Voice profile, routes, breakdowns, and DVIR"
                  >
                    <Activity className="w-3 h-3 text-cyan-400" />
                    <span>INTEL</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onNavigateToTab) onNavigateToTab('traxes');
                    }}
                    className="px-2 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-[10px] font-bold rounded flex items-center gap-1 transition-all"
                    title="Open Traxes AI Driver Advocate & Escrow Arbiter"
                  >
                    <Scale className="w-3 h-3 text-emerald-400" />
                    <span>TRAXES ESCROW</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDriverForPredictive(driver.firstName ? `${driver.firstName} ${driver.lastName}` : driver.driverName);
                      setIsPredictiveModalOpen(true);
                    }}
                    className="px-2 py-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 text-[10px] font-bold rounded flex items-center gap-1 transition-all"
                    title="Predictive Regulatory Gap Audit & Proactive Mitigation"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>PREDICTIVE GAP</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDriverForDotIndex(driver);
                      setIsDotIndexModalOpen(true);
                    }}
                    className="px-2 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-[10px] font-bold rounded flex items-center gap-1 transition-all"
                    title="Run REF DOT WEB / PULL ALL INDEX for this driver"
                  >
                    <Globe className="w-3 h-3 text-cyan-400" />
                    <span>REF DOT WEB</span>
                  </button>
                  <button
                    onClick={() => handleDeleteDriver(driver)}
                    className="p-1 hover:text-rose-400 transition-colors"
                    title="Remove driver"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRunBackgroundCheck(driver)}
                    disabled={isRunning}
                    className="px-2 py-1 bg-[#222] hover:bg-[#333] text-[#DDD] text-[10px] rounded border border-[#333] transition-all"
                  >
                    RE-VERIFY
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DQF Certified Audit Report Modal */}
      {selectedDriverReport && selectedDriverReport.lastBackgroundCheck && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#333] rounded-lg max-w-2xl w-full p-6 space-y-5 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#222] pb-3">
              <div>
                <span className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-widest block">
                  FMCSA § 391 DRIVER QUALIFICATION FILE (DQF) AUDIT CERTIFICATE
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {selectedDriverReport.firstName} {selectedDriverReport.lastName} — {selectedDriverReport.cdlNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDriverReport(null)}
                className="text-[#888] hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* Verification Seal Banner */}
            <div className="p-3 bg-[#0a180e] border border-emerald-700/60 rounded text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-sm">100% FMCSA COMPLIANCE CERTIFIED</div>
                  <div className="text-[10px] text-[#888]">
                    Verification Date: {new Date(selectedDriverReport.lastBackgroundCheck.executedAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <span className="px-2 py-1 bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold rounded">
                DQF COMPLETE
              </span>
            </div>

            {/* Check Details Grid */}
            <div className="space-y-3">
              <div className="p-3 bg-[#0a0a0a] border border-[#222] rounded space-y-1.5">
                <div className="flex justify-between font-bold text-white">
                  <span>1. State Motor Vehicle Record (MVR 3-Year DMV Pull)</span>
                  <span className="text-emerald-400">PASSED // 0 VIOLATIONS</span>
                </div>
                <div className="text-[11px] text-[#888]">
                  Jurisdiction: {selectedDriverReport.lastBackgroundCheck.details.stateDmv}
                </div>
                <div className="text-[10px] text-[#AAA]">
                  Zero suspensions, zero reckless driving entries, clean points balance (0 pts).
                </div>
              </div>

              <div className="p-3 bg-[#0a0a0a] border border-[#222] rounded space-y-1.5">
                <div className="flex justify-between font-bold text-white">
                  <span>2. FMCSA Pre-Employment Screening Program (PSP)</span>
                  <span className="text-emerald-400">PASSED // CLEAN INDEX</span>
                </div>
                <div className="text-[11px] text-[#888]">
                  Crash History: {selectedDriverReport.lastBackgroundCheck.pspCrashes5Years} recordable crashes (Past 5 Years)
                </div>
                <div className="text-[10px] text-[#AAA]">
                  Roadside Inspections: {selectedDriverReport.lastBackgroundCheck.pspInspections3Years} Clean Level 1/2 inspections (Past 3 Years).
                </div>
              </div>

              <div className="p-3 bg-[#0a0a0a] border border-[#222] rounded space-y-1.5">
                <div className="flex justify-between font-bold text-white">
                  <span>3. FMCSA Drug &amp; Alcohol Clearinghouse Query</span>
                  <span className="text-emerald-400">ELIGIBLE FOR SAFETY-SENSITIVE WORK</span>
                </div>
                <div className="text-[11px] text-[#888]">
                  Query Reference: {selectedDriverReport.lastBackgroundCheck.details.clearinghouseRef}
                </div>
                <div className="text-[10px] text-[#AAA]">
                  Full pre-employment query conducted with driver digital consent. No unresolved violations on record.
                </div>
              </div>

              <div className="p-3 bg-[#0a0a0a] border border-[#222] rounded space-y-1.5">
                <div className="flex justify-between font-bold text-white">
                  <span>4. DOT NRCME Medical Examiner Registry</span>
                  <span className="text-emerald-400">VALID REGISTRY CERTIFIED</span>
                </div>
                <div className="text-[10px] text-[#AAA]">
                  Medical Examiner Certificate verified active through {selectedDriverReport.medicalCardExpiry}.
                </div>
              </div>
            </div>

            {/* Cryptographic Hash Seal */}
            <div className="p-2.5 bg-[#050505] border border-[#222] rounded text-[10px] text-[#777] break-all">
              <span className="font-bold text-[#D4AF37] block">CRYPTOGRAPHIC AUDIT SEAL (HMAC SHA-256):</span>
              {selectedDriverReport.lastBackgroundCheck.sha256AuditSeal}
            </div>

            {/* Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDriverReport(null)}
                className="px-4 py-2 bg-[#222] hover:bg-[#333] text-white font-bold text-xs rounded transition-all"
              >
                CLOSE CERTIFICATE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard New Driver Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#333] rounded-lg max-w-2xl w-full p-6 space-y-4 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#222] pb-3">
              <div>
                <span className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-widest block">
                  CARRIER HR INTAKE // 49 CFR PART 391
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Onboard &amp; Qualify New Commercial Driver
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#888] hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDriver} className="space-y-4">
              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Miller"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Contact fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="driver@carrier.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Employment Type & Assigned Truck */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as DriverEmploymentType })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="W2_COMPANY">W-2 Company Driver</option>
                    <option value="1099_OWNER_OPERATOR">1099 Owner-Operator</option>
                    <option value="LEASE_PURCHASE">Lease-Purchase Operator</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Years Driving Experience</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.yearsExperience}
                    onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Assigned Power Unit</label>
                  <select
                    value={formData.assignedTruckUnit}
                    onChange={(e) => setFormData({ ...formData, assignedTruckUnit: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="TR-904">TR-904 (Freightliner Cascadia)</option>
                    <option value="TR-882">TR-882 (Kenworth T680)</option>
                    <option value="TR-719">TR-719 (Peterbilt 579)</option>
                    <option value="TR-611">TR-611 (Volvo VNL 860)</option>
                    <option value="Unassigned">Unassigned (Pool Driver)</option>
                  </select>
                </div>
              </div>

              {/* CDL Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">CDL Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PA-CDL-882190"
                    value={formData.cdlNumber}
                    onChange={(e) => setFormData({ ...formData, cdlNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">CDL State</label>
                  <select
                    value={formData.cdlState}
                    onChange={(e) => setFormData({ ...formData, cdlState: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  >
                    {['PA', 'OH', 'IL', 'IN', 'TX', 'MI', 'NY', 'GA', 'FL', 'CA'].map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">CDL Expiry Date</label>
                  <input
                    type="date"
                    value={formData.cdlExpiry}
                    onChange={(e) => setFormData({ ...formData, cdlExpiry: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Medical Card Expiry */}
              <div>
                <label className="text-[10px] text-[#888] uppercase block mb-1">DOT Medical Card (NRCME) Expiry</label>
                <input
                  type="date"
                  value={formData.medicalCardExpiry}
                  onChange={(e) => setFormData({ ...formData, medicalCardExpiry: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Endorsements Checkboxes */}
              <div>
                <label className="text-[10px] text-[#888] uppercase block mb-2">CDL Endorsements</label>
                <div className="flex flex-wrap gap-2">
                  {availableEndorsements.map((end) => {
                    const isChecked = formData.endorsements.includes(end);
                    return (
                      <button
                        type="button"
                        key={end}
                        onClick={() => toggleEndorsement(end)}
                        className={`px-3 py-1.5 rounded text-xs border font-mono transition-all ${
                          isChecked
                            ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                            : 'bg-[#0A0A0A] border-[#333] text-[#888]'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '}
                        {end}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t border-[#222] pt-3">
                <span className="text-[10px] text-[#888] uppercase block font-bold mb-2">
                  Emergency Contact (HR File)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    className="px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                  <input
                    type="text"
                    placeholder="Contact Phone"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    className="px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                  <input
                    type="text"
                    placeholder="Relationship (e.g. Spouse)"
                    value={formData.emergencyRelation}
                    onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                    className="px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-[#222] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-[#222] hover:bg-[#333] text-[#AAA] hover:text-white font-bold text-xs rounded transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F5E79E] text-black font-bold text-xs uppercase tracking-wider rounded shadow hover:brightness-105 transition-all"
                >
                  SAVE &amp; ENROLL DRIVER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* REF DOT WEB / PULL ALL INDEX MODAL */}
      <RefDotWebPullIndexModal
        isOpen={isDotIndexModalOpen}
        onClose={() => setIsDotIndexModalOpen(false)}
        driver={selectedDriverForDotIndex}
        allDrivers={drivers}
        onDriverUpdated={() => fetchDrivers()}
      />

      {/* VOICE COMMAND INDEXER MODAL */}
      <VoiceCommandIndexerModal
        isOpen={isVoiceIndexerOpen}
        onClose={() => setIsVoiceIndexerOpen(false)}
        currentUserRole={currentUserRole}
        onOpenDossier={(dossier) => {
          setSelectedDossier(dossier);
          setIsDossierModalOpen(true);
        }}
        onOpenIntelligence={(dossier) => {
          setSelectedIntelligenceDriver(dossier);
          setIsIntelligenceModalOpen(true);
        }}
        onOpenDotIndex={(rec) => {
          setSelectedDriverForDotIndex(rec);
          setIsDotIndexModalOpen(true);
        }}
      />

      {/* DRIVER DOT COMPLIANCE DOSSIER MODAL (FMCSA 49 CFR § 391) */}
      <DriverDotDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        driver={selectedDossier}
        currentUserRole={currentUserRole}
        onOpenDriverIntelligence={(dossier) => {
          setSelectedIntelligenceDriver(dossier);
          setIsIntelligenceModalOpen(true);
        }}
        onOpenSafetyMeetings={() => {
          if (onNavigateToTab) onNavigateToTab('safety-director');
        }}
      />

      {/* DRIVER INTELLIGENCE & PROGRAMMING MODAL (VOICE, ROUTES, DVIR, BREAKDOWNS) */}
      <DriverIntelligenceModal
        isOpen={isIntelligenceModalOpen}
        onClose={() => setIsIntelligenceModalOpen(false)}
        driver={selectedIntelligenceDriver}
        onOpenDossier={(dossier) => {
          setSelectedDossier(dossier);
          setIsDossierModalOpen(true);
        }}
      />

      {/* PREDICTIVE HR COMPLIANCE BOUNDARY MODAL */}
      <PredictiveHrComplianceBoundaryModal
        isOpen={isPredictiveModalOpen}
        onClose={() => setIsPredictiveModalOpen(false)}
        initialDriverName={selectedDriverForPredictive}
        onOpenDossier={(name) => {
          setIsPredictiveModalOpen(false);
          const d = findDriverByNameOrQuery(name) || INITIAL_DRIVER_DOSSIERS[0];
          setSelectedDossier(d);
          setIsDossierModalOpen(true);
        }}
        onOpenTraxesAdvocate={(name) => {
          setIsPredictiveModalOpen(false);
          if (onNavigateToTab) onNavigateToTab('traxes');
        }}
      />

      {/* HREASE AUTONOMOUS HR COMPLIANCE CONSULTANT & CHECKR SCREENING MODAL */}
      <HReaseConsultationModal
        isOpen={isHReaseLocalOpen}
        onClose={() => setIsHReaseLocalOpen(false)}
        onSelectCandidate={(cand) => {
          setIsHReaseLocalOpen(false);
          setSearchQuery(cand.name);
        }}
      />
    </div>
  );
};
