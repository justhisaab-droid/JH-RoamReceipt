
export enum Screen {
  SPLASH = 'SPLASH',
  LOGIN = 'LOGIN',
  OTP = 'OTP',
  PROFILE_SETUP = 'PROFILE_SETUP',
  DASHBOARD = 'DASHBOARD',
  TRIP_SETUP = 'TRIP_SETUP',
  ACTIVE_TRIP = 'ACTIVE_TRIP',
  ADD_STOP = 'ADD_STOP',
  TRIP_SUMMARY = 'TRIP_SUMMARY',
  TRIP_DETAILS = 'TRIP_DETAILS',
  MONTHLY_STATS = 'MONTHLY_STATS',
  PROFILE_SETTINGS = 'PROFILE_SETTINGS'
}

// Added missing TripType enum used for categorizing trips in the UI and services
export enum TripType {
  BUSINESS = 'Business',
  PERSONAL = 'Personal',
  FAMILY = 'Family',
  PILGRIMAGE = 'Pilgrimage',
  SOLO = 'Solo',
  VACATION = 'Vacation'
}

export interface Coords {
  lat: number;
  lng: number;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  location: string;
  coords?: Coords;
  vendorName?: string;
  timestamp: number;
  notes?: string;
  receiptUrl?: string;
  distanceFromPrevious?: number;
}

export interface Trip {
  id: string;
  userId: string; // Required for Firestore grouping
  destination: string;
  destCoords?: Coords;
  startLocation: string;
  startCoords?: Coords;
  startTime: number;
  endTime?: number;
  type: string;
  vehicle: string;
  expenses: Expense[];
  status: 'active' | 'completed';
  travelersCount: number;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  phone: string;
  preferences: {
    defaultTripType?: string;
    defaultVehicle?: string;
  };
}
