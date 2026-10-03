/**
 * In-Cab Voice Sentinel & Microphone Sensitivity Configuration Service
 * Manages operator settings for speech recognition and acoustic noise-gate threshold,
 * with persistence via localStorage and real-time event broadcasting across components.
 */

import { useState, useEffect } from 'react';

export type NoiseGatePreset = 'highway' | 'standard' | 'sleeper' | 'whisper' | 'custom';

export interface VoiceListenerSettings {
  /**
   * Microphone Sensitivity Threshold (0 - 100%).
   * Audio levels below this threshold are treated as ambient cab/engine rumble
   * and gated out. Levels above this threshold activate voice recognition processing.
   */
  micSensitivityThreshold: number;
  noiseGatePreset: NoiseGatePreset;
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
  speechHapticsConfirmation: boolean;
}

export const PRESET_THRESHOLDS: Record<Exclude<NoiseGatePreset, 'custom'>, { threshold: number; label: string; description: string }> = {
  highway: {
    threshold: 65,
    label: 'Highway Cruise (Noisy Cab)',
    description: 'High threshold (65%). Filters loud diesel rumble, jake brake, and high-speed wind noise.',
  },
  standard: {
    threshold: 40,
    label: 'Standard In-Cab (Balanced)',
    description: 'Balanced threshold (40%). Calibrated for standard idling or city transit road noise.',
  },
  sleeper: {
    threshold: 22,
    label: 'Sleeper Berth (Sensitive)',
    description: 'High sensitivity (22%). Optimized for resting or bunk commands while parked.',
  },
  whisper: {
    threshold: 12,
    label: 'Whisper Mode (Ultra-Sensitive)',
    description: 'Ultra sensitivity (12%). Picks up quiet murmurs with minimal acoustic interference.',
  },
};

export const DEFAULT_VOICE_SETTINGS: VoiceListenerSettings = {
  micSensitivityThreshold: 40,
  noiseGatePreset: 'standard',
  noiseSuppression: true,
  echoCancellation: true,
  autoGainControl: true,
  speechHapticsConfirmation: true,
};

const STORAGE_KEY = 'twe_voice_listener_settings_v1';
const EVENT_NAME = 'twe_voice_settings_changed';

/**
 * Retrieves the currently saved voice listener configuration from localStorage.
 */
export const getVoiceSettings = (): VoiceListenerSettings => {
  if (typeof window === 'undefined') return DEFAULT_VOICE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_VOICE_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_VOICE_SETTINGS,
      ...parsed,
      micSensitivityThreshold:
        typeof parsed.micSensitivityThreshold === 'number'
          ? Math.max(0, Math.min(100, parsed.micSensitivityThreshold))
          : DEFAULT_VOICE_SETTINGS.micSensitivityThreshold,
    };
  } catch (err) {
    console.warn('Failed to parse voice listener settings:', err);
    return DEFAULT_VOICE_SETTINGS;
  }
};

/**
 * Saves and broadcasts updated voice listener settings.
 */
export const saveVoiceSettings = (
  updates: Partial<VoiceListenerSettings>
): VoiceListenerSettings => {
  if (typeof window === 'undefined') return DEFAULT_VOICE_SETTINGS;
  try {
    const current = getVoiceSettings();
    const next: VoiceListenerSettings = {
      ...current,
      ...updates,
    };

    // Clamp threshold between 0 and 100
    if (typeof updates.micSensitivityThreshold === 'number') {
      next.micSensitivityThreshold = Math.max(0, Math.min(100, Math.round(updates.micSensitivityThreshold)));
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    // Dispatch custom event for real-time synchronization
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: next,
      })
    );

    return next;
  } catch (err) {
    console.warn('Failed to save voice listener settings:', err);
    return DEFAULT_VOICE_SETTINGS;
  }
};

/**
 * Resets voice listener settings back to factory default.
 */
export const resetVoiceSettings = (): VoiceListenerSettings => {
  return saveVoiceSettings(DEFAULT_VOICE_SETTINGS);
};

/**
 * Subscribes to changes in voice listener settings.
 */
export const subscribeToVoiceSettings = (
  callback: (settings: VoiceListenerSettings) => void
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<VoiceListenerSettings>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    } else {
      callback(getVoiceSettings());
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getVoiceSettings());
    }
  };

  window.addEventListener(EVENT_NAME, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
};

/**
 * React Hook for consuming and updating Voice Listener Settings.
 */
export const useVoiceSettings = () => {
  const [settings, setSettings] = useState<VoiceListenerSettings>(() => getVoiceSettings());

  useEffect(() => {
    // Initial fetch
    setSettings(getVoiceSettings());
    // Subscribe to updates
    return subscribeToVoiceSettings((updated) => {
      setSettings(updated);
    });
  }, []);

  const update = (partial: Partial<VoiceListenerSettings>) => {
    const next = saveVoiceSettings(partial);
    setSettings(next);
    return next;
  };

  const setThreshold = (val: number, preset: NoiseGatePreset = 'custom') => {
    return update({
      micSensitivityThreshold: val,
      noiseGatePreset: preset,
    });
  };

  const applyPreset = (preset: Exclude<NoiseGatePreset, 'custom'>) => {
    const config = PRESET_THRESHOLDS[preset];
    return update({
      micSensitivityThreshold: config.threshold,
      noiseGatePreset: preset,
    });
  };

  const reset = () => {
    const next = resetVoiceSettings();
    setSettings(next);
    return next;
  };

  return {
    settings,
    updateSettings: update,
    setThreshold,
    applyPreset,
    resetSettings: reset,
  };
};
