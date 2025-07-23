// my-app\components\PropertyForm\hooks\usePropertyForm.ts
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Property, PropertyFormData, GeocodeResult, ImageUrls, convertPropertyToFormData, convertFormDataToProperty } from '@/lib/types';
import { DEFAULT_COORDINATES } from '../constants';
import { createClient } from '@/lib/supabase';

interface UsePropertyFormProps {
  property?: Property;
  isEditing?: boolean;
}

export const usePropertyForm = ({ property, isEditing = false }: UsePropertyFormProps) => {
  const router = useRouter();
  
  // ✅ UPDATED: Use the helper function to convert property to form data
  const [formData, setFormData] = useState<PropertyFormData>(() => {
    if (property) {
      return convertPropertyToFormData(property);
    }
    
    // Default empty form data
    return {
      // Basic information
      title: '',
      address: '',
      price: '',
      beds: '',
      baths: '',
      type: 'Apartment',
      description: '',
      
      // Extended information
      city: '',
      parking_included: '',
      parking_spaces: '',
      furnished: '',
      floor_number: '',
      has_elevator: '',
      available_from: '',
      renewable_contract: '',
      preferred_tenant_type: '',
      utilities_included: '',
      prepayment_option: '',
      prepayment_price: '',
      features_amenities: '',
      smoking_allowed: '',
      pets_allowed: '',
      max_occupancy: '',
      instant_booking: '',
      property_visits_available: '',
    };
  });

  const [originalImages, setOriginalImages] = useState<File[]>([]);
  
  // ✅ FIXED: Properly handle existing R2 images
  const [existingImageUrls, setExistingImageUrls] = useState<ImageUrls[]>(() => {
    if (property?.image_urls_full && property.image_urls_full.length > 0) {
      // Use R2 structure if available
      console.log('✅ Loading existing R2 images:', property.image_urls_full);
      return property.image_urls_full;
    } else if (property?.image_urls && property.image_urls.length > 0) {
      // Convert legacy URLs to R2 structure (without adding prefixes)
      console.log('🔄 Converting legacy images:', property.image_urls);
      return property.image_urls.map(url => ({
        thumb: url,
        medium: url,
        full: url
      }));
    }
    return [];
  });

  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const addOriginalImages = useCallback((files: File[]) => {
    console.log('📁 Adding files to upload queue:', files.map(f => f.name));
    setOriginalImages(prev => [...prev, ...files]);
  }, []);

  const removeImage = useCallback((index: number, isExisting = false) => {
    if (isExisting) {
      console.log('🗑️ Removing existing image at index:', index);
      setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      console.log('🗑️ Removing selected file at index:', index);
      setOriginalImages(prev => prev.filter((_, i) => i !== index));
    }
  }, []);

  const geocodeAddress = useCallback(async (address: string): Promise<GeocodeResult | null> => {
    try {
      setGeocoding(true);
      console.log('🌍 Geocoding address:', address);
      
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) throw new Error('Geocoding failed');
      
      const result = await response.json();
      console.log('✅ Geocoding result:', result);
      return result;
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      return null;
    } finally {
      setGeocoding(false);
    }
  }, []);

  const saveProperty = useCallback(async (newImageUrls: ImageUrls[] = []) => {
    try {
      console.log('💾 Starting property save process...');
      
      // Geocode address
      const geocodeResult = await geocodeAddress(formData.address);
      const coordinates = geocodeResult || DEFAULT_COORDINATES;

      // ✅ UPDATED: Convert form data to property object with all extended fields
      const propertyObject = convertFormDataToProperty(formData);
      
      const propertyData = {
        ...propertyObject,
        lat: coordinates.lat,
        lng: coordinates.lng,
        updated_at: new Date().toISOString(),
      };

      const supabase = createClient();
      if (!supabase) {
        throw new Error('Unable to connect to database');
      }

      let propertyId: string;

      if (isEditing && property) {
        console.log('✏️ Updating existing property:', property.id);
        
        // Update existing property
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', property.id);

        if (error) throw new Error(`Database update failed: ${error.message}`);
        propertyId = property.id;
      } else {
        console.log('➕ Creating new property');
        
        // Create new property
        const { data, error } = await supabase
          .from('properties')
          .insert([propertyData])
          .select()
          .single();

        if (error) throw new Error(`Database insert failed: ${error.message}`);
        if (!data) throw new Error('No data returned from database');
        propertyId = data.id;
      }

      // ✅ FIXED: Properly combine and save image URLs
      const allImageUrls = [...existingImageUrls, ...newImageUrls];
      
      if (allImageUrls.length > 0) {
        console.log('🖼️ Saving image URLs:', allImageUrls);
        
        // For backward compatibility, store medium URLs in the legacy field
        const mediumUrls = allImageUrls.map(urls => urls.medium || urls.thumb || urls.full);
        
        const { error: updateError } = await supabase
          .from('properties')
          .update({ 
            image_urls: mediumUrls,           // Legacy field
            image_urls_full: allImageUrls     // R2 structure
          })
          .eq('id', propertyId);

        if (updateError) {
          console.error('❌ Failed to update image URLs:', updateError);
          throw new Error('Property saved but failed to update image URLs');
        }
        
        console.log('✅ Image URLs saved successfully');
      }

      console.log('✅ Property save completed:', propertyId);
      return propertyId;
      
    } catch (error) {
      console.error('❌ Property save failed:', error);
      throw error;
    }
  }, [formData, existingImageUrls, geocodeAddress, isEditing, property]);

  const previewProperty = useCallback((): Property => {
    // Create preview using medium size images
    const previewImageUrls = existingImageUrls.map(urls => urls.medium || urls.thumb || urls.full);
    
    // Convert form data to property object
    const propertyObject = convertFormDataToProperty(formData);

    return {
      id: property?.id || 'preview',
      ...propertyObject,
      image_urls: previewImageUrls,
      image_urls_full: existingImageUrls,
      created_at: property?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Property;
  }, [formData, existingImageUrls, property]);

  const resetForm = useCallback(() => {
    console.log('🔄 Resetting form state');
    setOriginalImages([]);
    setShowPreview(false);
  }, []);

  const navigateToAdmin = useCallback(() => {
    resetForm();
    router.push('/admin');
  }, [resetForm, router]);

  return {
    // Form state
    formData,
    originalImages,
    existingImageUrls,
    loading,
    geocoding,
    showPreview,
    
    // Form actions
    handleInputChange,
    addOriginalImages,
    removeImage,
    saveProperty,
    previewProperty,
    resetForm,
    navigateToAdmin,
    
    // UI state
    setLoading,
    setShowPreview,
  };
};