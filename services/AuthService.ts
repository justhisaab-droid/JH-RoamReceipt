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
   * Triggers Google Login popup.
   */
  static async loginWithGoogle(): Promise<UserCredential> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (error: any) {
      console.error("Google Login Error:", error.code, error.message);
      
      // Configuration Error: domain not authorized in Firebase Console
      if (error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        throw new Error(`Domain Unauthorized: "${domain}" is not in your Firebase Authorized Domains list. Please add it in Firebase Console > Authentication > Settings > Authorized Domains.`);
      }
      
      // Other errors
      throw new Error(error.message || "Google sign-in failed.");
    }
  }

  /**
   * Creates a new RecaptchaVerifier instance.
   * @param containerId The ID of the HTML element to render the reCAPTCHA in.
   * @param options Verifier options (size, theme, etc.)
   */
  static createVerifier(containerId: string, options: any = { size: 'normal' }): RecaptchaVerifier {
    try {
      console.debug("Initializing RecaptchaVerifier for:", containerId);
      
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = ''; 
      }

      const verifier = new RecaptchaVerifier(auth, containerId, {
        ...options,
        callback: (response: any) => {
          console.debug("reCAPTCHA solved successfully.");
        },
        'expired-callback': () => {
          console.warn("reCAPTCHA expired. User action required.");
        }
      });

      return verifier;
    } catch (error: any) {
      console.error("RecaptchaVerifier creation failed:", error?.code || 'unknown', error?.message || 'No message');
      throw error;
    }
  }

  /**
   * Sends an OTP to the specified phone number.
   * @param phone The 10-digit phone number.
   * @param verifier The initialized RecaptchaVerifier instance.
   */
  static async sendOTP(phone: string, verifier: RecaptchaVerifier): Promise<ConfirmationResult> {
    const fullPhone = `${APP_CONFIG.countryCode}${phone}`;
    try {
      console.debug(`Attempting OTP for ${fullPhone}...`);
      
      const widgetId = await verifier.render();
      console.debug("Verifier rendered with widgetId:", widgetId);
      
      const result = await signInWithPhoneNumber(auth, fullPhone, verifier);
      console.debug("signInWithPhoneNumber success.");
      return result;
    } catch (error: any) {
      const errorPayload = {
        code: error?.code || 'unknown-code',
        message: error?.message || 'unknown-message',
        name: error?.name,
      };
      
      console.error("AuthService.sendOTP Failure Details:", JSON.stringify(errorPayload, null, 2));
      
      if (error.code === 'auth/internal-error') {
        throw new Error("Internal security error. Please ensure your internet is stable and try again.");
      }

      switch (error.code) {
        case 'auth/operation-not-allowed':
          throw new Error("Phone authentication is not enabled in Firebase Console.");
        case 'auth/invalid-phone-number':
          throw new Error("The phone number provided is not valid.");
        case 'auth/too-many-requests':
          throw new Error("Verification blocked due to unusual activity. Try again later.");
        case 'auth/invalid-recaptcha-token':
          throw new Error("Security check failed. Please refresh and try again.");
        default:
          throw new Error(error.message || "Failed to initiate phone verification.");
      }
    }
  }
}