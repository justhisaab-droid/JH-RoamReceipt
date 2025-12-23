
import React from 'react';
import { UserProfile } from '../types';
import { APP_CONFIG } from '../constants';
import { ClockIcon, MapIcon, ArrowRightIcon } from '../components/Icons';

interface ProfileProps {
  user: UserProfile | null;
  onBack: () => void;
  onLogout: () => void;
}

const ProfileSettingsScreen: React.FC<ProfileProps> = ({ user, onBack, onLogout }) => {
  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      <div className="flex items-center gap-4 p-6 border-b border-gray-100">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h2 className="text-xl font-bold">Profile & Settings</h2>
      </div>

      <div className="p-8 flex flex-col items-center">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4 border-4 border-indigo-50 shadow-inner relative">
           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
           <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17 4 12"/></svg>
           </div>
        </div>
        <h3 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h3>
        <p className="text-gray-400 font-medium">{APP_CONFIG.countryCode} {user?.phone}</p>
        
        <div className="mt-6 w-full bg-gray-50 rounded-3xl p-6 border border-gray-100">
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Date of Birth</p>
              <p className="font-bold text-gray-700">{user?.dob ? new Date(user.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Gender</p>
              <p className="font-bold text-gray-700">{user?.gender || 'N/A'}</p>
            </div>
          </div>
          <button className="w-full mt-6 py-2.5 bg-white text-indigo-600 border border-indigo-100 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-50 transition-all">
            Edit Details
          </button>
        </div>
      </div>

      <div className="px-6 flex-1 space-y-2">
        <h4 className="px-2 pb-2 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Preferences & More</h4>
        
        <div className="p-4 flex items-center justify-between bg-gray-50 rounded-2xl group cursor-pointer hover:bg-indigo-50 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                </div>
                <span className="font-bold text-gray-700">Trip History</span>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="p-4 flex items-center justify-between bg-gray-50 rounded-2xl group cursor-pointer hover:bg-indigo-50 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-amber-500">
                    <MapIcon className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-700">Map Preferences</span>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-gray-400" />
        </div>

        <div className="p-4 flex items-center justify-between bg-gray-50 rounded-2xl group cursor-pointer hover:bg-indigo-50 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                </div>
                <span className="font-bold text-gray-700">Billing & Payment</span>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="p-6">
        <button
          onClick={onLogout}
          className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl active:bg-red-100 transition-all border border-red-100"
        >
          Log Out
        </button>
        <p className="text-center text-[10px] text-gray-300 mt-6 font-bold uppercase tracking-[0.2em]">NomadSpend v1.0.4</p>
      </div>
    </div>
  );
};

export default ProfileSettingsScreen;
