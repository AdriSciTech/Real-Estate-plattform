// my-app\components\OptimizedImage\OptimizedImage.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ImageUrls } from '@/lib/types';

interface OptimizedImageProps {
  imageUrls: ImageUrls;
  alt: string;
  className?: string;
  priority?: boolean; // For above-the-fold images
  lazy?: boolean; // Enable lazy loading
  placeholder?: 'blur' | 'empty' | 'skeleton';
  sizes?: string; // Responsive sizes
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  imageUrls,
  alt,
  className = '',
  priority = false,
  lazy = true,
  placeholder = 'blur',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(!lazy || priority);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !lazy) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image comes into view
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority]);

  // Progressive image loading: thumbnail -> medium -> full
  useEffect(() => {
    if (!isInView) return;

    const loadImage = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = src;
      });
    };

    const loadProgressive = async () => {
      try {
        // Start with thumbnail for instant display
        setCurrentSrc(imageUrls.thumb);
        await loadImage(imageUrls.thumb);
        
        // Load medium quality
        await loadImage(imageUrls.medium);
        setCurrentSrc(imageUrls.medium);
        
        // Finally load full quality
        await loadImage(imageUrls.full);
        setCurrentSrc(imageUrls.full);
        setIsLoaded(true);
        onLoad?.();
      } catch (error) {
        setIsError(true);
        onError?.();
      }
    };

    loadProgressive();
  }, [isInView, imageUrls, onLoad, onError]);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleImageError = useCallback(() => {
    setIsError(true);
    onError?.();
  }, [onError]);

  // Generate WebP srcSet with fallbacks
  const generateSrcSet = () => {
    return `
      ${imageUrls.thumb} 400w,
      ${imageUrls.medium} 800w,
      ${imageUrls.full} 1400w
    `.trim();
  };

  const baseClasses = `
    transition-all duration-300 ease-in-out
    ${isLoaded ? 'opacity-100' : 'opacity-0'}
    ${className}
  `;

  if (isError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    );
  }

  if (!isInView && lazy && !priority) {
    return (
      <div 
        ref={imgRef}
        className={`bg-gray-100 ${className}`}
        style={{ aspectRatio: '16/9' }}
      >
        {placeholder === 'skeleton' && <ImageSkeleton />}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.4'%3E%3Cpath d='m0 40 40-40h-40z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      )}
      
      {/* Main optimized image */}
      <img
        ref={imgRef}
        src={currentSrc}
        srcSet={generateSrcSet()}
        sizes={sizes}
        alt={alt}
        className={baseClasses}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          aspectRatio: '16/9',
          objectFit: 'cover',
          width: '100%',
          height: 'auto'
        }}
      />
      
      {/* Loading indicator */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

// Skeleton loading component
const ImageSkeleton: React.FC = () => (
  <div className="animate-pulse bg-gray-200 w-full h-full flex items-center justify-center">
    <svg 
      className="w-12 h-12 text-gray-400" 
      fill="currentColor" 
      viewBox="0 0 20 20"
    >
      <path 
        fillRule="evenodd" 
        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
        clipRule="evenodd" 
      />
    </svg>
  </div>
);

// Enhanced image processing with modern optimizations
