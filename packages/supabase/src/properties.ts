// packages/supabase/src/properties.ts - Property-specific database operations
import { createServerClient } from './client';
import type { Property } from '@rental/types';

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

// Get single property by ID
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