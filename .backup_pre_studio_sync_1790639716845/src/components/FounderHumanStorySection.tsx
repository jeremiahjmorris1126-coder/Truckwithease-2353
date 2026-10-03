import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Truck,
  ShieldCheck,
  Zap,
  Phone,
  Sparkles,
  ArrowRight,
  Clock,
  Compass,
  FileText,
  Award,
  Radio,
  CheckCircle2,
  HeartHandshake,
  TrendingUp,
  MapPin,
  ExternalLink,
  ChevronRight,
  Flame,
  Check,
  Mic,
  Edit3,
} from 'lucide-react';
import { TabType } from '../types';
import { FounderVoiceStudioModal } from './FounderVoiceStudioModal';
import {
  getAllCustomScripts,
  getFounderAudioRecording,
  StoredAudioRecording,
  getAudioPlaybackMode,
} from '../services/founderVoiceService';

interface FounderHumanStorySectionProps {
  onNavigateToTab?: (tab: TabType) => void;
  onOpenContact?: () => void;
}

interface Chapter {
  id: 'what-it-does' | 'how-we-got-here' | 'where-we-are-going';
  chapterNumber: string;
  title: string;
  subtitle: string;
  tagline: string;
  badge: string;
  summary: string;
  spokenScript: string;
  highlights: {
    metric: string;
    label: string;
    detail: string;
  }[];
  keyPoints: string[];
}

export const CHAPTERS_DATA: Chapter[] = [
  {
    id: 'what-it-does',
    chapterNumber: '01',
    title: 'What TRUCKWITHEASE Does & Brings To Your Fleet',
    subtitle: 'Consolidating 8 Fragmented Subscriptions Into 1 Sovereign Operating Cockpit',
    tagline: 'Built for the driver at 2:00 AM in a snowstorm, engineered for the fleet owner counting every nickel.',
    badge: 'OPERATIONAL IMPACT',
    summary:
      'Replaces the chaotic patchwork of separate ELD, bridge maps, dispatch boards, paper DVIRs, and factoring apps with a single, sub-18ms synchronized telematics cockpit that stops compliance fines and keeps wheels rolling.',
    spokenScript:
      "Look, if you run trucks in America today, you know the brutal truth: you are fighting an uphill battle every mile. The average fleet operator is drowning in eight different disconnected software apps. An ELD from one company, a load board from another, messy paper inspection sheets, bridge clearance maps, maintenance binders, and constant frantic phone calls. Every time those systems fail to talk to each other, you lose money, your drivers get frustrated, and you get hit with expensive compliance violations. TRUCKWITHEASE was built to wipe all that friction off the map. We consolidated every single mission-critical tool into one unified sovereign cockpit. For your drivers in the cab, it brings peace of mind: a zero-glare Night HUD with sub-millisecond legal HOS clocks, ninety-second voice-guided DVIR inspections, and FHWA Item 54B low-bridge radar that actively scans over 618,000 bridges in real-time to guarantee your rigs never hit an overhead overpass. For your fleet owner and dispatch team, it brings cold, hard cash to the bottom line: an average of eighteen hundred and fifty dollars saved per truck every single month in avoided idle fuel waste, zeroed-out form-and-manner citations, and instant rate-con processing that keeps your trailers loaded and rolling with maximum rate-per-mile profit.",
    highlights: [
      {
        metric: '+$1,850/mo',
        label: 'AVERAGE NET FLEET GAIN',
        detail: 'Per truck through eliminated idle waste, automated dispatch, & zero fines.',
      },
      {
        metric: '618,000',
        label: 'NATIONAL BRIDGE VECTORS',
        detail: 'FHWA Item 54B radar calculates sub-second overhead hazard clearance.',
      },
      {
        metric: '8 INTO 1',
        label: 'SUBSCRIPTION CONSOLIDATION',
        detail: 'ELD, load board, safety, maps, DVIR, fuel, messaging, & factoring unified.',
      },
      {
        metric: '0.000ms',
        label: 'STATUTORY CLOCK DRIFT',
        detail: 'FMCSA 49 CFR § 395 statutory precision across 11h/14h/70h duty cycles.',
      },
    ],
    keyPoints: [
      'Stops 100% of Low-Bridge Collisions: Active sub-second radar scans 618,000 spans across all 50 states to prevent catastrophic 13\'6" strikes.',
      'Turns Roadside Scale Inspections into 90-Second Passes: Generates cryptographically sealed, tamper-proof audit slips for State Troopers and DOT officers.',
      'Saves $1,850+ Per Power Unit Monthly: Stops unassigned drive time, slashes fuel waste via idle heatmaps, and cuts billing cycles to seconds.',
      'Voice-Guided Pre/Post-Trip Autonomous DVIR: Drivers finish thorough, compliant inspections in 90 seconds without paperwork friction.',
    ],
  },
  {
    id: 'how-we-got-here',
    chapterNumber: '02',
    title: 'How We Got Here: Born on the Asphalt',
    subtitle: 'The Origin Story of TRUCKWITHEASE',
    tagline: 'Not created by Silicon Valley tourists in air-conditioned suites. Born from frozen brakes, scale checks, and diesel smoke.',
    badge: 'ORIGIN & HERITAGE',
    summary:
      'We were tired of watching good drivers quit over paperwork traps and honest carriers get bled dry by predatory legacy software vendors who have never backed a 53-foot dry van into a blind-side dock in the rain.',
    spokenScript:
      "TRUCKWITHEASE wasn't dreamed up in an air-conditioned Silicon Valley boardroom by tech investors who have never touched a fifth wheel. It was born on the asphalt. It was forged out of freezing two o'clock in the morning roadside DOT scale checks, greasy knuckle repairs in gravel lots, and the sheer fury of watching honest, hard-working carrier operators get nickel-and-dimed by predatory tech companies. For years, legacy software vendors treated independent carriers and mid-sized fleets like second-class citizens. They locked fleets into three-year ironclad contracts, charged thousands of dollars in hidden onboarding fees, and delivered slow, clunky software that crashed when you needed it most. We watched good drivers walk away from the industry because of bogus paperwork citations. We watched small carriers bleed cash because brokers took advantage of delayed dispatch and unassigned driving events. We said: enough is enough. We gathered million-miler highway haulers, master mechanics, and aerospace telematics engineers to engineer the system we always wished we had. Built by truckers, tested by truckers, for truckers. That is how we got here.",
    highlights: [
      {
        metric: '15+ YRS',
        label: 'COMMERCIAL HIGHWAY DNA',
        detail: 'Direct real-world experience running freight across Interstate corridors.',
      },
      {
        metric: 'USDOT #3928192',
        label: 'ACTIVE CARRIER CREDENTIALS',
        detail: 'Operated under real FMCSA common carrier authority (MC-1478201-C).',
      },
      {
        metric: 'ZERO BS',
        label: 'NO PREDATORY CONTRACTS',
        detail: 'No 3-year vendor lock-in traps or extortionate per-seat onboarding fees.',
      },
      {
        metric: '100% DRIVER',
        label: 'CAB-FIRST ERGONOMICS',
        detail: 'Every screen, button, and alert is tested for high-vibration truck cabs.',
      },
    ],
    keyPoints: [
      'The Breaking Point: Watching fellow haulers slapped with thousands in out-of-service fines because two software vendors failed to sync simple timestamps.',
      'The Asphalt Mandate: Every line of code was engineered in real sleeper berths and dispatch trailers, not corporate office towers.',
      'Sovereignty for the Fleet: Eliminating middleman markups so carriers keep the revenue they put blood, sweat, and diesel into earning.',
      'Built With Morrishive Vanguard Technology: Merging heavy-duty trucking resilience with aerospace-grade sub-millisecond telematics.',
    ],
  },
  {
    id: 'where-we-are-going',
    chapterNumber: '03',
    title: 'Where We Are Going: The Future of Kinetic Freight',
    subtitle: 'The Nationwide Relay Mesh & Economic Sovereignty for Independent Carriers',
    tagline: 'Moving freight 24/7 coast-to-coast while letting our drivers sleep in their own beds every night.',
    badge: 'THE HORIZON',
    summary:
      'We are deploying the Nationwide Autonomous Relay Corridor Mesh, quantum predictive load matching, and carrier sovereign tools so independent fleets command the power of a 10,000-truck fleet while keeping 100% of their independence.',
    spokenScript:
      "So where are we headed? We are building the next era of sovereign freight. We are deploying the Nationwide Relay Mesh, connecting freight corridors along Interstate 80, Interstate 70, Interstate 95, and Interstate 10 with intelligent waypoint hubs. Imagine freight that never stops moving across the country, while your drivers do their run, swap trailers at a geofenced relay hub with a relief driver, and sleep in their own beds at home every night. That is the end of driver burnout. That is how we solve driver retention forever. We are also integrating quantum predictive load matching that pairs loads not just by rate-per-mile, but by real-time fuel burn, driver circadian rhythms, return backhaul density, and live weigh-station bypass probability. Our destination is crystal clear: to give every independent fleet owner, whether you have one truck or five hundred, the technological superpower and pricing leverage of a ten-thousand-truck mega-carrier, while fiercely defending your independence, your profitability, and your dignity on the highway. We built this for you. Welcome to TRUCKWITHEASE.",
    highlights: [
      {
        metric: '4 CORRIDORS',
        label: 'ACTIVE RELAY CORRIDORS',
        detail: 'I-80, I-70, I-95, and I-10 staged waypoint swap hubs in deployment.',
      },
      {
        metric: 'HOME NIGHTLY',
        label: 'DRIVER QUALITY OF LIFE',
        detail: 'Trailer relay handovers let drivers return home instead of 3-week OTR grinds.',
      },
      {
        metric: '24/7 ROLLING',
        label: 'NON-STOP ASSET VELOCITY',
        detail: 'Trailers transit coast-to-coast without waiting for 10-hour sleeper resets.',
      },
      {
        metric: 'QUANTUM SOLVER',
        label: 'PREDICTIVE PROFIT ENGINE',
        detail: 'Calculates true net profitability before your wheels ever start rolling.',
      },
    ],
    keyPoints: [
      'The Relay Revolution: Seamless trailer handovers with cryptographic SHA-256 e-signatures and instant vehicle condition verification.',
      'Sovereign AI Fleet Swarm: Eight specialized autonomous agents handling DVIR, equipment diagnostics, rate negotiations, and parking reservations.',
      'Zero-Latency In-Cab Telecom: Private carrier communication mesh with dedicated in-cab lines at $12.50/mo, bypassing expensive phone bills.',
      'Untouchable Highway Trust Scores: Real-time Highway and FMCSA trust verification that gets your fleet the highest-paying direct shipper loads.',
    ],
  },
];

export const FounderHumanStorySection: React.FC<FounderHumanStorySectionProps> = ({
  onNavigateToTab,
  onOpenContact,
}) => {
  const [activeChapterId, setActiveChapterId] = useState<
    'what-it-does' | 'how-we-got-here' | 'where-we-are-going'
  >('what-it-does');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [spokenProgress, setSpokenProgress] = useState<number>(0);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'briefing' | 'manifesto'>('briefing');
  const [soundBars, setSoundBars] = useState<number[]>([20, 45, 80, 55, 30, 90, 60, 40, 75, 50, 35, 85]);

  // Founder Voice Studio & Script Overrides State
  const [, setCustomScriptsRev] = useState<number>(0);
  const [isStudioModalOpen, setIsStudioModalOpen] = useState<boolean>(false);
  const [savedRecording, setSavedRecording] = useState<StoredAudioRecording | null>(null);
  const [savedAudioUrl, setSavedAudioUrl] = useState<string | null>(null);
  const [audioPlaybackMode, setLocalAudioPlaybackMode] = useState<'CUSTOM_RECORDING' | 'AI_SYNTHESIS'>('CUSTOM_RECORDING');

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Load custom script overrides if reworded by Jeremiah Morris
  const customScripts = getAllCustomScripts();
  const scriptOverride = customScripts[activeChapterId];
  const baseChapter =
    CHAPTERS_DATA.find((c) => c.id === activeChapterId) || CHAPTERS_DATA[0];

  const activeChapter: Chapter = {
    ...baseChapter,
    title: scriptOverride?.title || baseChapter.title,
    subtitle: scriptOverride?.subtitle || baseChapter.subtitle,
    tagline: scriptOverride?.tagline || baseChapter.tagline,
    spokenScript: scriptOverride?.spokenScript || baseChapter.spokenScript,
    summary: scriptOverride?.summary || baseChapter.summary,
  };

  // Split script into sentences for live visual highlighting
  const sentences = activeChapter.spokenScript
    .split(/(?<=[.?!])\s+/)
    .filter((s) => s.trim().length > 0);

  // Load saved voice recording for active chapter
  const loadRecording = async (chId: typeof activeChapterId) => {
    try {
      const rec = await getFounderAudioRecording(chId);
      if (rec) {
        setSavedRecording(rec.recording);
        setSavedAudioUrl(rec.audioUrl);
      } else {
        setSavedRecording(null);
        setSavedAudioUrl(null);
      }
    } catch {
      setSavedRecording(null);
      setSavedAudioUrl(null);
    }
  };

  // Check speech synthesis support & load recordings on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
    } else {
      setSpeechSupported(false);
    }

    loadRecording(activeChapterId);
    setLocalAudioPlaybackMode(getAudioPlaybackMode());

    const handleVoiceUpdate = () => {
      loadRecording(activeChapterId);
      setCustomScriptsRev((prev) => prev + 1);
    };

    const handleScriptUpdate = () => {
      setCustomScriptsRev((prev) => prev + 1);
    };

    const handleModeUpdate = () => {
      setLocalAudioPlaybackMode(getAudioPlaybackMode());
    };

    window.addEventListener('truckwithease_voice_updated', handleVoiceUpdate);
    window.addEventListener('truckwithease_script_updated', handleScriptUpdate);
    window.addEventListener('truckwithease_audio_mode_changed', handleModeUpdate);

    return () => {
      stopAllAudio();
      window.removeEventListener('truckwithease_voice_updated', handleVoiceUpdate);
      window.removeEventListener('truckwithease_script_updated', handleScriptUpdate);
      window.removeEventListener('truckwithease_audio_mode_changed', handleModeUpdate);
    };
  }, [activeChapterId]);

  // Equalizer animation effect when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isPaused) {
      interval = setInterval(() => {
        setSoundBars(
          Array.from({ length: 14 }, () => Math.floor(Math.random() * 85) + 15)
        );
      }, 90);
    } else {
      setSoundBars([15, 20, 25, 20, 15, 25, 30, 20, 15, 25, 20, 15, 20, 15]);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isPaused]);

  // Stop all audio playback safely
  const stopAllAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setIsPlaying(false);
    setIsPaused(false);
    setSpokenProgress(0);
    setActiveSentenceIndex(0);
  };

  const pauseAllAudio = () => {
    if (audioElementRef.current && isPlaying) {
      audioElementRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setIsPaused(true);
  };

  const resumeAllAudio = () => {
    if (audioElementRef.current && savedAudioUrl && audioPlaybackMode === 'CUSTOM_RECORDING') {
      audioElementRef.current.play().then(() => {
        setIsPlaying(true);
        setIsPaused(false);
      }).catch(() => {
        resumeSpeech();
      });
    } else {
      resumeSpeech();
    }
  };

  // Handle speech synthesis playback (Fallback if no custom voice recorded)
  const startSpeech = (chapterToPlay = activeChapter) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      simulateAudioPlayback(chapterToPlay);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(chapterToPlay.spokenScript);
    utterance.rate = speechRate;
    utterance.pitch = 0.95; // Authoritative trucker cadence

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        (v.name.includes('Natural') ||
          v.name.includes('David') ||
          v.name.includes('Guy') ||
          v.name.includes('George') ||
          v.name.includes('Daniel') ||
          v.name.includes('Male')) &&
        v.lang.startsWith('en')
    ) || voices.find((v) => v.lang.startsWith('en-US')) || voices[0];

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setSpokenProgress(0);
      setActiveSentenceIndex(0);
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') {
        const charIndex = event.charIndex;
        const totalChars = chapterToPlay.spokenScript.length;
        const pct = Math.min(100, Math.round((charIndex / totalChars) * 100));
        setSpokenProgress(pct);

        const currentSentenceIndex = sentences.findIndex((s, idx) => {
          const soFar = sentences.slice(0, idx + 1).join(' ').length;
          return charIndex <= soFar;
        });
        if (currentSentenceIndex >= 0) {
          setActiveSentenceIndex(currentSentenceIndex);
        }
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setSpokenProgress(100);
      setActiveSentenceIndex(sentences.length - 1);
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error, falling back to simulated playback:', e);
      simulateAudioPlayback(chapterToPlay);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  // Main playback starter: uses authentic recorded voice if available, otherwise speech synthesis
  const startPlayback = (chapterToPlay = activeChapter) => {
    stopAllAudio();

    if (savedAudioUrl && audioPlaybackMode === 'CUSTOM_RECORDING') {
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio(savedAudioUrl);
      }
      audioElementRef.current.src = savedAudioUrl;
      audioElementRef.current.playbackRate = speechRate;

      audioElementRef.current.ontimeupdate = () => {
        if (audioElementRef.current && audioElementRef.current.duration) {
          const pct = Math.min(
            100,
            Math.round((audioElementRef.current.currentTime / audioElementRef.current.duration) * 100)
          );
          setSpokenProgress(pct);

          const curSentenceIdx = Math.min(
            sentences.length - 1,
            Math.floor((pct / 100) * sentences.length)
          );
          setActiveSentenceIndex(curSentenceIdx);
        }
      };

      audioElementRef.current.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setSpokenProgress(100);
        setActiveSentenceIndex(sentences.length - 1);
      };

      audioElementRef.current.onerror = () => {
        console.warn('Recorded audio playback error, falling back to speech synthesis');
        startSpeech(chapterToPlay);
      };

      audioElementRef.current.play().then(() => {
        setIsPlaying(true);
        setIsPaused(false);
      }).catch((e) => {
        console.warn('Playback error, falling back to speech synthesis:', e);
        startSpeech(chapterToPlay);
      });
    } else {
      startSpeech(chapterToPlay);
    }
  };

  const simulateAudioPlayback = (chapter: Chapter) => {
    setIsPlaying(true);
    setIsPaused(false);
    setSpokenProgress(0);

    const durationSeconds = 30;
    const stepMs = 500;
    const increment = 100 / ((durationSeconds * 1000) / stepMs);

    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    progressTimerRef.current = setInterval(() => {
      setSpokenProgress((prev) => {
        if (prev >= 100) {
          if (progressTimerRef.current) clearInterval(progressTimerRef.current);
          setIsPlaying(false);
          setIsPaused(false);
          return 100;
        }
        const next = Math.min(100, prev + increment);
        const sentenceIdx = Math.min(
          sentences.length - 1,
          Math.floor((next / 100) * sentences.length)
        );
        setActiveSentenceIndex(sentenceIdx);
        return next;
      });
    }, stepMs);
  };

  const resumeSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      startSpeech(activeChapter);
    }
  };

  const handleSelectChapter = (chapterId: Chapter['id']) => {
    stopAllAudio();
    setActiveChapterId(chapterId);
    setSpokenProgress(0);
    setActiveSentenceIndex(0);
  };

  const handleTogglePlay = () => {
    if (!isPlaying) {
      startPlayback(activeChapter);
    } else if (isPaused) {
      resumeAllAudio();
    } else {
      pauseAllAudio();
    }
  };

  return (
    <section
      id="founder-human-story-section"
      className="relative w-full px-4 sm:px-8 lg:px-12 py-14 bg-gradient-to-b from-[#090C11] via-[#0B0F15] to-[#07090C] border-t-2 border-b-2 border-[#1E2633] overflow-hidden"
    >
      {/* Background kinetic ambient lighting */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#00FF66]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-10">
        {/* SECTION HEADER & PROCLAMATION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#1B2330]">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#131923] border border-[#C9A84C]/40 self-start shadow-[0_0_15px_rgba(201,168,76,0.15)]">
              <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
              <span className="font-mono text-[11px] font-bold text-[#FFD700] tracking-wider uppercase">
                THE HUMAN VOICE OF TRUCKWITHEASE // FOUNDER KEYNOTE
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              WHY WE BUILT TRUCKWITHEASE
              <br />
              <span className="text-[#FFD700]">AND WHAT IT BRINGS TO YOUR FLEET</span>
            </h2>
            <p className="text-sm sm:text-base text-[#9AA5B8] max-w-3xl font-sans leading-relaxed">
              Listen to Jeremiah Morris, Master Commercial Fleet Director and Founder of TRUCKWITHEASE,
              deliver the unfiltered truth about why legacy trucking software fails carriers, how we built a sovereign operating cockpit on the asphalt, and where the future of freight is heading.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-[#0E131C] p-3 rounded-xl border border-[#222C3D] shrink-0 self-start md:self-auto">
            <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/40 flex items-center justify-center text-[#FFD700]">
              <Truck className="w-5 h-5" />
            </div>
            <div className="flex flex-col font-mono text-xs">
              <span className="text-[#7C8799] uppercase text-[10px] font-bold">CARRIER AUTHORITY</span>
              <span className="text-white font-extrabold">USDOT #3928192</span>
              <span className="text-[#00FF66] text-[10px] font-bold">MC-1478201-C · CLASS A CDL</span>
            </div>
          </div>
        </div>

        {/* MAIN INTERACTIVE PRESENTER & AUDIO DECK */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: PRESENTER DOSSIER & AUDIO CONTROLS (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Visual Presenter Card */}
            <div className="bg-[#0D121A] rounded-2xl border-2 border-[#242E3E] p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden group hover:border-[#C9A84C]/50 transition-all">
              {/* Gold Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A84C] via-[#FFD700] to-[#00FF66]" />

              {/* Presenter Profile Strip */}
              <div className="flex items-center gap-4">
                {/* Portrait with Glowing Live Ring */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#FFD700] shadow-[0_0_25px_rgba(255,215,0,0.25)] relative bg-[#141A24]">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                      alt="Jeremiah Morris - Founder of Truckwithease"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        // Fallback avatar if Unsplash has any network delay
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Fallback stylized badge if image is hidden */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1C2430] to-[#0A0D12] flex flex-col items-center justify-center text-[#FFD700]">
                      <Truck className="w-8 h-8 text-[#FFD700]" />
                      <span className="text-[10px] font-mono font-bold mt-1">JM</span>
                    </div>
                  </div>
                  {/* Live Mic Badge */}
                  <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-[#00FF66] text-[#0A0A0A] font-mono text-[9px] font-black uppercase flex items-center gap-1 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A] animate-ping" />
                    <span>ON AIR</span>
                  </div>
                </div>

                {/* Name & Credentials */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#FFD700] uppercase tracking-wider">
                      FOUNDER &amp; FLEET OPERATOR
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                    Jeremiah Morris
                  </h3>
                  <p className="text-xs text-[#9AA5B8] font-sans mt-0.5">
                    Master Commercial Fleet Director &bull; 15+ Yrs Asphalt Hauler
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded bg-[#16202D] border border-[#2A374A] text-[#CCD6E0] text-[10px] font-mono font-bold">
                      USDOT #3928192
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] text-[10px] font-mono font-bold">
                      VERIFIED VANGUARD
                    </span>
                  </div>
                </div>
              </div>

              {/* QUOTE BANNER */}
              <div className="p-4 rounded-xl bg-[#080B0F] border border-[#19222E] relative">
                <span className="text-2xl font-serif text-[#C9A84C]/40 absolute top-2 left-3 leading-none">“</span>
                <p className="text-xs sm:text-sm text-[#D6DEE7] italic font-serif pl-5 leading-relaxed">
                  We didn’t build TRUCKWITHEASE to sit in a glass tower. We built it because we were sick of seeing hard-working drivers and independent fleets get ripped off by broken software that costs thousands and still fails at the roadside scale.
                </p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#141B24] text-[10px] font-mono text-[#7C8799]">
                  <span>RECORDED AT MORRISHIVE HIGHWAY HUB</span>
                  <span className="text-[#FFD700] font-bold">49 CFR § 395 COMPLIANT</span>
                </div>
              </div>

              {/* RECORD MY VOICE & REWORD SCRIPT STUDIO LAUNCH BUTTON */}
              <button
                id="open-founder-voice-studio-btn"
                onClick={() => setIsStudioModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#1E293B] via-[#162130] to-[#111A26] hover:from-[#27354B] hover:to-[#1B2738] border-2 border-[#C9A84C]/70 hover:border-[#FFD700] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(201,168,76,0.2)] hover:shadow-[0_0_30px_rgba(255,215,0,0.35)] active:scale-98 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                    <Mic className="w-4 h-4 text-rose-400 animate-pulse" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-white font-black text-xs leading-tight flex items-center gap-1.5">
                      RECORD MY VOICE &amp; REWORD SCRIPT
                    </span>
                    <span className="text-[10px] text-[#C9A84C] font-semibold leading-tight mt-0.5">
                      {savedRecording ? 'Custom Recording Loaded · Tap to Edit' : 'Add your live voice & custom words'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FFD700]/20 border border-[#FFD700]/40 text-[#FFD700] text-[11px] font-black shrink-0">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>STUDIO</span>
                </div>
              </button>

              {/* AUTHENTIC RECORDING VS AI SYNTHESIS STATUS BADGE */}
              {savedRecording && audioPlaybackMode === 'CUSTOM_RECORDING' ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#00FF66]/10 border border-[#00FF66]/40 text-[#00FF66] text-[11px] font-mono shadow-[0_0_15px_rgba(0,255,102,0.1)]">
                  <div className="flex items-center gap-2 font-bold">
                    <Check className="w-4 h-4 text-[#00FF66]" />
                    <span>AUTHENTIC VOICE ACTIVE: Jeremiah Morris</span>
                  </div>
                  <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-[#00FF66]/20 font-black border border-[#00FF66]/30">
                    {savedRecording.source === 'MIC_RECORDING' ? 'MIC RECORDING' : 'AUDIO FILE'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#131923] border border-[#263345] text-[#9AA5B8] text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>AI Speech Synthesis Active</span>
                  </div>
                  <button
                    onClick={() => setIsStudioModalOpen(true)}
                    className="text-[10px] text-[#FFD700] hover:underline font-bold"
                  >
                    + Record Voice
                  </button>
                </div>
              )}

              {/* AUDIO SYNTHESIS & PLAYBACK CONTROLLER */}
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#090D13] border border-[#1F2937]">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Radio className={`w-4 h-4 ${isPlaying && !isPaused ? 'text-[#00FF66] animate-pulse' : 'text-[#7C8799]'}`} />
                    <span className="font-bold text-white uppercase">
                      {isPlaying && !isPaused
                        ? (savedRecording && audioPlaybackMode === 'CUSTOM_RECORDING'
                            ? 'PLAYING FOUNDER RECORDING'
                            : 'AUDIO KEYNOTE BROADCASTING')
                        : isPaused
                        ? 'AUDIO PAUSED'
                        : 'AUDIO TRANSCEIVER READY'}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#FFD700]">
                    CH {activeChapter.chapterNumber} // {Math.round(spokenProgress)}%
                  </span>
                </div>

                {/* ANIMATED SOUND BARS EQUALIZER */}
                <div className="h-10 w-full bg-[#05070A] rounded-lg p-2 flex items-center justify-between gap-1 border border-[#161D27] overflow-hidden">
                  {soundBars.map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-[#C9A84C] to-[#00FF66] rounded-sm transition-all duration-75"
                      style={{
                        height: isPlaying && !isPaused ? `${height}%` : '18%',
                        opacity: isPlaying && !isPaused ? 0.9 : 0.25,
                      }}
                    />
                  ))}
                </div>

                {/* Progress Scrubbing Bar */}
                <div className="w-full bg-[#161C26] h-1.5 rounded-full overflow-hidden cursor-pointer">
                  <div
                    className="bg-gradient-to-r from-[#C9A84C] to-[#00FF66] h-full transition-all duration-300"
                    style={{ width: `${spokenProgress}%` }}
                  />
                </div>

                {/* Transport Buttons Strip */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  {/* Big Play / Pause Button */}
                  <button
                    id="founder-audio-play-toggle-btn"
                    onClick={handleTogglePlay}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#FFD700] hover:bg-[#F0C800] text-[#0A0A0A] font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] active:scale-95 transition-all cursor-pointer"
                  >
                    {isPlaying && !isPaused ? (
                      <>
                        <Pause className="w-4 h-4 fill-current text-[#0A0A0A]" />
                        <span>PAUSE ADDRESS</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current text-[#0A0A0A]" />
                        <span>{isPaused ? 'RESUME ADDRESS' : 'LISTEN TO FOUNDER ADDRESS'}</span>
                      </>
                    )}
                  </button>

                  {/* Reset Button */}
                  <button
                    id="founder-audio-reset-btn"
                    onClick={() => {
                      stopAllAudio();
                      startPlayback(activeChapter);
                    }}
                    title="Restart current chapter"
                    className="p-3 rounded-xl bg-[#131923] hover:bg-[#1A2330] border border-[#243040] text-[#CCD6E0] hover:text-[#FFD700] transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Speech Rate Controls */}
                  <div className="flex items-center bg-[#131923] rounded-xl border border-[#243040] p-1 text-[10px] font-mono font-bold text-[#7C8799]">
                    {[1.0, 1.25, 1.5].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => {
                          setSpeechRate(rate);
                          if (isPlaying) {
                            stopAllAudio();
                            setTimeout(() => startPlayback(activeChapter), 100);
                          }
                        }}
                        className={`px-2 py-1 rounded transition-colors ${
                          speechRate === rate
                            ? 'bg-[#FFD700] text-[#0A0A0A]'
                            : 'hover:text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#6E7B8E] pt-1">
                  <span>
                    {savedRecording && audioPlaybackMode === 'CUSTOM_RECORDING'
                      ? '🎙️ AUTHENTIC VOICE (JEREMIAH MORRIS)'
                      : 'HD VOICE SPEECH SYNTHESIS'}
                  </span>
                  <span className="text-[#00FF66]">CH {activeChapter.chapterNumber} LOADED</span>
                </div>
              </div>

              {/* Direct Hotline Callout */}
              <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#101620] border border-[#243042]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#7C8799] uppercase block font-bold">
                      TALK TO FOUNDER &amp; FLEET OPS
                    </span>
                    <a
                      href="tel:6367068338"
                      className="text-xs font-mono font-extrabold text-white hover:text-[#FFD700] transition-colors"
                    >
                      636-706-8338 (24/7 HOTLINE)
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (onNavigateToTab) onNavigateToTab('dispatch');
                  }}
                  className="px-3 py-1.5 rounded bg-[#182230] hover:bg-[#202E42] border border-[#2D3E54] text-[#CCD6E0] hover:text-white font-mono text-[10px] font-bold uppercase transition-colors"
                >
                  DISPATCH CONSOLE &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: THE 3 CHAPTERS OF TRUCKWITHEASE (7 COLS) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* CHAPTER TABS SELECTOR */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#0C1017] p-2 rounded-2xl border border-[#1E2736]">
              {CHAPTERS_DATA.map((ch) => {
                const isActive = activeChapterId === ch.id;
                return (
                  <button
                    key={ch.id}
                    id={`chapter-tab-${ch.id}`}
                    onClick={() => handleSelectChapter(ch.id)}
                    className={`flex flex-col items-start p-3 rounded-xl text-left transition-all cursor-pointer relative overflow-hidden ${
                      isActive
                        ? 'bg-[#151D29] border border-[#FFD700]/60 shadow-[0_0_15px_rgba(255,215,0,0.12)]'
                        : 'hover:bg-[#111722] border border-transparent'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#FFD700]" />
                    )}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase ${
                          isActive ? 'text-[#FFD700]' : 'text-[#6E7B8E]'
                        }`}
                      >
                        CHAPTER {ch.chapterNumber}
                      </span>
                      {isActive && isPlaying && !isPaused && (
                        <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-ping" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-black uppercase mt-1 tracking-tight leading-snug line-clamp-2 ${
                        isActive ? 'text-white' : 'text-[#8C9BAE]'
                      }`}
                    >
                      {ch.id === 'what-it-does' && '1. What It Does For A Fleet'}
                      {ch.id === 'how-we-got-here' && '2. How We Got Here'}
                      {ch.id === 'where-we-are-going' && '3. Where We Are Going'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ACTIVE CHAPTER DETAIL CARD */}
            <div className="bg-[#0B0F16] rounded-2xl border-2 border-[#1E2635] p-6 sm:p-8 flex flex-col gap-6 shadow-xl relative overflow-hidden">
              {/* Active Chapter Header */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#FFD700] text-[10px] font-mono font-bold uppercase tracking-wider">
                      CHAPTER {activeChapter.chapterNumber} &bull; {activeChapter.badge}
                    </span>
                    <span className="text-[10px] font-mono text-[#00FF66] font-bold">
                      VERIFIED OPERATIONAL BRIEFING
                    </span>
                  </div>

                  {/* Toggle between Briefing View and Full Spoken Script */}
                  <div className="flex items-center bg-[#131A24] rounded-lg p-0.5 border border-[#202B3A] text-[10px] font-mono">
                    <button
                      onClick={() => setViewMode('briefing')}
                      className={`px-2.5 py-1 rounded font-bold uppercase transition-colors ${
                        viewMode === 'briefing'
                          ? 'bg-[#FFD700] text-[#0A0A0A]'
                          : 'text-[#8C9BAE] hover:text-white'
                      }`}
                    >
                      EXECUTIVE SUMMARY
                    </button>
                    <button
                      onClick={() => setViewMode('manifesto')}
                      className={`px-2.5 py-1 rounded font-bold uppercase transition-colors ${
                        viewMode === 'manifesto'
                          ? 'bg-[#FFD700] text-[#0A0A0A]'
                          : 'text-[#8C9BAE] hover:text-white'
                      }`}
                    >
                      VERBATIM TRANSCRIPT
                    </button>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase tracking-tight mt-1">
                  {activeChapter.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#FFD700] font-mono font-semibold">
                  {activeChapter.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-[#9AA5B8] leading-relaxed italic border-l-2 border-[#C9A84C] pl-3 py-1 bg-[#10151E] rounded-r">
                  &ldquo;{activeChapter.tagline}&rdquo;
                </p>
              </div>

              {/* VIEW 1: EXECUTIVE BRIEFING MODE */}
              {viewMode === 'briefing' ? (
                <div className="flex flex-col gap-6 animate-fadeIn">
                  {/* 4 Impact Metric Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {activeChapter.highlights.map((h, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#0F141D] border border-[#1E2837] flex flex-col justify-between gap-2 hover:border-[#FFD700]/40 transition-colors"
                      >
                        <span className="text-[9px] font-mono text-[#7C8799] uppercase font-bold tracking-wider leading-tight">
                          {h.label}
                        </span>
                        <div className="text-lg sm:text-xl font-mono font-black text-[#FFD700] leading-none">
                          {h.metric}
                        </div>
                        <p className="text-[10px] text-[#8C9BAE] leading-normal font-sans">
                          {h.detail}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Strategic Key Action Points */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[11px] font-mono font-bold text-[#CCD6E0] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
                      <span>MISSION-CRITICAL FLEET CAPABILITIES</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeChapter.keyPoints.map((pt, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-[#0E131C] border border-[#1A2330] flex items-start gap-2.5 text-xs text-[#D0D7E1] leading-relaxed"
                        >
                          <div className="w-4 h-4 rounded-full bg-[#00FF66]/20 border border-[#00FF66] flex items-center justify-center shrink-0 mt-0.5 text-[#00FF66]">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* VIEW 2: VERBATIM SPOKEN TRANSCRIPT WITH SENTENCE TRACKING */
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <div className="p-4 rounded-xl bg-[#070A0F] border border-[#1A2332] text-xs sm:text-sm leading-relaxed text-[#CCD6E0] font-sans flex flex-col gap-3 max-h-[380px] overflow-y-auto">
                    <div className="flex items-center justify-between pb-2 border-b border-[#141B25] text-[10px] font-mono text-[#7C8799]">
                      <span className="text-[#FFD700] font-bold">
                        FOUNDER TRANSCRIPT &bull; JEREMIAH MORRIS (DIRECT AUDIO FEED)
                      </span>
                      <span>{sentences.length} PASSAGES</span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {sentences.map((sentence, idx) => {
                        const isCurrentlySpoken =
                          isPlaying && !isPaused && activeSentenceIndex === idx;
                        return (
                          <p
                            key={idx}
                            onClick={() => {
                              setActiveSentenceIndex(idx);
                            }}
                            className={`p-2 rounded-lg transition-all cursor-pointer ${
                              isCurrentlySpoken
                                ? 'bg-[#FFD700]/15 text-[#FFFFFF] border-l-4 border-[#FFD700] font-medium shadow-sm'
                                : 'hover:bg-[#101520] text-[#9AA5B8]'
                            }`}
                          >
                            <span className="text-[10px] font-mono text-[#556275] mr-2">
                              [{idx + 1}]
                            </span>
                            {sentence}
                          </p>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-[11px] font-mono text-[#7C8799]">
                    Click any passage above to jump or review. Press &ldquo;Listen to Founder Address&rdquo; on the left to listen with live voice synthesis.
                  </p>
                </div>
              )}

              {/* Bottom Quick-Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#18212D]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!isPlaying) {
                        startSpeech(activeChapter);
                      } else {
                        handleTogglePlay();
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#FFD700] text-black font-mono font-bold text-xs uppercase flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>PLAY THIS CHAPTER ALOUD</span>
                  </button>

                  <a
                    href="tel:6367068338"
                    className="px-4 py-2 rounded-lg bg-[#141B26] hover:bg-[#1E2938] border border-[#2B394E] text-[#E0E6ED] font-mono font-bold text-xs uppercase flex items-center gap-1.5 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>CALL FOUNDER: 636-706-8338</span>
                  </a>
                </div>

                {/* Next Chapter Switcher */}
                <button
                  onClick={() => {
                    const currentIndex = CHAPTERS_DATA.findIndex(
                      (c) => c.id === activeChapterId
                    );
                    const nextIndex = (currentIndex + 1) % CHAPTERS_DATA.length;
                    handleSelectChapter(CHAPTERS_DATA[nextIndex].id);
                  }}
                  className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#FFD700] hover:underline"
                >
                  <span>NEXT CHAPTER: {activeChapterId === 'what-it-does' ? 'HOW WE GOT HERE' : activeChapterId === 'how-we-got-here' ? 'WHERE WE ARE GOING' : 'WHAT IT BRINGS'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3 HIGHLIGHT CARDS: SUMMARY OF THE FLEET ADVANTAGE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-2xl bg-[#090C11] border border-[#1C2432] flex flex-col gap-3 hover:border-[#FFD700]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center text-[#FFD700]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black uppercase text-white tracking-tight">
              1. Bulletproof Compliance &amp; Low-Bridge Radar
            </h4>
            <p className="text-xs text-[#8C9BAE] leading-relaxed">
              We eliminate form-and-manner citations before they happen and safeguard your rigs from 13&apos;6&quot; overhead strikes using FHWA Item 54B national bridge coordinates.
            </p>
            <div className="mt-auto pt-2">
              <button
                onClick={() => {
                  if (onNavigateToTab) onNavigateToTab('hos');
                }}
                className="text-[11px] font-mono font-bold text-[#FFD700] hover:underline flex items-center gap-1"
              >
                <span>OPEN HOS / ELD ENGINE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#090C11] border border-[#1C2432] flex flex-col gap-3 hover:border-[#00FF66]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66]">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black uppercase text-white tracking-tight">
              2. Dispatch Zero &amp; Autonomous Handover
            </h4>
            <p className="text-xs text-[#8C9BAE] leading-relaxed">
              One-click rate-con OCR data extraction, dynamic relay driver handoffs, and instant SHA-256 e-signed bills of lading keep trucks generating revenue instead of waiting on paperwork.
            </p>
            <div className="mt-auto pt-2">
              <button
                onClick={() => {
                  if (onNavigateToTab) onNavigateToTab('dispatch');
                }}
                className="text-[11px] font-mono font-bold text-[#00FF66] hover:underline flex items-center gap-1"
              >
                <span>LAUNCH DISPATCH CONSOLE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#090C11] border border-[#1C2432] flex flex-col gap-3 hover:border-[#CCD6E0]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#182230] border border-[#2A394E] flex items-center justify-center text-white">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black uppercase text-white tracking-tight">
              3. The Sovereign Carrier Network
            </h4>
            <p className="text-xs text-[#8C9BAE] leading-relaxed">
              Experience the power of the Nationwide Relay Mesh, where regional carriers coordinate relay legs across Interstate corridors so trailers roll 24/7 while drivers return home nightly.
            </p>
            <div className="mt-auto pt-2">
              <button
                onClick={() => {
                  if (onNavigateToTab) onNavigateToTab('ecosystem');
                }}
                className="text-[11px] font-mono font-bold text-white hover:underline flex items-center gap-1"
              >
                <span>VIEW ECOSYSTEM MESH</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOUNDER VOICE RECORDING & SCRIPT REWORDING STUDIO MODAL */}
      <FounderVoiceStudioModal
        isOpen={isStudioModalOpen}
        onClose={() => setIsStudioModalOpen(false)}
        defaultChapterId={activeChapterId}
      />
    </section>
  );
};
