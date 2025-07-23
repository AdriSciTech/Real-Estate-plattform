// apps\listings-site\listings-plattform\lib\types\property.ts
// ========================================
import { ImageUrls, generateR2ImageUrls, isImageUrls } from './image';

export type PropertyType = 'Apartment' | 'House' | 'Condo' | 'Townhouse' | 'Villa' | 'Studio' | 'Loft';

// Property as it comes from the API - all fields optional except ID
export interface Property {
  id: string; // Only required field
  title?: string;
  address?: string;
  price?: number;
  beds?: number;
  baths?: number;
  type?: PropertyType;
  description?: string;
  lat?: number;
  lng?: number;
  area?: number;
  available?: boolean;
  
  // Image fields - flexible to handle different formats
  images?: ImageUrls[];
  image_urls?: string[]; // Legacy support
  image_urls_full?: ImageUrls[]; // R2 optimized format
  optimized_images?: ImageUrls[]; // Alternative optimized format
  featuredImage?: ImageUrls;
  imageCount?: number;
  has_optimized_images?: boolean;
  images_processing?: boolean;
  
  // Metadata - also optional
  created_at?: string;
  updated_at?: string;
}

// For components that need certain fields, create specific interfaces
export interface PropertyCardData {
  id: string;
  title: string;
  price: number;
  beds?: number;
  baths?: number;
  address?: string;
  images?: ImageUrls[];
  image_urls?: string[]; // Fallback
}

// Type guard to check if property has minimum data for display
export const hasMinimumDisplayData = (property: Property): property is Property & PropertyCardData => {
  return !!(
    property.id &&
    property.title &&
    property.price !== undefined &&
    property.price !== null
  );
};

// Validate property data from API
export interface PropertyValidationResult {
  isValid: boolean;
  property?: Property;
  errors: string[];
}

export const validateProperty = (data: any): PropertyValidationResult => {
  const errors: string[] = [];

  // Check if we have an ID (minimum requirement)
  if (!data?.id) {
    errors.push('Property ID is required');
    return { isValid: false, errors };
  }

  // Validation in progress

  // Create a property object with all available data
  // Map database fields to expected property interface fields
  const property: Property = {
    id: String(data.id || ''),
    title: data.title ? String(data.title) : undefined,
    address: data.address ? String(data.address) : undefined,
    price: typeof data.price === 'number' ? data.price : (data.price ? Number(data.price) : undefined),
    beds: typeof data.beds === 'number' ? data.beds : (typeof data.rooms === 'number' ? data.rooms : (data.beds ? Number(data.beds) : (data.rooms ? Number(data.rooms) : undefined))),
    baths: typeof data.baths === 'number' ? data.baths : (typeof data.bathrooms === 'number' ? data.bathrooms : (data.baths ? Number(data.baths) : (data.bathrooms ? Number(data.bathrooms) : undefined))),
    type: isValidPropertyType(data.type) ? data.type : undefined,
    description: data.description ? String(data.description) : undefined,
    lat: typeof data.lat === 'number' ? data.lat : (data.lat ? Number(data.lat) : undefined),
    lng: typeof data.lng === 'number' ? data.lng : (data.lng ? Number(data.lng) : undefined),
    area: typeof data.area === 'number' ? data.area : (typeof data.size === 'string' ? parseInt(data.size) : (data.area ? Number(data.area) : (data.size ? parseInt(String(data.size)) : undefined))),
    available: typeof data.available === 'boolean' ? data.available : (data.status === 'available'),
    
    // Handle images - provide fallbacks for missing images
    images: Array.isArray(data.images) ? data.images.filter(isImageUrls) : undefined,
    image_urls: Array.isArray(data.image_urls) ? data.image_urls.filter((url: any) => typeof url === 'string') : 
                Array.isArray(data.images) ? data.images.filter((url: any) => typeof url === 'string') :
                ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'], // Fallback image
    featuredImage: isImageUrls(data.featuredImage) ? data.featuredImage : undefined,
    imageCount: typeof data.imageCount === 'number' ? data.imageCount : undefined,
    
    // Metadata
    created_at: data.created_at || undefined,
    updated_at: data.updated_at || undefined,
  };

  return { isValid: true, property, errors: [] };
};

// Helper type guard
const isValidPropertyType = (type: any): type is PropertyType => {
  const validTypes: PropertyType[] = ['Apartment', 'House', 'Condo', 'Townhouse', 'Villa', 'Studio', 'Loft'];
  return typeof type === 'string' && validTypes.includes(type as PropertyType);
};

// Helper to get display values with fallbacks
export const getPropertyDisplayData = (property: Property) => {
  return {
    title: property.title || 'Untitled Property',
    price: property.price ?? 0,
    beds: property.beds ?? 0,
    baths: property.baths ?? 0,
    address: property.address || 'Address not available',
    type: property.type || 'Property',
    area: property.area,
    description: property.description,
    // Get first available image
    primaryImage: property.images?.[0] || 
                  (property.image_urls?.[0] ? generateR2ImageUrls(property.image_urls[0]) : null),
    imageCount: property.imageCount || 
                property.images?.length || 
                property.image_urls?.length || 
                0
  };
};
