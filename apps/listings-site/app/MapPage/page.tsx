// app/MapPage/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertyMap from '@/apps/listings-site/app/MapPage/Map';
import { Property } from '@rental/types';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Separate component that uses useSearchParams
function MapPageContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [enableClustering, setEnableClustering] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  
  // Filter states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [bedrooms, setBedrooms] = useState({ min: 0, max: 10 });
  const [bathrooms, setBathrooms] = useState({ min: 0, max: 10 });
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Get property ID from search params if available
    const propertyId = searchParams.get('property');
    if (propertyId && properties.length > 0) {
      const property = properties.find(p => p.id === propertyId);
      if (property) {
        setSelectedProperty(property);
      }
    }
  }, [searchParams, properties]);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, priceRange, selectedPropertyTypes, bedrooms, bathrooms]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .not('lat', 'is', null)
        .not('lng', 'is', null);

      if (error) throw error;
      
      setProperties(data || []);
      setFilteredProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...properties];

    // Price filter
    filtered = filtered.filter(p => {
      const price = p.price || 0;
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Property type filter
    if (selectedPropertyTypes.length > 0) {
      filtered = filtered.filter(p => 
        p.type && selectedPropertyTypes.includes(p.type.toLowerCase())
      );
    }

    // Bedrooms filter
    filtered = filtered.filter(p => {
      const beds = p.beds || 0;
      return beds >= bedrooms.min && beds <= bedrooms.max;
    });

    // Bathrooms filter
    filtered = filtered.filter(p => {
      const baths = p.baths || 0;
      return baths >= bathrooms.min && baths <= bathrooms.max;
    });

    setFilteredProperties(filtered);
  };

  const resetFilters = () => {
    setPriceRange({ min: 0, max: 10000000 });
    setSelectedPropertyTypes([]);
    setBedrooms({ min: 0, max: 10 });
    setBathrooms({ min: 0, max: 10 });
  };

  const handlePropertyTypeToggle = (type: string) => {
    setSelectedPropertyTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    // Update URL with selected property
    const url = new URL(window.location.href);
    url.searchParams.set('property', property.id);
    window.history.pushState({}, '', url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Property Map</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span className="text-sm font-medium">{showFilters ? 'Hide' : 'Show'} Filters</span>
              </button>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={enableClustering}
                  onChange={(e) => setEnableClustering(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Enable Clustering</span>
              </label>
              <a
                href="/properties"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Back to List
              </a>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex relative">
        {/* Filter Sidebar */}
        {showFilters && (
          <aside className="w-80 bg-white border-r overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Reset all
                </button>
              </div>

              {/* Results count */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredProperties.length}</span> of {properties.length} properties
                </p>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Price Range</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Min Price</label>
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Max Price</label>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                      placeholder="10000000"
                    />
                  </div>
                </div>
              </div>

              {/* Property Type */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Property Type</h3>
                <div className="space-y-2">
                  {['house', 'apartment', 'condo', 'townhouse', 'villa'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPropertyTypes.includes(type)}
                        onChange={() => handlePropertyTypeToggle(type)}
                        className="mr-2 rounded text-blue-600"
                      />
                      <span className="text-sm capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bedrooms */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Bedrooms</h3>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={bedrooms.min}
                    onChange={(e) => setBedrooms({ ...bedrooms, min: Number(e.target.value) })}
                    className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                    placeholder="Min"
                    min="0"
                  />
                  <input
                    type="number"
                    value={bedrooms.max}
                    onChange={(e) => setBedrooms({ ...bedrooms, max: Number(e.target.value) })}
                    className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                    placeholder="Max"
                    min="0"
                  />
                </div>
              </div>

              {/* Bathrooms */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Bathrooms</h3>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={bathrooms.min}
                    onChange={(e) => setBathrooms({ ...bathrooms, min: Number(e.target.value) })}
                    className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                    placeholder="Min"
                    min="0"
                  />
                  <input
                    type="number"
                    value={bathrooms.max}
                    onChange={(e) => setBathrooms({ ...bathrooms, max: Number(e.target.value) })}
                    className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                    placeholder="Max"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Map Container */}
        <div className="flex-1 relative">
          <PropertyMap
            properties={filteredProperties}
            selectedProperty={selectedProperty}
            onPropertySelect={handlePropertySelect}
            enableClustering={enableClustering}
          />
          
          {/* Selected Property Info Panel */}
          {selectedProperty && (
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
              <h3 className="font-semibold text-lg mb-2">{selectedProperty.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{selectedProperty.address}</p>
              <p className="text-blue-600 font-bold">
                ${selectedProperty.price?.toLocaleString() || 'Price on Request'}
              </p>
              <div className="mt-2 text-sm text-gray-500">
                {selectedProperty.beds} beds • {selectedProperty.baths} baths
              </div>
              <button
                onClick={() => window.open(`/properties/${selectedProperty.id}`, '_blank')}
                className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm"
              >
                View Details
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Main component with Suspense wrapper
export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <MapPageContent />
    </Suspense>
  );
}
