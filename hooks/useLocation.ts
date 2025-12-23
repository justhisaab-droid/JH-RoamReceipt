
import { useState } from 'react';
import { LocationService } from '../services/LocationService';

export const useLocation = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);

  const getPosition = (options: PositionOptions): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  const detect = async (onDetected: (address: string) => void) => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    setIsDetecting(true);
    setError(null);

    try {
      // Stage 1: High Accuracy
      let pos: GeolocationPosition;
      try {
        pos = await getPosition({ enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 });
      } catch (e) {
        // Stage 2: Fallback to standard
        pos = await getPosition({ enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 });
      }

      const { latitude, longitude } = pos.coords;
      setCoords({ lat: latitude, lng: longitude });
      
      const address = await LocationService.reverseGeocode(latitude, longitude);
      onDetected(address);
    } catch (e: any) {
      setError("Could not detect location. Please type manually.");
    } finally {
      setIsDetecting(false);
    }
  };

  return { detect, isDetecting, error, setError, coords };
};
