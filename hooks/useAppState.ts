import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, ConfirmationResult, User } from 'firebase/auth';
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
  
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUid(firebaseUser.uid);
        if (!user) {
          await fetchUserData(firebaseUser);
        }
      } else {
        setUid('');
        setUser(null);
        if (currentScreen !== Screen.SPLASH) {
          setCurrentScreen(Screen.LOGIN);
        }
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, [user, currentScreen]);

  const fetchUserData = async (firebaseUser: User) => {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await ProfileService.getFromFirestore(firebaseUser.uid);
      if (profile) {
        setUser(profile);
        setPhone(profile.phone || '');
        const history = await TripService.getHistory(firebaseUser.uid);
        const active = await TripService.getActiveTrip(firebaseUser.uid);
        setTrips(history);
        setActiveTrip(active);
        setCurrentScreen(Screen.DASHBOARD);
      } else {
        // New user or Google login without profile
        const rawPhone = firebaseUser.phoneNumber || "";
        setPhone(rawPhone.replace(/^\+91/, ""));
        setCurrentScreen(Screen.PROFILE_SETUP);
      }
    } catch (e: any) {
      console.error("Firestore Fetch Error:", e);
      setError("Unable to sync your travel data. Working with local copy.");
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = (screen: Screen) => setCurrentScreen(screen);

  const loginInitiated = (phoneNumber: string, result: ConfirmationResult) => {
    setPhone(phoneNumber);
    setConfirmationResult(result);
    navigate(Screen.OTP);
  };

  const verifyOTP = async (otp: string) => {
    if (!confirmationResult) {
      setError("Session expired. Please request a new OTP.");
      navigate(Screen.LOGIN);
      return;
    }

    setIsLoading(true);
    try {
      await confirmationResult.confirm(otp);
    } catch (e: any) {
      console.error("OTP Verification Error:", e);
      setError("Invalid or expired OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (data: { firstName: string, lastName: string, dob: string, gender: string }) => {
    if (!uid) return;
    const newUser = { ...data, phone, preferences: {} };
    setIsLoading(true);
    try {
      await ProfileService.saveToFirestore(uid, newUser);
      setUser(newUser);
      navigate(Screen.DASHBOARD);
    } catch (e) {
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
      setError("Failed to log stop locally.");
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

  const logout = async () => {
    await signOut(auth);
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
    navigate, login: loginInitiated, verifyOTP, saveProfile, startTrip, addStop, endTrip, logout, viewTrip,
  };
};