// my-app\lib\r2\client.ts

import { S3Client } from '@aws-sdk/client-s3';

// Validate required environment variables
if (!process.env.R2_ACCESS_KEY_ID) {
  throw new Error('R2_ACCESS_KEY_ID environment variable is required');
}
if (!process.env.R2_SECRET_ACCESS_KEY) {
  throw new Error('R2_SECRET_ACCESS_KEY environment variable is required');
}
if (!process.env.R2_ENDPOINT) {
  throw new Error('R2_ENDPOINT environment variable is required');
}
if (!process.env.R2_BUCKET) {
  throw new Error('R2_BUCKET environment variable is required');
}
if (!process.env.PUBLIC_URL) {
  throw new Error('PUBLIC_URL environment variable is required');
}

// Create and configure S3 client for Cloudflare R2
export const r2Client = new S3Client({
  region: 'auto', // Cloudflare R2 uses 'auto' as region
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for R2 compatibility
});

// R2 configuration constants
export const R2_CONFIG = {
  bucket: process.env.R2_BUCKET,
  publicUrl: process.env.PUBLIC_URL.endsWith('/') 
    ? process.env.PUBLIC_URL.slice(0, -1) 
    : process.env.PUBLIC_URL,
  maxFileSize: 20 * 1024 * 1024, // 20MB (increased from 10MB)
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ] // Remove 'as const' to allow normal array operations
} as const;

// Helper function to generate R2 public URL
export const generateR2Url = (key: string): string => {
  return `${R2_CONFIG.publicUrl}/${key}`;
};

// Helper function to extract key from R2 URL
export const extractR2Key = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    // Remove leading slash from pathname
    return urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
  } catch {
    return null;
  }
};