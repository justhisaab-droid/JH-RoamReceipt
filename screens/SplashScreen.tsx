import React, { useEffect } from 'react';
import { LogoIcon, LogoText } from '../components/Icons';

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#0F172A] text-white relative overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[180px] opacity-30 animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-500 rounded-full blur-[140px] opacity-20" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Android-style adaptive icon feel */}
        <div className="mb-10 animate-in zoom-in-50 fade-in duration-1000 cubic-bezier(0.16, 1, 0.3, 1)">
          <div className="w-40 h-40 bg-white rounded-[48px] flex items-center justify-center shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/20">
            <LogoIcon className="w-28 h-28" />
          </div>
        </div>

        {/* Dynamic Type Branding */}
        <div className="text-center">
          <LogoText className="text-4xl text-white block animate-in slide-in-from-bottom-8 duration-700 delay-300" />
          <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px] mt-4 opacity-0 animate-in fade-in duration-1000 delay-1000">
            India's Smart Ledger
          </p>
        </div>
      </div>
      
      {/* Loading Progress Bar */}
      <div className="absolute bottom-24 w-full flex flex-col items-center px-16">
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-indigo-500 rounded-full animate-loading-stripes" />
        </div>
        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Warming up systems</p>
      </div>
      
      <style>{`
        @keyframes loading-stripes {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.4; }
        }
        .animate-loading-stripes {
          animation: loading-stripes 2.5s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;