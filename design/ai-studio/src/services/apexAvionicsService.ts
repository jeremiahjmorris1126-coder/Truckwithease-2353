import {
  V2xSpatialSector,
  IftaFuelArbitrageStation,
  AcousticDiagnosticComponent,
} from '../types';

// =====================================================================
// === INITIAL V2X SPATIAL RADAR SECTORS ===
// =====================================================================

export const INITIAL_V2X_SECTORS: V2xSpatialSector[] = [
  {
    id: 'sec-forward-radar',
    name: 'Forward 77GHz Millimeter Radar',
    distanceFt: 460,
    timeBufferSec: 5.2,
    status: 'CLEAR',
    targetType: 'Commercial Liquid Bulk Tanker',
    relativeSpeedMph: -2.4, // Rig is closing in slightly
    description: 'Long-range forward object lock. Adaptive cruise radar tracking lead vehicle with safe 5.2s headway cushion.',
  },
  {
    id: 'sec-left-blindspot',
    name: 'Left Mirror & A-Pillar LiDAR',
    distanceFt: 180,
    timeBufferSec: 8.0,
    status: 'CLEAR',
    targetType: 'None (Lane Open)',
    relativeSpeedMph: 0,
    description: 'Left passing lane completely clear for lane merge or directional maneuvers.',
  },
  {
    id: 'sec-right-nozone',
    name: 'Right Trailer Tandem Blindspot (No-Zone)',
    distanceFt: 38,
    timeBufferSec: 0.9,
    status: 'WARNING',
    targetType: 'Compact SUV (Passenger Vehicle)',
    relativeSpeedMph: 0.8,
    description: 'CAUTION: Passenger vehicle hovering in blindspot directly adjacent to trailer axle 4/5. Right lane change prohibited.',
  },
  {
    id: 'sec-rear-doppler',
    name: 'Rear Bumper 24GHz Doppler Sensor',
    distanceFt: 110,
    timeBufferSec: 1.2,
    status: 'CAUTION',
    targetType: 'Light Commercial Van',
    relativeSpeedMph: 4.5,
    description: 'Vehicle approaching rear trailer door with suboptimal trailing distance. Hazard strobe pulsing armed.',
  },
  {
    id: 'sec-overhead-clearance',
    name: 'Overhead Bridge & Gantry Laser Scanner',
    distanceFt: 1200,
    timeBufferSec: 12.8,
    status: 'CLEAR',
    targetType: 'Interstate Steel Truss Overpass',
    relativeSpeedMph: 0,
    description: 'Laser scanned clearance: 15\'4" (4.67m). Vehicle height: 13\'6". Safe vertical margin: +1\'10".',
  },
];

// =====================================================================
// === IFTA INTERSTATE CORRIDOR FUEL ARBITRAGE DATASET ===
// =====================================================================

export const INITIAL_IFTA_STATIONS: IftaFuelArbitrageStation[] = [
  {
    id: 'sta-pa-harrisburg',
    stationName: 'Harrisburg Logistics Travel Plaza',
    brand: 'Pilot Flying J',
    state: 'PA',
    interstateHighway: 'I-81 / I-76',
    exitNumber: 'Exit 77',
    distanceMiles: 14.2,
    pumpPricePerGallon: 4.149,
    stateExciseTax: 0.576, // PA fuel tax credit
    iftaCreditAdjustment: -0.191, // Net negative because tax is credited on quarterly return!
    trueNetPricePerGallon: 3.573,
    estimatedNetSavingsPer150Gal: 68.40,
    openTruckParkingSpaces: 48,
    defAtPump: true,
    cleanShowersAvailable: 8,
    catCertifiedScales: true,
    bypassRecommendation: 'OPTIMAL_FILL_STOP',
  },
  {
    id: 'sta-oh-turnpike',
    stationName: 'Youngstown Gateway Travel Center',
    brand: "Love's",
    state: 'OH',
    interstateHighway: 'I-80 Turnpike',
    exitNumber: 'Exit 218',
    distanceMiles: 86.0,
    pumpPricePerGallon: 3.899,
    stateExciseTax: 0.385,
    iftaCreditAdjustment: 0.095, // Drivers owe difference on IFTA if consuming in higher-tax state!
    trueNetPricePerGallon: 3.994,
    estimatedNetSavingsPer150Gal: -24.15,
    openTruckParkingSpaces: 22,
    defAtPump: true,
    cleanShowersAvailable: 4,
    catCertifiedScales: true,
    bypassRecommendation: 'AVOID_TAX_SURCHARGE',
  },
  {
    id: 'sta-wv-wheeling',
    stationName: 'Tri-State Mountaineer Oasis',
    brand: 'TA Petro',
    state: 'WV',
    interstateHighway: 'I-70 West',
    exitNumber: 'Exit 11',
    distanceMiles: 142.5,
    pumpPricePerGallon: 3.949,
    stateExciseTax: 0.357,
    iftaCreditAdjustment: 0.042,
    trueNetPricePerGallon: 3.991,
    estimatedNetSavingsPer150Gal: -18.70,
    openTruckParkingSpaces: 65,
    defAtPump: true,
    cleanShowersAvailable: 11,
    catCertifiedScales: true,
    bypassRecommendation: 'SECONDARY_OPTION',
  },
  {
    id: 'sta-in-elkhart',
    stationName: 'Elkhart Freight Hub Express',
    brand: 'Sapp Bros',
    state: 'IN',
    interstateHighway: 'I-80 / I-90',
    exitNumber: 'Exit 92',
    distanceMiles: 230.0,
    pumpPricePerGallon: 4.029,
    stateExciseTax: 0.550,
    iftaCreditAdjustment: -0.165,
    trueNetPricePerGallon: 3.864,
    estimatedNetSavingsPer150Gal: 34.50,
    openTruckParkingSpaces: 34,
    defAtPump: true,
    cleanShowersAvailable: 6,
    catCertifiedScales: true,
    bypassRecommendation: 'OPTIMAL_FILL_STOP',
  },
];

// =====================================================================
// === ACOUSTIC & VIBRATION ML TELEMATICS ===
// =====================================================================

export const INITIAL_ACOUSTIC_COMPONENTS: AcousticDiagnosticComponent[] = [
  {
    id: 'comp-steer-bearing',
    componentName: 'Front Steer Axle Left Hub Bearing',
    category: 'STEERING_BEARINGS',
    sensorFrequencyKhz: 14.8,
    vibrationRms: 0.12, // mm/s - very smooth
    healthScorePercent: 98,
    status: 'OPTIMAL',
    estimatedMilesRemaining: 184000,
    recommendation: 'Acoustic signature perfectly harmonic. Hub oil level optimal.',
  },
  {
    id: 'comp-turbo-spool',
    componentName: 'Holset Variable Geometry Turbo (VGT)',
    category: 'TURBOCHARGER',
    sensorFrequencyKhz: 112.4,
    vibrationRms: 0.28,
    healthScorePercent: 94,
    status: 'OPTIMAL',
    estimatedMilesRemaining: 92000,
    recommendation: 'Spool balanced within 0.03g tolerance. Boost response 36.2 PSI peak.',
  },
  {
    id: 'comp-def-doser',
    componentName: 'SCR DEF Dosing Valve & Nozzle',
    category: 'SCR_DEF_DOSER',
    sensorFrequencyKhz: 2.4,
    vibrationRms: 0.44,
    healthScorePercent: 88,
    status: 'MONITOR',
    estimatedMilesRemaining: 41000,
    recommendation: 'Minor urea crystallization on injector tip. Automatic thermal purging recommended at next regen cycle.',
  },
  {
    id: 'comp-dpf-soot',
    componentName: 'Diesel Particulate Filter (DPF Core)',
    category: 'DPF_EXHAUST',
    sensorFrequencyKhz: 0.8,
    vibrationRms: 0.19,
    healthScorePercent: 91,
    status: 'OPTIMAL',
    estimatedMilesRemaining: 68000,
    recommendation: 'Delta pressure 0.82 PSI. Soot accumulation 16g/45g. Passive highway regeneration active.',
  },
  {
    id: 'comp-driveline-u-joint',
    componentName: 'Rear Tandem Intermediate Driveline U-Joint',
    category: 'DRIVELINE',
    sensorFrequencyKhz: 8.6,
    vibrationRms: 0.31,
    healthScorePercent: 86,
    status: 'MONITOR',
    estimatedMilesRemaining: 29000,
    recommendation: 'Slight harmonic resonance at 58 MPH. Schedule grease service at next 10,000-mile PM.',
  },
];

// =====================================================================
// === MOUNTAIN DESCENT & BRAKE PHYSICS CALCULATIONS ===
// =====================================================================

export interface KineticBrakePhysicsResult {
  kineticEnergyMegajoules: number;
  perceptionDistanceFt: number;
  airBrakeLagDistanceFt: number;
  frictionBrakingDistanceFt: number;
  totalStoppingDistanceFt: number;
  brakeDrumTemperatureF: number;
  thermalBrakeStatus: 'COOL' | 'NOMINAL' | 'ELEVATED' | 'BRAKE_FADE_DANGER';
  recommendedDescentGear: string;
  recommendedJakeStage: 'STAGE_1_LOW' | 'STAGE_2_MED' | 'STAGE_3_HIGH';
  nearestEscapeRampMiles: number;
  safeDescentSpeedMph: number;
}

export function calculateKineticBrakePhysics(
  grossWeightLbs: number,
  speedMph: number,
  gradePercent: number,
  roadCondition: 'DRY' | 'WET' | 'SNOW_ICE',
  continuousDescentMiles: number
): KineticBrakePhysicsResult {
  // Mass in kg: 1 lb = 0.453592 kg
  const massKg = grossWeightLbs * 0.453592;
  // Speed in m/s: 1 mph = 0.44704 m/s
  const speedMs = speedMph * 0.44704;
  // Kinetic energy = 0.5 * m * v^2 in Joules -> Megajoules
  const kineticEnergyJoules = 0.5 * massKg * Math.pow(speedMs, 2);
  const kineticEnergyMegajoules = Math.round((kineticEnergyJoules / 1000000) * 10) / 10;

  // Speed in ft/s: 1 mph = 1.46667 ft/s
  const speedFps = speedMph * 1.46667;

  // Perception-Reaction distance (1.5 seconds)
  const perceptionDistanceFt = Math.round(speedFps * 1.5);

  // Air brake lag distance (0.4 seconds for air signal propagation to trailer chambers)
  const airBrakeLagDistanceFt = Math.round(speedFps * 0.4);

  // Friction coefficient
  let mu = 0.65; // Dry asphalt
  if (roadCondition === 'WET') mu = 0.38;
  if (roadCondition === 'SNOW_ICE') mu = 0.16;

  // Grade adjustment: descending grade reduces effective braking decelerative force
  const effectiveDecel = Math.max(0.08, mu - (gradePercent / 100));
  // Friction stopping distance = v^2 / (2 * g * effectiveDecel)
  const frictionBrakingDistanceFt = Math.round(Math.pow(speedFps, 2) / (2 * 32.2 * effectiveDecel));

  const totalStoppingDistanceFt = perceptionDistanceFt + airBrakeLagDistanceFt + frictionBrakingDistanceFt;

  // Brake Drum Thermal Saturation Simulation:
  // Base ambient: 160°F. Heat added per mile of grade = (grossWeight / 80000) * (gradePercent / 5) * 85°F * (speedMph / 50)
  const thermalAdded = (grossWeightLbs / 80000) * (gradePercent / 5) * 75 * continuousDescentMiles * (speedMph / 50);
  const brakeDrumTemperatureF = Math.round(160 + thermalAdded);

  let thermalBrakeStatus: 'COOL' | 'NOMINAL' | 'ELEVATED' | 'BRAKE_FADE_DANGER' = 'NOMINAL';
  if (brakeDrumTemperatureF < 280) {
    thermalBrakeStatus = 'COOL';
  } else if (brakeDrumTemperatureF < 480) {
    thermalBrakeStatus = 'NOMINAL';
  } else if (brakeDrumTemperatureF < 680) {
    thermalBrakeStatus = 'ELEVATED';
  } else {
    thermalBrakeStatus = 'BRAKE_FADE_DANGER';
  }

  // Recommended Descent Speed & Gear (Rule of Thumb: Descend in 1-2 gears lower than climbing gear)
  let safeDescentSpeedMph = 45;
  let recommendedDescentGear = '7th Gear (Direct Drive)';
  let recommendedJakeStage: 'STAGE_1_LOW' | 'STAGE_2_MED' | 'STAGE_3_HIGH' = 'STAGE_2_MED';

  if (gradePercent >= 6) {
    safeDescentSpeedMph = grossWeightLbs > 65000 ? 32 : 38;
    recommendedDescentGear = '6th Gear (Low Range)';
    recommendedJakeStage = 'STAGE_3_HIGH';
  } else if (gradePercent >= 4) {
    safeDescentSpeedMph = grossWeightLbs > 65000 ? 42 : 48;
    recommendedDescentGear = '7th Gear';
    recommendedJakeStage = 'STAGE_2_MED';
  } else {
    safeDescentSpeedMph = 55;
    recommendedDescentGear = '8th / 9th Gear';
    recommendedJakeStage = 'STAGE_1_LOW';
  }

  // Nearest runaway truck escape ramp (simulated along mountain corridor)
  const nearestEscapeRampMiles = Math.max(0.4, Math.round((4.8 - (continuousDescentMiles % 4.8)) * 10) / 10);

  return {
    kineticEnergyMegajoules,
    perceptionDistanceFt,
    airBrakeLagDistanceFt,
    frictionBrakingDistanceFt,
    totalStoppingDistanceFt,
    brakeDrumTemperatureF,
    thermalBrakeStatus,
    recommendedDescentGear,
    recommendedJakeStage,
    nearestEscapeRampMiles,
    safeDescentSpeedMph,
  };
}

// =====================================================================
// === CROSSWIND ROLLOVER VULNERABILITY MODEL ===
// =====================================================================

export interface CrosswindRolloverResult {
  windSpeedMph: number;
  windAngleDegrees: number; // 90° = direct perpendicular broadside wind
  effectiveLateralForceLbs: number;
  rolloverVulnerabilityPercent: number;
  rolloverStatus: 'SAFE' | 'ELEVATED_VULNERABILITY' | 'CRITICAL_GUST_ALERT' | 'IMMINENT_ROLLOVER_SHUTDOWN';
  recommendedAction: string;
}

export function calculateCrosswindRollover(
  grossWeightLbs: number,
  windSpeedMph: number,
  windAngleDegrees: number,
  rigSpeedMph: number
): CrosswindRolloverResult {
  // 53ft trailer area = approx 53 ft length * 9 ft height = 477 sq ft
  const trailerAreaSqFt = 477;
  // Dynamic wind pressure P = 0.00256 * V^2 (lbs/sq ft)
  const sinAngle = Math.abs(Math.sin((windAngleDegrees * Math.PI) / 180));
  const effectiveWindSpeed = windSpeedMph * sinAngle;
  const windPressurePsf = 0.00256 * Math.pow(effectiveWindSpeed, 2);
  const effectiveLateralForceLbs = Math.round(windPressurePsf * trailerAreaSqFt);

  // Rollover threshold depends heavily on gross weight:
  // An empty 34,000 lb trailer has low stabilizing moment arm; an 80,000 lb rig is much heavier to blow over
  const weightStabilizingFactor = grossWeightLbs / 34000;
  // Base critical wind speed for empty trailer is approx 42-45 MPH broadside
  const criticalWindSpeed = 38 * Math.sqrt(weightStabilizingFactor);

  const vulnerabilityRatio = effectiveWindSpeed / criticalWindSpeed;
  const rolloverVulnerabilityPercent = Math.min(100, Math.round(vulnerabilityRatio * 100));

  let rolloverStatus: 'SAFE' | 'ELEVATED_VULNERABILITY' | 'CRITICAL_GUST_ALERT' | 'IMMINENT_ROLLOVER_SHUTDOWN' = 'SAFE';
  let recommendedAction = 'Maintain normal highway operation. Crosswind forces within aerodynamic safety threshold.';

  if (rolloverVulnerabilityPercent > 85) {
    rolloverStatus = 'IMMINENT_ROLLOVER_SHUTDOWN';
    recommendedAction = 'MANDATORY SHUTDOWN: Extreme crosswind rollover danger for current rig weight profile. Pull over immediately at nearest travel plaza or truck rest area.';
  } else if (rolloverVulnerabilityPercent > 65) {
    rolloverStatus = 'CRITICAL_GUST_ALERT';
    recommendedAction = 'Reduce speed to under 45 MPH. Keep two hands firmly gripped at 9-and-3. Anticipate wind shadow breaks near bridge abutments and mountain cuts.';
  } else if (rolloverVulnerabilityPercent > 40) {
    rolloverStatus = 'ELEVATED_VULNERABILITY';
    recommendedAction = 'Moderate lateral buffeting detected. Avoid traveling immediately adjacent to small passenger vehicles in downwind lanes.';
  }

  return {
    windSpeedMph,
    windAngleDegrees,
    effectiveLateralForceLbs,
    rolloverVulnerabilityPercent,
    rolloverStatus,
    recommendedAction,
  };
}
