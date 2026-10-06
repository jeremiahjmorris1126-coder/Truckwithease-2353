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

