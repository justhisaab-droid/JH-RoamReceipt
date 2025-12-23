import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  signInWithPopup,
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider } from './FirebaseService';
import { APP_CONFIG } from '../constants';

export class AuthService {
  /**
   * Triggers Google Login popup using the registered auth singleton.
   * Specifically handles 'auth/unauthorized-domain' by providing diagnostic info.
   */
  static async loginWithGoogle(): Promise<UserCredential> {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Google Login Error:", error.code, error.message);
      
      if (error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        // Construct a helpful error message for the developer
        throw new Error(
          `UNAUTHORIZED DOMAIN: The domain "${domain}" is not authorized in the Firebase Console. ` +
          `Please add "${domain}" to Authentication > Settings > Authorized Domains.`
        );
      }
      
      throw new Error(error.message || "Google sign-in failed.");
    }
  }

  /**
   * Creates a new RecaptchaVerifier instance linked to the registered auth instance.
   */
  static createVerifier(containerId: string, options: any = { size: 'normal' }): RecaptchaVerifier {
    try {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = ''; 
      }

      return new RecaptchaVerifier(auth, containerId, {
        ...options,
        callback: () => console.debug("reCAPTCHA solved."),
        'expired-callback': () => console.warn("reCAPTCHA expired.")
      });
    } catch (error: any) {
      console.error("RecaptchaVerifier creation failed:", error);
      throw error;
    }
  }

  /**
   * Sends an OTP to the specified phone number.
   */
  static async sendOTP(phone: string, verifier: RecaptchaVerifier): Promise<ConfirmationResult> {
    const fullPhone = `${APP_CONFIG.countryCode}${phone}`;
    try {
      return await signInWithPhoneNumber(auth, fullPhone, verifier);
    } catch (error: any) {
      console.error("Phone Auth Error:", error.code, error.message);
      switch (error.code) {
        case 'auth/too-many-requests':
          throw new Error("Too many attempts. Please try again later.");
        case 'auth/invalid-phone-number':
          throw new Error("The phone number provided is not valid.");
        default:
          throw new Error(error.message || "Failed to send OTP.");
      }
    }
  }
}