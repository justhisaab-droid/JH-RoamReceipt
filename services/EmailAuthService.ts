import { AuthService } from './AuthService.ts';
import { UserCredential } from 'firebase/auth';

/**
 * Legacy wrapper for EmailAuthService. 
 */
export class EmailAuthService {
  static async loginWithGoogle(): Promise<UserCredential> {
    return AuthService.loginWithGoogle();
  }
}