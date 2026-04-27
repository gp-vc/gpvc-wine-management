import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getFirestore, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, getDocFromServer } from 'firebase/firestore';

// 1. Load environment variables (Vercel/Production)
// Using import.meta.env is safe at build time
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DB_ID,
};

// 2. Initialize Firebase
let app: any;

try {
  // If essential vars exist, use them (Production/Vercel)
  if (firebaseConfig.apiKey) {
    app = getApps().length > 0 ? getApp() : initializeApp({
      ...firebaseConfig,
      // Map back internal field for Firebase SDK
      databaseId: firebaseConfig.firestoreDatabaseId
    });
  } else {
    // In AI Studio workspace, we might not have ENV vars set yet.
    // To avoid build errors on external platforms about missing files, 
    // we do NOT use static imports or dynamic imports that the bundler can trace.
    console.warn("Firebase environment variables missing.");
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig); 
  }
} catch (e) {
  console.error("Firebase initialization failed:", e);
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Use firestoreDatabaseId if available (for enterprise/multi-db setups), otherwise default db
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Error handler helper
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
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: any[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  onAuthStateChanged,
  signOut,
  getDocFromServer,
  signInWithPopup
};
export type { User };
