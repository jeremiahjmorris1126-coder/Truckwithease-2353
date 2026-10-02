/**
 * voiceCommandSampleService.ts
 * Manages recorded voice samples for global voice commands in TRUCKWITHEASE.
 * Allows recording, persisting in IndexedDB, and triggering common actions
 * like 'Open load board' and 'Start DVIR audit'.
 */

import { TabType } from '../types';

export interface VoiceCommandSample {
  id: string;
  label: string;
  primaryPhrase: string;
  aliases: string[];
  description: string;
  actionType: 'NAVIGATE' | 'POLL_ALL' | 'ACTION';
  targetTab?: TabType;
  responseSpeech: string;
  category: 'LOGISTICS' | 'SAFETY' | 'COMPLIANCE' | 'TELEMETRY' | 'NAVIGATION';
  fmcsaRef?: string;
  hasRecordedSample?: boolean;
  sampleSource?: 'MIC_RECORDING' | 'FILE_UPLOAD' | 'FOUNDER_SAMPLE';
  recordedAudioUrl?: string;
  durationSeconds?: number;
  recordedAt?: string;
}

export interface StoredCommandAudioRecord {
  commandId: string;
  blob: Blob;
  mimeType: string;
  durationSeconds: number;
  recordedAt: string;
  source: 'MIC_RECORDING' | 'FILE_UPLOAD' | 'FOUNDER_SAMPLE';
  fileName?: string;
  sizeBytes: number;
}

const DB_NAME = 'TruckWithEase_VoiceCommands_DB';
const DB_VERSION = 1;
const STORE_NAME = 'command_audio_samples';

// Default Master Commands definition
export const DEFAULT_VOICE_COMMAND_SAMPLES: VoiceCommandSample[] = [
  {
    id: 'cmd_open_load_board',
    label: 'Open Load Board',
    primaryPhrase: 'Open load board',
    aliases: [
      'open load board',
      'load board',
      'show load board',
      'the load board',
      'goat load board',
      'find loads',
      'freight board',
      'loadboard',
      'go to load board',
      'bring up load board',
      'open goat',
      'goat board',
    ],
    description: 'Switches directly to G.O.A.T. Quantum Load Board with live high-paying freight matches',
    actionType: 'NAVIGATE',
    targetTab: 'goat',
    responseSpeech: 'Opening G.O.A.T. Load Board now.',
    category: 'LOGISTICS',
    fmcsaRef: 'Broker Transparency 49 CFR § 371.3',
  },
  {
    id: 'cmd_start_dvir_audit',
    label: 'Start DVIR Audit',
    primaryPhrase: 'Start DVIR audit',
    aliases: [
      'start dvir audit',
      'dvir audit',
      'start dvir',
      'dvir inspection',
      'begin dvir',
      'pre trip dvir',
      'post trip dvir',
      'run dvir audit',
      'inspect truck',
      'vehicle inspection',
      'autonomous dvir',
      'dvir agent',
      'open dvir',
      'walk around inspection',
    ],
    description: 'Launches Autonomous Pre/Post-Trip DVIR Inspection and FMCSA compliance audit agent',
    actionType: 'NAVIGATE',
    targetTab: 'dvir-agent',
    responseSpeech: 'Starting autonomous DVIR audit agent and vehicle inspection.',
    category: 'SAFETY',
    fmcsaRef: '49 CFR § 396.11 & § 396.13',
  },
  {
    id: 'cmd_start_pretrip_dvir',
    label: 'Start Pre-Trip DVIR',
    primaryPhrase: 'Start pre-trip DVIR',
    aliases: [
      'start pre-trip dvir',
      'start pre trip dvir',
      'pre-trip dvir',
      'pre trip dvir',
      'pre trip inspection',
      'pre-trip inspection',
      'begin pre-trip',
      'pre-trip audit',
    ],
    description: 'Triggers statutory FMCSA 49 CFR § 396.11 Pre-Trip walk-around inspection audit',
    actionType: 'NAVIGATE',
    targetTab: 'dvir-agent',
    responseSpeech: 'Pre-trip DVIR walk-around audit initiated.',
    category: 'SAFETY',
    fmcsaRef: '49 CFR § 396.11',
  },
  {
    id: 'cmd_start_posttrip_dvir',
    label: 'Start Post-Trip DVIR',
    primaryPhrase: 'Start post-trip DVIR',
    aliases: [
      'start post-trip dvir',
      'start post trip dvir',
      'post-trip dvir',
      'post trip dvir',
      'post trip inspection',
      'post-trip inspection',
      'begin post trip',
      'post-trip audit',
      'end of day dvir',
    ],
    description: 'Triggers statutory Post-Trip DVIR walk-around and defect ledger sign-off',
    actionType: 'NAVIGATE',
    targetTab: 'dvir-agent',
    responseSpeech: 'Post-trip DVIR inspection mode active. Walk-around defect ledger initiated.',
    category: 'SAFETY',
    fmcsaRef: '49 CFR § 396.11',
  },
  {
    id: 'cmd_open_hos_clocks',
    label: 'Open HOS Clocks',
    primaryPhrase: 'Open HOS clocks',
    aliases: [
      'open hos',
      'open hos clocks',
      'hos clocks',
      'hours of service',
      'duty status',
      'duty clocks',
      'eld clocks',
      'driving clock',
      'logbook',
      'open eld',
      'check clocks',
    ],
    description: 'Displays FMCSA 49 CFR § 395 11h/14h/70h Statutory Duty Clocks and logbook',
    actionType: 'NAVIGATE',
    targetTab: 'hos',
    responseSpeech: 'Opening Hours of Service duty clocks.',
    category: 'COMPLIANCE',
    fmcsaRef: '49 CFR § 395.3',
  },
  {
    id: 'cmd_open_incab_hud',
    label: 'Open In-Cab HUD',
    primaryPhrase: 'Open In-Cab HUD',
    aliases: [
      'open in-cab hud',
      'open in cab hud',
      'in cab hud',
      'open hud',
      'night hud',
      'roadside mode',
      'dark hud',
      'inspection mode',
      'switch to hud',
      'in-cab mode',
    ],
    description: 'Engages zero-glare In-Cab Night HUD with silent roadside DOT protection',
    actionType: 'NAVIGATE',
    targetTab: 'nighthud',
    responseSpeech: 'Engaging In-Cab Night HUD. Silent background voice sentinel active.',
    category: 'NAVIGATION',
    fmcsaRef: '49 CFR § 395.15(f)',
  },
  {
    id: 'cmd_open_bridge_radar',
    label: 'Open Bridge Radar',
    primaryPhrase: 'Open bridge radar',
    aliases: [
      'open bridge radar',
      'open radar',
      'bridge radar',
      'radar cockpit',
      'low bridge radar',
      'radar',
      'low bridge',
      'overhead bridges',
    ],
    description: 'Launches FHWA Item 54B Radar scanning 618,000+ overhead bridge clearances',
    actionType: 'NAVIGATE',
    targetTab: 'cockpit',
    responseSpeech: 'Opening low bridge radar cockpit.',
    category: 'SAFETY',
    fmcsaRef: 'FHWA Item 54B',
  },
  {
    id: 'cmd_poll_all_mesh',
    label: 'Poll All Mesh Nodes',
    primaryPhrase: 'Poll all mesh nodes',
    aliases: [
      'poll all',
      'poll mesh',
      'poll network',
      'sync nodes',
      'refresh mesh',
      'ping nodes',
      'poll telemetry',
      'trigger poll',
      'sync all',
      'ping network',
    ],
    description: 'Triggers live telemetry ping across all 24 connected telematics pipelines',
    actionType: 'POLL_ALL',
    responseSpeech: 'Polling all mesh pipelines now.',
    category: 'TELEMETRY',
    fmcsaRef: 'CAN-Bus J1939 Telematics',
  },
  {
    id: 'cmd_open_dispatch',
    label: 'Open Dispatch Zero',
    primaryPhrase: 'Open Dispatch Zero',
    aliases: [
      'open dispatch',
      'dispatch zero',
      'pending loads',
      'rate cons',
      'active orders',
      'dispatch',
      'show dispatch',
    ],
    description: 'Opens real-time dispatch desk and pending rate confirmation pipeline',
    actionType: 'NAVIGATE',
    targetTab: 'dispatch',
    responseSpeech: 'Opening Dispatch Zero console.',
    category: 'LOGISTICS',
  },
  {
    id: 'cmd_report_roadside_issue',
    label: 'Report Roadside Issue',
    primaryPhrase: 'Report roadside issue',
    aliases: [
      'report roadside issue',
      'roadside breakdown',
      'report breakdown',
      'truck issue',
      'engine breakdown',
      'need rescue',
      'roadside emergency',
    ],
    description: 'Dispatches roadside incident ticket with live GPS coordinates to safety network',
    actionType: 'NAVIGATE',
    targetTab: 'dvir-agent',
    responseSpeech: 'Roadside breakdown report queued. Safety network alerted.',
    category: 'SAFETY',
    fmcsaRef: 'CVSA Out-of-Service Criteria',
  },
];

// Open or initialize IndexedDB for command audio samples
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'commandId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save an audio recording sample for a specific voice command
 */
export async function saveCommandVoiceSample(
  commandId: string,
  audioBlob: Blob,
  durationSeconds: number,
  source: 'MIC_RECORDING' | 'FILE_UPLOAD' | 'FOUNDER_SAMPLE',
  fileName?: string
): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record: StoredCommandAudioRecord = {
      commandId,
      blob: audioBlob,
      mimeType: audioBlob.type || 'audio/webm',
      durationSeconds,
      recordedAt: new Date().toISOString(),
      source,
      fileName,
      sizeBytes: audioBlob.size,
    };

    return new Promise((resolve, reject) => {
      const putRequest = store.put(record);
      putRequest.onsuccess = () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('truckwithease_command_sample_saved', {
              detail: { commandId, source, timestamp: Date.now() },
            })
          );
        }
        resolve();
      };
      putRequest.onerror = () => reject(putRequest.error);
    });
  } catch (err) {
    console.warn('Error saving command voice sample to IndexedDB:', err);
  }
}

/**
 * Get a saved audio recording sample for a command
 */
export async function getCommandVoiceSample(
  commandId: string
): Promise<{
  audioUrl: string;
  recording: StoredCommandAudioRecord;
} | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve) => {
      const getRequest = store.get(commandId);
      getRequest.onsuccess = () => {
        const record = getRequest.result as StoredCommandAudioRecord | undefined;
        if (!record || !record.blob) {
          resolve(null);
          return;
        }
        const audioUrl = URL.createObjectURL(record.blob);
        resolve({ audioUrl, recording: record });
      };
      getRequest.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Error retrieving command voice sample from IndexedDB:', err);
    return null;
  }
}

/**
 * Get all saved command voice samples map
 */
export async function getAllCommandVoiceSamples(): Promise<
  Record<string, { audioUrl: string; duration: number; source: string; recordedAt: string }>
> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve) => {
      const request = store.openCursor();
      const results: Record<
        string,
        { audioUrl: string; duration: number; source: string; recordedAt: string }
      > = {};

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null;
        if (cursor) {
          const record = cursor.value as StoredCommandAudioRecord;
          if (record && record.blob) {
            results[record.commandId] = {
              audioUrl: URL.createObjectURL(record.blob),
              duration: record.durationSeconds,
              source: record.source,
              recordedAt: record.recordedAt,
            };
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => resolve({});
    });
  } catch (err) {
    console.warn('Error reading all command voice samples:', err);
    return {};
  }
}

/**
 * Delete a command voice sample
 */
export async function deleteCommandVoiceSample(commandId: string): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const delRequest = store.delete(commandId);
      delRequest.onsuccess = () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('truckwithease_command_sample_saved', {
              detail: { commandId, deleted: true, timestamp: Date.now() },
            })
          );
        }
        resolve();
      };
      delRequest.onerror = () => reject(delRequest.error);
    });
  } catch (err) {
    console.warn('Error deleting command voice sample:', err);
  }
}

/**
 * Match a raw spoken phrase to a VoiceCommandSample definition.
 * Handles exact, fuzzy, alias, and substring matching.
 */
export function matchVoicePhraseToCommand(phrase: string): VoiceCommandSample | null {
  const clean = phrase.toLowerCase().trim();
  if (!clean) return null;

  // 1. Check exact primary phrases first
  for (const cmd of DEFAULT_VOICE_COMMAND_SAMPLES) {
    if (clean === cmd.primaryPhrase.toLowerCase()) {
      return cmd;
    }
  }

  // 2. Check aliases with word boundary regex or inclusion
  for (const cmd of DEFAULT_VOICE_COMMAND_SAMPLES) {
    for (const alias of cmd.aliases) {
      const aliasClean = alias.toLowerCase();
      if (clean === aliasClean) {
        return cmd;
      }
      // Check if the user said "please open load board" or "can you start dvir audit"
      const regex = new RegExp(`\\b${escapeRegExp(aliasClean)}\\b`, 'i');
      if (regex.test(clean)) {
        return cmd;
      }
    }
  }

  // 3. Fallback partial checks for key terms
  if (clean.includes('load board') || clean.includes('loadboard')) {
    return DEFAULT_VOICE_COMMAND_SAMPLES.find((c) => c.id === 'cmd_open_load_board') || null;
  }

  if (
    clean.includes('dvir') ||
    clean.includes('d.v.i.r.') ||
    clean.includes('pre-trip') ||
    clean.includes('pre trip') ||
    clean.includes('post-trip') ||
    clean.includes('post trip')
  ) {
    if (clean.includes('post')) {
      return DEFAULT_VOICE_COMMAND_SAMPLES.find((c) => c.id === 'cmd_start_posttrip_dvir') || null;
    }
    if (clean.includes('pre')) {
      return DEFAULT_VOICE_COMMAND_SAMPLES.find((c) => c.id === 'cmd_start_pretrip_dvir') || null;
    }
    return DEFAULT_VOICE_COMMAND_SAMPLES.find((c) => c.id === 'cmd_start_dvir_audit') || null;
  }

  return null;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
