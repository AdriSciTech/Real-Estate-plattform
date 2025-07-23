//my-app\components\AddressGeocoder.tsx

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { loadGoogleMaps, geocodeAddress } from '@/lib/googleMapsLoader';

interface AddressGeocoderProps {
  onLocationSelect: (location: {
    address: string;
    lat: number;
    lng: number;
    formatted_address?: string;
  }) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
  disabled?: boolean;
}

export default function AddressGeocoder({
  onLocationSelect,
  placeholder = "Enter property address...",
  initialValue = "",
  className = "",
  disabled = false
}: AddressGeocoderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize the location select callback to prevent useEffect re-runs
  const stableOnLocationSelect = useCallback(onLocationSelect, []);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          setError('Google Maps API key not configured');
          return;
        }

        await loadGoogleMaps(apiKey);
        
        if (!inputRef.current || autocompleteRef.current) return; // Prevent re-initialization

        // Create autocomplete instance
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' }, // Adjust as needed
          fields: ['formatted_address', 'geometry', 'address_components']
        });

        autocompleteRef.current = autocomplete;

        // Handle place selection
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          
          if (!place.geometry) {
            setError('Unable to find location for this address');
            return;
          }

          // Get the current input value at the time of selection
          const currentInputValue = inputRef.current?.value || place.formatted_address || '';

          const location = {
            address: currentInputValue,
            formatted_address: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };

          stableOnLocationSelect(location);
          setError(null);
        });

        setIsLoaded(true);
      } catch (err) {
        console.error('Error initializing autocomplete:', err);
        setError('Failed to load address autocomplete');
      }
    };

    if (!disabled && !autocompleteRef.current) {
      initAutocomplete();
    }
  }, [disabled, stableOnLocationSelect]); // Removed inputValue and onLocationSelect

  // Update input value when initialValue changes
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  // Handle manual geocoding when user types and presses Enter
  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim() && !isGeocoding) {
      e.preventDefault();
      await handleManualGeocode();
    }
  };

  const handleManualGeocode = async () => {
    if (!inputValue.trim()) return;

    setIsGeocoding(true);
    setError(null);

    try {
      const result = await geocodeAddress(inputValue.trim());
      
      if (result) {
        const location = {
          address: inputValue.trim(),
          lat: result.lat,
          lng: result.lng
        };
        onLocationSelect(location);
      } else {
        setError('Address not found');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Unable to geocode address');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setError(null);
  };

  // Cleanup autocomplete on unmount
  useEffect(() => {
    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || isGeocoding}
          className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
        />
        
        {isGeocoding && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {!isLoaded && !disabled && !error && (
        <div className="text-gray-500 text-sm flex items-center space-x-1">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
          <span>Loading address autocomplete...</span>
        </div>
      )}

      <div className="text-gray-500 text-xs">
        Start typing an address or press Enter to geocode manually
      </div>
    </div>
  );
}