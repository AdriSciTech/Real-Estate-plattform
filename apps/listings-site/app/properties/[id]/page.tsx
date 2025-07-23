"use client";

import { useState, useEffect, use, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import { Property, PropertyQueryResult, validateProperty } from "@rental/types";
import { createClient } from "@rental/supabase";
import PropertyImageGrid from "./components/PropertyImageGrid";

// Dynamic imports for better code splitting
const PropertyDetailsCard = dynamic(() => import("./components/PropertyDetailsCard"), {
  loading: () => <div className="animate-pulse bg-gray-100 h-64 rounded-lg" />
});

const PropertyAmenities = dynamic(() => import("./components/PropertyAmenities"), {
  loading: () => <div className="animate-pulse bg-gray-100 h-48 rounded-lg" />
});

const PropertyInfo = dynamic(() => import("./components/PropertyInfo"), {
  loading: () => <div className="animate-pulse bg-gray-100 h-48 rounded-lg" />
});

// Dynamic import for ContactSection
const ContactSection = dynamic(() => import("./components/ContactSection"), {
  loading: () => <div className="animate-pulse bg-gray-100 h-96 rounded-lg" />
});

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

// Memoized loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600 text-sm font-medium">Loading property...</p>
    </div>
  </div>
);

// Memoized error component
const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center max-w-md mx-auto px-6">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-3">Property Not Found</h2>
      <p className="text-gray-600 text-sm mb-8 leading-relaxed">
        {error || "The property you're looking for doesn't exist or has been removed."}
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={onRetry}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

export default function PropertyPage({ params }: PropertyPageProps) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id: propertyId } = use(params);

  // Memoized price formatter
  const formatPrice = useMemo(() => 
    (price: number) => new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price), []
  );

  // Memoized image paths getter
  const imagePaths = useMemo(() => {
    if (!property) return [];
    
    if (property.image_urls_full?.length) {
      return property.image_urls_full
        .map(img => img.full || img.medium || img.thumb || '')
        .filter(Boolean);
    }
    if (property.optimized_images?.length) {
      return property.optimized_images
        .map(img => img.full || img.medium || img.thumb || '')
        .filter(Boolean);
    }
    if (property.image_urls?.length) {
      return property.image_urls;
    }
    return [];
  }, [property]);

  const fetchProperty = async () => {
    if (!propertyId) return;

    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      if (!supabase) throw new Error("Failed to initialize database connection");

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

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  if (loading) return <LoadingSpinner />;
  if (error || !property) return <ErrorDisplay error={error || ""} onRetry={fetchProperty} />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Properties
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Property Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {property.title || "Untitled Property"}
          </h1>
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{property.address || "Address not available"}</span>
          </div>
        </div>

        {/* Optimized Image Grid */}
        <div className="mb-12">
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-xl" />}>
            <PropertyImageGrid 
              imagePaths={imagePaths}
              propertyTitle={property.title || "Property Images"}
              propertyId={propertyId}
              className="w-full"
              priority={true}
            />
          </Suspense>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-12">
          {/* Left Column - Property Details */}
          <div className="xl:col-span-2 space-y-8">
            <Suspense fallback={<div className="animate-pulse bg-gray-100 h-64 rounded-xl" />}>
              <PropertyDetailsCard property={property} />
            </Suspense>
            
            <Suspense fallback={<div className="animate-pulse bg-gray-100 h-48 rounded-xl" />}>
              <PropertyAmenities property={property} />
            </Suspense>
            
            <Suspense fallback={<div className="animate-pulse bg-gray-100 h-48 rounded-xl" />}>
              <PropertyInfo property={property} />
            </Suspense>
          </div>

          {/* Right Column - Contact & Booking */}
          <div className="xl:col-span-1">
            <Suspense fallback={<div className="animate-pulse bg-gray-100 h-96 rounded-xl" />}>
              <ContactSection 
                property={property} 
                formatPrice={formatPrice}
              />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}