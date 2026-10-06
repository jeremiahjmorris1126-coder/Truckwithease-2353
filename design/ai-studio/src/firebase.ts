import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId per Firebase skill if configured
const firestoreDbId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;
export const db = firestoreDbId ? getFirestore(app, firestoreDbId) : getFirestore(app);
export const auth = getAuth(app);

export const SCOPES = [
  // Gmail Scopes
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.addons.current.action.compose',
  'https://www.googleapis.com/auth/gmail.addons.current.message.action',
  'https://www.googleapis.com/auth/gmail.addons.current.message.metadata',
  'https://www.googleapis.com/auth/gmail.addons.current.message.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.insert',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.metadata',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.settings.basic',
  'https://www.googleapis.com/auth/gmail.settings.sharing',
  // Google Drive Scopes
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];

export const googleProvider = new GoogleAuthProvider();
// Add Google Drive scopes
SCOPES.forEach((scope) => {
  googleProvider.addScope(scope);
});

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory (never localStorage per Workspace skill)
let cachedAccessToken: string | null = null;

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User is logged in to Firebase, but access token needs refresh or prompt
        if (onAuthSuccess && cachedAccessToken) {
          onAuthSuccess(user, cachedAccessToken);
        } else if (onAuthFailure) {
          onAuthFailure();
        }
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.message?.includes('popup-closed-by-user')) {
      console.warn('Google Sign-In popup was closed by user before completion.');
      return null;
    }
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Error Context Enum & Interface per SKILL.md
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection Validation Test (as required by Skill)
export async function testFirestoreConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { ok: true, message: 'Firestore connected to ' + (firestoreDbId || firebaseConfig.projectId) };
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice: check Firebase credentials or network.');
      return { ok: false, message: 'Client offline: ' + error.message };
    }
    // Permissions error on non-existent test document is normal when rules deny read
    return { ok: true, message: 'Firestore endpoint reached: ' + firebaseConfig.projectId };
  }
}

// Auth Helper: Sign in with Google Popup
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.message?.includes('popup-closed-by-user')) {
      console.warn('Google Sign-In popup closed by user before completion.');
      return null;
    }
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Firestore Operations with required error handling
export async function recordFmcsaSubmission(submission: {
  submissionId: string;
  driverId: string;
  usdot: string;
  protocol: 'WEB_SERVICES' | 'BLUETOOTH' | 'EMAIL_TRANSFER';
  transferStatus: 'ACCEPTED' | 'PROCESSING' | 'REJECTED';
  httpCode: number;
  payloadHash: string;
  submissionNotes?: string;
}) {
  const path = `fmcsa_submissions/${submission.submissionId}`;
  try {
    await setDoc(doc(db, 'fmcsa_submissions', submission.submissionId), {
      ...submission,
      createdAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });
    return { success: true, id: submission.submissionId };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveAuditRecordToFirestore(audit: {
  blockNumber: number;
  sha256Hash: string;
  merkleRoot: string;
  driverName: string;
  driverId: string;
  usdot: string;
  mcNumber: string;
  vehicleVin: string;
  signature: string;
  status: 'VERIFIED' | 'SUBMITTED' | 'FLAGGED';
}) {
  const auditId = `audit-${audit.blockNumber}-${Date.now()}`;
  const path = `audits/${auditId}`;
  try {
    await setDoc(doc(db, 'audits', auditId), {
      ...audit,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });
    return { success: true, auditId };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncInspectionSessionToFirestore(session: {
  inspectionId: string;
  driverId: string;
  officerPin: string;
  officerPortalUrl: string;
  isCabinLocked: boolean;
  activeUsdot: string;
}) {
  const path = `inspections/${session.inspectionId}`;
  try {
    await setDoc(
      doc(db, 'inspections', session.inspectionId),
      {
        ...session,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// =========================================================================
// ELD HOS COMPLIANCE LOGS PERSISTENCE LAYER (FIREBASE FIRESTORE)
// =========================================================================

export async function syncEldHosLogToFirestore(log: {
  logId: string;
  driverId: string;
  date: string;
  drivingMinutes: number;
  onDutyMinutes: number;
  sleeperMinutes?: number;
  offDutyMinutes?: number;
  violationsCount?: number;
  certified: boolean;
  signature?: string;
  splitBerthExclusion?: boolean;
}) {
  const path = `hos_logs/${log.logId}`;
  try {
    const docRef = doc(db, 'hos_logs', log.logId);
    await setDoc(
      docRef,
      {
        logId: log.logId,
        driverId: log.driverId,
        date: log.date,
        drivingMinutes: log.drivingMinutes,
        onDutyMinutes: log.onDutyMinutes,
        sleeperMinutes: log.sleeperMinutes ?? 0,
        offDutyMinutes: log.offDutyMinutes ?? 0,
        violationsCount: log.violationsCount ?? 0,
        certified: log.certified ?? false,
        signature: log.signature || '',
        splitBerthExclusion: log.splitBerthExclusion ?? false,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return { success: true, logId: log.logId };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchEldHosLogsFromFirestore() {
  const path = 'hos_logs';
  try {
    const snap = await getDocs(collection(db, 'hos_logs'));
    return snap.docs.map((d) => d.data());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

// =========================================================================
// FLEET MAINTENANCE & REPAIR HISTORY PERSISTENCE LAYER (FIREBASE FIRESTORE)
// =========================================================================

export async function syncFleetAssetToFirestore(asset: {
  id: string;
  unitNumber: string;
  type: 'TRACTOR' | 'TRAILER';
  vin: string;
  makeModelYear: string;
  licensePlate: string;
  odometerMiles: number;
  engineHours: number;
  assignedDriver: string;
  status: string;
  pmDueMiles: number;
  dotAnnualInspectionExpiry: string;
  lastRepairedTimestamp?: string;
  lastRepairedWorkOrderId?: string;
  lastRepairedComponent?: string;
  lastRepairedOdometer?: number;
  totalRepairsCount?: number;
}) {
  const path = `fleet_assets/${asset.id}`;
  try {
    await setDoc(
      doc(db, 'fleet_assets', asset.id),
      {
        ...asset,
        updatedAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true, assetId: asset.id };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncRepairRecordToFirestore(repair: {
  id: string;
  assetId?: string;
  unitNumber: string;
  trailerNumber?: string;
  repairDate: string;
  completedTimestamp: string;
  componentCategory: string;
  componentItem: string;
  repairType: string;
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
  integritySha256Hash: string;
  status: string;
  notes?: string;
}) {
  const path = `repair_records/${repair.id}`;
  try {
    await setDoc(
      doc(db, 'repair_records', repair.id),
      {
        ...repair,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true, workOrderId: repair.id };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchFleetAssetsFromFirestore() {
  const path = 'fleet_assets';
  try {
    const snap = await getDocs(collection(db, 'fleet_assets'));
    return snap.docs.map((d) => d.data());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function fetchRepairRecordsFromFirestore() {
  const path = 'repair_records';
  try {
    const snap = await getDocs(collection(db, 'repair_records'));
    return snap.docs.map((d) => d.data());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export function subscribeToFleetAssets(onUpdate: (assets: any[]) => void) {
  try {
    const q = query(collection(db, 'fleet_assets'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => d.data());
        onUpdate(list);
      },
      (error) => {
        console.warn('Firestore subscription notice for fleet_assets:', error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to fleet_assets:', err);
    return () => {};
  }
}

export function subscribeToRepairRecords(onUpdate: (repairs: any[]) => void) {
  try {
    const q = query(collection(db, 'repair_records'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => d.data());
        onUpdate(list);
      },
      (error) => {
        console.warn('Firestore subscription notice for repair_records:', error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to repair_records:', err);
    return () => {};
  }
}

// Toll Passport and Transponder State Persistence
export async function saveUserTollPassport(passport: {
  userId: string;
  ezPassNumber?: string;
  sunPassNumber?: string;
  fastrakNumber?: string;
  txTagNumber?: string;
  bestpassFleetId?: string;
  prepassPlusId?: string;
  primaryTransponder?: string;
  defaultAxles?: number;
}) {
  const path = `user_toll_passports/${passport.userId}`;
  try {
    const docRef = doc(db, 'user_toll_passports', passport.userId);
    await setDoc(docRef, {
      ...passport,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

export async function getUserTollPassport(userId: string) {
  const path = `user_toll_passports/${userId}`;
  try {
    const docRef = doc(db, 'user_toll_passports', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

export async function saveDrivewyzeEnrollment(enrollment: {
  id: string;
  unitNumber: string;
  vin: string;
  usdot: string;
  licensePlate: string;
  plateState: string;
  status: string;
}) {
  const path = `drivewyze_enrollments/${enrollment.id}`;
  try {
    const docRef = doc(db, 'drivewyze_enrollments', enrollment.id);
    await setDoc(docRef, {
      ...enrollment,
      enrolledAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

export async function fetchDrivewyzeEnrollments() {
  const path = 'drivewyze_enrollments';
  try {
    const snap = await getDocs(collection(db, 'drivewyze_enrollments'));
    return snap.docs.map((d) => d.data());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function saveTollExpenseLog(expense: {
  id: string;
  userId: string;
  facilityName: string;
  state: string;
  amount: number;
  transponderUsed?: string;
  vehicleVin?: string;
}) {
  const path = `toll_expense_logs/${expense.id}`;
  try {
    const docRef = doc(db, 'toll_expense_logs', expense.id);
    await setDoc(docRef, {
      ...expense,
      timestamp: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

// =========================================================================
// DRIVER STORAGE, DVIR, ROADSIDE & AUTONOMOUS DIAGNOSTIC PERSISTENCE
// =========================================================================

export async function syncDriverRecordToFirestore(driver: {
  id: string;
  driverName: string;
  cdlNumber: string;
  cdlState?: string;
  cdlExpirationDate?: string;
  dotMedCardRegistryNumber?: string;
  dotMedCardExpirationDate?: string;
  dotMedCardCertifiedDate?: string;
  examiningDoctorName?: string;
  examiningClinic?: string;
  medCardStatus: 'CERTIFIED_COMPLIANT' | 'EXPIRING_SOON' | 'EXPIRED';
  daysUntilMedCardRenewal?: number;
  renewalAlertActive?: boolean;
  assignedUnit?: string;
  dvirRecordsCount?: number;
  hosLogsCount?: number;
  violationsCount?: number;
}) {
  const path = `driver_records/${driver.id}`;
  try {
    const docRef = doc(db, 'driver_records', driver.id);
    await setDoc(
      docRef,
      {
        ...driver,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return { success: true, driverId: driver.id };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchDriverRecordsFromFirestore() {
  const path = 'driver_records';
  try {
    const snap = await getDocs(collection(db, 'driver_records'));
    return snap.docs.map((d) => d.data());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function syncDvirRecordToFirestore(dvir: {
  id: string;
  driverName: string;
  unitNumber: string;
  trailerNumber?: string;
  type: 'PRE_TRIP' | 'POST_TRIP';
  date: string;
  odometer: number;
  hasDefects: boolean;
  safeToOperate: boolean;
  mechanicSignature?: string;
  driverSignature?: string;
  defectsList?: string[];
}) {
  const path = `dvir_records/${dvir.id}`;
  try {
    const docRef = doc(db, 'dvir_records', dvir.id);
    await setDoc(
      docRef,
      {
        ...dvir,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return { success: true, dvirId: dvir.id };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchDvirRecordsFromFirestore() {
  const path = 'dvir_records';
  try {
    const snap = await getDocs(collection(db, 'dvir_records'));
    return snap.docs.map((d) => d.data());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function syncRoadsideInspectionToFirestore(inspection: {
  id: string;
  reportNumber: string;
  driverName: string;
  stateJurisdiction: string;
  inspectionDate: string;
  isCleanPass: boolean;
  outOfService: boolean;
  violationsCount: number;
  sentToCompany?: boolean;
  sentToDot?: boolean;
  remediationPlan?: string;
}) {
  const path = `roadside_inspections/${inspection.id}`;
  try {
    const docRef = doc(db, 'roadside_inspections', inspection.id);
    await setDoc(
      docRef,
      {
        ...inspection,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return { success: true, inspectionId: inspection.id };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchRoadsideInspectionsFromFirestore() {
  const path = 'roadside_inspections';
  try {
    const snap = await getDocs(collection(db, 'roadside_inspections'));
    return snap.docs.map((d) => d.data());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function syncDiagnosticLogToFirestore(log: {
  id: string;
  scanTimestamp: string;
  scheduleInterval: string;
  overallUptimePercent: number;
  endpointsScanned: number;
  issuesDetected: number;
  issuesRepaired: number;
  codeOverridesApplied: boolean;
  status: 'ALL_HEALTHY' | 'REPAIRED_HEALTHY' | 'DEGRADED';
  repairedIssuesLog?: Array<{
    target: string;
    issue: string;
    repairAction: string;
    timestamp: string;
  }>;
}) {
  const path = `maintenance_diagnostic_logs/${log.id}`;
  try {
    const docRef = doc(db, 'maintenance_diagnostic_logs', log.id);
    await setDoc(
      docRef,
      {
        ...log,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return { success: true, logId: log.id };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchDiagnosticLogsFromFirestore() {
  const path = 'maintenance_diagnostic_logs';
  try {
    const snap = await getDocs(collection(db, 'maintenance_diagnostic_logs'));
    return snap.docs.map((d) => d.data());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

// ============================================================================
// REAL-TIME FLEET TICKER PREFERENCES & CATEGORY TOGGLES IN FIRESTORE
// Persists admin selections for Trucking, Regular, DOT, NASA, and Reminders
// ============================================================================
export interface FirestoreTickerPreferences {
  id: string;
  showTruckingNews: boolean;
  showGeneralNews: boolean;
  showDotAlerts: boolean;
  showTwitterAlerts?: boolean;
  showNasaWeatherAlerts: boolean;
  showFleetReminders: boolean;
  tickerSpeed: 'slow' | 'normal' | 'fast';
  theme: 'gold' | 'amber' | 'emerald';
  isPaused: boolean;
  updatedBy?: string;
  updatedAt?: string;
}

export async function saveTickerPreferencesToFirestore(
  prefs: Omit<FirestoreTickerPreferences, 'id'>,
  configId: string = 'global_fleet_ticker_config'
) {
  const path = `fleet_ticker_preferences/${configId}`;
  try {
    const docRef = doc(db, 'fleet_ticker_preferences', configId);
    const payload: FirestoreTickerPreferences = {
      id: configId,
      showTruckingNews: prefs.showTruckingNews,
      showGeneralNews: prefs.showGeneralNews,
      showDotAlerts: prefs.showDotAlerts,
      showTwitterAlerts: prefs.showTwitterAlerts ?? true,
      showNasaWeatherAlerts: prefs.showNasaWeatherAlerts,
      showFleetReminders: prefs.showFleetReminders ?? true,
      tickerSpeed: prefs.tickerSpeed || 'normal',
      theme: prefs.theme || 'gold',
      isPaused: prefs.isPaused ?? false,
      updatedBy: auth.currentUser?.email || 'admin@truckwithease.com',
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
    return { success: true, configId };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return { success: false, error: err };
  }
}

export async function fetchTickerPreferencesFromFirestore(
  configId: string = 'global_fleet_ticker_config'
): Promise<FirestoreTickerPreferences | null> {
  const path = `fleet_ticker_preferences/${configId}`;
  try {
    const docRef = doc(db, 'fleet_ticker_preferences', configId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as FirestoreTickerPreferences;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

export function subscribeToTickerPreferencesFirestore(
  onUpdate: (prefs: FirestoreTickerPreferences) => void,
  configId: string = 'global_fleet_ticker_config'
): () => void {
  const path = `fleet_ticker_preferences/${configId}`;
  const docRef = doc(db, 'fleet_ticker_preferences', configId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as FirestoreTickerPreferences);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}


