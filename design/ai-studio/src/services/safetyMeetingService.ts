// ============================================================================
// DRIVER SAFETY MEETINGS & FMCSA COMPLIANCE RECORDING SERVICE
// Stores and provides access to interactive safety meetings, digital attendance
// rosters, audio/video logs, quizzes, transcript search, and FMCSA audit-ready certificates.
// ============================================================================

import {
  collection,
  doc,
  getDocs,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface SafetyMeetingQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface MeetingTranscriptSegment {
  timestamp: string; // e.g. "02:15"
  seconds: number; // e.g. 135
  speaker: string; // e.g. "Jeremiah Morris (Safety Director)"
  text: string;
  keywords: string[];
}

export type SafetyMeetingMediaType = 'VIDEO' | 'AUDIO' | 'INTERACTIVE_SLIDES';

export type SafetyMeetingAuditCategory =
  | 'FMCSA_NEW_ENTRANT_AUDIT'
  | 'ANNUAL_SAFETY_FITNESS_385'
  | 'POST_INCIDENT_CORRECTIVE_ACTION'
  | 'CVSA_BRAKE_SAFETY'
  | 'HAZMAT_SECURITY_HM232'
  | 'INSURANCE_LOSS_PREVENTION'
  | 'HOURS_OF_SERVICE_AUDIT';

export interface DriverSafetyMeeting {
  id: string;
  title: string;
  fmcsaStatute: string; // e.g. '49 CFR § 392.14 / OSHA 1910'
  monthQuarter: string; // e.g. 'March 2026 (Monthly Mandatory)'
  status: 'SCHEDULED' | 'ACTIVE_NOW' | 'COMPLETED' | 'ARCHIVED';
  meetingLeader: string; // e.g. 'Jeremiah Morris (Safety Director & Chief Mechanic)'
  meetingDate: string; // e.g. '2026-03-20 10:00 AM EDT'
  durationMinutes: number;
  durationFormatted?: string; // e.g. '30:00'
  mediaType?: SafetyMeetingMediaType;
  mediaUrl?: string;
  thumbnailUrl?: string;
  audioWaveform?: number[];
  summary: string;
  agenda: string[];
  mandatoryForRoles: string[]; // e.g. ['ALL_DRIVERS', 'HAZMAT_HANDLERS']
  assignedDriverIds?: string[]; // Array of assigned driver IDs
  auditCategory?: SafetyMeetingAuditCategory;
  auditMandateDescription?: string;
  auditUrgency?: 'MANDATORY_CRITICAL' | 'URGENT' | 'ANNUAL_STANDARD';
  auditDeadline?: string;
  slidesCount: number;
  quizQuestions: SafetyMeetingQuizQuestion[];
  totalAttendedCount?: number;
  totalAssignedCount?: number;
  fmcsaAuditCode?: string;
  transcript?: MeetingTranscriptSegment[];
  createdAt: string;
}

export interface SafetyMeetingAttendanceRecord {
  id: string;
  meetingId: string;
  meetingTitle: string;
  driverId: string;
  driverName: string;
  driverCdlNumber: string;
  unitAssigned?: string;
  attendedAt: string;
  scorePercent: number; // e.g. 100%
  passed: boolean;
  digitalSignature: string;
  driverNotes?: string;
  gpsLocation: string;
  certificateHashSha256: string;
  fmcsaCompliant: boolean;
  auditCategoryAssigned?: SafetyMeetingAuditCategory;
}

export interface AssignableDriver {
  id: string;
  name: string;
  cdlNumber: string;
  unit: string;
  email: string;
  phone: string;
  experienceYears: number;
  complianceRating: number; // 0-100%
}

export const ASSIGNABLE_FLEET_DRIVERS: AssignableDriver[] = [
  {
    id: 'drv-marcus-vance',
    name: 'Marcus Vance',
    cdlNumber: 'PA-CDL-9048123-A',
    unit: 'UNIT #104-E (2025 Peterbilt 579)',
    email: 'marcus.vance@titancarriers.com',
    phone: '(412) 555-0192',
    experienceYears: 14,
    complianceRating: 100,
  },
  {
    id: 'drv-elena-rostova',
    name: 'Elena Rostova',
    cdlNumber: 'TX-CDL-4820199-A',
    unit: 'UNIT #208-T (2024 Freightliner Cascadia)',
    email: 'elena.rostova@titancarriers.com',
    phone: '(956) 555-0144',
    experienceYears: 9,
    complianceRating: 100,
  },
  {
    id: 'drv-darnell-washington',
    name: 'Darnell Washington',
    cdlNumber: 'IL-CDL-8829103-A',
    unit: 'UNIT #312-B (2023 Kenworth T680)',
    email: 'darnell.w@titancarriers.com',
    phone: '(312) 555-0811',
    experienceYears: 12,
    complianceRating: 100,
  },
  {
    id: 'drv-javier-morales',
    name: 'Javier Morales',
    cdlNumber: 'CA-CDL-7719284-A',
    unit: 'UNIT #119-R (2025 Volvo VNL 860)',
    email: 'javier.morales@titancarriers.com',
    phone: '(213) 555-0723',
    experienceYears: 7,
    complianceRating: 88,
  },
  {
    id: 'drv-sarah-jenkins',
    name: 'Sarah Jenkins',
    cdlNumber: 'OH-CDL-6619024-A',
    unit: 'UNIT #405-V (2024 International LT)',
    email: 'sarah.j@titancarriers.com',
    phone: '(614) 555-0391',
    experienceYears: 11,
    complianceRating: 92,
  },
  {
    id: 'drv-tyler-hayes',
    name: 'Tyler Hayes',
    cdlNumber: 'GA-CDL-3391028-A',
    unit: 'UNIT #501-H (2025 Mack Anthem)',
    email: 'tyler.hayes@titancarriers.com',
    phone: '(404) 555-0965',
    experienceYears: 5,
    complianceRating: 85,
  },
];

export const INITIAL_SAFETY_MEETINGS: DriverSafetyMeeting[] = [
  {
    id: 'sm-2026-03',
    title: 'FMCSA Severe Weather & Mountain Pass Chain Controls (49 CFR § 392.14)',
    fmcsaStatute: '49 CFR § 392.14 & State Chain Law Mandates',
    monthQuarter: 'March 2026 (Monthly Mandatory)',
    status: 'ACTIVE_NOW',
    meetingLeader: 'Jeremiah Morris (Safety Director & Chief Mechanic)',
    meetingDate: '2026-03-20 10:00 AM EDT',
    durationMinutes: 30,
    durationFormatted: '30:00',
    mediaType: 'VIDEO',
    mediaUrl: 'https://cdn.truckwithease.internal/media/safety-briefings/2026-03-severe-weather.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    audioWaveform: [35, 48, 62, 80, 45, 90, 75, 60, 40, 68, 82, 95, 70, 55, 40, 85, 92, 60, 45, 78],
    summary:
      'Essential procedures for commercial vehicle operations during hazardous conditions: reduced visibility, black ice detection, safe following distances (7-second rule), mountain chain-up requirements, and FMCSA statutory right to shut down safely without penalty.',
    agenda: [
      '1. FMCSA § 392.14 Hazardous Conditions Rule & Driver Legal Authority to Park',
      '2. Mountain Chain Controls (Colorado I-70 Code 15/16, Wyoming I-80 Rolling Closures)',
      '3. Steer Tire Traction Management and Anti-Lock Braking on Black Ice',
      '4. Emergency Cab Equipment & Thermal Survival Kit Verification (Blanket, Food, Flares)',
      '5. Dispatch Zero Reporting Procedures for Corridors Under Active Blizzard Warning',
    ],
    mandatoryForRoles: ['ALL_DRIVERS', 'FLEET_MANAGERS', 'DISPATCHERS'],
    assignedDriverIds: [
      'drv-marcus-vance',
      'drv-elena-rostova',
      'drv-darnell-washington',
      'drv-javier-morales',
      'drv-sarah-jenkins',
      'drv-tyler-hayes',
    ],
    auditCategory: 'ANNUAL_SAFETY_FITNESS_385',
    auditMandateDescription: 'Mandatory Winter Operations Certification per DOT/FMCSA Safety Fitness Review',
    auditUrgency: 'MANDATORY_CRITICAL',
    auditDeadline: '2026-03-31',
    slidesCount: 14,
    quizQuestions: [
      {
        id: 'q1',
        question:
          'Under 49 CFR § 392.14, what is a commercial driver required to do when extreme weather makes operations unsafe?',
        options: [
          'Accelerate to clear the snowstorm corridor as fast as possible',
          'Reduce speed and exercise extreme caution; if conditions become too hazardous, discontinue operation until safe',
          'Continue driving at posted speed limit if the broker specifies guaranteed on-time delivery',
          'Turn off headlights to avoid snow glare and follow the truck ahead closely',
        ],
        correctAnswerIndex: 1,
        explanation:
          '49 CFR § 392.14 mandates extreme caution and authorizes drivers to park until the CMV can be operated safely.',
      },
      {
        id: 'q2',
        question:
          'What is the minimum recommended following distance for a loaded tractor-trailer on slippery or snow-covered roads?',
        options: [
          '2 seconds',
          '4 seconds',
          'At least 7 to 10 seconds or double the normal dry pavement distance',
          '1 car length per 10 MPH',
        ],
        correctAnswerIndex: 2,
        explanation:
          'At highway speeds on wet/icy roads, commercial rigs require at least 7 to 10 seconds following distance to stop safely.',
      },
      {
        id: 'q3',
        question:
          'Can a broker or dispatcher legally penalize a driver for shutting down under FMCSA § 392.14 weather conditions?',
        options: [
          'Yes, brokers can deduct $500 for missing the delivery appointment',
          'No, 49 U.S.C. § 31105 protects commercial drivers from carrier/broker coercion or retaliation when shutting down for safety',
          'Only if the driver has driven less than 4 hours',
          'Yes, unless an official highway patrol closure ticket is uploaded',
        ],
        correctAnswerIndex: 1,
        explanation:
          'The FMCSA Coercion Rule (49 CFR § 390.6) and federal whistleblower statutes explicitly prohibit punishing drivers for weather shutdowns.',
      },
    ],
    totalAttendedCount: 3,
    totalAssignedCount: 6,
    fmcsaAuditCode: 'FMCSA-SM-2026-03-9941',
    transcript: [
      {
        timestamp: '00:00',
        seconds: 0,
        speaker: 'Jeremiah Morris (Safety Director)',
        text: 'Welcome drivers and fleet personnel to the March 2026 Mandatory Safety Briefing on 49 CFR § 392.14.',
        keywords: ['welcome', 'mandatory', '392.14'],
      },
      {
        timestamp: '03:15',
        seconds: 195,
        speaker: 'Jeremiah Morris (Safety Director)',
        text: 'When black ice or whiteout conditions manifest on mountain corridors like I-70 or I-80, federal law gives the driver complete legal authority to pull over without broker coercion.',
        keywords: ['black ice', 'mountain passes', 'coercion', 'authority to park'],
      },
      {
        timestamp: '11:40',
        seconds: 700,
        speaker: 'Marcus Vance (Senior Road Captain)',
        text: 'Remember to verify dual-rail tire chains on drive axles before climbing Eisenhower Tunnel or Elk Mountain. Tensioners must be tight with no loose links.',
        keywords: ['tire chains', 'Colorado I-70', 'tensioners', 'drive axles'],
      },
      {
        timestamp: '22:10',
        seconds: 1330,
        speaker: 'Jeremiah Morris (Safety Director)',
        text: 'Ensure your thermal sleeper packs, emergency food, water rations, and DOT reflective triangles are 100% verified during your daily pre-trip DVIR.',
        keywords: ['emergency equipment', 'DVIR', 'safety triangles'],
      },
    ],
    createdAt: '2026-03-01T08:00:00Z',
  },
  {
    id: 'sm-2026-04',
    title: 'Cargo Securement & Load Distribution Mandates (49 CFR Part 393)',
    fmcsaStatute: '49 CFR § 393.100 - § 393.136',
    monthQuarter: 'April 2026 (Upcoming Mandatory)',
    status: 'SCHEDULED',
    meetingLeader: 'Marcus Vance (Senior Road Captain & Shift Lead)',
    meetingDate: '2026-04-15 09:30 AM EDT',
    durationMinutes: 35,
    durationFormatted: '35:00',
    mediaType: 'VIDEO',
    mediaUrl: 'https://cdn.truckwithease.internal/media/safety-briefings/2026-04-cargo-securement.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80',
    audioWaveform: [40, 55, 70, 65, 80, 90, 85, 70, 60, 75, 80, 65, 50, 45, 60, 75, 80, 95, 70, 50],
    summary:
      'Detailed review of working load limits (WLL), tiedown rules for flatbeds and dry vans, blocking and bracing requirements, tandem axle weight balance (Federal Bridge Formula), and pre-trip load verification audits.',
    agenda: [
      '1. Working Load Limit (WLL) calculations and aggregate tiedown capacity (50% rule)',
      '2. Dry Van load bars, friction mats, and pallet bracing requirements',
      '3. Tandem axle slide positioning for 34,000 lbs legal limit on drive & trailer axles',
      '4. Pre-trip load securement inspection within first 50 miles per § 392.9',
      '5. Shippers load and count (SLC) vs Driver-inspected liabilities',
    ],
    mandatoryForRoles: ['ALL_DRIVERS', 'LOADERS', 'FLEET_MANAGERS'],
    assignedDriverIds: [
      'drv-marcus-vance',
      'drv-elena-rostova',
      'drv-darnell-washington',
      'drv-javier-morales',
      'drv-sarah-jenkins',
      'drv-tyler-hayes',
    ],
    auditCategory: 'FMCSA_NEW_ENTRANT_AUDIT',
    auditMandateDescription: 'FMCSA Safety Audit Requirement for Cargo Securement & Weight Compliance',
    auditUrgency: 'URGENT',
    auditDeadline: '2026-04-30',
    slidesCount: 16,
    quizQuestions: [
      {
        id: 'q1',
        question:
          'Under 49 CFR § 392.9, within how many miles after beginning a trip must a driver inspect cargo and securement devices?',
        options: [
          'Within the first 250 miles',
          'Within the first 50 miles, and then every 150 miles or 3 hours thereafter',
          'Only at the final destination delivery dock',
          'Within 10 miles of crossing a state line',
        ],
        correctAnswerIndex: 1,
        explanation:
          '49 CFR § 392.9(b) requires an inspection within the first 50 miles and at each duty status change or every 150 miles / 3 hours.',
      },
      {
        id: 'q2',
        question:
          'What is the statutory weight limit for a tandem axle group on the Interstate system under federal law?',
        options: ['20,000 lbs', '34,000 lbs', '40,000 lbs', '48,000 lbs'],
        correctAnswerIndex: 1,
        explanation:
          'Federal law establishes 34,000 lbs as the maximum legal tandem axle weight without specialized oversize/overweight permits.',
      },
    ],
    totalAttendedCount: 1,
    totalAssignedCount: 6,
    fmcsaAuditCode: 'FMCSA-SM-2026-04-8812',
    transcript: [
      {
        timestamp: '00:00',
        seconds: 0,
        speaker: 'Marcus Vance (Senior Road Captain)',
        text: 'Good morning drivers. Today we review Part 393 cargo securement, working load limits, and tandem weight balancing.',
        keywords: ['cargo securement', 'Part 393', 'WLL'],
      },
      {
        timestamp: '08:20',
        seconds: 500,
        speaker: 'Marcus Vance (Senior Road Captain)',
        text: 'The aggregate working load limit of all tiedowns must equal at least 50 percent of the weight of the article being secured.',
        keywords: ['50 percent rule', 'working load limit', 'tiedowns'],
      },
      {
        timestamp: '19:45',
        seconds: 1185,
        speaker: 'Marcus Vance (Senior Road Captain)',
        text: 'Inspect your load within the first 50 miles. Document this check directly inside TruckWithEase ELD notes for audit verification.',
        keywords: ['50 mile inspection', '392.9', 'ELD log'],
      },
    ],
    createdAt: '2026-03-05T08:00:00Z',
  },
  {
    id: 'sm-2026-02',
    title: 'Distracted Driving & Hands-Free Safety Compliance (49 CFR § 392.82)',
    fmcsaStatute: '49 CFR § 392.82 & § 392.80',
    monthQuarter: 'February 2026 (Completed Archive)',
    status: 'COMPLETED',
    meetingLeader: 'Elena Rostova (Compliance Specialist)',
    meetingDate: '2026-02-18 11:00 AM EDT',
    durationMinutes: 25,
    durationFormatted: '25:00',
    mediaType: 'AUDIO',
    mediaUrl: 'https://cdn.truckwithease.internal/media/safety-briefings/2026-02-handsfree-audio.mp3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    audioWaveform: [25, 40, 65, 78, 85, 60, 45, 70, 88, 92, 75, 60, 80, 70, 50, 40, 65, 85, 70, 45],
    summary:
      'Statutory rules governing hands-free devices in commercial motor vehicles. Prohibitions against hand-held phone use, texting, dialing, or reaching for mobile devices. Using TruckWithEase Hands-Free voice commands and single-tap compliance.',
    agenda: [
      '1. Federal prohibitions and $2,750 driver fines for handheld mobile device use',
      '2. TruckWithEase Hands-Free voice integration (1-tap or voice commands only)',
      '3. Reaching for devices: Definition under 49 CFR § 392.82',
      '4. Fleet CSA score impacts from mobile device violations',
      '5. Best practices for GPS route setting before putting rig into gear',
    ],
    mandatoryForRoles: ['ALL_DRIVERS', 'OWNER_OPERATORS'],
    assignedDriverIds: [
      'drv-marcus-vance',
      'drv-elena-rostova',
      'drv-darnell-washington',
      'drv-javier-morales',
      'drv-sarah-jenkins',
      'drv-tyler-hayes',
    ],
    auditCategory: 'POST_INCIDENT_CORRECTIVE_ACTION',
    auditMandateDescription: 'Post-Inspection Remediation & Telematics Zero-Distraction Compliance Audit',
    auditUrgency: 'MANDATORY_CRITICAL',
    auditDeadline: '2026-02-28',
    slidesCount: 12,
    quizQuestions: [
      {
        id: 'q1',
        question:
          'What constitutes legal use of a mobile phone while driving a CMV under 49 CFR § 392.82?',
        options: [
          'Holding the phone on speaker while keeping one hand on the wheel',
          'Using a hands-free headset or mounted device operated via a single touch or voice activation',
          'Reading text messages while stopped at a red light in active traffic',
          'Typing directions into GPS while traveling under 25 MPH',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Only hands-free voice-activated or single-touch systems mounted close to the driver are permitted while operating a CMV.',
      },
    ],
    totalAttendedCount: 6,
    totalAssignedCount: 6,
    fmcsaAuditCode: 'FMCSA-SM-2026-02-7711',
    transcript: [
      {
        timestamp: '00:00',
        seconds: 0,
        speaker: 'Elena Rostova (Compliance Specialist)',
        text: 'This audio briefing covers FMCSA Part 392.82 rules regarding mobile telephone bans and electronic logging.',
        keywords: ['hands-free', 'Part 392.82', 'fines'],
      },
      {
        timestamp: '06:15',
        seconds: 375,
        speaker: 'Elena Rostova (Compliance Specialist)',
        text: 'Never reach for a device in a manner that requires unfastening seatbelts or leaning away from the driving position.',
        keywords: ['reaching', 'seatbelt', 'distraction'],
      },
      {
        timestamp: '18:30',
        seconds: 1110,
        speaker: 'Elena Rostova (Compliance Specialist)',
        text: 'Always trigger hands-free voice commands via TruckWithEase AI Speech Relay before departing.',
        keywords: ['voice commands', 'AI relay'],
      },
    ],
    createdAt: '2026-02-01T08:00:00Z',
  },
  {
    id: 'sm-2026-01',
    title: 'Brake System Safety & Air Line Integrity Protocols (49 CFR § 396.11)',
    fmcsaStatute: '49 CFR § 396.11 & CVSA Level 1 Criteria',
    monthQuarter: 'January 2026 (Completed Archive)',
    status: 'COMPLETED',
    meetingLeader: 'Jeremiah Morris (Safety Director & Chief Mechanic)',
    meetingDate: '2026-01-22 09:00 AM EDT',
    durationMinutes: 28,
    durationFormatted: '28:15',
    mediaType: 'AUDIO',
    mediaUrl: 'https://cdn.truckwithease.internal/media/safety-briefings/2026-01-brake-system-audio.mp3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    audioWaveform: [30, 45, 75, 80, 60, 50, 65, 88, 90, 70, 60, 75, 85, 90, 65, 50, 45, 60, 75, 55],
    summary:
      'In-depth mechanical audit on S-cam brake stroke measurements, automatic slack adjuster limits, gladhand seal leak detection, air compressor governor cut-in/cut-out pressures (100-140 PSI), and avoiding CVSA 20% brake out-of-service violations.',
    agenda: [
      '1. 20% Brake Rule: How 2 defective brakes on a 5-axle combo trigger immediate OOS',
      '2. Measuring pushrod stroke on Type 30 standard vs long-stroke chambers',
      '3. Air pressure drop test: Max 3 PSI drop in 1 minute on straight truck / 4 PSI on combo',
      '4. Low air pressure warning buzzer test (must activate at or above 60 PSI)',
      '5. Daily DVIR brake documentation under 49 CFR § 396.11',
    ],
    mandatoryForRoles: ['ALL_DRIVERS', 'FLEET_MECHANICS'],
    assignedDriverIds: [
      'drv-marcus-vance',
      'drv-elena-rostova',
      'drv-darnell-washington',
      'drv-javier-morales',
      'drv-sarah-jenkins',
      'drv-tyler-hayes',
    ],
    auditCategory: 'CVSA_BRAKE_SAFETY',
    auditMandateDescription: 'Annual CVSA Operation Airbrake & Roadside Mechanical Audit Verification',
    auditUrgency: 'ANNUAL_STANDARD',
    auditDeadline: '2026-01-31',
    slidesCount: 15,
    quizQuestions: [
      {
        id: 'q1',
        question:
          'During the applied air brake leakage test on a tractor-trailer combination, what is the maximum allowable pressure drop in 1 minute?',
        options: ['1 PSI', '2 PSI', '4 PSI', '8 PSI'],
        correctAnswerIndex: 2,
        explanation:
          'For combination vehicles, the statutory maximum allowable leakage rate with brakes fully applied is 4 PSI in one minute.',
      },
    ],
    totalAttendedCount: 6,
    totalAssignedCount: 6,
    fmcsaAuditCode: 'FMCSA-SM-2026-01-6604',
    transcript: [
      {
        timestamp: '00:00',
        seconds: 0,
        speaker: 'Jeremiah Morris (Chief Mechanic)',
        text: 'Welcome drivers. Today we cover CVSA brake out-of-service criteria and daily DVIR checks under 49 CFR § 396.11.',
        keywords: ['brakes', 'CVSA', '396.11', 'OOS'],
      },
      {
        timestamp: '07:45',
        seconds: 465,
        speaker: 'Jeremiah Morris (Chief Mechanic)',
        text: 'If more than 20% of service brakes have excessive pushrod stroke or missing lining, the officer will issue a mandatory out-of-service order.',
        keywords: ['20% rule', 'pushrod stroke', 'out-of-service'],
      },
      {
        timestamp: '19:10',
        seconds: 1150,
        speaker: 'Jeremiah Morris (Chief Mechanic)',
        text: 'Always test low-air buzzers before leaving the terminal. It must sound off before tank pressure drops below 60 PSI.',
        keywords: ['low air buzzer', '60 PSI', 'warning device'],
      },
    ],
    createdAt: '2026-01-05T08:00:00Z',
  },
];

export const INITIAL_SAFETY_ATTENDANCE: SafetyMeetingAttendanceRecord[] = [
  {
    id: 'att-mv-2026-03',
    meetingId: 'sm-2026-03',
    meetingTitle: 'FMCSA Severe Weather & Mountain Pass Chain Controls (49 CFR § 392.14)',
    driverId: 'drv-marcus-vance',
    driverName: 'Marcus Vance',
    driverCdlNumber: 'PA-CDL-9048123-A',
    unitAssigned: 'UNIT #104-E',
    attendedAt: '2026-03-20 10:28 EDT',
    scorePercent: 100,
    passed: true,
    digitalSignature: 'Marcus Vance [Verified Biometric Voice + PIN 4192]',
    driverNotes:
      'Reviewed chain control mandates for Colorado I-70. Verified truck #104 has dual-rail chains and tensioners onboard.',
    gpsLocation: '41.1350° N, 77.7200° W (I-80 Travel Plaza, PA)',
    certificateHashSha256: '9f837261b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b',
    fmcsaCompliant: true,
    auditCategoryAssigned: 'ANNUAL_SAFETY_FITNESS_385',
  },
  {
    id: 'att-er-2026-03',
    meetingId: 'sm-2026-03',
    meetingTitle: 'FMCSA Severe Weather & Mountain Pass Chain Controls (49 CFR § 392.14)',
    driverId: 'drv-elena-rostova',
    driverName: 'Elena Rostova',
    driverCdlNumber: 'TX-CDL-4820199-A',
    unitAssigned: 'UNIT #208-T',
    attendedAt: '2026-03-20 10:32 EDT',
    scorePercent: 100,
    passed: true,
    digitalSignature: 'Elena Rostova [Verified Voice + PIN 8192]',
    driverNotes: 'Tire air pressure and winter wiper fluid checked. Anti-freeze rated to -30°F verified.',
    gpsLocation: '27.5036° N, 99.5076° W (Laredo Terminal, TX)',
    certificateHashSha256: '7a19283746b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991a',
    fmcsaCompliant: true,
    auditCategoryAssigned: 'ANNUAL_SAFETY_FITNESS_385',
  },
  {
    id: 'att-dw-2026-03',
    meetingId: 'sm-2026-03',
    meetingTitle: 'FMCSA Severe Weather & Mountain Pass Chain Controls (49 CFR § 392.14)',
    driverId: 'drv-darnell-washington',
    driverName: 'Darnell Washington',
    driverCdlNumber: 'IL-CDL-8829103-A',
    unitAssigned: 'UNIT #312-B',
    attendedAt: '2026-03-20 10:35 EDT',
    scorePercent: 100,
    passed: true,
    digitalSignature: 'Darnell Washington [Verified PIN 7712]',
    driverNotes: 'Reviewed Great Lakes lake-effect snow protocols and early parking thresholds.',
    gpsLocation: '41.8781° N, 87.6298° W (Gary Logistics Yard, IN)',
    certificateHashSha256: '6c19283746b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991c',
    fmcsaCompliant: true,
    auditCategoryAssigned: 'ANNUAL_SAFETY_FITNESS_385',
  },
];

// Local memory cache
let safetyMeetingsCache: DriverSafetyMeeting[] = [...INITIAL_SAFETY_MEETINGS];
let attendanceCache: SafetyMeetingAttendanceRecord[] = [...INITIAL_SAFETY_ATTENDANCE];

// 1. Fetch Safety Meetings
export async function fetchSafetyMeetings(): Promise<DriverSafetyMeeting[]> {
  try {
    const snap = await getDocs(collection(db, 'safety_meetings'));
    if (!snap.empty) {
      const live = snap.docs.map((d) => d.data() as DriverSafetyMeeting);
      const ids = new Set(live.map((l) => l.id));
      const merged = [...live, ...INITIAL_SAFETY_MEETINGS.filter((m) => !ids.has(m.id))];
      safetyMeetingsCache = merged;
      return merged;
    }
  } catch (err) {
    console.warn('Firestore notice on fetchSafetyMeetings, using local archive:', err);
  }
  return safetyMeetingsCache;
}

// 2. Save / Update Safety Meeting
export async function saveSafetyMeeting(meeting: DriverSafetyMeeting): Promise<boolean> {
  const idx = safetyMeetingsCache.findIndex((m) => m.id === meeting.id);
  if (idx >= 0) {
    safetyMeetingsCache[idx] = meeting;
  } else {
    safetyMeetingsCache.unshift(meeting);
  }

  try {
    const docRef = doc(db, 'safety_meetings', meeting.id);
    await setDoc(
      docRef,
      {
        ...meeting,
        updatedAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn('Saved safety meeting to local state:', err);
    return true;
  }
}

// 3. Record Attendance
export async function recordMeetingAttendance(record: SafetyMeetingAttendanceRecord): Promise<boolean> {
  const idx = attendanceCache.findIndex((a) => a.id === record.id);
  if (idx >= 0) {
    attendanceCache[idx] = record;
  } else {
    attendanceCache.unshift(record);
  }

  const meetingIdx = safetyMeetingsCache.findIndex((m) => m.id === record.meetingId);
  if (meetingIdx >= 0) {
    safetyMeetingsCache[meetingIdx].totalAttendedCount =
      (safetyMeetingsCache[meetingIdx].totalAttendedCount || 0) + 1;
  }

  try {
    const docRef = doc(db, 'safety_meeting_attendance', record.id);
    await setDoc(
      docRef,
      {
        ...record,
        updatedAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn('Saved meeting attendance record to local state:', err);
    return true;
  }
}

// 4. Fetch Attendance Records
export async function fetchAttendanceRecords(filterDriverId?: string): Promise<SafetyMeetingAttendanceRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'safety_meeting_attendance'));
    if (!snap.empty) {
      const live = snap.docs.map((d) => d.data() as SafetyMeetingAttendanceRecord);
      const ids = new Set(live.map((l) => l.id));
      const merged = [...live, ...INITIAL_SAFETY_ATTENDANCE.filter((a) => !ids.has(a.id))];
      attendanceCache = merged;
      if (filterDriverId) {
        return merged.filter((a) => a.driverId === filterDriverId);
      }
      return merged;
    }
  } catch (err) {
    console.warn('Firestore notice on fetchAttendanceRecords, using local archive:', err);
  }

  if (filterDriverId) {
    return attendanceCache.filter((a) => a.driverId === filterDriverId);
  }
  return attendanceCache;
}

// 5. Assign Mandatory Attendance to Specific Drivers for FMCSA Audits
export async function assignMandatoryAttendance(
  meetingId: string,
  driverIds: string[],
  auditCategory: SafetyMeetingAuditCategory,
  deadlineDate: string,
  urgency: 'MANDATORY_CRITICAL' | 'URGENT' | 'ANNUAL_STANDARD'
): Promise<DriverSafetyMeeting | null> {
  const meeting = safetyMeetingsCache.find((m) => m.id === meetingId);
  if (!meeting) return null;

  const currentAssigned = new Set(meeting.assignedDriverIds || []);
  driverIds.forEach((id) => currentAssigned.add(id));

  const updated: DriverSafetyMeeting = {
    ...meeting,
    assignedDriverIds: Array.from(currentAssigned),
    auditCategory,
    auditDeadline: deadlineDate,
    auditUrgency: urgency,
    totalAssignedCount: currentAssigned.size,
  };

  await saveSafetyMeeting(updated);
  return updated;
}
