/**
 * TruckWithEase Enterprise Voice Persona & Speech Synthesis Service
 * 
 * Provides:
 * 1. 5 Iconic Human Voice Personas inspired by popular cultural figures.
 * 2. Custom Fleet Voice Recording Studio (Admin microphone recording & calibration).
 * 3. Role-Based Access Control (RBAC): ONLY ADMINS can switch or record personas;
 *    company fleet drivers receive and hear the admin-configured voice but cannot alter it.
 * 4. High-fidelity Speech Synthesis & Audio Engine dispatch with cross-component reactivity.
 */

import { UserRoleType } from '../types';

export interface VoicePersona {
  id: string;
  name: string;
  inspiredBy: string;
  roleTitle: string;
  description: string;
  category: 'POPULAR_FIGURE' | 'CUSTOM_FLEET';
  avatarEmoji: string;
  accent: string;
  gender: 'MALE' | 'FEMALE' | 'CUSTOM';
  pitch: number;        // SpeechSynthesis pitch (0.5 - 2.0)
  rate: number;         // SpeechSynthesis rate (0.5 - 2.0)
  volume: number;       // Volume (0.0 - 1.0)
  preferredVoicePatterns: string[]; // Browser voice name hints
  samplePhrase: string;
  tags: string[];
  toneDescription: string;
  isCustomRecordable?: boolean;
}

export interface CustomVoiceRecordingMetadata {
  id: string;
  name: string;
  recordedByAdminId: string;
  recordedAt: string;
  durationSeconds: number;
  pitchAdjustment: number;
  rateAdjustment: number;
  samplePhrases: { id: string; text: string; hasAudio: boolean }[];
  audioBlobUrl?: string;
}

const STORAGE_ACTIVE_PERSONA_KEY = 'truckwithease_active_voice_persona_id';
const STORAGE_CUSTOM_VOICE_META_KEY = 'truckwithease_custom_fleet_voice_meta';
const DB_NAME = 'TruckWithEase_VoicePersonas_DB';
const DB_VERSION = 1;
const RECORDINGS_STORE = 'custom_voice_clips';

export const POPULAR_FIGURE_PERSONAS: VoicePersona[] = [
  {
    id: 'sam-elliott',
    name: 'The Road Legend',
    inspiredBy: 'Sam Elliott / Western Veteran',
    roleTitle: 'Senior Highway Co-Pilot',
    description: 'Deep-gravel cowboy baritone with a steady, reassuring cadence. Built for long-haul highway peace of mind.',
    category: 'POPULAR_FIGURE',
    avatarEmoji: '🤠',
    accent: 'American Western / Gravel Baritone',
    gender: 'MALE',
    pitch: 0.72,
    rate: 0.88,
    volume: 1.0,
    preferredVoicePatterns: ['David', 'Guy', 'Mark', 'English (America)', 'Male', 'Natural'],
    samplePhrase: "Take it easy out there on the asphalt, partner. Next scale house is green-lighted and open.",
    tags: ['Gravel Baritone', 'Calm', 'Veteran Trucker', 'Low Stress'],
    toneDescription: 'Deep, resonant, unhurried, reassuring',
  },
  {
    id: 'patton-commander',
    name: 'The Tactical Commander',
    inspiredBy: 'General Patton / Jocko Willink',
    roleTitle: 'Operational Road Marshal',
    description: 'Crisp military discipline, sharp mission-first directives, zero hesitation, and laser-focused safety enforcement.',
    category: 'POPULAR_FIGURE',
    avatarEmoji: '🎖️',
    accent: 'American Military Command',
    gender: 'MALE',
    pitch: 0.86,
    rate: 1.12,
    volume: 1.0,
    preferredVoicePatterns: ['George', 'Ryan', 'Tom', 'English (United States)', 'Male'],
    samplePhrase: "Attention driver! 11-hour drive window at 78% capacity. Hold your corridor and stay frosty.",
    tags: ['Military', 'Tactical', 'Direct', 'High Alertness'],
    toneDescription: 'Commanding, sharp, punchy, authoritative',
  },
  {
    id: 'morgan-narrator',
    name: 'The Voice of Wisdom',
    inspiredBy: 'Morgan Freeman / Documentary Narrator',
    roleTitle: 'Resonant Highway Philosopher',
    description: 'Cinematic, soothing, and deeply resonant. Delivers dispatch, weather, and safety briefings like an epic journey.',
    category: 'POPULAR_FIGURE',
    avatarEmoji: '🎙️',
    accent: 'American Rich Resonant Baritone',
    gender: 'MALE',
    pitch: 0.78,
    rate: 0.94,
    volume: 1.0,
    preferredVoicePatterns: ['Natural', 'Arthur', 'Guy', 'David', 'English (America)'],
    samplePhrase: "You've put 420 honest miles behind you today. The road ahead is open, and tomorrow's freight is secured.",
    tags: ['Cinematic', 'Resonant', 'Soothing', 'Philosophical'],
    toneDescription: 'Warm, cinematic, deeply reassuring, iconic',
  },
  {
    id: 'dolly-matriarch',
    name: 'Southern Road Matriarch',
    inspiredBy: 'Dolly Parton / Southern Angel',
    roleTitle: 'Highway Guardian & Cheer',
    description: 'Warm southern lilt, cheerful encouragement, and vigilant care. Keeps driver spirits high through rain or snow.',
    category: 'POPULAR_FIGURE',
    avatarEmoji: '🌸',
    accent: 'American Southern Lilt',
    gender: 'FEMALE',
    pitch: 1.25,
    rate: 1.04,
    volume: 0.95,
    preferredVoicePatterns: ['Jenny', 'Zira', 'Samantha', 'Aria', 'English (United States)', 'Female'],
    samplePhrase: "Hey there sugar! Keep those big wheels rollin' safe. Weather up north is turnin' chilly, so take your sweet time!",
    tags: ['Southern Lilt', 'Warm', 'Encouraging', 'Guardian'],
    toneDescription: 'Lively, friendly, protective, uplifting',
  },
  {
    id: 'jarvis-avionics',
    name: 'Avionics AI Co-Pilot',
    inspiredBy: 'J.A.R.V.I.S. / British Tech AI',
    roleTitle: 'High-Tech Navigation Intelligence',
    description: 'Ultra-crisp British aristocratic precision. Real-time telemetry, bridge radar, and engine diagnostics delivered with elegance.',
    category: 'POPULAR_FIGURE',
    avatarEmoji: '⚡',
    accent: 'British Received Pronunciation',
    gender: 'MALE',
    pitch: 1.06,
    rate: 1.02,
    volume: 0.95,
    preferredVoicePatterns: ['UK English', 'en-GB', 'Oliver', 'Daniel', 'George', 'British'],
    samplePhrase: "Good afternoon, Captain. All diagnostic telemetry nominal. Optimal routing computed via Interstate 70.",
    tags: ['British Accent', 'Avionics', 'High-Tech', 'Analytical'],
    toneDescription: 'Sophisticated, precise, aristocratic, intellectual',
  },
];

export const CUSTOM_FLEET_PERSONA_TEMPLATE: VoicePersona = {
  id: 'custom-fleet-recording',
  name: 'Custom Fleet Sovereign Voice',
  inspiredBy: 'Fleet Administrator Voice Clone',
  roleTitle: 'Fleet Owner Authenticated Voice',
  description: 'Recorded directly by the Fleet Administrator. Delivers commands and briefings in your company leadership voice.',
  category: 'CUSTOM_FLEET',
  avatarEmoji: '🏢',
  accent: 'Custom Admin Authenticated',
  gender: 'CUSTOM',
  pitch: 1.0,
  rate: 1.0,
  volume: 1.0,
  preferredVoicePatterns: ['Natural', 'en-US'],
  samplePhrase: "TruckWithEase fleet systems online. Clear road ahead, driver. Drive safe and check in at dispatch.",
  tags: ['Admin Recorded', 'Custom Voice', 'Fleet Brand', 'Authentic'],
  toneDescription: 'Custom calibrated fleet owner delivery',
  isCustomRecordable: true,
};

// ================= IndexedDB Audio Persistence =================

function openVoiceDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(RECORDINGS_STORE)) {
        db.createObjectStore(RECORDINGS_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCustomVoiceClip(
  clipId: string,
  audioBlob: Blob,
  metadata: { phraseText: string; duration: number }
): Promise<void> {
  try {
    const db = await openVoiceDB();
    const tx = db.transaction(RECORDINGS_STORE, 'readwrite');
    const store = tx.objectStore(RECORDINGS_STORE);

    const record = {
      id: clipId,
      blob: audioBlob,
      mimeType: audioBlob.type || 'audio/webm',
      duration: metadata.duration,
      phraseText: metadata.phraseText,
      updatedAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const req = store.put(record);
      req.onsuccess = () => {
        broadcastVoiceChange();
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[VoicePersona] Failed to save audio clip to IndexedDB:', err);
  }
}

export async function getCustomVoiceClip(clipId: string): Promise<{ blob: Blob; url: string } | null> {
  try {
    const db = await openVoiceDB();
    const tx = db.transaction(RECORDINGS_STORE, 'readonly');
    const store = tx.objectStore(RECORDINGS_STORE);

    return new Promise((resolve) => {
      const req = store.get(clipId);
      req.onsuccess = () => {
        const res = req.result;
        if (!res || !res.blob) {
          resolve(null);
          return;
        }
        const url = URL.createObjectURL(res.blob);
        resolve({ blob: res.blob, url });
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('[VoicePersona] Failed to get audio clip:', err);
    return null;
  }
}

export async function getAllCustomVoiceClips(): Promise<string[]> {
  try {
    const db = await openVoiceDB();
    const tx = db.transaction(RECORDINGS_STORE, 'readonly');
    const store = tx.objectStore(RECORDINGS_STORE);

    return new Promise((resolve) => {
      const req = store.getAllKeys();
      req.onsuccess = () => resolve(req.result as string[]);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function deleteCustomVoiceClip(clipId: string): Promise<void> {
  try {
    const db = await openVoiceDB();
    const tx = db.transaction(RECORDINGS_STORE, 'readwrite');
    const store = tx.objectStore(RECORDINGS_STORE);

    return new Promise((resolve, reject) => {
      const req = store.delete(clipId);
      req.onsuccess = () => {
        broadcastVoiceChange();
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[VoicePersona] Failed to delete clip:', err);
  }
}

// ================= RBAC & Access Control =================

/**
 * Company Fleet Drivers will NOT have options to modify or record voices.
 * Only 'admin' role can change voice personas or record custom fleet voices.
 */
export function canManageVoicePersonas(role?: UserRoleType): boolean {
  return role === 'admin';
}

// ================= Persona Selection & Persistence =================

export function getAllVoicePersonas(): VoicePersona[] {
  const customMeta = getCustomVoiceMetadata();
  const customPersona: VoicePersona = {
    ...CUSTOM_FLEET_PERSONA_TEMPLATE,
    name: customMeta?.name || CUSTOM_FLEET_PERSONA_TEMPLATE.name,
    pitch: customMeta ? 1.0 + (customMeta.pitchAdjustment * 0.1) : 1.0,
    rate: customMeta ? 1.0 + (customMeta.rateAdjustment * 0.1) : 1.0,
  };
  return [...POPULAR_FIGURE_PERSONAS, customPersona];
}

export function getActiveVoicePersona(): VoicePersona {
  if (typeof window === 'undefined') return POPULAR_FIGURE_PERSONAS[0];
  try {
    const activeId = localStorage.getItem(STORAGE_ACTIVE_PERSONA_KEY) || 'sam-elliott';
    const all = getAllVoicePersonas();
    const found = all.find((p) => p.id === activeId);
    return found || POPULAR_FIGURE_PERSONAS[0];
  } catch {
    return POPULAR_FIGURE_PERSONAS[0];
  }
}

/**
 * Sets active fleet voice persona.
 * Enforces ADMIN check. Returns false if unauthorized.
 */
export function setActiveVoicePersona(personaId: string, userRole?: UserRoleType): boolean {
  if (!canManageVoicePersonas(userRole)) {
    console.warn(`[VoicePersona Security] Access Denied: Role '${userRole}' cannot modify fleet voice.`);
    return false;
  }

  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_ACTIVE_PERSONA_KEY, personaId);
    broadcastVoiceChange();
    return true;
  } catch (err) {
    console.warn('[VoicePersona] Failed to set active persona:', err);
    return false;
  }
}

export function getCustomVoiceMetadata(): CustomVoiceRecordingMetadata | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_VOICE_META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCustomVoiceMetadata(meta: CustomVoiceRecordingMetadata, userRole?: UserRoleType): boolean {
  if (!canManageVoicePersonas(userRole)) {
    console.warn(`[VoicePersona Security] Access Denied: Non-admin cannot save custom voice metadata.`);
    return false;
  }
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_CUSTOM_VOICE_META_KEY, JSON.stringify(meta));
    broadcastVoiceChange();
    return true;
  } catch (err) {
    console.warn('[VoicePersona] Failed to save metadata:', err);
    return false;
  }
}

function broadcastVoiceChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('truckwithease_voice_persona_changed', {
        detail: {
          activePersona: getActiveVoicePersona(),
          timestamp: Date.now(),
        },
      })
    );
  }
}

// ================= High-Fidelity Speech Dispatcher =================

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const available = window.speechSynthesis.getVoices();
    if (available.length > 0) {
      cachedVoices = available;
      resolve(available);
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      resolve(cachedVoices);
    };

    // Timeout fallback after 400ms
    setTimeout(() => {
      cachedVoices = window.speechSynthesis.getVoices();
      resolve(cachedVoices);
    }, 400);
  });
}

function selectBestVoice(persona: VoicePersona, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // 1. Try matching preferred voice patterns
  for (const pattern of persona.preferredVoicePatterns) {
    const match = voices.find(
      (v) =>
        v.name.toLowerCase().includes(pattern.toLowerCase()) ||
        v.lang.toLowerCase().includes(pattern.toLowerCase())
    );
    if (match) return match;
  }

  // 2. Gender / Language matching
  if (persona.gender === 'FEMALE') {
    const female = voices.find(
      (v) =>
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('jenny') ||
        v.name.toLowerCase().includes('samantha')
    );
    if (female) return female;
  } else if (persona.gender === 'MALE') {
    const male = voices.find(
      (v) =>
        v.name.toLowerCase().includes('male') ||
        v.name.toLowerCase().includes('david') ||
        v.name.toLowerCase().includes('guy') ||
        v.name.toLowerCase().includes('george')
    );
    if (male) return male;
  }

  // 3. Fallback to English voice or default
  const enVoice = voices.find((v) => v.lang.startsWith('en'));
  return enVoice || voices[0] || null;
}

/**
 * Speaks text using the currently active Fleet Voice Persona.
 * Applies tuned pitch, speed, and matched voice profile.
 */
export async function speakWithActivePersona(
  text: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    overridePersona?: VoicePersona;
  }
): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  const persona = options?.overridePersona || getActiveVoicePersona();

  // If custom fleet recording is active, check if there is a pre-recorded clip for this exact phrase
  if (persona.id === 'custom-fleet-recording') {
    const clipId = `clip_${text.toLowerCase().trim().replace(/[^a-z0-9]/g, '_').slice(0, 30)}`;
    const clip = await getCustomVoiceClip(clipId);
    if (clip && clip.url) {
      try {
        const audio = new Audio(clip.url);
        options?.onStart?.();
        audio.onended = () => options?.onEnd?.();
        audio.onerror = () => speakViaSynthesis(text, persona, options);
        await audio.play();
        return;
      } catch {
        // Fallback to synthesis
      }
    }
  }

  await speakViaSynthesis(text, persona, options);
}

async function speakViaSynthesis(
  text: string,
  persona: VoicePersona,
  options?: { onStart?: () => void; onEnd?: () => void }
): Promise<void> {
  try {
    window.speechSynthesis.cancel();

    const voices = await loadVoices();
    const selectedVoice = selectBestVoice(persona, voices);

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.pitch = persona.pitch;
    utterance.rate = persona.rate;
    utterance.volume = persona.volume;

    utterance.onstart = () => options?.onStart?.();
    utterance.onend = () => options?.onEnd?.();
    utterance.onerror = () => options?.onEnd?.();

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[VoicePersona] Speech error:', err);
    options?.onEnd?.();
  }
}
