// app/properties/components/PropertiesContent.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Property } from '@rental/types';
import PropertyCard from "@/apps/listings-site/components/PropertyCard1/PropertyCard";
import PaginationControls from "./PaginationControls";
import { useRouter } from "next/navigation";

// Dynamically import PropertyMap to avoid SSR issues
const PropertyMap = dynamic(() => import("./PropertyMap"), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
});

interface PropertiesContentProps {
  properties: Property[];
  currentView: "list" | "map";
  currentPage: number;
  totalPages: number;
  resolvedSearchParams: {
    saleOrRent?: string;
    location?: string;
    city?: string;
    beds?: string;
    baths?: string;
    priceRange?: string;
    propertyId?: string;
    propertyType?: string;
    page?: string;
    view?: "list" | "map";
    sort?: "newest" | "price-low" | "price-high" | "beds" | "baths";
    mobile?: "true" | "false";
  };
}

export default function PropertiesContent({
  properties,
  currentView,
  currentPage,
  totalPages,
  resolvedSearchParams,
}: PropertiesContentProps) {
  const router = useRouter();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(
    new Set()
  );
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering for browser-specific features
  useEffect(() => {
    setIsClient(true);

    // Handle initial property selection from URL on client-side only
    if (resolvedSearchParams.propertyId && currentView === "map") {
      const property = properties.find(
        (p) => p.id === resolvedSearchParams.propertyId
      );
      if (property) {
        setSelectedProperty(property);
      }
    }
  }, [resolvedSearchParams.propertyId, currentView, properties]);

  // Handle property selection with URL deep linking
  const handlePropertySelect = useCallback(
    (property: Property) => {
      setSelectedProperty(property);

      // Add to URL for deep linking - only on client side after hydration
      if (isClient && currentView === "map") {
        const params = new URLSearchParams(window.location.search);
        params.set("propertyId", property.id);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, "", newUrl);
      }
    },
    [currentView, isClient]
  );

  // Handle property detail navigation
  const handlePropertyDetail = useCallback(
    (propertyId: string) => {
      router.push(`/properties/${propertyId}`);
    },
    [router]
  );

  // Handle image load errors
  const handleImageError = useCallback((propertyId: string) => {
    setImageLoadErrors((prev) => new Set(prev).add(propertyId));
  }, []);

  // Handle navigation to all properties
  const handleViewAllProperties = useCallback(() => {
    router.push("/properties");
  }, [router]);

  // Static grid classes - fully responsive without client-side detection
  const gridClasses =
    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8";

  // Map view rendering
  if (currentView === "map") {
    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Mobile map header - responsive with CSS only */}
        <div className="block sm:hidden p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {properties.length} Properties
            </h3>
            {selectedProperty && (
              <button
                onClick={() => handlePropertyDetail(selectedProperty.id)}
                className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
              >
                View Details →
              </button>
            )}
          </div>
        </div>

        {/* Map container with responsive height */}
        <div className="relative h-[70vh] sm:h-[600px] min-h-[400px]">
          <PropertyMap
            properties={properties}
            selectedProperty={selectedProperty}
            onPropertySelect={handlePropertySelect}
          />
        </div>

        {/* Mobile selected property preview - responsive with CSS only */}
        {selectedProperty && (
          <div className="block sm:hidden p-4 border-t bg-white">
            <PropertyPreview
              property={selectedProperty}
              onViewDetails={() => handlePropertyDetail(selectedProperty.id)}
              hasImageError={imageLoadErrors.has(selectedProperty.id)}
              onImageError={() => handleImageError(selectedProperty.id)}
            />
          </div>
        )}
      </div>
    );
  }

  // List view rendering
  return (
    <div className="space-y-6">
      {/* Properties count for mobile - responsive with CSS only */}
      <div className="block sm:hidden px-1">
        <span className="text-sm text-gray-600">
          {properties.length}{" "}
          {properties.length === 1 ? "property" : "properties"}
          {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
        </span>
      </div>

      {/* Properties Grid with responsive layout */}
      <div className={gridClasses}>
        {properties.map((property, index) => (
          <PropertyCard
            key={property.id}
            property={property}
            priority={index < 4} // Priority loading for first 4 images
            index={index}
          />
        ))}
      </div>

      {/* Empty state */}
      {properties.length === 0 && (
        <EmptyState onViewAllProperties={handleViewAllProperties} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          searchParams={resolvedSearchParams}
        />
      )}
    </div>
  );
}

// Map loading skeleton component
function MapLoadingSkeleton() {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
            <div className="h-3 bg-gray-300 rounded w-24 mx-auto"></div>
          </div>
        </div>
        <p className="text-gray-600 text-sm">Preparing map...</p>
      </div>
    </div>
  );
}

// Mobile property preview component
function PropertyPreview({
  property,
  onViewDetails,
  hasImageError,
  onImageError,
}: {
  property: Property;
  onViewDetails: () => void;
  hasImageError: boolean;
  onImageError: () => void;
}) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getDisplayPrice = (property: Property): string => {
    if (!property.price || property.price <= 0) {
      return "Price on Request";
    }
    return formatPrice(property.price);
  };

  return (
    <div className="flex space-x-3">
      {/* Property image */}
      <div className="flex-shrink-0">
        {property.image_urls &&
        property.image_urls.length > 0 &&
        !hasImageError ? (
          <img
            src={property.image_urls[0]}
            alt={property.title || "Property image"}
            className="w-16 h-16 rounded-lg object-cover bg-gray-100"
            onError={onImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-xs">📷</span>
          </div>
        )}
      </div>

      {/* Property details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm truncate">
          {getDisplayPrice(property)}
        </h4>
        <p className="text-xs text-gray-600 truncate mt-1">
          {property.title || "Untitled Property"}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {property.beds || 0} bed • {property.baths || 0} bath
        </p>
      </div>

      {/* View details button */}
      <div className="flex-shrink-0">
        <button
          onClick={onViewDetails}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          View
        </button>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState({
  onViewAllProperties,
}: {
  onViewAllProperties: () => void;
}) {
  return (
    <div className="text-center py-12 sm:py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No properties found
        </h3>
        <p className="text-gray-600 text-sm">
          Try adjusting your search criteria or browse all available properties.
        </p>
        <button
          onClick={onViewAllProperties}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Browse All Properties
        </button>
      </div>
    </div>
  );
}
