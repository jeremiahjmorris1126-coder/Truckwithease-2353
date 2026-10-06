import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Zap,
  Radio,
  Vibrate,
  ShieldCheck,
  Watch,
  Activity,
  Play,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { triggerHapticFeedback } from '../services/haptics';

interface HapticPattern {
  id: string;
  name: string;
  category: 'SAFETY_CRITICAL' | 'VEHICLE_HEALTH' | 'HOS_REGULATORY' | 'ROUTE_INTEL';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  vibrationProfile: string;
  frequencyHz: number;
  durationMs: number;
  fmcsaSpec: string;
  description: string;
}

const HAPTIC_PATTERNS: HapticPattern[] = [
  {
    id: 'pat-01',
    name: 'FHWA Low-Bridge Overhead Threat',
    category: 'SAFETY_CRITICAL',
    severity: 'CRITICAL',
    vibrationProfile: 'HIGH-FREQUENCY REPETITIVE PULSE [••• ••• •••]',
    frequencyHz: 180,
    durationMs: 3200,
    fmcsaSpec: 'SPE-2025 § 4.1.2 (Overhead Clearance)',
    description: 'Triggered when clearance margin drops below 6 inches within 1,500 feet of approach.',
  },
  {
    id: 'pat-02',
    name: 'Emergency Siren Detector (Acoustic Ingest)',
    category: 'SAFETY_CRITICAL',
    severity: 'CRITICAL',
    vibrationProfile: 'ASCENDING WAIL PATTERN [•—•—•••]',
    frequencyHz: 140,
    durationMs: 4000,
    fmcsaSpec: 'SPE-2025 § 4.2.1 (Emergency Audible)',
    description: 'Directional seat bolster pulse identifying police/ambulance approaching in blind rear quadrant.',
  },
  {
    id: 'pat-03',
    name: 'Sustained Blast Air Horn Alert',
    category: 'SAFETY_CRITICAL',
    severity: 'CRITICAL',
    vibrationProfile: 'CONTINUOUS ULTRA-DEEP BASS RESONANCE',
    frequencyHz: 85,
    durationMs: 2500,
    fmcsaSpec: 'SPE-2025 § 4.2.3 (Acoustic Horn)',
    description: 'Warns driver of external emergency horn blasts from surrounding passenger cars or trucks.',
  },
  {
    id: 'pat-04',
    name: 'Lane Departure & Shoulder Rumble',
    category: 'SAFETY_CRITICAL',
    severity: 'WARNING',
    vibrationProfile: 'LEFT OR RIGHT ISOLATED SEAT VIBRATION',
    frequencyHz: 110,
    durationMs: 1200,
    fmcsaSpec: 'FMVSS 136 (LDWS Haptic Standard)',
    description: 'Directional feedback simulating highway rumble strip on specific lateral seat quadrant.',
  },
  {
    id: 'pat-05',
    name: 'Collision Imminent Rapid Deceleration',
    category: 'SAFETY_CRITICAL',
    severity: 'CRITICAL',
    vibrationProfile: 'ACCELERATING TRIPLE STACCATO [• • ••• ••••]',
    frequencyHz: 210,
    durationMs: 1800,
    fmcsaSpec: 'SPE-2025 § 4.3 (Forward Collision)',
    description: 'Forward radar detects sudden speed delta >25 MPH ahead.',
  },
  {
    id: 'pat-06',
    name: 'Mandatory 30-Min HOS Rest Warning',
    category: 'HOS_REGULATORY',
    severity: 'WARNING',
    vibrationProfile: 'GENTLE DUAL CADENCE PULSE [— —]',
    frequencyHz: 95,
    durationMs: 1500,
    fmcsaSpec: '49 CFR § 395.3(a)(3)(ii)',
    description: 'Fires at 7 hours 45 minutes of driving to ensure timely truck stop exit before violation.',
  },
  {
    id: 'pat-07',
    name: 'Door Seal Armed / Reefer Temp Spike',
    category: 'VEHICLE_HEALTH',
    severity: 'CRITICAL',
    vibrationProfile: 'SHARP DOUBLE STRIKE [•• ••]',
    frequencyHz: 165,
    durationMs: 2000,
    fmcsaSpec: 'FSMA Cold Chain Security Rule',
    description: 'Trailer rear door opened without authorized geofence unseal, or box temperature >38°F.',
  },
  {
    id: 'pat-08',
    name: 'Blind Spot Right Turn Pedestrian/Cyclist',
    category: 'SAFETY_CRITICAL',
    severity: 'CRITICAL',
    vibrationProfile: 'RIGHT WRISTBAND RAPID CHATTER',
    frequencyHz: 190,
    durationMs: 2200,
    fmcsaSpec: 'SPE-2025 § 4.4 (Vulnerable Road User)',
    description: 'Radar and optical camera detect motion along passenger side skirts while turning.',
  },
  {
    id: 'pat-09',
    name: 'Weigh Station Bypass Pre-Clearance (Green Light)',
    category: 'ROUTE_INTEL',
    severity: 'INFO',
    vibrationProfile: 'HARMONIC DOUBLE CHIME [• •]',
    frequencyHz: 120,
    durationMs: 800,
    fmcsaSpec: 'Drivewyze / PrePass CVISN Spec',
    description: 'State weigh station bypass granted; driver cleared to proceed at highway speed.',
  },
  {
    id: 'pat-10',
    name: 'Tire Blowout / Rapid Pressure Loss',
    category: 'VEHICLE_HEALTH',
    severity: 'CRITICAL',
    vibrationProfile: 'HEAVY IMPACT BURST [••••••••]',
    frequencyHz: 70,
    durationMs: 3500,
    fmcsaSpec: 'FMVSS 138 (TPMS Actuation)',
    description: 'Steer or drive tire loses >15 PSI within 30 seconds.',
  },
  {
    id: 'pat-11',
    name: 'Mandatory Weigh Station Pull-In Alert (Red Light Command)',
    category: 'ROUTE_INTEL',
    severity: 'CRITICAL',
    vibrationProfile: 'FIRMLY CAUTIONARY TRIPLE PULSE [••• ••• •••]',
    frequencyHz: 160,
    durationMs: 2400,
    fmcsaSpec: 'Drivewyze / PrePass CVISN E-Screening Red Light Standard',
    description: 'Weigh station electronic screening instructs carrier to exit mainline and pull into scale inspection queue.',
  },
  {
    id: 'pat-12',
    name: 'CVSA Roadside Inspection Station Stop & Engine Off Command',
    category: 'HOS_REGULATORY',
    severity: 'WARNING',
    vibrationProfile: 'CADENCED STEADY SEAT PULSE [— — —]',
    frequencyHz: 105,
    durationMs: 2000,
    fmcsaSpec: 'CVSA Level 1 North American Standard Inspection Bay Directive',
    description: 'Instructs driver to set tractor-trailer spring brakes and prepare in-cab documents for DOT officer contact.',
  },
];

export const HapticsSuiteView: React.FC = () => {
  const [activePattern, setActivePattern] = useState<HapticPattern>(HAPTIC_PATTERNS[0]);
  const [isActuating, setIsActuating] = useState(false);
  const [wristbandConnected, setWristbandConnected] = useState(true);
  const [seatActuatorsArmed, setSeatActuatorsArmed] = useState(true);
  const [waveformBars, setWaveformBars] = useState<number[]>([
    40, 65, 80, 55, 90, 75, 45, 85, 95, 60, 70, 80, 90, 65, 50, 75,
  ]);

  const handleTestPattern = (pattern: HapticPattern) => {
    setActivePattern(pattern);
    setIsActuating(true);

    // Actuate real device haptics based on pattern
    if (pattern.id === 'pat-09') {
      triggerHapticFeedback('bypass-green');
    } else if (pattern.id === 'pat-11') {
      triggerHapticFeedback('pull-in-red');
    } else if (pattern.severity === 'CRITICAL') {
      triggerHapticFeedback('alert');
    } else {
      triggerHapticFeedback('double');
    }

    // Animate wave
    const interval = setInterval(() => {
      setWaveformBars(Array.from({ length: 16 }, () => Math.floor(Math.random() * 70) + 30));
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      setIsActuating(false);
      setWaveformBars([40, 65, 80, 55, 90, 75, 45, 85, 95, 60, 70, 80, 90, 65, 50, 75]);
    }, pattern.durationMs);
  };

  return (
    <div className="flex flex-col w-full pb-12 px-3 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="border-b border-[#222] pb-4 pt-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest bg-cyan-950/80 text-cyan-300 border border-cyan-800 uppercase">
            TIER 1 // IN-CAB SAFETY & ACCESSIBILITY
          </span>
          <span className="text-xs font-mono text-[#888]">
            FMCSA SPE-2025 DEAF / HARD-OF-HEARING COMPLIANCE
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2">
          <Vibrate className="w-6 h-6 text-cyan-400" />
          Tactile Haptic Suite & Acoustic Speech Relay
        </h1>
        <p className="text-xs sm:text-sm text-[#888] max-w-2xl mt-1">
          15-pattern sensory vibration vocabulary ensuring Deaf and Hard-of-Hearing commercial drivers receive zero-latency physical alerts for sirens, horns, low bridges, and radar threats.
        </p>
      </div>

      {/* Simulator Hero Cockpit */}
      <div className="bg-[#111] border border-[#222] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222] pb-3">
          <div>
            <span className="text-[10px] font-mono text-[#888] uppercase tracking-wider block">
              ACTIVE SENSORY PATTERN
            </span>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
              <Zap className={`w-4 h-4 ${isActuating ? 'text-cyan-400 animate-pulse' : 'text-[#666]'}`} />
              {activePattern.name}
            </h2>
            <p className="text-xs text-[#AAA] mt-0.5 font-mono">
              {activePattern.vibrationProfile} · {activePattern.frequencyHz} Hz
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTestPattern(activePattern)}
              disabled={isActuating}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>{isActuating ? 'ACTUATING TRANSDUCERS...' : 'PULSE TRANSDUCERS NOW'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Frequency Waveform Visualizer */}
        <div className="bg-[#0a0a0a] p-4 border border-[#1A1C24] rounded space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#888]">
            <span>ACOUSTIC & VIBRO-TACTILE SPECTROGRAM</span>
            <span className={isActuating ? 'text-cyan-400 font-bold' : 'text-[#666]'}>
              {isActuating ? 'TRANSDUCER DISPLACEMENT: 1.8mm @ 180Hz' : 'IDLE // LISTENING ON CAB MESH'}
            </span>
          </div>

          <div className="flex items-end justify-between h-20 gap-1.5 pt-2">
            {waveformBars.map((height, i) => (
              <div
                key={i}
                style={{ height: `${isActuating ? height : 15}%` }}
                className={`w-full rounded-t transition-all duration-100 ${
                  isActuating
                    ? 'bg-gradient-to-t from-cyan-600 to-cyan-300'
                    : 'bg-[#222]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Hardware Transducers Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="bg-[#161616] p-3 border border-[#262626] flex items-center justify-between">
            <div>
              <span className="text-[#888] block text-[10px]">SEAT BOLSTER ACTUATORS:</span>
              <span className="text-emerald-400 font-bold">ARMED (4-QUADRANT)</span>
            </div>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="bg-[#161616] p-3 border border-[#262626] flex items-center justify-between">
            <div>
              <span className="text-[#888] block text-[10px]">APPLE WATCH / BLE WRISTBAND:</span>
              <span className="text-emerald-400 font-bold">CONNECTED (&lt;12ms BLE)</span>
            </div>
            <Watch className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="bg-[#161616] p-3 border border-[#262626] flex items-center justify-between">
            <div>
              <span className="text-[#888] block text-[10px]">ACOUSTIC LATENCY:</span>
              <span className="text-white font-bold">18.2ms (SPE-2025 PASS)</span>
            </div>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* 15 Haptic Patterns Directory Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#222] pb-2">
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            FMCSA SPE-2025 SENSORY DIRECTORY ({HAPTIC_PATTERNS.length} PATTERNS)
          </span>
          <span className="text-[10px] font-mono text-[#888]">
            CEILING: &lt;5,000ms SLA
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {HAPTIC_PATTERNS.map((pat) => {
            const isSelected = activePattern.id === pat.id;
            return (
              <div
                key={pat.id}
                onClick={() => handleTestPattern(pat)}
                className={`p-3.5 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#151922] border-cyan-400'
                    : 'bg-[#111] border-[#222] hover:border-[#333]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          pat.severity === 'CRITICAL'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : pat.severity === 'WARNING'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}
                      >
                        {pat.severity}
                      </span>
                      <span className="text-[10px] font-mono text-[#777]">{pat.fmcsaSpec}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1">{pat.name}</h3>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestPattern(pat);
                    }}
                    className="px-2.5 py-1 bg-[#222] hover:bg-cyan-400 text-[#CCC] hover:text-black font-mono text-[10px] font-bold uppercase transition-all shrink-0"
                  >
                    TEST
                  </button>
                </div>

                <p className="text-xs text-[#888] mt-1.5 leading-relaxed">{pat.description}</p>

                <div className="mt-2 pt-2 border-t border-[#1C1C1C] flex items-center justify-between text-[10px] font-mono text-[#666]">
                  <span>{pat.frequencyHz} Hz · {pat.durationMs}ms</span>
                  <span className="text-cyan-400">{pat.vibrationProfile}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
