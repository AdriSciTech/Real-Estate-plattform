//listings-plattform\app\properties\[id]\components\PropertyGallery.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

// ===== TYPES =====
interface ImageUrls {
  thumb?: string;
  medium?: string;
  full?: string;
}

interface Property {
  id: string;
  title: string;
  type: string;
  image_urls_full?: ImageUrls[];
  optimized_images?: ImageUrls[];
  image_urls?: string[];
}

interface PropertyGalleryProps {
  images: ImageUrls[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  property: Property;
}

// ===== UTILITY FUNCTIONS =====
const getOptimizedImageUrl = (imageUrls: ImageUrls, size: keyof ImageUrls = 'full'): string => {
  if (!imageUrls) return '/placeholder-property.jpg';
  
  const fallbackOrder: (keyof ImageUrls)[] = 
    size === 'thumb' ? ['thumb', 'medium', 'full'] :
    size === 'medium' ? ['medium', 'full', 'thumb'] :
    ['full', 'medium', 'thumb'];
  
  for (const key of fallbackOrder) {
    const url = imageUrls[key];
    if (url?.length) return url;
  }
  
  return '/placeholder-property.jpg';
};

const clamp = (value: number, min: number, max: number): number => 
  Math.max(min, Math.min(max, value));

// ===== COMPONENTS =====
const Button = ({ children, onClick, disabled, className = '', variant = 'default' }: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'danger';
}) => {
  const baseClasses = "p-3 rounded-lg backdrop-blur-md border transition-all duration-200 flex items-center justify-center text-white font-medium focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    default: "bg-white/10 hover:bg-white/20 border-white/20 hover:scale-105 active:scale-95",
    danger: "bg-red-500/20 hover:bg-red-500/30 border-red-400/30 hover:scale-105 active:scale-95"
  };

  return (
    <button
      onClick={(e) => onClick(e)}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const ZoomControls = ({ onZoomIn, onZoomOut, onResetZoom, canZoomIn, canZoomOut, currentZoom, isVisible }: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  currentZoom: number;
  isVisible: boolean;
}) => (
  <div className={`flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-lg p-2 border border-white/20 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
    <Button onClick={(e) => onZoomOut()} disabled={!canZoomOut} className="w-8 h-8 p-0">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    </Button>
    
    <div className="px-3 py-1 text-white text-sm font-medium min-w-[60px] text-center">
      {Math.round(currentZoom * 100)}%
    </div>
    
    <Button onClick={(e) => onZoomIn()} disabled={!canZoomIn} className="w-8 h-8 p-0">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </Button>
    
    {currentZoom !== 1 && (
      <Button onClick={(e) => onResetZoom()} className="w-8 h-8 p-0 text-xs">
        1:1
      </Button>
    )}
  </div>
);

const Thumbnails = ({ images, currentIndex, onNavigate, isVisible }: {
  images: ImageUrls[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  isVisible: boolean;
}) => {
  const thumbnailRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (thumbnailRef.current && isVisible) {
      const container = thumbnailRef.current;
      const currentThumbnail = container.children[currentIndex] as HTMLElement;
      
      if (currentThumbnail) {
        currentThumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentIndex, isVisible]);

  if (images.length <= 1) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
    }`}>
      <div className="bg-gradient-to-t from-black via-black/90 to-transparent pt-8 pb-4 px-4">
        <div className="max-w-full mx-auto">
          <div 
            ref={thumbnailRef}
            className="flex gap-3 overflow-x-auto pb-2 px-2 scrollbar-hide"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {images.map((imageUrls, index) => {
              const isActive = index === currentIndex;
              
              return (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(index);
                  }}
                  className={`relative flex-shrink-0 rounded-xl overflow-hidden transition-all duration-200 ${
                    isActive 
                      ? 'w-20 h-14 md:w-24 md:h-16 ring-3 ring-blue-400 scale-105 shadow-2xl' 
                      : 'w-16 h-12 md:w-20 md:h-14 ring-1 ring-white/30 hover:ring-white/60 hover:scale-105 shadow-lg'
                  }`}
                >
                  <Image
                    src={getOptimizedImageUrl(imageUrls, 'thumb')}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 64px, 80px"
                  />
                  <div className={`absolute inset-0 ${
                    isActive ? 'bg-blue-400/20' : 'bg-black/30 hover:bg-black/20'
                  } transition-colors`} />
                  <div className={`absolute top-1.5 left-1.5 px-2 py-1 rounded-md text-xs font-bold ${
                    isActive ? 'bg-blue-400 text-white' : 'bg-black/70 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  {isActive && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Mobile swipe indicator */}
          <div className="flex justify-center mt-3 md:hidden">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l4-4 4 4m-4-8v12" />
              </svg>
              <span>Swipe to navigate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====
export const PropertyGallery = ({ images, isOpen, onClose, initialIndex = 0, property }: PropertyGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [swipeOffset, setSwipeOffset] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const hideUITimeout = useRef<NodeJS.Timeout>();

  // Auto-hide UI (but keep bottom bar visible on mobile)
  const resetUITimer = useCallback(() => {
    if (hideUITimeout.current) clearTimeout(hideUITimeout.current);
    setIsUIVisible(true);
    // Only auto-hide on desktop
    if (window.innerWidth > 768) {
      hideUITimeout.current = setTimeout(() => setIsUIVisible(false), 3000);
    }
  }, []);

  const toggleUI = useCallback(() => {
    setIsUIVisible(prev => !prev);
    if (hideUITimeout.current) clearTimeout(hideUITimeout.current);
  }, []);

  // Navigation
  const goToSlide = useCallback((targetIndex: number) => {
    const newIndex = clamp(targetIndex, 0, images.length - 1);
    setCurrentIndex(newIndex);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    resetUITimer();
  }, [images.length, resetUITimer]);

  const goToPrevious = () => currentIndex > 0 && goToSlide(currentIndex - 1);
  const goToNext = () => currentIndex < images.length - 1 && goToSlide(currentIndex + 1);

  // Zoom controls
  const zoomIn = () => {
    setZoom(prev => clamp(prev + 0.5, 0.5, 4));
    resetUITimer();
  };

  const zoomOut = () => {
    const newZoom = clamp(zoom - 0.5, 0.5, 4);
    setZoom(newZoom);
    if (newZoom === 1) setPosition({ x: 0, y: 0 });
    resetUITimer();
  };

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    resetUITimer();
  };

  const handleDoubleClick = () => {
    if (zoom === 1) {
      setZoom(2.5);
    } else {
      resetZoom();
    }
  };

  // Touch/Mouse handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    // Don't interfere with thumbnail clicks
    if ((e.target as HTMLElement).closest('.thumbnail-area')) {
      return;
    }
    
    if (e.pointerType === 'touch') {
      resetUITimer();
    }
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    if (zoom > 1) {
      // Pan when zoomed
      setPosition(prev => ({
        x: prev.x + deltaX * 0.5,
        y: prev.y + deltaY * 0.5
      }));
    } else if (images.length > 1 && Math.abs(deltaX) > Math.abs(deltaY)) {
      // Swipe between images
      const maxSwipe = window.innerWidth * 0.3;
      setSwipeOffset(clamp(deltaX, -maxSwipe, maxSwipe));
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    
    if (zoom <= 1 && Math.abs(swipeOffset) > 80) {
      if (swipeOffset > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
    
    setSwipeOffset(0);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeydown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case '0':
          resetZoom();
          break;
        case ' ':
          e.preventDefault();
          toggleUI();
          break;
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [isOpen, currentIndex, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      resetUITimer();
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, resetUITimer]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setSwipeOffset(0);
    }
  }, [isOpen, initialIndex]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (hideUITimeout.current) clearTimeout(hideUITimeout.current);
    };
  }, []);

  if (!isOpen) return null;

  const containerTransform = `translateX(${-currentIndex * 100 + (swipeOffset / window.innerWidth) * 100}%)`;
  const imageTransform = `scale(${zoom}) translate(${position.x}px, ${position.y}px)`;

  const galleryContent = (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isUIVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="text-white space-y-1">
              <h1 className="text-xl md:text-2xl font-bold truncate">{property.title}</h1>
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span>{currentIndex + 1} / {images.length}</span>
                <span>{property.type}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ZoomControls
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onResetZoom={resetZoom}
                canZoomIn={zoom < 4}
                canZoomOut={zoom > 0.5}
                currentZoom={zoom}
                isVisible={isUIVisible}
              />
              
              <Button onClick={(e) => onClose()} variant="danger">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Image Container */}
      <div 
        ref={containerRef}
        className="h-full flex items-center justify-center pb-32 md:pb-24"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onClick={(e) => {
          // Don't toggle UI if clicking on thumbnails
          if (!(e.target as HTMLElement).closest('.thumbnail-area')) {
            if (window.innerWidth > 768) {
              toggleUI();
            }
          }
        }}
        style={{ cursor: zoom > 1 ? 'grab' : 'pointer' }}
      >
        <div className="relative w-full h-full overflow-hidden">
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{ transform: containerTransform }}
          >
            {images.map((imageUrls, index) => (
              <div key={index} className="w-full h-full flex-shrink-0 relative flex items-center justify-center">
                <div 
                  className="relative max-w-full max-h-full transition-transform duration-200"
                  style={index === currentIndex ? { transform: imageTransform } : undefined}
                >
                  <Image
                    src={getOptimizedImageUrl(imageUrls, 'full')}
                    alt={`${property.title} - Image ${index + 1}`}
                    width={1200}
                    height={800}
                    className="max-w-full max-h-full object-contain"
                    priority={Math.abs(index - currentIndex) <= 1}
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows - Hidden on mobile */}
          {images.length > 1 && (
            <>
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 hidden md:block ${
                isUIVisible ? 'opacity-100' : 'opacity-0'
              }`}>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                    resetUITimer();
                  }}
                  disabled={currentIndex === 0}
                  className="w-12 h-12"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
              </div>
              
              <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300 hidden md:block ${
                isUIVisible ? 'opacity-100' : 'opacity-0'
              }`}>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                    resetUITimer();
                  }}
                  disabled={currentIndex === images.length - 1}
                  className="w-12 h-12"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Thumbnail Bar */}
      <div className="thumbnail-area">
        <Thumbnails
          images={images}
          currentIndex={currentIndex}
          onNavigate={goToSlide}
          isVisible={isUIVisible}
        />
      </div>

      {/* Progress Dots - Only show on desktop when thumbnails are hidden */}
      {images.length > 1 && images.length <= 10 && (
        <div className={`absolute bottom-20 left-1/2 -translate-x-1/2 transition-all duration-300 hidden md:block ${
          isUIVisible ? 'opacity-0' : 'opacity-100'
        }`}>
          <div className="flex gap-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'w-6 bg-white' 
                    : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return typeof window !== 'undefined' 
    ? createPortal(galleryContent, document.body)
    : null;
};

export type { PropertyGalleryProps, Property, ImageUrls }