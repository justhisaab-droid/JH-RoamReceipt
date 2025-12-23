import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  signInWithPopup,
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider } from './FirebaseService.ts';
import { APP_CONFIG } from '../constants.tsx';

export class AuthService {
  /**
   * Triggers Google Login popup.
   */
  static async loginWithGoogle(): Promise<UserCredential> {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Google Login Error:", error.code, error.message);
      if (error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        throw new Error(`Domain "${domain}" is not authorized. Add it in Firebase Console.`);
      }
      throw new Error(error.message || "Google sign-in failed.");
    }
  }

  /**
   * Creates a new RecaptchaVerifier instance.
   */
  static createVerifier(containerId: string = 'global-recaptcha-container', options: any = { size: 'invisible' }): RecaptchaVerifier {
    try {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = ''; // Clear any stale widgets
      }

      return new RecaptchaVerifier(auth, containerId, {
        ...options,
        'callback': (response: any) => {
          console.debug("reCAPTCHA solved:", response);
        },
        'expired-callback': () => {
          console.warn("reCAPTCHA expired. Resetting...");
        }
      });
    } catch (error: any) {
      console.error("RecaptchaVerifier creation failed:", error);
      throw new Error("Failed to initialize security check. Please refresh.");
    }
  }

  /**
   * Sends an OTP to the specified phone number.
   * Explicitly renders the verifier before sending to ensure it's ready.
   */
  static async sendOTP(phone: string, verifier: RecaptchaVerifier): Promise<ConfirmationResult> {
    const fullPhone = `${APP_CONFIG.countryCode}${phone}`;
    try {
      // Ensure the verifier is rendered before proceeding
      await verifier.render();
      return await signInWithPhoneNumber(auth, fullPhone, verifier);
    } catch (error: any) {
      console.error("Phone Auth Error Details:", error.code, error.message);
      
      // Handle the specific internal-error with more context
      if (error.code === 'auth/internal-error') {
        throw new Error("Security verification failed. Ensure 'Identity Toolkit API' is enabled in Google Cloud Console and your domain is whitelisted.");
      }

      switch (error.code) {
        case 'auth/too-many-requests':
          throw new Error("Security limit reached. Try again in 1 hour.");
        case 'auth/invalid-phone-number':
          throw new Error("Invalid mobile number format.");
        default:
          throw new Error(error.message || "Mobile verification failed.");
      }
    }
  }
}