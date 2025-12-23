

import { getFirestore } from 'firebase/firestore';
import { app } from './FirebaseService';
import { FIRESTORE_DATABASE_ID } from './FirebaseConfigService';

/**
 * Initialize Firestore. 
 * If FIRESTORE_DATABASE_ID is specified and not "(default)", 
 * we use the multi-database feature of Cloud Firestore.
 */
const initializeDatabase = () => {
  // Added string cast to FIRESTORE_DATABASE_ID to avoid TypeScript comparison error with literal types
  if (FIRESTORE_DATABASE_ID && (FIRESTORE_DATABASE_ID as string) !== '(default)') {
    try {
      return getFirestore(app, FIRESTORE_DATABASE_ID);
    } catch (e) {
      console.warn(`Could not initialize custom firestore db ${FIRESTORE_DATABASE_ID}, falling back to default.`);
      return getFirestore(app);
    }
  }
  return getFirestore(app);
};

export const db = initializeDatabase();