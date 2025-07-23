//listings-plattform\app\properties\[id]\components\PropertyImageGrid.tsx
'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface PropertyImageGridProps {
  imagePaths: string[];
  propertyTitle: string;
  propertyId: string;
  className?: string;
  priority?: boolean;
}

export default function PropertyImageGrid({ 
  imagePaths, 
  propertyTitle, 
  propertyId,
  className = "",
  priority = false 
}: PropertyImageGridProps) {
  const router = useRouter();
  
  // Get the first 3 images
  const displayImages = imagePaths.slice(0, 3);
  
  // Handle click to navigate to gallery
  const handleClick = () => {
    router.push(`/properties/${propertyId}/gallery`);
  };
  
  // If we don't have any images, show placeholder
  if (displayImages.length === 0) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center h-96 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">🏠</div>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`grid grid-cols-2 gap-2 h-96 cursor-pointer ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Main large image on the left */}
      <div className="relative overflow-hidden rounded-l-lg">
        <Image
          src={displayImages[0]}
          alt={`${propertyTitle} - Main view`}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          priority={priority}
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      </div>
      
      {/* Right column with two smaller images */}
      <div className="grid grid-rows-2 gap-2">
        {/* Top right image */}
        <div className="relative overflow-hidden rounded-tr-lg">
          <Image
            src={displayImages[1] || displayImages[0]}
            alt={`${propertyTitle} - View ${displayImages[1] ? '2' : '1'}`}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            priority={priority}
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>
        
        {/* Bottom right image */}
        <div className="relative overflow-hidden rounded-br-lg">
          <Image
            src={displayImages[2] || displayImages[1] || displayImages[0]}
            alt={`${propertyTitle} - View ${displayImages[2] ? '3' : displayImages[1] ? '2' : '1'}`}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            priority={priority}
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          
          {/* Overlay for additional images count */}
          {imagePaths.length > 3 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-2xl font-bold">+{imagePaths.length - 3}</div>
                <div className="text-sm">more photos</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}