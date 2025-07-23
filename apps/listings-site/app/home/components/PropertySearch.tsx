//apps\listings-site\listings-plattform\app\home\components\PropertySearch.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PropertySearchProps {
  className?: string;
}

export default function PropertySearch({ className = "" }: PropertySearchProps) {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({
    saleOrRent: "",
    location: "",
    beds: "",
    baths: "",
    priceRange: "",
    city: "",
    propertyId: "",
    propertyType: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        queryParams.append(key, value);
      }
    });

    // Navigate to properties page with search parameters
    router.push(`/properties?${queryParams.toString()}`);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <form onSubmit={handleSearch} className="space-y-4">
        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sale or Rent */}
          <div>
            <label htmlFor="saleOrRent" className="block text-sm font-medium text-gray-700 mb-2">
              Sale or Rent
            </label>
            <select
              id="saleOrRent"
              value={searchParams.saleOrRent}
              onChange={(e) => handleInputChange('saleOrRent', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            >
              <option value="">Select Category</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>

          {/* Property Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Property Location
            </label>
            <input
              type="text"
              id="location"
              value={searchParams.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Property Location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              id="city"
              value={searchParams.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="City"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Bedrooms */}
          <div>
            <label htmlFor="beds" className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms
            </label>
            <select
              id="beds"
              value={searchParams.beds}
              onChange={(e) => handleInputChange('beds', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            >
              <option value="">Any</option>
              <option value="1">1+ Bed</option>
              <option value="2">2+ Beds</option>
              <option value="3">3+ Beds</option>
              <option value="4">4+ Beds</option>
              <option value="5">5+ Beds</option>
            </select>
          </div>

          {/* Bathrooms */}
          <div>
            <label htmlFor="baths" className="block text-sm font-medium text-gray-700 mb-2">
              Bathrooms
            </label>
            <select
              id="baths"
              value={searchParams.baths}
              onChange={(e) => handleInputChange('baths', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            >
              <option value="">Any</option>
              <option value="1">1+ Bath</option>
              <option value="2">2+ Baths</option>
              <option value="3">3+ Baths</option>
              <option value="4">4+ Baths</option>
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <select
              id="propertyType"
              value={searchParams.propertyType}
              onChange={(e) => handleInputChange('propertyType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            >
              <option value="">Any Type</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Condo">Condo</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Villa">Villa</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <select
              id="priceRange"
              value={searchParams.priceRange}
              onChange={(e) => handleInputChange('priceRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            >
              <option value="">Any Price</option>
              <option value="0-1000">Under €1,000/month</option>
              <option value="1000-2000">€1,000 - €2,000/month</option>
              <option value="2000-3000">€2,000 - €3,000/month</option>
              <option value="3000-4000">€3,000 - €4,000/month</option>
              <option value="4000-5000">€4,000 - €5,000/month</option>
              <option value="5000-9999999">€5,000+/month</option>
            </select>
          </div>

          {/* Property ID */}
          <div>
            <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700 mb-2">
              Property ID
            </label>
            <input
              type="text"
              id="propertyId"
              value={searchParams.propertyId}
              onChange={(e) => handleInputChange('propertyId', e.target.value)}
              placeholder="Property ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
            <span>Search Properties</span>
          </button>
        </div>
      </form>
    </div>
  );
}