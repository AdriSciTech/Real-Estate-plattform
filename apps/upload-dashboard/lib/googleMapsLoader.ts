// my-app\lib\googleMapsLoader.ts

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

let isLoading = false;
let isLoaded = false;
const callbacks: (() => void)[] = [];

export const loadGoogleMaps = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (window.google && window.google.maps) {
      isLoaded = true;
      resolve();
      return;
    }

    // Add callback to queue
    callbacks.push(() => {
      resolve();
    });

    // If already loading, just wait for it
    if (isLoading) {
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      isLoading = true;
      existingScript.addEventListener('load', () => {
        isLoaded = true;
        isLoading = false;
        callbacks.forEach(callback => callback());
        callbacks.length = 0;
      });
      existingScript.addEventListener('error', () => {
        isLoading = false;
        reject(new Error('Failed to load Google Maps'));
      });
      return;
    }

    // Start loading
    isLoading = true;

    const script = document.createElement('script');
    // Include both Maps JavaScript API and Geocoding API libraries
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      callbacks.forEach(callback => callback());
      callbacks.length = 0;
    };

    script.onerror = () => {
      isLoading = false;
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });
};

export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded && window.google && window.google.maps;
};

// Geocoding utility functions
export const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
  if (!window.google || !window.google.maps) {
    throw new Error('Google Maps not loaded');
  }

  return new Promise((resolve, reject) => {
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ address }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng()
        });
      } else if (status === 'ZERO_RESULTS') {
        resolve(null);
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  if (!window.google || !window.google.maps) {
    throw new Error('Google Maps not loaded');
  }

  return new Promise((resolve, reject) => {
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };
    
    geocoder.geocode({ location: latlng }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        resolve(results[0].formatted_address);
      } else if (status === 'ZERO_RESULTS') {
        resolve(null);
      } else {
        reject(new Error(`Reverse geocoding failed: ${status}`));
      }
    });
  });
};