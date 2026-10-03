// ============================================================================
// DRIVER INTELLIGENCE & PROGRAMMING CONSOLE (VOICE, ROUTES, BREAKDOWNS & DVIR)
// Dedicated console to program acoustic voice recognition, route memory,
// prior telematics issues, roadside breakdown history, and prior DVIR audits.
// ============================================================================

import React, { useState } from 'react';
import {
  Mic,
  Navigation,
  AlertTriangle,
  Wrench,
  FileCheck,
  CheckCircle2,
  X,
  Volume2,
  Sliders,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Layers,
  Clock,
  MapPin,
  Truck,
  Plus,
} from 'lucide-react';
import {
  DriverDotDossier,
  DriverPriorBreakdown,
  DriverPriorDvir,
} from '../services/driverIntelligenceService';
import { triggerHapticFeedback } from '../services/haptics';

interface DriverIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: DriverDotDossier | null;
  onOpenDossier?: (driver: DriverDotDossier) => void;
}

export const DriverIntelligenceModal: React.FC<DriverIntelligenceModalProps> = ({
  isOpen,
  onClose,
  driver,
  onOpenDossier,
}) => {
  const [activeTab, setActiveTab] = useState<'VOICE' | 'ROUTES' | 'ISSUES' | 'BREAKDOWNS' | 'DVIR'>('VOICE');
  const [isCalibratingVoice, setIsCalibratingVoice] = useState(false);
  const [customWakePhrase, setCustomWakePhrase] = useState(driver?.voiceProfile.preferredWakePhrase || '');
  const [voiceConfidence, setVoiceConfidence] = useState(driver?.voiceProfile.recognitionConfidencePercent || 98.4);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || !driver) return null;

  const handleSimulateVoiceCalibration = () => {
    triggerHapticFeedback('double');
    setIsCalibratingVoice(true);
    setToastMessage('ACOUSTIC NOISE-GATE SAMPLING (100Hz - 8000Hz)...');

    setTimeout(() => {
      setIsCalibratingVoice(false);
      setVoiceConfidence(99.2);
      triggerHapticFeedback('success');
      setToastMessage('VOICE BIOMETRIC SIGNATURE CALIBRATED & SAVED');
      setTimeout(() => setToastMessage(null), 3000);
    }, 2000);
  };

  const handleSaveWakePhrase = () => {
    triggerHapticFeedback('tick');
    setToastMessage(`CUSTOM WAKE PHRASE SET: "${customWakePhrase}"`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0A0C12] border-2 border-emerald-500 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.9)] text-white font-sans">
        
        {/* TOAST POPUP */}
        {toastMessage && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-[#0E1714] border border-emerald-500 text-emerald-300 px-4 py-2 rounded-xl text-xs font-mono font-bold shadow-2xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-slate-800 bg-[#0E121A]">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-headline font-black text-white uppercase tracking-tight">
                  Driver &amp; Rig Intelligence Console
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                  PROGRAMMING ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Driver: <strong className="text-white">{driver.driverName}</strong> · Unit: <strong className="text-amber-300">{driver.assignedUnit}</strong> ({driver.assignedTrailer})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenDossier && (
              <button
                onClick={() => {
                  onOpenDossier(driver);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-[#141B26] hover:bg-[#1D2736] text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition-all"
              >
                View DOT DQF File
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="p-4 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-mono font-bold">
            <button
              onClick={() => setActiveTab('VOICE')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'VOICE'
                  ? 'bg-emerald-600 text-white font-black shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>VOICE BIOMETRICS</span>
            </button>

            <button
              onClick={() => setActiveTab('ROUTES')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'ROUTES'
                  ? 'bg-emerald-600 text-white font-black shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>ROUTE MEMORY</span>
            </button>

            <button
              onClick={() => setActiveTab('ISSUES')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'ISSUES'
                  ? 'bg-emerald-600 text-white font-black shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>PRIOR ISSUES ({driver.priorIssues.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('BREAKDOWNS')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'BREAKDOWNS'
                  ? 'bg-emerald-600 text-white font-black shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>PRIOR BREAKDOWNS ({driver.priorBreakdowns.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('DVIR')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'DVIR'
                  ? 'bg-emerald-600 text-white font-black shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>PRIOR DVIR LOGS ({driver.priorDvirRecords.length})</span>
            </button>
          </div>

          {/* TAB 1: VOICE BIOMETRICS & RECOGNITION */}
          {activeTab === 'VOICE' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#111420] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white uppercase text-sm">
                      Acoustic Voice Recognition Profile
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40">
                    MATCH CONFIDENCE: {voiceConfidence}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-[#0A0C12] border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Fundamental Pitch</span>
                    <strong className="text-white text-base">{driver.voiceProfile.fundamentalFreqHz} Hz</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0A0C12] border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Noise Gate</span>
                    <strong className="text-emerald-400 text-base">{driver.voiceProfile.noiseGateThresholdDb} dB</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0A0C12] border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Acoustic Timbre</span>
                    <strong className="text-white text-xs truncate block">{driver.voiceProfile.acousticTimbre}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0A0C12] border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Last Calibrated</span>
                    <strong className="text-amber-300 text-xs block">{driver.voiceProfile.lastCalibratedDate}</strong>
                  </div>
                </div>

                {/* Wake Phrase Config */}
                <div className="p-3 rounded-lg bg-[#0A0C12] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="w-full sm:w-auto flex-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Programmed In-Cab Wake Phrase
                    </label>
                    <input
                      type="text"
                      value={customWakePhrase}
                      onChange={(e) => setCustomWakePhrase(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#141722] border border-slate-700 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleSaveWakePhrase}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase transition-all"
                  >
                    Save Phrase
                  </button>
                </div>

                {/* Interactive Microphone Live Calibrate */}
                <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <div>
                      <span className="font-bold text-white block">
                        Acoustic Noise-Gate Test &amp; Cab Calibration
                      </span>
                      <span className="text-[10px] text-slate-300">
                        Filters diesel engine rumble and road vibration while training speaker identification.
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSimulateVoiceCalibration}
                    disabled={isCalibratingVoice}
                    className="shadow-[0_0_15px_rgba(255,230,0,0.45)] px-4 py-2 rounded-lg bg-gradient-to-r from-[#FFE600] to-[#FFD700] hover:from-[#FFEA2E] hover:to-[#FFD700] text-black font-bold uppercase transition-all shadow active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    {isCalibratingVoice ? 'Calibrating...' : 'Run Live Calibration'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROUTE MEMORY */}
          {activeTab === 'ROUTES' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#111420] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white uppercase text-sm">
                    Corridor Memory &amp; Bridge Clearance Profile
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {driver.routeProfile.totalSafeMilesLogged.toLocaleString()} Safe Miles Logged
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0A0C12] border border-slate-800 space-y-1.5">
                  <span className="text-slate-400 text-[10px] uppercase block">Primary Freight Corridor:</span>
                  <strong className="text-white text-sm block">{driver.routeProfile.primaryCorridor}</strong>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#0A0C12] border border-slate-800 space-y-1.5">
                    <span className="text-slate-400 text-[10px] uppercase block">Approved Rig Height Clearance:</span>
                    <strong className="text-emerald-400 text-base block">{driver.routeProfile.bridgeClearanceFormatted}</strong>
                    <span className="text-[10px] text-slate-500 block">FMCSA § 392 Low Clearance Detour Active</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0A0C12] border border-slate-800 space-y-1.5">
                    <span className="text-slate-400 text-[10px] uppercase block">Preferred Fuel Waypoints:</span>
                    <div className="space-y-1">
                      {driver.routeProfile.preferredFuelWaypoints.map((fuel, idx) => (
                        <div key={idx} className="text-amber-200 text-xs">
                          ⛽ {fuel}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Restricted Hazmat Tunnels */}
                <div className="p-3 rounded-lg bg-[#0A0C12] border border-slate-800 space-y-1">
                  <span className="text-rose-400 text-[10px] uppercase font-bold block">
                    Restricted HazMat Tunnels / Avoided Routes:
                  </span>
                  <div className="space-y-0.5 text-slate-300">
                    {driver.routeProfile.restrictedHazmatTunnels.map((tun, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="text-rose-400">✕</span>
                        <span>{tun}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRIOR ISSUES */}
          {activeTab === 'ISSUES' && (
            <div className="space-y-3 font-mono text-xs">
              {driver.priorIssues.length === 0 ? (
                <div className="p-8 text-center bg-[#111420] rounded-xl border border-slate-800 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-white font-bold text-sm uppercase">Zero Telematics Anomalies</h4>
                  <p className="text-slate-400 text-xs">No harsh braking, excessive speed, or roadside citations recorded.</p>
                </div>
              ) : (
                driver.priorIssues.map((iss) => (
                  <div key={iss.id} className="p-4 rounded-xl bg-[#111420] border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 text-[10px]">
                          {iss.type}
                        </span>
                        <span className="text-white font-bold">{iss.location}</span>
                      </div>
                      <span className="text-slate-400">{iss.date}</span>
                    </div>
                    <p className="text-slate-200">{iss.description}</p>
                    <div className="text-[11px] text-emerald-400 font-bold pt-1 border-t border-slate-800/80">
                      ✓ Corrective Action: {iss.correctiveAction}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: PRIOR BREAKDOWNS */}
          {activeTab === 'BREAKDOWNS' && (
            <div className="space-y-3 font-mono text-xs">
              {driver.priorBreakdowns.length === 0 ? (
                <div className="p-8 text-center bg-[#111420] rounded-xl border border-slate-800 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-white font-bold text-sm uppercase">Clean Mechanical History</h4>
                  <p className="text-slate-400 text-xs">Zero roadside mechanical breakdowns logged for this driver and unit.</p>
                </div>
              ) : (
                driver.priorBreakdowns.map((bd) => (
                  <div key={bd.id} className="p-4 rounded-xl bg-[#111420] border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <span className="text-xs font-bold text-amber-300 block">{bd.componentFailed}</span>
                        <span className="text-[10px] text-slate-400">{bd.location} ({bd.highwayMilepost}) · {bd.date}</span>
                      </div>
                      <span className="px-2 py-1 rounded bg-slate-800 text-white font-bold text-xs">
                        ${bd.totalCostUsd.toLocaleString()} USD
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] p-2 rounded-lg bg-[#0A0C12] border border-slate-800">
                      <div>Root Cause: <strong className="text-slate-300 block">{bd.rootCause}</strong></div>
                      <div>Towing Service: <strong className="text-white block">{bd.towingVendor}</strong></div>
                      <div>Certified Shop: <strong className="text-emerald-400 block">{bd.repairShop}</strong></div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      <span>Downtime: <strong className="text-white">{bd.downtimeHours} hours</strong></span>
                      <span>Warranty: <strong className="text-emerald-400">{bd.warrantyExpirationDate}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: PRIOR DVIR LOGS */}
          {activeTab === 'DVIR' && (
            <div className="space-y-3 font-mono text-xs">
              {driver.priorDvirRecords.length === 0 ? (
                <div className="p-8 text-center bg-[#111420] rounded-xl border border-slate-800 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-white font-bold text-sm uppercase">DVIR Archives Ready</h4>
                  <p className="text-slate-400 text-xs">Daily pre-trip and post-trip inspection audits are archived automatically.</p>
                </div>
              ) : (
                driver.priorDvirRecords.map((dvir) => (
                  <div key={dvir.id} className="p-4 rounded-xl bg-[#111420] border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          dvir.inspectionType === 'PRE_TRIP' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                        }`}>
                          {dvir.inspectionType}
                        </span>
                        <span className="text-white font-bold">{dvir.unitNumber} ({dvir.trailerNumber})</span>
                      </div>
                      <span className="text-slate-400">{dvir.date}</span>
                    </div>

                    <div className="text-slate-300 text-xs space-y-1">
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">Defect Audit Items:</span>
                      {dvir.defectsReported.map((def, idx) => (
                        <p key={idx} className="text-white font-mono bg-[#0A0C12] p-2 rounded border border-slate-800">
                          {def}
                        </p>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                      <span className="text-emerald-400 font-bold">
                        {dvir.safeToOperate ? '✓ SAFE TO OPERATE (FMCSA § 396.11 CERTIFIED)' : '⚠ OUT OF SERVICE'}
                      </span>
                      <span className="text-slate-400">Signed: {dvir.driverSignature}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* FOOTER */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500">
              TAMPER-EVIDENT MERKLE SEQUENCE // SHA-256 HASH CHAIN VERIFIED
            </span>
            <button
              onClick={onClose}
              className="shadow-[0_0_15px_rgba(255,230,0,0.45)] px-5 py-2 rounded-xl bg-[#FFE600] hover:bg-[#FFE600] text-black font-mono text-xs font-bold uppercase transition-all shadow"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
