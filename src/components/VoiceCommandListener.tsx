import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Zap,
  CheckCircle2,
  AlertCircle,
  Command,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  HelpCircle,
  Radio,
  Sliders,
  RotateCcw,
  Activity,
  Play,
  Moon,
  Clock,
  Truck,
  FastForward,
  Vibrate,
  FileAudio,
  ExternalLink,
  Fuel,
  MapPin,
  Navigation,
  Phone,
  ArrowRight,
  DollarSign,
  Award,
  Layers,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { TabType } from '../types';
import { triggerHapticFeedback, isVibrationSupported } from '../services/haptics';
import { useVoiceSettings } from '../services/voiceSettingsService';
import {
  matchVoicePhraseToCommand,
  VoiceCommandSample,
  getAllCommandVoiceSamples,
} from '../services/voiceCommandSampleService';
import { CommandVoiceSampleStudioModal } from './CommandVoiceSampleStudioModal';
import { DatBoardLoad, INITIAL_LIVE_LOADS } from '../services/datLoadBoardService';
import { FuelStationStop, getNextFuelStation } from '../services/fuelStationService';
import {
  findDriverByNameOrQuery,
  DriverDotDossier,
  INITIAL_DRIVER_DOSSIERS,
} from '../services/driverIntelligenceService';
import { DriverDotDossierModal } from './DriverDotDossierModal';
import { DriverIntelligenceModal } from './DriverIntelligenceModal';
import {
  parseDvirVoiceCommand,
  dispatchDvirVoiceAction,
  DvirVoiceAction,
} from '../services/dvirVoiceCommandService';

export interface VoiceCommandListenerProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onPollAll: () => void;
  latency?: number;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenVoiceCommandsModal?: () => void;
  onOpenSafetyMeetings?: () => void;
}

interface CommandMatch {
  type:
    | 'NAVIGATE'
    | 'POLL_ALL'
    | 'NOTIFICATIONS'
    | 'PROFILE'
    | 'STATUS'
    | 'VOICE_SLEEP'
    | 'RESUME_VOICE'
    | 'VOICE_HELP'
    | 'FIND_LOAD'
    | 'FIND_FUEL'
    | 'GOAT_IN_CAB'
    | 'DRIVER_DOT'
    | 'DRIVER_INTELLIGENCE'
    | 'SAFETY_MEETINGS'
    | 'DVIR_ACTION';
  targetTab?: TabType;
  label: string;
  responseVoice: string;
  commandId?: string;
  matchedLoads?: DatBoardLoad[];
  matchedFuelStation?: FuelStationStop;
  matchedDriver?: DriverDotDossier;
  dvirAction?: DvirVoiceAction;
}

interface CommandHistoryItem {
  id: string;
  timestamp: string;
  transcript: string;
  matchedAction: string;
  success: boolean;
}

// Complete Tab Definitions for Voice Mapping
const TAB_VOICE_MAP: { tab: TabType; name: string; keywords: string[] }[] = [
  { tab: 'core-console', name: 'Core Engine Console', keywords: ['console', 'core console', 'core engine', 'engine', 'dashboard', 'home', 'main'] },
  { tab: 'dispatch', name: 'Dispatch Zero', keywords: ['dispatch', 'dispatch zero', 'loads', 'pending loads', 'orders', 'open dispatch', 'navigate to dispatch', 'go to dispatch', 'show dispatch'] },
  { tab: 'hos', name: 'HOS & ELD Clocks', keywords: ['hos', 'hours of service', 'eld', 'duty status', 'clocks', 'logbook', 'driving clock', 'open hos', 'navigate to hos'] },
  { tab: 'nighthud', name: 'In-Cab Night HUD', keywords: ['night hud', 'hud', 'in cab hud', 'in-cab hud', 'roadside', 'inspection', 'night mode', 'dark hud', 'inspection mode', 'open hud', 'toggle night hud', 'toggle hud', 'navigate to night hud'] },
  { tab: 'cockpit', name: 'Mobile & Radar Cockpit', keywords: ['cockpit', 'mobile cockpit', 'radar', 'low bridge', 'bridges', 'bridge radar', 'open radar', 'geofence', 'geofencing'] },
  { tab: 'goat', name: 'G.O.A.T. Load Board', keywords: ['goat', 'load board', 'open load board', 'the load board', 'freight board', 'find loads', 'bids', 'loadboard', 'show load board'] },
  { tab: 'dvir-agent', name: 'Autonomous DVIR Audit Agent', keywords: ['dvir', 'dvir agent', 'start dvir audit', 'dvir audit', 'start dvir', 'pre-trip dvir', 'post-trip dvir', 'vehicle inspection', 'walk around', 'autonomous dvir', 'open dvir'] },
  { tab: 'quantum-optimizer', name: 'Multi-State Load Optimizer', keywords: ['load optimizer', 'multi state', 'multi state load optimizer', 'route optimizer', 'quantum', 'qubit'] },
  { tab: 'messaging', name: 'CB Radio & In-Cab Messaging', keywords: ['messaging', 'messages', 'chat', 'cb radio', 'radio', 'comms', 'cb'] },
  { tab: 'cinema', name: 'Sleeper Berth Cinema', keywords: ['cinema', 'sleeper', 'sleeper berth', 'youtube', 'movies', 'video', 'lounge', 'entertainment'] },
  { tab: 'parking', name: 'Parking Intelligence', keywords: ['parking', 'truck stop', 'rest area', 'parking spots', 'find parking'] },
  { tab: 'telemetry', name: 'Live Telemetry & Gauges', keywords: ['telemetry', 'gauges', 'speed', 'live telemetry', 'sensors'] },
  { tab: 'tutorials', name: 'Tutorials & Operator Manual', keywords: ['tutorial', 'tutorials', 'guide', 'manual', 'help', 'operator manual', 'instructions'] },
  { tab: 'agents', name: 'AI Agent Swarm', keywords: ['agents', 'agent', 'ai agents', 'swarm', 'fleet ai', 'co-pilot'] },
  { tab: 'maintenance', name: 'Fleet Maintenance', keywords: ['maintenance', 'repairs', 'service', 'shop', 'pm service', 'repair'] },
  { tab: 'ifta', name: 'IFTA Fuel Tax Calculator', keywords: ['ifta', 'fuel tax', 'fuel taxes', 'fuel reports', 'fuel gallons'] },
  { tab: 'vault', name: 'Security Vault & HSM', keywords: ['vault', 'security vault', 'crypto vault', 'keys', 'cryptographic', 'hsm'] },
  { tab: 'traxes', name: 'Traxes Driver Advocate', keywords: ['traxes', 'driver advocate', 'advocate', 'traxes ai'] },
  { tab: 'compliance', name: 'FMCSA Safety & Compliance', keywords: ['compliance', 'fmcsa', 'safety audit', 'dot audit', 'safety score'] },
  { tab: 'drivers', name: 'Driver HR & Onboarding', keywords: ['driver onboarding', 'drivers', 'hr', 'driver roster', 'recruitment'] },
  { tab: 'assets', name: 'Fleet Asset Management', keywords: ['assets', 'equipment', 'trailers', 'trucks', 'tractors', 'fleet inventory'] },
  { tab: 'drive', name: 'Google Drive Document Sync', keywords: ['drive', 'google drive', 'documents', 'paperwork', 'bol', 'bills of lading', 'cloud files'] },
  { tab: 'orchestrator', name: 'Launchpad Orchestrator', keywords: ['orchestrator', 'launchpad', 'command center', 'tier 5', 'enterprise cockpit'] },
  { tab: 'ecosystem', name: 'Ecosystem Trust Hub', keywords: ['ecosystem', 'trust hub', 'partners', 'integrations list'] },
  { tab: 'hub', name: 'Integration Hub & Mesh', keywords: ['hub', 'integration hub', 'mesh', 'pipelines', 'connectors'] },
  { tab: 'haptics', name: 'Haptics Suite', keywords: ['haptics', 'seat vibration', 'haptic alerts', 'vibration suite'] },
  { tab: 'providers', name: 'Telematics Providers', keywords: ['providers', 'carriers', 'telematics hardware'] },
  { tab: 'security', name: 'Platform Security', keywords: ['security', 'firewall', 'cybersecurity'] },
  { tab: 'packaging', name: 'Storefront Packaging', keywords: ['storefront', 'packaging', 'marketplace', 'samsara app'] },
  { tab: 'overview-ad', name: 'Platform Overview', keywords: ['overview', 'platform overview', 'ad', 'showcase'] },
  { tab: 'eld-audit', name: 'ELD Daily Audit', keywords: ['eld audit', 'pdf audit', 'daily audit'] },
  { tab: 'load-sheets', name: 'Load Rate Confirmation Sheets', keywords: ['load sheets', 'rate con sheets', 'rate confirmation', '80k sheet'] },
  { tab: 'telecom', name: 'Carrier Telecom Lines', keywords: ['telecom', 'phone', 'phone lines', 'twilio'] },
  { tab: 'admin-console', name: 'Admin Console & Projections', keywords: ['admin console', 'executive admin', 'revenue table', 'churn'] },
  { tab: 'gmail', name: 'Dispatch Gmail Workspace', keywords: ['gmail', 'email', 'inbox', 'dispatch email'] },
  { tab: 'fuel-idle', name: 'Fuel & Idle Waste Sentinel', keywords: ['fuel idle', 'idle waste', 'fuel management'] },
  { tab: 'safety-meetings', name: 'Driver Safety Meetings', keywords: ['safety meeting', 'safety meetings', 'driver safety', 'safety briefing', 'safety training', 'fmcsa meeting'] },
];

export const VoiceCommandListener: React.FC<VoiceCommandListenerProps> = ({
  activeTab,
  onChangeTab,
  onPollAll,
  latency = 18,
  onOpenNotifications,
  onOpenProfile,
  onOpenVoiceCommandsModal,
  onOpenSafetyMeetings,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isContinuous, setIsContinuous] = useState(true);
  const [voiceSpeechFeedback, setVoiceSpeechFeedback] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDockDismissed, setIsDockDismissed] = useState(false);
  const [activeMatchedLoads, setActiveMatchedLoads] = useState<DatBoardLoad[]>([]);
  const [activeFuelStation, setActiveFuelStation] = useState<FuelStationStop | null>(null);
  const [spokenResponseText, setSpokenResponseText] = useState<string | null>(null);
  const [isBookingSuccess, setIsBookingSuccess] = useState<string | null>(null);
  const [activeDotDriver, setActiveDotDriver] = useState<DriverDotDossier | null>(null);
  const [isDotModalOpen, setIsDotModalOpen] = useState(false);
  const [activeIntelligenceDriver, setActiveIntelligenceDriver] = useState<DriverDotDossier | null>(null);
  const [isIntelligenceModalOpen, setIsIntelligenceModalOpen] = useState(false);
  const [activeDvirAction, setActiveDvirAction] = useState<DvirVoiceAction | null>(null);
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [waveformBars, setWaveformBars] = useState<number[]>([3, 4, 3, 4, 3, 4]);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);

  // In-Cab Voice Listener Settings (Microphone Sensitivity Threshold & Noise Gate)
  const { settings: voiceSettings } = useVoiceSettings();
  const voiceSettingsRef = useRef(voiceSettings);
  useEffect(() => {
    voiceSettingsRef.current = voiceSettings;
  }, [voiceSettings]);

  // Truck Parked & Voice Sleep Telematics State (5 min auto-sleep timeout)
  const [truckMotionState, setTruckMotionState] = useState<'PARKED' | 'DRIVING'>('PARKED');
  const [parkedSince, setParkedSince] = useState<number>(() => Date.now() - 75000); // Initialized 1m 15s parked
  const [parkedSeconds, setParkedSeconds] = useState<number>(75);
  const [isVoiceSleeping, setIsVoiceSleeping] = useState<boolean>(false);
  const [voiceSleepTriggerTime, setVoiceSleepTriggerTime] = useState<string | null>(null);

  // In-Cab Driver Haptic Feedback State (Vibration API confirmation)
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);
  const [hapticActive, setHapticActive] = useState<boolean>(false);
  const [hapticsSupported, setHapticsSupported] = useState<boolean>(() => isVibrationSupported());
  const [hapticPulseCount, setHapticPulseCount] = useState<number>(0);
  const hapticsEnabledRef = useRef(true);

  // Recorded Voice Command Samples State
  const [commandAudioSamples, setCommandAudioSamples] = useState<
    Record<string, { audioUrl: string; duration: number; source: string; recordedAt: string }>
  >({});
  const [isSampleStudioOpen, setIsSampleStudioOpen] = useState(false);
  const activeTabRef = useRef<TabType>(activeTab);

  // Sync activeTab ref and enforce silent mode + background listening in In-Cab HUD
  useEffect(() => {
    activeTabRef.current = activeTab;
    if (activeTab === 'nighthud') {
      // Silence active speech synthesis immediately
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      // Ensure microphone remains background-active in In-Cab HUD
      if (!isListeningRef.current && !isVoiceSleepingRef.current) {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
            setIsListening(true);
          } catch {
            // Ignore start error if already running
          }
        }
      }
    }
  }, [activeTab]);

  // Load saved command audio samples from IndexedDB
  const refreshCommandAudioSamples = useCallback(async () => {
    const samples = await getAllCommandVoiceSamples();
    setCommandAudioSamples(samples);
  }, []);

  useEffect(() => {
    refreshCommandAudioSamples();
    const handler = () => {
      refreshCommandAudioSamples();
    };
    window.addEventListener('truckwithease_command_sample_saved', handler);
    return () => window.removeEventListener('truckwithease_command_sample_saved', handler);
  }, [refreshCommandAudioSamples]);

  useEffect(() => {
    hapticsEnabledRef.current = hapticsEnabled;
  }, [hapticsEnabled]);

  useEffect(() => {
    setHapticsSupported(isVibrationSupported());
  }, []);

  const triggerHapticPulse = useCallback(
    (type: 'subtle' | 'success' | 'double' | 'tick' | 'alert' | 'resume' = 'subtle') => {
      if (!hapticsEnabledRef.current) return false;
      const success = triggerHapticFeedback(type);
      setHapticActive(true);
      setHapticPulseCount((prev) => prev + 1);
      setTimeout(() => setHapticActive(false), 450);
      return success;
    },
    []
  );

  // Reliable Hands-Free dock dismiss & expand handlers
  const handleCloseDock = useCallback(() => {
    triggerHapticPulse('tick');
    setIsExpanded(false);
    setIsDockDismissed(true);
  }, [triggerHapticPulse]);

  const handleOpenDock = useCallback(() => {
    triggerHapticPulse('tick');
    setIsDockDismissed(false);
    setIsExpanded(true);
  }, [triggerHapticPulse]);

  // Escape key automatically dismisses Hands-Free dock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded && !isDockDismissed) {
        handleCloseDock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, isDockDismissed, handleCloseDock]);

  // Recognition ref & Web Audio analyser refs
  const recognitionRef = useRef<any>(null);
  const restartTimerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isListeningRef = useRef(false);
  const isVoiceSleepingRef = useRef(false);
  const truckMotionStateRef = useRef<'PARKED' | 'DRIVING'>('PARKED');
  const interimTranscriptRef = useRef('');
  const audioLevelRef = useRef(0);

  useEffect(() => {
    isVoiceSleepingRef.current = isVoiceSleeping;
  }, [isVoiceSleeping]);

  useEffect(() => {
    truckMotionStateRef.current = truckMotionState;
  }, [truckMotionState]);

  // Audio chimes
  const playTone = useCallback((type: 'success' | 'alert' | 'start' | 'poll' | 'sleep') => {
    // Zero-glare roadside silence: Mute all audio chimes while in In-Cab HUD view
    if (activeTabRef.current === 'nighthud') {
      return;
    }
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'poll') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        osc.frequency.setValueAtTime(1320, now + 0.16);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        osc.start(now);
        osc.stop(now + 0.26);
      } else if (type === 'start') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(392, now); // G4
        osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.1); // D5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'sleep') {
        // Falling warm sine tone for Voice Sleep / Micro-power down
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.28); // A3
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  // Text-To-Speech audio feedback for driver
  const speakVoice = useCallback(
    (text: string) => {
      // Zero-glare roadside silence: Mute all audible TTS while in In-Cab HUD view
      if (activeTabRef.current === 'nighthud') {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        return;
      }
      if (!voiceSpeechFeedback) return;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.1;
          utterance.pitch = 1.0;
          utterance.volume = 0.85;
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn('Speech synthesis unavailable', e);
        }
      }
    },
    [voiceSpeechFeedback]
  );

  // Sync refs for audio loop
  useEffect(() => {
    interimTranscriptRef.current = interimTranscript;
  }, [interimTranscript]);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  // Real-time audio stream capture & volume waveform visualizer
  const stopAudioCapture = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {
        // Ignore track stop errors
      }
      mediaStreamRef.current = null;
    }
    if (micSourceRef.current) {
      try {
        micSourceRef.current.disconnect();
      } catch {
        // Ignore disconnect errors
      }
      micSourceRef.current = null;
    }
    analyserRef.current = null;
    setVolumeLevel(0);
    setWaveformBars([3, 3, 3, 3, 3, 3]);
  }, []);

  const startAudioCapture = useCallback(async () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new AudioContextClass();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
          await ctx.resume().catch(() => {});
        }

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            });
            mediaStreamRef.current = stream;

            const analyser = ctx.createAnalyser();
            analyser.fftSize = 32;
            analyser.smoothingTimeConstant = 0.45;
            analyserRef.current = analyser;

            const source = ctx.createMediaStreamSource(stream);
            micSourceRef.current = source;
            source.connect(analyser);
            // CRITICAL: Do NOT connect to ctx.destination to avoid audio feedback/howling!
          } catch (micErr) {
            console.warn('Microphone stream for visual waveform restricted or unavailable:', micErr);
          }
        }
      }
    } catch (e) {
      console.warn('Web Audio capture setup error:', e);
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const loop = () => {
      if (!isListeningRef.current) {
        setVolumeLevel(0);
        setWaveformBars([3, 3, 3, 3, 3, 3]);
        return;
      }

      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        // Sensitivity boost for voice input
        const vol = Math.min(100, Math.round((avg / 255) * 100 * 1.6));
        setVolumeLevel(vol);
        setAudioLevel(vol);

        // Select 6 frequency bins distributed across spectrum
        const sampleBins = [0, 2, 4, 7, 10, 13];
        const newBars = sampleBins.map((binIdx, i) => {
          const val = dataArray[binIdx] || 0;
          if (vol < 3) {
            return 3 + (i % 2 === 0 ? 1 : 0);
          }
          return Math.max(3, Math.min(18, Math.round((val / 255) * 15 + 3)));
        });
        setWaveformBars(newBars);
      } else {
        // Dynamic fallback when microphone stream is sandboxed
        const time = Date.now() / 150;
        const isSpeaking = Boolean(interimTranscriptRef.current) || audioLevelRef.current > 30;
        const baseVol = isSpeaking ? 65 : 12;
        setVolumeLevel(baseVol);

        const newBars = [0, 1, 2, 3, 4, 5].map((i) => {
          const wave = Math.sin(time + i * 0.9) * 0.5 + 0.5;
          const factor = isSpeaking ? 14 : 3;
          return Math.max(3, Math.round(3 + wave * factor));
        });
        setWaveformBars(newBars);
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  }, []);

  // Sync audio capture with isListening state
  useEffect(() => {
    isListeningRef.current = isListening;
    if (isListening) {
      startAudioCapture();
    } else {
      stopAudioCapture();
    }
    return () => {
      stopAudioCapture();
    };
  }, [isListening, startAudioCapture, stopAudioCapture]);

  // Command parser
  const parseCommand = useCallback(
    (phrase: string): CommandMatch | null => {
      const clean = phrase.toLowerCase().trim();

      // 0. Check registered/custom voice command samples first (e.g. "Open load board", "Start DVIR audit")
      const sampleMatch = matchVoicePhraseToCommand(clean);
      if (sampleMatch) {
        if (sampleMatch.actionType === 'POLL_ALL') {
          return {
            type: 'POLL_ALL',
            label: sampleMatch.label,
            responseVoice: sampleMatch.responseSpeech,
            commandId: sampleMatch.id,
          };
        }
        if (sampleMatch.targetTab) {
          return {
            type: 'NAVIGATE',
            targetTab: sampleMatch.targetTab,
            label: sampleMatch.label,
            responseVoice: sampleMatch.responseSpeech,
            commandId: sampleMatch.id,
          };
        }
      }

      // 0.5. Check Autonomous DVIR Field Population & Defect Logging (e.g. "Record a flat tire on axle three", "Set unit number to 104-E", "Set odometer to 143,210")
      const dvirAction = parseDvirVoiceCommand(phrase);
      if (dvirAction) {
        return {
          type: 'DVIR_ACTION',
          label: dvirAction.summaryLabel,
          responseVoice: dvirAction.spokenResponse,
          dvirAction,
        };
      }

      // 1. Check Find Load (e.g. "can you find me a load from Arizona to Missouri", "find load", "freight")
      if (
        clean.includes('load') ||
        clean.includes('freight') ||
        (clean.includes('arizona') && clean.includes('missouri'))
      ) {
        if (
          clean.includes('find') ||
          clean.includes('search') ||
          clean.includes('get') ||
          clean.includes('arizona') ||
          clean.includes('missouri') ||
          clean.includes('az') ||
          clean.includes('mo') ||
          clean.includes('to') ||
          clean.includes('from') ||
          clean.includes('show')
        ) {
          const isAzToMo = clean.includes('arizona') || clean.includes('missouri') || clean.includes('az') || clean.includes('mo');
          const azMoLoads = INITIAL_LIVE_LOADS.filter(l => (l.originState === 'AZ' && l.destState === 'MO') || l.id === 'DAT-88947' || l.id === 'DAT-88948');
          const finalLoads = (isAzToMo && azMoLoads.length > 0) ? azMoLoads : INITIAL_LIVE_LOADS.slice(0, 3);
          const topPick = finalLoads[0] || INITIAL_LIVE_LOADS[0];

          return {
            type: 'FIND_LOAD',
            label: isAzToMo ? 'G.O.A.T. Loads: Arizona ➔ Missouri' : `G.O.A.T. Loads: ${topPick.originCity} ➔ ${topPick.destCity}`,
            responseVoice: isAzToMo
              ? `Found 2 high-paying loads from Arizona to Missouri on the G.O.A.T. board. Top paying: Phoenix to Kansas City, paying $${topPick.rateUsd} at $${topPick.ratePerMile} per mile.`
              : `Found ${finalLoads.length} available loads on the G.O.A.T. board. Top corridor paying $${topPick.rateUsd} at $${topPick.ratePerMile} per mile.`,
            matchedLoads: finalLoads,
          };
        }
      }

      // 2. Check Find Next Fuel Station (e.g. "can you find the next fuel station", "next fuel", "diesel", "truck stop")
      if (
        clean.includes('fuel') ||
        clean.includes('diesel') ||
        clean.includes('truck stop') ||
        clean.includes('gas station')
      ) {
        const station = getNextFuelStation(clean);
        return {
          type: 'FIND_FUEL',
          label: `Next Fuel: ${station.name} (${station.distanceMiles} mi)`,
          responseVoice: `The next fuel station is ${station.name} on ${station.highway} ${station.exitNumber}, ${Math.round(station.distanceMiles)} miles ahead. In-network diesel price is $${station.netDieselPrice.toFixed(2)} per gallon with a ${Math.round(station.carrierDiscount * 100)}-cent discount, and DEF is available at all ${station.truckBays} lanes.`,
          matchedFuelStation: station,
        };
      }

      // 3. Check Integrate GOAT into In-Cab / Open In-Cab GOAT
      if (clean.includes('goat') || clean.includes('g.o.a.t')) {
        if (
          clean.includes('in cab') ||
          clean.includes('incab') ||
          clean.includes('in-cab') ||
          clean.includes('integrate') ||
          clean.includes('cockpit') ||
          clean.includes('terminal')
        ) {
          return {
            type: 'GOAT_IN_CAB',
            label: 'In-Cab G.O.A.T. Spot Freight',
            responseVoice: 'Integrating G.O.A.T. load board into your in-cab cockpit display.',
            targetTab: 'nighthud',
          };
        }
      }

      // 4. Check Driver DOT Information (e.g. "Marcus Vance", "Elena Rostova", "DOT Marcus", "Show driver Elena", "Look up driver")
      const matchedDriver = findDriverByNameOrQuery(clean);
      if (
        matchedDriver &&
        (clean.includes(matchedDriver.driverName.toLowerCase().split(' ')[0]) ||
          clean.includes(matchedDriver.driverName.toLowerCase().split(' ')[1]) ||
          clean.includes('driver') ||
          clean.includes('dot') ||
          clean.includes('cdl') ||
          clean.includes('clearinghouse') ||
          clean.includes('dossier'))
      ) {
        return {
          type: 'DRIVER_DOT',
          label: `DOT File: ${matchedDriver.driverName}`,
          responseVoice: `Accessing DOT compliance file for ${matchedDriver.driverName}. CDL valid through ${matchedDriver.cdlExpirationDate.split('-')[0]}, Medical certified, Clearinghouse eligible with zero violations, ${matchedDriver.safetyScorePercent} percent safety score.`,
          matchedDriver,
        };
      }

      // 5. Check Driver Intelligence / Prior Breakdowns / DVIR / Voice Recognition
      if (
        clean.includes('breakdown') ||
        clean.includes('breakdowns') ||
        clean.includes('prior breakdown') ||
        clean.includes('dvir') ||
        clean.includes('prior issues') ||
        clean.includes('voice profile') ||
        clean.includes('calibrate voice') ||
        clean.includes('voice recognition') ||
        clean.includes('driver intelligence')
      ) {
        const targetDriver = matchedDriver || INITIAL_DRIVER_DOSSIERS[0];
        return {
          type: 'DRIVER_INTELLIGENCE',
          label: `Intelligence: ${targetDriver.driverName}`,
          responseVoice: `Opening driver intelligence console for ${targetDriver.driverName}. Logged ${targetDriver.priorBreakdowns.length} prior roadside breakdowns and ${targetDriver.priorDvirRecords.length} certified DVIR inspections.`,
          matchedDriver: targetDriver,
        };
      }

      // 6. Check Safety Meetings query
      if (
        clean.includes('safety meeting') ||
        clean.includes('safety meetings') ||
        clean.includes('driver safety') ||
        clean.includes('fmcsa meeting')
      ) {
        return {
          type: 'SAFETY_MEETINGS',
          label: 'Driver Safety Meetings Roster',
          responseVoice: 'Opening driver safety meetings curriculum and digital compliance attendance roster.',
        };
      }

      // Check Poll All action
      const pollKeywords = [
        'poll all',
        'poll network',
        'poll nodes',
        'poll mesh',
        'poll telemetry',
        'trigger poll',
        'refresh mesh',
        'ping all',
        'ping nodes',
        'sync all',
        'poll',
      ];
      for (const kw of pollKeywords) {
        if (clean.includes(kw)) {
          return {
            type: 'POLL_ALL',
            label: 'Poll All Mesh Nodes',
            responseVoice: 'Polling all mesh pipelines now.',
          };
        }
      }

      // Check Notifications
      if (clean.includes('notification') || clean.includes('alerts') || clean.includes('show alerts')) {
        return {
          type: 'NOTIFICATIONS',
          label: 'Open Notifications Desk',
          responseVoice: 'Opening notifications and alerts.',
        };
      }

      // Check Profile/Contact
      if (clean.includes('profile') || clean.includes('carrier') || clean.includes('contact support') || clean.includes('call dispatch')) {
        return {
          type: 'PROFILE',
          label: 'Open Carrier Profile & Dispatch Support',
          responseVoice: 'Opening carrier profile and dispatch desk.',
        };
      }

      // Check Status/Latency query
      if (clean.includes('status') || clean.includes('latency') || clean.includes('check system')) {
        return {
          type: 'STATUS',
          label: 'Read System Telemetry Status',
          responseVoice: `System nominal. Edge latency ${latency} milliseconds. Mesh healthy.`,
        };
      }

      // Check Voice Sleep commands
      if (
        clean.includes('voice sleep') ||
        clean.includes('sleep mic') ||
        clean.includes('sleep microphone') ||
        clean.includes('mic sleep') ||
        clean.includes('disable mic') ||
        clean.includes('mute voice')
      ) {
        return {
          type: 'VOICE_SLEEP',
          label: 'Voice Sleep (Mic Disabled)',
          responseVoice: 'Voice sleep engaged. Microphone disabled.',
        };
      }

      // Check Resume Voice commands
      if (
        clean.includes('wake up') ||
        clean.includes('resume voice') ||
        clean.includes('start voice') ||
        clean.includes('enable mic') ||
        clean.includes('unmute voice')
      ) {
        return {
          type: 'RESUME_VOICE',
          label: 'Hands-Free Voice Resumed',
          responseVoice: 'Hands-Free active and listening.',
        };
      }

      // Check Voice Help / Commands Directory query
      if (
        clean.includes('voice help') ||
        clean.includes('voice command') ||
        clean.includes('voice directory') ||
        clean.includes('what can i say') ||
        clean.includes('help voice') ||
        clean.includes('list commands')
      ) {
        return {
          type: 'VOICE_HELP',
          label: 'Open Voice Commands Reference',
          responseVoice: 'Opening in-cab voice commands reference directory.',
        };
      }

      // Check Navigation across all 28 tabs
      for (const entry of TAB_VOICE_MAP) {
        for (const kw of entry.keywords) {
          // Exact or substring match (e.g. "go to dispatch", "open dispatch", "switch to dispatch", "dispatch")
          const regex = new RegExp(`\\b${kw}\\b`, 'i');
          if (regex.test(clean) || clean.includes(kw)) {
            return {
              type: 'NAVIGATE',
              targetTab: entry.tab,
              label: `Switch Tab to ${entry.name}`,
              responseVoice: `Navigating to ${entry.name}.`,
            };
          }
        }
      }

      return null;
    },
    [latency]
  );

  const PARKED_AUTO_SLEEP_THRESHOLD_SEC = 300; // 5 minutes

  const formatSecondsToMMSS = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Manual Resume Handler from Voice Sleep (Header Resume Button & In-Cab HUD)
  const handleResumeFromVoiceSleep = useCallback(() => {
    setIsVoiceSleeping(false);
    setVoiceSleepTriggerTime(null);
    // Reset parked time window so the driver receives a fresh 5-minute active window
    setParkedSince(Date.now());
    setParkedSeconds(0);

    // Re-enable microphone and start recognition & audio capture
    setIsListening(true);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start on manual resume:', err);
      }
    }

    triggerHapticPulse('resume');
    playTone('start');
    speakVoice('Hands-Free resumed. Listening for driver commands.');
    setLastAction('Hands-Free Resumed manually by driver');
    setCommandHistory((prev) => [
      {
        id: `resume-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        transcript: '[MANUAL RESUME] HEADER RESUME BUTTON',
        matchedAction: 'HANDS-FREE RESUMED: MIC ACTIVE',
        success: true,
      },
      ...prev.slice(0, 19),
    ]);
  }, [playTone, speakVoice, triggerHapticPulse]);

  // Execute recognized command
  const executeCommand = useCallback(
    (cmd: CommandMatch, rawPhrase: string) => {
      // Subtle tactile vibration feedback confirming successful command parsing
      triggerHapticPulse('subtle');

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const isInCabHud = activeTabRef.current === 'nighthud';

      // Helper to deliver audible confirmation feedback (Muted in In-Cab HUD silent mode)
      const playConfirmationFeedback = (defaultText: string, toneType?: 'success' | 'poll') => {
        if (isInCabHud) return; // Silent in In-Cab HUD
        if (toneType) playTone(toneType);

        // Check if user recorded a custom voice sample for this command
        if (cmd.commandId && commandAudioSamples[cmd.commandId]?.audioUrl) {
          try {
            const audio = new Audio(commandAudioSamples[cmd.commandId].audioUrl);
            audio.play().catch(() => speakVoice(defaultText));
          } catch {
            speakVoice(defaultText);
          }
        } else {
          speakVoice(defaultText);
        }
      };

      if (cmd.type === 'DVIR_ACTION' && cmd.dvirAction) {
        const isOos = cmd.dvirAction.severity === 'OUT_OF_SERVICE';
        if (!isInCabHud) playTone(isOos ? 'alert' : 'success');
        triggerHapticPulse(isOos ? 'alert' : 'success');

        // Dispatch global action for DVIR Autonomous Agent View
        dispatchDvirVoiceAction(cmd.dvirAction);

        // Auto navigate to DVIR tab if recording a defect, switching inspection type, or navigating view
        if (
          cmd.dvirAction.actionType === 'RECORD_DEFECT' ||
          cmd.dvirAction.actionType === 'SWITCH_INSPECTION_TYPE' ||
          cmd.dvirAction.actionType === 'NAVIGATE_VIEW'
        ) {
          if (activeTabRef.current !== 'dvir-agent') {
            onChangeTab('dvir-agent');
          }
        }

        setActiveDvirAction(cmd.dvirAction);
        setActiveMatchedLoads([]);
        setActiveFuelStation(null);
        setIsDockDismissed(false);
        setIsExpanded(true);

        playConfirmationFeedback(cmd.responseVoice, isOos ? undefined : 'success');
        setLastAction(`DVIR: ${cmd.label}`);
        setSpokenResponseText(cmd.responseVoice);
        setCommandHistory((prev) => [
          {
            id: `cmd-${Date.now()}`,
            timestamp: nowStr,
            transcript: rawPhrase,
            matchedAction: isOos
              ? `DVIR OOS DEFECT: ${cmd.dvirAction?.itemName?.toUpperCase() || 'LOGGED'}`
              : `DVIR: ${cmd.dvirAction?.summaryLabel.toUpperCase()}`,
            success: true,
          },
          ...prev.slice(0, 19),
        ]);
        return;
      }

      if (cmd.type === 'FIND_LOAD') {
        if (!isInCabHud) playTone('success');
        if (cmd.matchedLoads && cmd.matchedLoads.length > 0) {
          setActiveMatchedLoads(cmd.matchedLoads);
          setActiveFuelStation(null);
          setIsDockDismissed(false);
          setIsExpanded(true);
        }
        playConfirmationFeedback(cmd.responseVoice, 'success');
        setLastAction(`Load Search: ${cmd.label}`);
        setSpokenResponseText(cmd.responseVoice);
        setCommandHistory((prev) => [
          {
            id: `cmd-${Date.now()}`,
            timestamp: nowStr,
            transcript: rawPhrase,
            matchedAction: 'G.O.A.T. LOAD MATCH FOUND',
            success: true,
          },
          ...prev.slice(0, 19),
        ]);
        return;
      }

      if (cmd.type === 'FIND_FUEL') {
        if (!isInCabHud) playTone('success');
        if (cmd.matchedFuelStation) {
          setActiveFuelStation(cmd.matchedFuelStation);
          setActiveMatchedLoads([]);
          setIsDockDismissed(false);
          setIsExpanded(true);
        }
        playConfirmationFeedback(cmd.responseVoice, 'success');
        setLastAction(`Next Fuel: ${cmd.label}`);
        setSpokenResponseText(cmd.responseVoice);
        setCommandHistory((prev) => [
          {
            id: `cmd-${Date.now()}`,
            timestamp: nowStr,
            transcript: rawPhrase,
            matchedAction: 'NEXT FUEL STATION FOUND',
            success: true,
          },
          ...prev.slice(0, 19),
        ]);
        return;
      }

      if (cmd.type === 'GOAT_IN_CAB') {
        if (!isInCabHud) playTone('success');
        onChangeTab('nighthud');
        window.dispatchEvent(new CustomEvent('in-cab-switch-tab', { detail: { tab: 'the-goat' } }));
        playConfirmationFeedback(cmd.responseVoice, 'success');
        setLastAction('Integrated G.O.A.T. into In-Cab');
        setSpokenResponseText(cmd.responseVoice);
        setCommandHistory((prev) => [
          {
            id: `cmd-${Date.now()}`,
            timestamp: nowStr,
            transcript: rawPhrase,
            matchedAction: 'INTEGRATED G.O.A.T. IN-CAB',
            success: true,
          },
          ...prev.slice(0, 19),
        ]);
        return;
      }

      if (cmd.type === 'DRIVER_DOT' && cmd.matchedDriver) {
        if (!isInCabHud) playTone('success');
        setActiveDotDriver(cmd.matchedDriver);
        setIsDotModalOpen(true);
        playConfirmationFeedback(cmd.responseVoice, 'success');
        setLastAction(`DOT File: ${cmd.matchedDriver.driverName}`);
        setSpokenResponseText(cmd.responseVoice);
        setCommandHistory((prev) => [
          {
            id: `cmd-${Date.now()}`,
            timestamp: nowStr,
            transcript: rawPhrase,
            matchedAction: `DOT DOSSIER: ${cmd.matchedDriver?.driverName.toUpperCase()}`,
            success: true,
          },
          ...prev.slice(0, 19),
        ]);
        return;
      }

      if (cmd.type === 'DRIVER_INTELLIGENCE' && cmd.matchedDriver) {
        if (!isInCabHud) playTone('success');
        setActiveIntelligenceDriver(cmd.matchedDriver);
        setIsIntelligenceModalOpen(true);
        playConfirmationFeedback(cmd.responseVoice, 'success');
        setLastAction(`Intelligence: ${cmd.matchedDriver.driverName}`);
        setSpokenResponseText(cmd.responseVoice);
        setCommandHistory((prev) => [
          {
            id: `cmd-${Date.now()}`,
            timestamp: nowStr,
            transcript: rawPhrase,
            matchedAction: `INTELLIGENCE: ${cmd.matchedDriver?.driverName.toUpperCase()}`,
            success: true,
          },
          ...prev.slice(0, 19),
        ]);
        return;
      }

      if (cmd.type === 'SAFETY_MEETINGS') {
        if (!isInCabHud) playTone('success');
        if (onOpenSafetyMeetings) {
          onOpenSafetyMeetings();
        } else {
          onChangeTab('compliance');
        }
        playConfirmationFeedback(cmd.responseVoice, 'success');
        setLastAction('Opened Driver Safety Meetings');
        setSpokenResponseText(cmd.responseVoice);
        setCommandHistory((prev) => [
          {
            id: `cmd-${Date.now()}`,
            timestamp: nowStr,
            transcript: rawPhrase,
            matchedAction: 'SAFETY MEETINGS ROSTER',
            success: true,
          },
          ...prev.slice(0, 19),
        ]);
        return;
      }

      if (cmd.type === 'POLL_ALL') {
        onPollAll();
        playConfirmationFeedback(cmd.responseVoice, 'poll');
        setLastAction(isInCabHud ? `[SILENT HUD] Triggered: ${cmd.label}` : `Triggered: ${cmd.label}`);
        setCommandHistory((prev) => [
          {
            id: `cmd-${Date.now()}`,
            timestamp: nowStr,
            transcript: rawPhrase,
            matchedAction: isInCabHud ? '[SILENT HUD] POLL ALL NODES' : 'POLL ALL NODES',
            success: true,
          },
          ...prev.slice(0, 19),
        ]);
        return;
      }

      if (cmd.type === 'NAVIGATE' && cmd.targetTab) {
        onChangeTab(cmd.targetTab);
        playConfirmationFeedback(cmd.responseVoice, 'success');
        setLastAction(isInCabHud ? `[SILENT HUD] Navigated to: ${cmd.label}` : `Navigated to: ${cmd.label}`);
        setCommandHistory((prev) => [
          {
            id: `cmd-${Date.now()}`,
            timestamp: nowStr,
            transcript: rawPhrase,
            matchedAction: isInCabHud
              ? `[SILENT HUD] NAVIGATE → ${cmd.targetTab?.toUpperCase()}`
              : `NAVIGATE → ${cmd.targetTab?.toUpperCase()}`,
            success: true,
          },
          ...prev.slice(0, 19),
        ]);
        return;
      }

      if (cmd.type === 'NOTIFICATIONS') {
        if (!isInCabHud) playTone('success');
        if (onOpenNotifications) onOpenNotifications();
        playConfirmationFeedback(cmd.responseVoice);
        setLastAction(isInCabHud ? '[SILENT HUD] Opened Notifications' : 'Opened Notifications');
        return;
      }

      if (cmd.type === 'PROFILE') {
        if (!isInCabHud) playTone('success');
        if (onOpenProfile) onOpenProfile();
        playConfirmationFeedback(cmd.responseVoice);
        setLastAction(isInCabHud ? '[SILENT HUD] Opened Profile & Support' : 'Opened Profile & Support');
        return;
      }

      if (cmd.type === 'VOICE_HELP') {
        if (!isInCabHud) playTone('success');
        if (onOpenVoiceCommandsModal) onOpenVoiceCommandsModal();
        playConfirmationFeedback(cmd.responseVoice);
        setLastAction(isInCabHud ? '[SILENT HUD] Opened Voice Reference' : 'Opened Voice Reference');
        return;
      }

      if (cmd.type === 'STATUS') {
        if (!isInCabHud) playTone('success');
        playConfirmationFeedback(cmd.responseVoice);
        setLastAction(`Status: Latency ${latency}ms`);
        return;
      }

      if (cmd.type === 'VOICE_SLEEP') {
        setIsVoiceSleeping(true);
        const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setVoiceSleepTriggerTime(nowTimeStr);
        setIsListening(false);
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {
            // ignore
          }
        }
        if (!isInCabHud) {
          playTone('sleep');
          speakVoice(cmd.responseVoice);
        }
        setLastAction('Voice Sleep: Mic disabled');
        setCommandHistory((prev) => [
          {
            id: `sleep-${Date.now()}`,
            timestamp: nowTimeStr,
            transcript: rawPhrase,
            matchedAction: 'VOICE SLEEP: MIC DISABLED',
            success: true,
          },
          ...prev.slice(0, 19),
        ]);
        return;
      }

      if (cmd.type === 'RESUME_VOICE') {
        handleResumeFromVoiceSleep();
        return;
      }
    },
    [
      onChangeTab,
      onPollAll,
      onOpenNotifications,
      onOpenProfile,
      playTone,
      speakVoice,
      latency,
      handleResumeFromVoiceSleep,
      triggerHapticPulse,
      commandAudioSamples,
    ]
  );

  // Real-time audio analyser to measure mic sound against sensitivity threshold
  const startAudioAnalyser = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) return;
    try {
      if (mediaStreamRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: voiceSettingsRef.current.echoCancellation,
          noiseSuppression: voiceSettingsRef.current.noiseSuppression,
          autoGainControl: voiceSettingsRef.current.autoGainControl,
        },
      });
      mediaStreamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkVolume = () => {
        if (!analyserRef.current || !isListeningRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 115) * 100));
        setVolumeLevel(normalized);
        audioLevelRef.current = normalized;
        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };
      animationFrameRef.current = requestAnimationFrame(checkVolume);
    } catch {
      // Fallback mode if mic audio stream is exclusive
    }
  }, []);

  const stopAudioAnalyser = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setVolumeLevel(0);
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 2;

      recognition.onstart = () => {
        setIsListening(true);
        setHasMicPermission(true);
        playTone('start');
        startAudioAnalyser();
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
          setAudioLevel(Math.min(100, Math.floor(40 + Math.random() * 50)));
        }

        if (final) {
          const spoken = final.trim();
          setTranscript(spoken);
          setInterimTranscript('');

          // Evaluate against active microphone sensitivity threshold
          const threshold = voiceSettingsRef.current.micSensitivityThreshold;
          const currentLevel = Math.max(volumeLevel, audioLevelRef.current);

          // If threshold is set high (e.g. > 55%) and input was below threshold, filter out as ambient cab noise
          if (currentLevel > 0 && currentLevel < threshold && threshold > 55) {
            setLastAction(`Noise Gate Filter: ${currentLevel}% < ${threshold}% Threshold`);
            return;
          }

          setAudioLevel(85);

          const match = parseCommand(spoken);
          if (match) {
            triggerHapticPulse('subtle');
            executeCommand(match, spoken);
          } else {
            // Unrecognized command
            const isInCabHud = activeTabRef.current === 'nighthud';
            if (!isInCabHud) {
              playTone('alert');
              speakVoice('Command not recognized. Say: "Open load board" or "Start DVIR audit".');
            }
            setLastAction(isInCabHud ? `[SILENT HUD] Unrecognized: "${spoken}"` : `Unrecognized: "${spoken}"`);
            setCommandHistory((prev) => [
              {
                id: `cmd-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                transcript: spoken,
                matchedAction: isInCabHud ? '[SILENT HUD] UNRECOGNIZED' : 'NO MATCH (See cheatsheet)',
                success: false,
              },
              ...prev.slice(0, 19),
            ]);
          }

          setTimeout(() => setAudioLevel(0), 600);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition warning/error:', event.error);
        if (event.error === 'not-allowed') {
          setHasMicPermission(false);
          setIsListening(false);
          stopAudioAnalyser();
        }
      };

      recognition.onend = () => {
        setAudioLevel(0);
        stopAudioAnalyser();
        // If continuous is wanted and user hasn't explicitly muted and NOT in voice sleep, auto-restart
        // In In-Cab HUD view, continuously keep listening in the background!
        if (isContinuous && (isListeningRef.current || activeTabRef.current === 'nighthud') && !isVoiceSleepingRef.current) {
          restartTimerRef.current = setTimeout(() => {
            try {
              recognition.start();
              setIsListening(true);
            } catch {
              // Ignore restart error
            }
          }, 300);
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition setup error:', err);
      setIsSupported(false);
    }

    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      stopAudioAnalyser();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isContinuous, parseCommand, executeCommand, playTone, speakVoice, startAudioAnalyser, stopAudioAnalyser]);

  // Track Parked Duration & Automatically Disable Mic when Parked > 5 Minutes (300 sec)
  useEffect(() => {
    const interval = setInterval(() => {
      if (truckMotionStateRef.current === 'PARKED') {
        const elapsed = Math.max(0, Math.floor((Date.now() - parkedSince) / 1000));
        setParkedSeconds(elapsed);

        // Auto-Sleep Trigger: Parked for more than 5 minutes (300 seconds)
        // Exception: In-Cab HUD view must remain background-active! Do not auto-sleep while on In-Cab HUD!
        if (elapsed >= PARKED_AUTO_SLEEP_THRESHOLD_SEC && activeTabRef.current !== 'nighthud') {
          if (!isVoiceSleepingRef.current) {
            setIsVoiceSleeping(true);
            const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setVoiceSleepTriggerTime(nowTimeStr);

            // Automatically disable the microphone
            setIsListening(false);
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch {
                // Ignore stop error
              }
            }

            playTone('sleep');
            speakVoice('Truck parked over 5 minutes. Voice sleep activated. Microphone disabled.');
            setLastAction('Voice Sleep: Mic disabled (Parked > 5m)');
            setCommandHistory((prev) => [
              {
                id: `sleep-${Date.now()}`,
                timestamp: nowTimeStr,
                transcript: '[AUTO-SLEEP] TRUCK PARKED > 5 MIN',
                matchedAction: 'VOICE SLEEP: MIC DISABLED',
                success: true,
              },
              ...prev.slice(0, 19),
            ]);
          }
        }
      } else {
        setParkedSeconds(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [parkedSince, playTone, speakVoice]);

  // Fast-Forward to 5m+ for instant testing/demonstration of Voice Sleep
  const handleSimulateFiveMinutesParked = () => {
    if (truckMotionState !== 'PARKED') {
      setTruckMotionState('PARKED');
    }
    const simulatedPast = Date.now() - 305 * 1000;
    setParkedSince(simulatedPast);
    setParkedSeconds(305);
  };

  // Toggle Truck Motion State (Parked vs Driving)
  const handleToggleTruckMotion = () => {
    if (truckMotionState === 'PARKED') {
      setTruckMotionState('DRIVING');
      setParkedSeconds(0);
      setLastAction('Truck in motion: Speed 62 MPH');
    } else {
      setTruckMotionState('PARKED');
      setParkedSince(Date.now());
      setParkedSeconds(0);
      setLastAction('Truck parked: Timer started (00:00)');
    }
  };

  // Reset parked timer
  const handleResetParkedTimer = () => {
    setParkedSince(Date.now());
    setParkedSeconds(0);
    setLastAction('Parked timer reset (00:00)');
  };

  // Toggle listening
  const handleToggleListening = () => {
    // If currently in Voice Sleep, clicking the voice button will manually resume it!
    if (isVoiceSleeping) {
      handleResumeFromVoiceSleep();
      return;
    }

    if (!recognitionRef.current) {
      if (!isSupported) {
        // Provide simulated manual trigger if speech recognition isn't in browser
        setIsExpanded(true);
      }
      return;
    }

    if (isListening) {
      setIsListening(false);
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        // Might already be running or need permissions
        console.warn('Failed to start recognition:', err);
      }
    }
  };

  // Simulated Voice Command Test Execution (for quick developer/driver testing)
  const handleSimulateVoice = (phrase: string) => {
    setTranscript(phrase);
    setInterimTranscript('');
    const match = parseCommand(phrase);
    if (match) {
      triggerHapticPulse('subtle');
      executeCommand(match, phrase);
    }
  };

  // Visual waveform heights
  const bars = [18, 35, 60, 42, 80, 65, 30, 90, 50, 25, 45, 70];

  return (
    <>
      {/* 1. TOP HEADER INTEGRATED LISTENER TRIGGER & STATUS (Always visible in Header or bar) */}
      <div id="voice-command-header-container" className="flex items-center gap-1.5 font-mono text-xs">
        {/* MANUAL RESUME BUTTON IN HEADER (Displayed when in Voice Sleep) */}
        {isVoiceSleeping && (
          <button
            id="header-voice-sleep-resume-btn"
            onClick={handleResumeFromVoiceSleep}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 h-8 rounded-lg bg-gradient-to-r from-[#D4AF37] via-[#F2CA50] to-[#E5B834] text-[#120E02] font-black text-[11px] uppercase tracking-wider shadow-[0_0_16px_rgba(212,175,55,0.45)] hover:brightness-110 active:scale-95 transition-all border border-[#FFE899]"
            title="Truck parked > 5 min. Microphone in Voice Sleep. Click to manually resume."
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>RESUME VOICE</span>
          </button>
        )}

        {/* VOICE STATUS / TOGGLE BUTTON */}
        {isVoiceSleeping ? (
          <button
            id="voice-command-header-sleep-pill"
            onClick={handleResumeFromVoiceSleep}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-[#181304] border border-[#D4AF37]/70 text-[#D4AF37] hover:border-[#D4AF37] transition-all cursor-pointer select-none"
            title="Voice Sleep Active: Truck parked > 5 min. Click to resume microphone."
          >
            <Moon className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider">VOICE SLEEP</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#FFE082] font-mono hidden sm:inline">
              PARKED &gt; 5M
            </span>
          </button>
        ) : (
          <button
            id="voice-command-header-btn"
            onClick={handleToggleListening}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all relative select-none ${
              isListening
                ? 'bg-[#1C1504] border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.35)]'
                : 'bg-[#161616] border-[#2B2D33] text-slate-400 hover:text-[#F5F5F5] hover:border-[#D4AF37]/50'
            }`}
            title={
              isListening
                ? 'Hands-Free Voice Active (Click to Pause)'
                : 'Activate Driver Hands-Free Voice (Click to Start)'
            }
          >
            {isListening ? (
              <>
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-[#D4AF37] opacity-75" />
                  <Mic className="w-3.5 h-3.5 text-[#D4AF37] relative z-10 animate-pulse" />
                </div>
                <span className="font-bold text-[11px] text-[#D4AF37] tracking-wider uppercase flex items-center gap-1">
                  <span>HANDS-FREE</span>
                  <span className="hidden sm:inline">LISTENING</span>
                </span>

                {/* Integrated mini waveform inside the button */}
                <div
                  className="flex items-center gap-[2px] h-3 px-1 rounded bg-black/40 border border-[#D4AF37]/30"
                  title={`Input volume: ${Math.round(volumeLevel)}%`}
                >
                  {waveformBars.slice(0, 4).map((h, idx) => (
                    <span
                      key={idx}
                      className="w-[2px] rounded-full transition-all duration-75 ease-out"
                      style={{
                        height: `${Math.max(3, Math.round(h * 0.65))}px`,
                        backgroundColor: h > 8 ? '#F2CA50' : '#8A7A3A',
                      }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <span>HANDS-FREE</span>
                  <span className="hidden sm:inline">OFF</span>
                </span>
              </>
            )}
          </button>
        )}

        {/* Small Visual Waveform Indicator Reacting to Input Volume in Header */}
        {isListening && !isVoiceSleeping && (
          <div
            id="header-voice-waveform-indicator"
            onClick={isExpanded && !isDockDismissed ? handleCloseDock : handleOpenDock}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-[#141003] border border-[#D4AF37]/60 shadow-[0_0_12px_rgba(212,175,55,0.25)] select-none cursor-pointer transition-all hover:border-[#D4AF37]"
            title={`Mic Input Volume: ${Math.round(volumeLevel)}% — Click to toggle Hands-Free Assistant`}
          >
            <Activity className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />

            {/* Visual Waveform Bars */}
            <div className="flex items-center gap-[2.5px] h-4">
              {waveformBars.map((height, idx) => (
                <span
                  key={idx}
                  className="w-[2.5px] rounded-full transition-all duration-75 ease-out"
                  style={{
                    height: `${Math.max(3, height)}px`,
                    backgroundColor:
                      height > 12
                        ? '#FFF1A8'
                        : height > 7
                        ? '#F2CA50'
                        : height > 4
                        ? '#D4AF37'
                        : '#6B571A',
                    boxShadow: height > 7 ? '0 0 6px rgba(242,202,80,0.6)' : 'none',
                  }}
                />
              ))}
            </div>

            {/* Live Volume Readout */}
            <span className="text-[10px] font-mono font-bold text-[#D4AF37] min-w-[26px] text-right hidden xs:inline">
              {Math.round(volumeLevel)}%
            </span>
          </div>
        )}

        {/* Truck Parked / Motion Telematics Status Pill in Header */}
        <div
          id="header-truck-parked-telemetry"
          onClick={isExpanded && !isDockDismissed ? handleCloseDock : handleOpenDock}
          className={`hidden xl:flex items-center gap-1.5 h-8 px-2 rounded-lg border text-[10px] font-mono select-none cursor-pointer transition-all ${
            truckMotionState === 'PARKED'
              ? isVoiceSleeping
                ? 'bg-[#1C1204] border-amber-500/60 text-amber-300'
                : 'bg-[#141414] border-[#333] text-slate-300 hover:border-amber-500/40'
              : 'bg-[#0D1812] border-emerald-500/40 text-emerald-300'
          }`}
          title={
            truckMotionState === 'PARKED'
              ? `Truck Parked: ${formatSecondsToMMSS(parkedSeconds)} (Auto-Sleep at 05:00). Click to view Hands-Free.`
              : 'Truck In Motion (Driving). Hands-Free ready.'
          }
        >
          <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="font-bold">
            {truckMotionState === 'PARKED' ? `PARKED ${formatSecondsToMMSS(parkedSeconds)}` : 'IN MOTION'}
          </span>
        </div>

        {/* In-Cab HUD Silent Listener Active Indicator */}
        {activeTab === 'nighthud' && (
          <div
            id="header-hud-silent-badge"
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-cyan-500/50 bg-[#061820] text-cyan-300 text-[10px] font-mono select-none animate-pulse"
            title="In-Cab Night HUD Active: Hands-Free Voice Listener is running silently in the background."
          >
            <VolumeX className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold hidden sm:inline">HUD SILENT LISTENER</span>
            <span className="font-bold sm:hidden">HUD SILENT</span>
          </div>
        )}

        {/* Custom Voice Samples Studio Button */}
        <button
          id="header-voice-samples-studio-btn"
          onClick={() => setIsSampleStudioOpen(true)}
          className="hidden lg:flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[#D4AF37]/50 bg-[#161308] hover:border-[#D4AF37] hover:bg-[#201B0B] text-[#E8CA65] hover:text-[#FFF] text-[10px] font-mono select-none transition-all active:scale-95 shadow-[0_0_10px_rgba(212,175,55,0.15)]"
          title="Open Custom Voice Command Studio: Record or upload personalized voice triggers"
        >
          <Mic className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="font-bold">VOICE SAMPLES</span>
          {Object.keys(commandAudioSamples).length > 0 && (
            <span className="px-1 py-0.2 rounded-full bg-[#D4AF37]/30 text-[#FFF] text-[9px] font-black">
              {Object.keys(commandAudioSamples).length}
            </span>
          )}
        </button>

        {/* Expand / Quick Control Button */}
        <button
          id="header-voice-hud-toggle-btn"
          onClick={isExpanded && !isDockDismissed ? handleCloseDock : handleOpenDock}
          className={`p-1.5 rounded-lg border transition-all ${
            isExpanded && !isDockDismissed
              ? 'bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37]'
              : 'bg-[#161616] border-[#2B2D33] text-slate-400 hover:text-white'
          }`}
          title="Toggle Hands-Free Driver Assistant"
        >
          <Command className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. FLOATING / SLIDE-IN HANDS-FREE DRIVER DOCK (DISMISSIBLE & CLEAN) */}
      {isExpanded && !isDockDismissed && (
        <div
          id="driver-hands-free-hud"
          className="fixed bottom-20 lg:bottom-6 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[470px] max-h-[85vh] overflow-y-auto bg-[#0A0C10]/95 backdrop-blur-2xl border-2 border-[#D4AF37] rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.9)] p-4 text-white font-sans transition-all animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-[#D4AF37]">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-black uppercase tracking-wider text-[#D4AF37]">
                    Hands-Free
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                    49 CFR § 392 SAFE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Voice Assistant · G.O.A.T. Loads · Fuel &amp; Navigation
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Voice feedback toggle */}
              <button
                onClick={() => setVoiceSpeechFeedback(!voiceSpeechFeedback)}
                className={`p-2 rounded-xl text-xs font-mono transition-colors ${
                  voiceSpeechFeedback
                    ? 'bg-[#1C1504] text-[#D4AF37] border border-[#D4AF37]/50'
                    : 'bg-slate-800/80 text-slate-400 border border-slate-700'
                }`}
                title={voiceSpeechFeedback ? 'Audio Speech Readback: ON' : 'Audio Speech Readback: MUTED'}
              >
                {voiceSpeechFeedback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Close/Dismiss Button (Explicitly closes and removes the dock) */}
              <button
                onClick={handleCloseDock}
                className="p-2 rounded-xl bg-slate-800/90 text-slate-300 hover:text-white hover:bg-rose-900/40 hover:border-rose-500/60 border border-slate-700 transition-all active:scale-95 shadow-md"
                title="Close Hands-Free (Esc)"
                aria-label="Close Hands-Free"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ACTIVE MIC ACTION & WAVEFORM STRIP */}
          <div className="bg-[#12151C] border border-slate-800 rounded-xl p-3.5 mb-3 shadow-inner">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <button
                onClick={handleToggleListening}
                className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl font-mono text-xs font-bold uppercase transition-all shadow-md active:scale-98 ${
                  isListening
                    ? 'bg-gradient-to-r from-[#FFE600] to-[#FFD700] text-black shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                    : 'bg-gradient-to-r from-[#D4AF37] via-[#F2CA50] to-[#E5B834] text-[#120E02]'
                }`}
              >
                {isListening ? (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                    <span>LISTENING... (TAP TO PAUSE)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-black" />
                    <span>TAP TO ACTIVATE HANDS-FREE</span>
                  </>
                )}
              </button>

              {/* Manual Voice Sleep Resume if in sleep */}
              {isVoiceSleeping && (
                <button
                  onClick={handleResumeFromVoiceSleep}
                  className="px-3 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>WAKE MIC</span>
                </button>
              )}
            </div>

            {/* Live Audio Waveform */}
            <div className="h-8 bg-[#090B0E] rounded-lg border border-slate-800/80 flex items-center justify-center space-x-1 px-3 overflow-hidden">
              {bars.map((baseH, idx) => {
                const effectiveVolume = volumeLevel > 0 ? volumeLevel : audioLevel;
                const dynamicH = isListening
                  ? Math.max(6, Math.min(28, Math.floor(baseH * (0.35 + (effectiveVolume / 100) * 0.9))))
                  : 4;
                return (
                  <div
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      isListening
                        ? 'bg-gradient-to-t from-[#D4AF37] to-[#FFF1A8]'
                        : 'bg-slate-700'
                    }`}
                    style={{ height: `${dynamicH}px` }}
                  />
                );
              })}
            </div>

            {/* Live Transcript Stream */}
            <div className="mt-2.5 min-h-[38px] flex items-center justify-between bg-[#08090D] rounded-lg px-3 py-2 border border-slate-800">
              <div className="flex-1 min-w-0 font-mono text-xs">
                {interimTranscript ? (
                  <span className="text-amber-300 italic">
                    Hearing: &ldquo;{interimTranscript}...&rdquo;
                  </span>
                ) : transcript ? (
                  <span className="text-emerald-400 font-bold">
                    Heard: &ldquo;{transcript}&rdquo;
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px]">
                    Say: &ldquo;Can you find me a load from Arizona to Missouri&rdquo; or &ldquo;Find next fuel station&rdquo;
                  </span>
                )}
              </div>

              {lastAction && (
                <div className="ml-2 shrink-0 flex items-center space-x-1 text-[10px] font-mono font-bold text-[#D4AF37] bg-[#1C1504] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="truncate max-w-[130px]">{lastAction}</span>
                </div>
              )}
            </div>
          </div>

          {/* SPOKEN RESPONSE CARD (When assistant speaks back) */}
          {spokenResponseText && (
            <div className="mb-3 p-3 rounded-xl bg-[#1A1504] border border-[#D4AF37]/60 shadow-[0_0_20px_rgba(212,175,55,0.15)] flex items-start gap-2.5 animate-in fade-in duration-200">
              <div className="p-1.5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] shrink-0 mt-0.5">
                <Volume2 className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider block">
                  Hands-Free Readback
                </span>
                <p className="text-xs text-amber-100 font-sans leading-relaxed mt-0.5">
                  {spokenResponseText}
                </p>
              </div>
            </div>
          )}

          {/* RESULT CARD 1: DYNAMIC MATCHED G.O.A.T. LOADS (e.g. Arizona to Missouri) */}
          {activeMatchedLoads.length > 0 && (
            <div className="mb-3 bg-[#11141E] border-2 border-[#D4AF37] rounded-xl p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.7)] animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-[#D4AF37]/20 text-[#D4AF37]">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-black uppercase text-[#D4AF37] block">
                      G.O.A.T. Spot Freight Match
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {activeMatchedLoads.length} live verified tender{activeMatchedLoads.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onChangeTab('goat')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#D4AF37] hover:bg-[#F2CA50] text-[#0A0A0A] font-mono text-[10px] font-bold uppercase transition-all shadow"
                >
                  <span>Open G.O.A.T.</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Top Load Preview */}
              {activeMatchedLoads.slice(0, 2).map((load) => (
                <div key={load.id} className="bg-[#0A0C12] border border-slate-800 rounded-lg p-2.5 mb-2 last:mb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                      <span className="text-amber-300 font-mono">{load.originCity}, {load.originState}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="text-emerald-400 font-mono">{load.destCity}, {load.destState}</span>
                    </div>
                    <span className="font-mono text-xs font-black text-[#D4AF37] bg-[#1C1605] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                      ${load.rateUsd.toLocaleString()} (${load.ratePerMile.toFixed(2)}/mi)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-400 mb-2">
                    <div>Miles: <strong className="text-white">{load.miles} mi</strong></div>
                    <div>Equip: <strong className="text-white">{load.equipment}</strong></div>
                    <div>Weight: <strong className="text-white">{load.weightLbs.toLocaleString()} lbs</strong></div>
                  </div>

                  <p className="text-[10px] text-slate-300 truncate mb-2">
                    <strong className="text-slate-400">Commodity:</strong> {load.commodity}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <div className="text-[10px] text-slate-400">
                      <span>Broker: </span>
                      <strong className="text-white font-mono">{load.brokerName}</strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${load.brokerPhone.replace(/\D/g, '')}`}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono font-bold"
                      >
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>Call</span>
                      </a>
                      <button
                        onClick={() => {
                          triggerHapticPulse('success');
                          setIsBookingSuccess(`Tender ${load.loadNumber} accepted! Transmitting rate con to dispatcher desk.`);
                          setTimeout(() => setIsBookingSuccess(null), 4000);
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono font-bold uppercase transition-all shadow"
                      >
                        1-Tap Accept
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {isBookingSuccess && (
                <div className="mt-2 p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{isBookingSuccess}</span>
                </div>
              )}
            </div>
          )}

          {/* RESULT CARD 2: DYNAMIC NEXT FUEL STATION (e.g. Love's, Pilot) */}
          {activeFuelStation && (
            <div className="mb-3 bg-[#111718] border-2 border-emerald-500/80 rounded-xl p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.7)] animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                    <Fuel className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-black uppercase text-emerald-300 block">
                      Next In-Network Fuel Stop
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {activeFuelStation.distanceMiles} miles ahead ({activeFuelStation.etaMinutes} mins)
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                  REBATE: -${activeFuelStation.carrierDiscount.toFixed(2)}/GAL
                </span>
              </div>

              <div className="bg-[#090E11] border border-slate-800 rounded-lg p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <h4 className="font-bold text-sm text-white">{activeFuelStation.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {activeFuelStation.highway} {activeFuelStation.exitNumber} · {activeFuelStation.city}, {activeFuelStation.state}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 line-through block">
                      ${activeFuelStation.cashDieselPrice.toFixed(2)}
                    </span>
                    <span className="font-mono text-base font-black text-emerald-400">
                      ${activeFuelStation.netDieselPrice.toFixed(2)}<span className="text-[10px] font-normal text-slate-400">/gal</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-300 py-1.5 border-y border-slate-800/80 my-2">
                  <div>DEF at pump: <strong className="text-emerald-400">{activeFuelStation.defAtPump ? 'YES (All)' : 'No'}</strong></div>
                  <div>Parking: <strong className="text-white">{activeFuelStation.parkingSpotsAvailable} spots</strong></div>
                  <div>Bays: <strong className="text-white">{activeFuelStation.truckBays} lanes</strong></div>
                </div>

                <p className="text-[10px] text-amber-200/90 leading-tight mb-2.5">
                  ★ {activeFuelStation.recommendedReason}
                </p>

                <div className="flex items-center justify-between gap-2">
                  <a
                    href={`tel:${activeFuelStation.phone.replace(/\D/g, '')}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Call Fuel Desk</span>
                  </a>

                  <button
                    onClick={() => {
                      triggerHapticPulse('success');
                      speakVoice(`Routing navigation set for ${activeFuelStation.name} on ${activeFuelStation.highway}. Distance 14 miles.`);
                      setLastAction(`Navigating: ${activeFuelStation.name}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 text-white text-xs font-mono font-bold uppercase transition-all shadow-md"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Start GPS Route</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RESULT CARD 3: DYNAMIC DVIR AUTONOMOUS ACTION (e.g. Defect recorded on Axle 3, Odometer/Unit set) */}
          {activeDvirAction && (
            <div
              className={`mb-3 border-2 rounded-xl p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.7)] animate-in fade-in duration-200 ${
                activeDvirAction.severity === 'OUT_OF_SERVICE'
                  ? 'bg-[#18080A] border-rose-600/80 shadow-rose-950/40'
                  : 'bg-[#0E1522] border-emerald-500/80 shadow-emerald-950/30'
              }`}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded ${
                      activeDvirAction.severity === 'OUT_OF_SERVICE'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span
                      className={`font-mono text-xs font-black uppercase block ${
                        activeDvirAction.severity === 'OUT_OF_SERVICE' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {activeDvirAction.summaryLabel}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {activeDvirAction.zoneTitle || (activeDvirAction.actionType === 'SET_FIELD' ? 'DVIR Header Setup' : 'Autonomous DVIR Agent')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onChangeTab('dvir-agent');
                    setActiveDvirAction(null);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-[10px] font-bold uppercase transition-all shadow"
                >
                  <span>Open DVIR</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {activeDvirAction.defectNote && (
                <div className="bg-[#0A0C12] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>
                      Component: <strong className="text-white">{activeDvirAction.itemName || 'Inspection Item'}</strong>
                    </span>
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded ${
                        activeDvirAction.severity === 'OUT_OF_SERVICE'
                          ? 'bg-rose-950 text-rose-300 border border-rose-700'
                          : 'bg-amber-950 text-amber-300 border border-amber-700'
                      }`}
                    >
                      {activeDvirAction.severity || 'DEFECT'}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-slate-300">{activeDvirAction.defectNote}</p>
                  {activeDvirAction.fmcsaStatute && (
                    <p className="mt-1 text-[10px] font-mono text-rose-300">Statute: {activeDvirAction.fmcsaStatute}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* DRIVER ONE-TOUCH SUGGESTION CHIPS */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>Hands-Free Driver Questions (Tap or Speak)</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px]">
              {/* Voice DVIR Defect Axle 3 */}
              <button
                onClick={() => handleSimulateVoice('Record a flat tire on axle three')}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-[#1F0E11] hover:bg-[#2D1418] border border-rose-600/60 text-rose-200 text-left transition-all active:scale-98 shadow"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate">&ldquo;Record flat tire on axle 3&rdquo;</span>
              </button>

              {/* Set Odometer */}
              <button
                onClick={() => handleSimulateVoice('Set odometer to 143210')}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0C161E] hover:bg-[#132330] border border-sky-500/50 text-sky-200 text-left transition-all active:scale-98 shadow"
              >
                <Sliders className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="truncate">&ldquo;Set odometer to 143,210&rdquo;</span>
              </button>

              {/* Load Arizona to Missouri Option */}
              <button
                onClick={() => handleSimulateVoice('Can you find me a load from Arizona to Missouri')}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-[#18150A] hover:bg-[#26200E] border border-[#D4AF37]/50 text-amber-200 text-left transition-all active:scale-98 shadow"
              >
                <Award className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="truncate">&ldquo;Find load: Arizona → Missouri&rdquo;</span>
              </button>

              {/* Next Fuel Station Option */}
              <button
                onClick={() => handleSimulateVoice('Can you find the next fuel station')}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0C1714] hover:bg-[#142621] border border-emerald-500/50 text-emerald-200 text-left transition-all active:scale-98 shadow"
              >
                <Fuel className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">&ldquo;Find next fuel station&rdquo;</span>
              </button>

              {/* Integrate GOAT into In-Cab Option */}
              <button
                onClick={() => handleSimulateVoice('Integrate the GOAT into the in cab')}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-[#18150A] hover:bg-[#26200E] border border-[#D4AF37]/50 text-amber-200 text-left transition-all active:scale-98 shadow"
              >
                <Layers className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="truncate">&ldquo;Integrate GOAT into In-Cab&rdquo;</span>
              </button>

              {/* Sign DVIR */}
              <button
                onClick={() => handleSimulateVoice('Sign and submit DVIR')}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0C1714] hover:bg-[#142621] border border-emerald-500/50 text-emerald-200 text-left transition-all active:scale-98 shadow"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">&ldquo;Sign and submit DVIR&rdquo;</span>
              </button>

              {/* Call Dispatch Hotline */}
              <button
                onClick={() => handleSimulateVoice('Call dispatch')}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-[#1A1215] hover:bg-[#28181D] border border-rose-500/40 text-rose-200 text-left transition-all active:scale-98"
              >
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate">&ldquo;Call 24/7 Dispatch Hotline&rdquo;</span>
              </button>

              {/* Look Up Marcus Vance DOT */}
              <button
                onClick={() => handleSimulateVoice('Marcus Vance')}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-[#111926] hover:bg-[#1A263A] border border-cyan-500/40 text-cyan-200 text-left transition-all active:scale-98 shadow"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">&ldquo;DOT File: Marcus Vance&rdquo;</span>
              </button>

              {/* Driver Safety Meetings */}
              <button
                onClick={() => handleSimulateVoice('Driver safety meetings')}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-[#18160B] hover:bg-[#26220E] border border-[#D4AF37]/50 text-amber-200 text-left transition-all active:scale-98 shadow"
              >
                <Award className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="truncate">&ldquo;Driver Safety Meetings&rdquo;</span>
              </button>
            </div>
          </div>

          {/* RECENT VOICE COMMAND HISTORY */}
          {commandHistory.length > 0 && (
            <div className="border-t border-slate-800 pt-2 font-mono text-[10px]">
              <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Recent Voice Log
              </span>
              <div className="space-y-1 max-h-16 overflow-y-auto">
                {commandHistory.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-slate-300 bg-slate-900/60 px-2 py-1 rounded"
                  >
                    <span className="truncate max-w-[200px] font-mono">
                      &ldquo;{item.transcript}&rdquo;
                    </span>
                    <span
                      className={`font-bold ${
                        item.success ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {item.matchedAction}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between font-mono text-[10px] gap-2">
            <button
              onClick={() => setIsContinuous(!isContinuous)}
              className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                isContinuous
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isContinuous ? '● Continuous Mic' : '○ PTT Mic'}
            </button>

            <button
              onClick={handleCloseDock}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase tracking-wider transition-all border border-slate-700 active:scale-95 shadow"
            >
              CLOSE HANDS-FREE
            </button>
          </div>
        </div>
      )}

      {/* Custom Voice Command Recording & Management Studio */}
      <CommandVoiceSampleStudioModal
        isOpen={isSampleStudioOpen}
        onClose={() => {
          setIsSampleStudioOpen(false);
          refreshCommandAudioSamples();
        }}
      />

      {/* RBAC Protected Driver DOT Compliance Dossier Modal */}
      <DriverDotDossierModal
        isOpen={isDotModalOpen}
        onClose={() => setIsDotModalOpen(false)}
        driver={activeDotDriver}
        currentUserRole="ADMIN"
        onOpenDriverIntelligence={(drv) => {
          setActiveIntelligenceDriver(drv);
          setIsIntelligenceModalOpen(true);
        }}
        onOpenSafetyMeetings={() => {
          if (onOpenSafetyMeetings) onOpenSafetyMeetings();
          else onChangeTab('compliance');
        }}
      />

      {/* Driver Intelligence & Programming Console (Voice, Routes, Breakdowns, DVIR) */}
      <DriverIntelligenceModal
        isOpen={isIntelligenceModalOpen}
        onClose={() => setIsIntelligenceModalOpen(false)}
        driver={activeIntelligenceDriver}
        onOpenDossier={(drv) => {
          setActiveDotDriver(drv);
          setIsDotModalOpen(true);
        }}
      />
    </>
  );
};
