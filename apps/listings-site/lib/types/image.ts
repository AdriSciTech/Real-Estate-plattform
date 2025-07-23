// lib/types/image.ts
// ========================================
export interface ImageUrls {
  thumb: string;
  medium: string;
  full: string;
}

export interface ProcessingResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
  format: string;
  quality: number;
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

export interface ImageProcessingConfig {
  thumbWidth?: number;
  mediumWidth?: number;
  fullWidth?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  stripExif?: boolean;
  enableProgressive?: boolean;
}

// Image optimization hook interfaces
export interface UseOptimizedImagesOptions {
  preload?: boolean;
  priority?: boolean;
  preloadStage?: 'thumb' | 'medium' | 'full';
  lazy?: boolean;
  quality?: number;
}

export interface UseOptimizedImagesReturn {
  preloadImage: (imageUrls: ImageUrls, stage?: 'thumb' | 'medium' | 'full') => void;
  preloadImages: (images: ImageUrls[], stage?: 'thumb' | 'medium' | 'full') => void;
  preloadedCount: number;
  isLoading: boolean;
  error?: string;
}

// Image upload progress
export interface ImageUploadProgress {
  uploadedCount: number;
  totalCount: number;
  currentFileName?: string;
  isProcessing: boolean;
  isUploading: boolean;
  processingStage?: 'resizing' | 'compressing' | 'uploading' | 'complete';
  error?: string;
}

// R2 Configuration
export const R2_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_IMAGE_CDN || 'https://img.studentrentals.es',
  cloudflareTransform: 'https://studentrentals.es',
  uploadBaseUrl: process.env.R2_ENDPOINT || 'https://3f33a536db84337cebe3b036a4d7799c.r2.cloudflarestorage.com',
  bucket: process.env.R2_BUCKET || 'propertyphotos',
  
  imageResizing: {
    enabled: true,
    baseParams: '/cdn-cgi/image/',
    formats: ['webp', 'avif', 'auto'] as const,
    sizes: {
      thumb: 'width=300,height=200,fit=cover,quality=85,format=webp',
      medium: 'width=800,height=600,fit=cover,quality=90,format=webp',
      full: 'width=1920,height=1440,fit=cover,quality=95,format=webp',
      carousel: 'width=800,height=400,fit=cover,quality=90,format=webp',
      preload: 'width=400,height=250,fit=cover,quality=80,format=webp'
    }
  }
} as const;

// Utility functions
export const convertLegacyUrlToR2 = (url: string): string => {
  // If it's already a Cloudflare transform URL, return as-is
  if (url.includes('/cdn-cgi/image/')) {
    return url;
  }
  
  // Check for img.studentrentals.es (correct domain)
  if (url.includes('img.studentrentals.es')) {
    return url;
  }
  
  // Convert direct R2 URLs to use CDN domain
  if (url.includes('3f33a536db84337cebe3b036a4d7799c.r2.cloudflarestorage.com')) {
    const path = url.replace('https://3f33a536db84337cebe3b036a4d7799c.r2.cloudflarestorage.com/propertyphotos/', '');
    return `https://img.studentrentals.es/${path}`;
  }
  
  // Convert legacy pub-xxx URLs if they exist
  if (url.includes('pub-4ac2ecbe241249afa6c227aa82643057.r2.dev')) {
    const path = url.replace('https://pub-4ac2ecbe241249afa6c227aa82643057.r2.dev/', '');
    return `https://img.studentrentals.es/${path}`;
  }
  
  // Convert Supabase URLs (legacy support) - keep as-is since they're external
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    return url; // Keep original Supabase URL - can't optimize these
  }
  
  // If it's a relative path, convert it to R2
  if (!url.startsWith('http')) {
    const cleanPath = url.startsWith('/') ? url.slice(1) : url;
    return `https://img.studentrentals.es/${cleanPath}`;
  }
  
  // Otherwise, return as-is (external URL)
  return url;
};

export const generateR2ImageUrls = (imagePathOrUrl: string): ImageUrls => {
  // Convert to R2 URL first if needed
  const r2Url = convertLegacyUrlToR2(imagePathOrUrl);
  
  // If it's a Supabase URL, we can't use Cloudflare transforms
  if (r2Url.includes('supabase.co')) {
    return {
      thumb: r2Url,
      medium: r2Url,
      full: r2Url
    };
  }
  
  // Generate Cloudflare-optimized URLs for all sizes
  return {
    thumb: `https://studentrentals.es/cdn-cgi/image/width=300,height=200,fit=cover,quality=85,format=webp/${r2Url}`,
    medium: `https://studentrentals.es/cdn-cgi/image/width=800,height=600,fit=cover,quality=90,format=webp/${r2Url}`,
    full: `https://studentrentals.es/cdn-cgi/image/width=1920,height=1440,fit=cover,quality=95,format=webp/${r2Url}`
  };
};

export const getOptimizedImageUrl = (
  path: string, 
  size: 'thumb' | 'medium' | 'full' | 'carousel' | 'preload' = 'medium'
): string => {
  // If it's already a Cloudflare transform URL, return as-is
  if (path.includes('/cdn-cgi/image/')) {
    return path;
  }
  
  // If it's already a full URL (external), handle conversion
  if (path.startsWith('http')) {
    // Convert old R2 direct URLs to CDN domain
    if (path.includes('3f33a536db84337cebe3b036a4d7799c.r2.cloudflarestorage.com')) {
      const imagePath = path.replace(`${R2_CONFIG.uploadBaseUrl}/propertyphotos/`, '');
      const resizeParams = R2_CONFIG.imageResizing.sizes[size] || R2_CONFIG.imageResizing.sizes.medium;
      return `${R2_CONFIG.cloudflareTransform}${R2_CONFIG.imageResizing.baseParams}${resizeParams}/${R2_CONFIG.baseUrl}/${imagePath}`;
    }
    
    // Convert legacy pub-xxx URLs if they exist
    if (path.includes('pub-4ac2ecbe241249afa6c227aa82643057.r2.dev')) {
      const imagePath = path.replace('https://pub-4ac2ecbe241249afa6c227aa82643057.r2.dev/', '');
      const resizeParams = R2_CONFIG.imageResizing.sizes[size] || R2_CONFIG.imageResizing.sizes.medium;
      return `${R2_CONFIG.cloudflareTransform}${R2_CONFIG.imageResizing.baseParams}${resizeParams}/${R2_CONFIG.baseUrl}/${imagePath}`;
    }
    
    // Handle img.studentrentals.es URLs (correct domain)
    if (path.includes('img.studentrentals.es')) {
      const resizeParams = R2_CONFIG.imageResizing.sizes[size] || R2_CONFIG.imageResizing.sizes.medium;
      return `${R2_CONFIG.cloudflareTransform}${R2_CONFIG.imageResizing.baseParams}${resizeParams}/${path}`;
    }
    
    // Already optimized or external URL
    return path;
  }
  
  // Ensure path starts with forward slash for proper URL construction
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Use Cloudflare Image Resizing
  const resizeParams = R2_CONFIG.imageResizing.sizes[size] || R2_CONFIG.imageResizing.sizes.medium;
  return `${R2_CONFIG.cloudflareTransform}${R2_CONFIG.imageResizing.baseParams}${resizeParams}/${R2_CONFIG.baseUrl}/${normalizedPath}`;
};

// Type guards
export const isImageUrls = (obj: any): obj is ImageUrls => {
  return obj && 
         typeof obj === 'object' &&
         typeof obj.thumb === 'string' && 
         typeof obj.medium === 'string' && 
         typeof obj.full === 'string';
};

// Check if property has optimized images
export const hasOptimizedImages = (property: any): property is { image_urls_full: ImageUrls[] } => {
  return !!(property.image_urls_full && 
           Array.isArray(property.image_urls_full) && 
           property.image_urls_full.length > 0 &&
           property.image_urls_full.every((img: any) => isImageUrls(img)));
};

// Additional utility functions
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
    img.src = url;
  });
};

export const isOptimizedUrl = (url: string): boolean => {
  return url.includes('/cdn-cgi/image/') || url.includes('img.studentrentals.es');
};

export const getValidImageSrc = (
  imageUrls: ImageUrls | null | undefined, 
  preferredStage: 'thumb' | 'medium' | 'full' = 'medium'
): string | null => {
  if (!imageUrls) return null;
  
  const stages: (keyof ImageUrls)[] = preferredStage === 'thumb' 
    ? ['thumb', 'medium', 'full']
    : preferredStage === 'medium'
    ? ['medium', 'full', 'thumb']
    : ['full', 'medium', 'thumb'];

  for (const stage of stages) {
    const url = imageUrls[stage];
    if (typeof url === 'string' && url.length > 0) {
      try {
        new URL(url); // Validate URL
        return url;
      } catch {
        // If it's a relative URL, that's okay too
        if (url.startsWith('/')) return url;
        continue; // Try next URL if invalid
      }
    }
  }

  return null;
};
