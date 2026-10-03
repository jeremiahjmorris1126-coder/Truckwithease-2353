// ============================================================================
// AUTOMATED GPS LOW-CLEARANCE BRIDGE PROXIMITY ALERT SERVICE
// Continuously monitors the vehicle/device GPS coordinates against the local
// database of low-clearance bridges and overpasses (LOW_BRIDGE_HAZARDS), calculates
// precise geodesic distance (Haversine in miles/meters), computes collision deficit
// based on commercial vehicle height (e.g. 13' 6" / 162 in), and triggers visual
// warnings, HUD banners, and auditory proximity beeps on TelemetryView.
// ============================================================================

import { LowBridgeHazard, TacticalNotification } from '../types';
import { LOW_BRIDGE_HAZARDS } from '../data/mockData';

export interface GpsLocation {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  speedMph?: number;
  headingDeg?: number;
  timestamp: number;
}

export type ProximityWarningLevel = 'SAFE' | 'ADVISORY' | 'CAUTION' | 'CRITICAL_COLLISION';

export interface LowBridgeThreatAssessment {
  hazard: LowBridgeHazard;
  distanceMiles: number;
  distanceFeet: number;
  estimatedTimeToArrivalSec: number;
  vehicleHeightInches: number;
  bridgeClearanceInches: number;
  clearanceMarginInches: number; // Negative = physical strike collision deficit
  isCollisionHazard: boolean;
  warningLevel: ProximityWarningLevel;
  recommendedDetour: string;
  diverterActive: boolean;
}

export interface GpsBridgeAlertState {
  currentLocation: GpsLocation | null;
  activeThreat: LowBridgeThreatAssessment | null;
  nearbyThreats: LowBridgeThreatAssessment[];
  isTrackingGps: boolean;
  isSimulatingGps: boolean;
  gpsPermissionStatus: 'granted' | 'prompt' | 'denied' | 'unsupported';
  lastEvaluatedAt: string;
  collisionWarningActive: boolean;
  audioWarningEnabled: boolean;
}

// Convert degrees to radians
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Haversine formula for exact distance between two coordinates in miles
export function calculateDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth radius in statute miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(3);
}

// Default benchmark locations along primary freight corridors
export const PRESET_GPS_CORRIDORS: { id: string; label: string; lat: number; lng: number; description: string; targetHazardId: string }[] = [
  {
    id: 'corridor-chicago-i90',
    label: 'Chicago I-90/94 (Kinzie St Overpass)',
    lat: 41.8905,
    lng: -87.6495,
    description: '1.2 mi approach to 13\' 2" (158") Kinzie St Rail Trestle on Kennedy Expy',
    targetHazardId: 'haz-05',
  },
  {
    id: 'corridor-pa-i80',
    label: 'I-80 PA Mill Hall Viaduct',
    lat: 41.1120,
    lng: -77.4980,
    description: '0.6 mi approach to 13\' 6" (162") Mill Hall low structure',
    targetHazardId: 'haz-01',
  },
  {
    id: 'corridor-ny-parkway',
    label: 'NY Hutchinson River Parkway (Severe 11\' 4")',
    lat: 40.8985,
    lng: -73.8240,
    description: '0.4 mi critical approach to low stone arch overpass',
    targetHazardId: 'haz-03',
  },
  {
    id: 'corridor-ohio-us30',
    label: 'US-30 Canton Rail Trestle',
    lat: 40.8035,
    lng: -81.3850,
    description: '0.8 mi approach to 12\' 10" (154") rail trestle',
    targetHazardId: 'haz-02',
  },
  {
    id: 'corridor-indiana-in49',
    label: 'Chesterton IN-49 Norfolk Southern',
    lat: 41.6180,
    lng: -87.0720,
    description: '0.7 mi approach to 14\' 0" (168") rail bridge',
    targetHazardId: 'haz-04',
  },
];

type AlertListener = (state: GpsBridgeAlertState) => void;

class GpsBridgeAlertService {
  private state: GpsBridgeAlertState = {
    currentLocation: null,
    activeThreat: null,
    nearbyThreats: [],
    isTrackingGps: false,
    isSimulatingGps: false,
    gpsPermissionStatus: 'prompt',
    lastEvaluatedAt: '',
    collisionWarningActive: false,
    audioWarningEnabled: true,
  };

  private listeners = new Set<AlertListener>();
  private watchId: number | null = null;
  private simulationIntervalId: number | null = null;
  private vehicleHeightInches: number = 162; // 13' 6" default
  private audioCtx: AudioContext | null = null;
  private lastBeepTimestamp: number = 0;
  private onTriggerNotificationCallback: ((n: TacticalNotification) => void) | null = null;

  constructor() {
    this.checkPermissions();
  }

  public setNotificationCallback(callback: (n: TacticalNotification) => void) {
    this.onTriggerNotificationCallback = callback;
  }

  public setVehicleHeight(heightInches: number) {
    this.vehicleHeightInches = heightInches;
    if (this.state.currentLocation) {
      this.evaluateLocation(this.state.currentLocation);
    }
  }

  public setAudioEnabled(enabled: boolean) {
    this.state.audioWarningEnabled = enabled;
    this.notify();
  }

  private checkPermissions() {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((permission) => {
          this.state.gpsPermissionStatus = permission.state;
          permission.onchange = () => {
            this.state.gpsPermissionStatus = permission.state;
            this.notify();
          };
          this.notify();
        })
        .catch(() => {
          this.state.gpsPermissionStatus = 'prompt';
        });
    }
  }

  // Start real device GPS tracking using Geolocation API
  public startLiveGpsTracking(): boolean {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.state.gpsPermissionStatus = 'unsupported';
      this.notify();
      return false;
    }

    this.stopSimulation();
    this.state.isTrackingGps = true;

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const location: GpsLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
          speedMph: pos.coords.speed ? +(pos.coords.speed * 2.23694).toFixed(1) : 58,
          headingDeg: pos.coords.heading || 0,
          timestamp: pos.timestamp,
        };
        this.evaluateLocation(location);
      },
      (err) => {
        console.warn('[GPS-BRIDGE-ALERT] Geolocation watch error:', err.message);
        if (err.code === 1) {
          this.state.gpsPermissionStatus = 'denied';
        }
        this.state.isTrackingGps = false;
        this.notify();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );

    this.notify();
    return true;
  }

  public stopLiveGpsTracking() {
    if (this.watchId !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.state.isTrackingGps = false;
    this.notify();
  }

  // Simulated GPS Approach along selected route for high-fidelity in-cab demonstrations
  public startSimulation(corridorId: string = 'corridor-chicago-i90') {
    this.stopLiveGpsTracking();
    this.stopSimulation();

    const corridor = PRESET_GPS_CORRIDORS.find((c) => c.id === corridorId) || PRESET_GPS_CORRIDORS[0];
    const targetHazard = LOW_BRIDGE_HAZARDS.find((h) => h.id === corridor.targetHazardId) || LOW_BRIDGE_HAZARDS[0];

    this.state.isSimulatingGps = true;
    let step = 0;
    const totalSteps = 20;

    // Start 2.5 miles out and approach at 62 MPH
    const startLat = corridor.lat;
    const startLng = corridor.lng;
    const targetLat = targetHazard.lat;
    const targetLng = targetHazard.lng;

    const tick = () => {
      const progress = step / totalSteps;
      const currentLat = startLat + (targetLat - startLat) * progress;
      const currentLng = startLng + (targetLng - startLng) * progress;

      const location: GpsLocation = {
        latitude: +currentLat.toFixed(5),
        longitude: +currentLng.toFixed(5),
        speedMph: 62,
        headingDeg: 88,
        accuracyMeters: 4.2,
        timestamp: Date.now(),
      };

      this.evaluateLocation(location);

      step++;
      if (step > totalSteps) {
        step = 0; // loop simulation
      }
    };

    tick();
    this.simulationIntervalId = window.setInterval(tick, 1800);
    this.notify();
  }

  public stopSimulation() {
    if (this.simulationIntervalId !== null) {
      clearInterval(this.simulationIntervalId);
      this.simulationIntervalId = null;
    }
    this.state.isSimulatingGps = false;
    this.notify();
  }

  // Core Evaluation: Compares GPS coordinates to database of bridge hazards
  public evaluateLocation(location: GpsLocation) {
    this.state.currentLocation = location;
    this.state.lastEvaluatedAt = new Date().toLocaleTimeString();

    const assessments: LowBridgeThreatAssessment[] = [];

    for (const hazard of LOW_BRIDGE_HAZARDS) {
      const distMiles = calculateDistanceMiles(
        location.latitude,
        location.longitude,
        hazard.lat,
        hazard.lng
      );

      // We evaluate any bridge entry within a 5-mile warning envelope
      if (distMiles <= 5.0) {
        const distFeet = Math.round(distMiles * 5280);
        const currentSpeedMph = Math.max(15, location.speedMph || 55);
        const etaSeconds = Math.round((distMiles / currentSpeedMph) * 3600);
        const clearanceMargin = hazard.clearanceInches - this.vehicleHeightInches;
        const isCollision = clearanceMargin <= 0;

        let warningLevel: ProximityWarningLevel = 'SAFE';
        if (isCollision) {
          if (distMiles <= 1.5) {
            warningLevel = 'CRITICAL_COLLISION';
          } else if (distMiles <= 3.0) {
            warningLevel = 'CAUTION';
          } else {
            warningLevel = 'ADVISORY';
          }
        } else if (clearanceMargin < 6) {
          // Tight clearance under 6 inches
          warningLevel = distMiles <= 1.5 ? 'CAUTION' : 'ADVISORY';
        }

        assessments.push({
          hazard,
          distanceMiles: distMiles,
          distanceFeet: distFeet,
          estimatedTimeToArrivalSec: etaSeconds,
          vehicleHeightInches: this.vehicleHeightInches,
          bridgeClearanceInches: hazard.clearanceInches,
          clearanceMarginInches: clearanceMargin,
          isCollisionHazard: isCollision,
          warningLevel,
          recommendedDetour: hazard.detourVector,
          diverterActive: isCollision && distMiles <= 2.0,
        });
      }
    }

    // Sort closest threat first
    assessments.sort((a, b) => a.distanceMiles - b.distanceMiles);

    this.state.nearbyThreats = assessments;
    this.state.activeThreat = assessments.length > 0 ? assessments[0] : null;

    const criticalThreat = assessments.find((a) => a.warningLevel === 'CRITICAL_COLLISION');
    const wasCollisionActive = this.state.collisionWarningActive;
    this.state.collisionWarningActive = !!criticalThreat;

    // Trigger audible beep & system notification if entering critical proximity
    if (criticalThreat && this.state.audioWarningEnabled) {
      this.playProximityAlertBeep(criticalThreat.distanceMiles <= 0.8 ? 'urgent' : 'warning');
    }

    if (criticalThreat && !wasCollisionActive && this.onTriggerNotificationCallback) {
      this.onTriggerNotificationCallback({
        id: `bridge-alert-${Date.now()}`,
        title: `🚨 LOW CLEARANCE COLLISION THREAT: ${criticalThreat.hazard.route}`,
        description: `Overpass clearance ${criticalThreat.hazard.clearanceFormatted} is ${Math.abs(criticalThreat.clearanceMarginInches)}" lower than vehicle profile (${Math.floor(this.vehicleHeightInches / 12)}' ${this.vehicleHeightInches % 12}"). Distance: ${criticalThreat.distanceMiles} mi. Divert to ${criticalThreat.recommendedDetour}.`,
        time: new Date().toLocaleTimeString(),
        severity: 'alert',
        read: false,
      });
    }

    this.notify();
  }

  // Audio tone generator using Web Audio API for cab alert chimes
  private playProximityAlertBeep(severity: 'warning' | 'urgent') {
    const now = Date.now();
    // Throttle beeps: 1.5s for urgent, 3s for warning
    const throttleMs = severity === 'urgent' ? 1400 : 2800;
    if (now - this.lastBeepTimestamp < throttleMs) return;
    this.lastBeepTimestamp = now;

    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }

      if (this.audioCtx && this.audioCtx.state !== 'closed') {
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        const freq = severity === 'urgent' ? 880 : 660; // High A5 or E5 pitch
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        if (severity === 'urgent') {
          // Double chirp
          gain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.14);
          osc.start(this.audioCtx.currentTime);
          osc.stop(this.audioCtx.currentTime + 0.16);

          // Second chirp
          setTimeout(() => {
            if (!this.audioCtx) return;
            const osc2 = this.audioCtx.createOscillator();
            const gain2 = this.audioCtx.createGain();
            osc2.connect(gain2);
            gain2.connect(this.audioCtx.destination);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(987.77, this.audioCtx.currentTime); // B5
            gain2.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.18);
            osc2.start(this.audioCtx.currentTime);
            osc2.stop(this.audioCtx.currentTime + 0.2);
          }, 180);
        } else {
          gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.25);
          osc.start(this.audioCtx.currentTime);
          osc.stop(this.audioCtx.currentTime + 0.26);
        }
      }
    } catch {
      // Audio autoplay policy safe fallback
    }
  }

  public getState(): GpsBridgeAlertState {
    return { ...this.state };
  }

  public subscribe(listener: AlertListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach((l) => {
      try {
        l(currentState);
      } catch {
        // Safe
      }
    });
  }
}

export const gpsBridgeAlertService = new GpsBridgeAlertService();
