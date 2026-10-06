import React, { useState, useEffect } from 'react';
import {
  Server,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  FileCheck,
  DollarSign,
  Download,
  Terminal,
  ExternalLink,
  Code2,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { triggerHapticFeedback } from '../services/haptics';
import {
  gkePvcComplianceManager,
  PvcAuditItem as ServicePvcAuditItem,
  GkeFilestoreAuditReport as ServiceGkeAuditReport,
} from '../services/gkePvcComplianceService';

export type PvcAuditItem = ServicePvcAuditItem;
export type GkeFilestoreAuditReport = ServiceGkeAuditReport;

export const GkeFilestoreComplianceAuditor: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<'CURRENT_PROD' | 'SIMULATED_DEFECT'>(gkePvcComplianceManager.getScenario());
  const [isAuditing, setIsAuditing] = useState<boolean>(gkePvcComplianceManager.getIsScanning());
  const [auditReport, setAuditReport] = useState<GkeFilestoreAuditReport | null>(gkePvcComplianceManager.getReport());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedPvcName, setExpandedPvcName] = useState<string | null>(null);
  const [exportSuccessToast, setExportSuccessToast] = useState<string | null>(null);

  // Sync with manager
  useEffect(() => {
    const unsub = gkePvcComplianceManager.subscribe(() => {
      const rep = gkePvcComplianceManager.getReport();
      if (rep) {
        setAuditReport(rep);
        setSelectedScenario(rep.scenario);
      }
      setIsAuditing(gkePvcComplianceManager.getIsScanning());
    });

    const rep = gkePvcComplianceManager.getReport();
    if (rep) {
      setAuditReport(rep);
      setSelectedScenario(rep.scenario);
    }
    return unsub;
  }, []);

  // Automated scan execution
  const executeScan = async (scenario = selectedScenario) => {
    triggerHapticFeedback('alert');
    setSelectedScenario(scenario);
    setExportSuccessToast(null);
    const newRep = await gkePvcComplianceManager.setScenario(scenario);
    if (newRep) {
      setAuditReport(newRep);
    }
  };

  // Run automated audit on mount
  useEffect(() => {
    executeScan('CURRENT_PROD');
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    triggerHapticFeedback('subtle');
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleExportDossier = () => {
    if (!auditReport) return;
    triggerHapticFeedback('success');
    const dossierText = `================================================================================
TRUCKWITHEASE™ GKE FILESTORE & RWX COMPLIANCE AUDIT REPORT
FMCSA 49 CFR PART 395/396 IT INFRASTRUCTURE & STORAGE STANDARDS
================================================================================
Audit ID:       ${auditReport.auditId}
Timestamp:      ${auditReport.auditTimestamp}
GKE Cluster:    ${auditReport.clusterName}
Control Plane:  ${auditReport.gkeControlPlaneVersion}
Overall Status: ${auditReport.overallStatus}

METRICS BREAKDOWN:
- Total PersistentVolumeClaims:     ${auditReport.metrics.totalPvcsScanned}
- ReadWriteMany (RWX) Claims:       ${auditReport.metrics.readWriteManyCount}
- ReadWriteOnce (RWO) Claims:       ${auditReport.metrics.readWriteOnceCount}
- Explicitly Defined StorageClass:  ${auditReport.metrics.explicitlyDefinedCount}
- Defaulting to GKE Filestore:      ${auditReport.metrics.defaultingToFilestoreCount}
- Projected Monthly Billing Impact: ${auditReport.metrics.projectedMonthlyCostExposure}

VERDICT:
${auditReport.summaryVerdict}

DETAILED VOLUME CLAIMS:
${auditReport.pvcs
  .map(
    (p, i) => `
[${i + 1}] PVC: ${p.name} (Namespace: ${p.namespace})
    Workload:         ${p.workload}
    Access Modes:     ${p.accessModes.join(', ')}
    Storage Class:    ${p.declaredStorageClass ? p.declaredStorageClass : 'OMITTED / DEFAULTING'}
    Resolution:       ${p.resolution}
    Defaulting Risk:  ${p.isDefaultingRisk ? 'YES (CRITICAL COST RISK)' : 'NO (PROTECTED)'}
    Estimated Cost:   ${p.estimatedMonthlyCost}
`
  )
  .join('\n')}
================================================================================`;

    const blob = new Blob([dossierText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GKE-Filestore-Compliance-Audit-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExportSuccessToast('Audit Dossier exported successfully.');
  };

  return (
    <div className="bg-[#050505] border border-[#FFE600]/30 rounded-xl p-3.5 sm:p-5 space-y-4 text-slate-200 font-mono shadow-2xl relative overflow-hidden">
      {/* Top Gold Stripe */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FFE600] via-[#FFD700] to-[#FFE600]" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#FFE600]/20">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-[#FFE600] text-black flex items-center gap-1 shadow-sm">
              <Server className="w-3 h-3 text-black" />
              GKE FILESTORE AUDITOR
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#141400] text-[#FFE600] border border-[#FFE600]/40 flex items-center gap-1">
              RWX STORAGECLASS
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#111100] text-slate-300 border border-[#FFE600]/20">
              GKE 1.37+ COMPLIANT
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight font-[Oswald]">
            GKE PersistentVolumeClaim (RWX) &amp; Filestore Auditor
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl">
            Autonomously inspects all Kubernetes PersistentVolumeClaims across your fleet clusters. Identifies multi-writer <code className="text-[#FFE600]">ReadWriteMany (RWX)</code> access modes, validates whether <code className="text-[#FFE600]">storageClassName</code> is explicitly declared, and guarantees zero unintended dynamic Cloud Filestore billing.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => executeScan(selectedScenario)}
            disabled={isAuditing}
            className="px-3 py-1.5 bg-[#FFE600] hover:bg-[#FFF066] text-black font-black text-xs uppercase rounded-lg flex items-center gap-1.5 shadow-md shadow-[#FFE600]/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin text-black' : ''}`} />
            <span>{isAuditing ? 'Auditing...' : 'Run Automated PVC Scan'}</span>
          </button>

          <button
            onClick={handleExportDossier}
            disabled={!auditReport}
            className="px-3 py-1.5 bg-[#141400] hover:bg-[#222200] text-[#FFE600] font-bold text-xs uppercase rounded-lg flex items-center gap-1.5 border border-[#FFE600]/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-[#FFE600]" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Scenario Selector & Quick Simulation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0A0A0A] p-3 rounded-xl border border-[#FFE600]/20">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Layers className="w-4 h-4 text-[#FFE600]" />
          <span>Audit Target Environment:</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedScenario('CURRENT_PROD');
              executeScan('CURRENT_PROD');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedScenario === 'CURRENT_PROD'
                ? 'bg-[#FFE600] text-black font-black shadow-md shadow-[#FFE600]/20'
                : 'bg-[#141400] text-[#FFE600]/70 hover:text-[#FFE600] border border-[#FFE600]/30'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Live Production Fleet (Safe: 100% Explicit)</span>
          </button>

          <button
            onClick={() => {
              setSelectedScenario('SIMULATED_DEFECT');
              executeScan('SIMULATED_DEFECT');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedScenario === 'SIMULATED_DEFECT'
                ? 'bg-rose-500 text-black font-black shadow-md shadow-rose-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Unspecified RWX Defect</span>
          </button>
        </div>
      </div>

      {exportSuccessToast && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportSuccessToast}</span>
        </div>
      )}

      {/* Main Audit Results Dashboard */}
      {auditReport && (
        <div className="space-y-6">
          {/* Executive Verdict Banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
            auditReport.metrics.defaultingToFilestoreCount === 0
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/30 border-rose-500/50 text-rose-300 animate-pulse'
          }`}>
            {auditReport.metrics.defaultingToFilestoreCount === 0 ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-black text-xs uppercase tracking-wider">
                  {auditReport.metrics.defaultingToFilestoreCount === 0
                    ? 'PASSED: 100% EXPLICIT STORAGECLASS COMPLIANCE'
                    : 'CRITICAL AUDIT ALERT: UNMANAGED FILESTORE PROVISIONING DETECTED'}
                </span>
                <span className="px-2 py-0.5 rounded bg-black/40 text-[10px] font-mono font-bold">
                  {auditReport.clusterName}
                </span>
              </div>
              <p className="text-xs leading-relaxed font-sans text-slate-200">
                {auditReport.summaryVerdict}
              </p>
            </div>
          </div>

          {/* 4 Metric Counter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0D1424] p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Total PVCs Audited</div>
              <div className="text-xl font-black text-white">{auditReport.metrics.totalPvcsScanned} Volumes</div>
              <div className="text-[10px] text-cyan-400 font-mono">100% Namespaces Scanned</div>
            </div>

            <div className="bg-[#0D1424] p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold">RWX Multi-Writer Claims</div>
              <div className={`text-xl font-black ${
                auditReport.metrics.readWriteManyCount > 0 ? 'text-amber-400' : 'text-white'
              }`}>
                {auditReport.metrics.readWriteManyCount} PVCs
              </div>
              <div className="text-[10px] text-slate-400 font-mono">ReadWriteMany Mode</div>
            </div>

            <div className="bg-[#0D1424] p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Defaulting to Filestore</div>
              <div className={`text-xl font-black ${
                auditReport.metrics.defaultingToFilestoreCount > 0 ? 'text-rose-400 font-black' : 'text-emerald-400'
              }`}>
                {auditReport.metrics.defaultingToFilestoreCount} Defective
              </div>
              <div className="text-[10px] text-slate-400 font-mono">storageClassName Omitted</div>
            </div>

            <div className="bg-[#0D1424] p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Projected Monthly Impact</div>
              <div className={`text-base font-black ${
                auditReport.metrics.defaultingToFilestoreCount > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {auditReport.metrics.projectedMonthlyCostExposure}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {auditReport.metrics.defaultingToFilestoreCount > 0 ? 'Minimum 1 TiB Base' : 'Zero Unmanaged Fees'}
              </div>
            </div>
          </div>

          {/* Detailed Granular Claims Table */}
          <div className="bg-[#0C1220] rounded-xl border border-slate-800 overflow-hidden space-y-3 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white uppercase flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                PersistentVolumeClaim Inventory &amp; StorageClass Resolution
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {auditReport.pvcs.length} Claims Inspected
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-[#090F1C] text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3 font-bold">Claim Name &amp; Namespace</th>
                    <th className="p-3 font-bold">Workload &amp; Size</th>
                    <th className="p-3 font-bold">Access Mode</th>
                    <th className="p-3 font-bold">Declared StorageClass</th>
                    <th className="p-3 font-bold">Filestore Resolution</th>
                    <th className="p-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-[#070B14]">
                  {auditReport.pvcs.map((pvc) => {
                    const isExpanded = expandedPvcName === pvc.name;
                    return (
                      <React.Fragment key={pvc.name}>
                        <tr className={`hover:bg-[#0E1524] transition-colors ${
                          pvc.isDefaultingRisk ? 'bg-rose-950/20' : ''
                        }`}>
                          <td className="p-3 font-bold text-white">
                            <div className="flex items-center gap-1.5">
                              {pvc.isDefaultingRisk ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              )}
                              <span>{pvc.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              ns: <span className="text-cyan-300">{pvc.namespace}</span>
                            </div>
                          </td>

                          <td className="p-3 text-slate-300">
                            <div>{pvc.workload}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Request: {pvc.requestedStorage}
                            </div>
                          </td>

                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              pvc.accessModes.includes('ReadWriteMany')
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              {pvc.accessModes.join(', ')}
                            </span>
                          </td>

                          <td className="p-3 font-mono">
                            {pvc.declaredStorageClass ? (
                              <span className="text-emerald-400 font-bold">
                                {pvc.declaredStorageClass}
                              </span>
                            ) : (
                              <span className="text-rose-400 font-black bg-rose-950/60 px-2 py-0.5 rounded border border-rose-600/60 animate-pulse">
                                OMITTED (UNDEFINED)
                              </span>
                            )}
                          </td>

                          <td className="p-3">
                            {pvc.isDefaultingRisk ? (
                              <div>
                                <span className="px-2 py-0.5 rounded bg-rose-600/30 text-rose-300 font-black text-[10px] border border-rose-500">
                                  DEFAULTING TO FILESTORE ⚠️
                                </span>
                                <div className="text-[9px] text-rose-400 font-bold mt-1">
                                  {pvc.estimatedMonthlyCost}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                                  EXPLICIT DEFINED (SAFE)
                                </span>
                                <div className="text-[9px] text-slate-500 mt-0.5">
                                  {pvc.estimatedMonthlyCost}
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="p-3 text-right">
                            <button
                              onClick={() => setExpandedPvcName(isExpanded ? null : pvc.name)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white border border-slate-700 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Code2 className="w-3 h-3" />
                              <span>{isExpanded ? 'Hide YAML' : 'View Spec'}</span>
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-[#050810]">
                            <td colSpan={6} className="p-4 border-t border-b border-slate-800">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-300">
                                  <span className="flex items-center gap-1.5 text-cyan-400">
                                    <Terminal className="w-3.5 h-3.5" />
                                    Kubernetes Manifest Remediation Spec: {pvc.name}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(pvc.remediationSnippet, pvc.name)}
                                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300 flex items-center gap-1 cursor-pointer"
                                  >
                                    {copiedKey === pvc.name ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    {copiedKey === pvc.name ? 'Copied' : 'Copy YAML'}
                                  </button>
                                </div>
                                <pre className="p-3 bg-[#020408] rounded-lg border border-slate-800 text-[11px] font-mono text-cyan-200 overflow-x-auto whitespace-pre">
                                  {pvc.remediationSnippet}
                                </pre>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
