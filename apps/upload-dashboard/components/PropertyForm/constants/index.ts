//my-app\components\PropertyForm\constants\index.ts

// R2 Upload configuration (matches your API route settings)
export const R2_UPLOAD_CONFIG = {
  // File size limits (matching your API route)
  MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB (individual file)
  MAX_TOTAL_SIZE: 200 * 1024 * 1024, // 200MB total (increased from 100MB)
  MAX_FILES: 20,
  
  // Allowed formats (matching your API route)
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ] as const,
  
  // Upload timeouts
  UPLOAD_TIMEOUT: 60000, // 60 seconds
} as const;

// Image sizes (for display/reference - R2 handles actual processing)
export const IMAGE_SIZES = {
  THUMB: 'thumb',
  MEDIUM: 'medium', 
  FULL: 'full'
} as const;

// Default coordinates (fallback for geocoding failures)
export const DEFAULT_COORDINATES = {
  lat: 40.7128, // New York City
  lng: -74.0060
} as const;

// Property form validation rules
export const VALIDATION_RULES = {
  TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 100
  },
  ADDRESS: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 200
  },
  PRICE: {
    MIN: 0,
    MAX: 999999999
  },
  BEDS: {
    MIN: 0,
    MAX: 20
  },
  BATHS: {
    MIN: 0,
    MAX: 20
  },
  DESCRIPTION: {
    MAX_LENGTH: 2000
  }
} as const;

// Property types
export const PROPERTY_TYPES = [
  'Apartment',
  'House', 
  'Condo',
  'Townhouse',
  'Villa'
] as const;

// Form step configuration (if using multi-step form)
export const FORM_STEPS = {
  BASIC_INFO: 'basic-info',
  IMAGES: 'images',
  LOCATION: 'location',
  PREVIEW: 'preview'
} as const;

// Upload status constants
export const UPLOAD_STATUS = {
  IDLE: 'idle',
  VALIDATING: 'validating',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  GEOCODING_FAILED: 'Could not find the specified address. Please check and try again.',
  R2_UPLOAD_FAILED: 'Failed to upload images to cloud storage. Please try again.',
  SAVE_FAILED: 'Failed to save property. Please try again.',
  VALIDATION_FAILED: 'Please check all required fields and try again.',
  FILE_TOO_LARGE: 'One or more files are too large. Maximum size is 20MB.',
  TOTAL_SIZE_TOO_LARGE: 'Total file size exceeds 200MB limit.', // Updated message
  INVALID_FILE_TYPE: 'Invalid file type. Please use JPEG, PNG, or WebP images.',
  TOO_MANY_FILES: `Maximum ${R2_UPLOAD_CONFIG.MAX_FILES} files allowed.`,
  UPLOAD_TIMEOUT: 'Image upload timed out. Please check your connection.',
  API_ERROR: 'Server error occurred. Please try again.',
  NO_FILES_SELECTED: 'Please select at least one image to upload.'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  PROPERTY_CREATED: 'Property created successfully!',
  PROPERTY_UPDATED: 'Property updated successfully!',
  IMAGES_UPLOADED: 'Images uploaded to cloud storage successfully!',
  R2_UPLOAD_COMPLETE: 'All images uploaded and optimized successfully!'
} as const;

// Loading states
export const LOADING_MESSAGES = {
  SAVING: 'Saving property...',
  GEOCODING: 'Finding location...',
  UPLOADING_IMAGES: 'Uploading to cloud storage...',
  OPTIMIZING_IMAGES: 'Optimizing images...',
  LOADING: 'Loading...',
  VALIDATING_FILES: 'Validating files...'
} as const;

// Responsive breakpoints (matching your CSS)
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px'
} as const;

// Animation durations (for potential animations)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
} as const;

// Local storage keys (if needed)
export const STORAGE_KEYS = {
  DRAFT_PROPERTY: 'draft_property',
  FORM_PREFERENCES: 'form_preferences'
} as const;

// R2 specific constants
export const R2_CONSTANTS = {
  BUCKET_NAME: 'propertyphotos', // Your R2 bucket name
  UPLOAD_ENDPOINT: '/api/upload',
  IMAGE_FORMATS: {
    INPUT: ['jpeg', 'jpg', 'png', 'webp'],
    OUTPUT: 'webp' // R2 converts everything to WebP
  },
  OPTIMIZATION_FEATURES: [
    'WebP conversion',
    'Multi-size generation', 
    'EXIF data removal',
    'Quality optimization',
    'CDN caching'
  ]
} as const;

// File validation helpers
export const FILE_VALIDATION = {
  isValidType: (fileType: string) => R2_UPLOAD_CONFIG.ALLOWED_TYPES.includes(fileType as any),
  isValidSize: (fileSize: number) => fileSize <= R2_UPLOAD_CONFIG.MAX_FILE_SIZE,
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
} as const;