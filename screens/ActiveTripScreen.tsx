import React, { useState, useEffect } from 'react';
import { Trip } from '../types';
import { APP_CONFIG } from '../constants';
import { ExpenseService, CategoryItem } from '../services/ExpenseService';
import { HomeIcon, PinIcon, MapIcon, PlusIcon, RouteIcon, XIcon, ArrowRightIcon } from '../components/Icons';
import { useAppState } from '../hooks/useAppState';

interface ActiveTripProps {
  trip: Trip | null;
  onAddStop: () => void;
  onEndTrip: () => void;
  onGoHome: () => void;
  isOnline: boolean;
}

const ActiveTripScreen: React.FC<ActiveTripProps> = ({ trip, onAddStop, onEndTrip, onGoHome, isOnline }) => {
  const { uid } = useAppState();
  const [duration, setDuration] = useState(0);
  const [showLogs, setShowLogs] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (trip) setDuration(Math.floor((Date.now() - trip.startTime) / 1000));
    }, 1000);
    if (uid) {
       ExpenseService.getAllCategories(uid).then(setCategories);
    }
    return () => clearInterval(timer);
  }, [trip, uid]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!trip) return null;

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
      {/* Dynamic Background / Map UI */}
      <div className="flex-1 bg-slate-900 relative overflow-hidden flex items-center justify-center">
        {/* Animated Map Grid Effect */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle, #4F46E5 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        
        <div className="absolute top-10 left-6 right-6 z-20 flex flex-col gap-3">
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-[28px] shadow-2xl border border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><RouteIcon className="w-6 h-6" /></div>
              <div className="overflow-hidden">
                <p className="text-[9px] uppercase font-black text-gray-500 tracking-widest flex items-center gap-2">
                  Dest: {trip.destination}
                  {!isOnline && <span className="text-amber-600 font-black tracking-tighter">[OFFLINE]</span>}
                </p>
                <p className="font-black text-gray-900 text-lg leading-none mt-0.5">{formatTime(duration)}</p>
              </div>
            </div>
            <button onClick={onGoHome} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 active:scale-90 transition-transform"><HomeIcon className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Pulse Central Icon */}
        <div className="relative">
          <div className={`absolute inset-0 rounded-full animate-ping scale-150 ${isOnline ? 'bg-indigo-500/30' : 'bg-amber-500/30'}`} />
          <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-3xl">
            <MapIcon className={`w-10 h-10 ${isOnline ? 'text-indigo-600' : 'text-amber-500'}`} />
          </div>
        </div>
      </div>

      {/* Bottom Sheet Activity Controller */}
      <div className={`bg-white rounded-t-[44px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] z-30 transition-all duration-500 ease-in-out flex flex-col border-t border-gray-100 ${showLogs ? 'h-[85%]' : 'h-auto'}`}>
        <div className="w-full flex justify-center py-4 cursor-pointer" onClick={() => setShowLogs(!showLogs)}>
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>
        
        <div className="px-8 pb-8">
          <div className="flex justify-between items-center mb-8 bg-gray-50 p-6 rounded-[32px] border border-gray-100">
            <div className="text-center flex-1">
              <p className="text-[10px] text-gray-400 font-black mb-1 uppercase tracking-widest">Total Logs</p>
              <p className="text-2xl font-black text-gray-900">{trip.expenses.length}</p>
            </div>
            <div className="w-[1px] h-10 bg-gray-200" />
            <div className="text-center flex-1">
              <p className="text-[10px] text-gray-400 font-black mb-1 uppercase tracking-widest">Spend</p>
              <p className="text-2xl font-black text-indigo-600">{APP_CONFIG.currencySymbol}{trip.expenses.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={onAddStop} 
              className="flex-1 py-5 bg-indigo-600 text-white font-black rounded-[24px] shadow-2xl shadow-indigo-200 active:scale-95 transition-transform flex items-center justify-center gap-3"
            >
              <PlusIcon className="w-6 h-6" /> ADD STOP
            </button>
            <button 
              onClick={onEndTrip} 
              className="flex-[0.5] py-5 bg-red-50 text-red-600 font-black rounded-[24px] active:scale-95 transition-transform flex items-center justify-center"
            >
              FINISH
            </button>
          </div>
          {!isOnline && (
            <p className="text-[9px] text-center mt-4 text-amber-600 font-black uppercase tracking-widest">
              Running in offline mode. New stops will sync later.
            </p>
          )}
        </div>

        {/* Scrollable Logs Container */}
        <div className="flex-1 overflow-hidden flex flex-col border-t border-gray-50 bg-[#FCFCFE]">
          <div className="px-8 py-5 flex justify-between items-center bg-white">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Expense Timeline</h3>
            <button onClick={() => setShowLogs(!showLogs)} className="text-[10px] font-black text-indigo-600 uppercase">
              {showLogs ? 'Collapse' : 'Expand View'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-12 pt-4">
            {trip.expenses.length > 0 ? [...trip.expenses].reverse().map((exp) => (
              <div key={exp.id} className="bg-white p-5 rounded-[24px] flex items-center justify-between border border-gray-100 shadow-sm active:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                    {ExpenseService.getCategoryIcon(exp.category, categories)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-black text-gray-900 text-sm leading-none mb-1 truncate max-w-[140px]">{exp.vendorName || exp.category}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight truncate max-w-[140px]">{exp.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900 text-lg leading-none">{APP_CONFIG.currencySymbol}{exp.amount.toLocaleString('en-IN')}</p>
                  <p className={`text-[9px] font-black mt-1 ${isOnline ? 'text-indigo-400' : 'text-amber-500'}`}>
                    {isOnline ? 'SUCCESS' : 'CACHED'}
                  </p>
                </div>
              </div>
            )) : (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                  <RouteIcon className="w-8 h-8" />
                </div>
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Logging is live</p>
                <p className="text-gray-300 text-[10px] mt-2 font-medium">Record expenses as you travel</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveTripScreen;