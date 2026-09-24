import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Sliders,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Radio,
  Sparkles,
  ShieldCheck,
  Zap,
  Play,
  Square,
  Info,
  SlidersHorizontal,
  Vibrate,
} from 'lucide-react';
import {
  useVoiceSettings,
  PRESET_THRESHOLDS,
  NoiseGatePreset,
  DEFAULT_VOICE_SETTINGS,
} from '../services/voiceSettingsService';
import { triggerHapticFeedback, isVibrationSupported } from '../services/haptics';

interface VoiceMicSensitivityConfigProps {
  onTestVoiceCommand?: (phrase: string) => void;
  compact?: boolean;
}

export const VoiceMicSensitivityConfig: React.FC<VoiceMicSensitivityConfigProps> = ({
  onTestVoiceCommand,
  compact = false,
}) => {
  const { settings, updateSettings, setThreshold, applyPreset, resetSettings } = useVoiceSettings();

  const [isLiveTesting, setIsLiveTesting] = useState<boolean>(false);
  const [liveAudioLevel, setLiveAudioLevel] = useState<number>(0);
  const [peakLevel, setPeakLevel] = useState<number>(0);
  const [micPermissionDenied, setMicPermissionDenied] = useState<boolean>(false);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  // Audio Context & Analyser Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const peakDecayTimerRef = useRef<number | null>(null);

  // Real-time audio stream analyser for mic sensitivity calibration
  const stopLiveTest = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsLiveTesting(false);
    setLiveAudioLevel(0);
    setPeakLevel(0);
  }, []);

  const startLiveTest = useCallback(async () => {
    stopLiveTest();
    setMicPermissionDenied(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: settings.echoCancellation,
          noiseSuppression: settings.noiseSuppression,
          autoGainControl: settings.autoGainControl,
        },
      });

      mediaStreamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        setMicPermissionDenied(true);
        return;
      }

      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsLiveTesting(true);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let currentPeak = 0;

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        // Scale 0-255 frequency average to 0-100% volume level with non-linear boost
        const normalized = Math.min(100, Math.round((average / 115) * 100));

        setLiveAudioLevel(normalized);

        if (normalized > currentPeak) {
          currentPeak = normalized;
          setPeakLevel(currentPeak);
        } else {
          currentPeak = Math.max(0, currentPeak - 0.5);
          setPeakLevel(Math.round(currentPeak));
        }

        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      animFrameRef.current = requestAnimationFrame(updateMeter);
    } catch (err) {
      console.warn('Microphone calibration access error:', err);
      setMicPermissionDenied(true);
      setIsLiveTesting(false);
    }
  }, [settings.autoGainControl, settings.echoCancellation, settings.noiseSuppression, stopLiveTest]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopLiveTest();
      if (peakDecayTimerRef.current) clearTimeout(peakDecayTimerRef.current);
    };
  }, [stopLiveTest]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setThreshold(val, 'custom');
    showSavedNotification(`Sensitivity threshold calibrated to ${val}%`);
  };

  const handleApplyPreset = (preset: Exclude<NoiseGatePreset, 'custom'>) => {
    applyPreset(preset);
    const label = PRESET_THRESHOLDS[preset].label;
    showSavedNotification(`Preset activated: ${label}`);
  };

  const handleReset = () => {
    resetSettings();
    showSavedNotification('Reset to factory default (40% balanced threshold)');
  };

  const showSavedNotification = (msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => {
      setSavedBanner((current) => (current === msg ? null : current));
    }, 2800);
  };

  const isTriggered = liveAudioLevel >= settings.micSensitivityThreshold;

  return (
    <div
      id="voice-mic-sensitivity-panel"
      className="bg-[#14161C] border border-[#2B2D33] rounded-2xl p-5 sm:p-6 text-white space-y-6 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 border-b border-[#22242B] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] font-bold">
              // ACOUSTIC TELEMATICS & NOISE GATE
            </span>
            <span className="px-2 py-0.5 bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-[#C9A84C] font-mono text-[10px] font-bold uppercase rounded">
              49 CFR § 392.82 SAFE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#F5F5F5] mt-1 flex items-center gap-2 font-headline">
            Microphone Sensitivity Threshold
            <SlidersHorizontal className="w-5 h-5 text-[#C9A84C]" />
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
            Calibrate the acoustic noise-gate threshold for the In-Cab Voice Sentinel. Audio below the threshold is filtered out as diesel engine rumble, Jake brake, or wind noise. Speech exceeding the threshold triggers the voice recognition processor.
          </p>
        </div>

        {/* Quick Reset & Status */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D1F26] hover:bg-[#252832] border border-[#323642] text-xs font-mono text-slate-300 hover:text-white transition-all active:scale-95"
            title="Reset to 40% default"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>Reset Default</span>
          </button>
        </div>
      </div>

      {/* Save Notification Toast */}
      {savedBanner && (
        <div className="flex items-center gap-2 bg-[#122216] border border-[#1FA971]/40 text-[#1FA971] px-3.5 py-2 rounded-xl text-xs font-mono animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1FA971]" />
          <span>{savedBanner}</span>
        </div>
      )}

      {/* Primary Slider & Metric Readout */}
      <div className="space-y-4 bg-[#0D0F14] border border-[#22242B] p-4 sm:p-5 rounded-xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Active Noise-Gate Threshold
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black font-mono text-[#FFD700]">
                {settings.micSensitivityThreshold}%
              </span>
              <span className="text-xs font-mono text-slate-400">
                ({settings.micSensitivityThreshold <= 25 ? 'High Sensitivity / Quiet Bunk' : settings.micSensitivityThreshold <= 55 ? 'Standard In-Cab Fleet Mode' : 'High Noise Gate / Highway Filter'})
              </span>
            </div>
          </div>

          {/* Current Preset Badge */}
          <div className="px-3 py-1.5 rounded-lg bg-[#181A22] border border-[#2B2D33] text-right">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Active Preset</span>
            <span className="text-xs font-mono font-bold text-[#C9A84C] uppercase">
              {settings.noiseGatePreset === 'custom'
                ? 'Custom Calibrated'
                : PRESET_THRESHOLDS[settings.noiseGatePreset]?.label || settings.noiseGatePreset}
            </span>
          </div>
        </div>

        {/* The Range Slider Control */}
        <div className="space-y-2 pt-2">
          <div className="relative flex items-center">
            <input
              id="voice-mic-sensitivity-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value={settings.micSensitivityThreshold}
              onChange={handleSliderChange}
              className="w-full h-3 bg-[#1B1E28] rounded-lg appearance-none cursor-pointer accent-[#FFD700] border border-[#2B2D33] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
            />
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
            <span>0% (Wide Open / Sensitive)</span>
            <span>25% (Sleeper)</span>
            <span className="text-[#C9A84C] font-bold">40% (Fleet Default)</span>
            <span>65% (Highway)</span>
            <span>100% (Maximum Gate)</span>
          </div>

          {/* Visual Noise-Gate Range Bar */}
          <div className="w-full h-2 rounded-full overflow-hidden flex bg-[#161820] border border-[#2B2D33] mt-2">
            <div
              style={{ width: `${settings.micSensitivityThreshold}%` }}
              className="bg-gradient-to-r from-red-950/60 to-red-800/80 border-r-2 border-red-500 h-full flex items-center justify-end px-1"
              title="Acoustic Noise Gate (Audio in this zone is ignored as engine rumble)"
            />
            <div
              style={{ width: `${100 - settings.micSensitivityThreshold}%` }}
              className="bg-gradient-to-r from-emerald-900/60 to-emerald-600/60 h-full"
              title="Voice Recognition Trigger Zone (Speech audio in this zone is processed)"
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono pt-0.5 px-0.5">
            <span className="text-red-400/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              0% &ndash; {settings.micSensitivityThreshold}% Ambient Engine Rumble Filter (GATED)
            </span>
            <span className="text-emerald-400/90 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {settings.micSensitivityThreshold}% &ndash; 100% Speech Recognition Trigger Zone
            </span>
          </div>
        </div>
      </div>

      {/* Preset Buttons Grid */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
          Acoustic Profile Presets
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {(Object.entries(PRESET_THRESHOLDS) as [Exclude<NoiseGatePreset, 'custom'>, typeof PRESET_THRESHOLDS['standard']][]).map(
            ([key, config]) => {
              const isSelected =
                settings.noiseGatePreset === key && settings.micSensitivityThreshold === config.threshold;
              return (
                <button
                  key={key}
                  onClick={() => handleApplyPreset(key)}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-[#1D1808] border-[#FFD700] text-white shadow-[0_0_15px_rgba(255,215,0,0.15)]'
                      : 'bg-[#0E1015] border-[#252832] text-slate-300 hover:border-[#3B3E4C] hover:bg-[#14161F]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold uppercase truncate">
                      {config.label.split('(')[0]}
                    </span>
                    <span
                      className={`text-xs font-mono font-black px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-[#FFD700] text-black' : 'bg-[#1E212B] text-[#C9A84C]'
                      }`}
                    >
                      {config.threshold}%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                    {config.description}
                  </p>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Interactive Live Microphone Calibration Bench */}
      <div className="bg-[#0D0F14] border border-[#252832] rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg border ${
                isLiveTesting
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                  : 'bg-[#1A1D26] border-[#2E3240] text-slate-400'
              }`}
            >
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase font-mono text-white flex items-center gap-2">
                Live Microphone Calibration Meter
                {isLiveTesting && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                Speak normally to test if your voice cuts through the configured threshold line.
              </p>
            </div>
          </div>

          <button
            onClick={isLiveTesting ? stopLiveTest : startLiveTest}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono uppercase font-bold transition-all shadow-md active:scale-95 ${
              isLiveTesting
                ? 'bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-200'
                : 'bg-[#C9A84C] hover:bg-[#E5C058] text-black font-black'
            }`}
          >
            {isLiveTesting ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Live Test</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Test Live Mic</span>
              </>
            )}
          </button>
        </div>

        {micPermissionDenied && (
          <div className="flex items-center gap-2 bg-amber-950/30 border border-amber-500/40 text-amber-300 p-3 rounded-lg text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Microphone permission not granted in this browser window. Please check browser permissions to test live acoustic decibels.
            </span>
          </div>
        )}

        {/* Live Decibel / Volume Visual Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Current Input:</span>
              <span className="font-bold text-white text-sm">{liveAudioLevel}%</span>
              <span className="text-slate-500 text-[11px]">(Peak: {peakLevel}%)</span>
            </div>

            {/* Noise Gate status indicator */}
            <div
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 ${
                !isLiveTesting
                  ? 'bg-slate-800 text-slate-400'
                  : isTriggered
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  !isLiveTesting ? 'bg-slate-500' : isTriggered ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span>
                {!isLiveTesting
                  ? 'STANDBY (CLICK TEST LIVE MIC)'
                  : isTriggered
                  ? 'VOICE ACTIVE (PARSING SPEECH)'
                  : 'GATED OUT (BELOW SENSITIVITY)'}
              </span>
            </div>
          </div>

          {/* Visual Meter Bar with Threshold Indicator */}
          <div className="relative h-6 bg-[#161822] rounded-lg border border-[#2A2E3D] overflow-hidden p-0.5 flex items-center">
            {/* Live Audio Level Fill */}
            <div
              className={`h-full rounded transition-all duration-75 ${
                isTriggered
                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#FFD700]'
                  : 'bg-gradient-to-r from-slate-700 to-amber-600/70'
              }`}
              style={{ width: `${liveAudioLevel}%` }}
            />

            {/* Threshold Vertical Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-[#FFD700] shadow-[0_0_8px_#FFD700] z-10 transition-all pointer-events-none"
              style={{ left: `${settings.micSensitivityThreshold}%` }}
            >
              <div className="absolute -top-1 -left-1.5 w-4 h-2 bg-[#FFD700] rounded-sm flex items-center justify-center text-[7px] text-black font-black font-mono">
                T
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
            <span>Silence / Quiet</span>
            <span className="text-[#FFD700] font-bold">
              ▲ Gate Line: {settings.micSensitivityThreshold}%
            </span>
            <span>Maximum Cab Sound</span>
          </div>
        </div>
      </div>

      {/* Advanced In-Cab Acoustic Hardware Options */}
      <div className="bg-[#0D0F14] border border-[#22242B] rounded-xl p-4 sm:p-5 space-y-3">
        <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
          Driver Safety &amp; Audio Processing Hardware Filters
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Noise Suppression */}
          <div className="p-3 bg-[#13151D] border border-[#222530] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold block text-slate-200">
                Noise Suppression
              </span>
              <span className="text-[10px] text-slate-400">Filters HVAC &amp; road rumble</span>
            </div>
            <input
              type="checkbox"
              checked={settings.noiseSuppression}
              onChange={(e) => updateSettings({ noiseSuppression: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#C9A84C] accent-[#C9A84C] cursor-pointer"
            />
          </div>

          {/* Echo Cancellation */}
          <div className="p-3 bg-[#13151D] border border-[#222530] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold block text-slate-200">
                Echo Cancellation
              </span>
              <span className="text-[10px] text-slate-400">Prevents cabin speaker echo</span>
            </div>
            <input
              type="checkbox"
              checked={settings.echoCancellation}
              onChange={(e) => updateSettings({ echoCancellation: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#C9A84C] accent-[#C9A84C] cursor-pointer"
            />
          </div>

          {/* Auto Gain Control */}
          <div className="p-3 bg-[#13151D] border border-[#222530] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold block text-slate-200">
                Auto Gain (AGC)
              </span>
              <span className="text-[10px] text-slate-400">Normalizes soft driver speech</span>
            </div>
            <input
              type="checkbox"
              checked={settings.autoGainControl}
              onChange={(e) => updateSettings({ autoGainControl: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#C9A84C] accent-[#C9A84C] cursor-pointer"
            />
          </div>

          {/* Speech Haptics Confirmation */}
          <div className="p-3 bg-[#13151D] border border-[#222530] rounded-xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1">
                <Vibrate className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span className="text-xs font-mono font-bold block text-slate-200">
                  Haptic Feedback
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Tactile pulse on parse</span>
            </div>
            <button
              onClick={() => {
                triggerHapticFeedback('subtle');
                updateSettings({ speechHapticsConfirmation: !settings.speechHapticsConfirmation });
              }}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-colors ${
                settings.speechHapticsConfirmation
                  ? 'bg-[#1C1808] border-[#FFD700] text-[#FFD700]'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              {settings.speechHapticsConfirmation ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
