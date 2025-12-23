import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { APP_CONFIG } from '../constants';
import { ClockIcon, MapIcon, ArrowRightIcon, LogoIcon, PlusIcon, XIcon, RouteIcon } from '../components/Icons';
import { MetadataService } from '../services/MetadataService';
import { useAppState } from '../hooks/useAppState';

interface ProfileProps {
  user: UserProfile | null;
  onBack: () => void;
  onLogout: () => void;
}

const ProfileSettingsScreen: React.FC<ProfileProps> = ({ user, onBack, onLogout }) => {
  const { uid } = useAppState();
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'categories'>('settings');

  useEffect(() => {
    if (uid) {
      loadCategories();
    }
  }, [uid]);

  const loadCategories = async () => {
    const types = await MetadataService.getTripTypes(uid);
    setCategories(types);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim() || !uid) return;
    await MetadataService.addTripType(uid, newCategory.trim());
    setNewCategory('');
    setIsAdding(false);
    loadCategories();
  };

  const handleRemoveCategory = async (name: string) => {
    if (!uid) return;
    await MetadataService.removeTripType(uid, name);
    loadCategories();
  };

  const isDefault = (name: string) => ['Business', 'Personal'].includes(name);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={activeTab === 'categories' ? () => setActiveTab('settings') : onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:scale-90 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h2 className="text-xl font-black text-gray-900">{activeTab === 'categories' ? 'Manage Categories' : 'Profile'}</h2>
        </div>
        <LogoIcon className="w-8 h-8" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'settings' ? (
          <div className="animate-in fade-in duration-300">
            <div className="p-8 flex flex-col items-center">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4 border-4 border-indigo-50 shadow-inner relative">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                 <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17 4 12"/></svg>
                 </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900">{user?.firstName} {user?.lastName}</h3>
              <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mt-1">{APP_CONFIG.countryCode} {user?.phone}</p>
              
              <div className="mt-8 w-full bg-gray-50 rounded-[32px] p-6 border border-gray-100">
                <div className="grid grid-cols-2 gap-y-6">
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Date of Birth</p>
                    <p className="font-black text-gray-700">{user?.dob ? new Date(user.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Gender</p>
                    <p className="font-black text-gray-700">{user?.gender || 'N/A'}</p>
                  </div>
                </div>
                <button className="w-full mt-8 py-3 bg-white text-indigo-600 border-2 border-indigo-50 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-sm">
                  Edit Identity
                </button>
              </div>
            </div>

            <div className="px-6 space-y-3 pb-10">
              <h4 className="px-2 pb-2 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Travel Config</h4>
              
              <div 
                onClick={() => setActiveTab('categories')}
                className="p-5 flex items-center justify-between bg-white border border-gray-100 rounded-3xl group cursor-pointer active:bg-indigo-50 transition-all shadow-sm"
              >
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                          <RouteIcon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <span className="font-black text-gray-900 block text-sm">Trip Categories</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{categories.length} Active Labels</span>
                      </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition-colors" />
              </div>
              
              <div className="p-5 flex items-center justify-between bg-white border border-gray-100 rounded-3xl group cursor-pointer active:bg-emerald-50 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                          <MapIcon className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <span className="font-black text-gray-900 block text-sm">Map Settings</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Google Maps Grounding</span>
                      </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-300 group-hover:text-emerald-600 transition-colors" />
              </div>

              <div className="p-5 flex items-center justify-between bg-white border border-gray-100 rounded-3xl group cursor-pointer active:bg-red-50 transition-all shadow-sm mt-8" onClick={onLogout}>
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center shadow-inner">
                          <XIcon className="w-6 h-6 text-red-600" />
                      </div>
                      <span className="font-black text-gray-900 text-sm">Log Out</span>
                  </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 animate-in slide-in-from-right-8 duration-300 flex flex-col h-full">
            <div className="mb-6">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 px-1">Your Categories</p>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div key={cat} className="flex items-center justify-between bg-gray-50 p-5 rounded-3xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                        {isDefault(cat) ? '📌' : '✨'}
                      </div>
                      <span className={`font-black ${isDefault(cat) ? 'text-gray-400' : 'text-gray-900'}`}>{cat}</span>
                    </div>
                    {!isDefault(cat) && (
                      <button 
                        onClick={() => handleRemoveCategory(cat)}
                        className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-600 active:scale-90 transition-all"
                      >
                        <XIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-50">
              {isAdding ? (
                <div className="animate-in slide-in-from-bottom-4 space-y-4">
                  <input 
                    type="text" 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Work Retreat"
                    className="w-full p-5 bg-indigo-50 border-2 border-indigo-200 rounded-3xl outline-none font-black text-indigo-900 placeholder:text-indigo-300 shadow-inner"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={handleAddCategory}
                      disabled={!newCategory.trim()}
                      className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 active:scale-95 transition-all disabled:opacity-50"
                    >
                      SAVE
                    </button>
                    <button 
                      onClick={() => setIsAdding(false)}
                      className="px-6 py-4 bg-gray-100 text-gray-400 font-black rounded-2xl active:scale-95 transition-all"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAdding(true)}
                  className="w-full py-5 border-2 border-dashed border-indigo-200 text-indigo-600 font-black rounded-[28px] flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all active:scale-95"
                >
                  <PlusIcon className="w-6 h-6" /> ADD CUSTOM LABEL
                </button>
              )}
            </div>
            <p className="text-[9px] text-gray-300 font-black uppercase text-center mt-6 tracking-widest">
              Categories help organize your monthly insights
            </p>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-gray-50 text-center">
        <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.3em]">RoamReceipt v1.2.0</p>
      </div>
    </div>
  );
};

export default ProfileSettingsScreen;