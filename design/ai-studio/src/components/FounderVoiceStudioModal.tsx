import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Upload,
  Trash2,
  Edit3,
  Save,
  RotateCcw,
  CheckCircle2,
  Volume2,
  Sparkles,
  X,
  Radio,
  FileAudio,
  Clock,
  Check,
  AlertCircle,
  Truck,
  Download,
} from 'lucide-react';
import {
  saveFounderAudioRecording,
  getFounderAudioRecording,
  deleteFounderAudioRecording,
  saveCustomScript,
  resetCustomScript,
  getAllCustomScripts,
  getAudioPlaybackMode,
  setAudioPlaybackMode,
  StoredAudioRecording,
} from '../services/founderVoiceService';
import { CHAPTERS_DATA } from './FounderHumanStorySection';

interface FounderVoiceStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialChapterId?: 'what-it-does' | 'how-we-got-here' | 'where-we-are-going';
  onUpdated?: () => void;
}

export const FounderVoiceStudioModal: React.FC<FounderVoiceStudioModalProps> = ({
  isOpen,
  onClose,
  initialChapterId = 'what-it-does',
  onUpdated,
}) => {
  const [activeChapterId, setActiveChapterId] = useState<
    'what-it-does' | 'how-we-got-here' | 'where-we-are-going'
  >(initialChapterId);

  const [activeTab, setActiveTab] = useState<'record' | 'upload' | 'reword'>('reword');

  // Script rewording state
  const [scriptText, setScriptText] = useState<string>('');
  const [chapterTitle, setChapterTitle] = useState<string>('');
  const [chapterSubtitle, setChapterSubtitle] = useState<string>('');
  const [chapterTagline, setChapterTagline] = useState<string>('');
  const [isScriptDirty, setIsScriptDirty] = useState<boolean>(false);
  const [scriptSavedToast, setScriptSavedToast] = useState<boolean>(false);

  // Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState<boolean>(false);

  // Active saved recording in DB
  const [savedRecording, setSavedRecording] = useState<StoredAudioRecording | null>(null);
  const [savedAudioUrl, setSavedAudioUrl] = useState<string | null>(null);

  // Preview playback state
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(false);
  const [previewProgress, setPreviewProgress] = useState<number>(0);

  // Audio mode
  const [audioMode, setAudioMode] = useState<'CUSTOM_RECORDING' | 'AI_SYNTHESIS'>('CUSTOM_RECORDING');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Default chapter data
  const defaultChapter =
    CHAPTERS_DATA.find((c) => c.id === activeChapterId) || CHAPTERS_DATA[0];

  // Load script & recording when modal opens or chapter changes
  useEffect(() => {
    if (!isOpen) return;

    setActiveChapterId(initialChapterId);
    loadChapterData(initialChapterId);
    setAudioMode(getAudioPlaybackMode());
  }, [isOpen, initialChapterId]);

  const loadChapterData = async (chId: typeof activeChapterId) => {
    const ch = CHAPTERS_DATA.find((c) => c.id === chId) || CHAPTERS_DATA[0];
    const customScripts = getAllCustomScripts();
    const override = customScripts[chId];

    setChapterTitle(override?.title || ch.title);
    setChapterSubtitle(override?.subtitle || ch.subtitle);
    setChapterTagline(override?.tagline || ch.tagline);
    setScriptText(override?.spokenScript || ch.spokenScript);
    setIsScriptDirty(false);

    // Reset temporary recording
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    setRecordedBlob(null);
    setRecordedAudioUrl(null);
    setIsRecording(false);
    setRecordingSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);

    // Load saved recording from IndexedDB
    try {
      const saved = await getFounderAudioRecording(chId);
      if (saved) {
        setSavedRecording(saved.recording);
        setSavedAudioUrl(saved.audioUrl);
      } else {
        setSavedRecording(null);
        setSavedAudioUrl(null);
      }
    } catch {
      setSavedRecording(null);
      setSavedAudioUrl(null);
    }
  };

  const handleChapterSwitch = (chId: typeof activeChapterId) => {
    stopPreviewAudio();
    stopRecording();
    setActiveChapterId(chId);
    loadChapterData(chId);
  };

  // Word count & estimate duration (~130 words / minute)
  const wordCount = scriptText.trim().split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.round((wordCount / 130) * 60);
  const estimatedFormatted = `${Math.floor(estimatedSeconds / 60)}m ${estimatedSeconds % 60}s`;

  // Handle saving reworded script
  const handleSaveScript = () => {
    saveCustomScript({
      id: activeChapterId,
      title: chapterTitle,
      subtitle: chapterSubtitle,
      tagline: chapterTagline,
      spokenScript: scriptText,
      updatedAt: new Date().toISOString(),
    });
    setIsScriptDirty(false);
    setScriptSavedToast(true);
    setTimeout(() => setScriptSavedToast(false), 3000);
    if (onUpdated) onUpdated();
  };

  const handleResetScriptToDefault = () => {
    resetCustomScript(activeChapterId);
    setChapterTitle(defaultChapter.title);
    setChapterSubtitle(defaultChapter.subtitle);
    setChapterTagline(defaultChapter.tagline);
    setScriptText(defaultChapter.spokenScript);
    setIsScriptDirty(false);
    setScriptSavedToast(true);
    setTimeout(() => setScriptSavedToast(false), 3000);
    if (onUpdated) onUpdated();
  };

  // START RECORDING via Microphone
  const startRecording = async () => {
    setMicError(null);
    stopPreviewAudio();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError('Microphone recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Prefer high quality audio/webm or audio/mp4
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        setRecordedBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setRecordedAudioUrl(url);

        // Stop all mic tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250); // chunk every 250ms
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error starting mic recording:', err);
      setMicError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Microphone permission denied. Please allow microphone access in your browser settings.'
          : 'Could not access microphone: ' + (err.message || 'Unknown error')
      );
      setIsRecording(false);
    }
  };

  // STOP RECORDING
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping mediaRecorder:', e);
      }
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  // Discard newly recorded take
  const handleDiscardRecording = () => {
    stopPreviewAudio();
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    setRecordedBlob(null);
    setRecordedAudioUrl(null);
    setRecordingSeconds(0);
  };

  // SAVE RECORDING TO DATABASE
  const handleSaveRecordedVoice = async () => {
    if (!recordedBlob) return;
    setIsProcessingAudio(true);

    try {
      await saveFounderAudioRecording(
        activeChapterId,
        recordedBlob,
        recordingSeconds || 1,
        'MIC_RECORDING'
      );
      setSavedRecording({
        chapterId: activeChapterId,
        blob: recordedBlob,
        mimeType: recordedBlob.type,
        durationSeconds: recordingSeconds,
        recordedAt: new Date().toISOString(),
        source: 'MIC_RECORDING',
        sizeBytes: recordedBlob.size,
      });
      setSavedAudioUrl(recordedAudioUrl);
      setAudioMode('CUSTOM_RECORDING');
      setScriptSavedToast(true);
      setTimeout(() => setScriptSavedToast(false), 3000);
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error('Failed to save audio recording:', err);
      setMicError('Failed to save recording to storage.');
    } finally {
      setIsProcessingAudio(false);
    }
  };

  // UPLOAD FILE HANDLER
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopPreviewAudio();
    setIsProcessingAudio(true);

    const url = URL.createObjectURL(file);
    setRecordedBlob(file);
    setRecordedAudioUrl(url);

    // Read audio duration
    const tempAudio = new Audio(url);
    tempAudio.onloadedmetadata = async () => {
      const dur = Math.round(tempAudio.duration) || 10;
      setRecordingSeconds(dur);

      try {
        await saveFounderAudioRecording(
          activeChapterId,
          file,
          dur,
          'FILE_UPLOAD',
          file.name
        );

        setSavedRecording({
          chapterId: activeChapterId,
          blob: file,
          mimeType: file.type,
          durationSeconds: dur,
          recordedAt: new Date().toISOString(),
          source: 'FILE_UPLOAD',
          fileName: file.name,
          sizeBytes: file.size,
        });
        setSavedAudioUrl(url);
        setAudioMode('CUSTOM_RECORDING');
        setScriptSavedToast(true);
        setTimeout(() => setScriptSavedToast(false), 3000);
        if (onUpdated) onUpdated();
      } catch (err) {
        console.error('Failed to save uploaded file:', err);
        setMicError('Failed to save uploaded audio file.');
      } finally {
        setIsProcessingAudio(false);
      }
    };
  };

  // DELETE SAVED RECORDING
  const handleDeleteSavedRecording = async () => {
    if (!window.confirm('Delete this voice recording and revert to AI voice synthesis?')) return;
    stopPreviewAudio();
    await deleteFounderAudioRecording(activeChapterId);
    setSavedRecording(null);
    if (savedAudioUrl) {
      URL.revokeObjectURL(savedAudioUrl);
    }
    setSavedAudioUrl(null);
    setRecordedBlob(null);
    setRecordedAudioUrl(null);
    setAudioMode('AI_SYNTHESIS');
    setAudioPlaybackMode('AI_SYNTHESIS');
    if (onUpdated) onUpdated();
  };

  // TOGGLE PREVIEW PLAYBACK
  const togglePreviewAudio = (audioSrc: string) => {
    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(audioSrc);
      previewAudioRef.current.ontimeupdate = () => {
        if (previewAudioRef.current && previewAudioRef.current.duration) {
          const pct =
            (previewAudioRef.current.currentTime / previewAudioRef.current.duration) * 100;
          setPreviewProgress(pct);
        }
      };
      previewAudioRef.current.onended = () => {
        setIsPreviewPlaying(false);
        setPreviewProgress(0);
      };
    }

    if (previewAudioRef.current.src !== audioSrc) {
      previewAudioRef.current.src = audioSrc;
    }

    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      previewAudioRef.current
        .play()
        .then(() => setIsPreviewPlaying(true))
        .catch((e) => console.warn('Preview play error:', e));
    }
  };

  const stopPreviewAudio = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
      setIsPreviewPlaying(false);
      setPreviewProgress(0);
    }
  };

  // Format seconds into MM:SS
  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0C1017] border-2 border-[#C9A84C]/60 rounded-2xl shadow-[0_0_50px_rgba(201,168,76,0.25)] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#C9A84C] via-[#FFD700] to-[#00FF66]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1E2635] bg-[#090D14]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700]">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#FFD700]/20 text-[#FFD700] text-[10px] font-mono font-bold uppercase tracking-wider">
                  FOUNDER VOICE STUDIO &amp; SCRIPT ENGINE
                </span>
                <span className="text-xs font-mono text-[#00FF66] font-bold hidden sm:inline">
                  JEREMIAH MORRIS
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                Record Your Voice &amp; Reword What Is Said
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              stopRecording();
              stopPreviewAudio();
              onClose();
            }}
            className="p-2 rounded-xl bg-[#141A24] hover:bg-[#1E2736] border border-[#27354A] text-[#8C9BAE] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {scriptSavedToast && (
          <div className="bg-[#00FF66]/20 border-b border-[#00FF66]/40 px-5 py-2.5 flex items-center justify-between text-xs font-mono text-[#00FF66]">
            <span className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Your changes have been saved &amp; applied to the beginning of TRUCKWITHEASE!
            </span>
            <span className="text-[10px] text-white/80">UPDATED</span>
          </div>
        )}

        {/* CHAPTER SELECTOR STRIP */}
        <div className="bg-[#080B10] px-5 py-3 border-b border-[#1A2230] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-[#8C9BAE] uppercase font-bold">
            Select Section to Reword or Record:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {CHAPTERS_DATA.map((ch) => {
              const isSelected = activeChapterId === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleChapterSwitch(ch.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                    isSelected
                      ? 'bg-[#FFD700] text-[#0A0A0A] shadow-[0_0_12px_rgba(255,215,0,0.35)]'
                      : 'bg-[#121822] hover:bg-[#1A2332] text-[#8C9BAE] border border-[#243142]'
                  }`}
                >
                  Ch {ch.chapterNumber}: {ch.id === 'what-it-does' ? '1. What It Does' : ch.id === 'how-we-got-here' ? '2. How We Got Here' : '3. Where We Are Going'}
                </button>
              );
            })}
          </div>
        </div>

        {/* WORKSPACE NAVIGATION TABS */}
        <div className="flex border-b border-[#1E2635] bg-[#0A0E15] px-5">
          <button
            onClick={() => {
              stopPreviewAudio();
              setActiveTab('reword');
            }}
            className={`py-3 px-4 text-xs font-mono font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'reword'
                ? 'border-[#FFD700] text-[#FFD700] bg-[#111722]'
                : 'border-transparent text-[#7C8799] hover:text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>1. Reword The Script &amp; Text</span>
            {isScriptDirty && (
              <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse" />
            )}
          </button>

          <button
            onClick={() => {
              stopPreviewAudio();
              setActiveTab('record');
            }}
            className={`py-3 px-4 text-xs font-mono font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'record'
                ? 'border-[#00FF66] text-[#00FF66] bg-[#111722]'
                : 'border-transparent text-[#7C8799] hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>2. Record Voice With Mic</span>
            {savedRecording?.source === 'MIC_RECORDING' && (
              <span className="px-1.5 py-0.2 rounded bg-[#00FF66]/20 text-[#00FF66] text-[9px]">
                SAVED
              </span>
            )}
          </button>

          <button
            onClick={() => {
              stopPreviewAudio();
              setActiveTab('upload');
            }}
            className={`py-3 px-4 text-xs font-mono font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'upload'
                ? 'border-[#C9A84C] text-[#C9A84C] bg-[#111722]'
                : 'border-transparent text-[#7C8799] hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>3. Upload Audio File (.mp3 / .wav)</span>
            {savedRecording?.source === 'FILE_UPLOAD' && (
              <span className="px-1.5 py-0.2 rounded bg-[#C9A84C]/20 text-[#C9A84C] text-[9px]">
                FILE SAVED
              </span>
            )}
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[62vh] space-y-6">
          {/* TAB 1: REWORD THE SCRIPT */}
          {activeTab === 'reword' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#090E16] border border-[#1C2636] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-white uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FFD700]" />
                    Edit Spoken Transcript For Chapter {defaultChapter.chapterNumber}
                  </h4>
                  <p className="text-xs text-[#8C9BAE]">
                    Change the exact words Jeremiah Morris speaks when introducing TRUCKWITHEASE.
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="px-2.5 py-1 rounded bg-[#131A24] border border-[#222E3E] text-[#FFD700]">
                    <strong>{wordCount}</strong> words &bull; ~{estimatedFormatted}
                  </div>
                  <button
                    onClick={handleResetScriptToDefault}
                    className="px-2.5 py-1 rounded bg-[#1A2230] hover:bg-[#222E40] text-[#A0AEC0] hover:text-white flex items-center gap-1 transition-colors"
                    title="Restore original text"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Default</span>
                  </button>
                </div>
              </div>

              {/* Title & Subtitle Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#8C9BAE]">
                    Section Headline Title:
                  </label>
                  <input
                    type="text"
                    value={chapterTitle}
                    onChange={(e) => {
                      setChapterTitle(e.target.value);
                      setIsScriptDirty(true);
                    }}
                    className="w-full bg-[#080B10] border border-[#202C3D] rounded-lg px-3 py-2 text-xs font-bold text-white focus:border-[#FFD700] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#8C9BAE]">
                    Subtitle &bull; Value Proposition:
                  </label>
                  <input
                    type="text"
                    value={chapterSubtitle}
                    onChange={(e) => {
                      setChapterSubtitle(e.target.value);
                      setIsScriptDirty(true);
                    }}
                    className="w-full bg-[#080B10] border border-[#202C3D] rounded-lg px-3 py-2 text-xs text-[#FFD700] focus:border-[#FFD700] focus:outline-none"
                  />
                </div>
              </div>

              {/* Tagline input */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-bold text-[#8C9BAE]">
                  Founder Motto / Banner Quote:
                </label>
                <input
                  type="text"
                  value={chapterTagline}
                  onChange={(e) => {
                    setChapterTagline(e.target.value);
                    setIsScriptDirty(true);
                  }}
                  className="w-full bg-[#080B10] border border-[#202C3D] rounded-lg px-3 py-2 text-xs italic text-[#D6DEE7] focus:border-[#FFD700] focus:outline-none"
                />
              </div>

              {/* Main Spoken Script Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase font-bold text-white flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-[#00FF66]" />
                    Spoken Keynote Script (What Jeremiah says):
                  </label>
                  <span className="text-[10px] font-mono text-[#8C9BAE]">
                    Type your custom words below
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={scriptText}
                  onChange={(e) => {
                    setScriptText(e.target.value);
                    setIsScriptDirty(true);
                  }}
                  placeholder="Type or paste your reworded script here..."
                  className="w-full bg-[#070A0F] border-2 border-[#222E40] rounded-xl p-4 text-xs sm:text-sm font-sans text-white leading-relaxed focus:border-[#00FF66] focus:outline-none shadow-inner resize-y"
                />
              </div>

              {/* Save Reworded Script Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] font-mono text-[#8C9BAE]">
                  {isScriptDirty ? (
                    <span className="text-[#FFD700] font-bold">● You have unsaved script edits</span>
                  ) : (
                    <span className="text-[#00FF66] font-bold">✓ Script is synced &amp; saved</span>
                  )}
                </div>

                <button
                  onClick={handleSaveScript}
                  className="px-5 py-2.5 rounded-xl bg-[#00FF66] hover:bg-[#00E55C] text-[#0A0A0A] font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.3)] transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save &amp; Apply Reworded Text</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE MIC RECORDING */}
          {activeTab === 'record' && (
            <div className="space-y-5">
              {micError && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-200 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{micError}</span>
                </div>
              )}

              {/* RECORDING STUDIO CONSOLE */}
              <div className="p-6 rounded-2xl bg-[#080C12] border-2 border-[#1E2837] flex flex-col items-center justify-center gap-5 text-center relative overflow-hidden">
                {/* Visual Glow */}
                <div
                  className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
                    isRecording ? 'bg-rose-600/10' : 'bg-transparent'
                  }`}
                />

                {/* Status Ring & Mic Icon */}
                <div className="relative">
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isRecording
                        ? 'bg-rose-500 text-white shadow-[0_0_40px_rgba(244,63,94,0.6)] animate-pulse'
                        : recordedAudioUrl
                        ? 'bg-[#00FF66]/20 border-2 border-[#00FF66] text-[#00FF66]'
                        : 'bg-[#131923] border-2 border-[#263548] text-[#8C9BAE]'
                    }`}
                  >
                    <Mic className="w-10 h-10" />
                  </div>

                  {isRecording && (
                    <span className="absolute -top-1 -right-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[9px] font-black uppercase animate-bounce">
                      RECORDING
                    </span>
                  )}
                </div>

                {/* Timer & State Display */}
                <div>
                  <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-widest">
                    {formatTimer(recordingSeconds)}
                  </div>
                  <p className="text-xs font-mono text-[#8C9BAE] mt-1">
                    {isRecording
                      ? 'Speaking live into microphone... Tap "Stop" when done.'
                      : recordedAudioUrl
                      ? 'Recording complete! Listen to preview below and click "Save Voice".'
                      : 'Ready to record your authentic founder address for Chapter ' + defaultChapter.chapterNumber}
                  </p>
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.4)] active:scale-95 transition-all cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                      <span>{recordedAudioUrl ? 'Record Again (New Take)' : 'Start Recording Voice'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="px-6 py-3 rounded-xl bg-[#00FF66] hover:bg-[#00E55C] text-[#0A0A0A] font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(0,255,102,0.5)] active:scale-95 transition-all cursor-pointer"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>Stop &amp; Review Recording</span>
                    </button>
                  )}

                  {recordedAudioUrl && !isRecording && (
                    <>
                      <button
                        onClick={() => togglePreviewAudio(recordedAudioUrl)}
                        className="px-4 py-3 rounded-xl bg-[#182230] hover:bg-[#202E42] border border-[#2D3E54] text-white font-mono font-bold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer"
                      >
                        {isPreviewPlaying ? (
                          <>
                            <Pause className="w-4 h-4 text-[#00FF66]" />
                            <span>Pause Preview</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 text-[#00FF66]" />
                            <span>Listen to Take</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleSaveRecordedVoice}
                        disabled={isProcessingAudio}
                        className="px-5 py-3 rounded-xl bg-[#FFD700] hover:bg-[#E6C200] text-[#0A0A0A] font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.35)] active:scale-95 transition-all cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isProcessingAudio ? 'Saving...' : 'Save Voice As Official'}</span>
                      </button>

                      <button
                        onClick={handleDiscardRecording}
                        className="p-3 rounded-xl bg-[#141A24] hover:bg-[#1E2736] border border-[#263548] text-[#8C9BAE] hover:text-rose-400 transition-colors"
                        title="Discard take"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Teleprompter Teleprompter Guide while recording */}
                <div className="w-full max-w-2xl mt-4 p-4 rounded-xl bg-[#05070B] border border-[#18212D] text-left">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8C9BAE] uppercase mb-2">
                    <span className="flex items-center gap-1 font-bold text-[#FFD700]">
                      <FileAudio className="w-3.5 h-3.5" />
                      TELEPROMPTER SCRIPT REFERENCE:
                    </span>
                    <span>{wordCount} words</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#D6DEE7] font-sans leading-relaxed max-h-36 overflow-y-auto">
                    {scriptText}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD AUDIO FILE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-[#080C12] border-2 border-dashed border-[#243144] hover:border-[#FFD700] flex flex-col items-center justify-center gap-4 text-center transition-all">
                <div className="w-16 h-16 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white uppercase">
                    Upload Recorded Voice File
                  </h4>
                  <p className="text-xs text-[#8C9BAE] max-w-md mt-1">
                    Recorded your voice on your iPhone Voice Memos, Android, or studio microphone? Upload your audio file directly.
                  </p>
                  <p className="text-[10px] font-mono text-[#FFD700] mt-1">
                    Supports .mp3, .wav, .m4a, .webm, .ogg, .aac (up to 50MB)
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingAudio}
                  className="px-5 py-2.5 rounded-xl bg-[#FFD700] hover:bg-[#E6C200] text-[#0A0A0A] font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <FileAudio className="w-4 h-4" />
                  <span>{isProcessingAudio ? 'Processing...' : 'Browse Audio Files'}</span>
                </button>
              </div>

              {savedRecording?.source === 'FILE_UPLOAD' && savedAudioUrl && (
                <div className="p-4 rounded-xl bg-[#0B1017] border border-[#1E2837] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00FF66]/15 text-[#00FF66] flex items-center justify-center">
                      <FileAudio className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-white block">
                        {savedRecording.fileName || 'Uploaded Voice File'}
                      </span>
                      <span className="text-[10px] font-mono text-[#8C9BAE]">
                        {Math.round(savedRecording.sizeBytes / 1024)} KB &bull; Saved for Chapter {defaultChapter.chapterNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePreviewAudio(savedAudioUrl)}
                      className="px-3 py-1.5 rounded-lg bg-[#141B26] hover:bg-[#1C2636] text-xs font-mono font-bold text-white flex items-center gap-1.5"
                    >
                      {isPreviewPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPreviewPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                    <button
                      onClick={handleDeleteSavedRecording}
                      className="p-2 rounded-lg bg-[#141B26] hover:bg-rose-950/60 text-[#8C9BAE] hover:text-rose-400"
                      title="Remove uploaded recording"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE RECORDING STATUS FOOTER */}
          <div className="p-4 rounded-xl bg-[#090D14] border border-[#1C2534] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  savedRecording ? 'bg-[#00FF66] animate-pulse' : 'bg-amber-400'
                }`}
              />
              <div>
                <span className="text-xs font-mono font-bold text-white block">
                  {savedRecording
                    ? `Authentic Voice Active: Recorded by Jeremiah Morris (${savedRecording.source === 'MIC_RECORDING' ? 'Live Mic' : 'Audio File'})`
                    : 'Current Audio Source: Standard AI Speech Synthesis (No custom recording saved yet)'}
                </span>
                <span className="text-[10px] font-mono text-[#7C8799]">
                  {savedRecording
                    ? `Recorded on ${new Date(savedRecording.recordedAt).toLocaleDateString()} &bull; Duration: ${formatTimer(savedRecording.durationSeconds || 0)}`
                    : 'Record your voice above to replace synthesis with your actual voice recording.'}
                </span>
              </div>
            </div>

            {savedRecording && savedAudioUrl && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePreviewAudio(savedAudioUrl)}
                  className="px-3 py-1.5 rounded-lg bg-[#151D2A] hover:bg-[#1E293B] border border-[#27354A] text-xs font-mono font-bold text-[#FFD700] flex items-center gap-1.5 cursor-pointer"
                >
                  {isPreviewPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Play Saved Audio</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDeleteSavedRecording}
                  className="p-1.5 rounded-lg bg-[#151D2A] hover:bg-rose-950/60 border border-[#27354A] text-[#8C9BAE] hover:text-rose-400 cursor-pointer"
                  title="Delete recording and return to AI synthesis"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-[#1E2635] bg-[#090D14] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#8C9BAE]">
            TRUCKWITHEASE &bull; Built For The Driver &amp; Fleet Owner
          </span>

          <button
            onClick={() => {
              stopRecording();
              stopPreviewAudio();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-[#161F2C] hover:bg-[#202C3E] border border-[#2A3B52] text-xs font-mono font-bold text-white transition-colors cursor-pointer"
          >
            Done &bull; Return to App
          </button>
        </div>
      </div>
    </div>
  );
};
