import { PropertyType } from '../property';

// Keep unique detailed search interfaces
export interface PropertySearchFilter {
  // Location (more detailed than property.ts version)
  location?: string;
  city?: string;
  radius?: number;
  lat?: number;
  lng?: number;
  
  // Property criteria (enhanced version)
  type?: PropertyType | PropertyType[];
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  minArea?: number;
  maxArea?: number;
  
  // Features (more comprehensive than property.ts)
  furnished?: boolean;
  petsAllowed?: boolean;
  parking?: boolean;
  available?: boolean;
  hasImages?: boolean;
  
  // Dates (unique to this file)
  moveInDate?: string;
  
  // Metadata
  propertyId?: string;
}

// Sort options (keep - more detailed than property.ts)
export type PropertySortField = 'price' | 'created_at' | 'updated_at' | 'beds' | 'baths' | 'area';
export type SortOrder = 'asc' | 'desc';

export interface SortOption {
  field: PropertySortField;
  order: SortOrder;
  label: string;
}

export interface SearchRequest extends PropertySearchFilter {
  page?: number;
  limit?: number;
  sortBy?: PropertySortField;
  sortOrder?: SortOrder;
}

// REMOVE: GeocodeResult (already exists in property.ts as GeocodeResult)
// Keep the constants - they're useful
export const SORT_OPTIONS: SortOption[] = [
  { field: 'price', order: 'asc', label: 'Price: Low to High' },
  { field: 'price', order: 'desc', label: 'Price: High to Low' },
  { field: 'created_at', order: 'desc', label: 'Newest First' },
  { field: 'created_at', order: 'asc', label: 'Oldest First' },
  { field: 'beds', order: 'desc', label: 'Most Bedrooms' },
  { field: 'area', order: 'desc', label: 'Largest First' },
];

