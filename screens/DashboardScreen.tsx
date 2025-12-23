import React from 'react';
import { UserProfile, Trip, TripType } from '../types';
import { APP_CONFIG } from '../constants';
import { UserIcon, ClockIcon, PlusIcon, MapIcon, PinIcon, ArrowRightIcon } from '../components/Icons';

interface DashboardProps {
  user: UserProfile | null;
  trips: Trip[];
  activeTrip: Trip | null;
  onStartNewTrip: () => void;
  onViewTrip: (trip: Trip) => void;
  onViewStats: () => void;
  onViewProfile: () => void;
  onGoToActiveTrip: () => void;
}

const DashboardScreen: React.FC<DashboardProps> = ({ 
  user, 
  trips, 
  activeTrip, 
  onStartNewTrip, 
  onViewTrip, 
  onViewStats, 
  onViewProfile,
  onGoToActiveTrip 
}) => {
  const currentMonthTrips = trips.filter(t => new Date(t.startTime).getMonth() === new Date().getMonth());
  const totalExpense = currentMonthTrips.reduce((sum, t) => 
    sum + t.expenses.reduce((s, e) => s + e.amount, 0), 0
  );

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] overflow-y-auto pb-32 animate-in fade-in duration-500">
      {/* Header */}
      <div className="px-6 pt-10 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">RoamReceipt</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Namaste, {user?.firstName || 'Explorer'}</p>
        </div>
        <button 
          onClick={onViewProfile}
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl shadow-gray-200/50 border border-gray-100 active:scale-90 transition-transform"
        >
          <UserIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="px-6 space-y-6">
        {/* Modern Spending Card */}
        <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl" />
          
          <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">This Month's Spending</p>
          <h2 className="text-5xl font-black tracking-tighter">
            {APP_CONFIG.currencySymbol}{totalExpense.toLocaleString('en-IN')}
          </h2>
          
          <div className="flex gap-3 mt-8">
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Journeys</p>
              <p className="text-xl font-black">{currentMonthTrips.length}</p>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Avg Daily</p>
              <p className="text-xl font-black">{APP_CONFIG.currencySymbol}{Math.round(totalExpense / 30).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-center pt-2">
          <h3 className="text-xl font-black text-gray-900">Recent Trips</h3>
          <button className="text-indigo-600 text-xs font-black uppercase tracking-widest">See Archive</button>
        </div>

        {/* Trips List */}
        <div className="space-y-4">
          {trips.length > 0 ? trips.slice(0, 5).map((trip) => (
            <div
              key={trip.id}
              onClick={() => onViewTrip(trip)}
              className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex items-center gap-5 active:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                trip.type === 'Business' ? 'bg-indigo-50 text-indigo-600' : 
                trip.type === 'Personal' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {trip.type === 'Business' ? <MapIcon className="w-6 h-6" /> : <PinIcon className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-gray-900 truncate text-lg leading-tight">{trip.destination}</h4>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                  {new Date(trip.startTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} • {trip.type}
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-gray-900 text-lg leading-none">{APP_CONFIG.currencySymbol}{trip.expenses.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}</p>
                <div className="text-gray-300 group-hover:text-indigo-600 transition-colors mt-2">
                   <ArrowRightIcon className="w-5 h-5" />
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mx-auto mb-4">
                <MapIcon className="w-10 h-10" />
              </div>
              <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">No trips yet</p>
              <p className="text-gray-300 text-[10px] mt-2 max-w-[150px] mx-auto font-medium">Your world is waiting. Start a new journey below.</p>
            </div>
          )}
        </div>
      </div>

      {/* Android FAB (Floating Action Button) */}
      {!activeTrip && (
        <button
          onClick={onStartNewTrip}
          className="fixed bottom-24 right-6 w-16 h-16 bg-indigo-600 rounded-[24px] shadow-2xl shadow-indigo-400 flex items-center justify-center text-white active:scale-95 active:rotate-90 transition-all z-50 border-4 border-white"
        >
          <PlusIcon className="w-8 h-8" />
        </button>
      )}
    </div>
  );
};

export default DashboardScreen;