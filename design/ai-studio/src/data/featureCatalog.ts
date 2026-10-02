import { FeatureItem, TabType, UserRoleType, AdminRevocationRecord, FeatureGovernanceData } from '../types';

export type { AdminRevocationRecord, FeatureGovernanceData };

export const ALL_FEATURES_CATALOG: FeatureItem[] = [
  // 1. COMMAND & DISPATCH
  {
    id: 'overview-ad',
    name: 'Platform Overview & Fleet Billboard',
    shortLabel: 'Overview',
    category: 'COMMAND & DISPATCH',
    description: 'Executive overview, platform capabilities, fleet live operational billboard, and architecture showcase.',
    badge: 'LIVE',
    defaultEnabledForRoles: ['admin', 'dispatch', 'driver', 'safety', 'mechanic'],
    impactLevel: 'CONVENIENCE',
  },
  {
    id: 'core-console',
    name: 'Truckwithease Sovereign Core Console',
    shortLabel: 'Core Console',
    category: 'COMMAND & DISPATCH',
    description: 'Real-time telemetry feeds, latency probe, security metrics, and master system terminal.',
    badge: 'V4.19',
    defaultEnabledForRoles: ['admin', 'dispatch', 'safety'],
    impactLevel: 'CRITICAL',
  },
  {
    id: 'orchestrator',
    name: 'Master Launch Cockpit & Tier Pipeline',
    shortLabel: 'Launch Cockpit',
    category: 'COMMAND & DISPATCH',
    description: 'Operational tier launcher (T1 In-Cab to T5 Deployment), pipeline orchestrator, and real-time mesh routing.',
    badge: 'T5',
    defaultEnabledForRoles: ['admin', 'dispatch'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'cockpit',
    name: 'Mobile & Multi-OS Radar Cockpit',
    shortLabel: 'Mobile Cockpit',
    category: 'COMMAND & DISPATCH',
    description: 'Adaptive driver cockpit with live radar sweeps, speed alerts, and multi-OS simulator.',
    badge: 'MULTI-OS',
    defaultEnabledForRoles: ['admin', 'driver', 'dispatch'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'goat',
    name: 'G.O.A.T. Certified Freight Load Board',
    shortLabel: 'G.O.A.T. Loads',
    category: 'COMMAND & DISPATCH',
    description: 'Real-time load marketplace, broker rates, spot market yield calculations, and load bids.',
    badge: 'PRICING',
    defaultEnabledForRoles: ['admin', 'dispatch', 'driver'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'tolls-bypass',
    name: 'Nationwide 50-State Tolls & Drivewyze PreClear Bypass',
    shortLabel: '50-State Tolls',
    category: 'COMMAND & DISPATCH',
    description: 'All 50 states electronic tolling directory, transponder passports, and Drivewyze PreClear weigh station bypass hub.',
    badge: '900+ SITES',
    defaultEnabledForRoles: ['admin', 'dispatch', 'driver', 'safety'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'ai-studio',
    name: 'In-Cab Voice Transcriber & Fleet Visual Studio',
    shortLabel: 'AI Voice & Images',
    category: 'COMMAND & DISPATCH',
    description: 'Microphone speech-to-text dictation via gemini-3.5-transcribe and prompt-guided commercial fleet image generation and editing via gemini-3.1-flash-image-preview.',
    badge: 'GEMINI 3.5',
    defaultEnabledForRoles: ['admin', 'dispatch', 'driver', 'safety', 'mechanic'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'load-sheets',
    name: '80,000 lbs Axle Weight Optimizer & Load Sheets',
    shortLabel: '80K Load Sheets',
    category: 'COMMAND & DISPATCH',
    description: 'Steer (12K), Drive (34K), and Tandem (34K) bridge weight calculator and digital BOL load sheets.',
    badge: 'AXLE 80K',
    defaultEnabledForRoles: ['admin', 'dispatch', 'driver'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'quantum-optimizer',
    name: 'Multi-State Quantum Route & Rate Optimizer',
    shortLabel: 'Route Optimizer',
    category: 'COMMAND & DISPATCH',
    description: 'Autonomous multi-drop solver, toll avoidance, deadhead minimization, and net profit maximizer.',
    badge: 'SOLVER',
    defaultEnabledForRoles: ['admin', 'dispatch'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'agents',
    name: 'Autonomous AI Dispatch & Safety Agent Swarm',
    shortLabel: 'AI Agent Swarm',
    category: 'COMMAND & DISPATCH',
    description: '8 autonomous agents coordinating fleet yield, compliance audits, load negotiation, and roadside triage.',
    badge: '8 LIVE',
    defaultEnabledForRoles: ['admin', 'dispatch', 'safety'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'dispatch',
    name: 'Dispatch Zero Automated Freight Engine',
    shortLabel: 'Dispatch Zero',
    category: 'COMMAND & DISPATCH',
    description: 'Automated $/hour driver load allocations, detention trackers, and tamper-proof dispatch signatures.',
    badge: 'LIVE',
    defaultEnabledForRoles: ['admin', 'dispatch'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'parking',
    name: 'Truck Parking Intelligence & SMS Radar',
    shortLabel: 'Truck Parking',
    category: 'COMMAND & DISPATCH',
    description: 'Real-time rest area parking space availability, truck stop amenities, and A2P SMS reservations.',
    badge: 'A2P',
    defaultEnabledForRoles: ['admin', 'driver', 'dispatch'],
    impactLevel: 'CONVENIENCE',
  },

  // 2. IN-CAB SAFETY & COMMS
  {
    id: 'telecom',
    name: 'In-Cab Dedicated Telephony Lines',
    shortLabel: 'Cab Phone Lines',
    category: 'IN-CAB SAFETY & COMMS',
    description: 'Direct dedicated phone lines ($12.50/mo), SIP trunking, call recording, and broker privacy masking.',
    badge: '$12.50/MO',
    defaultEnabledForRoles: ['admin', 'driver', 'dispatch'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'nighthud',
    name: 'Driver Night HUD & High-Contrast Safe Mode',
    shortLabel: 'Night HUD',
    category: 'IN-CAB SAFETY & COMMS',
    description: 'Glare-free OLED night vision HUD with high-contrast clocks, speed gauges, and voice commands.',
    badge: 'DOT 49 CFR',
    defaultEnabledForRoles: ['admin', 'driver'],
    impactLevel: 'CRITICAL',
  },
  {
    id: 'messaging',
    name: 'In-Cab Safe-Text, Fleet Comms & CB Radio',
    shortLabel: 'Fleet Comms & CB',
    category: 'IN-CAB SAFETY & COMMS',
    description: 'Hands-free 49 CFR § 392.82 safe messaging, CB radio Ch-19 live channel, and dispatcher text dispatch.',
    badge: 'LIVE CHAT',
    defaultEnabledForRoles: ['admin', 'driver', 'dispatch', 'safety', 'mechanic'],
    impactLevel: 'CRITICAL',
  },
  {
    id: 'cinema',
    name: 'Sleeper Berth Cinema Lounge & YouTube Player',
    shortLabel: 'Sleeper Cinema',
    category: 'IN-CAB SAFETY & COMMS',
    description: 'Entertainment media center for driver rest periods with automated 49 CFR § 392.82 park-state interlock.',
    badge: 'YOUTUBE',
    defaultEnabledForRoles: ['admin', 'driver'],
    impactLevel: 'ENTERTAINMENT',
  },
  {
    id: 'telemetry',
    name: 'FHWA Bridge Clearance Radar & Overhead Sensors',
    shortLabel: 'Bridge Radar',
    category: 'IN-CAB SAFETY & COMMS',
    description: '7,869 low-clearance bridge structure database (Item 54B) with automated detour diverters.',
    badge: 'FHWA',
    defaultEnabledForRoles: ['admin', 'driver', 'safety'],
    impactLevel: 'CRITICAL',
  },
  {
    id: 'hos',
    name: 'Hours of Service (HOS) & e-Logs 4-Clock Suite',
    shortLabel: 'HOS e-Logs',
    category: 'IN-CAB SAFETY & COMMS',
    description: 'FMCSA certified 4-clock ELD countdown, 8-day recap, CSV inspection export, and DOT eRODS transfer.',
    badge: 'DOT',
    isMandatoryStatutory: true,
    defaultEnabledForRoles: ['admin', 'driver', 'dispatch', 'safety'],
    impactLevel: 'CRITICAL',
  },
  {
    id: 'haptics',
    name: 'FMCSA SPE-2025 Tactile Haptics Suite',
    shortLabel: 'Haptics Suite',
    category: 'IN-CAB SAFETY & COMMS',
    description: 'Vibrational transducer seat alerts for deaf and hard-of-hearing drivers complying with FMCSA directives.',
    badge: 'TACTILE',
    defaultEnabledForRoles: ['admin'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'eld-audit',
    name: 'ELD Hardware Audit & Raw Telemetry Stream',
    shortLabel: 'ELD Hardware Audit',
    category: 'IN-CAB SAFETY & COMMS',
    description: 'Generic ELD hardware connection (Bluetooth/USB HID), raw CAN-bus J1939 telemetry visualizer, real-time engine diagnostics, and database duty-cycle synchronization.',
    badge: 'USB/BLE',
    defaultEnabledForRoles: ['admin', 'driver', 'safety', 'mechanic'],
    impactLevel: 'CRITICAL',
  },

  // 3. AI ADVOCATE & COMPLIANCE
  {
    id: 'fleet-chief',
    name: 'Fleet Chief AI Master Truck & Trailer Mechanic',
    shortLabel: 'Fleet Chief',
    category: 'AI ADVOCATE & COMPLIANCE',
    description: 'Master-level heavy-duty diagnostics for tractors and commercial trailers — real mechanic answers by make, model, year, and J1939 fault codes.',
    badge: 'MECHANIC',
    defaultEnabledForRoles: ['admin', 'mechanic', 'driver', 'safety', 'dispatch'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'health-chief',
    name: 'Health Chief DOT Physical & Biometrics Coach (49 CFR § 391)',
    shortLabel: 'Health Chief',
    category: 'AI ADVOCATE & COMPLIANCE',
    description: 'Proactive medical compliance, biometric vitals tracking, DOT medical card countdown, and NRCME exam protection.',
    badge: 'DOT CARD',
    defaultEnabledForRoles: ['admin', 'driver', 'safety'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'dvir-agent',
    name: 'Autonomous DVIR & Hands-Free Roadside Agent',
    shortLabel: 'DVIR Agent',
    category: 'AI ADVOCATE & COMPLIANCE',
    description: '49 CFR § 396.11 voice-activated pre-trip/post-trip inspections and immediate breakdown triage.',
    badge: 'PRE/POST',
    isMandatoryStatutory: true,
    defaultEnabledForRoles: ['admin', 'driver', 'mechanic', 'safety'],
    impactLevel: 'CRITICAL',
  },
  {
    id: 'equipment-agent',
    name: 'Titan-RLD #1 Heavy Rig Equipment Diagnostics',
    shortLabel: 'Titan Equipment',
    category: 'AI ADVOCATE & COMPLIANCE',
    description: 'Real-time J1939 ECM CAN-bus telemetry, active DTC fault code cleared/alert logs, and PM scheduling.',
    badge: '#1 RIG',
    defaultEnabledForRoles: ['admin', 'mechanic', 'driver', 'safety'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'quantum-compliance',
    name: 'Predictive DOT Roadside Inspection Simulator',
    shortLabel: 'DOT Scenario Sim',
    category: 'AI ADVOCATE & COMPLIANCE',
    description: 'Level I-VI inspection checklist simulator, officer script walkthrough, and violation risk scoring.',
    badge: 'DOT-OPT',
    defaultEnabledForRoles: ['admin', 'safety', 'driver'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'traxes',
    name: 'Traxes AI Regulatory Advocate & Policy Voice',
    shortLabel: 'Traxes AI',
    category: 'AI ADVOCATE & COMPLIANCE',
    description: 'Instant sub-second statutory legal guidance on FMCSA, OSHA, and state DOT commercial vehicle statutes.',
    badge: '1.4s SLA',
    defaultEnabledForRoles: ['admin', 'driver', 'safety', 'dispatch'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'vault',
    name: 'Security Vault, Ledger & HSM Cryptography',
    shortLabel: 'Security Vault',
    category: 'AI ADVOCATE & COMPLIANCE',
    description: 'Tamper-proof HMAC SHA-256 block ledger, carrier key store, and digital audit seal verification.',
    badge: 'SHA-256',
    defaultEnabledForRoles: ['admin', 'safety'],
    impactLevel: 'CRITICAL',
  },
  {
    id: 'compliance',
    name: 'Regulatory Compliance & Certificate Vault',
    shortLabel: 'Compliance Vault',
    category: 'AI ADVOCATE & COMPLIANCE',
    description: 'COI Insurance BMC-91X, Operating Authority MC-991204, BOC-3, and W-9 document management.',
    badge: 'FMCSA',
    defaultEnabledForRoles: ['admin', 'safety', 'dispatch'],
    impactLevel: 'CRITICAL',
  },
  {
    id: 'drive',
    name: 'Google Drive Fleet Document Synchronization',
    shortLabel: 'Google Drive',
    category: 'AI ADVOCATE & COMPLIANCE',
    description: 'Secure cloud folder sync for rate confirmations, signed proof-of-deliveries (PODs), and receipts.',
    badge: 'DRIVE',
    defaultEnabledForRoles: ['admin', 'dispatch', 'safety'],
    impactLevel: 'CONVENIENCE',
  },
  {
    id: 'gmail',
    name: 'Gmail Fleet Communications & Dispatch Messaging',
    shortLabel: 'Gmail Comms',
    category: 'AI ADVOCATE & COMPLIANCE',
    description: 'Read, compose, search, and send fleet DVIR reports, rate confirmations, and FMCSA safety notices.',
    badge: 'GMAIL',
    defaultEnabledForRoles: ['admin', 'dispatch', 'driver', 'safety'],
    impactLevel: 'CONVENIENCE',
  },

  // 4. FLEET & OPERATIONS
  {
    id: 'rewards',
    name: 'EaseRewards Driver Loyalty & Operational Badges',
    shortLabel: 'EaseRewards',
    category: 'FLEET & OPERATIONS',
    description: 'Driver loyalty program: earn points for safe miles, clean inspections, and DVIRs. Redeem for fuel credits, subscription discounts, and badges.',
    badge: 'POINTS',
    defaultEnabledForRoles: ['admin', 'driver', 'safety', 'dispatch'],
    impactLevel: 'CONVENIENCE',
  },
  {
    id: 'drivers',
    name: 'Driver HR, Onboarding & DQF Vault (49 CFR Part 391)',
    shortLabel: 'Driver HR & DQF',
    category: 'FLEET & OPERATIONS',
    description: 'Driver qualification files, instant DMV MVR checks, FMCSA Clearinghouse queries, and road tests.',
    badge: 'DQF/MVR',
    defaultEnabledForRoles: ['admin', 'safety', 'dispatch'],
    impactLevel: 'CRITICAL',
  },
  {
    id: 'assets',
    name: 'Fleet Assets, Power Units & DOT Decals (49 CFR § 396)',
    shortLabel: 'Fleet Assets',
    category: 'FLEET & OPERATIONS',
    description: 'Tractor and trailer inventory, VIN tracking, telematics binding, and annual DOT sticker expiries.',
    badge: 'VIN/DOT',
    defaultEnabledForRoles: ['admin', 'mechanic', 'dispatch', 'safety'],
    impactLevel: 'CRITICAL',
  },
  {
    id: 'maintenance',
    name: 'Fleet Maintenance DVIR & Work Order Logs',
    shortLabel: 'Maintenance',
    category: 'FLEET & OPERATIONS',
    description: 'Work order tickets, mechanic sign-offs, parts replacement tracking, and PM preventive intervals.',
    badge: 'DIAG',
    defaultEnabledForRoles: ['admin', 'mechanic', 'safety'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'ifta',
    name: 'IFTA Fuel Tax Automated GPS Audit Engine',
    shortLabel: 'IFTA Fuel Tax',
    category: 'FLEET & OPERATIONS',
    description: 'Automated state-by-state GPS odometer tracking, fuel purchase receipt match, and quarterly IFTA filing.',
    badge: 'GPS TAX',
    defaultEnabledForRoles: ['admin', 'safety', 'dispatch'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'fuel-idle',
    name: 'Fleet Fuel & Idle Efficiency Heatmap & Geographic Hotspots',
    shortLabel: 'Fuel & Idle Map',
    category: 'FLEET & OPERATIONS',
    description: 'Recharts thermal heatmaps, hourly fuel burn loss vs MPG analytics, and geographic high-idle terminal clusters.',
    badge: 'HEATMAP',
    defaultEnabledForRoles: ['admin', 'safety', 'dispatch', 'mechanic'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'ecosystem',
    name: 'Ecosystem Trust Hub & Highway Verification',
    shortLabel: 'Trust Hub',
    category: 'FLEET & OPERATIONS',
    description: 'Highway carrier identity verification (99.8% trust score), active certificates, and webhook sentinel.',
    badge: 'TRUST',
    defaultEnabledForRoles: ['admin', 'safety', 'dispatch'],
    impactLevel: 'CRITICAL',
  },

  // 5. STORE & TOOLS
  {
    id: 'admin-console',
    name: 'Executive Fleet Admin & Governance Portal',
    shortLabel: 'Admin Portal',
    category: 'STORE & TOOLS',
    description: 'Proprietary portal for Jeremiah J. Morris: store packaging adjustments, function governance, integrations mesh, and cryptographic security ledger.',
    badge: 'MASTER',
    defaultEnabledForRoles: ['admin'],
    impactLevel: 'CRITICAL',
  },
  {
    id: 'hub',
    name: 'Integrated Mesh Telematics Hub & API Relay',
    shortLabel: 'Telemetry Hub',
    category: 'STORE & TOOLS',
    description: 'Samsara, Geotab, Motive, and KeepTruckin live hardware ingestion pipelines with sub-millisecond pings.',
    badge: 'MESH',
    defaultEnabledForRoles: ['admin'],
    impactLevel: 'OPERATIONAL',
  },
  {
    id: 'packaging',
    name: 'Enterprise Storefront & Tier Subscriptions',
    shortLabel: 'Storefront',
    category: 'STORE & TOOLS',
    description: 'Tier subscriptions ($12.50/mo in-cab telecom, $49/mo enterprise carrier), add-ons, and payment plans.',
    badge: 'TIERS',
    defaultEnabledForRoles: ['admin'],
    impactLevel: 'CONVENIENCE',
  },
  {
    id: 'providers',
    name: 'Certified Telematics & Sensor Providers',
    shortLabel: 'Hardware Providers',
    category: 'STORE & TOOLS',
    description: 'Catalog of approved IoT sensors, OBD-II CAN readers, tire pressure monitors, and temperature probes.',
    badge: 'DEVICES',
    defaultEnabledForRoles: ['admin', 'mechanic'],
    impactLevel: 'CONVENIENCE',
  },
  {
    id: 'security',
    name: 'Security Sentinel & Cellular Spoof Interceptor',
    shortLabel: 'Security Sentinel',
    category: 'STORE & TOOLS',
    description: 'Cellular cell-tower vs GPS coordinate cross-check to prevent spoofing, hijacking, and freight fraud.',
    badge: 'SENTINEL',
    defaultEnabledForRoles: ['admin'],
    impactLevel: 'CRITICAL',
  },
  {
    id: 'tutorials',
    name: 'Step-by-Step Interactive Tutorials & Training',
    shortLabel: 'Tutorials & Guides',
    category: 'STORE & TOOLS',
    description: 'Interactive guides, live endpoint sandbox testers, and compliance certification training walkthroughs.',
    badge: 'TRAIN',
    defaultEnabledForRoles: ['admin', 'dispatch', 'driver', 'safety', 'mechanic'],
    impactLevel: 'CONVENIENCE',
  },
];

const STORAGE_KEY_USER_PREFS = 'twe_user_feature_preferences';
const STORAGE_KEY_ADMIN_REVOCATIONS = 'twe_admin_feature_revocations';
const STORAGE_KEY_MANDATORY_LOCKS = 'twe_carrier_mandatory_features';

export const INITIAL_MANDATORY_FEATURES: TabType[] = ['hos', 'dvir-agent', 'messaging'];

export const INITIAL_ADMIN_REVOCATIONS: Record<string, AdminRevocationRecord> = {
  driver: {
    targetId: 'driver',
    targetType: 'ROLE',
    targetName: 'Standard Driver Profile',
    revokedFeatures: ['quantum-optimizer', 'packaging', 'vault'],
    reasonNotes: 'Restricted high-level billing and core quantum load dispatching from driver cab view.',
    updatedAt: new Date().toISOString(),
    updatedBy: 'Fleet Admin (Superuser)',
  },
  'drv-05': {
    targetId: 'drv-05',
    targetType: 'USER',
    targetName: 'Elena Rostova (Trainee Driver #504)',
    revokedFeatures: ['cinema', 'quantum-optimizer', 'packaging'],
    reasonNotes: 'Probationary safety period: Sleeper Cinema disabled until 90-day clean inspection milestone.',
    updatedAt: new Date().toISOString(),
    updatedBy: 'Fleet Admin (Superuser)',
  },
  dispatch: {
    targetId: 'dispatch',
    targetType: 'ROLE',
    targetName: 'Central Dispatch Desk',
    revokedFeatures: ['cinema', 'nighthud'],
    reasonNotes: 'In-cab sleep and night HUD tools deactivated on central dispatch consoles.',
    updatedAt: new Date().toISOString(),
    updatedBy: 'Fleet Admin (Superuser)',
  },
};

/** Load User Preferences from LocalStorage */
export function getSavedUserPreferences(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_PREFS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading user feature prefs:', err);
  }
  // Default: all features marked true unless default role prohibits
  const initial: Record<string, boolean> = {};
  ALL_FEATURES_CATALOG.forEach((f) => {
    initial[f.id] = true;
  });
  return initial;
}

/** Save User Preferences to LocalStorage */
export function saveUserPreferences(prefs: Record<string, boolean>): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER_PREFS, JSON.stringify(prefs));
  } catch (err) {
    console.error('Failed saving user feature prefs:', err);
  }
}

/** Load Admin Revocations from LocalStorage */
export function getSavedAdminRevocations(): Record<string, AdminRevocationRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_REVOCATIONS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading admin revocations:', err);
  }
  return INITIAL_ADMIN_REVOCATIONS;
}

/** Save Admin Revocations to LocalStorage */
export function saveAdminRevocations(revocations: Record<string, AdminRevocationRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_REVOCATIONS, JSON.stringify(revocations));
  } catch (err) {
    console.error('Failed saving admin revocations:', err);
  }
}

/** Check if a feature is allowed and visible for a specific role/user */
export function isFeatureAllowedForUser(
  featureId: TabType,
  userRole: UserRoleType | string = 'admin',
  userId?: string,
  adminRevocations?: Record<string, AdminRevocationRecord>,
  userPreferences?: Record<string, boolean>,
  mandatoryLocks?: TabType[]
): {
  isAllowed: boolean;
  isVisibleInNav: boolean;
  isMandatory: boolean;
  isRevokedByAdmin: boolean;
  revocationReason?: string;
  isTurnedOffByUser: boolean;
} {
  const catalogItem = ALL_FEATURES_CATALOG.find((f) => f.id === featureId);
  const revs = adminRevocations || getSavedAdminRevocations();
  const prefs = userPreferences || getSavedUserPreferences();
  const locks = mandatoryLocks || INITIAL_MANDATORY_FEATURES;

  const isMandatory = Boolean(catalogItem?.isMandatoryStatutory || locks.includes(featureId));

  // Admins have full access and cannot be revoked
  if (userRole === 'admin') {
    const isTurnedOffByUser = prefs[featureId] === false && !isMandatory;
    return {
      isAllowed: true,
      isVisibleInNav: !isTurnedOffByUser,
      isMandatory,
      isRevokedByAdmin: false,
      isTurnedOffByUser,
    };
  }

  // Check if revoked by specific user ID
  let isRevoked = false;
  let revocationReason = '';

  if (userId && revs[userId]?.revokedFeatures?.includes(featureId)) {
    isRevoked = true;
    revocationReason = revs[userId].reasonNotes || 'Feature revoked by Administrator for this user.';
  } else if (revs[userRole]?.revokedFeatures?.includes(featureId)) {
    isRevoked = true;
    revocationReason = revs[userRole].reasonNotes || `Feature revoked by Administrator for ${userRole} role.`;
  }

  // If revoked by admin, user cannot see or use it
  if (isRevoked) {
    return {
      isAllowed: false,
      isVisibleInNav: false,
      isMandatory: false,
      isRevokedByAdmin: true,
      revocationReason,
      isTurnedOffByUser: false,
    };
  }

  // If mandatory, it is always allowed and visible
  if (isMandatory) {
    return {
      isAllowed: true,
      isVisibleInNav: true,
      isMandatory: true,
      isRevokedByAdmin: false,
      isTurnedOffByUser: false,
    };
  }

  // Check user personal toggle preference
  const isTurnedOffByUser = prefs[featureId] === false;

  return {
    isAllowed: true,
    isVisibleInNav: !isTurnedOffByUser,
    isMandatory: false,
    isRevokedByAdmin: false,
    isTurnedOffByUser,
  };
}
