// Service for Calculating 80,000 lb Axle Weight Distribution, State KPRA Bridge Limits, and Loader Floor Diagrams

export interface StateBridgeLimit {
  stateCode: string;
  stateName: string;
  maxGrossWeightLbs: number;
  maxSteerLbs: number;
  maxSingleAxleLbs: number;
  maxTandemLbs: number;
  kpraMaxDistanceFeet: number; // Kingpin to center of rear axle
  kpraRuleNotes: string;
  enforcementStrictness: 'STRICT_SCALE_MONITORED' | 'STANDARD' | 'PERMIT_TOLERANT';
}

export interface TractorCapacitySpec {
  unitNumber: string;
  steerGawrLbs: number; // e.g. 12,500 - 13,200
  driveGawrLbs: number; // e.g. 40,000 mechanical / 34,000 statutory
  tractorTareWeightLbs: number; // ~18,500 lbs
  fuelTankCapacityGallons: number; // 200 gal
  fuelLevelPercent: number; // 100%
  fifthWheelPositionHole: number; // 1 to 10
}

export interface TrailerSpec {
  trailerNumber: string;
  trailerLengthFeet: 53 | 48 | 45 | 28;
  trailerType: 'Dry Van 53\'' | 'Reefer 53\'' | 'Flatbed 48\'' | 'Stepdeck';
  trailerTareWeightLbs: number; // ~13,800 for dry van, ~15,200 for reefer
  trailerGawrLbs: number; // 34,000 statutory
  totalPinHoles: number; // usually 12 to 14 holes
  selectedTandemHole: number; // 1 (full back) to 12 (full forward)
  inchesPerHole: number; // 4 inches
  weightShiftPerHoleLbs: number; // ~450 - 500 lbs
}

export interface PalletPosition {
  slotNumber: number; // 1 to 26 for 53'
  row: number; // 1 to 13
  side: 'LEFT' | 'RIGHT';
  weightLbs: number;
  zone: 'NOSE' | 'BELLY_CORE' | 'OVER_TANDEM' | 'TAIL';
  isLoaded: boolean;
  notes?: string;
}

export interface AxleWeightCalculationResult {
  steerWeightLbs: number;
  driveTandemWeightLbs: number;
  trailerTandemWeightLbs: number;
  grossCombinationWeightLbs: number;
  isSteerLegal: boolean;
  isDriveLegal: boolean;
  isTrailerLegal: boolean;
  isGrossLegal: boolean;
  allAxlesLegal: boolean;
  steerOverUnderLbs: number; // negative = under legal, positive = over
  driveOverUnderLbs: number;
  trailerOverUnderLbs: number;
  grossOverUnderLbs: number;
  recommendedTandemHole: number;
  kpraDistanceFeet: number;
  kpraComplianceState: {
    stateCode: string;
    isLegal: boolean;
    maxAllowedFeet: number;
    differenceFeet: number;
  };
  loaderDirectives: string[];
}

// 50 US States Axle & KPRA Database
export const US_STATE_BRIDGE_REGULATIONS: Record<string, StateBridgeLimit> = {
  CA: {
    stateCode: 'CA',
    stateName: 'California',
    maxGrossWeightLbs: 80000,
    maxSteerLbs: 12500,
    maxSingleAxleLbs: 20000,
    maxTandemLbs: 34000,
    kpraMaxDistanceFeet: 40.0,
    kpraRuleNotes: 'Mandatory 40\' 0" KPRA. Strictly enforced at all CHP scales. Tandems MUST be slid forward (Hole 5–6).',
    enforcementStrictness: 'STRICT_SCALE_MONITORED',
  },
  IL: {
    stateCode: 'IL',
    stateName: 'Illinois',
    maxGrossWeightLbs: 80000,
    maxSteerLbs: 12000,
    maxSingleAxleLbs: 20000,
    maxTandemLbs: 34000,
    kpraMaxDistanceFeet: 45.5,
    kpraRuleNotes: '45\' 6" max on designated state highways; 42\' 6" on other state highways.',
    enforcementStrictness: 'STRICT_SCALE_MONITORED',
  },
  IN: {
    stateCode: 'IN',
    stateName: 'Indiana',
    maxGrossWeightLbs: 80000,
    maxSteerLbs: 12000,
    maxSingleAxleLbs: 20000,
    maxTandemLbs: 34000,
    kpraMaxDistanceFeet: 43.0,
    kpraRuleNotes: '43\' 0" KPRA recommended on state routes. 34,000 lbs max tandem.',
    enforcementStrictness: 'STANDARD',
  },
  PA: {
    stateCode: 'PA',
    stateName: 'Pennsylvania',
    maxGrossWeightLbs: 80000,
    maxSteerLbs: 12000,
    maxSingleAxleLbs: 20000,
    maxTandemLbs: 34000,
    kpraMaxDistanceFeet: 41.0,
    kpraRuleNotes: '41\' 0" max KPRA from kingpin to center of rear axle assembly.',
    enforcementStrictness: 'STRICT_SCALE_MONITORED',
  },
  FL: {
    stateCode: 'FL',
    stateName: 'Florida',
    maxGrossWeightLbs: 80000,
    maxSteerLbs: 12000,
    maxSingleAxleLbs: 20000,
    maxTandemLbs: 34000,
    kpraMaxDistanceFeet: 41.0,
    kpraRuleNotes: '41\' 0" max KPRA on 53-ft semi-trailers measured to rearmost axle center.',
    enforcementStrictness: 'STRICT_SCALE_MONITORED',
  },
  MI: {
    stateCode: 'MI',
    stateName: 'Michigan',
    maxGrossWeightLbs: 80000,
    maxSteerLbs: 12000,
    maxSingleAxleLbs: 18000,
    maxTandemLbs: 32000,
    kpraMaxDistanceFeet: 40.5,
    kpraRuleNotes: '32,000 lbs tandem on designated routes without frost law permits. 40\' 6" KPRA.',
    enforcementStrictness: 'STRICT_SCALE_MONITORED',
  },
  TX: {
    stateCode: 'TX',
    stateName: 'Texas',
    maxGrossWeightLbs: 80000,
    maxSteerLbs: 12000,
    maxSingleAxleLbs: 20000,
    maxTandemLbs: 34000,
    kpraMaxDistanceFeet: 45.0,
    kpraRuleNotes: 'No strict KPRA limit on interstate, standard Federal Bridge Formula 80,000 lbs.',
    enforcementStrictness: 'STANDARD',
  },
  OH: {
    stateCode: 'OH',
    stateName: 'Ohio',
    maxGrossWeightLbs: 80000,
    maxSteerLbs: 12000,
    maxSingleAxleLbs: 20000,
    maxTandemLbs: 34000,
    kpraMaxDistanceFeet: 43.0,
    kpraRuleNotes: 'Standard 43\' KPRA advisory. High density of weigh-in-motion bypass scales.',
    enforcementStrictness: 'STANDARD',
  },
  MO: {
    stateCode: 'MO',
    stateName: 'Missouri',
    maxGrossWeightLbs: 80000,
    maxSteerLbs: 12000,
    maxSingleAxleLbs: 20000,
    maxTandemLbs: 34000,
    kpraMaxDistanceFeet: 45.0,
    kpraRuleNotes: '80,000 lbs gross combination. 34,000 lbs drive and trailer tandems.',
    enforcementStrictness: 'STANDARD',
  },
  GA: {
    stateCode: 'GA',
    stateName: 'Georgia',
    maxGrossWeightLbs: 80000,
    maxSteerLbs: 12000,
    maxSingleAxleLbs: 20340,
    maxTandemLbs: 34000,
    kpraMaxDistanceFeet: 41.0,
    kpraRuleNotes: '41\' 0" max KPRA on state routes. Strict scale inspection houses on I-75 & I-95.',
    enforcementStrictness: 'STRICT_SCALE_MONITORED',
  },
  NY: {
    stateCode: 'NY',
    stateName: 'New York',
    maxGrossWeightLbs: 80000,
    maxSteerLbs: 12000,
    maxSingleAxleLbs: 20000,
    maxTandemLbs: 34000,
    kpraMaxDistanceFeet: 43.0,
    kpraRuleNotes: '43\' 0" KPRA on Qualifying Highways. 53\' trailers restricted in NYC boroughs without special permit.',
    enforcementStrictness: 'STRICT_SCALE_MONITORED',
  },
  DEFAULT: {
    stateCode: 'US',
    stateName: 'Federal Interstate (Standard Bridge B)',
    maxGrossWeightLbs: 80000,
    maxSteerLbs: 12000,
    maxSingleAxleLbs: 20000,
    maxTandemLbs: 34000,
    kpraMaxDistanceFeet: 43.0,
    kpraRuleNotes: 'Federal Bridge Formula B: 80,000 lbs Gross, 12k Steer, 34k Drives, 34k Trailer.',
    enforcementStrictness: 'STANDARD',
  },
};

export function getStateBridgeRegulation(stateCode: string): StateBridgeLimit {
  const code = (stateCode || '').trim().toUpperCase();
  return US_STATE_BRIDGE_REGULATIONS[code] || US_STATE_BRIDGE_REGULATIONS.DEFAULT;
}

// Generate Default 26-Pallet Layout for a 53-Foot Trailer
export function generateDefault53FootPalletLayout(
  totalCargoWeightLbs: number,
  palletCount: number = 26
): PalletPosition[] {
  const positions: PalletPosition[] = [];
  const baseWeightPerPallet = Math.round(totalCargoWeightLbs / Math.max(1, palletCount));

  // In an 80,000 lb load (typically 44,000 to 45,500 lbs cargo):
  // Slots 1 to 4: Nose zone (2 rows = 4 pallets)
  // Slots 5 to 18: Belly / Core bridge zone (7 rows = 14 pallets)
  // Slots 19 to 24: Over-tandem zone (3 rows = 6 pallets)
  // Slots 25 to 26: Tail zone (1 row = 2 pallets)

  for (let slot = 1; slot <= 26; slot++) {
    const row = Math.ceil(slot / 2);
    const side: 'LEFT' | 'RIGHT' = slot % 2 === 1 ? 'LEFT' : 'RIGHT';
    const isLoaded = slot <= palletCount;

    let zone: 'NOSE' | 'BELLY_CORE' | 'OVER_TANDEM' | 'TAIL' = 'BELLY_CORE';
    if (row <= 2) zone = 'NOSE';
    else if (row <= 9) zone = 'BELLY_CORE';
    else if (row <= 12) zone = 'OVER_TANDEM';
    else zone = 'TAIL';

    let weightLbs = 0;
    if (isLoaded) {
      // Slightly modulate weights: nose and tail slightly lighter to protect steers and rear tandems
      if (zone === 'NOSE' || zone === 'TAIL') {
        weightLbs = Math.round(baseWeightPerPallet * 0.95);
      } else {
        weightLbs = Math.round(baseWeightPerPallet * 1.02);
      }
    }

    positions.push({
      slotNumber: slot,
      row,
      side,
      weightLbs,
      zone,
      isLoaded,
    });
  }

  return positions;
}

/**
 * Calculates physics-based axle weights for tractor-trailer combination:
 * Accounts for tractor empty tare, trailer empty tare, fuel weight, fifth wheel setting,
 * cargo pallet centroid distribution, and trailer tandem slider hole.
 */
export function calculateCombinationAxleWeights(params: {
  cargoWeightLbs: number;
  palletPositions: PalletPosition[];
  tractorSpec: TractorCapacitySpec;
  trailerSpec: TrailerSpec;
  destinationStateCode: string;
}): AxleWeightCalculationResult {
  const { cargoWeightLbs, palletPositions, tractorSpec, trailerSpec, destinationStateCode } = params;
  const stateRule = getStateBridgeRegulation(destinationStateCode);

  // 1. Base Empty Tare Weights
  // Typical Class 8 Sleeper Tractor: 18,500 lbs tare (Steer ~10,400 lbs, Drives ~8,100 lbs empty)
  // Fuel: 200 gal @ 7.1 lbs/gal = 1,420 lbs (shifts ~400 lbs to steer, ~1,020 lbs to drives)
  const fuelWeight = Math.round(tractorSpec.fuelTankCapacityGallons * (tractorSpec.fuelLevelPercent / 100) * 7.1);
  const tractorSteerBase = 10400 + Math.round(fuelWeight * 0.28);
  const tractorDriveBase = 8100 + Math.round(fuelWeight * 0.72);

  // Typical 53' Dry Van: 13,800 lbs empty (Kingpin imposes ~4,200 lbs on 5th wheel/drives, ~9,600 lbs on trailer tandems)
  // Reefer adds ~1,500 lbs to nose (reefer unit + diesel belly tank)
  const isReefer = trailerSpec.trailerType.includes('Reefer');
  const trailerTareTotal = isReefer ? 15200 : trailerSpec.trailerTareWeightLbs;
  const trailerNoseTare = isReefer ? 5600 : 4200;
  const trailerTandemTare = isReefer ? 9600 : 9600;

  // 2. Cargo Moment & Center of Gravity Calculation
  // 53' trailer interior is ~630 inches long.
  // Kingpin is typically 36" from trailer front.
  // Pallet rows 1 to 13 are positioned at approximately 44" intervals from trailer front.
  let totalCalculatedCargo = 0;
  let cargoMomentAboutKingpin = 0;

  const actualPallets = palletPositions.filter((p) => p.isLoaded);
  if (actualPallets.length > 0) {
    actualPallets.forEach((p) => {
      totalCalculatedCargo += p.weightLbs;
      // Distance of row center from front of trailer (inches)
      const distFromFrontInches = 24 + (p.row - 1) * 44;
      const distFromKingpinInches = Math.max(0, distFromFrontInches - 36);
      cargoMomentAboutKingpin += p.weightLbs * distFromKingpinInches;
    });
  } else {
    totalCalculatedCargo = cargoWeightLbs;
    // Assume evenly distributed cargo centered at 300 inches
    cargoMomentAboutKingpin = cargoWeightLbs * 280;
  }

  // Tandem Slider Position (Hole 1 is all the way back, Hole 12 is all the way forward)
  // Standard 53' trailer:
  // Hole 1 (rearmost): KPRA is ~43.5 ft (522 in). Distance from kingpin to tandem center = 500 in.
  // Each hole forward moves tandem 4 inches closer to kingpin, shifting ~480 lbs to drives.
  const baseTandemDistanceInches = 522 - (trailerSpec.selectedTandemHole - 1) * trailerSpec.inchesPerHole;
  const kpraFeet = +(baseTandemDistanceInches / 12).toFixed(1);

  // Cargo Weight Transfer to Trailer Tandems vs Kingpin
  const cargoOnTrailerTandem = Math.round(cargoMomentAboutKingpin / Math.max(300, baseTandemDistanceInches));
  const cargoOnKingpin = Math.max(0, totalCalculatedCargo - cargoOnTrailerTandem);

  // Kingpin Weight transfers to Tractor Drives and Steer:
  // Fifth wheel is usually set 1 to 2 inches ahead of drive tandem center:
  // ~94% goes to drive tandems, ~6% goes to steer axle.
  const steerCargoTransfer = Math.round(cargoOnKingpin * 0.05);
  const driveCargoTransfer = Math.round(cargoOnKingpin * 0.95);

  // Final Scaled Axle Weights
  const steerWeightLbs = tractorSteerBase + steerCargoTransfer;
  const driveTandemWeightLbs = tractorDriveBase + trailerNoseTare + driveCargoTransfer;
  const trailerTandemWeightLbs = trailerTandemTare + cargoOnTrailerTandem;
  const grossCombinationWeightLbs = steerWeightLbs + driveTandemWeightLbs + trailerTandemWeightLbs;

  // Statutory Validation
  const maxSteer = stateRule.maxSteerLbs;
  const maxDrive = stateRule.maxTandemLbs;
  const maxTrailer = stateRule.maxTandemLbs;
  const maxGross = stateRule.maxGrossWeightLbs;

  const isSteerLegal = steerWeightLbs <= maxSteer;
  const isDriveLegal = driveTandemWeightLbs <= maxDrive;
  const isTrailerLegal = trailerTandemWeightLbs <= maxTrailer;
  const isGrossLegal = grossCombinationWeightLbs <= maxGross;
  const allAxlesLegal = isSteerLegal && isDriveLegal && isTrailerLegal && isGrossLegal;

  // Tandem Hole Recommendation to Balance Overloaded Tandems
  let recommendedTandemHole = trailerSpec.selectedTandemHole;
  if (driveTandemWeightLbs > maxDrive && trailerTandemWeightLbs < maxTrailer) {
    // Drives are heavy -> slide tandems BACK (lower hole number) to shift weight to trailer
    const excessDrive = driveTandemWeightLbs - maxDrive;
    const holesNeeded = Math.ceil(excessDrive / trailerSpec.weightShiftPerHoleLbs);
    recommendedTandemHole = Math.max(1, trailerSpec.selectedTandemHole - holesNeeded);
  } else if (trailerTandemWeightLbs > maxTrailer && driveTandemWeightLbs < maxDrive) {
    // Trailer is heavy -> slide tandems FORWARD (higher hole number) to shift weight to drives
    const excessTrailer = trailerTandemWeightLbs - maxTrailer;
    const holesNeeded = Math.ceil(excessTrailer / trailerSpec.weightShiftPerHoleLbs);
    recommendedTandemHole = Math.min(trailerSpec.totalPinHoles, trailerSpec.selectedTandemHole + holesNeeded);
  }

  // Check state KPRA compliance
  const isKpraLegal = kpraFeet <= stateRule.kpraMaxDistanceFeet;
  const kpraDiff = +(kpraFeet - stateRule.kpraMaxDistanceFeet).toFixed(1);

  // Generate clear loader and driver directives
  const loaderDirectives: string[] = [];

  if (grossCombinationWeightLbs > 80000) {
    loaderDirectives.push(
      `CRITICAL OVERWEIGHT: Gross combination is ${grossCombinationWeightLbs.toLocaleString()} lbs (${(grossCombinationWeightLbs - 80000).toLocaleString()} lbs over the 80,000 lb federal cap). Remove cargo before leaving dock.`
    );
  }

  if (driveTandemWeightLbs > 34000) {
    loaderDirectives.push(
      `DRIVE AXLE OVERWEIGHT: Drives scale at ${driveTandemWeightLbs.toLocaleString()} lbs (limit 34,000 lbs). Slide trailer tandems BACK ${Math.ceil((driveTandemWeightLbs - 34000) / 480)} holes or move pallets rearward.`
    );
  }

  if (trailerTandemWeightLbs > 34000) {
    loaderDirectives.push(
      `TRAILER AXLE OVERWEIGHT: Trailer tandems scale at ${trailerTandemWeightLbs.toLocaleString()} lbs (limit 34,000 lbs). Slide trailer tandems FORWARD ${Math.ceil((trailerTandemWeightLbs - 34000) / 480)} holes or restack pallets forward toward belly.`
    );
  }

  if (!isKpraLegal) {
    loaderDirectives.push(
      `STATE KPRA VIOLATION: Current kingpin-to-rear-axle is ${kpraFeet}' (exceeds ${stateRule.stateName} maximum allowed limit of ${stateRule.kpraMaxDistanceFeet}'). Tandem slider must be pinned in Hole 5 or 6 before entering state.`
    );
  }

  if (allAxlesLegal && isKpraLegal) {
    loaderDirectives.push(
      `PERFECT LOAD BALANCE: Steer ${steerWeightLbs.toLocaleString()} lbs, Drives ${driveTandemWeightLbs.toLocaleString()} lbs, Trailer ${trailerTandemWeightLbs.toLocaleString()} lbs, Gross ${grossCombinationWeightLbs.toLocaleString()} lbs. Cleared for weigh station bypass in ${stateRule.stateName}.`
    );
  }

  return {
    steerWeightLbs,
    driveTandemWeightLbs,
    trailerTandemWeightLbs,
    grossCombinationWeightLbs,
    isSteerLegal,
    isDriveLegal,
    isTrailerLegal,
    isGrossLegal,
    allAxlesLegal,
    steerOverUnderLbs: steerWeightLbs - maxSteer,
    driveOverUnderLbs: driveTandemWeightLbs - maxDrive,
    trailerOverUnderLbs: trailerTandemWeightLbs - maxTrailer,
    grossOverUnderLbs: grossCombinationWeightLbs - maxGross,
    recommendedTandemHole,
    kpraDistanceFeet: kpraFeet,
    kpraComplianceState: {
      stateCode: stateRule.stateCode,
      isLegal: isKpraLegal,
      maxAllowedFeet: stateRule.kpraMaxDistanceFeet,
      differenceFeet: kpraDiff,
    },
    loaderDirectives,
  };
}
