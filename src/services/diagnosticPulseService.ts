// ============================================================================
// REAL-TIME DIAGNOSTIC PULSE & ENGINE PERFORMANCE BASELINE SERVICE
// Monitors raw CAN-bus telemetry packets (SAE J1939 PGNs) and engine diagnostics
// against certified baseline boundaries. Triggers instantaneous alerts,
// haptic cues, and notifications upon telemetry anomaly pattern deviations.
// ============================================================================

import {
  EldEngineDiagnostics,
  EldRawPacket,
  DiagnosticPulseAlert,
  EnginePerformanceBaseline,
  PulseBaselineProfile,
  PulseCadenceStatus,
} from '../types';

export const ENGINE_BASELINES: Record<string, EnginePerformanceBaseline> = {
  coolantTemp: {
    key: 'coolantTemp',
    parameterName: 'Engine Coolant Temperature',
    category: 'THERMAL',
    pgnOrPid: 'PGN 65262 (ET1)',
    unit: '°F',
    nominalMin: 180,
    nominalMax: 206,
    criticalLow: 140,
    criticalHigh: 220,
    tolerancePct: 10,
    description: 'J1939 Engine Temperature 1 coolant thermostatic regulating envelope.',
    fmcsaCitation: '49 CFR § 396.3 / SAE J1939-71 SPN 110',
  },
  oilPressure: {
    key: 'oilPressure',
    parameterName: 'Engine Oil Pressure',
    category: 'PRESSURE',
    pgnOrPid: 'PGN 65263 (EFL/P1)',
    unit: 'PSI',
    nominalMin: 34,
    nominalMax: 56,
    criticalLow: 24,
    criticalHigh: 75,
    tolerancePct: 12,
    description: 'Main gallery hydrodynamic hydrodynamic lubrication pressure.',
    fmcsaCitation: '49 CFR § 396.3 / SAE J1939-71 SPN 100',
  },
  batteryVoltage: {
    key: 'batteryVoltage',
    parameterName: 'Electrical System Potential',
    category: 'ELECTRICAL',
    pgnOrPid: 'PGN 65271 (VEP)',
    unit: 'VDC',
    nominalMin: 13.5,
    nominalMax: 14.5,
    criticalLow: 12.4,
    criticalHigh: 15.2,
    tolerancePct: 8,
    description: 'Alternator charging and 12V dual-battery bank bus potential.',
    fmcsaCitation: '49 CFR § 393.29 / SAE J1939-71 SPN 168',
  },
  engineRpm: {
    key: 'engineRpm',
    parameterName: 'Crankshaft Engine Speed',
    category: 'DRIVETRAIN',
    pgnOrPid: 'PGN 61444 (EEC1)',
    unit: 'RPM',
    nominalMin: 1150,
    nominalMax: 1650,
    criticalLow: 550,
    criticalHigh: 1950,
    tolerancePct: 15,
    description: 'Electronic Engine Controller 1 crankshaft angular velocity.',
    fmcsaCitation: 'SAE J1939-71 SPN 190 / FMCSA 49 CFR § 395.26',
  },
  roadSpeed: {
    key: 'roadSpeed',
    parameterName: 'Wheel-Based Road Speed',
    category: 'DRIVETRAIN',
    pgnOrPid: 'PGN 65265 (CCVS)',
    unit: 'MPH',
    nominalMin: 55,
    nominalMax: 70,
    criticalLow: 0,
    criticalHigh: 78,
    tolerancePct: 10,
    description: 'Cruise Control and Vehicle Speed output from transmission tailshaft.',
    fmcsaCitation: 'FMCSA 49 CFR § 395.26 / SAE J1939-71 SPN 84',
  },
  engineLoad: {
    key: 'engineLoad',
    parameterName: 'Actual Engine Torque / Load',
    category: 'DRIVETRAIN',
    pgnOrPid: 'PGN 61444 (EEC1)',
    unit: '%',
    nominalMin: 25,
    nominalMax: 78,
    criticalLow: 5,
    criticalHigh: 94,
    tolerancePct: 15,
    description: 'Percentage of reference engine torque commanded under current road profile.',
    fmcsaCitation: 'SAE J1939-71 SPN 513',
  },
  busJitter: {
    key: 'busJitter',
    parameterName: 'CAN-Bus Transmission Jitter',
    category: 'BUS_TIMING',
    pgnOrPid: 'SAE J1939 Bus Arb',
    unit: 'ms',
    nominalMin: 4,
    nominalMax: 26,
    criticalLow: 0,
    criticalHigh: 45,
    tolerancePct: 20,
    description: 'Transmission frame latency jitter and cyclic message variance.',
    fmcsaCitation: 'SAE J1939-21 Physical Layer & Data Link',
  },
  activeDtcs: {
    key: 'activeDtcs',
    parameterName: 'Active Malfunction Diagnostic Faults',
    category: 'EMISSIONS',
    pgnOrPid: 'PGN 65226 (DM1)',
    unit: 'DTCs',
    nominalMin: 0,
    nominalMax: 0,
    criticalLow: 0,
    criticalHigh: 1,
    tolerancePct: 0,
    description: 'Active Diagnostic Trouble Codes and Malfunction Indicator Lamp bit.',
    fmcsaCitation: 'FMCSA 49 CFR § 396.11 / SAE J1939-73 DM1',
  },
};

export const BASELINE_PROFILES: PulseBaselineProfile[] = [
  {
    id: 'DETROIT_DD15_CRUISE',
    name: 'Detroit DD15 / Cummins X15 Baseline',
    description: 'Standard EPA-certified 15L heavy highway cruising envelope (65 MPH, rolling terrain).',
    engineModel: 'Detroit DD15 Gen 5 / Cummins X15 Efficiency',
    baselines: {
      coolantTemp: { min: 182, max: 204, criticalHigh: 218, criticalLow: 145 },
      oilPressure: { min: 38, max: 54, criticalHigh: 72, criticalLow: 26 },
      batteryVoltage: { min: 13.6, max: 14.4, criticalHigh: 15.1, criticalLow: 12.6 },
      engineRpm: { min: 1200, max: 1550, criticalHigh: 1900, criticalLow: 600 },
      roadSpeed: { min: 58, max: 68, criticalHigh: 75, criticalLow: 0 },
      engineLoad: { min: 35, max: 72, criticalHigh: 92, criticalLow: 10 },
      busJitter: { min: 5, max: 24, criticalHigh: 42, criticalLow: 0 },
      activeDtcs: { min: 0, max: 0, criticalHigh: 1, criticalLow: 0 },
    },
  },
  {
    id: 'HEAVY_HAUL_GRADE',
    name: 'Heavy Haul 80k# / Mountain Grade',
    description: 'Elevated engine torque, higher baseline thermal thresholds, and steep ascent gearing.',
    engineModel: 'High-Torque Heavy Haul Spec (505+ HP / 1850 lb-ft)',
    baselines: {
      coolantTemp: { min: 190, max: 214, criticalHigh: 226, criticalLow: 150 },
      oilPressure: { min: 42, max: 62, criticalHigh: 80, criticalLow: 28 },
      batteryVoltage: { min: 13.5, max: 14.6, criticalHigh: 15.2, criticalLow: 12.5 },
      engineRpm: { min: 1400, max: 1850, criticalHigh: 2150, criticalLow: 600 },
      roadSpeed: { min: 35, max: 62, criticalHigh: 72, criticalLow: 0 },
      engineLoad: { min: 65, max: 96, criticalHigh: 99, criticalLow: 20 },
      busJitter: { min: 6, max: 28, criticalHigh: 48, criticalLow: 0 },
      activeDtcs: { min: 0, max: 0, criticalHigh: 1, criticalLow: 0 },
    },
  },
  {
    id: 'IDLE_STAGING',
    name: 'Dock Terminal Stationary Idle',
    description: 'Low-RPM stationary staging baseline for dock idle and auxiliary power verification.',
    engineModel: 'All Class 8 Heavy Power Units (Idle Mode)',
    baselines: {
      coolantTemp: { min: 170, max: 196, criticalHigh: 212, criticalLow: 135 },
      oilPressure: { min: 22, max: 38, criticalHigh: 55, criticalLow: 16 },
      batteryVoltage: { min: 13.4, max: 14.3, criticalHigh: 14.9, criticalLow: 12.4 },
      engineRpm: { min: 580, max: 720, criticalHigh: 950, criticalLow: 500 },
      roadSpeed: { min: 0, max: 2, criticalHigh: 5, criticalLow: 0 },
      engineLoad: { min: 12, max: 30, criticalHigh: 50, criticalLow: 5 },
      busJitter: { min: 4, max: 22, criticalHigh: 40, criticalLow: 0 },
      activeDtcs: { min: 0, max: 0, criticalHigh: 1, criticalLow: 0 },
    },
  },
  {
    id: 'EXTREME_WINTER',
    name: 'Sub-Zero Arctic Winter Operation',
    description: 'Optimized for high-viscosity oil pressures, cooler thermostatic opening, and high electrical draw.',
    engineModel: 'Class 8 Cold-Weather Package with Block Heaters',
    baselines: {
      coolantTemp: { min: 172, max: 200, criticalHigh: 215, criticalLow: 130 },
      oilPressure: { min: 40, max: 65, criticalHigh: 85, criticalLow: 25 },
      batteryVoltage: { min: 13.7, max: 14.7, criticalHigh: 15.3, criticalLow: 12.2 },
      engineRpm: { min: 1100, max: 1600, criticalHigh: 1900, criticalLow: 650 },
      roadSpeed: { min: 45, max: 65, criticalHigh: 72, criticalLow: 0 },
      engineLoad: { min: 30, max: 80, criticalHigh: 95, criticalLow: 10 },
      busJitter: { min: 6, max: 26, criticalHigh: 45, criticalLow: 0 },
      activeDtcs: { min: 0, max: 0, criticalHigh: 1, criticalLow: 0 },
    },
  },
];

export interface ParameterDeviationResult {
  key: string;
  name: string;
  pgn: string;
  unit: string;
  currentValue: number;
  currentFormatted: string;
  baselineMin: number;
  baselineMax: number;
  criticalHigh?: number;
  criticalLow?: number;
  deviationPct: number;
  status: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  hypothesis: string;
  recommendation: string;
  fmcsaCitation: string;
}

export interface DiagnosticPulseEvaluation {
  pulseScorePct: number; // 0-100%
  cadenceStatus: PulseCadenceStatus;
  bpmCadence: number;
  deviatedParametersCount: number;
  warningCount: number;
  criticalCount: number;
  parameters: Record<string, ParameterDeviationResult>;
  newAlerts: DiagnosticPulseAlert[];
  overallSummary: string;
}

/**
 * Evaluates live telemetry values against expected baselines for the selected profile.
 */
export function evaluateTelemetryAgainstBaselines(
  diagnostics: EldEngineDiagnostics,
  busJitterMs: number,
  profileId: string = 'DETROIT_DD15_CRUISE',
  sensitivityMultiplier: number = 1.0 // 0.8 for strict, 1.0 for normal, 1.3 for relaxed
): DiagnosticPulseEvaluation {
  const profile = BASELINE_PROFILES.find(p => p.id === profileId) || BASELINE_PROFILES[0];
  const now = new Date();
  const timestamp = now.toLocaleTimeString('en-US', { hour12: false });
  const epochMs = now.getTime();

  const parameterValues: Record<string, number> = {
    coolantTemp: diagnostics.coolantTempF,
    oilPressure: diagnostics.oilPressurePsi,
    batteryVoltage: diagnostics.batteryVoltage,
    engineRpm: diagnostics.engineRpm,
    roadSpeed: diagnostics.roadSpeedMph,
    engineLoad: diagnostics.engineLoadPct,
    busJitter: busJitterMs,
    activeDtcs: diagnostics.activeDtcCount + (diagnostics.malfunctionIndicator ? 1 : 0),
  };

  const results: Record<string, ParameterDeviationResult> = {};
  const newAlerts: DiagnosticPulseAlert[] = [];

  let totalDeductions = 0;
  let warningCount = 0;
  let criticalCount = 0;

  for (const [key, baseSpec] of Object.entries(ENGINE_BASELINES)) {
    const limits = profile.baselines[key] || {
      min: baseSpec.nominalMin,
      max: baseSpec.nominalMax,
      criticalHigh: baseSpec.criticalHigh,
      criticalLow: baseSpec.criticalLow,
    };

    const val = parameterValues[key] ?? 0;
    const center = (limits.min + limits.max) / 2 || 1;
    let deviationPct = 0;
    let status: 'NOMINAL' | 'WARNING' | 'CRITICAL' = 'NOMINAL';
    let hypothesis = 'Parameter operating within nominal calibrated baseline boundaries.';
    let recommendation = 'Maintain standard operating interval.';

    // Sensitivity adjusted thresholds
    const minThreshold = limits.min - (center * 0.05 * (sensitivityMultiplier - 1));
    const maxThreshold = limits.max + (center * 0.05 * (sensitivityMultiplier - 1));

    if (key === 'activeDtcs') {
      if (val > 0) {
        status = 'CRITICAL';
        deviationPct = 100;
        hypothesis = 'SAE J1939 DM1 Active Diagnostic Trouble Code broadcast detected. MIL illuminated.';
        recommendation = 'Pull codes immediately via ELD Audit View and initiate FMCSA inspection protocol.';
      }
    } else {
      if (limits.criticalHigh !== undefined && val >= limits.criticalHigh) {
        status = 'CRITICAL';
        deviationPct = Math.round(((val - limits.max) / center) * 100);
      } else if (limits.criticalLow !== undefined && val <= limits.criticalLow && (key !== 'roadSpeed' || limits.min > 10)) {
        status = 'CRITICAL';
        deviationPct = Math.round(((limits.min - val) / center) * 100);
      } else if (val > maxThreshold) {
        status = 'WARNING';
        deviationPct = Math.round(((val - limits.max) / center) * 100);
      } else if (val < minThreshold && (key !== 'roadSpeed' || limits.min > 10)) {
        status = 'WARNING';
        deviationPct = Math.round(((limits.min - val) / center) * 100);
      }

      // Root Cause Hypotheses and Domain Guidance
      if (status !== 'NOMINAL') {
        if (key === 'coolantTemp') {
          hypothesis = val > limits.max
            ? 'Thermal spike detected. Potential radiator shutter restriction, coolant loss, or fan clutch disengagement.'
            : 'Thermostat open failure or excessive cold-soak cooling during highway transit.';
          recommendation = 'Monitor thermal gradient; reduce engine torque demand; inspect expansion tank level at next rest stop.';
        } else if (key === 'oilPressure') {
          hypothesis = val < limits.min
            ? 'Low lubricating oil pressure warning. Potential oil aeration, viscosity breakdown, or pump relief valve stick.'
            : 'Abnormal high pressure spike; bypass valve restriction or high cold-start viscosity.';
          recommendation = 'Immediate speed reduction; avoid sustained high RPM; confirm oil level and viscosity specification.';
        } else if (key === 'batteryVoltage') {
          hypothesis = val < limits.min
            ? 'Alternator undercharge or excessive electrical parasitic draw across cab inverters.'
            : 'Alternator voltage regulator failure / overcharging risk causing battery electrolyte boil.';
          recommendation = 'Shed non-essential in-cab electrical loads; check serpentine alternator belt tension.';
        } else if (key === 'engineRpm') {
          hypothesis = val > limits.max
            ? 'Downhill over-rev / transmission gear hunting mismatch exceeding expected engine envelope.'
            : 'Engine lugging under heavy torque demand below fuel efficiency band.';
          recommendation = 'Engage engine brake / select higher gear to preserve drivetrain integrity.';
        } else if (key === 'engineLoad') {
          hypothesis = 'Engine torque demand disproportionate to flat road velocity; check for heavy headwind or brake drag.';
          recommendation = 'Verify trailer service brakes are not dragging; check turbo boost pressure.';
        } else if (key === 'busJitter') {
          hypothesis = 'CAN bus frame transmission latency exceeding J1939 arbitration standard; cable ground noise or ECU buffer saturation.';
          recommendation = 'Check ELD 9-pin diagnostic connector seated securely; inspect wiring harness for moisture.';
        }
      }
    }

    if (status === 'CRITICAL') {
      totalDeductions += 30;
      criticalCount++;
    } else if (status === 'WARNING') {
      totalDeductions += 12;
      warningCount++;
    }

    let currentFormatted = `${val.toFixed(1)} ${baseSpec.unit}`;
    if (key === 'engineRpm' || key === 'activeDtcs') {
      currentFormatted = `${Math.round(val)} ${baseSpec.unit}`;
    }

    results[key] = {
      key,
      name: baseSpec.parameterName,
      pgn: baseSpec.pgnOrPid,
      unit: baseSpec.unit,
      currentValue: val,
      currentFormatted,
      baselineMin: limits.min,
      baselineMax: limits.max,
      criticalHigh: limits.criticalHigh,
      criticalLow: limits.criticalLow,
      deviationPct,
      status,
      hypothesis,
      recommendation,
      fmcsaCitation: baseSpec.fmcsaCitation,
    };

    // If deviated, prepare alert object
    if (status !== 'NOMINAL') {
      newAlerts.push({
        id: `PULSE-${Date.now().toString().slice(-5)}-${key.toUpperCase().slice(0, 4)}`,
        timestamp,
        epochMs,
        parameterKey: key,
        parameterName: baseSpec.parameterName,
        pgnOrPid: baseSpec.pgnOrPid,
        currentValue: val,
        currentValueFormatted: currentFormatted,
        baselineExpected: `${limits.min} - ${limits.max} ${baseSpec.unit}`,
        deviationPct,
        severity: status === 'CRITICAL' ? 'alert' : 'warning',
        cadenceStatus: status === 'CRITICAL' ? 'CRITICAL_MALFUNCTION' : 'ARRHYTHMIC_DEVIATION',
        fmcsaCitation: baseSpec.fmcsaCitation,
        rootCauseHypothesis: hypothesis,
        recommendedAction: recommendation,
        acknowledged: false,
      });
    }
  }

  const pulseScorePct = Math.max(10, Math.min(100, 100 - totalDeductions));
  let cadenceStatus: PulseCadenceStatus = 'RHYTHMIC_NOMINAL';
  let bpmCadence = 68;

  if (criticalCount > 0) {
    cadenceStatus = 'CRITICAL_MALFUNCTION';
    bpmCadence = 135;
  } else if (warningCount >= 2) {
    cadenceStatus = 'ARRHYTHMIC_DEVIATION';
    bpmCadence = 108;
  } else if (warningCount === 1) {
    cadenceStatus = 'ASYMMETRIC_DRIFT';
    bpmCadence = 86;
  }

  let overallSummary = 'All CAN-bus telemetry patterns aligned with expected mechanical baselines.';
  if (criticalCount > 0) {
    overallSummary = `CRITICAL DEVIATION: ${criticalCount} parameter(s) breached safety envelope. Immediate diagnostic intervention mandated.`;
  } else if (warningCount > 0) {
    overallSummary = `BASELINE DRIFT: ${warningCount} parameter(s) drifting outside expected cruising baselines.`;
  }

  return {
    pulseScorePct,
    cadenceStatus,
    bpmCadence,
    deviatedParametersCount: warningCount + criticalCount,
    warningCount,
    criticalCount,
    parameters: results,
    newAlerts,
    overallSummary,
  };
}

/**
 * Synthesizes a high-tech pulse alert chime using HTML5 Web Audio API
 */
let audioCtx: AudioContext | null = null;

export function playDiagnosticPulseChime(severity: 'warning' | 'critical' | 'nominal' = 'warning'): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (severity === 'critical') {
      // Rapid double emergency pulse
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
      osc.frequency.setValueAtTime(880, now + 0.16);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.28);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.35);
    } else if (severity === 'warning') {
      // Harmonic radar sweep chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      // Soft nominal sync pip
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now); // C6
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (err) {
    // Non-blocking fallback for muted browser contexts
    console.debug('Diagnostic pulse chime skipped:', err);
  }
}
