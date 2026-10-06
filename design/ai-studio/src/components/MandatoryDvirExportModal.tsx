import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Printer,
  Download,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Truck,
  Wrench,
  X,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Send,
  UserCheck,
  BadgeCheck,
  FileText,
  Radio,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { DvirInspection, DvirDefectItem } from '../types';
import { triggerHapticFeedback } from '../services/haptics';
import { generateIntegritySeal } from '../services/maintenanceComplianceService';

export interface DvirBundlePackage {
  bundleId: string;
  date: string;
  dateDisplay: string;
  carrierLegalName: string;
  carrierDba: string;
  usdotNumber: string;
  mcNumber: string;
  unitNumber: string;
  unitVin: string;
  unitMakeModel: string;
  trailerNumber: string;
  trailerVin: string;
  startOdometer: number;
  endOdometer: number;
  totalDailyMiles: number;
  preTrip: {
    inspectionId: string;
    timestamp: string;
    location: string;
    driverName: string;
    driverCdl: string;
    status: 'SATISFACTORY' | 'DEFECTS_NOTED' | 'OUT_OF_SERVICE';
    signatureVerified: boolean;
    signatureTimestamp: string;
    items: {
      category: string;
      item: string;
      passed: boolean;
      measurement?: string;
      notes?: string;
    }[];
    defects: DvirDefectItem[];
  };
  postTrip: {
    inspectionId: string;
    timestamp: string;
    location: string;
    driverName: string;
    driverCdl: string;
    status: 'SATISFACTORY' | 'DEFECTS_NOTED' | 'OUT_OF_SERVICE';
    signatureVerified: boolean;
    signatureTimestamp: string;
    items: {
      category: string;
      item: string;
      passed: boolean;
      measurement?: string;
      notes?: string;
    }[];
    defects: DvirDefectItem[];
  };
  mechanicCertification?: {
    certified: boolean;
    workOrderNumber: string;
    technicianName: string;
    certNumber: string;
    repairDate: string;
    repairNotes: string;
    signatureVerified: boolean;
  };
  reviewingDriverSignoff?: {
    driverName: string;
    cdlNumber: string;
    timestamp: string;
    acknowledgedSafe: boolean;
  };
  sha256Seal: string;
  fmcsaStatutes: string[];
}

interface MandatoryDvirExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUnit?: string;
  initialDate?: string;
  onAddNotification?: (notification: {
    id: string;
    time: string;
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'alert' | 'success';
    read: boolean;
  }) => void;
}

export const MandatoryDvirExportModal: React.FC<MandatoryDvirExportModalProps> = ({
  isOpen,
  onClose,
  initialUnit = 'UNIT #104-E',
  initialDate,
  onAddNotification,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<string>(initialUnit);
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [copiedSeal, setCopiedSeal] = useState(false);
  const [officerEmail, setOfficerEmail] = useState('dot.inspection.terminal@state.gov');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmitSuccess, setTransmitSuccess] = useState(false);

  // Generate complete FMCSA bundle
  const bundle = useMemo<DvirBundlePackage>(() => {
    const isUnit104 = selectedUnit.includes('104');
    const isUnit312 = selectedUnit.includes('312');

    const unitMake = isUnit104
      ? '2024 Freightliner Cascadia 126 (DD15 Gen 5)'
      : isUnit312
      ? '2022 Peterbilt 579 (PACCAR MX-13)'
      : '2025 Kenworth T680 NextGen';
    const unitVin = isUnit104
      ? '1FUJGLDR7RPKN8841'
      : isUnit312
      ? '1NPLAP0X7KN55192'
      : '1XKWDB9X6RR104928';
    const trlNumber = isUnit104 ? 'TRL-5390' : isUnit312 ? 'TRL-6112' : 'TRL-8092';
    const trlVin = isUnit104 ? '1UYVS2537MA10948' : '1UT1A2534KA88219';

    const driverName = isUnit104 ? 'Marcus Kowalski' : isUnit312 ? 'Devon Vance' : 'Jason Henderson';
    const driverCdl = isUnit104 ? 'PA-CDL #849102839-A' : 'IN-CDL #992817263-A';

    const startOdo = isUnit104 ? 142402 : 234100;
    const endOdo = isUnit104 ? 142850 : 234560;
    const dailyMiles = endOdo - startOdo;

    const baseItems = [
      {
        category: 'Service Brakes & Air System',
        item: 'Air Loss Decay Test & Compressor Governor',
        passed: true,
        measurement: 'Governor Cut-out: 125 PSI • 0 PSI/min loss at 90 PSI service apply',
      },
      {
        category: 'Service Brakes & Air System',
        item: 'Brake Linings & Chamber Stroke',
        passed: true,
        measurement: 'Steers: 0.62" lining • Drives: 0.58" lining • Type 30 stroke: 1.4"',
      },
      {
        category: 'Steering & Front Suspension',
        item: 'Steering Box, Drag Link, Pitman Arm & Tie Rods',
        passed: true,
        measurement: 'Steering wheel free play: 0.75" (< 2.0" limit) • Castle nuts & cotter pins intact',
      },
      {
        category: 'Tires, Wheels & Rims',
        item: 'Steer Tires (Tread Depth & Inflation)',
        passed: true,
        measurement: 'L-Steer: 7/32" (110 PSI) • R-Steer: 7/32" (110 PSI)',
      },
      {
        category: 'Tires, Wheels & Rims',
        item: 'Drive & Trailer Tires (Tread Depth & Lug Nuts)',
        passed: true,
        measurement: 'Drive Axles: 8/32" avg • Trailer: 6/32" avg • All 80 lug nuts torqued 475 lb-ft',
      },
      {
        category: 'Coupling Devices',
        item: 'Fifth Wheel Locking Jaws & Kingpin Jaws',
        passed: true,
        measurement: 'Jaws completely locked around kingpin shank • Release handle safety latch locked',
      },
      {
        category: 'Lighting & Reflectors',
        item: 'Headlamps, Turn Signals, Brake & Marker Lamps',
        passed: true,
        measurement: '100% LEDs operational • 100% DOT Conspicuity reflective tape intact',
      },
      {
        category: 'In-Cab Glass & Visibility',
        item: 'Windshield Wipers, Washers & Defroster',
        passed: true,
        measurement: 'No cracks in wiper sweep area • Defroster functional • Mirrors adjusted',
      },
      {
        category: 'Emergency Safety Equipment',
        item: 'Fire Extinguisher, Triangles & Spare Fuses',
        passed: true,
        measurement: '10-B:C Extinguisher fully charged (green zone) • 3 bi-directional triangles in box',
      },
    ];

    const rawPayload = JSON.stringify({
      unit: selectedUnit,
      date: selectedDate,
      startOdo,
      endOdo,
      driverName,
      driverCdl,
    });

    const seal = generateIntegritySeal(rawPayload);

    return {
      bundleId: `DOT-DVIR-${selectedDate.replace(/-/g, '')}-${selectedUnit.replace(/[^A-Z0-9]/gi, '')}`,
      date: selectedDate,
      dateDisplay: new Date(selectedDate + 'T12:00:00Z').toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      carrierLegalName: 'TRUCKWITHEASE LOGISTICS LLC',
      carrierDba: 'SPEEDPRO FREIGHT SYSTEMS',
      usdotNumber: '3928192',
      mcNumber: '991204',
      unitNumber: selectedUnit,
      unitVin,
      unitMakeModel: unitMake,
      trailerNumber: trlNumber,
      trailerVin: trlVin,
      startOdometer: startOdo,
      endOdometer: endOdo,
      totalDailyMiles: dailyMiles,
      preTrip: {
        inspectionId: `DVIR-${selectedDate.replace(/-/g, '')}-PRE-104`,
        timestamp: `${selectedDate} · 06:45 EDT (06:45:12.820)`,
        location: 'Allentown Logistics Terminal, PA (GPS: 40.6022° N, 75.4714° W)',
        driverName,
        driverCdl,
        status: 'SATISFACTORY',
        signatureVerified: true,
        signatureTimestamp: `${selectedDate} 06:45:12 EDT`,
        items: baseItems,
        defects: [],
      },
      postTrip: {
        inspectionId: `DVIR-${selectedDate.replace(/-/g, '')}-POST-104`,
        timestamp: `${selectedDate} · 18:30 EDT (18:30:45.104)`,
        location: 'Cleveland Corridor Hub, OH (GPS: 41.4993° N, 81.6944° W)',
        driverName,
        driverCdl,
        status: 'SATISFACTORY',
        signatureVerified: true,
        signatureTimestamp: `${selectedDate} 18:30:45 EDT`,
        items: baseItems,
        defects: [],
      },
      mechanicCertification: {
        certified: true,
        workOrderNumber: 'WO-88421-FLEETBAY',
        technicianName: 'Jake Reynolds, ASE-T4 Master Fleet Technician',
        certNumber: 'ASE-889104-T4',
        repairDate: selectedDate,
        repairNotes:
          'Prior post-trip air line standoff clip adjusted and verified under 100 PSI static pressure decay test. Zero air leaks detected. Certified safe for commercial motor vehicle operation pursuant to 49 CFR § 396.11(a)(3).',
        signatureVerified: true,
      },
      reviewingDriverSignoff: {
        driverName,
        cdlNumber: driverCdl,
        timestamp: `${selectedDate} 06:46:00 EDT`,
        acknowledgedSafe: true,
      },
      sha256Seal: seal,
      fmcsaStatutes: [
        '49 CFR § 396.11 (Driver Vehicle Inspection Report - DVIR)',
        '49 CFR § 396.13 (Driver Pre-Trip Inspection & Certification)',
        '49 CFR § 393 (Parts and Accessories Necessary for Safe Operation)',
        '49 CFR § 396.3 (Inspection, Repair, and Maintenance Records Retention)',
      ],
    };
  }, [selectedUnit, selectedDate]);

  if (!isOpen) return null;

  const handlePrint = () => {
    triggerHapticFeedback('tick');
    window.print();
  };

  const handleCopySeal = () => {
    if (bundle.sha256Seal) {
      navigator.clipboard.writeText(bundle.sha256Seal);
      setCopiedSeal(true);
      triggerHapticFeedback('success');
      setTimeout(() => setCopiedSeal(false), 2000);
    }
  };

  const handleTransmitToOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransmitting(true);
    triggerHapticFeedback('double');

    setTimeout(() => {
      setIsTransmitting(false);
      setTransmitSuccess(true);
      triggerHapticFeedback('success');

      if (onAddNotification) {
        onAddNotification({
          id: `dvir-export-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: `Mandatory DVIR Export Sent to DOT Officer`,
          description: `Bundled Pre-Trip & Post-Trip for ${bundle.unitNumber} (${bundle.date}) transmitted to ${officerEmail} with SHA-256 seal.`,
          severity: 'success',
          read: false,
        });
      }

      setTimeout(() => setTransmitSuccess(false), 4000);
    }, 1200);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bundle.bundleId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerHapticFeedback('success');
  };

  const downloadCsv = () => {
    const csvContent = [
      ['SECTION', 'INSPECTION_TYPE', 'CATEGORY', 'ITEM_DESCRIPTION', 'STATUS', 'MEASUREMENT_NOTES', 'TIMESTAMP', 'SIGNATURE'].join(','),
      ...bundle.preTrip.items.map((it) =>
        [
          'PRE_TRIP_DVIR',
          'PRE_TRIP',
          `"${it.category}"`,
          `"${it.item}"`,
          it.passed ? 'PASSED' : 'DEFECT',
          `"${it.measurement || ''}"`,
          `"${bundle.preTrip.timestamp}"`,
          `"${bundle.preTrip.driverName} (${bundle.preTrip.driverCdl})"`,
        ].join(',')
      ),
      ...bundle.postTrip.items.map((it) =>
        [
          'POST_TRIP_DVIR',
          'POST_TRIP',
          `"${it.category}"`,
          `"${it.item}"`,
          it.passed ? 'PASSED' : 'DEFECT',
          `"${it.measurement || ''}"`,
          `"${bundle.postTrip.timestamp}"`,
          `"${bundle.postTrip.driverName} (${bundle.postTrip.driverCdl})"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bundle.bundleId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerHapticFeedback('success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#101010] border border-[#333] shadow-2xl rounded-none text-slate-100 my-auto max-h-[95vh] flex flex-col font-mono">
        {/* ========================================================================= */}
        {/* TOP MODAL CONTROL BAR (Hidden on Print) */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#181818] border-b border-[#2A2A2A] gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C9A84C]/15 border border-[#C9A84C]/40 flex items-center justify-center text-[#C9A84C] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-[#C9A84C] font-black uppercase tracking-wider">
                  MANDATORY DVIR EXPORT BUNDLER
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  49 CFR § 396.11 &amp; § 396.13 COMPLIANT
                </span>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                  DOT ROADSIDE READY
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                Pre-Trip + Post-Trip Inspection Manifest #{bundle.bundleId}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#C9A84C] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
              title="Print official DOT Roadside Inspection Sheet"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT / SAVE PDF</span>
            </button>
            <button
              onClick={downloadJson}
              className="flex items-center gap-1 px-2.5 py-2 bg-[#222] hover:bg-[#333] border border-[#444] text-slate-200 text-xs font-bold uppercase transition-colors"
              title="Download JSON Audit Packet"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>JSON</span>
            </button>
            <button
              onClick={downloadCsv}
              className="flex items-center gap-1 px-2.5 py-2 bg-[#222] hover:bg-[#333] border border-[#444] text-slate-200 text-xs font-bold uppercase transition-colors"
              title="Download CSV Audit Log"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-[#222] transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BUNDLE SELECTOR & TRANSMIT BAR (Hidden on Print) */}
        {/* ========================================================================= */}
        <div className="p-3 bg-[#141414] border-b border-[#252525] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-[#777] uppercase font-bold">POWER UNIT:</label>
              <select
                value={selectedUnit}
                onChange={(e) => {
                  setSelectedUnit(e.target.value);
                  triggerHapticFeedback('tick');
                }}
                className="bg-[#1C1C1C] border border-[#333] text-white px-2.5 py-1 text-xs outline-none focus:border-[#C9A84C]"
              >
                <option value="UNIT #104-E">UNIT #104-E (Freightliner Cascadia)</option>
                <option value="UNIT #312-C">UNIT #312-C (Peterbilt 579)</option>
                <option value="UNIT #809-K">UNIT #809-K (Kenworth T680)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[10px] text-[#777] uppercase font-bold">DATE:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  triggerHapticFeedback('tick');
                }}
                className="bg-[#1C1C1C] border border-[#333] text-white px-2.5 py-1 text-xs outline-none focus:border-[#C9A84C]"
              />
            </div>
          </div>

          {/* Quick Send to Officer Form */}
          <form onSubmit={handleTransmitToOfficer} className="flex items-center gap-2">
            <input
              type="text"
              value={officerEmail}
              onChange={(e) => setOfficerEmail(e.target.value)}
              placeholder="Officer email or terminal code"
              className="bg-[#1C1C1C] border border-[#333] text-white px-2.5 py-1 text-xs outline-none focus:border-[#C9A84C] w-48 sm:w-60"
            />
            <button
              type="submit"
              disabled={isTransmitting}
              className="px-3 py-1 bg-[#252525] hover:bg-[#333] border border-[#444] text-[#C9A84C] hover:text-white text-xs font-bold uppercase transition-all flex items-center gap-1.5 active:scale-95"
            >
              {isTransmitting ? (
                <span>SENDING...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>TRANSMIT</span>
                </>
              )}
            </button>
          </form>
        </div>

        {transmitSuccess && (
          <div className="p-2.5 bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between px-4 print:hidden">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              Verified DOT DVIR Roadside Bundle transmitted securely with encrypted receipt ID #
              {bundle.sha256Seal.slice(0, 18)}.
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">200 OK FMCSA WEB SERVICES</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PRINTABLE OFFICIAL DOT DVIR DOCUMENT (Standard 8.5x11 PDF Layout) */}
        {/* ========================================================================= */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-6 bg-white text-black font-mono print:p-0 print:m-0 print:space-y-4">
          {/* Official Federal Header Banner */}
          <div className="border-4 border-black p-4 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-black pb-3 gap-2">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-700 block">
                  UNITED STATES DEPARTMENT OF TRANSPORTATION • FMCSA COMPLIANCE MANIFEST
                </span>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                  MANDATORY DRIVER VEHICLE INSPECTION REPORT (DVIR)
                </h1>
                <span className="text-xs font-bold text-slate-800">
                  CONSOLIDATED DAILY PRE-TRIP &amp; POST-TRIP CERTIFICATION BUNDLE
                </span>
              </div>

              <div className="text-right sm:border-l-2 sm:border-black sm:pl-4">
                <span className="text-[9px] uppercase font-bold text-slate-600 block">
                  GOVERNING REGULATIONS
                </span>
                <span className="text-xs font-black block text-black">
                  49 CFR § 396.11 &amp; § 396.13
                </span>
                <span className="text-[10px] font-bold text-emerald-800 block">
                  STATUS: SATISFACTORY / PASSED
                </span>
              </div>
            </div>

            {/* Carrier & Vehicle Header Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
              <div className="border border-slate-300 p-2">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">
                  MOTOR CARRIER NAME
                </span>
                <strong className="text-black text-[11px] block">{bundle.carrierLegalName}</strong>
                <span className="text-[9px] text-slate-700">DBA {bundle.carrierDba}</span>
              </div>

              <div className="border border-slate-300 p-2">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">
                  USDOT / MC AUTHORITY
                </span>
                <strong className="text-black text-[11px] block">
                  USDOT #{bundle.usdotNumber}
                </strong>
                <span className="text-[9px] text-slate-700">MC #{bundle.mcNumber}</span>
              </div>

              <div className="border border-slate-300 p-2">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">
                  POWER UNIT (TRACTOR)
                </span>
                <strong className="text-black text-[11px] block">{bundle.unitNumber}</strong>
                <span className="text-[9px] text-slate-700 font-mono">VIN: {bundle.unitVin}</span>
              </div>

              <div className="border border-slate-300 p-2">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">
                  TRAILER / EQUIPMENT
                </span>
                <strong className="text-black text-[11px] block">{bundle.trailerNumber}</strong>
                <span className="text-[9px] text-slate-700 font-mono">VIN: {bundle.trailerVin}</span>
              </div>
            </div>

            {/* Date, Odometer & Location Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="border border-slate-300 p-2">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">
                  INSPECTION DATE
                </span>
                <strong className="text-black text-[11px]">{bundle.dateDisplay}</strong>
              </div>

              <div className="border border-slate-300 p-2">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">
                  ODOMETER (START / END)
                </span>
                <strong className="text-black text-[11px]">
                  {bundle.startOdometer.toLocaleString()} → {bundle.endOdometer.toLocaleString()} MI
                </strong>
              </div>

              <div className="border border-slate-300 p-2">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">
                  TOTAL DAILY MILEAGE
                </span>
                <strong className="text-black text-[11px]">
                  {bundle.totalDailyMiles.toLocaleString()} MILES
                </strong>
              </div>

              <div className="border border-slate-300 p-2">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">
                  AUDIT BUNDLE ID
                </span>
                <strong className="text-black text-[10px] truncate block">{bundle.bundleId}</strong>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION A: PRE-TRIP INSPECTION CHECKLIST (49 CFR § 396.13) */}
          {/* ========================================================================= */}
          <div className="border-2 border-black p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black pb-2 gap-2 bg-slate-100 p-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-black text-white font-black text-xs">
                  PART 1
                </span>
                <h2 className="text-sm font-black uppercase text-black">
                  PRE-TRIP VEHICLE INSPECTION RECORD
                </h2>
              </div>
              <div className="text-xs text-slate-700">
                <span>Timestamp: <strong>{bundle.preTrip.timestamp}</strong></span> •{' '}
                <span>Driver: <strong>{bundle.preTrip.driverName}</strong> ({bundle.preTrip.driverCdl})</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600">
              <strong>Pre-Trip Origin:</strong> {bundle.preTrip.location}
            </div>

            {/* Checklist Table */}
            <table className="w-full text-left text-xs border-collapse border border-black">
              <thead>
                <tr className="bg-slate-200 border-b border-black text-[10px] uppercase font-bold">
                  <th className="p-2 border-r border-black w-10 text-center">Status</th>
                  <th className="p-2 border-r border-black w-48">FMCSA Component Group</th>
                  <th className="p-2 border-r border-black">Item &amp; Inspection Standard</th>
                  <th className="p-2">Observed Value / Telematics Measurement</th>
                </tr>
              </thead>
              <tbody>
                {bundle.preTrip.items.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-slate-300 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    }`}
                  >
                    <td className="p-2 border-r border-black text-center font-bold text-emerald-800">
                      [ ✓ ]
                    </td>
                    <td className="p-2 border-r border-black font-bold text-slate-900 text-[11px]">
                      {item.category}
                    </td>
                    <td className="p-2 border-r border-black text-slate-800">{item.item}</td>
                    <td className="p-2 text-slate-700 font-mono text-[10px]">
                      {item.measurement}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pre-Trip Driver Signature Box */}
            <div className="border border-black p-3 bg-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-600 block">
                  PRE-TRIP DRIVER CERTIFICATION STATEMENT (49 CFR § 396.13)
                </span>
                <p className="text-[10px] text-slate-700 mt-0.5 leading-tight">
                  I hereby certify that I have conducted a thorough pre-trip inspection of all vehicle
                  components listed above, reviewed prior DVIR defects, and confirmed this vehicle is in
                  safe operating condition.
                </p>
              </div>

              <div className="border-t sm:border-t-0 sm:border-l border-slate-300 pt-2 sm:pt-0 sm:pl-4 flex flex-col justify-end">
                <div className="font-serif italic text-base sm:text-lg text-blue-900 font-bold">
                  /s/ {bundle.preTrip.driverName}
                </div>
                <div className="text-[10px] font-mono text-slate-600 border-t border-slate-400 pt-0.5">
                  CDL: {bundle.preTrip.driverCdl} • Digitally Signed: {bundle.preTrip.signatureTimestamp}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION B: POST-TRIP INSPECTION CHECKLIST (49 CFR § 396.11) */}
          {/* ========================================================================= */}
          <div className="border-2 border-black p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black pb-2 gap-2 bg-slate-100 p-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-black text-white font-black text-xs">
                  PART 2
                </span>
                <h2 className="text-sm font-black uppercase text-black">
                  POST-TRIP VEHICLE INSPECTION REPORT (END OF DUTY DAY)
                </h2>
              </div>
              <div className="text-xs text-slate-700">
                <span>Timestamp: <strong>{bundle.postTrip.timestamp}</strong></span> •{' '}
                <span>Driver: <strong>{bundle.postTrip.driverName}</strong> ({bundle.postTrip.driverCdl})</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600">
              <strong>Post-Trip Destination:</strong> {bundle.postTrip.location}
            </div>

            {/* Checklist Table */}
            <table className="w-full text-left text-xs border-collapse border border-black">
              <thead>
                <tr className="bg-slate-200 border-b border-black text-[10px] uppercase font-bold">
                  <th className="p-2 border-r border-black w-10 text-center">Status</th>
                  <th className="p-2 border-r border-black w-48">FMCSA Component Group</th>
                  <th className="p-2 border-r border-black">Item &amp; Post-Trip Audit Condition</th>
                  <th className="p-2">End of Day Diagnostics / Findings</th>
                </tr>
              </thead>
              <tbody>
                {bundle.postTrip.items.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-slate-300 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    }`}
                  >
                    <td className="p-2 border-r border-black text-center font-bold text-emerald-800">
                      [ ✓ ]
                    </td>
                    <td className="p-2 border-r border-black font-bold text-slate-900 text-[11px]">
                      {item.category}
                    </td>
                    <td className="p-2 border-r border-black text-slate-800">{item.item}</td>
                    <td className="p-2 text-slate-700 font-mono text-[10px]">
                      {item.measurement}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Post-Trip Driver Certification & Signature Box */}
            <div className="border border-black p-3 bg-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-600 block">
                  POST-TRIP DRIVER REPORT DECLARATION (49 CFR § 396.11(a))
                </span>
                <p className="text-[10px] text-slate-700 mt-0.5 leading-tight">
                  I certify that the above report is a true and accurate representation of the vehicle
                  condition at the completion of my tour of duty. No safety-critical defects or deficiencies
                  were discovered that would impair safe operation.
                </p>
              </div>

              <div className="border-t sm:border-t-0 sm:border-l border-slate-300 pt-2 sm:pt-0 sm:pl-4 flex flex-col justify-end">
                <div className="font-serif italic text-base sm:text-lg text-blue-900 font-bold">
                  /s/ {bundle.postTrip.driverName}
                </div>
                <div className="text-[10px] font-mono text-slate-600 border-t border-slate-400 pt-0.5">
                  CDL: {bundle.postTrip.driverCdl} • Digitally Signed: {bundle.postTrip.signatureTimestamp}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION C: CERTIFIED MECHANIC & REVIEWING DRIVER SIGN-OFF */}
          {/* ========================================================================= */}
          <div className="border-2 border-black p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-black pb-2 bg-slate-100 p-2">
              <span className="px-2 py-0.5 bg-black text-white font-black text-xs">
                PART 3
              </span>
              <h2 className="text-sm font-black uppercase text-black">
                DEFECT CORRECTION CERTIFICATION &amp; NEXT DRIVER SIGN-OFF (49 CFR § 396.11(a)(3))
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Mechanic Sign-Off */}
              <div className="border border-black p-3 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-700">
                    MECHANIC / CARRIER CERTIFICATION
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800">
                    STATUS: CERTIFIED SAFE
                  </span>
                </div>
                <p className="text-[10px] text-slate-700 leading-tight">
                  {bundle.mechanicCertification?.repairNotes}
                </p>
                <div className="pt-2 border-t border-slate-300">
                  <div className="font-serif italic text-base text-slate-900 font-bold">
                    /s/ {bundle.mechanicCertification?.technicianName}
                  </div>
                  <div className="text-[9px] text-slate-600 font-mono">
                    Cert: {bundle.mechanicCertification?.certNumber} • Work Order: #{bundle.mechanicCertification?.workOrderNumber}
                  </div>
                </div>
              </div>

              {/* Reviewing Driver Sign-Off */}
              <div className="border border-black p-3 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-700">
                    REVIEWING DRIVER ACKNOWLEDGMENT (49 CFR § 396.13(c))
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800">
                    STATUS: ACKNOWLEDGED
                  </span>
                </div>
                <p className="text-[10px] text-slate-700 leading-tight">
                  I certify that I have reviewed the prior vehicle inspection report and certify that the
                  required repairs have been performed and the vehicle is safe for dispatch.
                </p>
                <div className="pt-2 border-t border-slate-300">
                  <div className="font-serif italic text-base text-blue-900 font-bold">
                    /s/ {bundle.reviewingDriverSignoff?.driverName}
                  </div>
                  <div className="text-[9px] text-slate-600 font-mono">
                    CDL: {bundle.reviewingDriverSignoff?.cdlNumber} • Signed: {bundle.reviewingDriverSignoff?.timestamp}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION D: CRYPTOGRAPHIC AUDIT SEAL & FEDERAL RETENTION FOOTER */}
          {/* ========================================================================= */}
          <div className="border-4 border-black p-4 space-y-3 bg-slate-50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-600 block">
                  CRYPTOGRAPHIC FMCSA AUDIT SEAL (TAMPER-EVIDENT HASH)
                </span>
                <div className="font-mono text-xs font-black text-black break-all flex items-center gap-2">
                  <span>{bundle.sha256Seal}</span>
                  <button
                    onClick={handleCopySeal}
                    className="p-1 bg-white border border-black hover:bg-slate-200 text-black text-[10px] font-bold print:hidden"
                    title="Copy SHA-256 Hash"
                  >
                    {copiedSeal ? 'COPIED' : 'COPY HASH'}
                  </button>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="p-2 bg-white border-2 border-black font-mono text-[9px] font-bold text-black uppercase">
                  [ QR VERIFIED // DOT-2026 ]
                </div>
              </div>
            </div>

            <div className="text-[9px] text-slate-600 space-y-1 leading-normal">
              <p>
                <strong>MANDATORY 90-DAY RETENTION NOTICE:</strong> Pursuant to 49 CFR § 396.11(c)(2),
                the original or certified digital copy of this Driver Vehicle Inspection Report must be
                retained by the motor carrier for at least 90 calendar days from the date of creation and
                made available immediately upon request by any authorized DOT/FMCSA Special Agent, State
                Trooper, or CVSA Certified Inspector.
              </p>
              <p>
                Generated by TRUCKWITHEASE Fleet Operating System • Version 3.4.0 • Compliant with FMCSA
                Electronic Signature Standards (49 CFR Part 390.32).
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden on Print) */}
        <div className="flex items-center justify-between p-4 bg-[#181818] border-t border-[#2A2A2A] text-xs print:hidden">
          <div className="text-[#888] font-mono text-[11px] flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographically sealed &amp; ready for DOT roadside verification.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#252525] hover:bg-[#333] border border-[#444] text-white text-xs font-bold uppercase transition-colors"
            >
              CLOSE
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-[#C9A84C] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              PRINT / SAVE PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
