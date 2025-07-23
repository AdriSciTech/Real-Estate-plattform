//listings-plattform\app\properties\components\PropertyMap.tsx

'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Property } from '@rental/types';
import { loadGoogleMaps, geocodeAddress } from '@rental/google-maps';
import { createClient } from '@rental/supabase';

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
          const coords = await geocodeAddress(property.address!);
          
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
          console.warn(`Failed to geocode property: ${property.title || 'Unknown'}`, error);
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
  }, [properties, mapLoaded, supabase]);

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
              "stylers": [{"color": "#f5f5f5"}]
            },
            {
              "elementType": "labels.icon",
              "stylers": [{"visibility": "off"}]
            },
            {
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#616161"}]
            },
            {
              "elementType": "labels.text.stroke",
              "stylers": [{"color": "#ffffff"}]
            },
            {
              "featureType": "administrative",
              "elementType": "geometry",
              "stylers": [{"color": "#e0e0e0"}]
            },
            {
              "featureType": "administrative.country",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#9e9e9e"}]
            },
            {
              "featureType": "administrative.land_parcel",
              "stylers": [{"visibility": "off"}]
            },
            {
              "featureType": "administrative.locality",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#757575"}]
            },
            {
              "featureType": "poi",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#757575"}]
            },
            {
              "featureType": "poi.park",
              "elementType": "geometry",
              "stylers": [{"color": "#e8f5e8"}]
            },
            {
              "featureType": "poi.park",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#4caf50"}]
            },
            {
              "featureType": "road",
              "elementType": "geometry.fill",
              "stylers": [{"color": "#ffffff"}]
            },
            {
              "featureType": "road",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#757575"}]
            },
            {
              "featureType": "road.arterial",
              "elementType": "geometry",
              "stylers": [{"color": "#fafafa"}]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry",
              "stylers": [{"color": "#f5f5f5"}]
            },
            {
              "featureType": "road.highway.controlled_access",
              "elementType": "geometry",
              "stylers": [{"color": "#eeeeee"}]
            },
            {
              "featureType": "road.local",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#9e9e9e"}]
            },
            {
              "featureType": "transit",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#757575"}]
            },
            {
              "featureType": "water",
              "elementType": "geometry",
              "stylers": [{"color": "#e3f2fd"}]
            },
            {
              "featureType": "water",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#1976d2"}]
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

  // Helper function to safely format price
  const formatPrice = (price: number | undefined): string => {
    if (!price || price <= 0) {
      return 'Price on Request';
    }
    return `€${price.toLocaleString()}`;
  };

  // Helper function to get property type with fallback
  const getPropertyType = (type: string | undefined): string => {
    return type || 'Property';
  };

  // Create enhanced info window content for single property
  const createPropertyInfoWindowContent = (property: GeocodedProperty) => {
    const bedBathText = `${property.beds || 0} Bed ${property.baths || 0} Bath`;
    const acresText = '0.0 Acres';
    const propertyTitle = property.title || 'Untitled Property';
    const propertyAddress = property.address || 'Address not available';
    const propertyType = getPropertyType(property.type);
    
    return `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        width: 350px;
        max-width: 90vw;
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,0.08);
        color: #333;
        margin: 0;
        padding: 0;
        border: 1px solid #f0f0f0;
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
              background: rgba(255,255,255,0.95);
              color: #1a73e8;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              backdrop-filter: blur(8px);
            ">
              Available
            </div>
          </div>
        ` : `
          <div style="
            width: 100%;
            height: 120px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            border-bottom: 1px solid #f0f0f0;
          ">
            <div style="
              color: #64748b;
              font-size: 18px;
              font-weight: 500;
            ">
              📸 No Image
            </div>
            <div style="
              position: absolute;
              top: 12px;
              left: 12px;
              background: rgba(255,255,255,0.95);
              color: #1a73e8;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              backdrop-filter: blur(8px);
            ">
              Available
            </div>
          </div>
        `}
        
        <div style="padding: 20px;">
          <div style="
            font-size: 26px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 8px;
            letter-spacing: -0.025em;
          ">
            ${formatPrice(property.price)}
          </div>
          
          <div style="
            font-size: 14px;
            color: #64748b;
            margin-bottom: 12px;
            line-height: 1.4;
            font-weight: 500;
          ">
            ${bedBathText}${acresText ? ` • ${acresText}` : ''}
          </div>
          
          <div style="
            font-size: 15px;
            color: #334155;
            margin-bottom: 8px;
            font-weight: 500;
            line-height: 1.3;
          ">
            ${propertyAddress}
          </div>
          
          ${property.description ? `
            <div style="
              font-size: 13px;
              color: #64748b;
              margin-bottom: 16px;
              line-height: 1.4;
              max-height: 40px;
              overflow: hidden;
            ">
              ${property.description.length > 80 ? property.description.substring(0, 80) + '...' : property.description}
            </div>
          ` : `
            <div style="
              font-size: 13px;
              color: #64748b;
              margin-bottom: 16px;
            ">
              Premium property listing
            </div>
          `}
          
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 16px;
            border-top: 1px solid #f1f5f9;
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
                  propertyType.toLowerCase() === 'house' ? '#3b82f6' :
                  propertyType.toLowerCase() === 'apartment' ? '#10b981' :
                  propertyType.toLowerCase() === 'condo' ? '#8b5cf6' :
                  propertyType.toLowerCase() === 'townhouse' ? '#f59e0b' :
                  propertyType.toLowerCase() === 'villa' ? '#ef4444' :
                  '#64748b'
                };
              "></div>
              <span style="
                font-size: 13px;
                color: #64748b;
                text-transform: capitalize;
                font-weight: 500;
              ">
                ${propertyType}
              </span>
            </div>
            
            <button onclick="window.selectProperty('${property.id}')" style="
              background: #1a73e8;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 8px;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
              box-shadow: 0 2px 4px rgba(26, 115, 232, 0.2);
            " onmouseover="this.style.background='#1557b0'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#1a73e8'; this.style.transform='translateY(0)'">
              View Details
            </button>
          </div>
        </div>
      </div>
    `;
  };

  // Create cluster info window content
  const createClusterInfoWindowContent = (cluster: PropertyCluster) => {
    const validPrices = cluster.properties.filter(p => p.price && p.price > 0);
    const totalValue = validPrices.reduce((sum, p) => sum + (p.price || 0), 0);
    const avgPrice = validPrices.length > 0 ? totalValue / validPrices.length : 0;
    const priceRange = validPrices.length > 0 ? {
      min: Math.min(...validPrices.map(p => p.price || 0)),
      max: Math.max(...validPrices.map(p => p.price || 0))
    } : { min: 0, max: 0 };

    return `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        width: 420px;
        max-width: 90vw;
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,0.08);
        color: #333;
        margin: 0;
        padding: 0;
        border: 1px solid #f0f0f0;
      ">
        <div style="
          background: linear-gradient(135deg, #1a73e8 0%, #4285f4 100%);
          color: white;
          padding: 20px;
          text-align: center;
        ">
          <div style="font-size: 20px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.025em;">
            ${cluster.properties.length} Properties
          </div>
          <div style="font-size: 14px; opacity: 0.9; font-weight: 500;">
            ${validPrices.length > 0 ? `${formatPrice(priceRange.min)} - ${formatPrice(priceRange.max)}` : 'Price on Request'}
          </div>
        </div>
        
        <div style="padding: 16px; max-height: 320px; overflow-y: auto;">
          ${cluster.properties.map((property, index) => `
            <div style="
              border: 1px solid #f1f5f9;
              border-radius: 12px;
              padding: 16px;
              margin-bottom: ${index < cluster.properties.length - 1 ? '12px' : '0'};
              cursor: pointer;
              transition: all 0.2s ease;
              background: #fafbfx;
            " onclick="window.selectProperty('${property.id}')" 
               onmouseover="this.style.background='#f8fafc'; this.style.borderColor='#1a73e8'; this.style.transform='translateY(-1px)'"
               onmouseout="this.style.background='#fafbfc'; this.style.borderColor='#f1f5f9'; this.style.transform='translateY(0)'">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                <div style="flex: 1;">
                  <div style="font-weight: 700; font-size: 18px; color: #1e293b; margin-bottom: 4px; letter-spacing: -0.025em;">
                    ${formatPrice(property.price)}
                  </div>
                  <div style="font-size: 15px; color: #334155; margin-bottom: 6px; font-weight: 500;">
                    ${property.title || 'Untitled Property'}
                  </div>
                  <div style="font-size: 13px; color: #64748b; margin-bottom: 8px; font-weight: 500;">
                    ${property.beds || 0} bed • ${property.baths || 0} bath • ${getPropertyType(property.type)}
                  </div>
                  <div style="font-size: 12px; color: #94a3b8; line-height: 1.3;">
                    ${property.address || 'Address not available'}
                  </div>
                </div>
                ${property.image_urls && property.image_urls.length > 0 ? `
                  <img src="${property.image_urls[0]}" style="
                    width: 64px;
                    height: 48px;
                    object-fit: cover;
                    border-radius: 8px;
                    flex-shrink: 0;
                    border: 1px solid #f1f5f9;
                  " alt="${property.title || 'Property image'}">
                ` : `
                  <div style="
                    width: 64px;
                    height: 48px;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    color: #64748b;
                    flex-shrink: 0;
                    border: 1px solid #f1f5f9;
                  ">📸</div>
                `}
              </div>
            </div>
          `).join('')}
        </div>
        
        <div style="
          padding: 20px;
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
          text-align: center;
        ">
          <div style="font-size: 14px; color: #64748b; margin-bottom: 12px; font-weight: 500;">
            ${avgPrice > 0 ? `Average Price: ${formatPrice(avgPrice)}` : 'Contact for pricing'}
          </div>
          <button onclick="window.zoomToCluster(${cluster.lat}, ${cluster.lng})" style="
            background: #1a73e8;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(26, 115, 232, 0.2);
          " onmouseover="this.style.background='#1557b0'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#1a73e8'; this.style.transform='translateY(0)'">
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
        // Create cluster marker with modern styling
        marker = new window.google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          title: `${cluster.properties.length} properties`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#1a73e8',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
            scale: Math.min(12 + (cluster.properties.length * 1.5), 22),
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
        // Create single property marker with modern styling
        const property = cluster.properties[0];
        const getMarkerIcon = (type: string | undefined, isSelected: boolean) => {
          const colors = {
            'house': '#3b82f6',
            'apartment': '#10b981',
            'condo': '#8b5cf6',
            'townhouse': '#f59e0b',
            'villa': '#ef4444',
            'default': '#64748b'
          };
          
          const propertyType = getPropertyType(type);
          const color = colors[propertyType.toLowerCase() as keyof typeof colors] || colors.default;
          const size = isSelected ? 36 : 28;
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
          title: property.title || 'Property',
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
        
        const getMarkerIcon = (type: string | undefined, isSelected: boolean) => {
          const colors = {
            'house': '#3b82f6',
            'apartment': '#10b981',
            'condo': '#8b5cf6',
            'townhouse': '#f59e0b',
            'villa': '#ef4444',
            'default': '#64748b'
          };
          
          const propertyType = getPropertyType(type);
          const color = colors[propertyType.toLowerCase() as keyof typeof colors] || colors.default;
          const size = isSelected ? 36 : 28;
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
        className="h-full w-full rounded-2xl border border-gray-200 shadow-lg" 
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
        <div className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center border border-gray-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm font-medium">Loading map...</p>
          </div>
        </div>
      )}

      {/* Geocoding Progress */}
      {geocodingProgress.isProcessing && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-gray-200">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Geocoding Properties</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Converting addresses to map coordinates...
              <br />
              <span className="font-medium">{geocodingProgress.current} of {geocodingProgress.total}</span> processed
            </p>
            <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
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
        <div className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center border border-gray-200">
          <div className="text-center p-8 max-w-md">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Map Configuration Error</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              {mapError}
            </p>
            <div className="text-xs text-gray-500 mb-6 text-left bg-gray-50 p-4 rounded-lg">
              <strong className="block mb-2">Please verify:</strong>
              • Google Maps API key is configured<br />
              • Maps JavaScript API is enabled<br />
              • Geocoding API is enabled<br />
              • Billing is set up for your project<br />
              • API key restrictions are properly configured
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
      
      {/* No Properties State */}
      {mapLoaded && !geocodingProgress.isProcessing && geocodedProperties.length === 0 && properties.length > 0 && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-gray-200">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Valid Addresses</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Unable to geocode any property addresses.
              <br />
              Please check that your properties have valid addresses.
            </p>
          </div>
        </div>
      )}

      {/* Empty Properties State */}
      {mapLoaded && !geocodingProgress.isProcessing && properties.length === 0 && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-gray-200">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Add some properties to see them on the map.
            </p>
          </div>
        </div>
      )}
      
      {/* Map Stats */}
      {mapLoaded && !geocodingProgress.isProcessing && geocodedProperties.length > 0 && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-lg">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700 font-medium">{geocodedProperties.length} properties shown</span>
          </div>
          {currentZoom < 14 && (
            <div className="flex items-center space-x-3 text-xs mt-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-500">Zoom in to separate clusters</span>
            </div>
          )}
        </div>
      )}
      
      {/* Legend */}
      {mapLoaded && !geocodingProgress.isProcessing && geocodedProperties.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-lg">
          <div className="flex flex-col space-y-2 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-700 font-medium">House</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-700 font-medium">Apartment</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-gray-700 font-medium">Condo</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-700 font-medium">Townhouse</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-700 font-medium">Villa</span>
            </div>
            {currentZoom < 14 && (
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-sm"></div>
                  <span className="text-gray-700 font-medium">Cluster</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
