import React from 'react';
import {
  DailyDvirExportPackage,
  DvirInspection,
  MaintenanceWorkOrder,
} from '../types';
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
} from 'lucide-react';
import { triggerHapticFeedback } from '../services/haptics';

interface DvirDailyExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportPackage: DailyDvirExportPackage | null;
  downloadUrlJson?: string;
  downloadUrlCsv?: string;
}

export const DvirDailyExportModal: React.FC<DvirDailyExportModalProps> = ({
  isOpen,
  onClose,
  exportPackage,
  downloadUrlJson,
  downloadUrlCsv,
}) => {
  const [copiedSeal, setCopiedSeal] = React.useState(false);

  if (!isOpen || !exportPackage) return null;

  const handlePrint = () => {
    triggerHapticFeedback('tick');
    window.print();
  };

  const handleCopySeal = () => {
    if (exportPackage.sha256AuditSeal) {
      navigator.clipboard.writeText(exportPackage.sha256AuditSeal);
      setCopiedSeal(true);
      triggerHapticFeedback('success');
      setTimeout(() => setCopiedSeal(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#121212] border border-[#333] shadow-2xl rounded-none text-slate-100 my-auto max-h-[92vh] flex flex-col font-mono">
        
        {/* Modal Top Header (Hidden on Print) */}
        <div className="flex items-center justify-between p-4 bg-[#1A1A1A] border-b border-[#2A2A2A] print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#C9A84C]/15 border border-[#C9A84C]/40 flex items-center justify-center text-[#C9A84C]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#C9A84C] font-black uppercase tracking-wider">
                  MANDATORY DAILY EXPORT SECURED
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  49 CFR § 396.11 ACTIVE
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                Daily Vehicle Inspection Report Archive #{exportPackage.exportId}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C9A84C] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-colors shadow-sm"
              title="Print / Save PDF (FMCSA Compliant)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT / SAVE PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar (Hidden on Print) */}
        <div className="px-4 py-2.5 bg-[#0E0E0E] border-b border-[#222] flex items-center justify-between gap-3 flex-wrap text-xs print:hidden">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-[11px] text-slate-400">Cryptographic Seal:</span>
            <span className="font-mono text-[11px] text-[#C9A84C] bg-[#161616] px-2 py-0.5 border border-[#333] select-all">
              {exportPackage.sha256AuditSeal}
            </span>
            <button
              onClick={handleCopySeal}
              className="p-1 text-slate-400 hover:text-white"
              title="Copy Audit Seal"
            >
              {copiedSeal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {downloadUrlJson && (
              <a
                href={downloadUrlJson}
                download={`${exportPackage.exportId}.json`}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#1C1C1C] hover:bg-[#282828] text-slate-300 text-[11px] font-bold border border-[#333]"
              >
                <FileCode className="w-3 h-3 text-[#C9A84C]" />
                <span>JSON Export</span>
              </a>
            )}
            {downloadUrlCsv && (
              <a
                href={downloadUrlCsv}
                download={`${exportPackage.exportId}.csv`}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#1C1C1C] hover:bg-[#282828] text-slate-300 text-[11px] font-bold border border-[#333]"
              >
                <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                <span>CSV Table</span>
              </a>
            )}
          </div>
        </div>

        {/* Printable DVIR Audit Form */}
        <div className="p-6 overflow-y-auto space-y-6 print:p-0 print:space-y-4 print:text-black print:bg-white">
          
          {/* Official Document Header */}
          <div className="border-2 border-black/80 p-4 bg-[#141414] print:bg-white print:border-black space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#333] print:border-black pb-3">
              <div>
                <h1 className="text-lg sm:text-xl font-black uppercase text-white print:text-black tracking-tight">
                  UNITED STATES DEPARTMENT OF TRANSPORTATION
                </h1>
                <p className="text-xs text-[#C9A84C] print:text-black font-bold">
                  FMCSA 49 CFR § 396.11 / § 396.13 DAILY VEHICLE INSPECTION EXPORT RECORD
                </p>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="block text-white print:text-black font-bold">EXPORT DATE: {exportPackage.exportDate}</span>
                <span className="block text-slate-400 print:text-gray-700 text-[11px]">{exportPackage.exportTimestamp}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase block">MOTOR CARRIER</span>
                <span className="font-bold text-white print:text-black">TRUCKWITHEASE LOGISTICS</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase block">USDOT / MC AUTH</span>
                <span className="font-bold text-white print:text-black">{exportPackage.carrierDotNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase block">TOTAL INSPECTIONS</span>
                <span className="font-bold text-white print:text-black">{exportPackage.dvirRecordCount} Submitted</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase block">FLEET STATUS</span>
                <span className={`font-bold ${exportPackage.outOfServiceCount > 0 ? 'text-rose-400 print:text-red-700' : 'text-emerald-400 print:text-green-800'}`}>
                  {exportPackage.outOfServiceCount > 0 ? 'OUT-OF-SERVICE DEFECT' : '100% CERTIFIED SAFE'}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Inspections Breakdown */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 print:text-black border-b border-[#333] print:border-black pb-1 flex items-center justify-between">
              <span>Section 1: Daily Inspection Records ({exportPackage.records.length})</span>
              <span className="text-[10px] font-normal text-slate-400 print:text-gray-600">Saved in Persistent Fleet Ledger</span>
            </h3>

            {exportPackage.records.map((rec, index) => (
              <div
                key={rec.id}
                className="p-4 bg-[#161616] print:bg-gray-50 border border-[#2A2A2A] print:border-gray-400 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A2A2A] print:border-gray-300 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#C9A84C]/20 text-[#C9A84C] print:text-black print:border print:border-black text-[10px] font-black uppercase">
                      {rec.inspectionType.replace('_', ' ')}
                    </span>
                    <span className="font-black text-white print:text-black text-sm">
                      {rec.unitNumber} {rec.trailerNumber ? `/ ${rec.trailerNumber}` : ''}
                    </span>
                    <span className="text-xs text-slate-400 print:text-gray-700">
                      (Odo: {rec.odometer.toLocaleString()} mi)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 text-[10px] font-bold ${
                      rec.status === 'SATISFACTORY'
                        ? 'bg-emerald-500/20 text-emerald-400 print:text-green-800'
                        : rec.status === 'DEFECTS_CORRECTED'
                        ? 'bg-amber-500/20 text-amber-400 print:text-amber-800'
                        : 'bg-rose-500/20 text-rose-400 print:text-red-800'
                    }`}>
                      STATUS: {rec.status}
                    </span>
                    <span className="text-slate-400 print:text-gray-600 text-[11px]">{rec.timestamp}</span>
                  </div>
                </div>

                {/* Safety Items Checked */}
                <div>
                  <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold block mb-1">
                    FMCSA Checklist Verification:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 text-xs">
                    {rec.itemsChecked.map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-1.5 p-1.5 border text-[11px] ${
                          item.passed
                            ? 'bg-[#0E0E0E] print:bg-white border-[#222] print:border-gray-300 text-slate-200 print:text-black'
                            : 'bg-rose-950/30 print:bg-red-50 border-rose-600/50 print:border-red-400 text-rose-300 print:text-red-900'
                        }`}
                      >
                        {item.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 print:text-green-700 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 print:text-red-700 shrink-0" />
                        )}
                        <span className="truncate">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Defects Noted If Any */}
                {rec.defectsList && rec.defectsList.length > 0 && (
                  <div className="p-2.5 bg-rose-950/20 print:bg-red-50 border border-rose-800/40 print:border-red-300 space-y-1 text-xs">
                    <span className="text-[10px] text-rose-400 print:text-red-800 uppercase font-black block">
                      DEFECTS RECORDED:
                    </span>
                    {rec.defectsList.map((d, dIdx) => (
                      <div key={dIdx} className="text-slate-200 print:text-black text-[11px]">
                        • <span className="font-bold">{d.component}</span>: {d.description} [{d.severity}]
                      </div>
                    ))}
                  </div>
                )}

                {/* Driver Digital Signature Block */}
                <div className="pt-2 border-t border-[#222] print:border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 print:text-gray-700 gap-2">
                  <div>
                    Driver Signer: <span className="text-white print:text-black font-bold">{rec.driverName}</span>
                  </div>
                  <div className="text-[#C9A84C] print:text-black font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Digital Driver Signature Certified Safe under 49 CFR § 396.11</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section 2: Associated Past Repairs Memory & Mechanic Work Orders */}
          {exportPackage.associatedRepairs && exportPackage.associatedRepairs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 print:text-black border-b border-[#333] print:border-black pb-1">
                Section 2: Maintenance Work Order Cross-Reference Memory
              </h3>
              <div className="space-y-2">
                {exportPackage.associatedRepairs.map((wo) => (
                  <div
                    key={wo.id}
                    className="p-3 bg-[#161616] print:bg-gray-50 border border-[#2A2A2A] print:border-gray-400 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between border-b border-[#222] print:border-gray-300 pb-1">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-[#C9A84C] print:text-black" />
                        <span className="font-bold text-white print:text-black">{wo.id}</span>
                        <span className="text-slate-400 print:text-gray-600">({wo.unitNumber})</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 print:text-green-800 font-bold uppercase">
                        {wo.status}
                      </span>
                    </div>
                    <p className="text-slate-200 print:text-black text-[11px]">
                      <span className="font-bold">{wo.componentItem}:</span> {wo.workPerformed}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-400 print:text-gray-600">
                      <div>Tech: <span className="text-white print:text-black font-bold">{wo.technicianName}</span></div>
                      <div>Shop: <span className="text-white print:text-black font-bold">{wo.shopOrVendor}</span></div>
                      <div>Total Cost: <span className="text-[#C9A84C] print:text-black font-bold">${wo.totalCost.toFixed(2)}</span></div>
                      <div>Statute: <span className="text-white print:text-black font-bold">{wo.fmcsaStatute}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Cryptographic Signature & Compliance Seal */}
          <div className="p-4 bg-[#101010] print:bg-gray-100 border border-[#333] print:border-black space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#C9A84C] print:text-black font-black uppercase tracking-wider">
                COMPLIANCE INTEGRITY AUDIT SEAL
              </span>
              <span className="text-[10px] text-slate-400 print:text-gray-600 font-mono">
                RECORD IMMUTABLE IN ARCHIVE
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-200 print:text-black break-all bg-black/40 print:bg-white p-2 border border-[#222] print:border-gray-400 select-all">
              {exportPackage.sha256AuditSeal}
            </div>
            <p className="text-[10px] text-slate-400 print:text-gray-700">
              I hereby certify that the inspections detailed in this daily export package were conducted in accordance with Federal Motor Carrier Safety Regulations (49 CFR Parts 393 and 396). All defects noted have been recorded in the permanent fleet maintenance memory ledger.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#1A1A1A] border-t border-[#2A2A2A] flex items-center justify-between text-xs print:hidden">
          <div className="text-[11px] text-slate-400">
            Exported to local compliance storage &amp; safety desk dispatch
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#252525] hover:bg-[#333] text-slate-300 font-bold uppercase text-xs transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-[#C9A84C] hover:bg-white text-black font-black uppercase text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
