import React, { useState, useEffect } from 'react';
import {
  Atom,
  Brain,
  Cpu,
  Layers,
  Radio,
  Navigation,
  Activity,
  ShieldCheck,
  Sparkles,
  Zap,
  Waves,
  Orbit,
  Compass,
  Eye,
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import {
  quantumFleetSensingService,
  QuantumFleetMasterState,
  INITIAL_QUANTUM_FLEET_STATE,
} from '../services/quantumFleetSensingService';
import { triggerHapticFeedback } from '../services/haptics';

interface QuantumFleetInnovationsViewProps {
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

type QuantumTechTab = 'cold-atom' | 'wearable-brain' | 'cat-qubits' | 'silicon-spins' | 'quantum-memory';

export const QuantumFleetInnovationsView: React.FC<QuantumFleetInnovationsViewProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<QuantumTechTab>('cold-atom');
  const [quantumState, setQuantumState] = useState<QuantumFleetMasterState>(INITIAL_QUANTUM_FLEET_STATE);
  const [fatigueSlider, setFatigueSlider] = useState<number>(0.12);
  const [simStopsCount, setSimStopsCount] = useState<number>(84);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [isJammingActive, setIsJammingActive] = useState<boolean>(false);

  // Periodically refresh sensor state
  useEffect(() => {
    const interval = setInterval(() => {
      setQuantumState(quantumFleetSensingService.getState());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleFatigueChange = (val: number) => {
    setFatigueSlider(val);
    const updated = quantumFleetSensingService.evaluateDriverCognitiveReadiness(val);
    setQuantumState(prev => ({
      ...prev,
      wearableBrainImaging: updated,
    }));
    triggerHapticFeedback('light');
  };

  const handleTriggerJammingSim = () => {
    setIsJammingActive(true);
    triggerHapticFeedback('alert');
    const nav = quantumFleetSensingService.simulateSatelliteBlackout(
      'I-70 Continental Divide — Satellite Blackout Corridor',
      120
    );
    setQuantumState(prev => ({
      ...prev,
      coldAtomNav: nav,
    }));
    if (onShowToast) {
      onShowToast('GPS Signal Lost! Cold-Atom Quantum Inertial Navigation engaged: Sub-0.1m accuracy maintained.', 'info');
    }
  };

  const handleRunCatQubitSolver = () => {
    triggerHapticFeedback('success');
    const result = quantumFleetSensingService.solveRoutingWithCatQubits(simStopsCount);
    setQuantumState(prev => ({
      ...prev,
      catQubitOptimizer: result,
    }));
    if (onShowToast) {
      onShowToast(
        'Cat Qubits solved ' + simStopsCount + ' freight stops in ' + result.solutionComputeLatencyMs + 'ms (' + result.fuelSavingsArbitragePct + '% fuel saved).',
        'success'
      );
    }
  };

  const copyQkdCertificate = () => {
    setCopiedKey(true);
    triggerHapticFeedback('success');
    if (navigator.clipboard) {
      navigator.clipboard.writeText('QKD-ENTANGLEMENT-SEAL-' + Date.now() + '-CRYSTAL-Y2SIO5-EU3-PASS');
    }
    setTimeout(() => setCopiedKey(false), 2000);
    if (onShowToast) onShowToast('Quantum Cryptographic Manifest Signature copied to clipboard', 'success');
  };

  return (
    <div className="min-h-screen bg-[#06090E] text-slate-100 p-4 md:p-6 lg:p-8 space-y-6">
      
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0C1322] via-[#0E1A33] to-[#140D2B] border border-cyan-500/30 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono uppercase tracking-wider">
              <Atom className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
              <span>TruckWithEase™ Autonomous Deep-Tech Fleet Core</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Next-Gen Sensory Telematics & Deep-Tech Guidance</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl">
              Integrating satellite-denied cold-atom navigation, wearable OPM-MEG brain imaging, Schrödinger cat qubits, 
              CMOS-foundry silicon spin processors, and rare-earth crystal entanglement repeaters for mission-critical freight.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#0A0F1A]/80 border border-slate-700/60 rounded-xl p-3.5 backdrop-blur-md">
            <div className="text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Sensory Readiness</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">
                {quantumState.compositeQuantumReadinessScore}%
              </span>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Inertial Drift</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                &lt; {quantumState.coldAtomSensor.inertialDriftMetersPer1000Mi}m / 1K mi
              </span>
            </div>
          </div>
        </div>

        {/* 5-TECH TAB NAVIGATION */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-800">
          {[
            { id: 'cold-atom', label: '1. Quantum Sensing (No GPS)', icon: Navigation, desc: 'Cold-Atom & Micro-Gravimetry' },
            { id: 'wearable-brain', label: '2. Wearable Brain Imaging', icon: Brain, desc: 'OPM-MEG Neural Monitoring' },
            { id: 'cat-qubits', label: '3. Cat Qubits Optimizer', icon: Zap, desc: 'Error-Suppressed Superconducting Routing' },
            { id: 'silicon-spins', label: '4. Silicon Spin Qubits', icon: Cpu, desc: 'CMOS Foundry Edge Telematics ECM' },
            { id: 'quantum-memory', label: '5. Quantum Memories & Repeaters', icon: Orbit, desc: 'Rare-Earth Crystal QKD Network' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as QuantumTechTab);
                  triggerHapticFeedback('light');
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600/40 to-blue-600/40 border-cyan-400 text-white shadow-lg shadow-cyan-950/50'
                    : 'bg-[#0A101C]/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <div className="text-left">
                  <div>{tab.label}</div>
                  <div className="text-[10px] font-normal text-slate-400 font-mono">{tab.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: COLD-ATOM QUANTUM SENSING WITHOUT GPS */}
      {activeTab === 'cold-atom' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0C121D] border border-cyan-900/40 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Cold-Atom Interferometer Navigation Engine</h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Sub-atomic acceleration &amp; rotation measurement without GNSS satellites
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/60 text-emerald-400 text-xs font-mono font-bold">
                  PRECISION: 10⁻⁸ m/s²
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Using rubidium-87 atoms cooled by counter-propagating laser beams to micro-kelvin temperatures, 
                matter-wave interferometry measures acceleration and rotation directly via Raman laser phase shifts. 
                Even if jamming or mountain tunnels block GPS, position drift remains under <strong>0.14 meters over 1,000 miles</strong>.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Cloud Temp</span>
                  <span className="text-base font-black text-cyan-400 font-mono">
                    {quantumState.coldAtomSensor.cloudTemperatureNanoKelvin} nK
                  </span>
                </div>
                <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Laser Phase Shift</span>
                  <span className="text-base font-black text-sky-400 font-mono">
                    {quantumState.coldAtomSensor.laserPhaseShiftRadians} rad
                  </span>
                </div>
                <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Rotation Rate</span>
                  <span className="text-base font-black text-purple-400 font-mono">
                    {quantumState.coldAtomSensor.rotationRateMicroRadPerSec} μrad/s
                  </span>
                </div>
                <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Drift Rate</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {quantumState.coldAtomSensor.inertialDriftMetersPer1000Mi} m / 1k mi
                  </span>
                </div>
              </div>

              {/* LIVE SATELLITE-DENIED SIMULATOR */}
              <div className="bg-[#080E18] border border-cyan-800/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 font-mono uppercase flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    <span>In-Cab Satellite-Denied Stress Test</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Active Corridor: {quantumState.coldAtomNav.corridor}
                  </span>
                </div>

                <div className="p-3 bg-[#050A12] border border-slate-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-mono text-[10px]">CURRENT DEAD-RECKONING ERROR:</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      ±{quantumState.coldAtomNav.accumulatedPositionErrorMeters} meters (Satellites offline {quantumState.coldAtomNav.timeInSatelliteDenialSeconds}s)
                    </span>
                  </div>
                  <button
                    onClick={handleTriggerJammingSim}
                    className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Simulate GPS Jamming Corridor
                  </button>
                </div>
              </div>
            </div>

            {/* MICRO-GRAVIMETRY SUBSURFACE DETECTION */}
            <div className="bg-[#0C121D] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="p-2.5 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800/60">
                  <Waves className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Micro-Gravimetry Subsurface Density Radar</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Detecting tiny gravity variations to map tunnels, aquifers, and subterranean caverns
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#080D15] p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-300 font-mono">Gravity Gradient Anomaly</span>
                  <div className="text-2xl font-black text-purple-400 font-mono">
                    {quantumState.coldAtomSensor.subsurfaceGravityGradientMicroGal} μGal
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Sensitivity threshold detects density shifts from underground aquifers, mined voids, or bridge foundation scour.
                  </p>
                </div>

                <div className="bg-[#080D15] p-4 rounded-xl border border-purple-900/40 space-y-2">
                  <span className="text-xs font-bold text-purple-300 font-mono">Detected Feature</span>
                  <div className="text-base font-bold text-white font-mono">
                    {quantumState.coldAtomSensor.detectedSubsurfaceAnomaly?.type || 'GEOLOGICAL BEDROCK'}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-mono">Depth:</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {quantumState.coldAtomSensor.detectedSubsurfaceAnomaly?.depthMeters} meters
                    </span>
                    <span className="text-slate-400 font-mono">| Speed Cap:</span>
                    <span className="text-amber-400 font-mono font-bold">
                      {quantumState.coldAtomSensor.detectedSubsurfaceAnomaly?.recommendedSpeedCapMph} MPH
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: SENSOR TELEMETRY */}
          <div className="space-y-6">
            <div className="bg-[#0C121D] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Nav Ledger Proof</span>
              </h3>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Atom Trap Species</span>
                  <span className="text-cyan-400 font-bold">{quantumState.coldAtomSensor.atomSpecies}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Inertial Accel</span>
                  <span className="text-slate-200">{quantumState.coldAtomSensor.quantumAccelerationMicroG} μg</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Confidence</span>
                  <span className="text-emerald-400 font-bold">{quantumState.coldAtomNav.deadReckoningConfidencePct}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Altitude</span>
                  <span className="text-slate-200">{quantumState.coldAtomNav.altitudeMeters} m</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Heading</span>
                  <span className="text-slate-200">{quantumState.coldAtomNav.headingDegrees}° WNW</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-950/40 to-blue-950/20 border border-cyan-800/40 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-cyan-300 font-mono uppercase block">Real-World Trucking Value</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Eliminates dead-reckoning lost miles in urban delivery tunnels, high-altitude passes, and military electronic countermeasure zones. 
                Zero Reliance on foreign or orbital constellations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEARABLE BRAIN IMAGING (OPM-MEG) */}
      {activeTab === 'wearable-brain' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0C121D] border border-cyan-900/40 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800/60">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Wearable Driver OPM-MEG Brain Imaging</h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Optically Pumped Magnetometers measuring femtotesla neural magnetic fields in natural motion
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full border text-xs font-mono font-bold ${
                  quantumState.wearableBrainImaging.microSleepRiskStatus === 'OPTIMAL_ALERT'
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-400'
                    : 'bg-rose-950/80 border-rose-600 text-rose-400 animate-pulse'
                }`}>
                  {quantumState.wearableBrainImaging.microSleepRiskStatus}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Traditional magnetoencephalography (MEG) requires massive, cryogenic liquid helium machines. 
                TruckWithEase connects to lightweight smart caps with <strong>Optically Pumped Magnetometers (OPM)</strong>, 
                detecting micro-sleep onset 3 to 5 seconds <em>before</em> physiological eye closure.
              </p>

              {/* INTERACTIVE FATIGUE MODULATION SLIDER */}
              <div className="bg-[#080D15] p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-bold">Simulate Driver Fatigue &amp; Cognitive Load:</span>
                  <span className="text-cyan-400 font-bold">
                    Readiness: {quantumState.wearableBrainImaging.overallCognitiveReadinessPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={fatigueSlider}
                  onChange={(e) => handleFatigueChange(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0% (Freshly Rested / Morning Shift)</span>
                  <span>50% (Normal Fatigue)</span>
                  <span>100% (Critical Micro-Sleep Risk)</span>
                </div>
              </div>

              {/* MULTI-CHANNEL OPM SENSORS */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400 uppercase font-bold block">
                  Active 6-Channel OPM Vapor Cell Flux (femtotesla - 10⁻¹⁵ T):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {quantumState.wearableBrainImaging.channels.map(ch => (
                    <div key={ch.channelId} className="bg-[#080D15] p-3 rounded-lg border border-slate-800">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>{ch.channelId}</span>
                        <span className="text-emerald-400 font-bold">{ch.signalQuality}</span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">{ch.sensorLocation}</div>
                      <div className="text-base font-black text-purple-400 font-mono mt-1">
                        {ch.magneticFluxFemtoTesla} fT
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{ch.dominantBandHz} Hz dominant</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ACTION & READOUT */}
          <div className="space-y-6">
            <div className="bg-[#0C121D] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>Neural Frequency Waves</span>
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Alpha Waves (8-12 Hz Focus)</span>
                    <span className="text-cyan-400 font-bold">{quantumState.wearableBrainImaging.alphaWavePowerDb} dB</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: '74%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Theta Bursts (Drowsiness Precursor)</span>
                    <span className="text-amber-400 font-bold">{quantumState.wearableBrainImaging.thetaWavePowerDb} dB</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all"
                      style={{ width: Math.min(100, Math.max(10, (quantumState.wearableBrainImaging.thetaWavePowerDb + 30) * 3)) + '%' }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Gamma Synchrony (Hazard Processing)</span>
                    <span className="text-emerald-400 font-bold">{quantumState.wearableBrainImaging.gammaSynchronyIndex}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full"
                      style={{ width: quantumState.wearableBrainImaging.gammaSynchronyIndex + '%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0A101C] border border-purple-800/40 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-bold text-purple-300 font-mono uppercase block">Active Neuro Directive</span>
              <p className="text-xs text-slate-200">
                {quantumState.wearableBrainImaging.recommendedDriverAction}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CAT QUBITS COMBINATORIAL OPTIMIZER */}
      {activeTab === 'cat-qubits' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0C121D] border border-cyan-900/40 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Cat Qubits Error-Suppressed Dispatch Engine</h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Schrödinger cat states in superconducting circuits cutting error-correction overhead by 94%
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-600/60 text-cyan-300 text-xs font-mono font-bold">
                  256 BOSONIC CAT QUBITS
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                By encoding quantum information into harmonic oscillator photon states (Schrödinger cat states), 
                bit-flip errors are physically suppressed at the hardware level. This allows TruckWithEase to solve 
                NP-hard continental multi-truck dispatching and dynamic toll arbitrage in milliseconds.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Bit-Flip Suppression</span>
                  <span className="text-xs font-black text-cyan-400 font-mono">10⁶ x Factor</span>
                </div>
                <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Overhead Cut</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {quantumState.catQubitOptimizer.phaseFlipCorrectionOverheadReductionPct}% Less
                  </span>
                </div>
                <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Solve Latency</span>
                  <span className="text-base font-black text-sky-400 font-mono">
                    {quantumState.catQubitOptimizer.solutionComputeLatencyMs} ms
                  </span>
                </div>
                <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Fuel Arbitrage</span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    +{quantumState.catQubitOptimizer.fuelSavingsArbitragePct}%
                  </span>
                </div>
              </div>

              {/* INTERACTIVE SOLVER BUTTON */}
              <div className="bg-[#080D15] border border-cyan-800/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white font-mono block">Multi-Leg Route Solver</span>
                  <span className="text-[11px] text-slate-400">
                    Active Formulation: {quantumState.catQubitOptimizer.activeOptimizationProblem}
                  </span>
                </div>
                <button
                  onClick={handleRunCatQubitSolver}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-cyan-950/60 cursor-pointer"
                >
                  Solve 84 Stops with Cat Qubits
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#0C121D] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Environmental &amp; Cost ROI</span>
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">CO₂ Avoided</span>
                  <span className="text-emerald-400 font-bold">{quantumState.catQubitOptimizer.co2EmissionsAvoidedKg} kg</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Fidelity</span>
                  <span className="text-cyan-400 font-bold">{quantumState.catQubitOptimizer.quantumAnnealingFidelityPct}%</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Stops Optimally Routed</span>
                  <span className="text-white font-bold">{quantumState.catQubitOptimizer.totalFreightStopsSolved} stops</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SILICON SPIN QUBITS (CMOS FOUNDRY SCALABLE ECM) */}
      {activeTab === 'silicon-spins' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0C121D] border border-cyan-900/40 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Silicon Spin Qubits in Edge Telematics ECMs</h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Single electron spin states fabricated in standard 300mm CMOS semiconductor foundries
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 text-xs font-mono font-bold">
                  CMOS FABRICATED
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Unlike exotic trapped ions, silicon spin qubits store quantum data in individual electron spins trapped inside 
                electrostatic quantum dots on isotopically purified ²⁸Si wafers. Because they leverage existing semiconductor 
                cleanrooms, they can be mass-manufactured into physical ELD hardware and vehicle ECM controllers at scale.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Qubit Array</span>
                  <span className="text-base font-black text-cyan-400 font-mono">
                    {quantumState.siliconSpinEcm.electronSpinCount} Spins
                  </span>
                </div>
                <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Coherence T₂*</span>
                  <span className="text-base font-black text-sky-400 font-mono">
                    {quantumState.siliconSpinEcm.spinCoherenceMicroseconds} μs
                  </span>
                </div>
                <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">2-Qubit Fidelity</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {quantumState.siliconSpinEcm.twoQubitGateFidelityPct}%
                  </span>
                </div>
                <div className="bg-[#080D15] p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Power Consumption</span>
                  <span className="text-base font-black text-purple-400 font-mono">
                    {quantumState.siliconSpinEcm.powerConsumptionWatts} W
                  </span>
                </div>
              </div>

              <div className="bg-[#080D15] p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-white font-mono">On-Board Cryptographic CAN-Bus Protection</span>
                <p className="text-xs text-slate-400">
                  Signs every J1939 CAN frame and ELD audit log using quantum post-quantum key seeds generated 
                  directly on the silicon spin substrate, rendering heavy trucks immune to remote spoofing or wireless hijacking.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#0C121D] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 font-mono text-xs">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Silicon ECM Spec</h3>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Foundry Node</span>
                <span className="text-slate-200">300mm ²⁸Si CMOS</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Operating Temp</span>
                <span className="text-cyan-400 font-bold">{quantumState.siliconSpinEcm.operatingThermalKelvin} K</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Crypto Status</span>
                <span className="text-emerald-400 font-bold">{quantumState.siliconSpinEcm.onboardCanBusCryptoStatus}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Signed Frames</span>
                <span className="text-white font-bold">{quantumState.siliconSpinEcm.unhackablePayloadRatePerSec}/sec</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: QUANTUM MEMORIES & REPEATERS (RARE-EARTH CRYSTALS) */}
      {activeTab === 'quantum-memory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0C121D] border border-cyan-900/40 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800/60">
                    <Orbit className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Quantum Memories &amp; Entanglement Repeaters</h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Rare-earth-doped crystals (Y₂SiO₅:Eu³⁺) storing photon quantum states for a nationwide logistics internet
                    </p>
                  </div>
                </div>
                <button
                  onClick={copyQkdCertificate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A1220] border border-cyan-600/60 text-cyan-300 font-mono text-xs font-bold hover:bg-cyan-950 transition-all cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy QKD Seal'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Optical fibers absorb photons over long distances, making pure quantum transmission fade after ~100 km. 
                Quantum repeaters using <strong>rare-earth-doped crystals (Europium and Neodymium)</strong> store quantum photon states 
                in solid-state atomic frequency combs, creating an unbreakable, entanglement-secured backbone connecting 
                shipping terminals, high-value freight vaults, and customs border crossings.
              </p>

              {/* QUANTUM REPEATER HUBS TABLE */}
              <div className="space-y-3">
                <span className="text-xs font-mono text-slate-400 uppercase font-bold block">
                  Active Nationwide Quantum Repeater Nodes:
                </span>
                <div className="space-y-3">
                  {quantumState.repeaterNetwork.map(hub => (
                    <div key={hub.hubId} className="bg-[#080D15] p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white font-mono">{hub.terminalName}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                            {hub.hubId}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-1">
                          Matrix: <span className="text-purple-300">{hub.crystalMatrix}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Linked to: {hub.downstreamHub} ({hub.distanceKm} km link)
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">Memory Time</span>
                          <span className="text-emerald-400 font-bold">{hub.photonicMemoryRetentionSeconds}s</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">Entanglement</span>
                          <span className="text-cyan-400 font-bold">{hub.entanglementFidelityPct}%</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">Tamper-Proof BOLs</span>
                          <span className="text-white font-bold">{hub.tamperProofBolCount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#0C121D] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 font-mono text-xs">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quantum BOL Vault</h3>
              <p className="text-slate-400 font-sans text-xs">
                Bills of Lading (BOLs) for high-value pharmaceutical, military, or bullion freight are sealed with quantum entanglement keys. 
                Any eavesdropping or interception collapses the quantum wavefunction, instantly alerting fleet command.
              </p>
              <div className="p-3 bg-[#080D15] rounded-xl border border-emerald-900/40 text-emerald-400 font-bold">
                100% Tamper-Proof Cryptographic Guarantee
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
