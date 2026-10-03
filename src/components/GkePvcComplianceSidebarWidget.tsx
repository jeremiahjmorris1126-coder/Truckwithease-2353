import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileCode,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Wrench,
  Zap,
} from 'lucide-react';
import {
  gkePvcComplianceManager,
  GkeFilestoreAuditReport,
  PvcAuditItem,
  STANDARD_FILESTORE_STORAGE_CLASS,
  checkPvcFilestoreDeviation,
} from '../services/gkePvcComplianceService';
import { triggerHapticFeedback } from '../services/haptics';

interface GkePvcComplianceSidebarWidgetProps {
  onNavigateToAuditorTab?: () => void;
  className?: string;
}

export const GkePvcComplianceSidebarWidget: React.FC<GkePvcComplianceSidebarWidgetProps> = ({
  onNavigateToAuditorTab,
  className = '',
}) => {
  const [report, setReport] = useState<GkeFilestoreAuditReport | null>(gkePvcComplianceManager.getReport());
  const [isScanning, setIsScanning] = useState<boolean>(gkePvcComplianceManager.getIsScanning());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedPvcName, setExpandedPvcName] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = gkePvcComplianceManager.subscribe(() => {
      setReport(gkePvcComplianceManager.getReport());
      setIsScanning(gkePvcComplianceManager.getIsScanning());
    });
    return unsubscribe;
  }, []);

  const handleScan = async (scenario?: 'CURRENT_PROD' | 'SIMULATED_DEFECT') => {
    triggerHapticFeedback('subtle');
    if (scenario) {
      await gkePvcComplianceManager.setScenario(scenario);
    } else {
      await gkePvcComplianceManager.scan();
    }
  };

  const handleCopy = (text: string, key: string) => {
    triggerHapticFeedback('subtle');
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRemediate = (pvcName: string) => {
    triggerHapticFeedback('success');
    gkePvcComplianceManager.remediatePvc(pvcName, STANDARD_FILESTORE_STORAGE_CLASS);
  };

  const deviations = report ? gkePvcComplianceManager.getDeviations() : [];
  const hasDeviations = deviations.length > 0;

  return (
    <aside
      id="gke-pvc-compliance-sidebar-widget"
      className={`bg-[#050505] border-2 ${
        hasDeviations ? 'border-[#FFE600] shadow-[0_0_25px_rgba(255,230,0,0.2)]' : 'border-[#FFE600]/40'
      } rounded-xl overflow-hidden font-mono flex flex-col transition-all duration-200 select-none ${className}`}
    >
      {/* Top Banner Stripe */}
      <div
        className={`h-1 w-full ${
          hasDeviations
            ? 'bg-gradient-to-r from-red-500 via-[#FFE600] to-red-500 animate-pulse'
            : 'bg-gradient-to-r from-[#FFE600] to-[#FFD700]'
        }`}
      />

      {/* Header */}
      <div className="p-3 bg-[#0A0A00] border-b border-[#FFE600]/30 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              hasDeviations
                ? 'bg-red-950/80 border border-red-500/60 text-red-400'
                : 'bg-[#141400] border border-[#FFE600]/50 text-[#FFE600]'
            }`}
          >
            {hasDeviations ? (
              <ShieldAlert className="w-4 h-4 animate-bounce" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-[#FFE600]" />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[11px] uppercase tracking-wider text-[#FFE600] truncate">
                GKE PVC COMPLIANCE
              </span>
              <span
                className={`px-1 py-0.2 rounded text-[8px] font-black uppercase shrink-0 ${
                  hasDeviations
                    ? 'bg-red-500 text-black animate-pulse'
                    : 'bg-[#FFE600] text-black'
                }`}
              >
                {hasDeviations ? `${deviations.length} DEVIATION${deviations.length > 1 ? 'S' : ''}` : 'PASS'}
              </span>
            </div>
            <span className="text-[9px] text-[#A0A0A0] truncate">
              Standard: <strong className="text-white">{STANDARD_FILESTORE_STORAGE_CLASS}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => handleScan()}
            disabled={isScanning}
            className="w-6 h-6 rounded bg-[#141400] hover:bg-[#222200] border border-[#FFE600]/40 text-[#FFE600] flex items-center justify-center transition-colors active:scale-95 disabled:opacity-50"
            title="Re-run GKE PersistentVolumeClaim Scan"
          >
            <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-6 h-6 rounded bg-[#141400] hover:bg-[#222200] border border-[#FFE600]/40 text-[#FFE600] flex items-center justify-center transition-colors"
            title={isCollapsed ? 'Expand Widget' : 'Collapse Widget'}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[700px] scrollbar-thin">
          {/* Quick Scenario Selector & Live Toggle */}
          <div className="p-2 bg-[#000000] border border-[#FFE600]/25 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between text-[9px] text-[#A0A0A0]">
              <span className="uppercase font-bold tracking-wider">CLUSTER AUDIT MODE:</span>
              <span className="text-[#FFE600] font-mono">GKE 1.37.2</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[9px] font-bold">
              <button
                onClick={() => handleScan('CURRENT_PROD')}
                className={`py-1 px-1.5 rounded transition-all flex items-center justify-center gap-1 ${
                  report?.scenario === 'CURRENT_PROD'
                    ? 'bg-[#FFE600] text-black font-black shadow-sm'
                    : 'bg-[#141400] text-[#FFE600]/80 hover:text-[#FFE600] border border-[#FFE600]/30'
                }`}
              >
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>CLEAN PROD</span>
              </button>

              <button
                onClick={() => handleScan('SIMULATED_DEFECT')}
                className={`py-1 px-1.5 rounded transition-all flex items-center justify-center gap-1 ${
                  report?.scenario === 'SIMULATED_DEFECT'
                    ? 'bg-red-500 text-black font-black shadow-sm'
                    : 'bg-[#1a0505] text-red-400 hover:text-red-300 border border-red-500/40'
                }`}
                title="Inject non-compliant PersistentVolumeClaims deviating from standard Filestore"
              >
                <AlertTriangle className="w-2.5 h-2.5" />
                <span>TEST DEFECTS</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="p-1.5 bg-[#0D0D00] border border-[#FFE600]/25 rounded">
              <span className="text-[8px] text-[#A0A0A0] uppercase block">Scanned</span>
              <span className="text-xs font-bold text-white">{report?.metrics.totalPvcsScanned || 0}</span>
            </div>
            <div className="p-1.5 bg-[#0D0D00] border border-[#FFE600]/25 rounded">
              <span className="text-[8px] text-[#A0A0A0] uppercase block">Deviating</span>
              <span
                className={`text-xs font-black ${
                  hasDeviations ? 'text-red-400 animate-pulse' : 'text-[#FFE600]'
                }`}
              >
                {deviations.length}
              </span>
            </div>
            <div className="p-1.5 bg-[#0D0D00] border border-[#FFE600]/25 rounded">
              <span className="text-[8px] text-[#A0A0A0] uppercase block">Cost Risk</span>
              <span
                className={`text-[10px] font-bold truncate block ${
                  hasDeviations ? 'text-red-400' : 'text-[#FFE600]'
                }`}
              >
                {hasDeviations ? '+$160/mo' : '$0.00'}
              </span>
            </div>
          </div>

          {/* Highlights Section: Non-Compliant PVCs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#FFE600] font-bold uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-[#FFE600]" />
                NON-COMPLIANT PVC DEVIATIONS
              </span>
              <span className="text-[9px] text-[#888888]">
                {hasDeviations ? `${deviations.length} requiring remediation` : '0 issues'}
              </span>
            </div>

            {hasDeviations ? (
              <div className="space-y-2">
                {deviations.map(({ pvc, deviation }) => {
                  const isExpanded = expandedPvcName === pvc.name;
                  return (
                    <div
                      key={pvc.name}
                      className="p-2.5 bg-[#0A0A00] border-2 border-red-500/70 rounded-lg space-y-2 relative overflow-hidden transition-all shadow-md"
                    >
                      {/* Top Risk Warning Strip */}
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-white truncate font-mono">
                              {pvc.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[9px] text-[#A0A0A0] mt-0.5">
                            <span>ns: <strong className="text-[#FFE600]">{pvc.namespace}</strong></span>
                            <span>•</span>
                            <span>{pvc.requestedStorage}</span>
                            <span>•</span>
                            <span className="px-1 py-0.2 bg-red-950 text-red-300 border border-red-800 rounded text-[8px] font-bold">
                              {pvc.accessModes.join(', ')}
                            </span>
                          </div>
                        </div>

                        <span className="px-1.5 py-0.5 bg-red-500 text-black text-[8px] font-black rounded uppercase shrink-0">
                          {deviation.severity}
                        </span>
                      </div>

                      {/* Deviation Comparison: Declared vs Expected Standard Filestore */}
                      <div className="p-2 bg-[#000000] border border-red-500/40 rounded text-[9px] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[#888888]">DECLARED CLASS:</span>
                          <span className="font-bold text-red-400 font-mono">
                            {pvc.declaredStorageClass ? pvc.declaredStorageClass : '⟨OMITTED / NULL⟩'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#888888]">STANDARD POLICY:</span>
                          <span className="font-bold text-[#FFE600] font-mono flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-[#FFE600]" />
                            {deviation.expectedClass}
                          </span>
                        </div>
                        <div className="pt-1 border-t border-zinc-900 text-[9px] text-zinc-300 leading-tight">
                          <span className="text-red-400 font-bold block mb-0.5">DEVIATION IMPACT:</span>
                          {deviation.reason}
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-900 text-[9px]">
                          <span className="text-[#888888]">UNPLANNED BILLING:</span>
                          <span className="font-black text-red-400 font-mono">{pvc.estimatedMonthlyCost}</span>
                        </div>
                      </div>

                      {/* Action Buttons: Auto-Fix & YAML Inspect */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <button
                          onClick={() => handleRemediate(pvc.name)}
                          className="flex-1 py-1 px-2 bg-[#FFE600] hover:bg-[#FFF066] text-black font-extrabold text-[9px] uppercase rounded transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95"
                          title="Remediate this claim to explicitly declare standard filestore-csi"
                        >
                          <Wrench className="w-2.5 h-2.5 text-black" />
                          <span>FIX: SET {STANDARD_FILESTORE_STORAGE_CLASS}</span>
                        </button>

                        <button
                          onClick={() => setExpandedPvcName(isExpanded ? null : pvc.name)}
                          className="py-1 px-2 bg-[#141400] hover:bg-[#222200] border border-[#FFE600]/40 text-[#FFE600] text-[9px] font-bold rounded transition-colors flex items-center gap-1"
                          title="Inspect Kubernetes YAML remediation snippet"
                        >
                          <FileCode className="w-2.5 h-2.5" />
                          <span>{isExpanded ? 'HIDE' : 'YAML'}</span>
                        </button>
                      </div>

                      {/* Expanded Remediation YAML */}
                      {isExpanded && (
                        <div className="mt-1.5 p-2 bg-[#050505] border border-[#FFE600]/30 rounded text-[9px] space-y-1">
                          <div className="flex items-center justify-between pb-1 border-b border-[#222200]">
                            <span className="text-[#FFE600] font-bold uppercase text-[8px]">
                              STANDARD FILESTORE REMEDIATION SPEC
                            </span>
                            <button
                              onClick={() => handleCopy(pvc.remediationSnippet, pvc.name)}
                              className="px-1.5 py-0.5 bg-[#141400] hover:bg-[#222200] text-[#FFE600] border border-[#FFE600]/40 rounded text-[8px] flex items-center gap-1"
                            >
                              {copiedKey === pvc.name ? (
                                <Check className="w-2.5 h-2.5 text-[#FFE600]" />
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                              <span>{copiedKey === pvc.name ? 'COPIED' : 'COPY'}</span>
                            </button>
                          </div>
                          <pre className="text-[8px] text-[#A0A0A0] font-mono overflow-x-auto whitespace-pre p-1 bg-black rounded">
                            {pvc.remediationSnippet}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-[#0A0A00] border border-[#FFE600]/30 rounded-lg text-center space-y-1.5">
                <CheckCircle2 className="w-6 h-6 text-[#FFE600] mx-auto animate-pulse" />
                <div className="text-[11px] font-black text-white uppercase">
                  ZERO FILESTORE DEVIATIONS
                </div>
                <p className="text-[9px] text-[#A0A0A0] leading-relaxed">
                  All {report?.metrics.totalPvcsScanned || 0} Kubernetes PersistentVolumeClaims strictly declare authorized storage classes. No unmanaged dynamic Filestore billing leaks detected.
                </p>
                <div className="pt-1">
                  <span className="px-2 py-0.5 bg-[#FFE600]/15 border border-[#FFE600]/40 text-[#FFE600] text-[8px] font-bold rounded">
                    POLICY STATUS: 100% ENFORCED
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Standard Filestore Policy Specification */}
          <div className="p-2.5 bg-[#000000] border border-[#FFE600]/25 rounded-lg space-y-1 text-[9px]">
            <div className="text-[#FFE600] font-bold uppercase text-[9px] flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-[#FFE600]" />
              AUTHORIZED GKE FILESTORE POLICY
            </div>
            <div className="space-y-0.5 text-[#888888] pt-1">
              <div className="flex justify-between">
                <span>CSI Driver:</span>
                <span className="text-white font-mono">gke.io/filestore-csi</span>
              </div>
              <div className="flex justify-between">
                <span>Standard Class:</span>
                <span className="text-[#FFE600] font-bold font-mono">filestore-csi</span>
              </div>
              <div className="flex justify-between">
                <span>Multishare Tier:</span>
                <span className="text-white font-mono">enterprise-multishare-rwx</span>
              </div>
              <div className="flex justify-between">
                <span>GKE Defaulting Guard:</span>
                <span className="text-[#FFE600] font-bold">STRICT (NO OMISSION)</span>
              </div>
            </div>
          </div>

          {/* Bottom Direct Navigation to Full Auditor */}
          {onNavigateToAuditorTab && (
            <button
              onClick={onNavigateToAuditorTab}
              className="w-full py-1.5 px-2 bg-[#141400] hover:bg-[#222200] border border-[#FFE600]/40 hover:border-[#FFE600] text-[#FFE600] text-[10px] font-bold uppercase rounded flex items-center justify-between transition-all active:scale-95 shadow-sm"
              title="Open full interactive GKE Filestore Compliance Auditor tab"
            >
              <div className="flex items-center gap-1.5">
                <HardDrive className="w-3 h-3 text-[#FFE600]" />
                <span>LAUNCH FULL AUDITOR TAB</span>
              </div>
              <ArrowRight className="w-3 h-3 text-[#FFE600]" />
            </button>
          )}
        </div>
      )}
    </aside>
  );
};
