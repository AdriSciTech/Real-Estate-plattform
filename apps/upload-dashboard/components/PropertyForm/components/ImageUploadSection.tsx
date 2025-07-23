// my-app\components\PropertyForm\components\ImageUploadSection.tsx
import React, { useRef } from 'react';
import { ProcessingStatus } from './ProcessingStatus';
import { ImageUrls } from '../../../lib/types';

interface ImageUploadSectionProps {
  existingImages: ImageUrls[];
  selectedFiles: File[]; // Renamed from originalImages for clarity
  uploadedImages: ImageUrls[]; // New images uploaded in current session
  processing: boolean;
  processingProgress: number;
  uploading: boolean;
  uploadProgress: number;
  onImageUpload: (files: File[]) => void;
  onRemoveImage: (index: number, type: 'existing' | 'selected' | 'uploaded') => void;
}

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  existingImages,
  selectedFiles,
  uploadedImages,
  processing,
  processingProgress,
  uploading,
  uploadProgress,
  onImageUpload,
  onRemoveImage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onImageUpload(files);
      // Reset the input value to allow selecting the same files again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const totalImages = existingImages.length + uploadedImages.length + selectedFiles.length;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        Property Images 
        <span className="text-sm font-normal text-blue-600 ml-2">
          ⚡ Cloudflare Optimized
        </span>
        {totalImages > 0 && (
          <span className="ml-auto text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {totalImages} image{totalImages !== 1 ? 's' : ''}
          </span>
        )}
      </h3>
      
      <p className="text-sm text-gray-600 mb-4">
        Images are automatically optimized and delivered via Cloudflare CDN with WebP/AVIF conversion, 
        multiple sizes, and global caching for lightning-fast loading.
      </p>
      
      {/* Processing/Upload Status */}
      {(processing || uploading) && (
        <ProcessingStatus 
          processing={processing}
          processingProgress={processingProgress}
          uploading={uploading}
          uploadProgress={uploadProgress}
          processingStage="Preparing Images"
          uploadStage="Uploading to Cloudflare R2"
        />
      )}
      
      {/* Upload Button */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={processing || uploading}
          className="hidden"
          aria-label="Select images to upload"
        />
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={processing || uploading}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Uploading to R2...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Add Images</span>
            </>
          )}
        </button>
        
        {/* File Requirements */}
        <div className="text-xs text-gray-500 mt-3 grid grid-cols-2 gap-2">
          <div>
            <p>• <strong>Formats:</strong> JPEG, PNG, WebP</p>
            <p>• <strong>Max size:</strong> 20MB per image</p>
          </div>
          <div>
            <p>• <strong>Max files:</strong> 20 images</p>
            <p>• <strong>Auto-optimized:</strong> WebP + multiple sizes</p>
          </div>
        </div>
      </div>

      {/* Use the new ImagePreview component */}
      <ImagePreview
        existingImages={existingImages}
        selectedFiles={selectedFiles}
        uploadedImages={uploadedImages}
        onRemoveImage={onRemoveImage}
        isUploading={uploading}
      />
    </div>
  );
};

// Import the new ImagePreview component we created earlier
interface ImagePreviewProps {
  existingImages: ImageUrls[];
  selectedFiles: File[];
  uploadedImages: ImageUrls[];
  onRemoveImage: (index: number, type: 'existing' | 'selected' | 'uploaded') => void;
  isUploading?: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  existingImages,
  selectedFiles,
  uploadedImages,
  onRemoveImage,
  isUploading = false
}) => {
  // Helper to get file size in readable format
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Helper to check if image is Cloudflare optimized
  const isCloudflareOptimized = (url: string) => {
    return url.includes('/cdn-cgi/image/') || url.includes('images.studentrentals.es');
  };

  const hasAnyImages = existingImages.length > 0 || uploadedImages.length > 0 || selectedFiles.length > 0;

  if (!hasAnyImages) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <div className="text-gray-400">
          <svg className="mx-auto h-16 w-16 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No images yet</h4>
          <p className="text-gray-600 mb-4">Add photos to showcase this property</p>
          <p className="text-sm text-gray-500">Images will be automatically optimized by Cloudflare</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Existing Images (already uploaded to R2) */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            Current Images ({existingImages.length})
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              ✅ Saved
            </span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {existingImages.map((imageUrls, index) => {
              const displayUrl = imageUrls.medium || imageUrls.thumb || imageUrls.full;
              const isOptimized = isCloudflareOptimized(displayUrl);
              
              return (
                <div key={`existing-${index}`} className="relative group">
                  <img
                    src={displayUrl}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border shadow-sm transition-transform group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      console.error('❌ Failed to load existing image:', displayUrl);
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMnB4Ij5JbWFnZSBGYWlsZWQ8L3RleHQ+PC9zdmc+';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index, 'existing')}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    title="Remove image"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                    {isOptimized ? '⚡' : '📦'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recently Uploaded Images (from current session) */}
      {uploadedImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            Recently Uploaded ({uploadedImages.length})
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              🆕 New
            </span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {uploadedImages.map((imageUrls, index) => {
              const displayUrl = imageUrls.medium || imageUrls.thumb || imageUrls.full;
              
              return (
                <div key={`uploaded-${index}`} className="relative group">
                  <img
                    src={displayUrl}
                    alt={`Uploaded image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border shadow-sm transition-transform group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      console.error('❌ Failed to load uploaded image:', displayUrl);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index, 'uploaded')}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    title="Remove image"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-1 left-1 bg-blue-600 bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
                    ⚡
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Files (ready for upload) */}
      {selectedFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            Selected for Upload ({selectedFiles.length})
            {isUploading && (
              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full animate-pulse">
                🔄 Uploading...
              </span>
            )}
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
            {selectedFiles.map((file, index) => {
              const previewUrl = URL.createObjectURL(file);
              
              return (
                <div key={`selected-${index}`} className="relative group">
                  <img
                    src={previewUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border shadow-sm transition-transform group-hover:scale-105"
                    loading="lazy"
                    onLoad={() => URL.revokeObjectURL(previewUrl)} // Clean up memory
                  />
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={() => onRemoveImage(index, 'selected')}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      title="Remove from selection"
                    >
                      ×
                    </button>
                  )}
                  <div className="absolute bottom-1 left-1 bg-gray-900 bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
                    {formatFileSize(file.size)}
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="text-white text-xs flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Uploading
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Upload Info */}
          {!isUploading && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="text-sm">
                <div className="font-medium text-gray-900 mb-2 flex items-center">
                  <span className="mr-2">⚡</span>
                  Cloudflare will optimize these images:
                </div>
                <div className="text-gray-600 space-y-1 text-xs">
                  <div>• Auto-resize to 3 sizes: thumbnail (300px), medium (800px), full (1920px)</div>
                  <div>• Convert to WebP/AVIF for smaller files and faster loading</div>
                  <div>• Cache globally on Cloudflare CDN for instant delivery</div>
                  <div>• Remove EXIF data for privacy and smaller files</div>
                </div>
                <div className="mt-2 text-xs text-blue-700 font-medium">
                  Total: {formatFileSize(selectedFiles.reduce((sum, file) => sum + file.size, 0))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};