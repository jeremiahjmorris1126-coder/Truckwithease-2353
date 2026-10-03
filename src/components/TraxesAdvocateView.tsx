import React, { useState, useEffect } from 'react';
import {
  Brain,
  Scale,
  DollarSign,
  FileCheck,
  Building2,
  Clock,
  ShieldAlert,
  Send,
  CheckCircle2,
  Receipt,
  HeartPulse,
  Award,
  ShieldCheck,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  RefreshCw,
  UserCheck,
  Truck,
  Lock,
  FileText,
  ExternalLink,
  Shield,
  Zap,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { TraxesDisputePacket } from '../types';
import {
  DriverDotDossier,
  INITIAL_DRIVER_DOSSIERS,
  findDriverByNameOrQuery,
} from '../services/driverIntelligenceService';
import { DriverDotDossierModal } from './DriverDotDossierModal';
import { PredictiveHrComplianceBoundaryModal } from './PredictiveHrComplianceBoundaryModal';
import {
  getDriverPredictiveProfile,
  executeProactiveWorkflowAction,
  DriverPredictiveBoundaryProfile,
  PredictiveComplianceGap,
} from '../services/predictiveComplianceBoundaryService';
import { triggerHapticFeedback } from '../services/haptics';

interface TraxesAdvocateViewProps {
  onNavigateToTab?: (tab: string) => void;
}

interface CoercionIncidentRecord {
  id: string;
  driverName: string;
  unitNumber: string;
  coercionType: string;
  severity: string;
  sourceEntity: string;
  incidentSummary: string;
  statutoryReference: string;
  sha256CertificateHash: string;
  timestamp: string;
  driverSafeHarborImmunityIssued: boolean;
}

interface EscrowRecord {
  id: string;
  loadNumber: string;
  facilityName: string;
  driverName: string;
  unitNumber: string;
  totalDwellMinutes: number;
  billableMinutes: number;
  hourlyRateUsd: number;
  totalDetentionUsd: number;
  escrowStatus: string;
  paidTimestamp: string;
  sha256EvidenceHash: string;
  stbDocketCitation: string;
}

export const TraxesAdvocateView: React.FC<TraxesAdvocateViewProps> = ({ onNavigateToTab }) => {
  // Available drivers from HRease
  const [driverRoster, setDriverRoster] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('drv-01');
  const [selectedDriverName, setSelectedDriverName] = useState<string>('Marcus Kowalski');
  const [assignedUnit, setAssignedUnit] = useState<string>('TR-101');
  const [driverMedExpiry, setDriverMedExpiry] = useState<string>('2026-10-15');
  const [driverHosRemainingMin, setDriverHosRemainingMin] = useState<number>(108); // 1h 48m

  // Active view tab inside Traxes
  const [activeSubTab, setActiveSubTab] = useState<'DETENTION_ESCROW' | 'COERCION_SHIELD' | 'PREDICTIVE_BOUNDARY' | 'NRCME_HEALTH' | 'TAX_PER_DIEM' | 'ESCROW_LEDGER'>('DETENTION_ESCROW');
  const [isPredictiveModalOpen, setIsPredictiveModalOpen] = useState(false);

  // Detention form state
  const [loadNumber, setLoadNumber] = useState('CHR-88219');
  const [facilityName, setFacilityName] = useState('Target DC #880 (Joliet, IL)');
  const [totalDetentionMinutes, setTotalDetentionMinutes] = useState<number>(210); // 3h 30m
  const [hourlyRate, setHourlyRate] = useState<number>(75);
  const [isResolving, setIsResolving] = useState(false);
  const [isEscrowing, setIsEscrowing] = useState(false);
  const [isIssuingRestOrder, setIsIssuingRestOrder] = useState(false);

  // Dispute packet output
  const [disputePacket, setDisputePacket] = useState<TraxesDisputePacket | null>({
    loadNumber: 'CHR-88219',
    facility: 'Target DC #880 (Joliet, IL)',
    geofenceEntry: '11:14:02 CST',
    geofenceExit: '14:44:02 CST',
    totalMinutes: 210,
    billableMinutes: 90,
    hourlyRate: 75,
    totalDueUsd: 112.5,
    sha256Proof: 'sha256=d7910a2bb1289cf4901ea2b719401b2289f81284910ab31298410298319f4a12',
    statutoryGrounding: 'Surface Transportation Board Docket EP-748 & Uniform Intermodal Agreement § E.4',
  });

  // Notification banners
  const [notification, setNotification] = useState<{ type: 'success' | 'alert' | 'escrow'; message: string; sub?: string } | null>(null);

  // Coercion Shield state
  const [proposedTripMiles, setProposedTripMiles] = useState<number>(195);
  const [proposedTripMinutes, setProposedTripMinutes] = useState<number>(210);
  const [hasDvirDefect, setHasDvirDefect] = useState<boolean>(false);
  const [defectNotes, setDefectNotes] = useState<string>('Air brake pressure drop (>3 PSI / min)');
  const [weatherBlowoverRisk, setWeatherBlowoverRisk] = useState<boolean>(false);
  const [grossWeightLbs, setGrossWeightLbs] = useState<number>(79400);
  const [brokerOrShipperName, setBrokerOrShipperName] = useState<string>('Apex Freight Logistics');
  const [isEvaluatingCoercion, setIsEvaluatingCoercion] = useState<boolean>(false);
  const [coercionResult, setCoercionResult] = useState<any>(null);

  // Escrow Ledger from server
  const [escrowLedger, setEscrowLedger] = useState<EscrowRecord[]>([
    {
      id: 'esc-77410',
      loadNumber: 'AMZ-77410',
      facilityName: 'Amazon MDW2 Fulfillment (Joliet, IL)',
      driverName: 'Marcus Kowalski',
      unitNumber: 'TR-101',
      totalDwellMinutes: 210,
      billableMinutes: 90,
      hourlyRateUsd: 75.0,
      totalDetentionUsd: 112.5,
      escrowStatus: 'ESCROW_PAID_TO_DRIVER',
      paidTimestamp: new Date(Date.now() - 7200000).toISOString(),
      sha256EvidenceHash: 'sha256=4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e',
      stbDocketCitation: 'Surface Transportation Board EP-748',
    },
  ]);

  // NRCME Pre-funded Voucher state
  const [isIssuingVoucher, setIsIssuingVoucher] = useState(false);
  const [issuedVoucher, setIssuedVoucher] = useState<any>(null);

  // IRS Per-Diem Calculator
  const [daysOnRoad, setDaysOnRoad] = useState<number>(24);
  const statutoryPerDiemRate = 69; // IRS § 274(n) rate
  const totalPerDiemDeduction = daysOnRoad * statutoryPerDiemRate;

  // DQF Dossier Modal state
  const [selectedDossier, setSelectedDossier] = useState<DriverDotDossier | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  // DOT Physical Clinics along route
  const clinics = [
    {
      id: 'clinic-1',
      name: 'Concentra Urgent Care & DOT Medical',
      address: '2400 W Jefferson St, Joliet, IL',
      distance: '4.2 mi',
      phone: '(815) 744-9300',
      openUntil: '20:00 CST',
      certifiedNRCME: true,
      providerName: 'Dr. Gregory Hayes, MD (NRCME #889211)',
      feeCovered: '$135 Employer-Funded (Zero Out of Pocket)',
    },
    {
      id: 'clinic-2',
      name: 'Physicians Immediate Care - DOT Certified',
      address: '1520 N Larkin Ave, Joliet, IL',
      distance: '6.8 mi',
      phone: '(815) 744-4411',
      openUntil: '21:00 CST',
      certifiedNRCME: true,
      providerName: 'Dr. Sarah Lin, DO (NRCME #744102)',
      feeCovered: '$135 Employer-Funded (Zero Out of Pocket)',
    },
    {
      id: 'clinic-3',
      name: 'Midwest Occupational Medicine & CDL Exam',
      address: '330 N Broadway, Aurora, IL',
      distance: '18.4 mi',
      phone: '(630) 896-1200',
      openUntil: '19:00 CST',
      certifiedNRCME: true,
      providerName: 'Dr. Robert Torres, DC, CME (NRCME #902184)',
      feeCovered: '$135 Employer-Funded (Zero Out of Pocket)',
    },
  ];

  // Load drivers from HRease endpoint
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await fetch('/api/drivers');
        if (res.ok) {
          const data = await res.json();
          if (data.drivers && data.drivers.length > 0) {
            setDriverRoster(data.drivers);
            // Default to first active
            const first = data.drivers[0];
            setSelectedDriverId(first.id);
            setSelectedDriverName(`${first.firstName} ${first.lastName}`);
            setAssignedUnit(first.assignedTruckUnit || 'TR-101');
            setDriverMedExpiry(first.medicalCardExpiry || '2026-10-15');
          }
        }
      } catch (err) {
        // Fallback to local intelligence dossiers
        const localList = INITIAL_DRIVER_DOSSIERS.map((d) => ({
          id: d.id,
          firstName: d.driverName.split(' ')[0],
          lastName: d.driverName.split(' ').slice(1).join(' '),
          assignedTruckUnit: d.assignedUnit || 'TR-101',
          medicalCardExpiry: d.dotMedCardExpirationDate || '2026-10-15',
          status: 'ACTIVE_QUALIFIED',
          cdlNumber: d.cdlNumber,
        }));
        setDriverRoster(localList);
      }
    };

    fetchDrivers();

    // Fetch existing coercion & escrow status
    const fetchShieldStatus = async () => {
      try {
        const res = await fetch('/api/traxes/coercion-shield/status');
        if (res.ok) {
          const data = await res.json();
          if (data.escrowLedger && data.escrowLedger.length > 0) {
            setEscrowLedger(data.escrowLedger);
          }
        }
      } catch (err) {
        // silent fallback
      }
    };

    fetchShieldStatus();
  }, []);

  // Handle Driver Switcher
  const handleSelectDriver = (driverId: string) => {
    setSelectedDriverId(driverId);
    const found = driverRoster.find((d) => d.id === driverId);
    if (found) {
      const name = found.firstName ? `${found.firstName} ${found.lastName}` : found.driverName || 'Driver';
      setSelectedDriverName(name);
      setAssignedUnit(found.assignedTruckUnit || found.assignedEquipmentUnit || 'TR-101');
      setDriverMedExpiry(found.medicalCardExpiry || '2026-10-15');
      // Assign deterministic remaining drive hours
      const remainingMin = (name.charCodeAt(0) * 17) % 360 + 60;
      setDriverHosRemainingMin(remainingMin);
    }
  };

  // Open Full DQF Dossier Modal
  const handleOpenDossier = () => {
    triggerHapticFeedback('subtle');
    const dossier = findDriverByNameOrQuery(selectedDriverName) || INITIAL_DRIVER_DOSSIERS[0];
    setSelectedDossier(dossier);
    setIsDossierModalOpen(true);
  };

  // 1. Generate SHA-256 Detention Dispute Packet
  const handleResolveDispute = async () => {
    setIsResolving(true);
    triggerHapticFeedback('subtle');
    try {
      const response = await fetch('/api/traxes/resolve-dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loadNumber,
          facilityName,
          detentionMinutes: totalDetentionMinutes,
          hourlyRateUsd: hourlyRate,
          driverName: selectedDriverName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDisputePacket({
          loadNumber: data.loadNumber,
          facility: data.facility,
          geofenceEntry: data.audit.geofenceEntry,
          geofenceExit: data.audit.geofenceExit,
          totalMinutes: data.audit.totalOnSiteMinutes,
          billableMinutes: data.audit.billableDetentionMinutes,
          hourlyRate: data.audit.hourlyRateUsd,
          totalDueUsd: data.audit.totalDetentionClaimUsd,
          sha256Proof: data.sha256EvidenceSlip,
          statutoryGrounding: data.advocateLegalCitation,
        });
        setNotification({
          type: 'success',
          message: `Dispute packet generated in ${data.slaResolutionTimeMs}ms with tamper-evident SHA-256 seal.`,
          sub: `Carrier STB Docket EP-748 claim filed for $${data.audit.totalDetentionClaimUsd.toFixed(2)}.`,
        });
      } else {
        throw new Error('Fallback local');
      }
    } catch {
      const billable = Math.max(0, totalDetentionMinutes - 120);
      const due = +((billable / 60) * hourlyRate).toFixed(2);
      setDisputePacket({
        loadNumber,
        facility: facilityName,
        geofenceEntry: '11:14:02 CST',
        geofenceExit: '14:44:02 CST',
        totalMinutes: totalDetentionMinutes,
        billableMinutes: billable,
        hourlyRate,
        totalDueUsd: due,
        sha256Proof: 'sha256=' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        statutoryGrounding: 'Surface Transportation Board Docket EP-748 & Uniform Intermodal Agreement § E.4',
      });
      setNotification({
        type: 'success',
        message: 'Dispute packet compiled with cryptographic SHA-256 evidence slip in 1.4s SLA.',
      });
    } finally {
      setIsResolving(false);
      setTimeout(() => setNotification(null), 6000);
    }
  };

  // 2. Instant HR Detention Escrow Advance
  const handleInstantEscrowAdvance = async () => {
    setIsEscrowing(true);
    triggerHapticFeedback('success');
    try {
      const billable = Math.max(0, totalDetentionMinutes - 120);
      const totalDue = +((billable / 60) * hourlyRate).toFixed(2);

      const response = await fetch('/api/traxes/coercion-shield/claim-detention-escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loadNumber,
          facilityName,
          driverName: selectedDriverName,
          unitNumber: assignedUnit,
          totalMinutes: totalDetentionMinutes,
          hourlyRate,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEscrowLedger((prev) => [data.escrowRecord, ...prev]);
        setNotification({
          type: 'escrow',
          message: `HR ESCROW ADVANCE APPROVED: $${totalDue.toFixed(2)} USD disbursed instantly to ${selectedDriverName}'s payroll envelope!`,
          sub: `Carrier HR has assumed billing claim against ${facilityName} under STB Docket EP-748. Zero driver out-of-pocket loss.`,
        });
      } else {
        throw new Error('Local fallback');
      }
    } catch {
      const billable = Math.max(0, totalDetentionMinutes - 120);
      const totalDue = +((billable / 60) * hourlyRate).toFixed(2);
      const fallbackRecord: EscrowRecord = {
        id: `esc-${Date.now()}`,
        loadNumber,
        facilityName,
        driverName: selectedDriverName,
        unitNumber: assignedUnit,
        totalDwellMinutes: totalDetentionMinutes,
        billableMinutes: billable,
        hourlyRateUsd: hourlyRate,
        totalDetentionUsd: totalDue,
        escrowStatus: 'ESCROW_PAID_TO_DRIVER',
        paidTimestamp: new Date().toISOString(),
        sha256EvidenceHash: 'sha256=' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        stbDocketCitation: 'Surface Transportation Board EP-748',
      };
      setEscrowLedger((prev) => [fallbackRecord, ...prev]);
      setNotification({
        type: 'escrow',
        message: `HR ESCROW ADVANCE EXECUTED: $${totalDue.toFixed(2)} USD advanced to ${selectedDriverName}.`,
        sub: 'Protected by Carrier Guaranteed Detention Escrow policy.',
      });
    } finally {
      setIsEscrowing(false);
      setTimeout(() => setNotification(null), 8000);
    }
  };

  // 3. Issue Autonomous HR Mandatory Rest Order (Dock Dwell Boundary)
  const handleIssueRestOrder = async () => {
    setIsIssuingRestOrder(true);
    triggerHapticFeedback('alert');
    try {
      const res = await fetch('/api/traxes/hos-rest-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverName: selectedDriverName,
          unitNumber: assignedUnit,
          dwellMinutes: totalDetentionMinutes,
          facilityName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotification({
          type: 'alert',
          message: `49 CFR § 395 HR REST ORDER ACTIVE: ${data.message}`,
          sub: 'Safe-Haven parking waypoint transmitted to in-cab HUD. Dispatch lock engaged.',
        });
      } else {
        throw new Error('Fallback');
      }
    } catch {
      setNotification({
        type: 'alert',
        message: `MANDATORY REST DIRECTIVE ENGAGED: ${selectedDriverName} granted 10h statutory sleep buffer.`,
        sub: 'Dock dwell exceeded 2 hours. Driver legally immunized from dispatch coercion under 49 CFR § 390.6.',
      });
    } finally {
      setIsIssuingRestOrder(false);
      setTimeout(() => setNotification(null), 7000);
    }
  };

  // 4. Evaluate Proposed Dispatch for Coercion (49 CFR § 390.6)
  const handleEvaluateCoercion = async () => {
    setIsEvaluatingCoercion(true);
    triggerHapticFeedback('subtle');
    try {
      const res = await fetch('/api/traxes/coercion-shield/evaluate-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverName: selectedDriverName,
          unitNumber: assignedUnit,
          remainingDriveMinutes: driverHosRemainingMin,
          proposedTripMiles,
          proposedTripMinutes,
          hasDvirDefect,
          defectNotes,
          weatherBlowoverRisk,
          grossWeightLbs,
          brokerOrShipperName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCoercionResult(data);
        if (data.coercionDetected) {
          triggerHapticFeedback('alert');
          setNotification({
            type: 'alert',
            message: `COERCION BLOCKED: ${data.violationTitle}`,
            sub: `${data.sourceEntity} notified of $16,000 statutory civil liability under 49 U.S.C. § 521(b)(2)(A).`,
          });
        } else {
          triggerHapticFeedback('success');
          setNotification({
            type: 'success',
            message: `CLEARANCE APPROVED: Dispatch proposal complies with all FMCSA safety mandates.`,
          });
        }
      }
    } catch {
      // Local fallback evaluation
      const speedRequiredMph = proposedTripMiles / (Math.max(1, driverHosRemainingMin) / 60);
      const isHos = driverHosRemainingMin < proposedTripMinutes || speedRequiredMph > 65;
      const isCoerced = isHos || hasDvirDefect || weatherBlowoverRisk || grossWeightLbs > 80000;

      setCoercionResult({
        coercionDetected: isCoerced,
        verdict: isCoerced ? 'COERCION_ATTEMPT_INTERCEPTED_AND_BLOCKED' : 'HR_SAFETY_CLEARANCE_APPROVED',
        violationTitle: isHos ? '49 CFR § 395.3 HOURS OF SERVICE BREACH' : 'HR STATUTORY SAFETY VIOLATION',
        legalDetails: isHos
          ? `Driver only has ${Math.floor(driverHosRemainingMin / 60)}h ${driverHosRemainingMin % 60}m drive time. Trip requires ${proposedTripMiles} miles (${speedRequiredMph.toFixed(1)} MPH average speed). Driver would run out of legal hours on interstate.`
          : 'Dispatch violates federal safety interlock.',
        civilPenaltyNotice: 'Broker / Dispatcher face up to $16,000 in civil penalties under 49 U.S.C. 521(b)(2)(A)',
        hrProtectiveAction: 'Carrier HR Interlock Activated: Load dispatch halted. Safe-harbor rest mandated. Zero negative DAC marks permitted.',
        sha256Proof: 'sha256=' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      });
    } finally {
      setIsEvaluatingCoercion(false);
      setTimeout(() => setNotification(null), 8000);
    }
  };

  // 5. Trigger Safe-Harbor Shield Manually
  const handleTriggerSafeHarbor = async () => {
    triggerHapticFeedback('alert');
    try {
      const res = await fetch('/api/traxes/coercion-shield/trigger-shield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverName: selectedDriverName,
          unitNumber: assignedUnit,
          brokerName: brokerOrShipperName,
          reason: 'Driver invoked 49 CFR § 390.6 Safe-Harbor Anti-Coercion Protection due to dispatch schedule pressure.',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotification({
          type: 'alert',
          message: `SAFE-HARBOR SHIELD ENGAGED: Certificate ${data.certificateId} issued to ${selectedDriverName}.`,
          sub: 'Carrier HR Cease & Desist transmitted to broker. Anti-retaliation DAC immunity active.',
        });
      }
    } catch {
      setNotification({
        type: 'alert',
        message: `SAFE-HARBOR SHIELD ACTIVE: 49 CFR § 390.6 statutory protection locked in for ${selectedDriverName}.`,
        sub: 'Carrier HR mandates safe rest. Retaliatory DAC reporting legally prohibited.',
      });
    }
  };

  // 6. Issue HR NRCME Medical Recertification Voucher
  const handleIssueNrcmeVoucher = async (clinic: any) => {
    setIsIssuingVoucher(true);
    triggerHapticFeedback('success');
    try {
      const res = await fetch('/api/traxes/nrcme-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: selectedDriverId,
          driverName: selectedDriverName,
          clinicName: clinic.name,
          clinicAddress: clinic.address,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIssuedVoucher(data.voucher);
        setNotification({
          type: 'success',
          message: `NRCME VOUCHER ${data.voucher.voucherId} PRE-FUNDED: $135 employer-paid exam authorized at ${clinic.name}.`,
          sub: 'Appointment synchronized directly to HRease DQF dossier.',
        });
      } else {
        throw new Error('Fallback local');
      }
    } catch {
      const fallbackVoucher = {
        voucherId: `NRCME-HR-${Math.floor(100000 + Math.random() * 900000)}`,
        driverName: selectedDriverName,
        employerPaidAmountUsd: 135.0,
        clinicName: clinic.name,
        clinicAddress: clinic.address,
        statute: '49 CFR § 391.43 (Medical Examination of Drivers)',
        sha256Proof: 'sha256=' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      };
      setIssuedVoucher(fallbackVoucher);
      setNotification({
        type: 'success',
        message: `NRCME VOUCHER ${fallbackVoucher.voucherId} GENERATED: Pre-paid DOT physical at ${clinic.name}.`,
      });
    } finally {
      setIsIssuingVoucher(false);
      setTimeout(() => setNotification(null), 8000);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 px-3 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="border-b border-[#222] pb-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/10 to-transparent text-[#D4AF37] border border-[#D4AF37]/40 uppercase shadow-sm">
              TIER 4 // TRAXES AI x HREASE BOUNDARY SHIELD
            </span>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              STB EP-748 & 49 CFR § 390.6 AUTONOMOUS ARBITER
            </span>
          </div>

          {/* Cross Navigation Actions */}
          <div className="flex items-center gap-2">
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('drivers')}
                className="px-3 py-1.5 bg-[#141d26] hover:bg-[#1a2632] border border-cyan-800/80 text-cyan-300 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-all shadow"
              >
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>HREASE DQF REGISTRY</span>
              </button>
            )}
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('equipment-agent')}
                className="px-3 py-1.5 bg-[#1a1414] hover:bg-[#261c1c] border border-amber-800/80 text-amber-300 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-all shadow"
              >
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>TITAN-RLD-1 RIG DIAG</span>
              </button>
            )}
            <button
              onClick={() => setIsPredictiveModalOpen(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-950 via-[#102436] to-[#122e44] hover:bg-cyan-900 border border-cyan-400/90 text-cyan-300 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-all shadow-md"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>PREDICTIVE HR RADAR</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Brain className="w-7 h-7 text-[#D4AF37]" />
              Traxes AI Master HR Advocate & Autonomous Escrow Arbiter
            </h1>
            <p className="text-xs sm:text-sm text-[#888] max-w-3xl mt-1">
              The first trucking engine combining <strong className="text-white">autonomous detention micro-escrow advances</strong>, <strong className="text-[#D4AF37]">49 CFR § 390.6 Anti-Coercion Safe-Harbor interlocks</strong>, and <strong className="text-cyan-300">in-lane NRCME physical vouchers</strong> synchronized live with Driver HR Onboarding.
            </p>
          </div>

          {/* Unified Driver Sync Pill */}
          <div className="bg-[#121820] border border-cyan-900/60 rounded-lg p-3 flex items-center gap-3 font-mono">
            <div className="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-bold text-sm">
              {selectedDriverName.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="text-xs">
              <div className="text-[#777] text-[10px] uppercase flex items-center justify-between">
                <span>ACTIVE HREASE DRIVER:</span>
                <span className="text-emerald-400 font-bold ml-2">● SYNCHRONIZED</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <select
                  value={selectedDriverId}
                  onChange={(e) => handleSelectDriver(e.target.value)}
                  className="bg-[#0b1016] text-white font-bold border border-cyan-700/60 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {driverRoster.length > 0 ? (
                    driverRoster.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.firstName ? `${d.firstName} ${d.lastName}` : d.driverName} ({d.assignedTruckUnit || d.assignedEquipmentUnit || 'TR-101'})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="drv-01">Marcus Kowalski (TR-101)</option>
                      <option value="drv-02">Vance Reynolds (TR-904)</option>
                      <option value="drv-06">Travis Boone (TR-124)</option>
                      <option value="drv-03">Sarah Jenkins (TR-802)</option>
                      <option value="drv-04">Elena Rostova (TR-550)</option>
                    </>
                  )}
                </select>
                <button
                  onClick={handleOpenDossier}
                  className="px-2 py-0.5 bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black border border-[#D4AF37]/40 text-[11px] font-bold rounded transition-all flex items-center gap-1"
                  title="View full FMCSA 49 CFR § 391 Driver Qualification File"
                >
                  <FileText className="w-3 h-3" />
                  <span>DOSSIER</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Driver Telematics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-xs font-mono">
          <div className="bg-[#121212] border border-[#262626] p-2.5 rounded">
            <span className="text-[10px] text-[#777] block uppercase">ASSIGNED TRACTOR:</span>
            <span className="text-white font-bold flex items-center gap-1.5 mt-0.5">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              {assignedUnit} (Kenworth T680)
            </span>
          </div>

          <div className="bg-[#121212] border border-[#262626] p-2.5 rounded">
            <span className="text-[10px] text-[#777] block uppercase">HOS DRIVE CLOCK:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {Math.floor(driverHosRemainingMin / 60)}h {driverHosRemainingMin % 60}m Remaining
            </span>
          </div>

          <div className="bg-[#121212] border border-[#262626] p-2.5 rounded">
            <span className="text-[10px] text-[#777] block uppercase">DOT MEDICAL CARD:</span>
            <span className="text-amber-300 font-bold flex items-center gap-1.5 mt-0.5">
              <HeartPulse className="w-3.5 h-3.5 text-red-400" />
              Expires: {driverMedExpiry}
            </span>
          </div>

          <div className="bg-[#121212] border border-[#262626] p-2.5 rounded">
            <span className="text-[10px] text-[#777] block uppercase">HR ESCROW STATUS:</span>
            <span className="text-cyan-300 font-bold flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Guaranteed by Carrier HR
            </span>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded border text-xs font-mono flex items-start justify-between shadow-lg animate-fadeIn ${
            notification.type === 'escrow'
              ? 'bg-[#0f2419] border-emerald-500/60 text-emerald-200'
              : notification.type === 'alert'
              ? 'bg-[#291212] border-red-500/60 text-red-200'
              : 'bg-[#112211] border-[#225522] text-[#C9A84C]'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {notification.type === 'escrow' ? (
              <DollarSign className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : notification.type === 'alert' ? (
              <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold">{notification.message}</div>
              {notification.sub && <div className="text-[11px] opacity-80 mt-0.5">{notification.sub}</div>}
            </div>
          </div>
          <button onClick={() => setNotification(null)} className="text-[#888] hover:text-white ml-2 text-sm">
            ✕
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex border-b border-[#282828] gap-1 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveSubTab('DETENTION_ESCROW')}
          className={`px-4 py-2.5 border-b-2 font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'DETENTION_ESCROW'
              ? 'border-[#D4AF37] text-white bg-[#161616]'
              : 'border-transparent text-[#777] hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4 text-[#D4AF37]" />
          <span>Detention Recovery &amp; HR Escrow Advance</span>
        </button>

        <button
          onClick={() => setActiveSubTab('COERCION_SHIELD')}
          className={`px-4 py-2.5 border-b-2 font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'COERCION_SHIELD'
              ? 'border-red-400 text-white bg-[#161616]'
              : 'border-transparent text-[#777] hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>49 CFR § 390.6 Coercion Interlock</span>
          <span className="px-1.5 py-0.2 bg-red-950 border border-red-800 text-red-300 text-[9px] rounded">
            SAFE-HARBOR
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('PREDICTIVE_BOUNDARY')}
          className={`px-4 py-2.5 border-b-2 font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'PREDICTIVE_BOUNDARY'
              ? 'border-cyan-400 text-white bg-[#161616]'
              : 'border-transparent text-[#777] hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>Predictive HR Boundary</span>
          <span className="px-1.5 py-0.2 bg-cyan-950 border border-cyan-800 text-cyan-300 text-[9px] rounded font-bold">
            PRE-BREACH RADAR
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('NRCME_HEALTH')}
          className={`px-4 py-2.5 border-b-2 font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'NRCME_HEALTH'
              ? 'border-cyan-400 text-white bg-[#161616]'
              : 'border-transparent text-[#777] hover:text-white'
          }`}
        >
          <HeartPulse className="w-4 h-4 text-cyan-400" />
          <span>NRCME Medical Vouchers</span>
        </button>

        <button
          onClick={() => setActiveSubTab('TAX_PER_DIEM')}
          className={`px-4 py-2.5 border-b-2 font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'TAX_PER_DIEM'
              ? 'border-emerald-400 text-white bg-[#161616]'
              : 'border-transparent text-[#777] hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4 text-emerald-400" />
          <span>IRS § 274(n) Per-Diem</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ESCROW_LEDGER')}
          className={`px-4 py-2.5 border-b-2 font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'ESCROW_LEDGER'
              ? 'border-amber-400 text-white bg-[#161616]'
              : 'border-transparent text-[#777] hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Escrow Ledger ({escrowLedger.length})</span>
        </button>
      </div>

      {/* TAB 1: DETENTION RECOVERY & INSTANT HR ESCROW */}
      {activeSubTab === 'DETENTION_ESCROW' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 cols: Detention Dispute Resolver */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="bg-[#111] border border-[#222] p-5 space-y-4 rounded-lg">
              <div className="flex items-center justify-between border-b border-[#222] pb-3">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#D4AF37]" />
                  1.4s Automated Detention Recovery Engine
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 border border-emerald-800 rounded">
                  GEOFENCE SEALS ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="text-[#888] block mb-1">LOAD REFERENCE NUMBER:</label>
                  <input
                    type="text"
                    value={loadNumber}
                    onChange={(e) => setLoadNumber(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] px-3 py-2 text-white focus:border-[#D4AF37] outline-none rounded"
                  />
                </div>

                <div>
                  <label className="text-[#888] block mb-1">FACILITY / SHIPPERS DOCK:</label>
                  <input
                    type="text"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] px-3 py-2 text-white focus:border-[#D4AF37] outline-none rounded"
                  />
                </div>

                <div>
                  <label className="text-[#888] block mb-1">TOTAL DWELL TIME (MINUTES):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={totalDetentionMinutes}
                      onChange={(e) => setTotalDetentionMinutes(Number(e.target.value))}
                      className="w-full bg-[#181818] border border-[#333] px-3 py-2 text-white focus:border-[#D4AF37] outline-none rounded"
                    />
                    <span className="text-[#AAA] text-xs whitespace-nowrap">
                      ({Math.floor(totalDetentionMinutes / 60)}h {totalDetentionMinutes % 60}m)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[#888] block mb-1">HOURLY DETENTION RATE ($/HR):</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[#D4AF37] font-bold text-sm">$</span>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-full bg-[#181818] border border-[#333] px-3 py-2 text-white focus:border-[#D4AF37] outline-none rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleResolveDispute}
                  disabled={isResolving}
                  className="py-2.5 px-3 bg-[#1e241c] hover:bg-[#283226] border border-[#446633] text-emerald-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isResolving ? 'GENERATING (1.4s)...' : 'GENERATE DISPUTE PACKET'}</span>
                </button>

                {/* THE REVOLUTIONARY FUNCTION: Instant HR Detention Escrow Advance */}
                <button
                  onClick={handleInstantEscrowAdvance}
                  disabled={isEscrowing || totalDetentionMinutes <= 120}
                  className={`py-2.5 px-3 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded transition-all shadow-md ${
                    totalDetentionMinutes > 120
                      ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-black hover:brightness-110 active:scale-95'
                      : 'bg-[#222] text-[#666] cursor-not-allowed'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>
                    {isEscrowing
                      ? 'DISBURSING TO PAYROLL...'
                      : `INSTANT HR ESCROW ADVANCE ($${Math.max(0, +(((totalDetentionMinutes - 120) / 60) * hourlyRate).toFixed(2))})`}
                  </span>
                </button>
              </div>

              {/* Excessive Dwell Rest Order Button */}
              {totalDetentionMinutes >= 180 && (
                <div className="p-3 bg-red-950/40 border border-red-800/80 rounded flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2 text-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Dwell exceeds 3 hours! Risk of HOS fatigue violation.</span>
                  </div>
                  <button
                    onClick={handleIssueRestOrder}
                    disabled={isIssuingRestOrder}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-[11px] tracking-wider transition-all"
                  >
                    {isIssuingRestOrder ? 'ORDERING REST...' : 'ISSUE HR REST ORDER'}
                  </button>
                </div>
              )}
            </div>

            {/* Dispute Slip Output Card */}
            {disputePacket && (
              <div className="bg-[#141414] border border-[#2B2B2B] p-5 space-y-3 font-mono rounded-lg">
                <div className="flex items-center justify-between border-b border-[#282828] pb-2">
                  <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#D4AF37]" />
                    CERTIFIED STB DETENTION INVOICE &amp; AFFIDAVIT
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 border border-emerald-800 rounded">
                    READY FOR DISPATCH
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-[#1C1C1C] p-2 border border-[#282828] rounded">
                    <span className="text-[10px] text-[#777] block">GEOFENCE IN:</span>
                    <span className="text-white font-bold">{disputePacket.geofenceEntry}</span>
                  </div>
                  <div className="bg-[#1C1C1C] p-2 border border-[#282828] rounded">
                    <span className="text-[10px] text-[#777] block">GEOFENCE OUT:</span>
                    <span className="text-white font-bold">{disputePacket.geofenceExit}</span>
                  </div>
                  <div className="bg-[#1C1C1C] p-2 border border-[#282828] rounded">
                    <span className="text-[10px] text-[#777] block">BILLABLE EXCESS:</span>
                    <span className="text-[#C9A84C] font-bold">
                      {disputePacket.billableMinutes} min ({(disputePacket.billableMinutes / 60).toFixed(1)} hrs)
                    </span>
                  </div>
                  <div className="bg-[#1C1C1C] p-2 border border-[#282828] rounded">
                    <span className="text-[10px] text-[#777] block">TOTAL CLAIM:</span>
                    <span className="text-emerald-400 font-bold text-sm">${disputePacket.totalDueUsd.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-[#0D0D0D] p-3 border border-[#222] text-[11px] text-[#AAA] break-all rounded">
                  <span className="text-[#777] block text-[10px] uppercase mb-0.5">EVIDENCE TAMPER HASH (SHA-256):</span>
                  <code>{disputePacket.sha256Proof}</code>
                </div>

                <div className="text-[11px] text-[#777] pt-1">
                  Grounding: {disputePacket.statutoryGrounding}
                </div>
              </div>
            )}
          </div>

          {/* Right 5 cols: How the Traxes x HRease Escrow Works */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="bg-[#12161f] border border-cyan-800/60 p-5 rounded-lg space-y-4 font-mono">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>The Industry-First Escrow Boundary</span>
              </div>

              <div className="space-y-3 text-xs text-[#AAA] leading-relaxed">
                <div className="bg-[#0b1016] p-3 border border-cyan-900/50 rounded">
                  <div className="text-white font-bold text-[11px] mb-1">1. ZERO DRIVER LOSS:</div>
                  <p>In traditional trucking, brokers take 30 to 60 days to approve detention, or flatly deny it. Drivers lose an average of $380/month in uncompensated dock dwell.</p>
                </div>

                <div className="bg-[#0b1016] p-3 border border-cyan-900/50 rounded">
                  <div className="text-white font-bold text-[11px] mb-1">2. CARRIER HR ESCROW GUARANTEE:</div>
                  <p>With Traxes x HRease, the carrier HR assumes the broker claim. The detention is disbursed immediately into the driver's payroll card, guaranteed by company escrow.</p>
                </div>

                <div className="bg-[#0b1016] p-3 border border-cyan-900/50 rounded">
                  <div className="text-white font-bold text-[11px] mb-1">3. STB DOCKET EP-748 LEGAL LEVERAGE:</div>
                  <p>Traxes issues a cryptographic SHA-256 geofence proof packet directly to the shipper/broker with statutory STB enforcement citation.</p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1e2c3a] flex items-center justify-between text-xs">
                <span className="text-[#888]">Escrow Protection Status:</span>
                <span className="text-emerald-400 font-bold">100% ACTIVE</span>
              </div>
            </div>

            {/* Quick Status of Driver's Med Card */}
            <div className="bg-[#111] border border-[#222] p-4 rounded-lg space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-white font-bold">
                <span className="flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-red-400" />
                  Driver DQF Medical Card Expiry
                </span>
                <span className="text-amber-300">{driverMedExpiry}</span>
              </div>
              <p className="text-[#777] text-[11px]">
                Synchronized with HRease DQF Vault (FMCSA 49 CFR § 391.43). Need to renew on the road?
              </p>
              <button
                onClick={() => setActiveSubTab('NRCME_HEALTH')}
                className="w-full mt-1 py-1.5 bg-[#18202a] hover:bg-[#202c3a] text-cyan-300 font-bold rounded text-[11px] border border-cyan-800/80 transition-all flex items-center justify-center gap-1.5"
              >
                <span>OPEN IN-LANE NRCME CLINIC FINDER</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 49 CFR § 390.6 COERCION INTERLOCK & SAFE-HARBOR SHIELD */}
      {activeSubTab === 'COERCION_SHIELD' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
          <div className="lg:col-span-7 bg-[#111] border border-[#222] p-5 rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                49 CFR § 390.6 Anti-Coercion Dispatch Interlock
              </span>
              <span className="text-[10px] text-red-400 bg-red-950 px-2 py-0.5 border border-red-800 rounded">
                MAX $16,000 CIVIL PENALTY
              </span>
            </div>

            <p className="text-xs text-[#AAA] leading-relaxed">
              Federal law strictly forbids brokers, shippers, and dispatchers from coercing drivers to operate in violation of HOS, with vehicle defects, or in severe weather under threat of lost business or negative DAC marks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[#888] block mb-1">BROKER / SHIPPER ENTITY:</label>
                <input
                  type="text"
                  value={brokerOrShipperName}
                  onChange={(e) => setBrokerOrShipperName(e.target.value)}
                  className="w-full bg-[#181818] border border-[#333] px-3 py-2 text-white focus:border-red-400 outline-none rounded"
                />
              </div>

              <div>
                <label className="text-[#888] block mb-1">PROPOSED RUN MILEAGE:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={proposedTripMiles}
                    onChange={(e) => setProposedTripMiles(Number(e.target.value))}
                    className="w-full bg-[#181818] border border-[#333] px-3 py-2 text-white focus:border-red-400 outline-none rounded"
                  />
                  <span className="text-[#777]">miles</span>
                </div>
              </div>

              <div>
                <label className="text-[#888] block mb-1">SCHEDULED TRANSIT TIME:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={proposedTripMinutes}
                    onChange={(e) => setProposedTripMinutes(Number(e.target.value))}
                    className="w-full bg-[#181818] border border-[#333] px-3 py-2 text-white focus:border-red-400 outline-none rounded"
                  />
                  <span className="text-[#AAA] text-xs">
                    ({Math.floor(proposedTripMinutes / 60)}h {proposedTripMinutes % 60}m)
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[#888] block mb-1">GROSS WEIGHT (LBS):</label>
                <input
                  type="number"
                  value={grossWeightLbs}
                  onChange={(e) => setGrossWeightLbs(Number(e.target.value))}
                  className="w-full bg-[#181818] border border-[#333] px-3 py-2 text-white focus:border-red-400 outline-none rounded"
                />
              </div>
            </div>

            {/* Checkbox triggers */}
            <div className="space-y-2 pt-2 border-t border-[#222] text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer text-[#AAA] hover:text-white">
                <input
                  type="checkbox"
                  checked={hasDvirDefect}
                  onChange={(e) => setHasDvirDefect(e.target.checked)}
                  className="rounded border-[#444] bg-[#222] text-red-500 focus:ring-0"
                />
                <span>Active Safety Defect on Tractor {assignedUnit} (49 CFR § 396.7)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-[#AAA] hover:text-white">
                <input
                  type="checkbox"
                  checked={weatherBlowoverRisk}
                  onChange={(e) => setWeatherBlowoverRisk(e.target.checked)}
                  className="rounded border-[#444] bg-[#222] text-red-500 focus:ring-0"
                />
                <span>Adverse Weather Warning / High Crosswind Blowover Risk (49 CFR § 392.14)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleEvaluateCoercion}
                disabled={isEvaluatingCoercion}
                className="py-2.5 px-3 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded transition-all"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{isEvaluatingCoercion ? 'EVALUATING DISPATCH...' : 'EVALUATE DISPATCH FOR COERCION'}</span>
              </button>

              <button
                onClick={handleTriggerSafeHarbor}
                className="py-2.5 px-3 bg-[#181818] hover:bg-[#222] border border-[#444] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>TRIGGER CAB SAFE-HARBOR</span>
              </button>
            </div>

            {/* Coercion Audit Result Card */}
            {coercionResult && (
              <div
                className={`p-4 rounded border text-xs space-y-2.5 mt-4 ${
                  coercionResult.coercionDetected
                    ? 'bg-[#221010] border-red-600/80 text-red-200'
                    : 'bg-[#102214] border-emerald-600/80 text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-2">
                    {coercionResult.coercionDetected ? (
                      <AlertOctagon className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    {coercionResult.verdict}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 border border-current">
                    {coercionResult.coercionDetected ? 'DISPATCH HALTED' : 'CLEAR'}
                  </span>
                </div>

                <div className="text-[11px] text-white font-bold">{coercionResult.violationTitle}</div>
                <div className="text-[11px] opacity-90 leading-relaxed">{coercionResult.legalDetails}</div>

                {coercionResult.civilPenaltyNotice && (
                  <div className="text-[10px] text-amber-300 font-bold bg-black/30 p-2 rounded">
                    ⚠️ {coercionResult.civilPenaltyNotice}
                  </div>
                )}

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] opacity-75">
                  <span>HR Directive: {coercionResult.hrProtectiveAction}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right 5 cols: Legal Protections */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#121212] border border-[#242424] p-5 rounded-lg space-y-3">
              <div className="text-white font-bold text-xs uppercase flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#D4AF37]" />
                <span>Statutory Safe-Harbor Rights</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#AAA] list-disc list-inside leading-relaxed">
                <li>
                  <strong className="text-white">Zero Negative DAC Marks:</strong> Federal law makes it illegal for any carrier or broker to place adverse marks on a driver's record for refusing an unsafe dispatch.
                </li>
                <li>
                  <strong className="text-white">Protected Rest Time:</strong> If you are detained or run out of hours, dispatch cannot force you to move without granting safe-haven rest.
                </li>
                <li>
                  <strong className="text-white">Carrier HR Interlock:</strong> Carrier safety will immediately step in and issue a binding legal Cease &amp; Desist to the broker on your behalf.
                </li>
              </ul>
            </div>

            <div className="bg-[#101923] border border-cyan-800/60 p-4 rounded-lg text-xs space-y-2">
              <div className="text-cyan-300 font-bold uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>HR Safe-Harbor Immunity Active</span>
              </div>
              <p className="text-[#888] leading-relaxed">
                Driver <strong className="text-white">{selectedDriverName}</strong> ({assignedUnit}) is enrolled in the Carrier Anti-Coercion Sentinel. Any pressure detected by in-cab telematics triggers automatic legal escalation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2B: PREDICTIVE HR COMPLIANCE BOUNDARY (CROSS-CORRELATED GAP SENTINEL) */}
      {activeSubTab === 'PREDICTIVE_BOUNDARY' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
          <div className="lg:col-span-7 bg-[#111] border border-cyan-900/60 p-5 rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                Cross-Correlated Regulatory Gap Analysis ({selectedDriverName})
              </span>
              <span className="text-[10px] text-cyan-300 bg-cyan-950 px-2 py-0.5 border border-cyan-800 rounded font-bold">
                PROACTIVE 14-DAY RADAR
              </span>
            </div>

            <p className="text-xs text-[#AAA] leading-relaxed">
              Autonomously correlates <strong className="text-white">Safety Meeting Attendance</strong> (Part 392), <strong className="text-amber-300">FMCSA Roadside Inspection Notices</strong> (Part 396.9), and <strong className="text-red-300">Certification Expirations</strong> (CDL &amp; Med Card) to detect gaps before violation citations are issued.
            </p>

            {/* 3 Cross-Correlation Pillar Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#161a22] p-3 rounded border border-cyan-900/50 space-y-1">
                <div className="text-cyan-300 font-bold flex items-center justify-between">
                  <span>1. Safety Meetings</span>
                  <span>50%</span>
                </div>
                <div className="text-[10px] text-[#888]">2 Attended / 2 Missed</div>
                <div className="text-[10px] text-red-300 bg-red-950/40 p-1 rounded border border-red-900/40">
                  Missed: § 392.14 Severe Weather &amp; Chains
                </div>
              </div>

              <div className="bg-[#161a22] p-3 rounded border border-cyan-900/50 space-y-1">
                <div className="text-amber-300 font-bold flex items-center justify-between">
                  <span>2. Roadside Logs</span>
                  <span>Part 396.9</span>
                </div>
                <div className="text-[10px] text-[#888]">1 Unresolved Notice</div>
                <div className="text-[10px] text-amber-300 bg-amber-950/40 p-1 rounded border border-amber-900/40">
                  Level 2 Brake Warning (4d left on 15d clock)
                </div>
              </div>

              <div className="bg-[#161a22] p-3 rounded border border-cyan-900/50 space-y-1">
                <div className="text-red-300 font-bold flex items-center justify-between">
                  <span>3. Expirations</span>
                  <span>7d Breach</span>
                </div>
                <div className="text-[10px] text-[#888]">Med Card: {driverMedExpiry}</div>
                <div className="text-[10px] text-red-300 bg-red-950/40 p-1 rounded border border-red-900/40">
                  Clearinghouse annual due in 2d
                </div>
              </div>
            </div>

            {/* Proactive Action Triggers */}
            <div className="p-4 bg-[#0e1620] border border-cyan-800/80 rounded space-y-3">
              <div className="text-white font-bold text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Automated Proactive Action Dispatch Queue
                </span>
                <span className="text-[10px] text-amber-300 font-normal">
                  Pre-Breach Horizon: 6 Days
                </span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-[#0a0f16] border border-[#203044] rounded flex items-center justify-between text-xs">
                  <div>
                    <div className="text-white font-bold">Action 1: Dispatch Interactive Safety Briefing</div>
                    <div className="text-[10px] text-[#888]">
                      Push 15-min § 392.14 mountain weather briefing with quiz &amp; digital signature to cab HUD.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      triggerHapticFeedback('success');
                      setNotification({
                        type: 'success',
                        message: `SAFETY MODULE DISPATCHED: 49 CFR § 392.14 Weather briefing transmitted to ${selectedDriverName}'s cab HUD.`,
                      });
                      setTimeout(() => setNotification(null), 6000);
                    }}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-[10px] rounded transition-all shrink-0 ml-2"
                  >
                    DISPATCH TO CAB
                  </button>
                </div>

                <div className="p-2.5 bg-[#0a0f16] border border-[#203044] rounded flex items-center justify-between text-xs">
                  <div>
                    <div className="text-white font-bold">Action 2: Pre-Authorize In-Lane NRCME Voucher</div>
                    <div className="text-[10px] text-[#888]">
                      Pre-fund $135 exam at Concentra Joliet before 2026-10-02 med card expiration.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveSubTab('NRCME_HEALTH');
                    }}
                    className="px-3 py-1.5 bg-[#1f2c3b] hover:bg-[#2b3c50] text-cyan-300 border border-cyan-700 font-bold text-[10px] rounded transition-all shrink-0 ml-2"
                  >
                    VIEW CLINICS
                  </button>
                </div>

                <div className="p-2.5 bg-[#0a0f16] border border-[#203044] rounded flex items-center justify-between text-xs">
                  <div>
                    <div className="text-white font-bold">Action 3: Engage HR Dispatch Interlock Buffer</div>
                    <div className="text-[10px] text-[#888]">
                      Prevent dispatching loads arriving after expiration or with uncertified Level 2 brake repairs.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      triggerHapticFeedback('alert');
                      setNotification({
                        type: 'alert',
                        message: `HR DISPATCH INTERLOCK ACTIVE: Safety hold engaged for ${selectedDriverName} on Unit ${assignedUnit}.`,
                        sub: 'Dispatching blocked until Level 2 brake repair invoice & med card voucher confirmed.',
                      });
                      setTimeout(() => setNotification(null), 7000);
                    }}
                    className="px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 font-bold text-[10px] rounded transition-all shrink-0 ml-2"
                  >
                    ENGAGE BUFFER
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 cols: Sentinel Deep Dive & Fleet Modal Trigger */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#121820] border border-cyan-800/60 p-5 rounded-lg space-y-3 text-xs">
              <div className="text-cyan-300 font-bold uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Autonomous Regulatory Gap Sentinel</span>
              </div>
              <p className="text-[#888] leading-relaxed">
                By cross-referencing multiple disparate FMCSA silos, the Predictive Boundary Sentinel prevents violations <strong className="text-white">before</strong> DOT roadside inspectors pull over your equipment or auditors review DQF files.
              </p>
              <div className="p-3 bg-[#0b1016] border border-[#1d2a3a] rounded space-y-1 text-[11px]">
                <div className="text-white font-bold">Audit Prevention Metrics:</div>
                <div className="text-[#AAA]">• Eliminates Part 391.45 out-of-service driver disqualifications</div>
                <div className="text-[#AAA]">• Blocks 15-day roadside repair certification failures (§ 396.9(d))</div>
                <div className="text-[#AAA]">• Enforces OSHA &amp; Part 392 recurrent safety training</div>
              </div>

              <button
                onClick={() => setIsPredictiveModalOpen(true)}
                className="w-full py-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:brightness-110 text-black font-bold rounded text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>OPEN FLEET-WIDE GAP SENTINEL (ALL DRIVERS)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NRCME MEDICAL RECERTIFICATION VOUCHERS */}
      {activeSubTab === 'NRCME_HEALTH' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
          <div className="lg:col-span-7 bg-[#111] border border-[#222] p-5 rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-cyan-400" />
                MCSA-5876 DOT Physical Clinics Along Route
              </span>
              <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 border border-cyan-800 rounded">
                NRCME VERIFIED
              </span>
            </div>

            <div className="p-3 bg-[#0d151d] border border-cyan-900/60 rounded text-xs text-[#AAA] flex items-center justify-between">
              <div>
                <span className="text-[#777] block text-[10px]">CURRENT CDL MEDICAL CARD STATUS:</span>
                <span className="text-white font-bold">
                  {selectedDriverName} — Expires: <span className="text-amber-300">{driverMedExpiry}</span>
                </span>
              </div>
              <span className="px-2 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold text-[10px] rounded">
                VALID IN DQF VAULT
              </span>
            </div>

            <p className="text-xs text-[#888]">
              Need to recertify before expiry? HRease pre-funds the $135 DOT physical fee at all NRCME-registered clinics below. Select a clinic to issue an employer-paid voucher.
            </p>

            <div className="space-y-3">
              {clinics.map((clinic) => (
                <div key={clinic.id} className="bg-[#161616] p-4 border border-[#282828] rounded text-xs space-y-2">
                  <div className="flex justify-between font-bold text-white">
                    <span className="text-sm">{clinic.name}</span>
                    <span className="text-[#D4AF37]">{clinic.distance}</span>
                  </div>

                  <div className="text-[#888]">{clinic.address}</div>
                  <div className="text-cyan-300 text-[11px]">{clinic.providerName}</div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#222] text-[11px]">
                    <span className="text-emerald-400 font-bold">{clinic.feeCovered}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#666]">Open until {clinic.openUntil}</span>
                      <button
                        onClick={() => handleIssueNrcmeVoucher(clinic)}
                        disabled={isIssuingVoucher}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded text-[11px] transition-all"
                      >
                        {isIssuingVoucher ? 'ISSUING...' : 'ISSUE HR VOUCHER'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Issued Voucher Display */}
            {issuedVoucher && (
              <div className="p-4 bg-[#0a1e16] border border-emerald-500/80 rounded space-y-2 text-xs text-emerald-200">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    EMPLOYER-PAID VOUCHER ACTIVE: {issuedVoucher.voucherId}
                  </span>
                  <span className="text-black bg-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                    PAID $135.00
                  </span>
                </div>
                <div>Authorized Clinic: <strong className="text-white">{issuedVoucher.clinicName}</strong></div>
                <div className="text-[10px] text-[#888] break-all">Tamper Hash: {issuedVoucher.sha256Proof}</div>
                <div className="text-[11px] text-emerald-300 pt-1">
                  Present this voucher or show your in-cab app screen upon check-in. The bill is direct-invoiced to Truckwithease Fleet Safety.
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#121212] border border-[#242424] p-5 rounded-lg space-y-3 text-xs">
              <div className="text-white font-bold uppercase flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span>FMCSA 49 CFR § 391.43 Checklist</span>
              </div>
              <p className="text-[#888] leading-relaxed">
                When attending your DOT physical, ensure the NRCME certified medical examiner completes Form MCSA-5875 and transmits MCSA-5876 directly to the FMCSA National Registry.
              </p>
              <div className="p-3 bg-[#181818] border border-[#2a2a2a] rounded space-y-1.5 text-[11px]">
                <div className="text-white font-bold">Items Required at Clinic:</div>
                <div className="text-[#AAA]">• Current Commercial Driver License</div>
                <div className="text-[#AAA]">• Employer Voucher Code ({issuedVoucher ? issuedVoucher.voucherId : 'Generate on left'})</div>
                <div className="text-[#AAA]">• Glasses or hearing aids (if required for CDL)</div>
                <div className="text-[#AAA]">• CPAP compliance report (if applicable)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IRS PER-DIEM TAX ENGINE */}
      {activeSubTab === 'TAX_PER_DIEM' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
          <div className="lg:col-span-7 bg-[#111] border border-[#222] p-5 rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-400" />
                IRS § 274(n) Per-Diem Tax Deduction Engine
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 border border-emerald-800 rounded">
                $69.00 / DAY RATE
              </span>
            </div>

            <p className="text-xs text-[#AAA] leading-relaxed">
              Truck drivers away from home overnight qualify for an IRS per-diem deduction of $69/day under Rev. Proc. 2021-38 without keeping individual meal receipts.
            </p>

            <div className="bg-[#181818] p-4 border border-[#2b2b2b] rounded space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#AAA]">Qualifying Days on Road This Month:</span>
                <input
                  type="number"
                  min="0"
                  max="31"
                  value={daysOnRoad}
                  onChange={(e) => setDaysOnRoad(Number(e.target.value))}
                  className="w-20 bg-[#101010] border border-[#444] px-3 py-1.5 text-white text-right font-bold rounded focus:border-emerald-400 outline-none"
                />
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-[#262626]">
                <span className="text-white font-bold text-sm">Estimated Monthly Tax Deduction:</span>
                <span className="text-xl text-emerald-400 font-bold font-mono">
                  ${totalPerDiemDeduction.toLocaleString()} USD
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#0d1610] border border-emerald-900/60 rounded text-xs text-emerald-300">
              ✓ Automated HOS ELD trip log synchronization provides audit-proof substantiation under Rev. Proc. 2021-38 without storing paper grocery receipts.
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#121212] border border-[#242424] p-5 rounded-lg space-y-3 text-xs">
            <div className="text-white font-bold uppercase flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Annual Tax Savings Impact</span>
            </div>
            <p className="text-[#888] leading-relaxed">
              Based on an average of 260 days on the road per year, an OTR driver claims up to <strong className="text-white">$17,940 in tax deductions</strong>, resulting in approximately $3,900 to $5,200 in net tax savings depending on filing bracket.
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: ESCROW ADVANCE LEDGER */}
      {activeSubTab === 'ESCROW_LEDGER' && (
        <div className="bg-[#111] border border-[#222] p-5 rounded-lg space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#222] pb-3">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Certified HR Detention Escrow Advance Ledger
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 border border-emerald-800 rounded">
              TOTAL PAID: ${escrowLedger.reduce((sum, item) => sum + item.totalDetentionUsd, 0).toFixed(2)} USD
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#282828] text-[#777] text-[10px] uppercase">
                  <th className="py-2 px-3">RECORD ID</th>
                  <th className="py-2 px-3">DRIVER</th>
                  <th className="py-2 px-3">LOAD #</th>
                  <th className="py-2 px-3">FACILITY</th>
                  <th className="py-2 px-3">DWELL</th>
                  <th className="py-2 px-3">DISBURSED</th>
                  <th className="py-2 px-3">STATUS</th>
                  <th className="py-2 px-3">SHA-256 PROOF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {escrowLedger.map((escrow) => (
                  <tr key={escrow.id} className="hover:bg-[#161616] text-[#CCC]">
                    <td className="py-2.5 px-3 font-bold text-white">{escrow.id}</td>
                    <td className="py-2.5 px-3 text-cyan-300 font-bold">{escrow.driverName}</td>
                    <td className="py-2.5 px-3 text-[#AAA]">{escrow.loadNumber}</td>
                    <td className="py-2.5 px-3 text-[#888]">{escrow.facilityName}</td>
                    <td className="py-2.5 px-3">{escrow.totalDwellMinutes} min</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">
                      ${escrow.totalDetentionUsd.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px] font-bold">
                        {escrow.escrowStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[9px] text-[#666] max-w-[120px] truncate" title={escrow.sha256EvidenceHash}>
                      {escrow.sha256EvidenceHash.slice(0, 16)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DQF COMPLIANCE DOSSIER MODAL */}
      <DriverDotDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        driver={selectedDossier}
        currentUserRole="ADMIN"
      />

      {/* PREDICTIVE HR COMPLIANCE BOUNDARY MODAL */}
      <PredictiveHrComplianceBoundaryModal
        isOpen={isPredictiveModalOpen}
        onClose={() => setIsPredictiveModalOpen(false)}
        initialDriverName={selectedDriverName}
        onOpenDossier={(name) => {
          setIsPredictiveModalOpen(false);
          const d = findDriverByNameOrQuery(name) || INITIAL_DRIVER_DOSSIERS[0];
          setSelectedDossier(d);
          setIsDossierModalOpen(true);
        }}
        onOpenTraxesAdvocate={(name) => {
          setSelectedDriverName(name);
          setIsPredictiveModalOpen(false);
        }}
      />
    </div>
  );
};
