// app/dashboard/hooks/usePropertyManager.ts
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Property } from '../../../lib/types/property';

export function usePropertyManager(router: any, activeTab: string) {
  const searchParams = useSearchParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [isPropertyReserved, setIsPropertyReserved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProperty = async () => {
      setLoading(true);
      setError(null);

      try {
        // First, check URL parameters
        const propertyId = searchParams.get('propertyId');
        const source = searchParams.get('source');
        
        // Then check localStorage for property data
        const storedPropertyData = localStorage.getItem('selectedProperty');
        const storedPropertyId = localStorage.getItem('bookingPropertyId');
        
        if (storedPropertyData) {
          try {
            const parsedProperty = JSON.parse(storedPropertyData);
            
            // Transform the property data to match the expected format
            const transformedProperty: Property = {
              id: parsedProperty.id,
              title: parsedProperty.title,
              address: parsedProperty.address,
              city: parsedProperty.city || parsedProperty.address?.split(',').pop()?.trim() || 'Unknown City',
              price: typeof parsedProperty.price === 'string' ? parseFloat(parsedProperty.price) : parsedProperty.price,
              displayPrice: parsedProperty.displayPrice,
              priceFrequency: parsedProperty.priceFrequency || 'month',
              bedrooms: parsedProperty.bedrooms || parsedProperty.beds,
              beds: parsedProperty.beds || parsedProperty.bedrooms,
              rooms: parsedProperty.rooms || parsedProperty.bedrooms || parsedProperty.beds,
              bathrooms: parsedProperty.bathrooms || parsedProperty.baths,
              baths: parsedProperty.baths || parsedProperty.bathrooms,
              size: parsedProperty.size || (parsedProperty.area ? `${parsedProperty.area} m²` : 'N/A'),
              area: parsedProperty.area,
              propertyType: parsedProperty.propertyType || parsedProperty.type || 'Apartment',
              location: parsedProperty.location || parsedProperty.address,
              featuredImage: parsedProperty.featuredImage || parsedProperty.imageUrl || '/placeholder-property.jpg',
              images: parsedProperty.images || parsedProperty.galleryImages || [],
              imageUrl: parsedProperty.imageUrl || parsedProperty.featuredImage || '/placeholder-property.jpg',
              url: parsedProperty.url || `/properties/${parsedProperty.id}`,
              available: parsedProperty.available !== false,
              description: parsedProperty.description || '',
              // Preserve additional fields
              lat: parsedProperty.lat,
              lng: parsedProperty.lng,
              created_at: parsedProperty.created_at,
              updated_at: parsedProperty.updated_at,
              amenities: parsedProperty.amenities || [],
              nearbyPlaces: parsedProperty.nearbyPlaces || []
            };
            
            setProperty(transformedProperty);
            
            // Clean up localStorage after successful load
            localStorage.removeItem('selectedProperty');
            
            // Check if the property is already reserved
            const reservedProperties = localStorage.getItem('reservedProperties');
            if (reservedProperties) {
              const reserved = JSON.parse(reservedProperties);
              if (reserved.includes(parsedProperty.id)) {
                setIsPropertyReserved(true);
              }
            }
          } catch (parseError) {
            console.error('Error parsing stored property data:', parseError);
            setError('Invalid property data format');
          }
        } else if (propertyId) {
          // If no stored data but we have a propertyId, we could fetch from the API
          // For now, we'll show an error since we don't have the property details
          setError('Property details not found. Please select a property from the listings.');
        } else {
          // No property selected
          setProperty(null);
        }
      } catch (err) {
        console.error('Error loading property:', err);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [searchParams]);

  const handleReserveProperty = () => {
    if (!property) return null;

    // Mark property as reserved
    setIsPropertyReserved(true);
    
    // Store in localStorage
    const reservedProperties = localStorage.getItem('reservedProperties');
    const reserved = reservedProperties ? JSON.parse(reservedProperties) : [];
    if (!reserved.includes(property.id)) {
      reserved.push(property.id);
      localStorage.setItem('reservedProperties', JSON.stringify(reserved));
    }
    
    // Store the reserved property details
    localStorage.setItem('reservedProperty', JSON.stringify(property));
    
    return 'reserved'; // Return the tab to navigate to
  };

  const handleFindAnotherProperty = () => {
    // Clear current property
    setProperty(null);
    setIsPropertyReserved(false);
    localStorage.removeItem('bookingPropertyId');
    localStorage.removeItem('propertyParams');
    
    // Redirect back to listings site
    const isDevelopment = window.location.hostname === 'localhost';
    if (isDevelopment) {
      window.location.href = 'http://localhost:3000';
    } else {
      // Adjust based on your production setup
      window.location.href = 'https://studentrentals.es';
    }
  };

  const formatPrice = (price?: number | string) => {
    if (!price) return 'Price on request';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `€${numPrice.toLocaleString('de-DE')}`;
  };

  return {
    property,
    isPropertyReserved,
    handleReserveProperty,
    handleFindAnotherProperty,
    formatPrice,
    loading,
    error
  };
}