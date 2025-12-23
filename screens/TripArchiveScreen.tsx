import React, { useState, useMemo } from 'react';
import { Trip } from '../types';
import { APP_CONFIG } from '../constants';
import { ArrowLeftIcon, MapIcon, PinIcon, ArrowRightIcon, LogoIcon, XIcon, RouteIcon } from '../components/Icons';

interface ArchiveProps {
  trips: Trip[];
  onBack: () => void;
  onViewTrip: (trip: Trip) => void;
  onDeleteTrip: (tripId: string) => void;
}

const TripArchiveScreen: React.FC<ArchiveProps> = ({ trips, onBack, onViewTrip, onDeleteTrip }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredTrips = useMemo(() => {
    return trips.filter(t => 
      t.destination.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.startLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [trips, searchQuery]);

  const totalArchivedSpend = useMemo(() => {
    return trips.reduce((sum, t) => sum + t.expenses.reduce((s, e) => s + e.amount, 0), 0);
  }, [trips]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Delete this trip? This action cannot be undone.")) {
      setDeletingId(id);
      setTimeout(() => {
        onDeleteTrip(id);
        setDeletingId(null);
      }, 400);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="px-6 pt-10 pb-6 border-b border-gray-50">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:scale-90 transition-all">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-black text-gray-900 leading-none">Journey Archive</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{trips.length} Total Journeys</p>
            </div>
          </div>
          <LogoIcon className="w-8 h-8" />
        </div>

        {/* Stats Row */}
        <div className="flex gap-4">
          <div className="flex-1 bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Lifetime Spend</p>
            <p className="text-xl font-black text-indigo-900">{APP_CONFIG.currencySymbol}{totalArchivedSpend.toLocaleString('en-IN')}</p>
          </div>
          <div className="flex-1 bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total Stays</p>
            <p className="text-xl font-black text-emerald-900">{trips.reduce((s, t) => s + t.expenses.length, 0)} Stops</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative">
          <input
            type="text"
            placeholder="Search by destination or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 pl-12 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none font-bold text-gray-800 shadow-sm transition-all"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Trip List */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 space-y-4 pb-10">
        {filteredTrips.length > 0 ? filteredTrips.map((trip) => (
          <div
            key={trip.id}
            onClick={() => onViewTrip(trip)}
            className={`bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex items-center gap-5 active:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer group relative overflow-hidden ${deletingId === trip.id ? 'opacity-0 scale-90 -translate-x-full duration-400' : 'opacity-100 scale-100'}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${
              trip.type === 'Business' ? 'bg-indigo-50 text-indigo-600' : 
              trip.type === 'Personal' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {trip.type === 'Business' ? <MapIcon className="w-6 h-6" /> : <PinIcon className="w-6 h-6" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-gray-900 truncate text-lg leading-tight">{trip.destination}</h4>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                {new Date(trip.startTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} • {trip.type}
              </p>
              <div className="flex items-center gap-2 mt-2">
                 <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">{trip.vehicle}</span>
                 <span className="text-[9px] font-black text-gray-400 uppercase">{trip.expenses.length} expenses</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="font-black text-gray-900 text-lg leading-none">{APP_CONFIG.currencySymbol}{trip.expenses.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}</p>
              <button 
                onClick={(e) => handleDelete(e, trip.id)}
                className="mt-3 p-2 text-gray-300 hover:text-red-500 active:scale-90 transition-all opacity-0 group-hover:opacity-100"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-200 mx-auto mb-4 shadow-sm">
              <RouteIcon className="w-10 h-10" />
            </div>
            <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">No journeys found</p>
            <p className="text-gray-300 text-[10px] mt-2 max-w-[150px] mx-auto font-medium">Try a different search or start a new trip.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripArchiveScreen;