import React, { useEffect } from 'react';

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
            <svg 
              viewBox="0 0 10240 10240" 
              className="w-28 h-28"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="translate(0, 10240) scale(1, -1)">
<path fill="#f97316" d="M2562 7272 l-752 -748 2 -2474 3 -2475 28 -100 c34 -121 118 -297 186 -386 165 -217 406 -366 681 -421 99 -20 4544 -19 4645 1 394 78 718 362 840 738 53 161 55 198 55 1002 l0 744 -45 -42 c-62 -57 -157 -117 -225 -142 l-57 -21 -6 -91 c-12 -190 -90 -379 -232 -569 l-55 -73 0 -271 c0 -289 -5 -325 -55 -424 -53 -104 -162 -193 -283 -230 -63 -20 -98 -20 -2262 -20 -2164 0 -2199 0 -2262 20 -80 24 -171 83 -222 141 -21 24 -55 78 -75 119 l-36 75 -3 2068 -2 2067 409 0 c330 0 425 3 491 16 299 56 537 238 670 509 89 181 93 206 97 693 l5 422 1563 0 c1531 0 1564 0 1627 -20 121 -37 230 -126 283 -230 50 -99 55 -135 55 -417 0 -145 2 -263 5 -263 7 0 602 516 608 528 8 13 -14 142 -39 230 -95 336 -363 618 -693 731 -172 59 -12 55 -2196 58 l-2000 2 -753 -747z" />
        <path fill="#ef4444" d="M8953 6922 c-28 -10 -66 -30 -85 -44 -18 -15 -377 -316 -798 -670 -832 -700 -826 -694 -871 -836 -28 -90 -28 -222 0 -312 44 -140 62 -160 564 -644 258 -248 493 -468 523 -488 111 -75 259 -110 385 -89 94 14 203 67 269 129 54 51 1190 1676 1221 1747 59 135 7 329 -128 472 -134 142 -650 628 -705 664 -126 81 -271 108 -375 71z" />
        <path fill="#ef4444" d="M6975 4674 c-42 -22 -162 -140 -196 -193 -36 -55 -40 -131 -10 -189 11 -21 203 -218 448 -457 483 -474 472 -466 588 -434 50 14 209 165 236 224 22 47 24 113 5 158 -16 40 -855 870 -901 891 -42 20 -131 20 -170 0z" />
        <path fill="#f97316" d="M6196 4084 c-177 -43 -383 -202 -507 -391 -97 -149 -145 -308 -209 -693 -70 -421 -141 -724 -210 -899 -11 -29 -20 -55 -20 -58 0 -4 55 47 123 113 67 66 247 242 400 391 l278 271 -17 52 c-35 108 2 240 87 314 154 131 381 82 470 -102 34 -70 32 -179 -4 -249 -72 -139 -219 -203 -359 -156 l-58 20 -395 -385 c-217 -212 -394 -387 -392 -388 2 -2 46 9 98 26 232 72 420 111 829 170 383 55 509 85 655 158 105 52 181 110 278 211 275 290 286 572 36 926 -80 113 -371 407 -494 498 -211 157 -409 215 -589 171z" />
        <path fill="#f97316" d="M2965 2256 c-37 -17 -80 -62 -94 -99 -6 -16 -11 -68 -11 -117 0 -99 9 -132 48 -173 62 -66 1 -62 937 -65 617 -2 865 0 903 8 108 23 160 115 150 260 -6 85 -37 143 -94 176 l-41 24 -884 0 c-716 -1 -890 -3 -914 -14z" />
              </g>
            </svg>
          </div>
        </div>

        {/* Dynamic Type Branding */}
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tighter text-white animate-in slide-in-from-bottom-8 duration-700 delay-300">
            RoamReceipt
          </h1>
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