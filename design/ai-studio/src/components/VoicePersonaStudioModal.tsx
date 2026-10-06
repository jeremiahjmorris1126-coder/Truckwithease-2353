import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Sparkles,
  Sliders,
  RotateCcw,
  Radio,
  X,
  Award,
  Zap,
  UserCheck,
  Trash2,
  Download,
  Upload,
  Info,
  Clock,
  Activity,
  Heart,
  Headphones,
} from 'lucide-react';
import { UserRoleType } from '../types';
import {
  VoicePersona,
  POPULAR_FIGURE_PERSONAS,
  CUSTOM_FLEET_PERSONA_TEMPLATE,
  getActiveVoicePersona,
  setActiveVoicePersona,
  getAllVoicePersonas,
  canManageVoicePersonas,
  speakWithActivePersona,
  saveCustomVoiceClip,
  getCustomVoiceClip,
  deleteCustomVoiceClip,
  getCustomVoiceMetadata,
  saveCustomVoiceMetadata,
} from '../services/voicePersonaService';
import { triggerHapticFeedback } from '../services/haptics';

interface VoicePersonaStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: UserRoleType;
}

export const VoicePersonaStudioModal: React.FC<VoicePersonaStudioModalProps> = ({
  isOpen,
  onClose,
  userRole = 'admin',
}) => {
  const [activeTab, setActiveTab] = useState<'POPULAR' | 'RECORD_OWN' | 'SETTINGS'>('POPULAR');
  const [activePersona, setActivePersona] = useState<VoicePersona>(getActiveVoicePersona());
  const [playingPersonaId, setPlayingPersonaId] = useState<string | null>(null);
  
  // Custom Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [customVoiceName, setCustomVoiceName] = useState('Fleet Executive Voice');
  const [pitchTuning, setPitchTuning] = useState(0); // -5 to +5
  const [rateTuning, setRateTuning] = useState(0);   // -5 to +5
  const [selectedScriptIndex, setSelectedScriptIndex] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recordedAudioElementRef = useRef<HTMLAudioElement | null>(null);

  const isAdmin = canManageVoicePersonas((userRole as UserRoleType));

  const CALIBRATION_SCRIPTS = [
    {
      title: 'Standard Dispatch & Systems Check',
      text: "TruckWithEase fleet systems online. All telemetry and engine diagnostics verified. Clear road ahead, driver.",
      tag: 'DAILY DISPATCH',
    },
    {
      title: 'Weigh Station & Roadside Alert',
      text: "Weight clearance confirmed at 78,400 lbs. Next weigh station in 14 miles. Pre-clearance green light granted.",
      tag: 'DOT COMPLIANCE',
    },
    {
      title: 'Safety & Emergency Advisory',
      text: "Dispatch alert: Weather advisory ahead on Interstate 80. Reduce speed, maintain safe following distance, and hold steady.",
      tag: 'SAFETY DIRECTIVE',
    },
  ];

  // Refresh active persona and custom metadata
  useEffect(() => {
    if (!isOpen) return;
    const persona = getActiveVoicePersona();
    setActivePersona(persona);

    const meta = getCustomVoiceMetadata();
    if (meta) {
      setCustomVoiceName(meta.name);
      setPitchTuning(meta.pitchAdjustment);
      setRateTuning(meta.rateAdjustment);
    }

    // Load any existing custom clip for the current script
    loadExistingCustomClip(0);

    const handlePersonaChange = (e: any) => {
      if (e.detail?.activePersona) {
        setActivePersona(e.detail.activePersona);
      }
    };
    window.addEventListener('truckwithease_voice_persona_changed', handlePersonaChange);
    return () => {
      window.removeEventListener('truckwithease_voice_persona_changed', handlePersonaChange);
      stopAudioPlayback();
      stopRecordingCleanup();
    };
  }, [isOpen]);

  const loadExistingCustomClip = async (scriptIdx: number) => {
    const clipId = `custom_phrase_${scriptIdx}`;
    const clip = await getCustomVoiceClip(clipId);
    if (clip) {
      setRecordedAudioBlob(clip.blob);
      setRecordedAudioUrl(clip.url);
    } else {
      setRecordedAudioBlob(null);
      setRecordedAudioUrl(null);
    }
  };

  const handleSelectScript = (idx: number) => {
    setSelectedScriptIndex(idx);
    loadExistingCustomClip(idx);
  };

  // Toast auto-clear
  useEffect(() => {
    if (successToast) {
      const t = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successToast]);

  // Audio waveform visualizer while recording
  const startVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          // Military amber/emerald gradient
          const r = Math.min(255, 30 + dataArray[i]);
          const g = Math.min(255, 180 + dataArray[i] * 0.3);
          const b = 80;
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
          x += barWidth;
        }
      };

      draw();
    } catch (e) {
      console.warn('Visualizer unavailable:', e);
    }
  };

  // Start recording
  const handleStartRecording = async () => {
    if (!isAdmin) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);

        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      triggerHapticFeedback(25);

      // Visualizer
      startVisualizer(stream);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Microphone access was denied. Please grant microphone permissions in browser settings.');
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      triggerHapticFeedback(25);
    }
    stopRecordingCleanup();
  };

  const stopRecordingCleanup = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  };

  // Play preview of recorded audio
  const handlePlayRecorded = () => {
    if (!recordedAudioUrl) return;
    if (isPlayingRecorded) {
      recordedAudioElementRef.current?.pause();
      setIsPlayingRecorded(false);
      return;
    }

    const audio = new Audio(recordedAudioUrl);
    recordedAudioElementRef.current = audio;
    audio.playbackRate = 1.0 + (rateTuning * 0.05);

    audio.onended = () => setIsPlayingRecorded(false);
    audio.onerror = () => setIsPlayingRecorded(false);

    audio.play().then(() => setIsPlayingRecorded(true)).catch(() => setIsPlayingRecorded(false));
  };

  // Save custom recording to IndexedDB & Deploy to fleet
  const handleSaveAndDeployCustomVoice = async () => {
    if (!isAdmin || !recordedAudioBlob) return;
    setIsDeploying(true);
    triggerHapticFeedback('subtle');

    try {
      const clipId = `custom_phrase_${selectedScriptIndex}`;
      await saveCustomVoiceClip(clipId, recordedAudioBlob, {
        phraseText: CALIBRATION_SCRIPTS[selectedScriptIndex].text,
        duration: recordingDuration,
      });

      // Save metadata
      saveCustomVoiceMetadata(
        {
          id: 'custom-fleet-recording',
          name: customVoiceName.trim() || 'Fleet Executive Voice',
          recordedByAdminId: 'admin_primary',
          recordedAt: new Date().toISOString(),
          durationSeconds: recordingDuration,
          pitchAdjustment: pitchTuning,
          rateAdjustment: rateTuning,
          samplePhrases: CALIBRATION_SCRIPTS.map((s, idx) => ({
            id: `custom_phrase_${idx}`,
            text: s.text,
            hasAudio: idx === selectedScriptIndex ? true : false,
          })),
        },
        (userRole as UserRoleType)
      );

      // Deploy active persona
      setActiveVoicePersona('custom-fleet-recording', (userRole as UserRoleType));
      setActivePersona(getActiveVoicePersona());
      setSuccessToast(`Custom Voice "${customVoiceName}" successfully calibrated and deployed fleet-wide!`);
      triggerHapticFeedback(25);
    } catch (err) {
      console.error('Failed to deploy custom voice:', err);
    } finally {
      setIsDeploying(false);
    }
  };

  // Preview an iconic persona voice
  const handlePreviewPersona = async (persona: VoicePersona) => {
    stopAudioPlayback();
    setPlayingPersonaId(persona.id);
    triggerHapticFeedback('subtle');

    await speakWithActivePersona(persona.samplePhrase, {
      overridePersona: persona,
      onStart: () => setPlayingPersonaId(persona.id),
      onEnd: () => setPlayingPersonaId(null),
    });
  };

  // Deploy an iconic persona voice (Admin only)
  const handleDeployPersona = (persona: VoicePersona) => {
    if (!isAdmin) return;
    const ok = setActiveVoicePersona(persona.id, (userRole as UserRoleType));
    if (ok) {
      setActivePersona(persona);
      setSuccessToast(`Active Fleet Voice deployed to: ${persona.name} (${persona.inspiredBy})`);
      triggerHapticFeedback(25);
    }
  };

  const stopAudioPlayback = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (recordedAudioElementRef.current) {
      recordedAudioElementRef.current.pause();
      recordedAudioElementRef.current = null;
    }
    setPlayingPersonaId(null);
    setIsPlayingRecorded(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/30">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Fleet Agent Human Voice Studio
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ACOUSTIC ENGINE v4.2
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Configure authentic human voice personas for all dispatch, Night HUD, and conversational agents
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* RBAC Status Badge */}
            {isAdmin ? (
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 text-xs font-semibold shadow-inner">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ADMIN GOVERNED</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/40 text-amber-300 text-xs font-semibold shadow-inner">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>FLEET DRIVER (READ-ONLY)</span>
              </div>
            )}

            <button
              onClick={() => {
                stopAudioPlayback();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Voice Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="bg-emerald-900/90 border-b border-emerald-500 text-emerald-200 px-4 py-2.5 text-xs font-medium flex items-center justify-between shadow-lg animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Driver Restriction Warning Banner if user is driver */}
        {!isAdmin && (
          <div className="bg-amber-950/60 border-b border-amber-600/30 px-5 py-3 flex items-start space-x-3 text-amber-200 text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">Company Fleet Driver Governance Policy</p>
              <p className="text-amber-300/80 mt-0.5">
                Voice persona switching and custom mic recordings are strictly reserved for Fleet Administrators.
                Your in-cab system is currently locked to: <span className="font-bold underline text-white">{activePersona.name} ({activePersona.inspiredBy})</span>.
                You will hear this voice for all audio dispatches and automated road alerts.
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-5 pt-2">
          <button
            onClick={() => {
              setActiveTab('POPULAR');
              stopAudioPlayback();
            }}
            className={`pb-3 px-4 text-xs font-bold tracking-wider uppercase transition-colors relative flex items-center space-x-2 ${
              activeTab === 'POPULAR'
                ? 'text-emerald-400 border-b-2 border-emerald-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>5 Popular Figure Personas</span>
          </button>

          <button
            onClick={() => {
              if (isAdmin) {
                setActiveTab('RECORD_OWN');
                stopAudioPlayback();
              }
            }}
            disabled={!isAdmin}
            className={`pb-3 px-4 text-xs font-bold tracking-wider uppercase transition-colors relative flex items-center space-x-2 ${
              !isAdmin
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : activeTab === 'RECORD_OWN'
                ? 'text-amber-400 border-b-2 border-amber-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title={!isAdmin ? 'Restricted to Fleet Administrator' : 'Record custom fleet voice'}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Record Your Own Voice</span>
            {!isAdmin && <Lock className="w-3 h-3 text-amber-500 ml-1" />}
          </button>

          <button
            onClick={() => {
              setActiveTab('SETTINGS');
              stopAudioPlayback();
            }}
            className={`pb-3 px-4 text-xs font-bold tracking-wider uppercase transition-colors relative flex items-center space-x-2 ${
              activeTab === 'SETTINGS'
                ? 'text-blue-400 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Fleet Acoustic Policy</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
          
          {/* TAB 1: 5 POPULAR FIGURE PERSONAS */}
          {activeTab === 'POPULAR' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-800/80">
                <div>
                  <h3 className="text-sm font-semibold text-white">Iconic Human Voice Personas</h3>
                  <p className="text-xs text-slate-400">
                    Select a distinctive voice persona inspired by legendary cultural figures. All in-cab agents will speak with this acoustic signature.
                  </p>
                </div>
                <div className="text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center gap-2">
                  <span className="text-slate-300 font-medium">Currently Deployed:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    {activePersona.avatarEmoji} {activePersona.name}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {POPULAR_FIGURE_PERSONAS.map((persona) => {
                  const isActive = activePersona.id === persona.id;
                  const isPlaying = playingPersonaId === persona.id;

                  return (
                    <div
                      key={persona.id}
                      className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-gradient-to-br from-slate-800 to-emerald-950/30 border-emerald-500/80 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                          : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-700/60 hover:border-slate-600'
                      }`}
                    >
                      {/* Top Info */}
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-700/60 border border-slate-600/60 flex items-center justify-center text-2xl shadow-inner">
                              {persona.avatarEmoji}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-bold text-white">{persona.name}</h4>
                                {isActive && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Active Fleet Voice
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-semibold text-emerald-400/90">{persona.inspiredBy}</p>
                              <p className="text-[11px] text-slate-400">{persona.roleTitle} • {persona.accent}</p>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                          {persona.description}
                        </p>

                        {/* Acoustic Meters */}
                        <div className="mt-3 grid grid-cols-3 gap-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800/60 text-[10px]">
                          <div>
                            <span className="text-slate-400 block">Cadence:</span>
                            <span className="font-mono text-slate-200">{Math.round(persona.rate * 100)}%</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Pitch Baritone:</span>
                            <span className="font-mono text-slate-200">{Math.round(persona.pitch * 100)}%</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Tone Style:</span>
                            <span className="font-mono text-emerald-300 truncate block">{persona.toneDescription.split(',')[0]}</span>
                          </div>
                        </div>

                        {/* Sample Quote Box */}
                        <div className="mt-3 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs italic text-slate-300 flex items-start gap-2">
                          <span className="text-amber-400 font-serif text-lg leading-none">“</span>
                          <span className="text-[11px] leading-snug">{persona.samplePhrase}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-700/40 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handlePreviewPersona(persona)}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            isPlaying
                              ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 animate-pulse'
                              : 'bg-slate-700/50 hover:bg-slate-700 border-slate-600/60 text-slate-200'
                          }`}
                        >
                          {isPlaying ? (
                            <>
                              <Square className="w-3.5 h-3.5 text-amber-400" />
                              <span>Playing Sample...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Listen Sample</span>
                            </>
                          )}
                        </button>

                        {isAdmin ? (
                          <button
                            onClick={() => handleDeployPersona(persona)}
                            disabled={isActive}
                            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isActive
                                ? 'bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 cursor-default'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 active:scale-95'
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>{isActive ? 'Currently Deployed' : 'Deploy to Fleet'}</span>
                          </button>
                        ) : (
                          <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>Admin Only</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: RECORD YOUR OWN FLEET VOICE (ADMIN ONLY) */}
          {activeTab === 'RECORD_OWN' && (
            <div className="space-y-5">
              {!isAdmin ? (
                <div className="p-8 text-center bg-slate-950/60 border border-amber-600/30 rounded-xl space-y-3">
                  <Lock className="w-12 h-12 text-amber-500 mx-auto" />
                  <h4 className="text-base font-bold text-white">Voice Cloning & Studio Restricted</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Only authorized Fleet Administrators are licensed to record and deploy custom in-cab voice models to company units.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Mic className="w-4 h-4 text-amber-400" />
                        Admin Sovereign Voice Recorder & Acoustic Calibrator
                      </h3>
                      <p className="text-xs text-slate-400">
                        Record your voice commands using standard fleet teleprompter scripts. Your recorded audio will deliver directives to all in-cab drivers.
                      </p>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full font-mono">
                      INDEXEDDB SAFE ENCLAVE
                    </span>
                  </div>

                  {/* Calibration Script Selector */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                      Step 1: Select Teleprompter Calibration Script
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {CALIBRATION_SCRIPTS.map((script, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectScript(idx)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            selectedScriptIndex === idx
                              ? 'bg-amber-950/30 border-amber-500/80 shadow-md text-amber-200'
                              : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="text-[10px] block font-mono uppercase text-amber-400 font-bold">
                            {script.tag}
                          </span>
                          <span className="text-xs font-semibold text-white block mt-0.5">{script.title}</span>
                        </button>
                      ))}
                    </div>

                    {/* Script Read-Along Box */}
                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl relative">
                      <span className="text-[10px] font-mono text-slate-400 block mb-1">
                        READ ALOUD INTO MICROPHONE:
                      </span>
                      <p className="text-sm font-medium text-slate-100 italic leading-relaxed">
                        "{CALIBRATION_SCRIPTS[selectedScriptIndex].text}"
                      </p>
                    </div>
                  </div>

                  {/* Recording Studio & Audio Visualizer */}
                  <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
                    {/* Visualizer Canvas */}
                    <div className="w-full max-w-md h-24 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative shadow-inner flex items-center justify-center">
                      <canvas ref={canvasRef} width="440" height="96" className="w-full h-full" />
                      {!isRecording && !recordedAudioBlob && (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
                          Microphone idle. Click "Start Recording" to calibrate.
                        </div>
                      )}
                      {isRecording && (
                        <div className="absolute top-2 right-2 flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/60 text-red-300 text-[10px] font-mono font-bold animate-pulse">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                          <span>RECORDING {recordingDuration}s</span>
                        </div>
                      )}
                    </div>

                    {/* Recording Controls */}
                    <div className="flex items-center space-x-4">
                      {!isRecording ? (
                        <button
                          onClick={handleStartRecording}
                          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50 transition-all active:scale-95"
                        >
                          <Mic className="w-4 h-4" />
                          <span>{recordedAudioBlob ? 'Re-Record Voice Sample' : 'Start Recording Sample'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleStopRecording}
                          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/50 transition-all animate-pulse"
                        >
                          <Square className="w-4 h-4 fill-slate-950" />
                          <span>Stop Recording ({recordingDuration}s)</span>
                        </button>
                      )}

                      {recordedAudioBlob && !isRecording && (
                        <button
                          onClick={handlePlayRecorded}
                          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                            isPlayingRecorded
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                          }`}
                        >
                          {isPlayingRecorded ? (
                            <>
                              <Square className="w-3.5 h-3.5 text-amber-400" />
                              <span>Stop Preview</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Play Recorded Audio</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Voice Tuning Parameters */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                    <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                      Step 2: Profile Name & Acoustic Calibration
                    </label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Custom Voice Name:</label>
                        <input
                          type="text"
                          value={customVoiceName}
                          onChange={(e) => setCustomVoiceName(e.target.value)}
                          placeholder="e.g. CEO Davis In-Cab Voice"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Pitch Calibration:</span>
                          <span className="font-mono text-amber-400">{pitchTuning > 0 ? `+${pitchTuning}` : pitchTuning}</span>
                        </div>
                        <input
                          type="range"
                          min="-5"
                          max="5"
                          value={pitchTuning}
                          onChange={(e) => setPitchTuning(parseInt(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Cadence Speed:</span>
                          <span className="font-mono text-amber-400">{rateTuning > 0 ? `+${rateTuning}` : rateTuning}</span>
                        </div>
                        <input
                          type="range"
                          min="-5"
                          max="5"
                          value={rateTuning}
                          onChange={(e) => setRateTuning(parseInt(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                      </div>
                    </div>

                    {/* Deploy Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleSaveAndDeployCustomVoice}
                        disabled={!recordedAudioBlob || isDeploying}
                        className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
                          !recordedAudioBlob || isDeploying
                            ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            : 'bg-[#FFE600] hover:bg-[#FFD700] text-black font-extrabold shadow-[0_0_20px_rgba(255,230,0,0.5)] active:scale-95 border border-yellow-200'
                        }`}
                      >
                        <Zap className="w-4 h-4" />
                        <span>{isDeploying ? 'Deploying to Fleet...' : 'Save & Deploy Custom Voice to Fleet'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FLEET ACOUSTIC SETTINGS */}
          {activeTab === 'SETTINGS' && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white">Fleet-Wide Voice Governance</h3>
                <p className="text-xs text-slate-400">
                  Manage in-cab acoustic safety thresholds, sound ducking over CB radio, and audio confirmation policies.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Mandatory Hands-Free Voice Response (49 CFR § 392.82)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Automatically confirms voice commands audibly without requiring driver eyes off road.
                    </p>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-400 px-2.5 py-1 bg-emerald-950/80 border border-emerald-600/40 rounded-lg">
                    ENFORCED
                  </span>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">CB Radio Audio Auto-Ducking</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Automatically lowers 27MHz CB transceiver volume by 80% when safety alerts or agent directives speak.
                    </p>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-400 px-2.5 py-1 bg-emerald-950/80 border border-emerald-600/40 rounded-lg">
                    ACTIVE
                  </span>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Driver Modification Guard</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Locks acoustic profiles on in-cab tablets. Drivers cannot switch away from the fleet-assigned voice persona.
                    </p>
                  </div>
                  <span className="text-xs font-bold font-mono text-amber-400 px-2.5 py-1 bg-amber-950/80 border border-amber-600/40 rounded-lg">
                    ADMIN RESTRICTED
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px]">Active Persona: <strong className="text-white">{activePersona.name}</strong></span>
          </div>

          <button
            onClick={() => {
              stopAudioPlayback();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
