import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '../constants.tsx';
import { LogoIcon } from '../components/Icons.tsx';

interface OTPScreenProps {
  phone: string;
  onVerify: (otp: string) => void;
  onBack: () => void;
}

const OTPScreen: React.FC<OTPScreenProps> = ({ phone, onVerify, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
    
    // Auto-focus previous on backspace if current is empty
    if (value === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
    
    // Auto-verify if all 6 digits are filled
    if (newOtp.every(v => v !== '') && newOtp.join('').length === 6) {
      onVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white p-8">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 transition-transform active:scale-90">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <LogoIcon className="w-8 h-8" />
      </div>

      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Verify Code</h2>
        <p className="text-gray-500 mt-2 font-medium">We've sent a 6-digit code to <span className="font-semibold text-gray-700">{APP_CONFIG.countryCode} {phone}</span></p>
      </div>

      <div className="flex justify-between gap-2 mb-8">
        {otp.map((digit, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="tel"
            maxLength={1}
            value={digit}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onChange={(e) => handleChange(i, e.target.value)}
            className="w-12 h-16 text-center text-2xl font-black bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all outline-none"
          />
        ))}
      </div>

      <div className="text-center">
        {timer > 0 ? (
          <p className="text-gray-400 text-sm font-medium">Resend code in <span className="text-indigo-600 font-bold">{timer}s</span></p>
        ) : (
          <button onClick={() => setTimer(30)} className="text-indigo-600 font-bold hover:underline text-sm uppercase tracking-wider">Resend OTP</button>
        )}
      </div>

      <button
        onClick={() => onVerify(otp.join(''))}
        disabled={otp.some(v => v === '')}
        className={`w-full mt-10 py-4 rounded-2xl font-black text-lg shadow-xl transition-all transform active:scale-95 ${
          otp.every(v => v !== '')
            ? 'bg-indigo-600 text-white shadow-indigo-100'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
        }`}
      >
        Verify Now
      </button>
      
      <p className="mt-8 text-center text-xs text-gray-400 font-medium">
        Didn't receive the code? Check your SMS or <span className="text-indigo-600 font-bold">Contact Support</span>
      </p>
    </div>
  );
};

export default OTPScreen;