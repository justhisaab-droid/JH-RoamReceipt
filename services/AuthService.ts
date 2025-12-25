import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  signInWithPopup,
  ConfirmationResult,
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider } from './FirebaseService.ts';
import { APP_CONFIG } from '../constants.tsx';

export class AuthService {
  /**
   * Google Sign-In helper.
   */
  static async loginWithGoogle(): Promise<UserCredential> {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname || 'your-domain.com';
        throw new Error(`UNAUTHORIZED_DOMAIN|${domain}`);
      }
      
      console.error("AuthService: Google Login Error:", error.code, error.message);
      throw new Error(error.message || "Google sign-in failed.");
    }
  }

  /**
   * Initializes the RecaptchaVerifier for Phone Authentication.
   */
  static createVerifier(containerId: string = 'global-recaptcha-container', options: any = { size: 'invisible' }): RecaptchaVerifier {
    try {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = ''; 
      }

      // Check if the domain is potentially unauthorized before even trying
      // as reCAPTCHA might throw a hard error that skips the try/catch sometimes
      const verifier = new RecaptchaVerifier(auth, containerId, {
        ...options,
        'callback': (response: any) => {
          console.debug("AuthService: ReCAPTCHA solved.");
        },
        'expired-callback': () => {
          console.warn("AuthService: ReCAPTCHA expired. Please try again.");
        },
        'error-callback': (error: any) => {
          console.error("AuthService: ReCAPTCHA Error callback:", error);
        }
      });

      return verifier;
    } catch (error: any) {
      console.error("AuthService: Failed to create RecaptchaVerifier:", error);
      
      const domain = window.location.hostname;
      const errorMsg = error.message || "";
      
      // Specifically target the reCAPTCHA domain/key error
      if (
        errorMsg.includes('site key') || 
        errorMsg.includes('api.js') || 
        errorMsg.includes('not loaded') ||
        error.code === 'auth/unauthorized-domain'
      ) {
        throw new Error(`RECAPTCHA_CONFIG_ERROR|${domain}`);
      }
      
      throw new Error("Security check initialization failed. Please refresh the app.");
    }
  }

  /**
   * Sends an OTP using Firebase Phone Auth.
   */
  static async sendOTP(phone: string, verifier: RecaptchaVerifier): Promise<ConfirmationResult> {
    const fullPhone = `${APP_CONFIG.countryCode}${phone}`;
    try {
      return await signInWithPhoneNumber(auth, fullPhone, verifier);
    } catch (error: any) {
      console.error("AuthService: Phone Auth Error Details:", error.code, error.message);
      
      if (error.code === 'auth/unauthorized-domain' || error.code === 'auth/internal-error') {
        const domain = window.location.hostname || 'your-domain.com';
        throw new Error(`UNAUTHORIZED_DOMAIN|${domain}`);
      }

      switch (error.code) {
        case 'auth/too-many-requests':
          throw new Error("Too many attempts. Please try again after some time.");
        case 'auth/invalid-phone-number':
          throw new Error("Please enter a valid 10-digit mobile number.");
        default:
          throw new Error(error.message || "Mobile verification failed.");
      }
    }
  }
}