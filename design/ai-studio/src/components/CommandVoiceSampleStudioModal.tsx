import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Upload,
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  Volume2,
  Radio,
  Sliders,
  Sparkles,
  Zap,
  RotateCcw,
  X,
  FileAudio,
  ShieldCheck,
  Compass,
  LayoutDashboard,
  MapPin,
  ClipboardCheck,
  Layers,
  Activity,
  AlertCircle,
  Truck,
  VolumeX,
} from 'lucide-react';
import {
  VoiceCommandSample,
  DEFAULT_VOICE_COMMAND_SAMPLES,
  saveCommandVoiceSample,
  getAllCommandVoiceSamples,
  deleteCommandVoiceSample,
} from '../services/voiceCommandSampleService';
import { TabType } from '../types';
import { triggerHapticFeedback } from '../services/haptics';

interface CommandVoiceSampleStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerCommand: (cmd: VoiceCommandSample) => void;
  activeTab: TabType;
}

export const CommandVoiceSampleStudioModal: React.FC<CommandVoiceSampleStudioModalProps> = ({
  isOpen,
  onClose,
  onTriggerCommand,
  activeTab,
}) => {
  const [samplesMap, setSamplesMap] = useState<
    Record<string, { audioUrl: string; duration: number; source: string; recordedAt: string }>
  >({});
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const targetUploadCommandIdRef = useRef<string | null>(null);

  // Load all recorded samples on open
  const refreshSamples = async () => {
    const records = await getAllCommandVoiceSamples();
    setSamplesMap(records);
  };

  useEffect(() => {
    if (isOpen) {
      refreshSamples();
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Start recording for a specific command
  const handleStartRecording = async (cmdId: string) => {
    if (activeRecordingId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        if (blob.size > 500) {
          const duration = recordingSeconds || 2;
          await saveCommandVoiceSample(cmdId, blob, duration, 'MIC_RECORDING');
          await refreshSamples();
          triggerHapticFeedback('success');
          showToast(`Voice sample saved for "${cmdId}"!`);
        } else {
          showToast('Recording too short, please try again.');
        }
        setActiveRecordingId(null);
        setRecordingSeconds(0);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);
      setActiveRecordingId(cmdId);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      triggerHapticFeedback('subtle');
    } catch (err) {
      console.warn('Microphone access denied:', err);
      showToast('Microphone access denied or unavailable.');
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Play audio sample
  const handlePlaySample = (cmdId: string, audioUrl: string) => {
    if (activePlayingId === cmdId) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      }
      setActivePlayingId(null);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioPlayerRef.current = audio;
    setActivePlayingId(cmdId);

    audio.onended = () => setActivePlayingId(null);
    audio.onerror = () => setActivePlayingId(null);
    audio.play().catch(() => setActivePlayingId(null));
  };

  // Delete sample
  const handleDeleteSample = async (cmdId: string) => {
    if (activePlayingId === cmdId && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setActivePlayingId(null);
    }
    await deleteCommandVoiceSample(cmdId);
    await refreshSamples();
    showToast('Voice sample deleted. Restored to default trigger.');
    triggerHapticFeedback('subtle');
  };

  // Trigger file upload
  const handleTriggerUpload = (cmdId: string) => {
    targetUploadCommandIdRef.current = cmdId;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const cmdId = targetUploadCommandIdRef.current;
    if (!file || !cmdId) return;

    try {
      await saveCommandVoiceSample(cmdId, file, 3, 'FILE_UPLOAD', file.name);
      await refreshSamples();
      triggerHapticFeedback('success');
      showToast(`Audio sample uploaded for "${cmdId}"!`);
    } catch {
      showToast('Failed to save audio file.');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Filter commands
  const filteredCommands = DEFAULT_VOICE_COMMAND_SAMPLES.filter((cmd) => {
    const matchesCat = selectedCategory === 'ALL' || cmd.category === selectedCategory;
    const query = searchFilter.toLowerCase().trim();
    const matchesQuery =
      !query ||
      cmd.label.toLowerCase().includes(query) ||
      cmd.primaryPhrase.toLowerCase().includes(query) ||
      cmd.aliases.some((a) => a.toLowerCase().includes(query)) ||
      cmd.description.toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });

  const isInCabHud = activeTab === 'nighthud';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0C0E14] border border-[#2B3245] rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="audio/*"
          className="hidden"
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2333] bg-[#121520]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
              <FileAudio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide font-mono">
                  Voice Command Sample Studio
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D4AF37]/20 text-[#F2CA50] border border-[#D4AF37]/40">
                  GLOBAL SENTINEL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Record custom voice samples or trigger common driver actions like "Open load board" & "Start DVIR audit".
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* In-Cab HUD Silent Mode Awareness Banner */}
        <div className={`px-5 py-2.5 flex items-center justify-between border-b text-xs font-mono transition-colors ${
          isInCabHud
            ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
            : 'bg-[#141824] border-[#22283A] text-slate-300'
        }`}>
          <div className="flex items-center gap-2">
            <VolumeX className={`w-4 h-4 ${isInCabHud ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span>
              <strong>In-Cab HUD Mode:</strong> {isInCabHud ? 'ACTIVE (Zero-glare Silent Background Listening)' : 'STANDBY'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 hidden sm:block">
            {isInCabHud
              ? 'Speech synthesis & audible chimes muted to prevent cab distraction during inspection'
              : 'Audible confirmations active'}
          </div>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-4 border-b border-[#1E2333] flex flex-wrap items-center justify-between gap-3 bg-[#0E1018]">
          <input
            type="text"
            placeholder="Search commands (e.g., 'load board', 'DVIR audit', 'HOS')..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="flex-1 min-w-[200px] h-9 px-3 text-xs bg-[#161B26] border border-[#2D354A] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
          />
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'LOGISTICS', 'SAFETY', 'COMPLIANCE', 'NAVIGATION', 'TELEMETRY'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`h-8 px-2.5 rounded-lg text-[11px] font-mono font-bold uppercase transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'bg-[#181D2B] text-slate-400 hover:text-slate-200 hover:bg-[#202738]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Command Cards List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar">
          {filteredCommands.map((cmd) => {
            const sample = samplesMap[cmd.id];
            const isRecordingThis = activeRecordingId === cmd.id;
            const isPlayingThis = activePlayingId === cmd.id;

            return (
              <div
                key={cmd.id}
                className="p-4 rounded-xl bg-[#131722] border border-[#222838] hover:border-[#353E56] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-100 tracking-wide font-mono">
                      {cmd.label}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#D4AF37]/10 text-[#F2CA50] border border-[#D4AF37]/30">
                      "{cmd.primaryPhrase}"
                    </span>
                    {sample ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        RECORDED SAMPLE ({sample.duration}s)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800/60 border border-slate-700/50">
                        DEFAULT SPEECH TEMPLATE
                      </span>
                    )}
                    {cmd.fmcsaRef && (
                      <span className="text-[10px] font-mono text-slate-400">
                        // {cmd.fmcsaRef}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {cmd.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono text-slate-400 pt-0.5">
                    <span className="text-slate-500">Aliases:</span>
                    {cmd.aliases.slice(0, 4).map((alias, i) => (
                      <span key={i} className="bg-[#1A1F2E] px-1.5 py-0.2 rounded border border-[#2E364E] text-[10px]">
                        "{alias}"
                      </span>
                    ))}
                    {cmd.aliases.length > 4 && (
                      <span className="text-slate-500 text-[10px]">+{cmd.aliases.length - 4} more</span>
                    )}
                  </div>
                </div>

                {/* Right Side Sample Controls & Trigger Button */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Record Voice Sample Button */}
                  {isRecordingThis ? (
                    <button
                      onClick={handleStopRecording}
                      className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase shadow-lg shadow-red-900/40 animate-pulse"
                    >
                      <MicOff className="w-4 h-4" />
                      <span>STOP ({recordingSeconds}s)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartRecording(cmd.id)}
                      disabled={!!activeRecordingId}
                      className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#1B2232] hover:bg-[#242C40] text-slate-200 border border-[#323D57] font-mono text-xs font-medium hover:border-[#D4AF37]/60 transition-all disabled:opacity-50"
                      title="Record your voice speaking this command"
                    >
                      <Mic className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{sample ? 'RE-RECORD' : 'RECORD VOICE'}</span>
                    </button>
                  )}

                  {/* Upload Audio Button */}
                  <button
                    onClick={() => handleTriggerUpload(cmd.id)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#1B2232] hover:bg-[#242C40] text-slate-300 border border-[#323D57] hover:border-slate-400 transition-all"
                    title="Upload recorded audio file (.wav, .mp3, .m4a)"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>

                  {/* Play Audio Sample Button */}
                  {sample && (
                    <>
                      <button
                        onClick={() => handlePlaySample(cmd.id, sample.audioUrl)}
                        className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-all ${
                          isPlayingThis
                            ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                            : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/80'
                        }`}
                        title={isPlayingThis ? 'Pause sample playback' : 'Listen to recorded sample'}
                      >
                        {isPlayingThis ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteSample(cmd.id)}
                        className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800/40 text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-slate-700/40 hover:border-red-500/40 transition-all"
                        title="Delete recorded sample"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* Test Trigger Action Button */}
                  <button
                    onClick={() => {
                      onTriggerCommand(cmd);
                      triggerHapticFeedback('success');
                      showToast(`Executed action: ${cmd.label}`);
                    }}
                    className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F2CA50] text-black font-mono text-xs font-bold uppercase shadow hover:brightness-110 active:scale-95 transition-all"
                    title="Trigger this action immediately"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>TRIGGER ACTION</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-[#1E2333] bg-[#0E1018] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300">
              Global speech listener matches recorded samples and natural phrasing in real time.
            </span>
          </div>
          <button
            onClick={onClose}
            className="h-8 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase transition-all"
          >
            Close
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 inset-x-0 z-60 flex justify-center pointer-events-none animate-fadeIn">
          <div className="px-4 py-2 rounded-lg bg-[#141824] border border-[#D4AF37] text-[#F2CA50] text-xs font-mono font-bold shadow-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
