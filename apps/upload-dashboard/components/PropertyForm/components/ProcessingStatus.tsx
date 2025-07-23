// my-app\components\PropertyForm\components\ProcessingStatus.tsx
import React from 'react';

interface ProcessingStatusProps {
  processing: boolean;
  processingProgress: number;
  uploading: boolean;
  uploadProgress: number;
  processingStage?: string;
  uploadStage?: string;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  processing,
  processingProgress,
  uploading,
  uploadProgress,
  processingStage = "Processing",
  uploadStage = "Uploading"
}) => {
  // Don't render if neither processing nor uploading
  if (!processing && !uploading) {
    return null;
  }

  const currentStage = uploading ? uploadStage : processingStage;
  const currentProgress = uploading ? uploadProgress : processingProgress;
  const isActive = processing || uploading;

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700 flex items-center">
          {uploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              🔒 Secure R2 Upload
            </>
          ) : processing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              ⚡ Processing Images
            </>
          ) : null}
        </h4>
        <span className="text-sm font-medium text-gray-600">
          {currentProgress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            uploading ? 'bg-blue-600' : 'bg-orange-500'
          }`}
          style={{ width: `${currentProgress}%` }}
        />
      </div>

      {/* Status Text */}
      <p className="text-xs text-gray-600">
        {uploading ? (
          <>
            Uploading images to Cloudflare R2 with automatic optimization and multi-size generation...
          </>
        ) : processing ? (
          <>
            Preparing images for upload...
          </>
        ) : null}
      </p>

      {/* Additional Info for R2 Upload */}
      {uploading && (
        <div className="mt-2 text-xs text-blue-600">
          <p>✓ Server-side processing with secure credentials</p>
          <p>✓ WebP conversion and multiple sizes (thumb/medium/full)</p>
          <p>✓ EXIF data removal for privacy</p>
        </div>
      )}
    </div>
  );
};