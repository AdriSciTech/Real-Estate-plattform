// lib/googleMapsLoader.ts

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

let isLoaded = false;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

export const loadGoogleMaps = (apiKey: string): Promise<void> => {
  // Return existing promise if already loading
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Return resolved promise if already loaded
  if (isLoaded && window.google) {
    return Promise.resolve();
  }

  isLoading = true;

  loadPromise = new Promise((resolve, reject) => {
    try {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        isLoaded = true;
        isLoading = false;
        resolve();
        return;
      }

      // Create callback function
      window.initGoogleMaps = () => {
        isLoaded = true;
        isLoading = false;
        resolve();
      };

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;

      // Handle script load errors
      script.onerror = () => {
        isLoading = false;
        reject(new Error('Failed to load Google Maps script'));
      };

      // Add script to document
      document.head.appendChild(script);

      // Set timeout for loading
      setTimeout(() => {
        if (!isLoaded) {
          isLoading = false;
          reject(new Error('Google Maps loading timeout'));
        }
      }, 10000); // 10 second timeout

    } catch (error) {
      isLoading = false;
      reject(error);
    }
  });

  return loadPromise;
};

export interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress?: string;
}

export const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
  try {
    // Ensure Google Maps is loaded
    if (!window.google || !window.google.maps) {
      throw new Error('Google Maps not loaded');
    }

    const geocoder = new window.google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results: any[], status: string) => {
        if (status === 'OK' && results && results.length > 0) {
          const result = results[0];
          const location = result.geometry.location;
          
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formattedAddress: result.formatted_address
          });
        } else if (status === 'ZERO_RESULTS') {
          console.warn(`No geocoding results found for address: ${address}`);
          resolve(null);
        } else if (status === 'OVER_QUERY_LIMIT') {
          console.warn('Geocoding query limit exceeded');
          reject(new Error('Geocoding query limit exceeded'));
        } else {
          console.warn(`Geocoding failed for address: ${address}, status: ${status}`);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  try {
    // Ensure Google Maps is loaded
    if (!window.google || !window.google.maps) {
      throw new Error('Google Maps not loaded');
    }

    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latlng }, (results: any[], status: string) => {
        if (status === 'OK' && results && results.length > 0) {
          resolve(results[0].formatted_address);
        } else {
          console.warn(`Reverse geocoding failed for coordinates: ${lat}, ${lng}, status: ${status}`);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error reverse geocoding coordinates:', error);
    return null;
  }
};

// Utility function to calculate distance between two points
export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Utility function to format distance for display
export const formatDistance = (distanceInMeters: number): string => {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)}m`;
  } else {
    return `${(distanceInMeters / 1000).toFixed(1)}km`;
  }
};

// Check if Google Maps API key is configured
export const isGoogleMapsConfigured = (): boolean => {
  return !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
};

// Get Google Maps API key
export const getGoogleMapsApiKey = (): string | null => {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || null;
};