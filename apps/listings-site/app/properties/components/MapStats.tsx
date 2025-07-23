// app/properties/components/MapStats.tsx
import { Property } from '@rental/types';

interface GeocodedProperty extends Property {
  lat: number;
  lng: number;
}

interface MapStatsProps {
  mapLoaded: boolean;
  geocodingProgress: {
    current: number;
    total: number;
    isProcessing: boolean;
  };
  geocodedProperties: GeocodedProperty[];
  currentZoom: number;
}

export default function MapStats({
  mapLoaded,
  geocodingProgress,
  geocodedProperties,
  currentZoom
}: MapStatsProps) {
  if (!mapLoaded || geocodingProgress.isProcessing || geocodedProperties.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-sm">
      <div className="flex items-center space-x-2 text-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-gray-700 font-medium">
          {geocodedProperties.length} {geocodedProperties.length === 1 ? 'property' : 'properties'}
        </span>
      </div>
      
      {currentZoom < 14 && (
        <div className="flex items-center space-x-2 text-xs mt-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-gray-500">Zoom in to separate clusters</span>
        </div>
      )}
      
      <div className="text-xs text-gray-400 mt-1">
        Zoom: {currentZoom}
      </div>
    </div>
  );
}
