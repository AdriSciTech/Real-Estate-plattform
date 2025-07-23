// packages/shared-lib/src/supabase.ts
// Enhanced unified Supabase client combining best features from both projects

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Property } from './property';

// Singleton instances to prevent multiple client creation
let clientInstance: SupabaseClient | null = null;
let serverInstance: SupabaseClient | null = null;

// Enhanced configuration interface
interface SupabaseConfig {
  auth?: {
    persistSession?: boolean;
    autoRefreshToken?: boolean;
    detectSessionInUrl?: boolean;
  };
  headers?: Record<string, string>;
}

// Create client function that handles environment variables safely
export const createClient = (config: SupabaseConfig = {}) => {
  // Return existing instance if available
  if (clientInstance) {
    return clientInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase environment variables not found:', {
      url: !!supabaseUrl,
      key: !!supabaseKey
    });
    return null;
  }

  try {
    clientInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: typeof window !== 'undefined',
        detectSessionInUrl: typeof window !== 'undefined',
        ...config.auth
      },
      global: {
        headers: {
          'x-client-info': 'rental-platform@1.0.0',
          ...config.headers
        }
      }
    });
    
    return clientInstance;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
};

// For server-side usage - enhanced with better error handling
export const createServerClient = (config: SupabaseConfig = {}) => {
  // Return existing server instance if available
  if (serverInstance) {
    return serverInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables not found for server client');
    return null;
  }

  try {
    serverInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        ...config.auth
      },
      global: {
        headers: {
          'x-client-info': 'rental-platform-server@1.0.0',
          ...config.headers
        }
      }
    });

    return serverInstance;
  } catch (error) {
    console.error('Failed to create Supabase server client:', error);
    return null;
  }
};

// Legacy SupabaseProperty interface for backward compatibility
export interface SupabaseProperty {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  displayPrice?: string;
  priceFrequency?: string;
  rooms: number;
  bathrooms: number;
  size?: string;
  imageUrl: string;
  images?: string[];
  availability?: string;
  depositAmount?: number;
  utilitiesIncluded?: boolean;
  furnished?: boolean;
  description?: string;
  amenities?: string[];
  nearbyPlaces?: string[];
  created_at?: string;
  updated_at?: string;
}

// Enhanced image optimization with more options
export const getOptimizedImageUrl = (
  bucket: string, 
  path: string, 
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png' | 'avif';
    resize?: 'cover' | 'contain' | 'fill';
  } = {}
): string => {
  if (!path) return '/placeholder-property.jpg';
  
  const { 
    width = 800, 
    height, 
    quality = 80, 
    format = 'webp',
    resize = 'cover'
  } = options;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return path;
  
  // Build transformation URL for Supabase Storage
  const baseUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
  
  // Add transformation parameters
  const params = new URLSearchParams();
  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  if (quality) params.append('quality', quality.toString());
  if (format) params.append('format', format);
  if (resize) params.append('resize', resize);
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

// Enhanced image URL optimization with more size options
export const optimizeImageUrl = (
  url: string, 
  size: 'thumb' | 'medium' | 'large' | 'full' = 'medium'
): string => {
  if (!url || url === '/placeholder-property.jpg') return url;
  
  // Configuration for different sizes
  const sizeConfig = {
    thumb: { width: 300, quality: 75, format: 'webp' as const },
    medium: { width: 800, quality: 82, format: 'webp' as const },
    large: { width: 1200, quality: 85, format: 'webp' as const },
    full: { width: 1600, quality: 88, format: 'webp' as const }
  };
  
  const config = sizeConfig[size];
  
  // If it's already a Supabase storage URL, add optimization parameters
  if (url.includes('supabase.co/storage') || url.includes('/storage/v1/')) {
    try {
      const urlObj = new URL(url);
      
      // Only add params if they don't already exist
      if (!urlObj.searchParams.has('width')) {
        urlObj.searchParams.set('width', config.width.toString());
      }
      if (!urlObj.searchParams.has('quality')) {
        urlObj.searchParams.set('quality', config.quality.toString());
      }
      if (!urlObj.searchParams.has('format')) {
        urlObj.searchParams.set('format', config.format);
      }
      
      return urlObj.toString();
    } catch (error) {
      console.warn('Failed to optimize image URL:', error);
      return url;
    }
  }
  
  return url;
};

// Enhanced property fetching with better type support
export async function getProperties(options: {
  limit?: number;
  exclude?: string;
  type?: string;
  priceRange?: { min: number; max: number };
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  location?: string;
  page?: number;
  sortBy?: 'price' | 'created_at' | 'title';
  sortOrder?: 'asc' | 'desc';
} = {}) {
  const {
    limit = 10,
    exclude,
    type,
    priceRange,
    minPrice,
    maxPrice,
    beds,
    baths,
    location,
    page = 1,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = options;

  try {
    const supabase = createServerClient();
    
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply filters
    if (exclude) {
      query = query.neq('id', exclude);
    }
    
    if (type) {
      query = query.eq('type', type);
    }
    
    if (location) {
      query = query.or(`address.ilike.%${location}%,city.ilike.%${location}%,description.ilike.%${location}%`);
    }
    
    if (beds) {
      query = query.gte('beds', beds);
    }
    
    if (baths) {
      query = query.gte('baths', baths);
    }
    
    // Handle price filtering with better logic
    const minPriceValue = minPrice || priceRange?.min;
    const maxPriceValue = maxPrice || priceRange?.max;
    
    if (minPriceValue !== undefined) {
      query = query.gte('price', minPriceValue);
    }
    
    if (maxPriceValue !== undefined) {
      query = query.lte('price', maxPriceValue);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;
    query = query.range(startIndex, endIndex);

    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      hasMore: (count || 0) > page * limit
    };
  } catch (error) {
    console.error('Error fetching properties from Supabase:', error);
    throw error;
  }
}

// New: Get single property by ID
export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    const supabase = createServerClient();
    
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching property by ID:', error);
    return null;
  }
}

// New: Upload file to Supabase Storage
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  } = {}
) {
  try {
    const supabase = createClient();
    
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: options.cacheControl || '3600',
        contentType: options.contentType || file.type,
        upsert: options.upsert || false
      });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error uploading file to Supabase:', error);
    throw error;
  }
}

// Reset instances (useful for testing or hot reload)
export const resetClientInstances = () => {
  clientInstance = null;
  serverInstance = null;
};

// Legacy compatibility - export the simpler version for upload dashboard
export const resetSupabaseClient = resetClientInstances;

// Export types for easier importing
export type { SupabaseClient };
export type SupabaseResponse<T> = {
  data: T | null;
  error: any;
  count?: number;
};

// Default export for convenience
export default createClient;