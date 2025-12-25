import React, { useState, useEffect, useRef } from 'react';
import { APP_CONFIG } from '../constants.tsx';
import { AuthService } from '../services/AuthService.ts';
import { LogoIcon, LogoText } from '../components/Icons.tsx';
import { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

interface LoginScreenProps {
  onLogin: (phone: string, result: ConfirmationResult) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    const setupVerifier = () => {
      try {
        if (verifierRef.current) {
          verifierRef.current.clear();
        }
        const v = AuthService.createVerifier('global-recaptcha-container', { size: 'invisible' });
        verifierRef.current = v;
      } catch (err: any) {
        console.error("LoginScreen: Verifier setup error", err);
        if (err.message.startsWith('RECAPTCHA_CONFIG_ERROR|') || err.message.startsWith('UNAUTHORIZED_DOMAIN|')) {
           setRecaptchaError(err.message.split('|')[1]);
        } else {
           setError("Security initialization failed. Try refreshing.");
        }
      }
    };

    setupVerifier();

    return () => {
      if (verifierRef.current) {
        try {
          verifierRef.current.clear();
          verifierRef.current = null;
        } catch (e) {}
      }
    };
  }, []);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10 || isLoading) return;

    if (!verifierRef.current) {
      // If verifier is null, it likely failed during setup due to domain issues
      const domain = window.location.hostname;
      setRecaptchaError(domain);
      return;
    }

    setIsLoading(true);
    setError(null);
    setUnauthorizedDomain(null);
    setRecaptchaError(null);
    
    try {
      const result = await AuthService.sendOTP(phone, verifierRef.current);
      onLogin(phone, result);
    } catch (err: any) {
      console.error("LoginScreen: OTP Send Error", err);
      
      if (err.message.startsWith('UNAUTHORIZED_DOMAIN|')) {
        const domain = err.message.split('|')[1];
        setUnauthorizedDomain(domain);
        setError(null); 
      } else if (err.message.startsWith('RECAPTCHA_CONFIG_ERROR|')) {
        setRecaptchaError(err.message.split('|')[1]);
        setError(null);
      } else {
        setError(err.message);
      }
      setIsLoading(false);
      
      // Re-initialize verifier if a failure occurred
      try {
        if (verifierRef.current) verifierRef.current.clear();
        verifierRef.current = AuthService.createVerifier('global-recaptcha-container', { size: 'invisible' });
      } catch (e) {}
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    setUnauthorizedDomain(null);
    setRecaptchaError(null);
    try {
      await AuthService.loginWithGoogle();
    } catch (err: any) {
      if (err.message.startsWith('UNAUTHORIZED_DOMAIN|')) {
        const domain = err.message.split('|')[1];
        setUnauthorizedDomain(domain);
        setError(null); 
      } else {
        setError(err.message);
      }
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Domain copied to clipboard!');
  };

  const DomainSetupUI = ({ domain, title }: { domain: string, title: string }) => (
    <div className="p-6 bg-amber-50 rounded-[32px] border-2 border-amber-200 animate-in zoom-in-95 duration-300 shadow-xl shadow-amber-100/50 my-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        </div>
        <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight leading-tight">{title}</h3>
      </div>
      
      <p className="text-[11px] text-amber-800 font-bold mb-4 leading-relaxed">
        The error <b>"Invalid site key"</b> means Firebase reCAPTCHA doesn't trust this domain. This is common in browser previews.
      </p>
      
      <div className="bg-white border border-amber-200 p-3 rounded-xl flex items-center justify-between gap-3 mb-4 shadow-inner">
        <code className="text-[10px] font-black text-gray-800 break-all">{domain}</code>
        <button 
          onClick={() => copyToClipboard(domain)} 
          className="text-[10px] font-black text-indigo-600 uppercase shrink-0 hover:underline active:scale-95"
        >
          Copy
        </button>
      </div>
      
      <div className="space-y-2">
         <p className="text-[9px] text-amber-700 font-medium">
           1. Go to <a href="https://console.firebase.google.com" target="_blank" className="underline font-black">Firebase Console</a>
         </p>
         <p className="text-[9px] text-amber-700 font-medium">
           2. Select project: <b>justhisaab-80c17</b>
         </p>
         <p className="text-[9px] text-amber-700 font-medium">
           3. Navigate to <b>Authentication</b> &gt; <b>Settings</b> &gt; <b>Authorized Domains</b>
         </p>
         <p className="text-[9px] text-amber-700 font-medium">
           4. Add the domain copied above to authorize reCAPTCHA.
         </p>
      </div>
      
      <button 
        onClick={() => window.location.reload()}
        className="w-full mt-4 py-3 bg-amber-500 text-white font-black text-[10px] uppercase rounded-xl active:scale-95 transition-all shadow-md"
      >
        I've Added It, Reload App
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white p-8 animate-in fade-in duration-500 overflow-y-auto">
      <div className="mt-12 mb-12 text-center flex flex-col items-center">
        <LogoIcon className="w-20 h-20 mb-4" />
        <LogoText size="text-5xl" />
        <p className="text-gray-400 mt-3 font-black uppercase text-[10px] tracking-[0.3em]">India's Smart Ledger</p>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-8">
        <form onSubmit={handlePhoneSubmit} className="space-y-6">
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 group-focus-within:text-indigo-600 transition-colors">Mobile Number</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400 text-lg">
                {APP_CONFIG.countryCode}
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                className="w-full p-6 pl-16 bg-gray-50 border-2 border-transparent rounded-[24px] focus:border-indigo-600 focus:bg-white outline-none transition-all font-black text-gray-800 text-xl shadow-inner"
                autoFocus
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={phone.length !== 10 || isLoading}
            className={`w-full py-5 rounded-[24px] font-black text-lg shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
              phone.length === 10 && !isLoading 
                ? 'bg-indigo-600 text-white shadow-indigo-200' 
                : 'bg-gray-100 text-gray-300'
            }`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'GET OTP'
            )}
          </button>
        </form>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-[1.5px] bg-gray-100"></div>
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">or explore with</span>
          <div className="flex-1 h-[1.5px] bg-gray-100"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-5 px-6 bg-white border-2 border-gray-100 rounded-[24px] font-black text-gray-700 shadow-sm flex items-center justify-center gap-4 active:scale-95 transition-all hover:border-indigo-100"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          CONTINUE WITH GOOGLE
        </button>

        {unauthorizedDomain && <DomainSetupUI domain={unauthorizedDomain} title="Domain Setup Required" />}
        {recaptchaError && <DomainSetupUI domain={recaptchaError} title="reCAPTCHA Domain Blocked" />}

        {error && (
          <div className="p-5 bg-red-50 rounded-[20px] border border-red-100 animate-in shake duration-300">
            <p className="text-[11px] font-black text-red-600 uppercase tracking-tight text-center leading-relaxed">
              {error}
            </p>
          </div>
        )}
      </div>

      <div className="mt-auto pt-10 text-center">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed max-w-[240px] mx-auto">
          Securely managed by <span className="text-indigo-600 underline">JustHisaab</span> systems.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;