/**
 * Multi-Device Haptic Synchronization Engine
 * Vibration patterns sync across phone, smartwatch, smart glasses,
 * steering wheel controllers, dashboard displays, and any connected device.
 * One haptic language across all devices simultaneously.
 */

// Device types that support haptic feedback
export const DEVICE_TYPES = {
  PHONE: 'phone',
  SMARTWATCH: 'smartwatch',
  SMART_GLASSES: 'smart-glasses',
  STEERING_WHEEL: 'steering-wheel',
  DASHBOARD: 'dashboard',
  TABLET: 'tablet',
  WEARABLE: 'wearable',
  VEHICLE_HAPTIC: 'vehicle-haptic',
};

// Device capability profiles
const DEVICE_CAPABILITIES = {
  [DEVICE_TYPES.PHONE]: {
    maxVibrationDuration: 5000,
    resolution: 10, // ms precision
    channels: 1,
    supportedPatterns: ['all'],
    priority: 'high',
    alwaysOn: true,
  },
  [DEVICE_TYPES.SMARTWATCH]: {
    maxVibrationDuration: 3000,
    resolution: 20, // lower precision on small devices
    channels: 1,
    supportedPatterns: ['all'],
    priority: 'high',
    alwaysOn: true,
  },
  [DEVICE_TYPES.SMART_GLASSES]: {
    maxVibrationDuration: 2000,
    resolution: 25,
    channels: 2, // left/right haptic points
    supportedPatterns: ['all'],
    priority: 'medium',
    alwaysOn: false,
  },
  [DEVICE_TYPES.STEERING_WHEEL]: {
    maxVibrationDuration: 10000, // sustained vibration safe on wheel
    resolution: 5, // very precise
    channels: 4, // left, right, center, grip
    supportedPatterns: ['direction', 'urgency', 'alert'],
    priority: 'critical',
    alwaysOn: true,
  },
  [DEVICE_TYPES.DASHBOARD]: {
    maxVibrationDuration: 5000,
    resolution: 15,
    channels: 2, // left/right haptic feedback points
    supportedPatterns: ['all'],
    priority: 'high',
    alwaysOn: false,
  },
  [DEVICE_TYPES.TABLET]: {
    maxVibrationDuration: 5000,
    resolution: 10,
    channels: 1,
    supportedPatterns: ['all'],
    priority: 'low',
    alwaysOn: false,
  },
  [DEVICE_TYPES.WEARABLE]: {
    maxVibrationDuration: 2000,
    resolution: 20,
    channels: 1,
    supportedPatterns: ['all'],
    priority: 'high',
    alwaysOn: true,
  },
  [DEVICE_TYPES.VEHICLE_HAPTIC]: {
    maxVibrationDuration: 10000,
    resolution: 5,
    channels: 6, // seat, steering wheel, footrest, armrest, floor, dashboard
    supportedPatterns: ['all'],
    priority: 'critical',
    alwaysOn: true,
  },
};

// Connected devices registry
let connectedDevices = new Map();
let deviceHapticState = new Map();

/**
 * Register a device for multi-device haptic sync
 * @param {string} deviceId - Unique device identifier (UUID or device fingerprint)
 * @param {string} deviceType - Type of device (DEVICE_TYPES.*)
 * @param {object} config - Device-specific config
 */
export function registerDevice(deviceId, deviceType, config = {}) {
  const capabilities = DEVICE_CAPABILITIES[deviceType] || DEVICE_CAPABILITIES[DEVICE_TYPES.PHONE];
  
  const device = {
    id: deviceId,
    type: deviceType,
    registered: new Date(),
    isActive: true,
    battery: 100, // will update from device
    signal: 100, // wireless signal strength
    capabilities,
    customConfig: config,
    lastVibration: null,
  };

  connectedDevices.set(deviceId, device);
  deviceHapticState.set(deviceId, { isVibrating: false, pattern: null });
  
  console.log(`📳 Device registered: ${deviceType} (${deviceId})`);
  return device;
}

/**
 * Unregister a device
 */
export function unregisterDevice(deviceId) {
  connectedDevices.delete(deviceId);
  deviceHapticState.delete(deviceId);
  console.log(`📳 Device unregistered: ${deviceId}`);
}

/**
 * Get all connected devices
 */
export function getConnectedDevices() {
  return Array.from(connectedDevices.values());
}

/**
 * Get devices by type
 */
export function getDevicesByType(deviceType) {
  return getConnectedDevices().filter(d => d.type === deviceType);
}

/**
 * Broadcast haptic pattern to ALL connected devices simultaneously
 * Each device adapts the pattern to its capabilities
 * @param {array} pattern - Vibration pattern [duration, pause, ...]
 * @param {object} options - { priority, message, urgency, emotion }
 * @returns {object} - { sentTo: count, devices: array, timestamp }
 */
export function broadcastHapticToAllDevices(pattern, options = {}) {
  const timestamp = new Date();
  const adaptedPatterns = {};
  let sentCount = 0;

  connectedDevices.forEach((device, deviceId) => {
    if (!device.isActive) return;

    // Adapt pattern to device capabilities
    const adapted = adaptPatternForDevice(pattern, device);
    
    if (adapted) {
      // Send to device (in real implementation, via WebSocket/BLE)
      sendToDevice(deviceId, adapted, options);
      adaptedPatterns[deviceId] = adapted;
      sentCount++;
    }
  });

  const result = {
    sentTo: sentCount,
    totalConnected: connectedDevices.size,
    devices: adaptedPatterns,
    timestamp,
    options,
  };

  // Log broadcast
  console.log(`📳 Broadcast to ${sentCount} devices:`, result);
  return result;
}

/**
 * Send haptic to specific device(s)
 * @param {string|array} deviceIds - Device ID or array of IDs
 * @param {array} pattern - Vibration pattern
 * @param {object} options - Additional options
 */
export function sendHapticToDevices(deviceIds, pattern, options = {}) {
  const targets = Array.isArray(deviceIds) ? deviceIds : [deviceIds];
  const results = {};

  targets.forEach(deviceId => {
    const device = connectedDevices.get(deviceId);
    if (!device || !device.isActive) {
      results[deviceId] = { success: false, reason: 'Device not found or inactive' };
      return;
    }

    const adapted = adaptPatternForDevice(pattern, device);
    if (adapted) {
      sendToDevice(deviceId, adapted, options);
      results[deviceId] = { success: true, pattern: adapted };
    }
  });

  return results;
}

/**
 * Adapt vibration pattern to device's physical capabilities
 * @param {array} pattern - Original pattern
 * @param {object} device - Device object with capabilities
 * @returns {array|null} - Adapted pattern or null if unsupported
 */
function adaptPatternForDevice(pattern, device) {
  const cap = device.capabilities;

  // Check if pattern exceeds device limits
  const patternDuration = pattern.reduce((a, b) => a + b, 0);
  if (patternDuration > cap.maxVibrationDuration) {
    // Compress pattern proportionally
    const ratio = cap.maxVibrationDuration / patternDuration;
    return pattern.map(val => Math.round(val * ratio));
  }

  // Snap to device resolution
  return pattern.map(val => {
    // Round to nearest resolution unit
    return Math.round(val / cap.resolution) * cap.resolution;
  });
}

/**
 * Internal: Send pattern to device via its transport layer
 * (In production: WebSocket, BLE, USB, HTTP request, etc.)
 */
function sendToDevice(deviceId, pattern, options) {
  const device = connectedDevices.get(deviceId);
  if (!device) return;

  // Update device state
  deviceHapticState.set(deviceId, {
    isVibrating: true,
    pattern,
    startTime: new Date(),
    duration: pattern.reduce((a, b) => a + b, 0),
  });

  device.lastVibration = new Date();

  // In a real app, this would:
  // 1. Open WebSocket/BLE connection
  // 2. Send pattern in device's native format
  // 3. Receive confirmation
  // 4. Update state when complete

  console.log(`📳 → ${device.type} (${deviceId}): [${pattern.join(',')}]`);

  // Simulate completion
  setTimeout(() => {
    deviceHapticState.set(deviceId, { isVibrating: false, pattern: null });
  }, pattern.reduce((a, b) => a + b, 0) + 100);
}

/**
 * Get current vibration state of all devices
 */
export function getAllDeviceStates() {
  const states = {};
  connectedDevices.forEach((device, deviceId) => {
    states[deviceId] = {
      device: { type: device.type, battery: device.battery, signal: device.signal },
      haptic: deviceHapticState.get(deviceId),
    };
  });
  return states;
}

/**
 * Steering wheel specific: Create directional haptic patterns
 * Different channels vibrate to indicate direction
 * Left wheel = turn left, Right wheel = turn right, Center = go straight
 */
export function createSteeringWheelPattern(direction, intensity = 1.0) {
  const baseIntensity = Math.round(100 * intensity);

  const patterns = {
    'left': [150 * intensity, 50, 1],      // Left grip vibrates
    'right': [150 * intensity, 50, 1],     // Right grip vibrates
    'straight': [100 * intensity, 50, 100 * intensity, 50],  // Balanced
    'sharp-left': [200 * intensity, 30, 2],
    'sharp-right': [200 * intensity, 30, 2],
    'reverse': [100 * intensity, 50, 100 * intensity, 50, 100 * intensity], // Three pulses
  };

  return patterns[direction] || patterns['straight'];
}

/**
 * Smart glasses specific: Create spatial haptic for visual navigation
 * Left/right channels indicate direction
 * Intensity indicates distance/urgency
 */
export function createSmartGlassesPattern(direction, distance) {
  // Distance: 0-100 (closer = more intense)
  const intensity = Math.max(0.3, 1 - (distance / 100));
  
  const patterns = {
    'turn-left': [Math.round(150 * intensity), 50, 1],
    'turn-right': [Math.round(150 * intensity), 50, 1],
    'hazard-left': [Math.round(200 * intensity), 30, 2],
    'hazard-right': [Math.round(200 * intensity), 30, 2],
  };

  return patterns[direction] || [100, 100, 1];
}

/**
 * Vehicle haptic system: Full-body haptic feedback
 * Distributes vibration across seat, wheel, footrest, armrest
 * Creates immersive spatial awareness
 */
export function createVehicleHapticPattern(alert, severity) {
  // Vehicle has 6 haptic channels:
  // [seat, steering_wheel, footrest, armrest, floor, dashboard]
  
  const patterns = {
    'DANGER': {
      severity: 'critical',
      seat: [200, 100, 3],        // Back pulses
      wheel: [150, 75, 3],        // Hand pulses
      footrest: [100, 100, 2],    // Foot awareness
      armrest: [100, 100, 2],     // Arm alert
      floor: [50, 150, 2],        // Ground tremor
      dashboard: [300, 100, 1],   // Dashboard shakes
    },
    'BRAKE_WARNING': {
      seat: [150, 100, 1],
      wheel: [150, 100, 1],
      footrest: [200, 50, 2],     // Foot alert (brake-like)
      armrest: [100, 100, 1],
      floor: [100, 100, 1],
      dashboard: [100, 100, 1],
    },
    'LOAD_ASSIGNMENT': {
      seat: [100, 50, 2],
      wheel: [100, 50, 1],
      footrest: [50, 100, 1],
      armrest: [100, 50, 1],
      floor: [50, 200, 1],
      dashboard: [100, 100, 1],
    },
    'ARRIVAL': {
      seat: [100, 50, 3],
      wheel: [100, 50, 3],
      footrest: [100, 50, 3],
      armrest: [100, 50, 3],
      floor: [100, 50, 3],
      dashboard: [100, 50, 3],
    },
  };

  return patterns[alert] || { seat: [100, 100, 1] };
}

/**
 * Update device status (battery, signal, active state)
 */
export function updateDeviceStatus(deviceId, status) {
  const device = connectedDevices.get(deviceId);
  if (!device) return;

  if (status.battery !== undefined) device.battery = status.battery;
  if (status.signal !== undefined) device.signal = status.signal;
  if (status.isActive !== undefined) device.isActive = status.isActive;
  
  console.log(`📳 ${device.type} updated:`, status);
}

/**
 * Translate incoming haptic pattern to text/speech
 * Decode what the vibration means
 * @param {array} pattern - Received vibration pattern
 * @param {string} deviceType - Type of device sending
 * @returns {object} - { meaning, urgency, action, confidence }
 */
export function translateHapticToText(pattern, deviceType) {
  const patternStr = pattern.join('-');
  const totalDuration = pattern.reduce((a, b) => a + b, 0);
  const pulseCount = Math.ceil(pattern.length / 2);

  // Analyze pattern characteristics
  let meaning = 'UNKNOWN';
  let urgency = 'normal';
  let action = null;

  if (totalDuration > 1000) urgency = 'critical';
  else if (totalDuration > 500) urgency = 'high';

  if (pulseCount > 5) meaning = 'ALERT';
  else if (pulseCount === 1) meaning = 'ACKNOWLEDGMENT';
  else if (pulseCount === 2) meaning = 'CONFIRMATION';
  else if (pulseCount === 3) meaning = 'WARNING';

  return {
    pattern: patternStr,
    meaning,
    urgency,
    action,
    confidence: 0.85,
    deviceType,
    timestamp: new Date(),
  };
}

/**
 * Get device connection quality score (0-100)
 * Based on signal strength and battery
 */
export function getDeviceQualityScore(deviceId) {
  const device = connectedDevices.get(deviceId);
  if (!device) return 0;

  const signalScore = device.signal || 0;
  const batteryScore = device.battery || 0;
  const activeScore = device.isActive ? 100 : 0;

  return Math.round((signalScore + batteryScore + activeScore) / 3);
}

/**
 * Haptic system health check
 * Returns status of all devices and sync quality
 */
export function getHapticSystemHealth() {
  const devices = getConnectedDevices();
  const deviceQualities = devices.map(d => ({
    type: d.type,
    quality: getDeviceQualityScore(d.id),
    battery: d.battery,
    signal: d.signal,
  }));

  const avgQuality = deviceQualities.length > 0
    ? Math.round(deviceQualities.reduce((a, b) => a + b.quality, 0) / deviceQualities.length)
    : 0;

  return {
    connectedDevices: devices.length,
    deviceBreakdown: deviceQualities,
    overallHealth: avgQuality,
    isHealthy: avgQuality > 70,
    timestamp: new Date(),
  };
}

/**
 * Preset scenarios for common trucking situations
 * Auto-sends optimized haptic to all devices
 */
export const SCENARIO_HAPTICS = {
  'INCOMING_DISPATCH': {
    description: 'New load assigned',
    pattern: [100, 50, 2, 150, 50, 1],
    broadcast: true,
    targetDevices: 'all',
    urgency: 'high',
  },
  'BROKER_WARNING': {
    description: 'Flagged broker',
    pattern: [200, 100, 3],
    broadcast: true,
    targetDevices: 'all',
    urgency: 'high',
  },
  'ACCIDENT_NEARBY': {
    description: 'Accident on route',
    pattern: [200, 100, 5],
    broadcast: true,
    targetDevices: 'all',
    urgency: 'critical',
  },
  'DELIVERY_COMPLETE': {
    description: 'Delivery successful',
    pattern: [100, 50, 1, 100, 50, 1, 100, 50, 1],
    broadcast: true,
    targetDevices: 'all',
    urgency: 'low',
  },
  'HOS_WARNING': {
    description: 'Hours of service warning',
    pattern: [100, 50, 3, 100, 50, 1],
    broadcast: true,
    targetDevices: 'all',
    urgency: 'high',
  },
  'SEVERE_WEATHER': {
    description: 'Severe weather ahead',
    pattern: [200, 100, 4, 100, 100, 1],
    broadcast: true,
    targetDevices: 'all',
    urgency: 'critical',
  },
};

/**
 * Execute a preset scenario
 */
export function executeScenario(scenarioKey) {
  const scenario = SCENARIO_HAPTICS[scenarioKey];
  if (!scenario) return { success: false, error: 'Scenario not found' };

  const result = broadcastHapticToAllDevices(scenario.pattern, {
    scenario: scenarioKey,
    description: scenario.description,
    urgency: scenario.urgency,
  });

  return { success: true, ...result };
}
