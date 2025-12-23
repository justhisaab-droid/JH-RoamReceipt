import { Expense } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { db } from "./FirestoreService";
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface CategoryItem {
  name: string;
  icon: string;
  isCustom?: boolean;
}

export interface ExtractedReceipt {
  amount?: number;
  vendorName?: string;
  category?: string;
  notes?: string;
}

export class ExpenseService {
  static DEFAULT_CATEGORIES: CategoryItem[] = [
    { name: 'Fuel', icon: '⛽' },
    { name: 'Food', icon: '🍔' },
    { name: 'Refreshments', icon: '☕' },
    { name: 'Shopping', icon: '🛍️' },
    { name: 'Toll', icon: '🛣️' },
    { name: 'Parking', icon: '🅿️' },
    { name: 'Accommodation', icon: '🏨' },
    { name: 'Other', icon: '❓' },
  ];

  static async getAllCategories(userId: string): Promise<CategoryItem[]> {
    const localKey = `categories_${userId}`;
    const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
    
    if (userId.startsWith('mock_')) return [...this.DEFAULT_CATEGORIES, ...localData];

    try {
      const metadataRef = doc(db, 'metadata', `${userId}_categories`);
      const snap = await getDoc(metadataRef);
      const custom = snap.exists() ? (snap.data() as { list: CategoryItem[] })?.list || [] : [];
      return [...this.DEFAULT_CATEGORIES, ...custom];
    } catch (e) {
      console.warn("Firestore getAllCategories failed", e);
      return [...this.DEFAULT_CATEGORIES, ...localData];
    }
  }

  static async addCustomCategory(userId: string, name: string): Promise<CategoryItem> {
    const categories = await this.getAllCategories(userId);
    const normalizedName = name.trim();
    const existing = categories.find(c => c.name.toLowerCase() === normalizedName.toLowerCase());
    if (existing) return existing;

    const newCat: CategoryItem = { name: normalizedName, icon: '✨', isCustom: true };
    
    // Save locally
    const localKey = `categories_${userId}`;
    const localCustom = JSON.parse(localStorage.getItem(localKey) || '[]');
    localCustom.push(newCat);
    localStorage.setItem(localKey, JSON.stringify(localCustom));

    if (!userId.startsWith('mock_')) {
      try {
        const metadataRef = doc(db, 'metadata', `${userId}_categories`);
        await setDoc(metadataRef, { list: localCustom });
      } catch (e) {
        console.warn("Firestore addCustomCategory failed", e);
      }
    }
    return newCat;
  }

  /**
   * Extract receipt details using Gemini 3 Flash.
   */
  static async extractReceiptDetails(base64Image: string, mimeType: string): Promise<ExtractedReceipt> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: mimeType } },
            { text: "Extract receipt details. Suggest category from: Fuel, Food, Refreshments, Shopping, Toll, Parking, Accommodation." },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER },
              vendorName: { type: Type.STRING },
              category: { type: Type.STRING },
              notes: { type: Type.STRING },
            },
            required: ["amount"]
          },
        },
      });
      const text = response.text;
      return JSON.parse(text || "{}");
    } catch (error) {
      console.error("Receipt extraction failed:", error);
      throw error;
    }
  }

  static createExpenseRecord(params: {
    category: string;
    amount: number;
    location: string;
    vendorName?: string;
    notes?: string;
    receiptUrl?: string;
    coords?: { lat: number, lng: number };
    distanceFromPrevious?: number;
  }): Expense {
    return {
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      ...params,
    } as Expense;
  }

  static getCategoryIcon(categoryName: string, allCategories: CategoryItem[]): string {
    const found = allCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    return found ? found.icon : '💰';
  }
}