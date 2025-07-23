// my-app\components\PropertyForm\PropertyForm.tsx
'use client';

import React from 'react';
import { Property, ImageUrls } from '@/lib/types';
import PropertyCard from './../PropertyCard';

// Hooks
import { usePropertyForm } from './hooks/usePropertyForm';
import { useImageUpload } from './hooks/useImageUpload';

// R2 client functions
import { validateFiles } from '@/lib/uploadClient';

// Components
import { BasicInfoSection } from './components/BasicInfoSection'; // Updated component with extended fields
import { ImageUploadSection } from './components/ImageUploadSection';
import { FormActions } from './components/FormActions';

interface PropertyFormProps {
  property?: Property;
  isEditing?: boolean;
}

export default function PropertyForm({ property, isEditing = false }: PropertyFormProps) {
  // Form state management (now with extended fields)
  const {
    formData,
    originalImages, // Files selected for upload
    existingImageUrls, // Images already saved
    loading,
    geocoding,
    showPreview,
    handleInputChange,
    addOriginalImages,
    removeImage,
    saveProperty,
    previewProperty,
    navigateToAdmin,
    setLoading,
    setShowPreview,
  } = usePropertyForm({ property, isEditing });

  // R2 upload management
  const {
    uploading,
    uploadProgress,
    uploadImages
  } = useImageUpload();

  // Session state for newly uploaded images
  const [uploadedImages, setUploadedImages] = React.useState<ImageUrls[]>([]);

  // Handle image selection
  const handleImageUpload = async (files: File[]) => {
    try {
      console.log('📁 Selected files for upload:', files.map(f => f.name));
      
      // Validate files using R2 validation
      const validation = validateFiles(files);
      if (!validation.valid) {
        alert(`File validation failed:\n${validation.errors.join('\n')}`);
        return;
      }

      // Add files to form state (they'll be uploaded when form is submitted)
      addOriginalImages(files);
      
      console.log('✅ Files added to upload queue');
      
    } catch (error) {
      console.error('❌ Error handling file selection:', error);
      alert(`Error preparing images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle image removal
  const handleRemoveImage = (index: number, type: 'existing' | 'selected' | 'uploaded') => {
    switch (type) {
      case 'existing':
        removeImage(index, true); // Remove from existing images
        break;
      case 'selected':
        removeImage(index, false); // Remove from selected files
        break;
      case 'uploaded':
        // Remove from session uploaded images
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
        break;
    }
  };

  // Handle form submission with R2 upload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🚀 Property save started (R2 system with extended fields)');

      // Combine existing and newly uploaded images
      let allImageUrls: ImageUrls[] = [...existingImageUrls, ...uploadedImages];
      
      // Upload new images if any are selected
      if (originalImages.length > 0) {
        console.log('📡 Starting R2 image upload...');
        
        try {
          // Generate or use existing property ID
          const propertyId = property?.id || `property_${Date.now()}`;
          
          // Upload images to R2
          const newImageUrls = await uploadImages(originalImages, propertyId);
          
          // Add to uploaded images and combine with existing
          setUploadedImages(newImageUrls);
          allImageUrls = [...existingImageUrls, ...uploadedImages, ...newImageUrls];

          console.log('✅ R2 upload completed:', newImageUrls);
          
        } catch (imageError) {
          console.error('❌ R2 image upload failed:', imageError);
          alert(`Image upload failed: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`);
          return;
        }
      }

      // Save property with all image URLs and extended fields
      const savedPropertyId = await saveProperty(allImageUrls);
      console.log('✅ Property saved successfully:', savedPropertyId);
      
      // Navigate back to admin
      navigateToAdmin();

    } catch (error) {
      console.error('❌ Error saving property:', error);
      alert(`Failed to save property: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Edit Property' : 'Add New Property'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditing 
            ? 'Update your property information and images' 
            : 'Fill in the details for your new property listing'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ✅ UPDATED: Extended Property Information Section */}
        <BasicInfoSection 
          formData={formData}
          onChange={handleInputChange}
        />

        {/* Image Upload Section */}
        <ImageUploadSection
          existingImages={existingImageUrls}
          selectedFiles={originalImages}
          uploadedImages={uploadedImages}
          processing={false}
          processingProgress={0}
          uploading={uploading}
          uploadProgress={uploadProgress}
          onImageUpload={handleImageUpload}
          onRemoveImage={handleRemoveImage}
        />

        {/* Form Actions */}
        <FormActions
          loading={loading}
          geocoding={geocoding}
          processing={uploading}
          showPreview={showPreview}
          isEditing={isEditing}
          onTogglePreview={() => setShowPreview(!showPreview)}
          onCancel={navigateToAdmin}
        />
      </form>

      {/* Live Preview */}
      {showPreview && (
        <div className="mt-8 bg-white shadow-lg rounded-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">👁️</span>
            Live Preview
          </h3>
          <PropertyCard property={previewProperty()} isPreview />
        </div>
      )}

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs font-mono">
          <h4 className="font-bold mb-2 text-gray-800">🔍 Debug Info:</h4>
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <div>
              <p><strong>System:</strong> ⚡ Cloudflare R2 + Extended Fields</p>
              <p><strong>Existing Images:</strong> {existingImageUrls.length}</p>
              <p><strong>Selected Files:</strong> {originalImages.length}</p>
              <p><strong>Uploaded This Session:</strong> {uploadedImages.length}</p>
            </div>
            <div>
              <p><strong>Uploading:</strong> {uploading ? '🔄 Yes' : '✅ No'}</p>
              <p><strong>Progress:</strong> {uploadProgress}%</p>
              <p><strong>Form Loading:</strong> {loading ? '🔄 Yes' : '✅ No'}</p>
              <p><strong>Mode:</strong> {isEditing ? '✏️ Edit' : '➕ Create'}</p>
            </div>
          </div>
          
          {/* Extended Fields Debug */}
          <div className="mt-4 pt-4 border-t border-gray-300">
            <h5 className="font-bold mb-2">Extended Fields Sample:</h5>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p><strong>City:</strong> {formData.city || 'Not set'}</p>
                <p><strong>Furnished:</strong> {formData.furnished || 'Not set'}</p>
                <p><strong>Parking:</strong> {formData.parking_included || 'Not set'}</p>
              </div>
              <div>
                <p><strong>Floor:</strong> {formData.floor_number || 'Not set'}</p>
                <p><strong>Elevator:</strong> {formData.has_elevator || 'Not set'}</p>
                <p><strong>Pets:</strong> {formData.pets_allowed || 'Not set'}</p>
              </div>
              <div>
                <p><strong>Available:</strong> {formData.available_from || 'Not set'}</p>
                <p><strong>Booking:</strong> {formData.instant_booking || 'Not set'}</p>
                <p><strong>Visits:</strong> {formData.property_visits_available || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}