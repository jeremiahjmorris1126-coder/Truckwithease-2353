import {
  DvirInspection,
  DvirDefectItem,
  DvirPhotoAttachment,
  PriorDayDvirMemory,
  RoadsideAssistanceProvider,
  BreakdownIncidentTicket,
} from '../types';

// =====================================================================
// === NATIONWIDE 24/7 ROADSIDE ASSISTANCE DIRECTORY (INDEXED WEB) ===
// =====================================================================

export const INDEXED_ROADSIDE_PROVIDERS: RoadsideAssistanceProvider[] = [
  {
    id: 'prov-fleetnet',
    name: 'FleetNet America / ArcBest Truck Rescue',
    category: 'NATIONWIDE_HEAVY_REPAIR',
    tollFreePhone: '1-800-438-8961',
    directDial: 'tel:18004388961',
    contactName: 'Operations Command Center',
    coverage: 'All 50 US States & Canada (Over 60,000 Vendor Locations)',
    averageEtaMinutes: 45,
    webPortalUrl: 'https://fleetnetamerica.com',
    servicesOffered: [
      'Heavy-Duty Mechanical Repair',
      'Class 8 Towing & Wrecker Recovery',
      'Mobile Tire Replacement & Repair',
      'Air Brake System Diagnostics & Leaks',
      'DEF / Aftertreatment System De-rate Solutions',
      'Jump Starts & Electrical System Repair',
    ],
    notes: 'Primary fleet roadside manager. Direct API dispatch enabled with real-time GPS technician tracking.',
    isPreferredFleetVendor: true,
  },
  {
    id: 'prov-loves',
    name: "Love's Truck Care & Speedco 24/7 On-Highway",
    category: 'NATIONWIDE_HEAVY_REPAIR',
    tollFreePhone: '1-800-687-5683',
    directDial: 'tel:18006875683',
    contactName: 'National Dispatch & Tire Desk',
    coverage: '430+ Travel Stops & Over 1,000 Mobile Service Units Nationwide',
    averageEtaMinutes: 40,
    webPortalUrl: 'https://loves.com/truckcare',
    servicesOffered: [
      '24/7 Mobile Tire Service & Balancing',
      'Wheel End, Hub Seals & Bearing Repair',
      'Brake Chamber & Slack Adjuster Replacement',
      'Air Governor & Compressor Line Repair',
      'Fuel Delivery & Anti-Gel Treatment',
      'DOT Roadside Safety Inspections',
    ],
    notes: 'Guaranteed 60-minute or less arrival along major interstate freight corridors (I-80, I-90, I-40, I-70, I-10, I-35).',
    isPreferredFleetVendor: true,
  },
  {
    id: 'prov-ta-roadsquad',
    name: 'TA Truck Service RoadSquad Emergency 24/7',
    category: 'NATIONWIDE_HEAVY_REPAIR',
    tollFreePhone: '1-800-824-7623',
    directDial: 'tel:18008247623',
    contactName: 'RoadSquad Central Operations',
    coverage: 'Nationwide Network (Over 3,000 Certified Technicians)',
    averageEtaMinutes: 50,
    webPortalUrl: 'https://ta-petro.com/truck-service/roadsquad',
    servicesOffered: [
      'Comprehensive Mobile Mechanical Rescue',
      'Computerized Engine Diagnostics & Forced Regens',
      'Coolant Leak & Radiator Hose Repair',
      'Alternator & Starter Replacements',
      'Fifth Wheel & Landing Gear Field Welding',
      'Emergency Tire Mounting & Replacement',
    ],
    notes: 'ASE-certified roadside mechanics. Priority dispatch agreement with direct fleet billing.',
    isPreferredFleetVendor: true,
  },
  {
    id: 'prov-goodyear-fleethq',
    name: 'Goodyear Commercial FleetHQ 24/7 Emergency',
    category: 'TIRE_NETWORK',
    tollFreePhone: '1-866-353-3847',
    directDial: 'tel:18663533847',
    contactName: 'FleetHQ 24/7 Rapid Response',
    coverage: 'Nationwide & Cross-Border North America (2,200+ Service Centers)',
    averageEtaMinutes: 42,
    webPortalUrl: 'https://goodyeartrucktires.com/fleethq',
    servicesOffered: [
      'Emergency Commercial Steer, Drive & Trailer Tires',
      'Rapid Wheel Torque & Hub Check',
      'Tire Pressure Monitoring (TPMS) Calibration',
      'Custom Fleet Tread Spec Matching (Fuel Max / Endurance)',
      'Scrap Tire Analysis & Credit Processing',
    ],
    notes: 'Industry-leading 2-hour roll-time guarantee on highway tire breakdowns.',
    isPreferredFleetVendor: false,
  },
  {
    id: 'prov-bridgestone-bern',
    name: 'Bridgestone Emergency Response Network (BERN)',
    category: 'TIRE_NETWORK',
    tollFreePhone: '1-800-560-0099',
    directDial: 'tel:18005600099',
    contactName: 'BERN Operations Control',
    coverage: '3,000+ Authorized Commercial Dealers Across USA & Canada',
    averageEtaMinutes: 48,
    webPortalUrl: 'https://commercial.bridgestone.com',
    servicesOffered: [
      'Commercial Class 8 Truck Tires & Bandag Retreads',
      '24/7 Roadside Tire Replacement & Patching',
      'Rim & Wheel Flange Inspection',
      'Mounted Wheel Assembly Deliveries',
    ],
    notes: 'Comprehensive National Account pricing honored with zero out-of-pocket driver cash requirements.',
    isPreferredFleetVendor: false,
  },
  {
    id: 'prov-michelin-oncall',
    name: 'Michelin ONCall 24/7 Emergency Road Service',
    category: 'TIRE_NETWORK',
    tollFreePhone: '1-800-847-3911',
    directDial: 'tel:18008473911',
    contactName: 'Michelin ONCall Dispatch',
    coverage: 'Over 2,500 Mobile Service Providers Nationwide',
    averageEtaMinutes: 45,
    webPortalUrl: 'https://michelintruck.com/services/oncall',
    servicesOffered: [
      'Emergency Roadside Tire Deliveries & Replacement',
      'Full Mechanical Triage & Air System Repairs',
      'Driver Lockout & Key Replacement',
      'Emergency Fuel Delivery & Prime',
      'Light Mechanical & Electrical Troubleshooting',
    ],
    notes: 'Dial 1-800-TIRE-911 for instant live GPS dispatcher connection.',
    isPreferredFleetVendor: false,
  },
  {
    id: 'prov-daimler-ftl',
    name: 'Freightliner & Western Star 24/7 On-Highway Support',
    category: 'OEM_ENGINE',
    tollFreePhone: '1-800-385-4357',
    directDial: 'tel:18003854357',
    contactName: 'Daimler Truck North America Customer Center',
    coverage: 'USA & Canada Factory Certified Service Network',
    averageEtaMinutes: 55,
    webPortalUrl: 'https://freightliner.com/service-centers',
    servicesOffered: [
      'Detroit Diesel (DD13, DD15, DD16) Engine Diagnostics',
      'Detroit DT12 Automated Transmission Triage',
      'Factory ECM Flash & Sensor Calibration',
      'Assurance 5.0 Collision Radar & Safety System Diagnostic',
      'Authorized Warranty Towing & Dealer Dispatch',
    ],
    notes: 'OEM direct engineering support. Dial 1-800-FTL-HELP.',
    isPreferredFleetVendor: true,
  },
  {
    id: 'prov-cummins-care',
    name: 'Cummins Care 24/7 Heavy-Duty Support',
    category: 'OEM_ENGINE',
    tollFreePhone: '1-800-286-6467',
    directDial: 'tel:18002866467',
    contactName: 'Cummins Care Engineering Center',
    coverage: 'Worldwide / Nationwide Network of 3,700 Authorized Locations',
    averageEtaMinutes: 50,
    webPortalUrl: 'https://cummins.com/support/cummins-care',
    servicesOffered: [
      'Cummins X15 & ISX Diesel Engine Diagnostics',
      'DEF Header, Dosers & SCR Catalyst Fault Triage',
      'Turbocharger & Variable Geometry (VGT) Repair',
      'Fuel Rail & High-Pressure Injection Repair',
      'Over-the-Air (OTA) Calibration Updates',
    ],
    notes: 'Direct factory hotline: 1-800-CUMMINS. Diagnostic support available 24/7/365.',
    isPreferredFleetVendor: false,
  },
  {
    id: 'prov-thermo-king',
    name: 'Thermo King 24/7 Mobile Reefer Emergency',
    category: 'REEFER_COOLING',
    tollFreePhone: '1-888-887-2546',
    directDial: 'tel:18888872546',
    contactName: 'Thermo King Road Assist Central',
    coverage: '200+ Factory Dealer Locations with Mobile Reefer Trucks',
    averageEtaMinutes: 45,
    webPortalUrl: 'https://thermoking.com',
    servicesOffered: [
      'Emergency Refrigeration Unit Diagnostic (Precedent / Super II)',
      'Temp Sentry Sensor & Microprocessor Board Repair',
      'Reefer Diesel Engine Alternator, Belts & Fuel Lines',
      'Refrigerant Leak Detection & Re-charging (R404A / R452A)',
      'Cargo Temperature Protection & Temp Log Extraction',
    ],
    notes: 'Essential for high-value food, pharmaceutical & frozen reefer loads. Prevents cargo temperature claims.',
    isPreferredFleetVendor: true,
  },
  {
    id: 'prov-carrier-transicold',
    name: 'Carrier Transicold Roadside Reefer Assist',
    category: 'REEFER_COOLING',
    tollFreePhone: '1-800-448-1660',
    directDial: 'tel:18004481660',
    contactName: 'Carrier Transicold 24/7 Care',
    coverage: 'Over 180 Authorized Reefer Centers Nationwide',
    averageEtaMinutes: 50,
    webPortalUrl: 'https://carrier.com/truck-trailer',
    servicesOffered: [
      'Vector & X4 Series Transport Refrigeration Repair',
      'APU (Auxiliary Power Unit) Roadside Diagnostics',
      'Electric Standby & Inverter Troubleshooting',
      'Reefer Battery & Starting System Replacement',
    ],
    notes: '24/7 phone assistance for critical temperature alarms (Alarms 18, 20, 36, 54, 107).',
    isPreferredFleetVendor: false,
  },
  {
    id: 'prov-heavy-towing',
    name: 'Big Rig Heavy Towing & Rotator Recovery Network',
    category: 'TOWING_RECOVERY',
    tollFreePhone: '1-800-526-7879',
    directDial: 'tel:18005267879',
    contactName: 'Heavy Recovery Operations',
    coverage: 'Nationwide Heavy Duty Rotator & Lowboy Coverage',
    averageEtaMinutes: 45,
    webPortalUrl: 'https://towingrecoverynet.com',
    servicesOffered: [
      '50-Ton to 75-Ton Heavy Duty Rotator Recovery',
      'Under-reach Tractor & Trailer Towing (Zero Body Damage)',
      'Jackknife & Off-Road Winch-Out Rescue',
      'Trailer Swaps & Cargo Load Shifts / Deck Transfers',
      'Hazardous Spill Containment & Incident Management',
    ],
    notes: 'Pre-negotiated standardized tow rates per mile. FMCSA-compliant heavy recovery fleet.',
    isPreferredFleetVendor: true,
  },
  {
    id: 'prov-rush-trucks',
    name: 'Rush Truck Centers Mobile Fleet Care',
    category: 'NATIONWIDE_HEAVY_REPAIR',
    tollFreePhone: '1-855-787-4227',
    directDial: 'tel:18557874227',
    contactName: 'Rush Mobile Service Control',
    coverage: '140+ Dealerships Across 23 States with 500+ Mobile Service Rigs',
    averageEtaMinutes: 50,
    webPortalUrl: 'https://rushtruckcenters.com',
    servicesOffered: [
      'Mobile Fleet Preventative Maintenance',
      'Electronic Driveline & Axle Repair',
      'Heavy-Duty Air Conditioning & Heating Repair',
      'Wheel Alignment & Steering Gear Service',
      'Complete Hydraulic & Wet-Kit Repair',
    ],
    notes: 'Full mobile workshops equipped with air compressors, welders, and OEM diagnostic computers.',
    isPreferredFleetVendor: false,
  },
];

// =====================================================================
// === FMCSA 49 CFR § 396.11 STATUTORY INSPECTION ZONES ===
// =====================================================================

export interface DvirInspectionZone {
  id: string;
  zoneNumber: number;
  title: string;
  subtitle: string;
  fmcsaStatute: string;
  iconName: string;
  checkItems: {
    id: string;
    name: string;
    description: string;
    criticalOosRule: string;
    defaultPassed: boolean;
  }[];
}

export const FMCSA_INSPECTION_ZONES: DvirInspectionZone[] = [
  {
    id: 'zone-1-engine-steer',
    zoneNumber: 1,
    title: 'Engine Compartment & Steer Axle',
    subtitle: 'Fluids, Steering Linkage, Suspension & Steer Tires',
    fmcsaStatute: '49 CFR § 396.11 & § 393.209 (Steering & Suspension)',
    iconName: 'Wrench',
    checkItems: [
      {
        id: 'chk-1-1',
        name: 'Engine Fluid Levels (Oil, Coolant, Power Steering)',
        description: 'Check engine oil on dipstick between add/full. Coolant reservoir at sight glass. Power steering fluid level verified.',
        criticalOosRule: 'Severe fluid leaks posing engine seizure or steering loss.',
        defaultPassed: true,
      },
      {
        id: 'chk-1-2',
        name: 'Drive Belts & Hoses (Alternator, Water Pump, Fan Clutch)',
        description: 'Verify belts have no more than 1/2" to 3/4" play. No deep fraying, cracks, or loose tensioners. Hoses firm with no coolant leaks.',
        criticalOosRule: 'Missing or severely frayed drive belt causing overheating or alternator failure.',
        defaultPassed: true,
      },
      {
        id: 'chk-1-3',
        name: 'Steering Gear Box, Pitman Arm & Drag Link',
        description: 'Inspect steering column play (< 2" on 20" wheel). Check pitman arm, drag link, and tie rod ends for missing cotter pins or loose castle nuts.',
        criticalOosRule: 'Any loose or missing steering linkage hardware is an immediate Out-of-Service condition.',
        defaultPassed: true,
      },
      {
        id: 'chk-1-4',
        name: 'Front Leaf Springs, U-Bolts & Shock Absorbers',
        description: 'Check for cracked or missing leaf spring leaves (none shifted). U-bolts tight with no shiny metal. Shocks dry with no oil leaks.',
        criticalOosRule: '1/4 or more of leaf springs broken on any axle causes immediate Out-of-Service.',
        defaultPassed: true,
      },
      {
        id: 'chk-1-5',
        name: 'Steer Axle Brakes, Drums & Slack Adjusters',
        description: 'Brake chamber mounting secure. Pushrod stroke within legal limit (<= 1.75" on standard Type 24 chambers). Brake lining >= 1/4" thickness.',
        criticalOosRule: '20% or more of brake chambers out of adjustment triggers fleet Out-of-Service.',
        defaultPassed: true,
      },
      {
        id: 'chk-1-6',
        name: 'Steer Tires (Tread Depth >= 4/32", Wheels & Lug Nuts)',
        description: 'Steer tires must have at least 4/32" tread in every major groove. No recaps allowed on steer axle. Rim has no welds or cracks. Lug nuts tight with no rust streaks.',
        criticalOosRule: 'Steer tire tread < 2/32" or fabric/cords exposed is immediate Out-of-Service.',
        defaultPassed: true,
      },
    ],
  },
  {
    id: 'zone-2-cab-emergency',
    zoneNumber: 2,
    title: 'In-Cab Controls, Air System & Emergency Gear',
    subtitle: 'Air Brakes, Warning Buzzer, Gauges & Safety Items',
    fmcsaStatute: '49 CFR § 393.51 (Brake Warning) & § 393.95 (Emergency Equipment)',
    iconName: 'ShieldCheck',
    checkItems: [
      {
        id: 'chk-2-1',
        name: 'Air Brake Compressor Build Rate (85 to 100 PSI <= 45s)',
        description: 'Start engine at idle. Verify air pressure builds from 85 PSI to 100 PSI within 45 seconds. Governor cut-out between 120 and 140 PSI.',
        criticalOosRule: 'Air pressure unable to maintain 90 PSI at idle with brakes released.',
        defaultPassed: true,
      },
      {
        id: 'chk-2-2',
        name: 'Low Air Warning Buzzer & Visual Light Activation',
        description: 'Fan brake pedal down with engine off/key on. Low air warning buzzer and dash lamp must activate before pressure drops below 55 PSI (typically ~60 PSI).',
        criticalOosRule: 'Inoperative low air warning buzzer and indicator is an immediate violation.',
        defaultPassed: true,
      },
      {
        id: 'chk-2-3',
        name: 'Tractor & Trailer Emergency Valves (Tractor Protection)',
        description: 'Continue fanning brake pedal until trailer valve (red octagon) and tractor valve (yellow diamond) pop out between 20 and 45 PSI.',
        criticalOosRule: 'Emergency valves failing to close and isolate air system.',
        defaultPassed: true,
      },
      {
        id: 'chk-2-4',
        name: 'Windshield, Defroster, Wipers & Mirrors',
        description: 'Windshield glass free of cracks in wiper sweep area. Wiper blades supple with operational washer fluid. Defroster fan blows warm air across entire windshield.',
        criticalOosRule: 'Wipers inoperative during rain or severe cracks obstructing driver vision.',
        defaultPassed: true,
      },
      {
        id: 'chk-2-5',
        name: 'Fire Extinguisher, Emergency Triangles & Spare Fuses',
        description: 'UL-rated 10 B:C or two 5 B:C fire extinguishers fully charged with pin in place. 3 red bi-directional reflective triangles in storage box. Spare electrical fuses available.',
        criticalOosRule: 'Missing fire extinguisher or uncharged gauge results in roadside CSA points.',
        defaultPassed: true,
      },
    ],
  },
  {
    id: 'zone-3-coupling-drives',
    zoneNumber: 3,
    title: 'Coupling Devices & Tractor Drive Tandems',
    subtitle: '5th Wheel, Kingpin Jaws, Air Lines & Drive Tires',
    fmcsaStatute: '49 CFR § 393.70 (Coupling Devices) & § 393.75 (Tires)',
    iconName: 'Layers',
    checkItems: [
      {
        id: 'chk-3-1',
        name: 'Fifth Wheel Skid Plate & Kingpin Locking Jaws',
        description: 'Verify 5th wheel plate properly lubricated. Locking jaws completely closed and locked around the shank of the trailer kingpin. Release handle latched.',
        criticalOosRule: 'Unlatched 5th wheel release handle or visible gap between upper coupler and skid plate.',
        defaultPassed: true,
      },
      {
        id: 'chk-3-2',
        name: 'Sliding Fifth Wheel Locking Pins & Mounting Bracket',
        description: 'All sliding 5th wheel pins fully engaged in rail rack holes. No cracked brackets or missing crossmember mounting bolts.',
        criticalOosRule: 'Missing or retracted sliding pins allowing 5th wheel to shift.',
        defaultPassed: true,
      },
      {
        id: 'chk-3-3',
        name: 'Air Lines, Gladhands & 7-Way Electrical Cable',
        description: 'Service (blue) and Emergency (red) air lines suspended off catwalk by spring tender. Gladhands locked with supple rubber grommets (no hissing leaks). 7-way cable locked.',
        criticalOosRule: 'Air line rubbing on frame, cut to the fabric braid, or leaking audibly.',
        defaultPassed: true,
      },
      {
        id: 'chk-3-4',
        name: 'Drive Axle Tires (Tread Depth >= 2/32", Dual Spacing)',
        description: 'Drive tires have >= 2/32" tread depth. Dual wheels evenly spaced with no rocks/debris lodged between them. Inflation checked (100–110 PSI).',
        criticalOosRule: 'Flat tire or tire rubbing against suspension/chassis components.',
        defaultPassed: true,
      },
      {
        id: 'chk-3-5',
        name: 'Drive Axle Suspension, Torque Rods & Air Bags',
        description: 'Air ride suspension bags inflated and riding level. Shock absorbers dry. Torque rods secure with rubber bushings intact.',
        criticalOosRule: 'Deflated or leaking air bag causing chassis to ride on bump stops.',
        defaultPassed: true,
      },
    ],
  },
  {
    id: 'zone-4-trailer-body',
    zoneNumber: 4,
    title: 'Trailer Body, Cargo & Landing Gear',
    subtitle: 'Landing Gear, Bulkhead, Conspicuity Tape & Cargo Door',
    fmcsaStatute: '49 CFR § 393.100 (Cargo Securement) & § 393.13 (Retroreflective Tape)',
    iconName: 'Truck',
    checkItems: [
      {
        id: 'chk-4-1',
        name: 'Trailer Landing Gear, Crank Handle & Crossmembers',
        description: 'Landing gear legs fully retracted for transit. Foot pads free of debris. Crank handle firmly secured in holding bracket. Frame crossmembers straight.',
        criticalOosRule: 'Landing gear partially lowered or dragging during transit.',
        defaultPassed: true,
      },
      {
        id: 'chk-4-2',
        name: 'Side Panels, Rivets & DOT Conspicuity Retroreflective Tape',
        description: 'Trailer side walls free of severe buckling or puncture tears. Red/white retroreflective sheeting covers at least 50% of each trailer side.',
        criticalOosRule: 'Damaged side wall compromising trailer structural integrity.',
        defaultPassed: true,
      },
      {
        id: 'chk-4-3',
        name: 'Cargo Doors, Lock Bars, Hinges & Security Seal',
        description: 'Rear cargo doors securely latched. Lock bars engaged in top/bottom keepers. Hinges bolted tight. Verified bolt seal intact with matching BOL seal number.',
        criticalOosRule: 'Broken door lock bar or unlatched rear door swinging into traffic.',
        defaultPassed: true,
      },
    ],
  },
  {
    id: 'zone-5-trailer-tandems',
    zoneNumber: 5,
    title: 'Trailer Tandem Axles & Brakes',
    subtitle: 'Sliding Tandem Pins, Brakes, Drums & Hub Oil',
    fmcsaStatute: '49 CFR § 393.45 (Brake Tubing) & § 393.47 (Brake Actuators)',
    iconName: 'Sliders',
    checkItems: [
      {
        id: 'chk-5-1',
        name: 'Trailer Sliding Tandem Pins Fully Engaged in Holes',
        description: 'Both left and right tandem slider pins fully extended and locked through the trailer rail holes. Air release arm stowed.',
        criticalOosRule: 'Retracted tandem pins allowing trailer axle assembly to slide under braking.',
        defaultPassed: true,
      },
      {
        id: 'chk-5-2',
        name: 'Trailer Brake Chambers, Hoses & Slack Adjusters',
        description: 'Air brake chambers mounted securely. Brake hoses without kinks or abrasions. Automatic slack adjusters aligned with <= 1.0" pushrod stroke.',
        criticalOosRule: 'Cracked brake drum or brake lining contaminated with hub oil/grease.',
        defaultPassed: true,
      },
      {
        id: 'chk-5-3',
        name: 'Trailer Wheel Hubs, Oil Caps & Tire Inflation',
        description: 'Hub oil sight glass shows clean oil between min/max lines. No oil weeping from gasket. All 8 trailer tires inflated properly (100 PSI).',
        criticalOosRule: 'Dry wheel hub bearing or active oil puddle inside wheel rim.',
        defaultPassed: true,
      },
    ],
  },
  {
    id: 'zone-6-lighting-rear',
    zoneNumber: 6,
    title: 'Full Vehicle Lighting & Rear Clearance Circuit',
    subtitle: 'Headlights, Brake Lights, 4-Way Flashers & Marker Lamps',
    fmcsaStatute: '49 CFR § 393.9 to § 393.33 (Lighting Devices & Reflectors)',
    iconName: 'Sparkles',
    checkItems: [
      {
        id: 'chk-6-1',
        name: 'Low & High Beam Headlights, Fog Lamps & Turn Signals',
        description: 'Headlight lenses clean with no water ingress. Low beams and high beams operational. Front and side amber turn signals flashing at proper rate.',
        criticalOosRule: 'Both headlights inoperative during night driving hours.',
        defaultPassed: true,
      },
      {
        id: 'chk-6-2',
        name: 'Cab Clearance, Roof Marker & Identification Lamps',
        description: '5 amber roof marker lights illuminated on tractor cab. Amber front clearance lights visible from front and side.',
        criticalOosRule: 'Multiple marker lights out leading to roadside inspection citation.',
        defaultPassed: true,
      },
      {
        id: 'chk-6-3',
        name: 'Rear Tail, Brake (Stop) & 4-Way Hazard Flashers',
        description: 'Both rear red tail lights illuminated. Brake lamps illuminate brightly when pedal is depressed. 4-way hazard flashers operational.',
        criticalOosRule: 'Inoperative brake stop lamps is an immediate Out-of-Service condition.',
        defaultPassed: true,
      },
      {
        id: 'chk-6-4',
        name: 'Rear Underride Guard (DOT Bumper) & License Plate Lamp',
        description: 'DOT rear underride bumper solid with no structural bends or broken welds. White license plate light illuminating rear plate.',
        criticalOosRule: 'Severely cracked or missing rear impact guard.',
        defaultPassed: true,
      },
    ],
  },
  {
    id: 'zone-7-reefer-special',
    zoneNumber: 7,
    title: 'Refrigeration Unit & Special Cargo Gear',
    subtitle: 'Reefer Auto-Test, Fuel Level & Temperature Setpoint',
    fmcsaStatute: 'FSMA Sanitary Transportation Rule & Carrier Cargo Directives',
    iconName: 'Thermometer',
    checkItems: [
      {
        id: 'chk-7-1',
        name: 'Reefer Diesel Fuel Level (>= 3/4 Tank) & Oil Sight Glass',
        description: 'Dedicated reefer diesel tank at least 75% full. Engine oil level on dipstick between marks. Coolant overflow reservoir full.',
        criticalOosRule: 'Reefer fuel below 1/4 tank risking unit shutdown and cargo thermal loss.',
        defaultPassed: true,
      },
      {
        id: 'chk-7-2',
        name: 'Setpoint Temperature & Continuous Run Verification',
        description: 'Confirm controller setpoint matches Rate Con BOL spec (-10°F Frozen or 34°F Fresh). Set in CONTINUOUS run mode for sensitive freight.',
        criticalOosRule: 'Incorrect setpoint temperature or cycle-sentry mode on sensitive pharmaceuticals.',
        defaultPassed: true,
      },
      {
        id: 'chk-7-3',
        name: 'Reefer Pre-Trip Diagnostic Self-Test (No Active Alarms)',
        description: 'Initiate controller Pre-Trip self-test. Unit cycles through cooling, heating, and defrost modes. Microprocessor verifies 0 critical alarm codes.',
        criticalOosRule: 'Active yellow/red alarm light (Alarm 18/20) on reefer display.',
        defaultPassed: true,
      },
    ],
  },
];

// =====================================================================
// === INITIAL PRIOR DAY DVIR MEMORY BASE ===
// =====================================================================

export const INITIAL_PRIOR_DAY_DVIR_MEMORY: PriorDayDvirMemory = {
  priorDvirId: 'dvir-hist-20260910-post',
  priorDate: 'Sep 10, 2026 · 18:45 EDT',
  priorType: 'POST_TRIP',
  unitNumber: 'UNIT #104-E / TRL-5390',
  driverName: 'Marcus Bell',
  priorOdometer: 142850,
  defectsNoted: [
    {
      id: 'def-01',
      component: 'Right Rear Trailer Brake Chamber Air Hose',
      description: 'Air hose outer jacket exhibited minor surface scuffing against axle bracket; no inner cord exposed or audible leak detected.',
      severity: 'SAFETY_DEFECT',
      photoUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80',
      resolved: true,
      resolutionNote: 'Terminal mechanic replaced air hose assembly with fresh Parker SAE J1402 Type A rubber hose and adjusted clamp standoff.',
      resolvedBy: 'Jake Reynolds (Master Fleet Tech #402)',
      mechanicCertification: 'CERTIFIED_REPAIRED',
    },
    {
      id: 'def-02',
      component: 'Steer Axle Left Tire Inflation',
      description: 'Cold pressure measured 96 PSI on digital tire gauge (spec is 110 PSI for 12,300 lb front axle rating).',
      severity: 'MINOR_COSMETIC',
      resolved: true,
      resolutionNote: 'Inflated left steer tire to exactly 110 PSI; valve stem core and brass cap replaced.',
      resolvedBy: 'Jake Reynolds (Master Fleet Tech #402)',
      mechanicCertification: 'CERTIFIED_REPAIRED',
    },
    {
      id: 'def-03',
      component: 'Driver Side Windshield Wiper Blade',
      description: 'Rubber squeegee developed slight 1-inch edge tear causing minor water streaking on return stroke.',
      severity: 'MINOR_COSMETIC',
      resolved: true,
      resolutionNote: 'Installed new 22-inch heavy duty silicone winter blade; washer spray pattern re-aligned.',
      resolvedBy: 'Jake Reynolds (Master Fleet Tech #402)',
      mechanicCertification: 'CERTIFIED_REPAIRED',
    },
  ],
  driverNotes: 'Overall tractor running exceptionally smooth. Handled well through I-70 Missouri corridor. Reached delivery dock on schedule with zero engine fault codes.',
  mechanicActionRequired: true,
  mechanicCertification: {
    certifiedRepaired: true,
    repairedBy: 'Jake Reynolds — Master Fleet Tech #402',
    repairDate: 'Sep 10, 2026 · 21:15 EDT',
    workOrderNumber: 'WO-88421-STLOUIS',
    certificationNote: 'All 3 items noted on Sep 10 post-trip have been fully inspected, serviced, and tested in the shop bay. Unit #104-E and TRL-5390 are certified safe and compliant for dispatch under 49 CFR § 396.11(a)(3).',
  },
};

// =====================================================================
// === LOCAL STORAGE PERSISTENCE HELPERS ===
// =====================================================================

const DVIR_STORAGE_KEY = 'truckwithease_dvir_records_history_v2';
const ROADSIDE_TICKETS_KEY = 'truckwithease_breakdown_tickets_v1';
const DVIR_MESSAGES_KEY = 'truckwithease_dvir_dispatch_messages_v1';

export function getStoredDvirRecords(): DvirInspection[] {
  try {
    const raw = localStorage.getItem(DVIR_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read DVIR records from local storage:', e);
  }
  return [
    {
      id: 'dvir-hist-20260910-post',
      inspectionType: 'POST_TRIP',
      timestamp: 'Sep 10, 2026 · 18:45 EDT',
      unitNumber: 'UNIT #104-E',
      trailerNumber: 'TRL-5390',
      driverName: 'Marcus Bell',
      odometer: 142850,
      defectsFound: true,
      status: 'DEFECTS_CORRECTED',
      itemsChecked: [
        { name: 'Engine Compartment & Fluids', passed: true },
        { name: 'Air Brake System & Pressure', passed: true },
        { name: 'Coupling & 5th Wheel Jaws', passed: true },
        { name: 'Trailer Sliding Tandems', passed: true },
        { name: 'Right Rear Trailer Air Hose', passed: false, note: 'Outer scuffing noted on hose jacket.' },
        { name: 'Steer Axle Tires & Inflation', passed: false, note: 'Left steer measured 96 PSI.' },
        { name: 'Wipers & Washer Jets', passed: false, note: 'Driver blade streaking.' },
        { name: 'Rear Tail & Brake Lights', passed: true },
      ],
      defectsList: INITIAL_PRIOR_DAY_DVIR_MEMORY.defectsNoted,
      driverNotes: INITIAL_PRIOR_DAY_DVIR_MEMORY.driverNotes,
      mechanicNotes: INITIAL_PRIOR_DAY_DVIR_MEMORY.mechanicCertification.certificationNote,
      signatureVerified: true,
      certifiedSafeToOperate: true,
    },
  ];
}

export function saveDvirRecord(record: DvirInspection): DvirInspection[] {
  const current = getStoredDvirRecords();
  const updated = [record, ...current.filter((r) => r.id !== record.id)];
  try {
    localStorage.setItem(DVIR_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save DVIR record:', e);
  }
  return updated;
}

export function getStoredBreakdownTickets(): BreakdownIncidentTicket[] {
  try {
    const raw = localStorage.getItem(ROADSIDE_TICKETS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read breakdown tickets:', e);
  }
  return [];
}

export function saveBreakdownTicket(ticket: BreakdownIncidentTicket): BreakdownIncidentTicket[] {
  const current = getStoredBreakdownTickets();
  const updated = [ticket, ...current];
  try {
    localStorage.setItem(ROADSIDE_TICKETS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save breakdown ticket:', e);
  }
  return updated;
}

export interface DvirDispatchMessage {
  id: string;
  sender: 'DRIVER' | 'FLEET_MANAGER' | 'CENTRAL_DISPATCH' | 'SYSTEM_BOT';
  senderName: string;
  text: string;
  timestamp: string;
  photos?: string[];
  defectTag?: string;
  urgentOos?: boolean;
}

export function getDvirDispatchMessages(): DvirDispatchMessage[] {
  try {
    const raw = localStorage.getItem(DVIR_MESSAGES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read DVIR messages:', e);
  }
  return [
    {
      id: 'msg-01',
      sender: 'SYSTEM_BOT',
      senderName: 'Sentinel Safety Mesh',
      text: 'Prior Day Memory loaded for UNIT #104-E. WO-88421 repairs by Jake Reynolds certified clean at 21:15 EDT yesterday.',
      timestamp: 'Sep 11, 2026 · 06:10 EDT',
    },
    {
      id: 'msg-02',
      sender: 'FLEET_MANAGER',
      senderName: 'Dave Miller (Safety Director)',
      text: 'Good morning Marcus! The shop replaced that trailer brake line and aired the steers last night. Give the 5th wheel pin a good visual pull test and you are all set for Chicago.',
      timestamp: 'Sep 11, 2026 · 06:22 EDT',
    },
  ];
}

export function saveDvirDispatchMessage(msg: DvirDispatchMessage): DvirDispatchMessage[] {
  const current = getDvirDispatchMessages();
  const updated = [...current, msg];
  try {
    localStorage.setItem(DVIR_MESSAGES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save DVIR dispatch message:', e);
  }
  return updated;
}
