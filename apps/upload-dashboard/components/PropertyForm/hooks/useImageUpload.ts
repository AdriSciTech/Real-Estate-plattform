// my-app\components\PropertyForm\hooks\useImageUpload.ts

import { useState, useCallback } from 'react';
import { ImageUrls } from '@/lib/types';
import { uploadFilesToR2 } from '@/lib/uploadClient'; // ✅ NEW R2 system

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImages = useCallback(async (
    files: File[], // ✅ Now takes raw files instead of processed images
    propertyId: string
  ): Promise<ImageUrls[]> => {
    if (files.length === 0) return [];

    setUploading(true);
    setUploadProgress(0);

    try {
      console.log('🚀 Starting R2 image upload process...');
      
      // ✅ Use the new R2 upload system
      const uploadedImages = await uploadFilesToR2(
        files,
        propertyId,
        (progressValue: number) => {
          setUploadProgress(progressValue);
        }
      );

      // Convert R2 response to ImageUrls format (should already be correct)
      const imageUrls: ImageUrls[] = uploadedImages.map(imageSet => ({
        thumb: imageSet.thumb,
        medium: imageSet.medium,
        full: imageSet.full
      }));

      console.log('✅ All images uploaded to R2 successfully:', imageUrls);
      return imageUrls;

    } catch (error) {
      console.error('❌ R2 image upload failed:', error);
      throw new Error(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  return {
    uploading,
    uploadProgress,
    uploadImages
  };
};