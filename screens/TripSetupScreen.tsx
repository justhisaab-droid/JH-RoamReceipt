import React, { useState, useEffect, useRef } from 'react';
import { Coords, UserProfile } from '../types';
import { useLocation } from '../hooks/useLocation';
import { LocationService, PlaceResult } from '../services/LocationService';
import { MetadataService } from '../services/MetadataService';
import { ArrowLeftIcon, LogoIcon } from '../components/Icons';
import { useAppState } from '../hooks/useAppState';

interface TripSetupProps {
  user: UserProfile | null;
  onStart: (params: { start: string, startCoords?: Coords, dest: string, destCoords?: Coords, type: string, vehicle: string, travelers: number }) => Promise<void>;
  onBack: () => void;
}

const TripSetupScreen: React.FC<TripSetupProps> = ({ user, onStart, onBack }) => {
  const { uid } = useAppState();
  const [startLocation, setStartLocation] = useState('');
  const [startCoords, setStartCoords] = useState<Coords | undefined>();
  const [destination, setDestination] = useState('');
  const [destCoords, setDestCoords] = useState<Coords | undefined>();
  
  const [availableVehicles, setAvailableVehicles] = useState<string[]>(['Car', 'SUV', 'Truck', 'Bus']);
  const [availableTripTypes, setAvailableTripTypes] = useState<string[]>(['Personal', 'Business']);

  const [selectedType, setSelectedType] = useState('Personal');
  const [isAddingCustomType, setIsAddingCustomType] = useState(false);
  const [customTypeName, setCustomTypeName] = useState('');

  const [selectedVehicle, setSelectedVehicle] = useState('Car');
  const [isStarting, setIsStarting] = useState(false);
  
  const [travelersCount, setTravelersCount] = useState(1);
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [searchingFor, setSearchingFor] = useState<'start' | 'dest' | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const { detect, isDetecting, error, setError, coords: currentGPS } = useLocation();
  const searchTimeout = useRef<number | null>(null);

  useEffect(() => {
    detect((address) => setStartLocation(address));
    const loadMetadata = async () => {
       if (!uid) return;
       const t = await MetadataService.getTripTypes(uid);
       setAvailableTripTypes(t);

       const v = await MetadataService.getVehicles(uid);
       setAvailableVehicles(v);
       if (v.length > 0) {
         setSelectedVehicle(v[0]);
       }
    };
    loadMetadata();
  }, [uid]);

  useEffect(() => {
    if (currentGPS) setStartCoords(currentGPS);
  }, [currentGPS]);

  const handleSearch = async (query: string, field: 'start' | 'dest') => {
    if (query.length < 3 || query.includes('Locating')) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    setSearchingFor(field);
    try {
      const results = await LocationService.searchPlaces(query);
      setSuggestions(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const onInputChange = (val: string, field: 'start' | 'dest') => {
    if (field === 'start') {
      setStartLocation(val);
      setStartCoords(undefined);
    } else {
      setDestination(val);
      setDestCoords(undefined);
    }
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    searchTimeout.current = window.setTimeout(() => handleSearch(val, field), 500) as any;
  };

  const selectSuggestion = (s: PlaceResult) => {
    if (searchingFor === 'start') {
      setStartLocation(s.name);
      setStartCoords(s.coords);
    } else {
      setDestination(s.name);
      setDestCoords(s.coords);
    }
    setSuggestions([]);
    setSearchingFor(null);
  };

  const handleStart = async () => {
    if (!uid || isStarting) return;
    
    setIsStarting(true);
    let finalType = selectedType;
    if (isAddingCustomType && customTypeName.trim()) {
      await MetadataService.addTripType(uid, customTypeName.trim());
      finalType = customTypeName.trim();
    }
    
    try {
      await onStart({ 
        start: startLocation, 
        startCoords, 
        dest: destination, 
        destCoords, 
        type: finalType, 
        vehicle: selectedVehicle, 
        travelers: travelersCount 
      });
    } catch (e) {
      console.error(e);
      setIsStarting(false);
    }
  };

  const isFormComplete = destination && startLocation && !isDetecting && selectedVehicle && (!isAddingCustomType || customTypeName.trim());

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden relative">
      <div className="flex items-center justify-between p-6 border-b border-gray-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} disabled={isStarting} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:scale-90 transition-all disabled:opacity-50">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900 leading-none">Trip Details</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Configure your journey</p>
          </div>
        </div>
        <LogoIcon className="w-8 h-8" />
      </div>

      {error && (
        <div className="absolute top-20 left-6 right-6 z-[60] animate-in fade-in slide-in-from-top-2">
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 flex items-center gap-3 shadow-sm">
            <p className="text-xs font-bold leading-tight flex-1">{error}</p>
            <button onClick={() => setError(null)} className="p-1">✕</button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 pt-6 space-y-8 pb-40">
        <div className="relative group">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Starting From</label>
            <button onClick={() => detect(setStartLocation)} disabled={isDetecting || isStarting} className="text-[10px] font-black text-indigo-600 uppercase disabled:opacity-50">
              {isDetecting ? 'Locating...' : 'Current'}
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Enter pickup point"
              value={startLocation}
              disabled={isStarting}
              onChange={(e) => onInputChange(e.target.value, 'start')}
              className="w-full p-5 pl-14 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl transition-all outline-none font-bold text-gray-800 shadow-sm disabled:opacity-50"
            />
            {isSearching && searchingFor === 'start' && <div className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>}
          </div>
          {suggestions.length > 0 && searchingFor === 'start' && (
            <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {suggestions.map((s, idx) => (
                <button key={idx} onClick={() => selectSuggestion(s)} className="w-full text-left px-5 py-4 border-b border-gray-50 active:bg-indigo-50 font-bold text-sm text-gray-800">{s.name}</button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1 mb-2">Destination</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Where are we going?"
              value={destination}
              disabled={isStarting}
              onChange={(e) => onInputChange(e.target.value, 'dest')}
              className="w-full p-5 pl-14 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-gray-800 shadow-sm disabled:opacity-50"
            />
            {isSearching && searchingFor === 'dest' && <div className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>}
          </div>
          {suggestions.length > 0 && searchingFor === 'dest' && (
            <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {suggestions.map((s, idx) => (
                <button key={idx} onClick={() => selectSuggestion(s)} className="w-full text-left px-5 py-4 border-b border-gray-50 active:bg-emerald-50 font-bold text-sm text-gray-800">{s.name}</button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Vehicle Selection</label>
          <div className="relative">
            <select
              value={selectedVehicle}
              disabled={isStarting}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none font-bold text-gray-800 appearance-none shadow-sm transition-all disabled:opacity-50"
            >
              {availableVehicles.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Trip Category</label>
          <div className="relative">
            <select
              value={isAddingCustomType ? 'ADD_CUSTOM' : selectedType}
              disabled={isStarting}
              onChange={(e) => {
                if (e.target.value === 'ADD_CUSTOM') {
                  setIsAddingCustomType(true);
                  setSelectedType('');
                } else {
                  setIsAddingCustomType(false);
                  setSelectedType(e.target.value);
                }
              }}
              className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none font-bold text-gray-800 appearance-none shadow-sm transition-all disabled:opacity-50"
            >
              {availableTripTypes.map(t => <option key={t} value={t}>{t}</option>)}
              <option value="ADD_CUSTOM" className="text-indigo-600">+ Add Custom Category...</option>
            </select>
          </div>
          {isAddingCustomType && (
            <div className="animate-in slide-in-from-top-2 fade-in">
              <input
                type="text"
                value={customTypeName}
                disabled={isStarting}
                onChange={(e) => setCustomTypeName(e.target.value)}
                placeholder="Enter category (e.g. Work Retreat)"
                className="w-full p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl outline-none font-bold text-indigo-900 placeholder:text-indigo-300 disabled:opacity-50"
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="pb-10">
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-3">Travelers</label>
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
            <span className="font-bold text-sm">Number of People</span>
            <div className="flex items-center gap-4 bg-white p-1 rounded-xl shadow-sm">
              <button onClick={() => setTravelersCount(Math.max(1, travelersCount - 1))} disabled={isStarting} className="w-10 h-10 text-indigo-600 font-black disabled:opacity-30">-</button>
              <span className="font-black">{travelersCount}</span>
              <button onClick={() => setTravelersCount(Math.min(20, travelersCount + 1))} disabled={isStarting} className="w-10 h-10 text-indigo-600 font-black disabled:opacity-30">+</button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-50 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <button
          onClick={handleStart}
          disabled={!isFormComplete || isStarting}
          className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 active:scale-95 ${
            isFormComplete && !isStarting 
              ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          {isStarting ? (
            <>
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              <span>STARTING JOURNEY...</span>
            </>
          ) : (
            'GO LIVE'
          )}
        </button>
      </div>
    </div>
  );
};

export default TripSetupScreen;