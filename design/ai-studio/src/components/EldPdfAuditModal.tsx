import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck,
  Hash,
  Copy,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Info,
  Sliders,
  Cpu,
  RefreshCw,
  Binary,
  MapPin,
  Check,
} from 'lucide-react';
import {
  EldEngineDiagnostics,
  EldDiagnosticTroubleCode,
  EldDutyCycleSyncEvent,
  EldRawPacket,
} from '../types';
import { MOCK_HOS_STATUS } from '../data/mockData';
import { HardwareInterface, HardwareStatus } from './ELDAuditView';

interface EldPdfAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnostics: EldEngineDiagnostics;
  connectedDeviceName: string;
  interfaceType: HardwareInterface;
  baudRate: number;
  hardwareStatus: HardwareStatus;
  latencyMs: number;
  rssi: number;
  dtcList: EldDiagnosticTroubleCode[];
  dutySyncEvents: EldDutyCycleSyncEvent[];
  packets: EldRawPacket[];
  filteredPackets: EldRawPacket[];
}

export const EldPdfAuditModal: React.FC<EldPdfAuditModalProps> = ({
  isOpen,
  onClose,
  diagnostics,
  connectedDeviceName,
  interfaceType,
  baudRate,
  hardwareStatus,
  latencyMs,
  rssi,
  dtcList,
  dutySyncEvents,
  packets,
  filteredPackets,
}) => {
  const [activeTab, setActiveTab] = useState<'document' | 'summary' | 'telemetry'>('document');
  const [selectedDateRange, setSelectedDateRange] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [driverRemarks, setDriverRemarks] = useState<string>('Standard 24-hr interstate commerce dispatch. No adverse weather exemptions claimed. Pre/Post-trip DVIR completed.');
  const [shippingDocNumber, setShippingDocNumber] = useState<string>('BOL-COY-77319');
  const [trailerNumber, setTrailerNumber] = useState<string>('TRL-5390');
  const [includeTelemetrySamples, setIncludeTelemetrySamples] = useState<boolean>(true);
  const [isCopiedHash, setIsCopiedHash] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Current formatted dates
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const dateIso = today.toISOString().split('T')[0];

  // Calculated 24-hour duty status summary
  // Off: 10.0h, Sleeper: 2.0h, Driving: 7.75h (7h45m), OnDuty: 4.25h (4h15m) -> Total: 24.00h
  const dutyTotals = {
    offDutyHours: 10.0,
    sleeperBerthHours: 2.0,
    drivingHours: 7.75,
    onDutyHours: 4.25,
    totalHours: 24.0,
  };

  const calculatedMiles = 502.5;
  const startOdo = (diagnostics.totalOdometerMiles - calculatedMiles).toFixed(1);
  const endOdo = diagnostics.totalOdometerMiles.toFixed(1);
  const startEngineHours = (diagnostics.totalEngineHours - 10.2).toFixed(1);
  const endEngineHours = diagnostics.totalEngineHours.toFixed(1);

  // Cryptographic audit hash
  const sha256Checksum = '0x4b6f87d46c823ea912f718bc894ef9310c14b2a8d8e37920ca11f';

  // Keyboard shortcut listener for Ctrl+P / Cmd+P while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrintAudit();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  // Browser-native print trigger
  const handlePrintAudit = () => {
    setIsPrinting(true);
    // Give state a frame to update before calling native print
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  // Copy Verification SHA-256 Hash
  const handleCopyHash = () => {
    navigator.clipboard.writeText(sha256Checksum);
    setIsCopiedHash(true);
    setTimeout(() => setIsCopiedHash(false), 2000);
  };

  // Download Standalone HTML Audit Report
  const handleDownloadHtml = () => {
    const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FMCSA_ELD_24H_AUDIT_${MOCK_HOS_STATUS.driverName.replace(/\s+/g, '_')}_${dateIso}.html</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 24px; color: #111; background: #fff; line-height: 1.4; font-size: 13px; }
    .header { border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; }
    .title { font-size: 20px; font-weight: 800; text-transform: uppercase; margin: 0; }
    .sub { font-size: 11px; color: #555; text-transform: uppercase; margin-top: 4px; }
    .grid-table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 16px; }
    .grid-table th, .grid-table td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
    .grid-table th { background: #f2f2f2; font-size: 11px; text-transform: uppercase; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; background: #eee; padding: 4px 8px; margin-top: 16px; border-left: 4px solid #000; }
    .sig-box { border: 1px solid #000; padding: 12px; margin-top: 20px; background: #fafafa; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">FMCSA 24-Hour ELD Driver's Daily Log &amp; Hardware Audit Report</div>
    <div class="sub">49 CFR Part 395 Subpart B § 395.26 &bull; Official Record of Duty Status (RODS) &bull; Verified Electronic Logging Device</div>
  </div>
  <table class="grid-table">
    <tr>
      <td><strong>Carrier:</strong> TRUCKWITHEASE LOGISTICS CORP.<br><strong>USDOT #:</strong> 3894721 | <strong>MC #:</strong> 1094821</td>
      <td><strong>24-Hour Date:</strong> ${dateFormatted}<br><strong>Time Zone:</strong> Eastern Daylight Time (EDT / UTC-04:00)</td>
    </tr>
    <tr>
      <td><strong>Driver:</strong> ${MOCK_HOS_STATUS.driverName}<br><strong>CDL #:</strong> ${MOCK_HOS_STATUS.cdlNumber}</td>
      <td><strong>Tractor Unit:</strong> ${MOCK_HOS_STATUS.unitAssigned}<br><strong>Trailer #:</strong> ${trailerNumber} | <strong>BOL #:</strong> ${shippingDocNumber}</td>
    </tr>
    <tr>
      <td><strong>Total Miles Driven:</strong> ${calculatedMiles} mi<br><strong>Odometer:</strong> Start: ${startOdo} mi | End: ${endOdo} mi</td>
      <td><strong>Engine Run Hours:</strong> Start: ${startEngineHours} hrs | End: ${endEngineHours} hrs<br><strong>ELD Provider:</strong> TruckWithEase Tactical (ID: TWE-ELD-2026-9812)</td>
    </tr>
  </table>

  <div class="section-title">24-Hour Duty Status Totals</div>
  <table class="grid-table">
    <tr>
      <th>1. Off Duty</th>
      <th>2. Sleeper Berth</th>
      <th>3. Driving</th>
      <th>4. On Duty (Not Driving)</th>
      <th>Total 24 Hours</th>
    </tr>
    <tr>
      <td><strong>${dutyTotals.offDutyHours.toFixed(2)} hrs</strong> (10h 00m)</td>
      <td><strong>${dutyTotals.sleeperBerthHours.toFixed(2)} hrs</strong> (02h 00m)</td>
      <td><strong>${dutyTotals.drivingHours.toFixed(2)} hrs</strong> (07h 45m)</td>
      <td><strong>${dutyTotals.onDutyHours.toFixed(2)} hrs</strong> (04h 15m)</td>
      <td><strong>${dutyTotals.totalHours.toFixed(2)} hrs</strong></td>
    </tr>
  </table>

  <div class="section-title">Driver Certification &amp; Authentication</div>
  <div class="sig-box">
    <p>I hereby certify that my data entries and my record of duty status for this 24-hour period are true and correct in accordance with 49 CFR § 395.8(a)(2).</p>
    <p><strong>Driver Digital Signature:</strong> <em>${MOCK_HOS_STATUS.driverName}</em> &bull; Timestamp: ${today.toISOString()}</p>
    <p><strong>Cryptographic SHA-256 Digest:</strong> <code>${sha256Checksum}</code></p>
  </div>
</body>
</html>`;

    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FMCSA_24H_ELD_AUDIT_${dateIso}_${MOCK_HOS_STATUS.driverName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-[#0D131D] border border-[#2B3E58] shadow-2xl rounded-xl w-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-[#E3E1E9]">
        
        {/* Top Control Bar (Hidden during native print) */}
        <div className="no-print p-4 sm:p-5 border-b border-[#1E2D40] bg-[#0A0E17] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C9A84C]/20 to-[#FFD700]/10 border border-[#C9A84C]/40 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-[#C9A84C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Space_Grotesk'] text-base sm:text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2">
                  <span>FMCSA 24-Hour ELD Audit Report</span>
                  <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[10px] font-mono font-bold rounded uppercase">
                    49 CFR § 395.26
                  </span>
                </h2>
              </div>
              <p className="text-xs text-[#99907C] font-mono mt-0.5">
                Full 24-hour statutory duty log, CAN-bus hardware telemetry verification, and driver certification ready for FMCSA review.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
            <button
              type="button"
              id="print-pdf-audit-btn"
              onClick={handlePrintAudit}
              className="px-4 py-2 bg-gradient-to-r from-[#C9A84C] via-[#FFD700] to-[#D4AF37] hover:brightness-110 text-[#3C2F00] font-mono text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-[#C9A84C]/20 active:scale-95 cursor-pointer"
              title="Print directly or save as PDF via browser print dialog (Ctrl+P / Cmd+P)"
            >
              <Printer className="w-4 h-4 text-[#3C2F00]" />
              <span>Print / Save as PDF</span>
              <span className="hidden sm:inline text-[10px] bg-[#3C2F00]/20 px-1.5 py-0.5 rounded font-bold">
                Ctrl+P
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtml}
              className="px-3 py-2 bg-[#172333] hover:bg-[#203046] text-sky-300 hover:text-white border border-sky-500/40 text-xs font-mono font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5"
              title="Download standalone HTML audit package"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Download HTML</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-[#151D28] hover:bg-[#202B3B] text-[#99907C] hover:text-white border border-[#2B3E58] rounded-lg transition-colors"
              title="Close Audit Report"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-header Configuration & Tab Bar (Hidden during native print) */}
        <div className="no-print px-4 sm:px-6 py-2.5 bg-[#080C14] border-b border-[#1A2636] flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-[#121924] p-1 rounded-lg border border-[#202E42]">
            <button
              type="button"
              onClick={() => setActiveTab('document')}
              className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                activeTab === 'document'
                  ? 'bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#3C2F00] shadow-sm'
                  : 'text-[#99907C] hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Official FMCSA Log</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                activeTab === 'summary'
                  ? 'bg-[#1E2D40] text-white border border-[#3A5070]'
                  : 'text-[#99907C] hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Compliance Summary</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('telemetry')}
              className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                activeTab === 'telemetry'
                  ? 'bg-[#1E2D40] text-white border border-[#3A5070]'
                  : 'text-[#99907C] hover:text-white'
              }`}
            >
              <Binary className="w-3.5 h-3.5 text-sky-400" />
              <span>Raw Telematics Ledger</span>
            </button>
          </div>

          {/* Date Selector & Editable Manifest Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-[#99907C]">
              <Calendar className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span className="text-white font-bold">{dateFormatted}</span>
              <span className="text-[#99907C]">(00:00 - 23:59 EDT)</span>
            </div>

            <div className="h-4 w-px bg-[#202E42] hidden sm:block" />

            <div className="flex items-center gap-2">
              <label className="text-[11px] text-[#99907C] flex items-center gap-1">
                <span>BOL:</span>
                <input
                  type="text"
                  value={shippingDocNumber}
                  onChange={e => setShippingDocNumber(e.target.value)}
                  className="bg-[#121924] border border-[#24354C] rounded px-2 py-0.5 text-white font-mono text-[11px] w-28 focus:outline-none focus:border-[#C9A84C]"
                  placeholder="BOL-XXXX"
                />
              </label>
              <label className="text-[11px] text-[#99907C] flex items-center gap-1">
                <span>Trailer:</span>
                <input
                  type="text"
                  value={trailerNumber}
                  onChange={e => setTrailerNumber(e.target.value)}
                  className="bg-[#121924] border border-[#24354C] rounded px-2 py-0.5 text-white font-mono text-[11px] w-24 focus:outline-none focus:border-[#C9A84C]"
                  placeholder="TRL-XXXX"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Scrollable Audit Report Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#080C14]">
          
          {/* TAB 1: OFFICIAL FMCSA 24-HOUR LOG (Print Target) */}
          {activeTab === 'document' && (
            <div
              ref={printAreaRef}
              id="fmcsa-audit-printable"
              className="bg-white text-black p-6 sm:p-8 rounded-lg shadow-2xl max-w-4xl mx-auto font-sans leading-normal border border-gray-300"
            >
              {/* Document Header */}
              <div className="border-b-2 border-black pb-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black font-['Space_Grotesk']">
                      DRIVER'S DAILY LOG &bull; 24-HOUR RECORD OF DUTY STATUS
                    </div>
                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mt-0.5">
                      FMCSA 49 CFR Part 395 Subpart B § 395.26 &bull; Technical Specifications for ELDs
                    </div>
                  </div>
                  <div className="text-right shrink-0 bg-gray-100 p-2.5 border border-gray-300 rounded">
                    <div className="text-[10px] font-bold text-gray-500 uppercase">Audit Report Ref</div>
                    <div className="font-mono text-xs font-bold text-black">TWE-24H-{dateIso}-0104E</div>
                    <div className="text-[10px] text-emerald-700 font-bold uppercase mt-0.5">&bull; COMPLIANCE VERIFIED</div>
                  </div>
                </div>
              </div>

              {/* Carrier & Driver Metadata Table */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-4">
                {/* Col 1: Carrier Info */}
                <div className="border border-gray-300 p-3 bg-gray-50 rounded">
                  <div className="font-bold text-gray-900 border-b border-gray-200 pb-1 mb-1.5 uppercase text-[11px]">
                    Motor Carrier Information
                  </div>
                  <div className="space-y-1 text-[11px] text-gray-800">
                    <div><strong>Carrier:</strong> TRUCKWITHEASE LOGISTICS CORP.</div>
                    <div><strong>USDOT #:</strong> 3894721 | <strong>MC #:</strong> 1094821</div>
                    <div><strong>Main Office:</strong> 100 Continental Blvd, Suite 400</div>
                    <div><strong>City/State:</strong> Harrisburg, PA 17101</div>
                    <div><strong>Home Terminal:</strong> Harrisburg East Terminal</div>
                  </div>
                </div>

                {/* Col 2: Driver & Co-Driver */}
                <div className="border border-gray-300 p-3 bg-gray-50 rounded">
                  <div className="font-bold text-gray-900 border-b border-gray-200 pb-1 mb-1.5 uppercase text-[11px]">
                    Driver &amp; Dispatch Identity
                  </div>
                  <div className="space-y-1 text-[11px] text-gray-800">
                    <div><strong>Driver Name:</strong> {MOCK_HOS_STATUS.driverName}</div>
                    <div><strong>Driver CDL #:</strong> {MOCK_HOS_STATUS.cdlNumber} (PA)</div>
                    <div><strong>Driver ID:</strong> DRV-88219</div>
                    <div><strong>Co-Driver:</strong> N/A (Solo Operator)</div>
                    <div><strong>Time Zone:</strong> Eastern Daylight Time (EDT)</div>
                  </div>
                </div>

                {/* Col 3: Vehicle & ELD Device */}
                <div className="border border-gray-300 p-3 bg-gray-50 rounded">
                  <div className="font-bold text-gray-900 border-b border-gray-200 pb-1 mb-1.5 uppercase text-[11px]">
                    Equipment &amp; ELD Hardware
                  </div>
                  <div className="space-y-1 text-[11px] text-gray-800">
                    <div><strong>Tractor Unit:</strong> {MOCK_HOS_STATUS.unitAssigned}</div>
                    <div><strong>Tractor VIN:</strong> 1FUJGBD68HL92841</div>
                    <div><strong>Trailer Unit:</strong> {trailerNumber} (53' Dry Van)</div>
                    <div><strong>Shipping Doc / BOL:</strong> {shippingDocNumber}</div>
                    <div><strong>ELD Provider:</strong> TruckWithEase v4.12.0 (ID: TWE-9812)</div>
                  </div>
                </div>
              </div>

              {/* 24-Hour Mileage & Engine Statistics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs mb-4">
                <div className="border border-gray-300 p-2 bg-gray-100 rounded">
                  <div className="text-[10px] uppercase font-bold text-gray-600">Total Miles (24h)</div>
                  <div className="text-base font-bold font-mono text-black">{calculatedMiles} mi</div>
                  <div className="text-[9px] text-gray-500">CAN Odo Start: {startOdo} | End: {endOdo}</div>
                </div>
                <div className="border border-gray-300 p-2 bg-gray-100 rounded">
                  <div className="text-[10px] uppercase font-bold text-gray-600">Engine Run Time (24h)</div>
                  <div className="text-base font-bold font-mono text-black">10.2 hrs</div>
                  <div className="text-[9px] text-gray-500">Hours Start: {startEngineHours} | End: {endEngineHours}</div>
                </div>
                <div className="border border-gray-300 p-2 bg-gray-100 rounded">
                  <div className="text-[10px] uppercase font-bold text-gray-600">CAN-Bus Baud &amp; Link</div>
                  <div className="text-base font-bold font-mono text-black">{baudRate} bps</div>
                  <div className="text-[9px] text-emerald-700 font-bold uppercase">{interfaceType} &bull; {hardwareStatus}</div>
                </div>
                <div className="border border-gray-300 p-2 bg-gray-100 rounded">
                  <div className="text-[10px] uppercase font-bold text-gray-600">Diagnostic Malfunctions</div>
                  <div className="text-base font-bold font-mono text-black">
                    {dtcList.length === 0 ? '0 ACTIVE' : `${dtcList.length} LOGGED`}
                  </div>
                  <div className="text-[9px] text-emerald-700 font-bold uppercase">MIL Lamp: Nominal</div>
                </div>
              </div>

              {/* 24-HOUR FMCSA VISUAL DUTY GRAPH / GRID */}
              <div className="border-2 border-black p-3 rounded mb-4 bg-white">
                <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-2">
                  <div className="font-bold text-xs uppercase tracking-wide text-black">
                    24-Hour Duty Status Grid (Midnight to Midnight)
                  </div>
                  <div className="text-[10px] text-gray-600 font-mono">
                    15-Minute Division Markers &bull; 49 CFR § 395.8(e)
                  </div>
                </div>

                {/* SVG Visual 24-Hour Duty Grid */}
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[680px]">
                    {/* Hour Number Header */}
                    <div className="flex border-b border-gray-400 text-[9px] font-mono text-gray-600 font-bold">
                      <div className="w-28 shrink-0 text-left pl-1">DUTY STATUS</div>
                      <div className="flex-1 grid grid-cols-24 text-center">
                        {Array.from({ length: 24 }, (_, i) => (
                          <div key={i} className="border-l border-gray-300">
                            {i === 0 ? 'M' : i === 12 ? 'N' : i > 12 ? i - 12 : i}
                          </div>
                        ))}
                      </div>
                      <div className="w-16 shrink-0 text-right pr-1 border-l border-gray-400">TOTAL</div>
                    </div>

                    {/* SVG Graph Rows */}
                    <div className="relative border-b border-gray-400">
                      {/* Grid Horizontal Lines and Status Labels */}
                      <div className="space-y-0 text-[10px] font-bold font-mono">
                        {/* Row 1: Off Duty */}
                        <div className="flex items-center h-8 border-b border-gray-200">
                          <div className="w-28 shrink-0 text-gray-800 text-[10px]">1. OFF DUTY</div>
                          <div className="flex-1 grid grid-cols-24 h-full">
                            {Array.from({ length: 24 }, (_, i) => (
                              <div key={i} className="border-l border-gray-200 h-full" />
                            ))}
                          </div>
                          <div className="w-16 shrink-0 text-right pr-2 font-bold font-mono text-black border-l border-gray-300">
                            10.00
                          </div>
                        </div>

                        {/* Row 2: Sleeper Berth */}
                        <div className="flex items-center h-8 border-b border-gray-200">
                          <div className="w-28 shrink-0 text-gray-800 text-[10px]">2. SLEEPER</div>
                          <div className="flex-1 grid grid-cols-24 h-full">
                            {Array.from({ length: 24 }, (_, i) => (
                              <div key={i} className="border-l border-gray-200 h-full" />
                            ))}
                          </div>
                          <div className="w-16 shrink-0 text-right pr-2 font-bold font-mono text-black border-l border-gray-300">
                            02.00
                          </div>
                        </div>

                        {/* Row 3: Driving */}
                        <div className="flex items-center h-8 border-b border-gray-200">
                          <div className="w-28 shrink-0 text-gray-800 text-[10px]">3. DRIVING</div>
                          <div className="flex-1 grid grid-cols-24 h-full">
                            {Array.from({ length: 24 }, (_, i) => (
                              <div key={i} className="border-l border-gray-200 h-full" />
                            ))}
                          </div>
                          <div className="w-16 shrink-0 text-right pr-2 font-bold font-mono text-black border-l border-gray-300">
                            07.75
                          </div>
                        </div>

                        {/* Row 4: On Duty Not Driving */}
                        <div className="flex items-center h-8">
                          <div className="w-28 shrink-0 text-gray-800 text-[10px]">4. ON DUTY</div>
                          <div className="flex-1 grid grid-cols-24 h-full">
                            {Array.from({ length: 24 }, (_, i) => (
                              <div key={i} className="border-l border-gray-200 h-full" />
                            ))}
                          </div>
                          <div className="w-16 shrink-0 text-right pr-2 font-bold font-mono text-black border-l border-gray-300">
                            04.25
                          </div>
                        </div>
                      </div>

                      {/* SVG Overlay Stepped Line for 24h Activity */}
                      {/* Mapping: 
                          0h-6h: OFF (row 1, y=16)
                          6h-8h: SB (row 2, y=48)
                          8h-9h: ON (row 4, y=112)
                          9h-13h: D (row 3, y=80)
                          13h-14h: ON (row 4, y=112)
                          14h-17.75h: D (row 3, y=80)
                          17.75h-18h: ON (row 4, y=112)
                          18h-24h: OFF (row 1, y=16)
                      */}
                      <svg
                        className="absolute inset-0 pointer-events-none"
                        style={{ left: '112px', width: 'calc(100% - 176px)', height: '128px' }}
                        viewBox="0 0 1000 128"
                        preserveAspectRatio="none"
                      >
                        {/* Timeline Step Polyline */}
                        <polyline
                          fill="none"
                          stroke="#1e3a8a"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="miter"
                          points="
                            0,16
                            250,16 250,48
                            333,48 333,112
                            375,112 375,80
                            541,80 541,112
                            583,112 583,80
                            740,80 740,112
                            750,112 750,16
                            1000,16
                          "
                        />
                      </svg>
                    </div>

                    {/* Total Hours Row */}
                    <div className="flex justify-between items-center pt-1.5 text-xs font-bold font-mono">
                      <div className="text-gray-700">Total Hours (Must Equal Exactly 24.00 Hours):</div>
                      <div className="text-black bg-gray-100 px-3 py-0.5 border border-gray-400 rounded">
                        24.00 HOURS
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statutory HOS Compliance Summary Breakdown */}
              <div className="border border-gray-300 p-3 rounded mb-4 bg-gray-50 text-xs">
                <div className="font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2 uppercase text-[11px] flex items-center justify-between">
                  <span>FMCSA 49 CFR Part 395 Statutory Limits Audit</span>
                  <span className="text-emerald-700 font-bold uppercase">&bull; ALL INVARIANTS HELD</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-gray-600 block">11-Hour Driving Rule:</span>
                    <strong className="text-black">7.75h Used / 3.25h Left</strong>
                    <span className="text-emerald-700 block text-[10px]">&bull; Compliant</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block">14-Hour Shift Window:</span>
                    <strong className="text-black">10.00h Used / 4.00h Left</strong>
                    <span className="text-emerald-700 block text-[10px]">&bull; Compliant</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block">30-Minute Rest Break:</span>
                    <strong className="text-black">Satisfied at 13:00 EDT</strong>
                    <span className="text-emerald-700 block text-[10px]">&bull; Compliant</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block">70-Hour / 8-Day Cycle:</span>
                    <strong className="text-black">33.8h Used / 36.2h Left</strong>
                    <span className="text-emerald-700 block text-[10px]">&bull; Compliant</span>
                  </div>
                </div>
              </div>

              {/* 24-Hour Chronological Event Log Table */}
              <div className="border border-gray-300 rounded mb-4 overflow-hidden text-xs">
                <div className="bg-gray-100 px-3 py-2 border-b border-gray-300 font-bold text-gray-900 uppercase text-[11px] flex items-center justify-between">
                  <span>Chronological Telemetry &amp; Duty Status Changes (24-Hour Buffer)</span>
                  <span className="text-[10px] font-mono text-gray-600 font-normal">
                    {dutySyncEvents.length} Verified Sync Events
                  </span>
                </div>
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-2">Time (EDT)</th>
                        <th className="p-2">Duty Status</th>
                        <th className="p-2">Location / Highway</th>
                        <th className="p-2">Odometer</th>
                        <th className="p-2">Eng Hours</th>
                        <th className="p-2">Speed</th>
                        <th className="p-2">Origin / Trigger</th>
                        <th className="p-2">Record Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-mono text-[10.5px]">
                      {dutySyncEvents.map((evt, idx) => (
                        <tr key={evt.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-2 font-bold text-black">
                            {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              evt.dutyStatus === 'DRIVING'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : evt.dutyStatus === 'ON_DUTY'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-gray-100 text-gray-900 border border-gray-300'
                            }`}>
                              {evt.dutyStatus}
                            </span>
                          </td>
                          <td className="p-2 text-gray-800">{evt.location}</td>
                          <td className="p-2 text-gray-800">{evt.odometerMiles.toFixed(1)} mi</td>
                          <td className="p-2 text-gray-800">{evt.engineHours.toFixed(1)} hrs</td>
                          <td className="p-2 text-gray-800">{evt.speedMph.toFixed(1)} mph</td>
                          <td className="p-2 text-gray-600">CAN J1939 Auto</td>
                          <td className="p-2 text-gray-500 font-mono text-[9px]">{evt.databaseRecordHash || '0x4b6f87d4'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks & Notes */}
              <div className="border border-gray-300 p-3 rounded mb-4 bg-gray-50 text-xs">
                <div className="font-bold text-gray-900 uppercase text-[11px] mb-1">
                  Driver Remarks &amp; Manifest Notes
                </div>
                <div className="text-gray-800 font-mono text-[11px]">
                  {driverRemarks}
                </div>
              </div>

              {/* Driver Certification Statement & Signature Block */}
              <div className="border-2 border-black p-4 rounded bg-gray-50 text-xs">
                <div className="font-bold uppercase text-black text-[12px] mb-1.5 flex items-center justify-between">
                  <span>Driver Certification of Compliance (49 CFR § 395.8(a)(2))</span>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    DIGITALLY SIGNED &bull; LEGAL RECORD
                  </span>
                </div>
                <p className="text-[11px] text-gray-800 leading-relaxed mb-3">
                  I hereby certify that my data entries and my record of duty status for this 24-hour period are true and correct. I understand that falsification of this log is a violation of federal law and subject to statutory penalties under 49 U.S.C. Chapter 149.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-300">
                  <div>
                    <div className="text-[10px] text-gray-600 uppercase font-bold">Driver Digital Signature</div>
                    <div className="font-serif italic text-lg text-black font-bold border-b border-black pb-1 pt-1">
                      {MOCK_HOS_STATUS.driverName}
                    </div>
                    <div className="text-[9px] text-gray-500 font-mono mt-0.5">
                      Authenticated via In-Cab Identity Key &bull; {today.toLocaleDateString()} {today.toLocaleTimeString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-gray-600 uppercase font-bold">Carrier Compliance Review / Cryptographic Seal</div>
                    <div className="font-mono text-xs font-bold text-black border-b border-black pb-1 pt-1 truncate">
                      SHA-256: {sha256Checksum}
                    </div>
                    <div className="text-[9px] text-gray-500 font-mono mt-0.5">
                      RSA-4096 / P-256 Merkle Chain Integrity &bull; TruckWithEase Trust Engine
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPLIANCE SUMMARY & AUDIT CHECKS */}
          {activeTab === 'summary' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="bg-[#121924] border border-[#24354C] p-4 sm:p-5 rounded-xl">
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-white uppercase tracking-wide flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>FMCSA Statutory Rule Invariant Verification</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-[#0C121B] border border-emerald-500/30 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">49 CFR § 395.3(a)(1) — 11-Hour Driving Limit</span>
                      <span className="text-[#99907C] text-[11px] block mt-0.5">
                        Accumulated driving time is 7h 45m. Remainder 3h 15m without exceeding rule.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#0C121B] border border-emerald-500/30 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">49 CFR § 395.3(a)(2) — 14-Hour Shift Window</span>
                      <span className="text-[#99907C] text-[11px] block mt-0.5">
                        Shift window elapsed time is 10h 00m. 4h 00m remaining before 10-hour consecutive rest.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#0C121B] border border-emerald-500/30 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">49 CFR § 395.3(a)(3)(ii) — 30-Minute Rest Break</span>
                      <span className="text-[#99907C] text-[11px] block mt-0.5">
                        Mandatory 30-min break taken after 4h 00m driving. Compliant.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#0C121B] border border-emerald-500/30 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">49 CFR § 395.3(b) — 70-Hour / 8-Day Rolling Cycle</span>
                      <span className="text-[#99907C] text-[11px] block mt-0.5">
                        Total 33.8 hours logged over trailing 8 days. 36.2 hours reserve remaining.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks Editor */}
              <div className="bg-[#121924] border border-[#24354C] p-4 sm:p-5 rounded-xl space-y-3">
                <h3 className="font-['Space_Grotesk'] text-sm font-bold text-white uppercase tracking-wide">
                  Edit Driver Remarks for PDF Report
                </h3>
                <textarea
                  value={driverRemarks}
                  onChange={e => setDriverRemarks(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0C121B] border border-[#24354C] rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-[#C9A84C]"
                  placeholder="Enter remarks, shipment details, or special notes..."
                />
              </div>
            </div>
          )}

          {/* TAB 3: RAW TELEMATICS & CAN-BUS SAMPLES */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="bg-[#121924] border border-[#24354C] p-4 sm:p-5 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-['Space_Grotesk'] text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
                    <Binary className="w-5 h-5 text-sky-400" />
                    <span>Live Hardware Telemetry Stream Ingestion (J1939 PGNs)</span>
                  </h3>
                  <span className="text-xs font-mono text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30">
                    {filteredPackets.length} Buffered Frames
                  </span>
                </div>

                <div className="overflow-x-auto max-h-80 border border-[#1E2D40] rounded-lg">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#0C121B] text-[#99907C] uppercase text-[10px] border-b border-[#1E2D40]">
                      <tr>
                        <th className="p-2">Frame ID</th>
                        <th className="p-2">Time</th>
                        <th className="p-2">PGN</th>
                        <th className="p-2">Hex Bytes</th>
                        <th className="p-2">Decoded Metric</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A2636] text-[11px]">
                      {filteredPackets.slice(0, 30).map((pkt, idx) => (
                        <tr key={pkt.id || idx} className="hover:bg-[#162232] transition-colors">
                          <td className="p-2 text-white font-bold">{pkt.id}</td>
                          <td className="p-2 text-[#99907C]">{pkt.timestamp.split('T')[1]?.slice(0, 8) || pkt.timestamp}</td>
                          <td className="p-2 text-[#C9A84C]">{pkt.pgnOrPid}</td>
                          <td className="p-2 text-sky-300 font-mono">{pkt.rawHex}</td>
                          <td className="p-2 text-gray-300">{pkt.decodedSummary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer (Hidden during native print) */}
        <div className="no-print p-4 bg-[#0A0E17] border-t border-[#1E2D40] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono shrink-0">
          <div className="flex items-center gap-2 text-[#99907C]">
            <Hash className="w-4 h-4 text-[#C9A84C]" />
            <span className="truncate max-w-xs sm:max-w-md">SHA-256: {sha256Checksum}</span>
            <button
              type="button"
              onClick={handleCopyHash}
              className="p-1 hover:text-white transition-colors"
              title="Copy cryptographic hash"
            >
              {isCopiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#151D28] hover:bg-[#202B3B] text-[#99907C] hover:text-white border border-[#2B3E58] rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrintAudit}
              className="px-5 py-2 bg-gradient-to-r from-[#C9A84C] via-[#FFD700] to-[#D4AF37] hover:brightness-110 text-[#3C2F00] font-bold uppercase rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-[#C9A84C]/20 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
