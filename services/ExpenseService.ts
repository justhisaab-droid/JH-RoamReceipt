
import { Expense } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { db } from "./FirestoreService";
// Fixed: Switched from 'firebase/firestore/lite' to 'firebase/firestore' to resolve missing export errors
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
    const metadataRef = doc(db, 'metadata', `${userId}_categories`);
    const snap = await getDoc(metadataRef);
    const custom = snap.exists() ? (snap.data() as { list: CategoryItem[] })?.list || [] : [];
    return [...this.DEFAULT_CATEGORIES, ...custom];
  }

  static async addCustomCategory(userId: string, name: string): Promise<CategoryItem> {
    const categories = await this.getAllCategories(userId);
    const normalizedName = name.trim();
    const existing = categories.find(c => c.name.toLowerCase() === normalizedName.toLowerCase());
    if (existing) return existing;

    const newCat: CategoryItem = { name: normalizedName, icon: '✨', isCustom: true };
    const metadataRef = doc(db, 'metadata', `${userId}_categories`);
    const snap = await getDoc(metadataRef);
    const customOnly = snap.exists() ? (snap.data() as { list: CategoryItem[] })?.list || [] : [];
    customOnly.push(newCat);
    await setDoc(metadataRef, { list: customOnly });
    return newCat;
  }

  /**
   * Extract receipt details using Gemini 3 Flash.
   */
  static async extractReceiptDetails(base64Image: string, mimeType: string): Promise<ExtractedReceipt> {
    // Correct initialization with named parameter as per guidelines
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
      // Correct extraction of text from GenerateContentResponse
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
