// app/map/PropertyInfoWindow.tsx
import { Property } from '@rental/types';

interface GeocodedProperty extends Property {
  lat: number;
  lng: number;
}

interface PropertyInfoWindowProps {
  property: GeocodedProperty;
}

export default function PropertyInfoWindow({ property }: PropertyInfoWindowProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
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

  const getPropertyTypeColor = (type: string | undefined) => {
    if (!type) return '#6B7280';
    
    const colors = {
      'house': '#3B82F6',
      'apartment': '#10B981',
      'condo': '#8B5CF6',
      'townhouse': '#F59E0B',
      'villa': '#EF4444',
      'studio': '#06B6D4',
      'loft': '#F97316',
      'default': '#6B7280'
    };
    return colors[type.toLowerCase() as keyof typeof colors] || colors.default;
  };

  const handleViewDetails = () => {
    // This will be handled by the global function
    if (typeof window !== 'undefined' && (window as any).selectProperty) {
      (window as any).selectProperty(property.id);
    }
  };

  return (
    <div className="font-sans max-w-xs bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
      {/* Image Section */}
      {property.image_urls && property.image_urls.length > 0 ? (
        <div 
          className="w-full h-40 bg-cover bg-center relative"
          style={{ backgroundImage: `url('${property.image_urls[0]}')` }}
        >
          <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide">
            FOR SALE
          </div>
        </div>
      ) : (
        <div className="w-full h-24 bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center relative">
          <div className="text-gray-500 text-sm font-medium">
            📷 No Image
          </div>
          <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide">
            FOR SALE
          </div>
        </div>
      )}
      
      {/* Content Section */}
      <div className="p-4">
        {/* Price */}
        <div className="text-xl font-bold text-gray-900 mb-2 leading-tight">
          {getDisplayPrice(property)}
        </div>
        
        {/* Bed/Bath Info */}
        <div className="text-sm text-gray-600 mb-3 font-medium">
          {property.beds || 0} bed • {property.baths || 0} bath
        </div>
        
        {/* Title */}
        <div className="text-sm text-gray-900 mb-2 font-medium leading-relaxed">
          {property.title || 'Untitled Property'}
        </div>
        
        {/* Address */}
        <div className="text-xs text-gray-600 mb-4 leading-relaxed">
          {property.address || 'Address not available'}
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getPropertyTypeColor(property.type) }}
            />
            <span className="text-xs text-gray-600 capitalize font-medium">
              {property.type || 'Property'}
            </span>
          </div>
          
          <button 
            onClick={handleViewDetails}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors shadow-sm"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
