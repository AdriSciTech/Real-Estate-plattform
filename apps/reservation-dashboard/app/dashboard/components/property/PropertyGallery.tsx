// app/ReservationDashboard/dashboard/components/property/PropertyGallery.tsx

import React, { 
  useState, 
  useCallback, 
  useEffect, 
  useRef,
  useMemo
} from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface PropertyGalleryProps {
  images: string[];
}

// Optimized R2 URL generation (same as ImageCarousel)
const getOptimizedImageUrl = (path: string, size: 'thumb' | 'full' = 'full'): string => {
  if (!path) return '/placeholder-property.jpg';
  
  // If already optimized, return as is
  if (path.includes('/cdn-cgi/image/') || path.includes('supabase.co')) {
    return path;
  }
  
  // Handle R2 cloudflare storage URLs
  if (path.includes('3f33a536db84337cebe3b036a4d7799c.r2.cloudflarestorage.com')) {
    const imagePath = path.replace('https://3f33a536db84337cebe3b036a4d7799c.r2.cloudflarestorage.com/propertyphotos/', '');
    const dimensions = size === 'thumb' ? 'width=400,height=400' : 'width=1200,height=1200';
    return `https://studentrentals.es/cdn-cgi/image/${dimensions},fit=cover,quality=85,format=webp/https://img.studentrentals.es/${imagePath}`;
  }
  
  // Handle existing studentrentals.es URLs
  if (path.includes('img.studentrentals.es')) {
    const dimensions = size === 'thumb' ? 'width=400,height=400' : 'width=1200,height=1200';
    return `https://studentrentals.es/cdn-cgi/image/${dimensions},fit=cover,quality=85,format=webp/${path}`;
  }
  
  // Default optimization for other URLs
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const dimensions = size === 'thumb' ? 'width=400,height=400' : 'width=1200,height=1200';
  return `https://studentrentals.es/cdn-cgi/image/${dimensions},fit=cover,quality=85,format=webp/https://img.studentrentals.es/${cleanPath}`;
};

// Optimize image loading with progressive loading technique
const OptimizedImage = React.memo(({ 
  src, 
  alt, 
  className,
  size = 'full'
}: { 
  src: string, 
  alt: string, 
  className?: string,
  size?: 'thumb' | 'full'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const optimizedSrc = getOptimizedImageUrl(src, size);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, [optimizedSrc]);

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400">
          <div className="text-3xl mb-1">🏠</div>
          <div className="text-xs">Image unavailable</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      )}
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
    </>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default function PropertyGallery({ images }: PropertyGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Memoize images to prevent unnecessary re-renders
  const memoizedImages = useMemo(() => images.slice(0, 8), [images]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [lightboxIndex]);

  // Optimized keyboard and touch navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;

      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowRight':
          handleNavigation(1);
          break;
        case 'ArrowLeft':
          handleNavigation(-1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  // Touch swipe handling for mobile
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNavigation(1);
    } else if (isRightSwipe) {
      handleNavigation(-1);
    }
  };

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  // Optimized navigation with requestAnimationFrame
  const handleNavigation = useCallback((direction: number) => {
    if (lightboxIndex === null) return;

    requestAnimationFrame(() => {
      const newIndex = lightboxIndex + direction;
      const adjustedIndex = 
        newIndex < 0 
          ? images.length - 1 
          : newIndex >= images.length 
            ? 0 
            : newIndex;
      
      setLightboxIndex(adjustedIndex);
    });
  }, [lightboxIndex, images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="mt-8 relative">
        <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-200">
          Property Gallery
        </h3>
        <div className="bg-gray-100 rounded-lg p-12 text-center">
          <div className="text-gray-400">
            <div className="text-5xl mb-2">📸</div>
            <p>No images available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 relative">
      <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-200">
        Property Gallery
      </h3>
      
      {/* Responsive Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {memoizedImages.map((img, index) => (
          <div 
            key={index} 
            className="aspect-square rounded-lg overflow-hidden shadow hover:shadow-md transition-all cursor-pointer group relative"
            onClick={() => openLightbox(index)}
          >
            <OptimizedImage
              src={img}
              alt={`Property image ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              size="thumb"
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Image Container with Touch Navigation */}
          <div 
            className="relative max-w-[90vw] max-h-[90vh] flex items-center"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Previous Image Button */}
            {images.length > 1 && (
              <button
                onClick={() => handleNavigation(-1)}
                className="absolute left-2 sm:left-[-40px] lg:left-[-50px] top-1/2 -translate-y-1/2 
                           bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full 
                           p-2 sm:p-3 transition-all group z-10"
                aria-label="Previous Image"
              >
                <ChevronLeft 
                  className="text-white group-hover:scale-110 transition-transform" 
                  size={24} 
                />
              </button>
            )}

            {/* Current Image */}
            <div className="relative w-full h-full flex justify-center items-center">
              <OptimizedImage
                src={images[lightboxIndex]}
                alt={`Property image ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
                size="full"
              />
              
              {/* Loading indicator for next/prev images (preload) */}
              {images.length > 1 && (
                <>
                  {lightboxIndex > 0 && (
                    <link rel="prefetch" href={getOptimizedImageUrl(images[lightboxIndex - 1], 'full')} />
                  )}
                  {lightboxIndex < images.length - 1 && (
                    <link rel="prefetch" href={getOptimizedImageUrl(images[lightboxIndex + 1], 'full')} />
                  )}
                </>
              )}
            </div>

            {/* Next Image Button */}
            {images.length > 1 && (
              <button
                onClick={() => handleNavigation(1)}
                className="absolute right-2 sm:right-[-40px] lg:right-[-50px] top-1/2 -translate-y-1/2 
                           bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full 
                           p-2 sm:p-3 transition-all group z-10"
                aria-label="Next Image"
              >
                <ChevronRight 
                  className="text-white group-hover:scale-110 transition-transform" 
                  size={24} 
                />
              </button>
            )}

            {/* Close Button */}
            <button 
              onClick={closeLightbox}
              className="absolute top-4 right-4 sm:top-[-40px] sm:right-0 text-white 
                         bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full 
                         p-2 sm:p-3 transition-all"
              aria-label="Close Lightbox"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 sm:bottom-[-40px] left-1/2 -translate-x-1/2 
                            text-white bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}