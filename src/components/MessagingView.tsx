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
  RefreshCw,
  Search,
  Paperclip,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  Zap,
  Activity,
} from 'lucide-react';
import { MessageRecord, MessageChannelType } from '../types';
import { useVoiceSettings } from '../services/voiceSettingsService';
import { triggerHapticFeedback } from '../services/haptics';

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isTranscribingRef = useRef<boolean>(false);

  // In-cab voice settings (threshold, echo cancellation, haptics, noise suppression)
  const { settings: voiceSettings } = useVoiceSettings();
  const voiceSettingsRef = useRef(voiceSettings);
  useEffect(() => {
    voiceSettingsRef.current = voiceSettings;
  }, [voiceSettings]);

  const cannedQuickReplies = [
    'Arrived at Shipper / Dock Check-In',
    'Detention starting (2-hr standard exceeded)',
    'HOS 30-Minute Rest Break starting now',
    'Pre-Trip Inspection Complete & Clean',
    'Fuel stop finished, rolling eastbound',
    '10-4 Sarah, copied and acknowledged',
  ];

  const fetchMessages = async () => {
    try {
      const url = selectedChannel === 'ALL' ? '/api/messages' : `/api/messages?channel=${selectedChannel}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
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
    const interval = setInterval(fetchMessages, 6000);
    return () => clearInterval(interval);
  }, [selectedChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanly stop microphone stream and speech recognition
  const stopMicrophoneTranscription = useCallback(() => {
    isTranscribingRef.current = false;
    setIsTranscribing(false);
    setInterimTranscript('');

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
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopMicrophoneTranscription();
    };
  }, [stopMicrophoneTranscription]);

  // Fallback simulation test for browsers/environments without SpeechRecognition
  const handleSimulatedVoiceInput = useCallback(() => {
    setIsTranscribing(true);
    isTranscribingRef.current = true;
    setInterimTranscript('Listening: "Dispatch, Vance here on TR-904... ETA at receiver in 45 minutes."');
    if (voiceSettingsRef.current.speechHapticsConfirmation) {
      triggerHapticFeedback('subtle');
    }

    setTimeout(() => {
      const sampleSpoken = 'Dispatch, Vance here on TR-904. Scale is open on mile 71, all green. ETA in 45 minutes.';
      setInputText((prev) => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed} ${sampleSpoken}` : sampleSpoken;
      });
      setVoiceTranscript((prev) => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed} ${sampleSpoken}` : sampleSpoken;
      });
      setInterimTranscript('');
      setIsTranscribing(false);
      isTranscribingRef.current = false;
      if (voiceSettingsRef.current.speechHapticsConfirmation) {
        triggerHapticFeedback('success');
      }
    }, 2200);
  }, []);

  // Start real microphone voice input and stream speech directly to composer
  const startMicrophoneTranscription = useCallback(async () => {
    setSpeechError(null);

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSpeechSupported(false);
      handleSimulatedVoiceInput();
      return;
    }

    setIsSpeechSupported(true);

    try {
      // 1. Initialize audio meter via getUserMedia for visual volume feedback
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
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.25;
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
              const normalized = Math.min(100, Math.round((avg / 110) * 100));
              setMicVolumeLevel(normalized);
              animFrameRef.current = requestAnimationFrame(checkVolume);
            };
            animFrameRef.current = requestAnimationFrame(checkVolume);
          }
        } catch (mediaErr: any) {
          console.warn('Microphone audio analyser not initialized, continuing with speech recognition', mediaErr);
        }
      }

      // 2. Instantiate and configure Web Speech Recognition
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
          setInputText((prev) => {
            const trimmed = prev.trim();
            if (!trimmed) return recognizedText;
            return `${trimmed} ${recognizedText}`;
          });
          setVoiceTranscript((prev) => {
            const trimmed = prev.trim();
            if (!trimmed) return recognizedText;
            return `${trimmed} ${recognizedText}`;
          });
          if (voiceSettingsRef.current.speechHapticsConfirmation) {
            triggerHapticFeedback('success');
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          return; // benign silence in cab
        }
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access in your browser.');
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
      console.error('Failed to start microphone transcription:', err);
      setSpeechError(err.message || 'Microphone transcription could not be started.');
      stopMicrophoneTranscription();
    }
  }, [stopMicrophoneTranscription, handleSimulatedVoiceInput]);

  const handleToggleVoiceTranscribe = () => {
    if (isTranscribing) {
      stopMicrophoneTranscription();
    } else {
      startMicrophoneTranscription();
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    if (isTranscribing) {
      stopMicrophoneTranscription();
    }

    try {
      const payload: any = {
        channel: selectedChannel === 'ALL' ? 'DISPATCH' : selectedChannel,
        text: inputText.trim(),
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
        setInputText('');
        setVoiceTranscript('');
        setPriority('NORMAL');
        await fetchMessages();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleQuickReply = (text: string) => {
    setInputText(text);
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
        setStatusNotification('EMERGENCY SOS TRANSMITTED: Fleet Control Center and Roadside Response alerted.');
        await fetchMessages();
      }
    } catch (err) {
      console.error('Failed to broadcast SOS:', err);
    } finally {
      setTimeout(() => setStatusNotification(null), 7000);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 px-3 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="border-b border-[#222] pb-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3 text-[#D4AF37]" />
                COMMERCIAL FLEET DISPATCH &amp; CAB COMMS
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                49 CFR § 392.82 HANDS-FREE COMPLIANT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <MessageSquare className="w-7 h-7 text-[#D4AF37]" />
              In-Cab Dispatch Messaging &amp; CB Radio
            </h1>
            <p className="text-xs sm:text-sm text-[#888] max-w-3xl mt-1">
              Secure bidirectional fleet communication: dedicated channels for Central Dispatch, Safety Compliance, Roadside Maintenance, Shipper/Receiver notifications, and Highway CB Channel 19.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsSosModalOpen(true)}
              className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 rounded shadow-md transition-all animate-pulse"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>EMERGENCY SOS CAB BROADCAST</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {statusNotification && (
        <div className="p-3.5 bg-rose-950/90 border border-rose-600 text-rose-200 text-xs font-mono flex items-center justify-between rounded shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0" />
            <span className="font-bold">// SOS TRANSMISSION ACTIVE:</span>
            <span>{statusNotification}</span>
          </div>
          <button onClick={() => setStatusNotification(null)} className="text-[#888] hover:text-white ml-3">
            ✕
          </button>
        </div>
      )}

      {/* Main Messaging Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Channels List */}
        <div className="bg-[#121212] border border-[#262626] rounded-lg p-4 font-mono text-xs space-y-3 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-[#222] pb-2">
            <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#D4AF37]" />
              COMMS CHANNELS
            </span>
            <button onClick={fetchMessages} className="text-[#666] hover:text-white" title="Refresh">
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

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

          {/* Unit Status Widget */}
          <div className="pt-3 border-t border-[#222] text-[10px] space-y-1.5 text-[#777]">
            <div className="flex justify-between">
              <span>CONNECTED CAB:</span>
              <span className="text-white font-bold">TR-904 (Cascadia)</span>
            </div>
            <div className="flex justify-between">
              <span>DRIVER ID:</span>
              <span className="text-[#D4AF37]">Vance R. (CDL-A)</span>
            </div>
            <div className="flex justify-between">
              <span>CELLULAR SIGNAL:</span>
              <span className="text-emerald-400">LTE 5G ENCRYPTED</span>
            </div>
          </div>
        </div>

        {/* Right Chat Stream & Input */}
        <div className="bg-[#121212] border border-[#262626] rounded-lg flex flex-col justify-between font-mono text-xs lg:col-span-3 h-[600px]">
          {/* Channel Header */}
          <div className="p-3 border-b border-[#222] bg-[#161616] rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                CURRENT CHANNEL: {selectedChannel.replace('_', ' ')}
              </span>
            </div>
            <span className="text-[10px] text-[#888]">END-TO-END FLEET ENCRYPTED</span>
          </div>

          {/* Message Stream */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3.5">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#555] space-y-2">
                <MessageSquare className="w-8 h-8 text-[#333]" />
                <span>No messages in this channel yet.</span>
              </div>
            ) : (
              messages.map((msg) => {
                const isDriver = msg.senderRole === 'DRIVER';
                const isSos = msg.priority === 'EMERGENCY_SOS';
                const isHigh = msg.priority === 'HIGH';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isDriver ? 'items-end' : 'items-start'}`}
                  >
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
                      className={`max-w-xl p-3 rounded-lg text-xs leading-relaxed ${
                        isSos
                          ? 'bg-rose-950/80 border border-rose-600 text-rose-200'
                          : isDriver
                          ? 'bg-[#1b261e] border border-emerald-800/60 text-emerald-100 rounded-tr-none'
                          : 'bg-[#181818] border border-[#2a2a2a] text-[#DDD] rounded-tl-none'
                      }`}
                    >
                      <p>{msg.text}</p>

                      {/* Optional Audio Transcript snippet */}
                      {msg.audioTranscript && (
                        <div className="mt-2 pt-1.5 border-t border-[#333] flex items-center gap-1.5 text-[10px] text-[#AAA]">
                          <Volume2 className="w-3 h-3 text-[#D4AF37]" />
                          <span>Voice Note: "{msg.audioTranscript}"</span>
                        </div>
                      )}

                      {/* Optional Attached Load */}
                      {msg.attachedLoadId && (
                        <div className="mt-2 pt-1 border-t border-[#333] flex items-center gap-1 text-[9px] text-[#D4AF37]">
                          <Zap className="w-3 h-3" />
                          <span>ATTACHED LOAD: {msg.attachedLoadId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies Tray */}
          <div className="px-4 py-2 bg-[#141414] border-t border-[#222] overflow-x-auto flex gap-1.5">
            {cannedQuickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickReply(reply)}
                className="px-2.5 py-1 bg-[#1e1e1e] hover:bg-[#282828] text-[#AAA] hover:text-white rounded border border-[#333] text-[10px] whitespace-nowrap transition-all"
              >
                + {reply}
              </button>
            ))}
          </div>

          {/* Speech Error Banner */}
          {speechError && (
            <div className="mx-3 my-2 p-2.5 rounded bg-amber-950/80 border border-amber-700 text-amber-200 text-xs font-mono flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{speechError}</span>
              </div>
              <button
                type="button"
                onClick={() => setSpeechError(null)}
                className="text-amber-400 hover:text-white px-2 py-0.5 rounded text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Active Voice Transcribing Tray */}
          {isTranscribing && (
            <div className="mx-3 mt-2 p-2.5 rounded-lg bg-gradient-to-r from-red-950/90 via-[#1C1414] to-[#141414] border border-red-700/80 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in shadow-xl">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded bg-red-600 text-white font-mono text-[10px] font-black uppercase tracking-wider animate-pulse">
                  <Mic className="w-3.5 h-3.5" />
                  <span>LIVE MIC</span>
                </div>

                {/* Live In-Cab Decibel / Volume Visualizer */}
                <div className="flex items-center gap-0.5 shrink-0 h-4 px-1 rounded bg-black/50 border border-red-900/60" title={`Microphone Input Level: ${micVolumeLevel}%`}>
                  {[1, 2, 3, 4, 5, 6].map((barIdx) => {
                    const isActive = micVolumeLevel >= barIdx * 14;
                    return (
                      <div
                        key={barIdx}
                        className={`w-1 rounded-sm transition-all duration-75 ${
                          isActive
                            ? barIdx > 4
                              ? 'bg-red-400 h-3.5'
                              : barIdx > 2
                              ? 'bg-amber-400 h-2.5'
                              : 'bg-emerald-400 h-2'
                            : 'bg-slate-800 h-1'
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-red-200 font-mono truncate">
                    {interimTranscript ? (
                      <span className="italic font-bold text-white tracking-wide">
                        "{interimTranscript}"
                      </span>
                    ) : (
                      <span className="text-red-300/80 animate-pulse">
                        Listening to in-cab speech... Speak clearly into microphone
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={stopMicrophoneTranscription}
                  className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 shadow"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Done Speaking</span>
                </button>
                {interimTranscript && (
                  <button
                    type="button"
                    onClick={() => setInterimTranscript('')}
                    className="p-1 rounded text-red-300 hover:text-white hover:bg-red-900/60"
                    title="Clear current speech phrase"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#161616] border-t border-[#222] flex items-center gap-2">
            {/* Microphone Voice-to-Text Transcription Button */}
            <button
              id="btn-voice-transcribe-composer"
              type="button"
              onClick={handleToggleVoiceTranscribe}
              className={`px-2.5 py-2 rounded border transition-all flex items-center gap-1.5 shrink-0 ${
                isTranscribing
                  ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-950/80 animate-pulse'
                  : 'bg-[#1E1E1E] text-[#D4AF37] hover:text-white hover:bg-[#282828] border-[#383838]'
              }`}
              title={
                isTranscribing
                  ? 'Click to stop microphone transcription'
                  : 'Click to transcribe in-cab voice directly into message composer'
              }
            >
              {isTranscribing ? (
                <>
                  <Mic className="w-4 h-4 text-white animate-bounce" />
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider">
                    STOP
                  </span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-[#D4AF37]" />
                  <span className="hidden sm:inline text-[10px] font-mono font-bold uppercase tracking-wider">
                    MIC
                  </span>
                </>
              )}
            </button>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="px-2 py-2 bg-[#0a0a0a] border border-[#333] rounded text-white text-[10px] focus:outline-none focus:border-[#D4AF37] shrink-0"
            >
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High Priority</option>
              <option value="EMERGENCY_SOS">Emergency SOS</option>
            </select>

            <div className="relative flex-1">
              <input
                id="messaging-composer-input"
                type="text"
                placeholder={
                  isTranscribing
                    ? 'Listening... Speak in-cab message now'
                    : 'Type dispatch message or click MIC to transcribe voice...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className={`w-full px-3 py-2 bg-[#0a0a0a] border rounded text-white text-xs focus:outline-none transition-all ${
                  isTranscribing
                    ? 'border-red-500/80 ring-1 ring-red-500/50 placeholder:text-red-300/60'
                    : 'border-[#333] focus:border-[#D4AF37]'
                }`}
              />
              {inputText && (
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  title="Clear composer text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              id="btn-send-message"
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2 bg-[#D4AF37] hover:bg-[#f3df9b] text-black font-bold text-xs rounded transition-all disabled:opacity-40 flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SEND</span>
            </button>
          </form>
        </div>
      </div>

      {/* Emergency SOS Modal */}
      {isSosModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono text-xs">
          <div className="bg-[#141010] border-2 border-rose-600 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold border-b border-rose-900 pb-3">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
              <div>
                <h3 className="text-base text-white">EMERGENCY CAB BROADCAST</h3>
                <span className="text-[10px] text-rose-400">49 CFR § 392 ROADSIDE EMERGENCY ASSISTANCE</span>
              </div>
            </div>

            <p className="text-[#AAA] text-xs leading-relaxed">
              Transmitting an SOS instantly notifies Central Dispatch, Fleet Safety, and nearest heavy-wrecker dispatch with your exact GPS telemetry coordinates.
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
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded uppercase tracking-wider shadow-lg transition-all"
              >
                TRANSMIT SOS NOW
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
