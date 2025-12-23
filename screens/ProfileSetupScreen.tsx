
import React, { useState, useMemo } from 'react';
import { ProfileService } from '../services/ProfileService';

interface ProfileSetupProps {
  onSave: (data: { firstName: string, lastName: string, dob: string, gender: string }) => void;
}

const ProfileSetupScreen: React.FC<ProfileSetupProps> = ({ onSave }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  
  const [bio, setBio] = useState('');
  const [isMagicFilling, setIsMagicFilling] = useState(false);
  const [showMagicFill, setShowMagicFill] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxDate = useMemo(() => {
    const today = new Date();
    const tenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
    return tenYearsAgo.toISOString().split('T')[0];
  }, []);

  const isFormValid = useMemo(() => {
    if (!firstName || !lastName || !dob || !gender) return false;
    const selectedDate = new Date(dob);
    const limitDate = new Date(maxDate);
    return selectedDate <= limitDate;
  }, [firstName, lastName, dob, gender, maxDate]);

  const handleMagicFill = async () => {
    if (!bio.trim()) return;
    
    setIsMagicFilling(true);
    setError(null);
    try {
      const extracted = await ProfileService.extractFromBio(bio);
      if (extracted.firstName) setFirstName(extracted.firstName);
      if (extracted.lastName) setLastName(extracted.lastName);
      if (extracted.dob) setDob(extracted.dob);
      if (extracted.gender) setGender(extracted.gender);
      
      // Close magic fill on success
      setTimeout(() => setShowMagicFill(false), 500);
    } catch (err) {
      setError("Couldn't extract info. Please check your text or fill manually.");
    } finally {
      setIsMagicFilling(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white p-8 overflow-y-auto pb-10">
      <div className="mt-8 mb-6">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Final Step</h2>
        <p className="text-gray-500 mt-2 font-medium">Personalize your travel tracking experience.</p>
      </div>

      {/* AI Magic Fill Toggle */}
      <div className="mb-8">
        {!showMagicFill ? (
          <button 
            onClick={() => setShowMagicFill(true)}
            className="w-full py-3 px-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all"
          >
            <span>✨</span> Magic Fill with AI Bio
          </button>
        ) : (
          <div className="bg-indigo-600 rounded-3xl p-5 text-white shadow-xl shadow-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-80">Describe yourself briefly</label>
              <button onClick={() => setShowMagicFill(false)} className="text-white/60 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. I am Rahul Dravid, born on Jan 11 1973, Male."
              className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm placeholder:text-white/40 outline-none focus:bg-white/20 transition-all h-20 resize-none mb-3 font-medium"
            />
            <button
              onClick={handleMagicFill}
              disabled={isMagicFilling || !bio.trim()}
              className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                isMagicFilling ? 'bg-white/20 text-white/50' : 'bg-white text-indigo-600 shadow-lg active:scale-95'
              }`}
            >
              {isMagicFilling ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : 'Apply Magic Fill'}
            </button>
            {error && <p className="mt-2 text-[10px] text-red-200 font-bold">{error}</p>}
          </div>
        )}
      </div>

      <div className="space-y-6 flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-600 transition-colors">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Arjun"
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-gray-800"
            />
          </div>
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-600 transition-colors">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Sharma"
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-gray-800"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-600 transition-colors">Date of Birth</label>
          <input
            type="date"
            value={dob}
            max={maxDate}
            onChange={(e) => setDob(e.target.value)}
            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-gray-800"
          />
          <p className="mt-2 text-[9px] font-black text-gray-400 uppercase tracking-wider leading-relaxed">
            Safety Note: You must be at least 10 years old to use RoamReceipt.
          </p>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Gender</label>
          <div className="flex gap-3">
            {['Male', 'Female', 'Other'].map(g => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-3.5 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all transform active:scale-95 ${
                  gender === g ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-gray-50 border-transparent text-gray-400'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => onSave({ firstName, lastName, dob, gender })}
        disabled={!isFormValid}
        className={`w-full py-5 mt-8 rounded-2xl font-black text-lg tracking-tight shadow-xl transition-all transform active:scale-95 ${
          isFormValid ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
        }`}
      >
        Complete Profile
      </button>
    </div>
  );
};

export default ProfileSetupScreen;
