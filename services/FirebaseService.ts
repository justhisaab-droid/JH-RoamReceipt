import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { firebaseConfig } from './FirebaseConfigService';

// Ensure exactly one Firebase App instance is initialized.
// Mismatched versions or multiple initializations cause "Component auth has not been registered" errors.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Explicitly retrieve and export the Auth instance associated with the app.
const auth = getAuth(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { app, auth, googleProvider };