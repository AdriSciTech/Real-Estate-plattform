// app/properties/components/PropertyInfoWindow.tsx
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

  return `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      width: 320px;
      max-width: 90vw;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      color: #333;
      margin: 0;
      padding: 0;
      border: 1px solid #e5e7eb;
    ">
      ${property.image_urls && property.image_urls.length > 0 ? `
        <div style="
          width: 100%;
          height: 160px;
          background-image: url('${property.image_urls[0]}');
          background-size: cover;
          background-position: center;
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 8px;
            left: 8px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.025em;
          ">
            FOR SALE
          </div>
        </div>
      ` : `
        <div style="
          width: 100%;
          height: 100px;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <div style="
            color: #6b7280;
            font-size: 14px;
            font-weight: 500;
          ">
            📷 No Image
          </div>
          <div style="
            position: absolute;
            top: 8px;
            left: 8px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.025em;
          ">
            FOR SALE
          </div>
        </div>
      `}
      
      <div style="padding: 16px;">
        <div style="
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
          line-height: 1.2;
        ">
          ${getDisplayPrice(property)}
        </div>
        
        <div style="
          font-size: 14px;
          color: #4b5563;
          margin-bottom: 12px;
          line-height: 1.4;
        ">
          ${property.beds || 0} bed • ${property.baths || 0} bath
        </div>
        
        <div style="
          font-size: 14px;
          color: #111827;
          margin-bottom: 8px;
          font-weight: 500;
          line-height: 1.4;
        ">
          ${property.title || 'Untitled Property'}
        </div>
        
        <div style="
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 16px;
          line-height: 1.4;
        ">
          ${property.address || 'Address not available'}
        </div>
        
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid #f3f4f6;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 6px;
          ">
            <div style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: ${getPropertyTypeColor(property.type)};
            "></div>
            <span style="
              font-size: 12px;
              color: #6b7280;
              text-transform: capitalize;
              font-weight: 500;
            ">
              ${property.type || 'Property'}
            </span>
          </div>
          
          <button onclick="window.selectProperty('${property.id}')" style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
            View Details
          </button>
        </div>
      </div>
    </div>
  `;
}
