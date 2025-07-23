// my-app\lib\r2\uploadUtils.ts

import { PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import { r2Client, R2_CONFIG, generateR2Url, extractR2Key } from './client';

/**
 * Upload a single blob to R2 storage
 */
export const uploadBlobToR2 = async (
  blob: Blob,
  fileName: string,
  propertyId: string,
  size: 'thumb' | 'medium' | 'full'
): Promise<string> => {
  try {
    // Generate unique filename with proper structure
    const fileExtension = 'webp'; // Using WebP for optimal compression
    const timestamp = Date.now();
    const uniqueId = uuidv4().split('-')[0]; // Use first part of UUID for shorter names
    const key = `properties/${propertyId}/${size}/${timestamp}_${uniqueId}_${fileName}.${fileExtension}`;

    // Convert blob to buffer for upload
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine content type
    const contentType = blob.type || 'image/webp';

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000', // 1 year cache
      Metadata: {
        propertyId,
        size,
        originalFileName: fileName,
        uploadedAt: new Date().toISOString(),
      },
    });

    await r2Client.send(command);

    // Return the public URL
    return generateR2Url(key);

  } catch (error) {
    console.error(`Failed to upload ${size} image to R2:`, error);
    throw new Error(`R2 upload failed for ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Upload multiple image sizes for a single image file
 */
export const uploadImageSizesToR2 = async (
  processedImage: {
    file: File;
    thumb: Blob;
    medium: Blob;
    full: Blob;
  },
  propertyId: string,
  onProgress?: (fileName: string, progress: number) => void
): Promise<{ thumb: string; medium: string; full: string }> => {
  const baseFileName = processedImage.file.name.replace(/\.[^/.]+$/, ''); // Remove extension
  
  try {
    if (onProgress) {
      onProgress(processedImage.file.name, 10);
    }

    // Upload all three sizes in parallel
    const [thumbUrl, mediumUrl, fullUrl] = await Promise.all([
      uploadBlobToR2(processedImage.thumb, baseFileName, propertyId, 'thumb'),
      uploadBlobToR2(processedImage.medium, baseFileName, propertyId, 'medium'),
      uploadBlobToR2(processedImage.full, baseFileName, propertyId, 'full')
    ]);

    if (onProgress) {
      onProgress(processedImage.file.name, 100);
    }

    return {
      thumb: thumbUrl,
      medium: mediumUrl,
      full: fullUrl
    };

  } catch (error) {
    if (onProgress) {
      onProgress(processedImage.file.name, -1); // -1 indicates error
    }
    console.error(`Failed to upload image sizes for ${processedImage.file.name}:`, error);
    throw error;
  }
};

/**
 * Upload multiple processed images to R2
 */
export const uploadProcessedImagesToR2 = async (
  processedImages: Array<{
    file: File;
    thumb: Blob;
    medium: Blob;
    full: Blob;
  }>,
  propertyId: string,
  onProgress?: (fileName: string, progress: number) => void
): Promise<Array<{ thumb: string; medium: string; full: string }>> => {
  const uploadedImages: Array<{ thumb: string; medium: string; full: string }> = [];

  for (let i = 0; i < processedImages.length; i++) {
    const processedImage = processedImages[i];
    
    try {
      const imageUrls = await uploadImageSizesToR2(
        processedImage,
        propertyId,
        onProgress
      );
      
      uploadedImages.push(imageUrls);
      
    } catch (error) {
      console.error(`Failed to upload image ${processedImage.file.name}:`, error);
      // Continue with other images but re-throw to let caller handle
      throw error;
    }
  }

  return uploadedImages;
};

/**
 * Delete images from R2 storage
 */
export const deleteImagesFromR2 = async (
  imageUrls: Array<{ thumb: string; medium: string; full: string }>
): Promise<void> => {
  try {
    const keysToDelete: string[] = [];

    // Extract keys from URLs
    imageUrls.forEach(urls => {
      [urls.thumb, urls.medium, urls.full].forEach(url => {
        const key = extractR2Key(url);
        if (key) {
          keysToDelete.push(key);
        }
      });
    });

    if (keysToDelete.length === 0) {
      console.warn('No valid R2 keys found for deletion');
      return;
    }

    // Delete in batches (R2 supports up to 1000 objects per batch)
    const batchSize = 1000;
    const batches = [];
    
    for (let i = 0; i < keysToDelete.length; i += batchSize) {
      batches.push(keysToDelete.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: R2_CONFIG.bucket,
        Delete: {
          Objects: batch.map(key => ({ Key: key })),
          Quiet: true, // Only return errors, not successful deletions
        },
      });

      const result = await r2Client.send(deleteCommand);
      
      if (result.Errors && result.Errors.length > 0) {
        console.error('Some images failed to delete from R2:', result.Errors);
        // Don't throw here - partial success is acceptable for cleanup
      }
    }

    console.log(`Successfully deleted ${keysToDelete.length} images from R2`);

  } catch (error) {
    console.error('Failed to delete images from R2:', error);
    // Don't throw here - deletion failures shouldn't break the main flow
  }
};

/**
 * Delete a single image set from R2
 */
export const deleteSingleImageFromR2 = async (
  imageUrls: { thumb: string; medium: string; full: string }
): Promise<void> => {
  await deleteImagesFromR2([imageUrls]);
};

/**
 * Validate file for R2 upload
 */
export const validateFileForR2 = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > R2_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: `File ${file.name} is too large. Maximum size is ${R2_CONFIG.maxFileSize / (1024 * 1024)}MB.`
    };
  }

  // Check MIME type - use type-safe approach
  const isValidType = R2_CONFIG.allowedMimeTypes.some(type => type === file.type);
  if (!isValidType) {
    return {
      valid: false,
      error: `File ${file.name} has unsupported format. Allowed formats: JPEG, PNG, WebP.`
    };
  }

  return { valid: true };
};

/**
 * Get R2 storage info for debugging
 */
export const getR2StorageInfo = () => {
  return {
    bucket: R2_CONFIG.bucket,
    publicUrl: R2_CONFIG.publicUrl,
    maxFileSize: `${R2_CONFIG.maxFileSize / (1024 * 1024)}MB`,
    allowedTypes: R2_CONFIG.allowedMimeTypes,
  };
};