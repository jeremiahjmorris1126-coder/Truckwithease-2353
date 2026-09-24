import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Image as ImageIcon,
  Wand2,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Download,
  Upload,
  Radio,
  FileAudio,
  ShieldCheck,
  AlertCircle,
  Truck,
  ExternalLink,
  Layers,
  Sliders,
  ZoomIn,
  X,
  Volume2,
  FileText,
  Clock,
  Cpu
} from 'lucide-react';
import { TabType } from '../types';

interface AiStudioViewProps {
  onNavigateToTab?: (tab: TabType) => void;
  onSendToDvir?: (textOrPhoto: { text?: string; photoUrl?: string }) => void;
}

interface AudioHistoryItem {
  id: string;
  timestamp: string;
  durationSec: number;
  mode: string;
  transcription: string;
  model: string;
}

interface ImageHistoryItem {
  id: string;
  timestamp: string;
  type: 'CREATED' | 'EDITED';
  prompt: string;
  imageUrl: string;
  originalImageUrl?: string;
  aspectRatio: string;
  model: string;
}

const TRANSCRIPTION_PRESETS = [
  {
    id: 'verbatim',
    label: '🎙️ Verbatim Voice',
    prompt: 'Transcribe this in-cab driver voice verbatim. Capture exact phrasing, vehicle numbers, mile markers, and highway names without adding commentary.',
  },
  {
    id: 'dvir',
    label: '📋 DVIR Defect Dictation',
    prompt: 'Transcribe and format this driver vehicle inspection audio as a structured DVIR defect record (Component, Observed Defect Condition, DOT Zone, Severity).',
  },
  {
    id: 'dispatch',
    label: '📝 Dispatch In-Cab Log',
    prompt: 'Transcribe this driver voice update into a concise, professional dispatch message ready for fleet tracking (status, current location, ETA, load notes).',
  },
  {
    id: 'freight',
    label: '📦 BOL & Pallet Notes',
    prompt: 'Transcribe these bill of lading and cargo notes, emphasizing piece counts, seal numbers, reefer temperature setpoints, and damage notations.',
  },
  {
    id: 'breakdown',
    label: '🚨 Roadside Breakdown Report',
    prompt: 'Transcribe this driver breakdown call into an emergency roadside assistance dispatch ticket with exact highway coordinates, symptom description, and safety status.',
  },
];

const CREATIVE_IMAGE_PRESETS = [
  {
    title: 'Fleet Livery Mockup',
    prompt: 'A brand new 2026 Freightliner Cascadia semi-truck in sleek electric yellow and dark graphite carbon livery with TRUCKWITHEASE lettering, parked at a modern logistics terminal at golden hour, photorealistic, 8k resolution, cinematic lighting.',
  },
  {
    title: 'Tactical Winter Highway',
    prompt: 'A heavy-duty class 8 Peterbilt 579 tractor trailer with tire chains navigating a snowy mountain pass on I-80 Donner Pass, amber LED clearance lights glowing through the snowstorm, highly detailed, realistic truck photography.',
  },
  {
    title: 'Reefer Trailer Cargo Interior',
    prompt: 'Interior perspective of a 53-foot refrigerated trailer cleanly loaded with 26 shrink-wrapped pallets, heavy-duty ratchet load lock bars secured, digital wireless temperature sensor nodes visible, pristine industrial lighting.',
  },
  {
    title: 'Air Brake Chamber Schematic',
    prompt: 'High-detail technical engineering cutaway illustration of a commercial semi-truck type 30/30 spring brake chamber, showing diaphragm, return spring, pushrod, and slack adjuster, labeled components on dark blueprint background.',
  },
];

const EDIT_PROMPT_PRESETS = [
  'Add glowing electric yellow TRUCKWITHEASE fleet logo decals on the driver and passenger doors',
  'Change the background environment to a heavy Rocky Mountains winter snowstorm with headlights beaming',
  'Add amber LED emergency flasher beacons on the cab roof fairing and highlight the steer tires',
  'Add heavy-duty snow chains on all drive tandem tires and wet road reflections',
];

export const AiStudioView: React.FC<AiStudioViewProps> = ({
  onNavigateToTab,
  onSendToDvir,
}) => {
  const [activeStudioTab, setActiveStudioTab] = useState<'transcribe' | 'images'>('transcribe');

  // ==========================================
  // AUDIO TRANSCRIBER STATE (gemini-3.5-transcribe)
  // ==========================================
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string>('audio/webm');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('verbatim');
  const [customAudioPrompt, setCustomAudioPrompt] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string>('');
  const [audioError, setAudioError] = useState<string | null>(null);
  const [copiedTranscription, setCopiedTranscription] = useState<boolean>(false);
  const [audioHistory, setAudioHistory] = useState<AudioHistoryItem[]>([]);

  // Audio Recording & Visualizer Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // ==========================================
  // IMAGE STUDIO STATE (gemini-3.1-flash-image-preview)
  // ==========================================
  const [imageSubMode, setImageSubMode] = useState<'create' | 'edit'>('create');
  const [createPrompt, setCreatePrompt] = useState<string>(CREATIVE_IMAGE_PRESETS[0].prompt);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [imageSize, setImageSize] = useState<string>('1K');
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Edit Image State
  const [sourceImageForEdit, setSourceImageForEdit] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState<string>('Add electric yellow TRUCKWITHEASE decals on the truck door');
  const [isEditingImage, setIsEditingImage] = useState<boolean>(false);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [imageHistory, setImageHistory] = useState<ImageHistoryItem[]>([]);

  // Lightbox Modal
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, []);

  const stopRecordingCleanup = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  // ==========================================
  // AUDIO RECORDING ENGINE (MICROPHONE)
  // ==========================================
  const startRecording = async () => {
    setAudioError(null);
    setTranscriptionResult('');
    setRecordedAudioBlob(null);
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone capture is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      // Setup Web Audio Analyser for live visualizer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const sourceNode = audioCtx.createMediaStreamSource(stream);
      sourceNode.connect(analyser);

      drawVisualizer();

      // Determine supported mimeType
      let mime = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mime = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mime = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mime = 'audio/ogg';
      }
      setAudioMimeType(mime);

      const mediaRecorder = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mime });
        setRecordedAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
      };

      mediaRecorder.start(250); // Slice every 250ms
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setAudioError(err?.message || 'Failed to access microphone. Please check browser permissions.');
      stopRecordingCleanup();
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    stopRecordingCleanup();
  };

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;

        // Glowing electric yellow bar
        ctx.fillStyle = '#FFE600';
        ctx.shadowColor = '#FFE600';
        ctx.shadowBlur = 8;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }
    };

    renderFrame();
  };

  // ==========================================
  // AUDIO FILE UPLOAD HANDLER
  // ==========================================
  const handleAudioFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAudioError(null);
    setRecordedAudioBlob(file);
    setAudioMimeType(file.type || 'audio/webm');
    const url = URL.createObjectURL(file);
    setRecordedAudioUrl(url);
    setRecordingSeconds(0);
  };

  // ==========================================
  // SEND TO GEMINI 3.5 TRANSCRIBE
  // ==========================================
  const handleTranscribeAudio = async () => {
    if (!recordedAudioBlob) {
      setAudioError('Please record audio with your microphone or upload an audio file first.');
      return;
    }

    setIsTranscribing(true);
    setAudioError(null);

    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(recordedAudioBlob);

      reader.onloadend = async () => {
        const base64data = reader.result as string;

        const currentPreset = TRANSCRIPTION_PRESETS.find((p) => p.id === selectedPresetId);
        const finalPrompt = customAudioPrompt.trim()
          ? customAudioPrompt.trim()
          : currentPreset?.prompt || 'Transcribe this audio verbatim.';

        const response = await fetch('/api/gemini/transcribe-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64data,
            mimeType: audioMimeType,
            prompt: finalPrompt,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Audio transcription failed on server.');
        }

        const transcriptionText = data.transcription || 'No speech detected in audio.';
        setTranscriptionResult(transcriptionText);

        // Add to audio history
        const historyEntry: AudioHistoryItem = {
          id: `audio-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          durationSec: recordingSeconds,
          mode: currentPreset?.label || 'Custom',
          transcription: transcriptionText,
          model: 'gemini-3.5-transcribe',
        };
        setAudioHistory((prev) => [historyEntry, ...prev.slice(0, 9)]);
      };

      reader.onerror = () => {
        throw new Error('Failed to read audio data as base64.');
      };
    } catch (err: any) {
      console.error('Transcription execution error:', err);
      setAudioError(err?.message || 'Audio transcription error.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopyTranscription = () => {
    if (!transcriptionResult) return;
    navigator.clipboard.writeText(transcriptionResult);
    setCopiedTranscription(true);
    setTimeout(() => setCopiedTranscription(false), 2000);
  };

  // ==========================================
  // IMAGE GENERATION (gemini-3.1-flash-image-preview)
  // ==========================================
  const handleGenerateImage = async () => {
    if (!createPrompt.trim()) {
      setImageError('Please enter a prompt to generate an image.');
      return;
    }

    setIsGeneratingImage(true);
    setImageError(null);

    try {
      const response = await fetch('/api/gemini/create-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: createPrompt.trim(),
          aspectRatio,
          imageSize,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Image creation failed on server.');
      }

      setGeneratedImageUrl(data.imageUrl);

      const historyItem: ImageHistoryItem = {
        id: `img-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'CREATED',
        prompt: createPrompt,
        imageUrl: data.imageUrl,
        aspectRatio,
        model: 'gemini-3.1-flash-image-preview',
      };
      setImageHistory((prev) => [historyItem, ...prev.slice(0, 9)]);
    } catch (err: any) {
      console.error('Image generation error:', err);
      setImageError(err?.message || 'Failed to generate image.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // ==========================================
  // IMAGE EDITING (gemini-3.1-flash-image-preview)
  // ==========================================
  const handleEditImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setSourceImageForEdit(e.target?.result as string);
      setEditedImageUrl(null);
      setImageError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyImageEdit = async () => {
    if (!sourceImageForEdit) {
      setImageError('Please select or upload an image to edit.');
      return;
    }
    if (!editPrompt.trim()) {
      setImageError('Please enter edit instructions prompt.');
      return;
    }

    setIsEditingImage(true);
    setImageError(null);

    try {
      const response = await fetch('/api/gemini/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: editPrompt.trim(),
          base64ImageData: sourceImageForEdit,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Image editing failed on server.');
      }

      setEditedImageUrl(data.imageUrl);

      const historyItem: ImageHistoryItem = {
        id: `img-edit-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'EDITED',
        prompt: editPrompt,
        imageUrl: data.imageUrl,
        originalImageUrl: sourceImageForEdit,
        aspectRatio: '1:1',
        model: 'gemini-3.1-flash-image-preview',
      };
      setImageHistory((prev) => [historyItem, ...prev.slice(0, 9)]);
    } catch (err: any) {
      console.error('Image edit error:', err);
      setImageError(err?.message || 'Failed to edit image.');
    } finally {
      setIsEditingImage(false);
    }
  };

  // Format seconds to mm:ss
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="ai-studio-view" className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase bg-[#FFE600] text-black shadow-[0_0_12px_rgba(255,230,0,0.35)]">
              <Sparkles className="w-3 h-3 fill-black" />
              AI Creative & Voice Studio
            </span>
            <span className="text-xs font-mono text-zinc-400">
              gemini-3.5-transcribe • gemini-3.1-flash-image-preview
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            In-Cab Voice Transcriber & Visual Studio
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5 max-w-2xl">
            Live microphone transcription for in-cab dictation, DVIR defect logging, and instant text-prompted commercial fleet image creation & editing.
          </p>
        </div>

        {/* Workspace Mode Switcher */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl shadow-inner">
          <button
            id="btn-tab-transcribe"
            type="button"
            onClick={() => setActiveStudioTab('transcribe')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeStudioTab === 'transcribe'
                ? 'bg-[#FFE600] text-black shadow-[0_0_15px_rgba(255,230,0,0.35)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            Voice Transcriber (3.5)
          </button>
          <button
            id="btn-tab-images"
            type="button"
            onClick={() => setActiveStudioTab('images')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeStudioTab === 'images'
                ? 'bg-[#FFE600] text-black shadow-[0_0_15px_rgba(255,230,0,0.35)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Image Studio (3.1 Flash)
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 🎙️ TAB 1: AUDIO TRANSCRIBER WORKSPACE (gemini-3.5-transcribe)       */}
      {/* =================================================================== */}
      {activeStudioTab === 'transcribe' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Microphone Control & Audio Capture (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-[#FFE600]'}`} />
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">
                    Microphone Voice Capture
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Model: gemini-3.5-transcribe
                  </span>
                </div>
              </div>

              {/* Live Audio Visualizer Canvas & Status Display */}
              <div className="relative bg-black/80 border border-zinc-800/80 rounded-xl p-4 flex flex-col items-center justify-center min-h-[160px] overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={90}
                  className="w-full max-w-sm h-[90px] mb-2"
                />

                {/* Big Recording Timer */}
                <div className="text-center space-y-1">
                  <span className="font-mono text-3xl sm:text-4xl font-black text-white tracking-widest">
                    {formatTimer(recordingSeconds)}
                  </span>
                  <p className="text-xs font-medium text-zinc-400">
                    {isRecording
                      ? '🔴 Recording active from in-cab microphone...'
                      : recordedAudioBlob
                      ? '✅ Audio captured and ready to transcribe'
                      : 'Press Start Recording to capture voice dictation'}
                  </p>
                </div>
              </div>

              {/* Recording Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {!isRecording ? (
                  <button
                    id="btn-start-recording"
                    type="button"
                    onClick={startRecording}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider bg-[#FFE600] text-black hover:bg-[#FFE600]/90 transition-all shadow-[0_0_20px_rgba(255,230,0,0.35)]"
                  >
                    <Mic className="w-5 h-5 fill-black" />
                    Start Mic Recording
                  </button>
                ) : (
                  <button
                    id="btn-stop-recording"
                    type="button"
                    onClick={stopRecording}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider bg-red-600 text-white hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                  >
                    <MicOff className="w-5 h-5" />
                    Stop Recording
                  </button>
                )}

                {/* File Upload Alternative */}
                <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-[#FFE600]" />
                  Upload Audio File
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg"
                    onChange={handleAudioFileUpload}
                    className="hidden"
                  />
                </label>

                {recordedAudioBlob && !isRecording && (
                  <button
                    type="button"
                    onClick={() => {
                      setRecordedAudioBlob(null);
                      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
                      setRecordedAudioUrl(null);
                      setRecordingSeconds(0);
                    }}
                    className="p-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 transition-colors"
                    title="Reset Audio"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Audio Playback Player if audio is recorded */}
              {recordedAudioUrl && (
                <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-[#FFE600] shrink-0" />
                  <audio
                    src={recordedAudioUrl}
                    controls
                    className="w-full h-8 accent-[#FFE600] [&::-webkit-media-controls-panel]:bg-zinc-900"
                  />
                </div>
              )}

              {/* Transcription Domain Prompt Presets */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                  Transcription Context & Preset Prompt
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TRANSCRIPTION_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedPresetId(preset.id);
                        setCustomAudioPrompt(preset.prompt);
                      }}
                      className={`text-left p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                        selectedPresetId === preset.id
                          ? 'bg-[#FFE600]/10 border-[#FFE600] text-white shadow-[0_0_10px_rgba(255,230,0,0.15)]'
                          : 'bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="truncate">{preset.label}</div>
                    </button>
                  ))}
                </div>

                {/* Custom Prompt Override */}
                <div className="mt-2">
                  <input
                    type="text"
                    value={customAudioPrompt}
                    onChange={(e) => setCustomAudioPrompt(e.target.value)}
                    placeholder="Custom instruction prompt for gemini-3.5-transcribe..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFE600]"
                  />
                </div>
              </div>

              {/* Action Button: Trigger Server-Side Transcription */}
              <button
                id="btn-run-transcription"
                type="button"
                onClick={handleTranscribeAudio}
                disabled={!recordedAudioBlob || isRecording || isTranscribing}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${
                  !recordedAudioBlob || isRecording || isTranscribing
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                    : 'bg-[#FFE600] text-black hover:bg-[#FFE600]/90 shadow-[0_0_20px_rgba(255,230,0,0.35)]'
                }`}
              >
                {isTranscribing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Transcribing with gemini-3.5-transcribe...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-black" />
                    Transcribe with gemini-3.5-transcribe
                  </>
                )}
              </button>

              {audioError && (
                <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>{audioError}</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Transcription Output & Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col h-full min-h-[440px]">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FFE600]" />
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">
                    Transcribed Output
                  </h2>
                </div>
                {transcriptionResult && (
                  <button
                    type="button"
                    onClick={handleCopyTranscription}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition-colors"
                  >
                    {copiedTranscription ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        Copy Text
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Output Display Box */}
              <div className="flex-1 bg-black/60 border border-zinc-800 rounded-xl p-4 overflow-y-auto max-h-[300px]">
                {transcriptionResult ? (
                  <div className="space-y-3">
                    <p className="text-sm text-zinc-100 whitespace-pre-wrap leading-relaxed font-sans">
                      {transcriptionResult}
                    </p>
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                      <span>Chars: {transcriptionResult.length}</span>
                      <span>Words: {transcriptionResult.split(/\s+/).filter(Boolean).length}</span>
                      <span className="text-[#FFE600]">gemini-3.5-transcribe</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-2">
                    <Mic className="w-8 h-8 opacity-30 text-[#FFE600]" />
                    <p className="text-xs">No transcription yet.</p>
                    <p className="text-[11px] text-zinc-600 max-w-xs">
                      Speak into your microphone or upload audio to receive fast, verbatim speech-to-text.
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Downstream Actions for Trucking Operations */}
              {transcriptionResult && (
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                    One-Click Downstream Dispatch Actions:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {onNavigateToTab && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onSendToDvir) {
                            onSendToDvir({ text: transcriptionResult });
                          }
                          onNavigateToTab('dvir-agent');
                        }}
                        className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#FFE600]" />
                        Insert into DVIR Defect
                      </button>
                    )}
                    {onNavigateToTab && (
                      <button
                        type="button"
                        onClick={() => onNavigateToTab('messaging')}
                        className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#FFE600]" />
                        Send to Dispatch Chat
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Recent Audio Session Ledger */}
              {audioHistory.length > 0 && (
                <div className="pt-2 border-t border-zinc-800 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                    <span>Recent Session Recordings</span>
                    <span className="text-zinc-500 font-mono">{audioHistory.length} saved</span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {audioHistory.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setTranscriptionResult(item.transcription)}
                        className="p-2 rounded-lg bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800/70 text-xs cursor-pointer transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-zinc-500">
                          <span className="font-semibold text-zinc-300">{item.mode}</span>
                          <span>{item.timestamp}</span>
                        </div>
                        <p className="text-zinc-400 truncate text-[11px]">{item.transcription}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 🎨 TAB 2: VISUAL IMAGE STUDIO (gemini-3.1-flash-image-preview)       */}
      {/* =================================================================== */}
      {activeStudioTab === 'images' && (
        <div className="space-y-6">
          {/* Create vs Edit Sub-Mode Header */}
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-2 rounded-2xl">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setImageSubMode('create')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  imageSubMode === 'create'
                    ? 'bg-[#FFE600] text-black shadow-[0_0_12px_rgba(255,230,0,0.3)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                Text-to-Image Creation
              </button>
              <button
                type="button"
                onClick={() => setImageSubMode('edit')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  imageSubMode === 'edit'
                    ? 'bg-[#FFE600] text-black shadow-[0_0_12px_rgba(255,230,0,0.3)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Image Prompt Editing
              </button>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400 px-3">
              <Sparkles className="w-3.5 h-3.5 text-[#FFE600]" />
              Model: gemini-3.1-flash-image-preview
            </div>
          </div>

          {/* SUB-MODE 1: CREATE IMAGE */}
          {imageSubMode === 'create' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Prompt & Config Controls (6 cols) */}
              <div className="lg:col-span-6 space-y-5">
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-[#FFE600]" />
                      Text Prompt Generator
                    </h2>
                    <span className="text-xs text-zinc-400 font-mono">gemini-3.1-flash-image-preview</span>
                  </div>

                  {/* Main Prompt Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                      Image Description / Prompt:
                    </label>
                    <textarea
                      rows={4}
                      value={createPrompt}
                      onChange={(e) => setCreatePrompt(e.target.value)}
                      placeholder="Describe the truck, fleet vehicle, navigation map, or component you want to create..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFE600] leading-relaxed resize-none"
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                      Trucking Fleet Templates:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {CREATIVE_IMAGE_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCreatePrompt(preset.prompt)}
                          className="text-left p-2.5 rounded-lg bg-zinc-950/70 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition-all truncate"
                          title={preset.prompt}
                        >
                          <span className="font-semibold text-white block truncate">{preset.title}</span>
                          <span className="text-zinc-500 text-[10px] block truncate">{preset.prompt}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aspect Ratio & Resolution Options */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                        Aspect Ratio
                      </label>
                      <select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FFE600]"
                      >
                        <option value="1:1">1:1 (Square - Feed / Social)</option>
                        <option value="16:9">16:9 (Landscape - In-Cab Display)</option>
                        <option value="9:16">9:16 (Portrait - Mobile HUD)</option>
                        <option value="4:3">4:3 (Standard Photo)</option>
                        <option value="3:4">3:4 (Document Format)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                        Resolution Tier
                      </label>
                      <select
                        value={imageSize}
                        onChange={(e) => setImageSize(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FFE600]"
                      >
                        <option value="1K">1K High Definition (Recommended)</option>
                        <option value="512px">512px Rapid Preview</option>
                      </select>
                    </div>
                  </div>

                  {/* Create Button */}
                  <button
                    id="btn-generate-image"
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !createPrompt.trim()}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${
                      isGeneratingImage || !createPrompt.trim()
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                        : 'bg-[#FFE600] text-black hover:bg-[#FFE600]/90 shadow-[0_0_20px_rgba(255,230,0,0.35)]'
                    }`}
                  >
                    {isGeneratingImage ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Generating image with gemini-3.1-flash-image-preview...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-black" />
                        Create Image (gemini-3.1-flash-image-preview)
                      </>
                    )}
                  </button>

                  {imageError && (
                    <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>{imageError}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Generated Image Result Display (6 cols) */}
              <div className="lg:col-span-6 space-y-5">
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col min-h-[460px]">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                    <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#FFE600]" />
                      Render Preview
                    </h2>
                    {generatedImageUrl && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setLightboxImageUrl(generatedImageUrl)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                          title="Full Screen Zoom"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        <a
                          href={generatedImageUrl}
                          download={`truckwithease-image-${Date.now()}.png`}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                          title="Download PNG"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Image Viewport */}
                  <div className="flex-1 bg-black/80 border border-zinc-800/80 rounded-xl overflow-hidden flex items-center justify-center relative min-h-[300px]">
                    {generatedImageUrl ? (
                      <img
                        src={generatedImageUrl}
                        alt="Generated preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain max-h-[400px] rounded-lg"
                      />
                    ) : (
                      <div className="text-center p-8 text-zinc-500 space-y-2">
                        <ImageIcon className="w-12 h-12 mx-auto opacity-30 text-[#FFE600]" />
                        <p className="text-sm font-semibold text-zinc-400">No Image Rendered Yet</p>
                        <p className="text-xs text-zinc-600 max-w-sm">
                          Enter your prompt and click Generate to run gemini-3.1-flash-image-preview.
                        </p>
                      </div>
                    )}

                    {isGeneratingImage && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 z-10">
                        <div className="w-10 h-10 border-4 border-[#FFE600] border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-bold text-white uppercase tracking-wider">
                          Synthesizing image with gemini-3.1-flash-image-preview...
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick Action: Send to Image Editor */}
                  {generatedImageUrl && (
                    <div className="flex items-center gap-3 pt-4 border-t border-zinc-800 mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSourceImageForEdit(generatedImageUrl);
                          setImageSubMode('edit');
                        }}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-zinc-700 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Sliders className="w-3.5 h-3.5 text-[#FFE600]" />
                        Edit This Image With Text Prompts
                      </button>
                      {onSendToDvir && (
                        <button
                          type="button"
                          onClick={() => {
                            onSendToDvir({ photoUrl: generatedImageUrl });
                            if (onNavigateToTab) onNavigateToTab('dvir-agent');
                          }}
                          className="py-2.5 px-4 rounded-xl bg-[#FFE600]/10 hover:bg-[#FFE600]/20 text-xs font-bold text-[#FFE600] border border-[#FFE600]/40 flex items-center justify-center gap-2 transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Attach to DVIR
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SUB-MODE 2: EDIT EXISTING IMAGE */}
          {imageSubMode === 'edit' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls and Original Image (6 cols) */}
              <div className="lg:col-span-6 space-y-5">
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#FFE600]" />
                      Prompt-Guided Image Editor
                    </h2>
                    <span className="text-xs text-zinc-400 font-mono">gemini-3.1-flash-image-preview</span>
                  </div>

                  {/* Image Input Source */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                      Source Image to Modify:
                    </label>

                    {sourceImageForEdit ? (
                      <div className="relative bg-black/60 border border-zinc-800 rounded-xl p-2 flex items-center justify-center max-h-48 overflow-hidden group">
                        <img
                          src={sourceImageForEdit}
                          alt="Source for editing"
                          referrerPolicy="no-referrer"
                          className="max-h-44 object-contain rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setSourceImageForEdit(null)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-500 shadow-md transition-colors"
                          title="Remove source image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-zinc-800 hover:border-[#FFE600]/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-950/60">
                        <Upload className="w-8 h-8 text-[#FFE600] mb-2" />
                        <span className="text-xs font-bold text-white">Upload image to edit</span>
                        <span className="text-[11px] text-zinc-500 mt-1">PNG, JPG, or WEBP up to 50MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Edit Instructions Prompt */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                      Edit Instructions Prompt:
                    </label>
                    <textarea
                      rows={3}
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="e.g. Add company logo decals on the doors, make it nighttime with rain, highlight the tire tread..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFE600] leading-relaxed resize-none"
                    />
                  </div>

                  {/* Preset Edit Chips */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                      Quick Fleet Edit Directives:
                    </label>
                    <div className="space-y-1.5">
                      {EDIT_PROMPT_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditPrompt(preset)}
                          className="w-full text-left p-2 rounded-lg bg-zinc-950/70 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition-all truncate"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Run Edit Button */}
                  <button
                    id="btn-apply-image-edit"
                    type="button"
                    onClick={handleApplyImageEdit}
                    disabled={isEditingImage || !sourceImageForEdit || !editPrompt.trim()}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${
                      isEditingImage || !sourceImageForEdit || !editPrompt.trim()
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                        : 'bg-[#FFE600] text-black hover:bg-[#FFE600]/90 shadow-[0_0_20px_rgba(255,230,0,0.35)]'
                    }`}
                  >
                    {isEditingImage ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Editing image with gemini-3.1-flash-image-preview...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-black" />
                        Apply Edits (gemini-3.1-flash-image-preview)
                      </>
                    )}
                  </button>

                  {imageError && (
                    <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>{imageError}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Edited Image Result (6 cols) */}
              <div className="lg:col-span-6 space-y-5">
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col min-h-[460px]">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                    <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FFE600]" />
                      Edited Image Output
                    </h2>
                    {editedImageUrl && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setLightboxImageUrl(editedImageUrl)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                          title="Full Screen Zoom"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        <a
                          href={editedImageUrl}
                          download={`truckwithease-edited-${Date.now()}.png`}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                          title="Download PNG"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 bg-black/80 border border-zinc-800/80 rounded-xl overflow-hidden flex items-center justify-center relative min-h-[300px]">
                    {editedImageUrl ? (
                      <img
                        src={editedImageUrl}
                        alt="Edited result"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain max-h-[400px] rounded-lg"
                      />
                    ) : (
                      <div className="text-center p-8 text-zinc-500 space-y-2">
                        <Sliders className="w-12 h-12 mx-auto opacity-30 text-[#FFE600]" />
                        <p className="text-sm font-semibold text-zinc-400">Awaiting Edit Execution</p>
                        <p className="text-xs text-zinc-600 max-w-sm">
                          Select an image, enter your prompt instructions, and click Apply Edits.
                        </p>
                      </div>
                    )}

                    {isEditingImage && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 z-10">
                        <div className="w-10 h-10 border-4 border-[#FFE600] border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-bold text-white uppercase tracking-wider">
                          Modifying image with gemini-3.1-flash-image-preview...
                        </p>
                      </div>
                    )}
                  </div>

                  {editedImageUrl && (
                    <div className="flex items-center gap-3 pt-4 border-t border-zinc-800 mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSourceImageForEdit(editedImageUrl);
                          setEditedImageUrl(null);
                        }}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-zinc-700 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Sliders className="w-3.5 h-3.5 text-[#FFE600]" />
                        Apply Another Edit on This Output
                      </button>
                      {onSendToDvir && (
                        <button
                          type="button"
                          onClick={() => {
                            onSendToDvir({ photoUrl: editedImageUrl });
                            if (onNavigateToTab) onNavigateToTab('dvir-agent');
                          }}
                          className="py-2.5 px-4 rounded-xl bg-[#FFE600]/10 hover:bg-[#FFE600]/20 text-xs font-bold text-[#FFE600] border border-[#FFE600]/40 flex items-center justify-center gap-2 transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Attach to DVIR
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Recent Image Gallery Ledger */}
          {imageHistory.length > 0 && (
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#FFE600]" />
                  Session Image History ({imageHistory.length})
                </h3>
                <span className="text-xs text-zinc-500 font-mono">gemini-3.1-flash-image-preview</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {imageHistory.map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden cursor-pointer hover:border-[#FFE600] transition-colors"
                    onClick={() => setLightboxImageUrl(item.imageUrl)}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.prompt}
                      referrerPolicy="no-referrer"
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="font-bold text-[#FFE600]">{item.type}</span>
                        <span>{item.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 truncate" title={item.prompt}>
                        {item.prompt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Full-Screen Modal */}
      {lightboxImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightboxImageUrl(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setLightboxImageUrl(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImageUrl}
              alt="Full-size view"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[85vh] object-contain rounded-xl border border-zinc-800 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
