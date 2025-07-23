import { Database } from './database';

// Extract the property type from the database schema
export type Property = Database['public']['Tables']['properties']['Row'];

// Display data interface for properties
export interface PropertyDisplayData {
  id: string;
  title: string;
  address: string;
  price: number;
  primaryImage?: {
    full: string;
    medium: string;
    thumbnail: string;
  };
}

// Validation result interface
export interface PropertyValidationResult {
  isValid: boolean;
  property?: Property;
  errors?: string[];
}

// Get property display data
export function getPropertyDisplayData(property: Property): PropertyDisplayData {
  const images = property.images || [];
  const primaryImageUrl = images[0] || '/placeholder-property.jpg';

  return {
    id: property.id,
    title: property.title,
    address: property.address,
    price: property.price,
    primaryImage: {
      full: primaryImageUrl,
      medium: primaryImageUrl,
      thumbnail: primaryImageUrl
    }
  };
}

// Validate property data
export function validateProperty(data: any): PropertyValidationResult {
  const errors: string[] = [];

  // Check required fields
  if (!data.id) errors.push('Property ID is required');
  if (!data.title) errors.push('Title is required');
  if (!data.address) errors.push('Address is required');
  if (typeof data.price !== 'number' || data.price < 0) {
    errors.push('Valid price is required');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Cast to Property type if valid
  const property: Property = {
    id: data.id,
    title: data.title,
    description: data.description || '',
    address: data.address,
    city: data.city || '',
    price: data.price,
    rooms: data.rooms || 0,
    bathrooms: data.bathrooms || 0,
    size: data.size,
    images: data.images || [],
    amenities: data.amenities || [],
    owner_id: data.owner_id || '',
    status: data.status || 'available',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString()
  };

  return { isValid: true, property };
}