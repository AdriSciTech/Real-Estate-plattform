//listings-plattform\app\properties\[id]\gallery\page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { Property, PropertyQueryResult, validateProperty } from "@rental/types";
import { createClient } from "@rental/supabase";
import { PropertyGallery } from "../components/PropertyGallery";
import { useRouter } from "next/navigation";

interface GalleryPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ index?: string }>;
}

// Convert Property to the PropertyGallery expected format
interface ImageUrls {
  thumb?: string;
  medium?: string;
  full?: string;
}

const getImagesFromProperty = (property: Property): ImageUrls[] => {
  // First try image_urls_full (optimized images)
  if (property.image_urls_full?.length) {
    return property.image_urls_full;
  }
  
  // Then try optimized_images
  if (property.optimized_images?.length) {
    return property.optimized_images;
  }
  
  // Finally fallback to simple image_urls
  if (property.image_urls?.length) {
    return property.image_urls.map(url => ({
      full: url,
      medium: url,
      thumb: url
    }));
  }
  
  return [];
};

export default function GalleryPage({ params, searchParams }: GalleryPageProps) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { id: propertyId } = use(params);
  const { index } = use(searchParams);
  const initialIndex = index ? parseInt(index, 10) : 0;

  useEffect(() => {
    const fetchProperty = async () => {
      // Wait for propertyId to be available
      if (!propertyId || propertyId === 'undefined') {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();
        if (!supabase) throw new Error("Failed to initialize Supabase client");

        // Validate that propertyId is a valid UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(propertyId)) {
          throw new Error("Invalid property ID format");
        }

        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", propertyId)
          .single();

        if (error) throw new Error(error.message);
        if (!data) throw new Error("Property not found");

        const validationResult = validateProperty(data as PropertyQueryResult);
        if (!validationResult.isValid) {
          throw new Error(`Invalid property data: ${validationResult.errors.join(", ")}`);
        }

        setProperty(validationResult.property!);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load property");
        console.error("Error fetching property:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  const handleClose = () => {
    router.push(`/properties/${propertyId}`);
  };

  // Show loading initially while params are being resolved
  if (!propertyId || propertyId === 'undefined') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🖼️</div>
          <h2 className="text-2xl font-bold mb-2">Gallery Not Found</h2>
          <p className="text-gray-300 mb-4">
            {error || "The property gallery could not be loaded."}
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Property
          </button>
        </div>
      </div>
    );
  }

  const images = getImagesFromProperty(property);

  if (images.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold mb-2">No Images Available</h2>
          <p className="text-gray-300 mb-4">
            This property doesn't have any images to display.
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Property
          </button>
        </div>
      </div>
    );
  }

  return (
    <PropertyGallery
      images={images}
      isOpen={true}
      onClose={handleClose}
      initialIndex={Math.max(0, Math.min(initialIndex, images.length - 1))}
      property={{
        id: property.id,
        title: property.title || "Untitled Property",
        type: property.type || "Property",
        image_urls_full: property.image_urls_full,
        optimized_images: property.optimized_images,
        image_urls: property.image_urls
      }}
    />
  );
}