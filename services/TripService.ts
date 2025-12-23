
import { Trip, Coords } from '../types';
import { db } from './FirestoreService';
// Fixed: Switched from 'firebase/firestore/lite' to 'firebase/firestore' to resolve missing export errors
import { collection, doc, setDoc, query, where, orderBy, getDocs } from 'firebase/firestore';

export class TripService {
  static createTripObject(params: {
    userId: string;
    startLocation: string;
    startCoords?: Coords;
    destination: string;
    destCoords?: Coords;
    type: string;
    vehicle: string;
    travelersCount: number;
  }): Trip {
    const timestamp = Date.now();
    const id = `trip_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      id,
      userId: params.userId,
      startLocation: params.startLocation || 'Current Location',
      startCoords: params.startCoords,
      destination: params.destination,
      destCoords: params.destCoords,
      startTime: timestamp,
      type: params.type,
      vehicle: params.vehicle,
      expenses: [],
      status: 'active',
      travelersCount: params.travelersCount,
    };
  }

  static async saveTrip(trip: Trip): Promise<void> {
    const tripRef = doc(db, 'trips', trip.id);
    await setDoc(tripRef, trip);
  }

  static async getHistory(userId: string): Promise<Trip[]> {
    const tripsRef = collection(db, 'trips');
    const q = query(
      tripsRef, 
      where('userId', '==', userId), 
      where('status', '==', 'completed'),
      orderBy('startTime', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as Trip);
  }

  static async getActiveTrip(userId: string): Promise<Trip | null> {
    const tripsRef = collection(db, 'trips');
    const q = query(
      tripsRef, 
      where('userId', '==', userId), 
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    return snap.empty ? null : (snap.docs[0].data() as Trip);
  }
}
