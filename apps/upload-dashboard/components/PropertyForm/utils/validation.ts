//my-app\components\PropertyForm\utils\validation.ts

import { PropertyFormData, PropertyType } from '@/lib/types';
import { VALIDATION_RULES, PROPERTY_TYPES, R2_UPLOAD_CONFIG } from '../constants';

// Validate property form data with proper typing
export const validatePropertyForm = (formData: PropertyFormData): string[] => {
  const errors: string[] = [];

  // Title validation
  if (!formData.title?.trim()) {
    errors.push('Property title is required');
  } else if (formData.title.trim().length < VALIDATION_RULES.TITLE.MIN_LENGTH) {
    errors.push(`Title must be at least ${VALIDATION_RULES.TITLE.MIN_LENGTH} characters`);
  } else if (formData.title.trim().length > VALIDATION_RULES.TITLE.MAX_LENGTH) {
    errors.push(`Title must be less than ${VALIDATION_RULES.TITLE.MAX_LENGTH} characters`);
  }

  // Address validation
  if (!formData.address?.trim()) {
    errors.push('Address is required');
  } else if (formData.address.trim().length < VALIDATION_RULES.ADDRESS.MIN_LENGTH) {
    errors.push(`Address must be at least ${VALIDATION_RULES.ADDRESS.MIN_LENGTH} characters`);
  } else if (formData.address.trim().length > VALIDATION_RULES.ADDRESS.MAX_LENGTH) {
    errors.push(`Address must be less than ${VALIDATION_RULES.ADDRESS.MAX_LENGTH} characters`);
  }

  // Price validation
  const price = parseFloat(formData.price);
  if (isNaN(price) || price < VALIDATION_RULES.PRICE.MIN) {
    errors.push('Valid price is required');
  } else if (price > VALIDATION_RULES.PRICE.MAX) {
    errors.push(`Price cannot exceed ${VALIDATION_RULES.PRICE.MAX.toLocaleString()}`);
  }

  // Beds validation
  const beds = parseInt(formData.beds);
  if (isNaN(beds) || beds < VALIDATION_RULES.BEDS.MIN) {
    errors.push('Valid number of bedrooms is required');
  } else if (beds > VALIDATION_RULES.BEDS.MAX) {
    errors.push(`Cannot have more than ${VALIDATION_RULES.BEDS.MAX} bedrooms`);
  }

  // Baths validation
  const baths = parseFloat(formData.baths);
  if (isNaN(baths) || baths < VALIDATION_RULES.BATHS.MIN) {
    errors.push('Valid number of bathrooms is required');
  } else if (baths > VALIDATION_RULES.BATHS.MAX) {
    errors.push(`Cannot have more than ${VALIDATION_RULES.BATHS.MAX} bathrooms`);
  }

  // Property type validation
  if (!formData.type) {
    errors.push('Property type is required');
  } else if (!PROPERTY_TYPES.includes(formData.type as PropertyType)) {
    errors.push('Invalid property type selected');
  }

  // Description validation (optional field)
  if (formData.description && formData.description.length > VALIDATION_RULES.DESCRIPTION.MAX_LENGTH) {
    errors.push(`Description must be less than ${VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} characters`);
  }

  return errors;
};

// Validate files for R2 upload
export const validateImageFiles = (files: File[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (files.length === 0) {
    return { valid: true, errors: [] }; // No files is valid (optional)
  }

  // Check file count
  if (files.length > R2_UPLOAD_CONFIG.MAX_FILES) {
    errors.push(`Maximum ${R2_UPLOAD_CONFIG.MAX_FILES} files allowed`);
  }

  // Check individual files
  files.forEach((file, index) => {
    // File type validation
    if (!R2_UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type as any)) {
      errors.push(`File ${index + 1} (${file.name}): Invalid file type. Use JPEG, PNG, or WebP`);
    }

    // File size validation
    if (file.size > R2_UPLOAD_CONFIG.MAX_FILE_SIZE) {
      const maxSizeMB = R2_UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
      errors.push(`File ${index + 1} (${file.name}): File too large. Maximum size is ${maxSizeMB}MB`);
    }

    // Check for empty files
    if (file.size === 0) {
      errors.push(`File ${index + 1} (${file.name}): File appears to be empty or corrupted`);
    }
  });

  // Check total size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > R2_UPLOAD_CONFIG.MAX_TOTAL_SIZE) {
    const maxTotalSizeMB = R2_UPLOAD_CONFIG.MAX_TOTAL_SIZE / (1024 * 1024);
    errors.push(`Total file size exceeds ${maxTotalSizeMB}MB limit`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Validate single file for R2 upload
export const validateSingleImageFile = (file: File): { valid: boolean; error?: string } => {
  // File type validation
  if (!R2_UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `${file.name}: Invalid file type. Use JPEG, PNG, or WebP`
    };
  }

  // File size validation
  if (file.size > R2_UPLOAD_CONFIG.MAX_FILE_SIZE) {
    const maxSizeMB = R2_UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `${file.name}: File too large. Maximum size is ${maxSizeMB}MB`
    };
  }

  // Check for empty files
  if (file.size === 0) {
    return {
      valid: false,
      error: `${file.name}: File appears to be empty or corrupted`
    };
  }

  return { valid: true };
};

// Real-time validation for form fields
export const validateField = (fieldName: keyof PropertyFormData, value: string): string | null => {
  switch (fieldName) {
    case 'title':
      if (!value.trim()) return 'Title is required';
      if (value.trim().length < VALIDATION_RULES.TITLE.MIN_LENGTH) {
        return `Title must be at least ${VALIDATION_RULES.TITLE.MIN_LENGTH} characters`;
      }
      if (value.trim().length > VALIDATION_RULES.TITLE.MAX_LENGTH) {
        return `Title must be less than ${VALIDATION_RULES.TITLE.MAX_LENGTH} characters`;
      }
      return null;

    case 'address':
      if (!value.trim()) return 'Address is required';
      if (value.trim().length < VALIDATION_RULES.ADDRESS.MIN_LENGTH) {
        return `Address must be at least ${VALIDATION_RULES.ADDRESS.MIN_LENGTH} characters`;
      }
      if (value.trim().length > VALIDATION_RULES.ADDRESS.MAX_LENGTH) {
        return `Address must be less than ${VALIDATION_RULES.ADDRESS.MAX_LENGTH} characters`;
      }
      return null;

    case 'price':
      const price = parseFloat(value);
      if (isNaN(price) || price < VALIDATION_RULES.PRICE.MIN) {
        return 'Valid price is required';
      }
      if (price > VALIDATION_RULES.PRICE.MAX) {
        return `Price cannot exceed ${VALIDATION_RULES.PRICE.MAX.toLocaleString()}`;
      }
      return null;

    case 'beds':
      const beds = parseInt(value);
      if (isNaN(beds) || beds < VALIDATION_RULES.BEDS.MIN) {
        return 'Valid number of bedrooms is required';
      }
      if (beds > VALIDATION_RULES.BEDS.MAX) {
        return `Cannot have more than ${VALIDATION_RULES.BEDS.MAX} bedrooms`;
      }
      return null;

    case 'baths':
      const baths = parseFloat(value);
      if (isNaN(baths) || baths < VALIDATION_RULES.BATHS.MIN) {
        return 'Valid number of bathrooms is required';
      }
      if (baths > VALIDATION_RULES.BATHS.MAX) {
        return `Cannot have more than ${VALIDATION_RULES.BATHS.MAX} bathrooms`;
      }
      return null;

    case 'type':
      if (!value) return 'Property type is required';
      if (!PROPERTY_TYPES.includes(value as PropertyType)) {
        return 'Invalid property type selected';
      }
      return null;

    case 'description':
      if (value && value.length > VALIDATION_RULES.DESCRIPTION.MAX_LENGTH) {
        return `Description must be less than ${VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} characters`;
      }
      return null;

    default:
      return null;
  }
};

// Helper to format file size for error messages
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};