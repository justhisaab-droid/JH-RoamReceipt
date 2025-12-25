import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Screen, Trip, UserProfile, Expense, Coords } from '../types';
import { ProfileService } from '../services/ProfileService';
import { TripService } from '../services/TripService';
import { ExpenseService } from '../services/ExpenseService';
import { auth } from '../services/FirebaseService';

export const useAppState = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.SPLASH);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [uid, setUid] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [otpConfirmation, setOtpConfirmation] = useState<any>(null);
  
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      if (uid) {
        setIsLoading(true);
        try {
          await TripService.syncLocalTrips(uid);
          await refreshHistory();
        } finally {
          setIsLoading(false);
        }
      }
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Modular syntax for state observer
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUid(firebaseUser.uid);
        await fetchUserData(firebaseUser.uid, firebaseUser.phoneNumber);
      } else {
        if (uid && !uid.startsWith('mock_')) {
            setUid('');
            setUser(null);
            setCurrentScreen(Screen.LOGIN);
        }
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, [uid]);

  const fetchUserData = async (userId: string, phoneNumber: string | null) => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const profile = await ProfileService.getFromFirestore(userId);
      if (profile) {
        setUser(profile);
        setPhone(profile.phone || '');
        const history = await TripService.getHistory(userId);
        const active = await TripService.getActiveTrip(userId);
        setTrips(history);
        setActiveTrip(active);
        setCurrentScreen(Screen.DASHBOARD);
      } else {
        const rawPhone = phoneNumber || "";
        setPhone(rawPhone.replace(/^\+91/, ""));
        setCurrentScreen(Screen.PROFILE_SETUP);
      }
    } catch (e: any) {
      console.error("Fetch Data Error:", e);
      setCurrentScreen(Screen.PROFILE_SETUP);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshHistory = async () => {
    if (!uid) return;
    const history = await TripService.getHistory(uid);
    setTrips(history);
    const active = await TripService.getActiveTrip(uid);
    setActiveTrip(active);
  };

  const navigate = (screen: Screen) => setCurrentScreen(screen);

  const loginWithOtp = async (phoneNumber: string, confirmation: any) => {
    setPhone(phoneNumber);
    setOtpConfirmation(confirmation);
    setCurrentScreen(Screen.OTP);
  };

  const verifyOtp = async (code: string) => {
    if (!otpConfirmation) return;
    setIsLoading(true);
    setError(null);
    try {
      await otpConfirmation.confirm(code);
    } catch (e: any) {
      setError("Invalid verification code. Please try again.");
      setIsLoading(false);
    }
  };

  const saveProfile = async (data: { firstName: string, lastName: string, dob: string, gender: string }) => {
    if (!uid) return;
    const newUser: UserProfile = { ...data, phone, preferences: {} };
    setIsLoading(true);
    try {
      await ProfileService.saveToFirestore(uid, newUser);
      setUser(newUser);
      navigate(Screen.DASHBOARD);
    } catch (e) {
      console.error("Save Profile Error:", e);
      setError("Failed to save profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const startTrip = async (params: { 
    start: string, 
    startCoords?: Coords, 
    dest: string, 
    destCoords?: Coords, 
    type: string, 
    vehicle: string, 
    travelers: number 
  }) => {
    if (!uid) return;
    const newTrip = TripService.createTripObject({
      userId: uid,
      startLocation: params.start,
      startCoords: params.startCoords,
      destination: params.dest,
      destCoords: params.destCoords,
      type: params.type,
      vehicle: params.vehicle,
      travelersCount: params.travelers
    });
    try {
      await TripService.saveTrip(newTrip);
      setActiveTrip(newTrip);
      navigate(Screen.ACTIVE_TRIP);
    } catch (e) {
      setError("Could not start trip.");
    }
  };

  const addStop = async (expenseData: Omit<Expense, 'id' | 'timestamp'>) => {
    if (!activeTrip) return;
    const newExpense = ExpenseService.createExpenseRecord(expenseData);
    const updatedTrip = { ...activeTrip, expenses: [...activeTrip.expenses, newExpense] };
    try {
      await TripService.saveTrip(updatedTrip);
      setActiveTrip(updatedTrip);
      navigate(Screen.ACTIVE_TRIP);
    } catch (e) {
      setError("Failed to log stop.");
    }
  };

  const endTrip = async () => {
    if (!activeTrip) return;
    const completed: Trip = { ...activeTrip, endTime: Date.now(), status: 'completed' };
    try {
      await TripService.saveTrip(completed);
      setTrips([completed, ...trips]);
      setActiveTrip(null);
      navigate(Screen.TRIP_SUMMARY);
    } catch (e) {
      setError("Failed to finalize trip.");
    }
  };

  const deleteTrip = async (tripId: string) => {
    if (!uid) return;
    try {
      await TripService.deleteTrip(tripId, uid);
      setTrips(prev => prev.filter(t => t.id !== tripId));
    } catch (e) {
      setError("Failed to delete trip.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Firebase signOut failed", e);
    }
    setUser(null);
    setPhone('');
    setUid('');
    navigate(Screen.LOGIN);
  };

  const viewTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    navigate(Screen.TRIP_DETAILS);
  };

  return {
    currentScreen, user, phone, uid, trips, activeTrip, selectedTrip, isLoading, error, setError, isOnline,
    navigate, loginWithOtp, verifyOtp, saveProfile, startTrip, addStop, endTrip, logout, viewTrip, deleteTrip, refreshHistory
  };
};