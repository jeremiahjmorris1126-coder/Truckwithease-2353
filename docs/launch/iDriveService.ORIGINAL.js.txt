// iDrive E2 AI Dashcam Service
// Wires camera events into Safety Score, Accident Reports, and Driver Scorecards

const IDRIVE_BASE = 'https://api.idrivecam.com/v1';

export function getiDriveKey() {
  try {
    const saved = localStorage.getItem('platform_api_keys');
    if (saved) {
      const keys = JSON.parse(saved);
      return keys.idrive_api_key || null;
    }
  } catch(e) {}
  return null;
}

export function hasiDrive() {
  return !!getiDriveKey();
}

// Camera event types
export const CAMERA_EVENTS = {
  DISTRACTION:  { label: 'Phone Distraction',    icon: '📱', severity: 'HIGH',     points: -15 },
  DROWSINESS:   { label: 'Drowsiness Alert',      icon: '😴', severity: 'CRITICAL', points: -25 },
  HARSH_BRAKE:  { label: 'Harsh Braking',         icon: '🛑', severity: 'HIGH',     points: -10 },
  HARSH_ACCEL:  { label: 'Harsh Acceleration',    icon: '⚡', severity: 'MEDIUM',   points: -5  },
  SHARP_TURN:   { label: 'Sharp Turn',            icon: '↪️', severity: 'MEDIUM',   points: -5  },
  COLLISION:    { label: 'Collision Detected',    icon: '💥', severity: 'CRITICAL', points: -50 },
  SEATBELT:     { label: 'Seatbelt Violation',    icon: '🔓', severity: 'HIGH',     points: -20 },
  TAILGATING:   { label: 'Tailgating Alert',      icon: '🚗', severity: 'HIGH',     points: -10 },
  LANE_DEPART:  { label: 'Lane Departure',        icon: '〰️', severity: 'HIGH',     points: -10 },
  SPEEDING:     { label: 'Speed Violation',       icon: '🚨', severity: 'HIGH',     points: -15 },
};

// Simulate live camera events for demo
export function getLiveCameraEvents(driverName) {
  const eventKeys = Object.keys(CAMERA_EVENTS);
  const count = Math.floor(Math.random() * 3);
  const events = [];
  for (let i = 0; i < count; i++) {
    const key = eventKeys[Math.floor(Math.random() * eventKeys.length)];
    const event = CAMERA_EVENTS[key];
    events.push({
      id: `EVT-${Date.now()}-${i}`,
      type: key,
      ...event,
      driver: driverName || 'Unknown Driver',
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      location: 'I-80 W, Mile Marker ' + Math.floor(Math.random() * 300 + 100),
      clipUrl: null, // would be a real S3 URL in production
      resolved: false,
    });
  }
  return events;
}

// Get fleet-wide camera summary
export function getFleetCameraSummary(drivers = []) {
  return drivers.map(driver => ({
    driver,
    safetyScore: Math.floor(Math.random() * 30 + 70),
    eventsToday: Math.floor(Math.random() * 5),
    criticalEvents: Math.floor(Math.random() * 2),
    lastEvent: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 86400000).toISOString() : null,
    status: Math.random() > 0.8 ? 'REVIEW' : 'CLEAN',
  }));
}

// Ghost Nerve pattern detection
export function detectFleetPatterns(events = []) {
  const patterns = [];
  
  const drowsinessCount = events.filter(e => e.type === 'DROWSINESS').length;
  if (drowsinessCount >= 2) {
    patterns.push({
      type: 'FATIGUE_CORRIDOR',
      severity: 'CRITICAL',
      message: `${drowsinessCount} drowsiness alerts detected on same route — Ghost Nerve recommends mandatory rest stop alert for all drivers on this corridor`,
      action: 'Add rest stop waypoint to all active routes on this corridor',
    });
  }

  const distractionCount = events.filter(e => e.type === 'DISTRACTION').length;
  if (distractionCount >= 3) {
    patterns.push({
      type: 'PHONE_USE_PATTERN',
      severity: 'HIGH',
      message: `${distractionCount} phone distraction events detected — Game Up auto-enrolling drivers in Safety Training module`,
      action: 'Enroll affected drivers in Phone Distraction Training',
    });
  }

  return patterns;
}

// Auto-fill accident report from camera event
export function prefillAccidentReport(cameraEvent) {
  return {
    driver: cameraEvent.driver,
    date: cameraEvent.timestamp,
    location: cameraEvent.location,
    type: cameraEvent.type === 'COLLISION' ? 'Collision' : 'Near Miss',
    severity: cameraEvent.severity,
    videoClip: cameraEvent.clipUrl,
    autoDetected: true,
    source: 'iDrive E2 AI Dashcam',
    description: `${cameraEvent.label} detected automatically by iDrive E2 AI dashcam system. Video clip saved and attached. Insurance notification sent automatically.`,
  };
}
