export type TabType =
  | 'highway-samsara'
  | 'nighthud'
  | 'orchestrator'
  | 'goat'
  | 'quantum-optimizer'
  | 'quantum-compliance'
  | 'equipment-agent'
  | 'cockpit'
  | 'ecosystem'
  | 'vault'
  | 'agents'
  | 'drivers'
  | 'assets'
  | 'messaging'
  | 'cinema'
  | 'tutorials'
  | 'telemetry'
  | 'hos'
  | 'haptics'
  | 'parking'
  | 'dispatch'
  | 'maintenance'
  | 'ifta'
  | 'traxes'
  | 'compliance'
  | 'load-sheets'
  | 'dvir-agent'
  | 'telecom'
  | 'hub'
  | 'packaging'
  | 'providers'
  | 'security'
  | 'overview-ad'
  | 'core-console'
  | 'eld-audit'
  | 'azuga-eld-sales'
  | 'fuel-idle'
  | 'admin-console'
  | 'drive'
  | 'gmail'
  | 'tolls-bypass'
  | 'heartbeat'
  | 'non-cdl'
  | 'insurance'
  | 'ai-studio'
  | 'health-chief'
  | 'fleet-chief'
  | 'rewards'
  | 'road-test'
  | 'roadside-inspections'
  | 'apex-avionics'
  | 'safety-meetings'
  | 'cb-radio'
  | 'insurance-partners'
  | 'nextgen-innovations'
  | 'quantum-sensing'
  | 'executive-reports';

export interface InsuranceAgencyPartner {
  id: string;
  name: string;
  agencyType: 'INDEPENDENT_BROKER' | 'NATIONAL_CARRIER' | 'INSURTECH_MGA' | 'SPECIALTY_FLEET_AGENCY';
  headquarters: string;
  statesLicensed: string[]; // e.g. ["ALL_50_STATES"] or ["TX", "CA", "FL", "IL", "GA", "OH"]
  npnNumber: string; // National Producer Number
  phone: string;
  email: string;
  website: string;
  partnerPromoCode: string;
  discountPercentageMax: number; // e.g. 35
  averageAnnualSavingsPerTruck: number; // e.g. $3,450
  acceptedHaulerTypes: string[]; // e.g. ["Dry Van", "Reefer", "Flatbed", "Hazmat", "Hotshot", "New Authority"]
  minTelematicsScoreRequired: number; // e.g. 70
  apiIntegrationSupported: boolean;
  instantBindingAvailable: boolean;
  newAuthorityFriendly: boolean;
  underwritingCarriers: string[]; // e.g. ["Canal", "Progressive", "Sentry", "Northland", "Great American"]
  verifiedPartner: boolean;
  rating: number; // 4.9
  reviewCount: number;
  description: string;
}

export interface CarrierTelematicsSafetyProfile {
  dotNumber: string;
  mcNumber: string;
  companyName: string;
  telematicsSafetyScore: number; // 0 - 100
  tier: 'PLATINUM_FLEET' | 'GOLD_FLEET' | 'SILVER_FLEET' | 'STANDARD';
  discountEligiblePercent: number; // e.g. 32%
  harshBrakingPer1000Mi: number; // e.g. 0.4
  speedCompliancePct: number; // e.g. 98.6%
  hosAuditCleanPct: number; // e.g. 99.8%
  cleanDvirRatePct: number; // e.g. 100%
  annualEstimatedMiles: number; // e.g. 115,000
  totalPowerUnits: number; // e.g. 4
  certificateHashSha256: string;
  certificateIssueDate: string;
  consentGrantedToPartners: boolean;
}

export interface InsuranceQuoteRequest {
  id: string;
  timestamp: string;
  partnerId: string;
  partnerName: string;
  carrierDot: string;
  carrierMc: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  fleetSize: number;
  coverageTypes: ('AUTO_LIABILITY' | 'PHYSICAL_DAMAGE' | 'CARGO_INSURANCE' | 'GENERAL_LIABILITY' | 'BOBTAIL_NON_TRUCKING')[];
  currentAnnualPremium: number;
  estimatedDiscountedPremium: number;
  telematicsScoreSubmitted: number;
  status: 'SUBMITTED' | 'UNDERWRITER_REVIEW' | 'BINDING_OFFER_READY' | 'POLICY_BOUND';
  notes?: string;
}

export interface InsuranceAgentPartnerApplication {
  id: string;
  agencyName: string;
  principalAgentName: string;
  npnNumber: string;
  licenseStates: string[];
  agencyEmail: string;
  agencyPhone: string;
  agencyWebsite: string;
  amsSystemUsed: 'Applied Epic' | 'Vertafore AMS360' | 'EZLynx' | 'HawkSoft' | 'Proprietary' | 'Other';
  referralModelPreference: 'CLIENT_DISCOUNT_ONLY' | 'REVENUE_SHARE_COMMISSION' | 'HYBRID';
  applicationTimestamp: string;
  status: 'PENDING_VERIFICATION' | 'APPROVED_ACTIVE';
  generatedPartnerCode: string;
  generatedApiKey: string;
}

export interface CommercialPolicyRecord {
  id: string;
  policyType: 'AUTO_LIABILITY' | 'MOTOR_TRUCK_CARGO' | 'PHYSICAL_DAMAGE' | 'GENERAL_LIABILITY';
  carrierUnderwriter: string;
  policyNumber: string;
  agencyName: string;
  agentContact: string;
  agentPhone: string;
  coverageLimit: string; // e.g. "$1,000,000 CSL"
  deductible: string; // e.g. "$2,500"
  effectiveDate: string;
  expirationDate: string;
  daysRemaining: number;
  annualPremium: number;
  telematicsDiscountAppliedPct: number;
  coiDocumentUrl?: string;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'RENEWAL_PENDING';
}

// ================= QUANTUM RISK SCORING ENGINE INTERFACES =================

export interface QuantumTelematicsVector {
  harshBrakingPer1000Mi: number; // e.g. 0.35 events
  rapidAccelPer1000Mi: number; // e.g. 0.28 events
  speedCompliancePct: number; // e.g. 98.7%
  excessiveSpeedMinutesPer100Mi: number; // e.g. 0.4 mins
  lateralGForceEvents: number; // e.g. 0.15 / 1000 mi
  nightDrivingExposurePct: number; // e.g. 12.5% (12am-5am)
  headwayRadarAlertsPer100Mi: number; // e.g. 0.45
  ptoIdleExcessHours: number; // e.g. 0.9 hrs/day
}

export interface QuantumCarrierSafetyVector {
  dotNumber: string;
  carrierName: string;
  fmcsaUnsafeDrivingPercentile: number; // 0-100, lower is better (e.g. 12%)
  fmcsaHosCompliancePercentile: number; // e.g. 6%
  fmcsaCrashIndicatorPercentile: number; // e.g. 4%
  fmcsaVehicleMaintPercentile: number; // e.g. 15%
  outOfServiceRatePct: number; // e.g. 2.8% (vs 21.4% national avg)
  dvirDefectCorrectionRatePct: number; // e.g. 99.8%
  driverTurnoverAnnualPct: number; // e.g. 16.5%
  yearsInActiveAuthority: number; // e.g. 5.8
}

export interface QuantumInsuranceRiskProfileVector {
  fleetSize: number; // e.g. 4 trucks
  operatingRadius: 'LOCAL_100MI' | 'REGIONAL_500MI' | 'LONG_HAUL_OTR_NATIONWIDE';
  cargoRiskClass: 'GENERAL_FREIGHT' | 'REFRIGERATED_FOODS' | 'BUILDING_MATERIALS' | 'HAZMAT_CHEM';
  priorLossClaimsLast3Years: number; // e.g. 0
  annualMileagePerTruck: number; // e.g. 115000
  eldTamperResistanceScore: number; // 0-100, e.g. 99
  baseEstimatedAnnualPremiumPerTruck: number; // e.g. $14,200
}

export interface QuantumRiskScoreBreakdown {
  telematicsRiskComponent: number; // 0-100 scale (weighted 45%)
  carrierSafetyHistoryComponent: number; // 0-100 scale (weighted 35%)
  insuranceProfileComponent: number; // 0-100 scale (weighted 20%)
  compositeQuantumRiskScore: number; // 0-100 scale (lower score = lower risk = higher discount)
  quantumSafetyScore: number; // 0-100 scale (inverse: 100 - riskScore, higher is better)
  quantumSafetyTier: 'QUANTUM_DIAMOND' | 'QUANTUM_PLATINUM' | 'QUANTUM_GOLD' | 'QUANTUM_STANDARD' | 'ELEVATED_RISK';
  actuarialRiskMultiplier: number; // 0.62x to 1.35x
  dynamicPremiumDiscountPct: number; // e.g. 34.5% discount
  estimatedAnnualSavingsPerTruck: number; // e.g. $4,899
  totalFleetAnnualSavings: number; // e.g. $19,596
  telematicsConfidenceIndex: number; // e.g. 98.6%
  riskTrend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
  keyRiskMitigators: string[];
  underwritingRecommendations: string[];
  partnerCarrierBids: {
    partnerId: string;
    partnerName: string;
    quotedDiscountPct: number;
    annualSavingsFleet: number;
    instantBindingEligible: boolean;
    tierRating: string;
  }[];
  calculatedAt: string;
}

export interface V2xSpatialSector {
  id: string;
  name: string;
  distanceFt: number;
  timeBufferSec: number;
  status: 'CLEAR' | 'CAUTION' | 'WARNING' | 'CRITICAL_HAZARD';
  targetType?: string;
  relativeSpeedMph?: number;
  description: string;
}

export interface IftaFuelArbitrageStation {
  id: string;
  stationName: string;
  brand: 'Pilot Flying J' | "Love's" | 'TA Petro' | 'Sapp Bros' | 'Independent';
  state: string;
  interstateHighway: string;
  exitNumber: string;
  distanceMiles: number;
  pumpPricePerGallon: number;
  stateExciseTax: number;
  iftaCreditAdjustment: number;
  trueNetPricePerGallon: number;
  estimatedNetSavingsPer150Gal: number;
  openTruckParkingSpaces: number;
  defAtPump: boolean;
  cleanShowersAvailable: number;
  catCertifiedScales: boolean;
  bypassRecommendation: 'OPTIMAL_FILL_STOP' | 'SECONDARY_OPTION' | 'AVOID_TAX_SURCHARGE';
}

export interface AcousticDiagnosticComponent {
  id: string;
  componentName: string;
  category: 'STEERING_BEARINGS' | 'TURBOCHARGER' | 'SCR_DEF_DOSER' | 'DPF_EXHAUST' | 'DRIVELINE';
  sensorFrequencyKhz: number;
  vibrationRms: number;
  healthScorePercent: number;
  status: 'OPTIMAL' | 'MONITOR' | 'ACTION_REQUIRED';
  estimatedMilesRemaining: number;
  recommendation: string;
}

export type OperatingTier =
  | 'TIER_1_CAB'
  | 'TIER_2_DISPATCH'
  | 'TIER_3_MAINTENANCE'
  | 'TIER_4_TRAXES'
  | 'TIER_5_DEPLOYMENT';

export interface PipelineItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  status: '200 OK' | 'KEY PRESENT' | '401 EXPIRED' | '503 DEGRADED';
  latencyMs: number;
  iconName: string;
  actionRequired?: 'verify' | 'renew';
}

export interface PinnedTelemetryStream {
  id: string;
  title: string;
  subtitle: string;
  category: 'RADAR' | 'HOS' | 'IDENTITY' | 'TELEMATICS' | 'DISPATCH' | 'SECURITY' | 'GIS' | 'AUDIO';
  metricValue: string;
  metricLabel: string;
  statusLabel: string;
  statusCode: '200 OK' | 'ACTIVE' | 'STREAMING' | 'SECURE';
  latencyMs: number;
  source: string;
  pinnedAt: string;
  targetTab?: TabType;
  endpointUrl?: string;
  sparkline?: number[];
  statuteCitation?: string;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  source: 'Highway' | 'Samsara' | 'Geotab' | 'GIS Engine' | 'Sentinel';
  event: string;
  status: 200 | 201 | 400 | 401;
  latencyMs: number;
  payloadPreview: string;
  signature: string;
}

export interface LowBridgeHazard {
  id: string;
  route: string;
  mileMarker: string;
  clearanceInches: number;
  clearanceFormatted: string;
  location: string;
  status: 'CRITICAL' | 'RESTRICTED' | 'WARNING';
  detourVector: string;
  fhwaCode: string;
  lat: number;
  lng: number;
}

export interface ProviderItem {
  id: string;
  name: string;
  category: 'Identity' | 'ELD / Telematics' | 'GIS & Toll' | 'Speech & AI' | 'Supply Chain Visibility';
  status: 'connected' | 'pending' | 'expired' | 'available';
  authType: 'OAuth 2.0' | 'API Key' | 'mTLS' | 'Webhook';
  lastPing: string;
  latency: number;
  version: string;
  logoColor: string;
  description: string;
}

export interface TacticalNotification {
  id: string;
  time: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'alert' | 'success';
  read: boolean;
}

export interface EngineTelemetryPoint {
  time: string;
  timestamp: number;
  rpm: number;
  fuelRateGph: number;
  engineLoadPct: number;
  speedMph: number;
  coolantTempF: number;
  oilPressurePsi: number;
  boostPressurePsi: number;
}

export interface ShipmentLoad {
  id: string;
  loadNumber: string;
  status: 'Booked' | 'Dispatched' | 'In Transit' | 'At Dock' | 'Delivered';
  originCity: string;
  originState: string;
  originZip: string;
  destCity: string;
  destState: string;
  destZip: string;
  pickupWindow: string;
  deliveryWindow: string;
  rateUsd: number;
  miles: number;
  ratePerMile: number;
  weightLbs: number;
  equipment: string;
  commodity: string;
  brokerName: string;
  brokerPhone: string;
  driverName: string;
  assignedUnit: string;
  trailerUnit: string;
  bolNumber: string;
  detourProtected: boolean;
  notes: string;
  handoverRecord?: LoadHandoverRecord;
  handoverHistory?: LoadHandoverRecord[];
  handoverCount?: number;
}

export type HandoverReason =
  | 'HOS_RELIEF'
  | 'RELAY_DROP_HOOK'
  | 'EQUIPMENT_SWAP'
  | 'EXPEDITED_HOTSHOT'
  | 'EMERGENCY_DISPATCH';

export interface HandoverSafetyChecklist {
  preTripWalkaroundCompleted: boolean;
  cargoSealIntactVerified: boolean;
  bolPhysicalOrElectronicTransferred: boolean;
  reeferTempVerified: boolean;
  vehicleKeysAndFuelCardsExchanged: boolean;
  eldTractorPairingConfirmed: boolean;
}

export interface LoadHandoverRecord {
  id: string;
  loadId: string;
  loadNumber: string;
  departingDriverName: string;
  departingDriverUnit: string;
  receivingDriverId: string;
  receivingDriverName: string;
  receivingDriverUnit: string;
  receivingDriverCdl: string;
  receivingDriverPhone: string;
  handoverReason: HandoverReason;
  location: string;
  cargoSealNumber: string;
  checklist: HandoverSafetyChecklist;
  digitalSignatureDataUrl: string;
  signerLegalName: string;
  signerCdlNumber: string;
  sha256AuditHash: string;
  timestamp: string;
  regulatoryStatute?: string;
  transferNotes?: string;
}

export interface AvailableRelayDriver {
  id: string;
  name: string;
  avatarInitials: string;
  avatarColor: string;
  truckUnit: string;
  trailerUnit: string;
  phone: string;
  cdlNumber: string;
  cdlState: string;
  hosRemaining: string;
  hosRemainingMinutes: number;
  status: 'AVAILABLE_RELAY' | 'READY_STANDBY' | 'ON_DUTY_RELIEF';
  currentTerminal: string;
  proximity: string;
  matchScore: number;
}

export interface HosDriverStatus {
  driverName: string;
  cdlNumber: string;
  unitAssigned: string;
  currentStatus: 'OFF_DUTY' | 'SLEEPER' | 'DRIVING' | 'ON_DUTY';
  driveRemainingMinutes: number;
  shiftRemainingMinutes: number;
  cycleRemainingMinutes: number;
  breakRemainingMinutes: number;
  dutyGrid24h: ('OFF' | 'SB' | 'D' | 'ON')[];
  recentViolations: string[];
  last7DaysRecapHours: { day: string; hours: number }[];
}

export interface FleetEquipmentItem {
  id: string;
  unitNumber: string;
  type: 'TRACTOR' | 'TRAILER';
  vin: string;
  makeModelYear: string;
  licensePlate: string;
  odometerMiles: number;
  engineHours: number;
  assignedDriver: string;
  status: 'ACTIVE_RUNNING' | 'IN_SHOP' | 'SCHEDULED_PM' | 'OUT_OF_SERVICE';
  pmDueMiles: number;
  dotAnnualInspectionExpiry: string;
  tirePressurePsiAvg: number;
  activeFaultCodesCount: number;
  lastRepairedTimestamp?: string;
  lastRepairedWorkOrderId?: string;
  lastRepairedComponent?: string;
  lastRepairedOdometer?: number;
  totalRepairsCount?: number;
  firebaseSynced?: boolean;
}

export interface DvirPhotoAttachment {
  id: string;
  url: string;
  caption: string;
  zone: string;
  timestamp: string;
  fileName: string;
}

export interface DvirDefectItem {
  id: string;
  component: string;
  description: string;
  severity: 'OUT_OF_SERVICE' | 'SAFETY_DEFECT' | 'MINOR_COSMETIC';
  photoUrl?: string;
  resolved: boolean;
  resolutionNote?: string;
  resolvedBy?: string;
  mechanicCertification?: string;
  workOrderId?: string;
  repairCost?: number;
}

export type ComponentCategory =
  | 'BRAKES_AIR'
  | 'TIRES_WHEELS'
  | 'ENGINE_DRIVETRAIN'
  | 'AFTERTREATMENT_DEF'
  | 'ELECTRICAL_LIGHTING'
  | 'STEERING_SUSPENSION'
  | 'COUPLING_5TH_WHEEL'
  | 'REEFER_HVAC'
  | 'BODY_CAB';

export type RepairType =
  | 'CORRECTIVE_REPAIR'
  | 'PREVENTATIVE_PM_A'
  | 'PREVENTATIVE_PM_B'
  | 'PREVENTATIVE_PM_C'
  | 'EMERGENCY_ROADSIDE'
  | 'DOT_ANNUAL_INSPECTION'
  | 'RECALL_CAMPAIGN';

export interface MaintenanceWorkOrder {
  id: string;
  assetId?: string;
  unitNumber: string;
  trailerNumber?: string;
  repairDate: string;
  completedTimestamp: string;
  componentCategory: ComponentCategory;
  componentItem: string;
  repairType: RepairType;
  description: string;
  workPerformed: string;
  technicianName: string;
  technicianCertNumber: string;
  shopOrVendor: string;
  laborHours: number;
  laborRatePerHour: number;
  partsCost: number;
  laborCost: number;
  emergencySurcharge: number;
  totalCost: number;
  odometerAtRepair: number;
  fmcsaStatute: string;
  warrantyExpiresDate: string;
  warrantyActive: boolean;
  associatedDvirId?: string;
  integritySha256Hash: string;
  status: 'COMPLETED_CERTIFIED' | 'UNDER_WARRANTY' | 'SCHEDULED' | 'IN_PROGRESS';
  notes?: string;
  firebaseSynced?: boolean;
}

export interface MaintenanceCalculationMetrics {
  totalFleetSpend: number;
  totalLaborSpend: number;
  totalPartsSpend: number;
  totalEmergencySpend: number;
  totalOdometerMiles: number;
  costPerMileAvg: number;
  pmComplianceRatePct: number;
  meanMilesBetweenRepairs: number;
  activeWarrantyCount: number;
  warrantyValueActive: number;
  spendByCategory: Record<ComponentCategory, number>;
  spendByUnit: Record<string, number>;
  monthlySpendTrend: { month: string; spend: number; pmCount: number; repairCount: number }[];
  upcomingPmSchedule: {
    assetId: string;
    unitNumber: string;
    unitType: 'TRACTOR' | 'TRAILER';
    pmType: 'PM-A (15k mi)' | 'PM-B (30k mi)' | 'PM-C (60k mi)' | 'DOT Annual';
    currentMiles: number;
    dueMiles: number;
    milesRemaining: number;
    estimatedCost: number;
    status: 'NORMAL' | 'DUE_SOON' | 'OVERDUE';
    dueDate: string;
    lastRepairedTimestamp?: string;
    lastRepairedWorkOrderId?: string;
    lastRepairedComponent?: string;
    lastRepairedOdometer?: number;
    milesSinceLastRepair?: number;
  }[];
}

export interface DailyDvirExportPackage {
  exportId: string;
  exportDate: string;
  exportTimestamp: string;
  unitNumbers: string[];
  driverNames: string[];
  dvirRecordCount: number;
  passedCount: number;
  defectsCount: number;
  outOfServiceCount: number;
  sha256AuditSeal: string;
  carrierDotNumber: string;
  exportStatus: 'ARCHIVED_AND_DISPATCHED' | 'DOWNLOADED_PDF' | 'TRANSMITTED_SAFETY_DESK';
  fileSizeBytes: number;
  records: DvirInspection[];
  associatedRepairs?: MaintenanceWorkOrder[];
}

export interface ComponentWearCalculation {
  id: string;
  unitNumber: string;
  component: string;
  category: ComponentCategory;
  wearPercentage: number;
  lastServicedMiles: number;
  nextServiceMiles: number;
  estMilesRemaining: number;
  degradationRatePer1kMiles: number;
  healthStatus: 'HEALTHY' | 'MONITOR' | 'CRITICAL_SERVICE_REQUIRED';
  estReplacementCost: number;
}

export interface DvirInspection {
  id: string;
  inspectionType: 'PRE_TRIP' | 'POST_TRIP';
  timestamp: string;
  unitNumber: string;
  trailerNumber?: string;
  driverName: string;
  odometer: number;
  defectsFound: boolean;
  status: 'SATISFACTORY' | 'DEFECTS_CORRECTED' | 'UNSAFE';
  itemsChecked: { name: string; passed: boolean; note?: string; zone?: string }[];
  defectsList?: DvirDefectItem[];
  photos?: DvirPhotoAttachment[];
  driverNotes?: string;
  mechanicNotes?: string;
  priorDayRefId?: string;
  priorDayDefectsAcknowledged?: boolean;
  signatureVerified: boolean;
  certifiedSafeToOperate?: boolean;
}

export interface PriorDayDvirMemory {
  priorDvirId: string;
  priorDate: string;
  priorType: 'PRE_TRIP' | 'POST_TRIP';
  unitNumber: string;
  driverName: string;
  priorOdometer: number;
  defectsNoted: DvirDefectItem[];
  driverNotes: string;
  mechanicActionRequired: boolean;
  mechanicCertification: {
    certifiedRepaired: boolean;
    repairedBy: string;
    repairDate: string;
    workOrderNumber: string;
    certificationNote: string;
  };
}

export interface RoadsideAssistanceProvider {
  id: string;
  name: string;
  category: 'NATIONWIDE_HEAVY_REPAIR' | 'TIRE_NETWORK' | 'OEM_ENGINE' | 'TOWING_RECOVERY' | 'REEFER_COOLING';
  tollFreePhone: string;
  directDial: string;
  contactName: string;
  coverage: string;
  averageEtaMinutes: number;
  webPortalUrl: string;
  servicesOffered: string[];
  notes: string;
  isPreferredFleetVendor: boolean;
}

export interface BreakdownIncidentTicket {
  id: string;
  driverName: string;
  unitNumber: string;
  trailerNumber: string;
  highwayLocation: string;
  gpsCoords: { lat: number; lng: number };
  breakdownCategory: 'TIRE_BLOWOUT' | 'AIR_LEAK_BRAKES' | 'ENGINE_DERATE_DEF' | 'REEFER_ALARM' | 'ELECTRICAL_BATTERY' | 'TOWING_WRECKER' | 'FUEL_ISSUE' | 'OTHER';
  urgency: 'CRITICAL_HAZARD_OOS' | 'HIGH_URGENT' | 'STANDARD_ROADSIDE';
  description: string;
  assignedProviderId?: string;
  assignedProviderName?: string;
  dispatchConfirmed: boolean;
  fleetManagerAlerted: boolean;
  status: 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'COMPLETED';
  createdAt: string;
}

export interface IftaQuarterRecord {
  quarter: string;
  year: number;
  totalMiles: number;
  totalGallons: number;
  fleetMpg: number;
  totalNetTaxDue: number;
  jurisdictions: {
    stateCode: string;
    stateName: string;
    taxableMiles: number;
    taxableGallons: number;
    taxPaidGallons: number;
    netTaxableGallons: number;
    taxRate: number;
    netTaxDue: number;
  }[];
}

export interface ComplianceDocument {
  id: string;
  title: string;
  category: 'INSURANCE' | 'AUTHORITY' | 'DRIVER_QUAL' | 'SAFETY' | 'ASSET_CERT';
  issuer: string;
  policyOrDocNumber: string;
  effectiveDate: string;
  expirationDate: string;
  status: 'ACTIVE' | 'PENDING_RENEWAL' | 'CRITICAL_EXPIRED' | string;
  coverageAmount?: string;
  downloadUrl?: string;
  assignedTo?: string; // Driver name or Tractor/Trailer unit
  qrAuditProof?: string;
  ingestedAt?: string;
  ingestionMethod?: 'QR_CAMERA_SCAN' | 'BARCODE_DECODER' | 'PRESET_INGEST' | 'FILE_UPLOAD';
}

export type ParkingSpotType = 'OVERNIGHT_HAVEN' | 'DAY_STAGING_PAD';
export type ParkingCrunchStatus =
  | 'OPTIMAL_HAVEN'
  | 'MODERATE'
  | 'HIGH_CRUNCH'
  | 'FULL_BYPASS'
  | 'STAGING_OPEN';

export interface ParkingFacility {
  id: string;
  name: string;
  type: ParkingSpotType;
  location: string;
  distanceMiles: number;
  etaMinutes: number;
  totalSpots: number;
  spotsRemaining: number;
  status: ParkingCrunchStatus;
  fenced: boolean;
  securityGuard: boolean;
  amenities: string[];
  gateAccessCode: string;
  rateOvernight: string;
  coordinates: { lat: number; lng: number };
}

export interface ParkingSmsMessage {
  id: string;
  timestamp: string;
  recipientRole: 'BROKER' | 'SHIPPER_RECEIVER' | 'DRIVER_CAB' | 'FLEET_SAFETY';
  recipientName: string;
  toPhone: string;
  message: string;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';
  latencyMs: number;
}

export interface SafeHarborAffidavit {
  certificateId: string;
  timestamp: string;
  regulation: string;
  unitNumber: string;
  driverName: string;
  nearestRefugeName: string;
  distanceMiles: number;
  hash: string;
  legalAffidavitText: string;
}

export interface SyntheticEndpointDescriptor {
  id: string;
  method: 'GET' | 'POST';
  endpoint: string;
  statutoryReference: string;
  assertionText: string;
  domain:
    | 'HOS CLOCKS'
    | 'BRIDGE RADAR'
    | 'HAPTICS SPE-2025'
    | 'DISPATCH ZERO'
    | 'TELEMATICS'
    | 'REGULATORY VAULT';
  statusCode: number;
  latencyMs: number;
  lastVerified: string;
  samplePayload: Record<string, any>;
}

export interface TraxesDisputePacket {
  loadNumber: string;
  facility: string;
  geofenceEntry: string;
  geofenceExit: string;
  totalMinutes: number;
  billableMinutes: number;
  hourlyRate: number;
  totalDueUsd: number;
  sha256Proof: string;
  statutoryGrounding: string;
}

export type AgentDomainCategory = 'COMMAND' | 'SAFETY' | 'COMPLIANCE' | 'OPERATIONS';

export interface AutonomousAgent {
  id: string;
  name: string;
  code: string;
  category: AgentDomainCategory;
  role: string;
  status: 'ACTIVE_GUARD' | 'ACTIVE_OPTIMIZING' | 'ACTIVE_RESERVING' | 'MONITORING_REALTIME' | 'STREAMING_DIAG' | 'ACTIVE_AUDITING' | 'CRYPTOGRAPHICALLY_SEALED';
  latencyMs: number;
  decisionsCount: number;
  successRate: string;
  currentTask: string;
  targetTab: TabType;
  primaryMetric: {
    label: string;
    value: string;
    trend?: string;
  };
  statuteCitation: string;
  lastActionTimestamp: string;
}

export interface AgentBusMessage {
  id: string;
  timestamp: string;
  fromAgentCode: string;
  fromAgentName: string;
  toAgentCode: string;
  toAgentName: string;
  directive: string;
  payloadSummary: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  verifiedHash: string;
}

export interface AgentSwarmTelemetry {
  swarmStatus: string;
  totalAgents: number;
  activeJobsCount: number;
  meanDecisionLatencyMs: number;
  statutoryComplianceRate: string;
  totalFinancialImpactUsd: number;
  lastSyncTimestamp: string;
  agents: AutonomousAgent[];
  busLogs: AgentBusMessage[];
}

export type DriverEmploymentType = 'W2_COMPANY' | '1099_OWNER_OPERATOR' | 'LEASE_PURCHASE';

// =========================================================================
// HAULER SPECIFICATIONS & DOT/FMCSA REGULATED HAULER TYPES
// Applies to all commercial vehicles subject to DOT & FMCSA regulations:
// - Flatbed Haulers (49 CFR § 393.100-136 Cargo Securement)
// - Dry Van Haulers (49 CFR § 393 Enclosed Van Securement & E-Track)
// - Box Trucks (Straight Trucks 16'-26' Non-CDL <26k or Class B CDL)
// - Cargo / Sprinter Vans (Interstate Commercial 10,001+ lbs GVWR or HazMat)
// - Reefer Haulers (FSMA Sanitary Food Transportation Rule)
// - Hotshot Flatbeds (Class 3-5 Pickup + Gooseneck Trailer)
// =========================================================================

export type HaulerType =
  | 'FLATBED'
  | 'DRY_VAN'
  | 'BOX_TRUCK'
  | 'CARGO_VAN'
  | 'REEFER'
  | 'HOTSHOT_FLATBED';

export interface HaulerSpecification {
  id: HaulerType;
  name: string;
  shortLabel: string;
  dotTier: 'CLASS_A_COMBINATION' | 'CLASS_B_HEAVY_STRAIGHT' | 'NON_CDL_INTERSTATE_10K_PLUS';
  gvwrRange: string;
  cdlRequired: boolean;
  regulationsSummary: string;
  dvirSpecialChecks: string[];
  hosRuleVariant: string;
  equipmentExamples: string[];
}

export interface CheckrBackgroundReport {
  reportId: string;
  candidateId: string;
  candidateName: string;
  packageType: 'DOT_STANDARD_DRIVER' | 'FMCSA_PRO_CDL' | 'LIGHT_DUTY_VAN_PACKAGE';
  status: 'CLEAR' | 'CONSIDER' | 'PROCESSING' | 'SUSPENDED';
  initiatedAt: string;
  completedAt?: string;
  turnaroundLatencyMs: number;
  ssnTraceStatus: 'CLEAR' | 'CONSIDER';
  nationalCriminalSearch: 'CLEAR' | 'CONSIDER';
  sexOffenderRegistrySearch: 'CLEAR' | 'CONSIDER';
  countyCriminalSearches: Array<{
    county: string;
    state: string;
    status: 'CLEAR' | 'RECORD_FOUND';
    details?: string;
  }>;
  mvrDrivingRecord: {
    status: 'CLEAR' | 'CONSIDER';
    stateDmv: string;
    licenseStatus: 'VALID_ACTIVE' | 'EXPIRED' | 'SUSPENDED';
    classType: string;
    violationCount: number;
    pointsAssigned: number;
    violationsSummary: string[];
  };
  fmcsaClearinghouseStatus?: 'ELIGIBLE_NO_VIOLATIONS' | 'PROHIBITED' | 'PENDING_CONSENT';
  pspSafetyInspectionHistory?: {
    cleanInspections3Years: number;
    violations3Years: number;
    crashes5Years: number;
  };
  overallRecommendation: 'RECOMMENDED_FOR_HIRE' | 'FURTHER_REVIEW_REQUIRED' | 'DISQUALIFIED_FCRA';
}

export type DriverStatus = 'ACTIVE_QUALIFIED' | 'ONBOARDING' | 'ACTION_REQUIRED' | 'SUSPENDED';

export type OnboardingStage =
  | 'STAGE_1_APPLICATION'
  | 'STAGE_2_CDL_MEDICAL'
  | 'STAGE_3_MVR_PSP'
  | 'STAGE_4_CLEARINGHOUSE'
  | 'STAGE_5_ROAD_TEST_APPROVED';

export interface PreviousEmploymentVerification {
  id?: string;
  employerName?: string;
  dotNumber?: string;
  period?: string;
  position?: string;
  equipmentType?: string;
  inquirySentDate?: string;
  responseDate?: string;
  verificationStatus?: 'VERIFIED_CLEAN' | 'INQUIRY_SENT' | 'NON_RESPONSIVE_DOCUMENTED' | string;
  accidentsReported?: number;
  drugAlcoholViolations?: boolean;
  eligibleForRehire?: boolean;
  verifiedBy?: string;
  carrierName?: string;
  usdotNumber?: string;
  addressCityState?: string;
  datesEmployed?: string;
  equipmentOperated?: string;
  verificationMethod?: string;
  verifiedDate?: string;
  dotRecordableAccidents?: number;
}

export interface StateDotEligibilityDecision {
  respectedState?: string;
  stateDmvAgency?: string;
  eligibilityStatus?: 'CONFIRMED_ELIGIBLE' | 'CONDITIONAL_REVIEW' | 'DISQUALIFIED' | string;
  selfCertificationType?: 'NON_EXCEPTED_INTERSTATE_NI' | 'EXCEPTED_INTERSTATE' | 'INTRASTATE_ONLY' | string;
  stateDisqualificationCheck?: 'NO_STATUTORY_DISQUALIFICATIONS' | 'REVIEW_REQUIRED' | string;
  pointsAccumulation?: number;
  pointsThreshold?: number;
  medCardCrossCheck?: 'NRCME_REGISTRY_MATCHED' | 'DISCREPANCY' | string;
  cdlisSingleLicenseVerified?: boolean;
  indexedStatesQueried?: string[];
  decisionTimestamp?: string;
  dotWebIndexRef?: string;
  sha256Seal?: string;
  driverId?: string;
  state?: string;
  agency?: string;
  statuteRef?: string;
  eligible?: boolean;
  evaluatedAt?: string;
  disqualificationReasons?: string[];
  cdlisStatus?: string;
  medicalCertificationStatus?: string;
  pointAccumulation?: string;
  notes?: string;
}

export interface DrivingRecordViolationItem {
  id: string;
  code: string; // e.g. "392.2", "395.8(a)", "393.47"
  fmcsaPart: string;
  date: string;
  description: string;
  state: string;
  severityWeight: number;
  status: 'RESOLVED_CLEARED' | 'ACTIVE_RECORD';
  dotInspectionId?: string;
}

export interface BackgroundCheckReport {
  id: string;
  driverId: string;
  executedAt: string;
  mvrStatus: 'CLEAR' | 'FLAGGED' | 'EXPIRED';
  mvrPoints: number;
  mvrViolationsCount: number;
  pspScore: string;
  pspCrashes5Years: number;
  pspInspections3Years: number;
  clearinghouseQueryStatus: 'ELIGIBLE_CLEAR' | 'PROHIBITED' | 'PENDING_CONSENT';
  nrcmeMedicalStatus: 'VALID_REGISTRY_CERTIFIED' | 'EXPIRED';
  criminalScreening: 'PASSED_NO_RECORD' | 'REVIEW';
  tenYearWorkHistoryVerified: boolean;
  sha256AuditSeal: string;
  details: {
    stateDmv: string;
    lastInspectionDate?: string;
    drugTestDate?: string;
    clearinghouseRef?: string;
  };
  // DOT Web / Pull All Index enhancements
  employmentVerifications?: PreviousEmploymentVerification[];
  violationsIndex?: DrivingRecordViolationItem[];
  stateEligibilityDecision?: StateDotEligibilityDecision;
  dotWebPullTimestamp?: string;
  dotWebIndexSources?: string[];
}

export interface DriverRecord {
  id: string;
  driverNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: DriverStatus;
  onboardingStage: OnboardingStage;
  employmentType: DriverEmploymentType;
  cdlNumber: string;
  cdlState: string;
  cdlExpiry: string;
  medicalCardExpiry: string;
  endorsements: string[]; // e.g. ['Tanker (N)', 'HazMat (H)', 'Doubles/Triples (T)', 'TWIC']
  assignedTruckUnit?: string;
  assignedTrailerUnit?: string;
  yearsExperience: number;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  hireDate: string;
  lastBackgroundCheck?: BackgroundCheckReport;
  dqfComplete: boolean;
  employmentVerifications?: PreviousEmploymentVerification[];
  stateEligibility?: StateDotEligibilityDecision;
  haulerType?: HaulerType;
  checkrReport?: CheckrBackgroundReport;
  dqfScorePercent?: number;
  fmcsaAuditReady?: boolean;
  clearinghouseStatus?: 'CLEARED' | 'PENDING_QUERY' | 'ACTION_REQUIRED';
  annualReviewDueDays?: number;
}

// ================= FMCSA DQF & HR EXPIRATION COMPLIANCE TYPES =================

export interface DqfChecklistItem {
  id: string;
  code: string; // e.g. '391.21', '391.23_MVR', '391.23_SAFETY', '391.31', '391.43_MED', '391.25_ANNUAL', '382.301_DRUG', '382.701_CLEARINGHOUSE', 'CDL_SCAN', 'ROAD_TEST'
  title: string;
  statuteCitation: string;
  status: 'COMPLIANT' | 'EXPIRING_SOON' | 'EXPIRED' | 'MISSING_ACTION_REQUIRED';
  completedDate?: string;
  expirationDate?: string;
  verifiedBy: string;
  documentFileName?: string;
  documentHashSha256?: string;
  notes?: string;
}

export interface DriverDqfProfile {
  driverId: string;
  driverName: string;
  cdlNumber: string;
  cdlState: string;
  dotNumber: string;
  carrierName: string;
  overallComplianceScore: number; // 0 - 100%
  status: '100%_AUDIT_READY' | 'WARNING_EXPIRING' | 'NON_COMPLIANT';
  checklist: DqfChecklistItem[];
  lastAuditAttestationDate: string;
  auditorSignatureSha256: string;
  fmcsaLevel1Ready: boolean;
}

export interface AnnualReviewRecord {
  id: string;
  driverId: string;
  driverName: string;
  reviewDate: string;
  reviewerName: string;
  reviewerTitle: string;
  mvrState: string;
  mvrOrderedDate: string;
  mvrStatus: 'CLEAR' | 'VIOLATIONS_FOUND' | 'SUSPENDED';
  violationsList: Array<{
    date: string;
    location: string;
    offense: string;
    vehicleType: string;
  }>;
  driverSignedCertificateDate: string;
  driverSignature: string;
  managerDetermination: 'MEETS_STANDARDS' | 'DISQUALIFIED_FROM_DRIVING';
  statuteCitation: '49 CFR § 391.25 & § 391.27';
  status: 'COMPLETED_SIGNED' | 'PENDING_DRIVER_SIGNATURE';
}

export interface PriorEmployerSafetyInquiry {
  id: string;
  driverId: string;
  driverName: string;
  priorCompanyName: string;
  priorCompanyPhone: string;
  priorCompanyEmail: string;
  priorCompanyAddress: string;
  employmentDates: string;
  dateInquirySent: string;
  dateResponseReceived?: string;
  status: 'INQUIRY_SENT' | 'RESPONSE_RECEIVED_VERIFIED' | 'SECOND_NOTICE_DISPATCHED' | 'OVERDUE_30DAY_WINDOW';
  accidentHistoryFound: boolean;
  drugAlcoholViolationsFound: boolean;
  eligibleForRehire: boolean;
  verifiedByMethod: 'DIGITAL_PORTAL' | 'ELECTRONIC_FAX' | 'VERIFIED_PHONE';
  trackingToken: string;
}

export interface ClearinghouseQueryRecord {
  id: string;
  driverId: string;
  driverName: string;
  cdlNumber: string;
  cdlState: string;
  queryType: 'PRE_EMPLOYMENT_FULL' | 'ANNUAL_LIMITED_BATCH' | 'POST_ACCIDENT_FOLLOW_UP';
  queryDate: string;
  consentObtained: boolean;
  consentTimestamp: string;
  clearinghouseResult: 'RECORD_NOT_FOUND_CLEAN' | 'PROHIBITED_VIOLATION_PRESENT';
  fmcsaTransactionId: string;
  nextScheduledQueryDate: string;
}

export interface ContinuousMvrAlert {
  id: string;
  driverId: string;
  driverName: string;
  cdlNumber: string;
  cdlState: string;
  detectedAt: string;
  severity: 'CRITICAL_SUSPENSION' | 'MOVING_VIOLATION' | 'MEDICAL_DOWNGRADE' | 'ROUTINE_CLEAR_PING';
  description: string;
  jurisdiction: string;
  pointsAdded: number;
  actionRequired: string;
  status: 'UNRESOLVED' | 'REVIEWED_RESOLVED';
}

export interface MobileOnboardingSession {
  id: string;
  inviteCode: string;
  driverName: string;
  phone: string;
  email: string;
  carrierName: string;
  dotNumber: string;
  shareableUrl: string;
  createdDate: string;
  status: 'LINK_GENERATED' | 'APPLICATION_SUBMITTED' | 'DOCS_UPLOADED' | 'READY_FOR_OFFER';
  cdlFrontUploaded: boolean;
  medCardUploaded: boolean;
  fcraConsentSigned: boolean;
  clearinghouseConsentSigned: boolean;
}

// ================= REGIONAL WEATHER HAZARD FEED (SEARCH GROUNDING) =================
export interface RegionalWeatherHazard {
  nasaShield?: NasaEarthdataShield;
  id: string;
  location: string;
  corridor: string;
  timestamp: string;
  overallSeverity: 'CRITICAL_HAZARD' | 'HIGH_ALERT' | 'ADVISORY' | 'CLEAR_NOMINAL';
  fogHazard: {
    active: boolean;
    visibilityMiles: number;
    density: 'DENSE_ZERO_VISIBILITY' | 'PATCHY_FOG' | 'MIST' | 'CLEAR';
    advisory: string;
    directive: string;
  };
  iceHazard: {
    active: boolean;
    surfaceTempF: number;
    blackIceRisk: 'HIGH_BRIDGE_DECK_RISK' | 'MODERATE_SLICK' | 'LOW' | 'NONE';
    bridgeDeckStatus: string;
    engineBrakeDirective: string;
  };
  windHazard: {
    active: boolean;
    sustainedMph: number;
    gustMph: number;
    crosswindThreat: 'SEVERE_BLOWOVER_RISK' | 'ELEVATED_CROSSWIND' | 'MODERATE' | 'LOW';
    blowoverRiskRating: string;
    speedCapMph: number;
  };
  generalAdvisory: string;
  groundingSources: Array<{ title: string; uri: string }>;
  webSearchQueries: string[];
  source: 'GEMINI_SEARCH_GROUNDED' | 'REALTIME_DETERMINISTIC_RADAR';
  highProfileRigWarning?: string;
}

export type AssetCategory =
  | 'TRACTOR_POWER_UNIT'
  | 'REEFER_TRAILER'
  | 'DRY_VAN_TRAILER'
  | 'FLATBED_TRAILER'
  | 'STEP_DECK'
  | 'CHASSIS_EQUIPMENT';

export type AssetOperationalStatus =
  | 'ACTIVE_ON_ROAD'
  | 'AVAILABLE_STAGED'
  | 'SCHEDULED_PM'
  | 'IN_SHOP'
  | 'OUT_OF_SERVICE';

export interface FleetAssetRecord {
  id: string;
  unitNumber: string;
  category: AssetCategory;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  licenseState: string;
  odometerMiles: number;
  engineHours: number;
  status: AssetOperationalStatus;
  assignedDriverName?: string;
  assignedDriverId?: string;
  telematicsVendor: string;
  telematicsDeviceId: string;
  annualDotInspectionExpiry: string;
  pmIntervalMiles: number;
  pmDueMiles: number;
  activeDtcFaultsCount: number;
  fuelType: 'DIESEL' | 'DEF_DIESEL' | 'ELECTRIC' | 'REEFER_HYBRID';
  tirePressurePsiAvg: number;
  lastMaintenanceDate: string;
}

export type MessageChannelType = 'DISPATCH' | 'SAFETY' | 'MAINTENANCE' | 'CB_CHATTER' | 'SHIPPER_RECEIVER';

export interface MessageRecord {
  id: string;
  channel: MessageChannelType;
  senderName: string;
  senderRole: 'DRIVER' | 'DISPATCHER' | 'SAFETY_OFFICER' | 'MECHANIC' | 'SYSTEM';
  text: string;
  timestamp: string;
  priority: 'NORMAL' | 'HIGH' | 'EMERGENCY_SOS';
  read: boolean;
  audioTranscript?: string;
  attachedLoadId?: string;
}

export interface CinemaVideo {
  id: string;
  youtubeId: string;
  title: string;
  channelTitle: string;
  category: 'TUTORIAL' | 'SAFETY_TRAINING' | 'CABIN_RELAX' | 'HIGHWAY_DOCS' | 'PODCAST';
  duration: string;
  thumbnailUrl: string;
  description: string;
}

export interface TutorialStep {
  stepNumber: number;
  title: string;
  instruction: string;
  tip?: string;
  completed?: boolean;
}

export interface TutorialGuide {
  id: string;
  moduleName: string;
  tabTarget: TabType;
  statuteOrStandard: string;
  shortDescription: string;
  estimatedMinutes: number;
  apiEndpoint: string;
  difficulty: 'BEGINNER' | 'OPERATIONAL' | 'ADVANCED';
  steps: TutorialStep[];
}

// Geofencing Configuration & Event Logging Types
export type GeofenceShapeType = 'POLYGON' | 'CIRCLE' | 'RECTANGLE';
export type GeofenceCategory = 'DEPOT' | 'WAREHOUSE' | 'FUEL_REST' | 'LOW_BRIDGE_HAZARD' | 'TOLL_BORDER' | 'CUSTOM';

export interface GeofenceCoordinate {
  lat: number;
  lng: number;
}

export interface GeofenceCanvasPoint {
  x: number;
  y: number;
}

export interface GeofenceZone {
  id: string;
  name: string;
  category: GeofenceCategory;
  shape: GeofenceShapeType;
  color: string;
  enabled: boolean;
  notifyOnEntry: boolean;
  notifyOnExit: boolean;
  speedLimitMph?: number;
  customMessage?: string;
  createdAt: string;
  points?: GeofenceCoordinate[];
  center?: GeofenceCoordinate;
  radiusMiles?: number;
  canvasPoints: GeofenceCanvasPoint[];
  canvasCenter?: GeofenceCanvasPoint;
  canvasRadius?: number;
  lastEvent?: 'ENTRY' | 'EXIT' | null;
  lastEventTime?: string;
  dwellStartTimestamp?: number | null;
}

export interface GeofenceEventLog {
  id: string;
  zoneId: string;
  zoneName: string;
  category: GeofenceCategory;
  eventType: 'ENTRY' | 'EXIT';
  timestamp: string;
  vehicleId: string;
  driver: string;
  lat: number;
  lng: number;
  speedMph: number;
  dwellDurationSeconds?: number;
  notificationDispatched: boolean;
  message?: string;
}

// ================= TITAN RLD-1 EQUIPMENT & DIAGNOSTICS TYPES =================

export interface TruckRldSnapshot {
  tractorId: string;
  vin: string;
  engineMake: 'Detroit DD15 Gen 5' | 'Cummins X15 Efficiency' | 'PACCAR MX-13' | 'Volvo D13TC';
  odometerMiles: number;
  engineHours: number;
  timestamp: string;
  // Core J1939 Parameters
  oilPressurePsi: number;
  oilTempF: number;
  coolantTempF: number;
  boostPressurePsi: number;
  fuelPressurePsi: number;
  batteryVoltageV: number;
  engineRpm: number;
  roadSpeedMph: number;
  // Emissions & Aftertreatment
  dpfSootLoadPct: number;
  dpfDifferentialPressurePsi: number;
  defLevelPct: number;
  defConcentrationPct: number;
  dpfRegenStatus: 'INACTIVE' | 'PASSIVE' | 'ACTIVE_PARKED_REQUIRED' | 'HIGH_EXHAUST_TEMP';
  inletNoxPpm: number;
  outletNoxPpm: number;
  egtSensorF: number;
  // Air Brakes & Pneumatics (49 CFR § 393.47)
  primaryAirTankPsi: number;
  secondaryAirTankPsi: number;
  governorCutOutPsi: number;
  governorCutInPsi: number;
  appliedLeakageRatePsiMin: number;
  staticLeakageRatePsiMin: number;
  absWarningLamp: boolean;
  brakeStrokeStatus: 'IN_SPEC' | 'APPROACHING_LIMIT' | 'OUT_OF_SPEC_OOS';
  // Tires & Running Gear (49 CFR § 393.75)
  steerLeftTreadDepth32nds: number;
  steerRightTreadDepth32nds: number;
  driveTreadDepthMin32nds: number;
  trailerTreadDepthMin32nds: number;
  tpmsAlertsCount: number;
  wheelSealLeakDetected: boolean;
  hubOilLevelOk: boolean;
  // Transmission & Drivetrain
  transFluidTempF: number;
  clutchSlipPct: number;
  retarderLevel: 'OFF' | 'LOW' | 'MED' | 'HIGH';
  // Active J1939 Diagnostic Trouble Codes
  activeDtcs: J1939DiagnosticFaultCode[];
}

export interface J1939DiagnosticFaultCode {
  spn: number;
  fmi: number;
  codeStr: string;
  description: string;
  system: 'ENGINE' | 'AFTERTREATMENT' | 'BRAKES_ABS' | 'TRANSMISSION' | 'ELECTRICAL' | 'REEFER';
  severity: 'CRITICAL_OOS' | 'RESTRICTED_LIMP' | 'PREVENTIVE_WARNING';
  cvsaOutOfServiceRisk: boolean;
  fmcsaStatute: string;
  firstTriggered: string;
  rootCause: string;
  roadsideTriage: string;
  permanentRepair: string;
}

export interface EquipmentAgentDiagnosticQuery {
  question: string;
  faultCodeInput?: string;
  currentRldContext?: Partial<TruckRldSnapshot>;
}

export interface EquipmentAgentDiagnosticResponse {
  honestyVerdict: 'IMMEDIATE_OUT_OF_SERVICE' | 'RESTRICTED_LIMP_ONLY' | 'SAFE_TO_OPERATE_WITH_MONITORING';
  verdictTitle: string;
  verdictSummary: string;
  cvsaOutOfServiceRisk: boolean;
  fmcsaCitation: string;
  rootCauseAnalysis: string;
  roadsideShoulderTriage: string[];
  permanentRepairSpecs: {
    oemParts: string[];
    estimatedShopHours: number;
    torqueSpecsOrSettings?: string;
    estimatedCostUsd: number;
  };
  preventiveAdvice: string;
  timestamp: string;
  analyzedBy: string;
}

// ================= QUANTUM PREDICTIVE DOT COMPLIANCE TYPES =================

export type DotScenarioCategory =
  | 'HOS_DUTY_CLOCK'
  | 'ROADSIDE_CVSA_LEVEL_1'
  | 'WEIGHT_BRIDGE_FORMULA'
  | 'CARGO_SECUREMENT'
  | 'TIRE_BLOWOUT_TREAD'
  | 'LOW_BRIDGE_CLEARANCE'
  | 'ADVERSE_WEATHER_SAFE_HAVEN'
  | 'PRE_TRIP_DVIR_DISCREPANCY';

export interface QuantumDotScenario {
  id: string;
  category: DotScenarioCategory;
  title: string;
  fmcsaStatute: string;
  riskProbabilityAmplitude: number;
  quantumPhaseDeg: number;
  superpositionDescription: string;
  potentialViolationImpact: string;
  cvsaFineOrPenalty: string;
  eigenstateGroundResolution: string;
  preventionTimeWindowMinutes: number;
  driverImmediateAction: string;
  fleetDispatcherAction: string;
  status: 'SUPERPOSITION_ACTIVE' | 'RESOLVED_GROUND_STATE' | 'PREVENTED';
}

export interface QuantumComplianceMatrixState {
  quantumCoherencePct: number;
  totalActiveScenarios: number;
  resolvedScenariosCount: number;
  imminentViolationsAverted: number;
  zeroViolationEigenvalue: number;
  lastAnnealedTimestamp: string;
  scenarios: QuantumDotScenario[];
}

export interface CsaBasicItem {
  basicName: string;
  code: string;
  percentile: number;
  interventionThreshold: number;
  status: 'EXCELLENT' | 'MONITOR' | 'ACTION_REQUIRED';
  timeWeightedViolations: number;
  description: string;
  regulationsCited: string;
}

export interface ActionableRecommendation {
  id: string;
  priority: 'HIGH' | 'MEDIUM' | 'CONTINUOUS';
  title: string;
  fmcsaRule: string;
  actionSteps: string[];
  scoreImpact: string;
}

export interface DotScoreData {
  carrierLegalName: string;
  dba: string;
  usdotNumber: string;
  mcNumber: string;
  safetyRating: 'SATISFACTORY' | 'CONDITIONAL' | 'UNSATISFACTORY';
  issScore: number;
  issCategory: 'PASS' | 'OPTIONAL' | 'INSPECT';
  issRecommendation: string;
  bypassClearanceRatePct: number;
  highwayAssuredTrustScore: number;
  oosRates: {
    vehicleOosPct: number;
    nationalVehicleOosAvgPct: number;
    driverOosPct: number;
    nationalDriverOosAvgPct: number;
    hazmatOosPct: number;
    nationalHazmatOosAvgPct: number;
  };
  csaBasics: CsaBasicItem[];
  dataScoreComposition: {
    totalInspections24Months: number;
    cleanInspectionsCount: number;
    cleanInspectionRatioPct: number;
    violationsRecordedCount: number;
    timeWeightBreakdown: {
      under6Months: string;
      sixTo12Months: string;
      twelveTo24Months: string;
      over24Months: string;
    };
    severityWeightScale: string;
    powerUnitCohort: string;
  };
  actionableRecommendations: ActionableRecommendation[];
}

export interface WeighStationBypassState {
  activeProgram: string;
  enrollmentStatus: string;
  transponderId: string;
  bypassEligibilityPct: number;
  highwayCredentials: {
    iftaLicenseStatus: string;
    ucrRegistrationStatus: string;
    autoLiabilityInsurance: string;
    issCategory: string;
    overweightPermitState: string;
  };
  upcomingWeighStation: {
    id: string;
    name: string;
    corridor: string;
    distanceMiles: number;
    operatingStatus: string;
    scaleLaneType: string;
    sensorFrequencyHz: number;
    currentCabSignal: 'BYPASS_APPROVED' | 'PULL_IN_INSPECT';
    signalTitle: string;
    signalColor: 'GREEN' | 'RED';
    hapticCommand: string;
    timestamp: string;
  };
}

export interface RoadsideChecklistPhase {
  phaseId: string;
  phaseNumber: number;
  title: string;
  statutoryCitation: string;
  instructions: string[];
}

export interface RoadsideInspectionGuide {
  certifiedStandard: string;
  inspectionLevels: {
    level: string;
    title: string;
    coverage: string;
    estimatedDurationMinutes: number;
  }[];
  roadsideChecklistPhases: RoadsideChecklistPhase[];
}

export interface TelecomLine {
  id: string;
  unitNumber: string;
  assignedPhoneNumber: string;
  lineType: 'LOCAL' | 'TOLL_FREE' | 'PORTED';
  areaCode: string;
  sipTrunkStatus: 'ONLINE_ACTIVE' | 'PROVISIONING' | 'OFFLINE';
  callShieldActive: boolean;
  hosAutoGuardActive: boolean;
  privacyMaskingActive: boolean;
  detentionRecordingActive: boolean;
  monthlyCost: number;
  carrierSuperNetwork: string;
  latencyMs: number;
}

export interface TelecomCallLog {
  id: string;
  timestamp: string;
  unitNumber: string;
  callerName: string;
  callerType: 'FREIGHT_BROKER' | 'RECEIVER_DOCK' | 'SHIPPER' | 'DISPATCH' | 'SAFETY_DEPT';
  callerNumber: string;
  durationSeconds: number;
  hosStatusAtCall: 'DRIVING_11H_ACTIVE' | 'ON_DUTY_PARKED' | 'SLEEPER_BERTH' | 'OFF_DUTY';
  actionTaken: 'AUTO_ETA_TTS_PLAYED' | 'CALL_ROUTED_TO_HEADSET' | 'SMS_DISPATCH_AUTO_SENT' | 'VOICEMAIL_TRANSCRIBED';
  systemTtsTranscript?: string;
  detentionTimestampProof?: string;
  sha256AuditHash: string;
}

export interface LineProvisioningRequest {
  usdotNumber: string;
  carrierLegalName: string;
  dispatchCellNumber: string;
  numCabLines: number;
  desiredAreaCodeOrPrefix: string;
  lineTypePreference: 'LOCAL' | 'TOLL_FREE' | 'PORTED';
}

export type FleetCallCategory = 'BROKER' | 'RECEIVER' | 'DISPATCH' | 'EMERGENCY_BREAKDOWN';

export interface FleetSpeedDialContact {
  id: string;
  category: FleetCallCategory;
  name: string;
  subtitle: string;
  phone: string;
  extension?: string;
  operatingHours?: string;
  badge?: string;
  pinned?: boolean;
  autoPromptScript?: string;
  contactPerson?: string;
  addressOrNotes?: string;
}

export type BreakdownIssueCategory =
  | 'TIRE_BLOWOUT'
  | 'ENGINE_DERATE'
  | 'COOLANT_LEAK'
  | 'AIR_BRAKE_SYSTEM'
  | 'ELECTRICAL_ALTERNATOR'
  | 'TRANSMISSION_CLUTCH'
  | 'COLLISION_HAZARD';

export interface EmergencyBreakdownReport {
  id: string;
  timestamp: string;
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
  sosStatus: 'BROADCAST_ACTIVE' | 'DISPATCH_ACKNOWLEDGED' | 'MOBILE_TECH_EN_ROUTE' | 'RESOLVED_TOWED';
  dispatchedVendor?: string;
  etaMinutes?: number;
  sha256AuditHash: string;
}

export interface PhoneTutorialStep {
  id: number;
  title: string;
  category: 'OVERVIEW' | 'BROKERS' | 'RECEIVERS' | 'DISPATCH' | 'EMERGENCY' | 'HANDS_FREE';
  summary: string;
  explanation: string;
  proTips: string[];
  actionLabel?: string;
}

export interface ActiveCallSession {
  contactName: string;
  phoneNumber: string;
  category: FleetCallCategory;
  callerBadge?: string;
  isMuted: boolean;
  isSpeakerOn: boolean;
  durationSeconds: number;
  isRecordingDetention: boolean;
  detentionRecordedProof?: string;
  notes?: string;
}

// ==========================================
// FEATURE GOVERNANCE & ROLE PERMISSION TYPES
// ==========================================

export type FeatureCategory =
  | 'COMMAND & DISPATCH'
  | 'IN-CAB SAFETY & COMMS'
  | 'AI ADVOCATE & COMPLIANCE'
  | 'FLEET & OPERATIONS'
  | 'STORE & TOOLS';

export type UserRoleType = 'admin' | 'dispatch' | 'driver' | 'safety' | 'mechanic';

export interface FeatureItem {
  id: TabType;
  name: string;
  shortLabel: string;
  category: FeatureCategory;
  description: string;
  badge?: string;
  isMandatoryStatutory?: boolean; // Cannot be disabled by driver if mandated by DOT (e.g., HOS, DVIR)
  defaultEnabledForRoles: UserRoleType[];
  impactLevel: 'CRITICAL' | 'OPERATIONAL' | 'CONVENIENCE' | 'ENTERTAINMENT';
}

export interface AdminRevocationRecord {
  targetId: string; // role or userId (e.g., "driver", "drv-05", "dispatch")
  targetType: 'ROLE' | 'USER';
  targetName: string;
  revokedFeatures: TabType[];
  reasonNotes?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface EldRawPacket {
  id: string;
  timestamp: string;
  protocol: 'J1939' | 'OBD2' | 'CAN2.0B' | 'J1708';
  pgnOrPid: string;
  sourceAddress: string;
  rawHex: string;
  decodedSummary: string;
  priority: number;
}

export interface CanBusFrequencyDataPoint {
  secondOffset: number; // -59 to 0 (where 0 is current second)
  timeLabel: string; // e.g. "11:24:15"
  timestamp: number; // epoch ms
  totalHz: number; // aggregate message rate in Hz (msgs/sec)
  eec1Hz: number; // PGN 61444 (Engine Speed/Torque)
  ccvsHz: number; // PGN 65265 (Vehicle Speed)
  thermalPressHz: number; // PGN 65262 & 65263 (Coolant & Oil Pressure)
  faultsOtherHz: number; // PGN 65226 DM1 & other diagnostics
  busLoadPct: number; // Estimated % bus bandwidth utilization
  jitterMs: number; // Transmission latency jitter
}

export interface EldEngineDiagnostics {
  engineRpm: number;
  roadSpeedMph: number;
  coolantTempF: number;
  oilPressurePsi: number;
  fuelLevelPct: number;
  defLevelPct: number;
  batteryVoltage: number;
  instantMpg: number;
  totalOdometerMiles: number;
  totalEngineHours: number;
  engineLoadPct: number;
  throttlePositionPct: number;
  malfunctionIndicator: boolean;
  activeDtcCount: number;
}

export interface EldDiagnosticTroubleCode {
  id: string;
  spn: number;
  fmi: number;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  status: 'ACTIVE' | 'PENDING' | 'PREVIOUSLY_ACTIVE';
  firstObserved: string;
  occurrenceCount: number;
}

export interface EldDutyCycleSyncEvent {
  id: string;
  timestamp: string;
  dutyStatus: 'DRIVING' | 'ON_DUTY' | 'SLEEPER' | 'OFF_DUTY';
  speedMph: number;
  engineRpm: number;
  odometerMiles: number;
  engineHours: number;
  location: string;
  gpsCoordinates: string;
  syncDatabaseStatus: 'SYNCED' | 'LOCAL_BUFFERED' | 'COMMITTED';
  databaseRecordHash: string;
}

export interface FeatureGovernanceData {
  catalog: FeatureItem[];
  userPreferences: Record<string, boolean>; // featureId -> isWantedByCurrentCaller
  adminRevocations: Record<string, AdminRevocationRecord>; // targetId -> revocationRecord
  mandatoryLockedFeatures: TabType[]; // Features enforced globally by carrier policy
  systemRoles: {
    role: UserRoleType;
    name: string;
    description: string;
    userCount: number;
  }[];
  activeAuditLogs: {
    id: string;
    timestamp: string;
    adminName: string;
    action: string;
    target: string;
    details: string;
  }[];
}

// ================= APPLET ECOSYSTEM REGISTRY TYPES =================

export interface RegisteredAppletSource {
  sourceType: 'SPANNER' | 'BUNDLED' | string;
  spanner?: {
    id: string;
  };
  bundled?: {
    id: string;
  };
}

export interface RegisteredApplet {
  lastAccessTime: string;
  firstAccessTime: string;
  source: RegisteredAppletSource;
  name?: string;
  description?: string;
  runtimeType?: number;
}

export interface UserAppletsRegistry {
  applets: RegisteredApplet[];
}

// =====================================================================
// === DRIVER TRAINER & ROAD TEST EVALUATION TYPES (49 CFR § 391.31) ===
// =====================================================================

export type RoadTestCategory =
  | 'PRE_TRIP_AIR_BRAKES'
  | 'COUPLING_UNCOUPLING'
  | 'ENGINE_START_GAUGES'
  | 'CONTROLS_AND_SHIFTING'
  | 'BRAKING_AND_STOPPING'
  | 'TRAFFIC_AND_PASSING'
  | 'TURNING_AND_OFFTRACKING'
  | 'CLEARANCE_AND_OVERHEAD'
  | 'RAILROAD_CROSSINGS'
  | 'BACKING_AND_DOCKING'
  | 'POST_TRIP_AND_SECURING';

export type RoadTestItemStatus = 'PASS' | 'NEEDS_WORK' | 'FAIL' | 'CRITICAL_DISQUALIFICATION' | 'UNRATED';

export interface RoadTestEvaluationItem {
  id: string;
  category: RoadTestCategory;
  categoryName: string;
  name: string;
  statutoryCfr: string;
  description: string;
  pointsMax: number;
  isMandatoryFmcsa: boolean;
  isCriticalDisqualifier: boolean; // Automatic failure if failed
  suggestedCriteria: string[];
}

export interface RoadTestTemplate {
  id: string;
  title: string;
  subtitle: string;
  targetVehicleType: string;
  description: string;
  passingScorePercent: number;
  totalItems: number;
  items: RoadTestEvaluationItem[];
}

export type RoadTestOverallResult =
  | 'SATISFACTORY_PASS'
  | 'CONDITIONAL_RETEST'
  | 'NEEDS_REMEDIAL'
  | 'DISQUALIFIED_SAFETY_VIOLATION';

export interface RoadTestScoredItem {
  itemId: string;
  pointsEarned: number;
  status: RoadTestItemStatus;
  trainerNote?: string;
}

export interface RoadTestRecord {
  id: string;
  testDate: string;
  testStartTime: string;
  testEndTime: string;
  templateId: string;
  templateTitle: string;
  
  // Driver Candidate Information
  driverCandidateName: string;
  driverCandidateCdl: string;
  driverCandidateState: string;
  driverCandidatePhone: string;
  driverCandidateEmail?: string;
  yearsExperience: number;

  // Evaluator / Driver Trainer Information
  evaluatorTrainerName: string;
  evaluatorTrainerTitle: string;
  evaluatorTrainerCdl: string;
  evaluatorCompany: string;

  // Equipment Tested
  powerUnitNumber: string;
  powerUnitMakeModel: string;
  trailerNumber: string;
  trailerType: string;
  transmissionType: 'AUTOMATED_MANUAL' | 'MANUAL_10_SPEED' | 'MANUAL_13_SPEED' | 'MANUAL_18_SPEED' | 'AUTOMATIC';
  grossVehicleWeightRating: string;

  // Test Route & Conditions
  routeDescription: string;
  weatherConditions: 'CLEAR_DRY' | 'RAIN_WET' | 'SNOW_ICE' | 'NIGHT_DUSK' | 'HIGH_WIND';
  mileageCovered: number;

  // Evaluation & Scoring
  scores: Record<string, RoadTestScoredItem>;
  totalEarnedPoints: number;
  totalPossiblePoints: number;
  scorePercentage: number;
  hasCriticalFailure: boolean;
  criticalFailureReason?: string;
  overallResult: RoadTestOverallResult;

  // Domain Feedback & Qualitative Critique
  trainerFeedback: {
    safetyAndAwarenessCritique: string;
    vehicleControlAndShiftingCritique: string;
    backingAndManeuveringCritique: string;
    clearanceAndSpatialJudgementCritique: string;
    overallTrainerRecommendation: string;
  };

  // Signatures & FMCSA 49 CFR § 391.31 Certification
  certificateNumber: string;
  evaluatorSignature: string;
  evaluatorSignatureDate: string;
  driverCandidateSignature: string;
  driverCandidateSignatureDate: string;
  cryptographicSealHash: string;
  isSavedToDqf: boolean;
}

// =====================================================================
// === ROADSIDE INSPECTIONS & PORTAL TYPES (CVSA / FMCSA 49 CFR § 396.9) ===
// =====================================================================

export type CvsaInspectionLevel =
  | 'LEVEL_1_COMPREHENSIVE'
  | 'LEVEL_2_WALKAROUND'
  | 'LEVEL_3_DRIVER_CREDENTIALS'
  | 'LEVEL_4_SPECIAL'
  | 'LEVEL_5_VEHICLE_ONLY'
  | 'LEVEL_6_HAZMAT';

export interface RoadsideViolationItem {
  id: string;
  codeCfr: string;
  description: string;
  unitTarget: 'TRACTOR' | 'TRAILER' | 'DRIVER' | 'HAZMAT';
  isOutOfService: boolean;
  severityWeight: number;
  actionTakenNotes?: string;
}

export interface RoadsideInspectionRecord {
  id: string;
  reportNumber: string;
  inspectionDate: string;
  inspectionTime: string;
  stateJurisdiction: string;
  locationDescription: string;
  highwayMileMarker: string;
  inspectingAgency: 'STATE_POLICE' | 'DOT_COMMERCIAL_SAFETY' | 'HIGHWAY_PATROL' | 'FMCSA_FEDERAL' | 'CVSA_CERTIFIED';
  inspectorNameAndBadge: string;

  // Carrier & Driver
  carrierName: string;
  carrierUsDot: string;
  driverName: string;
  driverCdlNumber: string;
  driverCdlState: string;

  // Equipment
  tractorUnitNumber: string;
  tractorVin: string;
  tractorPlate: string;
  trailerUnitNumber: string;
  trailerPlate: string;

  // Inspection Results
  inspectionLevel: CvsaInspectionLevel;
  isCleanPass: boolean;
  isCvsaDecalIssued: boolean;
  outOfService: boolean;
  oosType?: 'VEHICLE_OOS' | 'DRIVER_OOS' | 'BOTH_OOS' | 'NONE';
  violations: RoadsideViolationItem[];

  // Uploaded Document Artifacts
  documentFileName?: string;
  documentFileSize?: string;
  documentFileType?: string;
  documentFileUrl?: string;
  uploadedAt: string;

  // Transmission Workflow: Company
  sentToCompany: boolean;
  sentToCompanyTimestamp?: string;
  companyRecipientEmail?: string;
  companyWorkOrderId?: string;

  // Transmission Workflow: DOT / State Enforcement
  sentToDot: boolean;
  sentToDotTimestamp?: string;
  dotTransmittalTrackingId?: string;
  dot15DayDeadlineDate: string;
  carrierCertifiedCorrectiveAction?: {
    certifiedByName: string;
    certifiedByTitle: string;
    certifiedDate: string;
    repairDetailsNote: string;
    signatureToken: string;
  };

  // EaseRewards Integration
  rewardPointsCredited?: number;
  statusNotes?: string;
}

export interface EldHardwareNode {
  id: string;
  nodeName: string;
  vehicleUnit: string;
  vehicleType: 'Tractor' | 'Reefer Trailer' | 'Dry Van' | 'In-Cab Display' | 'Diagnostic Sensor';
  model: string;
  serialNumber: string;
  interfaceType: 'J1939 9-Pin' | 'OBD-II CAN' | 'BLE 5.3' | 'USB-CAN 2.0B' | 'LTE-M Cellular';
  connectionStatus: 'CONNECTED' | 'SYNCING' | 'STANDBY' | 'LOW_BATTERY' | 'OFFLINE';
  signalStrength: {
    rssiDbm: number; // e.g. -64 dBm
    qualityPct: number; // 0-100%
    rating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    carrierOrProtocol: string; // e.g. "Verizon LTE-M B13" or "Direct BLE 5.3"
    bars: number; // 1-5
  };
  battery: {
    levelPct: number; // 0-100
    voltage: number; // e.g. 14.1 or 4.15
    powerSource: 'VEHICLE_BUS' | 'INTERNAL_LI_ION' | 'SOLAR_FLOAT' | 'USB_POWER';
    chargingState: 'CHARGING' | 'MAINTAINED' | 'STANDBY' | 'DISCHARGING';
    estimatedHoursRemaining?: number;
    healthPct: number;
  };
  firmware: {
    currentVersion: string;
    latestAvailableVersion: string;
    status: 'CURRENT' | 'UPDATE_AVAILABLE' | 'DOWNLOADING' | 'VERIFYING' | 'INSTALLED';
    fmcsaCertificationId: string;
    buildDate: string;
    sha256Hash: string;
  };
  telemetry: {
    latencyMs: number;
    packetsProcessed: number;
    errorRatePct: number;
    temperatureC: number;
    lastPingTime: string;
  };
}

// =====================================================================
// === REAL-TIME DIAGNOSTIC PULSE & ENGINE BASELINE ALERT SYSTEM =======
// =====================================================================

export type PulseCadenceStatus =
  | 'RHYTHMIC_NOMINAL'
  | 'ASYMMETRIC_DRIFT'
  | 'ARRHYTHMIC_DEVIATION'
  | 'CRITICAL_MALFUNCTION';

export interface DiagnosticPulseAlert {
  id: string;
  timestamp: string;
  epochMs: number;
  parameterKey: string;
  parameterName: string;
  pgnOrPid: string;
  currentValue: number;
  currentValueFormatted: string;
  baselineExpected: string;
  deviationPct: number;
  severity: 'alert' | 'warning';
  cadenceStatus: PulseCadenceStatus;
  fmcsaCitation: string;
  rootCauseHypothesis: string;
  recommendedAction: string;
  acknowledged: boolean;
}

export interface EnginePerformanceBaseline {
  key: string;
  parameterName: string;
  category: 'THERMAL' | 'PRESSURE' | 'ELECTRICAL' | 'DRIVETRAIN' | 'BUS_TIMING' | 'EMISSIONS';
  pgnOrPid: string;
  unit: string;
  nominalMin: number;
  nominalMax: number;
  criticalLow?: number;
  criticalHigh?: number;
  tolerancePct: number;
  description: string;
  fmcsaCitation: string;
}

export interface PulseBaselineProfile {
  id: string;
  name: string;
  description: string;
  engineModel: string;
  baselines: Record<string, { min: number; max: number; criticalHigh?: number; criticalLow?: number }>;
}

export interface CustomAuditRule {
  id: string;
  name: string;
  citation: string;
  targetValue: string;
  unit: string;
  severity: 'STATUTORY_MANDATORY' | 'SAFETY_CRITICAL' | 'FLEET_POLICY';
  enabled: boolean;
  description: string;
  addedAt: string;
}

export interface DotFmcsaConfig {
  carrierName: string;
  usdotNumber: string;
  mcNumber: string;
  operatingAuthorityStatus: 'ACTIVE' | 'PENDING' | 'REINSTATED';
  baseState: string;
  dutyCycle: '70_HOUR_8_DAY' | '60_HOUR_7_DAY';
  restartWindowConstraint: boolean;
  shortHaul16HrExceptionEnabled: boolean;
  agricultural150AirMileEnabled: boolean;
  adverseDrivingConditionsEnabled: boolean;
  personalConveyanceMaxMilesPerDay: number;
  yardMoveMaxSpeedMph: number;
  splitSleeperEligible: boolean;
  dataTransferMethod: 'WEB_SERVICES' | 'SECURE_EMAIL' | 'BLUETOOTH_USB';
  diagnosticMissingFrameThresholdSec: number;
  odometerConcordanceTolerancePct: number;
  utcTimeToleranceMin: number;
  unidentifiedMoveThresholdMph: number;
  customRules: CustomAuditRule[];
  lastModified: string;
}

// ================= REAL-TIME ELD COMPLIANCE & HARDWARE LINK ALERTS =================

export interface EldHardwareMalfunctionIndicator {
  code: string;
  fmcsaStandardCode: string; // e.g. "§ 4.6.1.1 Engine Synchronization"
  severity: 'MALFUNCTION' | 'DATA_DIAGNOSTIC' | 'WARNING' | 'CLEAR';
  description: string;
  occurredAt: string;
  cleared: boolean;
}

export interface EldComplianceAlert {
  id: string;
  unitNumber: string;
  driverName: string;
  driverId: string;
  dutyStatus: 'DRIVING' | 'ON_DUTY' | 'OFF_DUTY' | 'SLEEPER_BERTH' | 'PERSONAL_CONVEYANCE' | 'YARD_MOVE';
  // HOS Countdowns (in minutes)
  drivingMinutesRemaining: number; // 11-hour driving limit (max 660 mins)
  shiftMinutesRemaining: number; // 14-hour duty window (max 840 mins)
  cycleMinutesRemaining: number; // 70-hour / 8-day cycle (max 4200 mins)
  restBreakMinutesRemaining: number; // 8-hour consecutive driving limit (max 480 mins)
  // Threshold Warning Flags
  isApproachingDrivingLimit: boolean;
  isApproachingShiftLimit: boolean;
  isApproachingBreakLimit: boolean;
  isApproachingCycleLimit: boolean;
  // Hardware Diagnostics & CAN-Bus Link
  hardwareConnected: boolean;
  hardwareProtocol: 'J1939_9_PIN_CANBUS' | 'OBD2_DIRECT_ECM' | 'J1708_HEAVY_DUTY' | 'WIRELESS_BLE_GATEWAY';
  signalQualityPct: number; // 0 - 100%
  dataStreamFrequencyHz: number; // e.g. 50 Hz
  engineSyncStatus: 'SYNCHRONIZED' | 'UNSYNCHRONIZED' | 'DEGRADED';
  powerComplianceStatus: 'COMPLIANT' | 'VOLTAGE_DROP_WARNING' | 'BATTERY_DISCONNECTED';
  timingComplianceStatus: 'GPS_UTC_LOCKED' | 'DRIFT_DETECTED' | 'DESYNCHRONIZED';
  positioningStatus: 'ACCURATE_3D_FIX' | 'DEGRADED_SIGNAL' | 'NO_GPS_FIX';
  malfunctionIndicators: EldHardwareMalfunctionIndicator[];
  lastHeartbeatIso: string;
  updatedAt: string;
}

// ================= GEMINI HR DOCUMENT AUDITOR AGENT (PART 391 & EXPIRATION / SIGNATURE SCANNER) =================

export type DocumentComplianceStatus =
  | 'COMPLIANT_PASS'
  | 'NEARING_EXPIRATION'
  | 'EXPIRING_CRITICAL'
  | 'EXPIRED_FAIL'
  | 'MISSING_SIGNATURE_FAIL'
  | 'FRAUD_OR_MISMATCH_FAIL';

export type AuditedDocumentType =
  | 'CDL_LICENSE'
  | 'DOT_MEDICAL_CARD_MCSA5876'
  | 'ANNUAL_CERTIFICATE_OF_VIOLATIONS'
  | 'CONTROLLED_SUBSTANCES_CONSENT'
  | 'PRIOR_EMPLOYER_SAFETY_INQUIRY'
  | 'ROAD_TEST_CERTIFICATE'
  | 'HAZMAT_TSA_SECURITY_CLEARANCE'
  | 'I9_EMPLOYMENT_ELIGIBILITY'
  | 'GENERAL_POLICY_ACKNOWLEDGMENT';

export interface FmcsaDefectViolation {
  code: string;
  title: string;
  citation: string;
  severity: 'CRITICAL_OUT_OF_SERVICE' | 'HIGH_CIVIL_PENALTY' | 'RECORDKEEPING_WARNING';
  description: string;
  remedy: string;
}

export interface HrDocumentAuditResult {
  id: string;
  auditTimestamp: string;
  driverId: string;
  driverName: string;
  documentType: AuditedDocumentType;
  documentCategoryName: string;
  overallComplianceStatus: DocumentComplianceStatus;
  complianceScore: number; // 0 - 100
  extractedFields: {
    documentNumber: string;
    stateOrAuthority: string;
    issueDate: string | null;
    expirationDate: string | null;
    daysUntilExpiration: number | null;
    isExpired: boolean;
    isNearingExpiration: boolean;
    nrcmeRegistryNumber?: string | null;
    medicalExaminerName?: string | null;
    driverNameOnDoc?: string | null;
    restrictions?: string | null;
    endorsements?: string | null;
  };
  signatureAudit: {
    driverSignaturePresent: boolean;
    driverSignatureConfidence: number;
    driverSignatureLocation?: string;
    certifierSignaturePresent: boolean;
    certifierSignatureName?: string;
    certifierSignatureConfidence: number;
    dateSignedPresent: boolean;
    signatureDefectDescription?: string;
  };
  fmcsaViolationsFound: FmcsaDefectViolation[];
  fleetManagerNotification: {
    required: boolean;
    urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
    notificationTitle: string;
    notificationBody: string;
    recommendedAction: string;
    alertTriggeredAt: string;
    smsBroadcastDraft: string;
    emailBroadcastDraft: string;
    dispatched: boolean;
  };
  geminiModelUsed: string;
  aiReasoning: string;
}











// NASA Satellite & Earthdata Interfaces
export interface NasaCorridorFireIncident {
  lat: number;
  lng: number;
  brightness: number;
  acqDate: string;
  acqTime: string;
  satellite: string;
  confidence: string;
  frp: number;
  daynight: string;
  distanceMiles: number;
}

export interface NasaCorridorFireThreat {
  threatLevel: 'NOMINAL_CLEAR' | 'SMOKE_ADVISORY' | 'CRITICAL_THREAT' | 'CORRIDOR_CLOSED';
  summary: string;
  nearestFireMiles: number;
  nearestFireFRP: number;
  plumeDensity: 'CLEAR' | 'LIGHT_SMOKE' | 'DENSE_HAZE';
  recommendedLaneAction: string;
  activeFireCount50Miles: number;
  activeFireCount100Miles: number;
  fireIncidents: NasaCorridorFireIncident[];
}

export interface NasaPowerAtmosphericTelemetry {
  surfaceTempF: number;
  airTempF: number;
  surfaceVsAirDeltaF: number;
  windSpeed10mMph: number;
  windSpeed50mMph: number;
  upperCabShearFactor: number;
  rolloverDangerIndex: number;
  pavementBlowoutRisk: 'NORMAL' | 'ELEVATED_TIRE_STRESS' | 'EXTREME_BLOWOUT_HEAT' | 'BLACK_ICE_FREEZE';
  tireHeatWarning: string;
  blackIceProbability: number;
  relativeHumidity: number;
  solarRadiationWm2: number;
  source: string;
}

export interface NasaEarthdataShield {
  status: 'AUTHENTICATED' | 'OFFLINE' | 'SIMULATED';
  uid: string;
  tokenExpires: number;
  corridor: string;
  location: string;
  wildfireRadar: NasaCorridorFireThreat;
  atmosphericTelemetry: NasaPowerAtmosphericTelemetry;
  lastSatellitePass: string;
  satelliteSensors: string[];
}
