// app/map/utils/MapClustering.ts

import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { MapMarkerManager, MarkerWithInfoWindow } from './MapMarkers';

export interface ClusteringOptions {
  maxZoom?: number;
  minimumClusterSize?: number;
  imagePath?: string;
  gridSize?: number;
  averageCenter?: boolean;
  zoomOnClick?: boolean;
}

export class MapClusteringManager {
  private markerClusterer: MarkerClusterer | null = null;
  private map: google.maps.Map;
  private markerManager: MapMarkerManager;
  private enabled: boolean = true;

  constructor(map: google.maps.Map, markerManager: MapMarkerManager) {
    this.map = map;
    this.markerManager = markerManager;
  }

  /**
   * Initialize or update marker clustering
   */
  initializeClustering(options?: ClusteringOptions): void {
    // Clear existing clusterer if any
    this.clearClustering();

    if (!this.enabled) {
      return;
    }

    const markers = this.markerManager.getMarkers();
    
    if (markers.length === 0) {
      return;
    }

    // Create new marker clusterer
    this.markerClusterer = new MarkerClusterer({
      map: this.map,
      markers: markers,
      ...this.getDefaultOptions(),
      ...options
    });
  }

  /**
   * Get default clustering options
   */
  private getDefaultOptions(): any {
    return {
      maxZoom: 14,
      minimumClusterSize: 3,
      gridSize: 60,
      averageCenter: true,
      zoomOnClick: true,
      renderer: {
        render: ({ count, position }: any) => {
          // Create custom cluster marker
          return new google.maps.Marker({
            position,
            icon: this.getClusterIcon(count),
            label: {
              text: String(count),
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            },
            zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
          });
        }
      }
    };
  }

  /**
   * Get cluster icon based on size
   */
  private getClusterIcon(count: number): google.maps.Symbol | string {
    let scale = 20;
    let color = '#2563eb';
    
    if (count < 10) {
      scale = 20;
      color = '#2563eb'; // blue
    } else if (count < 50) {
      scale = 25;
      color = '#7c3aed'; // purple
    } else if (count < 100) {
      scale = 30;
      color = '#dc2626'; // red
    } else {
      scale = 35;
      color = '#ea580c'; // orange
    }

    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.9,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: scale,
    };
  }

  /**
   * Clear clustering
   */
  clearClustering(): void {
    if (this.markerClusterer) {
      this.markerClusterer.clearMarkers();
      this.markerClusterer = null;
    }
  }

  /**
   * Enable or disable clustering
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    
    if (enabled) {
      this.initializeClustering();
    } else {
      this.clearClustering();
    }
  }

  /**
   * Check if clustering is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Add a single marker to existing cluster
   */
  addMarker(marker: MarkerWithInfoWindow): void {
    if (this.markerClusterer && this.enabled) {
      this.markerClusterer.addMarker(marker);
    }
  }

  /**
   * Remove a single marker from cluster
   */
  removeMarker(marker: MarkerWithInfoWindow): void {
    if (this.markerClusterer && this.enabled) {
      this.markerClusterer.removeMarker(marker);
    }
  }

  /**
   * Refresh clusters (useful after zoom changes)
   */
  refresh(): void {
    if (this.markerClusterer && this.enabled) {
      this.markerClusterer.render();
    }
  }

  /**
   * Get the current clusterer instance
   */
  getClusterer(): MarkerClusterer | null {
    return this.markerClusterer;
  }

  /**
   * Set custom clustering options
   */
  setOptions(options: ClusteringOptions): void {
    this.initializeClustering(options);
  }

  /**
   * Get cluster containing a specific marker
   */
  getClusterForMarker(marker: MarkerWithInfoWindow): any | null {
    if (!this.markerClusterer) {
      return null;
    }

    // This method would need to be implemented based on the specific
    // markerclusterer library version being used
    return null;
  }
}
