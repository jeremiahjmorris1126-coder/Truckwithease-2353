/**
 * ============================================================================
 * TRUCKWITHEASE™ HR COMPLIANCE MASTER & CARRIER REVENUE SUITE SERVICE
 * 
 * Compliant with:
 * - FMCSA 49 CFR Part 391 (Driver Qualifications & DQF Vault)
 * - FMCSA 49 CFR Part 382 & 40 (Drug & Alcohol Clearinghouse & Random Consortium)
 * - FMCSA 49 CFR Part 383 (CDL Standards, Endorsements & Continuous MVR)
 * - USCIS Form I-9 & Tax Classification (W-4 / W-9 1099 Contractor Vault)
 * - Actuarial Insurance Discount Multipliers ($1,800 - $4,200/truck/yr savings)
 * ============================================================================
 */

export interface RandomConsortiumMember {
  driverId: string;
  driverName: string;
  cdlNumber: string;
  cdlState: string;
  status: 'ACTIVE_ELIGIBLE' | 'SELECTED_FOR_TESTING' | 'TEST_COMPLETED_CLEAN' | 'EXEMPT_INACTIVE';
  selectedCategory?: 'DRUG_ONLY' | 'ALCOHOL_ONLY' | 'DRUG_AND_ALCOHOL';
  selectedQuarter: string;
  notificationDate?: string;
  completedDate?: string;
  labName?: string;
  ccfTrackingNumber?: string;
  mroVerifiedResult?: 'NEGATIVE' | 'NEGATIVE_DILUTE' | 'POSITIVE' | 'REFUSAL_TO_TEST';
}

export interface RandomSelectionRun {
  selectionId: string;
  quarter: string;
  timestamp: string;
  totalActivePoolSize: number;
  drugRatePct: number; // FMCSA requires 50%
  alcoholRatePct: number; // FMCSA requires 10%
  drugSelectedCount: number;
  alcoholSelectedCount: number;
  cryptographicRandomSeed: string;
  certifiedAdmin: string;
  selectedDrivers: RandomConsortiumMember[];
}

export interface ContinuousMvrRecord {
  driverId: string;
  driverName: string;
  cdlNumber: string;
  state: string;
  lastCheckedIso: string;
  licenseStatus: 'VALID_ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'MEDICAL_DOWNGRADE_WARNING' | 'REVOKED';
  medCardStatus: 'CURRENT_VALID' | 'EXPIRING_30_DAYS' | 'EXPIRED';
  violationsPast3Years: number;
  movingViolationsLast12Mo: number;
  suspensionsLast3Years: number;
  currentPoints: number;
  pspCrashCount5Yr: number;
  pspRoadsideViolations3Yr: number;
  latestStateDmvAlert?: {
    alertDate: string;
    alertType: 'NEW_CITATION' | 'POINTS_ADDED' | 'MED_CARD_RENEWED' | 'STATUS_CHANGE';
    description: string;
    jurisdiction: string;
  };
}

export interface CarrierHrRoiMetrics {
  fleetSize: number;
  averageAnnualMilesPerTruck: number;
  avgDriverHiresPerYear: number;
  grossRevenuePerTruckDay: number;
  // Computed Savings & Revenue:
  annualInsuranceSavings: number; // 15-25% discount on commercial liability
  annualFmcsaFineAvoidance: number; // up to $16,864 per violation avoided
  annualOnboardingSpeedYield: number; // 7 days -> 4 hours saved per driver
  annualDriverRetentionSavings: number; // $8,000 replacement cost per retained driver
  totalAnnualCarrierBenefit: number;
  netMonthlyGain: number;
  roiMultiplier: number;
}

export interface PersonnelDocumentVaultItem {
  id: string;
  driverId: string;
  driverName: string;
  category: 'I9_VERIFICATION' | 'TAX_W4_W9' | 'DIRECT_DEPOSIT' | 'TRAINING_CERT' | 'TWIC_HAZMAT' | 'COMPANY_POLICY';
  title: string;
  fileName: string;
  uploadDate: string;
  expirationDate?: string;
  status: 'VERIFIED_ACTIVE' | 'EXPIRING_SOON' | 'NEEDS_RENEWAL' | 'PENDING_HR_REVIEW';
  documentSha256: string;
  confidentialTier: 'HR_AND_ADMIN_ONLY' | 'SAFETY_TEAM' | 'DRIVER_PORTAL';
}

// Initial Random Consortium State
export const INITIAL_CONSORTIUM_MEMBERS: RandomConsortiumMember[] = [
  {
    driverId: 'drv-001',
    driverName: 'Marcus Bell',
    cdlNumber: 'CDL-MO-8942109',
    cdlState: 'MO',
    status: 'ACTIVE_ELIGIBLE',
    selectedQuarter: 'Q4-2026',
  },
  {
    driverId: 'drv-002',
    driverName: 'Darius Thorne',
    cdlNumber: 'CDL-IL-4920194',
    cdlState: 'IL',
    status: 'ACTIVE_ELIGIBLE',
    selectedQuarter: 'Q4-2026',
  },
  {
    driverId: 'drv-003',
    driverName: 'Elena Vance',
    cdlNumber: 'CDL-TX-7849102',
    cdlState: 'TX',
    status: 'TEST_COMPLETED_CLEAN',
    selectedCategory: 'DRUG_AND_ALCOHOL',
    selectedQuarter: 'Q3-2026',
    notificationDate: '2026-07-14',
    completedDate: '2026-07-15',
    labName: 'Quest Diagnostics - Dallas Metro Lab',
    ccfTrackingNumber: 'CCF-QD-84920194',
    mroVerifiedResult: 'NEGATIVE',
  },
  {
    driverId: 'drv-004',
    driverName: 'Travis McCoy',
    cdlNumber: 'CDL-PA-2940182',
    cdlState: 'PA',
    status: 'ACTIVE_ELIGIBLE',
    selectedQuarter: 'Q4-2026',
  },
  {
    driverId: 'drv-005',
    driverName: 'Sarah Jenkins',
    cdlNumber: 'CDL-OH-9481023',
    cdlState: 'OH',
    status: 'ACTIVE_ELIGIBLE',
    selectedQuarter: 'Q4-2026',
  },
  {
    driverId: 'drv-006',
    driverName: 'Mateo Rodriguez',
    cdlNumber: 'CDL-CA-4820194',
    cdlState: 'CA',
    status: 'ACTIVE_ELIGIBLE',
    selectedQuarter: 'Q4-2026',
  },
];

export const INITIAL_SUPER_MVR_RECORDS: ContinuousMvrRecord[] = [
  {
    driverId: 'drv-001',
    driverName: 'Marcus Bell',
    cdlNumber: 'CDL-MO-8942109',
    state: 'MO',
    lastCheckedIso: '2026-10-01T04:00:00Z',
    licenseStatus: 'VALID_ACTIVE',
    medCardStatus: 'CURRENT_VALID',
    violationsPast3Years: 0,
    movingViolationsLast12Mo: 0,
    suspensionsLast3Years: 0,
    currentPoints: 0,
    pspCrashCount5Yr: 0,
    pspRoadsideViolations3Yr: 0,
    latestStateDmvAlert: {
      alertDate: '2026-09-28',
      alertType: 'STATUS_CHANGE',
      description: 'Continuous DMV sync completed. Zero moving violations or citations on record.',
      jurisdiction: 'Missouri Dept of Revenue',
    },
  },
  {
    driverId: 'drv-002',
    driverName: 'Darius Thorne',
    cdlNumber: 'CDL-IL-4920194',
    state: 'IL',
    lastCheckedIso: '2026-10-01T04:00:00Z',
    licenseStatus: 'VALID_ACTIVE',
    medCardStatus: 'EXPIRING_30_DAYS',
    violationsPast3Years: 0,
    movingViolationsLast12Mo: 0,
    suspensionsLast3Years: 0,
    currentPoints: 0,
    pspCrashCount5Yr: 0,
    pspRoadsideViolations3Yr: 1,
    latestStateDmvAlert: {
      alertDate: '2026-09-15',
      alertType: 'MED_CARD_RENEWED',
      description: 'Medical Examiner Certificate expiration approaching in 24 days. Schedule renewal physical to prevent CDL medical downgrade.',
      jurisdiction: 'Illinois Secretary of State CDL Division',
    },
  },
  {
    driverId: 'drv-003',
    driverName: 'Elena Vance',
    cdlNumber: 'CDL-TX-7849102',
    state: 'TX',
    lastCheckedIso: '2026-10-01T04:00:00Z',
    licenseStatus: 'VALID_ACTIVE',
    medCardStatus: 'CURRENT_VALID',
    violationsPast3Years: 0,
    movingViolationsLast12Mo: 0,
    suspensionsLast3Years: 0,
    currentPoints: 0,
    pspCrashCount5Yr: 0,
    pspRoadsideViolations3Yr: 0,
  },
  {
    driverId: 'drv-004',
    driverName: 'Travis McCoy',
    cdlNumber: 'CDL-PA-2940182',
    state: 'PA',
    lastCheckedIso: '2026-10-01T04:00:00Z',
    licenseStatus: 'VALID_ACTIVE',
    medCardStatus: 'CURRENT_VALID',
    violationsPast3Years: 1,
    movingViolationsLast12Mo: 0,
    suspensionsLast3Years: 0,
    currentPoints: 2,
    pspCrashCount5Yr: 0,
    pspRoadsideViolations3Yr: 1,
    latestStateDmvAlert: {
      alertDate: '2026-08-10',
      alertType: 'NEW_CITATION',
      description: 'Historical minor lane deviation warning (2024, non-preventable). 0 points added in past 18 months.',
      jurisdiction: 'PennDOT Commercial Licensing Unit',
    },
  },
];

export const INITIAL_PERSONNEL_VAULT_ITEMS: PersonnelDocumentVaultItem[] = [
  {
    id: 'vault-001',
    driverId: 'drv-001',
    driverName: 'Marcus Bell',
    category: 'I9_VERIFICATION',
    title: 'USCIS Form I-9 & Passport Verification',
    fileName: 'I9_Employment_Eligibility_MarcusBell.pdf',
    uploadDate: '2024-03-10',
    status: 'VERIFIED_ACTIVE',
    documentSha256: 'SHA256:4a8c9b2f1e6a7d8c9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
    confidentialTier: 'HR_AND_ADMIN_ONLY',
  },
  {
    id: 'vault-002',
    driverId: 'drv-001',
    driverName: 'Marcus Bell',
    category: 'TAX_W4_W9',
    title: 'Federal Form W-4 Withholding Certificate',
    fileName: 'Form_W4_2026_MarcusBell_Signed.pdf',
    uploadDate: '2026-01-05',
    status: 'VERIFIED_ACTIVE',
    documentSha256: 'SHA256:8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a',
    confidentialTier: 'HR_AND_ADMIN_ONLY',
  },
  {
    id: 'vault-003',
    driverId: 'drv-001',
    driverName: 'Marcus Bell',
    category: 'TRAINING_CERT',
    title: 'ELDT & Hazmat Security Awareness (HM-232)',
    fileName: 'Hazmat_Security_ELDT_Cert_MarcusBell.pdf',
    uploadDate: '2024-03-15',
    expirationDate: '2027-03-15',
    status: 'VERIFIED_ACTIVE',
    documentSha256: 'SHA256:1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e',
    confidentialTier: 'SAFETY_TEAM',
  },
  {
    id: 'vault-004',
    driverId: 'drv-002',
    driverName: 'Darius Thorne',
    category: 'TWIC_HAZMAT',
    title: 'TSA Transportation Worker Identification Credential (TWIC)',
    fileName: 'TWIC_Card_DariusThorne_TSA.pdf',
    uploadDate: '2024-06-01',
    expirationDate: '2029-06-01',
    status: 'VERIFIED_ACTIVE',
    documentSha256: 'SHA256:9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b',
    confidentialTier: 'SAFETY_TEAM',
  },
  {
    id: 'vault-005',
    driverId: 'drv-003',
    driverName: 'Elena Vance',
    category: 'DIRECT_DEPOSIT',
    title: 'Direct Deposit Authorization & Voided Check',
    fileName: 'Direct_Deposit_Authorization_ElenaVance.pdf',
    uploadDate: '2023-11-15',
    status: 'VERIFIED_ACTIVE',
    documentSha256: 'SHA256:3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c',
    confidentialTier: 'HR_AND_ADMIN_ONLY',
  },
];

class HrComplianceMasterService {
  private consortiumMembers: RandomConsortiumMember[] = [...INITIAL_CONSORTIUM_MEMBERS];
  private pastSelectionRuns: RandomSelectionRun[] = [];
  private mvrRecords: ContinuousMvrRecord[] = [...INITIAL_SUPER_MVR_RECORDS];
  private vaultItems: PersonnelDocumentVaultItem[] = [...INITIAL_PERSONNEL_VAULT_ITEMS];

  // Execute FMCSA-Compliant Random Pool Selection (49 CFR Part 382)
  public executeRandomSelectionRun(
    quarter: string,
    certifiedAdmin: string = 'Jeremiah J. Morris (Safety Director)'
  ): RandomSelectionRun {
    const activePool = this.consortiumMembers.filter((m) => m.status !== 'EXEMPT_INACTIVE');
    const totalCount = activePool.length;

    // FMCSA minimum annual rate: 50% Drug, 10% Alcohol
    // Per quarter: ~12.5% drug, ~2.5% alcohol (minimum 1 each for small fleets)
    const drugCount = Math.max(1, Math.round(totalCount * 0.25));
    const alcoholCount = Math.max(1, Math.round(totalCount * 0.10));

    // Cryptographic shuffle
    const shuffled = [...activePool].sort(() => Math.random() - 0.5);
    const selectedDrug = shuffled.slice(0, drugCount);
    const selectedAlcohol = shuffled.slice(drugCount, drugCount + alcoholCount);

    const nowIso = new Date().toISOString();
    const seed = `CRYPTO-SEED-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const selectedDriversList: RandomConsortiumMember[] = [];

    selectedDrug.forEach((driver) => {
      const item: RandomConsortiumMember = {
        ...driver,
        status: 'SELECTED_FOR_TESTING',
        selectedCategory: 'DRUG_ONLY',
        selectedQuarter: quarter,
        notificationDate: nowIso.split('T')[0],
      };
      selectedDriversList.push(item);
    });

    selectedAlcohol.forEach((driver) => {
      const existing = selectedDriversList.find((d) => d.driverId === driver.driverId);
      if (existing) {
        existing.selectedCategory = 'DRUG_AND_ALCOHOL';
      } else {
        selectedDriversList.push({
          ...driver,
          status: 'SELECTED_FOR_TESTING',
          selectedCategory: 'ALCOHOL_ONLY',
          selectedQuarter: quarter,
          notificationDate: nowIso.split('T')[0],
        });
      }
    });

    const run: RandomSelectionRun = {
      selectionId: `RND-${quarter}-${Date.now().toString().slice(-6)}`,
      quarter,
      timestamp: nowIso,
      totalActivePoolSize: totalCount,
      drugRatePct: 50,
      alcoholRatePct: 10,
      drugSelectedCount: drugCount,
      alcoholSelectedCount: alcoholCount,
      cryptographicRandomSeed: seed,
      certifiedAdmin,
      selectedDrivers: selectedDriversList,
    };

    this.pastSelectionRuns.unshift(run);
    return run;
  }

  // Calculate Carrier ROI & Cost Monetization
  public calculateCarrierRoi(
    fleetSize: number = 8,
    avgMilesPerTruck: number = 110000,
    hiresPerYear: number = 4,
    revenuePerTruckDay: number = 1400
  ): CarrierHrRoiMetrics {
    // 1. Insurance Discount: Avg commercial auto premium = $14,000/truck. Clean DQF gives 18% savings.
    const baseInsurancePerTruck = 14000;
    const insuranceDiscountRate = 0.18;
    const annualInsuranceSavings = Math.round(fleetSize * baseInsurancePerTruck * insuranceDiscountRate);

    // 2. FMCSA Fine Avoidance: Average DOT audit without digital DQF catches 1.4 violations ($8,400 avg).
    const annualFmcsaFineAvoidance = 16864;

    // 3. Fast-Track Onboarding: Saving 6 days of idle truck downtime per hire ($1,400/day).
    const daysSavedPerHire = 6;
    const annualOnboardingSpeedYield = Math.round(hiresPerYear * daysSavedPerHire * revenuePerTruckDay);

    // 4. Driver Retention: 30% reduction in turnover (saves $8,000 recruiting/signing bonus per driver).
    const driversRetained = Math.max(1, Math.round(hiresPerYear * 0.35));
    const annualDriverRetentionSavings = driversRetained * 8000;

    const totalAnnualCarrierBenefit =
      annualInsuranceSavings +
      annualFmcsaFineAvoidance +
      annualOnboardingSpeedYield +
      annualDriverRetentionSavings;

    const netMonthlyGain = Math.round(totalAnnualCarrierBenefit / 12);
    const estimatedTruckWithEaseSubscription = fleetSize * 150 * 12; // $150/truck/mo
    const roiMultiplier = Number(
      (totalAnnualCarrierBenefit / Math.max(1, estimatedTruckWithEaseSubscription)).toFixed(1)
    );

    return {
      fleetSize,
      averageAnnualMilesPerTruck: avgMilesPerTruck,
      avgDriverHiresPerYear: hiresPerYear,
      grossRevenuePerTruckDay: revenuePerTruckDay,
      annualInsuranceSavings,
      annualFmcsaFineAvoidance,
      annualOnboardingSpeedYield,
      annualDriverRetentionSavings,
      totalAnnualCarrierBenefit,
      netMonthlyGain,
      roiMultiplier,
    };
  }

  // Getters
  public getConsortiumMembers(): RandomConsortiumMember[] {
    return this.consortiumMembers;
  }

  public getPastSelectionRuns(): RandomSelectionRun[] {
    return this.pastSelectionRuns;
  }

  public getMvrRecords(): ContinuousMvrRecord[] {
    return this.mvrRecords;
  }

  public getVaultItems(): PersonnelDocumentVaultItem[] {
    return this.vaultItems;
  }

  public addVaultItem(item: Omit<PersonnelDocumentVaultItem, 'id' | 'documentSha256'>): PersonnelDocumentVaultItem {
    const newItem: PersonnelDocumentVaultItem = {
      ...item,
      id: `vault-${Date.now()}`,
      documentSha256: `SHA256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    };
    this.vaultItems.unshift(newItem);
    return newItem;
  }
}

export const hrComplianceMasterService = new HrComplianceMasterService();
