//my-app\lib\types.ts

export type PropertyType = 'Apartment' | 'House' | 'Condo' | 'Townhouse' | 'Villa';
export type TenantType = 'Family' | 'Student' | 'Professional' | 'Any';
export type PrepaymentOption = 'None' | '1_Month' | '2_Months' | '3_Months' | '6_Months' | '9_Months'| '11_Months';

// Core R2 image structure
export interface ImageUrls {
  thumb: string;
  medium: string;
  full: string;
}

// Legacy processing interfaces (keep for backward compatibility)
export interface ProcessingResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export interface ProcessedImage {
  thumbUrl: string;
  mediumUrl: string;
  fullUrl: string;
  file: File;
  thumb: Blob;
  medium: Blob;
  full: Blob;
  compressionStats?: {
    thumb: ProcessingResult;
    medium: ProcessingResult;
    full: ProcessingResult;
  };
}

// Main Property interface with R2 focus and extended fields
export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  type: PropertyType;
  description?: string;
  lat?: number;
  lng?: number;
  
  // Extended property information
  city?: string;
  parking_included?: boolean;
  parking_spaces?: number;
  furnished?: boolean;
  floor_number?: number;
  has_elevator?: boolean;
  available_from?: string; // Date string
  renewable_contract?: boolean;
  preferred_tenant_type?: TenantType;
  utilities_included?: boolean;
  prepayment_option?: PrepaymentOption;
  prepayment_price?: number;
  features_amenities?: string[]; // Array of features
  smoking_allowed?: boolean;
  pets_allowed?: boolean;
  max_occupancy?: number;
  instant_booking?: boolean; // true = instant, false = approval required
  property_visits_available?: boolean;
  
  // Image handling - R2 first, legacy fallback
  image_urls_full?: ImageUrls[]; // Primary: R2 structure
  image_urls?: string[]; // Legacy: Supabase URLs (backward compatibility)
  
  // Timestamps
  created_at: string;
  updated_at?: string;
}

// Form data interface for property creation/editing - all fields as strings for form handling
export interface PropertyFormData {
  // Basic information
  title: string;
  address: string;
  price: string;
  beds: string;
  baths: string;
  type: PropertyType;
  description: string;
  
  // Extended information
  city: string;
  parking_included: string; // 'true' | 'false' | ''
  parking_spaces: string;
  furnished: string; // 'true' | 'false' | ''
  floor_number: string;
  has_elevator: string; // 'true' | 'false' | ''
  available_from: string; // Date string
  renewable_contract: string; // 'true' | 'false' | ''
  preferred_tenant_type: TenantType | '';
  utilities_included: string; // 'true' | 'false' | ''
  prepayment_option: PrepaymentOption | '';
  prepayment_price: string;
  features_amenities: string; // Comma-separated string that will be converted to array
  smoking_allowed: string; // 'true' | 'false' | ''
  pets_allowed: string; // 'true' | 'false' | ''
  max_occupancy: string;
  instant_booking: string; // 'true' | 'false' | ''
  property_visits_available: string; // 'true' | 'false' | ''
}

// Geocoding result interface
export interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address?: string;
  accuracy?: 'ROOFTOP' | 'RANGE_INTERPOLATED' | 'GEOMETRIC_CENTER' | 'APPROXIMATE';
}

// R2 Upload configuration
export interface R2UploadConfig {
  maxFiles: number;
  maxFileSize: number;
  maxTotalSize: number;
  allowedTypes: readonly string[];
  endpoint: string;
}

// Default R2 configuration - UPDATED LIMITS
export const DEFAULT_R2_CONFIG: R2UploadConfig = {
  maxFiles: 20,
  maxFileSize: 20 * 1024 * 1024, // 20MB (updated from 10MB)
  maxTotalSize: 200 * 1024 * 1024, // 200MB (updated from 100MB)
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const,
  endpoint: '/api/upload'
} as const;

// Image size types for better type safety
export type ImageSize = 'thumbnail' | 'medium' | 'large';
export type ImageSizeAlias = 'thumb' | 'medium' | 'full';

// Image breakpoints for responsive loading
export const IMAGE_BREAKPOINTS = {
  thumbnail: '(max-width: 640px) 50vw, 25vw',
  medium: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw', 
  large: '(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw'
} as const;

// R2 API response interfaces
export interface R2UploadResponse {
  success: boolean;
  data?: ImageUrls[];
  error?: string;
  details?: string;
  message?: string;
}

// Image validation result interface
export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

// Batch image validation result
export interface BatchImageValidationResult {
  valid: boolean;
  errors: string[];
  validFiles?: File[];
  totalSize?: number;
}

// Property card props interface
export interface PropertyCardProps {
  property: Partial<Property>;
  isPreview?: boolean;
  className?: string;
  onClick?: () => void;
}

// Property form props interface
export interface PropertyFormProps {
  property?: Property;
  isEditing?: boolean;
  onSave?: (property: Property) => void;
  onCancel?: () => void;
  className?: string;
}

// Database response interfaces with proper null handling
export interface DatabaseProperty {
  id: string;
  title: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  type: PropertyType;
  description: string | null;
  lat: number | null;
  lng: number | null;
  
  // Extended fields with null handling
  city: string | null;
  parking_included: boolean | null;
  parking_spaces: number | null;
  furnished: boolean | null;
  floor_number: number | null;
  has_elevator: boolean | null;
  available_from: string | null;
  renewable_contract: boolean | null;
  preferred_tenant_type: TenantType | null;
  utilities_included: boolean | null;
  prepayment_option: PrepaymentOption | null;
  prepayment_price: number | null;
  features_amenities: string[] | null;
  smoking_allowed: boolean | null;
  pets_allowed: boolean | null;
  max_occupancy: number | null;
  instant_booking: boolean | null;
  property_visits_available: boolean | null;
  
  image_urls: string[] | null;
  image_urls_full: ImageUrls[] | null;
  created_at: string;
  updated_at: string | null;
}

// API response types with proper error handling
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
  message?: string;
  statusCode?: number;
}

export interface PropertiesResponse extends ApiResponse<Property[]> {
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

export interface PropertyResponse extends ApiResponse<Property> {}

// Search and filter interfaces - extended with new fields
export interface PropertyFilters {
  type?: PropertyType | PropertyType[];
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  location?: string;
  radius?: number;
  city?: string;
  furnished?: boolean;
  parking_included?: boolean;
  pets_allowed?: boolean;
  smoking_allowed?: boolean;
  utilities_included?: boolean;
  preferred_tenant_type?: TenantType;
  instant_booking?: boolean;
  available_from?: string;
}

export interface PropertySearchParams extends PropertyFilters {
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'created_at' | 'updated_at' | 'beds' | 'baths' | 'title' | 'available_from';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  includeImages?: boolean;
}

// Utility type for partial property updates
export type PropertyUpdate = Partial<Omit<Property, 'id' | 'created_at'>>;

// Type for property creation (excluding auto-generated fields)
export type PropertyCreate = Omit<Property, 'id' | 'created_at' | 'updated_at'>;

// Constants for form options
export const TENANT_TYPES: readonly TenantType[] = [
  'Family',
  'Student',
  'Professional',
  'Any'
] as const;

export const PREPAYMENT_OPTIONS: readonly PrepaymentOption[] = [
  'None',
  '1_Month',
  '2_Months',
  '3_Months',
  '6_Months',
  '9_Months', 
  '11_Months'
] as const;

export const PREPAYMENT_LABELS: Record<PrepaymentOption, string> = {
  'None': 'No prepayment required',
  '1_Month': '1 Month in advance',
  '2_Months': '2 Months in advance',
  '3_Months': '3 Months in advance',
  '6_Months': '6 Months in advance',
  '9_Months': '9 Months in advance',
  '11_Months': '11 Months in advance'
} as const;

// Type guards for better type safety
export const hasR2Images = (property: Property): boolean => {
  return !!(property.image_urls_full?.length && property.image_urls_full.length > 0);
};

export const hasLegacyImages = (property: Property): boolean => {
  return !!(property.image_urls?.length && property.image_urls.length > 0);
};

export const hasImages = (property: Property): boolean => {
  return hasR2Images(property) || hasLegacyImages(property);
};

export const isValidPropertyType = (type: string): type is PropertyType => {
  return ['Apartment', 'House', 'Condo', 'Townhouse', 'Villa'].includes(type);
};

export const isValidTenantType = (type: string): type is TenantType => {
  return ['Family', 'Student', 'Professional', 'Any'].includes(type);
};

export const isValidPrepaymentOption = (option: string): option is PrepaymentOption => {
  return ['None', '1_Month', '2_Months', '3_Months', '6_Months', '9_Months', '11_Months'].includes(option);
};

export const isValidImageSizeAlias = (size: string): size is ImageSizeAlias => {
  return ['thumb', 'medium', 'full'].includes(size);
};

// Helper function to get primary display image
export const getPrimaryImageUrl = (property: Property, size: ImageSizeAlias = 'medium'): string | null => {
  // Priority 1: R2 images
  if (property.image_urls_full?.length) {
    return property.image_urls_full[0][size] || null;
  }
  
  // Priority 2: Legacy images
  if (property.image_urls?.length) {
    return property.image_urls[0] || null;
  }
  
  return null;
};

// Helper function to get best available image URL with fallbacks
export const getValidImageSrc = (imageUrls: ImageUrls, preferredSize: ImageSizeAlias = 'medium'): string | null => {
  if (!imageUrls) return null;
  
  // Try preferred size first, then fallback to others
  const sizePreferences = {
    'thumb': [imageUrls.thumb, imageUrls.medium, imageUrls.full],
    'medium': [imageUrls.medium, imageUrls.full, imageUrls.thumb],
    'full': [imageUrls.full, imageUrls.medium, imageUrls.thumb]
  };
  
  const urlsToTry = sizePreferences[preferredSize];
  
  for (const url of urlsToTry) {
    if (url && typeof url === 'string' && url.length > 0) {
      return url;
    }
  }
  
  return null;
};

// Helper function to extract all image URLs from a property
export const getAllPropertyImageUrls = (property: Property): string[] => {
  const urls: string[] = [];
  
  // Add R2 images
  if (property.image_urls_full?.length) {
    property.image_urls_full.forEach(imageSet => {
      urls.push(imageSet.thumb, imageSet.medium, imageSet.full);
    });
  }
  
  // Add legacy images
  if (property.image_urls?.length) {
    urls.push(...property.image_urls);
  }
  
  return Array.from(new Set(urls.filter(url => url && url.length > 0))); // Remove duplicates and empty strings
};

// Helper functions for form data conversion
export const convertFormDataToProperty = (formData: PropertyFormData): Partial<Property> => {
  const property: Partial<Property> = {
    title: formData.title,
    address: formData.address,
    price: parseFloat(formData.price) || 0,
    beds: parseInt(formData.beds) || 0,
    baths: parseFloat(formData.baths) || 0,
    type: formData.type,
    description: formData.description || undefined,
    
    // Extended fields
    city: formData.city || undefined,
    parking_included: formData.parking_included ? formData.parking_included === 'true' : undefined,
    parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : undefined,
    furnished: formData.furnished ? formData.furnished === 'true' : undefined,
    floor_number: formData.floor_number ? parseInt(formData.floor_number) : undefined,
    has_elevator: formData.has_elevator ? formData.has_elevator === 'true' : undefined,
    available_from: formData.available_from || undefined,
    renewable_contract: formData.renewable_contract ? formData.renewable_contract === 'true' : undefined,
    preferred_tenant_type: formData.preferred_tenant_type || undefined,
    utilities_included: formData.utilities_included ? formData.utilities_included === 'true' : undefined,
    prepayment_option: formData.prepayment_option || undefined,
    prepayment_price: formData.prepayment_price ? parseFloat(formData.prepayment_price) : undefined,
    features_amenities: formData.features_amenities ? 
      formData.features_amenities.split(',').map(f => f.trim()).filter(f => f.length > 0) : undefined,
    smoking_allowed: formData.smoking_allowed ? formData.smoking_allowed === 'true' : undefined,
    pets_allowed: formData.pets_allowed ? formData.pets_allowed === 'true' : undefined,
    max_occupancy: formData.max_occupancy ? parseInt(formData.max_occupancy) : undefined,
    instant_booking: formData.instant_booking ? formData.instant_booking === 'true' : undefined,
    property_visits_available: formData.property_visits_available ? formData.property_visits_available === 'true' : undefined,
  };

  return property;
};

export const convertPropertyToFormData = (property: Property): PropertyFormData => {
  return {
    title: property.title || '',
    address: property.address || '',
    price: property.price?.toString() || '',
    beds: property.beds?.toString() || '',
    baths: property.baths?.toString() || '',
    type: property.type || 'Apartment',
    description: property.description || '',
    
    // Extended fields
    city: property.city || '',
    parking_included: property.parking_included !== undefined ? property.parking_included.toString() : '',
    parking_spaces: property.parking_spaces?.toString() || '',
    furnished: property.furnished !== undefined ? property.furnished.toString() : '',
    floor_number: property.floor_number?.toString() || '',
    has_elevator: property.has_elevator !== undefined ? property.has_elevator.toString() : '',
    available_from: property.available_from || '',
    renewable_contract: property.renewable_contract !== undefined ? property.renewable_contract.toString() : '',
    preferred_tenant_type: property.preferred_tenant_type || '',
    utilities_included: property.utilities_included !== undefined ? property.utilities_included.toString() : '',
    prepayment_option: property.prepayment_option || '',
    prepayment_price: property.prepayment_price?.toString() || '',
    features_amenities: property.features_amenities?.join(', ') || '',
    smoking_allowed: property.smoking_allowed !== undefined ? property.smoking_allowed.toString() : '',
    pets_allowed: property.pets_allowed !== undefined ? property.pets_allowed.toString() : '',
    max_occupancy: property.max_occupancy?.toString() || '',
    instant_booking: property.instant_booking !== undefined ? property.instant_booking.toString() : '',
    property_visits_available: property.property_visits_available !== undefined ? property.property_visits_available.toString() : '',
  };
};

// Validation helper types
export interface ValidationRule<T = any> {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
}

export interface ValidationSchema {
  [field: string]: ValidationRule;
}

export interface ValidationResult {
  valid: boolean;
  errors: { [field: string]: string };
}

// Property validation schema - extended
export const PROPERTY_VALIDATION_SCHEMA: ValidationSchema = {
  title: {
    required: true,
    min: 5,
    max: 100
  },
  address: {
    required: true,
    min: 10,
    max: 200
  },
  price: {
    required: true,
    min: 0,
    max: 999999999
  },
  beds: {
    required: true,
    min: 0,
    max: 20
  },
  baths: {
    required: true,
    min: 0,
    max: 20
  },
  type: {
    required: true,
    custom: (value: string) => isValidPropertyType(value) ? null : 'Invalid property type'
  },
  description: {
    max: 2000
  },
  // Extended validations (all optional)
  city: {
    max: 100
  },
  parking_spaces: {
    min: 0,
    max: 50
  },
  floor_number: {
    min: -10,
    max: 200
  },
  prepayment_price: {
    min: 0,
    max: 999999999
  },
  max_occupancy: {
    min: 1,
    max: 50
  },
  preferred_tenant_type: {
    custom: (value: string) => value === '' || isValidTenantType(value) ? null : 'Invalid tenant type'
  },
  prepayment_option: {
    custom: (value: string) => value === '' || isValidPrepaymentOption(value) ? null : 'Invalid prepayment option'
  }
} as const;

// Export utility constants
export const PROPERTY_TYPES_ARRAY: readonly PropertyType[] = [
  'Apartment',
  'House', 
  'Condo',
  'Townhouse',
  'Villa'
] as const;

export const IMAGE_SIZE_ALIASES_ARRAY: readonly ImageSizeAlias[] = [
  'thumb',
  'medium',
  'full'
] as const;

// Property query result type for database operations
export interface PropertyQueryResult extends DatabaseProperty {}

// Property validation function - updated for extended fields
export const validateProperty = (data: any): { isValid: boolean; property?: Property; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data) {
    errors.push('Property data is required');
    return { isValid: false, errors };
  }
  
  // Validate required fields
  if (!data.id) errors.push('Property ID is required');
  if (!data.title) errors.push('Property title is required');
  if (!data.address) errors.push('Property address is required');
  if (typeof data.price !== 'number') errors.push('Property price must be a number');
  if (typeof data.beds !== 'number') errors.push('Number of beds must be a number');
  if (typeof data.baths !== 'number') errors.push('Number of baths must be a number');
  if (!isValidPropertyType(data.type)) errors.push('Invalid property type');
  
  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  
  // Convert to Property type with extended fields
  const property: Property = {
    id: data.id,
    title: data.title,
    address: data.address,
    price: data.price,
    beds: data.beds,
    baths: data.baths,
    type: data.type,
    description: data.description || undefined,
    lat: data.lat || undefined,
    lng: data.lng || undefined,
    
    // Extended fields
    city: data.city || undefined,
    parking_included: data.parking_included || undefined,
    parking_spaces: data.parking_spaces || undefined,
    furnished: data.furnished || undefined,
    floor_number: data.floor_number || undefined,
    has_elevator: data.has_elevator || undefined,
    available_from: data.available_from || undefined,
    renewable_contract: data.renewable_contract || undefined,
    preferred_tenant_type: data.preferred_tenant_type || undefined,
    utilities_included: data.utilities_included || undefined,
    prepayment_option: data.prepayment_option || undefined,
    prepayment_price: data.prepayment_price || undefined,
    features_amenities: data.features_amenities || undefined,
    smoking_allowed: data.smoking_allowed || undefined,
    pets_allowed: data.pets_allowed || undefined,
    max_occupancy: data.max_occupancy || undefined,
    instant_booking: data.instant_booking || undefined,
    property_visits_available: data.property_visits_available || undefined,
    
    image_urls_full: data.image_urls_full || undefined,
    image_urls: data.image_urls || undefined,
    created_at: data.created_at,
    updated_at: data.updated_at || undefined
  };
  
  return { isValid: true, property, errors: [] };
};