// components/PropertyDetailsCard.tsx
'use client';
import React, { memo, useState } from 'react';
import { Property } from '@rental/types';

interface PropertyDetailsCardProps {
  property: Property;
}

const PropertyDetailsCard = memo(({ property }: PropertyDetailsCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const shouldTruncate = property.description && property.description.length > 200;
  const displayDescription = shouldTruncate && !isExpanded 
    ? (property.description ?? '').slice(0, 200) + '...'
    : property.description;

  const propertyStats = [
    {
      value: property.beds || 0,
      label: 'Bedroom',
      plural: 'Bedrooms',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      )
    },
    {
      value: property.baths || 0,
      label: 'Bathroom',
      plural: 'Bathrooms',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      )
    },
    {
      value: property.type,
      label: 'Property Type',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Property Details</h2>
          <div className="h-px bg-gradient-to-r from-gray-200 to-transparent flex-1 ml-6"></div>
        </div>

        {/* Property Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {propertyStats.map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 text-center group hover:bg-blue-50 transition-colors duration-200">
              <div className="flex justify-center mb-3">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {typeof stat.value === 'number' ? stat.value : stat.value}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {typeof stat.value === 'number' && stat.value > 1 ? stat.plural : stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Description Section */}
        {property.description && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed text-base">
                {displayDescription}
              </p>
            </div>
            
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
              >
                {isExpanded ? 'Show Less' : 'Read More'}
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Additional Features */}
        <div className="mt-8 pt-8 border-t border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Furnished', value: 'Yes', icon: '🛋️' },
              { label: 'Parking', value: 'Available', icon: '🚗' },
              { label: 'Pet Friendly', value: 'Yes', icon: '🐕' },
              { label: 'Garden', value: 'Private', icon: '🌿' }
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg">{feature.icon}</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{feature.label}</div>
                  <div className="text-xs text-gray-600">{feature.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

PropertyDetailsCard.displayName = 'PropertyDetailsCard';

export default PropertyDetailsCard;