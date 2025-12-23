import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile } from "../types";
import { db } from "./FirestoreService";
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
              gender: { type: Type.STRING, description: "One of: Male, Female, Other" },
            },
            required: ["firstName", "lastName"]
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

  static async saveToFirestore(uid: string, profile: UserProfile): Promise<void> {
    const profileRef = doc(db, 'profiles', uid);
    await setDoc(profileRef, profile, { merge: true });
  }

  static async getFromFirestore(uid: string): Promise<UserProfile | null> {
    const profileRef = doc(db, 'profiles', uid);
    const snap = await getDoc(profileRef);
    return snap.exists() ? (snap.data() as UserProfile) : null;
  }
}