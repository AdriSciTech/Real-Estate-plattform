// lib/types/map.ts
// ========================================
import { Property } from './property';

// Map-related types
export interface PropertyMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  property: Property;
}

export interface PropertyCluster {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  properties: Property[];
  count: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapViewState {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  bounds?: MapBounds;
}

// Constants
export const DEFAULT_MAP_CENTER = { lat: 40.4168, lng: -3.7038 }; // Madrid
export const DEFAULT_MAP_ZOOM = 12;