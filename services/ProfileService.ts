
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile } from "../types";
import { db } from "./FirestoreService";
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export class ProfileService {
  /**
   * Extract user profile info from bio using Gemini 3 Flash.
   */
  static async extractFromBio(bio: string): Promise<Partial<UserProfile>> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract user profile information from the following biography: "${bio}". 
        Be accurate. For date of birth, use YYYY-MM-DD format. 
        For gender, return one of: 'Male', 'Female', 'Other'.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              firstName: { type: Type.STRING },
              lastName: { type: Type.STRING },
              dob: { type: Type.STRING, description: "Date of birth in YYYY-MM-DD format" },
              gender: { type: Type.STRING, description: "One of: Male, Female, Other" }
            },
            required: ["firstName", "lastName", "dob"]
          }
        }
      });
      const text = response.text;
      return JSON.parse(text || "{}");
    } catch (error) {
      console.error("Profile extraction failed:", error);
      throw error;
    }
  }

  /**
   * Saves user profile to the 'users' collection (User Table).
   */
  static async saveToFirestore(uid: string, profile: UserProfile): Promise<void> {
    if (uid.startsWith('mock_')) {
      localStorage.setItem(`user_${uid}`, JSON.stringify(profile));
      return;
    }
    try {
      // Primary 'users' collection as requested
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        ...profile,
        updatedAt: serverTimestamp(),
        // Add a created flag if it's the first time
        createdAt: serverTimestamp() 
      }, { merge: true });
    } catch (e) {
      console.warn("Firestore 'users' save failed, falling back to local storage", e);
      localStorage.setItem(`user_${uid}`, JSON.stringify(profile));
    }
  }

  /**
   * Fetches user profile from the 'users' collection.
   */
  static async getFromFirestore(uid: string): Promise<UserProfile | null> {
    if (uid.startsWith('mock_')) {
      const data = localStorage.getItem(`user_${uid}`);
      return data ? JSON.parse(data) : null;
    }
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) return snap.data() as UserProfile;
    } catch (e) {
      console.warn("Firestore fetch from 'users' failed, checking local storage", e);
    }
    const localData = localStorage.getItem(`user_${uid}`);
    return localData ? JSON.parse(localData) : null;
  }
}
