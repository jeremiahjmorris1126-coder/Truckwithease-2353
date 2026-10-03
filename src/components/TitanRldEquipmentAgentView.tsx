import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Activity,
  Cpu,
  RefreshCw,
  Send,
  Radio,
  Sliders,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Flame,
  Thermometer,
  Disc,
  LifeBuoy,
  FileWarning,
  Sparkles,
  ArrowRight,
  Clock,
  DollarSign,
  HelpCircle,
  Truck,
  RotateCcw,
  Mic,
  MicOff,
  ChevronUp,
  ChevronDown,
  X,
  ExternalLink,
  CornerDownLeft,
} from 'lucide-react';
import {
  TruckRldSnapshot,
  J1939DiagnosticFaultCode,
  EquipmentAgentDiagnosticResponse,
  TabType,
} from '../types';
import { triggerHapticFeedback } from '../services/haptics';
import { TruckWithEaseLogo } from './TruckWithEaseLogo';

interface TitanRldEquipmentAgentViewProps {
  onNavigateToTab?: (tab: TabType) => void;
}

export const TitanRldEquipmentAgentView: React.FC<TitanRldEquipmentAgentViewProps> = ({
  onNavigateToTab,
}) => {
  const [rld, setRld] = useState<TruckRldSnapshot | null>(null);
  const [loadingRld, setLoadingRld] = useState(true);
  const [userQuestion, setUserQuestion] = useState('');
  const [faultInput, setFaultInput] = useState('');
  const [diagnosing, setDiagnosing] = useState(false);
  const [currentDiagnosis, setCurrentDiagnosis] =
    useState<EquipmentAgentDiagnosticResponse | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('ALL');

  // Persistent Footer & Voice State
  const diagnosisRef = useRef<HTMLDivElement>(null);
  const footerInputRef = useRef<HTMLInputElement>(null);
  const [isFooterDrawerOpen, setIsFooterDrawerOpen] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);

  // Fetch Live Truck RLD
  const fetchRldStream = async () => {
    try {
      const res = await fetch('/api/equipment-agent/rld-stream');
      if (res.ok) {
        const data = await res.json();
        setRld(data.rld);
      }
    } catch (err) {
      console.error('Failed to fetch RLD stream:', err);
    } finally {
      setLoadingRld(false);
    }
  };

  useEffect(() => {
    fetchRldStream();
    const interval = setInterval(fetchRldStream, 8000);
    return () => clearInterval(interval);
  }, []);

  // Submit Question to TITAN-RLD-1 Agent
  const handleAskAgent = async (overrideQuestion?: string, overrideCode?: string, scrollToCard: boolean = false) => {
    const q = overrideQuestion !== undefined ? overrideQuestion : userQuestion;
    const c = overrideCode !== undefined ? overrideCode : faultInput;
    if (!q && !c) return;

    triggerHapticFeedback('subtle');
    setDiagnosing(true);
    setActionNotice(null);

    try {
      const res = await fetch('/api/equipment-agent/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          faultCodeInput: c,
          currentRldContext: rld || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentDiagnosis(data.diagnosis);
        setIsFooterDrawerOpen(true);
        triggerHapticFeedback('double');
        if (scrollToCard) {
          setTimeout(() => {
            diagnosisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        }
      }
    } catch (err) {
      console.error('Diagnosis failed:', err);
      setActionNotice('Connection to TITAN diagnostic core interrupted.');
    } finally {
      setDiagnosing(false);
    }
  };

  // Browser Speech-to-Text Dictation
  const handleVoiceListen = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setActionNotice('Voice speech recognition not supported in this browser. Please type query.');
      return;
    }

    try {
      if (isListeningVoice) {
        setIsListeningVoice(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListeningVoice(true);
      triggerHapticFeedback('subtle');
      setActionNotice('🎤 Listening for equipment symptom or code...');

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserQuestion(transcript);
        setIsListeningVoice(false);
        setActionNotice(`Dictated: "${transcript}". Click 'Ask Agent' or hit Enter to analyze.`);
        triggerHapticFeedback('subtle');
        footerInputRef.current?.focus();
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListeningVoice(false);
        setActionNotice('Speech recognition ended.');
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
      setIsListeningVoice(false);
    }
  };

  // Clear DTCs (with statutory warning)
  const handleClearDtcs = async () => {
    triggerHapticFeedback('alert');
    try {
      const res = await fetch('/api/equipment-agent/clear-dtc', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setRld(data.rld);
        setActionNotice(data.statutoryNotice);
        setCurrentDiagnosis(null);
      }
    } catch (err) {
      console.error('Failed to clear DTCs:', err);
    }
  };

  // Simulate Road Fault Injection
  const handleSimulateFault = async (faultType: string) => {
    triggerHapticFeedback('double');
    try {
      const res = await fetch('/api/equipment-agent/trigger-fault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faultType }),
      });
      if (res.ok) {
        const data = await res.json();
        setRld(data.rld);
        setActionNotice(`Injected road condition: ${faultType}. TITAN-RLD-1 analyzing sensor telemetry...`);
        // Auto-diagnose the injected fault
        if (faultType === 'AIR_LEAK') {
          handleAskAgent('Air pressure is bleeding down past 60 PSI, buzzer is buzzing!', 'SPN 843 FMI 1');
        } else if (faultType === 'DEF_DERATE') {
          handleAskAgent('DEF warning lamp flashing, dash says 5 MPH derate in 30 minutes!', 'SPN 5246 FMI 0');
        } else if (faultType === 'STEER_TREAD') {
          handleAskAgent('Right steer tire tread is 3/32 inch, can I cross the state line scale?');
        }
      }
    } catch (err) {
      console.error('Fault simulation failed:', err);
    }
  };

  const hasCriticalOos =
    rld?.activeDtcs.some((d) => d.cvsaOutOfServiceRisk) ||
    (rld && (rld.primaryAirTankPsi < 60 || rld.steerRightTreadDepth32nds < 4));

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-48 sm:pb-40 lg:pb-36">
      {/* Top Header & Mission Statement Banner */}
      <div className="bg-gradient-to-r from-[#181105] via-[#121212] to-[#0D1520] border-2 border-[#D4AF37]/50 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Wrench className="w-64 h-64 text-[#D4AF37]" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <TruckWithEaseLogo size="sm" showWordmark={false} />
              <span className="px-2.5 py-0.5 bg-[#D4AF37] text-black font-mono text-xs font-black uppercase tracking-widest rounded">
                #1 DEDICATED AGENT
              </span>
              <span className="text-xs font-mono text-[#D4AF37] font-bold tracking-wider">
                TITAN-RLD-01 RIG MASTER
              </span>
              <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-mono text-[10px] uppercase font-bold rounded flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                RLD CAN-BUS TELEMETRY ONLINE
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-2 flex items-center gap-3">
              Master Equipment & Diagnostics Agent
            </h1>
            <p className="text-xs sm:text-sm font-mono text-amber-200/80 max-w-3xl mt-1">
              <strong>Motto: NO FEAR. NO MESS. 100% HONESTY & ACCURACY.</strong> Answering all heavy-duty
              rig mechanical, electrical, and pneumatic issues with zero sugar-coating. Citing exact CVSA Out-Of-Service (OOS) criteria and 49 CFR Part 393/396 statutes.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={fetchRldStream}
              disabled={loadingRld}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1E1E1E] hover:bg-[#2A2A2A] border border-[#333] text-white font-mono text-xs font-bold uppercase rounded transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingRld ? 'animate-spin' : ''}`} />
              <span>Poll RLD Sensors</span>
            </button>

            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('quantum-compliance')}
                className="flex items-center gap-1.5 px-3 py-2 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500 text-cyan-300 font-mono text-xs font-bold uppercase rounded transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Predictive DOT Scenarios</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Rig Identity Strip */}
        {rld && (
          <div className="mt-4 pt-4 border-t border-[#333] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-mono">
            <div className="bg-black/40 border border-[#222] p-2 rounded">
              <span className="text-[10px] text-[#888] block uppercase">Assigned Tractor</span>
              <span className="font-bold text-white text-sm">{rld.tractorId}</span>
            </div>
            <div className="bg-black/40 border border-[#222] p-2 rounded">
              <span className="text-[10px] text-[#888] block uppercase">Engine Make</span>
              <span className="font-bold text-amber-300">{rld.engineMake}</span>
            </div>
            <div className="bg-black/40 border border-[#222] p-2 rounded">
              <span className="text-[10px] text-[#888] block uppercase">Odometer</span>
              <span className="font-bold text-white">{rld.odometerMiles.toLocaleString()} mi</span>
            </div>
            <div className="bg-black/40 border border-[#222] p-2 rounded">
              <span className="text-[10px] text-[#888] block uppercase">Operating Hours</span>
              <span className="font-bold text-white">{rld.engineHours.toFixed(1)} hrs</span>
            </div>
            <div className="bg-black/40 border border-[#222] p-2 rounded">
              <span className="text-[10px] text-[#888] block uppercase">Road Speed / RPM</span>
              <span className="font-bold text-white">{rld.roadSpeedMph} MPH / {rld.engineRpm}</span>
            </div>
            <div className="bg-black/40 border border-[#222] p-2 rounded">
              <span className="text-[10px] text-[#888] block uppercase">CVSA Status</span>
              <span
                className={`font-bold uppercase ${
                  hasCriticalOos ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                }`}
              >
                {hasCriticalOos ? 'CRITICAL OOS HAZARD' : 'ROAD COMPLIANT'}
              </span>
            </div>
          </div>
        )}
      </div>

      {actionNotice && (
        <div className="bg-amber-950/60 border border-amber-500/60 text-amber-200 text-xs font-mono p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-[#888] hover:text-white text-xs font-mono uppercase ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Interactive Diagnostic Terminal & Live RLD Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: The #1 Honest Equipment Diagnostic Terminal (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Ask The #1 Agent Console */}
          <div className="bg-[#121212] border border-[#262626] rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  Direct Equipment Problem & Suggestion Terminal
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#888] uppercase bg-[#1A1A1A] px-2 py-0.5 rounded border border-[#333]">
                Zero Sugar-Coating
              </span>
            </div>

            <p className="text-xs font-mono text-[#AAA]">
              Describe any mechanical symptom, warning buzzer, loss of power, strange odor, or type an SAE J1939 fault code (SPN / FMI). TITAN-RLD-1 will deliver a brutally honest, safety-first technical assessment.
            </p>

            {/* Quick-Diagnosis Roadside Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[#888] uppercase font-bold tracking-wider">
                Common Roadside Panics (Click to Analyze Instantly):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    label: 'DEF 5-MPH Derate Warning',
                    q: 'DEF indicator light is flashing and dash displays 5 MPH severe derate countdown!',
                    code: 'SPN 5246 FMI 0',
                  },
                  {
                    label: 'Air Pressure Dropping (<60 PSI Buzzer)',
                    q: 'Air pressure dropping rapidly below 60 PSI, low air buzzer is sounding continuously!',
                    code: 'AIR-BRAKE-FAIL',
                  },
                  {
                    label: 'DPF Delta Pressure High',
                    q: 'Check engine light on, DPF soot gauge at 85%, soot load high code active.',
                    code: 'SPN 3251 FMI 0',
                  },
                  {
                    label: 'Steer Tire 3/32" Tread Edge',
                    q: 'Right steer tire has 3/32" tread on outside rib, will I pass CVSA Level 1 inspection?',
                    code: 'STEER-TREAD',
                  },
                  {
                    label: 'High Coolant Temp on 6% Grade',
                    q: 'Detroit DD15 coolant temperature is at 226°F climbing a 6% mountain grade under 79,000 lbs load!',
                    code: 'SPN 111 FMI 1',
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setUserQuestion(item.q);
                      setFaultInput(item.code);
                      handleAskAgent(item.q, item.code);
                    }}
                    className="text-[11px] font-mono px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#282828] border border-[#333] hover:border-[#D4AF37] text-white rounded transition-all text-left"
                  >
                    ⚡ {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <div className="space-y-3 pt-2 border-t border-[#222]">
              {diagnosing && (
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 py-1.5 px-3 bg-amber-500/10 border border-amber-500/30 rounded animate-pulse">
                  <Cpu className="w-3.5 h-3.5 animate-spin text-[#D4AF37] shrink-0" />
                  <span>TITAN-RLD-1 AGENT DIAGNOSTIC CORE RUNNING: Evaluating CAN bus telematics & CVSA Out-of-Service standards...</span>
                </div>
              )}
              <div>
                <label className="text-[10px] font-mono text-[#888] uppercase block mb-1">
                  What is happening with the rig? (Symptom, noise, odor, performance drop):
                </label>
                <textarea
                  id="titan-ask-agent-main-textarea"
                  rows={3}
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  disabled={diagnosing}
                  placeholder="e.g. Engine sounds normal but when I step on the foot brake, primary air drops 8 PSI in 20 seconds. Also smelled burnt lining on drive axle..."
                  className={`w-full border rounded p-3 text-sm font-mono outline-none transition-all ${
                    diagnosing
                      ? 'titan-diagnostic-pulse bg-[#120F08] border-[#D4AF37] ring-2 ring-[#D4AF37]/50 text-amber-200 placeholder:text-amber-400/70 shadow-[0_0_20px_rgba(212,175,55,0.25)]'
                      : 'bg-[#0A0A0A] border-[#333] text-white focus:border-[#D4AF37]'
                  }`}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-mono text-[#888] uppercase block mb-1">
                    J1939 Fault Code (SPN / FMI or text, optional):
                  </label>
                  <input
                    type="text"
                    value={faultInput}
                    onChange={(e) => setFaultInput(e.target.value)}
                    disabled={diagnosing}
                    placeholder="e.g. SPN 3251 FMI 0 or SPN 5246"
                    className={`w-full border rounded px-3 py-2 text-sm font-mono outline-none transition-all ${
                      diagnosing
                        ? 'titan-diagnostic-pulse bg-[#120F08] border-[#D4AF37] text-amber-200 placeholder:text-amber-400/60'
                        : 'bg-[#0A0A0A] border-[#333] text-white focus:border-[#D4AF37]'
                    }`}
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => handleAskAgent()}
                    disabled={diagnosing || (!userQuestion && !faultInput)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-white text-black font-mono text-xs font-black uppercase tracking-wider rounded transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                  >
                    <Send className={`w-4 h-4 ${diagnosing ? 'animate-spin' : ''}`} />
                    <span>{diagnosing ? 'ANALYZING CAN SENSORS...' : 'ASK #1 RIG AGENT'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnosis Result Card */}
          {currentDiagnosis && (
            <div
              ref={diagnosisRef}
              id="titan-full-diagnosis-card"
              className={`border-2 rounded-xl p-5 shadow-2xl space-y-4 transition-all scroll-mt-24 ${
                currentDiagnosis.honestyVerdict === 'IMMEDIATE_OUT_OF_SERVICE'
                  ? 'bg-gradient-to-b from-red-950/40 to-[#121212] border-red-500'
                  : currentDiagnosis.honestyVerdict === 'RESTRICTED_LIMP_ONLY'
                  ? 'bg-gradient-to-b from-amber-950/40 to-[#121212] border-amber-500'
                  : 'bg-gradient-to-b from-emerald-950/40 to-[#121212] border-emerald-500'
              }`}
            >
              {/* Verdict Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#333]">
                <div className="flex items-center gap-3">
                  {currentDiagnosis.honestyVerdict === 'IMMEDIATE_OUT_OF_SERVICE' ? (
                    <AlertOctagon className="w-8 h-8 text-red-500 shrink-0 animate-pulse" />
                  ) : currentDiagnosis.honestyVerdict === 'RESTRICTED_LIMP_ONLY' ? (
                    <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-black uppercase tracking-widest ${
                        currentDiagnosis.honestyVerdict === 'IMMEDIATE_OUT_OF_SERVICE'
                          ? 'bg-red-500 text-white'
                          : currentDiagnosis.honestyVerdict === 'RESTRICTED_LIMP_ONLY'
                          ? 'bg-amber-500 text-black'
                          : 'bg-emerald-500 text-black'
                      }`}
                    >
                      {currentDiagnosis.honestyVerdict.replace(/_/g, ' ')}
                    </span>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mt-1">
                      {currentDiagnosis.verdictTitle}
                    </h3>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-[10px] text-[#888] block uppercase">Statutory Authority</span>
                  <span className="text-xs font-bold text-amber-300">
                    {currentDiagnosis.fmcsaCitation}
                  </span>
                </div>
              </div>

              {/* Verdict Summary */}
              <div className="p-3 bg-black/60 border border-[#333] rounded-lg">
                <div className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider mb-1">
                  // UNFILTERED HONEST VERDICT:
                </div>
                <p className="text-sm font-mono text-white font-medium leading-relaxed">
                  {currentDiagnosis.verdictSummary}
                </p>
              </div>

              {/* Root Cause Analysis */}
              <div className="space-y-1 font-mono text-xs">
                <span className="text-[10px] text-[#888] uppercase font-bold tracking-wider">
                  Root Cause Mechanical / Electrical Failure:
                </span>
                <p className="text-[#CCC] bg-[#161616] p-3 rounded border border-[#2A2A2A] leading-relaxed">
                  {currentDiagnosis.rootCauseAnalysis}
                </p>
              </div>

              {/* Roadside Shoulder Triage Checklist */}
              <div className="space-y-2 font-mono text-xs">
                <span className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <LifeBuoy className="w-3.5 h-3.5" />
                  Roadside Shoulder Triage Checklist (What Driver Can Do Right Now):
                </span>
                <div className="space-y-1.5">
                  {currentDiagnosis.roadsideShoulderTriage.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      className="flex items-start gap-2 bg-[#0E0E0E] p-2.5 rounded border border-[#262626]"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#222] border border-[#444] text-[#D4AF37] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {sIdx + 1}
                      </span>
                      <span className="text-[#DDD] leading-snug">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permanent Repair Directive & Specs */}
              {currentDiagnosis.permanentRepairSpecs && (
                <div className="p-3 bg-[#0C0C0C] border border-[#262626] rounded-lg font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-[#888] uppercase font-bold">
                    <span>OEM Permanent Repair Specifications</span>
                    <span className="text-[#D4AF37]">
                      Est. Shop Time: {currentDiagnosis.permanentRepairSpecs.estimatedShopHours} hrs
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#666] block">Required OEM Parts:</span>
                      <ul className="list-disc list-inside text-white space-y-0.5 mt-0.5">
                        {currentDiagnosis.permanentRepairSpecs.oemParts.map((p, pIdx) => (
                          <li key={pIdx} className="text-amber-200">
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      {currentDiagnosis.permanentRepairSpecs.torqueSpecsOrSettings && (
                        <div>
                          <span className="text-[#666] block">Torque / Setting Specs:</span>
                          <span className="text-white">
                            {currentDiagnosis.permanentRepairSpecs.torqueSpecsOrSettings}
                          </span>
                        </div>
                      )}
                      <div className="mt-1.5">
                        <span className="text-[#666] block">Estimated Cost (Parts + Labor):</span>
                        <span className="text-emerald-400 font-bold">
                          ${currentDiagnosis.permanentRepairSpecs.estimatedCostUsd.toFixed(2)} USD
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preventive Advice */}
              <div className="text-xs font-mono text-[#AAA] flex items-start gap-2 pt-1 border-t border-[#2A2A2A]">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>
                  <strong>Tactical Prevention:</strong> {currentDiagnosis.preventiveAdvice}
                </span>
              </div>
            </div>
          )}

          {/* Fault Simulation Playground for Drivers & Fleets */}
          <div className="bg-[#101010] border border-[#222] rounded-xl p-4 font-mono space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                Driver Scenario Testing: Road Fault Injector
              </span>
              <span className="text-[10px] text-[#777] uppercase">Simulate CAN-Bus Event</span>
            </div>
            <p className="text-[11px] text-[#888]">
              Test how TITAN-RLD-1 responds to critical highway breakdowns. Injects real J1939 fault telemetry directly into the active CAN stream.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleSimulateFault('AIR_LEAK')}
                className="px-3 py-2 bg-[#1A1111] hover:bg-red-950 border border-red-800/60 hover:border-red-500 text-red-300 text-xs font-bold uppercase rounded text-left transition-all"
              >
                🔴 Air Brake Bleed Down (&lt;60 PSI)
              </button>
              <button
                onClick={() => handleSimulateFault('DEF_DERATE')}
                className="px-3 py-2 bg-[#1A150A] hover:bg-amber-950 border border-amber-800/60 hover:border-amber-500 text-amber-300 text-xs font-bold uppercase rounded text-left transition-all"
              >
                🟡 DEF 5-MPH Derate Inducement
              </button>
              <button
                onClick={() => handleSimulateFault('STEER_TREAD')}
                className="px-3 py-2 bg-[#141414] hover:bg-[#202020] border border-[#333] hover:border-[#D4AF37] text-white text-xs font-bold uppercase rounded text-left transition-all"
              >
                ⚠️ Steer Tread 3/32" Violation
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live RLD Telemetry Stream & Subsystem Gauges (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Diagnostic Trouble Codes (DTCs) Box */}
          <div className="bg-[#121212] border border-[#262626] rounded-xl p-5 shadow-lg space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileWarning className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Active J1939 Fault Codes
                </h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded font-bold uppercase bg-[#1A1A1A] text-[#D4AF37] border border-[#333]">
                {rld?.activeDtcs.length || 0} ACTIVE
              </span>
            </div>

            {rld?.activeDtcs && rld.activeDtcs.length > 0 ? (
              <div className="space-y-3">
                {rld.activeDtcs.map((dtc, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded border text-xs space-y-2 ${
                      dtc.cvsaOutOfServiceRisk
                        ? 'bg-red-950/30 border-red-700/80'
                        : 'bg-amber-950/20 border-amber-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{dtc.codeStr}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          dtc.cvsaOutOfServiceRisk
                            ? 'bg-red-500 text-white'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-600'
                        }`}
                      >
                        {dtc.cvsaOutOfServiceRisk ? 'CVSA OUT-OF-SERVICE' : 'RESTRICTED LIMP'}
                      </span>
                    </div>

                    <p className="text-[#CCC] text-[11px]">{dtc.description}</p>

                    <div className="text-[10px] text-[#888]">
                      Triggered: <span className="text-white">{dtc.firstTriggered}</span> | System:{' '}
                      <span className="text-amber-300">{dtc.system}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-[#333]">
                      <button
                        onClick={() => handleAskAgent(dtc.description, dtc.codeStr)}
                        className="flex-1 py-1.5 bg-[#D4AF37] hover:bg-white text-black font-black text-[10px] uppercase rounded text-center transition-all"
                      >
                        Get Honest Triage Directive
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleClearDtcs}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#333] text-[#AAA] hover:text-white font-mono text-xs uppercase rounded transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset / Clear Diagnostic Codes</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <div className="text-xs font-bold text-emerald-300 uppercase">
                  Zero Active Fault Codes Detected
                </div>
                <div className="text-[11px] text-[#888]">
                  Detroit DD15 J1939 CAN-bus reporting 100% nominal telemetry.
                </div>
              </div>
            )}
          </div>

          {/* Real-time Subsystem Gauge Cluster */}
          {rld && (
            <div className="bg-[#121212] border border-[#262626] rounded-xl p-5 shadow-lg space-y-4 font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Live RLD Subsystem Gauges
                  </h3>
                </div>
                <span className="text-[10px] text-[#888] uppercase">49 CFR § 393 Compliant</span>
              </div>

              {/* Pneumatics & Air Brakes Gauge */}
              <div className="p-3 bg-[#0C0C0C] border border-[#222] rounded space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#888] uppercase flex items-center gap-1">
                    <Disc className="w-3.5 h-3.5 text-cyan-400" />
                    Pneumatics & Air Brakes (49 CFR § 393.47)
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      rld.primaryAirTankPsi < 60 ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {rld.primaryAirTankPsi < 60 ? 'LOW AIR BUZZER ON' : 'SYSTEM PRESSURIZED'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#141414] p-2 rounded border border-[#282828]">
                    <span className="text-[9px] text-[#777] block">PRIMARY TANK</span>
                    <span
                      className={`text-base font-bold ${
                        rld.primaryAirTankPsi < 60 ? 'text-red-400' : 'text-white'
                      }`}
                    >
                      {rld.primaryAirTankPsi} PSI
                    </span>
                    <span className="text-[9px] text-[#666] block">Cut-Out: 128 PSI</span>
                  </div>
                  <div className="bg-[#141414] p-2 rounded border border-[#282828]">
                    <span className="text-[9px] text-[#777] block">SECONDARY TANK</span>
                    <span className="text-base font-bold text-white">{rld.secondaryAirTankPsi} PSI</span>
                    <span className="text-[9px] text-[#666] block">Cut-In: 102 PSI</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#222]">
                  <span className="text-[#888]">Applied Leak Rate:</span>
                  <span
                    className={`font-bold ${
                      rld.appliedLeakageRatePsiMin > 4.0 ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {rld.appliedLeakageRatePsiMin} PSI/min (Legal Max: 4.0)
                  </span>
                </div>
              </div>

              {/* Emissions & Aftertreatment */}
              <div className="p-3 bg-[#0C0C0C] border border-[#222] rounded space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#888] uppercase flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Emissions & Aftertreatment
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold uppercase">
                    Regen: {rld.dpfRegenStatus}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div>
                    <div className="flex justify-between text-[10px] text-[#888] mb-0.5">
                      <span>DPF Soot Saturation</span>
                      <span className="text-white font-bold">{rld.dpfSootLoadPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          rld.dpfSootLoadPct > 80
                            ? 'bg-red-500'
                            : rld.dpfSootLoadPct > 50
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, rld.dpfSootLoadPct)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-[#888] mb-0.5">
                      <span>DEF Tank Level (Quality: {rld.defConcentrationPct}%)</span>
                      <span className="text-white font-bold">{rld.defLevelPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-cyan-500 rounded-full`}
                        style={{ width: `${Math.min(100, rld.defLevelPct)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Running Gear & 49 CFR § 393.75 Tire Treads */}
              <div className="p-3 bg-[#0C0C0C] border border-[#222] rounded space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#888] uppercase flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Tire Tread Depths (49 CFR § 393.75)
                  </span>
                  <span className="text-[10px] text-[#777] uppercase">DOT Steer Min: 4/32"</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                  <div className="bg-[#141414] p-1.5 rounded border border-[#282828]">
                    <span className="text-[8px] text-[#777] block">STEER L</span>
                    <span
                      className={`font-bold ${
                        rld.steerLeftTreadDepth32nds < 4 ? 'text-red-400' : 'text-white'
                      }`}
                    >
                      {rld.steerLeftTreadDepth32nds}/32"
                    </span>
                  </div>
                  <div className="bg-[#141414] p-1.5 rounded border border-[#282828]">
                    <span className="text-[8px] text-[#777] block">STEER R</span>
                    <span
                      className={`font-bold ${
                        rld.steerRightTreadDepth32nds < 4 ? 'text-red-400' : 'text-white'
                      }`}
                    >
                      {rld.steerRightTreadDepth32nds}/32"
                    </span>
                  </div>
                  <div className="bg-[#141414] p-1.5 rounded border border-[#282828]">
                    <span className="text-[8px] text-[#777] block">DRIVES</span>
                    <span className="font-bold text-white">{rld.driveTreadDepthMin32nds}/32"</span>
                  </div>
                  <div className="bg-[#141414] p-1.5 rounded border border-[#282828]">
                    <span className="text-[8px] text-[#777] block">TRAILER</span>
                    <span className="font-bold text-white">{rld.trailerTreadDepthMin32nds}/32"</span>
                  </div>
                </div>

                {rld.steerRightTreadDepth32nds < 4 && (
                  <div className="p-2 bg-red-950/40 border border-red-700/80 rounded text-[10px] text-red-300 flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>STEER TREAD OOS VIOLATION: Minimum depth 4/32" required under § 393.75(b).</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Persistent 'Ask the Agent' Footer Bar */}
      <div
        id="titan-persistent-footer"
        className="fixed bottom-16 lg:bottom-0 left-0 lg:left-64 right-0 z-30 bg-[#0B0B0D]/95 backdrop-blur-xl border-t-2 border-[#D4AF37]/50 shadow-[0_-12px_40px_rgba(0,0,0,0.92)] select-none"
      >
        {/* Quick Diagnosis Result Drawer (if active) */}
        {currentDiagnosis && isFooterDrawerOpen && (
          <div className="bg-[#121214] border-b border-[#2A2A2A] px-4 py-2.5 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-start md:items-center gap-3">
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0 ${
                  currentDiagnosis.honestyVerdict === 'IMMEDIATE_OUT_OF_SERVICE'
                    ? 'bg-red-500 text-white animate-pulse'
                    : currentDiagnosis.honestyVerdict === 'RESTRICTED_LIMP_ONLY'
                    ? 'bg-amber-500 text-black'
                    : 'bg-emerald-500 text-black'
                }`}
              >
                {currentDiagnosis.honestyVerdict.replace(/_/g, ' ')}
              </span>
              <div className="min-w-0">
                <div className="text-white font-bold truncate">
                  {currentDiagnosis.verdictTitle}
                  <span className="text-amber-400 text-[10px] ml-2 font-normal">
                    [{currentDiagnosis.fmcsaCitation}]
                  </span>
                </div>
                <div className="text-[#AAA] text-[11px] truncate max-w-3xl">
                  {currentDiagnosis.verdictSummary}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                onClick={() => {
                  diagnosisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="flex items-center gap-1 px-3 py-1 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37] text-amber-200 text-[11px] font-bold uppercase rounded transition-all"
              >
                <span>Full Specs & Parts</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsFooterDrawerOpen(false)}
                className="p-1 text-[#888] hover:text-white hover:bg-[#222] rounded transition-all"
                title="Collapse Drawer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 space-y-2">
          {/* Top Status & Quick Roadside Shortcuts */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-[11px] font-mono">
            <div className="flex items-center gap-2 shrink-0">
              <span className={`flex items-center gap-1 px-2 py-0.5 border uppercase rounded text-[10px] transition-all ${
                diagnosing
                  ? 'bg-amber-500/20 border-[#D4AF37] text-amber-300 font-black animate-pulse'
                  : 'bg-[#171717] border-[#2B2B2B] text-amber-300 font-bold'
              }`}>
                <Cpu className={`w-3 h-3 text-[#D4AF37] ${diagnosing ? 'animate-spin' : ''}`} />
                <span>TITAN-RLD-1 AGENT</span>
              </span>
              {diagnosing ? (
                <span className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  DIAGNOSTIC ENGINE ANALYZING RIG TELEMETRY...
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CAN BUS ACTIVE
                </span>
              )}
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {[
                { label: 'DEF Derate', q: 'DEF indicator light flashing, countdown to 5 MPH derate in 30 mins', code: 'SPN 5246' },
                { label: 'Air Leak <60 PSI', q: 'Air pressure dropping rapidly below 60 PSI, low air buzzer is sounding', code: 'AIR-BRAKE' },
                { label: 'Steer Tread 3/32"', q: 'Right steer tire tread is 3/32 inch, will I cross scale without OOS?', code: 'STEER-TREAD' },
                { label: 'DPF Regen Blocked', q: 'DPF soot load at 85%, check engine on, soot load high code active', code: 'SPN 3251' },
                { label: 'Coolant 226°F', q: 'Detroit DD15 coolant temperature 226°F on 6% mountain grade', code: 'SPN 111' },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  disabled={diagnosing}
                  onClick={() => {
                    setUserQuestion(chip.q);
                    setFaultInput(chip.code);
                    handleAskAgent(chip.q, chip.code, false);
                  }}
                  className="px-2 py-0.5 bg-[#171717] hover:bg-[#252525] border border-[#2B2B2B] hover:border-[#D4AF37] text-[#CCC] hover:text-white rounded text-[10px] whitespace-nowrap transition-all shrink-0 disabled:opacity-40"
                >
                  ⚡ {chip.label}
                </button>
              ))}
            </div>

            {currentDiagnosis && !isFooterDrawerOpen && (
              <button
                onClick={() => setIsFooterDrawerOpen(true)}
                className="hidden md:flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 shrink-0 font-bold underline"
              >
                <span>Latest Verdict</span>
                <ChevronUp className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Main Persistent Query Input Bar */}
          <div className="flex items-center gap-2">
            <div
              className={`flex-1 flex items-center rounded-lg px-3 py-1.5 shadow-inner transition-all ${
                diagnosing
                  ? 'titan-diagnostic-pulse bg-[#120F08] border-2 border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.25)]'
                  : 'bg-[#050505] border border-[#333] focus-within:border-[#D4AF37] focus-within:ring-1 focus-within:ring-[#D4AF37]/50'
              }`}
            >
              {diagnosing ? (
                <Cpu className="w-4 h-4 text-[#D4AF37] shrink-0 mr-2 animate-spin" />
              ) : (
                <Wrench className="w-4 h-4 text-[#D4AF37] shrink-0 mr-2" />
              )}
              <input
                ref={footerInputRef}
                id="titan-agent-persistent-input"
                type="text"
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAskAgent(undefined, undefined, false);
                  }
                }}
                disabled={diagnosing}
                placeholder={
                  diagnosing
                    ? 'TITAN-RLD-1 querying live CAN bus, J1939 protocols & CVSA Out-of-Service database...'
                    : 'Ask the Agent: Query symptoms, trouble codes, or technical equipment data...'
                }
                className={`flex-1 bg-transparent text-xs sm:text-sm font-mono outline-none min-w-0 transition-all ${
                  diagnosing
                    ? 'text-amber-200 placeholder:text-amber-400/70 font-semibold'
                    : 'text-white placeholder:text-[#666]'
                }`}
              />

              {/* Optional inline SPN/FMI code field or toggle */}
              {showCodeInput ? (
                <div className="flex items-center gap-1 pl-2 border-l border-[#2B2B2B] shrink-0">
                  <input
                    type="text"
                    value={faultInput}
                    onChange={(e) => setFaultInput(e.target.value)}
                    disabled={diagnosing}
                    placeholder="SPN/FMI"
                    className={`w-20 sm:w-28 rounded px-2 py-1 text-[11px] font-mono outline-none transition-all ${
                      diagnosing
                        ? 'titan-diagnostic-pulse bg-[#161208] border border-[#D4AF37] text-amber-200'
                        : 'bg-[#141414] border border-[#3A3A3A] text-amber-200'
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAskAgent(undefined, undefined, false);
                      }
                    }}
                  />
                  <button
                    onClick={() => setShowCodeInput(false)}
                    className="text-[#888] hover:text-white p-0.5"
                    title="Hide code field"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCodeInput(true)}
                  className="px-2 py-1 bg-[#161616] hover:bg-[#222] border border-[#333] text-[#888] hover:text-amber-200 text-[10px] font-mono uppercase rounded shrink-0 transition-all hidden sm:block"
                >
                  {faultInput ? `Code: ${faultInput}` : '+ Add Code'}
                </button>
              )}

              {/* Voice dictation button */}
              <button
                type="button"
                onClick={handleVoiceListen}
                disabled={diagnosing}
                title={isListeningVoice ? 'Listening... click to stop' : 'Voice Dictation'}
                className={`p-1.5 ml-1 rounded transition-all shrink-0 ${
                  isListeningVoice
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-[#888] hover:text-amber-300 hover:bg-[#1A1A1A] disabled:opacity-30'
                }`}
              >
                {isListeningVoice ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => handleAskAgent(undefined, undefined, false)}
              disabled={diagnosing || (!userQuestion && !faultInput)}
              className="px-4 py-2.5 bg-[#D4AF37] hover:bg-white text-black font-mono text-xs font-black uppercase tracking-wider rounded-lg transition-all disabled:opacity-40 flex items-center gap-1.5 shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.35)]"
            >
              <Send className={`w-3.5 h-3.5 ${diagnosing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {diagnosing ? 'DIAGNOSING...' : 'ASK AGENT'}
              </span>
              <span className="sm:hidden">
                {diagnosing ? '...' : 'ASK'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
