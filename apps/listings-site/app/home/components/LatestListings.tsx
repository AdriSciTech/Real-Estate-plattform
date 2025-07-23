//app/home/components/LatestListings.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Property,
  PropertyQueryResult,
  validateProperty,
  PropertyType,
  PropertyValidationResult,
} from '@rental/types';
import { createClient } from '@rental/supabase';
import Link from "next/link";
import PropertyCard from "@/apps/listings-site/components/PropertyCard1/PropertyCard";

interface LatestListingsProps {
  limit?: number;
  showFeatured?: boolean;
  propertyTypes?: PropertyType[];
  className?: string;
}

function LatestListings({
  limit = 6,
  showFeatured = false,
  propertyTypes,
  className = "",
}: LatestListingsProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();
        if (!supabase) throw new Error("Failed to initialize Supabase client");

        // Build query with optional filters
        let query = supabase
          .from("properties")
          .select("*")
          .order("created_at", { ascending: false });

        // Apply filters if provided
        if (showFeatured) {
          query = query.eq("featured", true);
        }

        if (propertyTypes && propertyTypes.length > 0) {
          query = query.in("type", propertyTypes);
        }

        query = query.limit(limit);

        const { data, error } = await query;

        if (error) {
          console.error('Supabase query failed in LatestListings, trying API fallback:', error);
          
          // Try API fallback
          try {
            const response = await fetch(`/api/properties?limit=${limit}`);
            if (response.ok) {
              const apiData = await response.json();
              if (apiData.success && apiData.properties) {
                const validProperties: Property[] = [];
                for (const propertyData of apiData.properties) {
                  const validationResult: PropertyValidationResult = validateProperty(propertyData);
                  if (validationResult.isValid && validationResult.property) {
                    validProperties.push(validationResult.property);
                  }
                }
                setProperties(validProperties);
                return;
              }
            }
          } catch (apiError) {
            console.error('API fallback also failed:', apiError);
          }
          
          throw new Error(error.message);
        }
        
        if (!data) throw new Error("No properties found");

        // Validate each property using the type-safe validation function
        const validProperties: Property[] = [];
        for (const propertyData of data) {
          const validationResult: PropertyValidationResult = validateProperty(
            propertyData as PropertyQueryResult
          );
          if (validationResult.isValid && validationResult.property) {
            validProperties.push(validationResult.property);
          } else {
            console.warn(
              `Invalid property data for ID ${propertyData.id}:`,
              validationResult.errors
            );
          }
        }

        setProperties(validProperties);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load properties";
        setError(errorMessage);
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProperties();
  }, [limit, showFeatured, propertyTypes]);

  if (loading) {
    return (
      <section className={`py-12 sm:py-16 lg:py-20 bg-gray-50 ${className}`}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 sm:mb-12">
            Latest Properties
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {Array.from({ length: limit }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
              >
                <div className="w-full h-52 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`py-12 sm:py-16 lg:py-20 bg-gray-50 ${className}`}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 sm:mb-12">
            Latest Properties
          </h2>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Unable to Load Properties
            </h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return (
      <section className={`py-12 sm:py-16 lg:py-20 bg-gray-50 ${className}`}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 sm:mb-12">
            Latest Properties
          </h2>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Properties Available
            </h3>
            <p className="text-gray-600">Check back later for new listings.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-12 sm:py-16 lg:py-20 bg-gray-50 ${className}`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Latest Properties
          </h2>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {properties.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              priority={index < 3}
              index={index}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8 sm:mt-12">
          <Link
            href="/properties"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            View All Properties
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LatestListings;