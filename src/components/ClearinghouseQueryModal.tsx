import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck,
  Check,
  RefreshCw,
  Award,
  Lock,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { driverDqfComplianceService } from '../services/driverDqfComplianceService';
import { ClearinghouseQueryRecord, DriverRecord } from '../types';
import { triggerHapticFeedback } from '../services/haptics';

interface ClearinghouseQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver?: DriverRecord | null;
}

export const ClearinghouseQueryModal: React.FC<ClearinghouseQueryModalProps> = ({
  isOpen,
  onClose,
  driver,
}) => {
  const [queries, setQueries] = useState<ClearinghouseQueryRecord[]>(
    driverDqfComplianceService.getClearinghouseQueries()
  );
  const [isRunningQuery, setIsRunningQuery] = useState<boolean>(false);
  const [queryType, setQueryType] = useState<'PRE_EMPLOYMENT_FULL' | 'ANNUAL_LIMITED_BATCH'>('ANNUAL_LIMITED_BATCH');
  const [consentGranted, setConsentGranted] = useState<boolean>(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunQuery = () => {
    triggerHapticFeedback('subtle');
    setIsRunningQuery(true);

    setTimeout(() => {
      const created = driverDqfComplianceService.executeClearinghouseQuery(
        driver ? driver.id : 'drv-001',
        queryType
      );
      setQueries(driverDqfComplianceService.getClearinghouseQueries());
      setIsRunningQuery(false);
      setSuccessToast(`FMCSA Clearinghouse Query Complete: RECORD NOT FOUND (CLEAN). Stamped ID: ${created.fmcsaTransactionId}`);
      setTimeout(() => setSuccessToast(null), 5000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="bg-[#0B0F19] border-2 border-emerald-500/50 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#182334] bg-gradient-to-r from-[#0C1A14] to-[#0B0F19] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500 text-black flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-black" />
                49 CFR PART 382.701 CLEARINGHOUSE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#14261D] text-emerald-400 border border-emerald-500/30">
                MANDATORY DRUG &amp; ALCOHOL REGISTRY
              </span>
            </div>
            <h3 className="text-xl font-bold text-white uppercase tracking-tight font-[Oswald]">
              FMCSA Drug &amp; Alcohol Clearinghouse Query Orchestrator
            </h3>
            <p className="text-xs text-[#8EA2B8]">
              Automates electronic driver consent, pre-employment full queries, and annual limited batch queries
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
          <div className="bg-[#091D13] border-b border-emerald-500 p-3 px-4 text-xs font-bold text-emerald-300 animate-fadeIn flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs text-zinc-200">
          {/* Query Execution Trigger Card */}
          <div className="p-4 rounded-xl bg-[#080D15] border border-emerald-500/40 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold uppercase text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Execute Instant FMCSA Clearinghouse Query</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                DIRECT DOT API GATEWAY
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[#8EA2B8] uppercase font-bold mb-1">
                  Query Type
                </label>
                <select
                  value={queryType}
                  onChange={(e: any) => setQueryType(e.target.value)}
                  className="w-full bg-[#0D1420] border border-[#23354C] rounded-lg p-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                >
                  <option value="ANNUAL_LIMITED_BATCH">Annual Limited Query (Fleet Batch - § 382.701b)</option>
                  <option value="PRE_EMPLOYMENT_FULL">Pre-Employment Full Query (New Hire - § 382.701a)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#8EA2B8] uppercase font-bold mb-1">
                  Target Driver
                </label>
                <input
                  type="text"
                  readOnly
                  value={driver ? `${driver.firstName} ${driver.lastName} (CDL: ${driver.cdlNumber})` : 'Marcus Bell (CDL: CDL-MO-8942109)'}
                  className="w-full bg-[#0D1420] border border-[#23354C] rounded-lg p-2 text-white text-xs text-zinc-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#142030]">
              <label className="flex items-center gap-2 cursor-pointer text-[11px] text-zinc-300">
                <input
                  type="checkbox"
                  checked={consentGranted}
                  onChange={(e) => setConsentGranted(e.target.checked)}
                  className="accent-emerald-400"
                />
                <span>Driver Electronic Consent Certificate on file (Signed for full tenure)</span>
              </label>

              <button
                type="button"
                onClick={handleRunQuery}
                disabled={isRunningQuery || !consentGranted}
                className="px-5 py-2 bg-gradient-to-r from-[#FFE600] to-[#F59E0B] hover:brightness-110 text-black font-black text-xs uppercase rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunningQuery ? 'animate-spin' : ''}`} />
                <span>{isRunningQuery ? 'Querying FMCSA Portal...' : 'Run Query ($1.25 Flat Rate)'}</span>
              </button>
            </div>
          </div>

          {/* Historical Queries Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Certified FMCSA Clearinghouse Query Ledger ({queries.length})</span>
            </h4>

            <div className="space-y-2.5">
              {queries.map((q) => (
                <div
                  key={q.id}
                  className="p-3.5 rounded-xl bg-[#0D131F] border border-[#1C293C] hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-bold text-sm">{q.driverName}</span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-[#122030] px-1.5 py-0.2 rounded border border-cyan-500/30">
                        {q.fmcsaTransactionId}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#8EA2B8]">
                      CDL: {q.cdlNumber} ({q.cdlState}) · Query Type: {q.queryType.replace(/_/g, ' ')}
                    </div>

                    <div className="text-[11px] text-[#7E96B0]">
                      Query Date: {q.queryDate} · Next Annual Due: <strong className="text-white">{q.nextScheduledQueryDate}</strong>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#182332]">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      RECORD CLEAN
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-1">0 Prohibited Violations</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#182332] bg-[#0A0E17] flex justify-between items-center text-xs">
          <span className="text-[11px] text-[#7E96B0]">
            FMCSA Drug &amp; Alcohol Clearinghouse Stamped &amp; Validated
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
