// iDrive Cam (AI dashcam) service — NOT WIRED.
//
// Honest state, 2026-08-24:
//   * This file targets iDrive *Cam* (https://api.idrivecam.com/v1), a dashcam
//     product. It is unrelated to iDrive *e2*, the S3-compatible object storage
//     that IS wired (see packages/web/src/api/lib/s3.ts).
//   * TruckWithEase has no dashcam account, no camera hardware, and no API
//     credential for any camera vendor.
//   * Therefore this module never invents events. getLiveCameraEvents() and
//     getFleetCameraSummary() return empty arrays until a real integration and
//     a server-side credential exist.
//   * Camera keys must never live in the browser. When a dashcam vendor is
//     signed, the key goes in the root .env and the calls go through a server
//     route (packages/web/src/api/routes/), like every other provider here.
//
// The deterministic parts of this module (CAMERA_EVENTS, detectFleetPatterns,
// prefillAccidentReport) are real logic that operate on events you pass in, so
// they stay.

export const IDRIVE_STATUS = {
  live: false,
  provider: 'iDrive Cam',
  source: null,
  note:
    'No dashcam integration is wired. TruckWithEase has no camera vendor account or API credential, so no camera events exist. Nothing on this page is live telemetry.',
};

// No client-side key storage. A camera credential would be server-side only.
export function getiDriveKey() {
  return null;
}

export function hasiDrive() {
  return false;
}

// Event taxonomy + scoring weights. Reference data, not observations.
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

// No camera source connected → no events. Never fabricate rows.
export function getLiveCameraEvents() {
  return [];
}

// No camera source connected → no per-driver camera summary.
export function getFleetCameraSummary() {
  return [];
}

// Pattern detection over events the caller supplies. Deterministic, no data of
// its own — returns [] when there are no events, which is the current state.
export function detectFleetPatterns(events = []) {
  const patterns = [];

  const drowsinessCount = events.filter(e => e.type === 'DROWSINESS').length;
  if (drowsinessCount >= 2) {
    patterns.push({
      type: 'FATIGUE_CORRIDOR',
      severity: 'CRITICAL',
      message: `${drowsinessCount} drowsiness alerts detected on same route — recommend a mandatory rest stop alert for all drivers on this corridor`,
      action: 'Add rest stop waypoint to all active routes on this corridor',
    });
  }

  const distractionCount = events.filter(e => e.type === 'DISTRACTION').length;
  if (distractionCount >= 3) {
    patterns.push({
      type: 'PHONE_USE_PATTERN',
      severity: 'HIGH',
      message: `${distractionCount} phone distraction events detected — enroll affected drivers in Safety Training`,
      action: 'Enroll affected drivers in Phone Distraction Training',
    });
  }

  return patterns;
}

// Maps a camera event onto accident-report fields. Pure transform of its input.
export function prefillAccidentReport(cameraEvent) {
  if (!cameraEvent) return null;
  return {
    driver: cameraEvent.driver ?? null,
    date: cameraEvent.timestamp ?? null,
    location: cameraEvent.location ?? null,
    type: cameraEvent.type === 'COLLISION' ? 'Collision' : 'Near Miss',
    severity: cameraEvent.severity ?? null,
    videoClip: cameraEvent.clipUrl ?? null,
    autoDetected: true,
    source: cameraEvent.source ?? 'dashcam',
    // No claim about clips being saved or carriers being notified — neither
    // happens today.
    description: `${cameraEvent.label ?? 'Camera event'} reported by the dashcam integration. Review required before filing.`,
  };
}
