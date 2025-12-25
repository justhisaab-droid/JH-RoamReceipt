import { AuthService } from './AuthService.ts';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';

/**
 * Legacy wrapper for PhoneAuthService. 
 */
export class PhoneAuthService {
  static createVerifier(containerId: string, options: any = { size: 'normal' }): RecaptchaVerifier {
    return AuthService.createVerifier(containerId, options);
  }

  static async sendOTP(phone: string, verifier: RecaptchaVerifier): Promise<ConfirmationResult> {
    return AuthService.sendOTP(phone, verifier);
  }
}