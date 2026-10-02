import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Phone,
  Weight,
  Layers,
  Sparkles,
  Upload,
  FileCheck,
  ArrowRightLeft,
  GripVertical,
  Award,
  PenTool,
  UserCheck,
  RefreshCw,
  Check,
  History,
  Copy,
  Lock,
  Download,
  FileSpreadsheet,
  X,
  Smartphone,
  Map,
  Layout,
  Zap,
} from 'lucide-react';
import { MOCK_SHIPMENT_LOADS, LOW_BRIDGE_HAZARDS } from '../data/mockData';
import { ShipmentLoad, AvailableRelayDriver, LoadHandoverRecord } from '../types';
import { RateConUploadModal } from './RateConUploadModal';
import { PodUploadModal } from './PodUploadModal';
import { QuickHandoverModal } from './QuickHandoverModal';
import { DriverMobileCompanionModal } from './DriverMobileCompanionModal';
import { FreightGeographicMap } from './FreightGeographicMap';
import { DatBoardLoad } from '../services/datLoadBoardService';
import { RevenueYieldSimulator } from './RevenueYieldSimulator';
import { triggerHapticFeedback } from '../services/haptics';

const INITIAL_AVAILABLE_DRIVERS: AvailableRelayDriver[] = [
  {
    id: 'drv-relay-vance',
    name: 'Vance Reynolds',
    avatarInitials: 'VR',
    avatarColor: 'bg-emerald-500',
    truckUnit: 'TR-904',
    trailerUnit: 'TRL-6112',
    phone: '(312) 555-8821',
    cdlNumber: 'IL-CDL-4910291',
    cdlState: 'IL',
    hosRemaining: '9h 40m',
    hosRemainingMinutes: 580,
    status: 'AVAILABLE_RELAY',
    currentTerminal: 'Breezewood Relay Hub, PA',
    proximity: 'On-Site Staged',
    matchScore: 99,
  },
  {
    id: 'drv-relay-jason',
    name: 'Jason Henderson',
    avatarInitials: 'JH',
    avatarColor: 'bg-sky-500',
    truckUnit: 'UNIT #208-T',
    trailerUnit: 'TRL-6112',
    phone: '(216) 555-4481',
    cdlNumber: 'OH-CDL-8839120',
    cdlState: 'OH',
    hosRemaining: '8h 15m',
    hosRemainingMinutes: 495,
    status: 'AVAILABLE_RELAY',
    currentTerminal: 'Columbus Midway Yard, OH',
    proximity: '0.8 mi away',
    matchScore: 96,
  },
  {
    id: 'drv-relay-sarah',
    name: 'Sarah Jenkins',
    avatarInitials: 'SJ',
    avatarColor: 'bg-amber-500',
    truckUnit: 'TR-719',
    trailerUnit: 'TRL-4810',
    phone: '(614) 555-7740',
    cdlNumber: 'OH-CDL-2291048',
    cdlState: 'OH',
    hosRemaining: '10h 30m',
    hosRemainingMinutes: 630,
    status: 'READY_STANDBY',
    currentTerminal: 'Harrisburg Terminal, PA',
    proximity: 'Dock #4 Staged',
    matchScore: 94,
  },
  {
    id: 'drv-relay-devon',
    name: 'Devon Vance',
    avatarInitials: 'DV',
    avatarColor: 'bg-purple-500',
    truckUnit: 'UNIT #312-C',
    trailerUnit: 'TRL-9901',
    phone: '(317) 555-3120',
    cdlNumber: 'IN-CDL-5520194',
    cdlState: 'IN',
    hosRemaining: '7h 00m',
    hosRemainingMinutes: 420,
    status: 'READY_STANDBY',
    currentTerminal: 'Gary Steel Terminal, IN',
    proximity: '1.4 mi away',
    matchScore: 91,
  },
  {
    id: 'drv-relay-jamal',
    name: 'Jamal Washington',
    avatarInitials: 'JW',
    avatarColor: 'bg-rose-500',
    truckUnit: 'TR-611',
    trailerUnit: 'TRL-3390',
    phone: '(317) 555-6119',
    cdlNumber: 'IN-CDL-8819203',
    cdlState: 'IN',
    hosRemaining: '11h 00m',
    hosRemainingMinutes: 660,
    status: 'ON_DUTY_RELIEF',
    currentTerminal: 'Indianapolis Hub, IN',
    proximity: 'Slip-Seat Bay',
    matchScore: 97,
  },
];

export const DispatchView: React.FC = () => {
  const [loads, setLoads] = useState<ShipmentLoad[]>(MOCK_SHIPMENT_LOADS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedLoad, setSelectedLoad] = useState<ShipmentLoad | null>(loads[0]);
  const [isNewLoadModalOpen, setIsNewLoadModalOpen] = useState(false);
  const [isRateConModalOpen, setIsRateConModalOpen] = useState(false);
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Adaptive View & Driver Mobile Companion State
  const [viewMode, setViewMode] = useState<'COMMAND_CENTER' | 'FOCUS_MODE' | 'YIELD_SIMULATOR'>('COMMAND_CENTER');
  const [isYieldSimulatorInlineOpen, setIsYieldSimulatorInlineOpen] = useState(false);
  const [isDriverMobileModalOpen, setIsDriverMobileModalOpen] = useState<boolean>(false);

  // Quick Handover State
  const [dossierTab, setDossierTab] = useState<'OVERVIEW' | 'AUDIT_LOG' | 'RELAY_MAP'>('OVERVIEW');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditFilterType, setAuditFilterType] = useState<'ALL' | 'DRIVER' | 'TIMESTAMP'>('ALL');
  const [availableDrivers, setAvailableDrivers] = useState<AvailableRelayDriver[]>(INITIAL_AVAILABLE_DRIVERS);
  const [draggedLoad, setDraggedLoad] = useState<ShipmentLoad | null>(null);
  const [hoveredDriverId, setHoveredDriverId] = useState<string | null>(null);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [handoverTargetDriver, setHandoverTargetDriver] = useState<AvailableRelayDriver | null>(null);
  const [handoverTargetLoad, setHandoverTargetLoad] = useState<ShipmentLoad | null>(null);
  const [viewingCertificateRecord, setViewingCertificateRecord] = useState<LoadHandoverRecord | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Quick Handover Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, load: ShipmentLoad) => {
    e.dataTransfer.setData('text/plain', load.id);
    e.dataTransfer.effectAllowed = 'copyMove';
    setDraggedLoad(load);
  };

  const handleDragEnd = () => {
    setDraggedLoad(null);
    setHoveredDriverId(null);
  };

  const handleDragOverDriver = (e: React.DragEvent, driverId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (hoveredDriverId !== driverId) {
      setHoveredDriverId(driverId);
    }
  };

  const handleDragLeaveDriver = (driverId: string) => {
    if (hoveredDriverId === driverId) {
      setHoveredDriverId(null);
    }
  };

  const handleDropOnDriver = (e: React.DragEvent, driver: AvailableRelayDriver) => {
    e.preventDefault();
    const loadId = e.dataTransfer.getData('text/plain');
    const target = loads.find((l) => l.id === loadId) || draggedLoad || selectedLoad;

    setDraggedLoad(null);
    setHoveredDriverId(null);

    if (target) {
      setHandoverTargetLoad(target);
      setHandoverTargetDriver(driver);
      setViewingCertificateRecord(null);
      setIsHandoverModalOpen(true);
    }
  };

  const openHandoverForLoad = (load: ShipmentLoad, driver?: AvailableRelayDriver) => {
    setHandoverTargetLoad(load);
    setHandoverTargetDriver(driver || availableDrivers[0] || null);
    setViewingCertificateRecord(null);
    setIsHandoverModalOpen(true);
  };

  const openCertificateView = (record: LoadHandoverRecord, load: ShipmentLoad) => {
    setHandoverTargetLoad(load);
    setViewingCertificateRecord(record);
    setIsHandoverModalOpen(true);
  };

  const handleHandoverCompleted = (loadId: string, record: LoadHandoverRecord) => {
    // 1. Update load with receiving driver, new equipment, note, certified record, and history log
    setLoads((prev) =>
      prev.map((l) => {
        if (l.id === loadId) {
          const updatedNotes = `${l.notes || ''} [Quick Handover: Transferred from ${record.departingDriverName} to ${record.receivingDriverName} (${record.receivingDriverUnit}) at ${record.location}. FMCSA e-sign: ${record.sha256AuditHash.slice(0, 16)}...]`;
          const currentHistory = l.handoverHistory || (l.handoverRecord ? [l.handoverRecord] : []);
          const updatedHistory = [record, ...currentHistory];
          return {
            ...l,
            driverName: record.receivingDriverName,
            assignedUnit: record.receivingDriverUnit,
            notes: updatedNotes.trim(),
            handoverRecord: record,
            handoverHistory: updatedHistory,
            handoverCount: updatedHistory.length,
          };
        }
        return l;
      })
    );

    // 2. Update selected load if currently selected
    if (selectedLoad?.id === loadId) {
      setSelectedLoad((prev) => {
        if (!prev) return null;
        const currentHistory = prev.handoverHistory || (prev.handoverRecord ? [prev.handoverRecord] : []);
        const updatedHistory = [record, ...currentHistory];
        return {
          ...prev,
          driverName: record.receivingDriverName,
          assignedUnit: record.receivingDriverUnit,
          handoverRecord: record,
          handoverHistory: updatedHistory,
          handoverCount: updatedHistory.length,
        };
      });
    }

    // Auto-switch dossier tab to Transfer Audit Log to show newly registered record
    setDossierTab('AUDIT_LOG');

    // 3. Mark the driver as assigned in local available relay state
    setAvailableDrivers((prev) =>
      prev.map((d) =>
        d.id === record.receivingDriverId
          ? { ...d, status: 'ON_DUTY_RELIEF', proximity: 'Assigned (In Transit)' }
          : d
      )
    );

    // 4. Background ledger sync to server
    fetch('/api/dispatch/handover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    }).catch((err) => console.warn('Dispatch handover background sync note:', err));

    showToast(`⚡ QUICK HANDOVER CERTIFIED: ${record.loadNumber} transferred to ${record.receivingDriverName}. Electronic sign-off registered.`);
  };

  // Export Transfer Summary to CSV for Enterprise Compliance & Accounting
  const handleExportTransferSummaryCSV = (load: ShipmentLoad) => {
    const history =
      load.handoverHistory && load.handoverHistory.length > 0
        ? load.handoverHistory
        : load.handoverRecord
        ? [load.handoverRecord]
        : [];

    if (history.length === 0) {
      showToast(`No transfer audit history available to export for ${load.loadNumber}.`);
      return;
    }

    const headers = [
      'Load Number',
      'Handover Sequence',
      'Timestamp',
      'Departing Driver Name',
      'Departing Driver Unit',
      'Receiving Driver Name',
      'Receiving Driver Unit',
      'Receiving Driver CDL',
      'Receiving Driver Phone',
      'Transfer Reason',
      'Relay Waypoint Location',
      'Cargo Seal Number',
      'Pre-Trip Inspection Verified',
      'Cargo Seal Intact Verified',
      'BOL Transferred Verified',
      'Reefer Temp Verified',
      'Keys & Cards Exchanged',
      'ELD Tractor Pairing Confirmed',
      'Signer Legal Name',
      'Signer CDL Number',
      'Regulatory Compliance Statute',
      'SHA-256 Audit Hash',
    ];

    const escapeCsv = (val: string | number | boolean | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = history.map((record, index) => {
      const seqNum = history.length - index;
      return [
        escapeCsv(load.loadNumber),
        escapeCsv(`HANDOVER #${seqNum}`),
        escapeCsv(record.timestamp),
        escapeCsv(record.departingDriverName),
        escapeCsv(record.departingDriverUnit),
        escapeCsv(record.receivingDriverName),
        escapeCsv(record.receivingDriverUnit),
        escapeCsv(record.receivingDriverCdl),
        escapeCsv(record.receivingDriverPhone),
        escapeCsv(record.handoverReason ? record.handoverReason.replace(/_/g, ' ') : 'HOS RELIEF'),
        escapeCsv(record.location),
        escapeCsv(record.cargoSealNumber),
        escapeCsv(record.checklist?.preTripWalkaroundCompleted ? 'YES' : 'NO'),
        escapeCsv(record.checklist?.cargoSealIntactVerified ? 'YES' : 'NO'),
        escapeCsv(record.checklist?.bolPhysicalOrElectronicTransferred ? 'YES' : 'NO'),
        escapeCsv(record.checklist?.reeferTempVerified ? 'YES' : 'NO'),
        escapeCsv(record.checklist?.vehicleKeysAndFuelCardsExchanged ? 'YES' : 'NO'),
        escapeCsv(record.checklist?.eldTractorPairingConfirmed ? 'YES' : 'NO'),
        escapeCsv(record.signerLegalName),
        escapeCsv(record.signerCdlNumber),
        escapeCsv(record.regulatoryStatute || 'FMCSA § 390.31 / § 396.13'),
        escapeCsv(record.sha256AuditHash),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Transfer_Summary_${load.loadNumber.replace(/[^a-zA-Z0-9-]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`📊 Enterprise Compliance CSV exported for ${load.loadNumber} (${history.length} records).`);
  };

  // New load form state
  const [newOrigin, setNewOrigin] = useState('');
  const [newDest, setNewDest] = useState('');
  const [newRate, setNewRate] = useState('2400');
  const [newMiles, setNewMiles] = useState('480');
  const [newCommodity, setNewCommodity] = useState('General Freight');
  const [newBroker, setNewBroker] = useState('Echo Global Logistics');

  const handleRateConIngested = (parsed: DatBoardLoad) => {
    const newShipment: ShipmentLoad = {
      id: parsed.id,
      loadNumber: parsed.loadNumber,
      status: 'Dispatched',
      originCity: parsed.originCity,
      originState: parsed.originState,
      originZip: '75201',
      destCity: parsed.destCity,
      destState: parsed.destState,
      destZip: '30301',
      pickupWindow: `${parsed.pickupDate} · 08:00 Local`,
      deliveryWindow: `${parsed.deliveryDate} · 17:00 Local`,
      rateUsd: parsed.rateUsd,
      miles: parsed.miles,
      ratePerMile: parsed.ratePerMile,
      weightLbs: parsed.weightLbs,
      equipment: parsed.equipment,
      commodity: parsed.commodity,
      brokerName: parsed.brokerName,
      brokerPhone: parsed.brokerPhone,
      driverName: 'Fleet Assigned Driver',
      assignedUnit: 'UNIT #104-E',
      trailerUnit: 'TRL-5390',
      bolNumber: `BOL-${parsed.loadNumber.replace(/\D/g, '') || '8819'}`,
      detourProtected: true,
      notes: `Ingested via OCR from ${parsed.brokerName}. Direct broker quickpay terms.`,
    };
    setLoads((prev) => [newShipment, ...prev]);
    setSelectedLoad(newShipment);
    showToast(`RATE CON INGESTED: ${parsed.loadNumber} ($${parsed.rateUsd.toLocaleString()}) ADDED TO TMS`);
  };

  const handlePodSubmitted = (loadId: string, packet: any) => {
    setLoads((prev) =>
      prev.map((l) => (l.id === loadId ? { ...l, status: 'Delivered' } : l))
    );
    if (selectedLoad?.id === loadId) {
      setSelectedLoad((prev) => (prev ? { ...prev, status: 'Delivered' } : null));
    }
    showToast(`POD CERTIFIED: Factored $${packet.netPayoutUsd.toLocaleString()} via ${packet.factoringPartner}`);
  };

  // Convert selectedLoad to DatBoardLoad format for PodUploadModal if needed
  const selectedLoadAsDatBoardLoad: DatBoardLoad | null = selectedLoad
    ? {
        id: selectedLoad.id,
        loadNumber: selectedLoad.loadNumber,
        originCity: selectedLoad.originCity,
        originState: selectedLoad.originState,
        destCity: selectedLoad.destCity,
        destState: selectedLoad.destState,
        pickupDate: 'Tomorrow',
        deliveryDate: 'Next Day',
        miles: selectedLoad.miles,
        rateUsd: selectedLoad.rateUsd,
        ratePerMile: selectedLoad.ratePerMile,
        weightLbs: selectedLoad.weightLbs,
        equipment: selectedLoad.equipment,
        commodity: selectedLoad.commodity,
        brokerName: selectedLoad.brokerName,
        brokerPhone: selectedLoad.brokerPhone,
        brokerEmail: 'brokerage@freightdispatch.com',
        brokerTrustScore: 95,
        fhwaClearanceStatus: 'Verified 14\'0"',
        fuelArbitrageNote: 'Mapped to major travel center',
        detentionRisk: 'Under 45m average dwell',
        paymentTerms: 'Direct QuickPay',
        status: selectedLoad.status === 'Delivered' ? 'DELIVERED' : 'DISPATCHED',
        source: 'RATE_CON_PARSED',
      }
    : null;

  const filteredLoads = loads.filter((load) => {
    const matchesSearch =
      load.loadNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      load.originCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      load.destCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      load.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      load.brokerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || load.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateLoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrigin || !newDest) return;

    const rate = parseFloat(newRate) || 2000;
    const miles = parseFloat(newMiles) || 400;

    const newLoad: ShipmentLoad = {
      id: `load-${Date.now()}`,
      loadNumber: `TRUCKWITHEASE-LOAD-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Dispatched',
      originCity: newOrigin.split(',')[0].trim(),
      originState: newOrigin.split(',')[1]?.trim() || 'PA',
      originZip: '18101',
      destCity: newDest.split(',')[0].trim(),
      destState: newDest.split(',')[1]?.trim() || 'OH',
      destZip: '43201',
      pickupWindow: 'Tomorrow · 08:00 EDT',
      deliveryWindow: 'Next Day · 16:00 EDT',
      rateUsd: rate,
      miles: miles,
      ratePerMile: +(rate / miles).toFixed(2),
      weightLbs: 42000,
      equipment: "53' Dry Van",
      commodity: newCommodity,
      brokerName: newBroker,
      brokerPhone: '(800) 555-0199',
      driverName: 'Marcus Kowalski',
      assignedUnit: 'UNIT #104-E',
      trailerUnit: 'TRL-5390',
      bolNumber: `BOL-${Math.floor(100000 + Math.random() * 900000)}`,
      detourProtected: true,
      notes: 'Dispatched via TRUCKWITHEASE desktop dispatch console.',
    };

    setLoads([newLoad, ...loads]);
    setSelectedLoad(newLoad);
    setIsNewLoadModalOpen(false);
    setNewOrigin('');
    setNewDest('');
  };

  const getStatusBadge = (status: ShipmentLoad['status']) => {
    switch (status) {
      case 'In Transit':
        return 'bg-[#C9A84C] text-black font-black';
      case 'At Dock':
        return 'bg-amber-400 text-black font-bold';
      case 'Dispatched':
        return 'bg-sky-400 text-black font-bold';
      case 'Booked':
        return 'bg-[#333] text-white font-medium';
      case 'Delivered':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
      default:
        return 'bg-[#222] text-[#AAA]';
    }
  };

  // Metrics
  const totalRevenue = loads.reduce((sum, l) => sum + l.rateUsd, 0);
  const totalMiles = loads.reduce((sum, l) => sum + l.miles, 0);
  const avgRatePerMile = (totalRevenue / (totalMiles || 1)).toFixed(2);
  const activeCount = loads.filter((l) => l.status === 'In Transit' || l.status === 'Dispatched' || l.status === 'At Dock').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#C9A84C]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] font-bold">
              // FLEET OPERATIONS &amp; DISPATCH CONSOLE
            </span>
            <span className="px-2 py-0.5 bg-[#0A0A0A] border border-[#333] text-[#C9A84C] font-mono text-[9px] uppercase font-bold tracking-widest">
              TMS DESKTOP ACTIVE
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl uppercase text-white font-black tracking-tight mt-1 flex items-center gap-2">
            Active Freight &amp; Rate Confirmations
            <span className="inline-block w-2 h-2 bg-[#C9A84C]" />
          </h1>
          <p className="text-xs font-mono text-[#888] mt-1">
            Real-time shipment tracking, automated rate-per-mile analysis, and FHWA low-bridge protected vectors.
          </p>
        </div>

        {/* Quick Action Buttons & Adaptive View Control */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#0C0D12] border border-[#2B2D36] p-0.5 rounded-lg">
            <button
              onClick={() => {
                triggerHapticFeedback('tick');
                setViewMode('COMMAND_CENTER');
                showToast('⚙️ VIEW MODE: COMMAND CENTER (Full Operational Telemetry Active)');
              }}
              className={`px-2.5 py-1.5 text-xs font-mono font-bold uppercase rounded flex items-center gap-1.5 transition-all ${
                viewMode === 'COMMAND_CENTER'
                  ? 'bg-[#C9A84C] text-black shadow-md'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">COMMAND CENTER</span>
            </button>

            <button
              onClick={() => {
                triggerHapticFeedback('tick');
                setViewMode('FOCUS_MODE');
                showToast('🎯 VIEW MODE: FOCUS MODE (Streamlined Drag Handover View Active)');
              }}
              className={`px-2.5 py-1.5 text-xs font-mono font-bold uppercase rounded flex items-center gap-1.5 transition-all ${
                viewMode === 'FOCUS_MODE'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">FOCUS MODE</span>
            </button>

            <button
              onClick={() => {
                triggerHapticFeedback('tick');
                setViewMode('YIELD_SIMULATOR');
                showToast('📈 VIEW MODE: PREDICTIVE YIELD SIMULATOR ACTIVE');
              }}
              className={`px-2.5 py-1.5 text-xs font-mono font-bold uppercase rounded flex items-center gap-1.5 transition-all ${
                viewMode === 'YIELD_SIMULATOR'
                  ? 'bg-[#C9A84C] text-black shadow-md'
                  : 'text-[#C9A84C] hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span className="hidden sm:inline">YIELD SIMULATOR</span>
            </button>
          </div>

          {/* Dedicated Driver Mobile Companion Mode Launcher */}
          <button
            onClick={() => setIsDriverMobileModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500/20 via-[#C9A84C]/20 to-amber-500/20 hover:from-[#C9A84C] hover:to-[#C9A84C] hover:text-black border border-[#C9A84C] text-[#C9A84C] text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all shadow-md"
          >
            <Smartphone className="w-4 h-4 shrink-0 text-[#C9A84C]" />
            <span>DRIVER MOBILE COMPANION</span>
          </button>

          <button
            onClick={() => setIsRateConModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#292A2F] hover:bg-[#34343A] text-[#F2CA50] text-xs font-mono font-bold uppercase tracking-wider transition-all border border-[#F2CA50]/30"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>UPLOAD RATE CON (OCR)</span>
          </button>

          <button
            onClick={() => setIsPodModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider transition-all"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>UPLOAD POD</span>
          </button>

          <button
            onClick={() => setIsNewLoadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] hover:bg-white text-black text-xs font-mono font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)]"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>DISPATCH NEW LOAD</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics vs Focus Mode Banner vs Yield Simulator Mode */}
      {viewMode === 'YIELD_SIMULATOR' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#151722] border border-[#C9A84C]/40 p-3.5 rounded-xl font-mono">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C9A84C] text-black font-black flex items-center justify-center text-sm">
                $
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  PREDICTIVE REVENUE &amp; YIELD SIMULATOR VIEW ACTIVE
                </div>
                <div className="text-[11px] text-[#A0A4B8]">
                  Adjust power units, spot CPM targets, fuel MPG, and deadhead ratios to project fleet EBITDA.
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                triggerHapticFeedback('tick');
                setViewMode('COMMAND_CENTER');
              }}
              className="px-3 py-1.5 bg-[#1F2230] hover:bg-[#2A2E40] border border-[#444] text-white text-xs font-bold uppercase rounded-lg transition-colors"
            >
              RETURN TO TMS DISPATCH
            </button>
          </div>
          <RevenueYieldSimulator onApplyStrategy={(strat) => showToast(strat)} />
        </div>
      ) : viewMode === 'COMMAND_CENTER' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-[#141414] border border-[#222]">
              <span className="text-[10px] font-mono text-[#777] uppercase tracking-widest block font-bold">
                ACTIVE EN-ROUTE LOADS
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-black text-white">
                  {activeCount}
                </span>
                <span className="text-xs font-mono text-[#C9A84C] font-bold">ASSIGNED</span>
              </div>
              <div className="mt-1 text-[10px] font-mono text-[#555]">
                Total Shipments: {loads.length}
              </div>
            </div>

            <div className="p-4 bg-[#141414] border border-[#222]">
              <span className="text-[10px] font-mono text-[#777] uppercase tracking-widest block font-bold">
                GROSS FREIGHT REVENUE
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-black text-[#C9A84C]">
                  ${totalRevenue.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-[#666] font-bold">USD</span>
              </div>
              <div className="mt-1 text-[10px] font-mono text-[#555]">
                Billed &amp; In-Transit Loads
              </div>
            </div>

            <div className="p-4 bg-[#141414] border border-[#222]">
              <span className="text-[10px] font-mono text-[#777] uppercase tracking-widest block font-bold">
                AVERAGE RATE / MILE
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-black text-white">
                  ${avgRatePerMile}
                </span>
                <span className="text-xs font-mono text-[#666] font-bold">/ MI</span>
              </div>
              <div className="mt-1 text-[10px] font-mono text-emerald-400">
                +18.4% above spot market avg
              </div>
            </div>

            <div className="p-4 bg-[#141414] border border-[#222]">
              <span className="text-[10px] font-mono text-[#777] uppercase tracking-widest block font-bold">
                CORRIDOR PROTECTION
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-black text-[#C9A84C]">
                  100%
                </span>
                <span className="text-xs font-mono text-[#666] font-bold">FHWA</span>
              </div>
              <div className="mt-1 text-[10px] font-mono text-[#777]">
                0 Bridge Strikes Recorded
              </div>
            </div>
          </div>

          {/* Quick Accordion Toggle for Predictive Yield Simulator in Command Center */}
          <div className="bg-[#111218] border border-[#262838] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <DollarSign className="w-4 h-4 text-[#C9A84C]" />
              <span className="text-xs font-mono font-bold text-white uppercase">
                Predictive Yield &amp; Revenue Simulator
              </span>
              <span className="text-[10px] font-mono text-[#7E8B9B] hidden sm:inline">
                Forecast monthly NOI, diesel fuel burn &amp; equipment capacity
              </span>
            </div>
            <button
              onClick={() => {
                triggerHapticFeedback('tick');
                setIsYieldSimulatorInlineOpen(!isYieldSimulatorInlineOpen);
              }}
              className="px-3 py-1.5 bg-[#1C1E2A] hover:bg-[#252838] border border-[#3A3D52] text-[#C9A84C] text-xs font-mono font-bold uppercase rounded-lg transition-all"
            >
              {isYieldSimulatorInlineOpen ? '▲ COLLAPSE SIMULATOR' : '▼ EXPAND SIMULATOR'}
            </button>
          </div>

          {isYieldSimulatorInlineOpen && (
            <RevenueYieldSimulator onApplyStrategy={(strat) => showToast(strat)} />
          )}
        </div>
      ) : (
        <div className="p-4 bg-gradient-to-r from-amber-950/80 via-[#18150D] to-[#0A0B0E] border-2 border-[#D4AF37] rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl font-mono">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37] text-black font-black flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#D4AF37] uppercase tracking-wider">
                  🎯 FOCUS MODE ACTIVE &bull; DRAG &amp; DROP RELAY COCKPIT
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[9px] font-bold rounded">
                  LOW CLUTTER
                </span>
              </div>
              <p className="text-xs text-white mt-0.5">
                Streamlined view emphasizing urgent HOS handovers, active load transfers, and high-contrast drag zones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="text-right text-xs">
              <span className="text-[#888] block text-[10px]">READY RELAY DRIVERS</span>
              <span className="text-emerald-400 font-extrabold text-sm">{availableDrivers.length} STAGED</span>
            </div>
            <button
              onClick={() => setViewMode('COMMAND_CENTER')}
              className="px-3 py-1.5 bg-[#1F222E] hover:bg-[#2A2E3D] border border-[#444] text-white text-xs font-bold uppercase rounded transition-colors"
            >
              EXIT FOCUS
            </button>
          </div>
        </div>
      )}

      {/* Quick Handover Relay Bar (Drag-and-Drop Relay Target Zone) */}
      <div
        id="quick-handover-relay-zone"
        className={`p-4 bg-[#141414] border transition-all duration-300 relative overflow-hidden ${
          draggedLoad
            ? 'border-[#C9A84C] bg-[#18160E] shadow-[0_0_30px_rgba(201,168,76,0.3)] ring-2 ring-[#C9A84C]'
            : 'border-[#222]'
        }`}
      >
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222]">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded bg-[#1C1C1C] border ${draggedLoad ? 'border-[#C9A84C] text-[#C9A84C] animate-pulse' : 'border-[#333] text-[#C9A84C]'}`}>
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black tracking-widest text-[#C9A84C] uppercase">
                  ⚡ QUICK HANDOVER RELAY
                </span>
                <span className="text-[9px] font-mono text-[#777] uppercase hidden md:inline">
                  FMCSA § 390.31 ELECTRONIC CHAIN OF CUSTODY
                </span>
              </div>
              <p className="text-xs font-headline font-bold text-white uppercase tracking-tight">
                {draggedLoad ? (
                  <span className="text-[#C9A84C] animate-pulse flex items-center gap-1.5">
                    <span>Drop load [{draggedLoad.loadNumber}] directly onto a driver below to execute transfer</span>
                  </span>
                ) : (
                  <span>Available Relay Drivers // Drag load card onto avatar to initiate sign-off</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {draggedLoad ? (
              <div className="px-2.5 py-1 bg-[#C9A84C] text-black font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <GripVertical className="w-3.5 h-3.5 animate-bounce" />
                <span>LOAD {draggedLoad.loadNumber} ACTIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#0D0D0D] border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-bold">
                  ● {availableDrivers.filter((d) => d.status === 'AVAILABLE_RELAY').length} READY FOR RELAY
                </span>
                <span className="text-[10px] font-mono text-[#666] hidden lg:inline">
                  5 RELIEF UNITS STAGED
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Drivers Grid / Drop Zones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-3">
          {availableDrivers.map((driver) => {
            const isHoveredTarget = hoveredDriverId === driver.id;
            const isAssigned = driver.status === 'ON_DUTY_RELIEF';

            return (
              <div
                key={driver.id}
                id={`relay-driver-card-${driver.id}`}
                onDragOver={(e) => handleDragOverDriver(e, driver.id)}
                onDragLeave={() => handleDragLeaveDriver(driver.id)}
                onDrop={(e) => handleDropOnDriver(e, driver)}
                onClick={() => {
                  if (selectedLoad) {
                    openHandoverForLoad(selectedLoad, driver);
                  } else if (loads.length > 0) {
                    openHandoverForLoad(loads[0], driver);
                  }
                }}
                className={`p-3 border transition-all duration-200 cursor-pointer relative group rounded-sm ${
                  isHoveredTarget
                    ? 'border-[#C9A84C] bg-[#2A2410] scale-[1.03] shadow-[0_0_20px_rgba(201,168,76,0.4)] ring-2 ring-[#C9A84C]'
                    : draggedLoad
                    ? 'border-dashed border-[#C9A84C]/60 bg-[#1A1810] hover:border-[#C9A84C] hover:bg-[#242014]'
                    : 'border-[#222] bg-[#0F0F0F] hover:border-[#383838] hover:bg-[#161616]'
                }`}
                title={`Drag a load card here to initiate quick handover to ${driver.name}`}
              >
                {/* Visual indicator when dragged card is hovered over driver */}
                {isHoveredTarget && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#C9A84C] text-black font-mono text-[9px] font-black uppercase tracking-wider rounded shadow-md animate-bounce whitespace-nowrap z-10">
                    DROP TO TRANSFER CUSTODY
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  {/* Driver Avatar */}
                  <div className="relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-black text-black text-xs shadow-md ${driver.avatarColor} ring-2 ${
                        isHoveredTarget ? 'ring-[#C9A84C] ring-offset-2 ring-offset-black' : 'ring-[#222]'
                      }`}
                    >
                      {driver.avatarInitials}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#141414] ${
                        isAssigned
                          ? 'bg-amber-400'
                          : 'bg-emerald-400 animate-pulse'
                      }`}
                      title={isAssigned ? 'Assigned' : 'Available Relay'}
                    />
                  </div>

                  {/* Match Score & Action */}
                  <div className="text-right">
                    <span className="px-1.5 py-0.5 bg-[#1C1C1C] border border-[#333] text-[9px] font-mono font-bold text-[#C9A84C]">
                      {driver.matchScore}% FIT
                    </span>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="text-xs font-mono font-bold text-white truncate group-hover:text-[#C9A84C] transition-colors flex items-center justify-between">
                    <span>{driver.name}</span>
                    <ArrowRightLeft className="w-3 h-3 text-[#666] group-hover:text-[#C9A84C] shrink-0" />
                  </div>
                  <div className="text-[10px] font-mono text-[#888] truncate mt-0.5">
                    Unit: {driver.truckUnit}
                  </div>
                  <div className="text-[10px] font-mono text-[#666] truncate">
                    {driver.proximity}
                  </div>
                </div>

                {/* HOS Drive Time Clock */}
                <div className="mt-2 pt-2 border-t border-[#1C1C1C] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#666] uppercase text-[9px]">HOS REMAIN</span>
                  <span className="font-bold text-emerald-400">{driver.hosRemaining}</span>
                </div>

                {/* Drop Prompt Footnote */}
                <div className={`mt-1.5 text-[9px] font-mono text-center uppercase tracking-wider py-0.5 rounded ${
                  isHoveredTarget
                    ? 'bg-[#C9A84C] text-black font-black'
                    : draggedLoad
                    ? 'text-[#C9A84C] bg-[#C9A84C]/10 font-bold'
                    : 'text-[#666] group-hover:text-[#AAA]'
                }`}>
                  {isHoveredTarget ? 'READY TO SIGN' : draggedLoad ? 'DROP HERE' : 'CLICK / DROP LOAD'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#141414] border border-[#222]">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#777]" />
          <input
            type="text"
            placeholder="Search by Load ID, City, Broker, or Commodity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-xs font-mono text-white placeholder-[#555] outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {['ALL', 'In Transit', 'At Dock', 'Dispatched', 'Delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all shrink-0 ${
                filterStatus === status
                  ? 'bg-[#C9A84C] text-black font-black'
                  : 'text-[#888] hover:text-white bg-[#0A0A0A] border border-[#222]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout: Master List & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Loads Table / List (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-3">
          {filteredLoads.map((load) => {
            const isSelected = selectedLoad?.id === load.id;
            const isBeingDragged = draggedLoad?.id === load.id;
            const hasHandover = !!load.handoverRecord;

            return (
              <div
                key={load.id}
                id={`load-card-${load.id}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, load)}
                onDragEnd={handleDragEnd}
                onClick={() => setSelectedLoad(load)}
                className={`p-4 bg-[#141414] border transition-all relative select-none ${
                  isBeingDragged
                    ? 'opacity-50 border-dashed border-[#C9A84C] bg-[#221F14] scale-[0.98]'
                    : isSelected
                    ? 'border-[#C9A84C] bg-[#1C1C1C] shadow-[0_0_15px_rgba(201,168,76,0.15)]'
                    : 'border-[#222] hover:border-[#444]'
                }`}
              >
                {isSelected && !isBeingDragged && (
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#C9A84C]" />
                )}
                <div className="flex items-center justify-between gap-2 border-b border-[#222] pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-black text-white">
                      {load.loadNumber}
                    </span>
                    <span className="text-[10px] font-mono text-[#777]">
                      {load.equipment}
                    </span>

                    {/* Handover certified badge if already transferred */}
                    {hasHandover && (
                      <span className="px-2 py-0.5 bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-[9px] font-mono font-bold flex items-center gap-1">
                        <Award className="w-2.5 h-2.5 text-emerald-400" />
                        <span>HANDOVER CERTIFIED</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Drag Grip Handle */}
                    <div
                      className="cursor-grab active:cursor-grabbing px-2 py-0.5 bg-[#1C1C1C] hover:bg-[#252525] border border-[#333] hover:border-[#C9A84C] text-[#AAA] hover:text-[#C9A84C] flex items-center gap-1 rounded transition-colors group/drag"
                      title="Click and drag this card onto an available driver's avatar above to execute Quick Handover"
                    >
                      <GripVertical className="w-3 h-3 text-[#C9A84C]" />
                      <span className="text-[9px] font-mono font-bold tracking-wider hidden sm:inline text-[#888] group-hover/drag:text-[#C9A84C]">
                        DRAG TO HANDOVER
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider ${getStatusBadge(load.status)}`}>
                      {load.status}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  {/* Origin */}
                  <div>
                    <span className="text-[10px] text-[#666] uppercase font-bold block">
                      ORIGIN (PICKUP)
                    </span>
                    <div className="font-bold text-white mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C9A84C]" />
                      {load.originCity}, {load.originState} {load.originZip}
                    </div>
                    <div className="text-[10px] text-[#888] mt-0.5">{load.pickupWindow}</div>
                  </div>

                  {/* Destination */}
                  <div>
                    <span className="text-[10px] text-[#666] uppercase font-bold block">
                      DESTINATION (DELIVERY)
                    </span>
                    <div className="font-bold text-white mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      {load.destCity}, {load.destState} {load.destZip}
                    </div>
                    <div className="text-[10px] text-[#888] mt-0.5">{load.deliveryWindow}</div>
                  </div>
                </div>

                {/* Footer specs */}
                <div className="mt-3 pt-2 border-t border-[#1E1E1E] flex items-center justify-between text-[11px] font-mono text-[#888]">
                  <div>
                    <span className="text-white font-bold">${load.rateUsd.toLocaleString()}</span>{' '}
                    <span className="text-[10px] text-[#666]">(${load.ratePerMile}/mi · {load.miles} mi)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#AAA] font-semibold">{load.driverName}</span>
                    
                    {/* Direct quick transfer action button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openHandoverForLoad(load);
                      }}
                      className="p-1 hover:text-[#C9A84C] text-[#666] hover:bg-[#252525] rounded transition-colors"
                      title="Quick Handover to Driver"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>

                    <ChevronRight className="w-3.5 h-3.5 text-[#666]" />
                  </div>
                </div>
              </div>
            );
          })}

          {filteredLoads.length === 0 && (
            <div className="p-12 text-center bg-[#141414] border border-[#222] text-xs font-mono text-[#666]">
              NO SHIPMENTS MATCH SEARCH CRITERIA
            </div>
          )}
        </div>

        {/* Selected Load Detailed Dossier (5 cols on desktop) */}
        <div className="lg:col-span-5">
          {selectedLoad ? (
            <div className="p-5 bg-[#141414] border border-[#222] space-y-4 sticky top-20 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#222] pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C] font-bold block">
                    SHIPMENT DOSSIER
                  </span>
                  <h3 className="font-headline text-xl uppercase font-black text-white mt-0.5">
                    {selectedLoad.loadNumber}
                  </h3>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-mono uppercase font-black ${getStatusBadge(selectedLoad.status)}`}>
                  {selectedLoad.status}
                </span>
              </div>

              {/* Dossier Tab Navigation Bar */}
              <div className="flex items-center gap-1 border-b border-[#222] pb-2 flex-wrap">
                <button
                  id="tab-dossier-overview"
                  onClick={() => setDossierTab('OVERVIEW')}
                  className={`px-3 py-1.5 font-mono text-xs font-bold uppercase transition-colors flex items-center gap-1.5 border-b-2 -mb-[9px] ${
                    dossierTab === 'OVERVIEW'
                      ? 'border-[#C9A84C] text-[#C9A84C]'
                      : 'border-transparent text-[#777] hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>MANIFEST OVERVIEW</span>
                </button>

                <button
                  id="tab-transfer-audit-log"
                  onClick={() => setDossierTab('AUDIT_LOG')}
                  className={`px-3 py-1.5 font-mono text-xs font-bold uppercase transition-colors flex items-center gap-1.5 border-b-2 -mb-[9px] ${
                    dossierTab === 'AUDIT_LOG'
                      ? 'border-[#C9A84C] text-[#C9A84C]'
                      : 'border-transparent text-[#777] hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>TRANSFER AUDIT LOG</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                      (selectedLoad.handoverHistory?.length || (selectedLoad.handoverRecord ? 1 : 0)) > 0
                        ? 'bg-[#C9A84C] text-black font-black'
                        : 'bg-[#222] text-[#666]'
                    }`}
                  >
                    {selectedLoad.handoverHistory?.length || (selectedLoad.handoverRecord ? 1 : 0)}
                  </span>
                </button>

                <button
                  id="tab-relay-route-map"
                  onClick={() => setDossierTab('RELAY_MAP')}
                  className={`px-3 py-1.5 font-mono text-xs font-bold uppercase transition-colors flex items-center gap-1.5 border-b-2 -mb-[9px] ${
                    dossierTab === 'RELAY_MAP'
                      ? 'border-[#C9A84C] text-[#C9A84C]'
                      : 'border-transparent text-[#777] hover:text-white'
                  }`}
                >
                  <Map className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>RELAY ROUTE MAP</span>
                </button>
              </div>

              {dossierTab === 'OVERVIEW' ? (
                /* ================= MANIFEST OVERVIEW TAB ================= */
                <div className="space-y-5 animate-fadeIn">
                  {/* Financial Snapshot */}
                  <div className="p-3 bg-[#0A0A0A] border border-[#222] grid grid-cols-3 gap-2 text-center font-mono">
                    <div>
                      <span className="text-[9px] text-[#666] uppercase block">TOTAL PAYOUT</span>
                      <span className="text-lg font-black text-[#C9A84C]">
                        ${selectedLoad.rateUsd.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#666] uppercase block">TRIP DISTANCE</span>
                      <span className="text-lg font-black text-white">
                        {selectedLoad.miles} <span className="text-[10px] text-[#666]">MI</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#666] uppercase block">RATE / MILE</span>
                      <span className="text-lg font-black text-white">
                        ${selectedLoad.ratePerMile}
                      </span>
                    </div>
                  </div>

                  {/* Assignment & Equipment */}
                  <div className="space-y-2 text-xs font-mono">
                    <div className="text-[10px] text-[#777] uppercase font-bold tracking-wider">
                      EQUIPMENT &amp; CREW ASSIGNMENT
                    </div>
                    <div className="p-3 bg-[#0A0A0A] border border-[#222] space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[#777]">Assigned Driver:</span>
                        <span className="text-white font-bold">{selectedLoad.driverName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#777]">Power Unit:</span>
                        <span className="text-[#C9A84C] font-bold">{selectedLoad.assignedUnit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#777]">Trailer:</span>
                        <span className="text-white font-bold">{selectedLoad.trailerUnit} ({selectedLoad.equipment})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#777]">Commodity / Weight:</span>
                        <span className="text-white font-bold">{selectedLoad.commodity} · {selectedLoad.weightLbs.toLocaleString()} lbs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#777]">Bill of Lading (BOL):</span>
                        <span className="text-[#38BDF8] font-bold">{selectedLoad.bolNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Broker Details */}
                  <div className="space-y-2 text-xs font-mono">
                    <div className="text-[10px] text-[#777] uppercase font-bold tracking-wider">
                      BROKER &amp; DISPATCH CONTRACT
                    </div>
                    <div className="p-3 bg-[#0A0A0A] border border-[#222] space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[#777]">Broker Entity:</span>
                        <span className="text-white font-bold">{selectedLoad.brokerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#777]">Dispatch Phone:</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {selectedLoad.brokerPhone}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#777]">Payment Terms:</span>
                        <span className="text-white font-bold">QuickPay 2-Day (1.5% Fee)</span>
                      </div>
                    </div>
                  </div>

                  {/* Highway Radar Safety Clearance */}
                  <div className="p-3 bg-[#0A0A0A] border border-[#222] flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" />
                    <div className="text-[11px] font-mono">
                      <div className="text-[#C9A84C] font-bold uppercase">
                        FHWA Low Clearance Protected
                      </div>
                      <div className="text-[#777] mt-0.5">
                        {selectedLoad.notes}
                      </div>
                    </div>
                  </div>

                  {/* Verified Electronic Chain of Custody Record (if handed over) */}
                  {selectedLoad.handoverRecord && (
                    <div className="p-3 bg-[#111A11] border border-emerald-500/50 space-y-2">
                      <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                          <Award className="w-3.5 h-3.5" />
                          <span>Electronic Chain of Custody Verified</span>
                        </div>
                        <button
                          onClick={() => setDossierTab('AUDIT_LOG')}
                          className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 font-mono text-[9px] border border-emerald-500/40 hover:bg-emerald-900 transition-colors font-bold"
                        >
                          VIEW AUDIT LOG ({selectedLoad.handoverHistory?.length || 1}) →
                        </button>
                      </div>

                      <div className="text-[11px] font-mono space-y-1">
                        <div className="text-[#AAA]">
                          Transferred from <span className="text-white font-bold">{selectedLoad.handoverRecord.departingDriverName}</span> to{' '}
                          <span className="text-emerald-400 font-bold">{selectedLoad.handoverRecord.receivingDriverName}</span> ({selectedLoad.handoverRecord.receivingDriverUnit}).
                        </div>
                        <div className="text-[10px] text-[#777]">
                          Waypoint: {selectedLoad.handoverRecord.location} · Seal: {selectedLoad.handoverRecord.cargoSealNumber}
                        </div>
                      </div>

                      <button
                        onClick={() => openCertificateView(selectedLoad.handoverRecord!, selectedLoad)}
                        className="w-full mt-1 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                      >
                        <PenTool className="w-3 h-3 text-emerald-400" />
                        <span>VIEW SIGNED HANDOVER CERTIFICATE</span>
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      id="dossier-quick-handover-action-btn"
                      onClick={() => openHandoverForLoad(selectedLoad)}
                      className="w-full py-2.5 bg-[#C9A84C] hover:bg-white text-black text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(201,168,76,0.25)]"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>QUICK HANDOVER TO RELIEF DRIVER</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => showToast(`Rate Confirmation & BOL manifest for ${selectedLoad.loadNumber} exported to carrier packet.`)}
                        className="flex-1 py-2.5 bg-[#1C1C1C] hover:bg-[#252525] border border-[#333] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#C9A84C]" />
                        <span>VIEW RATE CON &amp; BOL</span>
                      </button>

                      <button
                        onClick={() => setIsPodModalOpen(true)}
                        className="flex-1 py-2.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>UPLOAD POD &amp; FACTOR</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : dossierTab === 'AUDIT_LOG' ? (
                /* ================= TRANSFER AUDIT LOG TAB ================= */
                <div className="space-y-4 animate-fadeIn font-mono">
                  {/* Banner / Chain Summary */}
                  <div className="p-3 bg-[#0A0A0A] border border-[#222] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Award className="w-4 h-4 text-[#C9A84C]" />
                        <span>CHAIN OF CUSTODY AUDIT LOG</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                        FMCSA § 390.31 VALIDATED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-[#1C1C1C]">
                      <div>
                        <span className="text-[#666] uppercase block">TOTAL HANDOVERS:</span>
                        <span className="text-white font-bold text-xs">
                          {selectedLoad.handoverHistory?.length || (selectedLoad.handoverRecord ? 1 : 0)} Transfers
                        </span>
                      </div>
                      <div>
                        <span className="text-[#666] uppercase block">CURRENT CUSTODIAN:</span>
                        <span className="text-[#C9A84C] font-bold text-xs truncate block">
                          {selectedLoad.driverName} ({selectedLoad.assignedUnit})
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      <button
                        id="btn-export-transfer-summary-csv"
                        onClick={() => handleExportTransferSummaryCSV(selectedLoad)}
                        disabled={!(selectedLoad.handoverHistory?.length || selectedLoad.handoverRecord)}
                        className="w-full sm:flex-1 py-2 bg-[#1A1A1A] hover:bg-emerald-950/90 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 disabled:opacity-40 disabled:hover:bg-[#1A1A1A] disabled:hover:border-[#333] text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>EXPORT TRANSFER SUMMARY (CSV)</span>
                      </button>

                      <button
                        onClick={() => openHandoverForLoad(selectedLoad)}
                        className="w-full sm:flex-1 py-2 bg-[#C9A84C]/10 hover:bg-[#C9A84C] border border-[#C9A84C] text-[#C9A84C] hover:text-black text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>+ EXECUTE HANDOVER</span>
                      </button>
                    </div>
                  </div>

                  {/* Audit Search Bar & Filter Dropdown */}
                  <div className="p-2 bg-[#0E0E0E] border border-[#222] space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777]" />
                      <input
                        type="text"
                        value={auditSearchQuery}
                        onChange={(e) => setAuditSearchQuery(e.target.value)}
                        placeholder={
                          auditFilterType === 'DRIVER'
                            ? "Filter by driver name, ID, unit, CDL..."
                            : auditFilterType === 'TIMESTAMP'
                            ? "Filter by timestamp or date..."
                            : "Search records (driver ID, timestamp, seal, location)..."
                        }
                        className="w-full bg-[#141414] border border-[#262626] focus:border-[#C9A84C] pl-8 pr-7 py-1.5 text-xs text-white placeholder-[#555] font-mono outline-none transition-colors"
                      />
                      {auditSearchQuery && (
                        <button
                          onClick={() => setAuditSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#777] hover:text-white p-0.5"
                          title="Clear Search"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Filter className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                      <select
                        value={auditFilterType}
                        onChange={(e) => setAuditFilterType(e.target.value as 'ALL' | 'DRIVER' | 'TIMESTAMP')}
                        className="bg-[#141414] border border-[#262626] focus:border-[#C9A84C] px-2 py-1.5 text-xs text-white font-mono outline-none cursor-pointer w-full sm:w-auto"
                      >
                        <option value="ALL">FILTER: ALL FIELDS</option>
                        <option value="DRIVER">FILTER: DRIVER ID / NAME</option>
                        <option value="TIMESTAMP">FILTER: TIMESTAMP / DATE</option>
                      </select>
                    </div>
                  </div>

                  {/* Audit Entries List */}
                  {(() => {
                    const rawHistory =
                      selectedLoad.handoverHistory && selectedLoad.handoverHistory.length > 0
                        ? selectedLoad.handoverHistory
                        : selectedLoad.handoverRecord
                        ? [selectedLoad.handoverRecord]
                        : [];

                    if (rawHistory.length === 0) {
                      return (
                        <div className="p-6 bg-[#0E0E0E] border border-dashed border-[#333] text-center space-y-3">
                          <History className="w-8 h-8 text-[#555] mx-auto" />
                          <div>
                            <div className="text-xs font-bold text-white uppercase">
                              No Transfer Audit Records Found
                            </div>
                            <p className="text-[10px] text-[#777] mt-1 max-w-xs mx-auto">
                              No quick handovers have been completed for shipment {selectedLoad.loadNumber} yet. All future digital sign-offs and safety checklists will be cryptographically logged here.
                            </p>
                          </div>
                          <button
                            onClick={() => openHandoverForLoad(selectedLoad)}
                            className="px-3 py-1.5 bg-[#C9A84C] text-black text-[10px] font-bold uppercase tracking-wider hover:bg-white transition-colors"
                          >
                            ⚡ Initiate First Handover
                          </button>
                        </div>
                      );
                    }

                    const history = rawHistory.filter((record) => {
                      if (!auditSearchQuery.trim()) return true;
                      const q = auditSearchQuery.toLowerCase().trim();

                      if (auditFilterType === 'DRIVER') {
                        const driverFields = [
                          record.departingDriverName,
                          record.departingDriverUnit,
                          record.receivingDriverName,
                          record.receivingDriverId,
                          record.receivingDriverUnit,
                          record.receivingDriverCdl,
                          record.signerLegalName,
                          record.signerCdlNumber,
                        ];
                        return driverFields.some((f) => f && f.toLowerCase().includes(q));
                      }

                      if (auditFilterType === 'TIMESTAMP') {
                        return record.timestamp && record.timestamp.toLowerCase().includes(q);
                      }

                      // ALL fields
                      const allFields = [
                        record.departingDriverName,
                        record.departingDriverUnit,
                        record.receivingDriverName,
                        record.receivingDriverId,
                        record.receivingDriverUnit,
                        record.receivingDriverCdl,
                        record.signerLegalName,
                        record.signerCdlNumber,
                        record.timestamp,
                        record.location,
                        record.cargoSealNumber,
                        record.sha256AuditHash,
                        record.handoverReason,
                      ];
                      return allFields.some((f) => f && f.toLowerCase().includes(q));
                    });

                    if (history.length === 0) {
                      return (
                        <div className="p-6 bg-[#0E0E0E] border border-[#222] text-center space-y-3">
                          <Search className="w-6 h-6 text-[#666] mx-auto" />
                          <div>
                            <div className="text-xs font-bold text-white uppercase">
                              No Audit Records Match Search Criteria
                            </div>
                            <p className="text-[10px] text-[#888] mt-1 max-w-xs mx-auto">
                              No sign-off records matched "{auditSearchQuery}" under {auditFilterType === 'ALL' ? 'all fields' : auditFilterType.toLowerCase()} filter.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setAuditSearchQuery('');
                              setAuditFilterType('ALL');
                            }}
                            className="px-3 py-1 bg-[#222] hover:bg-[#333] border border-[#444] text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
                          >
                            Reset Search &amp; Filter
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        <div className="text-[10px] text-[#777] uppercase font-bold tracking-wider flex items-center justify-between">
                          <span>TIMESTAMPED HANDOVER CHRONOLOGY</span>
                          <div className="flex items-center gap-2">
                            <span>
                              {history.length} OF {rawHistory.length} RECORDED
                            </span>
                            <button
                              onClick={() => handleExportTransferSummaryCSV(selectedLoad)}
                              className="px-1.5 py-0.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1"
                              title="Export CSV report of driver handovers for compliance and accounting"
                            >
                              <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                              <span>CSV REPORT</span>
                            </button>
                          </div>
                        </div>

                        {history.map((record, index) => {
                          const seqNum = rawHistory.indexOf(record) !== -1 ? rawHistory.length - rawHistory.indexOf(record) : history.length - index;
                          return (
                            <div
                              key={record.id || index}
                              className="p-3.5 bg-[#0D0D0D] border border-[#222] hover:border-[#333] transition-colors space-y-3 relative group"
                            >
                              {/* Entry Header */}
                              <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-2 text-[10px]">
                                <div className="flex items-center gap-2">
                                  <span className="px-1.5 py-0.5 bg-[#C9A84C] text-black font-black">
                                    HANDOVER #{seqNum}
                                  </span>
                                  <span className="text-[#888] font-bold">{record.timestamp}</span>
                                </div>
                                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[9px] uppercase">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>VERIFIED E-SIGN</span>
                                </span>
                              </div>

                              {/* Drivers Transfer Flow */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-[#141414] p-2.5 border border-[#1A1A1A]">
                                <div>
                                  <span className="text-[#666] text-[9px] uppercase block">DEPARTING DRIVER</span>
                                  <div className="font-bold text-white">{record.departingDriverName}</div>
                                  <div className="text-[#888] text-[10px]">Unit: {record.departingDriverUnit}</div>
                                </div>
                                <div className="border-t sm:border-t-0 sm:border-l border-[#222] pt-1.5 sm:pt-0 sm:pl-2.5">
                                  <span className="text-[#C9A84C] text-[9px] uppercase block font-bold">RECEIVING DRIVER</span>
                                  <div className="font-bold text-white">{record.receivingDriverName}</div>
                                  <div className="text-[#888] text-[10px]">Unit: {record.receivingDriverUnit} · CDL: {record.receivingDriverCdl}</div>
                                </div>
                              </div>

                              {/* Waypoint, Reason & Seal */}
                              <div className="space-y-1 text-[10px]">
                                <div className="flex justify-between text-[#AAA]">
                                  <span>Relay Waypoint:</span>
                                  <span className="text-white font-medium">{record.location}</span>
                                </div>
                                <div className="flex justify-between text-[#AAA]">
                                  <span>Cargo Seal Number:</span>
                                  <span className="text-[#C9A84C] font-bold font-mono">{record.cargoSealNumber}</span>
                                </div>
                                <div className="flex justify-between text-[#AAA]">
                                  <span>Transfer Directive:</span>
                                  <span className="px-1.5 py-0.2 bg-[#1C1C1C] text-white border border-[#333] text-[9px] font-bold uppercase">
                                    {record.handoverReason ? record.handoverReason.replace(/_/g, ' ') : 'HOS RELIEF'}
                                  </span>
                                </div>
                              </div>

                              {/* FMCSA Safety Checklist Status */}
                              <div className="p-2 bg-[#080808] border border-[#1A1A1A] space-y-1">
                                <span className="text-[9px] text-[#666] uppercase font-bold block">
                                  FMCSA § 396.13 SAFETY &amp; CUSTODY VERIFICATION (6/6 CHECKED)
                                </span>
                                <div className="grid grid-cols-2 gap-1 text-[9px] text-emerald-300">
                                  <div className="flex items-center gap-1">
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                    <span>Pre-Trip Walkaround</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                    <span>Cargo Seal Intact</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                    <span>BOL Transferred</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                    <span>Reefer Temp Valid</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                    <span>Keys/Cards Swapped</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                    <span>ELD Pair Confirmed</span>
                                  </div>
                                </div>
                              </div>

                              {/* Digital Signature & Hash */}
                              <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-[#1A1A1A]">
                                <div className="text-[9px] text-[#888]">
                                  <div>Signer: <span className="text-white font-bold">{record.signerLegalName}</span></div>
                                  <div className="text-[8px] font-mono text-[#666] truncate max-w-[200px]">
                                    Hash: {record.sha256AuditHash ? record.sha256AuditHash.slice(0, 24) : 'sha256:verified'}...
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard?.writeText(record.sha256AuditHash);
                                      showToast(`Cryptographic audit hash copied to clipboard: ${record.sha256AuditHash.slice(0, 20)}...`);
                                    }}
                                    className="p-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-[#AAA] hover:text-white rounded transition-colors"
                                    title="Copy SHA-256 Audit Hash"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>

                                  <button
                                    onClick={() => openCertificateView(record, selectedLoad)}
                                    className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-500/40 text-emerald-200 text-[9px] font-bold uppercase transition-colors flex items-center gap-1"
                                  >
                                    <PenTool className="w-2.5 h-2.5 text-emerald-400" />
                                    <span>CERTIFICATE</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* ================= RELAY ROUTE MAP TAB ================= */
                <div className="space-y-4 animate-fadeIn font-mono">
                  <div className="p-3 bg-[#0A0A0A] border border-[#222] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-[#C9A84C] font-bold uppercase flex items-center gap-1.5">
                        <Map className="w-3.5 h-3.5" />
                        <span>{selectedLoad.loadNumber} &bull; RELAY WAYPOINT CORRIDOR</span>
                      </div>
                      <div className="text-white font-bold text-xs mt-0.5">
                        {selectedLoad.origin} &rarr; {selectedLoad.destination}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-950/90 border border-emerald-500/50 text-emerald-400 text-[9px] font-bold uppercase self-start sm:self-auto">
                      GOOGLE MAPS API KEY 200 OK
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] p-2 bg-[#0E0E0E] border border-[#222]">
                    <div>
                      <span className="text-[#666] uppercase block">RELAY HUB:</span>
                      <span className="text-white font-bold">{selectedLoad.relayWaypointLocation || 'Breezewood Relay Hub, PA'}</span>
                    </div>
                    <div>
                      <span className="text-[#666] uppercase block">ASSIGNED TRACTOR:</span>
                      <span className="text-[#C9A84C] font-bold">{selectedLoad.assignedUnit} &bull; {selectedLoad.driverName}</span>
                    </div>
                  </div>

                  <div className="h-96 w-full rounded border border-[#2B2D36] overflow-hidden shadow-xl">
                    <FreightGeographicMap
                      hazards={LOW_BRIDGE_HAZARDS}
                      simulatedVehicleHeight={162}
                      apiKey="AIzaSyARKnjOYNAyq5RdWdif6qn4tTLT0lEEb0w"
                      activeLoad={selectedLoad}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 bg-[#141414] border border-[#222] text-center text-xs font-mono text-[#666]">
              SELECT A SHIPMENT TO INSPECT FULL MANIFEST
            </div>
          )}
        </div>
      </div>

      {/* Dispatch New Load Modal */}
      {isNewLoadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#141414] border border-[#333] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#C9A84C] uppercase font-bold tracking-widest block">
                  NEW FREIGHT ORDER
                </span>
                <h3 className="font-headline text-xl uppercase font-black text-white">
                  Dispatch Shipment
                </h3>
              </div>
              <button
                onClick={() => setIsNewLoadModalOpen(false)}
                className="text-[#666] hover:text-white font-mono text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLoad} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[#888] uppercase mb-1">
                  Origin (City, State)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Harrisburg, PA"
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] focus:border-[#C9A84C] p-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[#888] uppercase mb-1">
                  Destination (City, State)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chicago, IL"
                  value={newDest}
                  onChange={(e) => setNewDest(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] focus:border-[#C9A84C] p-2.5 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#888] uppercase mb-1">
                    Rate Agreed (USD)
                  </label>
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#333] focus:border-[#C9A84C] p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#888] uppercase mb-1">
                    Estimated Miles
                  </label>
                  <input
                    type="number"
                    value={newMiles}
                    onChange={(e) => setNewMiles(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#333] focus:border-[#C9A84C] p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#888] uppercase mb-1">
                    Commodity
                  </label>
                  <input
                    type="text"
                    value={newCommodity}
                    onChange={(e) => setNewCommodity(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#333] focus:border-[#C9A84C] p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#888] uppercase mb-1">
                    Freight Broker
                  </label>
                  <input
                    type="text"
                    value={newBroker}
                    onChange={(e) => setNewBroker(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#333] focus:border-[#C9A84C] p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setIsNewLoadModalOpen(false)}
                  className="px-4 py-2 bg-[#1C1C1C] text-[#AAA] hover:text-white uppercase font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C9A84C] text-black font-black uppercase text-xs hover:bg-white transition-colors"
                >
                  Create &amp; Dispatch Load
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Rate Con OCR Upload Modal */}
      <RateConUploadModal
        isOpen={isRateConModalOpen}
        onClose={() => setIsRateConModalOpen(false)}
        onLoadIngested={handleRateConIngested}
      />

      {/* Proof of Delivery & Factoring Modal */}
      <PodUploadModal
        isOpen={isPodModalOpen}
        onClose={() => setIsPodModalOpen(false)}
        load={selectedLoadAsDatBoardLoad}
        onPodSubmitted={handlePodSubmitted}
      />

      {/* Quick Handover Drag-and-Drop & E-Sign Workflow Modal */}
      <QuickHandoverModal
        isOpen={isHandoverModalOpen}
        onClose={() => {
          setIsHandoverModalOpen(false);
          setViewingCertificateRecord(null);
          setHandoverTargetLoad(null);
          setHandoverTargetDriver(null);
        }}
        load={handoverTargetLoad}
        initialReceivingDriver={handoverTargetDriver}
        availableDrivers={availableDrivers}
        onHandoverComplete={handleHandoverCompleted}
        viewOnlyRecord={viewingCertificateRecord}
      />

      {/* Driver Mobile Companion Mode Simulation Modal */}
      <DriverMobileCompanionModal
        isOpen={isDriverMobileModalOpen}
        onClose={() => setIsDriverMobileModalOpen(false)}
        activeLoad={selectedLoad}
        drivers={availableDrivers}
        onExecuteHandover={(record) => {
          if (selectedLoad) {
            handleHandoverCompleted(selectedLoad.id, record);
          }
        }}
      />

      {/* Floating In-App Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 p-3.5 rounded bg-[#141414] border border-[#C9A84C] text-white font-mono text-xs shadow-2xl flex items-center gap-2 max-w-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#C9A84C] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
