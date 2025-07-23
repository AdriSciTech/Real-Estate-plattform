// my-app\components\OptimizedImage\OptimizedImageGallery.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { OptimizedImage } from './OptimizedImage';
import { ImageUrls } from '@/lib/types';

interface OptimizedImageGalleryProps {
  images: ImageUrls[];
  columns?: number;
  itemHeight?: number;
  className?: string;
}

export const OptimizedImageGallery: React.FC<OptimizedImageGalleryProps> = ({
  images,
  columns = 3,
  itemHeight = 300,
  className = ''
}) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  // Calculate grid dimensions
  const { columnCount, rowCount, itemWidth } = useMemo(() => {
    const cols = Math.min(columns, images.length);
    const rows = Math.ceil(images.length / cols);
    const width = window.innerWidth / cols - 20; // Account for margins
    
    return {
      columnCount: cols,
      rowCount: rows,
      itemWidth: width
    };
  }, [images.length, columns]);

  // Virtual grid item renderer
  const GridItem = useCallback(({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    const image = images[index];
    
    if (!image) return null;

    return (
      <div style={style} className="p-2">
        <OptimizedImage
          imageUrls={image}
          alt={`Gallery image ${index + 1}`}
          className="w-full h-full rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200"
          priority={index < 6} // Prioritize first 6 images
          lazy={index >= 6}
          placeholder="skeleton"
          sizes="(max-width: 768px) 50vw, 33vw"
          onLoad={() => console.log(`Image ${index} loaded`)}
        />
      </div>
    );
  }, [images, columnCount]);

  return (
    <div className={`w-full ${className}`}>
      <Grid
        columnCount={columnCount}
        columnWidth={itemWidth}
        height={600} // Fixed height for virtual scrolling
        rowCount={rowCount}
        rowHeight={itemHeight}
        width={window.innerWidth}
        className="scrollbar-thin scrollbar-thumb-gray-300"
      >
        {GridItem}
      </Grid>
      
      {/* Image Modal */}
      {selectedImage !== null && (
        <ImageModal
          image={images[selectedImage]}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

// Lightweight image modal
const ImageModal: React.FC<{ image: ImageUrls; onClose: () => void }> = ({ image, onClose }) => (
  <div 
    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
    onClick={onClose}
  >
    <div className="max-w-4xl max-h-4xl p-4">
      <OptimizedImage
        imageUrls={image}
        alt="Full size image"
        className="max-w-full max-h-full"
        priority={true}
        lazy={false}
        placeholder="blur"
        sizes="100vw"
      />
    </div>
  </div>
);

// CSS for additional optimizations
export const imageOptimizationCSS = `
/* GPU acceleration for image transforms */
.optimized-image {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Smooth loading animations */
.image-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(1.05); }
  to { opacity: 1; transform: scale(1); }
}

/* Critical CSS for above-the-fold images */
.critical-image {
  content-visibility: auto;
  contain-intrinsic-size: 300px;
}

/* Optimize for mobile viewports */
@media (max-width: 768px) {
  .responsive-image {
    max-width: 100vw;
    height: auto;
  }
}

/* Reduce layout shift */
.aspect-ratio-box {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
}

.aspect-ratio-box img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
`;