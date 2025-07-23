'use client';

import { useEffect, useRef, useState } from 'react';
import { Property } from '@rental/types';
import { loadGoogleMaps } from '@rental/google-maps';
import { MapMarkerManager, GeocodedProperty } from '../MapPage/utils/MapMarkers';
import { MapClusteringManager } from '../MapPage/utils/MapClustering';

interface PropertyMapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onPropertySelect: (property: Property) => void;
  enableClustering?: boolean;
  clusteringOptions?: {
    maxZoom?: number;
    minimumClusterSize?: number;
  };
}

export default function PropertyMap({ 
  properties, 
  selectedProperty, 
  onPropertySelect,
  enableClustering = true,
  clusteringOptions
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerManagerRef = useRef<MapMarkerManager | null>(null);
  const clusteringManagerRef = useRef<MapClusteringManager | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Get properties that already have coordinates
  const validProperties = properties.filter(p => p.lat && p.lng) as GeocodedProperty[];

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setMapError('Google Maps API key not configured');
      return;
    }

    const initMap = async () => {
      try {
        // Use the proper loader to avoid duplicate scripts
        await loadGoogleMaps(apiKey);
        
        const map = new google.maps.Map(mapRef.current!, {
          zoom: 12,
          center: { lat: 40.4168, lng: -3.7038 }, // Madrid center
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          // Enable map interaction
          scrollwheel: true,
          disableDoubleClickZoom: false,
          draggable: true,
          keyboardShortcuts: true,
          gestureHandling: 'auto',
        });

        mapInstanceRef.current = map;
        
        // Initialize marker manager
        markerManagerRef.current = new MapMarkerManager(map, onPropertySelect);
        
        // Initialize clustering manager
        clusteringManagerRef.current = new MapClusteringManager(map, markerManagerRef.current);
        
        setMapLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setMapError('Failed to load Google Maps');
      }
    };

    initMap();
  }, [onPropertySelect]);

  // Update markers when properties change
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !markerManagerRef.current || !clusteringManagerRef.current) return;

    // Add global function for PropertyInfoWindow to use
    (window as any).selectProperty = (propertyId: string) => {
      const property = validProperties.find(p => p.id === propertyId);
      if (property) {
        onPropertySelect(property);
        markerManagerRef.current?.closeAllInfoWindows();
      }
    };

    // Clear existing markers
    markerManagerRef.current.clearMarkers();
    clusteringManagerRef.current.clearClustering();

    if (validProperties.length === 0) return;

    // Add markers for valid properties
    const bounds = markerManagerRef.current.addMarkers(validProperties);

    // Initialize clustering if enabled
    if (enableClustering) {
      clusteringManagerRef.current.setEnabled(true);
      clusteringManagerRef.current.initializeClustering(clusteringOptions);
    } else {
      clusteringManagerRef.current.setEnabled(false);
    }

    // Fit map to show all markers
    if (validProperties.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);
      
      // Set max zoom level
      const listener = google.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', () => {
        if (mapInstanceRef.current!.getZoom()! > 16) {
          mapInstanceRef.current!.setZoom(16);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [validProperties, mapLoaded, onPropertySelect, enableClustering, clusteringOptions]);

  // Update selected marker appearance
  useEffect(() => {
    if (!mapLoaded || !markerManagerRef.current) return;

    markerManagerRef.current.updateSelectedMarker(selectedProperty?.id || null);
  }, [selectedProperty, mapLoaded]);

  // Handle clustering toggle
  useEffect(() => {
    if (!clusteringManagerRef.current || !mapLoaded) return;

    clusteringManagerRef.current.setEnabled(enableClustering);
  }, [enableClustering, mapLoaded]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      
      {/* Loading State */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {mapError && (
        <div className="absolute inset-0 bg-white flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-red-600 mb-2">{mapError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload
            </button>
          </div>
        </div>
      )}
      
      {/* Property Count and Controls */}
      {mapLoaded && (
        <div className="absolute top-4 right-4 space-y-2">
          <div className="bg-white rounded shadow-lg px-3 py-2">
            <p className="text-sm font-medium">
              {validProperties.length} properties shown
            </p>
          </div>
          
          {/* Clustering Toggle */}
          {validProperties.length > 5 && (
            <div className="bg-white rounded shadow-lg px-3 py-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableClustering}
                  onChange={(e) => {
                    // This would need to be handled by the parent component
                    // through a prop callback
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Cluster markers</span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* No Properties Message */}
      {mapLoaded && validProperties.length === 0 && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-2">No properties with valid coordinates found</p>
            <p className="text-sm text-gray-500">Properties need lat/lng coordinates to appear on the map</p>
          </div>
        </div>
      )}
    </div>
  );
}
