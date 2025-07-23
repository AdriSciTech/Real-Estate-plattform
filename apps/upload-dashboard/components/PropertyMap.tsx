//my-app\components\PropertyMap.tsx

'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Property } from '@/lib/types';
import { loadGoogleMaps, geocodeAddress } from '@/lib/googleMapsLoader';
import { createClient } from '@/lib/supabase';

interface PropertyMapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onPropertySelect: (property: Property) => void;
}

interface GeocodedProperty extends Property {
  lat: number;
  lng: number;
}

interface PropertyCluster {
  lat: number;
  lng: number;
  properties: GeocodedProperty[];
  isCluster: boolean;
}

export default function PropertyMap({ properties, selectedProperty, onPropertySelect }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [geocodedProperties, setGeocodedProperties] = useState<GeocodedProperty[]>([]);
  const [geocodingProgress, setGeocodingProgress] = useState({ current: 0, total: 0, isProcessing: false });
  const [currentZoom, setCurrentZoom] = useState(10);
  const [isZooming, setIsZooming] = useState(false);
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create supabase client once using useMemo
  const supabase = useMemo(() => createClient(), []);

  // Function to calculate distance between two points in meters
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Function to cluster properties based on zoom level and distance
  const clusterProperties = (properties: GeocodedProperty[], zoom: number): PropertyCluster[] => {
    if (properties.length === 0) return [];

    // Adjust clustering distance based on zoom level
    const getClusterDistance = (zoom: number) => {
      if (zoom >= 16) return 20; // Very close clustering at high zoom
      if (zoom >= 14) return 50; // Close clustering
      if (zoom >= 12) return 100; // Medium clustering
      if (zoom >= 10) return 200; // Wide clustering
      return 500; // Very wide clustering at low zoom
    };

    const clusterDistance = getClusterDistance(zoom);
    const clusters: PropertyCluster[] = [];
    const processed = new Set<string>();

    properties.forEach(property => {
      if (processed.has(property.id)) return;

      const cluster: PropertyCluster = {
        lat: property.lat,
        lng: property.lng,
        properties: [property],
        isCluster: false
      };

      // Find nearby properties
      properties.forEach(otherProperty => {
        if (processed.has(otherProperty.id) || property.id === otherProperty.id) return;

        const distance = calculateDistance(
          property.lat, property.lng,
          otherProperty.lat, otherProperty.lng
        );

        if (distance <= clusterDistance) {
          cluster.properties.push(otherProperty);
          processed.add(otherProperty.id);
        }
      });

      processed.add(property.id);

      // Mark as cluster if multiple properties
      if (cluster.properties.length > 1) {
        cluster.isCluster = true;
        // Calculate center point of cluster
        const sumLat = cluster.properties.reduce((sum, p) => sum + p.lat, 0);
        const sumLng = cluster.properties.reduce((sum, p) => sum + p.lng, 0);
        cluster.lat = sumLat / cluster.properties.length;
        cluster.lng = sumLng / cluster.properties.length;
      }

      clusters.push(cluster);
    });

    return clusters;
  };

  // Geocode properties that don't have coordinates
  useEffect(() => {
    const geocodeProperties = async () => {
      const propertiesNeedingGeocode = properties.filter(p => 
        p.address && (!p.lat || !p.lng)
      );

      if (propertiesNeedingGeocode.length === 0) {
        // All properties already have coordinates
        const validProperties = properties.filter(p => p.lat && p.lng) as GeocodedProperty[];
        setGeocodedProperties(validProperties);
        return;
      }

      setGeocodingProgress({ 
        current: 0, 
        total: propertiesNeedingGeocode.length, 
        isProcessing: true 
      });

      const geocoded: GeocodedProperty[] = [];
      
      // Add properties that already have coordinates
      const existingGeocodedProperties = properties.filter(p => 
        p.lat && p.lng
      ) as GeocodedProperty[];
      geocoded.push(...existingGeocodedProperties);

      // Geocode properties without coordinates
      for (let i = 0; i < propertiesNeedingGeocode.length; i++) {
        const property = propertiesNeedingGeocode[i];
        
        try {
          const coords = await geocodeAddress(property.address);
          
          if (coords) {
            const geocodedProperty: GeocodedProperty = {
              ...property,
              lat: coords.lat,
              lng: coords.lng
            };

            geocoded.push(geocodedProperty);

            // Update the database with the new coordinates
            if (supabase) {
              await supabase
                .from('properties')
                .update({ 
                  lat: coords.lat, 
                  lng: coords.lng 
                })
                .eq('id', property.id);
            }
          }
        } catch (error) {
          console.warn(`Failed to geocode property: ${property.title}`, error);
        }

        setGeocodingProgress({ 
          current: i + 1, 
          total: propertiesNeedingGeocode.length, 
          isProcessing: true 
        });

        // Add delay to respect API rate limits
        if (i < propertiesNeedingGeocode.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      setGeocodedProperties(geocoded);
      setGeocodingProgress({ current: 0, total: 0, isProcessing: false });
    };

    if (mapLoaded && properties.length > 0) {
      geocodeProperties();
    }
  }, [properties, mapLoaded]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setMapError('Google Maps API key not configured');
      return;
    }

    const initMap = async () => {
      try {
        await loadGoogleMaps(apiKey);
        
        const defaultCenter = { lat: 40.7128, lng: -74.0060 };
        
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 10,
          center: defaultCenter,
          // Enable all interaction controls
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
          // Ensure scroll wheel zoom is enabled
          scrollwheel: true,
          // Enable gesture handling for touch devices
          gestureHandling: 'auto',
          // Disable zoom on double click to prevent conflicts
          disableDoubleClickZoom: false,
          // Enable keyboard shortcuts
          keyboardShortcuts: true,
          styles: [
            {
              "elementType": "geometry",
              "stylers": [{"color": "#212121"}]
            },
            {
              "elementType": "labels.icon",
              "stylers": [{"visibility": "off"}]
            },
            {
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#757575"}]
            },
            {
              "elementType": "labels.text.stroke",
              "stylers": [{"color": "#212121"}]
            },
            {
              "featureType": "administrative",
              "elementType": "geometry",
              "stylers": [{"color": "#757575"}]
            },
            {
              "featureType": "administrative.country",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#9ca5b3"}]
            },
            {
              "featureType": "administrative.land_parcel",
              "stylers": [{"visibility": "off"}]
            },
            {
              "featureType": "administrative.locality",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#bdbdbd"}]
            },
            {
              "featureType": "poi",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#757575"}]
            },
            {
              "featureType": "poi.park",
              "elementType": "geometry",
              "stylers": [{"color": "#181818"}]
            },
            {
              "featureType": "poi.park",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#616161"}]
            },
            {
              "featureType": "poi.park",
              "elementType": "labels.text.stroke",
              "stylers": [{"color": "#1b1b1b"}]
            },
            {
              "featureType": "road",
              "elementType": "geometry.fill",
              "stylers": [{"color": "#2c2c2c"}]
            },
            {
              "featureType": "road",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#8a8a8a"}]
            },
            {
              "featureType": "road.arterial",
              "elementType": "geometry",
              "stylers": [{"color": "#373737"}]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry",
              "stylers": [{"color": "#3c3c3c"}]
            },
            {
              "featureType": "road.highway.controlled_access",
              "elementType": "geometry",
              "stylers": [{"color": "#4e4e4e"}]
            },
            {
              "featureType": "road.local",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#616161"}]
            },
            {
              "featureType": "transit",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#757575"}]
            },
            {
              "featureType": "water",
              "elementType": "geometry",
              "stylers": [{"color": "#000000"}]
            },
            {
              "featureType": "water",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#3d3d3d"}]
            }
          ]
        });

        // Listen for zoom changes with debouncing to prevent flicker
        map.addListener('zoom_changed', () => {
          setIsZooming(true);
          
          // Clear existing timeout
          if (zoomTimeoutRef.current) {
            clearTimeout(zoomTimeoutRef.current);
          }
          
          // Debounce zoom updates to prevent flicker
          zoomTimeoutRef.current = setTimeout(() => {
            setCurrentZoom(map.getZoom());
            setIsZooming(false);
          }, 150); // 150ms debounce
        });

        // Ensure proper event handling for touch devices
        map.addListener('tilesloaded', () => {
          // Force enable scroll wheel zoom after tiles load
          map.setOptions({ scrollwheel: true });
        });

        // Add additional event listeners to ensure zoom functionality
        map.addListener('dragend', () => {
          // Re-enable zoom after drag operations
          map.setOptions({ 
            scrollwheel: true,
            gestureHandling: 'auto' 
          });
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        setMapError('Failed to initialize Google Maps. Please check your API configuration.');
      }
    };

    initMap();
  }, []);

  // Create enhanced info window content for single property
  const createPropertyInfoWindowContent = (property: GeocodedProperty) => {
    const bedBathText = `${property.beds || 0} Bed ${property.baths || 0} Bath`;
    const acresText = '0.0 Acres';
    
    return `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        width: 350px;
        max-width: 90vw;
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        color: #333;
        margin: 0;
        padding: 0;
      ">
        ${property.image_urls && property.image_urls.length > 0 ? `
          <div style="
            width: 100%;
            height: 200px;
            background-image: url('${property.image_urls[0]}');
            background-size: cover;
            background-position: center;
            position: relative;
          ">
            <div style="
              position: absolute;
              top: 12px;
              left: 12px;
              background: rgba(0,0,0,0.7);
              color: white;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
            ">
              ACTIVE
            </div>
          </div>
        ` : `
          <div style="
            width: 100%;
            height: 120px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          ">
            <div style="
              color: white;
              font-size: 18px;
              font-weight: 600;
            ">
              📷 No Photo
            </div>
            <div style="
              position: absolute;
              top: 12px;
              left: 12px;
              background: rgba(0,0,0,0.7);
              color: white;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
            ">
              ACTIVE
            </div>
          </div>
        `}
        
        <div style="padding: 16px;">
          <div style="
            font-size: 24px;
            font-weight: 700;
            color: #2d5a27;
            margin-bottom: 8px;
          ">
            $${property.price.toLocaleString()}
          </div>
          
          <div style="
            font-size: 14px;
            color: #666;
            margin-bottom: 12px;
            line-height: 1.4;
          ">
            ${bedBathText}${acresText ? ` ${acresText}` : ''}
          </div>
          
          <div style="
            font-size: 14px;
            color: #333;
            margin-bottom: 8px;
            font-weight: 500;
          ">
            ${property.address}
          </div>
          
          ${property.description ? `
            <div style="
              font-size: 13px;
              color: #666;
              margin-bottom: 12px;
              line-height: 1.4;
              max-height: 40px;
              overflow: hidden;
            ">
              Listing Office: ${property.description.length > 80 ? property.description.substring(0, 80) + '...' : property.description}
            </div>
          ` : `
            <div style="
              font-size: 13px;
              color: #666;
              margin-bottom: 12px;
            ">
              Listing Office: Property Management Co.
            </div>
          `}
          
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 12px;
            border-top: 1px solid #eee;
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <div style="
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: ${
                  property.type.toLowerCase() === 'house' ? '#3B82F6' :
                  property.type.toLowerCase() === 'apartment' ? '#10B981' :
                  property.type.toLowerCase() === 'condo' ? '#8B5CF6' :
                  property.type.toLowerCase() === 'townhouse' ? '#F59E0B' :
                  property.type.toLowerCase() === 'villa' ? '#EF4444' :
                  '#6B7280'
                };
              "></div>
              <span style="
                font-size: 12px;
                color: #666;
                text-transform: capitalize;
                font-weight: 500;
              ">
                ${property.type}
              </span>
            </div>
            
            <button onclick="window.selectProperty('${property.id}')" style="
              background: #2563eb;
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
              transition: background 0.2s;
            " onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">
              View Details
            </button>
          </div>
        </div>
      </div>
    `;
  };

  // Create cluster info window content
  const createClusterInfoWindowContent = (cluster: PropertyCluster) => {
    const totalValue = cluster.properties.reduce((sum, p) => sum + p.price, 0);
    const avgPrice = totalValue / cluster.properties.length;
    const priceRange = {
      min: Math.min(...cluster.properties.map(p => p.price)),
      max: Math.max(...cluster.properties.map(p => p.price))
    };

    return `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        width: 400px;
        max-width: 90vw;
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        color: #333;
        margin: 0;
        padding: 0;
      ">
        <div style="
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 16px;
          text-align: center;
        ">
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">
            ${cluster.properties.length} Properties at this Location
          </div>
          <div style="font-size: 14px; opacity: 0.9;">
            Price Range: $${priceRange.min.toLocaleString()} - $${priceRange.max.toLocaleString()}
          </div>
        </div>
        
        <div style="padding: 16px; max-height: 300px; overflow-y: auto;">
          ${cluster.properties.map((property, index) => `
            <div style="
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 12px;
              margin-bottom: ${index < cluster.properties.length - 1 ? '12px' : '0'};
              cursor: pointer;
              transition: all 0.2s;
              background: white;
            " onclick="window.selectProperty('${property.id}')" 
               onmouseover="this.style.background='#f9fafb'; this.style.borderColor='#3b82f6'"
               onmouseout="this.style.background='white'; this.style.borderColor='#e5e7eb'">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                <div style="flex: 1;">
                  <div style="font-weight: 600; font-size: 16px; color: #2d5a27; margin-bottom: 4px;">
                    $${property.price.toLocaleString()}
                  </div>
                  <div style="font-size: 14px; color: #333; margin-bottom: 4px; font-weight: 500;">
                    ${property.title}
                  </div>
                  <div style="font-size: 12px; color: #666; margin-bottom: 6px;">
                    ${property.beds || 0} bed • ${property.baths || 0} bath • ${property.type}
                  </div>
                  <div style="font-size: 11px; color: #888;">
                    ${property.address}
                  </div>
                </div>
                ${property.image_urls && property.image_urls.length > 0 ? `
                  <img src="${property.image_urls[0]}" style="
                    width: 60px;
                    height: 45px;
                    object-fit: cover;
                    border-radius: 6px;
                    flex-shrink: 0;
                  " alt="${property.title}">
                ` : `
                  <div style="
                    width: 60px;
                    height: 45px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    flex-shrink: 0;
                  ">📷</div>
                `}
              </div>
            </div>
          `).join('')}
        </div>
        
        <div style="
          padding: 16px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          text-align: center;
        ">
          <div style="font-size: 13px; color: #666; margin-bottom: 8px;">
            Average Price: $${avgPrice.toLocaleString()}
          </div>
          <button onclick="window.zoomToCluster(${cluster.lat}, ${cluster.lng})" style="
            background: #4f46e5;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          " onmouseover="this.style.background='#4338ca'" onmouseout="this.style.background='#4f46e5'">
            Zoom In to Separate
          </button>
        </div>
      </div>
    `;
  };

  // Update markers when geocoded properties or zoom changes (with debouncing)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || geocodedProperties.length === 0 || isZooming) return;

    // Add global functions
    (window as any).selectProperty = (propertyId: string) => {
      const property = geocodedProperties.find(p => p.id === propertyId);
      if (property) {
        onPropertySelect(property);
        // Close all info windows
        markersRef.current.forEach(marker => {
          if (marker.infoWindow) {
            marker.infoWindow.close();
          }
        });
      }
    };

    (window as any).zoomToCluster = (lat: number, lng: number) => {
      mapInstanceRef.current.setCenter({ lat, lng });
      mapInstanceRef.current.setZoom(Math.min(mapInstanceRef.current.getZoom() + 2, 18));
    };

    // Clear existing markers efficiently
    markersRef.current.forEach(marker => {
      if (marker.infoWindow) {
        marker.infoWindow.close();
      }
      marker.setMap(null);
    });
    markersRef.current = [];

    // Cluster properties based on current zoom
    const clusters = clusterProperties(geocodedProperties, currentZoom);
    const bounds = new window.google.maps.LatLngBounds();
    
    clusters.forEach(cluster => {
      const position = { lat: cluster.lat, lng: cluster.lng };

      let marker;
      let infoWindowContent;

      if (cluster.isCluster) {
        // Create cluster marker
        marker = new window.google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          title: `${cluster.properties.length} properties`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#4f46e5',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
            scale: Math.min(15 + (cluster.properties.length * 2), 25),
          },
          label: {
            text: cluster.properties.length.toString(),
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          },
          zIndex: 1000
        });

        infoWindowContent = createClusterInfoWindowContent(cluster);
      } else {
        // Create single property marker
        const property = cluster.properties[0];
        const getMarkerIcon = (type: string, isSelected: boolean) => {
          const colors = {
            'house': '#3B82F6',
            'apartment': '#10B981',
            'condo': '#8B5CF6',
            'townhouse': '#F59E0B',
            'villa': '#EF4444',
            'default': '#6B7280'
          };
          
          const color = colors[type.toLowerCase() as keyof typeof colors] || colors.default;
          const size = isSelected ? 40 : 30;
          const strokeWidth = isSelected ? 3 : 2;
          
          return {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: strokeWidth,
            scale: size / 24,
            anchor: new window.google.maps.Point(12, 24)
          };
        };

        marker = new window.google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          title: property.title,
          icon: getMarkerIcon(property.type, selectedProperty?.id === property.id)
        });

        infoWindowContent = createPropertyInfoWindowContent(property);
      }

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoWindowContent,
        maxWidth: 450,
        pixelOffset: new window.google.maps.Size(0, -10)
      });

      marker.addListener('click', () => {
        // Close all other info windows
        markersRef.current.forEach(m => {
          if (m.infoWindow) {
            m.infoWindow.close();
          }
        });
        
        // Open this info window
        infoWindow.open(mapInstanceRef.current, marker);
        
        // If it's a single property, select it
        if (!cluster.isCluster) {
          onPropertySelect(cluster.properties[0]);
        }
      });

      marker.infoWindow = infoWindow;
      marker.cluster = cluster;
      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // Fit map to show all markers (only on initial load, not on zoom)
    if (clusters.length > 0 && currentZoom === 10) {
      mapInstanceRef.current.fitBounds(bounds);
      
      const listener = window.google.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', () => {
        if (mapInstanceRef.current.getZoom() > 15) {
          mapInstanceRef.current.setZoom(15);
        }
        // Re-enable scroll wheel zoom after bounds change
        mapInstanceRef.current.setOptions({ 
          scrollwheel: true,
          gestureHandling: 'auto'
        });
        window.google.maps.event.removeListener(listener);
      });
    }

    // Cleanup function
    return () => {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
    };
  }, [geocodedProperties, selectedProperty, mapLoaded, onPropertySelect, currentZoom, isZooming]);

  // Update marker appearance when selected property changes (optimized)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || isZooming) return;

    markersRef.current.forEach(marker => {
      if (marker.cluster && !marker.cluster.isCluster) {
        const property = marker.cluster.properties[0];
        
        const getMarkerIcon = (type: string, isSelected: boolean) => {
          const colors = {
            'house': '#3B82F6',
            'apartment': '#10B981',
            'condo': '#8B5CF6',
            'townhouse': '#F59E0B',
            'villa': '#EF4444',
            'default': '#6B7280'
          };
          
          const color = colors[type.toLowerCase() as keyof typeof colors] || colors.default;
          const size = isSelected ? 40 : 30;
          const strokeWidth = isSelected ? 3 : 2;
          
          return {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: strokeWidth,
            scale: size / 24,
            anchor: new window.google.maps.Point(12, 24)
          };
        };

        marker.setIcon(getMarkerIcon(property.type, selectedProperty?.id === property.id));
      }
    });
  }, [selectedProperty, mapLoaded, isZooming]);

  return (
    <div className="relative h-full w-full">
      <div 
        ref={mapRef} 
        className="h-full w-full rounded-lg" 
        style={{
          // Ensure proper touch handling
          touchAction: 'pan-x pan-y',
          // Prevent any CSS that might interfere with map interactions
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      />
      
      {/* Loading State */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Geocoding Progress */}
      {geocodingProgress.isProcessing && (
        <div className="absolute inset-0 bg-gray-700/90 rounded-lg flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-4xl mb-3">🗺️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Geocoding Properties</h3>
            <p className="text-gray-400 text-sm mb-4">
              Converting addresses to map coordinates...
              <br />
              {geocodingProgress.current} of {geocodingProgress.total} processed
            </p>
            <div className="w-64 bg-gray-600 rounded-full h-2 mx-auto">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(geocodingProgress.current / geocodingProgress.total) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {mapError && (
        <div className="absolute inset-0 bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-4xl mb-3">🗺️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Map Error</h3>
            <p className="text-gray-400 text-sm mb-4">
              {mapError}
              <br />
              <br />Please check:
              <br />• Google Maps API key is configured
              <br />• Maps JavaScript API is enabled in Google Cloud Console
              <br />• Geocoding API is enabled in Google Cloud Console
              <br />• Places API is enabled (if using autocomplete)
              <br />• Billing is set up for your Google Cloud project
              <br />• API key has proper restrictions configured
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
      
      {/* No Properties State */}
      {mapLoaded && !geocodingProgress.isProcessing && geocodedProperties.length === 0 && properties.length > 0 && (
        <div className="absolute inset-0 bg-gray-700/90 rounded-lg flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-4xl mb-3">📍</div>
            <h3 className="text-lg font-semibold text-white mb-2">No Valid Addresses</h3>
            <p className="text-gray-400 text-sm">
              Unable to geocode any property addresses.
              <br />
              Please check that your properties have valid addresses.
            </p>
          </div>
        </div>
      )}

      {/* Empty Properties State */}
      {mapLoaded && !geocodingProgress.isProcessing && properties.length === 0 && (
        <div className="absolute inset-0 bg-gray-700/90 rounded-lg flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-4xl mb-3">🏠</div>
            <h3 className="text-lg font-semibold text-white mb-2">No Properties</h3>
            <p className="text-gray-400 text-sm">
              Add some properties to see them on the map.
            </p>
          </div>
        </div>
      )}
      
      {/* Map Stats */}
      {mapLoaded && !geocodingProgress.isProcessing && geocodedProperties.length > 0 && (
        <div className="absolute top-4 left-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-300">{geocodedProperties.length} properties shown</span>
          </div>
          {currentZoom < 14 && (
            <div className="flex items-center space-x-2 text-xs mt-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-gray-400">Zoom in to separate clusters</span>
            </div>
          )}
        </div>
      )}
      
      {/* Legend */}
      {mapLoaded && !geocodingProgress.isProcessing && geocodedProperties.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 border border-gray-600">
          <div className="flex flex-col space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-300">House</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-300">Apartment</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-gray-300">Condo</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-300">Townhouse</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-300">Villa</span>
            </div>
            {currentZoom < 14 && (
              <div className="border-t border-gray-600 pt-1 mt-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-white"></div>
                  <span className="text-gray-300">Cluster</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}