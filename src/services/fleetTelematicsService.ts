// ============================================================================
// FLEET TELEMATICS & DISPATCHER COMMAND SERVICE
// Provides real-time fleet synchronization, HOS monitoring, broker requirements,
// and truck/trailer tracking for Fleet Managers and Dispatchers.
// ============================================================================

export interface FleetRigHos {
  dutyStatus: 'DRIVING' | 'ON_DUTY' | 'SLEEPER' | 'OFF_DUTY';
  driveRemainingMinutes: number;
  driveRemainingFormatted: string; // e.g. '7h 42m / 11h'
  shiftRemainingMinutes: number;
  shiftRemainingFormatted: string; // e.g. '9h 40m / 14h'
  cycleRemainingHours: number;
  cycleRemainingFormatted: string; // e.g. '36h 20m / 70h'
  breakRequiredInFormatted: string; // e.g. '3h 18m'
  violationsCount: number;
}

export interface FleetRigBrokerInfo {
  brokerName: string;
  brokerRepName: string;
  brokerRepTitle: string;
  brokerPhone: string;
  brokerEmail: string;
  rateConNumber: string;
  bolNumber: string;
  rateUsd: number;
  ratePerMile: number;
  brokerSpecialInstructions: string;
  detentionPolicy: string;
}

export interface FleetTelematicsRig {
  id: string;
  truckNumber: string; // e.g. 'UNIT #104-E'
  truckModel: string;  // e.g. '2024 Freightliner Cascadia DD15'
  trailerNumber: string; // e.g. 'TRL-5390'
  trailerType: string;   // e.g. "53' Dry Van"
  driverName: string;
  driverPhone: string;
  driverCdl: string;
  driverAvatarColor: string;
  driverAvatarInitials: string;
  currentSpeedMph: number;
  speedStatus: 'CRUISE' | 'TRAFFIC' | 'DOCK' | 'STAGED' | 'IDLE';
  heading: string; // e.g. 'EB 084° (I-80 Corridor)'
  lat: number;
  lng: number;
  origin: string;
  destination: string;
  destinationZip: string;
  destinationFacility: string;
  milesRemaining: number;
  plannedTimePerBroker: string; // Broker/Customer Appointment Window
  plannedEta: string;          // Calculated Telematics ETA
  scheduleStatus: 'ON_SCHEDULE' | 'TIGHT_WINDOW' | 'AT_RISK' | 'AT_DOCK';
  scheduleBufferMinutes: number; // Positive = ahead of schedule
  customerRequirements: string; // Specific customer delivery directive
  hos: FleetRigHos;
  brokerInfo: FleetRigBrokerInfo;
  activeLoadId: string;
  cargo: string;
  heightFormatted: string;
  heightInches: number;
  lastPingTime: string;
  odometerMiles: number;
  fuelLevelPercent: number;
  defLevelPercent: number;
}

export const INITIAL_FLEET_RIGS: FleetTelematicsRig[] = [
  {
    id: 'rig-104',
    truckNumber: 'UNIT #104-E',
    truckModel: '2024 Freightliner Cascadia DD15',
    trailerNumber: 'TRL-5390',
    trailerType: "53' Dry Van (Air-Ride)",
    driverName: 'Marcus Kowalski',
    driverPhone: '(570) 555-0144',
    driverCdl: 'PA-CDL-9048123',
    driverAvatarColor: 'bg-emerald-600',
    driverAvatarInitials: 'MK',
    currentSpeedMph: 65,
    speedStatus: 'CRUISE',
    heading: 'EB 084° (I-80 Corridor)',
    lat: 41.135,
    lng: -77.72,
    origin: 'Allentown, PA',
    destination: 'Columbus, OH',
    destinationZip: '43228',
    destinationFacility: 'Midwest Logistics Center · 1400 Roberts Rd',
    milesRemaining: 184,
    plannedTimePerBroker: 'Sep 8, 14:00 - 17:00 EDT',
    plannedEta: 'Sep 8, 15:22 EDT',
    scheduleStatus: 'ON_SCHEDULE',
    scheduleBufferMinutes: 98,
    customerRequirements: 'Strict Dock Check-in (Doors 14-22). $150 late fee if past window. Paper BOL must be stamped.',
    hos: {
      dutyStatus: 'DRIVING',
      driveRemainingMinutes: 462,
      driveRemainingFormatted: '7h 42m / 11h',
      shiftRemainingMinutes: 580,
      shiftRemainingFormatted: '9h 40m / 14h',
      cycleRemainingHours: 36.3,
      cycleRemainingFormatted: '36h 20m / 70h',
      breakRequiredInFormatted: '3h 18m',
      violationsCount: 0,
    },
    brokerInfo: {
      brokerName: 'C.H. Robinson Worldwide',
      brokerRepName: 'Travis Miller',
      brokerRepTitle: 'Senior Logistics Rep',
      brokerPhone: '(800) 323-7587',
      brokerEmail: 'travis.miller@chrobinson.com',
      rateConNumber: 'RC-CHR-88419',
      bolNumber: 'BOL-CHR-992104',
      rateUsd: 2150,
      ratePerMile: 4.8,
      brokerSpecialInstructions: 'Low-clearance detour protection active via FHWA. Call 2 hrs prior to arrival. Lumper receipt must be signed for reimbursement.',
      detentionPolicy: '$75/hr after 2 hrs free time (GPS geofence timestamped)',
    },
    activeLoadId: 'load-8841',
    cargo: 'Industrial Automotive Parts / 41,800 lbs',
    heightFormatted: '13\' 6" (162")',
    heightInches: 162,
    lastPingTime: '12 sec ago · Live 5G Telematics',
    odometerMiles: 142850,
    fuelLevelPercent: 78,
    defLevelPercent: 88,
  },
  {
    id: 'rig-208',
    truckNumber: 'UNIT #208-T',
    truckModel: '2023 Kenworth T680 NextGen Cummins X15',
    trailerNumber: 'TRL-6112',
    trailerType: "53' Reefer w/ Thermo King S-600 (34°F Continuous)",
    driverName: 'Jason Henderson',
    driverPhone: '(216) 555-4481',
    driverCdl: 'OH-CDL-8839120',
    driverAvatarColor: 'bg-sky-600',
    driverAvatarInitials: 'JH',
    currentSpeedMph: 0,
    speedStatus: 'DOCK',
    heading: 'Docked (Bay #04)',
    lat: 40.82,
    lng: -81.25,
    origin: 'Canton, OH',
    destination: 'Chicago, IL',
    destinationZip: '60609',
    destinationFacility: 'Central Cold Storage Terminal · 4200 S Ashland Ave',
    milesRemaining: 362,
    plannedTimePerBroker: 'Sep 8, 08:00 - 11:00 CDT',
    plannedEta: 'Sep 8, 08:45 CDT',
    scheduleStatus: 'AT_DOCK',
    scheduleBufferMinutes: 135,
    customerRequirements: 'Continuous Pre-Cooling to 34°F Verified. Pulp temperature must be logged upon bills signing.',
    hos: {
      dutyStatus: 'ON_DUTY',
      driveRemainingMinutes: 495,
      driveRemainingFormatted: '8h 15m / 11h',
      shiftRemainingMinutes: 630,
      shiftRemainingFormatted: '10h 30m / 14h',
      cycleRemainingHours: 44.2,
      cycleRemainingFormatted: '44h 10m / 70h',
      breakRequiredInFormatted: 'Rest break satisfied at dock',
      violationsCount: 0,
    },
    brokerInfo: {
      brokerName: 'TQL (Total Quality Logistics)',
      brokerRepName: 'Brittany Hayes',
      brokerRepTitle: 'Produce & Reefer Specialist',
      brokerPhone: '(800) 580-3101',
      brokerEmail: 'bhayes@tql.com',
      rateConNumber: 'RC-TQL-44821',
      bolNumber: 'BOL-TQL-44821',
      rateUsd: 1850,
      ratePerMile: 5.11,
      brokerSpecialInstructions: 'Reefer must maintain 34°F ±2°F continuous. Driver must upload temp seal photo and BOL scan upon departure.',
      detentionPolicy: '$65/hr after 2 hrs free time (must alert broker at 1h 45m mark)',
    },
    activeLoadId: 'load-8842',
    cargo: 'Chilled Dairy & Artisan Cheese / 38,200 lbs',
    heightFormatted: '13\' 6" (162")',
    heightInches: 162,
    lastPingTime: '4 sec ago · Dock Geo-Beacon Active',
    odometerMiles: 188420,
    fuelLevelPercent: 62,
    defLevelPercent: 74,
  },
  {
    id: 'rig-312',
    truckNumber: 'UNIT #312-C',
    truckModel: '2022 Peterbilt 579 PACCAR MX-13',
    trailerNumber: 'TRL-9901',
    trailerType: "53' Heavy Flatbed w/ Headboard & Coil Racks",
    driverName: 'Devon Vance',
    driverPhone: '(317) 555-3120',
    driverCdl: 'IN-CDL-5520194',
    driverAvatarColor: 'bg-purple-600',
    driverAvatarInitials: 'DV',
    currentSpeedMph: 48,
    speedStatus: 'TRAFFIC',
    heading: 'NB 012° (I-94 Moderate Traffic)',
    lat: 41.86,
    lng: -87.52,
    origin: 'Gary, IN',
    destination: 'Detroit, MI',
    destinationZip: '48210',
    destinationFacility: 'Motor City Steel Processing · 8800 Dix Ave',
    milesRemaining: 210,
    plannedTimePerBroker: 'Sep 8, 16:30 - 19:00 EDT',
    plannedEta: 'Sep 8, 17:10 EDT',
    scheduleStatus: 'ON_SCHEDULE',
    scheduleBufferMinutes: 110,
    customerRequirements: 'Full Tarping Verified. Safety vest, steel-toe boots & hard hat mandatory inside mill yard.',
    hos: {
      dutyStatus: 'DRIVING',
      driveRemainingMinutes: 420,
      driveRemainingFormatted: '7h 00m / 11h',
      shiftRemainingMinutes: 525,
      shiftRemainingFormatted: '8h 45m / 14h',
      cycleRemainingHours: 28.8,
      cycleRemainingFormatted: '28h 50m / 70h',
      breakRequiredInFormatted: 'Completed 42m ago',
      violationsCount: 0,
    },
    brokerInfo: {
      brokerName: 'Echo Global Logistics',
      brokerRepName: 'Derek Stone',
      brokerRepTitle: 'Heavy Haul Coordinator',
      brokerPhone: '(800) 354-7993',
      brokerEmail: 'derek.stone@echo.com',
      rateConNumber: 'RC-ECH-10492',
      bolNumber: 'BOL-ECH-10492',
      rateUsd: 1420,
      ratePerMile: 5.59,
      brokerSpecialInstructions: '4-point coil rack and 3/8" Grade 70 transport chains required. Scale ticket before check-in.',
      detentionPolicy: '$85/hr after 2 hrs free time',
    },
    activeLoadId: 'load-8843',
    cargo: 'Structural Steel Coils / 44,100 lbs',
    heightFormatted: '13\' 4" (160")',
    heightInches: 160,
    lastPingTime: '9 sec ago · Live 5G Telematics',
    odometerMiles: 234100,
    fuelLevelPercent: 54,
    defLevelPercent: 65,
  },
  {
    id: 'rig-719',
    truckNumber: 'UNIT #719-K',
    truckModel: '2024 Kenworth T680 Cummins X15',
    trailerNumber: 'TRL-4810',
    trailerType: "53' Dry Van (High-Cube)",
    driverName: 'Sarah Jenkins',
    driverPhone: '(614) 555-7740',
    driverCdl: 'OH-CDL-2291048',
    driverAvatarColor: 'bg-amber-600',
    driverAvatarInitials: 'SJ',
    currentSpeedMph: 62,
    speedStatus: 'CRUISE',
    heading: 'WB 274° (I-70 Corridor)',
    lat: 40.27,
    lng: -76.88,
    origin: 'Harrisburg, PA',
    destination: 'Indianapolis, IN',
    destinationZip: '46241',
    destinationFacility: 'FedEx Ground Hub · 7600 S High School Rd',
    milesRemaining: 395,
    plannedTimePerBroker: 'Sep 9, 05:00 - 08:00 EDT',
    plannedEta: 'Sep 9, 06:15 EDT',
    scheduleStatus: 'ON_SCHEDULE',
    scheduleBufferMinutes: 105,
    customerRequirements: 'Strict Drop & Hook Appointment. Driver must present Fast-Pass barcode at security gate.',
    hos: {
      dutyStatus: 'DRIVING',
      driveRemainingMinutes: 630,
      driveRemainingFormatted: '10h 30m / 11h',
      shiftRemainingMinutes: 795,
      shiftRemainingFormatted: '13h 15m / 14h',
      cycleRemainingHours: 52.0,
      cycleRemainingFormatted: '52h 00m / 70h',
      breakRequiredInFormatted: 'Required in 4h 00m',
      violationsCount: 0,
    },
    brokerInfo: {
      brokerName: 'Landstar System',
      brokerRepName: 'Karen Miller',
      brokerRepTitle: 'National Accounts Dispatch',
      brokerPhone: '(800) 872-9400',
      brokerEmail: 'dispatch@landstar.com',
      rateConNumber: 'RC-LND-99201',
      bolNumber: 'BOL-LND-99201',
      rateUsd: 2450,
      ratePerMile: 4.65,
      brokerSpecialInstructions: 'Strict seal verification. Notify dispatcher immediately if routing exceeds ±15 miles corridor boundary.',
      detentionPolicy: '$70/hr after 2 hrs free time',
    },
    activeLoadId: 'load-8840',
    cargo: 'Consumer Electronics & Displays / 32,000 lbs',
    heightFormatted: '13\' 6" (162")',
    heightInches: 162,
    lastPingTime: '15 sec ago · Live 5G Telematics',
    odometerMiles: 92450,
    fuelLevelPercent: 82,
    defLevelPercent: 90,
  },
  {
    id: 'rig-904',
    truckNumber: 'UNIT #904-R',
    truckModel: '2025 Peterbilt 579 UltraLoft (Relay Unit)',
    trailerNumber: 'TRL-8820',
    trailerType: "53' Dry Van (Composite Wall)",
    driverName: 'Vance Reynolds',
    driverPhone: '(312) 555-8821',
    driverCdl: 'IL-CDL-4910291',
    driverAvatarColor: 'bg-emerald-600',
    driverAvatarInitials: 'VR',
    currentSpeedMph: 0,
    speedStatus: 'STAGED',
    heading: 'Staged (Relay Bay #2)',
    lat: 40.00,
    lng: -78.23,
    origin: 'Breezewood Relay Hub, PA',
    destination: 'Midway Relay / Chicago Corridor',
    destinationZip: '15533',
    destinationFacility: 'Breezewood Super-Relay Center · Exit 161 off I-76',
    milesRemaining: 0,
    plannedTimePerBroker: 'On-Demand Relay Backup (24/7 Staged)',
    plannedEta: 'Standing By (100% Clock Available)',
    scheduleStatus: 'ON_SCHEDULE',
    scheduleBufferMinutes: 300,
    customerRequirements: 'FMCSA § 390.31 Electronic Chain of Custody & Slip-Seat Inspection required upon load handover.',
    hos: {
      dutyStatus: 'ON_DUTY',
      driveRemainingMinutes: 580,
      driveRemainingFormatted: '9h 40m / 11h',
      shiftRemainingMinutes: 680,
      shiftRemainingFormatted: '11h 20m / 14h',
      cycleRemainingHours: 61.5,
      cycleRemainingFormatted: '61h 30m / 70h',
      breakRequiredInFormatted: 'Fresh Clock / Ready',
      violationsCount: 0,
    },
    brokerInfo: {
      brokerName: 'TruckWithEase Relay Network',
      brokerRepName: 'Central Relay Dispatch',
      brokerRepTitle: 'Fleet Operations Lead',
      brokerPhone: '(800) 555-EASE',
      brokerEmail: 'dispatch@truckwithease.internal',
      rateConNumber: 'RELAY-HO-8841',
      bolNumber: 'BOL-RELAY-904',
      rateUsd: 1200,
      ratePerMile: 4.95,
      brokerSpecialInstructions: 'Ready for immediate drop-and-hook or slip-seat relief on I-76/I-70 corridors.',
      detentionPolicy: 'Internal Relay SLA ($0 detention)',
    },
    activeLoadId: 'load-8841',
    cargo: 'Staged for Relief / Hotshot Relay',
    heightFormatted: '13\' 6" (162")',
    heightInches: 162,
    lastPingTime: '2 sec ago · Geo-Staged at Breezewood Hub',
    odometerMiles: 64200,
    fuelLevelPercent: 95,
    defLevelPercent: 96,
  },
];

export const getStoredFleetRigs = (): FleetTelematicsRig[] => {
  if (typeof window === 'undefined') return INITIAL_FLEET_RIGS;
  try {
    const raw = localStorage.getItem('truckwithease_fleet_rigs_v2');
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Could not read fleet rigs from localStorage:', err);
  }
  return INITIAL_FLEET_RIGS;
};

export const saveFleetRigs = (rigs: FleetTelematicsRig[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('truckwithease_fleet_rigs_v2', JSON.stringify(rigs));
  } catch (err) {
    console.warn('Could not save fleet rigs to localStorage:', err);
  }
};
