// app/map/utils/MapMarkers.tsx


import React from 'react';
import { Property } from '@rental/types';
import { renderToString } from 'react-dom/server';
import PropertyInfoWindow from '../PropertyInfoWindow';

export interface GeocodedProperty extends Property {
  lat: number;
  lng: number;
}

export interface MarkerWithInfoWindow extends google.maps.Marker {
  infoWindow?: google.maps.InfoWindow;
  propertyId: string;
}

export class MapMarkerManager {
  private markers: MarkerWithInfoWindow[] = [];
  private map: google.maps.Map;
  private onPropertySelect: (property: Property) => void;

  constructor(map: google.maps.Map, onPropertySelect: (property: Property) => void) {
    this.map = map;
    this.onPropertySelect = onPropertySelect;
  }

  /**
   * Clear all existing markers from the map
   */
  clearMarkers(): void {
    this.markers.forEach(marker => {
      if (marker.infoWindow) {
        marker.infoWindow.close();
      }
      marker.setMap(null);
    });
    this.markers = [];
  }

  /**
   * Add markers for all properties
   */
  addMarkers(properties: GeocodedProperty[]): google.maps.LatLngBounds {
    const bounds = new google.maps.LatLngBounds();

    properties.forEach(property => {
      const marker = this.createMarker(property);
      this.markers.push(marker);
      bounds.extend({ lat: property.lat, lng: property.lng });
    });

    return bounds;
  }

  /**
   * Create a single marker with info window
   */
  private createMarker(property: GeocodedProperty): MarkerWithInfoWindow {
    const marker = new google.maps.Marker({
      position: { lat: property.lat, lng: property.lng },
      map: this.map,
      title: property.title || 'Property',
      icon: this.getDefaultIcon(),
    }) as MarkerWithInfoWindow;

    marker.propertyId = property.id;

    // Create info window content
    const infoWindowContent = renderToString(<PropertyInfoWindow property={property} />);
    
    const infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent,
      maxWidth: 350,
      pixelOffset: new google.maps.Size(0, -10)
    });

    // Add click listener
    marker.addListener('click', () => {
      this.closeAllInfoWindows();
      infoWindow.open(this.map, marker);
      this.onPropertySelect(property);
    });

    marker.infoWindow = infoWindow;
    
    return marker;
  }

  /**
   * Close all info windows
   */
  closeAllInfoWindows(): void {
    this.markers.forEach(marker => {
      if (marker.infoWindow) {
        marker.infoWindow.close();
      }
    });
  }

  /**
   * Update marker appearance based on selection
   */
  updateSelectedMarker(selectedPropertyId: string | null): void {
    this.markers.forEach(marker => {
      if (marker.propertyId === selectedPropertyId) {
        marker.setIcon(this.getSelectedIcon());
      } else {
        marker.setIcon(this.getDefaultIcon());
      }
    });
  }

  /**
   * Get default marker icon
   */
  private getDefaultIcon(): google.maps.Symbol {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#2563eb',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 6,
    };
  }

  /**
   * Get selected marker icon
   */
  private getSelectedIcon(): google.maps.Symbol {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#ef4444',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 8,
    };
  }

  /**
   * Get all markers
   */
  getMarkers(): MarkerWithInfoWindow[] {
    return this.markers;
  }

  /**
   * Find marker by property ID
   */
  findMarkerByPropertyId(propertyId: string): MarkerWithInfoWindow | undefined {
    return this.markers.find(marker => marker.propertyId === propertyId);
  }

  /**
   * Open info window for specific property
   */
  openInfoWindow(propertyId: string): void {
    const marker = this.findMarkerByPropertyId(propertyId);
    if (marker && marker.infoWindow) {
      this.closeAllInfoWindows();
      marker.infoWindow.open(this.map, marker);
    }
  }
}
