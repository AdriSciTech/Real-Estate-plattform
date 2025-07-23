// my-app\components\PropertyForm\components\ImagePreview.tsx
import React from 'react';
import Image from 'next/image';
import { ImageUrls } from '../../../lib/types';

interface ImagePreviewProps {
  existingImages: ImageUrls[];
  selectedFiles: File[]; // Raw files selected for upload
  uploadedImages: ImageUrls[]; // Images uploaded to R2 (during current session)
  onRemoveImage: (index: number, type: 'existing' | 'selected' | 'uploaded') => void;
  isUploading?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
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

  return (
    <div className="space-y-6">
      {/* Existing Images (already uploaded to R2) */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            Current Images ({existingImages.length})
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              ⚡ Cloudflare Optimized
            </span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {existingImages.map((imageUrls, index) => {
              const displayUrl = imageUrls.medium || imageUrls.thumb || imageUrls.full;
              const isOptimized = isCloudflareOptimized(displayUrl);
              
              return (
                <div key={`existing-${index}`} className="relative group">
                  <Image
                    src={displayUrl}
                    alt={`Property image ${index + 1}`}
                    width={200}
                    height={150}
                    className="w-full h-32 object-cover rounded-lg transition-opacity group-hover:opacity-90"
                    loading="lazy"
                    onError={(e) => {
                      console.error('❌ Failed to load existing image:', displayUrl);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index, 'existing')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-0.5 rounded">
                    {isOptimized ? '⚡ CF' : '📦 R2'}
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
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            Recently Uploaded ({uploadedImages.length})
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              ✅ Just Added
            </span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedImages.map((imageUrls, index) => {
              const displayUrl = imageUrls.medium || imageUrls.thumb || imageUrls.full;
              
              return (
                <div key={`uploaded-${index}`} className="relative group">
                  <Image
                    src={displayUrl}
                    alt={`Uploaded image ${index + 1}`}
                    width={200}
                    height={150}
                    className="w-full h-32 object-cover rounded-lg transition-opacity group-hover:opacity-90"
                    loading="lazy"
                    onError={(e) => {
                      console.error('❌ Failed to load uploaded image:', displayUrl);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index, 'uploaded')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-2 left-2 bg-green-600 bg-opacity-80 text-white text-xs px-2 py-0.5 rounded">
                    ⚡ CF
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
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            Selected for Upload ({selectedFiles.length})
            {isUploading && (
              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full animate-pulse">
                🔄 Uploading...
              </span>
            )}
          </h4>
          
          {/* File List */}
          <div className="space-y-2 mb-4">
            {selectedFiles.map((file, index) => (
              <div key={`selected-${index}`} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{file.name}</div>
                  <div className="text-xs text-gray-600">
                    Size: {formatFileSize(file.size)} • Type: {file.type}
                  </div>
                </div>
                {!isUploading && (
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index, 'selected')}
                    className="text-red-600 hover:text-red-800 text-sm ml-4 px-2 py-1 hover:bg-red-50 rounded transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* File Previews */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedFiles.map((file, index) => {
              const previewUrl = URL.createObjectURL(file);
              
              return (
                <div key={`preview-${index}`} className="relative group">
                  <img
                    src={previewUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg transition-opacity group-hover:opacity-90"
                    loading="lazy"
                    onLoad={() => URL.revokeObjectURL(previewUrl)} // Clean up memory
                  />
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={() => onRemoveImage(index, 'selected')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from selection"
                    >
                      ×
                    </button>
                  )}
                  <div className="absolute bottom-2 left-2 bg-blue-600 bg-opacity-80 text-white text-xs px-2 py-0.5 rounded">
                    {formatFileSize(file.size)}
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="text-white text-sm flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Upload Info */}
          {selectedFiles.length > 0 && !isUploading && (
            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
              <div className="text-sm">
                <div className="font-medium text-gray-900 mb-1">
                  ⚡ These images will be optimized by Cloudflare:
                </div>
                <div className="text-gray-600 space-y-1">
                  <div>• 🎯 Auto-resized to thumb (300px), medium (800px), full (1920px)</div>
                  <div>• 🗜️ Converted to WebP/AVIF for smaller file sizes</div>
                  <div>• 🌍 Cached globally on Cloudflare's CDN</div>
                  <div>• 🚀 Lightning-fast delivery worldwide</div>
                </div>
                <div className="mt-2 text-xs text-blue-700">
                  Total size: {formatFileSize(selectedFiles.reduce((sum, file) => sum + file.size, 0))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {existingImages.length === 0 && uploadedImages.length === 0 && selectedFiles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📸</div>
          <div className="text-sm">No images selected. Add some photos to showcase this property.</div>
        </div>
      )}
    </div>
  );
};