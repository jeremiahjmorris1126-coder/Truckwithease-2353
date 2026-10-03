import React, { useState } from 'react';
import {
  Building2,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  FileText,
  Search,
  Plus,
  Mail,
  Phone,
  Check,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { driverDqfComplianceService } from '../services/driverDqfComplianceService';
import { PriorEmployerSafetyInquiry, DriverRecord } from '../types';
import { triggerHapticFeedback } from '../services/haptics';

interface PriorEmployerInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver?: DriverRecord | null;
}

export const PriorEmployerInquiryModal: React.FC<PriorEmployerInquiryModalProps> = ({
  isOpen,
  onClose,
  driver,
}) => {
  const [inquiries, setInquiries] = useState<PriorEmployerSafetyInquiry[]>(
    driverDqfComplianceService.getPriorEmployerInquiries()
  );
  const [isDispatchingNew, setIsDispatchingNew] = useState<boolean>(false);
  const [priorCompanyName, setPriorCompanyName] = useState<string>('');
  const [priorCompanyEmail, setPriorCompanyEmail] = useState<string>('');
  const [priorCompanyPhone, setPriorCompanyPhone] = useState<string>('');
  const [priorCompanyAddress, setPriorCompanyAddress] = useState<string>('');
  const [employmentDates, setEmploymentDates] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDispatchInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHapticFeedback('subtle');

    const created = driverDqfComplianceService.dispatchPriorInquiry({
      driverId: driver ? driver.id : 'drv-001',
      driverName: driver ? `${driver.firstName} ${driver.lastName}` : 'Marcus Bell',
      priorCompanyName,
      priorCompanyEmail,
      priorCompanyPhone,
      priorCompanyAddress,
      employmentDates,
      verifiedByMethod: 'DIGITAL_PORTAL',
    });

    setInquiries(driverDqfComplianceService.getPriorEmployerInquiries());
    setIsDispatchingNew(false);
    setPriorCompanyName('');
    setPriorCompanyEmail('');
    setPriorCompanyPhone('');
    setPriorCompanyAddress('');
    setEmploymentDates('');
    setSuccessToast(`Inquiry dispatched to ${created.priorCompanyName}! Tracking ID: ${created.trackingToken}`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="bg-[#0B0F19] border-2 border-sky-500/50 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#182334] bg-gradient-to-r from-[#0D1826] to-[#0B0F19] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-sky-500 text-black flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-black" />
                49 CFR § 391.23 SAFETY INQUIRIES
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#142234] text-sky-400 border border-sky-500/30">
                3-YEAR EMPLOYER PERFORMANCE TRACKER
              </span>
            </div>
            <h3 className="text-xl font-bold text-white uppercase tracking-tight font-[Oswald]">
              Previous Employer Safety &amp; Drug/Alcohol History Inquiries
            </h3>
            <p className="text-xs text-[#8EA2B8]">
              Automated 30-day compliance dispatcher satisfying FMCSA 49 CFR § 391.23(a)(2) &amp; (e)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-[#141C2A] hover:bg-[#1E2A3E] text-[#8EA2B8] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="bg-[#0A1E2C] border-b border-sky-500 p-2.5 px-4 text-xs font-bold text-sky-300 animate-fadeIn flex items-center gap-2">
            <Check className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs text-zinc-200">
          {/* Dispatch New Toggle / Form */}
          {!isDispatchingNew ? (
            <div className="flex items-center justify-between bg-[#080D15] p-3.5 rounded-xl border border-[#162334]">
              <div className="space-y-0.5">
                <span className="text-white font-bold block text-sm">Need to query another past employer?</span>
                <p className="text-[#8EA2B8] text-[11px]">
                  FMCSA requires inquiries sent to all DOT-regulated employers for the previous 36 months.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsDispatchingNew(true)}
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-black font-black text-xs uppercase rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>+ Dispatch New Inquiry</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleDispatchInquiry} className="p-4 rounded-xl bg-[#080D15] border border-sky-500/40 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#142030] pb-2">
                <span className="text-white font-bold uppercase text-xs flex items-center gap-1.5 text-sky-400">
                  <Send className="w-4 h-4" />
                  <span>Dispatch 3-Year Safety Inquiry</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsDispatchingNew(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#8EA2B8] uppercase font-bold mb-1">
                    Previous Motor Carrier Name *
                  </label>
                  <input
                    type="text"
                    value={priorCompanyName}
                    onChange={(e) => setPriorCompanyName(e.target.value)}
                    required
                    placeholder="e.g. Swift Transportation LLC"
                    className="w-full bg-[#0D1420] border border-[#23354C] rounded-lg p-2 text-white text-xs focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#8EA2B8] uppercase font-bold mb-1">
                    Dates of Employment *
                  </label>
                  <input
                    type="text"
                    value={employmentDates}
                    onChange={(e) => setEmploymentDates(e.target.value)}
                    required
                    placeholder="e.g. 05/2021 - 04/2024"
                    className="w-full bg-[#0D1420] border border-[#23354C] rounded-lg p-2 text-white text-xs focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#8EA2B8] uppercase font-bold mb-1">
                    Safety Department Email *
                  </label>
                  <input
                    type="email"
                    value={priorCompanyEmail}
                    onChange={(e) => setPriorCompanyEmail(e.target.value)}
                    required
                    placeholder="safety.verification@carrier.com"
                    className="w-full bg-[#0D1420] border border-[#23354C] rounded-lg p-2 text-white text-xs focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#8EA2B8] uppercase font-bold mb-1">
                    Phone / Fax Number
                  </label>
                  <input
                    type="text"
                    value={priorCompanyPhone}
                    onChange={(e) => setPriorCompanyPhone(e.target.value)}
                    placeholder="1-800-555-0199"
                    className="w-full bg-[#0D1420] border border-[#23354C] rounded-lg p-2 text-white text-xs focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDispatchingNew(false)}
                  className="px-4 py-1.5 bg-[#141E2D] hover:bg-[#1E2E44] text-white text-xs rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-sky-500 hover:bg-sky-400 text-black font-black text-xs uppercase rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Inquiry &amp; Track Token</span>
                </button>
              </div>
            </form>
          )}

          {/* Active Inquiries List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Dispatched Prior Employer Inquiries &amp; Status ({inquiries.length})</span>
            </h4>

            <div className="space-y-2.5">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-3.5 rounded-xl bg-[#0D131F] border border-[#1C293C] hover:border-sky-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-bold text-sm">{inq.priorCompanyName}</span>
                      <span className="text-[10px] font-mono text-[#8EA2B8] bg-[#141F2E] px-1.5 py-0.2 rounded border border-[#243346]">
                        {inq.trackingToken}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#8EA2B8]">
                      Driver: <strong className="text-white">{inq.driverName}</strong> · Dates: {inq.employmentDates}
                    </div>

                    <div className="text-[11px] text-[#7E96B0] flex items-center gap-3">
                      <span>Sent: {inq.dateInquirySent}</span>
                      {inq.dateResponseReceived && (
                        <span className="text-emerald-400 font-bold">
                          ✓ Verified Response: {inq.dateResponseReceived}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#182332]">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        inq.status === 'RESPONSE_RECEIVED_VERIFIED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                      }`}
                    >
                      {inq.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-1">
                      {inq.accidentHistoryFound ? '⚠ Accidents Logged' : '0 Preventable Accidents'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#182332] bg-[#0A0E17] flex justify-between items-center text-xs">
          <span className="text-[11px] text-[#7E96B0]">
            30-Day FMCSA Good Faith Effort Audit Trail Active
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#141E2D] hover:bg-[#1E2E44] text-white font-bold text-xs uppercase rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
