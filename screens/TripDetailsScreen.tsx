import React from 'react';
import { Trip } from '../types';
import { APP_CONFIG } from '../constants';
import { MapIcon, CameraIcon, LogoIcon } from '../components/Icons';

interface DetailsProps {
  trip: Trip | null;
  onBack: () => void;
}

const TripDetailsScreen: React.FC<DetailsProps> = ({ trip, onBack }) => {
  if (!trip) return null;

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto pb-10">
      <div className="bg-gray-100 h-64 relative">
        <button 
            onClick={onBack} 
            className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md z-10 active:scale-90 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <LogoIcon className="absolute top-6 right-6 w-10 h-10 z-10 opacity-40" />
        {/* Placeholder for real map */}
        <div className="w-full h-full bg-blue-50 flex items-center justify-center opacity-50 overflow-hidden">
             <div className="scale-150 rotate-12 opacity-10">
                <MapIcon />
             </div>
             <p className="absolute text-blue-300 font-bold uppercase tracking-widest text-xs">Map View (India)</p>
        </div>
      </div>

      <div className="px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-50 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 leading-tight">{trip.destination}</h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider mt-1">
                {new Date(trip.startTime).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                trip.type === 'Business' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
            }`}>
                {trip.type}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6 mt-2 text-center">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Cost</p>
              <p className="text-lg font-black text-gray-900">{APP_CONFIG.currencySymbol}{trip.expenses.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="border-x border-gray-100 px-2">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Vehicle</p>
              <p className="text-lg font-black text-gray-900 truncate">{trip.vehicle}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Pax</p>
              <p className="text-lg font-black text-gray-900">{trip.travelersCount || 1}</p>
            </div>
          </div>
        </div>

        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">Expenses Log</h3>
        <div className="space-y-4">
          {trip.expenses.map((exp) => (
            <div key={exp.id} className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between border border-gray-100 group active:bg-indigo-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">
                    {exp.category === 'Fuel' ? '⛽' : exp.category === 'Food' ? '🍔' : exp.category === 'Refreshments' ? '☕' : exp.category === 'Shopping' ? '🛍️' : '❓'}
                </div>
                <div>
                  <p className="font-bold text-gray-900 leading-none mb-1">{exp.vendorName || exp.category}</p>
                  <p className="text-[10px] text-gray-400 font-medium line-clamp-1">{exp.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-gray-900">{APP_CONFIG.currencySymbol}{exp.amount.toLocaleString('en-IN')}</p>
                {exp.receiptUrl && (
                  <button className="text-[9px] font-black text-indigo-600 uppercase flex items-center gap-1 mt-1 ml-auto">
                     <CameraIcon className="w-4 h-4" /> View
                  </button>
                )}
              </div>
            </div>
          ))}
          {trip.expenses.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest italic">No stops recorded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripDetailsScreen;