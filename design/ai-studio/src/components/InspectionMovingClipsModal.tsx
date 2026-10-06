import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Volume2,
  VolumeX,
  Clock,
  ShieldCheck,
  Truck,
  Eye,
  ChevronRight,
  Flame,
  Layers,
  Thermometer,
  Wrench,
  Gauge,
  Sliders,
  Check,
  AlertOctagon,
  Award,
} from 'lucide-react';
import { triggerHapticFeedback } from '../services/haptics';

export interface InspectionMovingClip {
  id: string;
  category: 'PRE_TRIP' | 'POST_TRIP' | 'DVIR_DEFECTS';
  title: string;
  subtitle: string;
  durationSec: number;
  statute: string;
  whatToDo: {
    steps: string[];
    criticalChecks: string[];
    statutoryRule: string;
  };
  whatNotToDo: {
    mistakes: string[];
    violationConsequences: string[];
    oosWarning: string;
  };
}

export const INSPECTION_MOVING_CLIPS: InspectionMovingClip[] = [
  {
    id: 'clip-air-brakes',
    category: 'PRE_TRIP',
    title: 'Pre-Trip: 3-Step Air Brake Leakdown Test',
    subtitle: 'Governor cut-out, 1-minute static loss, low air buzzer, pop-out valve',
    durationSec: 12,
    statute: '49 CFR § 396.11 & CDL Pre-Trip Standard',
    whatToDo: {
      steps: [
        '1. Build air pressure to governor cut-off (~120 to 140 PSI). Turn engine off, key ON.',
        '2. Fully press brake pedal and hold for 1 full minute. Leakage must NOT exceed 4 PSI for combo vehicles (3 PSI for single).',
        '3. Pump brake pedal repeatedly: Low air warning buzzer & light MUST activate at or before 60 PSI.',
        '4. Continue pumping: Tractor parking brake knob (yellow) and trailer valve (red) MUST pop out between 20 and 45 PSI.',
      ],
      criticalChecks: [
        'Timer running for full 60 seconds (no rushing)',
        'Audible buzzer sounds before needle drops under 60 PSI',
        'Emergency spring brakes engage firmly',
      ],
      statutoryRule: '49 CFR § 393.51 requires operational low air warning device audible inside closed cab.',
    },
    whatNotToDo: {
      mistakes: [
        'Pumping brakes without turning ignition key ON (low air buzzer will not trigger!)',
        'Holding brake pedal for only 5 seconds instead of the mandatory 60-second leak check',
        'Driving off if air pressure drops faster than 4 PSI per minute',
        'Ignoring stuck valves or defective governor cut-out above 140 PSI',
      ],
      violationConsequences: [
        'Out-of-service (OOS) violation under CVSA North American Standard',
        'Catastrophic brake failure on steep mountain descents',
        'Driver placed out of service for inoperative low air warning buzzer',
      ],
      oosWarning: 'CRITICAL OOS: Vehicle placed out of service immediately if air leak exceeds 4 PSI/min or buzzer fails.',
    },
  },
  {
    id: 'clip-fifth-wheel',
    category: 'PRE_TRIP',
    title: 'Pre-Trip: 5th Wheel Coupling & Kingpin Lock',
    subtitle: 'Jaw closure verification, apron gap inspection, safety latch engagement',
    durationSec: 10,
    statute: '49 CFR § 393.70 & § 396.13',
    whatToDo: {
      steps: [
        '1. Reverse tractor under trailer until fifth wheel jaws engage kingpin with audible latching sound.',
        '2. Perform tug test in low gear: Gently pull forward against trailer trailer brakes to verify mechanical lock.',
        '3. Inspect coupling visually with flashlight: Locking jaws must be fully closed around kingpin shank (not the head).',
        '4. Verify ZERO gap between trailer apron plate and fifth wheel skid plate.',
        '5. Confirm fifth wheel release handle is fully in and safety latch is engaged.',
      ],
      criticalChecks: [
        'Flashlight beam directly on locking jaws around kingpin',
        'No visible daylight between apron and fifth wheel',
        'Safety release arm locked and pinned',
      ],
      statutoryRule: '49 CFR § 393.70(h) mandates locking mechanism must automatically lock and require deliberate release.',
    },
    whatNotToDo: {
      mistakes: [
        '"High hitching" — kingpin resting on top of closed fifth wheel jaws without being captured',
        'Relying solely on a tug test without physically shining flashlight into jaws',
        'Driving with 1/2 inch or larger gap between trailer apron and plate',
        'Leaving release arm safety latch loose or pinned open with bungee cord',
      ],
      violationConsequences: [
        'Trailer detachment on highway causing fatal collision or rollover',
        'Criminal negligence charges for high hitching',
        'Immediate catastrophic equipment damage to cab rear and frame',
      ],
      oosWarning: 'IMMEDIATE HAZARD: High-hitched trailer will slide off tractor upon entering highway!',
    },
  },
  {
    id: 'clip-tires-wheels',
    category: 'PRE_TRIP',
    title: 'Pre-Trip: Tires, Lug Nuts & Hub Oil Seals',
    subtitle: 'Tread depth measurement, rust streak detection, hub sight glass verification',
    durationSec: 10,
    statute: '49 CFR § 393.75 & § 396.3',
    whatToDo: {
      steps: [
        '1. Measure steer tire tread depth: Minimum 4/32 inch in every major groove (no recaps allowed on steer).',
        '2. Measure drive and trailer tread depth: Minimum 2/32 inch in every major groove.',
        '3. Check tire pressure cold with calibrated gauge (~100-110 PSI).',
        '4. Check wheel lug nuts: Confirm all nuts present, tight, with no rust trails or shiny metal rings.',
        '5. Check wheel hub oil sight glass: Verify oil level between ADD and FULL lines; check for seal leaks.',
      ],
      criticalChecks: [
        'Digital tread depth gauge verified',
        'Zero rust trails or shiny metal around wheel studs',
        'Hub cap oil clean and sealed, no grease spitting onto brake shoes',
      ],
      statutoryRule: '49 CFR § 393.75 forbids operating any commercial vehicle with less than 4/32" tread on steers or 2/32" on drives.',
    },
    whatNotToDo: {
      mistakes: [
        'Merely "thumping" tires instead of checking calibrated PSI',
        'Ignoring rust streaks originating from lug nut seats (signals loose wheel ready to detach!)',
        'Operating with cord or ply exposed on tire sidewall or crown',
        'Ignoring oil residue spitting onto brake linings from blown wheel seal',
      ],
      violationConsequences: [
        'Wheel detachment at highway speed (runaway 100 lb wheel assembly)',
        'Brake failure due to oil-contaminated brake linings',
        'Immediate Out-of-Service citation by CVSA inspector',
      ],
      oosWarning: 'OOS CRITERIA: Any steer tire under 4/32" or missing/loose lug nuts triggers immediate vehicle shutdown.',
    },
  },
  {
    id: 'clip-hot-brakes',
    category: 'POST_TRIP',
    title: 'Post-Trip: Brake Drum & Wheel Bearing Thermal Check',
    subtitle: 'Infrared heat scan, dragging brake detection, walkaround cooling inspection',
    durationSec: 10,
    statute: '49 CFR § 396.11 (Post-Trip Inspection)',
    whatToDo: {
      steps: [
        '1. Complete post-trip walkaround within 24 hours of operation.',
        '2. Use infrared thermal scanner or careful touch to verify brake drum temperatures are uniform across all axles.',
        '3. Inspect for smoking drums, dragging brakes, or localized thermal hotspots (indicating seized slack adjuster).',
        '4. Inspect air lines for road debris damage or hot exhaust contact.',
        '5. Immediately document any mechanical abnormalities in the digital DVIR.',
      ],
      criticalChecks: [
        'Brake drums within normal temperature range (<250°F after highway run)',
        'No burning friction material smell or smoke',
        'Wheel bearing hub caps cool to touch',
      ],
      statutoryRule: '49 CFR § 396.11 requires driver to prepare report at completion of each day regarding safety-critical parts.',
    },
    whatNotToDo: {
      mistakes: [
        'Parking truck and walking away immediately without inspecting hot components',
        'Ignoring hot brake smell or smoking wheel seal',
        'Parking on dry grass or combustible debris with glowing brake drums',
        'Failing to log dragging brake in DVIR for shop repair',
      ],
      violationConsequences: [
        'Tire fire ignited by overheated brake drum while parked in sleeper berth',
        'Wheel bearing seizure resulting in broken axle spindle',
        'Driver fine for failure to complete post-trip inspection',
      ],
      oosWarning: 'FIRE HAZARD: Dragging commercial brake can reach 600°F and ignite tire rubber in minutes.',
    },
  },
  {
    id: 'clip-dvir-signoff',
    category: 'DVIR_DEFECTS',
    title: 'DVIR Defect Handling: Digital Sign-off vs "Pencil Whipping"',
    subtitle: 'Legitimate defect escalation, certified mechanic sign-off, next-day review',
    durationSec: 10,
    statute: '49 CFR § 396.11 & § 396.13',
    whatToDo: {
      steps: [
        '1. When a defect is discovered, log item in TRUCKWITHEASE DVIR app with clear photo attachment.',
        '2. Submit defect to fleet maintenance dispatch with high-priority tag.',
        '3. Certified mechanic must repair defect and enter digital certification work order signature.',
        '4. Driver reviewing truck next day MUST review mechanic certification and sign before operating vehicle.',
      ],
      criticalChecks: [
        'High-resolution photo of defect attached to work order',
        'Certified mechanic signature and license number recorded',
        'Prior-day DVIR verified before vehicle departure',
      ],
      statutoryRule: '49 CFR § 396.13 requires driver to be satisfied vehicle is in safe operating condition and review prior report.',
    },
    whatNotToDo: {
      mistakes: [
        '"Pencil whipping" — rapidly checking "No Defects" without physically walking around truck',
        'Operating vehicle with an open, uncertified out-of-service defect',
        'Shop mechanic clearing DVIR ticket without physically repairing component',
        'Ignoring driver notes from prior shift',
      ],
      violationConsequences: [
        'Federal civil penalties for falsification of inspection records (up to $14,000 per violation)',
        'Carrier safety rating downgrade to Conditional or Unsatisfactory',
        'Immediate dispatch shutdown',
      ],
      oosWarning: 'FEDERAL STATUTE: Operating vehicle with uncorrected defect violates 49 CFR § 396.11 federal regulations.',
    },
  },
];

interface InspectionMovingClipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InspectionMovingClipsModal: React.FC<InspectionMovingClipsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedClipId, setSelectedClipId] = useState<string>('clip-air-brakes');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progressSec, setProgressSec] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'WHAT_TO_DO' | 'WHAT_NOT_TO_DO' | 'SPLIT_VIEW'>('SPLIT_VIEW');
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedClip = INSPECTION_MOVING_CLIPS.find((c) => c.id === selectedClipId) || INSPECTION_MOVING_CLIPS[0];

  // Playback timer loop
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgressSec((prev) => {
          const next = prev + 0.1 * playbackSpeed;
          if (next >= selectedClip.durationSec) {
            return 0; // Loop playback
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, selectedClip.durationSec]);

  // Reset timer on clip change
  useEffect(() => {
    setProgressSec(0);
  }, [selectedClipId]);

  // Canvas visual motion animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background HUD
      ctx.fillStyle = '#090A0E';
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      ctx.strokeStyle = '#181A22';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw specific animated mechanics based on clip
      const t = progressSec;

      if (selectedClip.id === 'clip-air-brakes') {
        // Render Air Brake Gauge with oscillating needle
        const centerX = width / 2;
        const centerY = height / 2 + 10;
        const radius = 90;

        // Dial outer arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI * 0.75, Math.PI * 2.25);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#292A2F';
        ctx.stroke();

        // Safe zone arc (60 to 120 PSI)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI * 1.1, Math.PI * 2.1);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#10B981';
        ctx.stroke();

        // Danger zone arc (< 60 PSI)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI * 0.75, Math.PI * 1.1);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#EF4444';
        ctx.stroke();

        // Animated needle: Drops from 120 PSI down to 25 PSI across duration
        const cycleProgress = (t % selectedClip.durationSec) / selectedClip.durationSec;
        let psi = 120 - cycleProgress * 95;
        if (psi < 25) psi = 25;

        const needleAngle = Math.PI * 0.75 + (psi / 150) * (Math.PI * 1.5);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(needleAngle);
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(0, -radius + 15);
        ctx.lineTo(4, 0);
        ctx.fillStyle = psi < 60 ? '#EF4444' : '#10B981';
        ctx.fill();
        ctx.restore();

        // Center hub
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#E5E7EB';
        ctx.fill();

        // PSI Digital Readout
        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = psi < 60 ? '#EF4444' : '#10B981';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(psi)} PSI`, centerX, centerY + 50);

        // Warning Buzzer & Pop-out Indicator
        if (psi < 60) {
          const blink = Math.sin(t * 12) > 0;
          ctx.fillStyle = blink ? '#EF4444' : '#7F1D1D';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('LOW AIR WARNING BUZZER ACTIVE (60 PSI)', centerX, centerY + 75);

          if (psi < 45) {
            ctx.fillStyle = '#F59E0B';
            ctx.fillText('EMERGENCY SPRING BRAKE POP-OUT VALVES TRIPPED', centerX, centerY + 95);
          }
        }
      } else if (selectedClip.id === 'clip-fifth-wheel') {
        // Render 5th Wheel Jaws & Kingpin Latch
        const cx = width / 2;
        const cy = height / 2;
        const cycle = (t % selectedClip.durationSec) / selectedClip.durationSec;
        const jawOffset = Math.max(0, 30 - cycle * 30);

        // Trailer Apron
        ctx.fillStyle = '#374151';
        ctx.fillRect(cx - 120, cy - 60, 240, 16);

        // Kingpin
        ctx.fillStyle = '#E5E7EB';
        ctx.fillRect(cx - 12, cy - 44, 24, 45);
        ctx.fillRect(cx - 16, cy - 8, 32, 14);

        // 5th Wheel Skid Plate
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(cx - 140, cy + 8, 280, 24);

        // Left & Right Locking Jaws (animate closed)
        ctx.fillStyle = jawOffset === 0 ? '#10B981' : '#F59E0B';
        ctx.fillRect(cx - 40 + jawOffset, cy - 2, 26, 36);
        ctx.fillRect(cx + 14 - jawOffset, cy - 2, 26, 36);

        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = jawOffset === 0 ? '#10B981' : '#F59E0B';
        ctx.textAlign = 'center';
        ctx.fillText(
          jawOffset === 0 ? 'JAWS FULLY LOCKED AROUND KINGPIN (ZERO GAP)' : 'COUPLING IN PROGRESS...',
          cx,
          cy + 65
        );
      } else if (selectedClip.id === 'clip-tires-wheels') {
        // Render Tire Tread Depth & Wheel Lug Nut Check
        const cx = width / 2;
        const cy = height / 2 - 10;
        const radius = 65;

        // Tire circle
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#1F2937';
        ctx.stroke();

        // Rim
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 16, 0, Math.PI * 2);
        ctx.fillStyle = '#374151';
        ctx.fill();

        // Lug nuts with clean torque check
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 5) {
          const lx = cx + Math.cos(a) * (radius - 26);
          const ly = cy + Math.sin(a) * (radius - 26);
          ctx.beginPath();
          ctx.arc(lx, ly, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#10B981';
          ctx.fill();
        }

        // Center hub sight glass
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#065F46';
        ctx.fill();
        ctx.strokeStyle = '#34D399';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = '#10B981';
        ctx.textAlign = 'center';
        ctx.fillText('STEER TREAD: 6/32" · TORQUE: 475 FT-LB · HUB OIL: FULL', cx, cy + 90);
      } else {
        // Thermal scan / DVIR Signoff view
        const cx = width / 2;
        const cy = height / 2;
        const scan = Math.sin(t * 3);

        ctx.fillStyle = '#1F2937';
        ctx.fillRect(cx - 90, cy - 50, 180, 100);

        // Scan laser beam
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 90, cy - 50 + (scan + 1) * 50);
        ctx.lineTo(cx + 90, cy - 50 + (scan + 1) * 50);
        ctx.stroke();

        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#10B981';
        ctx.textAlign = 'center';
        ctx.fillText('THERMAL SCAN: 168°F (UNIFORM COOLING)', cx, cy + 75);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [progressSec, selectedClip.id, selectedClip.durationSec]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0D0E13] border-2 border-indigo-500/40 rounded-2xl max-w-6xl w-full text-[#E3E1E9] shadow-2xl overflow-hidden my-4 animate-fadeIn flex flex-col max-h-[94vh]">
        {/* HEADER */}
        <div className="bg-[#090A0E] px-6 py-4 border-b border-[#292A2F] flex items-center justify-between flex-wrap gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Play className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  INSPECTION MOVING CLIPS STUDIO
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-950 border border-indigo-500/40 text-indigo-300 rounded-full">
                  PRE-TRIP · POST-TRIP · DVIR DEFECTS
                </span>
                <span className="px-2 py-0.5 text-xs font-mono bg-emerald-950 border border-emerald-500/30 text-emerald-300 rounded">
                  WHAT TO DO VS WHAT NOT TO DO
                </span>
              </div>
              <p className="text-xs text-[#90909A] mt-0.5">
                Dynamic visual demonstrations of FMCSA 49 CFR Part 396 vehicle inspection standards and common roadside violation traps.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#90909A] hover:text-white hover:bg-[#1E1F25] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CLIP SELECTOR CAROUSEL STRIP */}
        <div className="bg-[#14151B] px-6 py-3 border-b border-[#292A2F] flex items-center gap-2 overflow-x-auto shrink-0">
          {INSPECTION_MOVING_CLIPS.map((clip) => (
            <button
              key={clip.id}
              onClick={() => setSelectedClipId(clip.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                selectedClipId === clip.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950 border border-indigo-400'
                  : 'bg-[#1E1F25] text-[#90909A] hover:text-white hover:bg-[#282A33]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${clip.category === 'PRE_TRIP' ? 'bg-emerald-400' : clip.category === 'POST_TRIP' ? 'bg-blue-400' : 'bg-amber-400'}`}></span>
              {clip.title}
            </button>
          ))}
        </div>

        {/* MAIN STUDIO STAGE */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* VIDEO / CANVAS PLAYER CONTAINER */}
          <div className="bg-[#090A0E] border border-[#292A2F] rounded-2xl overflow-hidden shadow-2xl space-y-0">
            <div className="relative aspect-[16/8] sm:aspect-[21/9] w-full max-h-[340px] flex items-center justify-center bg-black">
              <canvas
                ref={canvasRef}
                width={800}
                height={340}
                className="w-full h-full object-contain"
              />

              {/* OVERLAY BADGE */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-black/80 border border-white/20 text-white backdrop-blur-md">
                  {selectedClip.title}
                </span>
                <span className="px-2 py-1 text-[11px] font-mono rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-300">
                  {selectedClip.statute}
                </span>
              </div>

              {/* PLAYBACK CONTROLS OVERLAY */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>
                  <button
                    onClick={() => setProgressSec(0)}
                    className="p-2 rounded-lg bg-[#222] hover:bg-[#333] text-white transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-white">
                    {progressSec.toFixed(1)}s / {selectedClip.durationSec}.0s
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-[#90909A] text-[10px]">SPEED:</span>
                    {[0.5, 1.0, 1.5, 2.0].map((s) => (
                      <button
                        key={s}
                        onClick={() => setPlaybackSpeed(s)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                          playbackSpeed === s ? 'bg-indigo-600 text-white font-bold' : 'text-[#888] hover:text-white'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className="p-1.5 text-[#90909A] hover:text-white"
                  >
                    {isAudioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* SCRUBBER PROGRESS LINE */}
            <div className="w-full bg-[#1A1C24] h-1.5 relative">
              <div
                style={{ width: `${(progressSec / selectedClip.durationSec) * 100}%` }}
                className="bg-indigo-500 h-full transition-all duration-100 shadow-sm shadow-indigo-400"
              />
            </div>
          </div>

          {/* VIEW MODE SELECTOR */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('SPLIT_VIEW')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'SPLIT_VIEW'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#14151B] text-[#90909A] hover:text-white'
                }`}
              >
                SPLIT-VIEW COMPARISON
              </button>
              <button
                onClick={() => setViewMode('WHAT_TO_DO')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'WHAT_TO_DO'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#14151B] text-[#90909A] hover:text-white'
                }`}
              >
                WHAT TO DO (COMPLIANT)
              </button>
              <button
                onClick={() => setViewMode('WHAT_NOT_TO_DO')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'WHAT_NOT_TO_DO'
                    ? 'bg-red-600 text-white'
                    : 'bg-[#14151B] text-[#90909A] hover:text-white'
                }`}
              >
                WHAT NOT TO DO (VIOLATION TRAPS)
              </button>
            </div>

            <span className="text-xs text-[#90909A] font-mono">
              Citation: {selectedClip.statute}
            </span>
          </div>

          {/* WHAT TO DO VS WHAT NOT TO DO SPLIT-PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LEFT PANEL: WHAT TO DO */}
            {(viewMode === 'SPLIT_VIEW' || viewMode === 'WHAT_TO_DO') && (
              <div className="bg-[#121B16] border-2 border-emerald-500/40 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-emerald-300 text-sm uppercase tracking-wide">
                      WHAT TO DO (FMCSA GOLD STANDARD)
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500 text-black">
                    PASS INSPECTION
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase">
                    Mandatory Sequential Steps:
                  </h4>
                  <ul className="space-y-2 text-xs text-emerald-100">
                    {selectedClip.whatToDo.steps.map((st, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-emerald-950/60 rounded-lg border border-emerald-700/40 space-y-1">
                  <div className="text-[10px] font-mono font-bold text-emerald-300 uppercase">
                    Critical Verification Checks:
                  </div>
                  <div className="text-xs text-emerald-200">
                    {selectedClip.whatToDo.criticalChecks.join(' • ')}
                  </div>
                </div>

                <div className="text-[11px] text-emerald-400/80 font-mono">
                  Statute: {selectedClip.whatToDo.statutoryRule}
                </div>
              </div>
            )}

            {/* RIGHT PANEL: WHAT NOT TO DO */}
            {(viewMode === 'SPLIT_VIEW' || viewMode === 'WHAT_NOT_TO_DO') && (
              <div className="bg-[#1F1214] border-2 border-red-500/40 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-red-800/40 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-red-500/20 text-red-400 rounded-lg">
                      <AlertOctagon className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-red-300 text-sm uppercase tracking-wide">
                      WHAT NOT TO DO (VIOLATION TRAPS)
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-600 text-white">
                    AVOID OUT-OF-SERVICE
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-red-400 uppercase">
                    Dangerous Shortcuts & Mistakes:
                  </h4>
                  <ul className="space-y-2 text-xs text-red-100">
                    {selectedClip.whatNotToDo.mistakes.map((mk, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <X className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <span>{mk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-red-950/60 rounded-lg border border-red-700/40 space-y-1">
                  <div className="text-[10px] font-mono font-bold text-red-300 uppercase">
                    Roadside Citation & Safety Consequences:
                  </div>
                  <div className="text-xs text-red-200">
                    {selectedClip.whatNotToDo.violationConsequences.join(' • ')}
                  </div>
                </div>

                <div className="text-[11px] text-red-400 font-bold font-mono">
                  {selectedClip.whatNotToDo.oosWarning}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-[#090A0E] px-6 py-4 border-t border-[#292A2F] flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="text-xs text-[#90909A] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <span>Educational module compliant with FMCSA 49 CFR § 396 and CVSA North American Standard</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1B1D25] hover:bg-[#252833] text-white text-xs font-semibold rounded-xl transition-colors"
          >
            CLOSE CLIPS STUDIO
          </button>
        </div>
      </div>
    </div>
  );
};
