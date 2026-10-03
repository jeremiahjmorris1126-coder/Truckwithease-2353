/**
 * founderVoiceService.ts
 * Manages authentic founder voice recordings (mic recording or file upload)
 * and custom reworded scripts for Jeremiah Morris in TRUCKWITHEASE.
 */

const DB_NAME = 'TruckWithEase_Voice_DB';
const DB_VERSION = 1;
const STORE_NAME = 'founder_audio_recordings';
const SCRIPTS_STORAGE_KEY = 'truckwithease_founder_custom_scripts_v1';
const AUDIO_MODE_KEY = 'truckwithease_founder_audio_mode_v1';

export interface ChapterScriptOverride {
  id: string;
  title?: string;
  subtitle?: string;
  spokenScript: string;
  tagline?: string;
  summary?: string;
  updatedAt: string;
}

export interface StoredAudioRecording {
  chapterId: string;
  blob: Blob;
  mimeType: string;
  durationSeconds: number;
  recordedAt: string;
  source: 'MIC_RECORDING' | 'FILE_UPLOAD';
  fileName?: string;
  sizeBytes: number;
}

// Open or initialize IndexedDB for audio blobs
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
        db.createObjectStore(STORE_NAME, { keyPath: 'chapterId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save an audio recording (from microphone or uploaded file) for a given chapter
 */
export async function saveFounderAudioRecording(
  chapterId: string,
  audioBlob: Blob,
  durationSeconds: number,
  source: 'MIC_RECORDING' | 'FILE_UPLOAD',
  fileName?: string
): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record: StoredAudioRecording = {
      chapterId,
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
        // Also set audio playback mode to custom recording automatically
        setAudioPlaybackMode('CUSTOM_RECORDING');
        // Notify listeners across app
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('truckwithease_voice_updated', {
              detail: { chapterId, source, timestamp: Date.now() },
            })
          );
        }
        resolve();
      };
      putRequest.onerror = () => reject(putRequest.error);
    });
  } catch (err) {
    console.warn('Error saving to IndexedDB, fallback to session memory:', err);
  }
}

/**
 * Get the saved audio recording for a chapter (returns Blob and object URL)
 */
export async function getFounderAudioRecording(
  chapterId: string
): Promise<{
  audioUrl: string;
  recording: StoredAudioRecording;
} | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve) => {
      const getRequest = store.get(chapterId);
      getRequest.onsuccess = () => {
        const record = getRequest.result as StoredAudioRecording | undefined;
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
    console.warn('Error loading from IndexedDB:', err);
    return null;
  }
}

/**
 * Delete a saved audio recording for a chapter
 */
export async function deleteFounderAudioRecording(chapterId: string): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const delRequest = store.delete(chapterId);
      delRequest.onsuccess = () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('truckwithease_voice_updated', {
              detail: { chapterId, deleted: true, timestamp: Date.now() },
            })
          );
        }
        resolve();
      };
      delRequest.onerror = () => reject(delRequest.error);
    });
  } catch (err) {
    console.warn('Error deleting recording from IndexedDB:', err);
  }
}

/**
 * Get all custom reworded scripts from localStorage
 */
export function getAllCustomScripts(): Record<string, ChapterScriptOverride> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SCRIPTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save a custom reworded script for a chapter
 */
export function saveCustomScript(override: ChapterScriptOverride): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getAllCustomScripts();
    current[override.id] = {
      ...override,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(current));

    window.dispatchEvent(
      new CustomEvent('truckwithease_script_updated', {
        detail: { chapterId: override.id },
      })
    );
  } catch (err) {
    console.warn('Error saving custom script:', err);
  }
}

/**
 * Reset a custom script back to original default
 */
export function resetCustomScript(chapterId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getAllCustomScripts();
    delete current[chapterId];
    localStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(current));

    window.dispatchEvent(
      new CustomEvent('truckwithease_script_updated', {
        detail: { chapterId },
      })
    );
  } catch (err) {
    console.warn('Error resetting custom script:', err);
  }
}

/**
 * Audio Mode: whether to use the authentic recorded voice or AI speech synthesis
 */
export function getAudioPlaybackMode(): 'CUSTOM_RECORDING' | 'AI_SYNTHESIS' {
  if (typeof window === 'undefined') return 'CUSTOM_RECORDING';
  try {
    const mode = localStorage.getItem(AUDIO_MODE_KEY);
    return mode === 'AI_SYNTHESIS' ? 'AI_SYNTHESIS' : 'CUSTOM_RECORDING';
  } catch {
    return 'CUSTOM_RECORDING';
  }
}

export function setAudioPlaybackMode(mode: 'CUSTOM_RECORDING' | 'AI_SYNTHESIS'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUDIO_MODE_KEY, mode);
    window.dispatchEvent(
      new CustomEvent('truckwithease_audio_mode_changed', {
        detail: { mode },
      })
    );
  } catch (err) {
    console.warn('Error saving audio mode:', err);
  }
}
