/**
 * ELD Hardware Integration — client for /api/eld
 * ==============================================
 * Rewritten from the original browser-only module. What changed and why:
 *
 *  1. The original wrote to five PocketBase collections that never existed
 *     (eld_devices, eld_sync_channels, eld_telemetry, quantum_fatigue_states,
 *     fatigue_alerts). Every write silently failed. Real Turso tables now exist
 *     and the server owns them.
 *  2. The original scored driver fatigue with Math.random() in four places
 *     (calculateLaneVariance, calculateSpeedConsistency, estimateReactionTime,
 *     and the 128-dimension "quantum" vector). On a safety feature that is
 *     worse than nothing. Scoring is now server-side and derived only from
 *     recorded telemetry; under 10 samples it returns insufficientData instead
 *     of guessing.
 *
 * The original file is preserved at docs/launch/eldIntegration.ORIGINAL.js.txt
 * Every export from the original is kept so consumer pages need no edits.
 */

const BASE = '/api/eld';

export const ELD_DEVICE_TYPES = {
  GPS_TRACKER: 'gps_tracker',
  OBD2_READER: 'obd2_reader',
  DASH_CAM: 'dash_cam',
  CELLULAR_MODEM: 'cellular_modem',
  STEERING_WHEEL_HAPTIC: 'steering_wheel_haptic',
  VEHICLE_SEAT_HAPTIC: 'vehicle_seat_haptic',
};

async function call(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || `ELD request failed (${res.status})`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

/** Register physical ELD hardware to a driver. */
export async function registerELDDevice(driverId, deviceType, deviceSerial, firmwareVersion) {
  const out = await call('/devices', {
    method: 'POST',
    body: JSON.stringify({ driverId, deviceType, deviceSerial, firmwareVersion }),
  });
  return out.device;
}

/**
 * Compat no-op. The original created rows in an `eld_sync_channels` collection
 * that never existed. There is no separate sync-channel table on the server:
 * the device row's lastSync column IS the channel, and it is updated every time
 * the device posts telemetry.
 */
export async function createDeviceSyncChannel(deviceId, driverId) {
  return {
    deviceId,
    driverId,
    channel: 'device-row',
    created: false,
    note: 'No separate sync channel exists. Device lastSync is updated on every POST /api/eld/telemetry.',
  };
}

/** Push one telemetry sample. Accepts camelCase or the original snake_case keys. */
export async function ingestELDTelemetry(deviceId, rawData = {}) {
  return call('/telemetry', {
    method: 'POST',
    body: JSON.stringify({ deviceId, ...rawData }),
  });
}

/**
 * Score fatigue for the device's recent window. The server scores on ingest, so
 * this posts the sample (when one is given) and returns the server's score.
 * Returns { insufficientData: true, score: null, level: 'unknown' } below 10
 * samples rather than inventing a number.
 */
export async function processTelemetryForFatigue(deviceId, telemetryRecord = null) {
  if (telemetryRecord) {
    const out = await ingestELDTelemetry(deviceId, telemetryRecord);
    return out.fatigue;
  }
  const out = await call(`/devices/${encodeURIComponent(deviceId)}/sync`, { method: 'POST' });
  return out;
}

/** Original misspelled name, kept as an alias so existing callers keep working. */
export const processTelemtryForFatigue = processTelemetryForFatigue;

/**
 * The original built a 128-dimension "quantum" vector out of Math.random().
 * That is removed. This returns the server's fatigue state for the driver,
 * computed from real telemetry only.
 */
export async function updateQuantumFatigueState(driverId, _fatigueFeatures, _timestamp) {
  const status = await getELDStatus(driverId);
  return {
    driverId,
    fatigue: status.fatigue,
    samples: status.telemetrySamples8h ?? 0,
    note: 'Fatigue is scored server-side from recorded telemetry. No synthetic feature vector is generated.',
  };
}

/** Surface a critical fatigue state to the UI. No server alert table exists yet. */
export async function triggerFatigueCriticalAlert(driverId, fatigueState) {
  const alert = {
    driverId,
    level: fatigueState?.level ?? 'unknown',
    score: fatigueState?.score ?? null,
    action: fatigueState?.action ?? 'monitor',
    raisedAt: new Date().toISOString(),
    persisted: false,
    note: 'Alert is client-side only. There is no fatigue_alerts table yet, so this is not stored.',
  };
  await sendMultimodalAlert(driverId, alert);
  return alert;
}

/**
 * Compat stub. The original flipped load rows in a collection that did not
 * exist. Load assignment pausing is not implemented server-side.
 */
export async function pauseLoadAssignments(driverId) {
  return {
    driverId,
    paused: false,
    note: 'Not implemented. Pausing load assignments requires a dispatch state machine that does not exist yet.',
  };
}

/** Rest-stop guidance. Advisory only — it does not know real parking availability. */
export async function recommendRestStop(driverId) {
  const status = await getELDStatus(driverId).catch(() => null);
  const level = status?.fatigue?.level ?? 'unknown';
  const urgent = level === 'critical' || level === 'high';
  return {
    driverId,
    urgency: urgent ? 'immediate' : 'routine',
    recommendation: urgent
      ? 'Stop at the next safe location. Do not push to the next planned stop.'
      : 'Take your next break on schedule.',
    note: 'Advisory only. This does not check live truck-parking availability.',
  };
}

/** Client-side alert surface (console + browser notification when permitted). */
export async function sendMultimodalAlert(driverId, alertConfig = {}) {
  const message = alertConfig.recommendation || alertConfig.message
    || `Fatigue level ${alertConfig.level ?? 'unknown'} for driver ${driverId}`;
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try { new Notification('TruckWithEase — ELD', { body: message }); } catch { /* ignore */ }
  }
  return { delivered: ['ui'], message, note: 'Haptic and in-cab audio channels require hardware that is not connected.' };
}

/** Ask the server whether a device is inside its sync window. */
export async function syncDeviceStatus(deviceId, _statusData) {
  return call(`/devices/${encodeURIComponent(deviceId)}/sync`, { method: 'POST' });
}

/** Full ELD picture for a driver: devices, online state, fatigue window. */
export async function getELDStatus(driverId) {
  return call(`/status/${encodeURIComponent(driverId)}`);
}

/** Registered devices for a driver. */
export async function getELDDevices(driverId) {
  const out = await call(`/devices/${encodeURIComponent(driverId)}`);
  return out.devices;
}

/** Retire a device (soft delete). */
export async function retireELDDevice(deviceId) {
  return call(`/devices/${encodeURIComponent(deviceId)}/retire`, { method: 'POST' });
}

export default {
  ELD_DEVICE_TYPES,
  registerELDDevice,
  createDeviceSyncChannel,
  ingestELDTelemetry,
  processTelemetryForFatigue,
  processTelemtryForFatigue,
  updateQuantumFatigueState,
  triggerFatigueCriticalAlert,
  pauseLoadAssignments,
  recommendRestStop,
  sendMultimodalAlert,
  syncDeviceStatus,
  getELDStatus,
  getELDDevices,
  retireELDDevice,
};
