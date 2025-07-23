// lib/supabase.ts - Complete version with server/client support
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Singleton instances to prevent multiple client creation
let clientInstance: ReturnType<typeof createSupabaseClient> | null = null;
let serverInstance: ReturnType<typeof createSupabaseClient> | null = null;

// Create client function that handles environment variables safely
export const createClient = () => {
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
        persistSession: typeof window !== 'undefined', // Only persist session on client side
        autoRefreshToken: typeof window !== 'undefined',
        detectSessionInUrl: typeof window !== 'undefined'
      },
      global: {
        headers: {
          'x-client-info': 'rental-platform@1.0.0'
        }
      }
    });
    
    return clientInstance;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
};

// Type for the property data from Supabase
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


// For server-side usage - modified to not throw errors
export const createServerClient = () => {
  // Return existing server instance if available
  if (serverInstance) {
    return serverInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables not found for server client, will use mock data');
    return null; // Return null instead of throwing
  }

  try {
    serverInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'x-client-info': 'rental-platform-server@1.0.0'
        }
      }
    });

    return serverInstance;
  } catch (error) {
    console.error('Failed to create Supabase server client:', error);
    return null; // Return null instead of throwing to allow graceful fallback
  }
};

// Helper function to get optimized image URL from Supabase Storage
export const getOptimizedImageUrl = (
  bucket: string, 
  path: string, 
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'jpg' | 'png'
  } = {}
): string => {
  if (!path) return '/placeholder-property.jpg'
  
  const { width = 800, height, quality = 80, format = 'webp' } = options
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return path;
  
  // Build transformation URL for Supabase Storage
  const baseUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
  
  // Add transformation parameters if supported
  const params = new URLSearchParams()
  if (width) params.append('width', width.toString())
  if (height) params.append('height', height.toString())
  if (quality) params.append('quality', quality.toString())
  if (format) params.append('format', format)
  
  const queryString = params.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

// Image URL optimization helper
export const optimizeImageUrl = (url: string, size: 'thumb' | 'medium' | 'full' = 'medium'): string => {
  if (!url || url === '/placeholder-property.jpg') return url
  
  // Configuration for different sizes
  const sizeConfig = {
    thumb: { width: 400, quality: 75 },
    medium: { width: 800, quality: 82 },
    full: { width: 1400, quality: 88 }
  }
  
  const config = sizeConfig[size]
  
  // If it's already a Supabase storage URL, try to add optimization parameters
  if (url.includes('supabase.co/storage')) {
    try {
      const urlObj = new URL(url)
      
      // Only add params if they don't already exist
      if (!urlObj.searchParams.has('width')) {
        urlObj.searchParams.set('width', config.width.toString())
      }
      if (!urlObj.searchParams.has('quality')) {
        urlObj.searchParams.set('quality', config.quality.toString())
      }
      if (!urlObj.searchParams.has('format')) {
        urlObj.searchParams.set('format', 'webp')
      }
      
      return urlObj.toString()
    } catch (error) {
      console.warn('Failed to optimize image URL:', error)
      return url // Return original if URL parsing fails
    }
  }
  
  return url
}

// Helper function for getting properties - can be used by server components
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
    page = 1
  } = options;

  try {
    const supabase = createServerClient();
    
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (exclude) {
      query = query.neq('id', exclude);
    }
    
    if (type) {
      query = query.eq('type', type);
    }
    
    if (location) {
      query = query.or(`address.ilike.%${location}%,description.ilike.%${location}%`);
    }
    
    if (beds) {
      query = query.gte('beds', beds);
    }
    
    if (baths) {
      query = query.gte('baths', baths);
    }
    
    if (minPrice || priceRange?.min) {
      const min = minPrice || priceRange?.min;
      if (min) query = query.gte('price', min);
    }
    
    if (maxPrice || priceRange?.max) {
      const max = maxPrice || priceRange?.max;
      if (max) query = query.lte('price', max);
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
      totalPages: Math.ceil((count || 0) / limit)
    };
  } catch (error) {
    console.error('Error fetching properties from Supabase:', error);
    throw error;
  }
}

// Reset instances (useful for testing or hot reload)
export const resetClientInstances = () => {
  clientInstance = null;
  serverInstance = null;
}