import { ImageUrls, ProcessingResult } from './image';

// Image upload responses (not covered in property.ts)
export interface ImageUploadResponse {
  success: boolean;
  imageUrls?: ImageUrls[];
  error?: string;
  processingTime?: number;
  totalSize?: number;
  compressionStats?: ProcessingResult[];
}

// Raw Supabase query result (before transformation to Property)
export interface PropertyQueryResult {
  id: string;
  title?: string | null;
  address?: string | null;
  price?: number | null;
  beds?: number | null;
  baths?: number | null;
  type?: string | null;
  description?: string | null;
  lat?: number | null;
  lng?: number | null;
  area?: number | null;
  available?: boolean | null;
  image_urls?: string[] | null;
  image_urls_full?: any | null;
  optimized_images?: any | null;
  has_optimized_images?: boolean | null;
  images_processing?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  image_count?: number | null;
  featured_image?: any | null;
  [key: string]: any;
}