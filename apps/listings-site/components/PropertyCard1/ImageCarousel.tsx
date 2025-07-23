// components/PropertyCard/ImageCarousel.tsx - Alternative Version with Image Handling
"use client";

import { useState, useCallback } from "react";
import { getOptimizedImageUrls } from '@rental/image-handling';

interface ImageCarouselProps {
  imagePaths: string[];
  propertyTitle?: string;
  className?: string;
  priority?: boolean;
}

export default function ImageCarousel({ 
  imagePaths, 
  propertyTitle = "Property",
  className = "",
  priority = false
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Limit to 5 images max
  const images = imagePaths.slice(0, 5);
  const hasMultipleImages = images.length > 1;

  // Navigation
  const goToPrevious = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const goToSlide = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(index);
  }, []);

  // Handle image errors
  const handleImageError = useCallback((index: number) => {
    console.error('Image failed to load:', images[index]);
    setImageErrors(prev => new Set([...prev, index]));
  }, [images]);

  // Placeholder for missing/error images
  const ImagePlaceholder = () => (
    <div className="w-full h-52 bg-gray-200 flex items-center justify-center">
      <div className="text-center text-gray-400">
        <div className="text-3xl mb-1">🏠</div>
        <div className="text-xs">No image available</div>
      </div>
    </div>
  );

  // No images case
  if (images.length === 0) {
    return (
      <div className={`relative w-full h-52 overflow-hidden ${className}`}>
        <ImagePlaceholder />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-52 overflow-hidden group ${className}`}>
      {/* Images Container */}
      <div 
        className="flex h-full transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((imagePath, index) => {
          // FIX: Use the image-handling function which generates multiple sizes
          const optimizedUrls = getOptimizedImageUrls(imagePath);
          const optimizedUrl = optimizedUrls.cardMedium; // Perfect for property cards
          
          const hasError = imageErrors.has(index);

          // Debug logging
          if (index === 0) {
            console.log('Original image path:', imagePath);
            console.log('Optimized URL:', optimizedUrl);
          }

          return (
            <div key={index} className="w-full h-52 flex-shrink-0">
              {hasError ? (
                <ImagePlaceholder />
              ) : (
                <img
                  src={optimizedUrl}
                  alt={`${propertyTitle} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(index)}
                  onLoad={() => {
                    if (index === 0) console.log('Image loaded successfully:', optimizedUrl);
                  }}
                  loading={priority && index === 0 ? "eager" : "lazy"}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {hasMultipleImages && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {hasMultipleImages && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => goToSlide(index, e)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      {hasMultipleImages && (
        <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}