import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  Radio,
  ShieldAlert,
  Wrench,
  AlertTriangle,
  Mic,
  MicOff,
  Square,
  X,
  CheckCheck,
  Clock,
  Volume2,
  VolumeX,
  RefreshCw,
  Search,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  Zap,
  Activity,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Truck,
  DollarSign,
  Scale,
  ShieldCheck,
  ChevronRight,
  Flame,
  RadioTower,
  Sliders,
  AudioLines,
} from 'lucide-react';
import { MessageRecord, MessageChannelType } from '../types';
import { useVoiceSettings } from '../services/voiceSettingsService';
import { triggerHapticFeedback } from '../services/haptics';

// Sound Synthesizer via Web Audio API (Zero external audio files required)
const playCabTone = (type: 'chirp' | 'chime' | 'alert' | 'sos' | 'click') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'chirp') {
      // 2-tone radio transmission chirp
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1200, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'chime') {
      // Incoming message chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.1); // A5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'alert') {
      // Attention alert
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(660, now + 0.15);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'click') {
      // PTT button click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'sos') {
      // Urgent siren tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.linearRampToValueAtTime(950, now + 0.2);
      osc.frequency.linearRampToValueAtTime(700, now + 0.4);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (err) {
    console.warn('Web Audio chime not available:', err);
  }
};

// Text-to-Speech Engine: Reads incoming message aloud over cab audio
const speakInCabMessage = (sender: string, text: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel(); // Stop prior audio
    const utterance = new SpeechSynthesisUtterance();
    // Clean up sender title for concise listening
    const cleanSender = sender.replace(/\(.*?\)/g, '').trim();
    utterance.text = `${cleanSender} says: ${text}`;
    utterance.rate = 1.05; // Slightly faster for operational efficiency
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
};

export interface ReadyDemandItem {
  id: string;
  category: 'DETENTION_DOCK' | 'HOS_SAFETY' | 'EQUIPMENT_REPAIR' | 'TRIP_STATUS';
  icon: any;
  title: string;
  shortLabel: string;
  targetChannel: MessageChannelType;
  priority: 'NORMAL' | 'HIGH' | 'EMERGENCY_SOS';
  badge: string;
  accentColor: string;
  template: (currentTime: string) => string;
}

export const READY_DEMANDS: ReadyDemandItem[] = [
  {
    id: 'demand-detention-90m',
    category: 'DETENTION_DOCK',
    icon: Clock,
    title: 'Detention Claim (90m Mark)',
    shortLabel: 'DETENTION 90m ALERT',
    targetChannel: 'DISPATCH',
    priority: 'HIGH',
    badge: 'FREE TIME EXPIRING',
    accentColor: 'amber',
    template: (time) =>
      `Arrived at dock at ${time}. Standard 2-hour free time window will expire in 30 minutes. Requesting formal broker detention authorization & electronic timestamp confirmation.`,
  },
  {
    id: 'demand-lumper-code',
    category: 'DETENTION_DOCK',
    icon: DollarSign,
    title: 'Lumper Fee Advance Request',
    shortLabel: 'LUMPER ADVANCE CODE',
    targetChannel: 'DISPATCH',
    priority: 'HIGH',
    badge: 'PAYMENT REQUIRED',
    accentColor: 'emerald',
    template: () =>
      `Receiver dock requires an authorized $385.00 lumper payment to unload cargo. Requesting immediate Comchek / EFS express authorization code.`,
  },
  {
    id: 'demand-hos-1hr',
    category: 'HOS_SAFETY',
    icon: ShieldAlert,
    title: 'HOS 1-Hour Low Drive Clock',
    shortLabel: 'HOS 1-HR LOW CLOCK',
    targetChannel: 'SAFETY',
    priority: 'HIGH',
    badge: 'MANDATORY REST SOON',
    accentColor: 'rose',
    template: () =>
      `Under 60 minutes remaining on 11-hour drive clock. Approaching mandatory 10-hour off-duty rest break. Seeking nearest approved safe-haven or designated truck parking stop.`,
  },
  {
    id: 'demand-cat-scale-overweight',
    category: 'HOS_SAFETY',
    icon: Scale,
    title: 'CAT Scale Axle Overweight',
    shortLabel: 'AXLE OVERWEIGHT ALERT',
    targetChannel: 'DISPATCH',
    priority: 'HIGH',
    badge: 'LEGAL OVERWEIGHT',
    accentColor: 'purple',
    template: () =>
      `CAT Scale ticket indicates Tandem Axle overweight at 35,480 lbs (legal limit 34,000 lbs). Requesting authorization to slide tandems or return to shipper dock for pallet rework.`,
  },
  {
    id: 'demand-loaded-rolling',
    category: 'TRIP_STATUS',
    icon: Truck,
    title: 'Loaded & Rolling (Clean BOL)',
    shortLabel: 'LOADED & ROLLING',
    targetChannel: 'DISPATCH',
    priority: 'NORMAL',
    badge: 'OUTBOUND DEPARTURE',
    accentColor: 'blue',
    template: () =>
      `Shipper loading completed. High-security bolt seal #59281 affixed and verified. Clean signed Bill of Lading in hand. Departed dock, rolling outbound on designated route.`,
  },
  {
    id: 'demand-reefer-temp-alarm',
    category: 'EQUIPMENT_REPAIR',
    icon: RadioTower,
    title: 'Reefer Temp Deviation Alarm',
    shortLabel: 'REEFER TEMP ALARM',
    targetChannel: 'MAINTENANCE',
    priority: 'HIGH',
    badge: 'COLD CHAIN ALERT',
    accentColor: 'cyan',
    template: () =>
      `Reefer unit displaying amber temperature deviation code. Set-point: -10°F, Current Box: +14°F. Continuous run engaged. Requesting immediate mobile reefer technician guidance.`,
  },
  {
    id: 'demand-roadside-tire-blowout',
    category: 'EQUIPMENT_REPAIR',
    icon: Wrench,
    title: 'Roadside Breakdown / Tire',
    shortLabel: 'ROADSIDE TIRE BLOWOUT',
    targetChannel: 'MAINTENANCE',
    priority: 'HIGH',
    badge: 'DISPATCH MOBILE ROAD',
    accentColor: 'rose',
    template: () =>
      `Tire blowout / steer puncture on highway shoulder at I-80 Milepost 72. Hazard flashers engaged, reflective warning triangles placed. Requesting nearest mobile road service unit dispatched.`,
  },
  {
    id: 'demand-weather-adverse',
    category: 'HOS_SAFETY',
    icon: Flame,
    title: 'Adverse Weather HOS Exception',
    shortLabel: 'ADVERSE WEATHER DELAY',
    targetChannel: 'SAFETY',
    priority: 'HIGH',
    badge: '49 CFR 395.1(b)',
    accentColor: 'amber',
    template: () =>
      `Severe unexpected winter storm and highway icing encountered. Triggering FMCSA 49 CFR § 395.1(b) 2-hour adverse driving conditions exception. Safe speed reduced to 35 mph.`,
  },
];

export const MessagingView: React.FC = () => {
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('DISPATCH');
  const [inputText, setInputText] = useState<string>('');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'EMERGENCY_SOS'>('NORMAL');
  const [loading, setLoading] = useState<boolean>(true);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [micVolumeLevel, setMicVolumeLevel] = useState<number>(0);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);
  const [sosReason, setSosReason] = useState<string>('Tire Blowout on Shoulder');
  const [sosLocation, setSosLocation] = useState<string>('I-80 Milepost 72 EB Shoulder');

  // Hands-free Mode & Speech-to-Text features
  const [isHudMode, setIsHudMode] = useState<boolean>(false);
  const [isAutoReadEnabled, setIsAutoReadEnabled] = useState<boolean>(true);
  const [isAutoSendOnSilence, setIsAutoSendOnSilence] = useState<boolean>(true);
  const [selectedDemandCategory, setSelectedDemandCategory] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeVoiceCommandFeedback, setActiveVoiceCommandFeedback] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isTranscribingRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<any>(null);
  const lastKnownMessageCountRef = useRef<number>(0);

  // In-cab voice settings (threshold, echo cancellation, haptics, noise suppression)
  const { settings: voiceSettings } = useVoiceSettings();
  const voiceSettingsRef = useRef(voiceSettings);
  useEffect(() => {
    voiceSettingsRef.current = voiceSettings;
  }, [voiceSettings]);

  const fetchMessages = async () => {
    try {
      const url = selectedChannel === 'ALL' ? '/api/messages' : `/api/messages?channel=${selectedChannel}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const incomingMessages = data.messages || [];

        // Check if a new message arrived from a dispatcher or safety officer
        if (
          isAutoReadEnabled &&
          lastKnownMessageCountRef.current > 0 &&
          incomingMessages.length > lastKnownMessageCountRef.current
        ) {
          const latest = incomingMessages[incomingMessages.length - 1];
          if (latest && latest.senderRole !== 'DRIVER') {
            playCabTone(latest.priority === 'EMERGENCY_SOS' ? 'sos' : latest.priority === 'HIGH' ? 'alert' : 'chime');
            speakInCabMessage(latest.senderName, latest.text);
          }
        }

        lastKnownMessageCountRef.current = incomingMessages.length;
        setMessages(incomingMessages);
        if (data.channels) setChannels(data.channels);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedChannel, isAutoReadEnabled]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isHudMode]);

  // Cleanly stop microphone stream and speech recognition
  const stopMicrophoneTranscription = useCallback(() => {
    isTranscribingRef.current = false;
    setIsTranscribing(false);
    setInterimTranscript('');

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }

    setMicVolumeLevel(0);
    playCabTone('click');
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopMicrophoneTranscription();
    };
  }, [stopMicrophoneTranscription]);

  // Handle immediate dispatch of a ready demand
  const handleExecuteReadyDemand = async (demand: ReadyDemandItem) => {
    playCabTone('click');
    if (voiceSettingsRef.current.speechHapticsConfirmation) {
      triggerHapticFeedback('medium');
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedText = demand.template(currentTime);

    try {
      const payload = {
        channel: demand.targetChannel,
        text: formattedText,
        priority: demand.priority,
        attachedLoadId: 'LD-9921',
      };

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        playCabTone(demand.priority === 'HIGH' ? 'alert' : 'chirp');
        setStatusNotification(`DEMAND TRANSMITTED: "${demand.shortLabel}" sent to ${demand.targetChannel}`);
        setSelectedChannel(demand.targetChannel);
        await fetchMessages();
      }
    } catch (err) {
      console.error('Failed to dispatch ready demand:', err);
    } finally {
      setTimeout(() => setStatusNotification(null), 6000);
    }
  };

  // Fallback simulation test for environments without SpeechRecognition
  const handleSimulatedVoiceInput = useCallback(() => {
    setIsTranscribing(true);
    isTranscribingRef.current = true;
    setInterimTranscript('Listening: "Dispatch, Vance on TR-904... At shipper gate, starting detention timer."');
    playCabTone('click');

    setTimeout(() => {
      const sampleSpoken = 'Dispatch, Vance here on TR-904. Scale is open on mile 71, all green. ETA to consignee is 45 minutes.';
      setInputText((prev) => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed} ${sampleSpoken}` : sampleSpoken;
      });
      setInterimTranscript('');
      setIsTranscribing(false);
      isTranscribingRef.current = false;
      playCabTone('chirp');
      if (voiceSettingsRef.current.speechHapticsConfirmation) {
        triggerHapticFeedback('success');
      }
    }, 2400);
  }, []);

  // Voice Command Trigger Keyword Detection
  const evaluateVoiceCommandTriggers = useCallback(
    (spokenText: string) => {
      const lower = spokenText.toLowerCase();

      if (lower.includes('detention') || lower.includes('free time')) {
        const demand = READY_DEMANDS.find((d) => d.id === 'demand-detention-90m');
        if (demand) {
          setActiveVoiceCommandFeedback('VOICE TRIGGER: DETENTION ALERT');
          handleExecuteReadyDemand(demand);
          return true;
        }
      }

      if (lower.includes('lumper') || lower.includes('comchek') || lower.includes('advance')) {
        const demand = READY_DEMANDS.find((d) => d.id === 'demand-lumper-code');
        if (demand) {
          setActiveVoiceCommandFeedback('VOICE TRIGGER: LUMPER ADVANCE');
          handleExecuteReadyDemand(demand);
          return true;
        }
      }

      if (lower.includes('low clock') || lower.includes('parking') || lower.includes('hos warning')) {
        const demand = READY_DEMANDS.find((d) => d.id === 'demand-hos-1hr');
        if (demand) {
          setActiveVoiceCommandFeedback('VOICE TRIGGER: HOS 1-HR CLOCK');
          handleExecuteReadyDemand(demand);
          return true;
        }
      }

      if (lower.includes('overweight') || lower.includes('scale') || lower.includes('tandem')) {
        const demand = READY_DEMANDS.find((d) => d.id === 'demand-cat-scale-overweight');
        if (demand) {
          setActiveVoiceCommandFeedback('VOICE TRIGGER: SCALE OVERWEIGHT');
          handleExecuteReadyDemand(demand);
          return true;
        }
      }

      if (lower.includes('loaded and rolling') || lower.includes('rolling out') || lower.includes('departed')) {
        const demand = READY_DEMANDS.find((d) => d.id === 'demand-loaded-rolling');
        if (demand) {
          setActiveVoiceCommandFeedback('VOICE TRIGGER: LOADED & ROLLING');
          handleExecuteReadyDemand(demand);
          return true;
        }
      }

      if (lower.includes('breakdown') || lower.includes('tire blowout') || lower.includes('flat tire')) {
        const demand = READY_DEMANDS.find((d) => d.id === 'demand-roadside-tire-blowout');
        if (demand) {
          setActiveVoiceCommandFeedback('VOICE TRIGGER: TIRE BREAKDOWN');
          handleExecuteReadyDemand(demand);
          return true;
        }
      }

      if (lower.includes('emergency sos') || lower.includes('911') || lower.includes('mayday')) {
        setIsSosModalOpen(true);
        playCabTone('sos');
        return true;
      }

      return false;
    },
    []
  );

  // Send message API call
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText !== undefined ? customText : inputText).trim();
    if (!textToSend) return;

    if (isTranscribing) {
      stopMicrophoneTranscription();
    }

    try {
      const payload: any = {
        channel: selectedChannel === 'ALL' ? 'DISPATCH' : selectedChannel,
        text: textToSend,
        priority,
      };

      if (voiceTranscript) {
        payload.audioTranscript = voiceTranscript;
      }

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        playCabTone('chirp');
        setInputText('');
        setVoiceTranscript('');
        setPriority('NORMAL');
        await fetchMessages();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Start real microphone voice input with audio frequency spectrum analyzer
  const startMicrophoneTranscription = useCallback(async () => {
    setSpeechError(null);
    playCabTone('click');

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSpeechSupported(false);
      handleSimulatedVoiceInput();
      return;
    }

    setIsSpeechSupported(true);

    try {
      // 1. Audio stream & spectrum visualizer
      if (typeof window !== 'undefined' && navigator?.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: voiceSettingsRef.current.echoCancellation,
              noiseSuppression: voiceSettingsRef.current.noiseSuppression,
              autoGainControl: voiceSettingsRef.current.autoGainControl,
            },
          });
          mediaStreamRef.current = stream;

          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            audioContextRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.2;
            source.connect(analyser);
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const checkVolume = () => {
              if (!analyserRef.current || !isTranscribingRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              const normalized = Math.min(100, Math.round((avg / 100) * 100));
              setMicVolumeLevel(normalized);
              animFrameRef.current = requestAnimationFrame(checkVolume);
            };
            animFrameRef.current = requestAnimationFrame(checkVolume);
          }
        } catch (mediaErr) {
          console.warn('Audio analyser not initialized, continuing with speech recognition', mediaErr);
        }
      }

      // 2. Web Speech Recognition instance
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        isTranscribingRef.current = true;
        setIsTranscribing(true);
        if (voiceSettingsRef.current.speechHapticsConfirmation) {
          triggerHapticFeedback('subtle');
        }
      };

      recognition.onresult = (event: any) => {
        let interimStr = '';
        let finalStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            finalStr += transcript;
          } else {
            interimStr += transcript;
          }
        }

        if (interimStr) {
          setInterimTranscript(interimStr);
        }

        if (finalStr.trim()) {
          const recognizedText = finalStr.trim();
          setInterimTranscript('');

          // Check if this spoken text is an instant voice command trigger
          const triggeredCommand = evaluateVoiceCommandTriggers(recognizedText);
          if (triggeredCommand) {
            return;
          }

          setInputText((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${recognizedText}` : recognizedText;
          });
          setVoiceTranscript((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${recognizedText}` : recognizedText;
          });

          // Hands-free auto-send after 1.8 seconds of silence
          if (isAutoSendOnSilence) {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              handleSendMessage(recognizedText);
            }, 1800);
          }

          if (voiceSettingsRef.current.speechHapticsConfirmation) {
            triggerHapticFeedback('success');
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') return;
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone access denied. Please grant microphone permission.');
          stopMicrophoneTranscription();
          return;
        }
        console.warn('Speech recognition warning:', event.error);
      };

      recognition.onend = () => {
        if (isTranscribingRef.current) {
          try {
            recognition.start();
          } catch {
            // ignore
          }
        } else {
          stopMicrophoneTranscription();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setSpeechError(err.message || 'Speech recognition initialization failed.');
      stopMicrophoneTranscription();
    }
  }, [stopMicrophoneTranscription, handleSimulatedVoiceInput, evaluateVoiceCommandTriggers, isAutoSendOnSilence]);

  const handleToggleVoiceTranscribe = () => {
    if (isTranscribing) {
      stopMicrophoneTranscription();
    } else {
      startMicrophoneTranscription();
    }
  };

  const handleSendSosBroadcast = async () => {
    try {
      const res = await fetch('/api/messages/broadcast-sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: sosReason, location: sosLocation }),
      });

      if (res.ok) {
        setIsSosModalOpen(false);
        playCabTone('sos');
        setStatusNotification('EMERGENCY SOS TRANSMITTED: Fleet Control Center and Roadside Response alerted.');
        await fetchMessages();
      }
    } catch (err) {
      console.error('Failed to broadcast SOS:', err);
    } finally {
      setTimeout(() => setStatusNotification(null), 8000);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return m.text.toLowerCase().includes(q) || m.senderName.toLowerCase().includes(q);
  });

  const filteredDemands = READY_DEMANDS.filter((d) => {
    if (selectedDemandCategory === 'ALL') return true;
    return d.category === selectedDemandCategory;
  });

  return (
    <div className={`flex flex-col w-full pb-16 font-sans transition-all duration-300 ${isHudMode ? 'bg-[#000000] min-h-screen px-4 pt-2 text-white' : 'px-3 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto'}`}>
      {/* Top Cockpit Header Bar */}
      <div className={`border-b ${isHudMode ? 'border-[#333] pb-3' : 'border-[#222] pb-4 pt-2'}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-[#D4AF37]" />
                COMMERCIAL FLEET DISPATCH &amp; CAB COMMS
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                49 CFR § 392.80 &amp; § 392.82 HANDS-FREE COMPLIANT
              </span>
              {isAutoReadEnabled && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-800/80 uppercase flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-cyan-400" />
                  AUTO-READ INCOMING (TTS) ON
                </span>
              )}
            </div>
            <h1 className={`${isHudMode ? 'text-2xl sm:text-4xl' : 'text-2xl sm:text-3xl'} font-black text-white uppercase tracking-tight flex items-center gap-2.5`}>
              <MessageSquare className="w-7 h-7 text-[#D4AF37]" />
              Hands-Free In-Cab Comms &amp; Instant Demands
            </h1>
            <p className="text-xs text-[#888] font-mono mt-1">
              One-touch &amp; talk-to-text messaging engineered for commercial driver compliance: zero manual typing while driving, audible text-to-speech readouts, and instant operational demands.
            </p>
          </div>

          {/* Quick HUD & SOS Mode Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Auto Read Toggle */}
            <button
              onClick={() => {
                setIsAutoReadEnabled(!isAutoReadEnabled);
                playCabTone('click');
              }}
              className={`px-3 py-2 rounded font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
                isAutoReadEnabled
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                  : 'bg-[#181818] border-[#333] text-[#777] hover:text-white'
              }`}
              title="Speak incoming messages aloud over cab speaker"
            >
              {isAutoReadEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-[#777]" />}
              <span>{isAutoReadEnabled ? 'VOICE READER ON' : 'VOICE READER OFF'}</span>
            </button>

            {/* HUD Full Screen Switch */}
            <button
              onClick={() => {
                setIsHudMode(!isHudMode);
                playCabTone('click');
              }}
              className={`px-3.5 py-2 rounded font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
                isHudMode
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg'
                  : 'bg-[#1a1a1a] text-white border-[#333] hover:border-[#D4AF37]'
              }`}
            >
              {isHudMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4 text-[#D4AF37]" />}
              <span>{isHudMode ? 'EXIT HUD' : 'COCKPIT HUD MODE'}</span>
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={() => {
                setIsSosModalOpen(true);
                playCabTone('alert');
              }}
              className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 rounded shadow-md transition-all animate-pulse"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>SOS CAB BEACON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Status Notifications */}
      {statusNotification && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-600 text-emerald-200 text-xs font-mono flex items-center justify-between rounded shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <span className="font-bold">// FLEET TRANSMISSION SENT:</span>
            <span>{statusNotification}</span>
          </div>
          <button onClick={() => setStatusNotification(null)} className="text-[#888] hover:text-white ml-3">
            ✕
          </button>
        </div>
      )}

      {/* Voice Trigger Detected Feedback Banner */}
      {activeVoiceCommandFeedback && (
        <div className="p-3 bg-amber-950/90 border border-amber-500 text-amber-200 text-xs font-mono flex items-center justify-between rounded shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <RadioTower className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="font-bold">// HANDS-FREE VOICE COMMAND RECOGNIZED:</span>
            <span>{activeVoiceCommandFeedback}</span>
          </div>
          <button onClick={() => setActiveVoiceCommandFeedback(null)} className="text-[#888] hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* SECTION 1: READY-TO-GO DEMANDS (TACTICAL QUICK DEMANDS MATRIX) */}
      <div className="bg-[#121212] border border-[#262626] rounded-lg p-4 font-mono space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#222] pb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              READY-TO-GO DEMANDS (1-TAP CAB DISPATCH SHORTCUTS)
            </span>
            <span className="text-[10px] text-[#777] hidden md:inline">
              | Speak keywords or tap once to send legally structured operational demands
            </span>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
            {['ALL', 'DETENTION_DOCK', 'HOS_SAFETY', 'EQUIPMENT_REPAIR', 'TRIP_STATUS'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedDemandCategory(cat)}
                className={`px-2 py-0.5 rounded transition-all ${
                  selectedDemandCategory === cat
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'bg-[#181818] border border-[#2b2b2b] text-[#888] hover:text-white'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Demands Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {filteredDemands.map((demand) => {
            const Icon = demand.icon;
            return (
              <button
                key={demand.id}
                onClick={() => handleExecuteReadyDemand(demand)}
                className="group relative p-3 rounded-lg bg-[#161616] hover:bg-[#1f1f1f] border border-[#2a2a2a] hover:border-[#D4AF37] text-left transition-all flex flex-col justify-between shadow-sm active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#222] text-[#D4AF37] border border-[#333]">
                      {demand.badge}
                    </span>
                    <span className="text-[9px] text-[#666] font-bold">{demand.targetChannel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white font-black text-xs group-hover:text-[#D4AF37] transition-colors">
                    <Icon className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>{demand.shortLabel}</span>
                  </div>
                  <p className="text-[10px] text-[#888] mt-1 line-clamp-2 leading-relaxed font-sans">
                    {demand.title}
                  </p>
                </div>
                <div className="mt-2.5 pt-1.5 border-t border-[#222] flex items-center justify-between text-[9px] text-[#777]">
                  <span className="text-[#059669] font-bold">1-TAP EXECUTE</span>
                  <ChevronRight className="w-3 h-3 text-[#666] group-hover:text-[#D4AF37] transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: HANDS-FREE TALK-TO-TEXT COCKPIT TRANSMITTER (HUD BIG PTT) */}
      <div className={`rounded-lg border p-4 font-mono ${isHudMode ? 'bg-[#0a0a0a] border-[#444]' : 'bg-[#141414] border-[#292929]'}`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Big Push-To-Talk Microphone Trigger */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={handleToggleVoiceTranscribe}
              className={`relative h-16 sm:h-20 px-6 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all shrink-0 active:scale-95 shadow-xl ${
                isTranscribing
                  ? 'bg-rose-600 text-white border-2 border-rose-400 animate-pulse shadow-rose-900/50'
                  : 'bg-[#D4AF37] hover:bg-[#ebd28b] text-black border-2 border-[#D4AF37]'
              }`}
            >
              {isTranscribing ? (
                <>
                  <Square className="w-6 h-6 fill-white" />
                  <div className="text-left">
                    <div className="text-xs text-rose-200">RECORDING IN-CAB...</div>
                    <div className="text-sm font-black">TAP TO STOP &amp; SEND</div>
                  </div>
                </>
              ) : (
                <>
                  <Mic className="w-7 h-7 text-black" />
                  <div className="text-left">
                    <div className="text-xs text-black/70">HANDS-FREE COCKPIT</div>
                    <div className="text-sm font-black">PUSH TO TALK (MIC)</div>
                  </div>
                </>
              )}
            </button>

            {/* Dynamic 16-Band VU Spectrum Waveform Equalizer */}
            <div className="flex-1 min-w-[140px] bg-[#0c0c0c] border border-[#222] p-2.5 rounded-lg flex flex-col justify-center">
              <div className="flex items-center justify-between text-[10px] text-[#777] mb-1">
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                  AUDIO VU LEVEL: {micVolumeLevel}%
                </span>
                <span className="text-[#555]">NOISE GATE: {voiceSettings.noiseGatePreset.toUpperCase()}</span>
              </div>

              {/* Animated 16 Bars */}
              <div className="flex items-end gap-1 h-6">
                {[20, 45, 75, 30, 85, 95, 60, 40, 70, 90, 80, 50, 65, 35, 80, 45].map((seed, idx) => {
                  const barHeight = isTranscribing
                    ? Math.max(10, Math.min(100, Math.round((seed * micVolumeLevel) / 60)))
                    : 12;
                  return (
                    <div
                      key={idx}
                      style={{ height: `${barHeight}%` }}
                      className={`flex-1 rounded-sm transition-all duration-75 ${
                        isTranscribing
                          ? barHeight > 75
                            ? 'bg-rose-500'
                            : barHeight > 45
                            ? 'bg-[#D4AF37]'
                            : 'bg-emerald-400'
                          : 'bg-[#222]'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Voice Controls: Auto-Send, Channel Target, TTS Readout */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap text-xs">
            <label className="flex items-center gap-2 cursor-pointer bg-[#0c0c0c] border border-[#262626] px-3 py-2 rounded">
              <input
                type="checkbox"
                checked={isAutoSendOnSilence}
                onChange={(e) => setIsAutoSendOnSilence(e.target.checked)}
                className="rounded accent-[#D4AF37]"
              />
              <span className="text-[#AAA] text-[11px] font-bold">AUTO-SEND ON 2s SILENCE</span>
            </label>

            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="px-3 py-2 bg-[#0c0c0c] border border-[#333] text-white font-bold rounded text-xs focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="DISPATCH">ROUTE: CENTRAL DISPATCH</option>
              <option value="SAFETY">ROUTE: SAFETY &amp; COMPLIANCE</option>
              <option value="MAINTENANCE">ROUTE: ROADSIDE REPAIR</option>
              <option value="SHIPPER_RECEIVER">ROUTE: SHIPPER / DOCK</option>
              <option value="CB_CHATTER">ROUTE: CB CHANNEL 19</option>
            </select>
          </div>
        </div>

        {/* Live Interim Transcript Bubble */}
        {(isTranscribing || interimTranscript) && (
          <div className="mt-3 p-3 bg-black/80 border border-emerald-500/80 rounded text-emerald-200 text-xs flex items-center gap-2.5 animate-pulse">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-white">LIVE SPEECH:</span>
            <span className="italic">{interimTranscript || 'Listening for speech in cab...'}</span>
          </div>
        )}

        {speechError && (
          <div className="mt-2 text-rose-400 text-[11px] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{speechError}</span>
          </div>
        )}
      </div>

      {/* SECTION 3: MAIN MESSAGING COMMUNICATIONS STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Comms Channels & Telemetry Widget */}
        <div className="bg-[#121212] border border-[#262626] rounded-lg p-4 font-mono text-xs space-y-3 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-[#222] pb-2">
            <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#D4AF37]" />
              FLEET COMMS CHANNELS
            </span>
            <button onClick={fetchMessages} className="text-[#666] hover:text-white" title="Refresh">
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Search messages */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#666] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chat &amp; codes..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-[#0a0a0a] border border-[#2b2b2b] rounded text-white text-[11px] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Channels List */}
          <div className="space-y-1.5">
            {[
              { id: 'DISPATCH', label: 'Fleet Dispatch', icon: MessageSquare, badge: 'CENTRAL' },
              { id: 'SAFETY', label: 'Safety & Compliance', icon: ShieldAlert, badge: 'DOT' },
              { id: 'MAINTENANCE', label: 'Roadside / Shop', icon: Wrench, badge: 'MECHANIC' },
              { id: 'CB_CHATTER', label: 'CB Radio Ch-19', icon: Radio, badge: 'HIGHWAY' },
              { id: 'SHIPPER_RECEIVER', label: 'Shipper / Receiver', icon: Clock, badge: 'DOCK' },
            ].map((chan) => {
              const Icon = chan.icon;
              const isSelected = selectedChannel === chan.id;
              const found = channels.find((c) => c.id === chan.id);
              const unread = found ? found.unread : 0;

              return (
                <button
                  key={chan.id}
                  onClick={() => setSelectedChannel(chan.id)}
                  className={`w-full p-2.5 rounded text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-[#D4AF37]/20 border border-[#D4AF37] text-white'
                      : 'bg-[#181818] border border-[#252525] text-[#888] hover:text-white hover:bg-[#202020]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#D4AF37]' : 'text-[#666]'}`} />
                    <span className="font-bold text-[11px]">{chan.label}</span>
                  </div>
                  {unread > 0 && (
                    <span className="px-1.5 py-0.5 bg-rose-900/80 border border-rose-700 text-rose-300 rounded text-[9px] font-bold">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Unit Status Telematics Box */}
          <div className="pt-3 border-t border-[#222] text-[10px] space-y-1.5 text-[#777]">
            <div className="flex justify-between">
              <span>CONNECTED TRACTOR:</span>
              <span className="text-white font-bold">TR-904 (Cascadia)</span>
            </div>
            <div className="flex justify-between">
              <span>ACTIVE CDL DRIVER:</span>
              <span className="text-[#D4AF37]">Vance R. (CDL-A)</span>
            </div>
            <div className="flex justify-between">
              <span>CELLULAR TELEMETRY:</span>
              <span className="text-emerald-400 font-bold">5G LTE ENCRYPTED</span>
            </div>
            <div className="flex justify-between">
              <span>CURRENT LOAD ID:</span>
              <span className="text-cyan-300">LD-9921 (Meijer DC)</span>
            </div>
          </div>
        </div>

        {/* Right Chat Stream & Interactive Voice Box */}
        <div className={`bg-[#121212] border border-[#262626] rounded-lg flex flex-col justify-between font-mono text-xs lg:col-span-3 ${isHudMode ? 'h-[680px]' : 'h-[600px]'}`}>
          {/* Channel Header Bar */}
          <div className="p-3 border-b border-[#222] bg-[#161616] rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                CHANNEL: {selectedChannel.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[#888] hidden sm:inline">END-TO-END FLEET ENCRYPTED</span>
              <button
                onClick={() => {
                  if (filteredMessages.length > 0) {
                    const lastMsg = filteredMessages[filteredMessages.length - 1];
                    speakInCabMessage(lastMsg.senderName, lastMsg.text);
                  }
                }}
                className="px-2 py-1 bg-[#222] hover:bg-[#333] border border-[#444] text-[#D4AF37] rounded text-[10px] flex items-center gap-1 font-bold"
                title="Read latest message aloud over cab audio"
              >
                <Volume2 className="w-3 h-3 text-[#D4AF37]" />
                <span>READ LATEST</span>
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3.5">
            {filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#555] space-y-2">
                <MessageSquare className="w-8 h-8 text-[#333]" />
                <span>No messages found in this communication channel.</span>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isDriver = msg.senderRole === 'DRIVER';
                const isSos = msg.priority === 'EMERGENCY_SOS';
                const isHigh = msg.priority === 'HIGH';

                return (
                  <div key={msg.id} className={`flex flex-col ${isDriver ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 text-[10px] text-[#777]">
                      <span className="font-bold text-[#BBB]">{msg.senderName}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                      {isHigh && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                          HIGH PRIORITY
                        </span>
                      )}
                      {isSos && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-700 font-bold animate-pulse">
                          EMERGENCY SOS
                        </span>
                      )}
                    </div>

                    <div
                      className={`max-w-xl p-3.5 rounded-lg text-xs leading-relaxed relative group ${
                        isSos
                          ? 'bg-rose-950/80 border border-rose-600 text-rose-200'
                          : isDriver
                          ? 'bg-[#1b261e] border border-emerald-800/60 text-emerald-100 rounded-tr-none'
                          : 'bg-[#181818] border border-[#2a2a2a] text-[#DDD] rounded-tl-none'
                      }`}
                    >
                      <p className="font-sans text-sm">{msg.text}</p>

                      {msg.attachedLoadId && (
                        <div className="mt-2 pt-1 border-t border-white/10 text-[10px] text-[#D4AF37] flex items-center gap-1 font-mono">
                          <Truck className="w-3 h-3" />
                          <span>ATTACHED LOAD: {msg.attachedLoadId}</span>
                        </div>
                      )}

                      {/* Read Aloud Button on individual message */}
                      <button
                        onClick={() => speakInCabMessage(msg.senderName, msg.text)}
                        className="absolute right-2 top-2 p-1 bg-black/50 hover:bg-black text-[#888] hover:text-[#D4AF37] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Read message aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Bottom Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-[#222] bg-[#141414] rounded-b-lg flex items-center gap-2"
          >
            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={handleToggleVoiceTranscribe}
              className={`p-2.5 rounded border transition-all flex items-center gap-1.5 shrink-0 ${
                isTranscribing
                  ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                  : 'bg-[#1c1c1c] border-[#333] hover:border-[#D4AF37] text-white'
              }`}
              title="Push to Talk"
            >
              {isTranscribing ? <Square className="w-4 h-4 fill-white" /> : <Mic className="w-4 h-4 text-[#D4AF37]" />}
            </button>

            {/* Priority Selector */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="px-2 py-2.5 bg-[#0a0a0a] border border-[#333] rounded text-white text-[11px] focus:outline-none focus:border-[#D4AF37] shrink-0"
            >
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High Priority</option>
              <option value="EMERGENCY_SOS">Emergency SOS</option>
            </select>

            {/* Input Box */}
            <div className="relative flex-1">
              <input
                id="messaging-composer-input"
                type="text"
                placeholder={
                  isTranscribing
                    ? 'Listening... Speak in-cab message now'
                    : 'Speak via MIC or type dispatch instruction...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className={`w-full px-3 py-2.5 bg-[#0a0a0a] border rounded text-white text-xs focus:outline-none transition-all ${
                  isTranscribing
                    ? 'border-emerald-500/80 ring-1 ring-emerald-500/50 placeholder:text-emerald-300/60'
                    : 'border-[#333] focus:border-[#D4AF37]'
                }`}
              />
              {inputText && (
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  title="Clear composer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              id="btn-send-message"
              type="submit"
              disabled={!inputText.trim()}
              className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#f3df9b] text-black font-black text-xs rounded transition-all disabled:opacity-40 flex items-center gap-1.5 shrink-0 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SEND</span>
            </button>
          </form>
        </div>
      </div>

      {/* Emergency SOS Broadcast Modal */}
      {isSosModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 font-mono text-xs">
          <div className="bg-[#141010] border-2 border-rose-600 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold border-b border-rose-900 pb-3">
              <AlertTriangle className="w-6 h-6 text-rose-400 animate-pulse" />
              <div>
                <h3 className="text-base text-white font-black">EMERGENCY CAB BROADCAST (SOS)</h3>
                <span className="text-[10px] text-rose-400">49 CFR § 392 ROADSIDE EMERGENCY ASSISTANCE</span>
              </div>
            </div>

            <p className="text-[#AAA] text-xs leading-relaxed">
              Transmitting an emergency SOS immediately alerts Central Dispatch, Fleet Safety Chief, and nearest heavy-wrecker roadside service with your exact GPS telemetry coordinates.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[#888] uppercase block mb-1">Emergency Nature / Defect</label>
                <input
                  type="text"
                  value={sosReason}
                  onChange={(e) => setSosReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-rose-800/80 rounded text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#888] uppercase block mb-1">Shoulder Location / Milepost</label>
                <input
                  type="text"
                  value={sosLocation}
                  onChange={(e) => setSosLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-rose-800/80 rounded text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-rose-900/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSosModalOpen(false)}
                className="px-4 py-2 bg-[#222] hover:bg-[#333] text-white font-bold rounded"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSendSosBroadcast}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded uppercase tracking-wider shadow-lg transition-all flex items-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>TRANSMIT SOS NOW</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
