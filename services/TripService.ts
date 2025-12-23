
import { Trip, Coords } from '../types';
import { db } from './FirestoreService';
import { collection, doc, setDoc, query, where, orderBy, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';

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
    const storageKey = `trips_${trip.userId}`;
    const localTrips = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const index = localTrips.findIndex((t: Trip) => t.id === trip.id);
    
    if (index > -1) localTrips[index] = trip;
    else localTrips.push(trip);
    
    localStorage.setItem(storageKey, JSON.stringify(localTrips));

    // Try Firestore Sync
    if (!trip.userId.startsWith('mock_') && navigator.onLine) {
      try {
        const tripRef = doc(db, 'trips', trip.id);
        await setDoc(tripRef, {
          ...trip,
          syncedAt: Date.now(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.warn("Firestore saveTrip failed, will retry on next connection", e);
      }
    }
  }

  static async deleteTrip(tripId: string, userId: string): Promise<void> {
    const storageKey = `trips_${userId}`;
    const localTrips = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const filtered = localTrips.filter((t: Trip) => t.id !== tripId);
    localStorage.setItem(storageKey, JSON.stringify(filtered));

    if (!userId.startsWith('mock_')) {
      try {
        await deleteDoc(doc(db, 'trips', tripId));
      } catch (e) {
        console.warn("Firestore deleteTrip failed", e);
      }
    }
  }

  static async getHistory(userId: string): Promise<Trip[]> {
    const localTrips = JSON.parse(localStorage.getItem(`trips_${userId}`) || '[]');
    const completedLocal = localTrips.filter((t: Trip) => t.status === 'completed').sort((a: Trip, b: Trip) => b.startTime - a.startTime);

    if (userId.startsWith('mock_')) return completedLocal;

    if (navigator.onLine) {
      try {
        const tripsRef = collection(db, 'trips');
        const q = query(
          tripsRef, 
          where('userId', '==', userId), 
          where('status', '==', 'completed'),
          orderBy('startTime', 'desc')
        );
        const snap = await getDocs(q);
        const firestoreTrips = snap.docs.map(doc => doc.data() as Trip);
        if (firestoreTrips.length > 0) {
          // Sync local storage with latest from cloud
          localStorage.setItem(`trips_${userId}`, JSON.stringify([...firestoreTrips, ...localTrips.filter(lt => !firestoreTrips.some(ft => ft.id === lt.id))]));
          return firestoreTrips;
        }
      } catch (e) {
        console.warn("Firestore getHistory failed, falling back to local storage", e);
      }
    }
    return completedLocal;
  }

  static async getActiveTrip(userId: string): Promise<Trip | null> {
    const localTrips = JSON.parse(localStorage.getItem(`trips_${userId}`) || '[]');
    const activeLocal = localTrips.find((t: Trip) => t.status === 'active') || null;

    if (userId.startsWith('mock_')) return activeLocal;

    if (navigator.onLine) {
      try {
        const tripsRef = collection(db, 'trips');
        const q = query(
          tripsRef, 
          where('userId', '==', userId), 
          where('status', '==', 'active')
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const remoteActive = snap.docs[0].data() as Trip;
          // Update local cache
          this.saveTrip(remoteActive);
          return remoteActive;
        }
      } catch (e) {
        console.warn("Firestore getActiveTrip failed", e);
      }
    }
    return activeLocal;
  }

  static async syncLocalTrips(userId: string): Promise<void> {
    if (userId.startsWith('mock_') || !navigator.onLine) return;
    
    const localTrips = JSON.parse(localStorage.getItem(`trips_${userId}`) || '[]');
    for (const trip of localTrips) {
      // Logic to determine if sync is needed (e.g., missing syncedAt or modified recently)
      await this.saveTrip(trip);
    }
  }
}
