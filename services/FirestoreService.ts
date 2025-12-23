import { getFirestore } from 'firebase/firestore';
import { app } from './FirebaseService';

// Use getFirestore from firestore to ensure compatibility with modular exports
export const db = getFirestore(app);