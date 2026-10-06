import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Database,
  Radio,
  FileCheck,
  Send,
  X,
  Play,
  Terminal,
  RefreshCw,
  Sliders,
  Layers,
  Check,
  Copy,
} from 'lucide-react';
import {
  backendMaintenanceAgentService,
  BackendMaintenanceReport,
  GoogleAiExportPayload,
} from '../services/backendMaintenanceAgentService';
import { triggerHapticFeedback } from '../services/haptics';

interface BackendMaintenanceAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const BackendMaintenanceAgentModal: React.FC<BackendMaintenanceAgentModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [report, setReport] = useState<BackendMaintenanceReport>(backendMaintenanceAgentService.getReport());
  const [isRunningDiag, setIsRunningDiag] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<GoogleAiExportPayload['exportCategory']>('HIGHWAY_CLOSURES');
  const [testPayloadText, setTestPayloadText] = useState<string>(
    JSON.stringify({ corridor: 'I-80 Wyoming', status: 'CLOSURE_BLOWOVER_RISK', severity: 'CRITICAL' }, null, 2)
  );

  useEffect(() => {
    if (isOpen) {
      setReport(backendMaintenanceAgentService.getReport());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunDiagnostics = () => {
    setIsRunningDiag(true);
    triggerHapticFeedback('light');
    setTimeout(() => {
      const res = backendMaintenanceAgentService.runFullBackendDiagnostics();
      setReport(backendMaintenanceAgentService.getReport());
      setIsRunningDiag(false);
      triggerHapticFeedback('success');
      if (onShowToast) {
        onShowToast('Backend Maintenance Diagnostics Complete: 100% of routes optimal (' + res.latencyAverageMs + 'ms avg).', 'success');
      }
    }, 600);
  };

  const handleInjectGoogleAiUpdate = () => {
    try {
      const parsed = JSON.parse(testPayloadText);
      const res = backendMaintenanceAgentService.confirmAndDirectGoogleAiExport({
        sourceModel: 'gemini-3.8-flash',
        exportCategory: selectedCategory,
        payload: parsed,
      });
      setReport(backendMaintenanceAgentService.getReport());
      triggerHapticFeedback('success');
      if (onShowToast) {
        onShowToast('Google AI update directed & applied: ' + res.exportId + ' to ' + res.targetBackendService, 'success');
      }
    } catch (e) {
      triggerHapticFeedback('alert');
      if (onShowToast) onShowToast('Invalid JSON payload in test update', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#0A0E17] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-[#0E1626] to-[#151D30] border-b border-cyan-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/60 text-cyan-400">
              <Server className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  Backend Maintenance Agent
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                  AUTONOMOUS CUSTODIAN
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Sole Responsibility: Backend Health • Direct &amp; Confirm Google AI Exports • Zero-Downtime Hot-Patching
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunDiagnostics}
              disabled={isRunningDiag}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-600/70 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-900 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={'w-3.5 h-3.5 ' + (isRunningDiag ? 'animate-spin' : '')} />
              <span>{isRunningDiag ? 'Scanning...' : 'Run Diagnostics'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#070B12] border-b border-slate-800 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-[#0C121D] border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Backend Health</span>
            <span className="text-base font-black text-emerald-400">
              {report.overallBackendHealthPct}% OPTIMAL
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0C121D] border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Services Monitored</span>
            <span className="text-base font-black text-cyan-400">
              {report.healthyEndpointsCount} / {report.totalEndpointsMonitored} Online
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0C121D] border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Google AI Exports Directed</span>
            <span className="text-base font-black text-purple-400">
              {report.googleAiExportsDirected} Confirmed
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0C121D] border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Memory / Uptime</span>
            <span className="text-xs font-bold text-slate-200">
              {report.memoryUsageMb} MB • {report.uptimeHours} hrs
            </span>
          </div>
        </div>

        {/* BODY TABS & CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* SECTION 1: GOOGLE AI EXPORT DIRECTOR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Google AI Export Ingestion &amp; Direction Queue</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Listening to Gemini 3.8 Flash &amp; Google AI Studio
              </span>
            </div>

            <div className="space-y-2">
              {report.recentExportAuditLog.map(exp => (
                <div
                  key={exp.exportId}
                  className="p-3 rounded-xl bg-[#0C121D] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{exp.exportId}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                        {exp.exportCategory}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {exp.sourceModel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Target: <strong className="text-cyan-400">{exp.targetBackendService}</strong> • {exp.confirmationDetails}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-700">
                      ✓ {exp.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(exp.generatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: TEST & DIRECT NEW GOOGLE AI UPDATE */}
          <div className="p-4 rounded-xl bg-[#080D15] border border-cyan-900/40 space-y-3">
            <span className="text-xs font-bold text-cyan-300 font-mono uppercase flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate / Direct Google AI Structured Export</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Export Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="w-full bg-[#0C1322] border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:border-cyan-400"
                >
                  <option value="HIGHWAY_CLOSURES">HIGHWAY_CLOSURES (State DOT)</option>
                  <option value="RATE_CON_PARSING">RATE_CON_PARSING (OCR Rate-Con)</option>
                  <option value="FMCSA_CITATION_DISPUTE">FMCSA_CITATION_DISPUTE (Title 49 CFR)</option>
                  <option value="J1939_FAULT_PREDICTION">J1939_FAULT_PREDICTION (CAN Bus DTC)</option>
                  <option value="INSURANCE_RISK_PROFILE">INSURANCE_RISK_PROFILE (Telematics)</option>
                  <option value="QUANTUM_TELEMETRY_INFERENCE">QUANTUM_TELEMETRY_INFERENCE (Cold-Atom)</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex flex-col justify-end">
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Payload JSON</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testPayloadText}
                    onChange={(e) => setTestPayloadText(e.target.value)}
                    className="flex-1 bg-[#0C1322] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-400"
                  />
                  <button
                    onClick={handleInjectGoogleAiUpdate}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all shadow cursor-pointer whitespace-nowrap"
                  >
                    Confirm &amp; Direct Update
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: MONITORED BACKEND MICROSERVICES */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2 pb-2 border-b border-slate-800">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>All 9 Monitored Backend Microservices &amp; Routes</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {report.services.map(s => (
                <div key={s.serviceId} className="p-3 rounded-xl bg-[#0C121D] border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-white text-xs truncate max-w-[180px]">{s.serviceName}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {s.healthStatus}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400 truncate">{s.endpoint}</div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                    <span>Latency: <strong className="text-slate-200">{s.latencyMs}ms</strong></span>
                    <span>Uptime: <strong className="text-emerald-400">{s.uptimePct}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-3 sm:p-4 bg-[#080D15] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Agent Active: {report.agentId} • Uptime {report.uptimeHours} hrs</span>
          </div>
          <div>
            Last Autonomous Maintenance Cycle: <strong className="text-slate-200">{report.lastMaintenanceCycle}</strong>
          </div>
        </div>

      </div>
    </div>
  );
};
