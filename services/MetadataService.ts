import { db } from "./FirestoreService";
import { doc, getDoc, setDoc } from 'firebase/firestore';

export class MetadataService {
  private static DEFAULT_VEHICLES = ['Car', 'SUV', 'Bike', 'Bus', 'Rickshaw', 'Train', 'Flight'];
  private static DEFAULT_TRIP_TYPES = ['Personal', 'Business', 'Family', 'Pilgrimage', 'Solo', 'Vacation'];

  static async getVehicles(uid: string): Promise<string[]> {
    if (!uid) return this.DEFAULT_VEHICLES;
    const metadataRef = doc(db, 'metadata', `${uid}_vehicles`);
    const snap = await getDoc(metadataRef);
    return snap.exists() ? (snap.data() as { list: string[] })?.list || this.DEFAULT_VEHICLES : this.DEFAULT_VEHICLES;
  }

  static async getTripTypes(uid: string): Promise<string[]> {
    if (!uid) return this.DEFAULT_TRIP_TYPES;
    const metadataRef = doc(db, 'metadata', `${uid}_triptypes`);
    const snap = await getDoc(metadataRef);
    return snap.exists() ? (snap.data() as { list: string[] })?.list || this.DEFAULT_TRIP_TYPES : this.DEFAULT_TRIP_TYPES;
  }

  static async addVehicle(uid: string, name: string): Promise<void> {
    const list = await this.getVehicles(uid);
    if (!list.includes(name)) {
      list.push(name);
      const metadataRef = doc(db, 'metadata', `${uid}_vehicles`);
      await setDoc(metadataRef, { list });
    }
  }

  static async addTripType(uid: string, name: string): Promise<void> {
    const list = await this.getTripTypes(uid);
    if (!list.includes(name)) {
      list.push(name);
      const metadataRef = doc(db, 'metadata', `${uid}_triptypes`);
      await setDoc(metadataRef, { list });
    }
  }
}