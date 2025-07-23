// app/ReservationDashboard/dashboard/hooks/usePropertyManager.tsx
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { Property, getPropertyDisplayData, validateProperty } from "../../../lib/types/property";

// Import PropertyData from types/index.ts instead of redefining it
import { PropertyData as BasePropertyData } from "../../../types";

// Extend the base PropertyData with additional fields specific to this hook
export interface PropertyData extends BasePropertyData {
  address: string;
  city: string;
  availability?: string;
  depositAmount?: number;
  utilitiesIncluded?: boolean;
  furnished?: boolean;
  description?: string;
  amenities?: string[];
  nearbyPlaces?: string[];
}

export const usePropertyManager = (router: any, activeTab: string) => {
  const searchParams = useSearchParams();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [isPropertyReserved, setIsPropertyReserved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get property ID from URL params
  const propertyId = searchParams.get('propertyId') || searchParams.get('id');

  // Debug logging
  useEffect(() => {
    console.log('usePropertyManager - propertyId:', propertyId);
    console.log('usePropertyManager - searchParams:', Object.fromEntries(searchParams.entries()));
  }, [propertyId, searchParams]);

  // Fetch property data from Supabase
  useEffect(() => {
    const fetchProperty = async () => {
      // If no property ID, check localStorage for saved property
      if (!propertyId) {
        console.log('No propertyId in URL, checking localStorage...');
        
        // Check if there's a saved property from navigation
        const savedPropertyStr = localStorage.getItem('selectedProperty');
        if (savedPropertyStr) {
          try {
            const savedProperty = JSON.parse(savedPropertyStr);
            console.log('Found saved property:', savedProperty);
            
            // Transform saved property to match PropertyData format
            const transformedProperty: PropertyData = {
              id: savedProperty.id,
              title: savedProperty.title || 'Untitled Property',
              address: savedProperty.address || savedProperty.location || 'Unknown Location',
              city: savedProperty.location || 'Unknown City',
              price: (savedProperty.price || 0).toString(),
              displayPrice: `€${(savedProperty.price || 0).toLocaleString()}`,
              priceFrequency: 'month',
              rooms: (savedProperty.bedrooms || savedProperty.beds || 0).toString(),
              bathrooms: (savedProperty.bathrooms || savedProperty.baths || 0).toString(),
              size: savedProperty.area ? `${savedProperty.area} m²` : undefined,
              featuredImage: savedProperty.images?.[0] || '/placeholder-property.jpg',
              galleryImages: savedProperty.images || [],
              url: `/property/${savedProperty.id}`,
              availability: 'Available',
              depositAmount: (savedProperty.price || 0) * 2,
              utilitiesIncluded: false,
              furnished: true,
              description: savedProperty.description,
              amenities: [],
              nearbyPlaces: []
            };
            
            setProperty(transformedProperty);
            setLoading(false);
            return;
          } catch (err) {
            console.error('Error parsing saved property:', err);
          }
        }
        
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching property from Supabase with ID:', propertyId);

        // supabase is already initialized and imported
        if (!supabase) {
          setError('Unable to connect to database');
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .single();

        console.log('Supabase response:', { data, error: fetchError });

        if (fetchError) {
          console.error('Error fetching property:', fetchError);
          setError('Failed to load property');
          setProperty(null);
        } else if (data) {
          // Validate the property data
          const validationResult = validateProperty(data);
          
          if (!validationResult.isValid || !validationResult.property) {
            setError('Invalid property data');
            return;
          }

          const validProperty = validationResult.property;
          const displayData = getPropertyDisplayData(validProperty);

          // Transform to PropertyData format for backward compatibility
          const transformedProperty: PropertyData = {
            id: validProperty.id,
            title: displayData.title,
            address: displayData.address,
            city: validProperty.address?.split(',').pop()?.trim() || 'Unknown',
            price: displayData.price.toString(),
            displayPrice: `€${displayData.price.toLocaleString()}`,
            priceFrequency: 'month',
            rooms: validProperty.rooms?.toString(),
            bathrooms: validProperty.bathrooms?.toString(),
            size: validProperty.size,
            featuredImage: displayData.primaryImage?.medium || '/placeholder-property.jpg',
            galleryImages: validProperty.images?.map(img => img.full) || 
                   validProperty.image_urls || 
                   [],
            url: `/property/${validProperty.id}`,
            availability: validProperty.available ? 'Available' : 'Not Available',
            depositAmount: displayData.price * 2, // Assume 2 months deposit
            utilitiesIncluded: false,
            furnished: true,
            description: validProperty.description,
            amenities: [],
            nearbyPlaces: []
          };

          setProperty(transformedProperty);
          console.log('Property set successfully:', transformedProperty);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  // Check if property is reserved (from localStorage or user data)
  useEffect(() => {
    const checkReservationStatus = () => {
      const reservedPropertyId = localStorage.getItem("reservedPropertyId");
      if (property && property.id && reservedPropertyId === property.id) {
        setIsPropertyReserved(true);
      }
    };

    checkReservationStatus();
  }, [property]);

  const handleReserveProperty = () => {
    if (!property) return null;

    localStorage.setItem("reservedPropertyId", property.id);
    localStorage.setItem("reservedProperty", JSON.stringify(property));
    setIsPropertyReserved(true);
    return "reserved";
  };

  const handleFindAnotherProperty = () => {
    // Clear any saved property data
    localStorage.removeItem("selectedProperty");
    localStorage.removeItem("propertyParams");
    
    // Navigate back to property search
    router.push("/properties");
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;
    return `€${numPrice.toLocaleString()}`;
  };

  // Load property from localStorage if available (for manual testing)
  const loadProperty = () => {
    const savedPropertyStr = localStorage.getItem('selectedProperty');
    if (savedPropertyStr) {
      const savedProperty = JSON.parse(savedPropertyStr);
      window.location.href = `/ReservationDashboard/dashboard?propertyId=${savedProperty.id}`;
    }
  };

  return {
    property,
    isPropertyReserved,
    handleReserveProperty,
    handleFindAnotherProperty,
    formatPrice,
    loading,
    error,
    loadProperty // Export for debugging
  };
};