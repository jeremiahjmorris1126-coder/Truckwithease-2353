/**
 * ============================================================================
 * TRUCKWITHEASE™ NEXT-GEN PROPRIETARY FLEET INNOVATIONS ENGINE
 * 
 * 1. Acousto-Kinetic Wheel-End & Hub Bearing Failure Forecaster
 * 2. Pre-Scale Virtual DOT Level-1 Inspection Simulator & Bypass Engine
 * 3. Dynamic IFTA Fuel Tax Arbitrage & Elevation-Grade Optimizer
 * 4. In-Cab AR Blind-Spot & Backing Trajectory Assistant
 * 5. Autonomous Broker Spot-Rate Negotiation & Lane Profit Maximizer
 * ============================================================================
 */

// ================= 1. ACOUSTO-KINETIC BEARING MODELS =================
export interface WheelEndAcousticSensor {
  wheelPosition: 'STEER_LEFT' | 'STEER_RIGHT' | 'DRIVE_FRONT_LEFT' | 'DRIVE_FRONT_RIGHT' | 'DRIVE_REAR_LEFT' | 'DRIVE_REAR_RIGHT' | 'TRAILER_AXLE1_LEFT' | 'TRAILER_AXLE1_RIGHT' | 'TRAILER_AXLE2_LEFT' | 'TRAILER_AXLE2_RIGHT';
  positionLabel: string;
  temperatureF: number;
  acousticAmplitudeDb: number;
  dominantFrequencyKhz: number;
  j1939AbsPulseJitterMicrosec: number;
  bearingHealthScore: number; // 0 - 100
  defectType: 'HEALTHY_LUBRICATED' | 'OUTER_RACE_MICRO_SPALL' | 'DRY_ROLLER_FRICTION' | 'DRAGGING_BRAKE_SHOE' | 'HUB_SEAL_LEAK';
  status: 'OPTIMAL' | 'WATCH_MONITOR' | 'CRITICAL_REPAIR_REQUIRED';
  estimatedMilesToFailure: number;
}

// ================= 2. PRE-SCALE DOT LEVEL-1 SIMULATOR MODELS =================
export interface PreScaleInspectionPoint {
  stationName: string;
  highway: string;
  mileMarker: string;
  distanceMiles: number;
  estimatedArrivalMin: number;
  isOpen: boolean;
  scaleType: 'STATIC_PLATFORM' | 'WIM_HIGH_SPEED_VIRTUAL' | 'THERMAL_INFRARED_PORTAL';
  historicalCarrierIssScore: number; // 1-100 (FMCSA ISS-D)
  recommendationCategory: 'PASS_GREEN_LIGHT' | 'OPTIONAL_YELLOW' | 'INSPECT_RED_LIGHT';
  predictedBypassProbabilityPct: number;
  checklistItems: {
    system: string;
    status: 'CLEARED' | 'MINOR_FLAG' | 'OUT_OF_SERVICE_RISK';
    reading: string;
    remediationAction?: string;
  }[];
}

// ================= 3. IFTA FUEL ARBITRAGE MODELS =================
export interface StateFuelTaxRate {
  state: string;
  pumpPricePerGallon: number;
  stateIftaTaxRate: number; // e.g. $0.485/gal
  netBasePricePerGal: number; // pumpPrice - stateIftaTaxRate
  carrierDiscountPerGal: number; // e.g. Pilot $0.35
  effectiveNetPrice: number;
  elevationTrend: 'CLIMBING_PASS' | 'FLAT_HIGHWAY' | 'DOWNHILL_REGEN';
  fuelBurnMpg: number;
}

export interface IftaRoutePlan {
  origin: string;
  destination: string;
  totalMiles: number;
  baselineExpense: number;
  optimizedExpense: number;
  netTripSavings: number;
  recommendedStops: {
    stopName: string;
    location: string;
    gallonsToPurchase: number;
    pumpPrice: number;
    effectiveNetPrice: number;
    savingsVsNextState: number;
    reasoning: string;
  }[];
}

// ================= 4. AR BACKING ASSISTANT MODELS =================
export interface DockingTrajectoryState {
  trailerLengthFt: number; // 53 ft standard
  articulationAngleDeg: number; // Angle between tractor and trailer (-90 to +90)
  targetBayNumber: string;
  dockType: '90_DEGREE_ALLEY' | '45_DEGREE_ANGLED' | 'INDOOR_TIGHT_SLOT';
  distanceToBumperFt: number;
  jackknifeRiskLevel: 'SAFE' | 'CAUTION' | 'CRITICAL_JACKKNIFE_IMMINENT';
  tailSwingClearanceInches: number;
  blindSideClearanceFt: number;
  guideLines: {
    pivotPointX: number;
    pivotPointY: number;
    trailerBoxX: number;
    trailerBoxY: number;
    recommendedSteeringDirection: 'HARD_LEFT' | 'CHASE_RIGHT' | 'HOLD_CENTER' | 'PULL_FORWARD';
  };
}

// ================= 5. BROKER RATE NEGOTIATOR MODELS =================
export interface BrokerNegotiationScenario {
  lane: string;
  origin: string;
  destination: string;
  mileage: number;
  deadheadMiles: number;
  brokerInitialOffer: number;
  initialRatePerMile: number;
  datSpotRateAvg: number;
  contractRateBenchmark: number;
  estimatedTripOperatingCost: number; // Fuel, driver, tolls, wear
  targetCounterOffer: number;
  targetRatePerMile: number;
  maxCeilingRate: number;
  expectedNetCarrierProfit: number;
  negotiationPoints: string[];
  autoDraftMessage: string;
}

// ================= INITIAL SEED DATA =================

export const INITIAL_WHEEL_END_SENSORS: WheelEndAcousticSensor[] = [
  {
    wheelPosition: 'STEER_LEFT',
    positionLabel: 'Pos 1 (Steer Left)',
    temperatureF: 114,
    acousticAmplitudeDb: 22,
    dominantFrequencyKhz: 3.2,
    j1939AbsPulseJitterMicrosec: 1.2,
    bearingHealthScore: 98,
    defectType: 'HEALTHY_LUBRICATED',
    status: 'OPTIMAL',
    estimatedMilesToFailure: 185000,
  },
  {
    wheelPosition: 'STEER_RIGHT',
    positionLabel: 'Pos 2 (Steer Right)',
    temperatureF: 118,
    acousticAmplitudeDb: 24,
    dominantFrequencyKhz: 3.4,
    j1939AbsPulseJitterMicrosec: 1.4,
    bearingHealthScore: 96,
    defectType: 'HEALTHY_LUBRICATED',
    status: 'OPTIMAL',
    estimatedMilesToFailure: 172000,
  },
  {
    wheelPosition: 'DRIVE_FRONT_LEFT',
    positionLabel: 'Pos 3 (Drive Forward Left)',
    temperatureF: 142,
    acousticAmplitudeDb: 48,
    dominantFrequencyKhz: 14.8,
    j1939AbsPulseJitterMicrosec: 6.8,
    bearingHealthScore: 78,
    defectType: 'OUTER_RACE_MICRO_SPALL',
    status: 'WATCH_MONITOR',
    estimatedMilesToFailure: 1420,
  },
  {
    wheelPosition: 'DRIVE_FRONT_RIGHT',
    positionLabel: 'Pos 4 (Drive Forward Right)',
    temperatureF: 122,
    acousticAmplitudeDb: 26,
    dominantFrequencyKhz: 3.8,
    j1939AbsPulseJitterMicrosec: 1.8,
    bearingHealthScore: 94,
    defectType: 'HEALTHY_LUBRICATED',
    status: 'OPTIMAL',
    estimatedMilesToFailure: 160000,
  },
  {
    wheelPosition: 'DRIVE_REAR_LEFT',
    positionLabel: 'Pos 5 (Drive Rear Left)',
    temperatureF: 126,
    acousticAmplitudeDb: 28,
    dominantFrequencyKhz: 4.1,
    j1939AbsPulseJitterMicrosec: 2.1,
    bearingHealthScore: 92,
    defectType: 'HEALTHY_LUBRICATED',
    status: 'OPTIMAL',
    estimatedMilesToFailure: 155000,
  },
  {
    wheelPosition: 'DRIVE_REAR_RIGHT',
    positionLabel: 'Pos 6 (Drive Rear Right)',
    temperatureF: 128,
    acousticAmplitudeDb: 31,
    dominantFrequencyKhz: 4.6,
    j1939AbsPulseJitterMicrosec: 2.4,
    bearingHealthScore: 91,
    defectType: 'HEALTHY_LUBRICATED',
    status: 'OPTIMAL',
    estimatedMilesToFailure: 148000,
  },
  {
    wheelPosition: 'TRAILER_AXLE1_LEFT',
    positionLabel: 'Pos 7 (Trailer Axle 1 Left)',
    temperatureF: 188,
    acousticAmplitudeDb: 76,
    dominantFrequencyKhz: 28.4,
    j1939AbsPulseJitterMicrosec: 14.2,
    bearingHealthScore: 42,
    defectType: 'DRAGGING_BRAKE_SHOE',
    status: 'CRITICAL_REPAIR_REQUIRED',
    estimatedMilesToFailure: 340,
  },
  {
    wheelPosition: 'TRAILER_AXLE1_RIGHT',
    positionLabel: 'Pos 8 (Trailer Axle 1 Right)',
    temperatureF: 130,
    acousticAmplitudeDb: 29,
    dominantFrequencyKhz: 3.9,
    j1939AbsPulseJitterMicrosec: 1.9,
    bearingHealthScore: 93,
    defectType: 'HEALTHY_LUBRICATED',
    status: 'OPTIMAL',
    estimatedMilesToFailure: 165000,
  },
];

export const INITIAL_PRE_SCALE_SCENARIO: PreScaleInspectionPoint = {
  stationName: 'I-80 Eastbound Weigh & Inspection Station',
  highway: 'Interstate 80 Mile Marker 42.4',
  mileMarker: 'MM 42.4',
  distanceMiles: 4.8,
  estimatedArrivalMin: 5,
  isOpen: true,
  scaleType: 'THERMAL_INFRARED_PORTAL',
  historicalCarrierIssScore: 28, // 1-49 = Pass Green Light
  recommendationCategory: 'PASS_GREEN_LIGHT',
  predictedBypassProbabilityPct: 94,
  checklistItems: [
    { system: 'ELD Hours of Service (Part 395)', status: 'CLEARED', reading: '3h 42m Driving Rem / No Violations' },
    { system: 'WIM Virtual Gross Weight Estimate', status: 'CLEARED', reading: '78,420 lbs (Under 80,000 lbs Limit)' },
    { system: 'Tandem Axle Weight Balance', status: 'CLEARED', reading: 'Steer: 11,800 | Drive: 33,200 | Trailer: 33,420' },
    { system: 'Thermal Infrared Rotor Balance', status: 'MINOR_FLAG', reading: 'Trailer Axle 1 Left 188°F (Brake Shoe Heat Spoke)', remediationAction: 'Tap service brake lightly to release shoe binding' },
    { system: 'FMCSA Safety Fitness & Crash PSP', status: 'CLEARED', reading: 'Clean Carrier Record / 0 Unaddressed Violations' },
    { system: 'Drivewyze / PrePass Digital Credential', status: 'CLEARED', reading: 'Active Token Synchronized #DW-84920' },
  ],
};

export const INITIAL_IFTA_STATE_RATES: StateFuelTaxRate[] = [
  { state: 'IL', pumpPricePerGallon: 3.58, stateIftaTaxRate: 0.582, netBasePricePerGal: 2.998, carrierDiscountPerGal: 0.40, effectiveNetPrice: 2.598, elevationTrend: 'FLAT_HIGHWAY', fuelBurnMpg: 7.2 },
  { state: 'IN', pumpPricePerGallon: 3.42, stateIftaTaxRate: 0.340, netBasePricePerGal: 3.080, carrierDiscountPerGal: 0.35, effectiveNetPrice: 2.730, elevationTrend: 'FLAT_HIGHWAY', fuelBurnMpg: 7.1 },
  { state: 'OH', pumpPricePerGallon: 3.39, stateIftaTaxRate: 0.385, netBasePricePerGal: 3.005, carrierDiscountPerGal: 0.38, effectiveNetPrice: 2.625, elevationTrend: 'FLAT_HIGHWAY', fuelBurnMpg: 7.3 },
  { state: 'PA', pumpPricePerGallon: 3.82, stateIftaTaxRate: 0.741, netBasePricePerGal: 3.079, carrierDiscountPerGal: 0.42, effectiveNetPrice: 2.659, elevationTrend: 'CLIMBING_PASS', fuelBurnMpg: 5.8 },
];

export const INITIAL_IFTA_ROUTE_PLAN: IftaRoutePlan = {
  origin: 'Chicago, IL',
  destination: 'Harrisburg, PA',
  totalMiles: 685,
  baselineExpense: 374.80,
  optimizedExpense: 292.40,
  netTripSavings: 82.40,
  recommendedStops: [
    {
      stopName: 'Pilot Travel Center #412',
      location: 'Gary, IL (I-94 Exit 12)',
      gallonsToPurchase: 80,
      pumpPrice: 3.58,
      effectiveNetPrice: 2.598,
      savingsVsNextState: 48.20,
      reasoning: 'Highest IFTA State Tax Refund Credit ($0.582/gal). Maximize gallons here before crossing into Indiana.',
    },
    {
      stopName: 'Love\'s Travel Stop #680',
      location: 'Hubbard, OH (I-80 Exit 234)',
      gallonsToPurchase: 65,
      pumpPrice: 3.39,
      effectiveNetPrice: 2.625,
      savingsVsNextState: 34.20,
      reasoning: 'Fill before Pennsylvania Allegheny mountain elevation grades (PA pump price is $3.82/gal).',
    },
  ],
};

export const INITIAL_DOCKING_STATE: DockingTrajectoryState = {
  trailerLengthFt: 53,
  articulationAngleDeg: -22,
  targetBayNumber: 'Bay 14 (Cold Storage Terminal)',
  dockType: '90_DEGREE_ALLEY',
  distanceToBumperFt: 14.8,
  jackknifeRiskLevel: 'SAFE',
  tailSwingClearanceInches: 38,
  blindSideClearanceFt: 8.4,
  guideLines: {
    pivotPointX: 50,
    pivotPointY: 70,
    trailerBoxX: 48,
    trailerBoxY: 45,
    recommendedSteeringDirection: 'CHASE_RIGHT',
  },
};

export const INITIAL_BROKER_SCENARIOS: BrokerNegotiationScenario[] = [
  {
    lane: 'Atlanta, GA → Chicago, IL (Reefer 42,000 lbs)',
    origin: 'Atlanta, GA',
    destination: 'Chicago, IL',
    mileage: 715,
    deadheadMiles: 28,
    brokerInitialOffer: 1950,
    initialRatePerMile: 2.72,
    datSpotRateAvg: 2350,
    contractRateBenchmark: 2480,
    estimatedTripOperatingCost: 1220,
    targetCounterOffer: 2450,
    targetRatePerMile: 3.42,
    maxCeilingRate: 2600,
    expectedNetCarrierProfit: 1230,
    negotiationPoints: [
      'Current spot capacity out of Atlanta is tightened by +18% due to produce volume surge.',
      'Carrier possesses verified 100% clean DQF compliance, CARB refrigerated unit certificate, and 24/7 telematics tracking.',
      'Our Cascadia is staged 28 miles away with available 11h driving clock, guaranteeing on-time pickup in under 45 minutes.',
    ],
    autoDraftMessage:
      'Hi Broker Team — We have our unit TR-904 staged 28 miles out ready for immediate dispatch on this Atlanta → Chicago reefer load. Given current market capacity tightening and immediate 45-min pickup guarantee with 24/7 live telematics, we can lock this in for $2,450 all-in ($3.42/mi). Send rate con over for instant signature.',
  },
  {
    lane: 'Dallas, TX → Los Angeles, CA (Dry Van 38,000 lbs)',
    origin: 'Dallas, TX',
    destination: 'Los Angeles, CA',
    mileage: 1440,
    deadheadMiles: 15,
    brokerInitialOffer: 2880,
    initialRatePerMile: 2.00,
    datSpotRateAvg: 3450,
    contractRateBenchmark: 3600,
    estimatedTripOperatingCost: 2150,
    targetCounterOffer: 3550,
    targetRatePerMile: 2.46,
    maxCeilingRate: 3800,
    expectedNetCarrierProfit: 1400,
    negotiationPoints: [
      'Westbound I-10 corridor fuel costs and high return deadhead risk necessitate $2.46/mi minimum.',
      'Team driver capability available for continuous 24-hour transit without multi-day layover.',
    ],
    autoDraftMessage:
      'Good morning — We can take your Dallas to LA dry van freight today. We have team drivers ready for continuous expedited transit. Our firm rate for guaranteed 28-hr delivery is $3,550 all-in. Please advise if rate con can be dispatched immediately.',
  },
];
