// @rental/core - Most commonly used exports
// This package contains the 80% of functionality used by 80% of your code

// ===== TYPES (most commonly used) =====
export type { 
  Property, 
  PropertyType, 
  PropertyCardData,
  PropertyDisplayData,
  TenantType,
  PropertyStatus 
} from '@rental/types';

// Type utilities
export { 
  validateProperty,
  hasMinimumDisplayData,
  getPrimaryImageUrl,
  getPropertyDisplayData 
} from '@rental/types';

// ===== SUPABASE (core database functions) =====
export { 
  createClient,
  createServerClient,
  getProperties,
  getPropertyById
} from '@rental/supabase';

// Basic image optimization
export { 
  optimizeImageUrl,
  getOptimizedImageUrl 
} from '@rental/supabase';

// ===== GOOGLE MAPS (core functions) =====
export { 
  loadGoogleMaps,
  geocodeAddress,
  calculateDistance 
} from '@rental/google-maps';

// ===== RE-EXPORT PACKAGES for specific needs =====
// This allows: import { uploadFile } from '@rental/core/supabase'
export * as Supabase from '@rental/supabase';
export * as GoogleMaps from '@rental/google-maps';
export * as Types from '@rental/types';