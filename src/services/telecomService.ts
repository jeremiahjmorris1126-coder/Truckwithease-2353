import {
  TelecomLine,
  TelecomCallLog,
  LineProvisioningRequest,
  FleetSpeedDialContact,
  EmergencyBreakdownReport,
  PhoneTutorialStep,
  BreakdownIssueCategory,
} from '../types';

const STORAGE_KEY_LINES = 'twe_telecom_lines_v1';
const STORAGE_KEY_LOGS = 'twe_telecom_call_logs_v1';
const STORAGE_KEY_BREAKDOWNS = 'twe_telecom_breakdowns_v1';
const STORAGE_KEY_CONTACTS = 'twe_telecom_contacts_v1';

export const INITIAL_TELECOM_LINES: TelecomLine[] = [
  {
    id: 'line-unit-104',
    unitNumber: 'TRUCK #104 (MISSOURI DEDICATED)',
    assignedPhoneNumber: '(312) 847-9284',
    lineType: 'LOCAL',
    areaCode: '312',
    sipTrunkStatus: 'ONLINE_ACTIVE',
    callShieldActive: true,
    hosAutoGuardActive: true,
    privacyMaskingActive: true,
    detentionRecordingActive: true,
    monthlyCost: 12.5,
    carrierSuperNetwork: "Twilio Global Tier-1 Super-Network",
    latencyMs: 14.8,
  },
  {
    id: 'line-unit-108',
    unitNumber: 'TRUCK #108 (TEXAS TRIANGLE SQUAD)',
    assignedPhoneNumber: '(214) 739-1102',
    lineType: 'LOCAL',
    areaCode: '214',
    sipTrunkStatus: 'ONLINE_ACTIVE',
    callShieldActive: true,
    hosAutoGuardActive: true,
    privacyMaskingActive: true,
    detentionRecordingActive: true,
    monthlyCost: 12.5,
    carrierSuperNetwork: "Twilio Global Tier-1 Super-Network",
    latencyMs: 15.2,
  },
  {
    id: 'line-unit-112',
    unitNumber: 'TRUCK #112 (NATIONAL REEFER EXPEDITE)',
    assignedPhoneNumber: '(888) 942-0199',
    lineType: 'TOLL_FREE',
    areaCode: '888',
    sipTrunkStatus: 'ONLINE_ACTIVE',
    callShieldActive: true,
    hosAutoGuardActive: true,
    privacyMaskingActive: true,
    detentionRecordingActive: true,
    monthlyCost: 12.5,
    carrierSuperNetwork: "Twilio Global Tier-1 Super-Network",
    latencyMs: 14.1,
  },
];

export const INITIAL_CALL_LOGS: TelecomCallLog[] = [
  {
    id: 'call-log-01',
    timestamp: '2026-09-12 11:42:18 CST',
    unitNumber: 'TRUCK #104',
    callerName: 'C.H. Robinson (Freight Broker)',
    callerType: 'FREIGHT_BROKER',
    callerNumber: '(800) 323-7587',
    durationSeconds: 43,
    hosStatusAtCall: 'DRIVING_11H_ACTIVE',
    actionTaken: 'AUTO_ETA_TTS_PLAYED',
    systemTtsTranscript:
      'Unit 104 is 24 miles from DFW receiver. Estimated Dock Arrival: 14:10 CST. HOS Drive Time Remaining: 03h 48m.',
    detentionTimestampProof: 'GEO-LOCKED: 32.7767° N, 96.7970° W (I-30 Corridor)',
    sha256AuditHash: '8e12a9c8b394f01479dce64821a5bb4901f4c398ad390291f0082cba941e9742',
  },
  {
    id: 'call-log-02',
    timestamp: '2026-09-12 09:15:04 CST',
    unitNumber: 'TRUCK #104',
    callerName: 'Target Distribution Center #880 (Dock Gate 14)',
    callerType: 'RECEIVER_DOCK',
    callerNumber: '(972) 555-0192',
    durationSeconds: 98,
    hosStatusAtCall: 'ON_DUTY_PARKED',
    actionTaken: 'CALL_ROUTED_TO_HEADSET',
    systemTtsTranscript: 'Driver acknowledged door assignment 42. Detention timer started automatically.',
    detentionTimestampProof: 'IN-GATE CHECK-IN: Target DC #880 Dock 42',
    sha256AuditHash: '4a6b29f0e1d58c7349102c89283f510793b82140fa39281a8b417c82a0e5b981',
  },
  {
    id: 'call-log-03',
    timestamp: '2026-09-12 07:30:22 CST',
    unitNumber: 'TRUCK #108',
    callerName: 'Total Quality Logistics (TQL Priority)',
    callerType: 'FREIGHT_BROKER',
    callerNumber: '(800) 580-3101',
    durationSeconds: 26,
    hosStatusAtCall: 'DRIVING_11H_ACTIVE',
    actionTaken: 'SMS_DISPATCH_AUTO_SENT',
    systemTtsTranscript: 'Auto SMS dispatch wire delivered tracking PIN and live GPS link.',
    detentionTimestampProof: 'TRANSIT CHECKPOINT: Mile Marker 204 (I-35 Northbound)',
    sha256AuditHash: '72c918a03f4125b7401923e802a9b31092e47c61830491023a91840fa21e9021',
  },
];

export function getTelecomLines(): TelecomLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LINES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load telecom lines', e);
  }
  return INITIAL_TELECOM_LINES;
}

export function saveTelecomLines(lines: TelecomLine[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LINES, JSON.stringify(lines));
  } catch (e) {
    console.error('Failed to save telecom lines', e);
  }
}

export function getTelecomCallLogs(): TelecomCallLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load call logs', e);
  }
  return INITIAL_CALL_LOGS;
}

export function saveTelecomCallLogs(logs: TelecomCallLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save call logs', e);
  }
}

export function calculateTelecomSavings(fleetUnits: number) {
  const standardCellularCostPerUnit = 660; // $55-$65/mo average ($55*12 = $660)
  const truckWithEaseCostPerUnit = 150; // $12.50/mo * 12 = $150

  const totalStandardCost = fleetUnits * standardCellularCostPerUnit;
  const totalTweCost = fleetUnits * truckWithEaseCostPerUnit;
  const totalAnnualSavings = totalStandardCost - totalTweCost;
  const savingsPercentage = ((totalAnnualSavings / totalStandardCost) * 100).toFixed(1);

  return {
    fleetUnits,
    totalStandardCost,
    totalTweCost,
    totalAnnualSavings,
    savingsPercentage: Number(savingsPercentage),
  };
}

export function generateRandomSha256(): string {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export function provisionNewCabLine(request: LineProvisioningRequest): TelecomLine {
  const cleanArea = request.desiredAreaCodeOrPrefix.replace(/\D/g, '') || '312';
  const prefix = cleanArea.startsWith('8') ? cleanArea : '312';
  const middle = Math.floor(100 + Math.random() * 900);
  const lastFour = Math.floor(1000 + Math.random() * 9000);
  const formattedNumber = `(${prefix}) ${middle}-${lastFour}`;

  const newLine: TelecomLine = {
    id: `line-${Date.now()}`,
    unitNumber: `${request.carrierLegalName.toUpperCase()} - UNIT #${Math.floor(100 + Math.random() * 900)}`,
    assignedPhoneNumber: formattedNumber,
    lineType: request.lineTypePreference,
    areaCode: prefix,
    sipTrunkStatus: 'ONLINE_ACTIVE',
    callShieldActive: true,
    hosAutoGuardActive: true,
    privacyMaskingActive: true,
    detentionRecordingActive: true,
    monthlyCost: 12.5,
    carrierSuperNetwork: 'Twilio Global Tier-1 Super-Network',
    latencyMs: +(13.5 + Math.random() * 2.5).toFixed(1),
  };

  const existing = getTelecomLines();
  const updated = [newLine, ...existing];
  saveTelecomLines(updated);
  return newLine;
}

export const DEFAULT_SPEED_DIAL_CONTACTS: FleetSpeedDialContact[] = [
  // 1. FREIGHT BROKERS
  {
    id: 'broker-chr',
    category: 'BROKER',
    name: 'C.H. Robinson Worldwide',
    subtitle: 'Freight Operations & Load Check-In Desk',
    phone: '(800) 323-7587',
    extension: '4102',
    badge: 'TOP BROKER',
    pinned: true,
    operatingHours: '24/7 National Operations',
    autoPromptScript:
      'Driver checking in for Load #CH-98214. Current location: I-30 MM 68. ETA: 14:15. Detention clock starts in 2 hours per rate confirmation.',
    contactPerson: 'Sarah Jenkins (Logistics Coordinator)',
    addressOrNotes: 'Automated MacroPoint & live GPS tracking supported.',
  },
  {
    id: 'broker-tql',
    category: 'BROKER',
    name: 'Total Quality Logistics (TQL)',
    subtitle: 'Carrier Priority & In-Transit Tracking',
    phone: '(800) 580-3101',
    extension: '8820',
    badge: 'TQL DISPATCH',
    pinned: true,
    operatingHours: '24/7 Dedicated',
    autoPromptScript:
      'TQL Load #TQL-44019. Driver in-transit on I-35 Northbound. Clean bill of lading on file. No delays reported.',
    contactPerson: 'Marcus Vance (Carrier Relations)',
    addressOrNotes: 'TQL Carrier Dashboard sync active.',
  },
  {
    id: 'broker-coyote',
    category: 'BROKER',
    name: 'Coyote Logistics (UPS Freight)',
    subtitle: 'Brokerage Ops & Accessorial Clearance',
    phone: '(877) 243-2696',
    extension: '105',
    badge: 'COYOTE 24/7',
    operatingHours: '24/7 Broker Support',
    autoPromptScript:
      'Coyote Load #CY-55102. Requesting lumper fee pre-authorization ($185.00) for dock unloading at receiver.',
    contactPerson: 'Dispatch Team Alpha',
    addressOrNotes: 'Lumper pre-approval requires receipt photo.',
  },
  {
    id: 'broker-landstar',
    category: 'BROKER',
    name: 'Landstar Ranger Operations',
    subtitle: 'Independent Carrier Services Desk',
    phone: '(800) 872-9400',
    badge: 'LANDSTAR',
    operatingHours: '06:00 - 22:00 CST',
    autoPromptScript:
      'Unit arrived at shipper facility. Yard check complete. BOL verified and sealed.',
    contactPerson: 'Regional Load Board Desk',
    addressOrNotes: 'Direct carrier settlement line.',
  },
  {
    id: 'broker-jbhunt',
    category: 'BROKER',
    name: 'J.B. Hunt 360 Carrier Line',
    subtitle: 'Carrier Support & Detention Authorization',
    phone: '(800) 423-6868',
    extension: '2',
    badge: 'JB 360',
    operatingHours: '24/7 Support',
    autoPromptScript:
      'JB Hunt 360 Load #JH-81920. Driver arrived at receiver gate. Initiating detention clock timestamp.',
    contactPerson: 'Automated 360 Concierge',
    addressOrNotes: 'Detention requires GPS geofence match.',
  },

  // 2. RECEIVERS & SHIPPERS
  {
    id: 'rec-target-880',
    category: 'RECEIVER',
    name: 'Target Regional DC #880 (Dock Gate 14)',
    subtitle: 'Inbound Receiving & Appointment Desk',
    phone: '(972) 555-0192',
    extension: '14',
    badge: 'RECEIVER DOCK',
    pinned: true,
    operatingHours: '04:00 - 20:00 CST',
    autoPromptScript:
      'Unit 104 checking in at Gate 14. Target Appt #TG-88019. Reefer temperature confirmed at -10°F. Ready for door assignment.',
    contactPerson: 'Dockmaster Rodriguez',
    addressOrNotes: 'Enter via East Logistics Gate on Commerce Pkwy. High-visibility vest required.',
  },
  {
    id: 'rec-walmart-6094',
    category: 'RECEIVER',
    name: 'Walmart Distribution Center DC #6094',
    subtitle: 'North Texas In-Gate & Guard Shack',
    phone: '(817) 555-0144',
    badge: 'WALMART DC',
    pinned: true,
    operatingHours: '24/7 Continuous Gate',
    autoPromptScript:
      'Walmart PO #WM-990142. Truck Unit #104, Trailer #TR-5309. Seal #440182 intact. Driver parked in Staging Row C.',
    contactPerson: 'Gate Guard Security Station',
    addressOrNotes: 'Bring physical CDL and printed rate confirmation to guard kiosk.',
  },
  {
    id: 'rec-kroger-12',
    category: 'RECEIVER',
    name: 'Kroger Cold Storage Regional #12',
    subtitle: 'Temperature Controlled Receiving & Lumper Office',
    phone: '(214) 555-0188',
    extension: '3',
    badge: 'COLD STORAGE',
    operatingHours: '24/7 Receiving',
    autoPromptScript:
      'Kroger Inbound Reefer Shipment. Pulp temperature checked at 34°F. Awaiting lumper unload assignment.',
    contactPerson: 'Receiving Foreman Dave',
    addressOrNotes: 'Pallet exchange receipt required before releasing trailer seal.',
  },
  {
    id: 'rec-homedepot-5088',
    category: 'RECEIVER',
    name: 'Home Depot Rapid Deployment Center #5088',
    subtitle: 'Building Materials & Flatbed Logistics',
    phone: '(972) 555-0129',
    badge: 'RDC DOCK',
    operatingHours: '05:00 - 22:00 CST',
    autoPromptScript:
      'Home Depot Appt #HD-50881. Flatbed load with lumber/drywall. Tarps unstrapped and secured in bay.',
    contactPerson: 'Dock Office Bay 22',
    addressOrNotes: 'Check in at Gate 3. Turn off engine and set wheel chocks immediately.',
  },

  // 3. FLEET DISPATCH
  {
    id: 'dispatch-hotline',
    category: 'DISPATCH',
    name: '24/7 Carrier Dispatch Desk',
    subtitle: 'TRUCKWITHEASE Tactical Hotline',
    phone: '(636) 706-8338',
    badge: 'DIRECT HOTLINE',
    pinned: true,
    operatingHours: '24/7/365 Always Live',
    autoPromptScript:
      'Unit 104 speaking with Dispatch. Reporting load status, remaining HOS driving hours, and fuel stop authorization.',
    contactPerson: 'Jeremiah Morris & Senior Dispatch Team',
    addressOrNotes: 'Primary operating dispatch desk. Handles load assignments, rate renegotiations, and reroutes.',
  },
  {
    id: 'dispatch-safety',
    category: 'DISPATCH',
    name: 'Fleet Safety & DOT Compliance Desk',
    subtitle: 'HOS Logs, Inspections & Citation Defense',
    phone: '(636) 706-8339',
    badge: 'SAFETY & DOT',
    operatingHours: '07:00 - 19:00 CST (On-Call 24/7)',
    autoPromptScript:
      'Driver requesting Safety Director assistance for Level 1 Roadside Inspection or ELD log certification.',
    contactPerson: 'Chief Safety Officer',
    addressOrNotes: 'Use for weigh station bypass issues, clean inspection bonuses, and post-accident protocols.',
  },
  {
    id: 'dispatch-night',
    category: 'DISPATCH',
    name: 'Night Operations & Emergency Reroutes',
    subtitle: 'Third-Shift Fleet Support & Fuel Codes',
    phone: '(636) 706-8340',
    badge: 'NIGHT DESK',
    operatingHours: '20:00 - 08:00 CST Daily',
    autoPromptScript:
      'Night shift load update. Requesting Comdata/EFS fuel express code for emergency top-off.',
    contactPerson: 'Night Ops Lead Specialist',
    addressOrNotes: 'Issues overnight fuel codes, gate access PINs, and weather detour clearances.',
  },

  // 4. EMERGENCY BREAKDOWN & ROADSIDE ASSISTANCE
  {
    id: 'sos-loves',
    category: 'EMERGENCY_BREAKDOWN',
    name: "Love's Truck Care 24/7 Roadside Rescue",
    subtitle: 'National Commercial Truck & Tire Road Service',
    phone: '(800) 655-6837',
    badge: "1-800-OK-LOVES",
    pinned: true,
    operatingHours: '24/7 Roadside Fleet Service',
    autoPromptScript:
      'Emergency roadside dispatch needed. Unit 104 stranded on highway shoulder. Location: I-40 Eastbound MM 284. Need mobile tire tech / Cummins mechanic.',
    contactPerson: "Love's National Fleet Dispatch Center",
    addressOrNotes: 'Average arrival: 45-60 min. Full tire mount, jump start, air line repair, DEF derate diagnostic.',
  },
  {
    id: 'sos-ta-petro',
    category: 'EMERGENCY_BREAKDOWN',
    name: 'TA Petro RoadSquad Emergency Service',
    subtitle: 'Heavy-Duty 24/7 On-Highway Mechanical Fleet Care',
    phone: '(800) 824-4357',
    badge: 'ROADSQUAD 24/7',
    pinned: true,
    operatingHours: '24/7 Mobile Shop Units',
    autoPromptScript:
      'RoadSquad Assistance requested. Engine fault code active. Coolant hose leak. Vehicle parked on safe highway shoulder with hazard triangles deployed.',
    contactPerson: 'TA RoadSquad Operations Dispatch',
    addressOrNotes: 'Over 3,000 mobile service trucks nationwide. Certified diesel technicians.',
  },
  {
    id: 'sos-bridgestone',
    category: 'EMERGENCY_BREAKDOWN',
    name: 'Bridgestone Emergency Fleet Care (B-SAFE)',
    subtitle: 'Commercial Steer & Drive Tire Highway Replacement',
    phone: '(800) 562-6091',
    badge: 'NATIONAL TIRES',
    operatingHours: '24/7 Emergency Tire Hotline',
    autoPromptScript:
      'Commercial steer tire blowout. 295/75R22.5 replacement needed on I-35. Driver safe inside cab.',
    contactPerson: 'Emergency Tire Dispatcher',
    addressOrNotes: 'Direct national fleet account pricing. Guaranteed roadside response time.',
  },
  {
    id: 'sos-michelin',
    category: 'EMERGENCY_BREAKDOWN',
    name: 'Michelin ONCall Commercial Breakdown',
    subtitle: 'Rapid Emergency Mechanical & Towing Network',
    phone: '(800) 847-3435',
    badge: 'ONCALL RESCUE',
    operatingHours: '24/7 Dispatch',
    autoPromptScript:
      'Michelin ONCall request. Heavy duty tow and mobile diagnostic needed for Peterbilt 579.',
    contactPerson: 'Commercial Response Coordinator',
    addressOrNotes: 'Comprehensive breakdown coverage including towing, tires, and mechanical.',
  },
  {
    id: 'sos-heavy-towing',
    category: 'EMERGENCY_BREAKDOWN',
    name: 'National Heavy-Duty Rotator & Wrecker Towing',
    subtitle: '50-Ton Heavy Recovery, Winch-Out & Rig Transport',
    phone: '(800) 555-0911',
    badge: '50-TON WRECKER',
    operatingHours: '24/7 Heavy Towing',
    autoPromptScript:
      'Heavy duty wrecker required for 80,000 LB class 8 tractor-trailer. Pull drive-shaft for tow to nearest authorized dealership.',
    contactPerson: 'Regional Towing Dispatch',
    addressOrNotes: 'Equipped with under-reach wheel lifts and air cushion recovery for loaded rigs.',
  },
  {
    id: 'sos-highway-patrol',
    category: 'EMERGENCY_BREAKDOWN',
    name: 'State Highway Patrol Non-Emergency Dispatch',
    subtitle: 'Traffic Safety, Shoulder Escort & Hazard Warning',
    phone: '(800) 525-5555',
    badge: 'STATE PATROL',
    operatingHours: '24/7 State Police',
    autoPromptScript:
      'Disabled commercial tractor-trailer on right shoulder. Hazard flashers and reflective warning triangles placed. Requesting cruiser rear escort for roadside tech safety.',
    contactPerson: 'State Police Troop Dispatcher',
    addressOrNotes: 'Protects mobile mechanic from high-speed interstate traffic during tire changes.',
  },
  {
    id: 'sos-911',
    category: 'EMERGENCY_BREAKDOWN',
    name: '911 Emergency Police / Fire / EMS',
    subtitle: 'Life Safety, Severe Collisions & Hazmat Fires',
    phone: '911',
    badge: 'CRITICAL LIFE SAFETY',
    pinned: true,
    operatingHours: '24/7/365 Emergency',
    autoPromptScript:
      'EMERGENCY: Tractor-trailer accident or fire on highway. Exact GPS coordinates and mile marker transmitted.',
    contactPerson: 'Public Safety 911 Operator',
    addressOrNotes: 'Use only for life-threatening emergencies, vehicle fires, or hazardous chemical spills.',
  },
];

export const INITIAL_BREAKDOWNS: EmergencyBreakdownReport[] = [
  {
    id: 'breakdown-01',
    timestamp: '2026-09-18 16:24:10 CST',
    unitNumber: 'TRUCK #104 (2026 Peterbilt 579)',
    vin: '1XP4DB9X7RD819204',
    driverName: 'Jeremiah Morris',
    driverPhone: '(312) 847-9284',
    gpsCoords: '35.1495° N, 90.0490° W',
    interstateLocation: 'I-40 Eastbound MM 284 (Near West Memphis)',
    nearestExit: 'Exit 280 (Airport Rd)',
    nearestSafeHaven: "Love's Travel Stop #412 (4.2 miles ahead)",
    issueCategory: 'TIRE_BLOWOUT',
    issueDescription: 'Right drive axle outer tire de-treaded and lost pressure on highway.',
    dtcCodes: ['TPMS-04: Drive Axle Right Outer Low PSI (12 PSI)', 'ABS-12: Wheel Speed Sensor Jitter'],
    trailerId: 'TR-5309 (Wabash Duraplate 53ft Dry Van)',
    cargoType: 'General Dry Freight (Paper Products)',
    isHazmat: false,
    sosStatus: 'MOBILE_TECH_EN_ROUTE',
    dispatchedVendor: "Love's Truck Care Mobile Unit #14",
    etaMinutes: 28,
    sha256AuditHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
  },
];

export const PHONE_TUTORIAL_STEPS: PhoneTutorialStep[] = [
  {
    id: 1,
    category: 'OVERVIEW',
    title: 'Welcome to TRUCKWITHEASE In-Cab Fleet Communications',
    summary: 'A complete commercial phone system built into the app for $12.50/mo per truck.',
    explanation:
      'Traditional cell phone plans cost fleets $55 to $65/month per driver and force drivers to give out their personal mobile numbers to dozens of brokers, docks, and dispatchers. TRUCKWITHEASE gives each rig its own official dedicated business line on Twilio’s Global Tier-1 Carrier Super-Network. It protects personal privacy, eliminates high phone bills, and connects directly to vehicle telematics.',
    proTips: [
      'Cost: Just $12.50/month per line — saves 76% over traditional AT&T or Verizon enterprise bills.',
      'Personal Privacy: Drivers never disclose personal cell numbers. Outbound calls show the carrier brand.',
      'No Equipment Needed: Works straight inside the app on phones, tablets, or in-dash Android Auto displays.',
    ],
    actionLabel: 'Explore Driver Benefits',
  },
  {
    id: 2,
    category: 'BROKERS',
    title: 'Communicating with Freight Brokers & Detention Protection',
    summary: 'Automated GPS ETA broadcasts while driving + instant legally-binding detention clock proof.',
    explanation:
      'Brokers frequently call drivers while they are on the road, creating dangerous distracted driving hazards that violate FMCSA 49 CFR § 392.82. With TRUCKWITHEASE, when a driver is rolling on the 11-Hour Drive Clock, our HOS Auto-Guard automatically intercepts broker calls, reads a text-to-speech ETA with exact GPS miles remaining, and texts the broker tracking data. When arrived at a receiver, one tap starts an audited detention clock stamped with SHA-256 cryptographic proof.',
    proTips: [
      'Zero Distracted Driving Citations: The system answers brokers automatically while you drive.',
      'Detention Clock Protection: Geofence arrival logs start your 2-hour free time clock and bill detention automatically.',
      'Speed Dials: 1-click speed dials for C.H. Robinson, TQL, Coyote, Landstar, and J.B. Hunt.',
    ],
    actionLabel: 'View Broker Speed Dials',
  },
  {
    id: 3,
    category: 'RECEIVERS',
    title: 'Communicating with Receivers & Shippers',
    summary: 'One-touch dock check-in, seal verification, and lumper clearance without leaving the cab.',
    explanation:
      'Waiting in long guard shack lines wastes valuable on-duty hours. With the Receiver dock integration, drivers can direct-dial receiver guard shacks, verify dock appointment numbers, transmit reefer pulp temperatures, and request instant lumper Comcheck cash codes from dispatch before docking.',
    proTips: [
      'Direct Gate Dials: Fast access to guard shacks and dockmasters at major DCs like Target, Walmart, and Kroger.',
      'In-Cab Gate Dossier: 1-tap transmission of Truck #, Trailer #, Seal #, and Reefer temperature.',
      'Lumper Approvals: Speed up billing clearance so you never get stuck at an unloading dock.',
    ],
    actionLabel: 'View Receiver Directory',
  },
  {
    id: 4,
    category: 'DISPATCH',
    title: 'Direct Dispatch Desk & Push-To-Talk Fleet Intercom',
    summary: 'Instant 24/7 hotline to fleet dispatch (636-706-8338) + live walkie-talkie channel.',
    explanation:
      'Stay in synchronized lockstep with your dispatcher. A single tap connects you directly to the 24/7 Dispatch Desk (636-706-8338) or the Safety & DOT Compliance Office. You can also use the live Push-To-Talk (PTT) radio intercom for hands-free driver-to-dispatch voice updates, complete with live transmission of remaining 11h/14h/70h HOS duty clocks.',
    proTips: [
      '1-Touch Dispatch Dial: Immediate connection to 636-706-8338 without searching through contacts.',
      'Push-To-Talk Radio: Instant CB-style voice channel with zero dialing latency.',
      'Automatic Duty Sync: Dispatchers automatically see your HOS remaining driving time on every call.',
    ],
    actionLabel: 'Connect with Dispatch',
  },
  {
    id: 5,
    category: 'EMERGENCY',
    title: 'Emergency Breakdown & Roadside SOS Protocol',
    summary: 'Tied directly into CAN-bus engine diagnostics and GPS for 60-second roadside dispatch.',
    explanation:
      'When an emergency breakdown occurs on a high-speed highway shoulder, every second counts. The TRUCKWITHEASE Emergency Breakdown module connects directly into the truck’s live J1939 CAN-bus telemetry to automatically detect engine fault codes (DTCs), odometer, coolant level, oil pressure, and exact satellite GPS coordinates + highway mile marker. With one tap, an emergency SOS packet is transmitted to Dispatch, Safety, and national heavy-duty repair networks.',
    proTips: [
      'Automatic Diagnostic Pull: Automatically reads J1939 engine trouble codes and tire pressures.',
      'Exact Location Sharing: Transmits latitude/longitude, interstate mile marker, and nearest safe haven truck stop.',
      'National Roadside Dials: 1-tap speed dials to Love’s Truck Care (1-800-OK-LOVES), TA Petro RoadSquad, and Bridgestone Fleet.',
      '49 CFR § 392.22 Checklist: Interactive reminder and timer to place emergency warning triangles within 10 minutes.',
    ],
    actionLabel: 'Review Emergency SOS',
  },
  {
    id: 6,
    category: 'HANDS_FREE',
    title: 'FMCSA 49 CFR § 392.82 Hands-Free Driving Compliance',
    summary: 'How the in-cab system keeps drivers 100% compliant with federal mobile phone safety rules.',
    explanation:
      'Federal law prohibits commercial drivers from holding a mobile phone, pressing more than one button to dial, or reaching for an unmounted device while operating a commercial vehicle on a public highway. Fines exceed $2,750 for drivers and $11,000 for carriers. TRUCKWITHEASE uses large high-contrast single-tap controls, hands-free voice commands, and automated speech responders to ensure total legal compliance at all times.',
    proTips: [
      'One-Button Rule: Initiate or answer calls with a single touch or voice prompt.',
      'Mounted Device Rule: Mount your smartphone or tablet in an accessible, secure cab bracket.',
      'HOS Drive Shield: Let the app handle broker calls automatically when your speed exceeds 5 MPH.',
    ],
    actionLabel: 'Complete Tutorial',
  },
];

export function getSpeedDialContacts(): FleetSpeedDialContact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONTACTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load contacts', e);
  }
  return DEFAULT_SPEED_DIAL_CONTACTS;
}

export function saveSpeedDialContacts(contacts: FleetSpeedDialContact[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(contacts));
  } catch (e) {
    console.error('Failed to save contacts', e);
  }
}

export function getEmergencyBreakdowns(): EmergencyBreakdownReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BREAKDOWNS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load breakdowns', e);
  }
  return INITIAL_BREAKDOWNS;
}

export function saveEmergencyBreakdowns(reports: EmergencyBreakdownReport[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BREAKDOWNS, JSON.stringify(reports));
  } catch (e) {
    console.error('Failed to save breakdowns', e);
  }
}

export function createEmergencyBreakdownReport(data: {
  unitNumber: string;
  vin: string;
  driverName: string;
  driverPhone: string;
  gpsCoords: string;
  interstateLocation: string;
  nearestExit: string;
  nearestSafeHaven: string;
  issueCategory: BreakdownIssueCategory;
  issueDescription: string;
  dtcCodes: string[];
  trailerId?: string;
  cargoType?: string;
  isHazmat?: boolean;
  reeferTemp?: string;
  dispatchedVendor?: string;
}): EmergencyBreakdownReport {
  const newReport: EmergencyBreakdownReport = {
    id: `breakdown-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' CST',
    unitNumber: data.unitNumber,
    vin: data.vin,
    driverName: data.driverName,
    driverPhone: data.driverPhone,
    gpsCoords: data.gpsCoords,
    interstateLocation: data.interstateLocation,
    nearestExit: data.nearestExit,
    nearestSafeHaven: data.nearestSafeHaven,
    issueCategory: data.issueCategory,
    issueDescription: data.issueDescription,
    dtcCodes: data.dtcCodes,
    trailerId: data.trailerId,
    cargoType: data.cargoType,
    isHazmat: data.isHazmat,
    reeferTemp: data.reeferTemp,
    sosStatus: 'BROADCAST_ACTIVE',
    dispatchedVendor: data.dispatchedVendor || "Love's Truck Care 24/7 Roadside Rescue",
    etaMinutes: 45,
    sha256AuditHash: generateRandomSha256(),
  };

  const existing = getEmergencyBreakdowns();
  const updated = [newReport, ...existing];
  saveEmergencyBreakdowns(updated);
  return newReport;
}

// Browser Web Audio API DTMF Dial Tone Synthesizer
let audioCtx: AudioContext | null = null;

const DTMF_FREQS: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477],
};

export function playDtmfTone(key: string, durationMs: number = 100): void {
  try {
    const freqs = DTMF_FREQS[key];
    if (!freqs) return;

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.frequency.value = freqs[0];
    osc2.frequency.value = freqs[1];

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationMs / 1000);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start();
    osc2.start();

    osc1.stop(audioCtx.currentTime + durationMs / 1000);
    osc2.stop(audioCtx.currentTime + durationMs / 1000);
  } catch {
    // Ignore audio context autoplay limitations gracefully
  }
}

export function playRingbackBeep(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch {
    // Ignore audio context errors
  }
}

