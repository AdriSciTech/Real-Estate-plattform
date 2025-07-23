//my-app\components\PropertyCard.tsx

import Image from 'next/image';
import { Property, ImageUrls } from '@/lib/types';

interface PropertyCardProps {
  property: Partial<Property>;
  isPreview?: boolean;
}

export default function PropertyCard({ property, isPreview = false }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', { // Changed to Spanish locale
      style: 'currency',
      currency: 'EUR', // Changed to EUR
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get the best image URL from the new R2 structure
  const getPrimaryImageUrl = (): string | null => {
    // Priority 1: Use new R2 structure (image_urls_full)
    if (property.image_urls_full && property.image_urls_full.length > 0) {
      const firstImage = property.image_urls_full[0];
      // Prefer medium for cards, fallback to full then thumb
      return firstImage.medium || firstImage.full || firstImage.thumb || null;
    }
    
    // Priority 2: Fallback to legacy images
    if (property.image_urls && property.image_urls.length > 0) {
      return property.image_urls[0];
    }
    
    return null;
  };

  // Get total image count
  const getImageCount = (): number => {
    if (property.image_urls_full && property.image_urls_full.length > 0) {
      return property.image_urls_full.length;
    }
    
    if (property.image_urls && property.image_urls.length > 0) {
      return property.image_urls.length;
    }
    
    return 0;
  };

  const primaryImageUrl = getPrimaryImageUrl();
  const totalImages = getImageCount();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image Gallery */}
      <div className="relative h-64">
        {primaryImageUrl ? (
          <Image
            src={primaryImageUrl}
            alt={property.title || 'Property'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={!isPreview} // Prioritize loading for non-preview cards
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">🏠</div>
              <span className="text-sm">No image available</span>
            </div>
          </div>
        )}
        
        {/* Preview Badge */}
        {isPreview && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
            Preview
          </div>
        )}
        
        {/* R2 Optimization Badge (optional - remove in production) */}
        {property.image_urls_full && property.image_urls_full.length > 0 && (
          <div className="absolute top-4 right-4 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
            🔒 R2
          </div>
        )}
        
        {/* Multiple Images Indicator */}
        {totalImages > 1 && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm backdrop-blur-sm">
            📷 +{totalImages - 1} more
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-900 truncate">
            {property.title || 'Property Title'}
          </h3>
          <div className="text-2xl font-bold text-blue-600">
            {property.price ? formatPrice(property.price) : '€0'}
          </div>
        </div>

        <p className="text-gray-600 mb-3 truncate flex items-center">
          <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          {property.address || 'Address not provided'}
        </p>

        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center text-gray-700">
            <span className="font-medium">{property.beds || 0}</span>
            <span className="ml-1 text-sm">bed{(property.beds || 0) !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <span className="font-medium">{property.baths || 0}</span>
            <span className="ml-1 text-sm">bath{(property.baths || 0) !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center">
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              {property.type || 'Property'}
            </span>
          </div>
        </div>

        {property.description && (
          <p className="text-gray-600 text-sm line-clamp-3">
            {property.description}
          </p>
        )}

        {/* Image Quality Info (for R2 properties) */}
        {property.image_urls_full && property.image_urls_full.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center text-xs text-green-600">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
              Optimized images • Fast loading • Multiple sizes
            </div>
          </div>
        )}
      </div>
    </div>
  );
}