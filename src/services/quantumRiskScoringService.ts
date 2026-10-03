/**
 * ============================================================================
 * TRUCKWITHEASE™ QUANTUM RISK SCORING ENGINE
 * 
 * Multi-vector actuarial algorithm analyzing:
 * 1. Real-time highway CAN-bus telematics (J1939 harsh brake/accel/speed/headway)
 * 2. FMCSA carrier safety history (BASIC percentiles, crash indicator, HOS)
 * 3. Actuarial insurance risk profiles (operating radius, claims, cargo class)
 * 
 * Dynamically computes real-time 'Insurance Risk Score' & live premium discounts.
 * ============================================================================
 */

import {
  QuantumTelematicsVector,
  QuantumCarrierSafetyVector,
  QuantumInsuranceRiskProfileVector,
  QuantumRiskScoreBreakdown,
} from '../types';

export const DEFAULT_QUANTUM_TELEMATICS: QuantumTelematicsVector = {
  harshBrakingPer1000Mi: 0.32,
  rapidAccelPer1000Mi: 0.25,
  speedCompliancePct: 98.9,
  excessiveSpeedMinutesPer100Mi: 0.35,
  lateralGForceEvents: 0.12,
  nightDrivingExposurePct: 11.8,
  headwayRadarAlertsPer100Mi: 0.42,
  ptoIdleExcessHours: 0.85,
};

export const DEFAULT_QUANTUM_CARRIER_SAFETY: QuantumCarrierSafetyVector = {
  dotNumber: '3849102',
  carrierName: 'TRUCKWITHEASE ENTERPRISE LOGISTICS LLC',
  fmcsaUnsafeDrivingPercentile: 11.2,
  fmcsaHosCompliancePercentile: 5.4,
  fmcsaCrashIndicatorPercentile: 3.8,
  fmcsaVehicleMaintPercentile: 14.1,
  outOfServiceRatePct: 2.4, // National avg is 21.4%
  dvirDefectCorrectionRatePct: 99.8,
  driverTurnoverAnnualPct: 15.2,
  yearsInActiveAuthority: 6.2,
};

export const DEFAULT_QUANTUM_INSURANCE_PROFILE: QuantumInsuranceRiskProfileVector = {
  fleetSize: 4,
  operatingRadius: 'LONG_HAUL_OTR_NATIONWIDE',
  cargoRiskClass: 'GENERAL_FREIGHT',
  priorLossClaimsLast3Years: 0,
  annualMileagePerTruck: 118000,
  eldTamperResistanceScore: 99.4,
  baseEstimatedAnnualPremiumPerTruck: 14200,
};

/**
 * Evaluates the three multidimensional vectors and returns the comprehensive
 * Quantum Risk Score breakdown and dynamic discount rating.
 */
export function computeQuantumRiskScore(
  telematics: QuantumTelematicsVector = DEFAULT_QUANTUM_TELEMATICS,
  safety: QuantumCarrierSafetyVector = DEFAULT_QUANTUM_CARRIER_SAFETY,
  insurance: QuantumInsuranceRiskProfileVector = DEFAULT_QUANTUM_INSURANCE_PROFILE
): QuantumRiskScoreBreakdown {
  // 1. Calculate Telematics Risk Component (0 - 100, where 0 is zero risk)
  // Normalizing metrics against commercial actuarial thresholds
  const harshBrakeRisk = Math.min(100, (telematics.harshBrakingPer1000Mi / 2.5) * 100);
  const speedRisk = Math.min(100, Math.max(0, (100 - telematics.speedCompliancePct) * 5.5));
  const rapidAccelRisk = Math.min(100, (telematics.rapidAccelPer1000Mi / 2.0) * 100);
  const excessiveSpeedRisk = Math.min(100, (telematics.excessiveSpeedMinutesPer100Mi / 3.0) * 100);
  const nightDrivingRisk = Math.min(100, (telematics.nightDrivingExposurePct / 35.0) * 100);
  const headwayRisk = Math.min(100, (telematics.headwayRadarAlertsPer100Mi / 2.5) * 100);
  const lateralGRisk = Math.min(100, (telematics.lateralGForceEvents / 1.5) * 100);

  const telematicsRiskRaw =
    harshBrakeRisk * 0.30 +
    speedRisk * 0.25 +
    headwayRisk * 0.15 +
    nightDrivingRisk * 0.12 +
    rapidAccelRisk * 0.10 +
    excessiveSpeedRisk * 0.05 +
    lateralGRisk * 0.03;

  const telematicsRiskComponent = Math.max(5, Math.min(95, Math.round(telematicsRiskRaw * 10) / 10));

  // 2. Calculate Carrier Safety History Component (0 - 100)
  const unsafeDrivingFactor = safety.fmcsaUnsafeDrivingPercentile * 0.38;
  const crashFactor = safety.fmcsaCrashIndicatorPercentile * 0.32;
  const hosFactor = safety.fmcsaHosCompliancePercentile * 0.15;
  const maintFactor = safety.fmcsaVehicleMaintPercentile * 0.15;

  let safetyRiskRaw = unsafeDrivingFactor + crashFactor + hosFactor + maintFactor;

  // Credits for low OOS rate and pristine DVIR resolution
  if (safety.outOfServiceRatePct < 5.0) safetyRiskRaw -= 3.5;
  if (safety.dvirDefectCorrectionRatePct >= 99.0) safetyRiskRaw -= 2.5;
  if (safety.yearsInActiveAuthority >= 5.0) safetyRiskRaw -= 2.0;

  const carrierSafetyHistoryComponent = Math.max(4, Math.min(95, Math.round(safetyRiskRaw * 10) / 10));

  // 3. Calculate Insurance Profile & Actuarial Component (0 - 100)
  let claimsRisk = 0;
  if (insurance.priorLossClaimsLast3Years === 0) claimsRisk = 8;
  else if (insurance.priorLossClaimsLast3Years === 1) claimsRisk = 40;
  else claimsRisk = 85;

  let radiusRisk = 20;
  if (insurance.operatingRadius === 'LOCAL_100MI') radiusRisk = 12;
  else if (insurance.operatingRadius === 'REGIONAL_500MI') radiusRisk = 22;
  else radiusRisk = 34;

  let cargoRisk = 20;
  if (insurance.cargoRiskClass === 'GENERAL_FREIGHT') cargoRisk = 16;
  else if (insurance.cargoRiskClass === 'BUILDING_MATERIALS') cargoRisk = 20;
  else if (insurance.cargoRiskClass === 'REFRIGERATED_FOODS') cargoRisk = 28;
  else if (insurance.cargoRiskClass === 'HAZMAT_CHEM') cargoRisk = 65;

  const tamperCredit = Math.max(0, (insurance.eldTamperResistanceScore - 90) * 0.5);

  const insuranceProfileRaw = (claimsRisk * 0.45 + radiusRisk * 0.30 + cargoRisk * 0.25) - tamperCredit;
  const insuranceProfileComponent = Math.max(6, Math.min(95, Math.round(insuranceProfileRaw * 10) / 10));

  // 4. Quantum Composite Multi-Vector Risk Score (0 - 100, lower is better)
  const compositeQuantumRiskScore = Math.round(
    (telematicsRiskComponent * 0.45 +
      carrierSafetyHistoryComponent * 0.35 +
      insuranceProfileComponent * 0.20) *
      10
  ) / 10;

  // Quantum Safety Score (Inverse: 100 - risk, higher is better)
  const quantumSafetyScore = Math.max(5, Math.min(99, Math.round(100 - compositeQuantumRiskScore)));

  // 5. Tier Assignment, Actuarial Risk Multiplier & Dynamic Premium Discount
  let quantumSafetyTier: QuantumRiskScoreBreakdown['quantumSafetyTier'] = 'QUANTUM_GOLD';
  let dynamicPremiumDiscountPct = 22;
  let actuarialRiskMultiplier = 0.90;

  if (compositeQuantumRiskScore <= 15) {
    quantumSafetyTier = 'QUANTUM_DIAMOND';
    // 33% to 37% dynamic discount
    dynamicPremiumDiscountPct = Math.round((37 - (compositeQuantumRiskScore / 15) * 4) * 10) / 10;
    actuarialRiskMultiplier = 0.63;
  } else if (compositeQuantumRiskScore <= 28) {
    quantumSafetyTier = 'QUANTUM_PLATINUM';
    // 26% to 32.9% dynamic discount
    const progress = (compositeQuantumRiskScore - 15) / 13;
    dynamicPremiumDiscountPct = Math.round((32.9 - progress * 6.9) * 10) / 10;
    actuarialRiskMultiplier = 0.74;
  } else if (compositeQuantumRiskScore <= 45) {
    quantumSafetyTier = 'QUANTUM_GOLD';
    // 18% to 25.9% dynamic discount
    const progress = (compositeQuantumRiskScore - 28) / 17;
    dynamicPremiumDiscountPct = Math.round((25.9 - progress * 7.9) * 10) / 10;
    actuarialRiskMultiplier = 0.88;
  } else if (compositeQuantumRiskScore <= 65) {
    quantumSafetyTier = 'QUANTUM_STANDARD';
    // 8% to 17.9% dynamic discount
    const progress = (compositeQuantumRiskScore - 45) / 20;
    dynamicPremiumDiscountPct = Math.round((17.9 - progress * 9.9) * 10) / 10;
    actuarialRiskMultiplier = 1.02;
  } else {
    quantumSafetyTier = 'ELEVATED_RISK';
    dynamicPremiumDiscountPct = Math.max(0, Math.round((7.9 - ((compositeQuantumRiskScore - 65) / 35) * 7.9) * 10) / 10);
    actuarialRiskMultiplier = 1.28;
  }

  // Savings calculations
  const baseRate = insurance.baseEstimatedAnnualPremiumPerTruck || 14200;
  const estimatedAnnualSavingsPerTruck = Math.round((baseRate * (dynamicPremiumDiscountPct / 100)));
  const totalFleetAnnualSavings = estimatedAnnualSavingsPerTruck * insurance.fleetSize;

  // Mitigators & Underwriting Recommendations
  const keyRiskMitigators: string[] = [];
  if (telematics.speedCompliancePct >= 98.0) {
    keyRiskMitigators.push(`Superior speed governor adherence (${telematics.speedCompliancePct}% within legal highway limits)`);
  }
  if (telematics.harshBrakingPer1000Mi <= 0.5) {
    keyRiskMitigators.push(`Elite deceleration profile (${telematics.harshBrakingPer1000Mi} harsh brakes/1k mi vs 2.1 industry baseline)`);
  }
  if (safety.fmcsaCrashIndicatorPercentile <= 10) {
    keyRiskMitigators.push(`Top decile FMCSA crash indicator score (${safety.fmcsaCrashIndicatorPercentile}% percentile)`);
  }
  if (insurance.priorLossClaimsLast3Years === 0) {
    keyRiskMitigators.push('Zero commercial claims tenure over 36 consecutive months');
  }
  if (telematics.nightDrivingExposurePct <= 15) {
    keyRiskMitigators.push(`Low circadian night driving exposure (${telematics.nightDrivingExposurePct}% 12am-5am)`);
  }

  const underwritingRecommendations: string[] = [
    'Automated telematics continuous-attestation feed pre-qualified for instant monthly credit settlement',
    'Acord 25 Certificate of Insurance instant generation authorized under TruckWithEase Telematics MGA facility',
    'No physical black-box retrofit needed; authenticated directly via J1939 CAN-bus diagnostic port',
  ];

  // Dynamic Partner Carrier Bids based on Quantum Tier
  const partnerCarrierBids = [
    {
      partnerId: 'cover-whale-telematics',
      partnerName: 'Cover Whale Telematics MGA',
      quotedDiscountPct: Math.min(35, Math.round(dynamicPremiumDiscountPct * 1.05 * 10) / 10),
      annualSavingsFleet: Math.round(totalFleetAnnualSavings * 1.05),
      instantBindingEligible: compositeQuantumRiskScore < 45,
      tierRating: quantumSafetyTier,
    },
    {
      partnerId: 'reliance-partners',
      partnerName: 'Reliance Partners Transportation Hub',
      quotedDiscountPct: dynamicPremiumDiscountPct,
      annualSavingsFleet: totalFleetAnnualSavings,
      instantBindingEligible: true,
      tierRating: quantumSafetyTier,
    },
    {
      partnerId: 'hub-international',
      partnerName: 'HUB International Fleet Solutions',
      quotedDiscountPct: Math.round(dynamicPremiumDiscountPct * 0.96 * 10) / 10,
      annualSavingsFleet: Math.round(totalFleetAnnualSavings * 0.96),
      instantBindingEligible: true,
      tierRating: quantumSafetyTier,
    },
    {
      partnerId: 'canal-insurance',
      partnerName: 'Canal Insurance Trucking Unit',
      quotedDiscountPct: Math.round(dynamicPremiumDiscountPct * 0.92 * 10) / 10,
      annualSavingsFleet: Math.round(totalFleetAnnualSavings * 0.92),
      instantBindingEligible: compositeQuantumRiskScore < 50,
      tierRating: quantumSafetyTier,
    },
  ];

  return {
    telematicsRiskComponent,
    carrierSafetyHistoryComponent,
    insuranceProfileComponent,
    compositeQuantumRiskScore,
    quantumSafetyScore,
    quantumSafetyTier,
    actuarialRiskMultiplier,
    dynamicPremiumDiscountPct,
    estimatedAnnualSavingsPerTruck,
    totalFleetAnnualSavings,
    telematicsConfidenceIndex: 98.6,
    riskTrend: compositeQuantumRiskScore < 30 ? 'IMPROVING' : 'STABLE',
    keyRiskMitigators,
    underwritingRecommendations,
    partnerCarrierBids,
    calculatedAt: new Date().toLocaleTimeString(),
  };
}

class QuantumRiskScoringEngine {
  private currentTelematics: QuantumTelematicsVector = { ...DEFAULT_QUANTUM_TELEMATICS };
  private currentSafety: QuantumCarrierSafetyVector = { ...DEFAULT_QUANTUM_CARRIER_SAFETY };
  private currentInsurance: QuantumInsuranceRiskProfileVector = { ...DEFAULT_QUANTUM_INSURANCE_PROFILE };
  private listeners: ((breakdown: QuantumRiskScoreBreakdown) => void)[] = [];
  private lastBreakdown: QuantumRiskScoreBreakdown;

  constructor() {
    this.lastBreakdown = computeQuantumRiskScore(
      this.currentTelematics,
      this.currentSafety,
      this.currentInsurance
    );
  }

  public getScore(): QuantumRiskScoreBreakdown {
    return this.lastBreakdown;
  }

  public getVectors(): {
    telematics: QuantumTelematicsVector;
    safety: QuantumCarrierSafetyVector;
    insurance: QuantumInsuranceRiskProfileVector;
  } {
    return {
      telematics: { ...this.currentTelematics },
      safety: { ...this.currentSafety },
      insurance: { ...this.currentInsurance },
    };
  }

  public updateTelematics(partial: Partial<QuantumTelematicsVector>): QuantumRiskScoreBreakdown {
    this.currentTelematics = { ...this.currentTelematics, ...partial };
    return this.recalculate();
  }

  public updateSafety(partial: Partial<QuantumCarrierSafetyVector>): QuantumRiskScoreBreakdown {
    this.currentSafety = { ...this.currentSafety, ...partial };
    return this.recalculate();
  }

  public updateInsurance(partial: Partial<QuantumInsuranceRiskProfileVector>): QuantumRiskScoreBreakdown {
    this.currentInsurance = { ...this.currentInsurance, ...partial };
    return this.recalculate();
  }

  public resetToDefaults(): QuantumRiskScoreBreakdown {
    this.currentTelematics = { ...DEFAULT_QUANTUM_TELEMATICS };
    this.currentSafety = { ...DEFAULT_QUANTUM_CARRIER_SAFETY };
    this.currentInsurance = { ...DEFAULT_QUANTUM_INSURANCE_PROFILE };
    return this.recalculate();
  }

  public simulateHighwayEvent(eventType: 'HARSH_BRAKE' | 'SPEED_SURGE' | 'SMOOTH_CRUISE' | 'NIGHT_HAUL'): QuantumRiskScoreBreakdown {
    if (eventType === 'HARSH_BRAKE') {
      this.currentTelematics.harshBrakingPer1000Mi = Math.round((this.currentTelematics.harshBrakingPer1000Mi + 0.35) * 100) / 100;
    } else if (eventType === 'SPEED_SURGE') {
      this.currentTelematics.speedCompliancePct = Math.max(75, Math.round((this.currentTelematics.speedCompliancePct - 1.8) * 10) / 10);
      this.currentTelematics.excessiveSpeedMinutesPer100Mi = Math.round((this.currentTelematics.excessiveSpeedMinutesPer100Mi + 0.6) * 10) / 10;
    } else if (eventType === 'SMOOTH_CRUISE') {
      this.currentTelematics.speedCompliancePct = Math.min(99.9, Math.round((this.currentTelematics.speedCompliancePct + 0.6) * 10) / 10);
      this.currentTelematics.harshBrakingPer1000Mi = Math.max(0.1, Math.round((this.currentTelematics.harshBrakingPer1000Mi - 0.08) * 100) / 100);
      this.currentTelematics.headwayRadarAlertsPer100Mi = Math.max(0.1, Math.round((this.currentTelematics.headwayRadarAlertsPer100Mi - 0.05) * 100) / 100);
    } else if (eventType === 'NIGHT_HAUL') {
      this.currentTelematics.nightDrivingExposurePct = Math.min(50, Math.round((this.currentTelematics.nightDrivingExposurePct + 4.5) * 10) / 10);
    }
    return this.recalculate();
  }

  public subscribe(callback: (breakdown: QuantumRiskScoreBreakdown) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private recalculate(): QuantumRiskScoreBreakdown {
    this.lastBreakdown = computeQuantumRiskScore(
      this.currentTelematics,
      this.currentSafety,
      this.currentInsurance
    );
    this.notify();
    return this.lastBreakdown;
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.lastBreakdown);
      } catch (err) {
        console.error('Error in Quantum Risk Scoring listener:', err);
      }
    });
  }
}

export const quantumRiskScoringEngine = new QuantumRiskScoringEngine();
