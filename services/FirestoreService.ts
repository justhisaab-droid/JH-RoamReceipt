import { getFirestore } from 'firebase/firestore';
import { app } from './FirebaseService.ts';
import { FIRESTORE_DATABASE_ID } from './FirebaseConfigService.ts';

/**
 * Initialize Firestore. 
 */
const initializeDatabase = () => {
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