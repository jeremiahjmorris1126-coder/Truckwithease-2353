/**
 * ============================================================================
 * TRUCKWITHEASE™ DRIVER QUALIFICATION FILE (DQF) & COMPLIANCE SERVICE
 * Compliant with 49 CFR Part 391 & Part 382 (FMCSA Federal Safety Regulations)
 * ============================================================================
 */

import {
  DriverDqfProfile,
  DqfChecklistItem,
  AnnualReviewRecord,
  PriorEmployerSafetyInquiry,
  ClearinghouseQueryRecord,
  ContinuousMvrAlert,
  MobileOnboardingSession,
} from '../types';

export const INITIAL_DRIVER_DQF_PROFILES: DriverDqfProfile[] = [
  {
    driverId: 'drv-001',
    driverName: 'Marcus Bell',
    cdlNumber: 'CDL-MO-8942109',
    cdlState: 'MO',
    dotNumber: '3849102',
    carrierName: 'TRUCKWITHEASE ENTERPRISE LOGISTICS LLC',
    overallComplianceScore: 100,
    status: '100%_AUDIT_READY',
    lastAuditAttestationDate: '2026-09-15',
    auditorSignatureSha256: 'SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    fmcsaLevel1Ready: true,
    checklist: [
      {
        id: 'chk-1',
        code: '391.21',
        title: 'Driver Employment Application',
        statuteCitation: '49 CFR § 391.21',
        status: 'COMPLIANT',
        completedDate: '2024-03-10',
        verifiedBy: 'HR Lead - J. Morris',
        documentFileName: 'Marcus_Bell_Form391_21_SignedApp.pdf',
        documentHashSha256: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        notes: 'Full 10-year commercial driving history verified with no unexplained gaps.',
      },
      {
        id: 'chk-2',
        code: '391.23_MVR',
        title: 'Initial 3-Year Motor Vehicle Record (MVR)',
        statuteCitation: '49 CFR § 391.23(a)(1)',
        status: 'COMPLIANT',
        completedDate: '2024-03-12',
        expirationDate: '2027-03-12',
        verifiedBy: 'Missouri Dept of Revenue DMV',
        documentFileName: 'MVR_MO_MarcusBell_Certified3Yr.pdf',
        notes: 'Zero points, zero suspensions, valid Class A with Tanker (N) & Hazmat (H).',
      },
      {
        id: 'chk-3',
        code: '391.23_SAFETY',
        title: '3-Year Prior Employer Safety & D&A Inquiries',
        statuteCitation: '49 CFR § 391.23(a)(2) & (e)',
        status: 'COMPLIANT',
        completedDate: '2024-03-24',
        verifiedBy: 'Safety Director',
        documentFileName: 'PriorEmployer_SafetyPerformance_Clearance.pdf',
        notes: 'Responses received from Swift Transportation & Werner. 0 preventable accidents, 0 D&A violations.',
      },
      {
        id: 'chk-4',
        code: '391.31',
        title: 'Road Test Certificate or CDL Equivalent',
        statuteCitation: '49 CFR § 391.31',
        status: 'COMPLIANT',
        completedDate: '2024-03-14',
        verifiedBy: 'Certified Driver Trainer Marcus Reed',
        documentFileName: 'FMCSA_Form391_31_RoadTest_Report.pdf',
        notes: 'Passed comprehensive 45-mile road test with 53ft dry van & backing evaluations.',
      },
      {
        id: 'chk-5',
        code: '391.43_MED',
        title: 'DOT Medical Examiner Certificate (MCSA-5876)',
        statuteCitation: '49 CFR § 391.43',
        status: 'COMPLIANT',
        completedDate: '2025-05-18',
        expirationDate: '2027-05-18',
        verifiedBy: 'Dr. Robert Sullivan (National Registry #8492019482)',
        documentFileName: 'MCSA_5876_MedCard_MarcusBell.pdf',
        notes: '2-Year Medical Clearance. No corrective lenses or hearing restrictions.',
      },
      {
        id: 'chk-6',
        code: '391.25_ANNUAL',
        title: 'Annual Driving Record Review & Cert of Violations',
        statuteCitation: '49 CFR § 391.25 & § 391.27',
        status: 'COMPLIANT',
        completedDate: '2026-03-11',
        expirationDate: '2027-03-11',
        verifiedBy: 'Safety Director & Driver Marcus Bell',
        documentFileName: 'AnnualReview_391_25_MarcusBell_Signed.pdf',
        notes: 'Annual MVR pulled, 0 violations declared by driver, approved to operate.',
      },
      {
        id: 'chk-7',
        code: '382.301_DRUG',
        title: 'Pre-Employment Negative Drug Test',
        statuteCitation: '49 CFR § 382.301',
        status: 'COMPLIANT',
        completedDate: '2024-03-13',
        verifiedBy: 'Quest Diagnostics / MRO Dr. Karen Vance',
        documentFileName: 'CCF_PreEmployment_DrugScreen_NEGATIVE.pdf',
        notes: 'Verified 5-panel DOT urine drug screen result: NEGATIVE.',
      },
      {
        id: 'chk-8',
        code: '382.701_CLEARINGHOUSE',
        title: 'FMCSA Drug & Alcohol Clearinghouse Query',
        statuteCitation: '49 CFR § 382.701',
        status: 'COMPLIANT',
        completedDate: '2026-03-11',
        expirationDate: '2027-03-11',
        verifiedBy: 'FMCSA Clearinghouse Portal (Tx: #CLM-849201)',
        documentFileName: 'Clearinghouse_AnnualQuery_CleanCertificate.pdf',
        notes: 'Annual Limited Query: Driver not prohibited from operating commercial motor vehicles.',
      },
      {
        id: 'chk-9',
        code: 'CDL_COLOR_SCAN',
        title: 'Commercial Driver License (CDL) Color Scan',
        statuteCitation: '49 CFR § 383.23',
        status: 'COMPLIANT',
        completedDate: '2024-03-10',
        expirationDate: '2028-08-14',
        verifiedBy: 'HR Lead',
        documentFileName: 'CDL_Front_Back_ColorVerified_MarcusBell.pdf',
        notes: 'Class A CDL, Valid, Endorsements: N, H, T. Real ID Compliant.',
      },
      {
        id: 'chk-10',
        code: '391.53_SECURITY',
        title: 'Driver Investigation History & Confidential File',
        statuteCitation: '49 CFR § 391.53',
        status: 'COMPLIANT',
        completedDate: '2024-03-25',
        verifiedBy: 'Compliance Vault',
        documentFileName: 'Confidential_Investigation_Vault_Signed.pdf',
        notes: 'Stored in encrypted confidential partition with restricted HR access.',
      },
    ],
  },
  {
    driverId: 'drv-002',
    driverName: 'Darius Thorne',
    cdlNumber: 'CDL-IL-4920194',
    cdlState: 'IL',
    dotNumber: '3849102',
    carrierName: 'TRUCKWITHEASE ENTERPRISE LOGISTICS LLC',
    overallComplianceScore: 90,
    status: 'WARNING_EXPIRING',
    lastAuditAttestationDate: '2026-08-20',
    auditorSignatureSha256: 'SHA256:9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    fmcsaLevel1Ready: true,
    checklist: [
      {
        id: 'chk-201',
        code: '391.21',
        title: 'Driver Employment Application',
        statuteCitation: '49 CFR § 391.21',
        status: 'COMPLIANT',
        completedDate: '2024-06-01',
        verifiedBy: 'HR Lead',
        documentFileName: 'Darius_Thorne_Application.pdf',
      },
      {
        id: 'chk-202',
        code: '391.43_MED',
        title: 'DOT Medical Examiner Certificate (MCSA-5876)',
        statuteCitation: '49 CFR § 391.43',
        status: 'EXPIRING_SOON',
        completedDate: '2025-10-25',
        expirationDate: '2026-10-25',
        verifiedBy: 'Dr. Alice Chen (#948201)',
        documentFileName: 'MCSA_5876_DariusThorne.pdf',
        notes: 'Expires in 24 days! Renewal physical scheduled with Concentra Urgent Care.',
      },
      {
        id: 'chk-203',
        code: '382.701_CLEARINGHOUSE',
        title: 'FMCSA Clearinghouse Annual Query',
        statuteCitation: '49 CFR § 382.701',
        status: 'COMPLIANT',
        completedDate: '2026-06-01',
        expirationDate: '2027-06-01',
        verifiedBy: 'FMCSA Portal',
        documentFileName: 'Clearinghouse_DariusThorne.pdf',
      },
      {
        id: 'chk-204',
        code: '391.25_ANNUAL',
        title: 'Annual Driving Record Review',
        statuteCitation: '49 CFR § 391.25',
        status: 'COMPLIANT',
        completedDate: '2026-06-05',
        expirationDate: '2027-06-05',
        verifiedBy: 'Safety Director',
        documentFileName: 'AnnualReview_DariusThorne.pdf',
      },
      {
        id: 'chk-205',
        code: 'CDL_COLOR_SCAN',
        title: 'Commercial Driver License (CDL)',
        statuteCitation: '49 CFR § 383.23',
        status: 'COMPLIANT',
        completedDate: '2024-06-01',
        expirationDate: '2028-11-20',
        verifiedBy: 'HR Lead',
        documentFileName: 'CDL_DariusThorne.pdf',
      },
      {
        id: 'chk-206',
        code: '382.301_DRUG',
        title: 'Pre-Employment Negative Drug Test',
        statuteCitation: '49 CFR § 382.301',
        status: 'COMPLIANT',
        completedDate: '2024-06-02',
        verifiedBy: 'Labcorp',
        documentFileName: 'DrugScreen_DariusThorne.pdf',
      },
      {
        id: 'chk-207',
        code: '391.31',
        title: 'Road Test Certificate',
        statuteCitation: '49 CFR § 391.31',
        status: 'COMPLIANT',
        completedDate: '2024-06-03',
        verifiedBy: 'Trainer',
        documentFileName: 'RoadTest_DariusThorne.pdf',
      },
      {
        id: 'chk-208',
        code: '391.23_MVR',
        title: 'Initial 3-Year Motor Vehicle Record',
        statuteCitation: '49 CFR § 391.23',
        status: 'COMPLIANT',
        completedDate: '2024-06-01',
        verifiedBy: 'Illinois Secretary of State',
        documentFileName: 'MVR_IL_DariusThorne.pdf',
      },
      {
        id: 'chk-209',
        code: '391.23_SAFETY',
        title: 'Prior Employer Safety Inquiries',
        statuteCitation: '49 CFR § 391.23',
        status: 'COMPLIANT',
        completedDate: '2024-06-20',
        verifiedBy: 'HR Specialist',
        documentFileName: 'PriorEmployer_DariusThorne.pdf',
      },
      {
        id: 'chk-210',
        code: '391.53_SECURITY',
        title: 'Confidential Driver Security File',
        statuteCitation: '49 CFR § 391.53',
        status: 'COMPLIANT',
        completedDate: '2024-06-22',
        verifiedBy: 'Compliance Vault',
        documentFileName: 'SecurityVault_DariusThorne.pdf',
      },
    ],
  },
  {
    driverId: 'drv-003',
    driverName: 'Elena Vance',
    cdlNumber: 'CDL-TX-7849102',
    cdlState: 'TX',
    dotNumber: '3849102',
    carrierName: 'TRUCKWITHEASE ENTERPRISE LOGISTICS LLC',
    overallComplianceScore: 100,
    status: '100%_AUDIT_READY',
    lastAuditAttestationDate: '2026-09-01',
    auditorSignatureSha256: 'SHA256:8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e',
    fmcsaLevel1Ready: true,
    checklist: [
      {
        id: 'chk-301',
        code: '391.21',
        title: 'Driver Employment Application',
        statuteCitation: '49 CFR § 391.21',
        status: 'COMPLIANT',
        completedDate: '2023-11-15',
        verifiedBy: 'HR Lead',
        documentFileName: 'Elena_Vance_Application.pdf',
      },
      {
        id: 'chk-302',
        code: '391.43_MED',
        title: 'DOT Medical Examiner Certificate',
        statuteCitation: '49 CFR § 391.43',
        status: 'COMPLIANT',
        completedDate: '2025-08-10',
        expirationDate: '2027-08-10',
        verifiedBy: 'Dr. Gregory House (#482910)',
        documentFileName: 'MCSA_5876_ElenaVance.pdf',
      },
      {
        id: 'chk-303',
        code: '382.701_CLEARINGHOUSE',
        title: 'FMCSA Clearinghouse Annual Query',
        statuteCitation: '49 CFR § 382.701',
        status: 'COMPLIANT',
        completedDate: '2025-11-15',
        expirationDate: '2026-11-15',
        verifiedBy: 'FMCSA Portal',
        documentFileName: 'Clearinghouse_ElenaVance.pdf',
      },
      {
        id: 'chk-304',
        code: '391.25_ANNUAL',
        title: 'Annual Driving Record Review',
        statuteCitation: '49 CFR § 391.25',
        status: 'COMPLIANT',
        completedDate: '2025-11-14',
        expirationDate: '2026-11-14',
        verifiedBy: 'Safety Director',
        documentFileName: 'AnnualReview_ElenaVance.pdf',
      },
      {
        id: 'chk-305',
        code: 'CDL_COLOR_SCAN',
        title: 'Commercial Driver License (CDL)',
        statuteCitation: '49 CFR § 383.23',
        status: 'COMPLIANT',
        completedDate: '2023-11-15',
        expirationDate: '2027-09-30',
        verifiedBy: 'HR Lead',
        documentFileName: 'CDL_ElenaVance.pdf',
      },
      {
        id: 'chk-306',
        code: '382.301_DRUG',
        title: 'Pre-Employment Negative Drug Test',
        statuteCitation: '49 CFR § 382.301',
        status: 'COMPLIANT',
        completedDate: '2023-11-16',
        verifiedBy: 'Quest Diagnostics',
        documentFileName: 'DrugScreen_ElenaVance.pdf',
      },
      {
        id: 'chk-307',
        code: '391.31',
        title: 'Road Test Certificate',
        statuteCitation: '49 CFR § 391.31',
        status: 'COMPLIANT',
        completedDate: '2023-11-17',
        verifiedBy: 'Safety Director',
        documentFileName: 'RoadTest_ElenaVance.pdf',
      },
      {
        id: 'chk-308',
        code: '391.23_MVR',
        title: 'Initial 3-Year MVR',
        statuteCitation: '49 CFR § 391.23',
        status: 'COMPLIANT',
        completedDate: '2023-11-15',
        verifiedBy: 'Texas DPS',
        documentFileName: 'MVR_TX_ElenaVance.pdf',
      },
      {
        id: 'chk-309',
        code: '391.23_SAFETY',
        title: 'Prior Employer Safety Inquiries',
        statuteCitation: '49 CFR § 391.23',
        status: 'COMPLIANT',
        completedDate: '2023-12-05',
        verifiedBy: 'HR Specialist',
        documentFileName: 'PriorEmployer_ElenaVance.pdf',
      },
      {
        id: 'chk-310',
        code: '391.53_SECURITY',
        title: 'Confidential Driver Security File',
        statuteCitation: '49 CFR § 391.53',
        status: 'COMPLIANT',
        completedDate: '2023-12-10',
        verifiedBy: 'Compliance Vault',
        documentFileName: 'SecurityVault_ElenaVance.pdf',
      },
    ],
  },
];

export const INITIAL_ANNUAL_REVIEWS: AnnualReviewRecord[] = [
  {
    id: 'rev-001',
    driverId: 'drv-001',
    driverName: 'Marcus Bell',
    reviewDate: '2026-03-11',
    reviewerName: 'Jeremiah J. Morris',
    reviewerTitle: 'Safety Director & Fleet Admin',
    mvrState: 'MO',
    mvrOrderedDate: '2026-03-10',
    mvrStatus: 'CLEAR',
    violationsList: [],
    driverSignedCertificateDate: '2026-03-11 09:42 CST',
    driverSignature: 'Marcus Bell (Digital e-Signature Verified)',
    managerDetermination: 'MEETS_STANDARDS',
    statuteCitation: '49 CFR § 391.25 & § 391.27',
    status: 'COMPLETED_SIGNED',
  },
  {
    id: 'rev-002',
    driverId: 'drv-002',
    driverName: 'Darius Thorne',
    reviewDate: '2026-06-05',
    reviewerName: 'Jeremiah J. Morris',
    reviewerTitle: 'Safety Director',
    mvrState: 'IL',
    mvrOrderedDate: '2026-06-04',
    mvrStatus: 'CLEAR',
    violationsList: [],
    driverSignedCertificateDate: '2026-06-05 14:15 CST',
    driverSignature: 'Darius Thorne (Digital e-Signature Verified)',
    managerDetermination: 'MEETS_STANDARDS',
    statuteCitation: '49 CFR § 391.25 & § 391.27',
    status: 'COMPLETED_SIGNED',
  },
];

export const INITIAL_PRIOR_EMPLOYER_INQUIRIES: PriorEmployerSafetyInquiry[] = [
  {
    id: 'inq-001',
    driverId: 'drv-001',
    driverName: 'Marcus Bell',
    priorCompanyName: 'Swift Transportation Logistics LLC',
    priorCompanyPhone: '1-800-800-2200',
    priorCompanyEmail: 'verifications@swifttrans.com',
    priorCompanyAddress: '2200 S 75th Ave, Phoenix, AZ 85043',
    employmentDates: '04/2021 - 02/2024',
    dateInquirySent: '2024-03-12',
    dateResponseReceived: '2024-03-18',
    status: 'RESPONSE_RECEIVED_VERIFIED',
    accidentHistoryFound: false,
    drugAlcoholViolationsFound: false,
    eligibleForRehire: true,
    verifiedByMethod: 'DIGITAL_PORTAL',
    trackingToken: 'TWE-INQ-SWIFT-849201',
  },
  {
    id: 'inq-002',
    driverId: 'drv-001',
    driverName: 'Marcus Bell',
    priorCompanyName: 'Werner Enterprises Dedicated Fleet',
    priorCompanyPhone: '1-402-895-6640',
    priorCompanyEmail: 'safety.verification@werner.com',
    priorCompanyAddress: '14507 Frontier Rd, Omaha, NE 68138',
    employmentDates: '01/2019 - 03/2021',
    dateInquirySent: '2024-03-12',
    dateResponseReceived: '2024-03-24',
    status: 'RESPONSE_RECEIVED_VERIFIED',
    accidentHistoryFound: false,
    drugAlcoholViolationsFound: false,
    eligibleForRehire: true,
    verifiedByMethod: 'ELECTRONIC_FAX',
    trackingToken: 'TWE-INQ-WERNER-948210',
  },
  {
    id: 'inq-003',
    driverId: 'drv-004',
    driverName: 'Carlos Mendez',
    priorCompanyName: 'Knight Transportation Regional',
    priorCompanyPhone: '1-602-269-2000',
    priorCompanyEmail: 'hr.inquiries@knighttrans.com',
    priorCompanyAddress: '5601 W Buckeye Rd, Phoenix, AZ 85043',
    employmentDates: '08/2022 - 07/2024',
    dateInquirySent: '2026-09-18',
    status: 'INQUIRY_SENT',
    accidentHistoryFound: false,
    drugAlcoholViolationsFound: false,
    eligibleForRehire: true,
    verifiedByMethod: 'DIGITAL_PORTAL',
    trackingToken: 'TWE-INQ-KNIGHT-392819',
  },
];

export const INITIAL_CLEARINGHOUSE_QUERIES: ClearinghouseQueryRecord[] = [
  {
    id: 'clh-001',
    driverId: 'drv-001',
    driverName: 'Marcus Bell',
    cdlNumber: 'CDL-MO-8942109',
    cdlState: 'MO',
    queryType: 'ANNUAL_LIMITED_BATCH',
    queryDate: '2026-03-11',
    consentObtained: true,
    consentTimestamp: '2026-03-11 08:30 CST',
    clearinghouseResult: 'RECORD_NOT_FOUND_CLEAN',
    fmcsaTransactionId: 'FMCSA-CH-2026-9482109',
    nextScheduledQueryDate: '2027-03-11',
  },
  {
    id: 'clh-002',
    driverId: 'drv-002',
    driverName: 'Darius Thorne',
    cdlNumber: 'CDL-IL-4920194',
    cdlState: 'IL',
    queryType: 'ANNUAL_LIMITED_BATCH',
    queryDate: '2026-06-01',
    consentObtained: true,
    consentTimestamp: '2026-06-01 10:14 CST',
    clearinghouseResult: 'RECORD_NOT_FOUND_CLEAN',
    fmcsaTransactionId: 'FMCSA-CH-2026-4920194',
    nextScheduledQueryDate: '2027-06-01',
  },
  {
    id: 'clh-003',
    driverId: 'drv-003',
    driverName: 'Elena Vance',
    cdlNumber: 'CDL-TX-7849102',
    cdlState: 'TX',
    queryType: 'ANNUAL_LIMITED_BATCH',
    queryDate: '2025-11-15',
    consentObtained: true,
    consentTimestamp: '2025-11-15 09:00 CST',
    clearinghouseResult: 'RECORD_NOT_FOUND_CLEAN',
    fmcsaTransactionId: 'FMCSA-CH-2025-7849102',
    nextScheduledQueryDate: '2026-11-15',
  },
];

export const INITIAL_CONTINUOUS_MVR_ALERTS: ContinuousMvrAlert[] = [
  {
    id: 'mvr-alt-001',
    driverId: 'drv-001',
    driverName: 'Marcus Bell',
    cdlNumber: 'CDL-MO-8942109',
    cdlState: 'MO',
    detectedAt: '2026-09-30 04:00 CST',
    severity: 'ROUTINE_CLEAR_PING',
    description: '24/7 National DMV Watchdog Sweep: CDL Status VALID, 0 new violations or suspensions across all 50 states.',
    jurisdiction: 'Missouri DOR / AAMVA CDLIS Network',
    pointsAdded: 0,
    actionRequired: 'None. Record verified clean.',
    status: 'REVIEWED_RESOLVED',
  },
  {
    id: 'mvr-alt-002',
    driverId: 'drv-002',
    driverName: 'Darius Thorne',
    cdlNumber: 'CDL-IL-4920194',
    cdlState: 'IL',
    detectedAt: '2026-09-28 11:30 CST',
    severity: 'MEDICAL_DOWNGRADE',
    description: 'Medical Card Expiration Proximity Alert (24 Days Remaining). Must upload renewed MCSA-5876 prior to Oct 25, 2026.',
    jurisdiction: 'Illinois Secretary of State Commercial Division',
    pointsAdded: 0,
    actionRequired: 'Driver notified to submit Concentra DOT Physical documentation.',
    status: 'UNRESOLVED',
  },
];

export const INITIAL_MOBILE_ONBOARD_SESSIONS: MobileOnboardingSession[] = [
  {
    id: 'ses-001',
    inviteCode: 'HIRE-MB849',
    driverName: 'Jamal Washington',
    phone: '1-314-555-0199',
    email: 'jamal.washington.cdl@gmail.com',
    carrierName: 'TRUCKWITHEASE ENTERPRISE LOGISTICS LLC',
    dotNumber: '3849102',
    shareableUrl: 'https://join.truckwithease.com/onboard/HIRE-MB849',
    createdDate: '2026-09-29',
    status: 'DOCS_UPLOADED',
    cdlFrontUploaded: true,
    medCardUploaded: true,
    fcraConsentSigned: true,
    clearinghouseConsentSigned: true,
  },
];

class DriverDqfComplianceService {
  private profiles: Map<string, DriverDqfProfile> = new Map();
  private annualReviews: AnnualReviewRecord[] = [...INITIAL_ANNUAL_REVIEWS];
  private priorInquiries: PriorEmployerSafetyInquiry[] = [...INITIAL_PRIOR_EMPLOYER_INQUIRIES];
  private clearinghouseQueries: ClearinghouseQueryRecord[] = [...INITIAL_CLEARINGHOUSE_QUERIES];
  private mvrAlerts: ContinuousMvrAlert[] = [...INITIAL_CONTINUOUS_MVR_ALERTS];
  private mobileSessions: MobileOnboardingSession[] = [...INITIAL_MOBILE_ONBOARD_SESSIONS];
  private listeners: (() => void)[] = [];

  constructor() {
    INITIAL_DRIVER_DQF_PROFILES.forEach((p) => this.profiles.set(p.driverId, { ...p }));
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const savedProfiles = window.localStorage.getItem('twe_dqf_profiles');
      if (savedProfiles) {
        const parsed = JSON.parse(savedProfiles) as DriverDqfProfile[];
        parsed.forEach((p) => this.profiles.set(p.driverId, p));
      }

      const savedReviews = window.localStorage.getItem('twe_annual_reviews');
      if (savedReviews) this.annualReviews = JSON.parse(savedReviews);

      const savedInquiries = window.localStorage.getItem('twe_prior_inquiries');
      if (savedInquiries) this.priorInquiries = JSON.parse(savedInquiries);

      const savedClearinghouse = window.localStorage.getItem('twe_clearinghouse_queries');
      if (savedClearinghouse) this.clearinghouseQueries = JSON.parse(savedClearinghouse);

      const savedAlerts = window.localStorage.getItem('twe_mvr_alerts');
      if (savedAlerts) this.mvrAlerts = JSON.parse(savedAlerts);

      const savedSessions = window.localStorage.getItem('twe_mobile_sessions');
      if (savedSessions) this.mobileSessions = JSON.parse(savedSessions);
    } catch {
      // ignore
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem('twe_dqf_profiles', JSON.stringify(Array.from(this.profiles.values())));
      window.localStorage.setItem('twe_annual_reviews', JSON.stringify(this.annualReviews));
      window.localStorage.setItem('twe_prior_inquiries', JSON.stringify(this.priorInquiries));
      window.localStorage.setItem('twe_clearinghouse_queries', JSON.stringify(this.clearinghouseQueries));
      window.localStorage.setItem('twe_mvr_alerts', JSON.stringify(this.mvrAlerts));
      window.localStorage.setItem('twe_mobile_sessions', JSON.stringify(this.mobileSessions));
    } catch {
      // ignore
    }
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('DQF listener error:', e);
      }
    });
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public getAllProfiles(): DriverDqfProfile[] {
    return Array.from(this.profiles.values());
  }

  public getProfile(driverId: string): DriverDqfProfile | undefined {
    return this.profiles.get(driverId) || this.profiles.get('drv-001');
  }

  public getAnnualReviews(): AnnualReviewRecord[] {
    return [...this.annualReviews];
  }

  public getPriorEmployerInquiries(): PriorEmployerSafetyInquiry[] {
    return [...this.priorInquiries];
  }

  public getClearinghouseQueries(): ClearinghouseQueryRecord[] {
    return [...this.clearinghouseQueries];
  }

  public getMvrAlerts(): ContinuousMvrAlert[] {
    return [...this.mvrAlerts];
  }

  public getMobileSessions(): MobileOnboardingSession[] {
    return [...this.mobileSessions];
  }

  /**
   * Simulates high-speed OCR extraction on uploaded Medical Card or CDL
   */
  public async executeOcrScan(
    driverId: string,
    docType: 'MED_CARD' | 'CDL',
    simulatedFields: {
      expirationDate: string;
      registryOrLicenseNumber: string;
      examinerOrState: string;
      restrictions?: string;
    }
  ): Promise<{ success: boolean; extractedData: any; updatedProfile: DriverDqfProfile }> {
    const profile = this.getProfile(driverId);
    if (!profile) throw new Error('Driver profile not found');

    const checklistItem = profile.checklist.find((c) =>
      docType === 'MED_CARD' ? c.code === '391.43_MED' : c.code === 'CDL_COLOR_SCAN'
    );

    if (checklistItem) {
      checklistItem.status = 'COMPLIANT';
      checklistItem.completedDate = new Date().toISOString().split('T')[0];
      checklistItem.expirationDate = simulatedFields.expirationDate;
      checklistItem.verifiedBy = `OCR Verified: ${simulatedFields.examinerOrState} (#${simulatedFields.registryOrLicenseNumber})`;
      checklistItem.notes = `Auto-extracted via TruckWithEase Neural OCR with 99.8% confidence. Restrictions: ${simulatedFields.restrictions || 'None'}.`;
    }

    // Recalculate overall score
    const compliantCount = profile.checklist.filter((c) => c.status === 'COMPLIANT').length;
    profile.overallComplianceScore = Math.round((compliantCount / profile.checklist.length) * 100);
    profile.status = profile.overallComplianceScore === 100 ? '100%_AUDIT_READY' : 'WARNING_EXPIRING';

    this.profiles.set(driverId, profile);
    this.notify();

    return {
      success: true,
      extractedData: {
        docType,
        ...simulatedFields,
        extractedAt: new Date().toISOString(),
        confidenceScore: 99.8,
      },
      updatedProfile: profile,
    };
  }

  /**
   * Submits a completed 49 CFR § 391.25 Annual Review
   */
  public submitAnnualReview(review: Omit<AnnualReviewRecord, 'id'>): AnnualReviewRecord {
    const newRecord: AnnualReviewRecord = {
      ...review,
      id: `rev-${Date.now().toString().slice(-6)}`,
    };
    this.annualReviews.unshift(newRecord);

    // Update DQF checklist for that driver
    const profile = this.getProfile(review.driverId);
    if (profile) {
      const item = profile.checklist.find((c) => c.code === '391.25_ANNUAL');
      if (item) {
        item.status = 'COMPLIANT';
        item.completedDate = review.reviewDate;
        item.expirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        item.verifiedBy = `${review.reviewerName} (${review.reviewerTitle})`;
        item.notes = `Annual review completed with 0 disqualifying violations. Determination: ${review.managerDetermination}.`;
      }
      this.profiles.set(review.driverId, profile);
    }

    this.notify();
    return newRecord;
  }

  /**
   * Dispatches automated prior employer inquiry (49 CFR § 391.23)
   */
  public dispatchPriorInquiry(
    inquiry: Omit<
      PriorEmployerSafetyInquiry,
      'id' | 'trackingToken' | 'status' | 'dateInquirySent' | 'accidentHistoryFound' | 'drugAlcoholViolationsFound' | 'eligibleForRehire'
    >
  ): PriorEmployerSafetyInquiry {
    const newInquiry: PriorEmployerSafetyInquiry = {
      ...inquiry,
      id: `inq-${Date.now().toString().slice(-6)}`,
      trackingToken: `TWE-INQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'INQUIRY_SENT',
      dateInquirySent: new Date().toISOString().split('T')[0],
      accidentHistoryFound: false,
      drugAlcoholViolationsFound: false,
      eligibleForRehire: true,
    };
    this.priorInquiries.unshift(newInquiry);
    this.notify();
    return newInquiry;
  }

  /**
   * Executes an FMCSA Clearinghouse query
   */
  public executeClearinghouseQuery(
    driverId: string,
    queryType: 'PRE_EMPLOYMENT_FULL' | 'ANNUAL_LIMITED_BATCH'
  ): ClearinghouseQueryRecord {
    const profile = this.getProfile(driverId);
    const driverName = profile ? profile.driverName : 'Marcus Bell';
    const cdlNumber = profile ? profile.cdlNumber : 'CDL-MO-8942109';
    const cdlState = profile ? profile.cdlState : 'MO';

    const newQuery: ClearinghouseQueryRecord = {
      id: `clh-${Date.now().toString().slice(-6)}`,
      driverId,
      driverName,
      cdlNumber,
      cdlState,
      queryType,
      queryDate: new Date().toISOString().split('T')[0],
      consentObtained: true,
      consentTimestamp: new Date().toISOString(),
      clearinghouseResult: 'RECORD_NOT_FOUND_CLEAN',
      fmcsaTransactionId: `FMCSA-CH-${Date.now().toString().slice(-8)}`,
      nextScheduledQueryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    this.clearinghouseQueries.unshift(newQuery);

    if (profile) {
      const item = profile.checklist.find((c) => c.code === '382.701_CLEARINGHOUSE');
      if (item) {
        item.status = 'COMPLIANT';
        item.completedDate = newQuery.queryDate;
        item.expirationDate = newQuery.nextScheduledQueryDate;
        item.verifiedBy = `FMCSA Clearinghouse (#${newQuery.fmcsaTransactionId})`;
        item.notes = 'Clean record query certified with zero prohibited drug/alcohol violations.';
      }
      this.profiles.set(driverId, profile);
    }

    this.notify();
    return newQuery;
  }

  /**
   * Generates a fast mobile onboarding link for recruit candidates
   */
  public createMobileOnboardSession(driverName: string, phone: string, email: string): MobileOnboardingSession {
    const inviteCode = `HIRE-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newSession: MobileOnboardingSession = {
      id: `ses-${Date.now().toString().slice(-6)}`,
      inviteCode,
      driverName,
      phone,
      email,
      carrierName: 'TRUCKWITHEASE ENTERPRISE LOGISTICS LLC',
      dotNumber: '3849102',
      shareableUrl: `https://join.truckwithease.com/onboard/${inviteCode}`,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'LINK_GENERATED',
      cdlFrontUploaded: false,
      medCardUploaded: false,
      fcraConsentSigned: false,
      clearinghouseConsentSigned: false,
    };

    this.mobileSessions.unshift(newSession);
    this.notify();
    return newSession;
  }
}

export const driverDqfComplianceService = new DriverDqfComplianceService();
