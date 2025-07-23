// apps\listings-site\listings-plattform\components\PropertyCard1\PropertyCard.tsx
"use client";

import { Property } from '@rental/types';
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageCarousel from "./ImageCarousel";

interface PropertyCardProps {
  property: Property;
  priority?: boolean;
  index?: number; // Add index to props
}

export default function PropertyCard({ property, priority = false, index = 0 }: PropertyCardProps) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Simple image extraction - just get URLs, don't transform them yet
  const getImagePaths = (): string[] => {
    // Try R2 optimized images first
    if (property.image_urls_full?.length) {
      return property.image_urls_full.map(img => img.medium || img.full || img.thumb).filter(Boolean);
    }
    
    // Try alternative optimized images
    if (property.optimized_images?.length) {
      return property.optimized_images.map(img => img.medium || img.full || img.thumb).filter(Boolean);
    }
    
    // Fall back to legacy URLs
    if (property.image_urls?.length) {
      return property.image_urls.filter(url => url && url.length > 0);
    }
    
    return [];
  };

  const imagePaths = getImagePaths();

  // Format price safely
  const formatPrice = (price?: number) => {
    if (!price) return 'Price on request';
    return `€${price.toLocaleString('de-DE')}`;
  };

  // Handle booking request
  const handleBookingRequest = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prepare complete property data for reservation dashboard
    const propertyData = {
      id: property.id,
      title: property.title || 'Untitled Property',
      address: property.address || 'Unknown Location',
      city: property.address ? property.address.split(',').pop()?.trim() : 'Unknown City',
      price: property.price?.toString() || '0',
      displayPrice: property.price ? `€${property.price.toLocaleString('de-DE')}` : 'Price on request',
      priceFrequency: 'month',
      bedrooms: property.beds?.toString() || '0',
      beds: property.beds?.toString() || '0',
      rooms: property.beds?.toString() || '0', // Some dashboards expect 'rooms'
      bathrooms: property.baths?.toString() || '0',
      baths: property.baths?.toString() || '0',
      size: property.area ? `${property.area} m²` : 'N/A',
      area: property.area?.toString() || '0',
      propertyType: property.type || 'Apartment',
      location: property.address || 'Unknown Location',
      featuredImage: imagePaths[0] || property.image_urls?.[0] || '/placeholder-property.jpg',
      images: imagePaths.length > 0 ? imagePaths : property.image_urls || [],
      galleryImages: imagePaths.length > 0 ? imagePaths : property.image_urls || [],
      imageUrl: imagePaths[0] || property.image_urls?.[0] || '/placeholder-property.jpg',
      url: `/properties/${property.id}`,
      available: property.available !== false,
      description: property.description || '',
      // Additional fields for compatibility
      lat: property.lat,
      lng: property.lng,
      created_at: property.created_at,
      updated_at: property.updated_at
    };
    
    // Store property data in localStorage for the reservation dashboard
    localStorage.setItem('selectedProperty', JSON.stringify(propertyData));
    
    // Also pass propertyId as URL parameter for quick reference
    const params = new URLSearchParams({
      propertyId: property.id || ''
    });
    
    // Determine the reservation dashboard URL
    const isDevelopment = window.location.hostname === 'localhost';
    let reservationDashboardUrl = '';
    
    if (isDevelopment) {
      // In development, reservation dashboard runs on port 3001
      reservationDashboardUrl = `http://localhost:3001/ReservationDashboard/dashboard?${params.toString()}`;
    } else {
      // In production, both apps are on studentrentals.es
      // Reservation dashboard is served from /ReservationDashboard path
      reservationDashboardUrl = `/ReservationDashboard/dashboard?${params.toString()}`;
    }
    
    // Try to open the reservation dashboard
    const newWindow = window.open(reservationDashboardUrl, '_blank');
    
    // If the window couldn't open (popup blocked), show an alert
    if (!newWindow) {
      alert('Please allow popups to open the reservation dashboard. You can also navigate to the reservation dashboard manually.');
    }
  };

  return (
    <div className="rounded-xl shadow-md bg-white overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/properties/${property.id}`}>
        {/* Image Carousel */}
        <div className="relative">
          <ImageCarousel 
            imagePaths={imagePaths}
            propertyTitle={property.title || 'Property'}
            priority={priority}
          />
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3 z-20">
            <span className="bg-teal-500 text-white px-3 py-1 rounded-md text-xs font-medium">
              Active
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Price */}
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(property.price)}
          </div>

          {/* Property Details */}
          <div className="text-sm text-gray-700 space-x-4">
            <span>{property.beds || 0} Bed{property.beds !== 1 ? 's' : ''}</span>
            <span>{property.baths || 0} Bath{property.baths !== 1 ? 's' : ''}</span>
            {property.area && <span>{property.area} m²</span>}
          </div>

          {/* Property Type */}
          {property.type && (
            <div className="text-sm text-blue-600 font-medium">
              {property.type}
            </div>
          )}

          {/* Address */}
          <div className="text-sm text-gray-600 line-clamp-2">
            {property.address || 'Address not available'}
          </div>
        </div>
      </Link>

      {/* Book Button */}
      <div className="px-4 pb-4">
        <button
          onClick={handleBookingRequest}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors"
        >
          Request Booking
        </button>
      </div>
    </div>
  );
}
