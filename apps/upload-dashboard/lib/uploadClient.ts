// my-app\lib\uploadClient.ts

import { ImageUrls } from '@/lib/types';

// R2 response interface
interface UploadResponse {
  success: boolean;
  data?: ImageUrls[];
  error?: string;
  details?: string;
  message?: string;
}

/**
 * Upload files securely via API route to Cloudflare R2
 */
export async function uploadFilesToR2(
  files: File[],
  propertyId: string,
  onProgress?: (progress: number) => void
): Promise<ImageUrls[]> {
  if (files.length === 0) {
    throw new Error('No files to upload');
  }

  console.log(`🚀 Starting upload of ${files.length} files for property: ${propertyId}`);

  // Create FormData
  const formData = new FormData();
  formData.append('propertyId', propertyId);
  
  files.forEach((file, index) => {
    console.log(`📁 Adding file ${index + 1}: ${file.name} (${file.type}, ${Math.round(file.size / 1024)}KB)`);
    formData.append('files', file);
  });

  try {
    if (onProgress) onProgress(10);

    console.log('📡 Sending request to /api/upload...');

    // Upload via secure API route
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);

    if (onProgress) onProgress(90);

    let result: UploadResponse;
    try {
      result = await response.json();
      console.log('📡 Response data:', result);
    } catch (jsonError) {
      console.error('❌ Failed to parse JSON response:', jsonError);
      const responseText = await response.text();
      console.error('📄 Raw response:', responseText);
      throw new Error(`Server returned invalid JSON. Status: ${response.status}`);
    }

    if (!result.success) {
      console.error('❌ Upload failed:', result.error);
      console.error('📄 Error details:', result.details);
      throw new Error(result.error || 'Upload failed');
    }

    if (onProgress) onProgress(100);

    console.log('✅ Upload successful!', result.data);
    return result.data || [];

  } catch (error) {
    console.error('💥 Upload error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Could not connect to upload API. Check if your dev server is running.');
    }
    
    throw error instanceof Error ? error : new Error('Upload failed');
  }
}

/**
 * Validate files before upload to R2
 */
export function validateFiles(files: File[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const maxFileSize = 20 * 1024 * 1024; // 20MB (updated from 10MB)
  const maxFiles = 20;
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // Check file count
  if (files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed. You selected ${files.length} files.`);
  }

  // Check total size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const maxTotalSize = 200 * 1024 * 1024; // 200MB (updated from 100MB)
  if (totalSize > maxTotalSize) {
    errors.push(`Total file size (${formatFileSize(totalSize)}) exceeds limit of ${formatFileSize(maxTotalSize)}.`);
  }

  // Check individual files
  files.forEach((file, index) => {
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File ${index + 1} (${file.name}): Invalid file type. Use JPEG, PNG, or WebP.`);
    }
    
    if (file.size > maxFileSize) {
      errors.push(`File ${index + 1} (${file.name}): File too large. Maximum size is 20MB.`); // Updated from 10MB
    }

    if (file.size === 0) {
      errors.push(`File ${index + 1} (${file.name}): File appears to be empty or corrupted.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate a single file for R2 upload
 */
export function validateSingleFile(file: File): { valid: boolean; error?: string } {
  const maxFileSize = 20 * 1024 * 1024; // 20MB (updated from 10MB)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `${file.name}: Invalid file type. Use JPEG, PNG, or WebP.`
    };
  }

  if (file.size > maxFileSize) {
    return {
      valid: false,
      error: `${file.name}: File too large. Maximum size is 20MB.` // Updated from 10MB
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: `${file.name}: File appears to be empty or corrupted.`
    };
  }

  return { valid: true };
}

/**
 * Create preview URLs for selected files
 */
export function createImagePreviews(files: File[]): string[] {
  return files.map(file => URL.createObjectURL(file));
}

/**
 * Clean up preview URLs to prevent memory leaks
 */
export function cleanupImagePreviews(previewUrls: string[]): void {
  previewUrls.forEach(url => {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn('Failed to revoke object URL:', url, error);
    }
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Get R2 upload configuration info for debugging
 */
export function getR2Config() {
  return {
    maxFileSize: '20MB', // Updated from 10MB
    maxFiles: 20,
    maxTotalSize: '200MB', // Updated from 100MB
    allowedTypes: ['JPEG', 'PNG', 'WebP'],
    endpoint: '/api/upload',
    features: [
      'Server-side WebP conversion',
      'Multi-size generation (thumb/medium/full)',
      'EXIF data removal',
      'Cloudflare CDN delivery',
      'Secure API-based upload'
    ]
  };
}

/**
 * Test R2 upload system
 */
export async function testR2Connection(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/upload', {
      method: 'GET' // Should return 405 Method Not Allowed
    });

    if (response.status === 405) {
      return {
        success: true,
        message: 'R2 upload API endpoint is available and responding correctly.'
      };
    } else {
      return {
        success: false,
        message: `Unexpected response from upload API: ${response.status} ${response.statusText}`
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to connect to upload API: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Re-export types for convenience
export type { ImageUrls } from '@/lib/types';