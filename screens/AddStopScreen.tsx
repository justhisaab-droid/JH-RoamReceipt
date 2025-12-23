import React, { useState, useEffect, useRef } from 'react';
import { Coords, Trip } from '../types';
import { APP_CONFIG } from '../constants';
import { useLocation } from '../hooks/useLocation';
import { LocationService, PlaceResult } from '../services/LocationService';
import { ExpenseService, CategoryItem } from '../services/ExpenseService';
import { CameraIcon, CrosshairIcon, XIcon, PinIcon, SparklesIcon, LogoIcon } from '../components/Icons';
import { useAppState } from '../hooks/useAppState';

interface AddStopProps {
  trip: Trip | null;
  onSave: (expense: { category: string, amount: number, location: string, coords?: Coords, vendorName?: string, notes?: string, receiptUrl?: string, distanceFromPrevious?: number }) => void;
  onBack: () => void;
  isOnline: boolean;
}

const AddStopScreen: React.FC<AddStopProps> = ({ trip, onSave, onBack, isOnline }) => {
  const { uid } = useAppState();
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Fuel');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorCoords, setVendorCoords] = useState<Coords | undefined>();
  const [locationAddress, setLocationAddress] = useState('Detecting...');
  const [notes, setNotes] = useState('');
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<CategoryItem[]>([]);
  const [distanceInfo, setDistanceInfo] = useState<{ value: number, from: string } | null>(null);
  const [offlineToast, setOfflineToast] = useState<string | null>(null);

  const { detect, coords: currentGPS, error } = useLocation();
  const searchTimeout = useRef<number | null>(null);

  useEffect(() => {
    detect(setLocationAddress);
    if (uid) {
      ExpenseService.getAllCategories(uid).then(setAvailableCategories);
    }
  }, [uid]);

  useEffect(() => {
    if (currentGPS && !isAddingCustom && isOnline) handleSearch();
  }, [currentGPS, selectedCategory, isOnline]);

  useEffect(() => {
    const targetCoords = vendorCoords || currentGPS;
    if (!targetCoords || !trip) return;
    let refCoords = trip.expenses.length > 0 ? trip.expenses[trip.expenses.length - 1].coords : trip.startCoords;
    let refName = trip.expenses.length > 0 ? 'Last Stop' : 'Trip Start';
    if (refCoords) {
      const dist = LocationService.calculateDistance(refCoords.lat, refCoords.lng, targetCoords.lat, targetCoords.lng);
      setDistanceInfo({ value: dist, from: refName });
    }
  }, [vendorCoords, currentGPS, trip]);

  const handleCategoryChange = (val: string) => {
    if (val === 'ADD_NEW') {
      setIsAddingCustom(true);
      setSelectedCategory('Other');
    } else {
      setIsAddingCustom(false);
      setSelectedCategory(val);
    }
  };

  const handleSearch = async (val: string = '') => {
    if (!currentGPS || !isOnline) return;
    setIsSearching(true);
    try {
      const results = await LocationService.findNearbyVendors(selectedCategory, currentGPS.lat, currentGPS.lng, val);
      setSuggestions(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const onVendorChange = (val: string) => {
    setVendorName(val);
    if (!isOnline) return; // Skip search if offline
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    searchTimeout.current = window.setTimeout(() => val.length > 2 && handleSearch(val), 600) as any;
  };

  const selectSuggestion = (s: PlaceResult) => {
    setVendorName(s.name);
    setVendorCoords(s.coords);
    setSuggestions([]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!isOnline) {
      setOfflineToast("AI Scan requires internet. Photo will be saved but not analyzed.");
      setTimeout(() => setOfflineToast(null), 3000);
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setReceiptPreview(reader.result as string);
      
      if (isOnline) {
        setIsScanning(true);
        try {
          const extracted = await ExpenseService.extractReceiptDetails(base64, file.type);
          if (extracted.amount) setAmount(extracted.amount.toString());
          if (extracted.vendorName) setVendorName(extracted.vendorName);
          if (extracted.category) {
            const match = availableCategories.find(c => c.name.toLowerCase() === extracted.category?.toLowerCase());
            if (match) setSelectedCategory(match.name);
          }
          if (extracted.notes) setNotes(extracted.notes);
        } catch (err) {
          console.error("Scanning failed", err);
        } finally {
          setIsScanning(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!amount || !trip || !uid) return;
    let finalCategory = selectedCategory;
    if (isAddingCustom && customCategoryName.trim()) {
      const newCat = await ExpenseService.addCustomCategory(uid, customCategoryName.trim());
      finalCategory = newCat.name;
    }
    onSave({ 
      category: finalCategory, 
      amount: parseFloat(amount), 
      location: locationAddress, 
      coords: vendorCoords || currentGPS || undefined,
      vendorName: vendorName || undefined, 
      notes, 
      receiptUrl: receiptPreview || undefined,
      distanceFromPrevious: distanceInfo?.value
    });
  };

  return (
    <div className="flex flex-col h-full bg-white p-6 overflow-y-auto relative">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 transition-transform active:scale-90">
          <XIcon className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-gray-900 leading-none">Add Stop</h2>
            <LogoIcon className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 truncate max-w-[200px]">{locationAddress}</p>
        </div>
        {!isOnline && (
          <div className="bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
            <span className="text-[8px] font-black text-amber-700 uppercase">Offline</span>
          </div>
        )}
      </div>

      {offlineToast && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl animate-in slide-in-from-top-2">
          <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight leading-tight">{offlineToast}</p>
        </div>
      )}

      <div className="space-y-6 flex-1 pb-32">
        <div className="space-y-2">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Proof of Spend</label>
          <label className={`w-full border-2 border-dashed rounded-[24px] px-5 py-4 flex items-center gap-4 cursor-pointer transition-all relative ${receiptPreview ? 'border-indigo-600 bg-indigo-50/20' : 'border-gray-200'}`}>
            <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
            {receiptPreview ? (
              <>
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm bg-white"><img src={receiptPreview} className="w-full h-full object-cover" /></div>
                <div className="flex flex-col text-indigo-700">
                   <span className="text-sm font-black uppercase">Captured</span>
                   <span className="text-[10px] font-bold opacity-60">Tap to retake</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><CameraIcon className="w-8 h-8" /></div>
                <div className="flex-1">
                  <span className="text-sm font-black text-gray-900 block">RECORD RECEIPT</span>
                  {!isOnline && <span className="text-[9px] font-bold text-amber-600 block">AI analysis unavailable offline</span>}
                </div>
              </>
            )}
            {isScanning && <div className="absolute inset-0 bg-indigo-900/80 backdrop-blur-sm z-20 flex items-center gap-4 px-5"><div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" /><p className="text-[10px] font-black text-white">AI Analysis...</p></div>}
          </label>
        </div>

        <div className="bg-indigo-600 rounded-[28px] p-6 text-white shadow-xl relative overflow-hidden">
          <label className="block text-[10px] font-black uppercase opacity-70 mb-2">Amount Spent</label>
          <div className="flex items-center">
            <span className="text-2xl font-black mr-2">{APP_CONFIG.currencySymbol}</span>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="bg-transparent text-4xl font-black w-full outline-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Expense Category</label>
          <select value={isAddingCustom ? 'ADD_NEW' : selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-bold text-gray-800 appearance-none">
            {availableCategories.map((cat) => <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>)}
            <option value="ADD_NEW" className="text-indigo-600 font-bold">➕ Add New Category...</option>
          </select>
        </div>

        <div className="relative">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Vendor / Business</label>
          <input type="text" value={vendorName} onChange={(e) => onVendorChange(e.target.value)} placeholder={isOnline ? `Search ${selectedCategory}...` : "Type vendor name..."} className="w-full p-4 pl-12 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-bold text-gray-800" />
          {!isOnline && <p className="mt-1 text-[9px] font-bold text-amber-600 uppercase tracking-tight px-1">Search unavailable offline</p>}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-xl border-t z-40">
        <button onClick={handleSave} disabled={!amount || isScanning} className={`w-full py-4 rounded-[20px] font-black text-lg ${amount && !isScanning ? 'bg-indigo-600 text-white shadow-xl' : 'bg-gray-100 text-gray-300'}`}>
          {isScanning ? 'ANALYZING...' : isOnline ? 'CONFIRM STOP' : 'SAVE LOCALLY'}
        </button>
      </div>
    </div>
  );
};

export default AddStopScreen;