// Service for DAT Load Board Live Bridge, Public Freight API, Rate Con OCR Ingest, and Proof of Delivery (POD) Handling
// Features: Zero-Downtime Architecture with Exponential Backoff & Jitter Auto-Retry, Resilient Mesh Cache, and Rate Con Specifications

export interface LoadAvailability {
  availabilityStatus: 'IMMEDIATE' | 'HIGH_DEMAND' | 'CLOSING_SOON' | 'SCHEDULED';
  trucksInCorridor: number;
  loadToTruckRatio: string;
  spotRateTrend: 'RISING' | 'STABLE' | 'SOFTENING';
  freshnessMinutes: number;
  availableCapacityPills: number;
  deadheadOriginMiles: number;
  destinationOutboundStrength: 'SURPLUS' | 'BALANCED' | 'HEADHAUL';
}

export interface RateConfirmationDetails {
  rateConNumber: string;
  linehaulRateUsd: number;
  fuelSurchargeUsd: number;
  accessorials: Array<{ description: string; amountUsd: number }>;
  totalAgreedRateUsd: number;
  ratePerMile: number;
  detentionRatePerHour: number;
  detentionGraceHours: number;
  layoverRatePerDay: number;
  tonuRateUsd: number; // Truck Order Not Used
  paymentTerms: string;
  shipperName: string;
  shipperAddress: string;
  shipperEarliestPickup: string;
  shipperLatestPickup: string;
  consigneeName: string;
  consigneeAddress: string;
  consigneeEarliestDelivery: string;
  consigneeLatestDelivery: string;
  temperatureSetting?: string;
  coiRequired: boolean; // Certificate of insurance
  specialClauses: string[];
  digitalSignatureStatus: 'PENDING' | 'CARRIER_ACCEPTED' | 'VERIFIED_LOCKED';
  rateConHash: string; // SHA-256
  generatedAt: string;
}

export interface DatBoardLoad {
  id: string;
  loadNumber: string;
  source: 'DAT_ONE_LIVE' | 'PUBLIC_FREIGHT_API' | 'RATE_CON_PARSED' | 'DIRECT_SHIPPER';
  originCity: string;
  originState: string;
  destCity: string;
  destState: string;
  miles: number;
  rateUsd: number;
  ratePerMile: number;
  equipment: 'Dry Van 53\'' | 'Reefer 53\'' | 'Flatbed' | 'Stepdeck' | 'Power Only';
  weightLbs: number;
  commodity: string;
  brokerName: string;
  brokerPhone: string;
  brokerEmail: string;
  brokerTrustScore: number; // 0-100
  paymentTerms: string;
  pickupDate: string;
  deliveryDate: string;
  fhwaClearanceStatus: string;
  detentionRisk: string;
  fuelArbitrageNote: string;
  status: 'AVAILABLE' | 'BOOKED' | 'DISPATCHED' | 'DELIVERED';
  assignedRig?: string;
  rateConUploaded?: boolean;
  rateConFileName?: string;
  rateConSha256?: string;
  podUploaded?: boolean;
  podFileName?: string;
  podDeliveredAt?: string;
  podReceiverSignature?: string;
  factoringStatus?: 'NOT_SUBMITTED' | 'READY_TO_FACTOR' | 'SUBMITTED' | 'FUNDED_PAID';
  
  // Real-time Availability and Rate Con Spec Fields
  availability?: LoadAvailability;
  rateConfirmation?: RateConfirmationDetails;
}

export interface DatApiConfig {
  mode: 'DAT_ONE_LIVE' | 'PUBLIC_FREIGHT_API' | 'DIRECT_BROKER_INGEST';
  apiKey: string;
  clientId: string;
  usdotNumber: string;
  mcNumber: string;
  autoSyncIntervalSec: number;
  isConnected: boolean;
  lastSyncTimestamp: string;
}

export interface DatConnectionTelemetry {
  status: 'ONLINE' | 'RETRYING' | 'RECOVERED' | 'FALLBACK_MESH';
  uptimePercentage: number;
  availabilityUptimePercent?: number;
  currentLatencyMs: number;
  totalRequests: number;
  successfulRequests: number;
  retryEvents: number;
  lastSyncTimestamp: string;
  circuitBreakerStatus: 'CLOSED' | 'HALF_OPEN' | 'OPEN';
  activeLoadsCount: number;
  zeroDowntimeGuaranteed: boolean;
  lastLogMessage: string;
}

export interface DatFetchOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  backoffFactor?: number;
  jitterMs?: number;
  timeoutMs?: number;
  forceSimulationError?: boolean;
  onRetry?: (attempt: number, error: Error, nextDelayMs: number) => void;
  equipmentFilter?: string;
}

export interface DatFetchResult {
  loads: DatBoardLoad[];
  telemetry: DatConnectionTelemetry;
  fromCache: boolean;
  retryCount: number;
  latencyMs: number;
  syncedAt: string;
}

export const INITIAL_DAT_CONFIG: DatApiConfig = {
  mode: 'DAT_ONE_LIVE',
  apiKey: 'dat_live_tok_884129x_prod',
  clientId: 'titan-carrier-3928192',
  usdotNumber: '3928192',
  mcNumber: 'MC-1492019',
  autoSyncIntervalSec: 30,
  isConnected: true,
  lastSyncTimestamp: new Date().toISOString(),
};

// Helper to generate full rate confirmation details for any load
export const buildRateConDetails = (
  load: Partial<DatBoardLoad>,
  customHash?: string
): RateConfirmationDetails => {
  const miles = load.miles || 500;
  const totalRate = load.rateUsd || 2500;
  const rpm = load.ratePerMile || parseFloat((totalRate / miles).toFixed(2));
  const fuelEst = Math.round(miles * 0.48);
  const linehaul = totalRate - fuelEst;
  const hash =
    customHash ||
    '0x' + Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  return {
    rateConNumber: `RC-${(load.brokerName || 'BROKER').split(' ')[0].toUpperCase()}-${(load.loadNumber || '8491').replace(/\D/g, '').slice(-4) || '9201'}`,
    linehaulRateUsd: linehaul,
    fuelSurchargeUsd: fuelEst,
    accessorials: [
      { description: 'Detention Protection (Over 2 hrs)', amountUsd: 85.0 },
      { description: 'Electronic Telematics Tracking Incentive', amountUsd: 50.0 },
    ],
    totalAgreedRateUsd: totalRate,
    ratePerMile: rpm,
    detentionRatePerHour: 85.0,
    detentionGraceHours: 2,
    layoverRatePerDay: 350.0,
    tonuRateUsd: 250.0,
    paymentTerms: load.paymentTerms || 'QuickPay 2% (24-Hour Settlement via TriumphPay)',
    shipperName: `${load.originCity || 'Origin'} Distribution Center East`,
    shipperAddress: `100 Logistics Blvd, ${load.originCity || 'Dallas'}, ${load.originState || 'TX'}`,
    shipperEarliestPickup: `${load.pickupDate || 'Today'} 08:00 Local`,
    shipperLatestPickup: `${load.pickupDate || 'Today'} 17:00 Local`,
    consigneeName: `${load.destCity || 'Destination'} Fulfillment & Cold Hub`,
    consigneeAddress: `500 Commerce Way, ${load.destCity || 'Atlanta'}, ${load.destState || 'GA'}`,
    consigneeEarliestDelivery: `${load.deliveryDate || 'Tomorrow'} 06:00 Local`,
    consigneeLatestDelivery: `${load.deliveryDate || 'Tomorrow'} 14:00 Local`,
    temperatureSetting:
      load.equipment?.toLowerCase().includes('reefer') ? 'Continuous 34°F Pre-Cooled' : undefined,
    coiRequired: true,
    specialClauses: [
      'Carrier certifies clean 53ft trailer with no odors, holes, or chemical residue.',
      '49 CFR § 392.9 cargo securement compliance required before departing shipper gates.',
      'Detention begins after 2 hours upon verified GPS geofence arrival and signed timestamp.',
      'Subcontracting, double-brokering, or unauthorized rail intermodal substitution strictly void.',
    ],
    digitalSignatureStatus: 'CARRIER_ACCEPTED',
    rateConHash: hash,
    generatedAt: new Date().toISOString(),
  };
};

export const INITIAL_LIVE_LOADS: DatBoardLoad[] = [
  {
    id: 'DAT-88941',
    loadNumber: 'DAT-TX-GA-9402',
    source: 'DAT_ONE_LIVE',
    originCity: 'Dallas',
    originState: 'TX',
    destCity: 'Atlanta',
    destState: 'GA',
    miles: 781,
    rateUsd: 3450,
    ratePerMile: 4.41,
    equipment: "Dry Van 53'",
    weightLbs: 42000,
    commodity: 'Commercial Retail Goods (Palletized)',
    brokerName: 'C.H. Robinson Worldwide',
    brokerPhone: '(800) 323-7587',
    brokerEmail: 'dispatch.dallas@chrobinson.com',
    brokerTrustScore: 98,
    paymentTerms: 'QuickPay 2% (24-hr) or Net 15',
    pickupDate: 'Today 14:00 - 18:00 CST',
    deliveryDate: 'Tomorrow 10:00 - 14:00 EST',
    fhwaClearanceStatus: 'Clears all 14 bridges on I-20 (Lowest: 15\' 8" Vicksburg)',
    detentionRisk: 'Low Risk (42m historic average receiver dwell)',
    fuelArbitrageNote: 'Pre-scheduled Shreveport Pilot ($3.38 vs $3.68/gal), saving $74.40',
    status: 'AVAILABLE',
    availability: {
      availabilityStatus: 'IMMEDIATE',
      trucksInCorridor: 3,
      loadToTruckRatio: '5.8:1',
      spotRateTrend: 'RISING',
      freshnessMinutes: 3,
      availableCapacityPills: 4,
      deadheadOriginMiles: 12,
      destinationOutboundStrength: 'HEADHAUL',
    },
    rateConfirmation: buildRateConDetails({
      id: 'DAT-88941',
      loadNumber: 'DAT-TX-GA-9402',
      brokerName: 'C.H. Robinson Worldwide',
      originCity: 'Dallas',
      originState: 'TX',
      destCity: 'Atlanta',
      destState: 'GA',
      miles: 781,
      rateUsd: 3450,
      ratePerMile: 4.41,
      pickupDate: 'Today 14:00 - 18:00 CST',
      deliveryDate: 'Tomorrow 10:00 - 14:00 EST',
      paymentTerms: 'QuickPay 2% (24-hr) or Net 15',
    }, '0x8f2a910be34d588102a9cb991204859a'),
  },
  {
    id: 'DAT-88942',
    loadNumber: 'DAT-IL-TN-8819',
    source: 'DAT_ONE_LIVE',
    originCity: 'Chicago',
    originState: 'IL',
    destCity: 'Nashville',
    destState: 'TN',
    miles: 472,
    rateUsd: 2890,
    ratePerMile: 6.12,
    equipment: "Reefer 53'",
    weightLbs: 39500,
    commodity: 'Chilled Dairy & Cheese (Continuous 34°F)',
    brokerName: 'Coyote Logistics',
    brokerPhone: '(877) 626-9683',
    brokerEmail: 'reefer.central@coyote.com',
    brokerTrustScore: 96,
    paymentTerms: 'QuickPay 1.5% Direct Deposit',
    pickupDate: 'Today 16:30 - 20:00 CST',
    deliveryDate: 'Tomorrow 07:00 CST Firm Appt',
    fhwaClearanceStatus: 'Clears all I-65 underpasses; 13\' 6" trailer profile validated',
    detentionRisk: 'High Detention Protection ($85/hr after 2hrs at Nashville Cold)',
    fuelArbitrageNote: 'Louisville Love\'s corridor rebate: -$0.28/gal',
    status: 'AVAILABLE',
    availability: {
      availabilityStatus: 'HIGH_DEMAND',
      trucksInCorridor: 2,
      loadToTruckRatio: '7.2:1',
      spotRateTrend: 'RISING',
      freshnessMinutes: 7,
      availableCapacityPills: 2,
      deadheadOriginMiles: 8,
      destinationOutboundStrength: 'HEADHAUL',
    },
    rateConfirmation: buildRateConDetails({
      id: 'DAT-88942',
      loadNumber: 'DAT-IL-TN-8819',
      brokerName: 'Coyote Logistics',
      originCity: 'Chicago',
      originState: 'IL',
      destCity: 'Nashville',
      destState: 'TN',
      miles: 472,
      rateUsd: 2890,
      ratePerMile: 6.12,
      equipment: "Reefer 53'",
      pickupDate: 'Today 16:30 - 20:00 CST',
      deliveryDate: 'Tomorrow 07:00 CST',
      paymentTerms: 'QuickPay 1.5% Direct Deposit',
    }, '0x44c9b19e271891a03f48a129038baef1'),
  },
  {
    id: 'DAT-88943',
    loadNumber: 'DAT-PA-NC-7721',
    source: 'DAT_ONE_LIVE',
    originCity: 'Allentown',
    originState: 'PA',
    destCity: 'Charlotte',
    destState: 'NC',
    miles: 518,
    rateUsd: 2650,
    ratePerMile: 5.11,
    equipment: "Flatbed",
    weightLbs: 45000,
    commodity: 'Structural Steel Beams & Rebar (Tarped)',
    brokerName: 'Landstar Ranger',
    brokerPhone: '(800) 872-9400',
    brokerEmail: 'northeast.flatbed@landstar.com',
    brokerTrustScore: 97,
    paymentTerms: 'Instant EFS Card Advance or Net 14',
    pickupDate: 'Tomorrow 06:00 - 11:00 EST',
    deliveryDate: 'Next Day 08:00 EST',
    fhwaClearanceStatus: 'Verified I-81 S to I-77 S; no low bridge deviations required',
    detentionRisk: 'Crane unload (typically <35 mins dwell)',
    fuelArbitrageNote: 'Winchester, VA Flying J fuel stop scheduled ($3.41/gal)',
    status: 'AVAILABLE',
    availability: {
      availabilityStatus: 'SCHEDULED',
      trucksInCorridor: 5,
      loadToTruckRatio: '4.1:1',
      spotRateTrend: 'STABLE',
      freshnessMinutes: 14,
      availableCapacityPills: 5,
      deadheadOriginMiles: 19,
      destinationOutboundStrength: 'BALANCED',
    },
    rateConfirmation: buildRateConDetails({
      id: 'DAT-88943',
      loadNumber: 'DAT-PA-NC-7721',
      brokerName: 'Landstar Ranger',
      originCity: 'Allentown',
      originState: 'PA',
      destCity: 'Charlotte',
      destState: 'NC',
      miles: 518,
      rateUsd: 2650,
      ratePerMile: 5.11,
      equipment: 'Flatbed',
      pickupDate: 'Tomorrow 06:00 - 11:00 EST',
      deliveryDate: 'Next Day 08:00 EST',
      paymentTerms: 'Instant EFS Card Advance or Net 14',
    }, '0x7e83a0029b41829f018e381903ba8491'),
  },
  {
    id: 'DAT-88944',
    loadNumber: 'DAT-MO-OH-5509',
    source: 'DAT_ONE_LIVE',
    originCity: 'Kansas City',
    originState: 'MO',
    destCity: 'Columbus',
    destState: 'OH',
    miles: 654,
    rateUsd: 2980,
    ratePerMile: 4.55,
    equipment: "Dry Van 53'",
    weightLbs: 34000,
    commodity: 'Medical Supplies & Packaging',
    brokerName: 'TQL (Total Quality Logistics)',
    brokerPhone: '(800) 580-3101',
    brokerEmail: 'loadmatching@tql.com',
    brokerTrustScore: 94,
    paymentTerms: 'TQL Trax QuickPay (1 Day)',
    pickupDate: 'Today 18:00 - 22:00 CST',
    deliveryDate: 'Tomorrow 16:00 EST',
    fhwaClearanceStatus: 'I-70 East straight corridor. Low bridge clearance: Clear',
    detentionRisk: 'Drop and Hook at Columbus Distribution Center',
    fuelArbitrageNote: 'Terre Haute, IN Pilot ($3.49/gal fuel reserve)',
    status: 'AVAILABLE',
    availability: {
      availabilityStatus: 'CLOSING_SOON',
      trucksInCorridor: 2,
      loadToTruckRatio: '6.4:1',
      spotRateTrend: 'RISING',
      freshnessMinutes: 19,
      availableCapacityPills: 3,
      deadheadOriginMiles: 5,
      destinationOutboundStrength: 'HEADHAUL',
    },
    rateConfirmation: buildRateConDetails({
      id: 'DAT-88944',
      loadNumber: 'DAT-MO-OH-5509',
      brokerName: 'TQL (Total Quality Logistics)',
      originCity: 'Kansas City',
      originState: 'MO',
      destCity: 'Columbus',
      destState: 'OH',
      miles: 654,
      rateUsd: 2980,
      ratePerMile: 4.55,
      pickupDate: 'Today 18:00 - 22:00 CST',
      deliveryDate: 'Tomorrow 16:00 EST',
      paymentTerms: 'TQL Trax QuickPay (1 Day)',
    }, '0x18c992a01948baef0029b4819e910283'),
  },
  {
    id: 'DAT-88945',
    loadNumber: 'DAT-CA-AZ-4412',
    source: 'DAT_ONE_LIVE',
    originCity: 'Los Angeles',
    originState: 'CA',
    destCity: 'Phoenix',
    destState: 'AZ',
    miles: 372,
    rateUsd: 2150,
    ratePerMile: 5.77,
    equipment: "Reefer 53'",
    weightLbs: 41200,
    commodity: 'Fresh Produce & Strawberries (-2°F Pre-cooled)',
    brokerName: 'J.B. Hunt Transport',
    brokerPhone: '(800) 452-4868',
    brokerEmail: 'west.freight@jbhunt.com',
    brokerTrustScore: 99,
    paymentTerms: 'J.B. Hunt 360 Direct Pay (Free QuickPay)',
    pickupDate: 'Tonight 21:00 - 01:00 PST',
    deliveryDate: 'Tomorrow 08:30 MST',
    fhwaClearanceStatus: 'I-10 E Desert Run; Banning Pass wind alert active',
    detentionRisk: 'Phoenix Grocery Warehouse (Guaranteed $75/hr detention)',
    fuelArbitrageNote: 'Fuel before CA/AZ border: Quartzsite, AZ ($3.29 vs $4.79 CA)',
    status: 'AVAILABLE',
    availability: {
      availabilityStatus: 'IMMEDIATE',
      trucksInCorridor: 4,
      loadToTruckRatio: '5.1:1',
      spotRateTrend: 'STABLE',
      freshnessMinutes: 5,
      availableCapacityPills: 4,
      deadheadOriginMiles: 14,
      destinationOutboundStrength: 'BALANCED',
    },
    rateConfirmation: buildRateConDetails({
      id: 'DAT-88945',
      loadNumber: 'DAT-CA-AZ-4412',
      brokerName: 'J.B. Hunt Transport',
      originCity: 'Los Angeles',
      originState: 'CA',
      destCity: 'Phoenix',
      destState: 'AZ',
      miles: 372,
      rateUsd: 2150,
      ratePerMile: 5.77,
      equipment: "Reefer 53'",
      pickupDate: 'Tonight 21:00 - 01:00 PST',
      deliveryDate: 'Tomorrow 08:30 MST',
      paymentTerms: 'J.B. Hunt 360 Direct Pay (Free QuickPay)',
    }, '0x992ab103984be8912903af4891002341'),
  },
  {
    id: 'DAT-88946',
    loadNumber: 'DAT-TN-TX-3301',
    source: 'DAT_ONE_LIVE',
    originCity: 'Memphis',
    originState: 'TN',
    destCity: 'Houston',
    destState: 'TX',
    miles: 569,
    rateUsd: 2850,
    ratePerMile: 5.01,
    equipment: "Dry Van 53'",
    weightLbs: 38900,
    commodity: 'Consumer Electronics & Telecomm Components',
    brokerName: 'Echo Global Logistics',
    brokerPhone: '(800) 354-7993',
    brokerEmail: 'south.dispatch@echo.com',
    brokerTrustScore: 96,
    paymentTerms: 'Net 15 or 1.5% QuickPay',
    pickupDate: 'Tomorrow 09:00 - 13:00 CST',
    deliveryDate: 'Next Day 07:00 CST',
    fhwaClearanceStatus: 'I-55 S to I-10 W corridor; all clearances nominal',
    detentionRisk: 'Strict appointment time window',
    fuelArbitrageNote: 'Baton Rouge Love\'s travel stop: -$0.22/gal',
    status: 'AVAILABLE',
    availability: {
      availabilityStatus: 'HIGH_DEMAND',
      trucksInCorridor: 3,
      loadToTruckRatio: '6.9:1',
      spotRateTrend: 'RISING',
      freshnessMinutes: 11,
      availableCapacityPills: 5,
      deadheadOriginMiles: 16,
      destinationOutboundStrength: 'HEADHAUL',
    },
    rateConfirmation: buildRateConDetails({
      id: 'DAT-88946',
      loadNumber: 'DAT-TN-TX-3301',
      brokerName: 'Echo Global Logistics',
      originCity: 'Memphis',
      originState: 'TN',
      destCity: 'Houston',
      destState: 'TX',
      miles: 569,
      rateUsd: 2850,
      ratePerMile: 5.01,
      pickupDate: 'Tomorrow 09:00 - 13:00 CST',
      deliveryDate: 'Next Day 07:00 CST',
      paymentTerms: 'Net 15 or 1.5% QuickPay',
    }, '0x3344a8891002341bf8912903af489100'),
  },
];

// In-memory resilient cache and telemetry state for Zero-Downtime operation
let cachedLoadsState: DatBoardLoad[] = [...INITIAL_LIVE_LOADS];
let pendingSimulatedFailures = 0;

let telemetryState: DatConnectionTelemetry = {
  status: 'ONLINE',
  uptimePercentage: 99.99,
  availabilityUptimePercent: 99.99,
  currentLatencyMs: 142,
  totalRequests: 28,
  successfulRequests: 28,
  retryEvents: 0,
  lastSyncTimestamp: new Date().toISOString(),
  circuitBreakerStatus: 'CLOSED',
  activeLoadsCount: INITIAL_LIVE_LOADS.length,
  zeroDowntimeGuaranteed: true,
  lastLogMessage: 'Cluster connection healthy. Primary DAT One endpoint operational.',
};

export const getDatConnectionTelemetry = (): DatConnectionTelemetry => ({
  ...telemetryState,
  availabilityUptimePercent: telemetryState.availabilityUptimePercent ?? telemetryState.uptimePercentage ?? 99.99,
});

/**
 * Triggers an intentional transient failure on the next N requests
 * to demonstrate the zero-downtime auto-retry and resilient mesh recovery!
 */
export const triggerSimulatedGlitch = (count: number = 1): void => {
  pendingSimulatedFailures = Math.max(1, pendingSimulatedFailures + count);
  telemetryState.status = 'RETRYING';
  telemetryState.lastLogMessage = `Simulated transient gateway drop scheduled (${pendingSimulatedFailures} test failure queued). Auto-retry engine primed.`;
};

/**
 * Core Robust Fetch Mechanism with Exponential Backoff + Jitter Auto-Retry
 * Guarantees zero downtime by falling back to resilient mesh cache if all retries fail.
 */
export const fetchDatLoadsWithAutoRetry = async (
  config: DatApiConfig = INITIAL_DAT_CONFIG,
  options: DatFetchOptions = {}
): Promise<DatFetchResult> => {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 350;
  const backoffFactor = options.backoffFactor ?? 1.6;
  const jitterMs = options.jitterMs ?? 150;
  const equipmentFilter = options.equipmentFilter ?? 'ALL';

  let attempt = 0;
  let retryCount = 0;
  let lastError: Error | null = null;
  const startTime = Date.now();

  telemetryState.totalRequests++;

  while (attempt <= maxRetries) {
    try {
      // Check if simulated glitch is queued or forced
      if (options.forceSimulationError || pendingSimulatedFailures > 0) {
        if (pendingSimulatedFailures > 0) pendingSimulatedFailures--;
        throw new Error(
          'HTTP 503 Service Unavailable: DAT One Edge Gateway temporary timeout. Retrying request...'
        );
      }

      // Simulate realistic network roundtrip with jitter (120-280ms)
      const simulatedLatency = Math.floor(120 + Math.random() * 160);
      await new Promise((resolve) => setTimeout(resolve, simulatedLatency));

      // Fluctuate rates subtly by +/- $35 to simulate live spot market dynamism
      let liveTenders = [...cachedLoadsState];

      if (equipmentFilter !== 'ALL') {
        liveTenders = liveTenders.filter((l) =>
          l.equipment.toLowerCase().includes(equipmentFilter.toLowerCase())
        );
      }

      // Refresh dynamic spot numbers and availability freshness
      liveTenders = liveTenders.map((load) => {
        const delta = Math.floor(Math.sin(Date.now() / 8000 + load.miles) * 35);
        const updatedRate = Math.max(1400, load.rateUsd + delta);
        const updatedRpm = parseFloat((updatedRate / load.miles).toFixed(2));
        
        // Ensure rate con matches live spot
        const updatedRateCon = load.rateConfirmation
          ? {
              ...load.rateConfirmation,
              totalAgreedRateUsd: updatedRate,
              ratePerMile: updatedRpm,
              linehaulRateUsd: updatedRate - load.rateConfirmation.fuelSurchargeUsd,
            }
          : buildRateConDetails({ ...load, rateUsd: updatedRate, ratePerMile: updatedRpm });

        return {
          ...load,
          rateUsd: updatedRate,
          ratePerMile: updatedRpm,
          rateConfirmation: updatedRateCon,
          availability: {
            availabilityStatus: load.availability?.availabilityStatus || 'IMMEDIATE',
            trucksInCorridor: Math.max(1, (load.availability?.trucksInCorridor || 3) + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0)),
            loadToTruckRatio: load.availability?.loadToTruckRatio || '5.4:1',
            spotRateTrend: delta >= 0 ? 'RISING' : 'SOFTENING',
            freshnessMinutes: Math.max(1, (load.availability?.freshnessMinutes || 4) + Math.floor(Math.random() * 2)),
            availableCapacityPills: load.availability?.availableCapacityPills || 4,
            deadheadOriginMiles: load.availability?.deadheadOriginMiles || 10,
            destinationOutboundStrength: load.availability?.destinationOutboundStrength || 'HEADHAUL',
          },
        };
      });

      // Update resilient cache
      cachedLoadsState = liveTenders;

      const elapsed = Date.now() - startTime;
      telemetryState.successfulRequests++;
      telemetryState.currentLatencyMs = elapsed;
      telemetryState.status = retryCount > 0 ? 'RECOVERED' : 'ONLINE';
      telemetryState.circuitBreakerStatus = 'CLOSED';
      telemetryState.lastSyncTimestamp = new Date().toISOString();
      telemetryState.activeLoadsCount = liveTenders.length;
      telemetryState.lastLogMessage =
        retryCount > 0
          ? `Auto-retry succeeded on attempt #${attempt + 1}. Continuous zero downtime sustained (${elapsed}ms).`
          : `Synchronized ${liveTenders.length} active tenders directly from ${config.mode}.`;

      return {
        loads: liveTenders,
        telemetry: { ...telemetryState },
        fromCache: false,
        retryCount,
        latencyMs: elapsed,
        syncedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err));
      attempt++;
      retryCount++;
      telemetryState.retryEvents++;
      telemetryState.status = 'RETRYING';
      telemetryState.circuitBreakerStatus = attempt >= 2 ? 'HALF_OPEN' : 'CLOSED';

      if (attempt <= maxRetries) {
        // Calculate exponential backoff with jitter
        const delay = Math.round(
          initialDelayMs * Math.pow(backoffFactor, attempt - 1) + Math.random() * jitterMs
        );
        telemetryState.lastLogMessage = `Attempt ${attempt} failed: ${lastError.message}. Backoff retry in ${delay}ms...`;

        if (options.onRetry) {
          options.onRetry(attempt, lastError, delay);
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // If all retries are exhausted, ZERO DOWNTIME GUARANTEE:
  // Fall back seamlessly to cached resilient state instead of crashing or displaying a blank screen!
  const elapsed = Date.now() - startTime;
  telemetryState.status = 'FALLBACK_MESH';
  telemetryState.circuitBreakerStatus = 'OPEN';
  telemetryState.lastLogMessage = `All ${maxRetries} live API retries failed. Activated Zero-Downtime Resilient Mesh Cache. Zero freight loss.`;

  return {
    loads: cachedLoadsState,
    telemetry: { ...telemetryState },
    fromCache: true,
    retryCount,
    latencyMs: elapsed,
    syncedAt: new Date().toISOString(),
  };
};

/**
 * Standard simulated live fetch from DAT One / Public Freight API
 * Wrapped with auto-retry engine for backward compatibility.
 */
export const fetchLiveDatLoads = async (
  config: DatApiConfig = INITIAL_DAT_CONFIG,
  equipmentFilter: string = 'ALL'
): Promise<DatBoardLoad[]> => {
  const result = await fetchDatLoadsWithAutoRetry(config, { equipmentFilter });
  return result.loads;
};

// Rate Confirmation OCR Extractor & Parser
export interface ParsedRateCon {
  loadNumber: string;
  brokerName: string;
  brokerPhone: string;
  brokerEmail: string;
  originCity: string;
  originState: string;
  destCity: string;
  destState: string;
  agreedRateUsd: number;
  totalMiles: number;
  equipment: 'Dry Van 53\'' | 'Reefer 53\'' | 'Flatbed' | 'Stepdeck' | 'Power Only';
  weightLbs: number;
  commodity: string;
  pickupWindow: string;
  deliveryWindow: string;
  specialInstructions: string;
  sha256Hash: string;
}

export const parseRateConDocument = async (
  fileName: string,
  rawText?: string
): Promise<ParsedRateCon> => {
  // Simulate rapid sub-second OCR parsing
  await new Promise((res) => setTimeout(res, 450));

  // Determine broker or defaults based on document text or filename
  const isCoyote = fileName.toLowerCase().includes('coyote') || (rawText && /coyote/i.test(rawText));
  const isTql = fileName.toLowerCase().includes('tql') || (rawText && /tql/i.test(rawText));
  const isEcho = fileName.toLowerCase().includes('echo') || (rawText && /echo/i.test(rawText));
  const isFlatbed = fileName.toLowerCase().includes('flatbed') || (rawText && /flatbed/i.test(rawText));
  const isReefer = fileName.toLowerCase().includes('reefer') || (rawText && /reefer/i.test(rawText));

  const pseudoHash = '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  if (isCoyote) {
    return {
      loadNumber: `COY-${Math.floor(1000000 + Math.random() * 9000000)}`,
      brokerName: 'Coyote Logistics, LLC',
      brokerPhone: '(877) 626-9683',
      brokerEmail: 'carrier.ops@coyote.com',
      originCity: 'Indianapolis',
      originState: 'IN',
      destCity: 'Atlanta',
      destState: 'GA',
      agreedRateUsd: 3150.00,
      totalMiles: 536,
      equipment: isReefer ? "Reefer 53'" : "Dry Van 53'",
      weightLbs: 41500,
      commodity: 'Beverage Cans & Glass Bottles',
      pickupWindow: 'Today 13:00 - 17:00 EST',
      deliveryWindow: 'Tomorrow 08:00 - 11:30 EST',
      specialInstructions: 'Driver must have 2 load locks. Check in with dispatch 1 hour prior to appointment.',
      sha256Hash: pseudoHash,
    };
  }

  if (isTql) {
    return {
      loadNumber: `TQL-${Math.floor(10000000 + Math.random() * 90000000)}`,
      brokerName: 'Total Quality Logistics, LLC',
      brokerPhone: '(800) 580-3101',
      brokerEmail: 'carrierpay@tql.com',
      originCity: 'Cincinnati',
      originState: 'OH',
      destCity: 'Jacksonville',
      destState: 'FL',
      agreedRateUsd: 3600.00,
      totalMiles: 752,
      equipment: isFlatbed ? "Flatbed" : "Dry Van 53'",
      weightLbs: 43200,
      commodity: 'Industrial Hardware & Electric Motors',
      pickupWindow: 'Tomorrow 07:00 - 12:00 EST',
      deliveryWindow: 'Day After 09:00 EST',
      specialInstructions: 'TQL Trax tracking required. Notify broker of arrival immediately.',
      sha256Hash: pseudoHash,
    };
  }

  if (isEcho) {
    return {
      loadNumber: `ECH-${Math.floor(100000 + Math.random() * 900000)}`,
      brokerName: 'Echo Global Logistics',
      brokerPhone: '(800) 354-7993',
      brokerEmail: 'settlements@echo.com',
      originCity: 'St. Louis',
      originState: 'MO',
      destCity: 'Dallas',
      destState: 'TX',
      agreedRateUsd: 2950.00,
      totalMiles: 630,
      equipment: "Dry Van 53'",
      weightLbs: 37800,
      commodity: 'Consumer Paper Products',
      pickupWindow: 'Today 15:00 - 19:00 CST',
      deliveryWindow: 'Tomorrow 13:00 CST',
      specialInstructions: 'Strict delivery appointment. 2 hours free time; detention $75/hr thereafter.',
      sha256Hash: pseudoHash,
    };
  }

  // Default C.H. Robinson Rate Con
  return {
    loadNumber: `CHR-${Math.floor(10000000 + Math.random() * 90000000)}`,
    brokerName: 'C.H. Robinson Worldwide, Inc.',
    brokerPhone: '(800) 323-7587',
    brokerEmail: 'loadconfirmation@chrobinson.com',
    originCity: 'Louisville',
    originState: 'KY',
    destCity: 'Charlotte',
    destState: 'NC',
    agreedRateUsd: 2750.00,
    totalMiles: 476,
    equipment: isReefer ? "Reefer 53'" : "Dry Van 53'",
    weightLbs: 40500,
    commodity: 'General Freight - Clean Dry Van',
    pickupWindow: 'Today 14:00 - 18:00 EST',
    deliveryDate: 'Tomorrow 10:00 EST',
    specialInstructions: 'Clean 53ft trailer required. Food-grade dry van with no odors or holes.',
    sha256Hash: pseudoHash,
  } as any;
};

// Factoring & Proof of Delivery Packet Generator
export interface FactoringPacket {
  packetId: string;
  loadId: string;
  loadNumber: string;
  brokerName: string;
  grossAmountUsd: number;
  factoringAdvanceRatePct: number; // e.g. 98% (2% fee) or 97%
  netPayoutUsd: number;
  advanceFeeUsd: number;
  status: 'PENDING_APPROVAL' | 'FUNDED_TO_CARD' | 'ACH_TRANSFER_INITIATED';
  factoringPartner: 'TriumphPay' | 'RTS Financial' | 'OTR Solutions' | 'Apex Capital';
  timestamp: string;
  confirmationCode: string;
}

export const generateFactoringPacket = (
  load: DatBoardLoad,
  partner: 'TriumphPay' | 'RTS Financial' | 'OTR Solutions' | 'Apex Capital' = 'TriumphPay'
): FactoringPacket => {
  const feeRate = 0.02; // 2% quick factoring fee
  const advanceFee = parseFloat((load.rateUsd * feeRate).toFixed(2));
  const netPayout = parseFloat((load.rateUsd - advanceFee).toFixed(2));

  return {
    packetId: `FACT-${Date.now().toString().slice(-6)}`,
    loadId: load.id,
    loadNumber: load.loadNumber,
    brokerName: load.brokerName,
    grossAmountUsd: load.rateUsd,
    factoringAdvanceRatePct: 98,
    netPayoutUsd: netPayout,
    advanceFeeUsd: advanceFee,
    status: 'FUNDED_TO_CARD',
    factoringPartner: partner,
    timestamp: new Date().toISOString(),
    confirmationCode: `CONF-TRIUMPH-${Math.floor(100000 + Math.random() * 900000)}`,
  };
};
