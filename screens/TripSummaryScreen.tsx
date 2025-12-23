import React from 'react';
import { Trip } from '../types';
import { APP_CONFIG } from '../constants';
import { LogoIcon } from '../components/Icons';

interface SummaryProps {
  trip: Trip;
  onFinish: () => void;
}

const TripSummaryScreen: React.FC<SummaryProps> = ({ trip, onFinish }) => {
  const totalExpense = trip.expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Celebration Header */}
      <div className="bg-emerald-500 px-6 pt-12 pb-16 text-white text-center rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute top-4 right-6 opacity-30">
          <LogoIcon className="w-16 h-16" />
        </div>
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="text-3xl font-black">Trip Completed!</h2>
        <p className="opacity-90 mt-1 font-bold">Safely logged your Indian journey.</p>
      </div>

      {/* Summary Card */}
      <div className="px-6 -mt-10 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Route Summary</p>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-full flex items-center gap-1">
                👥 {trip.travelersCount || 1} People
              </span>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full border-2 border-gray-300" />
              <div className="w-0.5 h-10 bg-dashed border-l border-gray-200 border-dashed my-1" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">From</p>
                <p className="font-bold text-gray-900 leading-tight">{trip.startLocation}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">To</p>
                <p className="font-bold text-gray-900 leading-tight">{trip.destination}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 flex-1 overflow-y-auto">
        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1">Financial Details</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-gray-400 font-bold uppercase text-xs">Total Spend</span>
            <span className="text-2xl font-black text-indigo-600">{APP_CONFIG.currencySymbol}{totalExpense.toLocaleString('en-IN')}</span>
          </div>
          
          <div className="space-y-3">
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-1">Stops & Vendors</p>
             {trip.expenses.map((exp, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg">
                           {exp.category === 'Fuel' ? '⛽' : exp.category === 'Food' ? '🍔' : exp.category === 'Refreshments' ? '☕' : exp.category === 'Shopping' ? '🛍️' : '❓'}
                        </span>
                        <div>
                            <p className="font-bold text-sm leading-none mb-1">{exp.vendorName || exp.category}</p>
                            <p className="text-[10px] text-gray-400 font-medium line-clamp-1">{exp.location}</p>
                        </div>
                    </div>
                    <p className="font-black text-gray-900">{APP_CONFIG.currencySymbol}{exp.amount.toLocaleString('en-IN')}</p>
                </div>
             ))}
             {trip.expenses.length === 0 && (
                <p className="text-center py-4 text-gray-400 text-xs italic">No stops recorded</p>
             )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <button
          onClick={onFinish}
          className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transform transition-all shadow-indigo-200"
        >
          DONE, BACK HOME
        </button>
      </div>
    </div>
  );
};

export default TripSummaryScreen;