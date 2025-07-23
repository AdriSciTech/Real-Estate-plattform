// packages/types/src/property.ts
// ================================
// Unified Property Types for Rental Platform
// Consolidates all three projects: listings-site, reservation-dashboard, upload-dashboard

// ===== CORE TYPES =====

export type PropertyType = 'Apartment' | 'House' | 'Condo' | 'Townhouse' | 'Villa' | 'Studio' | 'Loft';
export type TenantType = 'Family' | 'Student' | 'Professional' | 'Any';
export type PrepaymentOption = 'None' | '1_Month' | '2_Months' | '3_Months' | '6_Months' | '9_Months' | '11_Months';
export type PropertyStatus = 'available' | 'rented' | 'maintenance' | 'draft';

// ===== IMAGE INTERFACES =====

// Core R2 image structure
export interface ImageUrls {
  thumb: string;
  medium: string;
  full: string;
}

// Type guard for ImageUrls
export const isImageUrls = (obj: any): obj is ImageUrls => {
  return obj && 
         typeof obj === 'object' && 
         typeof obj.thumb === 'string' && 
         typeof obj.medium === 'string' && 
         typeof obj.full === 'string';
};

// Generate R2 URLs from base URL
export const generateR2ImageUrls = (baseUrl: string): ImageUrls => {
  return {
    thumb: `${baseUrl}?w=300&q=80`,
    medium: `${baseUrl}?w=800&q=85`,
    full: `${baseUrl}?w=1200&q=90`
  };
};

// ===== MAIN PROPERTY INTERFACE =====

/**
 * Unified Property interface that supports all three projects
 * - listings-site: flexible fields, R2 images, validation
 * - reservation-dashboard: legacy database structure
 * - upload-dashboard: extended property features, form handling
 */
export interface Property {
  // ===== REQUIRED FIELDS =====
  id: string;
  title: string;
  address: string;
  price: number;
  type: PropertyType;
  created_at: string;

  // ===== BASIC PROPERTY DETAILS =====
  // Support both naming conventions for smooth migration
  beds?: number;           // Primary field (listings-site, upload-dashboard)
  rooms?: number;          // Legacy field (reservation-dashboard)
  baths?: number;          // Primary field (listings-site, upload-dashboard)  
  bathrooms?: number;      // Legacy field (reservation-dashboard)
  description?: string;
  
  // ===== LOCATION DATA =====
  lat?: number;
  lng?: number;
  city?: string;
  
  // ===== PROPERTY CHARACTERISTICS =====
  area?: number;           // Primary field (listings-site, upload-dashboard)
  size?: string;           // Legacy field (reservation-dashboard)
  available?: boolean;     // Property availability status
  available_from?: string; // Date string for availability
  
  // ===== EXTENDED FEATURES (from upload-dashboard) =====
  parking_included?: boolean;
  parking_spaces?: number;
  furnished?: boolean;
  floor_number?: number;
  has_elevator?: boolean;
  renewable_contract?: boolean;
  preferred_tenant_type?: TenantType;
  utilities_included?: boolean;
  prepayment_option?: PrepaymentOption;
  prepayment_price?: number;
  smoking_allowed?: boolean;
  pets_allowed?: boolean;
  max_occupancy?: number;
  instant_booking?: boolean;
  property_visits_available?: boolean;
  
  // ===== AMENITIES AND FEATURES =====
  // Support both naming conventions
  features_amenities?: string[];  // Primary field (upload-dashboard)
  amenities?: string[];           // Legacy field (reservation-dashboard)
  
  // ===== IMAGE HANDLING =====
  // Support all image formats from the three projects
  images?: ImageUrls[];            // Primary: R2 optimized format (listings-site)
  image_urls?: string[];           // Legacy: Supabase URLs (all projects)
  image_urls_full?: ImageUrls[];   // R2 full format (upload-dashboard)
  optimized_images?: ImageUrls[];  // Alternative optimized format (listings-site)
  featuredImage?: ImageUrls;       // Single featured image (listings-site)
  imageCount?: number;             // Image count metadata (listings-site)
  has_optimized_images?: boolean;  // Processing status (listings-site)
  images_processing?: boolean;     // Processing status (listings-site)
  
  // ===== OWNERSHIP AND STATUS =====
  owner_id?: string;               // Property owner (reservation-dashboard)
  status?: PropertyStatus;         // Property status (reservation-dashboard)
  
  // ===== TIMESTAMPS =====
  updated_at?: string;
}

// ===== SPECIALIZED INTERFACES =====

/**
 * Minimal interface for property cards and listings
 * Contains only essential display fields
 */
export interface PropertyCardData {
  id: string;
  title: string;
  price: number;
  beds?: number;
  rooms?: number;      // Legacy support
  baths?: number;
  bathrooms?: number;  // Legacy support
  address?: string;
  images?: ImageUrls[];
  image_urls?: string[];
  type?: PropertyType;
}

/**
 * Display data interface (compatible with reservation-dashboard)
 * Used for property display components
 */
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
  beds?: number;
  baths?: number;
  type?: PropertyType;
}

/**
 * Database property interface with proper null handling
 * Represents how data comes from the database
 */
export interface DatabaseProperty {
  id: string;
  title: string;
  address: string;
  price: number;
  type: PropertyType;
  created_at: string;
  
  // Nullable fields as they come from database
  beds: number | null;
  rooms: number | null;
  baths: number | null;
  bathrooms: number | null;
  description: string | null;
  lat: number | null;
  lng: number | null;
  city: string | null;
  area: number | null;
  size: string | null;
  available: boolean | null;
  available_from: string | null;
  
  // Extended nullable fields
  parking_included: boolean | null;
  parking_spaces: number | null;
  furnished: boolean | null;
  floor_number: number | null;
  has_elevator: boolean | null;
  renewable_contract: boolean | null;
  preferred_tenant_type: TenantType | null;
  utilities_included: boolean | null;
  prepayment_option: PrepaymentOption | null;
  prepayment_price: number | null;
  smoking_allowed: boolean | null;
  pets_allowed: boolean | null;
  max_occupancy: number | null;
  instant_booking: boolean | null;
  property_visits_available: boolean | null;
  
  // Nullable arrays and complex fields
  features_amenities: string[] | null;
  amenities: string[] | null;
  images: string[] | null;
  image_urls: string[] | null;
  image_urls_full: ImageUrls[] | null;
  
  owner_id: string | null;
  status: PropertyStatus | null;
  updated_at: string | null;
}

// ===== UTILITY TYPES =====

// Type for property creation (excluding auto-generated fields)
export type PropertyCreate = Omit<Property, 'id' | 'created_at' | 'updated_at'>;

// Type for property updates (all fields optional except id)
export type PropertyUpdate = Partial<Omit<Property, 'id' | 'created_at'>>;

// ===== VALIDATION =====

export interface PropertyValidationResult {
  isValid: boolean;
  property?: Property;
  errors: string[];
}

// Type guards for validation
export const isValidPropertyType = (type: any): type is PropertyType => {
  const validTypes: PropertyType[] = ['Apartment', 'House', 'Condo', 'Townhouse', 'Villa', 'Studio', 'Loft'];
  return typeof type === 'string' && validTypes.includes(type as PropertyType);
};

export const isValidTenantType = (type: string): type is TenantType => {
  return ['Family', 'Student', 'Professional', 'Any'].includes(type);
};

export const isValidPrepaymentOption = (option: string): option is PrepaymentOption => {
  return ['None', '1_Month', '2_Months', '3_Months', '6_Months', '9_Months', '11_Months'].includes(option);
};

// ===== UTILITY FUNCTIONS =====

/**
 * Check if property has minimum data for display
 * Used by listings-site for property cards
 */
export const hasMinimumDisplayData = (property: Property): property is Property & PropertyCardData => {
  return !!(
    property.id &&
    property.title &&
    property.price !== undefined &&
    property.price !== null
  );
};

/**
 * Check if property has images in any format
 */
export const hasImages = (property: Property): boolean => {
  return !!(
    property.images?.length ||
    property.image_urls_full?.length ||
    property.optimized_images?.length ||
    property.image_urls?.length ||
    property.featuredImage
  );
};

/**
 * Get primary display image URL with fallbacks
 * Supports all image formats from the three projects
 */
export const getPrimaryImageUrl = (property: Property, size: 'thumb' | 'medium' | 'full' = 'medium'): string | null => {
  // Priority 1: R2 optimized images (listings-site primary format)
  if (property.images?.length) {
    return property.images[0][size] || null;
  }
  
  // Priority 2: R2 full images (upload-dashboard format)
  if (property.image_urls_full?.length) {
    return property.image_urls_full[0][size] || null;
  }
  
  // Priority 3: Optimized images (listings-site alternative)
  if (property.optimized_images?.length) {
    return property.optimized_images[0][size] || null;
  }
  
  // Priority 4: Featured image (listings-site)
  if (property.featuredImage) {
    return property.featuredImage[size] || null;
  }
  
  // Priority 5: Legacy images (all projects compatibility)
  if (property.image_urls?.length) {
    return property.image_urls[0] || null;
  }
  
  return null;
};

/**
 * Get property display data (compatible with reservation-dashboard)
 */
export const getPropertyDisplayData = (property: Property): PropertyDisplayData => {
  const primaryImageUrl = getPrimaryImageUrl(property, 'medium') || '/placeholder-property.jpg';
  
  return {
    id: property.id,
    title: property.title,
    address: property.address,
    price: property.price,
    primaryImage: {
      full: getPrimaryImageUrl(property, 'full') || primaryImageUrl,
      medium: primaryImageUrl,
      thumbnail: getPrimaryImageUrl(property, 'thumb') || primaryImageUrl
    },
    beds: property.beds || property.rooms, // Handle both field names
    baths: property.baths || property.bathrooms, // Handle both field names
    type: property.type
  };
};

/**
 * Get property card data for listings
 */
export const getPropertyCardData = (property: Property): PropertyCardData => {
  return {
    id: property.id,
    title: property.title,
    price: property.price,
    beds: property.beds,
    rooms: property.rooms, // Legacy support
    baths: property.baths,
    bathrooms: property.bathrooms, // Legacy support
    address: property.address,
    images: property.images || property.image_urls_full || property.optimized_images,
    image_urls: property.image_urls,
    type: property.type
  };
};

/**
 * Comprehensive property validation combining all three projects' approaches
 */
export const validateProperty = (data: any): PropertyValidationResult => {
  const errors: string[] = [];

  // Check if we have data
  if (!data) {
    errors.push('Property data is required');
    return { isValid: false, errors };
  }

  // Check required fields
  if (!data.id) errors.push('Property ID is required');
  if (!data.title || typeof data.title !== 'string') errors.push('Property title is required');
  if (!data.address || typeof data.address !== 'string') errors.push('Property address is required');
  if (typeof data.price !== 'number' || data.price < 0) errors.push('Valid price is required');
  if (!isValidPropertyType(data.type)) errors.push('Valid property type is required');

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Create normalized property object
  const property: Property = {
    id: String(data.id),
    title: String(data.title),
    address: String(data.address),
    price: Number(data.price),
    type: data.type as PropertyType,
    created_at: data.created_at || new Date().toISOString(),
    
    // Normalize bed/room fields (handle both naming conventions)
    beds: typeof data.beds === 'number' ? data.beds : 
          typeof data.rooms === 'number' ? data.rooms : 
          (data.beds ? Number(data.beds) : (data.rooms ? Number(data.rooms) : undefined)),
    rooms: typeof data.rooms === 'number' ? data.rooms : undefined, // Keep legacy field
    
    // Normalize bath/bathroom fields
    baths: typeof data.baths === 'number' ? data.baths : 
           typeof data.bathrooms === 'number' ? data.bathrooms : 
           (data.baths ? Number(data.baths) : (data.bathrooms ? Number(data.bathrooms) : undefined)),
    bathrooms: typeof data.bathrooms === 'number' ? data.bathrooms : undefined, // Keep legacy field
    
    // Optional fields with type conversion
    description: data.description ? String(data.description) : undefined,
    lat: typeof data.lat === 'number' ? data.lat : (data.lat ? Number(data.lat) : undefined),
    lng: typeof data.lng === 'number' ? data.lng : (data.lng ? Number(data.lng) : undefined),
    city: data.city ? String(data.city) : undefined,
    
    // Area/size normalization
    area: typeof data.area === 'number' ? data.area : 
          typeof data.size === 'string' ? parseInt(data.size) : 
          (data.area ? Number(data.area) : (data.size ? parseInt(String(data.size)) : undefined)),
    size: typeof data.size === 'string' ? data.size : undefined, // Keep legacy field
    
    // Boolean fields
    available: typeof data.available === 'boolean' ? data.available : (data.status === 'available'),
    parking_included: typeof data.parking_included === 'boolean' ? data.parking_included : undefined,
    furnished: typeof data.furnished === 'boolean' ? data.furnished : undefined,
    has_elevator: typeof data.has_elevator === 'boolean' ? data.has_elevator : undefined,
    renewable_contract: typeof data.renewable_contract === 'boolean' ? data.renewable_contract : undefined,
    utilities_included: typeof data.utilities_included === 'boolean' ? data.utilities_included : undefined,
    smoking_allowed: typeof data.smoking_allowed === 'boolean' ? data.smoking_allowed : undefined,
    pets_allowed: typeof data.pets_allowed === 'boolean' ? data.pets_allowed : undefined,
    instant_booking: typeof data.instant_booking === 'boolean' ? data.instant_booking : undefined,
    property_visits_available: typeof data.property_visits_available === 'boolean' ? data.property_visits_available : undefined,
    
    // Number fields with conversion
    parking_spaces: typeof data.parking_spaces === 'number' ? data.parking_spaces : (data.parking_spaces ? Number(data.parking_spaces) : undefined),
    floor_number: typeof data.floor_number === 'number' ? data.floor_number : (data.floor_number ? Number(data.floor_number) : undefined),
    prepayment_price: typeof data.prepayment_price === 'number' ? data.prepayment_price : (data.prepayment_price ? Number(data.prepayment_price) : undefined),
    max_occupancy: typeof data.max_occupancy === 'number' ? data.max_occupancy : (data.max_occupancy ? Number(data.max_occupancy) : undefined),
    
    // String fields with validation
    available_from: data.available_from ? String(data.available_from) : undefined,
    preferred_tenant_type: isValidTenantType(data.preferred_tenant_type) ? data.preferred_tenant_type : undefined,
    prepayment_option: isValidPrepaymentOption(data.prepayment_option) ? data.prepayment_option : undefined,
    
    // Array fields (handle both naming conventions)
    features_amenities: Array.isArray(data.features_amenities) ? data.features_amenities : 
                       Array.isArray(data.amenities) ? data.amenities : undefined,
    amenities: Array.isArray(data.amenities) ? data.amenities : undefined, // Keep legacy field
    
    // Image handling - support all formats with fallbacks
    images: Array.isArray(data.images) ? data.images.filter(isImageUrls) : undefined,
    image_urls: Array.isArray(data.image_urls) ? data.image_urls.filter((url: any) => typeof url === 'string') : 
               Array.isArray(data.images) ? data.images.filter((url: any) => typeof url === 'string') : undefined,
    image_urls_full: Array.isArray(data.image_urls_full) ? data.image_urls_full.filter(isImageUrls) : undefined,
    optimized_images: Array.isArray(data.optimized_images) ? data.optimized_images.filter(isImageUrls) : undefined,
    featuredImage: isImageUrls(data.featuredImage) ? data.featuredImage : undefined,
    imageCount: typeof data.imageCount === 'number' ? data.imageCount : undefined,
    has_optimized_images: typeof data.has_optimized_images === 'boolean' ? data.has_optimized_images : undefined,
    images_processing: typeof data.images_processing === 'boolean' ? data.images_processing : undefined,
    
    // Ownership and status
    owner_id: data.owner_id ? String(data.owner_id) : undefined,
    status: data.status === 'available' || data.status === 'rented' || data.status === 'maintenance' || data.status === 'draft' ? data.status : undefined,
    
    // Timestamps
    updated_at: data.updated_at || undefined
  };

  return { isValid: true, property, errors: [] };
};

// ===== LEGACY COMPATIBILITY =====

/**
 * Legacy database interface for reservation-dashboard compatibility
 */
export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          title: string;
          description: string;
          address: string;
          city: string;
          price: number;
          rooms: number;
          bathrooms: number;
          size: string;
          images: string[];
          amenities: string[];
          owner_id: string;
          status: 'available' | 'rented' | 'maintenance';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['properties']['Insert']>;
      };
    };
  };
}

/**
 * Legacy validation for reservation-dashboard compatibility
 */
export const validatePropertyLegacy = (data: any): { isValid: boolean; property?: Database['public']['Tables']['properties']['Row']; errors?: string[] } => {
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

  // Cast to legacy Property type if valid
  const property: Database['public']['Tables']['properties']['Row'] = {
    id: data.id,
    title: data.title,
    description: data.description || '',
    address: data.address,
    city: data.city || '',
    price: data.price,
    rooms: data.rooms || data.beds || 0, // Handle both field names
    bathrooms: data.bathrooms || data.baths || 0, // Handle both field names
    size: data.size || data.area?.toString() || '', // Handle both field names
    images: data.images || data.image_urls || [],
    amenities: data.amenities || data.features_amenities || [],
    owner_id: data.owner_id || '',
    status: data.status || 'available',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString()
  };

  return { isValid: true, property };
};