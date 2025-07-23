// lib/imageOptimization.ts - Enhancements for your existing R2 system

/**
 * Generate optimized image URLs for different use cases
 * Builds on your existing R2 + Cloudflare setup
 */
export function getOptimizedImageUrls(baseR2Url: string) {
  return {
    // Property card thumbnails
    cardThumb: `${baseR2Url}?width=300&height=200&fit=cover&quality=80&format=webp`,
    
    // Property card hover states  
    cardMedium: `${baseR2Url}?width=600&height=400&fit=cover&quality=85&format=webp`,
    
    // Property detail hero
    detailHero: `${baseR2Url}?width=1200&height=800&fit=cover&quality=90&format=webp`,
    
    // Mobile optimized
    mobile: `${baseR2Url}?width=400&height=300&fit=cover&quality=80&format=webp`,
    
    // High DPI displays
    retina: `${baseR2Url}?width=1600&height=1200&fit=cover&quality=85&format=webp`,
    
    // Lazy loading placeholders (tiny, blurred)
    placeholder: `${baseR2Url}?width=20&height=15&fit=cover&quality=20&blur=10&format=webp`,
  };
}

/**
 * Enhanced srcSet generation for responsive images
 */
export function generateResponsiveSrcSet(baseR2Url: string): string {
  const sizes = [400, 600, 800, 1200, 1600];
  
  return sizes
    .map(width => {
      const height = Math.round((width * 3) / 4); // 4:3 aspect ratio
      return `${baseR2Url}?width=${width}&height=${height}&fit=cover&quality=85&format=webp ${width}w`;
    })
    .join(', ');
}

/**
 * Generate blur data URL for smooth loading
 */
export function generateBlurDataURL(baseR2Url: string): string {
  // Create a tiny, blurred version for smooth loading transitions
  const tinyBlurred = `${baseR2Url}?width=10&height=8&fit=cover&quality=10&blur=10&format=webp`;
  
  // Convert to base64 data URL (you'd implement this based on your needs)
  return `data:image/webp;base64,${btoa(tinyBlurred)}`;
}