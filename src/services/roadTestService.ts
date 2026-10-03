import {
  RoadTestTemplate,
  RoadTestEvaluationItem,
  RoadTestRecord,
  RoadTestScoredItem,
  RoadTestOverallResult,
} from '../types';

// =====================================================================
// === MASTER FMCSA 49 CFR § 391.31 ROAD TEST ITEMS & EVALUATION CRITERIA ===
// =====================================================================

export const FMCSA_STATUTORY_ROAD_TEST_ITEMS: RoadTestEvaluationItem[] = [
  // 1. Pre-Trip Inspection & Air Brakes
  {
    id: 'rti-pretrip-airbrake',
    category: 'PRE_TRIP_AIR_BRAKES',
    categoryName: '1. Pre-Trip Inspection & Air Brake Test',
    name: '4-Point Air Brake Test & System Inspection',
    statutoryCfr: '49 CFR § 391.31(c)(1) & § 396.11',
    description: 'Verifies governor cut-out (120-135 PSI) and cut-in (~100 PSI), applied air leakage test (no more than 4 PSI drop in 1 min for combo), low-air warning buzzer/light (at or above 55-75 PSI), and tractor-trailer emergency spring brake valve pop-out (20-45 PSI).',
    pointsMax: 10,
    isMandatoryFmcsa: true,
    isCriticalDisqualifier: true, // CRITICAL: Failure to perform or passing a defective brake system is an automatic road test disqualification
    suggestedCriteria: [
      'Chocks wheels before performing cab air brake leak check',
      'Accurately states air pressure thresholds to trainer',
      'Demonstrates low pressure audio and visual alarm activation',
      'Confirms tractor and trailer protection valves pop out',
      'Inspects brake drums, linings (minimum 1/4" thickness), and slack adjusters',
    ],
  },
  {
    id: 'rti-pretrip-walkaround',
    category: 'PRE_TRIP_AIR_BRAKES',
    categoryName: '1. Pre-Trip Inspection & Air Brake Test',
    name: 'Comprehensive 360° Walk-Around Pre-Trip Inspection',
    statutoryCfr: '49 CFR § 391.31(c)(1)',
    description: 'Systematic inspection of engine compartment (oil, coolant, power steering, belts, hoses), steering linkages, suspension, tires/wheels/lug nuts, all DOT lighting, and emergency equipment.',
    pointsMax: 10,
    isMandatoryFmcsa: true,
    isCriticalDisqualifier: false,
    suggestedCriteria: [
      'Checks fluid levels cleanly without contamination',
      'Verifies steer tire tread depth (>= 4/32") and drive/trailer (>= 2/32")',
      'Tests all clearance lights, turn signals, brake lights, and hazards',
      'Verifies fire extinguisher (10 B:C minimum, charged/pinned) and 3 reflective triangles',
    ],
  },

  // 2. Coupling and Uncoupling
  {
    id: 'rti-coupling-5thwheel',
    category: 'COUPLING_UNCOUPLING',
    categoryName: '2. Coupling & Uncoupling Combination Units',
    name: 'Coupling Procedure, 5th Wheel Lock & Tug Test',
    statutoryCfr: '49 CFR § 391.31(c)(2)',
    description: 'Properly backs tractor squarely to trailer kingpin, verifies 5th wheel height and alignment, couples smoothly, visually confirms locking jaws closed around kingpin shank, performs positive tug test in low gear.',
    pointsMax: 10,
    isMandatoryFmcsa: true,
    isCriticalDisqualifier: true, // CRITICAL: Dropping trailer or failing to verify jaw lock is an automatic failure
    suggestedCriteria: [
      'Aligns tractor squarely with trailer apron',
      'Visually inspects kingpin lock with flashlight (zero gap between apron and plate)',
      'Confirms release handle safety latch is fully seated in closed notch',
      'Performs gentle forward tug test in 1st/low gear against trailer brakes',
    ],
  },
  {
    id: 'rti-coupling-airlines',
    category: 'COUPLING_UNCOUPLING',
    categoryName: '2. Coupling & Uncoupling Combination Units',
    name: 'Air Lines, Electrical 7-Way & Landing Gear Operation',
    statutoryCfr: '49 CFR § 391.31(c)(2)',
    description: 'Correctly hooks red (emergency) and blue (service) glad hands with undamaged rubber grommets, connects 7-way electrical cable with safety latch locked, charges air system, fully raises landing gear and stows crank handle.',
    pointsMax: 8,
    isMandatoryFmcsa: true,
    isCriticalDisqualifier: false,
    suggestedCriteria: [
      'Cross-checks glad hand color codes and seals for dry rot or leaks',
      'Locks 7-way plug detent securely',
      'Fully raises landing gear into high gear and locks crank handle into retaining bracket',
      'Checks for proper line slack preventing snagging during tight turns',
    ],
  },

  // 3. Placing Vehicle in Operation & Gauges
  {
    id: 'rti-startup-gauges',
    category: 'ENGINE_START_GAUGES',
    categoryName: '3. Engine Start & Dashboard Telematics',
    name: 'Safe Engine Start, Interlocks & Gauge Verification',
    statutoryCfr: '49 CFR § 391.31(c)(3)',
    description: 'Verifies parking brakes set, transmission in neutral / clutch depressed, observes dashboard self-test lights, monitors oil pressure rise within 15 seconds, and tracks primary/secondary air buildup.',
    pointsMax: 8,
    isMandatoryFmcsa: true,
    isCriticalDisqualifier: false,
    suggestedCriteria: [
      'Verifies parking brake set and gearshift in neutral before turning ignition key',
      'Waits for DEF/glow plug or wait-to-start lamp extinction',
      'Confirms oil pressure normal within 15 seconds of cranking',
      'Verifies ABS warning light cycles on and turns off normally',
    ],
  },

  // 4. Use of Controls and Transmission
  {
    id: 'rti-controls-shifting',
    category: 'CONTROLS_AND_SHIFTING',
    categoryName: '4. Vehicle Controls & Transmission Management',
    name: 'Smooth Acceleration, Shifting & Hand Positioning',
    statutoryCfr: '49 CFR § 391.31(c)(4)',
    description: 'Demonstrates smooth start without rollback on grades, proper progressive gear selection, double-clutching / automated manual control, and proper hand positioning at 9-and-3 or 8-and-4.',
    pointsMax: 10,
    isMandatoryFmcsa: true,
    isCriticalDisqualifier: false,
    suggestedCriteria: [
      'Starts smoothly without clutch popping or tire spinning',
      'Does not ride the clutch or coast in neutral',
      'Keeps two hands on steering wheel except during shifting or signal activation',
      'Maintains smooth power delivery without engine lugging or over-revving',
    ],
  },

  // 5. Operating in Traffic & Passing
  {
    id: 'rti-traffic-mirrors',
    category: 'TRAFFIC_AND_PASSING',
    categoryName: '5. Operating in Traffic & Lane Discipline',
    name: 'Mirror Scanning Cadence & Situational Awareness',
    statutoryCfr: '49 CFR § 391.31(c)(5)',
    description: 'Maintains systematic 5-to-8 second mirror scanning cadence (flat, convex, hood-mounted mirrors), scans intersections left-right-left before entering, detects blind spots and merges safely.',
    pointsMax: 10,
    isMandatoryFmcsa: true,
    isCriticalDisqualifier: false,
    suggestedCriteria: [
      'Scans left, right, and convex mirrors every 5-8 seconds',
      'Checks mirrors before and during all turns and lane changes',
      'Scans ahead 12-15 seconds (1/4 mile on highway, 1-2 blocks in city)',
      'Identifies potential merging hazards and highway construction cones early',
    ],
  },
  {
    id: 'rti-traffic-lane-control',
    category: 'TRAFFIC_AND_PASSING',
    categoryName: '5. Operating in Traffic & Lane Discipline',
    name: 'Lane Discipline, Turn Signaling & Safe Passing',
    statutoryCfr: '49 CFR § 391.31(c)(5)',
    description: 'Maintains centered lane positioning, signals lane changes at least 100-200 feet in advance, verifies blind spot clearance, completes passing maneuvers smoothly without cutting off other motorists.',
    pointsMax: 10,
    isMandatoryFmcsa: true,
    isCriticalDisqualifier: true, // CRITICAL: Unsafe lane change causing other vehicle evasive action is an automatic fail
    suggestedCriteria: [
      'Keeps vehicle centered in travel lane without wander',
      'Activates turn signals well before initiating lateral movement',
      'Verifies clear space in flat and convex mirrors before merging',
      'Does not force right-of-way or make aggressive lane cut-ins',
    ],
  },

  // 6. Turning & Off-Tracking Management
  {
    id: 'rti-turning-offtracking',
    category: 'TURNING_AND_OFFTRACKING',
    categoryName: '6. Turning Maneuvers & Trailer Off-Tracking',
    name: 'Right & Left Turns, Buttonhook Technique & Curb Clearance',
    statutoryCfr: '49 CFR § 391.31(c)(6)',
    description: 'Proper execution of right turns using buttonhook technique to prevent trailer off-tracking over curbs or striking street furniture; wide left turns keeping trailer clear of opposing turn lanes.',
    pointsMax: 10,
    isMandatoryFmcsa: true,
    isCriticalDisqualifier: true, // CRITICAL: Mounting curb heavily or striking pedestrian/pole is an immediate safety disqualification
    suggestedCriteria: [
      'Does not swing wide to the left too early inviting vehicles to pass on the right',
      'Keeps rear trailer wheels clear of curbs, signs, utility poles, and fire hydrants',
      'Checks right convex mirror continuously throughout entire right turn',
      'Completes left turns without encroaching into oncoming lanes at intersections',
    ],
  },

  // 7. Braking, Stopping Distance & Speed Management
  {
    id: 'rti-braking-speed',
    category: 'BRAKING_AND_STOPPING',
    categoryName: '7. Braking, Following Distance & Speed Control',
    name: 'Progressive Service Braking & 6-7 Second Following Space',
    statutoryCfr: '49 CFR § 391.31(c)(7)',
    description: 'Demonstrates smooth progressive brake application without abrupt wheel lock, adjusts speed for weather/curves/grades, maintains statutory 1 second per 10 feet of vehicle length following space.',
    pointsMax: 10,
    isMandatoryFmcsa: true,
    isCriticalDisqualifier: true, // CRITICAL: Tailgating or running red light/stop sign is immediate disqualification
    suggestedCriteria: [
      'Maintains minimum 6-7 seconds following distance at 60 MPH under normal conditions',
      'Brakes smoothly without throwing cab weight forward or locking drive axles',
      'Slows down appropriately before entering highway off-ramps and curves',
      'Comes to a complete stop behind stop lines and crosswalks',
    ],
  },

  // 8. Clearance & Overhead Obstacles
  {
    id: 'rti-clearance-overhead',
    category: 'CLEARANCE_AND_OVERHEAD',
    categoryName: '8. Overhead Clearance & Bridge Awareness',
    name: 'Bridge Clearance Height Verification & Overhead Hazards',
    statutoryCfr: '49 CFR § 391.31(c)(8)',
    description: 'Continuously scans posted overhead bridge clearances, verifies truck height (13\'6" / 14\'), anticipates low-hanging utility wires and tree branches, navigates weigh stations and toll lanes safely.',
    pointsMax: 8,
    isMandatoryFmcsa: true,
    isCriticalDisqualifier: true, // CRITICAL: Failure to heed bridge height sign or approaching low structure is an automatic failure
    suggestedCriteria: [
      'Knows exact height of tractor-trailer rig before departure',
      'Actively calls out overhead clearance signs to trainer during test',
      'Maintains lane position to avoid low tree branches on right shoulder',
      'Approaches weigh station scale lane at prescribed regulatory speed (3-5 MPH)',
    ],
  },

  // 9. Railroad Highway Crossings
  {
    id: 'rti-railroad-crossings',
    category: 'RAILROAD_CROSSINGS',
    categoryName: '9. Railroad Highway Crossings',
    name: 'Railroad Crossing Safety Protocol & Hazardous Caution',
    statutoryCfr: '49 CFR § 391.31(c)(9) & § 392.10',
    description: 'Approaches tracks prepared to stop, activates 4-way flashers, rolls down window, mutes radio, scans tracks both ways, avoids shifting gears while crossing railroad tracks.',
    pointsMax: 8,
    isMandatoryFmcsa: true,
    isCriticalDisqualifier: true, // CRITICAL: Failure to yield or stopping on railroad tracks is an automatic failure
    suggestedCriteria: [
      'Slows down and activates 4-way hazard flashers well before tracks',
      'Silences audio/radio and rolls down driver window to listen for train horns',
      'Looks and listens in both directions along railroad right-of-way',
      'Does not shift gears or stop while vehicle is traversing the tracks',
    ],
  },

  // 10. Backing & Maneuvering
  {
    id: 'rti-backing-docking',
    category: 'BACKING_AND_DOCKING',
    categoryName: '10. Backing Maneuvers & Yard Docking',
    name: 'Straight-Line, 90° Alley Dock, Offset Backing & G.O.A.L.',
    statutoryCfr: '49 CFR § 391.31(c)(10)',
    description: 'Executes straight line backing (100 ft), 90-degree alley dock into simulated dock, offset backing; utilizes G.O.A.L. (Get Out And Look), sounds horn prior to movement, controls pivot point.',
    pointsMax: 12,
    isMandatoryFmcsa: true,
    isCriticalDisqualifier: true, // CRITICAL: Striking stationary dock, bollard, or vehicle while backing is an immediate failure
    suggestedCriteria: [
      'Sounds horn twice before initiating reverse motion and activates hazard flashers',
      'Executes G.O.A.L. (Get Out And Look) when view is obstructed or approaching dock limit',
      'Steers in the direction opposite to where trailer rear should move with small inputs',
      'Finishes within designated boundary cones without exceeding allowable pull-ups',
    ],
  },

  // 11. Post-Trip Inspection & Securing
  {
    id: 'rti-posttrip-securing',
    category: 'POST_TRIP_AND_SECURING',
    categoryName: '11. Post-Trip Inspection & Vehicle Securing',
    name: 'Parking Brakes, Engine Cool-Down & Post-Trip DVIR',
    statutoryCfr: '49 CFR § 391.31(c)(11) & § 396.11',
    description: 'Sets tractor and trailer parking brakes in correct sequence, places transmission in neutral/low gear, permits 3-5 minute turbocharger cool-down, conducts post-trip walkaround sweep, logs any defects.',
    pointsMax: 6,
    isMandatoryFmcsa: true,
    isCriticalDisqualifier: false,
    suggestedCriteria: [
      'Sets tractor and trailer parking brake valves securely',
      'Allows diesel engine to idle 3 minutes to cool turbo bearings before shutdown',
      'Conducts walk-around inspection checking for hot wheel hubs, air leaks, or tire wear',
      'Accurately completes post-trip driver vehicle inspection report (DVIR)',
    ],
  },
];

// =====================================================================
// === 5 PRE-LOADED ROAD TEST TEMPLATES FOR FLEET TRAINERS ===
// =====================================================================

export const PRELOADED_ROAD_TEST_TEMPLATES: RoadTestTemplate[] = [
  {
    id: 'tpl-fmcsa-std-391',
    title: 'FMCSA 49 CFR § 391.31 Standard Road Test',
    subtitle: 'Federal Statutory Motor Carrier Compliance Evaluation',
    targetVehicleType: 'Commercial Motor Vehicle (Class A / Class B Any CMV)',
    description: 'The standard statutory commercial driver evaluation covering all 11 federally mandated performance criteria. Generates official Form 391.31 Certificate for driver qualification file.',
    passingScorePercent: 80,
    totalItems: FMCSA_STATUTORY_ROAD_TEST_ITEMS.length,
    items: FMCSA_STATUTORY_ROAD_TEST_ITEMS,
  },
  {
    id: 'tpl-class-a-tractor-trailer',
    title: 'Class A Combination Tractor-Trailer (53ft Van/Reefer)',
    subtitle: 'Heavy Highway Long-Haul & Regional Freight Evaluation',
    targetVehicleType: 'Class A Tractor-Trailer Combination (Gross Combination Weight >= 26,001 lbs)',
    description: 'Specialized for Class A combination rigs. Rigorous scrutiny on 5th wheel kingpin locking, 4-point air brake test, wide buttonhook turning off-tracking, and 90-degree alley docking.',
    passingScorePercent: 82,
    totalItems: FMCSA_STATUTORY_ROAD_TEST_ITEMS.length,
    items: FMCSA_STATUTORY_ROAD_TEST_ITEMS,
  },
  {
    id: 'tpl-class-b-straight-truck',
    title: 'Class B Heavy Straight Truck / Dump / Concrete',
    subtitle: 'Single Unit Commercial Vehicle Evaluation',
    targetVehicleType: 'Class B Straight Truck (GVWR >= 26,001 lbs, Towing < 10,000 lbs)',
    description: 'Tailored for heavy dump trucks, cement mixers, and local delivery straight trucks. Focuses on urban tail swing, tight alleyway clearance, stopping distances, and loading zone securing.',
    passingScorePercent: 80,
    totalItems: FMCSA_STATUTORY_ROAD_TEST_ITEMS.filter((i) => i.category !== 'COUPLING_UNCOUPLING').length,
    items: FMCSA_STATUTORY_ROAD_TEST_ITEMS.filter((i) => i.category !== 'COUPLING_UNCOUPLING'),
  },
  {
    id: 'tpl-tanker-hazmat',
    title: 'Bulk Liquid Tanker & Hazardous Materials Evaluation',
    subtitle: 'Surge Dynamics, High Center of Gravity & HazMat Endorsement',
    targetVehicleType: 'Class A MC-306/406 or MC-307/407 Liquid Bulk Tanker',
    description: 'Evaluates advanced liquid surge braking dynamics, baffle vs unbaffled tank surge control, rollover prevention on entrance ramps, HazMat placard verification, and emergency discharge valves.',
    passingScorePercent: 85,
    totalItems: FMCSA_STATUTORY_ROAD_TEST_ITEMS.length,
    items: FMCSA_STATUTORY_ROAD_TEST_ITEMS,
  },
  {
    id: 'tpl-annual-safety-refresher',
    title: 'Annual Driver Safety Check-Ride & Refresher Review',
    subtitle: 'Ongoing Carrier Risk Mitigation & Insurance Audit',
    targetVehicleType: 'Active Fleet Drivers (Periodic 12-Month Check)',
    description: 'Designed for existing fleet drivers undergoing annual review (49 CFR § 391.25) or post-incident remedial evaluation. Emphasizes space management, defensive driving, and in-cab distraction elimination.',
    passingScorePercent: 85,
    totalItems: FMCSA_STATUTORY_ROAD_TEST_ITEMS.length,
    items: FMCSA_STATUTORY_ROAD_TEST_ITEMS,
  },
];

// =====================================================================
// === INITIAL SEED ROAD TEST EVALUATION RECORDS ===
// =====================================================================

export const INITIAL_ROAD_TEST_RECORDS: RoadTestRecord[] = [
  {
    id: 'rt-202609-001',
    testDate: 'Sep 22, 2026',
    testStartTime: '08:30 EDT',
    testEndTime: '10:45 EDT',
    templateId: 'tpl-class-a-tractor-trailer',
    templateTitle: 'Class A Combination Tractor-Trailer (53ft Van/Reefer)',
    driverCandidateName: 'Darnell Washington',
    driverCandidateCdl: 'PA-CDLA-8839219',
    driverCandidateState: 'PA',
    driverCandidatePhone: '(215) 555-0194',
    driverCandidateEmail: 'dwashington.cdl@gmail.com',
    yearsExperience: 4,
    evaluatorTrainerName: 'Marcus Bell',
    evaluatorTrainerTitle: 'Senior Fleet Safety Evaluator & Master Trainer',
    evaluatorTrainerCdl: 'IL-CDLA-49102-IL',
    evaluatorCompany: 'Truckwithease Fleet Logistics Corp',
    powerUnitNumber: 'UNIT #104-E',
    powerUnitMakeModel: '2024 Freightliner Cascadia DD15 (Detroit DT12)',
    trailerNumber: 'TRL-5390',
    trailerType: '53ft Utility 3000R Refrigerated Van',
    transmissionType: 'AUTOMATED_MANUAL',
    grossVehicleWeightRating: '80,000 lbs Max Gross',
    routeDescription: 'Yard staging at Harrisburg Terminal -> I-81 North to Exit 77 -> US-22 West through commercial district with 4 tight right turns -> Industrial park 90-degree alley dock -> Return via highway.',
    weatherConditions: 'CLEAR_DRY',
    mileageCovered: 32.5,
    scores: {
      'rti-pretrip-airbrake': { itemId: 'rti-pretrip-airbrake', pointsEarned: 10, status: 'PASS', trainerNote: 'Flawless 4-point air test. Verbalized all cut-out and low warning thresholds accurately.' },
      'rti-pretrip-walkaround': { itemId: 'rti-pretrip-walkaround', pointsEarned: 10, status: 'PASS', trainerNote: 'Systematic walkaround. Checked steer tire tread depth and extinguisher inspection tag.' },
      'rti-coupling-5thwheel': { itemId: 'rti-coupling-5thwheel', pointsEarned: 10, status: 'PASS', trainerNote: 'Excellent flashlight visual on kingpin jaws. Positive tug test in low gear.' },
      'rti-coupling-airlines': { itemId: 'rti-coupling-airlines', pointsEarned: 8, status: 'PASS', trainerNote: 'Glad hands clean, electrical cable locked securely, landing gear crank stowed properly.' },
      'rti-startup-gauges': { itemId: 'rti-startup-gauges', pointsEarned: 8, status: 'PASS', trainerNote: 'Confirmed oil pressure rise within 8 seconds. ABS light cycled clean.' },
      'rti-controls-shifting': { itemId: 'rti-controls-shifting', pointsEarned: 9, status: 'PASS', trainerNote: 'Smooth throttle application. Two hands at 9-and-3 positions.' },
      'rti-traffic-mirrors': { itemId: 'rti-traffic-mirrors', pointsEarned: 9, status: 'PASS', trainerNote: 'Consistent 5-6 second mirror scanning cadence.' },
      'rti-traffic-lane-control': { itemId: 'rti-traffic-lane-control', pointsEarned: 9, status: 'PASS', trainerNote: 'Clean lane centering. Early 200ft turn signaling on highway merge.' },
      'rti-turning-offtracking': { itemId: 'rti-turning-offtracking', pointsEarned: 9, status: 'PASS', trainerNote: 'Buttonhooked right turn at US-22 neatly without touching curb or encroaching oncoming lanes.' },
      'rti-braking-speed': { itemId: 'rti-braking-speed', pointsEarned: 10, status: 'PASS', trainerNote: 'Kept excellent 7-second buffer behind lead tanker. Smooth progressive braking.' },
      'rti-clearance-overhead': { itemId: 'rti-clearance-overhead', pointsEarned: 8, status: 'PASS', trainerNote: 'Pointed out 14\'2" railroad bridge clearance placard in advance.' },
      'rti-railroad-crossings': { itemId: 'rti-railroad-crossings', pointsEarned: 8, status: 'PASS', trainerNote: '4-way flashers on, radio muted, window down, stopped before tracks smoothly.' },
      'rti-backing-docking': { itemId: 'rti-backing-docking', pointsEarned: 11, status: 'PASS', trainerNote: '90-degree alley dock executed with 1 pull-up and G.O.A.L. check. Stopped 6 inches from dock bumpers.' },
      'rti-posttrip-securing': { itemId: 'rti-posttrip-securing', pointsEarned: 6, status: 'PASS', trainerNote: 'Allowed 3-min turbo idle cool-down before key off. Set parking brakes correctly.' },
    },
    totalEarnedPoints: 116,
    totalPossiblePoints: 120,
    scorePercentage: 96.6,
    hasCriticalFailure: false,
    overallResult: 'SATISFACTORY_PASS',
    trainerFeedback: {
      safetyAndAwarenessCritique: 'Candidate exhibited exceptional defensive situational awareness. Mirror scans were steady, traffic merges were decisive and respectful, and hazard flashers were utilized proactively at railroad crossings.',
      vehicleControlAndShiftingCritique: 'Very comfortable with the automated transmission controls and secondary Jake brake toggle. Throttle input on off-ramps was gentle and predictable.',
      backingAndManeuveringCritique: 'Docking maneuver was controlled. Did not rush the 90-degree alley dock; sounded horn, exited cab to verify clearance (G.O.A.L.), and placed the trailer squarely between dock lines.',
      clearanceAndSpatialJudgementCritique: 'Consistently aware of 13\'6" trailer height, bridge postings, and trailer swing during tight urban right-hand turns.',
      overallTrainerRecommendation: 'Fully recommended for active interstate dispatch. Highly qualified commercial driver meeting and exceeding all requirements of 49 CFR § 391.31.',
    },
    certificateNumber: 'FMCSA-391-31-PA-2026-0922-DW',
    evaluatorSignature: 'Marcus Bell, Senior Fleet Trainer (Verified Signature)',
    evaluatorSignatureDate: '2026-09-22',
    driverCandidateSignature: 'Darnell Washington (Acknowledged)',
    driverCandidateSignatureDate: '2026-09-22',
    cryptographicSealHash: 'a8f4c2e176b90345d829140ff423e8ba761e93c52a0918742b781ce265893a90',
    isSavedToDqf: true,
  },
  {
    id: 'rt-202609-002',
    testDate: 'Sep 18, 2026',
    testStartTime: '13:00 EDT',
    testEndTime: '14:50 EDT',
    templateId: 'tpl-class-a-tractor-trailer',
    templateTitle: 'Class A Combination Tractor-Trailer (53ft Van/Reefer)',
    driverCandidateName: 'Carlos Ramirez',
    driverCandidateCdl: 'TX-CDLA-7719204',
    driverCandidateState: 'TX',
    driverCandidatePhone: '(214) 555-8392',
    driverCandidateEmail: 'cramirez.trucking@gmail.com',
    yearsExperience: 2,
    evaluatorTrainerName: 'Dave Miller',
    evaluatorTrainerTitle: 'Director of Fleet Safety & Compliance',
    evaluatorTrainerCdl: 'OH-CDLA-30918-OH',
    evaluatorCompany: 'Truckwithease Fleet Logistics Corp',
    powerUnitNumber: 'UNIT #108-A',
    powerUnitMakeModel: '2023 Kenworth T680 Next Gen (PACCAR MX-13)',
    trailerNumber: 'TRL-4421',
    trailerType: '53ft Great Dane Champion Dry Van',
    transmissionType: 'AUTOMATED_MANUAL',
    grossVehicleWeightRating: '80,000 lbs Max Gross',
    routeDescription: 'Harrisburg Terminal yard -> Route 39 South -> Downtown delivery corridor -> Industrial park backing pad -> Return.',
    weatherConditions: 'RAIN_WET',
    mileageCovered: 24.0,
    scores: {
      'rti-pretrip-airbrake': { itemId: 'rti-pretrip-airbrake', pointsEarned: 10, status: 'PASS', trainerNote: 'Passed all 4 air brake check steps.' },
      'rti-pretrip-walkaround': { itemId: 'rti-pretrip-walkaround', pointsEarned: 9, status: 'PASS', trainerNote: 'Good walkaround. Noted low windshield washer fluid.' },
      'rti-coupling-5thwheel': { itemId: 'rti-coupling-5thwheel', pointsEarned: 10, status: 'PASS', trainerNote: 'Confirmed jaw lock with flashlight.' },
      'rti-coupling-airlines': { itemId: 'rti-coupling-airlines', pointsEarned: 8, status: 'PASS', trainerNote: 'Airlines clear, landing gear fully elevated.' },
      'rti-startup-gauges': { itemId: 'rti-startup-gauges', pointsEarned: 8, status: 'PASS', trainerNote: 'Normal gauge response.' },
      'rti-controls-shifting': { itemId: 'rti-controls-shifting', pointsEarned: 8, status: 'PASS', trainerNote: 'Good vehicle control.' },
      'rti-traffic-mirrors': { itemId: 'rti-traffic-mirrors', pointsEarned: 7, status: 'NEEDS_WORK', trainerNote: 'Needs to check passenger side convex mirror more frequently on wet roadway.' },
      'rti-traffic-lane-control': { itemId: 'rti-traffic-lane-control', pointsEarned: 8, status: 'PASS', trainerNote: 'Proper lane centering.' },
      'rti-turning-offtracking': { itemId: 'rti-turning-offtracking', pointsEarned: 7, status: 'NEEDS_WORK', trainerNote: 'Slightly clipped rear trailer tire over curb apron on tight right turn onto Market St. No structural impact but needs deeper buttonhook.' },
      'rti-braking-speed': { itemId: 'rti-braking-speed', pointsEarned: 8, status: 'PASS', trainerNote: 'Adjusted speed appropriately for wet asphalt.' },
      'rti-clearance-overhead': { itemId: 'rti-clearance-overhead', pointsEarned: 8, status: 'PASS', trainerNote: 'Scanned bridge clearances.' },
      'rti-railroad-crossings': { itemId: 'rti-railroad-crossings', pointsEarned: 8, status: 'PASS', trainerNote: 'Complied with railroad crossing routine.' },
      'rti-backing-docking': { itemId: 'rti-backing-docking', pointsEarned: 8, status: 'NEEDS_WORK', trainerNote: 'Took 3 pull-ups during 90-degree dock. Recommended 1 more G.O.A.L. inspection before touching dock bumper.' },
      'rti-posttrip-securing': { itemId: 'rti-posttrip-securing', pointsEarned: 6, status: 'PASS', trainerNote: 'Secured vehicle properly.' },
    },
    totalEarnedPoints: 105,
    totalPossiblePoints: 120,
    scorePercentage: 87.5,
    hasCriticalFailure: false,
    overallResult: 'SATISFACTORY_PASS',
    trainerFeedback: {
      safetyAndAwarenessCritique: 'Solid foundational habits in wet weather. Needs slightly higher scanning cadence on the right blind-side mirror when pedestrian traffic is present.',
      vehicleControlAndShiftingCritique: 'Good modulation of service brakes in wet conditions. Handled anti-lock braking feel well.',
      backingAndManeuveringCritique: 'Backing is safe but needs practice on steering pivot point timing to reduce required pull-ups.',
      clearanceAndSpatialJudgementCritique: 'Right turn onto Market St required deeper square setup before cutting wheel to give trailer 53-ft tandems sufficient clearance from curb line.',
      overallTrainerRecommendation: 'Passed evaluation with 87.5%. Cleared for company operations with recommendation for companion check-ride on city route.',
    },
    certificateNumber: 'FMCSA-391-31-TX-2026-0918-CR',
    evaluatorSignature: 'Dave Miller, Safety Director (Verified Signature)',
    evaluatorSignatureDate: '2026-09-18',
    driverCandidateSignature: 'Carlos Ramirez (Acknowledged)',
    driverCandidateSignatureDate: '2026-09-18',
    cryptographicSealHash: '73c18b49e2501a3962d8f99e41b2c73910f543e8a91b2c45e87a90b341c29e01',
    isSavedToDqf: true,
  },
];

// =====================================================================
// === LOCAL STORAGE PERSISTENCE HELPERS ===
// =====================================================================

const ROAD_TESTS_STORAGE_KEY = 'truckwithease_road_test_records_v1';

export function getStoredRoadTestRecords(): RoadTestRecord[] {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return INITIAL_ROAD_TEST_RECORDS;
    }
    const raw = localStorage.getItem(ROAD_TESTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read stored road tests:', err);
  }
  return INITIAL_ROAD_TEST_RECORDS;
}

export function saveRoadTestRecord(record: RoadTestRecord): RoadTestRecord[] {
  const current = getStoredRoadTestRecords();
  const updated = [record, ...current.filter((r) => r.id !== record.id)];
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(ROAD_TESTS_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('Could not save road test record:', err);
  }
  return updated;
}

// Generate unique cryptographic SHA-256 simulation seal for DQF
export function generateDqfCryptographicSeal(certificateNumber: string, driverCdl: string): string {
  const seed = `${certificateNumber}:${driverCdl}:${Date.now()}:TRUCKWITHEASE-49CFR391.31`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const randomPart = Array.from({ length: 56 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `${hex}${randomPart}`;
}
