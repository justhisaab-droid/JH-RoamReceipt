
// Use correct import as per guidelines
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Coords } from "../types";

export interface PlaceResult {
  name: string;
  coords: Coords;
}

export class LocationService {
  private static async withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const isOverloaded = error?.message?.includes('503') || error?.message?.includes('overloaded') || error?.status === 'UNAVAILABLE';
      if (retries > 0 && isOverloaded) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  // Maps grounding is only supported in Gemini 2.5 series models.
  // Updated model to 'gemini-2.5-flash' as per guideline examples for Maps grounding
  static async reverseGeocode(lat: number, lng: number): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await this.withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Identify the specific name of the landmark, area, or address at these coordinates in India: ${lat}, ${lng}. Return ONLY the name.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } }
      },
    }));
    // Correctly using .text property instead of method
    return response.text?.trim() || `Location near (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
  }

  // Maps grounding is only supported in Gemini 2.5 series models.
  static async searchPlaces(query: string): Promise<PlaceResult[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await this.withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Search for real location names or landmarks in India matching "${query}". Provide a list of 5 suggestions. 
      For each suggestion, return exactly in this format: "Name | Latitude | Longitude". 
      Example: "Gateway of India | 18.9220 | 72.8347"`,
      config: { tools: [{ googleMaps: {} }] },
    }));

    // Correctly using .text property instead of method
    const text = response.text || "";
    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => l.includes('|'));
    
    return lines.map(line => {
      const [name, lat, lng] = line.split('|').map(s => s.trim());
      return {
        name,
        coords: { lat: parseFloat(lat), lng: parseFloat(lng) }
      };
    }).filter(p => !isNaN(p.coords.lat) && !isNaN(p.coords.lng));
  }

  // Maps grounding is only supported in Gemini 2.5 series models.
  static async findNearbyVendors(category: string, lat: number, lng: number, query: string = ''): Promise<PlaceResult[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = query 
      ? `Find businesses named "${query}" near me that provide ${category} services in India.`
      : `List 5 popular ${category} vendors or businesses near my current location in India.`;

    const finalPrompt = `${prompt} 
    For each result, return exactly in this format: "Name | Latitude | Longitude". 
    Example: "Shell Petrol Pump | 12.9716 | 77.5946"`;

    const response = await this.withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: finalPrompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } }
      },
    }));

    // Correctly using .text property instead of method
    const text = response.text || "";
    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => l.includes('|'));

    return lines.map(line => {
      const [name, lat, lng] = line.split('|').map(s => s.trim());
      return {
        name,
        coords: { lat: parseFloat(lat), lng: parseFloat(lng) }
      };
    }).filter(p => !isNaN(p.coords.lat) && !isNaN(p.coords.lng));
  }

  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
