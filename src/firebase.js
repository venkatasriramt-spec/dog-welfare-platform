import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
export const firebaseEnabled = Boolean(config.apiKey && config.projectId);
let app = null;
let firebaseError = null;

if (firebaseEnabled) {
  try {
    app = initializeApp(config);
  } catch (error) {
    firebaseError = error instanceof Error ? error.message : 'Firebase could not be initialized.';
    console.error('Firebase initialization failed. The app will continue in demo mode.', error);
  }
}

export { firebaseError };
let auth = null;
let db = null;
let storage = null;
let functions = null;

if (app) {
  try {
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    functions = getFunctions(app, 'us-central1');
  } catch (error) {
    firebaseError = error instanceof Error ? error.message : 'Firebase services could not be initialized.';
    console.error('Firebase services failed to initialize. The app will continue in demo mode.', error);
  }
}

export { auth, db, storage, functions };
