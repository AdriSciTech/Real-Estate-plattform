// packages/supabase/src/storage.ts - File storage and image optimization
import { createClient } from './client';

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

// Upload file to Supabase Storage
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