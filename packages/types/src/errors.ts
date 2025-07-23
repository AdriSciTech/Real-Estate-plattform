// lib/types/errors.ts
// ========================================

// Custom error classes
export class ImageProcessingError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

export class ImageUploadError extends Error {
  constructor(
    message: string,
    public code: string,
    public fileName?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

export class PropertyValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value?: any
  ) {
    super(message);
    this.name = 'PropertyValidationError';
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Validation error interface (used by forms)
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Form validation result
export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
