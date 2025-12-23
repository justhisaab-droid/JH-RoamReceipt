import { 
  signInWithPopup, 
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider } from './FirebaseService';

export class EmailAuthService {
  /**
   * Sign in with Google Popup using the registered singleton instances.
   */
  static async loginWithGoogle(): Promise<UserCredential> {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        throw new Error(`Domain "${domain}" is not authorized in Firebase Console.`);
      }
      throw new Error(error.message || "Google sign-in failed.");
    }
  }
}