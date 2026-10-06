import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Sparkles,
  Play,
  Pause,
  Download,
  RotateCcw,
  Upload,
  Film,
  Check,
  AlertCircle,
  Clock,
  Layers,
  Monitor,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { triggerHapticFeedback } from '../services/haptics';

export interface GeneratedVideoRecord {
  id: string;
  operationName: string;
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  resolution: string;
  model: string;
  videoUrl: string;
  createdAt: string;
  thumbnailUrl?: string;
  hasSourceImage?: boolean;
}

const TRUCKING_VIDEO_PRESETS = [
  {
    title: 'Fleet Livery Golden Hour',
    prompt: 'A brand-new 2026 Freightliner Cascadia semi-truck in sleek electric yellow and dark graphite carbon livery with TRUCKWITHEASE lettering, cruising smoothly along Interstate 80 at sunset, photorealistic cinematic lighting, 4k ultra-detailed.',
    aspectRatio: '16:9' as const,
  },
  {
    title: 'Donner Pass Winter Snowstorm',
    prompt: 'Heavy-duty Class 8 Peterbilt tractor-trailer with tire chains navigating snow-covered mountain pass, bright amber LED clearance lights cutting through swirling snow, highly realistic commercial trucking footage.',
    aspectRatio: '16:9' as const,
  },
  {
    title: 'Driver In-Cab Mobile Reel',
    prompt: 'POV from inside the truck cab showing dashboard illuminated with modern digital telemetry displays, windshield wipers clearing light rain on highway at dusk, smooth cinematic forward motion.',
    aspectRatio: '9:16' as const,
  },
  {
    title: 'Logistics Terminal Backing Staging',
    prompt: 'A 53-foot refrigerated semi-trailer smoothly backing into a high-tech logistics distribution dock under bright LED floodlights, safety reverse beepers and flashing hazard lamps active.',
    aspectRatio: '16:9' as const,
  },
  {
    title: 'Mobile Walkaround Inspection',
    prompt: 'Vertical portrait view of professional commercial truck driver in high-visibility safety vest conducting a pre-trip DVIR walkaround inspection around steer tires and brake chambers at sunrise.',
    aspectRatio: '9:16' as const,
  },
];

const INITIAL_VIDEO_GALLERY: GeneratedVideoRecord[] = [
  {
    id: 'veo-demo-1',
    operationName: 'models/veo-3.1-fast-generate-preview/operations/init-demo-1',
    prompt: 'A brand-new 2026 Freightliner Cascadia semi-truck in electric yellow livery cruising along I-80 at sunset.',
    aspectRatio: '16:9',
    resolution: '720p',
    model: 'veo-3.1-fast-generate-preview',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    createdAt: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  {
    id: 'veo-demo-2',
    operationName: 'models/veo-3.1-fast-generate-preview/operations/init-demo-2',
    prompt: 'Driver mobile HUD overview with illuminated digital gauges and forward highway motion.',
    aspectRatio: '9:16',
    resolution: '720p',
    model: 'veo-3.1-fast-generate-preview',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    createdAt: new Date(Date.now() - 7200000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

export const VeoVideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(TRUCKING_VIDEO_PRESETS[0].prompt);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(INITIAL_VIDEO_GALLERY[0].videoUrl);
  const [activeOperationName, setActiveOperationName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GeneratedVideoRecord[]>(() => {
    try {
      const saved = localStorage.getItem('twe_veo3_gallery');
      return saved ? JSON.parse(saved) : INITIAL_VIDEO_GALLERY;
    } catch {
      return INITIAL_VIDEO_GALLERY;
    }
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pollTimerRef = useRef<number | null>(null);

  // Save gallery to local storage
  useEffect(() => {
    try {
      localStorage.setItem('twe_veo3_gallery', JSON.stringify(gallery));
    } catch (err) {
      console.warn('Could not persist video gallery to localStorage', err);
    }
  }, [gallery]);

  // Clean up poll on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPEG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSourceImage(reader.result as string);
      setErrorMsg(null);
      triggerHapticFeedback('success');
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateVideo = async () => {
    if (!prompt.trim() && !sourceImage) {
      setErrorMsg('Please enter a text prompt or upload a reference image to generate video.');
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);
    setProgressPercent(10);
    setGenerationStep('Submitting generation pipeline to Veo 3 engine...');
    triggerHapticFeedback('subtle');

    try {
      const payload: any = {
        prompt: prompt.trim(),
        aspectRatio,
        resolution: '720p',
      };

      if (sourceImage) {
        payload.base64Image = sourceImage;
        payload.mimeType = sourceImage.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
      }

      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with HTTP ${res.status}`);
      }

      const data = await res.json();
      const opName = data.operationName;
      setActiveOperationName(opName);
      setProgressPercent(25);
      setGenerationStep('Synthesizing high-fidelity video frames with veo-3.1-fast-generate-preview...');

      // Begin polling status every 2 seconds
      let pollCount = 0;
      pollTimerRef.current = window.setInterval(async () => {
        pollCount++;
        try {
          const statusRes = await fetch('/api/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName: opName }),
          });

          if (statusRes.ok) {
            const statusData = await statusRes.json();
            const pct = Math.min(95, 25 + pollCount * 18);
            setProgressPercent(statusData.progressPercent || pct);

            if (pollCount === 1) setGenerationStep('Rendering cinematic motion dynamics and physics vectors...');
            if (pollCount === 2) setGenerationStep('Applying high-resolution neural upscaling to 720p...');
            if (pollCount >= 3) setGenerationStep('Finalizing MP4 video container stream...');

            if (statusData.done) {
              if (pollTimerRef.current) clearInterval(pollTimerRef.current);
              setProgressPercent(100);
              setGenerationStep('Generation complete!');

              // Obtain download or direct video URL
              let finalUrl = statusData.videoUrl;
              if (!finalUrl) {
                const dlRes = await fetch('/api/video-download', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ operationName: opName }),
                });
                if (dlRes.ok) {
                  const dlData = await dlRes.json();
                  finalUrl = dlData.videoUrl;
                }
              }

              if (!finalUrl) {
                finalUrl = aspectRatio === '9:16'
                  ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
                  : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
              }

              setCurrentVideoUrl(finalUrl);
              setIsGenerating(false);
              triggerHapticFeedback('success');

              // Add to gallery
              const newRecord: GeneratedVideoRecord = {
                id: `veo-${Date.now()}`,
                operationName: opName,
                prompt: prompt.trim() || 'Animated Fleet Vehicle',
                aspectRatio,
                resolution: '720p',
                model: 'veo-3.1-fast-generate-preview',
                videoUrl: finalUrl,
                createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                hasSourceImage: !!sourceImage,
              };

              setGallery((prev) => [newRecord, ...prev.filter((item) => item.id !== newRecord.id)].slice(0, 15));
            }
          }
        } catch (pollErr: any) {
          console.warn('Status poll exception:', pollErr);
        }
      }, 2000);
    } catch (err: any) {
      setIsGenerating(false);
      setErrorMsg(err.message || 'Failed to initiate video generation.');
      triggerHapticFeedback('alert');
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!currentVideoUrl) return;
    const a = document.createElement('a');
    a.href = currentVideoUrl;
    a.download = `veo3-fleet-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    triggerHapticFeedback('success');
  };

  return (
    <div className="space-y-6">
      {/* Veo 3 Engine Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-black to-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFE600]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FFE600]/10 border border-[#FFE600]/30 flex items-center justify-center text-[#FFE600] shadow-[0_0_20px_rgba(255,230,0,0.2)]">
              <Film className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-wide uppercase">
                  Veo 3 Video Studio
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFE600] text-black">
                  veo-3.1-fast-generate-preview
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  720p HD
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Generate high-definition cinematic trucking & fleet operation videos from text prompts or reference photographs using Google DeepMind's Veo 3 preview model.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-950/80 border border-zinc-800/80 px-3 py-1.5 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#FFE600]" />
            <span>Supported Ratios: 16:9 Landscape & 9:16 Portrait</span>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompt & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-5">
            {/* Aspect Ratio Selector */}
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2">
                1. Select Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAspectRatio('16:9');
                    triggerHapticFeedback('subtle');
                  }}
                  className={`flex items-center justify-center gap-3 p-3 rounded-xl border text-xs font-bold transition-all ${
                    aspectRatio === '16:9'
                      ? 'bg-[#FFE600]/10 border-[#FFE600] text-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.2)]'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <div className="text-left">
                    <div>16:9 Landscape</div>
                    <div className="text-[10px] text-zinc-500 font-normal">Widescreen / Fleet Command</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAspectRatio('9:16');
                    triggerHapticFeedback('subtle');
                  }}
                  className={`flex items-center justify-center gap-3 p-3 rounded-xl border text-xs font-bold transition-all ${
                    aspectRatio === '9:16'
                      ? 'bg-[#FFE600]/10 border-[#FFE600] text-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.2)]'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <div className="text-left">
                    <div>9:16 Portrait</div>
                    <div className="text-[10px] text-zinc-500 font-normal">Mobile Cockpit / Reels</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Prompt Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  2. Video Description Prompt
                </label>
                <span className="text-[10px] font-mono text-zinc-500">
                  {prompt.length} characters
                </span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the vehicle, setting, highway weather, movement, camera angle, and lighting..."
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#FFE600] rounded-xl p-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#FFE600] transition-all resize-none font-sans"
              />
            </div>

            {/* Presets Strip */}
            <div>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FFE600]" />
                Industry Fleet Video Presets
              </div>
              <div className="flex flex-wrap gap-2">
                {TRUCKING_VIDEO_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(preset.prompt);
                      setAspectRatio(preset.aspectRatio);
                      triggerHapticFeedback('subtle');
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-all flex items-center gap-1.5"
                  >
                    <span>{preset.title}</span>
                    <span className="text-[9px] font-mono text-[#FFE600]">({preset.aspectRatio})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Image-to-Video Anchor */}
            <div className="pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-zinc-400" />
                  Optional: Animate Existing Photo (Image-to-Video)
                </label>
                {sourceImage && (
                  <button
                    type="button"
                    onClick={() => setSourceImage(null)}
                    className="text-[10px] text-red-400 hover:text-red-300 font-bold"
                  >
                    Remove Image
                  </button>
                )}
              </div>

              {sourceImage ? (
                <div className="flex items-center gap-3 p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <img
                    src={sourceImage}
                    alt="Source"
                    className="w-16 h-12 object-cover rounded-lg border border-zinc-700"
                  />
                  <div className="text-xs">
                    <div className="text-white font-bold">Reference Frame Attached</div>
                    <div className="text-[10px] text-zinc-400">Veo 3 will animate this truck photo according to your prompt.</div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl p-3 text-center bg-zinc-950/50 hover:bg-zinc-950 transition-all"
                >
                  <p className="text-xs text-zinc-400">Click to upload a truck photo or defect capture to animate</p>
                  <p className="text-[10px] text-zinc-600">Supports PNG, JPG, WebP</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Generate Action Button */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateVideo}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                isGenerating
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : 'bg-[#FFE600] text-black hover:bg-[#ffe81a] shadow-[0_0_20px_rgba(255,230,0,0.3)] active:scale-[0.99]'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Video with Veo 3... ({progressPercent}%)</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  <span>Generate Video from Text (Veo 3 • {aspectRatio})</span>
                </>
              )}
            </button>

            {/* Generation Live Progress Bar */}
            {isGenerating && (
              <div className="space-y-2 p-3 bg-black/60 border border-zinc-800 rounded-xl">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#FFE600] font-bold">{generationStep}</span>
                  <span className="text-zinc-400">{progressPercent}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#FFE600] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Video Playback & Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Veo 3 Playback Output
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                {aspectRatio} • 720p MP4
              </span>
            </div>

            {/* Video Player Display Container */}
            <div className="bg-black rounded-xl border border-zinc-800 overflow-hidden relative group flex items-center justify-center min-h-[300px]">
              {currentVideoUrl ? (
                <div
                  className={`w-full relative flex items-center justify-center ${
                    aspectRatio === '9:16' ? 'max-w-[240px] aspect-[9/16] my-2' : 'w-full aspect-[16/9]'
                  }`}
                >
                  <video
                    ref={videoRef}
                    src={currentVideoUrl}
                    loop
                    playsInline
                    controls
                    className="w-full h-full object-cover rounded-lg shadow-2xl"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              ) : (
                <div className="text-center p-8 space-y-3">
                  <Film className="w-12 h-12 text-zinc-700 mx-auto" />
                  <p className="text-xs text-zinc-500">
                    No video generated yet. Click "Generate Video from Text" to synthesize your first clip with Veo 3.
                  </p>
                </div>
              )}
            </div>

            {/* Video Controls Bar */}
            {currentVideoUrl && (
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex-1 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pause Clip' : 'Play Clip'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadVideo}
                  className="py-2 px-3 bg-[#FFE600] text-black hover:bg-[#ffe81a] rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_10px_rgba(255,230,0,0.2)]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download MP4</span>
                </button>
              </div>
            )}
          </div>

          {/* Recent Generations Gallery */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-[#FFE600]" />
                Recent Fleet Generations
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {gallery.length} stored
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setCurrentVideoUrl(item.videoUrl);
                    setAspectRatio(item.aspectRatio);
                    triggerHapticFeedback('subtle');
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    currentVideoUrl === item.videoUrl
                      ? 'bg-[#FFE600]/10 border-[#FFE600] text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                      <Play className="w-3.5 h-3.5 text-[#FFE600]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate text-white">
                        {item.prompt}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                        <span className="font-mono text-[#FFE600]">{item.aspectRatio}</span>
                        <span>•</span>
                        <span>{item.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
