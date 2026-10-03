// ============================================================================
// VINTAGE CB RADIO TRANSCEIVER & MICROPHONE VOICE COMMUNICATOR
// Classic 27MHz 40-Channel Transceiver with Web Audio DSP, Live Device Microphone
// Capture, Analog S-Meter, Oscilloscope Display, PTT Coiled Mic, Multi-Channel
// Spectrum Waterfall, Squelch Audio Gating, Roger Beeps & Realistic Trucker Chatter.
// ============================================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Radio,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sliders,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Send,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Hash,
  Compass,
  Layers,
  Search,
  MessageSquare,
  Flame,
  Clock,
  RadioTower,
  Cpu,
  RefreshCw,
  ExternalLink,
  Volume1,
  Share2,
  Lock,
  Unlock,
} from 'lucide-react';
import {
  CB_CHANNELS,
  TEN_CODES,
  TRUCKER_SLANG_GLOSSARY,
  INITIAL_CHANNEL_MESSAGES,
  CBChannelSpec,
  CBRadioMessage,
  CB10CodeItem,
} from '../data/cbRadioChannels';
import { cbAudioEngine, CBAudioEngineState } from '../services/cbAudioEngine';
import { triggerHapticFeedback } from '../services/haptics';

interface CBRadioViewProps {
  onNavigateToTab?: (tab: any) => void;
}

export const CBRadioView: React.FC<CBRadioViewProps> = ({ onNavigateToTab }) => {
  // Current Selected Channel
  const [currentChannelNum, setCurrentChannelNum] = useState<number>(19);
  const currentChannel = useMemo(
    () => CB_CHANNELS.find((c) => c.channel === currentChannelNum) || CB_CHANNELS[18],
    [currentChannelNum]
  );

  // Audio Engine State
  const [engineState, setEngineState] = useState<Partial<CBAudioEngineState>>({
    isMicActive: false,
    isTransmitting: false,
    isReceiving: false,
    squelchLevel: 35,
    volumeLevel: 80,
    rfGainLevel: 90,
    micGainLevel: 85,
    noiseBlanker: true,
    rogerBeepEnabled: true,
    audioModulationRms: 0,
    signalStrengthS: 0,
    swrRatio: 1.1,
  });

  // Controls State
  const [volume, setVolume] = useState<number>(80);
  const [squelch, setSquelch] = useState<number>(35);
  const [micGain, setMicGain] = useState<number>(85);
  const [rfGain, setRfGain] = useState<number>(90);
  const [rogerBeep, setRogerBeep] = useState<boolean>(true);
  const [noiseBlanker, setNoiseBlanker] = useState<boolean>(true);
  const [hiCutFilter, setHiCutFilter] = useState<boolean>(false);
  const [radioMode, setRadioMode] = useState<'AM' | 'USB' | 'LSB' | 'FM'>('AM');
  const [paMode, setPaMode] = useState<boolean>(false);
  const [displayTheme, setDisplayTheme] = useState<'AMBER' | 'EMERALD' | 'CYBER' | 'NIGHT'>('AMBER');
  const [meterMode, setMeterMode] = useState<'S_RF' | 'SWR' | 'MOD'>('S_RF');

  // Mic & PTT State
  const [isMicPermissionGranted, setIsMicPermissionGranted] = useState<boolean>(false);
  const [isPttHeld, setIsPttHeld] = useState<boolean>(false);
  const [isPttLocked, setIsPttLocked] = useState<boolean>(false);
  const [userHandle, setUserHandle] = useState<string>('Rubber Duck (Rig #104)');
  const [isEditingHandle, setIsEditingHandle] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [interimVoiceText, setInterimVoiceText] = useState<string>('');
  const [textInputMessage, setTextInputMessage] = useState<string>('');

  // Channel Messages Store
  const [messagesByChannel, setMessagesByChannel] = useState<Record<number, CBRadioMessage[]>>(INITIAL_CHANNEL_MESSAGES);
  const currentMessages = useMemo(
    () => messagesByChannel[currentChannelNum] || [],
    [messagesByChannel, currentChannelNum]
  );

  // Search & Filters
  const [activeTab, setActiveTab] = useState<'TRANSCEIVER' | 'SPECTRUM_WATERFALL' | 'TEN_CODES' | 'SLANG'>('TRANSCEIVER');
  const [tenCodeSearch, setTenCodeSearch] = useState<string>('');
  const [slangSearch, setSlangSearch] = useState<string>('');

  // Canvas Ref for Oscilloscope & Spectrum
  const oscilloscopeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to Audio Engine Updates
  useEffect(() => {
    const unsubState = cbAudioEngine.subscribe((state) => {
      setEngineState((prev) => ({ ...prev, ...state }));
    });

    const unsubTranscript = cbAudioEngine.onTranscript((text, isFinal) => {
      setInterimVoiceText(text);
      if (isFinal && text.trim()) {
        setLiveTranscript(text);
      }
    });

    return () => {
      unsubState();
      unsubTranscript();
    };
  }, []);

  // Sync Audio Engine Parameters
  useEffect(() => {
    cbAudioEngine.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    cbAudioEngine.setSquelch(squelch);
  }, [squelch]);

  useEffect(() => {
    cbAudioEngine.setMicGain(micGain);
  }, [micGain]);

  useEffect(() => {
    cbAudioEngine.setRfGain(rfGain);
  }, [rfGain]);

  // Request Microphone Access on Mount or User Click
  const handleEnableMicrophone = async () => {
    triggerHapticFeedback('tick');
    const success = await cbAudioEngine.startMicrophone();
    setIsMicPermissionGranted(success);
    if (success) {
      triggerHapticFeedback('success');
    }
  };

  // Channel Tuning Handler
  const handleTuneChannel = (ch: number) => {
    if (ch < 1 || ch > 40) return;
    triggerHapticFeedback('tick');
    cbAudioEngine.playMicClickSound(false);
    cbAudioEngine.playSquelchTail(140);
    setCurrentChannelNum(ch);
  };

  // PTT Trigger Handlers
  const handleStartPtt = () => {
    if (!isMicPermissionGranted) {
      handleEnableMicrophone();
    }
    triggerHapticFeedback('double');
    setIsPttHeld(true);
    setInterimVoiceText('');
    setLiveTranscript('');
    cbAudioEngine.startTransmission();
  };

  const handleStopPtt = () => {
    if (isPttLocked) return; // ignore release if locked
    setIsPttHeld(false);
    cbAudioEngine.stopTransmission();
    triggerHapticFeedback('tick');

    // If there was speech transcribed during transmission, auto-broadcast it
    const msgText = interimVoiceText.trim() || liveTranscript.trim();
    if (msgText) {
      broadcastMessage(msgText, true);
    }
  };

  const handleTogglePttLock = () => {
    if (isPttLocked) {
      setIsPttLocked(false);
      setIsPttHeld(false);
      cbAudioEngine.stopTransmission();
      triggerHapticFeedback('tick');
      const msgText = interimVoiceText.trim() || liveTranscript.trim();
      if (msgText) {
        broadcastMessage(msgText, true);
      }
    } else {
      if (!isMicPermissionGranted) {
        handleEnableMicrophone();
      }
      setIsPttLocked(true);
      setIsPttHeld(true);
      setInterimVoiceText('');
      setLiveTranscript('');
      cbAudioEngine.startTransmission();
      triggerHapticFeedback('double');
    }
  };

  // Broadcast Message to Channel
  const broadcastMessage = (text: string, isVoice: boolean = false, tenCode?: string) => {
    if (!text.trim()) return;
    triggerHapticFeedback('success');

    const newMsg: CBRadioMessage = {
      id: `cb-msg-${Date.now()}`,
      channel: currentChannelNum,
      senderHandle: userHandle,
      senderUnit: 'UNIT #104-E (Titan Peterbilt 579)',
      role: 'USER',
      text: text.trim(),
      timestamp: 'Just now',
      signalStrengthS: 9,
      distanceMiles: 0,
      tenCode: tenCode || (text.includes('10-') ? text.match(/10-\d+/)?.[0] : undefined),
      location: 'I-80 Mile Marker 142 EB (Mobile Rig)',
      verified: true,
      audioDurationSec: isVoice ? 4 : 3,
    };

    setMessagesByChannel((prev) => ({
      ...prev,
      [currentChannelNum]: [...(prev[currentChannelNum] || []), newMsg],
    }));

    setTextInputMessage('');
    setInterimVoiceText('');
    setLiveTranscript('');

    // Trigger AI Trucker Response after 2.5-4 seconds
    triggerSimulatedTruckerReply(text, currentChannelNum);
  };

  // Contextual AI Trucker Reply Simulation
  const triggerSimulatedTruckerReply = (userText: string, channel: number) => {
    const q = userText.toLowerCase();

    let replyHandle = 'Midwest Express';
    let replyUnit = 'Freightliner Cascadia #22';
    let replyText = '10-4 driver, copied you loud and clear on the one-nine! Keep it between the ditches.';
    let replyTenCode = '10-4';

    if (q.includes('radio check') || q.includes('how am i') || q.includes('audio')) {
      replyHandle = 'Silver Dollar';
      replyUnit = 'Kenworth W900L';
      replyText = 'Got you wall-to-wall and tree-top tall, driver! Audio is crisp and modulation is 100%.';
      replyTenCode = '10-2';
    } else if (q.includes('smokey') || q.includes('bear') || q.includes('cop') || q.includes('police')) {
      replyHandle = 'Night Owl';
      replyUnit = 'Peterbilt 389';
      replyText = 'Appreciate the bear report! Smokey was clocking westbound traffic at mile 149. Hammer back a notch.';
      replyTenCode = '10-4';
    } else if (q.includes('scale') || q.includes('coop') || q.includes('weigh')) {
      replyHandle = 'Diesel Boss';
      replyUnit = 'Volvo VNL 860';
      replyText = 'Scale house is open but rolling trucks across the bypass lane. PrePass green lights are active.';
      replyTenCode = '10-4';
    } else if (q.includes('parking') || q.includes('pilot') || q.includes('love') || q.includes('rest')) {
      replyHandle = 'Highway Knight';
      replyUnit = 'International LT';
      replyText = 'Pilot at exit 142 has about 12 open spots in the rear lot, filling up fast for the night!';
      replyTenCode = '10-77';
    } else if (q.includes('10-33') || q.includes('emergency') || q.includes('accident') || q.includes('breakdown')) {
      replyHandle = 'REACT Command 9';
      replyUnit = 'Emergency Assistance Net';
      replyText = 'Emergency traffic acknowledged. State highway service vehicle dispatched to your mile marker coordinates.';
      replyTenCode = '10-33';
    }

    setTimeout(() => {
      const replyMsg: CBRadioMessage = {
        id: `cb-reply-${Date.now()}`,
        channel: channel,
        senderHandle: replyHandle,
        senderUnit: replyUnit,
        role: channel === 9 ? 'DISPATCH' : 'DRIVER',
        text: replyText,
        timestamp: 'Just now',
        signalStrengthS: 8 + Math.floor(Math.random() * 2),
        distanceMiles: parseFloat((1.2 + Math.random() * 4.5).toFixed(1)),
        tenCode: replyTenCode,
        location: `I-80 Mile Marker ${140 + Math.floor(Math.random() * 15)}`,
        verified: true,
        audioDurationSec: 5,
      };

      setMessagesByChannel((prev) => ({
        ...prev,
        [channel]: [...(prev[channel] || []), replyMsg],
      }));

      // Speak reply if volume > 20
      if (volume > 20) {
        cbAudioEngine.speakIncomingMessage(replyText);
      }
    }, 3200);
  };

  // Render Oscilloscope & Spectrum Canvas
  useEffect(() => {
    const canvas = oscilloscopeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background grid lines (classic radar / scope phosphor grid)
      ctx.strokeStyle = displayTheme === 'AMBER' ? 'rgba(201, 168, 76, 0.15)' : 'rgba(52, 211, 153, 0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center crosshair
      ctx.strokeStyle = displayTheme === 'AMBER' ? 'rgba(201, 168, 76, 0.3)' : 'rgba(52, 211, 153, 0.3)';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const timeData = engineState.timeDomainData;
      const isTx = engineState.isTransmitting;
      const isRx = engineState.isReceiving;

      if (timeData && (isTx || isRx || squelch < 20)) {
        // Draw Waveform
        ctx.lineWidth = 2;
        ctx.strokeStyle = isTx
          ? '#ef4444'
          : displayTheme === 'AMBER'
          ? '#F59E0B'
          : displayTheme === 'EMERALD'
          ? '#10B981'
          : '#06B6D4';
        ctx.shadowBlur = 8;
        ctx.shadowColor = ctx.strokeStyle;

        ctx.beginPath();
        const sliceWidth = (width * 1.0) / timeData.length;
        let x = 0;

        for (let i = 0; i < timeData.length; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Flat baseline with tiny noise jitter
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = displayTheme === 'AMBER' ? '#786432' : '#047857';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        for (let x = 0; x < width; x += 10) {
          const jitter = (Math.random() - 0.5) * 2;
          ctx.lineTo(x, height / 2 + jitter);
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [engineState.timeDomainData, engineState.isTransmitting, engineState.isReceiving, displayTheme, squelch]);

  // Scroll messages to bottom on update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Color theme definitions for phosphor LCD
  const themeColors = {
    AMBER: {
      bg: 'bg-[#1a1202]',
      border: 'border-[#c9a84c]/50',
      text: 'text-[#f59e0b]',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
      displayBg: 'bg-[#0f0b02]',
      needle: '#f59e0b',
    },
    EMERALD: {
      bg: 'bg-[#02180d]',
      border: 'border-emerald-500/50',
      text: 'text-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',
      displayBg: 'bg-[#011008]',
      needle: '#10b981',
    },
    CYBER: {
      bg: 'bg-[#02131a]',
      border: 'border-cyan-500/50',
      text: 'text-cyan-400',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.25)]',
      displayBg: 'bg-[#010c12]',
      needle: '#06b6d4',
    },
    NIGHT: {
      bg: 'bg-[#140202]',
      border: 'border-red-600/50',
      text: 'text-red-500',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.25)]',
      displayBg: 'bg-[#0d0101]',
      needle: '#ef4444',
    },
  }[displayTheme];

  // S-Meter Needle Deflection Calculation (0 to 100 degrees)
  const meterDeflectionAngle = useMemo(() => {
    if (meterMode === 'S_RF') {
      const s = engineState.signalStrengthS || 0;
      // Map S0 (0) -> -45deg, S9 (9) -> 10deg, +30dB (12) -> 45deg
      const normalized = Math.min(12, Math.max(0, s)) / 12;
      return -45 + normalized * 90;
    } else if (meterMode === 'SWR') {
      const swr = engineState.swrRatio || 1.1;
      const normalized = Math.min(3.0, Math.max(1.0, swr)) / 3.0;
      return -45 + normalized * 90;
    } else {
      // Modulation %
      const mod = (engineState.audioModulationRms || 0) * 100;
      return -45 + (mod / 100) * 90;
    }
  }, [engineState.signalStrengthS, engineState.swrRatio, engineState.audioModulationRms, meterMode]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#121212] border border-[#262626] rounded-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-[#C9A84C]/10 to-transparent pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#C9A84C]/20 border border-[#C9A84C]/60 text-[#C9A84C] text-[10px] font-mono font-bold tracking-widest uppercase rounded">
              27 MHz FCC TRANSCEIVER
            </span>
            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold rounded flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              EARS ON • SIMULATED RF NET
            </span>
          </div>
          <h1 className="font-headline text-2xl md:text-3xl font-black text-white tracking-wide flex items-center gap-3">
            <span>COBRA &amp; TITAN CLASSIC CB RADIO</span>
          </h1>
          <p className="text-xs font-mono text-[#888]">
            Simulated 40-Channel Citizens Band Transceiver with live microphone DSP, analog S-meter, real-time voice speech recognition, and interactive highway trucker comms.
          </p>
        </div>

        {/* Quick Driver Handle Chip & Mic Auth */}
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <div className="p-3 bg-[#181818] border border-[#333] rounded-lg text-right font-mono">
            <span className="text-[9px] text-[#777] block uppercase">YOUR CB HANDLE</span>
            {isEditingHandle ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="text"
                  value={userHandle}
                  onChange={(e) => setUserHandle(e.target.value)}
                  className="px-2 py-0.5 bg-black border border-[#C9A84C] text-[#C9A84C] text-xs font-bold rounded focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setIsEditingHandle(false)}
                  className="px-2 py-0.5 bg-[#C9A84C] text-black text-[10px] font-bold rounded"
                >
                  SAVE
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingHandle(true)}
                className="text-xs font-black text-[#C9A84C] hover:underline flex items-center gap-1 ml-auto"
                title="Click to edit handle"
              >
                <span>{userHandle}</span>
                <Sliders className="w-3 h-3 text-[#777]" />
              </button>
            )}
          </div>

          {!isMicPermissionGranted ? (
            <button
              onClick={handleEnableMicrophone}
              className="px-4 py-3 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-mono font-bold uppercase rounded-lg flex items-center gap-2 transition-all shadow-lg animate-pulse"
            >
              <MicOff className="w-4 h-4 text-red-400" />
              <span>ENABLE MIC</span>
            </button>
          ) : (
            <div className="px-3.5 py-3 bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-xs font-mono font-bold uppercase rounded-lg flex items-center gap-2">
              <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>MIC CAPTURE LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#222] pb-1 overflow-x-auto">
        {[
          { id: 'TRANSCEIVER', label: '1. CB Transceiver Console', badge: `CH ${currentChannelNum}` },
          { id: 'SPECTRUM_WATERFALL', label: '2. 40-Channel Spectrum Waterfall', badge: '26.965 – 27.405 MHz' },
          { id: 'TEN_CODES', label: '3. 10-Code Soundboard & Transmit', badge: `${TEN_CODES.length} CODES` },
          { id: 'SLANG', label: '4. Trucker Slang & Radio Etiquette', badge: 'GLOSSARY' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              triggerHapticFeedback('tick');
            }}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 shrink-0 flex items-center gap-2 rounded-t ${
              activeTab === tab.id
                ? 'border-[#C9A84C] text-[#C9A84C] bg-[#181818]'
                : 'border-transparent text-[#777] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase border border-[#333] bg-[#0d0d0d] text-[#AAA] rounded">
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: CLASSIC CB RADIO TRANSCEIVER CONSOLE                              */}
      {/* ========================================================================= */}
      {activeTab === 'TRANSCEIVER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Metallic CB Chassis (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 md:p-8 bg-gradient-to-b from-[#1F1F1F] via-[#141414] to-[#0D0D0D] border-4 border-[#333] rounded-2xl shadow-2xl relative">
              {/* Corner Screw Rivets for authentic chassis look */}
              <div className="absolute top-2.5 left-2.5 w-3 h-3 rounded-full bg-gradient-to-tr from-[#222] to-[#777] border border-[#111] shadow-inner flex items-center justify-center">
                <div className="w-1.5 h-0.5 bg-[#111]" />
              </div>
              <div className="absolute top-2.5 right-2.5 w-3 h-3 rounded-full bg-gradient-to-tr from-[#222] to-[#777] border border-[#111] shadow-inner flex items-center justify-center">
                <div className="w-1.5 h-0.5 bg-[#111]" />
              </div>
              <div className="absolute bottom-2.5 left-2.5 w-3 h-3 rounded-full bg-gradient-to-tr from-[#222] to-[#777] border border-[#111] shadow-inner flex items-center justify-center">
                <div className="w-1.5 h-0.5 bg-[#111]" />
              </div>
              <div className="absolute bottom-2.5 right-2.5 w-3 h-3 rounded-full bg-gradient-to-tr from-[#222] to-[#777] border border-[#111] shadow-inner flex items-center justify-center">
                <div className="w-1.5 h-0.5 bg-[#111]" />
              </div>

              {/* Brushed Chrome Brand Badge */}
              <div className="flex items-center justify-between border-b-2 border-[#2b2b2b] pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-gradient-to-r from-[#C9A84C] to-[#E5C368] text-black font-black font-headline text-lg tracking-widest rounded shadow">
                    TRUCKWITHEASE 29-LTD
                  </div>
                  <span className="text-[11px] font-mono text-[#777] uppercase tracking-wider hidden sm:inline">
                    HEAVY DUTY PROFESSIONAL 40-CH TRANSCEIVER
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#666]">THEME:</span>
                  {(['AMBER', 'EMERALD', 'CYBER', 'NIGHT'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setDisplayTheme(t);
                        triggerHapticFeedback('tick');
                      }}
                      className={`w-4 h-4 rounded-full border transition-all ${
                        displayTheme === t ? 'scale-125 border-white ring-2 ring-white/30' : 'border-[#444] opacity-60'
                      } ${
                        t === 'AMBER'
                          ? 'bg-amber-500'
                          : t === 'EMERALD'
                          ? 'bg-emerald-500'
                          : t === 'CYBER'
                          ? 'bg-cyan-400'
                          : 'bg-red-600'
                      }`}
                      title={`${t} Display Theme`}
                    />
                  ))}
                </div>
              </div>

              {/* Dual Upper Panels: Analog S-Meter (Left) & Phosphor Digital Channel Screen (Right) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* 1. ANALOG S/RF / SWR NEEDLE METER */}
                <div className={`p-4 ${themeColors.displayBg} border-2 ${themeColors.border} rounded-xl relative overflow-hidden shadow-inner flex flex-col justify-between`}>
                  <div className="flex items-center justify-between border-b border-white/10 pb-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#888]">
                      SIGNAL / POWER / SWR METER
                    </span>
                    <div className="flex items-center gap-1">
                      {(['S_RF', 'SWR', 'MOD'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            setMeterMode(m);
                            triggerHapticFeedback('tick');
                          }}
                          className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${
                            meterMode === m ? 'bg-[#C9A84C] text-black font-black' : 'text-[#777] hover:text-white'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Analog Meter Dial Face */}
                  <div className="relative h-28 my-2 flex items-center justify-center overflow-hidden">
                    {/* Scale Arcs */}
                    <svg viewBox="0 0 200 100" className="w-full h-full">
                      {/* Green Signal Scale Arc */}
                      <path
                        d="M 20 90 A 80 80 0 0 1 120 18"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                        strokeDasharray="2, 2"
                      />
                      {/* Red +dB Scale Arc */}
                      <path
                        d="M 120 18 A 80 80 0 0 1 180 90"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="4"
                      />
                      {/* Meter Tick Labels */}
                      <text x="25" y="85" fill="#10B981" fontSize="7" fontFamily="monospace">S1</text>
                      <text x="50" y="55" fill="#10B981" fontSize="7" fontFamily="monospace">S5</text>
                      <text x="85" y="30" fill="#10B981" fontSize="7" fontFamily="monospace">S7</text>
                      <text x="115" y="24" fill="#10B981" fontSize="8" fontWeight="bold" fontFamily="monospace">S9</text>
                      <text x="145" y="35" fill="#EF4444" fontSize="7" fontFamily="monospace">+10</text>
                      <text x="165" y="55" fill="#EF4444" fontSize="7" fontFamily="monospace">+30dB</text>
                      <text x="100" y="75" fill="#888" fontSize="7" textAnchor="middle" fontFamily="monospace">
                        {meterMode === 'S_RF' ? 'SIGNAL STRENGTH (S) / RF PEP (W)' : meterMode === 'SWR' ? 'SWR 1:1 TO 3:1' : 'MODULATION 0–100%'}
                      </text>

                      {/* Needle Pivot & Arm */}
                      <g
                        style={{
                          transform: `rotate(${meterDeflectionAngle}deg)`,
                          transformOrigin: '100px 95px',
                          transition: 'transform 0.08s ease-out',
                        }}
                      >
                        <line x1="100" y1="95" x2="100" y2="15" stroke={themeColors.needle} strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="100" y1="95" x2="100" y2="15" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
                      </g>
                      <circle cx="100" cy="95" r="7" fill="#222" stroke="#666" strokeWidth="2" />
                    </svg>
                  </div>

                  {/* Digital Readout Strip Under Needle */}
                  <div className="flex justify-between items-center text-[10px] font-mono border-t border-white/10 pt-1 text-[#AAA]">
                    <span>SIGNAL: <b className="text-white">S-{Math.min(9, Math.floor(engineState.signalStrengthS || 0))}</b></span>
                    <span>SWR: <b className="text-emerald-400">{engineState.swrRatio}:1</b></span>
                    <span>MOD: <b className="text-[#C9A84C]">{Math.round((engineState.audioModulationRms || 0) * 100)}%</b></span>
                  </div>
                </div>

                {/* 2. GLOWING 7-SEGMENT PHOSPHOR CHANNEL SCREEN & OSCILLOSCOPE */}
                <div className={`p-4 ${themeColors.displayBg} border-2 ${themeColors.border} rounded-xl relative overflow-hidden shadow-inner flex flex-col justify-between ${themeColors.glow}`}>
                  {/* Top Status LED Indicators */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <div className="flex items-center gap-3">
                      {/* TX Indicator */}
                      <div className="flex items-center gap-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${engineState.isTransmitting ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse' : 'bg-[#331111]'}`} />
                        <span className={`text-[9px] font-mono font-black ${engineState.isTransmitting ? 'text-red-400' : 'text-[#555]'}`}>TX</span>
                      </div>

                      {/* RX Indicator */}
                      <div className="flex items-center gap-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${engineState.isReceiving ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse' : 'bg-[#112b1c]'}`} />
                        <span className={`text-[9px] font-mono font-black ${engineState.isReceiving ? 'text-emerald-400' : 'text-[#555]'}`}>RX</span>
                      </div>

                      {/* NB (Noise Blanker) */}
                      <span className={`text-[9px] font-mono font-bold ${noiseBlanker ? 'text-[#C9A84C]' : 'text-[#444]'}`}>NB</span>

                      {/* ROGER BEEP */}
                      <span className={`text-[9px] font-mono font-bold ${rogerBeep ? 'text-emerald-400' : 'text-[#444]'}`}>ROGER</span>
                    </div>

                    <div className="text-[10px] font-mono font-bold text-white bg-black/60 px-2 py-0.5 rounded border border-white/10">
                      {radioMode} • {currentChannel.designation.slice(0, 18)}
                    </div>
                  </div>

                  {/* Big 7-Segment LED Channel & Frequency Readout */}
                  <div className="grid grid-cols-2 gap-2 my-2 items-center">
                    <div className="text-center bg-black/80 p-2 rounded border border-white/5">
                      <span className="text-[9px] font-mono text-[#888] uppercase block">CHANNEL</span>
                      <span className={`font-mono text-5xl font-black ${themeColors.text} tracking-tighter drop-shadow-[0_0_12px_currentColor]`}>
                        {currentChannelNum.toString().padStart(2, '0')}
                      </span>
                    </div>

                    <div className="text-center bg-black/80 p-2 rounded border border-white/5 space-y-1">
                      <span className="text-[9px] font-mono text-[#888] uppercase block">FREQUENCY</span>
                      <span className={`font-mono text-lg font-black text-white block tracking-wider`}>
                        {currentChannel.frequencyMhz.toFixed(3)} <span className="text-xs text-[#888]">MHz</span>
                      </span>
                      <span className="text-[9px] font-mono text-emerald-400 block">
                        ANT: 50Ω TUNED
                      </span>
                    </div>
                  </div>

                  {/* Realtime Oscilloscope Waveform Display */}
                  <div className="relative h-14 bg-black/90 border border-white/10 rounded overflow-hidden">
                    <canvas
                      ref={oscilloscopeCanvasRef}
                      width={320}
                      height={60}
                      className="w-full h-full block"
                    />
                    <div className="absolute bottom-1 right-2 text-[8px] font-mono text-[#777] uppercase pointer-events-none">
                      27MHz DSP MODULATION SCOPE
                    </div>
                  </div>
                </div>
              </div>

              {/* Hardware Dials & Rocker Controls Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 p-4 bg-[#0A0A0A] border-2 border-[#262626] rounded-xl">
                {/* 1. CHANNEL SELECTOR ROTARY */}
                <div className="text-center space-y-1.5">
                  <span className="text-[10px] font-mono text-[#888] uppercase font-bold block">CHANNEL</span>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleTuneChannel(currentChannelNum === 1 ? 40 : currentChannelNum - 1)}
                      className="w-7 h-7 bg-[#1C1C1C] hover:bg-[#2C2C2C] active:bg-[#C9A84C] active:text-black border border-[#444] text-white font-mono font-bold text-xs rounded transition-all"
                    >
                      -
                    </button>
                    <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#3A3A3A] to-[#1A1A1A] border-2 border-[#555] shadow-lg flex items-center justify-center font-mono font-black text-sm text-[#C9A84C]">
                      {currentChannelNum}
                    </div>
                    <button
                      onClick={() => handleTuneChannel(currentChannelNum === 40 ? 1 : currentChannelNum + 1)}
                      className="w-7 h-7 bg-[#1C1C1C] hover:bg-[#2C2C2C] active:bg-[#C9A84C] active:text-black border border-[#444] text-white font-mono font-bold text-xs rounded transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 2. SQUELCH (SQL) ROTARY */}
                <div className="text-center space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-mono text-[#888] uppercase font-bold">SQUELCH</span>
                    <span className="text-[9px] font-mono text-[#C9A84C]">{squelch}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={squelch}
                    onChange={(e) => setSquelch(Number(e.target.value))}
                    className="w-full accent-[#C9A84C] cursor-pointer"
                  />
                  <div className="text-[8px] font-mono text-[#666] flex justify-between">
                    <span>OPEN (NOISE)</span>
                    <span>TIGHT</span>
                  </div>
                </div>

                {/* 3. VOLUME ROTARY */}
                <div className="text-center space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-mono text-[#888] uppercase font-bold">VOLUME</span>
                    <span className="text-[9px] font-mono text-[#C9A84C]">{volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full accent-[#C9A84C] cursor-pointer"
                  />
                  <div className="text-[8px] font-mono text-[#666] flex justify-between">
                    <span>MIN</span>
                    <span>MAX</span>
                  </div>
                </div>

                {/* 4. MIC GAIN (DYNAMIKE) */}
                <div className="text-center space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-mono text-[#888] uppercase font-bold">MIC GAIN</span>
                    <span className="text-[9px] font-mono text-[#C9A84C]">{micGain}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={micGain}
                    onChange={(e) => setMicGain(Number(e.target.value))}
                    className="w-full accent-[#C9A84C] cursor-pointer"
                  />
                  <div className="text-[8px] font-mono text-[#666] flex justify-between">
                    <span>LOW</span>
                    <span>HIGH</span>
                  </div>
                </div>

                {/* 5. RF GAIN */}
                <div className="text-center space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-mono text-[#888] uppercase font-bold">RF GAIN</span>
                    <span className="text-[9px] font-mono text-[#C9A84C]">{rfGain}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={rfGain}
                    onChange={(e) => setRfGain(Number(e.target.value))}
                    className="w-full accent-[#C9A84C] cursor-pointer"
                  />
                  <div className="text-[8px] font-mono text-[#666] flex justify-between">
                    <span>LOCAL</span>
                    <span>DX</span>
                  </div>
                </div>

                {/* 6. ROGER BEEP & NOISE BLANKER TOGGLES */}
                <div className="text-center space-y-2 flex flex-col justify-center">
                  <div className="flex items-center justify-around gap-2">
                    {/* Roger Beep */}
                    <button
                      onClick={() => {
                        setRogerBeep(!rogerBeep);
                        cbAudioEngine.toggleRogerBeep();
                        triggerHapticFeedback('tick');
                      }}
                      className={`px-2 py-1 text-[9px] font-mono font-bold uppercase rounded border transition-all ${
                        rogerBeep ? 'bg-[#C9A84C] text-black border-[#C9A84C]' : 'bg-[#181818] text-[#777] border-[#333]'
                      }`}
                      title="Roger Beep"
                    >
                      ROGER {rogerBeep ? 'ON' : 'OFF'}
                    </button>

                    {/* NB/ANL */}
                    <button
                      onClick={() => {
                        setNoiseBlanker(!noiseBlanker);
                        cbAudioEngine.toggleNoiseBlanker();
                        triggerHapticFeedback('tick');
                      }}
                      className={`px-2 py-1 text-[9px] font-mono font-bold uppercase rounded border transition-all ${
                        noiseBlanker ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-[#181818] text-[#777] border-[#333]'
                      }`}
                      title="Noise Blanker / Auto Noise Limiter"
                    >
                      NB/ANL
                    </button>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center justify-center gap-1">
                    {(['AM', 'USB', 'LSB', 'FM'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setRadioMode(m);
                          triggerHapticFeedback('tick');
                        }}
                        className={`px-1.5 py-0.5 text-[8px] font-mono rounded ${
                          radioMode === m ? 'bg-white text-black font-black' : 'text-[#666] hover:text-white'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Highway Preset Buttons Quick-Bar */}
              <div className="mt-4 pt-4 border-t border-[#222] flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] font-mono text-[#777] uppercase font-bold">
                  NATIONAL PRESETS:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { ch: 19, label: 'CH 19 • HIGHWAY', color: 'bg-[#C9A84C] text-black font-black' },
                    { ch: 9, label: 'CH 9 • EMERGENCY 911', color: 'bg-red-600 text-white font-black' },
                    { ch: 17, label: 'CH 17 • INTERSTATE N/S', color: 'bg-orange-600 text-white font-black' },
                    { ch: 11, label: 'CH 11 • LOUNGE & CHAT', color: 'bg-emerald-600 text-white font-black' },
                    { ch: 6, label: 'CH 6 • SUPER BOWL DX', color: 'bg-purple-600 text-white font-black' },
                  ].map((p) => (
                    <button
                      key={p.ch}
                      onClick={() => handleTuneChannel(p.ch)}
                      className={`px-3 py-1 text-[10px] font-mono rounded uppercase transition-all shadow ${
                        currentChannelNum === p.ch
                          ? `${p.color} ring-2 ring-white/50 scale-105`
                          : 'bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-[#AAA]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PUSH-TO-TALK HEAVY DUTY MICROPHONE UNIT */}
            <div className="p-6 bg-[#161616] border-2 border-[#2B2B2B] rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Coiled Cord & Mic Head Visual */}
              <div className="flex items-center gap-4">
                {/* 4-Pin CB Microphone Head Graphic */}
                <div className="w-20 h-28 bg-gradient-to-b from-[#2A2A2A] via-[#1F1F1F] to-[#121212] border-2 border-[#444] rounded-2xl p-2 shadow-2xl flex flex-col items-center justify-between relative">
                  {/* Chrome Mic Grill */}
                  <div className="w-14 h-12 bg-gradient-to-b from-[#555] to-[#222] border border-[#666] rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden">
                    <div className="grid grid-cols-4 gap-1 w-10 h-8 opacity-40">
                      {Array.from({ length: 12 }).map((_, idx) => (
                        <div key={idx} className="w-1.5 h-1.5 bg-black rounded-full" />
                      ))}
                    </div>
                    {engineState.isTransmitting && (
                      <div className="absolute inset-0 bg-red-600/30 animate-pulse" />
                    )}
                  </div>

                  <span className="text-[8px] font-mono text-[#C9A84C] font-bold uppercase">
                    TITAN D-104
                  </span>

                  {/* Coiled Cord Connector Stub */}
                  <div className="w-6 h-3 bg-[#111] border border-[#333] rounded-b" />
                </div>

                <div className="space-y-1 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white uppercase">
                      HEAVY-DUTY PTT MICROPHONE
                    </span>
                    {engineState.isTransmitting ? (
                      <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded animate-pulse">
                        TRANSMITTING ON AIR
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-[#222] text-[#888] text-[9px] rounded">
                        STANDBY (RX)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#888]">
                    Hold button to capture voice input via device mic. Transmissions are speech-recognized and broadcast over the RF channel.
                  </p>
                  {/* Interim Realtime Transcript */}
                  {(interimVoiceText || liveTranscript) && (
                    <div className="p-2 bg-black/80 border border-[#C9A84C]/50 rounded text-xs text-[#C9A84C] flex items-center gap-2 animate-in fade-in">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#C9A84C]" />
                      <span className="italic font-sans">
                        "{interimVoiceText || liveTranscript}"
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* PTT Action Trigger Controls */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Hold to Talk Trigger */}
                <button
                  onMouseDown={handleStartPtt}
                  onMouseUp={handleStopPtt}
                  onTouchStart={handleStartPtt}
                  onTouchEnd={handleStopPtt}
                  className={`px-8 py-5 rounded-xl font-headline text-lg font-black uppercase tracking-wider transition-all flex items-center gap-3 shadow-2xl select-none ${
                    isPttHeld
                      ? 'bg-red-600 text-white ring-4 ring-red-400 scale-95 shadow-[0_0_30px_#ef4444]'
                      : 'bg-gradient-to-b from-[#C9A84C] to-[#9C7F31] hover:from-[#DFBF5C] hover:to-[#B3933C] text-black active:scale-95'
                  }`}
                >
                  <Mic className={`w-6 h-6 ${isPttHeld ? 'animate-bounce' : ''}`} />
                  <span>{isPttHeld ? 'TRANSMITTING...' : 'PRESS & HOLD PTT'}</span>
                </button>

                {/* Lock PTT Toggle */}
                <button
                  onClick={handleTogglePttLock}
                  className={`p-4 border rounded-xl font-mono text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 ${
                    isPttLocked
                      ? 'bg-red-950 border-red-500 text-red-300 ring-2 ring-red-500'
                      : 'bg-[#1E1E1E] border-[#333] text-[#AAA] hover:text-white'
                  }`}
                  title="Latch / Lock Mic for hands-free transmission"
                >
                  {isPttLocked ? <Lock className="w-5 h-5 text-red-400" /> : <Unlock className="w-5 h-5" />}
                  <span className="text-[9px]">{isPttLocked ? 'LATCHED' : 'LOCK MIC'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (4 Cols): Live Channel Chatter & Message Dispatch Feed */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 bg-[#141414] border-2 border-[#262626] rounded-xl flex flex-col h-[740px]">
              {/* Chatter Header */}
              <div className="flex items-center justify-between border-b border-[#262626] pb-3 mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <RadioTower className="w-4 h-4 text-[#C9A84C]" />
                  <div>
                    <h3 className="font-headline text-sm font-black text-white uppercase">
                      CHANNEL {currentChannelNum} CHATTER LOG
                    </h3>
                    <span className="text-[10px] font-mono text-[#888]">
                      {currentChannel.name} • {currentMessages.length} transmissions
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    triggerHapticFeedback('tick');
                    cbAudioEngine.playSquelchTail(180);
                  }}
                  className="p-1.5 bg-[#1C1C1C] hover:bg-[#252525] border border-[#333] text-[#AAA] hover:text-white rounded"
                  title="Refresh Channel Squelch"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Scrollable Message Transmissions Stream */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs font-mono">
                {currentMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[#666] space-y-2 p-6">
                    <Radio className="w-8 h-8 opacity-30" />
                    <p>Channel {currentChannelNum} is currently clear. Press PTT or type a message below to break the channel!</p>
                  </div>
                ) : (
                  currentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-lg border transition-all ${
                        msg.role === 'USER'
                          ? 'bg-[#1F1905] border-[#C9A84C]/40 text-[#E5D298] ml-2'
                          : msg.role === 'DISPATCH' || msg.channel === 9
                          ? 'bg-red-950/40 border-red-800/60 text-red-200'
                          : 'bg-[#181818] border-[#2A2A2A] text-[#D4D4D4]'
                      }`}
                    >
                      {/* Message Metadata Header */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-2 text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white uppercase">
                            {msg.senderHandle}
                          </span>
                          {msg.senderUnit && (
                            <span className="text-[#777] hidden sm:inline">
                              [{msg.senderUnit}]
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {msg.tenCode && (
                            <span className="px-1.5 py-0.2 bg-[#C9A84C] text-black font-black text-[9px] rounded">
                              {msg.tenCode}
                            </span>
                          )}
                          <span className="text-[#666]">{msg.timestamp}</span>
                        </div>
                      </div>

                      {/* Message Body */}
                      <p className="text-xs leading-relaxed font-sans text-white/90">
                        "{msg.text}"
                      </p>

                      {/* Transmission Audio Metric Footer */}
                      <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[9px] text-[#777]">
                        <div className="flex items-center gap-2">
                          <span>SIG: <b className="text-emerald-400">S-{msg.signalStrengthS}</b></span>
                          {msg.distanceMiles !== undefined && (
                            <span>DIST: <b className="text-white">{msg.distanceMiles} mi</b></span>
                          )}
                        </div>
                        {msg.role !== 'USER' && (
                          <button
                            onClick={() => {
                              triggerHapticFeedback('tick');
                              cbAudioEngine.speakIncomingMessage(msg.text);
                            }}
                            className="text-[#C9A84C] hover:underline flex items-center gap-1 font-bold"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>REPLAY VOICE</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Text Input Transmission Composer */}
              <div className="mt-3 pt-3 border-t border-[#262626] shrink-0 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={textInputMessage}
                    onChange={(e) => setTextInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        broadcastMessage(textInputMessage);
                      }
                    }}
                    placeholder={`Transmit text message on CH ${currentChannelNum}...`}
                    className="flex-1 px-3 py-2 bg-[#0A0A0A] border border-[#333] text-white text-xs font-mono rounded focus:border-[#C9A84C] focus:outline-none"
                  />
                  <button
                    onClick={() => broadcastMessage(textInputMessage)}
                    disabled={!textInputMessage.trim()}
                    className="px-3 py-2 bg-[#C9A84C] hover:bg-white disabled:opacity-40 text-black font-black font-mono text-xs uppercase rounded transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>OVER</span>
                  </button>
                </div>

                {/* Quick 10-Code Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[9px] font-mono text-[#888]">
                  <span>QUICK:</span>
                  {['10-4 Copy', '10-20 Location', '10-33 Emergency', 'Radio Check'].map((quick) => (
                    <button
                      key={quick}
                      onClick={() => broadcastMessage(quick)}
                      className="px-2 py-1 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-[#AAA] hover:text-white rounded shrink-0"
                    >
                      {quick}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: 40-CHANNEL SPECTRUM WATERFALL                                      */}
      {/* ========================================================================= */}
      {activeTab === 'SPECTRUM_WATERFALL' && (
        <div className="space-y-6">
          <div className="p-6 bg-[#141414] border border-[#262626] rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222] pb-4">
              <div>
                <h3 className="font-headline text-lg font-black text-white uppercase flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#C9A84C]" />
                  <span>FCC 27 MHz CITIZENS BAND SPECTRUM SCANNER (CH 1–40)</span>
                </h3>
                <p className="text-xs font-mono text-[#888]">
                  Live carrier signal density, frequency allocations, and real-time channel occupancy. Click any channel block to tune the transceiver instantly.
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-[#666]">TUNED:</span>
                <span className="px-3 py-1 bg-[#C9A84C] text-black font-black rounded">
                  CH {currentChannelNum} ({currentChannel.frequencyMhz.toFixed(3)} MHz)
                </span>
              </div>
            </div>

            {/* 40 Channel Grid Waterfall */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {CB_CHANNELS.map((ch) => {
                const isSelected = ch.channel === currentChannelNum;
                const msgCount = (messagesByChannel[ch.channel] || []).length;
                return (
                  <button
                    key={ch.channel}
                    onClick={() => handleTuneChannel(ch.channel)}
                    className={`p-3.5 rounded-lg border text-left transition-all relative overflow-hidden flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-[#1F1905] border-[#C9A84C] ring-2 ring-[#C9A84C]/50 scale-102 shadow-xl'
                        : 'bg-[#181818] hover:bg-[#202020] border-[#2A2A2A]'
                    }`}
                  >
                    {/* Top strip */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-base font-black ${
                          isSelected ? 'text-[#C9A84C]' : 'text-white'
                        }`}
                      >
                        CH {ch.channel}
                      </span>
                      <span className="text-[10px] font-mono text-[#888]">
                        {ch.frequencyMhz.toFixed(3)} MHz
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-white block truncate">
                        {ch.designation}
                      </span>
                      <p className="text-[10px] font-mono text-[#777] line-clamp-2 mt-0.5">
                        {ch.description}
                      </p>
                    </div>

                    {/* Bottom Status & Traffic Bar */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono">
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                          ch.isEmergency
                            ? 'bg-red-950 text-red-400 border border-red-700'
                            : ch.isHighwayPrimary
                            ? 'bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/50'
                            : 'bg-[#222] text-[#AAA]'
                        }`}
                      >
                        {ch.trafficLevel}
                      </span>
                      <span className="text-[#666]">
                        {msgCount} log(s)
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: 10-CODE SOUNDBOARD & TRANSMIT                                     */}
      {/* ========================================================================= */}
      {activeTab === 'TEN_CODES' && (
        <div className="space-y-6">
          <div className="p-6 bg-[#141414] border border-[#262626] rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222] pb-4">
              <div>
                <h3 className="font-headline text-lg font-black text-white uppercase flex items-center gap-2">
                  <Hash className="w-5 h-5 text-[#C9A84C]" />
                  <span>OFFICIAL CB 10-CODE SOUNDBOARD &amp; INSTANT TRANSMIT</span>
                </h3>
                <p className="text-xs font-mono text-[#888]">
                  Standard APCO &amp; Interstate 10-codes. Click any code card to broadcast it directly over Channel {currentChannelNum} with synthetic RF audio.
                </p>
              </div>
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={tenCodeSearch}
                  onChange={(e) => setTenCodeSearch(e.target.value)}
                  placeholder="Search 10-codes..."
                  className="w-full px-3 py-1.5 bg-black border border-[#333] text-white text-xs font-mono rounded focus:border-[#C9A84C] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEN_CODES.filter(
                (c) =>
                  c.code.toLowerCase().includes(tenCodeSearch.toLowerCase()) ||
                  c.meaning.toLowerCase().includes(tenCodeSearch.toLowerCase())
              ).map((item) => (
                <div
                  key={item.code}
                  className="p-4 bg-[#181818] border border-[#262626] hover:border-[#C9A84C]/60 rounded-lg space-y-3 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xl font-black text-[#C9A84C]">
                        {item.code}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded ${
                          item.category === 'EMERGENCY'
                            ? 'bg-red-950 text-red-400 border border-red-700'
                            : 'bg-[#222] text-[#AAA]'
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      {item.meaning}
                    </h4>
                    <p className="text-xs font-mono text-[#888] italic">
                      "{item.example}"
                    </p>
                  </div>

                  <button
                    onClick={() => broadcastMessage(`${item.code} • ${item.meaning}`, false, item.code)}
                    className="w-full py-2 bg-[#222] hover:bg-[#C9A84C] text-[#AAA] hover:text-black font-mono font-bold text-xs uppercase rounded transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>BROADCAST {item.code} ON CH {currentChannelNum}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: TRUCKER SLANG & RADIO ETIQUETTE GLOSSARY                          */}
      {/* ========================================================================= */}
      {activeTab === 'SLANG' && (
        <div className="space-y-6">
          <div className="p-6 bg-[#141414] border border-[#262626] rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222] pb-4">
              <div>
                <h3 className="font-headline text-lg font-black text-white uppercase flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#C9A84C]" />
                  <span>TRUCKER CB SLANG &amp; RADIO PROTOCOL GLOSSARY</span>
                </h3>
                <p className="text-xs font-mono text-[#888]">
                  Classic open-highway vocabulary and etiquette guidelines for clear interstate communication.
                </p>
              </div>
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={slangSearch}
                  onChange={(e) => setSlangSearch(e.target.value)}
                  placeholder="Search slang terms..."
                  className="w-full px-3 py-1.5 bg-black border border-[#333] text-white text-xs font-mono rounded focus:border-[#C9A84C] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TRUCKER_SLANG_GLOSSARY.filter(
                (s) =>
                  s.term.toLowerCase().includes(slangSearch.toLowerCase()) ||
                  s.definition.toLowerCase().includes(slangSearch.toLowerCase())
              ).map((item) => (
                <div
                  key={item.term}
                  className="p-4 bg-[#181818] border border-[#262626] rounded-lg space-y-2"
                >
                  <span className="font-headline text-base font-black text-[#C9A84C] uppercase block">
                    {item.term}
                  </span>
                  <p className="text-xs text-[#CCC] leading-relaxed">
                    {item.definition}
                  </p>
                </div>
              ))}
            </div>

            {/* Protocol Rules */}
            <div className="p-4 bg-[#0A0A0A] border border-[#222] rounded-lg space-y-2 font-mono text-xs">
              <h4 className="font-bold text-[#C9A84C] uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>ESSENTIAL FCC 47 CFR PART 95 CB ETIQUETTE RULES</span>
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-[#AAA]">
                <li><b>Channel 9 is Emergency Only:</b> Strictly reserved for emergency assistance, accidents, and immediate severe weather.</li>
                <li><b>Channel 19 is National Trucker Highway:</b> Used for speed trap alerts, road hazards, weigh stations, and convoy travel.</li>
                <li><b>No Continuous Keying / Stepping:</b> Always release the PTT button to allow other operators to break into the conversation.</li>
                <li><b>Use Handles &amp; 10-Codes:</b> Keep transmissions concise and professional for rapid communication over highway noise.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
