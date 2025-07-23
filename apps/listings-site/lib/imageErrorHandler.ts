// utils/imageErrorHandler.ts - Handle Supabase storage errors gracefully
export interface ImageRetryConfig {
  maxRetries: number;
  retryDelay: number;
  timeoutMs: number;
}

const defaultConfig: ImageRetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  timeoutMs: 10000
};

export class ImageLoadError extends Error {
  constructor(
    message: string,
    public url: string,
    public retryCount: number = 0
  ) {
    super(message);
    this.name = 'ImageLoadError';
  }
}

// Smart image loader with retry logic and error handling
export const loadImageWithRetry = async (
  url: string, 
  config: Partial<ImageRetryConfig> = {}
): Promise<HTMLImageElement> => {
  const { maxRetries, retryDelay, timeoutMs } = { ...defaultConfig, ...config };
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const img = await loadImageWithTimeout(url, timeoutMs);
      
      // Success! Log if this was a retry
      if (attempt > 0) {
        console.log(`✅ Image loaded successfully after ${attempt} retries: ${url}`);
      }
      
      return img;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Log the error
      console.warn(`❌ Image load attempt ${attempt + 1}/${maxRetries + 1} failed for: ${url}`, {
        error: lastError.message,
        isQuicError: lastError.message.includes('QUIC'),
        isTimeoutError: lastError.message.includes('timeout')
      });
      
      // Don't wait after the last attempt
      if (attempt < maxRetries) {
        // Exponential backoff with jitter
        const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // For QUIC errors, try a slightly different URL to force a new connection
        if (lastError.message.includes('QUIC') && url.includes('supabase.co')) {
          url = addCacheBuster(url);
        }
      }
    }
  }
  
  // All retries failed
  throw new ImageLoadError(
    `Failed to load image after ${maxRetries + 1} attempts: ${lastError?.message}`,
    url,
    maxRetries
  );
};

// Load image with timeout
const loadImageWithTimeout = (url: string, timeoutMs: number): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let timeoutId: NodeJS.Timeout;
    
    const cleanup = () => {
      clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };
    
    img.onload = () => {
      cleanup();
      resolve(img);
    };
    
    img.onerror = () => {
      cleanup();
      reject(new Error(`Failed to load image: ${url}`));
    };
    
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Image load timeout after ${timeoutMs}ms: ${url}`));
    }, timeoutMs);
    
    // Start loading
    img.src = url;
  });
};

// Add cache buster to URL for QUIC errors
const addCacheBuster = (url: string): string => {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('cb', Date.now().toString());
    return urlObj.toString();
  } catch {
    // If URL parsing fails, just append timestamp
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}cb=${Date.now()}`;
  }
};

// React hook for smart image loading
import { useState, useEffect, useCallback } from 'react';

export const useSmartImageLoader = (url: string | null, config?: Partial<ImageRetryConfig>) => {
  const [state, setState] = useState<{
    src: string | null;
    isLoading: boolean;
    error: ImageLoadError | null;
    retryCount: number;
  }>({
    src: null,
    isLoading: false,
    error: null,
    retryCount: 0
  });
  
  const loadImage = useCallback(async (imageUrl: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await loadImageWithRetry(imageUrl, config);
      setState(prev => ({ 
        ...prev, 
        src: imageUrl, 
        isLoading: false, 
        error: null 
      }));
    } catch (error) {
      const imageError = error instanceof ImageLoadError ? error : 
        new ImageLoadError('Unknown error', imageUrl);
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: imageError,
        retryCount: imageError.retryCount
      }));
    }
  }, [config]);
  
  useEffect(() => {
    if (url) {
      loadImage(url);
    } else {
      setState({ src: null, isLoading: false, error: null, retryCount: 0 });
    }
  }, [url, loadImage]);
  
  const retry = useCallback(() => {
    if (url) {
      loadImage(url);
    }
  }, [url, loadImage]);
  
  return {
    ...state,
    retry
  };
};

// Fallback image URLs for different scenarios
export const FALLBACK_IMAGES = {
  property: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f3f4f6"/><text x="200" y="150" text-anchor="middle" fill="%236b7280" font-family="system-ui" font-size="14">Property Image</text></svg>',
  thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23f3f4f6"/><text x="100" y="75" text-anchor="middle" fill="%236b7280" font-family="system-ui" font-size="12">Thumbnail</text></svg>',
  avatar: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23f3f4f6"/><text x="50" y="55" text-anchor="middle" fill="%236b7280" font-family="system-ui" font-size="10">👤</text></svg>'
};

// Get appropriate fallback image
export const getFallbackImage = (type: keyof typeof FALLBACK_IMAGES = 'property'): string => {
  return FALLBACK_IMAGES[type];
};