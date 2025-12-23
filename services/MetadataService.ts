import { db } from "./FirestoreService";
import { doc, getDoc, setDoc } from 'firebase/firestore';

export class MetadataService {
  private static DEFAULT_VEHICLES = ['Car', 'SUV', 'Truck'];
  private static DEFAULT_TRIP_TYPES = ['Business', 'Personal'];

  /**
   * VEHICLES
   */
  static async getVehicles(uid: string): Promise<string[]> {
    const custom = await this.getCustomList(uid, 'vehicles');
    return Array.from(new Set([...this.DEFAULT_VEHICLES, ...custom]));
  }

  static async addVehicle(uid: string, name: string): Promise<void> {
    if (this.DEFAULT_VEHICLES.includes(name)) return;
    const custom = await this.getCustomList(uid, 'vehicles');
    if (!custom.includes(name)) {
      custom.push(name);
      await this.saveCustomList(uid, 'vehicles', custom);
    }
  }

  static async removeVehicle(uid: string, name: string): Promise<void> {
    const custom = await this.getCustomList(uid, 'vehicles');
    const filtered = custom.filter(v => v !== name);
    if (filtered.length !== custom.length) {
      await this.saveCustomList(uid, 'vehicles', filtered);
    }
  }

  /**
   * TRIP TYPES
   */
  static async getTripTypes(uid: string): Promise<string[]> {
    const custom = await this.getCustomList(uid, 'triptypes');
    // Ensure Defaults are always first, followed by unique custom types
    return Array.from(new Set([...this.DEFAULT_TRIP_TYPES, ...custom]));
  }

  static async addTripType(uid: string, name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed || this.DEFAULT_TRIP_TYPES.includes(trimmed)) return;
    
    const custom = await this.getCustomList(uid, 'triptypes');
    if (!custom.includes(trimmed)) {
      custom.push(trimmed);
      await this.saveCustomList(uid, 'triptypes', custom);
    }
  }

  static async removeTripType(uid: string, name: string): Promise<void> {
    const custom = await this.getCustomList(uid, 'triptypes');
    const filtered = custom.filter(t => t !== name);
    if (filtered.length !== custom.length) {
      await this.saveCustomList(uid, 'triptypes', filtered);
    }
  }

  /**
   * INTERNAL HELPERS
   */
  private static async getCustomList(uid: string, key: 'vehicles' | 'triptypes'): Promise<string[]> {
    const localKey = `metadata_custom_${key}_${uid}`;
    const localData = JSON.parse(localStorage.getItem(localKey) || '[]');

    if (!uid || uid.startsWith('mock_')) return localData;

    try {
      const metadataRef = doc(db, 'metadata', `${uid}_${key}`);
      const snap = await getDoc(metadataRef);
      if (snap.exists()) {
        const remoteData = (snap.data() as { list: string[] })?.list || [];
        // Sync local with remote if online
        localStorage.setItem(localKey, JSON.stringify(remoteData));
        return remoteData;
      }
    } catch (e) {
      console.warn(`Firestore getCustomList for ${key} failed`, e);
    }
    return localData;
  }

  private static async saveCustomList(uid: string, key: 'vehicles' | 'triptypes', list: string[]): Promise<void> {
    const localKey = `metadata_custom_${key}_${uid}`;
    localStorage.setItem(localKey, JSON.stringify(list));

    if (!uid || uid.startsWith('mock_')) return;

    try {
      const metadataRef = doc(db, 'metadata', `${uid}_${key}`);
      await setDoc(metadataRef, { list });
    } catch (e) {
      console.warn(`Firestore saveCustomList for ${key} failed`, e);
    }
  }
}